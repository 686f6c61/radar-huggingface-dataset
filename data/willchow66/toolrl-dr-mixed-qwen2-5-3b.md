# willchow66/ToolRL-DR-Mixed-Qwen2.5-3B

## Resumen

ToolRL-DR-Mixed-Qwen2.5-3B es un checkpoint de Qwen2.5-3B-Instruct afinado con aprendizaje por refuerzo (GRPO) para el uso de herramientas y function calling, publicado por willchow66 (entrenado originalmente por @HeadyZhang) junto con el artículo *When Simulation Lies: A Sim-to-Real Benchmark and Domain-Randomized RL Recipe for Tool-Use Agents* (NeurIPS 2026 Datasets & Benchmarks). El modelo aborda un problema concreto: la brecha entre el rendimiento de los agentes de tool-use en entornos limpios de laboratorio y su comportamiento cuando las observaciones, acciones o recompensas del entorno se degradan en producción.

La receta parte del recetario público ToolRL y modifica únicamente los datos de entrenamiento: aproximadamente la mitad de los datos limpios de ToolRL se conserva y la otra mitad se sustituye por muestras aumentadas con perturbaciones de 16 tipos distintos (domain randomization). Las perturbaciones de transición (fallos de ejecución de herramientas en tiempo de ejecución) se excluyen por construcción del entrenamiento. El resultado es un modelo de 3.397 millones de parámetros con contexto de 32.768 tokens en su base, orientado a despliegues de agentes que necesitan tolerar entradas ruidosas sin perder precisión en la llamada de funciones.

Su relevancia actual radica en que cuantifica y mitiga la fragilidad de los agentes de tool-use: en el benchmark AgentRobustBench introducido por el propio artículo, el checkpoint alcanza 0,658 de precisión en semillas limpias, ligeramente por encima del checkpoint público de ToolRL (0,638), y mantiene una precisión media de 0,461 sobre las variantes perturbadas, con una caída de solo 0,049 ante perturbaciones de observación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), basada en Qwen2.5-3B-Instruct |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base; evaluado con max_model_len de 8192 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | ingles (segun la model card) |
| Licencia | qwen-research (license: other, enlazada a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2, inicializado desde Qwen2.5-3B-Instruct. Sobre esa base se aplica el recetario GRPO de ToolRL con una recompensa estructurada de formato más corrección (máximo 4,0). La innovación no está en la arquitectura sino en los datos: 4.000 muestras de entrenamiento (2.006 limpias y 1.994 perturbadas, extraídas uniformemente de 16 tipos de perturbación), derivadas del conjunto `rlla_4k` de ToolRL (ToolACE / Hammer / xLAM) y disjuntas de las semillas de evaluación de AgentRobustBench, más las mismas 79 muestras de validación. Las perturbaciones de transición (fallos en tiempo de ejecución de la herramienta) se excluyen explícitamente del entrenamiento para no contaminar la señal.

La configuración de entrenamiento usa batch de 64, PPO mini-batch de 32, micro-batch de 16 por GPU, tamaño de grupo de rollout K=4, longitud máxima de prompt de 2048 y de respuesta de 1024, learning rate de 1e-6 y 3 épocas. El checkpoint publicado corresponde al paso 155 (156 pasos de optimizador, ~9 h 14 min) sobre 2x NVIDIA RTX 6000 Ada de 48 GB. La evaluación se realizó en modo prompt (descripciones de herramientas embebidas en el system prompt, formato de salida ToolRL) con vLLM, bf16, temperatura 0,0, máximo 1024 tokens nuevos y longitud máxima de modelo 8192.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Tool calling y function calling en el formato estructurado de ToolRL (descripciones de herramientas en el system prompt).
- Robustez ante perturbaciones de observación (entradas ruidosas o alteradas), de acción y de recompensa, gracias al entrenamiento con domain randomization.
- Razonamiento multi-paso orientado a agentes: selección de herramienta, construcción de argumentos y encadenamiento de llamadas.
- Tolerancia a entornos simulados imperfectos, pensada para el trasvase sim-to-real de agentes.
- No se documentan capacidades de visión, audio, thinking mode extendido ni matemáticas avanzadas específicas más allá de las heredadas del modelo base.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.

## Casos de uso

- Agentes de atención al cliente con integración de herramientas: el modelo puede decidir qué función invocar (consulta de pedidos, gestión de tickets) tolerando descripciones de herramientas ligeramente alteradas o entradas de usuario ruidosas, gracias al entrenamiento con perturbaciones de observación.
- Orquestación de pipelines internos con APIs inestables: en escenarios donde los esquemas de las herramientas cambian o llegan campos malformados, el modelo mantiene una precisión media de 0,461 en variantes perturbadas, lo que reduce la tasa de fallo en cascada frente a un agente entrenado solo con datos limpios.
- Evaluación y benchmarking de robustez de agentes: sirve como referencia para medir la brecha sim-to-real en AgentRobustBench y comparar recetas de RL para tool-use.
- Asistentes de desarrollo que consultan documentación o ejecutan comandos: el soporte de function calling estructurado permite integrarlo en flujos de CI/CD o asistentes de IDE que necesitan invocar herramientas con argumentos validables.
- Prototipado rápido de agentes en hardware de gama media: con 3.400 millones de parámetros en bf16 ocupa unos 6,8 GB, por lo que cabe en GPUs de consumo de 12-16 GB y permite iterar sin clúster dedicado.
- Investigación en aprendizaje por refuerzo para agentes: la receta reproducible (GRPO sobre ToolRL con datos mixtos) y el checkpoint intermedio (paso 155) facilitan experimentos de ablación sobre tipos de perturbación y composición de datos.
- Automatización de back-office con herramientas de negocio (CRM, ERP): el modelo puede encadenar varias llamadas en un mismo turno manteniendo el formato estructurado exigido por el orquestador.

## Benchmarks y rendimiento

Resultados sobre AgentRobustBench (199 semillas limpias y sus variantes perturbadas; media ± semiancho del intervalo de confianza bootstrap al 95%). Δ = precisión limpia menos precisión media en las perturbaciones de ese componente del POMDP (menor es mejor).

| Modelo | Clean ↑ | Pert. Acc. ↑ | Δ_Obs ↓ | Δ_Act ↓ | Δ_Rew ↓ | Δ_Trn ↓ |
|---|---|---|---|---|---|---|
| ToolRL-DR-Mixed-Qwen2.5-3B | 0,658 ± 0,065 | 0,461 ± 0,017 | 0,049 ± 0,075 | 0,152 ± 0,075 | 0,364 ± 0,074 | 0,232 ± 0,072 |
| ToolRL-Qwen2.5-3B (referencia pública) | 0,638 ± 0,065 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada en bf16: ~6,8 GB solo para pesos; con caché KV para 8.192 tokens de contexto y overhead de runtime, prever 10-12 GB.
- VRAM estimada en cuantización de 8 bits: ~3,5-4 GB de pesos; en 4 bits, ~2 GB de pesos (no se publican pesos cuantizados oficiales).
- GPU recomendadas para producción: NVIDIA A100, H100 o L40S para servir con vLLM a concurrencia media; el entrenamiento original usó 2x RTX 6000 Ada de 48 GB.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con holgura en bf16; en RTX 4070 Ti / 4080 (12-16 GB) requiere cuantización o contextos reducidos.
- Opciones de despliegue: vLLM (configuración usada en la evaluación oficial), transformers con `device_map="auto"`, TGI (tag `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la información proporcionada; la evaluación se hizo con temperatura 0,0 y máximo 1024 tokens nuevos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool-use RL | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolRL-DR-Mixed-Qwen2.5-3B | 3,4 B | 32.768 (evaluado a 8.192) | Sí, GRPO con domain randomization | qwen-research | HuggingFace (willchow66) |
| ToolRL-Qwen2.5-3B (`chengq9`) | 3,4 B | 32.768 | Sí, GRPO con datos limpios | qwen-research | HuggingFace |
| Qwen2.5-3B-Instruct (base) | 3,4 B | 32.768 | No específico (tool calling nativo) | qwen-research | HuggingFace, Ollama, vLLM |
| ToolRL-DR-Full-Qwen2.5-3B (hermano) | 3,4 B | 32.768 | Sí, variante de la misma receta | qwen-research | HuggingFace (willchow66) |

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en inglés; el rendimiento en castellano u otros idiomas no está caracterizado y probablemente degrade el formato estructurado de llamadas.
- La caída ante perturbaciones de recompensa (Δ_Rew = 0,364) y de transición (Δ_Trn = 0,232) sigue siendo notable: el modelo tolera mejor el ruido de observación que los fallos de ejecución de herramientas, que se excluyeron del entrenamiento por diseño.
- Riesgo de alucinación inherente a un modelo de 3.400 millones de parámetros: puede inventar nombres de herramientas, argumentos o valores de retorno, especialmente con descripciones ambiguas.
- Licencia qwen-research: restricciones para uso comercial; es necesario revisar los términos de Qwen2.5-3B-Instruct antes de desplegar en producción.
- El checkpoint corresponde al paso 155 de una receta concreta; no se documentan curvas de entrenamiento ni variantes con más pasos.
- Sin datos publicados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni de latencia/throughput, lo que dificulta comparaciones fuera del benchmark propio del artículo.
- El formato de salida esperado es el de ToolRL (herramientas en el system prompt); usarlo con otros formatos de tool calling (por ejemplo, JSON schema nativo de OpenAI) puede degradar la precisión.
- Riesgo de sesgos heredados del corpus de entrenamiento (ToolACE, Hammer, xLAM) y del modelo base, no evaluados en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willchow66/ToolRL-DR-Mixed-Qwen2.5-3B
- Checkpoint hermano: https://huggingface.co/willchow66/ToolRL-DR-Full-Qwen2.5-3B
- Checkpoint de referencia ToolRL: https://huggingface.co/chengq9/ToolRL-Qwen2.5-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio ToolRL: https://github.com/qiancheng0/ToolRL
- Perfil del entrenador: https://huggingface.co/HeadyZhang
