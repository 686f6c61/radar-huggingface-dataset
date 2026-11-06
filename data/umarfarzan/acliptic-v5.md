# umarfarzan/acliptic-v5

## Resumen

Acliptic v5 es un sistema de ranking de momentos para directos y pódcast desarrollado por el usuario umarfarzan. No es un modelo de lenguaje generativo ni un transformer único, sino un pipeline especializado que combina transcripción automática, embeddings de texto y de audio, y un ensemble de modelos clásicos de scikit-learn para puntuar cada fragmento de 30 segundos de un vídeo según su probabilidad de ser reemitido y, por tanto, de merecer un clip. La versión 5 sustituye el clasificador de texto basado en DeBERTa de la v2 por un ranker propio con tres componentes (regresión con gradient boosting, clasificación con gradient boosting y regresión logística) que consumen las representaciones del audio y de la transcripción.

El sistema integra tres modelos preentrenados de terceros en formato ONNX: `BAAI/bge-base-en-v1.5` para la semántica del habla, CLAP `clap-htsat-unfused` para las huellas acústicas y `faster-whisper-base.en` para la transcripción. Sobre esas señales, el ranker propio aprende a ordenar momentos dentro de un mismo vídeo. Es relevante para creadores de contenido y plataformas de streaming que necesitan automatizar la selección de clips sin depender de heurísticas manuales ni de la interacción del chat.

El modelo se distribuye como un repositorio de 1,2 GB con pesos en pickle y ONNX, no como un checkpoint de `transformers`, por lo que no se puede cargar con `AutoModel.from_pretrained`. Está entrenado exclusivamente con datos en inglés y su rendimiento es modesto pero medible: AUC de 0,599 en el conjunto de test, frente a 0,500 de una selección aleatoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: ASR (faster-whisper-base.en) + embeddings de texto (bge-base-en-v1.5 ONNX) + embeddings de audio (CLAP clap-htsat-unfused ONNX) + ensemble de scikit-learn (gradient boosting regressor, gradient boosting classifier, regresión logística) |
| Parametros totales | No disponible (el ranker es un pickle de scikit-learn; los componentes preentrenados tienen sus propios tamaños no detallados en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; opera sobre segmentos consecutivos de 30 segundos de transcripción |
| Tipos de cuantizacion | No disponible; los componentes de terceros se distribuyen en ONNX, sin detalle de precisión |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | Pickle (`ranker5.pkl`) y ONNX (`bge-onnx/`, `clap-onnx/`, `faster-whisper-base.en/`) |

## Arquitectura y entrenamiento

El sistema no es un transformer monolítico sino una cadena de procesamiento. Primero, `faster-whisper-base.en` transcribe el audio en fragmentos consecutivos de 30 segundos. Cada fragmento se representa con embeddings de texto de `bge-base-en-v1.5` y con embeddings acústicos de CLAP `clap-htsat-unfused`, ambos en ONNX. Esas representaciones alimentan un ranker compuesto por tres estimadores de scikit-learn (gradient-boosted regressor, gradient-boosted classifier y logistic regression) que produce una puntuación por segmento. El código de orquestación vive en el paquete `acliptic` incluido en el repositorio.

El entrenamiento del ranker se realizó con 19 VODs (50,6 horas) de 8 streamers, etiquetados con datos de "Most Replayed" de YouTube. El conjunto de test son 24 VODs no vistos (65 horas) de 22 streamers. No se documenta el uso de RLHF ni DPO, ni el número de tokens de entrenamiento. La innovación principal es el enfoque de ranking intra-vídeo: las puntuaciones no son probabilidades y no son comparables entre vídeos, por lo que el sistema está diseñado para seleccionar los mejores momentos dentro de una misma emisión (por ejemplo, los 6 mejores por hora) en lugar de aplicar un umbral global. Existe un modo `live=True` que solo considera lo ya ocurrido, pensado para emisiones en directo.

## Capacidades

- Detección de momentos destacados en directos y pódcast: puntúa cada fragmento de 30 segundos según su probabilidad de ser reemitido.
- Transcripción automática del habla en inglés mediante `faster-whisper-base.en`.
- Representación semántica del habla con `bge-base-en-v1.5` para captar el contenido del discurso.
- Representación acústica con CLAP para captar características del sonido independientes del texto.
- Ranking intra-vídeo: ordena los momentos de un mismo vídeo, sin umbral absoluto.
- Modo en directo (`MediaInfo(live=True)`) que solo utiliza el audio ya transcurrido.
- Funcionamiento degradado sin audio: si no hay pista de audio, opera solo con texto (sin medición de rendimiento).
- No soporta tool calling, function calling, agentes, visión, audio generativo ni modo de razonamiento explícito.

## Casos de uso

- Selección automática de clips para creadores de directos: el sistema puntúa cada bloque de 30 segundos y permite extraer los 6 mejores momentos por hora, reduciendo el trabajo manual de revisión de VODs de varias horas.
- Postproducción de pódcast: a partir de la transcripción y el audio, se identifican los tramos con mayor probabilidad de reemisión para generar cortes promocionales o resúmenes.
- Herramientas de edición asistida: integración del ranker en un editor de vídeo para resaltar en la línea de tiempo los segmentos candidatos a clip, usando las puntuaciones relativas dentro del mismo proyecto.
- Monitorización de emisiones en directo: con `live=True`, el sistema puede señalar momentos candidatos conforme ocurren, útil para un operador que decide en tiempo real qué cortar.
- Análisis de catálogo de streamers: procesar los VODs de un creador para estudiar qué tipo de momentos generan más reemisión y orientar la estrategia de contenido.
- Filtrado previo en pipelines de clipping a gran escala: usar el ranker como primera etapa para descartar el 80-90 % del metraje antes de un análisis más costoso o de una revisión humana.

## Benchmarks y rendimiento

Datos publicados en la model card sobre el conjunto de test (24 VODs no vistos, 65 horas, 22 streamers):

| Medida | Aleatorio | App con v2 | v5 |
|---|---|---|---|
| AUC | 0,500 | 0,507 | 0,599 |
| Top 6 por hora dentro del 20 % más reemitido | 20 % | 29,5 % | 37,3 % |
| Top 6 por hora dentro del 5 % más reemitido | 5 % | 7,8 % | 10,2 % |

El propio autor advierte que la mejora en el top 5 % podría deberse al azar y que aproximadamente 6 de cada 10 selecciones siguen fuera del top 20 % más reemitido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM de propósito general.

## Requisitos de hardware

- El repositorio ocupa 1,2 GB, lo que incluye los pesos ONNX de los tres componentes preentrenados y el pickle del ranker.
- VRAM estimada: no disponible de forma explícita; al ejecutarse en CPU con ONNX Runtime y scikit-learn, no requiere GPU dedicada, aunque el rendimiento será mayor con aceleración.
- GPU recomendadas: no disponibles; cualquier GPU compatible con ONNX Runtime (por ejemplo, series RTX o A100/H100 para procesamiento por lotes) puede acelerar la inferencia.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido de los componentes, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: el código del paquete `acliptic` incluido en el repositorio, con ONNX Runtime para los modelos de embeddings y ASR, y scikit-learn 1.9.1 para el ranker. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Acliptic v5 | Pipeline ASR + embeddings + ranker clásico | No disponible | Segmentos de 30 s | AUC 0,599 en test propio | No disponible | Hugging Face (umarfarzan/acliptic-v5) |
| Acliptic v2 | Pipeline con clasificador DeBERTa | No disponible | Segmentos de 30 s | AUC 0,507 en el mismo test | No disponible | Referenciado en la model card, no enlazado |
| Alternativas genéricas de detección de highlights | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Solo funciona en inglés; no se ha evaluado en otros idiomas.
- Entrenado con VODs de hasta 4,2 horas; los vídeos más largos no están probados.
- No utiliza el chat en directo, una señal potencialmente relevante para detectar momentos destacados.
- Rendimiento débil en algunos directos de gameplay rápido: el streamer Tfue obtuvo un AUC de 0,36, peor que el azar.
- El funcionamiento sin audio (solo texto) no ha sido medido.
- Las puntuaciones no son probabilidades y no son comparables entre vídeos; requieren selección relativa (top N por vídeo u hora).
- Aproximadamente 6 de cada 10 selecciones quedan fuera del top 20 % más reemitido, según el propio autor.
- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido.
- `ranker5.pkl` es un pickle de Python que requiere el paquete `acliptic` y scikit-learn 1.9.1; solo debe cargarse desde fuentes de confianza por el riesgo de ejecución de código arbitrario.
- No es un modelo de `transformers`; `AutoModel.from_pretrained` no funciona y es necesario usar el código del repositorio.
- Riesgo de sesgo derivado del conjunto de entrenamiento: 8 streamers y 19 VODs, lo que puede limitar la generalización a otros estilos de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/umarfarzan/acliptic-v5
- `BAAI/bge-base-en-v1.5`: https://huggingface.co/BAAI/bge-base-en-v1.5
- CLAP `clap-htsat-unfused` (Xenova ONNX): no disponible enlace directo en la información proporcionada
- `faster-whisper-base.en`: no disponible enlace directo en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
