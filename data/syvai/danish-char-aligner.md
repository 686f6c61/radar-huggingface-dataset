# syvai/danish-char-aligner

## Resumen

danish-char-aligner es un alineador forzado a nivel de carácter para danés, desarrollado por syvai. Dado un audio y su transcripción, devuelve un tiempo de inicio y fin para cada carácter en una rejilla de 20 ms, además de los intervalos por palabra y una puntuación de alineación. Resuelve el problema clásico del forced alignment con modelos CTC, que solo marcan cada carácter con un pico de 1-2 fotogramas y no pueden producir intervalos contiguos con finales de palabra precisos.

El modelo es un estudiante destilado de 12 capas a partir de Røst (CoRal-project/roest-v3-wav2vec2-315m), un modelo wav2vec2 CTC en danés. Conserva una de cada dos capas transformer de Røst y su front-end convolucional, reduciendo los parámetros de 315M a 164M (1,9x menos) manteniendo la misma tasa de fotogramas de 20 ms. Se entrena con tres pérdidas: destilación por divergencia KL, CTC sobre la transcripción y entropía cruzada por fotograma para una cabeza de etiquetado que predice qué carácter se pronuncia en cada fotograma.

Su relevancia reside en la precisión y velocidad: supera a Røst alineado por CTC en inicios de carácter dentro de 20 ms (87,1% frente a 79,9% en radio DR P1) y en finales de carácter (85,2% frente a 79,1%), y alcanza 2.670x tiempo real en una RTX 3090 con la ruta batched en fp16. Está publicado bajo licencia CC-BY-4.0 en HuggingFace con pesos en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (12 capas transformer, destilado de Røst, conserva capas impares 1-23 y front-end convolucional) + cabeza de etiquetado por fotograma |
| Parametros totales | 164.331.182 (164M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta ~30 s de audio por alineacion (recomendacion del autor) |
| Tipos de cuantizacion | no disponible (fp16 y bf16 usados en inferencia; fp32 en CPU) |
| Idiomas soportados | danes (da) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (0,3 GB) |

## Arquitectura y entrenamiento

El modelo es un estudiante de destilacion de Røst, un wav2vec2 CTC danes de 315M de parametros. Conserva una de cada dos capas transformer (1, 3, ..., 23) y el front-end convolucional del profesor, lo que mantiene la tasa de fotogramas de 20 ms y reduce el tamano a 164M de parametros. La innovacion clave es una cabeza de etiquetado por fotograma que predice que caracter se esta pronunciando en cada fotograma de 20 ms, entrenada sobre alineaciones de referencia a nivel de caracter.

Se entreno con tres perdidas simultaneas sobre el dataset danes `syvai/danish-asr-unified`: divergencia KL respecto a las posteriores por fotograma de Røst (destilacion), CTC sobre la transcripcion y entropia cruzada por fotograma para la cabeza de etiquetado. En inferencia, las etiquetas de la cabeza se alinean con la transcripcion mediante un paso Viterbi monotono (silencio - caracteres/espacios - silencio), lo que produce intervalos de caracter contiguos, incluidos los finales de palabra, algo que un modelo CTC puro no puede hacer. El numero total de tokens o horas de entrenamiento no esta disponible.

## Capacidades

- Alineacion forzada a nivel de caracter: tiempos de inicio y fin de cada caracter en una rejilla de 20 ms, con intervalos contiguos (cada caracter dura hasta que empieza el siguiente; los huecos entre palabras son intervalos de espacio).
- Alineacion a nivel de palabra: intervalos de inicio y fin por palabra derivados de los caracteres.
- Puntuacion de alineacion (media de log-probabilidad por fotograma a lo largo del camino de alineacion), util para verificar que la transcripcion coincide con el audio comparando transcripciones del mismo clip.
- Timado de letras y digitos (a-z, æ, ø, å, é, ü, 0-9, sin distincion de mayusculas); la puntuacion se omite.
- Acepta audio de cualquier tasa de muestreo (remuestreo automatico a 16 kHz).
- Procesamiento por lotes (`align_batch`) con agrupacion por longitud y batches de hasta 600 s de audio, con ruta fp16 acelerada con Triton en CUDA.
- Indice de cada caracter que apunta a la posicion en la transcripcion original.
- No es un modelo de transcripcion autonomo: requiere la transcripcion como entrada (no hace ASR libre).

## Casos de uso

- Subtitulado de precision para radio y television: al obtener tiempos por caracter y palabra en una rejilla de 20 ms, se pueden generar subtitulos con sincronizacion exacta; los resultados en radio DR P1 (dominio fuera de entrenamiento) muestran 87,1% de inicios dentro de 20 ms.
- Corpus linguisticos y foneticos: investigadores pueden construir corpus anotados a nivel de caracter o segmento sin alineacion manual, aprovechando la precision de finales de palabra (85,2% dentro de 20 ms frente al 60,9% de Røst por CTC).
- Validacion automatica de transcripciones: la puntuacion de alineacion detecta transcripciones erroneas (AUC 0,998 frente a texto de otro clip; 0,924 con 30% de palabras sustituidas), util para depurar pipelines de datos de audio-texto.
- Preparacion de datos para TTS: los intervalos por caracter y palabra sirven para entrenar modelos text-to-speech o voice cloning que requieren alineaciones fonema/caracter-audio de alta calidad.
- Indexacion y busqueda en archivos de audio: con marcas temporales por palabra se puede indexar archivos de radio (14,8 h de audio procesadas en ~20 s en RTX 3090) y permitir busqueda con salto temporal preciso.
- Analisis prosodico y del habla: la duracion por caracter y palabra permite estudiar ritmo, velocidad de habla y duraciones segmentales en danes.
- Sincronizacion audio-texto en aplicaciones educativas: resaltado karaoke o lectura guiada palabra a palabra en danes, gracias a los intervalos contiguos y al indice que apunta a la transcripcion original.
- Procesamiento masivo por lotes en produccion: `align_batch` con agrupacion por longitud permite procesar grandes volumenes de clips de forma eficiente en una sola GPU consumer.

## Benchmarks y rendimiento

Acuerdo con alineaciones de referencia a nivel de caracter en datos reservados. Røst se alinea con CTC; sus finales de caracter se toman como el inicio del siguiente dentro de la palabra y como fin de pico + 20 ms al final de palabra.

Radio DR P1 (fuera de dominio, 7.889 clips, 675.753 caracteres):

| Modelo | inicio ±20 ms | inicio ±40 ms | inicio ±100 ms | fin ±20 ms |
|---|---|---|---|---|
| Røst | 79,9% | 94,4% | 98,9% | 79,1% dentro de palabra, 60,9% final de palabra |
| danish-char-aligner | 87,1% | 94,7% | 97,9% | 85,2% (todos los caracteres) |

Lectura en voz alta reservada (CoRal read-aloud y Folketinget, 2.910 clips, 205.818 caracteres):

| Modelo | inicio ±20 ms | inicio ±40 ms | fin ±20 ms |
|---|---|---|---|
| Røst | 79,1% | 93,8% | 78,0% dentro de palabra, 56,3% final de palabra |
| danish-char-aligner | 86,1% | 93,5% | 84,6% (todos los caracteres) |

Deteccion de transcripcion erronea (1.035 clips P1; AUC de la puntuacion de alineacion, mayor es mejor):

| Modelo | texto de otro clip | 30% de palabras sustituidas |
|---|---|---|
| Røst | 0,991 | 0,940 |
| danish-char-aligner | 0,998 | 0,924 |

Velocidad (factor tiempo real):

| Configuracion | Factor |
|---|---|
| `align_batch`, RTX 3090, fp16, extremo a extremo | 2.670x |
| `align`, RTX 3090, bf16, forward, clip a clip | 910-960x (Røst: 820-860x) |
| `align`, CPU 12 hilos, fp32, forward | 23,8x (Røst: 15,2x) |
| `align`, CPU 1 hilo, fp32, forward | 5,4x (Røst: 3,4x) |

La ruta batched cubre forward, alineacion y construccion de salida con audio ya decodificado: 8.445 clips P1 (14,8 h) en unos 20 s. La precision de la ruta fp16 coincide con fp32 (86,75% de inicios dentro de 20 ms en ambas).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra exacta; el tamano del modelo es de 0,3 GB en fp32, por lo que en fp16 ocupa ~0,33 GB de pesos, mas activaciones. El parametro `batch_seconds=600` controla el uso de memoria en la ruta batched; reducirlo si se agota la VRAM.
- GPU recomendadas: cualquier GPU CUDA moderna; las mediciones publicadas usan una RTX 3090 (2.670x tiempo real con `align_batch` en fp16). La ruta rapida requiere Triton, incluido con PyTorch en Linux.
- Consumer GPUs: si, cabe holgadamente en GPUs consumer (RTX 3090 usada en las mediciones); tambien funciona en CPU (AMD Ryzen 5 7600X: 23,8x tiempo real con 12 hilos).
- Despliegue: libreria `transformers` de HuggingFace con el script `aligner.py` incluido en el repositorio (clase `Aligner`, con `align` y `align_batch`); uso por linea de comandos con `python aligner.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 14,8 h de audio en ~20 s en RTX 3090 (batched, fp16); 910-960x tiempo real clip a clip en GPU; 5,4x tiempo real en CPU con 1 hilo.

## Comparativa con modelos similares

| | danish-char-aligner | Røst v3 (profesor) | Modelos alternativos de forced alignment |
|---|---|---|---|
| Autor | syvai | CoRal-project | no disponible |
| Parametros | 164M | 315M | no disponible |
| Arquitectura | wav2vec2 destilado + cabeza de etiquetado por fotograma | wav2vec2 CTC | no disponible |
| Alineacion por caracter | Si (Viterbi monotono, intervalos contiguos) | Solo via CTC (picos de 1-2 fotogramas, finales imprecisos) | no disponible |
| Inicio ±20 ms (DR P1) | 87,1% | 79,9% | no disponible |
| Fin ±20 ms (DR P1) | 85,2% | 79,1% dentro de palabra / 60,9% final | no disponible |
| Velocidad GPU | 2.670x (batched fp16) | 820-860x (clip a clip) | no disponible |
| Licencia | CC-BY-4.0 | no disponible en la ficha | no disponible |
| Idioma | Danes | Danes | no disponible |

Como alternativa generalista multiidioma de forced alignment se puede mencionar conceptualmente WhisperX o MFA, pero no se dispone de datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- Solo danes: no hay soporte para otros idiomas; las letras timadas son a-z, æ, ø, å, é, ü y digitos 0-9; la puntuacion no se alinea.
- Requiere transcripcion: no es un modelo de ASR; si la transcripcion no coincide con el audio, la alineacion no es valida. La puntuacion de alineacion solo es comparable entre transcripciones del mismo clip, no entre clips distintos.
- Longitud maxima recomendada de ~30 s por alineacion; grabaciones largas deben segmentarse previamente.
- La ruta rapida `align_batch` en fp16 requiere CUDA y Triton (incluido con PyTorch en Linux); en otros entornos se usa la ruta lenta clip a clip.
- El rendimiento de finales de palabra de Røst por CTC es notablemente peor (56-61% dentro de 20 ms), lo que subraya que este modelo es la opcion adecuada si se necesitan finales de caracter precisos.
- No hay datos publicados sobre sesgos del modelo; al estar entrenado con datos daneses (radio DR P1, CoRal, Folketinget), el rendimiento puede variar con acentos, ruido de fondo o hablantes no representados en esos corpus.
- Riesgo de alucinacion: no aplicable en el sentido de generacion de texto, pero una transcripcion erronea produce alineaciones incorrectas sin aviso explicito salvo por la puntuacion de alineacion.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor; verificar los terminos de los datasets de entrenamiento para usos sensibles.
- Caveat de precision en fp16: la ruta batched mantiene la misma precision que fp32 segun el autor (86,75% de inicios dentro de 20 ms), pero conviene validar en el dominio propio antes de produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syvai/danish-char-aligner
- Modelo base (Røst v3): https://huggingface.co/CoRal-project/roest-v3-wav2vec2-315m
- Dataset de entrenamiento: https://huggingface.co/datasets/syvai/danish-asr-unified
