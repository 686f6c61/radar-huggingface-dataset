# Unshifts/gemma-4-12B-it-w8a8

## Resumen

Unshifts/gemma-4-12B-it-w8a8 es una cuantizacion de 8 bits en formato W8A8 (pesos int8, activaciones int8 dinamicas) del modelo multimodal google/gemma-4-12B-it, publicada por el usuario Unshifts. El checkpoint se ha generado con la herramienta llm-compressor del proyecto vLLM y utiliza el formato compressed-tensors, lo que permite servirlo directamente con vLLM sin necesidad de reconvertir pesos. El modelo base tiene 11.959.730.224 parametros (unos 12B) y es de tipo image-text-to-text, es decir, acepta imagenes y texto como entrada.

La relevancia de esta ficha es practica: se trata de una cuantizacion int8 que reduce el peso del checkpoint a unos 12,1 GiB, lo que permite desplegar un modelo multimodal de 12B en GPUs de gama alta para consumidores con 24 GB de VRAM, a cambio de una perdida de precision que el autor no cuantifica. No hay informacion publicada sobre idiomas soportados, licencia ni resultados de benchmarks en la informacion disponible.

El detalle mas importante de la model card es una advertencia tecnica concreta: la proyeccion de parches de vision (vision_embedder.patch_dense) debe permanecer en BF16. Si se cuantiza, vLLM la procesa en int8 y todas las imagenes se decodifican a un embedding basura, con el modelo respondiendo "white" o "false" a cualquier imagen. El repositorio incluye un config.json con la lista quantization_config.ignore ya corregida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo multimodal image-text-to-text, tag gemma4_unified) |
| Parametros totales | 11.959.730.224 (~12B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo de despliegue del autor usa --max-model-len 8192) |
| Tipos de cuantizacion | W8A8 int8: pesos int8 por canal simetrico (strategy: channel, dynamic: false); activaciones int8 dinamicas por token simetricas (strategy: token, dynamic: true) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, int-quantized), ~12,1 GiB; no se publican pesos GGUF |

Capas excluidas de la cuantizacion (mantenidas en BF16): lm_head, todas las capas embed y las proyecciones de vision sin encoder (model.vision_embedder.patch_dense y vision_embedder.patch_dense).

## Arquitectura y entrenamiento

La informacion disponible describe unicamente el proceso de cuantizacion, no la arquitectura interna ni el entrenamiento del modelo base. Se sabe que el checkpoint original es google/gemma-4-12B-it, un modelo multimodal de unos 12B parametros con pipeline image-text-to-text, y que la cuantizacion se aplica con QuantizationModifier de llm-compressor sobre los modulos de tipo Linear, con el esquema W8A8. El recipe publicado es reproducible:

```yaml
default_stage:
  default_modifiers:
    QuantizationModifier:
      targets: [Linear]
      ignore: ['re:.*vision.*', 're:.*audio.*', lm_head, 're:.*embed.*']
      scheme: W8A8
      bypass_divisibility_checks: false
```

Un detalle relevante es que el recipe ignora tambien los modulos que coincidan con .*audio.*, lo que sugiere que el modelo base puede tener componentes de audio, aunque la model card solo documenta el manejo de imagen y audio en el ejemplo de vLLM (--limit-mm-per-prompt '{"image":4,"audio":4,"video":0}'). No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones de decodificacion (especulativa, atencion lineal, SSM) ni la naturaleza exacta del bloque transformer del modelo base. El checkpoint no incorpora ningun esquema de cuantizacion de KV cache (kv_cache_dtype queda en el valor por defecto).

## Capacidades

- Generacion de texto conversacional: el repositorio incluye chat_template.jinja, la plantilla de chat de Gemma, y el pipeline declarado es conversacional.
- Entrada multimodal de imagen: pipeline image-text-to-text, con proyeccion de parches de vision (vision_embedder.patch_dense) mantenida en BF16.
- Entrada de audio: el ejemplo de vLLM del autor permite audio (--limit-mm-per-prompt '{"image":4,"audio":4,"video":0}'), pero la model card no detalla la calidad ni el alcance de esta capacidad.
- Video: explicitamente deshabilitado en el ejemplo de despliegue (valor 0), sin indicar si el modelo base lo soporta.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Servido compatible con endpoints: el repositorio incluye el tag endpoints_compatible.
- Inferencia eficiente: al ser W8A8 ofrece mayor throughput y menor huella de memoria que el modelo base en BF16, a costa de precision.

## Casos de uso

- Despliegue multimodal en una sola GPU de 24 GB: gracias a los ~12,1 GiB de pesos int8, un modelo de 12B con vision puede servirse en una RTX 4090 o RTX 3090 con vLLM, dejando el resto de la VRAM para KV cache y activaciones.
- Servicio de preguntas y respuestas sobre imagenes en produccion: clasificacion, descripcion o extraccion de informacion de capturas, diagramas o fotografias, exponiendo el modelo con vllm serve y el endpoint compatible con la API de OpenAI.
- Chat conversacional multi-turno: con --enable-prefix-caching y --max-model-len 8192, util para asistentes con historial de conversacion moderado.
- Procesamiento por lotes de imagenes y texto: con --max-num-seqs 256 y --max-num-batched-tokens 32768 se puede configurar un throughput alto para trabajos offline de etiquetado o resumen de contenido visual.
- Prototipado e investigacion en cuantizacion: el repositorio incluye recipe.yaml, lo que permite reproducir, modificar y comparar el esquema W8A8 frente a otras precisiones sobre el mismo modelo base.
- Sustitucion de un despliegue BF16 con restricciones de memoria: cuando el modelo original no cabe en el hardware disponible, esta variante reduce el peso del checkpoint aproximadamente a la mitad respecto a BF16, manteniendo el mismo pipeline de transformers y de vLLM.
- Base para pipelines con audio e imagen simultaneos: subiendo el limite multimodal con --limit-mm-per-prompt se pueden mezclar hasta 4 imagenes y 4 entradas de audio por prompt, segun el ejemplo del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mediciones de MMLU, HumanEval, GSM8K ni de tareas multimodales, ni comparaciones de degradacion de precision respecto al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 12,1 GiB en int8, segun el tamano declarado del archivo model.safetensors (~12,1 GiB) y el tamano del repositorio (13,1 GB). A esto hay que sumar la KV cache y las activaciones, ademas de las capas lm_head, embed y las proyecciones de vision que permanecen en BF16.
- GPUs recomendadas: el autor no especifica modelos de GPU. Por tamano de memoria, el checkpoint encaja con holgura en A100 40/80 GB, H100 80 GB y L40S 48 GB, y de forma mas ajustada en GPUs de consumo con 24 GB (RTX 3090, RTX 4090).
- GPU de consumo: es probable que quepa en tarjetas de 24 GB para contextos moderados, aunque no hay confirmacion del autor ni mediciones de memoria maxima real. En tarjetas de 16 GB el margen seria insuficiente con la configuracion de ejemplo.
- Opciones de despliegue: vLLM es la via soportada explicitamente (requiere una version reciente con soporte W8A8 de compressed-tensors). El repositorio tambien declara library_name: transformers. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son compatibles con este checkpoint tal y como esta distribuido. TGI no se menciona.
- Parametros de servicio sugeridos por el autor: --max-model-len 8192, --gpu-memory-utilization 0.94, --max-num-seqs 256, --max-num-batched-tokens 32768, --enable-prefix-caching. Para multimodal hay que elevar el limite por prompt.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unshifts/gemma-4-12B-it-w8a8 | 11.959.730.224 | no disponible | int8 W8A8, safetensors compressed-tensors | no disponible | HuggingFace, requiere vLLM reciente |
| google/gemma-4-12B-it (base) | no disponible en la informacion proporcionada | no disponible | BF16 original (segun el autor, el checkpoint de partida) | no disponible | HuggingFace |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no se han encontrado en la informacion proporcionada |

La busqueda web realizada no devolvio ningun resultado relacionado con el modelo ni con alternativas comparables, por lo que no es posible contrastar esta variante con otras cuantizaciones de la misma categoria.

## Limitaciones y advertencias

- Riesgo critico de cuantizacion de vision: si la proyeccion vision_embedder.patch_dense se cuantiza, todas las imagenes se decodifican al mismo embedding basura y el modelo responde "white" o "false" a cualquier imagen. No se debe regenerar config.json desde el checkpoint original sin volver a anadir las entradas de ignore.
- Perdida de precision por cuantizacion: el autor no publica ninguna evaluacion de degradacion respecto al modelo base en BF16. En tareas sensibles a la precision numerica (matematicas, codigo, razonamiento de varios pasos) el impacto es desconocido.
- Licencia no disponible: al no declararse licencia en el repositorio, no se puede confirmar que el uso comercial este permitido. Conviene verificar la licencia del modelo base google/gemma-4-12B-it antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay lista de idiomas soportados, por lo que no se puede garantizar un comportamiento multilingue adecuado.
- Contexto no declarado: la longitud de contexto real del modelo es desconocida; el valor 8192 del ejemplo es un parametro de servido, no una especificacion del modelo.
- KV cache no cuantizada: el checkpoint no incluye esquema de KV cache, por lo que el consumo de memoria crece con la longitud de contexto y el numero de secuencias simultaneas.
- Riesgo de alucinacion: no hay informacion especifica sobre este punto, ni evaluaciones de fiabilidad. Como en cualquier modelo generativo, se recomienda validacion externa en usos criticos.
- Sesgos: no disponibles. No se han publicado analisis de sesgo del modelo base ni de esta cuantizacion.
- Adopcion practicamente nula: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso en produccion ni validacion por terceros.
- Sin soporte GGUF: no es desplegable con llama.cpp u Ollama, lo que limita las opciones de inferencia en CPU o en GPUs sin soporte de vLLM.
- Restriccion de version: requiere una version reciente de vLLM con soporte de W8A8 de compressed-tensors; versiones antiguas pueden no cargar el checkpoint correctamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Unshifts/gemma-4-12B-it-w8a8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM: https://github.com/vllm-project/vllm
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos correspondian a webcams de Sydney y no guardan relacion con la ficha.
