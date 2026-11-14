# Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ

## Resumen

Qwen3.5-4B-Tensix-BFP4-GPTQ es una cuantización del modelo Qwen/Qwen3.5-4B publicada por Xylolabs, orientada específicamente al hardware Tensix de Tenstorrent mediante el stack tt-metal/ttnn. No se trata de un modelo nuevo: es un export del decodificador de texto del modelo base con 248 proyecciones declaradas cuantizadas a BFP4 (block floating point de 4 bits, etiquetado como `bfloat4_b`) usando GPTQ plano, mientras que embeddings, la copia explícita del head atado y el resto de tensores se mantienen en BF16 o F32.

El interés de esta ficha es doble. Por un lado, demuestra un flujo de cuantización no convencional (block floating point en lugar de INT4/INT8) empaquetado para aceleradores de Tenstorrent, con verificaciones de grid y de empaquetado nativo TT-NN sobre las 248 matrices declaradas. Por otro, ofrece una evaluación de divergencia KL frente al BF16 original y frente a un Q4_K_M de llama.cpp sobre textos en inglés y coreano, lo que permite juzgar la pérdida de calidad de forma cuantitativa.

El modelo conserva el tokenizador y la plantilla de chat originales de Qwen3.5-4B, incluye modo thinking desactivable desde la plantilla y mantiene los parámetros de visión y MTP en el archivo únicamente para cobertura de origen, sin que su ejecución esté validada. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3.5), export cuantizado para Tensix |
| Parámetros totales | 5.295.564.288 (según safetensors) |
| Parámetros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`bfloat4_b`, 4,5 bits por peso) en 248 proyecciones del decodificador; BF16 (443 tensores) y F32 (48 tensores) en el resto |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), con `quant4.json` describiendo el formato por proyección |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder de la familia Qwen3.5 con 5.295.564.288 parámetros almacenados, que incluye parámetros de visión y de MTP (multi-token prediction) además del decodificador de texto. El export de Xylolabs no reentrena ni hace fine-tuning: aplica GPTQ plano (damping 0,1, sin búsqueda de exponente de bloque) sobre las 248 proyecciones declaradas del decodificador, almacenando los valores en BF16 sobre su grid de block floating point de 4 bits. El resto de tensores (embeddings, copia explícita del head atado y otros) permanece en BF16 o F32.

El empaquetado resultante ocupa aproximadamente 5,46 GB contando todas las entradas almacenadas (8,25 bits por peso almacenado); si se comparte el head atado una sola vez, baja a unos 4,19 GB (7,192 bits por peso único). Las dos copias explícitas de embedding y head son idénticas byte a byte. Las 248 matrices pasan las comprobaciones de grid y de empaquetado nativo TT-NN, incluido el empaquetado como BFP8, y el ejemplo de empaquetado se validó en el simulador Blackhole con TT-NN 0.81.1. No se proporcionan datos sobre el corpus de entrenamiento del modelo base ni sobre fases de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto conversacional con plantilla de chat original de Qwen3.5-4B.
- Modo thinking activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Razonamiento multi-turno en inglés y coreano, los dos idiomas declarados.
- Capacidad multimodal declarada en el modelo base (image-text-to-text), aunque la visión queda fuera del alcance validado de este export.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Ejecución en hardware Tensix mediante TT-NN, con empaquetado verificado de las proyecciones cuantizadas.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está pensado para cargarse en hardware Tensix vía TT-NN, con las 248 matrices ya verificadas para empaquetado en `bfloat4_b` y `bfloat8_b`, lo que reduce el espacio en DRAM a unos 5,46 GB de pesos.
- Investigación en cuantización block floating point: sirve como referencia reproducible para comparar BFP4 GPTQ frente a esquemas INT4/Q4_K_M, con métricas de divergencia KL publicadas sobre el mismo conjunto de textos.
- Prototipado de asistentes conversacionales en inglés y coreano: la plantilla de chat original y el modo thinking permiten alternar respuestas directas y cadenas de razonamiento sin cambiar de checkpoint.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar cada matriz cuantizada contra sus valores indexados, útil en CI de despliegues sobre TT-Metal.
- Evaluación de pérdida de calidad por cuantización: la tabla de evaluación (KL media de 0,047503 frente a 0,039805 del Q4_K_M) permite decidir si el export es aceptable para una tarea concreta antes de llevarlo a producción.
- Docencia y experimentación con hardware no convencional: el ejemplo mínimo de Transformers 5.23.0 con `device_map="auto"` permite ejecutar el modelo en GPU/CPU antes de portarlo a Tensix.
- Base para ajuste fino ligero sobre el decodificador de texto: al conservar tokenizador, plantilla y estructura del modelo base, puede servir de punto de partida, aunque la cuantización BFP4 condiciona cualquier entrenamiento posterior.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 29 | 7 | — |
| Este export (BFP4 GPTQ) | 0,047503 | 29 | 7 | 0 |
| Q4_K_M emparejado | 0,039805 | 30 | 7 | 0 |

La evaluación cubre 16.312 posiciones puntuadas sobre los mismos textos en inglés y coreano (raw y chat), en dos fragmentos de 2.048 tokens. El suelo de referencia BF16 de llama.cpp sobre el texto seleccionado es 0,000315. El export pasa la regla relativa 7: su KL es 1,193393 veces la del Q4_K_M de referencia, dentro del límite de 1,5 veces, y no añade más de una pérdida contada adicional. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: unos 5,46 GB solo para los pesos almacenados, más espacio para KV cache y buffers. Compartiendo el head atado una vez, los pesos únicos bajan a unos 4,19 GB.
- Hardware objetivo: aceleradores Tenstorrent Tensix con TT-NN 0.81.1 o superior; el ejemplo de empaquetado se validó en el simulador Blackhole.
- GPU convencionales: el modelo puede cargarse con Transformers 5.23.0 y PyTorch usando `dtype="bfloat16"` y `device_map="auto"`, pero no se especifican GPU recomendadas ni VRAM mínima para ese camino.
- GPU de consumo: no disponible; el tamaño de pesos (5,46 GB) sugiere que podría caber en tarjetas con 8 GB o más, pero no hay confirmación del autor.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch para el camino estándar; TT-NN/tt-metal para Tensix. No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las comprobaciones publicadas son de representación y de empaquetado, no de rendimiento en dispositivo. tt-transformers y tt-forge no fueron verificados con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | KL media | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ | 5.295.564.288 | no disponible | BFP4 GPTQ + BF16/F32 | 0,047503 | Apache 2.0 | Hugging Face, orientado a Tensix |
| Qwen/Qwen3.5-4B (BF16 original) | no disponible | no disponible | BF16 | 0 (referencia) | no disponible | Hugging Face |
| Q4_K_M emparejado (llama.cpp) | mismo base | no disponible | Q4_K_M | 0,039805 | no disponible | llama.cpp |

La comparativa se limita al modelo base y al Q4_K_M citados en la evaluación del autor; no se dispone de datos de otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El alcance validado es únicamente el decodificador de texto; los parámetros de visión y MTP permanecen en el archivo pero su ejecución no está comprobada.
- La cuantización BFP4 introduce una divergencia KL media de 0,047503 frente al BF16, superior a la del Q4_K_M (0,039805), aunque dentro del margen aceptado por el autor.
- Solo se declaran los idiomas inglés y coreano; el rendimiento en castellano no está evaluado.
- No hay datos publicados sobre sesgos, tasa de alucinación ni robustez en dominios específicos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que conviene verificar antes de redistribuir.
- El checkpoint está orientado a Tensix; fuera de ese hardware, el camino estándar es Transformers con PyTorch, sin garantías de rendimiento ni de compatibilidad con otros motores de inferencia.
- Las comprobaciones publicadas son de representación y empaquetado, no de calidad en producción ni de latencia real en dispositivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ/blob/main/LICENSE
