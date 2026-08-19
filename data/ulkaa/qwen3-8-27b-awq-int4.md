# ulkaa/Qwen3.8-27B-AWQ-INT4

## Resumen

El modelo `ulkaa/Qwen3.8-27B-AWQ-INT4` es una cuantización AWQ en formato W4A16 (4 bits para pesos, 16 bits para activaciones) del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada por el usuario ulkaa. El modelo base es un transformer híbrido de 27 356 millones de parámetros que combina 48 capas con Gated DeltaNet (atención lineal) y 16 capas con atención completa, con arquitectura `Qwen3_5ForConditionalGeneration` y pipeline de imagen-texto a texto. Esta versión cuantizada reduce el peso de 55,6 GiB (BF16) a 18,2 GiB, lo que permite su despliegue en GPUs Intel Arc Pro mediante SGLang, manteniendo la torre de visión y la cabeza MTP en BF16.

La relevancia de este artefacto radica en que cuantiza también las proyecciones del Gated DeltaNet, que suponen el 47 % de los datos leídos en cada paso de decodificación, algo que otras builds de 4 bits suelen dejar en precisión completa. El resultado es una reducción de la lectura por paso de decode de 21,82 GiB a 14,19 GiB, con una degradación mínima de calidad (acuerdo exacto de argmax con el modelo BF16 en los prompts de prueba). Está licenciado bajo Apache 2.0 y disponible en formato `compressed-tensors` / `pack-quantized`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (híbrida: 48 capas Gated DeltaNet + 16 capas de atención completa) |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (configuración usada en SGLang) |
| Tipos de cuantizacion | AWQ W4A16 asimétrica, group size 128, formato compressed-tensors pack-quantized |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors pack-quantized) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint BF16 `Qwen/Qwen3.8-27B`, no un entrenamiento desde cero. La arquitectura original es híbrida: 48 de las 64 capas decoder utilizan Gated DeltaNet (proyecciones `linear_attn.*`) y las 16 restantes usan atención completa. La cuantización se realizó con AWQ mediante `llm-compressor`, con esquema W4A16 asimétrico y group size 128. La calibración usó 512 secuencias de 1024 tokens, compuestas por un 60 % de instrucciones de código (`codeparrot/self-instruct-starcoder`) y un 40 % de instrucciones generales (`HuggingFaceH4/ultrachat_200k`), formateadas con plantilla de chat. El proceso fue secuencial, calibrando cada capa decoder contra la salida cuantizada de las capas anteriores.

Se cuantizaron las tres proyecciones grandes del Gated DeltaNet (`in_proj_qkv`, `in_proj_z`, `out_proj`), que suman 10,36 GiB en BF16, reduciéndolas a 2,73 GiB. Se dejaron en BF16 la torre de visión, la cabeza MTP, `lm_head`, `embed_tokens`, todas las normas y las puertas escalares `in_proj_a` y `in_proj_b`. La elección de group size 128 frente a 32 fue una decisión medida: en Intel Arc Pro B65, el matmul int4 de oneDNN rinde 505 GB/s con group 128 frente a 383 GB/s con group 32, y este último cuadruplica el tráfico de escalas y zero-points, resultando más lento end-to-end.

## Capacidades

- Multimodal: acepta entrada de imagen y texto, y genera texto (pipeline `image-text-to-text`). La torre de visión se conserva en BF16.
- Conversacional: diseñado para interacciones de chat multi-turno, según los tags del modelo.
- Generación de texto con contexto largo: ventana de 32 768 tokens, adecuada para documentos extensos o conversaciones prolongadas.
- Razonamiento y código: al ser una cuantización del modelo Qwen3.8-27B, hereda sus capacidades de razonamiento, generación de código y comprensión factual, aunque no se detallan en la model card.
- Inferencia eficiente en hardware Intel: optimizado para SGLang con oneDNN en GPUs Intel Arc Pro, con soporte para tensor parallelism (TP2 y TP4).
- Compatible con Transformers: se puede cargar con la librería `transformers` (el código de ejemplo se proporciona en la model card, aunque truncado).

## Casos de uso

- Despliegue en entornos con GPUs Intel Arc Pro: gracias a la cuantización AWQ y al soporte nativo en SGLang, el modelo puede servirse en estaciones de trabajo con 2 o 4 GPUs Arc Pro B65, logrando decodificación de 35-52 tokens/s y prefill de 1850-3000 tokens/s.
- Asistente conversacional multimodal: al aceptar imágenes y texto, puede usarse en aplicaciones de atención al cliente donde el usuario adjunta capturas o fotos y el modelo responde con instrucciones o resúmenes.
- Generación de código asistida con contexto largo: la ventana de 32K tokens permite procesar repositorios completos o archivos extensos, manteniendo el contexto de funciones y dependencias.
- Análisis de documentos con imágenes: extracción de información de facturas, formularios o diagramas, combinando visión y razonamiento textual en un solo paso.
- Razonamiento sobre documentos largos: en investigación o consultoría, el modelo puede resumir o responder preguntas sobre informes de decenas de páginas sin truncar el contexto.
- Inferencia de baja latencia en servidores multi-GPU: con TP4, el tiempo por token de salida (TPOT) se reduce a ~19 ms, adecuado para aplicaciones en tiempo real como chatbots o asistentes de productividad.

## Benchmarks y rendimiento

La model card reporta mediciones de rendimiento en dos y cuatro Intel Arc Pro B65 con SGLang, contexto 32 768, concurrencia 1 y graph capture activado. Decode se expresa como `1000/TPOT`.

| prompt / output | TP2 TPOT | TP2 decode | TP4 TPOT | TP4 decode |
|---|---:|---:|---:|---:|
| 1024 / 256 | 26,42 ms | 37,9 tok/s | 19,30 ms | 51,8 tok/s |
| 4096 / 512 | 28,32 ms | 35,3 tok/s | 21,21 ms | 47,1 tok/s |
| 8192 / 1024 | 26,44 ms | 37,8 tok/s | 19,20 ms | 52,1 tok/s |
| 256 / 1024 | 26,19 ms | 38,2 tok/s | 19,10 ms | 52,4 tok/s |

El prefill se sitúa en ~1850 tok/s en TP2 y ~3000 tok/s en TP4. El decode es plano dentro de 0,3 ms en un rango de 32x de longitud de prompt.

En cuanto a calidad, frente al original BF16 con ocho prompts (código, razonamiento, recuerdo factual y resumen):

| metrica | valor |
|---|---|
| Rango medio del token BF16 | 1,0000 (acuerdo exacto de argmax) |
| Token BF16 fuera del top-8 | 0 |
| KL media sobre pasos alineados | 0,0201 |
| Perplejidad de prefill | 8,8715 a 9,3324 (+0,46) |

El texto greedy diverge en todos los prompts, como es esperable en una build de 4 bits, y solo el 7,4 % de los pasos permanecen alineados. IFEval se reporta en 24,0 % strict prompt-level sobre un subconjunto de 100 prompts, con un harness que implementa 17 de los ~25 tipos de instrucción oficiales; no hay baseline BF16 comparable, por lo que no debe interpretarse como regresión ni como afirmación absoluta de calidad.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 18,2 GiB, por lo que se necesita al menos esa cantidad de memoria de GPU para los pesos, más memoria para activaciones, KV cache y overhead del runtime. Con tensor parallelism (TP2 o TP4) la carga se distribuye entre varias GPUs.
- GPUs recomendadas: Intel Arc Pro B65 (según las mediciones de la model card). El artefacto es estándar `compressed-tensors`, por lo que podría funcionar en otras GPUs con soporte para SGLang o Transformers, aunque no se han publicado pruebas.
- Compatibilidad con GPUs de consumo: 18,2 GiB de pesos supera la VRAM de GPUs como RTX 4060 (12 GB) o RTX 4070 (12 GB), pero cabría en una RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que el overhead adicional no exceda la memoria disponible. No hay datos oficiales al respecto.
- Opciones de despliegue: SGLang (con backend Intel XPU, usando el contenedor `rahulunair/sglang-xpu:qwen3.8-27b-20260816`) y Transformers (código de ejemplo en la model card). También podría usarse vLLM u otros motores que soporten `compressed-tensors`, aunque no se mencionan.
- Latencia y throughput: en TP2, TPOT de ~26-28 ms (35-38 tok/s); en TP4, TPOT de ~19-21 ms (47-52 tok/s). Prefill de ~1850 tok/s (TP2) y ~3000 tok/s (TP4).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de la misma categoría en la información proporcionada. La model card solo compara implícitamente con el checkpoint BF16 original y con la versión FP8 oficial de Qwen (mencionada como referencia para la selección de tensores a no cuantizar). No hay benchmarks estándar (MMLU, HumanEval, GSM8K) publicados para esta cuantización, por lo que no es posible establecer una comparativa cuantitativa con alternativas como otras builds de 4 bits de Qwen3.8-27B o modelos de tamaño similar.

## Limitaciones y advertencias

- Degradación típica de cuantización 4-bit: aunque el acuerdo de argmax con BF16 es exacto en los prompts de prueba, el texto greedy diverge en todos los casos y solo el 7,4 % de los pasos permanecen alineados. Esto puede afectar a tareas que requieren coherencia exacta.
- IFEval sin baseline: el resultado de 24,0 % se obtuvo con un harness parcial (17 de ~25 tipos de instrucción) y sin comparación con el modelo BF16, por lo que no debe usarse como métrica de calidad absoluta.
- Sesgos y alucinaciones: al ser una cuantización del modelo Qwen3.8-27B, hereda los sesgos y riesgos de alucinación del modelo base, que no se detallan en la model card.
- Idiomas soportados: no se especifican; se recomienda verificar la documentación del modelo base para conocer la cobertura multilingüe.
- Requisitos de sistema para SGLang en Intel: el despliegue con SGLang en Intel Arc requiere permisos especiales (`SYS_PTRACE`, `seccomp=unconfined`) y variables de entorno específicas; sin ellos, el rendimiento puede degradarse (por ejemplo, 4,25 ms más por token en TP2).
- Licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base `Qwen/Qwen3.8-27B` para asegurar el cumplimiento en productos derivados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ulkaa/Qwen3.8-27B-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
