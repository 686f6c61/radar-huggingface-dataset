# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step787

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step787 es un checkpoint intermedio de ajuste fino mediante GRPO (Group Relative Policy Optimization) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es el alineamiento de seguridad: se entrena al modelo para que responda de forma segura ante prompts dañinos, incluyendo trayectorias de uso de herramientas, manteniendo al mismo tiempo un comportamiento útil ante prompts benignos. El checkpoint corresponde a la actualización de optimizador 787 (iteración Megatron 786) de un entrenamiento que sigue en curso, por lo que no debe considerarse un modelo final.

El modelo conserva la arquitectura multimodal de Qwen3.5, con 4.659.865.088 parámetros totales en pesos bf16 (aproximadamente 4,66 mil millones). Solo se entrenó el modelo de lenguaje; la torre de visión y la cabeza MTP (multi-token prediction) mantienen los pesos originales del modelo base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base mediante `Qwen3_5ForConditionalGeneration`. El contexto de entrenamiento fue de 40.960 tokens, con hasta 32.768 tokens generados por rollout.

Su relevancia es doble: por un lado, documenta de forma transparente una receta de RL de seguridad sobre un modelo multimodal pequeño y desplegable en hardware de consumo; por otro, publica la evolución del reward del juez a lo largo del entrenamiento por subconjunto de datos, lo que permite analizar cómo evoluciona el alineamiento de seguridad frente a la utilidad. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con torre de visión y cabeza MTP; solo se entrenó el modelo de lenguaje |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento; el contexto máximo de inferencia no se especifica en la información disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP, y aplica GRPO sobre el modelo de lenguaje con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS (truncated importance sampling) activado. El framework de entrenamiento combina Slime (rollouts con SGLang en modo colocado) y Megatron-LM en bf16. Cada actualización usa 15 prompts con 8 rollouts por prompt (120 secuencias), learning rate constante de 1e-6 con AdamW (betas [0,9, 0,95]), weight decay 0,1, grad clip 1,0 y una pérdida KL de baja varianza con coeficiente 0,001 respecto al modelo de partida congelado. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. Se emplea la plantilla de chat de Qwen con `enable_thinking=true`, y los rollouts de herramientas usan function calling estilo `qwen3_coder`.

El reward lo otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1) según la especificación del proyecto; los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de herramientas. El conjunto de datos "mixture-8" suma 11.794 prompts únicos en un epoch con padding: star1_gp3 (1.000), star_benign_v2 (915), agentalign_harmful (2.000), agentalign_benign (2.000), codesafetybench (900), magicoder (1.000), difficult_advice (1.982) y wildjailbreak_benign (1.997). Los 4.000 prompts de AgentAlign incluyen definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El entrenamiento se ejecutó en dos GPU B200 (juez en la GPU 0, entrenador y motor de rollout en la GPU 1) y el checkpoint se exportó el 2026-11-21 desde el `torch_dist` de Megatron `iter_0000786`, con refusión de las proyecciones GDN y mapeo de nombres de Slime a Qwen3.5.

## Capacidades

- Generación de texto conversacional y razonamiento con modo de pensamiento (`enable_thinking=true`) mediante la plantilla de chat de Qwen.
- Capacidades multimodales imagen-texto heredadas del modelo base (torre de visión sin entrenar en este checkpoint).
- Tool calling / function calling con el formato `qwen3_coder`, incluyendo trayectorias multi-turno con un simulador de herramientas.
- Razonamiento multi-paso y comportamiento agéntico, reforzado específicamente sobre los conjuntos AgentAlign (dañinos y benignos).
- Generación de código y respuesta a prompts de seguridad en código (Codesafetybench, Magicoder).
- Mayor robustez ante jailbreaks y prompts adversarios (WildJailbreak, Star1, difficult_advice), según la evolución del reward del juez.
- Capacidades multilingües: no disponible (no se documentan idiomas soportados).

## Casos de uso

- Moderación y filtrado de contenido en producción: el modelo puede clasificar o reescribir respuestas ante prompts dañinos, aprovechando el ajuste específico sobre agentalign_harmful, star1_gp3 y wildjailbreak_benign, con un reward de juez que pasa de 0,417 a ~0,815 a lo largo del entrenamiento.
- Asistentes con herramientas en entornos sensibles: el entrenamiento sobre trayectorias multi-turno de AgentAlign permite desplegarlo en agentes que invocan APIs y deben rechazar acciones peligrosas manteniendo la utilidad en tareas benignas.
- Revisión de seguridad de código generado: el ajuste sobre Codesafetybench (reward ~0,89-0,95 en las últimas ventanas) lo hace adecuado para pipelines que auditan sugerencias de código antes de fusionarlas.
- Investigación en RL de alineamiento: al publicar la curva de reward por dataset y por ventana de actualizaciones, sirve como referencia reproducible para estudiar la tensión entre seguridad y utilidad (por ejemplo, la caída de magicoder de 0,75 a 0,54).
- Evaluación de robustez ante jailbreaks: útil como modelo de comparación en benchmarks de red-teaming, dado que fue entrenado explícitamente contra WildJailbreak y prompts adversarios.
- Despliegue en hardware limitado: con ~4,66 mil millones de parámetros en bf16 (unos 9,3 GB de pesos), es viable en una única GPU de consumo de gama alta para prototipos de asistentes seguros con contexto largo.
- Generación de respuestas de asesoramiento delicado: el fuerte incremento en difficult_advice (de 0,28 a ~0,93) lo hace candidato para sistemas de orientación que deben evitar consejos peligrosos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card únicamente reporta el reward medio del juez durante el entrenamiento (media binaria cruda antes de normalización por grupo), que no equivale a un benchmark estándar:

| Ventana de actualizaciones | Reward medio | Rollouts juzgados |
|---|---|---|
| 0-10 | 0,417 | 1200 |
| 70-80 | 0,578 | 1200 |
| 150-160 | 0,708 | 1200 |
| 230-240 | 0,768 | 1200 |
| 310-320 | 0,837 | 1200 |
| 390-400 | 0,804 | 1200 |
| 470-480 | 0,801 | 1200 |
| 550-560 | 0,841 | 1200 |
| 630-640 | 0,792 | 1200 |
| 710-720 | 0,815 | 1200 |
| 750-760 | 0,815 | 1200 |

Desglose por subconjunto en ventanas seleccionadas:

| Dataset | 0-10 | 310-320 | 550-560 | 750-760 |
|---|---|---|---|---|
| agentalign_benign | 0,41 | 0,66 | 0,68 | 0,63 |
| agentalign_harmful | 0,63 | 0,89 | 0,93 | 0,91 |
| codesafetybench | 0,47 | 0,89 | 0,95 | 0,89 |
| difficult_advice | 0,28 | 0,90 | 0,84 | 0,93 |
| magicoder | 0,51 | 0,75 | 0,68 | 0,54 |
| star1_gp3 | 0,57 | 0,95 | 0,96 | 0,96 |
| star_benign_v2 | 0,27 | 0,76 | 0,91 | 0,90 |
| wildjailbreak_benign | 0,27 | 0,79 | 0,85 | 0,83 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más overhead de activaciones y caché KV; con contexto de 40.960 tokens la caché KV eleva sustancialmente el consumo.
- Cuantización: no se publican versiones GGUF/AWQ/GPTQ oficiales; habría que generarlas a partir de los safetensors bf16.
- GPU recomendadas: A100 40/80 GB, H100 o B200 para entrenamiento y para inferencia con contexto máximo; RTX 4090 (24 GB) es suficiente para inferencia en bf16 con contextos moderados.
- Cabe en GPU de consumo: sí, en tarjetas con 16-24 GB (RTX 4080/4090, RTX 3090) para bf16 con contexto limitado; en 12 GB requeriría cuantización no oficial.
- Opciones de despliegue: `transformers` (carga directa con `Qwen3_5ForConditionalGeneration`), vLLM y SGLang para serving; llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no disponibles).
- Latencia y throughput: no disponible (no se publican medidas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning Qwen3.5-4B GRPO step787) | ~4,66 B | 40.960 en entrenamiento | RL de seguridad (GRPO) sobre base multimodal | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-4B-Base | ~4,66 B (según este repo) | no disponible | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Modelos de seguridad de 4B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un checkpoint intermedio (actualización 787 de un entrenamiento en curso), no un modelo final; su comportamiento puede ser inestable y no está validado para producción.
- El reward del juez fluctúa entre ventanas (por ejemplo, 0,837 en 310-320 frente a 0,740 en 510-520), lo que indica variabilidad en el alineamiento durante el entrenamiento.
- Se observa una posible degradación de utilidad en código: magicoder cae de 0,75 (310-320) a 0,54 (750-760), y agentalign_benign baja de 0,68 a 0,63, lo que sugiere un compromiso entre seguridad y utilidad.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos conocidos: no documentados; el entrenamiento se basa en un juez automático (Qwen3.8-27B) con veredicto binario, lo que puede introducir sesgos del juez en el comportamiento final.
- Idiomas soportados: no disponibles; no hay garantía de comportamiento de seguridad fuera del inglés.
- La torre de visión y la cabeza MTP no fueron entrenadas, por lo que las capacidades multimodales no se benefician del ajuste de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un checkpoint de investigación sin evaluación externa, su uso en producción conlleva riesgo no cuantificado.
- No se publican cuantizaciones oficiales ni métricas de latencia/throughput.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step787
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la información proporcionada.
