# vllm-project/gemma-4-26B-AWQ

## Resumen

Gemma 4 26B-AWQ es una cuantización de 4 bits del modelo `google/gemma-4-26b-a4b-it`, publicada por el equipo de vLLM como copia de referencia para sus pruebas de integración continua. El modelo base es una arquitectura Mixture-of-Experts (MoE) con 128 expertos y enrutamiento top-8, 30 capas y 25.805.936.206 parámetros totales según los safetensors del repositorio, de los cuales aproximadamente 4.000 millones están activos por token (dato declarado en la model card). La cuantización AWQ usa group_size=32 y una calibración GPTQ con enrutamiento forzado que cubre los 128 expertos, una innovación relevante porque la calibración GPTQ convencional solo alcanza una fracción mínima de los expertos raros.

El interés de esta ficha es doble. Por un lado, documenta un checkpoint cuantizado pensado específicamente para GPUs AMD RDNA4 (gfx1201) con SGLang y ROCm 7.2, un nicho poco cubierto por las cuantizaciones habituales orientadas a CUDA. Por otro, sirve como referencia de las limitaciones prácticas de cuantizar un MoE con capas de visión: el codificador visual fue cuantizado a INT4 y el autor declara que la inferencia multimodal es inestable en este entorno, recomendando uso solo de texto.

El contexto probado es de 4K tokens, muy por debajo de lo que suele ofrecer la familia Gemma, y no hay datos publicados sobre benchmarks. La licencia del repositorio es Apache 2.0 según los metadatos de Hugging Face, aunque conviene verificar la licencia del modelo base antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer, 128 expertos, top-8, 30 capas |
| Parametros totales | 25.805.936.206 (~26B) |
| Parametros activos | ~4B (A4B, segun model card) |
| Longitud de contexto | 4K (probado); maximo nativo no disponible |
| Tipos de cuantizacion | AWQ 4-bit, group_size=32 (pesos); capas de visión en INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (metadatos del repo; verificar modelo base) |
| Formato de pesos | safetensors (AWQ), repositorio de 16,8 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 30 capas, 128 expertos y enrutamiento top-8, con unos 26.000 millones de parámetros totales y 4.000 millones activos por token. Esta esta cuantización concreta no aporta información sobre el entrenamiento original (número de tokens, composición del dataset, RLHF/DPO); esos detalles corresponden a la model card de `google/gemma-4-26b-a4b-it`, no incluida en la información disponible. Lo que sí documenta el autor es el proceso de cuantización: AWQ de 4 bits con group_size=32, calibrado mediante GPTQ con enrutamiento forzado para que los 128 expertos reciban calibración efectiva, corrigiendo el sesgo de enrutamiento que hace que los expertos raros queden infra-representados en la calibración estándar.

La innovación técnica destacable es, por tanto, metodológica más que arquitectónica: la calibración forzada de todos los expertos en un MoE de 128 expertos. El checkpoint está optimizado para SGLang v0.5.10 con parches para RDNA4 y ROCm 7.2, y el autor indica que las capas `embed_vision.*` se cuantizaron a INT4 en lugar de excluirse, lo que degrada la calidad visual y provoca caídas del servidor en la primera petición multimodal por un problema preexistente de Triton en RDNA4 con la configuración de atención SWA del modelo.

## Capacidades

- Generación de texto y razonamiento en el modelo base (capacidades exactas del base no detalladas en la información disponible).
- Inferencia de texto con SGLang sobre GPUs AMD RDNA4 (gfx1201) y ROCm 7.2.
- Cuantización 4-bit con soporte de tensor parallelism (TP=2 probado).
- Capacidad multimodal (visión) presente en el modelo base, pero no utilizable de forma fiable en esta cuantización.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia de texto en servidores AMD RDNA4: despliegue con SGLang y ROCm 7.2 sobre Radeon AI PRO R9700, aprovechando que el checkpoint está calibrado y parcheado para gfx1201, un entorno con menos soporte que CUDA.
- Pruebas de integración continua de vLLM: el repositorio existe precisamente como copia de referencia para CI, por lo que encaja en pipelines que validan kernels de cuantización AWQ sobre hardware AMD.
- Servicio de generación de texto con throughput moderado: con 30 tok/s por usuario en 2x R9700 y TP=2, es adecuado para cargas interactivas de baja concurrencia más que para serving de alta densidad.
- Evaluación comparativa de cuantizaciones MoE: útil para medir el impacto de la calibración forzada de expertos frente a GPTQ convencional en un MoE de 128 expertos.
- Prototipado de asistentes de texto de dominio general: el modelo base es instruction-tuned (`-it`) y de 26B, suficiente para tareas de redacción y respuesta, siempre que las entradas quepan en 4K tokens.
- Investigación sobre cuantización de capas no lingüísticas: el caso documentado de `embed_vision.*` en INT4 sirve como referencia negativa para estudiar qué capas deben excluirse de la cuantización en modelos multimodales.
- Despliegue en clústeres pequeños de GPUs de consumo profesional: dos R9700 con 32+34 GB de VRAM son un objetivo realista para laboratorios con hardware AMD y sin acceso a A100/H100.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es la velocidad de decodificación: 30 tok/s por usuario en 2x AMD Radeon AI PRO R9700 con TP=2, SGLang v0.5.10 y ROCm 7.2.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 16,8 GB, por lo que la inferencia en 4 bits requiere en torno a 16-18 GB de VRAM para pesos, más caché KV y overhead del runtime; con TP=2 el autor reparte la carga entre dos GPUs de 32 y 34 GB.
- GPU probadas: 2x AMD Radeon AI PRO R9700 (gfx1201, RDNA4), ROCm 7.2.
- GPU CUDA (A100, H100, RTX 4090): no documentadas para este checkpoint; el autor solo valida el camino AMD/SGLang.
- ¿Cabe en GPU de consumo? Por tamaño de pesos sí cabría en GPUs con 24 GB (por ejemplo, RTX 4090), pero no hay validación publicada en ese hardware y el objetivo declarado es RDNA4.
- Despliegue: SGLang v0.5.10 con parches RDNA4 (repositorio `2x-R9700-RDNA4-GFX1201-sglang-inference`). vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint en la información disponible.
- Latencia y throughput: 30 tok/s por usuario en decodificación con TP=2; no hay datos de prefill ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| vllm-project/gemma-4-26B-AWQ | 26B totales / 4B activos | 4K probado | AWQ 4-bit | Apache 2.0 | AMD RDNA4 (gfx1201), SGLang |
| google/gemma-4-26b-a4b-it | 26B totales / 4B activos | no disponible | BF16/FP16 original | no disponible | CUDA/TPU generico |
| mattbucci/gemma-4-26B-AWQ (original) | 26B totales / 4B activos | 4K probado | AWQ 4-bit | Apache 2.0 | AMD RDNA4 (gfx1201), SGLang |

La comparación con cuantizaciones CUDA de la misma familia (por ejemplo, variantes GPTQ/AWQ orientadas a vLLM en NVIDIA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Visión no utilizable: las capas `embed_vision.*` se cuantizaron a INT4 y el servidor se cae en la primera petición multimodal por un fallo preexistente de Triton en RDNA4 con la configuración SWA; el autor recomienda inferencia solo de texto.
- Contexto limitado: solo se han probado 4K tokens; no hay evidencia de comportamiento estable con ventanas mayores.
- Hardware restringido: validado únicamente en RDNA4 (gfx1201) con ROCm 7.2 y SGLang parcheado; el rendimiento en CUDA o en otras arquitecturas AMD no está documentado.
- Repositorio de CI: es una copia de un checkpoint de una cuenta personal, mantenida por vLLM para reducir riesgo de cadena de suministro; no es un artefacto oficial de Google.
- Licencia: el repo declara Apache 2.0, pero la licencia efectiva del modelo base debe verificarse antes de uso comercial, ya que la familia Gemma suele tener términos propios.
- Riesgo de alucinación y sesgos: no hay evaluación publicada en esta cuantización; la cuantización 4-bit puede ampliar la degradación respecto al base en tareas sensibles.
- Idiomas soportados: no disponibles, por lo que no se puede garantizar cobertura multilingüe en esta variante.
- Sin benchmarks: no hay MMLU, HumanEval ni GSM8K publicados para este checkpoint, lo que impide cuantificar la pérdida de calidad frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/vllm-project/gemma-4-26B-AWQ
- Modelo base: https://huggingface.co/google/gemma-4-26b-a4b-it
- Checkpoint original: https://huggingface.co/mattbucci/gemma-4-26B-AWQ
- Repositorio de inferencia RDNA4: https://github.com/mattbucci/2x-R9700-RDNA4-GFX1201-sglang-inference
- SGLang: https://github.com/sgl-project/sglang
