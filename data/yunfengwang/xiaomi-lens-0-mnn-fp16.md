# yunfengwang/Xiaomi-Lens-0-MNN-fp16

## Resumen

Xiaomi-Lens-0-MNN-fp16 es la conversión a MNN (Motor de inferencia de Alibaba) del modelo multimodal Xiaomi-Lens-0, un vision-language model de 4.600 millones de parámetros desarrollado por SeerRay-Lab y orientado a *visual grounding* y segmentación de imágenes. El modelo original combina un codificador visual Qwen3.5 ViT con un decodificador de lenguaje Qwen3.5-4B y añade una cabeza de segmentación que produce máscaras de píxeles, todo ello dentro de un pipeline imagen → texto + bounding box + máscara.

La relevancia de esta conversión concreta reside en que elimina la dependencia de PyTorch y Transformers para ejecutar el modelo en CPU, reduciendo el checkpoint de 9,2 GB en bf16 a un conjunto de tres grafos MNN más una tabla de embeddings en fp16 que ocupan 10,6 GB en el repositorio. El autor reporta una mejora de velocidad de 7,9× de extremo a extremo frente a la ruta oficial de Hugging Face en fp32 sobre CPU, con una máscara de píxeles idéntica bit a bit a la referencia (IoU 1,0000).

El modelo está pensado para inferencia *on-device* en CPU, sin GPU dedicada, y se distribuye bajo licencia Apache 2.0. La ficha se centra en esta variante MNN fp16; los datos sobre el modelo base original no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer: Qwen3.5 ViT (24 bloques, hidden 1024, patch 16, merge 2) + decodificador Qwen3.5-4B con estados KV/conv/recurrentes + decodificador de máscaras |
| Parámetros totales | 4.600 millones (4,6 B), según la model card |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el ejemplo usa prompts de 255 tokens; no se especifica el máximo) |
| Tipos de cuantización | fp16 (esta variante); existen variantes int8 (6,2 GB) e int4 (4,1 GB) publicadas por el mismo autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`.mnn` + `.weight`) y tabla de embeddings en `.npy` fp16; también existen grafos ONNX para reconversión |

## Arquitectura y entrenamiento

La arquitectura es un pipeline multimodal de tres etapas. La primera es un codificador visual Qwen3.5 ViT de 24 bloques con dimensión oculta 1024, parches de 16×16 y factor de merge 2, que procesa un número dinámico de parches y produce características pre-merge (n×1024) y mergeadas (m×2560). La segunda es un decodificador de lenguaje Qwen3.5-4B en modo incremental de un token por ejecución, con estados KV, convolucionales y recurrentes explícitos, lo que sugiere la presencia de capas tipo GatedDeltaNet (el autor menciona que la ruta HF en CPU cae en un kernel im2col lento para el `conv1d` de GatedDeltaNet). La tercera es un decodificador de máscaras con lienzo fijo de 24×36 y 32 ranuras de máscara.

El procesamiento de imagen utiliza el smart-resize y patchify de Qwen2-VL, junto con M-RoPE y tablas de posición/rotary vision implementadas en numpy y Pillow dentro del CLI; solo los tres grafos corren en MNN. La tabla de embeddings de entrada está atada (tied) al decodificador y tiene dimensiones 248.078 × 2560 en fp16. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, por lo que esos datos se consideran no disponibles.

La innovación técnica destacable de esta variante es la conversión a MNN con verificación numérica contra la implementación oficial: las características del ViT tras el merge presentan un error absoluto máximo de 7,2e-3 y medio de 3,6e-5; los logits del decodificador, 1,8e-3 sobre 8 pasos; y los logits de máscara, 6,0e-3. El texto y el bounding box generados son idénticos a los de HF, y la máscara final alcanza IoU 1,0000 con el 100 % de coincidencia de píxeles.

## Capacidades

- Generación de texto descriptivo sobre imágenes (image-text-to-text).
- *Visual grounding*: localización de objetos descritos en lenguaje natural mediante bounding boxes en formato `<bbox>[x1, y1, x2, y2]</bbox>`.
- Segmentación de instancias: generación de máscaras de píxeles con marcador `<mask><|mask|></mask>` y lienzo fijo de 24×36 con 32 ranuras.
- Respuesta a preguntas de forma libre mediante `--prompt`, que se pasa sin modificar al modelo.
- Instrucción de grounding mediante `--describe EXPR`, que expande a la instrucción completa de localización con cajas y máscaras.
- Inferencia en CPU sin PyTorch ni Transformers, con backend MNN.
- Capacidades multilingües: no disponible.
- Tool calling, function calling, agentes y multi-step reasoning: no disponible en la información proporcionada.
- Modo *thinking*: el ejemplo muestra "0 in thinking", lo que sugiere algún mecanismo de razonamiento, pero no se detalla su funcionamiento.

## Casos de uso

- Anotación automática de datasets de visión: el modelo genera bounding boxes y máscaras a partir de descripciones textuales, lo que permite preetiquetar imágenes para entrenamiento de detectores y segmentadores, con revisión humana posterior. La coincidencia de máscara con la referencia HF (IoU 1,0000) lo hace adecuado para este fin.
- Segmentación interactiva en aplicaciones de escritorio: un usuario describe un objeto ("a large brown cow standing in the grass") y el modelo devuelve la caja y la máscara, habilitando flujos de edición de imagen o recorte sin GPU.
- Procesamiento por lotes en servidores sin GPU: al ejecutarse en CPU con MNN, puede desplegarse en máquinas sin acelerador, con un coste de 79,5 s por imagen y prompt de 255 tokens en un Apple M5 Pro, adecuado para trabajos offline o de baja frecuencia.
- Catalogación y búsqueda visual en dispositivos: la inferencia *on-device* permite indexar objetos por descripción en bibliotecas de fotos locales sin enviar imágenes a la nube.
- Control de calidad industrial o agrícola: localización y segmentación de elementos descritos (por ejemplo, ganado, productos o defectos) en imágenes capturadas en campo, con despliegue en portátiles o equipos de borde.
- Investigación en modelos multimodales: la disponibilidad de grafos ONNX y MNN verificados numéricamente facilita experimentos de cuantización (int8, int4) y comparación de precisión frente a la referencia torch, con métricas de IoU ya publicadas.
- Integración en pipelines de datos con CLI: el paquete `xiaomi-lens-mnn` en PyPI, ejecutable con `uvx`, permite incorporar el modelo a scripts de procesamiento de imágenes sin gestionar entornos de Python con torch.

## Benchmarks y rendimiento

Datos de velocidad publicados en la model card, sobre Apple M5 Pro (48 GB), macOS arm64, backend CPU, 15 hilos, imagen de 586×394, prompt de 255 tokens (216 de imagen), 32 tokens generados y una máscara:

| Etapa | torch fp32 (HF) | ONNX Runtime | MNN fp16 | MNN int8 |
|---|---:|---:|---:|---:|
| Visión | 0,74 s | 1,41 s | 1,80 s | 1,84 s |
| Prefill LLM (255 tok) | 24,78 s | 84,46 s | 70,11 s | 64,46 s |
| Decode LLM (32 tok) | 600,07 s | 10,36 s | 6,74 s | 6,10 s |
| Máscara de píxeles | 0,35 s | 0,15 s | 0,85 s | 0,53 s |
| Extremo a extremo | 625,9 s | 96,4 s | 79,5 s | 73,0 s |
| Decode por token | 18,75 s | 0,324 s | 0,211 s | 0,191 s |

Verificación numérica frente a la implementación oficial torch/HF:

| Comprobación | Resultado |
|---|---|
| Características ViT pre-merge, máx / medio abs | 8,4 / 1,3e-3 |
| Características ViT mergeadas, máx / medio abs | 7,2e-3 / 3,6e-5 |
| Logits / hidden del decodificador, máx abs en 8 pasos | 1,8e-3 / 1,5e-3 |
| Logits de máscara, máx / medio abs | 6,0e-3 / 2,2e-3 |
| Texto y bbox generados vs HF | idénticos |
| Máscara final vs HF | IoU 1,0000, 100 % de coincidencia |

No se han publicado resultados de benchmarks de calidad tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: no aplica en esta variante, que está diseñada para inferencia en CPU; no se especifican requisitos de memoria RAM, aunque el tamaño del modelo (10,6 GB en disco, con descarga de ~10,5 GB en caché) sugiere que se necesita al menos esa cantidad de memoria disponible.
- GPU recomendadas: no disponible; la conversión está orientada a CPU con backend MNN.
- ¿Cabe en GPU de consumo? La variante int4 (4,1 GB) podría ser candidata, pero no se proporcionan datos de despliegue en GPU para ninguna variante.
- Opciones de despliegue: MNN mediante el CLI `xiaomi-lens-mnn` (PyPI, versión probada 0.1.3), ejecutable con `uvx`; grafos ONNX disponibles para reconversión en `Xiaomi-Lens-0-onnx`.
- Latencia y throughput: 79,5 s de extremo a extremo en M5 Pro con 255 tokens de prompt y 32 de salida; 0,211 s por token en decode para fp16 y 0,191 s para int8. La variante int8 es un ~8 % más rápida que fp16 según el autor.
- Almacenamiento: 10,6 GB en el repositorio; descarga en caché de ~10,5 GB en `~/.cache/xiaomi-lens-mnn/fp16`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Xiaomi-Lens-0-MNN-fp16 (este) | 4,6 B | no disponible | MNN, CPU | Apache 2.0 | 10,6 GB, grounding + segmentación, verificado vs HF |
| Xiaomi-Lens-0-MNN-int8 | 4,6 B | no disponible | MNN, CPU | Apache 2.0 | 6,2 GB, ~8 % más rápido, IoU 0,997 vs fp16 |
| Xiaomi-Lens-0-MNN-int4 | 4,6 B | no disponible | MNN, CPU | Apache 2.0 | 4,1 GB, IoU 0,986 vs fp16 en 5 imágenes |
| Xiaomi-Lens-0 (base, SeerRay-Lab) | 4,6 B | no disponible | torch/HF | no disponible | Checkpoint bf16 de 9,2 GB; referencia oficial |

No se dispone de información sobre otros modelos comparables de la misma categoría (grounding + segmentación de 4-5 B parámetros) en la documentación proporcionada.

## Limitaciones y advertencias

- El prompt debe tener la forma adecuada para obtener cajas y máscaras: una frase suelta pasada a `--prompt` se responde como pie de foto y no devuelve bbox ni máscara; es necesario usar `--describe` o la instrucción completa de grounding.
- El prefill es lento en MNN (70,11 s para 255 tokens) porque el grafo del decodificador es incremental de un token por ejecución; para prompts largos el coste crece de forma lineal y puede ser prohibitivo en producción interactiva.
- La máscara se genera sobre un lienzo fijo de 24×36 con 32 ranuras, lo que limita la resolución y el número de instancias segmentables simultáneamente.
- La variante int8 presenta pequeñas diferencias de máscara frente a fp16 (IoU 0,997; 0,03 % de píxeles distintos) y la int4 baja a IoU 0,986 en 5 imágenes; para aplicaciones sensibles a la precisión de la máscara conviene usar fp16.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero se desconoce si el modelo base impone restricciones adicionales; conviene verificar la licencia de `SeerRay-Lab/Xiaomi-Lens-0`.
- El rendimiento medido corresponde a un Apple M5 Pro con 15 hilos; en hardware más modesto la latencia será considerablemente mayor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; se trata de una conversión reciente y poco validada por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-fp16
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Variante int8: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-int8
- Variante int4: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-int4
- Grafos ONNX: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-onnx
- Paquete PyPI: https://pypi.org/project/xiaomi-lens-mnn/
- Repositorio MNN: https://github.com/alibaba/MNN
