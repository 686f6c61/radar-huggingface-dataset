# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base, publicado por el usuario thkim0305-SNU. El modelo aplica GRPO (Group Relative Policy Optimization) con recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B, sobre un conjunto de prompts denominado "mixture-8" que combina datos de seguridad, uso de herramientas y código. El checkpoint corresponde a 320 actualizaciones del optimizador (iteración Megatron 319) de un entrenamiento que aún está en curso.

El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP intactas; solo se ha entrenado el modelo de lenguaje. Los pesos se exportan en bf16 y el checkpoint carga exactamente igual que el modelo base. Su relevancia radica en que documenta de forma transparente la receta de RL de seguridad y la evolución de las recompensas por dataset, lo que resulta útil para investigadores que estudian alineamiento y robustez frente a jailbreaks.

Al ser un snapshot intermedio y no un modelo final, su uso en producción no está recomendado. No obstante, sirve como referencia metodológica para tuning de seguridad con GRPO, incluyendo rollouts multi-turno de uso de herramientas y evaluación con juez automático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/rollout) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales. La exportación se realizó desde un checkpoint Megatron torch_dist (`iter_0000319`) mediante `safety_tuning.hf_export`, con refusión de proyecciones GDN, mapeo de nombres Slime Qwen3.5 y dtypes alineados al índice del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts SGLang colocados) más Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0.9/0.95), weight decay 0.1 y grad clip 1.0. Se aplica una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. El chat template de Qwen se usa con `enable_thinking=true`, y los rollouts de herramientas emplean function calling `qwen3_coder`. El juez es Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El schedule cubre una época con padding sobre 11.794 prompts únicos, es decir, 787 actualizaciones, con checkpoints cada 80.

El dataset "mixture-8" se compone de star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con chat template de Qwen y modo thinking (`enable_thinking=true`).
- Razonamiento con cadena de pensamiento antes de la respuesta final.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`.
- Ejecución de trayectorias multi-turno de agente contra simulador de herramientas.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no fue entrenada en este proceso.
- Generación de código, según el dataset magicoder incluido en el entrenamiento.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas y manejo de jailbreaks (wildjailbreak_benign, star_benign_v2).
- Capacidades multilingües: no disponibles (no se documentan).

## Casos de uso

- Investigación en alineamiento de seguridad: el checkpoint permite estudiar la evolución de la recompensa del juez por dataset a lo largo de las actualizaciones (de 0.417 en 0-10 a 0.837 en 310-320), útil para analizar dinámicas de GRPO.
- Evaluación de robustez frente a jailbreaks: entrenado con wildjailbreak_benign y star_benign_v2, sirve como punto de comparación frente al base en pruebas de red teaming.
- Análisis de seguridad en código: el dataset codesafetybench (recompensa 0.47 a 0.89) permite evaluar cómo el RL modifica la generación de código potencialmente peligroso.
- Estudio de agentes con herramientas: los 4.000 prompts de AgentAlign con herramientas sintéticas permiten reproducir trayectorias multi-turno y analizar el comportamiento del modelo en entornos simulados.
- Baseline para tuning de seguridad: al ser un snapshot intermedio, es útil como referencia para comparar recetas (LR, KL, número de rollouts) en experimentos propios.
- Reproducción metodológica: la model card detalla framework (Slime + Megatron), hiperparámetros y composición del dataset, lo que facilita replicar el pipeline en otros modelos base.
- Evaluación con juez automático: el uso de un juez Qwen3.8-27B con veredicto binario sirve como ejemplo de pipeline de recompensa para RL de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la recompensa media del juez durante el entrenamiento:

| Ventana de actualizaciones | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0.417 | 1200 |
| 70-80 | 0.578 | 1200 |
| 150-160 | 0.708 | 1200 |
| 230-240 | 0.768 | 1200 |
| 310-320 | 0.837 | 1200 |

| Dataset | 0-10 | 70-80 | 150-160 | 230-240 | 310-320 |
|---|---|---|---|---|---|
| agentalign_benign | 0.41 | 0.48 | 0.60 | 0.54 | 0.66 |
| agentalign_harmful | 0.63 | 0.88 | 0.94 | 0.85 | 0.89 |
| codesafetybench | 0.47 | 0.78 | 0.80 | 0.83 | 0.89 |
| difficult_advice | 0.28 | 0.30 | 0.69 | 0.78 | 0.90 |
| magicoder | 0.51 | 0.34 | 0.38 | 0.58 | 0.75 |
| star1_gp3 | 0.57 | 0.78 | 0.82 | 0.93 | 0.95 |
| star_benign_v2 | 0.27 | 0.54 | 0.83 | 0.83 | 0.76 |
| wildjailbreak_benign | 0.27 | 0.45 | 0.61 | 0.79 | 0.79 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100, B200 (el entrenamiento se realizó en dos B200). Para inferencia en bf16 con contexto de 40.960 tokens se aconseja A100 80 GB o H100.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contexto moderado; en cuantización de 8 bits o 4 bits cabría en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: transformers (referencia en la model card), vLLM, SGLang (usado en rollouts), TGI; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO (este) | 4,66 B | 40.960 | RL de seguridad con GRPO, snapshot intermedio | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B-Base | 4,66 B (aprox.) | no disponible en la información | Modelo base multimodal sin tuning de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de tuning de seguridad de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (320 de 787 actualizaciones), no un modelo final; el entrenamiento seguía en curso en el momento de la exportación.
- Riesgo de alucinación inherente al modelo base, no cuantificado en la información disponible.
- Sesgos del modelo base Qwen3.5-4B-Base no documentados; el tuning de seguridad no garantiza eliminación de sesgos.
- Idiomas soportados no especificados; el comportamiento multilingüe no está validado.
- El uso de un juez automático (Qwen3.8-27B) con recompensa binaria puede introducir sesgos del juez y comportamientos de "reward hacking" no analizados.
- Las recompensas reportadas son del propio juez durante el entrenamiento, no de benchmarks independientes; no deben interpretarse como rendimiento absoluto.
- Aunque la licencia es Apache 2.0, el uso comercial de un checkpoint intermedio de seguridad no validado no está recomendado.
- La torre de visión y la cabeza MTP no fueron entrenadas; su comportamiento tras el tuning del LLM no está evaluado.
- No se documentan cuantizaciones oficiales ni formatos GGUF; el despliegue en producción requeriría validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step320
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/thkim0305-SNU
