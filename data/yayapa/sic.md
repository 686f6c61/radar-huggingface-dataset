# yayapa/sic

## Resumen

SIC (Survival In-Context) es un modelo presentado por el autor yayapa como la implementación oficial del artículo "Survival In-Context: Amortized Bayesian Survival Analysis via Prior-Fitted Networks" (arXiv:2603.29475). El modelo traslada los paradigmas de Prior-Fitted Networks (PFN) e In-Context Learning (ICL) al ámbito del análisis de supervivencia, un campo tradicionalmente dominado por modelos estadísticos como Cox o por aproximaciones bayesianas que requieren ajuste e inferencia costosa.

La propuesta central es que SIC no requiere ajuste de hiperparámetros ni entrenamiento adicional en el momento de uso: realiza predicciones tomando el conjunto de datos de entrenamiento como contexto dentro de la ventana de entrada. Esto lo convierte en un amortiguador bayesiano (amortized Bayesian inference) que aproxima la posterior predictiva de forma directa en una sola pasada.

El repositorio de HuggingFace ocupa 2,3 GB, lo que sugiere un modelo de escala media, aunque la model card no detalla arquitectura, número de parámetros ni longitud de contexto. La información pública disponible es muy limitada: no se especifican licencia, idiomas soportados, pipeline ni resultados de benchmarks, por lo que esta ficha refleja únicamente lo que puede inferirse de la documentación del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Prior-Fitted Network (PFN) con In-Context Learning aplicado a análisis de supervivencia; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (tamaño de repo: 2,3 GB) |

## Arquitectura y entrenamiento

SIC se enmarca en el paradigma de Prior-Fitted Networks: un modelo se entrena una sola vez sobre datos sintéticos generados a partir de un prior sobre tareas de supervivencia, de modo que aprende a aproximar la inferencia bayesiana amortizada. En tiempo de inferencia, el conjunto de datos de entrenamiento real se pasa como contexto y el modelo produce directamente la posterior predictiva sin necesidad de optimización ni muestreo MCMC.

La model card indica explícitamente que el modelo "no requiere ajuste de hiperparámetros ni entrenamiento" en uso, y que las predicciones se realizan usando el dataset de entrenamiento como contexto. No se detalla el número de tokens de entrenamiento, la composición del corpus sintético, ni si se emplearon técnicas de RLHF o DPO (poco probables en este tipo de modelo). Tampoco se especifica si la arquitectura interna es un transformer estándar u otra variante; el paper referenciado (arXiv:2603.29475) es la fuente principal para esos detalles.

## Capacidades

- Análisis de supervivencia amortizado: estimación de funciones de supervivencia y riesgos condicionales a partir de datos tabulares con censura.
- Inferencia bayesiana aproximada en una sola pasada, sin MCMC ni ajuste de hiperparámetros.
- Aprendizaje en contexto: el dataset de entrenamiento se utiliza como contexto para condicionar las predicciones.
- Adaptación a nuevos datasets sin reentrenamiento, siempre que encajen en el prior de tareas asumido.
- No se documentan capacidades de generación de texto, código, matemáticas generales, visión, audio, tool calling ni razonamiento multi-paso.
- Soporte multilingüe: no disponible (no es una capacidad relevante para el dominio tabular del modelo).

## Casos de uso

- Análisis de supervivencia clínica: estimar curvas de supervivencia de pacientes a partir de cohortes con datos censurados, usando la cohorte de referencia como contexto y evitando el ajuste de modelos de Cox por cada nuevo estudio.
- Análisis de fiabilidad industrial: predecir el tiempo hasta fallo de componentes a partir de históricos de mantenimiento, aprovechando la inferencia amortizada para evaluar muchos lotes sin reentrenar.
- Modelado de churn con censura: estimar el tiempo hasta la baja de clientes cuando parte de la base aún no ha cancelado, un escenario donde los modelos de clasificación estándar no son directamente aplicables.
- Estudios epidemiológicos exploratorios: obtener estimaciones rápidas de riesgo en subpoblaciones antes de comprometer recursos en un análisis bayesiano completo con MCMC.
- Evaluación de tratamientos en datos observacionales: comparar funciones de supervivencia entre grupos condicionando sobre covariables, como paso previo a un análisis causal formal.
- Prototipado en investigación metodológica: servir como referencia amortizada para comparar con métodos bayesianos exactos en experimentos de simulación, gracias a su bajo coste de inferencia por consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de 2,3 GB sugiere que los pesos en precisión nativa (probablemente fp32 o bf16) caben en GPUs consumer de 8-12 GB, pero no se confirma el formato ni el número de parámetros.
- GPU recomendadas: no disponible. Para un modelo de este tamaño, una RTX 3090/4090 o una A10G serían suficientes en inferencia, pero es una estimación, no un dato del autor.
- Cabe en GPU consumer: probablemente sí, en función del formato de pesos; no confirmado.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de dominio específico (PFN tabular), el despliegue habitual sería mediante el código del repositorio de GitHub del autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SIC (yayapa/sic) | PFN para supervivencia | no disponible | no disponible | no disponible | HuggingFace + GitHub |
| TabPFN | PFN para clasificación/regresión tabular | no disponible en esta ficha | no disponible | no disponible | HuggingFace |
| Modelos de Cox / Random Survival Forest | Estadística clásica de supervivencia | no aplica | no aplica | según implementación | Amplia (scikit-survival, lifelines) |

La comparación directa con TabPFN es la más pertinente por compartir el paradigma PFN, aunque SIC se especializa en supervivencia con censura. Frente a Cox o Random Survival Forest, la ventaja declarada es la ausencia de ajuste y la amortización de la inferencia; la desventaja es la dependencia del prior de tareas y la falta de validación pública en benchmarks.

## Limitaciones y advertencias

- Información pública muy escasa: no hay licencia declarada, lo que impide evaluar el uso comercial sin contactar al autor.
- No se han publicado benchmarks ni comparaciones cuantitativas con métodos de referencia, lo que dificulta valorar su precisión frente a Cox o modelos bayesianos exactos.
- Al ser un PFN, su rendimiento depende críticamente de que el prior de entrenamiento cubra la distribución de los datos reales; fuera de ese prior, las predicciones pueden degradarse sin aviso.
- No se documentan sesgos conocidos; en datos clínicos o demográficos, los sesgos del prior sintético podrían propagarse a las estimaciones.
- Riesgo de calibración incorrecta de la posterior predictiva si el contexto excede la longitud máxima soportada (no especificada).
- No es un modelo de propósito general: no debe esperarse generación de texto, código ni capacidades conversacionales.
- Uso en producción requiere validación independiente contra un método estadístico establecido antes de tomar decisiones clínicas o financieras.

## Enlaces

- HuggingFace: https://huggingface.co/yayapa/sic
- Paper: https://arxiv.org/pdf/2603.29475
- GitHub: https://github.com/yayapa/sic
