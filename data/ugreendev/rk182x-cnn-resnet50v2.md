# UGREENDEV/RK182X-CNN-ResNet50V2

## Resumen

RK182X-CNN-ResNet50V2 es un paquete de despliegue del modelo clasico ResNet50V2, una red neuronal convolucional (CNN) de 50 capas disenada originalmente para la clasificacion de imagenes en ImageNet con 1.000 clases de salida. Lo desarrolla el usuario UGREENDEV y no constituye un modelo nuevo entrenado desde cero, sino una conversion y cuantizacion del modelo upstream `resnet50-v2-7.onnx` del repositorio oficial de ONNX Models, empaquetado en formato RKNN para su ejecucion sobre las NPU de los chips Rockchip RK1820 y RK1828.

La relevancia de esta publicacion no reside en el modelo en si, sino en el artefacto de despliegue: proporciona pesos cuantizados a W8A8 (8 bits en pesos y activaciones) a una resolucion de entrada de 224x224, listos para ejecutarse sobre un unico nucleo NPU. Esto lo hace util para escenarios de vision por computador en el borde (edge computing) donde se requiere baja latencia y bajo consumo sobre hardware Rockchip con acelerador NPU integrado.

Se trata, por tanto, de un recurso de infraestructura mas que de un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso, y su unica funcion es la clasificacion de imagenes en las 1.000 categorias de ImageNet. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN residual (ResNet50V2, 50 capas) |
| Parametros totales | no disponible (el modelo upstream ResNet50V2 ronda los 25,6 M, pero no se confirma en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | w8a8 (8 bits pesos y activaciones) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (artefactos de despliegue Rockchip); modelo origen ONNX (`resnet50-v2-7.onnx`) |
| Resolucion de entrada | 224x224 |
| Clases de salida | 1.000 (ImageNet) |
| Chips soportados | RK1820, RK1828 |
| Nucleos NPU | 1 |
| Version de runtime RKNN | no disponible |
| Configuracion incluida | `ResNet50V2-224x224-w8a8-1` |

## Arquitectura y entrenamiento

La arquitectura subyacente es ResNet50V2, una red neuronal convolucional residual de 50 capas. La variante V2 introduce mejoras en la disposicion de las conexiones residuales (preactivacion) respecto a la ResNet original, lo que facilita el entrenamiento de redes profundas y mejora la propagacion del gradiente. El modelo fue entrenado originalmente sobre el conjunto de datos ImageNet para la tarea de clasificacion en 1.000 categorias.

No se dispone de informacion sobre el proceso de entrenamiento en esta publicacion: no se detallan el numero de tokens (no aplica), la composicion exacta del dataset mas alla de ImageNet, ni si hubo tecnicas de ajuste fino adicionales. El autor indica unicamente que los artefactos se convirtieron desde `resnet50-v2-7.onnx` y se cuantizaron a W8A8. La innovacion tecnica destacable es precisamente esa cuantizacion post-entrenamiento a 8 bits y el empaquetado en formato RKNN con verificacion SHA-256 para su despliegue en NPU Rockchip.

## Capacidades

- Clasificacion de imagenes en 1.000 clases de ImageNet a resolucion 224x224.
- Inferencia acelerada por NPU sobre chips Rockchip RK1820 y RK1828 (un nucleo NPU).
- Ejecucion cuantizada W8A8, orientada a eficiencia energetica y baja latencia en el borde.
- Verificacion de integridad mediante sumas SHA-256 incluidas en el repositorio.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Clasificacion de imagenes en dispositivos empotrados: el modelo se ejecuta sobre la NPU de un RK1820 o RK1828 para etiquetar imagenes en las 1.000 clases de ImageNet, adecuado por su cuantizacion W8A8 y su bajo consumo.
- Preprocesado en pipelines de vision industrial: uso como extractor de categoria rapido en lineas de inspeccion donde se necesita clasificar productos o defectos con latencia minima sobre hardware Rockchip.
- Moderacion o filtrado de contenido visual en el borde: clasificacion preliminar de imagenes antes de enviarlas a un modelo mayor en la nube, reduciendo ancho de banda y coste.
- Prototipado de sistemas de camara inteligente: integracion en dispositivos con SoC Rockchip para tareas de reconocimiento de escenas o categorias genericas de ImageNet.
- Benchmark de referencia para validar el rendimiento de la NPU: al ser un modelo estandar y bien conocido, sirve para medir throughput y latencia del acelerador RK1820/RK1828 en cargas CNN.
- Educacion y experimentacion con despliegue en NPU: permite a desarrolladores practicar la conversion ONNX a RKNN, la cuantizacion W8A8 y la verificacion de artefactos sin necesidad de entrenar un modelo propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el modelo esta pensado para ejecutarse en NPU Rockchip, no en GPU convencional.
- GPU recomendadas: no aplica; el artefacto es especifico para NPU de RK1820 y RK1828.
- Compatibilidad con GPU de consumo: no disponible para este paquete RKNN; el modelo ONNX original podria ejecutarse en GPU, pero no se documenta en esta publicacion.
- Opciones de despliegue: runtime RKNN sobre chips Rockchip RK1820/RK1828; descarga via ModelScope o Hugging Face (`hf download`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-CNN-ResNet50V2 (este) | no disponible | 224x224 | RKNN (W8A8) | Apache 2.0 | NPU Rockchip RK1820/RK1828 |
| ResNet50V2 ONNX upstream | no disponible | 224x224 | ONNX | Apache 2.0 | CPU/GPU generica |
| Otras CNN de clasificacion (p. ej. MobileNet, EfficientNet) | no disponible | variable | variable | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo limitado a clasificacion de imagenes en 1.000 clases de ImageNet; no es un modelo de lenguaje ni de proposito general.
- Solo soporta los chips RK1820 y RK1828; no es portable a otros aceleradores sin reconversion.
- La cuantizacion W8A8 puede introducir perdida de precision respecto al modelo en punto flotante original.
- No se documentan sesgos especificos, pero hereda los sesgos del dataset ImageNet y del entrenamiento original.
- Riesgo de clasificaciones erroneas fuera de las categorias de ImageNet o ante imagenes atipicas.
- Licencia Apache 2.0 permite uso comercial, pero debe respetarse la atribucion del modelo upstream de ONNX Models.
- El autor recomienda verificar las sumas SHA-256 antes del despliegue; artefactos corruptos pueden provocar fallos en la NPU.
- No se especifica la version del runtime RKNN necesaria, lo que puede complicar la reproducibilidad.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-CNN-ResNet50V2
- Modelo origen ONNX: https://github.com/onnx/models/tree/main/validated/vision/classification/resnet
- Documentacion upstream y licencia: https://github.com/onnx/models/blob/main/validated/vision/classification/resnet/README.md#license
