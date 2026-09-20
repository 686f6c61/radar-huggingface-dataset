# TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ8-mtp

## Resumen

Ternary-Bonsai-2-27B-MLX-oQ8-mtp es una cuantizacion MLX de precision mixta del modelo ternario Bonsai 2 27B de Prism ML, publicada por el usuario TokenAI-zer. El modelo de partida es `prism-ml/Ternary-Bonsai-2-27B-gguf`, una ternarizacion de un VLM de 27B (identificado en la model card como Qwen/Qwen3.8-27B) a 1,72 bits por peso con rotacion Hadamard por bloques aplicada en linea por kernels propios de Prism ML. Esta version concreta reconstruye los pesos con la cuantizacion estandar de MLX en formato oQ8 (8,50 bits por peso) y conserva la torre de vision en BF16.

El problema que resuelve es de compatibilidad y de fidelidad numerica. La publicacion oficial en MLX de Bonsai 2 llega sin vision y sin cabeza MTP, y exige el runtime propietario de prism-ml. Esta build, en cambio, funciona sobre oMLX sin modificar y sobre `mlx-vlm` estandar, e incorpora una cabeza de prediccion multi-token (MTP) de 15 tensores y 0,42 B de parametros extraida de `Qwen/Qwen3.8-27B`, lo que habilita decodificacion especulativa autoinducida sobre hardware Apple Silicon.

La relevancia actual es doble: demuestra empiricamente que un modelo ternario sigue ganando fidelidad al aumentar los bits de cuantizacion (la divergencia KL cae de 0,37658 en oQ2 a 0,00008 en oQ8), y aporta una medicion real de hasta que punto una cabeza MTP entrenada sobre estados ocultos en precision completa funciona cuando lee estados ternarizados. El modelo tiene 27.781.427.952 parametros totales y el repositorio ocupa 30,0 GB repartidos en 6 shards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de atencion hibrida con torre de vision (VLM), segun la provenance de la model card; backbone ternario con rotacion Hadamard por bloques en los kernels originales |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ8 (8,50 bits por peso) en esta build; la familia incluye oQ2 (3,00 bpw), oQ3 (3,70 bpw), oQ4 (4,70 bpw) y oQ6 (6,70 bpw). El modelo base ternario original se empaqueta a 1,72 bpw en GGUF |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | MLX safetensors (no GGUF); 6 shards, 27,94 GiB en disco |

## Arquitectura y entrenamiento

No hay informacion sobre el proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF o DPO) en la informacion disponible. Lo que si se documenta es la cadena de transformaciones. El punto de partida es Qwen/Qwen3.8-27B, descrito como un VLM de 27B con atencion hibrida y licencia Apache-2.0. Sobre ese modelo, Prism ML aplica una ternarizacion a 1,72 bpw con rotacion Hadamard por bloques aplicada en linea mediante kernels propios. Posteriormente, TokenAI-zer aplica cuantizacion afin mixta de MLX en cinco configuraciones de precision creciente, conserva los 333 tensores de la torre de vision en BF16 sin tocar, e injerta 15 tensores `mtp.*` (0,42 B de parametros) procedentes de Qwen/Qwen3.8-27B sin modificar.

La innovacion tecnica destacable es esa cabeza MTP injertada, que habilita decodificacion especulativa sin necesidad de un modelo borrador separado. La model card documenta un detalle relevante del proceso de cuantizacion: la cuantizacion afin construye su rejilla a partir del minimo y el maximo del grupo, de modo que con 4 niveles sobre un grupo simetrico {−a, 0, +a} los niveles resultantes son −a, −a/3, +a/3 y +a, lo que implica que el cero exacto no es representable pese a ser el valor mas frecuente en un tensor ternario. De ahi que la perdida decrezca de forma monotona y no plana al subir de bits.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `image-text-to-text` y `conversational`.
- Procesamiento de vision: la torre de vision se conserva integra en BF16 (333 tensores), a diferencia de la release oficial en MLX, que llega sin vision.
- Decodificacion especulativa autoinducida mediante la cabeza MTP injertada, activable con `mtp_enabled` en oMLX. Sin esa opcion la cabeza se carga pero la ruta especulativa no se ejecuta.
- Razonamiento multi-turno y conversacion: no hay datos verificables sobre tool calling, function calling ni razonamiento agente multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking: no disponible en la informacion proporcionada.
- Inferencia estandar en `mlx-vlm` sin necesidad de runtime propietario.

## Casos de uso

- Inferencia local en Apple Silicon de gama alta: con 27,94 GiB de disco y unos 27,94 GiB de memoria unificada libre para prompts cortos, el modelo encaja en un Mac con 64 GB o mas de memoria unificada, lo que permite ejecutar un VLM de 27B en local sin GPU dedicada.
- Asistentes multimodales de escritorio: la torre de vision en BF16 permite tareas de descripcion de imagenes y respuesta a preguntas sobre imagenes integradas en aplicaciones nativas de macOS, algo que la release MLX oficial de Bonsai 2 no ofrece.
- Generacion de texto interactiva de baja latencia: con MTP activado se midieron 15,9 a 23,9 tok/s frente a 13,1-13,4 tok/s sin el, lo que lo hace adecuado para chat en streaming en un unico equipo, no para servir a muchos usuarios concurrentes.
- Pruebas de fidelidad de cuantizacion en investigacion: las metricas de divergencia KL y error relativo maximo por build permiten usar el modelo como caso de estudio reproducible sobre el comportamiento de la cuantizacion afin en pesos ternarios.
- Desarrollo y depuracion de decodificacion especulativa: sirve como banco de pruebas para medir tasas de aceptacion de borradores cuando la cabeza MTP no fue entrenada contra los estados ocultos que finalmente consume (44,5-67,4 % frente al ~74 % de una cabeza nativa).
- Prototipado de pipelines VLM en `mlx-vlm`: al funcionar con la libreria estandar (`mlx-vlm >= 0.7`), se integra en scripts Python de investigacion sin dependencias propietarias.
- Archivado y distribucion de variantes cuantizadas: al mantener el mismo backbone en cinco niveles de precision, permite comparar coste de memoria frente a fidelidad en un mismo framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card si aporta metricas de fidelidad de cuantizacion medidas contra la conversion BF16 de origen, sobre cinco prompts y comparando logits del ultimo token en modo greedy:

| Build | bpw | Tamano en disco | Shards | KL(bf16‖q) | Error rel. max. | Top-1 | Top-5 |
|---|---|---|---|---|---|---|---|
| oQ2 | 3,00 | 10,83 GiB (11,63 GB) | 3 | 0,37658 | 0,2472 | 4/5 | 16/25 |
| oQ3 | 3,70 | 12,91 GiB (13,86 GB) | 3 | 0,03478 | 0,1077 | 5/5 | 21/25 |
| oQ4 | 4,70 | 15,85 GiB (17,02 GB) | 4 | 0,01476 | 0,0519 | 5/5 | 23/25 |
| oQ6 | 6,70 | 22,09 GiB (23,72 GB) | 5 | 0,00074 | 0,0164 | 5/5 | 24/25 |
| oQ8 (esta build) | 8,50 | 27,94 GiB (30,00 GB) | 6 | 0,00008 | 0,0083 | 5/5 | 25/25 |

Rendimiento de la cabeza MTP medida en oMLX sobre la build oQ6:

| Tokens generados | Borradores aceptados | Tokens/ciclo |
|---|---|---|
| 57 | 31/46 (67,4 %) | 2,38 |
| 175 | 57/128 (44,5 %) | 1,51 |
| 470 | 178/364 (48,9 %) | 1,62 |

Extremo a extremo, sobre el mismo modelo y maquina: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP, con un maximo de aproximadamente 1,8x de mejora. Como referencia, un modelo de la misma familia con su cabeza MTP nativa acepta cerca del 74 % en la misma configuracion.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS 15 o superior. Construido y probado en un M5 Max con 128 GB de memoria unificada.
- Memoria unificada: aproximadamente 27,94 GiB libres para un prompt corto, y mas para contexto largo. En la practica esto implica un equipo con al menos 36-48 GB de memoria unificada para operar con holgura, y no cabe en configuraciones de 16 o 24 GB.
- GPU compatibles: ninguna GPU NVIDIA o AMD. El formato MLX safetensors no es cargable en CUDA.
- Compatibilidad con runtimes: requiere oMLX >= 0.6.4 para decodificacion especulativa MTP, o `mlx-vlm >= 0.7` para inferencia simple. No carga en llama.cpp, Ollama ni LM Studio, porque no es GGUF.
- Throughput medido: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP en un M5 Max, dependiendo de la longitud de generacion.
- Cuantizacion alternativa segun memoria: oQ6 requiere 22,09 GiB, oQ4 15,85 GiB, oQ3 12,91 GiB y oQ2 10,83 GiB, lo que permite bajar a equipos con 24-32 GB de memoria unificada a costa de fidelidad.

## Comparativa con modelos similares

La comparacion mas directa es con las otras builds de la misma familia, todas derivadas del mismo backbone ternario:

| Modelo | Parametros | bpw / formato | Memoria en disco | Fidelidad (KL vs bf16) | Licencia | Notas |
|---|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-oQ8-mtp (esta build) | 27,78 B | 8,50 bpw, MLX safetensors | 27,94 GiB | 0,00008 | apache-2.0 | Practicamente indistinguible del bf16 segun el autor; top-5 25/25 |
| Ternary-Bonsai-2-27B-MLX-oQ6-mtp | 27,78 B | 6,70 bpw, MLX safetensors | 22,09 GiB | 0,00074 | apache-2.0 | Alta fidelidad con 5,85 GiB menos |
| Ternary-Bonsai-2-27B-MLX-oQ4-mtp | 27,78 B | 4,70 bpw, MLX safetensors | 15,85 GiB | 0,01476 | apache-2.0 | Opcion equilibrada |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | 27 B aprox. | 1,72 bpw, GGUF | no disponible | no disponible | apache-2.0 (heredada) | Maxima compresion, requiere kernels y runtime propios de prism-ml |

Frente a modelos de otras familias del mismo rango (por ejemplo, alternativas densas de ~27B en BF16), lo relevante no es el rendimiento bruto sino el eje memoria-fidelidad: la familia completa cabe entre 10,83 y 27,94 GiB con licencia Apache-2.0, pero queda restringida al ecosistema Apple. No se dispone de datos de benchmarks que permitan comparar calidad de tarea con modelos de otros fabricantes.

## Limitaciones y advertencias

- Alcance de plataforma muy restringido: solo Apple Silicon y macOS 15+. No hay ruta de despliegue en CUDA, ROCm ni en runtimes basados en GGUF.
- La cuantizacion afin no puede representar el cero exacto en grupos ternarios de 4 niveles, lo que explica la perdida de fidelidad en las builds de pocos bits; oQ2 llega a invertir una prediccion top-1 en la muestra medida.
- La referencia usada para medir fidelidad es la conversion a BF16, no el GGUF original. Cualquier error introducido en esa conversion se hereda en todas las builds y no se detectaria en la tabla de KL.
- La cabeza MTP es injertada, no nativa: acepta entre 44,5 y 67,4 % frente al ~74 % de una cabeza nativa, porque fue entrenada contra estados ocultos en precision completa y ahora lee estados ternarizados. Sin `mtp_enabled` en oMLX la cabeza se carga y consume memoria sin aportar aceleracion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. El modelo parte de un backbone ternario, con la perdida de fidelidad acumulada que eso implica.
- Idiomas soportados y longitud de contexto: no disponibles, lo que impide planificar despliegues multilingues o de contexto largo con garantias.
- Procedencia parcialmente truncada: la model card corta la seccion de provenance en el paso 3, por lo que no se puede verificar la totalidad de los pasos intermedios ni si hubo etapas adicionales de ajuste.
- Trazabilidad y validacion comunitaria minimas: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada es 2026-09-19.
- Uso comercial: la licencia declarada es apache-2.0, heredada de la cadena de modelos base. Conviene verificar de forma independiente las condiciones de `prism-ml/Ternary-Bonsai-2-27B-gguf` y de `Qwen/Qwen3.8-27B` antes de un despliegue en produccion.
- La model card indica explicitamente que el autor no esta afiliado a Prism ML, pipenetwork ni Alibaba Cloud, lo que refuerza que se trata de una build de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ8-mtp
- Variante oQ6: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ6-mtp
- Variante oQ4: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ4-mtp
- Variante oQ3: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp
- Variante oQ2: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp
- Modelo base ternario en GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de origen del backbone y de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.8-27B

Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de Visual Studio y Visual Studio Code (visualstudio.microsoft.com, code.visualstudio.com y la entrada de Wikipedia sobre Visual Studio). No guardan relacion con el modelo y no aportan informacion adicional utilizable.
