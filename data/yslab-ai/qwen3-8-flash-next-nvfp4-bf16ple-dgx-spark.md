# YSLAB-ai/Qwen3.8-Flash-Next-NVFP4-BF16PLE-DGX-Spark

## Resumen

Qwen3.8-Flash-Next es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen de Alibaba, lanzado el 26 de agosto de 2026. Cuenta con 125 mil millones de parámetros totales, de los cuales solo 6 mil millones se activan por token, lo que lo hace computacionalmente eficiente para su tamaño. Incorpora una tabla n-gram de 51 mil millones de entradas para búsquedas locales rápidas, junto con los mecanismos GDN (Gated Dense Network) y QSA (Query-Selective Attention). Su contexto nativo es de 262 144 tokens.

La ficha que nos ocupa, `YSLAB-ai/Qwen3.8-Flash-Next-NVFP4-BF16PLE-DGX-Spark`, no es el modelo en sí, sino una receta de despliegue desarrollada por YSLAB-ai para ejecutar el checkpoint NVFP4 de Qwen3.8-Flash-Next en un único NVIDIA DGX Spark (GB10). La receta utiliza la técnica Parameter Lookup Embedding (PLE) en precisión BF16, mapeando la tabla completa desde NVMe en lugar de cargarla en la memoria unificada del dispositivo. Esto permite ejecutar el modelo completo en un solo DGX Spark, manteniendo la fidelidad de la tabla PLE sin agotar la memoria unificada. La receta está validada únicamente con el checkpoint de Orcarouter y requiere vLLM como motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con GDN, QSA y tabla n-gram |
| Parametros totales | 125 B (segun fuentes externas) |
| Parametros activos | 6 B (segun fuentes externas) |
| Longitud de contexto | 262 144 tokens (nativo, segun la receta) |
| Tipos de cuantizacion | NVFP4 (modelo), BF16 (tabla PLE) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (para la receta; la licencia del modelo original no se especifica) |
| Formato de pesos | no disponible (la receta usa vLLM, que normalmente emplea safetensors) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next es un modelo MoE multimodal con 125 B de parametros totales y 6 B activos por token. La arquitectura combina una tabla n-gram de 51 B entradas para acelerar la busqueda local de tokens, junto con los mecanismos GDN (Gated Dense Network) y QSA (Query-Selective Attention), que optimizan el reparto de recursos entre los expertos y la atencion sobre consultas relevantes. No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la documentacion consultada.

La receta de YSLAB-ai introduce una innovacion de despliegue: en lugar de cargar la tabla PLE completa en la memoria unificada del DGX Spark, la deja en el checkpoint en NVMe y la mapea en memoria, recopilando solo las filas necesarias para cada peticion. El runtime utiliza captura de grafos CUDA por tramos (PIECEWISE) y una cache KV en BF16. Esta aproximacion reduce la presion sobre la memoria unificada y permite ejecutar el modelo completo en un solo GB10, aunque con la limitacion de que el modo MTP (Multi-Token Prediction) debe estar desactivado porque el checkpoint no contiene los tensores MTP correspondientes.

## Capacidades

- Generacion de texto y razonamiento multimodal (texto e imagen, segun la naturaleza del modelo Qwen3.8-Flash-Next).
- Soporte de contexto largo de hasta 262 144 tokens, util para documentos extensos o conversaciones multi-turno.
- Capacidades de tool calling y function calling, habituales en la familia Qwen (no confirmado explicitamente en la documentacion de la receta).
- Capacidades de agente y razonamiento multi-paso, asumibles por la arquitectura MoE de alto rendimiento.
- Multilingue, aunque los idiomas exactos no estan documentados en la informacion disponible.
- La receta no soporta MTP (Multi-Token Prediction) debido a la ausencia de tensores MTP en el checkpoint.

## Casos de uso

- Inferencia de contexto largo en produccion: con 262 144 tokens de ventana, el modelo puede procesar libros completos, expedientes legales o historiales de conversacion extensos en un solo paso. La receta permite ejecutarlo en un DGX Spark sin necesidad de un cluster multi-GPU.
- Despliegue en entornos con memoria unificada limitada: al mapear la tabla PLE desde NVMe, se libera memoria unificada para la cache KV, lo que permite atender peticiones con ventanas de contexto muy grandes en un solo dispositivo.
- Servicio de chat multimodal: el modelo puede combinar entradas de texto e imagen, por lo que es adecuado para asistentes que necesitan comprender capturas de pantalla, diagramas o fotografias junto con texto.
- Razonamiento y analisis de documentos tecnicos: su capacidad de razonamiento y su gran contexto lo hacen util para resumir, extraer informacion o responder preguntas sobre documentacion tecnica extensa.
- Agentes autonomos con tool calling: aunque no esta confirmado en la receta, la familia Qwen soporta function calling, lo que permitiria integrar el modelo en pipelines de automatizacion que interactuen con APIs o bases de datos.
- Investigacion y experimentacion con MoE de gran tamano: la receta ofrece una via para probar un modelo de 125 B en hardware de un solo nodo, lo que facilita la evaluacion de sus capacidades sin necesidad de infraestructura masiva.

## Benchmarks y rendimiento

La receta publica mediciones puntuales para el checkpoint de Orcarouter en un DGX Spark. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Prompt tokens procesados | 240 079 |
| Throughput de prompt | 2 107,06 tok/s |
| Throughput de decode | 27,39 tok/s |
| Mediana de decode (MTP=0, peticiones cortas) | 28,57 tok/s |
| Tiempo de cold readiness | 10 min 35 s |
| Memoria del modelo | 71,13 GiB |
| Tabla PLE (BF16, mapeada desde NVMe) | 95,37 GiB |
| Memoria disponible para cache KV (BF16) | 20-21 GiB |

Estas cifras son evidencia de calificacion puntual, no garantias de capacidad. El archivo de estabilidad registra 904 segundos de ejecucion, no una prueba completa de dos horas.

## Requisitos de hardware

- Un NVIDIA DGX Spark (GB10) con almacenamiento NVMe disponible para la receta.
- Al menos 100 GiB de espacio libre en disco antes de la descarga (la receta comprueba este requisito).
- Docker con soporte de runtime NVIDIA.
- Cuenta de Hugging Face con acceso aceptado al checkpoint de Orcarouter (acceso restringido).
- La memoria total necesaria es de aproximadamente 71 GiB para el modelo NVFP4, 95 GiB para la tabla PLE mapeada desde NVMe y 20-21 GiB para la cache KV BF16. El DGX Spark dispone de 128 GB de memoria unificada, por lo que el modelo cabe sin necesidad de GPUs adicionales.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) debido al tamaño del modelo y la tabla PLE.
- Opciones de despliegue: vLLM (motor principal de la receta), con soporte para captura de grafos CUDA por tramos y cache KV BF16. No se mencionan alternativas como llama.cpp u Ollama en la documentacion.

## Comparativa con modelos similares

No se dispone de una comparativa publicada con otros modelos en la informacion proporcionada. Qwen3.8-Flash-Next se posiciona como un MoE de 125 B/6 B activos, similar en concepto a otros MoE de gran tamano como DeepSeek-V3 (671 B/37 B) o Qwen3-235B-A22B, pero no hay datos comparativos de rendimiento o licencia en las fuentes consultadas. La receta de YSLAB-ai es especifica para DGX Spark y no tiene equivalente directo en otras plataformas.

## Limitaciones y advertencias

- La receta solo esta validada con el checkpoint de Orcarouter (`orcarouter/Qwen3.8-Flash-Next-Uncensored-NVFP4`). Los checkpoints de Inferact y RadixArk no estan validados en runtime.
- El modo MTP (Multi-Token Prediction) esta deshabilitado obligatoriamente porque el checkpoint no contiene los tensores MTP necesarios. Cualquier intento de usar MTP con este checkpoint no esta soportado.
- La tabla PLE se mapea desde NVMe, lo que puede introducir latencia adicional en accesos aleatorios a la tabla, aunque las mediciones muestran un rendimiento aceptable.
- El acceso al checkpoint de Orcarouter requiere aceptar condiciones de acceso en Hugging Face (compartir informacion de contacto). El inicio de sesion por CLI no es suficiente.
- La receta no distribuye los pesos del modelo; es solo un conjunto de scripts y configuraciones.
- Las mediciones de rendimiento son puntuales y no constituyen una garantia de capacidad sostenida. El archivo de estabilidad no cubre una ejecucion completa de dos horas.
- No se han documentado sesgos, riesgos de alucinacion o limitaciones de idioma especificos para este modelo en la informacion disponible.

## Enlaces

- Repositorio de Hugging Face de la receta: https://huggingface.co/YSLAB-ai/Qwen3.8-Flash-Next-NVFP4-BF16PLE-DGX-Spark
- Repositorio de GitHub de la receta: https://github.com/YSLAB-ai/Qwen3.8-Flash-Next-NVFP4-BF16PLE-DGX-Spark
- Pagina del modelo Qwen3.8-Flash-Next en Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Guia de ejecucion local (GGUF, hardware y benchmarks): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Discusion en foros de NVIDIA sobre DGX Spark: https://forums.developer.nvidia.com/t/qwen3-8-flash-next/381228
- Entrada en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
