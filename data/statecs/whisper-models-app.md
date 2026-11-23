# statecs/whisper-models-app

## Resumen

El repositorio `statecs/whisper-models-app` es un paquete de distribucion que agrupa modelos Whisper de OpenAI convertidos a formatos optimizados para inferencia local: variantes GGML cuantizadas para whisper.cpp y variantes CoreML para WhisperKit. No se trata de un modelo entrenado desde cero por el autor, sino de un artefacto de empaquetado que recopila pesos ya existentes en los repositorios oficiales de `ggerganov/whisper.cpp` y `argmaxinc/whisperkit-coreml`, con el objetivo de servir como dependencia de una aplicacion concreta.

Whisper es un modelo de reconocimiento automatico del habla (ASR) basado en una arquitectura transformer encoder-decoder entrenada con 680.000 horas de audio etiquetado de forma debil y supervisado, segun la publicacion original de OpenAI (Radford et al., 2022). Las variantes incluidas en este repositorio son `base` (74 millones de parametros) y `small` (244 millones de parametros), ambas cuantizadas a 8 bits (`q8_0`), lo que reduce el peso en disco a 82 MB y 264 MB respectivamente.

La relevancia de este repositorio es practica y limitada: sirve para que la aplicacion del autor pueda descargar los pesos desde Hugging Face sin depender de terceros, y para que otros desarrolladores que repliquen su stack tengan un punto de descarga unico. No aporta mejoras de rendimiento, fine-tuning ni datos nuevos. Para uso general en produccion conviene acudir directamente a las fuentes originales, que mantienen documentacion, versionado y variantes mas completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 74 M (base) y 244 M (small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por ventana (ventana nativa de Whisper) |
| Tipos de cuantizacion | q8_0 (GGML, 8 bits); CoreML (precision no especificada en la model card) |
| Idiomas soportados | no disponible en la model card (Whisper original soporta ~99 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGML (`.bin`), CoreML |

## Arquitectura y entrenamiento

Los pesos incluidos corresponden a los modelos Whisper `base` y `small` de OpenAI, sin reentrenamiento ni fine-tuning por parte del autor del repositorio. La arquitectura es la descrita en el paper original: un encoder transformer que procesa espectrogramas mel de 80 canales sobre ventanas de 30 segundos, y un decoder autorregresivo que genera tokens de texto condicionados por el audio y por tokens especiales de tarea (transcripcion o traduccion) e idioma. El entrenamiento original se realizo sobre 680.000 horas de audio multilingue y multitarea, con una mezcla de datos supervisados y pseudo-etiquetados, sin uso de RLHF.

La unica transformacion aplicada en este repositorio es la conversion de formato y la cuantizacion a 8 bits para las variantes GGML, realizada con las herramientas de whisper.cpp, y la conversion a CoreML para las variantes de WhisperKit. No se documentan en la model card detalles sobre el proceso de conversion, la version concreta de whisper.cpp utilizada ni la lista exacta de ficheros CoreML incluidos, mas alla de los dos ficheros GGML citados.

## Capacidades

- Transcripcion de voz a texto en multiples idiomas (heredado de Whisper; la lista concreta no se detalla en la model card).
- Traduccion de voz a texto en ingles (tarea `translate` de Whisper).
- Deteccion automatica de idioma.
- Segmentacion con marcas de tiempo a nivel de segmento.
- Inferencia local en CPU via whisper.cpp (formato GGML) y en dispositivos Apple via CoreML (WhisperKit).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- No incluye vision, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Transcripcion de notas de voz en aplicaciones moviles: el modelo `base` en q8_0 ocupa 82 MB y puede ejecutarse en el propio dispositivo sin conexion, lo que lo hace adecuado para apps iOS/Android que transcriben dictados cortos con latencia baja.
- Subtitulado automatico de videos cortos: la variante `small` ofrece mayor precision que `base` manteniendo un tamano de 264 MB, util para generar subtitulos en pipelines de edicion no lineal.
- Asistentes de voz en macOS/iOS: la integracion CoreML de WhisperKit permite aprovechar la Neural Engine de los chips Apple Silicon para reducir consumo energetico en transcripcion continua.
- Procesamiento por lotes en servidores sin GPU: whisper.cpp con q8_0 permite transcribir archivos de audio en CPU con requisitos de memoria muy bajos, adecuado para tareas de archivado o indexacion de reuniones.
- Prototipado rapido de pipelines ASR: al ser un repositorio autocontenido con los dos pesos mas usados, sirve para levantar demos y validar integraciones antes de migrar a variantes mayores (`medium`, `large-v3`).
- Investigacion sobre cuantizacion: comparar la calidad de transcripcion de `base` y `small` en q8_0 frente a los pesos originales en float16 permite medir la degradacion introducida por la cuantizacion de 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 100-150 MB para `base` q8_0 y 300-400 MB para `small` q8_0, incluyendo buffers de trabajo de whisper.cpp.
- GPU recomendadas: no requiere GPU; funciona en CPU. En Apple Silicon puede acelerarse via CoreML/WhisperKit con Neural Engine.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) e incluso en dispositivos moviles de gama media.
- Opciones de despliegue: whisper.cpp (formato GGML), WhisperKit (CoreML), y herramientas que consuman GGML como `whisper-cli`. No es compatible directamente con vLLM, TGI ni Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la duracion del audio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| statecs/whisper-models-app (base/small q8_0) | 74 M / 244 M | 30 s audio | Apache 2.0 | GGML, CoreML | Hugging Face, 1 descarga |
| ggerganov/whisper.cpp | 39 M - 1.550 M (tiny a large-v3) | 30 s audio | MIT / Apache 2.0 segun variante | GGML | Hugging Face, ampliamente usado |
| argmaxinc/whisperkit-coreml | 39 M - 1.550 M | 30 s audio | MIT / Apache 2.0 segun variante | CoreML | Hugging Face, mantenido |
| openai/whisper-large-v3 | 1.550 M | 30 s audio | MIT | PyTorch safetensors | Hugging Face, referencia oficial |

## Limitaciones y advertencias

- Repositorio de empaquetado, no de modelo: no hay model card detallada, ni versionado de la conversion, ni garantia de actualizacion. Para produccion conviene depender de `ggerganov/whisper.cpp` o `argmaxinc/whisperkit-coreml`.
- Solo incluye dos variantes (`base` y `small`) en q8_0; no hay `tiny`, `medium`, `large-v3` ni variantes float16.
- La cuantizacion q8_0 introduce una degradacion pequena pero no nula en la calidad de transcripcion respecto a los pesos originales, especialmente en audio con ruido o acentos marcados.
- Whisper tiene sesgos conocidos hacia variedades del ingles y puede alucinar texto en silencios o musica, especialmente con modelos pequenos como `base`.
- La ventana nativa es de 30 segundos; audios mas largos requieren segmentacion externa con solapamiento, lo que puede duplicar o cortar palabras en las fronteras.
- No hay informacion sobre los idiomas cubiertos en este repositorio concreto; se asume la cobertura de Whisper original, pero no esta verificado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; los derechos sobre los pesos originales corresponden a OpenAI y a los conversores de whisper.cpp/WhisperKit.
- El repositorio ocupa 14,2 GB pese a que los dos ficheros GGML citados suman menos de 350 MB, lo que sugiere que contiene pesos CoreML adicionales no documentados en la model card.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/statecs/whisper-models-app
- Whisper.cpp (fuente GGML): https://huggingface.co/ggerganov/whisper.cpp
- WhisperKit CoreML (fuente CoreML): https://huggingface.co/argmaxinc/whisperkit-coreml
- Paper original de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio whisper.cpp en GitHub: https://github.com/ggerganov/whisper.cpp
- Repositorio WhisperKit en GitHub: https://github.com/argmaxinc/WhisperKit
