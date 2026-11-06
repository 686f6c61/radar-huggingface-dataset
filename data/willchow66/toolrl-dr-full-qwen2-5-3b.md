# willchow66/ToolRL-DR-Full-Qwen2.5-3B

## Resumen

ToolRL-DR-Full-Qwen2.5-3B es un checkpoint de ajuste fino mediante aprendizaje por refuerzo (GRPO) orientado a robustez en el uso de herramientas (tool-use) y function calling. Lo publica el usuario willchow66 en Hugging Face, con entrenamiento atribuido a @HeadyZhang, y se libera junto al articulo *When Simulation Lies: A Sim-to-Real Benchmark and Domain-Randomized RL Recipe for Tool-Use Agents* (NeurIPS 2026 Datasets & Benchmarks), que introduce el benchmark AgentRobustBench.

El modelo parte de Qwen/Qwen2.5-3B-Instruct (3.397.103.616 parametros, arquitectura transformer densa de la familia Qwen2) y aplica la receta publica ToolRL de GRPO cambiando unicamente los datos de entrenamiento: cada muestra limpia se sustituye por una contrapartida aumentada con perturbaciones (domain randomization) de tipo observacion, accion y recompensa. Las perturbaciones de transicion (fallos de herramienta en tiempo de ejecucion) se excluyen del entrenamiento por construccion, de modo que el modelo aprende a tolerar ruido en la observacion y en la accion sin haber visto fallos reales de ejecucion.

Su relevancia es acotada pero especifica: no busca superar en precision limpia al ToolRL original (0.643 frente a 0.638 en AgentRobustBench, dentro del intervalo de confianza), sino reducir la degradacion cuando el entorno introduce ruido. Es un checkpoint de investigacion, con licencia qwen-research y solo idioma ingles, pensado para reproducir y extender el benchmark y la receta de domain-randomized RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2), ajuste fino con GRPO sobre Qwen2.5-3B-Instruct |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la evaluacion usa max model length 8192 |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | other / qwen-research (enlace a la licencia de Qwen2.5-3B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer densa de Qwen2.5-3B-Instruct sin modificaciones estructurales; el cambio es exclusivamente de pesos por ajuste fino con RL. El algoritmo es GRPO siguiendo la receta ToolRL, con recompensa estructurada de formato mas correccion (maximo 4.0). La configuracion de entrenamiento reportada es: batch de entrenamiento 64, PPO mini-batch 32, micro-batch 16 por GPU, tamano de grupo de rollout K=4, longitud maxima de prompt 2048 y de respuesta 1024, learning rate 1e-6, 3 epocas, sobre 2x NVIDIA RTX 6000 Ada (48 GB). El checkpoint liberado corresponde al paso 150 (153 pasos de optimizador, aproximadamente 9 h 19 min).

El conjunto de datos consta de 3.905 muestras de entrenamiento y 79 de validacion, el 100 % perturbadas y distribuidas de forma uniforme entre 4 tipos de perturbacion de observacion, 6 de accion y 6 de recompensa. Los datos derivan del conjunto rlla_4k de ToolRL (ToolACE / Hammer / xLAM) y son disjuntos de las semillas de evaluacion de AgentRobustBench. La innovacion tecnica destacable es el uso de domain randomization sobre las trayectorias de tool-use como sustituto de la simulacion de fallos reales, con la restriccion explicita de no incluir perturbaciones de transicion en el entrenamiento.

## Capacidades

- Generacion de texto conversacional en ingles sobre la base de Qwen2.5-3B-Instruct.
- Uso de herramientas y function calling en el formato de salida de ToolRL (descripciones de herramientas embebidas en el system prompt).
- Tolerancia a perturbaciones en la observacion (ruido en las salidas de herramientas) y en la accion (variaciones en las llamadas generadas).
- Robustez parcial frente a perturbaciones en la senal de recompensa durante el entrenamiento.
- Razonamiento multi-paso dentro de una trayectoria de agente con hasta 1024 tokens de respuesta.
- No se documentan capacidades de vision, audio, thinking mode explicito ni tool calling nativo en formato JSON estandar fuera del formato ToolRL.
- Capacidades multilingues: solo ingles segun la model card.

## Casos de uso

- Evaluacion de robustez de agentes: servir como checkpoint de referencia para medir la degradacion de accuracy bajo perturbaciones de observacion y accion en AgentRobustBench, comparando con el ToolRL original sobre el mismo backbone.
- Investigacion en sim-to-real para tool-use: usar la receta de domain randomization (datos perturbados, transiciones excluidas) como linea base reproducible en experimentos de RL para agentes.
- Prototipado de pipelines de function calling en entornos ruidosos: util cuando las APIs devuelven respuestas malformadas o parciales, ya que el modelo se entrena para mantener el formato ante observaciones corruptas.
- Generacion de datos sinteticos de trayectorias de agente: producir rollouts con llamadas a herramientas para aumentar conjuntos de entrenamiento de modelos mayores.
- Fine-tuning posterior: al ser un checkpoint de 3B en safetensors, sirve como inicializacion para experimentos de RL con GRPO en hardware modesto (dos GPU de 48 GB bastan para reproducir el entrenamiento reportado).
- Analisis de fallos en agentes: estudiar como se degrada la precision segun el tipo de perturbacion (observacion, accion, recompensa, transicion) usando los deltas publicados como referencia.

## Benchmarks y rendimiento

Resultados en AgentRobustBench sobre 199 semillas limpias y sus variantes perturbadas (media ± semiancho del intervalo bootstrap al 95 %). Delta = precision limpia menos precision media en las perturbaciones de ese componente del POMDP (menor es mejor).

| Metrica | Valor |
|---|---|
| Precision limpia | 0.643 ± 0.065 |
| Precision en perturbaciones | 0.463 ± 0.016 |
| Delta observacion | 0.009 ± 0.075 |
| Delta accion | 0.147 ± 0.074 |
| Delta recompensa | 0.331 ± 0.076 |
| Delta transicion | 0.231 ± 0.071 |

Referencia comparativa reportada por el autor: el checkpoint publico ToolRL sobre el mismo backbone (chengq9/ToolRL-Qwen2.5-3B) alcanza 0.638 ± 0.065 de precision limpia. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,8 GB solo para pesos (3.397 millones de parametros), mas overhead de activaciones y cache KV; en la practica, entre 8 y 10 GB con contexto moderado.
- GPU recomendadas: el entrenamiento reportado usa 2x NVIDIA RTX 6000 Ada (48 GB). Para inferencia basta una GPU consumer de gama alta con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090) en bf16 o fp16.
- Cabe en GPU consumer: si, en tarjetas con al menos 8-12 GB de VRAM segun cuantizacion y longitud de contexto.
- Opciones de despliegue: vLLM (usado en la evaluacion oficial con bf16, temperatura 0.0, max 1024 tokens nuevos, max model length 8192), transformers con device_map="auto", y previsiblemente llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision limpia (AgentRobustBench) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToolRL-DR-Full-Qwen2.5-3B | 3.397 M | no disponible (eval. a 8192) | 0.643 ± 0.065 | qwen-research | Hugging Face (willchow66) |
| ToolRL-DR-Mixed-Qwen2.5-3B | 3.397 M (mismo backbone) | no disponible | no disponible en esta ficha | qwen-research | Hugging Face (willchow66) |
| ToolRL-Qwen2.5-3B (chengq9) | 3.397 M (mismo backbone) | no disponible | 0.638 ± 0.065 | qwen-research (heredada) | Hugging Face (chengq9) |
| Qwen2.5-3B-Instruct (base) | 3.397 M | 32.768 tokens (segun Qwen2.5) | no evaluado en AgentRobustBench | qwen-research | Hugging Face (Qwen) |

## Limitaciones y advertencias

- Solo ingles: la model card declara exclusivamente el idioma en, lo que limita su uso en produccion en castellano u otros idiomas.
- Licencia qwen-research: no es una licencia permisiva; conviene revisar el enlace a la licencia de Qwen2.5-3B-Instruct antes de cualquier uso comercial, que puede estar restringido.
- Riesgo de alucinacion heredado de un modelo de 3B: la generacion de llamadas a herramientas inexistentes o con argumentos invalidos sigue siendo posible, especialmente fuera del formato ToolRL.
- La robustez es parcial: el delta en perturbaciones de recompensa (0.331) y de transicion (0.231) es alto, y las transiciones ni siquiera se incluyen en el entrenamiento, por lo que los fallos reales de herramientas siguen degradando el rendimiento.
- La mejora frente al ToolRL original en precision limpia (0.643 frente a 0.638) esta dentro del intervalo de confianza; no debe interpretarse como una ganancia significativa.
- El formato de evaluacion es prompt mode con descripciones de herramientas en el system prompt; el comportamiento puede diferir con otros formatos de tool calling (por ejemplo, JSON nativo de OpenAI).
- Checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- El repositorio ocupa 13,6 GB, coherente con pesos en bf16; no se ofrecen versiones cuantizadas oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/willchow66/ToolRL-DR-Full-Qwen2.5-3B
- Checkpoint hermano: https://huggingface.co/willchow66/ToolRL-DR-Mixed-Qwen2.5-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Repositorio ToolRL: https://github.com/qiancheng0/ToolRL
- Checkpoint ToolRL de referencia: https://huggingface.co/chengq9/ToolRL-Qwen2.5-3B
- Perfil del autor del entrenamiento: https://huggingface.co/HeadyZhang
