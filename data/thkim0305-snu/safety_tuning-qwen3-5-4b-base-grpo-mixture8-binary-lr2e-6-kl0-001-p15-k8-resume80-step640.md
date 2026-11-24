# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step640

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step640 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`). Lo desarrolla el usuario thkim0305-SNU y se publica como snapshot del paso 640 de optimizador (iteracion 639 de Megatron) dentro de un entrenamiento que sigue en curso: no es un modelo final. Su interes es metodologico, ya que documenta de forma granular la receta de RL (GRPO con recompensas binarias y juez externo) aplicada a un modelo base multimodal de 4B.

El modelo conserva la arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`, con torre de vision y cabeza MTP), pero solo se ha entrenado el modelo de lenguaje; los pesos de vision y MTP son los originales del base. El entrenamiento usa 15 prompts por actualizacion y 8 rollouts por prompt (120 secuencias), con contexto de 40960 tokens y hasta 32768 tokens generados, plantilla de chat de Qwen con `enable_thinking=true` y function calling `qwen3_coder`.

El conjunto de datos, denominado "mixture-8", combina prompts de seguridad, uso de herramientas y codigo (AgentAlign, WildJailbreak, CodeSafetyBench, StarCoder/GP3, Magicoder, etc.), con 11794 prompts unicos. La relevancia practica es limitada por su caracter de checkpoint intermedio, pero resulta util para investigacion en alineamiento de seguridad, evaluacion de trayectorias agente y reproduccion de recetas GRPO a escala 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de vision y cabeza MTP (no entrenadas) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40960 tokens (contexto de entrenamiento/rollout) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y mantiene la clase `Qwen3_5ForConditionalGeneration`, que incluye torre de vision y cabeza MTP. Solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos originales del base, por lo que el checkpoint carga exactamente igual que el modelo base. La exportacion desde Megatron torch_dist (`iter_0000639`) se realizo con `safety_tuning.hf_export`, refusionando las proyecciones GDN, aplicando el mapeo de nombres de Slime para Qwen3.5, copiando los pesos de vision/MTP del base y ajustando dtypes al indice del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualizacion emplea 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 2e-06, AdamW betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y una perdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado. El muestreo usa temperatura 1.0, top-p 1, hasta 32768 tokens generados y contexto de 40960; la plantilla de chat de Qwen se aplica con `enable_thinking=true` y los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El schedule cubre una epoca con padding sobre 11794 prompts unicos (787 actualizaciones), con checkpoints cada 40 actualizaciones. El run se ejecuto en 1x NVIDIA B200 para entrenador y motor de rollout, con el juez Qwen3.8-27B en 2x A100 (SGLang TP2) por tunel SSH, reanudando en la actualizacion 280 desde un run previo en 3x RTX PRO 6000.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-paso y cadenas de pensamiento, entrenado explicitamente con thinking activado.
- Function calling / tool calling mediante el formato `qwen3_coder`, con rollouts multi-turno contra un simulador de herramientas.
- Capacidades de agente: el dataset AgentAlign incluye 4000 prompts con definiciones sinteticas de herramientas, con salidas de herramientas enmascaradas en la perdida.
- Capacidades multimodales heredadas del base (torre de vision intacta), aunque no se entrenaron.
- Comportamiento orientado a seguridad: rechazo de contenido danino, manejo de jailbreaks benignos y seguridad en codigo, segun el juez binario.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento de seguridad: sirve como checkpoint intermedio reproducible para estudiar la evolucion del reward binario del juez a lo largo de las actualizaciones (310-640) y comparar con el modelo base.
- Evaluacion de agentes con herramientas: los 4000 prompts de AgentAlign con definiciones sinteticas permiten probar trayectorias multi-turno y function calling en un entorno simulado, util para validar pipelines de agentes antes de produccion.
- Moderacion y filtrado de codigo: el entrenamiento sobre CodeSafetyBench y Magicoder lo hace adecuado para experimentar con deteccion de codigo inseguro o malicioso en asistentes de programacion.
- Robustez frente a jailbreaks: el uso de WildJailbreak benigno y Star benign v2 permite evaluar la tasa de falsos rechazos en prompts benignos que imitan ataques.
- Asistencia con razonamiento explicito: el modo thinking y el contexto de 40960 tokens permiten tareas de analisis de documentos largos con trazas de razonamiento auditables.
- Base para RL posterior: al ser un snapshot intermedio con receta documentada, sirve como punto de partida para reanudar o comparar entrenamientos GRPO con distintas configuraciones (KL, learning rate, tamano de grupo).
- Prototipado de asistentes multimodales: la torre de vision intacta permite probar entradas imagen-texto aunque la calidad de la parte visual no se haya ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta la puntuacion media del juez binario durante el entrenamiento (reward crudo antes de normalizacion por grupo):

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0.839 | 1200 |
| 350-360 | 0.796 | 1199 |
| 390-400 | 0.786 | 1200 |
| 430-440 | 0.729 | 1200 |
| 470-480 | 0.722 | 1200 |
| 510-520 | 0.713 | 1200 |
| 550-560 | 0.802 | 1200 |
| 590-600 | 0.778 | 1200 |
| 630-640 | 0.745 | 1199 |

Desglose por dataset en la ventana 630-640: agentalign_benign 0.39, agentalign_harmful 0.85, codesafetybench 0.97, difficult_advice 0.81, magicoder 0.70, star1_gp3 0.92, star_benign_v2 0.88, wildjailbreak_benign 0.80.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas activaciones y cache KV; en la practica se recomienda al menos 16-24 GB para contexto moderado.
- Cuantizacion: no se publican pesos cuantizados; seria necesario generarlos (GGUF/AWQ/GPTQ) a partir de los safetensors bf16.
- GPU recomendadas: el autor entreno con 1x NVIDIA B200 y 2x A100 (juez); para inferencia, A100 40/80 GB, H100 o L40S son adecuadas.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto reducido; en RTX 3090/4080 (16 GB) requeriria cuantizacion a 8 bits o inferior.
- Opciones de despliegue: transformers (soporte nativo de `Qwen3_5ForConditionalGeneration`), vLLM y TGI si el soporte de la arquitectura Qwen3.5 esta disponible; llama.cpp/Ollama requeririan conversion a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | 40960 | Apache 2.0 | Checkpoint intermedio, sin benchmarks publicos |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache 2.0 | Modelo base de referencia, sin ajuste de seguridad |
| Alternativas de seguridad de 4B (p. ej. Llama Guard, ShieldGemma) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion cuantitativa con alternativas no esta disponible: no se han publicado benchmarks estandar ni datos de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 640 de 787 actualizaciones previstas); el entrenamiento sigue en curso y no representa el modelo final.
- El reward del juez muestra alta varianza y una tendencia no monotona: cae de 0.839 a 0.713 entre las ventanas 310-320 y 510-520, y el rendimiento en agentalign_benign baja a 0.39 en la ventana 630-640, lo que sugiere inestabilidad y posible sobreajuste al juez.
- Riesgo de alucinacion y de falsos rechazos: el entrenamiento con recompensas binarias estrictas puede aumentar la tasa de rechazo en prompts benignos (wildjailbreak_benign y star_benign_v2 se usan precisamente para mitigarlo).
- Sesgos conocidos: no documentados por el autor; el juez Qwen3.8-27B introduce sus propios sesgos en la senal de recompensa.
- Idiomas soportados no especificados; el comportamiento multilingue no esta garantizado.
- La torre de vision y la cabeza MTP no se entrenaron: las capacidades multimodales son las del base y no han sido optimizadas para seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion de seguridad independiente, no se recomienda su despliegue en produccion sin auditoria adicional.
- El modelo se entreno con rollouts de hasta 32768 tokens generados y contexto de 40960; contextos mayores no estan soportados segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step640
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la informacion proporcionada
- Repositorio de Slime: no disponible en la informacion proporcionada
- Repositorio de Megatron-LM: no disponible en la informacion proporcionada
- Demos o blogs adicionales: no disponibles en la informacion proporcionada
