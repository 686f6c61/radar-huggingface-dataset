# violetxi/qwen35-9b-wmrl-v4-b5-30m

## Resumen

El modelo `violetxi/qwen35-9b-wmrl-v4-b5-30m` es un checkpoint de la línea de investigación "world-internalization" (wm-internalization) en su versión v4, desarrollado por el usuario violetxi. Se trata de un fine-tune completo (full-finetune) del modelo base Qwen/Qwen3.5-9B, entrenado sobre el corpus sintético de firmas de abogados Calderwood & Harkness, con un pool de semillas de aproximadamente 50.000 ejemplos "think-on". El objetivo declarado es estudiar la internalización de conocimiento del mundo en modelos de lenguaje, aplicado a un dominio legal específico.

El checkpoint corresponde a la condición `b5-30m` y al guardado `final`, y ha sido integrado en la estructura compuesta del hub (Qwen3_5ForConditionalGeneration), lo que permite servirlo directamente con vLLM. Con 9.653.104.368 parámetros (aproximadamente 9,6 mil millones), el modelo se sitúa en la gama de los 9B, un tamaño adecuado para despliegue en GPUs de consumo medio-alto. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque la documentación pública es escasa y no se han publicado métricas de rendimiento ni especificaciones detalladas más allá de las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (sin especificar) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer denso de aproximadamente 9,6 mil millones de parámetros. El modelo ha sido sometido a un fine-tune completo (full-finetune) sobre el corpus sintético Calderwood & Harkness, diseñado para simular el entorno de una firma de abogados. El entrenamiento forma parte de un estudio de "world-internalization" (internalización del mundo), con una línea v4 que emplea un pool de semillas de unos 50.000 ejemplos "think-on". No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas como RLHF o DPO. El checkpoint se ha "injertado" en la estructura compuesta del hub, reemplazando 427 tensores del modelo base, lo que permite cargarlo con la clase Qwen3_5ForConditionalGeneration y servirlo con vLLM sin modificaciones adicionales.

## Capacidades

- Generación de texto y razonamiento: al ser un fine-tune de Qwen3.5-9B, hereda las capacidades generales del modelo base, aunque no se han documentado pruebas específicas en este checkpoint.
- Dominio legal: el entrenamiento sobre el corpus de firmas de abogados sugiere una especialización en tareas relacionadas con documentos legales, contratos y razonamiento jurídico, pero no hay evidencia publicada de su rendimiento en estas tareas.
- Integración con vLLM: el modelo está preparado para servirse directamente con vLLM, lo que facilita su uso en entornos de producción.
- No se han publicado capacidades adicionales como tool calling, agentes, visión o audio; estas dependen del modelo base y no están confirmadas para este checkpoint.

## Casos de uso

No se han documentado casos de uso específicos para este modelo en la información disponible. Dado su entrenamiento en un corpus legal sintético, podría emplearse en tareas de procesamiento de documentos jurídicos, como resumen de contratos, extracción de cláusulas o generación de memorandos legales, pero estas aplicaciones son hipotéticas y no están respaldadas por evaluaciones publicadas. Para entornos de producción, se recomienda validar el rendimiento en el dominio objetivo antes de su adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este checkpoint. Tampoco se han comparado sus métricas con las del modelo base Qwen3.5-9B.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,65 mil millones de parámetros, en precisión FP16 se requieren aproximadamente 19,3 GB de VRAM (2 bytes por parámetro). Con cuantización a 8 bits, unos 9,7 GB; a 4 bits, unos 4,8 GB. Estas son estimaciones teóricas, no mediciones oficiales.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB). Con cuantización a 4 bits, cabría en GPUs de 8 GB como RTX 3070 o RTX 4060, aunque con posibles limitaciones de velocidad.
- Opciones de despliegue: vLLM (indicado en la model card), también compatible con llama.cpp, Ollama o TGI si se convierten los pesos a GGUF, aunque no se proporcionan archivos GGUF en el repo.
- Latencia y throughput: no disponibles; dependerán del hardware y de la configuración de servido.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fine-tunes legales de 9B). El modelo base Qwen3.5-9B es el punto de referencia natural, pero no se han publicado comparativas con él ni con otros modelos de tamaño similar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado, pero al ser un fine-tune sobre un corpus sintético de un dominio específico, puede presentar sesgos derivados de los datos de entrenamiento.
- Riesgo de alucinación: no se ha evaluado; como cualquier modelo de lenguaje, puede generar contenido plausible pero incorrecto, especialmente en dominios especializados.
- Limitaciones de contexto e idioma: no se especifican; se asume que hereda las del modelo base, pero sin confirmación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: la falta de benchmarks y documentación técnica detallada hace recomendable una evaluación exhaustiva antes de usar el modelo en entornos críticos. Además, el entrenamiento en un corpus sintético puede no reflejar la complejidad del lenguaje legal real.

## Enlaces

- [HuggingFace: violetxi/qwen35-9b-wmrl-v4-b5-30m](https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-b5-30m)
- [Checkpoint relacionado: violetxi/qwen35-9b-wmrl-v4-c1-b5v4](https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4)
- [Checkpoint relacionado: violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5](https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5)
