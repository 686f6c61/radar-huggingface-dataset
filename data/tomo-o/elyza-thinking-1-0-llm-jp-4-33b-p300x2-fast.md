# tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast

## Resumen

`elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast` es un paquete de despliegue comunitario, no un modelo nuevo, publicado por el usuario tomo-o. Empaqueta los pesos de `elyza/ELYZA-Thinking-1.0-llm-jp-4-33b`, un modelo de razonamiento post-entrenado por ELYZA sobre la base `llm-jp/llm-jp-4-33b-base`, para ejecutarlo con vLLM y el plugin de Tenstorrent sobre hardware Blackhole (QuietBox 2, malla P300x2 con cuatro chips). Su tesis es la eficiencia: mismos pesos, mismas salidas a temperatura 0 y una decodificacion entre 1,4 y 1,8 veces mas rapida que el bundle anterior del mismo autor.

El modelo subyacente es un decoder-only denso de 33 000 millones de parametros, estilo Llama, con 64 capas y un vocabulario de 196 608 tokens. Esta orientado a chat y razonamiento en japones e ingles, con un modo de pensamiento que el servidor separa del texto final: el razonamiento se devuelve en el campo `reasoning` y la respuesta en `content`. Ademas expone tool calling mediante el parser `llmjp_harmony`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso real de despliegue de un LLM de 33B en aceleradores no-GPU (Tenstorrent) con la pila de vLLM, incluyendo rendimiento medido por usuario concurrente. Por otro, advierte de que se trata de un bring-up experimental no verificado por Tenstorrent ni afiliado a ELYZA, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, estilo Llama, 64 capas |
| Parametros totales | 33 000 millones (aproximado, segun nombre del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 65 536 tokens |
| Tipos de cuantizacion | no disponible (el bundle se distribuye como imagen Docker con pesos en el cache de HF) |
| Idiomas soportados | japones e ingles (segun uso previsto de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos del modelo base `elyza/ELYZA-Thinking-1.0-llm-jp-4-33b` en la revision `6ca556b2ddc4642580752b3a1ae2d7e7681106fc`; el paquete se distribuye como imagen de contenedor con manifiesto de tt-model-manager 0.1.0 (esquema 5.1) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base: un transformer decoder-only denso de 33B con 64 capas y vocabulario de 196 608 tokens. ELYZA realizo un post-entrenamiento orientado a razonamiento sobre `llm-jp/llm-jp-4-33b-base`, lo que da lugar a un modelo con modo de pensamiento explicito. No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica de este paquete no esta en los pesos, sino en el stack de servicio. Se ejecuta con vLLM 0.26.0 y el plugin de vLLM de Tenstorrent sobre una malla P300x2 (dos placas p300c, cuatro chips Blackhole). Incluye dos parsers propios del modelo: `llmjp4_reasoning_parser.py`, que separa el pensamiento del contenido final y al que tomo-o aplico dos cambios en la ruta de streaming, y `llmjp_harmony_tool_parser.py`, sin modificar, que emite las llamadas a herramientas como `tool_calls`. El muestreo se ejecuta en el dispositivo, lo que reduce el coste de la temperatura frente al bundle anterior.

## Capacidades

- Generacion de texto y razonamiento en japones e ingles, con modo de pensamiento separado de la respuesta final.
- Tool calling / function calling: una peticion con `tools` devuelve `tool_calls` y `finish_reason: tool_calls`.
- Razonamiento multi-paso mediante el bloque de pensamiento expuesto en el campo `reasoning`.
- Servicio concurrente de hasta 32 secuencias simultaneas con contexto de 65 536 tokens.
- API compatible con OpenAI (chat completions, completions y `/v1/models`) en el puerto 20000.
- No soporta llamadas a herramientas en paralelo ni entrada multimodal, segun la model card.

## Casos de uso

- Asistente de chat en japones para atencion al cliente: el modelo mantiene conversaciones multi-turno con hasta 65 536 tokens de contexto, lo que permite arrastrar historial largo o documentacion de referencia sin truncar.
- Razonamiento asistido con traza auditable: al separar `reasoning` de `content`, un sistema puede registrar la cadena de pensamiento para auditoria o depuracion mientras muestra al usuario solo la respuesta final.
- Integracion en pipelines con function calling: gracias al parser `llmjp_harmony`, un orquestador puede recibir `tool_calls` estructuradas y ejecutar busquedas, consultas a bases de datos o acciones sobre APIs internas.
- Despliegue en infraestructura Tenstorrent: organizaciones con QuietBox 2 pueden servir un LLM de 33B en cuatro chips Blackhole sin depender de GPUs NVIDIA, usando el CLI `tt` o `tt-model`.
- Generacion de codigo y tareas tecnicas en ingles: el modelo base llm-jp-4 esta orientado a texto general y codigo, y el modo de razonamiento ayuda en problemas de varios pasos.
- Evaluacion comparativa de hardware: el paquete sirve como referencia reproducible para medir latencia y throughput de vLLM sobre Blackhole frente a alternativas en GPU, con cifras de decodificacion por numero de usuarios.
- Procesamiento por lotes con prompts largos: con contexto de 64K y decodificacion 1,2-1,3 veces mas rapida en prompts de 16 384 a 64 000 tokens, es util para resumen o analisis de documentos extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card solo aporta metricas de rendimiento de servicio del bundle:

| Metrica | Valor |
|---|---|
| Aceleracion de decodificacion a temperatura 0, prompts hasta 4 096 tokens | 1,4-1,8x frente al bundle anterior |
| Aceleracion a temperatura 0, prompts hasta 1 024 tokens | 1,7-1,8x |
| Aceleracion a temperatura 0, prompts de 16 384-64 000 tokens | 1,2-1,3x |
| Aceleracion con el muestreo recomendado (temperatura 0,6) | 2,1-6,7x |
| Decodificacion por usuario, 1 a 32 usuarios, prompts hasta 1 024 tokens, temperatura 0 | 32,1-36,4 tokens/s |
| Decodificacion por usuario con muestreo recomendado, prompts de 128 tokens | 35,4-36,4 tokens/s |
| Penalizacion de temperatura 0,6 frente a temperatura 0 (arranque en frio) | dentro del 3 % |
| Secuencias concurrentes maximas | 32 |

## Requisitos de hardware

- Hardware objetivo: QuietBox 2 con dos placas p300c (cuatro chips Blackhole, malla P300x2). No es un bundle para GPU convencional.
- VRAM estimada: no disponible; el modelo se ejecuta en memoria de los chips Blackhole, no en VRAM de GPU.
- GPUs recomendadas: no aplica a este paquete. Para los pesos originales de 33B en GPU haria falta hardware de gran capacidad, pero no se documenta en la informacion disponible.
- Cabe en GPU de consumo: no disponible para este bundle; el paquete esta atado al hardware Tenstorrent.
- Despliegue: vLLM 0.26.0 con el plugin de vLLM de Tenstorrent; CLI `tt` (`tt model pull`, `tt serve`) o `tt-model` (`tt-model pull --with-weights`, `tt-model serve`). Servidor compatible con OpenAI en el puerto 20000 o el siguiente libre.
- Arranque: la primera ejecucion compila kernels para el dispositivo y tarda varios minutos; el servidor esta listo cuando registra `Application startup complete`.
- Latencia y throughput: 32,1-36,4 tokens/s por usuario de 1 a 32 usuarios con prompts hasta 1 024 tokens a temperatura 0; 35,4-36,4 tokens/s con el muestreo recomendado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Notas |
|---|---|---|---|---|---|
| elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast (este) | 33B denso | 65 536 | Blackhole P300x2 | Apache 2.0 | Bundle comunitario, decodificacion 1,4-1,8x mas rapida que el anterior |
| tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2 | 33B denso | 65 536 | Blackhole P300x2 | Apache 2.0 | Bundle anterior del mismo autor y mismos pesos; mas lento |
| elyza/ELYZA-Thinking-1.0-llm-jp-4-33b | 33B denso | no disponible | no disponible (pesos originales) | Apache 2.0 | Modelo base de ELYZA; resultados publicados por ELYZA, no comparables directamente con el bundle |

No se dispone de datos de benchmarks de calidad para establecer una comparacion de rendimiento frente a alternativas de otros fabricantes.

## Limitaciones y advertencias

- Bundle no oficial: no esta afiliado ni respaldado por ELYZA, Inc., y Tenstorrent no lo ha verificado; `tt serve` pide confirmacion explicita antes de servirlo.
- Estado experimental de bring-up comunitario; no debe asumirse estabilidad para produccion sin validacion propia.
- No soporta llamadas a herramientas en paralelo ni entrada multimodal.
- Idiomas limitados a japones e ingles segun el uso previsto; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los LLM; no se documentan evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Reproducibilidad: para obtener la misma salida en dias distintos con muestreo hay que fijar `conversation_start_date` en `chat_template_kwargs`; a temperatura 0 la salida es estable.
- El campo de razonamiento es `reasoning`, no `reasoning_content`; integraciones que esperen el segundo nombre de campo fallaran.
- El identificador de modelo que debe pasarse en las peticiones es el de los pesos (`elyza/ELYZA-Thinking-1.0-llm-jp-4-33b`), no el nombre del paquete.
- Dependencia fuerte de hardware propietario (Blackhole) y de una version concreta de vLLM (0.26.0); la portabilidad a otras pilas no esta documentada.
- Licencia Apache 2.0 permite uso comercial, pero la condicion de bundle no verificado traslada al operador la responsabilidad de validacion.

## Enlaces

- Hugging Face del bundle: https://huggingface.co/tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2-fast
- Bundle anterior: https://huggingface.co/tomo-o/elyza-thinking-1.0-llm-jp-4-33b-p300x2
- Modelo base en Hugging Face: https://huggingface.co/elyza/ELYZA-Thinking-1.0-llm-jp-4-33b
- Herramienta de empaquetado tt-model-manager: https://github.com/tenstorrent/tt-model-manager
