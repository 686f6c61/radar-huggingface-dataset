# Unluckkie/Nanbeige-4.2-3B-IK-GGUF

## Resumen

Nanbeige-4.2-3B-IK-GGUF es un conjunto de cuantizaciones GGUF del modelo Nanbeige 4.2 3B, desarrollado por el usuario Unluckkie sobre el modelo base Nanbeige/Nanbeige4.2-3B. El modelo original, de aproximadamente 4.170 millones de parametros totales segun los pesos en safetensors, emplea una arquitectura denominada Looped Transformer en la que 22 capas fisicas se ejecutan dos veces, lo que permite aumentar la profundidad efectiva de computo sin incrementar proporcionalmente el numero de parametros.

La relevancia de esta publicacion reside en dos aspectos. Por un lado, el modelo base se presenta como un especialista en codigo agentico dentro de la categoria sub-4B, con un resultado declarado de 63,6 en SWE-bench Verified, por encima de modelos de mayor tamano como Qwen3.5-9B (53,1) y Spark-X2.6 (59,8) segun la model card. Por otro, estas cuantizaciones estan calibradas especificamente con un imatrix sobre codigo y flujos de tool calling, con el objetivo de preservar la capacidad de resolucion de issues reales de GitHub tras la compresion.

El repositorio ocupa 9,0 GB e incluye tres variantes de cuantizacion (IQ4_KS, IQ5_KS e IQ6_K) pensadas para equipos con entre 4 y 8 GB de RAM. Un detalle critico es que requiere una compilacion reciente de ik_llama.cpp, ya que la arquitectura nanbeige se integro recientemente en ese fork y los ficheros no funcionan en Ollama, LM Studio ni en llama.cpp estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (22 capas fisicas ejecutadas dos veces) |
| Parametros totales | 4.169.800.704 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_KS, IQ5_KS, IQ6_K |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado con ik_llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Nanbeige 4.2 3B utiliza una arquitectura Looped Transformer: un bloque de 22 capas fisicas que se recorre dos veces durante el forward pass, de modo que el computo efectivo equivale a una red mas profunda sin duplicar el numero de pesos. Esta innovacion es la que permite, segun el autor de la cuantizacion, competir con modelos de mayor tamano en tareas de codigo agentico. El vocabulario es de 166.144 tokens, un tamano notablemente grande para un modelo de 3B, lo que implica que el tensor de salida (output.weight) concentra una parte significativa de los parametros.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible: no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. Respecto al proceso de cuantizacion, el autor indica que partio del fichero Q8_0 del modelo base, genero una imatrix con llama-imatrix sobre 200 chunks de un dataset propio de codigo y tool calling agentico, y aplico llama-quantize con las opciones --imatrix, --allow-requantize y --leave-output-tensor. Esta ultima opcion deja sin comprimir el tensor de salida para evitar errores sutiles de sintaxis (por ejemplo, llaves o puntos y coma ausentes en JSON o Rust) que la compresion de dicho tensor podria introducir. El proceso se ejecuto en un portatil con i5-8250U y 8 GB de RAM sin GPU dedicada.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Codigo agentico: resolucion de issues reales de GitHub, segun el resultado declarado en SWE-bench Verified (63,6).
- Tool calling y function calling, con calibracion de cuantizacion orientada especificamente a estos flujos.
- Razonamiento multi-paso orientado a agentes de codigo.
- Generacion de scripts y parsing de estructuras de datos (JSON, entre otras) segun el ejemplo de uso incluido en la model card.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documentan capacidades de vision, audio ni modo thinking explicito.

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el contexto de un problema de GitHub y proponer un parche, aprovechando su especializacion agentica y su resultado en SWE-bench Verified. Es adecuado por su relacion calidad/tamano en la categoria sub-4B.
- Agentes de codigo en local con recursos limitados: con la variante IQ4_KS (~2,0 GB) puede ejecutarse en equipos con 4-6 GB de RAM, lo que permite desplegar un agente de programacion en portatiles sin GPU dedicada.
- Asistente de edicion en IDE para entornos con 8 GB de RAM: la variante IQ5_KS (~2,4 GB) ofrece el equilibrio declarado entre tamano y rendimiento en SWE-bench, adecuada para autocompletado y refactorizacion asistida.
- Generacion de JSON y estructuras de datos con sintaxis estricta: el tensor de salida sin comprimir reduce el riesgo de errores de sintaxis en formatos como JSON o Rust, lo que lo hace util en pipelines que consumen respuestas estructuradas.
- Integracion en flujos de tool calling: al estar calibrado sobre llamadas a herramientas, puede emplearse como planificador que decide que funcion invocar en un pipeline de automatizacion.
- Prototipado de agentes multilingues en ingles y chino: su soporte nativo de ambos idiomas permite construir asistentes de codigo para equipos con documentacion en cualquiera de las dos lenguas.
- Evaluacion e investigacion de arquitecturas Looped Transformer: util para investigadores que quieran estudiar el comportamiento de capas reutilizadas en tareas de razonamiento con un modelo pequeno y cuantizado.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del autor de la cuantizacion y se refieren al modelo base, no a las versiones GGUF:

| Modelo | SWE-bench Verified |
|---|---|
| Nanbeige 4.2 3B | 63,6 |
| Spark-X2.6 | 59,8 |
| Qwen3.5-9B | 53,1 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible, ni mediciones de degradacion tras la cuantizacion.

## Requisitos de hardware

- VRAM/RAM estimada segun variante: IQ4_KS ~2,0 GB (equipos con 4-6 GB de RAM); IQ5_KS ~2,4 GB (equipos con unos 6-8 GB); IQ6_K ~3,0 GB (equipos con unos 8 GB).
- GPU recomendadas: no disponible. El autor documenta la ejecucion en CPU (i5-8250U, 8 GB de RAM, sin GPU dedicada).
- Cabe en GPU de consumo por tamano de pesos, pero no se han publicado pruebas especificas en RTX 4090, RTX 3060 u otras.
- Despliegue: exclusivamente mediante una compilacion reciente de ik_llama.cpp (llama-cli, llama-quantize). No funciona en Ollama, LM Studio ni llama.cpp estandar.
- Latencia y throughput: no disponibles.
- Parametros de generacion sugeridos en el ejemplo: --temp 0.6, -n 512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Formato disponible |
|---|---|---|---|---|---|
| Nanbeige 4.2 3B (estas cuantizaciones) | 4,17 B | no disponible | 63,6 | Apache 2.0 | GGUF (ik_llama.cpp) |
| Qwen3.5-9B | no disponible | no disponible | 53,1 | no disponible | no disponible |
| Spark-X2.6 | no disponible | no disponible | 59,8 | no disponible | no disponible |

Los datos de Qwen3.5-9B y Spark-X2.6 proceden unicamente de la model card del autor de la cuantizacion; no se dispone de sus especificaciones completas ni de verificacion independiente.

## Limitaciones y advertencias

- Dependencia estricta de ik_llama.cpp: los ficheros no cargan en Ollama, LM Studio ni llama.cpp estandar, lo que limita su integracion en stacks habituales.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no especificada, lo que dificulta planificar casos de uso con ventanas largas.
- Los resultados de SWE-bench proceden de la model card del autor de la cuantizacion y no se han verificado de forma independiente; ademas, corresponden al modelo base y no a las versiones cuantizadas.
- La cuantizacion se realizo a partir de una fuente Q8_0 en lugar de BF16; el autor afirma que la diferencia es matematicamente casi identica, pero no aporta mediciones.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.
- Licencia Apache 2.0 en el modelo base, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo original Nanbeige/Nanbeige4.2-3B antes de produccion.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Unluckkie/Nanbeige-4.2-3B-IK-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Herramienta de cuantizacion ik_llama.cpp: https://github.com/ikawrakow/ik_llama.cpp
