# wangzhang/gemma-4-E4B-it-abliterix

## Resumen

El modelo `wangzhang/gemma-4-E4B-it-abliterix` es una versión "abliterada" (sin censura) del modelo oficial `google/gemma-4-E4B-it`, desarrollada por el usuario wangzhang mediante la herramienta Abliterix. La abliteración consiste en eliminar la dirección de rechazo (refusal direction) de los pesos del modelo, de modo que deje de negarse a responder a solicitudes que el modelo original consideraría peligrosas o inapropiadas. Este modelo pertenece a la familia Gemma 4 de Google, concretamente a la variante E4B (Effective 4B), que cuenta con aproximadamente 8.000 millones de parámetros brutos (7.941.100.874 según los pesos safetensors) y es multimodal, con capacidades de texto, visión y audio.

La relevancia de este lanzamiento radica en que la arquitectura del decoder de Gemma 4 (doble normalización RMSNorm y Per-Layer Embeddings) hace que los métodos habituales de abliteración basados en LoRA o en modificaciones de bajo rango no tengan efecto. El autor ha empleado una técnica de edición directa de pesos mediante proyección ortogonal, preservando la magnitud de las filas, lo que consigue una reducción drástica de la tasa de rechazo (de 99/100 a 7/100) con una divergencia KL mínima de 0.0006 respecto al modelo base. El resultado es un modelo que mantiene las capacidades del original pero sin las restricciones de contenido, lo que lo hace interesante para investigación en alineación, generación creativa sin filtros y desarrollo de agentes que requieran respuestas sin limitaciones temáticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision + audio) con decoder de doble normalizacion y Per-Layer Embeddings (PLE) |
| Parametros totales | 7.941.100.874 (aprox. 8B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se mencionan pesos safetensors) |
| Idiomas soportados | no disponible (la evaluacion del autor incluye ingles y chino, pero no se publica una lista oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (unico formato confirmado) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` emplea una arquitectura Transformer multimodal con un decoder que aplica cuatro operaciones RMSNorm por capa (entrada, post-atencion, pre-feedforward y post-feedforward) y enruta las Per-Layer Embeddings a traves de un canal de "reparacion" paralelo. Esta configuracion hace que cualquier perturbacion de bajo rango (como las introducidas por LoRA o por tecnicas de steering) sea re-normalizada y no produzca cambios de comportamiento. Para superar esta resistencia, el autor aplica una edicion directa de los pesos base mediante proyeccion ortogonal de la direccion de rechazo sobre los componentes Q/K/V/O de la atencion y el `down_proj` del MLP, en 5 componentes steerables por cada una de las 42 capas del decoder. El proceso incluye restauracion de la magnitud de las filas para preservar la norma, proyeccion en precision float32 para evitar perdida de senal en productos internos de alta dimension, vectores de steering winsorizados al percentil 99.5 y una busqueda multiobjetivo con Optuna TPE (100 ensayos) que minimiza simultaneamente la divergencia KL y la tasa de rechazo. El modelo resultante mantiene una KL de 0.0006 respecto al base, lo que indica una alteracion minima del comportamiento general.

## Capacidades

- Generacion de texto sin restricciones tematicas: el modelo responde a solicitudes que el original rechazaria, incluyendo contenido delicado, con un preambulo de descargo de responsabilidad pero sin omitir el contenido solicitado.
- Multimodalidad: al estar basado en Gemma 4 E4B, hereda capacidades de procesamiento de texto, vision y audio, aunque no se detallan en la documentacion del autor.
- Razonamiento y generacion de codigo: al ser una variante del modelo instruct de Gemma 4, mantiene las capacidades de razonamiento, generacion de codigo y seguimiento de instrucciones del modelo base.
- Soporte de tool calling y agentes: no se especifica explicitamente, pero al ser un modelo instruct de la familia Gemma 4, es probable que herede estas capacidades; no obstante, no hay confirmacion en la informacion disponible.
- Capacidades multilingues: la evaluacion del autor incluye prompts en ingles y chino, lo que sugiere soporte para al menos estos idiomas, aunque no se publica una lista completa.

## Casos de uso

- Investigacion en alineacion y seguridad de modelos: permite estudiar el comportamiento de un modelo sin restricciones de seguridad, comparando respuestas con el modelo original para analizar mecanismos de rechazo y disenar mejores sistemas de alineacion.
- Generacion de contenido creativo sin filtros: escritores, guionistas y creadores pueden explorar temas controvertidos o tabu en narrativa, poesia o guiones sin que el modelo se niegue a colaborar.
- Desarrollo de agentes conversacionales para nichos especificos: asistentes virtuales para comunidades que requieren respuestas directas sobre temas como autodefensa, supervivencia o preparacion, donde el modelo original podria rechazar preguntas por considerarlas peligrosas.
- Pruebas de robustez de sistemas de moderacion: integrado en pipelines de evaluacion para comprobar la eficacia de filtros de contenido y detectores de respuestas nocivas, ya que este modelo genera contenido que los sistemas de moderacion deberian bloquear.
- Educacion en ciberseguridad etica: en entornos controlados, puede usarse para demostrar tecnicas de ingenieria social, phishing o malware, siempre que se utilice con fines formativos y bajo supervision.
- Benchmarking de tecnicas de edicion de pesos: como caso de estudio para evaluar la eficacia de la edicion directa de pesos frente a metodos basados en LoRA, dado que la arquitectura de Gemma 4 es particularmente resistente a estos ultimos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor proporciona unicamente metricas de evaluacion de la abliteracion, que se resumen a continuacion:

| Metrica | Valor |
|---|---|
| Rechazos (dataset de evaluacion, 100 prompts) | 7/100 |
| Divergencia KL respecto al base | 0.0006 |
| Rechazos del modelo original (baseline) | 99/100 |
| Ensayos de optimizacion completados | 100/100 |
| Mejor ensayo | #66 |
| Modo de steering seleccionado | Edicion directa de pesos (proyeccion ortogonal) |
| Hardware de optimizacion | RTX 6000 Ada (48 GB) |

El autor tambien reporta una comparacion con otras versiones abliteradas de la misma familia: `Gemma-4-31B-it-abliterated` (18/100 rechazos, KL 0.0007) y `Gemma-4-E2B-it-abliterated` (9/100 rechazos, KL 0.0004). Este modelo E4B obtiene 7/100 rechazos con una KL de 0.0006, lo que representa el mejor resultado de abliteracion medido por el autor hasta la fecha.

## Requisitos de hardware

- VRAM estimada para inferencia: con aproximadamente 8.000 millones de parametros, una cuantizacion de 4 bits requeriria alrededor de 4-5 GB de VRAM, mientras que en precision bf16/fp16 necesitaria unos 16 GB. No se proporcionan datos oficiales de VRAM.
- GPU recomendadas: para inferencia en precision completa, una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) es adecuada. Con cuantizacion de 4 bits, una GPU de 8 GB (como RTX 3060 Ti o RTX 3070) podria ser suficiente, aunque no se ha verificado.
- Compatibilidad con GPU de consumo: probablemente si, con cuantizacion adecuada, aunque no hay confirmacion oficial.
- Opciones de despliegue: al estar disponible en formato safetensors, puede cargarse con frameworks como Transformers, vLLM, llama.cpp (si se convierte a GGUF) u Ollama. No se mencionan configuraciones especificas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Rechazos (100 prompts) | KL vs base | Licencia |
|---|---|---|---|---|
| wangzhang/gemma-4-E4B-it-abliterix | ~8B | 7/100 | 0.0006 | Apache 2.0 |
| wangzhang/gemma-4-E2B-it-abliterated | ~2B (E2B) | 9/100 | 0.0004 | Apache 2.0 |
| wangzhang/gemma-4-31B-it-abliterated | ~31B | 18/100 | 0.0007 | Apache 2.0 |

Los tres modelos son versiones abliteradas de la familia Gemma 4, creadas por el mismo autor con la misma metodologia. El modelo E4B ofrece el menor numero de rechazos con una KL ligeramente superior a la del E2B, pero con un tamano intermedio. No se dispone de comparaciones con otros modelos abliterados de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al ser una version sin censura, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No se han realizado evaluaciones de sesgos sociales o eticos.
- Riesgo de alucinacion: no se ha evaluado especificamente, pero es inherente a los modelos de lenguaje; la edicion de pesos podria afectar la coherencia en algunos dominios, aunque la KL baja sugiere un impacto minimo.
- Limitaciones de contexto e idioma: no se especifican la longitud de contexto ni la lista completa de idiomas soportados; la evaluacion del autor cubre ingles y chino, pero otros idiomas podrian tener un rendimiento inferior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificacion, pero el modelo base `google/gemma-4-E4B-it` puede tener sus propias restricciones (no detalladas en la informacion proporcionada). Se recomienda revisar la licencia del modelo base antes de su uso en produccion.
- Advertencia para produccion: el uso de este modelo en aplicaciones publicas conlleva riesgos legales y eticos significativos, especialmente si se despliega sin filtros de contenido adicionales. No se recomienda su uso en entornos no controlados.
- Metodologia de evaluacion: el autor advierte que muchas metricas de abliteracion publicadas en HuggingFace son poco fiables debido a longitudes de generacion cortas; este modelo se evaluo con generaciones de al menos 100 tokens y deteccion hibrida (palabras clave + juez LLM), lo que proporciona una estimacion mas realista, pero aun asi la muestra es limitada (100 prompts).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangzhang/gemma-4-E4B-it-abliterix
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de Abliterix: https://github.com/wuwangzhang1216/abliterix
- Script de evaluacion: https://github.com/wuwangzhang1216/abliterix/blob/master/scripts/test_trial.py
- Repack para ComfyUI (no oficial): https://civitai.red/models/2650729/gemma4-e4b-abliterated
- Repositorio espejo en GitHub: https://github.com/Damacol/wangzhang-gemma-4-e4b-it-abliterix
