from django.conf import settings
from shared_domain.exceptions import InfrastructureError

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


class AIService:
    @staticmethod
    def generate_inventory_analysis(productos):
        print("AIService: Starting analysis...")

        if OpenAI is None:
            print("AIService: Warning: openai package not installed.")
            raise InfrastructureError(
                "Servicio de IA no configurado (paquete 'openai' faltante)."
            )

        base_url = getattr(settings, "OLLAMA_BASE_URL", None)
        if not base_url:
            print("AIService: Warning: OLLAMA_BASE_URL is missing.")
            raise InfrastructureError(
                "Servicio de IA no configurado (OLLAMA_BASE_URL faltante)."
            )

        model = getattr(settings, "OLLAMA_MODEL", "minimax-m3:cloud")
        api_key = getattr(settings, "OLLAMA_API_KEY", "not-needed") or "not-needed"

        # OpenAI-compatible client against local Ollama (MiniMax cloud bridge).
        # No real API key needed — Ollama bridges to the cloud model locally.
        client = OpenAI(base_url=base_url, api_key=api_key)

        print(f"AIService: Processing {len(productos)} products...")
        try:
            inventory_text = "\n".join([
                f"- {p.nombre} ({p.codigo}) de {p.empresa.nombre if p.empresa else 'Empresa Desconocida'}: {p.precios}"
                for p in productos[:30]
            ])
        except Exception as e:
            print(f"AIService: Error formatting inventory text: {str(e)}")
            raise InfrastructureError(f"Error formateando datos para IA: {str(e)}")

        prompt = (
            "Actúa como un analista de inventarios experto. Analiza la siguiente lista de productos y genera un reporte ejecutivo breve.\n\n"
            f"Datos del inventario:\n{inventory_text}"
        )

        try:
            print(f"AIService: Requesting Ollama completion (model={model})...")
            response = client.chat.completions.create(
                model=model,
                messages=[
                    {
                        "role": "system",
                        "content": "Eres un analista de inventarios experto.",
                    },
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
            )
            print("AIService: Ollama response received.")
            return response.choices[0].message.content
        except Exception as e:
            print(f"AIService: Ollama Error: {str(e)}")
            raise InfrastructureError(f"Error en el servicio de IA: {str(e)}")
