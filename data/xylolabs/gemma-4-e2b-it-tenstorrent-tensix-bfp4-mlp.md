# Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP

## Resumen

Gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP es una cuantización del modelo multimodal `google/gemma-4-E2B-it` realizada por Xylolabs, optimizada específicamente para su ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de una reempaquetadura de pesos en formatos de coma flotante por bloques (BFP4 y BFP8) que aprovecha las unidades de cómputo matricial de los NPU de Tenstorrent, con el objetivo de reducir el peso del modelo y acelerar la inferencia en hardware no-GPU.

La cuantización aplica `bfloat4_b` (BFP4) a las proyecciones MLP y `bfloat8_b` (BFP8) a las proyecciones de atención, manteniendo en bf16 el LM head, los embeddings, las normas y las torres de visión y audio. El resultado empaquetado ocupa 6,796 GB frente a los 9,29 GB del modelo base en bf16, y alcanza una divergencia media (KL) respecto al bf16 de 0,1267, notablemente inferior a la de una cuantización Q4_K_M estándar de llama.cpp (0,2933).

El modelo conserva las capacidades del base: pipeline `any-to-any` (texto, imagen y audio de entrada a texto), arquitectura Gemma 4 y licencia Apache 2.0. Es relevante para quienes despliegan inferencia en NPU de Tenstorrent y necesitan un checkpoint ya empaquetado y verificado con las herramientas `ttnn`/`tt-metal`, evitando el trabajo de conversión manual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), con torres de visión y audio; cuantización block floating point para Tensix |
| Parametros totales | 5.525.831.235 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP; BFP8 (`bfloat8_b`) en atención; bf16 en LM head, embeddings, normas, visión y audio |
| Idiomas soportados | no disponible (evaluación de KL en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; compatible con transformers) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E2B-it` es un transformer multimodal de la familia Gemma 4 con pipeline `any-to-any`, que integra torres de visión (`vision_tower`, `embed_vision`) y audio (`audio_tower`, `embed_audio`) además del modelo de lenguaje. Esta ficha no dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a la model card del modelo base y no se incluye en la información proporcionada.

La contribución técnica de esta variante es la cuantización post-entrenamiento con GPTQ y búsqueda de exponente por bloque para los tensores BFP4, y redondeo al más cercano para los BFP8. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` para verificar el empaquetado matriz a matriz contra `ttnn`. La verificación se realizó con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Gemma 4.
- Entrada multimodal: imagen a texto y audio a texto (pipeline `any-to-any`), con las torres de visión y audio en bf16.
- Soporte de plantilla de chat (`apply_chat_template`) para conversaciones multi-turno.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Ejecución nativa en NPU Tensix mediante `ttnn` con formatos `bfloat4_b` y `bfloat8_b`.
- Capacidades multilingües: no documentadas explícitamente; la evaluación cubre inglés y coreano.
- Tool calling, function calling y modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de inferencia en NPU Tenstorrent: el checkpoint ya está empaquetado y verificado para Wormhole y Blackhole, por lo que se puede cargar directamente con `ttnn` sin conversión manual, reduciendo el tiempo de puesta en marcha en clústeres con estas tarjetas.
- Servicio multimodal en el borde: al ocupar 6,796 GB empaquetado, permite alojar un modelo con visión y audio en un único dispositivo Tensix con memoria limitada, frente a los 9,29 GB del bf16.
- Procesamiento de documentos con imagen: la torre de visión en bf16 permite tareas de image-to-text (descripción, extracción de texto) manteniendo la calidad del codificador visual intacta.
- Transcripción y análisis de audio: la torre de audio sin cuantizar posibilita pipelines de audio a texto dentro del mismo modelo, sin un componente separado.
- Evaluación de cuantizaciones: sirve como referencia para comparar el impacto de BFP4/BFP8 frente a Q4_K_M en términos de KL y top-1 sobre un mismo checkpoint.
- Prototipado en simulador: con `ttsim` se puede validar el comportamiento del modelo y del empaquetado antes de disponer de hardware físico Blackhole.
- Investigación en formatos block floating point: el repositorio y las herramientas asociadas permiten estudiar el efecto del exponente por bloque en la fidelidad de las proyecciones.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (`google/gemma-4-E2B-it`) | 9,29 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 atención) | 6,796 | 0,12669 | 86,22 |
| Q4_K_M (llama.cpp) | 3,428 | 0,29329 | 80,25 |

Las métricas de KL y top-1 se calcularon sobre 7.968 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), aplicando la plantilla de chat. La Q4_K_M se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados en benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 6,796 GB empaquetado para Tensix; el repo completo ocupa 11,1 GB (incluye tensores bf16 y metadatos).
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Verificación realizada con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole); no se documenta ejecución en silicio físico.
- GPU consumer: no es el destino del modelo; puede cargarse en GPU con `transformers` en bf16 (aproximadamente 9,29 GB de pesos), lo que requiere al menos 12 GB de VRAM para inferencia básica.
- Opciones de despliegue: `ttnn`/`tt-metal` con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0; también `transformers` con `device_map="auto"`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Gemma-4-E2B-it BFP4/BFP8) | 5.525.831.235 | no disponible | 6,796 GB | Apache 2.0 | Tensix (Wormhole, Blackhole) |
| `google/gemma-4-E2B-it` (bf16) | 5.525.831.235 | no disponible | 9,29 GB | Apache 2.0 | GPU/CPU genérico |
| Gemma-4-E2B-it Q4_K_M (llama.cpp) | 5.525.831.235 | no disponible | 3,428 GB | Apache 2.0 | CPU/GPU genérico |

La comparativa se limita a variantes de cuantización del mismo checkpoint, ya que la información proporcionada no incluye otros modelos de la misma categoría. Frente a Q4_K_M, este modelo ocupa casi el doble de espacio pero reduce la KL media a menos de la mitad (0,1267 frente a 0,2933) y eleva el top-1 de 80,25 % a 86,22 %.

## Limitaciones y advertencias

- Es una cuantización: introduce una divergencia no nula respecto al bf16 (KL 0,12669, top-1 86,22 %), por lo que puede degradar tareas sensibles a la precisión numérica.
- La evaluación se limita a 7.968 posiciones de inglés y coreano; no hay datos sobre otros idiomas ni sobre tareas multimodales (visión, audio) tras la cuantización.
- No se documenta ejecución en hardware Tensix físico, solo en el simulador `ttsim`; el rendimiento real en Wormhole/Blackhole no está verificado en la información disponible.
- El repositorio del modelo base no incluye archivo LICENSE; el autor añade el texto estándar de Apache 2.0, lo que conviene revisar antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados en esta ficha; son los heredados del modelo base Gemma 4.
- El modelo está pensado para Tensix; usarlo en GPU requiere cargar los pesos bf16 o convertir los formatos BFP, lo que anula la ventaja de tamaño.
- Longitud de contexto no especificada; no se debe asumir un valor concreto sin consultar la model card del base.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E2B-it-Tenstorrent-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Código en el commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
