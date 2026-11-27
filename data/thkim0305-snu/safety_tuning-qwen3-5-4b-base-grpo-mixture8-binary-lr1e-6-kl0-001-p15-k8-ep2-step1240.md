# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1240

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1240 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, obtenido a partir de Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y no representa un modelo final, sino una instantanea del entrenamiento tras 1240 actualizaciones de optimizador (iteracion Megatron 1239) sobre un conjunto de prompts denominado "mixture-8". El entrenamiento seguia en curso en el momento de la exportacion (27 de noviembre de 2026).

El modelo conserva la arquitectura completa del base Qwen3.5-4B (clase `Qwen3_5ForConditionalGeneration`, con torre de vision y cabeza MTP intactas, ya que solo se entreno el modelo de lenguaje) y se distribuye en bf16 con pesos en safetensors. Su interes radica en que documenta de forma transparente una receta de RL para alineamiento de seguridad usando GRPO con recompensas binarias evaluadas por un juez (Qwen3.8-27B), incluyendo rollouts multi-turno con uso de herramientas sobre prompts sinteticos de AgentAlign.

Con 4.659.865.088 parametros y licencia Apache 2.0, es relevante para investigadores que quieran reproducir o analizar tecnicas de safety tuning con GRPO, asi como para quienes necesiten un punto de partida experimental sobre la familia Qwen3.5. No obstante, al ser un checkpoint intermedio sin evaluacion publicada en benchmarks estandar, no deberia tratarse como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (Qwen3.5); solo se entreno el modelo de lenguaje, torre de vision y cabeza MTP sin tocar |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto usado en el entrenamiento); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal de la familia Qwen3.5 con capacidad image-text-to-text. El checkpoint exportado mantiene la torre de vision y la cabeza MTP con los pesos originales del base; unicamente se actualizaron los pesos del modelo de lenguaje durante el RL. La exportacion se realizo desde un checkpoint Megatron `torch_dist` (`iter_0001239`) mediante la herramienta `safety_tuning.hf_export`, con refusion de las proyecciones GDN, mapeo de nombres de Slime para Qwen3.5 y copia de los pesos de vision/MTP del base.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0.2 y TIS activado. El framework es Slime (rollouts con SGLang en modo colocado) junto con Megatron-LM en bf16. Por cada actualizacion se generan 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. Se aplica una perdida KL de baja varianza contra el modelo inicial con coeficiente 0.001. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; los prompts de AgentAlign se evaluan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una epoca con padding sobre 11.794 prompts unicos (1.574 actualizaciones), con checkpoints cada 40 actualizaciones. Esta instantanea corresponde a la epoca 2 del run lr1e-6, reanudada en la actualizacion 787 desde su checkpoint final con un nuevo barajado de prompts (semilla 43).

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo "thinking" activable mediante la plantilla de chat de Qwen (`enable_thinking=true`).
- Capacidad multimodal image-text-to-text heredada del base (torre de vision intacta), aunque no fue entrenada en este ajuste.
- Uso de herramientas y function calling: los rollouts de entrenamiento emplean el formato `qwen3_coder` para function calling.
- Razonamiento multi-paso y comportamiento agentico: entrenado explicitamente sobre trayectorias multi-turno con herramientas sinteticas (AgentAlign).
- Alineamiento de seguridad: rechazo de peticiones daninas, manejo de jailbreaks benignos y consejo responsable ante consultas dificiles.
- Generacion de codigo seguro: entrenado sobre CodesafetyBench y Magicoder para producir codigo funcional con consideraciones de seguridad.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en safety tuning: usar el checkpoint como referencia intermedia para estudiar la evolucion de las recompensas del juez a lo largo del entrenamiento GRPO y comparar con otros checkpoints del mismo run.
- Evaluacion de robustez frente a jailbreaks: probar el modelo con prompts de WildJailbreak y variantes adversariales para medir la tasa de rechazo frente al base sin ajustar.
- Analisis de comportamiento agentico seguro: desplegar el modelo en entornos simulados con definiciones de herramientas y observar si respeta restricciones de seguridad en trayectorias multi-turno, aprovechando su entrenamiento especifico en AgentAlign.
- Generacion de codigo con conciencia de seguridad: integrarlo en un pipeline de revision donde se comparen sus salidas con las del base para detectar practicas inseguras en codigo generado (CodesafetyBench, Magicoder).
- Ajuste de asistentes de consejo responsable: evaluar como responde ante consultas sensibles o de consejo dificil, y usar sus respuestas como datos de comparacion para tecnicas de alineamiento.
- Baseline para ablaciones de hiperparametros: al conocer la receta exacta (lr, KL, tamano de grupo, mezcla de datos), sirve como punto de control para reproducir el entrenamiento y medir el efecto de variaciones en GRPO.
- Prototipado de pipelines de RLHF/RLVR: usar el modelo y su receta como plantilla para montar un ciclo de rollouts con SGLang y entrenamiento con Megatron-LM en entornos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta la recompensa media binaria del juez durante el entrenamiento, por ventana de actualizaciones y por dataset:

| Ventana (updates) | Recompensa media | Rollouts evaluados |
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

Desglose por dataset en la ultima ventana (1230-1240): agentalign_benign 0.72, agentalign_harmful 0.89, codesafetybench 0.84, difficult_advice 0.90, magicoder 0.65, star1_gp3 0.97, star_benign_v2 0.83, wildjailbreak_benign 0.93. Se observa una alta volatilidad en magicoder (0.26-0.87 a lo largo del entrenamiento) y en agentalign_benign (0.61-0.73).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; en la practica se recomienda un minimo de 12-16 GB para secuencias cortas y bastante mas para contextos de 40.960 tokens.
- Cuantizacion: la model card no publica variantes GGUF ni cuantizadas; seria necesario generarlas a partir de los safetensors bf16. Con cuantizacion de 8 bits cabria en GPUs de 8-12 GB; con 4 bits, en GPUs de 6-8 GB (estimacion orientativa, no verificada en la informacion proporcionada).
- GPU recomendadas: el entrenamiento se realizo en 1x NVIDIA B200 (trainer y motor de rollouts) y el juez en 2x A100 con SGLang TP2. Para inferencia, una RTX 4090 (24 GB) o A100/H100 son suficientes en bf16.
- Cabe en GPU de consumo: si, en bf16 cabe en RTX 3090/4090 (24 GB) y en GPUs de 16 GB con secuencias moderadas; en cuantizacion 4-8 bits cabria en GPUs de 8-12 GB.
- Opciones de despliegue: `transformers` (soporte nativo de `Qwen3_5ForConditionalGeneration`), SGLang (usado en los rollouts de entrenamiento), vLLM (compatible con arquitecturas Qwen3.5 segun soporte de la libreria), TGI y llama.cpp/Ollama previa conversion a GGUF. El tag `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de Hugging Face.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4.659.865.088 | 40.960 en entrenamiento | Checkpoint intermedio de safety RL con GRPO | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning sobre modelos de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de otros checkpoints de safety tuning directamente comparables con la misma receta y tamano, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Checkpoint intermedio: el propio autor indica que el entrenamiento sigue en curso y que esta instantanea no es un modelo final; su comportamiento puede no ser estable ni representativo del resultado esperado.
- Sin benchmarks publicados: no hay evaluaciones estandar de capacidad, seguridad o calidad, por lo que no se puede garantizar su rendimiento en tareas generales.
- Volatilidad en el entrenamiento: la recompensa media oscila entre 0.808 y 0.877, y en magicoder cae hasta 0.26 en algunas ventanas, lo que sugiere inestabilidad en la generacion de codigo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; no se ha medido ni documentado en la model card.
- Sesgos: no se documentan analisis de sesgo; el conjunto de datos de entrenamiento esta centrado en seguridad y puede introducir sesgos de rechazo excesivo (falsos positivos) en prompts benignos.
- Limitaciones de idioma: los idiomas soportados no estan disponibles; la mezcla de datos parece predominantemente en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar las condiciones del modelo base y de los datasets de entrenamiento (algunos como WildJailbreak o AgentAlign pueden tener terminos propios).
- Uso en produccion: no recomendado sin una evaluacion exhaustiva previa; al ser un checkpoint de investigacion, no debe desplegarse como sistema de seguridad sin validacion adicional.
- Dependencia del juez: la calidad del alineamiento depende de las decisiones de un juez automatico (Qwen3.8-27B) con veredicto binario, lo que puede trasladar sesgos del juez al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1240
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Slime (framework de RL): https://github.com/THUDM/slime
- Megatron-LM: https://github.com/NVIDIA/Megatron-LM
- SGLang: https://github.com/sgl-project/sglang
- AgentAlign: no disponible en la informacion proporcionada
- CodesafetyBench: no disponible en la informacion proporcionada
- WildJailbreak: no disponible en la informacion proporcionada
