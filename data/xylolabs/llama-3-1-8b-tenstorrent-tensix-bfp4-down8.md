# Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8

## Resumen

Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8 es una exportación cuantizada del modelo meta-llama/Llama-3.1-8B, publicada por Xylolabs, diseñada específicamente para ejecutarse en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante la pila de software tt-metal / TT-NN. No es un modelo nuevo: es el checkpoint original de Meta con sus capas lineales recomprimidas a formatos de coma flotante por bloques (BFP4 y BFP8) que el hardware Tensix puede empaquetar de forma nativa sin conversión en tiempo de ejecución.

La propuesta de valor es el ahorro de memoria y el ajuste al hardware: los pesos del modelo de lenguaje ocupan aproximadamente 6,97 GB en memoria de dispositivo, frente a los 16,06 GB del checkpoint BF16 original, con una media de 6,94 bits por peso. Las proyecciones de atención (q, k, v, o) y las de MLP gate y up de las 32 capas se cuantizan a `ttnn.bfloat4_b` (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque; las proyecciones MLP down se mantienen en `ttnn.bfloat8_b` (8,5 bits por peso) con redondeo al más cercano. El resto de tensores (embeddings, LM head, normas) permanecen en bf16.

Es relevante ahora porque permite desplegar un modelo de 8B con contexto de 128K sobre aceleradores Tensix con una huella de memoria notablemente reducida, manteniendo una fidelidad alta respecto al BF16 original (KL media de 0,0386 y top-1 del 90,90 % sobre 8.184 posiciones de texto inglés y coreano). El repo tiene 49 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), pesos cuantizados a BFP4/BFP8 para Tensix |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base; el autor no la declara explícitamente en la model card) |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en atención q/k/v/o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en MLP down; bf16 en embeddings, LM head y normas; media de 6,94 bits/peso |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | llama3.1 |
| Formato de pesos | safetensors (shards), con `quant4.json` que describe el formato de cada proyección y `model.safetensors.index.json` para el mapeo de shards |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Llama-3.1-8B de Meta: un transformer decoder-only con atención por causalidad, 32 capas y las proyecciones estándar de atención (q, k, v, o) y MLP (gate, up, down). Xylolabs no reentrena el modelo; aplica un proceso de cuantización post-entrenamiento orientado a los formatos de bloque de Tensix. Las matrices de atención y las de MLP gate/up se cuantizan con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano (45 % inglés), usando la configuración `configs/llama-3.1-8b-cal4x.toml` del repositorio tensix-bfp-gptq con este modelo base como `--model`. Las matrices MLP down se cuantizan con redondeo al más cercano a BFP8.

La innovación técnica clave es que las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN las empaqueta sin alterar sus valores: el autor verifica con `pack_tensix.py` que cada matriz empaquetada coincide exactamente con la almacenada (round-trip exacto), y que los mismos valores también empaquetan exactamente en `ttnn.bfloat8_b`. Los pesos bf16 de origen son los de meta-llama/Llama-3.1-8B, con los mismos sha256 que los de unsloth/Llama-3.1-8B; `config.json`, `generation_config.json` y los ficheros del tokenizer son los de unsloth, sin cambios. La verificación se realizó con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto autoregresiva en modo completion (el modelo es la versión pretrained, sin plantilla de chat).
- Razonamiento y conocimiento general heredados del Llama-3.1-8B base.
- Capacidades multilingües en inglés, alemán, francés, italiano, portugués, hindi, español y tailandés (según los idiomas declarados).
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de los pesos BFP4/BFP8.
- Compatibilidad con la librería `transformers` (pipeline text-generation) para carga en GPU/CPU en bf16, además del despliegue en Tensix.
- No se declara soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.
- No se declara modo thinking ni decodificación especulativa.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. El checkpoint está pensado para cargarse en NPU Wormhole o Blackhole con TT-NN, aprovechando que los pesos ya están en el formato de bloque que el hardware empaqueta sin conversión, lo que reduce el uso de DRAM de dispositivo a unos 6,97 GB para los pesos del modelo de lenguaje.
- Inferencia de texto de propósito general en entornos con memoria limitada: al ocupar 6,97 GB en lugar de 16,06 GB, permite servir un 8B en dispositivos con menos memoria de la que exigiría el BF16, a costa de una pérdida modesta de fidelidad (KL 0,0386, top-1 90,90 %).
- Evaluación de pipelines de cuantización BFP: sirve como referencia reproducible para validar que el empaquetado BFP4/BFP8 de TT-NN no altera valores, mediante `pack_tensix.py` y `verify_grid.py`.
- Generación de texto multilingüe en ocho idiomas: adecuado para tareas de continuación de texto, resumen o extracción en inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Investigación sobre impacto de la cuantización por bloques: la tabla de evaluación del autor (KL, top-1, respuestas correctas) permite comparar BFP4/BFP8 frente a BF16 y frente a Q4_K_M de llama.cpp sobre el mismo checkpoint.
- Prototipado en simulador: el autor verificó el checkpoint sobre ttsim (simulador de Blackhole), por lo que es utilizable para desarrollo y validación antes de disponer de hardware físico.
- Base para fine-tuning o adaptación posterior: al ser un checkpoint en safetensors cargable con `transformers`, puede servir de punto de partida, aunque la cuantización limita la precisión disponible para entrenamiento.

## Benchmarks y rendimiento

Datos de evaluación publicados por el autor en la model card:

| Modelo | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (unsloth/Llama-3.1-8B) | 16 | 16,06 | 0 | 100 | 23 de 28 | - |
| Este modelo (BFP4/BFP8) | 6,94 | 6,967 | 0,03860 | 90,90 | 23 de 28 | 1 |
| Q4_K_M (llama.cpp) | 4,89 | 4,921 | 0,03478 | 90,58 | 24 de 28 | 0 |

Notas del autor: KL y top-1 se calculan sobre 8.184 posiciones de texto inglés y coreano (test de WikiText-2 y Wikipedia en coreano) en texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato completion y 3-shot; "perdidas" indica respuestas correctas en BF16 que aquí son incorrectas o rotas (los empates cercanos no se cuentan). Q4_K_M se generó desde el mismo checkpoint con llama.cpp. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 6,97 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, con la pila tt-metal / TT-NN (verificado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole).
- Carga alternativa en bf16 con `transformers` (`dtype="bfloat16"`, `device_map="auto"`), lo que requiere memoria equivalente a un 8B en bf16 (del orden de 16 GB de pesos) más caché KV.
- GPU consumer: no se proporcionan datos específicos de VRAM para GPU en la información disponible; el foco del checkpoint es Tensix, no GPU.
- Opciones de despliegue: TT-NN en Tensix (soporte nativo), `transformers` en GPU/CPU. tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---:|---|---|
| Este modelo (BFP4/BFP8) | 8,03B | no disponible | 6,94 | 6,967 | 0,03860 | 90,90 | llama3.1 | Hugging Face, orientado a Tensix |
| BF16 (unsloth/Llama-3.1-8B) | 8,03B | no disponible | 16 | 16,06 | 0 | 100 | llama3.1 | Hugging Face, uso general |
| Q4_K_M (llama.cpp) | 8,03B | no disponible | 4,89 | 4,921 | 0,03478 | 90,58 | llama3.1 | llama.cpp, uso general |

La comparación se limita a las variantes del mismo checkpoint base reportadas por el autor; no se dispone de datos de benchmarks estándar ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es la versión pretrained: continúa texto y no incluye plantilla de chat, por lo que no está alineada para diálogo sin un post-procesado o fine-tuning adicional.
- Pérdida de fidelidad respecto a BF16: KL media de 0,0386, top-1 del 90,90 % y una respuesta perdida de 28 en la evaluación del autor; no es equivalente bit a bit al modelo original.
- La cuantización BFP4/BFP8 está pensada para Tensix; fuera de ese hardware los pesos se cargan en bf16 y se pierde la ventaja de memoria, además de no aprovechar el empaquetado nativo.
- tt-transformers y tt-forge no se validaron con este checkpoint; el soporte comprobado es TT-NN a nivel de empaquetado y `transformers` en bf16.
- Licencia llama3.1: el uso comercial está sujeto a los términos de la licencia de Meta, incluida la política de uso aceptable; conviene revisarla antes de producción.
- No se declaran capacidades de tool calling, agentes, visión ni audio; no deben asumirse.
- Riesgo de sesgos y alucinaciones heredado del modelo base de Meta; no se documentan evaluaciones de sesgo específicas para esta cuantización.
- La longitud de contexto no se declara explícitamente en la model card; debe contrastarse con la del modelo base antes de asumir 128K.
- El repo tiene muy poca tracción (49 descargas, 0 likes) y fue creado en noviembre de 2026; la validación comunitaria es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Checkpoint BF16 de referencia (unsloth): https://huggingface.co/unsloth/Llama-3.1-8B/tree/3f0d51f8e5640f98f1a96ea9044a0e55c0a83814
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Configuración de calibración: https://github.com/XylolabsInc/tensix-bfp-gptq/blob/3d51048/configs/llama-3.1-8b-cal4x.toml
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Llama-3.1-8B-Tenstorrent-Tensix-BFP4-Down8/blob/main/LICENSE
