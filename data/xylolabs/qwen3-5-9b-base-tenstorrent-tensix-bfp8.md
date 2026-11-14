# Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo base Qwen/Qwen3.5-9B-Base, publicada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura original de Qwen3.5 con 9.653.104.368 parámetros y sustituye las capas lineales por matrices cuantizadas a `ttnn.bfloat8_b` (BFP8, formato de coma flotante por bloques) mediante GPTQ, de forma que el empaquetador de TT-NN pueda cargarlas sin alterar sus valores. El objetivo no es otro que reducir el peso en memoria del modelo en dispositivo: el export ocupa unos 11,42 GB para los pesos del modelo de lenguaje, frente a los 17,91 GB del checkpoint en BF16.

La relevancia de esta ficha es doble. Por un lado, documenta un caso práctico de cuantización de bloques (block floating point) pensada para hardware de inferencia no-GPU, un nicho en el que la mayoría de checkpoints públicos no ofrecen variantes. Por otro lado, incluye una evaluación explícita de fidelidad respecto al BF16 original: divergencia KL media de 0,00064 y 98,83 % de coincidencia top-1 sobre 8.188 posiciones de texto inglés y coreano, además de 27 de 28 respuestas correctas en un conjunto de prompts cortos.

Es importante subrayar que se trata del modelo base preentrenado, no de una versión ajustada con instrucciones: continúa texto y no sigue instrucciones de chat. Solo se cuantizó y evaluó el modelo de lenguaje; los tensores `mtp` y `visual` permanecen en BF16 sin cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 con capas de atención (8 capas) y capas Gated DeltaNet (24 capas), más módulo MTP y torre visual |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso) en capas lineales; bf16 en LM head, embeddings, normas y resto de tensores; float32 en `A_log` y `norm.weight` de `linear_attn`; media de 10,21 bits por peso |
| Idiomas soportados | no disponible (evaluado con texto en inglés y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers), empaquetado para TT-NN; existe variante BFP4 en otro repo |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-9B-Base: un transformer híbrido en el que conviven 8 capas con atención clásica (proyecciones q, k, v, o) y 24 capas con Gated DeltaNet (proyecciones q, k, v, z, a, b y salida), además de 32 capas MLP con proyecciones gate, up y down. El checkpoint incluye también un módulo `mtp` (multi-token prediction) y una torre `visual`, ambos conservados en bf16 sin cuantizar. No se dispone de información sobre el volumen de tokens de preentrenamiento ni sobre la composición del dataset del modelo base en la información proporcionada.

La innovación técnica de esta exportación es el proceso de cuantización: GPTQ aplicado sobre la rejilla de `bfloat8_b`, manteniendo el exponente compartido de cada bloque tal y como lo fija el empaquetador de TT-NN. La calibración se realizó con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices cuantizadas se almacenan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin modificar sus valores; el script `pack_tensix.py` verifica matriz a matriz que ningún valor cambia tras el empaquetado. El archivo `quant4.json` detalla el formato de cada proyección.

## Capacidades

- Generación de texto y continuación de texto: es un modelo base preentrenado, por lo que su uso natural es la continuación, no el diálogo instruido.
- Razonamiento y conocimiento general heredados del checkpoint Qwen3.5-9B-Base.
- Procesamiento de imagen y texto: la pipeline declarada es `image-text-to-text` y el checkpoint incluye torre visual en bf16, aunque el autor indica que solo se cuantizó y evaluó el modelo de lenguaje.
- Predicción multi-token: incluye el módulo `mtp` del modelo base, conservado en bf16.
- Multilingüismo: no se documentan los idiomas soportados; la evaluación cubre inglés y coreano.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible; al ser un modelo base sin ajuste de instrucciones, no se documenta soporte de agentes.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el caso principal. El export está pensado para cargarse con TT-NN en dispositivos Tensix, donde el formato BFP8 permite que el empaquetador asigne las matrices directamente a DRAM de dispositivo sin conversión adicional.
- Inferencia en dispositivos con memoria limitada: con 11,42 GB de pesos en dispositivo, encaja en configuraciones Tensix que no admitirían el checkpoint BF16 de 17,91 GB; para dispositivos aún más pequeños el autor remite a la variante BFP4.
- Generación de texto y continuación en pipelines de investigación: al ser un modelo base, sirve para experimentos de continuación de texto, evaluación de perplejidad y estudios de fidelidad de cuantización sobre hardware Tensix.
- Validación de cadenas de cuantización: el repo incluye `pack_tensix.py` y `verify_grid.py` para comprobar que el empaquetado no altera valores, lo que lo convierte en un banco de pruebas para flujos GPTQ sobre BFP8.
- Punto de partida para fine-tuning o ajuste posterior sobre hardware Tensix: el modelo base cuantizado puede servir como referencia para comparar el impacto de la cuantización antes de abordar adaptaciones.
- Evaluación comparativa de formatos: la tabla de evaluación del autor (BF16, BFP8 y Q4_K_M de llama.cpp) permite usar este checkpoint como referencia en estudios de degradación por cuantización en inglés y coreano.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamano (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Qwen/Qwen3.5-9B-Base) | 16 | 17,91 | 0 | 100 | 28 de 28 | - |
| Este modelo (BFP8) | 10,21 | 11,422 | 0,00064 | 98,83 | 27 de 28 | 0 |
| Q4_K_M (llama.cpp) | 5,02 | 5,780 | 0,02644 | 91,72 | 27 de 28 | 0 |

La KL y el top-1 se calculan sobre 8.188 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato de texto plano. Las respuestas corresponden a 28 prompts cortos con comprobación automática, en formato de completación y con 3 ejemplos. El autor advierte que estas métricas miden cercanía al BF16, no calidad de tarea, y que no se reporta velocidad. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria de dispositivo estimada: unos 11,42 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole.
- Compatibilidad verificada: ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.
- GPU consumer: no es el objetivo del export; no se documenta su ejecución en GPU. El repo es cargable con transformers en bf16, pero el tamaño del repo es de 19,3 GB.
- Opciones de despliegue: TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b` y `TILE_LAYOUT`), transformers para carga en bf16; tt-transformers y tt-forge no se probaron con este checkpoint.
- Variante para menos memoria: existe un export BFP4 en el mismo perfil de autor para dispositivos con menos memoria.
- Latencia y throughput: no disponibles; el autor indica explícitamente que no reporta velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / bits por peso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP8) | 9,65 B | no disponible | BFP8, 10,21 bits | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-9B-Base (BF16) | 9,65 B | no disponible | BF16, 16 bits | Apache 2.0 | Hugging Face |
| Q4_K_M generado con llama.cpp | 9,65 B | no disponible | GGUF, 5,02 bits | Apache 2.0 (heredada) | Generado localmente por el autor |
| Xylolabs/Qwen3.5-9B-Base-Tenstorrent-BFP4 | 9,65 B | no disponible | BFP4 | Apache 2.0 | Hugging Face |

La comparación relevante es de fidelidad y tamaño: el BFP8 ocupa 11,42 GB con una KL de 0,00064, mientras que el Q4_K_M ocupa 5,78 GB con una KL de 0,02644. El BFP8 prioriza fidelidad al BF16 sobre compresión máxima; el BFP4 del mismo autor apunta a dispositivos con menos memoria, aunque no se dispone de sus métricas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base preentrenado: no está ajustado con instrucciones ni con RLHF/DPO, por lo que no debe usarse como asistente conversacional sin un ajuste posterior.
- Solo se cuantizó y evaluó el modelo de lenguaje; los tensores `mtp` y `visual` permanecen en bf16 y no se han validado en este export.
- La evaluación de fidelidad se limita a inglés y coreano, en texto plano y con 28 prompts cortos; no cubre tareas de razonamiento, código ni matemáticas.
- No se reportan métricas de velocidad, latencia ni throughput.
- tt-transformers y tt-forge no se probaron con este checkpoint; la validación se hizo con ttnn 0.81.1 sobre el simulador ttsim, no sobre hardware físico según la información disponible.
- El formato BFP8 depende de la rejilla de exponentes compartidos que fija TT-NN; un empaquetado distinto puede alterar los valores, de ahí los scripts de verificación incluidos.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables al modelo base subyacente.
- Licencia Apache 2.0, que permite uso comercial; el autor incluye un archivo NOTICE con los cambios realizados respecto al modelo base.
- Longitud de contexto e idiomas soportados no están documentados en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Variante BFP4: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tenstorrent-BFP4
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Qwen3.5-9B-Base-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
