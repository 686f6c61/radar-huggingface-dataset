# warped-community/SD-Turbo-Mobile-INT8-litert

## Resumen

SD-Turbo-Mobile-INT8-LiteRT es una exportación cuantizada del modelo de difusión texto-a-imagen stabilityai/sd-turbo, publicada por el usuario warped-community. El modelo base es SD-Turbo de Stability AI, un modelo de difusión latente de tipo Stable Diffusion Turbo diseñado para generar imágenes 512x512 en un único paso de muestreo. En esta ficha se distribuye convertido al formato LiteRT (antes TensorFlow Lite) con cuantización INT8 dinámica por canal en los grafos del codificador de texto y de la UNet, y FP16 en el VAE, manteniendo los grafos del sampler en FP32.

El objetivo del artefacto es ejecutar generación texto-a-imagen en dispositivos Android de gama alta sin aceleración dedicada, empleando únicamente la CPU. El tamaño del repositorio se reduce de 5,03 GB (exportación FP32 de referencia) a 1,32 GB, con el grafo más grande de 99,3 MB y carga de un único grafo neuronal a la vez. Está pensado para la clase de teléfonos con 12-16 GB de RAM, en concreto la familia Pixel 10 Pro y Pixel 11 Pro con Tensor G5 y G6.

La relevancia del modelo radica en demostrar que un pipeline de difusión completo puede empaquetarse en un formato portable de LiteRT con cuantización agresiva y ejecutarse en CPU móvil, aunque con latencias del orden de decenas de segundos y sin soporte GPU funcional en los layouts de grafo publicados. No se han publicado resultados de benchmarks de calidad de imagen en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión latente (Stable Diffusion Turbo), exportada a LiteRT con grafos separados para codificador de texto, UNet, sampler y VAE |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, sin contexto de texto largo especificado) |
| Tipos de cuantización | INT8 dinámica por canal en codificador de texto y UNet; FP16 en pesos del VAE con activaciones float; grafos del sampler en FP32 |
| Idiomas soportados | no disponible |
| Licencia | stabilityai-community (Stability AI Community License) |
| Formato de pesos | LiteRT / TFLite (grafos sharded, manifest `word-image-litert-v1`) |

## Arquitectura y entrenamiento

El modelo base es SD-Turbo de Stability AI, un modelo de difusión latente derivado de Stable Diffusion 2.1 y destilado para generar imágenes en un único paso de muestreo. La exportación aquí publicada no altera la arquitectura ni el sampler: se limita a convertir el export FP32 de LiteRT mediante LiteRT CLI, fragmentando el pipeline en varios grafos (codificador de texto, UNet, sampler y VAE) que se cargan de uno en uno en memoria.

La cuantización aplicada es INT8 dinámica por canal sobre los pesos neuronales del codificador y la UNet, mientras que el VAE conserva pesos FP16 con activaciones en coma flotante y los grafos del sampler permanecen en FP32. El proceso de conversión incluye un parche documentado (`litert_quantize_conv.py`) que corrige un fallo de ai-edge-quantizer 0.10.0 en la ruta de chunking de convoluciones mayores de 32 MiB, verificando el resultado bit a bit contra aritmética INT8 por canal sin chunking. No se dispone de información sobre los datos de entrenamiento del modelo base en la documentación proporcionada, más allá de que se trata de un modelo destilado de Stable Diffusion.

## Capacidades

- Generación de imágenes texto-a-imagen a resolución 512x512 en un único paso de muestreo, heredada de SD-Turbo.
- Ejecución en CPU móvil Android mediante LiteRT 2.3.0 `CompiledModel`, con E/S `TensorBuffer` de tipo int64.
- Carga de un único grafo neuronal a la vez, lo que permite ajustar el pico de memoria a costa de latencia.
- Reutilización de buffers de entrada para salidas con `aliasOfInput` en el manifest, requisito para no corromper los tokens de entrada.
- Ejecución de escritorio vía `run_portable.py` con entorno Python 3.12 y dependencias incluidas en `requirements.txt`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo.
- No se documentan capacidades multilingües específicas; el prompt de texto se procesa con el codificador del modelo base.

## Casos de uso

- Generación de imágenes en apps Android de gama alta: integración del pipeline LiteRT en una aplicación nativa que cargue los grafos desde almacenamiento privado y genere imágenes 512x512 en CPU, adecuado para dispositivos con 12-16 GB de RAM como Pixel 10 Pro o Pixel 11 Pro.
- Prototipado de funciones creativas sin conexión: permitir a usuarios generar ilustraciones o avatares localmente sin enviar prompts a un servidor, aprovechando que todo el pipeline cabe en 1,32 GB de artefactos y se ejecuta en CPU.
- Validación de pipelines de cuantización para difusión: usar el repositorio como referencia auditable (`quantization.json`, `manifest.json`, `SHA256SUMS`) para reproducir la conversión INT8 de un modelo de difusión con LiteRT CLI.
- Pruebas de regresión de calidad de imagen: comparar salidas INT8 frente a FP32 con las mismas semillas y ruido gaussiano, usando los PSNR y correlaciones publicados en `validation/` como base para evaluar el impacto de la cuantización.
- Integración en demos de investigación sobre inferencia en dispositivo: medir pico de RSS y tiempos de generación en hardware Tensor G5/G6 para estudiar el compromiso entre memoria, latencia y calidad en modelos de difusión cuantizados.
- Distribución de artefactos portables en CI: emplear los manifests y checksums para empaquetar y verificar los grafos en pipelines de build de aplicaciones Android, asegurando que los ficheros runtime coinciden con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. Los únicos datos de rendimiento documentados son los siguientes:

| Métrica | Valor | Contexto |
|---|---|---|
| Tiempo de generación 512x512 | 26,92 s | Pixel 10 Pro Fold / Tensor G5, CPU, imagen "blue teapot" |
| Pico de RSS del proceso | 1,75 GiB | Pixel 10 Pro Fold / Tensor G5, CPU |
| Tamaño de artefactos runtime | 1,32 GB | Frente a 5,03 GB del export FP32 |
| Grafo más grande | 99,3 MB | Pipeline fragmentado en varios grafos |
| Generaciones de validación en escritorio | 3 | Prompts: apple, blue teapot, orange cat, comparadas con FP32 |

La validación en escritorio confirma que las tres generaciones son finitas, no uniformes y visualmente reconocibles, pero no idénticas píxel a píxel al FP32; se publican PSNR y correlación por prompt. El rendimiento en GPU no está disponible: los layouts GPU fallan la compilación en LiteRT 2.3 sobre Tensor G5.

## Requisitos de hardware

- RAM: el diseño apunta a teléfonos con 12-16 GB de RAM; el pico de RSS medido en CPU sobre Tensor G5 es de 1,75 GiB, pero el tamaño de descarga no equivale al pico de memoria (activaciones, dequantización, cachés del driver y el resto de Android consumen RAM adicional).
- GPU recomendadas: no aplica; los layouts GPU publicados fallan la compilación en LiteRT 2.3 sobre Tensor G5 y se requiere un export GPU compatible separado.
- ¿Cabe en GPU consumer? No se documenta soporte GPU funcional; el artefacto es un pipeline CPU portable.
- Despliegue: LiteRT 2.3.0 en Android con `CompiledModel` y `TensorBuffer` int64; en escritorio, `run_portable.py` con Python 3.12 y las dependencias de `requirements.txt`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: 26,92 s por imagen 512x512 en CPU sobre Tensor G5 (una muestra de smoke test); no se documenta throughput agregado ni latencia en otros dispositivos. Pixel 10 Pro y Pixel 11 Pro no han sido medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Turbo-Mobile-INT8-LiteRT (este) | no disponible | 512x512, 1 paso | LiteRT INT8/FP16 | Stability AI Community | Hugging Face (warped-community) |
| stabilityai/sd-turbo (FP32 LiteRT) | no disponible | 512x512, 1 paso | LiteRT FP32 (5,03 GB) | Stability AI Community | Hugging Face (Stability AI) |
| stabilityai/sd-turbo (original) | no disponible | 512x512, 1 paso | safetensors / diffusers | Stability AI Community | Hugging Face (Stability AI) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada; la comparación se limita a formato, tamaño de artefacto y licencia.

## Limitaciones y advertencias

- La cuantización INT8 puede alterar la composición y el detalle de las imágenes; las salidas no son idénticas píxel a píxel al FP32, como confirma la validación publicada.
- El soporte GPU no está operativo en los layouts publicados: falla la compilación en LiteRT 2.3 sobre Tensor G5 y requiere un export GPU compatible separado.
- El pipeline es CPU-only y está pensado para la clase de 12-16 GB de RAM; en dispositivos con menos memoria el pico de RSS puede ser problemático.
- El tamaño de descarga (1,32 GB) no equivale al pico de RAM; hay que considerar activaciones, dequantización y cachés del driver.
- Pixel 10 Pro y Pixel 11 Pro no han sido medidos directamente; los datos de rendimiento provienen de un Pixel 10 Pro Fold con Tensor G5.
- La licencia es la Stability AI Community License, que impone términos de uso y no permite relicenciar los pesos; el uso comercial está sujeto a dicha licencia.
- No se documentan idiomas soportados ni evaluación multilingüe del codificador de texto.
- Riesgo de sesgos y alucinaciones visuales heredado del modelo base SD-Turbo, no evaluado en esta publicación.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/warped-community/SD-Turbo-Mobile-INT8-litert
- Modelo base: https://huggingface.co/stabilityai/sd-turbo
- Licencia del modelo base: https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE.md
- Especificaciones Pixel 10 Pro: https://store.google.com/product/pixel_10_pro_specs
- Especificaciones Pixel 11 Pro: https://store.google.com/product/pixel_11_pro_specs
