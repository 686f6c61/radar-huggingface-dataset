# XiaoyuWen/TRACE-Mix-Qwen2.5-3B-Instruct

## Resumen

TRACE-Mix-Qwen2.5-3B-Instruct es un checkpoint de atacante (red-team) desarrollado por XiaoyuWen como parte del proyecto TRACE, descrito en el artículo «Not All Turns Matter: Credit Assignment for Multi-Turn Jailbreaking» (arXiv:2605.08778). El modelo se inicializa desde Qwen2.5-3B-Instruct y se entrena mediante aprendizaje por refuerzo (PPO) con asignación de crédito para generar prompts adversariales multi-turno capaces de eludir las salvaguardas de otros LLMs. Su propósito no es servir como asistente conversacional, sino como herramienta de evaluación de seguridad en entornos controlados.

Con 3.397 millones de parámetros y arquitectura Qwen2ForCausalLM, el modelo está diseñado para operar dentro de un bucle de interacción de hasta 5 turnos atacante-objetivo, generando un máximo de 128 tokens por turno. Se entrenó conjuntamente contra dos familias de modelos objetivo (gpt-oss-20b y Llama-3.1-8B-Instruct) para transferir ataques entre arquitecturas distintas. Su relevancia radica en que aborda un problema crítico en seguridad de IA: la evaluación sistemática de vulnerabilidades en conversaciones multi-turno, un escenario poco cubierto por los benchmarks tradicionales de jailbreak de un solo turno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B-Instruct soporta hasta 128K tokens) |
| Tipos de cuantizacion | No disponible (solo safetensors en BF16) |
| Idiomas soportados | Ingles |
| Licencia | qwen-research (otra) |
| Formato de pesos | Safetensors (sharded, BF16) |

## Arquitectura y entrenamiento

TRACE-Mix-Qwen2.5-3B-Instruct es un modelo denso basado en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar. Se inicializa desde el checkpoint instruct de Qwen2.5-3B y se somete a un entrenamiento de aprendizaje por refuerzo (PPO) con una técnica de asignación de crédito específica para ataques multi-turno. El entrenamiento se realizó durante 130 pasos de optimización, con una tasa de aprendizaje de 1e-6 y 20 pasos de warmup, en precisión BF16. Se utilizaron 520 objetivos dañinos del dataset AdvBench (walledai/AdvBench) como objetivos de ataque.

La innovación principal del proyecto TRACE es el mecanismo de asignación de crédito que permite al modelo identificar qué turnos de la conversación contribuyen más al éxito del jailbreak, mejorando la eficiencia del ataque en comparación con métodos que tratan todos los turnos por igual. El modelo se entrenó contra dos modelos objetivo de familias diferentes (gpt-oss-20b y Llama-3.1-8B-Instruct) para lograr transferencia entre arquitecturas. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición del dataset más allá de los objetivos de AdvBench.

## Capacidades

- Generacion de prompts adversariales multi-turno: el modelo construye conversaciones paso a paso, evitando términos explícitamente dañinos y guiando al modelo objetivo hacia el comportamiento no deseado mediante preguntas de apariencia benigna.
- Red-teaming y evaluacion de seguridad: diseñado para revelar fallos en las salvaguardas de LLMs en entornos autorizados.
- Transferencia entre familias de modelos: entrenado contra gpt-oss-20b y Llama-3.1-8B-Instruct, lo que sugiere cierta capacidad de generalizar ataques a otros modelos.
- Control de presupuesto de interaccion: opera con un maximo de 5 turnos atacante-objetivo y 128 tokens por turno, lo que permite evaluaciones acotadas.
- No incluye capacidades de tool calling, vision, audio ni razonamiento general: es una politica especializada en generar consultas de ataque, no un asistente de proposito general.

## Casos de uso

- Evaluacion de robustez de modelos de chat: las organizaciones pueden usar TRACE-Mix para probar sistematicamente si sus LLMs resisten intentos de jailbreak multi-turno, integrandolo en pipelines de red-teaming antes de un despliegue en produccion.
- Investigacion en alineacion y seguridad de IA: el modelo sirve como herramienta para estudiar como los atacantes explotan el contexto conversacional, ayudando a disenar mejores defensas.
- Desarrollo de defensas contra jailbreak: los equipos de seguridad pueden generar conjuntos de ataques con TRACE-Mix para entrenar clasificadores de contenido o sistemas de moderacion.
- Auditoria de cumplimiento normativo: en sectores regulados (financiero, salud), se puede usar para verificar que los asistentes de IA no generen contenido prohibido bajo conversaciones prolongadas.
- Benchmarking de modelos en entornos controlados: comparar la resistencia de diferentes LLMs frente a ataques multi-turno, utilizando el mismo conjunto de objetivos dañinos.
- Pruebas de caja roja en APIs de terceros: con autorizacion explicita, se puede emplear para evaluar la seguridad de modelos alojados externamente antes de contratar sus servicios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El articulo asociado (arXiv:2605.08778) reporta metricas de exito de jailbreak y transferencia entre modelos, pero esos datos no se incluyen en la model card ni en los resultados de busqueda web. Se recomienda consultar el paper para obtener las cifras detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en BF16 ocupa aproximadamente 6,8 GB en disco. Para inferencia con transformers, se recomienda al menos 8 GB de VRAM (por ejemplo, RTX 3060 12GB o superior) para evitar desbordamientos con el overhead de activaciones.
- GPU recomendadas: RTX 3090/4090 (24 GB) o A100 (40 GB) para ejecuciones comodas con multiples turnos y batch. En GPUs de 16 GB (RTX 4080, A10) tambien es viable.
- En consumer GPU: si, cabe en tarjetas de gama media-alta con 12-16 GB de VRAM. Con cuantizacion a 4 bits (no oficial, pero posible convirtiendo a GGUF) podria ejecutarse en 8 GB.
- Opciones de despliegue: transformers con accelerate, vLLM (si se adapta el prompt contract), llama.cpp/Ollama tras conversion a GGUF. No hay soporte oficial para TGI, pero es compatible con endpoints de texto.
- Latencia y throughput: no disponible en la informacion proporcionada. Dado el tamano de 3B, se espera una latencia baja en GPUs modernas, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de atacante multi-turno comparables en la documentacion proporcionada. Como referencia, se puede comparar con su modelo base:

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| TRACE-Mix-Qwen2.5-3B-Instruct | 3,4B | No disponible (base 128K) | Atacante red-team multi-turno | qwen-research |
| Qwen2.5-3B-Instruct | 3,4B | 128K | Asistente conversacional general | Apache 2.0 (Qwen) |

La diferencia clave es que TRACE-Mix esta especializado en generar ataques, mientras que el base es un asistente de proposito general. No se han encontrado alternativas directas en la busqueda web.

## Limitaciones y advertencias

- Uso dual: el modelo genera contenido adversarial que puede ser danino si se utiliza fuera de entornos de investigacion autorizados. La model card incluye una advertencia explicita de no desplegarlo como asistente de usuario ni ejecutar sus salidas automaticamente.
- Riesgo de alucinacion: al ser un modelo de 3B, puede producir consultas incoherentes o poco efectivas en algunos contextos, aunque su entrenamiento especifico mitiga parcialmente este problema.
- Limitacion de idioma: solo soporta ingles, lo que restringe su uso a evaluaciones en ese idioma.
- Restriccion de contexto: el presupuesto maximo es de 5 turnos y 128 tokens por turno; no esta disenado para conversaciones mas largas ni para otros formatos de interaccion.
- Licencia qwen-research: no es una licencia de codigo abierto estandar; restringe el uso a fines de investigacion y puede limitar la explotacion comercial. Es necesario revisar los terminos completos en el enlace proporcionado.
- Dependencia del prompt contract: el modelo requiere un formato de mensajes especifico (system message y plantilla de usuario) que no esta incrustado en los pesos; un uso incorrecto produce resultados no validos.
- No es un asistente general: carece de capacidades de tool calling, razonamiento avanzado o generacion de codigo fuera del ambito de ataque.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/XiaoyuWen/TRACE-Mix-Qwen2.5-3B-Instruct
- Pagina del proyecto TRACE: https://huggingface.co/XiaoyuWen/TRACE
- Paper (arXiv): https://arxiv.org/abs/2605.08778
- Codigo (GitHub): https://github.com/xsddys/TRACE
- Ejemplo de inferencia interactiva: https://huggingface.co/XiaoyuWen/TRACE/blob/main/inference.py
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
