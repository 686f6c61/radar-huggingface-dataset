# yunfengwang/Xiaomi-Lens-0-onnx

## Resumen

Xiaomi-Lens-0-onnx es la exportación a ONNX de Xiaomi-Lens-0, un modelo visión-lenguaje de 4,6 mil millones de parámetros orientado a visual grounding y segmentación de imágenes, desarrollado por SeerRay-Lab y publicado en formato ONNX por el usuario yunfengwang. El paquete divide el modelo original en tres grafos independientes (codificador visual, paso de decodificación del LLM y decodificador de máscaras) que pueden ejecutarse sin el código de modelado original.

La relevancia del repositorio es operativa: es la fuente de las conversiones a MNN en fp16 e int8 pensadas para inferencia on-device, y permite reconvertir los grafos a otros runtimes como TensorRT o Core ML. No es un paquete listo para producción, sino material de inspección y reconversión; para ejecutar el pipeline completo el autor remite al wheel `xiaomi-lens-mnn` publicado en PyPI.

El repositorio ocupa 17,7 GB, la mayor parte correspondiente a los 339 ficheros de datos externos del decodificador en fp32 (15,7 GiB). La model card incluye mediciones de latencia en CPU (Apple M5 Pro) y comprobaciones numéricas frente a la implementación en torch, con un IoU de 1,0000 en fp16 y 0,9970 en int8 sobre el ejemplo publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje híbrida: ViT Qwen3.5 + decodificador Qwen3.5-4B con capas GatedDeltaNet y capas de atención con caché KV; decodificador de máscaras independiente |
| Parametros totales | 4,6 B (según model card) |
| Parametros activos | No disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible (la caché KV admite longitud variable `past`, pero no se especifica el contexto entrenado) |
| Tipos de cuantizacion | fp32 en el decodificador; fp16 en ViT y decodificador de máscaras; conversiones derivadas MNN fp16 e int8. No hay GGUF |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (tres grafos; el decodificador usa 339 ficheros de datos externos en fp32) |
| Tamano del repositorio | 17,7 GB |
| Vocabulario del decodificador | 248.078 tokens (dimensión de `logits`) |
| Resolucion de mascara | 32 ranuras a 384×576 sobre un lienzo fijo de 24×36 |
| Entrada visual | Parches de 16×16, hasta 2 fotogramas, rejilla de parches dinámica |
| Modelo base | SeerRay-Lab/Xiaomi-Lens-0 |
| Fecha de publicacion | Creado el 2026-10-19; actualizado el 2026-10-20 |

## Arquitectura y entrenamiento

El codificador visual (`lens_vit.onnx`, 663 MB en fp16) es un ViT Qwen3.5 que opera sobre una rejilla de parches dinámica: recibe `pixel_values` de forma `(n, 1536)`, es decir, 3 canales × 2 fotogramas × 16 × 16, junto con `pos_embed` de `(n, 1024)` interpolado bilinealmente desde una tabla de 48×48 y tablas rotatorias 2D de 64 dimensiones para los tokens del bloque de fusión. Devuelve tokens previos a la fusión (`premerge`, 1024 dimensiones) y features fusionadas (`merged`, 2560 dimensiones, con `m = n/4`). La interpolación posicional, el orden de patchify y las tablas rotatorias se calculan fuera del grafo, de modo que `n` puede ser cualquier múltiplo de 4 para la rejilla elegida.

El decodificador (`lens_llm_decode.onnx`) es un paso de un solo token del LLM Qwen3.5-4B exportado en forma incremental, con estado explícito: 24 capas con estado convolucional GatedDeltaNet de forma `(1, 8192, 3)` y estado recurrente `(1, 32, 128, 128)`, más caché KV de 4 cabezas × 256 dimensiones en las capas 3, 7, ..., 31 (8 capas de atención). Usa M-RoPE con secciones intercaladas `[11, 11, 10]`. El grafo es fp32 (645 KB) y delega 15,7 GiB en 339 inicializadores externos. El primer paso admite caché KV de longitud cero y estados conv/recurrentes a cero; las salidas `o_*` se realimentan en la llamada siguiente.

El decodificador de máscaras (`lens_mask.onnx`, 167 MB en fp16) proyecta los estados ocultos en las posiciones `<|mask|>` (32 ranuras, 2560 dimensiones) junto con los 864 tokens visuales previos a la fusión (1024 dimensiones) y una `pad_mask`, y produce `mask_logits` de forma `(1, 32, 384, 576)`; el umbral de binarización es 0. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Visual grounding: localización de objetos descritos mediante un prompt de texto (el ejemplo de la model card usa `'a large brown cow standing in the grass'`).
- Segmentación a nivel de píxel con 32 ranuras de máscara simultáneas y resolución de salida de 384×576 sobre un lienzo fijo de 24×36.
- Generación de texto multimodal condicionada por imagen (pipeline `image-text-to-text`).
- Emisión de logits de máscara con umbral 0, aptos para postproceso propio.
- Decodificación incremental token a token con estado reanudable (KV, convolucional y recurrente) exportado de forma explícita.
- Entrada de hasta 2 fotogramas por imagen, lo que permite tratar pares de imágenes emparejadas.
- Despliegue on-device mediante las conversiones MNN fp16 e int8 derivadas de estos grafos.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras modalidades: no disponible (no documentado).

## Casos de uso

- Segmentación interactiva en aplicaciones móviles: el paquete MNN int8 permite ejecutar el pipeline completo en el dispositivo con `uvx xiaomi-lens-mnn --image ... --prompt ...`, sin enviar imágenes a un servidor, lo que encaja en apps de edición fotográfica con requisitos de privacidad.
- Recorte automático de producto en catálogos de comercio electrónico: se pasa una descripción textual del artículo y el modelo devuelve la máscara a 384×576, utilizable para fondos transparentes por lotes.
- Preetiquetado de datasets de visión: las 32 ranuras de máscara permiten generar anotaciones iniciales de várias instancias por imagen que después se revisan manualmente, reduciendo el coste de anotación.
- Inspección visual en entornos industriales o robótica: al poder reconvertirse a TensorRT o Core ML, el modelo puede integrarse en un pipeline local de baja latencia donde la descripción del defecto se escribe en texto y la salida es la región afectada.
- Accesibilidad: localización y descripción de objetos para aplicaciones de asistencia, aprovechando la combinación de grounding por texto y máscara de píxeles en el mismo paso.
- Investigación en eficiencia de inferencia: los tres grafos separados permiten medir y optimizar por etapas (visión, prefill, decode, máscara) y comparar runtimes, que es exactamente el uso que documenta la model card.
- Re-conversión a otros runtimes: los grafos ONNX sirven como fuente para generar versiones Core ML o TensorRT con `convert_to_mnn.sh` como referencia de flujo de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni métricas de grounding o segmentación más allá del IoU del ejemplo). Los únicos datos de rendimiento son mediciones de latencia del autor: ONNX Runtime 1.22 en CPU, 15 hilos, Apple M5 Pro, imagen de 586×394, prompt de 255 tokens, 32 tokens generados y una máscara.

| Etapa | torch fp32 (HF) | ONNX Runtime | MNN fp16 | MNN int8 |
|---|---:|---:|---:|---:|
| Visión | 0,74 s | 1,41 s | 1,80 s | 1,84 s |
| Prefill del LLM (255 tokens) | 24,78 s | 84,46 s | 70,11 s | 64,46 s |
| Decode del LLM (32 tokens) | 600,07 s | 10,36 s | 6,74 s | 6,10 s |
| Máscara de píxeles | 0,35 s | 0,15 s | 0,85 s | 0,53 s |
| Total extremo a extremo | 625,9 s | 96,4 s | 79,5 s | 73,0 s |
| Decode por token | 18,75 s | 0,324 s | 0,211 s | 0,191 s |

Throughput derivado de esas cifras: aproximadamente 3,1 tokens/s en ONNX Runtime y 5,2 tokens/s en MNN int8 durante la fase de decodificación, siempre en CPU. El autor explica que el decodificador se exportó en forma incremental, por lo que el prefill es un bucle secuencial de 255 pasos y resulta más lento que el forward paralelo de torch; el decodificador fp32 de ORT también es más lento que los kernels fp16/int8 de MNN, mientras que los grafos fp16 de ViT y máscara son las etapas más rápidas de los tres runtimes. En verificación numérica, el IoU del ejemplo es 1,0000 en fp16 y 0,9970 en int8; el resto de la sección de verificación está truncado en la información disponible.

## Requisitos de hardware

- Espacio en disco: 17,7 GB para el repositorio completo; el decodificador aporta 15,7 GiB en 339 ficheros de datos externos que deben permanecer en el mismo directorio que `lens_llm_decode.onnx`, ya que el grafo los referencia por nombre base.
- Memoria estimada para inferencia: en torno a 16-17 GB si se carga el decodificador en fp32 tal como se publica, y aproximadamente 8-9 GB si se convierte a fp16 (estimación aritmética a partir del tamaño de los ficheros, no medida por el autor).
- Única configuración medida: CPU Apple M5 Pro con 15 hilos y ONNX Runtime 1.22, con 96,4 s de extremo a extremo para el caso de referencia.
- GPU: no hay mediciones publicadas. Por tamaño, una RTX 4090 de 24 GB podría alojar el decodificador fp32 (estimación); A100 y H100 no están documentadas en la información disponible.
- Cabe en GPU de consumo solo en el caso anterior y con el decodificador en fp32 o reconvertido; no se aportan cifras de VRAM reales.
- Opciones de despliegue: ONNX Runtime (medido), MNN mediante el wheel `xiaomi-lens-mnn` (fp16 e int8, medidos), y reconversión a TensorRT o Core ML a partir de los grafos. No hay soporte GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Latencia: 0,324 s/token en ONNX Runtime CPU, 0,211 s/token en MNN fp16 y 0,191 s/token en MNN int8; la etapa de máscara tarda 0,15 s en ORT.

## Comparativa con modelos similares

No se dispone de datos de modelos de terceros comparables en la información proporcionada. La comparación posible es entre las distintas variantes de ejecución del mismo modelo:

| Variante | Parametros | Contexto | Licencia | Formato | Total extremo a extremo | Decode por token |
|---|---|---|---|---|---|---|
| Xiaomi-Lens-0 (torch fp32, HF) | 4,6 B | No disponible | Apache 2.0 | PyTorch | 625,9 s | 18,75 s |
| Xiaomi-Lens-0-onnx (este repo) | 4,6 B | No disponible | Apache 2.0 | ONNX fp32/fp16 | 96,4 s | 0,324 s |
| Xiaomi-Lens-0-MNN-fp16 | 4,6 B | No disponible | Apache 2.0 | MNN fp16 | 79,5 s | 0,211 s |
| Xiaomi-Lens-0-MNN-int8 | 4,6 B | No disponible | Apache 2.0 | MNN int8 | 73,0 s | 0,191 s |

Todas las cifras corresponden a CPU Apple M5 Pro con el mismo caso de prueba (586×394, 255 tokens de prompt, 32 tokens generados).

## Limitaciones y advertencias

- El repositorio no es un paquete ejecutable de extremo a extremo: el autor lo describe como material para inspección, reconversión o ejecución con otro runtime, y recomienda el wheel de MNN para uso directo.
- El decodificador se distribuye en fp32 y en 339 ficheros de datos externos; mover o renombrar cualquiera de ellos rompe la carga del grafo.
- El prefill es secuencial (255 pasos en el caso medido) y tarda 84,46 s en ONNX Runtime CPU, lo que penaliza prompts largos.
- La máscara está limitada a un lienzo fijo de 24×36 y una salida de 384×576 con 32 ranuras; imágenes de otras proporciones se reescalan y ajustan a ese lienzo.
- No hay cifras publicadas de sesgos, tasa de alucinación en grounding ni robustez multilingüe; los idiomas soportados no están declarados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- La sección de verificación numérica frente a torch está truncada en la información disponible; solo se confirman los IoU de 1,0000 (fp16) y 0,9970 (int8) del ejemplo.
- La licencia declarada es Apache 2.0 tanto en el repo como en el modelo base, lo que en principio permite uso comercial con atribución; conviene verificar los términos del modelo base SeerRay-Lab/Xiaomi-Lens-0 antes de desplegar.
- No se documentan capacidades de tool calling ni de agentes, por lo que no deberían asumirse en un diseño de producción.
- Al ser una exportación de un modelo de 4,6 B sin cuantización ONNX oficial, el consumo de memoria en fp32 (~16-17 GB) limita su uso a equipos con RAM o VRAM abundante.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-onnx
- Modelo base: https://huggingface.co/SeerRay-Lab/Xiaomi-Lens-0
- Conversion MNN fp16: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-fp16
- Conversion MNN int8: https://huggingface.co/yunfengwang/Xiaomi-Lens-0-MNN-int8
- Paquete PyPI: https://pypi.org/project/xiaomi-lens-mnn/
- Mirror en ModelScope: `yunfeng/Xiaomi-Lens-
