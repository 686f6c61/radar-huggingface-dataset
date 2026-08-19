# YassY-The-AlchemYst/YassYBS26Sol11

## Resumen

Sol11, también denominado RobustHazardPlanner, es un sistema de planificación de intercambio de baterías desarrollado por YassY-The-AlchemYst para la competición BatterySwapAI-2026. En lugar de abordar el problema como una regresión de vida útil restante (RUL) seguida de reglas heurísticas, el modelo formula la decisión de cuándo intercambiar cada batería como un problema de optimización de costes, utilizando la propia función de coste del evaluador de la competición. El sistema combina un modelo de supervivencia de tiempo discreto con un optimizador de planificación para minimizar penalizaciones por intercambios tempranos o tardíos.

El sistema se compone de varios módulos: un preprocesado de series temporales de voltaje y temperatura, un estimador de supervivencia basado en dos arquitecturas (una red neuronal profunda HazardNet y un ensemble de gradient boosting PersonPeriodGBM), una tabla de penalizaciones que calcula el coste esperado de cada acción, y un planificador con búsqueda local. La innovación clave reside en el tratamiento explícito de la censura: de 461 dispositivos, solo 82 alcanzan el fin de vida observado, y el modelo aprovecha esa información censurada mediante una verosimilitud de riesgo discreto en lugar de descartarla. El sistema también incorpora calibración out-of-fold para corregir una sobrepredicción de fallos de aproximadamente 2,7 veces.

El repositorio en HuggingFace tiene un tamaño de 0,0 GB y no se especifican licencia, idiomas ni pipeline. La model card detalla el funcionamiento interno y proporciona métricas de rendimiento sobre el conjunto de entrenamiento, pero no se publican pesos del modelo ni artefactos descargables.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sistema híbrido: HazardNet (MLP deep ensemble) + PersonPeriodGBM (HistGradientBoosting) + planificador con búsqueda local |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa series temporales de voltaje/temperatura, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos publicados) |

## Arquitectura y entrenamiento

El sistema se estructura en cuatro etapas principales. Primero, un módulo de preprocesado aplica la semántica oficial de suavizado de series temporales para construir matrices diarias amplias con agregados móviles. Segundo, un estimador de supervivencia modela el tiempo hasta el fin de vida (EOL) de cada batería mediante riesgos discretos en 23 intervalos de 0 a 730 días. HazardNet es un ensemble de MLPs entrenado con una pérdida de supervivencia BCE enmascarada, mientras que PersonPeriodGBM entrena un HistGradientBoosting por intervalo sobre el conjunto de riesgo correspondiente. La calibración de probabilidades se ajusta out-of-fold en edificios no vistos durante el entrenamiento.

El entrenamiento se realiza con CUDA y tarda aproximadamente 25 minutos en una RTX 5060 Ti, usando 220 épocas, 5 modelos y 4 folds. La validación se hace dividiendo por edificios, no por dispositivos, para evitar fugas de información por correlación ambiental. El planificador final utiliza inserción greedy de menor coste seguida de búsqueda local con operadores de reubicación, desprogramación y cambio de día, evaluando cada movimiento contra una transcripción exacta de la máquina de estados del evaluador oficial.

## Capacidades

- Planificación de intercambio de baterías optimizada para minimizar el coste total según la métrica oficial de la competición.
- Predicción de la distribución completa de la fecha de fin de vida de cada batería, no solo un punto estimado.
- Manejo explícito de datos censurados: dispositivos que nunca alcanzan el EOL durante el periodo de observación.
- Calibración de probabilidades para corregir sesgos de sobrepredicción de fallos.
- Optimización con restricciones: límite máximo de intercambios, umbral mínimo de probabilidad de fallo, y ajuste de ventanas temporales para aprovechar coincidencias de localización.
- Evaluación local con métrica oficial y generación de archivos de submission compatibles con el grader.

## Casos de uso

- Gestión de flotas de baterías en estaciones de intercambio: el modelo decide qué baterías intercambiar cada día para minimizar el coste operativo, considerando penalizaciones por intercambio temprano (0,5 h/día de vida restante) y tardío (10 h/día de retraso).
- Mantenimiento predictivo en infraestructuras de energía: la predicción de supervivencia permite programar reemplazos antes de fallos catastróficos, reduciendo tiempos de inactividad no planificados.
- Optimización logística de rutas de servicio: el planificador integra la localización de los dispositivos para agrupar intercambios en la misma visita, reduciendo costes de desplazamiento.
- Análisis de fiabilidad de equipos con datos censurados: la metodología de supervivencia de tiempo discreto puede aplicarse a otros activos industriales donde muchos equipos no fallan durante el periodo de estudio.
- Simulación de políticas de mantenimiento: el sistema permite comparar escenarios "no hacer nada" frente a políticas agresivas de reemplazo, cuantificando el impacto económico de cada estrategia.
- Benchmarking de algoritmos de planificación: las herramientas de evaluación local con métrica oficial sirven para comparar diferentes enfoques de decisión en problemas de reposición de inventario perecedero.

## Benchmarks y rendimiento

La model card proporciona resultados de tiempo total (total_time) sobre el conjunto de entrenamiento (48 escenarios) para diferentes estrategias de referencia:

| Estrategia | total_time |
|---|---|
| skip-all (no intercambiar nunca) | 3 325 |
| Sol8 (local) | 19 179 |
| Sol6 (public LB) | 7 464 |
| Leaderboard rank 1 (public LB) | 1 652 |
| oracle (intercambiar cada batería en su EOL real, enrutado ingenuo) | 213 |
| oracle-opt (mismo conocimiento, optimizador de este repositorio) | 114 |

No se publican resultados en benchmarks estándar como MMLU o HumanEval, ya que el modelo no es un modelo de lenguaje. La métrica relevante es el coste total de la planificación, donde el sistema propuesto alcanza un valor de 114 frente a 213 del oracle con enrutado ingenuo, lo que indica una mejora sustancial en la optimización de rutas y decisiones.

## Requisitos de hardware

- Entrenamiento: GPU con CUDA, aproximadamente 25 minutos en una RTX 5060 Ti (según la documentación). No se especifica VRAM mínima.
- Inferencia: no se especifican requisitos de VRAM ni latencia. El sistema incluye un modo `--physics` que funciona sin modelo (solo extrapolación de voltaje), aunque su rendimiento es peor que no hacer nada (3 464 vs 3 325).
- Despliegue: el código se ejecuta mediante Poetry y Python. No se mencionan integraciones con vLLM, Ollama o TGI, ya que no es un modelo generativo.
- El repositorio no contiene pesos preentrenados descargables; el usuario debe entrenar el modelo desde cero con los datos de la competición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (planificadores de intercambio de baterías). La model card menciona soluciones anteriores del mismo autor (Sol6, Sol8) y el líder del ranking público, pero no se describen sus arquitecturas internas. Por tanto, la comparativa se limita a los resultados de rendimiento presentados en la sección de benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para el problema de BatterySwapAI-2026 y su función de coste particular; no es directamente transferible a otros dominios sin adaptación.
- La calibración se ajusta sobre la división de entrenamiento y puede no generalizar a datos futuros con distribuciones diferentes.
- El modo sin modelo (`--physics`) produce resultados peores que no hacer nada, lo que indica que la predicción de supervivencia es crítica para el rendimiento.
- Riesgo de sobreajuste a los 48 escenarios de entrenamiento; la validación por edificios mitiga parcialmente este riesgo, pero no lo elimina.
- No se especifican sesgos conocidos, pero el sistema depende de la calidad de los datos de voltaje/temperatura y de la suposición de que el comportamiento pasado es representativo del futuro.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial o modificación.
- El repositorio no contiene artefactos descargables (pesos, datasets), solo código fuente y documentación.

## Enlaces

- HuggingFace: https://huggingface.co/YassY-The-AlchemYst/YassYBS26Sol11
