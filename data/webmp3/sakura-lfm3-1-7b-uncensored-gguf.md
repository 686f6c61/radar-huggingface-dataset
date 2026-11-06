# webmp3/Sakura-LFM3-1.7B-Uncensored-GGUF

## Resumen

Sakura-LFM3-1.7B-Uncensored-GGUF es una version modificada del modelo LiquidAI/LFM3-1.7B, desarrollado originalmente por Liquid AI, publicada por el usuario webmp3. El modelo base es un transformer hibrido de 1.728.801.600 parametros que combina capas de convolucion y atencion. La modificacion consiste en una edicion de pesos mediante una tecnica de abliteration (eliminacion de una direccion de rechazo en parte de las matrices de pesos) con el objetivo de reducir la tasa de negativas del modelo ante peticiones que el original rechazaria.

El modelo se distribuye unicamente en formato GGUF cuantizado a Q8_0 (1,72 GiB), generado con llama.cpp build b12058, que es la version minima necesaria porque la arquitectura `lfm3` no esta soportada en builds anteriores. El modelo conserva el modo de razonamiento previo a la respuesta del original, que puede desactivarse mediante `chat_template_kwargs` con `{"enable_thinking": false}`.

La relevancia de esta ficha es doble: por un lado documenta un modelo pequeno (1,7B) con arquitectura hibrida convolucion-atencion y soporte para 16 idiomas; por otro, advierte de que se trata de una modificacion no oficial, sin benchmarks de capacidad medidos, con licencia LFM Open License v1.0 que restringe el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dolares, y con implicaciones eticas y legales que el usuario debe asumir.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con capas de convolucion y atencion (lfm3) |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de ejecucion usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado) |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (lfm1.0); uso comercial limitado a organizaciones con ingresos anuales < 10 M USD |
| Formato de pesos | GGUF (archivo `Sakura-LFM3-1.7B-Uncensored-Q8_0.gguf`, 1,72 GiB) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura hibrida que combina capas convolucionales con capas de atencion, segun indica la model card del autor de la modificacion. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La modificacion realizada por webmp3 consiste en una edicion de pesos mediante abliteration sobre el checkpoint original `LiquidAI/LFM3-1.7B` (revision `ac2586a3`): se elimina una direccion de rechazo de parte de las matrices de pesos, con hiperparametros elegidos y ajustados por el autor. Segun la model card, todos los demas tensores permanecen sin cambios y se compararon tensor a tensor contra el original. La conversion a GGUF se realizo con llama.cpp b12058 y la cuantizacion a Q8_0 se hizo sin importance matrix. El modelo conserva el comportamiento de razonamiento previo a la respuesta del original (thinking mode), desactivable por parametro.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento previo a la respuesta (thinking mode) activado por defecto, desactivable con `{"enable_thinking": false}`.
- Soporte multilingue declarado para 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Generacion de codigo (se probo un prompt de codigo en ingles con resultado coherente, aunque sin benchmark formal).
- Reduccion de negativas ante peticiones consideradas daninas por el modelo original: 10/104 negativas estrictas frente a 101/104 del original sin modificar.
- No se documenta soporte de tool calling, function calling, agentes ni vision en la informacion disponible para esta variante (existe una variante VL separada, Sakura-LFM3-VL-2B-Uncensored-GGUF).

## Casos de uso

- Generacion creativa de ficcion y narrativa para adultos: el modelo reduce las negativas ante contenido sensible, lo que lo hace util para escritura creativa sin filtros excesivos, siempre que el usuario asuma la responsabilidad legal y etica del contenido generado.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio para medir como cambia el comportamiento de rechazo de un modelo tras editar sus pesos, con la salvedad de que las metricas del autor se obtuvieron sobre 100 de los 104 prompts usados para ajustar el procedimiento.
- Experimentacion local en hardware de consumo: con 1,72 GiB en Q8_0, el modelo cabe en GPUs consumer con 4 GB o mas de VRAM y permite iterar rapidamente en tareas de generacion de texto.
- Prototipado de asistentes conversacionales multilingues: el soporte declarado de 16 idiomas permite probar conversaciones en espanol, aleman o chino, aunque el autor solo verifico coherencia con un prompt por idioma.
- Analisis de robustez de sistemas de moderacion: al conocerse la tasa de negativas estricta (10/104) y la de marcadores por palabras clave (39/104), se puede usar como entrada para evaluar clasificadores de contenido danino.
- Evaluacion de la degradacion por cuantizacion y edicion de pesos: la model card publica divergencia KL (0,00188 en texto held-out en ingles y 0,00245 en texto web) y perplexity (10,12 frente a 10,09 y 31,97 frente a 31,86), lo que permite estudiar el impacto de la edicion sobre texto ordinario.
- Despliegue ligero con llama.cpp: el comando `llama-server -m ... --jinja -ngl 99 -c 8192` documentado por el autor permite levantar un servidor compatible con la API de OpenAI en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor lo indica explicitamente: "Not measured: any capability benchmark, refusals in other languages, with a system prompt or on other prompt sets, multi-turn chats, long context, speed".

Las unicas metricas publicadas son de rechazo y de divergencia respecto al modelo original:

| Metrica | Modelo sin modificar (Q8_0) | Este repositorio (Q8_0) |
|---|---:|---:|
| Negativas estrictas (104 prompts daninos) | 101 / 104 | 10 / 104 |
| Marcadores por palabras clave (33 frases) | 102 / 104 | 39 / 104 |
| KL divergencia, heldout_en_mix | referencia | 0,00188 ± 0,00003 |
| KL divergencia, mixedweb-v1 | referencia | 0,00245 ± 0,00003 |
| Coincidencia de top token, heldout_en_mix | referencia | 97,9 % |
| Coincidencia de top token, mixedweb-v1 | referencia | 97,1 % |
| Perplexity, heldout_en_mix | 10,09 | 10,12 |
| Perplexity, mixedweb-v1 | 31,86 | 31,97 |

Advertencia del autor: 100 de los 104 prompts de prueba son los mismos contra los que se ajusto el procedimiento de edicion, por lo que las cifras de rechazo no reflejan el comportamiento ante prompts no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8-2,5 GB con Q8_0 (archivo de 1,72 GiB mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090); tambien A100 o H100 para despliegues multi-instancia.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 4 GB o mas.
- Opciones de despliegue: llama.cpp (build b12058 o superior, imprescindible por la arquitectura `lfm3`), `llama-server` con soporte de plantilla Jinja y `-ngl 99` para offload completo a GPU. No se documenta soporte en vLLM, TGI ni Ollama en la informacion proporcionada.
- Latencia y throughput: no disponibles; el autor no midio velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Sakura-LFM3-1.7B-Uncensored-GGUF (este) | 1,73 B | no disponible | GGUF Q8_0 | LFM Open License v1.0 (< 10 M USD ingresos) | Abliterated, sin benchmarks de capacidad |
| LiquidAI/LFM3-1.7B (original) | 1,73 B | no disponible | safetensors / GGUF | LFM Open License v1.0 | Modelo base sin modificar; 101/104 negativas estrictas |
| webmp3/Sakura-LFM3-VL-2B-Uncensored-GGUF | no disponible | no disponible | GGUF | no disponible | Variante vision-lenguaje del mismo autor |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de capacidad con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo no oficial: Liquid AI no participa en la modificacion y no respalda esta variante.
- Sin benchmarks de capacidad: no hay datos de MMLU, HumanEval, GSM8K ni similares; el autor solo verifico coherencia en tres prompts (aleman, codigo en ingles y chino).
- Las cifras de rechazo se midieron sobre 100 de los 104 prompts usados para ajustar el procedimiento, por lo que no son representativas de prompts no vistos.
- Solo se midieron negativas en ingles, sin system prompt, con thinking desactivado, temperatura 0 y hasta 300 tokens; no se midieron otros idiomas, multi-turno, contexto largo ni velocidad.
- El modelo sigue rechazando algunas peticiones (10/104 estrictas, 39/104 por palabras clave), y las respuestas que no son negativas no necesariamente cumplen lo solicitado.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es un modelo de 1,7B, con la capacidad limitada que ello implica.
- Restriccion de licencia: LFM Open License v1.0 limita el uso comercial a organizaciones con ingresos anuales inferiores a 10 millones de dolares, con excepciones detalladas en el archivo LICENSE.
- Contenido para adultos: el autor declara "for adults only" y advierte de que el usuario es responsable del contenido generado y de las leyes aplicables.
- Requiere un build de llama.cpp que conozca la arquitectura `lfm3` (b12058 o superior); builds anteriores fallaran.
- El modelo razona antes de responder por defecto, lo que incrementa el consumo de tokens; es necesario desactivar el thinking para respuestas directas.
- El autor no midio la calidad de las respuestas mas alla de una lectura parcial, ni comparo con el modelo original en conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-LFM3-1.7B-Uncensored-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Variante vision-lenguaje del mismo autor: https://huggingface.co/webmp3/Sakura-LFM3-VL-2B-Uncensored-GGUF
- llama.cpp (conversion, cuantizacion y medicion): https://github.com/ggml-org/llama.cpp
- Dataset de prompts daninos usado en la medicion: `mlabonne/harmful_behaviors` (referenciado en la model card)
- Licencia LFM Open License v1.0: archivo `LICENSE` incluido en el repositorio
