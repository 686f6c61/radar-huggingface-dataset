# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step40

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step40 es un checkpoint intermedio de ajuste fino orientado a seguridad sobre Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. No es un modelo final: se trata de una instantánea tomada tras 40 actualizaciones de optimizador (iteración Megatron 39) dentro de un proceso de RL de seguridad que aún está en curso. El modelo parte de un SFT previo del mismo autor y aplica GRPO con recompensas binarias evaluadas por un juez externo.

El interés técnico radica en su receta de alineamiento: GRPO con normalización de grupo, recorte PPO de 0.2, importancia sampling truncado (TIS) y una penalización KL de baja varianza frente al checkpoint de partida. El conjunto de prompts ("mixture-8") combina datos de seguridad en código, prompts benignos de jailbreak, consejo difícil y trayectorias agénticas con herramientas simuladas, lo que convierte al modelo en un caso de estudio de cómo se comporta el RL de seguridad sobre un modelo multimodal de 4.660 millones de parámetros.

Arquitectura transformer densa (familia Qwen3.5), pesos en bf16 con torre de visión y cabeza MTP intactas (solo se entrenó el modelo de lenguaje), ventana de contexto de 40.960 tokens durante el entrenamiento y licencia Apache 2.0. Su relevancia ahora es como artefacto de investigación reproducible para estudiar la dinámica de recompensas de seguridad a lo largo del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 con 4.660 millones de parámetros, empaquetado como `Qwen3_5ForConditionalGeneration`. Incluye una torre de visión y una cabeza MTP (multi-token prediction) que permanecen con los pesos originales del modelo base: solo se entrenó el modelo de lenguaje. El checkpoint se exportó desde Megatron (`torch_dist`, `iter_0000039`) re-fusionando las proyecciones GDN, aplicando el mapeo de nombres de Slime para Qwen3.5 y copiando los pesos de visión y MTP del base.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, recorte PPO de 0.2, TIS activado, learning rate constante de 1e-6 con AdamW (betas 0.9/0.95, weight decay 0.1, grad clip 1.0) y una pérdida KL de baja varianza con coeficiente 0.001 frente al checkpoint congelado de partida. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con temperatura 1.0, top-p 1, hasta 32.768 tokens generados y plantilla de chat Qwen con `enable_thinking=true`; los rollouts con herramientas usan function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; en los prompts de AgentAlign se juzga toda la trayectoria visible de uso de herramientas. El plan completo cubre una época sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. La infraestructura fue de 4× H100 80GB (juez con TP2 en GPUs 4-5, entrenador en GPU 6 con estado del optimizador en CPU, motor de rollout en GPU 7).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen.
- Modo de razonamiento explícito (`enable_thinking=true`) heredado del modelo base.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque la torre de visión no fue entrenada en este ajuste.
- Tool calling / function calling mediante el formato `qwen3_coder`.
- Razonamiento agéntico multi-paso con trayectorias de uso de herramientas (entrenado explícitamente sobre AgentAlign).
- Generación de código, con exposición a datos de seguridad en código (codesafetybench, magicoder).
- Comportamiento alineado en seguridad: rechazo de peticiones dañinas y manejo de jailbreaks benignos.
- Capacidades multilingües: no disponibles (no se documentan en la información proporcionada).

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como punto de comparación intermedio (40 actualizaciones) frente al SFT de partida y a checkpoints posteriores para estudiar la evolución de la recompensa del juez por conjunto de datos.
- Evaluación de robustez ante jailbreaks: el modelo ha visto wildjailbreak_benign y star_benign_v2, por lo que es útil para medir falsos rechazos sobre prompts benignos con formato de ataque.
- Auditoría de seguridad en generación de código: con exposición a codesafetybench y magicoder, puede emplearse en pipelines que detecten sugerencias de código inseguro y evalúen la tasa de rechazo.
- Agentes con herramientas en entornos simulados: su entrenamiento con AgentAlign y function calling `qwen3_coder` permite probar políticas de uso de herramientas en tareas multi-turno antes de desplegar un modelo mayor.
- Consejo sensible (difficult_advice): útil para evaluar la calidad y seguridad de respuestas a consultas delicadas de asesoramiento, comparando contra el modelo base.
- Base para experimentos de RL reproducible: al publicarse pesos, receta e hiperparámetros, se puede reanudar o replicar el entrenamiento GRPO sobre la misma mezcla de datos en clústeres pequeños (4× H100).
- Prototipado de asistentes multimodales: aunque la visión no se entrenó, la arquitectura carga igual que el base y permite experimentar con entradas imagen-texto sin reentrenar la torre visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo reporta la recompensa media binaria del juez durante el entrenamiento:

| Ventana | Recompensa media | Rollouts juzgados |
|---|---|---|
| Actualizaciones 0-10 | 0,735 | 1200 |
| Actualizaciones 30-40 | 0,718 | 1200 |

Desglose por conjunto de datos (recompensa binaria media):

| Dataset | Actualizaciones 0-10 | Actualizaciones 30-40 |
|---|---|---|
| agentalign_benign | 0,48 | 0,49 |
| agentalign_harmful | 0,96 | 0,94 |
| codesafetybench | 0,65 | 0,89 |
| difficult_advice | 0,88 | 0,90 |
| magicoder | 0,38 | 0,26 |
| star1_gp3 | 0,77 | 0,94 |
| star_benign_v2 | 0,72 | 0,64 |
| wildjailbreak_benign | 0,68 | 0,63 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB de pesos (no se publican GGUF oficiales; requeriría conversión propia).
- GPU recomendadas: H100 80GB o A100 80GB para el pipeline completo de entrenamiento (el autor usó 4× H100); para inferencia basta una RTX 4090 (24 GB) o RTX 3090 (24 GB) en bf16.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con contexto reducido, y en GPUs de 12 GB si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo, `Qwen3_5ForConditionalGeneration`), vLLM y SGLang (usados en los rollouts del entrenamiento), TGI; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO (este) | 4,66 B | 40.960 (entrenamiento) | Apache 2.0 | Checkpoint intermedio de RL de seguridad; sin benchmarks estándar |
| Qwen3.5-4B-Base (modelo base) | ~4 B (no confirmado en la información) | no disponible | Apache 2.0 | Sin ajuste de seguridad; referencia de partida |
| SFT365 del mismo autor (modelo base de este checkpoint) | 4,66 B | no disponible | Apache 2.0 | Etapa SFT previa al RL; comparable directo para medir el efecto del GRPO |
| Alternativas de seguridad de ~4 B de otras familias | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el entrenamiento seguía en curso y la calidad puede degradarse o cambiar en iteraciones posteriores.
- La recompensa media global bajó ligeramente entre las ventanas 0-10 y 30-40 (0,735 → 0,718), con caídas claras en magicoder (0,38 → 0,26), star_benign_v2 (0,72 → 0,64) y wildjailbreak_benign (0,68 → 0,63): posible sobreajuste al juez o aumento de falsos rechazos.
- El juez de recompensa es un modelo (Qwen3.8-27B) con veredicto binario estricto; sus sesgos se transfieren al comportamiento aprendido.
- Riesgo de alucinación no cuantificado: no hay benchmarks de veracidad ni de conocimiento.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe equilibrado.
- La torre de visión y la cabeza MTP no se entrenaron: las capacidades de imagen son las del base, sin ajuste de seguridad específico para entradas visuales.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluación de producción, no se recomienda su despliegue directo en sistemas expuestos a usuarios sin una batería de pruebas propia.
- El repositorio tiene 0 descargas y 0 likes: no hay validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT365-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step40
- Checkpoint SFT de partida: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-SFT-Mixture8-genv2gp3-lr1e-5-step365
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
