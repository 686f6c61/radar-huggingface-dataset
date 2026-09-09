# sush0401/ebim-bowl-pointer

## Resumen

ebim-bowl-pointer es un modelo de detección de objetos y keypoints desarrollado por sush0401 para robótica de manipulación móvil. Su función es muy concreta: dada una imagen de la cámara situada en la muñeca del brazo robótico, devuelve un único píxel que indica dónde se encuentra un tazón. El modelo está construido sobre el framework Ultralytics YOLO, pesa solo 5,6 MB en formato `.pt` y 11 MB en `.onnx`, y es capaz de ejecutarse en CPU a unos 35 ms por imagen, sin necesidad de GPU.

Su relevancia radica en el proceso de entrenamiento: fue destilado a partir de un gran modelo vision-language que actuó como profesor, etiquetando automáticamente cada frame de 19 demostraciones teleoperadas de agarre. Esto evita por completo la anotación manual y, además, elude los errores de calibración de la cinemática del brazo que frustraron un intento anterior basado en la posición de la articulación. El resultado es un modelo minúsculo, rápido y suficientemente preciso para una tarea de percepción muy acotada, con un error medio de 10,1 píxeles frente a los 190,8 píxeles de un predictor constante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO (Ultralytics) para detección de objetos y keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO de Ultralytics, orientada a la detección de objetos y puntos clave. En este caso, la tarea se reduce a una única clase (`bowl`) y un solo keypoint, cuya posición en coordenadas de imagen es la salida deseada. El detector está entrenado para devolver un píxel concreto de la imagen, sin necesidad de calcular la posición tridimensional del objeto.

El proceso de entrenamiento destaca por el uso de destilación: un modelo vision-language de gran tamaño etiquetó automáticamente todos los frames de 19 demostraciones teleoperadas de agarre de tazones. El modelo estudiante se entrenó después para reproducir esas respuestas. Un intento previo que derivaba las etiquetas a partir de la cinemática del propio brazo robótico fracasó, porque el montaje de la cámara de muñeca introducía un error constante que no podía compensarse con un parámetro de offset. La destilación resuelve el problema porque tanto el profesor como el estudiante observan la misma fotografía, sin depender de la posición articular del brazo.

No se proporcionan datos sobre el número total de parámetros, la composición del dataset más allá de las 19 demostraciones, ni si se aplicaron técnicas como RLHF o DPO. La innovación técnica más destacable es, por tanto, la combinación de destilación de un modelo vision-language para generar anotaciones automáticas y el entrenamiento de un detector extremadamente compacto, con capacidad de ejecución en CPU.

## Capacidades

- Localiza la clase `bowl` en imágenes de cámara de muñeca.
- Devuelve un keypoint por imagen, correspondiente al píxel donde se estima que está el tazón.
- Inferencia eficiente en CPU, con una latencia de aproximadamente 35 ms por frame.
- Peso reducido: 5,6 MB en formato `.pt` y 11 MB en formato `.onnx`.
- Error medio de 10,1 píxeles en episodios de evaluación excluidos del entrenamiento.
- Operación estable con el umbral de confianza `conf=0.05`; por encima de este punto todas las detecciones son fiables.
- Modelo exclusivamente visual, no soporta tool calling, agentes ni generación de texto.
- Capacidad multilingüe: no aplica, al no ser un modelo de lenguaje.
- Integración sencilla con el ecosistema de Ultralytics YOLO y exportación a ONNX para despliegue.

## Casos de uso

- Manipulación robótica de tazones: el modelo se integra en el bucle de percepción de un brazo robótico para localizar el tazón en la imagen de la cámara de muñeca y guiar el agarre, sin necesidad de anotación manual de datos.
- Robots móviles con hardware limitado: gracias a su tamaño de 5,6 MB y a su ejecución en CPU a 35 ms por frame, puede desplegarse en robots equipados con procesadores modestos o sin aceleración GPU.
- Cocina autónoma: en un entorno de cocina con tazones sobre una mesa, el modelo puede servir como componente de percepción para tareas de recogida, lavado o preparación de alimentos.
- Sistemas de visión en tiempo real con requisitos de latencia: la latencia de 35 ms permite su uso en aplicaciones de control que necesitan respuestas a una frecuencia cercana a 28 fotogramas por segundo.
- Investigación en destilación de modelos: sirve como ejemplo práctico de cómo un vision-language model puede generar anotaciones para entrenar un detector pequeño y especializado, eliminando la dependencia de etiquetado humano.
- Despliegue en entornos de producción con ONNX: la exportación a ONNX permite ejecutar el modelo mediante ONNX Runtime en plataformas robóticas, brókers ROS o servicios perimetrales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo. La model card del autor reporta las siguientes métricas de evaluación:

| Metrica | Valor |
|---|---|
| Error medio en episodios held-out | 10,1 px |
| Error de un predictor constante | 190,8 px |
| Mejora frente al predictor constante | 18,8x |
| Recall contra etiquetas del profesor | aproximadamente 52 % |
| Error p90 en detecciones por encima del umbral de confianza | 30 px |
| Latencia en CPU | 35 ms/frame |

El autor indica que la cifra de recall subestima el rendimiento real, ya que las detecciones fallidas corresponden a frames sin tazón, donde el profesor alucinó un objeto inexistente y el estudiante, de forma deseable, se negó a detectarlo.

## Requisitos de hardware

- VRAM estimada: no disponible, aunque por su tamaño de apenas 5,6 MB no requiere una cantidad significativa de memoria de GPU. El modelo está diseñado y evaluado para ejecutarse en CPU.
- GPU recomendadas: no disponible; no se necesita ninguna GPU para el uso previsto.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe sin problemas en cualquier GPU de consumo, pero no es necesario para la inferencia.
- Opciones de despliegue: puede utilizarse con la librería Ultralytics YOLO o mediante ONNX Runtime. No se mencionan integraciones concretas con vLLM, llama.cpp u otros servidores de inferencia.
- Latencia estimada: aproximadamente 35 ms por frame en CPU, equivalente a unos 28 fotogramas por segundo.

## Comparativa con modelos similares

No se han encontrado modelos comparables de la misma categoría en la información disponible. El único punto de comparación interno es el predictor constante, que sirve como línea base y frente al cual el modelo es 18,8 veces más preciso:

| Modelo | Error medio |
|---|---|
| Predictor constante | 190,8 px |
| ebim-bowl-pointer | 10,1 px |

## Limitaciones y advertencias

- El modelo solo reconoce tazones (`bowl`). Las demostraciones de entrenamiento contienen exclusivamente agarres de tazones, por lo que no hay datos para aprender a detectar tazas, platos u otros objetos.
- El recall contra las etiquetas del profesor es de aproximadamente un 52 %, una cifra que puede parecer baja, pero que refleja el comportamiento deseado de rechazar frames donde el profesor alucinó un tazón inexistente.
- El entrenamiento se realizó en una única celda de trabajo, con 19 episodios y 19 disposiciones de escena. Existe un riesgo elevado de sobreadaptación a ese entorno concreto.
- El umbral de confianza recomendado es `conf=0.05`. Por encima de este valor todas las detecciones son fiables, pero por debajo se gana recall a costa de introducir ruido.
- La licencia es `other`, lo que implica condiciones no especificadas en la model card. Es necesario revisar los términos antes de un uso comercial.
- No es un modelo de lenguaje ni multimodal en el sentido habitual; no puede procesar texto, mantener conversaciones ni generar respuestas lingüísticas.
- No se dispone de información sobre sesgos de género, etnia o clase social, ya que la tarea es geométrica y no involucra semántica social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sush0401/ebim-bowl-pointer
- Perfil del autor: https://huggingface.co/sush0401
- Lista de modelos del autor: https://huggingface.co/sush0401/models
