# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step280

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step280` es un ajuste fino del modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. Se trata de un checkpoint intermedio de un entrenamiento con GRPO (Group Relative Policy Optimization) orientado al alineamiento de seguridad (safety tuning), con 280 pasos de optimizador completados. El nombre del repositorio codifica los hiperparámetros del experimento: learning rate 2e-6, coeficiente KL 0.001, 15 prompts y 8 respuestas por actualización, y reanudación desde el paso 80.

El modelo conserva la arquitectura multimodal del base Qwen3.5-4B-Base (pipeline `image-text-to-text`), con aproximadamente 4.660 millones de parámetros totales y pesos exportados en safetensors. Es relevante como artefacto de investigación para estudiar la dinámica de GRPO aplicado a alineamiento de seguridad en modelos multimodales de tamaño medio, aunque no es un modelo final pulido ni destinado a producción.

La ficha se basa exclusivamente en los metadatos y la model card disponibles; no hay resultados de benchmarks, idiomas declarados ni documentación adicional publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5; variante `qwen3_5`), con componentes de visión y MTP (multi-token prediction) heredados del base |
| Parametros totales | 4.659.865.088 (~4,66 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`), un transformer multimodal de la familia Qwen3.5 con torre de visión y pesos MTP (multi-token prediction). Según la model card, los pesos de visión y los pesos MTP no entrenados proceden directamente del base fijado; el ajuste GRPO se aplica sobre el resto.

El entrenamiento es un run GRPO identificado como `grpo-mixture8-qwen35base4b-lr2e6-resume80-save40-pro6000-gpu0123-20261119-v1`, con 280 actualizaciones de optimizador completadas (iteración Megatron 279). Hiperparámetros declarados: learning rate 2e-6, coeficiente KL 0.001, 15 prompts y 8 respuestas por actualización, reanudado desde el paso 80. El sufijo "binary" y "Mixture8" sugieren una recompensa binaria sobre una mezcla de 8 categorías o conjuntos de prompts, aunque la model card no detalla la composición del dataset, el número de tokens de entrenamiento ni el esquema exacto de recompensa.

## Capacidades

- Generación de texto conversacional (`conversational`), heredada del base Qwen3.5.
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión del base.
- Razonamiento y respuestas multi-turno, sujeto a la ventana de contexto del base (no documentada aquí).
- Alineamiento de seguridad parcial: el checkpoint está entrenado con GRPO sobre señales de recompensa orientadas a seguridad, aunque al ser un paso intermedio (280) no debe asumirse convergencia.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Capacidades de agente y multi-step reasoning: no disponible (no declarado).
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre GRPO para safety tuning: usar este checkpoint para analizar cómo evolucionan las respuestas seguras a lo largo de los pasos de optimizador (comparándolo con checkpoints anteriores y posteriores del mismo run).
- Evaluación de alineamiento en modelos multimodales de 4B: servir el modelo con transformers y someterlo a baterías de prompts de seguridad (red teaming) para medir tasas de rechazo y falsos rechazos.
- Estudio de estabilidad de entrenamiento: el checkpoint intermedio permite inspeccionar deriva respecto al base y efecto del coeficiente KL 0.001 sobre la política.
- Baseline para ablaciones de hiperparámetros: comparar este run (lr 2e-6, 15 prompts, 8 respuestas) con variantes del mismo autor para aislar el efecto de cada elección.
- Prototipado de asistentes conversacionales con entrada de imagen en entornos controlados: al heredar la torre de visión del base, puede procesar consultas imagen-texto en demos internas, sin garantías de producción.
- Generación de datos sintéticos para filtros de seguridad: usar el modelo para producir respuestas candidatas que luego se etiqueten y se incorporen a pipelines de moderación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9,3 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto corto.
- Cuantización a 8 bits: ~5 GB de pesos; a 4 bits: ~2,5-3 GB, aunque no se publican GGUF oficiales y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en bf16 con contexto largo y batch; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en bf16 con contexto moderado.
- Consumer GPU: sí, en tarjetas de 16 GB o más en bf16 con contexto limitado; en 8-12 GB requiere cuantización.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles (`endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Safety_Tuning-Qwen3.5-4B-Base GRPO step 280) | ~4,66 B | no disponible | sin benchmarks publicados | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B-Base (modelo base) | ~4,66 B (según este repo) | no disponible en esta ficha | sin datos en esta ficha | apache-2.0 (según este repo) | Hugging Face |
| Qwen3-4B (generación anterior de la familia) | ~4 B | no disponible en esta ficha | sin datos en esta ficha | apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los alternativos en la información proporcionada; la comparación se limita a parámetros, licencia y procedencia.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 280 pasos de optimizador; no es un modelo final y puede exhibir comportamiento inestable o incompletamente alineado.
- Sin benchmarks ni evaluación de seguridad publicada: no hay evidencia de que las salvaguardas funcionen en producción.
- Riesgo de alucinación: inherente a modelos de 4B sin documentación de mitigación; sin datos específicos.
- Sesgos conocidos: no documentados; hereda los sesgos del base y de la mezcla de prompts de entrenamiento, no descrita.
- Idiomas y contexto: no declarados; no asumir cobertura multilingüe ni ventanas largas sin verificación empírica.
- Licencia apache-2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar los términos del base y las obligaciones de atribución.
- Componentes de visión y MTP no entrenados: provienen del base fijado, por lo que no han recibido ajuste de seguridad; posibles discrepancias entre modalidades.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; tratar como artefacto experimental.
- El nombre del repositorio expone hiperparámetros; no sustituye documentación de dataset, recompensa o criterios de evaluación, que no están disponibles.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-GRPO-Mixture8-binary-lr2e-6-kl0.001-p15-k8-resume80-step280
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper de GRPO (DeepSeekMath): https://arxiv.org/abs/2402.03300
- Repositorio TRL (implementación de GRPO): https://github.com/huggingface/trl
- Paper de Qwen (familia de modelos): https://arxiv.org/abs/2309.16609
