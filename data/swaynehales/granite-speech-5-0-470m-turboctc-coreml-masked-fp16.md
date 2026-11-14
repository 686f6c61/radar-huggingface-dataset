# swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-fp16

## Resumen

Granite Speech 5.0 470M TurboCTC CoreML masked fp16 es una conversión no oficial a Core ML del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario swaynehales. El objetivo es ejecutar ASR multilingüe en local sobre Apple Silicon (macOS 15 o superior) mediante Core ML, manteniendo precisión fp16 completa en los pesos y añadiendo una entrada de máscara de longitud válida (`valid_frames`) que reproduce el enmascaramiento de atención y padding del modelo original.

El modelo base es un sistema CTC de 470M parámetros con 16 bloques conformer, cabecera BPE multilingüe de 16.384 tokens, submuestreo temporal 8x (de 100 Hz a 12,5 Hz) y atención por bloques de 128 frames. Soporta inglés, francés, alemán, español, portugués, italiano y japonés con puntuación y capitalización nativas. La conversión conserva la licencia Apache 2.0 del original.

La relevancia de esta ficha radica en que es un ejemplo de despliegue on-device de un modelo ASR de tamaño medio: elimina la dependencia de servicios en la nube y permite transcripción local en Macs con chip Apple. La principal diferencia frente a las conversiones Core ML previas del mismo autor es la incorporación de la máscara de longitud válida, que corrige la pérdida del punto final de frase que sufrían las versiones sin máscara.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques), submuestreo temporal 8x, atención por bloques de 128 frames, self-conditioned CTC desde capa intermedia |
| Parámetros totales | 470M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 frames de entrada (327,68 s de audio a 50 frames/s); 4.096 frames de salida (80 ms por frame) |
| Tipos de cuantización | fp16 (pesos y activaciones); sin compresión de pesos; ruta de máscara en fp32 |
| Idiomas soportados | multilingüe: inglés, francés, alemán, español, portugués, italiano, japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`GraniteSpeech.mlpackage`), mínimo macOS 15 |

Especificaciones adicionales de la conversión:

| Parámetro | Valor |
|---|---|
| Entrada `features` | float16, `[1, 16384, 320]` (log-mel + delta, frame-stacked, zero-padded) |
| Entrada `valid_frames` | int32, `[1]`, rango válido 1 ≤ T ≤ 16384 |
| Salida `frame_ids` | int32, `[1, 4096]` (argmax CTC por frame de salida) |
| Salida `valid_output_frames` | int32, `[1]`, igual a `floor(T / 4)` |
| Unidades de cómputo recomendadas | CPU y GPU (`cpu-gpu`); Neural Engine no medido |
| Frontend de features | fuera del grafo: procesador de Hugging Face (Python) o `GraniteFeatureExtractor` de Granite-MLX (Swift) |
| Tamaño del repo | 1,0 GB |
| Revisión del modelo base | `91dcb0605daf65f88dbb04fef015c423241d941d` |

## Arquitectura y entrenamiento

El modelo base es un sistema de reconocimiento del habla basado en Conformer con 16 bloques y entrenamiento CTC. Aplica un submuestreo temporal de 8x que reduce la representación de 100 Hz a 12,5 Hz, emplea atención por bloques sobre ventanas de 128 frames y utiliza self-conditioned CTC desde una capa intermedia. La cabecera de salida es una BPE multilingüe de 16.384 tokens. El modelo suma 470M parámetros en total.

La conversión a Core ML mantiene los pesos en fp16 sin compresión y reproduce las cuatro etapas de enmascaramiento del modelo original: tras la proyección de entrada, sobre las claves de atención, antes de cada convolución depthwise y con reducción a la mitad de la longitud tras cada capa de submuestreo. El grafo es de forma fija y recibe el número real de frames mediante `valid_frames`. Los detalles completos de datos de entrenamiento, número de tokens y composición del dataset no están disponibles en la información proporcionada; la model card remite a la documentación de IBM en la revisión fijada.

## Capacidades

- Reconocimiento automático del habla (ASR) con salida CTC a nivel de token.
- Transcripción multilingüe en siete idiomas: inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas, incluido el punto final de frase (o `。` en japonés).
- Procesamiento de audio de hasta 327,68 segundos por llamada (16.384 frames a 50 frames/s).
- Enmascaramiento de longitud válida para evitar que el padding afecte a la decodificación.
- Ejecución on-device en Apple Silicon mediante Core ML, sin conexión a servicios externos.
- No dispone de tool calling, function calling, capacidades de agente, visión ni audio generativo; es un modelo exclusivamente ASR.

## Casos de uso

- Transcripción local en macOS: integrar el `.mlpackage` en una app de dictado o notas de voz que transcriba audio en el dispositivo, aprovechando la ventana de 327,68 s por llamada y la ausencia de envío de datos a la nube.
- Subtitulado de reuniones y videollamadas: procesar segmentos de audio de hasta cinco minutos y medio por invocación, con puntuación y mayúsculas nativas que reducen el postprocesado.
- Atención al cliente con transcripción de llamadas: convertir grabaciones multilingües (español, inglés, francés, etc.) en texto para análisis de calidad, con la ventaja de que el procesamiento puede residir en el propio equipo del agente.
- Accesibilidad: dictado por voz para usuarios con movilidad reducida en aplicaciones de escritorio de macOS, sin latencia de red ni cuotas de API.
- Archivado y búsqueda de contenido audiovisual: transcribir podcasts o grabaciones para indexación semántica, troceando el audio en fragmentos que respeten el límite de 16.384 frames.
- Investigación en ASR: banco de pruebas para evaluar modelos CTC multilingües en hardware Apple, comparando la ruta con máscara frente a las conversiones sin máscara del mismo autor.
- Prototipado de pipelines de voz en Swift: usar `GraniteFeatureExtractor` de Granite-MLX para calcular features y el grafo Core ML para la inferencia, manteniendo todo el flujo en el ecosistema Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una comparación de calidad de transcripción: la versión con máscara coincide con la inferencia oficial en 141 de 141 clips en cuanto al signo de puntuación final, mientras que la versión sin máscara fp16 lo omite en 119 de 141 clips.

## Requisitos de hardware

- VRAM/espacio en disco: el repositorio ocupa 1,0 GB; los pesos fp16 sin compresión requieren aproximadamente ese tamaño en memoria al cargar el modelo.
- GPU recomendadas: Apple Silicon (serie M) con macOS 15 o superior; unidades de cómputo recomendadas CPU y GPU (`cpu-gpu`).
- Cabe en hardware de consumo: sí, en Macs con chip Apple Silicon; no está pensado para GPUs NVIDIA ni para CUDA.
- Opciones de despliegue: Core ML directamente; el cargador de Granite-MLX en la versión fijada `7ad6b19` no soporta aún el `model_type` `granite_speech5_coreml_ctc_masked`, por lo que hasta que exista soporte hay que usar el ejemplo en Python incluido en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada; la colocación en Neural Engine no fue medida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC CoreML masked fp16 (esta ficha) | 470M | 327,68 s (16.384 frames) | 7 idiomas | Apache 2.0 | Core ML fp16 |
| Granite Speech 5.0 470M TurboCTC (IBM, original) | 470M | 327,68 s (16.384 frames) | 7 idiomas | Apache 2.0 | safetensors (bf16) |
| Conversiones Core ML sin máscara del mismo autor | 470M | 327,68 s (16.384 frames) | 7 idiomas | Apache 2.0 | Core ML fp16 |
| Granite Speech 5.0 470M TurboCTC NC (IBM) | 470M | no disponible | inglés | CC-BY-NC-SA-4.0 | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado esta versión; los créditos del modelo pertenecen a IBM Granite.
- El cargador de Granite-MLX fijado (`7ad6b19`) no carga este modelo; se requiere un cargador que soporte `granite_speech5_coreml_ctc_masked` o usar el ejemplo en Python.
- El frontend de features no está incluido en el grafo: hay que calcular log-mel + delta con el procesador de Hugging Face o con `GraniteFeatureExtractor` de Granite-MLX.
- Guarda obligatoria en el consumidor: comprobar `1 <= T <= 16384` antes de llamar; fuera de ese rango el número de frames de salida no es fiable (T=20000 devuelve 5000 frames válidos con solo 4096 disponibles; T=-1 devuelve -1; T entre 1 y 3 devuelve 0 frames).
- Los frames de salida a partir de `valid_output_frames` no están definidos y no deben interpretarse.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente en audio con ruido, acentos no cubiertos o solapamiento de hablantes; no se han publicado análisis de sesgos en la información disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige incluir una copia de la licencia y un aviso de cambios en la redistribución; el repositorio incluye `LICENSE` y `MODIFICATIONS.md` con ese propósito.
- No confundir con `ibm-granite/granite-speech-5.0-470m-turboctc-nc`, modelo distinto, solo en inglés y bajo CC-BY-NC-SA-4.0, que no se usó en esta conversión.
- Limitado a macOS 15 o superior y a hardware Apple; no hay soporte para CUDA ni para otros aceleradores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-fp16
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card del modelo base en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Modelo NC (no utilizado en esta conversión): https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
