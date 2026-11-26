# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step960

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step960 es un checkpoint intermedio de ajuste fino con aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: el modelo se entrena para responder de forma segura ante peticiones dañinas manteniendo utilidad en peticiones benignas, incluyendo escenarios de uso de herramientas (tool calling) multi-turno.

El modelo conserva la arquitectura completa del base Qwen3.5-4B, un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` con 4.659.865.088 parámetros, torre de visión y cabeza MTP (multi-token prediction). Solo se ha entrenado el modelo de lenguaje; la torre de visión y la cabeza MTP mantienen los pesos originales del base. El contexto de entrenamiento es de 40.960 tokens y la generación se realizó con hasta 32.768 tokens nuevos.

Es relevante porque documenta de forma transparente una receta completa de RL para seguridad con recompensas binarias juzgadas por un modelo (Qwen3.8-27B), incluyendo trayectorias agénticas con herramientas simuladas. No obstante, se trata de un snapshot con entrenamiento en curso (960 actualizaciones de 1.574 previstas), no de un modelo final, y no se han publicado evaluaciones de benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (hereda la del base Qwen3.5-4B; incluye torre de visión y cabeza MTP) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento/rollout); longitud nativa del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base y mantiene su arquitectura intacta: transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). El ajuste se aplica únicamente al modelo de lenguaje; los pesos de visión y MTP se copian sin modificar desde el base, de modo que el checkpoint se carga exactamente igual que el modelo original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado. El stack es Slime (rollouts con SGLang, colocados) más Megatron-LM en bf16. Por cada actualización se generan 15 prompts × 8 rollouts = 120 secuencias. Hiperparámetros: learning rate constante de 1e-6, AdamW con betas [0,9; 0,95], weight decay 0,1, grad clip 1,0 y pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo congelado de partida. El muestreo usa temperatura 1,0, top-p 1 y hasta 32.768 tokens generados. Se activa `enable_thinking=true` en la plantilla de chat y, en los rollouts con herramientas, se emplea function calling `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); en los prompts de AgentAlign se juzga la trayectoria completa de uso de herramientas visible.

El conjunto de datos "mixture-8" suma 11.794 prompts únicos: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El plan de entrenamiento es una época sobre 1.574 actualizaciones, con checkpoints cada 40.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso y modo "thinking" heredado de la familia Qwen3.5.
- Uso de herramientas y function calling (`qwen3_coder`), incluyendo trayectorias agénticas multi-turno con salidas de herramienta.
- Capacidades multimodales de entrada imagen-texto heredadas del base (torre de visión sin entrenar en este ajuste).
- Comportamiento orientado a seguridad: rechazo o redirección ante peticiones dañinas (jailbreaks, consejo dañino, código inseguro).
- Preservación de utilidad en peticiones benignas, incluidas las que requieren herramientas.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Investigación en alineamiento de seguridad: sirve como punto de comparación entre el base y checkpoints posteriores de la misma ejecución para estudiar la evolución de la tasa de rechazo y la utilidad bajo RL.
- Evaluación de robustez frente a jailbreaks: los prompts de wildjailbreak_benign y difficult_advice del entrenamiento permiten medir la resistencia a ataques de ingeniería social y a peticiones de consejo dañino.
- Seguridad en generación de código: el entrenamiento con codesafetybench y magicoder lo hace adecuado para probar si el modelo evita sugerir código inseguro o malicioso en asistentes de programación.
- Agentes con herramientas en entornos simulados: los 4.000 prompts de AgentAlign con definiciones sintéticas permiten evaluar el comportamiento de un agente que decide cuándo invocar herramientas y cómo encadenar llamadas.
- Filtrado y moderación de contenido: puede usarse como generador de respuestas seguras de referencia en pipelines de clasificación y reescritura de contenido sensible.
- Estudio de estabilidad del entrenamiento RL: las fluctuaciones documentadas en magicoder (0,76 → 0,26 → 0,87 → 0,54) lo convierten en material para analizar olvido catastrófico y varianza del reward durante GRPO.
- Prototipado de asistentes con razonamiento: el modo thinking y el contexto de 40.960 tokens permiten probar flujos de razonamiento largo en tareas de análisis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye la puntuación media del juez binario durante el entrenamiento (recompensa bruta antes de normalización por grupo):

| Ventana de actualizaciones | Puntuación media | Rollouts juzgados |
|---|---|---|
| 790-800 | 0,808 | 1200 |
| 830-840 | 0,815 | 1200 |
| 870-880 | 0,855 | 1200 |
| 910-920 | 0,877 | 1200 |
| 950-960 | 0,853 | 1200 |

Desglose por conjunto de datos:

| Dataset | 790-800 | 830-840 | 870-880 | 910-920 | 950-960 |
|---|---|---|---|---|---|
| agentalign_benign | 0,61 | 0,62 | 0,73 | 0,69 | 0,72 |
| agentalign_harmful | 0,90 | 0,95 | 0,96 | 0,93 | 0,90 |
| codesafetybench | 0,85 | 0,93 | 0,93 | 0,83 | 0,95 |
| difficult_advice | 0,81 | 0,88 | 0,86 | 0,88 | 0,83 |
| magicoder | 0,76 | 0,26 | 0,77 | 0,87 | 0,54 |
| star1_gp3 | 0,97 | 0,96 | 0,96 | 0,99 | 0,95 |
| star_benign_v2 | 0,84 | 0,83 | 0,86 | 0,94 | 0,94 |
| wildjailbreak_benign | 0,86 | 0,86 | 0,81 | 0,88 | 0,93 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más caché KV y activaciones; en la práctica se necesitan del orden de 12-16 GB para contexto moderado y bastante más para los 40.960 tokens de contexto.
- Cuantización a 8 bits: alrededor de 5 GB de pesos; a 4 bits, alrededor de 2,5-3 GB (estimación teórica, no se publican artefactos cuantizados).
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA B200 con el juez en 2× A100 (SGLang TP2). Para inferencia, una RTX 4090 (24 GB) o A100/H100 son suficientes en bf16 para contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB en bf16 para contextos cortos; con cuantización de 4-8 bits cabría en 8-12 GB.
- Opciones de despliegue: transformers (receta oficial de la model card), SGLang (usado en los rollouts), y previsiblemente vLLM y TGI por compatibilidad con la arquitectura; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning Qwen3.5-4B GRPO step960) | 4,66 B | 40.960 (entrenamiento) | Seguridad vía GRPO sobre Qwen3.5-4B-Base | apache-2.0 | Hugging Face, snapshot intermedio |
| Qwen/Qwen3.5-4B-Base | 4,66 B (heredado) | no disponible | Modelo base multimodal sin alineamiento de seguridad específico | apache-2.0 | Hugging Face |
| Modelos de seguridad de la familia Llama Guard / ShieldGemma | no disponible | no disponible | Clasificación/moderación de seguridad | licencias específicas | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (960 de 1.574 actualizaciones), no un modelo final; el autor indica que el entrenamiento sigue en curso.
- No hay benchmarks estándar publicados; el único indicador es la recompensa de un juez binario, que puede estar sesgada hacia el criterio del propio juez (Qwen3.8-27B).
- Alta varianza entre ventanas: magicoder cae de 0,87 a 0,54 y agentalign_benign se mantiene en 0,61-0,73, lo que sugiere inestabilidad y posible olvido de capacidades benignas.
- Riesgo de sobre-rechazo (falsos positivos de seguridad) por el entrenamiento con recompensas binarias estrictas.
- Riesgo de alucinación inherente al modelo base; el ajuste RL no lo mitiga.
- La torre de visión y la cabeza MTP no se han entrenado, por lo que el comportamiento multimodal no está alineado con el ajuste de seguridad.
- Idiomas soportados no documentados; no se garantiza un comportamiento de seguridad uniforme fuera del inglés.
- Licencia apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin evaluaciones de producción.
- El contexto de 40.960 tokens es el usado en entrenamiento; no se confirma la longitud nativa soportada por el base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-ep2-step960
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
