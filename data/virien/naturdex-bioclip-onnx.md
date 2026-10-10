# Virien/naturdex-bioclip-onnx

## Resumen

Virien/naturdex-bioclip-onnx es una exportación a ONNX del encoder de imagen de BioCLIP (`imageomics/bioclip`), cuantizada a int8 para poder ejecutarse íntegramente en el navegador de un teléfono móvil mediante onnxruntime-web, sin conexión a red. No es un modelo de lenguaje ni un modelo multimodal completo: el repositorio contiene únicamente la mitad visual de BioCLIP, de modo que la clasificación de especies se resuelve comparando el embedding de la foto contra embeddings de texto calculados previamente en un portátil (clasificación zero-shot).

El archivo `bioclip-image-int8.onnx` ocupa unos 87 MB, acepta una entrada `pixels` de tipo `float32[1, 3, 224, 224]` y devuelve un embedding `float32[1, 512]` normalizado en L2. Se generó con cuantización dinámica int8 (`onnxruntime.quantization.quantize_dynamic`) y forma parte de NaturDex, una aplicación tipo "Pokémon Snap" de naturaleza pensada para salidas de campo escolares con teléfonos reciclados.

Su relevancia actual es doble: demuestra que un modelo fundacional de biología (BioCLIP, del Imageomics Institute, entrenado sobre TreeOfLife-10M y con cobertura de más de 450.000 taxones) puede reducirse a menos de 90 MB y ejecutarse en hardware de gama baja, y publica una evaluación honesta del coste de esa cuantización sobre un conjunto real de fotos de iNaturalist tomadas en España. Al derivarse de BioCLIP bajo licencia MIT, mantiene la misma licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (encoder de imagen de BioCLIP), exportado a ONNX |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (solo encoder de imagen; sin entrada de texto) |
| Tipos de cuantizacion | int8 dinámica (`onnxruntime.quantization.quantize_dynamic`); se compara contra la versión fp32 de referencia |
| Idiomas soportados | no disponible (el archivo no procesa texto; los embeddings de las especies se calculan aparte) |
| Licencia | MIT |
| Formato de pesos | ONNX (`.onnx`) |
| Tamano del archivo | ~87 MB (`bioclip-image-int8.onnx`) |
| Entrada | `pixels`, `float32[1, 3, 224, 224]`, redimensionado, recorte central y normalización con media/std de CLIP |
| Salida | `embedding`, `float32[1, 512]`, normalizado en L2 |
| Modelo base | `imageomics/bioclip` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El archivo es una exportación de inferencia, no un modelo entrenado desde cero. La arquitectura subyacente es la de BioCLIP, un modelo de visión-lenguaje basado en CLIP presentado en el artículo "BioCLIP: A Vision Foundation Model for the Tree of Life" (CVPR 2024) por el Imageomics Institute. BioCLIP se entrenó sobre el conjunto TreeOfLife-10M, cubre más de 450.000 taxones y aprende una representación jerárquica alineada con la taxonomía biológica. Este repositorio contiene exclusivamente el encoder de imagen; no incluye el encoder de texto, por lo que la alineación imagen-texto se aprovecha de forma indirecta: los embeddings de la lista de especies se calculan previamente en un portátil y el teléfono solo compara el embedding de la foto contra ellos.

El proceso de conversión pasó por exportar el encoder a ONNX y aplicar cuantización dinámica int8. El script utilizado (`embeddings/export_onnx.py`) está publicado en el repositorio de NaturDex. No se documenta en la información disponible ningún reentrenamiento, ajuste fino, RLHF/DPO ni modificación de los pesos originales más allá de la cuantización. El resultado es un grafo ONNX portable, optimizado para ejecutarse en WebAssembly/WebGPU dentro del navegador.

## Capacidades

- Extracción de embeddings de imagen: dada una foto de 224x224 píxeles, produce un vector de 512 dimensiones normalizado en L2.
- Clasificación zero-shot de especies: al comparar el embedding de la imagen con embeddings de texto precalculados, permite asignar una foto a una especie sin entrenamiento específico para esa lista.
- Inferencia totalmente offline en navegador: funciona con onnxruntime-web, sin envío de datos a servidores.
- Ejecución en hardware modesto: diseñado para teléfonos reutilizados en salidas de campo escolares.
- Integración en aplicaciones web: pensado para el proyecto NaturDex.
- No incluye generación de texto, razonamiento, código, matemáticas, tool calling, agentes, capacidades multimodales de audio o vídeo, ni encoder de texto dentro del archivo.

## Casos de uso

- Identificación de especies en salidas escolares: la aplicación NaturDex captura una foto con el teléfono y la clasifica contra una lista de especies locales; al ejecutarse en el navegador, no requiere cobertura móvil en el campo.
- Ciencia ciudadana offline: un voluntario puede etiquetar observaciones en zonas sin conectividad y sincronizar los resultados después, usando el embedding como identificador previo.
- Aplicaciones educativas de biodiversidad: permite construir juegos o dinámicas de reconocimiento de flora y fauna con retroalimentación inmediata en dispositivos de gama baja.
- Clasificación asistida en cuadernos de campo digitales: el embedding de 512 dimensiones puede almacenarse y compararse después contra listas taxonómicas ampliadas sin volver a procesar la imagen.
- Detección de especies fuera de distribución: al comparar contra una lista regional, los embeddings permiten señalar candidatos inusuales para revisión humana.
- Despliegue en dispositivos edge o IoT: el modelo puede integrarse en nodos con poca memoria (cámaras trampa, estaciones de monitorización) usando onnxruntime fuera del navegador.
- Filtrado previo en pipelines de anotación: sirve como primera pasada barata para preetiquetar grandes volúmenes de imágenes antes de una revisión experta o de un modelo mayor.
- Demostraciones web sin backend: al ser un único archivo ONNX de ~87 MB, permite publicar demos de clasificación biológica que se ejecutan por completo en el cliente.

## Benchmarks y rendimiento

El autor publica una evaluación de precisión sobre 244 fotos recientes de iNaturalist de calidad de investigación, tomadas en España (82 especies), comparando contra una lista de aproximadamente 1.900 especies registradas en Asturias:

| Modelo | Top-1 | Top-3 | Top-5 |
|---|---|---|---|
| fp32 | 70% | 84% | 87% |
| int8 (este archivo) | 66% | 81% | 86% |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible; tales métricas no son aplicables a un encoder de imagen. Tampoco se publican datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido habitual; los pesos ocupan ~87 MB y el uso de memoria en el navegador es de unos cientos de megabytes.
- GPU recomendadas: no requiere GPU. Está pensado para ejecutarse en CPU mediante WebAssembly; puede acelerarse con WebGPU si el navegador lo soporta.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso objetivo; cabe holgadamente en cualquier dispositivo que pueda ejecutar onnxruntime-web, incluidos teléfonos de gama baja.
- Opciones de despliegue: onnxruntime-web (backends WebAssembly y WebGPU), onnxruntime en Python/C++/Java y otros entornos compatibles con ONNX. No aplican vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: el archivo ONNX pesa aproximadamente 87 MB dentro de un repositorio de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Formato / tamano | Encoder de texto incluido | Top-1 (evaluación del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Virien/naturdex-bioclip-onnx (int8) | ONNX, ~87 MB | No | 66% | MIT | HuggingFace, 0 descargas |
| BioCLIP fp32 (`imageomics/bioclip`) | Pesos originales | Sí (modelo completo) | 70% | MIT | HuggingFace |
| BioCLIP 2 | no disponible | no disponible | no disponible | no disponible | Anunciado por NVIDIA y el ecosistema Imageomics |
| CLIP genérico (ViT) | Múltiples | Sí | no disponible | Variable según variante | Amplia |

La comparación con BioCLIP 2 y con CLIP genérico no puede cuantificarse con los datos disponibles: solo se conoce la existencia de BioCLIP 2 como modelo fundacional de biología acelerado con GPUs NVIDIA, sin cifras publicadas en la información recogida.

## Limitaciones y advertencias

- La cuantización int8 reduce la precisión: la caída observada es de 4 puntos en Top-1 (de 70% a 66%), 3 puntos en Top-3 y 1 punto en Top-5 respecto a fp32.
- La evaluación se realizó sobre un conjunto pequeño y localizado (244 fotos, 82 especies, Asturias), por lo que la generalización a otras regiones, taxones o condiciones de fotografía no está validada.
- El archivo no contiene encoder de texto: cualquier uso zero-shot exige precalcular los embeddings de las etiquetas con el modelo BioCLIP completo y mantener ese vocabulario sincronizado.
- La calidad de la clasificación depende críticamente de la lista de especies suministrada; una lista inadecuada produce errores sistemáticos.
- No hay información sobre sesgos del modelo subyacente ni sobre su comportamiento con taxones poco representados en TreeOfLife-10M.
- Existe riesgo de clasificación errónea en especies visualmente similares, aunque no de "alucinación" en el sentido generativo, ya que el modelo no produce texto.
- Las limitaciones de idioma no aplican al encoder de imagen, pero sí al proceso externo que genere las etiquetas textuales.
- La licencia MIT permite uso comercial, siempre que se respete la atribución a BioCLIP y al Imageomics Institute según la cita indicada en la model card.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validación por parte de la comunidad ni historial de mantenimiento.
- El modelo se orienta a inferencia ligera; no debe emplearse como sustituto de un sistema experto de identificación taxonómica en contextos con consecuencias científicas o legales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Virien/naturdex-bioclip-onnx
- Modelo base BioCLIP: https://huggingface.co/imageomics/bioclip
- Repositorio de NaturDex: https://github.com/Virien84/naturdex
- Script de exportación a ONNX: https://github.com/Virien84/naturdex/blob/main/embeddings/export_onnx.py
- Documentación de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
- Paper de BioCLIP (CVPR 2024): Stevens, S. et al., "BioCLIP: A Vision Foundation Model for the Tree of Life"
- Imageomics Institute: https://imageomics.org/
- Ecosistema BioCLIP: https://imageomics.github.io/bioclip-ecosystem/pages/models.html
- Artículo de NVIDIA sobre BioCLIP 2: https://blogs.nvidia.com/blog/bioclip2-foundation-ai-model/
- Modelos compatibles con ONNX en HuggingFace: https://huggingface.co/models?library=onnx
- ONNX Model Zoo: https://github.com/onnx/models
- Modelos de ONNX Runtime: https://onnxruntime.ai/models
