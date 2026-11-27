# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1120

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1120 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. No es un modelo final: es una instantanea tomada tras 1120 actualizaciones del optimizador (iteracion Megatron 1119) de un entrenamiento que sigue en curso, dentro de la segunda epoca de una ejecucion con learning rate 1e-6.

El modelo resuelve el problema de alinear un LLM multimodal de 4,66 mil millones de parametros en comportamientos seguros (rechazo de peticiones daninas, uso seguro de herramientas en agentes, seguridad en generacion de codigo) mediante GRPO con recompensas binarias emitidas por un juez Qwen3.8-27B. La receta combina Slime (rollouts con SGLang colocados) y Megatron-LM en bf16, con 15 prompts por actualizacion y 8 rollouts por prompt.

Es relevante ahora porque documenta de forma transparente la evolucion del reward durante el RL sobre un conjunto de prompts especifico ("mixture-8") que mezcla datos de seguridad en agentes, codigo y jailbreak, e incluye el pipeline de exportacion desde Megatron a pesos Hugging Face `Qwen3_5ForConditionalGeneration`. Su licencia Apache 2.0 y su compatibilidad directa con el modelo base lo hacen facil de evaluar como punto de partida o como referencia de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; torre de vision y cabeza MTP intactas del base |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de vision y cabeza MTP (multi-token prediction). Durante el RL solo se entreno el modelo de lenguaje: la torre de vision y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint carga exactamente igual que el modelo base. La exportacion desde Megatron `torch_dist` (`iter_0001119`) se realizo con `safety_tuning.hf_export`, re-fusionando las proyecciones GDN, aplicando el mapeo de nombres de Slime para Qwen3.5, copiando los pesos de vision/MTP del base y ajustando los dtypes al indice del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre 15 prompts x 8 rollouts = 120 secuencias por actualizacion. Hiperparametros: learning rate constante 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y perdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se emplea la plantilla de chat de Qwen con `enable_thinking=true` y, en los rollouts con herramientas, el function calling `qwen3_coder`. El reward lo emite un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una epoca con padding sobre 11.794 prompts unicos = 1.574 actualizaciones, con checkpoints cada 40. Esta instantanea corresponde a la epoca 2 de la ejecucion lr1e-6, reanudada en la actualizacion 787 desde su checkpoint final (modelo, estado del optimizador y RNG) con un nuevo barajado de prompts (semilla 43).

Datos de entrenamiento (mixture-8): star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). 4.000 prompts de AgentAlign llevan definiciones sinteticas de herramientas y se despliegan como trayectorias multiturno de uso de herramientas contra un simulador, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de pensamiento (`enable_thinking=true`).
- Razonamiento multi-step mediante el modo thinking del base.
- Uso de herramientas (tool calling) con el formato de function calling `qwen3_coder`.
- Comportamiento de agente multiturno: rollouts contra simulador de herramientas con trayectorias completas.
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de vision no fue entrenada en este RL.
- Generacion de codigo, con enfasis en codigo seguro (dataset codesafetybench).
- Seguridad alineada: rechazo de peticiones daninas, resistencia a jailbreaks (wildjailbreak), consejo dificil (difficult_advice) y uso benigno de herramientas (agentalign_benign).
- Idiomas soportados: no disponible.

## Casos de uso

- Evaluacion de investigacion en alineacion: sirve como checkpoint intermedio para estudiar la dinamica del reward binario de GRPO a lo largo de las actualizaciones y comparar con el modelo base o con checkpoints posteriores.
- Filtrado de seguridad en pipelines de generacion de codigo: el entrenamiento sobre codesafetybench permite usar el modelo como capa de revision que detecta y reformula sugerencias de codigo inseguras antes de integrarlas en un repositorio.
- Agentes con herramientas en entornos controlados: sus rollouts sobre AgentAlign con definiciones sinteticas de herramientas lo hacen adecuado para probar politicas de uso seguro de APIs en simuladores antes de desplegar agentes reales.
- Moderacion conversacional: puede gestionar conversaciones multiturno con contexto de hasta 40.960 tokens para clasificar o redirigir peticiones potencialmente daninas en un chat de atencion al usuario.
- Investigacion sobre jailbreaks: el entrenamiento con wildjailbreak_benign y difficult_advice permite evaluar la robustez frente a prompts adversarios y medir la tasa de rechazo correcto.
- Base para experimentos de RL posteriores: al cargar exactamente como el modelo base (vision y MTP intactos), se puede reanudar el entrenamiento o aplicar un segundo stage de RL sin reexportar la arquitectura.
- Prototipado multimodal ligero: hereda la entrada image-text-to-text del base, util para demos de descripcion de imagenes con salvaguardas de seguridad, aunque la calidad visual no se ha ajustado en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta la puntuacion media del juez binario durante el entrenamiento (reward crudo antes de la normalizacion por grupo), con 1.200 rollouts juzgados por ventana:

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0,808 | 1.200 |
| 830-840 | 0,815 | 1.200 |
| 870-880 | 0,855 | 1.200 |
| 910-920 | 0,877 | 1.200 |
| 950-960 | 0,853 | 1.200 |
| 990-1000 | 0,808 | 1.200 |
| 1030-1040 | 0,828 | 1.200 |
| 1070-1080 | 0,812 | 1.200 |
| 1110-1120 | 0,820 | 1.200 |

Desglose por dataset (mismas ventanas):

| Dataset | 790-800 | 830-840 | 870-880 | 910-920 | 950-960 | 990-1000 | 1030-1040 | 1070-1080 | 1110-1120 |
|---|---|---|---|---|---|---|---|---|---|
| agentalign_benign | 0,61 | 0,62 | 0,73 | 0,69 | 0,72 | 0,69 | 0,61 | 0,63 | 0,67 |
| agentalign_harmful | 0,90 | 0,95 | 0,96 | 0,93 | 0,90 | 0,91 | 0,92 | 0,88 | 0,89 |
| codesafetybench | 0,85 | 0,93 | 0,93 | 0,83 | 0,95 | 0,96 | 0,94 | 0,90 | 0,93 |
| difficult_advice | 0,81 | 0,88 | 0,86 | 0,88 | 0,83 | 0,84 | 0,91 | 0,79 | 0,89 |
| magicoder | 0,76 | 0,26 | 0,77 | 0,87 | 0,54 | 0,53 | 0,57 | 0,58 | 0,71 |
| star1_gp3 | 0,97 | 0,96 | 0,96 | 0,99 | 0,95 | 0,96 | 0,89 | 0,93 | 1,00 |
| star_benign_v2 | 0,84 | 0,83 | 0,86 | 0,94 | 0,94 | 0,88 | 0,92 | 0,92 | 0,72 |
| wildjailbreak_benign | 0,86 | 0,86 | 0,81 | 0,88 | 0,93 | 0,82 | 0,80 | 0,89 | 0,89 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas KV cache y activaciones; en la practica se recomienda reservar 16-24 GB para contexto largo (hasta 40.960 tokens).
- Cuantizacion: no se publican pesos GGUF ni AWQ/GPTQ en el repo; habria que generarlos a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 o B200 para entrenamiento y evaluacion a gran escala; una RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) y en GPUs de 16 GB con cuantizacion de 8 bits o menor, aunque esta ultima no se distribuye oficialmente.
- Opciones de despliegue: transformers (soporte nativo de `Qwen3_5ForConditionalGeneration`), vLLM y SGLang (usados en el entrenamiento para rollouts), TGI; llama.cpp/Ollama requeririan conversion a GGUF no disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento se ejecuto en 1x NVIDIA B200 (trainer y motor de rollouts) y el juez en 2x A100 con SGLang TP2, lo que da una idea del orden de magnitud del hardware empleado, no del rendimiento de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad sobre Qwen3.5-4B-Base, multimodal | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible | Modelo base multimodal sin alineacion de seguridad especifica | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de ~4 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamano en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso y el reward no es monotono (oscila entre 0,808 y 0,877 en las ventanas reportadas), por lo que el comportamiento puede ser inestable.
- El reward depende de un juez externo (Qwen3.8-27B) con veredicto binario; los sesgos del juez se transfieren al modelo y no se documentan analisis de sesgo propios.
- Riesgo de alucinacion: no se reportan evaluaciones de veracidad ni de factualidad; el RL se centra en seguridad, no en correccion factual.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado mas alla del base.
- La torre de vision y la cabeza MTP no se entrenaron: las capacidades multimodales son las del base sin ajuste de seguridad, lo que puede generar respuestas visuales no alineadas.
- El dataset magicoder muestra una caida marcada en algunas ventanas (0,26 en 830-840, 0,53-0,58 en 950-1040), lo que sugiere inestabilidad en la preservacion de capacidades de codigo durante el RL.
- Uso comercial permitido por Apache 2.0, pero sin garantias del autor; conviene verificar la licencia del modelo base y de los datasets empleados antes de un despliegue en produccion.
- No se publican pesos cuantizados ni evaluaciones de seguridad independientes (red teaming), por lo que no debe usarse como unica barrera de seguridad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1120
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la informacion proporcionada
- Blog o documentacion de Slime: no disponible en la informacion proporcionada
- Repositorio de Megatron-LM: no disponible en la informacion proporcionada
- Demo o space: no disponible en la informacion proporcionada
