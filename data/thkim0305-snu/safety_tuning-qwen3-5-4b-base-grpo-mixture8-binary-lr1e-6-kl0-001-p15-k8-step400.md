# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step400

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 es un checkpoint intermedio de ajuste fino mediante RL (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo es el alineamiento de seguridad: el modelo se entrena para responder de forma segura a peticiones dañinas, benignas y de doble uso, incluyendo trayectorias de uso de herramientas (tool use). El checkpoint corresponde a 400 actualizaciones del optimizador y el autor indica explícitamente que el entrenamiento sigue en curso, por lo que no es un modelo final.

Arquitectura Qwen3.5 con 4.659.865.088 parámetros totales en pesos bf16 (`Qwen3_5ForConditionalGeneration`), incluyendo torre de visión y cabeza MTP que permanecen congeladas en los pesos del base (solo se entrenó el modelo de lenguaje). El pipeline declarado es `text-generation` aunque los tags incluyen `image-text-to-text`, lo que sugiere capacidad multimodal heredada del base.

Su relevancia es metodológica: documenta con detalle la receta de RL de seguridad (GRPO con recompensas binarias, juez externo Qwen3.8-27B, KL bajo, TIS activado) y publica la evolución de las puntuaciones del juez por dataset a lo largo del entrenamiento, lo que lo convierte en una referencia útil para investigar safety tuning con RL sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), `Qwen3_5ForConditionalGeneration`; incluye torre de visión y cabeza MTP (congeladas) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens durante entrenamiento (valor de sampling); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y solo se entrena el modelo de lenguaje; la torre de visión y la cabeza MTP conservan los pesos del base, por lo que el checkpoint carga exactamente igual que el modelo original. El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang colocados) y Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 1e-06, AdamW (betas 0.9/0.95), weight decay 0.1 y grad clip 1.0. Se aplica una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0.001.

El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa `enable_thinking=true` en la plantilla de chat de Qwen y los rollouts de herramientas usan el function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule previsto es una época sobre 11.794 prompts únicos = 787 actualizaciones, con checkpoints cada 80 actualizaciones; este checkpoint es el paso 400.

El conjunto de datos "mixture-8" se compone de: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento (`enable_thinking=true`).
- Tool calling / function calling mediante el formato `qwen3_coder`, entrenado explícitamente con trayectorias multiturno de uso de herramientas.
- Razonamiento multi-paso y agentes: los prompts de AgentAlign se entrenan como trayectorias completas contra un simulador de herramientas.
- Alineamiento de seguridad: respuestas robustas ante prompts dañinos, benignos y de doble uso (jailbreak benigno, consejo difícil, seguridad de código).
- Capacidad multimodal heredada del base (torre de visión incluida en los pesos, aunque no entrenada en este ajuste); el pipeline declarado es text-generation.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en safety tuning con RL: sirve como checkpoint de referencia para reproducir o comparar recetas GRPO con recompensas binarias y juez externo, dado que el autor publica la evolución de puntuaciones por dataset.
- Moderación y filtrado de contenido en producción: el modelo puede evaluar si una petición es dañina, benigna o de doble uso y generar una respuesta segura, gracias al entrenamiento específico sobre star1_gp3, wildjailbreak_benign y difficult_advice.
- Asistentes con uso de herramientas en entornos controlados: el entrenamiento con trayectorias AgentAlign y el formato `qwen3_coder` permiten integrarlo en pipelines de agentes que invocan funciones, con la ventaja de haber sido expuesto a trayectorias multiturno durante el RL.
- Revisión de seguridad de código generado: el dataset codesafetybench entrena al modelo para detectar y evitar patrones inseguros en sugerencias de programación, útil en asistentes de IDE o revisiones de PR.
- Evaluación comparativa de robustez frente a jailbreaks: los checkpoints intermedios (cada 80 actualizaciones) permiten estudiar la curva de alineamiento y el equilibrio entre seguridad y utilidad.
- Base para ajuste posterior específico de dominio: al mantener la licencia Apache 2.0 y cargar como el base, puede servir de punto de partida para fine-tuning supervisado en tareas concretas tras validar que la seguridad no se degrada.
- Despliegue en investigación académica con recursos limitados: con ~4,66B parámetros en bf16 cabe en una GPU de 24 GB con cuantización o en una de 40-80 GB en bf16, lo que facilita experimentos de alineamiento reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica la puntuación media del juez binario durante el entrenamiento (recompensa bruta antes de normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 70-80 | 0,578 | 1200 |
| 150-160 | 0,708 | 1200 |
| 230-240 | 0,768 | 1200 |
| 310-320 | 0,837 | 1200 |
| 390-400 | 0,804 | 1200 |

Desglose por dataset en la ventana 390-400: agentalign_benign 0,62; agentalign_harmful 0,86; codesafetybench 0,88; difficult_advice 0,78; magicoder 0,68; star1_gp3 0,98; star_benign_v2 0,98; wildjailbreak_benign 0,73. Se observa una caída respecto al pico de la ventana 310-320 (0,837), lo que sugiere inestabilidad del entrenamiento en las últimas actualizaciones.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB de pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica requiere del orden de 12-16 GB para inferencia con contexto moderado.
- GPU recomendadas: B200 (usadas en el entrenamiento), A100 40/80 GB, H100; para inferencia en bf16 una RTX 4090 (24 GB) es suficiente con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16, y en GPUs de 16 GB con cuantización (aunque no se publican pesos cuantizados).
- Opciones de despliegue: transformers (receta oficial del model card); vLLM, SGLang, TGI y llama.cpp no están confirmados en la información disponible, aunque SGLang se usó para los rollouts durante el entrenamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66B | 40.960 (entrenamiento) | Safety RL (GRPO) sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Modelo base generalista | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de seguridad del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 400 de 787 previstos): el autor advierte que el entrenamiento sigue en curso y que no es un modelo final.
- La puntuación del juez cae de 0,837 (ventana 310-320) a 0,804 (ventana 390-400), lo que indica posible inestabilidad o sobreajuste al juez; no debe asumirse una mejora monótona.
- El juez de recompensa es un modelo (Qwen3.8-27B) con veredicto binario estricto: existe riesgo de que el modelo aprenda a satisfacer al juez y no una noción general de seguridad (reward hacking).
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de factualidad.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- La torre de visión y la cabeza MTP no se entrenaron: las capacidades multimodales son las del base sin ajuste de seguridad, lo que puede generar respuestas no alineadas por la vía visual.
- Solo 0 descargas y 0 likes: no hay validación externa ni reportes de terceros sobre su comportamiento en producción.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación independiente, no se recomienda su despliegue en producción sin auditoría de seguridad propia.
- No se publican pesos cuantizados (GGUF, AWQ, GPTQ) ni artefactos de despliegue listos para servir.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step400
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
