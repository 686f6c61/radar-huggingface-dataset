# speedyrulz/minimax-h3-image-int8-nvfp4-hybrid

## Resumen

MiniMax-H3-Image int8 + w4a8 hybrid es un repack de precisión mixta del modelo de difusión texto-a-imagen MiniMax-H3-Image, publicado por el usuario speedyrulz sobre el modelo base de MiniMaxAI. No se trata de un modelo nuevo ni de un fine-tune: es una redistribución de pesos ya cuantizados por Comfy-Org, combinando dos variantes (w4a8 para los bloques iniciales e int8 para los finales) para reducir el tamaño a 14,8 GiB y hacerlo viable en GPUs de 16 GB. El archivo se distribuye como single-file safetensors listo para cargar en ComfyUI 0.45.0 o superior.

El problema que resuelve es concreto: el modelo int8 oficial ocupa 19,5 GiB y no cabe en GPUs consumer de 16 GB, mientras que la variante w4a8 oficial (11,7 GiB) degrada la calidad de forma notable (9,1 % de error de salida, SSIM 0,767 frente a bf16). Este híbrido busca un punto intermedio, manteniendo en int8 los 20 últimos bloques (los más sensibles a la cuantización de 4 bits) y aplicando w4a8 solo a los 30 primeros.

Es relevante para desarrolladores que quieran ejecutar MiniMax-H3-Image en hardware de gama media (RTX 4060 Ti, RTX 5060 Ti) sin renunciar a una fidelidad razonable respecto al modelo bf16. No se dispone de información sobre la arquitectura interna del modelo base, el número de parámetros ni la longitud de contexto en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (detalles internos no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Híbrida: `asym_w4a8_int8` en bloques 0-29 (`qkv_proj`, `out_proj`, `fc1`, `fc2`) e `int8_tensorwise` (ConvRot) en bloques 30-49 y resto de tensores |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-image-community-license-agreement |
| Formato de pesos | safetensors (single-file para ComfyUI) |
| Tamano del repo | 15,9 GB (archivo principal: 14,8 GiB) |
| Modelo base | MiniMaxAI/MiniMax-H3-Image (repack de Comfy-Org/MiniMax-H3-Image) |
| SHA-256 | `ea736af3b44f0f8be32e3ec632e375fea0449a8c0b2e05fe121ede5719a0137b` |
| Compatibilidad | ComfyUI 0.45.0 o superior, kernels int8 (no requiere hardware FP4) |

## Arquitectura y entrenamiento

El modelo subyacente es un modelo de difusión para generación de imágenes a partir de texto. La información disponible no detalla la arquitectura interna (tipo de backbone, mecanismo de atención, número de parámetros ni datos de entrenamiento). Lo que sí se documenta es el proceso de cuantización aplicado: los tensores se copian sin recuantizar desde dos archivos de Comfy-Org, `minimax_h3_image_pruned_w4a8` (bloques 0-29) y `minimax_h3_image_pruned_int8_convrot` (bloques 30-49 y resto). La decisión de mantener los últimos 20 bloques en int8 responde a una medición empírica: son los que más degradan con pesos de 4 bits.

El autor documenta también que probó NVFP4 en todos los tipos de capa y lo descartó: una capa NVFP4 pierde entre un 8 y un 12 % de su salida en entradas reales, frente al ~1 % de int8 ConvRot y el 5-6 % de w4a8, y aproximadamente la mitad de esa pérdida proviene de las activaciones de 4 bits de NVFP4, por lo que no se corrige con mejor redondeo o calibración. La mejor mezcla NVFP4 encontrada (NVFP4 calibrado en `qkv_proj`, `out_proj` y `fc1` de bloques 0-29, int8 en el resto) alcanzaba un 8,1 % de error a 15,5 GiB y solo acelera en tarjetas RTX 50.

No se dispone de información sobre el dataset de entrenamiento, el uso de RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal, dado que este repositorio es un repack de pesos y no una ficha del modelo original.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Integración directa en el flujo de trabajo oficial de texto-a-imagen de ComfyUI como reemplazo drop-in del modelo de difusión.
- Ejecución en GPUs de 16 GB gracias a la reducción de tamaño a 14,8 GiB.
- Funciona exclusivamente con kernels int8 de ComfyUI, sin necesidad de hardware con soporte FP4.
- Resolución de trabajo documentada: 2048x2048 con 6 pasos de muestreo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking, al tratarse de un modelo de difusión de imagen.

## Casos de uso

- Generación de imágenes en equipos con RTX 4060 Ti o RTX 5060 Ti de 16 GB: el archivo cabe en VRAM y evita el swap constante a memoria del sistema que sufriría la variante int8 de 19,5 GiB, con tiempos totales de 16-17 s (5060 Ti) y 20-21 s (4060 Ti) para 6 pasos a 2048x2048.
- Prototipado rápido de pipelines texto-a-imagen en ComfyUI: al ser un reemplazo directo en el loader de diffusion models del workflow oficial, permite sustituir el modelo sin reescribir grafos ni nodos.
- Evaluación de calidad frente a cuantizaciones alternativas: sirve como punto intermedio medible (5,2 % de error de salida, SSIM 0,844) para decidir entre la fidelidad de int8 y la ligereza de w4a8 en un proyecto concreto.
- Producción con restricciones de VRAM en estaciones de trabajo consumer: despliegue local de generación de imágenes a resolución alta (2048x2048) sin depender de GPUs de datacenter.
- Pruebas A/B de fidelidad visual: comparar el híbrido contra bf16 e int8 con las mismas semillas y prompts para cuantificar la degradación aceptable en un caso de uso dado.
- Docencia y experimentación con cuantización de modelos de difusión: el repositorio documenta explícitamente la metodología (error por paso, SSIM, descarte de NVFP4) y sirve como caso de estudio reproducible.

## Benchmarks y rendimiento

El autor publica métricas de error de salida y SSIM frente al modelo bf16, medidas a 2048x2048 y 6 pasos:

| Modelo | Tamano | Error de salida por paso | SSIM frente a bf16 |
|---|---|---|---|
| int8 ConvRot (oficial) | 19,5 GiB | 3,5 % | 0,888 |
| Híbrido (este repo) | 14,8 GiB | 5,2 % | 0,844 |
| w4a8 (oficial) | 11,7 GiB | 9,1 % | 0,767 |

El error de salida se define como el error relativo de la predicción del modelo alimentando cada variante con las propias entradas del modelo bf16, promediado sobre 6 pasos y 2 prompts. El SSIM es la media sobre 6 imágenes (2 prompts, 3 semillas) generadas con la atención por defecto del modelo.

Rendimiento medido (6 pasos a 2048x2048, workflow oficial, incluyendo carga del modelo en GPU):

| GPU | int8 | Híbrido | w4a8 |
|---|---|---|---|
| RTX 5060 Ti 16 GB | 1,86 s/paso, 21-23 s total | 1,85 s/paso, 16-17 s total | 1,85 s/paso, 16 s total |
| RTX 4060 Ti 16 GB | 2,72 s/paso, 27-28 s total | 2,33 s/paso, 20-21 s total | 2,27 s/paso, 19-20 s total |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable al tratarse de un modelo de difusión de imagen.

## Requisitos de hardware

- VRAM estimada: 14,8 GiB para el archivo de pesos; encaja en GPUs de 16 GB con margen ajustado para activaciones y buffers del pipeline.
- GPUs verificadas por el autor: RTX 5060 Ti 16 GB y RTX 4060 Ti 16 GB, con los tiempos de la tabla anterior.
- Cabe en GPU consumer de 16 GB; no se documenta su comportamiento en GPUs de 8, 12 o 24 GB.
- No requiere hardware con soporte FP4 (RTX 50); usa exclusivamente los kernels int8 de ComfyUI.
- Opción de despliegue documentada: ComfyUI 0.45.0 o superior, colocando el archivo en `ComfyUI/models/diffusion_models` y seleccionándolo en el loader del workflow oficial.
- Latencia: 1,85 s/paso en RTX 5060 Ti y 2,33 s/paso en RTX 4060 Ti con el híbrido; el tamaño menor reduce el tiempo de carga inicial y, en la 4060 Ti (PCIe más lento), también acelera cada paso.
- No se documentan opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) para este formato.

## Comparativa con modelos similares

Comparación con las otras cuantizaciones del mismo modelo base, según los datos del autor:

| Modelo | Tamano | Error de salida | SSIM | Hardware FP4 | Licencia |
|---|---|---|---|---|---|
| int8 ConvRot (oficial) | 19,5 GiB | 3,5 % | 0,888 | No requerido | minimax-h3-image-community-license-agreement |
| Híbrido (este repo) | 14,8 GiB | 5,2 % | 0,844 | No requerido | minimax-h3-image-community-license-agreement |
| w4a8 (oficial) | 11,7 GiB | 9,1 % | 0,767 | No requerido | minimax-h3-image-community-license-agreement |
| Mejor mezcla NVFP4 probada | 15,5 GiB | 8,1 % | no disponible | Sí (solo RTX 50) | minimax-h3-image-community-license-agreement |

No se dispone de datos para comparar con modelos de difusión de otros desarrolladores (por ejemplo, alternativas de la misma categoría en tamaño o tarea), por lo que esa comparación se indica como no disponible.

## Limitaciones y advertencias

- No es un modelo original ni un fine-tune: es un repack de pesos cuantizados de Comfy-Org; cualquier limitación del modelo base MiniMax-H3-Image se hereda.
- Degradación de calidad medible frente a bf16: 5,2 % de error de salida y SSIM 0,844, peor que int8 (0,888) pero mejor que w4a8 (0,767).
- El archivo ocupa 14,8 GiB y deja poco margen en GPUs de 16 GB; no se documenta su comportamiento en GPUs con menos VRAM.
- Solo se ha verificado en dos GPUs concretas (RTX 5060 Ti y RTX 4060 Ti); el rendimiento en otras tarjetas no está medido.
- Requiere ComfyUI 0.45.0 o superior y usa exclusivamente kernels int8; no se documenta compatibilidad con otros runtimes.
- Licencia `minimax-h3-image-community-license-agreement`: es necesario revisar sus términos en el enlace oficial antes de cualquier uso comercial; no se detallan aquí las restricciones concretas.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, idiomas soportados en los prompts ni limitaciones de resolución más allá de la documentada (2048x2048).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas publicadas por el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/speedyrulz/minimax-h3-image-int8-nvfp4-hybrid
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Repack de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
