# swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit

## Resumen

Esta ficha cubre `swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit`, una conversión no oficial a Core ML del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM. El autor de la conversión es el usuario de Hugging Face `swaynehales`, que no tiene relación con IBM y cuya versión no ha sido revisada ni respaldada por el fabricante original. El modelo base es un sistema CTC de 470 millones de parámetros, con 16 bloques conformer y una cabeza BPE multilingüe de 16.384 tokens, publicado por IBM bajo licencia Apache 2.0.

La conversión traslada el modelo a un programa Core ML (`GraniteSpeech.mlpackage`) pensado para inferencia en dispositivos Apple Silicon (macOS 15 o superior), con pesos cuantizados a 8 bits mediante palettización uniforme por grupos de canal y activaciones en fp16. La innovación principal respecto a conversiones previas del mismo autor es la incorporación de una máscara de longitud válida: una segunda entrada `valid_frames` que permite al grafo reproducir los cuatro pasos de enmascaramiento del modelo original (tras la proyección de entrada, sobre las claves de atención, antes de cada convolución depthwise y en el subsampling) y preservar la puntuación final de la frase, algo que las versiones sin máscara perdían en 119 de 141 clips de su corpus de evaluación.

El modelo resulta relevante para desarrolladores que necesiten ASR multilingüe (inglés, francés, alemán, español, portugués, italiano y japonés) ejecutándose localmente en Macs con Apple Silicon, sin depender de servicios en la nube. Al estar bajo Apache 2.0 y ser una conversión de formato, permite uso comercial, aunque con las advertencias habituales de una conversión no oficial y de un ecosistema de carga todavía incompleto: la versión fijada de Granite-MLX (`7ad6b19`) no reconoce el nuevo `model_type` `granite_speech5_coreml_ctc_masked`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 16 bloques conformer con CTC, atención por bloques sobre 128 frames, self-conditioned CTC desde la capa intermedia, subsampling temporal 8x (100 Hz a 12,5 Hz) |
| Parametros totales | 470M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 frames de entrada (327,68 s de audio a 50 frames/s); 4.096 frames de salida CTC (80 ms por frame) |
| Tipos de cuantizacion | 8 bits con palettización uniforme por canal agrupado (group size 1, umbral de peso 2048); activaciones fp16 (ruta de máscara en fp32) |
| Idiomas soportados | multilingüe: inglés, francés, alemán, español, portugués, italiano y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML ML Program (`GraniteSpeech.mlpackage`), mínimo macOS 15 |

## Arquitectura y entrenamiento

El modelo base de IBM es un sistema ASR CTC compuesto por 16 bloques conformer con una cabeza BPE multilingüe de 16.384 tokens. Aplica un subsampling temporal de 8x que reduce la tasa de frames de 100 Hz a 12,5 Hz, usa atención por bloques sobre ventanas de 128 frames y emplea self-conditioned CTC desde la capa intermedia, una técnica que añade supervisión CTC en capas intermedias para estabilizar el entrenamiento. El total de parámetros asciende a 470 millones. La model card de esta conversión remite a la model card de IBM en la revisión fijada (`91dcb0605daf65f88dbb04fef015c423241d941d`) para los detalles de datos de entrenamiento, composición del dataset y posibles fases de RLHF o DPO, que no se reproducen aquí.

La conversión a Core ML introduce varios cambios respecto al modelo original. El formato pasa a ser un programa Core ML de forma fija que acepta dos entradas: `features` (float16, `[1, 16384, 320]`, características log-mel más delta, apiladas por frames y con relleno de ceros) y `valid_frames` (int32, `[1]`, número real de frames antes del relleno). El grafo reproduce los cuatro pasos de enmascaramiento del modelo original y devuelve dos salidas: `frame_ids` (int32, `[1, 4096]`, argmax CTC por frame de 80 ms) y `valid_output_frames` (int32, `[1]`, igual a `floor(valid_frames / 4)`). Los pesos se cuantizan a 8 bits con palettización uniforme por canal agrupado. El frontend de extracción de características no forma parte del grafo: debe calcularse con el procesador de Hugging Face en Python o con el `GraniteFeatureExtractor` de Granite-MLX en Swift. Las unidades de cómputo recomendadas son CPU y GPU (`cpu-gpu`); la colocación en Neural Engine no se midió.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas, incluida la marca final de frase (punto o 。), preservada gracias a la ruta de máscara.
- Salida CTC por frame a 12,5 Hz (80 ms por frame de salida) con identificadores de token BPE.
- Procesamiento de audio de hasta 327,68 segundos por llamada (16.384 frames de entrada a 50 frames/s).
- Ejecución en dispositivo en Apple Silicon mediante Core ML, sin dependencia de red.
- No incluye tool calling, function calling, capacidades de agente ni razonamiento multi-paso: es un modelo puramente ASR.
- No incluye visión, audio generativo ni modo de pensamiento (thinking mode).

## Casos de uso

- Transcripción local en macOS: integrar el `.mlpackage` en una app de escritorio para Mac con Apple Silicon y transcribir reuniones o notas de voz sin enviar audio a la nube, aprovechando la ventana de hasta 327,68 s por llamada.
- Subtitulado de vídeo multilingüe: procesar pistas de audio en inglés, francés, alemán, español, portugués, italiano o japonés y obtener transcripciones con puntuación y mayúsculas listas para publicar.
- Dictado por voz en aplicaciones nativas: usar la salida `frame_ids` junto con `valid_output_frames` para reconstruir texto en tiempo real en un editor o campo de texto, con latencia controlada por la ejecución en CPU/GPU local.
- Indexación y búsqueda de archivos de audio: transcribir un archivo largo troceándolo en fragmentos de hasta 16.384 frames y almacenar el texto para búsqueda semántica o recuperación documental.
- Cumplimiento y privacidad: desplegar transcripción en entornos donde el audio no puede salir del dispositivo (sanitario, legal, financiero), apoyándose en la licencia Apache 2.0 para uso comercial interno.
- Prototipado de pipelines ASR en Swift: usar Granite-MLX con `GraniteFeatureExtractor` para extraer características y alimentar el modelo Core ML en una app macOS, evaluando la calidad antes de migrar a producción.
- Evaluación comparativa de conversiones: emplear la variante con máscara como referencia para medir la pérdida de puntuación final frente a las conversiones sin máscara del mismo autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una comparación cualitativa interna: la versión con máscara coincide con la inferencia oficial en 141 de 141 clips en cuanto a la marca final de frase, mientras que el paquete fp16 sin máscara la pierde en 119 de 141 clips. No se aportan cifras de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/espacio: el repositorio ocupa 0,7 GB; el `.mlpackage` con pesos de 8 bits requiere aproximadamente ese orden de magnitud en disco y en memoria unificada al cargarse.
- GPU recomendadas: Apple Silicon con GPU integrada (series M1, M2, M3, M4); el autor recomienda las unidades de cómputo `cpu-gpu`. La colocación en Neural Engine no se midió.
- Cabe en hardware de consumo: sí, en Macs con Apple Silicon; no está pensado para GPUs NVIDIA ni para CUDA.
- Opciones de despliegue: Core ML en macOS 15 o superior; carga en Python mediante el ejemplo incluido en la model card; en Swift mediante Granite-MLX, aunque la versión fijada (`7ad6b19`) todavía no soporta el `model_type` `granite_speech5_coreml_ctc_masked` y solo acepta `granite_speech5_coreml_ctc` con una única entrada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio maximo | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| `swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit` (esta ficha) | 470M | 16.384 frames (327,68 s) | en, fr, de, es, pt, it, ja | Apache 2.0 | Core ML 8-bit |
| `swaynehales/granite-speech-5.0-470m-turboctc-coreml-*` (sin máscara, mismo autor) | 470M | 16.384 frames, sin máscara | mismos | Apache 2.0 | Core ML fp16 |
| `ibm-granite/granite-speech-5.0-470m-turboctc` (original) | 470M | 16.384 frames | en, fr, de, es, pt, it, ja | Apache 2.0 | safetensors (formato original) |
| `ibm-granite/granite-speech-5.0-470m-turboctc-nc` | 470M | no disponible | solo inglés | CC-BY-NC-SA-4.0 | no disponible |

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado esta versión; cualquier problema de calidad debe atribuirse al conversor, no al modelo original.
- Ecosistema de carga incompleto: la versión fijada de Granite-MLX (`7ad6b19`) no reconoce el `model_type` `granite_speech5_coreml_ctc_masked`; hasta que exista un loader compatible hay que usar el ejemplo en Python de la model card.
- Guarda obligatoria: `valid_frames` debe cumplir 1 ≤ T ≤ 16.384; fuera de ese rango el número de frames de salida no es fiable (por ejemplo, T=20.000 devuelve `valid_output_frames`=5.000, más que los 4.096 frames disponibles).
- Frontend fuera del grafo: la extracción de características (log-mel más delta, apiladas) debe hacerse con el procesador de Hugging Face o con `GraniteFeatureExtractor`; un desajuste en el frontend degrada la transcripción.
- Idiomas limitados a los siete declarados; no se garantiza comportamiento en otras lenguas.
- Riesgo de alucinación y errores de transcripción inherentes a un modelo CTC, especialmente en audio ruidoso, acentos no vistos o solapamiento de hablantes; no se aportan cifras de WER.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero exige incluir copia de la licencia y aviso de cambios; el repositorio incluye `LICENSE` y `MODIFICATIONS.md` con ese propósito.
- No confundir con `ibm-granite/granite-speech-5.0-470m-turboctc-nc`, un modelo distinto solo en inglés bajo CC-BY-NC-SA-4.0 que no se usó en esta conversión.
- Solo macOS 15 o superior y Apple Silicon; no hay soporte para CUDA, ROCm ni otros aceleradores.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit
- Modelo base en Hugging Face: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card del modelo base en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Modelo relacionado (solo inglés, CC-BY-NC-SA-4.0): https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Repositorios de conversiones sin máscara del mismo autor: https://huggingface.co/swaynehales (prefijo `granite-speech-5.0-470m-turboctc-coreml-*`)
- Paper, blog técnico, repositorio de código y demo: no disponibles en la información proporcionada.
