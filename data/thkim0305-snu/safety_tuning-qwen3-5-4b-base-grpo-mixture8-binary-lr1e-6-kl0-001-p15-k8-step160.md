# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step160

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step160 es un checkpoint intermedio de ajuste fino con aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad: reducir respuestas dañinas y mejorar el comportamiento del modelo en escenarios de riesgo, incluyendo uso de herramientas en trayectorias multi-turno. No es un modelo final, sino una instantánea del paso 160 de un entrenamiento que sigue en curso (787 actualizaciones planificadas).

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B (clase `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP intactas; solo se entrenó el modelo de lenguaje. Los pesos se exportan en bf16 y el checkpoint carga exactamente igual que el modelo base, lo que facilita su evaluación comparativa directa. Cuenta con 4.659.865.088 parámetros totales y un repositorio de 9,3 GB.

Su relevancia es metodológica: documenta de forma transparente la receta de RL de seguridad (GRPO con recompensas binarias, juez Qwen3.8-27B, KL bajo, TIS activado) y la evolución de las puntuaciones del juez por conjunto de datos a lo largo del entrenamiento. Es útil para investigadores que estudian dinámicas de safety tuning, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); solo se entrenó el modelo de lenguaje |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto del base no especificado) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). En este checkpoint solo se actualizaron los pesos del modelo de lenguaje; la torre de visión y la cabeza MTP son los pesos originales del base sin tocar. La exportación desde Megatron torch_dist re-fusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5 y copia los pesos de visión/MTP del base, igualando los dtypes al índice original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) más Megatron-LM en bf16. Cada actualización usa 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-6, AdamW (betas 0.9/0.95), weight decay 0.1, grad clip 1.0 y una pérdida KL de baja varianza con coeficiente 0.001 respecto al modelo inicial congelado. El muestreo emplea temperatura 1.0, top-p 1 y hasta 32.768 tokens generados. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El conjunto "mixture-8" suma 11.794 prompts únicos (star1_gp3, star_benign_v2, agentalign_harmful, agentalign_benign, codesafetybench, magicoder, difficult_advice, wildjailbreak_benign), con 4.000 prompts de AgentAlign que incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador (salidas de herramienta enmascaradas en la pérdida). El plan es una época rellenada de 787 actualizaciones, con checkpoints cada 80.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Entrada imagen-texto: conserva la torre de visión del base, aunque no fue entrenada en este proceso.
- Tool calling / function calling mediante el formato `qwen3_coder`, usado durante los rollouts de entrenamiento.
- Razonamiento multi-paso en trayectorias agénticas con herramientas (AgentAlign, 4.000 prompts).
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas y manejo de prompts benignos y de jailbreak benigno.
- Capacidades de código (conjuntos codesafetybench y magicoder en el entrenamiento).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Cabeza MTP del base conservada (no entrenada).

## Casos de uso

- Investigación en safety tuning: evaluar cómo evoluciona la tasa de rechazo y la calidad de respuesta entre checkpoints del mismo run (pasos 80, 160, etc.) para estudiar dinámicas de RL de seguridad.
- Evaluación de robustez frente a jailbreaks: usar los conjuntos wildjailbreak_benign y star_benign_v2 como referencia para medir falsos rechazos y fugas en prompts benignos.
- Análisis de seguridad en código: comparar el comportamiento del checkpoint frente al base en codesafetybench para detectar si el RL degrada la utilidad en generación de código (el juez cae de 0,51 a 0,38 en magicoder).
- Estudio de agentes con herramientas: reproducir trayectorias multi-turno con el formato `qwen3_coder` y un simulador de herramientas para analizar cómo el modelo decide invocar funciones en contextos sensibles.
- Baseline para comparativas de alineación: servir como punto intermedio entre el base sin ajustar y un modelo final de seguridad en experimentos controlados.
- Docencia y divulgación: ejemplo reproducible de receta GRPO con recompensa de juez binario, útil para explicar el pipeline Slime + Megatron-LM.
- Evaluación de consejo difícil (difficult_advice): probar respuestas ante consultas delicadas, donde el juez sube de 0,28 a 0,69 entre el inicio y el paso 160.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica la puntuación media del juez binario durante el entrenamiento (recompensa cruda antes de normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 70-80 | 0,578 | 1200 |
| 150-160 | 0,708 | 1200 |

Desglose por conjunto de datos:

| Conjunto | Upd. 0-10 | Upd. 70-80 | Upd. 150-160 |
|---|---|---|---|
| agentalign_benign | 0,41 | 0,48 | 0,60 |
| agentalign_harmful | 0,63 | 0,88 | 0,94 |
| codesafetybench | 0,47 | 0,78 | 0,80 |
| difficult_advice | 0,28 | 0,30 | 0,69 |
| magicoder | 0,51 | 0,34 | 0,38 |
| star1_gp3 | 0,57 | 0,78 | 0,82 |
| star_benign_v2 | 0,27 | 0,54 | 0,83 |
| wildjailbreak_benign | 0,27 | 0,45 | 0,61 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos; con caché KV para 40.960 tokens de contexto se requiere bastante más (no disponible el cálculo exacto).
- GPU recomendadas: el entrenamiento se ejecutó en dos B200 (juez en GPU 0, entrenador y motor de rollout en GPU 1). Para inferencia, una A100 80 GB o H100 son holgadas; una RTX 4090 de 24 GB podría alojar los pesos en bf16 pero con contexto limitado.
- Cabe en GPU de consumo: probablemente en RTX 4090/3090 con cuantización, aunque no se publican pesos cuantizados; en bf16 el margen es ajustado para contextos largos.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` (receta oficial de la model card); vLLM, llama.cpp, Ollama y TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (GRPO Mixture8, paso 160) | 4,66 B | 40.960 (entrenamiento) | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint intermedio de RL de seguridad |
| Qwen/Qwen3.5-4B-Base | no disponible en la información | no disponible | Apache 2.0 | Hugging Face | Modelo base sin ajustar; referencia directa |
| Alternativas de safety tuning de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (160 de 787 actualizaciones planificadas): el autor advierte explícitamente que no es un modelo final y que el entrenamiento sigue en curso.
- El juez de recompensa es un modelo (Qwen3.8-27B) con veredicto binario; puede introducir sesgos y el modelo puede sobreajustarse a su criterio, no a la seguridad real.
- Señal de degradación en código: la puntuación del juez en magicoder baja de 0,51 a 0,38, lo que sugiere pérdida de utilidad en generación de código tras el RL.
- Riesgo de sobre-rechazo: los conjuntos benignos (star_benign_v2, wildjailbreak_benign) mejoran pero siguen por debajo de 1,0 (0,83 y 0,61), lo que indica falsos positivos de rechazo.
- Idiomas soportados no documentados; no se puede garantizar comportamiento multilingüe.
- La torre de visión y la cabeza MTP no se entrenaron: las capacidades de imagen son las del base, sin alineación de seguridad específica.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin benchmarks estándar ni evaluación externa, no es recomendable para producción.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes): no hay evidencia independiente de su comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step160
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Papers, blogs, repos y demos adicionales: no disponibles en la información proporcionada.
