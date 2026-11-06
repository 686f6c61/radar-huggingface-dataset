# VitaG/zils-mini-c6

## Resumen

VitaG/zils-mini-c6 es un ajuste fino (finetune) de pesos completos sobre el modelo base 1lock/zils-mini-astrid-m1, publicado por el usuario VitaG en Hugging Face. Se enmarca en el ecosistema Zils (subred Bittensor 127), una iniciativa orientada a entrenar modelos pequenos capaces de tomar decisiones concretas: clasificar peticiones, marcar problemas o puntuar coincidencias a partir de ejemplos etiquetados por el usuario. El modelo hereda el layout de Qwen3.5-4B, con tensores de lenguaje y vision en bf16, y cuenta con 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones).

La model card lo describe como un "decision body" de pesos completos destinado al pool de mezcla (soup) d3-mini. Su construccion combina tres lineas Apache-2.0 mediante un merge de vectores de tarea: el modelo base 1lock/zils-mini-astrid-m1, una destilacion propia entrenada con LoRA (rango 16) durante 8 rondas sobre el dataset publico zils-ai/zils-relay-answers y datos sinteticos de decision, y un ajuste fino orientado a puntuaciones con perdida Brier/RPS. Es relevante ahora porque ilustra una practica creciente en el ecosistema open source: modelos especializados en tareas de decision de bajo coste, entrenados con tecnicas de merge y destilacion sobre pesos abiertos.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en safetensors y un tamano de repositorio de 9,1 GB, lo que es coherente con pesos bf16 de un transformer de 4,5 mil millones de parametros. No se han publicado datos sobre idiomas soportados, pipeline de inferencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con layout Qwen3.5-4B (tensores de lenguaje y vision, bf16) |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5-4B, un transformer denso con tensores tanto de lenguaje como de vision en bf16. No se documenta en la informacion disponible si incorpora innovaciones adicionales como atencion lineal, decodificacion especulativa o capas hibridas. El hecho de incluir tensores de vision sugiere que el layout base contempla entrada multimodal, aunque la model card no detalla las capacidades efectivas de vision tras el ajuste.

El entrenamiento se realizo mediante un merge de vectores de tarea sobre tres lineas Apache-2.0, todas en el mismo layout Qwen3.5-4B. El proceso consta de tres componentes: (1) el modelo base 1lock/zils-mini-astrid-m1 en la revision b3a18304, que actua como punto de partida; (2) un cuerpo destilado propio que arranco de la media uniforme de torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini, entrenado en 8 rondas de LoRA con rango 16 sobre objetivos de destilacion del dataset publico zils-ai/zils-relay-answers, preguntas sinteticas de decision generadas por el autor (conteo, cobertura de atributos, politica de tool-call, formas de palabras) y particiones de entrenamiento publicas (CMUdict train, 20 Newsgroups train, PIQA train, STS-B train), con regularizacion hacia el punto de partida; y (3) un ajuste fino orientado a puntuaciones compuesto por tres ejecuciones LoRA (rango 16, atencion y MLP) desde el base, sobre preguntas de tipo valoracion y puntuacion generadas por el autor mas filas ancla etiquetadas por el base, con perdida Brier/RPS a temperatura fija, promediando las tres ejecuciones. El autor declara que no se usaron datos del examen de validadores, semillas publicas de examen ni particiones de validacion o test de las fuentes de examen.

## Capacidades

- Modelo de decision: disenado para clasificar peticiones, marcar problemas y puntuar coincidencias a partir de ejemplos, segun la propuesta de valor de Zils.
- Puntuacion calibrada: el ajuste fino con perdida Brier/RPS apunta a producir puntuaciones probabilisticas calibradas, no solo etiquetas.
- Politica de tool-call: los datos sinteticos de entrenamiento incluyen objetivos de politica de tool-call, lo que sugiere capacidad para decidir cuando invocar herramientas.
- Cobertura de atributos y conteo: los objetivos sinteticos incluyen tareas de conteo y cobertura de atributos.
- Formas de palabras: el entrenamiento incorpora datos de CMUdict, lo que apunta a cierta sensibilidad a morfologia y formas lexicas.
- Vision: el layout incluye tensores de vision, aunque no se documenta el alcance efectivo de esta capacidad tras el ajuste.
- Generacion de texto general, razonamiento, codigo y matematicas: no disponible; la model card no documenta estas capacidades y el enfoque del modelo es la decision.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Clasificacion de solicitudes entrantes: el modelo puede asignar peticiones de usuarios a categorias predefinidas tras un ajuste con ejemplos etiquetados, aprovechando su naturaleza de modelo de decision entrenado para este tipo de tarea.
- Marcado de incidencias: en pipelines de soporte o moderacion, puede senalar problemas en textos o registros (por ejemplo, campos incoherentes o contenido fuera de politica) y devolver una puntuacion de confianza calibrada gracias al ajuste con perdida Brier/RPS.
- Puntuacion de coincidencias: adecuado para tareas de matching (candidato-oferta, producto-consulta, articulo-etiqueta) donde se requiere una puntuacion probabilistica en lugar de una respuesta generativa.
- Decision de invocacion de herramientas: puede integrarse como capa de politica que decide si una consulta requiere llamar a una API externa, funcion o recuperador, dado el entrenamiento con objetivos de tool-call.
- Filtrado previo en pipelines RAG: como clasificador de bajo coste que decide si una consulta merece recuperacion documental o puede resolverse directamente, reduciendo latencia y coste del pipeline.
- Evaluacion de respuestas en sistemas de anotacion: puede puntuar la calidad o adecuacion de respuestas generadas por otro modelo, actuando como juez ligero en un bucle de evaluacion.
- Normalizacion y validacion lexica: el entrenamiento con CMUdict permite abordar tareas de formas de palabras, como validacion de terminos o normalizacion morfologica en preprocesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos, mas memoria para activaciones y cache KV; en la practica, se recomienda al menos 12-16 GB de VRAM para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 4,5-5 GB para pesos; en 4 bits, alrededor de 2,5-3 GB. No se documentan cuantizaciones oficiales, por lo que habria que generarlas a partir de los safetensors.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion con bf16; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 con margen; RTX 4080 (16 GB) o RTX 4070 Ti Super (16 GB) para bf16 con contexto limitado o cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas en bf16, y en tarjetas de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM (el layout Qwen3.5-4B es compatible con los kernels habituales, aunque no se documenta soporte oficial), TGI, llama.cpp u Ollama previa conversion a GGUF. No se documentan opciones oficiales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| VitaG/zils-mini-c6 | 4,5 mil millones | no disponible | Apache-2.0 | Finetune de decision sobre Qwen3.5-4B; sin benchmarks publicados |
| 1lock/zils-mini-astrid-m1 | no disponible | no disponible | no disponible | Modelo base del que parte este finetune; mismo pool Zils |
| torchcast-ai/torchcast-decision-4b | no disponible | no disponible | no disponible | Linea de decision usada en la media uniforme del entrenamiento |
| vllm-sr/d3-mini | no disponible | no disponible | no disponible | Segunda linea de decision usada en la media uniforme |

No se dispone de datos publicados de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la relacion de linaje.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de tareas de decision, lo que impide verificar su calidad frente a alternativas.
- Modelo de nicho: esta especializado en tareas de decision y puntuacion; no debe asumirse un rendimiento generalista en generacion de texto, codigo o matematicas.
- Idiomas no documentados: se desconoce que idiomas cubre el entrenamiento, lo que desaconseja su uso en produccion multilingue sin evaluacion previa.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar justificaciones o etiquetas incorrectas con alta confianza; la calibracion Brier/RPS ayuda pero no elimina este riesgo.
- Sesgos: los datos de entrenamiento incluyen particiones publicas (20 Newsgroups, PIQA, STS-B) y datos sinteticos generados por el autor, lo que puede introducir sesgos de dominio y de generacion.
- Trazabilidad limitada: el proceso de merge por vectores de tarea y las ejecuciones LoRA no son facilmente reproducibles sin los scripts del autor, que no se enlazan en la informacion disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las licencias de los modelos base y de los datasets de entrenamiento (CMUdict, 20 Newsgroups, PIQA, STS-B) antes de un despliegue comercial.
- Sin datos de contexto: se desconoce la ventana de contexto efectiva, lo que impide planificar su uso en conversaciones largas o documentos extensos.
- Repositorio sin descargas ni likes: el modelo es muy reciente y no cuenta con validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VitaG/zils-mini-c6
- Modelo base: https://huggingface.co/1lock/zils-mini-astrid-m1
- Linea de decision torchcast: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- Linea de decision vllm-sr: https://huggingface.co/vllm-sr/d3-mini
- Dataset de destilacion: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Organizacion Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
