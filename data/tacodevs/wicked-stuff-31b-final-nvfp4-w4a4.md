# tacodevs/Wicked-Stuff-31B-Final-NVFP4-W4A4

## Resumen

Wicked-Stuff-31B-Final-NVFP4-W4A4 es una cuantizacion NVFP4 del modelo ReadyArt/Wicked-Stuff-31B-Final, un fine-tune de Gemma 4 31B orientado a roleplay. La publica el usuario tacodevs bajo licencia Apache 2.0 y aplica un esquema W4A4 (pesos y activaciones en FP4, con grupo de 16) sobre todas las capas `Linear`, dejando en BF16 las torres de vision y audio, los embeddings y la `lm_head`. La herramienta de cuantizacion es llm-compressor mediante `QuantizationModifier` y el formato de pesos es compressed-tensors en safetensors.

El objetivo es reducir el coste de memoria y aumentar el throughput del modelo base en hardware Blackwell, que es donde NVFP4 se ejecuta de forma nativa (RTX 5090, RTX PRO 6000, B200). El repo ocupa 23,3 GB y el checkpoint declara 19.869.430.116 parametros reales en safetensors, aunque el nombre comercial del modelo base hable de "31B"; esa discrepancia debe tenerse en cuenta al planificar el despliegue.

La relevancia actual es doble: por un lado, demuestra un pipeline de cuantizacion FP4 de extremo a extremo con calibracion especifica de dominio (roleplay multi-turno); por otro, es un ejemplo de como los fine-tunes de Gemma 4 pueden servirse con vLLM usando parser de razonamiento y tool calling nativos. La informacion publicada es escasa: no hay benchmarks, no se detallan idiomas y el modelo tiene un volumen de descargas muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4), con torres de vision y audio segun la model card |
| Parametros totales | 19.869.430.116 (segun safetensors); el nombre del modelo base indica "31B" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue con vLLM (`--max-model-len 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 (FP4 en pesos y activaciones, grupo 16) en capas `Linear`; vision, audio, embeddings y `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento desde cero. Se parte de ReadyArt/Wicked-Stuff-31B-Final, un fine-tune de Gemma 4 31B etiquetado como `roleplay`, y se aplica un esquema NVFP4 W4A4 con llm-compressor: pesos y activaciones de todas las capas `Linear` se representan en FP4 con granularidad de grupo 16, mientras que las torres de vision y audio, los embeddings y la `lm_head` permanecen en BF16. Esta decision preserva la precision en las partes mas sensibles del modelo multimodal y concentra la compresion en las proyecciones densas, que dominan el coste computacional.

La calibracion se hizo con 128 muestras de hasta 4096 tokens de roleplay multi-turno extraidas de `Gryphe/Sonnet3.5-Charcard-Roleplay` y renderizadas con la plantilla de chat del propio modelo. Es una calibracion de dominio especifico, no generica, lo que deberia favorecer la fidelidad en conversaciones de rol pero puede no ser optima para otros usos (codigo, matematicas, documentos tecnicos). No se documentan datos de entrenamiento del modelo base, numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y roleplay multi-turno, que es el dominio declarado del fine-tune.
- Razonamiento con modo thinking activable mediante `chat_template_kwargs: {"enable_thinking": true}`.
- Tool calling y eleccion automatica de herramienta mediante los parsers `gemma4` de vLLM (`--enable-auto-tool-choice --tool-call-parser gemma4`).
- Parser de razonamiento nativo (`--reasoning-parser gemma4`), lo que permite separar trazas de pensamiento de la respuesta final.
- Capacidades multimodales: la model card menciona explicitamente torres de vision y audio que se mantienen en BF16, aunque no se detalla su alcance funcional.
- Soporte multilingue: no disponible en la informacion publicada.
- Capacidad de agentes y razonamiento multi-paso: no documentada explicitamente, pero el soporte de tool calling y thinking lo habilita tecnicamente.

## Casos de uso

- Roleplay y narrativa interactiva: es el caso de uso principal del fine-tune y el dominio de calibracion de la cuantizacion. Con 32.768 tokens de contexto se pueden mantener personajes coherentes y arcos narrativos largos, y el modo thinking permite planificar respuestas complejas antes de emitirlas.
- Despliegue de bajo coste en Blackwell: al usar NVFP4 nativo, se puede servir en una RTX 5090 o RTX PRO 6000 con un consumo de VRAM muy inferior al del modelo en BF16, lo que abarata prototipos y demos publicas.
- Agentes conversacionales con herramientas: el soporte de tool calling con parser `gemma4` permite conectar el modelo a APIs externas (calendario, busqueda, calculadoras) en flujos de atencion al cliente o asistentes personales.
- Generacion de dialogos para videojuegos y simulaciones: la calibracion sobre charcards y el contexto de 32k lo hacen adecuado para NPCs con memoria de conversacion y personalidad definida por ficha.
- Evaluacion de tecnicas de cuantizacion FP4: el repo sirve como referencia practica de un pipeline llm-compressor W4A4 con calibracion de dominio, util para investigadores que quieran replicar o comparar esquemas.
- Prototipado de asistentes multimodales: aunque no se detalla el alcance de vision y audio, mantener esas torres en BF16 sugiere que el modelo conserva cierta capacidad multimodal aprovechable en demos de imagen + texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 23,3 GB en safetensors, por lo que la inferencia en NVFP4 requiere del orden de 24 GB de VRAM para pesos, mas KV cache. Con `--kv-cache-dtype fp8` y 32k de contexto, conviene reservar 32-40 GB en funcion del batch y la longitud de secuencia.
- GPU recomendadas: NVFP4 se ejecuta de forma nativa en Blackwell (RTX 5090, RTX PRO 6000, B200). En Hopper la model card recomienda usar la build FP8 en su lugar.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) con contexto moderado y batch pequeno; en GPUs Ampere o Ada no hay soporte nativo NVFP4 y el rendimiento sera deficiente o requerira conversion.
- Opciones de despliegue: vLLM es el camino documentado (`vllm serve ... --max-model-len 32768 --kv-cache-dtype fp8 --reasoning-parser gemma4 --enable-auto-tool-choice --tool-call-parser gemma4`). Otros runners (llama.cpp, Ollama, TGI) no estan documentados para este checkpoint NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wicked-Stuff-31B-Final-NVFP4-W4A4 | 19,87B (safetensors) | 32.768 (segun ejemplo vLLM) | NVFP4 W4A4 | Apache 2.0 | Hugging Face, 22 descargas |
| ReadyArt/Wicked-Stuff-31B-Final (base) | no disponible | no disponible | BF16 | no disponible en esta ficha | Hugging Face |
| Build FP8 del mismo modelo | no disponible | no disponible | FP8 | no disponible | mencionada en la model card, no enlazada |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion W4A4 en pesos y activaciones es agresiva; aunque la calibracion sea de dominio, puede degradar tareas fuera del roleplay (codigo, matematicas, razonamiento formal) mas que una cuantizacion solo de pesos.
- La calibracion con 128 muestras de roleplay multi-turno introduce sesgo de dominio: el modelo puede comportarse peor en dominios no representados.
- El checkpoint solo funciona de forma nativa en Blackwell; en Hopper, Ampere o Ada el rendimiento y la compatibilidad no estan garantizados.
- No hay benchmarks publicados, por lo que no se puede cuantificar la perdida de calidad frente al modelo base en BF16.
- Riesgo de alusiones y desviaciones propias de un fine-tune de roleplay; no se documentan filtros de seguridad ni evaluaciones de sesgo.
- Idiomas soportados no documentados; no se debe asumir un rendimiento multilingue sin evaluacion previa.
- La licencia es Apache 2.0, lo que permite uso comercial, pero el modelo base y los datos de calibracion pueden tener condiciones adicionales no reflejadas en esta ficha.
- El nombre comercial "31B" no coincide con los 19,87B declarados en safetensors; verificar el conteo real antes de dimensionar infraestructura.
- Volumen de descargas muy bajo (22) y sin likes: no hay evidencia de comunidad ni de validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tacodevs/Wicked-Stuff-31B-Final-NVFP4-W4A4
- Modelo base: https://huggingface.co/ReadyArt/Wicked-Stuff-31B-Final
- Dataset de calibracion: https://huggingface.co/datasets/Gryphe/Sonnet3.5-Charcard-Roleplay
- llm-compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- vLLM: https://github.com/vllm-project/vllm
