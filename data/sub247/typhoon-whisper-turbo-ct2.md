# sub247/typhoon-whisper-turbo-ct2

## Resumen

Typhoon Whisper Turbo (CTranslate2) es una conversion de formato del modelo de reconocimiento automatico del habla (ASR) `typhoon-ai/typhoon-whisper-turbo`, desarrollado por el equipo Typhoon de SCB 10X. El repositorio lo publica el usuario `sub247` y su unico proposito es ofrecer los pesos originales en formato CTranslate2 para su uso con la libreria faster-whisper, sin ninguna modificacion de los pesos mas alla de la conversion de formato. La arquitectura subyacente es Whisper (transformer encoder-decoder) en su variante Turbo, especializada mediante fine-tuning en tailandes.

El modelo resuelve la transcripcion de audio en tailandes con un rendimiento optimizado para inferencia en CPU y GPU mediante CTranslate2, lo que permite integrarlo en aplicaciones de subtitulado y transcripcion sin depender del stack original de PyTorch/Transformers. El repositorio ocupa 1,6 GB y la cuantizacion aplicada en la conversion es float16.

Es relevante por dos motivos: por un lado, da acceso practico al modelo Typhoon Whisper Turbo en un runtime de inferencia eficiente (faster-whisper), y por otro, sirve de ejemplo de distribucion de modelos ASR especializados en idiomas de bajos recursos como el tailandes, un caso donde los Whisper genericos suelen tener tasas de error notoriamente superiores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder) en variante Turbo; pesos convertidos a CTranslate2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper Turbo original: ventana de audio de 30 s por segmento) |
| Tipos de cuantizacion | float16 (cuantizacion usada en la conversion); otras cuantizaciones CTranslate2 (int8, int8_float16) no estan publicadas en este repo |
| Idiomas soportados | tailandes (th) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin y ficheros auxiliares); no se distribuyen safetensors ni GGUF en este repo |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper en su variante Turbo: un transformer encoder-decoder con atencion estandar que procesa ventanas de audio de 30 segundos y genera tokens de transcripcion de forma autoregresiva. El modelo base `typhoon-ai/typhoon-whisper-turbo` fue desarrollado por el equipo Typhoon de SCB 10X y esta especializado en tailandes mediante fine-tuning sobre el Whisper Turbo original. No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La contribucion de este repositorio es exclusivamente la conversion a CTranslate2 con cuantizacion float16, realizada con `ct2-transformers-converter` copiando `tokenizer.json` y `preprocessor_config.json`. Esto habilita la inferencia con faster-whisper, que implementa decodificacion por lotes y un backend optimizado para CPU y GPU, reduciendo el coste computacional frente a la inferencia en PyTorch. No hay innovaciones arquitectonicas propias en este repo: los pesos son identicos a los del modelo original.

## Capacidades

- Reconocimiento automatico del habla en tailandes a partir de ficheros de audio.
- Transcripcion con marcas temporales por segmento (`start`, `end`, `text`), apta para generacion de subtitulos.
- Deteccion de idioma opcional mediante el parametro `language` de faster-whisper (aunque el modelo esta especializado en tailandes).
- Inferencia en CPU con cuantizacion int8 y en GPU con float16, segun la configuracion de faster-whisper.
- Integracion directa en pipelines Python mediante `faster_whisper.WhisperModel`.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado automatico de video en tailandes: el modelo genera segmentos con marcas de tiempo que pueden volcarse directamente a formatos SRT o VTT; es el uso declarado por el autor, que lo integra en su aplicacion de subtitulos sub247.
- Transcripcion de reuniones y entrevistas en tailandes: la salida por segmentos permite alinear hablantes y construir actas o resumenes posteriores con un modelo de lenguaje.
- Indexacion y busqueda de archivos de audio: transcribir un corpus de grabaciones en tailandes para hacerlas buscables por texto, aprovechando la inferencia en CPU con int8 para abaratar el proceso por lotes.
- Atencion al cliente y analitica de llamadas: transcripcion de grabaciones de call center en tailandes para analisis de calidad, deteccion de temas y cumplimiento normativo.
- Accesibilidad: generacion de subtitulos en tiempo casi real para contenido audiovisual tailandes destinado a personas con discapacidad auditiva.
- Investigacion en ASR para idiomas de bajos recursos: servir de baseline reproducible en formato CTranslate2 para comparar tecnicas de adaptacion al tailandes sin depender del stack de Transformers.
- Prototipado rapido en entornos sin GPU: la combinacion de CTranslate2 y faster-whisper permite desplegar el modelo en CPU con un consumo de memoria contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio remite a la model card y al paper del modelo original (`typhoon-ai/typhoon-whisper-turbo` y arXiv:2601.13044) para resultados y metricas, pero dichos datos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 1,6 GB en float16, por lo que la huella en memoria del modelo es del orden de esa cifra; la memoria adicional depende de la longitud del audio y del tamano de lote.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos unos pocos GB de VRAM libre deberia poder alojar los pesos en float16; no hay datos publicados de latencia ni throughput.
- GPU de consumo: por el tamano del repo (1,6 GB), es plausible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no hay confirmacion oficial en la informacion disponible.
- Despliegue: faster-whisper sobre CTranslate2 (CPU con `compute_type="int8"`, GPU con float16). No se distribuyen pesos para vLLM, llama.cpp, Ollama ni TGI, ya que no son runtimes compatibles con este formato de ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sub247/typhoon-whisper-turbo-ct2 | no disponible | ventana de audio de 30 s por segmento | th | MIT | CTranslate2 |
| typhoon-ai/typhoon-whisper-turbo (original) | no disponible | ventana de audio de 30 s por segmento | th | MIT | Transformers (safetensors) |
| openai/whisper-large-v3-turbo | no disponible en la informacion | ventana de audio de 30 s por segmento | multilingue | MIT | Transformers / CTranslate2 |

La comparativa se limita a los datos disponibles; no se dispone de metricas de WER ni de rendimiento comparado entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en tailandes: su uso con otros idiomas no esta soportado ni evaluado, y la calidad fuera del tailandes sera previsiblemente baja.
- Al ser una conversion de formato, hereda todas las limitaciones del modelo original; consultar la model card de `typhoon-ai/typhoon-whisper-turbo` para sesgos y riesgos conocidos.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o habla solapada, comun en modelos Whisper.
- La ventana de procesamiento es de 30 segundos por segmento; audios mas largos requieren segmentacion y pueden perder coherencia entre cortes.
- La licencia MIT permite uso comercial, pero el autor remite a los terminos de Typhoon (opentyphoon.ai/tac); conviene revisarlos antes de un despliegue en produccion.
- No se publican cuantizaciones int8 en este repositorio, aunque faster-whisper puede aplicar int8 en tiempo de ejecucion sobre los pesos float16.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sub247/typhoon-whisper-turbo-ct2
- Modelo original: https://huggingface.co/typhoon-ai/typhoon-whisper-turbo
- Paper: https://huggingface.co/papers/2601.13044
- Terminos de Typhoon: https://opentyphoon.ai/tac
- CTranslate2: https://github.com/OpenNMT/CTranslate2
- faster-whisper: https://github.com/SYSTRAN/faster-whisper
