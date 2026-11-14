# swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-4bit

## Resumen

Granite Speech 5.0 470M TurboCTC CoreML masked 4-bit es una conversión no oficial a Core ML del modelo de reconocimiento automático del habla Granite Speech 5.0 470M TurboCTC de IBM, publicada por el usuario swaynehales. El objetivo es ejecutar reconocimiento de voz multilingüe en local sobre Macs con Apple Silicon, sin depender de servicios en la nube y con un consumo de memoria reducido gracias a una cuantización de pesos lineales a 4 bits.

El modelo base es un sistema CTC (Connectionist Temporal Classification) de 470 millones de parámetros construido sobre 16 bloques conformer, con un cabezal BPE multilingüe de 16.384 tokens, subsampling temporal de factor 8 (de 100 Hz a 12,5 Hz), atención por bloques de 128 frames y CTC autoacondicionado desde la capa intermedia. La conversión añade una entrada de máscara (`valid_frames`) que reproduce las cuatro etapas de enmascaramiento del modelo original, corrigiendo el defecto de las conversiones previas sin máscara, que perdían el punto final de la frase en la mayoría de los clips.

La relevancia de esta ficha radica en que permite evaluar una opción de despliegue en dispositivo (on-device) para transcripción multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés, con puntuación y capitalización nativas. No obstante, el propio autor advierte de que la cuantización a 4 bits sacrifica precisión frente a la variante de 8 bits, especialmente en portugués, y de que requiere un cargador que soporte el tipo de modelo `granite_speech5_coreml_ctc_masked`, aún no disponible en la versión fijada de Granite-MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques conformer, CTC autoacondicionado) |
| Parametros totales | 470M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 frames de entrada (forma fija); subsampling de factor 8 |
| Tipos de cuantizacion | Pesos lineales a 4 bits (Core ML); existe variante de 8 bits del mismo autor |
| Idiomas soportados | Multilingüe: en, fr, de, es, pt, it, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (paquete `.mlpackage`/programa Core ML); repo de 0,3 GB |

## Arquitectura y entrenamiento

El modelo base de IBM es un sistema de reconocimiento del habla end-to-end basado en CTC, con 16 bloques conformer y un cabezal BPE multilingüe de 16.384 tokens. Aplica un subsampling temporal de factor 8, que reduce la secuencia de 100 Hz a 12,5 Hz, y utiliza atención por bloques sobre ventanas de 128 frames. Incorpora CTC autoacondicionado desde la capa intermedia, una técnica que realimenta las predicciones intermedias para mejorar la convergencia y la calidad de la transcripción. El total de parámetros asciende a 470M.

Esta conversión concreta no reentrena el modelo: modifica el formato (un programa Core ML de forma fija que aplica las máscaras de atención y padding de IBM a partir de una entrada `valid_frames`), reduce la precisión de los pesos a 4 bits, ajusta un parámetro del tokenizador y añade avisos de cambio. El grafo reproduce las cuatro etapas de enmascaramiento del original: tras la proyección de entrada, sobre las claves de atención, antes de cada convolución depthwise y reduciendo la longitud a la mitad tras cada capa de subsampling. La entrada `valid_frames` (int32 `[1]`) indica el número de frames reales antes del padding, y la salida `valid_output_frames` (int32 `[1]`) equivale a `floor(valid_frames / 4)`. Los detalles de datos de entrenamiento, composición del dataset y uso de RLHF/DPO no están disponibles en la información proporcionada; se remite a la model card de IBM en la revisión fijada.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas en la salida, incluido el punto final de frase (el enmascaramiento corrige la pérdida observada en las conversiones sin máscara).
- Procesamiento de audio largo: un clip de 286,5 segundos se procesa en una sola pasada según las mediciones del autor.
- Inferencia en dispositivo sobre Apple Silicon mediante Core ML, sin conexión a red.
- Entrada con máscara de longitud válida (`valid_frames`) para evitar el cómputo sobre padding.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio generativo ni modo de razonamiento; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción local en macOS: integrar el paquete Core ML en una aplicación de dictado o notas de voz que transcriba en el propio Mac sin enviar audio a la nube, aprovechando el soporte de Apple Silicon y el bajo peso del repo (0,3 GB).
- Subtitulado de vídeo multilingüe: generar subtítulos para contenido en inglés, francés, alemán, español, portugués, italiano o japonés con puntuación y mayúsculas correctas, procesando clips largos en una sola pasada.
- Actas de reuniones: transcribir grabaciones de reuniones en varios idiomas en local, con la ventaja de privacidad que supone no externalizar el audio.
- Prototipado de asistentes de voz: usar el modelo como componente ASR en un pipeline de voz a texto sobre Mac para experimentar con comandos y consultas multilingües.
- Investigación en ASR en dispositivo: servir como referencia cuantizada para comparar el impacto de 4 bits frente a 8 bits y fp16 en precisión (WER/CER) sobre corpus como LibriSpeech y FLEURS.
- Archivado y búsqueda de audio: transcribir archivos de audio históricos o grabaciones de campo en varios idiomas para indexarlos y hacerlos buscables, aceptando la pérdida de precisión en portugués como compromiso.
- Evaluación de despliegues Core ML: emplear el paquete como caso de prueba para cargadores y runtimes que deban soportar el tipo `granite_speech5_coreml_ctc_masked` y entradas con máscara.

## Benchmarks y rendimiento

El autor publica diferencias de palabra o carácter en porcentaje (normalizadas; menor es mejor) medidas a través de la ruta Python indicada, comparando esta variante de 4 bits con la fp16 enmascarada, la 8 bits enmascarada y la inferencia oficial de IBM:

| Conjunto (clips) | vs fp16 enmascarada | vs 8 bits enmascarada | vs inferencia oficial IBM |
|---|---:|---:|---:|
| LibriSpeech en (73) | 1,11 | 1,20 | 1,11 |
| FLEURS fr (10) | 2,33 | 2,33 | 2,33 |
| FLEURS de (10) | 0,41 | 0,41 | 0,41 |
| FLEURS es (10) | 0,86 | 1,72 | 0,86 |
| FLEURS pt (10) | 6,59 | 6,23 | 6,59 |
| FLEURS it (10) | 1,70 | 2,13 | 1,70 |
| FLEURS ja (10, CER) | 2,50 | 2,50 | 2,50 |
| Audio largo (5 clips de política emparejada; el clip de 286,5 s en una sola pasada) | 1,69 | 1,66 | 1,69 (vs oficial por trozos) |

Los conjuntos FLEURS solo contienen 10 clips cada uno. El autor señala además que esta variante añade un punto final que la inferencia oficial no incluye en 3 de 141 clips, y que su coste de precisión es mayor en portugués (6,59%) y en una grabación privada de 5 minutos (3,33%). No se publican resultados de benchmarks estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR.

## Requisitos de hardware

- VRAM/memoria unificada: el repo ocupa 0,3 GB; al ser Core ML para Apple Silicon, el modelo se ejecuta sobre memoria unificada del chip, no sobre VRAM dedicada de GPU.
- GPU recomendadas: Apple Silicon (serie M) con soporte Core ML; no se especifican modelos concretos de chip en la información disponible.
- Cabe en GPU de consumo: sí, en Macs con Apple Silicon; no está pensado para GPUs NVIDIA ni AMD.
- Opciones de despliegue: Core ML en macOS; la versión fijada de Granite-MLX (`7ad6b19`) no carga este tipo de modelo, por lo que hasta que exista un cargador compatible debe usarse el ejemplo en Python del autor. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (4 bits enmascarado) | 470M | 16.384 frames | 7 idiomas | Apache 2.0 | Core ML | Cuantización 4 bits; requiere cargador específico |
| swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit | 470M | 16.384 frames | 7 idiomas | Apache 2.0 | Core ML | Misma conversión en 8 bits; recomendada por el autor por precisión |
| ibm-granite/granite-speech-5.0-470m-turboctc (original) | 470M | 16.384 frames | 7 idiomas | Apache 2.0 | safetensors (formato original) | Referencia oficial; sin cuantizar |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470M | no disponible | solo inglés | CC-BY-NC-SA-4.0 | no disponible | Modelo distinto, no usado en esta conversión; uso no comercial |

## Limitaciones y advertencias

- La cuantización a 4 bits reduce la precisión frente a 8 bits y fp16; el autor recomienda la variante de 8 bits salvo que el tamaño o la memoria sean prioritarios.
- El mayor coste de precisión se observa en portugués (6,59% frente a la inferencia oficial) y en una grabación privada de 5 minutos (3,33%).
- Añade un punto final que la inferencia oficial no produce en 3 de 141 clips.
- Requiere un cargador que soporte el tipo `granite_speech5_coreml_ctc_masked`; la versión fijada de Granite-MLX no lo carga y pasa una sola entrada.
- Los conjuntos de evaluación FLEURS tienen solo 10 clips por idioma, por lo que las cifras tienen alta varianza.
- Es una conversión no oficial: IBM no la ha revisado ni respaldado.
- Riesgo de sesgos y alucinaciones inherente al modelo base; no se documentan análisis específicos en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la redistribución debe incluir copia de la licencia y aviso de cambios (sección 4); el repo incluye `LICENSE` y `MODIFICATIONS.md`.
- No confundir con `granite-speech-5.0-470m-turboctc-nc`, de licencia CC-BY-NC-SA-4.0 y solo inglés.
- Solo funciona en el ecosistema Apple (Core ML); no hay soporte documentado para GPUs NVIDIA ni otros runtimes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-4bit
- Variante de 8 bits enmascarada: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-coreml-masked-8bit
- Modelo base de IBM: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card de IBM en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Modelo alternativo solo inglés: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc-nc
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
