# UGREENDEV/RK182X-CNN-YOLOv8s

## Resumen

RK182X-CNN-YOLOv8s es un modelo de deteccion de objetos YOLOv8s convertido al formato RKNN para su ejecucion sobre las NPU de los SoC Rockchip RK1820 y RK1828. Lo publica el usuario UGREENDEV en Hugging Face como artefacto de despliegue, no como modelo entrenado desde cero: parte del ONNX de referencia del repositorio oficial `airockchip/rknn_model_zoo` (ejemplo YOLOv8) y lo compila con RKNN Toolkit para la version de runtime v1.1.0.

El modelo es una CNN de deteccion de objetos con entrada fija de 640x640 pixeles, cuantizacion w8a8 (pesos y activaciones en 8 bits) y configurado para un solo nucleo NPU. Su relevancia es practica: permite ejecutar deteccion de objetos en tiempo real sobre hardware Rockchip de bajo consumo sin necesidad de recompilar el modelo, siempre que se use la version de runtime y driver correspondientes.

La ficha se basa unicamente en la informacion publicada en la model card. No hay datos de entrenamiento, benchmarks ni especificaciones detalladas del backbone mas alla de la referencia a YOLOv8s, por lo que muchos campos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (YOLOv8s, backbone CSPDarknet con cuello PAN-FPN y cabeza de deteccion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640) |
| Tipos de cuantizacion | w8a8 (pesos y activaciones en int8) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (modelo fuente bajo GNU Affero General Public License v3.0; aplican tambien las licencias de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0), con config.json y SHA256SUMS por configuracion |

## Arquitectura y entrenamiento

El modelo es una conversion del YOLOv8s de Ultralytics exportado a ONNX por el proyecto `airockchip/rknn_model_zoo` y posteriormente compilado a RKNN para las NPU Rockchip RK1820 y RK1828. La arquitectura subyacente es la de YOLOv8s: una CNN con backbone CSPDarknet, cuello PAN-FPN y cabeza de deteccion ancor-free con asignacion dinamica de etiquetas. La entrada esta fijada a 640x640 pixeles y la salida son cajas delimitadoras con clase y puntuacion.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens o imagenes, ni sobre procesos de ajuste fino o RLHF. La model card solo documenta el proceso de conversion: version de runtime RKNN v1.1.0, una unica configuracion (`YOLOv8s-640x640-w8a8-1`), cuantizacion w8a8 y un nucleo NPU. La innovacion tecnica relevante es la propia cuantizacion int8 y el empaquetado para NPU, que permite inferencia de baja latencia en hardware embebido.

## Capacidades

- Deteccion de objetos en imagenes de 640x640 pixeles con salida de cajas, clases y puntuaciones.
- Ejecucion sobre NPU de Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Cuantizacion w8a8 para reducir huella de memoria y acelerar inferencia en hardware embebido.
- Verificacion de integridad mediante checksums SHA-256 incluidos en el repositorio.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto.
- No tiene capacidades multilingues ni de vision-lenguaje: es exclusivamente un detector de objetos.
- No se documentan capacidades adicionales (segmentacion, pose, tracking) en la informacion disponible.

## Casos de uso

- Vigilancia y videovigilancia en dispositivos edge: el modelo se ejecuta en la NPU de un SoC RK1820/RK1828 y detecta personas u objetos en flujos de camara en tiempo real, sin enviar video a la nube.
- Robotica de bajo consumo: integracion en robots o drones con Rockchip para deteccion de obstaculos y objetos, aprovechando la cuantizacion w8a8 para minimizar consumo energetico.
- Automatizacion industrial: inspeccion visual en lineas de produccion para detectar defectos o piezas, desplegando el modelo en controladores con NPU Rockchip.
- Domotica y camaras inteligentes: deteccion de presencia o intrusion en dispositivos del hogar con hardware embebido, reduciendo coste frente a soluciones con GPU.
- Analisis de trafico y aforo: conteo de vehiculos o personas en camaras urbanas desplegadas sobre placas RK1820/RK1828.
- Prototipado rapido de vision por computador: uso del modelo ya compilado para validar pipelines de deteccion en hardware Rockchip antes de entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU compatible: Rockchip RK1820 o RK1828 (unico hardware soportado segun la model card).
- Runtime: RKNN Runtime v1.1.0 y driver correspondiente; verificar con `rknn-smi -v` en el dispositivo antes de ejecutar.
- VRAM: no disponible (el modelo se ejecuta en NPU, no en GPU).
- GPU recomendadas: no aplica; el modelo no esta pensado para GPU convencionales.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: RKNN Runtime sobre el SoC Rockchip; descarga via `hf download` o `modelscope download`; verificacion con `sha256sum -c SHA256SUMS`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Cuantizacion | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RK182X-CNN-YOLOv8s | YOLOv8s (CNN) | 640x640 | w8a8 | NPU RK1820/RK1828 | other (fuente AGPL-3.0) | Hugging Face, ModelScope |
| YOLOv8s (Ultralytics) | YOLOv8s (CNN) | 640x640 | FP32/FP16/INT8 | GPU/CPU | AGPL-3.0 | GitHub, PyPI |
| YOLOv8n (Ultralytics) | YOLOv8n (CNN) | 640x640 | FP32/FP16/INT8 | GPU/CPU | AGPL-3.0 | GitHub, PyPI |

La comparativa se limita a variantes de la misma familia YOLOv8, ya que no se dispone de datos de otros modelos convertidos a RKNN para RK182X en la informacion proporcionada. No hay datos de rendimiento comparativo disponibles.

## Limitaciones y advertencias

- Modelo exclusivamente de vision: no procesa texto ni lenguaje, por lo que no es adecuado para tareas de NLP.
- Solo compatible con NPU Rockchip RK1820 y RK1828; no funciona en GPU, CPU generica ni otras NPU sin recompilacion.
- Requiere RKNN Runtime v1.1.0 y driver coincidente; versiones distintas pueden provocar fallos o resultados incorrectos.
- La cuantizacion w8a8 puede degradar la precision respecto al modelo en FP32, especialmente en objetos pequenos o clases poco representadas.
- Licencia "other": el modelo fuente esta bajo AGPL-3.0, lo que impone obligaciones de copyleft para uso en red; revisar LICENSE y NOTICE antes de uso comercial.
- Aplican ademas las licencias de RKNN Toolkit y RKNN Runtime, que pueden restringir el uso comercial o la redistribucion.
- No se documentan sesgos del modelo fuente ni metricas de robustez; el riesgo de falsos positivos y negativos depende del modelo YOLOv8s original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria.
- No se dispone de informacion sobre el dataset de entrenamiento ni sobre el rendimiento en dominios especificos.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-YOLOv8s
- Repositorio de referencia del modelo fuente: https://github.com/airockchip/rknn_model_zoo/tree/main/examples/yolov8
- ModelScope (descarga alternativa): https://modelscope.cn/models/UGREENDEV/RK182X-CNN-YOLOv8s
- Documentacion de configuracion: `YOLOv8s-640x640-w8a8-1/README.md` dentro del repositorio
- Atribucion y terminos: `NOTICE` y `LICENSE` dentro del repositorio
