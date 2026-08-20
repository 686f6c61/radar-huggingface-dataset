# SuhaoYu1020/semantic-image-arith-ckpts

## Resumen

`semantic-image-arith-ckpts` es un conjunto de 22 checkpoints derivados de los experimentos del proyecto `semantic-image`, desarrollado por Suhao Yu, investigador en la Universidad de Pensilvania. El objetivo es estudiar si un modelo de difusión (DiT) puede realizar razonamiento aritmético latente al editar imágenes que contienen operaciones como `Q: 21 + 60 = ?` y `A:`, escribiendo el resultado correcto en el espacio destinado a la respuesta. La tarea está diseñada para que la única diferencia entre la entrada y la salida sean los glifos de la respuesta, de modo que la pérdida de píxeles aísla el componente aritmético. La métrica principal es la precisión de OCR de Qwen3-VL-2B sobre un conjunto de prueba de 1.000 ejemplos.

El repositorio contiene variantes experimentales que exploran si el cálculo lo realiza el text encoder (TE) o el DiT, variando el número de tokens emitidos (`emit-budget`), el número de slots (`emit-slots`), la semilla de inicialización y el tamaño del DiT (2B scratch o 20B pretrained). Los resultados muestran que el DiT por sí solo solo alcanza un 33,2 % de precisión cuando el TE está congelado, mientras que entrenar el TE permite llegar al 87,7 %. Los checkpoints están publicados con licencia Apache 2.0 y se cargan mediante la librería `diffusers` con el pipeline `QwenImageEditPipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) basado en Qwen-Image-Edit, con text encoder de Qwen-Image |
| Parametros totales | 2B (scratch) o 20B (pretrained) segun el checkpoint |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (tarea de edicion de imagen 512×512) |
| Tipos de cuantizacion | no disponibles (pesos en bfloat16) |
| Idiomas soportados | no disponible (la tarea usa texto numerico en ingles, pero el modelo es especifico para edicion) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoints de `transformer` y `text_encoder`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen-Image-Edit, que combina un text encoder (TE) con un Diffusion Transformer (DiT). En los experimentos se distinguen dos variantes principales: una con el TE congelado (`freeze-te`) y otra con el TE entrenable (`train-te`). El DiT puede ser un modelo scratch de 2B o un modelo pretrained de 20B. La entrada es una imagen de 512×512 que contiene la pregunta aritmética y un espacio para la respuesta. El modelo debe editar la imagen para escribir el resultado correcto.

El entrenamiento se realiza con pérdida MSE pura, sin tokens emitidos adicionales en la variante `noemit-2x2`. En las variantes `emit-budget`, el TE emite K tokens (K=1, 2, 4) que se re-codifican y se alimentan al DiT, actuando como un presupuesto de cómputo. Las variantes `emit-slots` utilizan un número fijo de slots (1, 2, 3) para representar el resultado. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado directamente sobre la tarea. Los resultados muestran que el DiT pretrained de 20B tiende a tomar un atajo de renderizado (render shortcut) cuando el TE está congelado o cuando K es pequeño, mientras que el DiT scratch de 2B se comporta mejor cuando el TE se entrena. La generalización se confirma por la ausencia de gap entre entrenamiento y prueba (88,0 % train vs 87,7 % test).

## Capacidades

- Edicion de imagenes con texto: escribe el resultado de una suma aritmetica en el lugar indicado por la imagen.
- Razonamiento latente: el modelo puede computar el resultado dentro de la red, sin emitir tokens intermedios (variante noemit).
- Control de presupuesto de computo: mediante el numero de tokens emitidos (K) o slots, se puede ajustar la capacidad de razonamiento.
- No soporta tool calling, agentes, ni razonamiento multi-paso general.
- No tiene capacidades multilingues ni de vision general; solo funciona en la tarea especifica de edicion aritmetica.

## Casos de uso

- **Investigacion en interpretabilidad mecanica**: permite analizar si el text encoder o el DiT son los que realizan el calculo aritmetico, y como la arquitectura distribuye las funciones.
- **Estudio de razonamiento latente en modelos de difusion**: sirve como banco de pruebas para entender como un modelo generativo puede resolver tareas de razonamiento sin decodificar tokens intermedios.
- **Evaluacion de atajos de aprendizaje**: los checkpoints con DiT pretrained muestran el fenomeno de "render shortcut" (ignorar la respuesta parcial y renderizar el texto), util para estudiar fallos de generalizacion.
- **Analisis de sensibilidad a la semilla**: los checkpoints incluyen variaciones de semilla (43, 44, 45) que muestran alta varianza en el resultado (35,8 % a 89,9 %), util para estudiar la robustez del entrenamiento.
- **Comparacion de estrategias de entrenamiento**: el conjunto permite comparar la eficacia de entrenar el text encoder vs. congelarlo, y de usar tokens emitidos vs. no emitidos.
- **Validacion de metricas OCR**: se puede usar el conjunto de datos `semantic-image-arith` para probar la precision de modelos OCR como Qwen3-VL-2B en tareas de reconocimiento de texto en imagenes editadas.

## Benchmarks y rendimiento

Los resultados se miden como precision de OCR (Qwen3-VL-2B) sobre un conjunto de prueba de 1.000 ejemplos. No se comparan con otros modelos de edicion, sino que se comparan entre las variantes internas del experimento.

| Variante | Precision OCR |
|---|---|
| M4 train-TE, scratch-2B DiT | 87,7 % |
| M3 freeze-TE, scratch-2B DiT | 33,2 % |
| TE congelado *con pesos de M4*, scratch-2B | 87,6 % |
| M4 train-TE, pretrained-20B DiT | 0,9 % |
| M3 freeze-TE, pretrained-20B DiT | 1,0 % |
| Seeds M4 (semilla 43/44/45) | 35,8 % / 89,9 % / 88,8 % |
| Seeds M3 (semilla 43/44/45) | 25,8 % / 7,0 % / 14,8 % |
| Emit-budget K=1 (scratch-2B) | 44,1 % |
| Emit-budget K=2 (scratch-2B) | 74,6 % |
| Emit-budget K=4 (scratch-2B) | 88,8 % |
| Emit-budget K=1 (pretrained-20B) | 0,8 % |
| Emit-budget K=2 (pretrained-20B) | 15,6 % |
| Emit-budget K=4 (pretrained-20B) | 87,2 % |
| Emit-slots 1 slot / ≤9 (scratch) | 99,2 % |
| Emit-slots 2 slots / ≤99 (pretrained) | 89,2 % |
| Emit-slots 3 slots / 0–198 (pretrained) | 69,7 % |
| T2I (sin imagen de entrada) | 10,1 % / 5,4 % |
| Holdout (train≠test) | 88,7 % |

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware. Los pesos se distribuyen en bfloat16 y el tamano total del repositorio es de 185 GB (incluye los 22 checkpoints).
- Para un checkpoint de DiT scratch de 2B (solo DiT, ~3,8 GB) la VRAM estimada para inferencia en bfloat16 seria de alrededor de 8 GB, compatible con GPUs como RTX 4090 o RTX 3090.
- Para un checkpoint con DiT pretrained de 20B (~38 GB) mas text encoder (~15 GB adicional) se requieren GPUs con VRAM superior a 50 GB, como A100 80 GB o H100.
- Los checkpoints que incluyen el text encoder entrenado (~19 GB / ~53 GB) necesitan mas memoria.
- Se recomienda usar el pipeline `QwenImageEditPipeline` de `diffusers` (version de desarrollo pin `6abf75263a09a3e7a62458f544ce2fac28568fe2`). Tambien es posible cargar los pesos del transformer con `QwenImageTransformer2DModel` y combinarlos con el pipeline base.
- No se indican opciones de despliegue como vLLM o llama.cpp; el modelo es especifico para edicion de imagen y no es adecuado para generacion de texto.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en el contexto de edicion de imagenes con razonamiento aritmetico. Los modelos de edicion genericos como Qwen-Image-Edit o InstructPix2Pix no estan disenados para tareas de calculo dentro de la imagen. La comparativa mas relevante es contra el propio modelo base Qwen-Image-Edit, pero no se han publicado resultados de esa comparacion. Por tanto, se indica: no disponible.

## Limitaciones y advertencias

- El modelo es un conjunto de checkpoints experimentales, no un modelo listo para produccion. Varios de ellos fallan deliberadamente (por ejemplo, los pretrained con K bajo).
- La precision depende fuertemente de la semilla de inicializacion; la variante M4 con semilla 43 obtiene solo 35,8 % frente al 89,9 % de la semilla 44.
- No funciona bien cuando el DiT es pretrained y el TE esta congelado (0,9 % - 1,0 %), mostrando un atajo de renderizado.
- La tarea esta limitada a sumas de dos digitos (0-99) y numeros de hasta tres cifras en el caso de 3 slots.
- El modelo no soporta otros tipos de edicion, texto libre, ni razonamiento general.
- Los pesos solo incluyen el estado del modelo, sin estado de optimizador; algunos checkpoints que produjeron numeros publicados ya no existen (se han eliminado por la poda de checkpoints) y solo son reproducibles desde los launchers.
- La licencia Apache-2.0 permite uso comercial, pero el modelo no es util fuera del contexto de investigacion.

## Enlaces

- Repositorio de checkpoints: https://huggingface.co/SuhaoYu1020/semantic-image-arith-ckpts
- Dataset del proyecto: https://huggingface.co/datasets/SuhaoYu1020/semantic-image-arith
- Perfil del autor: https://huggingface.co/SuhaoYu1020
- Pagina personal: https://suhaoyu1020.github.io/
- GitHub del autor: https://github.com/SuhaoYu1020/
- Repositorio SUPIR (otro proyecto del mismo autor, no relacionado): https://github.com/Fanghua-Yu/SUPIR
