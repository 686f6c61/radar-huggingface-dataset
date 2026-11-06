# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 es una cuantización de investigación (research preview) del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicada por el usuario txgsync. No se trata de un modelo nuevo, sino de un empaquetado experimental que aplica codificación trellis (trellis-coded quantization, TCQ) a los pesos de los expertos enrutados del modelo base, reduciendo cada peso de experto a 3,125 bits. El resultado ocupa unos 47,2 GB en expertos frente a los 120,8 B de parámetros enrutados del original, y está pensado para ejecutarse en el motor NanoSeedLM (CUDA en Linux y Windows, Metal en macOS).

El modelo base es un Mixture of Experts multimodal con pipeline image-text-to-text, licencia Qwen Community 1.0 y una tabla PLE n-gram de 32 GB que permanece en disco. Esta versión concreta es la más agresiva de la familia TCQ publicada por el autor: prioriza huella de memoria (unos 55 GB residentes) sobre fidelidad respecto a BF16, con una divergencia KL media de 0,0778 y un 90,40 % de acuerdo top-1 en wikitext-2.

Es relevante porque demuestra que la cuantización trellis a ~3 bits por peso de experto puede llevar un MoE de más de 56 B de parámetros totales a GPUs de 16 GB con 64 GB de RAM de sistema, a costa de una degradación medible pero acotada. No obstante, es un artefacto de investigación: no es compatible con mlx-vlm ni oMLX, no se han probado entradas de imagen o vídeo y su salida no es idéntica a la del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, transformer con torre de visión y cabeza MTP; expertos enrutados codificados con trellis (TCQ) |
| Parámetros totales | 56.687.443.859 (56,7 B) según safetensors del repo |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la model card; el ejemplo de servidor usa `--ctx 32768` |
| Tipos de cuantización | Expertos enrutados: trellis K=3, 3,125 bits/peso (TCQ3). Pesos densos: 8-bit MLX. Tabla PLE: 4-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (pesos densos, tabla PLE, torre de visión y cabeza MTP) + ficheros `.blkt` propietarios para los expertos trellis |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal con 120,8 B de parámetros enrutados, torre de visión y una cabeza MTP (multi-token prediction). Esta ficha no modifica el entrenamiento: es una recuantización de los pesos. Los expertos enrutados de las capas 0 a 47 y de la capa 48 (cabeza MTP), correspondientes a `gate_proj`, `up_proj` y `down_proj`, se codifican con trellis K=3 y estados de 12 bits: cada peso es el código de una ventana de 12 bits de un flujo de bits, y pesos vecinos comparten bits. No se almacena codebook; el valor se obtiene con una multiplicación-suma fija sobre la ventana. La técnica proviene de QTIP (arXiv:2406.11235).

Los pesos densos se toman de mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp en 8-bit MLX, y la tabla PLE n-gram (32 GB, 4-bit MLX) permanece en disco con la page cache gestionando las filas leídas. Las estadísticas de activación para la cuantización provienen del imatrix de Unsloth. El motor de ejecución es NanoSeedLM, con kernels CUDA y Metal; en GPU los expertos enrutados residen en memoria host y una caché mantiene en VRAM los usados.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Procesamiento image-text-to-text según el pipeline declarado, aunque el autor indica que no se probaron entradas de imagen ni de vídeo.
- Razonamiento y código: el autor reporta velocidad de decodificación medida con un prompt de código.
- Predicción multi-token mediante la cabeza MTP incluida en el empaquetado.
- Servicio de API compatible con OpenAI a través de `nslm-serve`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y uso como agente: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cuantización trellis en investigación: reproducir las mediciones de KL y perplejidad del autor sobre wikitext-2 para comparar TCQ3 con otras técnicas de cuantización en un MoE real de 56,7 B de parámetros.
- Inferencia local en GPU de consumo: desplegar un MoE multimodal en una RTX 4080 de 16 GB con 64 GB de RAM de sistema, manteniendo los expertos en memoria host y cacheando en VRAM los activos, gracias a los 47,2 GB de expertos codificados.
- Estación de trabajo Apple Silicon: ejecutar el modelo en un Mac de 96 GB mediante los kernels Metal de NanoSeedLM, con los ~55 GB residentes que indica el autor.
- Servicio de chat interno: levantar una API compatible con OpenAI con `nslm-serve --ctx 32768` para prototipos de conversación, asumiendo la degradación de calidad respecto a BF16.
- Estudio de compromiso memoria-calidad: comparar este pack con TCQ3-D4 y TCQ4 del mismo autor para elegir el punto de la curva KL/memoria adecuado a cada máquina.
- Pruebas de decodificación especulativa con MTP: aprovechar la cabeza MTP incluida para experimentar con multi-token prediction en el motor NanoSeedLM.
- Benchmarking de decodificación en hardware modesto: el autor reporta 61,3 tok/s en RTX 4080 y 48,8 tok/s en M4 Max con los pesos densos de 4 bits de las primeras builds.

## Benchmarks y rendimiento

Calidad medida por el autor como divergencia KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2:

| Métrica | Este pack | BF16 |
|---|---|---|
| KLD media | 0,0778 ± 0,0008 | 0 |
| KLD mediana | 0,0217 | 0 |
| KLD percentil 99 | 0,939 | 0 |
| Acuerdo top-1 | 90,40 % | 100 % |
| Perplejidad | 3,865 | 3,802 |

Comparación con los packs de Unsloth medidos del mismo modo:

| Pack | Bits por peso de experto | KLD media |
|---|---|---|
| Este pack (TCQ3) | 3,125 | 0,0778 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Velocidad de decodificación (prompt de código, 256 tokens, pesos densos 4-bit MLX de las primeras builds; el autor advierte que los densos 8-bit de esta release leen 1,7 veces más bytes y pueden ser más lentos):

| Máquina | Decodificación (tok/s) |
|---|---|
| RTX 4080 (16 GB), caché automática de expertos | 61,3 |
| M4 Max (128 GB) | 48,8 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de tareas en la información disponible.

## Requisitos de hardware

- Memoria residente estimada: unos 55 GB (expertos 47,2 GB + densos 8-bit MLX + torre de visión + cabeza MTP). La tabla PLE de 32 GB queda en disco.
- Configuración mínima indicada por el autor: GPU de 16 GB con 64 GB de RAM de sistema, o Mac de 96 GB (un Mac de 64 GB no está probado).
- GPU recomendadas: RTX 4080 de 16 GB validada por el autor; cualquier GPU con 16 GB o más y 64-128 GB de RAM. No hay datos para A100 ni H100.
- Cabe en GPU de consumo: sí, en RTX 4080 de 16 GB, con expertos en memoria host y caché en VRAM.
- Despliegue: exclusivamente mediante el motor NanoSeedLM (`nslm-chat`, `nslm-serve` con API compatible con OpenAI). mlx-vlm y oMLX no pueden cargarlo todavía; llama.cpp solo se usó para medir la KL escribiendo los pesos en un GGUF Q8_0 de Unsloth, no como runtime de este pack.
- Latencia y throughput: 61,3 tok/s en RTX 4080 y 48,8 tok/s en M4 Max con densos 4-bit; sin cifras para esta release con densos 8-bit.

## Comparativa con modelos similares

| Modelo | Expertos (bits/peso) | Memoria residente | KLD media vs BF16 | Licencia | Runtime |
|---|---|---|---|---|---|
| Este pack (TCQ3) | 3,125 | ~55 GB | 0,0778 | qwen-community-1.0 | NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 | 3,458 | ~60 GB | 0,0638 | qwen-community-1.0 | NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | 4,125 | ~70 GB | 0,0415 | qwen-community-1.0 | NanoSeedLM |
| Unsloth UD-IQ3_XXS (Qwen3.8-Flash-Next-GGUF) | 3,331 | no disponible | 0,0735 | qwen-community-1.0 | llama.cpp |
| Qwen/Qwen3.8-Flash-Next (BF16) | 16 | no disponible | 0 | qwen-community-1.0 | múltiples |

## Limitaciones y advertencias

- Research preview: la salida no es idéntica a la del modelo original.
- Incompatible con mlx-vlm y oMLX: el cargador MLX no tiene kernels trellis.
- El autor no probó entrada de imagen ni de vídeo, pese al pipeline image-text-to-text declarado.
- El formato 4-bit MLX de la tabla PLE no está medido frente a BF16; la KL reportada usa la tabla Q8_0 de Unsloth.
- Las cifras de velocidad provienen de un único PC (RTX 4080) y un único Mac (M4 Max), y corresponden a builds con densos 4-bit; esta release usa densos 8-bit y puede ser más lenta.
- Calidad inferior a cuantizaciones de 4 bits: la KLD de 0,0778 es peor que UD-IQ3_XXS (0,0735) pese a usar menos bits, y muy superior a UD-Q4_K_XL (0,0304).
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia Qwen Community 1.0: revisar sus condiciones antes de cualquier uso comercial.
- Dependencia de un runtime no estándar (NanoSeedLM) y de ficheros `.blkt` propietarios, lo que complica la portabilidad y el soporte en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Pack TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Pack TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Pesos densos 8-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF e imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Documentación de expertos trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Guía de compilación: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guía de ejecución y servicio: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Formato de carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Mediciones de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Pack relacionado P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
