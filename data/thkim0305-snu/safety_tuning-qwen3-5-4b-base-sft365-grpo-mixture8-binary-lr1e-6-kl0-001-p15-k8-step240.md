# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240 es un checkpoint intermedio de ajuste fino orientado a seguridad, derivado de Qwen3.5-4B-Base mediante una cadena de dos etapas: primero un SFT sobre el conjunto "mixture-8" (checkpoint SFT365) y despues un entrenamiento con GRPO sobre el mismo conjunto de prompts. Lo desarrolla el usuario thkim0305-SNU y esta publicado con licencia Apache 2.0. El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP intactas, aunque solo se ha entrenado el modelo de lenguaje.

El objetivo del entrenamiento es alinear el comportamiento del modelo en escenarios de seguridad: rechazo de peticiones daninas, cumplimiento de peticiones benignas, seguridad en generacion de codigo y, de forma destacada, seguridad en trayectorias de uso de herramientas (tool calling multi-turno). Para ello se emplea un juez externo (Qwen3.8-27B) que emite un veredicto binario estricto (0/1) sobre cada rollout, y ese reward se normaliza por grupo segun el algoritmo GRPO.

Es relevante ahora porque documenta de forma transparente una receta de RL de seguridad sobre un modelo de 4B con capacidad de razonamiento (thinking) y function calling, e incluye trazas de reward por dataset a lo largo del entrenamiento. Se trata, sin embargo, de una instantanea intermedia (240 actualizaciones de optimizador de un total previsto de 787), no de un modelo final, y no se han publicado resultados en benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de vision y cabeza MTP |
| Parametros totales | 4.659.865.088 (aproximadamente 4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto de rollout); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y mantiene su arquitectura completa: un modelo de lenguaje transformer con proyecciones GDN (que se re-fusionaron durante la exportacion), una torre de vision y una cabeza MTP (multi-token prediction). Solo se entreno el modelo de lenguaje; la torre de vision y la cabeza MTP conservan los pesos originales del base, por lo que el checkpoint carga exactamente igual que el modelo de referencia. El pipeline de entrenamiento combina Slime (con rollouts generados por SGLang en modo colocado) y Megatron-LM en bf16, con exportacion desde un checkpoint torch_dist de Megatron (iter_0000239) mediante `safety_tuning.hf_export`.

La etapa de RL usa GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0,2, TIS activado y una perdida KL de baja varianza con coeficiente 0,001 respecto al checkpoint de partida congelado. Cada actualizacion emplea 15 prompts por 8 rollouts por prompt (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa `enable_thinking=true` en la plantilla de chat de Qwen y las trayectorias de herramientas usan el function calling `qwen3_coder`. El reward lo emite un juez Qwen3.8-27B con veredicto binario estricto; en los prompts de AgentAlign se juzga toda la trayectoria visible de uso de herramientas. El plan de entrenamiento cubre una epoca sobre 11.794 prompts unicos (787 actualizaciones), con checkpoints cada 40 actualizaciones; este es el de la actualizacion 240.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador de herramientas, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explicito (`enable_thinking=true`).
- Razonamiento multi-paso dentro del bloque de pensamiento antes de la respuesta final.
- Function calling / tool calling con el formato `qwen3_coder`, incluyendo trayectorias multi-turno con multiples herramientas.
- Comportamiento de seguridad entrenado: rechazo de peticiones daninas, cumplimiento de peticiones benignas, resistencia a jailbreaks benignos (wildjailbreak_benign) y seguridad en codigo (codesafetybench).
- Generacion de codigo (entrenado con magicoder y codesafetybench).
- Capacidad multimodal heredada del base (torre de vision intacta), aunque el entrenamiento de seguridad solo afecta al modelo de lenguaje.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Cabeza MTP heredada del base para decodificacion especulativa, sin entrenamiento adicional.

## Casos de uso

- Filtrado y moderacion de peticiones en produccion: el modelo puede clasificar o reformular peticiones potencialmente daninas y responder con rechazos calibrados, gracias al entrenamiento con veredictos binarios sobre star1_gp3, star_benign_v2 y wildjailbreak_benign.
- Agentes con herramientas en entornos sensibles: al haber sido entrenado con trayectorias AgentAlign (4.000 prompts con definiciones sinteticas de herramientas), es adecuado para prototipos de agentes que deben decidir cuando invocar una herramienta y cuando negarse, manteniendo el contexto de la conversacion hasta 40.960 tokens.
- Asistencia en generacion de codigo con control de seguridad: puede integrarse en asistentes de IDE o pipelines de revision para sugerir codigo y, a la vez, senalar patrones inseguros, apoyandose en el entrenamiento sobre codesafetybench y magicoder.
- Evaluacion de robustez frente a jailbreaks: util como modelo de referencia para comparar tasas de rechazo antes y despues del RL de seguridad, ya que el autor publica las curvas de reward por dataset.
- Consejo dificil con salvaguardas: el conjunto difficult_advice (1.982 prompts) entrena respuestas utiles en consultas delicadas sin cruzar limites de seguridad, aplicable a chatbots de orientacion.
- Investigacion en RL de alineacion: la receta completa (GRPO, juez binario, KL bajo, TIS, Slime + Megatron) y las trazas de reward permiten reproducir o extender el experimento en entornos academicos con 4x H100.
- Base para experimentos de seguridad multimodal: al conservar la torre de vision, sirve como punto de partida para estudiar si el ajuste de seguridad en texto se transfiere a entradas con imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta la puntuacion media del juez binario durante el entrenamiento (reward crudo antes de normalizacion por grupo):

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1200 |
| 30-40 | 0,718 | 1200 |
| 70-80 | 0,813 | 1200 |
| 110-120 | 0,817 | 1200 |
| 150-160 | 0,857 | 1200 |
| 190-200 | 0,868 | 1200 |
| 230-240 | 0,857 | 1200 |

Desglose por dataset (mismas ventanas):

| Dataset | 0-10 | 30-40 | 70-80 | 110-120 | 150-160 | 190-200 | 230-240 |
|---|---|---|---|---|---|---|---|
| agentalign_benign | 0,48 | 0,49 | 0,63 | 0,69 | 0,70 | 0,71 | 0,61 |
| agentalign_harmful | 0,96 | 0,94 | 0,97 | 0,93 | 0,97 | 0,98 | 0,97 |
| codesafetybench | 0,65 | 0,89 | 0,94 | 0,86 | 0,96 | 0,95 | 0,93 |
| difficult_advice | 0,88 | 0,90 | 0,88 | 0,94 | 0,95 | 0,97 | 0,89 |
| magicoder | 0,38 | 0,26 | 0,19 | 0,47 | 0,55 | 0,56 | 0,70 |
| star1_gp3 | 0,77 | 0,94 | 0,97 | 0,98 | 0,97 | 1,00 | 0,99 |
| star_benign_v2 | 0,72 | 0,64 | 0,72 | 0,82 | 0,94 | 0,82 | 0,91 |
| wildjailbreak_benign | 0,68 | 0,63 | 0,79 | 0,78 | 0,81 | 0,87 | 0,86 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (el repositorio ocupa 9,3 GB), mas overhead de activaciones y cache KV; se recomienda al menos 16-24 GB para contexto largo.
- GPU profesionales recomendadas: A100 40/80 GB, H100 80 GB (el autor entreno con 4x H100 80 GB: juez en TP2, trainer en una GPU con estado del optimizador en CPU y motor de rollout en otra).
- GPU de consumo: un modelo de 4,66B en bf16 cabe en RTX 4090 (24 GB) y, con cuantizacion a 8 o 4 bits, en GPUs de 12-16 GB (por ejemplo RTX 4070 Ti o 4080); no se han publicado pesos GGUF en el repositorio.
- Despliegue: transformers con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`; SGLang (usado en los rollouts del entrenamiento); vLLM y TGI son opciones plausibles para arquitecturas Qwen, aunque no se confirma compatibilidad explicita en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B GRPO step240) | 4,66B | 40.960 en entrenamiento | RL de seguridad con GRPO sobre Qwen3.5-4B | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen3.5-4B-Base | aproximadamente 4B | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face (Qwen) |
| Checkpoint SFT365 del mismo autor | aproximadamente 4,66B | no disponible | SFT sobre mixture-8, sin RL | Apache 2.0 | Hugging Face (thkim0305-SNU) |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoria; la comparacion se limita a parametros, contexto de entrenamiento y licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio (240 de 787 actualizaciones previstas): el entrenamiento seguia en curso en el momento de la exportacion y el comportamiento puede ser inestable.
- No se han publicado evaluaciones en benchmarks estandar; el unico indicador es el reward de un juez automatico (Qwen3.8-27B), que puede estar sesgado hacia el estilo y los criterios del propio juez.
- El reward de agentalign_benign cae en la ultima ventana (de 0,71 a 0,61), lo que sugiere posible sobre-rechazo o degradacion en el cumplimiento de tareas benignas con herramientas.
- El reward de magicoder es bajo y erratico (0,19 en la ventana 70-80), lo que indica capacidad de generacion de codigo limitada o inestable en este punto del entrenamiento.
- Riesgo de alucinacion inherente a un modelo de 4B; no se documentan mitigaciones especificas.
- Idiomas soportados no documentados; el comportamiento fuera del ingles no esta verificado.
- La torre de vision y la cabeza MTP no se entrenaron: las capacidades multimodales y de decodificacion especulativa son las del base, sin garantia de alineacion de seguridad en entradas con imagen.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B-Base puede tener terminos adicionales (enlazados en la model card); conviene revisarlos antes de desplegar en produccion.
- El uso de un juez binario estricto puede producir rechazos excesivos en dominios no representados en mixture-8.
- No se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step240
- Modelo base del SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/thkim0305-SNU
