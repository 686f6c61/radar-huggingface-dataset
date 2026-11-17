# Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8

## Resumen
Qwen3-1.7B-Tenstorrent-Tensix-BFP8 es una versión cuantizada del modelo Qwen3-1.7B de Alibaba Qwen, adaptada específicamente para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El trabajo lo firma Xylolabs, que aplica GPTQ con formato de coma flotante por bloques (block floating point, `bfloat8_b`) a las proyecciones de atención y MLP, manteniendo en bf16 la cabeza LM, los embeddings y las normalizaciones. El resultado es un modelo de 2.031.739.904 parámetros que ocupa 2,12 GB empaquetado para Tensix frente a los 3,44 GB de la versión bf16 original.

El modelo hereda la arquitectura transformer densa de Qwen3-1.7B, con 28 capas y modo de razonamiento opcional (thinking mode). La cuantización consigue una media de 9,86 bits por peso, lo que reduce el peso a aproximadamente el 62 % del original sin degradar la calidad de forma significativa según las métricas del autor: una divergencia KL media de 0,0016 frente a bf16, muy inferior a la de Q4_K_M de llama.cpp (0,1048).

Su relevancia radica en que es una de las pocas distribuciones públicas de un modelo Qwen3 empaquetado para hardware NPU de Tenstorrent, con herramientas de verificación y empaquetado incluidas. Esto permite a desarrolladores desplegar inferencia de Qwen3-1.7B en aceleradores Tensix sin tener que realizar el proceso de cuantización y adaptación de formato por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 28 capas |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en proyecciones de atencion y MLP; bf16 en LM head, embeddings y normas |
| Idiomas soportados | en, ko (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores bf16 sobre la rejilla BFP8); empaquetado nativo Tensix via TT-NN |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso con 28 capas, atención estándar (con q_norm y k_norm) y MLP con proyecciones gate/up/down. El modelo base fue entrenado por Alibaba Qwen; el paper asociado es arXiv:2505.09388. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron fases de RLHF o DPO.

La innovación de esta versión es el proceso de cuantización: GPTQ aplicado a las 28 capas de atención (q, k, v, o) y MLP (gate, up, down) en formato `bfloat8_b` de Tenstorrent, que ocupa 8,5 bits por peso. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla de su formato, de modo que TT-NN las empaqueta sin modificar ningún valor. El repositorio incluye `quant4.json`, que lista el formato de cada proyección, y las herramientas `pack_tensix.py` y `verify_grid.py` del proyecto tensix-bfp-gptq v0.1.0.

## Capacidades
- Generación de texto conversacional y de propósito general, heredadas de Qwen3-1.7B.
- Modo de razonamiento opcional (thinking mode), activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Razonamiento multi-paso y resolución de problemas, en la línea de la familia Qwen3.
- Generación de código y matemáticas (capacidades propias del modelo base Qwen3-1.7B).
- Soporte multilingüe limitado a inglés y coreano según la model card; el modelo base Qwen3 soporta más idiomas, pero esta ficha no documenta su comportamiento tras la cuantización.
- No se documenta soporte explícito de tool calling, function calling, agentes, visión ni audio en la información proporcionada.
- Ejecución en aceleradores Tenstorrent Tensix (Wormhole, Blackhole) mediante TT-NN y tt-metal.

## Casos de uso
- Despliegue en hardware Tenstorrent: el modelo está empaquetado específicamente para NPUs Tensix, por lo que se usaría con `pack_tensix.py` y el runner `tensix-runner` para servir inferencia en Wormhole o Blackhole, aprovechando el formato BFP8 nativo del hardware.
- Asistentes conversacionales en inglés y coreano: con 2,03 mil millones de parámetros y licencia Apache 2.0, es adecuado para chatbots multi-turno en entornos con recursos limitados, usando la plantilla de chat de Qwen3 con `enable_thinking=False` para respuestas directas.
- Prototipado de razonamiento con modo thinking: se puede activar el modo de razonamiento para tareas de lógica o matemáticas y comparar resultados con y sin thinking en un mismo despliegue.
- Evaluación de cuantización en pipelines de investigación: las herramientas incluidas (`verify_grid.py`, `pack_tensix.py`) permiten verificar que las matrices empaquetadas no cambian de valor y medir la divergencia KL frente a bf16, útil para estudiar el impacto de BFP8 en modelos pequeños.
- Generación de código en entornos de borde: al ocupar 2,12 GB empaquetado, puede desplegarse en dispositivos con memoria limitada para autocompletado o generación de fragmentos de código, aunque sin garantías de tool calling documentadas.
- Fine-tuning o adaptación sobre la versión cuantizada: al conservar los pesos en bf16 sobre la rejilla BFP8 y mantener la cabeza LM y los embeddings en bf16, es posible experimentar con adaptaciones ligeras antes de reempaquetar para Tensix.
- Benchmarking de hardware NPU: sirve como carga de trabajo de referencia para medir latencia y throughput de Tensix con un modelo de 2B parámetros en formato BFP8, aunque el autor no publica mediciones de velocidad en dispositivo.

## Benchmarks y rendimiento
Los datos disponibles son evaluaciones en host de los pesos, no mediciones en dispositivo. La tabla compara la versión BFP8 con bf16, BFP4 y Q4_K_M de llama.cpp sobre Qwen3-1.7B:

| Pesos | Bits por peso | Tamano (GB) | KL media a bf16 | Top-1 (%) | Respuestas correctas | Perdidas | Chequeo de precision |
|---|---:|---:|---:|---:|---:|---:|---|
| bf16 (original) | 16,00 | 3,44 | 0 | 100 | 34/40 | - | - |
| BFP8 (este modelo) | 9,86 | 2,120 | 0,0016 | 98,28 | 29/33 | 0 | pasado (0,02x KL; 0 perdidas) |
| BFP4 | 6,58 | 1,415 | 0,1022 | 86,27 | 28/33 | 1 | pasado (0,97x KL; 1 perdida) |
| Q4_K_M (llama.cpp) | 5,03 | 1,282 | 0,1048 | 85,70 | 29/33 | 0 | referencia |

La KL media se calcula sobre distribuciones de siguiente token en textos fijos en inglés y coreano. El chequeo de respuestas usa 33 prompts con respuesta conocida más 7 con thinking activado (40 en total). El autor no reporta latencia ni throughput en dispositivo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: 2,12 GB empaquetado para Tensix; en formato bf16 sobre la rejilla, el repositorio ocupa 4,1 GB.
- GPU recomendadas: no aplica de forma nativa; el modelo está pensado para NPUs Tenstorrent Tensix (Wormhole, Blackhole). En GPU convencional se puede cargar con `transformers` en bfloat16, pero sin las ventajas del formato BFP8.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 4-5 GB de memoria si se carga en bf16 vía `transformers`; en Tensix, el empaquetado reduce el peso a 2,12 GB.
- Opciones de despliegue: TT-NN y tt-metal para Tensix (con `tensix-runner` v0.1.0 y `pack_tensix.py`); `transformers` para carga en host; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad y que las evaluaciones son en host, no en dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8 | 2,03 B | no disponible | BFP8 (9,86 bits/peso) para Tensix | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-1.7B (bf16) | 2,03 B | no disponible | bf16 (16 bits/peso) | apache-2.0 | Hugging Face, modelo base |
| Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4 | 2,03 B | no disponible | BFP4 (6,58 bits/peso) para Tensix | apache-2.0 | Hugging Face |
| Qwen3-1.7B Q4_K_M (llama.cpp) | 2,03 B | no disponible | Q4_K_M (5,03 bits/peso) | apache-2.0 | Conversion comunitaria |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks estándar para comparar con otros modelos de tamaño similar. La versión BFP8 ofrece mejor fidelidad a bf16 que BFP4 y Q4_K_M (KL de 0,0016 frente a 0,1022 y 0,1048), a costa de un mayor tamaño (2,12 GB frente a 1,415 y 1,282 GB).

## Limitaciones y advertencias
- El modelo está optimizado para hardware Tenstorrent Tensix; fuera de esa plataforma pierde la ventaja del formato BFP8 y se comporta como una carga bf16 convencional.
- La model card solo declara soporte de inglés y coreano; no se documenta el comportamiento en castellano ni en otros idiomas tras la cuantización.
- No se publican mediciones de latencia ni throughput en dispositivo, por lo que el rendimiento real en Tensix no está cuantificado.
- La evaluación se realizó en host sobre los pesos, no en el acelerador; los números de KL y top-1 no reflejan posibles diferencias de implementación en TT-NN.
- Riesgo de alucinación inherente a un modelo de 1,7 B parámetros; no se documentan mitigaciones específicas.
- No se documenta soporte de tool calling, function calling ni capacidades de agente, lo que limita su uso en pipelines automatizados complejos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B conserva sus propios términos; conviene verificar la licencia del modelo base para producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.
- La fecha de creación del repositorio (2026-11-17) es posterior a la información de referencia disponible; verificar la vigencia de los enlaces y versiones de las herramientas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Variante BFP4: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP4
- Repositorio tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Kernels tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Runner tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper de Qwen3: https://arxiv.org/abs/2505.09388
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen3-1.7B-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
