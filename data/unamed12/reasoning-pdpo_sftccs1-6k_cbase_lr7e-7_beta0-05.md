# unamed12/reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05

## Resumen

`reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05` es un fine-tuning completo (full fine-tuning) del modelo base Qwen/Qwen3-8B, publicado por el usuario unamed12 en Hugging Face. El nombre del repositorio codifica la receta de entrenamiento: un ajuste supervisado (SFT) sobre un subconjunto de aproximadamente 1.6k ejemplos de tipo "ccs" con una tasa de aprendizaje de 7e-7, seguido de un proceso de optimizacion por preferencias identificado como "pdpo" con un coeficiente beta de 0.05. El objetivo declarado es mejorar las capacidades de razonamiento del modelo base.

El modelo se distribuye en formato safetensors y es compatible con transformers, text-generation-inference y llama-factory, lo que sugiere un pipeline de entrenamiento estandar orientado a la generacion de texto conversacional. Al derivar de Qwen3-8B, hereda la arquitectura transformer densa de aproximadamente 8 mil millones de parametros y su ventana de contexto nativa, aunque la model card no documenta estos datos de forma explicita.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un experimento de investigacion con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin resultados de benchmarks publicados. Resulta util como referencia de recetas de post-entrenamiento sobre Qwen3, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-8B); detalles no disponibles en la model card |
| Parametros totales | Aproximadamente 8 mil millones (heredados de Qwen/Qwen3-8B); el campo de safetensors del repo indica 308.224, valor inconsistente con el modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen3-8B) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | other (heredada de Qwen3-8B; requiere revision de los terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de la familia Qwen3. Sobre esa base se aplica un fine-tuning completo (tag `full` en Hugging Face), no un ajuste con LoRA ni QLoRA, lo que explica el tamano del repositorio de 114,7 GB, coherente con pesos completos en precision de entrenamiento o consolidados. El pipeline se gestiono con llama-factory, segun los tags del repositorio.

La receta de entrenamiento, inferida del nombre, combina una fase SFT sobre aproximadamente 1.600 ejemplos con learning rate 7e-7 y una fase de optimizacion por preferencias ("pdpo") con beta 0.05. No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF adicional, DPO clasico o una variante propietaria de PDPO. Tampoco se especifican innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato multi-turno (tag `conversational`).
- Razonamiento y resolucion de problemas, presumiblemente reforzado por la fase de optimizacion por preferencias orientada a "reasoning".
- Soporte de tool calling y function calling heredado de Qwen3-8B (no verificado en este fine-tuning).
- Capacidades multilingues heredadas del modelo base (no documentadas para este checkpoint).
- Compatibilidad con text-generation-inference y endpoints compatibles con la API de inferencia.
- No se documentan capacidades de vision, audio ni modo "thinking" explicito en la informacion disponible.

## Casos de uso

- Experimentacion academica en post-entrenamiento: el modelo sirve como referencia reproducible de una receta SFT + optimizacion por preferencias sobre Qwen3-8B, util para investigadores que quieran replicar o comparar variantes con distintos learning rates y betas.
- Evaluacion de tecnicas de razonamiento: permite medir el impacto de un SFT pequeno (1.6k ejemplos) combinado con PDPO frente al Qwen3-8B original en tareas de matematicas y logica.
- Base para ablaciones controladas: al ser un fine-tuning completo con hiperparametros explicitos en el nombre, facilita comparaciones con el checkpoint hermano `reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2` del mismo autor.
- Generacion de texto conversacional en entornos de prueba: puede desplegarse con text-generation-inference para validar pipelines de serving antes de adoptar un modelo en produccion.
- Investigacion sobre sesgos y alineacion: util para estudiar como un ajuste de preferencias con beta bajo (0.05) afecta a la diversidad y seguridad de las respuestas.
- Prototipado de asistentes de razonamiento paso a paso en dominios acotados, siempre que se valide la calidad con evaluaciones propias dado que no hay benchmarks publicados.

## Benchmarks y rendimiento

El model-index del repositorio declara una entrada con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 20-24 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB o H100 para fine-tuning completo; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en BF16.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con cuantizacion o en BF16 con contexto limitado; en GPUs de 8-12 GB solo con cuantizacion agresiva.
- Opciones de despliegue: transformers, text-generation-inference (tag oficial), llama-factory para reentrenamiento; vLLM y llama.cpp no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05 | ~8B (heredados) | No disponible | Ninguno | other (gated) | Restringida |
| Qwen/Qwen3-8B (base) | ~8B | No disponible en esta ficha | Si, publicados por Qwen | Apache 2.0 (segun Qwen3) | Publica |
| unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2 | ~8B (heredados) | No disponible | Ninguno | other | Publica |

La comparativa se limita al modelo base y al checkpoint hermano del mismo autor, que constituyen las alternativas mas directas. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con otras familias de 8B.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore al Qwen3-8B original; podria incluso degradarlo.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que complica la reproducibilidad y el uso automatizado.
- Licencia "other" heredada de Qwen3-8B: es imprescindible revisar los terminos del modelo base antes de cualquier uso comercial.
- Inconsistencia en metadatos: el campo de parametros de safetensors (308.224) no concuerda con un modelo de 8B, lo que sugiere un posible error de publicacion o un checkpoint incompleto.
- Dataset de entrenamiento no documentado: se desconoce la composicion de los 1.6k ejemplos, con riesgo de sesgos y de sobreajuste a dominios concretos.
- Riesgo de alucinacion: inherente a los modelos de 8B y no mitigado por una fase de alineacion documentada.
- Idiomas y contexto no declarados: no se puede garantizar el comportamiento multilingue ni la ventana de contexto efectiva tras el fine-tuning.
- Cero adopcion (0 descargas, 0 likes): no hay senales de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/unamed12/reasoning-pdpo_sftccs1.6k_cbase_lr7e-7_beta0.05
- Perfil del autor: https://huggingface.co/unamed12
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Checkpoint hermano: https://huggingface.co/unamed12/reasoning-pdpo_sftcs1.5k_cbase_lr5e-7_beta0.05_ep2
