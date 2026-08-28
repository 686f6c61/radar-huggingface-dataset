# stgallenquants/OpenThinker-32B

## Resumen

OpenThinker-32B es un modelo de lenguaje de razonamiento de 32 000 millones de parámetros, desarrollado por el equipo de OpenThoughts y publicado en Hugging Face por el usuario stgallenquants. Se trata de un ajuste fino (fine-tune) completo de Qwen/Qwen2.5-32B-Instruct sobre el dataset OpenThoughts-114k, un conjunto de datos de razonamiento destilado a partir de DeepSeek-R1 mediante un pipeline de generación de datos abierto. El modelo está diseñado para resolver problemas complejos de matemáticas, ciencias y razonamiento lógico, y destaca por ser completamente abierto: pesos, datos, código de entrenamiento y evaluación están disponibles públicamente.

La relevancia de OpenThinker-32B radica en que demuestra que es posible obtener un rendimiento competitivo en tareas de razonamiento con un dataset de solo 114 000 ejemplos, frente a los 800 000 (cerrados) que usan otros modelos destilados como DeepSeek-R1-Distill-Qwen-32B. Su arquitectura es un transformer denso basado en Qwen2, con una ventana de contexto de 16 000 tokens durante el entrenamiento y licencia Apache 2.0, lo que permite uso comercial sin restricciones. El modelo se publicó en febrero de 2025 y ha sido evaluado con la herramienta Evalchemy, mostrando resultados superiores a alternativas como LIMO-32B o s1.1-32B en varias métricas de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2) |
| Parametros totales | 32 763 876 352 (32B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16 000 tokens (entrenamiento) |
| Tipos de cuantizacion | No disponible (se esperan versiones comunitarias GGUF/AWQ) |
| Idiomas soportados | No disponible (hereda de Qwen2.5-32B-Instruct, presumiblemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OpenThinker-32B es un modelo transformer denso basado en la arquitectura Qwen2, con 32 000 millones de parámetros. No utiliza mezcla de expertos (MoE), por lo que todos los parámetros se activan en cada inferencia. El modelo parte de los pesos de Qwen2.5-32B-Instruct y se somete a un ajuste fino completo (full fine-tuning) sobre el dataset OpenThoughts-114k, que contiene 114 000 ejemplos de razonamiento paso a paso destilados de DeepSeek-R1. El proceso de entrenamiento se realizó con LlamaFactory durante 3 épocas, con una longitud de contexto de 16 000 tokens, learning rate de 1e-5, batch total de 96 y scheduler de tipo coseno con warmup del 10 %. El entrenamiento se llevó a cabo en AWS SageMaker con 8 nodos de 8xH100, tardando aproximadamente 90 horas en 4 nodos.

La principal innovación de este modelo no reside en una nueva arquitectura, sino en la calidad y el tamaño del dataset de entrenamiento. OpenThoughts-114k se construyó mediante un pipeline de destilación de DeepSeek-R1 que filtra y selecciona cadenas de razonamiento de alta calidad, priorizando problemas de matemáticas, ciencias y programación. El modelo no emplea RLHF ni DPO; se trata de un ajuste fino supervisado clásico, lo que simplifica su reproducción y lo hace atractivo para la investigación.

## Capacidades

- Razonamiento matematico avanzado: resuelve problemas de nivel competitivo (AIME, MATH500) con cadenas de razonamiento detalladas.
- Razonamiento cientifico: responde preguntas de dominio cientifico general (GPQA Diamond) con alta precision.
- Generacion de codigo: es capaz de producir y depurar codigo en diversos lenguajes, con buen rendimiento en benchmarks de codificacion (LCBv2).
- Razonamiento paso a paso: genera explicaciones intermedias que mejoran la interpretabilidad y la precision en tareas complejas.
- Capacidades multilingues: heredadas de Qwen2.5-32B-Instruct, aunque no se especifican idiomas concretos en la documentacion.
- Tool calling y function calling: no se menciona explicitamente en la informacion disponible, pero al estar basado en Qwen2.5-Instruct, es probable que herede estas capacidades.
- Agentes y multi-step reasoning: no se documenta de forma explicita, pero su naturaleza de razonamiento profundo lo hace adecuado para tareas que requieren planificacion.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede utilizarse como tutor automatico que muestra el razonamiento paso a paso, gracias a su entrenamiento en cadenas de pensamiento detalladas y su alto rendimiento en MATH500 (90.6).
- Generacion y revision de codigo en pipelines de CI/CD: aunque no se documenta soporte explicito de tool calling, su capacidad de razonamiento logico y su puntuacion de 68.9 en LCBv2 lo hacen util para detectar errores logicos y proponer correcciones en codigo.
- Investigacion cientifica asistida: para responder preguntas de nivel experto en fisica, quimica o biologia, aprovechando su resultado de 61.6 en GPQA Diamond, superior a otros modelos de su tamano.
- Analisis de datos y razonamiento estadistico: puede procesar problemas que requieren inferencia numerica y logica, siendo adecuado para tareas de analisis exploratorio.
- Generacion de contenido tecnico explicativo: produce articulos, documentacion o respuestas detalladas que requieren rigor y estructura, gracias a su capacidad de generar razonamientos extensos.
- Evaluacion de modelos de razonamiento: al ser un modelo abierto con pesos y datos publicos, sirve como punto de referencia para comparar tecnicas de destilacion y ajuste fino en investigacion.

## Benchmarks y rendimiento

Los siguientes resultados han sido declarados por el autor del modelo en la model card, evaluados con la herramienta Evalchemy. Se comparan con otros modelos de razonamiento de 32B basados en Qwen.

| Modelo | Tamano dataset | AIME24 I/II | AIME25 I | MATH500 | GPQA Diamond | LCBv2 |
|---|---|---|---|---|---|---|
| LIMO-32B | 0.8k | 56.7 | 49.3 | 86.6 | 58.1 | 60.0 |
| s1-32B | 1k | 36.0 | 25.3 | 84.8 | 50.5 | 40.9 |
| s1.1-32B | 1k | 64.7 | 49.3 | 89.0 | 60.1 | 65.5 |
| DeepSeek-R1-Distill-Qwen-32B | 800k (cerrado) | **76.7** | **55.9** | 89.4 | 57.6 | **71.2** |
| **OpenThinker-32B** | 114k | 66.0 | 53.3 | **90.6** | **61.6** | 68.9 |

OpenThinker-32B supera a todos los modelos con datasets abiertos en todas las metricas, y queda ligeramente por detras de DeepSeek-R1-Distill-Qwen-32B en AIME y LCBv2, pero le gana en MATH500 y GPQA Diamond. No se han publicado resultados en el model-index oficial (results: []), por lo que estos datos provienen exclusivamente de la tabla de la model card.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP16 se necesitan aproximadamente 64 GB de VRAM (32B x 2 bytes). Con cuantizacion de 8 bits se reduce a ~32 GB, y con 4 bits a ~16 GB.
- GPU recomendadas: para FP16, una A100 80GB o H100 80GB; para 8 bits, una RTX 4090 (24GB) no es suficiente, se necesitaria una A6000 48GB o similar; para 4 bits, una RTX 4090 o RTX 3090 (24GB) pueden ser suficientes.
- Compatibilidad con consumer GPU: solo con cuantizaciones agresivas (4 bits) y aun asi con limitaciones de velocidad. Para uso profesional se recomienda hardware de datacenter.
- Opciones de despliegue: al ser un modelo transformers estandar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante conversiones comunitarias) y cualquier framework que soporte safetensors.
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, un modelo de 32B en una A100 puede generar entre 20 y 40 tokens por segundo en FP16, dependiendo de la longitud de contexto y el batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Dataset entrenamiento | AIME24 | MATH500 |
|---|---|---|---|---|---|---|
| OpenThinker-32B | 32B | 16k | Apache 2.0 | 114k (abierto) | 66.0 | 90.6 |
| DeepSeek-R1-Distill-Qwen-32B | 32B | 128k | MIT | 800k (cerrado) | 76.7 | 89.4 |
| LIMO-32B | 32B | 128k | Apache 2.0 | 0.8k (abierto) | 56.7 | 86.6 |
| s1.1-32B | 32B | 128k | Apache 2.0 | 1k (abierto) | 64.7 | 89.0 |

OpenThinker-32B destaca por ofrecer un equilibrio entre rendimiento y apertura total. Aunque DeepSeek-R1-Distill-Qwen-32B tiene mejor rendimiento en AIME, su dataset no es publico y su contexto es mayor (128k frente a 16k). Los modelos LIMO y s1.1 usan datasets mucho mas pequenos, pero OpenThinker-32B los supera claramente en todas las metricas. Su licencia Apache 2.0 permite uso comercial sin restricciones, a diferencia de algunos modelos con clausulas especificas.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un fine-tune de Qwen2.5-32B-Instruct, hereda los posibles sesgos de su modelo base, que no han sido evaluados especificamente en esta version.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos, especialmente en dominios fuera de su entrenamiento (matematicas y ciencias). Se recomienda verificar resultados criticos.
- Limitaciones de contexto: la ventana de entrenamiento es de 16 000 tokens, inferior a otros modelos de la misma familia (128k). Para tareas que requieran contexto muy largo, puede degradarse el rendimiento.
- Idiomas: no se ha documentado oficialmente el soporte multilingue. Aunque Qwen2.5 soporta varios idiomas, no hay garantia de calidad en todos ellos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es recomendable revisar los terminos del modelo base Qwen2.5, que tambien es Apache 2.0, por lo que no hay conflictos.
- Produccion: al ser un modelo de razonamiento, las respuestas pueden ser largas y verbosas, lo que incrementa la latencia y el coste computacional. No se recomienda para tareas de baja latencia o generacion de texto general sin evaluar primero su idoneidad.

## Enlaces

- Modelo en Hugging Face (ID proporcionado): https://huggingface.co/stgallenquants/OpenThinker-32B
- Modelo oficial de open-thoughts: https://huggingface.co/open-thoughts/OpenThinker-32B
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset OpenThoughts-Unverified-173k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Unverified-173k
- Paper: https://arxiv.org/abs/2506.04178
- Repositorio GitHub (codigo y configuracion): https://github.com/open-thoughts/open-thoughts
- Herramienta de evaluacion Evalchemy: https://github.com/mlfoundations/Evalchemy
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Blog de medicion de razonamiento: https://www.open-thoughts.ai/blog/measure
- Blog de OpenThinker-32B: https://www.open-thoughts.ai/blog/scale
