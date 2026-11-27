# TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ4

## Resumen

DiffusionGemma 26B A4B Instruct es un modelo multimodal de Google que combina una arquitectura de mezcla de expertos (MoE) con un esquema de generacion basado en difusion, orientado a tareas de imagen-texto-a-texto con capacidad conversacional. Este repositorio concreto, publicado por el usuario TiGa-RCE, no es un modelo entrenado desde cero, sino una conversion al formato MLX con cuantizacion mixta de 4 bits (con sobrescrituras de 5, 6 y 8 bits en capas seleccionadas) del checkpoint original `google/diffusiongemma-26B-A4B-it`.

El interes practico de esta ficha reside en que permite ejecutar un modelo de aproximadamente 25.800 millones de parametros totales en hardware Apple Silicon mediante MLX, reduciendo el peso de los shards a unos 15,8 GB. El sufijo A4B indica que, pese al tamano total, solo se activa una fraccion de los parametros por token, lo que abarata la inferencia frente a un modelo denso equivalente.

La relevancia es doble: por un lado, valida el flujo de cuantizacion MLX para arquitecturas de difusion multimodal; por otro, advierte de las limitaciones de un artefacto comunitario sin validacion de calidad independiente por parte del autor de la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemma (transformer MoE con generacion por difusion), multimodal imagen-texto |
| Parametros totales | 25.823.781.228 (segun safetensors) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos, sin cifra confirmada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afina por defecto, grupo de 64, con sobrescrituras mixtas de 5/6/8 bits en capas seleccionadas |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a los terminos de licencia Gemma 4 de Google) |
| Formato de pesos | safetensors MLX (shards de ~15,80 GB) |

## Arquitectura y entrenamiento

El modelo base es un DiffusionGemma, una variante de la familia Gemma que sustituye o complementa la generacion autorregresiva clasica por un proceso de difusion para producir tokens. La configuracion incluye un componente de vision y un procesador multimodal, ya que la pipeline declarada es `image-text-to-text`. La estructura MoE implica que el modelo mantiene 25.800 millones de parametros en memoria pero activa solo un subconjunto por paso, lo que explica la nomenclatura A4B.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en el checkpoint original. Esta conversion tampoco aporta datos de entrenamiento: se limita a transformar los pesos BF16 del repositorio `mlx-community/diffusiongemma-26B-A4B-it-bf16` (revision `2cd36f950eb065c96c80810fb6b859b114cd052d`) a safetensors MLX cuantizados. El autor indica que no se conservo el comando de conversion ni la version de herramienta, y que la cadena de procedencia se infiere de archivos y marcas de tiempo.

## Capacidades

- Generacion multimodal imagen-texto-a-texto: acepta imagenes y texto como entrada y produce texto.
- Conversacion multi-turno segun la pipeline declarada (`conversational`).
- Generacion de texto y razonamiento mediados por el proceso de difusion del modelo base.
- Procesamiento de vision integrado mediante el procesador y la configuracion de vision heredados del checkpoint BF16.
- Ejecucion en Apple Silicon a traves de MLX, con pesos ya cuantizados para reducir huella de memoria.
- No hay evidencia en la informacion disponible sobre soporte de tool calling, function calling, agentes, audio o modo thinking explicito.

## Casos de uso

- Prototipado local en Mac: cargar el modelo con MLX en un equipo Apple Silicon para experimentar con un modelo multimodal de ~26B sin depender de GPUs NVIDIA, gracias a los shards de 15,8 GB.
- Descripcion de imagenes en entornos de desarrollo: usar la pipeline imagen-texto para generar descripciones o respuestas sobre capturas, diagramas o fotos en herramientas internas.
- Asistentes conversacionales con entrada visual: construir un chat que reciba una imagen y mantenga el contexto de la conversacion, aprovechando la naturaleza conversacional declarada.
- Evaluacion comparativa de cuantizaciones: servir como referencia para medir la perdida de calidad de una cuantizacion mixta 4/5/6/8 bits frente al BF16 original en tareas de vision y texto.
- Investigacion sobre generacion por difusion: estudiar el comportamiento de un modelo de difusion multimodal en tareas de generacion de texto, comparandolo con modelos autorregresivos.
- Despliegue de bajo coste en estaciones de trabajo Apple: integrar el modelo en scripts o aplicaciones locales que necesiten inferencia multimodal sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la conversion indica explicitamente que el rendimiento en generacion y la calidad no se han probado de forma independiente para esta subida.

## Requisitos de hardware

- VRAM/RAM unificada estimada: los shards suman unos 15,80 GB, por lo que se necesita al menos esa cantidad de memoria unificada mas margen para el runtime y el contexto.
- Hardware objetivo: Apple Silicon con MLX; se recomienda un Mac con 32 GB de memoria unificada o superior para operar con holgura.
- GPU NVIDIA: no es el objetivo de este repositorio; para CUDA habria que usar el checkpoint original o una conversion distinta.
- Cabe en GPU de consumo: no aplicable directamente a este formato MLX; en el ecosistema Apple, equipos con 24-32 GB de memoria unificada son el minimo razonable.
- Opciones de despliegue: MLX (libreria declarada). No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ4 | 25,8B totales (A4B) | no disponible | safetensors MLX 4-bit mixto | apache-2.0 | Conversion comunitaria, sin benchmarks |
| google/diffusiongemma-26B-A4B-it | 25,8B totales (A4B) | no disponible | safetensors BF16 | apache-2.0 (terminos Gemma 4) | Modelo original de Google |
| mlx-community/diffusiongemma-26B-A4B-it-bf16 | 25,8B totales (A4B) | no disponible | safetensors MLX BF16 | apache-2.0 | Fuente inmediata de esta conversion |

## Limitaciones y advertencias

- Artefacto comunitario sin validacion: el autor no ha probado de forma independiente la generacion ni la calidad de esta cuantizacion.
- Procedencia inferida: no se conservo el comando de conversion ni la version de herramienta; la cadena se deduce de archivos y marcas de tiempo.
- Posible degradacion por cuantizacion: la mezcla de 4/5/6/8 bits puede introducir perdida de calidad frente al BF16, especialmente en tareas de vision o razonamiento complejo.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluacion especifica para este checkpoint.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base de Google.
- Idiomas: no disponibles; no se puede confirmar cobertura multilingue.
- Contexto: no disponible; no se debe asumir una ventana concreta sin consultar el `config.json`.
- Licencia: aunque la etiqueta indica apache-2.0, la model card remite a los terminos de licencia Gemma 4 de Google, que pueden imponer restricciones adicionales al uso comercial; conviene revisarlos antes de produccion.
- Sin soporte declarado para tool calling ni agentes; no asumir estas capacidades sin verificacion.
- Descargas y likes a cero en el momento de la consulta: no hay senales de adopcion ni de validacion por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TiGa-RCE/diffusiongemma-26B-A4B-it-MLX-oQ4
- Modelo original: https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Fuente BF16 en MLX: https://huggingface.co/mlx-community/diffusiongemma-26B-A4B-it-bf16
- Revision de la fuente BF16: https://huggingface.co/mlx-community/diffusiongemma-26B-A4B-it-bf16/tree/2cd36f950eb065c96c80810fb6b859b114cd052d
- Terminos de licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
