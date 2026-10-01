# yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-false_seed-456

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-false_seed-456` es un ajuste fino de tipo encoder orientado a la desambiguacion del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. Lo publica el usuario yuriilaba, vinculado a la Ukrainian Catholic University (UCU), y parte del modelo multilingue `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, que a su vez se apoya en la arquitectura XLM-RoBERTa. Cuenta con 278.043.648 parametros (aproximadamente 278 millones) distribuidos en un transformer encoder de 12 capas y 768 dimensiones ocultas.

El problema que aborda es concreto: dado un contexto oracional y una palabra objetivo, determinar cual de sus acepciones esta activa. El autor reporta una exactitud de WSD de 0,9208 sobre su conjunto de evaluacion, ademas de mantener una calidad de similitud semantica notable (Pearson 0,8088 y Spearman 0,7988 en tareas STS), lo que indica que el ajuste no ha degradado en exceso la representacion general del modelo base.

Es relevante ahora porque los recursos de WSD para lenguas eslavas orientales con pocos datos anotados siguen siendo escasos, y este modelo demuestra que un ajuste fino sobre tripletes generados de forma semisupervisada puede alcanzar un rendimiento alto sin necesidad de anotacion masiva. La variante forma parte de una familia de experimentos del mismo autor con distintas semillas y configuraciones de pooling, lo que la convierte en un punto de referencia reproducible para investigacion en procesamiento del lenguaje natural ucraniano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa, base de sentence-transformers/paraphrase-multilingual-mpnet-base-v2) |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura base XLM-RoBERTa admite 512 tokens como maximo |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (el tamano de 1,1 GB es coherente con precision fp32) |
| Idiomas soportados | no indicado de forma explicita; el ajuste fino se declara para ucraniano y el modelo base es multilingue |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de la familia XLM-RoBERTa en su variante mpnet-base, reutilizada a traves del modelo `paraphrase-multilingual-mpnet-base-v2`. El ajuste se realiza sobre una tarea de tripletes (ancla, positivo, negativo), el esquema tipico de entrenamiento contrastivo de sentence-transformers, lo que explica que el modelo conserve metricas de similitud semantica de texto (STS) ademas de la tarea principal de desambiguacion. El autor indica que el pooling sobre el token objetivo esta desactivado (`target-token pooling: False`), es decir, la representacion se construye sin forzar la atencion sobre la posicion de la palabra a desambiguar.

Los datos de entrenamiento provienen del fichero `triplets_generation_all_combined_16_samples.csv`, un conjunto de tripletes generado de forma semisupervisada con 16 muestras por instancia. No se especifica el numero total de tripletes, el volumen de tokens ni la composicion linguistica del corpus. La semilla de entrenamiento es 456 y la semilla de particion de validacion es 42, lo que permite reproducir la particion de datos. No se menciona el uso de RLHF ni de DPO, algo esperable en un modelo de este tipo y tamano. La innovacion metodologica destacable es precisamente el pipeline de generacion semisupervisada de tripletes para WSD, mas que una modificación arquitectonica.

## Capacidades

- Desambiguacion del sentido de palabras (WSD) en ucraniano, con una exactitud reportada de 0,9208 en la evaluacion del autor.
- Generacion de embeddings de frases y oraciones: el modelo conserva el comportamiento de sentence-transformers y produce vectores normalizados de 768 dimensiones.
- Similitud semantica textual (STS): Pearson 0,8088 y Spearman 0,7988 sobre el conjunto evaluado.
- Recuperacion semantica y ranking por similitud coseno, derivados de su naturaleza de encoder de frases.
- Capacidades multilingues heredadas del modelo base (entrenado sobre corpus multilingues), aunque el ajuste fino se ha realizado especificamente sobre datos en ucraniano.
- Evaluacion MTEB a nivel de tarea: el autor indica que los resultados completos estan en `evaluation/mteb_results/` del repositorio.
- No hay evidencia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision o audio: es un modelo encoder de representacion, no un modelo generativo instruccional.
- No dispone de modo de razonamiento explicito (thinking mode) ni de salida de texto libre.

## Casos de uso

- Desambiguacion lexica en pipelines de procesamiento del lenguaje natural ucraniano: el modelo se integra como clasificador de acepciones sobre contextos oracionales, aprovechando su exactitud de 0,9208 para alimentar diccionarios o tesauros computacionales.
- Enriquecimiento de corpus para linguistica computacional: anotacion automatica de sentidos en grandes colecciones textuales antes de entrenar otros modelos dependientes de sentido (traduccion automatica, analisis de sentimiento a nivel de aspecto).
- Recuperacion semantica en buscadores en ucraniano: al generar embeddings de 768 dimensiones, permite indexar documentos y consultas en un espacio vectorial y devolver resultados por similitud coseno.
- Deduplicacion y agrupacion de contenidos: la componente STS del modelo permite detectar parafrasis y near-duplicates en corpus ucranianos, con umbrales calibrados sobre Pearson 0,8088.
- Sistemas de traduccion asistida: la desambiguacion previa de la palabra origen reduce errores de seleccion lexica en traductores automaticos y en herramientas de memoria de traduccion.
- Filtrado y clasificacion de resenas o comentarios: usando embeddings de frase es posible agrupar opiniones por tematica y detectar el sentido concreto de terminos polisemicos frecuentes.
- Investigacion academica reproducible: al publicar semillas y ficheros de evaluacion, el modelo sirve como linea base comparable frente a otras variantes de la misma familia (`aug16-generation_pt-false_seed-123`, etc.).
- Evaluacion de representaciones multilingues: el modelo puede emplearse como punto de control en estudios sobre transferencia entre lenguas, comparando su rendimiento en ucraniano con el del modelo base original.

## Benchmarks y rendimiento

| Tarea | Metrica | Valor |
|---|---|---|
| WSD (desambiguacion del sentido de palabras) | Exactitud | 0,9208 |
| STS (similitud semantica textual) | Pearson | 0,8088 |
| STS (similitud semantica textual) | Spearman | 0,7988 |

El autor indica que los resultados completos a nivel de tarea de MTEB estan disponibles en el directorio `evaluation/mteb_results/` del repositorio. No se facilitan en la informacion disponible resultados comparativos frente a otros modelos, ni el desglose por subconjunto de MTEB. No se han publicado en la informacion disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada: en fp32, los pesos ocupan aproximadamente 1,1 GB; con activaciones y buffers de inferencia, el consumo tipico se situa entre 2 y 3 GB. En fp16 el peso se reduce a unos 560 MB, con un consumo total en torno a 1,5-2 GB.
- Caben holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060, RTX 4090, GTX 1660 Super (6 GB) e incluso GPU integradas con memoria compartida.
- Inferencia en CPU viable: 278 millones de parametros sobre XLM-RoBERTa permiten procesar lotes pequenos en CPU moderna con latencias de decenas de milisegundos por secuencia, aunque no se han publicado cifras concretas.
- GPU recomendadas para despliegue con alto throughput: NVIDIA A10, L4, T4, A100 o H100 cuando se necesita procesar grandes volumenes de tripletes o indexar corpus extensos.
- Opciones de despliegue: `sentence-transformers`, `transformers` (PyTorch), exportacion a ONNX Runtime y TorchScript, y servicios de embeddings como Hugging Face Text Embeddings Inference (TEI). No es un modelo adecuado para vLLM ni llama.cpp, ya que no es un modelo generativo autorregresivo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ucu-wsd-aug16-generation_all_combined_pt-false_seed-456 | 278 M | no disponible (base: 512 tokens) | WSD 0,9208; STS Pearson 0,8088 | no disponible | Hugging Face, 0 descargas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 | 278 M | 512 tokens | no disponible en esta busqueda | Apache-2.0 (licencia del modelo base; no confirmada para el derivado) | Hugging Face, ampliamente utilizado |
| yuriilaba/ucu-wsd-aug16-generation_pt-false_seed-123 | no disponible | no disponible | no disponible | no disponible | Hugging Face (variante de la misma familia con otra semilla) |
| yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-456 | no disponible | no disponible | no disponible | no disponible | Hugging Face (variante de la misma familia) |

No se dispone de resultados comparativos publicados entre estas variantes ni frente a otros sistemas de WSD para ucraniano en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin licencia explicita no puede asumirse permiso para uso comercial ni para redistribucion; es imprescindible contactar con el autor antes de integrarlo en produccion.
- Modelo sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificacion independiente de los resultados reportados.
- Los resultados de WSD (0,9208) y STS (Pearson 0,8088) proceden del propio autor y de su propio conjunto de evaluacion; el conjunto `triplets_generation_all_combined_16_samples.csv` se genero de forma semisupervisada, con el riesgo de sesgo y de fuga de informacion que ello conlleva.
- Riesgo de alucinacion bajo: al ser un encoder de representaciones, no genera texto libre, pero puede asignar alta similitud a pares semanticamente incorrectos en dominios alejados de los datos de entrenamiento.
- Limitacion idiomatica: el ajuste se ha realizado sobre ucraniano; el rendimiento en otras lenguas, aunque el modelo base sea multilingue, no esta documentado y previsiblemente sera inferior.
- Limitacion de contexto: la arquitectura XLM-RoBERTa procesa como maximo 512 tokens, lo que impide desambiguar palabras cuyo sentido dependa de contextos mas extensos que un parrafo corto.
- Sesgos: al derivar de un corpus multilingue de origen web, puede reproducir sesgos de genero, nacionalidad o registro presentes en los datos; no se ha publicado ninguna evaluacion de sesgo.
- Metadatos del repositorio con fechas de creacion y actualizacion en 2026, lo que puede indicar un repositorio de caracter experimental o de investigacion en curso.
- No apto como modelo conversacional: no soporta instrucciones, tool calling ni generacion de codigo; usarlo para esas tareas daria resultados deficientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_all_combined_pt-false_seed-456
- Variante con otra semilla: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_pt-false_seed-123
- Variante de la misma familia: https://huggingface.co/yuriilaba/ucu-wsd-generation_all_combined_pt-false_seed-456
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Perfil de Google Scholar del autor: https://scholar.google.com/citations?user=FbZQ5okAAAAJ&hl=en
- Resultados MTEB: directorio `evaluation/mteb_results/` dentro del repositorio del modelo
