# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step760

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step760 es un checkpoint intermedio de ajuste fino con aprendizaje por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, orientado a alineamiento de seguridad. Lo desarrolla el usuario thkim0305-SNU y se publica bajo licencia Apache 2.0. El problema que aborda es el de reforzar el comportamiento seguro del modelo (rechazo de peticiones dañinas, uso seguro de herramientas en agentes, seguridad en generación de código) sin recurrir a un ajuste supervisado clásico, sino optimizando directamente una recompensa binaria emitida por un juez externo.

Arquitectura y tamaño: se trata de un transformer multimodal de tipo `Qwen3_5ForConditionalGeneration` con 4.659.865.088 parámetros totales (aproximadamente 4,66 mil millones), pesos en bf16 y una torre de visión heredada intacta del modelo base. El contexto de entrenamiento es de 40.960 tokens y la generación se permite hasta 32.768 tokens, con plantilla de chat de Qwen y `enable_thinking=true`.

Es relevante ahora porque documenta una receta completa de RL de seguridad sobre un modelo pequeño y desplegable, con trazas de recompensa por update y por subconjunto de datos, lo que permite auditar la evolución del comportamiento. No obstante, es un snapshot con entrenamiento en curso (760 updates de 787 previstos), no un modelo final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de visión + cabeza MTP + modelo de lenguaje); solo se entrenó el modelo de lenguaje |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; generación de hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face `Qwen3_5ForConditionalGeneration`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) y conserva sin tocar la torre de visión y la cabeza MTP; únicamente se entrena el modelo de lenguaje. El ajuste se realiza con GRPO con recompensas binarias normalizadas por grupo, PPO clip 0.2 y TIS activado, sobre el framework Slime (rollouts con SGLang, colocados) y Megatron-LM en bf16. Cada update usa 15 prompts por 8 rollouts por prompt, es decir, 120 secuencias. Hiperparámetros: learning rate constante 2e-06, AdamW con betas [0.9, 0.95], weight decay 0.1, grad clip 1.0, y una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0.001. El muestreo usa temperatura 1.0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960.

El conjunto de datos, denominado "mixture-8", suma 11.794 prompts únicos repartidos en ocho fuentes: star1_gp3 (1000), star_benign_v2 (915), agentalign_harmful (2000), agentalign_benign (2000), codesafetybench (900), magicoder (1000), difficult_advice (1982) y wildjailbreak_benign (1997). Los 4000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno de uso de herramientas contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El entrenamiento se organiza en una época con padding sobre los 11.794 prompts, equivalente a 787 updates, con checkpoints cada 40 updates. El run se ejecutó en 1x NVIDIA B200 para entrenador y motor de rollout, con el juez en 2x A100 (SGLang TP2) por túnel SSH, reanudado en el update 280 desde un run previo con 3x RTX PRO 6000.

## Capacidades

- Generación de texto conversacional con plantilla de chat de Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso: el modo thinking permite cadenas de razonamiento antes de la respuesta final.
- Uso de herramientas y function calling con el formato `qwen3_coder`, incluyendo trayectorias multi-turno contra un simulador de herramientas.
- Comportamiento orientado a agentes: los datos AgentAlign (harmful y benign) entrenan decisiones de uso de herramientas en escenarios con herramientas sintéticas.
- Seguridad en generación de código: entrenado con codesafetybench y magicoder para evitar código dañino o inseguro.
- Resistencia a jailbreaks y prompts adversarios: entrenado con wildjailbreak_benign y difficult_advice.
- Capacidades multimodales heredadas del base (torre de visión intacta), aunque el ajuste RL solo afecta al modelo de lenguaje.
- Capacidades multilingües: no disponible (no se documenta la composición lingüística).

## Casos de uso

- Moderación y rechazo de peticiones dañinas en asistentes conversacionales: el modelo ha sido optimizado con recompensa binaria sobre star1_gp3 y difficult_advice, por lo que puede integrarse como primera capa de filtrado o como generador que declina solicitudes peligrosas manteniendo utilidad en las benignas.
- Agentes con uso de herramientas en entornos sensibles: gracias al entrenamiento sobre trayectorias AgentAlign con definiciones sintéticas de herramientas, es adecuado para prototipar agentes que deben decidir cuándo invocar una herramienta y cuándo no hacerlo en función del riesgo de la petición.
- Asistencia en programación con restricciones de seguridad: el entrenamiento con codesafetybench y magicoder permite usarlo en asistentes de código que deben evitar sugerir exploits, código malicioso o prácticas inseguras, manteniendo capacidad de generación de código funcional.
- Evaluación de pipelines de RL de seguridad: al publicarse con trazas de recompensa por update y por subconjunto, sirve como referencia reproducible para comparar recetas de GRPO, coeficientes KL y composiciones de datos.
- Investigación sobre alineamiento y robustez ante jailbreaks: los checkpoints intermedios y la mezcla con wildjailbreak_benign lo hacen útil para estudiar la degradación y recuperación de la recompensa a lo largo del entrenamiento.
- Despliegue en hardware modesto para pruebas de concepto: con 4,66 B de parámetros en bf16 (unos 9,3 GB de pesos), cabe en GPUs de consumo con suficiente VRAM y permite iterar localmente sobre políticas de seguridad antes de escalar a modelos mayores.
- Generación de respuestas con razonamiento visible en entornos de auditoría: el modo thinking con hasta 32.768 tokens generados facilita inspeccionar la cadena de razonamiento que lleva a un rechazo o a una respuesta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí publica la evolución de la recompensa media binaria del juez durante el entrenamiento:

| Ventana de updates | Recompensa media | Rollouts juzgados |
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

Desglose por subconjunto en las ventanas inicial y final:

| Dataset | Updates 310-320 | Updates 750-760 |
|---|---|---|
| agentalign_benign | 0.64 | 0.65 |
| agentalign_harmful | 0.89 | 0.88 |
| codesafetybench | 0.94 | 0.86 |
| difficult_advice | 0.85 | 0.88 |
| magicoder | 0.69 | 0.49 |
| star1_gp3 | 0.84 | 1.00 |
| star_benign_v2 | 0.83 | 0.90 |
| wildjailbreak_benign | 0.86 | 0.83 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16 los pesos ocupan aproximadamente 9,3 GB, por lo que se necesitan en torno a 11-13 GB de VRAM contando caché KV y overhead; el repositorio completo pesa 9,3 GB.
- GPU recomendadas: A100 40/80 GB, H100, B200 o RTX PRO 6000 para entrenamiento y evaluaciones a gran escala; el propio autor usó 1x B200 para entrenamiento y 2x A100 para el juez.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más (RTX 4090, RTX 4080 Super, RTX 5090) en bf16; con cuantización a 8 bits o 4 bits podría ajustarse en 12 GB o menos, aunque no se publican pesos cuantizados.
- Opciones de despliegue: transformers (carga directa con `Qwen3_5ForConditionalGeneration`), y por compatibilidad con el formato estándar de Qwen, servidores tipo vLLM o TGI; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada.
- Latencia y throughput: no disponible (no se documentan mediciones).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8 (este) | 4,66 B | 40.960 (entrenamiento) | RL de seguridad con GRPO sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, checkpoint intermedio |
| Qwen/Qwen3.5-4B-Base | no disponible en la información | no disponible | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (juez usado en el entrenamiento) | no disponible | no disponible | Modelo mayor empleado como evaluador binario | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 760 de 787) con entrenamiento en curso; no debe tratarse como modelo final ni como versión estable.
- La recompensa media fluctúa a lo largo del entrenamiento (de 0.839 a 0.713 y de vuelta a 0.805), lo que indica inestabilidad y posible olvido de capacidades; el subconjunto magicoder cae de 0.69 a 0.49 en la última ventana.
- La evaluación se basa en un único juez (Qwen3.8-27B) con veredicto binario; existe riesgo de sesgo del juez y de sobreajuste a su criterio, no necesariamente al de evaluadores humanos.
- Riesgo de alucinación no cuantificado: no se publican benchmarks de veracidad ni de fidelidad factual.
- Idiomas soportados no documentados; no se garantiza comportamiento seguro fuera del inglés o de los idiomas presentes en la mezcla de datos.
- Las capacidades multimodales no han sido ajustadas: la torre de visión es la del base y no ha pasado por el RL de seguridad, por lo que su comportamiento ante entradas de imagen dañinas no está validado.
- Licencia Apache 2.0 permite uso comercial, pero al ser un modelo de seguridad en entrenamiento conviene validarlo con evaluaciones propias antes de producción.
- El uso de `enable_thinking=true` incrementa el consumo de tokens (hasta 32.768 generados) y, por tanto, la latencia y el coste.
- No se publican pesos cuantizados ni artefactos GGUF, lo que limita el despliegue en entornos de bajos recursos sin trabajo adicional de conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step760
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
