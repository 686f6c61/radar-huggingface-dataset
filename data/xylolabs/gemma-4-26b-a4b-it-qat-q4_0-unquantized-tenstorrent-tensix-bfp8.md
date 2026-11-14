# Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen
Este repositorio contiene una exportación cuantizada del modelo multimodal `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` de Google, adaptada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). Se trata de un transformer de tipo mixture-of-experts con 26.544.133.710 parámetros totales y aproximadamente 4.000 millones de parámetros activos por token (según la nomenclatura A4B), orientado a tareas de imagen-texto-a-texto y conversación.

La particularidad del checkpoint es que las capas lineales del modelo de lenguaje se han cuantizado a `ttnn.bfloat8_b` (block floating point de 8 bits) mediante GPTQ, manteniendo el resto de tensores en bf16. El resultado ocupa 27,51 GB empaquetados con una media de 8,72 bits por peso, lo que permite cargar los pesos del modelo de lenguaje en memoria de dispositivo de las NPU de Tenstorrent sin reempaquetado en tiempo de ejecución.

Es relevante porque demuestra un flujo de cuantización específico para hardware no-GPU (Tenstorrent), con verificación de que los valores empaquetados en la rejilla BFP8 no se alteran al pasar por TT-NN, y porque publica una evaluación de degradación frente al modelo BF16 original en términos de KL y top-1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixto de expertos (MoE), multimodal imagen-texto; detalles de capas no disponibles más allá de 30 capas y 25 con atención V cuantizada |
| Parámetros totales | 26.544.133.710 (26,54 B) |
| Parámetros activos | Aproximadamente 4 B (según nomenclatura A4B del modelo base; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en capas lineales; bf16 en router, escalas por experto, LM head, embeddings, norms y torre de visión |
| Idiomas soportados | no disponible (la evaluación usa inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`), compatible con `transformers` |

## Arquitectura y entrenamiento
El modelo base es un transformer multimodal con mezcla de expertos (MoE) de Google, con 30 capas identificadas en la información disponible y una torre de visión (`vision_tower`, `embed_vision`) que se mantiene intacta en bf16. La exportación de Xylolabs no reentrena el modelo: aplica GPTQ sobre la rejilla `bfloat8_b` de TT-NN a las proyecciones de atención (q, k, o en 30 capas; v en 25 capas) y a las proyecciones del MLP, incluidas las de los expertos enrutados (gate, up, down). El router y las escalas por experto se conservan en bf16 para no degradar el enrutamiento.

La calibración de GPTQ se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El proceso mantiene el exponente compartido de cada bloque tal como lo fija el empaquetador de TT-NN, de modo que los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP8 y TT-NN los empaqueta sin modificar sus valores. El autor indica explícitamente que solo se cuantizó y evaluó el modelo de lenguaje, no la parte de visión. No se dispone de información sobre el dataset de preentrenamiento, el volumen de tokens ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades
- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Procesamiento de imagen y texto (`image-text-to-text`), con torre de visión conservada en bf16.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado con 33 prompts cortos con comprobación automática).
- Capacidad multilingüe: la evaluación incluye texto en inglés y coreano; el conjunto completo de idiomas no está documentado.
- Compatibilidad con `transformers` mediante `AutoModelForCausalLM` y `AutoTokenizer`.
- Ejecución en NPU Tenstorrent Tensix mediante TT-NN (`ttnn.bfloat8_b`), con utilidades de empaquetado y verificación.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modos de agente multi-paso.

## Casos de uso
- Despliegue en infraestructura Tenstorrent: el checkpoint está pensado para cargarse en NPU Wormhole o Blackhole con TT-NN, ocupando 27,51 GB de memoria de dispositivo solo para los pesos del modelo de lenguaje; encaja en entornos que ya operan con `tt-metal` y quieren servir un modelo multimodal sin GPU.
- Asistentes conversacionales multimodales: al conservar la torre de visión en bf16 y el pipeline `image-text-to-text`, permite construir interfaces de preguntas y respuestas sobre imágenes con plantilla de chat estándar de Gemma.
- Validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar matriz a matriz que el empaquetado BFP8 no altera los valores, útil para equipos que auditan la fidelidad de sus despliegues cuantizados.
- Servicio de inferencia en inglés y coreano: la evaluación KL y top-1 se realizó sobre WikiText-2 y Wikipedia en coreano, por lo que es una opción razonable para aplicaciones en esos idiomas con requisitos moderados de fidelidad.
- Investigación en eficiencia de hardware: sirve como referencia para comparar BFP8 (8,72 bits/peso, KL 0,00567) frente a Q4_0 de llama.cpp (4,57 bits/peso, KL 0,05293) sobre el mismo checkpoint base.
- Prototipado con `transformers` en CPU/GPU antes de portar a Tensix: el modelo se puede cargar con `AutoModelForCausalLM.from_pretrained(..., dtype="bfloat16", device_map="auto")` para validar prompts y plantillas antes de empaquetar en la NPU.
- Entornos con restricciones de memoria frente a la versión BF16: 27,51 GB frente a 50,47 GB del BF16 permiten ajustar el modelo en dispositivos con menos DRAM, y el autor remite a la variante BFP4 para hardware aún más limitado.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,72 | 27,513 | 0,00567 | 97,39 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,57 | 14,439 | 0,05293 | 91,55 | 33 de 33 | 0 |

KL y top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano) con la plantilla de chat. Las respuestas corresponden a 33 prompts cortos con comprobación automática. Q4_0 se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- Memoria de dispositivo: aproximadamente 27,51 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tenstorrent Tensix (Wormhole, Blackhole). Verificado con `ttnn` 0.81.1 sobre `ttsim`, el simulador de Blackhole.
- Para configuraciones con menos memoria, el autor recomienda la variante BFP4 (`Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP`).
- Despliegue en GPU/CPU: el checkpoint es cargable con `transformers` en bf16 (equivalente a ~50 GB de pesos si se materializa en bf16), por lo que requiere GPUs de 80 GB (A100/H100) o sharding multi-GPU con `device_map="auto"`.
- Opciones de despliegue: TT-NN (`tt-metal`, `ttnn`) para Tensix; `transformers` para validación. `tt-transformers` y `tt-forge` no se probaron con este checkpoint según el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 26B-A4B BFP8) | 26,54 B totales / ~4 B activos | no disponible | BFP8 (8,72 bits/peso) | Apache-2.0 | Tenstorrent Tensix |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized (BF16) | 26,54 B totales / ~4 B activos | no disponible | bf16 (16 bits/peso) | Apache-2.0 | GPU/CPU |
| Q4_0 del mismo checkpoint (llama.cpp) | 26,54 B totales / ~4 B activos | no disponible | Q4_0 (4,57 bits/peso) | Apache-2.0 | CPU/GPU |
| Variante BFP4 de Xylolabs | 26,54 B totales / ~4 B activos | no disponible | BFP4 | Apache-2.0 | Tenstorrent Tensix con menos memoria |

## Limitaciones y advertencias
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre de visión y `embed_vision` se mantienen en bf16 sin evaluación publicada de su comportamiento tras el proceso.
- La evaluación es limitada: 8.048 posiciones de KL/top-1 y 33 prompts cortos, insuficiente para caracterizar razonamiento, código o matemáticas.
- `tt-transformers` y `tt-forge` no se ejecutaron con este checkpoint; la validación se hizo con `ttnn` sobre simulador, no en silicio real según la información disponible.
- El modelo está atado a la rejilla BFP8 de TT-NN: los pesos se almacenan como bf16 sobre esa rejilla y el empaquetado asume ese formato, lo que limita su portabilidad a otros runtimes sin reconversión.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; deben asumirse los del modelo base de Google.
- Idiomas: solo se evidencia evaluación en inglés y coreano; el resto de idiomas no está documentado.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google antes de producción.
- El repositorio tiene 35 descargas y 0 likes en el momento de la ficha, lo que indica adopción muy temprana y poca validación comunitaria.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-MLP
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado (arXiv:2607.02770): no disponible como URL directa en la información proporcionada
