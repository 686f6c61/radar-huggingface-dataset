# Synthefy/Nori-Causal

## Resumen

Nori-Causal es un modelo de descubrimiento causal para datos tabulares desarrollado por Synthefy. Con aproximadamente 30 millones de parámetros (30.342.598), recibe una tabla observacional y devuelve, para cada par ordenado de columnas, la probabilidad de que exista una arista causal directa entre ellas. Su característica principal es que opera en modo zero-shot: una única pasada hacia delante por tabla, sin ajuste por conjunto de datos.

El modelo se ha entrenado íntegramente con datos sintéticos generados a partir de modelos causales estructurales simulados, lo que evita depender de conjuntos de datos reales etiquetados causalmente. Se integra en la librería `synthefy-nori` como la vista causal de `NoriInterpreter`, donde junto a la importancia de cada característica para predecir el objetivo se reportan P(característica → objetivo) y P(objetivo → característica), permitiendo detectar características que son en realidad efectos (proxies) del objetivo en lugar de causas.

Es relevante porque aborda un problema clásico del análisis tabular —distinguir correlación de causalidad— con un modelo pequeño, de licencia Apache-2.0 y ejecutable en CPU o GPU, pensado para priorizar y filtrar candidatos causales antes de un análisis más profundo. No obstante, el propio autor advierte de que la salida son probabilidades de arista, no un grafo decidido, y de que no ofrece garantías sobre datos observacionales reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención alternada filas/columnas, pooling por columna y cabeza bilineal de aristas |
| Parámetros totales | 30.342.598 (~30M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 2.048 filas por tabla (submuestreo uniforme si hay más); hasta 25 columnas en una pasada; tablas más anchas se leen como subconjuntos aleatorios de 30 columnas |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (modelo numérico/tabular, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch (`noricausal_31m.pt`); repositorio de 0,1 GB |

## Arquitectura y entrenamiento

Cada celda de la tabla se embebe mediante la capa de entrada de Nori: embedding numérico RBF con dos valores por token y un codificador de objetivo de regresión. A continuación, seis bloques alternan atención a lo largo de las filas y a lo largo de las columnas; después se aplica un pooling por columna (media y desviación típica), se ejecutan quince bloques de atención entre columnas y una cabeza bilineal puntúa cada par ordenado de nodos. Una columna puede ocupar el denominado target slot, que el modelo interpreta como la variable de interés; si no se especifica objetivo, todas las columnas actúan como nodos ordinarios.

Para tablas de hasta 25 características, la lectura se realiza en una única pasada consciente del objetivo. Las tablas más anchas se procesan como subconjuntos aleatorios de 30 columnas, incluyendo el objetivo en el target slot de cada subconjunto que lo contenga, más subconjuntos adicionales hasta que cada característica se haya leído con el objetivo al menos tres veces; la puntuación de cada par se promedia sobre los subconjuntos que lo contienen. El entrenamiento se realizó exclusivamente con datos sintéticos procedentes de modelos causales estructurales simulados, sin datos de benchmark. No se detalla en la información disponible el número de tokens ni si hubo etapas de RLHF o DPO.

## Capacidades

- Descubrimiento de estructura causal: estima P(nodo i → nodo j) para cada par ordenado de columnas de una tabla.
- Inferencia zero-shot: una sola pasada por tabla, sin ajuste por conjunto de datos.
- Lectura consciente del objetivo: permite designar una columna como variable de interés y obtener por separado P(característica → objetivo) y P(objetivo → característica).
- Manejo de tablas anchas mediante subconjuntos aleatorios de 30 columnas con promediado de puntuaciones.
- Submuestreo automático de tablas con más de 2.048 filas.
- Salida de matriz de adyacencia de probabilidades de tamaño (d+1, d+1) cuando se incluye objetivo.
- Ejecución en GPU cuando está disponible, con retroceso a CPU.
- Integración con `NoriInterpreter` para análisis de interpretabilidad (ranking causal, cobertura del objetivo e importancia).
- No soporta tool calling, agentes, visión ni audio según la información disponible.

## Casos de uso

- Detección de proxies en modelos predictivos: en un pipeline de selección de características, usar `causal_ranking_` para identificar variables con alta importancia que probablemente sean efectos del objetivo y no causas, evitando conclusiones erróneas en modelos de riesgo o scoring.
- Priorización de hipótesis en investigación biomédica: dada una tabla de variables clínicas con un objetivo continuo (por ejemplo, un biomarcador), ordenar candidatos a causa y a efecto para orientar análisis estadísticos posteriores con métodos clásicos.
- Auditoría de datasets tabulares: revisar la matriz de adyacencia para detectar relaciones direccionales plausibles entre columnas antes de construir un modelo predictivo o un informe de calidad de datos.
- Análisis exploratorio en ciencia de datos aplicada: ejecutar `NoriCausal().fit(X, y)` sobre tablas de hasta 25 columnas para obtener rápidamente una matriz de probabilidades direccionales que guíe el análisis, con coste computacional bajo al ser un modelo de 30M de parámetros.
- Enseñanza y divulgación sobre causalidad: ilustrar la diferencia entre correlación e inferencia direccional usando las probabilidades de arista como material didáctico, con la advertencia de que no constituyen un grafo causal decidido.
- Filtrado previo en pipelines de ingeniería de características: descartar o marcar columnas que el modelo considere efectos del objetivo antes de entrenar modelos de regresión, reduciendo el riesgo de fuga de información (leakage) por variables derivadas.
- Integración en herramientas de interpretabilidad existentes: incorporar la vista causal dentro de `NoriInterpreter` para enriquecer los informes de importancia de características con información direccional, sin cambiar el flujo de trabajo del analista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamaño del modelo (~30M de parámetros); el checkpoint ocupa 0,1 GB en el repositorio, por lo que la inferencia en FP32 requiere del orden de 0,12 GB solo para pesos, más activaciones y memoria de trabajo. Cifra exacta de VRAM no disponible.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido número de parámetros.
- Opciones de despliegue: librería `synthefy-nori` (`pip install "synthefy-nori[interpretability]"`), con ejecución en GPU o CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; dependen del número de filas (máximo 2.048 con submuestreo) y del número de columnas (pasada única hasta 25; subconjuntos de 30 columnas en tablas más anchas).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Los métodos clásicos de descubrimiento causal (por ejemplo, algoritmos basados en constraints o en score) no son directamente equiparables en parámetros ni licencia, y no se aportan datos de rendimiento comparativo.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Nori-Causal | ~30M | 2.048 filas, 25 columnas por pasada | Apache-2.0 | Descubrimiento causal zero-shot sobre tablas |
| Alternativas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La salida son probabilidades de arista, no un grafo causal decidido; no se aplica ningún umbral por defecto y un umbral calibrado sobre grafos sintéticos puede sobreestimar o subestimar en tablas reales.
- En `NoriInterpreter` solo se admiten objetivos de regresión; las etiquetas de clase no son valores numéricos y los objetivos de entrenamiento fueron casi siempre continuos.
- Los datos son observacionales y no hay garantías: la dirección de las aristas se infiere de patrones distribucionales aprendidos en modelos causales estructurales sintéticos.
- Los confusores ocultos, las columnas casi duplicadas (colineales) y las relaciones deterministas pueden inducir a error.
- Entrenado exclusivamente con datos sintéticos, sin datos de benchmark en el entrenamiento; el rendimiento en dominios reales no está cuantificado en la información disponible.
- Las tablas con más de 2.048 filas se submuestrean, lo que puede perder información; las tablas con más de 25 columnas se procesan por subconjuntos con promediado, lo que puede introducir variabilidad.
- No hay información sobre sesgos demográficos o de otro tipo, al no ser un modelo lingüístico ni entrenado con datos personales según la documentación.
- Riesgo de alucinación en el sentido de aristas espurias: el modelo puede asignar probabilidad alta a relaciones no causales; los resultados deben tratarse como evidencia a verificar, no como conclusiones causales.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar los archivos LICENSE y NOTICE del repositorio para obligaciones de atribución.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synthefy/Nori-Causal
- Repositorio: https://github.com/Synthefy/synthefy-nori
- Documentación: https://docs.synthefy.com/nori/
- Licencia: https://github.com/Synthefy/synthefy-nori/blob/main/LICENSE
- NOTICE: https://github.com/Synthefy/synthefy-nori/blob/main/NOTICE
