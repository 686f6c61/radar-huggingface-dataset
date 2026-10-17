# zParik/zonformer

## Resumen

ZonFormer es una política de planificación de trabajos para clústeres por lotes, publicada por zParik (autores del manuscrito: Parikshieth Harish, Suhani Bhateja y Arun Pandian J) junto con el artículo «ZonFormer: learning cluster scheduling from simulation with a relational pointer transformer». El modelo decide qué trabajo en cola arrancar a continuación sobre un clúster de núcleos compartidos, y lo hace mediante un transformer pointer relacional que opera sobre los 128 trabajos más planificables de la cola. La atención entre trabajos incorpora un sesgo que marca qué pares caben simultáneamente en los núcleos libres, de modo que la política aprende implícitamente restricciones de empaquetado.

El repositorio de HuggingFace no contiene solo los pesos: incluye 24 políticas entrenadas (20 del estudio de cinco semillas y 4 previas), 9 agentes comparadores y los ficheros CSV por traza con los que se generan todas las tablas y figuras del manuscrito. Se entrenó exclusivamente sobre cargas simuladas y se evaluó en 17 trazas del Parallel Workloads Archive, replicadas en un simulador dirigido por eventos, sin que ningún trabajo de esas 17 trazas entrara en entrenamiento, etiquetas ni recompensa.

Su relevancia es doble: por un lado, la mejor receta (ZF-BC, clonación de conducta de F1-PC-BF) alcanza una ratio media de 1,087 frente a F1-BF con backfilling EASY en las cinco semillas, un resultado cercano a la heurística clásica; por otro, el repositorio publica resultados negativos y de alta varianza (ZF-RL frío llega a 5,922 de media y un control aleatorio a 11,681), lo que lo convierte en un banco de pruebas reproducible para investigación en scheduling con aprendizaje por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer pointer relacional (atención job-a-job con sesgo de compatibilidad de empaquetado); 6 capas, 8 cabezas, d_model = 256 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de observación de K = 128 trabajos visibles y H = 48 puntos temporales |
| Tipos de cuantizacion | no disponible (se distribuyen archivos MaskablePPO en .zip; no hay versiones GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | .zip (archivo MaskablePPO de sb3-contrib 2.9.0) acompañado de hparams.json |
| Espacio de acciones | 129 opciones: arrancar uno de los 128 trabajos visibles o esperar |
| Algoritmo de entrenamiento | MaskablePPO (sb3-contrib 2.9.0), con recetas de clonación de conducta y destilación adicionales |
| Libreria | stable-baselines3 / sb3-contrib 2.9.0 |
| Tamano del repositorio | 1,1 GB (24 políticas ZonFormer, 9 comparadores y CSV de resultados) |
| Descargas / likes | 261 descargas, 0 likes |
| Fecha de publicacion | creado el 2026-10-17, actualizado el 2026-10-17 |

## Arquitectura y entrenamiento

ZonFormer es un transformer pointer sobre un conjunto variable de trabajos en cola. El extractor de características recibe una ventana de K = 128 trabajos visibles y H = 48 puntos temporales, con d_model = 256, 6 capas y 8 cabezas. La atención entre trabajos incorpora un sesgo que codifica qué pares de trabajos caben juntos en los núcleos libres, de forma que el modelo no solo ordena prioridades, sino que razona sobre el empaquetado simultáneo. La salida es una distribución sobre 129 acciones: iniciar uno de los 128 trabajos visibles o esperar. Los pesos distribuidos son archivos MaskablePPO de sb3-contrib 2.9.0, acompañados de su hparams.json.

El entrenamiento combina tres recetas. ZF-BC aplica clonación de conducta sobre F1-PC-BF (la función de prioridad F1 con backfilling); ZF-PD hace destilación de cartera con seis profesores; ZF-RL usa PPO anclado con crítico precalentado, partiendo de la política pre-estudio moe_a2p-ag_s0, que puntúa 1,011. ZF-RL frío repite PPO anclado pero con crítico sin precalentar. Todo el entrenamiento se hizo sobre cargas simuladas y la evaluación se realizó en un simulador dirigido por eventos sobre 17 trazas del Parallel Workloads Archive, con separación estricta entre entrenamiento y evaluación. El sufijo -AG de las políticas evaluadas indica el uso de una guarda de envejecimiento en el arnés de evaluación (no en los pesos): si un trabajo visible y arrancable lleva esperando más de 100 veces su estimación de runtime de usuario, la guarda arranca el más atrasado en lugar de la acción de la política. Los agentes comparadores se ejecutaron sin esa guarda.

## Capacidades

- Selección del siguiente trabajo a arrancar en un clúster por lotes, con política entrenada para minimizar el bounded slowdown.
- Razonamiento relacional sobre hasta 128 trabajos en cola simultáneamente, incluyendo compatibilidad de empaquetado entre pares de trabajos.
- Aprendizaje por imitación de heurísticas clásicas (clonación de conducta de F1-PC-BF y destilación de una cartera de seis profesores).
- Aprendizaje por refuerzo con PPO enmascarado sobre acciones legales (MaskablePPO), con acción explícita de «esperar».
- Evaluación reproducible por traza: cada fila de los CSV registra política, semilla, traza, bounded slowdown, fracción de capacidad ociosa y utilización.
- Capacidades multilingües: no aplica; el modelo no procesa texto ni lenguaje natural.
- Tool calling, agentes multi-paso, visión, audio y modo thinking: no disponibles; fuera del alcance del modelo.

## Casos de uso

- Planificación de colas en clústeres HPC por lotes: la política elige el siguiente trabajo a arrancar entre los 128 más planificables; con la receta ZF-BC la ratio media de bounded slowdown es 1,087 frente a F1-BF, lo que la sitúa como alternativa aprendida a heurísticas de prioridad en backfilling EASY.
- Investigación en scheduling con aprendizaje por refuerzo: el repositorio entrega 24 políticas entrenadas, 9 comparadores y los CSV por traza, de modo que un grupo puede reproducir las tablas del manuscrito sin reentrenar nada.
- Evaluación comparativa de planificadores: los ficheros `results/seed_final/results.csv` (629 filas) y `results/wide_hetero_v2/results.csv` (874 filas) permiten contrastar políticas aprendidas, controles aleatorios y planificadores clásicos (F1, EASY, SJF, FCFS) sobre las mismas 17 trazas.
- Sustitución de la función de prioridad en un simulador dirigido por eventos: al exponer una acción discreta sobre un conjunto acotado de trabajos visibles, la política se integra como módulo de decisión en un planificador simulado que ya calcule núcleos libres y estimaciones de runtime.
- Destilación de heurísticas existentes en un clúster real: la receta ZF-BC demuestra que clonar F1-PC-BF produce políticas estables en las cinco semillas (rango 1,055–1,121), útil como paso previo antes de aplicar RL sobre datos propios.
- Análisis de robustez y varianza entre semillas: los resultados publicados permiten estudiar por qué PPO anclado oscila entre 1,046 y 2,917 según la semilla y por qué un crítico frío deja hasta un 63 % de capacidad ociosa con trabajos en espera.
- Docencia y divulgación: el par completo pesos + resultados por traza sirve para explicar el ciclo de imitación, destilación y RL en un dominio con métricas objetivas.

## Benchmarks y rendimiento

La métrica es la media geométrica, sobre las 17 trazas, de la ratio entre el bounded slowdown medio de la política y el de F1-BF (F1 con backfilling EASY). Menor es mejor. Una semilla se considera cercana si su ratio es como máximo 1,15. Cada receta se entrenó con semillas 0 a 4 y se puntuó en el paso final de entrenamiento, sin selección de checkpoint.

| Politica | Semillas | Ratio media | Rango entre semillas | Semillas cercanas |
|---|---|---|---|---|
| ZF-BC (clonación de conducta de F1-PC-BF) | 5 | 1,087 | 1,055 – 1,121 | 5 de 5 |
| ZF-PD (destilación de cartera de seis profesores) | 5 | 1,181 | 1,023 – 1,402 | 3 de 5 |
| ZF-RL (PPO anclado, crítico precalentado) | 5 | 1,745 | 1,046 – 2,917 | 2 de 5 |
| ZF-RL frío (PPO anclado, crítico sin precalentar) | 5 | 5,922 | 1,062 – 20,057 | 3 de 5 |
| Agente estilo DeepRM | 3 | 5,647 | 3,842 – 8,631 | 0 de 3 |
| Agente estilo RLScheduler | 3 | 8,840 | 8,391 – 9,137 | 0 de 3 |
| Nulo estructurado (F1-DRL-RND) | 10 | 1,187 | 1,133 – 1,249 | 2 de 10 |
| Control sin entrenar (acciones legales aleatorias) | 10 | 11,681 | 11,130 – 12,503 | 0 de 10 |

Planificadores clásicos deterministas sobre las mismas trazas:

| Planificador | Ratio media |
|---|---|
| F1-PC-BF | 0,992 |
| F1-BF | 1,000 |
| F1 | 1,328 |
| EASY con runtimes exactos | 1,841 |
| EASY | 2,649 |
| SJF | 3,115 |
| FCFS | 17,494 |

Notas sobre los resultados publicados: las dos semillas fallidas de ZF-PD fallan en una sola traza, lanl_o2k, con bounded slowdowns medios de 2.791 y 2.552 frente a los 16,75 de F1-BF. La peor semilla de ZF-RL frío dejó un 63 % de capacidad ociosa mientras había trabajos esperando (mediana sobre las 17 trazas). Entre los cinco pares de semillas, ZF-RL y ZF-RL frío no se separan (U de Mann-Whitney = 9, p = 0,55).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; por la configuración (d_model = 256, 6 capas, 8 cabezas y contexto de 128 trabajos) el modelo es pequeño y la inferencia es viable en CPU. El repositorio completo ocupa 1,1 GB porque incluye 24 políticas ZonFormer y 9 comparadores, no porque una sola política sea grande.
- GPU recomendadas: no se especifican en la información disponible. Para entrenamiento, el manuscrito no detalla el hardware empleado; para inferencia, cualquier GPU consumer moderna es sobradamente suficiente.
- ¿Cabe en GPU consumer? Sí, con alta probabilidad, dado el tamaño del extractor y el tamaño del repositorio; no se publica una cifra de VRAM por política.
- Opciones de despliegue: carga mediante sb3-contrib 2.9.0 (`MaskablePPO.load`) sobre stable-baselines3. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto ni distribuirse en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Ratio media (menor mejor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZonFormer ZF-BC | no disponible | 128 trabajos visibles, 48 puntos temporales | 1,087 | MIT | Pesos en este repositorio |
| ZonFormer ZF-PD | no disponible | 128 trabajos visibles | 1,181 | MIT | Pesos en este repositorio |
| ZonFormer ZF-RL | no disponible | 128 trabajos visibles | 1,745 | MIT | Pesos en este repositorio |
| Agente estilo DeepRM | no disponible | ventana de 16 trabajos | 5,647 | MIT (mismo repositorio) | Pesos en `weights/comparators/pure-mlp_s{0..2}` |
| Agente estilo RLScheduler | no disponible | ventana de 16 trabajos | 8,840 | MIT (mismo repositorio) | Pesos en `weights/comparators/pure-structured_s{0..2}` |
| F1-BF (heuristica clásica) | no aplica | no aplica | 1,000 | no aplica | Referencia algorítmica |
| Nulo estructurado F1-DRL-RND | no aplica (sin pesos) | ventana de 16 trabajos | 1,187 | MIT (mismo repositorio) | Sin pesos; control |

La comparación relevante es que ZonFormer con clonación de conducta (1,087) queda ligeramente por encima de F1-BF (1,000) pero por delante del nulo estructurado (1,187) y muy por delante de los agentes estilo DeepRM (5,647) y RLScheduler (8,840) en las mismas 17 trazas.

## Limitaciones y advertencias

- Entrenado solo sobre cargas simuladas: no hay evidencia publicada de despliegue en un clúster real, y el salto de simulación a producción no está caracterizado.
- Alta varianza entre semillas en las recetas de RL: ZF-RL oscila entre 1,046 y 2,917 y ZF-RL frío entre 1,062 y 20,057, con un caso que dejó un 63 % de capacidad ociosa mientras había trabajos esperando.
- Fallo documentado en la traza lanl_o2k para dos semillas de ZF-PD, con bounded slowdowns medios de 2.791 y 2.552 frente a 16,75 de F1-BF; el comportamiento en trazas con características atípicas no es fiable.
- La guarda de envejecimiento (-AG) forma parte del arnés de evaluación, no de los pesos: evaluar las políticas sin esa guarda cambia el resultado y los comparadores se ejecutaron sin ella, lo que introduce una asimetría en la comparación.
- Ventana de decisión acotada a 128 trabajos visibles y 48 puntos temporales; no se documenta el comportamiento con colas significativamente mayores.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes multi-paso, y no tiene capacidades multilingües, de visión o de audio.
- Sesgos conocidos: no se documentan análisis de sesgo por tipo de usuario, cola o duración de trabajo; el sesgo implícito de los profesores (F1-PC-BF y la cartera de seis) se transfiere por imitación.
- Restricciones de licencia: MIT, permite uso comercial y modificación con atribución; no se especifican restricciones adicionales para los datos del Parallel Workloads Archive, que se referencian pero no se redistribuyen en el repositorio.
- Dependencia de versión: los pesos requieren sb3-contrib 2.9.0; cambios de versión pueden romper la carga de los archivos .zip.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es seleccionar acciones legales pero de baja calidad, algo que los controles aleatorios ilustran con una ratio de 11,681.

## Enlaces

- HuggingFace: https://huggingface.co/zParik/zonformer
- Manuscrito de referencia: «ZonFormer: learning cluster scheduling from simulation with a relational pointer transformer», Parikshieth Harish, Suhani Bhateja, Arun Pandian J (sin URL disponible en la información proporcionada)
- Parallel Workloads Archive (origen de las 17 trazas de evaluación): sin URL disponible en la información proporcionada
- stable-baselines3 / sb3-contrib 2.9.0 (dependencia de carga de los pesos): sin URL disponible en la información proporcionada
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al paper ni a repositorios de código; los resultados devueltos corresponden a páginas sin relación con el modelo.
