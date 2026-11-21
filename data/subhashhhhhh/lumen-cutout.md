# subhashhhhhh/lumen-cutout

## Resumen

Lumen Cutout es un modelo de segmentación de sujeto (subject segmentation) y eliminación de fondo diseñado para ejecutarse íntegramente en la NPU de teléfonos Android. Lo desarrolla subhashhhhhh como componente del proyecto Lumen, una galería Android local-first, y se distribuye en formato LiteRT/TFLite totalmente cuantizado a int8. Deriva de BiRefNet-lite (Zheng et al.) mediante reescrituras exactas del grafo, cambios arquitectónicos y destilación con conciencia de cuantización, con el objetivo de producir máscaras de 1024×1024 en decenas de milisegundos en hardware móvil.

El problema que resuelve es concreto: el modelo original no compila para una NPU móvil, ya que sus convoluciones deformables, tensores de 5 y 6 dimensiones, rolls cíclicos y activaciones a resolución completa no son compatibles con el hardware ni caben en su memoria on-chip. Lumen Cutout reescribe lo que puede reescribirse de forma matemáticamente equivalente, sustituye lo que no y recupera la precisión mediante destilación sobre el grafo exacto de la NPU.

Es relevante porque demuestra que una tarea de visión de alta resolución puede ejecutarse por completo en la NPU de un móvil de gama media sin renunciar a la calidad del profesor en coma flotante. El modelo tiene 61 MB en int8, procesa una máscara de 1024×1024 en 23,7 ms en un Snapdragon 8 Elite Gen 5 y 182 ms en un Snapdragon 7 Gen 1, y mantiene un IoU mediano de 0,993 frente al profesor float en 150 fotos reservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido derivado de BiRefNet-lite (backbone Swin reescrito + decodificador convolucional, resolución dividida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entradas de 1024×1024 y 640×640) |
| Tipos de cuantizacion | int8 (activaciones y pesos); pesos float16 disponibles en PyTorch |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | TFLite (LiteRT) int8, variantes precompiladas por chip en `npu/`; PyTorch float16 (`.pt`) |

## Arquitectura y entrenamiento

Lumen Cutout parte de BiRefNet-lite y aplica dos niveles de transformación. Primero, reescrituras exactas verificadas contra el modelo original: atención de ventana en 4 dimensiones, ventanas desplazadas sin roll, convoluciones con división de canales y atención procesada cabeza a cabeza. Después, cambios arquitectónicos donde la equivalencia no era posible: convoluciones estándar en lugar de deformables, backbone Swin sobre una copia de 640 píxeles mientras el decodificador y la máscara trabajan a 1024 (resolución dividida con dos entradas), una cola ligera a resolución completa y una ventana global única.

El entrenamiento emplea destilación con conciencia de cuantización a través del grafo exacto de la NPU, de modo que el modelo aprende la aritmética int8 real del hardware en lugar de cuantizarse a posteriori. El dataset declarado es `detection-datasets/coco`. El resultado es un modelo con todas las capas en la NPU, sin ninguna que recaiga en la CPU, y con un único participante en el grafo compilado. Los pesos de la ronda final de entrenamiento se publican en float16 para PyTorch, y el script `convert/birefnet_lite.py` reconstruye el modelo a partir de ellos.

## Capacidades

- Segmentación de sujeto (salient object detection) con máscara de 1024×1024 a partir de una foto RGB.
- Eliminación de fondo (background removal) mediante la máscara generada.
- Ejecución íntegra en NPU Qualcomm, sin fallback a CPU en las variantes precompiladas.
- Inferencia int8 con dos entradas (1024×1024 y 640×640) y una salida de máscara int8.
- Precompilación ahead-of-time para 42 chips Snapdragon.
- No soporta tool calling, agentes, texto, visión general ni audio: es un modelo puramente de segmentación.

## Casos de uso

- Recorte interactivo en galerías Android: el modelo sustenta la función "mantener pulsado para recortar" de Lumen, generando la máscara en 23,7 ms en un Snapdragon 8 Elite Gen 5, lo que permite respuesta en tiempo real al gesto del usuario.
- Eliminación de fondo en apps de edición fotográfica: la máscara de 1024×1024 con IoU mediano de 0,993 frente al profesor float es suficiente para composición y exportación sin artefactos visibles.
- Procesamiento por lotes en dispositivo: con 61 MB de modelo y 286-299 MB de memoria pico, cabe en móviles de gama media y permite procesar bibliotecas enteras de fotos sin subir imágenes a la nube.
- Privacidad por diseño: al ejecutarse localmente en la NPU, las fotos no salen del dispositivo, lo que encaja en aplicaciones de salud, documentos o contenido personal.
- Stickers y avatares: la máscara binaria a resolución completa sirve para generar recortes con transparencia en apps de mensajería y redes sociales.
- Preprocesado en pipelines de visión: la máscara de sujeto puede alimentar etapas posteriores (clasificación, edición, composición) en aplicaciones de cámara en tiempo real.
- Integración en apps de galería y gestión de recuerdos: selección automática de sujetos para collages, miniaturas o presentaciones sin coste de servidor.

## Benchmarks y rendimiento

Calidad frente a etiquetas humanas (S-measure, max F, MAE; mayor, mayor, menor es mejor):

| Modelo | ECSSD (1.000) | DUT-OMRON (5.168) |
|---|---|---|
| Lumen Cutout int8 en NPU 7 Gen 1 | 0,939 / 0,945 / 0,028 | 0,830 / 0,760 / 0,062 |
| Profesor (modelo original, float32) | 0,938 / 0,947 / 0,025 | 0,826 / 0,763 / 0,057 |
| Apple Vision foreground mask | 0,940 / 0,946 / 0,023 | 0,842 / 0,757 / 0,037 |
| ML Kit Subject Segmentation | 0,928 / 0,938 / 0,033 | 0,789 / 0,719 / 0,091 |
| U²-Net | 0,928 / 0,940 / 0,033 | 0,848 / 0,795 / 0,054 |

Velocidad para una máscara de 1024×1024 (Qualcomm AI Hub, LiteRT en NPU):

| Teléfono | Chip | Tiempo | Memoria pico |
|---|---|---|---|
| Samsung Galaxy S26 | Snapdragon 8 Elite Gen 5 | 23,7 ms | 299 MB |
| Samsung Galaxy S25 | Snapdragon 8 Elite | 31,1 ms | 293 MB |
| Snapdragon 7 Gen 4 QRD | Snapdragon 7 Gen 4 | 73,8 ms | 286 MB |
| Samsung Galaxy S21 | Snapdragon 888 | 106,8 ms | 286 MB |
| Samsung Galaxy A73 5G | Snapdragon 778G | 188,7 ms | 474 MB |
| Motorola Edge 50 | Snapdragon 7 Gen 1 | 182 ms (`qnn-net-run`), 190 ms en la app Lumen | no disponible |

En los mismos teléfonos el modelo original agota la memoria a 1024 píxeles; a 512 tarda 677 ms (S26) y 3.653 ms (A73) en CPU.

## Requisitos de hardware

- VRAM/memoria: 286-299 MB de memoria pico en la mayoría de chips; 474 MB en Snapdragon 778G. Modelo de 61 MB en int8.
- GPU/NPU recomendadas: NPU Qualcomm Snapdragon. Variantes precompiladas para 42 chips, incluyendo SM8850 (8 Elite Gen 5), 8 Elite, 7 Gen 4, 888, 778G y 7 Gen 1 (SM7450).
- Cabe en hardware consumer móvil; no requiere GPU de escritorio. En CPU de escritorio funciona con LiteRT pero con menor fidelidad (IoU mediano 0,96 frente a 0,993 en NPU).
- Despliegue: LiteRT (`ai-edge-litert`) con `CompiledModel` y `Accelerator.NPU` en Android; `qnn-net-run` para pruebas en chip; `example.py` para inferencia en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia: 23,7-188,7 ms por máscara según chip; throughput no publicado explícitamente.
- No compila para NPU MediaTek; chips antiguos como Snapdragon 765G ejecutan en CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto/entrada | Calidad (ECSSD S-measure) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumen Cutout | Segmentación de sujeto int8 para NPU | 1024×1024 + 640×640 | 0,939 | MIT | Hugging Face, TFLite |
| BiRefNet-lite (profesor) | Segmentación de sujeto float32 | 1024×1024 | 0,938 | no disponible en la información | Hugging Face |
| ML Kit Subject Segmentation | API de plataforma | no disponible | 0,928 | propietaria | SDK Android |
| Apple Vision foreground mask | API de plataforma | no disponible | 0,940 | propietaria | SDK Apple |
| U²-Net | Segmentación de sujeto | no disponible | 0,928 | no disponible en la información | público |

## Limitaciones y advertencias

- En CPU de escritorio la fidelidad baja: los kernels int8 de referencia de LiteRT redondean de forma distinta a la NPU, con IoU mediano de 0,96 y algunas fotos problemáticas.
- Las variantes de `npu/` requieren el chip exacto para el que fueron compiladas; no son portables entre SoCs.
- No compila para NPU MediaTek; en chips antiguos cae a CPU con la penalización de rendimiento correspondiente.
- En DUT-OMRON seis modelos públicos superan su puntuación; el artículo original detalla las salvedades sobre datos de entrenamiento.
- Bordes ligeramente más suaves que el profesor float.
- No es un modelo multimodal ni de texto: no admite prompts, tool calling ni razonamiento; su única salida es una máscara.
- Licencia MIT, que permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base BiRefNet-lite y del dataset COCO.
- No hay datos publicados sobre sesgos demográficos o de otro tipo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subhashhhhhh/lumen-cutout
- Modelo base BiRefNet-lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Paper (Zenodo, 2026): https://doi.org/10.5281/zenodo.24152780
- Código: https://github.com/subhashhhhhh/lumen-cutout
- Proyecto Lumen: https://github.com/subhashhhhhh/Lumen
- Script de conversión: https://github.com/subhashhhhhh/lumen-cutout/blob/main/convert/birefnet_lite.py
- Instrucciones de reconstrucción: https://github.com/subhashhhhhh/lumen-cutout#rebuild-the-final-model
