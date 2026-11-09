# subtitleking/ihnatov-whisper-turbo-uk-onnx

## Resumen

`subtitleking/ihnatov-whisper-turbo-uk-onnx` es una conversión a ONNX del checkpoint `ihnatov-yuri/whisper-large-v3-turbo-uk`, un ajuste fino de Whisper large-v3-turbo para reconocimiento automático del habla (ASR) en ucraniano. El modelo original fue entrenado por el usuario de Hugging Face ihnatov-yuri sobre 617 horas de audio mayoritariamente conversacional en ucraniano. Esta versión, publicada por subtitleking, no modifica los pesos ni el entrenamiento: solo cambia el formato de los ficheros para permitir inferencia en el navegador mediante Transformers.js y WebGPU, que es el uso que le da la aplicación SubtitleKing.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de ASR de baja latencia para un idioma con menos recursos (ucraniano) sobre la arquitectura Whisper large-v3-turbo, con un encoder en fp16 y un decoder cuantizado a 4 bits. Por otro, ilustra el patrón de despliegue "modelo en el cliente": el paquete completo ocupa 1,6 GB en el repositorio y está pensado para ejecutarse en GPU del navegador, sin servidor de inferencia.

El modelo hereda la licencia MIT del checkpoint base y está etiquetado únicamente para el idioma `uk`. No se han publicado resultados de benchmarks en la información disponible, y el repositorio no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo), exportado a ONNX |
| Parametros totales | no disponible (el repositorio ocupa 1,6 GB en total) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 s por segmento (característica de Whisper); contexto textual no disponible |
| Tipos de cuantizacion | encoder fp16 (I/O fp32) y decoder merged a 4 bits (MatMul, bloque 32, simétrico) |
| Idiomas soportados | ucraniano (`uk`) |
| Licencia | MIT |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3-turbo, un transformer encoder-decoder para ASR con atención estándar y decodificación autorregresiva. El checkpoint base fue ajustado por ihnatov-yuri sobre 617 horas de audio en ucraniano, con predominio de habla conversacional. No se dispone en la información proporcionada de detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de RLHF o DPO; el autor del ajuste fino no los documenta en esta ficha.

La innovación técnica de esta publicación es exclusivamente de empaquetado. La conversión se realizó con Optimum ONNX en modo `automatic-speech-recognition-with-past`, es decir, con caché de claves y valores para acelerar la decodificación. El encoder se exporta en fp16 con entradas y salidas en fp32, y el decoder se cuantiza a 4 bits con cuantización simétrica por bloques de 32 en las operaciones MatMul. El tokenizer y el preprocesador son los de Whisper large-v3-turbo estándar, porque el checkpoint original mantiene el vocabulario sin cambios y sus ficheros de tokenizer usan un formato que Transformers.js no lee. El proceso es reproducible con las herramientas de `tools/convert-whisper/` del repositorio de SubtitleKing.

## Capacidades

- Reconocimiento automático del habla en ucraniano sobre ventanas de 30 segundos.
- Transcripción sin marcas de tiempo: el modelo se entrenó con `<|notimestamps|>` y no genera timestamps dentro de la ventana.
- Inferencia en navegador mediante Transformers.js con backend WebGPU.
- Decodificación con caché de claves y valores (`with-past`), lo que reduce el coste por token generado.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio más allá del propio ASR.
- Capacidad multilingüe: no disponible; el modelo está etiquetado solo para `uk`.

## Casos de uso

- Subtitulado en tiempo real en el navegador: la aplicación SubtitleKing usa este paquete para transcribir audio ucraniano en el cliente con WebGPU, sin enviar el audio a un servidor. El encoder fp16 y el decoder 4 bits reducen el peso lo suficiente para cargarlo en una pestaña.
- Herramientas de accesibilidad para contenido en ucraniano: transcripción de vídeos, clases o reuniones directamente en la máquina del usuario, con la ventana de 30 s de Whisper como unidad de segmentación.
- Edición de subtítulos en aplicaciones web: al no emitir timestamps internos, encaja en flujos donde el segmentado temporal lo aporta la aplicación (por ejemplo, cortes fijos o VAD externo) y el modelo solo aporta el texto.
- Procesamiento por lotes en local para archivos de audio ucranianos: conversión de entrevistas o podcasts a texto con un pipeline ONNX ejecutado en GPU consumer, sin coste de API.
- Prototipado de ASR para investigación en lenguas eslavas: sirve como referencia de un ajuste fino de Whisper large-v3-turbo sobre habla conversacional en ucraniano, con pesos accesibles y licencia MIT.
- Integración en extensiones o aplicaciones Electron: el formato ONNX y la librería Transformers.js permiten empaquetar el modelo en aplicaciones de escritorio multiplataforma con backend WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 1,6 GB; el encoder fp16 y el decoder 4 bits permiten estimar una huella en memoria del orden de 1-2 GB durante la inferencia, pero no hay medición publicada.
- GPU recomendadas: no disponible. El caso de uso declarado es WebGPU en el navegador, por lo que se apoya en la GPU del equipo cliente.
- GPU consumer: no hay lista oficial de compatibilidad. Al estar pensado para WebGPU, debería funcionar en GPUs integradas y dedicadas que expongan WebGPU en el navegador, pero no se documentan modelos concretos.
- Opciones de despliegue: Transformers.js con ONNX Runtime Web y WebGPU; también es posible ejecutar los ficheros ONNX con otros runtimes compatibles, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| subtitleking/ihnatov-whisper-turbo-uk-onnx | no disponible (repo 1,6 GB) | 30 s por segmento | uk | MIT | ONNX (fp16 + q4) |
| ihnatov-yuri/whisper-large-v3-turbo-uk (modelo base) | no disponible | 30 s por segmento | uk | MIT | safetensors (formato original) |
| openai/whisper-large-v3-turbo | no disponible en la información proporcionada | 30 s por segmento | multilingüe | MIT | safetensors, ONNX en conversiones de la comunidad |

La comparación se limita a estos tres por la información disponible; no se han encontrado en la búsqueda otros ajustes finos de Whisper para ucraniano con datos verificables.

## Limitaciones y advertencias

- El modelo solo está etiquetado para ucraniano; no se garantiza un comportamiento correcto en otros idiomas.
- No genera timestamps dentro de la ventana de 30 s, lo que limita su uso directo en subtitulado con alineación temporal fina sin un componente externo.
- El decoder está cuantizado a 4 bits; la cuantización puede introducir degradación en la calidad de transcripción respecto al checkpoint original en fp16 o fp32, aunque no se han publicado mediciones.
- Riesgo de alucinación: como todo modelo Whisper, puede inventar texto en segmentos con silencio, ruido o habla no ucraniana; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgos por acento, género o registro; el entrenamiento sobre 617 horas "mayoritariamente conversacionales" puede no cubrir bien el habla formal, técnica o con acentos regionales.
- Licencia MIT: permite uso comercial, pero conviene citar el trabajo de ihnatov-yuri, tal como pide el autor de la conversión.
- El paquete depende de Transformers.js y WebGPU; en navegadores sin soporte de WebGPU la inferencia puede no funcionar o caer a un backend más lento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/ihnatov-whisper-turbo-uk-onnx
- Modelo base: https://huggingface.co/ihnatov-yuri/whisper-large-v3-turbo-uk
- Transformers.js: https://github.com/huggingface/transformers.js
- Optimum ONNX: no disponible en la información proporcionada
- Repositorio de SubtitleKing (herramientas de conversión): no disponible en la información proporcionada
