# webmp3/Sakura-SmolLM2-135M-Instruct-GGUF

## Resumen

Sakura-SmolLM2-135M-Instruct-GGUF es una cuantización comunitaria en formato GGUF del modelo HuggingFaceTB/SmolLM2-135M-Instruct, publicada por el usuario webmp3 bajo licencia Apache 2.0. No se trata de un modelo entrenado desde cero, sino de una reempaquetadura del checkpoint original de Hugging Face en un único fichero de 105.454.656 bytes (unos 0,1 GB) con la etiqueta de cuantización Q4_K_M, pensada para inference en CPU y en hardware muy limitado.

El modelo subyacente es un transformer decoder de 134.515.008 parámetros (135M) entrenado por HuggingFaceTB sobre 2 billones de tokens en precisión bfloat16 y ajustado para seguir instrucciones. Su interés práctico está en el tamaño: permite ejecutar un modelo conversacional en cualquier portátil, en una Raspberry Pi o dentro de un contenedor sin GPU, con un consumo de memoria de dos órdenes de magnitud inferior al de un modelo de 7B.

La relevancia de esta ficha concreta es acotada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el propio autor advierte de que es una publicación independiente, no oficial. La model card es transparente en cuanto al procedimiento (re-cuantización de un GGUF BF16 preexistente, sin calibración con matriz de importancia) y no reclama ninguna métrica de calidad, perplejidad ni benchmark de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer decoder, heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 (aproximadamente 135M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (consultar la model card del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Tamano del fichero | 105.454.656 bytes (Q4_K_M) |
| SHA-256 del fichero | 245b1a6d33d63cb6851417b9945390e084059d01a8a221bae4352d5fc5d2b49e |
| Modelo base | HuggingFaceTB/SmolLM2-135M-Instruct (commit 671ad66db42a400967d6efc49ea74888ccf68936) |
| Verificacion | estructura GGUF valida; inferencia real ejecutada con llama.cpp b11669-620d2225c |

## Arquitectura y entrenamiento

La arquitectura declarada en el GGUF es `llama`, correspondiente a un transformer decoder-only con atención multi-cabeza estándar, la misma topología del SmolLM2-135M-Instruct original. Según la información disponible del modelo base, el entrenamiento se realizó sobre 2 billones de tokens en bfloat16 y posteriormente se aplicó un ajuste de instrucciones; no se detallan en la información proporcionada la composición exacta del dataset, ni si hubo fases de RLHF, DPO o preferencias, por lo que esos extremos quedan como no disponibles.

El proceso de esta publicación concreta es una re-cuantización de un GGUF ya existente: se parte del fichero `Sakura-SmolLM2-135M-Instruct-BF16.gguf` (0,3 GB, SHA-256 `e8dbe545492a548832dbfd8fc178fa61724aaadd9916115da636871a84f1ee46`, con procedencia verificada) y se genera un Q4_K_M. El autor indica explícitamente que no se convirtió el checkpoint safetensors original y que no se ejecutó calibración con matriz de importancia (imatrix). Un detalle técnico relevante es la mezcla real de tipos de tensor del fichero: 61 tensores F32, 16 Q4_K, 166 Q5_0, 14 Q6_K y 15 Q8_0. Es decir, la etiqueta Q4_K_M designa el preset de llama.cpp, pero el grueso de los tensores queda almacenado en Q5_0 y los pesos de normalización se mantienen en F32, de modo que el tamaño efectivo y la calidad no se corresponden con un 4-bit puro.

## Capacidades

- Generación de texto conversacional y seguimiento de instrucciones en inglés y chino.
- Reescritura de texto y resumen de pasajes cortos, según la descripción del modelo base.
- Soporte de function calling / tool calling, citado en las fichas del modelo base.
- Razonamiento multi-paso muy limitado: es un 135M, adecuado para tareas de un solo salto y no para cadenas de razonamiento largas.
- Capacidades multilingües restringidas a los idiomas declarados (en, zh); el castellano no figura en la lista.
- No dispone de visión, audio, ni modo de pensamiento explícito (thinking mode).
- No se declaran capacidades de agente autónomo ni planificación de herramientas múltiples.

## Casos de uso

- Inferencia en CPU sin GPU: el fichero Q4_K_M de 105 MB se carga con `llama-cli` en un portátil, una Raspberry Pi o un contenedor pequeño, lo que permite incorporar generación de texto a entornos donde no existe acelerador hardware.
- Enrutado de intenciones en pipelines grandes: usar el modelo como clasificador previo que decide si un prompt va a un modelo mayor o se resuelve localmente, aprovechando su soporte de function calling y su baja latencia de arranque.
- Prototipado rápido de aplicaciones conversacionales: validar plantillas de prompt, formatos de chat y flujos multi-turno con un coste computacional despreciable antes de migrar al modelo definitivo.
- Reescritura y resumen de textos cortos en inglés o chino dentro de herramientas de productividad, como la reformulación de descripciones o la condensación de notas breves.
- Pruebas de regresión en CI/CD de herramientas de inferencia: al ser un GGUF mínimo y con inferencia verificada en llama.cpp b11669, sirve como caso de prueba para validar builds, cargadores y tokenizadores sin consumir recursos de runner.
- Docencia y demostraciones de cuantización: permite mostrar en una clase la diferencia entre un BF16 de 0,3 GB y un Q4_K_M de 0,1 GB, incluyendo la inspección de la mezcla de tipos de tensor.
- Preprocesado y etiquetado ligero en el edge: filtrado de mensajes, normalización de texto o generación de respuestas plantilla en dispositivos con memoria inferior a 1 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio lo declara de forma explícita: no se reclama ninguna puntuación de benchmark de código, ni perplejidad, ni métrica de calidad, más allá de la verificación de que el fichero carga y genera texto con llama.cpp. Tampoco la información de búsqueda aporta cifras de MMLU, HumanEval o GSM8K para este artefacto concreto.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Perplejidad | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB. El fichero ocupa 105 MB y, con la sobrecarga de contexto y buffers de llama.cpp, la estimación razonable se sitúa en el rango de 150 a 400 MB de memoria residente (estimación a partir del tamaño del fichero; el autor no publica mediciones).
- GPU recomendadas: no requiere GPU. Funciona en cualquier GPU con más de 1 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100), pero el uso de GPU no aporta ventajas significativas frente a CPU para este tamaño.
- Cabe en cualquier GPU de consumo y en CPU de gama baja, incluidos SoC ARM y dispositivos embebidos.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) es la vía validada por el autor; al ser un GGUF estándar, también es cargable con Ollama importando el fichero mediante un Modelfile y con otras herramientas compatibles con GGUF. El soporte en vLLM y TGI es limitado para GGUF de este tipo y no está verificado en la información disponible.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este fichero.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webmp3/Sakura-SmolLM2-135M-Instruct-GGUF (este) | 134.515.008 | no disponible | GGUF Q4_K_M, 105 MB | apache-2.0 | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | safetensors / BF16 | apache-2.0 | Hugging Face, oficial |
| webmp3/Sakura-SmolLM2-135M-Instruct-BF16-GGUF | 135M | no disponible | GGUF BF16, 0,3 GB | apache-2.0 | Hugging Face, oficial del cuantizador |
| bartowski/SmolLM2-135M-Instruct-GGUF | 135M | no disponible | GGUF, varias cuantizaciones | apache-2.0 | Hugging Face, ampliamente utilizado |
| smollm2-135M-instruct-gguf-q8 (HackNetAyush) | 135M | no disponible | GGUF Q8_0, 138 MB | no disponible | GitHub |

Los cinco artefactos comparten el mismo modelo base, de modo que la comparación relevante es de empaquetado y no de capacidades: este Q4_K_M ocupa un 61 % menos que el BF16 GGUF del que procede y aproximadamente un 24 % menos que la variante Q8_0 de 138 MB. Frente a la publicación de bartowski, que ofrece un abanico de cuantizaciones, este repositorio solo sirve un fichero y no documenta calibración con imatrix.

## Limitaciones y advertencias

- Modelo de 135M parámetros: la calidad de generación es muy inferior a la de modelos de 1B o superiores, con alta propensión a incoherencias y a abandono del formato de instrucción en prompts largos.
- Riesgo elevado de alucinación, especialmente en preguntas factuales y en cadenas de razonamiento de más de un paso.
- Idiomas declarados en y zh; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Longitud de contexto no documentada en la información disponible: conviene no asumir ventanas largas sin verificarlo en la model card del modelo base.
- Cuantización sin calibración con matriz de importancia y con mezcla real de tipos (predominio de Q5_0 sobre Q4_K): el fichero no es un 4-bit homogéneo, por lo que las comparaciones de tamaño frente a otros Q4_K_M no son directamente trasladables.
- Procedencia: re-cuantización de un GGUF BF16 intermedio, no del checkpoint safetensors original. La cadena de trazabilidad depende de que ese GGUF intermedio sea fiel al modelo de Hugging Face.
- Publicación no oficial: el autor indica expresamente que no es un lanzamiento del autor upstream. Con 0 descargas y 0 likes, no hay evidencia de uso en producción ni validación independiente.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero exige conservar la atribución y el aviso de licencia, y no concede garantías. Los derechos de atribución del modelo base deben mantenerse.
- Ausencia total de métricas de calidad publicadas: cualquier decisión de producción debería ir precedida de una evaluación propia sobre el caso de uso concreto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/webmp3/Sakura-SmolLM2-135M-Instruct-GGUF
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio GGUF BF16 de origen: https://huggingface.co/webmp3/Sakura-SmolLM2-135M-Instruct-BF16-GGUF
- Model card del modelo base en el commit fijado: https://huggingface.co/webmp3/Sakura-SmolLM2-135M-Instruct-BF16-GGUF/blob/671ad66db42a400967d6efc49ea74888ccf68936/README.md
- Cuantizaciones alternativas de bartowski: https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
- Variante Q8_0 en GitHub: https://github.com/HackNetAyush/smollm2-135M-instruct-gguf-q8
- Tutorial de despliegue local: https://aiindigo.com/tutorials/getting-started-with-smollm2-135m-instruct-run-a-capable-llm-on-any-device
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/smollm2-135m-instruct-huggingfacetb
