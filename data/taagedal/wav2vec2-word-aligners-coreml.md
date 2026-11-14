# taagedal/wav2vec2-word-aligners-coreml

## Resumen

`wav2vec2-word-aligners-coreml` es una colección de cuatro conversiones a Core ML de modelos wav2vec2 CTC para *forced alignment* de palabras, publicadas por el desarrollador taagedal como componente auxiliar de su aplicación Aagedal Media Converter. No se trata de un modelo entrenado desde cero, sino de un empaquetado en formato Core ML de pesos ya existentes de NbAiLab (noruego bokmål y nynorsk), KBLab (sueco) y Meta AI (inglés), sin reentrenamiento alguno. El objetivo es reajustar la marca temporal de cada palabra tras una transcripción de Whisper, de modo que los subtítulos empiecen y acaben exactamente con el habla.

La relevancia es práctica: Whisper ofrece timestamps a nivel de segmento con precisión limitada, y este tipo de alineadores CTC permite obtener límites por palabra con una fidelidad muy superior sin necesidad de un segundo modelo generativo. Al estar convertidos a Core ML en float16 con entrada flexible de 0,5 a 40 segundos a 16 kHz, están pensados para ejecutarse de forma local y eficiente en Apple Silicon (macOS 15 o superior), evitando dependencias de PyTorch en producción.

Cada archivo incluye `Wav2Vec2CTC.mlpackage` y `aligner.json`, y la aplicación verifica el SHA-256 antes de compilar el modelo. La colección cubre cinco códigos de idioma (noruego bokmål, noruego nynorsk, sueco e inglés) y el repositorio ocupa 1,9 GB en total, aunque cada archivo individual pesa entre 175 MB y 584 MB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 con cabeza CTC (conversión a Core ML ML Program) |
| Parametros totales | 300M (variantes nb, nn), large (sv), base (en); cifra exacta no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | audio de 0,5 a 40 segundos a 16 kHz (entrada flexible) |
| Tipos de cuantizacion | float16 (Core ML ML Program) |
| Idiomas soportados | no (noruego), nb (bokmål), nn (nynorsk), sv (sueco), en (inglés) |
| Licencia | per-file: Apache-2.0 (nb, nn, en) y CC0-1.0 (sv) |
| Formato de pesos | `.mlpackage` (Core ML) + `aligner.json` con vocabulario, blank y delimitador de palabra |

## Arquitectura y entrenamiento

Los modelos subyacentes son wav2vec2 con decodificación CTC, entrenados originalmente por NbAiLab, KBLab y Meta AI sobre audio de sus respectivos idiomas. Esta publicación no entrena ni ajusta pesos: es una conversión de formato realizada con PyTorch 2.7.0, transformers 4.57.6 y coremltools 9.0 mediante el script `convert-wav2vec2-coreml.py`. El trazado añade una capa `log_softmax` a la salida, de modo que el modelo devuelve log-probabilidades por frame en lugar de logits.

La conversión a Core ML ML Program en float16 admite entrada flexible de 0,5 a 40 segundos de audio a 16 kHz y requiere macOS 15 o posterior. El tokenizador original se exporta a `aligner.json`, que contiene el vocabulario, el token blank y el delimitador de palabra necesarios para el alineamiento forzado. El autor verifica la fidelidad de la conversión comparando la salida con el modelo PyTorch original: a 3 s y 17 s de entrada, cada modelo convertido elige el mismo token que el original en todos los frames.

## Capacidades

- Alineamiento forzado de palabras (*forced alignment*) sobre audio ya transcrito, empleando decodificación CTC.
- Generación de marcas temporales de inicio y fin por palabra para subtitulado.
- Reconocimiento de voz CTC directo (pipeline `automatic-speech-recognition`), aunque su uso previsto es el alineamiento.
- Procesamiento de audio de 0,5 a 40 segundos por inferencia a 16 kHz.
- Cobertura multilingüe: noruego bokmål, noruego nynorsk, sueco e inglés, cada uno en un archivo independiente.
- Ejecución local en Apple Silicon mediante Core ML, sin dependencia de PyTorch en tiempo de inferencia.
- Integración verificable por SHA-256 y compilación en el dispositivo.

## Casos de uso

- Subtitulado automático de precisión: tras transcribir con Whisper, se reajustan las marcas de cada palabra con el alineador del idioma correspondiente para que los subtítulos empiecen y acaben con el habla, corrigiendo la imprecisión de los timestamps por segmento.
- Aplicaciones de edición de vídeo en macOS: Aagedal Media Converter lo usa para generar subtítulos sincronizados directamente en el equipo del usuario, sin subir audio a la nube.
- Generación de transcripciones con timestamps a nivel de palabra: útil para búsqueda dentro de audio, navegación por fragmentos o resaltado tipo karaoke.
- Análisis lingüístico y corpus orales: alineamiento de grabaciones con transcripciones para estudios fonéticos o de duración de palabras en noruego y sueco.
- Doblaje y localización: obtención de límites por palabra para sincronizar doblajes o ajustar duraciones de segmentos en flujos de postproducción.
- Pipelines de accesibilidad: producción de subtítulos conformes con marcas temporales precisas para contenido en noruego, sueco o inglés en entornos Apple.
- Preprocesado para modelos posteriores: alineamiento como paso previo a la diarización o a la evaluación de calidad de transcripciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una comprobación de equivalencia: a 3 s y 17 s de entrada, cada modelo convertido selecciona el mismo token que el modelo PyTorch original en todos los frames.

## Requisitos de hardware

- Ejecución en Apple Silicon con macOS 15 o superior (requisito de Core ML ML Program con entrada flexible).
- VRAM/unified memory estimada: no disponible de forma explícita; por tamaño de archivo, entre ~175 MB (inglés base) y ~584 MB (modelos de 300M y large) por modelo cargado.
- GPU recomendadas: no disponible; el destino es la GPU/Neural Engine de chips Apple (M-series).
- Compatibilidad con GPU de consumo NVIDIA: no aplica en este formato; requeriría reconvertir los modelos originales de Hugging Face.
- Opciones de despliegue: Core ML (formato nativo), integración en apps macOS mediante el script de conversión del repositorio de Aagedal Media Converter.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| taagedal/wav2vec2-word-aligners-coreml | 300M / large / base según archivo | 0,5-40 s de audio | no, nb, nn, sv, en | per-file (Apache-2.0 / CC0-1.0) | Core ML |
| NbAiLab/nb-wav2vec2-300m-bokmaal-v2 | 300M | audio variable | nb | Apache-2.0 | PyTorch/safetensors |
| KBLab/wav2vec2-large-voxrex-swedish | large (cifra exacta no disponible) | audio variable | sv | CC0-1.0 | PyTorch/safetensors |
| facebook/wav2vec2-base-960h | base (~95M) | audio variable | en | Apache-2.0 | PyTorch/safetensors |

La comparativa directa es con los modelos de origen: esta publicación no mejora su precisión, solo cambia el formato y añade la capa `log_softmax` y los metadatos de alineamiento. Frente a ellos, la ventaja es la ejecución nativa en Core ML; la desventaja, la dependencia de macOS 15 y la ausencia de pesos en safetensors o GGUF.

## Limitaciones y advertencias

- No es un modelo nuevo: hereda los sesgos y limitaciones de los modelos de origen de NbAiLab, KBLab y Meta AI.
- Solo cubre noruego (bokmål y nynorsk), sueco e inglés; no hay soporte para castellano ni otros idiomas.
- Requiere macOS 15 o superior y hardware Apple; no es desplegable en Linux, Windows ni GPUs NVIDIA en su formato actual.
- La entrada está limitada a 40 segundos de audio por inferencia; audios más largos deben trocearse.
- Riesgo de alineamiento incorrecto en audio con ruido, solapamiento de hablantes, música o habla no nativa.
- La licencia es por archivo: Apache-2.0 para nb, nn y en, y CC0-1.0 para sv; debe respetarse la licencia del archivo concreto que se use.
- Los autores originales no respaldan esta conversión, según indica la propia model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados.
- No se han publicado benchmarks de precisión de alineamiento (p. ej., error medio de límites en milisegundos).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taagedal/wav2vec2-word-aligners-coreml
- Licencia Apache-2.0 del repositorio: https://huggingface.co/taagedal/wav2vec2-word-aligners-coreml/blob/main/LICENSE-Apache-2.0.txt
- Aagedal Media Converter (GitHub): https://github.com/aagedal/Aagedal-Media-Converter
- Script de conversión: https://github.com/aagedal/Aagedal-Media-Converter/blob/main/scripts/convert-wav2vec2-coreml.py
- Modelo de origen nb: https://huggingface.co/NbAiLab/nb-wav2vec2-300m-bokmaal-v2
- Modelo de origen nn: https://huggingface.co/NbAiLab/nb-wav2vec2-300m-nynorsk
- Modelo de origen sv: https://huggingface.co/KBLab/wav2vec2-large-voxrex-swedish
- Modelo de origen en: https://huggingface.co/facebook/wav2vec2-base-960h
