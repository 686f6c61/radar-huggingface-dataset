# zeta0707/act_hello26_merged

## Resumen

El modelo `zeta0707/act_hello26_merged` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario zeta0707 (ChangWhan Lee) y publicada en Hugging Face bajo la librería LeRobot. ACT es una técnica de aprendizaje por imitación que, en lugar de predecir una única acción por paso, genera secuencias completas de acciones (chunks) a partir de observaciones, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo concreto ha sido entrenado con el dataset `zeta0707/hello26_merged`, que contiene demostraciones teleoperadas, y está pensado para ser utilizado con robots de bajo coste como el SO-100.

Con 51,68 millones de parámetros, es un modelo compacto que cabe en GPUs de consumo y puede ejecutarse en tiempo real. Su relevancia radica en que demuestra cómo un transformer relativamente pequeño puede aprender políticas de control efectivas a partir de datos de demostración, y sirve como punto de partida para investigadores y desarrolladores que trabajan con LeRobot. La licencia Apache 2.0 permite su uso comercial sin restricciones significativas. No se dispone de información sobre la longitud de contexto, los idiomas soportados (al ser un modelo de robótica, no procesa lenguaje natural) ni sobre cuantizaciones alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) - transformer con codificador y decodificador |
| Parametros totales | 51.680.908 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (modelo de robótica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura basada en transformers que aprende a predecir una secuencia de acciones futuras (un chunk) a partir de una observación actual. El modelo se compone de un codificador que procesa las observaciones (imágenes y estados del robot) y un decodificador autorregresivo que genera el chunk de acciones. Esta formulación reduce el error de acumulación típico de los métodos paso a paso y permite una ejecución más suave.

El entrenamiento se realizó mediante aprendizaje por imitación supervisado sobre el dataset `zeta0707/hello26_merged`, que contiene demostraciones teleoperadas. No se especifica el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de refuerzo o preferencias humanas. El modelo fue entrenado y subido al Hub utilizando la librería LeRobot, que proporciona herramientas estandarizadas para el entrenamiento, evaluación y despliegue de políticas robóticas. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico por imitación: predice secuencias de acciones (chunks) para tareas de manipulación, como alcanzar, agarrar o mover objetos.
- Aprendizaje a partir de demostraciones: puede replicar comportamientos observados en datos teleoperados.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de LeRobot, incluyendo robots SO-100.
- Ejecución en tiempo real: gracias a su tamaño reducido, puede operar con baja latencia en hardware de consumo.
- No dispone de capacidades de lenguaje natural, tool calling, agentes, visión general ni multilingüismo, ya que está especializado en control motor.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede ejecutar secuencias de manipulación como apilar piezas o ensamblar componentes, reduciendo la intervención humana.
- Prototipado de robots de bajo coste: al ser ligero y compatible con SO-100, es adecuado para montajes educativos o de investigación con presupuesto limitado.
- Investigación en aprendizaje por imitación: sirve como baseline para comparar nuevas arquitecturas o métodos de entrenamiento en robótica.
- Teleoperación asistida: puede complementar la teleoperación humana sugiriendo o completando acciones parciales.
- Evaluación de políticas en entornos simulados: se puede integrar en pipelines de evaluación con LeRobot para medir tasas de éxito en tareas específicas.
- Demostraciones en ferias y eventos: el nombre "makerfaire26" sugiere su uso en demostraciones públicas, donde la robustez y la rapidez de despliegue son clave.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general. Para evaluar su rendimiento sería necesario ejecutar pruebas específicas de robótica (tasa de éxito en episodios, precisión de agarre, etc.) con el entorno y el robot correspondientes.

## Requisitos de hardware

- VRAM estimada: los pesos del modelo ocupan aproximadamente 0,2 GB en safetensors, por lo que caben en cualquier GPU con al menos 1 GB de VRAM. Sin embargo, la inferencia con imágenes y estados requiere memoria adicional para activaciones; se estima que una GPU con 4-6 GB es suficiente.
- GPU recomendadas: cualquier GPU NVIDIA moderna (GTX 1060, RTX 2060, RTX 3060, RTX 4090) o incluso CPU para pruebas lentas. Para entrenamiento se recomienda al menos una RTX 3060 o superior.
- Compatibilidad con consumer GPU: sí, es un modelo pequeño que se ejecuta sin problemas en hardware de consumo.
- Opciones de despliegue: LeRobot (PyTorch), posiblemente exportable a ONNX o TensorRT, aunque no se documenta. No se mencionan vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se proporcionan datos, pero por el tamaño se espera una inferencia en el orden de milisegundos en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros modelos ACT entrenados con LeRobot en el Hub, pero no se han encontrado datos concretos de rendimiento o especificaciones para establecer una comparación rigurosa. Se recomienda consultar el repositorio de LeRobot para ver otras políticas similares.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan, pero al ser un modelo entrenado con un dataset específico, puede no generalizar a entornos o robots distintos de los utilizados en el entrenamiento.
- Riesgo de alucinación: no aplica, ya que no genera texto, pero puede producir acciones erróneas si las observaciones difieren de las de entrenamiento.
- Limitaciones de contexto: al ser un modelo de robótica, su "contexto" se limita a la ventana de observación y al chunk de acciones; no se especifica su longitud.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de licencia.
- Caveat para producción: el modelo no ha sido validado en entornos reales más allá de las demostraciones del autor; se recomienda una evaluación exhaustiva antes de su despliegue en aplicaciones críticas.
- Dependencia del dataset: el dataset `hello26_merged` no está documentado en detalle, por lo que se desconoce la variabilidad de las demostraciones y su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zeta0707/act_hello26_merged
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/zeta0707
