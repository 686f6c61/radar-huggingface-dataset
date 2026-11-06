# Syam26/enzyme-ec-v2

## Resumen

Enzyme-ec-v2 es un sistema de clasificación enzimática que predice un número EC (Enzyme Commission) completamente especificado a partir de una secuencia de aminoácidos. Lo desarrolla Syam26 como entrega para el benchmark Leak CURBER de clasificación de enzimas (DA3410 Deep Learning Lab, Project 2). No se trata de un modelo de lenguaje generativo, sino de un pipeline híbrido de búsqueda por homología, perfiles de residuos, embeddings de proteína y un reranker supervisado.

El sistema combina cuatro componentes: una búsqueda DIAMOND `--very-sensitive` contra 186.488 secuencias de entrenamiento, perfiles de residuos ponderados por Henikoff para discriminar el cuarto dígito EC, un cabezal sobre embeddings de ESM-2 (35M) para casos de baja homología (bitscore inferior a 150) y un conjunto de cinco modelos LightGBM LambdaRank que puntúan cada par (consulta, EC candidato) sobre 47 características. Todo el pipeline está diseñado para ejecutarse en CPU, sin red y con un presupuesto de 2 vCPU, 16 GB de RAM y 10 minutos.

La relevancia actual del modelo reside en su enfoque de ingeniería orientado a restricciones de despliegue: ficheros de menos de 16 MiB, presupuestos de tiempo por etapa, búsqueda de respaldo `--fast` de 16 segundos y generación de una salida válida incluso ante fallos. En sus evaluaciones locales alcanza un L4 (cuarto nivel EC) de 0,739 en la métrica *matched* y 0,692 en *raw*, con una mejora de +0,0074 en L4 respecto a la versión v1 sobre consultas idénticas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsqueda por homología DIAMOND + perfiles de residuos + cabezal sobre ESM-2 (35M) + reranker LightGBM LambdaRank (5 modelos) |
| Parámetros totales | No disponible (ESM-2 de 35M como componente; el resto no son modelos neuronales densos) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada: secuencia de aminoácidos; no es un modelo de contexto textual) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo biológico, no lingüístico) |
| Licencia | CC BY 4.0 |
| Formato de pesos | No disponible (repo de 0,3 GB; índice DIAMOND construido en el Dockerfile) |

## Arquitectura y entrenamiento

El sistema se articula en cinco etapas. Primero, DIAMOND `--very-sensitive` busca cada secuencia de entrada contra las 186.488 secuencias únicas de entrenamiento y conserva 200 aciertos con alineamientos completos. Segundo, para cada EC candidato se proyectan sus homólogos alineados sobre las columnas de la consulta, formando un perfil ponderado por Henikoff que se compara con el de sus competidores, tanto globalmente como en las columnas más discriminativas; esto aproxima en CPU el enfoque a nivel de residuo de HIT-EC y el foco en sitio activo de GraphEC. Tercero, cuando el mejor bitscore es inferior a 150, se usa un embedding de ESM-2 (35M) que pasa por un cabezal que combina la proyección contrastiva supervisada de CLEAN con las salidas jerárquicas L1-L4 de HIT-EC, entrenado con muestreo balanceado por clúster.

Cuarto, cinco modelos LightGBM LambdaRank puntúan cada par (consulta, EC candidato) sobre 47 características; el entrenamiento cubre 36.543 consultas de todos los clústeres, y una cuarta parte se entrena sin embeddings para simular el estado en que un plazo ajustado puede dejarlas. Quinto, cualquier consulta sin evidencia recibe el EC de entrenamiento más frecuente. Los datos de entrenamiento se organizan en 14.466 clústeres al 50% de identidad, con evaluación sobre 14.103 consultas no redundantes (una por clúster, mejor acierto por debajo del 60% de identidad). No se especifica el número total de tokens ni la composición detallada del dataset más allá de las secuencias enzimáticas y el vocabulario EC de ExPASy ENZYME.

## Capacidades

- Predicción de números EC completamente especificados (L1 a L4) a partir de una secuencia de aminoácidos.
- Clasificación jerárquica con salidas en los cuatro niveles EC.
- Búsqueda por homología sensible contra un índice de 186.488 secuencias.
- Perfilado de residuos para discriminar la especificidad del cuarto dígito EC.
- Uso de embeddings de proteína (ESM-2 35M) para casos de baja homología.
- Reranking supervisado de candidatos EC mediante LambdaRank.
- Ejecución en CPU, sin red y con presupuesto de tiempo controlado.
- Gestión de plazos por etapa con salida válida ante fallos y búsqueda de respaldo `--fast`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües: es un modelo biológico especializado.

## Casos de uso

- Anotación funcional de genomas recién secuenciados: el pipeline procesa lotes de secuencias y asigna números EC completos, adecuado por su ejecución en CPU y su presupuesto de 10 minutos para 11.367 entradas.
- Cribado de enzimas en metagenómica: la búsqueda DIAMOND contra 186.488 secuencias permite identificar homólogos funcionales en muestras ambientales sin GPU.
- Priorización de candidatos en biología sintética: el perfilado de residuos ayuda a distinguir entre enzimas con la misma actividad de primer nivel pero distinta especificidad de sustrato (cuarto dígito EC).
- Validación cruzada de anotaciones existentes: el reranker sobre 47 características puede señalar discrepancias entre la anotación heredada y la evidencia de homología y perfil.
- Despliegue en entornos aislados: al ejecutarse offline y sin red, encaja en infraestructuras con restricciones de seguridad o en contenedores con límites estrictos de tamaño de fichero (16 MiB).
- Enseñanza e investigación metodológica: sirve como referencia reproducible de un pipeline híbrido homología + PLM + learning-to-rank para clasificación jerárquica.
- Integración en pipelines de anotación automatizada: la salida en JSONL y los presupuestos configurables (`EC_TIME_BUDGET`, `EC_THREADS`) facilitan su orquestación por lotes.

## Benchmarks y rendimiento

Resultados locales declarados por el autor (no son puntuaciones de leaderboard). *Matched* repondera las consultas al histograma de identidad de las entradas reales; *raw* no lo hace.

| Sistema | L4 matched | L3 | L2 | L1 | L4 raw |
|---|---|---|---|---|---|
| Voto por bitscore DIAMOND | 0,719 | 0,884 | 0,900 | 0,921 | 0,669 |
| v1 tal como se entregó | 0,732 | 0,906 | 0,924 | 0,951 | 0,683 |
| v2 (este modelo) | 0,739 | 0,912 | 0,930 | 0,956 | 0,692 |
| Ranking perfecto de los mismos candidatos | 0,794 | 0,925 | 0,940 | 0,961 | 0,754 |

Comparación pareada v2 frente a v1 en consultas idénticas: L4 +0,0074, IC 95% [+0,0050, +0,0100]. La v1 entregada no puede puntuarse directamente porque su referencia contiene estas consultas; la cifra de v1 es una aproximación con el método reentrenado sobre el 13% de los clústeres.

Ideas medidas y descartadas por el autor:

| Idea | Efecto en L4 | Decisión |
|---|---|---|
| Proponer EC del vocabulario sin secuencia de entrenamiento | -0,0005 | Descartada |
| Codificación de fiabilidad por EC | -0,0002 | Descartada |
| Ensemble de dos cabezales | -0,0002 | Descartada |
| Embedding de todas las consultas | +0,0008 | Fuera de presupuesto |
| Búsqueda de las entradas entre sí | No ejecutada | Las entradas reales casi no tienen hermanos cercanos |

Rendimiento de ejecución: 304 s para 11.367 entradas con 2 hilos en un Apple M4 (límite de 600 s).

## Requisitos de hardware

- CPU únicamente; no requiere GPU.
- 2 vCPU y 16 GB de RAM según el presupuesto del evaluador.
- Presupuesto de tiempo por defecto de 540 s (`EC_TIME_BUDGET`), ampliable o reducible.
- 2 hilos por defecto (`EC_THREADS`).
- Ningún fichero generado puede superar los 16 MiB; el índice DIAMOND se construye en el Dockerfile y `--hit-membuf` mantiene los datos intermedios en memoria.
- Despliegue mediante Docker (`linux/amd64`), con red deshabilitada (`--network none`).
- Latencia observada: 304 s para 11.367 entradas en Apple M4 con 2 hilos; los vCPU del evaluador pueden ser más lentos y los plazos por etapa cubren ese caso.
- No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje generativo.

## Comparativa con modelos similares

| Modelo | Enfoque | Salida EC | Contexto de ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Enzyme-ec-v2 (este) | Homología DIAMOND + perfiles + ESM-2 35M + LambdaRank | L1-L4 completo | CPU, offline, 2 vCPU / 16 GB / 10 min | CC BY 4.0 | Hugging Face (0 descargas) |
| CLEAN | Proyección contrastiva supervisada | Predicción EC | No disponible en la información | No disponible | Referencia científica (Science 2023) |
| HIT-EC | Transformer jerárquico interpretable | L1-L4 | No disponible en la información | No disponible | Referencia científica (Nature Communications 2026) |
| GraphEC | Aprendizaje geométrico sobre estructuras ESMFold | Predicción EC | No disponible en la información | No disponible | Referencia científica (Nature Communications 2024) |

No se dispone de datos de benchmarks comparables entre estos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Los resultados son estimaciones locales del autor, no puntuaciones de leaderboard; la comparación con v1 es aproximada.
- El sistema depende de un índice DIAMOND construido contra 186.488 secuencias; secuencias muy alejadas del entrenamiento pueden recibir el EC más frecuente como respaldo.
- El uso de ESM-2 solo se activa con bitscore inferior a 150, de modo que la evidencia de proteína es parcial en la mayoría de los casos.
- La cobertura del vocabulario EC está limitada a ExPASy ENZYME y a las secuencias de entrenamiento; EC sin representación no se proponen.
- No se documentan sesgos biológicos específicos ni tasas de alucinación (no aplica en el sentido generativo, pero sí el riesgo de asignaciones erróneas en el cuarto dígito).
- La licencia CC BY 4.0 permite uso comercial con atribución; debe verificarse la licencia de las fuentes de datos subyacentes (ExPASy ENZYME es CC BY 4.0).
- Restricción operativa estricta: ningún fichero mayor de 16 MiB, lo que condiciona el despliegue y obliga a construir el índice en tiempo de imagen.
- El rendimiento depende de los vCPU del entorno; los plazos por etapa pueden degradar la calidad si se alcanzan.
- El repositorio tiene 0 descargas y 0 likes, lo que indica ausencia de validación externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Syam26/enzyme-ec-v2
- CLEAN (Science 2023): Yu, Cui, Li, Luo, Jiang, Zhao. *Enzyme function prediction using contrastive learning*.
- HIT-EC (Nature Communications 2026): Dumontet, Han, Lee, Oh, Kang. *Trustworthy prediction of enzyme commission numbers using a hierarchical interpretable transformer*.
- GraphEC (Nature Communications 2024): Song, Yuan, Chen, Zeng, Zhao, Yang. *Accurately predicting enzyme functions through geometric graph learning on ESMFold-predicted structures*.
- DIAMOND (Nature Methods 2021): Buchfink, Reuter, Drost. *Sensitive protein alignments at tree-of-life scale using DIAMOND*.
- ESM-2 (Science 2023): Lin et al. *Evolutionary-scale prediction of atomic-level protein structure with a language model*.
- Vocabulario EC: ExPASy ENZYME (SIB, CC BY 4.0).
