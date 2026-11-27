# xaissur/recall-cosmos3-memory

## Resumen

Recall-cosmos3-memory es un modelo de la familia Cosmos orientado a robótica, publicado por el usuario xaissur en Hugging Face bajo el identificador `xaissur/recall-cosmos3-memory`. Por sus etiquetas (cosmos, robotics, memory) y su pipeline declarado como `robotics`, se trata de un modelo concebido para tareas de percepción y control robótico, presumiblemente con algún mecanismo de memoria que lo diferencia de los modelos Cosmos estándar de generación de vídeo y predicción de mundo físico. El repositorio tiene un tamaño de 68,1 GB, lo que sitúa el modelo en la escala de decenas de miles de millones de parámetros, aunque el dato exacto no está publicado.

La relevancia de esta ficha es limitada por la escasez de información oficial: no hay model card descriptiva, no se han publicado benchmarks, no se declaran idiomas soportados y la licencia figura como "other" sin detallar sus términos. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. Todo ello obliga a tratar cualquier dato no confirmado como no disponible y a recomendar verificación directa en el repositorio antes de cualquier uso en producción.

El modelo se apoya en la librería `cosmos`, lo que sugiere compatibilidad con el ecosistema NVIDIA Cosmos para modelos fundacionales de mundo físico. No obstante, al no existir documentación pública en la información proporcionada, la evaluación rigurosa de su arquitectura interna, datos de entrenamiento y capacidades reales queda pendiente de que el autor publique una model card completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Cosmos, orientada a robótica) |
| Parametros totales | no disponible (repo de 68,1 GB, coherente con decenas de miles de millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (términos no detallados; acceso gated) |
| Formato de pesos | no disponible (repo de 68,1 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. Por la etiqueta `cosmos` y la librería declarada, cabe inferir que deriva de la familia de modelos fundacionales Cosmos de NVIDIA, orientados a world models y robótica, pero no se confirma si emplea un transformer denso, una arquitectura MoE, un modelo híbrido o un diseño específico para predicción de estados físicos. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO o ajuste por instrucciones.

La etiqueta `memory` sugiere la incorporación de un mecanismo de memoria explícito, posiblemente para mantener contexto temporal en secuencias robóticas de larga duración, pero esta interpretación no está respaldada por documentación oficial en la información disponible. Cualquier afirmación sobre innovaciones técnicas (atención lineal, decodificación especulativa, planificación jerárquica) sería especulativa y, por tanto, se omite.

## Capacidades

- Pipeline declarado: `robotics`, lo que indica uso previsto en tareas de robótica (percepción, planificación o control).
- Posible soporte de memoria temporal, sugerido por el sufijo `memory` del nombre, sin confirmar en documentación.
- Capacidades de generación de texto, código, matemáticas o visión: no disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en robótica con world models: el modelo puede emplearse como base para experimentos de predicción de dinámica física en entornos simulados, aprovechando su pertenencia a la familia Cosmos y su pipeline `robotics`.
- Evaluación de mecanismos de memoria en agentes embodied: el sufijo `memory` sugiere que el modelo está pensado para mantener estado a lo largo de episodios, lo que lo hace candidato para estudiar olvido y retención en tareas de manipulación secuencial.
- Prototipado de políticas de control en laboratorio: dado su tamaño (68,1 GB de repo), requiere infraestructura de GPU de centro de datos, por lo que su uso realista es en entornos de investigación con clúster propio.
- Benchmarking interno frente a otros modelos Cosmos: útil como referencia comparativa en pipelines de evaluación de modelos de mundo físico, siempre que se documenten las condiciones de inferencia.
- Generación de datos sintéticos para entrenamiento de políticas robóticas: si el modelo hereda capacidades generativas de Cosmos, podría emplearse para aumentar datasets de simulación, aunque esto no está confirmado.
- Estudio de licencias y gobernanza en modelos gated: el caso sirve como ejemplo práctico de modelo con acceso restringido y licencia "other", útil para equipos que evalúan riesgos legales antes de adoptar pesos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Un repo de 68,1 GB sugiere pesos en fp16 de aproximadamente 34 mil millones de parámetros, lo que requeriría del orden de 68 GB de VRAM en fp16 sin cuantizar; en cuantización de 8 bits podría rondar los 34-40 GB, y en 4 bits los 20-25 GB, siempre como estimación orientativa y no confirmada.
- GPU recomendadas: para fp16, GPUs de centro de datos como A100 80 GB, H100 80 GB o múltiples A6000; para cuantización agresiva, posiblemente RTX 4090 (24 GB) o RTX A6000 (48 GB), sin garantía.
- ¿Cabe en consumer GPU? Solo con cuantización extrema y posiblemente con offloading; no confirmado.
- Opciones de despliegue: no disponible. La librería `cosmos` sugiere un stack específico del ecosistema NVIDIA; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas. La familia Cosmos de NVIDIA incluye variantes de world models y modelos de difusión para vídeo, pero no se confirma qué variante concreta sirve de base a este modelo ni sus parámetros exactos. Se indica "no disponible" para parámetros, contexto, rendimiento, licencia y disponibilidad de comparadores, a la espera de que el autor publique documentación.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xaissur/recall-cosmos3-memory | no disponible | no disponible | other (gated) | Hugging Face, acceso restringido |
| Alternativas Cosmos (NVIDIA) | no disponible | no disponible | no disponible | no disponible |
| Otros world models roboticos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre arquitectura, datos de entrenamiento, sesgos o evaluación, lo que impide un uso responsable sin auditoría previa.
- Licencia "other" sin términos publicados: no se puede confirmar si el uso comercial está permitido; es imprescindible contactar con el autor o revisar los términos adjuntos al repositorio.
- Acceso gated: requiere aceptar condiciones en Hugging Face, lo que añade una capa de gobernanza y puede limitar la reproducibilidad.
- Riesgo de alucinación y comportamientos erráticos: no evaluable sin benchmarks ni documentación.
- Idiomas no declarados: no se puede asumir soporte multilingüe ni siquiera en inglés.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible anticipar sesgos demográficos, geográficos o de dominio.
- Tamaño elevado (68,1 GB): implica costes de almacenamiento, transferencia e inferencia significativos, con barreras para equipos con recursos limitados.
- Cero descargas y cero likes en el momento de la consulta: indica ausencia de validación comunitaria, lo que aumenta el riesgo de usar pesos no verificados.

## Enlaces

- Hugging Face: https://huggingface.co/xaissur/recall-cosmos3-memory
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
