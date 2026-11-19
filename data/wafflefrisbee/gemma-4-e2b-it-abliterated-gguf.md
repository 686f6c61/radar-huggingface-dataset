# wafflefrisbee/gemma-4-E2B-it-abliterated-GGUF

## Resumen

`wafflefrisbee/gemma-4-E2B-it-abliterated-GGUF` es una cuantizacion en formato GGUF del modelo `wafflefrisbee/gemma-4-E2B-it-abliterated`, una variante "abliterated" (con los mecanismos de rechazo atenuados mediante edicion de pesos) de un modelo de la familia Gemma 4 de Google, en su variante E2B (orientada a eficiencia) y ajustada para instrucciones ("it"). El autor de la cuantizacion y del modelo derivado es el usuario de Hugging Face `wafflefrisbee`, no Google. El repositorio contiene pesos en formato GGUF pensados para su uso con llama.cpp y aplicaciones compatibles.

El modelo resuelve un caso de uso muy concreto: ofrecer una variante de Gemma 4 E2B con menor tasa de rechazos ante peticiones consideradas "edge" o sensibles, empaquetada en cuantizaciones ligeras (Q4_K_M de 3,2 GB y Q8_0 de 4,7 GB) que caben en hardware de consumo. Segun la model card, el modelo base rechaza 55 de 84 prompts de prueba, mientras que las cuantizaciones abliterated reducen esa cifra a 1 de 84. Es relevante ahora por dos motivos: la aparicion de la familia Gemma 4 y la demanda de variantes sin censura para experimentacion e investigacion sobre alineacion y comportamiento de rechazo.

La informacion disponible es escasa: no se detallan idiomas soportados, arquitectura interna, longitud de contexto ni datos de entrenamiento mas alla de lo que se infiere de la familia Gemma 4. Los parametros totales reportados en safetensors son 4.647.450.147 (aproximadamente 4,65 mil millones), lo que sugiere que la etiqueta "E2B" no implica un modelo de 2B efectivos sino una variante de eficiencia dentro de la familia. No debe confundirse esta cifra con parametros activos de un MoE, ya que no hay evidencia de que lo sea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; detalles no publicados en la informacion disponible) |
| Parametros totales | 4.647.450.147 (segun safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (4,7 GB) y Q4_K_M (3,2 GB) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (texto unicamente, sin mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo pertenece a la familia Gemma 4 de Google, y la variante E2B apunta a un diseno orientado a eficiencia. El repositorio es una cuantizacion GGUF del modelo `wafflefrisbee/gemma-4-E2B-it-abliterated`, que a su vez deriva de un Gemma 4 E2B ajustado para instrucciones. La model card indica explicitamente que el metodo de abliteration y sus resultados estan documentados en la pagina del modelo base, no en este repositorio.

El proceso de "abliteration" consiste en identificar y atenuar la direccion de activacion asociada al rechazo en los pesos del modelo, de modo que el modelo deja de producir respuestas de negativa ante ciertas peticiones. Segun la model card, el modelo base rechaza 55 de 84 prompts de prueba y las cuantizaciones abliterated reducen la tasa a 1 de 84; la cuantizacion Q4_K_M anade "algunos descargos de responsabilidad suaves mas" sin adoptar una persona concreta. No se detallan tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato chat, con soporte de plantilla Jinja (`--jinja`).
- Reduccion drastica de rechazos ante prompts considerados sensibles o "edge" (1 de 84 frente a 55 de 84 del modelo base, segun la model card).
- Compatibilidad con el servidor OpenAI-compatible de llama.cpp (`llama-server`), lo que permite integrarlo en aplicaciones que usan la API de chat completions.
- Soporte de system prompt para definir personas (la model card incluye un ejemplo con una persona de "roast" llamada `shrek.txt`).
- Inferencia en CPU y GPU mediante llama.cpp (`-ngl 999` para descarga completa en GPU, o sin esa bandera para CPU).
- Soporte de Flash Attention en llama.cpp (`-fa on`).
- Solo texto: no incluye proyector multimodal (`mmproj`), por lo que no hay capacidades de vision.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni multilingues en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo permite estudiar como varia la tasa de negativas ante prompts sensibles en funcion de la cuantizacion (Q8_0 frente a Q4_K_M), util para analizar el efecto de la cuantizacion sobre el comportamiento de seguridad.
- Experimentacion con personas y estilo: gracias al soporte de system prompt, se puede usar para generar respuestas con un tono o personaje concreto (por ejemplo, el ejemplo de "roast" de la model card) en entornos de prueba.
- Prototipado local en hardware de consumo: con 3,2 GB en Q4_K_M, cabe en GPUs consumer y permite iterar rapidamente en un portatil o estacion de trabajo sin infraestructura dedicada.
- Servicio local OpenAI-compatible: `llama-server` expone un endpoint compatible con la API de chat completions, lo que facilita integrarlo en herramientas que ya hablan ese protocolo sin cambiar el codigo cliente.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece dos niveles de cuantizacion con tamanos y tasas de rechazo documentadas, lo que permite medir el compromiso entre calidad, tamano y comportamiento.
- Generacion de texto creativo sin restricciones en entornos controlados: para escritura de ficcion o guiones donde se busca un tono directo, siempre que el uso cumpla con la licencia y la legislacion aplicable.
- Pruebas de robustez y red teaming: util para estudiar como responde un modelo abliterated a ataques de prompt y compararlo con el modelo base.

## Benchmarks y rendimiento

La model card solo reporta la tasa de rechazos sobre 84 prompts "edge" con temperatura 0 y coincidencia de frases:

| Modelo / cuantizacion | Rechazos (de 84) | Tamano |
|---|---|---|
| Modelo base (sin abliteration) | 55 | no disponible |
| `gemma-4-E2B-it-abliterated-Q8_0.gguf` | 1 | 4,7 GB |
| `gemma-4-E2B-it-abliterated-Q4_K_M.gguf` | 1 (con mas descargos suaves) | 3,2 GB |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,2 GB para Q4_K_M y 4,7 GB para Q8_0, mas el overhead de contexto y del runtime de llama.cpp.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M con contexto moderado; 8 GB o mas para Q8_0. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM para Q4_K_M; para Q8_0 conviene 8-12 GB.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`), y aplicaciones compatibles como LM Studio. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La model card sugiere `-ngl 999` para descarga completa en GPU y `-fa on` para Flash Attention, pero no aporta cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones suficientes para comparar con alternativas concretas de la misma categoria. La unica comparacion documentada es interna al propio repositorio:

| Modelo | Parametros | Contexto | Rechazos (84 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| `gemma-4-E2B-it-abliterated` (Q8_0) | 4,65 B (base) | no disponible | 1 | apache-2.0 | GGUF |
| `gemma-4-E2B-it-abliterated` (Q4_K_M) | 4,65 B (base) | no disponible | 1 (con descargos) | apache-2.0 | GGUF |
| Modelo base sin abliteration | no disponible | no disponible | 55 | apache-2.0 | no disponible |

No se identifican en la informacion proporcionada modelos comparables de terceros con datos verificables.

## Limitaciones y advertencias

- La abliteration elimina o atenua los mecanismos de rechazo, lo que puede facilitar la generacion de contenido danino, ofensivo o inexacto. No es un modelo adecuado para produccion sin filtros adicionales.
- La tasa de rechazo se midio con 84 prompts y temperatura 0 mediante coincidencia de frases; es una metrica limitada y no equivale a una evaluacion de seguridad exhaustiva.
- La cuantizacion Q4_K_M introduce descargos de responsabilidad suaves adicionales respecto a Q8_0, lo que puede afectar a la coherencia del estilo.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero presente en cualquier modelo de lenguaje de este tamano.
- Limitaciones de contexto e idioma: no documentadas. No se especifica la ventana de contexto ni la lista de idiomas soportados.
- Restricciones de licencia: la model card declara apache-2.0 pero enlaza a la licencia de Gemma 4 de Google; conviene revisar ambas antes de un uso comercial, ya que los terminos de Gemma pueden imponer condiciones adicionales.
- El modelo es solo texto (sin `mmproj`), por lo que no admite entrada de imagenes.
- Requiere una version reciente de llama.cpp con soporte para Gemma 4; versiones antiguas pueden no cargar los pesos correctamente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo dia: no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wafflefrisbee/gemma-4-E2B-it-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/wafflefrisbee/gemma-4-E2B-it-abliterated
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Persona de ejemplo (`shrek.txt`): https://huggingface.co/wafflefrisbee/gemma-4-E2B-it-abliterated-GGUF/resolve/main/shrek.txt
