# Thox-ai/thox-micro-125m-instruct-GGUF

## Resumen

thox-micro-125m-instruct-GGUF es la distribucion en formato GGUF del modelo Thox-ai/thox-micro-125m-instruct, un modelo de lenguaje de 123,6 millones de parametros desarrollado desde cero por THOX.ai LLC. No se trata de un asistente general, sino de un "device-role responder": un modelo especializado en responder consultas sobre identidad, estado y localidad de datos dentro del ecosistema THOX, pensado para ejecutarse en dispositivos de borde (edge) y derivar las peticiones generales a un modelo de mayor tamano.

El repositorio contiene tres builds cuantizados: Q4_0 (81,3 MB, objetivo para dispositivo), Q4_K_M (84,7 MB) y F16 (249,0 MB). El modelo usa una plantilla de chat ChatML con los tokens especiales `<|im_start|>` y `<|im_end|>`, y esta disenado para ejecutarse con llama.cpp, llama-server u Ollama en hardware local.

Su relevancia radica en el enfoque local-first: un modelo diminuto, con licencia Apache-2.0 y sin modelo base externo (entrenado from scratch), que prioriza la privacidad y la ejecucion en dispositivo frente a la capacidad generalista. Es una pieza de infraestructura para el stack THOX (thoxos, meshstack), no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo transformer entrenado desde cero; detalles no publicados) |
| Parametros totales | 123.587.328 (123,6 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0, Q4_K_M, F16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 (Copyright (c) 2026 THOX.ai LLC) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La model card indica que el modelo fue entrenado por THOX desde cero como parte de su linea de investigacion de modelos pequenos, sin utilizar un modelo base externo. No se publican detalles sobre el numero de capas, dimensiones de atencion, tipo de transformer ni composicion del corpus de entrenamiento; la unica referencia tecnica concreta es que la dimension de la FFN es 2048, dato que se menciona para justificar que divide limpiamente en bloques Q4_0.

No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales. El ajuste por instrucciones se refleja en la plantilla ChatML embebida en los metadatos GGUF (`tokenizer.chat_template`), con `eos_token_id = 50258` (`<|im_end|>`) y `padding_token_id = 50258`. Tanto `<|endoftext|>` como `<|im_end|>` actuan como tokens de fin de generacion. Los ficheros cuantizados tienen el mismo tamano que el modelo base sin ajustar porque los tokens de ChatML reutilizan filas de vocabulario no usadas.

## Capacidades

- Generacion de texto conversacional en ingles con formato ChatML.
- Respuestas de rol de dispositivo: identidad THOX, estado del sistema y localidad de datos (si los datos salen o no del dispositivo).
- Parada limpia de generacion: la model card reporta 7 de 7 paradas limpias con su system prompt en la evaluacion realizada.
- Ejecucion local en dispositivo mediante llama.cpp, llama-server y Ollama.
- Plantilla de chat embebida, compatible con `llama-server --jinja`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Respuesta de identidad en dispositivo: el modelo responde a preguntas como "¿que eres?" o "¿quien te ejecuta?" dentro de un producto THOX, usando su system prompt especifico y su ventana de contexto reducida para respuestas cortas y deterministas.
- Verificacion de localidad de datos: integrado en la interfaz de un dispositivo THOX para contestar si los datos abandonan el dispositivo, con generacion a temperatura 0 y parada controlada en `<|im_end|>`.
- Enrutador de peticiones: al ser un responder de rol de dispositivo, las consultas generales se derivan a un modelo mayor; el modelo micro gestiona el saludo, la identidad y el estado antes del enrutado.
- Demostracion de privacidad local-first: permite mostrar en una demo que la inferencia ocurre en el dispositivo con 191 MB de RSS pico en Q4_0, sin llamadas a la nube.
- Prototipado en hardware de borde: con 81,3 MB en Q4_0 cabe en dispositivos con memoria muy limitada, lo que facilita pruebas de integracion en firmware o sistemas embebidos con llama.cpp.
- Generacion de respuestas de estado del sistema: mensajes breves sobre el estado del dispositivo o del stack THOX (thoxos, meshstack) en flujos de UI conversacional.
- Evaluacion de pipelines GGUF: sirve como modelo de prueba minimo para validar plantillas ChatML, metadatos de tokenizer y despliegues con Ollama (`ollama run hf.co/Thox-ai/thox-micro-125m-instruct-GGUF:Q4_K_M`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta metricas de ejecucion en una maquina host, no en el hardware objetivo:

| Metrica | Valor | Condiciones |
|---|---|---|
| Memoria pico (RSS) | 191 MB | Q4_0, maquina host |
| Velocidad de decodificacion | ~450 tok/s | Q4_0, maquina host |
| Paradas limpias | 7 de 7 | Con su system prompt |
| Validacion en dispositivo objetivo | No realizada | Pendiente |
| Resultado THOX GATE49 | No publicado | — |

## Requisitos de hardware

- VRAM/RAM estimada: Q4_0 ocupa 81,3 MB en disco; el pico de RSS medido es de 191 MB en Q4_0. F16 ocupa 249,0 MB en disco.
- GPU recomendadas: no se especifican; por tamano, el modelo es viable en CPU y en cualquier GPU consumer.
- Cabe en GPU consumer: si, en cualquier GPU con al menos ~0,5 GB de memoria libre, y en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-completion`, `llama-server --jinja`), Ollama (`ollama run thox-ai/thox-micro-125m-instruct` o `hf.co/Thox-ai/thox-micro-125m-instruct-GGUF:Q4_K_M`). No se documenta soporte de vLLM ni TGI.
- Latencia y throughput: ~450 tok/s de decodificacion en Q4_0 sobre la maquina host de evaluacion; no hay datos del dispositivo objetivo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks que permitan una comparacion de rendimiento fiable. A continuacion se comparan caracteristicas estructurales con alternativas de tamano similar del ecosistema open source:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| thox-micro-125m-instruct-GGUF | 123,6 M | No disponible | Apache-2.0 | Responder de rol de dispositivo, from scratch, solo ingles |
| SmolLM2-135M-Instruct | 135 M | 8.192 tokens (segun documentacion publica del modelo) | Apache-2.0 | Asistente general pequeno, multilingue |
| Qwen2.5-0.5B-Instruct | 0,49 B | 32.768 tokens (segun documentacion publica del modelo) | Apache-2.0 | Asistente general, multilingue, tool calling |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens (segun documentacion publica del modelo) | Apache-2.0 | Chat general en ingles |

La comparacion de rendimiento con estos modelos no esta disponible porque THOX no publica resultados de benchmarks estandar para thox-micro-125m-instruct.

## Limitaciones y advertencias

- No es un asistente general: la model card excluye explicitamente chat general, QA factual, aritmetica, codigo y cualquier uso critico para la seguridad.
- Condicionamiento por system prompt: la model card del modelo base documenta un problema conocido de condicionamiento por system prompt; consultar la card de origen.
- Solo ingles: no hay soporte multilingue declarado.
- Longitud de contexto no publicada: no se puede planificar su uso en conversaciones largas sin verificar el valor real.
- Cuantizacion: Q4_0 y Q4_K_M intercambian precision por tamano; la propia card advierte de esta perdida de exactitud.
- Sin validacion en hardware objetivo: las metricas de rendimiento se midieron en una maquina host, no en el dispositivo destino.
- Sin resultado GATE49: no hay evaluacion interna THOX publicada para este modelo.
- Licencia Apache-2.0: permite uso comercial, pero el modelo esta pensado para el ecosistema THOX y su utilidad fuera de ese contexto es muy limitada.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de fidelidad factual; al ser un modelo de 123,6 M, la generacion fuera de su dominio de rol es poco fiable.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Ollama: https://ollama.com/thox-ai/thox-micro-125m-instruct
- llama.cpp: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
