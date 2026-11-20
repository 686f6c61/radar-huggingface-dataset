# velifurkan/parakeet-tdt-0.6b-tr-onnx

## Resumen

Parakeet TDT 0.6B Turkish (ONNX) es la exportación a formato ONNX del modelo de reconocimiento automático del habla `velifurkan/parakeet-tdt-0.6b-tr`, un ajuste fino sobre el modelo NVIDIA Parakeet TDT 0.6B v3 especializado en turco. Lo publica el usuario velifurkan y resuelve el problema de ejecutar ASR de alta calidad en turco sobre CPU sin depender de NeMo ni de GPU, gracias a ONNX Runtime.

El modelo emplea una arquitectura NeMo Conformer TDT (Token-and-Duration Transducer) con encoder FastConformer, 128 características log-mel y subsampling de factor 8. El repositorio incluye el encoder cuantizado a int8 (880 MB), el decoder-joint también en int8 (9 MB) y el extractor de características NeMo (`nemo128.onnx`), con un total de 0,9 GB.

Su relevancia radica en dos puntos: mantiene una precisión muy cercana al modelo original (11,4 % WER frente a 10,5 % del modelo NeMo completo en FLEURS tr_tr) y lo hace con un encoder int8 que corre aproximadamente 2,3 veces más rápido en CPU que la versión de precisión completa. Además, escribe mayúsculas, puntuación y signos de interrogación, lo que simplifica su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer) con encoder FastConformer |
| Parametros totales | 0,6B (600 millones, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | int8 en pesos MatMul/Gemm del encoder y en decoder-joint; resto en precision completa |
| Idiomas soportados | Turco (tr) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder-model.int8.onnx`, `decoder_joint-model.int8.onnx`, `nemo128.onnx`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura NeMo Conformer TDT, una variante de transducer que predice conjuntamente tokens y duraciones, con un encoder FastConformer que aplica subsampling de factor 8 sobre características log-mel de 128 bandas. El vocabulario consta de 1024 piezas SentencePiece en turco más el token `<blk>`. La exportación ONNX replica la estructura de `istupakov/parakeet-tdt-0.6b-v3-onnx`, de modo que herramientas compatibles con ese modelo (onnx-asr, Natively) pueden ejecutar este cambiando únicamente el repositorio de destino.

El ajuste fino se realizó sobre el modelo NVIDIA `parakeet-tdt-0.6b-v3` (CC BY 4.0) usando el ISSAI Turkish Speech Corpus (CC BY 4.0), Mozilla Common Voice (CC0), Google FLEURS (CC BY 4.0) y ESPnet YODAS (CC BY 3.0). No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación técnica destacable es la cuantización selectiva: solo las multiplicaciones de matrices del encoder se convierten a 8 bits, lo que preserva la precisión mucho mejor que cuantizar todas las operaciones (esta última opción costaba unos 2 puntos de WER en una versión anterior, frente a aproximadamente 1 punto con la cuantización selectiva).

## Capacidades

- Reconocimiento automático del habla (ASR) en turco a partir de audio.
- Salida con mayúsculas, puntuación y signos de interrogación en las preguntas.
- Ejecución en CPU mediante ONNX Runtime, sin necesidad de GPU.
- Compatibilidad con el ecosistema de herramientas construidas para `istupakov/parakeet-tdt-0.6b-v3-onnx` (onnx-asr, Natively).
- Extracción de características log-mel de 128 bandas integrada mediante `nemo128.onnx`.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y notas de voz en turco: el modelo genera texto con puntuación y mayúsculas directamente, lo que reduce el post-procesado necesario para actas o resúmenes.
- Subtitulado y generación de transcripciones para vídeo o pódcast en turco: su ejecución en CPU permite procesar lotes de audio en servidores sin GPU dedicada.
- Asistentes de voz locales o de escritorio: al integrarse con Natively y ejecutarse sobre ONNX Runtime en CPU, encaja en aplicaciones de asistente personal que transcriben en tiempo real sin enviar audio a la nube.
- Sistemas de atención al cliente con análisis de llamadas: la transcripción en turco con puntuación facilita el análisis posterior de conversaciones y la extracción de intenciones.
- Accesibilidad y dictado: integración en herramientas de dictado por voz para usuarios turcoparlantes, con despliegue ligero (0,9 GB) en equipos de sobremesa.
- Investigación lingüística y creación de corpus: transcripción por lotes de grabaciones turcas para construir datasets anotados, aprovechando el rendimiento en CPU y la licencia CC BY 4.0.
- Pipelines de moderación o búsqueda sobre audio: conversión de archivos de audio a texto indexable en entornos con recursos limitados.

## Benchmarks y rendimiento

Evaluado sobre las 743 muestras de test de FLEURS tr_tr con el motor Parakeet de Natively sobre ONNX Runtime 1.22 en CPU. El WER se calcula tras pasar a minúsculas, eliminar puntuación y escribir los números como palabras.

| Version | Tamano del encoder | WER FLEURS tr_tr | CER |
|---|---|---|---|
| Este repo (encoder int8) | 0,88 GB | 11,4 % | 2,8 % |
| Misma exportacion a precision completa (no publicada) | 2,4 GB | 10,5 % | 2,6 % |
| Modelo NeMo original | no disponible | 10,5 % | no disponible |
| GGUF Q8_0 (transcribe.cpp) | 0,73 GB | 10,6 % | 2,6 % |

A precisión completa la copia ONNX iguala al modelo NeMo, por lo que la exportación no introduce pérdida; los 0,8 puntos de diferencia provienen del encoder int8, que corre aproximadamente 2,3 veces más rápido en CPU que la versión de precisión completa.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo está pensado para ejecutarse en CPU con ONNX Runtime.
- Tamaño en disco: 0,9 GB en total (encoder int8 de 880 MB, decoder-joint de 9 MB y extractor de 0,1 MB).
- GPU recomendadas: no se especifican en la información disponible; el modelo está orientado a CPU.
- Cabe en GPU de consumo: no se documenta, pero por tamaño (0,9 GB) cabría en cualquier GPU de consumo si se ejecuta con un runtime compatible con ONNX.
- Opciones de despliegue: ONNX Runtime (CPU), onnx-asr, Natively; también existe una variante GGUF Q8_0 para transcribe.cpp.
- Latencia y throughput: no se publican cifras absolutas; solo se indica que el encoder int8 es aproximadamente 2,3 veces más rápido que la precisión completa en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS tr_tr | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (ONNX int8) | 0,6B | no disponible | 11,4 % | CC BY 4.0 | ONNX |
| `velifurkan/parakeet-tdt-0.6b-tr-gguf` (Q8_0) | 0,6B | no disponible | 10,6 % | CC BY 4.0 | GGUF |
| NeMo `parakeet-tdt-0.6b-v3` original | 0,6B | no disponible | 10,5 % | CC BY 4.0 | NeMo |
| `istupakov/parakeet-tdt-0.6b-v3-onnx` | 0,6B | no disponible | no disponible | no disponible | ONNX |

La comparación con Whisper se remite a la model card principal, pero no se incluyen cifras en la información disponible.

## Limitaciones y advertencias

- Solo soporta turco; no es un modelo multilingüe.
- La cuantización int8 del encoder introduce una pérdida de 0,8 puntos de WER respecto a la precisión completa (11,4 % frente a 10,5 %).
- No se documentan sesgos específicos, pero al entrenarse con Common Voice, FLEURS, YODAS e ISSAI puede heredar sesgos de esos corpus (variedad dialectal, calidad de grabación, representación demográfica).
- Riesgo de alucinación y errores en audio con ruido, acentos marcados o vocabulario especializado no cubierto por el vocabulario SentencePiece de 1024 piezas.
- No se especifica la ventana máxima de audio procesable ni el comportamiento con audios muy largos.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar al autor y respetar las licencias de los modelos y corpus base (NVIDIA Parakeet, ISSAI, Common Voice, FLEURS, YODAS).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria amplia.
- `nemo128.onnx` procede de `istupakov/parakeet-tdt-0.6b-v3-onnx`, con la licencia que aplique ese repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/velifurkan/parakeet-tdt-0.6b-tr-onnx
- Modelo base (ajuste fino turco): https://huggingface.co/velifurkan/parakeet-tdt-0.6b-tr
- Variante GGUF: https://huggingface.co/velifurkan/parakeet-tdt-0.6b-tr-gguf
- Exportación ONNX de referencia: https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Proyecto Natively: https://github.com/Natively-AI-assistant/natively-cluely-ai-assistant
