# Xylolabs/Qwen3.5-9B-Base-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-Base-GGUF es una cuantizacion GGUF de referencia del modelo base Qwen3.5-9B-Base, publicada por Xylolabs mediante llama.cpp. Se trata de una exportacion Q4_K_M que preserva los 442 tensores originales del modelo, incluyendo el decodificador de texto principal de 32 capas, embeddings, cabeza de salida y un bloque MTP (multi-token prediction) almacenado. El modelo subyacente es un modelo base preentrenado de 9.197.093.888 parametros, orientado a generacion de texto mediante continuacion de prompts en crudo, sin plantilla de chat.

La relevancia de esta ficha reside en que documenta una cuantizacion conservadora que mantiene alta fidelidad respecto al BF16 original: una divergencia KL media de 0,026436 y un 91,72% de acuerdo top-1 con BF16 en la evaluacion de referencia, con 27/28 respuestas correctas frente a 28/28 del BF16 almacenado. Es, por tanto, un punto de comparacion util para validar futuras cuantizaciones del mismo modelo base.

El modelo se distribuye bajo licencia Apache 2.0, con soporte declarado de ingles y coreano, y esta pensado para despliegue en llama.cpp. No se ha realizado entrenamiento, calibracion ni cuantizacion nueva para esta publicacion: es una exportacion preservada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base), con bloque MTP almacenado |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo usa 2.048 tokens; las comprobaciones GPU de llama.cpp usan 8.192) |
| Tipos de cuantizacion | Q4_K_M (F32: 184 tensores, Q4_K: 223, Q6_K: 35; media de 5,018 bits/peso) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only preentrenado de aproximadamente 9,2 mil millones de parametros. El archivo GGUF conserva los 442 tensores originales: el decodificador de texto principal de 32 capas, embedding, cabeza de salida y 15 tensores de un bloque MTP almacenado, ademas del tokenizador y los metadatos originales. El `block_count` del GGUF es 33 con `nextn_predict_layers` igual a uno. La vision y su proyector se omiten en esta exportacion.

No se realizo entrenamiento, calibracion ni cuantizacion nueva para esta publicacion: es una exportacion preservada del modelo base original Qwen/Qwen3.5-9B-Base. La cuantizacion Q4_K_M se genero con llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`). No se dispone de informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generacion de texto mediante continuacion de prompts en crudo (raw completion), sin plantilla de chat.
- Razonamiento basico de texto: la evaluacion de referencia incluye tareas de razonamiento (`en-reason-weekday`).
- Generacion de codigo: la evaluacion incluye items de codigo con firma de funcion y docstring originales.
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos declarados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada (no se usan comprobaciones de chat ni de thinking).
- Vision: no incluida (el proyector de vision se omite en esta exportacion).

## Casos de uso

- Referencia de fidelidad para cuantizaciones: este archivo Q4_K_M sirve como linea base contra la que comparar candidatas de cuantizacion mediante KL media y recuento de respuestas correctas, dado que preserva los metadatos y el fingerprint de calibracion/evaluacion originales.
- Continuacion de texto en bruto: util para tareas de autocompletado y generacion libre donde se controla el prompt manualmente, sin plantilla de chat, con llama.cpp.
- Evaluacion de modelos base en ingles y coreano: adecuado para experimentos de continuacion de texto en ambos idiomas declarados, con prompts en crudo y presupuestos de generacion cortos (48 tokens, o 96 para codigo).
- Prototipado de pipelines de generacion de codigo: los items de codigo de la evaluacion usan firma de funcion y docstring, lo que permite probar continuacion de funciones en entornos de desarrollo.
- Despliegue en hardware de gama media: con 5,77 GB de pesos GGUF, cabe en GPUs consumer con suficiente VRAM para pesos, cache KV y buffers, permitiendo inferencia local mediante llama.cpp.
- Validacion de integraciones llama.cpp: el comando de completado publico (`llama-completion`) esta verificado como ejemplo de carga con llama.cpp v0.9.0, lo que facilita pruebas de integracion.

## Benchmarks y rendimiento

| Referencia | KL media | Acuerdo top-1 con BF16 | Respuestas correctas | Perdidas/rotas contadas |
|---|---:|---:|---:|---:|
| BF16 almacenado | 0 | 100% | 28/28 | — |
| Este Q4_K_M | 0,026436 | 91,72% | 27/28 | 0 |

La evaluacion de referencia usa 28 de los 33 items (se omiten cinco items de formato de instruccion), con un prefijo fijo de tres ejemplos en texto plano y presupuestos de generacion greedy de 48 tokens (96 para codigo). Las cuatro secuencias de texto en crudo de 2.048 tokens (ingles/coreano) cubren 8.188 posiciones puntuadas. No se reporta velocidad ni throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,77 GB solo para los pesos GGUF, mas espacio para la cache KV y buffers de trabajo.
- GPU recomendadas: no se especifican modelos concretos en la informacion disponible; las comprobaciones GPU de llama.cpp usan contexto de 8.192 tokens.
- Cabe en GPU consumer: si, dado el tamano de los pesos (5,77 GB) mas cache KV y buffers; se requiere una GPU con VRAM suficiente para el contexto elegido.
- Opciones de despliegue: llama.cpp (verificado con v0.9.0, commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`); otras opciones no disponibles en la informacion proporcionada.
- Latencia y throughput: no reportados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-9B-Base-GGUF (este) | 9.197.093.888 | no disponible | GGUF Q4_K_M | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B-Base (BF16 original) | 9.197.093.888 | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no esta ajustado para instrucciones ni chat; requiere prompts en crudo y no usa plantilla de chat.
- La evaluacion de referencia omite cinco items de formato de instruccion y no incluye comprobaciones de chat ni de thinking; los resultados no representan un rendimiento conversacional.
- La cuantizacion Q4_K_M introduce divergencia respecto a BF16 (KL media de 0,026436, acuerdo top-1 del 91,72%), con una respuesta menos correcta en la evaluacion de referencia (27/28 frente a 28/28).
- La vision y su proyector estan omitidos en esta exportacion; no soporta tareas multimodales.
- Idiomas declarados limitados a ingles y coreano; no se garantiza soporte de otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada, pero inherentes a un modelo base preentrenado.
- Licencia Apache 2.0 permite uso comercial, pero se distribuye "as is", sin garantia ni aval del autor original.
- No se reportan datos de velocidad ni throughput; el rendimiento en produccion debe evaluarse por separado.
- El modelo se publico con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Herramienta de completado de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/cd959bae99ff4bed22bef2604f45241c09bbb8c8/tools/completion/README.md
