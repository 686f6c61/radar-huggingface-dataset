# transcriber-app/whisper-large-v3-turbo-mlx-5bit

## Resumen

whisper-large-v3-turbo-mlx-5bit es una version cuantizada a 5 bits del modelo Whisper large-v3-turbo de OpenAI, adaptada al formato MLX por el autor transcriber-app. El objetivo es ofrecer reconocimiento automatico del habla (ASR) en dispositivo sobre silicio de Apple, con un peso de tan solo 564 MB, lo que permite cargarlo en la GPU Metal en aproximadamente medio segundo desde disco, sin necesidad de compilar para el Neural Engine. Se apoya en la libreria MLX de Apple, que ejecuta operaciones aceleradas en la GPU unificada de los chips de la serie M.

El modelo parte de la version fp16 de mlx-community y aplica cuantizacion afin de 5 bits con tamano de grupo 64 a 233 modulos lineales y de embedding, siguiendo la receta del script de conversion del repositorio mlx-examples. Frente al build de 8 bits, el de 5 bits reduce el tamano descargable de 864 MB a 564 MB manteniendo una degradacion practicamente insignificante en WER de FLEURS (4,71 % frente a 4,60 %). Esta pensado para aplicaciones de transcripcion local en Mac, donde el coste de memoria y el tiempo de arranque son criticos.

La relevancia actual radica en la demanda de transcripcion privada y sin conexion en portatiles y equipos de sobremesa con chip Apple. Whisper large-v3-turbo es la variante destilada del decodificador de Whisper (4 capas de decodificador en lugar de 32), lo que reduce drasticamente la latencia de generacion a costa de un modelo encoder mas pesado. Esta version cuantizada conserva esa ventaja y anade un factor de compresion de pesos de aproximadamente 15x respecto a los 6,7 GB en fp32 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con cuantizacion MLX |
| Parametros totales | 809 millones (modelo base whisper-large-v3-turbo); no confirmado en la ficha del derivado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | campo receptivo de 30 segundos de audio; ventana de 1500 posiciones de tokens |
| Tipos de cuantizacion | 5-bit afin, group size 64 (233 modulos Linear y Embedding); existe un build de 8-bit publicado por el mismo autor |
| Idiomas soportados | multilingue heredado del modelo base (hasta 99 idiomas y tareas de traduccion segun OpenAI); la ficha del derivado no lo especifica |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX), 564 MB |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un transformer encoder-decoder con entrada de espectrograma mel de 128 canales. La innovacion de la variante turbo es la reduccion del decodificador a 4 capas y del numero de cabezas de atencion, mientras el encoder conserva las 32 capas del large-v3 original. Esto desplaza la carga computacional hacia el encoder, que procesa el audio completo en paralelo, y reduce el numero de pasos secuenciales en la generacion de texto, acelerando la transcripcion en audio largo.

Esta publicacion concreta no implica entrenamiento adicional: es una conversion de pesos. El autor toma la version fp16 de mlx-community, recorre los 233 modulos Linear y Embedding y los cuantiza con `mlx.nn.quantize` usando cuantizacion afin de 5 bits con group size 64. El `config.json` es el formato de dimensiones de mlx-whisper e incluye un bloque `"quantization": {"group_size": 64, "bits": 5}`. El tokenizador no se incluye en el repositorio: debe usarse el tokenizador estandar de `openai/whisper-large-v3`. No consta informacion sobre datos de entrenamiento, RLHF, DPO ni ajuste adicional, ya que el modelo solo reproduce los pesos del base en menor precision.

## Capacidades

- Transcripcion de voz a texto (ASR) en multiples idiomas, heredada del modelo Whisper large-v3-turbo.
- Traduccion de voz a texto en ingles desde otros idiomas, tarea nativa de Whisper.
- Deteccion automatica del idioma de entrada; en las pruebas del autor se uso autodeteccion de idioma con decodificacion greedy.
- Procesamiento de audio largo mediante ventana deslizante, ya que el campo receptivo es de 30 segundos por pasada.
- Inferencia en dispositivo sobre silicio de Apple con aceleracion Metal, sin dependencia de servicios en la nube.
- Ejecucion con memoria reducida: 564 MB de pesos, apto para equipos con memoria unificada modesta.
- No consta soporte de tool calling, function calling, agentes, vision ni audio en tiempo real mas alla de la ventana de 30 segundos.

## Casos de uso

- Transcripcion local en macOS: aplicaciones de escritorio que convierten notas de voz o reuniones en texto sin enviar audio a servidores externos, gracias a que el modelo cabe en 564 MB y se carga en medio segundo.
- Subtitulado de video: generacion de archivos SRT a partir de pistas de audio, aprovechando la tarea de transcripcion y traduccion de Whisper para producir subtitulos en ingles u otros idiomas.
- Asistentes de dictado en aplicaciones de productividad: integracion en editores de texto o clientes de correo para convertir dictado continuo en texto, con autodeteccion de idioma.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones archivadas para hacerlas buscables, usando la ventana deslizante para ficheros superiores a 30 segundos.
- Accesibilidad: transcripcion en vivo de conversaciones o clases para personas con discapacidad auditiva, ejecutada integramente en el equipo del usuario.
- Investigacion en habla: evaluacion comparativa de estrategias de cuantizacion (5-bit frente a 8-bit, 6-bit o 4-bit) sobre corpus multilingues como FLEURS o GOLOS, dado que el autor publica metricas reproducibles.
- Prototipado rapido en Apple MLX: banco de pruebas para desarrolladores que quieran comparar el coste de memoria y la velocidad de MLX frente a Core ML en tareas de ASR.

## Benchmarks y rendimiento

El autor publica resultados medidos sobre 1.000 clips en ruso (500 de FLEURS y 500 de GOLOS), con autodeteccion de idioma, decodificacion greedy y ejecucion en un Mac con chip M4. Las cifras son de WER (word error rate) y un factor de velocidad relativo.

| Build | Descarga | FLEURS WER | GOLOS WER | Velocidad |
|---|---:|---:|---:|---:|
| 8-bit | 864 MB | 4,60 % | 17,64 % | 6,7x |
| 6-bit (no publicado) | 664 MB | 4,70 % | 18,10 % | 6,8x |
| 5-bit (este modelo) | 564 MB | 4,71 % | 17,64 % | 7,0x |
| 4-bit (no publicado) | 463 MB | 5,23 % | 17,39 % | 6,9x |
| Core ML, build paletizado 4-bit de Argmax (referencia) | 633 MB | 4,85 % | 18,80 % | 11,8x |

Segun el autor, el build de 5 bits es el mas pequeno que se mantiene dentro de aproximadamente una decima de punto de WER en FLEURS respecto al de 8 bits, mientras que el de 4 bits pierde 0,6 puntos. GOLOS, compuesto por comandos hablados cortos, presenta una variabilidad de medio punto entre builds casi identicos, por lo que el autor recomienda leer primero FLEURS. No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que no son tareas relevantes para un modelo de ASR.

## Requisitos de hardware

- Memoria de pesos: 564 MB para el build de 5 bits; 864 MB para el de 8 bits.
- Huella de inferencia estimada: entre 1 GB y 1,5 GB de memoria unificada, incluyendo pesos, activaciones del encoder y buffers de audio. Cabe holgadamente en cualquier Mac con chip de la serie M.
- GPU compatibles: Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra) mediante Metal. Las pruebas del autor se realizaron en un M4.
- Compatibilidad con GPU NVIDIA o AMD: no disponible en este formato; el repo solo incluye pesos MLX. Para CUDA habria que recurrir al modelo base `openai/whisper-large-v3-turbo` o a una conversion a GGUF y ejecutarlo con whisper.cpp o llama.cpp.
- Tiempo de carga: aproximadamente medio segundo desde disco hasta la GPU Metal, sin compilacion para el Neural Engine. El autor contrasta este dato con el coste de Core ML, que puede tardar minutos en especializar en el primer arranque y tras cada instalacion o actualizacion de la app.
- Opciones de despliegue: mlx-whisper (libreria mlx-examples), mlx-lm y aplicaciones nativas que integren MLX. No se menciona compatibilidad con vLLM, TGI, Ollama o llama.cpp para este formato concreto.
- Latencia y throughput: el factor de velocidad medido es de 7,0x frente a un factor de 11,8x del build Core ML de Argmax, ambos sobre el mismo hardware M4. No se publican valores absolutos de latencia en milisegundos ni de throughput en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FLEURS WER (ruso) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| transcriber-app/whisper-large-v3-turbo-mlx-5bit | 809 M (base) | 30 s de audio | 4,71 % | MIT | MLX, 564 MB |
| Whisper large-v3-turbo MLX 8-bit | 809 M (base) | 30 s de audio | 4,60 % | MIT | MLX, 864 MB |
| Core ML 4-bit paletizado de Argmax | 809 M (base) | 30 s de audio | 4,85 % | MIT (base) | Core ML, 633 MB |
| openai/whisper-large-v3-turbo | 809 M | 30 s de audio | no disponible | MIT | safetensors fp16 |

Frente al modelo base en fp16, esta version prioriza el tamano y el arranque rapido sobre la precision absoluta, con una perdida de WER inferior a 0,2 puntos en FLEURS segun los datos del autor. Frente al build Core ML de Argmax, MLX carga mas rapido pero es mas lento en inferencia (7,0x frente a 11,8x), por lo que la eleccion depende de si pesa mas el arranque o el throughput sostenido. No se dispone de comparaciones con otros modelos de ASR como Conformer, Wav2Vec 2.0 o Canary en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 5 bits introduce una degradacion de precision, pequena en FLEURS (0,11 puntos frente al 8-bit) pero variable segun el idioma y el tipo de audio.
- Los benchmarks publicados solo cubren ruso y se midieron en un unico Mac M4; el rendimiento en otros idiomas o hardware puede diferir.
- GOLOS muestra una varianza de medio punto entre builds casi identicos, lo que limita la fiabilidad de ese corpus como referencia comparativa.
- El modelo, al ser una variante de Whisper, tiene un campo receptivo de 30 segundos: el audio mas largo requiere algoritmos de ventana deslizante o por bloques, con posible perdida de coherencia en las fronteras.
- El tokenizador no esta incluido en el repositorio: hay que obtenerlo por separado del modelo `openai/whisper-large-v3`.
- Riesgo de alucinacion inherente a los modelos de ASR generativos, especialmente en silencios, ruido de fondo o segmentos musicales.
- Sesgos conocidos de Whisper en variedades dialectales, acentos no estandar y determinados idiomas o registros poco representados en su entrenamiento original.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base de OpenAI antes de redistribuir pesos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion independiente de la comunidad.
- No incluye informacion sobre idiomas soportados a nivel de repositorio, por lo que el soporte multilingue se asume heredado del base y no esta verificado en esta build.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/transcriber-app/whisper-large-v3-turbo-mlx-5bit
- Build de 8 bits del mismo autor: https://huggingface.co/transcriber-app/whisper-large-v3-turbo-mlx-8bit
- Modelo base en OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Version fp16 de partida: https://huggingface.co/mlx-community/whisper-large-v3-turbo
- Receta de conversion MLX (mlx-examples, whisper): https://github.com/ml-explore/mlx-examples/tree/main/whisper
- Repositorio original de Whisper en OpenAI: https://github.com/openai/whisper
- Script de transcripcion con MLX (referencia de terceros): https://github.com/bivex/whisper-large-v3-turbo
- Demo en HuggingFace Spaces de Whisper Turbo: https://huggingface.co/spaces/hf-audio/whisper-large-v3-turbo
