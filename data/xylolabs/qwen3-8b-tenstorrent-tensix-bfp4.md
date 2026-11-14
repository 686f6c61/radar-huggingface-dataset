# Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-8B-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo Qwen3-8B de Alibaba Qwen, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). La particularidad del modelo es que no se trata de una cuantización genérica para GPU, sino de un empaquetado en formato `ttnn.bfloat4_b` (block floating point de 4 bits, BFP4) pensado para que la pila de software TT-NN de Tenstorrent lo cargue directamente en el dispositivo sin transformaciones adicionales. El modelo mantiene los pesos cuantizados almacenados como valores bf16 sobre la rejilla BFP4, de forma que el empaquetado en TT-NN no altera su valor numérico.

El modelo conserva la arquitectura completa de Qwen3-8B: un transformer denso de 8.190.735.360 parámetros con 36 capas, capacidad de generación de texto, razonamiento y modo "thinking", y una ventana de contexto nativa de 32.768 tokens extensible hasta 131.072. La cuantización se aplica únicamente a las proyecciones lineales de atención (q, k, v, o) y MLP (gate, up, down), mientras que el LM head, los embeddings y las capas de normalización permanecen en bf16.

La relevancia de esta ficha es doble: por un lado, ofrece una vía concreta para desplegar un LLM de 8B en hardware de Tenstorrent con un consumo de memoria de dispositivo de aproximadamente 6,40 GB para los pesos del modelo de lenguaje; por otro, ilustra el estado del ecosistema de cuantización BFP4 para aceleradores no-GPU, un terreno donde las herramientas de GPU (GPTQ/AWQ para CUDA) no son directamente aplicables. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), 36 capas, atención con RoPE |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos, extensible a 131.072 (heredado de Qwen3-8B) |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en proyecciones lineales; bf16 en LM head, embeddings y normas; media de 6,25 bits por peso |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B soporta múltiples idiomas, pero la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con metadatos `quant4.json` y `model.safetensors.index.json`) |
| Tamano del repositorio | 16,4 GB |
| Memoria de dispositivo requerida | ~6,40 GB para pesos del LM, más KV cache y buffers |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) |
| Calibracion | GPTQ con búsqueda de exponente por bloque, 65.536 tokens de WikiText-2 y Wikipedia en coreano |

## Arquitectura y entrenamiento

El modelo base Qwen3-8B es un transformer denso de 36 capas con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU en el MLP. No incorpora mezcla de expertos (MoE) ni capas de atención lineal o SSM: es un transformer clásico optimizado para razonamiento y generación de texto. El modelo original fue entrenado por Alibaba Qwen con un corpus multilingüe de gran escala y posteriormente ajustado con RLHF y DPO; la model card de esta exportación no detalla el número exacto de tokens de entrenamiento ni la composición del dataset del modelo base.

La innovación técnica de esta exportación reside en el proceso de cuantización. Xylolabs aplica GPTQ sobre las matrices lineales de atención y MLP, con una búsqueda de exponente por bloque para ajustar la rejilla de punto flotante por bloques (block floating point). Los pesos resultantes se almacenan como valores bf16 situados exactamente sobre la rejilla BFP4, de modo que TT-NN los empaqueta sin pérdida adicional de precisión. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que cada matriz empaquetada coincide bit a bit con los valores originales. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano, lo que introduce un sesgo hacia esos dominios lingüísticos.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat (`apply_chat_template`).
- Razonamiento explícito en modo "thinking" (heredado de Qwen3), útil para problemas de lógica y matemáticas.
- Generación de código y razonamiento matemático, capacidades nativas del modelo base Qwen3-8B.
- Soporte de tool calling y function calling (capacidad del modelo base; no verificada específicamente en esta exportación cuantizada).
- Capacidades multilingües heredadas de Qwen3-8B, aunque la model card no especifica la lista de idiomas.
- Ejecución en NPU Tensix mediante TT-NN, con empaquetado directo de pesos BFP4.
- Compatibilidad con `transformers` para inferencia en GPU/CPU en bf16 (aunque el formato BFP4 solo se aprovecha en hardware Tensix).
- Compatibilidad con TT-Forge (tt-xla) en modo bf16 exacto; el modo `bfp_bf4` de TT-Forge no preserva el formato de 4,5 bits.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Permite ejecutar un LLM de 8B en Wormhole o Blackhole con ~6,40 GB de memoria de dispositivo para los pesos, liberando VRAM y aprovechando la NPU para inferencia de texto en entornos de borde o servidores con hardware Tenstorrent.
- Servicio de chat multi-turno con contexto largo: gracias a los 32.768 tokens nativos (extensibles a 131.072), el modelo puede gestionar conversaciones con historial extenso, documentos largos o sesiones de atención al cliente que requieran memoria de contexto amplia.
- Asistente de código en pipelines de CI/CD: el modelo base Qwen3-8B destaca en generación de código; esta exportación permite integrarlo en flujos automatizados de revisión de código o generación de tests sobre hardware Tensix, reduciendo la dependencia de GPU.
- Razonamiento matemático y resolución de problemas: el modo thinking de Qwen3 permite cadenas de razonamiento explícitas, adecuadas para tutoría automatizada o verificación de cálculos en entornos educativos.
- Prototipado e investigación en cuantización BFP4: el repositorio incluye scripts de verificación y metadatos (`quant4.json`) que lo convierten en un banco de pruebas para estudiar el impacto de la cuantización de 4,5 bits en un transformer de 8B.
- Evaluación de la pila TT-NN y TT-Forge: sirve como modelo de referencia para validar el rendimiento y la fidelidad numérica de las herramientas de Tenstorrent antes de desplegar modelos mayores.
- Inferencia en entornos con restricciones de memoria: con 6,40 GB de pesos empaquetados, es viable en dispositivos Tensix con DRAM limitada, donde un modelo de 8B en bf16 (16 GB) no cabría.

## Benchmarks y rendimiento

La model card de esta exportación incluye una sección de evaluación que comienza con una tabla de "Bits a weight" y "Size (GB)", pero el contenido de esa tabla no está disponible en la información proporcionada. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: ~6,40 GB para los pesos del modelo de lenguaje, más espacio para KV cache y buffers de inferencia.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole.
- Verificación realizada con ttnn 0.81.1 sobre `ttsim`, el simulador de Blackhole de Tenstorrent.
- No está diseñado para ejecución nativa en GPU NVIDIA/AMD en formato BFP4; en GPU solo puede cargarse en bf16 mediante `transformers`, perdiendo la ventaja de compresión.
- Opciones de despliegue: TT-NN (`ttnn`), TT-Transformers (tt-metal v0.81.1, con `--use_hf_rope`), TT-Forge (tt-xla, en bf16).
- En TT-Transformers, la demo empaqueta el head en `bfloat8_b`, por lo que el head no es exacto en ese flujo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4 | 8,19B | 32.768 (ext. 131.072) | BFP4 (4,5 bits/peso) + bf16 | Apache 2.0 | Tenstorrent Tensix |
| Qwen/Qwen3-8B (base) | 8,19B | 32.768 (ext. 131.072) | bf16 | Apache 2.0 | GPU/CPU genéricos |
| Cuantizaciones GPTQ/AWQ de Qwen3-8B (terceros) | 8,19B | 32.768 (ext. 131.072) | 4 bits (INT4) | Apache 2.0 (heredada) | GPU NVIDIA/AMD |

La comparativa con cuantizaciones INT4 para GPU es aproximada: no se dispone de datos de rendimiento de esta exportación frente a ellas en la información proporcionada. La diferencia clave es el hardware objetivo y el formato de punto flotante por bloques, que preserva mejor el rango dinámico que una cuantización INT4 uniforme, a costa de 4,5 bits por peso en lugar de 4.

## Limitaciones y advertencias

- La cuantización BFP4 introduce pérdida de precisión en las proyecciones lineales; el impacto exacto en benchmarks no está documentado en la información disponible.
- La calibración se realizó sobre WikiText-2 y Wikipedia en coreano, lo que puede sesgar el comportamiento hacia esos dominios y penalizar otros idiomas o estilos.
- El modelo está pensado para hardware Tensix; en GPU o CPU se ejecuta en bf16 y pierde la ventaja de compresión, además de no aprovechar el formato BFP4.
- En TT-Transformers, el head se empaqueta en `bfloat8_b` en la demo, por lo que no es exacto en ese flujo concreto.
- TT-Forge no ha sido probado de extremo a extremo con este modelo según la model card; su opción `bfp_bf4` re-cuantiza en layout [out, in] de PyTorch y no preserva el formato de 4,5 bits.
- Riesgo de alucinación inherente al modelo base Qwen3-8B, no mitigado por la cuantización.
- La lista de idiomas soportados no está documentada en esta exportación; se hereda del modelo base sin verificación específica.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3-8B y las dependencias de TT-NN/tt-metal.
- El repositorio tiene 70 descargas y 0 likes en el momento de la consulta, lo que indica validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal: https://github.com/tenstorrent/tt-metal
- Paper de Qwen3 (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen3-8B-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
