# Xylolabs/Raon-1-nano-Uncensored-MLX-8bit

## Resumen

Raon-1-nano Uncensored MLX 8-bit es una variante del modelo KRAFTON/Raon-1-nano en la que se ha eliminado la direccion de rechazo (refusal direction) de los pesos y se ha convertido a formato MLX de 8 bits para su ejecucion en hardware Apple Silicon. Lo publica Xylolabs bajo licencia Apache 2.0 y esta pensado para ejecucion local en Mac mediante la libreria MLX y mlx-lm. El modelo conserva la arquitectura, el tokenizador y la cabeza de salida del original; la intervencion es un abliteration quirurgico sobre un subconjunto de proyecciones.

El modelo base es un transformer de 3.130.797.136 parametros (aproximadamente 3,1 mil millones) con contexto de hasta 256K tokens segun la tabla de hardware de la model card, y soporta coreano e ingles. La variante uncensored reduce la tasa de rechazo en HarmBench del 98,5 % del original al 1,0 % con el modo thinking desactivado, manteniendo una fidelidad alta respecto a los pesos BF16 originales (KL de 0,006216 en WikiText-2 y top-1 del 94,83 %).

Su relevancia es doble: por un lado, demuestra una tecnica de abliteration muy localizada (51 tensores en las capas 6 a 22) que preserva casi intacta la distribucion del modelo; por otro, ofrece una version cuantizada a 8 bits en MLX que ocupa 3,36 GB, lo que la hace desplegable en equipos Apple con memoria unificada moderada. No es un modelo de proposito general de gran escala, sino una pieza para entornos locales donde se necesita baja tasa de rechazo y control total sobre el comportamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Raon-1-nano de KRAFTON, con atencion MLA; bloque MTP eliminado en esta conversion) |
| Parametros totales | 3.130.797.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens segun la tabla de hardware de la model card |
| Tipos de cuantizacion | 8-bit afina (affine), group size 64, en todas las capas lineales y ambas tablas de embedding; las proyecciones up de clave y valor de MLA permanecen en BF16 |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de KRAFTON/Raon-1-nano, con atencion de tipo MLA (multi-head latent attention) segun la descripcion de las proyecciones up de clave y valor que se mantienen en BF16. La intervencion de Xylolabs consiste en eliminar una unica direccion de rechazo calculada en la capa 16 con el canal 746 puesto a cero, proyectandola fuera de las proyecciones de salida de atencion, las proyecciones down del MLP y las proyecciones de entrada por capa de las capas 6 a 22, en total 51 tensores. El embedding, la cabeza de salida y el bloque MTP no se modifican. El codigo del modelo es `raon_mlx_model.py` de KRAFTON/Raon-1-nano-mlx, incluido sin cambios.

La cuantizacion es afina de 8 bits con group size 64 para todas las capas lineales y ambas tablas de embedding (la tabla de tokens es tambien la LM head), mientras que las proyecciones up de clave y valor de MLA se dejan en BF16. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base; esos datos no aparecen en la informacion proporcionada. La model card no documenta innovaciones de decodificacion especulativa ni de atencion lineal mas alla de lo heredado del modelo base.

## Capacidades

- Generacion de texto conversacional en coreano e ingles.
- Razonamiento con modo thinking activado por defecto; puede desactivarse con `--chat-template-config '{"enable_thinking": false}'` para respuestas directas.
- Baja tasa de rechazo: 1,0 % en HarmBench (200 prompts, thinking off) frente al 98,5 % del original, y 0,0 % de rechazo en Alpaca (100 prompts).
- Fidelidad alta respecto a los pesos BF16: KL de 0,006216 y top-1 del 94,83 % en WikiText-2; KL de 0,016426 y top-1 del 93,84 % en el conjunto de chat.
- Capacidad de ejecucion local en Apple Silicon mediante MLX y mlx-lm.
- Soporte de contexto largo (hasta 256K tokens) en las configuraciones de hardware listadas por el autor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo se ejecuta con `mlx_lm.chat` y permite conversaciones multi-turno en coreano e ingles sin salir del equipo, con un consumo de 3,36 GB de pesos y contexto de hasta 256K tokens en configuraciones con memoria unificada suficiente.
- Procesamiento de documentos largos: gracias a la ventana de contexto extendida, puede resumir o extraer informacion de contratos, articulos o transcripciones extensas en una sola pasada en equipos Apple Studio con memoria unificada amplia.
- Generacion de contenido creativo sin filtros de rechazo: util para escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo original rechazaria un porcentaje alto de peticiones (98,5 % en HarmBench).
- Investigacion sobre alineacion y seguridad: sirve como referencia controlada para estudiar el efecto de eliminar una direccion de rechazo, comparando su comportamiento con el modelo original MLX 8-bit en el mismo hardware.
- Prototipado rapido de asistentes en coreano: al soportar ko de forma nativa, es adecuado para demos y pruebas de concepto de chatbots orientados al mercado coreano en entornos de desarrollo con Mac.
- Evaluacion de tecnicas de cuantizacion: la model card publica metricas KL y top-1 frente a BF16, lo que permite usar este modelo como caso de estudio de cuantizacion afina de 8 bits en MLX y comparar con otras variantes.
- Despliegue en estaciones de trabajo Apple para tareas de generacion de texto por lotes: con 3,36 GB de pesos y contexto largo, puede procesar lotes de prompts en local sin depender de servicios en la nube.

## Benchmarks y rendimiento

La model card publica metricas de fidelidad respecto a los pesos BF16 originales y tasas de rechazo, no benchmarks estandar de razonamiento o codigo.

| Modelo | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Chequeo de 7 preguntas | HarmBench rechazados | Alpaca rechazados |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Uncensored MLX 8-bit | 3,36 GB | 0,006216 | 94,83 % | 0,016426 | 93,84 % | 0,007997 | 95,27 % | 6/7 (BF16: 6/7) | 1,0 % | 0,0 % |
| Original MLX 8-bit | 3,36 GB | 0,001343 | 97,14 % | 0,001630 | 97,75 % | 0,001125 | 97,43 % | 6/7 (BF16: 6/7) | 98,5 % | 0,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 3,36 GB de pesos en 8 bits MLX; el consumo total depende del contexto y de la cache KV, que puede crecer de forma significativa con ventanas de 256K tokens.
- Hardware objetivo: exclusivamente Apple Silicon con memoria unificada (la model card lista Mac Studio M5 Max y M5 Ultra con entre 36 GB y 512 GB de memoria unificada).
- Cabe en consumer GPU: no aplica en el sentido habitual; MLX esta disenado para Apple Silicon, no para GPUs NVIDIA o AMD. En Mac con memoria unificada de 36 GB o superior se puede ejecutar con contexto de 256K segun el autor.
- Opciones de despliegue: MLX y mlx-lm (comandos `mlx_lm.generate` y `mlx_lm.chat`), con `--trust-remote-code`. Requiere `mlx==0.32.4`, `mlx-lm==0.32.2` y `transformers==5.20.2` segun la model card. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Tasa de rechazo HarmBench | Disponibilidad |
|---|---|---:|---|---|---:|---|
| Raon-1-nano Uncensored MLX 8-bit (este) | 3,13B | hasta 256K | MLX safetensors 8-bit | Apache 2.0 | 1,0 % | Hugging Face |
| Xylolabs/Raon-1-nano-MLX-8bit | 3,13B | hasta 256K | MLX safetensors 8-bit | Apache 2.0 | 98,5 % | Hugging Face |
| KRAFTON/Raon-1-nano (base) | 3,13B | no disponible | safetensors BF16 | Apache 2.0 (segun modelo base) | no disponible | Hugging Face |

La comparativa con modelos de otros fabricantes (por ejemplo, variantes de 3B en formato GGUF para llama.cpp) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo reduce la tasa de rechazo al 1,0 % en HarmBench, lo que implica que el modelo puede generar contenido danino, ilegal o sensible sin filtros; no es adecuado para despliegues publicos sin moderacion externa.
- La fidelidad respecto a BF16 es alta pero no perfecta: top-1 del 94,83 % en WikiText-2 y del 93,84 % en chat, con degradacion mayor en el conjunto conversacional (KL 0,016426 frente a 0,001630 del original).
- Solo soporta coreano e ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea limitado.
- Requiere hardware Apple Silicon y la libreria MLX; no es portable a GPUs NVIDIA, AMD ni a entornos de servidor convencionales sin reconversion.
- El uso de `--trust-remote-code` implica ejecutar codigo del repositorio, lo que anade un riesgo de seguridad en entornos no controlados.
- El contexto de 256K puede consumir memoria considerable en la cache KV; en equipos con 36 GB de memoria unificada conviene validar el comportamiento real con contextos muy largos.
- No se documentan sesgos especificos del modelo base ni del proceso de abliteration; al tratarse de una modificacion de pesos, los sesgos del modelo original probablemente persisten.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado recae en el desplegador; conviene revisar el archivo NOTICE y las licencias incluidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Raon-1-nano-Uncensored-MLX-8bit
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Version MLX del modelo base: https://huggingface.co/KRAFTON/Raon-1-nano-mlx
- Version MLX 8-bit original (con rechazo): https://huggingface.co/Xylolabs/Raon-1-nano-MLX-8bit
- Repositorio de Xylolabs con assets: https://github.com/XylolabsInc/tensix-bfp-gptq
- Libreria MLX: https://github.com/ml-explore/mlx
