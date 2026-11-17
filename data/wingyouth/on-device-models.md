# wingyouth/on-device-models

## Resumen

`wingyouth/on-device-models` es un repositorio de artefactos de inferencia local publicado por el desarrollador wingyouth para la aplicación Android iPaklink. No se trata de un modelo único entrenado por el autor, sino de un paquete de pesos de terceros empaquetados en formato ONNX para ejecución completamente offline en dispositivo: un modelo de traducción M2M100 cuantizado a int8, un conjunto OCR basado en PP-OCRv6 tiny y varios modelos de reconocimiento automático de voz (sherpa-onnx y Vosk).

El interés del repositorio es de ingeniería de despliegue más que de investigación: documenta un pipeline reproducible de distribución de modelos (direccionamiento por SHA de commit, `manifest.json` con tamaños y hashes, verificación mediante `SHA256SUMS`) y fija una dependencia estricta de `onnxruntime-android` 1.17.1 por el símbolo `OrtGetApiBase@@VERS_1.17.1` que exige la librería nativa de sherpa-onnx. El tamaño total del repositorio es de 1.1 GB repartidos en 31 ficheros.

La relevancia actual es limitada pero concreta: sirve como referencia para quien necesite montar traducción, OCR y ASR multilingüe en un dispositivo Android sin conectividad, cubriendo el par de idiomas chino, inglés, ruso y uzbeko. No hay información publicada sobre benchmarks, y el propio autor advierte de que el inventario de licencias upstream está pendiente de verificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | M2M100 (transformer encoder-decoder) para traducción; PP-OCRv6 tiny (CNN + rec) para OCR; sherpa-onnx y Vosk para ASR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (modelo de traducción M2M100); cuantización de OCR y ASR no disponible |
| Idiomas soportados | zh, en, ru, uz (12 direcciones de traducción entre los cuatro idiomas) |
| Licencia | MIT para las contribuciones propias; pesos upstream con licencias propias, inventario pendiente de verificación |
| Formato de pesos | ONNX (IR version <= 9) |

Desglose de artefactos según la model card:

| Grupo | Modelo | Ficheros | Tamano |
|---|---|---:|---:|
| Traducción | `m2m100_fourlang` int8 (12 direcciones zh/en/ru/uz) | 1 | 734,1 MiB |
| OCR | PP-OCRv6 tiny (det / rec / rec cirílico) | 5 | 14,6 MiB |
| ASR | sherpa-onnx zh/en/uz + Vosk ru | 25 | 273,9 MiB |
| Total | | 31 | 1.072.146.944 bytes (1,0 GiB) |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo: agrega pesos preexistentes de terceros y los publica en ONNX para su consumo desde Android. El componente de traducción es `m2m100_fourlang`, una variante de M2M100 (transformer encoder-decoder multilingüe de Facebook) restringida a cuatro idiomas y cuantizada a int8, lo que explica que ocupe 734,1 MiB. El componente OCR es PP-OCRv6 tiny de PaddleOCR, con módulos separados de detección, reconocimiento y un reconocedor específico para cirílico. El componente de voz combina modelos sherpa-onnx para chino, inglés y uzbeko con Vosk para ruso, con 25 ficheros que incluyen vocabularios (`tokens.txt`) y demás artefactos auxiliares.

No se dispone de información sobre volúmenes de entrenamiento, composición de datasets, ni sobre si los modelos upstream emplearon RLHF o DPO. La innovación técnica destacable no está en los modelos sino en la infraestructura de distribución: el autor insiste en direccionar los ficheros por SHA de commit de 40 caracteres en lugar de por `main`, y advierte de que un espejo puede ignorar la cabecera HTTP `Range` y devolver el fichero completo con código 200, produciendo un fichero del tamaño correcto pero contenido incorrecto; de ahí la obligatoriedad de verificar el hash tras la descarga.

## Capacidades

- Traducción automática entre 12 direcciones que combinan zh, en, ru y uz, ejecutada localmente con el modelo M2M100 int8.
- Reconocimiento óptico de caracteres sobre imágenes mediante PP-OCRv6 tiny, con detección de texto, reconocimiento y un reconocedor dedicado a cirílico.
- Reconocimiento automático de voz en chino, inglés y uzbeko (sherpa-onnx) y en ruso (Vosk).
- Funcionamiento completamente offline: no requiere inferencia en servidor ni conexión de red tras la instalación.
- Distribución reproducible con `manifest.json` (tamaño exacto y SHA-256 por fichero) y `SHA256SUMS` para verificación masiva.
- No hay información sobre tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio más allá del ASR o modo de razonamiento.

## Casos de uso

- Traducción offline en aplicación móvil: integración del M2M100 int8 en una app Android para traducir texto entre chino, inglés, ruso y uzbeko sin conectividad, útil en escenarios de viaje o zonas con cobertura intermitente.
- Digitalización de documentos en campo: el bloque PP-OCRv6 tiny (14,6 MiB) permite extraer texto de fotografías de documentos en el propio dispositivo, incluyendo texto cirílico, sin enviar imágenes a un servidor.
- Transcripción de voz local para notas y dictado: los modelos sherpa-onnx cubren chino, inglés y uzbeko, y Vosk cubre ruso, de modo que la app puede transcribir audio en los cuatro idiomas del paquete.
- Aplicaciones con requisitos de privacidad estrictos: al no existir inferencia en servidor, los datos de voz, imagen y texto no abandonan el dispositivo, lo que simplifica el cumplimiento en entornos regulados.
- Distribución de modelos con integridad verificable: el patrón de `manifest.json` más `SHA256SUMS` y direccionamiento por SHA de commit sirve como plantilla para equipos que publican artefactos ONNX en espejos propios.
- Base para prototipos de asistentes multilingües en Android: combinando traducción, OCR y ASR en un único paquete de 1,0 GiB se puede construir un asistente que lea un documento, lo traduzca y lo lea en voz alta, todo en local.
- Referencia de compatibilidad de runtime: el repositorio documenta la dependencia exacta de `onnxruntime-android` 1.17.1, lo que resulta útil para depurar fallos de carga de librerías nativas en proyectos sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de BLEU, WER, precisión OCR ni latencias, y la búsqueda web realizada no aporta cifras asociadas a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de un paquete para Android, el consumo relevante es RAM y almacenamiento en el dispositivo, no VRAM de GPU de escritorio.
- Almacenamiento necesario: 1,0 GiB para el conjunto completo (734,1 MiB de traducción, 273,9 MiB de ASR, 14,6 MiB de OCR). Los ficheros se descargan en el primer uso y no se empaquetan en el APK.
- GPU recomendadas: no aplica; el destino es CPU móvil mediante `onnxruntime-android` 1.17.1. No hay información sobre aceleración por NPU o GPU móvil.
- Compatibilidad con GPU de consumo: no disponible; el repositorio no está orientado a ejecución en A100, H100 ni RTX 4090.
- Opciones de despliegue: `onnxruntime-android` 1.17.1 exclusivamente para la librería nativa de sherpa-onnx; ONNX IR version <= 9. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo unitario comparable con Llama, Gemma, Qwen o Phi, sino un paquete de artefactos de inferencia para una app concreta, y la información proporcionada no incluye métricas que permitan una comparación cuantitativa con alternativas.

| Criterio | wingyouth/on-device-models | Alternativas de la misma categoría |
|---|---|---|
| Tipo | Paquete ONNX de traducción + OCR + ASR | no disponible |
| Parametros | no disponible | no disponible |
| Contexto | no disponible | no disponible |
| Rendimiento | sin benchmarks publicados | no disponible |
| Licencia | MIT propia; upstream pendiente de verificación | no disponible |
| Disponibilidad | Hugging Face, distribución por SHA de commit | no disponible |

## Limitaciones y advertencias

- El inventario de licencias upstream está pendiente de verificación según la propia model card; el autor desaconseja expresamente apoyarse en este repositorio para redistribución comercial hasta que se complete.
- Solo cubre cuatro idiomas (zh, en, ru, uz); no hay soporte documentado para castellano ni para otras lenguas.
- Dependencia estricta de `onnxruntime-android` 1.17.1: otras versiones fallan en tiempo de carga por el símbolo `OrtGetApiBase@@VERS_1.17.1`.
- Los ficheros se descargan en el primer uso, no van en el APK, por lo que la primera ejecución requiere red y 1,0 GiB de espacio libre.
- Riesgo de corrupción silenciosa en descargas: un espejo que ignore la cabecera `Range` puede devolver un fichero del tamaño correcto con contenido erróneo; es obligatorio verificar el SHA-256.
- El repositorio sirve únicamente la vertiente de distribución para Uzbekistán y fuera de China continental, según la sección Status; no es una distribución global.
- No hay información sobre sesgos, tasas de alucinación en traducción ni calidad del OCR y ASR en condiciones reales.
- No hay información sobre tool calling, agentes ni razonamiento multi-paso, por lo que no debe evaluarse como modelo de propósito general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wingyouth/on-device-models
- Patrón de descarga por commit SHA: https://huggingface.co/wingyouth/on-device-models/resolve/<COMMIT_SHA>/models/asr/v1/uz/tokens.txt
- Survey sobre IA en el borde (contexto general de modelos on-device): https://arxiv.org/abs/2503.06027
- Artículo comparativo de modelos on-device para uso offline: https://coticsy.com/blog/best-ai-models-for-on-device-real-time-offline-use
