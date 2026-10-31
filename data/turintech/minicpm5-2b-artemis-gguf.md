# turintech/MiniCPM5-2B-Artemis-GGUF

## Resumen

MiniCPM5-2B-Artemis-GGUF es una versión cuantizada en formato GGUF del modelo MiniCPM5-2B de OpenBMB, comprimida con la tecnología de cuantización Artemis de TurinTech. El objetivo del trabajo es reducir el tamaño en memoria del modelo (de 5,2 GiB a 2,2 GiB en GPU) manteniendo e incluso mejorando el rendimiento en tareas clave como llamadas a herramientas, matemáticas y seguimiento de instrucciones. Está orientado a ejecución local: chat, tool calling y razonamiento matemático en equipos de consumo.

El modelo base es un LLM conversacional compacto de unos 2.500 millones de parámetros, y esta variante usa cuantización Q4_K_S con matriz de importancia (imatrix), lo que permite que quepa con holgura en GPUs de consumo o incluso en CPUs. TurinTech declara que su archivo cuantizado supera tanto al original BF16 como a otras cuantizaciones públicas del mismo modelo en varios benchmarks, algo notable dado el tamaño reducido. Incluye modo de razonamiento (thinking) activado por defecto, desactivable por petición. Se distribuye bajo licencia Apache 2.0 y puede ejecutarse con llama.cpp, Ollama y LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles adicionales no disponibles) |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | 8.192 tokens (según el comando de ejemplo del autor; límite nativo no disponible) |
| Tipos de cuantizacion | Q4_K_S con imatrix (Artemis); se referencia también Q4_K_M de OpenBMB |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es MiniCPM5-2B, un transformer conversacional de OpenBMB; los detalles concretos de su arquitectura (número de capas, dimensiones, mecanismos de atención) no están disponibles en la información proporcionada. Sobre ese modelo base, TurinTech aplica su pipeline de cuantización Artemis, que selecciona el archivo cuantizado óptimo mediante un proceso de evaluación; el autor indica que el registro de cómo se eligió el archivo no incluye los conjuntos de test usados en los resultados publicados, lo que reduce el riesgo de sobreajuste a los benchmarks.

Los datos de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO) no están disponibles en esta ficha. Lo que sí está documentado es el proceso de cuantización: se usa Q4_K_S con imatrix, y el resultado pesa 1,53 GB frente a los 5,04 GB del original BF16. El modelo incorpora modo de razonamiento (thinking) activado por defecto, controlable mediante `chat_template_kwargs: {"enable_thinking": false}`.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, formato chat).
- Function calling / tool calling: soporte nativo vía endpoint `/v1/chat/completions` con lista `tools`; las llamadas se devuelven en `choices[0].message.tool_calls`. Requiere la flag `--jinja` en llama.cpp.
- Razonamiento matemático: buen rendimiento declarado en GSM8K (209/250 en la variante Artemis).
- Seguimiento de instrucciones: 458/539 en IFEval.
- Modo thinking: razonamiento extendido activado por defecto, desactivable por petición.
- Ejecución local eficiente: 2,2 GiB de memoria GPU frente a 5,2 GiB del original.
- Capacidades multilingües: no disponible.

## Casos de uso

- Chatbots locales que llaman a herramientas: con soporte de tool calling en formato OpenAI y solo 2,2 GiB de VRAM, es adecuado para asistentes que consultan APIs locales (calendarios, bases de datos, home automation) sin depender de la nube.
- Agentes ligeros en máquina: su tamaño permite ejecutar un agente de varios pasos junto a otras aplicaciones en un portátil con GPU de 4-6 GB, usando llama-server como backend OpenAI-compatible.
- Asistente matemático offline: con 209/250 en GSM8K, sirve para resolver problemas de aritmética y razonamiento numérico de nivel escolar en entornos sin conexión.
- Prototipado de pipelines con LLM: al exponer una API compatible con OpenAI (llama-server), se integra directamente en LangChain, LlamaIndex o scripts con el SDK de OpenAI para desarrollo y pruebas.
- Automatización con extracción estructurada: el buen resultado en IFEval (458/539) indica buen seguimiento de restricciones de formato, útil para tareas que exigen salidas JSON o respuestas con estructura fija.
- Despliegue en dispositivos de borde: el peso de 1,53 GB y la compatibilidad con Ollama y LM Studio facilitan su uso en estaciones de trabajo compactas (el autor menciona pruebas en GB10) y equipos sin GPU dedicada potente.
- Atención al cliente de bajo volumen: gestionando conversaciones multi-turno con contexto de 8.192 tokens y llamadas a herramientas para consultar pedidos o estados, en instalaciones on-premise donde no se pueden enviar datos a terceros.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech), no verificados de forma independiente. Comparativa incluida en la model card:

| Archivo | Tamaño | Tool calls BFCL live (de 258) | GSM8K (de 250) | MMLU-Pro (de 280) | IFEval (de 539) |
|---|---|---|---|---|---|
| TurinTech Q4_K_S (Artemis) | 1,53 GB | 184 | 209 | 95 | 458 |
| bartowski Q4_K_S | 1,53 GB | 173 | 206 | 84 | 468 |
| OpenBMB Q4_K_M | 1,56 GB | 160 | 179 | 87 | 460 |
| BF16 original | 5,04 GB | 181 | 193 | 92 | 462 |

Notas del autor: tras corregir por 16 comparaciones planificadas, dos diferencias se mantienen estadísticamente, ambas frente al Q4_K_M oficial de OpenBMB: tool calls (184 frente a 160) y GSM8K (209 frente a 179). Parte de la ventaja proviene del formato de respuesta (el archivo de OpenBMB no emitió tool call 46 veces, el de TurinTech 23; en GSM8K con límite de 768 tokens, 151 respuestas de OpenBMB se cortaron frente a 70). Con una evaluación más estricta de GSM8K (4.096 tokens, solo respuestas completas), el resultado fue 215/250 frente a 180. Todos los resultados se midieron con el modo thinking desactivado.

## Requisitos de hardware

- Memoria GPU: 2,2 GiB para la variante Q4_K_S (frente a 5,2 GiB del original BF16); el archivo pesa 1,53 GB en disco.
- GPUs recomendadas: cualquier GPU de consumo con 4 GB de VRAM o más es suficiente con margen; no se requieren A100 ni H100. El autor menciona pruebas en hardware GB10.
- Consumer GPUs: cabe con holgura en RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU dada su cuantización de 4 bits.
- Despliegue: llama.cpp (b11617 o más nuevo, con `--jinja`), Ollama (`ollama run turintech/minicpm5-2b-artemis`), LM Studio (`turintech/minicpm5-2b-artemis`), o descarga directa del GGUF con `hf download`.
- Ejemplo de arranque: `llama-server -hf turintech/MiniCPM5-2B-Artemis-GGUF:Q4_K_S --jinja -c 8192`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Tool calling | Licencia |
|---|---|---|---|---|---|
| MiniCPM5-2B-Artemis-GGUF (este) | 2.516 M | GGUF Q4_K_S | 8.192 tokens (según ejemplo) | Sí, nativo | Apache 2.0 |
| MiniCPM5-2B BF16 (OpenBMB) | 2.516 M | BF16 / GGUF Q4_K_M | no disponible | Sí | Apache 2.0 |
| bartowski MiniCPM5-2B Q4_K_S | 2.516 M | GGUF Q4_K_S | no disponible | Sí | Apache 2.0 |
| Qwen2.5-3B-Instruct | ~3.000 M | safetensors / GGUF | hasta 32.768 tokens | Sí | Qwen license (restricciones comerciales en algunos casos) |

En su categoría (modelos de ~2-3B cuantizados para uso local), el diferencial declarado de la variante Artemis es la calidad de la cuantización: supera al BF16 original en tool calls y GSM8K según los datos del autor, con menos de la mitad de memoria.

## Limitaciones y advertencias

- Los benchmarks provienen del propio autor y no están verificados de forma independiente; el autor reconoce que parte de las diferencias en GSM8K y tool calls dependen del formato de respuesta y de los límites de tokens, no solo de la calidad del modelo.
- Los resultados se midieron con el thinking desactivado; con el modo thinking activado (por defecto) el comportamiento y la latencia pueden variar.
- El contexto de 8.192 tokens del ejemplo es modesto frente a otros modelos actuales; el límite nativo real no está disponible en la información proporcionada.
- Idiomas soportados no disponibles: no hay garantía documentada de rendimiento en castellano; conviene validar el comportamiento multilingüe antes de producción.
- Riesgo de alucinación: no disponible como dato específico, pero al ser un modelo de 2B debe tratarse como cualquier LLM pequeño, con verificación de salidas en tareas críticas.
- Sesgos conocidos: no disponible.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, aunque la model card enlaza a la licencia general del repositorio MiniCPM de OpenBMB; conviene revisarla para casos de redistribución.
- Requiere llama.cpp b11617 o más reciente y la flag `--jinja` para que funcione el tool calling.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/turintech/MiniCPM5-2B-Artemis-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Licencia (repositorio MiniCPM de OpenBMB): https://github.com/OpenBMB/MiniCPM/blob/main/LICENSE
- Ollama: https://ollama.com/turintech/minicpm5-2b-artemis
- LM Studio: https://lmstudio.ai/turintech/minicpm5-2b-artemis
- TurinTech: https://www.turintech.ai
- TurinTech en HuggingFace: https://huggingface.co/turintech
- TurinTech en LinkedIn: https://www.linkedin.com/company/turintechai
- Sección de resultados en la model card: https://huggingface.co/turintech/MiniCPM5-2B-Artemis-GGUF#results
