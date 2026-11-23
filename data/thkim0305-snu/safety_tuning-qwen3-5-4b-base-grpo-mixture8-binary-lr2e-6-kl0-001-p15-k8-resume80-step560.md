# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step560

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step560 es un checkpoint intermedio de ajuste fino por aprendizaje reforzado (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y se publica como snapshot del paso 560 de optimizador (iteracion 559 de Megatron) dentro de un entrenamiento que sigue en curso; no es, por tanto, un modelo final.

El modelo emplea GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el conjunto de prompts "mixture-8" (11.794 prompts unicos). La innovacion principal es el entrenamiento de seguridad que incluye trayectorias multi-turno de uso de herramientas (AgentAlign), con salidas de herramienta enmascaradas en la perdida, y evaluacion mediante un juez Qwen3.8-27B con veredicto binario estricto.

Con 4.659.865.088 parametros totales, licencia Apache 2.0 y pesos en bf16, el checkpoint carga exactamente igual que el modelo base: la torre de vision y la cabeza MTP conservan los pesos originales y solo se entreno el modelo de lenguaje. Es relevante para quienes investigan alineamiento de seguridad en modelos pequenos con RL y tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3_5ForConditionalGeneration), fine-tuning RL sobre Qwen3.5-4B-Base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto de generacion); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de vision y cabeza MTP (multi-token prediction). En este checkpoint solo se entrena el modelo de lenguaje; la torre de vision y la cabeza MTP son los pesos base sin tocar, y las proyecciones GDN se re-fusionan durante la exportacion a Hugging Face. El entrenamiento usa Slime (rollouts SGLang colocados) junto con Megatron-LM en bf16.

El algoritmo es GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado. Cada actualizacion emplea 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 2e-06, AdamW betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. Se aplica una perdida KL de baja varianza contra el modelo congelado con coeficiente 0.001. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa `enable_thinking=true` en la plantilla de chat y, en los rollouts con herramientas, el function calling `qwen3_coder`. El reward lo otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas.

Los datos de "mixture-8" suman 11.794 prompts unicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign llevan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El calendario previsto es una epoca con padding sobre los 11.794 prompts = 787 actualizaciones, con checkpoints cada 40; este snapshot corresponde al paso 560.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-paso orientado a seguridad: rechazo de peticiones daninas, manejo de jailbreaks y consejo dificil.
- Tool calling / function calling mediante el formato `qwen3_coder`, con rollouts multi-turno contra un simulador de herramientas.
- Capacidades de agente: trayectorias con definiciones sinteticas de herramientas y multiples pasos.
- Procesamiento image-text-to-text por herencia del modelo base (torre de vision sin entrenar en este checkpoint).
- Generacion de codigo (entrenado con prompts de Magicoder y CodeSafetyBench).
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion en alineamiento de seguridad: sirve como checkpoint intermedio para estudiar la evolucion del reward del juez a lo largo del entrenamiento GRPO y comparar ventanas de actualizaciones.
- Evaluacion de robustez frente a jailbreaks: los prompts de wildjailbreak_benign y star1_gp3 permiten medir la tasa de rechazo correcto en produccion de filtros previos.
- Agentes con herramientas en entornos controlados: el modelo ha sido entrenado con trayectorias multi-turno y function calling `qwen3_coder`, adecuado para prototipos de agentes que consultan APIs simuladas.
- Generacion de codigo con requisitos de seguridad: los prompts de CodeSafetyBench y Magicoder permiten probar si el modelo evita patrones inseguros en sugerencias de codigo.
- Moderacion y consejo sensible: el conjunto difficult_advice entrena respuestas prudentes ante consultas delicadas, util en asistentes de orientacion con supervision humana.
- Base para experimentos de RL con recompensa binaria: al ser un snapshot intermedio con receta reproducible (Slime + Megatron, hiperparametros documentados), sirve para replicar o continuar el entrenamiento.
- Evaluacion comparativa de jueces: permite analizar la correlacion entre el juez Qwen3.8-27B y metricas humanas en tareas de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta la puntuacion media del reward binario del juez durante el entrenamiento:

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0.839 | 1200 |
| 350-360 | 0.796 | 1199 |
| 390-400 | 0.786 | 1200 |
| 430-440 | 0.729 | 1200 |
| 470-480 | 0.722 | 1200 |
| 510-520 | 0.713 | 1200 |
| 550-560 | 0.802 | 1200 |

Desglose por dataset en la ventana 550-560: agentalign_benign 0.59, agentalign_harmful 0.83, codesafetybench 0.80, difficult_advice 0.85, magicoder 0.60, star1_gp3 0.87, star_benign_v2 0.95 y wildjailbreak_benign 0.88. Se observa una caida del reward entre las ventanas 390-400 y 510-520, con recuperacion parcial en la 550-560.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB.
- En cuantizacion de 8 bits cabria en GPUs consumer de 12-16 GB; en 4 bits, en GPUs de 8-10 GB (no se publican ficheros GGUF en el repositorio).
- GPU recomendadas: NVIDIA B200 (usada en el entrenamiento), A100 y H100 para inferencia de referencia; RTX 4090 y RTX PRO 6000 son viables para inferencia en bf16.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) en bf16 y en tarjetas de 12 GB con cuantizacion.
- Opciones de despliegue: transformers (soporte nativo `Qwen3_5ForConditionalGeneration`), vLLM y SGLang (usado en los rollouts del entrenamiento); compatibilidad con endpoints segun los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (thkim0305-SNU) | 4,66 B | 40.960 en entrenamiento | RL de seguridad GRPO sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (juez usado en el entrenamiento) | 27 B (aprox.) | no disponible | Juez de recompensas | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso y el reward muestra fluctuaciones (de 0.839 a 0.713 y de vuelta a 0.802) que indican inestabilidad.
- Riesgo de alucinacion inherente al modelo base; el ajuste RL de seguridad no elimina errores facticos.
- El reward depende de un juez automatico (Qwen3.8-27B) con veredicto binario; puede haber sesgos del juez no corregidos y sobreajuste a su criterio.
- El modulo de vision y la cabeza MTP no se entrenaron, por lo que sus capacidades multimodales son las del base sin mejorar.
- Idiomas soportados no documentados; no se garantiza comportamiento multilingue.
- Licencia Apache 2.0 permite uso comercial, pero al ser un snapshot de investigacion no se recomienda su despliegue en produccion sin evaluacion adicional.
- No se publican ficheros cuantizados ni benchmarks estandar, lo que dificulta la comparacion objetiva.
- El entrenamiento se realizo con prompts sinteticos y un simulador de herramientas; el comportamiento en herramientas reales puede diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step560
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
