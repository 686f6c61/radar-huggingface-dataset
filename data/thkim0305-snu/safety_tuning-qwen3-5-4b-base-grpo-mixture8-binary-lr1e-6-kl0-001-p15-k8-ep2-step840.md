# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step840

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step840 es un checkpoint intermedio de ajuste fino por refuerzo (RLHF con GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: reducir respuestas dañinas y mejorar el comportamiento del modelo en escenarios de riesgo, incluyendo trayectorias de uso de herramientas multi-turno. No es un modelo final, sino una instantánea del entrenamiento en la actualización 840 de un total previsto de 1574.

El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration, con torre de visión y cabeza MTP intactas) y solo se ha entrenado el modelo de lenguaje. Cuenta con 4.659.865.088 parámetros totales en bf16 y un contexto de entrenamiento de 40.960 tokens. La relevancia actual radica en que documenta una receta reproducible de RL de seguridad con recompensas binarias juzgadas por un LLM y rollouts de agentes con simulación de herramientas.

El checkpoint se publica bajo licencia Apache 2.0, es compatible con transformers y endpoints, y está pensado para investigadores que quieran estudiar la dinámica del alineamiento de seguridad o continuar el entrenamiento desde este punto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). Durante el ajuste solo se entrena el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales, por lo que el checkpoint carga exactamente igual que el base. La exportación desde Megatron `iter_0000839` re-fusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5 y copia los pesos de visión y MTP del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización emplea 15 prompts con 8 rollouts cada uno (120 secuencias), learning rate constante de 1e-6 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado. El muestreo usa temperatura 1.0, top-p 1 y hasta 32.768 tokens generados. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El horario previsto es una época con padding sobre los 11.794 prompts (1574 actualizaciones), con checkpoints cada 40 actualizaciones; este snapshot corresponde a la actualización 840 (época 2 del run lr1e-6, reanudado en la actualización 787 con semilla 43).

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-step en modo thinking, con hasta 32.768 tokens generados.
- Uso de herramientas (tool calling / function calling) mediante el formato `qwen3_coder`, entrenado con trayectorias multi-turno contra un simulador.
- Comportamiento de agente con múltiples pasos y llamadas encadenadas a herramientas.
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de visión no fue entrenada en este ajuste.
- Alineamiento de seguridad: rechazo de peticiones dañinas y manejo de jailbreaks benignos y maliciosos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio.

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint permite analizar la evolución de las tasas de rechazo y utilidad a lo largo del entrenamiento GRPO, comparando las ventanas de actualizaciones 790-800 y 830-840.
- Evaluación de robustez frente a jailbreaks: útil para medir cómo responde el modelo a prompts de wildjailbreak_benign y difficult_advice tras el ajuste con recompensa binaria.
- Desarrollo de agentes con herramientas: el modelo ha sido entrenado con trayectorias multi-turno y formato `qwen3_coder`, por lo que sirve como base para pipelines de agentes que encadenan llamadas a funciones.
- Auditoría de seguridad en generación de código: los datos de codesafetybench permiten evaluar si el modelo evita sugerir código inseguro o malicioso en asistentes de programación.
- Punto de partida para continuar el RL: al publicarse con estado intermedio y receta completa, investigadores pueden reanudar el entrenamiento o aplicar variantes de recompensa.
- Estudio de dinámicas de recompensa y colapso: la caída observada en magicoder (de 0.76 a 0.26) entre ventanas es un caso de estudio sobre olvido catastrófico inducido por RL.
- Prototipado de asistentes con modo thinking: útil para experimentar con razonamiento explícito antes de la respuesta en tareas de consejo difícil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la puntuación media de recompensa binaria del juez durante el entrenamiento:

| Ventana | Puntuacion media | Rollouts juzgados |
|---|---|---|
| Actualizaciones 790-800 | 0.808 | 1200 |
| Actualizaciones 830-840 | 0.815 | 1200 |

Desglose por conjunto de datos:

| Dataset | Actualizaciones 790-800 | Actualizaciones 830-840 |
|---|---|---|
| agentalign_benign | 0.61 | 0.62 |
| agentalign_harmful | 0.90 | 0.95 |
| codesafetybench | 0.85 | 0.93 |
| difficult_advice | 0.81 | 0.88 |
| magicoder | 0.76 | 0.26 |
| star1_gp3 | 0.97 | 0.96 |
| star_benign_v2 | 0.84 | 0.83 |
| wildjailbreak_benign | 0.86 | 0.86 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 16-24 GB para contexto largo.
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento), A100 40/80 GB, H100; para inferencia basta una RTX 4090 (24 GB) en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) con bf16 y gestión cuidadosa del contexto; en GPUs de 16 GB requeriría cuantización, no documentada oficialmente.
- Opciones de despliegue: transformers (carga nativa con `Qwen3_5ForConditionalGeneration`), SGLang (usado en los rollouts), vLLM y TGI previsiblemente compatibles al seguir la interfaz de Qwen3.5; llama.cpp/Ollama requerirían conversión a GGUF, no disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO (este) | 4,66 B | 40.960 | Apache 2.0 | Checkpoint intermedio de RL de seguridad, multimodal heredado |
| Qwen/Qwen3.5-4B-Base | 4,66 B | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa |
| Alternativas de seguridad de ~4B | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información sobre otros modelos de seguridad del mismo tamaño con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualización 840 de 1574 previstas): no es un modelo final y su comportamiento puede ser inestable.
- Se observa una caída severa en magicoder (de 0.76 a 0.26 entre ventanas), indicativa de olvido catastrófico o colapso de la recompensa en ese dominio; no debe usarse en producción para generación de código general sin evaluación propia.
- El rendimiento en agentalign_benign es bajo (0.61-0.62), lo que sugiere dificultades para mantener utilidad en trayectorias benignas de herramientas.
- Riesgo de alucinación no cuantificado; no hay benchmarks de fidelidad ni de razonamiento factual.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- La torre de visión no fue entrenada: las capacidades de imagen son las del base y no están alineadas en seguridad.
- La recompensa depende de un juez LLM (Qwen3.8-27B) con veredicto binario estricto, lo que puede introducir sesgos del juez en el comportamiento aprendido.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación de seguridad externa, su uso en producción conlleva riesgo reputacional y de cumplimiento.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step840
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
