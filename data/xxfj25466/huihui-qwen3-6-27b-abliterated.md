# xxfj25466/Huihui-Qwen3.6-27B-abliterated

## Resumen

El modelo Huihui-Qwen3.6-27B-abliterated es una variante del modelo Qwen/Qwen3.6-27B, desarrollada por el equipo de huihui-ai (publicada en HuggingFace por el usuario xxfj25466), que ha sido sometida a un proceso de *abliteration* para eliminar los comportamientos de rechazo y los filtros de seguridad del modelo original. Esta técnica, implementada como una prueba de concepto basada en el repositorio *remove-refusals-with-transformers*, modifica los pesos del modelo para que no se niegue a responder a ciertas solicitudes, dando lugar a una versión "sin censura" con fines principalmente experimentales.

El modelo base, Qwen3.6-27B, es un transformer multimodal (image-text-to-text) de aproximadamente 27.800 millones de parámetros, capaz de procesar tanto texto como imágenes. La variante abliterated conserva estas capacidades multimodales, pero con una reducción significativa de los mecanismos de seguridad. Está disponible bajo licencia Apache 2.0 y se distribuye en formato safetensors, con un tamaño de repositorio de 55,6 GB. También existe una versión cuantizada en NVFP4 con predicción multi-token (MTP) publicada en ThinkLLM, así como una integración directa en Ollama.

Este modelo resulta relevante para la comunidad investigadora interesada en el estudio de la alineación, la eliminación de rechazos y los límites de los filtros de seguridad en modelos de lenguaje. No está recomendado para uso en producción ni en aplicaciones públicas, tal y como advierte explícitamente su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Qwen3.6-27B |
| Parametros totales | 27.781.427.952 (27,8 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (fp16); existe variante NVFP4 con MTP en ThinkLLM |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; tambien disponible en GGUF (via Ollama) |

## Arquitectura y entrenamiento

El modelo es un *fine-tune* del checkpoint Qwen/Qwen3.6-27B, al que se ha aplicado la técnica de *abliteration*. Este procedimiento, descrito en el repositorio *remove-refusals-with-transformers*, consiste en identificar y eliminar las direcciones en el espacio de activaciones que correlacionan con comportamientos de rechazo, sin necesidad de usar TransformerLens. El resultado es un modelo que conserva las capacidades generales del original (razonamiento, generación de texto, procesamiento de imágenes) pero con una drástica reducción de los mecanismos de rechazo y de los filtros de contenido.

No se han publicado detalles sobre el conjunto de datos de entrenamiento adicional ni sobre el proceso exacto de ajuste más allá de la abliteration. El modelo base Qwen3.6-27B es un transformer multimodal entrenado por Alibaba Cloud, con soporte para entradas de imagen y texto, aunque no se dispone de información específica sobre el número de tokens de entrenamiento, la composición del dataset o si se emplearon técnicas como RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-27B, incluyendo tareas de comprension lectora, redaccion y razonamiento logico.
- Procesamiento multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text), lo que permite describir imagenes, responder preguntas visuales y realizar tareas de vision-lenguaje.
- Generacion de codigo y matematicas: al estar basado en Qwen3.6, se espera un rendimiento solido en tareas de programacion y calculo, aunque no se han publicado benchmarks especificos para esta variante.
- Ausencia de filtros de seguridad: la abliteration elimina la mayoria de los rechazos, permitiendo generar contenido que el modelo original bloquearia (con los riesgos asociados).
- Soporte de tool calling y agentes: no se menciona explicitamente en la documentacion disponible; se asume que hereda las capacidades del modelo base, pero no hay confirmacion.
- Capacidades multilingues: no se especifican los idiomas soportados; el modelo base Qwen3.6 es conocido por su soporte multilingue, pero no hay datos concretos para esta variante.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo es util para estudiar como la abliteration afecta al comportamiento de un LLM, comparando respuestas antes y despues de eliminar los rechazos, y para analizar los limites de los filtros de seguridad.
- Experimentacion con generacion de contenido sin restricciones: en entornos controlados y con fines academicos, puede usarse para explorar la creatividad del modelo sin las limitaciones impuestas por los guardarrailes, siempre con supervisión humana.
- Evaluacion de robustez y sesgos: permite probar la resistencia del modelo a prompts adversariales y examinar sesgos latentes que los filtros de seguridad podrian enmascarar.
- Desarrollo de tecnicas de desalineacion controlada: como punto de partida para investigar metodos de "uncensoring" y sus implicaciones eticas y tecnicas.
- Pruebas de concepto en sistemas de moderacion: sirve como caso de estudio para disenar sistemas de moderacion mas efectivos, al exponer los tipos de contenido que un modelo sin filtros puede generar.
- Uso en entornos de investigacion cerrados: para proyectos que requieran un LLM sin restricciones de contenido, como la generacion de datasets sinteticos para entrenar clasificadores de contenido nocivo, siempre bajo acuerdos de uso responsable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Dado que es un fine-tune del modelo base Qwen3.6-27B, se espera un rendimiento similar al original, pero no hay datos confirmados para esta variante abliterated.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 27,8 B de parametros. En precision fp16 (55,6 GB de pesos), se necesitan al menos 60-70 GB de VRAM para inferencia con batch pequeno. Con cuantizacion a 8 bits, se reduce a unos 30-35 GB; con 4 bits, a unos 15-18 GB.
- GPU recomendadas: para fp16, una NVIDIA A100 (80 GB) o H100 (80 GB) es adecuada. Para cuantizacion 8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) puede ser suficiente. Para 4 bits, una RTX 3090 (24 GB) o RTX 4080 (16 GB) podria funcionar, aunque con limitaciones de contexto.
- Compatibilidad con GPU de consumo: si, con cuantizacion 4 bits o 8 bits, el modelo puede ejecutarse en GPUs de 16-24 GB, como la RTX 4090 o la RTX 3090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (existe una integracion oficial en huihui_ai/qwen3.6-abliterated:27b), TGI (Text Generation Inference) y Transformers con accelerate.
- Latencia y throughput: no se han publicado datos especificos. En una A100 con fp16, se puede esperar una latencia de decenas de milisegundos por token, dependiendo de la longitud de la secuencia y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Abliterated |
|---|---|---|---|---|---|
| Huihui-Qwen3.6-27B-abliterated | 27,8 B | no disponible | Si (imagen+texto) | Apache 2.0 | Si |
| Qwen/Qwen3.6-27B (original) | 27,8 B | no disponible | Si (imagen+texto) | Apache 2.0 | No |
| Huihui-Qwen3-32B-abliterated (hipotetico) | no disponible | no disponible | no disponible | no disponible | Si |

No se dispone de informacion suficiente para comparar con otros modelos abliterated de tamano similar. La unica comparacion directa posible es con el modelo base Qwen3.6-27B, del cual se diferencia exclusivamente por la eliminacion de los mecanismos de rechazo. No hay datos publicados sobre rendimiento relativo.

## Limitaciones y advertencias

- Riesgo de contenido sensible o controvertido: al haberse reducido significativamente el filtrado de seguridad, el modelo puede generar contenido inapropiado, ofensivo, ilegal o danino. No es apto para publico general ni para entornos sin supervisión.
- No apto para produccion: la model card recomienda explicitamente no usar este modelo en aplicaciones comerciales o publicas, sino unicamente en entornos de investigacion y pruebas controladas.
- Alucinaciones y errores facticos: como cualquier LLM, puede producir informacion falsa o inventada, y la ausencia de filtros no corrige este problema.
- Sesgos no mitigados: los sesgos presentes en el modelo base pueden amplificarse al eliminar los rechazos, ya que no hay mecanismos que moderen respuestas potencialmente sesgadas.
- Responsabilidad legal y etica: el usuario es el unico responsable de garantizar que el uso del modelo cumple con las leyes locales y los estandares eticos. El autor (huihui.ai) declina cualquier responsabilidad sobre las consecuencias derivadas de su uso.
- Limitaciones de contexto e idioma: no se han especificado la longitud de contexto ni los idiomas soportados, lo que dificulta su uso en aplicaciones que requieran ventanas largas o multilingues.
- Calidad de la abliteration: se trata de una implementacion "cruda" y de prueba de concepto, por lo que la eliminacion de rechazos puede ser incompleta o afectar a otras capacidades del modelo de forma impredecible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xxfj25466/Huihui-Qwen3.6-27B-abliterated
- Modelo base Qwen/Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio remove-refusals-with-transformers: https://github.com/Sumandora/remove-refusals-with-transformers
- Version en Ollama: https://ollama.com/huihui_ai/qwen3.6-abliterated:27b
- Variante cuantizada NVFP4 con MTP en ThinkLLM: https://thinkllm.dev/models/huihui-qwen3-6-27b-abliterated-nvfp4-mtp
- Perfil de huihui-ai en HuggingFace: https://huggingface.co/huihui-ai
