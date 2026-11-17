# subtitleking/qwen3-asr-1.7b-onnx

## Resumen

qwen3-asr-1.7b-onnx es una conversión a ONNX del modelo de reconocimiento automático de voz Qwen3-ASR-1.7B, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio, publicado por el usuario subtitleking, no modifica la arquitectura ni los pesos más allá del cambio de formato y de precisión numérica: su objetivo es permitir la inferencia directamente en el navegador mediante ONNX Runtime Web sobre WebGPU, orientado a aplicaciones de subtitulado (el autor lo usa en SubtitleKing / Wolfcaps).

El modelo resuelve la transcripción de audio a texto, con foco declarado en mandarín (zh) y cantonés (yue), e incluye un alineador para la decodificación temporal. Con 1.700 millones de parámetros y un repositorio de 1,9 GB, es un modelo de tamano medio que prioriza la viabilidad de ejecución en cliente frente a la maxima precision de los modelos ASR de gran escala.

Su relevancia actual radica en la combinacion de licencia Apache-2.0, pesos cuantizados a 4 bits y grafos ONNX escritos por un conversor propio (no trazados), lo que facilita el despliegue de ASR multilingue sin infraestructura de servidor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder para ASR (modelo base Qwen3-ASR-1.7B), exportado a grafos ONNX |
| Parametros totales | 1.700 millones (1.7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventanas de audio de 8 s en el encoder) |
| Tipos de cuantizacion | FP16 (encoder de audio) y 4 bits GPTQ (embed_tokens y decoder, nodos MatMulNBits) |
| Idiomas soportados | zh (mandarin), yue (cantonés); la model card indica "and more" sin detallar |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX con datos externos (*.onnx_data); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3-ASR-1.7B es un sistema de reconocimiento de voz de tipo encoder-decoder: un encoder de audio procesa ventanas de 8 segundos y un decoder autorregresivo genera los tokens de transcripcion con cache KV. La conversion a ONNX separa los componentes en tres grafos: `audio_encoder_fp16.onnx` (encoder en FP16), `embed_tokens_q4.onnx` y `decoder_model_merged_q4.onnx` (decoder con pesos GPTQ de 4 bits y cache KV). Los grafos no son trazados, sino escritos por el conversor propio del autor (`tools/convert-qwen/` en el repositorio SubtitleKing), que documenta entradas y salidas, extraccion de caracteristicas log-mel al estilo Whisper, ids de tokens de prompt, decodificacion greedy y el proceso de alineacion temporal.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens de audio ni si hubo etapas de RLHF o DPO. La innovacion tecnica del repositorio es de despliegue: todos los operadores cuentan con kernel en ONNX Runtime WebGPU, los nodos `MatMulNBits` de 4 y 8 bits usan `accuracy_level` 4, y el `config.json` conserva el `model_type` del modelo original (Transformers.js aun no tiene clase para el) anadiendo los tamanos que necesitan los grafos, mientras que `preprocessor_config.json` fija `sampling_rate` a 16000.

## Capacidades

- Reconocimiento automatico de voz (audio a texto) en mandarin y cantonés, con soporte declarado de mas idiomas sin especificar.
- Decodificacion greedy con cache KV en el decoder.
- Alineacion temporal mediante un alineador incluido en la conversion, con decodificacion de tiempos documentada.
- Extraccion de caracteristicas log-mel al estilo Whisper a 16 kHz.
- Ejecucion en navegador con ONNX Runtime Web sobre WebGPU.
- No se documentan capacidades de tool calling, agentes, vision, audio de salida ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado en navegador: el modelo puede transcribir audio y producir marcas de tiempo mediante su alineador, ejecutandose integramente en el cliente con WebGPU sin enviar el audio a un servidor, lo que es adecuado para herramientas de edicion de subtitulos como SubtitleKing.
- Transcripcion de contenido en mandarin y cantonés: util para medios, podcasts o video divulgativo dirigido a audiencias de China continental, Hong Kong y Macao, donde el cantonés tiene poca cobertura en modelos ASR genericos.
- Herramientas de accesibilidad web: integracion en reproductores o plataformas educativas que necesiten generar subtitulos en tiempo real sin backend, gracias a los pesos de 4 bits que reducen el consumo de memoria.
- Procesamiento por lotes en local: transcripcion de archivos de audio en estaciones de trabajo sin GPU dedicada de servidor, usando los grafos ONNX con datos externos.
- Investigacion en ASR de bajo recurso: el repositorio sirve como referencia de conversion ONNX WebGPU de un modelo encoder-decoder con cuantizacion GPTQ, reutilizable para experimentos de despliegue.
- Prototipado rapido de aplicaciones de voz: al no requerir infraestructura, permite validar flujos de dictado o busqueda por voz en demos web antes de invertir en despliegue servidor.

## Benchmarks y rendimiento

Resultados de MER (tasa de error de coincidencia de caracteres) publicados en la model card, comparando la ejecucion en Chromium sobre WebGPU con la referencia en PyTorch:

| Conjunto de evaluacion | ONNX WebGPU (%) | PyTorch original (%) |
|---|---|---|
| FLEURS mandarin | 1,81 | 1,88 |
| SpeechIO | 3,90 | 3,76 |
| FLEURS cantonés | 4,39 | 4,44 |
| Common Voice cantonés | 6,19 | 6,06 |

La degradacion por la conversion y la cuantizacion es marginal (inferior a 0,15 puntos porcentuales en la mayoria de conjuntos). No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1,9 GB en disco; con encoder FP16 y decoder de 4 bits, la inferencia requiere del orden de 2 GB de memoria de GPU, aunque el autor no publica una cifra oficial.
- GPU recomendadas: cualquier GPU con soporte WebGPU en Chromium; en el servidor, tarjetas con al menos 4 GB de VRAM como RTX 3050 o superiores.
- Cabe en GPU de consumo: si, incluidas GPUs integradas modernas con WebGPU, aunque el rendimiento dependera del ancho de banda de memoria.
- Opciones de despliegue: ONNX Runtime Web con WebGPU (objetivo principal); tambien ONNX Runtime nativo con el proveedor CUDA o CPU.
- Latencia y throughput: no disponibles; la model card solo reporta precision, no velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Ejecucion en navegador |
|---|---|---|---|---|---|
| qwen3-asr-1.7b-onnx | 1,7B | zh, yue y otros sin detallar | ONNX (FP16 + 4 bits) | Apache-2.0 | Si (WebGPU) |
| Whisper large-v3 (OpenAI) | 1,55B | Multilingue amplio | Safetensors, GGML/GGUF | MIT | Posible via ONNX/WebGPU, no es el objetivo del repo |
| Qwen3-ASR-1.7B original | 1,7B | zh, yue y otros | Safetensors (PyTorch) | Apache-2.0 | No, requiere servidor |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Cobertura linguistica limitada segun la model card: mandarin y cantonés confirmados; el resto de idiomas no esta detallado ni evaluado.
- Riesgo de alucinacion y de transcripciones erroneas en audio con ruido, acentos no estandar o cambios de hablante; los MER publicados (hasta 6,19 % en Common Voice cantonés) indican margen de error apreciable.
- La cuantizacion a 4 bits del decoder y de los embeddings introduce una pequena perdida de precision respecto al modelo original.
- Dependencia de WebGPU y de un navegador Chromium reciente para el caso de uso principal; la compatibilidad con otros navegadores no esta documentada.
- Transformers.js no dispone aun de clase para este `model_type`, lo que limita la integracion con ese ecosistema.
- Licencia Apache-2.0 permite uso comercial, pero el autor recomienda citar el trabajo del equipo Qwen; el repositorio solo cambia formato y precision.
- No hay informacion sobre sesgos demograficos o dialectales especificos del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subtitleking/qwen3-asr-1.7b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Repositorio SubtitleKing (conversor y especificacion de grafos): no se proporciona URL directa en la informacion disponible
