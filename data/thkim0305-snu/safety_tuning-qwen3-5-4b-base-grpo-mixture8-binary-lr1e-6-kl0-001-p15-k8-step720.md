# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step720

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step720 es un checkpoint intermedio de ajuste fino con RL (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad (*safety tuning*): reducir respuestas dañinas, mejorar el rechazo de peticiones maliciosas y mantener un comportamiento benigno útil en escenarios conversacionales y de uso de herramientas. El modelo no está terminado: es una instantánea en la actualización 720 de un total previsto de 787.

Técnicamente se apoya en la arquitectura Qwen3.5 (clase `Qwen3_5ForConditionalGeneration`), con 4.659.865.088 parámetros totales en bf16 y una torre de visión heredada del modelo base que no se entrena en este proceso. Solo se ha ajustado el modelo de lenguaje; la cabeza MTP y la torre visual conservan los pesos originales, de modo que el checkpoint se carga exactamente igual que el base. La longitud de contexto usada durante el entrenamiento es de 40.960 tokens.

Su relevancia es doble: por un lado, documenta una receta reproducible de RL para seguridad con recompensas binarias juzgadas por un modelo juez (Qwen3.8-27B) y con rollouts multi-turno de uso de herramientas; por otro, publica curvas de recompensa por conjunto de datos, lo que permite auditar la evolución del comportamiento a lo largo del entrenamiento. No obstante, al ser un snapshot intermedio y sin benchmarks estándar publicados, no debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, `Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto de entrenamiento); longitud máxima nativa del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y mantiene su arquitectura intacta: un transformer multimodal con proyecciones GDN re-fusionadas en la exportación, torre de visión y cabeza MTP. Solo se actualizan los pesos del modelo de lenguaje mediante GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0.2, *truncated importance sampling* (TIS) activado y una pérdida KL de baja varianza con coeficiente 0.001 respecto al checkpoint de partida congelado. El entrenamiento se ejecutó con Slime (rollouts con SGLang colocados) y Megatron-LM en bf16, con learning rate constante de 1e-6, AdamW (betas 0.9/0.95), weight decay 0.1 y grad clip 1.0.

Cada actualización usa 15 prompts con 8 rollouts por prompt (120 secuencias), muestreando con temperatura 1.0, top-p 1 y hasta 32.768 tokens generados sobre un contexto de 40.960. Se emplea la plantilla de chat de Qwen con `enable_thinking=true`, y los rollouts de herramientas usan el *function calling* `qwen3_coder`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El conjunto "mixture-8" suma 11.794 prompts únicos (star1_gp3, star_benign_v2, agentalign_harmful, agentalign_benign, codesafetybench, magicoder, difficult_advice y wildjailbreak_benign), con 4.000 prompts de AgentAlign que llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador (las salidas de herramienta tienen la pérdida enmascarada). El plan es una época con padding sobre 787 actualizaciones, con checkpoints cada 80.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-step y cadenas de pensamiento antes de responder.
- Uso de herramientas y *function calling* en formato `qwen3_coder`, incluyendo trayectorias multiturno contra un simulador de herramientas.
- Comportamiento de seguridad reforzado: rechazo de peticiones dañinas y respuestas benignas útiles, entrenado sobre conjuntos de seguridad de código, consejo difícil y jailbreaks benignos.
- Capacidad multimodal heredada del base (torre de visión intacta), aunque el ajuste RL solo afecta al modelo de lenguaje.
- Capacidades multilingües: no disponibles en la información proporcionada (el base Qwen3.5 es multilingüe, pero este checkpoint no documenta idiomas).
- No se documentan capacidades de audio ni de visión específicas más allá de la herencia del base.

## Casos de uso

- Moderación y filtrado de contenido en producción: el ajuste sobre `wildjailbreak_benign`, `star_benign_v2` y `difficult_advice` lo hace adecuado como clasificador generativo de segundo nivel para decidir si una petición debe rechazarse o reformularse, con la salvedad de que es un snapshot intermedio.
- Asistentes conversacionales con rechazo controlado: puede gestionar diálogos multiturno de hasta 40.960 tokens de contexto, útil para agentes de atención al cliente que deben declinar solicitudes sensibles sin romper la conversación.
- Agentes con uso de herramientas en entornos simulados: el entrenamiento con 4.000 prompts de AgentAlign y el formato `qwen3_coder` permiten prototipar agentes que invocan funciones y razonan sobre sus salidas, con la seguridad como criterio adicional.
- Evaluación de seguridad de código: el ajuste sobre `codesafetybench` lo hace apropiado para experimentos de generación de código que debe evitar patrones inseguros (inyección, manejo de secretos, criptografía débil).
- Investigación en RLHF/RL: sirve como referencia reproducible de una receta GRPO con juez binario, KL bajo y TIS, útil para estudiar la dinámica de recompensa por conjunto de datos.
- Generación de explicaciones educativas sobre riesgos (phishing, ingeniería social): el ejemplo de la model card sugiere uso en material formativo donde se requiere explicar por qué una práctica es peligrosa sin proporcionar instrucciones operativas.
- Base para *safety tuning* adicional: al conservar la torre de visión y la cabeza MTP intactas, puede reutilizarse como punto de partida para ajustes posteriores sin perder capacidades multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta la recompensa media binaria del juez durante el entrenamiento, por ventana de actualizaciones:

| Ventana (updates) | Recompensa media | Rollouts juzgados |
|---|---|---|
| 0-10 | 0.417 | 1200 |
| 70-80 | 0.578 | 1200 |
| 150-160 | 0.708 | 1200 |
| 230-240 | 0.768 | 1200 |
| 310-320 | 0.837 | 1200 |
| 390-400 | 0.804 | 1200 |
| 470-480 | 0.801 | 1200 |
| 550-560 | 0.841 | 1200 |
| 630-640 | 0.792 | 1200 |
| 710-720 | 0.815 | 1200 |

Desglose por conjunto de datos en la ventana 710-720: `agentalign_harmful` 0.96, `star1_gp3` 0.96, `codesafetybench` 0.88, `difficult_advice` 0.87, `star_benign_v2` 0.88, `agentalign_benign` 0.71, `wildjailbreak_benign` 0.69 y `magicoder` 0.65. La recompensa es la media binaria cruda antes de la normalización por grupo; no equivale a una métrica de benchmark externa.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más KV cache y activaciones; en la práctica, 12-16 GB para contextos moderados y bastante más con contexto de 40.960 tokens.
- Cuantización a 8 bits: en torno a 5 GB de pesos; a 4 bits, en torno a 2,5-3 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, B200 (el entrenamiento se hizo con dos B200); para inferencia basta una RTX 4090 (24 GB) en bf16 con contexto limitado, o GPUs consumer de 12-16 GB con cuantización.
- Cabe en GPU consumer: sí, con cuantización en RTX 3060 12 GB, RTX 4070, RTX 4080 y RTX 4090; en bf16 completo requiere al menos 16 GB.
- Opciones de despliegue: `transformers` (probado por el autor), vLLM, SGLang (usado en los rollouts), TGI y llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3.5-4B + GRPO safety, step 720) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad, snapshot intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Modelo base multimodal sin alinear | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (instruct, si existe) | 4 B (aprox.) | no disponible | Alineamiento supervisado + preferencias | Apache 2.0 | Hugging Face |
| Otros ajustes de seguridad sobre bases de ~4 B | ~4 B | variable | SFT/DPO/RL de seguridad | variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no hay benchmarks publicados para este checkpoint ni cifras de referencia en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (720 de 787 actualizaciones previstas): el autor indica explícitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Sin benchmarks estándar publicados; la única señal de calidad es la recompensa de un juez binario, que puede estar sobreajustada a la especificación del proyecto.
- Riesgo de alucinación no evaluado; el modo `enable_thinking=true` genera cadenas de razonamiento largas que pueden aumentar la latencia y el consumo de tokens.
- Sesgos: no documentados; el ajuste se centra en seguridad, no en equidad ni en calidad multilingüe.
- Idiomas soportados no documentados; el comportamiento fuera del inglés (y del chino, herencia del base) no está verificado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia del base enlazada por el autor.
- La torre de visión y la cabeza MTP conservan los pesos del base sin ajustar: las capacidades multimodales no se han alineado en seguridad.
- El uso de un juez Qwen3.8-27B con veredicto binario estricto puede introducir falsos positivos y negativos; no se reporta acuerdo entre jueces ni validación humana.
- No apto para producción sin evaluación propia: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step720
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Repositorio Slime (framework de RL usado): no disponible en la información proporcionada
- Repositorio Megatron-LM (framework de entrenamiento): no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
