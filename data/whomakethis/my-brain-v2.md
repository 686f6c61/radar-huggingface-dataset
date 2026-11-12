# whomakethis/my-brain-v2

## Resumen

my-brain-v2 es un ajuste fino (finetune) del modelo multimodal Gemma 4 E2B en su version instructiva, partiendo concretamente del checkpoint cuantizado en 4 bits publicado por Unsloth (`unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`). Lo desarrolla el usuario independiente "whomakethis" y se distribuye en Hugging Face bajo licencia Apache 2.0. El pipeline declarado es `image-text-to-text`, por lo que hereda la capacidad de procesar imagenes y texto del modelo base Gemma 4.

El modelo resuelve un caso de personalizacion: adaptar un modelo Gemma 4 de tamano pequeno (E2B) a un dominio o estilo concreto mediante entrenamiento supervisado con la libreria Unsloth y TRL, que el autor describe como "2x mas rapido". El repositorio pesa 10,3 GB y contiene 5.123.178.051 parametros en formato safetensors, lo que sugiere que los pesos se han fusionado y guardado en mayor precision que el checkpoint base cuantizado en 4 bits del que parte.

Es relevante ahora porque demuestra el flujo tipico de finetuning accesible de la familia Gemma 4 con herramientas de bajo coste (Unsloth), aunque la informacion publicada es muy escasa: no hay datos de entrenamiento, benchmarks ni detalles del dataset. La model card es practicamente la plantilla por defecto de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4, variante E2B); detalles no disponibles |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el base es bnb-4bit; el repo contiene safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, es decir, la variante instructiva de Gemma 4 E2B cuantizada en 4 bits con bitsandbytes y preparada por Unsloth. La arquitectura subyacente es la de Gemma 4 E2B: un transformer multimodal con entrada de imagen y texto, segun el pipeline `image-text-to-text` declarado. No se dispone de informacion publicada sobre el numero de capas, dimensiones ocultas, mecanismo de atencion ni detalles del encoder visual.

El entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO o solo SFT, ni hiperparametros. El autor afirma que el entrenamiento fue "2x mas rapido" gracias a Unsloth, pero no aporta mediciones. El hecho de que el repo contenga 5.123 millones de parametros en safetensors y 10,3 GB sugiere pesos fusionados en precision superior a 4 bits (probablemente bf16 o fp16), aunque no se confirma en la documentacion.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo Gemma 4 E2B.
- Procesamiento de imagenes y texto (pipeline `image-text-to-text`): descripcion de imagenes, respuesta a preguntas visuales y conversacion multimodal.
- Razonamiento y generacion de codigo basicos, limitados por el tamano E2B del modelo base.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible; depende del modelo base Gemma 4.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repo.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno basicos, aunque se desconoce la ventana de contexto efectiva; adecuado para demos y pruebas de concepto, no para produccion sin validacion.
- Descripcion y etiquetado de imagenes: al ser un modelo image-text-to-text, puede usarse para generar descripciones o extraer informacion de imagenes en pipelines de catalogacion, con la salvedad de su tamano reducido.
- Finetuning de dominio especifico: sirve como ejemplo o punto de partida para quien quiera replicar el flujo de Unsloth + TRL sobre Gemma 4 E2B y adaptarlo a su propio dataset.
- Educacion e investigacion: util para estudiar el comportamiento de un finetune de Gemma 4 E2B con recursos limitados y comparar con el modelo base.
- Generacion de texto asistida en entornos con GPU consumer: con 5,1 mil millones de parametros, es desplegable en GPUs de gama alta de consumo, lo que permite experimentar localmente.
- Chatbot interno de bajo coste: para equipos que necesiten un modelo pequeno en ingles con capacidad visual y quieran evitar dependencias de API externas, sujeto a validacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 10-11 GB solo para pesos (5,1 mil millones de parametros), mas overhead de activaciones y KV cache; en cuantizacion 4 bits, alrededor de 3-4 GB para pesos.
- GPU recomendadas: para bf16, A100 40 GB, H100 o RTX 4090 (24 GB); para 4 bits, RTX 3090/4090, RTX 4080 o incluso GPUs de 8-12 GB con cuantizacion agresiva.
- Cabe en GPU consumer: si, en RTX 4090 en bf16 y en GPUs de 8-12 GB con cuantizacion 4 bits, segun estimaciones a partir del numero de parametros.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| my-brain-v2 | 5,12 B | no disponible | Apache 2.0 | Si (image-text-to-text) | Hugging Face |
| Gemma 4 E2B it (base) | ~5 B (E2B) | no disponible | Gemma license (segun modelo original) | Si | Hugging Face |
| Qwen2.5-VL 3B | ~3 B | 32K (segun documentacion publica) | Apache 2.0 | Si | Hugging Face |
| LLaVA-OneVision 0.5B | ~0,5 B | no disponible | Apache 2.0 | Si | Hugging Face |

Nota: los datos de los modelos comparativos provienen de conocimiento general y pueden variar; no se dispone de benchmarks comparativos publicados para my-brain-v2.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Gemma 4, puede reproducir sesgos del modelo base y del dataset de finetuning, que no se ha publicado.
- Riesgo de alucinacion: alto en modelos de este tamano, especialmente en tareas de razonamiento y matematicas; sin benchmarks no es posible cuantificarlo.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Gemma 4 original, ya que el finetune podria estar sujeto a sus terminos adicionales.
- Caveat para produccion: la model card no aporta informacion sobre dataset, evaluacion ni calidad; no se recomienda su uso en produccion sin una evaluacion propia. El autor es un usuario independiente y el modelo tiene 0 descargas y 0 likes en el momento de la consulta.
- El checkpoint base esta cuantizado en 4 bits; el finetune sobre pesos cuantizados puede degradar la calidad respecto a un finetune en precision completa.

## Enlaces

- Hugging Face: https://huggingface.co/whomakethis/my-brain-v2
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
