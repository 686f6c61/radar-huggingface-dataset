# Steveeeeeeen/gemma-audio-asr-en-smoke-20261015-v7

## Resumen

Gemma audio English ASR es un modelo de reconocimiento automatico del habla (ASR) en ingles publicado por el usuario Steveeeeeeen en HuggingFace. Se trata de una implementacion limpia, en la libreria `transformers`, de la arquitectura descrita por QUAN-Transcribe-1.0: una combinacion aprendida de 13 estados de audio de Gemma, convolucion depthwise causal, seis capas Transformer de 768 dimensiones a modo de lector y un clasificador CTC sobre el vocabulario de tokens de Gemma. El repositorio ocupa 2,5 GB y se distribuye en formato `safetensors` bajo licencia Apache-2.0.

El modelo no es un Gemma completo: parte de `google/embeddinggemma-2` y solo ajusta sus dos ultimos bloques de audio, mientras que el lector Transformer se entrena desde cero para ingles. No reutiliza los pesos vietnamitas de QUAN ni su codigo de inferencia. El vocabulario de entrenamiento contiene 56 695 tokens de Gemma mas los simbolos blank y unknown, y la seleccion de datos se hizo a partir de metadatos de duracion del dataset `espnet/yodas-granary`, apuntando a aproximadamente 1 000 horas.

Es relevante ahora como ejemplo de arquitectura hibrida encoder-decoder CTC aplicada a ASR con inicializacion parcial desde un modelo multimodal, y por su compatibilidad declarada con endpoints. Conviene senalar que el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, y que el propio autor califica los resultados como experimentales: no hay puntuaciones publicadas en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: mezcla aprendida de 13 estados de audio de Gemma + convolucion depthwise causal + lector Transformer de 6 capas y 768 dimensiones + clasificador CTC sobre tokens de Gemma |
| Parametros totales | no disponible (el repositorio ocupa 2,5 GB, pero no se desglosa el numero de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; no se especifica ventana de audio ni longitud de secuencia) |
| Tipos de cuantizacion | no disponible; solo se publican pesos en `safetensors` (no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura combina componentes de audio de Gemma con un lector Transformer propio. Los 13 estados de audio de Gemma se combinan mediante una mezcla aprendida, seguida de una convolucion depthwise causal que preserva la direccion temporal de la senal. Sobre esa representacion se apilan seis capas Transformer de 768 dimensiones que actuan como lector, y la salida se proyecta a un clasificador CTC sobre el vocabulario de tokens de Gemma (56 695 tokens mas blank y unknown). Se trata, por tanto, de un esquema CTC no autorregresivo, no de un decoder generativo tipo seq2seq.

En cuanto al entrenamiento, solo se ajustan los dos ultimos bloques de audio de `google/embeddinggemma-2`; el lector se entrena desde cero especificamente para ingles. La seleccion de datos se basa en metadatos de duracion de `espnet/yodas-granary` y apunta a unas 1 000 horas, con los registros de entrenamiento reportando horas decodificadas y advirtiendo de fragmentos rechazados. La particion entre validacion y test se hace por identificadores de grabacion originales, evitando fuga de datos entre conjuntos. El autor indica que la referencia publicada (QUAN-Transcribe) no libera su bucle de entrenamiento ni el calendario exacto de optimizacion, por lo que la seleccion de vocabulario en ingles, la optimizacion y el muestreo aleatorio de fragmentos son decisiones propias de esta implementacion. Los detalles concretos de la receta y los resultados estan en los ficheros `run_config.json`, `history.json` y `metrics.json` del repositorio, que no se incluyen en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida CTC sobre el vocabulario de tokens de Gemma.
- Transcripcion de audio a texto en una unica pasada no autorregresiva (adecuada para latencia baja en comparacion con decoders seq2seq).
- Procesamiento de audio con convolucion depthwise causal, lo que permite planteamientos de streaming o ventanas incrementales (no confirmado explicitamente por el autor).
- Ajuste parcial del encoder de audio de Gemma: aprovecha representaciones preentrenadas de audio de `google/embeddinggemma-2` en sus dos ultimos bloques.
- Integracion con el ecosistema `transformers` (pipeline `automatic-speech-recognition`) y con endpoints compatibles segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni traduccion.
- Capacidad multilingue: no, unicamente ingles.

## Casos de uso

- Transcripcion por lotes en ingles: el modelo puede procesar ficheros de audio con el pipeline `automatic-speech-recognition` de `transformers` para generar transcripciones en canalizaciones offline, aprovechando su naturaleza CTC para paralelizar bien en GPU.
- Subtitulado de contenido en ingles: al ser un modelo CTC no autorregenerativo, la generacion de segmentos de texto a partir de audio resulta adecuada para pipelines de subtitulado donde prima el throughput sobre la fluidez estilistica.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de grabaciones para construir indices de texto buscables en repositorios documentales o de reuniones en ingles.
- Prototipado academico de arquitecturas hibridas ASR: sirve como ejemplo reproducible de mezcla de estados de audio, convolucion causal y lector Transformer con cabeza CTC, util para investigacion en reconocimiento de habla.
- Evaluacion de ajuste parcial de encoders preentrenados: permite estudiar hasta que punto dos bloques de audio ajustados de un modelo multimodal bastan para una tarea de ASR en un idioma concreto.
- Sistemas de dictado en ingles en entornos controlados: integrable en aplicaciones de escritorio o servidor que requieran transcripcion local sin depender de APIs externas.
- Comparacion de referencia frente a QUAN-Transcribe: al ser una reimplementacion limpia de la arquitectura, es util para reproducir y contrastar variantes de entrenamiento sobre el mismo diseno base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las puntuaciones son experimentales y que solo apareceran tras la evaluacion, y remite a `metrics.json` para los resultados reales; ese fichero no se incluye en los datos proporcionados. No se dispone de cifras de WER, MMLU, HumanEval, GSM8K ni de ninguna otra metrica, ni de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada (calculada a partir del tamano del repositorio, 2,5 GB; es una estimacion, no un dato publicado): en `float32` alrededor de 2,5-3 GB solo para pesos, mas activaciones; en `float16` o `bfloat16` aproximadamente 1,25-1,5 GB para pesos.
- Las activaciones del lector de 6 capas y 768 dimensiones son moderadas, pero la memoria final depende de la longitud de las secuencias de audio de entrada, que no se especifica.
- Cabe con holgura en GPU de consumo: una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 pueden alojar el modelo en precision media o completa. Tambien es viable en GPU integradas o CPU para inferencia por lotes pequenos, dado el reducido tamano aparente.
- GPU de datacenter recomendadas para alto throughput: A100, H100 o L40S, con `batching` dinamico sobre el pipeline de `transformers`.
- Opciones de despliegue: `transformers` (libreria declarada) y HuggingFace Inference Endpoints (tag `endpoints_compatible`). No se confirma soporte de vLLM, TGI, llama.cpp u Ollama; al ser una arquitectura CTC personalizada con lector propio, es probable que requiera implementacion especifica, pero esto no esta documentado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| Gemma audio English ASR (este modelo) | no disponible | no disponible | en | Apache-2.0 | safetensors | no disponible (sin benchmarks publicados) |
| QUAN-Transcribe-1.0 (`qnguyen3/QUAN-Transcribe-1.0`) | no disponible en la informacion proporcionada | no disponible | vietnamita (segun la referencia citada) | no disponible | no disponible | no disponible |
| OpenAI Whisper large-v3 | 1 550 millones | ventana de audio de 30 s | multilingue (amplio conjunto de idiomas) | Apache-2.0 | safetensors / bin | ampliamente evaluado; cifras no incluidas aqui por no formar parte de la informacion proporcionada |
| wav2vec 2.0 (variantes CTC) | entre 95 y 317 millones segun variante | secuencias de audio largas con CNN + Transformer | ingles y multilingue segun checkpoint | MIT / Apache-2.0 segun checkpoint | safetensors / bin | no disponible en la informacion proporcionada |

Comparativa limitada: no se dispone de cifras de error (WER) del modelo descrito ni datos comparativos verificados dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura unicamente en ingles: no soporta otros idiomas, a diferencia de alternativas multilingues como Whisper.
- Sin benchmarks publicados: el autor describe los resultados como experimentales y remite a `metrics.json`, no incluido; no hay evidencia de calidad en produccion.
- Modelo practicamente sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.
- Repositorio de tipo "smoke test": el nombre del modelo (`...-smoke-...-v7`) sugiere una ejecucion de prueba mas que un modelo consolidado.
- Dependencia de una arquitectura personalizada: al no ser una arquitectura estandar de `transformers`, el soporte en servidores de inferencia de alto rendimiento (vLLM, TGI) no esta garantizado y puede requerir codigo propio.
- Riesgo de alucinacion y de sustitucion de palabras: inherente a los sistemas CTC sobre vocabularios grandes de subpalabras; sin metricas publicadas no puede cuantificarse.
- Sesgos: no disponibles. No se documenta composicion demografica, acentos o dominios cubiertos por `espnet/yodas-granary` ni filtros aplicados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base `google/embeddinggemma-2` puede tener sus propias condiciones (Gemma Terms of Use); conviene revisarlas antes de un despliegue comercial. Este dato no se detalla en la informacion proporcionada.
- Limitaciones de contexto: se desconoce la longitud maxima de audio procesable en una sola pasada, dato critico para produccion.
- Trazabilidad: el autor no publica el bucle de entrenamiento ni el calendario de optimizacion, y admite que parte de las decisiones (vocabulario, optimizacion, muestreo de fragmentos) son propias, lo que dificulta la reproducibilidad exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Steveeeeeeen/gemma-audio-asr-en-smoke-20261015-v7
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Referencia de arquitectura (QUAN-Transcribe-1.0): https://huggingface.co/qnguyen3/QUAN-Transcribe-1.0
- Dataset de entrenamiento (espnet/yodas-granary): https://huggingface.co/datasets/espnet/yodas-granary
- Ficheros de receta y resultados citados en el repositorio: `run_config.json`, `history.json`, `metrics.json`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo: los resultados obtenidos correspondian a recursos no relacionados (Overleaf). No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
