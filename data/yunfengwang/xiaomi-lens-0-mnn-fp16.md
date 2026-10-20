# yunfengwang/Xiaomi-Lens-0-MNN-fp16

## Resumen

Xiaomi-Lens-0-MNN-fp16 es la conversión al runtime MNN del modelo multimodal Xiaomi-Lens-0, un vision-language model de 4,6 mil millones de parámetros desarrollado por SeerRay-Lab y republicado por el usuario yunfengwang. El modelo resuelve una tarea concreta de grounding y segmentación: recibe una imagen y un prompt de texto y devuelve, en una sola pasada, una respuesta textual, una caja delimitadora (`<bbox>[x1, y1, x2, y2]</bbox>`) y una máscara de píxeles (`<|mask|>`) del objeto referido. Esta versión reempaqueta el pipeline en tres grafos MNN más una tabla de embeddings en fp16, de forma que la inferencia se ejecuta en CPU sin PyTorch ni Transformers.

El interés práctico está en los números de velocidad publicados. En la referencia medida (Apple M5 Pro de 48 GB, backend CPU, 15 hilos, imagen de 586×394, prompt de 255 tokens de los cuales 216 son de imagen, 32 tokens generados y una máscara), el pipeline completo tarda 79,5 s en fp16 frente a los 625,9 s de la implementación oficial en torch fp32, y la decodificación baja de 18,75 s/token a 0,211 s/token, unas 89 veces más rápida. El cuello de botella original es el kernel `conv1d` de las capas GatedDeltaNet, que en la ruta CPU de HuggingFace cae en una implementación im2col lenta.

La relevancia es doble: demuestra que un transformer híbrido con 24 capas GatedDeltaNet y 8 capas de atención completa puede ejecutarse en CPU sin framework de deep learning, y lo hace con verificación numérica explícita contra la referencia (texto y bbox idénticos, máscara con IoU 1,0000). Los costes son un prefill lento —70,11 s para 255 tokens, porque el grafo del decodificador es incremental de un token por ejecución— y una ausencia total de documentación sobre datos de entrenamiento, idiomas y evaluación de calidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: ViT Qwen3.5 (24 bloques, hidden 1024, patch 16, merge 2) + decodificador Qwen3.5-4B con 24 capas GatedDeltaNet y 8 capas de atención completa (capas 3, 7, …, 31) |
| Parámetros totales | 4,6 mil millones (modelo base Xiaomi-Lens-0) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | fp16 (este repositorio); int8 en el repositorio hermano `Xiaomi-Lens-0-MNN-int8` |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Grafos MNN (`.mnn` + `.weight`) y tabla de embeddings `.npy` fp16; grafos ONNX en repositorio aparte para reconversión |
| Vocabulario | 248.078 tokens (embedding atado de 248.078 × 2560) |
| Dimensión oculta | 2560 en el decodificador; 1024 en el ViT |
| Capas | 32 en el decodificador (24 GatedDeltaNet + 8 de atención completa); 24 en el ViT |
| Resolución de máscara | Lienzo fijo de 384 × 576, rejilla de 24 × 36 (864 tokens), 32 ranuras de máscara |
| Tamaño del repositorio | 10,6 GB (descarga inicial de
