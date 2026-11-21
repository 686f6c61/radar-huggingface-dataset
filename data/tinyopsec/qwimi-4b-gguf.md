# tinyopsec/Qwimi-4B-GGUF

## Resumen

Qwimi-4B-GGUF es la distribucion en formato GGUF de Qwimi-4B, un modelo de lenguaje de aproximadamente 4.022 millones de parametros derivado de Qwen3-4B-Instruct-2507 y destilado a partir de Kimi K2 con el objetivo especifico de mejorar las capacidades de tool calling y comportamiento agentico. Lo publica el usuario tinyopsec en Hugging Face bajo licencia Apache 2.0, y el modelo base es Rumiii/Qwimi-4B. La relevancia de esta publicacion radica en que ofrece el modelo en 13 niveles de cuantizacion (desde F16 hasta Q2_K), lo que permite desplegarlo en hardware de consumo con llama.cpp, Ollama, LM Studio o koboldcpp.

El modelo hereda la arquitectura transformer de Qwen3-4B, con aproximadamente 4.000 millones de parametros totales, y anade mediante destilacion las capacidades de razonamiento y uso de herramientas propias de modelos mucho mayores como Kimi K2. Esto lo posiciona como una opcion compacta para pipelines de agentes donde el coste por token y los requisitos de VRAM son criticos.

La ficha tecnica disponible es limitada: la model card no detalla la longitud de contexto, los idiomas soportados ni los datos de entrenamiento especificos de la destilacion. La informacion sobre benchmarks tampoco se ha publicado en los materiales proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (13 ficheros); repo de 39,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~4B parametros basado en Qwen3-4B-Instruct-2507. Sobre esa base, el autor del modelo original (Rumiii/Qwimi-4B) aplico un proceso de destilacion a partir de Kimi K2 orientado especificamente a tool calling y comportamiento agentico. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset de destilacion ni si se emplearon tecnicas de RLHF o DPO adicionales.

La publicacion de tinyopsec consiste en la conversion y cuantizacion del modelo base a GGUF mediante llama.cpp, generando 13 variantes que cubren desde precision completa (F16, ~8 GB) hasta 2 bits (Q2_K). No se documentan innovaciones arquitectonicas adicionales (atencion lineal, decodificacion especulativa ni modos de pensamiento explicitos) mas alla de las heredadas de Qwen3.

## Capacidades

- Generacion de texto conversacional en formato chat.
- Tool calling / function calling, capacidad destacada como objetivo principal de la destilacion desde Kimi K2.
- Comportamiento agentico y razonamiento multi-paso orientado a uso de herramientas.
- Razonamiento y generacion de codigo (heredados de la base Qwen3-4B-Instruct-2507).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y runtimes GGUF estandar.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Modo thinking, vision o audio: no documentados.

## Casos de uso

- Agentes de tool calling en produccion: el modelo esta destilado especificamente para invocar funciones y APIs, por lo que encaja en orquestadores de agentes que necesitan un modelo compacto con latencia baja y buena adherencia al esquema de herramientas.
- Automatizacion de flujos con function calling en local: al disponer de cuantizaciones Q4_K_M (~2,5 GB estimados) y Q5_K_M, puede ejecutarse en estaciones de trabajo sin GPU dedicada y usarse para tareas de enrutamiento de llamadas a APIs internas.
- Prototipado rapido de asistentes conversacionales: la variedad de cuantizaciones permite iterar en portatiles con Ollama o LM Studio antes de escalar a un despliegue mayor.
- Pipelines de CI/CD para pruebas de agentes: al ser Apache 2.0 y ejecutable con llama.cpp, puede integrarse como modelo de referencia en tests automatizados de herramientas y esquemas de function calling sin coste de API.
- Despliegue en entornos con VRAM limitada: la version Q2_K o Q3_K_S permite ejecucion en GPUs de gama baja o incluso CPU, util para demos y entornos de desarrollo.
- Evaluacion comparativa de destilaciones: sirve como punto de comparacion frente a Qwen3-4B original para medir la ganancia en tool calling aportada por la destilacion desde Kimi K2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun tamano y cuantizacion, no confirmada por el autor):
  - F16: ~8 GB.
  - Q8_0: ~4,3 GB.
  - Q6_K: ~3,3 GB.
  - Q5_K_M: ~2,9 GB.
  - Q4_K_M (recomendada): ~2,5 GB.
  - Q3_K_M: ~2,0 GB.
  - Q2_K: ~1,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M; RTX 3060/4060, RTX 4090, A100 o H100 para despliegues de mayor concurrencia. Tambien viable en CPU.
- Cabe en GPU de consumo: si, desde GPUs de 4-6 GB en cuantizaciones Q4 y Q3.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwimi-4B-GGUF | ~4B | no disponible | Tool calling agentico (destilado de Kimi K2) | Apache 2.0 | GGUF |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible en esta ficha | Instruccion general | Apache 2.0 | safetensors, GGUF |
| Rumiii/Qwimi-4B | ~4B | no disponible | Modelo base sin cuantizar | Apache 2.0 | safetensors |

La comparativa se limita a los modelos directamente relacionados en la informacion disponible; no se dispone de datos de rendimiento para contrastar con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card incluye un aviso explicito: "Agentic tool-calling model. Evaluate before use", lo que recomienda evaluacion previa antes de produccion.
- No se documentan sesgos conocidos, pero al derivar de Qwen3 y de una destilacion desde Kimi K2 puede heredar sesgos de ambos.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados que lo midan.
- Longitud de contexto e idiomas soportados no documentados: no se puede garantizar comportamiento multilingue ni conversaciones de contexto largo.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3-4B-Instruct-2507 y del autor original Rumiii/Qwimi-4B antes de uso comercial.
- Las estimaciones de VRAM son aproximadas y no confirmadas por el autor; el rendimiento real depende del runtime y del backend.
- El modelo tiene 0 likes y 729 descargas en el momento de la ficha: comunidad pequena, sin validacion externa extensa.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tinyopsec/Qwimi-4B-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwimi-4B
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
