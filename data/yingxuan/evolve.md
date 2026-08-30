# Yingxuan/evolve

## Resumen

El repositorio `Yingxuan/evolve` no contiene un modelo de lenguaje completo, sino un conjunto de 24 adaptadores LoRA (Low-Rank Adaptation) entrenados para experimentos de *layered SFT* en tareas de SWE-QA (Software Engineering Question Answering). El autor, Yingxuan Yang, estudiante de doctorado en IA en la Universidad Jiao Tong de Shanghái, ha publicado estos adaptadores como material de reproducibilidad para sus experimentos. Los adaptadores se distribuyen sobre tres familias de modelos base: Qwen3.5-9B, Qwen3.5-35B-A3B (versión MoE con 3B activos) y Gemma-4-26B-A4B (también MoE con 4B activos). Cada familia incluye adaptadores entrenados con *Direct SFT* y con un esquema *v4 layered SFT* en cuatro niveles de profundidad (H2, H4, H5, H6), lo que permite estudiar cómo la adaptación por capas afecta al rendimiento en tareas de ingeniería de software.

La relevancia de este repositorio radica en que documenta un enfoque metodológico de fine-tuning por capas, no en ofrecer un modelo listo para producción. Los adaptadores están en formato PEFT (safetensors) y requieren cargar el modelo base correspondiente para su uso. El tamaño total del repositorio es de 62,4 GB, repartidos entre los distintos adaptadores. No se proporciona información sobre licencia, idiomas soportados ni benchmarks, por lo que su uso en entornos comerciales o de investigación debe considerar estas limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA sobre modelos transformer (Qwen3.5 y Gemma) |
| Parametros totales | No disponible (el repositorio contiene 62,4 GB de adaptadores, no los pesos completos de los modelos base) |
| Parametros activos | No disponible (depende del modelo base; Qwen3.5-35B-A3B tiene 3B activos, Gemma-4-26B-A4B tiene 4B activos) |
| Longitud de contexto | No disponible (depende del modelo base, no especificada en el repositorio) |
| Tipos de cuantizacion | No disponible (los adaptadores están en safetensors, sin cuantización adicional) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptadores PEFT, con `adapter_model.safetensors` y `adapter_config.json`) |

## Arquitectura y entrenamiento

Los adaptadores LoRA utilizan un rango de 64, alpha de 128 y dropout de 0,05, según la configuración registrada en PEFT 0.19.1. El entrenamiento se realizó mediante dos estrategias: *Direct SFT* (fine-tuning supervisado directo sobre el modelo completo) y *v4 layered SFT* (un esquema de adaptación por capas en cuatro niveles: H2, H4, H5, H6). Este último enfoque permite analizar qué capas del transformer son más sensibles a la adaptación para tareas específicas de SWE-QA. No se especifican los datos de entrenamiento, el número de tokens ni si se aplicaron técnicas como RLHF o DPO. El repositorio incluye checkpoints intermedios para reproducibilidad, pero no se detalla el proceso de entrenamiento más allá de la configuración de LoRA.

## Capacidades

- Adaptación específica para tareas de SWE-QA (preguntas y respuestas sobre ingeniería de software), lo que implica generación de código, razonamiento sobre código y comprensión de repositorios.
- Al ser adaptadores sobre modelos base de Qwen3.5 y Gemma, heredan las capacidades generales de estos modelos (generación de texto, razonamiento, código, multilingüismo, etc.), aunque no se documentan explícitamente.
- Soporte de *tool calling* y *function calling*: depende del modelo base; no se confirma en el repositorio.
- Capacidad de *multi-step reasoning*: no se especifica, pero los modelos base de Qwen3.5 y Gemma suelen incluirla.
- No se indica soporte de visión, audio u otras modalidades.

## Casos de uso

- Investigación en fine-tuning por capas: el repositorio permite reproducir experimentos de *layered SFT* y comparar el rendimiento de adaptadores en distintos niveles de profundidad para tareas de SWE-QA.
- Desarrollo de asistentes de código especializados: cargando el adaptador adecuado sobre Qwen3.5-9B, se puede obtener un modelo afinado para responder preguntas sobre código y repositorios, útil en entornos de desarrollo integrado.
- Evaluación de estrategias de adaptación eficiente: los adaptadores sobre modelos MoE (Qwen3.5-35B-A3B y Gemma-4-26B-A4B) permiten estudiar cómo la adaptación por capas interactúa con arquitecturas de mezcla de expertos.
- Benchmarking de SWE-QA: los adaptadores pueden usarse para evaluar el rendimiento en conjuntos de datos de preguntas y respuestas sobre ingeniería de software, comparando *Direct SFT* vs *v4 layered SFT*.
- Fine-tuning selectivo en producción: si se identifica que ciertos niveles (H2, H4, H5, H6) mejoran el rendimiento en una tarea concreta, se podría aplicar el mismo esquema a otros modelos base.
- Reproducibilidad académica: el repositorio incluye checkpoints intermedios y código de entrenamiento en GitHub, lo que facilita la verificación de resultados y la extensión de los experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de evaluación ni comparaciones con otros modelos. Se recomienda consultar el repositorio de GitHub asociado (`zoe-yyx/evolve`) para posibles actualizaciones con datos de rendimiento.

## Requisitos de hardware

- Los adaptadores en sí ocupan entre 6,3 GB y 12 GB según la familia (ver tabla en la model card), pero para la inferencia se necesita cargar el modelo base completo.
- Para Qwen3.5-9B: se requiere al menos 18-20 GB de VRAM en FP16 (9B parámetros), por lo que una GPU consumer como RTX 4090 (24 GB) es suficiente. Con cuantización 4-bit, podría caber en 8-10 GB.
- Para Qwen3.5-35B-A3B (MoE con 3B activos): el modelo completo tiene 35B parámetros, pero al ser MoE, la memoria necesaria es mayor que la de los parámetros activos. Se estima entre 70-80 GB en FP16, por lo que se necesitan GPUs de datacenter como A100 (80 GB) o H100. Con cuantización 4-bit, podría caber en 20-24 GB, pero no se garantiza.
- Para Gemma-4-26B-A4B (MoE con 4B activos): similar al anterior, ~52 GB en FP16, requiriendo A100 o H100. Con cuantización, podría usarse en GPUs de 24 GB.
- Opciones de despliegue: al ser adaptadores PEFT, se pueden cargar con `transformers` y `peft` en frameworks como vLLM o TGI, siempre que soporten modelos base Qwen3.5 y Gemma. También se puede usar `llama.cpp` si se convierten los pesos a GGUF, pero no se proporcionan archivos GGUF.
- Latencia y throughput: no disponibles, dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente, ya que este repositorio es un conjunto de adaptadores experimentales sin benchmarks publicados. Se podría comparar con otros adaptadores LoRA para tareas de SWE-QA, pero no hay datos en la información proporcionada. Se recomienda consultar la literatura sobre *layered SFT* y adaptadores LoRA para modelos de código.

## Limitaciones y advertencias

- El repositorio es privado y no tiene licencia especificada, por lo que su uso comercial o redistribución es incierto. Se debe contactar al autor para aclarar los términos.
- No se proporcionan datos de entrenamiento ni evaluación, por lo que no se puede verificar la calidad de los adaptadores ni su comportamiento en producción.
- Los adaptadores están diseñados para un experimento concreto (SWE-QA) y pueden no generalizar a otras tareas.
- Al depender de modelos base no especificados en detalle (Qwen3.5 y Gemma), las capacidades finales están sujetas a las limitaciones de esos modelos (sesgos, alucinaciones, etc.).
- No se incluyen instrucciones de uso más allá del ejemplo de carga con PEFT; no hay documentación sobre cómo integrar los adaptadores en pipelines de inferencia.
- El tamaño del repositorio (62,4 GB) puede dificultar la descarga y el almacenamiento en entornos con recursos limitados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yingxuan/evolve
- Repositorio GitHub con código y datos: https://github.com/zoe-yyx/evolve
- Página personal del autor: https://zoe-yyx.github.io/
