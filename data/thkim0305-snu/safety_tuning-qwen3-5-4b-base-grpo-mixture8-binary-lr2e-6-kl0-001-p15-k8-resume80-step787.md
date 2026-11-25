# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step787

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step787 es un checkpoint intermedio de ajuste fino mediante aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad: se entrena al modelo para que responda de forma segura tanto en conversaciones directas como en trayectorias multi-turno con uso de herramientas, usando un juez externo (Qwen3.8-27B) que emite un veredicto binario estricto (0/1) como señal de recompensa.

El checkpoint corresponde a la actualización de optimizador 787 (iteración Megatron 786) de una única época sobre 11.794 prompts únicos del conjunto denominado "mixture-8". No es un modelo final: el autor indica explícitamente que el entrenamiento sigue en curso. Los pesos se exportan en bf16 con la clase `Qwen3_5ForConditionalGeneration`; solo se ha entrenado el modelo de lenguaje, mientras que la torre de visión y la cabeza MTP conservan los pesos originales del modelo base, por lo que el checkpoint carga exactamente igual que Qwen3.5-4B-Base.

El interés de esta ficha es doble: por un lado, documenta una receta reproducible de RL para seguridad con GRPO sobre Qwen3.5; por otro, sirve como referencia de un artefacto de investigación con licencia Apache 2.0, 4.659.865.088 parámetros y soporte de contexto de hasta 40.960 tokens durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, clase `Qwen3_5ForConditionalGeneration`); torre de visión y cabeza MTP congeladas del modelo base |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion proporcionada) |
| Longitud de contexto | 40.960 tokens (contexto usado en el entrenamiento); longitud nativa del modelo base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se ha ajustado el modelo de lenguaje; la torre de visión y la cabeza MTP son los pesos intactos del modelo base. La exportación desde Megatron `torch_dist` (iteración `iter_0000786`) se realizó con la herramienta `safety_tuning.hf_export`, que refusiona las proyecciones GDN, aplica el mapeo de nombres de Slime para Qwen3.5, copia los pesos de visión y MTP del modelo base y ajusta los tipos de dato al índice original.

El entrenamiento emplea GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2 y TIS activado. El stack es Slime (rollouts con SGLang en modo colocado) más Megatron-LM en bf16. Cada actualización usa 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 2e-6, AdamW con betas [0.9, 0.95], weight decay 0.1 y grad clip 1.0. Se aplica una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0.001. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se activa el modo thinking mediante la plantilla de chat de Qwen con `enable_thinking=true`, y los rollouts con herramientas usan el function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule cubre una época con padding sobre 11.794 prompts únicos, con checkpoints cada 40 actualizaciones.

Los datos del "mixture-8" se componen de: star1_gp3 (1.000 prompts), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat de Qwen y modo thinking activable.
- Razonamiento en modo thinking (`enable_thinking=true`), con hasta 32.768 tokens generados durante el entrenamiento.
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, incluyendo trayectorias multi-turno con simulador de herramientas.
- Capacidad multimodal de entrada imagen-texto heredada del modelo base (torre de visión intacta), aunque no se ha entrenado en esta fase.
- Comportamiento orientado a seguridad: el ajuste GRPO busca respuestas seguras en prompts dañinos, benignos y de doble uso, incluyendo seguridad de código.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de audio ni de agentes autónomos más allá del uso de herramientas simulado.

## Casos de uso

- Investigación en alineación de seguridad: sirve como checkpoint intermedio para estudiar la evolución de la recompensa del juez a lo largo de las actualizaciones (310-760) y comparar dinámicas de entrenamiento GRPO con recompensas binarias.
- Evaluación de robustez frente a jailbreaks: el conjunto wildjailbreak_benign (1.997 prompts) permite medir si el modelo mantiene respuestas útiles ante prompts benignos que imitan estructuras de jailbreak.
- Seguridad en generación de código: el entrenamiento con codesafetybench (900 prompts) y magicoder (1.000) está orientado a reducir la generación de código inseguro en asistentes de programación integrados en pipelines de CI/CD.
- Agentes con uso de herramientas: los 4.000 prompts de AgentAlign con definiciones sintéticas permiten evaluar el comportamiento seguro en trayectorias multi-turno con function calling, útil para validar agentes antes de desplegarlos en producción.
- Filtrado y moderación de contenidos: el modelo puede emplearse como componente de un clasificador o generador de respuestas seguras en sistemas de atención al cliente, dado su ajuste sobre prompts dañinos y de consejo difícil (difficult_advice, 1.982 prompts).
- Base para ajuste posterior: al ser un checkpoint intermedio con licencia Apache 2.0 y pesos bf16 compatibles con transformers, puede servir como punto de partida para fine-tuning supervisado o nuevas rondas de RL específicas de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta la puntuación media de recompensa binaria del juez durante el entrenamiento, por ventana de actualizaciones:

| Ventana (updates) | Puntuacion media | Rollouts juzgados |
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
| 750-760 | 0.805 | 1200 |

Desglose por conjunto de datos en la última ventana (750-760): agentalign_benign 0.65, agentalign_harmful 0.88, codesafetybench 0.86, difficult_advice 0.88, magicoder 0.49, star1_gp3 1.00, star_benign_v2 0.90 y wildjailbreak_benign 0.83.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (4.659.865.088 parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 40.960 tokens el consumo crece de forma notable.
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA B200 (trainer y rollout) con el juez en 2× A100 (SGLang TP2); para inferencia, A100 40/80 GB, H100 o B200 ofrecen margen amplio.
- GPU de consumo: cabe en tarjetas con 16-24 GB (RTX 4090, RTX 3090) en bf16 si se limita el contexto; en cuantización de 8 bits o 4 bits (no publicada por el autor) reduciría aún más el requisito, pero requeriría conversión propia.
- Opciones de despliegue: transformers con `Qwen3_5ForConditionalGeneration` (receta oficial del autor); SGLang y vLLM son compatibles con la arquitectura Qwen3.5 aunque no se documentan explícitamente para este checkpoint; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4.659.865.088 | 40.960 (entrenamiento) | Apache 2.0 | Checkpoint intermedio de RL de seguridad, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | no disponible | no disponible | Apache 2.0 | Modelo base sin ajuste de seguridad; referencia directa de comparación |
| Alternativas de seguridad de 4B | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

No se dispone de información sobre otros modelos de seguridad del mismo tamaño con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio: el entrenamiento sigue en curso y el autor lo describe como una instantánea, no como un modelo final; no debe tratarse como versión estable.
- La recompensa media del juez fluctúa y no es monótona: cae de 0.839 (ventana 310-320) a 0.713 (510-520) y repunta a 0.805 (750-760); el rendimiento por conjunto varía mucho (magicoder baja a 0.49 en la última ventana).
- Riesgo de alucinación: no evaluado en la información proporcionada; al ser un modelo de 4B sin benchmarks publicados, no hay garantías cuantificadas.
- Sesgos conocidos: no documentados por el autor; el ajuste se apoya en un juez automático (Qwen3.8-27B) cuyos sesgos pueden propagarse al modelo entrenado.
- Idiomas soportados: no disponibles; el comportamiento multilingüe no está verificado.
- La torre de visión y la cabeza MTP no se han entrenado, por lo que las capacidades multimodales no se han optimizado en esta fase.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia del modelo base enlazada por el autor.
- Para producción: al no haber benchmarks estándar ni evaluación independiente, no se recomienda su despliegue directo sin una batería propia de pruebas de seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step787
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
