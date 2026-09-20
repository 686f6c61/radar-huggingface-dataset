# TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ4-mtp

## Resumen

Ternary-Bonsai-2-27B-MLX-oQ4-mtp es una build cuantizada en formato MLX safetensors del modelo ternario prism-ml/Ternary-Bonsai-2-27B, publicada por el usuario TokenAI-zer. El modelo base es a su vez una ternarización a 1,72 bits por peso del VLM híbrido Qwen/Qwen3.8-27B, con licencia Apache-2.0. Esta variante concreta aplica cuantización afín estándar de MLX en precisión mixta a 4,70 bits por peso (oQ4) sobre un backbone de 27.781.427.952 parámetros, y reparte el resultado en 4 shards que ocupan 15,85 GiB en disco.

La particularidad de esta build es doble. Por un lado, conserva la torre de visión (333 tensores) intacta en BF16, algo que la release oficial en MLX del modelo base no incluye. Por otro, injerta una cabecera de predicción multi-token (MTP) de 15 tensores y 0,42 B parámetros extraída sin modificar de Qwen/Qwen3.8-27B, lo que permite a oMLX ejecutar decodificación auto-especulativa. Según las mediciones del autor en un Apple M5 Max con 128 GB, el modelo pasa de 13,1-13,4 tok/s sin MTP a un rango de 15,9-23,9 tok/s con la cabecera activa, con una mejora máxima de aproximadamente 1,8x.

Es relevante ahora porque aborda un problema práctico poco documentado: cuantizar de nuevo un modelo ya ternario con cuantización afín estándar. El autor mide la fidelidad de cada variante (oQ2 a oQ8) contra la conversión BF16 de referencia y demuestra que la pérdida es monótona y no plana, porque la rejilla afín de 4 niveles sobre un grupo simétrico {−a, 0, +a} no puede representar el cero, que es el valor más frecuente en un tensor ternario. La build está pensada exclusivamente para Apple Silicon: es MLX safetensors, no GGUF, y no carga en llama.cpp, Ollama ni LM Studio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido de atención de la familia qwen3_5 (VLM con torre de visión), backbone ternarizado; pipeline image-text-to-text |
| Parametros totales | 27.781.427.952 (27,78 B) segun safetensors |
| Parametros activos | No aplica: no es un modelo MoE. Cabecera MTP adicional injertada de 0,42 B parametros (15 tensores) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ4 en precision mixta MLX, 4,70 bits por peso (etiquetado 4-bit); variantes hermanas oQ2 (3,00 bpw), oQ3 (3,70 bpw), oQ6 (6,70 bpw) y oQ8 (8,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors, 4 shards, 15,85 GiB (17,02 GB) en disco. No es GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, un VLM de 27B con atención híbrida y licencia Apache-2.0. Prism ML lo ternarizó a 1,72 bpw aplicando una rotación de Hadamard por bloques de forma online mediante kernels propios; en ese tensor ternario cada peso del backbone lingüístico toma uno de tres valores ({−a, 0, +a}) y el cero es el valor más común. Esta build parte de esa ternarización y aplica encima cuantización afín estándar de MLX, lo que la hace ejecutable en runtimes sin modificar (oMLX y mlx-vlm) en lugar de requerir el runtime propio de Prism ML.

Sobre el backbone se conservan dos elementos en precisión alta. La torre de visión queda intacta en BF16 (333 tensores). La cabecera MTP se injerta desde Qwen/Qwen3.8-27B sin modificar: 15 tensores y 0,42 B parámetros que habilitan decodificación auto-especulativa en oMLX. El autor advierte de que la cabecera fue entrenada contra estados ocultos de precisión completa y ahora lee estados ternarizados, por lo que su tasa de aceptación es inferior a la nativa de la familia (74% aproximadamente en el mismo equipo, frente al 44,5-67,4% medido aquí). No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si hubo RLHF o DPO en el modelo base; tampoco se documenta ningún proceso de reentrenamiento en esta build, que es puramente una conversión de cuantización.

Un detalle técnico relevante que documenta el autor: la cuantización afín construye su rejilla a partir del mínimo y el máximo del grupo, de modo que con 4 niveles sobre un grupo simétrico los puntos caen en −a, −a/3, +a/3 y +a, y el cero no es representable. Como el cero domina en un tensor ternario, más bits mejoran la aproximación de forma monótona, lo que explica que un modelo ternario siga ganando fidelidad al subir de bpw.

## Capacidades

- Generación de texto conversacional, con plantilla de chat aplicada vía `apply_chat_template` en mlx-vlm.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`): la torre de visión se mantiene en BF16, por lo que el modelo conserva la capacidad multimodal del modelo base.
- Decodificación auto-especulativa mediante la cabecera MTP injertada, activable con `mtp_enabled` en la configuración de oMLX. Sin esa opción la cabecera se carga pero la ruta especulativa no se ejecuta y solo se paga el coste de los pesos extra.
- Inferencia local en Apple Silicon a través de oMLX (servidor compatible con endpoint HTTP en el puerto 8000) o de mlx-vlm en modo librería.
- Capacidades multilingües: no disponible (no se declara lista de idiomas en la información proporcionada).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente multimodal local en portátil Apple Silicon: con 15,85 GiB de memoria unificada reservados para un prompt corto, el modelo permite conversar sobre imágenes y texto sin enviar datos a la nube, lo que encaja en entornos con requisitos de privacidad estrictos.
- Aceleración de generación en producción local mediante decodificación auto-especulativa: activando `mtp_enabled` en oMLX se pasa de 13,1-13,4 tok/s a 15,9-23,9 tok/s en un M5 Max, una mejora de hasta 1,8x sobre el mismo modelo y máquina.
- Servidor de inferencia OpenAI-compatible en estación de trabajo Mac: `omlx serve --model-dir ~/.omlx/models --port 8000` expone el modelo por HTTP para integrarlo en aplicaciones ya existentes que consuman ese formato de API.
- Descripción y análisis de imágenes en pipelines de accesibilidad o catalogación: la torre de visión intacta en BF16 permite generar descripciones de imágenes dentro de un flujo local, sin depender de servicios externos.
- Investigación sobre cuantización de modelos ternarios: la familia oQ2-oQ8 con métricas de divergencia KL, error relativo máximo y solapamiento top-1/top-5 permite estudiar empíricamente cuántos bits necesita realmente un tensor ternario re-cuantizado.
- Prototipado rápido de aplicaciones VLM con `mlx-vlm >= 0.7`: el ejemplo de la model card (cargar con `load`, aplicar plantilla con `num_images=0` y generar con `generate`) sirve como base para validar ideas antes de escalar a hardware dedicado.
- Evaluación comparativa de cabeceras especulativas injertadas: los datos de aceptación de borradores (31/46, 57/128 y 178/364 según longitud de salida) permiten medir el coste real de usar una cabecera MTP ajena sobre un backbone ternarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor publica en su lugar dos conjuntos de mediciones propias.

Fidelidad de la cuantización frente a la conversión BF16 de referencia, sobre cinco prompts y logits del último token en modo greedy (la build analizada es la oQ4, marcada en negrita):

| Build | bpw | Tamano en disco | KL(bf16‖q) | Error rel. max. | Top-1 | Top-5 |
|---|---|---|---|---|---|---|
| oQ2 | 3,00 | 10,83 GiB (11,63 GB) | 0,37658 | 0,2472 | 4/5 | 16/25 |
| oQ3 | 3,70 | 12,91 GiB (13,86 GB) | 0,03478 | 0,1077 | 5/5 | 21/25 |
| **oQ4** | **4,70** | **15,85 GiB (17,02 GB)** | **0,01476** | **0,0519** | **5/5** | **23/25** |
| oQ6 | 6,70 | 22,09 GiB (23,72 GB) | 0,00074 | 0,0164 | 5/5 | 24/25 |
| oQ8 | 8,50 | 27,94 GiB (30,00 GB) | 0,00008 | 0,0083 | 5/5 | 25/25 |

Aceptación de la cabecera MTP injertada, medida en oMLX sobre la build oQ6:

| Tokens generados | Borradores aceptados | Tokens por ciclo |
|---|---|---|
| 57 | 31/46 (67,4%) | 2,38 |
| 175 | 57/128 (44,5%) | 1,51 |
| 470 | 178/364 (48,9%) | 1,62 |

Rendimiento extremo a extremo en el mismo modelo y máquina (M5 Max, 128 GB): 13,1-13,4 tok/s sin MTP frente a 15,9-23,9 tok/s con MTP; la ejecución más larga alcanzó 23,9 tok/s frente a 13,1 de una ejecución comparable sin la cabecera, aproximadamente 1,8x. El autor señala que oQ2 es la única build que invierte una predicción top-1 en la muestra y desaconseja tratarla como una opción sin coste. También advierte de que la referencia de todas estas medidas es la conversión BF16 y no el GGUF original, de modo que cualquier error en esa conversión se heredaría en todas las builds sin aparecer en la tabla.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con macOS 15 o superior. Construido y probado en un M5 Max con 128 GB de memoria unificada.
- Memoria: aproximadamente 15,85 GiB de memoria unificada libre para un prompt corto, y más para contexto largo. El repositorio ocupa 17,0 GB en disco.
- GPU compatibles: no se soportan GPU NVIDIA, AMD ni Intel. El formato es MLX safetensors y no carga en llama.cpp, Ollama ni LM Studio.
- Encaje en hardware de consumo: sí, en equipos Apple Silicon con al menos 16 GiB de memoria unificada para la build oQ4; las variantes oQ2 (11,63 GB) y oQ3 (13,86 GB) reducen el requisito, mientras que oQ6 (23,72 GB) y oQ8 (30,00 GB) exigen configuraciones de 32 GB o superiores.
- Opciones de despliegue: oMLX 0.6.4 o superior para decodificación especulativa con MTP; mlx-vlm 0.7 o superior para inferencia simple. No hay soporte para vLLM, TGI ni llama.cpp en este formato.
- Latencia y throughput: 13,1-13,4 tok/s sin MTP y 15,9-23,9 tok/s con MTP en M5 Max de 128 GB. No se dispone de datos de latencia para otras configuraciones.

## Comparativa con modelos similares

La comparación natural es con las demás builds de la misma familia y con las dos etapas anteriores de la cadena de conversión.

| Modelo | Parametros | bpw / precision | Contexto | Licencia | Formato y disponibilidad |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-MLX-oQ4-mtp (esta ficha) | 27,78 B + 0,42 B de MTP | 4,70 bpw, precision mixta | no disponible | Apache-2.0 | MLX safetensors, 4 shards; requiere oMLX o mlx-vlm |
| Ternary-Bonsai-2-27B-MLX-oQ3-mtp | mismos | 3,70 bpw | no disponible | Apache-2.0 | MLX safetensors, 3 shards; mejor relacion tamano-fidelidad segun el autor |
| Ternary-Bonsai-2-27B-MLX-oQ8-mtp | mismos | 8,50 bpw | no disponible | Apache-2.0 | MLX safetensors, 6 shards; 30 GB, practicamente indistinguible de bf16 |
| prism-ml/Ternary-Bonsai-2-27B-gguf (modelo base) | mismos | 1,72 bpw ternario con kernels propios | no disponible | no disponible | GGUF; requiere el runtime de Prism ML, sin vision y sin MTP |
| Qwen/Qwen3.8-27B (origen) | 27 B | BF16 | no disponible | Apache-2.0 | Peso completo; origen de los 15 tensores MTP |

Frente a las alternativas de la misma categoria: oQ4 ofrece una KL de 0,01476 con 5/5 en top-1 y 23/25 en top-5, mientras que oQ3 se queda en 21/25 de top-5 con menos de la mitad de fidelidad en KL y oQ8 apenas mejora la coincidencia top-5 (24/25) a cambio de casi el doble de espacio en disco. Frente al GGUF base, esta build pierde el empaquetado de 1,72 bpw pero gana compatibilidad con runtimes sin modificar, visión y decodificación especulativa. No se dispone de comparativas con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Formato no portable: al ser MLX safetensors no carga en llama.cpp, Ollama ni LM Studio. Solo funciona en Apple Silicon mediante oMLX o mlx-vlm.
- Dependencia de versión estricta: se requiere oMLX 0.6.4 o superior para la ruta MTP y mlx-vlm 0.7 o superior para inferencia simple; versiones anteriores pueden no cargar el modelo correctamente.
- Pérdida de fidelidad medible: incluso en oQ4, la divergencia KL frente a bf16 es de 0,01476 y el error relativo máximo de 0,0519; el solapamiento top-5 es de 23/25, no perfecto.
- Rejilla de cuantización incapaz de representar el cero: la cuantización afín sobre grupos ternarios simétricos no incluye el valor cero, el más frecuente del tensor, lo que obliga a subir de bits para compensar.
- Referencia de medición dudosa: todas las métricas del autor se calculan contra la conversión BF16, no contra el GGUF original; un error en esa conversión se propagaría a todas las builds sin reflejarse en las tablas.
- Cabecera MTP prestada: procede de un modelo de precisión completa y lee estados ternarizados, por lo que acepta menos borradores que una cabecera nativa (44,5-67,4% frente a un 74% de referencia), y solo aporta velocidad si se activa explícitamente `mtp_enabled`.
- Idioma y contexto sin declarar: no se especifica la lista de idiomas soportados ni la longitud de contexto, lo que impide garantizar comportamiento multilingüe o conversaciones de contexto largo en producción.
- Validación comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin pruebas independientes que confirmen las cifras publicadas.
- Ausencia de benchmarks estándar: no hay resultados de MMLU, HumanEval, GSM8K ni similares, por lo que el rendimiento en tareas concretas solo puede inferirse de la fidelidad de cuantización.
- Desvinculación del autor: el publicador declara no estar afiliado a Prism ML, pipenetwork ni Alibaba Cloud, así que el soporte y la trazabilidad dependen de un tercero.
- Licencia Apache-2.0 heredada de la cadena de conversiones, sin restricciones declaradas para uso comercial, pero conviene verificar las condiciones de cada eslabón (Qwen y Prism ML) antes de desplegar.
- La model card está truncada: la sección de procedencia se corta en el paso 3, por lo que los dos últimos pasos de la cadena de conversión no están documentados en la información disponible.

## Enlaces

- Ficha del modelo: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ4-mtp
- Variante oQ2: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ2-mtp
- Variante oQ3: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ3-mtp
- Variante oQ6: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ6-mtp
- Variante oQ8: https://huggingface.co/TokenAI-zer/Ternary-Bonsai-2-27B-MLX-oQ8-mtp
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Modelo de origen de la cabecera MTP: https://huggingface.co/Qwen/Qwen3.8-27B

Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados irrelevantes (paginas comerciales de alquiler de libros de texto de Chegg), por lo que no se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este modelo.
