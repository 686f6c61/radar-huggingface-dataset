# wallawalla47/Ornith-1.5-122B-NVFP4-Infernix

## Resumen

Ornith-1.5-122B-NVFP4-Infernix es un artefacto de pesos cuantizados en formato NVFP4, empaquetado específicamente para el motor de inferencia Infernix, un runtime en C++/CUDA desarrollado por el mismo autor (wallawalla47). El modelo subyacente es Ornith-1.5-122B, un transformer de tipo mezcla de expertos (MoE) construido sobre la geometría Qwen3.5-122B-A10B, con arquitectura `Qwen3_5MoeForCausalLM`: 48 capas, dimensión oculta de 3072, 256 expertos enrutados por capa con activación top-8, lo que arroja 12.288 expertos enrutados en total.

El problema que resuelve este artefacto es concreto: permitir ejecutar un modelo MoE de 122.000 millones de parámetros en una única GPU de consumo, la RTX 5090 con 32 GB de VRAM (arquitectura Blackwell, `sm_120a`). Para ello, los expertos (60,75 GiB) residen en RAM del host fijada en memoria (pinned), mientras una caché de VRAM mantiene los expertos "calientes" (en torno a 4.450-4.850 de ellos) y la CPU calcula parte de los fallos de cada capa mientras la GPU lee el resto por PCIe.

Es relevante ahora porque demuestra una vía práctica de inferencia para modelos MoE de gran escala en hardware de consumo, con decodificación especulativa mediante MTP (multi-token prediction) y un segundo drafter alternativo (DFlash2). El artefacto incluye además la torre de visión (pipeline `image-text-to-text`), lo que lo convierte en un modelo multimodal. La licencia del modelo base es MIT. El propio autor advierte que se trata de trabajo hobby asistido por IA y que puede no ser completo ni exacto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`Qwen3_5MoeForCausalLM`), 48 capas, hidden size 3072, 256 expertos enrutados por capa, top-8 |
| Parámetros totales | 122B (geometría Qwen3.5-122B-A10B) |
| Parámetros activos | 10B (denominación A10B del modelo base) |
| Longitud de contexto | Hasta 262.144 tokens en servidor (`--max-context 262144`); solo los primeros 32.768 tokens de KV se retienen al arrancar |
| Tipos de cuantización | NVFP4 para expertos enrutados y compartidos; FP8 (E4M3, escalado por fila) para atención, GDN y proyecciones de salida; Q4/Q8 para drafters; KV cache INT8 o BF16 |
| Idiomas soportados | No disponible |
| Licencia | MIT (modelo base); el drafter DFlash2 se distribuye bajo Apache 2.0 |
| Formato de pesos | `.infernix` propietario, dividido en 3 partes (~75,3 GB total) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 48 capas, dimensión oculta 3072 y 256 expertos enrutados por capa con enrutamiento top-8, más expertos compartidos. La atención y las proyecciones GDN y de salida emplean FP8 (E4M3) con escalado por fila. El artefacto incluye además la torre de visión (capacidad multimodal) y dos drafters para decodificación especulativa: el MTP nativo del modelo y el drafter externo DFlash2 (`incoai/Ornith-1.5-122B-DFlash2`), más una cabeza de propuesta Q4 de 131.072 filas derivada de la cabeza de salida.

La conversión se realizó con la receta `qwen3_5_moe_nvfp4_modelopt` del motor Infernix y se validó con `tools.convert.verify_qwen3_5`: 12.336 registros de expertos, 1.178 tensores y 240 escalas de entrada FP8 comparados palabra por palabra contra el checkpoint, sin discrepancias. Son bit-exactos respecto al checkpoint todos los expertos enrutados y compartidos (palabras NVFP4, escalas de bloque, multiplicadores), las proyecciones FP8 de atención, GDN y salida con sus escalas de entrada, el router, las normas, los embeddings y la torre de visión. Solo los drafters (777 tensores MTP y 55 tensores DFlash2) se recuantizaron a los layouts Q4 y Q8 del motor, junto con la cabeza de propuesta Q4. No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni si hubo RLHF/DPO en el material proporcionado.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imágenes mediante torre de visión incluida en el artefacto (multimodal).
- Razonamiento en modo "thinking": la model card menciona dos modos de pensamiento con parámetros de muestreo recomendados comunes (temperatura 1.0, top-p 0.95, top-k 20, min-p 0, presence penalty 1.5).
- Decodificación especulativa con MTP (dos borradores por ronda, verificados solo cuando el drafter tiene confianza suficiente) y con DFlash2 como alternativa.
- Cabeza de propuesta Q4 para `--lm-head-draft` (sin ganancia medida en este modelo).
- Contexto largo: hasta 262.144 tokens en configuración de servidor, con KV bajo demanda a partir de los 32.768 tokens.
- Servidor concurrente (`infernix-serve`) con caché de prefijo y `--max-concurrency 2`.
- No se documenta soporte explícito de tool calling, function calling ni capacidades de agente multi-paso en la información disponible.

## Casos de uso

- Inferencia local de un MoE de 122B en una sola GPU de consumo: un desarrollador con una RTX 5090 y ~70 GiB de RAM libre puede ejecutar el modelo con Infernix en modo "todo en RAM", sin clúster ni GPUs de datacenter.
- Servicio conversacional multimodal: `infernix-serve` con `--max-context 262144` y `--max-concurrency 2` permite atender diálogos con imágenes y contexto muy largo, aprovechando la torre de visión y el KV bajo demanda.
- Procesamiento de documentos largos con imágenes: la ventana de 262.144 tokens y la entrada `image-text-to-text` permiten analizar informes, contratos o artículos con figuras en una sola pasada.
- Prototipado e investigación sobre decodificación especulativa: el artefacto incluye MTP y DFlash2, lo que permite comparar políticas de especulación (el autor reporta +14 % con MTP a una petición y -6 % con dos peticiones concurrentes).
- Evaluación de cuantización NVFP4 en hardware Blackwell: al ser bit-exacto frente al checkpoint en expertos y proyecciones, sirve como referencia para medir el impacto de la cuantización en calidad.
- Despliegue con presupuesto de VRAM ajustado: el modo de tier SSD (`--expert-ram-mib`) permite ejecutar con menos de 70 GiB de RAM leyendo expertos desde disco, útil en estaciones de trabajo con memoria limitada.
- Reproducibilidad de resultados: la ruta `--reproducible` ofrece ejecución bit-exacta y `--lossless` redondeo correcto (~5 tok/s), útil para validación de pipelines.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que la calidad no se ha medido más allá de la comparación bit-exacta con el checkpoint. Sí se publican métricas de velocidad en RTX 5090 con i9-13900K, 96 GB DDR5 y PCIe 5.0 x8, a una petición:

| Medida | Resultado |
|---|---:|
| Decodificación, KV INT8, prompts de 1.280 tokens, greedy: plano / `--spec mtp --draft-tokens auto` | 69-81 / 77-103 tok/s |
| Lo mismo, muestreado a temperatura 1.0 | 64-74 / 66-91 tok/s |
| Decodificación plana, greedy, KV BF16 (tg256 tras prompt de 512 tokens) | 90-97 tok/s |
| Prefill, KV BF16, prompt de 4K / 32K | 1.750 / 6.500 tok/s |

La decodificación depende del texto mediante la tasa de acierto de expertos en VRAM (74-80 %), ya que está limitada por los bytes de los expertos ausentes.

## Requisitos de hardware

- GPU: RTX 5090 (32 GB) u otra GPU `sm_120a` con 32 GB de VRAM. No se documenta soporte para otras arquitecturas.
- RAM del host: ~70 GiB libres para el modo "todo en RAM"; con menos, el ledger de RAM retiene los expertos que quepan y lee el resto desde el artefacto (tier SSD), ajustable con `--expert-ram-mib`. En Windows, la memoria paginada se limita al 80 % de la RAM.
- Disco: ~75 GB para las tres partes del artefacto, que deben mantenerse en un mismo directorio; se pasa la parte 1 al motor.
- Software: build de Infernix desde `main` en el commit `5069e375` o posterior.
- Despliegue: motor propietario Infernix (`infernix` para CLI, `infernix-serve` para servidor). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Memoria de contexto: solo los primeros 32.768 tokens de KV se reservan al arrancar; `--host-context-mib 4096` mantiene pequeña la caché de prefijo en RAM.
- Latencia y throughput: ver tabla de benchmarks; `--lossless` ronda los 5 tok/s.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato / motor | Notas |
|---|---|---|---|---|---|---|
| Ornith-1.5-122B-NVFP4-Infernix | 122B (MoE) | 10B | 262.144 | MIT | `.infernix` / Infernix | Requiere RTX 5090 y ~70 GiB RAM; multimodal; bit-exacto al checkpoint en expertos |
| ornith-ai/Ornith-1.5-122B-NVFP4 (base) | 122B (MoE) | 10B | No disponible | MIT | NVFP4 | Checkpoint de referencia del que deriva este artefacto |
| incoai/Ornith-1.5-122B-DFlash2 | No disponible | No disponible | No disponible | Apache 2.0 | No disponible | Drafter de decodificación especulativa incluido en el artefacto |

No se dispone de datos de rendimiento comparativo con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor declara que el artefacto, la receta de conversión, el motor y buena parte de la model card se hicieron con IA (mayoritariamente Claude Opus 5.5) y que es trabajo hobby, probablemente incompleto o inexacto.
- No hay mediciones de calidad más allá de la verificación bit-exacta; el impacto de la cuantización NVFP4 en tareas reales no está evaluado.
- Dependencia total del motor Infernix: el formato `.infernix` no es compatible con vLLM, llama.cpp, Ollama ni TGI, lo que limita la portabilidad.
- Requisito de hardware muy específico: GPU `sm_120a` con 32 GB y ~70 GiB de RAM para el modo completo; en Windows la memoria paginada se limita al 80 % de la RAM.
- El rendimiento depende del contenido: la tasa de acierto de expertos en VRAM (74-80 %) hace que la velocidad varíe con el texto.
- La decodificación especulativa con MTP pierde ~6 % con dos peticiones concurrentes; DFlash2 pierde 16 % frente a decodificación plana en ese escenario.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Sesgos y riesgo de alucinación: no documentados en la información disponible, pero aplicables por tratarse de un LLM sin evaluación publicada.
- Licencia MIT para el modelo base, con atribución Apache 2.0 para el drafter DFlash2 (`LICENSE-APACHE-2.0` y `NOTICE` incluidos); conviene revisar ambas antes de uso comercial.

## Enlaces

- Artefacto en Hugging Face: https://huggingface.co/wallawalla47/Ornith-1.5-122B-NVFP4-Infernix
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B-NVFP4
- Licencia del modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-122B/blob/main/LICENSE
- Drafter DFlash2: https://huggingface.co/incoai/Ornith-1.5-122B-DFlash2
- Repositorio del motor Infernix: https://github.com/Wallawalla47/Infernix
- Documento de diseño del offload: https://github.com/Wallawalla47/Infernix/blob/main/docs/maintainer/qwen3_5-122b-offload-design.md
- Guía del modelo: https://github.com/Wallawalla47/Infernix/blob/main/docs/qwen3_5-122b.md
