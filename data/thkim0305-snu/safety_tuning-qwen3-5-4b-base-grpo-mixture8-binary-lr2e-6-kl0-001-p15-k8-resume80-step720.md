# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step720

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step720 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo publica el usuario thkim0305-SNU y emplea GRPO (Group Relative Policy Optimization) con recompensas binarias normalizadas por grupo, entrenado con el framework Slime (rollouts con SGLang) y Megatron-LM en bf16. No es un modelo final: es una instantanea tras 720 actualizaciones del optimizador (iteracion 719 de Megatron) de un entrenamiento que sigue en curso.

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B: pesos bf16 en formato `Qwen3_5ForConditionalGeneration`, con torre de vision y cabeza MTP intactas (solo se entreno el modelo de lenguaje), de modo que se carga exactamente igual que el modelo base. Cuenta con 4.659.865.088 parametros y un contexto de entrenamiento de 40.960 tokens, con hasta 32.768 tokens generados por rollout.

Su relevancia es metodologica: documenta con detalle una receta de RL para alineamiento de seguridad sobre un modelo pequeno (4B), incluyendo mezcla de prompts, juez automatico y evolucion de la recompensa por subconjunto de datos. Es util para investigadores que estudien dinamicas de GRPO en seguridad, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5): `Qwen3_5ForConditionalGeneration`, con torre de vision y cabeza MTP; solo se entreno el LM |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); generacion de hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura completa: un transformer multimodal con torre de vision y cabeza MTP, aunque solo se actualizaron los pesos del modelo de lenguaje. La exportacion se realizo desde un checkpoint Megatron `torch_dist` (`iter_0000719`) mediante `safety_tuning.hf_export`, con re-fusion de las proyecciones GDN, mapeo de nombres Slime para Qwen3.5 y copia de los pesos de vision y MTP del base.

El entrenamiento usa GRPO con recompensas binarias (0/1) normalizadas por grupo, PPO clip 0.2 y TIS activado. Se emplean 15 prompts por actualizacion con 8 rollouts cada uno (120 secuencias), learning rate constante de 2e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. Se anade una perdida KL de baja varianza contra el modelo inicial con coeficiente 0.001. El muestreo usa temperatura 1.0, top-p 1, plantilla de chat de Qwen con `enable_thinking=true`, y function calling `qwen3_coder` para los rollouts con herramientas. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se evaluan sobre toda la trayectoria visible de uso de herramientas. El calendario cubre una epoca sobre 11.794 prompts unicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

La mezcla de datos (mixture-8) incluye: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign llevan definiciones sinteticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la perdida.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo de pensamiento (`enable_thinking=true`).
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de vision no se entreno en este checkpoint.
- Tool calling / function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multiturno de uso de herramientas.
- Comportamiento agente con razonamiento multi-paso, entrenado con prompts de AgentAlign (daninos y benignos).
- Alineamiento de seguridad: rechazo de peticiones daninas, manejo de jailbreaks benignos y seguridad en generacion de codigo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Investigacion de dinamicas de GRPO en seguridad: el checkpoint permite reproducir y analizar la evolucion de la recompensa del juez por subconjunto de datos a lo largo de las actualizaciones, util para estudiar estabilidad y colapso de recompensa.
- Evaluacion de alineamiento de modelos de 4B: sirve como punto de comparacion frente al base Qwen3.5-4B para medir el efecto del RL de seguridad en benchmarks de rechazo y utilidad.
- Estudio de seguridad en generacion de codigo: los datos de codesafetybench (recompensa entre 0.80 y 0.97) permiten analizar como el modelo maneja peticiones de codigo potencialmente peligrosas.
- Analisis de comportamiento agente seguro: los prompts de AgentAlign con herramientas simuladas permiten examinar trayectorias multiturno y decidir si el modelo evita acciones daninas en entornos con herramientas.
- Base para experimentos de ajuste posterior: al cargarse igual que el base y mantener vision y MTP intactas, puede usarse como punto de partida para nuevos ciclos de RL o SFT.
- Evaluacion de robustez ante jailbreaks: los datos de wildjailbreak_benign y difficult_advice permiten probar la resistencia a prompts adversarios y a peticiones de consejo delicadas.
- Docencia y divulgacion tecnica: la model card detallada facilita explicar un pipeline completo de RLHF/RLVR con juez automatico, Slime y Megatron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta la recompensa media binaria del juez durante el entrenamiento (antes de normalizacion por grupo):

| Ventana de actualizaciones | Recompensa media | Rollouts evaluados |
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
| 670-680 | 0.771 | 1200 |
| 710-720 | 0.765 | 1200 |

Desglose por subconjunto en la ventana final (710-720): agentalign_benign 0.61, agentalign_harmful 0.78, codesafetybench 0.91, difficult_advice 0.81, magicoder 0.59, star1_gp3 0.93, star_benign_v2 0.89, wildjailbreak_benign 0.75.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos; con cache KV y overhead, se recomienda al menos 16-20 GB para contextos moderados y bastante mas para el contexto maximo de 40.960 tokens.
- GPU recomendadas: NVIDIA B200 (usada para el entrenamiento), A100 80 GB o H100 para despliegue comodo con contexto largo; RTX PRO 6000 en el entrenamiento previo.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 4090, RTX 3090) con cuantizacion o contextos reducidos; en bf16 completo, 24 GB es ajustado para contextos largos.
- Opciones de despliegue: transformers (recipe oficial de la model card), vLLM, SGLang, TGI y llama.cpp/Ollama si se generan pesos GGUF (no publicados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 | RL de seguridad (GRPO), checkpoint intermedio | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Modelo base multimodal | apache-2.0 | Hugging Face |
| Alternativas de seguridad de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de seguridad del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el autor indica explicitamente que el entrenamiento sigue en curso y que esta instantanea puede no representar el comportamiento final.
- La recompensa media fluctua y muestra senales de inestabilidad (caida de 0.839 a 0.713 entre las ventanas 310-320 y 510-520, con repuntes posteriores); agentalign_benign llega a 0.39 en la ventana 630-640, lo que sugiere comportamiento erratico en escenarios benignos con herramientas.
- Riesgo de alucinacion no evaluado: no hay benchmarks estandar publicados que midan factualidad, codigo o matematicas.
- Idiomas soportados no documentados; el comportamiento multilingue no esta verificado.
- La evaluacion depende de un juez automatico (Qwen3.8-27B) con veredicto binario; los sesgos del juez pueden propagarse al modelo.
- La torre de vision y la cabeza MTP no se entrenaron, por lo que las capacidades multimodales no se han optimizado en este checkpoint.
- Licencia apache-2.0 permite uso comercial, pero al ser un checkpoint de investigacion sin validacion en produccion, no se recomienda su despliegue directo en sistemas criticos.
- No hay garantias de robustez frente a ataques adversariales no vistos; el entrenamiento cubre un conjunto acotado de prompts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step720
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Framework Slime: no disponible en la informacion proporcionada
- Megatron-LM: no disponible en la informacion proporcionada
- SGLang: no disponible en la informacion proporcionada
- Paper o blog del metodo: no disponible en la informacion proporcionada
