# Xylolabs/Phi-4-mini-reasoning-Tensix-BFP4-MLP

## Resumen

Phi-4-mini-reasoning-Tensix-BFP4-MLP es una versión cuantizada del modelo microsoft/Phi-4-mini-reasoning, publicada por Xylolabs y optimizada específicamente para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). El modelo conserva la arquitectura y los pesos del original de Microsoft, pero aplica un esquema de cuantización de bloque en coma flotante (block floating point) que reduce el peso de 7,67 GB en BF16 a 3,444 GB empaquetados, con un incremento de divergencia (KL medio) de 1,162884 frente al BF16 de referencia.

La relevancia de esta ficha es doble. Por un lado, ofrece un camino práctico para ejecutar un modelo de razonamiento de 4.450 millones de parámetros sobre hardware de aceleración no convencional (NPU Tensix) usando las pilas tt-metal y ttnn. Por otro, documenta de forma explícita el coste de la cuantización BFP4/BFP8 en términos de divergencia respecto al modelo original y frente a una referencia estándar de la industria como Q4_K_M de llama.cpp, lo que permite evaluar su viabilidad en producción.

El modelo base es un transformer denso de 4.450.618.368 parámetros, especializado en razonamiento (thinking mode) y con soporte de tool calling, licenciado bajo MIT. Esta versión mantiene la licencia MIT del original, con los scripts de empaquetado bajo Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: microsoft/Phi-4-mini-reasoning) |
| Parámetros totales | 4.450.618.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | MLP en bfloat4_b (BFP4); atención en bfloat8_b (BFP8); resto en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | MIT (scripts de empaquetado y verificación: Apache-2.0) |
| Formato de pesos | safetensors (carpeta `bfp4/`, con `quant4.json` e índice de shards) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del transformer denso de Phi-4-mini-reasoning de Microsoft, sin cambios estructurales: no se ha reentrenado ni se ha aplicado fine-tuning adicional. La intervención de Xylolabs se limita a la cuantización post-entrenamiento (PTQ) con un esquema de block floating point específico para Tensix, implementado en el repositorio `tensix-bfp-gptq`.

La política de cuantización es selectiva por tipo de capa: las proyecciones del MLP se cuantizan a bfloat4_b (4 bits con exponente compartido por bloque), las proyecciones de atención a bfloat8_b (8 bits), y el resto de los tensores (embeddings, normas, cabezas) permanecen en BF16. Esta asignación asimétrica busca preservar la calidad numérica en los puntos más sensibles del modelo (atención) mientras maximiza la compresión en las capas de mayor volumen paramétrico (MLP). El proceso de empaquetado incluye scripts de verificación (`pack_tensix.py` y `verify_grid.py`) que permiten round-trip de los valores empaquetados contra el tensor original.

No se dispone de información sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación proporcionada. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal en esta versión.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredadas del modelo base Phi-4-mini-reasoning.
- Modo de razonamiento explícito (thinking mode), propio del modelo base.
- Soporte de tool calling y function calling, según las capacidades del modelo original.
- Ejecución sobre NPU Tensix (Wormhole, Blackhole) mediante ttnn y tt-metal.
- Compatibilidad con la API estándar de transformers (`AutoModelForCausalLM`) en BF16 para validación en CPU/GPU.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del modelo.
- No se documentan capacidades de visión, audio ni otras modalidades en esta versión.

## Casos de uso

- Validación de pipelines de cuantización BFP en hardware Tensix: el modelo sirve como referencia para comprobar que el empaquetado y el round-trip de pesos funcionan correctamente antes de desplegar modelos mayores en la misma pila.
- Inferencia de razonamiento en aceleradores Tenstorrent: permite ejecutar un modelo de razonamiento de 4.450 millones de parámetros en Wormhole o Blackhole con un peso empaquetado de 3,444 GB, reduciendo la presión sobre la memoria DRAM de la NPU.
- Comparación de calidad de cuantización: el KL medio de 1,162884 frente a BF16 y de 1,147011 para Q4_K_M permite evaluar si la pérdida de calidad es aceptable para una tarea concreta antes de adoptar BFP4 en producción.
- Prototipado de asistentes de razonamiento en inglés: el modelo puede gestionar consultas que requieran cadenas de razonamiento, con la ventaja de un consumo de memoria reducido frente a la versión BF16.
- Integración en pipelines de CI/CD para hardware Tenstorrent: los scripts `pack_tensix.py` y `verify_grid.py` permiten automatizar la verificación de pesos cuantizados como paso previo al despliegue.
- Evaluación de tool calling en entornos con recursos limitados: al mantener las capacidades del modelo base, puede probarse la integración de llamadas a funciones sobre NPU sin necesidad de una GPU de gran VRAM.
- Investigación sobre cuantización asimétrica: la combinación BFP4 en MLP y BFP8 en atención es un caso de estudio útil para medir el impacto de distintos niveles de precisión por tipo de capa.

## Benchmarks y rendimiento

| Métrica | BFP4 (este modelo) | BF16 (base) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamaño empaquetado (GB) | 3,444 | 7,67 | 2,486 |
| KL medio frente a BF16 | 1,162884 | 0 | 1,147011 |

La evaluación KL cubre 16.192 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano), en formato plano y con la plantilla de chat, con un límite de KL medio fijado en 1,5 veces la referencia Q4_K_M. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,9 GB (tamaño del repo) o 7,67 GB de pesos; en la práctica, alrededor de 9-10 GB contando activaciones y caché KV.
- VRAM estimada con la carpeta `bfp4/`: 3,444 GB de pesos empaquetados; el consumo efectivo depende de si se ejecuta en NPU Tensix o se descomprime a BF16 en GPU.
- GPU recomendadas para la ruta transformers/BF16: RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). Cabe en GPUs consumer con 12 GB o más si se usa la versión cuantizada y se gestiona la memoria con cuidado.
- Aceleradores objetivo: NPU Tenstorrent Wormhole y Blackhole, mediante ttnn y tt-metal.
- Opciones de despliegue: transformers con `device_map="auto"` y `dtype="bfloat16"` para validación; ttnn para ejecución en Tensix; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta carpeta concreta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phi-4-mini-reasoning-Tensix-BFP4-MLP (este) | 4,45 B | no disponible | BFP4/BFP8 selectiva | MIT | Hugging Face, orientado a Tensix |
| microsoft/Phi-4-mini-reasoning (BF16) | 4,45 B | no disponible | BF16 | MIT | Hugging Face |
| Phi-4-mini-reasoning Q4_K_M (llama.cpp) | 4,45 B | no disponible | Q4_K_M | MIT | Hugging Face / llama.cpp |
| Phi-4-mini (no reasoning) | ~3,8 B | no disponible | múltiples | MIT | Hugging Face |

La comparación directa más relevante es frente al modelo base en BF16 y frente a la cuantización Q4_K_M: este último ocupa menos espacio (2,486 GB frente a 3,444 GB) y presenta un KL ligeramente inferior (1,147011 frente a 1,162884), pero no está optimizado para Tensix. La elección entre ambos depende del hardware objetivo, no solo de la métrica de divergencia.

## Limitaciones y advertencias

- La cuantización BFP4 en las capas MLP introduce una divergencia medible (KL medio de 1,162884 frente a BF16), superior a la de Q4_K_M (1,147011); puede degradar tareas de razonamiento de alta precisión.
- El modelo está etiquetado únicamente para inglés; el soporte multilingüe no está garantizado y la evaluación KL incluye coreano solo como conjunto de validación, no como idioma declarado.
- No se dispone de información sobre sesgos del modelo base ni sobre evaluaciones de seguridad en esta versión cuantizada.
- Riesgo de alucinación inherente al modelo base; la cuantización puede amplificarlo en tareas de razonamiento largo.
- La licencia MIT permite uso comercial, pero los scripts `pack_tensix.py` y `verify_grid.py` están bajo Apache-2.0 y cada carpeta incluye su propio `LICENSE` y `NOTICE`, que deben revisarse por separado.
- El modelo está diseñado para Tensix; ejecutarlo en GPU requiere descomprimir a BF16 y pierde la ventaja de tamaño, además de no aprovechar el formato BFP.
- No se documentan la longitud de contexto ni los requisitos de memoria KV, lo que dificulta planificar despliegues con conversaciones largas.
- El repositorio tiene pocas descargas (184) y ningún "like", lo que sugiere una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-reasoning
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/Phi-4-mini-reasoning-Tenstorrent-Tensix/blob/main/LICENSE
