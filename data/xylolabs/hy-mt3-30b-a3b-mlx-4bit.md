# Xylolabs/Hy-MT3-30B-A3B-MLX-4bit

## Resumen

Hy-MT3-30B-A3B-MLX-4bit es una cuantizacion en 4 bits del modelo de traduccion tencent/Hy-MT3-30B-A3B, realizada por Xylolabs y publicada en formato MLX para su uso con la libreria `mlx-lm` sobre hardware Apple Silicon. El modelo base es un transformer de tipo mixture-of-experts (MoE) con 30.064 millones de parametros totales y aproximadamente 3.000 millones de parametros activos por token, disenado especificamente para traduccion automatica y entrenado para cubrir 102 idiomas.

La relevancia de esta version radica en que reduce el peso de los pesos de 60,13 GB (BF16) a 17,76 GB, lo que permite ejecutar un modelo de traduccion de 30B en equipos con memoria unificada de 36 GB, como un Mac Studio M5 Max. La cuantizacion es de tipo afina por grupos de tamano 64, con escalas y sesgos en float16, y aplica 4 bits a los 128 expertos enrutados mientras mantiene en 8 bits la atencion, la primera capa densa, el experto compartido, el embedding de tokens y la cabeza LM; el router y las normas se mantienen en mayor precision (bfloat16 y float16 respectivamente).

El modelo resuelve el problema de desplegar traduccion neuronal de alta calidad multilingue en entornos locales sin GPU dedicada, manteniendo una degradacion de calidad medida y acotada frente al modelo original en BF16. La licencia Apache 2.0 facilita su adopcion tanto en investigacion como en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), modelo base hy_v3 |
| Parametros totales | 30.064.719.872 (30,06B) |
| Parametros activos | Aproximadamente 3B (segun denominacion A3B del modelo base) |
| Longitud de contexto | Hasta 256K tokens (segun memoria unificada disponible; 71K en 36 GB, 161K en 48 GB, 256K en 96 GB o mas) |
| Tipos de cuantizacion | 4 bits (esta version) y 8 bits (version alternativa); cuantizacion afina, group size 64, escalas y sesgos en float16 |
| Idiomas soportados | 102 idiomas, entre ellos zh, en, es, de, fr, it, pt, ru, ja, ko, ar, hi, vi, th, tr, nl, pl, uk, entre otros |
| Licencia | Apache 2.0 (el codigo `hy_v3.py` bajo licencia MIT) |
| Formato de pesos | safetensors (MLX), 17,8 GB de tamano de repositorio |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos (MoE): de los 30,06B parametros totales, solo unos 3B se activan por token, lo que reduce el coste computacional de inferencia manteniendo la capacidad del modelo completo. La arquitectura incluye 128 expertos enrutados por capa, un experto compartido, una primera capa densa y un router (`mlp.router.gate`) que selecciona los expertos. En esta cuantizacion, el router se conserva en bfloat16 y el sesgo de seleccion de expertos en float32, mientras que las normas se mantienen en float16.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base. La model card de esta cuantizacion se centra en el proceso de conversion a MLX y en la evaluacion de la degradacion introducida por la cuantizacion, medida mediante divergencia KL frente a BF16 sobre WikiText-2, texto de chat y texto reservado, ademas de chrF++ en seis direcciones sobre 1.200 segmentos de WMT24++.

## Capacidades

- Traduccion automatica multilingue en 102 idiomas, con enfasis en pares que incluyen chino, ingles, coreano, japones y lenguas europeas.
- Generacion de texto condicionada por instrucciones, incluyendo el formato de prompt de traduccion con instrucciones explicitas ("Translate the following text into English...").
- Manejo de contexto largo, con ventanas de hasta 256K tokens segun la memoria disponible en el hardware.
- Traduccion bidireccional verificada en las direcciones en-zh, zh-en, en-ko, ko-en, en-ja y ja-en mediante chrF++.
- Capacidad de responder preguntas cortas (evaluada con siete preguntas en modo greedy, con 7/7 respuestas correctas en las tres precisiones).
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Traduccion de documentacion tecnica: el modelo puede traducir manuales y articulos largos en una sola pasada gracias a su ventana de contexto de hasta 256K tokens en equipos con 96 GB o mas de memoria unificada, manteniendo coherencia terminologica a lo largo del documento.
- Localizacion de productos en 102 idiomas: un equipo puede cubrir mercados como China, Corea, Japon, India o Europa del Este con un unico modelo desplegado localmente, sin depender de APIs externas.
- Traduccion en tiempo real en aplicaciones de escritorio para macOS: al ejecutarse con `mlx-lm` sobre Apple Silicon, el modelo puede integrarse en apps nativas que requieran privacidad de datos, ya que todo el procesamiento ocurre en el dispositivo.
- Procesamiento por lotes de corpus multilingues: la version 4-bit de 17,8 GB permite ejecutar traduccion masiva en un Mac Studio de 36 GB, con un coste de calidad medido y acotado (KL de 0,0838 en WikiText-2 frente a BF16).
- Investigacion en traduccion automatica: la disponibilidad de pesos cuantizados y del codigo `hy_v3.py` bajo licencia MIT facilita experimentos de evaluacion, comparacion de precisiones y estudios de degradacion por cuantizacion.
- Atencion al cliente multilingue: el modelo puede generar respuestas traducidas en conversaciones multi-turno, aunque la informacion disponible no documenta un modo de chat especifico; su uso estaria limitado a tareas de traduccion y generacion condicionada.
- Traduccion de subtitulos y contenido audiovisual: la evaluacion con chrF++ sobre segmentos de WMT24++ sugiere un rendimiento adecuado en frases cortas, tipicas de subtitulos.

## Benchmarks y rendimiento

Los datos de la model card comparan la cuantizacion 4-bit y 8-bit frente a BF16 en divergencia KL y chrF++:

| Metrica | MLX 4-bit | MLX 8-bit | BF16 |
|---|---:|---:|---:|
| Tamano | 17,76 GB | 31,96 GB | 60,13 GB |
| WikiText-2 KL | 0,083759 | 0,035655 | referencia |
| WikiText-2 top-1 | 91,824% | 95,794% | referencia |
| Chat KL | 0,045647 | 0,022650 | referencia |
| Chat top-1 | 93,941% | 96,863% | referencia |
| Held-out KL | 0,115990 | 0,066562 | referencia |
| Held-out top-1 | 91,588% | 95,235% | referencia |
| chrF++ (media 6 direcciones) | 43,77 | 43,91 | 43,80 |
| Respuestas correctas (7 preguntas) | 7/7 | 7/7 | 7/7 |

chrF++ por direccion:

| Precision | en-zh | zh-en | en-ko | ko-en | en-ja | ja-en |
|---|---:|---:|---:|---:|---:|---:|
| MLX 4-bit | 36,42 | 52,27 | 36,40 | 53,60 | 34,28 | 49,62 |
| MLX 8-bit | 36,33 | 52,40 | 36,91 | 53,97 | 34,37 | 49,50 |
| BF16 | 35,93 | 52,45 | 36,60 | 53,99 | 34,35 | 49,47 |

Como referencia, el Q8_0 de llama.cpp presenta un perfil de KL similar al BF16 en MLX (0,0368, 0,0266 y 0,0774 en los tres textos). No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 17,8 GB para la version 4-bit y 32,0 GB para la 8-bit; el BF16 requiere 60,13 GB.
- Hardware verificado en la model card: Mac Studio M5 Max (32 o 40 nucleos de GPU) y Mac Studio M5 Ultra, con memoria unificada de 36, 48, 64, 96, 128, 256 o 512 GB.
- Contexto maximo segun memoria: 71K en 36 GB, 161K en 48 GB, 139K en 64 GB con 8-bit, y 256K en 96 GB o mas.
- No se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) en esta version, ya que el formato es MLX y la libreria es `mlx-lm`.
- Despliegue: `mlx-lm==0.32.2` con `--trust-remote-code` para cargar `hy_v3.py`; ejemplo de uso con `mlx_lm.generate`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Hy-MT3-30B-A3B-MLX-4bit | 30,06B (3B activos) | hasta 256K | Apache 2.0 | safetensors MLX | Cuantizacion 4-bit para Apple Silicon |
| Xylolabs/Hy-MT3-30B-A3B-MLX-8bit | 30,06B (3B activos) | hasta 256K | Apache 2.0 | safetensors MLX | Mayor calidad, 32 GB |
| tencent/Hy-MT3-30B-A3B | 30,06B (3B activos) | no disponible | Apache 2.0 | safetensors | Modelo base en BF16, 60,13 GB |

No se dispone en la informacion proporcionada de comparaciones con otros modelos de traduccion de la misma categoria (por ejemplo, NLLB, M2M-100 o SeamlessM4T).

## Limitaciones y advertencias

- La cuantizacion 4-bit introduce degradacion medible: KL de 0,0838 en WikiText-2, 0,0456 en chat y 0,1160 en texto reservado, con top-1 del 91,8%, 93,9% y 91,6% respectivamente.
- El modelo esta orientado a traduccion; no se documentan capacidades de razonamiento general, codigo o matematicas, por lo que su uso fuera de tareas de traduccion no esta validado.
- La ventana de contexto efectiva depende de la memoria unificada del equipo; en 36 GB se limita a 71K tokens.
- Solo es compatible con MLX y hardware Apple Silicon; no hay version GGUF ni soporte documentado para CUDA en esta publicacion.
- No se documentan sesgos especificos ni tasas de alucinacion en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y el archivo NOTICE; el codigo `hy_v3.py` esta bajo MIT.
- El modelo base es de Tencent; esta version es una conversion no oficial de Xylolabs, por lo que la responsabilidad sobre la calidad final recae en el usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Hy-MT3-30B-A3B-MLX-4bit
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Repositorio de MLX: https://github.com/ml-explore/mlx
- Repositorio de herramientas de cuantizacion de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Imagenes de precision: https://huggingface.co/Xylolabs/Hy-MT3-30B-A3B-MLX-4bit/resolve/main/accuracy-kl.png y https://huggingface.co/Xylolabs/Hy-MT3-30B-A3B-MLX-4bit/resolve/main/accuracy-chrf.png
