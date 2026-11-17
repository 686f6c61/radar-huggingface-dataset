# Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8

## Resumen

Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo meta-llama/Llama-3.2-3B-Instruct, publicada por Xylolabs y optimizada específicamente para su ejecución en aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer decoder-only del original de Meta (3.212.749.824 parámetros) y aplica cuantización de bloque en coma flotante (block floating point, BFP8 / `bfloat8_b`) sobre las proyecciones de atención y MLP mediante GPTQ, manteniendo en bf16 la cabeza LM, los embeddings y las normas.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica para GPU, sino de un formato empaquetado para el stack `tt-metal`/`ttnn` de Tenstorrent. El autor reporta un tamaño empaquetado de 3,783 GB frente a los 6,42 GB en bf16, con una divergencia KL media de 0,0008 respecto al modelo original y una tasa de acierto en 33 preguntas fijas de 25/33 (frente a 24/33 del bf16). Estos datos, sin embargo, son evaluaciones en host, no mediciones en dispositivo.

El modelo hereda la licencia Llama 3.2 y está pensado para despliegues de inferencia conversacional en hardware Tenstorrent, un nicho todavía emergente pero relevante para quienes buscan alternativas de aceleración no-NVIDIA. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), cuantización block floating point BFP8 (`bfloat8_b`) en capas lineales |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B Instruct soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones de atención (q, k, v, o) y MLP (gate, up, down) de las 28 capas; bf16 en LM head, embeddings y normas; media de 9,42 bits por peso |
| Idiomas soportados | en, ko |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (valores cuantizados almacenados como bf16 en la rejilla del formato; empaquetado final con TT-NN) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del Llama-3.2-3B-Instruct de Meta, un transformer decoder-only de 3.212.749.824 parámetros. Xylolabs aplica GPTQ para cuantizar las matrices de proyección de atención (q, k, v, o) y de MLP (gate, up, down) de las 28 capas al formato `bfloat8_b` (BFP8, 8,5 bits por peso), mientras que la cabeza LM (atada al embedding), el embedding y las normas permanecen en bf16. El resultado es un peso medio de 9,42 bits por peso y un tamaño empaquetado de 3,783 GB para Tensix, frente a 6,42 GB en bf16.

La calibración de GPTQ se realizó sobre 262.144 tokens de WikiText-2 y Wikipedia en coreano, con un 45 % de contenido en inglés. Los archivos del repositorio almacenan los valores cuantizados como bf16 sobre la rejilla del formato, de modo que TT-NN los empaqueta sin alterar ningún valor. El autor proporciona `quant4.json`, que lista el formato de cada proyección, y las herramientas `tools/pack_tensix.py` y `tools/verify_grid.py` del repositorio tensix-bfp-gptq v0.1.0, que verifican la integridad del empaquetado y la rejilla. No se especifica si hubo entrenamiento adicional, RLHF o DPO más allá del proceso de cuantización; se trata, por tanto, de una transformación de pesos, no de un reentrenamiento.

## Capacidades

- Generación de texto conversacional en inglés y coreano, heredadas del modelo base Llama-3.2-3B-Instruct.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat (aplicación de plantilla de chat vía `apply_chat_template`).
- Generación de código y matemáticas básicas, como corresponde al modelo base, aunque no se documentan evaluaciones específicas en esta ficha.
- Soporte de tool calling y function calling: no documentado explícitamente en la información proporcionada; debe verificarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del modelo.
- Inferencia optimizada para aceleradores Tensix de Tenstorrent (Wormhole, Blackhole) mediante TT-NN, con empaquetado BFP8 verificado.
- Compatibilidad con `transformers` y `text-generation-inference` (tags del repositorio), además del runner específico `tensix-runner` v0.1.0.

## Casos de uso

- Despliegue de chat conversacional en hardware Tenstorrent: el modelo puede ejecutarse en aceleradores Wormhole o Blackhole mediante TT-NN, aprovechando el empaquetado BFP8 para reducir el espacio en DRAM del dispositivo (3,783 GB frente a 6,42 GB en bf16) en entornos donde no se dispone de GPU NVIDIA.
- Prototipado de inferencia de bajo consumo en edge con aceleradores Tensix: al ocupar menos de 4 GB empaquetado, encaja en configuraciones de memoria limitada del dispositivo y permite iterar sobre prompts conversacionales sin salir del ecosistema Tenstorrent.
- Asistentes en inglés y coreano: el modelo está calibrado con un 45 % de inglés y Wikipedia en coreano, por lo que es adecuado para aplicaciones bilingües en esos dos idiomas, aunque no se recomienda para otros.
- Validación de pipelines de cuantización: investigadores que trabajen con GPTQ y formatos block floating point pueden usar este modelo como referencia para verificar sus propias herramientas contra `pack_tensix.py` y `verify_grid.py`.
- Evaluación comparativa de precisión de cuantización: el autor publica métricas de divergencia KL y acierto en 33 preguntas, lo que permite contrastar BFP8 frente a Q4_K_M de llama.cpp en tareas de generación corta.
- Integración en flujos de `transformers` para pruebas rápidas: la quickstart del autor muestra carga con `AutoModelForCausalLM.from_pretrained` y `dtype="bfloat16"`, útil para validar respuestas antes de empaquetar para Tensix.
- Generación de texto asistida en entornos de investigación con requisitos de licencia Llama 3.2: equipos que ya operan bajo esa licencia pueden reutilizar el modelo sin cambiar de marco legal.

## Benchmarks y rendimiento

Los datos disponibles son evaluaciones en host de los pesos, no mediciones en dispositivo. El autor no reporta velocidad ni throughput.

| Pesos | Bits por peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precision |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 6,42 | 0 | 100 | 24/33 | - | - |
| BFP8 (este modelo) | 9,42 | 3,783 | 0,0008 | 98,47 | 25/33 | 0 | pasado (0,03x KL; 0 perdidas frente a 0) |
| BFP4 (referencia del autor) | 5,91 | 2,374 | 0,0442 | 88,81 | 26/33 | 1 | pasado (1,40x KL; 1 perdida frente a 0) |
| Q4_K_M (llama.cpp) | 5,01 | 2,019 | 0,0315 | 90,02 | 25/33 | 0 | referencia |

La KL media se calcula sobre las posiciones de textos fijos en inglés y coreano; top-1 mide la coincidencia del siguiente token con el modelo bf16. El chequeo de respuestas usa 33 prompts fijos con respuesta conocida más 7 con modo thinking (40 en total). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,4 GB en disco porque almacena los valores cuantizados como bf16; el empaquetado para Tensix reduce el peso a 3,783 GB. Para inferencia en GPU con `transformers` en bf16 se requiere aproximadamente el tamaño del modelo base (unos 6,4 GB de pesos más overhead de activaciones y KV cache).
- GPU recomendadas: no especificadas por el autor para GPU; el destino principal son aceleradores Tensix de Tenstorrent (Wormhole, Blackhole).
- Compatibilidad con GPU consumer: por tamaño (3B parámetros), cabría en GPUs consumer con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), pero el autor no lo documenta ni lo garantiza.
- Opciones de despliegue: `transformers` (quickstart del autor), `text-generation-inference` (tag del repo), TT-NN mediante `tensix-runner` v0.1.0 y `pack_tensix.py` para empaquetado en dispositivo. No se mencionan vLLM, llama.cpp ni Ollama para este formato concreto.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | KL media a bf16 | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| Este modelo (BFP8 Tensix) | 3,21B | no disponible | BFP8 (9,42 bits/peso) | 0,0008 | llama3.2 | Tensix (Wormhole, Blackhole) |
| BFP4 Tensix (mismo autor) | 3,21B | no disponible | BFP4 (5,91 bits/peso) | 0,0442 | llama3.2 | Tensix (Wormhole, Blackhole) |
| Q4_K_M llama.cpp (referencia) | 3,21B | no disponible | Q4_K_M (5,01 bits/peso) | 0,0315 | llama3.2 | CPU/GPU genéricas |
| Llama-3.2-3B-Instruct bf16 (base) | 3,21B | no disponible | bf16 (16 bits/peso) | 0 | llama3.2 | GPU genéricas |

La comparativa se limita a variantes del mismo modelo base porque no se han proporcionado datos de otros modelos de 3B con los que contrastar. El modelo BFP8 de este repositorio presenta la menor divergencia KL frente a bf16 entre las alternativas cuantizadas listadas, a costa de un mayor tamaño (3,783 GB frente a 2,374 GB de BFP4 y 2,019 GB de Q4_K_M).

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos del Llama-3.2-3B-Instruct original, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; el chequeo del autor se limita a 33 preguntas fijas con respuesta conocida más 7 con thinking, insuficiente para caracterizar el comportamiento en producción.
- Limitaciones de idioma: solo se declaran inglés y coreano; el resto de idiomas no está soportado oficialmente y la calibración usó un 45 % de inglés.
- Limitaciones de contexto: la longitud de contexto no se especifica en esta ficha; debe consultarse la model card del modelo base.
- Restricciones de licencia: licencia Llama 3.2, que impone condiciones de uso comercial, atribución "Built with Llama" y restricciones de redistribución; es necesario revisar el texto completo antes de uso en producción.
- Caveat de producción: las métricas publicadas son evaluaciones en host, no mediciones en dispositivo; el autor no reporta latencia ni throughput, por lo que el rendimiento real en Tensix debe validarse empíricamente.
- Formato específico: los pesos están pensados para TT-NN; usarlos fuera de ese stack requiere el flujo de `transformers` con `dtype="bfloat16"`, sin garantía de que el empaquetado BFP8 se aproveche en GPU.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las herramientas asociadas están en versión v0.1.0; conviene tratarlo como material experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Variante BFP4 del mismo autor: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP4
- Repositorio de cuantización tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Repositorio de kernels tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia Llama 3.2: https://huggingface.co/Xylolabs/Llama-3.2-3B-Instruct-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
