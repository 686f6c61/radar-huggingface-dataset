# upseem/unseen-gemma-4-26b-abliteration-method

## Resumen

Este repositorio de Hugging Face, creado por el usuario upseem, no contiene pesos de modelo, sino documentación detallada del método de abliteración aplicado al modelo google/gemma-4-26B-A4B-it. El objetivo es registrar cómo replicar el proceso de eliminación de mecanismos de rechazo usando la técnica de proyección ortogonal de dirección única propuesta por Arditi et al. (2024). El modelo base es un MoE multimodal de 26B parámetros totales (4B activos) con una ventana de contexto de 262144 tokens.

La relevancia de este repositorio reside en que ofrece una guía de reproducción para investigadores interesados en interpretabilidad, alineamiento y en la creación de modelos sin rechazos, sin incluir los pesos por restricciones de licencia o espacio. El método documentado permite modificar permanentemente los pesos del modelo base, de modo que el resultado sea compatible con despliegues mediante vLLM o kernels CUDA personalizados, sin necesidad de hooks en tiempo de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (MoE multimodal) |
| Parametros totales | 26B (estimado por la nomenclatura del modelo base) |
| Parametros activos | 4B (estimado por la nomenclatura del modelo base) |
| Longitud de contexto | 262144 tokens (max_position_embeddings del modelo base) |
| Tipos de cuantizacion | no disponible (el repositorio no incluye pesos) |
| Idiomas soportados | no disponibles (según metadata de Hugging Face) |
| Licencia | MIT (repositorio); el modelo base google/gemma-4-26B-A4B-it tiene su propia licencia Gemma |
| Formato de pesos | no disponible (sin pesos; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-26B-A4B-it es un transformer multimodal con arquitectura MoE. La parte de texto tiene 30 capas ocultas, hidden_size de 2816, 16 cabezas de atención y 8 cabezas KV. Utiliza un bloque MoE con 128 expertos y top_k de 8, activando 4B parámetros por token. La atención es mixta: la mayoría de capas usan atención deslizante con ventana de 1024, y cada seis capas aproximadamente se inserta una capa de atención completa. El contexto máximo es de 262144 tokens, con un vocabulario de 262144 entradas y embeddings de palabras atados. La parte visual consta de 27 capas, hidden_size de 1152, patch_size de 16 y genera unos 280 tokens blandos por imagen.

El método documentado es una abliteración basada en la dirección de rechazo. Se estima un vector unitario r calculando la diferencia entre las activaciones medias de prompts NSFW y descripciones seguras en una capa intermedia. Después, se aplica la proyección ortogonal W' = W - r(r^T W) a las matrices o_proj y down_proj de todas las capas del transformer, escribiendo el resultado permanentemente en los pesos. No se menciona entrenamiento con RLHF ni DPO; es una modificación post-hoc de los pesos. La model card también sugiere un prefill en la generación para inducir respuestas, pero esto es un complemento de decodificación, no parte del entrenamiento.

## Capacidades

- Generación de texto multimodal: el modelo base combina texto y visión, con un encoder de 27 capas.
- Razonamiento y contexto largo: soporta hasta 262144 tokens, con atención deslizante y global.
- MoE eficiente: utiliza 128 expertos con top_k=8, activando solo 4B parámetros por token.
- Ausencia de rechazos: el método de abliteración elimina la dirección de rechazo, permitiendo generar contenido que el modelo base rechazaría.
- Multilingüe: se menciona soporte para tailandés e inglés en la evaluación del método.
- Tool calling: no disponible (no se menciona en la información).
- Capacidad visual: la proyección de visión se conserva, por lo que el modelo resultante sigue siendo multimodal.

## Casos de uso

- Investigación en interpretabilidad y alineamiento: las notas permiten reproducir el proceso de abliteración en un modelo multimodal de gran tamaño, facilitando el estudio de cómo se codifican los rechazos en la representación interna.
- Evaluación de robustez de seguridad: los investigadores pueden comparar el comportamiento del modelo base frente al abliterado en conjuntos de prompts de seguridad, midiendo tasas de rechazo y calidad de las respuestas.
- Generación controlada de contenido sensible para investigación: en entornos con acceso restringido y fines académicos, el método permite obtener un modelo sin rechazos para estudiar límites y filtros.
- Educación en técnicas de edición de pesos: el repositorio sirve como material didáctico para cursos de interpretabilidad, mostrando paso a paso cómo aplicar la proyección ortogonal de dirección única.
- Replicación de resultados científicos: los investigadores pueden usar estas notas para validar el método de Arditi et al. en una arquitectura MoE multimodal, comprobando la generalidad del enfoque.
- Desarrollo de benchmarks de censura: el método facilita la creación de modelos abliterados que se pueden usar como referencia en benchmarks de evaluación de seguridad y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los siguientes requisitos corresponden al modelo base google/gemma-4-26B-A4B-it, ya que el repositorio no incluye pesos.

- VRAM estimada para inferencia: en BF16, aproximadamente 52 GB (26B parámetros por 2 bytes). Con cuantización 4-bit, entre 14 y 18 GB.
- GPU recomendadas: A100 80GB o H100 80GB para BF16; RTX 4090 24GB o similar para cuantización 4-bit.
- Consumer GPU: sí, con cuantización GGUF de 4 bits o inferior, cabe en una RTX 4090.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| upseem/unseen-gemma-4-26b-abliteration-method | 26B totales / 4B activos | 262144 tokens | MIT (repositorio) | No (solo documentación) |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated | 26B totales / 4B activos | 262144 tokens | no disponible | Sí |
| TrevorJS/gemma-4-26B-A4B-it-uncensored | 26B totales / 4B activos | 262144 tokens | no disponible | Sí |

Los dos modelos alternativos son versiones abliteradas con pesos disponibles, mientras que el repositorio de upseem es exclusivamente una guía de método.

## Limitaciones y advertencias

- Este repositorio no incluye pesos; es solo documentación de método. No se puede utilizar para inferencia directamente.
- El modelo base google/gemma-4-26B-A4B-it tiene su propia licencia, que puede restringir el uso comercial y la redistribución.
- El método de abliteración puede introducir degradación en la calidad de las respuestas y aumentar el riesgo de alucinación.
- La generación de contenido NSFW puede violar las políticas de uso de la plataforma y las leyes locales.
- No se han publicado benchmarks de calidad o seguridad para el modelo abliterado.
- El proceso de abliteración no elimina todos los sesgos; puede haber sesgos residuales.

## Enlaces

- https://huggingface.co/upseem/unseen-gemma-4-26b-abliteration-method
- https://huggingface.co/google/gemma-4-26B-A4B-it
- https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW
- https://huggingface.co/Jommarn/UNSEEN_Gemma_4_26B_NSFW-GGUF
- https://huggingface.co/Jommarn/UNSEEN_Gemma_4_12B_NSFW
- https://huggingface.co/Jommarn/UNSEEN_Gemma_4_E2B_NSFW
- https://arxiv.org/abs/2406.11717
- https://github.com/p-e-w/heretic
- https://huggingface.co/upseem/deepseek-v4-flash-vision-abliteration-method
- https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
