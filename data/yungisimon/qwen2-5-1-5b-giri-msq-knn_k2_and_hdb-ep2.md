# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep2

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep2` es un ajuste fino completo del modelo instructivo Qwen2.5-1.5B-Instruct, publicado por el usuario yungisimon en Hugging Face. El modelo se ha entrenado como "memory model" (modelo de memoria) sobre pares sintéticos de pregunta-respuesta derivados del conjunto de datos MuSiQue, un benchmark de razonamiento multi-salto. El objetivo declarado es que el modelo aprenda a retener y recuperar información de contexto de forma estructurada, no solo a responder preguntas de conocimiento general.

La particularidad del ajuste es el método de construcción del dataset: agrupamiento mediante kNN con k=2, deduplicación de documentos y clustering HDBSCAN con tamaño mínimo de clúster 2, con combinación de entidades cruzadas entre documentos. El resultado es un corpus de 1.590.428 ejemplos sintéticos. El checkpoint publicado corresponde a la época 2 de 3, con todos los parámetros entrenados (1.543.714.304, el 100%) en precisión bf16 sobre 8 GPUs AMD Instinct MI325X.

Es relevante ahora porque ejemplifica una tendencia creciente: reutilizar modelos pequeños (1.5B) y entrenarlos para tareas muy específicas de memoria y recuperación, en lugar de escalar el tamaño del modelo. Para desarrolladores que necesitan un modelo ligero con comportamiento controlado de memoria conversacional, este checkpoint es un punto de partida, aunque su naturaleza experimental y la ausencia de benchmarks publicados exigen validación propia antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 (1,54B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8096 tokens durante entrenamiento; el contexto nativo de Qwen2.5-1.5B-Instruct no se especifica en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors bf16, admite cuantizacion posterior a GGUF/AWQ/GPTQ con herramientas externas |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda los del modelo base Qwen2.5, no confirmados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, y se ha sometido a un ajuste fino completo (full fine-tuning) con FSDP. No hay modificaciones arquitectónicas declaradas: se entrenan los 1.543.714.304 parámetros, el 100% de los pesos. El entrenamiento usó precisión bf16, gradient checkpointing, weight decay 0.01, max grad norm 1.0, learning rate constante de 2e-05 con warmup del 5%, batch efectivo de 256 (32 por dispositivo, 1 acumulación, 8 GPUs) y pérdida calculada solo sobre los tokens del asistente. La longitud máxima de secuencia fue de 8096 tokens. El entrenamiento completo de 3 épocas tardó 1,63 horas (13,1 GPU-horas) en 8 AMD Instinct MI325X.

El dataset es el elemento diferenciador: 1.590.428 ejemplos sintéticos de QA construidos a partir de un subconjunto de MuSiQue (1000 ejemplos base), con una época de muestreo y agrupamiento `knn_k2_and_hdb` (kNN con k=2, deduplicación de documentos, HDBSCAN con tamaño mínimo de clúster 2 y combinación de entidades cruzadas entre documentos). No se menciona RLHF ni DPO; el ajuste es supervisado sobre pares sintéticos. El checkpoint publicado es la época 2 de 3, por lo que no es el modelo final del entrenamiento.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen (se debe usar el chat template de Qwen).
- Memoria y recuperación de información de contexto: el ajuste busca que el modelo retenga y use información de documentos y entidades cruzadas, según el diseño del dataset MuSiQue.
- Razonamiento multi-salto sobre contextos documentales, derivado del tipo de datos de entrenamiento (MuSiQue es un benchmark multi-hop).
- Respuesta a preguntas de tipo QA sintético con entidades combinadas entre documentos.
- Compatibilidad con `transformers` (`AutoModelForCausalLM.from_pretrained`) y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (el modelo base Qwen2.5-Instruct lo soporta, pero no se confirma que el ajuste lo preserve).
- Capacidades de agente y multi-step reasoning: no confirmadas explícitamente; el entrenamiento sobre MuSiQue sugiere cierta capacidad multi-hop, pero sin benchmarks no se puede afirmar.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Memoria conversacional en asistentes: el modelo puede usarse para recordar y recuperar información de turnos anteriores en diálogos largos, aprovechando su entrenamiento específico sobre pares de memoria y su contexto de 8096 tokens.
- QA sobre documentación técnica: dado un conjunto de documentos con entidades relacionadas, el modelo puede responder preguntas que requieren combinar información de varios fragmentos, que es exactamente el patrón de MuSiQue.
- Prototipado de sistemas RAG ligeros: al ser un modelo de 1,5B, se puede desplegar en una sola GPU consumer para experimentar con pipelines de recuperación aumentada sin coste elevado.
- Extracción de relaciones entre entidades: el dataset incluye combinación de entidades cruzadas entre documentos, por lo que el modelo puede emplearse para tareas de consolidación de información de múltiples fuentes.
- Evaluación de técnicas de memoria en modelos pequeños: sirve como baseline para comparar estrategias de memoria (kNN, clustering, deduplicación) en investigación académica.
- Despliegue en entornos con recursos limitados: con cuantización a 8 o 4 bits, cabe en GPUs de 8-16 GB y puede servir como modelo de chat interno o de preprocesamiento de textos.
- Generación de resúmenes multi-documento: la combinación de entidades cruzadas del entrenamiento puede ayudar a sintetizar información de varios documentos en un resumen coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de memoria o QA multi-hop, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,1 GB solo para pesos (1,54B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contextos moderados.
- VRAM estimada con cuantización a 8 bits: alrededor de 1,6 GB para pesos; con 4 bits, alrededor de 0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, L4, A10). Para mayor throughput, A100, H100 o MI325X.
- Cabe en GPU consumer: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y GPUs integradas con suficiente memoria unificada.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (tag declarado), vLLM, llama.cpp/Ollama tras conversión a GGUF, y TGI en endpoints compatibles.
- Latencia y throughput estimados: no disponibles; el entrenamiento usó 8 AMD Instinct MI325X, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep2 | 1,54B | 8096 (entrenamiento) | Apache 2.0 | Ajuste de memoria sobre MuSiQue; sin benchmarks publicados |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 (nativo declarado por Qwen) | Apache 2.0 | Modelo base; benchmarks públicos de Qwen; uso general |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 | Apache 2.0 | Más capacidad general, mayor coste de VRAM |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 | Llama 3.2 Community License | Alternativa de tamaño similar; licencia más restrictiva |

La comparación con el modelo base es la más relevante: este checkpoint está especializado en memoria y QA multi-hop, pero no se dispone de datos que demuestren que supere al base en tareas generales. La licencia Apache 2.0 es más permisiva que la de Llama 3.2.

## Limitaciones y advertencias

- No hay benchmarks publicados: no se puede afirmar que el ajuste mejore al modelo base en ninguna tarea medible.
- Es la época 2 de 3: el checkpoint no es el modelo final del entrenamiento y puede estar infraentrenado respecto al resultado completo.
- Dataset sintético: los 1.590.428 ejemplos se generaron a partir de solo 1000 ejemplos base de MuSiQue, con posible amplificación de sesgos y errores del proceso de generación.
- Riesgo de alucinación: al ser un modelo de 1,5B entrenado para "recordar", puede inventar información cuando el contexto no contiene la respuesta, especialmente en dominios fuera de MuSiQue.
- Idiomas no declarados: no se confirma el soporte multilingüe; se recomienda validar el comportamiento en castellano antes de usarlo.
- Tool calling y capacidades de agente no confirmadas: el ajuste puede haber degradado habilidades del modelo base.
- Especialización estrecha: el entrenamiento en QA multi-hop puede reducir el rendimiento en tareas generales de conversación o código.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica con 0 descargas y 0 likes, sin validación comunitaria.
- Repositorio de 3,1 GB: incluye pesos bf16; la conversión a otros formatos requiere herramientas externas no documentadas en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2_and_hdb-ep2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset MuSiQue (referencia del benchmark): no disponible enlace directo en la información proporcionada
- Paper de MuSiQue: no disponible enlace en la información proporcionada
- Repositorio o demo: no disponible
