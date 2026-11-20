# square-zero-labs/MI-GAN-512-Places2-LiteRT

## Resumen

MI-GAN-512-Places2-LiteRT es la conversión a LiteRT (el runtime de Google para inferencia en dispositivo, sucesor de TFLite) del generador de inferencia de MI-GAN, un modelo de inpainting de imágenes desarrollado por Picsart AI Research y presentado en ICCV 2023. El modelo original está diseñado como un "borrador mágico" móvil: el usuario pinta una máscara sobre un objeto y el modelo rellena la región eliminada con contenido sintetizado coherente. Esta versión empaqueta el generador en un fichero `.tflite` en fp16 de 16,3 MB que se ejecuta íntegramente en la GPU del dispositivo mediante `CompiledModel` (ML Drift) en Android.

La relevancia de esta conversión es su carácter demostrativo de viabilidad técnica: los 509 nodos del grafo se ejecutan en GPU sin particionado (residencia completa), con una correlación de 0,99998 frente a la implementación de referencia en PyTorch y sin valores NaN. La conversión se realizó con `litert-torch` en un solo paso, sin reescritura manual del modelo, lo que la convierte en una referencia útil para quien necesite portar generadores estilo StyleGAN a entornos móviles.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño reportado es de 0,0 GB (los pesos fp16 de 16,3 MB no se reflejan en esa métrica) y no se proporciona información sobre idiomas, datos de entrenamiento ni benchmarks de calidad de inpainting. Se trata, por tanto, de un artefacto de despliegue, no de un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador GAN convolucional con convoluciones depthwise-separables, upsample nearest + convolución agrupada con filtro FIR fijo, LeakyReLU con ganancia y clamp; sin capas de normalización (estilo StyleGAN) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada fija 512×512) |
| Tipos de cuantización | fp16 (fichero publicado de 16,3 MB); no se documentan otras variantes |
| Idiomas soportados | no disponible (no aplica; modelo de imagen) |
| Licencia | MIT |
| Formato de pesos | `.tflite` (LiteRT); modelo base en PyTorch |
| Entrada | `[1, 4, 512, 512]` = concat(mask − 0.5, rgb · mask); rgb en [−1, 1]; máscara 1 = conservar, 0 = borrar |
| Salida | `[1, 3, 512, 512]` en [−1, 1]; composición final `rgb·mask + out·(1−mask)` |
| Preprocesado | Recorte central y redimensionado a 512×512; normalización `pixel/127.5 − 1` |
| Modelo base | Picsart-AI-Research/MI-GAN (relación: quantized) |
| Runtime | LiteRT 2.2.0 (`CompiledModel`), aceleradores GPU (ML Drift), NPU (QNN/HTP) y CPU (XNNPACK) |

## Arquitectura y entrenamiento

El modelo es el generador de inferencia de MI-GAN, la variante re-parametrizada para móvil descrita en el paper de ICCV 2023. Su diseño está optimizado para GPUs móviles: emplea convoluciones depthwise-separables en lugar de convoluciones densas, sustituye las convoluciones transpuestas por `nn.Upsample(nearest)` seguido de una convolución agrupada con filtro FIR fijo, y elimina por completo las capas de normalización, siguiendo el esquema de StyleGAN. Las LeakyReLU con ganancia y clamp se traducen a operaciones `MAXIMUM`/`MINIMUM` en el grafo. Esta elección de operadores hace que la conversión a LiteRT no requiera reescritura: no hay operadores prohibidos, todos los tensores son de dimensión ≤ 4 y la correlación tflite-vs-torch es 1,0.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset (más allá de que la variante publicada se entrena sobre Places2) ni sobre el uso de RLHF o DPO, que no aplican a un modelo generativo de imagen de este tipo. El autor de la conversión no documenta procesos de ajuste fino adicionales: el artefacto es una cuantización y exportación del modelo base, no un reentrenamiento.

## Capacidades

- Inpainting de imágenes a 512×512: rellena regiones enmascaradas con contenido sintetizado coherente con el contexto circundante.
- Eliminación de objetos ("magic eraser"): el usuario pinta la máscara sobre el objeto y el modelo reconstruye el fondo.
- Ejecución íntegra en GPU del dispositivo: 509 de 509 nodos en GPU con `CompiledModel` (LITERT_CL), sin caídas a CPU.
- Inferencia de baja latencia: ~6 ms por imagen de 512×512 en Pixel 8a (Tensor G3); 26,6 ms p50 en Galaxy S26 con GPU Adreno; 30,9 ms p50 con NPU Hexagon.
- Compatibilidad con múltiples backends: GPU (ML Drift), NPU (QNN/HTP, compilación JIT en dispositivo) y WebGPU en navegador (LiteRT.js).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente image-to-image.
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Eliminación de objetos en apps de retoque fotográfico para Android: el modelo se integra como `.tflite` de 16,3 MB y se ejecuta en la GPU del terminal con ~6 ms de latencia en Pixel 8a, lo que permite previsualización en tiempo real mientras el usuario pinta la máscara.
- Limpieza de marcas de agua o logotipos en flujos de preprocesado de datasets: al ser un modelo de 512×512 con inferencia de milisegundos, se puede aplicar por lotes sobre miles de imágenes en un servidor con GPU o en el propio dispositivo antes de subirlas.
- Edición no destructiva en aplicaciones de galería: la composición `rgb·mask + out·(1−mask)` permite mezclar la salida con la imagen original y ofrecer al usuario un control granular de la región regenerada.
- Funcionalidad offline en dispositivos sin conectividad: al ejecutarse localmente con LiteRT, no requiere enviar imágenes a un servidor, lo que resulta adecuado para apps con requisitos de privacidad estrictos.
- Prototipado de pipelines de inpainting en navegador: la ruta WebGPU con LiteRT.js (22,0 ms p50 en Chromium 151 sobre M4 Max) permite validar la funcionalidad sin compilar para Android.
- Evaluación de viabilidad de despliegue en hardware embebido: la ruta CPU con XNNPACK en Raspberry Pi 5 (1788 ms p50, 4 hilos) sirve como cota inferior para decidir si el caso de uso tolera latencias de segundos en dispositivos sin acelerador.
- Referencia para portar generadores StyleGAN a LiteRT: el repositorio documenta el proceso de conversión con `litert-torch` y las verificaciones de correlación, útil como plantilla para otros modelos con arquitectura similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de inpainting (FID, LPIPS, PSNR) en la información disponible. Los únicos datos publicados son métricas de latencia y fidelidad numérica del despliegue:

| Plataforma | Runtime / backend | Latencia | Notas |
|---|---|---|---|
| Pixel 8a (Tensor G3) | LiteRT `CompiledModel` (LITERT_CL), GPU | ~6 ms | 509/509 nodos en GPU; correlación device-vs-PyTorch 0,99998 |
| Pixel 8a (Tensor G3) | TFLite `benchmark_model` (`TfLiteGpuDelegateV2`), GPU OpenCL | 68,1 ms | Cota reproducible con herramienta estándar; 509/509 en GPU |
| Pixel 8a (Tensor G3) | TFLite `benchmark_model`, CPU XNNPACK 4 hilos | no disponible | XNNPACK rechaza el grafo (`failed to delegate DEPTHWISE_CONV_2D`) |
| Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81) | LiteRT 2.2.0, NPU (QNN/HTP) | 30,85 ms mediana / 30,17 ms mínimo | Carga 168 ms; compilación JIT en dispositivo; estado térmico NONE |
| Galaxy S26 (Snapdragon 8 Elite Gen 5, Adreno) | LiteRT 2.2.0, GPU | 26,64 ms mediana / 24,54 ms mínimo | Carga 1231 ms; GPU 1,16× más rápida que NPU |
| Raspberry Pi 5 | LiteRT 2.2.0.dev20260804, CPU XNNPACK 4 hilos | 1788 ms p50 | — |
| Navegador (Chromium 151, M4 Max) | LiteRT.js 2.5.3, WebGPU | 22,0 ms p50 | La salida difiere de CPU (diferencia relativa máxima 0,7) |

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio modelo base (Picsart-AI-Research/MI-GAN) es la referencia directa, pero no se aportan métricas de calidad que permitan una comparación cuantitativa con alternativas de inpainting.

| Modelo | Parámetros | Contexto / resolución | Licencia | Formato de despliegue | Notas |
|---|---|---|---|---|---|
| MI-GAN-512-Places2-LiteRT | no disponible | 512×512 fijo | MIT | `.tflite` (fp16) | Conversión on-device; latencias documentadas arriba |
| Picsart-AI-Research/MI-GAN (base) | no disponible | 512×512 | no disponible en esta ficha | PyTorch | Modelo de referencia del que deriva esta conversión |
| Alternativas de inpainting | no disponible | no disponible | no disponible | no disponible | Sin datos en la información proporcionada |

## Limitaciones y advertencias

- Resolución fija de 512×512: el modelo no admite otras resoluciones sin reescalado previo, lo que puede degradar detalles en imágenes de origen grandes.
- Sin datos de calidad publicados: no se documentan FID, LPIPS ni comparaciones perceptuales, por lo que no es posible evaluar la fidelidad del inpainting frente al modelo base más allá de la correlación numérica 0,99998 (que mide fidelidad de la conversión, no calidad visual).
- XNNPACK no soporta el grafo en fp16: la ruta CPU falla al delegar `DEPTHWISE_CONV_2D` y no hay cifra de CPU utilizable en Android; desactivar XNNPACK cae a kernels de referencia, aproximadamente 20× más lentos que la GPU.
- Divergencia WebGPU: la salida en navegador difiere de la de CPU con una diferencia relativa máxima de 0,7, lo que puede producir artefactos distintos según la plataforma.
- Sin información sobre sesgos: al ser un modelo de imagen entrenado sobre Places2, puede heredar sesgos de composición y contexto del dataset, pero no se documentan análisis al respecto.
- Riesgo de alucinación visual: como todo modelo generativo, puede sintetizar contenido plausible pero inexistente en la región enmascarada; en contextos forenses o de documentación no es adecuado sin verificación humana.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda verificar la licencia del modelo base (Picsart-AI-Research/MI-GAN), que no se detalla en la información disponible.
- Artefacto de despliegue, no modelo nuevo: no se han realizado ajustes finos ni entrenamiento adicional; las capacidades son las del generador de inferencia de MI-GAN.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, sin garantías de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/square-zero-labs/MI-GAN-512-Places2-LiteRT
- Modelo base en Hugging Face: https://huggingface.co/Picsart-AI-Research/MI-GAN
- Repositorio del modelo base (GitHub): https://github.com/Picsart-AI-Research/MI-GAN
- Ficha de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/mi-gan-512-places2/CARD.md
- Documentación de medición de LiteRT: https://ai.google.dev/edge/litert/models/measurement
