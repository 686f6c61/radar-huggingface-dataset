# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 es una cuantizacion experimental de Qwen/Qwen3.8-Flash-Next, un modelo de mezcla de expertos (MoE) multimodal de Qwen con 56.687 millones de parametros totales segun los pesos publicados. El autor de la conversion es el usuario txgsync, que aplica una codificacion trellis (TCQ, *trellis-coded quantization*) sobre los pesos de los expertos enrutados, apoyandose en el motor de inferencia NanoSeedLM. El resultado es un paquete de aproximadamente 91,6 GB en disco que reduce los 120.800 millones de parametros de expertos a 3,458 bits por peso (52,2 GB), manteniendo los pesos densos en 8 bits MLX y una tabla PLE n-gram de 32 GB en 4 bits MLX que reside en disco.

El modelo resuelve un problema muy concreto: permitir ejecutar un MoE de gran tamano en hardware modesto (una GPU de 16 GB con 96-128 GB de RAM, o un Mac de 96 GB) manteniendo una divergencia KL moderada frente a BF16 (0,0638 de media, 91,27 % de acuerdo top-1). No es un modelo nuevo ni un fine-tune: es una compresion agresiva que cambia el formato de almacenamiento de los expertos y exige un runtime especifico.

Es relevante ahora porque explora una via alternativa a las cuantizaciones GGUF convencionales (Q3_K_XL, IQ3_XXS) mediante codigos trellis con ventanas de 12 bits y pesos vecinos que comparten bits, sin codebook almacenado. Su naturaleza es de *research preview*: el autor advierte que la salida no es identica a la del modelo original, que mlx-vlm y oMLX aun no pueden cargarlo y que no se probaron entradas de imagen o video.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (image-text-to-text) con torre de vision y cabeza MTP; expertos enrutados codificados con trellis (TCQ) |
| Parametros totales | 56.687.443.859 (pesos publicados en safetensors); el modelo base declara 120.800 millones de parametros de expertos enrutados |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de `nslm-serve --ctx 32768`); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Expertos enrutados: trellis K=3 en `gate_proj` y `up_proj`, K=4 en `down_proj`, estados de 12 bits, 3,458 bits por peso. Pesos densos: 8-bit MLX. Tabla PLE: 4-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0, etiquetada como `license: other`) |
| Formato de pesos | safetensors (densos, PLE, torre de vision, cabeza MTP) y ficheros `.blkt` propietarios para los expertos trellis; no es GGUF estandar |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer MoE multimodal con torre de vision y una cabeza MTP (*multi-token prediction*), segun se deduce de los ficheros y de las referencias del autor. Esta ficha no documenta el proceso de entrenamiento original de Qwen (numero de tokens, composicion del dataset, RLHF/DPO), porque esa informacion no aparece en los materiales proporcionados.

La innovacion tecnica de este paquete es la codificacion trellis de los expertos enrutados, basada en el trabajo QTIP (arXiv:2406.11235). Cada peso de experto se representa como el codigo de una ventana de 12 bits de un flujo de bits, de modo que pesos vecinos comparten bits; no se almacena ningun codebook, y el valor se reconstruye con una operacion fija de multiplicacion-suma sobre la ventana. Los expertos de las capas 0 a 47 y de la cabeza MTP (capa 48) van en ficheros `L{layer}_{gate_proj,up_proj,down_proj}.blkt`. Los pesos densos proceden de mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp (8 bits MLX) y las estadisticas de activacion del imatrix de Unsloth. La tabla PLE n-gram (32 GB, 4 bits MLX) permanece en disco y la cache de pagina mantiene las filas que lee cada ejecucion.

## Capacidades

- Generacion de texto conversacional y razonamiento, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento image-text-to-text segun el `pipeline_tag` declarado, aunque el autor indica que no se probaron entradas de imagen ni de video.
- Cabeza MTP (*multi-token prediction*) incluida en el paquete, lo que habilita decodificacion especulativa en el runtime.
- Servido de API compatible con OpenAI mediante `nslm-serve`, con contexto configurable (32.768 tokens en el ejemplo).
- Ejecucion en CUDA (Linux y Windows) y Metal (macOS) a traves de los motores de NanoSeedLM.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling, function calling y razonamiento multi-paso: no documentados para este paquete.

## Casos de uso

- Investigacion en cuantizacion extrema: el paquete sirve para reproducir y comparar la codificacion trellis frente a GGUF Q3/IQ3, con metricas KL, perplejidad y acuerdo top-1 ya publicadas, lo que permite validar variantes del algoritmo sobre un MoE de gran tamano.
- Despliegue de un MoE grande en una estacion de trabajo con GPU de 16 GB: los expertos enrutados permanecen en memoria host y una cache mantiene en VRAM los usados, de modo que una RTX 4080 con 96-128 GB de RAM puede servirlo a 54,4 tokens/s de decodificacion.
- Inferencia local en Mac de 96 GB: el paquete esta pensado para un Mac de 96 GB (M4 Max medido a 48,8 tokens/s), lo que permite ejecutar un MoE multimodal sin GPU dedicada.
- Servicio de chat interno con API compatible con OpenAI: `nslm-serve --ctx 32768 --port 8080` expone el modelo para integrarlo en herramientas existentes que consuman la API de OpenAI, con la salvedad de que la calidad difiere del BF16.
- Experimentacion con decodificacion especulativa: la cabeza MTP incluida permite medir el impacto del *multi-token prediction* sobre el throughput en el motor NanoSeedLM.
- Evaluacion comparativa de runtimes: al no cargar en mlx-vlm ni oMLX, el paquete es util para contrastar el rendimiento y la fidelidad de NanoSeedLM frente a llama.cpp con GGUF equivalentes.

## Benchmarks y rendimiento

Calidad medida con divergencia KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2, con los expertos y pesos densos del paquete escritos en el GGUF Q8_0 de Unsloth:

| Metrica | Este paquete | BF16 |
|---|---|---|
| KLD media | 0,0638 ± 0,0007 | 0 |
| KLD mediana | 0,0175 | 0 |
| KLD percentil 99 | 0,765 | 0 |
| Acuerdo top-1 | 91,27 % | 100 % |
| Perplejidad | 3,861 | 3,802 |

Comparacion con cuantizaciones de Unsloth medidas del mismo modo (con sus propios pesos densos):

| Paquete | Bits por peso de experto | KLD media |
|---|---|---|
| Este paquete (TCQ3-D4) | 3,458 | 0,0638 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Con los pesos densos Q8_0 de Unsloth, los expertos de este paquete dan 0,0619 de KLD media.

Velocidad de decodificacion (prompt de codigo, 256 tokens, con los pesos densos 4-bit MLX de las primeras builds; los densos 8-bit de esta release leen 1,7 veces mas bytes y pueden ser mas lentos):

| Maquina | Decodificacion (tokens/s) |
|---|---|
| RTX 4080 (16 GB), cache automatica de expertos | 54,4 |
| M4 Max (128 GB) | 48,8 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: unos 60 GB de memoria residente total segun el autor, de los cuales los expertos enrutados quedan en memoria host y solo los usados se cachean en VRAM; una GPU de 16 GB es suficiente para el cache.
- RAM: 96-128 GB para GPU de 16 GB; 64 GB para el paquete TCQ3 (no probado con 64 GB de Mac).
- GPU recomendadas: RTX 4080 de 16 GB (medida), GPU de 24 GB o mas con 96-128 GB de RAM para el paquete TCQ4. A100 y H100 no estan documentadas para este runtime.
- Apple Silicon: Mac de 96 GB o 128 GB (M4 Max de 128 GB medido); un Mac de 64 GB no esta probado.
- Almacenamiento: 91,6 GB de repositorio, mas la tabla PLE de 32 GB que reside en disco y se lee mediante cache de pagina.
- Opciones de despliegue: exclusivamente los motores de NanoSeedLM (`nslm-chat` y `nslm-serve`); no carga en mlx-vlm ni oMLX, y no es un GGUF estandar para llama.cpp, vLLM, TGI u Ollama.
- Latencia y throughput: 54,4 tokens/s en RTX 4080 y 48,8 tokens/s en M4 Max, con la salvedad de que son cifras de builds con densos 4-bit y esta release usa densos 8-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD media vs BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (TCQ3-D4) | 56.687 M publicados; 120,8 B de expertos enrutados | 32.768 tokens (configurable) | 0,0638 | qwen-community-1.0 | Hugging Face, runtime NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | mismos que el base | 32.768 tokens (configurable) | 0,0415 | qwen-community-1.0 | Hugging Face, runtime NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 | mismos que el base | 32.768 tokens (configurable) | 0,0778 | qwen-community-1.0 | Hugging Face, runtime NanoSeedLM |
| Unsloth UD-Q3_K_XL (GGUF) | mismos que el base | no disponible | 0,0593 | qwen-community-1.0 | Hugging Face, llama.cpp |

## Limitaciones y advertencias

- Es una *research preview*: la salida no es identica a la del modelo original y no debe tratarse como sustituto directo en produccion sin evaluacion propia.
- mlx-vlm y oMLX no pueden cargar los expertos trellis porque el cargador MLX no tiene kernels trellis; el unico runtime valido es NanoSeedLM.
- No se probaron entradas de imagen ni de video, pese a que el `pipeline_tag` es image-text-to-text.
- El formato 4-bit MLX de la tabla PLE no esta medido frente a BF16; las metricas KL publicadas usan la tabla Q8_0 de Unsloth.
- Las cifras de velocidad provienen de un solo PC (RTX 4080) y un solo Mac (M4 Max), y corresponden a builds con pesos densos 4-bit; esta release usa densos 8-bit y puede ser mas lenta.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los heredados del modelo base Qwen3.8-Flash-Next.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia Qwen Community License 1.0: conviene revisar sus condiciones antes de un uso comercial, ya que la etiqueta de Hugging Face figura como `license: other`.
- El modelo exige 91,6 GB de disco mas la tabla PLE de 32 GB, y depende de la cache de pagina para un rendimiento aceptable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Paquete TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Paquete TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pesos densos 8-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos 4-bit MLX: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF e imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Guia de compilacion: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guia de ejecucion y servido: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Concepto de expertos trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Formato de carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Mediciones de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Paper QTIP: https://arxiv.org/abs/2406.11235
- Otro paquete del mismo autor: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-MXFP4-MLX/tree/main
