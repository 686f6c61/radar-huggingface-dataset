# synaptex/Qwen3.6-35B-A3B-AWQ-GPTQ-W4A8-FP8

## Resumen

Qwen3.6-35B-A3B-AWQ-GPTQ-W4A8-FP8 es una cuantización de 4 bits del modelo mixto de expertos Qwen/Qwen3.6-35B-A3B, publicada por el usuario synaptex bajo licencia Apache 2.0. El modelo base es un transformer MoE con 35 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, distribuidos en 256 expertos de los cuales 8 se activan por token. Esta versión cuantizada reduce el peso del repositorio a 21,5 GB, lo que permite servir el modelo en una única GPU de 48 GB con vLLM.

La receta de cuantización combina AWQ (smoothing) y GPTQ sobre la herramienta llm-compressor 0.15, con un esquema W4A8: pesos int4 simétricos con grupo 128 y activaciones de entrada en fp8, apoyándose en el kernel Marlin W4A8-FP8 de vLLM. La cabeza de salida se cuantiza a int8 por canal y el módulo MTP (multi-token prediction) se mantiene en int8 por grupos, con routers y torre de visión en bf16.

El modelo está orientado a inferencia multimodal (image-text-to-text) con soporte declarado de ruso e inglés, e incluye decodificación especulativa mediante MTP. Su relevancia práctica radica en que ofrece un equilibrio medido entre velocidad (441 tok/s en un flujo, 2.149 tok/s en 16 flujos) y calidad frente a la versión oficial FP8 y otras cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) con atención, GDN, 256 expertos y experto compartido; incluye torre de visión y módulo MTP |
| Parametros totales | 35B (según model card); 19.143.149.424 parámetros reales en safetensors del repo cuantizado |
| Parametros activos | ~3B por token (8 de 256 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8-FP8: pesos int4 simétrico grupo 128, entrada fp8 (kernel Marlin); cabeza int8 por canal; MTP int8 por grupos; routers y visión bf16 |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura MoE con 256 expertos y 8 activos por token, más un experto compartido, sobre la que se aplica atención y capas GDN (gated delta network, según la nomenclatura de la model card). Incluye además una torre de visión para entrada image-text-to-text y un módulo MTP (multi-token prediction) que actúa como cabecera de decodificación especulativa.

El proceso de cuantización parte de llm-compressor 0.15 con dos pasadas completas de calibración: primero smoothing AWQ sobre todos los layers y después GPTQ, que construye las matrices de Hessian sobre la entrada ya suavizada. La calibración de expertos es específica: AWQ usa el enrutamiento normal (8 de 256), mientras que en la pasada GPTQ todos los expertos ven todos los tokens, pero la Hessian de cada experto se construye con sus propios tokens ponderados por el router (w²) más un 0,3 de la matriz global. Según el autor, esto reduce el error de salida de los expertos entre un 12 % y un 21 % sobre tokens retenidos. El damping GPTQ es 0,05 y el orden de columnas sigue el peso. La calibración usa 392 secuencias de 2.048 tokens (802.816 tokens) con textos predominantemente rusos, web en inglés, imágenes de documentos con prompt OCR, llamadas de herramientas y respuestas con esquema JSON. Los multiplicadores de normalización y la pérdida de rejilla AWQ se calculan en fp32 en lugar de bf16.

## Capacidades

- Generación de texto y razonamiento en ruso e inglés.
- Procesamiento multimodal image-text-to-text mediante torre de visión (documentos, OCR con prompt específico).
- Llamada a herramientas (tool calling) y respuestas estructuradas conforme a esquema JSON, incluidas en el conjunto de calibración.
- Razonamiento agéntico multi-paso: la model card reporta cadenas de llamadas a herramientas en ruso.
- Decodificación especulativa con MTP (3 tokens especulativos en la configuración recomendada).
- Comprensión de documentos con extracción de coordenadas (evaluado en el benchmark propio del autor).
- No se declara soporte de audio ni otras modalidades distintas de texto e imagen.

## Casos de uso

- Extracción de datos de documentos con OCR y localización de coordenadas: el modelo se calibró con imágenes de documentos y prompts OCR, y el autor reporta 56 aciertos de 72 en coordenadas frente a 49 de la alternativa AutoRound, lo que lo hace adecuado para digitalización de facturas, formularios y escaneos.
- Asistentes conversacionales en ruso con contexto multimodal: al declarar ruso como idioma principal y soportar image-text-to-text, puede gestionar diálogos multi-turno donde el usuario adjunta capturas o documentos.
- Pipelines agénticos con llamadas a herramientas: la calibración incluye tool calls y respuestas JSON, y el modelo se evaluó en cadenas de invocación de habilidades en ruso (106 de 156 en el conjunto agéntico), por lo que encaja en orquestadores de agentes que requieran salida estructurada.
- Servicio de inferencia de alta concurrencia en una sola GPU: con 2.149 tok/s a 16 flujos en una GPU de 48 GB (sm89) y caché KV en fp8, es viable para endpoints con múltiples usuarios simultáneos.
- Despliegue con decodificación especulativa en producción: la configuración con MTP 3 y `VLLM_MARLIN_INPUT_DTYPE=fp8` está documentada y medida, lo que permite reducir latencia por token en tareas de generación larga.
- Sustitución de la versión FP8 oficial cuando el presupuesto de VRAM es limitado: el repo de 21,5 GB permite servir el modelo en GPUs de 48 GB donde la FP8 oficial deja menos margen para caché KV y contexto.
- Evaluación comparativa de técnicas de cuantización: los scripts de construcción y comparación están publicados en el proyecto Santify (carpeta `Docker/LLM/Qwen36-35B-A3B`), útiles para reproducir la receta AWQ+GPTQ frente a AutoRound.

## Benchmarks y rendimiento

Resultados publicados por el autor en una GPU de 48 GB (sm89), vLLM 0.33, caché KV fp8, MTP 3 y entrada fp8 en capas int4:

| Ensamblado | tok/s 1 flujo | tok/s 16 flujos | Perplejidad | ruMMLU | ARC | GSM8K | mgsm_ru | Tareas laborales | Agénticas | Agénticas, otro mundo |
|---|---|---|---|---|---|---|---|---|---|---|
| Esta (AWQ+GPTQ W4A8-FP8) | 441 | 2.149 | 6,208 | 1573/2000 | 482/500 | 474/500 | 229/250 | 37/39 | 106/156 | 207/312 |
| AutoRound W4A8-FP8 | 420 | 2.155 | 6,207 | 1581/2000 | 471/500 | 473/500 | 227/250 | 35/39 | 98/156 | 198/312 |
| Qwen3.6-35B-A3B-FP8 oficial | 320 | 1.543 | 6,122 | 1592/2000 | 479/500 | 480/500 | 228/250 | 36/39 | 94/156 | 183/312 |
| AWQ de terceros (asimétrica, entrada bf16) | 310 | 1.729 | 6,172 | 1596/2000 | 475/500 | 476/500 | 226/250 | 37/39 | 110/156 | 226/312 |

Según el autor, frente a AutoRound W4A8-FP8 la diferencia es significativa en ARC (p = 0,019) y en coordenadas de documentos (56 frente a 49 de 72, p = 0,016), con un 5 % más de velocidad por mejor aceptación del borrador MTP. Frente a la FP8 oficial, la mejora en tareas agénticas de otro mundo es significativa (207 frente a 183, p < 0,001). La AWQ asimétrica de terceros supera a esta en tareas agénticas de otro mundo (226 frente a 207, p = 0,004), pero usa entrada bf16 y es un 30 % más lenta. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo pesa 21,5 GB, por lo que la inferencia requiere al menos ~24 GB solo para pesos; con caché KV fp8 y contexto adicional, una GPU de 48 GB es el escenario medido por el autor.
- GPU recomendadas: el autor valida en una GPU de 48 GB con arquitectura sm89 (por ejemplo, L40S o RTX 6000 Ada); A100 y H100 de 80 GB son compatibles por capacidad, aunque no se aportan mediciones específicas.
- GPU de consumo: no cabe en RTX 4090 (24 GB) con la configuración completa medida; requeriría reducir contexto o usar una cuantización más agresiva, no documentada en esta ficha.
- Despliegue: vLLM 0.33 con `--trust-remote-code`, `VLLM_MARLIN_INPUT_DTYPE=fp8`, `--kv-cache-dtype fp8` y `--speculative-config '{"method": "mtp", "num_speculative_tokens": 3}'`. El autor advierte que vLLM aplica `VLLM_MARLIN_INPUT_DTYPE` a todas las capas WNA16, incluidas la cabeza int8 y el MTP; su plugin Santify `ru_guard` mantiene la entrada bf16 en esas capas.
- Throughput medido: 441 tok/s con un flujo y 2.149 tok/s con 16 flujos en la GPU de 48 GB sm89. No se publican cifras de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Esta cuantización (AWQ+GPTQ W4A8-FP8) | 35B totales / ~3B activos | no disponible | ruMMLU 1573/2000, GSM8K 474/500, ARC 482/500 | Apache 2.0 | Hugging Face, 0 descargas |
| AutoRound W4A8-FP8 (synaptex) | 35B totales / ~3B activos | no disponible | ruMMLU 1581/2000, GSM8K 473/500, ARC 471/500 | Apache 2.0 (heredada del base) | Hugging Face |
| Qwen3.6-35B-A3B-FP8 oficial | 35B totales / ~3B activos | no disponible | ruMMLU 1592/2000, GSM8K 480/500, ARC 479/500 | Apache 2.0 | Hugging Face |
| AWQ de terceros (asimétrica, entrada bf16) | 35B totales / ~3B activos | no disponible | ruMMLU 1596/2000, GSM8K 476/500, ARC 475/500 | Apache 2.0 (heredada del base) | Hugging Face |

## Limitaciones y advertencias

- La model card está redactada en ruso y el modelo declara únicamente ruso e inglés; no hay evidencia de calidad en castellano ni en otros idiomas.
- Los benchmarks son autoinformados por el autor con su propio conjunto de evaluación; no hay validación independiente ni resultados de terceros.
- La perplejidad de esta cuantización (6,208) es ligeramente superior a la de la FP8 oficial (6,122), lo que indica una pérdida medible de fidelidad respecto al modelo sin cuantizar.
- El despliegue recomendado depende de un plugin externo (Santify `ru_guard`) para evitar que `VLLM_MARLIN_INPUT_DTYPE` se aplique a capas int8; sin él, el comportamiento de la cabeza y el MTP puede degradarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni reportes de la comunidad.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben asumirse los del modelo base Qwen3.6-35B-A3B.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de las herramientas de cuantización (llm-compressor, kernels Marlin) antes de un uso comercial.
- El contexto máximo no se especifica en la información disponible, lo que impide dimensionar la caché KV para cargas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synaptex/Qwen3.6-35B-A3B-AWQ-GPTQ-W4A8-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización AutoRound comparable: https://huggingface.co/synaptex/Qwen3.6-35B-A3B-AutoRound-W4A8-FP8
- Proyecto Santify (scripts de construcción y comparación, carpeta `Docker/LLM/Qwen36-35B-A3B`): no disponible como URL en la información proporcionada
- Paper, blog o demo adicionales: no disponible
