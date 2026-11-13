# Xylolabs/Phi-4-reasoning-Tensix-BFP4-MLP

## Resumen

Phi-4-reasoning-Tensix-BFP4-MLP es una exportación cuantizada del modelo microsoft/Phi-4-reasoning, preparada por Xylolabs para su ejecución en NPUs Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer denso de 14.660 millones de parámetros (14,66 B) especializado en razonamiento, desarrollado por Microsoft Research. Esta versión mantiene la estructura del modelo original pero sustituye los pesos de las capas lineales por formatos de coma flotante por bloques propios del stack TT-NN: BFP4 (bfloat4_b) para las proyecciones MLP y BFP8 (bfloat8_b) para las proyecciones de atención.

La motivación de esta ficha es práctica: el checkpoint reduce el peso de los pesos del modelo de lenguaje de 29,32 GB en bf16 a 11,03 GB empaquetados, con una media de 6,02 bits por peso. Esto permite desplegar un modelo de razonamiento de casi 15 B parámetros en hardware Tensix con un coste de memoria muy inferior al de la versión completa, manteniendo una fidelidad numérica alta respecto al original (KL medio de 0,015808 sobre 14.528 posiciones de texto inglés y coreano).

El checkpoint está publicado en formato LlamaForCausalLM (layout Llama), con las matrices fusionadas q/k/v y gate-up del Phi-4 original separadas en proyecciones independientes sin alterar sus valores. La licencia es MIT, heredada del modelo base, y el repo ocupa 29,3 GB en Hugging Face. Está pensado específicamente para el ecosistema Tenstorrent, no para GPU convencionales, aunque los pesos pueden cargarse con transformers en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-4), exportado en layout LlamaForCausalLM |
| Parámetros totales | 14.659.507.200 (14,66 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | BFP4 (bfloat4_b, 4,5 bits/peso) en MLP; BFP8 (bfloat8_b, 8,5 bits/peso) en atención; bf16 en embeddings, LM head y normas; media de 6,02 bits/peso |
| Idiomas soportados | Inglés (campo `language: en`); la calibración de GPTQ usó también Wikipedia en coreano |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 29,3 GB); tensores empaquetables directamente en TT-NN (`ttnn.bfloat4_b` / `ttnn.bfloat8_b`) |
| Memoria de dispositivo requerida | ~11,03 GB para pesos del modelo de lenguaje, más KV cache y buffers |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Phi-4-reasoning de Microsoft: un transformer denso con 40 capas, proyecciones de atención q, k, v y o, y un MLP con compuertas gate, up y down. El export de Xylolabs reorganiza las matrices fusionadas originales (qkv y gate-up) en proyecciones separadas, conservando exactamente los mismos valores, y las almacena en el layout Llama para que `transformers` pueda cargarlas con `AutoModelForCausalLM`.

El proceso de cuantización combina dos técnicas. Las matrices MLP (gate, up y down de las 40 capas) se cuantizan a BFP4 mediante GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Las matrices de atención (q, k, v, o de las 40 capas) se cuantizan a BFP8 mediante redondeo al par más cercano (round to nearest). El resto de tensores (embeddings, LM head, normas) permanecen en bf16 como en el modelo base. Los tensores cuantizados se almacenan como valores bf16 sobre la rejilla BFP4 o BFP8, de modo que TT-NN los empaqueta sin modificar sus valores. El archivo `quant4.json` documenta el formato de cada proyección.

El modelo base Phi-4-reasoning incorpora un modo de razonamiento que genera un bloque de pensamiento (`<think>`) antes de la respuesta final. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no se recogen en la información disponible para esta ficha.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat compatible con el template original de Microsoft.
- Razonamiento multi-paso con modo thinking: el modelo escribe un bloque `<think>` antes de la respuesta, adecuado para problemas matemáticos y lógicos.
- Razonamiento matemático y resolución de problemas de tipo GSM8K y similares, heredado del Phi-4-reasoning base.
- Generación y explicación de código, incluyendo tareas de programación de nivel medio.
- Respuestas a preguntas factuales cortas (el check de 33 prompts del autor incluye este tipo de consultas).
- Capacidad multilingüe limitada: oficialmente solo inglés; la calibración incluyó coreano, pero no hay garantía de calidad en otros idiomas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no confirmado en esta exportación; el modo thinking del modelo base es el principal mecanismo de razonamiento multi-paso.
- Capacidades de visión o audio: no disponibles (modelo puramente textual).
- Compatibilidad con text-generation-inference y endpoints compatibles (tag `endpoints_compatible`).

## Casos de uso

- Razonamiento matemático asistido: el modelo puede resolver problemas de varios pasos usando el bloque `<think>` antes de responder, útil en herramientas educativas o de verificación de cálculos.
- Despliegue en NPUs Tenstorrent: al estar cuantizado a BFP4/BFP8 y empaquetado para TT-NN, encaja directamente en Wormhole o Blackhole con ~11 GB de DRAM de dispositivo, permitiendo inferencia local sin GPU.
- Investigación en cuantización de bajo bit: sirve como referencia reproducible para estudiar el impacto de BFP4 GPTQ frente a Q4_K_M de llama.cpp (KL medio 0,015808 frente a 0,011492).
- Evaluación de fidelidad numérica: el script `pack_tensix.py` permite verificar que cada matriz empaquetada no cambia de valor, útil en pipelines de validación de exportaciones cuantizadas.
- Asistente conversacional en inglés para entornos con hardware Tensix: conversaciones multi-turno usando la plantilla de chat original y los ajustes de muestreo recomendados (temperatura 0,8, top_k 50, top_p 0,95).
- Generación de código en entornos de desarrollo con aceleradores Tenstorrent: el modelo puede integrarse en flujos de autocompletado o explicación de código, siempre que el hardware objetivo sea Tensix o se cargue en bf16 con transformers.
- Pruebas de regresión de modelos cuantizados: el check de 33 prompts con comprobación automática permite comparar respuestas correctas entre BF16, esta exportación y Q4_K_M.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (microsoft/Phi-4-reasoning) | 16 | 29,32 | 0 | 100 | 8 de 33 | - |
| **Esta exportación (BFP4 MLP / BFP8 atención)** | 6,02 | 11,034 | 0,015808 | 94,13 | 7 de 33 | 1 |
| Q4_K_M (llama.cpp) | 4,94 | 9,059 | 0,011492 | 94,42 | 7 de 33 | 0 |

Notas metodológicas del autor: KL y top-1 se calculan sobre 14.528 posiciones de texto inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en texto plano y con la plantilla de chat de Microsoft sin bloque de pensamiento. Las respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 pero incorrectas o rotas en esta exportación, sin contar empates cercanos. El check de 33 prompts usa decodificación greedy con prefijo `<think></think>` vacío; BF16 acierta solo 8 de 33 en esas condiciones, y con thinking activado BF16 no respondió correctamente a ninguno de los 7 prompts de razonamiento. No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: ~11,03 GB para los pesos del modelo de lenguaje en el dispositivo, más espacio para KV cache y buffers. El repo completo en disco ocupa 29,3 GB.
- Hardware objetivo: NPUs Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole, con el stack tt-metal / TT-NN (verificado con ttnn 0.81.1 sobre el simulador ttsim de Blackhole).
- GPU convencionales: los pesos pueden cargarse con `transformers` en bf16 con `device_map="auto"`, pero la cuantización BFP4/BFP8 está pensada para TT-NN; no hay datos de rendimiento en GPU.
- Consumer GPU: no disponible; no se han publicado estimaciones de VRAM para RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: TT-NN / tt-metal (empaquetado nativo con `ttnn.as_tensor`), `transformers` para carga en bf16, text-generation-inference (tag `endpoints_compatible`). tt-transformers y tt-forge no se han probado con este checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Bits/peso | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Esta exportación (BFP4 MLP / BFP8 atención) | 14,66 B | No disponible | 6,02 | 11,03 GB | MIT | Hugging Face (Xylolabs) |
| microsoft/Phi-4-reasoning (BF16) | 14,66 B | No disponible | 16 | 29,32 GB | MIT | Hugging Face (Microsoft) |
| Q4_K_M (llama.cpp) | 14,66 B | No disponible | 4,94 | 9,06 GB | MIT (modelo base) | Conversión llama.cpp |

La comparación relevante es entre formatos del mismo modelo base: esta exportación sacrifica 0,86 puntos de top-1 frente a BF16 (94,13 % frente a 100 %) y pierde una respuesta correcta de 33, mientras que Q4_K_M de llama.cpp mantiene 94,42 % de top-1 y no pierde respuestas, con un tamaño algo menor (9,06 GB frente a 11,03 GB). La ventaja de esta exportación es el empaquetado directo en TT-NN sin recodificación, mientras que Q4_K_M está orientado a llama.cpp.

## Limitaciones y advertencias

- Idiomas: oficialmente solo inglés; la calibración usó coreano, pero no hay garantía de calidad fuera del inglés.
- Pérdida de precisión: 94,13 % de top-1 frente a 100 % de BF16 y una respuesta correcta perdida de 33 en el check del autor; no apto para tareas que exijan fidelidad numérica absoluta al modelo original.
- Modo thinking: el check de 33 prompts se realizó con prefijo `<think></think>` vacío; con thinking activado, BF16 no acertó ninguno de los 7 prompts de razonamiento, lo que sugiere fragilidad del modo de razonamiento en condiciones de decodificación greedy.
- Hardware: pensado para NPUs Tensix; no hay datos de rendimiento ni de latencia en GPU, y tt-transformers y tt-forge no se han probado con este checkpoint.
- Tool calling y agentes: no confirmados; no se recomienda asumir soporte de function calling en producción sin validación previa.
- Alucinación: no se han publicado evaluaciones específicas de tasas de alucinación para esta exportación.
- Licencia: MIT, heredada del modelo base, permite uso comercial, pero conviene revisar los términos del modelo original de Microsoft.
- Repo con 0 descargas y 0 likes en el momento de la ficha: ecosistema muy incipiente, sin validación comunitaria extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-reasoning
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-reasoning-Tensix-BFP4-MLP/blob/main/LICENSE
