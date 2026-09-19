# TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ

## Resumen

Swift-Qwen3.8-27b-W4A16-AWQ es una cuantizacion de 4 bits (W4A16) del modelo ukisai/Swift-Qwen3.8-27b, publicada por el usuario TheUnderscore. No se trata de un modelo entrenado desde cero, sino de una compresion post-entrenamiento en formato compressed-tensors (pack-quantized) que reduce los pesos de todas las capas `Linear` a int4 asimetrico por grupos de 128 elementos, manteniendo las activaciones en 16 bits. El repositorio ocupa 19,6 GB y declara 27.781.427.952 parametros, lo que lo situa en la gama de 27B.

El modelo hereda la arquitectura de la familia Qwen3.5, con atencion hibrida: combina capas de atencion completa con capas de atencion lineal (los tensores `linear_attn.in_proj_a/b` se mantienen en BF16 tras la cuantizacion). Ademas, el pipeline declarado es `image-text-to-text`, lo que confirma que conserva la torre de vision (`model.visual.*`) y una cabeza MTP (multi-token prediction), ambas preservadas en BF16 para que la arquitectura completa siga siendo cargable.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo multimodal de ~27,8B parametros en hardware de gama alta de consumo o en configuraciones multiusuario modestas; por otro, es una de las pocas cuantizaciones documentadas que aborda de forma explicita el recetario de suavizado AWQ especifico para arquitecturas de atencion hibrida, un punto donde los mapeos de regex agrupados convencionales corrompen la decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion hibrida (atencion completa + atencion lineal), familia Qwen3.5, con torre de vision y cabeza MTP |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16_ASYM: pesos int4 asimetricos por grupo (group size 128), activaciones de 16 bits; formato compressed-tensors pack-quantized (`weight_packed`, `weight_scale`, `weight_zero_point`, `weight_shape`) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (identificador `other` en HuggingFace) |
| Formato de pesos | safetensors (compressed-tensors); incluye `model-nonquant.safetensors` con los tensores `mtp.*` y `model.visual.*` en BF16 |

## Arquitectura y entrenamiento

El modelo base ukisai/Swift-Qwen3.8-27b pertenece a la familia Qwen3.5 y emplea un esquema de atencion hibrida, en el que conviven bloques de atencion completa con bloques de atencion lineal. Esta particularidad condiciona todo el proceso de cuantizacion: los mapeos de suavizado de activaciones deben aplicarse capa por capa (`input_layernorm` → `self_attn.q/k/v`, `post_attention_layernorm` → `mlp.gate/up` y `mlp.up_proj` → `mlp.down_proj`), generados mediante `build_hybrid_attention_mappings`. El autor advierte explicitamente que un suavizado basado en regex agrupados o con mapeos desalineados corrompe la decodificacion en esta familia de arquitecturas.

La cuantizacion se realizo con llmcompressor en modo one-shot offline, empleando `AWQModifier` con `duo_scaling="both"` y descarga a CPU (`compressed_tensors.offload.load_offloaded_model`), de modo que el modelo en precision completa cupiera en una configuracion de 2×16 GB de VRAM. El conjunto de calibracion por defecto fue UltraChat 200k, split `train_sft`. Los unicos componentes que permanecen en BF16 son los embeddings, `lm_head`, las normalizaciones, `linear_attn.in_proj_a/b`, la torre de vision y la cabeza MTP. No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en formato chat, con los parametros de muestreo recomendados por el autor del modelo base (temperature 1.0, top_p 0.95, top_k 20, min_p 0, presence_penalty 0, repetition_penalty 1.0).
- Procesamiento de entradas imagen-texto: el pipeline declarado es `image-text-to-text` y la torre de vision se conserva en BF16.
- Prediccion multi-token mediante la cabeza MTP, preservada sin cuantizar.
- Atencion lineal en parte de las capas, lo que reduce el coste de computo y memoria en secuencias largas respecto a un transformer de atencion completa pura.
- Soporte de tool calling y function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta en la informacion proporcionada).
- Modo thinking explicito: no disponible (no se documenta en la informacion proporcionada).
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).

## Casos de uso

- Despliegue multimodal en produccion con LMDeploy: el formato compressed-tensors es detectado y cargado de forma nativa por `turbomind`, por lo que el modelo puede servirse con `TurbomindEngineConfig(tp=2, model_format="compressed-tensors")` sin pasos de conversion adicionales.
- Asistente de analisis de documentos con imagenes: al conservar la torre de vision, permite describir, resumir o extraer informacion de capturas, diagramas o formularios combinados con instrucciones textuales.
- Atencion al cliente automatizada: un modelo de 27,8B cuantizado a int4 ocupa unos 19,6 GB de pesos, lo que hace viable mantener conversaciones multi-turno en una unica GPU de 24 GB o repartido en dos GPU de 16 GB.
- Generacion de codigo en pipelines internos: el ahorro de memoria de la cuantizacion W4A16 permite dedicar la GPU a tareas de generacion y revision de codigo sin renunciar a un modelo de gama 27B.
- Investigacion academica y evaluacion comparativa: la existencia de una version BF16 (el modelo base) y esta variante int4 permite medir directamente la degradacion introducida por la cuantizacion en tareas concretas.
- Prototipado con presupuesto limitado: la licencia permite uso gratuito, incluido el comercial, a individuos y organizaciones con ingresos recurrentes anuales de hasta 1.000.000 USD, lo que cubre a equipos pequenos y proyectos en fase temprana.
- Fine-tuning ligero sobre cuantizacion: el script `quantize-awq-hybrid.py` incluido en el repositorio sirve como referencia reproducible para aplicar el mismo recetario a otros modelos de la familia Qwen3.5.
- Servicio interno de bajo coste por token: al reducir el peso de los pesos en un factor de aproximadamente cuatro frente a BF16, disminuye la huella de memoria y mejora el throughput por GPU en comparacion con el modelo base sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparativas de degradacion respecto al modelo base en BF16. El autor tampoco documenta metricas de perplexity o de similitud de salidas tras la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 19,6 GB y declara 27.781.427.952 parametros; con pesos int4, el grueso corresponde a unos 14 GB de pesos cuantizados mas los tensores en BF16 (embeddings, `lm_head`, normalizaciones, atencion lineal, torre de vision y cabeza MTP). En la practica se necesitan al menos 20-22 GB solo para los pesos, mas espacio para cache KV y activaciones.
- GPU de gama profesional: A100 40/80 GB, H100 80 GB y L40S 48 GB pueden alojar el modelo en una sola unidad.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB queda al limite; es probable que requiera reducir la longitud de contexto o usar `language_model_only=True` para descartar la torre de vision, tal como se hace en el ejemplo de uso.
- Configuracion probada por el autor: 2 GPU con 16 GB de VRAM cada una (`tp=2`), suficiente para cargar el modelo cuantizado con tensor parallelism. La cuantizacion en si requirio 2×16 GB con descarga a CPU del modelo en precision completa.
- Opciones de despliegue: LMDeploy con backend `turbomind` es el unico backend verificado por el autor. El formato compressed-tensors pack-quantized tambien es compatible con vLLM (el flujo de llmcompressor esta orientado a vLLM). Ollama y llama.cpp no estan confirmados: el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ | 27,78B | no disponible | W4A16 int4, group size 128, compressed-tensors | Swift Open License v1.0 | HuggingFace, 1.068 descargas, 11 likes |
| ukisai/Swift-Qwen3.8-27b (modelo base) | 27,78B | no disponible | BF16 sin cuantizar | Swift Open License v1.0 (acceso restringido) | HuggingFace, acceso gated |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion en la busqueda proporcionada sobre cuantizaciones alternativas (GPTQ, GGUF, EXL2) del mismo modelo base ni sobre modelos de tamano comparable que sirvan de referencia directa.

## Limitaciones y advertencias

- Licencia no abierta: la Swift Open License v1.0 permite uso personal, de investigacion, educativo, de evaluacion y comercial sin coste solo a individuos y organizaciones con ingresos recurrentes anuales (incluidas filiales) de hasta 1.000.000 USD. Por encima de ese umbral se requiere una Swift Enterprise License de pago. Es imprescindible revisar los terminos antes de integrarlo en un producto comercial.
- Acceso restringido en origen: los pesos Swift se distribuyen mediante acceso gated, y esta cuantizacion hereda esa licencia. El modelo base esta sujeto a las condiciones de UkisAI.
- Degradacion por cuantizacion: no se han publicado mediciones de la perdida de calidad respecto al modelo base en BF16. El autor advierte que un suavizado AWQ mal aplicado en arquitecturas de atencion hibrida corrompe la decodificacion, lo que subraya la sensibilidad de esta familia a la receta de cuantizacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un riesgo inherente a los modelos generativos de este tamano.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento del modelo base ni se incluye ninguna evaluacion de sesgo.
- Limitaciones de idioma: no disponible. El campo de idiomas soportados no esta cumplimentado, por lo que no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas distintos del ingles.
- Limitaciones de contexto: no disponible. El autor no documenta la ventana de contexto soportada, un dato critico para planificar cargas de trabajo con documentos largos.
- Compatibilidad limitada de tooling: aunque el formato es compatible con vLLM y LMDeploy, no se publican pesos GGUF ni cuantizaciones pensadas para llama.cpp u Ollama, lo que restringe las opciones de despliegue en entornos sin GPU.
- Descarga a CPU durante la cuantizacion: el script incluido necesita gestionar directorios temporales de offload por rango (`--offload_dir`), lo que anade complejidad si se quiere reproducir el proceso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheUnderscore/Swift-Qwen3.8-27b-W4A16-AWQ
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- llmcompressor (herramienta de cuantizacion): https://github.com/vllm-project/llmcompressor
- Contacto de licencia de UkisAI: https://ukisai.com/contact
