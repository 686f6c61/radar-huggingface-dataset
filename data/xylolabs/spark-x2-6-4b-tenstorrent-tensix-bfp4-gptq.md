# Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4-GPTQ

## Resumen

Spark-X2.6-4B-Tenstorrent-Tensix-BFP4-GPTQ es una exportación cuantizada del modelo base XHToken/Spark-X2.6-4B, publicada por Xylolabs. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión de los pesos originales en BF16 a un formato de 4,5 bits por peso (BFP4 con GPTQ plano) pensado específicamente para su despliegue sobre hardware Tenstorrent Tensix mediante TT-NN y tt-metal. El resultado son 180 matrices de proyección del decodificador cuantizadas, mientras que el embedding, la cabeza de salida (tied-head) y otras 111 entradas permanecen en BF16.

El modelo conserva la arquitectura del base, un transformer causal de aproximadamente 4.447 millones de parámetros (4,4B), con ventana de contexto efectiva limitada a 8.192 tokens contando prompt más generación. Está orientado a generación de texto conversacional y soporta únicamente inglés y chino según los metadatos de idioma declarados. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución habituales.

La relevancia de esta ficha radica en que es un caso de cuantización orientada a aceleradores alternativos: no busca máxima compresión ni máxima fidelidad, sino compatibilidad con el formato nativo de bloque flotante de Tensix. El repo ocupa 8,9 GB, pero el propio autor indica que los pesos almacenados requieren aproximadamente 3,47 GB de memoria de dispositivo, más espacio para caché KV y buffers. La evaluación publicada muestra una KL media de 0,065925 frente a la referencia BF16, con cero pérdidas contadas en el conjunto de 33 preguntas normales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Spark-X2.6-4B, familia spark2_5) |
| Parametros totales | 4.447.623.680 (4,4B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | 8.192 tokens (prompt + generación combinados) |
| Tipos de cuantizacion | BFP4 GPTQ plano (4,5 bits/peso) en 180 proyecciones; BF16 en embedding, cabeza y otras 111 entradas |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (indexados, compatibles con transformers vía trust_remote_code) |

## Arquitectura y entrenamiento

El modelo base Spark-X2.6-4B es un transformer causal estándar con atención por capas, incluyendo capas de atención deslizante (sliding layers) y capas de atención completa cada cuatro capas, con rotación parcial aplicada primero en las capas de atención completa. La exportación de Xylolabs no reentrena ni ajusta el modelo: toma los pesos BF16 originales y aplica GPTQ plano para cuantizar 180 matrices de proyección del decodificador a BFP4, manteniendo los valores cuantizados almacenados como BF16 y respetando el orden de filas original de Hugging Face.

La innovación técnica principal es el tratamiento específico de las 36 matrices QKV fusionadas. Estas conservan el orden de filas de HF, pero sus filas q/k deben permutarse antes del empaquetado BFP para evitar un redondeo adicional; el script `spark_layout.py` implementa una permutación reversible (pares rotatorios adyacentes en capas deslizantes, layout parcial rotatorio primero en cada cuarta capa de atención completa), mientras las filas V quedan intactas. Las otras 144 matrices solo requieren la transposición habitual. El autor declara que las 180 matrices pasan las comprobaciones de grid, empaquetado nativo TT-NN y empaquetado como BFP8, y que el ejemplo exacto pasa también en el simulador Blackhole con TT-NN 0.81.1. No se documentan datos de entrenamiento (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento con modo thinking opcional: el tokenizador acepta `enable_thinking=False` para respuestas directas; el conjunto de evaluación incluye 7 preguntas de tipo thinking.
- Respuestas deterministas mediante decodificación greedy (`do_sample=False`), útil para tareas de extracción y clasificación.
- Compatibilidad con transformers 5.23.0 y PyTorch mediante `trust_remote_code=True`.
- Despliegue nativo en hardware Tenstorrent Tensix vía TT-NN/tt-metal, con empaquetado a `ttnn.bfloat4_b` y layout TILE.
- Verificación de integridad incluida: `verify_grid.py`, `pack_tensix.py` (con opciones `--as bfp8` y `--device`).
- No se declara soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades en la información disponible.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo está empaquetado para TT-NN y verificado contra el simulador Blackhole, por lo que encaja en entornos que buscan alternativas a GPU NVIDIA con pesos nativos BFP4.
- Inferencia conversacional de bajo coste en memoria: con ~3,47 GB de pesos almacenados, cabe en dispositivos con DRAM moderada y permite servir chat en inglés o chino con contexto de hasta 8.192 tokens.
- Respuestas deterministas para extracción de datos: usando decodificación greedy y `enable_thinking=False`, sirve para tareas de normalización, clasificación o extracción de entidades donde la reproducibilidad importa.
- Evaluación comparativa de cuantización: el repo incluye scripts de verificación y métricas KL frente a BF16 y Q4_K_M, útil para investigadores que estudian el impacto de BFP4 GPTQ en calidad.
- Prototipado en pipelines de transformers: la carga estándar con `AutoModelForCausalLM` permite integrarlo en scripts existentes antes de migrar a TT-NN.
- Validación de layouts QKV personalizados: el esquema `spark-llama` con permutación reversible es un caso práctico para equipos que implementan kernels de atención personalizados.
- Pruebas de regresión de kernels: los checkers incluidos permiten verificar que una implementación TT-NN reproduce exactamente los valores empaquetados, útil en CI de hardware.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| Referencia BF16 original | 0 | 25 | 5 | — |
| Esta exportación GPTQ plano | 0,065925 | 24 | 5 | 0 |
| Q4_K_M emparejado | 0,060881 | 26 | 7 | 0 |

La evaluación KL cubre 16.288 posiciones de textos en inglés y coreano (raw y chat), en dos bloques de 2.048 tokens. El suelo BF16 de llama.cpp se sitúa en 0,000397. La exportación cumple la regla relativa 7 al quedar en 1,082850 veces la KL de Q4_K_M, dentro del límite de 1,5 veces, con cero pérdidas contadas o respuestas rotas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 3,47 GB solo para los pesos almacenados, más caché KV y buffers adicionales.
- Hardware objetivo: aceleradores Tenstorrent Tensix con TT-NN 0.81.1 o superior; el ejemplo exacto se validó en el simulador Blackhole.
- GPU consumer: no se documenta compatibilidad ni VRAM estimada para GPU NVIDIA/AMD en la información disponible; la carga con transformers usa `device_map="auto"` en BF16, lo que requeriría del orden de 9 GB en memoria si se materializan todos los tensores sin empaquetado TT-NN.
- Despliegue: transformers 5.23.0 + PyTorch con `trust_remote_code=True`; empaquetado nativo con `ttnn.as_tensor` a `ttnn.bfloat4_b`, layout TILE_LAYOUT y DRAM_MEMORY_CONFIG.
- No se declara soporte de vLLM, llama.cpp, Ollama ni TGI; tampoco se aportan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spark-X2.6-4B-Tenstorrent-Tensix-BFP4-GPTQ | 4,4B | 8.192 | BFP4 GPTQ (4,5 bits) + BF16 | Apache-2.0 | Hugging Face, repo 8,9 GB |
| XHToken/Spark-X2.6-4B (base) | 4,4B | no disponible en esta ficha | BF16 | Apache-2.0 (según base) | Hugging Face |
| Q4_K_M emparejado (referencia de evaluación) | 4,4B | no disponible | Q4_K_M | no disponible | no disponible |

La comparativa se limita a estos tres perfiles porque no se dispone de datos de otros modelos de la misma categoría en la información proporcionada. El export GPTQ queda ligeramente por detrás de Q4_K_M en KL media (0,065925 frente a 0,060881) y en aciertos thinking (5 frente a 7), pero con cero pérdidas contadas en ambos casos.

## Limitaciones y advertencias

- Contexto limitado a 8.192 tokens combinados (prompt más generación), inferior a modelos contemporáneos con ventanas de 32K o más.
- Solo inglés y chino declarados; no se garantiza calidad en castellano ni en otros idiomas.
- La cuantización BFP4 introduce degradación medible: KL media de 0,065925 frente a BF16, con un acierto normal menos que la referencia (24 frente a 25).
- Las 36 matrices QKV fusionadas requieren una permutación específica antes del empaquetado BFP; omitirla provoca redondeo adicional y resultados incorrectos.
- El código del modelo se carga con `trust_remote_code=True`; el autor recomienda leer el código Apache incluido y revisar las ediciones de compatibilidad listadas en `NOTICE` antes de habilitarlo.
- No se declara ni se verifica ejecución mediante tt-transformers o tt-forge; el soporte se limita a TT-NN y al simulador Blackhole.
- No hay datos publicados sobre sesgos, alucinación, tool calling o uso en agentes; estas capacidades deben validarse empíricamente antes de producción.
- El número de descargas (5) y likes (0) indica adopción muy incipiente, con escasa validación comunitaria.
- Aunque la licencia Apache-2.0 permite uso comercial, deben respetarse las obligaciones de atribución y las condiciones del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4-GPTQ
- Modelo base: https://huggingface.co/XHToken/Spark-X2.6-4B
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Spark-X2.6-4B-Tenstorrent-Tensix-BFP4-GPTQ/blob/main/LICENSE
- Assets del autor: https://raw.githubusercontent.com/XylolabsInc/tensix-bfp-gptq/main/assets/xylolabs-lockup.svg
