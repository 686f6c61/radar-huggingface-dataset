# vasylpilikhovskyi/rebub-migan-512

## Resumen

MI-GAN 512 para Rebub es una conversión a Core ML del generador principal de MI-GAN (Picsart AI Research), empaquetado en fp16 y a una resolución fija de 512 x 512 píxeles. El modelo se publica como artefacto de despliegue para la aplicación Rebub, cuyo caso de uso concreto es rellenar (inpainting) texto borrado sobre ilustraciones de manga. No se trata de un modelo de lenguaje, sino de una red de inpainting de imágenes, por lo que muchas de las métricas habituales de esta ficha (contexto, idiomas, tool calling) no aplican.

El repositorio es un contenedor Core ML (`.mlpackage`) con los pesos en `weight.bin` (14 MB), lo que confirma que el generador es muy ligero y está pensado para inferencia en dispositivo (Apple Silicon / Neural Engine). La licencia es MIT y los pesos derivan de los checkpoints Places2 publicados por Picsart AI Research. El modelo tiene 0 descargas y 0 likes en HuggingFace en el momento de la consulta, y el tamaño del repo aparece como 0.0 GB (probablemente por redondeo del peso real de 14 MB).

La relevancia es acotada: es un artefacto de producción para una app concreta, no un modelo generalista. Su interés para desarrolladores radica en ser un ejemplo de despliegue Core ML fp16 de un inpainting GAN a 512 x 512 con una interfaz de entrada/salida bien definida (tensor de 4 canales de entrada, 3 canales de salida).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GAN para inpainting de imágenes (MI-GAN, generador); conversión a Core ML |
| Parametros totales | no disponible (pesos fp16 de 14 MB, equivalente aproximado a ~7 M parámetros a fp16, dato no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen) |
| Tipos de cuantizacion | fp16 (único formato publicado) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | MIT |
| Formato de pesos | Core ML `.mlpackage` (`Manifest.json`, `model.mlmodel`, `weight.bin`) |

## Arquitectura y entrenamiento

El modelo es el generador de MI-GAN, una GAN diseñada específicamente para inpainting de imágenes. Según la model card, los pesos utilizados son los de Places2 publicados por Picsart AI Research, y la conversión a Core ML se realizó con el script `tocoreml.py` del repositorio de Rebub (`workfiles/offballoon`). La entrada es un tensor `x` de forma `1 x 4 x 512 x 512`, construido como `known - 0.5` concatenado con el RGB en `[-1, 1]` enmascarado por `known`; la salida `y` es un tensor `1 x 3 x 512 x 512` en `[-1, 1]`.

No se proporcionan en la información disponible detalles sobre el número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF/DPO (no aplica al ser un modelo de imagen). Tampoco se documentan innovaciones técnicas adicionales más allá de la propia arquitectura MI-GAN y de la conversión a Core ML en fp16 para ejecución en dispositivo. El SHA-256 de cada fichero está fijado en la app, lo que aporta trazabilidad de integridad.

## Capacidades

- Inpainting de imágenes a resolución fija 512 x 512 píxeles.
- Relleno de regiones enmascaradas mediante el canal `known` (máscara binaria o suave) concatenado a la imagen.
- Caso de uso específico: eliminación de texto sobre arte de manga (borrado de bocadillos/globos de texto).
- Salida RGB normalizada en `[-1, 1]` lista para postprocesado.
- Ejecución en dispositivo vía Core ML (Apple Silicon, Neural Engine / GPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta generación de texto, código, matemáticas, visión general, audio ni modo "thinking".
- Capacidades multilingües: no aplica.

## Casos de uso

- Limpieza de texto en manga para localización: el modelo rellena la zona donde estaba el texto original sobre el dibujo, permitiendo sustituirlo por la traducción sin dejar artefactos visibles en la ilustración.
- Edición de cómics y webtoons: eliminación de rótulos, onomatopeyas o marcas de agua sobre arte digital, con un pipeline de máscara + inferencia Core ML integrado en la app.
- Preprocesado para OCR inverso: borrar texto antes de reejecutar OCR o de aplicar un nuevo capó de texto en un flujo de traducción automática.
- Restauración de scans: rellenar zonas dañadas o con ruido en digitalizaciones de páginas, usando la máscara para indicar las regiones a reconstruir.
- Prototipado en iOS/macOS: al ser un `.mlpackage` con interfaz de tensores fija, se puede integrar en apps Swift con Core ML sin dependencias de Python en producción.
- Investigación en inpainting: servir como baseline ligero (14 MB fp16) para comparar calidad de relleno a 512 x 512 frente a modelos mayores.
- Automatización de pipelines editoriales: procesar lotes de páginas con una máscara generada por detección de texto, ejecutando el modelo en dispositivo para evitar enviar material con copyright a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido de GPU dedicada; el modelo está empaquetado para Core ML y pensado para ejecución en dispositivo Apple.
- Tamaño en disco: pesos fp16 de 14 MB (`weight.bin`), más metadatos del `.mlpackage`.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 y posteriores) con Neural Engine; también ejecutable en CPU/GPU de Apple vía Core ML.
- Cabe en cualquier dispositivo Apple moderno; no requiere GPU de escritorio (A100, H100, RTX 4090) para su formato de despliegue publicado.
- Opciones de despliegue: Core ML (`.mlpackage`) en iOS/macOS; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MI-GAN 512 (Rebub, Core ML fp16) | GAN inpainting | 512 x 512 | Core ML `.mlpackage` | MIT | HuggingFace (0 descargas) |
| MI-GAN original (Picsart AI Research) | GAN inpainting | variable (según checkpoint) | PyTorch | MIT | GitHub / pesos Places2 |
| LaMa | GAN inpainting | variable | PyTorch | Apache 2.0 (según repo) | Repositorio público |
| Stable Diffusion Inpainting | Difusión | 512 x 512 (base) | safetensors / diffusers | CreativeML OpenRAIL-M | HuggingFace |

No se dispone de datos de rendimiento comparativo (PSNR, FID, LPIPS) en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Resolución fija de 512 x 512: cualquier imagen de entrada debe redimensionarse, lo que puede degradar detalles finos en páginas de manga de alta resolución.
- Modelo especializado en inpainting; no es un modelo de lenguaje y no debe evaluarse con métricas de texto (MMLU, HumanEval, GSM8K).
- Riesgo de artefactos y alucinación visual: el generador puede inventar texturas o trazos que no existen en la imagen original, especialmente en regiones grandes o con estructuras complejas.
- Sesgos: al estar entrenado con Places2 (escenas naturales), su comportamiento en arte de manga puede no estar óptimamente alineado; la model card indica que se usa para ese fin, pero no documenta evaluación específica.
- Licencia MIT permite uso comercial, pero los pesos derivan de los checkpoints de Picsart AI Research; conviene verificar la licencia de los pesos originales de Places2 antes de redistribuir.
- Integridad: el SHA-256 de los ficheros está fijado en la app, por lo que modificaciones del `.mlpackage` romperían la verificación.
- Sin datos de benchmarks, latencia ni throughput publicados; no hay evidencia cuantitativa de calidad frente a alternativas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni issues documentados.

## Enlaces

- HuggingFace: https://huggingface.co/vasylpilikhovskyi/rebub-migan-512
- Repositorio MI-GAN (Picsart AI Research): https://github.com/Picsart-AI-Research/MI-GAN
- Repositorio Rebub (script `tocoreml.py` en `workfiles/offballoon`): no disponible en la información proporcionada
