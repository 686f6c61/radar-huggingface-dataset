# txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4

## Resumen

Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4 es una cuantizacion de investigación del modelo Qwen3.8-Flash-Next, publicada por el usuario txgsync. Se trata de un empaquetado de pesos que comprime los 120.800 millones de parametros de expertos enrutados del modelo original MoE hasta 52,2 GB, a 3,458 bits por peso, mediante codificacion Trellis (TCQ) con K3 en los expertos y K4 en las capas down. El objetivo es hacer viable la inferencia de un modelo de 70.200 millones de parametros totales en equipos con una GPU de 16 GB y entre 96 y 128 GB de RAM, o en un Mac con 96 GB de memoria unificada.

La propuesta tecnica se apoya en los motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS) y en los runtimes mlx-vlm con Trust Remote Code y oMLX. Segun la model card, la divergencia KL frente a BF16 es de 0,0638, un 7% inferior a los empaquetados de Unsloth del mismo tamano. En una RTX 4080, la decodificacion alcanza 38,0 tokens por segundo, y 36,0 tras un prompt de 30.000 tokens.

Es relevante ahora porque demuestra que es posible ejecutar un MoE de gran tamano en hardware de consumo mediante tecnicas de compresion basadas en semillas y trellis, sin codebook almacenado. No obstante, se trata de una vista previa de investigación con licencia comunitaria de Qwen y soporte limitado de runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) del modelo base Qwen3.8-Flash-Next |
| Parametros totales | 70.239.129.055 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona pruebas con prompts de 30.000 tokens) |
| Tipos de cuantizacion | TCQ3-D4: Trellis K3 en expertos, K4 en capas down, 3,458 bits por peso de experto, pesos densos en 8 bits |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (libreria mlx, con custom_code) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-Flash-Next, una arquitectura de mezcla de expertos con 120.800 millones de parametros en pesos de expertos enrutados. Esta version no reentrena el modelo: es una cuantizacion post-entrenamiento que recomprime los pesos de los expertos mediante codificacion Trellis (TCQ), un esquema que calcula cada peso a partir de unos pocos bits almacenados con aritmetica entera y sin codebook. Los pesos densos se mantienen en 8 bits, decision que segun la model card reduce drasticamente la divergencia KL frente a BF16 en comparacion con pesos densos de 4 bits.

La innovacion principal reside en el equilibrio entre tasa de compresion y fidelidad: los expertos ocupan 52,2 GB con 3,458 bits por peso, mientras que el pack TCQ4 equivalente usa 4,125 bits y 62,3 GB. La tabla PLE (n-gram) permanece en disco y la cache de paginas retiene las filas que lee cada sesion. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens ni si hubo RLHF o DPO, ya que la model card se centra exclusivamente en el proceso de cuantizacion.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de imagen y texto (pipeline image-text-to-text), lo que implica capacidades de vision.
- Razonamiento y matemáticas segun las capacidades del modelo original (no detalladas en la informacion disponible).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local de un MoE de gran tamano en estaciones de trabajo con GPU de 16 GB y 96-128 GB de RAM: el pack mantiene los expertos en RAM y la GPU cachea los expertos en uso, permitiendo ejecutar un modelo de 70.200 millones de parametros sin servidores dedicados.
- Despliegue en Mac con 96 GB de memoria unificada: el pack esta pensado para dejar espacio a contextos largos en Metal, util para prototipado e investigación en Apple Silicon.
- Servicio compatible con OpenAI en local: el script de arranque levanta un servidor en el puerto 8080, lo que facilita integrar el modelo en herramientas existentes que consumen la API de OpenAI sin cambiar el codigo cliente.
- Procesamiento de imagenes y texto en local: al heredar el pipeline image-text-to-text, sirve para tareas de descripcion de imagenes, extraccion de informacion visual o respuesta a preguntas sobre documentos escaneados en entornos con requisitos de privacidad.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden medir la divergencia KL de TCQ frente a esquemas de semillas (P3, P4) y a empaquetados de terceros sobre el mismo modelo base.
- Experimentacion con contextos largos: la model card reporta 36,0 tokens por segundo tras un prompt de 30.000 tokens en RTX 4080, lo que permite probar cargas de trabajo de contexto extendido en hardware de consumo.
- Analisis de conversaciones multi-turno: el formato conversacional del modelo base permite construir asistentes locales para tareas de soporte o documentacion tecnica.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Divergencia KL frente a BF16 (TCQ3-D4) | 0,0638 |
| Divergencia KL frente a BF16 (TCQ4, referencia) | 0,0415 |
| Divergencia KL frente a BF16 (TCQ3, referencia) | 0,0778 |
| Divergencia KL frente a BF16 (P4, referencia) | 0,169 |
| Divergencia KL frente a BF16 (P3, referencia) | 0,182 |
| Decodificacion en RTX 4080 (CUDA) | 38,0 tokens/s |
| Decodificacion en RTX 4080 con prompt de 30.000 tokens | 36,0 tokens/s |
| Decodificacion en RTX 4080 limitada a 12 GB (pack TCQ3) | 27 tokens/s |
| Decodificacion en RTX 4080 con 16 GB (pack TCQ3) | 44 tokens/s |
| TCQ4 en M4 Max frente a P3 | aproximadamente 15% mas lento |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: GPU de 16 GB para el pack TCQ3-D4; el pack TCQ3 requiere 12 o 16 GB con 64 GB de RAM; el pack TCQ4 requiere 24 GB o mas.
- RAM del sistema: entre 96 y 128 GB en PC; 64 GB solo admite el pack TCQ3; menos de 64 GB no es viable porque los expertos deben caber en RAM.
- Memoria unificada en Mac: 96 GB para TCQ3-D4, 128 GB para TCQ4 o P3.
- GPU recomendadas: RTX 4080 (probada), RTX 4090 y GPUs de 24 GB o mas para TCQ4; A100 y H100 no se mencionan en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 4080 de 16 GB con TCQ3-D4, y en RTX 4080 limitada a 12 GB con TCQ3.
- Opciones de despliegue: motores NanoSeedLM (CUDA en Linux y Windows, Metal en macOS), mlx-vlm con Trust Remote Code, oMLX con el parche jundot/omlx#5112.
- Latencia y throughput: 38,0 tokens/s en RTX 4080 y 36,0 tokens/s con prompt de 30.000 tokens; 27 tokens/s en RTX 4080 limitada a 12 GB con TCQ3.

## Comparativa con modelos similares

| Modelo | Parametros | Bits por peso de experto | Memoria | KL frente a BF16 | Licencia |
|---|---|---|---|---|---|
| TCQ3-D4 (este) | 70.200 M totales, 120.800 M en expertos | 3,458 | 60 GB | 0,0638 | qwen-community-1.0 |
| TCQ4 | mismo modelo base | 4,125 | 70 GB | 0,0415 | qwen-community-1.0 |
| TCQ3 | mismo modelo base | 3,125 | 55 GB | 0,0778 | qwen-community-1.0 |
| P4 | mismo modelo base | 4,500 | 74 GB | 0,169 | qwen-community-1.0 |
| P3 | mismo modelo base | 4,000 | 66 GB | 0,182 | qwen-community-1.0 |

No se dispone de comparacion con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Vista previa de investigación: el soporte de runtimes es limitado y depende de motores NanoSeedLM, mlx-vlm con Trust Remote Code y oMLX con un parche especifico.
- Requiere al menos 64 GB de RAM en el sistema; por debajo de esa cifra el modelo no es ejecutable.
- La cuantizacion introduce divergencia frente a BF16 (KL 0,0638), lo que puede degradar tareas sensibles a la fidelidad numerica.
- El rendimiento depende del cacheo de expertos en GPU: una GPU de 12 GB decodifica a 27 tokens/s frente a 44 tokens/s con 16 GB en el pack TCQ3.
- La tabla PLE permanece en disco, por lo que el rendimiento puede verse afectado por la velocidad del almacenamiento y la cache de paginas.
- Sesgos conocidos, riesgo de alucinacion y limitaciones de idioma: no disponible en la informacion proporcionada.
- Licencia qwen-community-1.0: es necesario revisar sus terminos para uso comercial, ya que se etiqueta como "other" en Hugging Face.
- No se han publicado resultados de benchmarks de tareas, lo que impide evaluar la calidad del modelo en razonamiento, codigo o matematicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3-D4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Repositorio NanoSeedLM: https://github.com/mbarnson/NanoSeedLM
- Releases de los motores NanoSeedLM: https://github.com/mbarnson/NanoSeedLM/releases
- Parche de oMLX: https://github.com/jundot/omlx/pull/5112
- Pack TCQ4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ4
- Pack TCQ3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-TCQ3
- Pack P4: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P4
- Pack P3: https://huggingface.co/txgsync/Qwen3.8-Flash-Next-NanoSeedLM-P3
- Paper referenciado (arXiv:2410.10714): https://arxiv.org/abs/2410.10714
- Paper referenciado (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
