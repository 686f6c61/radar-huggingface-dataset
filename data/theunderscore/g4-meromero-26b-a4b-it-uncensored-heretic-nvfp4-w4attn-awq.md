# TheUnderscore/G4-MeroMero-26B-A4B-it-uncensored-heretic-NVFP4-W4ATTN-AWQ

## Resumen

G4-MeroMero-26B-A4B-it-uncensored-heretic-NVFP4-W4ATTN-AWQ es una cuantizacion de precision mixta del modelo `llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic`, un finetune tipo "uncensored/heretic" sobre una base Gemma 4 con arquitectura Mixture-of-Experts (MoE). Lo publica el usuario TheUnderscore y su interes no esta en el modelo en si, sino en la tecnica de compresion: combina W4A16 (int4) en las proyecciones de atencion con NVFP4 (float4) en las capas MLP y en los expertos del MoE, dejando embeddings, normalizaciones y router en BF16.

El resultado es un checkpoint de 17,9 GB con 26.544.133.710 parametros totales que mantiene el pipeline `image-text-to-text` del modelo original, es decir, conserva la capacidad multimodal de entrada imagen-texto. La licencia declarada en la model card es Apache 2.0, aunque los metadatos de Hugging Face indican `gemma` como licencia del modelo base, lo que conviene verificar antes de cualquier uso comercial.

Su relevancia practica es limitada pero especifica: es un ejemplo de cuantizacion heterogenea por capas con `compressed-tensors` y `llmcompressor`, y requiere un fork concreto de vLLM (1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`) con kernels de atencion SM70 y D=512. No esta probado en vLLM estandar. El idioma declarado es unicamente ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Mixture-of-Experts (Gemma 4), multimodal image-text-to-text |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (el nombre indica A4B, es decir, ~4B activos, dato no confirmado en la informacion) |
| Longitud de contexto | no disponible (el ejemplo de uso configura `max_model_len=8192`) |
| Tipos de cuantizacion | W4A16 (int4) en atencion q/k/v/o con grupo 128; NVFP4 (float4) en MLP y expertos MoE con grupo 16; BF16 en embeddings, norms y router |
| Idiomas soportados | en |
| Licencia | Apache 2.0 en la model card; metadatos de HF indican `gemma` |
| Formato de pesos | safetensors con `quant_method: compressed-tensors` (dos `config_groups`) |

## Arquitectura y entrenamiento

La ficha disponible no describe el entrenamiento del modelo base mas alla de identificarlo como un finetune "uncensored-heretic" de una base Gemma 4 MoE. No se especifican numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO. El pipeline declarado es `image-text-to-text`, de modo que la arquitectura incorpora un codificador visual ademas del decoder MoE, aunque no se detallan sus dimensiones ni el esquema de fusion multimodal.

La innovacion tecnica documentada esta en la cuantizacion. Se aplico `llmcompressor` en modo `oneshot` con despacho por capas mediante `config_groups`: atencion en int4 con grupo de 128, MLP y expertos en NVFP4 con grupo de 16, y capas sensibles (embeddings, normalizaciones, router del MoE) preservadas en BF16. El checkpoint resultante usa el formato `compressed-tensors` con dos grupos de configuracion y esta pensado para ejecutarse en el fork 1Cat-vLLM con la rama `feat/gemma4-sm70-native-v3`, que aporta el port del modelo Gemma 4 y kernels de atencion nativos para SM70 con D=512.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del finetune instruct del modelo base.
- Procesamiento de entrada imagen-texto (`image-text-to-text`), con capacidad multimodal de entrada.
- Razonamiento y generacion de codigo: no disponible de forma explicita en la informacion; el pipeline no lo confirma.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modo "uncensored/heretic": el finetune base relaja los filtros de rechazo del modelo original, segun el nombre del checkpoint.
- Inferencia con tensor parallelism (el ejemplo usa `tensor_parallel_size=2`).

## Casos de uso

- Evaluacion de tecnicas de cuantizacion mixta: sirve como referencia practica para medir el impacto de combinar W4A16 en atencion con NVFP4 en expertos MoE sobre un modelo de 26B, comparando perplejidad y calidad frente al checkpoint BF16 original.
- Despliegue en hardware con soporte FP4: en GPUs con unidades de coma flotante de 4 bits, el formato NVFP4 de los expertos reduce el coste de memoria y ancho de banda del MoE, lo que permite servir el modelo con menos VRAM que la version sin cuantizar.
- Investigacion sobre alineacion y filtros de seguridad: al ser un finetune "uncensored", es util para estudiar el comportamiento de modelos sin rechazo y para construir clasificadores o capas de moderacion externas.
- Prototipado de asistentes multimodales en ingles: el pipeline image-text-to-text permite experimentar con consultas sobre imagenes en entornos de investigacion donde la licencia y el uso interno esten claros.
- Pruebas de integracion con vLLM no estandar: valida el funcionamiento de `compressed-tensors` con dos grupos de configuracion y kernels especificos, util para equipos que mantengan forks de inferencia.
- Generacion de texto conversacional de dominio abierto en ingles: con `max_model_len=8192` configurado, encaja en tareas de chat y resumen de documentos de longitud media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 17,9 GB, por lo que en BF16 parcial (embeddings, norms, router) y pesos cuantizados el modelo necesita al menos esos 17,9 GB mas overhead de KV cache y activaciones. No se dispone de una cifra oficial de VRAM pico.
- GPU recomendadas: no disponible de forma explicita. Los kernels SM70 y el uso de NVFP4 apuntan a GPUs con soporte de FP4; el ejemplo de la model card usa `tensor_parallel_size=2`, lo que sugiere repartir el modelo entre dos GPUs.
- Cabe en consumer GPU: no confirmado. Por tamano de repo, no cabe en GPUs de 8-12 GB; en GPUs de 24 GB requeriria cuantizacion adicional o offloading no documentado.
- Opciones de despliegue: exclusivamente 1Cat-vLLM con la rama `feat/gemma4-sm70-native-v3`. No esta probado en vLLM estandar, y no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-it-uncensored-heretic-NVFP4-W4ATTN-AWQ | 26,5B | no disponible | W4A16 + NVFP4 mixta | Apache 2.0 / gemma | HF, requiere fork de vLLM |
| llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic | 26,5B (estimado por ser el base) | no disponible | BF16 sin cuantizar | no disponible | HF |
| Gemma 4 base (familia) | no disponible | no disponible | varias | gemma | HF |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card declara Apache 2.0, pero los metadatos de Hugging Face indican licencia `gemma`: existe una discrepancia que debe resolverse antes de cualquier uso comercial.
- El modelo base es un finetune "uncensored/heretic", por lo que cabe esperar respuestas sin los filtros de rechazo habituales; requiere moderacion externa en produccion.
- Solo soporta ingles segun el campo `language`; no hay evidencia de capacidades multilingues.
- Riesgo de alucinacion no cuantificado: no hay benchmarks ni evaluaciones publicadas.
- Dependencia dura de un fork no estandar de vLLM (1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`); no funciona en vLLM estandar segun el autor.
- La cuantizacion mixta puede degradar la calidad frente al checkpoint BF16 original; no se aportan metricas de degradacion.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria del checkpoint.
- No se documentan la longitud de contexto real, el numero de parametros activos ni los datos de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheUnderscore/G4-MeroMero-26B-A4B-it-uncensored-heretic-NVFP4-W4ATTN-AWQ
- Modelo base: https://huggingface.co/llmfan46/G4-MeroMero-26B-A4B-it-uncensored-heretic
- Fork de vLLM requerido: https://github.com/1CatAI/1Cat-vLLM
- Rama del fork: https://github.com/Th-Underscore/1Cat-vLLM/tree/feat/gemma4-sm70-native-v3
