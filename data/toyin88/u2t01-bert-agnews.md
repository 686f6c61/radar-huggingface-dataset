# toyin88/u2t01-bert-agnews

## Resumen

`toyin88/u2t01-bert-agnews` es un clasificador de texto de cuatro clases construido sobre `google-bert/bert-base-uncased` mediante ajuste fino completo (*full fine-tuning*). Forma parte del proyecto **U2T01: Adapting BERT for NLP tasks**, en el que el mismo cuerpo BERT se adapta a cuatro tareas distintas y cada una recibe el metodo de adaptacion que justifican sus propias mediciones. En este caso la tarea es la clasificacion tematica de noticias de AG News en las categorias World, Sports, Business y Sci/Tech.

Tecnicamente es un transformer encoder-only denso de 109.485.316 parametros, de los cuales se entrenaron 85.648.132 (un 78,23 %): las 12 capas del encoder y la cabeza de clasificacion, manteniendo congelada la matriz de embeddings (23 M de parametros). El entrenamiento uso 6.000 ejemplos de `fancyzhx/ag_news`, 2 epocas, batch de 32 y una longitud maxima de secuencia de 128 tokens, y se completo en 1,6 minutos sobre una Tesla T4.

Su relevancia es fundamentalmente metodologica y docente: sirve como referencia reproducible para comparar estrategias de adaptacion (extraccion de caracteristicas con regresion logistica o MLP frente a ajuste fino completo) bajo un protocolo fijo de semilla, dependencias ancladas y un fichero YAML por experimento. No es un modelo pensado para produccion en decisiones sobre personas, y su autor lo declara explicitamente como material de investigacion y curso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only bidireccional (BERT-base), con cabeza de clasificacion de 4 clases |
| Parametros totales | 109.485.316 |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Parametros entrenables | 85.648.132 (78,23 % del total) |
| Longitud de contexto | 128 tokens configurados en entrenamiento; la arquitectura BERT-base admite hasta 512 posiciones |
| Tipos de cuantizacion | No disponible; el repo publica safetensors en precision completa (0,4 GB, consistente con fp32). El tag `text-embeddings-inference` sugiere compatibilidad con despliegue optimizado, sin cuantizaciones documentadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Dataset de entrenamiento | fancyzhx/ag_news (6.000 ejemplos) |
| Etiquetas de salida | World, Sports, Business, Sci/Tech |
| Libreria | transformers |
| Tamano del repositorio | 0,4 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

La arquitectura es un BERT-base estandar: 12 capas de encoder transformer con atencion bidireccional, hidden size de 768 y 12 cabezas de atencion. Sobre el cuerpo preentrenado se anade una cabeza de clasificacion secuencial inicializada desde cero que proyecta la representacion del token `[CLS]` a las cuatro clases de AG News. La innovacion no esta en la arquitectura, sino en el protocolo de adaptacion: se usaron dos grupos de parametros en el optimizador, con learning rate de 0,001 para la cabeza y 2e-05 para las capas del encoder. El autor senala que usar un unico learning rate para ambos grupos degrada silenciosamente este tipo de ejecuciones.

El entrenamiento se hizo sobre un subconjunto de AG News (6.000 ejemplos), con 2 epocas, batch size de 32, longitud maxima de 128 tokens y semilla fija 42. La matriz de embeddings se mantuvo congelada (23 M de los 110 M de parametros), una decision que el autor justifica indicando que no cambia nada medible a estos tamanos de dataset y ahorra memoria del optimizador. No se documenta uso de RLHF, DPO ni decodificacion especulativa: es un modelo discriminativo de clasificacion, no generativo. El proyecto fija semilla, dependencias ancladas y un YAML por experimento, de modo que configuracion, semilla y `requirements.txt` determinan por completo una ejecucion.

## Capacidades

- Clasificacion de texto en ingles en cuatro categorias: World, Sports, Business y Sci/Tech.
- Salida de etiqueta unica por documento, con puntuaciones de probabilidad por clase utilizables como umbral configurable.
- Inferencia sobre fragmentos cortos: el entrenamiento limito la secuencia a 128 tokens, lo que encaja con titulares y entradillas mas que con articulos completos.
- Extraccion de representaciones del encoder mediante la salida del token `[CLS]` o de los estados ocultos (util para reutilizar el cuerpo en otras tareas).
- Compatibilidad con la libreria `transformers` y con el pipeline `text-classification`, ademas del tag `endpoints_compatible` para despliegue como endpoint.
- No soporta *tool calling* ni *function calling*.
- No implementa agentes, razonamiento multi-paso ni modo de pensamiento.
- No tiene capacidades multimodales: ni vision, ni audio, ni generacion de texto libre.
- Multilingue: no. Solo ingles.

## Casos de uso

- Clasificacion de titulares en agregadores RSS: el modelo asigna cada entrada a World, Sports, Business o Sci/Tech con una ventana de 128 tokens, suficiente para titulares y sumarios, y con un coste de inferencia minimo al tratarse de un encoder de 110 M de parametros.
- Enrutado de contenido en un portal de noticias: las cuatro etiquetas permiten dirigir automaticamente cada pieza a la seccion correspondiente o activar reglas editoriales distintas segun la categoria predicha.
- Etiquetado asistido de corpus para entrenamiento: al alcanzar 91,45 de accuracy en test sobre AG News, resulta util como preanotador de grandes volumenes de texto ingles que despues se revisan manualmente, reduciendo el coste de anotacion.
- Filtrado previo en pipelines de moderacion o curación: descartar o priorizar documentos segun su tematica antes de pasarlos a un modelo mayor y mas caro, actuando como clasificador de primera etapa.
- Comparativa academica de estrategias de adaptacion: el propio proyecto publica ejecuciones comparables de regresion logistica sobre caracteristicas, MLP sobre caracteristicas y ajuste fino completo, lo que convierte al modelo en una linea base reproducible para cursos y trabajos de evaluacion.
- Clasificacion de prensa corporativa o boletines internos en ingles: separar comunicados financieros (Business) de notas tecnicas (Sci/Tech) o cobertura deportiva en un archivo documental.
- Senales para analisis de mercado: contar el volumen de noticias de la categoria Business frente a Sci/Tech en un flujo de noticias entrantes como indicador de atencion mediatica sectorial.

## Benchmarks y rendimiento

Resultados de evaluacion publicados por el autor (AG News, subconjunto de 6.000 ejemplos de entrenamiento):

| Metrica | Test | Validacion |
|---|---:|---:|
| loss | 28,15 | 27,88 |
| accuracy | 91,45 | 90,85 |
| macro_f1 | 91,22 | 90,81 |
| macro_precision | 91,31 | 90,91 |
| macro_recall | 91,19 | 90,83 |

Comparativa interna del proyecto entre metodos de adaptacion sobre la misma tarea y los mismos datos:

| Ejecucion | Metodo | Parametros entrenables | accuracy (test) |
|---|---|---:|---:|
| `agnews_feature_logreg_fast` | extraccion de caracteristicas + regresion logistica | 0 | 86,35 |
| `agnews_feature_logreg_mini` | extraccion de caracteristicas + regresion logistica | 0 | 84,20 |
| `agnews_feature_mlp_fast` | extraccion de caracteristicas + MLP | 0 | 89,35 |
| `agnews_feature_mlp_mini` | extraccion de caracteristicas + MLP | 0 | 87,10 |
| `agnews_full_fast` | ajuste fino completo (este modelo) | 85.648.132 | 91,45 |
| `agnews_full_mini` | ajuste fino completo | 85.648.132 | 83,40 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo discriminativo de clasificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,5-1 GB en fp32 (los pesos ocupan aproximadamente 0,44 GB) y menos de 0,3 GB en fp16 o int8. Cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. El autor entreno en una Tesla T4; tambien es viable en RTX 3060, RTX 4090, A100 o H100, aunque en estos ultimos el modelo infrautiliza el hardware.
- Ejecucion en CPU: totalmente viable para lotes moderados, dado el tamano del modelo y la secuencia corta de 128 tokens.
- GPU de consumo: si, cabe en cualquier tarjeta consumer moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: pipeline `text-classification` de `transformers`, `text-embeddings-inference` (segun el tag del repositorio y `endpoints_compatible`), ONNX Runtime para exportacion optimizada, y servicio propio con FastAPI o TorchServe. No se documentan recetas de vLLM, llama.cpp ni Ollama, y ninguno de ellos es la via natural para un encoder de clasificacion.
- Latencia y throughput: no disponibles. El unico dato temporal publicado es de entrenamiento (1,6 minutos para 2 epocas sobre 6.000 ejemplos en una Tesla T4).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `toyin88/u2t01-bert-agnews` (este) | 109.485.316 | 128 tokens de entrenamiento (BERT-base admite 512) | accuracy 91,45 / macro F1 91,22 en test (6.000 ejemplos de entrenamiento) | Apache 2.0 | HuggingFace, repo de 0,4 GB |
| Baselines del mismo proyecto (`agnews_feature_logreg_fast`, `agnews_feature_mlp_fast`) | 0 parametros entrenables en el encoder | 128 tokens | 86,35 y 89,35 de accuracy en test | No especificada en la informacion disponible | Resultados publicados en la model card; no se distribuyen como repos independientes |
| `mansoorhamidzadeh/ag-news-bert-classification` | No disponible | No disponible | No disponible | No disponible | HuggingFace |

El unico modelo comparable con datos verificables es el segundo clasificador BERT de AG News encontrado en la busqueda, del que no se han publicado especificaciones ni metricas en la informacion disponible, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Solo ingles, y ademas con un dominio de entrenamiento estrecho: AG News es prensa de agencia de 2004. El modelo rinde peor en redes sociales, en nombres fuera de las convenciones de Europa occidental y en cualquier entidad que cobrara relevancia despues de 2003.
- Entrenado con datos submuestreados (6.000 ejemplos), por lo que sus cifras quedan por debajo de los resultados publicados con el dataset completo. La comparacion interna entre metodos si es valida, porque todos vieron exactamente los mismos datos.
- Ejecucion unica con una sola semilla: repetir el entrenamiento con otra semilla mueve los resultados aproximadamente ±1-3 puntos. Diferencias menores que ese margen no son significativas.
- Sesgo heredado: `bert-base-uncased` arrastra las asociaciones de su corpus de preentrenamiento y nada en este proyecto las mitiga.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la clasificacion erronea con alta confianza, especialmente en textos fuera de dominio.
- No debe usarse para decisiones de produccion sobre personas, tal y como declara el propio autor.
- Limitacion de contexto: la secuencia de entrenamiento es de 128 tokens; alimentar documentos mas largos exige truncado o troceado, lo que puede perder la informacion tematica relevante.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el uso previsto declarado es investigacion y trabajo de curso, y el modelo base `bert-base-uncased` mantiene su propia licencia Apache 2.0.
- Repositorio con 0 descargas y 0 likes en el momento del analisis: no hay evidencia de adopcion ni de validacion independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toyin88/u2t01-bert-agnews
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Documentacion de HuggingFace para ajuste fino: https://huggingface.co/docs/transformers/training
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Clasificador BERT de AG News alternativo (sin metricas publicadas en la informacion disponible): https://huggingface.co/mansoorhamidzadeh/ag-news-bert-classification
- Repositorio GitHub de clasificacion de texto con BERT sobre AG News: https://github.com/AjNavneet/BERT-Text-Classification-AGNews
- PDF sobre deteccion de noticias falsas con BERT y LightGBM: https://ijsmt.org/wp-content/uploads/2026/05/AI-Enabled-Fake-News-Detection-using-BERT-Language-Model-and-Light-GBM-Classifier.pdf
- Referencia bibliografica citada por el autor: Tunstall, von Werra y Wolf, *Natural Language Processing with Transformers*, O'Reilly, capitulos 1-3 (sin enlace directo en la informacion disponible)
