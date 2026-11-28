# Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-4B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo Qwen/Qwen3-4B, desarrollada por Xylolabs, específicamente empaquetada para su ejecución en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo base Qwen3-4B es un transformer denso de 4.411 millones de parámetros (4,4 mil millones) desarrollado por el equipo Qwen de Alibaba, orientado a generación de texto, razonamiento y conversación multilingüe.

La particularidad de esta ficha es el formato de cuantización: las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) de las 36 capas se cuantizan a `bfloat4_b` (BFP4, block floating point de 4 bits), mientras que el LM head, los embeddings y las normas permanecen en bf16. Esto reduce el tamaño empaquetado de 8,04 GB (bf16) a 2,822 GB, manteniendo una fidelidad respecto al modelo en bf16 con una KL media de 0,0711.

Es relevante ahora porque permite desplegar un modelo de 4B con contexto largo en hardware NPU de Tenstorrent, una alternativa a GPU que está ganando tracción en inferencia de bajo consumo. La cuantización GPTQ con búsqueda de exponente por bloque y el empaquetado específico para Tensix (ttnn, tt-metal, tt-forge) hacen de este repo un artefacto de despliegue más que un modelo entrenado desde cero.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas |
| Parámetros totales | 4.411.424.256 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (`bfloat4_b`) en proyecciones de atención y MLP; bf16 en LM head, embeddings y normas |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (empaquetado para Tensix; también compatible con `ttnn.bfloat8_b`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B es un transformer denso de 36 capas con atención y MLP estándar. Esta versión no reentrena el modelo: aplica GPTQ sobre las proyecciones q, k, v, o, gate, up y down de las 36 capas, con una búsqueda de exponente por bloque (block floating point), y deja en bf16 el LM head (atado al embedding), los embeddings y todas las normas. El resultado se empaqueta en el formato `bfloat4_b` de ttnn para su uso en NPUs Tensix.

La innovación técnica principal es el propio pipeline de cuantización y empaquetado: `tensix-bfp-gptq` incluye `tools/pack_tensix.py` y `tools/verify_grid.py`, que verifican cada matriz mediante round-trip a través de DRAM del dispositivo. Los mismos valores también se empaquetan exactamente en `ttnn.bfloat8_b`, lo que permite subir de precisión sin recuantizar. El modelo se ejecuta con tt-transformers sobre tt-metal v0.81.1 (requiere `--use_hf_rope`) y con tt-forge mediante `torch.compile(backend="tt")`. No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO).

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`).
- Razonamiento y respuesta a preguntas en formato multi-turno.
- Generación de código y matemáticas (heredadas del modelo base Qwen3-4B).
- Ejecución en NPU Tenstorrent Tensix (Wormhole, Blackhole) mediante ttnn y tt-metal.
- Compatibilidad con tt-forge y `torch.compile` para grafos compilados en Tensix.
- Inferencia en transformers estándar (carga en bf16 con `device_map="auto"`).
- Soporte de decodificación con caché KV en bfp8 (configuración de precisión mixta del demo de tt-transformers).
- Capacidades multilingües: no detalladas en la información disponible (dependen del modelo base).
- Tool calling / function calling: no documentado explícitamente en esta ficha; heredado del modelo base si este lo soporta.

## Casos de uso

- Despliegue en NPU Tenstorrent: ejecutar Qwen3-4B en Wormhole o Blackhole con 2,822 GB de pesos empaquetados, reduciendo la huella de memoria frente a los 8,04 GB en bf16 y liberando GPU para otras tareas.
- Inferencia de bajo consumo en edge: al caber en memoria DRAM de aceleradores Tensix, es adecuado para servidores de inferencia con restricciones energéticas donde una GPU dedicada no es viable.
- Chat conversacional multi-turno: usar la plantilla de chat del tokenizador y el contexto del modelo base para asistentes con historial de conversación.
- Generación de código en pipelines internos: el modelo base Qwen3-4B está orientado a código; esta versión permite servirlo en hardware Tensix dentro de flujos de CI/CD o herramientas de desarrollo.
- Prototipado de cuantización BFP4: sirve como referencia para validar pipelines GPTQ con block floating point antes de cuantizar modelos mayores.
- Verificación de fidelidad de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar matriz a matriz la precisión respecto a bf16 en un entorno Tensix.
- Investigación en formatos de bajo bit: comparar BFP4 frente a Q4_K_M de llama.cpp (KL media 0,0711 frente a 0,0658) en tareas de generación.

## Benchmarks y rendimiento

| Métrica | Este modelo (BFP4) | llama.cpp Q4_K_M |
|---|---:|---:|
| Tamaño empaquetado (GB) | 2,822 | No disponible |
| Tamaño en bf16 (GB) | 8,04 | No disponible |
| KL media respecto a bf16 | 0,0711 | 0,0658 |
| Ratio KL frente a Q4_K_M | 1,08× | 1,00× (referencia) |
| Top-1 (%) | No disponible en la información proporcionada | No disponible en la información proporcionada |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas para esta cuantización.

## Requisitos de hardware

- VRAM/DRAM: 2,822 GB de pesos empaquetados en BFP4 para Tensix; en bf16, 8,04 GB.
- NPU recomendadas: Tenstorrent Wormhole y Blackhole (Tensix), con tt-metal v0.81.1.
- GPU: no es el objetivo del artefacto; puede cargarse en GPU con transformers en bf16 (requiere al menos ~9-10 GB de VRAM para pesos más overhead).
- Consumer GPU: en bf16 cabría en GPUs con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090); la versión BFP4 está pensada para Tensix, no para CUDA.
- Despliegue: tt-transformers (tt-metal v0.81.1), tt-forge con `pjrt-plugin-tt==1.4.0`, transformers estándar; no se documenta vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la información proporcionada; el demo de tt-transformers incluye una prueba `performance and batch-1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---:|---|---|---|---|
| Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4 | 4,4 B | No disponible | BFP4 (GPTQ) | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-4B (base) | 4,4 B | No disponible | bf16 | Apache-2.0 | GPU/CPU |
| Qwen3-4B en Q4_K_M (llama.cpp) | 4,4 B | No disponible | Q4_K_M | Apache-2.0 | CPU/GPU |

La comparación directa con alternativas de la misma categoría (modelos de 4B cuantizados para NPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización BFP4 introduce una degradación medible: KL media de 0,0711 frente a bf16, un 8 % superior a Q4_K_M de llama.cpp (0,0658).
- El formato está atado a Tensix: fuera de tt-metal/tt-forge, el uso práctico es cargar el modelo en bf16 con transformers, perdiendo la ventaja de tamaño.
- Requiere tt-metal v0.81.1 y el flag `--use_hf_rope`; versiones distintas pueden no ser compatibles.
- No se documentan sesgos específicos de esta cuantización; los sesgos del modelo base Qwen3-4B no se detallan en la información disponible.
- Riesgo de alucinación inherente a modelos de 4B; no se han publicado evaluaciones de fidelidad en tareas abiertas para esta versión.
- Idiomas soportados no documentados en esta ficha; dependen del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar los términos del modelo base y de las dependencias (tt-metal, tt-forge) por separado.
- El repo tiene 229 descargas y 0 likes en el momento de la consulta; es un artefacto reciente con poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit referenciado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentación Tenstorrent: https://docs.tenstorrent.com
- tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal
- Paper referenciado (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
