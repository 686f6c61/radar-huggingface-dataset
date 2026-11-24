# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step600

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step600` es un checkpoint intermedio de ajuste fino por aprendizaje reforzado (RL) orientado a seguridad, construido sobre `Qwen/Qwen3.5-4B-Base`. Lo desarrolla el usuario `thkim0305-SNU` y se distribuye con licencia Apache 2.0. No es un modelo terminado: se trata de una instantánea tomada tras 600 actualizaciones del optimizador (iteración Megatron 599) dentro de un entrenamiento que seguía en curso en el momento de la exportación (23 de noviembre de 2026).

El objetivo del entrenamiento es alinear el comportamiento del modelo base en escenarios de riesgo (prompt malicioso, jailbreak, uso de herramientas inseguro, código peligroso) mediante GRPO con recompensas binarias emitidas por un juez externo de 27B parámetros. El conjunto de datos, denominado "mixture-8", combina ocho fuentes de prompts que incluyen trayectorias de uso de herramientas, código y ataques adversariales.

Arquitectura y tamaño: el modelo hereda la arquitectura multimodal `Qwen3_5ForConditionalGeneration` del base, con 4.659.865.088 parámetros totales (4,66B) y pesos en bf16. Solo se ha entrenado la torre del lenguaje; la torre de visión y la cabeza MTP conservan los pesos originales del base, por lo que el checkpoint se carga exactamente igual que el modelo de partida. El contexto de entrenamiento fue de 40.960 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de visión + torre de lenguaje + cabeza MTP); solo se entrena la torre de lenguaje |
| Parametros totales | 4.659.865.088 (4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 40.960 tokens (contexto usado en entrenamiento); contexto nativo del base no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, `Qwen3_5ForConditionalGeneration`) |
| Tarea | text-generation / image-text-to-text |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`) |
| Tamano del repositorio | 9,3 GB |
| Fecha de creacion | 2026-11-23 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base`, un transformer multimodal de 4,66B parámetros con torre de visión, torre de lenguaje y cabeza MTP (multi-token prediction). En este checkpoint solo se han actualizado los pesos de la torre de lenguaje; la torre de visión y la cabeza MTP son los pesos originales del base sin tocar. La exportación desde Megatron `torch_dist` (`iter_0000599`) se realizó con `safety_tuning.hf_export`, refusionando las proyecciones GDN, aplicando el mapeo de nombres Qwen3.5 de Slime y copiando los pesos de visión y MTP del base con dtypes coincidentes con el índice original.

El entrenamiento usa GRPO con recompensas binarias normalizadas por grupo, clip PPO de 0,2 y TIS activado, sobre el framework Slime (rollouts con SGLang, colocados) más Megatron-LM en bf16. Cada actualización emplea 15 prompts × 8 rollouts = 120 secuencias, con learning rate constante de 2e-6, AdamW betas [0,9, 0,95], weight decay 0,1 y grad clip 1,0. Se aplica una pérdida KL de baja varianza contra el modelo inicial con coeficiente 0,001. El muestreo usa temperatura 1,0, top-p 1, hasta 32.768 tokens generados y contexto de 40.960. El chat template de Qwen se aplica con `enable_thinking=true`, y los rollouts con herramientas usan el function calling `qwen3_coder`. La recompensa la emite un juez Qwen3.8-27B con veredicto binario estricto (0/1); los prompts de AgentAlign se juzgan sobre toda la trayectoria visible de uso de herramientas. El schedule contempla una época con padding sobre 11.794 prompts únicos (787 actualizaciones), con checkpoints cada 40 actualizaciones.

El conjunto "mixture-8" se compone de: `star1_gp3` (1.000 prompts), `star_benign_v2` (915), `agentalign_harmful` (2.000), `agentalign_benign` (2.000), `codesafetybench` (900), `magicoder` (1.000), `difficult_advice` (1.982) y `wildjailbreak_benign` (1.997). Los 4.000 prompts de AgentAlign llevan definiciones sintéticas de herramientas y se despliegan como trayectorias multiturno contra un simulador, con las salidas de herramienta enmascaradas en la pérdida. La infraestructura: trainer y motor de rollout en 1× NVIDIA B200; juez Qwen3.8-27B en 2× A100 (SGLang TP2) sobre túnel SSH; reanudado en la actualización 280 desde una ejecución previa en 3× RTX PRO 6000.

## Capacidades

- Generación de texto conversacional multiturno con chat template de Qwen y modo de razonamiento (`enable_thinking=true`).
- Razonamiento explícito ("thinking mode") integrado en el template de chat.
- Generación y razonamiento sobre código, incluyendo código potencialmente sensible (entrenado con `codesafetybench` y `magicoder`).
- Uso de herramientas y function calling mediante el formato `qwen3_coder`, con trayectorias multiturno contra simulador de herramientas.
- Comportamiento orientado a seguridad: rechazo o manejo prudente de prompts dañinos, jailbreaks y solicitudes de consejo delicadas (entrenado con `star1_gp3`, `star_benign_v2`, `wildjailbreak_benign`, `difficult_advice`).
- Capacidad multimodal heredada del base (torre de visión intacta), aunque el ajuste RL no la ha entrenado; el pipeline declarado es `image-text-to-text`.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- Evaluación de alineación en investigación: sirve como checkpoint intermedio para estudiar la evolución de la recompensa del juez a lo largo del entrenamiento (ventanas de actualizaciones 310-320 a 590-600), útil para analizar dinámicas de RLHF/GRPO y colapso de recompensa.
- Filtrado y moderación de prompts: el modelo puede clasificar o reformular solicitudes potencialmente dañinas, aprovechando su entrenamiento con `star1_gp3` y `wildjailbreak_benign` para distinguir peticiones benignas de ataques adversariales.
- Asistente seguro en dominios sensibles: con contexto de 40.960 tokens y modo thinking, puede gestionar conversaciones largas de asesoramiento delicado (`difficult_advice`) manteniendo respuestas prudentes.
- Agentes con uso de herramientas en entornos simulados: soporta trayectorias multiturno con function calling `qwen3_coder`, adecuado para prototipar agentes que deben decidir cuándo invocar herramientas y cómo interpretar sus salidas.
- Generación de código con conciencia de seguridad: útil en pipelines de revisión donde se quiere que el modelo señale patrones peligrosos en código generado o sugerido (`codesafetybench`).
- Baseline para ablaciones de RL: al ser un checkpoint con receta reproducible (lr, KL, clip, tamaño de grupo), permite comparar contra el base y contra checkpoints posteriores en las mismas condiciones.
- Prototipado de asistentes multimodales: aunque la torre de visión no se ha entrenado, el checkpoint carga con `Qwen3_5ForConditionalGeneration` y puede usarse para probar flujos image-text-to-text heredados del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta la recompensa media binaria del juez durante el entrenamiento (antes de normalización por grupo):

| Ventana (updates) | Recompensa media | Rollouts juzgados |
|---|---|---|
| 310-320 | 0,839 | 1200 |
| 350-360 | 0,796 | 1199 |
| 390-400 | 0,786 | 1200 |
| 430-440 | 0,729 | 1200 |
| 470-480 | 0,722 | 1200 |
| 510-520 | 0,713 | 1200 |
| 550-560 | 0,802 | 1200 |
| 590-600 | 0,778 | 1200 |

Desglose por dataset (recompensa media binaria):

| Dataset | 310-320 | 350-360 | 390-400 | 430-440 | 470-480 | 510-520 | 550-560 | 590-600 |
|---|---|---|---|---|---|---|---|---|
| agentalign_benign | 0,64 | 0,54 | 0,57 | 0,50 | 0,54 | 0,54 | 0,59 | 0,52 |
| agentalign_harmful | 0,89 | 0,94 | 0,85 | 0,85 | 0,77 | 0,83 | 0,83 | 0,86 |
| codesafetybench | 0,94 | 0,89 | 0,91 | 0,83 | 0,88 | 0,89 | 0,80 | 0,97 |
| difficult_advice | 0,85 | 0,77 | 0,68 | 0,62 | 0,74 | 0,72 | 0,85 | 0,76 |
| magicoder | 0,69 | 0,69 | 0,70 | 0,65 | 0,67 | 0,59 | 0,60 | 0,62 |
| star1_gp3 | 0,84 | 0,95 | 0,98 | 0,97 | 0,79 | 0,95 | 0,87 | 0,97 |
| star_benign_v2 | 0,83 | 0,98 | 0,98 | 0,90 | 0,89 | 0,85 | 0,95 | 0,96 |
| wildjailbreak_benign | 0,86 | 0,83 | 0,74 | 0,81 | 0,79 | 0,71 | 0,88 | 0,86 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo de pesos, más overhead de activaciones y caché KV; con contexto de 40.960 tokens la caché KV puede añadir varios GB adicionales.
- GPU recomendadas: NVIDIA B200 (usada en entrenamiento), A100 80GB y H100 80GB para servir con contexto largo; GPUs de 24 GB como la RTX 4090 pueden alojar los pesos en bf16 con margen ajustado, pero el contexto largo requerirá cuantización o reducción de ventana.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) o RTX PRO 6000 (usada en la ejecución previa) con contexto moderado; en GPUs de 16 GB probablemente requiera cuantización (no se publican pesos cuantizados).
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` (carga directa, `device_map="auto"`, `dtype="bfloat16"`); el autor menciona SGLang para rollouts y vLLM es compatible con la familia Qwen, aunque no se confirma explícitamente para esta versión 3.5. llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8) | 4,66B | 40.960 (entrenamiento) | RL de seguridad sobre Qwen3.5-4B-Base, checkpoint intermedio | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base | 4,66B (mismo base) | no disponible | Modelo base multimodal sin ajuste de seguridad | Apache 2.0 | Hugging Face |
| Alternativas de seguridad de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la única comparación posible es estructural (mismo base y mismo tamaño).

## Limitaciones y advertencias

- Es un checkpoint intermedio, no un modelo final: el propio autor indica que el entrenamiento seguía en curso en el momento de la exportación.
- La recompensa del juez fluctúa y no mejora de forma monótona (de 0,839 en 310-320 a 0,778 en 590-600), con caídas notables en `magicoder` (0,69 → 0,62) y `difficult_advice` (0,85 → 0,76); sugiere inestabilidad del proceso RL y posible degradación en algunas tareas.
- `agentalign_benign` se mantiene bajo (0,50-0,64), lo que indica dificultad para manejar correctamente trayectorias benignas con herramientas.
- Riesgo de alucinación: no evaluado con benchmarks estándar; no hay datos de MMLU, HumanEval ni GSM8K.
- Sesgos: no documentados por el autor; al derivar de Qwen3.5-4B-Base hereda los sesgos del base, no caracterizados en esta ficha.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe uniforme.
- La torre de visión y la cabeza MTP no se han entrenado; las capacidades multimodales son las del base y no han sido alineadas en seguridad.
- Uso comercial: permitido por Apache 2.0, pero al ser un checkpoint de investigación sin evaluación de producción, no se recomienda su despliegue directo en sistemas críticos.
- El modelo se ha entrenado con un juez automático (Qwen3.8-27B); puede haber sobreajuste al criterio del juez y no a una política de seguridad humana validada.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step600
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de RL): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- SGLang: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible
