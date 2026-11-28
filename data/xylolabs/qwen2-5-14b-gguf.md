# Xylolabs/Qwen2.5-14B-GGUF

## Resumen

Xylolabs/Qwen2.5-14B-GGUF es una cuantización en formato GGUF del modelo base Qwen/Qwen2.5-14B, publicada por Xylolabs para su ejecución con llama.cpp. Se trata de una conversión de pesos, no de un modelo entrenado desde cero: el autor declara explícitamente que ha convertido los pesos originales a GGUF y los ha cuantizado, manteniendo la licencia Apache 2.0 del release original de Qwen. El repositorio contiene una única variante, `Qwen2.5-14B-Q4_K_M.gguf`, de 8,988 GB.

El modelo subyacente, Qwen2.5-14B, es un transformer denso de aproximadamente 14.770 millones de parámetros (14,77 B) desarrollado por el equipo Qwen de Alibaba. Esta ficha se centra en la distribución GGUF, por lo que los datos verificables se limitan a lo que el autor documenta: formato, tamaño, métricas de fidelidad frente a BF16 y una tabla de recomendaciones de hardware por VRAM y longitud de contexto.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 14 B en GPUs de consumo (RTX 4090/3090 con 24 GB) con una ventana de 32K tokens, o en aceleradores de mayor memoria con hasta 128K tokens, usando el ecosistema llama.cpp. No obstante, el repositorio tiene una adopción muy baja (479 descargas, 0 likes) y no incluye benchmarks de tareas, solo métricas de divergencia de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen2.5-14B); pesos distribuidos en GGUF para llama.cpp |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 128K tokens segun la tabla de hardware del autor (32K en GPU de 24 GB, 64K en 32 GB, 128K en 48 GB o mas) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); la tabla de precision incluye referencias a Q8_0, Q6_K, Q5_K_M y Q3_K_M de llama.cpp |
| Idiomas soportados | en, ko (segun los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen2.5-14B-Q4_K_M.gguf`, 8,988 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-14B es un transformer denso de 14,77 B de parametros. Esta publicacion no entrena ni afina el modelo: es una conversion de los pesos originales a formato GGUF y su cuantizacion a Q4_K_M mediante llama.cpp, sobre un build concreto del repositorio ggml-org (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`). El autor no documenta detalles del dataset de entrenamiento original, el numero de tokens, ni si hubo RLHF o DPO; esos datos corresponden al release de Qwen y no se reproducen en esta model card.

La innovacion tecnica de esta distribucion es la cuantizacion Q4_K_M y su evaluacion de fidelidad frente a BF16. El autor publica dos metricas: divergencia KL sobre WikiText-2 y sobre un conjunto held-out, junto con la precision top-1. Para Q4_K_M reporta KL de 0,055209 y top-1 del 91,363 % en WikiText-2, y KL de 0,016457 con top-1 del 94,147 % en held-out. Como referencia, incluye Q8_0 (KL 0,001566; top-1 98,240 %), Q6_K (KL 0,006503; top-1 96,725 %), Q5_K_M (KL 0,016084; top-1 95,216 %) y Q3_K_M (KL 0,168777; top-1 85,020 %). No se documentan tecnicas de decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto autoregresiva en modo continuacion de prefijo: el ejemplo oficial usa `llama-completion` con `-no-cnv` y un fichero `prompt.txt`.
- Modelo base sin ajuste conversacional especifico en esta distribucion (los metadatos incluyen la etiqueta `conversational`, pero el ejemplo de uso es de continuacion de texto, no de chat con plantilla).
- Capacidades heredadas de Qwen2.5-14B: razonamiento, generacion de codigo y matematicas, si bien esta model card no las evalua ni las documenta.
- Soporte multilingue limitado segun metadatos: ingles (en) y coreano (ko).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en esta publicacion.
- Ejecucion local con llama.cpp en CPU, GPU y memoria unificada (Apple Silicon, DGX Spark).

## Casos de uso

- Despliegue local en estaciones de trabajo con RTX 4090 o RTX 3090: el fichero Q4_K_M de 9,0 GB permite cargar el modelo con 32K tokens de contexto en 24 GB de VRAM, adecuado para prototipado y pruebas sin depender de la nube.
- Generacion de texto por lotes en servidores con una H100: el autor indica 128K de contexto con 80 GB de memoria, lo que permite procesar documentos largos en una sola pasada con llama.cpp.
- Continuacion de texto y autocompletado sobre corpus tecnicos: el flujo documentado (`llama-completion -f prompt.txt -no-cnv`) encaja en pipelines de generacion no interactiva donde se alimenta un prefijo y se recoge la salida.
- Inferencia en Apple Silicon con memoria unificada: la tabla del autor lista Mac Studio M5 Max y M5 Ultra con 128 GB o mas para contexto de 128K, util para desarrollo en local sin GPU dedicada.
- Evaluacion y comparacion de cuantizaciones: las tablas de KL y top-1 permiten medir el coste de precision de Q4_K_M frente a Q8_0 o Q6_K antes de adoptar una variante en produccion.
- Investigacion sobre degradacion por cuantizacion: los datos de WikiText-2 y held-out sirven como referencia para estudiar el impacto de Q4_K_M en tareas de lenguaje, aunque limitados a esas dos metricas.
- Procesamiento de texto en coreano e ingles: los metadatos declaran soporte para ambos idiomas, lo que permite tareas de generacion en esos idiomas, sin garantias documentadas para el resto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo publica metricas de fidelidad de la cuantizacion frente a BF16:

| Cuantizacion | Tamano | KL WikiText-2 | Top-1 WikiText-2 | KL held-out | Top-1 held-out |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 15,702 GB | 0,001566 | 98,240 % | 0,000701 | 98,559 % |
| llama.cpp Q6_K | 12,125 GB | 0,006503 | 96,725 % | 0,002581 | 97,382 % |
| llama.cpp Q5_K_M | 10,509 GB | 0,016084 | 95,216 % | 0,005369 | 96,324 % |
| Q4_K_M (esta publicacion) | 8,988 GB | 0,055209 | 91,363 % | 0,016457 | 94,147 % |
| llama.cpp Q3_K_M | 7,339 GB | 0,168777 | 85,020 % | 0,060055 | 88,608 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 9,0 GB de pesos en Q4_K_M; el autor asigna 24 GB para 32K de contexto y 48 GB o mas para 128K.
- GPU recomendadas segun el autor: RTX 4090 / RTX 3090 (24 GB, 32K), RTX 5090 (32 GB, 64K), RTX 6000 Ada o 2 x 24 GB (48 GB, 128K), H100 (80 GB, 128K), RTX PRO 6000 Blackwell (96 GB, 128K), H200 (141 GB, 128K), B200 (192 GB, 128K), B300 (288 GB, 128K).
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con 24 GB a 32K de contexto; en RTX 5090 con 32 GB a 64K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y M5 Ultra (256 GB y 512 GB) listados para 128K de contexto.
- Opciones de despliegue: llama.cpp (build indicado en la model card); no se documentan vLLM, TGI, Ollama ni otros runners.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen2.5-14B-GGUF | 14,77 B | 32K-128K segun hardware | GGUF Q4_K_M (9,0 GB) | Apache 2.0 | Hugging Face, 479 descargas |
| Qwen/Qwen2.5-14B (original) | 14,77 B | No documentado en esta ficha | Pesos originales (safetensors) | Apache 2.0 | Hugging Face (release oficial) |
| Cuantizaciones oficiales de llama.cpp para Qwen2.5-14B | 14,77 B | Depende del runner | GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M | Apache 2.0 | Referenciadas en la tabla de precision del autor |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin ajuste conversacional documentado: el ejemplo oficial es de continuacion de texto, no de chat con plantilla; usarlo en dialogo requiere aplicar la plantilla de Qwen2.5 por cuenta del integrador.
- Idiomas declarados limitados a ingles y coreano; no hay garantia de calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion inherente a un modelo base de 14 B sin datos de evaluacion de tareas que lo acoten.
- La cuantizacion Q4_K_M degrada la fidelidad: top-1 del 91,363 % en WikiText-2 frente al 98,240 % de Q8_0, con KL de 0,055209; para tareas sensibles a la precision conviene evaluar Q6_K o Q8_0.
- Un unico fichero publicado (Q4_K_M); no hay variantes de mayor o menor cuantizacion en este repositorio.
- Adopcion muy baja (479 descargas, 0 likes) y sin mantenimiento comunitario documentado; el autor solo registra actualizaciones hasta el 27 de noviembre de 2026.
- Licencia Apache 2.0 permite uso comercial, pero el autor recomienda citar el release original de Qwen2.5-14B y no ofrece garantias propias sobre el comportamiento del modelo.
- No se documentan sesgos conocidos, latencia ni throughput en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B
- Licencia en el repositorio: https://huggingface.co/Xylolabs/Qwen2.5-14B-GGUF/blob/main/LICENSE
- Build de llama.cpp referenciado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor (XylolabsInc): https://github.com/XylolabsInc/tensix-bfp-gptq
