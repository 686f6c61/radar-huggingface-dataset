# Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts

## Resumen

Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts es una versión cuantizada del modelo abierto `openai/gpt-oss-20b`, publicada por Xylolabs y optimizada para su despliegue en las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo base es un transformer de tipo mixture-of-experts (MoE) con aproximadamente 20.900 millones de parámetros, desarrollado originalmente por OpenAI como parte de la familia `gpt-oss`. Esta exportación reemplaza las capas lineales por matrices almacenadas en formatos de coma flotante por bloques propios de TT-NN: `bfloat4_b` (BFP4) para los expertos enrutados y `bfloat8_b` (BFP8) para la atención y la cabeza de lenguaje.

La relevancia de esta ficha radica en que no se trata de una cuantización genérica, sino de un artefacto diseñado específicamente para el hardware de Tenstorrent: los pesos se guardan como valores bf16 sobre la rejilla BFP4/BFP8, de modo que TT-NN los empaqueta sin alterar sus valores. El resultado es un checkpoint de 13,22 GB de pesos del modelo de lenguaje (frente a 41,83 GB en BF16), con una media de 5,06 bits por peso, que mantiene una calidad muy cercana al modelo original (KL medio de 0,0636 y top-1 del 81,90 % sobre 8.188 posiciones de texto inglés y coreano).

La licencia Apache-2.0 y el hecho de que derive de un modelo abierto de OpenAI lo convierten en una opción atractiva para experimentación en hardware de inferencia alternativo, aunque conviene tener presente que el soporte de tooling (tt-transformers, tt-forge) aún no está completo para la arquitectura `gpt_oss`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (familia `gpt_oss`), pesos en safetensors con capas lineales cuantizadas para TT-NN |
| Parametros totales | 20.914.757.184 (~20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits/peso) en expertos enrutados; BFP8 (`ttnn.bfloat8_b`, 8,5 bits/peso) en atención q/k/v/o y LM head; bf16 en router, embeddings y normas. Media: 5,06 bits/peso |
| Idiomas soportados | no disponible (la evaluacion usa texto en ingles y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 41,9 GB; pesos del LM empaquetados ~13,22 GB) |

## Arquitectura y entrenamiento

El modelo base `openai/gpt-oss-20b` es un transformer con mezcla de expertos (MoE) en el que las capas de expertos enrutados concentran la mayor parte de los parámetros. En esta exportación, las proyecciones `gate`, `up` y `down` de los expertos enrutados de las 24 capas se cuantizan a `ttnn.bfloat4_b` en bloques de 16 a lo largo de la dimensión de entradas (K), mientras que las proyecciones de atención (`q`, `k`, `v`, `o`) y la cabeza de lenguaje (`LM head`) se cuantizan a `ttnn.bfloat8_b`. El router, los embeddings, las normas y el resto de tensores permanecen en bf16, igual que en el modelo original.

El proceso de cuantización combina GPTQ con una búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia coreana. GPTQ se aplica únicamente a los expertos enrutados, cada uno con su propia matriz de Hessian y bloques de 16 a lo largo de las entradas; los expertos que vieron demasiados pocos tokens de calibración se cuantizan por redondeo al más cercano (round to nearest). Las matrices BFP8 se obtienen también por redondeo al más cercano. El checkpoint incluye `quant4.json`, que documenta el formato de cada proyección, y scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que el empaquetado en TT-NN no altera ningún valor.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredadas del modelo base `gpt-oss-20b`.
- Razonamiento de múltiples pasos y modo de pensamiento (thinking), según las capacidades del modelo original.
- Generación de código y resolución de problemas matemáticos (capacidades del base, no verificadas de forma independiente en esta ficha).
- Soporte de plantilla de chat (`apply_chat_template`) y de mensajes con roles.
- Compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repo).
- Capacidades multilingües: no especificadas; la evaluación reportada cubre inglés y coreano.
- No se documentan en la información disponible capacidades de visión, audio ni tool calling específicas de esta exportación.

## Casos de uso

- Inferencia en NPU Tenstorrent: desplegar el modelo en Wormhole o Blackhole usando TT-NN, con 13,22 GB de memoria de dispositivo para los pesos del LM más espacio para caché KV y buffers.
- Investigación en cuantización de bajo bit: usar el checkpoint para estudiar el impacto de BFP4/BFP8 con GPTQ en un MoE, comparando KL y top-1 frente a BF16 y MXFP4.
- Evaluación de hardware alternativo: medir latencia y throughput de un modelo de 20,9 B en silicio Tensix y comparar con GPUs convencionales.
- Prototipado de asistentes conversacionales: la plantilla de chat y la licencia Apache-2.0 permiten iterar sobre diálogos multi-turno sin restricciones de uso comercial.
- Verificación de empaquetado: usar `pack_tensix.py` y `verify_grid.py` para validar pipelines de cuantización y comprobar que TT-NN preserva los valores de los pesos.
- Reproducción de benchmarks de cuantización: el repo incluye la metodología (WikiText-2 test y Wikipedia coreana, 8.188 posiciones) para replicar las métricas de KL y top-1.
- Base para fine-tuning posterior: al derivar de un modelo abierto con licencia permisiva, puede servir como punto de partida para ajustes específicos de dominio antes de re-cuantizar.

## Benchmarks y rendimiento

| Modelo | Bits/peso | Tamano (GB) | KL medio a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (`openai/gpt-oss-20b`) | 16 | 41,83 | 0 | 100 | 40 de 40 | - |
| **Este modelo (BFP4/BFP8)** | 5,06 | 13,218 | 0,0636 | 81,90 | 39 de 40 | 0 |
| MXFP4 (llama.cpp) | 4,63 | 12,110 | 0,0678 | 82,65 | 39 de 40 | 0 |

Las métricas de KL y top-1 se calculan sobre 8.188 posiciones de texto en inglés y coreano (WikiText-2 test y Wikipedia coreana). Las respuestas corresponden a 33 prompts cortos con verificación automática, más 7 prompts de razonamiento repetidos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: ~13,22 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole). La demo oficial de tt-metal (v0.81.1) ejecuta `gpt-oss` en cuatro chips Blackhole (QuietBox 2) o en Wormhole LoudBox y Galaxy; no funciona en un único chip.
- GPU consumer: no se documenta soporte; el checkpoint está pensado para TT-NN, aunque el quickstart usa `transformers` con `device_map="auto"` y dtype bfloat16, lo que requiere memoria suficiente para cargar tensores bf16.
- Despliegue: TT-NN (`ttnn`), tt-metal (demo gpt-oss v0.81.1), tt-forge (tt-xla, aún no probado con este checkpoint), y `transformers` para carga e inspección.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Calidad (KL / top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo | ~20,9 B | no disponible | BFP4/BFP8 (5,06 bits) | 0,0636 / 81,90 % | Apache-2.0 | Hugging Face (Xylolabs) |
| `openai/gpt-oss-20b` (BF16) | ~20,9 B | no disponible | BF16 | 0 / 100 % | Apache-2.0 | Hugging Face (OpenAI) |
| MXFP4 (llama.cpp) | ~20,9 B | no disponible | MXFP4 (4,63 bits) | 0,0678 / 82,65 % | Apache-2.0 (derivado) | llama.cpp |

## Limitaciones y advertencias

- La cuantización introduce pérdida de calidad: KL medio de 0,0636 y top-1 del 81,90 % frente al 100 % del BF16; una de las 40 respuestas verificadas falla.
- El checkpoint está diseñado para TT-NN; los valores están almacenados como bf16 sobre rejillas BFP4/BFP8, por lo que su uso fuera de TT-NN puede requerir conversión explícita.
- La demo oficial de tt-metal empaqueta los expertos con bloques a lo largo de las salidas, mientras que este checkpoint los organiza a lo largo de las entradas (K); la demo re-cuantiza entre el 7 % y el 54 % de los valores de los expertos (medido en la capa 0 con el packer host de tt-metal).
- tt-transformers no soporta `gpt-oss`; tt-forge (tt-xla) aún no se ha probado con este checkpoint.
- La demo de tt-metal requiere varios chips (QuietBox 2, LoudBox, Galaxy); no se ejecuta en un único dispositivo.
- Riesgo de alucinación inherente al modelo base; no se documentan sesgos específicos en la información disponible.
- Idiomas soportados no especificados; la evaluación solo cubre inglés y coreano.
- Longitud de contexto no disponible en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `openai/gpt-oss-20b`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gpt-oss-20b-Tenstorrent-Tensix-BFP4-Experts
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Repositorio de código (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Demo gpt-oss en tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gpt_oss
- Paper de referencia (arXiv:2508.10925): https://arxiv.org/abs/2508.10925
