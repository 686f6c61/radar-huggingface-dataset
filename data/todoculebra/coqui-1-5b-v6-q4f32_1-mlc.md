# todoculebra/coqui-1.5b-v6-q4f32_1-MLC

## Resumen
Coquí 1.5B v6 es un ajuste fino de Qwen2.5-1.5B-Instruct desarrollado por Isla Tech LLC (Todo Culebra, Culebra, Puerto Rico). Está convertido al formato MLC/web-llm para ejecutarse en el navegador mediante WebGPU sin conexión a internet. Responde preguntas de viajes sobre Culebra, Vieques, San Juan y las Islas Vírgenes de EE. UU. en inglés y español a partir de notas offline de la aplicación.

El modelo parte de coqui-1.5b-v1 y añade un LoRA entrenado con aproximadamente 1.400 pares pregunta/respuesta escritos desde notas públicas de viaje de Todo Culebra. Cada ejemplo se verificó contra su nota antes del entrenamiento, descartando lugares incorrectos, horarios o precios inventados y respuestas en el idioma equivocado. Después se fusionó y se cuantizó a 4 bits con tamaño de grupo 32.

Es relevante porque demuestra un caso práctico de fine-tuning de dominio sobre un modelo pequeño y su despliegue en navegador con cuantización agresiva. La licencia es Apache 2.0, igual que la del modelo base. En el momento de la consulta el repositorio acumula 0 descargas y 0 likes, y ocupa 0,9 GB.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | No especificada en la información disponible; modelo base: Qwen/Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1,5 mil millones (heredados del modelo base Qwen2.5-1.5B-Instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4 bits con tamaño de grupo 32; variantes q4f16_1 y q4f32_1 |
| Idiomas soportados | Inglés (en) y español (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLC / web-llm (para MLC-LLM); no safetensors ni GGUF |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tamaño del repositorio | 0,9 GB |
| Pipeline | No disponible |
| Fecha de creación | 2026-10-14 |
| Descargas | 0 |
| Likes | 0 |

## Arquitectura y entrenamiento
El modelo es un fine-tune por LoRA de Qwen2.5-1.5B-Instruct, continuado desde coqui-1.5b-v1. El conjunto de entrenamiento contiene aproximadamente 1.400 pares pregunta/respuesta redactados a partir de las notas públicas de viaje de Todo Culebra por un modelo maestro abierto. Cada par se revisó contra su nota correspondiente antes de entrenar: se descartaron los que contenían lugares incorrectos, horarios o precios inventados, o respuestas en un idioma distinto al esperado. No se utilizaron conversaciones de huéspedes.

Tras el entrenamiento, el adaptador se fusionó con el modelo base y se cuantizó a 4 bits con tamaño de grupo 32. Se publican dos variantes: q4f16_1, pensada para teléfonos y portátiles con soporte de shader-f16, y q4f32_1. Ambas reutilizan la librería preconstruida de Qwen2.5-1.5B-Instruct de web-llm. No se documentan innovaciones arquitectónicas adicionales, decodificación especulativa ni mecanismos de atención alternativos en la información proporcionada.

## Capacidades
- Generación de texto y respuesta a preguntas sobre viajes en inglés y español.
- Especialización en Culebra, Vieques, San Juan y las Islas Vírgenes de EE. UU. según las notas offline de la aplicación.
- Funcionamiento sin conexión en navegador mediante WebGPU y MLC/web-llm.
- Distribución en formato MLC-LLM listo para web-llm, con variantes q4f16_1 y q4f32_1.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- No debe usarse para precios, horarios, números de teléfono ni emergencias; la aplicación responde esas consultas desde código, nunca desde este modelo.
- Hereda las capacidades generales de Qwen2.5-1.5B-Instruct, limitadas por su tamaño de 1,5 mil millones de parámetros y por el ajuste de dominio.

## Casos de uso
- Asistente turístico offline en web: integrado en https://todoculebra.com/app para responder preguntas de visitantes sin conexión. Es adecuado porque pesa 0,9 GB y se ejecuta en el navegador con WebGPU.
- Preguntas frecuentes bilingües sobre Culebra y Vieques: el fine-tune cubre esas islas y responde en inglés y español a partir de notas verificadas.
- Kiosco o punto de información sin internet: un dispositivo con WebGPU puede ejecutar el modelo localmente y servir respuestas sobre destinos concretos.
- Prototipo de modelo vertical de viajes con MLC-LLM: sirve como ejemplo reproducible de fine-tune LoRA, fusión y conversión a formato MLC cuantizado.
- Aplicación móvil de viajes con inferencia local: la variante q4f16_1 está pensada para teléfonos con soporte de shader-f16.
- Asistente editorial limitado a notas verificadas: útil para responder sobre lugares y recomendaciones estáticas, no para datos dinámicos como precios u horarios.
- Demostración educativa de cuantización 4 bits y despliegue en navegador: permite estudiar el flujo completo desde Qwen2.5-1.5B-Instruct hasta web-llm.
- Base para un sistema con recuperación aumentada: el modelo puede combinarse con código externo que gestione datos en tiempo real, aunque no se documenta tool calling nativo.

## Benchmarks y rendimiento
| Evaluación | Coquí 1.5B v6 | Coquí 1.5B v1 |
|---|---|---|
| Test de isla dentro de la app (211 preguntas) | 205/211 | 203/211 |
| Preguntas nuevas de huéspedes (50) | 36/50 | 33/50 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las puntuaciones anteriores son internas, obtenidas dentro de la aplicación con sus notas y su código, y no permiten comparación directa con otros modelos.

## Requisitos de hardware
- Tamaño del repositorio: 0,9 GB; corresponde a un modelo de 1,5 mil millones de parámetros cuantizado a 4 bits.
- Requiere WebGPU para la ejecución en navegador mediante MLC/web-llm.
- Variante q4f16_1: pensada para teléfonos y portátiles con soporte de shader-f16.
- Variante q4f32_1: para entornos sin shader-f16 o que requieran mayor compatibilidad.
- No se proporcionan requisitos mínimos de VRAM ni GPU recomendadas en la información disponible.
- Opciones de despliegue documentadas: MLC-LLM y web-llm en navegador; reutiliza la librería preconstruida de Qwen2.5-1.5B-Instruct.
- No se documenta despliegue con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Coquí 1.5B v6 | 1,5 mil millones | No disponible | Apache 2.0 | MLC/web-llm, 4 bits, grupo 32 | Fine-tune de viajes para Culebra, Vieques, San Juan y USVI; variantes q4f16_1 y q4f32_1 |
| Coquí 1.5B v1 | 1,5 mil millones | No disponible | Apache 2.0 | MLC/web-llm | Versión anterior del mismo ajuste; puntuaciones internas ligeramente inferiores |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones | No disponible | Apache 2.0 | No disponible | Modelo base sin ajuste de dominio; capacidades generales de instrucción |
| mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC | 1,5 mil millones | No disponible | Apache 2.0 | MLC/web-llm | Versión cuantizada del modelo base, sin fine-tune de viajes |

## Limitaciones y advertencias
- No debe usarse para precios, horarios, números de teléfono ni emergencias; la model card lo prohíbe explícitamente.
- Riesgo de alucinación en detalles de viaje, aunque el entrenamiento filtró ejemplos con lugares, precios u horarios incorrectos.
- Ámbito geográfico limitado a Culebra, Vieques, San Juan y las Islas Vírgenes de EE. UU.
- Idiomas limitados a inglés y español.
- Longitud de contexto no documentada; puede no manejar conversaciones muy largas o documentos extensos.
- Entrenado con aproximadamente 1.400 pares de pregunta/respuesta, por lo que la cobertura se restringe a las notas públicas de Todo Culebra.
- Sin benchmarks estándar publicados; las puntuaciones son internas y dependen del conjunto de prueba de la aplicación.
- En el momento de la consulta tiene 0 descargas y 0 likes, lo que indica adopción nula y poca validación externa.
- Licencia Apache 2.0, que permite uso comercial, pero exige conservar atribución y avisos de licencia.
- No se documenta soporte de tool calling ni integración nativa con datos en tiempo real.
- Hereda posibles sesgos y limitaciones de razonamiento de Qwen2.5-1.5B-Instruct, un modelo pequeño.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/todoculebra/coqui-1.5b-v6-q4f32_1-MLC
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Versión anterior coqui-1.5b-v1: https://huggingface.co/todoculebra/coqui-1.5b-v1-q4f16_1-MLC
- Versión MLC preconstruida del modelo base: https://huggingface.co/mlc-ai/Qwen2.5-1.5B-Instruct-q4f32_1-MLC
- Aplicación Todo Culebra: https://todoculebra.com/app
- Releases de librerías MLC LLM: https://github.com/mlc-ai/binary-mlc-llm-libs/releases
- Documentación de cuantización y optimización en MLC LLM: https://deepwiki.com/mlc-ai/mlc-llm/4.1-quantization-and-optimization
- Proyecto Coqui STT (no relacionado con este modelo): https://github.com/coqui-ai/STT-models
