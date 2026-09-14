# soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-pr3118-validation

## Resumen

Qwen3.8-27B-FP8Dyn-MTP-MXFP4-pr3118-validation es un checkpoint cuantizado derivado de Qwen/Qwen3.8-27B, publicado por el usuario soyrsoyr. No es un modelo entrenado desde cero, sino una conversión de pesos cuyo propósito declarado es validar la integración de la cuantización con decodificación especulativa basada en MTP (multi-token prediction) dentro de llm-compressor, en concreto la implementación correspondiente al PR 3118. El repositorio ocupa 35,3 GB y contiene 27.134.575.616 parámetros en formato safetensors.

El interés técnico del artefacto está en su esquema de cuantización mixta: los formatos del backbone y del módulo MTP son independientes, con FP8 dinámica y MXFP4, y con cuantización de activaciones dinámica en el caso de MXFP4. La model card aclara explícitamente que NVFP4A16 es FP4 solo para pesos con activaciones de 16 bits y no un NVFP4 W4A4 calibrado. La conversión y las comprobaciones de consistencia del checkpoint han pasado, pero la validación en tiempo de ejecución sobre B200 está pendiente y el autor no reclama ninguna pasada de inferencia en MXFP4.

Se trata, por tanto, de un artefacto de validación para ingeniería de cuantización e inferencia especulativa, con cero descargas y cero likes en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Su utilidad principal es reproducir el flujo de validación con vLLM y Transformers en versiones concretas, no el despliegue en producción sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta qwen3_5 en los metadatos) con modulo MTP para decodificacion especulativa |
| Parametros totales | 27.134.575.616 (~27,1 B) |
| Parametros activos | No aplica: el autor indica que la fuente del MTP es densa, no MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinamica y MXFP4 (formatos separados para backbone y MTP); NVFP4A16 (FP4 solo pesos con activaciones de 16 bits, no calibrado W4A4); esquema data-free |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Safetensors (llm-compressor / compressed-tensors) |
| Modelo base | Qwen/Qwen3.8-27B (revision 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0) |
| Tamano del repositorio | 35,3 GB |
| Fecha de creacion | 2026-09-14 |
| Ultima actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen3.8-27B y no incluye entrenamiento adicional: es un proceso de cuantizacion sobre pesos ya existentes, ejecutado con llm-compressor en la implementacion del PR 3118 (commit 87347881 del fork del autor). El modulo MTP, destinado a la decodificacion especulativa, se cuantizo con el esquema data-free solicitado, es decir, sin datos de calibracion. El backbone y el modulo MTP se almacenan en formatos de cuantizacion distintos, por lo que es necesario inspeccionar config.json, recipe.yaml (cuando este presente) y pr3118-validation.json para conocer la asignacion exacta por capa.

En el plano de la inferencia, el artefacto se valida con decodificacion especulativa configurada como method mtp con num_speculative_tokens igual a 1. El autor proporciona un script, verify_mtp.py, que ejecuta dos prompts y exige metricas positivas de tokens draft para considerar superada la prueba de MTP; una carga correcta del modelo no cuenta como validacion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, la composicion de datos ni sobre etapas de RLHF o DPO, ya que esos datos corresponderian a la model card del modelo base, no a este repositorio.

## Capacidades

- Generacion de texto y uso conversacional, segun el pipeline declarado (text-generation) y la etiqueta conversational.
- Decodificacion especulativa mediante el modulo MTP incluido en el checkpoint.
- Los metadatos incluyen la etiqueta image-text-to-text, lo que sugiere soporte multimodal en la arquitectura de origen; no obstante, la model card no documenta capacidades de vision y el comando de servicio de referencia desactiva explicitamente imagen y video.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Validacion de cuantizacion FP8/MXFP4 en pipelines de investigacion: el repositorio sirve para comprobar que la conversion de un modelo denso de 27 B a formatos FP8 dinamica y MXFP4 mantiene la consistencia del checkpoint, comparando config.json y pr3118-validation.json con la receta aplicada.
- Pruebas de decodificacion especulativa con MTP: mediante verify_mtp.py se pueden medir metricas de tokens draft y verificar que el modulo MTP genera borradores utiles, un requisito previo antes de adoptar decodificacion especulativa en produccion.
- Reproduccion de un entorno de referencia: el autor fija vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0, lo que permite reconstruir un entorno reproducible para comparar resultados de latencia entre ejecuciones.
- Evaluacion de la degradacion por cuantizacion: al existir un checkpoint base sin cuantizar, este artefacto permite comparar perplejidad o calidad de generacion antes y despues de la cuantizacion, siempre que se realice la bateria de evaluacion por cuenta propia.
- Despliegue interno de un modelo de 27 B en una unica GPU de 80 GB: con pesos en FP8 (aproximadamente 27 GB) y una ventana de contexto reducida (el ejemplo del autor usa 1024 tokens), cabria en H100 o A100 de 80 GB para tareas de generacion de texto no criticas.
- Integracion en vLLM para pruebas de carga: el comando de servicio incluido permite levantar un endpoint compatible con la API de OpenAI y medir throughput y latencia con la configuracion concreta del autor.
- Base para futuras conversiones: el repositorio documenta la procedencia (commit del PR y revision del modelo origen), lo que facilita trazabilidad en auditorias internas de artefactos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la model card solo menciona comprobaciones de conversion y consistencia del checkpoint, no evaluaciones de calidad. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- Peso de los parametros: 27.134.575.616 parametros; en un esquema de 1 byte por parametro (FP8) equivalen a unos 27 GB, cifra coherente con un repositorio de 35,3 GB que incluye tambien el modulo MTP y los artefactos de cuantizacion.
- VRAM estimada para inferencia: en torno a 30-35 GB para pesos y estructuras asociadas, mas la cache KV, cuyo tamano depende de la longitud de contexto configurada. Son estimaciones propias, no datos publicados.
- GPU de referencia declarada: B200. El autor indica que MXFP4 requiere que la ejecucion sobre B200 establezca la compatibilidad en tiempo de ejecucion, y que esa validacion esta pendiente.
- Otras GPU: no se documentan. FP8 dinamica requiere soporte de hardware Hopper o posterior en la practica, y MXFP4 se asocia a arquitecturas Blackwell; se trata de una consideracion general, no confirmada por el autor para este checkpoint concreto.
- GPU de consumo: no hay confirmacion de que quepa en tarjetas de 24 GB (RTX 4090) con esta cuantizacion; una GPU de 32 GB quedaria en el limite y requeriria reducir contexto y cache. No verificado.
- Opciones de despliegue: vLLM es la via documentada; el ejemplo del autor usa el comando siguiente. No se mencionan llama.cpp, Ollama, TGI ni formatos GGUF.

```bash
vllm serve soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-pr3118-validation --dtype bfloat16 --max-model-len 1024 --enforce-eager --gpu-memory-utilization 0.85 --speculative-config '{"method":"mtp","num_speculative_tokens":1}' --limit-mm-per-prompt '{"image":0,"video":0}'
```

- Version de runtime validada: vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-FP8Dyn-MTP-MXFP4-pr3118-validation | 27.134.575.616 | No disponible | FP8 dinamica y MXFP4, esquema data-free | apache-2.0 | Repositorio publico, 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | No disponible en la informacion proporcionada | No disponible | No disponible (checkpoint de origen sin cuantizar) | No disponible en la informacion proporcionada | Referenciado como modelo base |
| Alternativas de terceros del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion suficiente sobre modelos comparables para establecer una comparativa de rendimiento, contexto o calidad.

## Limitaciones y advertencias

- Validacion en tiempo de ejecucion pendiente: el autor declara explicitamente que la validacion sobre B200 esta pendiente y que no se reclama ninguna pasada de inferencia en MXFP4. La carga correcta del modelo no equivale a una validacion funcional.
- Artefacto de validacion, no de produccion: el repositorio esta etiquetado como pr3118-validation, con cero descargas y cero likes; no hay evidencia de uso real ni de estabilidad en cargas sostenidas.
- Sin benchmarks: no hay datos de calidad, latencia ni throughput que permitan estimar el impacto de la cuantizacion sobre el rendimiento del modelo base.
- Riesgo de degradacion por cuantizacion: el modulo MTP se cuantizo con esquema data-free, sin datos de calibracion, lo que puede reducir la calidad de los tokens borrador y, con ello, la tasa de aceptacion en decodificacion especulativa. No cuantificada en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede confirmar el comportamiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible. El ejemplo de servicio limita max-model-len a 1024 tokens, muy por debajo de lo habitual en modelos de esta familia, lo que sugiere que no se ha validado con contextos largos.
- Capacidades multimodales: la etiqueta image-text-to-text aparece en los metadatos, pero la model card no documenta vision y el comando de referencia desactiva imagen y video; no debe asumirse soporte multimodal.
- Licencia: el checkpoint se distribuye bajo apache-2.0, pero el autor advierte de que la licencia del modelo de origen sigue siendo aplicable y que esta validacion no concede ninguna licencia adicional. Conviene revisar la model card de Qwen/Qwen3.8-27B antes de cualquier uso comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; sin evaluaciones publicadas no puede acotarse su magnitud en este checkpoint.
- Dependencia de versiones concretas de software: el flujo validado exige vllm 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0 y CUDA 13.0; otras combinaciones no estan verificadas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/soyrsoyr/Qwen3.8-27B-FP8Dyn-MTP-MXFP4-pr3118-validation
- Modelo base Qwen/Qwen3.8-27B (revision referenciada): https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Implementacion llm-compressor PR 3118 (commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Otros enlaces relevantes: no disponible. Las busquedas web realizadas no devolvieron resultados relacionados con este modelo.
