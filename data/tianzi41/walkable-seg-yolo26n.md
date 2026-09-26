# tianzi41/walkable-seg-yolo26n

## Resumen

Walkable-seg-yolo26n es un modelo de segmentación semántica de dos clases (más fondo) desarrollado por el usuario tianzi41 para navegación asistida de personas ciegas. Se trata de un modelo YOLO26n-sem, la variante nano de segmentación semántica de Ultralytics, con 1,63 millones de parámetros, diseñado explícitamente para inferencia en tiempo real en dispositivos móviles Android. El modelo recibe una imagen RGB de 640×640 píxeles procedente de la cámara del teléfono y devuelve un mapa de clases por píxel que distingue entre zonas transitables (aceras, pavimento podotáctil, pasos de cebra, carril bici, calzada para bicicletas, aparcamientos, bordillos) y no transitables.

El problema que resuelve es concreto: convertir la señal de vídeo del smartphone en una guía de navegación peatonal para usuarios con discapacidad visual, indicándoles por dónde pueden caminar de forma segura. Para ello se apoya en una taxonomía binaria muy simplificada (walkable / non-walkable / background) que reduce la complejidad del etiquetado y facilita la integración con sistemas de guiado por voz. El modelo se publica junto con su pipeline de despliegue (PyTorch → ONNX FP32 → MNN / NCNN / ONNX Runtime) y forma parte de la tercera generación de una aplicación de navegación para invidentes (fg_app / com.fg.app).

Su relevancia actual radica en su tamaño extremadamente reducido (1,63 M de parámetros y 3,3 MB en formato PyTorch) y en su orientación a despliegue en el borde, sin necesidad de servidores ni conectividad. Se publica bajo licencia MIT, lo que permite su reutilización y adaptación comercial. No se documentan resultados de benchmarks ni idiomas soportados, ya que se trata de un modelo puramente visual y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n-sem (segmentación semántica, escala nano, Ultralytics) |
| Parametros totales | 1,63 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión por computador) |
| Tipos de cuantizacion | no disponible (solo se documenta ONNX FP32; la salida UINT8 es el mapa de clases, no pesos cuantizados) |
| Idiomas soportados | no aplica (modelo de segmentación de imagen) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt, 3,3 MB) y ONNX FP32 (opset 12, 6,0 MB) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO26n-sem de Ultralytics, una red de segmentación semántica en escala nano orientada a inferencia en tiempo real en el borde. La entrada es un tensor FLOAT de forma `[1, 3, 640, 640]` en orden de canales RGB, normalizado al rango 0–1 y con relleno letterbox de valor 114. La salida es un tensor UINT8 de forma `[1, 640, 640]` que contiene directamente el ID de clase por píxel, ya que el modelo incorpora la operación ArgMax en el propio grafo ONNX. Las tres clases son: 0 = walkable, 1 = non-walkable y 2 = background.

En cuanto a los datos de entrenamiento, se emplearon imágenes de escenas urbanas capturadas con teléfono móvil, anotadas con X-AnyLabeling y convertidas posteriormente al formato de segmentación semántica de YOLO. Las regiones transitables se construyeron fusionando las anotaciones de carretera plana (flat-road), acera (flat-sidewalk), paso de cebra (flat-crosswalk), carril bici (flat-cyclinglane), acceso a aparcamiento (flat-parkingdriveway), bordillo (flat-curb) y suelo hueco (void-ground); el resto de la escena se etiquetó como non-walkable. La cadena de despliegue prevista es PyTorch → ONNX FP32 (opset 12) → MNN / NCNN / ONNX Runtime, con conmutación en caliente entre motores en Android. No se especifica el número de imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO (no aplicables en este dominio); por política de publicación, el autor no distribuye las imágenes de entrenamiento ni los hiperparámetros.

## Capacidades

- Segmentación semántica densa por píxel de escenas urbanas en dos clases útiles (transitable / no transitable) más fondo.
- Inferencia en tiempo real orientada a dispositivos móviles, con un presupuesto de cómputo muy bajo (escala nano).
- Clasificación específica de superficies peatonales: aceras, pavimento podotáctil (盲道), pasos de cebra, carril bici, calzada para bicicletas, accesos a aparcamientos y bordillos, todos agrupados como transitables.
- Salida directamente utilizable como mapa de clases: el grafo ONNX incluye ArgMax, por lo que no se requiere postprocesado de decodificación adicional.
- Compatibilidad con múltiples motores de inferencia en Android (MNN, NCNN, ONNX Runtime) con conmutación en caliente entre Vulkan, OpenCL y CPU.
- No dispone de soporte de tool calling, function calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje.
- No dispone de capacidades multilingües, de visión más allá de la segmentación descrita, de audio ni de modo "thinking".

## Casos de uso

- Navegación asistida para personas ciegas: el modelo se ejecuta en el propio teléfono y convierte cada fotograma de la cámara en un mapa de zonas transitables, a partir del cual la aplicación puede emitir indicaciones de guiado por voz o vibración para mantener al usuario sobre la acera o el pavimento podotáctil.
- Detección de invasión de la calzada: al marcar como non-walkable la calzada y los obstáculos, el modelo permite alertar al usuario cuando se aproxima o se desvía hacia una zona no segura, activando avisos en tiempo real.
- Prevención de errores por ruido visual: combinado con el filtrado mediano temporal que menciona el autor, el modelo puede estabilizar la predicción entre fotogramas consecutivos y reducir falsos positivos en escenas con sombras o reflejos.
- Asistencia a la movilidad en interiores y exteriores: dado que la taxonomía incluye superficies como accesos a aparcamientos y bordillos, el modelo sirve para guiar en transiciones entre acera y calzada o en entornos mixtos.
- Investigación en segmentación semántica de bajo coste: con 1,63 M de parámetros y licencia MIT, es un punto de partida para experimentos académicos sobre segmentación eficiente o adaptación de dominio (por ejemplo, distintas ciudades o condiciones meteorológicas).
- Aplicaciones de accesibilidad en robótica móvil ligera: el mapa de transitabilidad puede alimentar la planificación de trayectorias de robots de reparto o sillas de ruedas autónomas de bajo coste, dado su reducido consumo de cómputo.
- Aplicaciones de realidad aumentada urbana: la máscara de transitabilidad puede superponerse a la vista de la cámara para señalizar rutas peatonales accesibles en aplicaciones de turismo o señalética digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 1,63 M de parámetros, los pesos en FP32 ocupan aproximadamente 6,5 MB, por lo que la huella de memoria es mínima, muy por debajo de 1 GB.
- GPU recomendadas: no disponible. Dado su tamaño, cualquier GPU moderna (incluidas integradas) es suficiente; no se especifica un modelo concreto.
- Compatibilidad con GPU de consumo: sí, sin restricciones prácticas. El modelo está pensado para ejecutarse incluso en CPU de teléfono móvil, por lo que cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en dispositivos integrados tipo Raspberry Pi.
- Opciones de despliegue: PyTorch (Ultralytics), ONNX Runtime, y en Android MNN y NCNN. El autor indica compatibilidad con Vulkan, OpenCL y CPU, con conmutación en caliente entre motores.
- Latencia y throughput: no disponible. El autor describe el modelo como apto para inferencia en tiempo real en móvil, pero no publica cifras concretas de latencia ni de FPS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| walkable-seg-yolo26n | 1,63 M | imagen 640×640 | Segmentación semántica de transitabilidad (3 clases) | MIT | HuggingFace (6 descargas) |
| Alternativas genéricas de segmentación nano (p. ej. YOLOv8n-seg / YOLO11n-seg) | no disponible | imagen 640×640 | Segmentación de instancias genérica (clases COCO) | depende del modelo | disponibles públicamente |
| Modelos de segmentación semántica específicos para navegación asistida | no disponible | no disponible | Segmentación de transitabilidad | no disponible | no disponible |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación numérica no es posible. La diferencia principal del modelo analizado es su especialización en una taxonomía binaria de transitabilidad y su tamaño extremadamente reducido.

## Limitaciones y advertencias

- Alucinación y falsos positivos: al ser un modelo de segmentación densa entrenado con datos no publicados, puede clasificar erróneamente superficies ambiguas (sombras, reflejos, obras, pavimento mojado) como transitables o no transitables.
- Sesgo de dominio: el dataset procede de imágenes capturadas con teléfono en entornos urbanos concretos; el rendimiento puede degradarse en otras ciudades, países, condiciones meteorológicas o tipos de pavimento no representados.
- Dependencia del etiquetado: la fusión de categorías heterogéneas (carretera, acera, carril bici, bordillo) en una sola clase walkable puede ocultar matices de seguridad importantes, por ejemplo al tratar como equivalente una acera y una calzada para bicicletas.
- Sin benchmarks publicados: no hay métricas objetivas de precisión, IoU, mAP ni latencia, lo que dificulta evaluar su idoneidad para producción.
- Licencia: MIT, permite uso comercial y modificación, pero exige conservar el aviso de copyright y la licencia original.
- Contexto y idioma: al ser un modelo de visión, no aplican limitaciones de ventana de contexto ni de idioma, pero tampoco ofrece capacidades conversacionales ni de generación de texto.
- Datos no distribuidos: las imágenes y parámetros de entrenamiento no se publican, lo que impide reproducir el entrenamiento o auditar la composición del dataset.
- Aviso de seguridad: cualquier uso en sistemas de asistencia a personas con discapacidad visual debe acompañarse de validación clínica y de campo, además de mecanismos de redundancia, dado el riesgo asociado a un fallo de clasificación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tianzi41/walkable-seg-yolo26n
- Repositorio de presentación del modelo: https://github.com/tianzi41/walkable-seg-model
