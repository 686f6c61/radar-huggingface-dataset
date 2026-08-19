# tuskyy/prompt-guard-roberta-base

## Resumen

`tuskyy/prompt-guard-roberta-base` es un clasificador de seguridad de prompts de tres clases (NORMAL, INJECTION, JAILBREAK_ATTEMPT) desarrollado por Mohamed Taha Frihida (usuario `tuskyy`) como filtro de primera línea para detectar inyecciones de prompt y intentos de jailbreak antes de que lleguen a un modelo de lenguaje grande (LLM). Se trata de un fine-tuning de `roberta-base` (125M de parámetros) sobre un corpus combinado de aproximadamente 1.953 ejemplos etiquetados extraídos de conjuntos públicos de inyección de prompts y jailbreaks, junto con prompts benignos.

El modelo resuelve un problema crítico en la seguridad de sistemas basados en LLM: la necesidad de un filtro ligero y rápido que pueda evaluar cada prompt entrante y bloquear ataques conocidos sin añadir latencia significativa. Su relevancia actual radica en que las técnicas de inyección de prompts y jailbreak evolucionan constantemente, y los sistemas de producción necesitan capas de defensa adicionales más allá del propio entrenamiento del LLM.

Arquitectónicamente es un transformer encoder-only (RoBERTa) con 124,6 millones de parámetros, una ventana de contexto de 512 tokens (el límite de RoBERTa-base) y salida de clasificación de secuencia. Está disponible bajo licencia MIT, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (transformer encoder-only) con cabeza de clasificación de secuencia |
| Parametros totales | 124.647.939 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite de roberta-base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | inglés (único idioma declarado) |
| Licencia | MIT |
| Formato de pesos | safetensors (también compatible con Transformers) |

## Arquitectura y entrenamiento

El modelo parte de `roberta-base` de Facebook AI, un transformer encoder-only preentrenado con masked language modeling sobre 160 GB de texto en inglés. Sobre esta base se añade una cabeza de clasificación de secuencia con tres salidas (NORMAL, INJECTION, JAILBREAK_ATTEMPT). El fine-tuning se realizó sobre un corpus de aproximadamente 1.953 ejemplos etiquetados, combinando datos públicos de inyección de prompts, jailbreaks y prompts benignos. El entrenamiento se llevó a cabo en dos notebooks de Kaggle, divididos porque el fine-tuning de RoBERTa-base excedía la memoria de una sola sesión de Kaggle.

No se menciona el uso de técnicas como RLHF o DPO; se trata de un fine-tuning supervisado estándar. El autor no detalla el número de épocas, la tasa de aprendizaje ni la partición exacta de entrenamiento/validación, aunque indica que el proceso completo está documentado en el repositorio de GitHub.

## Capacidades

- Clasificación de prompts en tres categorías: `NORMAL` (solicitud legítima), `INJECTION` (intento de inyección de prompt, como sobrescribir instrucciones o extraer el system prompt) y `JAILBREAK_ATTEMPT` (intento de eludir las restricciones de seguridad del modelo).
- Detección de inyecciones directas e indirectas, incluyendo patrones clásicos como "Ignore all previous instructions" o el rol "DAN".
- Salida con probabilidades softmax, lo que permite establecer umbrales de confianza para decidir entre bloquear, permitir o escalar a revisión humana.
- Integración sencilla con el ecosistema Transformers de Hugging Face mediante `AutoModelForSequenceClassification` y `AutoTokenizer`.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face, lo que facilita su despliegue como servicio de inferencia.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un clasificador de secuencia.

## Casos de uso

- Filtro de entrada en aplicaciones de chat: integrar el modelo como middleware que evalúa cada mensaje del usuario antes de pasarlo al LLM. Si la confianza en `INJECTION` o `JAILBREAK_ATTEMPT` supera un umbral (por ejemplo, 0,9), se bloquea la solicitud y se devuelve un mensaje de error. Su baja latencia (inferencia en milisegundos en CPU) lo hace adecuado para este flujo.
- Protección de agentes autónomos: en sistemas multi-agente donde un agente puede recibir entradas de fuentes externas (correos, documentos, APIs), el modelo puede actuar como guardián de las instrucciones del sistema, detectando intentos de redirección antes de que el agente ejecute acciones.
- Defensa en profundidad en APIs de LLM: combinar este clasificador con otros mecanismos de seguridad (filtros de salida, rate limiting, revisión humana) para crear una capa adicional de protección. El autor recomienda explícitamente no usarlo como única barrera.
- Escalado de incidentes de seguridad: en un SOC (centro de operaciones de seguridad), el modelo puede preclasificar prompts sospechosos y priorizar aquellos con alta confianza de ataque para análisis manual, reduciendo la carga de trabajo de los analistas.
- Evaluación de datasets de prompts: usar el modelo como herramienta de análisis para etiquetar automáticamente grandes colecciones de prompts y detectar posibles ataques en datos de entrenamiento o evaluación.
- Entrenamiento de otros modelos de seguridad: las predicciones del clasificador pueden servir como pseudo-etiquetas para generar datos de entrenamiento adicionales o para filtrar ejemplos maliciosos en pipelines de fine-tuning de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un clasificador de seguridad y no de un modelo generativo. El autor proporciona un único dato de evaluación: en un probe adversarial escrito a mano de 11 prompts (`scripts/probe_behavior.py` en el repositorio de GitHub), el modelo acierta 8 de 11 (72,7%). Este probe incluye casos de inyección, jailbreak y prompts benignos, y revela fallos conocidos en imperativos benignos y jailbreaks narrativos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 125M de parámetros, la inferencia en FP32 requiere aproximadamente 0,5 GB de VRAM (124,6M × 4 bytes). Con cuantización a int8 (no publicada oficialmente, pero posible con herramientas como `torch.quantization`), el requisito baja a unos 0,25 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650, RTX 3060 o incluso CPUs modernas pueden ejecutar la inferencia sin problemas. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) e incluso en hardware integrado con suficiente RAM.
- Opciones de despliegue: al ser un modelo Transformers estándar, puede servirse con vLLM, Hugging Face TGI, o mediante un simple script FastAPI (el autor proporciona una capa de servicio FastAPI en el repositorio). También es compatible con `text-embeddings-inference` según los tags del modelo.
- Latencia y throughput estimados: no hay datos oficiales, pero para un modelo de 125M en una GPU moderna (por ejemplo, T4), la inferencia de un prompt de 256 tokens debería completarse en menos de 10 ms, permitiendo cientos de solicitudes por segundo. En CPU, la latencia puede ser de 20-50 ms por solicitud.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tuskyy/prompt-guard-roberta-base` | 124,6M | 512 tokens | 3 (NORMAL, INJECTION, JAILBREAK_ATTEMPT) | MIT | Hugging Face |
| `meta-llama/Prompt-Guard-86M` | 86M | 2048 tokens | 3 (benign, injection, jailbreak) | Llama 3 Community License | Hugging Face |
| `meta-llama/Llama-Prompt-Guard-2-86M` | 86M | 2048 tokens | 3 (benign, injection, jailbreak) | Llama 3 Community License | Hugging Face |

Los modelos de Meta son más pequeños (86M frente a 124,6M) y tienen una ventana de contexto mayor (2048 tokens frente a 512), lo que les permite evaluar prompts más largos. Sin embargo, la licencia de Meta es más restrictiva (Llama 3 Community License) que la MIT del modelo de `tuskyy`. No se dispone de comparativas de rendimiento directas entre estos modelos en los datos proporcionados.

## Limitaciones y advertencias

- Falsos positivos en imperativos benignos: prompts que comienzan con un verbo en imperativo ("Write a Python function...", "Give me a recipe...") se clasifican erróneamente como `INJECTION`. El autor atribuye esto al pequeño tamaño del corpus de entrenamiento (~1.953 ejemplos), que parece haber llevado al modelo a asociar la forma imperativa con un ataque.
- Falsos negativos en jailbreaks narrativos: el conocido marco de la "abuela fallecida" (deceased grandmother) pasa como `NORMAL`. Los jailbreaks basados en narrativa o emoción están infrarrepresentados en los datos de entrenamiento.
- Sobreconfianza: tanto los falsos positivos como los falsos negativos ocurren con una confianza de ~0,999. La probabilidad softmax refleja la familiaridad del prompt con los patrones vistos, no la corrección de la predicción, por lo que un umbral de confianza no puede detectar estos fallos.
- Obsolescencia rápida: las técnicas de ataque evolucionan continuamente; un clasificador entrenado sobre un corpus fijo envejece rápidamente. El autor recomienda reentrenamiento periódico con datos actualizados.
- Limitación de idioma: solo soporta inglés. Los prompts en otros idiomas pueden producir resultados impredecibles.
- No es una solución de seguridad completa: el autor lo indica explícitamente como un filtro de primera pasada en una estrategia de defensa en profundidad, no como una barrera única.
- Sin datos de rendimiento en producción: no hay benchmarks estandarizados ni evaluaciones independientes más allá del probe de 11 prompts del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tuskyy/prompt-guard-roberta-base
- Repositorio GitHub (código, capa FastAPI y probe): https://github.com/TuskFrihida/llm-prompt-security-classifier
- Notebook de entrenamiento (parte 1): https://www.kaggle.com/code/mohamedtahafrihida/notebook1-llm-security
- Notebook de entrenamiento (parte 2): https://www.kaggle.com/code/mohamedtahafrihida/notebook2-llm-security
- Modelo base: https://huggingface.co/roberta-base
