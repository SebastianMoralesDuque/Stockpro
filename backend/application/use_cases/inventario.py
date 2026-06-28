from io import BytesIO
from infrastructure.services.ai_service import AIService
from infrastructure.services.pdf_service import PDFService
from infrastructure.services.blockchain_service import BlockchainService
from infrastructure.services.email_service import EmailService
from shared_domain.models import Producto


AI_FALLBACK_MESSAGE = (
    "Análisis inteligente no disponible temporalmente. "
    "El servicio de IA está configurado con una API key inválida. "
    "El reporte contiene los datos brutos del inventario."
)


def _get_ai_analysis(productos_query):
    """Try AI analysis; on failure return a fallback so downstream flows are not blocked."""
    try:
        return AIService.generate_inventory_analysis(productos_query)
    except Exception as e:
        print(f"[WARNING] AI analysis failed, using fallback: {e}")
        return AI_FALLBACK_MESSAGE


class ProcesarInventarioUseCase:
    @staticmethod
    def ejecutar(email=None, tx_hash=None, send_email=False):
        # 1. Obtener datos del inventario
        productos_query = Producto.objects.all()

        # 2. IA Service — graceful: if AI fails, still generate the report
        ai_analysis = _get_ai_analysis(productos_query)

        # 3. PDF Service
        buffer = BytesIO()
        PDFService.generate_pdf(buffer, ai_analysis, tx_hash=tx_hash)
        pdf_content = buffer.getvalue()
        buffer.seek(0)

        # 4. Email (Opcional)
        if send_email and email:
            EmailService.send_report_email(email, pdf_content, ai_analysis[:200])

        return {
            "ai_analysis": ai_analysis,
            "pdf_buffer": buffer,
            "pdf_content": pdf_content,
        }


class CertificarInventarioUseCase:
    @staticmethod
    def ejecutar():
        print("Executing CertificarInventarioUseCase...")
        productos_query = Producto.objects.all()
        print(f"Found {productos_query.count()} products.")

        # AI analysis is used to create a richer hash — but it must NOT block certification
        ai_analysis = _get_ai_analysis(productos_query)
        print("AI Analysis resolved (may be fallback).")

        content_to_hash = f"{ai_analysis}{productos_query.count()}{[p.codigo for p in productos_query]}"

        print("Calling BlockchainService.certify_data...")
        cert_result = BlockchainService.certify_data(content_to_hash)
        print("BlockchainService call completed.")

        return {
            "ai_analysis": ai_analysis,
            "txHash": cert_result["txHash"],
            "pdf_hash": cert_result["pdf_hash"],
            "status": cert_result["status"],
        }
