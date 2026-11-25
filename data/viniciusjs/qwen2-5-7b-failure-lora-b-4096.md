# ViniciusJS/qwen2.5-7b-failure-lora-b-4096

## Resumen

El modelo `ViniciusJS/qwen2.5-7b-failure-lora-b-4096` es un adaptador LoRA de investigación publicado por ViniciusJS dentro del proyecto Pesquisa_IC_IA. No se trata de un modelo independiente, sino de un conjunto de pesos PEFT que debe cargarse sobre el modelo base `Qwen/Qwen2.5-7B-Instruct` de Alibaba. Su propósito declarado es el ajuste fino para tareas de pregunta-respuesta de opción múltiple sobre sensores industriales y fallos (FailureSensorIQ), complementado con datos financieros de FinQA.

El adaptador se entrenó con QLoRA en cuantización NF4 de 4 bits, rango LoRA 8 y alpha 16, sobre un máximo de 4096 tokens de entrada. El repositorio ocupa aproximadamente 0,1 GB y contiene únicamente los pesos del adaptador (80.792.096 bytes), no el modelo completo. La licencia es Apache-2.0 tanto para el adaptador como para el modelo base.

La relevancia de esta ficha es acotada: se trata de un artefacto de reproducibilidad investigadora con métricas históricas locales (FinQA 0,0232 de precisión numérica; FailureSensorIQ 0,2154 de exactitud de conjunto de etiquetas y 0,5351 de F1 macro por etiqueta) que el propio autor advierte que no han sido reproducidas de forma independiente. No es un modelo listo para producción ni un servicio de inferencia alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | 7B en el modelo base; adaptador de 80.792.096 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de entrada máxima en entrenamiento; el contexto nativo del base no se declara en esta ficha |
| Tipos de cuantizacion | QLoRA NF4 4-bit con doble cuantización y cómputo FP16; carga en 4 bits vía bitsandbytes |
| Idiomas soportados | en, pt (instrucciones y QA principalmente en inglés con envoltorios en portugués) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros. Los módulos objetivo de LoRA son las proyecciones q/k/v/o y gate/up/down, con rango 8, alpha 16 y dropout 0,1. El entrenamiento empleó QLoRA en NF4 de 4 bits con doble cuantización y cómputo en FP16, semilla 42, tres épocas, learning rate 5e-05, microbatch 2 y acumulación de gradiente 16, con 624 pasos registrados. La selección de checkpoint se hizo por pérdida de validación.

Los datos provienen de FinQA y FailureSensorIQ, convertidos a ejemplos de instrucción estilo completion y divididos localmente en 6636/829/831 (train/validación/test). El formato de entrenamiento fue `prompt + ' ' + resposta`, sin plantilla de chat, sin EOS explícito y sin restringir la pérdida a los tokens de respuesta. La revisión exacta del modelo base usada en el entrenamiento histórico no se registró. No se declara innovación arquitectónica alguna más allá del ajuste LoRA.

## Capacidades

- Generación de texto condicionada al adaptador, orientada a respuesta de opción múltiple sobre fallos de sensores industriales.
- Respuesta a preguntas numéricas sobre informes financieros (FinQA), con métrica de coincidencia numérica.
- Clasificación multilabel de fallos (conjunto de etiquetas exacto y F1 macro por etiqueta).
- Soporte de tool calling / function calling: no disponible (no validado; la evaluación con arnés de agentes quedó como `not_scored`).
- Soporte de agentes y razonamiento multi-paso: no disponible (no validado).
- Capacidades multilingües: inglés y portugués declarados, sin competencia bilingüe evaluada según los metadatos.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación reproducible en QA industrial: cargar el adaptador sobre Qwen2.5-7B-Instruct para replicar las métricas históricas de FailureSensorIQ y comparar contra la recomputación multilabel v2 del 14-09-2026.
- Clasificación de fallos en mantenimiento predictivo (prototipo): usar el adaptador para asignar conjuntos de etiquetas de fallo a partir de descripciones de sensores, verificando siempre las salidas contra evidencia antes de cualquier decisión operativa.
- Extracción numérica de informes financieros (experimental): aplicar el adaptador a preguntas de FinQA para estudiar el comportamiento de un LoRA de bajo rango en tareas de coincidencia numérica con tolerancia 0,001.
- Línea base de ablación: servir como referencia "battery B (4096)" frente a otras configuraciones A/B del proyecto, teniendo en cuenta que las comparaciones están confundidas por cambios de batch y learning rate.
- Estudio de formatos de prompt completion: evaluar cómo un adaptador entrenado sin plantilla de chat se comporta al integrarse en pipelines que sí aplican chat template, midiendo la degradación.
- Docencia y experimentación con PEFT: ejemplo práctico de QLoRA NF4 con doble cuantización, rango 8 y objetivos q/k/v/o + gate/up/down para quienes aprenden ajuste eficiente de parámetros.
- Auditoría de licencias de datasets: el repositorio incluye `LICENSE_AUDIT.md` que documenta la discrepancia entre CC-BY-4.0 archivado y Apache-2.0 en el Hub de FailureSensorIQ, útil como caso de estudio de cumplimiento.

## Benchmarks y rendimiento

| Evaluacion | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA, precisión numérica (agregado original) | 0,0232 | 617 |
| FailureSensorIQ, exactitud exacta de conjunto de etiquetas (recomputación multilabel v2) | 0,2154 | 831 |
| FailureSensorIQ, F1 macro por etiqueta (recomputación multilabel v2) | 0,5351 | 831 |

Estos son resultados locales históricos, no reproducidos de forma independiente para esta release. La generación histórica se limitó a 32 tokens nuevos, 4096 de entrada y decodificación greedy. No se aportan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con carga en 4 bits (bitsandbytes) el base de 7B requiere del orden de 5-6 GB solo para pesos, más overhead de activaciones y contexto de 4096 tokens.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una RTX 4090 (24 GB) o A100/H100 son suficientes en 4 bits o FP16.
- Cabe en GPU de consumo: sí, previsiblemente en GPUs de 8-12 GB o superiores en cuantización 4 bits, aunque no se documenta medición concreta.
- Opciones de despliegue: `transformers>=4.57.6` + `peft>=0.19.1` + `accelerate` + `safetensors` + `bitsandbytes`; el repositorio incluye `usage.py` y `USAGE.md` con carga en precisión completa/CPU y ejemplo sintético. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-failure-lora-b-4096 (este) | 7B base + LoRA r=8 | 4096 entrada (entrenamiento) | Adaptador PEFT | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7B | contexto nativo del base | Modelo completo | Apache-2.0 | Hugging Face |
| Otros adaptadores del proyecto Pesquisa_IC_IA (battery A, hybrid) | 7B base + LoRA | variable | Adaptador PEFT | Apache-2.0 | Referenciados en el proyecto |

No se dispone de datos de benchmarks comparables entre estos artefactos en la información proporcionada; el propio autor advierte que las comparaciones A/B están confundidas por cambios de configuración.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar `Qwen/Qwen2.5-7B-Instruct` por separado.
- Métricas históricas locales no reproducidas de forma independiente; no equivalen a resultados de leaderboard.
- FinQA con precisión numérica de 0,0232 indica un rendimiento muy bajo en esa tarea.
- Entrenamiento sin plantilla de chat, sin EOS explícito y sin enmascarar pérdida en tokens de respuesta, lo que puede degradar el comportamiento en uso conversacional.
- La revisión exacta del modelo base usada en entrenamiento no se registró; el ejemplo de `usage.py` usa una revisión posterior de referencia, no la histórica.
- Evaluación con arnés de agentes/Bancada quedó como `not_scored`: no valida uso de herramientas, JSON fiable, análisis financiero abierto ni respuestas largas.
- Riesgo de alucinación no cuantificado; el autor exige verificar salidas contra evidencia antes de cualquier decisión financiera o industrial.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: adaptador y material nuevo bajo Apache-2.0; los datasets subyacentes mantienen sus propios términos (FinQA MIT; FailureSensorIQ con discrepancia CC-BY-4.0/Apache-2.0 documentada en `LICENSE_AUDIT.md`) y no se redistribuyen.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- No se realizaron nuevos entrenamientos, fusiones de pesos ni ejecuciones en GPU de pago para esta publicación.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ViniciusJS/qwen2.5-7b-failure-lora-b-4096
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper FinQA: https://aclanthology.org/2021.emnlp-main.300/
- Repositorio FinQA: https://github.com/czyssrs/FinQA
- Paper FailureSensorIQ: https://arxiv.org/abs/2506.03278
- Repositorio FailureSensorIQ: https://github.com/IBM/FailureSensorIQ
- Informe Qwen2.5: https://arxiv.org/abs/2412.15115
