# Sungah/omx_1024_boxaug_act

## Resumen

OMX BoxAug ACT es un modelo de politica robotica basado en la arquitectura ACT (Action Chunking with Transformers) de LeRobot, desarrollado por el usuario Sungah. Resuelve una tarea concreta de manipulacion: recoger una caja y apilarla sobre otra con un robot OMX. Su particularidad no es el modelo en si, sino el enfoque experimental de entrenamiento: se ha entrenado con datos sinteticos generados por aumento de datos, sustituyendo visualmente las cajas originales por otras de distinta apariencia sobre las mismas trayectorias reales de robot.

El objetivo declarado del autor es comprobar empiricamente si "generar datos sinteticos y usarlos ayuda" en el aprendizaje por imitacion. Para ello parte de 10 demostraciones reales (10.787 frames) y genera 260 episodios sinteticos adicionales (273.000 frames) variando unicamente la textura y forma de las cajas, manteniendo intactas las acciones, articulaciones y corriente del gripper. El resultado es un conjunto de 270 episodios y 283.695 frames.

El repositorio incluye tres checkpoints (5, 10 y 15 epocas), scripts de despliegue para robot real (Docker y nativo), gestion de camaras, calibracion y un tipo de robot personalizado (`omx_follower_grip`) que incorpora la corriente del gripper como septima dimension de estado. No se han publicado tasas de exito en robot real; el autor indica explicitamente que la comparacion entre checkpoints queda pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), encoder visual ResNet18 preentrenado en ImageNet, entrenado desde cero el resto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observacion a 30 fps) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision original) |
| Idiomas soportados | no aplica (modelo de robotica, sin capacidades linguisticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria lerobot 0.6.1) |

Otros datos tecnicos relevantes: entrada de dos camaras (`top` y `wrist`) a 640x480, estado de 7 dimensiones (6 articulaciones + corriente del gripper en mA), frecuencia de 30 fps, batch de entrenamiento 16, 1 epoca = 17.731 pasos. Checkpoints: `act_boxaug_grip_ep05` (88.655 pasos), `act_boxaug_grip_ep10` (177.310 pasos) y `act_boxaug_grip_ep15` (265.965 pasos). Tamano del repositorio: 0,7 GB.

## Arquitectura y entrenamiento

ACT es un transformer que predice trozos de acciones (action chunks) a partir de observaciones visuales y de estado, en lugar de una accion por paso. En este caso el encoder visual es un ResNet18 con pesos de ImageNet y el resto de la red se entrena desde cero. La entrada combina dos flujos de imagen (camara superior y de muneca) con un vector de estado de 7 componentes: las 6 articulaciones del robot OMX mas la corriente presente del gripper (`Present_Current`, en mA), leida en cada paso por `omx_grip_robot.py`. La salida se ejecuta en bloques de `N_ACTION_STEPS` (50 por defecto en CPU, reducible a 10 en GPU) con opcion de ensemble temporal (promedio de predicciones solapadas cada k pasos).

El entrenamiento se apoya en un dataset aumentado: 10 demostraciones reales (10.787 frames) en las que se coge la caja con forma de corazon A desde encima de B y se apila; 240 episodios sinteticos generados a partir de esas 10 demostraciones sustituyendo las dos cajas por 24 combinaciones distintas de cajas (258.888 frames); y 20 episodios sinteticos derivados de las demostraciones 10-14 (caja rosa de lunares "love you") con las cajas reemplazadas por A, B o W (14.020 frames). En todos los casos las acciones, articulaciones y corriente del gripper son las originales; solo cambia la apariencia de las cajas en las imagenes. Las demostraciones reales 10-14 se reservan como conjunto de test, aunque el mismo patron de caja aparece en los sinteticos de entrenamiento. No se menciona RLHF, DPO ni ninguna fase de ajuste por refuerzo.

## Capacidades

- Generacion de acciones de manipulacion robotica (chunks de movimiento) condicionadas por dos vistas de camara y estado articular.
- Control de pinza con realimentacion de corriente: el modelo recibe la corriente del gripper como septima dimension de estado, lo que le permite adaptar la presion de agarre.
- Generalizacion visual a distintas apariencias de caja (corazon A y B, rosa de lunares con dos patrones, blanca "FOR YOU" con cuerpo negro) gracias al aumento de datos.
- Ejecucion en bucle cerrado a 30 fps con horizonte de accion configurable (`N_ACTION_STEPS`).
- Ensemble temporal opcional (media de predicciones solapadas) para suavizar la trayectoria.
- Limite de seguridad de desplazamiento por paso (`MAX_RELATIVE_TARGET`, por defecto 10).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo de politica visomotora, no un LLM.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- **Investigacion en aumento de datos para imitacion robotica**: el proposito declarado del modelo es servir de banco de pruebas para medir si el aumento sintetico de apariencia mejora la robustez frente a cambios de objeto. Se comparan los tres checkpoints (5, 10 y 15 epocas) sobre el mismo montaje fisico y se registra la tasa de exito por tipo de caja.
- **Apilado de cajas en laboratorio con robot OMX**: la tarea concreta es coger la caja A de encima de B y apilar B sobre A (o viceversa segun la variante). Encaja en entornos de investigacion con robot OMX y camaras `top` y `wrist` ya calibradas.
- **Validacion de robustez a cambios de apariencia**: al haberse entrenado con 24 combinaciones de cajas, permite probar en robot real si el modelo mantiene el exito cuando se cambia la caja por una de distinta textura o color, algo que un modelo entrenado solo con las originales no permite evaluar.
- **Prototipado rapido de pipelines LeRobot**: el repositorio incluye scripts listos (`run.sh`, `run_native.sh`, `omx_rollout.py`, `config.env`) que sirven como plantilla para desplegar cualquier politica ACT en un robot OMX con calibracion, deteccion de puerto y de camaras.
- **Control de agarre con realimentacion de corriente**: el tipo de robot `omx_follower_grip` y la inclusion de `Present_Current` en el estado permiten experimentar con politicas que ajustan la fuerza de la pinza en funcion de la corriente medida, util en tareas de agarre de objetos rigidos.
- **Despliegue en equipos sin GPU**: con inferencia en CPU (0,6-1,0 s por prediccion en 8 nucleos) y `N_ACTION_STEPS=50`, el modelo es viable en un PC de laboratorio sin acelerador, lo que facilita pruebas repetidas en banco.
- **Evaluacion comparativa de checkpoints**: el diseno con tres niveles de entrenamiento (88k, 177k y 265k pasos) permite estudiar el efecto del sobreentrenamiento en tareas de imitacion con datos sinteticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la tasa de exito en robot real "aun no se ha medido" y que la comparacion entre checkpoints debe hacerse en el propio robot. Los unicos datos de rendimiento disponibles son de inferencia: 0,6-1,0 s por prediccion en CPU de 8 nucleos con `N_ACTION_STEPS=50`; en GPU se recomienda bajar a `N_ACTION_STEPS=10` para mejorar la reactividad. No hay cifras de MMLU, HumanEval, GSM8K ni equivalentes, que no aplican a este tipo de modelo.

## Requisitos de hardware

- **VRAM estimada**: no disponible con precision; el repositorio ocupa 0,7 GB e incluye tres checkpoints ACT con encoder ResNet18, por lo que cada checkpoint individual es del orden de cientos de MB. La inferencia en CPU esta soportada de serie (`DEVICE=cpu` por defecto).
- **GPU recomendadas**: cualquier GPU NVIDIA con CUDA disponible; el autor no especifica modelos concretos. Para reducir `N_ACTION_STEPS` a 10 y usar ensemble temporal se recomienda GPU.
- **Consumer GPU**: si, el modelo es lo bastante pequeno para caber en GPUs de consumo; no se dispone de cifras de VRAM exactas.
- **Opciones de despliegue**: LeRobot 0.6.1 (nativo) o imagen Docker incluida (`Dockerfile` con torch CPU). Scripts `run.sh` (Docker) y `run_native.sh` (nativo) con subcomandos `check`, `find-port`, `find-cameras`, `calibrate` y `rollout`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: 0,6-1,0 s por prediccion en CPU de 8 nucleos; con `N_ACTION_STEPS=50` esto implica aproximadamente una prediccion cada 50 pasos de accion a 30 fps (unos 1,67 s de ejecucion por prediccion). En GPU, con `N_ACTION_STEPS=10`, la reactividad mejora pero no se dan cifras exactas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OMX BoxAug ACT (este) | ACT + ResNet18 | no disponible | 2 camaras 640x480 + estado 7D a 30 fps | Apache 2.0 | Hugging Face (Sungah/omx_1024_boxaug_act) |
| ACT original (LeRobot) | ACT + ResNet18 | no disponible | Configurable por tarea | Apache 2.0 | Repositorio LeRobot de Hugging Face |
| Diffusion Policy | Politica por difusion | no disponible | Configurable por tarea | MIT (implementacion de referencia) | Repositorios de investigacion |
| Pi0 / pi0-FAST | VLA (vision-language-action) | no disponible en la informacion | Entrada multimodal con instrucciones en lenguaje | no disponible | Hugging Face (Physical Intelligence) |

La comparacion cuantitativa de rendimiento no esta disponible: no hay benchmarks publicados para este modelo ni cifras de exito en robot real. La diferencia principal frente a ACT estandar es el uso de datos sinteticos de aumento y la incorporacion de la corriente del gripper como dimension de estado; frente a Diffusion Policy y pi0, la diferencia es de escala y alcance (politica especializada en una tarea frente a modelos generalistas).

## Limitaciones y advertencias

- **Sin evaluacion en robot real**: el autor no ha medido la tasa de exito; el modelo es experimental y no debe tratarse como validado para produccion.
- **Tarea unica y muy acotada**: solo apila cajas en un montaje concreto del robot OMX; no generaliza a otras tareas ni objetos sin reentrenamiento.
- **Dependencia del montaje fisico**: la posicion y angulo de las camaras, la iluminacion y la colocacion de cajas y del robot "Pinky" deben parecerse a las del entrenamiento; el propio autor lo incluye como primer punto de la checklist de campo.
- **Fuga potencial en el conjunto de test**: las demostraciones reales 10-14 se reservan como test, pero el mismo patron de caja rosa de lunares aparece en los episodios sinteticos de entrenamiento, por lo que la evaluacion no es completamente independiente.
- **Riesgo de sobreajuste al aumento**: al haberse generado los sinteticos sustituyendo solo la apariencia de las cajas sobre trayectorias reales, el modelo puede no capturar variaciones de dinamica, friccion o posicion no presentes en las demostraciones originales.
- **Latencia en CPU**: con 0,6-1,0 s por prediccion en CPU, la reaccion es lenta; el autor recomienda `N_ACTION_STEPS=50` en CPU y reducir a 10 solo con GPU.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo depende de LeRobot 0.6.1 y de pesos ResNet18 de ImageNet, cuyas condiciones deben verificarse por separado.
- **Sin capacidades linguisticas ni multimodales generales**: no es un LLM ni un VLA; no acepta instrucciones en lenguaje natural.
- **Seguridad fisica**: el autor recomienda empezar con `MAX_RELATIVE_TARGET=10` y tener el robot junto a una persona capaz de cortar la alimentacion de inmediato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sungah/omx_1024_boxaug_act
- Dataset de entrenamiento: https://huggingface.co/datasets/Sungah/omx_1024_test_jihyeok_success
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentacion de ACT en LeRobot: https://huggingface.co/docs/lerobot/act
- Paper original de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Paper de Diffusion Policy (alternativa comparable): https://arxiv.org/abs/2303.04137
