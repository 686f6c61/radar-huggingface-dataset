# swiftail/BiRefNet_lite-onnx-coreml

## Resumen

swiftail/BiRefNet_lite-onnx-coreml es un re-export a ONNX de BiRefNet_lite, el modelo de segmentación dicotómica de imágenes de alta resolución publicado por Peng Zheng, Dehong Gao, Deng-Ping Fan, Li Liu, Jorma Laaksonen, Wanli Ouyang y Nicu Sebe. No es un modelo nuevo ni un reentrenamiento: los pesos son idénticos a los del original ZhengPeng7/BiRefNet_lite y lo único que cambia es la manera en la que se expresan las operaciones dentro del grafo.

El objetivo del re-export es que el modelo se ejecute íntegramente en el execution provider (EP) de CoreML de ONNX Runtime sobre GPU de Apple Silicon. Los exports ONNX convencionales fallan en ese backend: la convolución deformable se traduce en intermedios GatherND de más de 4 GB en CPU y CoreML o bien no compila el grafo, o bien lo fragmenta en alrededor de 100 particiones. Esta versión se compila como una única partición (6924 de 6924 nodos) y ronda los 0,4 s por imagen en un M3 Pro con formato MLProgram.

Su relevancia práctica es doble: demuestra que la eliminación de fondo de alta resolución es viable en local sobre portátiles Apple sin depender de servicios en la nube, y documenta con scripts una receta de conversión reutilizable para grafos con convoluciones deformables. El repositorio ocupa 0,2 GB, contiene únicamente model.onnx en fp32 y no registra descargas ni likes en la información consultada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BiRefNet_lite (segmentación dicotómica de imagen con bloques de ventana tipo Swin y convoluciones deformables), re-exportada a un grafo ONNX numéricamente equivalente |
| Parámetros totales | no disponible (el repositorio contiene un model.onnx fp32 de 0,2 GB) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es una imagen de tamaño fijo 1024x1024 |
| Tipos de cuantización | fp32 (único formato incluido en este repositorio) |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (model.onnx, fp32) |
| Modelo base | ZhengPeng7/BiRefNet_lite |
| Tamaño del repositorio | 0,2 GB |
| Entrada | `input_image`: [1, 3, 1024, 1024] float32; RGB redimensionado a 1024x1024 (bilineal, sin recorte) y normalizado con (v/255 − mean) / std, mean [0.485, 0.456, 0.406], std [0.229, 0.224, 0.225] |
| Salida | `output_image`: [1, 1, 1024, 1024] logits; hay que aplicar sigmoid y redimensionar al tamaño de la imagen original |
| Execution provider objetivo | CoreML EP de ONNX Runtime (formato MLProgram, shapes estáticas, unidades de cómputo CPU+GPU) |
| Tarea declarada | background-removal / dichotomous-image-segmentation (pipeline image-segmentation) |
| Fecha de publicación del repositorio | 2026-10-08 |

## Arquitectura y entrenamiento

BiRefNet_lite es una variante reducida de BiRefNet, un framework de segmentación dicotómica de imágenes (DIS) que produce máscaras binarias de alta resolución a partir de una imagen RGB. Según la model card del re-export, el grafo contiene particionado y reverso de ventanas tipo Swin, operaciones image2patches y convoluciones deformables (deform_conv2d). No se dispone de datos sobre número de tokens o épocas de entrenamiento, composición del dataset ni si se aplicó RLHF o DPO: son detalles del trabajo original (Zheng et al., CAAI Artificial Intelligence Research, 2024) que la información consultada no reproduce, por lo que se marcan como no disponibles.

El trabajo de swiftail no reentrena nada: conserva los pesos intactos y modifica únicamente la expresión de las operaciones para que el backend de CoreML pueda compilar el grafo completo. Los cambios documentados son cuatro: (1) deform_conv2d se sustituye por un GridSample bilineal por cada tap del kernel, acumulado con convoluciones 1x1, con una diferencia máxima de logits de aproximadamente 5e-5; (2) el particionado y reverso de ventanas de Swin y el image2patches se reestructuran a rango ≤ 5, el límite que impone CoreML; (3) el indexado qkv[0..2] pasa a unbind; (4) las shapes se fijan a 1024x1024, se aplica constant folding básico de ONNX Runtime y se reescriben los pesos de Gemm con transB=1 mediante fix_gemm.py. Los scripts de conversión se incluyen en la carpeta scripts/ del repositorio, lo que hace la receta reproducible.

## Capacidades

- Segmentación dicotómica de imagen: genera una máscara (logits por píxel) que separa figura y fondo en una sola pasada hacia delante.
- Eliminación de fondo de alta resolución, con salida a 1024x1024 reescalable al tamaño original de la imagen.
- Ejecución íntegra en el execution provider CoreML sobre GPU de Apple Silicon, con el grafo en una única partición.
- Capacidad de procesar imágenes RGB reales de fotografía, ilustración y arte de personajes, según el caso de uso declarado por el autor (la app Mixer, para eliminar el fondo del arte de personajes en una partida de D&D).
- No genera texto, no razona, no soporta tool calling ni function calling y no participa en flujos de agentes ni de razonamiento multi-paso.
- No es multilingüe ni acepta entradas de lenguaje natural, audio o vídeo: su única modalidad de entrada es imagen.
- No admite resoluciones variables ni lotes dinámicos: las shapes están fijadas a 1x3x1024x1024 en la entrada y 1x1x1024x1024 en la salida.
- No incluye variantes cuantizadas (int8, fp16) en este repositorio.

## Casos de uso

- Eliminación de fondo en apps nativas de iOS y macOS: el modelo se integra vía ONNX Runtime con el EP de CoreML y se ejecuta en la GPU del propio dispositivo, de modo que la app no necesita enviar las imágenes a un servidor ni incurrir en costes de inferencia en la nube.
- Procesado por lotes de catálogos de producto: con aproximadamente 0,4 s por imagen en un M3 Pro (unas 2,5 imágenes por segundo, valor derivado de la latencia declarada), un catálogo de 10 000 referencias se procesa en torno a una hora en un solo equipo de sobremesa Apple Silicon.
- Extracción de personajes para aplicaciones de mesa (VTT): es el uso real que declara el autor en Mixer, donde el arte de los personajes se recorta automáticamente al añadirlo a una sesión, sin intervención manual.
- Generación de máscaras para pipelines generativos: la salida binaria sirve como máscara de inpainting o de img2img en flujos de difusión, evitando editar manualmente la zona a preservar.
- Herramientas de diseño gráfico y edición fotográfica: la máscara se puede usar como selección base para sustituir fondos, aplicar recortes por sujeto o generar versiones con fondo transparente en un editor.
- Fotografía de producto y retrato para comercio electrónico: el modelo está pensado para separar un sujeto único y bien definido del fondo, que es el escenario típico de las fichas de producto y de los avatares profesionales.
- Automatización en macOS con Python: un script que combine onnxruntime con el EP de CoreML permite encadenar la segmentación con otras tareas (redimensionado, composición, subida a un CDN) sin salir del entorno local.
- Anotación asistida de datasets de segmentación: las máscaras generadas pueden servir como preanotación que un humano revisa, reduciendo el coste de etiquetado en proyectos de visión por computador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (IoU, DICE, F-measure, MAE) en la información disponible. Los únicos datos verificables son métricas de compilación, latencia y fidelidad numérica del re-export, que se recogen en la tabla siguiente:

| Métrica | Valor | Contexto |
|---|---|---|
| Nodos compilados en CoreML EP | 6924/6924 | Grafo completo en una única partición, frente a las ~100 particiones de los exports ONNX convencionales |
| Latencia por imagen | ~0,4 s | M3 Pro, CPU+GPU, formato MLProgram |
| Throughput derivado | ~2,5 imágenes/s | Valor calculado a partir de la latencia declarada |
| Diferencia frente al CPU EP | ≤ 2e-4 en el canal alfa | Mismo grafo, distinto execution provider |
| Diferencia máxima de logits frente a la implementación original | ~5e-5 | Tras sustituir deform_conv2d por GridSample bilineal más convoluciones 1x1 |
| Intermedios GatherND en exports previos | > 4 GB en CPU | Motivo por el que se realizó este re-export |

## Requisitos de hardware

- Espacio en disco: 0,2 GB para el model.onnx en fp32.
- VRAM y memoria unificada: no disponibles de forma explícita. El escenario validado por el autor es una GPU de Apple Silicon con memoria unificada (M3 Pro), usando las unidades de cómputo CPU+GPU de CoreML, por lo que no hay una cifra de VRAM dedicada publicada.
- GPU recomendadas: Apple Silicon (probado en M3 Pro). Para GPU NVIDIA, AMD o Intel no se han documentado pruebas ni cifras de rendimiento en la información consultada.
- Viabilidad en GPU de consumo: el repositorio está orientado a portátiles y equipos de sobremesa Apple; no hay datos sobre su comportamiento en tarjetas gráficas de consumo de NVIDIA o AMD.
- Modelos naive previos con convolución deformable requerían más de 4 GB solo para los intermedios GatherND en CPU, un motivo adicional para preferir el EP de CoreML con este export concreto.
- Opciones de despliegue: ONNX Runtime con el execution provider de CoreML (vía MLProgram, shapes estáticas y compute units CPU+GPU), ONNX Runtime con CPU EP como alternativa de referencia, y conversión adicional con coremltools si se quiere empaquetar como modelo Core ML nativo.
- No es compatible con servidores de inferencia para modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama: es un modelo de segmentación de imagen, no un LLM.
- Latencia y throughput: aproximadamente 0,4 s por imagen en un M3 Pro según el autor; no se han publicado cifras para otros dispositivos.

## Comparativa con modelos similares

| Modelo o repositorio | Formato | Objetivo de ejecución | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swiftail/BiRefNet_lite-onnx-coreml | ONNX fp32 | CoreML EP de ONNX Runtime (Apple Silicon) | Idénticos a BiRefNet_lite | MIT | 0 descargas, 0 likes |
| ZhengPeng7/BiRefNet_lite | PyTorch | Framework original de BiRefNet | Originales | MIT | Repositorio de referencia del modelo base |
| onnx-community/BiRefNet_lite-ONNX | ONNX | WebML y ejecución ONNX genérica | Conversión del original | MIT (heredada) | Repositorio de la comunidad ONNX |
| ZhengPeng7/BiRefNet (versión completa) | PyTorch | Framework original | Modelo de mayor tamaño | MIT | Repositorio de referencia de la familia |

No se dispone de datos de parámetros, contexto ni métricas de calidad comparadas entre estas variantes en la información consultada, por lo que esas celdas se omiten en lugar de estimarse.

## Limitaciones y advertencias

- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.
- Shapes fijas a 1024x1024 y batch de tamaño 1: cualquier otra resolución o lote requiere volver a exportar el grafo.
- El beneficio está acotado al execution provider de CoreML; no se han documentado mejoras equivalentes en otros backends de ONNX Runtime.
- Divergencia numérica frente a la implementación original: hasta 2e-4 en el canal alfa y alrededor de 5e-5 en los logits máximos, algo que puede notarse en bordes finos, pelo o detalles semitransparentes.
- Riesgo de errores de segmentación, equivalente al de una alucinación en modelos generativos: la máscara puede ser incorrecta en imágenes fuera de dominio, con figura y fondo poco contrastados, con transparencias o en imágenes médicas o técnicas.
- Sesgos: no documentados en esta ficha; dependen del dataset de entrenamiento del modelo original, cuyo detalle no está disponible en la información consultada.
- Licencia MIT: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright y se cite el trabajo original de Zheng et al.
- El preprocesado es estricto: hay que usar exactamente la normalización indicada (media [0.485, 0.456, 0.406] y desviación [0.229, 0.224, 0.225]) y el redimensionado bilineal sin recorte, o los resultados se degradan.
- Solo fp32: no hay versiones cuantizadas en este repositorio, lo que penaliza el consumo de memoria frente a alternativas en fp16 o int8.
- Es un modelo puramente de visión: no admite entrada de texto, audio ni conversaciones multi-turno, y no debe evaluarse con criterios propios de los LLM.

## Enlaces

- Repositorio del re-export: https://huggingface.co/swiftail/BiRefNet_lite-onnx-coreml
- Modelo base: https://huggingface.co/ZhengPeng7/BiRefNet_lite
- Conversión ONNX de la comunidad: https://huggingface.co/onnx-community/BiRefNet_lite-ONNX
- Repositorio original de BiRefNet en GitHub: https://github.com/ZhengPeng7/BiRefNet
- Incidencia sobre el soporte de CoreML: https://github.com/ZhengPeng7/BiRefNet/issues/45
- Documentación de Core ML de Apple: https://developer.apple.com/documentation/coreml
- Linaje y derivados de la conversión ONNX comunitaria: https://parapulse.io/family/onnx-community/BiRefNet_lite-ONNX
