# Xylolabs/Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen3-4B-Thinking-2507 de Alibaba Qwen, adaptada específicamente para su ejecución sobre aceleradores NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs y consiste en aplicar GPTQ con búsqueda de exponente por bloque para convertir las proyecciones lineales del transformer a formato bloque de coma flotante `bfloat4_b` (BFP4, 4,5 bits por peso), manteniendo el resto de tensores en bf16 tal como en el modelo base.

El modelo base Qwen3-4B-Thinking-2507 es un transformer denso de 4.411 millones de parámetros con modo de razonamiento explícito ("thinking"), publicado por el equipo Qwen bajo licencia Apache 2.0. Esta variante no modifica la arquitectura ni el entrenamiento: solo cambia la representación numérica de los pesos para que TT-NN pueda empaquetarlos sin alterar sus valores, algo relevante porque las NPU Tensix no ejecutan de forma nativa los formatos de cuantización habituales de llama.cpp o GPTQ estándar.

La ficha es relevante para desarrolladores que quieran desplegar un modelo de razonamiento de 4B en hardware Tenstorrent con un consumo de memoria de dispositivo de aproximadamente 2,82 GB solo para los pesos del modelo de lenguaje, frente a los 8,04 GB en bf16. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) y una evaluación de fidelidad respecto al modelo original en términos de divergencia KL y coincidencia top-1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), cuantizado a BFP4 para Tensix |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales; bf16 en embedding, LM head, normas y resto de tensores; media de 5,61 bits por peso |
| Idiomas soportados | no disponible (evaluación de calibración y validación en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con `transformers`); empaquetado nativo para TT-NN |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-4B-Thinking-2507 original: un transformer denso de 36 capas con atención multi-cabeza y MLP, en el que el export cuantiza las proyecciones q, k, v, o y gate, up, down de las 36 capas. El resto de tensores (embedding, LM head atada al embedding, normas y demás) se conserva en bf16 exactamente como en el modelo base. La cuantización se realizó con GPTQ y una búsqueda de exponente por bloque, calibrada sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP4, de modo que TT-NN las empaqueta sin modificar sus valores.

No se ha reentrenado ni ajustado el modelo: no hay RLHF, DPO ni datos de entrenamiento adicionales en esta variante. La innovación técnica es el propio pipeline de cuantización orientado a hardware Tensix, que produce un checkpoint que se empaqueta de forma exacta tanto en `ttnn.bfloat4_b` como en `ttnn.bfloat8_b`. La verificación se realizó con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; tt-transformers y tt-forge no se ejecutaron con este checkpoint.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento explícito en modo "thinking" (heredado de Qwen3-4B-Thinking-2507).
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base Qwen3).
- Soporte de tool calling y function calling (capacidad del modelo base Qwen3; no verificada específicamente en esta cuantización).
- Razonamiento multi-paso y uso en flujos de agente (capacidad del modelo base; no verificada en esta variante).
- Capacidades multilingües del modelo base (no se detallan idiomas en la información disponible).
- Ejecución en NPU Tensix (Wormhole, Blackhole) mediante TT-NN, además de inferencia estándar con `transformers` en GPU/CPU.

## Casos de uso

- Despliegue en hardware Tenstorrent: el checkpoint está pensado para cargarse en NPU Wormhole o Blackhole con TT-NN, aprovechando el empaquetado nativo BFP4 y un consumo de unos 2,82 GB de memoria de dispositivo para los pesos.
- Razonamiento en el borde con presupuesto de memoria ajustado: la reducción de 8,04 GB (bf16) a 2,82 GB permite alojar un modelo de razonamiento de 4B en aceleradores con DRAM limitada.
- Asistentes conversacionales multi-turno: la plantilla de chat y el modo thinking permiten mantener diálogos con razonamiento intermedio antes de la respuesta final.
- Generación de código asistida: el modelo base Qwen3 está orientado a tareas de programación; esta variante permite ejecutarlo en infraestructura Tensix sin reentrenar.
- Evaluación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar que el empaquetado BFP4 no altera los valores, útil para ingenieros que preparan otros modelos para TT-NN.
- Investigación sobre fidelidad de cuantizaciones de 4 bits: la model card publica métricas de KL y top-1 frente a bf16 y frente a Q4_K_M de llama.cpp, lo que facilita estudios comparativos de esquemas de cuantización.
- Prototipado con `transformers`: el checkpoint se puede cargar con `AutoModelForCausalLM` en bf16 y `device_map="auto"` para pruebas rápidas antes de portarlo a Tensix.

## Benchmarks y rendimiento

La model card publica métricas de fidelidad respecto al modelo en bf16, no de calidad de tarea. KL y top-1 se calculan sobre 16.256 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), con y sin plantilla de chat. "Answers right" corresponde a 33 prompts cortos con comprobación automática.

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-4B-Thinking-2507) | 16 | 8,04 | 0 | 100 | 31 de 33 | - |
| Este modelo (BFP4) | 5,61 | 2,822 | 0,04599 | 90,95 | 32 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,955 | 2,497 | 0,04862 | 90,64 | 29 de 33 | 1 |

El criterio de aceptación del autor era una KL media como máximo 1,5 veces la de Q4_K_M y como máximo una respuesta perdida adicional; el resultado es 0,946 veces la KL de Q4_K_M y una respuesta perdida frente a una. No se publican cifras de velocidad ni de throughput.

## Requisitos de hardware

- Memoria de dispositivo Tensix: aproximadamente 2,82 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Memoria en bf16 para inferencia con `transformers`: el repo ocupa 8,8 GB; el modelo base en bf16 son 8,04 GB, por lo que se recomienda al menos 10-12 GB de VRAM para carga y generación.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una RTX 4090 (24 GB) o A100/H100 son suficientes para la versión bf16, y GPUs de 8-12 GB podrían alojar el checkpoint si se aplica cuantización adicional no incluida en el repo.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas de 12 GB o más; el checkpoint no incluye pesos GGUF ni otros formatos de llama.cpp.
- Opciones de despliegue: TT-NN (ttnn 0.81.1 verificado en `ttsim`), `transformers` con `AutoModelForCausalLM`, y `text-generation-inference` (etiqueta del repo, no verificada específicamente). tt-transformers y tt-forge no se probaron con este checkpoint.
- Latencia y throughput: no disponibles; la model card indica explícitamente que no se reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 4,41 B | no disponible | BFP4 + bf16 mixto (5,61 bits/peso) | Apache 2.0 | Hugging Face, 29 descargas |
| Qwen/Qwen3-4B-Thinking-2507 (BF16) | 4,41 B | no disponible | bf16 | Apache 2.0 | Hugging Face (modelo base) |
| Q4_K_M de llama.cpp (mismo checkpoint) | 4,41 B | no disponible | Q4_K_M (4,955 bits/peso) | Apache 2.0 | Generado por el autor, no publicado como repo |

La comparativa se limita al modelo base y a la cuantización Q4_K_M de referencia usada en la evaluación, porque no se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo se han cuantizado las proyecciones lineales; el embedding, la LM head, las normas y el resto de tensores permanecen en bf16, por lo que el ahorro de memoria es menor que el de una cuantización uniforme de 4 bits.
- La evaluación mide fidelidad respecto a bf16 (KL y top-1), no calidad de tarea; no hay benchmarks de MMLU, HumanEval o GSM8K en la información disponible.
- La calibración se hizo con WikiText-2 y Wikipedia en coreano; el comportamiento en otros idiomas o dominios no está validado.
- El checkpoint se verificó con ttnn 0.81.1 sobre el simulador `ttsim` (Blackhole); no se probó en silicio real ni con tt-transformers o tt-forge.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta variante; hereda los del modelo base Qwen3-4B-Thinking-2507.
- Licencia Apache 2.0 permite uso comercial, pero el autor declara el modelo "as is", sin garantía, y aclara que no está afiliado ni respaldado por Tenstorrent.
- El repo no incluye pesos GGUF ni otros formatos para llama.cpp u Ollama; para esos entornos habría que reconvertir desde el modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Thinking-2507-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de referencia (Qwen3 Technical Report): https://arxiv.org/abs/2505.09388
