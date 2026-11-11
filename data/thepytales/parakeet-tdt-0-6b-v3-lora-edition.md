# thepytales/parakeet-tdt-0.6b-v3-lora-edition

## Resumen

Parakeet TDT 0.6B v3 – Lora Edition es una redistribucion del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, publicada por el usuario thepytales (PyTales) para su aplicacion Lora. No se trata de un modelo nuevo ni de un ajuste fino: los pesos son byte a byte identicos a la fuente original `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`, y los hashes SHA-256 documentados en la model card permiten verificarlo. El autor declara explicitamente que los pesos no se han modificado.

El modelo subyacente es un sistema ASR de NVIDIA basado en la arquitectura TDT (Token-and-Duration Transducer), con aproximadamente 0,6 mil millones de parametros, disenado para transcripcion de voz. Esta edicion se distribuye en formato ONNX cuantizado a int8, empaquetada para su uso con sherpa-onnx, una runtime de inferencia en C++/Python optimizada para despliegue en dispositivos y entornos sin GPU dedicada.

Su relevancia practica es la de ofrecer una via de despliegue ligera y verificable de un modelo ASR de NVIDIA en entornos ONNX, con licencia CC-BY-4.0 que permite uso comercial con atribucion. No obstante, al ser una redistribucion sin modificaciones, cualquier mejora o limitacion respecto al original de NVIDIA es identica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), segun el modelo base de NVIDIA; empaquetado ONNX con encoder, decoder y joiner separados |
| Parametros totales | 0,6 mil millones (aproximado, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (los tres componentes: encoder, decoder, joiner) |
| Idiomas soportados | aleman (de), ingles (en) |
| Licencia | CC-BY-4.0, con atribucion a NVIDIA |
| Formato de pesos | ONNX (encoder.int8.onnx, decoder.int8.onnx, joiner.int8.onnx) y tokens.txt |
| Tamano del repositorio | 0,7 GB |
| Runtime objetivo | sherpa-onnx |
| Tarea | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo base es un transducer TDT de NVIDIA. La arquitectura transducer combina un encoder acustico, un decoder de prediccion y un joiner que produce conjuntamente tokens y duraciones, lo que permite emitir varios tokens por paso de decodificacion y reduce la latencia frente a transducers clasicos. Esta edicion redistribuye el modelo ya convertido a ONNX y cuantizado a int8 por csukuangfj para sherpa-onnx, con tres ficheros separados: `encoder.int8.onnx` (652,2 MB), `decoder.int8.onnx` (11,8 MB) y `joiner.int8.onnx` (6,4 MB), mas el vocabulario `tokens.txt` (94 KB).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o ajuste supervisado en la informacion proporcionada. El autor de esta edicion no ha realizado ningun ajuste: la model card indica que los ficheros son byte-identicos a la fuente `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` en el commit `2bda32e`, y proporciona los SHA-256 de cada fichero para su verificacion. La etiqueta `lora-edition` hace referencia a la aplicacion Lora del autor, no a tecnicas LoRA de ajuste fino.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en aleman e ingles.
- Decodificacion TDT con emision conjunta de tokens y duraciones, orientada a baja latencia.
- Inferencia en formato ONNX int8, adecuada para CPU y dispositivos con recursos limitados.
- Integracion con la runtime sherpa-onnx, que permite despliegue en C++, Python, Android, iOS y otros entornos.
- No se documentan capacidades de traduccion, diarizacion, puntuacion automatica, tool calling ni agentes.
- No se documentan capacidades multimodales mas alla del audio de entrada.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles y aleman: el modelo convierte audio a texto en local mediante sherpa-onnx, sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Subtitulado de video en tiempo casi real: la decodificacion TDT emite varios tokens por paso, lo que reduce la latencia y facilita la generacion de subtitulos en directo en CPU.
- Asistentes de voz embebidos: al distribuirse en ONNX int8 con un encoder de 652 MB, puede integrarse en aplicaciones de escritorio o moviles que usen sherpa-onnx como runtime.
- Dictado por voz en aplicaciones de productividad: la licencia CC-BY-4.0 permite incorporar el modelo en productos comerciales con atribucion a NVIDIA.
- Preprocesado de audio para pipelines de NLP: transcripcion por lotes de grabaciones en ingles o aleman antes de aplicar analisis de sentimiento, resumen o busqueda.
- Verificacion de integridad en despliegues: los SHA-256 publicados permiten auditar que los pesos desplegados coinciden con la fuente original, util en entornos regulados.
- Prototipado rapido de ASR: el empaquetado ONNX y la disponibilidad de tokens.txt simplifican la puesta en marcha con sherpa-onnx sin necesidad de convertir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; al ser un modelo de 0,6 B en int8, el conjunto de pesos ocupa aproximadamente 0,67 GB, por lo que la inferencia en CPU es viable.
- GPU recomendadas: no disponible; el formato ONNX int8 y la runtime sherpa-onnx estan orientados a CPU, aunque puede ejecutarse en GPU si la runtime lo soporta.
- Cabe en GPU consumer: previsiblemente si, dado el tamano reducido de los pesos, aunque no se documenta soporte especifico.
- Opciones de despliegue: sherpa-onnx (runtime objetivo); otras runtimes ONNX no estan documentadas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| thepytales/parakeet-tdt-0.6b-v3-lora-edition | 0,6 B | de, en | ONNX int8 | CC-BY-4.0 | Redistribucion byte-identica para sherpa-onnx |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | de, en (segun esta ficha) | no disponible | CC-BY-4.0 (segun la model card) | Modelo base original de NVIDIA |
| csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8 | 0,6 B | de, en | ONNX int8 | no disponible | Fuente directa de los ficheros redistribuidos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni ajustado: los pesos son identicos al original, por lo que no aporta mejoras de precision ni de cobertura idiomatica.
- Solo cubre aleman e ingles; no se documenta soporte de castellano.
- No se documentan sesgos especificos, pero al ser una redistribucion hereda los del modelo base de NVIDIA.
- Riesgo de alucinacion y errores de transcripcion inherente a los sistemas ASR, especialmente con audio ruidoso o acentos no representados en el entrenamiento.
- La licencia CC-BY-4.0 permite uso comercial con atribucion a NVIDIA; es obligatorio conservar el aviso de autoria y el texto de licencia incluido en el repositorio.
- El autor indica que NVIDIA no ha revisado ni aprobado esta edicion; la responsabilidad de uso recae en la licencia del original.
- Dependencia de la runtime sherpa-onnx y del formato ONNX int8; no se documentan otras vias de despliegue.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/thepytales/parakeet-tdt-0.6b-v3-lora-edition
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Fuente de los ficheros ONNX: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Runtime sherpa-onnx: no disponible en la informacion proporcionada
