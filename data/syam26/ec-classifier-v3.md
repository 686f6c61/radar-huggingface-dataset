# Syam26/ec-classifier-v3

## Resumen

ec-classifier-v3 es un sistema de clasificación enzimática desarrollado por Syam26 como entrega para el benchmark Leak CURBER (DA3410 Deep Learning Lab, Project 2). Dado un secuencia de aminoácidos de una enzima, predice un número EC (Enzyme Commission) completamente especificado, es decir, con sus cuatro dígitos. No se trata de un modelo de lenguaje generativo, sino de un pipeline híbrido que combina búsqueda por homología con DIAMOND, perfiles de residuos, un protein language model (ESM-2 de 35M de parámetros) y un ranker basado en LightGBM.

El sistema está diseñado para ejecutarse exclusivamente en CPU, sin conexión a red, dentro de un presupuesto de 2 vCPU, 16 GB de RAM y 10 minutos de tiempo de inferencia. Esa restricción de despliegue es central en su diseño: el pipeline construye el índice DIAMOND en la imagen Docker, mantiene los hits en memoria mediante `--hit-membuf` y gestiona un presupuesto temporal configurable (`EC_TIME_BUDGET`) que detiene la fase de evidencia para garantizar la entrega de predicciones dentro del plazo.

La relevancia de esta ficha es doble: por un lado, documenta un sistema de anotación funcional de proteínas con métricas out-of-fold detalladas y una comparación rigurosa frente a versiones anteriores (v1, v2); por otro, su enfoque de "leak curbing" (evitar fugas de información entre entrenamiento y evaluación mediante agrupamiento por identidad de secuencia al 50%) resulta metodológicamente interesante para cualquiera que evalúe modelos biológicos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsqueda por homología DIAMOND + perfiles de residuos Henikoff + ESM-2 (35M) con cabeza jerárquica + ranker LightGBM (15 modelos) |
| Parámetros totales | No disponible (el componente ESM-2 es de 35M; el resto son modelos LightGBM y componentes no neuronales) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (procesa secuencias de aminoácidos; no es un modelo de contexto textual) |
| Tipos de cuantización | No disponible (no se documentan cuantizaciones; el componente ESM-2 se usa presumiblemente en FP32/FP16) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; entrada es secuencia proteica) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (repo de 0.3 GB; contiene artefactos del pipeline, no se especifica el formato de los pesos) |

## Arquitectura y entrenamiento

El sistema es un ensemble por etapas. La primera etapa realiza una búsqueda de homología con DIAMOND `--very-sensitive` contra 186.488 secuencias únicas de entrenamiento, recuperando 200 hits con alineamientos completos leídos a través de un pipe. La segunda etapa construye, para cada EC candidato, un perfil de residuos ponderado por Henikoff sobre las columnas de la query, comparándolo con los perfiles de los competidores; según la model card, el cuarto dígito del EC se decide a partir de unos pocos residuos determinantes de especificidad. La tercera etapa emplea ESM-2 (35M) con una cabeza que combina la proyección contrastiva supervisada de CLEAN con las salidas jerárquicas L1-L4 de HIT-EC, produciendo probabilidades, similitud de centroides, vecinos más cercanos y candidatos adicionales. La cuarta etapa puntúa cada par (query, EC candidato) con 15 modelos LightGBM sobre 47 features y suma las puntuaciones brutas z-normalizadas. Finalmente, cualquier entrada sin evidencia recibe el EC de entrenamiento más frecuente como fallback.

El entrenamiento se organiza en cinco folds que cubren los 14.466 clústeres de entrenamiento al 50% de identidad, con evaluación sobre 14.103 queries no redundantes (una por clúster, mejor hit por debajo del 60% de identidad). Todas las puntuaciones reportadas son out-of-fold para la referencia, la cabeza y el ranker. La versión v3 introduce tres cambios principales: un blend de tres rankers (bags de cinco semillas de LightGBM entrenados con LambdaRank, XE-NDCG y un objetivo binario pointwise), una puerta ESM-2 más amplia (inputs con bitscore por debajo de 300 reciben evidencia de la cabeza, frente a 150 en v2) y un desempate reproducible por nombre de EC en lugar del hash de proceso de Python. El presupuesto temporal de recolección de evidencia se fija en 500 s (frente a 540 s en v2).

## Capacidades

- Predicción de números EC completos de cuatro dígitos a partir de una secuencia de aminoácidos.
- Clasificación jerárquica a niveles L1, L2, L3 y L4 (las métricas se reportan por nivel).
- Búsqueda por homología sensible mediante DIAMOND con alineamientos completos.
- Perfilado de residuos para discriminar entre ECs competidores que difieren en el cuarto dígito.
- Embeddings proteicos con ESM-2 (35M) y proyección contrastiva supervisada.
- Ranking de candidatos con features aprendidas (47 features por par query-EC).
- Ejecución offline y en CPU únicamente, sin dependencia de GPU ni de red.
- Gestión de presupuesto temporal con degradación controlada (embebe menos inputs si la máquina es más lenta).
- Fallback determinista para entradas sin evidencia.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre.

## Casos de uso

- Anotación funcional de proteínas en pipelines de metagenómica: el sistema puede procesar lotes de secuencias en un contenedor Docker aislado, sin red, y producir un EC por secuencia; su presupuesto de 10 minutos para 11.367 inputs lo hace adecuado para ejecuciones por lotes en infraestructura modesta.
- Curaduría de bases de datos enzimáticas: dado que reporta predicciones jerárquicas L1-L4, permite priorizar revisiones manuales según el nivel de confianza y el nivel taxonómico de la anotación.
- Docencia y reproducibilidad metodológica: el diseño con folds agrupados por identidad al 50% y métricas out-of-fold sirve como referencia para evaluar clasificadores biológicos sin fuga de datos.
- Despliegue en entornos con restricciones de hardware: al ejecutarse solo en CPU con 2 vCPU y 16 GB, encaja en servidores sin GPU o en clústeres compartidos donde el acceso a aceleradores no está garantizado.
- Evaluación comparativa de versiones de un pipeline: la model card documenta explícitamente qué ideas se midieron y no se adoptaron (búsqueda de hiperparámetros, features listwise, más candidatos head-only, etc.), lo que facilita auditorías de decisiones de diseño.
- Generación de candidatos para validación experimental: combinado con herramientas de estructura (GraphEC, ESMFold) o de retrieval (CARE, Horizyn), el EC predicho puede alimentar la priorización de ensayos enzimáticos.
- Filtrado previo en flujos de anotación a gran escala: el fallback determinista garantiza que ninguna secuencia quede sin asignación, lo que simplifica la integración en pipelines que exigen una salida por entrada.

## Benchmarks y rendimiento

Resultados locales reportados en la model card (out-of-fold; *matched* repondera las queries al histograma de identidad de las entradas reales, *raw* no lo hace y es pesimista). No son puntuaciones de leaderboard.

| Sistema | L4 matched | L3 | L2 | L1 | L4 raw |
|---|---|---|---|---|---|
| DIAMOND bitscore vote | 0.719 | 0.884 | 0.900 | 0.921 | 0.669 |
| v1 as shipped (aproximación) | 0.732 | 0.906 | 0.924 | 0.951 | 0.683 |
| v2 | 0.739 | 0.912 | 0.930 | 0.956 | 0.692 |
| **v3 (este modelo)** | **0.741** | 0.912 | 0.930 | 0.956 | 0.694 |
| *ranking perfecto de los candidatos de v2* | *0.794* | *0.925* | *0.940* | *0.961* | *0.754* |

Comparación pareada v3 frente a v2 sobre queries idénticas: L4 +0.0020, IC 95% [+0.0004, +0.0036]. En los folds 3-4, que no guiaron ninguna decisión de v3: +0.0024, IC 95% [-0.0002, +0.0051].

Ideas medidas y no adoptadas (con su delta en L4 frente a v2): búsqueda de hiperparámetros del ranker con 60 configuraciones (+0.0000); features listwise relativas a la query (+0.0001); más candidatos head-only (2, 10, 15 en lugar de 5) (-0.0002 a -0.0008); variantes de constantes de perfil de residuos (±0.0008); hasta 10 queries de entrenamiento por clúster en lugar de 3 (+0.0000); batches contrastivos con negativos duros y pesos composicionales en la cabeza (-0.0001); mezcla aprendida de las 13 capas de ESM-2 en la cabeza (peor en el fold 0); búsqueda de rescate con e-value 10 para inputs sin hit (mejor hit correcto el 6% de las veces); embedding de todos los inputs (por debajo de la puerta 300).

## Requisitos de hardware

- CPU únicamente: el sistema está diseñado para 2 vCPU y 16 GB de RAM, sin GPU.
- Presupuesto temporal: 600 s de límite; la ejecución de referencia tarda 496 s para 11.367 inputs con 2 hilos en un Apple M4.
- Sin red: el contenedor se ejecuta con `--network none`; el índice DIAMOND se construye en la imagen Docker.
- Restricción de escritura: ningún fichero superior a 16 MiB durante la inferencia, verificado con `RLIMIT_FSIZE` = 16 MiB sobre los 11.367 inputs.
- Variables de configuración: `EC_TIME_BUDGET` (por defecto 500 s) y `EC_THREADS` (por defecto 2).
- Despliegue mediante Docker (`docker build --platform linux/amd64` y `docker run` con `--cpus 2 --memory 16g`).
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Throughput estimado: aproximadamente 22,9 inputs/s en el hardware de referencia (11.367 inputs en 496 s).
- No cabe en GPU consumer en el sentido habitual porque no requiere GPU; el componente ESM-2 (35M) es lo bastante pequeño para ejecutarse en CPU.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ec-classifier-v3 | Híbrido: DIAMOND + perfiles + ESM-2 35M + LightGBM | ESM-2 35M + componentes no neuronales | No aplica | L4 matched 0.741; L4 raw 0.694 | CC-BY-4.0 | Hugging Face (Syam26/ec-classifier-v3) |
| CLEAN | Proyección contrastiva supervisada sobre embeddings proteicos | No disponible en la información | No aplica | No disponible en la información | No disponible en la información | Referencia científica (Science 379, 2023) |
| HIT-EC | Transformer jerárquico interpretable | No disponible en la información | No aplica | No disponible en la información | No disponible en la información | Referencia científica (Nature Communications 17, 2026) |
| GraphEC | Aprendizaje geométrico sobre estructuras predichas por ESMFold | No disponible en la información | No aplica | No disponible en la información | No disponible en la información | Referencia científica (Nature Communications 15, 2024) |

## Limitaciones y advertencias

- Las métricas son estimaciones locales out-of-fold, no puntuaciones de leaderboard; la propia model card advierte de que deben tratarse como un rango entre *matched* y *raw*.
- El rendimiento en L4 (0.741 matched, 0.694 raw) deja un margen considerable de error; el techo de ranking perfecto sobre los candidatos de v2 es 0.794, lo que indica que la selección de candidatos limita el resultado final.
- La mejora de v3 sobre v2 es pequeña (+0.0020 en L4, con IC 95% que roza el cero en folds no usados para decisiones), por lo que la significancia práctica es limitada.
- La cobertura depende de la base de referencia de 186.488 secuencias; secuencias sin homología detectable reciben el EC más frecuente como fallback, lo que puede producir anotaciones incorrectas con apariencia de certeza.
- La búsqueda de rescate con e-value 10 solo acertó el mejor hit el 6% de las veces, según la model card.
- El sistema está calibrado para un presupuesto de tiempo y hardware concretos; en máquinas más lentas embebe menos inputs, lo que puede degradar la cobertura de la cabeza ESM-2.
- No se documentan sesgos taxonómicos ni de composición del dataset de entrenamiento más allá de los 14.466 clústeres al 50% de identidad.
- No se especifican limitaciones idiomáticas porque la entrada es una secuencia proteica, no texto.
- Licencia CC-BY-4.0: permite uso comercial con atribución; conviene verificar los términos de las dependencias (DIAMOND, ESM-2, LightGBM) antes de un despliegue en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-17), por lo que no hay evidencia de uso en producción ni validación externa.
- No se dispone de información sobre el formato exacto de los pesos ni sobre procesos de validación independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Syam26/ec-classifier-v3
- CLEAN (Science 379(6639), 2023): referencia citada en la model card, sin URL directa disponible
- HIT-EC (Nature Communications 17(1), 2026): referencia citada en la model card, sin URL directa disponible
- GraphEC (Nature Communications 15(1), 2024): referencia citada en la model card, sin URL directa disponible
- CARE: a Benchmark Suite for the Classification and Retrieval of Enzymes: arXiv:2406.15669 (https://arxiv.org/abs/2406.15669)
- Horizyn (PNAS 123(12), 2026): referencia citada en la model card, sin URL directa disponible
- CLIPZyme (ICML 2024): referencia citada en la model card, sin URL directa disponible
- DIAMOND (Nature Methods 18, 2021): referencia citada en la model card, sin URL directa disponible
- ESM-2 (Lin et al.): referencia citada en la model card, sin URL directa disponible
