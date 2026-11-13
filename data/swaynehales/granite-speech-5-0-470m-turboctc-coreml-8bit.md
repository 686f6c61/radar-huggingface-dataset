# swaynehales/granite-speech-5.0-470m-turboctc-coreml-8bit

## Resumen

Granite Speech 5.0 470M TurboCTC CoreML 8-bit es una conversión no oficial del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, empaquetada como programa Core ML con pesos cuantizados a 8 bits mediante palettization uniforme. El objetivo es ejecutar reconocimiento de voz multilingüe íntegramente en local sobre Macs con Apple Silicon, sin depender de servicios en la nube ni de frameworks de Python en tiempo de inferencia.

El modelo original es un sistema CTC de 470 millones de parámetros construido sobre 16 bloques conformer, con una cabeza BPE multilingüe de 16.384 tokens y un factor de subsampling temporal de 8× (de 100 Hz a 12,5 Hz). Soporta inglés, francés, alemán, español, portugués, italiano y japonés, con puntuación y capitalización nativas. La conversión fija la forma de entrada a 16.384 tramas (327,68 segundos de audio como máximo) y produce directamente los IDs de token por argmax dentro del grafo.

La relevancia de esta ficha radica en que permite desplegar ASR multilingüe de calidad en hardware de consumo Apple con un único fichero de pesos de aproximadamente 691 MB, bajo licencia Apache 2.0 y con trazabilidad completa de la conversión (hashes SHA-256, scripts de conversión y fichero de modificaciones). Es una opción realista para aplicaciones de dictado, subtitulado o transcripción offline en macOS 15 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques conformer, block attention sobre 128 tramas, self-conditioned CTC desde la capa intermedia) |
| Parametros totales | 470 M (modelo base); pesos cuantizados a 8 bits en esta conversión |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tramas de entrada (327,68 s de audio a 50 tramas/s); 4.096 tramas de salida (80 ms por trama) |
| Tipos de cuantizacion | Palettization uniforme de 8 bits, por canal agrupado, group size 1, umbral de peso 2048; activaciones en fp16 |
| Idiomas soportados | Multilingüe: inglés, francés, alemán, español, portugués, italiano, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`GraniteSpeech.mlpackage`), `weight.bin` de 691.520.192 bytes; requiere macOS 15 mínimo |

## Arquitectura y entrenamiento

El modelo base es un sistema CTC basado en conformer: 16 bloques con atención por bloques sobre ventanas de 128 tramas, subsampling temporal de 8× y una cabeza de clasificación BPE multilingüe de 16.384 tokens. Incorpora self-conditioned CTC desde la capa intermedia, una técnica que realimenta las predicciones intermedias para estabilizar el entrenamiento CTC en redes profundas. La conversión a Core ML reimplementa el grafo en PyTorch con operaciones explícitas y lo traza con coremltools 9.0, fijando la forma de entrada y moviendo el argmax CTC dentro del grafo para devolver directamente `frame_ids`.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos corresponden a la model card de IBM en la revisión fijada (`91dcb06`), no incluida aquí. La innovación destacable de esta conversión es la cuantización por palettization de 8 bits con granularidad por canal y umbral de peso, que reduce el tamaño del fichero a ~691 MB manteniendo activaciones en fp16, más la eliminación del frontend del grafo: las features log-mel + delta deben calcularse externamente con el processor de Hugging Face o con `GraniteFeatureExtractor` de Granite-MLX.

## Capacidades

- Reconocimiento automático del habla (ASR) en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas, sin postprocesado adicional.
- Salida CTC con argmax por trama de 80 ms, lo que facilita alineamientos temporales aproximados.
- Procesamiento de audio de hasta 327,68 segundos por inferencia (entrada zero-padded a 16.384 tramas).
- Ejecución on-device en Apple Silicon con unidades de cómputo CPU y GPU.
- Integración con el reconocedor Core ML de Granite-MLX mediante el esquema `coreml_config.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Dictado por voz en aplicaciones macOS: el modelo se integra como programa Core ML en una app nativa y transcribe en local sin enviar audio a servidores, con latencia baja gracias a los 470 M de parámetros y la cuantización de 8 bits.
- Subtitulado offline de vídeo: se procesan segmentos de hasta 327,68 s por inferencia, generando transcripciones con puntuación y capitalización listas para publicar.
- Transcripción de reuniones multilingües: al cubrir siete idiomas, un mismo pipeline puede transcribir reuniones en español, inglés o alemán sin cambiar de modelo.
- Asistentes de voz embebidos: la inferencia on-device elimina la dependencia de red y protege la privacidad del audio del usuario, adecuado para aplicaciones de salud o legal.
- Indexación y búsqueda de archivos de audio: la salida CTC por trama de 80 ms permite alinear transcripción y audio para generar índices temporales.
- Prototipado e investigación en ASR: el paquete incluye hashes SHA-256, `CONVERSION.json` y scripts de conversión reproducibles, lo que facilita experimentos comparativos con el modelo original de IBM.
- Aplicaciones de accesibilidad: transcripción en tiempo real de conversaciones presenciales en un Mac sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica (Apple Silicon usa memoria unificada); el fichero de pesos ocupa ~691 MB y el modelo completo en ejecución requiere aproximadamente 1-1,5 GB de memoria unificada, estimación no confirmada por el autor.
- GPU recomendadas: Apple Silicon con GPU integrada; el autor ejecutó la conversión en un Apple M2 Max con macOS 27.0.1.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon y macOS 15 o superior; no se ha medido el rendimiento en Neural Engine.
- Opciones de despliegue: Core ML (unidades CPU y GPU), con integración en Granite-MLX; no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC CoreML 8-bit (esta ficha) | 470 M (8-bit) | 327,68 s de audio | 7 idiomas | Apache 2.0 | Core ML |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470 M | no disponible | 7 idiomas | Apache 2.0 | safetensors (Hugging Face) |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470 M | no disponible | inglés | CC-BY-NC-SA-4.0 | safetensors (Hugging Face) |
| Whisper (variantes pequeñas) | no disponible en la información proporcionada | no disponible | multilingüe | MIT (según versión) | múltiples |

La comparación con Whisper no puede completarse con datos verificados en la información proporcionada; se indica únicamente como referencia de categoría.

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado este paquete; la responsabilidad de validación recae en el usuario.
- El grafo Core ML tiene forma fija y no usa máscara de atención, por lo que el comportamiento puede diferir ligeramente de la inferencia original de IBM.
- La entrada debe rellenarse con zero-padding hasta 16.384 tramas; audios más largos de 327,68 s requieren segmentación manual.
- El frontend de features no está incluido en el grafo: es obligatorio calcular log-mel + delta con el processor de Hugging Face o `GraniteFeatureExtractor`.
- No se ha medido el rendimiento en Neural Engine; solo se recomienda CPU y GPU.
- Riesgo de alucinación en ASR: en audio ruidoso o con acentos no cubiertos, el modelo CTC puede producir transcripciones incorrectas sin señal de confianza explícita.
- Sesgos lingüísticos y acústicos heredados del modelo base de IBM; no evaluados en esta conversión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige incluir copia de la licencia y aviso de cambios (sección 4); el paquete ya incluye `LICENSE` y `MODIFICATIONS.md`.
- No confundir con `granite-speech-5.0-470m-turboctc-nc`, que es inglés y CC-BY-NC-SA-4.0, con restricciones para uso comercial.
- Dependencia de macOS 15 o superior y de Apple Silicon; no ejecutable en Linux, Windows ni GPUs NVIDIA.

## Enlaces

- Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-8bit
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card del modelo base en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Repositorio Granite-MLX: https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
