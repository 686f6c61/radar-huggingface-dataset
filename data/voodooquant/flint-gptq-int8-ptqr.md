# voodooquant/Flint-GPTQ-INT8-PTQR

## Resumen

Flint-GPTQ-INT8-PTQR es una versión cuantizada a INT8 del modelo RecursiveSI/flint, publicada por el usuario voodooquant. Se trata de un modelo de lenguaje de arquitectura MoE dispersa (model_type `flint`) con 39.785.287.456 parámetros totales, diseñado específicamente para servir en hardware AMD Instinct MI100 (gfx908 / CDNA1) mediante un stack de inferencia modificado basado en vLLM y AITER. La cuantización no es un GPTQ convencional: emplea PTQR (post-training quantization with rounding-dither retraining), una técnica que reentrena los pesos bajo la cuantización desplegada destilando contra un profesor BF16 congelado.

El checkpoint mantiene el formato GPTQ estándar (W8A8, group size 128, simétrico, sin `g_idx`), lo que permite cargarlo con el wrapper GPTQ habitual, pero sus pesos han sido ajustados para replicar exactamente los kernels INT8 de servicio (rejilla de pesos G128, cuantización dinámica de activaciones por token, KV cache INT8). El autor documenta que se sirve con decodificación especulativa emparejado con un modelo draft (Flint-DFlash2-GPTQ-INT8-PTQR) y extensión de RoPE hasta 512k tokens sobre un contexto nativo de 262.144.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización poco habitual (reentrenamiento bajo cuantización con dither geométricamente annealing); por otro, expone un stack de servicio completo para GPUs AMD CDNA1, un segmento con menor soporte de herramientas que las GPU NVIDIA equivalentes. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE dispersa (model_type `flint`): 49 capas, capas 0-1 densas, capas 2-48 MoE con 256 expertos enrutados top-6 mas un experto compartido |
| Parametros totales | 39.785.287.456 |
| Parametros activos | no disponible (top-6 de 256 expertos por capa, sin cifra agregada publicada) |
| Longitud de contexto | 262.144 nativo; servido hasta 524.288 mediante extensión de tablas RoPE |
| Tipos de cuantizacion | GPTQ INT8 W8A8, group size 128, simétrico, `desc_act` false, `lm_head` no cuantizado (cabeza INT8 per-channel separada en el stack de servicio), KV cache INT8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ: `qweight`/`qzeros`/`scales`, sin `g_idx`); 35 shards, 36.439 tensores, 38,5 GiB |

Otras especificaciones de arquitectura publicadas: hidden 2048, intermedio MoE 512, intermedio denso 6144, 32 cabezas de atención / 4 cabezas KV, head_dim 128, atención de ventana deslizante de 513 en 35 de las 49 capas, vocabulario 150.144.

## Arquitectura y entrenamiento

Flint es un transformer MoE disperso con 49 capas: las dos primeras son densas y las 47 restantes combinan 256 expertos enrutados (top-6) con un experto compartido de dimensión intermedia 1024. La atención usa 32 cabezas de consulta y 4 de clave/valor con head_dim 128, e incorpora ventana deslizante de 513 tokens en 35 capas, lo que reduce el coste de atención en contextos largos. El vocabulario es de 150.144 tokens.

Sobre el entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO) no se ha publicado información en la documentación disponible. Lo que sí está documentado es el proceso de cuantización PTQR: se entrena un estudiante cuyo forward replica los kernels INT8 de servicio exactos (rejilla de pesos G128, cuantización dinámica de activaciones por token, KV cache INT8) destilando contra un profesor BF16 congelado, aplicando dither con annealing geométrico sobre cada decisión de redondeo, de modo que las etapas tempranas exploran puntos vecinos de la rejilla y las finales son bit-idénticas al servicio. Los pesos reentrenados se recuantizan y exportan por el mismo wrapper GPTQ GS128. Esta release corresponde al peldaño 1, paso 40 (`r1s40`): 60 pasos, learning rate 1e-5, SGD solo de pesos con las escalas de grupo entrenadas junto a los pesos, sobre ventanas con forma de servicio de 2048-4096 tokens. El corpus se amplió con ocho documentos needle de 512k tokens (7,07M tokens en total) para entrenar el comportamiento en contexto largo.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, con ventana nativa de 262.144 tokens y servicio validado hasta 524.288.
- Razonamiento multi-paso: la receta de servicio incluye `--reasoning-parser qwen3`, lo que indica soporte de modo de razonamiento con separación de trazas.
- Tool calling / function calling: la receta habilita `--enable-auto-tool-choice` con `--tool-call-parser glm47`.
- Decodificación especulativa: diseñado para emparejarse con el draft Flint-DFlash2-GPTQ-INT8-PTQR con `num_speculative_tokens` 7, con aceptación medida de 2,25 tokens por paso (2,27 con draft BF16).
- Capacidades multilingües: no disponible (no se documentan idiomas).
- Capacidades de visión o audio: no disponibles.
- Inferencia cuantizada INT8 de extremo a extremo: GEMMs densos y de expertos en int8xint8 real (W8A8), KV cache INT8, sin fallback a 16 bits en la receta de servicio.

## Casos de uso

- Servicio conversacional de contexto largo en clúster AMD MI100: el modelo encaja en despliegues con 4x MI100 sobre XGMI, donde el stack int8-vllm/int8-aiter ya está validado con TP4 y 12 secuencias concurrentes; útil para equipos con hardware CDNA1 que no pueden usar kernels NVIDIA.
- Procesamiento de documentos extensos: con 262.144 tokens nativos y extensión a 524.288, permite resumir o extraer información de contratos, informes o bases de código de cientos de miles de tokens en una sola pasada, sin trocear y perder coherencia entre fragmentos.
- Agentes con tool calling: la receta habilita elección automática de herramientas y parser de llamadas, por lo que puede integrarse en orquestadores de agentes que consulten APIs, bases de datos o motores de búsqueda en flujos multi-paso.
- Asistencia de código en pipelines internos: con razonamiento multi-paso y tool calling, puede generar parches, explicar errores y proponer comandos dentro de herramientas de CI/CD, siempre que el throughput agregado (532-535 tok/s en TP4/C12) sea suficiente para el volumen del equipo.
- Generación aumentada por recuperación (RAG) con contexto masivo: inyectar decenas de documentos recuperados en el prompt sin truncar, aprovechando la ventana de 512k y el KV cache INT8 para reducir el coste de memoria por secuencia.
- Evaluación de recetas de cuantización: el checkpoint sirve como referencia reproducible para comparar PTQR frente a GPTQ one-shot, ya que el autor publica puertas de calidad (NLL, KLD, aceptación de draft) y el vehículo de exportación.
- Servicio de bajo coste por token en hardware legacy: al mantener todo el cómputo en INT8 y usar decodificación especulativa, reduce el coste por token frente a servir el modelo base en BF16 en el mismo hardware.

## Benchmarks y rendimiento

El autor publica métricas de puerta de calidad y rendimiento del par target+draft en su receta de servicio (TP4, C8 o C12, KV INT8), no benchmarks estándar de conocimiento o razonamiento:

| Metrica | Valor |
|---|---|
| NLL de servicio @64 tokens | 4,6588 (referencia BF16 4,6590; profesor 4,6586) |
| NLL de servicio @1024 tokens | 1,3898 (referencia BF16 1,39) |
| KLD en ventana de validación de 1024 tokens | 0,0095 (suelo BF16 0,0055); 0,0103 con KV INT8; 0,0110 con KV INT8 + expertos W8A8 + graphs |
| Aceptación de draft (DFlash2, NS=7) | 2,25 (draft BF16 2,27) |
| Throughput C8, 32 in / 256 out, 64 peticiones | 261,1 tok/s de salida, TTFT 627 ms, TPOT 27,2 ms |
| Throughput TP4/C12, NS=7, 512k max length | 532/535 tok/s en carga compartida 12x256 |
| Paso de un solo stream | 26,4-27,3 ms |
| TTFT en frío para prompt de 42k tokens | 8,05 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 38,5 GiB en INT8; con KV cache INT8 y 12 secuencias concurrentes a longitudes moderadas, el autor valida 4 GPU MI100 (32 GB cada una) con `--gpu-memory-utilization 0.90`, es decir, aproximadamente 115 GiB de presupuesto de memoria agregada.
- GPU recomendadas: AMD Instinct MI100 (gfx908 / CDNA1) es el objetivo validado, en configuraciones de 4 GPU conectadas por XGMI. No se documenta soporte validado en NVIDIA ni en otras arquitecturas AMD.
- ¿Cabe en consumer GPU? No con la receta publicada: el checkpoint de 38,5 GiB excede la VRAM de cualquier GPU de consumo actual y el stack requiere kernels AITER gfx908.
- Opciones de despliegue: vLLM mediante el fork `curvedinf/int8-vllm` (rama `main`) y AITER mediante `curvedinf/int8-aiter` (rama `main`). No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 261,1 tok/s de salida con TTFT de 627 ms y TPOT de 27,2 ms en C8; 532-535 tok/s agregados en TP4/C12; paso de un solo stream de 26,4-27,3 ms; TTFT en frío de 8,05 s para un prompt de 42k tokens.
- Restricciones de la receta: el autor advierte explícitamente de no sustituir W8A16, KV en coma flotante, otro tamaño de TP ni prescindir de la especulación en la receta prevista.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Flint-GPTQ-INT8-PTQR (este) | 39,8B totales, MoE top-6 de 256 | 262.144 nativo, 524.288 servido | GPTQ INT8 W8A8 GS128 + PTQR, KV INT8 | Apache 2.0 | Validado en 4x AMD MI100; requiere fork de vLLM y AITER |
| RecursiveSI/flint (base) | 39,8B totales, misma arquitectura | 262.144 | BF16 | no disponible en la información | Modelo de referencia; el autor lo usa como profesor en la destilación |
| Flint-DFlash2-GPTQ-INT8-PTQR | no disponible | no disponible | GPTQ INT8 W8A8 GS128 | no disponible en la información | Modelo draft para decodificación especulativa, mismo formato |
| Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR | ~27B | no disponible | GPTQ INT8 W8A8 GS128 + PTQR | no disponible en la información | Release previa del mismo autor con la misma metodología de cuantización |

No se dispone de datos de benchmarks comparativos frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La información sobre sesgos, composición del corpus de entrenamiento y evaluación de seguridad del modelo base no está disponible; no puede descartarse la presencia de sesgos heredados del corpus original.
- Riesgo de alucinación inherente a un modelo generativo de este tamaño; no se han publicado evaluaciones de factualidad en la documentación disponible.
- El modelo está validado únicamente en AMD MI100 (gfx908) con un fork específico de vLLM y AITER; fuera de esa combinación no hay garantías de funcionamiento ni de calidad, y el autor advierte contra alterar la receta (W8A16, KV flotante, otro TP, sin especulación).
- El soporte de idiomas no está documentado; no debe asumirse un rendimiento multilingüe equilibrado.
- La cuantización INT8 introduce una degradación medible: KLD de 0,0095 frente al suelo BF16 de 0,0055, y 0,0110 al añadir KV INT8, expertos W8A8 y graphs. Es pequeña, pero acumulativa en tareas sensibles a la precisión.
- El checkpoint no incluye `lm_head` cuantizado (está untied y se sirve con una cabeza INT8 per-channel separada), lo que añade una pieza específica al stack de servicio.
- El tamaño del repositorio (41,4 GB) y la necesidad de 4 GPU para la receta validada implican un coste de infraestructura elevado.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las obligaciones de atribución y las licencias del modelo base y de los componentes del stack (vLLM y AITER tienen sus propias licencias).
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día (12 de noviembre de 2026); se trata de una release muy reciente y poco contrastada por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Flint-GPTQ-INT8-PTQR
- Modelo draft para decodificación especulativa: https://huggingface.co/voodooquant/Flint-DFlash2-GPTQ-INT8-PTQR
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Release previa del mismo autor con la misma metodología: https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128-PTQR
- Fork de vLLM para INT8 en gfx908: https://github.com/curvedinf/int8-vllm
- Fork de AITER para kernels gfx908: https://github.com/curvedinf/int8-aiter
