# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step680

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step680 es un checkpoint intermedio de ajuste fino por refuerzo (GRPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es la alineación de seguridad (safety tuning): reducir respuestas dañinas, mejorar el rechazo ante peticiones maliciosas y mantener al mismo tiempo un comportamiento útil en tareas benignas, incluyendo trayectorias de uso de herramientas (tool calling).

El modelo conserva la arquitectura multimodal del base (Qwen3_5ForConditionalGeneration, con torre de visión y cabeza MTP intactas), pero solo se ha entrenado el modelo de lenguaje. Cuenta con 4.659.865.088 parámetros totales en precisión bf16 y un contexto de entrenamiento de 40.960 tokens. El checkpoint corresponde a la actualización de optimizador número 680 de un total previsto de 787, por lo que es una instantánea de un entrenamiento todavía en curso, no un modelo final.

Su relevancia es doble: por un lado, documenta de forma transparente una receta completa de RL de seguridad (GRPO con recompensas binarias, juez externo, KL bajo, entrenamiento multi-turno con simulador de herramientas); por otro, sirve como referencia para investigadores que quieran reproducir o continuar este tipo de alineación sobre modelos Qwen3.5 de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`); solo se entrena el modelo de lenguaje, torre de visión y cabeza MTP congeladas |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens en entrenamiento (contexto máximo del modelo base: no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza de predicción multi-token (MTP). En este checkpoint solo se actualizan los pesos del modelo de lenguaje; la torre de visión y la cabeza MTP se copian sin modificar desde el base, de modo que el checkpoint se carga exactamente igual que el modelo original. El entrenamiento se realizó con GRPO (recompensas binarias normalizadas por grupo), PPO clip de 0,2, importance sampling truncado (TIS) activado, coeficiente KL de 0,001 frente al modelo de partida congelado y learning rate constante de 1e-6 con AdamW (betas 0,9/0,95, weight decay 0,1, grad clip 1,0). El stack es Slime (rollouts con SGLang colocados) más Megatron-LM en bf16, sobre dos GPUs B200.

Cada actualización usa 15 prompts con 8 rollouts por prompt (120 secuencias), muestreando con temperatura 1,0, top-p 1, hasta 32.768 tokens generados y 40.960 de contexto, con plantilla de chat Qwen y `enable_thinking=true`. La recompensa la otorga un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se evalúan sobre toda la trayectoria visible de uso de herramientas. El conjunto "mixture-8" suma 11.794 prompts únicos (star1_gp3, star_benign_v2, agentalign_harmful, agentalign_benign, codesafetybench, magicoder, difficult_advice y wildjailbreak_benign); 4.000 de ellos (AgentAlign) incorporan definiciones sintéticas de herramientas y se despliegan como trayectorias multi-turno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. El plan de entrenamiento es una época con padding (787 actualizaciones) y checkpoints cada 80 pasos; este es el paso 680.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen y modo de razonamiento explícito (`enable_thinking=true`).
- Razonamiento multi-paso y cadenas de pensamiento antes de responder.
- Uso de herramientas (function calling) con el formato `qwen3_coder`, incluyendo trayectorias multi-turno con llamadas encadenadas.
- Comportamiento orientado a seguridad: rechazo de peticiones dañinas y cumplimiento de peticiones benignas, ajustado mediante recompensa binaria de un juez externo.
- Capacidad de entrada imagen-texto heredada de la arquitectura base (`image-text-to-text`), aunque la torre de visión no se ha entrenado en este ajuste.
- Capacidades de código, incluidas las evaluadas en el conjunto codesafetybench y en prompts de Magicoder.
- Capacidades multilingües: no disponible (no se documentan idiomas).

## Casos de uso

- Filtrado y moderación de contenido: el modelo puede usarse como clasificador generativo de peticiones y respuestas, aprovechando su ajuste hacia rechazos consistentes en dominios de seguridad de código y consejo difícil.
- Asistentes con uso de herramientas en producción: al haberse entrenado con trayectorias multi-turno y el formato `qwen3_coder`, es adecuado para agentes que encadenan llamadas a funciones con contexto de hasta 40.960 tokens.
- Investigación en alineación: sirve como checkpoint de referencia para estudiar la evolución de la recompensa del juez a lo largo del entrenamiento y comparar con el modelo base o con checkpoints posteriores.
- Evaluación de robustez ante jailbreaks: el conjunto wildjailbreak_benign permite medir la tasa de falsos rechazos en peticiones benignas que imitan ataques.
- Generación de código con requisitos de seguridad: útil en pipelines que necesitan sugerencias de código que eviten patrones peligrosos (evaluado en codesafetybench).
- Consejo sensible y conversación de apoyo: el conjunto difficult_advice entrena respuestas prudentes ante consultas delicadas, útil en asistentes de orientación con supervisión humana.
- Base para ajuste posterior: al mantener intactas visión y MTP y cargar como el base, puede servir de punto de partida para fine-tuning específico de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta la recompensa media binaria del juez durante el entrenamiento (antes de normalización por grupo):

| Ventana de actualizaciones | Recompensa media | Rollouts evaluados |
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
| 670-680 | 0,830 | 1200 |

Por conjunto de datos en la ventana 670-680: agentalign_benign 0,71; agentalign_harmful 0,85; codesafetybench 0,95; difficult_advice 0,92; magicoder 0,62; star1_gp3 0,98; star_benign_v2 0,84; wildjailbreak_benign 0,86.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, más caché KV y activaciones; en la práctica, 12-16 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 5 GB de pesos; en 4 bits: alrededor de 2,5-3 GB (no se distribuyen pesos cuantizados oficialmente).
- GPU recomendadas: A100, H100 o B200 para entrenamiento y serving de alta concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en bf16 para contextos cortos, y en 8 GB o más con cuantización de 4-8 bits.
- Opciones de despliegue: `transformers` (soporte nativo de `Qwen3_5ForConditionalGeneration`), vLLM y SGLang para serving con tool calling, TGI; llama.cpp/Ollama solo si se generan pesos GGUF (no disponibles en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning Qwen3.5-4B GRPO) | 4,66 B | 40.960 (entrenamiento) | Ajuste RL de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4 B (aprox.) | no disponible | Modelo base multimodal | Apache 2.0 | Hugging Face |
| Alternativas de safety tuning de 4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de alineación de seguridad en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 680 de 787): el autor advierte explícitamente de que el entrenamiento sigue en curso y no es un modelo final.
- Riesgo de sobreajuste a la seguridad: la recompensa media en agentalign_benign (0,71) y magicoder (0,62) es inferior a la de los conjuntos dañinos, lo que sugiere posibles rechazos excesivos o degradación de utilidad en tareas benignas.
- La recompensa depende de un juez automático (Qwen3.8-27B con veredicto binario), lo que puede introducir sesgos del juez y no garantiza seguridad real en producción.
- Riesgo de alucinación inherente al modelo base de 4B; el ajuste RL no lo elimina.
- Idiomas soportados no documentados; el comportamiento fuera del inglés no está validado.
- La torre de visión no se ha entrenado: las capacidades de imagen son las del base sin garantías de alineación de seguridad en ese modalidad.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de desplegarlo.
- Sin descargas ni validación de la comunidad (0 descargas, 0 likes) en el momento de la ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr1e-6-kl0.001-p15-k8-step680
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
