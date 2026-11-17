# tianxiwei/pi05-piperx-two-color-step6000

## Resumen

pi05-piperx-two-color-step6000 es un ajuste fino del modelo base pi0.5 de Physical Intelligence, desarrollado por el usuario tianxiwei, orientado a control robotico de manipulacion. Concretamente, el modelo aprende a clasificar y depositar bloques de dos colores (rojo y azul) en sus cajas correspondientes usando un brazo robotico PiPER X. Se trata de un modelo de politica visomotora (vision-language-action) que consume imagenes RGB de dos camaras (externa y de muneca) y un vector de estado de siete valores para predecir acciones motoras.

El modelo se distribuye como un fine-tune entrenado sobre 56 demostraciones del conjunto de datos `tianxiwei/piperx-two-color-block-sorting-improved`, que cubren las cuatro combinaciones de bloques y cajas rojas y azules. La arquitectura subyacente es la de pi0.5, un modelo de accion basado en transformers con pesos derivados de Gemma, por lo que su licencia queda sujeta a los terminos de uso de Gemma.

Es relevante para la comunidad de robotica open source porque demuestra el flujo completo de adaptacion de un modelo fundacional de robotica (OpenPI) a un hardware concreto (PiPER X) con un conjunto de datos pequeno y reproducible. El repositorio ocupa 0,2 GB e incluye pesos en formato JAX/Orbax, estadisticas de normalizacion y metadatos de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action basada en pi0.5 (transformers, pesos derivados de Gemma) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | gemma-terms (Gemma Terms of Use) |
| Formato de pesos | JAX/Orbax |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base pi0.5 de Physical Intelligence, que pertenece a la familia de politicas visomotoras de OpenPI. La entrada combina imagenes RGB de dos camaras (una externa y otra montada en la muneca del robot) con un vector de estado de siete dimensiones: seis angulos articulares en radianes y la anchura del gripper en metros. La salida es una secuencia de 50 pasos de accion a 30 Hz, con acciones relativas a las articulaciones y anchura absoluta del gripper.

El entrenamiento se realizo sobre 56 demostraciones del dataset `tianxiwei/piperx-two-color-block-sorting-improved`, que cubren las cuatro combinaciones de bloques y cajas rojas y azules. No se dispone de informacion sobre el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. El repositorio incluye las estadisticas de normalizacion en la carpeta `assets` y los metadatos de variantes y convencion de acciones en `inference_metadata.json`. No se incluye el estado del optimizador.

## Capacidades

- Generacion de acciones motoras para manipulacion robotica: prediccion de 50 pasos de accion a 30 Hz con acciones relativas a articulaciones y anchura absoluta del gripper.
- Percepcion visual multimodal: procesa imagenes RGB de camara externa y de muneca.
- Clasificacion y ordenacion de objetos por color: el modelo esta especializado en depositar bloques rojos y azules en sus cajas correspondientes.
- Control de brazo robotico PiPER X con seis articulaciones y gripper.
- Inferencia compatible con el adaptador de observacion Libero de OpenPI.
- No se ha documentado soporte de tool calling, function calling, agentes multi-paso, capacidades multilingues ni modos de razonamiento explicito.

## Casos de uso

- Clasificacion de bloques por color en linea de montaje: el modelo puede recoger bloques rojos y azules y depositarlos en las cajas correctas, usando las dos camaras para localizar objetos y el vector de estado para controlar el brazo.
- Automatizacion de tareas pick-and-place con hardware PiPER X: integrable en celdas robotizadas donde se requiera manipular objetos pequenos con precision de gripper, gracias a la prediccion de acciones a 30 Hz.
- Prototipado rapido de politicas visomotoras: sirve como punto de partida para fine-tunes sobre nuevos objetos o configuraciones, ya que el flujo OpenPI permite reentrenar con pocas demostraciones (56 en este caso).
- Investigacion en aprendizaje por imitacion: util para estudiar como modelos fundacionales de robotica se adaptan a hardware de bajo coste y datasets reducidos.
- Validacion de pipelines de inferencia OpenPI: el modelo incluye metadatos de inferencia y estadisticas de normalizacion, lo que facilita probar el adaptador Libero en entornos de simulacion o reales.
- Demostraciones educativas de robotica: adecuado para talleres o cursos donde se muestre el ciclo completo de captura de datos, entrenamiento y despliegue de una politica visomotora.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano del repositorio es de 0,2 GB, pero no se especifica el numero de parametros ni el consumo de memoria en inferencia.
- GPU recomendadas: no disponible. Al ser un modelo basado en pi0.5 con pesos JAX/Orbax, se requiere un entorno compatible con JAX y OpenPI; no se detallan GPU concretas.
- Si cabe en GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante OpenPI (repositorio oficial de Physical Intelligence); el modelo usa el adaptador de observacion Libero. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La politica predice 50 pasos a 30 Hz, lo que sugiere una frecuencia de control de 30 Hz, pero no se aportan medidas de latencia real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-piperx-two-color-step6000 | no disponible | no disponible | no disponible | gemma-terms | Hugging Face (tianxiwei) |
| pi0.5 base (Physical Intelligence) | no disponible | no disponible | no disponible | gemma-terms | OpenPI (GitHub) |
| Otros fine-tunes de OpenPI | no disponible | no disponible | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento ni de parametros de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado unicamente para clasificar bloques rojos y azules en sus cajas; no generaliza a otras tareas, objetos o colores sin reentrenamiento.
- Dataset muy reducido: solo 56 demostraciones, lo que puede provocar sobreajuste y baja robustez ante variaciones de iluminacion, posicion de camara o disposicion de objetos.
- Dependencia de hardware concreto: disenado para el brazo PiPER X con seis articulaciones y gripper; no es directamente transferible a otros robots sin adaptacion.
- Licencia restrictiva: los pesos derivados de Gemma estan sujetos a los Gemma Terms of Use, que incluyen restricciones de uso; es necesario revisar `LICENSE_GEMMA.txt` y `NOTICE` antes de un uso comercial.
- Sin datos de sesgos ni de alucinacion: no se ha documentado el comportamiento del modelo fuera de distribucion ni su tasa de fallo.
- Sin soporte documentado de cuantizacion ni de despliegue en frameworks de inferencia estandar (vLLM, llama.cpp, etc.).
- No se incluye el estado del optimizador, por lo que no es posible reanudar el entrenamiento desde el checkpoint tal cual.
- Idiomas no disponibles: al ser un modelo de robotica, no se documentan capacidades linguisticas.

## Enlaces

- Hugging Face: https://huggingface.co/tianxiwei/pi05-piperx-two-color-step6000
- Dataset: https://huggingface.co/datasets/tianxiwei/piperx-two-color-block-sorting-improved
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
