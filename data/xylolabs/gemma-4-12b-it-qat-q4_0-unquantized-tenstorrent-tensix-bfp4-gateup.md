# Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp

## Resumen

Este repositorio contiene una exportación cuantizada del modelo `google/gemma-4-12B-it-qat-q4_0-unquantized`, adaptada específicamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-Metal y TT-NN. La desarrolla Xylolabs, un estudio independiente que publica artefactos de cuantización orientados a hardware no convencional. El modelo resuelve un problema muy concreto: llevar un LLM multimodal de 12.966 millones de parámetros a un formato de pesos que las NPU de Tenstorrent puedan empaquetar sin degradación adicional, usando block floating point (BFP4 y BFP8) en lugar de los formatos habituales de GPU.

La arquitectura subyacente es la del Gemma 4 de 12B en su variante instruct, un transformer denso con torre de visión y audio (pipeline `any-to-any`). Sobre esa base, Xylolabs aplica GPTQ a las proyecciones MLP `gate` y `up` para dejarlas en `ttnn.bfloat4_b` (4,5 bits por peso) y redondeo al más cercano para el resto de proyecciones lineales en `ttnn.bfloat8_b` (8,5 bits por peso), manteniendo embeddings, normas y cabecera LM en bf16. El resultado son 7,23 bits por peso de media y 10,77 GB empaquetados.

Su relevancia es doble. Por un lado, demuestra que la cuantización a 4 bits por bloque con GPTQ es viable en el ecosistema Tenstorrent, que hasta ahora dependía de conversiones más conservadoras. Por otro, publica una evaluación de fidelidad frente al BF16 original con métricas reproducibles (KL medio de 0,03348 sobre 8.048 posiciones en inglés y coreano, top-1 del 92,88 %), lo que permite juzgar el coste real de la compresión sin depender de benchmarks de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (familia Gemma 4), con torre de visión, embedder de audio y cabecera LM atada al embedding |
| Parametros totales | 12.966.363.184 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en MLP gate y up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en attention q/k/v/o y MLP down; bf16 en embeddings, normas, LM head y torres de visión/audio. Media de 7,23 bits/peso |
| Idiomas soportados | no disponible (la calibración y evaluación usan inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 26,0 GB; pesos empaquetados 10,77 GB), más `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El checkpoint es una conversión del modelo base de Google, no un entrenamiento nuevo. La arquitectura es un transformer denso de 48 capas con atención multi-cabeza y un bloque MLP por capa, más componentes multimodales (`embed_audio`, `embed_vision`, `vision_embedder`) que se mantienen intactos en bf16. El modelo base ya era una variante QAT (`qat-q4_0-unquantized`), es decir, entrenada con conciencia de cuantización a 4 bits y distribuida con pesos sin cuantizar para permitir reconversiones.

La innovación técnica está en el pipeline de cuantización hacia block floating point. Las matrices MLP `gate` y `up` de las 48 capas se cuantizan con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las proyecciones de atención (q, k, o en las 48 capas; v en 40 capas) y la proyección `down` del MLP se convierten a BFP8 mediante redondeo al más cercano. Los tensores BFP4 y BFP8 se almacenan como valores bf16 sobre la rejilla de bloque correspondiente, de modo que TT-NN los empaqueta sin alterar sus valores; el repositorio incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar la identidad bit a bit tras el empaquetado. Solo se cuantizó y evaluó el modelo de lenguaje.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y modo instruct.
- Razonamiento multi-paso, incluyendo un modo "thinking" que la evaluación ejercita explícitamente con 7 prompts adicionales.
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a la torre de visión conservada en bf16.
- Procesamiento de audio mediante `embed_audio`, también en bf16.
- Pipeline `any-to-any`, lo que permite combinar entradas y salidas de distintos modalidades según el soporte del modelo base.
- Capacidades multilingües: el modelo base es multilingüe, aunque este repositorio no declara una lista cerrada de idiomas; la calibración y la evaluación cubren inglés y coreano.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico en la información disponible.

## Casos de uso

- Inferencia en aceleradores Tenstorrent: despliegue del modelo en tarjetas Wormhole o Blackhole usando TT-NN, aprovechando que los pesos ya están en la rejilla BFP4/BFP8 y se empaquetan sin conversión en tiempo de carga. Es el caso de uso principal y el único validado por el autor.
- Prototipado en simulador: uso de `ttsim`, el simulador de Blackhole, para validar pipelines de empaquetado y comprobar que ningún valor cambia, antes de disponer de hardware físico.
- Investigación en cuantización block floating point: el repositorio sirve como referencia reproducible para estudiar el impacto de GPTQ con búsqueda de exponente por bloque frente a redondeo simple en un LLM de 13B.
- Evaluación de fidelidad de cuantización: los scripts y las métricas publicadas (KL medio, top-1 sobre WikiText-2 y Wikipedia coreana) permiten comparar metodologías de compresión sobre el mismo modelo base.
- Asistentes conversacionales multilingües de coste contenido: con 10,77 GB de pesos y licencia Apache 2.0, encaja en despliegues donde el presupuesto de memoria es ajustado y se requiere inglés y coreano.
- Procesamiento multimodal ligero: clasificación o descripción de imágenes y transcripción o análisis de audio combinados con texto, aprovechando que las torres de visión y audio se conservan en bf16 sin pérdida por cuantización.
- Base para destilación o ajuste fino posterior: al estar en safetensors y cargarse con `transformers`, puede servir como punto de partida para experimentos que no requieran los pesos originales en BF16.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 23,81 | 0 | 100 | 40 de 40 | - |
| Este modelo (BFP4 GateUp) | 7,23 | 10,765 | 0,03348 | 92,88 | 39 de 40 | 0 |
| Q4_0 (llama.cpp) | 4,68 | 6,976 | 0,03254 | 93,14 | 33 de 33 | 0 |

Las métricas de KL y top-1 cubren 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) aplicando la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con verificación automática, más 7 de razonamiento repetidos con el modo thinking activado (40 en total); la fila de Q4_0 solo contabiliza los 33 primeros. "Perdidas" indica respuestas correctas en BF16 que aquí salen mal o rotas; en este modelo el valor es 0. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 10,77 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers intermedios.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con `ttnn` 0.81.1 sobre `ttsim` (simulador de Blackhole).
- GPU consumer: el checkpoint está pensado para Tensix, no para GPU. La carga con `transformers` en bf16 requiere del orden de 24 GB de VRAM (repo de 26,0 GB), por lo que no cabe en tarjetas de 16 GB sin cuantización adicional.
- GPU profesionales: A100 40 GB, H100, RTX 4090 (24 GB, al límite) para la carga en bf16 vía `transformers`.
- Opciones de despliegue: TT-NN / TT-Metal para Tensix; `transformers` con `AutoModelForCausalLM` y `device_map="auto"` para inspección o ejecución en GPU. TT-Transformers y TT-Forge no se han probado con este checkpoint según el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 GateUp, Tensix) | 12,97B | no disponible | BFP4/BFP8, 7,23 bits/peso | Apache 2.0 | Hugging Face, orientado a Tensix |
| google/gemma-4-12B-it-qat-q4_0-unquantized | 12,97B | no disponible | bf16 (sin cuantizar) | Apache 2.0 | Hugging Face |
| Version Q4_0 para llama.cpp (referencia de evaluación) | 12,97B | no disponible | 4,68 bits/peso | Apache 2.0 | Formato GGUF vía llama.cpp |
| Gemma 3 12B IT (generación anterior) | ~12B | no disponible | múltiples | Gemma license | Hugging Face |

La comparación directa solo es posible contra el modelo base y la conversión Q4_0 citada en la evaluación, porque no se han publicado resultados frente a otras alternativas en la información disponible.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; las torres de visión y audio se mantienen en bf16 sin evaluación publicada de su comportamiento tras la conversión.
- El checkpoint está diseñado para Tensix; no es un artefacto portable a GPU ni a otros aceleradores sin reconversión.
- TT-Transformers y TT-Forge no se han ejecutado con este checkpoint, lo que limita las rutas de despliegue validadas.
- La calibración de GPTQ usa únicamente inglés y coreano (WikiText-2 y Wikipedia coreana), por lo que el comportamiento en otros idiomas puede degradarse de forma no medida.
- El top-1 del 92,88 % frente al 100 % del BF16 implica una pérdida medible de precisión, aunque las 40 respuestas evaluadas no registren fallos.
- No se declara lista de idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues con requisitos estrictos.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas en la información disponible; deben asumirse los del modelo base Gemma 4.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de redistribuir.
- El repositorio tiene 47 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-12B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Repositorio de código `tensix-bfp-gptq`: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia: arXiv:2607.02770 (citado en los tags del repositorio)
