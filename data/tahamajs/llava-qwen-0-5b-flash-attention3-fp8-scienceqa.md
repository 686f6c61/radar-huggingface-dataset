# tahamajs/llava-qwen-0.5b-flash-attention3-fp8-scienceqa

## Resumen
LLaVA-Qwen-0.5B FlashAttention3-FP8 ScienceQA es un checkpoint quirúrgico multimodal publicado por el usuario `tahamajs` dentro del ecosistema NeuralOps, derivado del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`. No es un modelo entrenado desde cero, sino el resultado de sustituir el mecanismo de atención de 18 de las 24 capas del decodificador Qwen2 por una implementación FlashAttention-3 en FP8 (formato `e4m3fn`), seguida de una fase de destilación de conocimiento para recuperar calidad tras la cirugía. El objetivo declarado es doble: reducir el peso del artefacto en disco (147,62 MB frente a 1,66 GB del base, un 91,3 % menos) y acelerar la atención en GPUs Hopper (SM 9.0+), con retroceso automático a SDPA nativo de PyTorch en hardware anterior o CPU.

El modelo mantiene la arquitectura LLaVA-Interleave: torre de visión SigLIP congelada (27 capas), proyector MLP de 2 capas y decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y `head_dim` de 64. La intervención se limita a las atenciones de 18 capas y a los layernorms del decodificador entrenados; el resto de pesos (torre de visión, proyector, MLPs, embeddings y 6 capas ancla cuadráticas en los índices 3, 7, 11, 15, 19 y 23) se reutiliza del base congelado.

Es relevante ahora porque ejemplifica una línea de trabajo poco frecuente en modelos abiertos: la optimización de kernels de atención (FlashAttention-3 con cuantización FP8) aplicada a un VLM pequeño y publicada como delta de pesos modular, con métricas de telemetría de entrenamiento verificables. Su utilidad práctica es acotada: está afinado y evaluado exclusivamente sobre ScienceQA en inglés, por lo que funciona como referencia técnica de atención quirúrgica más que como modelo de producción generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave: SigLIP (torre de visión) + proyector MLP 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), con atención FlashAttention-3 FP8 en 18/24 capas |
| Parámetros totales | no disponible (el artefacto delta pesa 147,62 MB frente a 1,66 GB del base; no se declara el recuento total) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (`e4m3fn`) en los kernels de atención FlashAttention-3; pesos delta serializados en safetensors FP16; fallback a SDPA en PyTorch nativo |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico modular) + `surgical_manifest.json` con la topología de capas modificadas |

## Arquitectura y entrenamiento
El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y aplica una "cirugía de atención" sobre 18 de las 24 capas del decodificador, siguiendo un patrón `hybrid_3_1` que deja 6 capas ancla con atención cuadrática estándar en los índices 3, 7, 11, 15, 19 y 23. Las capas modificadas usan `FlashAttention3FP8`, un operador de la familia `fast_kernels` de NeuralOps que ejecuta la atención multi-cabeza en precisión FP8 `e4m3fn` con kernels FlashAttention-3 sobre GPUs Hopper (SM 9.0+), con retroceso automático a SDPA de PyTorch en hardware pre-Hopper o CPU. La torre de visión SigLIP (27 capas), el proyector multimodal, los MLPs del decodificador y los embeddings permanecen congelados y se excluyen del artefacto publicado.

El entrenamiento consistió en una destilación de conocimiento en dos etapas (91 pasos en la etapa 1 y 148 en la etapa 2, 239 pasos totales) ejecutada en una única NVIDIA RTX 3090 de 24 GB, con una duración de 120,4 s y un pico de VRAM de 17.809 MB. La destilación recuperó buena parte de la calidad perdida por la cirugía: la precisión pasó del 32,50 % en zero-shot tras la intervención al 59,38 % final, frente al 63,75 % del profesor, y la perplejidad bajó de 5,12 a 2,10 (el profesor marcaba 2,45). No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron RLHF o DPO.

## Capacidades
- Generación de texto e imagen-a-texto conversacional en inglés, con plantilla de chat propia (`chat_template.json`).
- Razonamiento visual sobre preguntas de ciencia con imagen (ScienceQA, subconjunto STEM con imagen): el modelo responde seleccionando la letra de la opción correcta.
- Procesamiento multimodal imagen + texto mediante el procesador incluido (`preprocessor_config.json` para imágenes de 384×384 en el ejemplo de la model card).
- Atención acelerada por hardware en GPUs Hopper gracias a los kernels FlashAttention-3 FP8, con degradación transparente a SDPA en el resto de plataformas.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión de vídeo, audio ni modo "thinking" en la información disponible.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso
- Evaluación de kernels de atención en investigación: sirve como referencia reproducible para medir el impacto de sustituir atención estándar por FlashAttention-3 FP8 en un VLM pequeño, con métricas de precisión y perplejidad antes y después de la destilación.
- Prototipado de asistentes educativos de ciencias: el modelo está afinado sobre ScienceQA y puede integrarse en demos de respuesta a preguntas STEM con imagen, seleccionando la opción correcta entre varias.
- Pruebas de cuantización y compresión en pipelines de despliegue: el artefacto delta de 147,62 MB permite validar flujos de carga modular con `neuralops.hub.load_surgeried_model` antes de escalar a modelos mayores.
- Benchmarking de hardware Hopper: al usar kernels FP8 con fallback a SDPA, permite comparar latencia y throughput entre una H100 y una RTX 3090 sobre la misma carga de trabajo multimodal.
- Docencia y divulgación técnica: ilustra de forma concreta qué es una "cirugía de atención" y cómo la destilación de conocimiento recupera calidad tras modificar componentes internos del transformer.
- Investigación sobre destilación en VLMs: el par profesor (63,75 %) / alumno (59,38 %) con telemetría de pasos y VRAM facilita experimentos de ablación sobre el número de capas modificadas y el patrón híbrido `hybrid_3_1`.

## Benchmarks y rendimiento

| Métrica | Profesor (base) | Zero-shot tras cirugía | Final tras destilación | Delta |
|---|---:|---:|---:|---:|
| Precisión ScienceQA (%) | 63,75 | 32,50 | 59,38 | +26,88 |
| Perplejidad ScienceQA | 2,45 | 5,12 | 2,10 | -3,02 |

Datos declarados por el autor en la model card (`verified: false`), sobre el split de validación del subconjunto STEM con imagen de `derek-thomas/ScienceQA`. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 17.809 MB de pico en una RTX 3090 de 24 GB, y el artefacto delta en disco ocupa 147,62 MB, pero no se declara la VRAM de inferencia.
- GPU recomendadas: NVIDIA Hopper (H100, H200) para aprovechar los kernels FlashAttention-3 FP8; en GPUs pre-Hopper el modelo funciona con SDPA nativo, por lo que una RTX 3090 o A100 son viables aunque sin la aceleración FP8.
- Cabe en GPU de consumo: sí, según la telemetría de entrenamiento en RTX 3090; no se especifican requisitos para GPUs con menos de 24 GB.
- Opciones de despliegue: la vía documentada es la API pública de NeuralOps (`neuralops.hub.load_surgeried_model`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; solo se conoce la duración de entrenamiento (120,4 s para 239 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, subconjunto STEM con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-flash-attention3-fp8-scienceqa` | no disponible (delta de 147,62 MB) | no disponible | 59,38 % precisión / 2,10 PPL | MIT | Hugging Face, librería `neuralops` |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B (Qwen2 0.5B + SigLIP) | no disponible | 63,75 % precisión / 2,45 PPL | no disponible en esta ficha | Hugging Face, `transformers` |
| Otros VLM pequeños (p. ej. variantes LLaVA de 0,5 B) | ~0,5 B | no disponible | no disponible | variable | Hugging Face |

La comparativa se limita al modelo base porque la información proporcionada no incluye resultados de terceros sobre el mismo split. El checkpoint quirúrgico sacrifica 4,37 puntos de precisión frente al profesor a cambio de un artefacto 11,53 veces más pequeño y atención FP8 acelerada en Hopper.

## Limitaciones y advertencias
- Ámbito muy restringido: afinado y evaluado solo sobre ScienceQA en inglés; no hay evidencia de generalización a otras tareas visuales o de texto.
- Precisión inferior al profesor: 59,38 % frente a 63,75 %, una pérdida de 4,37 puntos que puede ser crítica en aplicaciones de evaluación automática.
- Métricas no verificadas: la model card marca los resultados como `verified: false`; no hay evaluación independiente.
- Dependencia del ecosistema NeuralOps: la carga requiere `neuralops.hub.load_surgeried_model`, una API no estándar frente a `transformers`, lo que complica la integración en pipelines convencionales.
- Artefacto delta, no modelo completo: los pesos publicados son solo las atenciones modificadas y los layernorms entrenados; es necesario el modelo base para reconstruir el checkpoint completo.
- Aceleración FP8 limitada a Hopper: en A100, RTX 3090 o CPU se pierde la ventaja de FlashAttention-3 y se ejecuta SDPA, con rendimiento no documentado.
- Riesgo de alucinación: no se documentan evaluaciones de fidelidad factual fuera de ScienceQA; en preguntas abiertas el comportamiento es desconocido.
- Sesgos: no se documenta ningún análisis de sesgos; al estar entrenado sobre un dataset académico de ciencias, puede heredar sesgos de composición de ScienceQA.
- Licencia MIT permite uso comercial, pero la ausencia de garantías y de evaluación fuera de dominio desaconseja su uso en producción sin validación propia.
- Sin soporte documentado de tool calling, agentes ni contexto largo; no apto para flujos agénticos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-flash-attention3-fp8-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador FlashAttention3FP8: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/fast_kernels/flash_attention3_fp8.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
