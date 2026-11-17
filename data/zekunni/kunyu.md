# zekunni/kunyu

## Resumen

Kunyu es un modelo global de predicción meteorológica presentado en el artículo arXiv 2312.08264, "Kunyu: A High-Performing Global Weather Model Beyond Regression Losses", desarrollado por el autor que publica bajo el identificador zekunni. No es un modelo de lenguaje: se trata de un modelo de aprendizaje profundo orientado a la predicción del tiempo a escala planetaria, entrenado para superar las limitaciones de las funciones de pérdida puramente de regresión (MSE/MAE) que dominan la literatura de modelos meteorológicos neuronales.

El repositorio de Hugging Face contiene únicamente los pesos estáticos del modelo y sus variantes (Kunyu y Kunyu-Legacy), con un tamaño total de 14,2 GB, licencia MIT y formato de pesos no especificado en la información disponible. El código de inferencia, la instalación y los ejemplos se distribuyen por separado en el repositorio de GitHub del proyecto.

El interés del modelo radica en su planteamiento metodológico: sostiene que optimizar exclusivamente el error cuadrático medio produce predicciones excesivamente suavizadas y degrada la estructura física de los campos meteorológicos, y propone objetivos de entrenamiento alternativos que preservan mejor las propiedades espectrales y los extremos. Es relevante para investigadores en nowcasting y predicción a medio plazo que quieran reproducir o comparar modelos neuronales del sistema Tierra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo neuronal de predicción meteorológica global; detalles en el paper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo numérico, no textual) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 14,2 GB con pesos estáticos) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. El artículo se centra en la formulación del objetivo de entrenamiento y en la afirmación de que Kunyu supera a los modelos basados en pérdidas de regresión, lo que sugiere una arquitectura de red neuronal (probablemente un transformer o una red convolucional de tipo U-Net aplicada a rejillas esféricas, patrón habitual en modelos como GraphCast, Pangu-Weather o FourCastNet), pero este extremo no puede confirmarse con los datos proporcionados.

Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset (reanálisis ERA5 u otros), la resolución espacial, el número de variables predichas ni si se emplearon técnicas de ajuste fino o RLHF (no aplicables en este dominio). La innovación declarada es el diseño de la función de pérdida más allá de la regresión, que presumiblemente incorpora términos de estructura espacial o espectral; el detalle exacto debe consultarse en el paper.

## Capacidades

- Predicción meteorológica global: generación de campos atmosféricos futuros a partir de estados iniciales, según el planteamiento del artículo.
- Variante Kunyu-Legacy: versión adicional incluida en el mismo repositorio, presumiblemente con un esquema de entrenamiento previo o de referencia.
- Superación de la pérdida de regresión: el modelo está diseñado explícitamente para evitar el suavizado excesivo asociado al MSE.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües, visión, audio ni modos de razonamiento, dado que no es un modelo de lenguaje.

## Casos de uso

- Investigación en predicción meteorológica neuronal: reproducción de los experimentos del paper para comparar la pérdida propuesta con MSE/MAE en modelos de referencia.
- Evaluación de extremos meteorológicos: análisis de si el modelo preserva mejor la intensidad de ciclones, frentes y precipitaciones extremas frente a modelos entrenados solo con regresión.
- Benchmarking académico: uso de los pesos como línea base en estudios sobre funciones de pérdida en modelos del sistema Tierra.
- Predicción a medio plazo en entornos de investigación: generación de pronósticos globales a partir de reanálisis para estudiar la degradación del error con el horizonte temporal.
- Estudio de propiedades espectrales: análisis de la energía por escalas espaciales en las predicciones para verificar la reducción del suavizado.
- Docencia y formación: uso del repositorio y del código de GitHub como ejemplo práctico de entrenamiento de modelos meteorológicos neuronales.
- Integración en pipelines de investigación climática: combinación con herramientas de verificación (por ejemplo, métricas RMSE, ACC y análisis de extremos) para evaluar la calidad de los pronósticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artículo afirma que el modelo supera a los basados en pérdidas de regresión, pero las cifras concretas (RMSE por variable, ACC, horizontes de predicción) no se incluyen en los datos proporcionados y deben consultarse en el paper.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 14,2 GB, lo que sugiere que los pesos en precisión completa o media podrían requerir del orden de esa cifra de memoria, pero la estimación exacta depende de la arquitectura y del número de parámetros, que no se especifican.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es plausible que quepa en GPUs de 24 GB o más (RTX 4090, A100 40/80 GB, H100), pero no puede confirmarse.
- Cabe en GPU de consumo: no confirmado; el tamaño de 14,2 GB sugiere que podría cargarse en GPUs de 16-24 GB, pero requiere verificación.
- Opciones de despliegue: el autor remite al repositorio de GitHub para código, instalación y ejemplos; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kunyu | no disponible | no aplica | Afirma superar a modelos con pérdida de regresión (sin cifras) | MIT | Pesos en HF, código en GitHub |
| GraphCast (DeepMind) | no disponible en esta ficha | no aplica | Referencia en predicción global neuronal | no disponible en esta ficha | Pesos y código publicados |
| Pangu-Weather | no disponible en esta ficha | no aplica | Referencia en predicción global neuronal | no disponible en esta ficha | Pesos publicados |
| FourCastNet | no disponible en esta ficha | no aplica | Referencia en predicción global neuronal | no disponible en esta ficha | Pesos y código publicados |

No se dispone de datos suficientes para una comparación cuantitativa; la tabla anterior solo identifica alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse con métricas de NLP ni usarse para generación de texto, código o conversación.
- Ausencia de benchmarks publicados en la información disponible: no es posible verificar las afirmaciones de rendimiento sin consultar el paper.
- Sesgos y errores sistemáticos propios de los modelos meteorológicos neuronales (deriva en horizontes largos, suavizado residual, dependencia del reanálisis de entrenamiento), aunque no se detallan en la información disponible.
- Riesgo de alucinación no aplicable en el sentido de NLP, pero sí riesgo de predicciones físicamente inconsistentes fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre la idoneidad operativa.
- El repositorio de Hugging Face no incluye código de inferencia; es necesario acudir a GitHub, lo que añade fricción para la reproducción.
- Fecha de creación del repositorio (2026-11-16) y ausencia de descargas y likes: proyecto con muy poca adopción verificable en el momento de la consulta.
- Idiomas y cuantizaciones no disponibles: no se han publicado variantes cuantizadas.

## Enlaces

- Hugging Face: https://huggingface.co/zekunni/kunyu
- Paper arXiv: https://arxiv.org/abs/2312.08264
- Repositorio GitHub: https://github.com/Elysion-tcfa/kunyu
