# tahamajs/llava-qwen-0.5b-triton-svd-linear-attention-scienceqa

## Resumen

`llava-qwen-0.5b-triton-svd-linear-attention-scienceqa` es un checkpoint quirúrgico del modelo multimodal LLaVA-Qwen-0.5B, publicado por el autor `tahamajs` bajo el paraguas del proyecto NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención sobre `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye la atención cuadrática estándar de 18 de las 24 capas del decodificador por un operador de atención lineal acelerado con Triton y proyecciones de bajo rango basadas en SVD (`TritonSVDLinearAttention`), manteniendo 6 capas ancla con atención cuadrática original.

El problema que aborda es la reducción del coste computacional y de almacenamiento en modelos visión-lenguaje pequeños sin perder demasiada calidad. El artefacto serializado ocupa 49,73 MB frente a los 1,66 GB del modelo base completo FP16, una reducción del 97,1 %. Para recuperar parte de la capacidad perdida por la cirugía, se aplica destilación de conocimiento en dos etapas (70 + 130 pasos) sobre ScienceQA, partiendo de un 31,87 % de precisión zero-shot hasta un 41,88 % final.

Es relevante ahora porque ejemplifica una línea de trabajo activa: la modificación estructural de modelos abiertos (attention surgery) combinada con operadores eficientes en Triton y destilación selectiva, empaquetada como delta de pesos reutilizable. El modelo está orientado a investigación y experimentación, no a producción directa, y su licencia MIT facilita la inspección y reutilización del código asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas), con atención lineal SVD+Triton en 18/24 capas |
| Parametros totales | No disponible (el modelo base Qwen2-0.5B ronda los 0,5B, pero la ficha no lo declara explícitamente) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos serializados en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta de atención en FP16) |

## Arquitectura y entrenamiento

El modelo base `llava-interleave-qwen-0.5b-hf` combina una torre visual SigLIP congelada de 27 capas, un proyector multimodal MLP de 2 capas y un decodificador Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas de atención y head_dim=64. La intervención quirúrgica reemplaza la atención de 18 de esas 24 capas por `TritonSVDLinearAttention`, un operador de atención lineal que incorpora proyecciones de bajo rango mediante SVD, RoPE, GQA y atención enmascarada, implementado en Triton. Las 6 capas restantes `[3, 7, 11, 15, 19, 23]` se conservan como anclas cuadráticas (esquema `hybrid_3_1`), junto con los MLP, embeddings y la torre visual, que permanecen congelados.

El entrenamiento consiste en destilación de conocimiento sobre ScienceQA (subconjunto STEM con imágenes, split de validación) en dos etapas: 70 pasos en la etapa 1 y 130 en la etapa 2, totalizando 200 pasos en 120,1 segundos sobre una NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 11.749 MB. Solo se guardan los pesos de atención modificados y los layernorms del decodificador (228 tensores, formato `attention_only_fp16`), documentados en un manifiesto `surgical_manifest.json` con esquema `neuralops.surgery/v2`. El resultado es un delta de pesos que debe cargarse junto con el modelo base mediante la API `neuralops.hub.load_surgeried_model`.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre imágenes, especialmente en dominios STEM (ciencia, matemáticas, tecnología).
- Razonamiento multimodal de un solo turno orientado a selección de opciones múltiples (formato ScienceQA).
- Soporte de chat mediante plantilla de conversación incluida (`chat_template.json`).
- Capacidades multilingües: únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido.
- No se documenta soporte de audio ni vídeo.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint sirve para comparar empíricamente atención cuadrática frente a atención lineal SVD+Triton en un VLM pequeño, gracias a que el manifiesto quirúrgico identifica exactamente qué capas se modificaron y cuáles se conservaron.
- Experimentos de destilación de conocimiento: el par de métricas pre-KD (31,87 %) y post-KD (41,88 %) permite reproducir y estudiar la recuperación de capacidad tras una cirugía agresiva de atención con solo 200 pasos de ajuste.
- Prototipado de asistentes educativos STEM: con 41,88 % de precisión en ScienceQA con imágenes, puede usarse como base para evaluar técnicas de ajuste sobre preguntas de ciencias con soporte visual, siempre con validación adicional.
- Benchmarking de operadores Triton: el repositorio permite medir el rendimiento real de `TritonSVDLinearAttention` en una GPU de consumo (RTX 3090) frente a alternativas de atención eficiente.
- Docencia y divulgación: el tamaño reducido del artefacto (49,73 MB) y su licencia MIT lo hacen adecuado para talleres donde se enseña cirugía de atención y delta de pesos.
- Evaluación de pipelines de carga modulares: útil para probar la API `neuralops.hub.load_surgeried_model` y flujos de carga de deltas sobre modelos base congelados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Métrica | Baseline profesor | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión ScienceQA (%) | 63,75 | 31,87 | 41,88 | +10,01 |
| Perplejidad ScienceQA | 2,45 | 9,76 | 3,26 | -6,50 |

Evaluación sobre ScienceQA (subconjunto STEM con imágenes, validación). El baseline profesor corresponde al modelo base sin cirugía. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento de la destilación realizado en una NVIDIA RTX 3090 (24 GB) con un pico de 11.749 MB, en 120,1 segundos y 200 pasos.
- El artefacto delta ocupa 49,73 MB en FP16; la inferencia requiere además cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16).
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (≈0,5B parámetros) y la torre SigLIP, debería caber holgadamente en GPUs de consumo con 8 GB o más, pero no se confirma en la ficha.
- GPU recomendadas: cualquier GPU con soporte Triton (RTX 3090 verificada en entrenamiento); no se documentan pruebas en A100, H100 ni otras.
- Despliegue: la única vía documentada es la librería `neuralops` mediante `load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-triton-svd-linear-attention-scienceqa` | ≈0,5B (base) | No disponible | 41,88 % | MIT | Hugging Face (delta de atención) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base, sin cirugía) | ≈0,5B | No disponible | 63,75 % (baseline profesor) | No disponible en la información | Hugging Face |
| Otras variantes del Attention Surgery Zoo de NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de otros modelos de la misma categoría.

## Limitaciones y advertencias

- Pérdida sustancial de precisión frente al modelo base: 41,88 % frente a 63,75 % en ScienceQA, una caída de 21,87 puntos porcentuales pese a la destilación.
- El ajuste se realizó únicamente sobre el split de validación de ScienceQA; no hay evaluación en test ni en otros dominios, por lo que el riesgo de sobreajuste al benchmark es alto.
- Solo soporta inglés; no hay capacidades multilingües.
- No se documenta longitud de contexto, por lo que no puede asumirse una ventana amplia para conversaciones largas.
- Riesgo de alucinación no cuantificado; al ser un VLM pequeño con atención lineal, es previsible una degradación en razonamiento visual complejo, aunque no se aportan datos al respecto.
- Los pesos son un delta quirúrgico: no funcionan de forma autónoma y requieren el modelo base y la librería `neuralops` para cargarse.
- Requiere soporte Triton en la GPU; no se documenta funcionamiento en CPU.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente.
- Licencia MIT, lo que permite uso comercial del artefacto, pero conviene revisar la licencia del modelo base y de la torre SigLIP subyacentes.
- No apto para producción sin validación adicional: el modelo está orientado a investigación en eficiencia de atención.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-triton-svd-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/triton_svd_linear_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
