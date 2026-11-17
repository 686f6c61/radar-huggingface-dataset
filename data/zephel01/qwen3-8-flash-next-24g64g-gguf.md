# zephel01/Qwen3.8-Flash-Next-24G64G-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Qwen (Alibaba). Esta ficha concreta describe la cuantizacion GGUF publicada por el usuario zephel01 bajo el identificador `zephel01/Qwen3.8-Flash-Next-24G64G-GGUF`, una version mixta de baja precision disenada especificamente para ejecutarse en un PC con una GPU de 24 GB de VRAM y 64 GB de RAM. El modelo completo cuenta con 176.943.899.520 parametros totales (unos 177 mil millones) y conserva los 512 expertos del modelo original.

La cuantizacion emplea una receta propia basada en LDLQ (Lattice-based Diagonal Linear Quantization) aplicada sobre los pesos en formato NVFP4 de NVIDIA, con tipos mixtos por tensor: los expertos gate/up usan IQ3_S al 57% de los bytes, IQ4_NL al 34%, Q8_0 al 7% e IQ4_XS al 1%, resultando en una media de 3,94 bits por peso (equivalente aproximado a un IQ3_M). Los tensores no-expertos (atencion, router, experto compartido, embeddings y tabla de embeddings por capa) se conservan sin cambios respecto a la version UD-IQ4_XS de unsloth.

El interes de esta publicacion radica en que iguala el tamano de la cuantizacion de referencia (93,7 GB) pero mejora la fidelidad respecto al modelo NVFP4: la divergencia KL baja de 0,092 a 0,068 (-26%) y el porcentaje de coincidencia del token superior sube al 90,3% frente al 88,7%. Esta etiquetada como BETA y medida en un unico PC emulado, por lo que el autor solicita reportes de hardware real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer; arquitectura `qwen4exp` en llama.cpp |
| Parametros totales | 176.943.899.520 (~177 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (configuracion de ejemplo con `-c 32768`); contexto maximo del modelo base no disponible |
| Tipos de cuantizacion | Mezcla por tensor: expertos gate/up IQ3_S (57% bytes), down IQ4_NL (34%), Q8_0 (7%), IQ4_XS (1%); media 3,94 bits/peso (~IQ3_M). Tensores no-expertos: UD-IQ4_XS sin cambios |
| Idiomas soportados | Ingles (en) y japones (ja) declarados en la model card |
| Licencia | qwen-community-1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (3 shards, 93,7 GB); SHA256SUMS incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture-of-Experts de 512 expertos por capa, con atencion, router, experto compartido y embeddings como tensores no-expertos. Esta cuantizacion conserva la totalidad de los 512 expertos (no se elimino ninguno) y re-cuantiza cada experto mediante LDLQ a partir de los pesos en formato NVFP4 de NVIDIA, usando los mismos tipos de tensor que la version UD-IQ4_XS de unsloth. La unica diferencia entre ambas versiones es el redondeo: LDLQ calibrado con texto en japones y con turnos de chat del propio modelo. Los tensores no-expertos son identicos byte a byte a los de UD-IQ4_XS.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La innovacion tecnica destacable de esta publicacion es el uso de LDLQ para reducir el error de cuantizacion manteniendo el mismo tamano de archivo y velocidad que la referencia, con una mejora medible en KL y en la tasa de coincidencia del token superior. La tabla de embeddings por capa (28,8 GB) no se mantiene residente en memoria, sino que se lee desde SSD unas pocas filas por token.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento con modo "thinking" activado (empleado en las pruebas de uso real del autor).
- Generacion de codigo: evaluado con 5 tareas de programacion con tests ocultos, con 4/5 y 5/5 aciertos en dos semillas.
- Aritmetica basica y explicaciones (verificado en pruebas de uso real).
- Comprension de contexto largo: recuperacion de una aguja ("needle") en un prompt de 8.000 tokens.
- Capacidades multilingues limitadas a ingles y japones segun la model card (correo de negocios, explicaciones, resumenes, literatura y aritmetica en japones).
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`) a traves del motor Abyss.
- Soporte de plantilla Jinja (`--jinja`) en llama.cpp para formateo de chat.

## Casos de uso

- Inferencia local en PC de gama alta: un usuario con una RTX 5090 (24 GB) y 64 GB de RAM puede ejecutar un modelo de ~177 mil millones de parametros en local con calidad cercana a la cuantizacion de referencia, gracias al offload de expertos a CPU/RAM (`--n-cpu-moe 34`).
- Asistente de programacion en local: con 4/5 y 5/5 en tareas de codigo con tests ocultos, es adecuado para autocompletado, generacion de funciones y revision de codigo en un entorno sin conexion ni costes de API.
- Procesamiento de documentacion en japones: la calibracion LDLQ incluye japones y la KL en japones es de 0,146 (frente a 0,195 de UD-IQ4_XS), lo que lo hace util para resumenes, correos de negocios y explicaciones en ese idioma.
- Analisis de documentos largos: con 32.768 tokens de contexto configurados y recuperacion verificada de informacion en prompts de 8.000 tokens, sirve para extraer datos de contratos, informes o articulos extensos.
- Despliegue de servicio conversacional autoalojado: mediante el servidor Abyss con API compatible con OpenAI (`/v1/chat/completions`), se puede integrar en aplicaciones existentes sin cambiar el cliente.
- Prototipado e investigacion de cuantizacion: el repositorio incluye scripts de configuracion, sumas SHA256 y resultados de KL, lo que facilita reproducir y comparar recetas de cuantizacion sobre hardware de consumo.
- Escenarios con requisitos de privacidad: al ejecutarse integramente en local, los datos no salen del equipo, apto para entornos con datos sensibles.

## Benchmarks y rendimiento

Calidad de cuantizacion (KL respecto al modelo NVFP4, 10 secuencias retenidas de 1.023 tokens: codigo, ingles, chino, japones y otros; motor Abyss):

| Metrica | Este archivo | unsloth UD-IQ4_XS |
|---|---:|---:|
| Descarga | 93,7 GB | 93,7 GB |
| Resident (GPU + RAM) | 64,2 GB | 64,9 GB |
| KL (10 secuencias) | 0,068 | 0,092 |
| Coincidencia token superior | 90,3% | 88,7% |
| KL en japones | 0,146 | 0,195 |
| KL en codigo | 0,092 | 0,116 |

Uso real (servidor Abyss, thinking activado, dos semillas, PC emulado: RTX 5090 limitada a 24 GB, nivel de RAM 46 GB en cgroup de 58 GB):

| Prueba | Este archivo | unsloth UD-IQ4_XS |
|---|---|---|
| Japones (5 prompts) | 10/10 respondidos, hechos y sumas correctos | 10/10 |
| Codigo (5 tareas con tests ocultos) | 5/5 y 4/5 | 3/5 y 5/5 |
| Aguja en prompt de 8K | encontrada | no disponible |

Velocidad: 69,9 tok/s en tareas de codigo frente a 71,1 tok/s de UD-IQ4_XS en el mismo PC emulado. En llama.cpp con `-ngl 99 --n-cpu-moe 34`, decodificacion de 26-34 tok/s. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 24 GB para la GPU; en la prueba con llama.cpp se usaron 24,2 GB, aunque el autor recomienda `-ngl 35` o mas en una tarjeta real de 24 GB.
- RAM: 64 GB en el sistema; el nivel de RAM del motor se configura con `STRATA_GLM_RAM_GB=46` en un PC de 64 GB.
- GPU recomendadas: RTX 5090 (validada en la prueba), cualquier GPU de 24 GB (RTX 4090, RTX 3090, A10G, L4 no confirmadas); para el modelo completo sin offload se requeriria hardware de mayor capacidad, no especificado.
- Almacenamiento: 93,7 GB para los pesos; la tabla de embeddings por capa (28,8 GB) se lee desde SSD, por lo que se recomienda almacenamiento rapido.
- Cabe en GPU de consumo: si, en GPU de 24 GB combinada con 64 GB de RAM mediante offload de expertos a CPU.
- Despliegue: motor Abyss v1.3.108 o superior (obligatorio para la ruta de prompt por el bug de lectura de expertos Q8_0 down) y llama.cpp (arquitectura `qwen4exp`, upstream `ac8e1694d` del 2026-10-29). No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: 69,9 tok/s en codigo (Abyss, PC emulado); 26-34 tok/s en decodificacion con llama.cpp. Muestreo recomendado: temperature 1.0, top_p 0.95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Contexto | Calidad (KL) | Licencia | Disponibilidad |
|---|---|---|---:|---|---|---|
| Este (zephel01 24G64G) | ~177B MoE, 512 expertos | GGUF mixto, 93,7 GB | 32.768 config. | 0,068 | qwen-community-1.0 | Hugging Face |
| unsloth UD-IQ4_XS | ~177B MoE, 512 expertos | GGUF, 93,7 GB | no disponible | 0,092 | qwen-community-1.0 | Hugging Face |
| zephel01 16G64G (IQ3_M) | ~177B MoE, 512 expertos | GGUF, 86,9 GB | no disponible | no disponible | qwen-community-1.0 | Hugging Face |
| zephel01 12G32G (E448 IQ2_M) | ~177B MoE, 448 de 512 expertos | GGUF, 67,5 GB | no disponible | no disponible | qwen-community-1.0 | Hugging Face |

## Limitaciones y advertencias

- Estado BETA: los resultados se midieron en un unico PC emulado (RTX 5090 limitada a 24 GB, RAM en cgroup); el autor solicita reportes de hardware real y no garantiza la velocidad en otros equipos.
- Dependencia de version del motor: requiere Abyss v1.3.108 o superior; versiones anteriores leen mal los expertos Q8_0 down y producen resultados incorrectos en la ruta de prompt.
- Idiomas: solo ingles y japones declarados; el rendimiento en castellano u otros idiomas no esta verificado.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; las pruebas de aritmetica y hechos son limitadas (5 prompts) y no garantizan fiabilidad en produccion.
- Perdida de calidad por cuantizacion: aunque menor que la referencia, la KL de 0,068 implica divergencia respecto al modelo NVFP4; no es equivalente al modelo en precision completa.
- Rendimiento variable en codigo: los resultados oscilan entre 3/5 y 5/5 segun la semilla, lo que indica sensibilidad al muestreo.
- Licencia qwen-community-1.0: es necesario revisar los terminos del modelo base en el enlace de licencia antes de uso comercial; la model card la etiqueta como "other".
- Requisito de almacenamiento y SSD: la tabla de embeddings por capa se lee desde disco, por lo que un SSD lento puede degradar la latencia.
- Sin datos de benchmarks estandar: no hay resultados publicados de MMLU, HumanEval ni GSM8K en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-24G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Motor Abyss: https://github.com/zephel01/Abyss
- Version 12G32G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-E448-IQ2_M-12G32G-GGUF
- Version 16G64G: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-IQ3_M-16G64G-GGUF
- Version DGX Spark: https://huggingface.co/zephel01/Qwen3.8-Flash-Next-DGX-Spark-GGUF
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+Qwen3.8-Flash-Next+24G64G+on+YOUR_GPU
