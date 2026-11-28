# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1320

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1320 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y forma parte de un entrenamiento todavia en curso: se trata de una instantanea en la actualizacion de optimizador 1320 de un total previsto de 1574, no de un modelo final. El checkpoint conserva la torre de vision y la cabeza MTP del modelo base sin tocar; solo se ha entrenado el modelo de lenguaje.

El modelo resuelve el problema de alinear un LLM multimodal de ~4,66 mil millones de parametros frente a peticiones daninas, incluyendo escenarios agénticos con uso de herramientas. Para ello emplea GRPO con recompensas binarias (0/1) emitidas por un juez externo Qwen3.8-27B, sobre un conjunto de prompts denominado "mixture-8" que combina datos de seguridad, codigo, jailbreaks benignos y trayectorias de tool use sinteticas.

Es relevante ahora porque documenta de forma inusualmente transparente la receta completa (framework, hiperparametros, composicion del dataset y curva de recompensa por ventana de entrenamiento), lo que permite reproducir o auditar el proceso de safety tuning. Al ser un checkpoint intermedio, su interes es principalmente de investigacion y evaluacion, no de despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3_5ForConditionalGeneration`), pesos bf16 |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 40960 tokens (usado en entrenamiento) |
| Tipos de cuantizacion | no disponible (repo solo en safetensors bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B-Base, un transformer multimodal con torre de vision y cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos originales del base, de modo que el checkpoint carga exactamente igual que el modelo de partida. Las proyecciones GDN se re-fusionaron durante la exportacion desde Megatron `torch_dist` (`iter_0001319`) mediante `safety_tuning.hf_export`, con mapeo de nombres Slime Qwen3.5 y dtypes alineados con el indice del base.

El entrenamiento usa GRPO con normalizacion de grupo sobre recompensas binarias, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) mas Megatron-LM en bf16. Cada actualizacion procesa 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-06, AdamW betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y una perdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1 y hasta 32768 tokens generados. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El dataset "mixture-8" suma 11794 prompts unicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). 4000 de esos prompts llevan definiciones de herramientas sinteticas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El run se ejecuto en 1x NVIDIA B200 para entrenador y motor de rollout, con el juez en 2x A100 (SGLang TP2) por tunel SSH.

## Capacidades

- Generacion de texto conversacional con plantilla de chat Qwen y modo `enable_thinking=true`.
- Razonamiento con cadena de pensamiento explicita (thinking mode) durante la generacion.
- Procesamiento de imagen y texto (`image-text-to-text`), aunque la torre de vision no se ha entrenado en este checkpoint.
- Uso de herramientas y function calling con el formato `qwen3_coder`, incluyendo trayectorias multiturno contra un simulador.
- Comportamiento agéntico multi-paso en escenarios con definiciones de herramientas sinteticas.
- Generacion y evaluacion de codigo, con foco en seguridad de codigo (dataset codesafetybench).
- Resistencia a jailbreaks y a peticiones daninas, incluyendo consejos delicados (difficult_advice).
- Capacidades multilingues: no disponible.

## Casos de uso

- Evaluacion de safety tuning en investigacion: el checkpoint permite medir como evoluciona la tasa de rechazo y la utilidad a lo largo de las actualizaciones, comparando ventanas de recompensa del juez (por ejemplo, 0.808 en 790-800 frente a 0.844 en 1310-1320) y detectando degradaciones puntuales.
- Filtrado y moderacion de codigo generado: entrenado sobre codesafetybench y magicoder, puede usarse como clasificador generativo de snippets peligrosos en pipelines de revision, con la ventaja de razonar sobre el contexto completo del fichero.
- Simulacion de agentes con herramientas en entornos controlados: los 4000 prompts de AgentAlign con definiciones sinteticas permiten probar politicas de tool use antes de exponer un agente real a APIs externas.
- Generacion de respuestas seguras en asistentes de dominio sensible: el dataset difficult_advice entrena respuestas matizadas ante consultas de salud, finanzas o legal, reduciendo respuestas temerarias.
- Red teaming interno: sirve como modelo de referencia "endurecido" contra el que comparar variantes sin tunear y medir la eficacia de ataques de jailbreak (wildjailbreak_benign).
- Base para posteriores etapas de RL o SFT: al mantener intactos vision y MTP y cargar como el base, puede reanudarse el entrenamiento o aplicarse DPO/RLHF adicional sin rehacer la conversion.
- Prototipado de chat multimodal en local: con 4,66 B de parametros y contexto de 40960 tokens, cabe en una GPU de gama alta consumer y permite iterar en flujos de imagen-texto sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta la recompensa media binaria del juez durante el entrenamiento:

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0.808 | 1200 |
| 830-840 | 0.815 | 1200 |
| 870-880 | 0.855 | 1200 |
| 910-920 | 0.877 | 1200 |
| 950-960 | 0.853 | 1200 |
| 990-1000 | 0.808 | 1200 |
| 1030-1040 | 0.828 | 1200 |
| 1070-1080 | 0.812 | 1200 |
| 1110-1120 | 0.820 | 1200 |
| 1150-1160 | 0.853 | 1200 |
| 1190-1200 | 0.841 | 1200 |
| 1230-1240 | 0.853 | 1200 |
| 1270-1280 | 0.838 | 1200 |
| 1310-1320 | 0.844 | 1200 |

Desglose por dataset en la ultima ventana (1310-1320): agentalign_benign 0.59, agentalign_harmful 0.94, codesafetybench 0.91, difficult_advice 0.94, magicoder 0.84, star1_gp3 1.00, star_benign_v2 0.90, wildjailbreak_benign 0.85. Destaca la volatilidad de magicoder (0.26 en 830-840, 0.84 en 1310-1320) y la caida de agentalign_benign respecto a ventanas anteriores (0.73 en 870-880).

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones; en la practica 12-16 GB con contexto moderado.
- Cuantizacion a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (no se distribuyen ficheros GGUF en el repo, habria que generarlos).
- GPU recomendadas: NVIDIA B200 o H100/A100 para entrenamiento y rollouts; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB, con cuantizacion) y similares.
- Opciones de despliegue: transformers (ruta oficial documentada), vLLM y SGLang para servido de alto rendimiento, llama.cpp/Ollama solo tras conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint | 4,66 B | 40960 | Safety RL (GRPO) sobre Qwen3.5-4B-Base, multimodal | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base multimodal sin alinear | apache-2.0 | Hugging Face |
| Qwen3.8-27B (juez) | no disponible | no disponible | Juez de recompensas binarias usado en el entrenamiento | no disponible | no disponible en la informacion |

No se dispone de datos de benchmarks ni de otros checkpoints de safety tuning comparables en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualizacion 1320 de 1574 previstas): el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Riesgo de alucinacion inherente al modelo base; el RL de seguridad no corrige la veracidad factual.
- La recompensa depende de un juez automatico (Qwen3.8-27B) con veredicto binario estricto, lo que puede introducir sesgos del juez y sobreajuste a su criterio.
- Inestabilidad observada en algunos datasets: magicoder oscila entre 0.26 y 0.84 segun la ventana, y agentalign_benign baja a 0.59 en la ultima ventana, lo que sugiere posible sobre-rechazo o degradacion de utilidad en tareas benignas con herramientas.
- Idiomas soportados no documentados; no se garantiza cobertura multilingue mas alla del base.
- Aunque la licencia es apache-2.0, el uso comercial de un checkpoint intermedio de safety tuning no esta validado por el autor; conviene evaluar antes de produccion.
- La torre de vision no se ha entrenado: las capacidades de imagen son las del base y no han pasado por el proceso de alineacion de seguridad.
- No se distribuyen cuantizaciones (GGUF, AWQ, GPTQ); cualquier despliegue ligero requiere conversion propia.
- El modelo se entreno con contexto de 40960 tokens y hasta 32768 tokens generados; superar esos limites no esta soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1320
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
