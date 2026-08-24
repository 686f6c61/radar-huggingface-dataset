# ted88168/pi05_so101_multicolor_master_v1

## Resumen

Este modelo es un fine-tune de Pi0.5, un Vision-Language-Action (VLA) desarrollado por Physical Intelligence, adaptado al ecosistema LeRobot de Hugging Face. El autor, ted88168, ha entrenado el modelo base `lerobot/pi05_base` sobre un dataset propio de 243 episodios de manipulación robótica, en el que un robot SO-101 debe recoger bloques de colores (rojo, verde, azul) y colocarlos en una caja. El resultado es un policy de control end-to-end que mapea observaciones visuales y estado del robot a acciones de 6 grados de libertad.

La relevancia de este modelo radica en demostrar el fine-tuning de un VLA de última generación sobre un dataset relativamente pequeño y específico, utilizando herramientas open source como LeRobot. Con 4.143 millones de parámetros, Pi0.5 ofrece capacidades de generalización a entornos nuevos, y este fine-tune particular lo especializa en una tarea concreta de pick-and-place. El modelo se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptacion de Pi0.5 |
| Parametros totales | 4.143.404.816 (4,14B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors, sin GGUF u otros formatos) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Pi0.5 es un VLA que co-entrena con datos heterogeneos de multiples plataformas roboticas, evolucionando el modelo Pi0 original para mejorar la generalizacion a entornos y situaciones no vistas durante el entrenamiento. La implementacion en LeRobot se adapta del repositorio OpenPI de Physical Intelligence. El modelo base `lerobot/pi05_base` proporciona las representaciones visuales y de lenguaje, y este fine-tune ajusta el policy para la tarea especifica de manipulacion de bloques de colores.

El entrenamiento se realizo con 15.000 pasos, batch size de 40, optimizador AdamW con learning rate de 2.5e-05 y semilla 1000, utilizando la version 0.6.2 de LeRobot. Las observaciones consisten en tres imagenes RGB de 224x224 (camara base, muñeca izquierda y muñeca derecha) y un vector de estado de 32 dimensiones. La salida es una accion de 6 dimensiones, correspondiente a la posicion y orientacion del efector final. No se emplearon tecnicas de RLHF ni DPO; se trata de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico end-to-end: genera acciones de 6 grados de libertad a partir de observaciones visuales y estado del robot.
- Tareas de pick-and-place con objetos de colores especificos (rojo, verde, azul) sobre una superficie.
- Generalizacion a nuevas posiciones y condiciones dentro del dominio de la tarea, gracias a la base Pi0.5.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots SO-101.
- No soporta tool calling, agentes conversacionales ni razonamiento multi-paso en el sentido de los LLM; es un policy de control puro.
- Capacidades multilingue: no aplica, al ser un modelo de robotica.

## Casos de uso

- Automatizacion de tareas de clasificacion y empaquetado en entornos controlados: el modelo puede gestionar la recogida y colocacion de piezas de colores en una caja, util en lineas de montaje o laboratorios de investigacion.
- Investigacion en aprendizaje por imitacion y VLA: sirve como punto de partida para estudiar el fine-tuning de modelos grandes con datasets pequeños.
- Prototipado de robots de bajo coste: el robot SO-101 es de codigo abierto y economico, permitiendo experimentar con VLA sin hardware caro.
- Educacion en robotica: permite a estudiantes y desarrolladores desplegar un policy de manipulacion con pocos recursos.
- Benchmarking de VLA: puede utilizarse como referencia para comparar tecnicas de fine-tuning o arquitecturas de control.
- Integracion en pipelines de robotica con LeRobot: el modelo se puede cargar y ejecutar directamente con las herramientas CLI de LeRobot, facilitando su uso en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion en robot real. No se proporcionan metricas como tasa de exito, MMLU, HumanEval u otras.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 4,14B parametros. En precision bf16 (formato habitual en safetensors), el peso ocupa aproximadamente 8,3 GB, por lo que se recomienda al menos 12 GB de VRAM para inferencia con margen.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o similares con 16 GB o mas de VRAM.
- En consumer GPU: si, cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) sin problemas. En GPUs de 12 GB (como RTX 3060) podria ser ajustado.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo en PyTorch. No es compatible con vLLM, llama.cpp u Ollama, ya que no es un LLM generativo.
- Latencia y throughput: no disponible. Depende del hardware y de la optimizacion del entorno de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| Pi0.5 (base) | 4,14B | no disponible | VLA generalista | Apache-2.0 |
| OpenVLA | 7B | 2048 tokens | VLA generalista | MIT |
| RT-2 (Google) | 55B | 2048 tokens | VLA generalista | propietaria |

Este modelo es un fine-tune de Pi0.5, por lo que hereda sus capacidades base, pero esta especializado en la tarea de pick-and-place con bloques de colores. No se han publicado comparaciones directas con otros VLA en este dataset.

## Limitaciones y advertencias

- Dataset de entrenamiento pequeno (243 episodios) que puede limitar la generalizacion a variaciones no vistas (iluminacion, posiciones extremas, objetos similares).
- Tarea restringida a bloques de tres colores y una caja; no es un policy generalista.
- No se han reportado evaluaciones en robot real, por lo que el rendimiento en el mundo fisico es incierto.
- Dependencia del hardware especifico del robot SO-101 y de la calibracion de camaras.
- Riesgo de alucinacion o comportamientos inesperados en situaciones fuera de distribucion, comun en VLA.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Pi0.5 puede tener restricciones adicionales en su implementacion original (aunque OpenPI es open source).
- No se especifican sesgos, pero al ser un modelo de robotica, los sesgos se manifiestan en el comportamiento fisico, no en texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ted88168/pi05_so101_multicolor_master_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/ted88168/so101_multicolor_master_v1
- Paper de Pi0.5: https://arxiv.org/abs/2504.16054
- Blog de Physical Intelligence sobre Pi0.5: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://www.openpi.net/english.html
- Documentacion de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
