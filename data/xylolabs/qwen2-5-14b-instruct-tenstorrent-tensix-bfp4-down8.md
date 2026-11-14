# Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-Down8

## Resumen

Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-Down8 es una exportación cuantizada del modelo Qwen2.5-14B-Instruct de Alibaba, adaptada específicamente para su ejecución sobre aceleradores Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs, que aplica GPTQ sobre las proyecciones lineales de atención y parte del MLP para llevarlas a formato `ttnn.bfloat4_b` (BFP4), manteniendo las proyecciones `down_proj` del MLP en `ttnn.bfloat8_b` (BFP8). El resultado ocupa unos 12,25 GB de memoria de dispositivo para los pesos del modelo de lenguaje, frente a los 29,54 GB del checkpoint BF16 original.

El modelo base, Qwen2.5-14B-Instruct, es un transformer decoder-only de 14.770.033.664 parámetros (unos 14,77 mil millones) con licencia Apache 2.0, entrenado por Alibaba para generación de texto, razonamiento, código y matemáticas, con soporte de tool calling y conversación multi-turno. Esta versión no modifica la arquitectura ni el tokenizador: solo cambia el formato de almacenamiento de determinadas matrices para que TT-NN las empaquete sin recomprimir en el dispositivo.

La relevancia de esta ficha es doble. Por un lado, documenta una ruta de despliegue concreta para hardware Tenstorrent, un ecosistema emergente de NPUs que compite con GPUs en inferencia de bajo consumo. Por otro, sirve como referencia de cuantización de bloque (block floating point) aplicada a un modelo de 14B, con métricas de fidelidad respecto a BF16 publicadas por el autor (KL media de 0,13698 y top-1 del 88,59 % sobre 16.104 posiciones). Es importante señalar que el checkpoint está pensado para Tensix: la model card indica explícitamente que tt-transformers y tt-forge no se han ejecutado con él, y que la verificación se realizó sobre el simulador ttsim.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), pesos lineales en block floating point para Tensix |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-14B-Instruct) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en q, k, v, o y MLP gate/up; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en MLP down; bf16 en LM head, embeddings y normas. Media de 6,63 bits/peso |
| Idiomas soportados | en (segun la model card; el calibrado de GPTQ uso WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 29,5 GB), con metadatos `quant4.json` y `model.safetensors.index.json` para el empaquetado en TT-NN |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-14B-Instruct: un transformer decoder-only denso con 48 capas, atención multi-cabeza con RoPE, normalización RMSNorm y activación SwiGLU en el MLP. Esta exportación no altera la topología: mantiene los tensores de embedding, LM head y normas en bf16 y sustituye únicamente las matrices lineales de atención (q, k, v, o) y del MLP (gate, up, down) por representaciones de bloque. Las 48 capas de q/k/v/o, gate y up se almacenan en BFP4, mientras que las 48 capas de `down_proj` se guardan en BFP8, presumiblemente por su mayor sensibilidad a la cuantización agresiva. El empaquetado es exacto: los valores cuantizados se guardan como bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los lee sin recuantizar ni perder información.

El proceso de cuantización combina GPTQ con una búsqueda de exponente por bloque para los tensores BFP4, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano; los tensores BFP8 se obtuvieron por redondeo al más cercano (round to nearest). No se documenta en la información disponible ningún entrenamiento adicional, ajuste por RLHF/DPO ni destilación sobre esta exportación: es puramente una transformación de pesos del checkpoint original de Alibaba. La innovación técnica destacable es el uso de block floating point compartido por bloque (exponente común), que encaja con la unidad de cómputo Tensix y permite reducir el peso medio a 6,63 bits con una degradación medida de KL 0,13698 respecto a BF16.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con el tokenizador de Qwen2.5.
- Razonamiento, matemáticas y generación de código heredados del modelo base Qwen2.5-14B-Instruct.
- Soporte de tool calling y function calling propio del modelo base (no verificado específicamente en esta exportación).
- Capacidad de agentes y razonamiento multi-paso, sujeta a la ventana de contexto del modelo base.
- Capacidades multilingües del modelo original, aunque la model card declara únicamente `en` como idioma soportado.
- Ejecución sobre NPUs Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4/BFP8.
- Verificación de integridad de pesos mediante scripts incluidos (`pack_tensix.py`, `verify_grid.py`), que comprueban el round-trip exacto de cada matriz.
- No incluye visión, audio ni modo thinking explícito; estas capacidades no se mencionan en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para TT-NN y ocupa 12,25 GB de memoria de dispositivo en pesos, lo que permite servir un modelo de 14B en una NPU con DRAM suficiente sin recuantizar en tiempo de carga.
- Inferencia de bajo consumo en edge o servidores con NPU: al reducir el peso a 6,63 bits de media, el modelo encaja en presupuestos de memoria muy inferiores a los 29,54 GB de BF16, lo que facilita despliegues en nodos con memoria limitada.
- Asistente conversacional en inglés: el modelo conserva la plantilla de chat de Qwen2.5 y puede gestionar diálogos multi-turno, con la salvedad de que la model card solo declara soporte de inglés.
- Generación de código en pipelines internos: hereda la capacidad de Qwen2.5-14B-Instruct para código y puede integrarse en flujos de autocompletado o revisión, siempre que el backend sea TT-NN o transformers con el checkpoint cargado en bf16.
- Evaluación de fidelidad de cuantización: sirve como referencia para estudiar el impacto de BFP4/BFP8 en un modelo de 14B, con métricas publicadas de KL y top-1 frente a BF16 y a Q4_K_M de llama.cpp.
- Prototipado en el simulador ttsim: el autor verificó el empaquetado con ttnn 0.81.1 sobre ttsim, por lo que es útil para desarrollar kernels o validar flujos TT-NN antes de disponer de hardware físico.
- Investigación en formatos de bloque: el calibrado con WikiText-2 y Wikipedia en coreano permite reproducir experimentos de GPTQ con búsqueda de exponente por bloque en modelos densos de tamaño medio.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor miden la fidelidad respecto a BF16, no la calidad de tarea. Se reproducen a continuación tal cual aparecen en la model card.

| Modelo | Bits/peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen2.5-14B-Instruct) | 16 | 29,54 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4 Down8) | 6,63 | 12,246 | 0,13698 | 88,59 | 32 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,87 | 8,988 | 0,0923 | 90,34 | 31 de 33 | 1 |

Las métricas de KL y top-1 cubren 16.104 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con plantilla de chat. Las 33 respuestas corresponden a prompts cortos con comprobación automática. El autor fija como criterio de aceptación una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; este modelo cumple con 1,48 veces la KL de Q4_K_M y 0 respuestas perdidas frente a 1. No se publican datos de MMLU, HumanEval, GSM8K ni latencia/throughput en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 12,25 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers de TT-NN.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Verificación realizada con ttnn 0.81.1 sobre ttsim (simulador de Blackhole); no se confirma ejecución en silicio físico en la información disponible.
- Ejecución en GPU/CPU: el checkpoint puede cargarse con transformers (`AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")`), pero en ese caso se pierde la ventaja de empaquetado BFP y se aproxima al tamaño BF16 de 29,5 GB, por lo que se necesitaría una GPU con al menos 30-32 GB de VRAM (A100 40/80 GB, H100, RTX 4090 no cabe en bf16 completo).
- Despliegue recomendado: TT-NN con `ttnn.as_tensor` y `ttnn.bfloat4_b`/`ttnn.bfloat8_b`; scripts `pack_tensix.py` y `verify_grid.py` para validación.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no verificadas con este checkpoint; la model card solo menciona compatibilidad con transformers y text-generation-inference a nivel de metadatos, sin pruebas publicadas.
- Latencia y throughput: no disponibles en la información proporcionada; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / destino | Notas |
|---|---|---|---|---|---|
| Este modelo (BFP4 Down8) | 14,77 B | No disponible | Apache 2.0 | safetensors BFP4/BFP8 para Tensix | KL 0,13698 vs BF16, top-1 88,59 % |
| Qwen2.5-14B-Instruct (BF16) | 14,77 B | No disponible | Apache 2.0 | safetensors bf16 | Referencia de calidad, 29,54 GB |
| Q4_K_M de llama.cpp (mismo checkpoint) | 14,77 B | No disponible | Apache 2.0 | GGUF 4,87 bits/peso | KL 0,0923, top-1 90,34 %, 8,988 GB |
| Alternativas de 14B en formato GGUF/AWQ | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

La comparación directa solo es posible frente al checkpoint BF16 y a la cuantización Q4_K_M generada por el propio autor. Frente a Q4_K_M, este modelo ocupa más memoria (12,25 GB frente a 8,99 GB) y presenta peor KL y top-1, pero su ventaja es el empaquetado nativo para Tensix sin recuantización en el dispositivo.

## Limitaciones y advertencias

- El checkpoint está diseñado para Tensix; tt-transformers y tt-forge no se han ejecutado con él según la model card, por lo que el soporte en esos frameworks no está garantizado.
- La verificación se realizó sobre ttsim (simulador), no sobre hardware físico; el rendimiento real en Wormhole o Blackhole no está documentado.
- La model card declara únicamente inglés como idioma soportado, aunque el calibrado usó texto en coreano; el comportamiento multilingüe no está evaluado.
- La longitud de contexto no se especifica en la información disponible; debe consultarse en el modelo base Qwen2.5-14B-Instruct.
- Las métricas publicadas miden fidelidad respecto a BF16, no calidad de tarea; no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-14B-Instruct, no mitigados por la cuantización.
- La cuantización BFP4 en proyecciones de atención y MLP gate/up puede degradar tareas sensibles a precisión; el autor reporta una respuesta perdida menos que Q4_K_M, pero el conjunto de evaluación es de solo 33 prompts.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso `NOTICE` con los cambios indicados por Xylolabs.
- El repo pesa 29,5 GB, aunque el peso empaquetado en dispositivo sea 12,25 GB; la descarga y el almacenamiento requieren espacio considerable.
- No se han publicado datos de latencia ni throughput, lo que impide estimar coste operativo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-Down8
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia Qwen2.5 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen2.5-14B-Instruct-Tenstorrent-Tensix-BFP4-Down8/blob/main/LICENSE
