# Xylolabs/Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo de texto nvidia/Cosmos3-Nano, preparada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). El modelo base pertenece a la familia Cosmos de NVIDIA, orientada a modelos fundacionales de mundo (world models); esta variante conserva únicamente la torre de texto y descarta el encoder de visión, el VAE de vídeo y el tokenizador de audio, de modo que el resultado es un modelo de generación de texto de 8.190.735.360 parámetros.

La contribución principal no es el modelo en sí, sino el formato de pesos: cuantización en bloque de coma flotante (block floating point, BFP) con precisión bfloat4_b y bfloat8_b sobre las capas de atención y MLP, manteniendo el resto en bf16. Esto permite reducir el peso empaquetado de 16,38 GB (BF16) a 6,397 GB en BFP4, con una divergencia media de KL frente a BF16 de 0,03028 sobre 16.272 posiciones de texto en inglés y coreano.

Es relevante ahora porque ofrece una vía práctica para desplegar un modelo de 8B en hardware Tenstorrent mediante tt-metal, ttnn y tt-forge, con artefactos de cuantización verificables (round-trip de tensores) y comparación explícita contra una referencia Q4_K_M de llama.cpp. La licencia OpenMDW-1.1 se hereda del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (torre de texto del modelo base Cosmos3-Nano; detalles de atención no disponibles) |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b en atención y MLP, resto bf16), BFP8 (bfloat8_b en atención y MLP, resto bf16); referencia BF16 y Q4_K_M |
| Idiomas soportados | no disponible oficialmente; la evaluación KL cubre inglés y coreano |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (con metadatos quant4.json / quant8.json e índice de shards) |

## Arquitectura y entrenamiento

El modelo es una exportación cuantizada, no un entrenamiento nuevo. La arquitectura subyacente corresponde a la torre de texto de nvidia/Cosmos3-Nano, un transformer de aproximadamente 8,19 mil millones de parámetros. Xylolabs aplica cuantización de punto flotante en bloque (BFP) sobre las matrices de atención y MLP, dejando el resto de tensores en bf16. El repositorio incluye dos carpetas independientes, `text-bfp4/` y `text-bfp8/`, cada una con su propio mapa de pesos y ficheros de configuración de cuantización (`quant4.json`, `quant8.json`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base empleó RLHF o DPO. La metodología de cuantización se apoya en el repositorio tensix-bfp-gptq y se valida mediante scripts de empaquetado (`pack_tensix.py`) y verificación (`verify_grid.py`) que permiten comprobar la fidelidad del round-trip de tensores en el dispositivo. La evaluación de calidad se realiza con divergencia KL media frente a BF16 sobre 16.272 posiciones de WikiText-2 (test) y Wikipedia en coreano, en texto plano y con plantilla de chat, con un límite de 1,5 veces la KL de referencia de Q4_K_M.

## Capacidades

- Generación de texto autoregresiva con plantilla de chat (mensajes con roles user/assistant).
- Razonamiento y respuesta a preguntas en formato conversacional.
- Soporte multilingüe parcial: la evaluación de cuantización incluye inglés y coreano; el conjunto completo de idiomas no está documentado.
- Ejecución en hardware Tenstorrent Tensix mediante ttnn (bfloat4_b / bfloat8_b) y mediante tt-forge con torch.compile y backend "tt".
- Compatibilidad con transformers estándar (AutoModelForCausalLM, AutoTokenizer) para inferencia en CPU/GPU usando los pesos cuantizados.
- No incluye capacidades de visión, vídeo ni audio: el encoder visual, el VAE de vídeo y el tokenizador de sonido fueron eliminados en esta exportación.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado específicamente para Wormhole y Blackhole, con formatos BFP4/BFP8 nativos de Tensix, lo que permite servir generación de texto en NPUs sin depender de GPU NVIDIA.
- Evaluación de cuantización en producción: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la fidelidad de los pesos empaquetados antes de desplegar, útil en pipelines de QA de modelos cuantizados.
- Chatbot de propósito general con requisitos de memoria ajustados: la variante BFP4 ocupa 6,397 GB empaquetados, lo que facilita su alojamiento en entornos con presupuesto de memoria limitado.
- Investigación en formatos de coma flotante en bloque: sirve como caso de estudio reproducible de BFP4/BFP8 frente a BF16 y Q4_K_M, con métricas KL publicadas.
- Integración en flujos con tt-forge y PyTorch/XLA: el modelo puede compilarse con `torch.compile(backend="tt")`, lo que facilita prototipado rápido en hardware Tenstorrent.
- Experimentación académica con modelos fundacionales de mundo: al conservar la torre de texto de Cosmos3-Nano, permite estudiar el comportamiento lingüístico del modelo sin cargar los componentes de visión y audio.
- Benchmarking de hardware: la configuración de precisión mixta documentada (bfp4 en ff1_3, ff2, wqkv, wo; bfp8 en kv_cache) sirve como referencia para medir throughput y latencia en Tensix.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La única métrica reportada es la divergencia KL media frente a BF16:

| Variante | Tamano empaquetado (GB) | KL media vs BF16 |
|---|---|---|
| text-bfp4 | 6,397 | 0,03028 |
| text-bfp8 | 9,870 | 0,00078 |
| BF16 (base) | 16,38 | 0 |
| Q4_K_M (llama.cpp) | 5,028 | 0,03370 |

La KL se calcula sobre 16.272 posiciones de WikiText-2 (test) y Wikipedia en coreano, en texto plano y con plantilla de chat.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 6,4 GB para BFP4 y 9,9 GB para BFP8 en pesos empaquetados; el modelo se carga con `dtype="bfloat16"` en transformers, por lo que la huella efectiva en memoria puede ser mayor.
- GPU compatibles: no se especifican; el modelo puede cargarse con `device_map="auto"` en transformers, pero la ruta optimizada es hardware Tenstorrent.
- Hardware objetivo: NPUs Tenstorrent Wormhole y Blackhole (Tensix).
- ¿Cabe en GPU de consumo? No hay datos oficiales; por tamaño (8,19B parámetros), una GPU con 16-24 GB de VRAM podría alojar la variante BFP4, pero no se documenta compatibilidad ni rendimiento.
- Opciones de despliegue: transformers (CPU/GPU), ttnn sobre tt-metal v0.81.1 con `--use_hf_rope`, tt-forge con `pjrt-plugin-tt==1.4.0` y `torch.compile(backend="tt")`, y referencia Q4_K_M para llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato/hardware | KL vs BF16 |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4 (este) | 8,19B | no disponible | openmdw-1.1 | safetensors BFP4/BFP8 para Tensix | 0,03028 (BFP4) / 0,00078 (BFP8) |
| nvidia/Cosmos3-Nano (BF16) | 8,19B (torre de texto) | no disponible | openmdw-1.1 | safetensors BF16 | 0 (referencia) |
| Q4_K_M (llama.cpp, referencia de cuantización) | 8,19B | no disponible | openmdw-1.1 | GGUF Q4_K_M | 0,03370 |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo es una exportación cuantizada: la calidad puede degradarse respecto a BF16, especialmente en BFP4 (KL media 0,03028 frente a 0,00078 en BFP8).
- Solo incluye la torre de texto; no hay visión, vídeo ni audio, pese a que el modelo base Cosmos3-Nano es multimodal.
- No se documentan sesgos conocidos, pero al derivar de un modelo fundacional de NVIDIA, es probable que herede sesgos del corpus de entrenamiento original (no verificable con la información disponible).
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad factual.
- Idiomas soportados no documentados; la validación de cuantización solo cubre inglés y coreano.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas.
- Licencia OpenMDW-1.1: el repositorio no incluye fichero de licencia propio más allá de la referencia al acuerdo del modelo base; conviene revisar los términos de OpenMDW-1.1 antes de uso comercial.
- Requiere hardware Tenstorrent para la ruta optimizada; en GPU/CPU el rendimiento no está documentado.
- Dependencia de versiones concretas: tt-metal v0.81.1 y pjrt-plugin-tt 1.4.0; incompatibilidades de versión pueden romper el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Cosmos3-Nano-Text-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Licencia (OpenMDW-1.1): https://huggingface.co/Xylolabs/Cosmos3-Nano-Tenstorrent-Tensix/blob/main/LICENSE
