# Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX2.5

## Resumen

Tileward-Muse-Spark-Open-816B-A42B-TWX2.5 es una compresión del modelo Muse Spark Open de Meta (816.000 millones de parámetros totales, 42.000 millones activos, arquitectura MoE), realizada por Tileward Inc. mediante su método de cuantización propietario TWX2.5. El resultado ocupa 388,1 GB en disco, un 27 % menos que la build NVFP4 oficial de Meta (533,0 GB), y conserva una ventana de contexto completa de 1.048.576 tokens ejecutable en dos GPU B300, frente a las cuatro que requiere la versión de Meta.

La relevancia de esta ficha es doble. Por un lado, documenta una técnica de compresión agresiva que mantiene la precisión en MMLU 5-shot dentro de un punto del original (89,8 frente a 90,3). Por otro, advierte de una restricción práctica importante: los pesos no se publican en el repositorio de Hugging Face (0,0 GB, 0 descargas), sino que se distribuyen bajo petición previa cita con un ingeniero de la compañía.

El modelo base es de tipo text-generation, licencia Muse Model License y está orientado a cargas de trabajo con contexto masivo, uso de herramientas y generación documental de alta fidelidad. Esta variante cuantizada no añade capacidades nuevas: hereda las del original y las preserva con una degradación medida y acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), según el modelo base Muse Spark Open |
| Parametros totales | 816 000 millones (816B) |
| Parametros activos | 42 000 millones (42B) |
| Longitud de contexto | 1 048 576 tokens (ventana completa en 2 GPU B300) |
| Tipos de cuantizacion | TWX2.5 (formato propietario de Tileward); el modelo base dispone de build NVFP4 oficial de Meta |
| Idiomas soportados | no disponible |
| Licencia | Muse Model License (muse-model-license, "other") |
| Formato de pesos | no disponible (pesos no publicados en el repositorio; distribución bajo petición) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base meta-models/Muse-Spark-Open-816B-A42B: un transformer con mezcla de expertos de 816B parámetros totales y 42B activos por token, diseñado para sostener una ventana de contexto de 1.048.576 tokens. Tileward no reentrena el modelo; aplica una compresión de pesos al checkpoint original de 16 bits (1.644,3 GB) mediante su método TWX2.5, que reduce el tamaño a 388,1 GB. La model card no detalla el algoritmo de cuantización (número de bits efectivos por bloque, granularidad, calibración ni tratamiento de capas sensibles), por lo que esos parámetros deben considerarse no disponibles.

El proceso de compresión se evalúa contra el original y contra la build NVFP4 de Meta en cuatro ejes: tasa de hechos inventados al redactar documentos (0,6 % en TWX2.5 y en NVFP4, frente a 0,4 % del original), acierto en llamadas a herramientas (1.200 de 1.200 en TWX2.5, 1.199 en NVFP4, 1.197 en el original), recuperación de hechos ocultos hasta 1.040.000 tokens (80 de 80 en los tres) y acuerdo de siguiente palabra con el original (89,2 % en TWX2.5 frente a 95,0 % en NVFP4). Este último dato es el indicador más claro del coste de la compresión: TWX2.5 se aleja más de la distribución del modelo original que NVFP4, aunque el impacto en métricas de tarea sea pequeño. No se especifican en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF o DPO).

## Capacidades

- Generación de texto y razonamiento de propósito general, con MMLU 5-shot de 89,8 en esta variante cuantizada.
- Generación documental de alta fidelidad: la evaluación reporta solo un 0,6 % de hechos inventados al redactar documentos.
- Llamada a herramientas (tool calling / function calling): 1.200 de 1.200 llamadas correctas en el conjunto de prueba del autor.
- Recuperación de información en contexto largo: 80 de 80 hechos ocultos localizados hasta 1.040.000 tokens, lo que habilita tareas de "needle in a haystack" a escala de un millón de tokens.
- Procesamiento de contextos de hasta 1.048.576 tokens en una sola instancia desplegada en dos GPU B300.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Análisis de repositorios y bases de código completas: con 1.048.576 tokens de contexto, el modelo puede ingerir un monorepo de tamaño medio en una sola pasada y responder preguntas de arquitectura, dependencias o impacto de cambios sin trocear el código en fragmentos que rompan el grafo de referencias.
- Auditoría documental y contractual: la baja tasa de hechos inventados (0,6 %) y la recuperación fiable de hechos en contexto largo lo hacen adecuado para revisar expedientes de cientos de páginas y extraer cláusulas, fechas y obligaciones con trazabilidad hacia el pasaje original.
- Agentes con uso intensivo de herramientas: el 100 % de acierto en 1.200 llamadas a herramientas permite integrarlo en orquestadores de agentes que encadenan búsquedas, consultas a bases de datos y ejecución de código, con menor riesgo de llamadas malformadas.
- Asistencia a investigación científica: ingesta de decenas de artículos completos más notas previas en una única ventana para síntesis de literatura, contraste de metodologías y detección de contradicciones entre estudios.
- Generación de documentación técnica a partir de sistemas existentes: redacción de manuales, referencias de API y guías de operación a partir de código, esquemas y registros de incidencias, apoyándose en la fidelidad factual medida.
- Despliegue en infraestructura restringida: al caber en dos GPU B300 con la ventana completa, permite ofrecer un modelo de 816B en entornos con menos aceleradores de los que exige la build oficial de Meta (cuatro B300), reduciendo coste por instancia y huella de rack.
- Procesamiento por lotes de corpus masivos: pipelines de clasificación, extracción y resumen sobre colecciones de documentos largos donde el coste dominante es el número de GPU necesarias para mantener el contexto completo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Tileward TWX2.5 | Meta NVFP4 | Muse Spark Open (16 bits) |
|---|---|---|---|
| MMLU (5-shot), accuracy | 89,8 | 90,2 | 90,3 |
| Hechos inventados al redactar documentos (menor es mejor) | 0,6 % | 0,6 % | 0,4 % |
| Llamadas a herramientas correctas (de 1.200) | 1.200 | 1.199 | 1.197 |
| Hechos ocultos encontrados hasta 1.040.000 tokens (de 80) | 80 | 80 | 80 |
| Acuerdo de siguiente palabra con el original | 89,2 % | 95,0 % | — |
| Tamaño en disco | 388,1 GB | 533,0 GB | 1.644,3 GB |
| Mínimo de GPU B300 para la ventana completa | 2 | 4 | 8 |

El benchmark MMLU del model-index figura con `verified: false`. No se han publicado en la información disponible resultados de HumanEval, GSM8K, MATH, MMLU-Pro, GPQA ni de evaluaciones multilingües.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 388,1 GB, por lo que la inferencia requiere al menos ese espacio más el margen de caché KV para la ventana de 1.048.576 tokens. El autor indica que la ventana completa cabe en dos GPU B300; el reparto concreto por tarjeta no se detalla.
- GPU recomendadas: NVIDIA B300 como plataforma de referencia (dos unidades para la ventana completa). No se documenta compatibilidad con A100, H100, H200 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo; el tamaño de pesos excede con holgura la VRAM de una RTX 4090 (24 GB) y de cualquier configuración multi-GPU doméstica razonable.
- Opciones de despliegue: no disponibles en la información proporcionada (no se confirman vLLM, TensorRT-LLM, llama.cpp, Ollama ni TGI para el formato TWX2.5).
- Latencia y throughput: no disponibles. El único dato operativo es el número mínimo de tarjetas para sostener la ventana completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tileward Muse Spark Open TWX2.5 | 816B totales / 42B activos | 1.048.576 | 89,8 | 388,1 GB | Muse Model License | Bajo petición |
| Tileward Muse Spark Open TWX3 | 816B totales / 42B activos | 1.048.576 | 90,1 | 436,4 GB | Muse Model License | Bajo petición |
| Meta NVFP4 build (Muse Spark Open) | 816B totales / 42B activos | 1.048.576 | 90,2 | 533,0 GB | Muse Model License | Publicada por Meta |
| Muse Spark Open (16 bits) | 816B totales / 42B activos | 1.048.576 | 90,3 | 1.644,3 GB | Muse Model License | Publicada por Meta |

Dentro de la familia, TWX2.5 es la variante más pequeña y la que menos hardware exige para la ventana completa, a costa de 0,5 puntos de MMLU frente al original y de un acuerdo de siguiente palabra notablemente menor que NVFP4. TWX3 ocupa un punto intermedio: 48,3 GB más de disco y 0,3 puntos más de MMLU, pero necesita cuatro B300 para el contexto completo. No se dispone de datos para comparar con modelos MoE de otros fabricantes.

## Limitaciones y advertencias

- Los pesos no están publicados en Hugging Face: el repositorio tiene 0,0 GB y la distribución requiere solicitud y cita previa con un ingeniero de Tileward. No es un modelo descargable de forma autónoma.
- El método TWX2.5 es propietario y opaco: no se documentan bits efectivos, esquema de cuantización, calibración ni capas protegidas, lo que dificulta auditar el comportamiento en dominios distintos de los evaluados.
- El acuerdo de siguiente palabra con el original cae al 89,2 %, frente al 95,0 % de NVFP4: la distribución de salida se aleja más del modelo de referencia, con riesgo de derivas estilísticas o de formato en generaciones largas.
- La tasa de hechos inventados sube del 0,4 % al 0,6 % respecto al original; sigue siendo baja, pero es un 50 % relativa más alta y debe tenerse en cuenta en flujos documentales sin revisión humana.
- Todos los benchmarks proceden del autor y el dato de MMLU figura como no verificado; no hay evaluación independiente publicada.
- No se especifican los idiomas soportados; el rendimiento fuera del inglés es desconocido.
- La licencia Muse Model License es de tipo "other" y puede imponer restricciones al uso comercial, a la redistribución de pesos o a la creación de modelos derivados; es obligatorio revisar el texto antes de desplegar en producción.
- El modelo base es de Meta y esta variante es una cuantización: los términos de la licencia original se heredan y pueden limitar la redistribución del checkpoint comprimido.
- El despliegue exige hardware B300; no se documenta soporte para generaciones anteriores de NVIDIA ni para aceleradores de otros fabricantes, lo que reduce las opciones de proveedor cloud.
- No hay información sobre latencia, throughput ni coste por token, factores críticos para dimensionar un servicio en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX2.5
- Modelo base (Meta): https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia Muse Model License: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Variante TWX3 de Tileward: https://huggingface.co/Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B-TWX3
- Investigación: "We fit Muse Spark Open on two B300 cards, where Meta's NVFP4 build needs four": https://tileward.com/research/a-smaller-muse-spark/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-muse-spark
- Investigación de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Reserva de cita con ingeniero (acceso a pesos): https://calendar.app.google/hg2DzFTxKJgwFWm19
