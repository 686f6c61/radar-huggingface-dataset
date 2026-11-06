# therickcain/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF

## Resumen

Huihui-CyberStrike-OffSec-35B-abliterated es una versión "abliterated" (sin filtros de rechazo) del modelo CyberStrike-OffSec-35B de oyildirim, un modelo de 35.500 millones de parámetros basado en la arquitectura Qwen3 y especializado en seguridad ofensiva y pentesting. La versión abliterated ha sido publicada en formato GGUF por therickcain, partiendo del trabajo de abliteración de huihui-ai, que elimina las capas de rechazo del modelo mediante una técnica de dirección de activaciones sin necesidad de TransformerLens.

El modelo resuelve un problema concreto: los LLM estándar se niegan sistemáticamente a responder preguntas sobre explotación de vulnerabilidades, ingeniería inversa o técnicas de ataque, lo que dificulta su uso legítimo en auditorías de seguridad, CTFs y formación en ciberseguridad. Al tratarse de una variante sin alineamiento de seguridad, está dirigida exclusivamente a profesionales e investigadores en entornos controlados. El repositorio pesa 186 GB y el modelo hereda el soporte de tool calling del modelo base Qwen3, con un contexto de hasta 262.144 tokens según el comando de ejemplo de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según ejemplo de llama.cpp de la model card) |
| Tipos de cuantizacion | GGUF (se menciona Q4_K en el ejemplo; el resto de cuantizaciones no disponible) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base, CyberStrike-OffSec-35B de oyildirim, se construye sobre la familia Qwen3 de Alibaba, una arquitectura transformer densa con soporte nativo de tool calling y ventanas de contexto largas. Los detalles concretos del fine-tuning (número de tokens, composición del dataset de seguridad ofensiva, uso de RLHF o DPO) no están disponibles en la información proporcionada.

La aportación principal de esta ficha es el proceso de abliteración realizado por huihui-ai: una técnica que identifica las direcciones de activación responsables de los rechazos y las neutraliza mediante intervención en las activaciones, eliminando el comportamiento de negación sin reentrenar el modelo. Según la propia model card, se trata de una implementación "cruda" de prueba de concepto que no utiliza TransformerLens. La versión de therickcain es una cuantización GGUF de ese modelo abliterated para su uso con llama.cpp.

## Capacidades

- Generación de texto conversacional orientada a seguridad ofensiva y pentesting.
- Asistencia en tareas de ciberseguridad ofensiva heredadas del modelo base CyberStrike-OffSec: redacción de exploits, análisis de vulnerabilidades, reconocimiento y metodologías de ataque (según la temática del modelo base).
- Soporte de tool calling, heredado de Qwen3 y reflejado en las etiquetas del repositorio.
- Contexto largo de hasta 262.144 tokens, útil para analizar código fuente, logs o documentación extensa.
- Sin filtros de rechazo: responde a consultas que los modelos alineados suelen denegar.
- No se dispone de información sobre capacidades multimodales (visión, audio): no disponible.

## Casos de uso

- Red teaming en entornos autorizados: el modelo puede asistir en la planificación y ejecución de pruebas de intrusión, generando payloads, comandos y metodologías sin rechazos, siempre dentro de un marco legal con autorización explícita.
- Resolución de CTFs: útil para analizar binarios, sugerir vectores de explotación y redactar scripts durante competiciones de captura the flag.
- Formación en ciberseguridad: permite a estudiantes e instructivos explorar técnicas de ataque reales en laboratorios aislados sin que el modelo bloquee el contenido didáctico.
- Análisis de código con contexto largo: gracias a los 262.144 tokens de ventana, puede revisar repositorios completos buscando vulnerabilidades inyectables (inyección, deserialización, SSRF).
- Ingeniería inversa asistida: puede ayudar a interpretar desensamblado, ofuscación y protocolos propietarios durante auditorías de malware o firmware.
- Automatización de herramientas ofensivas: el soporte de tool calling permite integrarlo en pipelines donde el modelo orquesta herramientas como nmap, Burp Suite o scripts propios.
- Investigación en alineamiento y seguridad de modelos: como variante abliterated, sirve para estudiar la robustez de las técnicas de rechazo y sus limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio completo pesa 186 GB, lo que indica que incluye múltiples cuantizaciones GGUF. Con la cuantización Q4_K mencionada en el ejemplo, un modelo de 35,5 B ocupa aproximadamente 20-22 GB de memoria.
- Con Q4_K en una única GPU: se necesita una tarjeta con 24 GB de VRAM (RTX 3090, RTX 4090) para alojar los pesos, aunque el contexto de 262K tokens requerirá memoria adicional significativa para la caché KV.
- Con contexto completo de 262.144 tokens: recomendable hardware de servidor (A100 80 GB, H100) o descarga de capas a RAM/CPU, con penalización severa de latencia.
- Ejecución en CPU + GPU mixta posible gracias a GGUF, con throughput reducido.
- Despliegue soportado documentado: llama.cpp (llama-cli). Por extensión, cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp) debería funcionar; vLLM y TGI no son compatibles directamente con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| Huihui-CyberStrike-OffSec-35B-abliterated (este) | 35,5 B | 262.144 tokens (según model card) | Apache 2.0 | Abliterated, especializado en ofsec, GGUF |
| Qwen3-32B (base de la familia) | 32,5 B | 131.072 tokens | Apache 2.0 | Modelo generalista con tool calling, con alineamiento estándar |
| Huihui-Qwen3-32B-abliterated | 32,5 B | 131.072 tokens | Apache 2.0 | Misma técnica de abliteración sobre el generalista, sin especialización en seguridad |
| WhiteRabbitNeo (variantes uncensored de seguridad) | no disponible | no disponible | Variada | Modelos uncensored orientados a ciberseguridad, sin base Qwen3 |

Nota: la comparativa se basa en las características generales conocidas de la familia Qwen3 y del ecosistema huihui-ai; los datos del modelo base CyberStrike-OffSec-35B no están detallados en la informacion disponible.

## Limitaciones y advertencias

- Sin garantías de seguridad: el modelo ha perdido sus filtros de rechazo y puede generar contenido sensible, controvertido o inapropiado. La propia model card advierte de que no es apto para todos los públicos ni para aplicaciones que requieran alta seguridad.
- Responsabilidad legal del usuario: usar este modelo para actividades ofensivas sin autorización explícita es ilegal en la mayoría de jurisdicciones. El usuario asume todas las consecuencias legales y éticas.
- Riesgo de alucinación elevado: los modelos abliterated no pasan por evaluaciones de seguridad ni de veracidad; los exploits y comandos generados deben revisarse manualmente antes de ejecutarse.
- La abliteración es una técnica de prueba de concepto "cruda" según su propia descripción: puede degradar la calidad general del modelo o dejar rechazos residuales de forma inconsistente.
- Uso recomendado solo para investigación, testing y entornos controlados; la model card desaconseja su uso directo en producción o aplicaciones comerciales públicas.
- Datos del entrenamiento, idiomas soportados y benchmarks del modelo base: no disponible.
- Se recomienda supervisión en tiempo real de las salidas y revisión manual cuando sea necesario.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/therickcain/Huihui-CyberStrike-OffSec-35B-abliterated-GGUF
- Modelo base: https://huggingface.co/oyildirim/CyberStrike-OffSec-35B
- Técnica de abliteración (remove-refusals-with-transformers): https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Soporte huihui-ai (Ko-fi): https://ko-fi.com/huihuiai
