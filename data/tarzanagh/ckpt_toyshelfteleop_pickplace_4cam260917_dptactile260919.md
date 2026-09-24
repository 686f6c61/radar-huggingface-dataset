# tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919

## Resumen

`tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919` es un checkpoint de politica visomotora basada en Diffusion Policy con entrada tactil, entrenado para una tarea concreta de manipulacion bimanual: coger un juguete del segundo nivel de una estanteria y colocarlo en el primero. El modelo esta asociado a un brazo robotico DexMate Vega-1 equipado con dos manos RobotEra XHand1, con teleoperacion mediante guante Meta y seguimiento de muneca Vive. No es un modelo de lenguaje ni un modelo fundacional: es un controlador de acciones de 268.343.590 parametros que mapea observaciones (4 camaras RGB y estado propioceptivo/tactil) a comandos articulares.

El checkpoint forma parte de un estudio comparativo mas amplio: 24 ejecuciones sobre la misma tarea, cruzando cuatro familias de politica (ACT, Diffusion Policy, GR00T 3B y pi-0.5) con y sin entrada tactil. Esta variante concreta es Diffusion Policy con tactil. El autor publica los resultados de error en lazo abierto sobre 16 episodios reservados y concluye que, en ese conjunto de experimentos, la entrada tactil no aporto mejoras mas alla del ruido y que GR00T obtuvo el error mas bajo en todas las tareas.

Su relevancia es acotada y muy especifica: sirve como referencia reproducible para investigacion en imitation learning bimanual, para estudiar el efecto de la senal tactil en politicas visuomotoras y como punto de partida para fine-tuning sobre nuevos datos de teleoperacion. No se ha ejecutado en hardware real segun la propia model card; todas las metricas son de error en lazo abierto, no de exito de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (generacion de acciones por difusion) con entrada visual y tactil; detalles internos de la red (U-Net/transformer, numero de pasos de denoising) no disponibles |
| Parametros totales | 268.343.590 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de decision de 16 acciones con re-observacion real cada 16 pasos |
| Tipos de cuantizacion | No declarados en la model card. El tamano del repositorio (1,1 GB para 268,3 M de parametros) es consistente con pesos en fp32 (~4 bytes por parametro) |
| Idiomas soportados | no aplica / no disponible (modelo de robotica, sin salida textual) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy, es decir, un modelo generativo que produce chunks de acciones mediante un proceso de difusion en lugar de una regresion directa. La model card no especifica el backbone exacto (U-Net 1D/2D, transformer), el numero de pasos de difusion ni el tipo de encoder visual. La politica observa el entorno real cada 16 pasos, predice un chunk de acciones y ejecuta las 16 primeras antes de volver a observar.

El espacio de estado y accion es de 38 dimensiones, distribuidas como `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]` en posiciones articulares. A ese vector se le concatena una senal tactil de 30 dimensiones de fuerza en las puntas de los dedos (5 dedos x 3 ejes por mano), resultando en un estado de 68 dimensiones. Los datos provienen de 155 episodios de teleoperacion, con particion de 139 para entrenamiento y 16 reservados (uno de cada diez). La percepcion son 4 camaras RGB a 640x360 y 30 fps. El entrenamiento se realizo durante 10.000 pasos con semilla 1000; no se documentan tecnicas de RLHF, DPO ni decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Generacion de trayectorias articulares bimanuales de 38 dimensiones para una tarea pick-and-place concreta.
- Prediccion por chunks de 16 acciones con re-observacion periodica (control tipo receding horizon).
- Integracion de senal tactil de fuerza en 5 dedos por mano (30 dimensiones) concatenada al estado, aunque el estudio indica que no aporta mejora medible.
- Procesamiento de 4 flujos visuales RGB simultaneos a 640x360 y 30 fps.
- Manipulacion diestra de dos manos XHand1 sobre un robot DexMate Vega-1, con brazo izquierdo practicamente estatico durante la tarea.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, generacion de texto, codigo, matematicas, vision general, audio ni modo de razonamiento. No es un modelo multimodal de proposito general.

## Casos de uso

- Reproduccion del experimento pick-and-place: desplegar el checkpoint sobre un banco de pruebas DexMate Vega-1 con manos XHand1 y teleoperacion Meta/Vive para replicar las condiciones del estudio y verificar el error en lazo abierto.
- Baseline en investigacion de politicas visuomotoras: usar este checkpoint como referencia cuantitativa (error medio por articulacion) frente a ACT, GR00T 3B o pi-0.5 en la misma tarea y con los mismos 16 episodios reservados.
- Ablation de sensores tactiles: comparar de forma controlada este modelo con `ckpt_toyshelfteleop_pickplace_4cam260917_dp260919` (misma familia sin tactil) para medir si la senal de fuerza en dedos cambia el error mas alla del ruido, como sugiere la model card.
- Fine-tuning sobre nuevos datos de teleoperacion: reentrenar o ajustar el checkpoint con episodios adicionales de la misma celda robotica para otras posiciones de estanteria o variantes de objeto, aprovechando que los datos ya estan en el formato de 68 dimensiones de estado.
- Estudio de action chunking: evaluar el efecto de la longitud de chunk (16 en este caso) y de la frecuencia de re-observacion sobre la estabilidad de la trayectoria, midiendo error en lazo abierto y, si hay hardware, tasa de exito.
- Docencia y formacion en imitation learning: emplear el modelo y sus 24 ejecuciones comparativas como material practico para explicar el flujo completo datos de teleoperacion, entrenamiento por difusion y evaluacion offline.
- Validacion en simulacion: antes de cualquier prueba fisica, integrar la politica en un simulador que replique el estado 68-D y las 4 camaras para detectar fallos de seguimiento sin riesgo de dano en el robot.
- Investigacion sobre fusion visotactil: analizar si un cambio en la representacion del tactil (por ejemplo, prediccion auxiliar de contacto o tokenizacion de la fuerza) mejora el error respecto al concatenado plano empleado aqui.

## Benchmarks y rendimiento

La model card publica unicamente error en lazo abierto sobre 16 episodios reservados, definido como la media del valor absoluto de la diferencia entre accion predicha y accion registrada, en radianes (± error estandar de la media, n=16).

| Metrica (rad) | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (DP + tactil) | 0,0044 ± 0,0005 | 0,0099 ± 0,0013 | 0,0470 ± 0,0036 | 0,0335 ± 0,0030 |
| Baseline hold-first-frame | 0,0219 | 0,0172 | 0,3166 | 0,2380 |

No se publican MMLU, HumanEval, GSM8K ni metricas de exito de tarea, porque no son aplicables a un modelo de politica robotica. La propia model card advierte que esta metrica mide seguimiento de trayectoria, no exito de la tarea, y que ninguna prueba se ejecuto en hardware. En el estudio agregado de cuatro familias por tres tareas, la entrada tactil no produjo diferencias mas alla del ruido y GR00T obtuvo el error mas bajo en todas las tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB solo para pesos en fp32 (268,3 M de parametros), mas activaciones de los 4 encoders visuales y del proceso de difusion. Como orden de magnitud, entre 2 y 6 GB en fp32 a lote 1; no es un dato declarado por el autor, sino una estimacion a partir del numero de parametros.
- GPU recomendadas: cualquier GPU con 8 GB o mas sirve para lote 1. Una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 son suficientes. A100 o H100 solo tendrian sentido para inferencia por lotes o para reentrenamiento, no por requisitos de memoria.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano del modelo.
- Opciones de despliegue: no se declara ninguna integracion con vLLM, llama.cpp, Ollama o TGI; estos motores no son aplicables a un modelo de politica visomotora. El despliegue requiere un runtime de PyTorch capaz de cargar safetensors y una capa de interfaz con el robot (DexMate Vega-1, manos XHand1, camaras y sensor tactil) que replique el espacio de estado de 68 dimensiones.
- Latencia y throughput: no disponibles. La latencia dependera del numero de pasos de denoising, que la model card no especifica, y del coste de codificar 4 flujos de video a 640x360 y 30 fps.

## Comparativa con modelos similares

El autor publica 8 ejecuciones de esta misma tarea, lo que permite una comparativa directa dentro del mismo banco de pruebas y con los mismos datos.

| Modelo | Familia | Tactil | Parametros | Error en lazo abierto | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (`..._dptactile260919`) | Diffusion Policy | Si | 268.343.590 | Ver tabla de benchmarks | apache-2.0 |
| [`..._dp260919`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919) | Diffusion Policy | No | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| [`..._act260919`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919) | ACT | No | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| [`..._acttactile260919`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919) | ACT | Si | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| [`..._gr00t3b260918`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918) | GR00T 3B | No | ~3.000 M (segun nombre) | El mas bajo de todas las tareas segun la model card | no disponible en esta ficha |
| [`..._gr00t3btactile260918`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918) | GR00T 3B | Si | ~3.000 M (segun nombre) | no disponible en esta ficha | no disponible en esta ficha |
| [`..._pi05260918`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918) | pi-0.5 | No | no disponible | no disponible en esta ficha | no disponible en esta ficha |
| [`..._pi05tactile260918`](https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918) | pi-0.5 | Si | no disponible | no disponible en esta ficha | no disponible en esta ficha |

Los valores numericos del resto de ejecuciones no se incluyen en la informacion disponible para esta ficha; solo se indica cualitativamente que GR00T logro el error mas bajo en las tres tareas y que el tactil no cambio los resultados de forma significativa.

## Limitaciones y advertencias

- Ninguna evaluacion se ejecuto en hardware real. Las metricas publicadas son de error en lazo abierto y miden seguimiento de trayectoria, no exito de la tarea. No debe inferirse capacidad de completar el pick-and-place fisico a partir de ellas.
- Especificidad de hardware: el modelo esta entrenado para DexMate Vega-1 con dos manos RobotEra XHand1, teleoperacion con guante Meta y seguimiento Vive. No hay garantia de transferencia a otra cinematica, otro numero de manos u otro sensor tactil.
- La tarea esta muy acotada: coger un juguete del segundo nivel de una estanteria y colocarlo en el primero. El brazo izquierdo permanece practicamente estatico, por lo que el modelo no demuestra coordinacion bimanual plena.
- Dataset reducido: 155 episodios de una sola celda robotica. Riesgo alto de sobreajuste al entorno, iluminacion, posiciones de camara y objetos concretos usados en la recogida de datos.
- La senal tactil no aporto mejora medible segun el propio autor. Cualquier expectativa de que el tactil mejore el contacto o el agarre en produccion carece de respaldo en estos datos.
- No aplica riesgo de alucinacion en el sentido de generacion de texto, pero si existe riesgo de acciones fuera de distribucion cuando la observacion se aleja de las condiciones de entrenamiento.
- No dispone de capacidades de texto, codigo, matematicas, vision general ni multilingues. No debe evaluarse con benchmarks de lenguaje.
- Licencia apache-2.0: permite uso comercial y modificacion con obligacion de conservar avisos de licencia; aun asi, el autor no ofrece garantias sobre el comportamiento del modelo en hardware real.
- Estado de adopcion nulo en el momento de la consulta: 0 descargas y 0 likes, lo que implica ausencia de validacion externa y de reportes de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dptactile260919
- Variante Diffusion Policy sin tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_dp260919
- Variante ACT sin tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_act260919
- Variante ACT con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_acttactile260919
- Variante GR00T 3B sin tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3b260918
- Variante GR00T 3B con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_gr00t3btactile260918
- Variante pi-0.5 sin tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05260918
- Variante pi-0.5 con tactil: https://huggingface.co/tarzanagh/ckpt_toyshelfteleop_pickplace_4cam260917_pi05tactile260918
- Pagina personal del autor: https://tarzanagh.github.io/
- Paper, blog o repositorio asociados: no disponibles en la informacion proporcionada.
