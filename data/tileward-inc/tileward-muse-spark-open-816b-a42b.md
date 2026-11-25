# Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B

## Resumen
Tileward-Muse-Spark-Open-816B-A42B es una compresión del modelo Muse Spark Open de Meta (816B parámetros totales, 42B activos), publicada por Tileward en dos variantes de cuantización propietarias denominadas TWX3 y TWX2.5. El objetivo declarado es reducir el espacio en disco y el número de GPUs necesarias para servir el modelo: según la model card, ambas variantes caben en dos tarjetas B300, frente a las cuatro que requiere la build NVFP4 de Meta y las ocho de los pesos originales en 16 bits.

La relevancia de esta ficha es acotada: no se distribuyen pesos. El repositorio de Hugging Face ocupa 0,0 GB y la model card indica explícitamente que el modelo se ofrece bajo petición previa cita con un ingeniero. Se trata, por tanto, de una ficha de evaluación de una oferta comercial de compresión, no de un modelo descargable.

Los datos de rendimiento disponibles son los declarados por el autor (no verificados de forma independiente): MMLU 5-shot de 90,1 para TWX3 y 89,8 para TWX2.5, frente a 90,3 del original en 16 bits y 90,2 de la build NVFP4 de Meta. La licencia heredada es la Muse Model License de Meta, con la etiqueta "other" en el Hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Muse Spark Open de Meta, 816B totales / 42B activos, presumiblemente MoE por el ratio de parámetros) |
| Parametros totales | 816B (heredados del modelo base) |
| Parametros activos | 42B (heredados del modelo base) |
| Longitud de contexto | 1.048.576 tokens (ventana completa declarada; TWX3 la mantiene solo con 4 tarjetas B300, TWX2.5 con 2) |
| Tipos de cuantizacion | TWX3 (436,4 GB) y TWX2.5 (388,1 GB); formatos propietarios de Tileward, sin detalle de esquema publicado |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (Muse Model License de Meta, etiqueta "other" en el Hub) |
| Formato de pesos | no disponible; los pesos no se publican en el repositorio |

## Arquitectura y entrenamiento
No se dispone de información sobre la arquitectura interna del modelo base más allá de su escala (816B parámetros totales, 42B activos), lo que sugiere un diseño de mezcla de expertos. Tileward no documenta en la model card ni el esquema de cuantización de TWX3 y TWX2.5, ni el proceso de calibración, ni los datos empleados para comprimir. Tampoco se detalla el entrenamiento original de Muse Spark Open: número de tokens, composición del corpus, fases de RLHF o DPO y posibles innovaciones de atención quedan como "no disponible".

Lo único verificable en la documentación es el resultado del proceso de compresión: reducción de tamaño frente a la build NVFP4 de Meta (533,0 GB) hasta 436,4 GB en TWX3 (-18%) y 388,1 GB en TWX2.5 (-27%), con una caída declarada en MMLU de 0,2 y 0,5 puntos respectivamente respecto al original en 16 bits. La model card también reporta métricas de fidelidad: acuerdo de siguiente token con el original del 92,0% (TWX3) y 89,2% (TWX2.5), y capacidad de caché KV en ocho tarjetas de 20,0 y 20,7 millones de tokens, frente a 3,5 millones del original y 18,9 millones de la build NVFP4.

## Capacidades
- Generación de texto a gran escala, con un MMLU 5-shot declarado de 90,1 (TWX3) y 89,8 (TWX2.5).
- Ventana de contexto de 1.048.576 tokens; la model card declara 80 de 80 hechos ocultos recuperados hasta 1.040.000 tokens en las cuatro builds comparadas.
- Tool calling: 1.196 llamadas correctas de 1.200 en TWX3 y 1.200 de 1.200 en TWX2.5, según el autor.
- Reducción de alucinación en escritura de hechos documentales: 0,6% de hechos inventados en ambas variantes, frente a 0,4% del original y 0,6% de la build NVFP4.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido, visión, audio o agentes multi-paso: no disponible en la documentación.

## Casos de uso
- Procesamiento de corpus documentales largos: con una ventana de 1.048.576 tokens y recuperación declarada de hechos hasta 1.040.000 tokens, encaja en análisis de expedientes, contratos o bases de conocimiento completas sin trocear.
- Agentes con tool calling en producción: el ratio declarado de 1.200/1.200 llamadas correctas en TWX2.5 lo hace apto para orquestación de herramientas, siempre que se valide con la propia batería de pruebas.
- Despliegue en infraestructura reducida: al caber en dos B300 (TWX2.5 con ventana completa), permite servir un modelo de 816B en entornos con menos GPUs de las que exige la build NVFP4 de Meta.
- Generación de documentación técnica con control de alucinación: el 0,6% de hechos inventados declarado es relevante para informes y resúmenes donde la fidelidad factual es crítica.
- Evaluación comparativa de técnicas de compresión: útil para equipos que investigan cuantización extrema y quieren contrastar TWX frente a NVFP4 con las métricas publicadas.
- Sustitución de la build NVFP4 en clústeres con restricciones de memoria: el ahorro de 145 GB (TWX2.5 frente a NVFP4) libera espacio para caché KV, que la model card cifra en más de 20 millones de tokens en ocho tarjetas.

## Benchmarks y rendimiento

Datos declarados por el autor, no verificados de forma independiente.

| Metrica | Muse Spark Open (16 bits) | Meta NVFP4 | TWX3 | TWX2.5 |
|---|---|---|---|---|
| Tamano en disco | 1.644,3 GB | 533,0 GB | 436,4 GB | 388,1 GB |
| Minimo de tarjetas B300 | 8 | 4 | 2 (4 para ventana completa) | 2 |
| MMLU (5-shot) | 90,3 | 90,2 | 90,1 | 89,8 |
| Hechos inventados al escribir documentos (menor es mejor) | 0,4% | 0,6% | 0,6% | 0,6% |
| Llamadas de herramienta correctas (de 1.200) | 1.197 | 1.199 | 1.196 | 1.200 |
| Hechos ocultos recuperados (de 80, hasta 1.040.000 tokens) | 80 | 80 | 80 | 80 |
| Acuerdo de siguiente token con el original | – | 95,0% | 92,0% | 89,2% |
| Tokens de cache KV en ocho tarjetas | 3.515.775 | 18.904.744 | 20.048.116 | 20.718.497 |

## Requisitos de hardware
- VRAM estimada: 436,4 GB para TWX3 y 388,1 GB para TWX2.5 en pesos; hay que sumar la caché KV, que la model card mide en más de 20 millones de tokens sobre ocho tarjetas.
- GPU recomendadas: NVIDIA B300. TWX3 requiere dos tarjetas para el modelo y cuatro para la ventana completa de 1.048.576 tokens; TWX2.5 funciona con dos tarjetas manteniendo la ventana completa.
- GPU de consumo: no cabe en ninguna GPU consumer actual; 388 GB exceden con holgura los 24-32 GB de las RTX 4090/5090 y los 80-141 GB de las aceleradoras de un solo nodo.
- Opciones de despliegue: no disponible; los formatos TWX son propietarios y no hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward Muse Spark Open TWX3 | 816B totales / 42B activos | 1.048.576 | 90,1 | muse-model-license | Bajo petición |
| Tileward Muse Spark Open TWX2.5 | 816B totales / 42B activos | 1.048.576 | 89,8 | muse-model-license | Bajo petición |
| Muse Spark Open (Meta, 16 bits) | 816B totales / 42B activos | 1.048.576 | 90,3 | muse-model-license | Pesos publicados por Meta |
| Muse Spark Open NVFP4 (Meta) | 816B totales / 42B activos | 1.048.576 | 90,2 | muse-model-license | Pesos publicados por Meta |

La comparación se limita a variantes del mismo modelo base, que es la única referencia aportada por la documentación. No se dispone de datos para contrastar con otros modelos de escala comparable.

## Limitaciones y advertencias
- Los pesos no se publican: el repositorio ocupa 0,0 GB y el acceso requiere solicitar una reunión con un ingeniero de Tileward. No es un modelo descargable ni reproducible de forma autónoma.
- Los formatos TWX3 y TWX2.5 son propietarios y no se documenta el esquema de cuantización, lo que impide auditar la compresión o reproducirla.
- Todas las métricas proceden del autor y están marcadas como no verificadas (`verified: false`); no hay evaluación independiente.
- La licencia Muse Model License es de tipo "other": conviene revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales a las habituales en modelos abiertos.
- El acuerdo de siguiente token cae al 89,2% en TWX2.5, lo que implica divergencias medibles respecto al original en generación libre.
- El 0,6% de hechos inventados al escribir documentos es ligeramente superior al 0,4% del modelo original en 16 bits.
- Idiomas soportados, sesgos conocidos y comportamiento fuera de inglés no están documentados.
- El modelo base es de noviembre de 2026 según la fecha de creación del repositorio; la información sobre su entrenamiento y arquitectura no está disponible en esta ficha.

## Enlaces
- Repositorio en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Muse-Spark-Open-816B-A42B
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia Muse Model License: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B/blob/main/LICENSE.md
- Investigación de Tileward: https://tileward.com/research/a-smaller-muse-spark/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-muse-spark
- Todas las investigaciones de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Reserva de reunión con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
