# yugenjr/Speednet-V2

## Resumen

SpeedNet v2 es una red neuronal multitarea ligera disenada para estimar la velocidad longitudinal y la velocidad de guinada (yaw rate) de un vehiculo a partir de datos brutos de una IMU de 6 grados de libertad (acelerometro y giroscopio de 3 ejes). Su proposito no es la generacion de lenguaje, sino el dead reckoning inercial (IDR): mantener una estimacion de movimiento razonable durante las ventanas en las que el receptor GNSS pierde la senal, acotando la deriva inercial sin depender de conectividad a la nube. El modelo lo publica el usuario yugenjr en Hugging Face, sin licencia declarada ni pipeline asociado.

La arquitectura es deliberadamente compacta: un extractor de caracteristicas formado por dos capas convolucionales 1D (32 y 64 canales, kernel 3) seguidas de una BiLSTM de una capa con tamano oculto 64, un cuello de botella denso compartido de 128 a 64 unidades y cuatro cabezas multitarea que producen `v_fwd` (m/s), `omega_yaw` (rad/s), un logit de clasificacion binaria de estado estacionario y un `delta_v` auxiliar. La entrada es una ventana temporal de 4 segundos, es decir 40 muestras a 10 Hz con 6 canales IMU.

La relevancia de esta publicacion es de nicho pero clara: se distribuye en formatos de despliegue en dispositivo (ONNX opset 14 con dimension de batch dinamica y TorchScript Lite), apunta a ONNX Runtime Mobile y PyTorch Mobile, y esta pensado para ejecucion offline en smartphone o hardware embebido. El autor reporta 218,93 m de error de posicion tras una interrupcion total de GNSS de 300 segundos cuando el modelo se integra en su sistema EKF de navegacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (2 capas) + BiLSTM (1 capa) + cuello de botella denso + 4 cabezas multitarea. No es un transformer ni un MoE |
| Parametros totales | No publicado por el autor. Estimacion propia a partir de las capas descritas: ~88.500 parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en sentido linguistico. Ventana temporal de entrada fija: 4 s = 40 muestras a 10 Hz, con 6 canales IMU (accel x/y/z, gyro x/y/z) |
| Tipos de cuantizacion | No disponible (no se documenta ninguna cuantizacion) |
| Idiomas soportados | No aplica (modelo numerico de sensores, no linguistico) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`speednet_v2_w40.onnx` + `speednet_v2_w40.onnx.data`, opset 14, constant-folded, batch dinamico) y TorchScript Lite (`speednet_v2_w40.ptl`). Se menciona tambien el checkpoint de entrenamiento `speednet_v2_w40.pth` |

## Arquitectura y entrenamiento

El modelo procesa una secuencia de 40 pasos temporales y 6 canales. El extractor convolucional aplica dos bloques Conv1d con kernel 3, padding 1, BatchNorm1d y ReLU (32 y 64 canales respectivamente), que alimentan una BiLSTM de una capa con entrada de 64 y estado oculto de 64, cuya salida bidireccional tiene dimensionalidad 128. Esa representacion pasa por un cuello de botella compartido Linear(128, 64) + ReLU, del que cuelgan cuatro cabezas independientes: regresion de velocidad de avance (Linear 64 a 32, ReLU, Linear 32 a 1, ReLU para forzar no negatividad), regresion de yaw rate (64 a 32, ReLU, 32 a 1), logit de estado estacionario (64 a 32, ReLU, 32 a 1) y cambio de velocidad auxiliar (64 a 16, ReLU, 16 a 1). No se documenta uso de atencion, decodificacion especulativa, RLHF, DPO ni tecnicas de alineacion; es un modelo supervisado de regresion/clasificacion multitarea.

En cuanto a datos, el autor indica que el modelo se entrena y evalua sobre IO-VNBD (Inertial Outdoor Vehicle Navigation & Benchmark Dataset), que empareja telemetria IMU de smartphone de alta frecuencia con ground truth de GNSS RTK de alta precision en trayectorias de conduccion diversas. No se especifican el numero de tokens o muestras, la composicion exacta del dataset, la particion train/val/test ni el regimen de entrenamiento (epochs, optimizador, learning rate). Es relevante una aclaracion del autor: las configuraciones de benchmark M028 y M029 usan exactamente los mismos pesos (`speednet_v2_w40.pth`); la mejora de M029 procede de cambios en la arquitectura de navegacion, el jerk-gating y la integracion del filtro de rumbo, no de un reentrenamiento de la red.

## Capacidades

- Regresion de velocidad de avance del vehiculo en m/s a partir de IMU bruta, con salida no negativa garantizada por activacion ReLU final.
- Regresion de velocidad de guinada (yaw rate) en rad/s.
- Clasificacion binaria implicita de estado estacionario o velocidad cero mediante un logit (`logit_stat`), util para detectar paradas sin apoyo de GNSS.
- Estimacion auxiliar de cambio de velocidad longitudinal a corto plazo (`delta_v`).
- Inferencia offline completa: el autor declara dependencia nula de la nube y diseno para ejecucion en tiempo real durante perdida de GNSS.
- Exportacion a formatos de borde: ONNX opset 14 con dimension de batch dinamica y TorchScript Lite para PyTorch Mobile / Android nativo.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, capacidades de agente ni soporte multilingue; no aplica ninguna de ellas.

## Casos de uso

- Navegacion en tuneles y parkings subterraneos: durante los cortes de GNSS, el modelo aporta velocidad y yaw rate a un motor de dead reckoning o EKF para acotar la deriva; el propio autor documenta 218,93 m de error de posicion en 300 s de corte total.
- Seguro basado en uso (UBI) y telemetria de flotas: en zonas urbanas densas o aparcamientos, la app puede seguir registrando eventos de conduccion sin perder el hilo por caidas de senal, usando `v_fwd` y `logit_stat` para distinguir conduccion de parada.
- Deteccion de paradas y logica start-stop: el logit de estacionario permite conmutar heuristicas de ahorro energetico o de facturacion por tiempo detenido sin depender de la velocidad GNSS.
- Fusion en receptores GNSS de bajo coste: integracion como bloque neuronal dentro de un pipeline EKF que combine IMU de smartphone con posiciones GNSS intermitentes en vehiculos de gama de entrada.
- Robotica movil y reparto de ultima milla: robots o vehiculos de reparto que operan en entornos con sombra de senal pueden usar la estimacion inercial como respaldo de odometria.
- Analisis post-viaje con dashcams o apps de conduccion: reconstruccion de perfiles de velocidad y giro a partir de la IMU del telefono cuando el registro GNSS tiene huecos, en ejecucion local sin subir datos a la nube.
- Validacion y prototipado en investigacion de navegacion inercial: al ser un artefacto pequeno en ONNX/TorchScript Lite, sirve como linea base reproducible frente a otros estimadores de velocidad por IMU sobre IO-VNBD.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| Error de posicion con corte total de GNSS (M028 / M029, sistema EKF) | 218,93 m tras 300 s de corte | Configuracion de sistema completo con EKF, no el modelo aislado |
| Latencia en dispositivo (edge) | No medido ("Not yet benchmarked" segun el autor) | - |
| Consumo energetico en dispositivo | No medido ("Not yet benchmarked" segun el autor) | - |
| Throughput con cuantizacion en edge | No medido ("Not yet benchmarked" segun el autor) | - |

No se han publicado en la informacion disponible resultados de benchmarks tipo MMLU, HumanEval, GSM8K ni metricas especificas de error de velocidad o yaw rate (MAE/RMSE) para el modelo aislado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El autor no publica cifras. Con ~88.500 parametros estimados, el modelo es de escala embebida y no esta pensado para GPU de centro de datos.
- GPU recomendadas: no aplica segun la documentacion. La plataforma objetivo declarada es smartphone y runtime embebido (ONNX Runtime Mobile / PyTorch Mobile), es decir CPU de movil o SoC de borde.
- Encaje en GPU de consumo: no aplica; el modelo no requiere GPU. Cualquier CPU de movil moderna deberia poder ejecutarlo en principio, aunque la latencia real no esta validada.
- Opciones de despliegue: ONNX Runtime Mobile sobre `speednet_v2_w40.onnx` (opset 14, batch dinamico) y PyTorch Mobile / Android nativo sobre `speednet_v2_w40.ptl`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; el autor indica explicitamente que la latencia en dispositivo aun no se ha medido y que debe validarse en el procesador movil objetivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables, ni alternativas de la misma categoria (estimacion de velocidad/yaw por IMU para dead reckoning), ni resultados que permitan una comparacion cuantitativa. El unico punto de referencia interno son las configuraciones M028 y M029 del propio sistema del autor, que comparten los mismos pesos.

## Limitaciones y advertencias

- Orientacion y calibracion de sensores: las predicciones dependen de un mapeo de ejes IMU coherente y de offsets de bias de acelerometro y giroscopio previamente calibrados. Un montaje distinto invalida las estimaciones.
- Desplazamiento de dominio entre telefonos: el autor advierte que las variaciones en el soporte del dispositivo, el espectro de vibracion del vehiculo y las caracteristicas de ruido de distintos modelos de smartphone pueden degradar la precision de velocidad.
- Latencia no validada: no hay mediciones de latencia en el procesador objetivo, por lo que el cumplimiento de requisitos de tiempo real no esta garantizado.
- El modelo no es un sistema de navegacion completo: el propio autor indica que los artefactos neuronales por si solos no garantizan precision de navegacion; el rendimiento depende de la integracion con un EKF o un motor de dead reckoning.
- Licencia no declarada: al no figurar licencia en el repositorio ni en la model card, no hay autorizacion explicita de uso comercial ni condiciones de redistribucion. Cualquier uso en produccion requiere aclarar esto con el autor.
- Sin soporte linguistico ni de instrucciones: no puede emplearse en tareas de generacion de texto, agentes, tool calling ni razonamiento multilingue; cualquier expectativa en ese sentido es un error de evaluacion.
- Idiomas: no aplica, pero implica que no hay documentacion ni evaluacion multilingue de ningun tipo.
- Evaluacion limitada: solo se publica una metrica de sistema (218,93 m en 300 s) dentro de un EKF concreto; no hay metricas por tarea (velocidad, yaw rate, estacionario) ni evaluacion fuera del dataset IO-VNBD.
- Estado del repositorio: 0 descargas y 1 like en el momento de la consulta, tamano de repo reportado como 0,0 GB, y fecha de creacion en Hugging Face (2026-09-14) no verificable. La madurez del artefacto es, por tanto, muy baja.

## Enlaces

- Hugging Face: https://huggingface.co/yugenjr/Speednet-V2
- Resultados de la busqueda web: no se ha encontrado ningun enlace relevante sobre este modelo (papers, blogs, repositorios o demos). Los resultados devueltos no guardan relacion con SpeedNet v2.
