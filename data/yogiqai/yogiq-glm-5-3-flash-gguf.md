# YogiQAI/YogiQ-GLM-5.3-Flash-GGUF

## Resumen
YogiQ GLM-5.3-Flash es una cuantización GGUF del modelo zai-org/GLM-5.3-Flash, publicada por YogiQAI. El modelo base es un transformer MoE de 320B parámetros (313.326.811.966 según safetensors) con aproximadamente 18B parámetros activos por token, orientado a tareas de imagen-texto (pipeline image-text-to-text) y conversación. La cuantización se ha realizado a partir de los pesos oficiales FP8 de Z.ai, con colocación de bits guiada por una medición directa de sensibilidad bloque a bloque.

El interés de esta ficha radica en que el autor ofrece dos niveles de cuantización optimizados para hardware concreto: Spark (108,3 GiB), diseñado para caber en una única NVIDIA DGX Spark de 121 GiB con contexto de 16K y visión, y Prime (118,0 GiB), para sistemas de ~125 GiB o más (dos Sparks, Mac Studio de 192 GB o 4 GPUs de 32 GB). Ambos ficheros son GGUF estándar para llama.cpp (commit 330f018 o posterior, arquitectura `glm5-next`) y mantienen soporte de visión mediante un proyector F16 incluido.

La relevancia actual está en la optimización extrema de la colocación de bits: el autor documenta que el bloque de capas MoE 31–37 aporta una ganancia de perplexidad tres veces mayor que el peor bloque para el mismo coste en bytes, lo que permite reducir el tamaño manteniendo la calidad. La licencia MIT del modelo base facilita su uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 45 capas (3 densas + 42 MoE), 288 expertos enrutados + 1 compartido por capa MoE, top-8 routing, 34 capas de atención linear KDA y 11 capas de atención DSA/MLA |
| Parametros totales | 313.326.811.966 (~320B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | 16K (configuración validada en DGX Spark; no se especifica máximo oficial del modelo base) |
| Tipos de cuantizacion | IQ3_XXS, IQ2_S, Q6_K, Q8_0, BF16, F32 (mezcla por tensor); 2,97 bits/peso (Spark), 3,23 bits/peso (Prime) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (multishard, 3 ficheros por tier) + proyector de visión F16 en GGUF |

## Arquitectura y entrenamiento
El modelo base GLM-5.3-Flash es un transformer Mixture-of-Experts de 320B parámetros con unos 18B activos por token. Consta de 45 capas: 3 densas y 42 MoE. Cada capa MoE contiene 288 expertos enrutados más 1 experto compartido, con enrutamiento top-8. La atención combina 34 capas de atención linear KDA (Kimi-style Delta Attention) y 11 capas de atención DSA/MLA. El 95% de los parámetros corresponde a los tres tensores de expertos enrutados por capa MoE (gate, up y down), lo que concentra el esfuerzo de cuantización en esos tensores.

La cuantización de YogiQAI parte de los pesos oficiales FP8 de Z.ai, convertidos a BF16 GGUF mediante el conversor de llama.cpp y cuantizados con `llama-quantize` usando la importance matrix de Unsloth para GLM-5.3-Flash (bloques 0–44). La innovación principal es la colocación de bits por sensibilidad medida: el autor partió de una mezcla uniforme de 2/3 bits (106 GiB, PPL 3,539) y fue sustituyendo bloques de 7 capas MoE por tensores gate/up IQ3_XXS copiados del tier Prime, midiendo la perplexidad en cada paso. Los resultados muestran que el bloque 31–37 aporta una ganancia de −0,100 en PPL (3,439) frente a −0,034 del bloque 38–44, para el mismo coste de +1,9 GiB por bloque. El tier Spark upgradea los dos mejores bloques (24–37) y compensa el espacio tomando el núcleo no-experto de Q8_0 a Q6_K, casi sin pérdida porque el núcleo representa solo ~5% del modelo. No se incluye la capa MTP de drafting especulativo, por lo que estos ficheros no permiten decodificación especulativa.

## Capacidades
- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento y matemáticas (hereda las capacidades del modelo base GLM-5.3-Flash, no verificadas de forma independiente en esta cuantización).
- Generación de código (capacidad del modelo base, no medida en esta ficha).
- Visión imagen-texto: el proyector F16 `mmproj-GLM-5.3-Flash-F16.gguf` (1,13 GB) permite entrada de imágenes junto con texto.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta cuantización.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües limitadas a en y zh según los tags del repositorio.
- Sin decodificación especulativa: la capa MTP draft no está incluida en los ficheros GGUF.

## Casos de uso
- Despliegue en una única NVIDIA DGX Spark: el tier Spark (108,3 GiB) cabe en los 121 GiB de la máquina con 16K de contexto y visión, dejando 5 GiB de margen. Adecuado para laboratorios o investigadores que quieran ejecutar un MoE de 320B en hardware de borde sin cluster.
- Inferencia en Mac Studio de 192 GB: el tier Prime (118,0 GiB) entra en un Mac Studio con memoria unificada de 192 GB, permitiendo ejecutar el modelo completo con visión y contexto extendido en un equipo de sobremesa.
- Servicio de visión imagen-texto: el proyector F16 incluido permite tareas de descripción de imágenes, extracción de información de documentos escaneados y respuesta a preguntas sobre imágenes en inglés y chino.
- Atención al cliente multilingüe (en/zh): conversaciones multi-turno con contexto de 16K para clientes angloparlantes y sinohablantes, aprovechando el tamaño del modelo para mantener coherencia en diálogos largos.
- Investigación sobre cuantización: los ficheros y el write-up del autor (medición de sensibilidad bloque a bloque, resultado negativo sobre codificación entrópica de índices del codebook) sirven como referencia reproducible para estudiar el impacto de la colocación de bits en MoE de gran tamaño.
- Evaluación comparativa de GGUFs: el autor publica mediciones de perplexidad de otras cuantizaciones (Maya-M, GSQ-RCO) en el mismo entorno (CPU x86, 20 hilos, wikitext-2), lo que permite usar estos ficheros como baseline en estudios de cuantización.
- Prototipado local con llama.cpp: al ser GGUF estándar para llama.cpp (commit 330f018+), se integra en herramientas derivadas (llama-server, interfaces compatibles con endpoints) para pruebas de concepto sin infraestructura de GPU dedicada.

## Benchmarks y rendimiento
| Metrica | Spark | Prime | Referencia BF16 |
|---|---|---|---|
| Perplexity wikitext-2, 20×2048 | 3,354 ± 0,047 | 3,253 ± 0,045 | no disponible en esa configuración |
| Perplexity wikitext-2, 30×512 | 2,765 ± 0,060 | 2,702 ± 0,059 | 2,2474 |
| Delta vs BF16 (30×512) | +23% | +20% | — |
| Tamano | 108,3 GiB (116,3 GB) | 118,0 GiB (126,7 GB) | — |
| Bits por peso | 2,97 | 3,23 | — |

Mediciones del autor en una máquina x86 (CPU, 20 hilos), llama.cpp commit 330f018, sobre wikitext-2 (test split). La comparación con Maya-M y GSQ-RCO son remediciones del autor, no cifras publicadas por sus autores originales. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM/memoria estimada: tier Spark 108,3 GiB (cabe en DGX Spark de 121 GiB con 16K de contexto y visión, 5 GiB de margen); tier Prime 118,0 GiB (requiere ~125 GiB o más).
- GPU recomendadas: NVIDIA DGX Spark (tier Spark); configuraciones de ~125 GiB como dos DGX Spark, Mac Studio de 192 GB o 4 GPUs de 32 GB (tier Prime). No se documenta compatibilidad con A100/H100/RTX 4090 en la información disponible.
- GPU de consumo: no cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, etc.) por el tamaño de los ficheros; no se documenta ninguna configuración de consumo viable.
- Opciones de despliegue: llama.cpp (commit 330f018 o posterior, arquitectura `glm5-next`) y cualquier herramienta construida sobre llama.cpp; los ficheros están divididos con `llama-gguf-split --split-max-size 45G` y se apunta llama.cpp al primer shard. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles. El autor solo reporta perplexidad y entorno de medición (CPU x86, 20 hilos), no velocidad de generación.

## Comparativa con modelos similares
| Modelo | Tamano | PPL 20×2048 | PPL 30×512 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YogiQ Prime | 118,0 GiB | 3,253 ± 0,045 | 2,702 ± 0,059 | MIT | GGUF en Hugging Face (shards en subida a 6 nov 2026) |
| YogiQ Spark | 108,3 GiB | 3,354 ± 0,047 | 2,765 ± 0,060 | MIT | GGUF completo en Hugging Face |
| Variante de un solo bloque del autor (no publicada) | 108,1 GiB | 3,439 ± 0,048 | 2,871 ± 0,064 | MIT | no publicada |
| Maya-M (peasantsmith/GLM-5.3-Flash-Maya-GGUF) | no disponible en la información | remedición del autor, valor no incluido en el extracto | no disponible | no disponible | Hugging Face |
| GSQ-RCO | no disponible en la información | remedición del autor, valor no incluido en el extracto | no disponible | no disponible | no disponible |

La comparación con Maya-M y GSQ-RCO procede de remediciones del autor con el mismo texto y ajustes; los autores originales evalúan con criterios distintos (precisión zero-shot y divergencia KL) y apuntan a hardware diferente, por lo que las cifras no son directamente comparables. No se dispone de comparativas con otros modelos de la misma categoría (por ejemplo, otros MoE de ~300B en GGUF) en la información proporcionada.

## Limitaciones y advertencias
- Idiomas limitados a inglés y chino según los tags del repositorio; no se garantiza rendimiento en castellano.
- La perplexidad de las cuantizaciones es un 20–23% superior a la referencia BF16 en la configuración 30×512, lo que implica pérdida de calidad medible respecto al modelo original.
- No incluye la capa MTP de drafting especulativo: no es posible usar decodificación especulativa con estos ficheros.
- El tier Prime estaba aún subiendo shards en la fecha de actualización (6 de noviembre de 2026); verificar la integridad completa antes de desplegar.
- El tier Spark está optimizado para una DGX Spark con 16K de contexto; contextos mayores no están validados y podrían no caber con el margen de 5 GiB.
- No hay datos publicados de benchmarks de tareas (MMLU, HumanEval, GSM8K) para esta cuantización; el rendimiento en tareas concretas no está verificado de forma independiente.
- Riesgo de alucinación inherente al modelo base; no cuantificado en la información disponible.
- Sesgos del modelo base no documentados en la información disponible.
- La licencia MIT del modelo base permite uso comercial, pero deben respetarse las condiciones de las herramientas derivadas de llama.cpp y de los pesos originales de Z.ai; no se detallan restricciones adicionales.
- El tamaño de 108–118 GiB limita el despliegue a hardware de gama alta (DGX Spark, Mac Studio de 192 GB, multi-GPU de 32 GB); no es viable en GPUs de consumo.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/YogiQAI/YogiQ-GLM-5.3-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Write-up del autor (colocación de bits y medición de sensibilidad): https://yogiq.ai/research/glm-5-3-flash-on-one-dgx-spark
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantización Maya-M: https://huggingface.co/peasantsmith/GLM-5.3-Flash-Maya-GGUF
