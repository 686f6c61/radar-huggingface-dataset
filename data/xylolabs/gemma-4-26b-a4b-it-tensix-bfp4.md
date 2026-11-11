# Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4

## Resumen
`Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4` es una cuantización GPTQ del modelo `google/gemma-4-26B-A4B-it` de Google, publicada por Xylolabs y orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El autor redondea las capas lineales del transformer a formato block floating point de 4 bits (`ttnn.bfloat4_b`, BFP4), de modo que TT-NN puede empaquetar los pesos sin volver a redondear. Los ficheros se distribuyen en bf16, pero cada valor ya está alineado a la rejilla BFP4.

El modelo base es un transformer con arquitectura Mixture-of-Experts (el sufijo A4B indica aproximadamente 4.000 millones de parámetros activos sobre un total de 26.544 millones) y pipeline `image-text-to-text`, es decir, acepta entradas multimodales de imagen y texto. La cuantización reduce el peso empaquetado a 15,27 GB con una media de 4,84 bits por peso, frente a los 50,47 GB del modelo en BF16. Solo se redondearon y evaluaron las capas del modelo de lenguaje; el codificador visual (`vision_tower`, `embed_vision`) queda intacto en bf16.

La relevancia de esta ficha es doble: por un lado es una de las primeras publicaciones que adapta Gemma 4 a la pila de software de Tenstorrent (`tt-metal`, `ttnn`, `tt-forge`), un ecosistema de aceleradores alternativo a GPU; por otro, el autor documenta explícitamente que las pruebas se hicieron sobre simulador (`ttsim`), no sobre hardware físico, lo que conviene tener presente antes de cualquier despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), multimodal imagen-texto |
| Parametros totales | 26.544.133.710 (~26,5 B) |
| Parametros activos | ~4 B (según nomenclatura A4B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en router, embeddings, normas y torre visual; media de 4,84 bits por peso |
| Idiomas soportados | no disponible (calibración en inglés y coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 con valores alineados a rejilla BFP4), índice `model.safetensors.index.json`, `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura del Gemma 4 26B-A4B de Google: un transformer con capas de atención y MLP densa más un bloque de expertos enrutados (MoE), distribuido en 30 capas según la tabla de formatos de la model card. La cuantización no es un entrenamiento nuevo, sino un redondeo post-entrenamiento con GPTQ: se aplica una búsqueda de exponente por bloque y se calibra sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una única matriz Hessiana por capa para sus proyecciones gate y up, mientras que la proyección down de cada experto usa su propia Hessiana o, si vio pocos tokens de calibración, un redondeo al vecino más cercano.

La innovación técnica principal es el uso del formato block floating point de 4 bits de TT-NN, que comparte un exponente por bloque y reduce el coste de memoria y ancho de banda en las NPU Tensix. El autor incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban que el empaquetado en `bfloat4_b` no altera ningún valor, y confirma que los mismos pesos también se empaquetan de forma exacta en `bfloat8_b`. No se documenta en la información disponible el volumen total de tokens de entrenamiento del modelo base, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades
- Generación de texto conversacional con plantilla de chat (`apply_chat_template`) y soporte de roles system/user/assistant.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`), con torre visual en bf16 sin cuantizar.
- Razonamiento y respuesta a preguntas: la evaluación del autor reporta 33 de 33 respuestas correctas en su conjunto de prueba.
- Capacidades multilingües: la calibración incluye coreano además de inglés, aunque no se detalla la lista oficial de idiomas soportados.
- Ejecución en aceleradores Tenstorrent Tensix mediante `ttnn.bfloat4_b` y `ttnn.bfloat8_b`.
- Compatibilidad con la librería `transformers` para inferencia en GPU/CPU convencional.
- Soporte de tool calling, function calling y agentes multi-paso: no disponible en la información proporcionada.

## Casos de uso
- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el modelo está empaquetado para que TT-NN lo cargue directamente en memoria DRAM sin re-redondeo, lo que permite servir inferencia de un MoE de 26B en aceleradores de bajo consumo en lugar de GPU.
- Investigación en cuantización de bajo bit: los scripts `pack_tensix.py` y `verify_grid.py` permiten reproducir la verificación bit a bit del redondeo BFP4, útil para estudiar el impacto de 4,84 bits por peso en la calidad del modelo.
- Prototipado multimodal en entornos con presupuesto de memoria ajustado: con 15,27 GB empaquetados, el modelo cabe en tarjetas consumer de 24 GB (por ejemplo RTX 4090) para pruebas de imagen-texto, aunque la torre visual permanece en bf16.
- Evaluación comparativa de formatos de cuantización: la model card ofrece métricas KL y top-1 frente a BF16 y a Q4_K_M de llama.cpp, lo que facilita estudios de degradación por formato.
- Docencia y experimentación con arquitecturas MoE: el modelo permite analizar el comportamiento de expertos enrutados con una huella de memoria reducida a un tercio del original.
- Integración en pipelines de `transformers` para generación de texto con contexto de chat: el quickstart de la model card muestra un flujo completo de tokenización, generación y decodificación listo para usar.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| **Este modelo (BFP4)** | 4,84 | 15,271 | 0,14638 | 87,24 | 33 de 33 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,1249 | 88,16 | 33 de 33 | 0 |

Las métricas de KL y top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: ~15,3 GB con pesos BFP4 empaquetados; en bf16 sin empaquetar el modelo base ocupa ~50,5 GB.
- GPU recomendadas: no hay recomendaciones oficiales del autor; por tamaño, una RTX 4090 (24 GB) o A100/H100 (40-80 GB) permiten cargar el modelo en `transformers` con `device_map="auto"`.
- Cabe en GPU consumer: sí, en tarjetas de 24 GB o más (RTX 3090, RTX 4090), siempre que se respete el empaquetado BFP4 o se use `bfloat8_b`.
- Aceleradores Tensix: el demo oficial de tt-metal para Gemma 4 ejecuta el 26B-A4B en paralelo de tensores sobre cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o sobre un Wormhole T3K; no cabe en un solo chip. El demo no tiene opción `bfloat4_b` nativa.
- Opciones de despliegue: `transformers` (quickstart oficial), TT-NN/`tt-metal` v0.81.1 (probado en simulador `ttsim`), `tt-forge`/`tt-xla` (no probado aún con Gemma 4). No se documenta soporte de vLLM, llama.cpp u Ollama para este repositorio.
- Latencia y throughput: no disponibles; las pruebas se realizaron en simulador, no en hardware físico.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4 | 26,5 B (≈4 B activos) | no disponible | BFP4 (4,84 bits/peso) | Apache-2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (BF16) | 26,5 B (≈4 B activos) | no disponible | BF16 | Apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (mismo base) | 26,5 B (≈4 B activos) | no disponible | 5,32 bits/peso | Apache-2.0 | Hugging Face / llama.cpp |

La comparativa se limita al mismo modelo base en distintos formatos, ya que no se dispone de datos de benchmarks frente a otros modelos de la categoría. Frente a BF16, la versión BFP4 reduce el tamaño a un 30 % con una pérdida de top-1 de 12,76 puntos; frente a Q4_K_M, ocupa algo menos de espacio pero obtiene un KL ligeramente peor (0,146 frente a 0,125) y un top-1 inferior (87,24 % frente a 88,16 %).

## Limitaciones y advertencias
- Las pruebas en Tensix se realizaron sobre el simulador `ttsim` de Blackhole, no sobre hardware físico; el reparto multi-chip no se ejecutó.
- El demo oficial de tt-metal no soporta `bfloat4_b`; para usarlo hay que añadir una entrada en `precision_overrides.json` que empaquete atención, MLP densa y expertos en `bfloat8_b`.
- `tt-forge`/`tt-xla` no se ha probado con Gemma 4; su opción `bfp_bf4` re-redondea los pesos con un layout de bloque distinto, lo que alteraría los valores.
- Solo se cuantizó y evaluó el modelo de lenguaje; la torre visual permanece en bf16 y su calidad no se ha medido en esta publicación.
- La calibración se hizo con WikiText-2 y Wikipedia en coreano, lo que puede introducir sesgo hacia esos dominios e idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; la métrica de 33 de 33 respuestas correctas corresponde a un conjunto de prueba pequeño y no es representativa.
- La licencia Apache-2.0 se aplica a esta cuantización, pero conviene verificar los términos del modelo base de Google para uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-26B-A4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Demo de Gemma 4 en tt-metal: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en tags: arXiv:2607.02770
