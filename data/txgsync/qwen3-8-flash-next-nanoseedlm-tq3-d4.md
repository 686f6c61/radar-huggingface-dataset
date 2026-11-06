# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4 es una cuantización experimental del modelo multimodal Qwen3.8-Flash-Next de Qwen, publicada por el usuario txgsync dentro del proyecto NanoSeedLM. No se trata de un modelo nuevo, sino de un empaquetado que aplica codificación trellis (trellis-coded quantization) a los pesos de los expertos enrutados del MoE original: K = 3 para `gate_proj` y `up_proj`, y K = 4 para `down_proj`, con estados de 12 bits. El resultado son 3,458 bits por peso de experto, lo que reduce los 120,8 B de parámetros de expertos a 52,2 GB.

El modelo base es un transformer MoE con capacidades de imagen-texto a texto (pipeline `image-text-to-text`), 48 capas más una cabeza MTP en la capa 48, y una tabla PLE (n-gram) de 32 GB que permanece en disco con caché de página. La cuantización de los pesos densos es 8-bit MLX, tomada de mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp, mientras que los expertos trellis se almacenan en ficheros `.blkt` propietarios del motor NanoSeedLM.

Es relevante ahora porque demuestra una vía de compresión más agresiva que las cuantizaciones GGUF convencionales: con 3,458 bits por peso de experto logra una divergencia KL de 0,0638 frente a BF16, comparable a Unsloth UD-Q3_K_XL (3,720 bits, KLD 0,0593) y mejor que UD-IQ3_XXS (3,331 bits, KLD 0,0735). Está marcado explícitamente como research preview y solo funciona en los motores NanoSeedLM (CUDA en Linux/Windows, Metal en macOS), no en mlx-vlm ni oMLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.8-Flash-Next) con expertos enrutados trellis-coded y cabeza MTP |
| Parametros totales | 56.687.443.859 (según safetensors del repo); pesos de expertos del modelo base: 120,8 B |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor de `--ctx` en el ejemplo de `nslm-serve`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Expertos: trellis K=3 / K=4 a 3,458 bits por peso; pesos densos: 8-bit MLX; tabla PLE: 4-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (densos, PLE, vision tower, MTP head) + `.blkt` (expertos trellis); librería `trellis` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.8-Flash-Next original, que según el repositorio de QwenLM introduce mejoras en atención, residuales, embeddings y optimización. La estructura es un MoE con 48 capas más una capa 48 correspondiente a la cabeza MTP (multi-token prediction), un vision tower para entrada de imagen y una tabla PLE de n-gramas de 32 GB que se mantiene en disco. No se ha reentrenado nada: la ficha no documenta datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO para este empaquetado.

La innovación técnica está en la codificación trellis de los expertos enrutados, basada en QTIP (arXiv:2406.11235). Cada peso se representa como el código de una ventana de 12 bits de un flujo de bits, de modo que pesos vecinos comparten bits y no se almacena ningún codebook: el valor se obtiene con una operación fija de multiply-add sobre la ventana. Los pesos densos provienen de una cuantización 8-bit MLX de la comunidad, y las estadísticas de activación para la cuantización proceden del imatrix de Unsloth. En GPU, los expertos enrutados residen en memoria host y una caché mantiene en VRAM los que se usan en cada momento.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat incluida en el repo.
- Entrada de imagen y texto (pipeline `image-text-to-text`, vision tower presente en los ficheros), aunque el autor indica que no se probó entrada de imagen ni vídeo.
- Razonamiento y generación de código heredados del modelo base Qwen3.8-Flash-Next; no se documentan evaluaciones específicas en esta ficha.
- Predicción multi-token mediante la cabeza MTP de la capa 48.
- Servido mediante API compatible con OpenAI a través de `nslm-serve`.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; los idiomas no están listados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en cuantización extrema: el pack sirve para estudiar el compromiso entre bits por peso de experto (3,458) y divergencia KL (0,0638) frente a BF16, comparando con las variantes Unsloth UD-Q3_K_XL y UD-IQ3_XXS en el mismo pipeline de medida.
- Despliegue de un MoE de gran tamaño en estación de trabajo con GPU de 16 GB: con unos 60 GB de memoria residente y los expertos en memoria host, una RTX 4080 puede servirlo a 54,4 tokens/s de decodificación según el autor.
- Inferencia local en Apple Silicon de 96 GB: el pack está pensado para un Mac de 96 GB, con decodificación de 48,8 tokens/s en un M4 Max de 128 GB.
- Servicio de chat con API compatible OpenAI: `nslm-serve --ctx 32768 --port 8080` expone el modelo para integrarlo en prototipos de asistentes conversacionales con contexto de 32K.
- Evaluación comparativa de motores de inferencia: permite medir el rendimiento de los kernels trellis de NanoSeedLM frente a llama.cpp con GGUF de Unsloth, dado que el autor publica la metodología de KLD sobre wikitext-2.
- Pruebas de pipelines multimodal imagen-texto en entornos con memoria limitada, teniendo en cuenta que el autor no validó la entrada de imagen.
- Docencia y reproducción de resultados: los comandos de descarga y ejecución son reproducibles con `hf download` y la compilación de NanoSeedLM, lo que facilita replicar las tablas de calidad y velocidad.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2:

| Metrica | Este pack | BF16 |
|---|---|---|
| KLD media | 0,0638 ± 0,0007 | 0 |
| KLD mediana | 0,0175 | 0 |
| KLD percentil 99 | 0,765 | 0 |
| Acuerdo top-1 | 91,27% | 100% |
| Perplejidad | 3,861 | 3,802 |

Comparación con packs de Unsloth medidos con la misma metodología:

| Pack | Bits por peso de experto | KLD media |
|---|---|---|
| Este pack (TQ3-D4) | 3,458 | 0,0638 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Velocidad de decodificación (prompt de código, 256 tokens, con los pesos densos 4-bit MLX de las primeras builds; el autor advierte que los densos 8-bit de esta release leen 1,7 veces más bytes y pueden ser más lentos):

| Maquina | Decodificacion (tokens/s) |
|---|---|
| RTX 4080 (16 GB), cache automatica de expertos | 54,4 |
| M4 Max (128 GB) | 48,8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria residente estimada: unos 60 GB para este pack (52,2 GB de expertos trellis más pesos densos 8-bit MLX); la tabla PLE de 32 GB queda en disco y se lee por page cache.
- GPU: el autor indica una GPU de 16 GB con 96 a 128 GB de RAM del sistema; los expertos enrutados se alojan en memoria host y una caché mantiene en VRAM los usados.
- Apple Silicon: Mac de 96 GB; el M4 Max de 128 GB es la máquina de referencia medida.
- Cabe en GPU de consumo: sí, en una RTX 4080 de 16 GB, siempre que el sistema tenga 96-128 GB de RAM.
- Opciones de despliegue: exclusivamente los motores NanoSeedLM (`nslm-chat` y `nslm-serve`), con CUDA en Linux y Windows y Metal en macOS. mlx-vlm y oMLX no pueden cargarlo todavía porque su loader MLX no tiene kernels trellis. No hay soporte de vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- Latencia y throughput: 54,4 tokens/s de decodificación en RTX 4080 y 48,8 tokens/s en M4 Max, con la salvedad de que son cifras de builds previas con densos 4-bit.

## Comparativa con modelos similares

| Modelo | Bits por peso de experto | Memoria residente | KLD media vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (TQ3-D4) | 3,458 | ~60 GB | 0,0638 | qwen-community-1.0 | NanoSeedLM (CUDA/Metal) |
| TQ3 (misma familia) | 3,125 | ~55 GB | 0,0778 | qwen-community-1.0 | NanoSeedLM (CUDA/Metal) |
| TQ4 (misma familia) | 4,125 | ~70 GB | 0,0415 | qwen-community-1.0 | NanoSeedLM (CUDA/Metal) |
| Unsloth UD-Q3_K_XL | 3,720 | no disponible | 0,0593 | qwen-community-1.0 | llama.cpp / GGUF |
| Unsloth UD-IQ3_XXS | 3,331 | no disponible | 0,0735 | qwen-community-1.0 | llama.cpp / GGUF |

## Limitaciones y advertencias

- Research preview: la salida no es idéntica a la del modelo original, según el propio autor.
- Solo funciona en los motores NanoSeedLM; mlx-vlm y oMLX no pueden cargar los expertos trellis y no hay soporte en vLLM, llama.cpp, Ollama ni TGI para estos pesos.
- No se probó entrada de imagen ni de vídeo, pese a que el pipeline declarado es `image-text-to-text`.
- El formato 4-bit MLX de la tabla PLE no está medido frente a BF16; las cifras de KL usan la tabla Q8_0 de Unsloth.
- Las métricas de velocidad proceden de una sola máquina de cada tipo (RTX 4080 y M4 Max) y de builds con densos 4-bit, no de esta release con densos 8-bit.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; se heredan los del modelo base Qwen3.8-Flash-Next.
- Idiomas soportados: no disponibles, lo que impide garantizar calidad multilingüe.
- Licencia Qwen Community License 1.0: conviene revisar sus condiciones antes de uso comercial, ya que puede imponer restricciones adicionales a las de una licencia permisiva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor no es el equipo de Qwen: es un empaquetado de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3-D4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Pack TQ4 de la misma familia: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ4
- Pack TQ3 de la misma familia: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TQ3
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Documentación de expertos trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Guía de compilación: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guía de ejecución y servido: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Formato de carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Medidas de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Pesos densos 8-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF e imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Pack P4 relacionado: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4/tree/main
