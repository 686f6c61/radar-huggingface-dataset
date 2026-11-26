# Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4

## Resumen

Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4 es una cuantización del modelo multimodal google/gemma-4-26B-A4B-it, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer con mezcla de expertos (MoE) de 26.544 millones de parámetros totales, orientado a tareas de imagen-texto-a-texto, y esta versión reduce el peso empaquetado a 15,271 GB mediante cuantización de bloque en coma flotante de 4 bits (`bfloat4_b`/BFP4) aplicada con GPTQ.

La relevancia de esta ficha reside en que es una de las pocas cuantizaciones publicadas que apunta explícitamente a hardware de inferencia alternativo a las GPU (las NPU Tensix de Tenstorrent), manteniendo las proyecciones de atención, MLP y expertos enrutados en BFP4 mientras conserva en bf16 el LM head, los embeddings, las normas y la torre de visión. El autor reporta una degradación medida frente al modelo en bf16 (KL media de 0,14638 y top-1 del 87,24 % sobre 8.048 posiciones de texto inglés y coreano) y la compara con una cuantización Q4_K_M de llama.cpp.

El modelo hereda la licencia Apache 2.0 del modelo base y se distribuye en formato safetensors compatible con transformers, además de incluir utilidades (`pack_tensix.py`, `verify_grid.py`) para empaquetar los pesos en el formato nativo de Tensix mediante ttnn. La información pública no detalla el contexto máximo ni los idiomas soportados de forma explícita, por lo que esos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); modelo multimodal imagen-texto-a-texto |
| Parámetros totales | 26.544.133.710 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención, MLP y expertos enrutados; bf16 en LM head, embeddings, normas, router y torre de visión; empaquetado alternativo exacto en `bfloat8_b` |
| Idiomas soportados | no disponible (la evaluación cubre texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers); empaquetado Tensix de 15,271 GB; índice `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 26.544 millones de parámetros totales, con 30 capas según la tabla de formatos de la model card. La arquitectura incluye atención con proyecciones q, k, o en las 30 capas y v en 25 capas, un MLP compartido (gate, up, down) y expertos enrutados (down, gate, up) con un router por experto, además de una torre de visión (`vision_tower`) y un módulo `embed_vision` para el procesamiento de imágenes. El LM head está atado (tied) al embedding.

Esta versión concreta no reentrena el modelo: aplica cuantización GPTQ con búsqueda de exponente por bloque sobre las proyecciones de atención, MLP y expertos enrutados, dejando en bf16 el router, el LM head, los embeddings, las normas y todos los tensores de visión. El autor no documenta el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base; esa información no está disponible en la documentación proporcionada. La innovación técnica destacable es el formato de bloque en coma flotante de 4 bits (`bfloat4_b`) nativo de Tensix, que puede empaquetarse también de forma exacta en `bfloat8_b` para ttnn.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`), verificada en el ejemplo de inicio rápido.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión conservada en bf16.
- Razonamiento y respuesta multi-turno, al ser una variante instruct (`-it`) del modelo base.
- Capacidades multilingües: la evaluación incluye inglés y coreano; el resto de idiomas no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Inferencia en hardware Tensix (Wormhole, Blackhole) mediante ttnn 0.81.1, con kernels y runner publicados por el autor.

## Casos de uso

- Despliegue en NPU Tenstorrent: el modelo está empaquetado para Wormhole y Blackhole y se carga con ttnn, lo que permite servir inferencia multimodal sin GPU en entornos con aceleradores Tensix.
- Asistentes multimodales con imagen: la torre de visión en bf16 y el pipeline `image-text-to-text` permiten responder preguntas sobre imágenes en aplicaciones de soporte o documentación técnica.
- Prototipado en transformers: los pesos safetensors cargan con `AutoModelForCausalLM` y `device_map="auto"`, útil para validar el comportamiento antes de empaquetar en Tensix.
- Evaluación de cuantizaciones: la model card publica KL media y top-1 frente a bf16 y a Q4_K_M, lo que sirve como referencia para comparar esquemas de cuantización de 4 bits en modelos MoE.
- Investigación en formatos de bloque: `quant4.json` y las herramientas `pack_tensix.py` y `verify_grid.py` permiten estudiar y verificar el empaquetado BFP4 matriz a matriz.
- Conversación multilingüe inglés-coreano: la evaluación cubre ambos idiomas con 8.048 posiciones de WikiText-2 y Wikipedia coreana, lo que respalda su uso en esos idiomas.
- Integración en pipelines de CI: `verify_grid.py` comprueba la rejilla de cuantización solo con torch, lo que permite validar artefactos en integración continua sin hardware Tensix.

## Benchmarks y rendimiento

| Modelo | Tamaño (GB) | KL media frente a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 50,47 | 0 | 100 |
| Este modelo (BFP4) | 15,271 | 0,14638 | 87,24 |
| Q4_K_M (llama.cpp) | 16,796 | 0,1249 | 88,16 |

Las métricas de KL y top-1 cubren 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana) con la plantilla de chat. La cuantización Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Peso empaquetado para Tensix: 15,271 GB; el repositorio completo ocupa 53,1 GB (incluye pesos en bf16 y artefactos).
- Memoria para cargar en transformers: el modelo se carga con `dtype="bfloat16"`, por lo que requiere del orden de 50 GB de memoria de acelerador o sistema, según el reparto de `device_map`.
- GPU recomendadas: no disponibles de forma explícita; por tamaño en bf16, encajan A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16; la versión BFP4 empaquetada (15,271 GB) está pensada para Tensix, no para GPU.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole, verificadas con ttnn 0.81.1 sobre el simulador Blackhole (ttsim).
- Opciones de despliegue: transformers (safetensors), ttnn con `tensix-runner` v0.1.0 y `tensix-kernels` v0.1.0; llama.cpp, vLLM, Ollama y TGI no están documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 26.544 M | no disponible | BFP4, 15,271 GB | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (BF16) | 26.544 M | no disponible | bf16, 50,47 GB | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo checkpoint) | 26.544 M | no disponible | Q4_K_M, 16,796 GB | Apache 2.0 | Generado localmente |

La comparación se limita al mismo checkpoint en distintos formatos, ya que la información proporcionada no incluye otros modelos de la misma categoría. Frente a Q4_K_M, esta versión ocupa un 9,1 % menos (15,271 GB frente a 16,796 GB) pero presenta una KL media un 17 % superior (0,1464 frente a 0,1249) y un top-1 0,92 puntos menor.

## Limitaciones y advertencias

- La cuantización BFP4 introduce degradación medible: KL media de 0,14638 y top-1 del 87,24 % frente al 100 % en bf16.
- El modelo está diseñado y verificado para Tensix; no se documenta soporte funcional en GPU, vLLM, llama.cpp u Ollama para esta variante.
- La verificación en hardware se realizó sobre el simulador Blackhole (ttsim) con ttnn 0.81.1, no necesariamente en silicio real.
- No se documentan sesgos conocidos ni tasas de alucinación del modelo base en la información disponible.
- No se especifican la longitud de contexto máxima ni la lista completa de idiomas soportados.
- El repositorio no incluye el archivo LICENSE original del modelo base; se añade el texto estándar de Apache 2.0 y un NOTICE con los cambios.
- El autor declara no estar afiliado a Tenstorrent, lo que implica que el soporte de la pila ttnn depende de terceros.
- Uso comercial permitido por Apache 2.0, sujeto a las condiciones del modelo base google/gemma-4-26B-A4B-it.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper citado en los tags (arXiv:2607.02770): https://arxiv.org/abs/2607.02770
