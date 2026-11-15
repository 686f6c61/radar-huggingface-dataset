# Wizzas/FER2013-Project

## Resumen

FER2013-Project es un repositorio de codigo y artefactos de un proyecto de reconocimiento de expresiones faciales sobre el conjunto de datos FER2013, publicado por el usuario Wizzas. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un paquete que contiene cuatro clasificadores de imagenes (una CNN propia y tres modelos de transfer learning: VGG16, MobileNetV2 y ResNet50) entrenados para clasificar rostros en siete emociones (enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa). El repositorio incluye los cuadernos de entrenamiento, los pesos exportados a ONNX en float32 y una demo web estatica que ejecuta la inferencia en el navegador del visitante.

El problema que aborda es el clasico benchmark de reconocimiento de emociones faciales sobre imagenes de 48x48 pixeles en escala de grises (tratadas como RGB de tres canales), normalizadas dividiendo por 255. La relevancia practica es limitada en terminos de investigacion de vanguardia, pero resulta util como material docente y como ejemplo de despliegue de modelos pequenos en el navegador mediante ONNX Runtime Web, sin necesidad de servidor de inferencia.

El modelo con mejor precision reportada es la CNN propia, con un 66,00 % de exactitud en test, por delante de ResNet50 (61,23 %), MobileNetV2 (60,34 %) y VGG16 (60,13 %). Estas cifras proceden del informe del proyecto (tabla 4.2.1, pagina 60) y no de una reevaluacion de la aplicacion desplegada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN propia y tres redes de transfer learning (VGG16, MobileNetV2, ResNet50) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 48x48x3) |
| Tipos de cuantizacion | no disponible (exportaciones en float32 ONNX) |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | MIT (segun el badge de la model card) |
| Formato de pesos | Keras (.keras) y ONNX float32 (.onnx) |

## Arquitectura y entrenamiento

El proyecto compara cuatro enfoques sobre FER2013: una red convolucional disenada especificamente para la tarea y tres arquitecturas preentrenadas adaptadas mediante transfer learning (VGG16, MobileNetV2 y ResNet50). Todas reciben un recorte facial de 48x48 pixeles con tres canales, normalizado por 255, y devuelven siete probabilidades softmax correspondientes a las siete expresiones. El conjunto de test empleado consta de 7.178 imagenes.

No se detallan en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion exacta del dataset mas alla de FER2013, ni si se aplicaron tecnicas de aumento de datos, regularizacion o ajuste fino selectivo de capas. Tampoco se especifica el proceso de optimizacion ni hiperparametros. Los cuatro checkpoints de Keras se exportaron a ONNX float32 sin reentrenamiento, y cada exportacion se valido numericamente contra el modelo original sobre nueve entradas (documentado en `project_demo/VALIDATION.md`). La validacion de conversion no constituye una nueva cifra de exactitud sobre FER2013.

## Capacidades

- Clasificacion de expresiones faciales en siete clases: enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa.
- Procesamiento de imagenes de entrada de 48x48 pixeles con tres canales, normalizadas por 255.
- Inferencia en navegador mediante ONNX Runtime Web, sin servidor de inferencia ni TensorFlow en el cliente.
- Deteccion de rostros en webcam en directo con dibujo de cajas, etiqueta de expresion y puntuacion de confianza (demo web).
- Seleccion de una cara concreta cuando se detectan varias en la escena.
- Perfil de probabilidad de las siete clases para cada rostro analizado.
- Conmutacion entre los cuatro modelos entrenados dentro de la interfaz.
- Generacion de visualizaciones Grad-CAM (en los cuadernos de investigacion, no en la demo).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un clasificador de imagenes.

## Casos de uso

- Demo educativa de despliegue en navegador: el modelo ONNX de la CNN propia (5,25 MB) se sirve como fichero estatico y se ejecuta con ONNX Runtime Web en el cliente, lo que permite demostrar inferencia sin backend y con coste de servidor minimo.
- Analisis de expresiones en tiempo real con webcam: la demo usa deteccion de rostros y clasifica cada cara detectada, util para prototipos de interaccion persona-maquina o accesibilidad.
- Material docente de vision por computador: los cuadernos (`CNN.ipynb`, `vgg16.ipynb`, `mobilenetV2.ipynb`, `resnet.ipynb`) permiten reproducir el entrenamiento y comparar una CNN propia frente a transfer learning con VGG16, MobileNetV2 y ResNet50.
- Evaluacion de tecnicas de interpretabilidad: el proyecto incluye matrices de confusion, informes de clasificacion por clase, curvas ROC uno-contra-resto y mapas Grad-CAM, utiles para estudiar el comportamiento del modelo por clase.
- Prototipo de analisis de emociones en imagenes subidas: la interfaz acepta JPG, JPEG, PNG y WEBP y devuelve el perfil de siete probabilidades, adecuado para validar pipelines de clasificacion antes de invertir en modelos mayores.
- Comparativa de coste y precision en despliegue: la diferencia de tamano entre MobileNetV2 (10,36 MB) y ResNet50 (96,31 MB) con una precision de 60,34 % frente a 61,23 % permite ilustrar el compromiso entre tamano de artefacto y exactitud en entornos con ancho de banda limitado.
- Referencia para integracion ONNX en produccion ligera: el flujo de exportacion y validacion numerica documentado sirve como plantilla para convertir checkpoints de Keras a ONNX y verificar su equivalencia antes del despliegue.

## Benchmarks y rendimiento

Resultados reportados en el informe del proyecto (tabla 4.2.1, pagina 60), sobre 7.178 imagenes de test de FER2013:

| Modelo | Enfoque | Exactitud en test reportada | Tamano ONNX |
|---|---|---:|---:|
| CNN propia | Red convolucional propia | 66,00 % | 5,25 MB |
| ResNet50 | Transfer learning residual | 61,23 % | 96,31 MB |
| MobileNetV2 | Transfer learning ligero | 60,34 % | 10,36 MB |
| VGG16 | Transfer learning convolucional | 60,13 % | 60,46 MB |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se detallan metricas de latencia o throughput de la demo en navegador.

## Requisitos de hardware

- Inferencia en cliente: los modelos ONNX se ejecutan en el navegador del visitante mediante ONNX Runtime Web, por lo que no se requiere GPU en servidor.
- Memoria necesaria: el modelo mas pequeno (CNN propia, 5,25 MB) es apto para cualquier dispositivo con navegador moderno; el mayor (ResNet50, 96,31 MB) requiere descargar ese artefacto antes de la primera inferencia.
- GPU recomendadas: no aplica para la demo web; para reentrenamiento se emplearon TensorFlow/Keras y no se especifican GPUs concretas en la informacion disponible.
- Cabe en GPU de consumo: si, cualquiera de los cuatro modelos es lo suficientemente pequeno como para ejecutarse en GPUs de consumo, aunque no se aportan cifras de VRAM.
- Opciones de despliegue: ONNX Runtime Web (demo estatica), servidor HTTP estatico local (`py -m http.server 8000 --directory .\project_demo`), Render y Hugging Face Spaces; el script de escritorio `main.py` usa OpenCV con el detector Haar `haarcascade_frontalface_default.xml`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Exactitud en FER2013 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FER2013-Project (CNN propia) | no disponible | 48x48x3 | 66,00 % | MIT | Hugging Face y GitHub |
| FER2013-Project (ResNet50) | no disponible | 48x48x3 | 61,23 % | MIT | Hugging Face y GitHub |
| FER2013-Project (MobileNetV2) | no disponible | 48x48x3 | 60,34 % | MIT | Hugging Face y GitHub |
| FER2013-Project (VGG16) | no disponible | 48x48x3 | 60,13 % | MIT | Hugging Face y GitHub |

No se dispone en la informacion proporcionada de otros modelos comparables de reconocimiento de expresiones faciales con los que contrastar parametros, contexto o rendimiento. Los cuatro modelos del propio repositorio constituyen la unica comparativa documentada.

## Limitaciones y advertencias

- Exactitud moderada: el mejor resultado es 66,00 % en test, lo que implica un 34 % de error en la clasificacion de siete clases; no es adecuado para decisiones sensibles sin supervision humana.
- Sesgos del dataset: FER2013 es conocido por desequilibrios de clase y sesgos demograficos; no se documenta en la informacion disponible ningun analisis de sesgo por genero, edad o etnia.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero si existe riesgo de falsos positivos y clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Limitaciones de entrada: solo acepta recortes faciales de 48x48 pixeles; la calidad del recorte y la deteccion previa condicionan fuertemente el resultado.
- Restricciones de licencia: la model card indica licencia MIT, pero el campo de licencia de Hugging Face aparece como no disponible; conviene verificar los terminos antes de uso comercial.
- Caveat de despliegue: las cifras de exactitud provienen del informe y no de una reevaluacion de la aplicacion desplegada; la validacion ONNX solo confirma equivalencia numerica, no precision.
- Privacidad: la inferencia de imagen y camara se realiza en el navegador y solo los mensajes del formulario de contacto se envian a Formspree, segun la model card.
- Idiomas: no aplica, pero la documentacion y la interfaz estan en ingles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Wizzas/FER2013-Project
- Codigo fuente en GitHub: https://github.com/WAYTECHG/FER2013-Project
- Demo en Render: https://fer2013-project.onrender.com/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Wizzas/Face-Expression-Recognition
- Figuras de resultados: https://huggingface.co/Wizzas/FER2013-Project/blob/main/project_demo/assets/results/
- Validacion de exportacion ONNX: https://huggingface.co/Wizzas/FER2013-Project/blob/main/project_demo/VALIDATION.md
