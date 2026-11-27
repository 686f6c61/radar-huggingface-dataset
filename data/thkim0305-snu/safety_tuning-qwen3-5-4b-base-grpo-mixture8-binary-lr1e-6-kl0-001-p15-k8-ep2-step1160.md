# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1160

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1160 es un checkpoint intermedio de ajuste fino por refuerzo (RL) orientado a seguridad, construido sobre Qwen/Qwen3.5-4B-Base. Lo desarrolla el usuario thkim0305-SNU dentro de un proyecto de safety tuning que combina GRPO sobre recompensas binarias con un juez externo (Qwen3.8-27B) que emite veredictos 0/1 según la especificación del proyecto. El modelo no es un producto final: es una instantánea del entrenamiento tras 1160 actualizaciones del optimizador (iteración Megatron 1159), con el entrenamiento todavía en curso.

El modelo conserva la arquitectura multimodal del base Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`, con torre de visión y cabeza MTP), aunque solo se ha entrenado la parte del modelo de lenguaje; los pesos de visión y MTP son los originales sin tocar. Con 4.659.865.088 parámetros totales en bf16 y un contexto de entrenamiento de 40960 tokens, está pensado para experimentación en alineación de seguridad, no para despliegue en producción.

Su relevancia es metodológica: documenta con detalle la receta (Slime + Megatron-LM, 15 prompts x 8 rollouts por actualización, KL de baja varianza con coeficiente 0.001, clip PPO 0.2, TIS activado) y publica la evolución de las puntuaciones del juez por dataset a lo largo del entrenamiento, lo que permite auditar la dinámica de la recompensa en tareas de seguridad, uso de herramientas y código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP sin entrenar |
| Parametros totales | 4.659.865.088 (bf16) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40960 tokens en entrenamiento; contexto nativo del base no disponible en la informacion |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura completa: un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). El ajuste RL solo afecta al modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos del base, de modo que el checkpoint se carga exactamente igual que el modelo original mediante `Qwen3_5ForConditionalGeneration`.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización emplea 15 prompts x 8 rollouts (120 secuencias), learning rate constante de 1e-6, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0 y una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado. El muestreo usa temperatura 1.0, top-p 1, hasta 32768 tokens generados y 40960 de contexto, con plantilla de chat Qwen y `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto, y los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El plan es una época sobre 11794 prompts únicos (1574 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1000 prompts), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. Este checkpoint corresponde a la época 2 de la ejecución lr1e-6, reanudada en la actualización 787 desde su checkpoint final (modelo, estado del optimizador y RNG) con un nuevo barajado de prompts (semilla 43).

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable mediante plantilla de chat (`enable_thinking=true`).
- Capacidades multimodales heredadas del base (image-text-to-text), aunque la torre de visión no se ha entrenado en este ajuste.
- Uso de herramientas y function calling en formato `qwen3_coder`, con soporte de trayectorias multiturno contra un simulador de herramientas.
- Comportamiento alineado en seguridad: rechazo de peticiones dañinas y respuesta útil a peticiones benignas, entrenado con pares harmful/benign (AgentAlign, WildJailbreak benigno, Star benigno).
- Seguridad en generación de código, con entrenamiento específico sobre CodeSafetyBench y Magicoder.
- Consejo en situaciones difíciles, cubierto por el dataset difficult_advice (1982 prompts).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en alineación de seguridad: sirve como checkpoint intermedio para estudiar la dinámica de recompensas binarias con juez externo y comparar curvas de aprendizaje por dataset a lo largo de las actualizaciones.
- Evaluación de robustez frente a jailbreaks: el entrenamiento con wildjailbreak_benign y star_benign_v2 permite medir la tasa de rechazo ante prompts adversarios manteniendo utilidad en benignos.
- Auditoría de seguridad en asistentes con herramientas: los 4000 prompts de AgentAlign con definiciones sintéticas permiten evaluar si el modelo rechaza trayectorias dañinas de uso de herramientas sin bloquear las legítimas.
- Filtrado y revisión de código generado: el ajuste sobre CodeSafetyBench y Magicoder lo hace adecuado para experimentar con detección de código inseguro en pipelines de revisión, siempre como componente de investigación.
- Generación de respuestas de asesoramiento sensible: el dataset difficult_advice entrena respuestas prudentes en consultas delicadas, útil para prototipar sistemas de orientación con salvaguardas.
- Baseline para comparativas de safety tuning: al ser un snapshot con receta reproducible (Slime + Megatron, hiperparámetros documentados), sirve como punto de referencia frente a otros métodos de RLHF/DPO en modelos de 4B.
- Estudio de multimodalidad parcial: permite analizar cómo afecta el ajuste solo del modelo de lenguaje a las capacidades de visión heredadas del base, sin reentrenar la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí publica la puntuación media del juez (recompensa binaria bruta antes de normalización por grupo) a lo largo del entrenamiento:

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
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

Desglose por dataset en la ventana final (1150-1160): agentalign_benign 0.68, agentalign_harmful 0.93, codesafetybench 0.99, difficult_advice 0.88, magicoder 0.59, star1_gp3 0.94, star_benign_v2 0.96, wildjailbreak_benign 0.89. Destaca la volatilidad de magicoder (oscila entre 0.26 y 0.87 en ventanas intermedias) y la brecha persistente en agentalign_benign, que se mantiene por debajo de 0.73 en todas las ventanas registradas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (el tamaño del repo es de 9,3 GB); con caché KV para 40960 tokens de contexto, el consumo real será considerablemente mayor y depende del batch.
- Cuantización: no se publican pesos GGUF ni cuantizados; para reducir VRAM habría que convertir los safetensors a bf16/fp16 con herramientas externas, sin garantía de soporte oficial.
- GPU recomendadas: el entrenamiento se realizó con 1x NVIDIA B200 para el entrenador y el motor de rollouts, y 2x A100 (SGLang TP2) para el juez Qwen3.8-27B. Para inferencia del modelo de 4B en bf16 son suficientes GPU con 24 GB o más (RTX 4090, L40S, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en bf16 en una RTX 4090 (24 GB) para contextos moderados; en contextos largos cercanos a 40960 tokens puede requerir reducir batch o usar cuantización.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` (soporte confirmado en la model card); vLLM, llama.cpp, Ollama y TGI no se mencionan como soportados en la información disponible y dependerían del soporte de Qwen3.5 en cada herramienta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | 40960 en entrenamiento | Apache 2.0 | Checkpoint intermedio, entrenamiento en curso | Ajuste RL de seguridad con GRPO y juez binario |
| Qwen/Qwen3.5-4B-Base | 4B (aprox., según nombre) | no disponible en la información | Apache 2.0 | Modelo base final | Sin ajuste de seguridad; referencia directa de partida |
| Qwen3.8-27B (juez) | 27B (aprox., según nombre) | no disponible | no disponible | Usado como juez en el entrenamiento | No es un competidor directo; sirve de referencia de escala |

No se dispone de datos de benchmarks comparativos con otras alternativas de la misma categoría (modelos de 4B con safety tuning) en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento sigue en curso y el autor lo declara explícitamente como snapshot.
- La recompensa depende de un juez automático (Qwen3.8-27B) con veredicto binario; puede heredar sesgos y errores del juez, y el modelo puede sobreajustarse a su criterio.
- La puntuación en agentalign_benign se mantiene baja (0,61-0,73), lo que sugiere posibles rechazos excesivos o respuestas pobres en escenarios benignos con herramientas.
- Alta volatilidad en magicoder (0,26-0,87): el comportamiento en generación de código puede ser inestable entre checkpoints.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad; al ser un modelo base con RL de seguridad, no se ha optimizado para veracidad.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá del base.
- La torre de visión y la cabeza MTP no se han entrenado; las capacidades multimodales son las del base sin ajuste de seguridad, lo que puede crear asimetrías entre modalidades.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluaciones de seguridad independientes, no se recomienda su despliegue en producción sin auditoría adicional.
- Los pesos están en bf16 safetensors sin cuantizaciones oficiales; el despliegue eficiente requiere conversión manual y verificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step1160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Framework Slime: no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
- Paper o blog del proyecto: no disponible en la información proporcionada
