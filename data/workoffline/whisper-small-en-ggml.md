# WorkOffline/whisper-small.en-ggml

## Resumen

WorkOffline/whisper-small.en-ggml es un espejo (mirror) sin modificaciones de los ficheros ggml de Whisper small.en para whisper.cpp, publicados por el usuario WorkOffline para que su aplicación WorkOffline pueda descargarlos desde un único punto, fijados a una revisión exacta y verificados mediante SHA-256. No se trata de un modelo nuevo ni de un fine-tuning: los bytes son idénticos a los del repositorio original de ggerganov/whisper.cpp, y el modelo subyacente es openai/whisper-small.en de OpenAI.

Whisper small.en es un modelo de reconocimiento automático del habla (ASR) de tipo transformer encoder-decoder, entrenado por OpenAI para transcripción de audio en inglés. La variante "small.en" está especializada exclusivamente en inglés y cuenta con aproximadamente 244 millones de parámetros, lo que la sitúa en un punto intermedio de la familia Whisper entre las versiones tiny/base y las medium/large.

La relevancia de este repositorio es operativa, no algorítmica: facilita el despliegue reproducible y offline de la transcripción en inglés dentro de una aplicación concreta, con integridad verificable del binario. Para cualquier uso general, la referencia canónica sigue siendo el repositorio de OpenAI o el de whisper.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), conversión a formato ggml para whisper.cpp |
| Parametros totales | aproximadamente 244 millones (variante small de Whisper; dato no explicitado en la model card, inferido de la familia Whisper) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Whisper opera sobre ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible; el fichero distribuido es `ggml-small.en.bin` (formato ggml, sin detalle de cuantización en la model card) |
| Idiomas soportados | inglés exclusivamente (sufijo `.en`) |
| Licencia | MIT |
| Formato de pesos | ggml (`ggml-small.en.bin`, 487.614.201 bytes) |

## Arquitectura y entrenamiento

El modelo subyacente es Whisper small.en de OpenAI, un transformer encoder-decoder diseñado para ASR. El encoder procesa espectrogramas log-Mel de audio y el decoder genera tokens de texto de forma autorregresiva, con tokens especiales para marcas de tiempo y detección de idioma. La variante `.en` se entrenó exclusivamente con datos en inglés, lo que en la familia Whisper suele traducirse en mejor precisión para ese idioma a costa de no soportar multilingüismo.

Este repositorio concreto no aporta entrenamiento ni modificación alguna: es una copia byte a byte de `ggerganov/whisper.cpp/ggml-small.en.bin` en la revisión `5359861c739e955e79d9a303bcbc70fb988958b1`, con SHA-256 `c6138d6d58ecc8322097e0f987c32f1be8bb0a18532a3f88f734d1bbf9c41e5d`. No hay datos sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO en la información disponible; esos detalles corresponden a la model card original de OpenAI, no incluida aquí.

## Capacidades

- Transcripción de audio en inglés (speech-to-text) mediante whisper.cpp.
- Generación de marcas de tiempo a nivel de segmento (funcionalidad estándar de Whisper; no detallada en la model card de este mirror).
- Ejecución totalmente offline una vez descargado el fichero ggml.
- Verificación de integridad mediante SHA-256 del binario.
- No soporta otros idiomas distintos del inglés.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo thinking, visión ni audio más allá de la propia entrada de audio para transcripción.
- No se documentan capacidades multilingües ni de traducción.

## Casos de uso

- Transcripción offline en aplicaciones de escritorio: la app WorkOffline descarga este fichero fijado a una revisión y verifica su SHA-256, garantizando que la transcripción en inglés funciona sin conexión y con un binario íntegro.
- Subtitulado automático de vídeos o reuniones en inglés: whisper.cpp con el modelo small.en permite generar transcripciones con marcas de tiempo en equipos sin GPU dedicada.
- Procesamiento por lotes de notas de voz: al ser un fichero ggml ligero (unos 0,5 GB), se puede integrar en pipelines locales que transcriban carpetas enteras de audio en inglés.
- Asistentes de voz locales para entornos sin red: útil en escenarios de privacidad donde el audio no debe salir del dispositivo.
- Prototipado rápido de ASR en inglés: sirve como baseline reproducible para comparar con modelos mayores o fine-tunings propios.
- Distribución reproducible en contenedores: al estar fijado a una revisión y con hash conocido, encaja en imágenes Docker o instaladores que requieran binarios deterministas.
- Indexación de contenido hablado en inglés: transcripción previa a la búsqueda semántica sobre archivos de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del mirror no incluye métricas de WER, latencia ni comparativas; cualquier cifra debería consultarse en la documentación original de OpenAI Whisper o en los resultados publicados por el proyecto whisper.cpp.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el fichero ggml ocupa unos 0,5 GB, por lo que la inferencia en CPU es viable con memoria RAM modesta (orientativamente por debajo de 1 GB para el modelo en sí, sin contar buffers de audio).
- GPU recomendadas: no especificadas en la información disponible; whisper.cpp soporta ejecución en CPU y aceleración opcional por GPU (CUDA, Metal, Vulkan) según la compilación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos 1-2 GB de VRAM libre, aunque no se documenta oficialmente en este repositorio.
- Opciones de despliegue: whisper.cpp (formato nativo ggml). No se distribuyen pesos en safetensors, GGUF ni otros formatos en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WorkOffline/whisper-small.en-ggml (este) | ~244 M (small) | inglés | ggml | MIT | mirror en HF |
| openai/whisper-small.en | ~244 M (small) | inglés | PyTorch/safetensors | MIT | HF oficial |
| openai/whisper-small | ~244 M (small) | multilingüe | PyTorch/safetensors | MIT | HF oficial |
| ggerganov/whisper.cpp (ggml-small.en.bin) | ~244 M (small) | inglés | ggml | MIT | HF oficial del proyecto |

La diferencia entre este repositorio y los anteriores es exclusivamente de empaquetado y trazabilidad: mismos pesos, distinto alojamiento y verificación por hash. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Solo transcribe inglés; no soporta otros idiomas ni traducción.
- Es un mirror sin modificaciones: no incorpora mejoras, fine-tunings ni correcciones respecto al original.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla solapada; no se documenta mitigación específica en este repositorio.
- Sesgos: no se documentan en la model card; los sesgos del modelo original de OpenAI aplican íntegramente.
- Restricciones de licencia: MIT, permite uso comercial, pero la model card advierte de que el uso se rige por la licencia original de OpenAI y que el repositorio upstream no incluye fichero de licencia propio.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; la confianza debe basarse en la verificación del SHA-256 declarado.
- No se especifican cuantizaciones alternativas ni requisitos de hardware en la documentación del mirror.
- Fecha de creación declarada en 2026-11-11, posterior a la fecha habitual de publicación de la familia Whisper; conviene contrastar la procedencia antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WorkOffline/whisper-small.en-ggml
- Modelo original: https://huggingface.co/openai/whisper-small.en
- Ficheros ggml de whisper.cpp: https://huggingface.co/ggerganov/whisper.cpp
- Repositorio whisper.cpp: https://github.com/ggerganov/whisper.cpp
- Licencia MIT de Whisper: https://github.com/openai/whisper/blob/main/LICENSE
- Repositorio de OpenAI Whisper: https://github.com/openai/whisper
