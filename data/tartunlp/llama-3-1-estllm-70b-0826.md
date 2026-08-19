# tartuNLP/Llama-3.1-EstLLM-70B-0826

## Resumen

El modelo `tartuNLP/Llama-3.1-EstLLM-70B-0826` es un ajuste fino (fine-tune) del modelo base `meta-llama/Llama-3.1-70B`, desarrollado por el grupo de investigación TartuNLP de la Universidad de Tartu (Estonia). Forma parte del proyecto EstLLM, cuyo objetivo es crear modelos de lenguaje de alto rendimiento para el estonio, un idioma con pocos recursos digitales. Este checkpoint de 70B es la variante más grande de la familia EstLLM y está diseñado para tareas de generación de texto en inglés y estonio.

Al estar basado en Llama 3.1, hereda la arquitectura transformer densa con 70.553 millones de parámetros y una ventana de contexto de 128K tokens. La relevancia de este modelo radica en que aborda la escasez de modelos de gran tamaño específicamente adaptados al estonio, un idioma que los modelos multilingües generales suelen cubrir de forma deficiente. El checkpoint está fechado en agosto de 2026 y se distribuye bajo la licencia Llama 3.1, lo que permite uso comercial con ciertas condiciones.

La model card oficial es muy escasa y no proporciona detalles sobre el proceso de entrenamiento, los datos utilizados ni los resultados de evaluación. Esta ficha se basa en los metadatos disponibles y en las características conocidas del modelo base, indicando explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Llama 3.1 |
| Parametros totales | 70.553.706.496 (70,55B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base; no confirmado para el fine-tune) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors de precisión completa) |
| Idiomas soportados | Inglés (en), estonio (et) |
| Licencia | Llama 3.1 Community License (llama3.1) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de Llama 3.1 70B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, atención con RoPE (rotary position embeddings) y 80 capas. El modelo base fue preentrenado por Meta con 15 billones de tokens en 8 idiomas, incluyendo el estonio, y posteriormente refinado con instrucciones. El fine-tune de TartuNLP parte de ese checkpoint y lo adapta específicamente al estonio, aunque no se han publicado detalles sobre el corpus de entrenamiento, el número de tokens adicionales, las hiperparametros o si se emplearon técnicas como RLHF o DPO. El nombre del checkpoint (0826) sugiere una fecha de iteración dentro del proyecto EstLLM, pero no hay documentación técnica adicional en la model card.

## Capacidades

- Generación de texto en inglés y estonio con calidad mejorada en estonio respecto al modelo base, según el propósito declarado del proyecto EstLLM.
- Razonamiento, matemáticas, código y comprensión lectora heredados del modelo base Llama 3.1 70B (no hay benchmarks específicos del fine-tune).
- Ventana de contexto larga de hasta 128K tokens, útil para documentos extensos y conversaciones multi-turno.
- Soporte de tool calling y function calling, tal como lo implementa Llama 3.1 (no confirmado explícitamente para este checkpoint).
- Capacidades multilingües limitadas a inglés y estonio; no se garantiza rendimiento en otros idiomas.
- No se mencionan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Traducción automática estonio-inglés y viceversa: el modelo puede usarse como motor de traducción de alta calidad, aprovechando su fine-tune en estonio y su base multilingüe.
- Atención al cliente en estonio: empresas estonias pueden desplegar asistentes conversacionales que entiendan matices locales y mantengan contexto largo en interacciones con clientes.
- Análisis de documentos legales y administrativos estonios: la ventana de 128K tokens permite procesar contratos, resoluciones o expedientes completos en una sola pasada.
- Generación de contenido editorial en estonio: redacción de artículos, resúmenes y materiales de marketing con estilo natural en el idioma.
- Asistente de programación con soporte de tool calling: integrable en entornos de desarrollo para generar código, explicar fragmentos o automatizar tareas de repositorio, aunque el rendimiento en código no está verificado para este fine-tune.
- Investigación lingüística y desarrollo de recursos PLN para estonio: el modelo sirve como base para tareas de etiquetado, extracción de información o creación de datasets anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna métrica de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. Tampoco se encontraron resultados en la búsqueda web para este checkpoint específico. El modelo hermano de 8B (EstLLM-8B-Instruct-0825) se menciona como un prototipo para evaluación en un entorno tipo ChatbotArena, pero no hay datos públicos de rendimiento para la versión de 70B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 70,55B parámetros en precisión fp16/bf16 se necesitan aproximadamente 141 GB de VRAM (el tamaño del repositorio es de 141,1 GB). Con cuantización de 8 bits se reduce a ~71 GB, y con 4 bits a ~36 GB, aunque no se proporcionan archivos cuantizados en el repositorio.
- GPU recomendadas: para inferencia sin cuantizar se requieren configuraciones multi-GPU, por ejemplo 2× A100 80GB o 4× RTX 4090 24GB. Con cuantización 4-bit podría ejecutarse en una sola GPU de 48GB (como A6000 o L40S) o en GPUs de consumo con 24GB si se usa una cuantización más agresiva (3-bit o 2-bit), con pérdida de calidad.
- No cabe en una GPU de consumo estándar (16GB o menos) sin cuantización extrema o descarga parcial a CPU.
- Opciones de despliegue: al ser un modelo transformers estándar, es compatible con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y cualquier framework que soporte Llama 3.1.
- Latencia y throughput: no se han publicado mediciones. Como referencia, Llama 3.1 70B en vLLM con 2× A100 alcanza típicamente entre 20 y 50 tokens/s dependiendo del batch y la longitud de secuencia, pero esto es una estimación general no verificada para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tartuNLP/Llama-3.1-EstLLM-70B-0826 | 70,55B | 128K (heredado) | en, et | Llama 3.1 | Fine-tune en estonio, sin benchmarks públicos |
| meta-llama/Llama-3.1-70B (base) | 70,55B | 128K | 8 idiomas (incl. et) | Llama 3.1 | Modelo base, ampliamente evaluado |
| tartuNLP/Llama-3.1-EstLLM-8B-Instruct-0825 | ~8B | 128K (heredado) | en, et | Llama 3.1 | Versión pequeña del proyecto EstLLM, prototipo para evaluación |

No se dispone de comparaciones con otros modelos de 70B específicos para lenguas bálticas o finesas. La principal diferencia frente al modelo base es la adaptación al estonio, aunque sin métricas cuantitativas no es posible verificar la mejora.

## Limitaciones y advertencias

- La model card no documenta sesgos, riesgos ni limitaciones específicas. Como fine-tune de Llama 3.1, hereda los sesgos y riesgos de alucinación del modelo base, que Meta ha documentado en su propia ficha.
- El rendimiento fuera de inglés y estonio no está garantizado; el fine-tune puede degradar ligeramente las capacidades en otros idiomas del modelo base.
- No hay evidencia pública de evaluación de seguridad (red teaming, pruebas de sesgo) para este checkpoint.
- La licencia Llama 3.1 permite uso comercial, pero exige que los servicios con más de 700 millones de usuarios mensuales soliciten una licencia específica a Meta. Además, el modelo debe distribuirse bajo la misma licencia.
- El repositorio no incluye archivos de cuantización ni documentación de despliegue; el usuario debe generarlos o convertirlos.
- Al ser un checkpoint de investigación (fechado en 2026), puede contener artefactos de entrenamiento no corregidos y no está garantizada su estabilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-0826
- Organización TartuNLP en Hugging Face: https://huggingface.co/tartuNLP
- Modelo hermano de 8B (EstLLM-8B-Instruct-0825): https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-8B-Instruct-0825
- Model card de Llama 3.1 70B Instruct (referencia del base): https://build.nvidia.com/meta/llama-3_1-70b-instruct/modelcard
- Documentación técnica de Llama 3.1 (DeepWiki): https://deepwiki.com/meta-llama/llama-models/10.1-llama-3.1
- Artículo de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
