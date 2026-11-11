# toolsmonk/lama-webgpu

## Resumen

LaMa WebGPU es una exportación ONNX del modelo LaMa (Large Mask Inpainting with Fourier Convolutions, Suvorov et al., WACV 2022) reescrita para ejecutarse en el proveedor de ejecución WebGPU de onnxruntime-web. El autor es toolsmonk, y el modelo se emplea en el borrador de objetos (AI eraser) de su editor de fotos y eliminador de fondos. No es un modelo de lenguaje ni un transformer generativo de texto: es una red de inpainting de imágenes, especializada en eliminar objetos y rellenar huecos de forma coherente.

La relevancia de esta ficha no está en el modelo base (LaMa es de 2022 y bien conocido), sino en el trabajo de conversión: los exports ONNX públicos de LaMa solo funcionan en el navegador sobre WASM, y fallan en WebGPU dentro de la unidad de Fourier. Esta versión aplica tres reescrituras de grafo numéricamente equivalentes para hacer viable la inferencia acelerada en el navegador, con una diferencia máxima de salida de 0,00026 sobre escala 0..255 y una reducción de latencia de ~30 s a ~1,7-2,2 s por imagen de 512x512.

El repositorio ocupa 0,2 GB, contiene un único grafo fp32 y se distribuye bajo licencia Apache-2.0, la misma del modelo original. No hay información sobre idiomas ni sobre parámetros del modelo en la model card; los datos de arquitectura que se recogen a continuación provienen del paper citado por el autor y de la propia descripción del grafo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LaMa: red de inpainting con convoluciones de Fourier (FFC), no transformer |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de imagen 512x512 |
| Tipos de cuantización | no disponible; el grafo publicado es fp32 |
| Idiomas soportados | no disponible (modelo de imagen, no de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafo único fp32) |

## Arquitectura y entrenamiento

LaMa es una red de inpainting basada en convoluciones de Fourier (Fast Fourier Convolutions), diseñada para ser robusta a máscaras grandes y a resoluciones variables. El paper original (Suvorov et al., WACV 2022) describe un generador con un campo receptivo efectivo amplio gracias a las FFC, entrenado con una combinación de pérdidas perceptuales y adversariales. La model card no detalla el dataset de entrenamiento, el número de tokens ni el proceso de alineación; esa información debe consultarse en el paper original.

La innovación de esta exportación concreta es puramente de ingeniería de grafo. Sobre el ONNX de origen (`lama_fp32.onnx` de Carve/LaMa-ONNX) se aplican tres transformaciones numéricamente equivalentes: (1) plegado de constantes con batch fijo de 1, de modo que las matrices DFT que el export construye en tiempo de ejecución pasan a ser constantes; (2) reescritura de los 216 nodos `Einsum` (`ij,jk->ik`) como `MatMul`; y (3) reescritura de los 72 nodos `Slice` con paso negativo como `Gather` con índices invertidos constantes. Los pesos no cambian; solo la estructura del grafo. El script de conversión (`build-lama-webgpu.py`) está incluido en el repositorio y requiere `onnx`, `onnxruntime` y `numpy`.

## Capacidades

- Inpainting de imágenes: rellena la región indicada por la máscara con contenido coherente con el resto de la imagen.
- Eliminación de objetos (object removal): dado un objeto marcado con máscara, lo sustituye por fondo plausible.
- Entrada y salida de resolución fija 512x512: `image` float32 `[1, 3, 512, 512]` en RGB 0..1, `mask` float32 `[1, 1, 512, 512]` (1 = rellenar, 0 = conservar), `output` float32 `[1, 3, 512, 512]` en RGB 0..255.
- Ejecución en navegador mediante onnxruntime-web con el proveedor WebGPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni modo de razonamiento (thinking mode); es un modelo puramente visual.

## Casos de uso

- Borrador de objetos en editores de fotos web: el modelo recibe la imagen y una máscara dibujada por el usuario y devuelve la región rellenada; es adecuado porque corre en el navegador con WebGPU a ~1,7-2,2 s por imagen de 512x512, sin enviar la foto a un servidor.
- Eliminación de fondos y elementos no deseados en herramientas de edición on-device: el caso de uso declarado por el autor en su editor de fotos y eliminador de fondos.
- Retoque rápido en aplicaciones web de e-commerce: eliminar productos o marcas de agua de fotos de catálogo antes de publicarlas, con procesamiento local que evita subir imágenes a la nube.
- Preprocesado de datasets de visión: limpiar regiones no deseadas de imágenes de entrenamiento o anotar pares imagen/máscara para tareas de segmentación.
- Herramientas de privacidad: tapar caras, matrículas o documentos sensibles en imágenes antes de compartirlas, con la ventaja de que el procesado no sale del dispositivo.
- Edición interactiva en aplicaciones de escritorio empaquetadas con WebGPU (Electron, Tauri) o en PWA: el grafo ONNX puede cargarse con onnxruntime-web y ejecutarse en la GPU del cliente.
- Prototipado de pipelines de inpainting: servir como referencia de exportación ONNX compatible con WebGPU para comparar latencias frente a alternativas WASM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PSNR, SSIM, FID) en la información disponible. La model card sí aporta dos datos medidos por el autor:

| Métrica | Valor |
|---|---|
| Diferencia máxima de salida frente al ONNX de origen (512x512, escala 0..255) | 0,00026 |
| Latencia por inpainting 512x512 en Chrome con WebGPU | ~1,7-2,2 s |
| Latencia por inpainting 512x512 en Chrome con WASM monohilo | ~30 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el grafo es fp32 y el repositorio pesa 0,2 GB, por lo que el footprint de pesos ronda esa cifra, más activaciones de la imagen 512x512.
- GPU recomendadas: no especificadas por el autor. El requisito funcional es un navegador con soporte de WebGPU (la model card cita Chrome) y onnxruntime-web 1.30.
- Cabe en GPU de consumidor: previsiblemente sí, dado el tamaño del grafo, aunque el autor no publica requisitos mínimos de VRAM.
- Opciones de despliegue: onnxruntime-web con proveedor WebGPU (caso soportado); onnxruntime-web con WASM (funciona pero ~30 s por imagen en monohilo según el autor); onnxruntime nativo u otros runtimes ONNX no están documentados en la model card.
- Latencia y throughput: ~1,7-2,2 s por imagen de 512x512 en WebGPU y ~30 s en WASM monohilo, medidos en Chrome por el autor. No hay datos de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución de entrada | Licencia | Ejecución en navegador | Notas |
|---|---|---|---|---|---|
| toolsmonk/lama-webgpu | LaMa ONNX reescrito | 512x512 fija | Apache-2.0 | WebGPU (soportado) y WASM | Objeto de esta ficha |
| Carve/LaMa-ONNX | LaMa ONNX de origen | 512x512 (según export) | Apache-2.0 | Solo WASM; falla en WebGPU según el autor | Fuente del grafo |
| advimman/lama (original) | LaMa en PyTorch | Variable | Apache-2.0 | No | Implementación de referencia del paper |

No se dispone de datos de benchmarks comparativos con otras alternativas de inpainting en la información proporcionada.

## Limitaciones y advertencias

- Resolución de entrada fija de 512x512: no admite imágenes de otras dimensiones sin reescalado previo.
- Es un modelo de imagen: no procesa texto, no tiene capacidades de razonamiento ni de agente, y no debe evaluarse como un LLM.
- Riesgo de resultados poco realistas en regiones grandes o con estructuras repetitivas; el paper original aborda la robustez a máscaras grandes, pero la model card no documenta métricas de calidad.
- Sesgos: no documentados en la model card; al ser un modelo visual, puede heredar sesgos de su dataset de entrenamiento original, no descrito aquí.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y del export intermedio (ambos Apache-2.0 según la model card).
- La ejecución WebGPU depende de la versión de onnxruntime-web (el autor cita 1.30) y del soporte del navegador; fuera de ese entorno el rendimiento cae drásticamente (WASM monohilo, ~30 s por imagen).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-11): no hay evidencia de uso en producción más allá de la aplicación del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toolsmonk/lama-webgpu
- ONNX de origen: https://huggingface.co/Carve/LaMa-ONNX
- Repositorio original de LaMa: https://github.com/advimman/lama
- Paper de LaMa (Suvorov et al., WACV 2022): referenciado en la model card, sin URL explícita en la información proporcionada.
