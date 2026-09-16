# yada42069/Satyr-V0.1-4B

## Resumen

Satyr V0.1 4B es un ajuste fino (fine-tune) del modelo Qwen/Qwen3-4B-Thinking-2507, publicado por el usuario yada42069 en HuggingFace. Se presenta explícitamente como un modelo "sin bozal" orientado a escritura creativa para adultos, conversación y contenido NSFW, con la experimentación como único uso declarado. Cuenta con 4.022.468.096 parámetros reales (según los pesos en safetensors) y se distribuye bajo licencia Apache 2.0, con el inglés como único idioma declarado.

El interés técnico del modelo es doble. Por un lado, es un caso de estudio de ajuste fino sobre un modelo "thinking" (Qwen3-4B-Thinking-2507) usando, según las etiquetas del repositorio, la herramienta Unsloth. Por otro, ejemplifica la familia de modelos desalineados deliberadamente, en los que se eliminan o atenúan las capas de rechazo del modelo base, lo que lo hace relevante para investigación en seguridad, alineación y evaluación de salvaguardas.

La model card es extremadamente escueta: no documenta el dataset de entrenamiento, el método exacto (LoRA, QLoRA, fine-tune completo), la longitud de contexto conservada ni resultados de evaluación. El repositorio, de 17,7 GB, incluye pesos en safetensors y al menos una cuantización en formato GGUF, y el modelo registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3-4B-Thinking-2507; no detallada en la model card) |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica) |
| Tipos de cuantizacion | GGUF (la etiqueta del repositorio lo indica); niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y GGUF |
| Modelo base | Qwen/Qwen3-4B-Thinking-2507 |
| Tamano del repositorio | 17,7 GB |
| Uso declarado | experimentacion; contenido 18+ (NSFW) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna mas alla de lo que se deduce del modelo base. Qwen/Qwen3-4B-Thinking-2507 es un transformer denso de aproximadamente 4.000 millones de parametros con modo de razonamiento explicito ("thinking"), y Satyr V0.1 4B conserva ese esqueleto: el recuento de parametros (4.022.468.096) coincide con el de un modelo denso de esa escala, sin indicios de mezcla de expertos ni de arquitectura hibrida. La model card no aporta detalles sobre atencion, normalizacion, tokenizador ni vocabulario.

Tampoco hay informacion publicada sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si hubo RLHF, DPO u otro tipo de ajuste por preferencias, y si el fine-tune fue completo o mediante adaptadores. La unica pista tecnica es la etiqueta "unsloth" y la etiqueta "base_model:quantized:Qwen/Qwen3-4B-Thinking-2507", que sugieren un ajuste fino realizado con el framework Unsloth (habitualmente LoRA o QLoRA) partiendo de una version cuantizada del modelo base. El autor tampoco documenta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, destilacion, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en estilo libre y registro coloquial.
- Escritura creativa y narrativa para adultos, incluido contenido NSFW explicito y lenguaje soez.
- Roleplay y mantenimiento de personajes en conversaciones multi-turno.
- Generacion de ficcion y dialogos sin las restricciones de rechazo habituales del modelo base.
- Se hereda del modelo base la posibilidad de razonamiento paso a paso (modo "thinking"), aunque no hay evidencia publicada de que el fine-tune lo preserve.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo base es compatible con agentes, pero no se confirma para este fine-tune.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades de vision, audio o multimodalidad: no disponibles.
- Etiqueta "endpoints_compatible": el repositorio esta preparado para desplegarse mediante HuggingFace Inference Endpoints.

## Casos de uso

- Escritura de ficcion para adultos: generacion de relatos, novelas y guiones con contenido explicito, uso para el que el modelo esta explicitamente disenado y en el que las capas de rechazo del modelo base serian un obstaculo.
- Roleplay conversacional: mantener personajes con personalidad fija a lo largo de sesiones largas, aprovechando el ajuste conversacional.
- Investigacion en seguridad y alineacion: analisis de como se comporta un modelo sin capas de rechazo, comparacion con el modelo base y estudio de la facilidad con que un fine-tune elimina las salvaguardas originales.
- Red teaming y evaluacion de jailbreaks: uso como sujeto de prueba para medir la eficacia de filtros, clasificadores de contenido y sistemas de moderacion en produccion.
- Generacion de dialogos en localizacion de videojuegos o narrativa interactiva para publico adulto, con revision humana obligatoria antes de publicar.
- Prototipado rapido de asistentes de escritura creativa desplegados en local, gracias a su tamano reducido y a la disponibilidad de cuantizaciones GGUF para equipos sin GPU dedicada.
- Estudio de la degradacion de capacidades: comprobar hasta que punto un fine-tune tematico sobre un modelo de razonamiento conserva las capacidades originales de matematicas y codigo.
- Generacion de material de entrenamiento sintetico etiquetado como 18+ para pipelines que necesiten clasificadores de contenido adulto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K u otros) ni comparaciones con el modelo base, por lo que se desconoce el impacto del ajuste fino sobre las capacidades de razonamiento, matematicas y codigo de Qwen3-4B-Thinking-2507.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 4.022 millones de parametros; no son cifras publicadas por el autor):
  - FP16 / BF16: en torno a 8-9 GB de VRAM, mas la cache KV.
  - Cuantizacion de 8 bits: aproximadamente 4,5-5 GB.
  - Cuantizacion de 4 bits (Q4_K_M y similares): aproximadamente 2,5-3,5 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3080). Para 4 bits basta con 4 GB, lo que incluye GTX 1650, RTX 3050 y graficas integradas con memoria unificada.
- Cabe en GPU de consumo: si. El modelo esta pensado para ese escenario, dado su tamano y la existencia de pesos GGUF.
- GPU de datacenter: A100, H100 o L40S son suficientes y quedan sobredimensionadas para una sola instancia; permiten lotes grandes y contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM, TGI y HuggingFace Inference Endpoints (el repositorio lleva la etiqueta "endpoints_compatible").
- Latencia y throughput: no disponibles. No hay mediciones publicadas y dependen de la cuantizacion, el hardware y la longitud de contexto, que tampoco esta documentada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Satyr V0.1 4B | 4,02 B | no disponible | no verificado (base thinking) | apache-2.0 | safetensors y GGUF, 0 descargas |
| Qwen/Qwen3-4B-Thinking-2507 (base) | ~4 B | no disponible en la informacion proporcionada | modo thinking documentado por el autor del base | apache-2.0 | modelo de referencia, ampliamente distribuido |
| Otros fine-tunes sin censura de la misma escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables en la informacion proporcionada sobre alternativas equivalentes (por ejemplo, otras familias de modelos desalineados de 4 a 8 mil millones de parametros), por lo que no se puede establecer una comparacion cuantitativa de rendimiento. La comparacion con el modelo base es estructural: mismo numero de parametros y misma licencia, pero sin informacion publica sobre que capacidades se han conservado o degradado.

## Limitaciones y advertencias

- Contenido 18+: el modelo genera material NSFW explicito de forma deliberada. No es apto para menores ni para entornos de produccion sin moderacion.
- Ausencia de alineacion de seguridad: al estar disenado para no rechazar peticiones, existe riesgo elevado de generar contenido danino, ilegal o gravemente ofensivo. No debe exponerse a usuarios finales sin filtros.
- Riesgo de alucinacion: no hay evaluaciones publicadas; se desconoce si el fine-tune ha degradado la fidelidad factual respecto al modelo base.
- Impacto desconocido sobre el razonamiento: el ajuste sobre un modelo "thinking" puede haber reducido o eliminado su cadena de razonamiento. No hay datos que lo confirmen o desmientan.
- Idioma: unicamente ingles declarado. El rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- Contexto: la model card no especifica la ventana de contexto, por lo que cualquier estimacion de coste de cache KV o de casos de uso con documentos largos es especulativa.
- Licencia: apache-2.0 permite uso comercial en teoria, pero las condiciones de uso de la plataforma de publicacion (etiqueta "not-for-all-audiences") y la normativa aplicable al contenido sexual o danino pueden impedirlo en la practica. Los terminos de servicio de muchos proveedores de alojamiento prohiben este tipo de contenido.
- Trazabilidad del dataset: se desconoce con que datos se entreno, lo que impide auditar sesgos, derechos de autor o presencia de material ilegal en el corpus.
- Sin validacion de la comunidad: 0 descargas y 0 likes, model card minimalista y autor sin historial publico verificable. La calidad del ajuste no esta contrastada por terceros.
- Version en desarrollo: el propio autor indica que existen versiones mas refinadas en preparacion, por lo que V0.1 debe considerarse una instantanea experimental y no una version estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yada42069/Satyr-V0.1-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Paper, blog o repositorio del autor: no disponible en la informacion proporcionada.
- Demos o espacios asociados: no disponibles.
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo; los resultados devueltos corresponden a perfiles de redes sociales sin relacion con el proyecto.
