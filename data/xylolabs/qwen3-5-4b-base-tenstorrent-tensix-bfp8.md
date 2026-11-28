# Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8 es una cuantización de los pesos del modelo base Qwen/Qwen3.5-4B-Base, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de formato que aplica quantización de bloque en coma flotante (block floating point, BFP) sobre las matrices de atención, MLP y DeltaNet, dejando el resto de tensores en bf16 o float32. El objetivo es que el modelo pueda ejecutarse de forma nativa en el hardware de Tenstorrent mediante las pilas tt-metal, ttnn y tt-forge.

El repositorio agrupa dos formatos en carpetas separadas: `bfp8/` (bfloat8_b para atención, DeltaNet y MLP) y `bfp4/` (bfloat4_b para atención, MLP y DeltaNet salvo las proyecciones a/b de DeltaNet, que quedan en bfloat8_b). El modelo base tiene 5.295.564.288 parámetros reales según los safetensors, aunque se comercializa bajo la etiqueta "4B". La licencia es Apache 2.0, heredada del modelo original.

La relevancia de esta ficha es doble: por un lado documenta una de las primeras conversiones públicas de un Qwen3.5 a formato BFP para aceleradores Tenstorrent; por otro, sirve como referencia práctica de cuantización alternativa a GGUF/Q4_K_M, con métricas de divergencia KL publicadas frente a BF16 y frente a llama.cpp. El pipeline declarado es image-text-to-text, coherente con la naturaleza multimodal del Qwen3.5 base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas DeltaNet (híbrida atención/DeltaNet), según los nombres de módulos del repo; detalles completos no disponibles |
| Parametros totales | 5.295.564.288 |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (bfloat8_b) y BFP4 (bfloat4_b) con block floating point; además BF16 de referencia y Q4_K_M para comparación |
| Idiomas soportados | No disponible (la evaluación KL usa inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con index.json y quant4.json que describen el formato por capa); no se publican GGUF en este repo |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3.5-4B-Base, del equipo Qwen (citado como "Qwen3.5: Towards Native Multimodal Agents", febrero de 2026). La información disponible en esta ficha no incluye detalles del entrenamiento original (número de tokens, composición del dataset, RLHF/DPO). Lo que sí se deduce de los nombres de módulos del repositorio es que la arquitectura combina bloques de atención con bloques DeltaNet, un mecanismo de atención lineal recurrente. Las matrices cuantizadas cubren atención, MLP y DeltaNet; las proyecciones a/b de DeltaNet se mantienen en bfloat8_b incluso en la carpeta bfp4 para preservar estabilidad numérica.

La innovación técnica de esta publicación no está en el modelo, sino en el pipeline de cuantización: block floating point con formato bfloat8_b y bfloat4_b, empaquetado específico para Tensix, y scripts `pack_tensix.py` y `verify_grid.py` que permiten empaquetar y verificar round-trip en dispositivo. La model card reporta KL media frente a BF16 sobre 8.188 posiciones de texto en inglés (WikiText-2 test) y coreano (Wikipedia en coreano): 0.00072 para bfp8 y 0.03398 para bfp4, frente a 0.02929 de Q4_K_M de llama.cpp. El límite de aceptación declarado es 1,5 veces el KL de Q4_K_M.

## Capacidades

- Generación de texto autoregresiva: es un modelo base (no instruction-tuned), por lo que continúa texto en lugar de seguir instrucciones.
- Procesamiento image-text-to-text según el pipeline declarado, heredado del Qwen3.5 base; no se detalla en la model card qué tareas multimodales concretas cubre.
- Razonamiento y código: capacidades heredadas del base Qwen3.5-4B, no verificadas de forma independiente en esta ficha.
- Soporte multilingüe: no documentado; la evaluación KL usa inglés y coreano, lo que sugiere cobertura al menos de esos idiomas.
- Tool calling / function calling: no confirmado para este checkpoint base; el template de chat se conserva pero el modelo no está alineado.
- Capacidades de agente y multi-step reasoning: no confirmadas para la variante base.
- Ejecución nativa en NPU Tensix (Wormhole, Blackhole) mediante ttnn/tt-metal, con verificación de round-trip incluida.

## Casos de uso

- Despliegue en hardware Tenstorrent: cargar la carpeta `bfp8/` en una NPU Wormhole o Blackhole para servir inferencia de un LLM de ~5,3B parámetros sin GPU NVIDIA, usando tt-metal y ttnn como runtime.
- Evaluación de cuantización BFP frente a GGUF: comparar la divergencia KL publicada (0.00072 en bfp8, 0.03398 en bfp4) con Q4_K_M (0.02929) para decidir qué formato usar en un pipeline de producción en Tensix.
- Investigación en aceleradores alternativos: usar el repo como referencia reproducible para estudiar el impacto de block floating point en capas de atención y DeltaNet, con scripts de empaquetado y verificación incluidos.
- Prototipado de modelos multimodales en silicio no NVIDIA: aprovechar el pipeline image-text-to-text del base para experimentar con cargas de trabajo visión-lenguaje en NPU.
- Generación de texto en entornos de bajo consumo: emplear bfp4 (3,283 GB empaquetados) para escenarios donde el presupuesto de memoria DRAM de la NPU es ajustado, aceptando mayor degradación de calidad.
- Base para fine-tuning posterior: al ser un checkpoint base con licencia Apache 2.0, sirve como punto de partida para adaptaciones de dominio antes de volver a cuantizar a BFP.
- Benchmarking interno de toolchains: validar la madurez de tt-forge/ttnn frente a vLLM o llama.cpp en tareas de generación de texto comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de fidelidad de cuantización:

| Formato | Tamano empaquetado (GB) | KL media vs BF16 |
|---|---|---|
| bfp4 | 3.283 | 0.03398 |
| bfp8 | 5.065 | 0.00072 |
| BF16 (referencia) | 8.41 | 0 |
| Q4_K_M (llama.cpp) | 2.783 | 0.02929 |

La KL se mide sobre 8.188 posiciones de WikiText-2 test (inglés) y Wikipedia en coreano, en texto plano. El criterio de aceptación es no superar 1,5 veces el KL de Q4_K_M; bfp8 lo cumple con margen amplio, bfp4 queda ligeramente por encima del de Q4_K_M pero dentro del umbral.

## Requisitos de hardware

- VRAM/DRAM: el repo completo ocupa 17,7 GB; la carpeta bfp8 empaquetada son 5,065 GB y la bfp4, 3,283 GB. El BF16 de referencia son 8,41 GB. La memoria efectiva en dispositivo depende del empaquetado Tensix y del grafo desplegado, no disponible.
- GPU recomendadas: no aplica; el destino es NPU Tensix de Tenstorrent (Wormhole, Blackhole). El ejemplo de la model card usa `AutoModelForCausalLM` en `bfloat16` con `device_map="auto"`, por lo que también puede cargarse en GPU convencional como referencia, aunque no es el objetivo del repo.
- GPU de consumo: no es el caso de uso; en GPU NVIDIA consumer cabría en BF16 (8,41 GB) o cuantizado, pero no se han validado rendimientos en esa ruta.
- Opciones de despliegue: tt-metal/ttnn/tt-forge en Tensix; transformers para carga de referencia; llama.cpp solo como referencia comparativa de cuantización (Q4_K_M), no como formato publicado aquí.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Destino |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8 | 5.295.564.288 | No disponible | BFP8 / BFP4 | Apache 2.0 | NPU Tensix |
| Qwen/Qwen3.5-4B-Base (BF16) | 5.295.564.288 | No disponible | BF16 | Apache 2.0 | GPU/CPU genérica |
| Qwen3.5-4B-Base en Q4_K_M (llama.cpp) | 5.295.564.288 | No disponible | Q4_K_M | Apache 2.0 | CPU/GPU consumer |
| Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP4 (absorbido en este repo) | 5.295.564.288 | No disponible | BFP4 | Apache 2.0 | NPU Tensix |

No se dispone de comparación con otros modelos de tamaño similar (p. ej. Llama 3.2 3B, Gemma 2 4B) en la información proporcionada, por lo que la comparativa se limita a variantes del mismo base.

## Limitaciones y advertencias

- Es un modelo base, no instruction-tuned: no sigue instrucciones ni mantiene formato de chat de forma fiable, aunque conserve el template del tokenizer.
- La cuantización BFP4 introduce una divergencia KL (0,03398) superior a la de Q4_K_M (0,02929); para tareas sensibles a la precisión conviene usar bfp8 o BF16.
- La evaluación de fidelidad solo cubre inglés y coreano sobre 8.188 posiciones; el comportamiento en otros idiomas y en dominios especializados no está verificado.
- No hay benchmarks de tareas publicados, por lo que no puede afirmarse rendimiento en razonamiento, código o matemáticas a partir de esta ficha.
- El repo está diseñado para Tensix; usarlo en GPU o CPU requiere cargar los safetensors como bf16, lo que anula la ventaja de compresión y no está soportado oficialmente por el autor.
- Sesgos y alucinaciones: no documentados en esta ficha; se heredan los del Qwen3.5-4B-Base original.
- Licencia Apache 2.0 permite uso comercial, pero cada carpeta lleva su propio LICENSE y NOTICE; conviene revisarlos antes de redistribuir.
- El pipeline declarado es image-text-to-text, pero no se detalla en la model card qué modalidades concretas procesa ni con qué calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
