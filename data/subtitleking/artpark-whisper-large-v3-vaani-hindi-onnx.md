# subtitleking/artpark-whisper-large-v3-vaani-hindi-onnx

## Resumen

artpark-whisper-large-v3-vaani-hindi-onnx es una version en formato ONNX del checkpoint de reconocimiento automatico del habla (ASR) ARTPARK-IISc/whisper-large-v3-vaani-hindi, desarrollado originalmente por ARTPARK e IISc Bengaluru sobre el conjunto de datos Vaani. El modelo base parte de la arquitectura Whisper large-v3 de OpenAI (transformer encoder-decoder de aproximadamente 1550 millones de parametros) y se ha ajustado especificamente para hindi. Esta variante ONNX ha sido producida por el usuario subtitleking para permitir inferencia directamente en el navegador mediante Transformers.js y WebGPU, y es la que utiliza la herramienta SubtitleKing.

El interes de esta publicacion no reside en una mejora del modelo en si, sino en el cambio de formato: el encoder se exporta en fp16 con entradas y salidas fp32, mientras que el decoder combinado con past key values se cuantiza a 4 bits (MatMul, bloque de 32, simetrico). Esto reduce el peso del repositorio a unos 2,1 GB y hace viable ejecutar un Whisper large-v3 en hardware de cliente sin GPU dedicada de datacenter.

La licencia Apache-2.0 y la naturaleza open source del checkpoint original facilitan su reutilizacion comercial, siempre que se respete la atribucion a ARTPARK-IISc. Es una pieza relevante para quienes necesitan transcripcion de hindi en el navegador, con privacidad de datos y sin depender de un servicio en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3), exportado a ONNX |
| Parametros totales | Aproximadamente 1550 millones (arquitectura Whisper large-v3; no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana estandar de Whisper; no especificado en la model card) |
| Tipos de cuantizacion | Encoder fp16 con I/O fp32; decoder merged q4 (MatMul 4-bit, bloque 32, simetrico) |
| Idiomas soportados | Hindi (hi) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder_model_fp16.onnx, decoder_model_merged_q4.onnx) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Whisper large-v3: un transformer encoder-decoder con atencion completa, disenado para transcripcion y traduccion de voz. ARTPARK-IISc realizo un fine-tuning sobre el dataset Vaani, una coleccion de audio en lenguas indias, para especializar el modelo en hindi. La model card de esta variante no detalla el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esos datos corresponden al checkpoint original y no se reproducen aqui.

La innovacion tecnica de esta publicacion es la conversion a ONNX mediante Optimum (exportacion automatic-speech-recognition-with-past). El encoder se mantiene en fp16 con entradas y salidas en fp32 para compatibilidad, mientras que el decoder combinado con past key values se cuantiza a 4 bits con cuantizacion simetrica por bloques de 32 en las operaciones MatMul. El proceso es reproducible con las herramientas del directorio `tools/convert-whisper/` del repositorio SubtitleKing. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Reconocimiento automatico del habla en hindi, con salida de texto transcrito.
- Transcripcion de audio de hasta 30 segundos por ventana, con manejo de audio mas largo mediante segmentacion.
- Inferencia en navegador mediante Transformers.js sobre WebGPU.
- Ejecucion local sin envio de audio a servidores externos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al hindi segun la model card.
- No se documentan modos especiales como thinking mode, vision o audio adicional.

## Casos de uso

- Subtitulado en navegador: la herramienta SubtitleKing usa este modelo para generar subtitulos de hindi directamente en el cliente, aprovechando el encoder fp16 y el decoder q4 para mantener el peso manejable.
- Transcripcion de reuniones con privacidad: al ejecutarse en WebGPU, el audio no sale del dispositivo, lo que encaja en entornos con requisitos de confidencialidad.
- Procesamiento por lotes de archivos de audio en hindi: se puede integrar en un pipeline local que recorra grabaciones y genere transcripciones sin coste por API.
- Accesibilidad para contenido en hindi: generacion de subtitulos para videos educativos o divulgativos dirigidos a hablantes de hindi.
- Investigacion en ASR de lenguas indias: sirve como referencia para comparar el rendimiento del fine-tuning de Whisper large-v3 sobre Vaani frente a otros checkpoints.
- Prototipado rapido de aplicaciones web de voz: Transformers.js permite montar una demo de transcripcion en hindi sin backend, util para validar producto antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 2,1 GB; en inferencia el encoder fp16 y el decoder q4 requieren del orden de 2 a 3 GB de memoria, aunque no se dispone de una medicion oficial.
- GPU recomendadas: no disponible en la model card; al estar orientado a WebGPU, se espera funcionamiento en GPUs integradas y dedicadas de consumo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 4 GB o mas de VRAM, aunque el dato no esta confirmado.
- Opciones de despliegue: Transformers.js con WebGPU en navegador; el formato ONNX tambien permite usar ONNX Runtime en servidor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| artpark-whisper-large-v3-vaani-hindi-onnx | ~1550 M | 30 s por ventana | Hindi | Apache-2.0 | ONNX |
| ARTPARK-IISc/whisper-large-v3-vaani-hindi | ~1550 M | 30 s por ventana | Hindi | Apache-2.0 | Safetensors (checkpoint original) |
| bjollans/whisper-large-v3-vaani-hindi-ct2 | ~1550 M | 30 s por ventana | Hindi | No disponible | CTranslate2 |

## Limitaciones y advertencias

- El modelo solo cubre hindi; no se debe esperar un rendimiento fiable en otras lenguas.
- Al ser una cuantizacion a 4 bits del decoder, puede existir una perdida de precision respecto al checkpoint original, no cuantificada en la model card.
- Riesgo de alucinacion en pasajes de audio con ruido, silencios largos o habla solapada, comportamiento comun en Whisper.
- Sesgos derivados del dataset Vaani y del corpus de entrenamiento original; no se documentan evaluaciones de sesgo.
- La ventana de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en los limites de segmento.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar a ARTPARK-IISc como autores del modelo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay validacion de la comunidad sobre esta conversion.

## Enlaces

- Hugging Face: https://huggingface.co/subtitleking/artpark-whisper-large-v3-vaani-hindi-onnx
- Modelo base: https://huggingface.co/ARTPARK-IISc/whisper-large-v3-vaani-hindi
- Perfil de ARTPARK-IISc: https://huggingface.co/ARTPARK-IISc/models
- Conversion a CTranslate2 del mismo modelo base: https://huggingface.co/bjollans/whisper-large-v3-vaani-hindi-ct2
- Transformers.js: https://github.com/huggingface/transformers.js
