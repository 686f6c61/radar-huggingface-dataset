# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1280

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un checkpoint intermedio de ajuste fino de seguridad sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. Se trata de un modelo multimodal de tipo image-text-to-text (arquitectura Qwen3.5 con torre de visión y cabeza MTP) cuya parte de lenguaje ha sido entrenada mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) sobre un conjunto de prompts denominado "mixture-8", orientado a alinear el comportamiento del modelo en escenarios de seguridad, uso de herramientas y código.

El checkpoint corresponde a 1280 actualizaciones del optimizador (iteración Megatron 1279) dentro de un entrenamiento que sigue en curso según el autor. No es un modelo final, sino una instantánea exportada a mitad del proceso. El objetivo es mejorar la robustez frente a prompts dañinos, el comportamiento en trayectorias multi-turno con herramientas y la calidad en tareas de código, usando recompensas binarias (0/1) emitidas por un juez Qwen3.8-27B.

Con 4.659.865.088 parámetros reales y licencia Apache 2.0, es relevante para quienes investigan alineación de seguridad con RL a escala media y quieran reproducir o inspeccionar el efecto de GRPO sobre un modelo base de 4B con capacidades multimodales y de razonamiento extendido (thinking mode).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 multimodal (Qwen3_5ForConditionalGeneration), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 40960 tokens (contexto de entrenamiento); no confirmado para inferencia |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, una arquitectura transformer multimodal de la familia Qwen3.5 que incluye una torre de visión y una cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje: la torre de visión y la cabeza MTP conservan los pesos originales del base, por lo que el checkpoint carga exactamente igual que el modelo de referencia mediante `Qwen3_5ForConditionalGeneration`.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, PPO clip de 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización usa 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0.9/0.95), weight decay 0.1, grad clip 1.0 y una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo congelado de partida. El muestreo usa temperatura 1.0, top-p 1, hasta 32768 tokens generados y 40960 de contexto, con plantilla de chat Qwen y `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre la trayectoria completa de herramientas visible. El schedule cubre una época con padding sobre 11794 prompts únicos (1574 actualizaciones), con checkpoints cada 40 actualizaciones. El conjunto "mixture-8" combina star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997); 4000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador (salidas de herramienta enmascaradas en la pérdida).

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento multi-paso con hasta 32768 tokens generados en el entrenamiento.
- Entrada multimodal image-text-to-text (la torre de visión se mantiene intacta respecto al base).
- Tool calling / function calling mediante el formato `qwen3_coder`, con soporte de trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a agentes: los prompts de AgentAlign se entrenan como trayectorias completas de uso de herramientas.
- Alineación de seguridad: rechazo de peticiones dañinas, robustez ante jailbreaks benignos y manejo de consejos delicados.
- Generación y revisión de código con foco en seguridad (codesafetybench, magicoder).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación con RL: sirve como checkpoint intermedio para estudiar la evolución de la recompensa del juez a lo largo de las actualizaciones (de 0.808 a 0.838 en la ventana final) y comparar con el modelo base.
- Filtrado de seguridad en pipelines de generación: el modelo puede actuar como generador con rechazo integrado en asistentes conversacionales, aprovechando su entrenamiento en star1_gp3 y difficult_advice para peticiones delicadas.
- Agentes con herramientas en entornos simulados: sus rollouts de AgentAlign lo hacen adecuado para prototipos de agentes que deben decidir cuándo invocar funciones y cómo encadenar llamadas en varios turnos.
- Asistentes de código con conciencia de seguridad: entrenado con codesafetybench y magicoder, puede emplearse para generar código y señalar prácticas inseguras en revisiones automatizadas.
- Evaluación de robustez frente a jailbreaks: útil como sujeto de pruebas en bancos de red teaming, dado el entrenamiento con wildjailbreak_benign y star_benign_v2.
- Base para ajuste posterior específico de dominio: al conservar la torre de visión y la cabeza MTP del base y publicarse en Apache 2.0, puede servir de punto de partida para fine-tuning supervisado o DPO en tareas concretas.
- Docencia y reproducibilidad: la receta completa (Slime + Megatron, hiperparámetros, composición del dataset) permite replicar el experimento en laboratorios con hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta la recompensa media binaria del juez durante el entrenamiento:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
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
| 1270-1280 | 0.838 | 1200 |

Desglose por dataset en la ventana final (1270-1280): agentalign_benign 0.68, agentalign_harmful 0.88, codesafetybench 0.92, difficult_advice 0.92, magicoder 0.53, star1_gp3 0.88, star_benign_v2 0.98, wildjailbreak_benign 0.88. Destaca la alta varianza en magicoder (0.26 a 0.87 a lo largo del entrenamiento), lo que sugiere inestabilidad en la tarea de código.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica se recomiendan 16-24 GB para contexto moderado.
- Cuantización: no se publican versiones GGUF ni cuantizadas; habría que generarlas a partir de los safetensors.
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA B200 para el trainer y 2× A100 (SGLang TP2) para el juez. Para inferencia, una A100 40/80 GB, H100 o L40S ofrecen margen amplio; una RTX 4090 (24 GB) es viable en bf16 con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) o RTX 4080 (16 GB) con contexto limitado y posible cuantización a 8 bits.
- Opciones de despliegue: transformers (referencia del autor), vLLM y SGLang (usados en el entrenamiento), TGI; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | 40960 (entrenamiento) | Seguridad + agentes + código vía GRPO | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables publicados para situar este checkpoint frente a otros modelos de seguridad del mismo tamaño.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el entrenamiento sigue en curso y no representa el modelo final; el autor lo indica explícitamente.
- La recompensa del juez no es monótona: oscila entre 0.808 y 0.877 y en la ventana final baja a 0.838, con caídas notables en magicoder (0.53) y agentalign_benign (0.68).
- Riesgo de sobreajuste al juez Qwen3.8-27B y a la especificación del proyecto: las métricas reflejan el criterio de un juez concreto, no calidad general.
- Sesgos conocidos: no documentados en la información disponible; al derivar del base Qwen3.5, hereda los sesgos de sus datos de preentrenamiento.
- Riesgo de alucinación: no cuantificado; el modo thinking y la generación larga (hasta 32768 tokens) pueden aumentar la verbosidad y las afirmaciones no verificadas.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está garantizado.
- Solo se ha entrenado el modelo de lenguaje: las capacidades de visión no se han ajustado y pueden no alinearse con el comportamiento de seguridad del resto.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación de producción, se desaconseja su despliegue directo sin auditoría adicional.
- El formato de function calling `qwen3_coder` y la plantilla de chat con `enable_thinking=true` deben respetarse para reproducir el comportamiento entrenado.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1280
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Repositorio del autor: https://huggingface.co/thkim0305-SNU
- Paper de GRPO, framework Slime, Megatron-LM, SGLang y datasets (star1_gp3, AgentAlign, CodeSafetyBench, Magicoder, WildJailbreak): no disponibles en la información proporcionada.
