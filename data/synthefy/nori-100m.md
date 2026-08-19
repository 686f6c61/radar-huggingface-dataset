# Synthefy/Nori-100M

## Resumen

Nori-100M es la variante de aproximadamente 98,3 millones de parámetros de Nori, un modelo fundacional para datos tabulares desarrollado por Synthefy. Está diseñado específicamente para problemas de regresión mediante aprendizaje en contexto (in-context learning, ICL): dado un pequeño conjunto de filas etiquetadas como contexto, el modelo predice sobre nuevas filas de consulta en una única pasada hacia adelante, sin necesidad de entrenamiento específico para la tarea ni ajuste fino. El modelo está entrenado íntegramente con datos sintéticos, lo que evita la contaminación con conjuntos de datos de referencia.

La relevancia de Nori-100M radica en que ofrece una alternativa a los flujos tradicionales de machine learning tabular (como XGBoost o gradient boosting), eliminando la necesidad de ingeniería de características, selección de hiperparámetros y entrenamiento por tarea. Con una arquitectura de transformer de características de 42 capas, dimensión de embedding 352 y 8 cabezas de atención, el modelo logra un R² medio de 0,8320 en la suite de regresión TabArena, posicionándose como una opción competitiva dentro de los modelos fundacionales tabulares. La licencia Apache-2.0 facilita su adopción tanto en investigación como en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Features transformer (42 capas, embed_dim 352, hid_dim 1056, 8 cabezas) |
| Parámetros totales | 98.304.698 (~98,3M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limitación práctica por atención O(N²)) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo numérico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (checkpoint `nori.pt`, librería PyTorch) |

## Arquitectura y entrenamiento

Nori-100M emplea una arquitectura de transformer de características (features transformer) con 42 capas, dimensión de embedding de 352 y 352 dimensiones ocultas de 1056, con 8 cabezas de atención. El modelo opera sobre tablas de datos numéricos y categóricos, transformando las filas de contexto en representaciones que permiten la predicción en una sola pasada. La atención muestral es densa, con complejidad O(N²) respecto al número de filas de contexto, lo que limita su uso en tablas muy grandes.

El entrenamiento se realizó exclusivamente con datos sintéticos generados por Synthefy, sin usar ningún conjunto de datos de referencia en el proceso de entrenamiento. Esto evita la fuga de datos y permite que el modelo generalice a dominios diversos sin sesgos de conjuntos específicos. No se ha especificado el número de tokens ni la composición exacta del dataset sintético. El modelo no utiliza técnicas como RLHF o DPO; su aprendizaje se basa en el objetivo de regresión y en el aprendizaje en contexto.

## Capacidades

- Regresión tabular mediante aprendizaje en contexto: predice valores numéricos a partir de unas pocas filas etiquetadas como contexto.
- Inferencia en una sola pasada hacia adelante, sin entrenamiento ni ajuste fino por tarea.
- Distribución predictiva: permite obtener estimaciones puntuales como la media, mediana o moda de la distribución predicha.
- Compatibilidad con el contrato de `TabPFNRegressor.predict`, lo que facilita su integración en pipelines existentes.
- Soporte para datos tabulares numéricos y categóricos, con manejo de valores ausentes implícito.
- Capacidad de ejecución en GPU con fallback a CPU automático.
- Generación de datos sintéticos como parte del ecosistema (aunque el modelo en sí es para predicción, no generación).
- No tiene capacidades de lenguaje natural, visión, audio ni tool calling.

## Casos de uso

- Predicción de precios inmobiliarios: con un pequeño conjunto de viviendas etiquetadas (precio, superficie, ubicación, año), el modelo predice el precio de nuevas propiedades en una sola pasada, sin entrenamiento.
- Estimación de demanda de productos: en entornos de retail, se pueden usar series de ventas históricas como contexto para predecir la demanda de nuevos artículos o en nuevas tiendas.
- Previsión de consumo energético: a partir de datos de consumo y variables meteorológicas de días anteriores, el modelo puede predecir el consumo futuro de un edificio o red.
- Análisis de riesgo crediticio: con una muestra de clientes etiquetados con su probabilidad de impago, se puede puntuar a nuevos solicitantes sin reentrenar el modelo.
- Optimización de campañas de marketing: predecir la tasa de conversión o el valor de vida de un cliente (LTV) a partir de datos demográficos y de comportamiento, permitiendo segmentar audiencias en tiempo real.
- Mantenimiento predictivo en industria: predecir la vida útil restante de un componente a partir de variables de sensor, usando un pequeño conjunto de fallos históricos como contexto.
- Investigación científica: ajustar modelos de regresión rápidamente en experimentos con pocos datos, como en biología o química, sin necesidad de configurar pipelines de entrenamiento complejos.
- Generación de datos sintéticos: aunque el modelo no genera datos directamente, su capacidad de predicción puede usarse en pipelines de aumentación de datos para crear etiquetas sintéticas.

## Benchmarks y rendimiento

El modelo ha sido evaluado en la suite de regresión TabArena, con el protocolo oficial de 13 conjuntos de datos y 222 pliegues con divisiones idénticas byte a byte. La evaluación se realizó con la configuración de inferencia predeterminada y sin límite de contexto (pliegue completo, sin submuestreo).

| Suite | Datasets | Folds | Mean R² | Median R² |
|---|---|---|---|---|
| TabArena | 13 | 222 | 0,8320 | 0,8749 |

En el leaderboard interno de Elo de TabArena de Synthefy, este checkpoint ocupa el 3er puesto de 21 modelos rastreados, por delante de Nori-30M, TabPFN-3 y EXAONE-Tabular, y por detrás de TabFM. No se han publicado resultados en las suites TALENT-100 ni OpenML-CTR23 para esta variante específica, por lo que no se reporta una cifra global de "Overall". No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la información disponible.
- El modelo tiene aproximadamente 98,3 millones de parámetros, lo que sugiere que puede ejecutarse en GPUs de consumo con al menos 1-2 GB de VRAM en formato de precisión completa (fp32), y menos si se cuantiza.
- La librería `synthefy-nori` detecta automáticamente una GPU disponible y falla a CPU en caso contrario.
- No se ha documentado la compatibilidad con vLLM, llama.cpp, Ollama o TGI; el uso previsto es a través de la librería `synthefy-nori` con PyTorch.
- La latencia y el throughput no han sido publicados.

## Comparativa con modelos similares

La información disponible menciona a TabPFN-3 y EXAONE-Tabular como modelos comparables de la misma categoría (modelos fundacionales tabulares con aprendizaje en contexto), así como a la variante Nori-30M de Synthefy. No se proporcionan datos cuantitativos de estos modelos en la información consultada, por lo que la comparativa es cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Rendimiento TabArena (R²) |
|---|---|---|---|---|
| Nori-100M (este) | ~98,3M | No especificado | Apache-2.0 | 0,8320 (media) |
| Nori-30M | ~30M (estimado) | No especificado | Apache-2.0 | Inferior al 100M (3º vs 1º) |
| TabPFN-3 | no disponible | no disponible | no disponible | Inferior al 100M (3º vs 1º) |
| EXAONE-Tabular | no disponible | no disponible | no disponible | Inferior al 100M (3º vs 1º) |
| TabFM | no disponible | no disponible | no disponible | Superior al 100M (2º vs 1º) |

No se dispone de datos técnicos detallados de TabFM, TabPFN-3 ni EXAONE-Tabular para una comparación exhaustiva.

## Limitaciones y advertencias

- Limitación de contexto: la atención densa O(N²) limita el tamaño práctico de las tablas de contexto; el rendimiento puede degradarse en tablas con muchas filas (large-N).
- Evaluación incompleta: solo ha sido evaluado en la suite TabArena; los resultados en TALENT-100 o OpenML-CTR23 no están verificados para esta variante.
- Entrenamiento solo con datos sintéticos: aunque evita la contaminación, la generalización a dominios muy específicos o con distribuciones muy diferentes a los datos sintéticos puede ser limitada.
- Riesgo de alucinación: como modelo de predicción numérica, puede producir predicciones poco realistas en regiones de baja densidad de datos, aunque no se han documentado casos concretos.
- Sin capacidades de lenguaje natural: no soporta instrucciones en texto, ni generación de código, ni tool calling.
- No se ha especificado el manejo explícito de valores ausentes o categóricos extremos; se recomienda preprocesar los datos de forma similar a los conjuntos utilizados en la evaluación.
- Uso comercial permitido gracias a la licencia Apache-2.0, pero se recomienda revisar el NOTICE del repositorio para posibles atribuciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synthefy/Nori-100M
- Repositorio GitHub: https://github.com/Synthefy/synthefy-nori
- Documentación oficial: https://docs.synthefy.com/nori/
- Página principal de Synthefy: https://www.synthefy.com/
- Blog de lanzamiento: https://www.synthefy.com/blog/synthefy-tabular-release
- Página de producto Nori: https://www.synthefy.com/product/tabular
- Modelo base Nori (mayor): https://huggingface.co/Synthefy/Nori
- Variante Nori-30M: https://huggingface.co/Synthefy/Nori-30M
