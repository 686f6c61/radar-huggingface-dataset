# Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W6A8-Vision

## Resumen

Qwen3.6-35B-A3B-Hauhau-Aggressive-W6A8-Vision es un checkpoint cuantizado en formato compressed-tensors nativo, publicado por el usuario Xananthium, que parte de HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) etiquetada como qwen3_5_moe, con 35.951.822.704 parámetros totales y un tamaño de repositorio de 30,4 GB. La nomenclatura A3B del nombre apunta a un régimen de aproximadamente 3.000 millones de parámetros activos por token, aunque el dato no se declara explícitamente en la información disponible.

El objetivo del autor es doble: reducir el peso en disco y en memoria de la variante W8A8 sin renunciar a la fidelidad de instrucciones, y servir el modelo en hardware de consumo. Para ello aplica cuantización de pesos a 6 bits (grupos simétricos de 128) con activaciones dinámicas de 8 bits, manteniendo embeddings, routers, normas, componentes de visión y otros componentes sensibles en mayor precisión, con BF16 como dtype circundante. El autor reporta una reducción del 20,83% frente al checkpoint Hauhau medido y una mejora de throughput agregado del 10,19% con cuatro peticiones concurrentes respecto a la configuración W8A8 probada.

La relevancia actual del checkpoint es que demuestra que un MoE de ~36.000 millones de parámetros puede servirse con vLLM 0.31.0 en dos RTX 3090 de 24 GiB, con decodificación a 188,76 tokens/s en contexto corto, soporte de tool calling (parser qwen3_coder), parser de razonamiento qwen3 y una ventana declarada de hasta 200.000 tokens en la receta de despliegue. La licencia Apache 2.0 facilita su reutilización, aunque la procedencia del modelo base y la naturaleza no oficial de la publicación exigen verificación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), etiquetada como qwen3_5_moe |
| Parametros totales | 35.951.822.704 |
| Parametros activos | aproximadamente 3.000 millones segun la nomenclatura A3B del nombre (no confirmado en la model card) |
| Longitud de contexto | hasta 200.000 tokens en la receta vLLM proporcionada (max-model-len 200000) |
| Tipos de cuantizacion | W6A8 (pesos INT6, activaciones INT8 dinamicas), compressed-tensors, grupos simetricos de 128; embeddings, routers, normas, vision y componentes sensibles en mayor precision; BF16 como dtype circundante; KV cache opcional TurboQuant Q4 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y compressed-tensors |

## Arquitectura y entrenamiento

La arquitectura es de mezcla de expertos (MoE) sobre transformer, identificada en los metadatos como qwen3_5_moe. El checkpoint no reentrena el modelo: es una conversion cuantizada del modelo base HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive, cuyos detalles de entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO) no se recogen en la informacion disponible. El repositorio conserva la model card original en README_ORIGINAL.md y documenta la procedencia de la cuantizacion en conversion-receipt.json.

La innovacion tecnica principal es el esquema de cuantizacion bautizado como Humming. Los valores INT6 se empaquetan atravesando fronteras de palabras INT32 y se descomprimen para emplear las rutas INT8 de la GPU, de modo que no se requiere una instruccion nativa de Tensor Core a 6 bits. El coste de desempaquetado y escalado forma parte de las mediciones publicadas. Las activaciones INT8 se aplican solo a las capas lineales cuantizadas elegibles, con el fallback silencioso de activaciones desactivado. La receta de carga exige vLLM 0.31.0, backend humming para lineales y MoE, tensor-parallel-size 2 y trust-remote-code. El autor indica que los pesos MTP retenidos no implican que se haya probado decodificacion especulativa.

## Capacidades

- Generacion de texto y razonamiento con parser de razonamiento qwen3 habilitado en la receta de vLLM, lo que implica separacion entre tokens de razonamiento y respuesta visible.
- Tool calling y function calling mediante --enable-auto-tool-choice y el parser qwen3_coder, con integraciones de cliente probadas para uso de herramientas estilo Claude Code.
- Capacidades de vision, segun el sufijo Vision del nombre del checkpoint y la mencion explicita a que los componentes de vision conservan mayor precision.
- Contexto largo: la receta declara max-model-len 200000 y se realizaron pruebas de replay de contexto largo con ocho prefijos independientes.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Comportamiento orientado a dominios de seguridad, con evaluacion sobre CyberMetric-80-v1 y controles sinteticos de politica de seguridad.
- Cuantizacion con activaciones INT8 sin fallback silencioso, lo que aporta un comportamiento numerico mas predecible en produccion.
- Compatibilidad con KV cache TurboQuant Q4 como opcion independiente de la precision de pesos.

## Casos de uso

- Evaluacion de modelos en ciberseguridad: el checkpoint declara 79/80 en CyberMetric-80-v1 y permite ejecutar baterias de preguntas tecnicas de seguridad con contexto largo, usando el modo de razonamiento y reintentos con presupuesto ampliado cuando la respuesta se trunca.
- Auditoria de politicas de seguridad internas: los controles sinteticos de politica de seguridad (27/43 en primera respuesta) sirven como referencia para montar suites de evaluacion propias sobre comportamiento ante politicas corporativas, siempre que se validen con datos internos.
- Agentes con uso de herramientas en pipelines de desarrollo: gracias al parser qwen3_coder y a la opcion de auto tool choice, el modelo puede integrarse en flujos tipo agente que invocan funciones, ejecutan comandos y encadenan pasos multi-turno, como se probo en escenarios de uso de herramientas estilo Claude Code.
- Analisis de documentos y codigo de gran extension: con una ventana declarada de 200.000 tokens y KV cache TurboQuant Q4, es adecuado para resumir, indexar o responder preguntas sobre repositorios completos o expedientes largos en una sola pasada.
- Despliegue en estaciones de trabajo con dos GPU de consumo: al caber en dos RTX 3090 de 24 GiB con tensor parallel 2, permite prototipar y servir internamente sin recurrir a clústeres con A100 o H100.
- Servicio con concurrencia moderada: los 518,582 tokens/s agregados con cuatro peticiones simultaneas lo hacen apto para endpoints internos de equipos pequenos que necesiten atencion concurrente moderada.
- Tareas con entrada visual: si se confirma el soporte de vision, puede emplearse para descripcion de imagenes o extraccion de informacion en capturas y diagramas dentro de flujos de documentacion tecnica.
- Reproduccion de comparativas de cuantizacion: sirve como referencia para medir el impacto de W6A8 frente a W8A8 en precision y throughput en hardware Ampere, dado que el autor publica los informes en results/.

## Benchmarks y rendimiento

Los resultados publicados por el autor se midieron en dos RTX 3090 de 24 GiB con vLLM 0.31.0 y se refieren a este checkpoint. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

| Prueba | Resultado |
|---|---|
| CyberMetric-80-v1, presupuesto principal de 2048 tokens de salida | 79/80 |
| CyberMetric-80 con reintentos de respuesta limitada a 4096 tokens | 79/80 |
| Controles sinteticos de politica de seguridad, primera respuesta | 27/43 |
| Replay de contexto largo sintetico | 47/54 |
| Decodificacion en contexto corto | 188,7645 tokens/s |
| Decodificacion en contexto largo | 47,2815 tokens/s |
| Cuatro peticiones simultaneas, agregado | 518,582 tokens/s |

| Comparativa declarada frente a W8A8 | Variacion |
|---|---|
| Tamano del checkpoint Hauhau medido | -20,83% |
| Decodificacion en contexto corto | +5,33% |
| Decodificacion en contexto largo | +1,87% |
| Throughput agregado con cuatro peticiones | +10,19% |

El autor advierte de que las diferencias pequenas y dos lotes cronometrados no establecen un ganador universal, que el throughput incluye tokens de razonamiento y no solo respuesta visible, que la evaluacion de politica es sintetica y que CyberMetric es un cuestionario pequeno que puede solaparse con datos de entrenamiento.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 30,4 GB de repositorio, lo que exige al menos 32 GB de VRAM agregada solo para el checkpoint, antes de KV cache y activaciones.
- Configuracion validada por el autor: dos RTX 3090 de 24 GiB con --tensor-parallel-size 2, --dtype bfloat16 y vLLM 0.31.0.
- No cabe en una unica GPU de consumo de 24 GiB ni en una RTX 4090 de 24 GiB en configuracion de tensor parallel 2, dado que el checkpoint supera esa cifra por si solo.
- GPU de datacenter viables: A100 40/80 GB, H100 80 GB o L40S 48 GB en una sola tarjeta, o configuraciones multi-GPU equivalentes.
- Opciones de despliegue: vLLM 0.31.0 con soporte de cuantizacion humming y backend humming para lineales y MoE; requiere instalar el paquete runtime/humming-compile-compat del propio repositorio. No se documentan otras rutas de despliegue como llama.cpp, Ollama o TGI.
- KV cache: se puede usar --kv-cache-dtype turboquant_4bit_nc; el autor aclara que GLM MLA no emplea TurboQuant en esta version.
- Latencia y throughput: 188,7645 tokens/s en decodificacion de contexto corto, 47,2815 tokens/s en contexto largo y 518,582 tokens/s agregados con cuatro peticiones concurrentes, sobre dos RTX 3090.
- Los pesos MTP estan retenidos, pero no se probo decodificacion especulativa con ellos.

## Comparativa con modelos similares

No se dispone de datos de terceros comparables en la informacion proporcionada. La unica comparacion documentada es contra el propio checkpoint en configuracion W8A8, con los porcentajes de la seccion anterior.

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.6-35B-A3B-Hauhau-Aggressive-W6A8-Vision | 35.951.822.704 | hasta 200.000 tokens en la receta vLLM | apache-2.0 | HuggingFace |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace |
| Alternativas de mismo tamano o tarea | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo no oficial: es una publicacion de un tercero (Xananthium) sobre un modelo base de otro autor (HauhauCS), sin aval de los desarrolladores originales de la familia Qwen.
- Rendimiento en seguridad limitado: los controles sinteticos de politica de seguridad arrojaron 27/43 en primera respuesta, lo que indica una tasa relevante de fallos en ese escenario.
- Riesgo de alucinacion no cuantificado: no hay benchmarks de veracidad publicados, y la evaluacion de conocimiento se limita a CyberMetric-80, un cuestionario pequeno con posible solapamiento con datos de entrenamiento.
- La ventana de 200.000 tokens declarada en la receta no implica recuperacion fiable en toda la longitud: el replay de contexto largo obtuvo 47/54.
- Presupuesto de salida: el razonamiento extenso puede agotar el limite de tokens de salida, lo que obliga a dimensionar bien max_tokens y a considerar reintentos.
- Las cifras de throughput incluyen tokens de razonamiento y no equivalen a throughput de respuesta visible.
- Procedencia de la cuantizacion: la receta exige trust-remote-code, instalar un paquete de compatibilidad incluido en el repositorio y usar vLLM 0.31.0; conviene auditar el codigo antes de desplegarlo en entornos sensibles.
- Los resultados proceden de dos unicas GPU RTX 3090 y de lotes cronometrados; no se garantiza su traslado a otro hardware.
- Idiomas soportados no declarados, por lo que el comportamiento multilingue debe validarse antes de usarlo en produccion fuera del ingles.
- Licencia Apache 2.0 en este repositorio, pero la licencia y los terminos del modelo base deben verificarse por separado antes de un uso comercial.
- No se documentan otras rutas de despliegue (llama.cpp, Ollama, TGI) ni formatos GGUF, lo que limita la portabilidad a entornos sin vLLM.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/Qwen3.6-35B-A3B-Hauhau-Aggressive-W6A8-Vision
- Modelo base: https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Model card original preservada en el repositorio: README_ORIGINAL.md
- Procedencia de la cuantizacion: conversion-receipt.json
- Informe de comparacion de precision: results/precision-comparison.json
- Perfil de servicio probado: results/serving-profile.json
- Paquete de compatibilidad de compilacion: runtime/humming-compile-compat
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada
