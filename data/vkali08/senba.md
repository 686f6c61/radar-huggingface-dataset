# vkali08/senba

## Resumen

Senba es una adaptación del modelo de dinámica molecular MarS-FM (Valence Labs, ICLR 2026) desarrollada por vkali08 para predecir transiciones de backbone de proteínas a partir del dataset mdCATH a 450 K con un lag de 50 frames. No es un modelo de lenguaje: se trata de un modelo generativo basado en flow matching que produce trayectorias conformacionales de proteínas, específicamente transiciones entre estados de C-alpha. Publicado como candidato de validación, Senba incorpora un mecanismo de anclaje al checkpoint fuente para preservar las propiedades de equilibrio del modelo original mientras mejora la precisión de las transiciones.

El modelo tiene 34.152.521 parámetros, todos entrenables durante la adaptación, y se presenta como un checkpoint PyTorch Lightning de aproximadamente 136 MB. La adaptación se realizó sobre un subconjunto limitado de mdCATH (128 dominios de entrenamiento y 32 de validación), con 10 épocas y 30.720 transiciones de lag exacto. La relevancia actual del modelo radica en su enfoque auditado: incluye recibos de selección, comparaciones y protocolos preregistrados, lo que permite verificar las mejoras declaradas sobre el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MarS-FM (flow matching), sin cambios |
| Parámetros totales | 34.152.521 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (lag de 50 frames) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (modelo de dinámica molecular, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch Lightning (.ckpt) |

## Arquitectura y entrenamiento

Senba reutiliza la arquitectura de MarS-FM sin modificaciones estructurales. MarS-FM es un modelo de flow matching para dinámica de proteínas, entrenado para generar transiciones conformacionales de backbone. La adaptación se llevó a cabo mediante un fine-tuning de todos los parámetros del modelo fuente durante 10 épocas (160 actualizaciones de optimizador, 30.720 transiciones muestreadas con lag exacto de 50 frames), con batch size de 8 dominios y learning rate de 3e-6, en una NVIDIA H100 durante 121,80 segundos (pico de 64,7 GB de memoria asignada). La pérdida de validación pasó de 1,724479 a 1,693136.

La innovación técnica principal es el mecanismo de "anclaje de origen": tras el fine-tuning, el modelo padre resultante dañaba los conjuntos de equilibrio del modelo fuente, por lo que fue rechazado. Senba se construyó como una interpolación de pesos en el espacio de pesos: `source + 0.0735 · (parent − source)`, reteniendo solo el 7,35% del desplazamiento del fine-tuning. Este anclaje preserva las propiedades de equilibrio del modelo original mientras mejora la precisión de las transiciones.

## Capacidades

- Generación de transiciones conformacionales de proteínas (backbone C-alpha) mediante flow matching, con una ventana de 50 frames a 450 K.
- Producción de ensembles conformacionales: el modelo puede generar múltiples muestras (con 10 pasos ODE, 4 inicios por réplica, 4 muestras por inicio) para estimar propiedades estadísticas como RMSD, DCCM o fracción de contactos nativos.
- Mejora de la precisión en la predicción de estados finales en comparación con el modelo base MarS-FM y con la persistencia de coordenadas.
- Retención de observables de equilibrio: los siete observables congelados (DCCM MAE, fracción de contactos nativos, RMSD por pares, RMSIP de subespacio PCA, fracción de choques, radio de giro, etc.) se mantienen dentro de los límites predefinidos en la suite de equilibrio de 8 dominios.
- No soporta tool calling, funciones, agentes ni tareas de lenguaje: es un modelo exclusivamente biológico.
- Capacidades multilingües: no aplica.

## Casos de uso

- Estudio de transiciones conformacionales en proteínas: los investigadores pueden generar trayectorias de transición entre conformaciones a 450 K y compararlas con simulaciones de dinámica molecular para validar hipótesis sobre cambios estructurales.
- Generación de ensembles para análisis de equilibrio: el modelo produce múltiples muestras de conformaciones que permiten calcular métricas de equilibrio como DCCM, fracción de contactos nativos o radio de giro, útiles en estudios de estabilidad proteica.
- Predicción de estados finales en dinámica molecular: dado un estado inicial, Senba predice la conformación tras 50 frames, lo que puede servir como punto de partida para simulaciones más largas o para comparar con datos experimentales.
- Benchmarking de métodos de dinámica molecular: al ser un candidato auditado con protocolos preregistrados, puede usarse como referencia en comparativas de nuevos modelos o algoritmos de muestreo conformacional.
- Integración en pipelines de análisis estructural: el checkpoint ligero (~136 MB) permite ejecutarlo en GPUs de consumo, integrándolo en flujos de trabajo de análisis de proteínas sin necesidad de infraestructura de alto rendimiento.
- Investigación en plegamiento y estabilidad: el modelo puede aplicarse al estudio de dominios de proteínas de hasta 256 residuos, analizando métricas como RMSD de C-alpha y radio de giro para evaluar cambios conformacionales inducidos por temperatura.

## Benchmarks y rendimiento

Se presentan los resultados publicados en la model card. Los valores corresponden a mejoras en el RMSD de C-alpha del ensemble-mean endpoint sobre una población de validación de 28 dominios (≤256 residuos). Inferencia con 10 pasos ODE, 4 inicios por réplica, 4 muestras por inicio, 5 réplicas a 450 K, lag 50.

| Comparación | Mejora RMSD (Å) | IC 95% (Å) | Dominios mejorados |
|---|---|---|---|
| Senba vs MarS-FM fuente | +0,0326 | [0,0253, 0,0401] | 27 / 28 |
| Senba vs persistencia de coordenadas | +0,436 | [0,203, 0,681] | 22 / 28 |
| Senba vs Senba anterior (5 épocas, α = 0,08) | +0,00216 | [0,00086, 0,00345] | 22 / 28 |

Métricas secundarias sobre los mismos resultados: mejora de RMSD best-of-k vs fuente +0,0372 Å, mejora de RMSD de una sola muestra +0,0689 Å, mejora de MAE de magnitud de desplazamiento +0,0292 Å, mejora de coseno de dirección +0,0014.

En la suite de retención de equilibrio (8 dominios, muestreo oficial de árbol, 500 muestras), la degradación se mide en la dirección desfavorable frente a MarS-FM fuente; los valores negativos son mejoras. Los límites se congelaron antes de generar ningún candidato.

| Observable | Degradación media | IC 95% | Límite medio | Peor dominio / límite | Resultado |
|---|---|---|---|---|---|
| DCCM MAE | −0,000660 | [−0,001625, 0,000285] | 0,005 | 0,001768 / 0,01 | Pasa |
| Fracción de contacto nativo W1 | +0,000271 | [−0,001594, 0,001946] | 0,015 | 0,003055 / 0,03 | Pasa |
| RMSD por pares W1 (Å) | −0,0437 | [−0,1260, 0,0493] | 0,25 | 0,2076 / 0,5 | Pasa |
| RMSIP de subespacio PCA | +0,00416 | [−0,00023, 0,01075] | 0,03 | 0,02536 / 0,06 | Pasa |
| Fracción de choques | −0,0000012 | [−0,0000246, 0,0000225] | 0,0005 | 0,0000575 / 0,001 | Pasa |
| Radio de giro W1 (Å) | −0,0422 | [no disponible] | [no disponible] | [no disponible] | Pasa |

La model card indica que los siete observables congelados pasan la suite de retención de equilibrio, aunque solo se muestran seis en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint tiene 34M parámetros y ocupa aproximadamente 136 MB en FP32. La inferencia con 10 pasos ODE requiere una cantidad de memoria muy reducida, estimada en menos de 1 GB de VRAM.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA H100 con 64,7 GB de memoria asignada. Para inferencia, cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo RTX 3050, RTX 4060, A100, H100, etc.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe holgadamente en GPUs de gama de entrada y en GPUs de consumo medio.
- Opciones de despliegue: al ser un checkpoint PyTorch Lightning, puede cargarse directamente con PyTorch o en scripts personalizados. No se mencionan integraciones con vLLM, llama.cpp ni Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La model card solo reporta el tiempo de fine-tuning en la H100 (121,80 s), no la latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / lag | Mejora RMSD vs Senba | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Senba | 34,15 M | Lag 50 frames | — | MIT | HuggingFace |
| MarS-FM fuente | 34,15 M | Lag no especificado | −0,0326 Å (peor) | MIT | HuggingFace |
| Persistencia de coordenadas | 0 (línea base) | N/A | −0,436 Å (peor) | N/A | No disponible |
| Senba anterior (5 épocas, α=0,08) | 34,15 M | Lag 50 frames | −0,00216 Å (peor) | MIT | HuggingFace |

La comparativa se limita a las alternativas evaluadas en la model card. No se dispone de información sobre otros modelos de dinámica molecular con los que comparar.

## Limitaciones y advertencias

- No es evidencia de test-set: la partición de test estándar de mdCATH (495 dominios) permanece sin abrir (`test_records_opened = 0`). Los resultados corresponden exclusivamente a la población de validación de 28 dominios.
- No es una afirmación de estado del arte ni de liderazgo en el campo: los únicos baselines comparados son el MarS-FM fuente y la persistencia de coordenadas.
- No es evidencia de tiempo físico, eventos raros ni escalas de tiempo largas: solo se evalúa un lag de 50 frames.
- No es una validación all-atom: todas las métricas son de C-alpha.
- No es una validación de generalización amplia: la población de validación incluye solo 28 dominios con una longitud de hasta 256 residuos.
- No es un modelo final: se publica como candidato de validación.
- El fine-tuning padre dañó los conjuntos de equilibrio del modelo fuente, por lo que el modelo final está anclado con α=0,0735. Esto puede limitar la magnitud de las mejoras en transiciones.
- Licencia MIT: permite uso comercial, pero debe considerarse que el modelo es un candidato de validación y no está listo para aplicaciones de producción sin una evaluación adicional.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/vkali08/senba
- Página de lanzamiento: https://senba.papercrane.bio/
- Código fuente de MarS-FM (GitHub): https://github.com/valence-labs/mars-fm
- Modelo base en HuggingFace: https://huggingface.co/valencelabs/mars-fm
- Dataset mdCATH en HuggingFace: https://huggingface.co/datasets/compsciencelab/mdCATH
- Artículo arXiv 2509.24779: https://arxiv.org/abs/2509.24779
- Artículo arXiv 2407.14794: https://arxiv.org/abs/2407.14794
