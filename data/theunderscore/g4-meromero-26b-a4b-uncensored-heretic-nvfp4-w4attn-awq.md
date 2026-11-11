# TheUnderscore/G4-MeroMero-26B-A4B-uncensored-heretic-NVFP4-W4ATTN-AWQ

## Resumen

G4-MeroMero-26B-A4B-uncensored-heretic-NVFP4-W4ATTN-AWQ es una cuantizacion de precision mixta del modelo `zerofata/G4-MeroMero-26B-A4B-uncensored-heretic`, un fine-tune de tipo "uncensored/heretic" sobre una arquitectura Gemma 4 con mezcla de expertos (MoE). El autor de la cuantizacion es TheUnderscore, que publica el artefacto en Hugging Face con licencia declarada apache-2.0 y licencia nominal gemma. El modelo resuelve el problema de desplegar un modelo multimodal de 26.544 millones de parametros en GPUs con memoria limitada, combinando int4 en las proyecciones de atencion y float4 (NVFP4) en los expertos MoE.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion granular por capa con `llmcompressor` y el formato `compressed-tensors`; por otro, advierte de que el artefacto requiere un fork especifico de vLLM (1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`) con kernels de atencion SM70 D=512, y que no ha sido probado en vLLM estandar. El pipeline declarado es `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen y salida texto.

El repositorio ocupa 17,9 GB, esta etiquetado para transformers, safetensors y vLLM, y solo declara soporte de ingles. No registra descargas ni likes en el momento de la consulta, y su fecha de creacion es el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), multimodal image-text-to-text |
| Parametros totales | 26.544.133.710 (26,5 B) |
| Parametros activos | no disponible (el nombre indica A4B, ~4 B activos, no confirmado en la model card) |
| Longitud de contexto | no disponible (el ejemplo de uso fija `max_model_len=8192`) |
| Tipos de cuantizacion | Precision mixta: W4A16 int4 grupo 128 en atencion (q/k/v/o); NVFP4 float4 grupo 16 en MLP/expertos MoE; BF16 en embeddings, norms y router |
| Idiomas soportados | en |
| Licencia | apache-2.0 declarada en frontmatter; `license_name: gemma`; campo de licencia del repo: gemma |
| Formato de pesos | safetensors con `quant_method: "compressed-tensors"` (dos `config_groups`) |

## Arquitectura y entrenamiento

El modelo base es un fine-tune "uncensored/heretic" de Gemma 4 con arquitectura de mezcla de expertos. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion no esta disponible. El pipeline `image-text-to-text` confirma que el modelo acepta imagenes como entrada ademas de texto.

La innovacion tecnica de este artefacto es la cuantizacion por capas con `llmcompressor` en modo `oneshot` y `config_groups` con dispatch por capa. Las proyecciones de atencion se cuantizan a int4 con grupo de 128 y las capas MLP/expertos a NVFP4 con grupo de 16, mientras que embeddings, normalizaciones y router se mantienen en BF16 para preservar la estabilidad del enrutado de expertos. El resultado se serializa como `compressed-tensors` con dos grupos de configuracion. El autor incluye el script `quantize-nvfp4-gemma4.py` en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Entrada multimodal imagen-texto con salida de texto (`image-text-to-text`).
- Razonamiento y generacion de codigo: no documentado explicitamente en la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas a ingles segun la etiqueta de idioma.
- Modo "uncensored/heretic": el fine-tune base relaja los filtros de rechazo, segun la nomenclatura del modelo.
- Compatible con endpoints (`endpoints_compatible`) y despliegue en vLLM mediante fork.

## Casos de uso

- Despliegue multimodal en GPUs de gama alta con memoria limitada: la cuantizacion mixta reduce el peso a 17,9 GB, lo que permite servir el modelo de 26,5 B en configuraciones con tensor parallelism de 2 GPUs en lugar de requerir el peso completo en BF16.
- Prototipado de asistentes conversacionales en ingles: el pipeline `conversational` y la ventana de 8192 tokens del ejemplo permiten mantener dialogos multi-turno con contexto moderado.
- Investigacion sobre cuantizacion NVFP4: el repositorio sirve como referencia reproducible de cuantizacion por capas con `llmcompressor`, con script incluido y configuracion de dos grupos.
- Evaluacion de fine-tunes "uncensored": util para estudiar el comportamiento de modelos con filtros relajados en tareas de generacion abierta, siempre con las advertencias de seguridad correspondientes.
- Procesamiento de documentos con imagen y texto: al aceptar entrada image-text-to-text, puede emplearse en tareas de descripcion o extraccion a partir de capturas y figuras.
- Benchmarking de kernels de atencion SM70: el fork 1Cat-vLLM con kernels D=512 permite medir rendimiento en GPUs de arquitectura Volta y comparar con vLLM estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 17,9 GB en disco; en inferencia hay que sumar cache KV y overhead del runtime, por lo que se recomienda al menos 24 GB por GPU en configuracion de 2 GPUs con tensor parallelism.
- GPU recomendadas: el fork 1Cat-vLLM incluye kernels SM70, lo que apunta a V100 (Volta) como objetivo; tambien cabe en A100 y H100 con `tensor_parallel_size=2`.
- GPU consumer: no confirmado; un unico dispositivo de 24 GB podria no bastar para el peso cuantizado mas cache KV, y la model card no documenta despliegue en una sola GPU.
- Opciones de despliegue: vLLM mediante 1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`. No probado en vLLM estandar. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-uncensored-heretic-NVFP4-W4ATTN-AWQ | 26,5 B (MoE, ~4 B activos segun nombre) | no disponible (ejemplo 8192) | W4A16 + NVFP4 mixta | apache-2.0 / gemma | Hugging Face, requiere fork vLLM |
| zerofata/G4-MeroMero-26B-A4B-uncensored-heretic (base) | 26,5 B (MoE) | no disponible | BF16 | no disponible | Hugging Face |
| Gemma 3 / Gemma 4 estandar | no disponible | no disponible | BF16, int4, int8 | gemma | Hugging Face, vLLM estandar |

La comparativa con modelos de la misma categoria es limitada porque la informacion proporcionada solo incluye el modelo base y la referencia generica a Gemma. No se dispone de datos de rendimiento comparado.

## Limitaciones y advertencias

- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Modelo "uncensored/heretic": puede generar contenido sin los filtros habituales de seguridad; requiere moderacion externa en produccion.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados.
- Licencia ambigua: el frontmatter declara apache-2.0 pero el campo de licencia del repo y `license_name` indican gemma; conviene verificar los terminos de la licencia Gemma antes de uso comercial.
- Requiere un fork especifico de vLLM no probado en vLLM estandar, lo que limita la portabilidad y el soporte.
- La cuantizacion NVFP4 en expertos puede degradar la calidad frente al modelo base en BF16; no se documenta evaluacion de la perdida de calidad.
- No hay informacion sobre datos de entrenamiento, sesgos ni evaluaciones de seguridad.
- Longitud de contexto real no documentada; el ejemplo fija 8192 tokens.
- Repositorio sin descargas ni likes: no hay evidencia de validacion por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/G4-MeroMero-26B-A4B-uncensored-heretic-NVFP4-W4ATTN-AWQ
- Modelo base: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B-uncensored-heretic
- Fork 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM
- Rama del fork requerida: https://github.com/Th-Underscore/1Cat-vLLM/tree/feat/gemma4-sm70-native-v3
