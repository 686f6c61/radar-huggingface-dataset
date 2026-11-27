# tencent/Hy4-base

## Resumen

Hy4-base es el modelo base (pretrained, sin ajuste fino de instrucciones) de la familia Hy4 del equipo Tencent Hy. Se trata de un modelo multimodal de tipo Mixture-of-Experts (MoE) que procesa texto e imágenes, con un backbone lingüístico de 770B parámetros totales de los que se activan 49B por token, más un codificador visual ViT de 1,23B parámetros y un drafter DFly2 de 3,3B parámetros integrado para decodificación especulativa.

El modelo resuelve la necesidad de un backbone de gran capacidad y contexto muy largo (1.048.576 tokens) orientado a tareas de agente, comprensión de imágenes y razonamiento de horizonte largo. Su arquitectura incorpora innovaciones recientes como Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, conexiones residuales iHC y atención MLA, lo que busca reducir el coste computacional del contexto largo manteniendo calidad.

Es relevante ahora porque representa la apuesta de Tencent por modelos MoE multimodales de escala frontera con licencia propia (Tencent Hy License), publicación de pesos en safetensors y soporte declarado para vLLM y SGLang. Al ser un modelo base, está pensado como punto de partida para ajuste fino y para evaluación de capacidades en bruto, no como asistente listo para uso conversacional directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con backbone transformer, atención Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache y MLA; codificador visual ViT |
| Parametros totales | 771.142.535.581 (≈771B, incluyendo ViT y DFly2); 770B en el backbone lingüístico |
| Parametros activos | 49B texto + 1,23B visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No especificados en la información disponible; existe repositorio GGUF de terceros (AngelSlim/Hy4-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license_name: tencent-hy-license, license: other) |
| Formato de pesos | safetensors (librería transformers); GGUF disponible en repo de terceros |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 78 capas: una capa con FFN densa y 77 capas MoE. Cada capa MoE contiene 256 expertos enrutados más 1 experto compartido, y cada token activa los 8 expertos enrutados principales junto con el compartido. El tamaño oculto es 6.144, el vocabulario 120.832 y el tamaño intermedio de los expertos 2.048 (FFN densa: 18.432). La atención usa Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank 2.048 y kv_lora_rank 512, combinada con Gated DeepSeek Sparse Attention e IndexCache para reutilizar índices dispersos entre capas; el indexador selecciona los top-2.048 tokens. Las conexiones residuales emplean iHC (identity Hyper-Connections) con 4 flujos residuales.

El codificador visual es un ViT de 40 capas, tamaño oculto 1.536, 16 cabezas de atención, parches de 16×16 y fusión de características 2×2, con soporte de resoluciones dinámicas; un adaptador convierte las características de imagen y fotogramas de vídeo en tokens visuales. El drafter DFly2 (5 capas, 3,3B parámetros) reutiliza la caché KV y los índices dispersos de Hy4 para decodificación especulativa de bajo coste en contexto largo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO.

## Capacidades

- Comprensión de texto e imágenes (pipeline image-text-to-text).
- Procesamiento de vídeo a través de la conversión de fotogramas en tokens visuales.
- Razonamiento y conocimiento general a escala de modelo base (evaluado con benchmarks few-shot).
- Generación de código y tareas de agente (evaluación interna de bits-per-byte en código y agente).
- Contexto muy largo de hasta 1M tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Decodificación especulativa integrada mediante DFly2 para acelerar la inferencia en contexto largo.
- Capacidades multilingües: no detalladas en la información disponible.
- Soporte de tool calling / function calling: no confirmado explícitamente para este modelo base en la información disponible.

## Casos de uso

- Desarrollo frontend y de videojuegos: el modelo puede analizar capturas de interfaz o bocetos y generar código de UI, aprovechando su comprensión visual y su capacidad de generación de código evaluada en el pretrain.
- Automatización de flujos de oficina y finanzas: procesamiento de documentos largos con tablas e imágenes dentro de la ventana de 1M tokens, sin necesidad de trocear el contenido.
- Investigación científica y I+D en IA: uso como backbone base para ajuste fino en dominios técnicos, al ser un modelo pretrained con pesos abiertos en safetensors.
- Asistente personal de horizonte largo: gestión de tareas multi-paso con historial conversacional extenso gracias al contexto de 1M tokens y al drafter DFly2 que abarata la decodificación en secuencias largas.
- Visión y uso de ordenador (computer use): interpretación de pantallas y elementos de interfaz para agentes que operan aplicaciones, apoyándose en el ViT de resolución dinámica.
- Evaluación comparativa de modelos: al ser un modelo base, sirve para medir capacidades en bruto (few-shot, BPB) frente a otros backbones antes de decidir un ajuste fino.
- Procesamiento de vídeo a gran escala: extracción de características de fotogramas convertidos en tokens visuales para tareas de descripción o análisis temporal.

## Benchmarks y rendimiento

Resultados few-shot de pretrain publicados en la model card (MMLU, MMLU-Pro, MMLU-Redux):

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU† | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro† | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |
| Conocimiento | MMLU-Redux† | 5 | no disponible (tabla truncada) | no disponible | no disponible | no disponible | no disponible |

Además, la model card incluye una gráfica de bits-per-byte (BPB) en validación interna de código y agente frente a parámetros activos (menor es mejor), pero los valores numéricos no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 770B parámetros totales, la inferencia en precisión completa requiere múltiples aceleradores de gran memoria; no se publican cifras oficiales.
- GPU recomendadas: no especificadas. Por escala, se requiere un despliegue multi-GPU de clase centro de datos (A100, H100 o equivalentes); no se confirma compatibilidad con GPU de consumo.
- ¿Cabe en GPU de consumo? No es viable en GPU de consumo para el modelo completo; existe un repositorio GGUF de terceros (AngelSlim/Hy4-GGUF) que podría permitir cuantizaciones, pero no se detallan requisitos.
- Opciones de despliegue: vLLM y SGLang (soportados según la model card), transformers; llama.cpp/Ollama no confirmados oficialmente para el modelo completo.
- Latencia y throughput: no disponibles. La decodificación especulativa con DFly2 está diseñada para reducir el coste en contexto largo, pero no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | MMLU (5-shot) | MMLU-Pro (5-shot) | Licencia |
|---|---|---:|---:|---:|---:|---|
| Hy4-base (Tencent) | 770B (backbone) | 49B texto + 1,23B visión | 1M | 91,6 | 73,9 | Tencent Hy License |
| Hy4 flash Base (Tencent) | no disponible | no disponible | no disponible | 88,7 | 71,1 | no disponible |
| DeepSeek-V4-flash-Base | no disponible | no disponible | no disponible | 89,7 | 68,6 | no disponible |
| DeepSeek-V4-Pro-Base | no disponible | no disponible | no disponible | 91,1 | 73,4 | no disponible |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus resultados en MMLU y MMLU-Pro.

## Limitaciones y advertencias

- Es un modelo base (pretrained), no ajustado para instrucciones: no debe esperarse un comportamiento de asistente conversacional sin ajuste fino adicional.
- Riesgo de alucinación inherente a modelos de lenguaje de gran escala; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no especificados, lo que impide garantizar calidad multilingüe.
- Licencia Tencent Hy License (no estándar): es necesario revisar el texto completo antes de uso comercial; no se confirman aquí los términos de explotación.
- Contexto de 1M tokens: aunque soportado, el rendimiento real en el extremo de la ventana no está cuantificado en la información disponible.
- Requisitos de hardware muy elevados (770B parámetros totales, repo de 1,5 TB), lo que limita el despliegue a infraestructura de centro de datos.
- El soporte de tool calling y de agentes no está confirmado explícitamente para este modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy4-base
- Licencia: https://huggingface.co/tencent/Hy4-base/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Artículo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
