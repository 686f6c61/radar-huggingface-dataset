# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 es una cuantización de investigación del modelo Qwen3.8-Flash-Next de Alibaba Qwen, publicada por el usuario txgsync. No se trata de un modelo nuevo entrenado desde cero, sino de un empaquetado experimental que recodifica los pesos de los expertos enrutados del modelo base mediante codificación de trellis (trellis-coded quantization) derivada de la técnica QTIP, reduciendo los 120.800 millones de parámetros de expertos a 4,125 bits por peso (62,3 GB) frente a los 16 bits de BF16.

El objetivo es hacer viable la inferencia de un modelo MoE de gran tamaño en hardware de consumo: según el autor, el pack completo requiere unos 70 GB de memoria residente, lo que permite ejecutarlo en un Mac de 128 GB o en una GPU de 24 GB o más con 96-128 GB de RAM de sistema. Los pesos densos se toman en 8 bits MLX y la tabla PLE de n-gramas (32 GB, 4 bits MLX) permanece en disco, gestionada por la caché de página del sistema operativo.

La relevancia es doble: por un lado, explora los límites de la cuantización extrema sub-4-bit con métricas de divergencia KL frente a BF16; por otro, es una *research preview* explícitamente limitada, que solo funciona con los motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS) y que no puede cargarse todavía en mlx-vlm ni en oMLX. El modelo base es multimodal (image-text-to-text) y de arquitectura MoE, con licencia Qwen Community 1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con torre de visión y cabeza MTP; expertos enrutados codificados con trellis |
| Parametros totales | 56.687.443.859 (pesos empaquetados, safetensors); el modelo base declara 120.800 millones de parámetros en expertos enrutados |
| Parametros activos | no disponible |
| Longitud de contexto | 32.768 tokens en el ejemplo de servido (`--ctx 32768`); máximo del modelo base no disponible |
| Tipos de cuantizacion | Expertos enrutados: trellis K=4, 12-bit states, 4,125 bits/peso. Pesos densos: 8-bit MLX. Tabla PLE: 4-bit MLX |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (densos, PLE, visión, MTP) + ficheros `.blkt` propietarios para los expertos con trellis |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos (MoE) que incorpora una torre de visión (pipeline image-text-to-text) y una cabeza MTP (multi-token prediction). Sobre esa base, este pack no reentrena nada: recodifica los pesos. Los expertos enrutados de las capas 0 a 47 y de la cabeza MTP (capa 48) se almacenan como códigos de trellis con K=4 y ventanas de 12 bits para `gate_proj`, `up_proj` y `down_proj`; cada peso es un código de una ventana de un flujo de bits y los pesos vecinos comparten bits. No se almacena codebook: el valor se obtiene con una multiplicación-suma fija de la ventana, lo que abarata la decodificación en memoria pero exige kernels específicos.

Los pesos densos proceden de `mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp` en 8 bits MLX, y las estadísticas de activación para la cuantización provienen de la imatrix de Unsloth. La tabla PLE de n-gramas (32 GB en 4 bits MLX) se mantiene en disco y se lee bajo demanda mediante la caché de página. El código de trellis deriva de QTIP (arXiv:2406.11235) y la implementación es NanoSeedLM. No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, con plantilla de chat propia incluida en el repositorio.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque el autor advierte que no probó entrada de imagen ni de vídeo.
- Razonamiento y generación de código: los benchmarks de velocidad del autor usan un *code prompt* de 256 tokens.
- Servido de API compatible con OpenAI mediante `nslm-serve`, lo que habilita integración con clientes estándar.
- Decodificación multi-token (cabeza MTP) heredada del modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling y uso como agente: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local de un MoE grande en estación de trabajo: con unos 70 GB de memoria residente, el pack permite ejecutar un modelo de la familia Qwen3.8-Flash-Next en un Mac de 128 GB o en una GPU de 24 GB con 96-128 GB de RAM, sin depender de servidores en la nube.
- Servicio de API interna compatible con OpenAI: `nslm-serve --ctx 32768 --port 8080` expone el modelo para prototipos de aplicaciones que ya consumen la API de OpenAI, útil en entornos de investigación cerrados.
- Experimentación en cuantización extrema: sirve como banco de pruebas para medir el impacto de 4,125 bits/peso en expertos frente a BF16, con métricas de KL, perplejidad y acuerdo top-1 ya publicadas.
- Asistentes de código en local: el autor reporta decodificación de 35,7 tok/s en una RTX 4080 y 48,9 tok/s en un M4 Max con un prompt de código, suficiente para autocompletado y revisión en flujos de desarrollo individuales.
- Evaluación de pipelines multimodales: al conservar la torre de visión del modelo base, permite probar flujos image-text-to-text, aunque con la advertencia de que el autor no validó la entrada de imagen.
- Investigación sobre decodificación especulativa y MTP: la cabeza MTP incluida facilita estudiar técnicas de predicción multi-token sobre pesos cuantizados.
- Comparación de esquemas de compresión: la tabla de KL frente a los packs de Unsloth (UD-Q4_K_XL, UD-IQ4_XS, etc.) permite contrastar trellis coding con cuantización tradicional en el mismo modelo base.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente a BF16 en llama.cpp, sobre 64 ventanas de 2.048 tokens de wikitext-2:

| Metrica | Este pack | BF16 |
|---|---|---|
| KLD media | 0,0415 ± 0,0005 | 0 |
| KLD mediana | 0,0113 | 0 |
| Percentil 99 de KLD | 0,492 | 0 |
| Acuerdo top-1 | 92,98% | 100% |
| Perplejidad | 3,847 | 3,802 |

Comparación con packs de Unsloth medidos del mismo modo:

| Pack | Bits por peso de experto | KLD media |
|---|---|---|
| Este pack (trellis K=4) | 4,125 | 0,0415 |
| Unsloth UD-Q4_K_XL | 5,101 | 0,0304 |
| Unsloth UD-IQ4_XS | 3,999 | 0,0509 |
| Unsloth UD-Q3_K_XL | 3,720 | 0,0593 |
| Unsloth UD-IQ3_XXS | 3,331 | 0,0735 |
| Unsloth UD-Q2_K_XL | 3,049 | 0,0994 |

Velocidad de decodificación (prompt de código, 256 tokens, pesos densos 4-bit MLX de las primeras builds):

| Maquina | Tokens por segundo |
|---|---|
| RTX 4080 (16 GB), caché automática de expertos | 35,7 |
| M4 Max (128 GB) | 48,9 |

El autor advierte que los pesos densos en 8 bits de esta release leen 1,7 veces más bytes que los 4-bit usados en la medición, por lo que la velocidad real puede ser menor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria residente estimada: unos 70 GB para el pack TCQ4 (expertos 62,3 GB más densos y overhead). La tabla PLE de 32 GB permanece en disco y se lee bajo demanda.
- Mac: un equipo con 128 GB de memoria unificada (M4 Max medido a 48,9 tok/s).
- GPU: 24 GB de VRAM o más, con 96-128 GB de RAM de sistema; los expertos enrutados residen en memoria host y una caché mantiene en VRAM los usados.
- Cabe en GPU de consumo: sí, una RTX 4080 de 16 GB ejecuta el pack con caché automática de expertos (35,7 tok/s), siempre que el sistema tenga suficiente RAM.
- Opciones de despliegue: exclusivamente los motores NanoSeedLM (`nslm-chat` y `nslm-serve`, API compatible con OpenAI) en CUDA (Linux y Windows) y Metal (macOS). mlx-vlm y oMLX no pueden cargarlo todavía; llama.cpp solo se usó para medir la calidad, no como motor de este pack.
- Latencia y throughput: 35,7 tok/s en RTX 4080 y 48,9 tok/s en M4 Max, con la salvedad de que son cifras de builds previas con densos 4-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ4 | 56,7 B empaquetados (120,8 B en expertos del base) | 32.768 en servido | 0,0415 | qwen-community-1.0 | Peso abierto, motor NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 | 52,2 GB de expertos | no disponible | 0,0638 | qwen-community-1.0 | Peso abierto, motor NanoSeedLM |
| Qwen3.8-Flash-Next-NanoSeedLM-TCQ3 | 47,2 GB de expertos | no disponible | 0,0778 | qwen-community-1.0 | Peso abierto, motor NanoSeedLM |
| Unsloth UD-Q4_K_XL (GGUF) | mismo base | no disponible | 0,0304 | qwen-community-1.0 | GGUF, llama.cpp |
| Unsloth UD-IQ3_XXS (GGUF) | mismo base | no disponible | 0,0735 | qwen-community-1.0 | GGUF, llama.cpp |

## Limitaciones y advertencias

- Es una *research preview*: la salida no es idéntica a la del modelo original y no debe tratarse como equivalente en producción.
- Compatibilidad muy restringida: solo funciona con NanoSeedLM; mlx-vlm y oMLX no pueden cargar los expertos trellis porque su loader MLX carece de kernels de trellis.
- Entrada de imagen y vídeo no probada por el autor, pese a que el pipeline declarado es image-text-to-text.
- El formato 4-bit MLX de la tabla PLE no está medido frente a BF16; las cifras de KL usan la tabla Q8_0 de Unsloth.
- Las mediciones de velocidad provienen de un solo PC (RTX 4080) y un solo Mac (M4 Max), y con densos 4-bit distintos a los de esta release.
- Riesgo de alucinación y sesgos: no disponibles en la información proporcionada; se heredan del modelo base.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingüe.
- Licencia Qwen Community 1.0: conviene revisar sus condiciones antes de cualquier uso comercial, ya que impone obligaciones específicas más allá de las licencias permisivas habituales.
- El repositorio ocupa 101,9 GB y requiere descargar además la tabla PLE y construir el motor NanoSeedLM desde el código fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante TCQ3-D4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Variante TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Variante P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Documentación de trellis coding: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/concepts/trellis.md
- Guía de compilación: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/build.md
- Guía de ejecución y servido: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/guides/run-and-serve.md
- Formato de la carpeta del modelo: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/reference/model-folder.md
- Mediciones de mezclas trellis: https://github.com/mbarnson/NanoSeedLM/blob/main/docs/results/2026-11-05-trellis-mixes.md
- Pesos densos MLX 8-bit: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-oQ8e-mtp
- Pesos densos MLX 4-bit: https://huggingface.co/mlx-community/Qwen3.8-Flash-Next-4bit-mtp
- GGUF e imatrix de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Paper QTIP: https://arxiv.org/abs/2406.11235
