# yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4-hibana-w3

## Resumen

Hibana w3 es un conjunto de pesos auxiliares de precisión reducida para el modelo multimodal Qwen3-Omni-30B-A3B-Instruct, desarrollado por Qwen (Alibaba Cloud) y publicado en este repositorio por el usuario yemara. No se trata de un modelo autónomo: contiene únicamente copias cuantizadas a 3 bits de los expertos enrutados de los bloques 0 a 35 del "thinker" de Qwen3-Omni, y está diseñado para servirse junto al checkpoint NVFP4 del mismo modelo dentro del motor de inferencia Hibana.

El objetivo es acelerar la decodificación en el perfil de servicio `fast` de Hibana sobre hardware GB10 (NVIDIA DGX Spark). Mientras el prefill, las proyecciones de atención, el lm_head y los expertos de los bloques 36 a 47 siguen leyéndose desde el checkpoint NVFP4, la decodificación y la verificación leen estas copias de 3 bits para los expertos de los bloques 0 a 35, lo que reduce el ancho de banda de memoria en la fase más sensible a latencia.

El repositorio ocupa 8,3 GiB y emplea un formato propietario que solo el cargador de Hibana puede interpretar. La licencia es Apache 2.0, heredada del modelo original. Es relevante para quienes despliegan Qwen3-Omni en entornos con memoria limitada y buscan mejorar el throughput sin renunciar a la verificación exacta de la decodificación especulativa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) sobre transformer, subconjunto de expertos del thinker de Qwen3-Omni-30B-A3B |
| Parámetros totales | no disponible (el checkpoint base Qwen3-Omni-30B-A3B tiene 30B totales; este repo solo contiene 72 matrices de expertos) |
| Parámetros activos | no disponible (el modelo base activa ~3B por token) |
| Longitud de contexto | no disponible en este repositorio (heredada del modelo base) |
| Tipos de cuantización | 3 bits (código Lloyd de 8 niveles) con escala E4M3 por grupo de 32 pesos y escala FP32 por fila; 3,25 bits por peso efectivos |
| Idiomas soportados | no disponible en este repositorio (el calibrado usó prompts en 20 idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con tensores `planes` (uint32), `scales` (uint8, E4M3) y `row_scale` (float32); formato propietario de Hibana |

## Arquitectura y entrenamiento

El modelo base Qwen3-Omni-30B-A3B-Instruct es un transformer con mezcla de expertos que integra capacidades de texto, visión y audio. Este repositorio no incluye embeddings, atención, normas, routers ni cabeza de salida: solo las 72 matrices de expertos (dos por bloque: `w13` con las proyecciones gate y up apiladas, de 196.608 x 2.048, y `w2` con las proyecciones down apiladas, de 262.144 x 768) correspondientes a los bloques 0 a 35.

La cuantización se realizó con GPTQ mediante las herramientas de Hibana (`hibana/weights/qwen3omni_w3.py`, fases `capture` y `fit`) partiendo de los pesos BF16 de los expertos del modelo base. Cada experto se ajustó sobre sus entradas enrutadas tal como las produce el thinker NVFP4, con la covarianza ponderada por el cuadrado del peso de enrutamiento y regularizada hacia la covarianza agrupada del bloque cuando había menos de 256 filas enrutadas. Se usó damping de 0,01, un codebook Lloyd de ocho niveles {±0,40625, ±1,25, ±2,25, ±3,5} y escalas E4M3 por grupo de 32 pesos. El conjunto de calibración constó de 177 muestras y 524.715 tokens de entradas de expertos, extraídos de open-perfectblend, MMLU, MMLU-Pro, MetaMathQA, orca-math, UltraInteract, evol-codealpaca y aya_dataset en 20 idiomas. El error de salida relativo a BF16 fue de 0,081 para fc1 y 0,125 para fc2, frente a 0,119 y 0,166 de un ajuste al nivel más cercano del mismo codebook.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del thinker de Qwen3-Omni, incluido el modo de razonamiento con presupuesto de tokens.
- Procesamiento multimodal: el modelo base soporta visión y audio; este repositorio solo afecta a los expertos del thinker, por lo que las capacidades multimodales se mantienen al servirse junto al checkpoint NVFP4.
- Razonamiento matemático y código: el calibrado incluyó datos de MetaMathQA, orca-math y evol-codealpaca, lo que preserva el rendimiento en estas tareas.
- Contexto largo: el modelo base soporta ventanas extensas; las mediciones de RULER v2 a 32K muestran una degradación de solo 1,4 puntos frente a la ejecución exacta.
- Tool calling y agentes: no disponible en la información proporcionada para este repositorio; depende del modelo base.
- Multilingüismo: el calibrado cubrió 20 idiomas, aunque este repositorio no declara una lista explícita.
- Decodificación especulativa: se sirve junto al drafter DFlash con verificación exacta, lo que permite acelerar la generación sin pérdida de calidad en la verificación.

## Casos de uso

- Despliegue de Qwen3-Omni en NVIDIA DGX Spark (GB10): el perfil `fast` de Hibana con estas copias de 3 bits alcanza 136,9 tok/s en un solo stream frente a 114,4 tok/s del perfil `exact`, lo que lo hace adecuado para entornos con una única GPU GB10 y requisitos de baja latencia.
- Servicio de chat multi-turno con concurrencia moderada: con 4 streams, el throughput agregado llega a 299,9 tok/s (frente a 193,0 del perfil exacto), adecuado para atender varias conversaciones simultáneas en un servidor pequeño.
- Razonamiento matemático en producción: GSM8K se mantiene en 97,5 frente a 97,0 del exacto, por lo que puede usarse en pipelines de resolución de problemas sin degradación apreciable.
- Evaluación de modelos con presupuesto de memoria ajustado: al reducir el peso de los expertos de los bloques 0 a 35 a 3,25 bits por peso, libera memoria para el resto del checkpoint NVFP4 y el drafter.
- Investigación en cuantización extrema de MoE: el repositorio documenta el método GPTQ, el codebook y los informes de error por matriz, lo que sirve como referencia reproducible para experimentos con precisión de 3 bits.
- Contexto largo en tareas de recuperación: RULER v2 a 32K se mantiene en 69,5 frente a 70,9 del exacto, útil para aplicaciones de resumen de documentos extensos o análisis de conversaciones largas.
- Despliegue con decodificación especulativa verificada: la integración con el drafter DFlash permite acelerar la generación manteniendo la verificación exacta, adecuado para aplicaciones interactivas donde la latencia importa.

## Benchmarks y rendimiento

Calidad frente a una ejecución `exact` del mismo build (sharar-eval, 4 streams, semilla única):

| Benchmark | `fast` con w3 | `exact` | Diferencia | p-valor |
|---|---:|---:|---:|---:|
| GPQA Diamond | 60,6 | 59,6 | +1,0 | 0,89 |
| MMLU-Pro | 79,0 | 82,0 | -3,0 | 0,33 |
| GSM8K | 97,5 | 97,0 | +0,5 | no disponible |
| MMLU-Pro (greedy) | 76,5 | 79,5 | -3,0 | 0,24 |
| RULER v2 32K | 69,5 | 70,9 | -1,4 | 0,54 |

Velocidad en un GB10, 512 tokens, media de 12 repeticiones pareadas (tok/s agregados):

| Perfil | 1 stream | 2 streams | 4 streams | 1 sampled | 2 sampled | 4 sampled |
|---|---:|---:|---:|---:|---:|---:|
| `exact` | 114,4 | 139,0 | 193,0 | 93,3 | 138,4 | 177,6 |
| `fast` antes (solo sharing) | 129,7 | 189,5 | 250,9 | 120,8 | 173,2 | 244,0 |
| `fast` ahora (+ expertos 3 bits 0-35) | 136,9 | 216,0 | 299,9 | 122,5 | 216,1 | 290,1 |
| ahora / exact | x1,19 | x1,54 | no disponible | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 8,3 GiB en disco; en memoria se sirve junto al checkpoint NVFP4 del thinker, por lo que el requisito total depende de ese checkpoint y del drafter DFlash.
- GPU recomendadas: NVIDIA DGX Spark (GB10), la plataforma sobre la que se midieron los resultados. No se han publicado mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: no disponible; el formato propietario solo lo lee el cargador de Hibana, por lo que no es desplegable en llama.cpp, Ollama ni vLLM.
- Opciones de despliegue: exclusivamente el motor Hibana (target `qwen3omni`, perfil `fast`), que sirve estas copias junto al checkpoint NVFP4 `yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4` en la revisión `d8d5a59a`.
- Latencia y throughput: 136,9 tok/s en 1 stream y 299,9 tok/s en 4 streams (agregado) en un GB10, frente a 114,4 y 193,0 del perfil exacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Hibana w3 (este repo) | subconjunto de expertos de 30B-A3B | no disponible | Apache 2.0 | safetensors propietario | solo Hibana |
| Qwen3-Omni-30B-A3B-Instruct (base) | 30B totales, ~3B activos | no disponible | Apache 2.0 | safetensors BF16 | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct-NVFP4 | 30B totales, ~3B activos | no disponible | Apache 2.0 | safetensors NVFP4 | Hugging Face, Hibana |

No se dispone de datos de benchmarks de modelos alternativos de 3 bits para comparar directamente en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no contiene embeddings, atención, normas, routers ni cabeza de salida; solo puede usarse con el cargador de Hibana y junto al checkpoint NVFP4 especificado.
- El cargador rechaza cualquier revisión del modelo base distinta de `26291f793822fb6be9555850f06dfe95f2d7e695` y verifica hashes, formas y dtypes al cargar.
- El formato es propietario y no es compatible con llama.cpp, Ollama, vLLM, TGI ni transformers estándar.
- Solo cubre los bloques 0 a 35; los bloques 36 a 47 conservan NVFP4 porque concentran aproximadamente la mitad de la pérdida de los expertos a 3 bits.
- Degradación medida en MMLU-Pro de 3,0 puntos (no significativa estadísticamente, p 0,33 y 0,24), con intervalos de confianza amplios en las mediciones de velocidad.
- Las mediciones se hicieron con una sola semilla y en una única GB10; no hay datos de robustez en otras configuraciones de hardware.
- Riesgo de sesgos y alucinaciones heredado del modelo base Qwen3-Omni, no evaluado en este repositorio.
- La licencia Apache 2.0 permite uso comercial, pero los pesos originales son de Alibaba Cloud y este repositorio es una copia de menor precisión de algunos tensores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4-hibana-w3
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Checkpoint NVFP4 complementario: https://huggingface.co/yemara/Qwen3-Omni-30B-A3B-Instruct-NVFP4
- Motor Hibana: https://github.com/sharar-project/hibana
- Dataset de calibración open-perfectblend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset de calibración aya_dataset: https://huggingface.co/datasets/CohereLabs/aya_dataset
