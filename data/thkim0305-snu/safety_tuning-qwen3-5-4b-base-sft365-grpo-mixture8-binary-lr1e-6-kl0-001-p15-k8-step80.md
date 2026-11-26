# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80 es un checkpoint intermedio de un proceso de ajuste fino con aprendizaje por refuerzo (GRPO) orientado a la seguridad, desarrollado por el usuario thkim0305-SNU. El modelo parte de Qwen/Qwen3.5-4B-Base, pasa por un ajuste supervisado (SFT) sobre el conjunto "Mixture8" y se somete a 80 actualizaciones de optimizador de RL de seguridad sobre un conjunto de prompts denominado "mixture-8". El autor indica explicitamente que el entrenamiento sigue en curso y que este snapshot no es un modelo final.

Se trata de un modelo de 4.659.865.088 parametros (aproximadamente 4,66 mil millones) con arquitectura Qwen3.5, que combina procesamiento de lenguaje con vision (clase `Qwen3_5ForConditionalGeneration`, pipeline image-text-to-text). El entrenamiento RL solo afecta a la torre de lenguaje: la torre de vision y la cabeza MTP conservan los pesos originales del modelo base, por lo que el checkpoint se carga exactamente igual que el modelo base.

La relevancia de esta ficha es doble: por un lado, documenta una receta de alineamiento de seguridad con GRPO sobre datos de prompts maliciosos y benignos, incluyendo trayectorias de uso de herramientas (AgentAlign); por otro, su naturaleza de checkpoint intermedio con licencia Apache 2.0 lo hace util para investigacion sobre RLHF/GRPO aplicado a seguridad, aunque no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal, clase `Qwen3_5ForConditionalGeneration`; torre de vision + cabeza MTP + torre de lenguaje) |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (usado en entrenamiento); longitud maxima nativa no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `Qwen3_5ForConditionalGeneration`) |
| Tamano del repo | 9,3 GB |
| Modelo base | thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365 (a su vez desde Qwen/Qwen3.5-4B-Base, snapshot `ccd726d2543d`) |
| Framework de entrenamiento | Slime (rollouts con SGLang, colocados) + Megatron-LM, bf16 |
| Algoritmo | GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2, TIS activado |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5 con aproximadamente 4,66 mil millones de parametros. Incluye una torre de vision y una cabeza MTP (multi-token prediction) heredadas sin entrenar del modelo base; solo se actualizo la torre de lenguaje durante el proceso de RL. Los pesos se exportan en bf16 y se cargan con `transformers` mediante `Qwen3_5ForConditionalGeneration`, con las proyecciones GDN re-fusionadas y el mapeo de nombres de Slime para Qwen3.5 aplicado en la conversion desde el checkpoint Megatron `iter_0000079`.

El entrenamiento combina una fase previa de SFT (365 pasos, modelo base de esta ficha) con una fase de RL de seguridad mediante GRPO. La receta RL usa 15 prompts por actualizacion y 8 rollouts por prompt (120 secuencias por update), learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0, perdida KL de baja varianza con coeficiente 0.001 frente al modelo congelado de partida, temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960 tokens. Se activa `enable_thinking=true` con la plantilla de chat de Qwen, y los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) segun la especificacion del proyecto; para AgentAlign se juzga la trayectoria completa de uso de herramientas. El schedule es una epoca sobre 11.794 prompts unicos (787 actualizaciones), con checkpoints cada 40 updates; este snapshot corresponde a 80 actualizaciones.

El conjunto "mixture-8" se compone de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sinteticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explicito (`enable_thinking=true`).
- Procesamiento de imagen y texto (image-text-to-text) gracias a la torre de vision del modelo base, aunque dicha torre no fue entrenada en esta fase.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con entrenamiento especifico sobre trayectorias multi-turno de AgentAlign.
- Razonamiento multi-paso en entornos simulados de agentes (rollouts con tool simulator).
- Capacidades de seguridad alineada: rechazo de peticiones daninas, resistencia a jailbreaks benignos y manejo de consejo dificil, segun el conjunto de datos de entrenamiento.
- Generacion de codigo y evaluacion de seguridad en codigo (codesafetybench, magicoder en el dataset, aunque con degradacion observada en magicoder).
- Capacidades multilingues: no disponible (no se documentan idiomas).
- Modo thinking con hasta 32.768 tokens de generacion.

## Casos de uso

- Investigacion sobre alineamiento de seguridad con RL: el checkpoint sirve para reproducir y analizar la evolucion de las recompensas del juez en ventanas de actualizaciones (0-10, 30-40, 70-80), util para estudiar estabilidad de GRPO en tareas de seguridad.
- Evaluacion de robustez frente a jailbreaks: el modelo ha sido entrenado con wildjailbreak_benign y star_benign_v2, por lo que puede emplearse como sujeto de pruebas en pipelines de red-teaming automatizado.
- Desarrollo de agentes con uso de herramientas: soporta function calling `qwen3_coder` y fue entrenado con trayectorias AgentAlign, adecuado para prototipos de agentes que deben decidir cuando invocar herramientas y como encadenar llamadas.
- Moderacion y filtrado de contenido: su alineamiento hacia rechazo de peticiones daninas permite usarlo como componente de un sistema de clasificacion o generacion de respuestas seguras en conversaciones multi-turno con contexto de hasta 40.960 tokens.
- Generacion asistida de codigo con conciencia de seguridad: entrenado con codesafetybench, puede emplearse para generar fragmentos de codigo y evaluar si introduce patrones inseguros, aunque con cautela por la degradacion en magicoder.
- Analisis de consejo dificil (difficult_advice): util en escenarios de orientacion sensible donde se requiere un tono prudente y respuestas que eviten dano, como asistentes de salud o soporte emocional de bajo riesgo.
- Base para experimentos de RL con recompensas binarias: al ser un checkpoint intermedio con receta documentada, sirve como punto de partida para comparar variantes de coeficiente KL, learning rate o tamano de grupo en GRPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta la puntuacion media del juez binario durante el entrenamiento:

| Ventana de actualizaciones | Puntuacion media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,735 | 1.200 |
| 30-40 | 0,718 | 1.200 |
| 70-80 | 0,813 | 1.200 |

Desglose por dataset (puntuacion del juez binario):

| Dataset | Updates 0-10 | Updates 30-40 | Updates 70-80 |
|---|---|---|---|
| agentalign_benign | 0,48 | 0,49 | 0,63 |
| agentalign_harmful | 0,96 | 0,94 | 0,97 |
| codesafetybench | 0,65 | 0,89 | 0,94 |
| difficult_advice | 0,88 | 0,90 | 0,88 |
| magicoder | 0,38 | 0,26 | 0,19 |
| star1_gp3 | 0,77 | 0,94 | 0,97 |
| star_benign_v2 | 0,72 | 0,64 | 0,72 |
| wildjailbreak_benign | 0,68 | 0,63 | 0,79 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda al menos 16-24 GB de VRAM para contexto moderado.
- GPU recomendadas: el entrenamiento se realizo en 4x H100 80GB (juez en TP2, trainer en una GPU con estado del optimizador en CPU, motor de rollout en otra). Para inferencia basta una GPU profesional o consumer de gama alta.
- Cabe en GPU consumer: si, en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 5090) en bf16; en GPUs de 8-12 GB seria necesario cuantizar, aunque no se publican pesos cuantizados.
- Opciones de despliegue: `transformers` con `device_map="auto"` (metodo documentado por el autor); vLLM, TGI, llama.cpp u Ollama no estan documentados para este checkpoint, y la naturaleza multimodal y la cabeza MTP pueden requerir soporte especifico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8 (este) | ~4,66 B | 40.960 (entrenamiento) | Apache 2.0 | Seguridad + agentes via GRPO, checkpoint intermedio | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | ~4 B (no confirmado) | no disponible | Apache 2.0 (segun license_link) | Modelo base generalista | Hugging Face |
| Checkpoint SFT previo (Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365) | ~4,66 B | no disponible | Apache 2.0 | SFT de seguridad antes de RL | Hugging Face |
| Alternativas de seguridad de 4B (p. ej. Llama Guard, ShieldGemma) | no disponible | no disponible | no disponible | Clasificacion/moderacion de seguridad | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: el autor indica explicitamente que el entrenamiento sigue en curso y que este snapshot no es un modelo final; no debe usarse en produccion.
- Degradacion en generacion de codigo: la puntuacion del juez en magicoder cae de 0,38 a 0,19 entre las ventanas 0-10 y 70-80, lo que sugiere perdida de capacidad de codigo generalista durante el RL de seguridad.
- Rendimiento irregular en benignidad: agentalign_benign (0,63) y star_benign_v2 (0,72) muestran margen de mejora, con riesgo de rechazos excesivos o comportamiento inconsistente en peticiones legitimas.
- Riesgo de alucinacion: no se documenta evaluacion especifica de alucinacion; al ser un modelo de 4,66 B, la fiabilidad factica es limitada.
- Sesgos conocidos: no disponibles; el dataset incluye prompts de seguridad y benignos, pero no se documenta analisis de sesgos.
- Idiomas: no se especifican idiomas soportados; el entrenamiento se realizo presumiblemente en ingles, sin confirmacion.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5 tiene su propia licencia enlazada (`license_link`); conviene revisar ambas.
- Naturaleza multimodal parcial: la torre de vision no fue entrenada, por lo que su calidad es la del modelo base y no se beneficia del ajuste de seguridad.
- Dependencia del juez: las recompensas provienen de un juez Qwen3.8-27B con veredicto binario, lo que puede introducir sesgos del juez en el comportamiento aprendido.
- Cero descargas y cero likes en el momento de la ficha: sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step80
- Modelo base SFT: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la informacion proporcionada
- Repositorio de Slime: no disponible en la informacion proporcionada
- Repositorio de Megatron-LM: no disponible en la informacion proporcionada
- Demo: no disponible
