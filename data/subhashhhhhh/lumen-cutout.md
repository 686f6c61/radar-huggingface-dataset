# subhashhhhhh/lumen-cutout

## Resumen

Lumen Cutout es un modelo de segmentación de imagen especializado en eliminación de fondos (background removal) y segmentación dicotómica de alta resolución, diseñado para ejecutarse en dispositivos móviles. Lo desarrolla el autor independiente subhashhhhhh como componente del proyecto Lumen, una galería de Android con enfoque local-first, y constituye el motor detrás de la función "mantener pulsado para recortar". Se distribuye bajo licencia MIT y deriva del modelo BiRefNet-lite de ZhengPeng7 mediante un proceso de modificación arquitectónica y destilación.

El problema que resuelve es la incompatibilidad entre las convoluciones deformables del decodificador de BiRefNet y los aceleradores de los teléfonos: ni la ruta GPU de LiteRT ni el compilador NPU de Qualcomm soportan dichas operaciones, y reconstruirlas con operaciones estándar genera "gathers" que la NPU no puede teselar. Lumen Cutout sustituye las 20 convoluciones deformables por convoluciones planas del mismo tamaño y recupera la precisión perdida mediante destilación desde el modelo original.

El resultado es un modelo LiteRT/TFLite de 134 MB con entrada de 512×512 píxeles RGB y salida de máscara 0-1, que corre en 160 ms sobre la GPU de un Snapdragon 7 Gen 1 y también compila de forma anticipada para NPU de Qualcomm en nueve chips. Su relevancia actual radica en que demuestra que un modelo de segmentación de alta calidad puede ejecutarse íntegramente en el dispositivo, sin conexión y con latencia interactiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet-lite modificado: backbone Swin (congelado) + decodificador con convoluciones planas en lugar de deformables |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada fija de 512×512) |
| Tipos de cuantizacion | Pesos float16 con cómputo float32 (CPU) o float16 (GPU); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de imagen, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | TFLite/LiteRT (`cutout_512.tflite`, 134 MB) y PyTorch (`pytorch/decoder_v2.pt`, 29 MB, float16) |

## Arquitectura y entrenamiento

El modelo parte de BiRefNet-lite, que emplea un backbone Swin Transformer y un decodificador con convoluciones deformables. La modificación clave consiste en reemplazar las 20 convoluciones deformables del decodificador por convoluciones planas del mismo tamaño, inicializadas desde los kernels regulares del modelo original. Este cambio por sí solo altera aproximadamente el 10% de los píxeles de la máscara respecto al original.

Para recuperar la precisión se aplicó destilación: el profesor es el BiRefNet-lite original y el estudiante es la versión con convoluciones planas. Se usaron 118.000 imágenes de entrenamiento de COCO 2017 sin etiquetas, de modo que el estudiante aprende a reproducir las máscaras del profesor, mayoritariamente a 512×512 y algunas a 768×768, con aumento de datos. Solo se entrenan el decodificador y el módulo squeeze; el backbone Swin permanece congelado con los pesos originales. La función de pérdida combina BCE y L1 contra la máscara del profesor, con un peso 5× en una banda alrededor de los bordes. Se usó el optimizador AdamW con learning rate 1e-4 y precisión mixta, en dos ejecuciones sobre una única GPU Kaggle T4.

La innovación técnica destacable es la sustitución de operaciones no soportadas por hardware móvil (convoluciones deformables) por alternativas compatibles con GPU y NPU, manteniendo la fidelidad mediante destilación. El modelo incorpora internamente la normalización ImageNet y la sigmoide, de modo que recibe RGB 0-255 y devuelve la máscara 0-1 directamente.

## Capacidades

- Segmentación dicotómica de imagen: separa el sujeto del fondo generando una máscara binaria suavizada.
- Eliminación de fondos de alta resolución con entrada fija de 512×512 píxeles.
- Inferencia en dispositivo (on-device) sin conexión a red.
- Ejecución en GPU móvil mediante LiteRT con cómputo float16.
- Compilación anticipada para NPU de Qualcomm en nueve chips Snapdragon.
- Exportación a PyTorch para uso en servidor o escritorio mediante transformers.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües; es un modelo puramente visual de una sola tarea.

## Casos de uso

- Recorte interactivo en galerías móviles: el modelo permite implementar "mantener pulsado para recortar" en aplicaciones de fotos, con 160 ms de latencia en GPU de un Snapdragon 7 Gen 1, suficiente para una respuesta percibida como instantánea.
- Edición fotográfica local sin conexión: aplicaciones de retoque pueden eliminar fondos en el propio teléfono, preservando la privacidad del usuario al no enviar imágenes a servidores.
- Generación de avatares y stickers: la máscara 0-1 permite componer al sujeto sobre nuevos fondos o generar recortes para redes sociales directamente en el dispositivo.
- Preprocesado para pipelines de visión: el recorte del sujeto puede alimentar etapas posteriores (clasificación, detección, generación) en aplicaciones de realidad aumentada o pruebas virtuales.
- Automatización de catálogos de producto: en servidores con PyTorch, el modelo puede procesar lotes de imágenes para eliminar fondos de forma uniforme, usando los pesos destilados de 29 MB junto al backbone original.
- Integración en apps Android mediante LiteRT: el uso de `serializationDir` permite cachear los programas GPU (carga inicial de ~10 s, posteriores de ~1,5 s), lo que viabiliza su inclusión en aplicaciones de producción.
- Procesamiento en dispositivos con NPU: en chips Snapdragon compatibles puede ejecutarse vía QAIRT, aunque en el 7 Gen 1 la NPU resultó más lenta (559 ms) que la GPU, por lo que la elección de acelerador debe evaluarse por chip.

## Benchmarks y rendimiento

Porcentaje de píxeles cuya clasificación respecto al umbral 0,5 difiere del BiRefNet-lite original (menor es mejor):

| Conjunto | Antes de destilación | Después de destilación |
|---|---|---|
| COCO val (200 imágenes), 512 | 10,4% | 3,84% |
| COCO val, 768 | no disponible | 4,13% |
| Fotos propias del desarrollador (180, privadas, no usadas en entrenamiento), 512, mediana | no disponible | 0,38% |

En las fotos del desarrollador, la mediana de solapamiento (IoU) con el original es 0,99 y el 94% de las fotos supera 0,9. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de segmentación.

Rendimiento de inferencia en Snapdragon 7 Gen 1 (Motorola Edge 50): 160 ms en GPU (LiteRT, float16) y 1,8 s en cuatro núcleos de CPU. En NPU del mismo chip: 559 ms.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo está pensado para ejecución en dispositivo, no para GPU de escritorio.
- GPU móviles recomendadas: Snapdragon 7 Gen 1, 8 Gen 1, 8+ Gen 1, 8 Gen 2, 8 Gen 3, 8 Elite y variantes 8 Elite Gen 5 (soporte NPU vía LiteRT 2.3 y QAIRT 2.50).
- Cabe en cualquier smartphone moderno con GPU compatible con LiteRT; el archivo TFLite ocupa 134 MB.
- Opciones de despliegue: LiteRT/TFLite en Android (GPU o NPU), PyTorch con transformers para servidor o escritorio.
- Latencia: 160 ms en GPU de Snapdragon 7 Gen 1; 1,8 s en CPU de cuatro núcleos; 559 ms en NPU del mismo chip. La primera carga en GPU tarda ~10 s en compilar los programas; con `serializationDir` las cargas posteriores son de ~1,5 s.
- Throughput en servidor: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lumen Cutout | no disponible | 512×512 fija | 3,84% de discrepancia vs BiRefNet-lite en COCO val | MIT | Hugging Face, LiteRT y PyTorch |
| BiRefNet-lite (ZhengPeng7) | no disponible | resolución variable | referencia original; usa convoluciones deformables no soportadas en GPU/NPU móvil | MIT | Hugging Face |
| BiRefNet (completo) | no disponible | alta resolución | mayor calidad, mayor coste computacional | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de segmentación en la información proporcionada.

## Limitaciones y advertencias

- Escenas con mucho desorden: sin convoluciones deformables el decodificador tiene menos contexto; en 5 de 180 fotos de prueba tomó una parte grande del fondo como sujeto. El autor planea una versión con kernels mayores.
- Entrada fija de 512×512: la imagen se estira a un cuadrado y la máscara debe reescalarse de vuelta, lo que puede introducir distorsiones en imágenes con relaciones de aspecto extremas.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni razonamiento; su uso está limitado a segmentación de imagen.
- Dependencia del backbone original: los pesos PyTorch solo contienen el decodificador destilado; es necesario cargar BiRefNet-lite desde transformers para reconstruir el modelo completo.
- Riesgo de alucinación de máscara: en escenas complejas puede incluir regiones de fondo como sujeto, lo que requiere validación en producción.
- Los datos de destilación provienen de COCO 2017, sujeto a los términos de uso de COCO; el repositorio no incluye imágenes ni etiquetas de COCO.
- Licencia MIT permite uso comercial, pero se solicita atribuir al BiRefNet original mediante la cita BibTeX indicada.
- El soporte NPU está limitado a chips Qualcomm concretos y puede ser más lento que la GPU según el modelo de chip.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/subhashhhhhh/lumen-cutout
- Modelo base BiRefNet-lite: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Proyecto Lumen (galería Android): https://github.com/subhashhhhhh/Lumen
- Dataset COCO 2017: https://cocodataset.org
- Términos de uso de COCO: https://cocodataset.org/#termsofuse
