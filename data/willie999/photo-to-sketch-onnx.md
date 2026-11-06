# Willie999/photo-to-sketch-onnx

## Resumen

Photo-to-Sketch U-Net (ONNX) es un modelo de vision por computador especializado en la conversion de fotografias en dibujos lineales artisticos. Lo desarrolla el usuario Willie999 y se distribuye como exportacion ONNX del modelo original `Willie999/photo-to-sketch-unet`. No es un modelo de lenguaje: es una red U-Net de image-to-image con entrada RGB fija de 256x256 y salida en escala de grises de la misma resolucion.

El modelo resuelve una tarea concreta de transformacion de dominio: dado un retrato o fotografia, genera un sketch de lineas limpias apto para ilustracion, filtros artisticos o preprocesado de pipelines creativos. Su relevancia practica reside en el formato de despliegue: al estar exportado a ONNX con opset 17 y eje de batch dinamico, puede ejecutarse en CPU o GPU mediante `onnxruntime` sin dependencias de PyTorch, lo que simplifica su integracion en servicios ligeros.

El repositorio ocupa aproximadamente 0,1 GB y se publica bajo licencia MIT, lo que permite uso comercial sin restricciones de atribucion mas alla de las habituales de dicha licencia. La model card es escueta: no documenta el dataset de entrenamiento, el numero de parametros ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (image-to-image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta de idioma del repo; la tarea es independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 17) |
| Entrada | tensor `[Batch, 3, 256, 256]`, RGB normalizado a `[0, 1]` |
| Salida | tensor `[Batch, 1, 256, 256]`, escala de grises con valores sigmoid en `[0, 1]` |
| Ejes dinamicos | batch size |
| Tamano del repositorio | ~0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es una U-Net, es decir, una red convolucional encoder-decoder con conexiones de salto (skip connections) entre niveles de resolucion equivalentes. Este diseno es el habitual en tareas de traduccion imagen-a-imagen donde se requiere preservar estructura espacial fina, como es el caso de la conversion a line-art. El modelo original del que deriva esta exportacion es `Willie999/photo-to-sketch-unet`; la version publicada aqui es unicamente el grafo ONNX optimizado.

La informacion disponible no detalla el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de aumento de datos, perdidas adversarias o post-procesado. Tampoco se documenta el proceso de exportacion a ONNX mas alla del opset utilizado (17). La salida se produce tras una activacion sigmoid, lo que implica que los valores de pixel son confianzas continuas en `[0, 1]` y deben reescalarse a 8 bits para su visualizacion o guardado.

## Capacidades

- Transformacion de fotografias a dibujos lineales en escala de grises.
- Procesamiento por lotes gracias al eje de batch dinamico.
- Inferencia en CPU mediante `onnxruntime` con `CPUExecutionProvider`, sin necesidad de GPU.
- Entrada RGB normalizada a rango `[0, 1]` y salida sigmoid en el mismo rango.
- Resolucion fija de trabajo de 256x256 (requiere redimensionado previo de la imagen).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No es multilingue en sentido estricto: la tarea no depende del idioma.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales.

## Casos de uso

- Filtro artistico en aplicaciones moviles o web: el modelo puede ejecutarse en CPU con `onnxruntime` y un grafo de unos 0,1 GB, lo que permite ofrecer un efecto "sketch" en tiempo casi interactivo sin backend GPU.
- Preprocesado para pipelines de ilustracion: convertir fotografias de referencia en line-art antes de aplicar colorizacion automatica o estilizado posterior.
- Generacion de avatares y retratos estilizados: a partir de una foto de usuario de 256x256 se obtiene un dibujo lineal listo para superponer sobre fondos o plantillas.
- Prototipado rapido de modelos de image-to-image: sirve como baseline ONNX para comparar arquitecturas U-Net en tareas de traduccion de dominio.
- Automatizacion de contenido editorial: generar bocetos de apoyo para articulos, manuales o material didactico a partir de fotografias de producto.
- Integracion en servicios serverless: al no requerir PyTorch ni GPU, encaja en funciones ligeras con limites estrictos de memoria y tiempo de arranque.
- Educacion y demos de vision por computador: ejemplo minimo de inferencia ONNX con entrada y salida bien definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repositorio (~0,1 GB) el modelo cabe holgadamente en cualquier GPU consumer, pero no se documenta el consumo real.
- GPU recomendadas: no disponibles; el modelo esta pensado para ejecucion en CPU mediante `onnxruntime`.
- Compatibilidad con GPU consumer: previsiblemente si (RTX 3060, RTX 4090, etc.) usando `CUDAExecutionProvider`, aunque no esta verificado en la model card.
- Despliegue: `onnxruntime` (CPU o CUDA), integrable en servicios Python, contenedores ligeros y funciones serverless. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Dependen del hardware, del proveedor de ejecucion y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Willie999/photo-to-sketch-onnx | U-Net image-to-image | 256x256 RGB | 256x256 gris | MIT | ONNX | Exportacion ONNX, batch dinamico |
| Willie999/photo-to-sketch-unet | U-Net image-to-image | 256x256 RGB | 256x256 gris | no disponible en la informacion | pesos originales (probablemente PyTorch) | Modelo del que deriva la version ONNX |
| Alternativas genericas de style transfer (p. ej. AnimeGAN, White-box Cartoonization) | GAN / redes convolutionales | resolucion variable | imagen estilizada | variable | PyTorch/ONNX | No comparables directamente en calidad ni metricas sin datos publicados |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La resolucion esta fijada a 256x256: imagenes de mayor tamano deben redimensionarse, lo que puede degradar el detalle fino.
- La salida es en escala de grises; no genera color ni line-art coloreado.
- No se documenta el dataset de entrenamiento, por lo que se desconocen sesgos demograficos o de estilo (por ejemplo, sesgo hacia retratos o hacia cierto tipo de iluminacion).
- Riesgo de artefactos y alucinacion de lineas en zonas de bajo contraste o texturas complejas, habitual en modelos U-Net de este tipo.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026: no hay evidencia de uso en produccion ni validacion externa.
- No se especifican metricas de calidad (FID, SSIM, LPIPS) ni comparaciones con el modelo original en PyTorch.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre el modelo ni sobre los derechos de las imagenes de entrenamiento (no documentados).
- El etiquetado de idioma "en" es irrelevante para la tarea, pero conviene no interpretarlo como soporte multilingue de ningun tipo.
- Para produccion, conviene validar el modelo con un conjunto propio de imagenes antes de integrarlo, dado que no hay benchmarks publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Willie999/photo-to-sketch-onnx
- Modelo original (referenciado en la model card): https://huggingface.co/Willie999/photo-to-sketch-unet
- Documentacion de ONNX Runtime: https://onnxruntime.ai/
- Especificacion ONNX (opset 17): https://onnx.ai/onnx/
