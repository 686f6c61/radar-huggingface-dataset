# synaptex/Qwen3.8-27B-AWQ-GPTQ-W4A8-INT8

## Resumen

Qwen3.8-27B-AWQ-GPTQ-W4A8-INT8 es una cuantización de 4 bits del modelo denso Qwen/Qwen3.8-27B, publicada por el usuario synaptex bajo licencia Apache 2.0. Combina dos técnicas de compresión de pesos —AWQ (smoothing de activaciones) y GPTQ (cuantización post-entrenamiento)— sobre un esquema W4A8: pesos en int4 simétrico con grupo de 128 y activaciones de entrada en int8, ejecutables mediante el kernel Marlin W4A8 de vLLM. El paquete se distribuye en formato safetensors con `compressed-tensors`.

El modelo base es multimodal (pipeline `image-text-to-text`), con torre de visión conservada en bf16, y está orientado a un uso bilingüe ruso-inglés. La model card describe un proceso de calibración específico con 391 secuencias de 2048 tokens (800.768 tokens) que mezcla textos rusos, diálogos y wikis en inglés, imágenes de documentos con OCR y respuestas guiadas por esquema JSON. Incluye además un borrador MTP (multi-token prediction) en int8 para decodificación especulativa.

La relevancia de esta ficha es doble: por un lado, documenta un recetario de cuantización poco habitual (AWQ seguido de GPTQ con pasadas de calibración independientes, precisión float32 en los cálculos de escalado) y, por otro, aporta una comparación empírica contra AutoRound sobre el mismo conjunto de evaluación. Conviene señalar una discrepancia importante: el identificador del repositorio indica 27B, pero el recuento real de parámetros en safetensors es de 15.617.946.352 (unos 15,6 mil millones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Qwen3.5, tag `qwen3_5`), con capas GDN y torre de visión; borrador MTP para decodificación especulativa |
| Parametros totales | 15.617.946.352 (según safetensors); el nombre del repo indica 27B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada (la evaluación menciona lecturas de 16.000 tokens) |
| Tipos de cuantizacion | W4A8: pesos int4 simétrico, grupo 128, escalas bf16; entrada int8 (o fp8); cabeza int8 por canal; MTP int8 por grupos de 128; embeddings, torre de visión e `in_proj_a/b` de GDN en bf16 |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (AWQ + GPTQ), compatible con vLLM |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 y es un transformer denso con atención estándar y capas GDN (gated delta network), además de una torre de visión que lo habilita para tareas `image-text-to-text`. Sobre esa base, esta publicación no entrena el modelo: aplica un pipeline de cuantización con llm-compressor 0.15 en dos fases. Primero se ejecuta el smoothing AWQ sobre las entradas de atención y GDN (`input_layernorm` hacia q/k/v o `in_proj_qkv/z/b/a`), la entrada del MLP (`post_attention_layernorm` hacia gate/up) y la transición up→down, con una rejilla de 20 puntos y doble escalado; la reducción del error de salida de bloque por mediana de capas se reporta en un 42 % para atención y GDN, un 11 % para la entrada del MLP y un 5 % para up→down. Después, GPTQ construye las matrices de Hessian sobre la entrada ya suavizada, con int4 simétrico, grupo 128, escalas bf16, orden de columnas por peso, damping de 0,01 y observador MSE.

Un detalle técnico destacable es que el autor calcula los multiplicadores de normalización y la pérdida de la rejilla AWQ en float32, y redondea los niveles al empaquetar con `round(w / s)` también en float32, mientras que la librería lo hace en bf16. La cabeza de salida se cuantiza a int8 por canal con clipping elegido por rejilla (paso del 0,5 % entre el 1,00 y el 0,70 del máximo) minimizando el error cuadrático ponderado por la media cuadrática de la entrada de la cabeza (imatrix). El borrador MTP se cuantiza a int8 por grupos de 128. Tras el ensamblado se realiza una auditoría de esquemas, disposición y tipos de tensores contra el modelo de referencia. El conjunto de calibración son 391 secuencias de 2048 tokens (800.768 tokens) con textos mayoritariamente rusos, diálogos y wikis en inglés, imágenes de documentos con prompt de OCR, invocaciones de herramientas y respuestas conforme a esquema JSON, con parte del texto en modo razonamiento.

## Capacidades

- Generación de texto y razonamiento en ruso e inglés, incluyendo modo de razonamiento (la calibración incluye textos en modo reasoning).
- Procesamiento de imagen y texto (`image-text-to-text`): lectura de documentos, OCR guiado por prompt y localización de campos con coordenadas.
- Tool calling / function calling: la calibración incluye invocaciones de habilidades y la evaluación mide cadenas de llamadas en ruso.
- Respuestas estructuradas conforme a esquema JSON.
- Razonamiento agéntico multi-paso (cadenas de llamadas a herramientas).
- Aritmética y resolución de problemas (evaluado con GSM8K y mgsm_ru).
- Decodificación especulativa mediante borrador MTP integrado (hasta 3 tokens especulativos en la configuración recomendada).
- Capacidades multilingües limitadas a ruso e inglés según la model card.

## Casos de uso

- Extracción de datos de documentos con OCR: el modelo recibe la imagen del documento y un prompt de OCR, y devuelve el texto o los campos localizados con coordenadas; la evaluación reporta 58/72 y 60/72 aciertos en búsqueda de campos según el tipo de entrada, lo que lo hace adecuado para digitalización de facturas y formularios.
- Agentes de atención al cliente en ruso: las cadenas de invocación de herramientas en ruso obtienen 97/156 y 193/312 en el conjunto de datos nuevos, por lo que encaja en flujos de soporte que requieren varias llamadas encadenadas a APIs internas.
- Automatización de contabilidad y conciliación: el punto fuerte medido es la suma de importes de facturas de proveedores (8/13 y 13/26 frente a 2/13 y 7/26 de la variante fp8), un caso realista de procesamiento de documentos financieros.
- Respuestas conformes a esquema JSON en pipelines de integración: la calibración incluye este formato, de modo que puede emplearse para generar payloads validables en sistemas de backend.
- Asistente bilingüe ruso-inglés con contexto largo: la evaluación mide lectura de 16.000 tokens a 4.584 tokens/s con entrada int8, útil para resumir o consultar documentación extensa.
- Despliegue en una sola GPU de 48 GB: con caché KV en fp8 y MTP de 3 tokens alcanza 1.280 tokens/s con 16 flujos concurrentes, lo que permite servir cargas moderadas sin clúster multi-GPU.
- Evaluación comparativa de técnicas de cuantización: el repositorio incluye scripts de construcción y comparación (`quantize/run_27b_gptq.sh`) que sirven como referencia reproducible para equipos que quieran replicar el recetario AWQ+GPTQ.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Configuración: una GPU de 48 GB (sm89), vLLM 0.33, caché KV fp8, MTP con 3 tokens especulativos. Las tareas de respuesta exacta se expresan como aciertos sobre el total; las agénticas, como cadenas correctas.

| Métrica | Esta (int8) | Esta (fp8) | AutoRound int8 | AutoRound int4 |
|---|---|---|---|---|
| Tokens/s, 1 flujo | 127 | 130 | 126 | 128 |
| Tokens/s, 16 flujos | 1.280 | 1.310 | 1.294 | 1.298 |
| Lectura 16k, tokens/s | 4.584 | 3.828 | 4.601 | 3.839 |
| Perplejidad | 6,319 | 6,262 | 6,405 | 6,251 |
| ruMMLU | 1.561/2.000 | 1.570/2.000 | 1.546/2.000 | 1.574/2.000 |
| MMLU | 404/500 | 406/500 | 400/500 | 404/500 |
| ARC | 485/500 | 486/500 | 486/500 | 482/500 |
| GSM8K | 479/500 | 482/500 | 480/500 | 478/500 |
| mgsm_ru | 228/250 | 227/250 | 229/250 | 229/250 |
| Tareas operativas | 33/39 | 35/39 | 35/39 | 35/39 |
| Agénticas | 97/156 | 90/156 | 90/156 | 93/156 |
| Agénticas, datos nuevos | 193/312 | 185/312 | 184/312 | 187/312 |
| Coordenadas en documentos | 58/72 | 60/72 | 51/72 | 50/72 |

El autor aplica un test exacto de McNemar sobre las mismas tareas: con entrada int8 frente a AutoRound int8, las tareas agénticas mejoran (97 frente a 90, p = 0,039; datos nuevos 193 frente a 184, p = 0,035) y la perplejidad baja (6,319 frente a 6,405); con entrada fp8 frente a AutoRound fp8, mejoran las coordenadas en documentos (60 frente a 50, p = 0,006). La comparación int8 frente a fp8 dentro de esta misma publicación favorece a int8 en tareas agénticas (19 frente a 4 en conjunto, p ≈ 0,003) y en velocidad de lectura larga (un 20 % más), mientras que fp8 obtiene mejor perplejidad (6,262 frente a 6,319). El autor advierte que la ventaja agéntica se concentra en un único tipo de tarea (suma de importes de facturas).

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 17,8 GB en safetensors; con caché KV en fp8 y MTP de 3 tokens se ejecuta en una GPU de 48 GB según la configuración medida por el autor. Para contextos largos (16.000 tokens) el margen de memoria debe dimensionarse aparte.
- GPU recomendadas: tarjetas de 48 GB (por ejemplo, clase A6000/L40S en sm89, la plataforma usada en las mediciones) y, por encima, A100 80 GB o H100 para mayor concurrencia. No se han publicado mediciones en GPUs de consumo.
- GPU de consumo: no disponible; el autor no reporta pruebas en RTX 4090 ni en tarjetas de 24 GB, y el peso del repositorio (17,8 GB) más caché KV deja poco margen en 24 GB.
- Despliegue: vLLM 0.33 con `VLLM_MARLIN_INPUT_DTYPE=int8` (o `fp8`), `--kv-cache-dtype fp8` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`. El autor menciona un plugin Santify `ru_guard` que mantiene la entrada en bf16 para la cabeza y el borrador MTP de 8 bits. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 127 tokens/s con un flujo y 1.280 tokens/s con 16 flujos en la configuración indicada; lectura de 16.000 tokens a 4.584 tokens/s con entrada int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synaptex/Qwen3.8-27B-AWQ-GPTQ-W4A8-INT8 | 15,6B reales (nombre: 27B) | no disponible | W4A8 int4/int8, safetensors | Apache 2.0 | Hugging Face, 0 descargas |
| AutoRound de Qwen3.8-27B (referencia del autor) | mismo modelo base | no disponible | int4 simétrico / entrada int8 o fp8 | Apache 2.0 (modelo base) | referenciado en la model card, sin enlace directo |
| Qwen/Qwen3.8-27B (modelo base sin cuantizar) | nombre: 27B | no disponible | bf16 | Apache 2.0 | Hugging Face |

La comparación con otras familias de modelos del mismo tamaño no está disponible en la información proporcionada. La única comparación con datos es la que el propio autor establece contra sus builds AutoRound del mismo modelo base, resumida en la sección de benchmarks.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre del repositorio indica 27B, pero el recuento de safetensors es de 15,6 mil millones de parámetros. Conviene verificar el modelo base antes de dimensionar hardware.
- Idiomas: la model card declara únicamente ruso e inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez; el conjunto de calibración está dominado por textos rusos, lo que puede desequilibrar el comportamiento entre idiomas.
- Alucinación: no se publican métricas de fidelidad factual ni de tasa de alucinación; las tareas de respuesta exacta (MMLU, ARC, GSM8K) no miden este riesgo.
- Dependencia de vLLM: el formato `compressed-tensors` con kernel Marlin W4A8 y el borrador MTP requieren vLLM 0.33 o compatible; no se documenta funcionamiento en otros motores de inferencia.
- Configuración delicada: la variable `VLLM_MARLIN_INPUT_DTYPE` se aplica a todas las capas WNA16, incluidas la cabeza int8 y el MTP, lo que según el autor exige el plugin `ru_guard` para mantener bf16 en esas capas; sin él, el comportamiento puede degradarse.
- Licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen/Qwen3.8-27B, que deben verificarse por separado.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización son del 26 de noviembre de 2026; se trata de una publicación sin validación comunitaria.
- La ventaja agéntica frente a AutoRound se concentra en un solo tipo de tarea según el propio autor, por lo que no debe generalizarse a todos los flujos de agentes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/synaptex/Qwen3.8-27B-AWQ-GPTQ-W4A8-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Scripts de construcción y comparación citados: directorio `Docker/LLM/Qwen36-35B-A3B` del proyecto Santify, archivo `quantize/run_27b_gptq.sh` (sin URL pública en la información disponible)
- Paper, blog o demo adicionales: no disponible
