# Xylolabs/gemma-4-E4B-GGUF

## Resumen

Xylolabs/gemma-4-E4B-GGUF es una conversión a formato GGUF del modelo base google/gemma-4-E4B, publicada por Xylolabs para su uso con llama.cpp. Se trata de una cuantización Q4_K_M en la que los 42 tensores de proyección por capa se mantienen a Q8_0, una técnica mixta que reduce el tamaño del archivo a 5,349 GB manteniendo una divergencia KL media de 0,240 respecto a BF16 en WikiText-2. El modelo es un decoder de texto puro: la torre de visión del modelo original no está incluida en esta conversión.

El modelo base pertenece a la familia Gemma 4 de Google y cuenta con 7.518.069.290 parámetros totales según los pesos en safetensors del repositorio. La model card declara soporte para inglés y coreano, licencia Apache 2.0 y una ventana de contexto que, según la tabla de recomendaciones de hardware del autor, alcanza los 128K tokens en configuraciones con suficiente memoria. Es relevante para desarrolladores que necesitan ejecutar un modelo de ~7,5B en GPUs de consumo o estaciones de trabajo con memoria unificada, manteniendo un contexto muy largo.

La ficha del autor es explícita: es un modelo base, no instruct, por lo que debe alimentarse con un prefijo de texto para continuar, no con instrucciones conversacionales. La conversión está pensada para despliegues locales con llama.cpp y no incluye capacidades multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Gemma 4); detalles completos no disponibles en la informacion proporcionada |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens segun la tabla de hardware del autor |
| Tipos de cuantizacion | Q4_K_M con los 42 tensores de proyeccion por capa a Q8_0 (archivo `gemma-4-E4B-Q4_K_M-proj8.gguf`, 5,349 GB) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo base google/gemma-4-E4B mas alla de que es un decoder de texto de la familia Gemma 4. La model card de esta conversión no incluye datos sobre composicion del dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO. Tampoco se documentan innovaciones como decodificacion especulativa o atención lineal.

Lo que sí está documentado con precisión es el proceso de cuantización. El autor generó el GGUF con una build concreta de llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`) y aplicó una estrategia mixta: Q4_K_M para la mayor parte de los tensores y Q8_0 para los 42 tensores de proyección por capa. Según la tabla de precisión del autor, esta combinación obtiene una KL media de 0,240410 en WikiText-2 y 0,243051 en held-out, con un top-1 del 79,559% y 79,971% respectivamente, muy por encima del Q4_K_M estándar de llama.cpp (KL 1,093739, top-1 56,892%). El coste es un archivo ligeramente mayor (5,349 GB frente a 5,335 GB).

## Capacidades

- Generacion de texto autoregresiva como modelo base: requiere un prefijo de texto y continúa la secuencia, no sigue instrucciones.
- Razonamiento y conocimiento general heredados del modelo Gemma 4 subyacente, aunque sin datos de benchmarks publicados en esta conversión.
- Soporte multilingue limitado a ingles y coreano segun los metadatos.
- Ejecucion local con llama.cpp mediante `llama-completion` (modo `-no-cnv`, sin conversacion).
- Contexto largo de hasta 128K tokens en configuraciones de memoria suficientes.
- No incluye vision: la torre de vision del modelo original fue excluida de la conversion.
- No se documenta soporte de tool calling, function calling, agentes ni modo thinking en la informacion disponible.

## Casos de uso

- Continuacion de texto y generacion creativa local: el modelo puede usarse con `llama-completion` pasando un prefijo en un archivo de prompt, adecuado para prototipos de escritura asistida que se ejecutan en una RTX 4090 sin depender de la nube.
- Procesamiento de documentos largos en local: con 128K tokens de contexto en una GPU de 24 GB, permite tareas de resumen o extraccion sobre documentos extensos manteniendo todo el pipeline en hardware propio.
- Investigacion sobre cuantizacion: la tabla de precisión publicada (KL y top-1 frente a BF16 para Q8_0, Q6_K, Q5_K_M, Q4_K_M-proj8, Q4_K_M y Q3_K_M) lo convierte en un caso de estudio útil para evaluar el impacto de mantener tensores de proyección en Q8_0.
- Despliegue en estaciones de trabajo con memoria unificada: la tabla de hardware del autor cubre DGX Spark, Mac Studio M5 Max/Ultra y GPUs H100/H200/B200/B300, lo que facilita planificar despliegues en entornos Apple Silicon o nodos de datacenter.
- Fine-tuning o evaluacion de modelos base: al ser un modelo base en GGUF, sirve como referencia para comparar el comportamiento de continuaciones de texto entre cuantizaciones.
- Generacion de texto en coreano e ingles: los dos idiomas declarados permiten aplicaciones bilingües de continuacion de texto sin necesidad de infraestructura cloud.
- Benchmarking de llama.cpp: útil para medir throughput y latencia de una build concreta de llama.cpp sobre distintas GPUs con un modelo de ~7,5B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor sí publica métricas de fidelidad de la cuantización frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,031 GB | 0,006691 | 96,539% | 0,006596 | 96,314% |
| llama.cpp Q6_K | 6,217 GB | 0,038657 | 91,373% | 0,036176 | 91,755% |
| llama.cpp Q5_K_M | 5,763 GB | 0,159024 | 82,882% | 0,150359 | 84,451% |
| Q4_K_M-proj8 (este repo) | 5,349 GB | 0,240410 | 79,559% | 0,243051 | 79,971% |
| llama.cpp Q4_K_M | 5,335 GB | 1,093739 | 56,892% | 1,141156 | 56,059% |
| llama.cpp Q3_K_M | 4,850 GB | 4,688224 | 20,686% | 4,386987 | 20,941% |

## Requisitos de hardware

- VRAM estimada: el archivo pesa 5,349 GB; el autor recomienda que el tamano del archivo mas la KV cache en f16 al contexto elegido mas 2 GB de runtime queden por debajo del 90% de la memoria disponible.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 (24 GB) con contexto de 128K segun la tabla del autor; tambien en RTX 5090 (32 GB).
- GPU profesionales y datacenter: RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), H200 (141 GB), B200 (192 GB) y B300 (288 GB), todas con 128K de contexto.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB) y RTX PRO 6000 Blackwell (96 GB).
- Opciones de despliegue: llama.cpp (build verificada en el commit indicado); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face, aunque no se detalla en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-GGUF | 7.518.069.290 | 128K | Q4_K_M-proj8 (5,349 GB) | Apache 2.0 | GGUF |
| google/gemma-4-E4B | 7.518.069.290 | no disponible en la informacion proporcionada | BF16 (referencia) | Apache 2.0 | safetensors |
| llama.cpp Q4_K_M del mismo modelo | 7.518.069.290 | 128K | Q4_K_M (5,335 GB) | Apache 2.0 | GGUF |

La comparación relevante es frente a la cuantización Q4_K_M estándar de llama.cpp del mismo modelo base: este repositorio ocupa 14 MB más pero reduce la KL media de 1,093739 a 0,240410 y eleva el top-1 del 56,892% al 79,559%. No se dispone de datos de benchmarks de tareas para comparar con otros modelos de tamano similar.

## Limitaciones y advertencias

- Es un modelo base, no instruct: no sigue instrucciones ni mantiene conversaciones; debe usarse con prefijo de texto y modo `-no-cnv`.
- La torre de vision del modelo original no esta incluida, por lo que no admite entradas de imagen.
- Idiomas declarados solo en y ko; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion y sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion proporcionada.
- La licencia Apache 2.0 se hereda del modelo original; el autor aclara que Xylolabs no esta afiliado ni respaldado por los autores originales.
- La fidelidad de la cuantizacion es inferior a Q5_K_M y Q6_K (KL 0,240 frente a 0,159 y 0,039); para tareas sensibles a la precision conviene valorar cuantizaciones mayores.
- La build de llama.cpp verificada es un commit concreto; otras versiones pueden no ser compatibles.
- No hay datos publicados de throughput ni latencia en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Licencia en el repo: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF/blob/main/LICENSE
- Build de llama.cpp verificada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
