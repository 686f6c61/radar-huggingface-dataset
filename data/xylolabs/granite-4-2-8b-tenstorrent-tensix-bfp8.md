# Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP8

## Resumen

Granite-4.2-8b-Tenstorrent-Tensix-BFP8 es una cuantización del modelo ibm-granite/granite-4.2-8b de IBM, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa del original (8.791.592.960 parámetros totales) pero sustituye las matrices de las capas lineales por pesos cuantizados en formato block-floating-point de 8 bits (bfloat8_b) mediante GPTQ, de forma que TT-NN puede empaquetarlos sin alterar sus valores.

La relevancia de esta ficha radica en que es un ejemplo poco habitual de cuantización dirigida a hardware no-GPU: en lugar de apuntar a llama.cpp, vLLM o GPUs NVIDIA, el checkpoint está pensado para el stack tt-metal/ttnn de Tenstorrent. El resultado es un modelo de aproximadamente 9,20 bits por peso (10,11 GB empaquetados) que mantiene una divergencia muy baja respecto al BF16 original (KL medio de 0,00487 y top-1 del 97,82 %), muy por encima de una cuantización Q4_K_M convencional.

El modelo mantiene la licencia Apache 2.0 del original y soporta doce idiomas (inglés, alemán, español, francés, japonés, portugués, árabe, checo, italiano, coreano, neerlandés y chino). Es una opción interesante para quienes despliegan Granite 4.2 en aceleradores Tenstorrent y necesitan reducir el uso de memoria de dispositivo sin renunciar a la fidelidad numérica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en ibm-granite/granite-4.2-8b), con capas lineales cuantizadas a bfloat8_b |
| Parametros totales | 8.791.592.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BFP8 (bfloat8_b) en atención q/k/v/o y MLP gate/up/down de 40 capas; bf16 en LM head, embeddings, norms y resto de tensores; media de 9,20 bits por peso |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), empaquetable en tt-metal/ttnn; existe variante BFP4 del mismo autor |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Granite 4.2 de 8B de IBM: un transformer denso con 40 capas, atención con multiplicador de escala específico de Granite (1/128 en lugar del 1/sqrt(128) de Llama) y pesos en bf16. Xylolabs no reentrena el modelo; aplica una cuantización GPTQ sobre las proyecciones lineales (q, k, v, o y gate, up, down) calibrada con 65.536 tokens de WikiText-2 y de Wikipedia en coreano, manteniendo el exponente compartido de cada bloque tal como lo fija el empaquetador de Tenstorrent. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que el empaquetado en TT-NN no modifica su valor numérico.

La innovación técnica principal es el uso de block-floating-point de 8 bits con GPTQ para hardware Tensix, un formato que TT-NN consume de forma nativa. El autor documenta verificaciones de empaquetado matriz a matriz (`pack_tensix.py`, `verify_grid.py`) y advierte de que tt-transformers (tt-metal v0.81.1) no es utilizable con este modelo porque carece de soporte para Granite y trata el checkpoint como Llama, ignorando el multiplicador de atención (PCC de 0,95 en prefill de 2 capas). tt-forge (tt-xla) aún no se ha probado con este checkpoint. No se dispone de información sobre el proceso de entrenamiento original (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y continuaciones de contexto largo, heredadas del modelo base Granite 4.2-8b.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado con 33 prompts cortos con comprobación automática).
- Capacidades multilingües en doce idiomas, con calibración específica para inglés y coreano.
- Compatibilidad con el chat template de transformers (`apply_chat_template`).
- Empaquetado y ejecución en NPU Tensix (Wormhole, Blackhole) mediante tt-metal/ttnn.
- Verificación numérica de pesos empaquetados (round-trip a través de DRAM de dispositivo).
- Capacidades de tool calling, agentes, código o matemáticas: no disponibles en la información proporcionada (dependen del modelo base y no se documentan en esta ficha).

## Casos de uso

- Despliegue de Granite 4.2-8b en aceleradores Tenstorrent Wormhole o Blackhole: el checkpoint está empaquetado para TT-NN y ocupa unos 10,11 GB de memoria de dispositivo solo en pesos del modelo de lenguaje, lo que permite ejecutar el modelo en NPU sin GPU.
- Inferencia con restricción de memoria en Tensix: frente al BF16 (17,58 GB), esta versión reduce el peso a casi la mitad con una pérdida de fidelidad mínima (KL medio de 0,00487), útil cuando el presupuesto de DRAM del dispositivo es ajustado.
- Servicio de generación de texto conversacional multilingüe: el modelo cubre doce idiomas y puede integrarse en un endpoint compatible con transformers para asistentes en producción.
- Evaluación y validación de pipelines de cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que el empaquetado BFP8 no altera los valores, lo que resulta útil en flujos de CI para cuantizaciones destinadas a hardware específico.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible de GPTQ sobre la rejilla bfloat8_b, con métricas KL y top-1 publicadas frente a BF16 y Q4_K_M.
- Prototipado en el simulador ttsim de Blackhole: el autor verificó el empaquetado con ttnn 0.81.1 en el simulador, lo que permite desarrollar y depurar sin hardware físico.
- Comparación de fidelidad entre formatos (BFP8 frente a BFP4): el mismo autor publica una variante BFP4 para dispositivos con menos memoria, lo que facilita estudios de compromiso entre tamaño y calidad.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL medio vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (ibm-granite/granite-4.2-8b) | 16 | 17,58 | 0 | 100 | 28 de 33 | - |
| **Este modelo (BFP8)** | 9,20 | 10,112 | 0,00487 | 97,82 | 28 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,86 | 5,348 | 0,14751 | 85,64 | 28 de 33 | 3 |

Las métricas KL y top-1 cubren 16.216 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con chat template. Las respuestas corresponden a 33 prompts cortos con comprobación automática. La Q4_K_M se generó con llama.cpp v0.9.0 (`cd959bae`) sin importance matrix. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 10,11 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- GPU consumer: no es el objetivo del checkpoint; aunque la carga con transformers en bf16 es posible, el beneficio de la cuantización está ligado a TT-NN.
- Despliegue: transformers (`AutoModelForCausalLM.from_pretrained` con `dtype="bfloat16"` y `device_map="auto"`) para carga genérica; tt-metal/ttnn (ttnn 0.81.1 verificado en el simulador ttsim) para ejecución en Tensix; tt-forge (tt-xla) aún no probado con este checkpoint; tt-transformers no es compatible con Granite.
- Variante para menos memoria: BFP4 del mismo autor, para dispositivos con DRAM insuficiente para BFP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP8 | 8,79 B | No disponible | BFP8 (9,20 bits/peso) | Apache 2.0 | Hugging Face, orientado a Tensix |
| ibm-granite/granite-4.2-8b (BF16) | 8,79 B | No disponible | BF16 (16 bits/peso) | Apache 2.0 | Hugging Face, propósito general |
| Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4 | 8,79 B | No disponible | BFP4 | Apache 2.0 | Hugging Face, para dispositivos con menos DRAM |
| Q4_K_M de llama.cpp (mismo checkpoint) | 8,79 B | No disponible | 4,86 bits/peso | Apache 2.0 | Generado por el autor para comparación |

## Limitaciones y advertencias

- Orientado a hardware Tensix: el rendimiento y la fidelidad documentados asumen empaquetado en TT-NN; en GPU el checkpoint se carga en bf16 sin aprovechar la cuantización.
- tt-transformers no soporta Granite y produce resultados incorrectos (PCC de 0,95 en prefill de 2 capas) por ignorar el multiplicador de atención de 1/128.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; su comportamiento con los pesos cuantizados no está verificado.
- La calibración GPTQ se realizó con WikiText-2 y Wikipedia en coreano, por lo que la fidelidad en otros dominios o idiomas no está medida.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones adicionales.
- Sesgos conocidos del modelo base: no disponibles en la información proporcionada.
- Longitud de contexto del modelo base: no disponible en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y del stack tt-metal.
- El repositorio tiene 63 descargas y 0 likes en el momento de la consulta, lo que indica adopción temprana y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-8b
- Variante BFP4: https://huggingface.co/Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-4.2-8b-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
