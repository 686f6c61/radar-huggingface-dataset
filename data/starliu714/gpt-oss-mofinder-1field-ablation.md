# StarLiu714/GPT-oss-MOFinder-1field-ablation

## Resumen

GPT-oss-MOFinder-1field-ablation es un ajuste fino de tipo LoRA sobre el modelo abierto openai/gpt-oss-20b, desarrollado por StarLiu714 en el contexto del proyecto MOFinder (zzhenglab). El modelo está especializado en química de redes metal-orgánicas (MOF, Metal-Organic Frameworks) y resuelve una tarea muy concreta: predecir si una síntesis experimental de un MOF tendrá éxito o fracasar a partir de las condiciones de reacción descritas en lenguaje natural.

Este checkpoint no es un modelo de propósito general, sino una ablación experimental. Su objetivo es medir hasta qué punto el modelo depende de registros de entrenamiento que difieren de un experimento exitoso en un único campo (los llamados "P→N flips" de un solo campo). Para ello, el conjunto de entrenamiento elimina esos registros de fallo de campo único y se compara el rendimiento resultante con variantes de eliminación aleatoria de negativos emparejados (seeds 101 a 505). Es, por tanto, una pieza de un estudio metodológico sobre robustez y sesgo de datos en modelos de lenguaje aplicados a química.

El modelo hereda la arquitectura y el tamaño del gpt-oss-20b de OpenAI (20.914.757.184 parámetros según safetensors) y se distribuye con pesos en BF16 y safetensors, licencia GPL-3.0 para el ajuste y Apache-2.0 para el modelo base. Su relevancia es acotada pero clara: sirve como referencia reproducible para investigadores que trabajen en predicción de síntesis de materiales y quieran entender el impacto de la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (hereda la de openai/gpt-oss-20b; detalles internos de la arquitectura base no disponibles en la informacion proporcionada) |
| Parametros totales | 20.914.757.184 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye un export de pesos en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | GPL-3.0 para el ajuste; Apache-2.0 para el modelo base |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo parte de openai/gpt-oss-20b, un transformer causal de aproximadamente 20,9 mil millones de parámetros, y se ajusta mediante LoRA específico de dominio sobre datos de síntesis de MOF. El autor describe el proceso como un ajuste fino con LoRA ("domain-specific LoRA finetuning") cuyos cambios se fusionan en el modelo base y se exportan en BF16. La model card no detalla el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible.

La innovación metodológica de este checkpoint es la ablación sobre la composición del conjunto de entrenamiento. En la variante principal se eliminan los registros de experimentos fallidos que se generan cambiando un único campo respecto a las condiciones de un experimento exitoso (los "P→N flips" de un solo campo). El objetivo es comprobar si el modelo mantiene un rendimiento sólido sin depender de esa señal artificial. Como control, se comparan variantes con eliminación aleatoria de negativos emparejados (seeds 101, 202, 303, 404 y 505). El conjunto de test contiene 1.320 positivos y 1.275 negativos, más un conjunto pequeño de 22 preguntas (11 positivas y 11 negativas).

## Capacidades

- Predicción de éxito o fracaso de síntesis de MOF a partir de condiciones experimentales descritas en texto.
- Clasificación binaria orientada a química de materiales (positivo/negativo de síntesis).
- Generación de texto causal y conversación en inglés, heredadas del modelo base gpt-oss-20b.
- Razonamiento sobre variables experimentales (temperatura, disolventes, reactivos, tiempos, etc.) en el dominio de síntesis de MOF.
- Soporte de tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo "thinking", visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Filtrado previo de experimentos de síntesis de MOF: dado un protocolo experimental descrito en texto, el modelo estima la probabilidad de éxito antes de ejecutar el experimento en laboratorio, lo que permite priorizar recursos y reducir ensayos fallidos.
- Estudio de robustez de datasets químicos: este checkpoint sirve como referencia para investigar cuánto depende un modelo de clasificación química de registros negativos generados por perturbación de un solo campo, comparando con las variantes de eliminación aleatoria (seeds 101-505).
- Reproducción de experimentos de ablación: investigadores que quieran replicar el análisis de "leave-one-field-out" pueden usar este checkpoint junto con el modelo principal MOFinder para contrastar resultados.
- Asistencia en la redacción de protocolos: el modelo puede integrarse en un flujo de revisión de condiciones de síntesis para detectar combinaciones atípicas o potencialmente problemáticas.
- Evaluación comparativa de ajustes LoRA en dominios científicos: sirve como caso de estudio de cómo el ajuste fino de dominio sobre un modelo generalista de 20B afecta a una tarea de clasificación binaria especializada.
- Docencia y experimentación en química computacional: permite a grupos de investigación con recursos moderados experimentar con un modelo de 20B especializado sin partir de cero, gracias a la disponibilidad de pesos en safetensors y a la compatibilidad con transformers.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son los de la propia ablación. La tabla compara la variante "drop 1-field flipped N entries" con eliminaciones aleatorias emparejadas:

| Configuracion de entrenamiento | Conjunto de test | Tamano | Accuracy | Precision |
|---|---|---|---|---|
| Drop 1-field 'flipped' N | Holdout | 1320P + 1275N | 0.73141 | 0.67087 |
| Drop 1-field 'flipped' N | 22 preguntas | 11P + 11N | 14/22 | 0.5789 |
| Random drop N, seed 101 | Holdout | 1320P + 1275N | 0.71676 | 0.67277 |
| Random drop N, seed 101 | 22 preguntas | 11P + 11N | 16/22 | 0.6471 |
| Random drop N, seed 202 | Holdout | 1320P + 1275N | 0.68092 | 0.67060 |
| Random drop N, seed 202 | 22 preguntas | 11P + 11N | 15/22 | 0.6429 |
| Random drop N, seed 303 | Holdout | 1320P + 1275N | 0.72177 | 0.70938 |
| Random drop N, seed 303 | 22 preguntas | 11P + 11N | 16/22 | 0.6667 |
| Random drop N, seed 404 | Holdout | 1320P + 1275N | 0.71175 | 0.67397 |
| Random drop N, seed 404 | 22 preguntas | 11P + 11N | 14/22 | 0.5789 |
| Random drop N, seed 505 | Holdout | 1320P + 1275N | 0.70482 | 0.66567 |
| Random drop N, seed 505 | 22 preguntas | 11P + 11N | 16/22 | 0.6471 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en BF16 (20,9B parámetros), se necesitan aproximadamente 42 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, al menos 48-80 GB de VRAM para una ejecución cómoda.
- Cuantización: la información disponible no detalla cuantizaciones GGUF/AWQ/GPTQ publicadas para este checkpoint; el repo ocupa 245,2 GB, lo que sugiere múltiples artefactos además de los pesos BF16.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB con paralelismo de tensor) para BF16.
- GPU de consumo: no cabe en una sola GPU de consumo de 24 GB en BF16; requeriría cuantización (no publicada en la información disponible) o sharding multi-GPU.
- Opciones de despliegue: transformers con `device_map="auto"` (método indicado en la model card); vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPT-oss-MOFinder-1field-ablation | 20,9B | no disponible | Clasificación de síntesis MOF (ablación) | GPL-3.0 (ajuste) / Apache-2.0 (base) | HuggingFace |
| GPT-oss-MOFinder (modelo principal) | 20,9B (base gpt-oss-20b) | no disponible | Clasificación de síntesis MOF (entrenado con datos PN completos) | según repo principal | HuggingFace |
| openai/gpt-oss-20b | 20,9B | no disponible | Generación de texto generalista | Apache-2.0 | HuggingFace |

No se dispone de información sobre otros modelos especializados en predicción de síntesis de MOF con los que comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: no es un asistente general; su utilidad está restringida a la predicción de éxito/fracaso de síntesis de MOF.
- Idioma: solo inglés según la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir justificaciones plausibles pero incorrectas sobre condiciones experimentales; no debe usarse como única fuente de decisión en laboratorio.
- Sesgo de dataset: el propio diseño del experimento muestra que el modelo es sensible a la composición del conjunto de entrenamiento (diferencias de accuracy entre 0,68 y 0,73 según la variante), lo que indica dependencia de artefactos del dataset.
- Precisión limitada: la precisión publicada ronda 0,58-0,71, insuficiente para sustituir la validación experimental humana.
- Licencia GPL-3.0 para el ajuste: puede imponer restricciones de copyleft a productos derivados; el modelo base conserva Apache-2.0, pero la combinación debe evaluarse con cuidado para uso comercial.
- Requisitos de hardware elevados: 20,9B parámetros en BF16 exigen GPUs de gama alta o multi-GPU; no hay cuantizaciones publicadas en la información disponible.
- Fecha de creación (2026-10-03) y actualización (2026-11-02): verificar la vigencia y posibles revisiones del repo antes de usarlo en producción.
- Sin datos de benchmarks estándar ni de evaluación independiente; el rendimiento solo está avalado por la ablación del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StarLiu714/GPT-oss-MOFinder-1field-ablation
- Modelo principal MOFinder: https://huggingface.co/StarLiu714/GPT-oss-MOFinder
- Modelo base gpt-oss-20b: https://huggingface.co/openai/gpt-oss-20b
- Repositorio MOFinder (zzhenglab): https://github.com/zzhenglab/MOFinder
- Cita del proyecto MOFinder: https://github.com/zzhenglab/MOFinder/blob/main/CITATION.cff
