# Tabahi/CUPE-3-mls7

## Resumen

CUPE-3-mls7 (internamente `p3cupe`) es un codificador fonético convolucional sin contexto desarrollado por Tabahi, diseñado especificamente para alineamiento forzado (forced alignment) y segmentacion de fonemas sobre audio de habla. No es un modelo generativo ni un LLM: produce, cada 5 ms, una distribucion de probabilidad sobre un inventario de 66 fonemas mas un simbolo de silencio, y las fronteras entre fonemas se obtienen aplicando un decodificador de Viterbi segmentario sobre la secuencia de fonemas conocida de antemano. Con 13,5 millones de parametros y un campo receptivo de solo 38,9 ms por frame, es un componente ligero y especializado que se integra en pipelines de reconocimiento y segmentacion fonetica.

La variante `mls7` es la unica de la familia CUPE v3 entrenada de forma multilingue: se calibro durante una epoca sobre 700 horas de Multilingual LibriSpeech (100 horas por idioma en aleman, espanol, frances, italiano, neerlandes, polaco y portugues, sin ingles) y se inicializo a partir del checkpoint ingles `Tabahi/CUPE-3-en-base`. La evaluacion publicada es exclusivamente sobre TIMIT en ingles, de modo que mide la precision de fronteras que sobrevivio al entrenamiento multilingue, no la calidad del alineamiento en los siete idiomas.

La relevancia actual es doble. Por un lado, el modelo esta marcado por su autor como sustituido por la familia `p4mbfa` (etiquetas estandar G2P, mas idiomas), por lo que se conserva unicamente por compatibilidad con el pipeline `ph66` de BFA. Por otro, su interes tecnico esta en el enfoque: entrenamiento sin etiquetas de frontera (solo distribuciones de fonemas), objetivos suaves y un decodificador acustico con bonus de onset, lo que reduce la dependencia de anotaciones temporales costosas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN convolucional sin contexto (encoder fonetico), frames de 5 ms |
| Parametros totales | 13.544.596 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (campo receptivo de 38,9 ms por frame; ventanas de audio de 120 ms con paso de 80 ms) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | aleman (de), espanol (es), frances (fr), italiano (it), neerlandes (nl), polaco (pl), portugues (pt) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors (repo), checkpoint PyTorch Lightning en formato pickle (`.ckpt`) |
| Cabezas de salida | fonemas ph66 (67 clases, indice 0 = SIL, la ultima ranura `noise` no se entrena) y grupos foneticos (17 clases) |
| Tamano del repo | 0,1 GB |
| Frecuencia de muestreo | 16 kHz |
| Frames de salida | uno cada 5 ms (stride de 1280 muestras) |

## Arquitectura y entrenamiento

El modelo es un codificador convolucional de tipo CNN sin mecanismo de atencion ni contexto global: cada frame de salida predice una distribucion sobre los 67 fonemas viendo como mucho 120 ms de audio, con un campo receptivo efectivo de 38,9 ms. Se generan dos cabezas en paralelo, una de fonemas ph66 y otra de 17 grupos foneticos. El proceso de ventanas (`slice_windows` con ventanas de 16000 muestras, 120 frames y 80 frames de paso) y su posterior cosido (`stitch_windows`) permiten procesar audio de duracion arbitraria manteniendo la coherencia entre ventanas.

El entrenamiento se realizo sobre MLS_7l_100h (700 horas en total, 100 por idioma, sin ingles) durante una sola epoca, con `noise_level` 0,01 y pesos de la variante inglesa `CUPE-3-en-base`. Se usaron objetivos suaves (`soft_target_mix` 1.0), `min_phone_frames` 6, `soft` 4, `onset bonus` 30 y `ramp` 3. No existen etiquetas de frontera fuera del ingles, por lo que el modelo aprende a colocar limites de forma implicita a partir de las distribuciones de fonemas y de un decodificador de Viterbi segmentario. El checkpoint publicado corresponde al experimento `pa07a`, epoca 0, seleccionado sobre la mitad `tune` de TIMIT con la metrica `lev_f1_25ms` y re-evaluado con el decodificador final. Las epocas posteriores empeoraron en TIMIT (73,74 en la epoca 1 y 71,70 en la 4), por lo que no se publicaron.

## Capacidades

- Reconocimiento de fonemas: salida de distribuciones de probabilidad sobre 66 fonemas mas silencio a 5 ms por frame.
- Segmentacion fonetica: colocacion de fronteras entre fonemas mediante Viterbi segmentario sobre una secuencia de fonemas conocida.
- Alineamiento forzado: alineacion de una transcripcion fonetica dada a la senal de audio, con decodificador configurable (minimo 6 frames mas 10 frames suaves y bonus de onset log-mel de 30,0).
- Clasificacion en 17 grupos foneticos como senal auxiliar.
- Multilingue en siete idiomas europeos (de, es, fr, it, nl, pl, pt); sin soporte de ingles en el entrenamiento de esta variante.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso: es un modelo puramente discriminativo y acustico.
- Capacidad de procesar audio largo por ventanas con cosido de logits.

## Casos de uso

- Alineamiento forzado para corpus de habla: dado un audio y su transcripcion convertida a ph66, el modelo produce marcas temporales por fonema a resolucion de 5 ms, util para construir corpus anotados y datasets de TTS.
- Anotacion fonetica de material multilingue: con 700 horas de entrenamiento repartidas entre siete idiomas, permite segmentar audios en aleman, espanol, frances, italiano, neerlandes, polaco y portugues sin reentrenar.
- Preprocesado de pipelines de sintesis de voz: las fronteras y duraciones por fonema alimentan modelos de TTS y de duracion prosodica; el modelo es lo bastante pequeno (13,5 M de parametros) para ejecutarse en CPU.
- Verificacion de pronunciacion: comparando la secuencia fonetica esperada con la alineacion obtenida, se pueden detectar inserciones, omisiones o desviaciones en el habla de un estudiante o de un sistema.
- Investigacion en fonetica computacional: la salida a 5 ms y el decodificador configurable permiten estudiar la relacion entre posteriores y fronteras reales, asi como medir el efecto del bonus de onset.
- Integracion en herramientas de evaluacion de ASR: alinear la hipotesis del reconocedor contra el audio para localizar errores a nivel de fonema y evaluar modelos de reconocimiento.
- Compatibilidad con el pipeline BFA: el autor mantiene esta variante por su utilidad en el flujo `ph66`, por lo que sirve como componente heredado en sistemas ya construidos sobre esa convencion de etiquetas.

## Benchmarks y rendimiento

Los unicos resultados publicados son sobre TIMIT en ingles (400 clips no vistos en entrenamiento, divididos en `tune` y `holdout`). La metrica `lev_f1_25ms` es la F1 de fronteras foneticas con tolerancia de 25 ms; `phone_hit_25ms` es la proporcion de fonemas cuyo inicio cae dentro de 25 ms.

| Metrica | Valor |
|---|---|
| `timit_lev_f1_25ms_tune` | 74,79 |
| `timit_lev_f1_25ms_holdout` | 74,15 |
| `timit_lev_f1_25ms_bonus0_holdout` | 70,89 |
| `timit_phone_hit_25ms_bonus0_holdout` | 71,11 |
| `timit_phone_hit_25ms_holdout` | 66,41 |

No se han publicado resultados de benchmarks en los siete idiomas de entrenamiento ni comparaciones con modelos de alineamiento de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para pesos en FP32 (13,5 M de parametros); el modelo se ejecuta sin problema en CPU, como muestra el ejemplo de la model card (`device="cpu"`).
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el modelo no aprovecha GPUs de gama alta como A100 o H100 por su tamano, salvo para procesar grandes lotes en paralelo.
- Cabe en cualquier GPU de consumo: GTX 1050, RTX 3060, RTX 4090, etc. Tambien en CPU y en entornos embebidos.
- Opciones de despliegue: el codigo propio del repositorio `p3cupe/` (extraccion, ventaneo y alineamiento) sobre PyTorch; no se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El procesamiento por ventanas de 120 ms con paso de 80 ms y frames de 5 ms sugiere baja latencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Enfoque | Licencia | Notas |
|---|---|---|---|---|---|
| CUPE-3-mls7 (este) | 13,5 M | de, es, fr, it, nl, pl, pt | CNN sin contexto, alineamiento forzado ph66 | AGPL-3.0 | Sustituido por p4mbfa |
| CUPE-3-en-base | no disponible | en | CNN sin contexto, mismo enfoque | no disponible | Checkpoint del que se inicializo mls7 |
| p4mbfa (`Tabahi/mbfa-<grupo>`) | no disponible | muchos idiomas | Etiquetas estandar G2P | no disponible | Sucesor declarado por el autor |

No se dispone de datos de benchmarks comparativos con otros alineadores forzados (por ejemplo, Montreal Forced Aligner o wav2vec2-based aligners) en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Modelo marcado como sustituido por `p4mbfa`; se mantiene solo por compatibilidad con el pipeline `ph66` de BFA y no recibira mejoras.
- La evaluacion publicada es unicamente en ingles (TIMIT); no hay evidencia cuantitativa de la calidad del alineamiento en los siete idiomas entrenados.
- Requiere conocer la secuencia de fonemas de antemano: no transcribe audio por si mismo, solo alinea una transcripcion fonetica dada.
- No soporta ingles en esta variante (entrenada sin ingles), aunque herede pesos de un modelo ingles.
- La ranura `noise` del inventario ph66 nunca se entrena, lo que puede afectar a la calibracion en audio con ruido o eventos no foneticos.
- `phone_hit_25ms_holdout` de 66,41 % indica que un tercio de los inicios de fonema quedan fuera de la tolerancia de 25 ms; no es adecuado para tareas que exijan precision subfonemica estricta.
- Riesgo de alineamientos erroneos en habla espontanea, con acentos no representados en MLS o con solapamiento de hablantes; MLS es predominantemente lectura de libros.
- La licencia AGPL-3.0 impone obligaciones de distribucion del codigo fuente si el modelo se ofrece como servicio en red; conviene revisar el cumplimiento antes de un despliegue comercial.
- El checkpoint `.ckpt` es un pickle de PyTorch Lightning: solo debe cargarse desde el repositorio oficial por riesgo de ejecucion de codigo.
- No se documentan sesgos demograficos ni de acento; al entrenarse sobre MLS, la representacion de variedades dialectales es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tabahi/CUPE-3-mls7
- Checkpoint base ingles: https://huggingface.co/Tabahi/CUPE-3-en-base
- Codigo (directorio `p3cupe/`): https://github.com/tabahi/bfa_models
- Sucesor declarado: `Tabahi/mbfa-<language group>` (referenciado en la model card, sin URL directa en la informacion disponible)
