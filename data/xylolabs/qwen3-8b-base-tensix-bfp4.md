# Xylolabs/Qwen3-8B-Base-Tensix-BFP4

## Resumen

Qwen3-8B-Base-Tensix-BFP4 es una versión cuantizada del modelo base Qwen/Qwen3-8B-Base, desarrollada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). La cuantización aplica GPTQ sobre las capas lineales del transformer, convirtiendo las proyecciones de atención (q, k, v, o) y de MLP (gate, up, down) al formato `ttnn.bfloat4_b` (block floating point de 4 bits, 4,5 bits por peso), mientras que el resto de tensores (embeddings, LM head, normas) permanecen en bf16.

El resultado es un checkpoint de 8.190.735.360 parámetros que ocupa 6,40 GB empaquetado, con un promedio de 6,25 bits por peso. Los pesos se almacenan en safetensors en bf16 pero con todos los valores ya alineados a la rejilla BFP4, de modo que TT-NN los empaqueta sin pérdida adicional. Esto permite desplegar un modelo de 8B en hardware Tensix con una huella de memoria muy reducida respecto al original de 16,38 GB.

La relevancia del modelo reside en su enfoque específico para hardware no-GPU: no es una cuantización genérica para llama.cpp o vLLM, sino un artefacto calibrado y validado contra el stack tt-metal/ttnn de Tenstorrent. La licencia Apache-2.0 y la preservación de la plantilla de chat del modelo base lo hacen apto para uso comercial, aunque se trata de un modelo preentrenado sin ajuste de instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), capas lineales cuantizadas a BFP4 |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en q, k, v, o, gate, up, down (36 capas); bf16 en LM head, embeddings y normas; media de 6,25 bits/peso |
| Idiomas soportados | no disponible (calibrado con WikiText-2 en ingles y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (valores bf16 alineados a rejilla BFP4), con `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer decoder-only de 8B parámetros. La modificación introducida por Xylolabs consiste en cuantizar con GPTQ las proyecciones lineales de las 36 capas: atención (q, k, v, o) y MLP (gate, up, down). Cada matriz se representa en formato block floating point de 4 bits con exponente compartido por bloque, y se realizó una búsqueda de exponente por bloque durante la cuantización. La calibración empleó 65.536 tokens de WikiText-2 y de Wikipedia en coreano.

Los tensores restantes (LM head, embeddings, normas y demás) se mantienen en bf16 tal como en el modelo base. El checkpoint resultante pesa 6,40 GB empaquetado y los ficheros safetensors almacenan los valores en bf16 ya situados sobre la rejilla BFP4, de modo que el empaquetado en TT-NN es exacto y no introduce error adicional. El autor indica que los mismos valores también se empaquetan de forma exacta en `ttnn.bfloat8_b`. No se especifican datos sobre el número de tokens de preentrenamiento del modelo original ni sobre fases de RLHF/DPO, ya que se trata de un modelo base sin ajuste de instrucciones.

## Capacidades

- Generación de texto por continuación: es un modelo preentrenado, no ajustado a instrucciones; completa texto a partir de un prefijo.
- Razonamiento y conocimiento general heredados de Qwen3-8B-Base.
- Generación de código y matemáticas (capacidades del modelo base, sin datos específicos publicados en esta ficha).
- Multilingüismo: la calibración incluyó coreano además de inglés, pero no se documenta la lista oficial de idiomas.
- Tool calling / function calling: no disponible (modelo base, sin ajuste para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible (requiere ajuste de instrucciones).
- Modo thinking: no disponible en esta variante base.
- Visión y audio: no soportados.
- Ejecución en NPU Tensix mediante tt-metal/ttnn (Wormhole, Blackhole) y compatibilidad con el ecosistema transformers.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para TT-NN y permite ejecutar un transformer de 8B en Wormhole o Blackhole con 6,40 GB de pesos, reduciendo la presión sobre DRAM frente al checkpoint bf16 de 16,38 GB.
- Investigación en cuantización BFP4: sirve como referencia reproducible para estudiar el impacto de block floating point de 4 bits en capas lineales, con métricas de KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Evaluación de stacks de inferencia alternativos: útil para comparar tt-metal/ttnn, tt-forge (tt-xla) y transformers sobre el mismo artefacto cuantizado.
- Prototipado de continuación de texto en entornos con memoria limitada: al ser un modelo base, encaja en tareas de generación libre, completado y experimentación con prompts, no en asistentes conversacionales.
- Benchmarking de hardware Tensix: el autor proporciona scripts (`pack_tensix.py`, `verify_grid.py`) para validar el empaquetado exacto de matrices, lo que facilita pruebas de regresión en nuevas versiones de tt-metal.
- Base para ajuste fino posterior: al mantener licencia Apache-2.0 y pesos en safetensors compatibles con transformers, puede servir como punto de partida para fine-tuning o para destilar un modelo instruct sobre la variante cuantizada.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | Bits/peso | Tamano (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3-8B-Base) | 16 | 16,38 | 0 | 100 | 28 de 28 | - |
| **Este modelo (BFP4)** | 6,25 | 6,397 | 0,04163 | 90,68 | 28 de 28 | 0 |
| Q4_K_M (llama.cpp) | 4,91 | 5,028 | 0,04034 | 89,59 | 28 de 28 | 0 |

Las métricas de KL y top-1 se calculan sobre 8.184 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano. El conjunto de evaluación de respuestas consta de 28 preguntas y no se detalla su composición en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/DRAM: 6,40 GB empaquetados para los pesos BFP4; el checkpoint en safetensors ocupa 16,4 GB en disco porque almacena los valores en bf16.
- Hardware objetivo: NPUs Tenstorrent Tensix, arquitecturas Wormhole y Blackhole, mediante tt-metal/ttnn.
- Validación: probado con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent; el autor indica que no se ha ejecutado en hardware real.
- GPU consumer: no es el objetivo del artefacto; puede cargarse en transformers con `device_map="auto"` en bf16, lo que requiere aproximadamente 16 GB de VRAM (por ejemplo, RTX 4090 de 24 GB o A100/H100 para mayor margen).
- Opciones de despliegue: tt-metal/ttnn (vía tt-transformers, con `--use_hf_rope --instruct 0`), tt-forge (tt-xla, aún no probado con este checkpoint), transformers con safetensors.
- Latencia y throughput: no disponibles; el autor no publica cifras de rendimiento en hardware, solo una verificación de prefill de 2 capas con PCC 0,9990 frente a transformers.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| **Qwen3-8B-Base-Tensix-BFP4** | 8,19B | no disponible | BFP4 (6,25 bits/peso) | 6,40 GB | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3-8B-Base (BF16) | 8,19B | no disponible | bf16 | 16,38 GB | Apache-2.0 | GPU/CPU |
| Q4_K_M de Qwen3-8B-Base (llama.cpp) | 8,19B | no disponible | 4,91 bits/peso | 5,03 GB | Apache-2.0 | CPU/GPU (llama.cpp) |

El modelo se posiciona frente a la variante BF16 del mismo base y frente a una cuantización Q4_K_M genérica de llama.cpp. Su ventaja es la integración exacta con TT-NN y una pérdida de calidad medida (KL 0,04163, top-1 90,68 %) comparable a Q4_K_M (KL 0,04034, top-1 89,59 %) con un tamaño ligeramente mayor.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no sigue instrucciones ni mantiene conversaciones de forma fiable; requiere prompts de continuación.
- No se ha ejecutado en hardware Tensix real, solo en el simulador `ttsim` con ttnn 0.81.1; el rendimiento en silicio no está verificado.
- El demo de tt-transformers no se ejecutó de extremo a extremo; solo se validó el prefill de 2 capas.
- tt-forge (tt-xla) no se ha probado con este checkpoint.
- El LM head en bf16 no es exacto en el demo de tt-transformers, que empaqueta la cabeza en bfloat8_b.
- La calibración se limitó a inglés y coreano; el comportamiento en otros idiomas no está documentado.
- Riesgo de alucinación inherente al modelo base, sin mitigaciones específicas.
- Sesgos heredados de los datos de preentrenamiento de Qwen3-8B-Base, no evaluados en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Paper de referencia Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia: https://huggingface.co/Xylolabs/Qwen3-8B-Base-Tensix-BFP4/blob/main/LICENSE
