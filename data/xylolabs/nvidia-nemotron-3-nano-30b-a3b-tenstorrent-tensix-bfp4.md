# Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4

## Resumen

Este repositorio contiene una cuantización del modelo NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 de NVIDIA, adaptada específicamente para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs, que emplea su propio pipeline de cuantización GPTQ con búsqueda de exponente por bloque (tensix-bfp-gptq v0.1.0) para convertir los pesos originales en bf16 a formatos de coma flotante por bloques nativos del hardware: `bfloat4_b` (BFP4) y `bfloat8_b` (BFP8).

El modelo base es un transformer híbrido de tipo `nemotron_h` con 31.577.940.288 parámetros totales y arquitectura Mixture-of-Experts con atención y capas Mamba-2 combinadas (6 capas con atención, 23 con Mamba-2). El checkpoint empaquetado ocupa 18,985 GB, frente a los 63,16 GB del BF16 original, lo que supone una reducción de aproximadamente 3,3 veces en huella de almacenamiento. La cuantización aplica BFP4 a las proyecciones de entrada de Mamba-2 y a los expertos (enrutados y compartido), BFP8 a las proyecciones de salida de Mamba-2 y a las proyecciones de atención, y mantiene en bf16 el LM head, los embeddings y las normas.

La relevancia de esta ficha es doble: por un lado documenta un modelo de razonamiento y generación de texto de tamano medio con arquitectura híbrida; por otro, es un ejemplo práctico de portabilidad de pesos hacia silicio no-NVIDIA, un aspecto cada vez más relevante para quien evalúa costes de inferencia y diversificación de hardware. La licencia del modelo base es la NVIDIA Nemotron Open Model License, que impone condiciones específicas de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` con atención (6 capas) y Mamba-2 (23 capas), Mixture-of-Experts |
| Parametros totales | 31.577.940.288 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) y BFP8 (`bfloat8_b`) para Tensix; BF16 para LM head, embeddings y normas; float32 para `A_log`, `D` y `e_score_correction_bias` |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | safetensors (con `quant4.json` e índice de shards), código de modelo original de NVIDIA incluido |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido que intercala 6 capas de atención con 23 capas Mamba-2 (modelo de espacio de estados), organizadas en una estructura `backbone.layers.N` con submódulos `mixer` para Mamba y proyecciones de atención separadas. Incluye componentes Mixture-of-Experts con expertos enrutados y un experto compartido, además de un sesgo de corrección de puntuación (`e_score_correction_bias`) en la compuerta de enrutamiento. Los parámetros `A_log` y `D` de Mamba-2 se mantienen en float32 sin cuantizar, lo que preserva la estabilidad numérica de la dinámica de estado.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO u otras etapas de alineamiento) no se proporciona información en la documentación disponible; esa información correspondería a la model card de NVIDIA, no a este repositorio de cuantización. La innovación técnica destacable de este checkpoint es el pipeline de cuantización: GPTQ con búsqueda de exponente por bloque para los tensores BFP4 y redondeo al más cercano para los BFP8, con verificación de empaquetado mediante `pack_tensix.py` y `verify_grid.py`. Se documenta además que los mismos valores empaquetan de forma exacta en `ttnn.bfloat8_b`.

## Capacidades

- Generación de texto conversacional y de propósito general, con plantilla de chat aplicada mediante `apply_chat_template`.
- Razonamiento multi-paso y respuesta a instrucciones, heredado del modelo base Nemotron-3 Nano.
- Capacidades multilingües en inglés, español, francés, alemán, japonés e italiano.
- Ejecución sobre aceleradores Tenstorrent Tensix mediante ttnn, con empaquetado de matrices en DRAM del dispositivo.
- Compatibilidad con el ecosistema Transformers (`AutoModelForCausalLM`, `trust_remote_code=True`), lo que permite inferencia de referencia en GPU CUDA.
- Soporte de tool calling, function calling y modo thinking: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura Tenstorrent: el checkpoint está empaquetado para Wormhole y Blackhole con ttnn 0.81.1, de modo que un equipo con NPUs Tensix puede servir el modelo sin depender de GPUs NVIDIA, reduciendo la huella a 18,985 GB en DRAM.
- Inferencia de referencia y validación numérica: el quickstart con Transformers permite comparar salidas contra el BF16 original en una GPU CUDA antes de portar a silicio, útil para pipelines de control de calidad de cuantizaciones.
- Evaluación de compromiso precisión-tamano: con una KL media de 0,0543 frente a BF16 y un top-1 del 89,34 %, sirve para estudios que comparan BFP4/BFP8 frente a Q4_K_M de llama.cpp (KL 0,0407, top-1 90,60 %) en el mismo modelo.
- Asistentes conversacionales multilingües: el soporte de seis idiomas permite construir atención al cliente o asistentes internos en español, francés, alemán, italiano y japonés con un único checkpoint.
- Generación de texto en entornos con restricciones de memoria: los 18,985 GB empaquetados frente a los 63,16 GB en BF16 facilitan el alojamiento en nodos con DRAM limitada, siempre que el hardware sea Tensix o se use el camino CUDA de referencia.
- Investigación en formatos de coma flotante por bloques: el repositorio incluye `quant4.json` con el formato de cada proyección y scripts de verificación, lo que lo convierte en material de partida para experimentos con `bfloat4_b` y `bfloat8_b` en ttnn.
- Integración en pipelines de CI para validación de pesos: `pack_tensix.py` y `verify_grid.py` permiten comprobar automáticamente que cada matriz empaqueta y se recupera sin pérdida antes de desplegar una nueva revisión del checkpoint.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16) | 63,16 | 0 | 100 |
| Este modelo (BFP4/BFP8) | 18,985 | 0,0543 | 89,34 |
| Q4_K_M (llama.cpp) | 24,515 | 0,0407 | 90,60 |

Las métricas de KL y top-1 cubren 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), según la model card. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 18,985 GB de pesos empaquetados para Tensix; en el camino CUDA de referencia se carga con `dtype="bfloat16"` y `device_map="auto"`, por lo que la memoria necesaria será la del checkpoint en bf16 más las activaciones (no se especifica cifra exacta).
- GPU recomendadas para el quickstart: se indica explícitamente que el quickstart de referencia requiere una GPU CUDA; no se detallan modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: no disponible en la información proporcionada.
- Despliegue en Tensix: ttnn 0.81.1, verificado sobre ttsim (simulador Blackhole de Tenstorrent); kernels y runner en tensix-kernels v0.1.0 y tensix-runner v0.1.0.
- Despliegue en CUDA: Transformers 4.57.6 con mamba-ssm 2.3.2.post1; se advierte que la API de caché upstream es incompatible con Transformers 5.
- Otras opciones (vLLM, llama.cpp, Ollama, TGI): no disponible en la información proporcionada; llama.cpp solo aparece como referencia de comparación Q4_K_M.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Xylolabs, Tensix BFP4) | 31,58 B | no disponible | BFP4/BFP8 + bf16 | nvidia-nemotron-open-model-license | Hugging Face, 145 descargas |
| NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 31,58 B | no disponible | BF16 | nvidia-nemotron-open-model-license | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp (mismo modelo) | 31,58 B | no disponible | Q4_K_M, 24,515 GB | nvidia-nemotron-open-model-license | Referencia de comparación en la model card |

La comparación con alternativas de otros fabricantes del mismo tamano o tarea no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La licencia NVIDIA Nemotron Open Model License impone condiciones específicas; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- El checkpoint está pensado para Tensix; el quickstart en CUDA es solo de referencia y depende de `trust_remote_code=True` con el código original de NVIDIA, que conviene auditar antes de habilitar.
- Incompatibilidad documentada de la API de caché upstream con Transformers 5; el entorno validado es Transformers 4.57.6 y mamba-ssm 2.3.2.post1.
- El código original usa normalización con puerta implementada en Triton, lo que condiciona el stack de ejecución.
- La cuantización introduce degradación medible: KL media de 0,0543 y top-1 del 89,34 % frente al 100 % del BF16, ligeramente peor que Q4_K_M en ambas métricas.
- La evaluación de fidelidad se limita a 8.188 posiciones de inglés y coreano; no cubre los seis idiomas declarados ni tareas de razonamiento o código.
- Sesgos conocidos del modelo base: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la documentación disponible; aplica el comportamiento general del modelo base.
- Longitud de contexto y parámetros activos del MoE: no disponibles, lo que limita la planificación de despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3-Nano-30B-A3B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
- Paper referenciado (arXiv:2512.20848): https://arxiv.org/abs/2512.20848
