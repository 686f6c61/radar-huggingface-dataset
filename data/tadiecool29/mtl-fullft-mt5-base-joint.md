# tadiecool29/MTL-FullFT-mt5-base-joint

## Resumen

MTL-FullFT-mt5-base-joint es un ajuste fino completo (full fine-tuning) del modelo multilingüe google/mt5-base, publicado por el usuario tadiecool29 en HuggingFace. Se trata de un modelo encoder-decoder de tipo text-to-text orientado a un escenario multilingüe de bajos recursos, con la lengua amhárica (amharic) como idioma de referencia segun los tags de la ficha. El entrenamiento es multi-tarea (MTL): el mismo checkpoint se evalua simultaneamente en tres objetivos, una tarea de generación medida con Exact Match, análisis de sentimiento y detección de postura (stance detection).

El modelo cuenta con 582.401.280 parametros (dato real extraido de los pesos safetensors), lo que coincide con el tamano del mT5-base original. El repositorio ocupa 1,2 GB, un tamano coherente con pesos almacenados en precision de 16 bits. No es un modelo MoE ni incorpora modulos de vision o audio: es un transformer encoder-decoder clasico con atención completa.

Su relevancia es acotada y de perfil academico o de investigacion: no es un modelo de propósito general, sino un artefacto de experimentacion sobre clasificacion y generacion en amharico y lenguas relacionadas. Los resultados publicados son modestos (Avg Macro F1 de 0,6470 y Exact Match de 0,5087 en el conjunto de evaluacion), por lo que debe tratarse como un punto de partida reproducible, no como un sistema listo para producción de alta exigencia. La ficha no documenta el dataset de entrenamiento, el formato de entrada/salida ni la composicion idiomatica exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (mT5, text-to-text) |
| Parametros totales | 582.401.280 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; los tags indican amharic (amhárico) y el modelo base google/mt5-base es multilingüe |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | google/mt5-base |
| Tamano del repositorio | 1,2 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion (metadatos) | 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es la de mT5-base: un transformer encoder-decoder con atención completa, normalizacion tipo pre-norm y embeddings de posicion relativos, preentrenado por Google con un objetivo de span corruption sobre el corpus multilingüe mC4. Este checkpoint parte de esos pesos y aplica un ajuste fino completo (todos los parametros se actualizan, no hay LoRA ni adaptadores), segun indica el propio identificador del modelo y los tags `full-finetuning` y `generated_from_trainer`. No se documenta ninguna innovacion arquitectonica propia: no hay decodificacion especulativa, atención lineal ni mecanismos híbridos.

El procedimiento de entrenamiento si esta detallado en la model card: 5 epocas, learning rate 0,0003 con scheduler lineal, batch de entrenamiento de 16 con 2 pasos de acumulacion (batch efectivo de 32), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, `label_smoothing_factor` de 0,1 y semilla 42. El dataset de entrenamiento aparece como "unknown dataset" (no especificado), lo que impide evaluar la representatividad de las clases, el dominio y la procedencia de los datos. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. No se menciona RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto condicionada a una entrada (tarea text2text): el modelo produce una secuencia de salida, evaluada con Exact Match sobre el conjunto de evaluacion.
- Clasificacion de sentimiento: etiquetado de polaridad, con una exactitud de 0,6334 y un macro F1 de 0,6321 segun los datos declarados por el autor.
- Deteccion de postura (stance detection): clasificacion de la posicion del autor respecto a un objetivo, con exactitud de 0,6658 y macro F1 de 0,6620.
- Multitarea conjunta: un unico checkpoint atiende las tres tareas en modo joint, sin cabezas separadas declaradas.
- Capacidad multilingüe heredada: al derivar de mT5-base, conserva potencialmente el conocimiento multilingüe del modelo original, aunque el ajuste fino se ha orientado a un dominio concreto.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, planificacion multi-paso ni uso de herramientas externas.
- No dispone de modo de razonamiento explicito (thinking mode), vision, audio ni multimodalidad.
- No se documenta ningun esquema de prefijos de tarea (task prefixes) ni plantilla de prompt, algo habitual y necesario en modelos mT5 multitarea.

## Casos de uso

- Analisis de opinion en amharico: el modelo puede etiquetar la polaridad de comentarios y publicaciones en redes sociales, aprovechando su ajuste especifico sobre esta tarea y su macro F1 de 0,6321, adecuado para estudios exploratorios mas que para decisiones automatizadas.
- Monitorizacion de postura en debates publicos: clasificacion de la posicion de un texto respecto a un tema o entidad, util en investigacion de ciencias sociales y analisis de discurso politico en lengua amharica.
- Etiquetado asistido de corpus: uso como preanotador para reducir el esfuerzo humano en la construccion de datasets etiquetados de sentimiento y stance, con revision posterior obligatoria dado el nivel de acierto.
- Investigacion en procesamiento de lenguas de bajos recursos: punto de partida reproducible para comparar estrategias de ajuste completo frente a adaptadores en amharico, con hiperparametros y curvas de entrenamiento publicados.
- Moderacion de contenido como primera capa de filtrado: el modelo puede marcar candidatos de postura negativa o sentimiento hostil para revision humana, nunca como decision final.
- Analisis de encuestas y respuestas abiertas: agregacion de sentimiento en cuestionarios con respuestas libres en amharico, siempre que el formato de entrada se determine experimentalmente al no estar documentado.
- Experimentacion academica en aprendizaje multitarea: banco de pruebas para estudiar interferencia entre tareas (sentimiento, stance y generacion) en un mismo checkpoint encoder-decoder.
- Docencia y prototipado: ejemplo de pipeline completo de fine-tuning con HuggingFace Trainer para cursos de PLN, desplegable en hardware de gama media.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de evaluacion (model card). El model-index del repositorio no contiene resultados adicionales (`results: []`).

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 1,7774 |
| Exact Match | 0,5087 |
| Sentiment Accuracy | 0,6334 |
| Sentiment Macro F1 | 0,6321 |
| Stance Accuracy | 0,6658 |
| Stance Macro F1 | 0,6620 |
| Avg Macro F1 | 0,6470 |

Evolucion durante el entrenamiento (5 epocas):

| Epoca | Paso | Validation Loss | Exact Match | Sentiment Macro F1 | Stance Macro F1 | Avg Macro F1 |
|---|---|---|---|---|---|---|
| 1,0 | 189 | 1,8589 | 0,3728 | 0,4416 | 0,5099 | 0,4758 |
| 2,0 | 378 | 1,8094 | 0,4663 | 0,5527 | 0,6113 | 0,5820 |
| 3,0 | 567 | 1,7856 | 0,4975 | 0,6042 | 0,6570 | 0,6306 |
| 4,0 | 756 | 1,7804 | 0,5100 | 0,6291 | 0,6662 | 0,6477 |
| 5,0 | 945 | 1,7774 | 0,5087 | 0,6321 | 0,6620 | 0,6470 |

No se han publicado resultados comparativos con MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible; el modelo no esta orientado a esas tareas.

## Requisitos de hardware

- VRAM en fp16/bf16: aproximadamente 1,2-1,5 GB solo para pesos, y del orden de 2-3 GB contando activaciones y cache de atencion con lotes pequenos (estimacion derivada del numero de parametros y del tamano del repositorio).
- VRAM en fp32: aproximadamente 2,4 GB solo para pesos; en la practica 3-4 GB con overhead.
- GPU recomendadas: cualquier GPU con 6 GB o mas, como RTX 3060, RTX 2060, RTX 4060, T4, L4. En GPUs de datacenter (A100, H100) el modelo es muy pequeno y quedara limitado por latencia de kernel mas que por memoria.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 4-6 GB o mas, incluidas GTX 1650/1660 en fp16 y con lotes reducidos.
- Inferencia en CPU: viable para peticiones sueltas o procesamiento por lotes sin requisito de baja latencia; el modelo tiene menos de 600 M de parametros.
- Opciones de despliegue: transformers (via `AutoModelForSeq2SeqLM`), Text Generation Inference (TGI), exportacion a ONNX con Optimum y servidores propios con FastAPI. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requeririan conversion manual; el soporte de arquitecturas encoder-decoder mT5 en vLLM es limitado y no esta verificado en la informacion disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La comparacion de rendimiento no es posible porque el modelo solo publica metricas internas de su propio conjunto de evaluacion, sin datos equivalentes en las alternativas. Los datos de la tabla para los modelos base proceden de su documentacion publica.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MTL-FullFT-mt5-base-joint | 582 M | no disponible | Multitarea: sentimiento, stance y generacion (amharico) | Apache-2.0 | HuggingFace, safetensors |
| google/mt5-base | 582 M | 1024 tokens en preentrenamiento (documentacion publica del modelo base) | Preentrenamiento multilingüe text-to-text con span corruption | Apache-2.0 | HuggingFace, safetensors |
| xlm-roberta-base | 278 M | 512 tokens | Encoder multilingüe para clasificacion y representaciones | MIT | HuggingFace, safetensors |
| Davlan/afro-xlmr-base | 278 M | 512 tokens | XLM-R ajustado sobre corpus africanos, incluye amharico | MIT | HuggingFace, safetensors |

Nota: no se dispone de resultados de benchmarks comparables entre estos modelos en la informacion proporcionada, por lo que la eleccion entre ellos debe basarse en pruebas propias sobre el dominio objetivo.

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento ("unknown dataset"), lo que impide conocer la procedencia de los datos, su licencia, su distribucion de clases y el posible sesgo inducido.
- Los resultados son modestos: macro F1 de 0,6470 y Exact Match de 0,5087, con una loss de evaluacion de 1,7774 que apenas mejora entre la epoca 3 y la 5, lo que sugiere saturacion temprana.
- Riesgo de alucinacion y de salidas mal formateadas: al ser un modelo text-to-text, la salida no esta restringida a un conjunto cerrado de etiquetas y puede generar texto no valido.
- No se documenta el formato de entrada ni el esquema de prefijos de tarea, algo que en modelos mT5 multitarea es imprescindible para reproducir el comportamiento esperado.
- Ambito idiomatico incierto: la ficha no declara el conjunto de idiomas cubiertos. Los tags apuntan al amharico y el modelo base es multilingüe, pero no hay garantia de rendimiento fuera del dominio de ajuste.
- Longitud de contexto no declarada; textos largos pueden truncarse segun la configuracion usada en el entrenamiento.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la licencia del dataset de ajuste es desconocida, lo que introduce un riesgo legal no resuelto para explotacion comercial.
- Adopcion practicamente nula (0 descargas, 1 like) y un unico autor, sin senales de mantenimiento, versionado ni validacion independiente.
- Los metadatos indican fecha de creacion 2026-09-12, incoherente con el momento actual; conviene verificar la trazabilidad del repositorio antes de usarlo.
- No apto como modelo de proposito general: no hay soporte de tool calling, agentes, vision ni razonamiento multi-paso documentado.
- No se han publicado cuantizaciones ni pesos GGUF, lo que limita las opciones de despliegue en entornos ligeros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/MTL-FullFT-mt5-base-joint
- Modelo base: https://huggingface.co/google/mt5-base
- La busqueda web realizada no devolvio resultados relevantes: unicamente enlaces generales a YouTube (https://www.youtube.com/, https://music.youtube.com/, https://play.google.com/store/apps/details?id=com.google.android.youtube, https://accounts.google.com/InteractiveLogin?service=youtube), sin relacion con el modelo.
- No se han encontrado papers, blogs, repositorios ni demos asociados a este checkpoint en la informacion disponible.
