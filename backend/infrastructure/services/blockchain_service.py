import hashlib
from django.conf import settings
from solana.rpc.api import Client
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.instruction import Instruction
from solders.message import Message
from solders.transaction import Transaction
from shared_domain.exceptions import InfrastructureError

class BlockchainService:
    @staticmethod
    def certify_data(data_string):
        data_hash = hashlib.sha256(data_string.encode()).hexdigest()
        
        if not settings.SOLANA_PRIVATE_KEY:
            return {
                "txHash": f"pending_{data_hash[:10]}",
                "pdf_hash": data_hash,
                "status": "DUMMY_SUCCESS",
                "message": "Modo demo: certificación simulada"
            }

        try:
            client = Client(settings.SOLANA_RPC_URL)
            # Try to load as hex (seed)
            try:
                private_key_bytes = bytes.fromhex(settings.SOLANA_PRIVATE_KEY)
                if len(private_key_bytes) == 64:
                    keypair = Keypair.from_bytes(private_key_bytes)
                else:
                    keypair = Keypair.from_seed(private_key_bytes[:32])
            except ValueError:
                raise InfrastructureError("La llave privada de Solana no tiene un formato hexadecimal válido.")
            
            # Check wallet balance before attempting transaction
            try:
                balance_resp = client.get_balance(keypair.pubkey())
                balance = balance_resp.value
                print(f"Wallet balance: {balance / 10**9} SOL")
                
                if balance == 0:
                    # Try to request airdrop for Devnet
                    try:
                        print("Requesting Devnet SOL airdrop...")
                        airdrop_resp = client.request_airdrop(keypair.pubkey(), 1_000_000_000)
                        if airdrop_resp.value:
                            import time
                            time.sleep(10)
                            balance_resp = client.get_balance(keypair.pubkey())
                            balance = balance_resp.value
                            print(f"Balance after airdrop: {balance / 10**9} SOL")
                    except Exception as airdrop_err:
                        print(f"Airdrop failed: {airdrop_err}")
                
                if balance == 0:
                    return {
                        "txHash": f"pending_{data_hash[:10]}",
                        "pdf_hash": data_hash,
                        "status": "PENDING_FUNDS",
                        "message": "Wallet sin fondos SOL. Certificación registrada localmente, pendiente de confirmación on-chain.",
                        "wallet": str(keypair.pubkey()),
                        "faucet_url": "https://faucet.solana.com"
                    }
            except Exception as balance_err:
                print(f"Balance check failed: {balance_err}")
            
            # Standard Solana Memo Program
            memo_program_id = Pubkey.from_string("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr")
            memo_instruction = Instruction(memo_program_id, data_hash.encode('utf-8'), [])
            
            print(f"Certifying hash: {data_hash} with pubkey: {keypair.pubkey()}")
            
            # Fetch blockhash
            try:
                blockhash_resp = client.get_latest_blockhash()
                blockhash = blockhash_resp.value.blockhash
            except Exception as e:
                raise InfrastructureError(f"No se pudo obtener el blockhash de Solana: {str(e)}")
            
            message = Message.new_with_blockhash([memo_instruction], keypair.pubkey(), blockhash)
            txn = Transaction([keypair], message, blockhash)
            
            try:
                response = client.send_transaction(txn)
                tx_hash = str(response.value)
            except Exception as e:
                error_msg = str(e)
                if "no record of a prior credit" in error_msg or "insufficient" in error_msg.lower():
                    return {
                        "txHash": f"pending_{data_hash[:10]}",
                        "pdf_hash": data_hash,
                        "status": "PENDING_FUNDS",
                        "message": "Fondos insuficientes. Certificación registrada localmente.",
                        "wallet": str(keypair.pubkey()),
                        "faucet_url": "https://faucet.solana.com"
                    }
                raise InfrastructureError(f"Error al enviar la transacción a Solana: {error_msg}")
            
            return {
                "status": "SUCCESS",
                "txHash": tx_hash,
                "pdf_hash": data_hash,
                "message": "Certificación confirmada en Solana Devnet"
            }
        except Exception as e:
            import traceback
            print(f"Solana Error Traceback:")
            traceback.print_exc()
            if isinstance(e, InfrastructureError):
                raise e
            raise InfrastructureError(f"Fallo en la comunicación con Solana: {str(e)}")
