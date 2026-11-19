# wenyii/cdmt-qwen2.5-3b

## Resumen
CDMT Qwen2.5-3B es una colección de checkpoints terminales publicada por el usuario wenyii en Hugging Face, derivada del modelo base Qwen2.5-3B-Instruct de Alibaba. No se trata de un modelo único, sino de un repositorio que agrupa 46 ejecuciones de entrenamiento independientes orientadas al uso de herramientas en múltiples turnos (tool use multi-turno), concretamente con un intérprete de Python en sandbox y con recuperación de información (retrieval). El objetivo es estudiar y comparar cómo distintas estrategias de post-entrenamiento afectan a la competencia de un modelo pequeño para encadenar llamadas a herramientas.

Cada subcarpeta del repositorio corresponde a una ejecución identificada con el patrón `qwen2.5-3b-{source}-{method}-s{seed}`, donde `source` indica el dominio de entrenamiento (code, math, search, mix), `method` la técnica aplicada (SFT, GRPO u OPD) y `seed` la semilla. El modelo base es un transformer denso de 3.000 millones de parámetros con una ventana de contexto de 32.768 tokens, según las especificaciones públicas de Qwen2.5-3B-Instruct. La relevancia actual reside en que ofrece un conjunto controlado y reproducible para investigar el post-entrenamiento de agentes con herramientas en modelos de tamano reducido, un área donde escasean los artefactos públicos con múltiples semillas y métodos comparables.

El repositorio tiene un tamano de 283,9 GB, coherente con almacenar decenas de checkpoints completos en bf16. La licencia es Apache 2.0, heredada del modelo base, lo que facilita su reutilización tanto en investigación como en desarrollo comercial. No obstante, la model card es escasa en detalles sobre datos, evaluación y rendimiento, por lo que buena parte de las especificaciones de esta ficha se apoyan en las características conocidas del modelo base Qwen2.5-3B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2.5), con RoPE, SwiGLU y RMSNorm; atención con GQA |
| Parametros totales | 3.090 millones (modelo base Qwen2.5-3B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | Pesos publicados en bf16 safetensors; cuantizaciones GGUF/AWQ/GPTQ no disponibles en el repositorio |
| Idiomas soportados | no disponible en la model card; el modelo base Qwen2.5 soporta oficialmente ingles y chino, con multilingue parcial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con tokenizer y chat template por subcarpeta |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-3B-Instruct: un transformer decoder-only denso con atención de consultas agrupadas (GQA), normalización RMSNorm pre-norm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El repositorio no modifica la arquitectura; cada checkpoint es un ajuste fino completo del modelo base para tareas de tool use multi-turno con Python en sandbox y recuperación.

El proceso de post-entrenamiento se documenta con tres métodos. El SFT se ejecuta durante 1.250 pasos con learning rate 1e-6, scheduler coseno y un 3 % de warmup. GRPO y OPD se entrenan durante 250 pasos, con 40 prompts y 8 rollouts por ronda, también a learning rate 1e-6. El profesor empleado tanto para SFT como para la destilación on-policy (OPD) es Qwen2.5-72B-Instruct. La matriz experimental cubre 36 ejecuciones base (4 dominios × 3 métodos × 3 semillas) más 10 ejecuciones adicionales con semillas 44 y 55 para code-sft, code-opd, math-sft, math-grpo y search-sft, sumando 46 checkpoints. El archivo `checkpoints.json` mapea cada subcarpeta con su etiqueta de evaluación. No se detalla en la model card el volumen de tokens de entrenamiento ni la composición exacta de los datasets.

## Capacidades
- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-3B-Instruct.
- Uso de herramientas (tool calling / function calling) en entornos de múltiples turnos, con foco en ejecución de Python en sandbox y recuperación de información.
- Razonamiento multi-paso orientado a agentes: planificación de llamadas sucesivas a herramientas y uso de sus resultados.
- Razonamiento matemático y generación de código, reforzados en las variantes entrenadas con dominios `math` y `code`.
- Destilación de comportamiento desde un profesor de 72B (variantes OPD), que busca imitar trayectorias de tool use del modelo grande.
- Capacidades multilingües: no documentadas específicamente para estos checkpoints; dependen del modelo base.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking) en la model card.

## Casos de uso
- Investigación sobre post-entrenamiento de agentes: comparar SFT, GRPO y OPD con múltiples semillas sobre el mismo modelo base para medir varianza y robustez de cada método en tareas de tool use.
- Evaluación reproducible de agentes pequeños: usar `checkpoints.json` para emparejar cada checkpoint con su etiqueta de evaluación y reproducir experimentos de ablación sobre dominio (code, math, search, mix) y método.
- Agente de análisis de datos con Python: desplegar una variante `code-sft` o `code-opd` como agente que genera y ejecuta código Python en sandbox para responder preguntas sobre datos tabulares, aprovechando el entrenamiento específico en ejecución de código multi-turno.
- Asistente con recuperación aumentada (RAG): emplear las variantes `search-*` para construir un agente que formule consultas de recuperación, lea los resultados y encadene varias búsquedas antes de responder.
- Tutor de matemáticas con verificación por herramientas: usar las variantes `math-*` para resolver problemas paso a paso y validar cálculos ejecutando código en lugar de fiarse solo de la generación.
- Destilación de profesores grandes a estudiantes pequeños: reutilizar el pipeline OPD documentado (profesor Qwen2.5-72B-Instruct, 250 pasos, 40 prompts × 8 rollouts) como receta para trasladar capacidades de tool use a modelos de 3B.
- Base para ajuste fino propio en dominio específico: partir de un checkpoint con tool use ya adquirido y aplicar SFT adicional sobre las herramientas internas de una organización, reduciendo el coste frente a entrenar desde el modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona etiquetas de evaluación asociadas a cada checkpoint en `checkpoints.json`, pero no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de tool use.

## Requisitos de hardware
- VRAM en bf16: aproximadamente 6,2 GB solo para pesos (3.090 M × 2 bytes); con caché KV y overhead de runtime, entre 8 y 12 GB para contextos moderados. Con contexto completo de 32.768 tokens la caché KV crece de forma significativa y puede requerir 16 GB o más.
- VRAM en cuantización de 8 bits: en torno a 3,5-4 GB de pesos; en 4 bits, en torno a 2 GB de pesos. Estas cuantizaciones no están publicadas en el repositorio y habría que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación por lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto amplio; GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB) viables con cuantización.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 12-16 GB o más para contextos moderados, y en tarjetas de 8 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (carga por `subfolder`, tal como documenta el autor), vLLM y TGI para servido con throughput alto, llama.cpp u Ollama previa conversión a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool use multi-turno | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CDMT Qwen2.5-3B (este) | 3,09 B | 32.768 | Entrenado explícitamente (SFT/GRPO/OPD, 46 checkpoints) | Apache 2.0 | Hugging Face (wenyii/cdmt-qwen2.5-3b) |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Soporte básico de function calling | Apache 2.0 | Hugging Face (Qwen/Qwen2.5-3B-Instruct) |
| Qwen2.5-7B-Instruct | 7,62 B | 131.072 | Soporte de function calling | Apache 2.0 | Hugging Face (Qwen/Qwen2.5-7B-Instruct) |
| Llama 3.2 3B Instruct | 3,21 B | 131.072 | Soporte de tool calling | Llama 3.2 Community License | Hugging Face (meta-llama/Llama-3.2-3B-Instruct) |

Los datos de los modelos comparativos corresponden a sus especificaciones públicas; no se dispone de comparaciones de rendimiento frente a este repositorio porque el autor no publica cifras de benchmarks.

## Limitaciones y advertencias
- Model card muy escasa: no documenta composición de datos, volumen de tokens, métricas de evaluación ni resultados de seguridad, lo que dificulta valorar la calidad real de los checkpoints.
- Riesgo de alucinación: inherente a un modelo de 3B; en tareas de tool use puede inventar nombres de herramientas, argumentos o resultados de ejecución si no se valida la salida.
- Entrenamiento acotado a dos herramientas (Python en sandbox y retrieval): el comportamiento puede no generalizar a otras APIs o esquemas de function calling.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen2.5-3B-Instruct y los de los datos de entrenamiento no publicados.
- Idiomas: la model card no especifica cobertura; el modelo base está optimizado para inglés y chino, con rendimiento inferior en castellano.
- Contexto: la ventana de 32.768 tokens es la del modelo base; no se documenta si el entrenamiento con tool use preserva el rendimiento en contextos largos.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene revisar las condiciones del modelo base y de los datos de destilación del profesor Qwen2.5-72B-Instruct.
- Tamano del repositorio (283,9 GB): la descarga completa es costosa; conviene usar `subfolder` para obtener solo el checkpoint necesario.
- Cero descargas y cero likes en el momento de la consulta: ausencia de validación por parte de la comunidad.
- Los checkpoints son terminales y no incluyen estados intermedios, lo que limita el análisis de curvas de entrenamiento.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/wenyii/cdmt-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Profesor usado en SFT/OPD: https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Documentación de Qwen2.5 (blog oficial de Qwen): https://qwenlm.github.io/blog/qwen2.5/
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
