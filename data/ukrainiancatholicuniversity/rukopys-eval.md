# UkrainianCatholicUniversity/rukopys-eval

## Resumen

RUKOPYS eval es el conjunto de código de evaluación que sustenta la RUKOPYS Leaderboard, una clasificación pública de modelos de OCR de página completa sobre documentos manuscritos en ucraniano. Lo desarrolla la UkrainianCatholicUniversity y se publica como repositorio de código en Hugging Face, no como un modelo con pesos entrenados: no contiene checkpoints, sino los scripts necesarios para ejecutar modelos de terceros sobre el split `test` del dataset RUKOPYS y puntuar sus respuestas con una métrica oficial de competición.

El problema que resuelve es la falta de un protocolo reproducible para comparar modelos de reconocimiento de escritura manual en ucraniano. El repositorio fija la imagen enviada (lado largo de 1568 px, JPEG q92), el prompt, las variantes de formato de caja (píxeles o fracciones), los runners para APIs comerciales (Anthropic, Gemini en Vertex AI, OpenAI) y para modelos abiertos servidos con vLLM, y la métrica de puntuación. Cualquier investigador puede re-puntuar las respuestas publicadas sin hacer llamadas a APIs y obtener exactamente los mismos números.

Es relevante ahora porque el ucraniano es un idioma con poca cobertura en benchmarks de OCR manuscrito, y porque el repositorio separa explícitamente la evaluación de los modelos evaluados: los resultados y respuestas en bruto se publican aparte, lo que permite auditar cada cifra. La licencia CC BY 4.0 facilita su reutilización en investigación y en productos comerciales con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de código de evaluación, sin pesos) |
| Parámetros totales | no disponible (no es un modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | ucraniano (documentos manuscritos); el código no está limitado a un idioma |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (no contiene pesos; los runners cargan modelos de terceros) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento: el repositorio es una herramienta de evaluación. Se compone de módulos con responsabilidades separadas: `kaggle_metric.py` implementa la métrica oficial de la competición sin modificaciones; `rukopys_normalize.py` convierte la respuesta del modelo en una lista estructurada `[{bbox, type, text}]`; `prompts.py` define el prompt con dos formatos de caja (píxeles o fracciones); `data.py` descarga el split desde el Hub y prepara la imagen exacta que se envía; `run_api.py` ejecuta modelos de Anthropic, Gemini y OpenAI; `run_vllm.py` ejecuta modelos abiertos tras un servidor compatible con OpenAI; `hf_openai_server.py` sirve modelos de transformers (se usó solo para Gemma 4 12B con 1120 tokens de imagen); `score.py` calcula métricas globales y por fuente; y `reproduce.sh` documenta el comando exacto de servidor y de ejecución de cada run publicado.

El protocolo es estricto y está diseñado para minimizar la fuga de información: una petición por página con la imagen y el prompt, sin system prompt, herramientas ni ejemplos; la variante de prompt por modelo se elige sobre `dev_pages.txt` (48 páginas de entrenamiento) y nunca sobre test; los modelos abiertos usan decodificación greedy sin razonamiento o el muestreo indicado en su model card cuando se activa razonamiento; los modelos de API usan los valores por defecto del proveedor (Gemini sin razonamiento, temperatura 0). Una respuesta sin región parseable recibe un reintento y, si vuelve a fallar, la página se puntúa como vacía; los fallos de infraestructura se reintentan y las páginas ya terminadas se omiten al relanzar.

## Capacidades

- Ejecución de modelos de OCR de página completa sobre imágenes de documentos manuscritos ucranianos.
- Soporte de dos formatos de coordenadas de caja: píxeles absolutos y fracciones relativas a la imagen.
- Parseo y normalización de respuestas heterogéneas a una estructura común con caja, tipo y texto.
- Puntuación con la métrica oficial de competición, desglosada en métricas globales y por fuente documental.
- Runners para APIs comerciales: Anthropic, Gemini (Vertex AI) y OpenAI.
- Runner para modelos abiertos servidos con vLLM u otro servidor compatible con la API de OpenAI.
- Servidor de transformers para modelos que requieren control fino del número de tokens de imagen.
- Reproducibilidad verificable: re-puntuar las respuestas publicadas reproduce cada cifra publicada de forma exacta.
- Reintentos controlados ante respuestas no parseables y ante fallos de infraestructura.
- No incluye tool calling, agentes, visión general, audio ni modo de razonamiento propio; esas capacidades dependen del modelo evaluado, no del repositorio.

## Casos de uso

- Evaluación comparativa de modelos de OCR manuscrito: permite enfrentar modelos comerciales y abiertos bajo un protocolo idéntico (misma imagen, mismo prompt, misma métrica) y publicar una tabla comparable.
- Auditoría de resultados publicados: con `score.py` y los parquet de predicciones del dataset de resultados se recalcula cualquier cifra sin coste de API, útil para revisión por pares.
- Selección de modelo para digitalización de archivos ucranianos: un equipo que deba procesar fondos manuscritos puede usar el leaderboard para elegir el modelo con mejor PageCER en su tipo de documento.
- Investigación en OCR de lenguas de bajos recursos: el repositorio sirve como plantilla para montar evaluaciones equivalentes en otros idiomas con escritura manual.
- Integración en pipelines de CI: `run_vllm.py` y `score.py` permiten automatizar la regresión de calidad de un modelo OCR propio antes de desplegarlo.
- Reproducción de experimentos académicos: `reproduce.sh` documenta la línea de servidor y el comando de ejecución de cada run, lo que facilita replicar configuraciones exactas de decodificación y prompt.
- Análisis de errores por fuente documental: las métricas por fuente que calcula `score.py` ayudan a identificar en qué tipo de documento falla cada modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio remite a la RUKOPYS Leaderboard y al dataset `rukopys-leaderboard-results` para las cifras, pero esos valores no se incluyen en la información proporcionada.

La métrica oficial que aplica `kaggle_metric.py` es:

`0.15·DetF1 + 0.05·ClassAcc + 0.30·(1 − RegionCER) + 0.50·(1 − PageCER)`

## Requisitos de hardware

- No aplica al repositorio en sí: la puntuación y el parseo son ligeros y se ejecutan en CPU.
- Para re-puntuar runs publicados basta con Python y las dependencias de `requirements.txt`; no se requieren GPUs ni claves de API.
- Para ejecutar modelos abiertos con `run_vllm.py` se necesita una GPU con VRAM suficiente para el modelo elegido; el repositorio no fija requisitos porque depende del modelo evaluado. Ejemplo documentado: Gemma 4 31B-it servido con vLLM.
- Para el servidor de transformers (`hf_openai_server.py`) se necesita GPU; se usó con Gemma 4 12B a 1120 tokens de imagen.
- Para modelos de API no se requiere hardware local, solo claves de entorno: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` o `GOOGLE_APPLICATION_CREDENTIALS` junto con `GOOGLE_CLOUD_PROJECT`.
- Latencia y throughput: no disponibles; dependen del modelo y del proveedor.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo, por lo que no tiene comparables directos en parámetros o contexto. Como herramientas de evaluación de OCR, las alternativas habituales serían suites como OCRBench u otros leaderboards específicos, pero no se han proporcionado datos que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos ni permite inferencia por sí mismo; solo orquesta y puntúa modelos de terceros.
- Los modelos de API pueden cambiar detrás del mismo nombre, de modo que nuevas ejecuciones dan resultados cercanos pero no idénticos a los publicados; solo las respuestas archivadas son reproducibles de forma exacta.
- La evaluación se limita al split `test` público de RUKOPYS y al ucraniano manuscrito; no cubre otros idiomas, texto impreso ni documentos con otra estructura.
- El protocolo fija una resolución concreta (1568 px de lado largo, JPEG q92) y un prompt; el rendimiento con otras resoluciones o prompts no está caracterizado.
- La selección de la variante de prompt se hizo sobre 48 páginas de entrenamiento, una muestra pequeña que puede no representar toda la variabilidad del test.
- Una respuesta no parseable tras un reintento se puntúa como página vacía, lo que puede penalizar modelos con formatos de salida poco rígidos.
- Riesgo de sesgo derivado del corpus: el dataset proviene de una institución concreta y puede no representar la diversidad de escrituras, épocas o calidades de escaneo de otros fondos.
- Licencia CC BY 4.0: permite uso comercial con atribución; debe conservarse la atribución a UkrainianCatholicUniversity y al dataset RUKOPYS.
- El repositorio no publica análisis de sesgos ni de alucinación; en OCR, los errores de sustitución de caracteres son el modo de fallo principal y deben medirse con PageCER y RegionCER.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UkrainianCatholicUniversity/rukopys-eval
- Leaderboard RUKOPYS: https://huggingface.co/spaces/UkrainianCatholicUniversity/rukopys-leaderboard
- Dataset RUKOPYS: https://huggingface.co/datasets/UkrainianCatholicUniversity/rukopys
- Resultados y respuestas en bruto: https://huggingface.co/datasets/UkrainianCatholicUniversity/rukopys-leaderboard-results
