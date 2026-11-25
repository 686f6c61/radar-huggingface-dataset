# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step800

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step800 es un checkpoint intermedio de ajuste fino por aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se optimiza al modelo para que responda de forma segura ante peticiones dañinas (jailbreaks, contenido peligroso, uso malicioso de herramientas) sin degradar su utilidad en peticiones benignas. No es un modelo final, sino una instantánea en el paso 800 de un entrenamiento que sigue en curso.

El modelo conserva la arquitectura completa del base Qwen3.5-4B (transformador multimodal con torre de visión y cabeza MTP), pero solo se han entrenado los pesos del modelo de lenguaje; la torre de visión y la cabeza MTP permanecen intactas. Cuenta con 4.659.865.088 parámetros totales en bf16 y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su experimentación.

Su relevancia es doble: por un lado, documenta con detalle una receta reproducible de RL para seguridad (GRPO con recompensas binarias, juez externo Qwen3.8-27B, KL bajo, TIS activado) sobre un conjunto de prompts mixto que incluye trayectorias de uso de herramientas; por otro, sirve como referencia práctica para quien quiera evaluar el efecto de un ajuste de seguridad sobre un modelo base de 4B sin perder capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformador multimodal (Qwen3.5) con torre de visión y cabeza MTP; solo se entrena el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 40.960 tokens (usado en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformador multimodal con torre de visión y cabeza de predicción multi-token (MTP). El ajuste se realizó con GRPO (Group Relative Policy Optimization) con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y muestreo por importancia truncado (TIS) activado. El framework empleado fue Slime (con rollouts SGLang colocados) junto con Megatron-LM en bf16. Cada actualización usó 15 prompts con 8 rollouts por prompt (120 secuencias), tasa de aprendizaje constante de 1e-6 con AdamW (betas 0,9/0,95), weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo congelado de partida. El muestreo usó temperatura 1,0, top-p 1 y hasta 32.768 tokens generados con contexto de 40.960. Se activó `enable_thinking=true` en la plantilla de chat y se empleó el function calling `qwen3_coder` para los rollouts con herramientas.

La recompensa proviene de un juez externo Qwen3.8-27B que emite un veredicto binario estricto (0/1) según la especificación del proyecto; en los prompts de AgentAlign se juzga la trayectoria completa de uso de herramientas. El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El entrenamiento se ejecutó en una NVIDIA B200 para entrenador y motor de rollout, con el juez en 2x A100 (SGLang TP2) sobre un túnel SSH. Este checkpoint corresponde a la época 2, reanudada en la actualización 787 con nueva semilla de mezcla (43), y exportada desde Megatron `iter_0000799` mediante `safety_tuning.hf_export`.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-paso con tokens de pensamiento intermedios.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, incluyendo trayectorias multiturno contra un simulador.
- Comportamiento orientado a agentes: el entrenamiento incluye rollouts de AgentAlign con definiciones sintéticas de herramientas.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no fue entrenada en este ajuste.
- Alineamiento de seguridad: rechazo de peticiones dañinas, resistencia a jailbreaks y comportamiento seguro en código y consejo sensible.
- Capacidades multilingües: no disponible (no se especifican idiomas en la model card).

## Casos de uso

- Moderación y filtrado de respuestas en asistentes conversacionales: el modelo puede actuar como generador principal en un pipeline de atención al cliente donde las respuestas deben cumplir políticas de seguridad, gracias a su alineamiento específico en `wildjailbreak_benign`, `star_benign_v2` y `difficult_advice`.
- Agentes con uso de herramientas en entornos controlados: su entrenamiento con 4.000 prompts de AgentAlign y function calling `qwen3_coder` lo hace adecuado para prototipos de agentes que deben decidir cuándo invocar una herramienta y cómo responder a la salida simulada.
- Evaluación de recetas de RL para seguridad: sirve como checkpoint de referencia para comparar el efecto de GRPO con recompensas binarias frente a otros métodos (DPO, RLHF) sobre un base de 4B.
- Generación de código con salvaguardas: el entrenamiento incluye `codesafetybench` y `magicoder`, por lo que puede emplearse en asistentes de programación que deban evitar sugerencias inseguras o maliciosas.
- Investigación en alineamiento y robustez: útil para estudiar la degradación de capacidades benignas tras un ajuste de seguridad (el score de `agentalign_benign` en la ventana 790-800 es 0,61, notablemente inferior al de `agentalign_harmful`, 0,90).
- Despliegue en hardware de gama alta para experimentación: con 4,66B parámetros en bf16 y 9,3 GB de repo, cabe en una GPU de 24 GB en cuantización de 8 bits o en una A100/H100 en bf16 para pruebas de inferencia y evaluación.
- Base para ajuste adicional específico de dominio: al ser Apache 2.0 y cargar exactamente como el base, puede servir de punto de partida para fine-tuning supervisado posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la recompensa media del juez durante el entrenamiento (media binaria bruta antes de normalización por grupo), en la ventana de actualizaciones 790-800, con 1.200 rollouts juzgados:

| Ventana | Score medio | Rollouts juzgados |
|---|---|---|
| Actualizaciones 790-800 | 0,808 | 1.200 |

| Dataset | Score en actualizaciones 790-800 |
|---|---|
| agentalign_benign | 0,61 |
| agentalign_harmful | 0,90 |
| codesafetybench | 0,85 |
| difficult_advice | 0,81 |
| magicoder | 0,76 |
| star1_gp3 | 0,97 |
| star_benign_v2 | 0,84 |
| wildjailbreak_benign | 0,86 |

Estos valores son recompensas del juez interno del proyecto, no métricas de benchmarks públicos, y no son directamente comparables con resultados de MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado y más para contextos cercanos a 40.960 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para bf16 con contexto largo; B200 fue la GPU usada en el entrenamiento. Para pruebas, una RTX 4090 (24 GB) es suficiente en bf16 con contexto moderado o en 8 bits con contexto largo.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 con contexto moderado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (código de ejemplo en la model card), vLLM y SGLang (usado en los rollouts del entrenamiento), llama.cpp/Ollama si se generan pesos GGUF (no publicados), TGI.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | 40.960 | Ajuste de seguridad con GRPO y recompensas binarias | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | 4,66B (aprox., según base) | no disponible en la información | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks públicos ni de otros modelos de seguridad comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 800 de 1.574 actualizaciones previstas en una época), no un modelo final; su comportamiento puede ser inestable y no está validado para producción.
- El score de `agentalign_benign` (0,61) es bajo en comparación con el resto de datasets, lo que sugiere posible sobre-rechazo o degradación en tareas benignas con herramientas.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-4B-Base, hereda los sesgos del base, no documentados aquí.
- Idiomas soportados no especificados; el comportamiento multilingüe no está garantizado ni evaluado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye "tal cual" y el autor no ofrece garantías; conviene revisar la licencia del base Qwen3.5-4B-Base enlazada en la model card.
- El modo `enable_thinking=true` genera tokens de razonamiento que aumentan la latencia y el consumo de tokens; en producción debe evaluarse el coste.
- El juez de recompensa es un modelo externo (Qwen3.8-27B) con criterios binarios estrictos; el alineamiento está optimizado para esa especificación y puede no generalizar a otras políticas de seguridad.
- La torre de visión y la cabeza MTP no fueron entrenadas; su comportamiento multimodal no ha sido validado tras el ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step800
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
