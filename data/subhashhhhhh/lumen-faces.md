# subhashhhhhh/lumen-faces

## Resumen

`subhashhhhhh/lumen-faces` no es un modelo de lenguaje, sino un paquete de dos modelos ONNX de visión por computador (detección y reconocimiento facial) empaquetados para su uso dentro de Lumen, una aplicación Android de galería con enfoque *local-first*. El repositorio recopila copias sin modificar de dos modelos de OpenCV Zoo (commit `48b10fa505aeb51fbd127fc60a5c660040e823b7`): `yunet.onnx` para detección de caras con cinco puntos de referencia y `sface.onnx` para extracción de embeddings faciales de 128 dimensiones a partir de una cara alineada de 112×112 píxeles.

El problema que resuelve es el agrupamiento de caras por persona en la galería del dispositivo sin enviar ninguna fotografía a un servidor: la aplicación descarga los ficheros bajo petición desde sus ajustes, verifica sus sumas SHA-256 y ejecuta la inferencia en el propio teléfono. Por tanto, su relevancia no está en el rendimiento bruto ni en la novedad arquitectónica, sino en la distribución reproducible y verificable de dos modelos pequeños y consolidados (YuNet, Shiqi Yu; SFace, Zhong et al. 2021) en un contexto de privacidad por diseño.

El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, un tamaño de 0.0 GB reportado por HuggingFace y fue creado el 24 de octubre de 2026. Es un artefacto de distribución para una aplicación concreta, no un modelo entrenado por el autor del repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes convolucionales independientes en formato ONNX: YuNet (detección de caras, salidas por *stride* 8/16/32 con `cls`, `obj`, `bbox`, `kps`) y SFace (reconocimiento facial, embedding de 128 dimensiones) |
| Parametros totales | No disponible (ni la model card ni la información de HuggingFace publican el recuento de parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelos de visión, sin ventana de contexto textual) |
| Tipos de cuantizacion | No disponible; se distribuyen ficheros ONNX sin indicar precisiones (FP32/FP16/INT8) de los grafos |
| Idiomas soportados | No aplica (sin procesamiento de lenguaje); independiente del idioma de la aplicación |
| Licencia | Apache 2.0 para el repositorio y para `sface.onnx`; `yunet.onnx` es MIT (`LICENSE-YuNet`). Ver `LICENSE`, `LICENSE-YuNet` y `NOTICE` |
| Formato de pesos | ONNX (`.onnx`), con fichero `SHA256SUMS` para verificación de integridad |

## Arquitectura y entrenamiento

YuNet es un detector de caras convolucional de una sola etapa que opera sobre imágenes BGR con valores crudos 0–255 en formato NCHW, con alto y ancho rellenados a múltiplos de 32. Devuelve predicciones por *stride* (8, 16, 32): clasificación, objetividad, caja delimitadora y cinco puntos clave (ojos, punta de la nariz, comisuras de la boca). La puntuación se calcula como √(cls × obj); el centro de la caja es `(col + dx, row + dy) × stride`, el tamaño `exp(dw, dh) × stride` y los puntos clave `(col + kx, row + ky) × stride`. Admiten cualquier tamaño de entrada. Según la model card, YuNet se entrenó sobre WIDER FACE.

SFace produce un vector de 128 valores a partir de una cara alineada de 112×112 píxeles en RGB, valores crudos 0–255, NCHW; el vector se normaliza L2 y se compara por similitud coseno (Lumen agrupa a partir de un umbral ≥ 0.55). La alineación previa se realiza con una transformación de similitud (rotación, escala uniforme y traslación) ajustada por mínimos cuadrados desde los cinco puntos clave de YuNet hasta la plantilla estándar de 112×112 con coordenadas (38.29, 51.70), (73.53, 51.50), (56.03, 71.74), (41.55, 92.37), (70.73, 92.20). OpenCV no documenta el conjunto de entrenamiento exacto de SFace (issue `opencv_zoo#313`); el artículo original de SFace empleó conjuntos de investigación como CASIA-WebFace, VGGFace2 y MS1M. No se documenta en la información disponible ningún proceso de RLHF/DPO ni innovaciones como decodificación especulativa o atención lineal, por tratarse de modelos convolucionales de visión.

## Capacidades

- Detección de caras en imágenes de cualquier tamaño de entrada, con caja delimitadora, puntuación de confianza y cinco puntos clave faciales.
- Reconocimiento facial mediante embeddings de 128 dimensiones comparables por similitud coseno.
- Agrupamiento de caras por persona (proceso completo detección → alineación → embedding → umbral de similitud ≥ 0.55).
- Ejecución íntegra en dispositivo (*on-device*), sin envío de imágenes ni rostros a servidores.
- Verificación de integridad de los ficheros descargados mediante `SHA256SUMS`.
- Integración prevista en Android dentro de la aplicación Lumen (galería local).
- No soporta *tool calling*, agentes, razonamiento multi-paso, ni entrada/salida de texto o audio.

## Casos de uso

- **Agrupamiento de personas en galerías fotográficas locales**: el pipeline YuNet + SFace detecta caras, las alinea a 112×112 y genera embeddings que se agrupan con umbral coseno 0.55, permitiendo crear álbumes automáticos por persona sin salir del dispositivo.
- **Aplicaciones Android con requisitos de privacidad estrictos**: al ejecutarse en ONNX Runtime sobre el teléfono y descargarse los modelos bajo petición, encaja en productos donde la normativa o la política interna impide subir imágenes a la nube.
- **Etiquetado y curaduría de archivos fotográficos personales**: detección con cinco puntos clave útil para orientar recortes o miniaturas centradas en el rostro en gestores de fotos de escritorio.
- **Búsqueda visual por persona en archivos locales**: indexación de embeddings de 128 dimensiones ( vectores pequeños, ~512 bytes en FP32) para consultas de similitud sobre miles de fotografías con requisitos de almacenamiento mínimos.
- **Preprocesado para pipelines biométricos de terceros**: uso de YuNet como etapa de detección y alineación antes de un modelo de verificación propio, gracias a la salida estandarizada de puntos clave y a la transformación de similitud documentada.
- **Prototipado rápido en investigación**: al ser copias sin modificar de OpenCV Zoo, sirven como línea base reproducible para comparar detectores o funciones de pérdida en experimentos de reconocimiento facial.
- **Aplicaciones de accesibilidad o edición automática**: localización de rostros para desenfoque selectivo, recorte inteligente o censura automática en herramientas de edición móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión, recall, mAP en WIDER FACE ni tasas de verificación (por ejemplo, en LFW o IJB-C) para los ficheros distribuidos, y tampoco se aportan latencias o *throughput* medidos en dispositivo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; no disponible con cifras concretas, pero ambos modelos son redes convolucionales pequeñas pensadas para ejecución en CPU móvil. El repositorio reporta 0.0 GB de tamaño total, por lo que los ficheros individuales no se detallan en la información disponible.
- GPU recomendadas: no necesarias. El caso de uso declarado es Android *on-device*; cualquier CPU ARM moderna o GPU integrada es suficiente en la práctica.
- Cabe en GPU de consumo: sí, con enorme margen (RTX 4090, RTX 3060 o inferiores); también en CPU y en dispositivos móviles.
- Opciones de despliegue: ONNX Runtime (incluida la variante para Android y NNAPI/XNNPACK), OpenCV DNN, y cualquier *runtime* compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y *throughput* estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento publicado en la informacion disponible | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lumen-faces (YuNet + SFace) | Detección + reconocimiento facial (ONNX) | No disponible | No aplica | No disponible | Apache 2.0 (repo y SFace), MIT (YuNet) | HuggingFace, OpenCV Zoo |
| YuNet (original, OpenCV Zoo) | Detección facial | No disponible | No aplica | No disponible | MIT | OpenCV Zoo (mismo fichero de origen) |
| SFace (original, OpenCV Zoo) | Reconocimiento facial | No disponible | No aplica | No disponible | Apache 2.0 | OpenCV Zoo (mismo fichero de origen) |
| Otras alternativas de detección/reconocimiento facial (RetinaFace, SCRFD, ArcFace) | Detección / reconocimiento | No disponible | No aplica | No disponible | No disponible en la información proporcionada (verificar antes de uso comercial) | No verificado en esta búsqueda |

Nota: las dos primeras alternativas no son realmente competidoras, sino el mismo artefacto en su repositorio de origen; el valor añadido de `lumen-faces` es el empaquetado conjunto, la verificación por checksum y la documentación de preprocesado. No se dispone de datos objetivos para comparar precisión con otras familias.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite instrucciones; cualquier uso esperando capacidades tipo LLM es un error de categoría.
- El autor del repositorio no ha entrenado los modelos; son copias sin modificar de OpenCV Zoo, por lo que los sesgos y limitaciones son los de YuNet y SFace originales.
- El conjunto de entrenamiento de SFace no está documentado por OpenCV (issue `opencv_zoo#313`); esto dificulta evaluar sesgos demográficos, de iluminación o de ángulo.
- Riesgo de falsos positivos y de agrupaciones erróneas: el umbral de similitud coseno 0.55 es una decisión de la aplicación, no un valor calibrado públicamente para todos los dominios.
- Degradación esperable en caras ocluidas, de perfil, de baja resolución o con iluminación extrema; no se aportan métricas que cuantifiquen esa degradación.
- La detección requiere rellenar alto y ancho a múltiplos de 32 y usar BGR con valores 0–255; un preprocesado incorrecto invalida las salidas.
- La alineación depende de una plantilla de cinco puntos concreta; desviarse de ella rompe la comparabilidad de los embeddings.
- Uso comercial: YuNet es MIT y SFace Apache 2.0 según la concesión de OpenCV para estos ficheros, pero la procedencia de los datos de entrenamiento de SFace no está documentada, lo que conviene revisar jurídicamente antes de desplegar reconocimiento facial en la UE (RGPD y futura normativa de IA).
- El reconocimiento facial biométrico está sujeto a regulación específica; su uso para identificar personas requiere base legal y evaluaciones de impacto.
- Repositorio sin tracción (0 descargas, 0 *likes*): no hay garantía de mantenimiento, issues resueltos ni actualizaciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/subhashhhhhh/lumen-faces
- OpenCV Zoo (origen de ambos ficheros): https://github.com/opencv/opencv_zoo
- Commit referenciado: `48b10fa505aeb51fbd127fc60a5c660040e823b7` (https://github.com/opencv/opencv_zoo/commit/48b10fa505aeb51fbd127fc60a5c660040e823b7)
- Issue sobre los datos de entrenamiento de SFace: https://github.com/opencv/opencv_zoo/issues/313
- Perfil del autor en GitHub: https://github.com/subhashhhhhh
- Referencia bibliográfica de SFace: Zhong et al., 2021 (citada en la model card; URL del artículo no incluida en la información proporcionada)
- Referencia de YuNet: Shiqi Yu (citada en la model card; URL de la publicación no incluida en la información proporcionada)
