# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 es una cuantización extrema del modelo Qwen3.8-Flash-Next de Qwen, publicada por el usuario txgsync bajo el paraguas del proyecto de investigación NanoSeedLM. Se trata de un empaquetado de 55 GB de memoria residente que comprime los 120.800 millones de parámetros de pesos de expertos enrutados del modelo original a 3,125 bits por peso mediante un códec trellis (TCQ), manteniendo los pesos densos en 8 bits. El objetivo es hacer viable un modelo MoE de gran tamaño en equipos de consumo con GPU de 12 o 16 GB y 64 GB de RAM.

La relevancia de este pack radica en su relación entre fidelidad y huella de memoria: su divergencia KL frente al modelo BF16 es de 0,0778, un 16 % inferior a la de otros empaquetados del mismo tamaño. No obstante, se trata de un research preview con requisitos de runtime muy específicos (motores NanoSeedLM, mlx-vlm con Trust Remote Code y oMLX con un parche concreto), lo que lo aleja de un uso de producción convencional.

El modelo base es multimodal (image-text-to-text), con arquitectura MoE y 68.954.623.455 parámetros totales según los safetensors del repo. El pack ocupa 195,6 GB en el repositorio y está pensado para Apple Silicon vía MLX, además de CUDA en Linux y Windows y Metal en macOS.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) del modelo base Qwen3.8-Flash-Next |
| Parámetros totales | 68.954.623.455 (safetensors); pesos de expertos enrutados: 120,8 B según model card |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | TCQ3: trellis K3 a 3,125 bits por peso de experto; pesos densos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en HF) |
| Formato de pesos | safetensors (MLX), con código personalizado (custom_code) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura de mezcla de expertos (MoE) con expertos enrutados y una tabla PLE (probablemente embedding de n-gramas) que permanece en disco. Esta cuantización no reentrena el modelo: transforma los pesos mediante un códec trellis (TCQ) que reconstruye cada peso de experto a partir de unos pocos bits almacenados con aritmética entera, sin codebook. Los pesos densos se mantienen en 8 bits, decisión deliberada porque en los packs P3 y P4 los pesos densos en 4 bits concentraban la mayor parte de la divergencia KL.

Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) no están disponibles en la información proporcionada. La innovación técnica destacable es el propio esquema de compresión: TCQ4 alcanza KL 0,0398 a 4,125 bits frente a P4 con 0,0408 a 4,5 bits y P3 con 0,0600 a 4,0 bits, lo que indica que el códec trellis es más eficiente por bit que el esquema de semillas (seeds). La KL se mide contra BF16 en llama.cpp sobre 64 ventanas de 2.048 tokens de wikitext-2.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline image-text-to-text), por lo que admite entradas multimodales.
- Razonamiento y matemáticas: capacidades del modelo base, no verificadas de forma independiente en este pack.
- Generación de código: capacidad del modelo base, no medida en esta cuantización.
- Tool calling y function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking explícito: no disponible.
- Ejecución en Apple Silicon (MLX, mlx-vlm, oMLX) y en CUDA (Linux y Windows) mediante los motores NanoSeedLM.

## Casos de uso

- Investigación en compresión de modelos: el pack permite estudiar el impacto de la cuantización trellis a 3,125 bits sobre la fidelidad (KL 0,0778) y compararlo con los packs TCQ4, TCQ3-D4, P4 y P3 de la misma familia.
- Despliegue de un MoE grande en estaciones de trabajo modestas: con una GPU de 12 o 16 GB y 64 GB de RAM, el modelo decodifica a 44 tokens/s en una RTX 4080 con 16 GB y a 27 tokens/s limitado a 12 GB, lo que permite prototipado local sin clúster.
- Experimentación multimodal en Apple Silicon: mediante mlx-vlm con Trust Remote Code u oMLX con el parche jundot/omlx#5112, se pueden probar tareas image-text-to-text en un Mac de 96 GB o más.
- Evaluación de latencia con contextos largos: el pack mantiene 43,1 tokens/s tras un prompt de 30.000 tokens en RTX 4080, útil para medir el coste de la caché de expertos en RAM.
- Servidor compatible con OpenAI para pruebas: el script de arranque levanta un servidor en el puerto 8080, lo que facilita integrar el modelo en harnesses de evaluación existentes.
- Reproducción de resultados de la familia NanoSeedLM: los packs P3 y P4 están pensados para investigación sobre semillas, y TCQ3 sirve como referencia de menor huella de memoria para comparaciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son métricas de fidelidad y velocidad de decodificación del pack:

| Métrica | Valor |
|---|---|
| Divergencia KL vs BF16 (wikitext-2, 64 ventanas de 2.048 tokens) | 0,0778 |
| Bits por peso de experto | 3,125 |
| Memoria residente estimada | 55 GB |
| Tamaño de pesos de expertos | 47,2 GB |
| Descarga total | 112,1 GB |
| Decodificación en RTX 4080 (16 GB) | 44,0 tokens/s |
| Decodificación tras prompt de 30.000 tokens | 43,1 tokens/s |
| Decodificación en RTX 4080 limitado a 12 GB | 27 tokens/s |

## Requisitos de hardware

- RAM: mínimo 64 GB; los expertos deben caber en RAM y la GPU cachea los expertos en uso.
- VRAM: GPU de 12 o 16 GB; una GPU de 12 GB cachea menos expertos que una de 16 GB.
- GPU recomendadas: RTX 4080 (16 GB) como referencia medida; cualquier GPU con 12-16 GB y suficiente RAM del sistema.
- Apple Silicon: Mac con 96 GB o 128 GB para este pack; en Mac de 128 GB se recomienda TCQ4 por menor KL.
- No cabe en GPUs de consumo de 8 GB ni en equipos con menos de 64 GB de RAM.
- Despliegue: motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code y oMLX con el parche jundot/omlx#5112.
- Arranque: `START-HERE.bat TCQ3` en Windows o `./start-here.sh TCQ3` en Linux/macOS; el script verifica la máquina, descarga el pack y levanta un servidor compatible con OpenAI en el puerto 8080.
- Throughput: 44,0 tokens/s en RTX 4080; 27 tokens/s con la GPU limitada a 12 GB. No se ha probado en un PC con 64 GB de RAM según la model card.

## Comparativa con modelos similares

| Pack | Expertos | Bits | Memoria (GB) | KL | Pesos densos | Descarga (GB) |
|---|---|---|---|---|---|---|
| TCQ4 | Trellis K4 | 4,125 | 70 | 0,0415 | 8 bits | 127,5 |
| TCQ3-D4 | Trellis K3, down K4 | 3,458 | 60 | 0,0638 | 8 bits | 117,2 |
| **TCQ3** | Trellis K3 | 3,125 | 55 | 0,0778 | 8 bits | 112,1 |
| P4 | Seeds P4 | 4,500 | 74 | 0,169 | 4 bits | 131,3 |
| P3 | Seeds P3 | 4,000 | 66 | 0,182 | 4 bits | 123,8 |

Comparado con P3 y P4, TCQ3 ofrece menor KL con menos bits y menos memoria, a costa de leer 1,84 GB más por token por los pesos densos en 8 bits (TCQ4 decodifica aproximadamente un 15 % más lento que P3 en M4 Max). Frente a TCQ4, TCQ3 reduce la memoria de 70 a 55 GB con un KL 1,87 veces mayor. No se dispone de comparación con cuantizaciones estándar (GGUF Q4_K_M, AWQ, GPTQ) del mismo modelo base en la información proporcionada.

## Limitaciones y advertencias

- Research preview: requiere motores y parches específicos (NanoSeedLM, oMLX#5112); no es un artefacto listo para producción.
- Divergencia KL de 0,0778 frente a BF16, superior a la de TCQ4 (0,0415) y TCQ3-D4 (0,0638); puede degradar tareas sensibles a la fidelidad.
- Requiere al menos 64 GB de RAM; no funciona en equipos con menos memoria porque los expertos deben residir en RAM.
- El rendimiento cae de 44 a 27 tokens/s al limitar la GPU a 12 GB por menor caché de expertos.
- No se han publicado evaluaciones de sesgo, alucinación ni rendimiento en tareas estándar (MMLU, HumanEval, GSM8K) para este pack.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Licencia qwen-community-1.0: es necesario revisar los términos del modelo base para uso comercial; la model card la etiqueta como "other".
- Contexto máximo no disponible; el rendimiento con prompts largos solo está medido hasta 30.000 tokens.
- Solo 314 descargas y 0 likes en el momento de la consulta, lo que implica poca validación comunitaria.

## Enlaces

- [Hugging Face: txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3](https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3)
- [Modelo base: Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Licencia del modelo base](https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE)
- [Pack TCQ4](https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4)
- [Pack TCQ3-D4](https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4)
- [Pack P4](https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4)
- [Pack P3](https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3)
- [Repositorio NanoSeedLM](https://github.com/mbarnson/NanoSeedLM)
- [Releases del motor NanoSeedLM](https://github.com/mbarnson/NanoSeedLM/releases)
- [Parche oMLX jundot/omlx#5112](https://github.com/jundot/omlx/pull/5112)
- [arXiv:2410.10714](https://arxiv.org/abs/2410.10714)
- [arXiv:2406.11235](https://arxiv.org/abs/2406.11235)
