# Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3.6-27B-Tenstorrent-Tensix-BFP4 es una cuantización del modelo multimodal Qwen3.6-27B de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.6-27B —transformer híbrido con capas de atención clásica y capas Gated DeltaNet, además de un módulo visual y un módulo MTP (multi-token prediction)— pero sustituye las proyecciones lineales del modelo de lenguaje por tensores empaquetados en formato `ttnn.bfloat4_b` (BFP4, block floating point de 4 bits con exponente compartido por bloque).

La motivación del export es puramente de despliegue: los pesos cuantizados se almacenan como valores bf16 situados exactamente sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin alterar sus valores. Esto reduce el peso del modelo de lenguaje a unos 18,79 GB empaquetados (5,59 bits por peso de media) frente a los aproximadamente 55,6 GB del repositorio completo en bf16, permitiendo ejecutar un modelo de 27.781 millones de parámetros en hardware Tensix con memoria de dispositivo limitada.

El checkpoint es relevante porque demuestra una vía práctica de cuantización GPTQ orientada a aceleradores no-GPU, un nicho poco cubierto por las herramientas habituales (que asumen CUDA o ROCm). La licencia Apache-2.0 y el pipeline `image-text-to-text` lo sitúan como una opción para inferencia multimodal en entornos con QuietBox o placas Blackhole.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención clásica (16 capas) + Gated DeltaNet (48 capas), con módulo visual y módulo MTP |
| Parámetros totales | 27.781.427.952 (27,78 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso en proyecciones lineales); bf16 en embeddings, LM head, normas, módulo visual y MTP |
| Idiomas soportados | no disponible (calibración GPTQ con WikiText-2 y Wikipedia en coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con índice `model.safetensors.index.json` y mapa de formatos `quant4.json`) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B emplea una arquitectura híbrida: 16 capas con atención multi-cabeza convencional (proyecciones q, k, v, o) y 48 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), más 64 capas de MLP con proyecciones gate, up y down. Incorpora además un módulo visual (para la tarea `image-text-to-text`) y un módulo `mtp` de predicción multi-token. En este export de Xylolabs, todas esas proyecciones lineales se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resto de tensores (embeddings, LM head, normas, `visual` y `mtp`) permanecen en bf16 sin cambios respecto al modelo base.

La innovación técnica clave es el empaquetado exacto: los valores cuantizados se guardan como bf16 sobre la rejilla BFP4, de forma que TT-NN los convierte a `bfloat4_b` sin pérdida adicional. El autor verifica esta propiedad con `pack_tensix.py` (comprueba cada matriz, opcionalmente con round-trip por DRAM del dispositivo) y `verify_grid.py` (validación de la rejilla solo con torch). Los mismos valores también empaquetan de forma exacta en `ttnn.bfloat8_b`. No se detalla en la información disponible si hubo RLHF, DPO u otras fases de alineamiento en el modelo base.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de `AutoModelForCausalLM` en transformers.
- Procesamiento multimodal imagen-texto, según el pipeline declarado `image-text-to-text` y la presencia del módulo `visual`.
- Predicción multi-token mediante el módulo `mtp`, orientada a decodificación especulativa o generación acelerada.
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo base Qwen3.6-27B, aunque no se documentan evaluaciones específicas en este checkpoint.
- Despliegue en NPU Tensix (Wormhole y Blackhole) mediante TT-NN, con empaquetado directo de pesos BFP4.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags) para servir el modelo a través de infraestructura estándar.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.

## Casos de uso

- Inferencia multimodal en hardware Tenstorrent: el checkpoint está pensado para ejecutarse en placas Blackhole o Wormhole con TT-NN, aprovechando que los pesos BFP4 se empaquetan sin cambios de valor y caben en unos 18,79 GB de memoria de dispositivo para el modelo de lenguaje.
- Despliegue en QuietBox 2 con paralelismo tensorial: el demo `qwen38_27b_qb2` de tt-metal v0.81.1 reparte el modelo en cuatro chips Blackhole y admite este checkpoint con `QWEN_PRECISION_CONFIG=baseline`, lo que permite servir un modelo de 27B en un nodo de cuatro NPU.
- Validación de pipelines de cuantización GPTQ para aceleradores no-GPU: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que cada matriz cuantizada conserva exactamente sus valores al empaquetarse, útil en equipos que integran quantización en su cadena de CI.
- Prototipado de asistentes conversacionales sobre transformers: el quickstart con `AutoModelForCausalLM` y `device_map="auto"` permite probar el modelo en GPU o CPU antes de portarlo a Tensix, manteniendo la misma tokenizer y plantilla de chat.
- Investigación en decodificación especulativa: el módulo `mtp` en bf16, sin cuantizar, habilita experimentos de predicción multi-token sobre el modelo cuantizado sin degradar la cabeza de predicción.
- Evaluación comparativa de precisión BFP4 frente a bf16: el autor reporta métricas de divergencia KL y top-1 frente al modelo BF16, lo que permite usar el checkpoint como referencia en estudios de robustez de cuantización de 4 bits en modelos híbridos atención/DeltaNet.
- Serving de imagen-texto en entornos con restricciones de memoria: al mantener el módulo visual en bf16 y comprimir solo el lenguaje, se puede atender entrada visual con calidad intacta y coste de memoria reducido en el decodificador.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial (truncada en la información disponible) que compara el checkpoint BFP4 con el modelo BF16 en bits por peso, tamaño, divergencia KL media, top-1 y respuestas correctas/perdidas. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni valores numéricos completos de esa tabla.

| Métrica | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Divergencia KL media vs BF16 | no disponible (tabla truncada) |
| Top-1 vs BF16 | no disponible (tabla truncada) |

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 18,79 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Configuración multi-chip: el demo `qwen38_27b_qb2` requiere cuatro chips Blackhole (QuietBox 2) con paralelismo tensorial y rechaza otro hardware.
- Configuración alternativa: el demo `qwen36` de tt-metal lista Qwen3.6-27B para P150x4 o P150x8.
- GPU de consumo: no disponible; el checkpoint está diseñado para Tensix, no para CUDA.
- Despliegue en GPU/CPU: posible vía transformers con `dtype="bfloat16"` y `device_map="auto"`, pero el repositorio ocupa 55,6 GB, por lo que requiere memoria acorde o descarga parcial.
- Frameworks de despliegue: TT-NN (ttnn 0.81.1, validado en el simulador ttsim), tt-metal v0.81.1, tt-forge (tt-xla, aún no probado con este checkpoint) y transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP4 | 27,78 mil millones | no disponible | BFP4 (4,5 bits/peso) | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| Qwen/Qwen3.6-27B (base) | 27,78 mil millones | no disponible | bf16 | Apache-2.0 | GPU/CPU genérico |
| Qwen3.8-27B (referencia del demo tt-metal) | no disponible | no disponible | bfloat4_b / bfloat8_b según config | no disponible | Blackhole (QuietBox 2) |

La comparación con otras cuantizaciones de 4 bits para GPU (GPTQ, AWQ, GGUF Q4) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el módulo visual y el MTP no fueron evaluados en este checkpoint.
- El autor advierte de que no se ha probado una ejecución completa en el demo `qwen38_27b_qb2`; solo se verificó el empaquetado exacto de las proyecciones de las capas 0 y 3.
- El demo `qwen36` de tt-metal no se ha probado con este checkpoint.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint.
- tt-transformers no soporta esta arquitectura, lo que limita las vías de despliegue estándar.
- La calibración GPTQ se hizo con WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo de dominio e idioma en la cuantización.
- La tabla de evaluación está truncada en la información disponible, por lo que no se pueden confirmar los niveles de degradación frente a BF16.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Longitud de contexto e idiomas soportados no documentados; conviene verificar la model card del modelo base antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero las dependencias de TT-NN y tt-metal pueden tener sus propias condiciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-27B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo tt-metal `qwen38_27b_qb2` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/qwen38_27b_qb2
- Demo tt-metal `qwen36` (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/blackhole/qwen36
