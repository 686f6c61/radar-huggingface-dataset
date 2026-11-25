# YukijThird/Inkling-2-Mini-Uncensored-yukij_quant-GGUF

## Resumen

Inkling-2-Mini-Uncensored-yukij_quant-GGUF es una cuantización GGUF del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario YukijThird. Sobre el modelo base se ha aplicado una abliteración propia (eliminación de la dirección de rechazo por capas) y posteriormente se ha cuantizado con matrices de importancia (imatrix) para su uso en llama.cpp con GPUs de consumo. El resultado son dos builds orientadas a clases de VRAM de 12 GB y 16 GB, con contexto declarado de 128K tokens y soporte de entrada de imagen.

El modelo base es un Mixture of Experts (MoE) de aproximadamente 28.788 millones de parámetros totales, según los pesos en safetensors del repositorio. La ficha no detalla el número de parámetros activos ni la composición del dataset de entrenamiento original, por lo que esos datos quedan como no disponibles. La relevancia de esta publicación es doble: por un lado, demuestra que es posible ejecutar un MoE multimodal de este tamaño en GPUs de consumo mediante cuantización agresiva; por otro, introduce una metodología de evaluación de rechazos basada en la sustancia de la respuesta y no en palabras clave.

El autor reporta métricas de divergencia KL frente al modelo original sin editar, medidas con llama-perplexity sobre 30 fragmentos de 1024 tokens de código, transcripciones de agentes y texto en ruso. La build de 12 GB ocupa 10,27 GB en disco y la de 16 GB, 13,85 GB. La licencia es Apache-2.0, heredada del modelo base, que además enlaza una política de uso aceptable propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, según tags del repositorio; detalles de capas y atención no disponibles |
| Parametros totales | 28.788.294.144 (~28,8B) |
| Parametros activos | no disponible |
| Longitud de contexto | 128K tokens (131072), declarada en la model card |
| Tipos de cuantizacion | GGUF con imatrix; builds de 12 GB (10,27 GB) y 16 GB (13,85 GB); tipos concretos de tensor en `recipe/` |
| Idiomas soportados | no disponible (la evaluación incluye texto en ruso, pero no se declara una lista oficial) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); mmproj bf16 separado para visión |
| Modalidad | image-text-to-text (texto e imagen de entrada) |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Tamano del repo | 24,9 GB |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un MoE y que el pipeline es image-text-to-text, es decir, acepta imágenes además de texto. No se detallan el número de expertos, el enrutador, el número de capas ni la dimensión oculta. Tampoco se especifican los tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineamiento en el modelo original.

La innovación técnica documentada en esta publicación es el proceso de abliteración: se calcula una dirección de rechazo por capa a partir de las posiciones posteriores a la instrucción, proyectando fuera la media de las respuestas inocuas. Esa dirección se resta de la salida de atención (fuerza 3) y de la salida de cada experto (fuerza 1) en las capas 4 a 23, teniendo en cuenta la post-convolución por canal del modelo. Los scripts, los ficheros de tipos de tensor y las matrices de importancia están en el directorio `recipe/` del repositorio.

La cuantización se realizó con imatrix y se validó con `llama-perplexity --kl-divergence` sobre 30 chunks de 1024 tokens (código, transcripciones de agentes y ruso). El KLD reportado es 0,0550 para la build de 12 GB y 0,0382 para la de 16 GB; el porcentaje de mismo token superior es 93,56% y 94,89% respectivamente. Estas cifras mezclan el coste de la cuantización y el de la edición, y no miden el grado de rechazo restante.

## Capacidades

- Generación de texto conversacional multi-turno, con contexto declarado de hasta 131072 tokens.
- Entrada de imagen (image-text-to-text): requiere el fichero `mmproj-Inkling-2-Mini-bf16.gguf`, que consume unos 0,6 GB adicionales de VRAM.
- Razonamiento y uso en flujos agénticos: el autor indica que está ajustado para código y uso agéntico.
- Soporte de plantillas de chat mediante `--jinja` en llama-server.
- Multilingüe parcial: la evaluación incluye texto en ruso, pero no hay lista oficial de idiomas.
- Modo sin rechazos (abliterado): según la evaluación del autor, 0 rechazos graduados sobre 96 peticiones dañinas de test.
- Tool calling / function calling: no documentado explícitamente en la información disponible.

## Casos de uso

- Asistencia de código en local: el modelo está ajustado para código y puede ejecutarse en una GPU de 12 GB con cuantización IQ2/IQ3, lo que permite integrarlo en entornos de desarrollo sin depender de APIs externas.
- Agentes autónomos con contexto largo: la ventana de 128K tokens permite mantener transcripciones extensas de herramientas y resultados intermedios en un solo prompt, útil para pipelines de varios pasos.
- Procesamiento de documentación con imágenes: al aceptar entrada image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados junto con instrucciones textuales.
- Investigación sobre alineamiento y abliteración: sirve como caso de estudio reproducible, ya que el repositorio incluye scripts, matrices de importancia y una metodología de evaluación de rechazos por sustancia.
- Despliegue en estaciones de trabajo con GPU de consumo: las builds de 12 GB y 16 GB están pensadas para llama.cpp en hardware tipo Intel Arc B580 o GPUs NVIDIA equivalentes, sin necesidad de servidores dedicados.
- Experimentación con MoE multimodal en local: permite probar cargas de trabajo multimodales en un solo equipo, con la salvedad de que el rendimiento y la calidad dependen de la cuantización elegida.
- Evaluación comparativa de cuantizaciones: los datos de KLD y de coincidencia de token superior permiten comparar esta build con otras alternativas (nokeepai, AtomicChat) en la misma clase de VRAM.

## Benchmarks y rendimiento

El autor publica métricas de calidad de cuantización y de comportamiento frente a rechazos, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de capacidad en la información disponible.

| Metrica | yukij_quant Uncensored 12GB | nokeepai Unbound v2.1 IQ2_M | AtomicChat Uncensored AD-IQ2_M |
|---|---|---|---|
| Tamano | 10,27 GB | 11,16 GB | 8,67 GB |
| KLD (menor es mejor) | 0,0550 | 0,0551 | 0,0653 |
| Mismo token superior | 93,56% | 94,49% | 92,85% |

| Metrica | AtomicChat Uncensored AD-IQ3_S | yukij_quant Uncensored 16GB | nokeepai Unbound v2.1 IQ3_M |
|---|---|---|---|
| Tamano | 13,34 GB | 13,85 GB | 13,26 GB |
| KLD (menor es mejor) | 0,0194 | 0,0382 | 0,0482 |
| Mismo token superior | 96,40% | 94,89% | 95,49% |

Evaluación de rechazos de la build de 12 GB sobre 96 peticiones dañinas (mlabonne/harmful_behaviors, test split, 1024 tokens por respuesta):

| Resultado | Recuento |
|---|---|
| Frase de rechazo al inicio de la respuesta | 0 |
| Frase de rechazo en cualquier parte | 1 |
| Graduado como rechazo | 0 |
| Graduado como hace lo pedido | 61 |
| Graduado como evasivo | 31 |
| Sin respuesta en 1024 tokens / grado no parseado | 3 / 1 |

Las mediciones se realizaron en un Intel Arc B580 con Vulkan. La build de 16 GB no fue evaluada por separado en la prueba de rechazos; el autor indica que comparte la misma edición.

## Requisitos de hardware

- VRAM para la build de 12 GB: 12.057 de 12.216 MiB ocupados en una Intel Arc B580 con `-ngl 99 -c 131072 -np 1 -fa on -ctk q8_0 -ctv q4_0 -b 2048 -ub 32 --cache-ram 0 --jinja`.
- VRAM para la build de 16 GB: el ajuste se calcula a partir de la medición anterior, no se ha medido directamente según el autor.
- Visión: el mmproj bf16 añade aproximadamente 0,6 GB de VRAM; hay que reducir `-c` para hacer sitio.
- GPU recomendadas: Intel Arc B580 (medida), GPUs NVIDIA con 12 GB o 16 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, en las clases de 12 GB y 16 GB con las cuantizaciones indicadas.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), y por compatibilidad de formato GGUF, frontends basados en llama.cpp como Ollama o LM Studio (no verificados explícitamente en la información disponible).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD (12 GB) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yukij_quant Uncensored 12GB (este) | ~28,8B totales, activos no disponibles | 128K | 0,0550 | Apache-2.0 | GGUF en HF |
| nokeepai Unbound v2.1 IQ2_M | no disponible | no disponible | 0,0551 | no disponible | GGUF en HF |
| AtomicChat Uncensored AD-IQ2_M | no disponible | no disponible | 0,0653 | no disponible | GGUF en HF |
| AtomicChat Uncensored AD-IQ3_S | no disponible | no disponible | 0,0194 | no disponible | GGUF en HF |

La comparación se limita a las builds de la misma familia evaluadas por el autor. No se dispone de datos de benchmarks de capacidad que permitan comparar con modelos de propósito general de tamaño similar.

## Limitaciones y advertencias

- El modelo está abliterado deliberadamente: no rechaza peticiones dañinas según la evaluación del autor (0 rechazos graduados sobre 96 peticiones). Esto lo hace inadecuado para despliegues públicos sin filtros externos.
- Un 31 de 96 respuestas fueron graduadas como evasivas, es decir, responden algo más seguro que lo solicitado; el comportamiento no es uniforme.
- El KLD reportado incluye el efecto de la cuantización y de la edición juntos; no aísla el coste de cada uno.
- La evaluación de rechazos solo se realizó en la build de 12 GB; la de 16 GB no se evaluó por separado.
- No hay lista oficial de idiomas soportados; la presencia de ruso en el conjunto de evaluación no implica cobertura completa.
- Riesgo de alucinación: no cuantificado en la información disponible; es esperable en modelos de este tamaño, especialmente con cuantizaciones agresivas IQ2/IQ3.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base enlaza una política de uso aceptable propia que el usuario debe respetar; la responsabilidad sobre las salidas recae en quien despliega.
- El rendimiento medido corresponde a una única plataforma (Intel Arc B580 con Vulkan); el comportamiento en CUDA u otras GPUs puede diferir.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación por parte de la comunidad es mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/YukijThird/Inkling-2-Mini-Uncensored-yukij_quant-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build sin edición del mismo autor: https://huggingface.co/YukijThird/Inkling-2-Mini-yukij_quant-GGUF
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Conjunto de evaluación de rechazos: mlabonne/harmful_behaviors (split de test), referenciado en la model card
