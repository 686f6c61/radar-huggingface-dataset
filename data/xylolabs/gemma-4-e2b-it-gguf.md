# Xylolabs/gemma-4-E2B-it-GGUF

## Resumen

Gemma 4 E2B IT GGUF es la versión cuantizada en formato GGUF del modelo google/gemma-4-E2B-it, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. Se trata de una familia de ficheros cuantizados (de Q6_K a Q2_K, pasando por Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS e IQ3_M) que incluyen el tokenizador y la plantilla de chat dentro del propio fichero, de modo que cada cuantización es autónoma y no requiere artefactos adicionales.

El modelo base pertenece a la familia Gemma 4 de Google y está orientado a generación de texto conversacional. Los pesos originales en safetensors suman 4.647.450.147 parámetros, aunque el nombre "E2B" sugiere una variante con un número efectivo de parámetros inferior al total, algo coherente con una arquitectura de mezcla de expertos (MoE); no obstante, la información disponible no detalla la configuración exacta de expertos ni los parámetros activos. El contexto, el número de tokens de entrenamiento y las técnicas de alineación del modelo base no se especifican en la documentación proporcionada.

La relevancia de esta publicación es doble: por un lado, ofrece cuantizaciones de alta fidelidad con métricas objetivas de divergencia (KL y coincidencia top-1 frente al modelo BF16) sobre tres corpus distintos; por otro, el autor compara sus ficheros con los de otros cuantizadores conocidos (bartowski y Unsloth), mostrando ventajas notables de fidelidad a igualdad de tamaño. Los ficheros se distribuyen bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer del modelo base google/gemma-4-E2B-it (detalle de arquitectura del base no disponible) |
| Parametros totales | 4.647.450.147 (pesos safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_M, Q2_K |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (un fichero por cuantizacion, con tokenizador y plantilla de chat embebidos) |

## Arquitectura y entrenamiento

La ficha corresponde a una cuantización, no a un entrenamiento: no se ha entrenado ningún modelo nuevo. El proceso parte de los pesos BF16 de google/gemma-4-E2B-it y los convierte a bloques GGUF mediante llama.cpp, con el añadido de un fichero de importancia (imatrix) para las cuantizaciones de tipo IQ, lo que explica la calidad relativamente alta de IQ4_XS e IQ3_M frente a sus equivalentes sin imatrix. El repositorio ocupa 21,6 GB en total, distribuidos entre las siete variantes.

El autor publica métricas de fidelidad medias frente a los logits del modelo BF16 en tres corpus: wikitext-2, texto con formato de chat (inglés, coreano, código y matemáticas) y un texto reservado (held-out). La divergencia KL y la tasa de coincidencia top-1 permiten comparar cuantizaciones de forma objetiva. Destaca Q6_K, con KL de 0,0082 en wikitext-2 y 96,76 % de coincidencia top-1, y Q4_K_M, con KL de 0,0256 y 94,15 % de coincidencia, valores muy por debajo de los de cuantizaciones equivalentes de otros autores. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base, el número de tokens vistos ni si se aplicaron RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con plantilla de chat incluida en cada fichero GGUF.
- Razonamiento y respuesta multi-turno heredados del modelo base instruct (IT); el alcance exacto no se detalla en la documentación.
- Ejecución en llama.cpp sobre CUDA, Metal y CPU, lo que permite despliegue local y en entornos sin GPU dedicada.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio), lo que facilita su integración en servicios de inferencia.
- Soporte de tool calling, agentes, visión, audio o modo de razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU de datacenter: la variante Q4_K_M (3,11 GB) cabe en GPUs de consumo con 8 GB de VRAM y permite ejecutar un asistente conversacional en inglés o coreano con llama.cpp, manteniendo un 94,15 % de coincidencia top-1 con el modelo BF16.
- Prototipado rápido de aplicaciones de chat: al incluir tokenizador y plantilla de chat en el propio GGUF, basta con cargar un único fichero en llama.cpp u Ollama para tener un endpoint conversacional funcional, sin pasos de conversión adicionales.
- Evaluación comparativa de cuantizaciones: las métricas de KL y top-1 publicadas por el autor permiten elegir la variante adecuada según el compromiso entre tamaño y fidelidad; por ejemplo, IQ4_XS (2,98 GB) ofrece un KL de 0,0337, mejor que muchos Q4_K_M de terceros.
- Inferencia en CPU para entornos de borde: las variantes Q2_K (2,33 GB) e IQ3_M (2,37 GB) reducen el requisito de memoria lo suficiente para servidores sin GPU, a costa de un KL de 0,11 y 0,099 respectivamente.
- Integración en pipelines de generación de texto en inglés y coreano: el modelo base está etiquetado para ambos idiomas y las métricas de fidelidad se miden también sobre texto coreano con formato de chat, lo que respalda su uso en aplicaciones bilingües.
- Servicio de inferencia compatible con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede consumirse desde plataformas de despliegue gestionado, útil para montar demos o entornos de pruebas sin infraestructura propia.
- Ajuste fino posterior sobre cuantizaciones: no recomendado directamente sobre GGUF; para entrenamiento habría que partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente al modelo BF16:

| Cuantizacion | Tamano | KL wikitext-2 | KL chat | KL held-out | Top-1 wikitext-2 | Top-1 chat | Top-1 held-out |
|---|---|---|---|---|---|---|---|
| Q6_K | 4,38 GB | 0,0082 | 0,0054 | 0,0072 | 96,76 % | 98,05 % | 97,42 % |
| Q5_K_M | 3,36 GB | 0,0144 | 0,0112 | 0,0138 | 95,52 % | 97,12 % | 96,38 % |
| Q4_K_M | 3,11 GB | 0,0256 | 0,0168 | 0,0207 | 94,15 % | 96,22 % | 95,57 % |
| Q4_K_S | 3,04 GB | 0,0295 | 0,0195 | 0,0244 | 93,71 % | 96,28 % | 95,12 % |
| IQ4_XS | 2,98 GB | 0,0337 | 0,0241 | 0,0291 | 93,10 % | 95,61 % | 94,66 % |
| IQ3_M | 2,37 GB | 0,0994 | 0,0770 | 0,0991 | 88,20 % | 92,25 % | 90,28 % |
| Q2_K | 2,33 GB | 0,1108 | 0,0863 | 0,1125 | 87,95 % | 91,81 % | 89,47 % |

Comparación con cuantizaciones de terceros a tamaños similares:

| Fichero | Tamano | KL wikitext-2 | KL chat | Top-1 wikitext-2 | Top-1 chat |
|---|---|---|---|---|---|
| Unsloth Q5_K_M | 3,36 GB | 0,0507 | 0,0358 | 91,45 % | 94,31 % |
| Xylolabs Q5_K_M | 3,36 GB | 0,0144 | 0,0112 | 95,52 % | 97,12 % |
| Unsloth Q4_K_M | 3,11 GB | 0,1537 | 0,1117 | 84,96 % | 89,90 % |
| Xylolabs Q4_K_M | 3,11 GB | 0,0256 | 0,0168 | 94,15 % | 96,22 % |
| Unsloth IQ4_XS | 2,98 GB | 0,1772 | 0,1339 | 83,71 % | 89,22 % |
| Xylolabs IQ4_XS | 2,98 GB | 0,0337 | 0,0241 | 93,10 % | 95,61 % |
| bartowski Q4_K_M | 3,46 GB | 0,1188 | 0,0946 | 86,93 % | 91,10 % |
| bartowski IQ4_XS | 3,32 GB | 0,1727 | 0,1333 | 84,10 % | 89,38 % |

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,33 GB (Q2_K) y 4,38 GB (Q6_K) solo para los pesos; hay que añadir el espacio del contexto KV, que depende de la longitud de contexto configurada (no disponible en la documentación).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para las variantes Q4_K_M e IQ4_XS; A100, H100 o RTX 4090 para Q6_K con contextos largos y mayor throughput.
- Cabe en GPU de consumo: sí, desde tarjetas con 4 GB de VRAM para Q2_K e IQ3_M, y con 6-8 GB para Q4_K_M, Q4_K_S e IQ4_XS.
- Opciones de despliegue: llama.cpp (build referenciada en el repositorio), Ollama y cualquier runtime compatible con GGUF; también plataformas que consuman endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base frente a alternativas de la misma categoría, por lo que la comparación se limita a las cuantizaciones del mismo modelo base publicadas por otros autores:

| Publicacion | Tamano del repo | Cuantizaciones | Licencia | Ventaja principal |
|---|---|---|---|---|
| Xylolabs/gemma-4-E2B-it-GGUF | 21,6 GB | 7 (Q6_K a Q2_K) | Apache-2.0 | Mejor fidelidad KL/top-1 a igual tamaño, imatrix en IQ |
| Cuantizaciones de Unsloth (referenciadas) | no disponible | Q8_0, Q6_K, Q5_K, Q4_K, Q3_K, IQ3_XXS, etc. | no disponible | Mayor variedad de niveles altos (Q8_K_XL) |
| Cuantizaciones de bartowski (referenciadas) | no disponible | Q8_0, Q6_K, Q5_K, Q4_K, Q3_K, IQ4_XS, IQ3, IQ2 | no disponible | Cobertura amplia de niveles bajos |

Comparación con modelos de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Es una cuantización: la calidad final depende del nivel elegido; Q2_K e IQ3_M presentan una divergencia KL superior a 0,09, con pérdida apreciable de fidelidad frente al BF16.
- Idiomas: solo inglés y coreano están declarados; el rendimiento en castellano no está verificado y no debería asumirse.
- Sesgos: no se documentan sesgos específicos del modelo base en la información disponible; al heredarse del modelo original, conviene evaluarlos antes de producción.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de veracidad.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse las condiciones del modelo base google/gemma-4-E2B-it y las licencias de las herramientas utilizadas (llama.cpp).
- Contexto: la longitud de contexto no se especifica; configurar ventanas largas incrementa la memoria KV y puede degradar el rendimiento en hardware modesto.
- Producción: al ser un repositorio de cuantizaciones de un tercero, conviene validar los ficheros y fijar una revisión concreta antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E2B-it-GGUF/blob/main/LICENSE
- llama.cpp (build referenciada): https://github.com/ggml-org/llama.cpp/tree/e4b620af19f02960dea7a3a81de7c5805aa3a333
- Repositorio de la herramienta de cuantización del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
