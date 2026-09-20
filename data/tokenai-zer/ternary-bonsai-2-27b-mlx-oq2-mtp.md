# TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp

## Resumen

Ternary-Bonsai-2-27B-MLX-oQ2-mtp es una compilación cuantizada en formato MLX del modelo multimodal Ternary-Bonsai-2-27B de prism-ml, publicada por el usuario TokenAI-zer. Se trata de un VLM de 27.781.427.952 parámetros (27,78 B) cuyos pesos de lenguaje son ternarios —cada peso toma uno de tres valores— y que ha sido reconstruido con la cuantización de precisión mixta oQ2 de oMLX 0.6.4, equivalente a 3,00 bits por peso y un tamaño en disco de 10,83 GiB (11,63 GB) repartidos en tres shards. Frente a la publicación MLX oficial del modelo base, que exige el runtime propio de prism-ml y prescinde de visión y de MTP, esta versión funciona en oMLX y mlx-vlm sin modificar y conserva el torre de visión (333 tensores en BF16) y una cabeza de predicción multi-token.

La innovación principal es el injerto de una cabeza MTP de 15 tensores y 0,42 B de parámetros procedente de Qwen/Qwen3.8-27B, que permite a oMLX ejecutar decodificación autoespeculativa sobre un modelo ternario. El autor publica mediciones de aceptación de borradores (44,5 %-67,4 %) y de velocidad (de 13,1-13,4 tok/s sin MTP a 15,9-23,9 tok/s con MTP, aproximadamente 1,8x) en un Apple M5 Max con 128 GB. También documenta con detalle el coste de fidelidad de cada nivel de cuantización, lo que convierte a esta ficha en un caso poco habitual: la model card ofrece datos medidos en lugar de estimaciones.

Su relevancia práctica es doble. Por un lado, permite ejecutar un VLM de 27 B en memoria unificada de Apple Silicon con unos 10,83 GiB libres, algo que el modelo en bf16 no permite. Por otro, sirve como banco de pruebas para estudiar cómo se degradan los pesos ternarios al aplicarles cuantización afín adicional, un fenómeno que el autor cuantifica y explica. La licencia es Apache 2.0, el repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y la model card está truncada en los pasos 3 y 4 de su sección de procedencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida (base Qwen3.8-27B) más torre de visión y cabeza MTP; pesos de lenguaje ternarios con valores {−a, 0, +a} |
| Parámetros totales | 27.781.427.952 (27,78 B), dato real de safetensors |
| Parámetros activos | no aplica (no es un modelo MoE); la cabeza MTP añade 0,42 B de parámetros |
| Longitud de contexto | no disponible |
| Tipos de cuantización | oQ2, 3,00 bits por peso (esta compilación); la familia incluye también oQ3 (3,70 bpw), oQ4 (4,70 bpw), oQ6 (6,70 bpw) y oQ8 (8,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (no GGUF; no carga en llama.cpp, Ollama ni LM Studio) |
| Tamaño en disco | 10,83 GiB (11,63 GB), 3 shards |
| Torre de visión | 333 tensores, sin modificar, en BF16 |
| Cabeza MTP | 15 tensores, 0,42 B de parámetros, procedente de Qwen/Qwen3.8-27B |
| Pipeline | image-text-to-text (conversacional) |
| Librería | mlx |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.8-27B, un VLM de 27 B con atención híbrida y licencia Apache 2.0. Sobre esa base, prism-ml aplicó una ternarización que reduce cada peso de lenguaje a uno de tres valores, con empaquetado a 1,72 bits por peso en el GGUF original y una rotación de Hadamard por bloques aplicada en línea por sus propios kernels. Esta compilación no reutiliza esos kernels: parte del GGUF ternario ya convertido y le aplica la cuantización afín estándar de MLX en precisión mixta, de modo que el resultado carga en oMLX y mlx-vlm sin parches. Además, se injertan dos componentes que la publicación MLX oficial del modelo base no incluye: la torre de visión completa, mantenida intacta en BF16, y una cabeza MTP extraída sin modificar de Qwen3.8-27B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO; esos datos corresponden al modelo original y no aparecen en la información proporcionada. El elemento técnico más interesante de esta ficha es el análisis de por qué un modelo ternario sigue ganando con más bits: la cuantización afín construye su rejilla a partir del mínimo y el máximo del grupo, y con cuatro niveles sobre un grupo simétrico {−a, 0, +a} los niveles caen en −a, −a/3, +a/3 y +a, de manera que el cero no es representable pese a ser el valor más frecuente en un tensor ternario. De ahí que la pérdida de fidelidad respecto a bf16 sea monótona y pronunciada al bajar de bits, y que oQ2 sea la única compilación de la familia que invierte una predicción top-1 en la muestra de cinco prompts evaluada. En el lado del MTP, la cabeza fue entrenada contra estados ocultos en precisión completa y ahora lee estados ternarizados, lo que explica una aceptación de borradores inferior a la de un modelo con cabeza MTP nativa (74 % en la misma configuración).

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat aplicable mediante `apply_chat_template` en mlx-vlm.
- Comprensión de imágenes: el pipeline declarado es image-text-to-text y la torre de visión se conserva íntegra en BF16, por lo que admite entradas de imagen junto a texto (descripción, resumen y extracción de información de capturas, diagramas o documentos escaneados).
- Decodificación autoespeculativa mediante la cabeza MTP injertada, activable con `mtp_enabled` en oMLX 0.6.4 o superior; genera entre 2,38 y 1,51 tokens por ciclo según la longitud de la secuencia.
- Ejecución en Apple Silicon con cuantización de 3,00 bits por peso, con un consumo de memoria de 10,83 GiB para prompts cortos.
- Razonamiento y generación de código o matemáticas: no documentados explícitamente en la información disponible.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (el campo de idiomas no está disponible).
- Modo de pensamiento explícito (thinking mode), audio u otras modalidades: no documentados.

## Casos de uso

- Análisis de imágenes y documentos en local sobre Mac: gracias al pipeline image-text-to-text y a la torre de visión en BF16, se pueden procesar capturas de pantalla, diagramas técnicos o documentos escaneados sin que las imágenes salgan del equipo, algo relevante en entornos con requisitos de confidencialidad.
- Asistentes conversacionales de escritorio: al estar clasificado como conversacional y admitir plantilla de chat, encaja en asistentes integrados en aplicaciones de macOS que mantengan el contexto en memoria unificada.
- Prototipado e investigación en cuantización: la tabla de fidelidad publicada (divergencia KL, error relativo máximo, coincidencia top-1 y top-5 frente a bf16) convierte esta compilación en un banco de pruebas reproducible para estudiar el efecto de la precisión mixta sobre pesos ternarios.
- Evaluación y docencia sobre decodificación especulativa: las mediciones de aceptación de borradores (67,4 % a 57 tokens generados, 44,5 % a 175, 48,9 % a 470) permiten ilustrar con datos reales cuándo compensa el MTP y cuándo no.
- Despliegue en portátiles Apple Silicon con memoria unificada ajustada: con 10,83 GiB de memoria para prompts cortos, cabe en equipos que no podrían alojar el modelo en bf16 ni la versión GGUF con kernels propios.
- Servicio de inferencia local expuesto por HTTP: `omlx serve --model-dir ... --port 8000` levanta un endpoint que puede consumir una aplicación de escritorio o un script interno, manteniendo el modelo en el propio equipo.
- Preliminar de un pipeline mayor de visión-lenguaje: al conservar visión y formato MLX estándar, sirve para validar prompts y flujos antes de migrar a una compilación con mayor fidelidad (oQ4, oQ6 u oQ8).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card sí publica dos conjuntos de mediciones propias, que se reproducen a continuación.

Fidelidad de cuantización frente a la conversión bf16 del mismo modelo (logits del último token, decodificación greedy, cinco prompts) para la compilación oQ2 y sus alternativas de la misma familia:

| Compilación | bpw | En disco | Shards | KL(bf16‖q) | Error rel. máx. | Top-1 | Top-5 |
|---|---|---|---|---|---|---|---|
| oQ2 (esta) | 3,00 | 10,83 GiB (11,63 GB) | 3 | 0,37658 | 0,2472 | 4/5 | 16/25 |
| oQ3 | 3,70 | 12,91 GiB (13,86 GB) | 3 | 0,03478 | 0,1077 | 5/5 | 21/25 |
| oQ4 | 4,70 | 15,85 GiB (17,02 GB) | 4 | 0,01476 | 0,0519 | 5/5 | 23/25 |
| oQ6 | 6,70 | 22,09 GiB (23,72 GB) | 5 | 0,00074 | 0,0164 | 5/5 | 24/25 |
| oQ8 | 8,50 | 27,94 GiB (30,00 GB) | 6 | 0,00008 | 0,0083 | 5/5 | 25/25 |

Rendimiento de la cabeza MTP injertada, medido en oMLX sobre la compilación oQ6:

| Tokens generados | Borradores aceptados | Tokens por ciclo |
|---|---|---|
| 57 | 31/46 (67,4 %) | 2,38 |
| 175 | 57/128 (44,5 %) | 1,51 |
| 470 | 178/364 (48,9 %) | 1,62 |

Velocidad extremo a extremo en el mismo modelo y máquina: 13,1-13,4 tok/s sin MTP frente a 15,9-23,9 tok/s con MTP, con un máximo de 23,9 tok/s en la ejecución más larga (aproximadamente 1,8x). Para referencia, un modelo de esta familia con cabeza MTP nativa acepta en torno al 74 % de los borradores en la misma configuración.

Advertencia del propio autor sobre la medición: la referencia es la conversión bf16, no el GGUF original, de modo que un error introducido en esa conversión se heredaría en todas las compilaciones y no aparecería en la tabla.

## Requisitos de hardware

- Plataforma: Apple Silicon con macOS 15 o superior. La compilación se construyó y probó en un Apple M5 Max con 128 GB de memoria unificada.
- Memoria: aproximadamente 10,83 GiB de memoria unificada libre para un prompt corto, y más para contexto largo (la longitud de contexto no está documentada, así que no puede acotarse el crecimiento).
- GPU compatibles: exclusivamente GPUs integradas de Apple Silicon (series M). No hay soporte para A100, H100, RTX 4090 ni otras GPUs discretas, ya que el formato MLX y los kernels asociados son específicos de Apple.
- Viabilidad en hardware de consumo: sí, en Macs con memoria unificada suficiente; el requisito de 10,83 GiB deja fuera a la mayoría de configuraciones de 8 GB y encaja con holgura en equipos de 16 GB o más, con margen creciente en 32, 64 y 128 GB.
- Opciones de despliegue: oMLX 0.6.4 o superior (necesario para la decodificación especulativa con MTP) o `mlx-vlm` 0.7 o superior en su versión estándar para inferencia simple. No es compatible con llama.cpp, Ollama, LM Studio ni, en general, con servidores basados en GGUF como vLLM o TGI.
- Latencia y throughput: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP habilitado, medidos en un M5 Max de 128 GB. Entre 1,51 y 2,38 tokens por ciclo según la longitud de la generación.
- Nota operativa: si se carga la compilación en oMLX sin activar `mtp_enabled`, la cabeza MTP se carga en memoria pero la ruta especulativa nunca se ejecuta, con lo que se paga el coste de sus pesos sin obtener la aceleración.

## Comparativa con modelos similares

La comparación más pertinente es dentro de la propia familia de compilaciones, ya que todas parten del mismo modelo base ternario y comparten licencia y formato:

| Modelo | Parámetros | Contexto | Fidelidad frente a bf16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-oQ2-mtp (esta) | 27,78 B + 0,42 B MTP | no disponible | KL 0,37658; top-1 4/5 | Apache 2.0 | MLX safetensors, oMLX / mlx-vlm |
| Ternary-Bonsai-2-27B-MLX-oQ3-mtp | 27,78 B + 0,42 B MTP | no disponible | KL 0,03478; top-1 5/5 | Apache 2.0 | MLX safetensors, oMLX / mlx-vlm |
| Ternary-Bonsai-2-27B-MLX-oQ4-mtp | 27,78 B + 0,42 B MTP | no disponible | KL 0,01476; top-1 5/5 | Apache 2.0 | MLX safetensors, oMLX / mlx-vlm |
| prism-ml/Ternary-Bonsai-2-27B-gguf (base) | 27 B (ternario, 1,72 bpw) | no disponible | referencia de partida | Apache 2.0 | GGUF con kernels propios; sin visión ni MTP en la versión MLX oficial |
| Qwen/Qwen3.8-27B (origen) | 27 B en bf16 | no disponible | precisión completa | Apache 2.0 | safetensors; atención híbrida y VLM, sin ternarizar |

Frente a alternativas de otros fabricantes del mismo orden de tamaño no se dispone de datos comparativos en la información proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Pérdida de fidelidad medible en oQ2: divergencia KL de 0,37658 y error relativo máximo de 0,2472 frente a bf16, con inversión de la predicción top-1 en uno de los cinco prompts evaluados. El propio autor lo describe como la opción para "caber en menos memoria", no como una solución sin coste.
- Causa estructural de esa pérdida: la cuantización afín de cuatro niveles sobre un grupo simétrico ternario no puede representar el valor cero, que es el más frecuente en un tensor ternario. Subir a oQ3 u oQ4 reduce el problema de forma sustancial (KL 0,03478 y 0,01476 respectivamente).
- Base de la medición cuestionable: la referencia empleada es la conversión bf16, no el GGUF original. Un error en esa conversión se heredaría en todas las compilaciones y no se detectaría en las tablas publicadas.
- Cabeza MTP injertada, no nativa: procede de Qwen/Qwen3.8-27B y fue entrenada contra estados ocultos en precisión completa, pero ahora lee estados ternarizados. La aceptación de borradores cae a 44,5 %-67,4 % frente al 74 % de una cabeza nativa en la misma configuración.
- Compatibilidad muy restringida: formato MLX safetensors que no carga en llama.cpp, Ollama ni LM Studio. Requiere oMLX 0.6.4 o superior, o mlx-vlm 0.7 o superior, y hardware Apple Silicon con macOS 15 o superior.
- Longitud de contexto no documentada, lo que impide planificar despliegues con prompts largos o conversaciones extensas. La memoria necesaria crece con el contexto y solo se documenta el valor para prompts cortos (10,83 GiB).
- Idiomas soportados no documentados: no puede asumirse un rendimiento homogéneo en castellano sin evaluarlo.
- Riesgo de alucinación: no cuantificado en la información disponible. Es un riesgo esperable en cualquier modelo generativo, agravado aquí por la pérdida de fidelidad de la cuantización oQ2.
- Trazabilidad incompleta: la sección de procedencia de la model card está truncada en los pasos 3 y 4, de modo que no puede verificarse la cadena completa de transformaciones a partir de la información proporcionada.
- Licencia: Apache 2.0, que permite uso comercial, pero el modelo deriva de pesos ternarizados de prism-ml y, en última instancia, de Qwen3.8-27B. Conviene verificar las condiciones de cada eslabón antes de un despliegue en producción.
- Autoría y validación: el publicador declara no estar afiliado a Prism ML, pipenetwork ni Alibaba Cloud. El repositorio acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad.
- Fecha de creación: 19 de septiembre de 2026, según los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp
- Variante oQ3: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp
- Variante oQ4: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ4-mtp
- Variante oQ6: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ6-mtp
- Variante oQ8: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ8-mtp
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo base sin el sufijo gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B
- Origen de la cabeza MTP y del backbone: https://huggingface.co/Qwen/Qwen3.8-27B
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a un sorteo de lotería estadounidense y se han descartado por no guardar relación con el objeto de la ficha. No se han localizado papers, blogs, repositorios ni demos adicionales en la información disponible.
