# Veedy/Qwen3.8-Flash-Next-heretic-2-MLX-Serve-iQ-MLX-4.7bpw

## Resumen

Qwen3.8-Flash-Next-heretic-2-MLX-Serve-iQ-MLX-4.7bpw es una cuantización en formato MLX del modelo Qwen3.8-Flash-Next-heretic-2, publicada por el usuario Veedy en Hugging Face. El modelo base es una variante "abliterated" (con los mecanismos de rechazo eliminados mediante la herramienta Heretic de p-e-w) del Qwen3.8-Flash-Next original de Qwen, un modelo multimodal (imagen-texto a texto) con arquitectura de mezcla de expertos (MoE), atención dispersa (sparse attention), embeddings n-grama y una cabeza de decodificación multi-token prediction (MTP).

Esta versión concreta usa el esquema iQ-MLX-4.7bpw de ddalcu: los expertos enrutados se cuantizan a 4 bits con calibración por matriz de importancia (imatrix) y el resto de tensores a 8 bits, ocupando unos 75 GB residentes en memoria, lo que lo hace adecuado para Macs con 128 GB de memoria unificada. El proceso de construcción es notablemente quirúrgico: heretic-2 solo modifica 26 tensores en las capas 31–47, y el autor re-cuantizó únicamente esos tensores desde los pesos bf16 originales, manteniendo el resto idéntico al pack de referencia. Es relevante para usuarios de Apple Silicon que buscan un modelo multimodal grande y sin filtros de rechazo, con un rendimiento medido de hasta 225 tok/s en generación de JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con sparse attention, ngram embedding y cabeza MTP (familia Qwen3.8/4 experimental) |
| Parametros totales | 133.195.562.899 (~133 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (probado con prompts de 128k) |
| Tipos de cuantizacion | 4-bit imatrix-calibrado en expertos, 8-bit en el resto (~4,7 bpw efectivos) |
| Idiomas soportados | no disponibles |
| Licencia | qwen-community-1.0 (Qwen Community License) |
| Formato de pesos | safetensors (MLX, empaquetado para mlx-serve) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de la familia Qwen3.8-Flash-Next: un transformador con mezcla de expertos (MoE), mecanismos de atención dispersa (sparse attention), embeddings n-grama para acelerar la decodificación y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa nativa. Incluye además una torre de visión (vision tower), lo que habilita la entrada de imágenes junto con texto. Los detalles sobre el número de expertos activos, datos de entrenamiento o alineación (RLHF/DPO) del modelo base no están disponibles en la información proporcionada.

Sobre esta base, trohrbaugh aplicó Heretic, un proceso automatizado de "abliteration" que modifica selectivamente los pesos para eliminar los comportamientos de rechazo sin reentrenar. En este caso el proceso solo alteró 26 tensores en las capas 31–47: los `down_proj` de los expertos enrutados y compartidos, `linear_attn.out_proj` y `self_attn.o_proj`. Veedy re-cuantizó esos 26 tensores desde los pesos bf16 originales usando el conversor de mlx-serve v26.10.3 y la misma imatrix del pack de referencia (dataset ddalcu/mlx-serve-calibration), verificando que el procedimiento reproduce byte a byte los tensores originales del pack de ddalcu. El archivo `ngram_table.bin` debe permanecer junto a los shards, ya que se accede mediante mapeo en memoria en lugar de cargarse en RAM.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline image-text-to-text).
- Comprensión de imágenes: incluye la torre de visión del modelo base.
- Generación de código: HumanEval 95,7 % en la evaluación del autor.
- Razonamiento matemático: GSM8K 93/100 en la evaluación del autor.
- Modo thinking conmutable (toggle documentado en la tarjeta de ddalcu).
- Decodificación especulativa vía MTP (multi-token prediction), activable en mlx-serve.
- Cuantización KV opcional en el servidor.
- Sin mecanismos de rechazo (abliterated/uncensored): responde a peticiones que el modelo original declinaría.

## Casos de uso

- Asistentes multimodales en Apple Silicon: la torre de visión y el pipeline image-text-to-text permiten construir aplicaciones que analizan capturas, documentos escaneados o imágenes con preguntas en lenguaje natural, todo en local.
- Generación y análisis de código en local: con HumanEval en torno al 95 % y hasta 225 tok/s en JSON, es adecuado para autocompletado y agentes de código en un Mac de 128 GB sin depender de la nube.
- Procesamiento de prompts largos: el prefill medido de 4.455 tok/s con prompts de 128k permite indexar y consultar documentos extensos (contratos, repositorios, corpora) con latencias de prefill razonables.
- Servicios concurrentes ligeros: mantiene 183-205 tok/s con 2-4 streams simultáneos, suficiente para un pequeño equipo compartiendo una instancia local vía mlx-serve.
- Investigación sobre abliteration: al documentar el procedimiento de re-cuantización quirúrgica (solo 26 tensores modificados) y publicar la receta en `recipe/`, es un caso de estudio útil para estudiar cómo la abliteration afecta a modelos MoE cuantizados.
- Generación estructurada de datos (JSON/listas): los throughput medidos en JSON (225 tok/s) y listas (208 tok/s) lo hacen adecuado para extracción estructurada y pipelines de datos en local.

## Benchmarks y rendimiento

Datos publicados por el autor del pack. Entorno: Mac M5 Ultra (GPU de 64 núcleos, 256 GB), mlx-serve 26.10.3, MTP activado, thinking desactivado. La referencia "near-stock" es el mismo pack con pesos DERISKED de Blackfrost en lugar de heretic-2; el autor señala que las diferencias de puntuación están dentro del ruido con estos tamaños de muestra.

| Modelo | Refusals (harmful_behaviors / JBB, n=100) | GSM8K (100) | MMLU-Pro (300) | HumanEval (164) |
|---|---|---|---|---|
| Este modelo | 5 / 2 | 93 | 74,3 | 95,7 |
| Referencia near-stock | 88 / 86 | 89 | 74,7 | 93,9 |

| Throughput (prose / code / JSON / list) | 2 / 4 streams | Prompt 128k (prefill / decode) |
|---|---|---|
| 129 / 193 / 225 / 208 tok/s | 183 / 205 tok/s | 4.455 / 110 tok/s |

## Requisitos de hardware

- Memoria residente estimada: ~75 GB con esta cuantización (repo completo de 107,3 GB).
- Diseñado para Macs con 128 GB de memoria unificada; el benchmark se ejecutó en un M5 Ultra con 256 GB y GPU de 64 núcleos.
- En GPUs NVIDIA convencionales (RTX 4090, A100, H100) no cabe en una sola GPU con este formato MLX; este pack está orientado específicamente a Apple Silicon.
- Despliegue mediante mlx-serve (probado con la versión 26.10.3): `mlx-serve --model Veedy/Qwen3.8-Flash-Next-heretic-2-MLX-Serve-iQ-MLX-4.7bpw --serve`.
- No es compatible directamente con llama.cpp, Ollama, vLLM o TGI al estar en formato MLX; para esos runtimes habría que buscar packs GGUF u otros formatos del modelo base.
- Mantener `ngram_table.bin` junto a los shards de pesos (se accede vía mmap).
- Latencia/throughput medidos: 110 tok/s de decodificación con prompt de 128k; 183-205 tok/s con 2-4 streams concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto probado | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic-2, Veedy) | ~133 B | iQ-MLX 4,7 bpw | 128k (probado) | qwen-community-1.0 | Abliterated con Heretic, MTP y torre de visión |
| ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw | ~133 B | iQ-MLX 4,7 bpw | 128k (probado) | qwen-community-1.0 | Mismo layout, pesos near-stock con DERISKED |
| na0fu3y/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw | ~133 B | iQ-MLX 4,7 bpw | no disponible | qwen-community-1.0 | Abliteración de orcarouter; sin comparación publicada |

## Limitaciones y advertencias

- Modelo abliterated: los rechazos han sido eliminados y responderá a peticiones que el modelo original declinaría. Su uso conlleva riesgos éticos y legales significativos; el propio autor pide usarlo de forma responsable y conforme a la Qwen Community License.
- La licencia qwen-community-1.0 tiene restricciones para uso comercial (típicamente límites de usuarios mensuales y de ingresos característicos de las licencias comunitarias de Qwen); conviene revisar el archivo LICENSE antes de cualquier despliegue comercial.
- Los benchmarks del autor usan muestras pequeñas (n=100 en GSM8K y refusals, 164 en HumanEval, 300 en MMLU-Pro); las diferencias frente a la referencia están, según el autor, dentro del ruido estadístico.
- No hay datos oficiales de Qwen sobre este modelo: las cifras provienen del autor del pack, no de benchmarks independientes.
- El riesgo de alucinación no se evalúa en los benchmarks publicados; la abliteration puede degradar sutilmente el comportamiento del modelo en dominios sensibles.
- Los idiomas soportados y la longitud de contexto oficial no están documentados en la información disponible.
- Requiere hardware de gama alta (Mac con 128 GB o más de memoria unificada), lo que limita la accesibilidad.
- Formato MLX exclusivo: sin soporte directo en el ecosistema CUDA/vLLM.

## Enlaces

- Ficha del modelo: https://huggingface.co/Veedy/Qwen3.8-Flash-Next-heretic-2-MLX-Serve-iQ-MLX-4.7bpw
- Modelo base (heretic-2): https://huggingface.co/trohrbaugh/Qwen3.8-Flash-Next-heretic-2
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Pack de referencia de ddalcu: https://huggingface.co/ddalcu/Qwen3.8-Flash-Next-MLX-Serve-iQ-MLX-4.7bpw
- Pack alternativo abliterated (orcarouter): https://huggingface.co/na0fu3y/Qwen3.8-Flash-Next-Uncensored-MLX-Serve-iQ-MLX-4.7bpw
- mlx-serve (GitHub): https://github.com/ddalcu/mlx-serve
- Dataset de calibración imatrix: https://huggingface.co/datasets/ddalcu/mlx-serve-calibration
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
