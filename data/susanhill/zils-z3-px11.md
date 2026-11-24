# SusanHill/zils-z3-px11

## Resumen

zils-z3-px11 es un checkpoint de clasificación y toma de decisiones publicado en Hugging Face por el usuario SusanHill, derivado por fine-tuning del modelo base Qwen/Qwen3.8-27B. A pesar del identificador del repositorio, la model card describe el artefacto como pplx-decider-v1.1-27b, una actualización del modelo pplx-decider-v1-27b de Perplexity AI. El modelo no es un generador de texto generalista: incorpora una cabeza de decisión (`readout.safetensors`, BF16, forma `[255, 5120]`) sobre el backbone Qwen3_5Model, de modo que su salida es una distribución de probabilidad sobre un conjunto cerrado de candidatos definido por la consulta.

El problema que resuelve es la selección estructurada entre alternativas (enrutamiento de peticiones, elección de herramienta, clasificación con criterios explícitos) manteniendo el conocimiento y las capacidades multimodales del backbone. Según la model card, la versión 1.1 eleva el Decision Index de 56,4 a 61,56, superando a Jev en más de 3,5 puntos, con mejoras atribuidas al levantamiento de la máscara causal en las capas de atención completa y a un mayor volumen de datos de entrenamiento, incluidos los de tasksource.

El checkpoint tiene 26.085.330.160 parámetros reales según safetensors y un repositorio de 52,2 GB, lo que implica pesos en BF16 de aproximadamente 49 GiB. La longitud de contexto operativa para decisiones es de 8.192 tokens, incluyendo texto e imágenes, y las entradas que exceden ese límite se rechazan en lugar de truncarse. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3_5Model (capas de atención completa con modo no causal guardado + capas de atención lineal nativas) con cabeza de decisión separada |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens para la decisión completa (texto + todas las imágenes); las entradas que lo exceden se rechazan |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (backbone + `readout.safetensors` en BF16, forma `[255, 5120]`); requiere `custom-code` |
| Modelo base | Qwen/Qwen3.8-27B (relación: finetune) |
| Pipeline declarado | text-classification |
| Cabeza de salida | readout de 255 candidatos, no un `lm_head` de vocabulario completo |
| Resolución de imagen | lado redondeado a múltiplo de 32 px; área entre 65.536 px y `max_image_pixels` (por defecto 4.194.304 px, ≤4.096 tokens por imagen) |
| Coste visual | 1 token por cada parche de 32×32 px (≈ ancho × alto / 1024 tokens por imagen) |
| Tamaño del repositorio | 52,2 GB |
| Librería | pytorch |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.8-27B, cuya clase en Transformers aparece como `Qwen3_5Model`; la model card aclara explícitamente que el nombre de la clase no altera la identidad del modelo base. Sobre ese backbone se monta una cabeza de decisión independiente de 255 filas y dimensión 5120 en BF16, almacenada en `readout.safetensors`. No se trata por tanto de un modelo de lenguaje con `lm_head` de vocabulario completo, sino de un clasificador de candidatos: dado un estado y una pregunta con criterios, devuelve una distribución normalizada sobre las opciones válidas.

La innovación técnica principal es el modo de atención: las capas de atención completa utilizan la modalidad **no causal** guardada en el checkpoint, mientras que las capas de atención lineal conservan su comportamiento nativo. La inferencia causal por defecto no reproduce el setup evaluado. Además, `DecisionModel.predict` aplica una temperatura de calibración guardada; si se usan los logits directamente, debe aplicarse exactamente una vez y normalizar sobre los candidatos válidos de la decisión en curso. La model card atribuye la mayor parte de la mejora (de 56,4 a 61,56 en el Decision Index) al levantamiento de la máscara causal y al entrenamiento con más datos, incluidos los del proyecto tasksource. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

El procesamiento multimodal redimensiona las imágenes preservando la relación de aspecto, redondeando cada lado a múltiplo de 32 px y manteniendo el área entre 256×256 y `max_image_pixels`. Entrenamiento y evaluación se realizaron con imágenes limitadas a 512×512 (262.144 px, ≤256 tokens); resoluciones superiores conservan más detalle pero quedan fuera de la distribución de entrenamiento.

## Capacidades

- Clasificación y decisión entre candidatos: devuelve una distribución de probabilidad sobre un conjunto cerrado de opciones definido por la consulta, con criterios en lenguaje natural.
- Enrutamiento y selección: adecuado para decidir qué equipo, herramienta o política debe atender una petición.
- Entrada multimodal: acepta imágenes como rutas de fichero, objetos PIL o URLs `data:image/...;base64` en `row["images"]`, junto con el texto del estado.
- Contexto largo por decisión: hasta 8.192 tokens combinando texto e imágenes, con rechazo explícito de entradas que excedan el límite.
- Calibración integrada: `DecisionModel.predict` aplica la temperatura de calibración guardada, lo que produce probabilidades comparables entre candidatos.
- Conocimiento y razonamiento heredados del backbone Qwen3.8-27B, aunque la salida está restringida a la cabeza de decisión.
- Tool calling, agentes multi-paso, generación de código o matemáticas: no disponibles como capacidades nativas de este checkpoint, ya que la cabeza de salida no es un `lm_head` de vocabulario completo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y una pregunta de tipo `choice` con criterios (facturación, soporte técnico, ventas) y devuelve la probabilidad de cada equipo; encaja porque la salida es una distribución calibrada sobre candidatos cerrados y el contexto de 8.192 tokens permite incluir historial e imágenes del error.
- Clasificación de documentación con criterios explícitos: dado un documento y un conjunto de categorías descritas en lenguaje natural, se obtiene la asignación más probable sin necesidad de entrenar un clasificador específico por taxonomía.
- Triaje multimodal de incidencias: con capturas de pantalla o fotos del error adjuntas en `row["images"]`, el modelo combina texto e imagen para decidir la categoría o el equipo responsable, con un coste de aproximadamente ancho × alto / 1024 tokens por imagen.
- Selección de herramienta en un pipeline de agentes: la pregunta puede enumerar herramientas disponibles y sus criterios de uso, y la salida indica cuál invocar; útil como paso de decisión determinista dentro de un sistema mayor.
- Moderación y políticas: decisión entre categorías de política con criterios redactados por el equipo legal, aprovechando la calibración de probabilidades para fijar umbrales de escalado a revisión humana.
- Evaluación comparativa de decisiones: al ser un checkpoint con índice de decisión publicado, sirve como referencia para medir cambios en el backbone o en los datos de entrenamiento sobre el mismo conjunto de tareas.
- Investigación sobre atención no causal: el checkpoint permite reproducir el setup evaluado con atención completa no causal y atención lineal nativa, útil para estudiar el efecto de la máscara causal en tareas de decisión.

## Benchmarks y rendimiento

Resultados del Decision Index publicados en la model card. La puntuación global usa la ponderación del suite, no la media simple de categorías.

| Categoria del Decision Index | Jev | pplx-decider-v1-27b | pplx-decider-v1.1-27b |
|---|---:|---:|---:|
| Knowledge | **51,4** | 40,9 | 48,18 |
| Language | 62,0 | 63,5 | **69,45** |
| Retrieval | 55,4 | 54,9 | **61,26** |
| Tools | 75,1 | **79,3** | 78,88 |
| Arts | 37,7 | 39,4 | **44,66** |
| **Overall Decision Index** | 57,9 | 56,4 | **61,56** |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje.

## Requisitos de hardware

- VRAM estimada: aproximadamente 49 GiB solo para pesos en BF16, más memoria de trabajo para activaciones, procesamiento de imágenes y contexto; la model card recomienda una GPU CUDA con espacio para unos 49 GiB de pesos más memoria operativa.
- GPU recomendadas: A100 80 GB, H100 80 GB o superiores; una GPU de 48 GB queda al límite y probablemente insuficiente al sumar memoria de trabajo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en BF16. No se documentan cuantizaciones GGUF ni versiones de menor precisión para este checkpoint.
- Despliegue: la vía soportada es el código de inferencia incluido (`source/src/autojev/model.py`, clase `DecisionModel`), con Python 3.12+ y las dependencias fijadas en `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; cualquier sistema que requiera `Qwen3_5ForConditionalGeneration` necesita una exportación separada que mapee la fila `i` del readout a la fila de vocabulario indicada en `decision_config.json["token_ids"][i]` y que preserve el comportamiento de atención.
- Latencia y throughput: no disponibles.
- Memoria de contexto: el límite de 8.192 tokens por decisión acota el coste, pero varias imágenes por decisión obligan a reducir `max_image_pixels` o a reescalarlas previamente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-px11 (pplx-decider-v1.1-27b) | 26.085.330.160 | 8.192 tokens | 61,56 | Apache 2.0 | Hugging Face (repo SusanHill) |
| pplx-decider-v1-27b | no disponible | no disponible | 56,4 | no disponible en la información | Hugging Face (perplexity-ai) |
| Jev | no disponible | no disponible | 57,9 | no disponible en la información | Referencia del suite Decision Index |

No se dispone de datos de parámetros, contexto ni licencia de Jev ni de pplx-decider-v1-27b en la información proporcionada, por lo que la comparación se limita a la métrica del Decision Index.

## Limitaciones y advertencias

- No es un modelo generativo: la cabeza de decisión tiene 255 filas y no existe un `lm_head` de vocabulario completo, por lo que no puede usarse para generación libre de texto sin una exportación adicional.
- La inferencia causal por defecto no reproduce el comportamiento evaluado; es obligatorio usar el modo de atención no causal guardado en las capas de atención completa.
- La temperatura de calibración debe aplicarse exactamente una vez; aplicarla dos veces o normalizar sobre candidatos no válidos invalida las probabilidades.
- Las entradas que superan los 8.192 tokens se rechazan, no se truncan: en producción hay que gestionar ese error explícitamente.
- Las resoluciones de imagen superiores a 512×512 quedan fuera de la distribución de entrenamiento, con posible degradación de la calidad de decisión además de mayor coste de memoria y latencia.
- El repositorio declara `pipeline_tag: text-classification` pero requiere `custom-code`; no funciona con un pipeline estándar de Transformers sin cargar el código incluido.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de un backbone entrenado con datos web, son previsibles sesgos heredados, pero no se documentan evaluaciones al respecto.
- Riesgo de alucinación: limitado en la forma (la salida siempre es una de las opciones válidas), pero la asignación de probabilidad puede ser incorrecta o estar mal calibrada fuera de la distribución de entrenamiento.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la model card no incluye cláusulas adicionales ni avisos sobre los datos de entrenamiento de terceros (tasksource) más allá de la cita académica solicitada.
- El identificador del repositorio (SusanHill/zils-z3-px11) no coincide con el nombre del modelo descrito en la model card (pplx-decider-v1.1-27b), y la propia model card indica que el repositorio es privado y requiere acceso autenticado; conviene verificar la procedencia antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SusanHill/zils-z3-px11
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo predecesor: https://huggingface.co/perplexity-ai/pplx-decider-v1-27b
- Decision Index (Space de evaluación): https://huggingface.co/spaces/multimodalart/jev-decision-index
- tasksource (datos de entrenamiento): https://github.com/sileod/tasksource
- Artículo de tasksource (LREC-COLING 2024): https://aclanthology.org/2024.lrec-main.1361/
- Bespoke Nimble (pipeline de datos): https://github.com/bespokelabsai/nimble
