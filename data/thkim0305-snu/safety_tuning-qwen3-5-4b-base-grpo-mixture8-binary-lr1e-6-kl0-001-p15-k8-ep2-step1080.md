# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1080

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1080 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, obtenido a partir de Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU y forma parte de un experimento de safety tuning que combina GRPO (Group Relative Policy Optimization) con un juez externo que emite veredictos binarios (0/1) sobre las respuestas generadas. No es un modelo final: es una instantanea del entrenamiento tras 1080 actualizaciones del optimizador, con el entrenamiento aun en curso.

El modelo conserva la arquitectura del base (Qwen3.5, transformer multimodal con torre de vision y cabeza MTP), pero solo se ha entrenado el modelo de lenguaje; la torre de vision y la cabeza MTP mantienen los pesos originales. Cuenta con 4.659.865.088 parametros reales (segun safetensors) y un contexto de entrenamiento de 40960 tokens, con hasta 32768 tokens generados por rollout.

Su relevancia es metodologica: documenta de forma transparente una receta completa de RL para seguridad (prompts mixtos, juez binario, KL bajo, tool calling multi-turno) y publica la evolucion del reward por dataset a lo largo del entrenamiento. Resulta util para investigadores que quieran reproducir o auditar tecnicas de safety alignment, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`): transformer multimodal con torre de vision y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40960 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (enlazada a la licencia de Qwen/Qwen3.5-4B-Base) |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura: un modelo `Qwen3_5ForConditionalGeneration` con torre de vision y cabeza MTP, de los cuales solo se ha ajustado el modelo de lenguaje. Los pesos se exportaron desde Megatron torch_dist (`iter_0001079`) mediante `safety_tuning.hf_export`, con re-fusion de las proyecciones GDN, mapeo de nombres de Slime para Qwen3.5 y copia de los pesos base de vision y MTP.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Por cada actualizacion se usan 15 prompts x 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas [0.9, 0.95]), weight decay 0.1, grad clip 1.0 y una perdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32768 tokens generados y contexto de 40960. Se activa `enable_thinking=true` en la plantilla de chat de Qwen y, en los rollouts con herramientas, se usa function calling `qwen3_coder`. El reward lo emite un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas.

El dataset "mixture-8" suma 11794 prompts unicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). De ellos, 4000 prompts de AgentAlign incluyen definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida. El plan es una epoca con padding sobre los 11794 prompts (1574 actualizaciones), con checkpoints cada 40. Este checkpoint corresponde a la epoca 2 de la ejecucion con lr 1e-6, reanudada en la actualizacion 787 desde su checkpoint final (modelo, estado del optimizador y RNG) con un nuevo barajado de prompts (semilla 43). La ejecucion se hizo en 1x NVIDIA B200 para entrenador y motor de rollout, y el juez Qwen3.8-27B en 2x A100 (SGLang TP2) a traves de un tunel SSH.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo thinking (`enable_thinking=true`).
- Razonamiento multi-paso dentro de la ventana de contexto de 40960 tokens.
- Tool calling / function calling mediante el formato `qwen3_coder`, entrenado explicitamente con trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a seguridad: rechazo de peticiones daninas, respuestas benignas ante jailbreaks y manejo de consejos delicados, segun la mezcla de datos de entrenamiento.
- Capacidades multimodales heredadas del base (torre de vision intacta), aunque no fueron objeto del ajuste.
- Generacion de codigo, dado el peso de codesafetybench y magicoder en la mezcla.
- Capacidad de generar hasta 32768 tokens por respuesta.

## Casos de uso

- Investigacion en safety alignment: usar el checkpoint como referencia intermedia para estudiar la evolucion del reward por dataset y comparar recetas de RL (juez binario, KL bajo, tamano de grupo).
- Evaluacion de robustez frente a jailbreaks: probar prompts de wildjailbreak_benign y agentalign_harmful para medir la tasa de rechazo correcto antes y despues del ajuste.
- Auditoria de agentes con herramientas: desplegar trayectorias multi-turno con definiciones sinteticas de herramientas y comprobar si el modelo evita acciones daninas en el uso de tools.
- Filtrado y moderacion de contenido en pipelines internos: usar el modelo como clasificador generativo de seguridad sobre respuestas de otros modelos, aprovechando su entrenamiento con veredictos binarios.
- Generacion de codigo con conciencia de seguridad: integrarlo en entornos de desarrollo para detectar patrones inseguros en sugerencias de codigo, dado el peso de codesafetybench.
- Base para experimentos de RL reanudables: al incluir estado de optimizador y RNG en la provenance, sirve para reproducir y continuar el entrenamiento desde la actualizacion 787.
- Estudio de consejos delicados: evaluar respuestas en dominios sensibles (difficult_advice) para calibrar tono y limites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta la puntuacion media del juez binario durante el entrenamiento (reward crudo antes de normalizacion por grupo):

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0.808 | 1200 |
| 830-840 | 0.815 | 1200 |
| 870-880 | 0.855 | 1200 |
| 910-920 | 0.877 | 1200 |
| 950-960 | 0.853 | 1200 |
| 990-1000 | 0.808 | 1200 |
| 1030-1040 | 0.828 | 1200 |
| 1070-1080 | 0.812 | 1200 |

Desglose por dataset (mismas ventanas):

| Dataset | 790-800 | 830-840 | 870-880 | 910-920 | 950-960 | 990-1000 | 1030-1040 | 1070-1080 |
|---|---|---|---|---|---|---|---|---|
| agentalign_benign | 0.61 | 0.62 | 0.73 | 0.69 | 0.72 | 0.69 | 0.61 | 0.63 |
| agentalign_harmful | 0.90 | 0.95 | 0.96 | 0.93 | 0.90 | 0.91 | 0.92 | 0.88 |
| codesafetybench | 0.85 | 0.93 | 0.93 | 0.83 | 0.95 | 0.96 | 0.94 | 0.90 |
| difficult_advice | 0.81 | 0.88 | 0.86 | 0.88 | 0.83 | 0.84 | 0.91 | 0.79 |
| magicoder | 0.76 | 0.26 | 0.77 | 0.87 | 0.54 | 0.53 | 0.57 | 0.58 |
| star1_gp3 | 0.97 | 0.96 | 0.96 | 0.99 | 0.95 | 0.96 | 0.89 | 0.93 |
| star_benign_v2 | 0.84 | 0.83 | 0.86 | 0.94 | 0.94 | 0.88 | 0.92 | 0.92 |
| wildjailbreak_benign | 0.86 | 0.86 | 0.81 | 0.88 | 0.93 | 0.82 | 0.80 | 0.89 |

Se observa una caida notable en magicoder entre las ventanas 830-840 (0.26) y 950-1000 (0.53-0.54), con recuperacion parcial posterior (0.57-0.58).

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (tamano del repo), mas overhead de activaciones y cache KV; con contexto de 40960 tokens el consumo adicional de cache KV puede ser significativo.
- Cuantizacion: no se publican pesos GGUF ni cuantizados; habria que generarlos a partir de los safetensors bf16.
- GPU recomendadas: el entrenamiento se hizo en 1x NVIDIA B200 (entrenador y rollout) y el juez en 2x A100 con SGLang TP2. Para inferencia, una GPU con 24 GB o mas (RTX 4090, L40S, A100) deberia bastar en bf16; en consumer de 16 GB requeriria cuantizacion.
- Despliegue: compatible con transformers (`Qwen3_5ForConditionalGeneration`), y por tags `endpoints_compatible`; el ecosistema de entrenamiento uso SGLang y Megatron-LM. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4.659.865.088 | 40960 | Safety RL con GRPO y juez binario, checkpoint intermedio | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-4B-Base | no disponible en la informacion | no disponible en la informacion | Modelo base multimodal sin safety tuning | apache-2.0 | Hugging Face |
| Qwen3.8-27B (juez usado en el entrenamiento) | no disponible en la informacion | no disponible en la informacion | Modelo juez para veredictos binarios | no disponible | Uso interno en el experimento |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso y el reward muestra fluctuaciones (pico de 0.877 en 910-920 y descenso a 0.812 en 1070-1080).
- El reward depende de un juez automatico (Qwen3.8-27B) con veredicto binario estricto; puede heredar sesgos y errores del juez, y el ajuste optimiza contra ese criterio, no contra seguridad real.
- Caida acusada del reward en magicoder (de 0.76 a 0.26 en 830-840 y valores de 0.53-0.58 posteriores), lo que sugiere inestabilidad en la generacion de codigo durante el entrenamiento.
- El modo thinking y el tool calling se entrenaron con plantillas y formatos concretos (`enable_thinking=true`, `qwen3_coder`); su comportamiento fuera de esos formatos no esta garantizado.
- Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP son pesos base sin ajustar, por lo que las capacidades multimodales no se benefician del safety tuning.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue.
- Riesgo de alucinacion inherente a un modelo de 4B ajustado con RL sobre seguridad, no sobre veracidad.
- La licencia apache-2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin evaluacion externa, no se recomienda su uso en produccion sin auditoria previa.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1080
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
