# zoria-ai/Zoria

## Resumen

Zoria es un modelo de lenguaje de 31.273 millones de parámetros (31B) desarrollado por zoria-ai, un ajuste fino (finetune) del modelo base google/gemma-4-31B-it. Está especializado en ucraniano y en inglés, y su objetivo es ofrecer un rendimiento de referencia en tareas en ucraniano, incluyendo el modo de razonamiento (reasoning). Se distribuye con licencia Apache 2.0 y pesos en formato FP8 mediante compressed-tensors, pensados para servir con vLLM.

El modelo se presenta como el mejor resultado en el Ukrainian LLM Leaderboard, con un rango medio de 1.41 y la primera posición en 14 de las 17 columnas evaluadas, incluyendo ZNO, MMLU global en ucraniano, TriviaQA, ARC, Winogrande, Belebele, GSM8K, IFEval, SQuAD y XLSum. La ventana de contexto declarada es de 256K tokens. El repositorio ocupa 33,3 GB y el modelo está etiquetado para text-generation, conversational y reasoning.

Su relevancia actual radica en que cubre un hueco poco atendido: modelos abiertos de gran tamano con calidad competitiva en ucraniano, una lengua con menos recursos que el inglés. Al derivar de Gemma 4 31B, hereda la arquitectura y las capacidades del base, sobre las que el ajuste fino incorpora especialización lingüística y de razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de google/gemma-4-31B-it); detalles de atencion no disponibles |
| Parametros totales | 31.273.088.876 (31B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | FP8 (pesos publicados en FP8 via compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | ucraniano (uk), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8); libreria de referencia vLLM |

## Arquitectura y entrenamiento

Zoria es un ajuste fino supervisado del modelo google/gemma-4-31B-it, un transformer decoder-only de 31B parámetros. No se dispone de información detallada en la documentación proporcionada sobre la composición exacta del dataset de ajuste, el número de tokens empleados ni si se aplicaron etapas de RLHF o DPO. El modelo se publica con pesos en FP8 mediante compressed-tensors, un formato orientado a servir con vLLM, lo que reduce el espacio en memoria y acelera la inferencia en GPUs con soporte de FP8.

La model card destaca el modo de razonamiento (reasoning) como una de las capacidades del modelo, y los benchmarks incluyen tareas de matemáticas (GSM8K en ucraniano) e instrucciones (IFEval en ucraniano), lo que sugiere que el ajuste fino se orientó a mejorar el seguimiento de instrucciones y el razonamiento en ucraniano. No se detallan innovaciones arquitectónicas propias más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno en ucraniano e inglés.
- Razonamiento (reasoning) y resolución de problemas, con resultados altos en GSM8K en ucraniano (94,39 exact match).
- Comprensión lectora y question answering, con 71,71 F1 en SQuAD en ucraniano.
- Conocimiento factual y cultural en ucraniano: 89,08 en Global MMLU (uk) y 67,59 en TriviaQA (uk).
- Razonamiento de sentido común y elección múltiple: ARC-Challenge 96,93, ARC-Easy 96,84, Winogrande 88,08, Belebele 95,67.
- Seguimiento de instrucciones: 82,26 de precisión estricta a nivel de prompt en IFEval (uk).
- Traducción en→uk y uk→en: 30,63 BLEU en WMT24++ y 37,09 BLEU en FLORES-200.
- Resumen de textos en ucraniano: 6,82 BLEU en XLSum (uk).
- Capacidades de tool calling y function calling: no disponibles en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponibles explícitamente; el modo reasoning está declarado pero sin detalles.
- Vision y audio: no disponibles.

## Casos de uso

- Atención al cliente en ucraniano: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 256K tokens, lo que permite mantener historiales largos y documentación de referencia en la misma ventana, adecuado para soporte en empresas que operan en Ucrania.
- Generación y revisión de textos administrativos y educativos en ucraniano: con 74,78 en ZNO de lengua y literatura ucranianas y 82,26 en IFEval, es apropiado para redactar, corregir y adaptar textos con instrucciones precisas.
- Tutoría y preparación de exámenes: sus resultados en ZNO (historia 88,45, geografía 97,02, matemáticas 97,83) lo hacen útil para generar preguntas de práctica, explicaciones y material de estudio alineado con el currículo ucraniano.
- Traducción en→uk y uk→en: con 37,09 BLEU en FLORES-200 y 30,63 en WMT24++, puede integrarse en flujos de localización de contenido hacia ucraniano, con revisión humana para dominios especializados.
- Resumen automático de noticias y documentos en ucraniano: aunque el BLEU en XLSum es bajo (6,82), el modelo puede emplearse para resúmenes extractivos y abstractivos con supervisión, especialmente en documentos largos gracias al contexto de 256K.
- Análisis de documentos largos y question answering: con 256K de contexto y 71,71 F1 en SQuAD (uk), es apto para extraer respuestas de contratos, informes o expedientes extensos en ucraniano.
- Asistente de razonamiento y matemáticas: con 94,39 en GSM8K (uk), puede emplearse en herramientas educativas o de cálculo explicado paso a paso en ucraniano.
- Despliegue en producción con vLLM: los pesos FP8 y la integración con vLLM permiten servir el modelo en infraestructura con GPUs compatibles con FP8, reduciendo costes de memoria frente a FP16.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el model-index de la model card. La columna "mejor otra modelo" procede de la tabla comparativa de la propia model card.

| Benchmark | Zoria | Mejor otra modelo |
|---|---:|---:|
| ZNO: historia de Ucrania (accuracy) | 88,45 | 85,11 |
| ZNO: lengua y literatura ucranianas (accuracy) | 74,78 | 68,15 |
| ZNO: geografía (accuracy) | 97,02 | 93,92 |
| ZNO: matemáticas (accuracy) | 97,83 | 97,83 |
| Global MMLU (uk) (accuracy) | 89,08 | 86,64 |
| TriviaQA (uk) (exact match) | 67,59 | 63,11 |
| ARC-Challenge (uk) (accuracy) | 96,93 | 92,49 |
| ARC-Easy (uk) (accuracy) | 96,84 | 92,26 |
| Winogrande (uk) (accuracy) | 88,08 | 84,45 |
| Belebele (ukr_Cyrl) (accuracy) | 95,67 | 95,33 |
| GSM8K (uk) (exact match) | 94,39 | 94,24 |
| IFEval (uk), prompt strict (accuracy) | 82,26 | 81,89 |
| SQuAD (uk) (F1) | 71,71 | 71,69 |
| XLSum (uk) (BLEU) | 6,82 | 3,86 |
| WMT24++ en→uk (BLEU) | 30,63 | 32,98 |
| FLORES-200 en↔uk (BLEU) | 37,09 | no disponible |
| Long FLORES en↔uk (BLEU) | 37,70 | no disponible |

El autor declara un rango medio de 1.41 en el Ukrainian LLM Leaderboard y la primera posición en 14 de 17 columnas. Los resultados están pendientes de confirmación en el leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8 y 31,27B parámetros, el peso del modelo ocupa aproximadamente 31,3 GB, por lo que se necesitan al menos 32 GB de VRAM solo para los pesos, más memoria para KV cache y activaciones. Con contexto de 256K, la KV cache puede ser muy grande y requerir GPUs de 80 GB o configuraciones multi-GPU.
- GPU recomendadas: H100 (80 GB) para FP8 nativo y contexto largo; A100 (80 GB) para FP8 con conversión; múltiples GPUs de 24 GB (RTX 4090) solo con tensor parallelism o cuantizaciones adicionales no publicadas.
- Cabe en consumer GPU: no de forma directa en una única RTX 4090 (24 GB) con los pesos FP8 publicados; requeriría cuantización a 4 bits no disponible en el repositorio o sharding multi-GPU.
- Opciones de despliegue: vLLM es la librería de referencia declarada y compatible con compressed-tensors FP8. Otras opciones como llama.cpp, Ollama o TGI no están confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas concretas de forma rigurosa. La model card incluye una comparación con "la mejor otra modelo" por columna, pero no identifica los modelos. Como referencia estructural, el modelo base google/gemma-4-31B-it comparte tamano (31B) y arquitectura, pero no se dispone de sus resultados en los benchmarks ucranianos citados.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---:|---|---|---|
| Zoria | 31B | 256K | Apache 2.0 | Ucraniano e inglés, reasoning |
| google/gemma-4-31B-it (base) | 31B | no disponible | no disponible | Modelo base multilingüe |
| Alternativas ucranianas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los resultados de benchmarks son declarados por el autor y no están verificados (verified: false); deben tomarse con cautela hasta su confirmación en el Ukrainian LLM Leaderboard.
- El modelo está especializado en ucraniano e inglés; su rendimiento en otros idiomas no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad fuera de los benchmarks citados.
- Sesgos conocidos: no se documentan en la información proporcionada; al derivar de Gemma 4, puede heredar sesgos del modelo base y del corpus de ajuste.
- El BLEU en resumen (XLSum, 6,82) es bajo en términos absolutos, lo que sugiere limitaciones en generación abstractiva de resúmenes.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base google/gemma-4-31B-it, cuyos términos no se detallan en la información disponible.
- El contexto de 256K implica un coste elevado de KV cache; en producción puede ser necesario limitar la longitud efectiva o usar técnicas de compresión de contexto.
- Solo se publican pesos FP8; no hay cuantizaciones GGUF o de 4 bits en el repositorio, lo que limita el despliegue en hardware de consumo.
- El modelo tiene muy pocas descargas (4) y likes (1) en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/zoria-ai/Zoria
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Ukrainian LLM Leaderboard: https://huggingface.co/spaces/lang-uk/ukrainian-llm-leaderboard
- GitHub: https://github.com/zoria-ua
- Telegram: https://t.me/zoria_ai
- App Store (Zoria AI): https://apps.apple.com/lu/app/zoria-ai/id6801105832
- Dataset ZNO: https://huggingface.co/datasets/osyvokon/zno
- Dataset Global-MMLU: https://huggingface.co/datasets/CohereLabs/Global-MMLU
- Dataset TriviaQA (uk): https://huggingface.co/datasets/INSAIT-Institute/trivia_qa_ukr
- Dataset ARC-Challenge (uk): https://huggingface.co/datasets/INSAIT-Institute/arc-challenge_ukr
- Dataset ARC-Easy (uk): https://huggingface.co/datasets/INSAIT-Institute/arc-easy_ukr
- Dataset Winogrande (uk): https://huggingface.co/datasets/INSAIT-Institute/winogrande_ukr
- Dataset Belebele: https://huggingface.co/datasets/facebook/belebele
- Dataset GSM8K (uk): https://huggingface.co/datasets/INSAIT-Institute/gsm8k_ukr
- Dataset IFEval (uk): https://huggingface.co/datasets/INSAIT-Institute/ifeval_ukr
- Dataset SQuAD (uk): https://huggingface.co/datasets/FIdo-AI/ua-squad
- Dataset XLSum: https://huggingface.co/datasets/csebuetnlp/xlsum
- Dataset WMT24++: https://huggingface.co/datasets/google/wmt24pp
- Dataset FLORES-200: https://huggingface.co/datasets/facebook/flores
- Dataset Long FLORES: https://huggingface.co/datasets/robinhad/long_flores
