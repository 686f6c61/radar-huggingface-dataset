# vooxyou/deepfillv2-inpainting

## Resumen

DeepFill v2 Inpainting (Quantized ONNX) es una implementación del modelo generativo de inpainting de imágenes DeepFill v2, exportada a formato ONNX y cuantizada a INT8 para su ejecución en el navegador mediante ONNX Runtime Web con backend WASM. Lo publica el usuario `vooxyou` en Hugging Face bajo licencia Apache 2.0. El modelo resuelve el problema de rellenar regiones enmascaradas de una imagen de forma coherente con el contexto circundante, sin necesidad de servidor ni GPU dedicada.

La relevancia de esta ficha no reside en una arquitectura novedosa de lenguaje, sino en el empaquetado: un generador de inpainting de 2019 (Yu et al., ICCV 2019, "Free-Form Image Inpainting with Gated Convolution") reducido a ~24,6 MB mediante cuantización dinámica INT8 y preparado para inferencia 100 % cliente en WebAssembly. Esto permite funcionalidades de edición de imagen en aplicaciones web sin enviar datos a un backend, con un coste de memoria de 200-400 MB durante la inferencia.

No es un modelo de lenguaje: no tiene parámetros de contexto, ni tokenizador, ni capacidades de razonamiento, código o tool calling. La información disponible se limita a la model card del autor y a los metadatos de Hugging Face; no se publican resultados de benchmarks, número de parámetros ni detalles del dataset de entrenamiento original.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepFill v2 (red generativa de inpainting con gated convolutions) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 dynamic quantization |
| Idiomas soportados | no aplica (procesa imágenes, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`deepfillv2_quantized.onnx`, ~24,6 MB) |

Especificaciones adicionales de entrada/salida:

| Nombre | Shape | Tipo | Descripción |
|---|---|---|---|
| `image` | `[1, 3, H, W]` | `float32` | Imagen RGB normalizada a [0, 1] |
| `mask` | `[1, 1, H, W]` | `float32` | Máscara binaria (1 = región a rellenar) |
| `output` | `[1, 3, H, W]` | `float32` | Imagen RGB con la región rellenada |

| Parametro | Valor |
|---|---|
| Resolución de entrada | Máximo 1080 px (redimensionado automático, padding a múltiplo de 8) |
| Tamaño del modelo | ~24,6 MB |
| Memoria en inferencia | ~200-400 MB |
| Framework de exportación | PyTorch → ONNX |
| Runtime objetivo | ONNX Runtime Web (WASM) |

## Arquitectura y entrenamiento

DeepFill v2 es una red generativa adversarial (GAN) para inpainting de forma libre, presentada por Yu et al. en ICCV 2019 con el título "Free-Form Image Inpainting with Gated Convolution". Su innovación principal son las gated convolutions, que aprenden una máscara de compuerta por capa para propagar la información del contexto válido hacia las regiones enmascaradas, y un discriminador tipo SN-PatchGAN que evalúa parches a múltiples escalas. La arquitectura original consta de un generador codificador-decodificador con skip connections y gated convolutions, y un discriminador PatchGAN con normalización espectral.

La model card de esta ficha no aporta datos sobre el dataset de entrenamiento original (número de imágenes, composición, resolución), ni sobre procesos de RLHF/DPO (no aplicables a un modelo de visión de este tipo). Tampoco se documenta el procedimiento exacto de exportación a ONNX ni el calibrado de la cuantización dinámica INT8. Lo único verificable es que el resultado es un grafo ONNX de ~24,6 MB que acepta tensores float32 y produce salida float32, con padding a múltiplo de 8 para compatibilidad con las operaciones de downsampling del generador.

## Capacidades

- Inpainting de imágenes: rellena regiones marcadas por una máscara binaria con contenido coherente con el contexto circundante.
- Inpainting de forma libre: la máscara puede tener formas arbitrarias (no solo rectángulos), gracias al diseño de gated convolutions del DeepFill v2 original.
- Procesamiento en navegador: inferencia 100 % cliente mediante ONNX Runtime Web con backend WASM, sin backend servidor.
- Entrada RGB normalizada a [0, 1] en formato CHW, con redimensionado automático a un máximo de 1080 px y padding a múltiplo de 8.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, modo thinking, visión general (más allá del inpainting), audio ni capacidades multilingües.
- No es un modelo de lenguaje: no genera texto, código ni matemáticas.

## Casos de uso

- Edición de fotos en aplicaciones web: el usuario pinta una máscara sobre un objeto no deseado y el modelo rellena la región en el propio navegador, sin subir la imagen a un servidor. Adecuado por su tamaño de ~24,6 MB y su inferencia WASM de 2-5 s en escritorio.
- Eliminación de marcas de agua o logotipos en imágenes de usuario: la máscara binaria permite seleccionar la zona y el modelo reconstruye el fondo. La licencia Apache 2.0 facilita su integración comercial.
- Restauración de fotografías antiguas con arañazos o manchas: se enmascaran las zonas dañadas y el modelo rellena con textura coherente al contexto.
- Herramientas de retoque en tiempo real en el navegador para SaaS de diseño: al ejecutarse con ONNX Runtime Web y WASM, no requiere infraestructura GPU y reduce costes operativos.
- Prototipado rápido de pipelines de inpainting: sirve como baseline cuantizado para comparar con modelos más pesados antes de invertir en despliegue servidor.
- Aplicaciones de privacidad: al no enviar la imagen fuera del dispositivo, encaja en flujos donde los datos no pueden salir del cliente (por ejemplo, edición de documentos o imágenes médicas no críticas).
- Integración en extensiones de navegador o PWA: el modelo cabe en la caché del navegador y funciona offline tras la primera carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son de latencia y memoria, no de calidad de inpainting (PSNR, SSIM, FID):

| Escenario | Latencia | Memoria |
|---|---|---|
| WASM (Chrome, escritorio moderno) | ~2-5 s | ~200-400 MB |
| WASM (móvil) | ~5-15 s según dispositivo | ~200-400 MB |

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU mediante WASM, con un consumo de memoria RAM de ~200-400 MB durante la ejecución.
- GPU recomendadas: no aplica en el runtime objetivo (ONNX Runtime Web/WASM). No se documenta un path GPU (WebGPU/WebGL) en la información disponible.
- Cabe en cualquier equipo consumer: escritorio, portátil o móvil, siempre que el navegador soporte WebAssembly y disponga de ~400 MB de RAM libre.
- Opciones de despliegue: ONNX Runtime Web con `executionProviders: ['wasm']` y `graphOptimizationLevel: 'all'`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: ~2-5 s por imagen en escritorio y ~5-15 s en móvil, según el autor. No se publica throughput por lote.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de parámetros para comparar cuantitativamente con alternativas. Comparativa cualitativa con otras opciones de inpainting:

| Modelo | Enfoque | Tamaño | Ejecución en navegador | Licencia |
|---|---|---|---|---|
| DeepFill v2 (esta ficha) | GAN con gated convolutions, ONNX INT8 | ~24,6 MB | Sí (ONNX Runtime Web/WASM) | Apache 2.0 |
| LaMa (Samsung AI) | Transformer con Fourier convolutions | no disponible en esta ficha | No documentado aquí | Apache 2.0 (según su repo original) |
| Stable Diffusion Inpainting | Modelo de difusión | varios GB | No práctico en WASM | CreativeML OpenRAIL-M |
| MAT (Mask-Aware Transformer) | Transformer para inpainting | no disponible en esta ficha | No documentado aquí | no disponible |

La ventaja diferencial de esta ficha frente a LaMa, MAT o la difusión es el tamaño (~24,6 MB) y la ejecución íntegra en navegador; su desventaja esperable es la calidad frente a modelos más grandes y modernos, extremo que no puede confirmarse sin benchmarks publicados.

## Limitaciones y advertencias

- No se publican métricas de calidad (PSNR, SSIM, FID) ni comparativas con el DeepFill v2 original en FP32; se desconoce la pérdida de calidad introducida por la cuantización INT8 dinámica.
- La cuantización dinámica INT8 puede degradar la fidelidad de texturas finas y bordes en las regiones rellenadas.
- Resolución máxima de 1080 px con redimensionado y padding a múltiplo de 8; imágenes mayores se reducen, lo que puede perder detalle.
- Latencia de 5-15 s en móvil, poco adecuada para edición interactiva en tiempo real en dispositivos de gama baja.
- Consumo de 200-400 MB de RAM durante la inferencia, relevante en navegadores móviles con pestañas múltiples.
- Es un modelo de 2019: no incorpora avances posteriores en inpainting (transformers, difusión) y puede producir artefactos en máscaras muy grandes o estructuras complejas.
- Riesgo de resultados incoherentes en regiones enmascaradas que cubren caras, texto o geometrías rígidas.
- No hay información sobre sesgos del dataset de entrenamiento original; podría reproducir sesgos de representación de las imágenes de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar la procedencia de los pesos originales de DeepFill v2 y las condiciones del dataset de entrenamiento original antes de un despliegue en producción.
- Repositorio con 18 descargas y 0 likes: sin validación comunitaria ni mantenimiento documentado; el autor no publica issues, demos ni tests.
- El tamaño del repo figura como 0.0 GB en los metadatos, lo que puede indicar que los pesos no están subidos o que el conteo no se ha actualizado; conviene verificar la presencia real de `deepfillv2_quantized.onnx` antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/vooxyou/deepfillv2-inpainting
- Paper original (Yu et al., "Free-Form Image Inpainting with Gated Convolution", ICCV 2019): https://arxiv.org/abs/1806.03589
- Repositorio oficial de DeepFill v2: https://github.com/JiahuiYu/generative_inpainting
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
