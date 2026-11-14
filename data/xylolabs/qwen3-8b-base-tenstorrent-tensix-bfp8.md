# Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-8B-Base-Tenstorrent-Tensix-BFP8 es una cuantización del modelo base Qwen3-8B-Base de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa del original, con 8.190.735.360 parámetros, pero cuantiza las proyecciones lineales de atención (q, k, v, o) y del MLP (gate, up, down) en las 36 capas al formato `ttnn.bfloat8_b` (BFP8, block floating point de 8 bits) mediante GPTQ, mientras que el LM head, los embeddings y las normas permanecen en bf16.

La relevancia de esta ficha es doble: por un lado, demuestra un flujo de cuantización orientado a hardware específico (no a GPU convencional), donde las matrices se almacenan como valores bf16 sobre la rejilla BFP8 para que TT-NN las empaquete sin alterar sus valores; por otro, reduce el peso del modelo a 9,87 GB empaquetados (9,64 bits por peso de media), lo que permite desplegarlo en dispositivos Tensix con memoria limitada frente a los 16,38 GB del BF16 original.

Conviene subrayar que se trata del modelo **base**, no instruction-tuned: continúa texto y no sigue instrucciones conversacionales, aunque su tokenizer mantiene la plantilla de chat del modelo original. La licencia es Apache 2.0, heredada de Qwen3-8B-Base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), capas lineales cuantizadas a BFP8 |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o, gate, up, down; bf16 en LM head, embeddings y normas; 9,64 bits/peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B-Base, un transformer denso de 36 capas. La modificación de Xylolabs no altera la topología: sustituye el almacenamiento de las proyecciones lineales por una rejilla de punto flotante por bloques (BFP8, 8,5 bits por peso en esas matrices) cuantizada con GPTQ. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Cada bloque conserva su exponente compartido tal como lo fija el empaquetador de TT-NN, de modo que las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP8 y el runtime las empaqueta sin cambiar sus valores.

El flujo de verificación incluido (`pack_tensix.py`, `verify_grid.py`) comprueba matriz a matriz que el empaquetado no altera los valores, y la model card reporta una prueba con `tt-transformers` (tt-metal v0.81.1) en la que las proyecciones de las dos primeras capas empaquetaron exactamente y un prefill de 2 capas coincidió con transformers con PCC 0,9988. No se documenta un entrenamiento adicional ni un proceso de RLHF/DPO: es una conversión de pesos del modelo base preentrenado.

## Capacidades

- Generación de texto y continuación de secuencias (modelo base, no instruction-tuned).
- Razonamiento y conocimiento general heredados de Qwen3-8B-Base.
- Generación de código y matemáticas (capacidades del modelo base, sin datos de benchmark específicos en esta ficha).
- Tool calling / function calling: no disponible como capacidad nativa verificada en esta conversión.
- Soporte de agentes y razonamiento multi-paso: no disponible (modelo base).
- Capacidades multilingües: no disponibles como dato declarado; la calibración usó texto en inglés y coreano.
- Capacidad especial: ejecución en NPU Tensix mediante TT-NN, con formatos BFP8/BFP4 seleccionables por proyección.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole/Blackhole: el modelo está empaquetado para TT-NN y ocupa 9,87 GB de memoria de dispositivo en pesos, lo que permite servirlo en aceleradores Tensix con memoria ajustada.
- Investigación en cuantización block floating point: sirve como referencia reproducible para estudiar el impacto de BFP8 con GPTQ frente a bf16, con scripts de verificación incluidos.
- Generación de texto en pipelines de continuación: al ser un modelo base, encaja en tareas de autocompletado, resumen extractivo o generación de borradores donde no se requiere seguir instrucciones.
- Evaluación de fidelidad numérica en hardware: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que el empaquetado en DRAM no altera los pesos, útil en certificación de despliegues.
- Prototipado en simulador: la model card reporta pruebas con `ttsim`, el simulador de Blackhole, lo que facilita desarrollar sin hardware físico.
- Alternativa de bajo consumo frente a GPU: para inferencia por lotes pequeños en entornos con NPU Tensix, reduce la huella de memoria frente a los 16,38 GB del BF16.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial (truncada en la información disponible). Los datos completos publicados son:

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B-Base) | 16 | 16,38 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP8) | 9,64 | 9,87 | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para esta conversión.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: 9,87 GB solo para pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole).
- GPU convencionales: no es el destino de esta conversión; puede cargarse en GPU vía transformers en bf16 (aproximadamente 16,4 GB en memoria), pero pierde la ventaja de empaquetado BFP8.
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090/4090) cargando en bf16; en Tensix, según memoria del dispositivo.
- Opciones de despliegue: TT-NN / tt-metal v0.81.1 con `tt-transformers`; tt-forge (tt-xla), aunque la model card indica que no se ha ejecutado con este checkpoint; transformers estándar para carga en bf16.
- Latencia y throughput: no disponibles en la información proporcionada. La model card menciona un test de rendimiento batch-1 con `simple_text_demo.py`, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP8 | 8,19 B | no disponible | BFP8 (9,64 bits/peso) | Apache 2.0 | Hugging Face, 58 descargas |
| Xylolabs/Qwen3-8B-Base-Tenstorrent-BFP4 | 8,19 B | no disponible | BFP4 | Apache 2.0 (presumible, no confirmado) | Hugging Face |
| Qwen/Qwen3-8B-Base (BF16) | 8,19 B | no disponible | bf16 (16 bits/peso) | Apache 2.0 | Hugging Face |

La comparativa se limita a las variantes del mismo modelo base y su versión BFP4, ya que no se dispone de datos de rendimiento frente a otras familias.

## Limitaciones y advertencias

- Es un modelo base, no instruction-tuned: no sigue instrucciones ni mantiene diálogos de forma fiable pese a conservar la plantilla de chat.
- La cuantización BFP8 introduce pérdida de fidelidad frente a bf16; la tabla de evaluación de la model card está truncada y no permite cuantificar el KL medio ni el Top-1 de esta conversión.
- El demo `tt-transformers` empaqueta el LM head en bfloat8_b, por lo que el head bf16 de este checkpoint no es exacto en ese flujo; además, el demo no se ejecutó de extremo a extremo según la model card.
- tt-forge (tt-xla) no se ha probado con este checkpoint; sus opciones `bfp_bf8` y `bfp_bf4` recuantizan en layout [out, in] de PyTorch.
- Idiomas soportados no declarados; la calibración se limitó a WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento en otras lenguas.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-8B-Base, no evaluados en esta conversión.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Dependencia fuerte de la versión de tt-metal (v0.81.1) y de flags concretos (`--use_hf_rope`, `--instruct 0`); sin ellos el demo permuta filas q/k y recuantiza el QKV fusionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Versión BFP4: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tensix-BFP4
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
