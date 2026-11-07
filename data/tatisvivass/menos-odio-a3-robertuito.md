# tatisvivass/menos-odio-a3-robertuito

## Resumen

`menos-odio-a3-robertuito` es un modelo de clasificación de texto en español especializado en la detección de discurso de odio. Se trata de un fine-tuning del modelo base `pysentimiento/robertuito-base-uncased` (RoBERTuito, un encoder tipo RoBERTa entrenado sobre 500 millones de tuits en español) realizado por el usuario `tatisvivass` sobre el conjunto de datos `piuba-bigdata/contextualized_hate_speech`, con una etiqueta binaria `HATEFUL`.

El modelo resuelve una tarea concreta: clasificar un texto en español (preferentemente de redes sociales) como odioso o no odioso. Su relevancia radica en que parte de un encoder específicamente adaptado al registro informal de redes sociales, lo que lo hace más adecuado que un modelo genérico en castellano para dominios como moderación de comentarios, tuits o foros.

Con 108,8 millones de parámetros, una ventana de 128 tokens durante el entrenamiento y una licencia MIT, es un modelo ligero y desplegable en hardware modesto. No obstante, sus métricas en test (F1 de 0,653 para la clase hateful) indican un rendimiento moderado que exige validación adicional antes de usarlo en producción sin supervisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (RoBERTuito base, uncased) |
| Parametros totales | 108.788.738 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible como contexto nativo documentado; entrenado con `max_length=128` |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantización posible vía herramientas estándar, no documentada por el autor) |
| Idiomas soportados | Español (`es`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de clasificación de secuencias sobre `pysentimiento/robertuito-base-uncased`, un encoder transformer de tipo RoBERTa preentrenado sobre más de 500 millones de tuits en español siguiendo las directrices de entrenamiento de RoBERTa. Sobre esa base se añade una cabeza de clasificación binaria para la etiqueta `HATEFUL`.

El entrenamiento se realizó en un Mac con Apple Silicon (backend MPS), durante aproximadamente 55 minutos (unos 3283 segundos), en noviembre de 2026. Los hiperparámetros documentados son: 3 épocas máximas con early stopping, batch de 16, learning rate de 2e-5, longitud máxima de 128 tokens y semilla 42. La partición del dataset se hizo por artículo (seed 42). El preprocesado aplicado es `pysentimiento.preprocessing.preprocess_tweet(lang="es")`, lo que normaliza el texto para el registro de redes sociales (menciones, URLs, risas, etc.). No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; es un fine-tuning supervisado clásico.

## Capacidades

- Clasificación binaria de texto en español: predice si un texto es `HATEFUL` o no.
- Detección de discurso de odio en contenido generado por usuarios (tuits, comentarios, foros).
- Preprocesado específico para texto informal en español mediante `preprocess_tweet`.
- Salida de probabilidad calibrada con umbral de decisión ajustado en DEV (≈0,28), lo que permite operar con distintos niveles de sensibilidad.
- No soporta tool calling ni function calling: es un modelo de clasificación, no generativo.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al español.

## Casos de uso

- Moderación de comentarios en plataformas: el modelo clasifica comentarios de usuarios en español como odiosos o no odiosos, sirviendo como primera capa de filtrado antes de la revisión humana. Su preentrenamiento sobre tuits lo hace adecuado para registros informales.
- Filtrado previo en foros y comunidades: integrado en un pipeline de ingestión, descarta o marca automáticamente publicaciones que superen el umbral de probabilidad, reduciendo la carga de moderadores.
- Análisis de toxicidad en redes sociales: permite procesar grandes volúmenes de tuits en español y agregar métricas de prevalencia de discurso de odio por período o comunidad.
- Investigación en ciencias sociales: clasificación de corpus de texto en español para estudios sobre discurso de odio, con la ventaja de una licencia MIT que facilita la reproducibilidad.
- Enriquecimiento de datasets: etiquetado automático de grandes colecciones de texto para construir conjuntos anotados que luego se revisan manualmente.
- Sistemas de alerta temprana: monitorización de canales públicos en español donde el modelo actúa como disparador de alertas cuando la probabilidad de contenido odioso supera un umbral configurable (por ejemplo, el 0,28 ajustado en DEV para maximizar recall).

## Benchmarks y rendimiento

Métricas publicadas por el autor en la model card (test por artículo):

| Metrica | Valor |
|---|---|
| F1 hateful | 0.653 |
| Precision | 0.686 |
| Recall | 0.623 |
| ROC-AUC | 0.898 |
| Umbral (DEV) | ≈0.28 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 108,8 millones de parámetros (unos 435 MB en fp32, ~218 MB en fp16). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre; funciona en RTX 3060, RTX 4090, A100, H100 y también en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU modernas, incluidas las integradas de portátiles.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Text Embeddings Inference (el modelo declara compatibilidad con `text-embeddings-inference`), y exportación a ONNX o cuantización mediante herramientas estándar (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por su tamaño, se espera inferencia en milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.
- Entrenamiento: documentado en Apple Silicon (MPS) en unos 55 minutos, lo que confirma que no requiere hardware especializado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `menos-odio-a3-robertuito` | 108,8 M | 128 tokens (entrenamiento) | Clasificación hate speech (es) | MIT | Hugging Face |
| `pysentimiento/robertuito-base-uncased` | ~110 M (base) | 128 tokens (típico en RoBERTuito) | Modelo base, no clasificador específico | No disponible en la información | Hugging Face |
| `pysentimiento/robertuito-hate-speech` | No disponible en la información | No disponible | Clasificación hate speech (es) | No disponible | Hugging Face (referencia del ecosistema pysentimiento) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Rendimiento moderado: F1 de 0,653 y recall de 0,623 en test indican que el modelo deja escapar una parte significativa de casos odiosos; no es apto para moderación totalmente automática sin revisión humana.
- Umbral ajustado en DEV (≈0,28): el punto de operación está calibrado sobre una partición concreta; puede requerir reajuste en dominios distintos.
- Sesgos: al entrenarse sobre tuits en español, puede heredar sesgos de género, origen o ideología presentes en el corpus; no se documenta análisis de sesgo.
- Riesgo de falsos positivos y negativos en lenguaje figurado, ironía, citas o discurso reportado, habituales en redes sociales.
- Limitación de idioma: solo español; no se garantiza comportamiento en otras lenguas ni en variantes dialectales no representadas.
- Limitación de contexto: entrenado con `max_length=128`; textos más largos se truncan, lo que puede perder información relevante.
- Licencia MIT: permite uso comercial y modificación, pero el modelo base (`robertuito-base-uncased`) puede tener sus propias condiciones; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- Sin datos de benchmarks comparativos ni evaluaciones independientes: las métricas son autoinformadas por el autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tatisvivass/menos-odio-a3-robertuito
- Space demo: https://huggingface.co/spaces/tatisvivass/menos-odio-a-la-vista
- Modelo base: https://huggingface.co/pysentimiento/robertuito-base-uncased
- Repositorio RoBERTuito: https://github.com/pysentimiento/robertuito
- Paper RoBERTuito: https://huggingface.co/papers/2111.09453
- Dataset de entrenamiento: https://huggingface.co/datasets/piuba-bigdata/contextualized_hate_speech
