# zephel01/Qwen3.5-122B-A10B-IQ3_XXS-16G64G-GGUF

## Resumen

Esta ficha corresponde a una cuantización comunitaria en formato GGUF del modelo **Qwen3.5-122B-A10B**, desarrollado por Qwen y cuantizado por el usuario zephel01. Se trata de un modelo de generación de texto con arquitectura de mezcla de expertos (MoE) de 122.111.526.912 parámetros totales, de los cuales aproximadamente 10.000 millones están activos por token (según la convención de nomenclatura A10B). La cuantización, llamada IQ3_XXS-B2, está diseñada específicamente para que el modelo completo quepa en un equipo con una GPU de 16 GB de VRAM y 64 GB de RAM, sin necesidad de leer del SSD durante la generación.

La relevancia de esta conversión radica en que permite ejecutar localmente un modelo de más de 100.000 millones de parámetros en hardware de gama alta de consumo, manteniendo una calidad sorprendentemente buena: la divergencia KL frente al modelo BF16 original es de solo 0,0349, y el modelo resuelve entre el 83% y el 88% de tareas de programación tipo SWE-bench en pruebas del propio autor. La cuantización aplica IQ3_XXS con matriz de importancia (imatrix) a los expertos enrutados, mientras que atención, proyecciones delta-net, expertos compartidos, embeddings y cabeza de salida se mantienen en Q8_0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrido (expertos enrutados + delta-net/SSM, formato qwen35moe en llama.cpp) |
| Parametros totales | 122.111.526.912 |
| Parametros activos | ~10.000 millones (A10B, según nomenclatura del modelo base) |
| Longitud de contexto | no disponible (no indicada en la model card del repo) |
| Tipos de cuantizacion | IQ3_XXS (expertos enrutados, 3,35 bits/peso); Q8_0 (atención, delta-net, expertos compartidos, embeddings, cabeza de salida) |
| Idiomas soportados | no disponible (la imatrix de calibración usa inglés y japonés; el modelo base Qwen suele ser multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards de 29,8 y 21,2 GB, 51,1 GB totales) |

## Arquitectura y entrenamiento

El modelo base, Qwen3.5-122B-A10B, es un modelo MoE con una arquitectura híbrida: además de los expertos enrutados y los expertos compartidos, incorpora proyecciones delta-net (un mecanismo tipo SSM/attention lineal), lo que se refleja en los tensores `ssm_` presentes en el GGUF. El repositorio cuantizado proviene de la conversión BF16 de unsloth, que contiene 48 bloques y no incluye bloque NextN (MTP), por lo que esta conversión no dispone de un draft model MTP para decodificación especulativa nativa.

Sobre el entrenamiento del modelo base, la información disponible en este repositorio no detalla el número de tokens ni la composición del dataset. Respecto a la cuantización: se generó con llama.cpp (build 11370) usando una matriz de importancia calculada sobre 32 chunks de 2048 tokens de texto técnico y código en inglés y japonés (0,7 MB). Los expertos enrutados se cuantizan a IQ3_XXS y el resto de tensores se fuerza explícitamente a Q8_0 (`--token-embedding-type` y `--output-tensor-type`), ya que sin estos parámetros llama-quantize seleccionaría IQ3_S/Q5_K para esos tensores.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag "conversational").
- Resolución de tareas de programación tipo repositorio con bugs o peticiones de funcionalidad y tests ocultos: 50-53 de 60 tareas resueltas según la ejecución (83,3%-88,3%).
- Arquitectura MoE con ~10B parámetros activos, lo que permite inferencia rápida pese al tamaño total.
- Compatible con decodificación especulativa por n-gramas en Abyss (45% de drafts aceptados en las pruebas del autor); sin draft MTP nativo.
- Calibración de la imatrix en inglés y japonés, lo que sugiere buen comportamiento en ambos idiomas tras la cuantización.
- Compatible con llama.cpp y con el runtime Abyss del propio autor.

## Casos de uso

- **Ejecución local en PC de 16 GB VRAM + 64 GB RAM**: el caso de uso principal. Todo el modelo cabe en GPU+RAM sin acceso a SSD durante la generación, ideal para privacidad y uso sin conexión.
- **Resolución de bugs y tareas de código agénticas**: en las pruebas del autor resuelve el 83-88% de 60 tareas tipo SWE-bench a 42-47 tok/s, adecuado para asistentes de código locales con flujos multi-paso.
- **Chatbot local de alto rendimiento**: con 41,2 tok/s de decodificación y 735-1015 tok/s de procesamiento de prompt (2K/8K tokens), es viable para conversación interactiva fluida en local.
- **Procesamiento de documentos largos**: la velocidad de prompt de 1015 tok/s con 8K tokens permite ingestar documentos extensos con latencia razonable (sujeto a la ventana de contexto del modelo base).
- **Uso en japonés e inglés**: la imatrix se calculó con texto técnico en ambos idiomas, lo que mitiga la degradación típica de cuantizaciones agresivas en estos idiomas.
- **Experimentación con cuantizaciones extremas**: incluye el archivo `imatrix-qwen35-122b.gguf` (0,36 GB) para requantizar el modelo con otras configuraciones.
- **Inferencia con hardware heterogéneo GPU+CPU**: el diseño offload de expertos (`--n-cpu-moe`) lo hace idóneo para configuraciones donde la GPU no puede albergar todo el modelo.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización (no benchmarks estándar de terceros):

**Calidad (KL contra BF16, 8 chunks de 1024 tokens, texto held-out en inglés y japonés; PPL de BF16: 14,38):**

| Archivo | Tamaño | KL media | KL 99% | Mismo top token | PPL |
|---|---:|---:|---:|---:|---:|
| IQ3_XXS-B (variante no publicada) | 50,3 GB | 0,0379 | 0,247 | 88,0% | 14,63 |
| **IQ3_XXS-B2 (este archivo)** | **51,1 GB** | **0,0349** | **0,238** | **89,3%** | **14,58** |

**Tareas de código (60 tareas tipo llmbench, temp 0,6 / top_p 0,95 / top_k 20):**

| Ejecución | Resueltas |
|---|---:|
| Ejecución 1 | 50/60 (83,3%) |
| Ejecución 2 | 53/60 (88,3%) |
| Variante IQ3_XXS-B (1 ejecución) | 53/60 (88,3%) |

**Velocidad (Abyss v1.3.57, GPU 16 GB + 64 GB RAM, Ryzen AI Max+ 395, 16 hilos, PCIe Gen4 x4):**

| Métrica | Valor |
|---|---:|
| Decodificación | 41,2 tok/s |
| Decodificación (runs own-share de --deep) | 42,1 / 48,2 tok/s |
| Prompt 2K tokens | 735 tok/s |
| Prompt 8K tokens | 1015 tok/s |
| Espera de SSD por token | 0% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta cuantización.

## Requisitos de hardware

- **VRAM/RAM objetivo**: diseñado para una GPU de 16 GB de VRAM + 64 GB de RAM del sistema, sin lectura de SSD durante la generación. El archivo completo ocupa 51,1 GB.
- **Configuración probada por el autor**: AMD Radeon AI PRO R9700 limitada a 16 GB + Ryzen AI Max+ 395 (LPDDR5X, 16 hilos), PCIe Gen4 x4. En un sobremesa con DDR5 de doble canal los expertos calculados en CPU irán más lento.
- **Consumer GPUs**: cabe en GPUs de 16 GB (RTX 4080/5080, RX 7900 XT, etc.). Si la GPU también gestiona el escritorio, quedan ~14,5 GB útiles y el reparto GPU/RAM se ajusta, pero el archivo sigue cabiendo en GPU+RAM.
- **Despliegue**:
  - llama.cpp (soporte qwen35moe): `llama-server -m <archivo>.gguf -ngl 99 --n-cpu-moe <n>`, ajustando `<n>` para equilibrar GPU y CPU.
  - Abyss v1.3.57 o superior, con empaquetado previo mediante `tools/iq_pack.py`.
  - No hay mención a vLLM, TGI u Ollama en la información disponible (GGUF está orientado a llama.cpp).
- **Rendimiento esperado**: ~41-48 tok/s de decodificación y 735-1015 tok/s de prompt en la configuración de referencia; limitado por la GPU, con 0% de espera de SSD.
- **Muestreo recomendado**: temperatura 0,6, top_p 0,95, top_k 20.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Formato/Cuantización | Tamaño | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-122B-A10B IQ3_XXS-B2 (esta ficha) | 122B | ~10B | GGUF IQ3_XXS + Q8_0 | 51,1 GB | Apache 2.0 | Diseñado para 16 GB VRAM + 64 GB RAM |
| Ornith-1.5-122B IQ3_XXS-16G64G (mismo autor) | no disponible | no disponible | GGUF IQ3_XXS (misma receta) | ~50,3 GB | no disponible | Misma receta de cuantización; KL 0,138 frente a 0,0349 de este, es decir, Qwen3.5 tolera mucho mejor el corte a 3 bits |
| Qwen/Qwen3.5-122B-A10B (original) | 122.111.526.912 | ~10B | BF16 (GGUF unsloth: 5 shards) | no disponible | Apache 2.0 | Referencia de calidad (PPL 14,38 en el set de prueba) |

## Limitaciones y advertencias

- **Cuantización con pérdida de 3 bits**: aunque las métricas KL son buenas, es un archivo IQ3_XXS; puede haber degradación en tareas muy sensibles a precisión (matemáticas complejas, generación de código muy largo).
- **Sin draft model MTP**: la conversión BF16 de unsloth carece del bloque NextN, por lo que la decodificación especulativa se limita a n-gramas (45% de aceptación en las pruebas).
- **Rendimiento dependiente del hardware**: las cifras de velocidad provienen de un sistema con LPDDR5X rápido; un sobremesa con DDR5 de doble canal tendrá menor velocidad al computar expertos en CPU.
- **VRAM efectiva menor en uso de escritorio**: una GPU de 16 GB que también maneja el monitor deja ~14,5 GB para el modelo, reduciendo la parte en GPU.
- **Idiomas**: la calibración de la imatrix cubre inglés y japonés; el comportamiento en castellano tras la cuantización no está documentado en el repo.
- **Contexto**: la longitud de contexto del modelo base no se indica en este repositorio; consultar la model card de Qwen/Qwen3.5-122B-A10B.
- **Alucinaciones y sesgos**: heredados del modelo base; no hay evaluaciones específicas de seguridad en este repo.
- **Licencia**: Apache 2.0, apta para uso comercial; el repositorio es solo una conversión cuantizada y todo el mérito del modelo corresponde a sus autores originales.
- **Descargas y adopción**: 297 descargas y 0 likes en el momento de la ficha; es una cuantización comunitaria sin validación de terceros.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/zephel01/Qwen3.5-122B-A10B-IQ3_XXS-16G64G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Conversión BF16 de unsloth (origen de esta cuantización): https://huggingface.co/unsloth/Qwen3.5-122B-A10B-GGUF
- Receta anterior equivalente (Ornith): https://huggingface.co/zephel01/Ornith-1.5-122B-IQ3_XXS-16G64G-GGUF
- Runtime Abyss: https://github.com/zephel01/Abyss
- Herramienta llmbench: https://github.com/zephel01/swe-bench
