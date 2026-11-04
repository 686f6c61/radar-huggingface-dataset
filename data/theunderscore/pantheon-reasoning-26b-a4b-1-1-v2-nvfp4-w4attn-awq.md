# TheUnderscore/Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-W4ATTN-AWQ

## Resumen

Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-W4ATTN-AWQ es una cuantización de precisión mixta del modelo Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2, un finetune de razonamiento sobre arquitectura Gemma 4 con mezcla de expertos (MoE). El autor de la cuantización es TheUnderscore, que aplica una combinación de W4A16 (int4) en las proyecciones de atención y NVFP4 (float4) en las capas MLP y los expertos MoE, manteniendo embeddings, normalizaciones y router en BF16. El objetivo es reducir el peso del modelo base (17 GB) para su despliegue en GPUs con soporte de FP4 nativo, típicamente hardware Blackwell o adaptaciones específicas.

El modelo conserva la pipeline image-text-to-text del original, lo que indica capacidades multimodales heredadas de la familia Gemma 4, aunque la model card no detalla el comportamiento multimodal tras la cuantización. El repositorio tiene 26.544.133.710 parámetros totales según los safetensors, lo que confirma la naturaleza MoE con un subconjunto activo por token (la nomenclatura A4B sugiere aproximadamente 4.000 millones de parámetros activos).

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización por capas con `compressed-tensors` y `llmcompressor`; por otro, advierte de que el modelo requiere un fork específico de vLLM (1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`) y no ha sido probado en vLLM estándar, lo que limita seriamente su portabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4), cuantizacion mixta por capas |
| Parametros totales | 26.544.133.710 |
| Parametros activos | No disponible (la nomenclatura A4B sugiere ~4B, sin confirmacion oficial) |
| Longitud de contexto | No disponible en la model card (el ejemplo usa `max_model_len=8192`) |
| Tipos de cuantizacion | W4A16 int4 grupo 128 (atencion), NVFP4 float4 grupo 16 (MLP/MoE), BF16 (embeddings, norms, router) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 declarada en YAML, `license_name: gemma` y tag `license:gemma` (contradiccion a resolver antes de uso comercial) |
| Formato de pesos | safetensors con `quant_method: compressed-tensors` |

## Arquitectura y entrenamiento

El modelo base es un finetune de razonamiento de Gemma 4 con arquitectura MoE, orientado a conversacion y razonamiento multi-paso. La cuantizacion se realizo con `llmcompressor` en modo `oneshot`, usando `config_groups` para despachar formatos distintos por capa: las proyecciones q/k/v/o de atencion se cuantizan a W4A16 int4 con grupo de 128, mientras que las capas MLP y los expertos MoE usan NVFP4 float4 con grupo de 16. Embeddings, normalizaciones y router se mantienen en BF16 para preservar la estabilidad del enrutamiento de expertos, un detalle critico en modelos MoE.

El resultado se empaqueta con `quant_method: "compressed-tensors"` y dos `config_groups`, lo que permite a motores compatibles interpretar la precision mixta. No se especifican en la informacion disponible los datos de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) ni detalles sobre la innovacion de razonamiento del finetune original de Gryphe. Tampoco se documenta si la cuantizacion se valido con metricas de perplexidad o benchmarks.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del finetune de razonamiento del modelo base.
- Razonamiento multi-paso (la nomenclatura "Reasoning" del modelo base lo sugiere, sin detalles en la model card).
- Procesamiento image-text-to-text segun la pipeline declarada, con soporte multimodal heredado de Gemma 4.
- Arquitectura MoE con enrutamiento por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.
- No se documenta soporte explicito de tool calling, function calling ni modo thinking en la informacion disponible.
- Capacidades multilingues limitadas al ingles segun el campo `language`.

## Casos de uso

- Despliegue en hardware con soporte FP4 nativo: el formato NVFP4 en MLP y expertos esta pensado para GPUs Blackwell o plataformas con kernels FP4, donde se obtiene el maximo ahorro de memoria y ancho de banda.
- Investigacion en cuantizacion de modelos MoE: el repo incluye `quantize-nvfp4-gemma4.py` y una configuracion por capas que sirve como referencia reproducible para cuantizar otros MoE con `llmcompressor`.
- Razonamiento conversacional en ingles con presupuesto de VRAM ajustado: al reducir el peso frente al BF16 original, permite servir el modelo en configuraciones multi-GPU mas modestas, siempre con el fork de vLLM requerido.
- Experimentacion multimodal image-text-to-text: la pipeline declarada permite probar tareas de descripcion de imagenes o VQA, aunque sin garantias de calidad tras la cuantizacion.
- Benchmarking de precision mixta: util para comparar la degradacion de un MoE de 26B al pasar atencion a int4 y expertos a FP4 frente al modelo base en BF16.
- Prototipado interno con `tensor_parallel_size=2`: el ejemplo de la model card muestra un despliegue en dos GPUs con `max_model_len=8192`, adecuado para entornos de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 17,9 GB, por lo que la inferencia requiere al menos ~18 GB solo para pesos, mas KV cache y overhead del runtime; con `max_model_len=8192` y batches moderados, es razonable planificar 24-32 GB por instancia.
- El ejemplo oficial usa `tensor_parallel_size=2`, lo que sugiere un despliegue en dos GPUs.
- GPUs recomendadas: hardware con soporte FP4 nativo (familia Blackwell) para aprovechar NVFP4; en GPUs sin FP4 los kernels pueden degradar a emulacion o no estar disponibles.
- No se confirma que quepa en GPUs consumer; el requisito de kernels SM70 D=512 y el fork de vLLM apuntan a un soporte muy especifico.
- Motor de despliegue: exclusivamente 1Cat-vLLM con la rama `feat/gemma4-sm70-native-v3`; no probado en vLLM estandar, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-W4ATTN-AWQ | 26,5B (MoE) | No disponible | NVFP4 + W4A16 mixta | Apache-2.0 / gemma (contradictoria) | Requiere fork 1Cat-vLLM |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 (base) | 26,5B (MoE) | No disponible | BF16 | Segun modelo base | vLLM/transformers estandar |
| Alternativas MoE de ~26B con cuantizacion estandar | No disponible | No disponible | GPTQ/AWQ uniforme | Variable | vLLM estandar |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; el unico punto de referencia solido es el modelo base en BF16, del que esta version es una cuantizacion.

## Limitaciones y advertencias

- Contradiccion de licencia: el YAML declara `license: apache-2.0` pero tambien `license_name: gemma` y el tag `license:gemma`; hay que resolver cual aplica antes de cualquier uso comercial.
- Dependencia de un fork no oficial de vLLM (1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`), lo que rompe la portabilidad y complica el mantenimiento en produccion.
- No probado en vLLM estandar; el comportamiento en otros motores es desconocido.
- Solo soporta ingles segun el campo `language`.
- La cuantizacion mixta puede degradar el razonamiento y las capacidades multimodales; no se aportan metricas de calidad.
- Riesgo de alucinacion inherente a modelos de razonamiento finetuneados, sin evaluacion publicada.
- Sesgos del modelo base no documentados en esta ficha.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.
- El router en BF16 reduce el riesgo de colapso de expertos, pero no se documenta validacion del enrutamiento tras la cuantizacion.

## Enlaces

- HuggingFace: https://huggingface.co/TheUnderscore/Pantheon-Reasoning-26B-A4B-1.1-V2-NVFP4-W4ATTN-AWQ
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
- Fork de vLLM requerido: https://github.com/1CatAI/1Cat-vLLM
- Rama especifica: https://github.com/Th-Underscore/1Cat-vLLM/tree/feat/gemma4-sm70-native-v3
