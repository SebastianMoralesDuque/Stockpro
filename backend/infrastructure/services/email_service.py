import base64
import requests
from django.conf import settings
from shared_domain.exceptions import InfrastructureError


class EmailService:
    @staticmethod
    def send_report_email(email, pdf_content, ai_analysis_preview):
        api_key = getattr(settings, 'RESEND_API_KEY', None)

        if not api_key or 're_' not in api_key:
            raise InfrastructureError(
                "RESEND_API_KEY inválida. Verifica la variable de entorno RESEND_API_KEY."
            )

        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
            attachment_b64 = base64.b64encode(pdf_content).decode('utf-8')

            # Use configured sender or fallback to Resend test domain
            from_address = getattr(
                settings, 'RESEND_FROM_ADDRESS', 'StockPro <onboarding@resend.dev>'
            )

            payload = {
                "from": from_address,
                "to": [email],
                "subject": "Reporte Inteligente de Inventario - StockPro",
                "html": (
                    f"<strong>Hola!</strong><br/><br/>"
                    f"Adjuntamos el reporte ejecutivo generado por nuestra IA.<br/><br/>"
                    f"<i>Resumen:</i><br/>{ai_analysis_preview}..."
                ),
                "attachments": [
                    {"content": attachment_b64, "filename": "inventario_smart.pdf"}
                ],
            }

            response = requests.post(url, headers=headers, json=payload, timeout=30)

            if response.status_code not in [200, 201]:
                body = response.json() if response.content else {}
                msg = body.get('message', str(body))
                # Provide actionable guidance for common Resend errors
                if 'testing emails' in msg.lower() or 'verify a domain' in msg.lower():
                    raise InfrastructureError(
                        f"Resend solo permite enviar correos de prueba a la dirección "
                        f"registrada. Para enviar a otros destinatarios, verifica un "
                        f"dominio en https://resend.com/domains y configura "
                        f"RESEND_FROM_ADDRESS. Detalle: {msg}"
                    )
                raise InfrastructureError(f"Error Resend (HTTP {response.status_code}): {msg}")

            return response.json()
        except InfrastructureError:
            raise
        except Exception as e:
            raise InfrastructureError(f"Error al enviar email: {str(e)}")
