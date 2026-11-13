# Tibber-se/kb-whisper-large-mlx

## Resumen

KB-Whisper large MLX fp16 es una conversión no oficial del modelo de reconocimiento automático del habla `KBLab/kb-whisper-large`, desarrollado por KBLab, el laboratorio de datos de la Biblioteca Nacional de Suecia. Esta versión, publicada por la organización Tibber-se, adapta los pesos originales al formato MLX en precisión fp16 para su ejecución local en Macs con Apple Silicon mediante la librería `mlx-whisper`. El modelo está especializado en transcripción de audio en sueco y se distribuye con licencia Apache-2.0.

El modelo resuelve el problema de la transcripción automática de voz en sueco con alta calidad, permitiendo ejecutar la inferencia completamente en local sin enviar audio a servicios en la nube. Al estar basado en la arquitectura Whisper large de OpenAI, hereda su diseño encoder-decoder transformer con aproximadamente 1550 millones de parámetros, aunque el ajuste específico sobre datos suecos mejora sustancialmente la precisión frente al Whisper original en ese idioma.

Su relevancia actual radica en dos factores: por un lado, la existencia de un modelo afinado específicamente para sueco con un rendimiento notablemente superior al Whisper large-v3-turbo en ese idioma; por otro, la conversión a MLX que permite aprovechar la GPU unificada de los chips Apple M-series, facilitando el despliegue local con privacidad de datos y sin dependencia de infraestructura cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | no disponible (arquitectura Whisper large, ~1550 M según el modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper) |
| Tipos de cuantizacion | fp16 (float16); no se han publicado otras variantes |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El modelo subyacente, `KBLab/kb-whisper-large`, es un ajuste fino del Whisper large de OpenAI sobre datos de audio en sueco recopilados por KBLab. La arquitectura es la estándar de Whisper: un transformer encoder-decoder con atención multi-cabeza, diseñado para recibir espectrogramas mel de audio y generar transcripciones token a token. El modelo base fue entrenado originalmente por OpenAI con 680 000 horas de audio multilingüe y posteriormente ajustado por KBLab sobre corpus suecos, lo que explica la mejora sustancial en la tasa de error de palabras (WER) para ese idioma.

Esta conversión concreta no implica reentrenamiento: se ha aplicado el script `whisper/convert.py` del repositorio `ml-explore/mlx-examples` sobre los pesos originales en la revisión `d5d5984b4d8f7c4847a8ea203f1976285fb28300`, con `--dtype float16`. El resultado son los mismos tensores que la salida estándar del conversor, empaquetados como `weights.safetensors` para que el cargador de `mlx-whisper` los localice correctamente. No se ha realizado cuantización adicional ni modificación de la arquitectura; la única transformación es la conversión de formato y precisión para MLX.

## Capacidades

- Transcripción de voz a texto en sueco con alta precisión (WER del 5,1 % en FLEURS).
- Generación de subtítulos en formato SRT mediante la opción `-f srt` de `mlx-whisper`.
- Procesamiento de audio en formato m4a y otros formatos soportados por ffmpeg.
- Ejecución completamente local en Apple Silicon, sin envío de audio a servicios externos.
- Detección de idioma limitada al sueco (el modelo está especializado en `sv`).
- No soporta timestamps a nivel de palabra (los cabezales de alineación no se configuraron en la conversión).
- No dispone de tool calling, function calling ni capacidades de agente.
- No soporta visión, audio de entrada más allá de la transcripción ni modos de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones y llamadas en sueco: el modelo puede procesar grabaciones de audio completas y generar transcripciones en formato SRT, adecuado para equipos que trabajan en sueco y necesitan actas o resúmenes posteriores. La ventana de 30 segundos por segmento de Whisper permite manejar conversaciones largas de forma iterativa.
- Generación de subtítulos para vídeo en sueco: mediante la opción `-f srt`, se pueden producir subtítulos sincronizados para contenido audiovisual, útil para creadores de contenido, medios de comunicación o plataformas de formación en línea que operan en sueco.
- Archivística y preservación digital: la Biblioteca Nacional de Suecia y archivos similares pueden transcribir colecciones de audio histórico en sueco, aprovechando la licencia Apache-2.0 y la ejecución local para cumplir con requisitos de privacidad y soberanía de datos.
- Atención al cliente y análisis de calidad: empresas suecas pueden transcribir llamadas de soporte para análisis de sentimiento, control de calidad o cumplimiento normativo, manteniendo el audio dentro de su infraestructura local en Macs Apple Silicon.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en contenido en sueco, desplegable en estaciones de trabajo Mac sin necesidad de conectividad a internet.
- Investigación lingüística: corpus de habla sueca pueden transcribirse para estudios fonéticos, sociolingüísticos o de análisis del discurso, con la ventaja de que los datos no salen del entorno del investigador.
- Prototipado rápido en desarrollo: desarrolladores que trabajan en aplicaciones de voz para el mercado sueco pueden usar este modelo como referencia de calidad antes de invertir en infraestructura de producción, gracias a la simplicidad de `uvx --from mlx-whisper`.

## Benchmarks y rendimiento

El autor proporciona una evaluación de WER sobre 100 clips del split de test de FLEURS en sueco (CC-BY-4.0), en una única ejecución sobre un Mac Apple Silicon:

| Modelo | WER |
|---|---|
| `whisper-large-v3-turbo` (MLX) | 8,7 % |
| `KBLab/kb-whisper-large` vía `transformers` (fp32, pesos originales) | 4,9 % |
| **Este modelo (MLX fp16)** | **5,1 %** (mediana por clip 2,7 %, peor clip 33 %) |

El WER de corpus está dentro de aproximadamente 0,3 puntos del modelo original en fp32. El autor advierte que FLEURS es habla leída y limpia, por lo que reuniones y llamadas reales obtendrán peores resultados. Además, señala que una única ejecución sobre 100 clips es una comprobación de cordura, no un benchmark riguroso.

## Requisitos de hardware

- VRAM estimada: al ser un modelo Whisper large en fp16, requiere aproximadamente 3,1 GB para los pesos (tamaño del repo) más el overhead de activaciones y buffers de audio; en la práctica, unos 4-6 GB de memoria unificada.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada suficiente. No está diseñado para GPU NVIDIA o AMD.
- Cabe en consumer GPU: sí, en cualquier Mac Apple Silicon con al menos 8 GB de memoria unificada; se recomienda 16 GB o más para margen con audio largo.
- Opciones de despliegue: `mlx-whisper` (PyPI), invocable mediante `uvx --from mlx-whisper mlx_whisper`. Requiere `ffmpeg` instalado. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato MLX es específico de Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada; el autor no publica tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto audio | Idiomas | WER sueco (FLEURS) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Tibber-se/kb-whisper-large-mlx** | ~1550 M (Whisper large) | 30 s por segmento | sueco | 5,1 % | Apache-2.0 | Hugging Face, MLX |
| KBLab/kb-whisper-large | ~1550 M | 30 s por segmento | sueco | 4,9 % (fp32) | Apache-2.0 | Hugging Face, transformers |
| whisper-large-v3-turbo (MLX) | ~809 M | 30 s por segmento | multilingüe | 8,7 % | MIT (OpenAI) | Hugging Face, MLX |

La comparativa se limita a estos tres modelos porque son los únicos con datos de WER en sueco publicados en la información disponible. El modelo de Tibber-se ofrece un equilibrio entre la precisión del modelo original de KBLab y la comodidad de ejecución local en Apple Silicon, a costa de una ligera pérdida de precisión (0,2 puntos de WER) y de la pérdida de timestamps a nivel de palabra.

## Limitaciones y advertencias

- Los timestamps a nivel de palabra no se probaron y probablemente no funcionan: el conversor solo configura los cabezales de alineación para los modelos oficiales de OpenAI.
- Los modelos Whisper pueden alucinar texto ante silencios, ruido o música; es necesario revisar las transcripciones que sean críticas.
- Solo se ha convertido el tamaño large; no hay versiones small, medium ni turbo en este repositorio.
- El modelo está especializado exclusivamente en sueco; no se debe esperar un rendimiento aceptable en otros idiomas.
- El rendimiento en habla real (reuniones, llamadas, acentos, ruido de fondo) será peor que el 5,1 % de WER en FLEURS, que es habla leída y limpia.
- La licencia Apache-2.0 permite uso comercial, pero el autor advierte que si se procesan grabaciones de personas, el usuario es responsable de tener una base legal para ello (RGPD y normativa sueca aplicable).
- Es una conversión no oficial, sin afiliación ni respaldo de KBLab, y se distribuye sin soporte.
- Requiere hardware Apple Silicon y `ffmpeg`; no es desplegable en infraestructura x86 o GPU NVIDIA sin reconversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tibber-se/kb-whisper-large-mlx
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- Librería `mlx-whisper`: https://pypi.org/project/mlx-whisper/
- Repositorio del conversor: https://github.com/ml-explore/mlx-examples (ruta `whisper/convert.py`)
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
