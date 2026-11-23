# YudeJP/piqo-2.0

## Resumen

Piqo 2.0 es un codificador (encoder) de texto en japones desarrollado por YudeJP, disenado especificamente para el analisis de publicaciones cortas en redes sociales (SNS). El modelo resuelve dos tareas simultaneas sobre cada publicacion: clasificacion multietiqueta sobre 42 categorias tematicas (tecnologia, IA, finanzas, deportes, etc.) y generacion de un embedding de 256 dimensiones pensado para construir perfiles de interes por usuario en sistemas de recomendacion. Es la version sucesora de Piqo 1.0, publicada como modelo independiente sin modificar el repositorio original.

La arquitectura, denominada Piqo2Encoder, combina una estructura de tipo Funnel (rama de contexto mas rama lexica) con un diccionario de bigramas de coincidencia exacta de 32.767 entradas, y emplea un tokenizador SentencePiece Unigram con vocabulario de 32.768 tokens. Con 12.438.634 parametros de inferencia, es un modelo muy ligero (0,1 GB de repositorio) orientado a inferencia de alta velocidad en CPU, con un rendimiento medido de 419 publicaciones por segundo en modo individual y 2.813 en lote sobre un Ryzen 7 5800.

Su relevancia actual reside en la eficiencia: ofrece clasificacion tematica y embeddings de recomendacion en un unico paso, sin depender de LLM generativos, con licencia MIT y velocidad suficiente para procesar flujos de publicaciones en tiempo real. No es un modelo de lenguaje generativo y esta limitado al japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piqo2Encoder (Funnel: rama de contexto + rama lexica, con diccionario de bigramas) |
| Parametros totales | 12.438.634 (parametros de inferencia) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Japones (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (`encoder.safetensors`); tokenizador SentencePiece (`tokenizer.model`); diccionario en NumPy (`bigram_keys.npy`) |

## Arquitectura y entrenamiento

Piqo2Encoder es un codificador transformer de tipo Funnel: dispone de una rama de contexto que modela la secuencia completa y una rama lexica que procesa informacion a nivel de token, combinadas con un diccionario de bigramas de coincidencia exacta de 32.767 entradas (`bigram_keys.npy`) que aporta senal lexica directa. El tokenizador es SentencePiece Unigram con vocabulario de 32.768 tokens; el autor incluye deliberadamente solo `tokenizer.model` y no `tokenizer.json`, ya que la conversion alteraria la semantica de tokenizacion respecto a las condiciones de medicion publicadas.

Cada publicacion produce dos salidas: una distribucion de probabilidad sobre 42 categorias tematicas y un embedding de 256 dimensiones. El checkpoint publicado corresponde al build interno `candidate.17` (version 2.0.0-candidate.17), adoptado como referencia el 2026-11-19, con `model_hash` `ee7b942a9e062f53cb9d531f6436e030187efc8cb0e477bac36b813ed24ae153`. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. El autor indica que no se empleo texto real de publicaciones de Yudetter para el entrenamiento (solo para evaluacion), y remite a `MODEL_CARD.md` para la genealogia completa del entrenamiento.

## Capacidades

- Clasificacion multietiqueta en 42 categorias tematicas con salida de distribucion de probabilidad completa (no solo top-1).
- Generacion de embeddings de 256 dimensiones por publicacion para construir perfiles de interes por usuario.
- Clasificacion de texto corto en japones orientada a publicaciones de redes sociales.
- Ranking y recuperacion por recall: el modelo esta disenado para usarse como distribucion de probabilidad para ranking, no como clasificador de etiqueta unica.
- Inferencia de alta velocidad en CPU: 419 publicaciones/segundo individual y 2.813 publicaciones/segundo en lote (Ryzen 7 5800).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No genera texto: es exclusivamente un codificador de clasificacion y embeddings.
- No soporta vision ni audio.

## Casos de uso

- Clasificacion tematica de publicaciones en redes sociales: el modelo asigna una distribucion sobre 42 categorias a cada post en una sola pasada, adecuado para etiquetado automatico de grandes volumenes de contenido japones.
- Sistemas de recomendacion de contenido: el embedding de 256 dimensiones permite construir perfiles de interes por usuario y alimentar un motor de recuperacion o ranking de publicaciones afines.
- Moderacion y enrutamiento de contenido: la distribucion de probabilidad sobre categorias como `politics`, `law` o `security` permite derivar publicaciones a flujos de revision especificos.
- Analisis de tendencias por tematica: procesar en lote (2.813 posts/segundo) permite agregar la distribucion tematica de un flujo de publicaciones para detectar temas emergentes.
- Personalizacion de feeds en tiempo real: la velocidad de inferencia en CPU (419 posts/segundo individual) permite clasificar y vectorizar publicaciones en el momento de ingestion sin GPU.
- Investigacion sobre dinamica tematica en SNS japonesas: el benchmark abierto JPPostBench v2 y las salidas de probabilidad completa facilitan estudios reproducibles sobre clasificacion de texto corto.
- Filtrado por interes en pipelines de datos: usar el embedding para descartar o priorizar publicaciones segun la similitud con el perfil del usuario antes de etapas de procesamiento mas costosas.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre JPPostBench v2 (benchmark abierto de comprension de publicaciones cortas en japones; conjunto dev sintetico). Track A mide strict accuracy; los modelos LLM comparados se midieron en Kaggle Tesla T4 con llama.cpp b11954.

| Benchmark | Metrica | Resultado |
|---|---|---|
| JPPostBench v2 Track A dev (n=300) | strict accuracy | 93,7% |
| JPPostBench v2 Track A test (n=597) | strict accuracy | 93,8% |
| JPPostBench v2 Track B dev (n=60) | NDCG@6 | 76,1% |
| Bench interno v2, posts del operador (dev) | coincidencia con juicio humano | 55,2% (Piqo 1.0: 25,9%) |
| Bench interno v2, posts de Karotter (dev) | coincidencia con juicio humano | 53,8% (Piqo 1.0: 43,2%) |
| Velocidad, Ryzen 7 5800 | posts/segundo individual | 419 |
| Velocidad, Ryzen 7 5800 | posts/segundo en lote | 2.813 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni benchmarks de proposito general, dado que el modelo no es un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; con 12,4 millones de parametros el modelo es inferior a 50 MB en precision completa, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; el autor mide rendimiento en CPU (Ryzen 7 5800). Cualquier GPU con soporte PyTorch es suficiente.
- Cabe en GPU consumer: si, en todas las GPU consumer actuales (RTX 3060, RTX 4090, etc.), dado su tamano minimo.
- Opciones de despliegue: PyTorch con la implementacion `model.py` incluida en el repositorio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (el modelo no es generativo y no usa formato GGUF).
- Latencia y throughput: 419 posts/segundo individual y 2.813 posts/segundo en lote sobre Ryzen 7 5800 (datos del autor).

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables de clasificacion de texto corto en japones. La unica comparacion publicada es con su predecesor:

| Modelo | Parametros | Contexto | Rendimiento (bench interno v2, dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Piqo 2.0 | 12.438.634 | no disponible | 55,2% (operador) / 53,8% (Karotter) | MIT | Hugging Face |
| Piqo 1.0 | no disponible | no disponible | 25,9% (operador) / 43,2% (Karotter) | no disponible en la informacion | Hugging Face |

No se dispone de comparativas con otros modelos de la misma categoria (clasificadores de texto corto en japones o encoders de recomendacion) en la informacion disponible.

## Limitaciones y advertencias

- La coincidencia top-1 con juicios humanos en publicaciones reales es de aproximadamente el 55%; el propio autor advierte que las publicaciones cortas son intrinsecamente ambiguas y que la concordancia entre etiquetados humanos independientes impone un techo a las metricas de etiqueta unica. El modelo debe usarse como distribucion de probabilidad para ranking (enfocado a recall), no como clasificador duro.
- Entrenado exclusivamente para japones y para publicaciones cortas de SNS; no es un modelo de lenguaje general y no genera texto.
- No se documentan sesgos especificos, pero al tratarse de un clasificador tematico entrenado sobre datos de SNS, puede heredar sesgos de representacion de las categorias y de los dominios presentes en los datos.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas o de baja confianza en publicaciones ambiguas o fuera de dominio.
- Los resultados de benchmark publicados corresponden a conjuntos dev/test sinteticos y a evaluaciones internas; no se dispone de validacion independiente.
- Licencia MIT: permite uso comercial y modificacion, con la obligacion de incluir el aviso de copyright y la licencia.
- No se incluye `tokenizer.json` de forma intencionada; convertir el tokenizador puede alterar la tokenizacion y desviar los resultados de las condiciones de medicion publicadas.
- No se documentan la longitud de contexto soportada ni los tipos de cuantizacion disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YudeJP/piqo-2.0
- Modelo predecesor Piqo 1.0: https://huggingface.co/YudeJP/piqo-1.0
- Dataset de benchmark JPPostBench v2: https://huggingface.co/datasets/YudeJP/jppostbench
