# Thox-ai/thox-micro-125m-instruct-GGUF

## Resumen

thox-micro-125m-instruct-GGUF es la distribucion en formato GGUF del modelo Thox-ai/thox-micro-125m-instruct, un modelo de 123.587.328 parametros (aproximadamente 125M) desarrollado por Thox-ai (THOX.ai LLC). No se trata de un asistente de proposito general: el propio autor lo define como un "device-role responder", es decir, un modelo disenado para responder consultas sobre el estado y el rol de un dispositivo en el que se ejecuta localmente, bajo el lema "Your AI. Your Data. Your Rules.".

El repositorio contiene tres builds cuantizadas (Q4_0, Q4_K_M y F16) pensadas para inferencia en el dispositivo (on-device) y entornos edge, con llama.cpp como runtime de referencia. El objetivo declarado es ofrecer respuestas de chat con plantilla ChatML en hardware muy limitado, priorizando el consumo minimo de memoria y la privacidad de los datos, que no abandonan el dispositivo.

Su relevancia actual radica en el nicho de modelos ultraligeros para edge: con un pico de memoria de 191 MB y ~450 tok/s de decodificacion en una maquina de desarrollo x86_64 (4 hilos), se posiciona como una alternativa mas rapida y ligera que SmolLM2-360M-Instruct en el mismo harness. La licencia Apache-2.0 facilita su integracion comercial, aunque su ambito funcional es estrecho y especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; el autor menciona una dimension FFN de 2048, compatible con un transformer decoder |
| Parametros totales | 123.587.328 (aproximadamente 125M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0 (objetivo de dispositivo), Q4_K_M, F16 (fuente de re-cuantizacion); el autor indica que Q8_0 tambien es aplicable |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de dos datos concretos: el modelo tiene 123.587.328 parametros y una dimension FFN de 2048. Esta dimension es relevante porque, segun el autor, divide limpiamente en bloques Q4_0, lo que permite usar el formato legacy Q4_0 (seguro a nivel escalar en ARMv6) en lugar de verse obligado a los K-quants, como ocurre con el modelo THOX de 327M (FFN dim 3413). El modelo usa una plantilla de chat ChatML y reutiliza filas de vocabulario no usadas para los tokens de ChatML, por lo que los ficheros cuantizados ocupan lo mismo que los del modelo base sin ajustar.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La variante "instruct" implica un proceso de ajuste para seguir instrucciones, dado que el autor distingue entre el modelo "tuned" y el "untuned base", y el chat template embebido soporta turnos de sistema, usuario y asistente. Los metadatos GGUF incluyen `tokenizer.ggml.eos_token_id = 50258` (`<|im_end|>`), `padding_token_id = 50258` y como tokens de fin de generacion tanto `<|endoftext|>` como `<|im_end|>`.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla ChatML (turnos de sistema, usuario y asistente).
- Respuestas especificas de "rol de dispositivo": responde a preguntas sobre si los datos salen del dispositivo y sobre el propio funcionamiento del modelo en el hardware local.
- Ejecucion on-device y edge, con parada limpia de generacion: el autor reporta 7 de 7 paradas limpias usando su prompt de sistema.
- Compatible con `endpoints_compatible` y servidores HTTP de llama.cpp (`llama-server --jinja`).
- Razonamiento general, codigo, matematicas, vision, audio, tool calling y uso como agente: no documentados en la informacion disponible (el autor insiste en que no es un asistente general).
- Capacidades multilingues: solo ingles.

## Casos de uso

- Asistente de privacidad embebido en dispositivo: el modelo esta disenado para responder a preguntas como "¿mis datos salen de este dispositivo?" usando su prompt de sistema, de modo que el propio hardware pueda comunicar al usuario su politica de datos local.
- Chat local en hardware ultraligero: con 191 MB de pico de RSS en Q4_0, cabe en dispositivos con memoria muy limitada y permite conversaciones de rol acotado sin conexion a red.
- Sistemas embebidos e IoT con ARM: la eleccion de Q4_0 como formato objetivo (seguro a nivel escalar en ARMv6) lo hace apto para placas antiguas o de bajos recursos donde los K-quants no son viables.
- Interfaz de estado del dispositivo: puede integrarse como capa de lenguaje que traduzca el estado interno de un equipo a respuestas legibles para el usuario final.
- Demostraciones de IA local con garantias de privacidad: util para prototipos o productos que deben demostrar que ninguna peticion sale del dispositivo, dado que todo el pipeline cabe en el propio equipo.
- Pruebas de inferencia en CPU de alto rendimiento: sus ~450 tok/s en decodificacion lo hacen adecuado como banco de pruebas de pipelines llama.cpp en x86_64 antes de portar a otros entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de rendimiento medido por el autor es el siguiente, obtenido en una maquina de desarrollo x86_64 con 4 hilos y advertido explicitamente como "no es una cifra de dispositivo":

| Modelo / metrica | Pico de RSS | Decodificacion | Paradas limpias (con prompt de sistema) |
|---|---|---|---|
| thox-micro-125m-instruct Q4_0 | 191 MB | ~450 tok/s | 7 de 7 |
| SmolLM2-360M-Instruct Q4_0 | 473 MB | ~163 tok/s | 1 de 7 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: Q4_0 con un pico de 191 MB de RSS en x86_64; el fichero Q4_0 pesa 81.319.136 bytes (~81 MB) y el F16, 248.988.128 bytes (~249 MB).
- GPU recomendadas: no se especifican; el modelo esta orientado a CPU y a ejecucion on-device, por lo que no requiere una GPU dedicada.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual, aunque su objetivo no es ese escenario; esta pensado para CPU y dispositivos edge.
- Opciones de despliegue: llama.cpp (`llama-completion` con `-no-cnv` y `llama-server --jinja`), y por compatibilidad general con GGUF, tambien Ollama y otros runtimes basados en llama.cpp.
- Latencia y throughput: ~450 tok/s de decodificacion en Q4_0 sobre una maquina x86_64 con 4 hilos (cifra de desarrollo, no de dispositivo).
- Nota del autor: no validado todavia en una Raspberry Pi Zero 2 W.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento medido (Q4_0, mismo harness) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thox-micro-125m-instruct | 123.587.328 | No disponible | 191 MB RSS, ~450 tok/s, 7/7 paradas limpias | Apache-2.0 | HuggingFace (GGUF) |
| SmolLM2-360M-Instruct | ~360M | No disponible | 473 MB RSS, ~163 tok/s, 1/7 paradas limpias | No disponible | HuggingFace |
| THOX 327M (mencionado por el autor) | ~327M | No disponible | No disponible | No disponible | HuggingFace |

Los datos de comparacion proceden exclusivamente de las mediciones del autor en su harness de pruebas; no son cifras equivalentes de benchmarks estandar.

## Limitaciones y advertencias

- No es un asistente de proposito general: el autor lo define como un "device-role responder", por lo que su uso fuera de ese ambito puede dar resultados pobres.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- No se han publicado datos sobre sesgos, alucinacion o robustez fuera del caso de uso previsto.
- Longitud de contexto no disponible: se desconoce la ventana maxima soportada.
- Rendimiento medido en x86_64 con 4 hilos; el autor advierte que no es una cifra de dispositivo y que el modelo aun no se ha validado en Raspberry Pi Zero 2 W.
- La licencia Apache-2.0 permite uso comercial, con copyright de THOX.ai LLC, pero conviene revisar los terminos del modelo base antes de redistribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de soporte y comunidad practicamente inexistente.
- Existen ficheros con sufijos de cuantizacion en mayusculas de una subida anterior en el repositorio del modelo base, segun una fuente externa; conviene verificar que se descarga la build deseada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/thox-micro-125m-instruct-GGUF
- Modelo base: https://huggingface.co/Thox-ai/thox-micro-125m-instruct
- Version GGUF del modelo base: https://huggingface.co/Thox-ai/thox-micro-125m-GGUF
- Modelo thox-micro-125m: https://huggingface.co/Thox-ai/thox-micro-125m
- Fichero de pesos safetensors: https://huggingface.co/Thox-ai/thox-micro-125m/blob/main/model.safetensors
- ThoxMini-125M-role: https://huggingface.co/Thox-ai/ThoxMini-125M-role
- Ficha y endpoint en FriendliAI: https://friendli.ai/models/Thox-ai/thox-micro-125m
