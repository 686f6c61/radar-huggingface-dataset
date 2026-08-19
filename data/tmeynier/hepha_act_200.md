# tmeynier/hepha_act_200

## Resumen

`tmeynier/hepha_act_200` es un modelo de robótica basado en el método ACT (Action Chunking with Transformers), entrenado mediante aprendizaje por imitación con el framework LeRobot de Hugging Face. El modelo está diseñado para controlar un robot simulado tipo `hepha_mujoco` y ejecuta tareas de manipulación como abrir cajones, recoger un cubo y colocarlo dentro de uno de ellos. Se entrenó con 200 episodios teleoperados de un dataset propio (`tmeynier/hepha_mujoco_ik`), con un total de 446.794 fotogramas a 30 FPS.

La arquitectura ACT, publicada en el paper arXiv:2304.13705, predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y precisión en tareas de manipulación. Con 51,7 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que demuestra cómo aplicar transformers al control robótico de bajo nivel con un pipeline reproducible basado en LeRobot, aunque no se han publicado evaluaciones formales sobre el robot real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.692.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la ventana de acciones, no se especifica) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de control robotico, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), un metodo de aprendizaje por imitacion que procesa observaciones visuales y de estado para generar secuencias de acciones. ACT utiliza un transformer codificador-decodificador con atencion cruzada, donde el codificador procesa las imagenes de la camara y el estado del robot, y el decodificador autoregresivo predice un chunk de acciones (tipicamente de 10 a 100 pasos) que se ejecuta de forma abierta antes de volver a consultar el estado. Esta estrategia reduce la acumulacion de errores y mejora la suavidad del movimiento.

El entrenamiento se realizo con LeRobot version 0.6.1 sobre un dataset de 200 episodios teleoperados en simulacion Mujoco, con 446.794 fotogramas a 30 FPS. La configuracion de entrenamiento incluye 100.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y seed 1000. No se menciona el uso de RLHF ni DPO; es puramente aprendizaje por imitacion supervisado. El modelo consume como entradas: estado del robot (vector de 15 dimensiones), imagen de la camara principal (256x256 RGB) y estado del entorno (vector de 9 dimensiones). La salida es un vector de accion de 15 dimensiones.

## Capacidades

- Control robotico de manipulacion: ejecuta tareas de abrir cajones, recoger objetos y colocarlos en posiciones especificas.
- Aprendizaje por imitacion: reproduce comportamientos teleoperados con alta fidelidad en simulacion.
- Vision por computadora integrada: procesa imagenes de una camara para percibir el estado del entorno.
- Generacion de secuencias de acciones: predice chunks de acciones para movimientos suaves y coordinados.
- Soporte de multiples tareas: entrenado en 9 variantes de la tarea (abrir cajones numerados del 1 al 9, colocar un cubo dentro y cerrar).
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo scripts de rollout y entrenamiento.

## Casos de uso

- Automatizacion de tareas repetitivas en entornos simulados: el modelo puede ejecutar secuencias de manipulacion (abrir, agarrar, colocar, cerrar) de forma autonoma, util para pruebas de concepto en robotica.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de action chunking y comparar con otros metodos como Diffusion Policy.
- Desarrollo de pipelines de robotica con LeRobot: permite validar el flujo completo de LeRobot (grabacion de datos, entrenamiento, rollout) sobre un robot simulado antes de trasladarlo a hardware real.
- Prototipado rapido de tareas de manipulacion: con solo 51,7M de parametros, se puede entrenar y ejecutar en una GPU de gama media, ideal para experimentos academicos.
- Benchmarking de algoritmos de control: al estar disponible publicamente, puede usarse como referencia para comparar nuevas arquitecturas de control robotico.
- Educacion en robotica e IA: ofrece un ejemplo concreto y reproducible de como aplicar transformers a problemas de control, con documentacion y scripts listos para usar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en robot real ni metricas de exito por tarea. El campo de evaluacion esta marcado como "No evaluation results have been provided for this policy yet". Por tanto, no se pueden presentar datos cuantitativos de rendimiento.

## Requisitos de hardware

- VRAM estimada: al tener solo 51,7M de parametros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 207 MB de pesos). Con cuantizacion a FP16 o int8, el requisito baja a unos 100 MB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una NVIDIA GTX 1050 Ti, RTX 2060 o superior ejecutara el modelo sin problemas. Tambien puede funcionar en CPU para pruebas de baja velocidad.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual, incluso en integradas con suficiente memoria compartida.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo conectan al robot simulado. Tambien puede integrarse en pipelines personalizados usando la libreria `lerobot` de Python.
- Latencia y throughput: no se han publicado mediciones. Dado el tamano del modelo, la latencia de inferencia sera de unos pocos milisegundos en GPU moderna, pero depende del entorno de simulacion y de la frecuencia de control.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tmeynier/hepha_act_200` | ACT (Transformer) | 51,7M | no disponible | Apache-2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | Diffusion (CNN/Transformer) | ~10-100M segun config | no aplica | MIT (codigo) | GitHub, proyectos asociados |
| ACT original (Zhao et al., 2023) | ACT (Transformer) | ~80M (config tipica) | no aplica | MIT (codigo) | GitHub |

Nota: la comparativa se basa en arquitecturas similares de aprendizaje por imitacion para robotica. No hay datos de rendimiento comparativo publicados para este modelo especifico. Los parametros de Diffusion Policy y ACT original varian segun la configuracion; se indican valores tipicos. La licencia de Diffusion Policy es MIT para el codigo, pero puede variar segun la implementacion.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulacion Mujoco: el comportamiento puede no transferir directamente a un robot real sin ajuste fino o domain randomization.
- Sin evaluacion publicada: no hay resultados de exito en tareas reales ni en simulacion con metricas estandarizadas, lo que limita la confianza en su rendimiento.
- Tareas limitadas: solo cubre la tarea especifica de abrir un cajon, colocar un cubo y cerrarlo, con 9 variantes de posicion de cajon. No generaliza a otras tareas de manipulacion.
- Dependencia de la camara: requiere una unica camara (head_camera) con resolucion 256x256; cambios en la iluminacion o la posicion de la camara pueden degradar el rendimiento.
- Riesgo de sobreajuste: con solo 200 episodios, el modelo puede memorizar las trayectorias de entrenamiento y fallar ante variaciones no vistas.
- Licencia Apache-2.0: permite uso comercial, pero el codigo de LeRobot y las dependencias (Mujoco) tienen sus propias licencias que deben revisarse.
- Sin soporte de lenguaje: el modelo no procesa texto ni instrucciones; las tareas estan fijadas en el entrenamiento y no se pueden cambiar en tiempo de ejecucion.

## Enlaces

- Repositorio del modelo: [tmeynier/hepha_act_200](https://huggingface.co/tmeynier/hepha_act_200)
- Paper de ACT: [Action Chunking with Transformers](https://huggingface.co/papers/2304.13705)
- Dataset de entrenamiento: [tmeynier/hepha_mujoco_ik](https://huggingface.co/datasets/tmeynier/hepha_mujoco_ik)
- LeRobot (framework): [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Documentacion de LeRobot para ACT: [https://huggingface.co/docs/lerobot/main/en/act](https://huggingface.co/docs/lerobot/main/en/act)
