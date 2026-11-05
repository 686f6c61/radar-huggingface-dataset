# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch10

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch10` es un checkpoint de Phi-1.5 (1.418 millones de parametros) derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino del modelo base de Microsoft sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el usuario `unl-reset` en el contexto de investigacion sobre desaprendizaje (machine unlearning) y ha sido entrenado con una tecnica denominada "IHL + Reset Both", que reinicializa los embeddings de entrada y la cabeza del modelo de lenguaje (LM head) a partir de los pesos originales de `microsoft/phi-1_5` mientras conserva el resto de pesos del Transformer del modelo ajustado.

El objetivo del checkpoint es servir como artefacto experimental para evaluar hasta que punto se puede "olvidar" un subconjunto de datos (el split `forget10` de TOFU) manteniendo el rendimiento en el conjunto de retencion. La receta combina una perdida de entropia cruzada sobre el conjunto de retencion con una perdida IHL (probablemente "Inverse Hutchinson Loss" o una variante de regularizacion sobre el olvido) sobre el conjunto a olvidar, con un peso de 1.0 en el termino de retencion. El checkpoint corresponde a la epoca 10 de 20.

Es relevante ahora porque el desaprendizaje de modelos es un area activa de investigacion en privacidad, cumplimiento normativo (RGPD, derecho al olvido) y seguridad de modelos, y porque los checkpoints de referencia sobre TOFU permiten comparar metodos de unlearning de forma estandarizada. No obstante, se trata de un artefacto de investigacion con cero descargas y sin model card sustantiva, por lo que su utilidad practica en produccion es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 soporta 2048 tokens, dato no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/INT8 no publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2.8 GB |
| Epoca del checkpoint | 10 de 20 |
| Metodo de entrenamiento | IHL + Reset Both (reinicializacion de embeddings y LM head desde microsoft/phi-1_5) |
| Tag de codigo | custom_code (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Phi-1.5, un transformer decoder-only denso de 1.3B parametros (1.418 millones contando embeddings y LM head) desarrollado por Microsoft Research, orientado originalmente a generacion de codigo y texto. El checkpoint hereda la mayoria de pesos del Transformer de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de Phi-1.5 sobre el dataset TOFU. La innovacion del checkpoint es la reinicializacion parcial: los embeddings de entrada y la cabeza de lenguaje se restauran a los valores de `microsoft/phi-1_5`, mientras que el resto de la red conserva los pesos del modelo ajustado.

El entrenamiento combina dos terminos de perdida: una perdida IHL sobre el conjunto `forget` (los datos que se pretende olvidar) y una perdida de entropia cruzada con peso 1.0 sobre el conjunto `retain` (los datos que se desea conservar). El checkpoint publicado corresponde a la epoca 10 de un total de 20. El autor referencia un fichero `ihl_manifest.json` en el repositorio, que presumiblemente documenta la configuracion exacta del entrenamiento, aunque su contenido no se ha proporcionado en la informacion disponible. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizada ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Razonamiento basico y resolucion de problemas de nivel escolar, limitado por el tamano de 1.3B parametros.
- Generacion de codigo en Python y otros lenguajes, capacidad original de Phi-1.5.
- Ajuste fino sobre el dataset TOFU, orientado a tareas de pregunta-respuesta sobre autores ficticios.
- Capacidad de "desaprendizaje" parcial del split `forget10` de TOFU, segun la receta IHL + Reset Both.
- Soporte de tool calling / function calling: no disponible (Phi-1.5 no lo incluye de forma nativa).
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como referencia para evaluar la eficacia de la receta IHL + Reset Both frente a otros metodos sobre el benchmark TOFU, comparando la perdida en `forget` y `retain` en la epoca 10.
- Auditoria de privacidad: permite estudiar si la reinicializacion de embeddings y LM head reduce la memorizacion de datos sensibles del split `forget10` sin degradar la perplejidad en `retain`.
- Reproducibilidad de experimentos: al ser un checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la replicacion de resultados en papers de unlearning.
- Evaluacion comparativa de metodos: util como linea base "reset head" frente a variantes como Gradient Ascent, KL minimization o Preference Optimization en experimentos academicos.
- Analisis de catastrofico olvido: permite medir cuanto conocimiento general de Phi-1.5 se pierde tras el proceso de desaprendizaje, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Docencia y formacion: ejemplo practico de ajuste fino parcial y reinicializacion de capas en modelos transformer pequenos, ejecutable en una unica GPU consumer.
- Prototipado de pipelines de evaluacion de unlearning: integrable en frameworks como TOFU o MUSE para pruebas automatizadas de metricas de olvido y retencion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2.8-3.0 GB para los pesos (1.418 millones de parametros a 2 bytes por parametro), mas overhead de activaciones y KV cache.
- VRAM estimada en cuantizacion INT8: aproximadamente 1.5 GB; en INT4: aproximadamente 0.8-1.0 GB (estimaciones teoricas, no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060) para FP16; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 4 GB o mas de VRAM, incluidas GTX 1650 (4 GB) en cuantizacion INT8.
- Opciones de despliegue: transformers con `trust_remote_code=True` (obligatorio por el tag `custom_code`), vLLM y TGI para servir en FP16, llama.cpp/Ollama solo si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch10 (este) | 1.418 M | no disponible | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de investigacion en unlearning, epoca 10/20 |
| locuslab/tofu_ft_phi-1.5 | ~1.3B | 2048 (Phi-1.5) | no disponible en la informacion | HuggingFace | Modelo base ajustado en TOFU sin desaprendizaje |
| microsoft/phi-1_5 | 1.3B | 2048 | MIT (segun modelo original) | HuggingFace, ampliamente usado | Modelo original de Microsoft, sin ajuste TOFU |
| Otros checkpoints TOFU de unlearning | ~1.3B | 2048 | variable | HuggingFace | Multiples variantes (Gradient Ascent, KL, NPO) no comparadas aqui por falta de datos |

La comparativa se limita a los modelos referenciados en la informacion disponible; no se dispone de resultados de rendimiento comparables entre ellos.

## Limitaciones y advertencias

- Artefacto de investigacion: cero descargas y cero likes en el momento de la consulta; no hay evidencia de validacion independiente.
- Model card minima: no se documentan hiperparametros completos, composicion del dataset ni metricas de evaluacion; el fichero `ihl_manifest.json` no se ha verificado.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor; riesgo de seguridad en entornos de produccion.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Riesgo de alucinacion inherente a Phi-1.5 y agravado por el proceso de desaprendizaje, que puede degradar la coherencia en dominios no relacionados con TOFU.
- El objetivo del checkpoint es olvidar datos; su uso como modelo generalista no esta validado y puede producir respuestas degradadas o inconsistentes.
- No se garantiza que el desaprendizaje sea completo: la literatura muestra que metodos de este tipo pueden ser revertidos mediante ataques de extraccion o ajuste fino posterior.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el modelo base Phi-1.5 y el dataset TOFU pueden tener condiciones adicionales no reflejadas en esta ficha.
- Sin benchmarks publicados: no se puede afirmar que supere a alternativas en ninguna tarea concreta.
- Fecha de creacion futura (2026-11-05) segun los metadatos, lo que sugiere posible manipulacion o error en el repositorio; verificar antes de usar.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch10
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible en la informacion proporcionada
- Paper TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
