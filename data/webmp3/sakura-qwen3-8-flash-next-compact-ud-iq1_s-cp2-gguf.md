# webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-IQ1_S-CP2-GGUF

## Resumen

Sakura-Qwen3.8-Flash-Next-Compact-UD-IQ1_S-CP2 es un reempaquetado comunitario experimental, publicado por el usuario webmp3, de una cuantización de 1 bit del modelo Qwen3.8-Flash-Next de Qwen. No es un modelo entrenado desde cero: parte del GGUF UD-IQ1_S generado por Unsloth y sustituye únicamente el tensor `per_layer_token_embd.weight` del shard 2 por la tabla CP2 del paquete Sakura K512 CP2, conservando los 512 expertos enrutados del modelo original. El resultado son 53,259 GiB de ficheros GGUF que representan un modelo de 176.943.899.520 parámetros totales.

El interés de la publicación es estructural, no de calidad: el propio autor advierte que esta combinación exacta de pesos Unsloth + tabla CP2 no se ha cargado para inferencia ni se ha evaluado en generación, perplejidad, calidad o velocidad. Se distribuye junto con un runtime Windows x64 Vulkan propio, y el autor insiste en que llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para esta tabla CP2 personalizada.

Por tanto, la ficha debe leerse como la de un artefacto de investigación sobre cuantización extrema de un MoE de gran tamaño, no como la de un modelo listo para producción. Los datos de contexto, parámetros activos, entrenamiento y benchmarks no están disponibles en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; MoE con 512 expertos enrutados (hereda la del modelo base Qwen3.8-Flash-Next) |
| Parametros totales | 176.943.899.520 (176,9 B, dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ1_S (IQ1 dinámica de Unsloth), con imatrix; este repositorio solo incluye ese nivel de cuantización |
| Idiomas soportados | de, en, zh |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); los pesos conservan esa licencia |
| Formato de pesos | GGUF (3 shards, 53,259 GiB totales; repositorio de 57,3 GB) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio. La arquitectura subyacente es la de Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos con 512 expertos enrutados según la model card, cuantizado por Unsloth a UD-IQ1_S (aproximadamente 1 bit por peso, con matriz de importancia o imatrix para preservar los tensores más sensibles). Sobre esa base, el autor aplica un reempaquetado quirúrgico: los shards 1 y 3 se copian sin cambios y en el shard 2 se conservan todos los tensores no tabulares, reemplazando solo `per_layer_token_embd.weight` por la tabla CP2 ya existente del paquete Sakura K512 CP2.

La innovación declarada es, por tanto, de formato y despliegue: mantener la totalidad de los 512 expertos en un contenedor de ~53 GiB y reutilizar la tabla CP2 y el runtime Vulkan de la familia Sakura para intentar ejecutarlo en hardware de memoria unificada. No hay información sobre tokens de entrenamiento, composición del dataset, RLHF/DPO ni innovaciones de atención o decodificación del modelo base en la documentación disponible.

## Capacidades

- Generación de texto: es la tarea declarada (`pipeline_tag: text-generation`) y el artefacto está etiquetado como conversacional, pero no se ha validado la generación con esta combinación exacta de pesos.
- Multilingüismo limitado a los idiomas declarados: alemán, inglés y chino. No hay soporte documentado de español.
- Razonamiento, código, matemáticas, visión, audio, tool calling, function calling y modo thinking: no disponible en la información proporcionada para este paquete ni documentado en la model card.
- Comportamiento como MoE de 512 expertos: estructuralmente conserva todos los expertos enrutados, lo que en teoría preserva la capacidad del modelo base, aunque no hay ninguna medición que lo confirme.
- Ejecución local vía runtime Vulkan propietario incluido, con alias de modelo `sakura-flash-next-ud-iq1-s-cp2` y servidor en `http://127.0.0.1:18121`.

## Casos de uso

- Investigación en cuantización extrema: servir como artefacto de estudio para analizar qué tensores sobreviven a IQ1_S en un MoE de 176,9 B y cómo afecta el reemplazo de la tabla de embeddings por capa a la perplejidad, una vez que alguien realice esas mediciones.
- Validación de pipelines de repack: comprobar que el procedimiento de copiar shards 1 y 3 y sustituir un único tensor del shard 2 produce ficheros GGUF cargables, comparando el resultado con el UD-IQ1_S original de Unsloth.
- Laboratorio sobre AMD Strix Halo: el paquete está pensado para placas con Radeon 8060S y 64 GB de memoria unificada en Windows x64, un escenario en el que un MoE de este tamaño no cabría en VRAM dedicada de 24 o 32 GB.
- Pruebas de compatibilidad de runtimes: utilizar el binario Vulkan incluido para verificar el comportamiento de la tabla CP2 frente a llama.cpp estándar u otros frontends, que el autor declara no cualificados.
- Experimentación offline en entornos aislados: al ser un paquete autocontenido con runtime y pesos, puede desplegarse sin acceso a red para pruebas internas de generación de texto en inglés, alemán o chino.
- Docencia y divulgación técnica: ilustrar de forma práctica las diferencias entre tamaño en disco, memoria en ejecución y calidad de modelo, un punto que el autor subraya explícitamente.
- Benchmarking comparativo de cuantizaciones: base para una comparativa futura frente a K512 CP2 (47,6 GiB) o ISTA Compact, siempre que se midan con la misma metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el paquete no se ha cargado para inferencia ni probado en generación, perplejidad, calidad o velocidad, y que ninguna cifra de K512, ISTA Compact o Gyro es aplicable a esta combinación de pesos.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra validada. Los ficheros de modelo suman 53,259 GiB, a los que hay que añadir el overhead del runtime y la caché KV; el autor advierte que el tamaño en disco no es memoria en ejecución y no demuestra que quepa en 24 o 32 GB.
- Tarjetas verificadas: solo se ha probado el runtime en el paquete Sakura K512 CP2 sobre AMD Strix Halo (Radeon 8060S, 64 GB UMA, Windows x64). Este paquete concreto no se ha cargado en ese hardware.
- GPU de 24 o 32 GB dedicados: perfil por defecto no validado; podrían requerir estrategias de offloading distintas, no probadas.
- Otros hardware (NVIDIA, Intel, otras configuraciones AMD, CPU-only, Linux, macOS, Windows on ARM): no probado y sin binario nativo equivalente; el paquete solo incluye binarios Windows x64.
- Despliegue: runtime Vulkan propietario incluido (lanzar `START.cmd` y abrir `http://127.0.0.1:18121`). llama.cpp estándar, LM Studio, Ollama y forks no relacionados no están cualificados para la tabla CP2 personalizada. No se suministra build CUDA, por lo que vLLM y TGI no son opciones contempladas.
- Latencia y throughput: no disponible. No hay ninguna medición publicada para esta combinación.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| Este paquete (Sakura UD-IQ1_S CP2) | 176,9 B | no disponible | UD-IQ1_S + tabla CP2 | qwen-community-1.0 | Experimental, sin cargar ni evaluar |
| unsloth/Qwen3.8-Flash-Next-GGUF (upstream) | 176,9 B | no disponible | Incluye UD-IQ1_S, origen del repack | qwen-community-1.0 | Referencia de cuantización estándar de Unsloth |
| Sakura K512 CP2 v1 | 176,9 B (base) | no disponible | Paquete Compact de 47,6 GiB con runtime CP2 | qwen-community-1.0 | Runtime probado en Strix Halo; sirve de base para la tabla CP2 |
| Qwen/Qwen3.8-Flash-Next (original) | 176,9 B | no disponible | safetensors sin cuantizar | qwen-community-1.0 | Modelo base de referencia |

## Limitaciones y advertencias

- Artefacto no validado: la combinación exacta UD-IQ1_S + CP2 no se ha cargado para inferencia ni evaluada en calidad, perplejidad o velocidad. No hay ninguna garantía de que genere texto coherente.
- Cuantización de ~1 bit: IQ1_S implica una pérdida de precisión muy agresiva; es esperable degradación frente al modelo base, aunque no se han publicado mediciones en este paquete.
- Compatibilidad restringida: requiere el runtime Windows x64 Vulkan incluido; llama.cpp estándar, Ollama, LM Studio y forks no están cualificados. No hay build CUDA.
- Tamaño frente a memoria: 53,259 GiB de ficheros no equivalen a memoria de ejecución; el autor descarta explícitamente inferir que quepa en GPU de 24 o 32 GB.
- Idiomas: solo alemán, inglés y chino; sin soporte declarado de español, lo que limita su uso directo en productos para ese mercado.
- Sesgos: no disponible. No hay documentación sobre sesgos del modelo base ni evaluación de los mismos en este paquete.
- Riesgo de alucinación: inherente a cualquier modelo generativo y presumiblemente agravado por la cuantización extrema, pero sin datos medidos.
- Licencia: los pesos retienen Qwen Community License 1.0, con posibles restricciones de uso comercial que deben revisarse en el fichero LICENSE antes de cualquier despliegue productivo.
- Madurez: 0 descargas y 0 likes en el momento de la ficha, publicación de octubre de 2026; no hay evidencia de uso en producción ni de mantenimiento a largo plazo.
- Trazabilidad: el repack depende de la revisión `766911a6b7369840a91dbcd95f9f997acaab6cd6` de unsloth/Qwen3.8-Flash-Next-GGUF y de la tabla CP2 del paquete K512; cambios en esos artefactos rompen la reproducibilidad.

## Enlaces

- HuggingFace (este paquete): https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-UD-IQ1_S-CP2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Backbone cuantizado (Unsloth, revisión 766911a6b7369840a91dbcd95f9f997acaab6cd6): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Paquete Sakura K512 CP2 (tabla CP2 y runtime de referencia): https://huggingface.co/webmp3/Sakura-Qwen3.8-Flash-Next-Compact-47.6GiB-K512-CP2-v1-GGUF
- Model card en chino simplificado: README_zh.md dentro del repositorio
