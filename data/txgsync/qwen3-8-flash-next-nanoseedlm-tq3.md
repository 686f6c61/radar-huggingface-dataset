# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ3 es una cuantización de investigación del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario txgsync. Se trata de un empaquetado que combina los pesos densos en 8 bits MLX con los expertos enrutados del modelo original codificados con trellis (K = 3, estados de 12 bits) a 3,125 bits por peso, reduciendo los 120,8 B de pesos de expertos a 47,2 GB. El resultado es un modelo MoE de 56,69 B de parámetros totales (según safetensors) ejecutable en GPUs de 16 GB con 64 GB de RAM del sistema y en Macs de 96 GB.

El modelo base Qwen3.8-Flash-Next es un MoE de aproximadamente 125 B de parámetros principales más 51 B de embeddings N-gram, con 6 B de parámetros activos por token, desarrollado por Qwen (Alibaba). Esta variante concreta no es un modelo nuevo: es un experimento de compresión extrema que busca preservar la calidad del BF16 con una huella de memoria muy reducida, a costa de una divergencia KL medible y de requerir un motor de inferencia específico (NanoSeedLM), ya que mlx-vlm y oMLX todavía no cargan los expertos trellis.

Es relevante ahora porque demuestra una vía práctica para servir modelos MoE de gran tamaño en hardware de consumo, con métricas de calidad explícitas (KLD media de 0,0778 frente a BF16) y velocidades medidas (61,3 tok/s en una RTX 4080 de 16 GB, 48,8 tok/s en un M4 Max). No obstante, es una vista previa de investigación, no un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.8-Flash-Next), con expertos enrutados codificados con trellis |
| Parámetros totales | 56.687.443.859 (safetensors); el modelo base declara ~125 B principales + 51 B de embeddings N-gram |
| Parámetros activos | 6 B por token (según el modelo base) |
| Longitud de contexto | 32.768 tokens en el ejemplo de servicio (`--ctx 32768`); el máximo del modelo base no está disponible en la información proporcionada |
| Tipos de cuantización | Expertos enrutados: trellis K = 3, 3,125 bits/peso; pesos densos: 8 bits MLX; tabla PLE: 4 bits MLX; MTP head incluido |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (densos, PLE, vision tower, MTP head) + ficheros `.blkt` (expertos trellis); repo de 86,5 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 6 B de parámetros activos por token y una tabla adicional de embeddings N-gram (PLE) de 32 GB en esta variante. Esta publicación no entrena nada: reempaqueta los pesos del modelo original. Los expertos enrutados (`gate_proj`, `up_proj`, `down_proj` de las capas 0 a 47 y de la cabeza MTP, capa 48) se codifican con trellis K = 3: cada peso es un código de una ventana de 12 bits de un flujo de bits, y pesos vecinos comparten bits. No se almacena codebook; el valor se obtiene con una suma-multiplicación fija sobre la ventana. Los pesos densos provienen de `mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp` en 8 bits MLX, y las estadísticas de activación para la cuantización proceden de la imatrix de Unsloth.

La innovación técnica es la codificación trellis aplicada a expertos, inspirada en QTIP (arXiv:2406.11235), que permite 3,125 bits por peso con una divergencia KL moderada. La tabla PLE de 32 GB permanece en disco y la caché de página mantiene las filas leídas durante la ejecución. En GPU, los expertos enrutados residen en memoria del sistema y una caché mantiene en VRAM los usados. El motor NanoSeedLM (CUDA en Linux y Windows, Metal en macOS) es el único que implementa los kernels trellis. No se dispone de información sobre la composición del dataset de entrenamiento del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multiturno, con plantilla de chat incluida.
- Razonamiento y código: el modelo base se posiciona explícitamente en capacidades de programación superiores a Qwen3.7-Plus según su repositorio.
- Entrada image-text-to-text declarada en el pipeline, con vision tower incluido en los ficheros; sin embargo, el autor indica que no probó entrada de imagen ni vídeo.
- Cabeza MTP (multi-token prediction) incluida, lo que habilita decodificación especulativa en el motor.
- Servicio de API compatible con OpenAI mediante `nslm-serve`.
- Capacidades de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en GPU de consumo: con una RTX 4080 de 16 GB y 64 GB de RAM, el modelo cabe gracias a que los expertos viven en memoria del sistema y solo se cachean en VRAM los usados, con 61,3 tok/s medidos.
- Estación de trabajo en Mac: en un M4 Max de 128 GB se obtienen 48,8 tok/s, lo que permite usar el modelo como asistente de código local sin conexión.
- Servicio interno compatible con OpenAI: `nslm-serve --ctx 32768 --port 8080` expone el modelo para integrarlo en herramientas que ya consumen la API de OpenAI, con contexto de 32K para conversaciones largas o documentos extensos.
- Evaluación de técnicas de compresión: el pack sirve para reproducir las mediciones de KLD y comparar trellis frente a cuantizaciones GGUF de Unsloth en el mismo pipeline de llama.cpp.
- Investigación sobre decodificación especulativa: la cabeza MTP incluida permite experimentar con predicción multi-token en el motor NanoSeedLM.
- Prototipado de asistentes con contexto largo: 32.768 tokens cubren casos de análisis de documentos medianos y conversaciones multi-turno, siempre que se acepte la divergencia frente a BF16.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2:

| Métrica | Este pack (TQ3) | BF16 |
|---|---|---|
| KLD media | 0,0778 ± 0,0008 | 0 |
| KLD mediana | 0,0217 | 0 |
| KLD percentil 99 | 0,939 | 0 |
| Acuerdo top-1 | 90,40% | 100% |
| Perplejidad | 3,865 | 3,802 |

Comparación con packs de Unsloth medidos del mismo modo:

| Pack | Bits por peso de experto | KLD media |
|---|---|---|
| Este pack (TQ3) | 3,125 | 0,0778 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Velocidad de decodificación (prompt de código, 256 tokens, pesos densos 4-bit MLX de las primeras builds; el autor advierte que los densos 8-bit de esta release leen 1,7 veces más bytes y pueden ser más lentos):

| Máquina | Tokens/s |
|---|---|
| RTX 4080 (16 GB), caché automática de expertos | 61,3 |
| M4 Max (128 GB) | 48,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria residente estimada: unos 55 GB con este pack (expertos 47,2 GB + densos 8-bit + vision tower + MTP head); la tabla PLE de 32 GB queda en disco.
- Configuración mínima indicada por el autor: GPU de 16 GB con 64 GB de RAM del sistema; Mac de 96 GB (un Mac de 64 GB no está probado).
- GPUs recomendadas: RTX 4080 de 16 GB (medida), GPUs de 24 GB o más con 96-128 GB de RAM para el pack TQ4 de mayor calidad.
- Cabe en GPU de consumo: sí, en el rango de 16 GB de VRAM siempre que el sistema tenga 64 GB de RAM o más, porque los expertos enrutados residen en host memory.
- Despliegue: exclusivamente mediante el motor NanoSeedLM (`nslm-chat` y `nslm-serve` con API compatible con OpenAI). mlx-vlm y oMLX no pueden cargarlo todavía; no hay soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos trellis.
- Rendimiento medido: 61,3 tok/s en RTX 4080 y 48,8 tok/s en M4 Max, con la salvedad de que corresponden a builds con densos 4-bit.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KLD vs BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (TQ3) | 56,69 B totales, 6 B activos | 32.768 en servicio | 0,0778 | qwen-community-1.0 | NanoSeedLM (CUDA/Metal) |
| TQ3-D4 (mismo autor) | igual base | igual | 0,0638 | qwen-community-1.0 | NanoSeedLM; 16 GB GPU + 96-128 GB RAM |
| TQ4 (mismo autor) | igual base | igual | 0,0415 | qwen-community-1.0 | NanoSeedLM; 24 GB GPU + 96-128 GB RAM o Mac de 128 GB |
| Unsloth UD-Q3_K_XL | igual base | según llama.cpp | 0,0593 | qwen-community-1.0 | GGUF en llama.cpp |

Frente a las alternativas GGUF de Unsloth, este pack ocupa menos bits por peso de experto (3,125 frente a 3,720 del UD-Q3_K_XL) pero obtiene peor KLD (0,0778 frente a 0,0593), y a cambio exige un motor específico. Los packs TQ3-D4 y TQ4 del mismo autor ofrecen mejor calidad a costa de más memoria.

## Limitaciones y advertencias

- Es una vista previa de investigación: la salida no es idéntica a la del modelo original.
- Divergencia medible frente a BF16: KLD media de 0,0778 y acuerdo top-1 del 90,40%, con un percentil 99 de 0,939 que indica colas de error apreciables.
- Compatibilidad muy restringida: solo NanoSeedLM; mlx-vlm y oMLX no tienen kernels trellis, y no hay soporte en vLLM, llama.cpp, Ollama ni TGI.
- Entrada de imagen y vídeo no probada, pese a que el pipeline declarado sea image-text-to-text.
- La tabla PLE en 4-bit MLX no está medida frente a BF16; las cifras de KL usan la tabla Q8_0 de Unsloth.
- Las mediciones de velocidad proceden de un único PC (RTX 4080) y un único Mac (M4 Max), y corresponden a builds con densos 4-bit, no a los densos 8-bit de esta release.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Licencia Qwen Community License 1.0: conviene revisar sus condiciones antes de cualquier uso comercial, ya que no es una licencia permisiva estándar.
- Riesgo de alucinación y sesgos del modelo base: no documentados en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Pesos densos 8-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF de Unsloth (imatrix): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Motor NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Guía de compilación: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guía de ejecución y servicio: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Documentación de expertos trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Formato de carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Mediciones de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Pack TQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4
- Pack TQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
