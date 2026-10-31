# WAS/Pika-H3-Flex-PTD

## Resumen

Pika H3 Flex PTD (WAS/Pika-H3-Flex-PTD) no es un modelo nuevo en sentido estricto, sino un conjunto de parches de modelo para ComfyUI que fusionan el adaptador de Pika H3 Flex (de Pika Labs / Mellis, Inc.) con los ficheros de destilación PTD de cuatro pasos del modelo de generación de vídeo MiniMax H3, desarrollado por MiniMax. El resultado permite generar vídeo con el estilo de movimiento y trabajo de cámara de Pika, con sonido, en tan solo cuatro pasos de muestreo a CFG 1.

El proyecto se apoya en la técnica PTD (Parametric Trajectory Distillation, del laboratorio VITA de EPFL) para la variante fl2va, y en los LoRA PTD de taobao-content-ai para la variante Ref2VA. Cada fichero combina el fichero PTD de cuatro pasos sin modificar (con sus factores de adaptador re-codificados a int8) y el adaptador de Pika H3 Flex almacenado como sección compartida a intensidad 0.5.

Su relevancia radica en la aceleración práctica: reduce la inferencia de vídeo a cuatro pasos sin necesidad de nodos ni LoRAs adicionales de Pika, integrándose directamente en el ecosistema WAS Node Suite para ComfyUI. El repositorio pesa 9,6 GB y contiene dos ficheros safetensors de unos 4,8 GB cada uno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parche de modelo (model patch) sobre transformer de difusión de vídeo MiniMax H3 (variantes fl2va y Ref2VA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de generación de vídeo; depende del transformer base MiniMax H3) |
| Tipos de cuantizacion | int8 (factores de adaptador re-codificados) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (other) |
| Formato de pesos | safetensors |

Ficheros incluidos:

| Fichero | Tamano | Transformer | Origen |
|---|---:|---|---|
| `pika_h3_flex_td_4step_s050.safetensors` | 4,79 GB | MiniMax H3 fl2va | Adaptador Pika H3 Flex fl2va + PTD fl2va de 4 pasos (epfl-vita/PTD-weights), int8 |
| `pika_h3_flex_td_ref2va_4step_s050.safetensors` | 4,82 GB | MiniMax H3 Ref2VA | Adaptador Pika H3 Flex ref2va + Ref2VA PTD de 4 pasos (taobao-content-ai/MiniMax-H3-PTD-LoRAs), int8 |

## Arquitectura y entrenamiento

Cada fichero es una modificación de los ficheros PTD originales de cuatro pasos: conserva intactos los adaptadores por paso y las cabezas de salida del PTD, y añade el adaptador de Pika H3 Flex almacenado una sola vez en una sección `shared.` con `ptd_shared_strength` 0,5. El nodo H3 PTD Patch de WAS Node Suite aplica el adaptador compartido en cada paso junto a los adaptadores propios de ese paso. Los tensores de ambas fuentes permanecen sin cambios salvo la re-codificación int8 de los factores del PTD; cada fichero registra en sus metadatos safetensors los hashes SHA-256 de los adaptadores Pika de origen (`68783e64...` para fl2va y `e4d058fb...` para ref2va) junto al hash del fichero PTD.

No se ha entrenado ningún modelo desde cero: se trata de una fusión de adaptadores ya publicados. La destilación PTD original (Parametric Trajectory Distillation for Few-Step Video Generation, EPFL VITA Lab) permite muestrear en cuatro pasos; los detalles del dataset, número de tokens o técnicas de alineamiento de la destilación original no están disponibles en la información proporcionada.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) mediante el transformer fl2va de MiniMax H3 con el estilo de movimiento y cámara de Pika.
- Generación de vídeo a partir de imagen (image-to-video) con la variante fl2va.
- Generación de vídeo por referencia (reference-to-video) con la variante Ref2VA.
- Generación de audio/sincronización de sonido junto al vídeo (según la model card: "Pika's motion and camera work, with sound").
- Inferencia destilada en 4 pasos a CFG 1, lo que reduce drásticamente el tiempo de muestreo frente al muestreo completo.
- Compatibilidad con LoRAs adicionales apilados sobre el parche.
- Integración nativa con ComfyUI mediante los nodos Load Model Patch y H3 PTD Patch de WAS Node Suite; no requiere nodos ni LoRA separados de Pika.

## Casos de uso

- Generación rápida de clips de vídeo en ComfyUI: el flujo de 4 pasos a CFG 1 permite iterar prompts de vídeo en segundos o minutos en lugar de decenas de pasos, ideal para exploración creativa.
- Animación de imágenes estáticas (image-to-video): con la variante fl2va se puede animar un fotograma de entrada manteniendo el movimiento y trabajo de cámara característicos de Pika.
- Vídeo guiado por referencia (reference-to-video): la variante Ref2VA permite generar vídeo coherente con una referencia visual, útil para consistencia de personaje o estilo.
- Producción de contenido con audio: el modelo genera sonido junto al vídeo, evitando un paso separado de generación de audio en flujos sencillos.
- Pipelines creativos con LoRAs personalizados: al ser un parche, otros LoRAs pueden aplicarse encima, lo que permite combinar estilos propios con el movimiento de Pika.
- Automatización de generación de vídeo por lotes: la determinación de los sigmas entrenados (el sampler avisa si los pasos no coinciden) facilita flujos reproducibles en scripts y colas de ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Como referencia cualitativa: la destilación reduce el muestreo a 4 pasos frente al número de pasos completo del modelo base, pero no se proporcionan métricas de calidad (FVD, VBench u otras) ni tiempos de inferencia medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los ficheros de parche pesan unos 4,8 GB cada uno (int8), a los que hay que sumar el transformer MiniMax H3 correspondiente (fl2va o ref2va, en versiones int8 como `minimax_h3_fl2va_int8_convrot.safetensors` o `minimax_h3_ref2va_pruned_int8_convrot.safetensors`), por lo que se recomienda una GPU con VRAM holgada para modelos de vídeo de este tamaño.
- GPU recomendadas: no disponible explícitamente; para vídeo generativo de esta escala, GPUs de gama alta tipo RTX 4090 (24 GB) o superiores (A100, H100) son las candidatas razonables.
- Consumer GPU: plausible en tarjetas de 24 GB con las versiones int8/pruned indicadas en la model card; no hay confirmación oficial.
- Despliegue: ComfyUI con WAS Node Suite (nodo H3 PTD Patch). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible; el muestreo es de 4 pasos a CFG 1.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Licencia | Notas |
|---|---|---|---|---|
| WAS/Pika-H3-Flex-PTD | Parche fusionado (Pika + PTD 4-step) sobre MiniMax H3 | 4 (CFG 1) | MiniMax H3 Community License | Movimiento/cámara Pika con sonido, integrado en ComfyUI |
| Pika-Labs/Pika-H3-Flex | Adaptador/LoRA base de Pika | no disponible (muestreo completo) | no disponible | Requiere LoRA separado y más pasos de muestreo |
| epfl-vita/PTD-weights | Ficheros PTD de destilación para MiniMax H3 | 4 | no disponible | Destilación sin el estilo de Pika |
| MiniMaxAI/MiniMax-H3 | Modelo base de vídeo | no disponible | MiniMax H3 Community License | Modelo transformer original sin destilar |

## Limitaciones y advertencias

- Licencia: MiniMax H3 Community License Agreement. Al tratarse de ficheros modificados de fuentes bajo esa licencia (Sección III.2), el uso comercial está sujeto a los términos de dicho acuerdo; conviene revisar LICENSE y NOTICE antes de cualquier despliegue comercial.
- Cada fichero de parche es específico de una variante del transformer: el fichero fl2va requiere el transformer fl2va y el ref2va requiere el ref2va; mezclarlos no funcionará.
- El sampler debe usar los sigmas entrenados del fichero (4 pasos); con otros pasos, el nodo avisa y detiene la ejecución.
- No hay métricas de calidad publicadas: la fidelidad del movimiento "estilo Pika" a intensidad 0,5 y el impacto de la re-codificación int8 sobre la calidad no están cuantificados.
- Riesgo de artefactos típico de la destilación a pocos pasos (pérdida de detalle, menor coherencia temporal en escenas complejas): no documentado, pero esperable en este tipo de técnicas.
- Sesgos, alucinaciones y limitaciones de idioma: heredados del modelo base MiniMax H3; no se documentan específicamente.
- Proyecto comunitario con adopción muy reducida (139 descargas, 2 likes en el momento de la ficha): soporte limitado y posible inestabilidad ante actualizaciones de ComfyUI o WAS Node Suite.

## Enlaces

- Ficha del modelo: https://huggingface.co/WAS/Pika-H3-Flex-PTD
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pika H3 Flex: https://huggingface.co/Pika-Labs/Pika-H3-Flex
- PTD fl2va (EPFL VITA): https://huggingface.co/epfl-vita/PTD-weights
- Ref2VA PTD LoRAs: https://huggingface.co/taobao-content-ai/MiniMax-H3-PTD-LoRAs
- WAS Node Suite (GitHub): https://github.com/WASasquatch/was-node-suite-comfyui
- Licencia (LICENSE) y NOTICE: disponibles en el repositorio del modelo (enlaces relativos LICENSE y NOTICE en la model card)
