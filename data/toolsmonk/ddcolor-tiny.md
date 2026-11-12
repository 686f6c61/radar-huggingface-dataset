# toolsmonk/ddcolor-tiny

## Resumen

DDColor-tiny (ONNX 512x512, int8) es una exportación a ONNX del modelo de colorización automática DDColor en su variante "paper-tiny", publicada por el usuario toolsmonk. El modelo original procede de piddnad/DDColor (Kang et al., ICCV 2023) y está diseñado para transformar imágenes en escala de grises en imágenes con color plausible, prediciendo los planos cromáticos a y b del espacio CIELAB a partir de la luminancia L. Esta versión concreta está pensada para ejecutarse íntegramente en el navegador mediante onnxruntime-web, y alimenta el filtro neural "Colorize" del editor fotográfico ToolsMonk Photo Editor.

La relevancia de esta ficha radica en que se trata de un artefacto de despliegue más que de un modelo nuevo: no aporta arquitectura ni entrenamiento propios, sino una conversión optimizada de un modelo de investigación a un formato ligero (107,5 MiB frente a 257,7 MiB del export fp32) con cuantización dinámica uint8 en las operaciones MatMul y Gemm. Es útil para desarrolladores que necesiten colorización local, sin servidor y con requisitos de privacidad estrictos, ya que la inferencia ocurre en el dispositivo del usuario.

El repositorio tiene un tamaño de 0,1 GB, licencia Apache-2.0 y un único archivo de pesos ONNX. No dispone de descargas ni valoraciones en el momento de la consulta, y no se han publicado métricas de calidad perceptual ni benchmarks comparativos en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-T (encoder) + MultiScaleColorDecoder (decoder tipo transformer con 100 queries y 9 capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada fija de 512x512 píxeles) |
| Tipos de cuantizacion | int8 (uint8 dinámica en nodos MatMul y Gemm); export base fp32 |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, forma de entrada fija [1, 3, 512, 512]) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DDColor original en configuración "tiny": un encoder ConvNeXt-T que extrae características visuales y un MultiScaleColorDecoder que, mediante atención con 100 queries sobre 3 escalas y 9 capas de decoder, predice los canales cromáticos a y b. La entrada es una imagen RGB float32 de 512x512 normalizada en el rango 0..1, construida a partir de la luminancia L de la imagen original en CIELAB (con a = b = 0); la salida son dos planos float32 de 512x512 que representan a y b. La imagen final se reconstruye remuestreando esos planos al tamaño original y combinándolos con la L de la foto de entrada, de modo que el detalle y el brillo provienen siempre de la imagen original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o imágenes, ni sobre el uso de RLHF, DPO u otras técnicas de alineación en la información proporcionada; esos detalles corresponden al paper original de DDColor (ICCV 2023), no incluido aquí. La innovación técnica de esta publicación es puramente de despliegue: exportación con torch.onnx.export (opset 17), forma de entrada fija y cuantización dinámica uint8 de las matrices de MatMul y Gemm mediante onnxruntime.quantization.quantize_dynamic, que reduce el tamaño de 257,7 MiB a 107,5 MiB con una diferencia absoluta media de aproximadamente 1,1 unidades ab frente al export fp32 en una imagen de prueba.

## Capacidades

- Colorización automática de imágenes en escala de grises a partir de la luminancia, prediciendo los planos cromáticos CIELAB a y b.
- Procesamiento de imagen a imagen con resolución fija de 512x512 píxeles de entrada.
- Inferencia en navegador mediante onnxruntime-web, sin necesidad de backend ni GPU dedicada.
- Ejecución local en el dispositivo del usuario, lo que preserva la privacidad de las imágenes procesadas.
- No soporta generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la colorización.
- No se documentan capacidades de control fino del color resultante (paletas, prompts o estilos).

## Casos de uso

- Editor fotográfico en navegador: integración directa como filtro "Colorize" en una aplicación web, ejecutando la inferencia con onnxruntime-web en el cliente y evitando subir imágenes a un servidor.
- Restauración de fotografías históricas: colorización de archivos en blanco y negro escaneados, con la ventaja de que el detalle y el brillo se conservan de la imagen original al reutilizar su canal L.
- Aplicaciones de privacidad estricta: procesamiento de imágenes médicas, personales o corporativas que no pueden salir del dispositivo, gracias a la ejecución 100 % local.
- Herramientas de previsualización rápida: generación de una propuesta de color de bajo coste (107,5 MiB de pesos, cuantización int8) antes de aplicar un pipeline de restauración más pesado.
- Prototipado y demos educativas: ejemplo ligero de un modelo de colorización basado en transformer para talleres, cuadernos o documentación técnica sobre despliegue ONNX.
- Aplicaciones móviles o de escritorio multiplataforma: uso del mismo archivo ONNX en runtimes compatibles (onnxruntime-web, onnxruntime nativo) sin depender de PyTorch.
- Automatización por lotes de archivos fotográficos: colorización previa de colecciones en blanco y negro para catalogación o revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada por el autor es la diferencia absoluta media de aproximadamente 1,1 unidades ab entre esta versión int8 y el export fp32 sobre una imagen de prueba, que mide la fidelidad de la cuantización, no la calidad de la colorización frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el archivo de pesos ocupa 112.723.138 bytes (unos 107,5 MiB), por lo que la huella de memoria es moderada y apta para entornos con recursos limitados.
- GPU recomendadas: no se especifican; al estar orientado a onnxruntime-web, el caso principal es ejecución en CPU o WebGPU/WebGL del navegador.
- Compatibilidad con GPU de consumo: previsiblemente sí en cualquier GPU de consumo moderna, dado el reducido tamaño del modelo, aunque no se aportan requisitos oficiales.
- Opciones de despliegue: onnxruntime-web (caso de uso principal), onnxruntime nativo (CPU, CUDA, DirectML), y cualquier runtime compatible con ONNX opset 17.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| toolsmonk/ddcolor-tiny (esta ficha) | no disponible | 512x512 píxeles | ONNX int8 | Apache-2.0 | Export cuantizado para navegador |
| piddnad/ddcolor_paper_tiny | no disponible | 512x512 píxeles | PyTorch (weights) | Apache-2.0 | Modelo base original, sin cuantizar |
| piddnad/DDColor (resto de variantes) | no disponible | 512x512 píxeles | PyTorch (weights) | Apache-2.0 | Variantes de mayor tamaño del mismo paper |
| Otros modelos de colorización (p. ej. DeOldify, Zhang et al.) | no disponible | variable | PyTorch | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo puede producir colorizaciones plausibles pero no fieles a la realidad: no existe información de color real en una imagen en blanco y negro, por lo que los colores son una predicción estadística.
- Riesgo de artefactos cromáticos en regiones ambiguas, rostros, cielos o texturas finas; la cuantización int8 introduce además una desviación media de aproximadamente 1,1 unidades ab frente al modelo fp32.
- La entrada está fijada a 512x512 píxeles, lo que puede degradar el detalle en imágenes de alta resolución si no se aplica un pipeline de parcheo o remuestreo adecuado.
- No se documentan sesgos demográficos, culturales o de otro tipo; al ser un modelo entrenado con datos no especificados, es previsible que herede sesgos del dataset original de DDColor.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y atribución correspondientes; conviene revisar también la licencia del modelo base y del código original.
- No apto para tareas distintas de la colorización: no procesa texto, no responde a instrucciones y no soporta tool calling ni agentes.
- El repositorio no presenta descargas ni validación comunitaria en el momento de la consulta, por lo que conviene verificar el hash SHA-256 del archivo antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toolsmonk/ddcolor-tiny
- Modelo base en Hugging Face: https://huggingface.co/piddnad/ddcolor_paper_tiny
- Repositorio oficial de DDColor: https://github.com/piddnad/DDColor
- Paper: Kang et al., "DDColor: Towards Photo-Realistic Image Colorization via Dual Decoders", ICCV 2023 (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Editor ToolsMonk Photo Editor: no disponible URL directa en la información proporcionada
