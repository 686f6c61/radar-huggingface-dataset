# yamz-labs/Nanbeige4.3-33B-EXL3-Yamz

## Resumen

Nanbeige4.3-33B-EXL3-Yamz es una cuantización EXL3 a 4,0 bits por peso del modelo Nanbeige4.3-33B, un modelo denso de la familia Nanbeige orientado a agentes y programación, realizada por Yamz Labs. El modelo base es un transformer tipo Llama de 33,1 mil millones de parámetros, y esta conversión permite ejecutarlo en una única GPU de consumo de 24 GB (probada en RTX 3090) con el motor Kyojin, alcanzando hasta unos 77K tokens de contexto con caché KV de 6 bits.

La relevancia de esta ficha de pesos radica en el equilibrio entre calidad de cuantización y requisitos de hardware: frente al checkpoint BF16 original, la conversión mantiene una divergencia KL media de 0,086 y un acuerdo top-1 del 90,6 % sobre seis tipos de texto. En tareas de agente reales (con herramientas de shell y ficheros), resuelve 24 de 30 tareas estándar y 10 de 14 tareas difíciles, con soporte de tool calling y razonamiento (`<think>`) expuestos vía API estilo OpenAI.

El modelo es bilingüe (inglés y chino) y se distribuye bajo licencia Apache 2.0, lo que lo hace apto para uso comercial. Su despliegue depende del motor Kyojin (construido sobre ExLlamaV3), ya que otros runtimes no están testados por el autor del pack.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (arquitectura detallada no disponible) |
| Parametros totales | 33.100 millones (33,1B); el conteo de la barra lateral de Hugging Face (9.334.250.496) refleja palabras de 16 bits empaquetadas del formato EXL3, no el tamaño real del modelo |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 77.824 tokens servidos con caché KV de 6 bits (110.592 con 4 bits, no recomendado); recomendado 65.536 para servidor estable |
| Tipos de cuantización | EXL3 4,0 bpw en todas las capas lineales; cabeza de salida a 6 bits; embeddings en fp16; caché KV recomendada 6/6 bits |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato EXL3 (18,7 GB en 3 shards; 17,4 GiB de VRAM antes de caché) |

## Arquitectura y entrenamiento

Nanbeige4.3-33B es un modelo denso (no MoE) con arquitectura tipo Llama, etiquetado por su autor como modelo para agentes y programación. Los detalles internos de la arquitectura (número de capas, cabezas de atención, tipo de atención) no están disponibles en la información proporcionada.

Sobre el entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no hay datos publicados en la información disponible. En cuanto al proceso de cuantización, Yamz Labs documenta que se trata de una conversión EXL3 propia ejecutada sobre el checkpoint BF16 original: todas las capas lineales a 4,0 bits por peso, cabeza de salida a 6 bits, embeddings en fp16, con calibración estándar EXL3 (250 filas de 2048 tokens). Es una conversión plana sin asignación de bits por capa, y las herramientas de conversión no son públicas, aunque el motor Kyojin (basado en ExLlamaV3) y los pesos sí lo están.

## Capacidades

- Generación de texto conversacional en inglés y chino, con bloques de razonamiento `<think>` que el servidor Kyojin parsea como `reasoning_content`.
- Programación: resolución de tareas de corrección de bugs, refactoring y análisis de código dentro de flujos de agente.
- Tool calling: el servidor convierte las llamadas a herramientas del modelo en formato OpenAI `tool_calls`, compatible con clientes estándar.
- Trabajo como agente multi-paso: ejecución de tareas multi-turno con herramientas reales de shell y ficheros (24/30 tareas resueltas completamente en las evals del autor).
- Contexto largo: hasta ~77K tokens servidos en una sola GPU de 24 GB con caché KV de 6 bits.
- Capacidades de visión: no disponibles en este pack (el comando de ejemplo incluye `--no-vision`); no consta soporte de audio.

## Casos de uso

- Agentes de desarrollo de software: el modelo puede operar como agente CLI con herramientas de shell y ficheros, resolviendo tareas de corrección de bugs, análisis de logs y refactoring de forma autónoma; es el caso de uso para el que está etiquetado.
- Atención al cliente bilingüe inglés/chino: el servidor Kyojin expone API estilo OpenAI con streaming y soporta varios usuarios simultáneos compartiendo contexto (3 usuarios a 24K tokens cada uno en una RTX 3090).
- Chatbots con razonamiento visible: los bloques `<think>` se exponen como `reasoning_content`, útil para asistentes que muestran el proceso de razonamiento al usuario.
- Procesamiento de documentos largos: con ~77K tokens de contexto servibles, permite resumir o consultar sobre documentos extensos sin infraestructura multi-GPU.
- Integración en pipelines de herramientas: el formato `tool_calls` de OpenAI permite conectarlo a frameworks de agentes (LangChain, clientes MCP, etc.) sin adaptaciones específicas.
- Despliegue autoalojado de bajo coste: cabe en una única GPU de consumo de 24 GB, lo que lo hace viable para equipos pequeños o entornos on-premise sin acceso a aceleradores de datacenter.
- Investigación sobre cuantización: la documentación pública de KL y acuerdo top-1 por dominio lo hace útil como caso de estudio de cuantización EXL3 a 4 bpw.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos publicados por el autor son mediciones de fidelidad de cuantización y evals de agente propias:

**Fidelidad frente al modelo BF16 de referencia:**

| Texto | KL | Top-1 |
|---|---|---|
| Chat, francés | 0,014 | 97,0 % |
| Técnico | 0,016 | 94,5 % |
| Tool calls | 0,026 | 95,1 % |
| Prosa francesa | 0,030 | 92,7 % |
| Código | 0,12 | 94,0 % |
| Enciclopedia | 0,20 | 79,0 % |
| **Media** | **0,086** | **90,6 %** |

**Calidad de la caché KV (teacher-forced, últimos 1024 tras 32K de texto real):**

| Caché KV | KL | Top-1 |
|---|---|---|
| 8/8 bits | 0,042 | 90,4 % |
| 6/6 bits | 0,054 | 89,1 % |
| 4/4 bits | 0,146 | 82,6 % |
| 3/3 bits | 0,367 | 73,4 % |

**Evals de agente (comparativa con Qwen3.8-27B EXL3 4.0 bpw en la misma tarjeta y motor):**

| | Nanbeige4.3-33B EXL3 | Qwen3.8-27B EXL3 |
|---|---|---|
| 30 tareas de agente, resueltas | 24/30 (puntuación media 0,88) | 27/30 (0,96) |
| 14 tareas difíciles con tests ocultos | 10/14 (0,84) | 11/14 (0,87) |
| Tiempo por tarea (30/14 tareas) | 106 s / 675 s | 47 s / 213 s |

## Requisitos de hardware

- VRAM mínima: 17,4 GiB solo para los pesos, antes de cualquier caché KV; en la práctica se necesita una GPU de 24 GB.
- GPU probada: NVIDIA RTX 3090 (24 GB) con Linux y CUDA 13.0. Otras tarjetas NVIDIA (sm_80 o superior), AMD, Apple y CPU no están testadas.
- Contexto en 24 GB: 77.824 tokens para un usuario con caché KV de 6 bits; 73.728 tokens para 3 usuarios; 110.592 tokens con caché de 4 bits (no recomendado por degradación de calidad).
- Para servidores estables bajo carga de agente se recomienda margen: 2 usuarios a 57.344 tokens funcionaron de forma limpia, mientras que 61.440 agotaron la VRAM tras unas 3 horas.
- Rendimiento en RTX 3090: decodificación de 36,7 tok/s para un usuario con 8K de contexto, 108 tok/s agregados para 4 usuarios; prefill de 1.380 tok/s.
- Despliegue: exclusivamente mediante el motor Kyojin (versión 1.7.3 o posterior, extensión CUDA compilada con CUDA 13.0 y torch 2.10 cu130). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI; otros runtimes no están testados.
- Latencia de primer token en prompts muy largos: 93 segundos para un prompt de 76K tokens.

## Comparativa con modelos similares

| | Nanbeige4.3-33B EXL3 (este pack) | Qwen3.8-27B EXL3 4.0 bpw | Nanbeige4.3-33B (BF16 base) |
|---|---|---|---|
| Parámetros | 33,1B | No disponible | 33,1B |
| Tipo | Denso | No disponible | Denso |
| Contexto servible en 24 GB | ~77K (KV 6 bits) | No disponible | Requiere más de una GPU de 24 GB |
| Evals de agente (30 tareas) | 24/30 | 27/30 | No disponible |
| Velocidad en RTX 3090 | 36,7 tok/s (sin draft model) | ~el doble, con draft head | No disponible |
| Licencia | Apache 2.0 | No disponible | Apache 2.0 (según el repo base) |
| VRAM necesaria | 17,4 GiB (pesos) | No disponible | ~66 GB aprox. en BF16 (estimación, no disponible oficialmente) |

La comparativa con Qwen3.8-27B procede de las evals del propio autor del pack, realizadas en la misma tarjeta y motor; los conjuntos de tareas son pequeños y una tarea de diferencia es ruido estadístico, según advierten los propios autores.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No hay documentación sobre sesgos del modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; como todo LLM, puede generar contenido incorrecto, y las tareas de agente con tests ocultos muestran un 26 % de fallos (10/14 resueltas).
- Dominio débil de la cuantización: el texto enciclopédico es el punto más débil (KL 0,20, top-1 79,0 %), y el código presenta valores de KL elevados por algunos tokens atípicos.
- Caché KV: la caché de 4 bits degrada claramente la calidad y la de 3 bits no es usable; usar 6/6 bits.
- Contexto en producción: bajo carga de agente prolongada, configuraciones cercanas al límite de VRAM (61.440 tokens) pueden agotar la memoria tras horas; dejar margen.
- Compatibilidad de runtimes: el pack solo está testado con el motor Kyojin en RTX 3090; no hay garantías para vLLM, llama.cpp, Ollama, TGI, AMD, Apple ni CPU.
- Dependencia de tooling no publicado: las herramientas de conversión EXL3 no son públicas, lo que dificulta reproducir la cuantización.
- Licencia: Apache 2.0, sin restricciones conocidas para uso comercial.
- Velocidad: el modelo razona de forma extensa y decodifica a la mitad de velocidad que Qwen3.8-27B con draft head en la misma tarjeta; algunas tareas fallidas se detuvieron por límite de tiempo.

## Enlaces

- Pack cuantizado: https://huggingface.co/yamz-labs/Nanbeige4.3-33B-EXL3-Yamz
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Motor Kyojin (repositorio): https://github.com/Yamz-Labs/kyojin
- Issues del motor para feedback de rendimiento: https://github.com/Yamz-Labs/kyojin/issues
