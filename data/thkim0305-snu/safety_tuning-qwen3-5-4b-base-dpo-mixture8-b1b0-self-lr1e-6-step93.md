# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step93

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step93 es un checkpoint intermedio de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo del entrenamiento es mejorar el comportamiento de seguridad del modelo (rechazo de peticiones dañinas, respuestas robustas ante jailbreaks, alineación en contextos agénticos y de código) manteniendo la capacidad general del modelo base. Se trata de un experimento de investigación, no de un modelo final publicado.

El checkpoint corresponde al update 93 de 186 (final del primer epoch de dos), por lo que el entrenamiento seguía en curso en el momento de la exportación. Los pesos están en bf16 con el formato `Qwen3_5ForConditionalGeneration`; solo se entrenó el modelo de lenguaje, mientras que la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que Qwen3.5-4B-Base.

Es relevante ahora porque documenta una receta reproducible de safety tuning con DPO sobre pares autogenerados por el propio modelo base (self-pairs evaluados por un juez binario estricto), usando Slime + Megatron-LM y contexto de 32 768 tokens. Con 4 659 865 088 parámetros, licencia Apache 2.0 y soporte multimodal image-text-to-text heredado del base, es un punto de partida útil para quienes investigan alineación de seguridad en modelos de ~4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5): modelo de lenguaje + torre de visión + cabeza MTP; clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 4 659 865 088 (~4,66B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32 768 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, formato Hugging Face transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction). En este checkpoint solo se ha entrenado el modelo de lenguaje mediante DPO con objetivo sigmoide, beta 0.1, aplicado sobre la respuesta completa (razonamiento, respuesta final y llamadas a herramientas). La torre de visión y la cabeza MTP son los pesos originales sin tocar, y el checkpoint se exportó re-fusionando las proyecciones GDN y aplicando el mapeo de nombres de Slime para Qwen3.5, con dtypes alineados al índice del base.

Los pares de preferencia son self-pairs generados por el propio Qwen3.5-4B-Base: la respuesta elegida es una trayectoria que superó un juez binario estricto (score 1) y la rechazada es una trayectoria del mismo prompt que falló (score 0), emparejadas uno a uno sin reutilización. El conjunto consta de 5 941 pares procedentes de 4 600 prompts, repartidos en ocho fuentes (agentalign_benign 652, agentalign_harmful 941, codesafetybench 481, difficult_advice 1 027, magicoder 600, star1_gp3 432, star_benign_v2 531, wildjailbreak_benign 1 277). El entrenamiento usó Slime + Megatron-LM, cómputo bf16 con estado del optimizador en fp32, tensor parallel 4, learning rate pico 1e-06 con warmup lineal del 10 % y decaimiento coseno hasta 2e-07, Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.0 y grad clip 1.0. Se ejecutó en 4x H100 80GB durante 2 epochs x 93 updates de 64 pares; las trayectorias de más de 32 768 tokens se excluyeron enteras, nunca se truncaron. El prompt del estudiante usa la plantilla nativa de chat del base, con system "You are a helpful assistant." y thinking activado.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activable mediante la plantilla de chat (`enable_thinking=True`).
- Capacidades multimodales image-text-to-text heredadas del modelo base (torre de visión intacta).
- Procesamiento de contexto largo: hasta 32 768 tokens en el entrenamiento.
- Alineación de seguridad: el objetivo del ajuste es mejorar el rechazo de peticiones dañinas y la robustez ante jailbreaks (fuentes wildjailbreak_benign, star_benign_v2, agentalign_harmful).
- Comportamiento en contextos agénticos y de uso de herramientas, entrenado sobre trayectorias que incluyen tool calls (agentalign_benign, agentalign_harmful).
- Seguridad en código: pares derivados de codesafetybench y magicoder.
- Consejo difícil y refusal calibrado: pares de difficult_advice.
- Capacidades multilingües: no disponibles (no se documentan idiomas).
- No se documenta soporte explícito de audio.

## Casos de uso

- Investigación en alineación de seguridad: usar el checkpoint como referencia intermedia para estudiar cómo evoluciona la tasa de rechazo y la utilidad a lo largo de los updates DPO (hay checkpoints en los updates 23, 47, 70, 93, 116, 140, 163 y 186).
- Evaluación de robustez ante jailbreaks: probar prompts adversariales del estilo wildjailbreak y comparar la tasa de cumplimiento frente al base sin ajustar.
- Filtrado y moderación de contenido en pipelines internos: desplegar el modelo como clasificador generativo de seguridad sobre conversaciones, aprovechando su contexto de 32 768 tokens para analizar hilos completos.
- Asistente conversacional con rechazo calibrado: integrarlo en un chatbot donde se requiera negarse a peticiones dañinas sin sobre-rechazar consultas legítimas (entrenado con pares benignos y harmful).
- Evaluación de seguridad en generación de código: analizar si el modelo evita sugerir código inseguro o malicioso en tareas de programación, usando los pares de codesafetybench y magicoder como conjunto de prueba.
- Investigación en DPO con self-pairs: reproducir la receta (juez binario estricto, pares uno a uno sin reutilización) sobre otros modelos base para comparar dinámicas de entrenamiento.
- Análisis multimodal de seguridad: al conservar la torre de visión, permite estudiar si el ajuste de seguridad del LM afecta a respuestas sobre imágenes en escenarios image-text-to-text.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; en la práctica, entre 12 y 16 GB para contexto moderado.
- En cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB (estimaciones, no verificadas por el autor).
- GPU recomendadas para entrenamiento o ajuste: 4x H100 80GB fue la configuración usada (tensor parallel 4).
- GPU consumer: cabe en tarjetas con 16 GB o más (RTX 4080, RTX 4090, RTX 5070 Ti y superiores) en bf16 con contexto reducido; en 4-8 bits podría caber en GPUs de 8-12 GB.
- Opciones de despliegue: transformers (receta oficial de la model card), vLLM, TGI y llama.cpp/Ollama mediante conversión a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step93 | ~4,66B | 32 768 | DPO de seguridad sobre Qwen3.5-4B-Base | Apache 2.0 | Checkpoint intermedio (update 93/186), sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | ~4,66B | no disponible | Modelo base multimodal | Apache 2.0 | Referencia congelada del DPO; sin ajuste de seguridad |
| Otros checkpoints del mismo run (updates 23, 47, 70, 116, 140, 163, 186) | ~4,66B | 32 768 | DPO de seguridad | Apache 2.0 | Misma receta, distinto punto de entrenamiento |
| Modelos de seguridad de ~4B de otros autores | no disponible | no disponible | safety tuning | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Es un checkpoint intermedio (update 93 de 186, final del primer epoch de dos): el entrenamiento no había terminado y no debe tratarse como modelo final.
- No se han publicado benchmarks de seguridad ni de utilidad; no hay evidencia cuantitativa de mejora frente al base.
- El juez binario que genera los pares es el propio pipeline del autor; los sesgos del juez se propagan al modelo entrenado.
- Riesgo de alucinación inherente a un modelo de ~4B; el ajuste DPO de seguridad no lo elimina.
- El sobre-rechazo es un riesgo real al entrenar con fuentes harmful y de refusal; no se documenta la tasa de falsos rechazos.
- Idiomas soportados no documentados; el comportamiento multilingüe del ajuste es desconocido.
- Solo se entrenó el modelo de lenguaje: la torre de visión y la cabeza MTP no están alineadas con el ajuste de seguridad, por lo que el comportamiento multimodal puede ser inconsistente con el textual.
- Uso comercial permitido por Apache 2.0, pero sin garantías del autor; el modelo se distribuye tal cual.
- El nombre del repo incluye hiperparámetros (lr1e-6, step93, Mixture8, B1B0) que conviene verificar antes de citarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step93
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de DPO: no disponible en la información proporcionada
- Repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
- Demo o blog del autor: no disponible en la información proporcionada
