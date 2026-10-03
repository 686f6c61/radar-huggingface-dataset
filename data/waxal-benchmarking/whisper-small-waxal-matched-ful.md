# waxal-benchmarking/whisper-small-waxal-matched-ful

## Resumen

`whisper-small-waxal-matched-ful` es un ajuste fino de `openai/whisper-small` (241.734.912 parametros efectivos segun los pesos safetensors del repositorio) sobre el split de entrenamiento del corpus WAXAL en la lengua fula (`ful`). No es un modelo destinado a produccion: el propio autor lo etiqueta como una ablacion de investigacion dentro del benchmark WAXAL ASR, y advierte explicitamente de que el modelo recomendado para fula es otra variante del mismo proyecto.

Su funcion es metodologica. El modelo se entrena con exactamente la misma receta que `whisper-small-waxal-loo-ful` (el modelo leave-one-out que excluye 18 lenguas y no ha visto fula), de modo que la comparacion entre "entrenado en fula" y "entrenado en las otras 18 lenguas" se realiza bajo condiciones controladas. Sobre el split de test de fula, esta variante obtiene un WER de 56,0 y un CER de 23,1 frente al 131,7 / 77,6 del modelo leave-one-out, con 2391 enunciados evaluados.

La relevancia del modelo es acotada pero clara para quien trabaja en ASR de bajos recursos: forma parte del conjunto de 78 modelos Whisper (Tiny y Small) del benchmark WAXAL para 19 lenguas africanas, publicado con licencia Apache-2.0, y sirve como referencia reproducible para medir cuanto aporta el ajuste especifico de lengua frente a la transferencia multilingue. Fuera de ese contexto experimental, su tasa de error lo inhabilita para transcripcion automatica fiable sin supervision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper, tipo secuencia a secuencia sobre espectrograma log-mel) |
| Parametros totales | 241.734.912 (etiquetado como 244M en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (formato estandar de Whisper); limite de 448 tokens en el decodificador |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, entrenamiento en fp16) |
| Idiomas soportados | fula (`ful`) unicamente; el modelo no usa token de idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 1,0 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-small`: un transformer encoder-decoder de 12 capas de encoder y 12 de decoder, con representacion de 768 dimensiones y 12 cabezas de atencion, que consume un espectrograma log-mel de 80 canales calculado sobre audio mono a 16 kHz y procesa ventanas de 30 segundos. El ajuste fino es completo, no parametrizado de forma eficiente: segun el benchmark WAXAL, los modelos Whisper se entrenan actualizando todos los pesos.

El entrenamiento utiliza todas las emisiones en fula del split de train de `google/WaxalNLP`. Las transcripciones se normalizan a NFC, se convierten a minusculas, se elimina la puntuacion y se preservan los diacriticos; las etiquetas de mas de 448 tokens se truncan. La receta, identica a la del modelo leave-one-out, emplea 4000 pasos con AdamW, learning rate de 1e-5, 200 pasos de calentamiento, batch size de 16, precision fp16 y una unica GPU NVIDIA H200.

La decision de diseno mas relevante es negativa: el modelo no recibe token de idioma en la decodificacion, igual que su contraparte leave-one-out. Esto elimina la posibilidad de que el modelo infiera la lengua objetivo desde una etiqueta explicita y aisla el efecto de los datos de entrenamiento, que es justamente lo que la ablacion pretende medir. La evaluacion se realiza con decodificacion greedy sobre el split de test completo de fula, con WER y CER calculados mediante `jiwer` sobre texto normalizado en NFC, en minusculas y con diacriticos preservados.

## Capacidades

- Reconocimiento automatico de voz monolingue en fula, sobre audio mono a 16 kHz.
- Transcripcion por ventanas de 30 segundos con decodificacion greedy.
- Salida en minusculas, sin puntuacion y con diacriticos preservados, coherente con la normalizacion aplicada en entrenamiento.
- No dispone de soporte de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio-visual; es un modelo exclusivamente de voz a texto.
- No fue ajustado para traduccion de voz; la tarea entrenada es transcripcion.
- Multilingue: no. El unico idioma entrenado y evaluado es el fula.
- No dispone de modo de razonamiento explicito ni de etapas de RLHF o DPO posteriores.

## Casos de uso

- Investigacion en ablaciones de cobertura linguistica: este modelo es la condicion "solo fula" del diseno experimental del benchmark WAXAL y su uso natural es comparar su WER de 56,0 con el 131,7 del modelo leave-one-out para cuantificar el valor de los datos en la lengua objetivo.
- Linea base en publicaciones de ASR de bajos recursos: al compartir receta con el modelo leave-one-out y con los modelos por lengua, permite reportar cifras comparables sin reentrenar desde cero.
- Diagnostico de corpus: comparar sus hipotesis contra las transcripciones de referencia del split de fula ayuda a localizar segmentos anomalos, normalizaciones inconsistentes o transcripciones problematicas en `google/WaxalNLP`.
- Punto de partida para ajuste de dominio: con 241,7M de parametros y licencia Apache-2.0, sirve como inicializacion barata para un ajuste posterior con datos especificos de un dominio concreto (radio, sanidad, agricultura) antes de desplegar nada.
- Indexacion asistida de archivo sonoro con revision humana: en un flujo donde un anotador corrige la salida, el modelo puede predecir transcripciones aproximadas para busqueda por palabra clave, asumiendo que el 56% de WER exige revision sistematica.
- Estudio de normalizacion de texto y diacriticos: su salida sin puntuacion y en minusculas, con diacriticos preservados, es un objeto de estudio util para investigar como afectan las decisiones de normalizacion a las metricas WER y CER en lenguas africanas.
- Evaluacion de robustez de codificadores multilingues en lenguas africanas: al ser una ablacion controlada, permite medir hasta que punto un codificador entrenado mayoritariamente en otras lenguas transfiere a fula.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test de fula, con decodificacion greedy, WER y CER calculados con `jiwer` sobre texto normalizado en NFC, en minusculas y con diacriticos preservados. Enunciados de test evaluados: 2391.

| Configuracion | WER | CER |
|---|---|---|
| Leave-Fula-out (18 otras lenguas, misma receta) | 131,7 | 77,6 |
| Este modelo (solo fula, misma receta) | 56,0 | 23,1 |
| Whisper-Small por lengua publicado (receta del benchmark) | 42,6 | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K y similares no aplican a un modelo de reconocimiento de voz) en la informacion disponible. No se dispone de cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB solo para los pesos en fp16 y en torno a 1-1,5 GB contando activaciones y buffers si se procesan ventanas completas de 30 segundos; en fp32 los pesos rondan 1 GB.
- GPU recomendadas: entrenamiento validado en 1x NVIDIA H200. Para inferencia basta cualquier GPU con 2 GB o mas de memoria; no requiere A100 ni H100.
- Cabe en GPU de consumo: si, de forma holgada. Funciona en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 o incluso gamas inferiores con 4 GB de VRAM.
- Inferencia en CPU: viable por el tamano del modelo, especialmente con runtimes optimizados para CPU.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria indicada en la model card); `vLLM` soporta modelos Whisper encoder-decoder; `faster-whisper` (CTranslate2) y `whisper.cpp` requieren conversion previa de los pesos, no incluida en el repositorio; `Ollama` y `TGI` no ofrecen soporte nativo para esta arquitectura.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER en fula | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `waxal-benchmarking/whisper-small-waxal-matched-ful` | 241,7M | 30 s | 56,0 | Apache-2.0 | HuggingFace |
| `waxal-benchmarking/whisper-small-waxal-loo-ful` | 241,7M | 30 s | 131,7 | Apache-2.0 | HuggingFace |
| `waxal-benchmarking/whisper-small-waxal-ful` (modelo recomendado por el autor) | 241,7M | 30 s | 42,6 (receta del benchmark) | Apache-2.0 | HuggingFace |
| `openai/whisper-small` (modelo base) | 244M | 30 s | no disponible | Apache-2.0 | HuggingFace |

El benchmark WAXAL tambien evalua alternativas como MMS-300M y Whisper Tiny, pero no se han proporcionado cifras concretas de esos modelos para fula en la informacion disponible.

## Limitaciones y advertencias

- El propio autor indica que es una ablacion de investigacion y no el modelo recomendado para fula; para uso real remite a `whisper-small-waxal-ful`.
- Un WER de 56,0 implica que mas de la mitad de las palabras se transcriben incorrectamente en el split de test, lo que descarta el uso sin supervision humana.
- La salida se genera en minusculas y sin puntuacion, por lo que no es apta para flujos que requieran texto formateado listo para publicacion.
- Sin token de idioma, el modelo no puede conmutar a otra lengua; cualquier audio que no sea fula queda fuera de su ambito de entrenamiento.
- Riesgo de alucinacion: como cualquier modelo Whisper, puede generar texto plausible en segmentos con ruido, silencio o musica, especialmente al estar ajustado en un unico dominio.
- Audio de mas de 30 segundos debe segmentarse manualmente; el modelo no gestiona contexto largo de forma nativa.
- Las etiquetas de entrenamiento de mas de 448 tokens se truncaron, por lo que las emisiones muy largas pueden presentar degradacion sistematica.
- Sesgos: el corpus WAXAL y su reparto por hablantes, dominios y variedades dialectales del fula condicionan el rendimiento; no se documentan analisis de sesgo por genero, edad o procedencia en la informacion disponible.
- Licencia Apache-2.0, permisiva para uso comercial, pero la idoneidad tecnica del modelo por su tasa de error es la restriccion real, no la licencia.
- El identificador de arXiv citado (2606.02375) procede de la documentacion del autor y no se ha verificado de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-matched-ful
- Modelo recomendado para fula por el autor: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-ful
- Modelo leave-one-out de referencia: https://huggingface.co/waxal-benchmarking/whisper-small-waxal-loo-ful
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset de entrenamiento: https://huggingface.co/datasets/google/WaxalNLP
- Paper del benchmark WAXAL: https://arxiv.org/abs/2606.02375
- Version HTML del paper: https://arxiv.org/html/2606.02375v1
- Paper Ethio-ASR, entrenado sobre WAXAL: https://arxiv.org/html/2603.23654v1
- Lynguallabs: https://lynguallabs.org/
- Open Token: https://opentoken.global/
- Pagina de impacto de Open Token (coleccion de modelos WAXAL): https://opentoken.global/impact
- CMU Africa: https://www.africa.engineering.cmu.edu/
- Analisis de datos sinteticos para lenguas africanas (Afriklang): https://afriklang.com/blog/synthetic-speech-data-for-african-languages-what-clear-global-s-18-month-study
