# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-save40-step40

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-save40-step40 es un ajuste fino del modelo Qwen/Qwen3.5-4B-Base realizado por el usuario thkim0305-SNU mediante GRPO (Group Relative Policy Optimization) con el objetivo declarado de safety tuning. El modelo conserva la arquitectura y los pesos de visión del modelo base, y añade un entrenamiento de refuerzo de 40 actualizaciones de optimizador sobre un conjunto de prompts ("Mixture8"), con una tasa de aprendizaje de 2e-6, coeficiente KL de 0.001 y 15 prompts con 8 respuestas por actualización.

Se trata de un experimento de investigación de escala reducida: el repositorio acumula 2 descargas y 0 likes, y el nombre del checkpoint codifica todos los hiperparámetros del run, lo que sugiere un artefacto de seguimiento de experimentos más que un modelo listo para producción. El pipeline declarado es image-text-to-text, por lo que hereda la modalidad multimodal del Qwen3.5-4B-Base, aunque la model card no documenta ninguna evaluación específica de capacidades de visión tras el ajuste.

Su relevancia es limitada pero concreta: sirve como referencia reproducible de un pipeline GRPO aplicado a safety tuning sobre un modelo multimodal de 4.660 millones de parámetros bajo licencia Apache 2.0, y permite estudiar el efecto de un número muy bajo de pasos de RL (40) sobre el comportamiento de seguridad de un modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5), derivada de Qwen/Qwen3.5-4B-Base; incluye torre de visión y pesos MTP (multi-token prediction) heredados del base |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión 1001bb4d826a52d1f399e183466143f4da7b741b) y mantiene su arquitectura: un transformer multimodal con torre de visión y pesos de multi-token prediction (MTP) que, según la model card, no fueron entrenados durante este ajuste y provienen directamente del modelo base fijado. El entrenamiento se realizó con Megatron (se menciona "Megatron iteration 39") y se exportó a formato transformers con pesos de inferencia, configuración y tokenizer.

El ajuste consiste en un run de GRPO identificado como grpo-mixture8-qwen35base4b-lr2e6-save40-pro6000-gpu0123-20261118-v1, con 40 actualizaciones de optimizador completadas. Los hiperparámetros documentados son: learning rate 2e-6, coeficiente KL 0.001, 15 prompts por actualización y 8 respuestas por prompt (k=8), sobre un dataset denominado "Mixture8". El nombre del checkpoint indica una variante "binary", presumiblemente una recompensa binaria, aunque la model card no detalla la función de recompensa ni la composición del dataset. No se documentan número de tokens de entrenamiento, composición del corpus, ni fases de SFT/DPO previas.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.5-4B-Base.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con la torre de visión del modelo base sin reentrenar en este run.
- Razonamiento y matemáticas: capacidades del base, no verificadas tras el ajuste.
- Generación de código: capacidad del base, no evaluada en este checkpoint.
- Tool calling / function calling: no documentado en la model card.
- Comportamiento agéntico y razonamiento multi-paso: no documentado.
- Multilingüismo: no documentado; los idiomas del base no se listan en este repositorio.
- Safety tuning: el objetivo declarado del run es mejorar el comportamiento de seguridad mediante GRPO con recompensa binaria, aunque no se aportan métricas de seguridad ni de utilidad.

## Casos de uso

- Investigación en RLHF/GRPO: reproducir o comparar el efecto de 40 pasos de GRPO con KL 0.001 y recompensa binaria sobre un modelo base de 4,66 B; útil para estudiar la estabilidad del entrenamiento con pocos pasos.
- Estudio de safety tuning: analizar cómo cambia la tasa de rechazo y la calidad de respuesta de un modelo multimodal pequeño tras un ajuste de seguridad ligero, comparándolo con el base sin ajustar.
- Baseline en experimentos de alineación: usar este checkpoint como punto de comparación (step 40) frente a runs más largos del mismo pipeline, dado que el nombre codifica todos los hiperparámetros.
- Prototipado de asistentes multimodales en local: al ser un modelo de 4,66 B con licencia Apache 2.0, puede desplegarse en una GPU consumer para pruebas de concepto de imagen-texto, asumiendo que no hay evaluación de calidad publicada.
- Evaluación de robustez multimodal: comprobar si el ajuste de seguridad afecta a la interpretación de imágenes o a la coherencia entre modalidades, ya que la torre de visión no se entrenó.
- Docencia y divulgación: ejemplo didáctico de un pipeline completo Megatron → GRPO → exportación a transformers con safetensors para un modelo multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB según longitud de contexto.
- Cuantización a 8 bits: ~4,7 GB de pesos; a 4 bits: ~2,4 GB, aunque no se publican versiones GGUF ni AWQ/GPTQ oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia; RTX 4090 (24 GB) para fp16 con contexto moderado.
- GPU consumer: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización, en GPUs de 8-12 GB (RTX 4070, RTX 3060 12 GB), siempre que se genere la cuantización por cuenta propia.
- Despliegue: transformers (soporte nativo del repo), vLLM y TGI previsiblemente compatibles al ser arquitectura Qwen3.5, aunque no se documenta compatibilidad verificada; llama.cpp/Ollama requerirían conversión a GGUF no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-GRPO (este) | 4,66 B | no disponible | imagen-texto | Apache 2.0 | checkpoint experimental, 2 descargas |
| Qwen/Qwen3.5-4B-Base | ~4 B (según nombre) | no disponible | imagen-texto | Apache 2.0 (según repo base) | modelo base oficial |
| Alternativas de ~4 B para safety tuning | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento del modelo ni de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y modalidad.

## Limitaciones y advertencias

- Checkpoint experimental con 2 descargas y 0 likes: no hay validación externa ni revisión por pares.
- Sin benchmarks ni métricas de seguridad publicadas: no se puede afirmar que el safety tuning sea efectivo ni que no degrade la utilidad.
- El nombre indica recompensa "binary", pero no se documenta la función de recompensa, el dataset "Mixture8" ni los criterios de seguridad, lo que impide auditar el ajuste.
- Solo 40 actualizaciones de optimizador: el efecto sobre el comportamiento del modelo puede ser marginal o inestable.
- La torre de visión y los pesos MTP no se entrenaron; el rendimiento multimodal es el del base, sin garantías tras el ajuste.
- Idiomas soportados no documentados: riesgo de comportamiento inconsistente fuera del inglés si el base no estaba equilibrado.
- Riesgo de alucinación inherente a un modelo de 4,66 B, no mitigado de forma documentada.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-4B-Base conviene verificar los términos del modelo base y de los datos de entrenamiento no divulgados.
- No hay pesos cuantizados oficiales ni garantía de compatibilidad con vLLM, llama.cpp u Ollama.
- El identificador del repositorio es extremadamente largo y codifica hiperparámetros; puede complicar la integración en pipelines y la citación.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-save40-step40
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Perfil del autor: https://huggingface.co/thkim0305-SNU
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio Megatron-LM: https://github.com/NVIDIA/Megatron-LM
