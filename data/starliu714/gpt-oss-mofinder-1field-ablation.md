# StarLiu714/GPT-oss-MOFinder-1field-ablation

## Resumen

GPT-oss-MOFinder-1field-ablation es un ajuste fino (LoRA fusionado) del modelo abierto GPT-oss-20b de OpenAI, desarrollado por el usuario StarLiu714 en el contexto del proyecto MOFinder (laboratorio zzheng). El modelo está especializado en química de estructuras metalorgánicas (MOF, Metal-Organic Frameworks) y su tarea concreta es clasificar si una síntesis experimental descrita en la literatura tendrá éxito o fracasará (predicción P/N, positiva/negativa) a partir de las condiciones de reacción y los campos químicos disponibles.

Este checkpoint concreto no es el modelo principal, sino una rama de ablación: se ha entrenado eliminando de forma deliberada uno de cada ocho campos (el "single-field flip") de los registros de experimentos fallidos, para evaluar si el modelo mantiene su rendimiento sin depender de un único campo químico durante el entrenamiento. El repositorio incluye comparaciones frente a variantes con eliminación aleatoria de negativos (seeds 101 a 505), lo que permite analizar la robustez del ajuste fino ante información química incompleta.

Es relevante para investigadores que trabajen en extracción de conocimiento químico, predicción de síntesis y evaluación de robustez de LLM en dominios científicos con datos estructurados y escasos. El modelo conserva la arquitectura y el tamaño del GPT-oss-20b original (unos 20.900 millones de parámetros) y se distribuye con licencia GPL-3.0, mientras que el modelo base mantiene su licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (gpt_oss), ajuste fino LoRA fusionado sobre openai/gpt-oss-20b |
| Parametros totales | 20.914.757.184 (20,9 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio incluye exportación de pesos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | GPL-3.0 (modelo base: Apache-2.0) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-20b, un transformer causal de aproximadamente 20.900 millones de parámetros, y se ha especializado mediante un ajuste fino con LoRA sobre un corpus de química de MOF. El entrenamiento se centra en una tarea de clasificación binaria (síntesis exitosa o fallida) a partir de registros experimentales estructurados, con un conjunto de datos que contiene 1.320 ejemplos positivos y 1.275 negativos en el conjunto de evaluación holdout.

La innovación metodológica de este checkpoint es la ablación de campos: en lugar de entrenar con todos los campos químicos disponibles (el modelo principal MOFinder usa el conjunto completo de datos PN), aquí se elimina uno de cada ocho campos para simular información química incompleta. El autor justifica esta variante porque algunas síntesis son más sensibles a una única variable que otras, y el objetivo es comprobar si el modelo mantiene un rendimiento fuerte sin depender de un único campo en los registros de experimentos fallidos. El repositorio incluye además variantes de control con eliminación aleatoria de negativos (seeds 101, 202, 303, 404 y 505) para comparar el efecto de la eliminación selectiva frente a la aleatoria.

## Capacidades

- Clasificación binaria de éxito/fracaso de síntesis de MOF a partir de condiciones experimentales y campos químicos.
- Generación de texto causal y conversacional en inglés, heredada del modelo base GPT-oss-20b.
- Razonamiento sobre datos químicos estructurados (campos de reacción, variables experimentales).
- Soporte de tool calling y function calling heredado del modelo base (no verificado específicamente en este checkpoint).
- Capacidades de agente y razonamiento multi-paso heredadas del modelo base (no verificadas en la model card).
- Capacidades multilingües limitadas: el modelo está etiquetado únicamente para inglés.
- Modo de razonamiento (thinking) del GPT-oss original: no disponible en la información proporcionada para este ajuste.

## Casos de uso

- Predicción de éxito de síntesis en laboratorio: dado un conjunto de condiciones experimentales de un MOF, el modelo estima la probabilidad de que la síntesis funcione, lo que permite priorizar experimentos antes de consumir reactivos y tiempo de banco.
- Filtrado de literatura científica: integrado en un pipeline de extracción de entidades, el modelo puede clasificar automáticamente registros de síntesis extraídos de artículos como positivos o negativos, ayudando a construir bases de datos químicas curadas.
- Análisis de robustez de modelos científicos: la propia naturaleza de ablación del checkpoint lo hace útil como referencia para estudiar cómo afecta la información incompleta al rendimiento de LLM en dominios especializados.
- Detección de variables críticas: comparando las salidas de este checkpoint con el modelo principal MOFinder, un investigador puede identificar qué campos químicos son más determinantes para el éxito de una síntesis.
- Asistencia en diseño experimental: el modelo puede señalar condiciones de reacción con alta probabilidad de fracaso, permitiendo al químico descartar combinaciones problemáticas antes de ejecutarlas.
- Evaluación comparativa de estrategias de aumento de datos: los resultados con distintas seeds de eliminación aleatoria permiten a equipos de ML decidir cómo construir conjuntos de entrenamiento negativos para tareas de clasificación química.

## Benchmarks y rendimiento

Los datos publicados en la model card corresponden a la tarea de clasificación de síntesis de MOF:

| Configuracion | Conjunto | Tamano | Accuracy | Precision |
|---|---|---|---|---|
| drop 1-field 'flipped' N | Holdout | 1320P + 1275N | 0,73141 | 0,67087 |
| drop 1-field 'flipped' N | 22 preguntas | 11P + 11N | 14/22 | 0,5789 |
| random drop N, seed 101 | Holdout | 1320P + 1275N | 0,71676 | 0,67277 |
| random drop N, seed 101 | 22 preguntas | 11P + 11N | 16/22 | 0,6471 |
| random drop N, seed 202 | Holdout | 1320P + 1275N | 0,68092 | 0,67060 |
| random drop N, seed 202 | 22 preguntas | 11P + 11N | 15/22 | 0,6429 |
| random drop N, seed 303 | Holdout | 1320P + 1275N | 0,72177 | 0,70938 |
| random drop N, seed 303 | 22 preguntas | 11P + 11N | 16/22 | 0,6667 |
| random drop N, seed 404 | Holdout | 1320P + 1275N | 0,71175 | 0,67397 |
| random drop N, seed 404 | 22 preguntas | 11P + 11N | 14/22 | 0,5789 |
| random drop N, seed 505 | Holdout | 1320P + 1275N | 0,70482 | 0,66567 |
| random drop N, seed 505 | 22 preguntas | 11P + 11N | 16/22 | 0,6471 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 42 GB solo para pesos (20,9 mil millones de parámetros × 2 bytes), más memoria para el contexto y el tokenizador; en la práctica se recomienda al menos 48 GB.
- En cuantización de 8 bits: unos 21 GB de VRAM; en 4 bits: unos 11-12 GB, aunque el repositorio no documenta cuantizaciones oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o dos RTX 4090 (24 GB cada una) para BF16; una única RTX 4090 es suficiente en cuantización de 4 bits.
- Cabe en GPU de consumo (RTX 3090, RTX 4090, RTX 5090) solo con cuantización agresiva; en BF16 no cabe en una GPU de 24 GB.
- Opciones de despliegue: transformers (documentado en la model card con `AutoModelForCausalLM` y `device_map="auto"`); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-oss-MOFinder-1field-ablation | 20,9 mil millones | no disponible | Clasificación de síntesis MOF (ablación) | GPL-3.0 | Hugging Face |
| GPT-oss-MOFinder (principal) | 20,9 mil millones | no disponible | Clasificación de síntesis MOF (datos completos) | GPL-3.0 | Hugging Face |
| openai/gpt-oss-20b | 20,9 mil millones | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| Variantes random-drop (seeds 101-505) | 20,9 mil millones | no disponible | Clasificación de síntesis MOF (control) | GPL-3.0 | Hugging Face |

No se dispone de información sobre otros modelos especializados en predicción de síntesis de MOF en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés y para una tarea muy concreta de química de MOF; su uso fuera de ese dominio producirá resultados poco fiables.
- Es un checkpoint de ablación, no el modelo principal: su rendimiento (accuracy 0,73 en holdout) está por debajo de lo esperado para un modelo de producción y no debe usarse como referencia de calidad del proyecto MOFinder.
- El conjunto de evaluación de 22 preguntas es muy pequeño, por lo que las métricas de precisión tienen alta varianza y no son concluyentes.
- Riesgo de alucinación inherente al modelo base GPT-oss-20b, especialmente al generar texto libre fuera de la tarea de clasificación.
- La licencia GPL-3.0 es copyleft fuerte: cualquier uso comercial o distribución de productos derivados obliga a liberar el código bajo la misma licencia, lo que puede ser incompatible con productos propietarios. El modelo base conserva Apache-2.0, pero este checkpoint fusionado se distribuye como GPL-3.0.
- El repositorio ocupa 245,2 GB, lo que incluye múltiples artefactos y exportaciones; conviene verificar qué ficheros se descargan antes de clonar.
- No hay documentación sobre sesgos específicos del ajuste fino ni sobre el proceso de anotación de los datos de entrenamiento.
- El autor indica que el código de MOFinder tiene licencia MIT separada, pero los pesos de este repositorio son GPL-3.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarLiu714/GPT-oss-MOFinder-1field-ablation
- Modelo principal MOFinder: https://huggingface.co/StarLiu714/GPT-oss-MOFinder
- Modelo base GPT-oss-20b: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de código MOFinder: https://github.com/zzhenglab/MOFinder
- Citación del proyecto MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
