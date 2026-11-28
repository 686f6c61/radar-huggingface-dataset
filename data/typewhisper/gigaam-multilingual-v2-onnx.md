# TypeWhisper/gigaam-multilingual-v2-onnx

## Resumen

GigaAM-Multilingual-v2 es un modelo de reconocimiento automatico del habla (ASR) desarrollado por Sber (a traves del repositorio salute-developers/GigaAM) bajo licencia MIT. Se trata de un modelo RNN-T (Recurrent Neural Network Transducer) que transcribe audio en 21 idiomas con puntuacion y capitalizacion incluidas, lo que lo diferencia de la mayoria de sistemas ASR que producen texto plano sin formato. La version aqui descrita es una exportacion a ONNX realizada por TypeWhisper para su plugin de GigaAM, con el encoder cuantizado a int8 de forma dinamica.

El modelo resuelve el problema de la transcripcion multilingue en produccion sin necesidad de infraestructura de GPU dedicada: al ejecutarse unicamente con ONNX Runtime, puede desplegarse en CPU con un rendimiento de 39 veces el tiempo real en un Apple M5 Pro. Esto lo hace especialmente atractivo para aplicaciones de escritorio, herramientas de dictado y sistemas de subtitulado que necesitan funcionar en local sin depender de servicios en la nube.

La relevancia actual del modelo radica en su combinacion de cobertura linguistica amplia (incluyendo idiomas poco representados como kazajo, kirguis, uzbeko, bielorruso, bashkir, georgiano, armenio, turcomano, azeri, tayiko y tatar), salida con puntuacion y mayusculas, y un formato ONNX int8 compacto (0,8 GB de repositorio) que facilita su integracion en aplicaciones de usuario final. Los pesos son byte a byte identicos a la exportacion de DonYin, lo que sugiere una cadena de herramientas reproducible y verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RNN-T (Recurrent Neural Network Transducer) con encoder conformer y decoder con bucle greedy integrado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (segmentos de audio de hasta aproximadamente 20 s por inferencia) |
| Tipos de cuantizacion | int8 dinamica (solo MatMul y Gemm del encoder); decoder en precision original |
| Idiomas soportados | 21: ru, en, kk, ky, uz, be, fr, es, ba, ka, hy, ro, tk, az, tg, de, it, nl, pl, pt, tt |
| Licencia | MIT |
| Formato de pesos | ONNX (encoder int8, decoder ONNX, vocabulario SentencePiece en texto) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura RNN-T, un transductor que combina un encoder acustico con un predictor (decoder) y una red conjunta para alinear secuencias de audio con tokens de texto de longitud variable. El encoder procesa caracteristicas log-mel de 64 bandas extraidas de audio mono a 16 kHz mediante el extractor de caracteristicas de GigaAM v3. La exportacion ONNX separa el grafo en dos ficheros: un encoder cuantizado dinamicamente a int8 (solo las operaciones MatMul y Gemm) y un grafo de avance que contiene el decoder y el bucle greedy del RNN-T, con una salida adicional `token_frames` que indica la alineacion temporal de cada token.

Un aspecto tecnico destacable es el mecanismo de seleccion de idioma mediante un vector one-hot de tipo float32 de forma `[1, 32]`: la posicion 0 activa la deteccion automatica del idioma y las posiciones 1 a 21 seleccionan explicitamente uno de los 21 idiomas soportados. Los pesos se generaron a partir del checkpoint `multilingual_v2_rnnt` de Sber en el commit `e9bbf2e773eedd217c6f0d3b89b9728c41332b7d`, usando el script de exportacion `export-gigaam-onnx.py` de Don Yin. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino supervisado.

## Capacidades

- Transcripcion de voz a texto en 21 idiomas con puntuacion y capitalizacion incluidas en la salida.
- Deteccion automatica del idioma mediante el slot 0 del vector `language_vector`, o seleccion manual de idioma mediante los slots 1 a 21.
- Salida con alineacion temporal por token a traves de la salida `token_frames`, util para subtitulado y sincronizacion.
- Procesamiento de segmentos de audio de hasta aproximadamente 20 segundos por inferencia; los clips inferiores a 1 segundo deben rellenarse con ceros.
- Ejecucion en CPU unicamente con ONNX Runtime, sin necesidad de GPU ni frameworks de deep learning adicionales.
- Cobertura de idiomas poco habituales en sistemas ASR comerciales: kazajo, kirguis, uzbeko, bielorruso, bashkir, georgiano, armenio, turcomano, azeri, tayiko y tatar, ademas de las principales lenguas europeas.
- No se documentan capacidades de tool calling, agentes, vision, audio generation ni modo de razonamiento extendido, al tratarse de un modelo especializado exclusivamente en ASR.

## Casos de uso

- Dictado por voz en aplicaciones de escritorio: el modelo puede integrarse en herramientas de productividad que transcriben dictado en local, con soporte para 21 idiomas y salida ya puntuada y capitalizada, sin enviar audio a servidores externos. Su ejecucion en CPU con ONNX Runtime elimina la dependencia de GPU.
- Subtitulado automatico de video: la salida `token_frames` proporciona la alineacion temporal de cada token, lo que permite generar subtitulos sincronizados. El modelo es adecuado para pipelines de postproduccion que necesitan marcas de tiempo por palabra o por token.
- Transcripcion de reuniones y notas de voz: con segmentos de hasta 20 segundos y un rendimiento de 39 veces el tiempo real en CPU, el modelo puede procesar grabaciones largas dividiendolas en fragmentos, con deteccion automatica del idioma para reuniones multilingues.
- Atencion al cliente y centros de contacto: transcripcion de llamadas en tiempo real o diferido para analitica, con soporte de idiomas de Europa del Este y Asia Central que a menudo quedan fuera de los sistemas ASR comerciales.
- Accesibilidad y herramientas de voz para personas con discapacidad: el modelo permite construir interfaces de voz en local, con bajo consumo de recursos y sin latencia de red, adecuado para aplicaciones de asistencia personal.
- Investigacion linguistica y creacion de corpus: la cobertura de idiomas poco representados (bashkir, tatar, turcomano, tayiko) facilita la transcripcion de grabaciones de campo y la construccion de datasets para lenguas con pocos recursos.
- Integracion en plugins de aplicaciones de mensajeria o editores de texto: el formato ONNX compacto (0,8 GB) y la licencia MIT permiten empaquetar el modelo dentro de extensiones de escritorio sin restricciones de redistribucion.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el corpus de benchmark de TypeWhisper, ejecutando la exportacion tal como lo hace el plugin (PR TypeWhisper/typewhisper-benchmark#36):

| Idioma | WER (%) |
|---|---|
| Ruso | 2,62 |
| Ingles | 5,65 |
| Aleman | 4,31 |
| Frances | 5,48 |
| Espanol | 2,97 |
| Italiano | 4,48 |
| Neerlandes | 5,82 |
| Portugues | 6,77 |

Rendimiento: 39 veces el tiempo real en CPU Apple M5 Pro. No se han publicado resultados para el resto de idiomas soportados ni comparaciones con otros modelos ASR en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecucion en CPU; el modelo esta disenado para ONNX Runtime en CPU. El repositorio ocupa 0,8 GB, lo que da una idea del espacio en disco y memoria necesarios para cargar los pesos.
- GPU recomendadas: no se especifican; el modelo no requiere GPU. Cualquier GPU compatible con ONNX Runtime (CUDA o DirectML) podria acelerar la inferencia, pero no se documentan requisitos ni rendimiento en GPU.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto, ya que el modelo funciona en CPU. Cabe en cualquier equipo con al menos 1 GB de RAM libre para los pesos.
- Opciones de despliegue: ONNX Runtime exclusivamente (el modelo se distribuye como grafos ONNX). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo ASR.
- Latencia y throughput: 39 veces el tiempo real en un Apple M5 Pro (CPU), es decir, aproximadamente 1 segundo de audio procesado en unos 26 milisegundos. No se documentan cifras para otras CPU ni para GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto de audio | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| GigaAM-Multilingual-v2 (este) | RNN-T | 21 | ~20 s por inferencia | MIT | ONNX int8 | Puntuacion y mayusculas; CPU con ONNX Runtime; 39x tiempo real en M5 Pro |
| Whisper (OpenAI) | Transformer encoder-decoder | ~99 | 30 s | MIT | PyTorch, GGUF, ONNX | Referencia del sector; requiere mas recursos; no incluye puntuacion nativa en todos los idiomas |
| Vosk | Kaldi-based | ~20 | variable | Apache 2.0 | Kaldi, ONNX | Ligero, orientado a CPU, sin puntuacion nativa |
| NeMo (NVIDIA) | Conformer/Transducer | variable | variable | Apache 2.0 | NeMo, ONNX | Framework completo; requiere NVIDIA NeMo para uso tipico |

No se dispone de comparaciones directas de WER entre estos modelos en la informacion proporcionada; la tabla compara caracteristicas estructurales, no rendimiento medido.

## Limitaciones y advertencias

- El modelo solo procesa segmentos de audio de hasta aproximadamente 20 segundos; audios mas largos deben dividirse en fragmentos, lo que puede degradar la coherencia en las fronteras.
- Los clips inferiores a 1 segundo deben rellenarse con ceros; no se documenta el comportamiento con audio muy corto sin relleno.
- Solo se han publicado resultados de WER para 8 de los 21 idiomas; el rendimiento en los 13 restantes (kazajo, kirguis, uzbeko, bielorruso, bashkir, georgiano, armenio, turcomano, azeri, tayiko, tatar y otros) es desconocido.
- El WER en portugues (6,77 %) y neerlandes (5,82 %) es notablemente superior al de ruso (2,62 %) o espanol (2,97 %), lo que sugiere un rendimiento desigual entre idiomas.
- Riesgo de alucinacion y errores en audio con ruido, acentos marcados o vocabulario tecnico; no se documentan mecanismos de mitigacion.
- La cuantizacion int8 se aplica solo a MatMul y Gemm del encoder; no se documenta el impacto exacto de la cuantizacion en la precision respecto al checkpoint original en float32.
- La licencia MIT permite uso comercial y redistribucion, pero el modelo base es de Sber y la exportacion es de TypeWhisper; conviene verificar la cadena de atribuciones al redistribuir.
- El modelo es una exportacion de terceros (TypeWhisper) del modelo original de Sber; no es la distribucion oficial y podria no recibir actualizaciones.
- No se documentan sesgos especificos por idioma, genero o acento; se recomienda evaluar en el dominio de despliegue antes de produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TypeWhisper/gigaam-multilingual-v2-onnx
- Modelo base: https://huggingface.co/ai-sage/GigaAM-Multilingual-v2
- Repositorio oficial de GigaAM (Sber): https://github.com/salute-developers/GigaAM
- Exportacion equivalente de DonYin: https://huggingface.co/DonYin/gigaam-multilingual-v2-onnx
- Benchmark de TypeWhisper (PR #36): https://github.com/TypeWhisper/typewhisper-benchmark/pull/36
- onnx-asr (extractor de caracteristicas y utilidades): https://github.com/istupakov/onnx-asr
