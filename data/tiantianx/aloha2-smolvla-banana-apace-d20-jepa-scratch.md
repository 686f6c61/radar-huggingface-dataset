# tiantianx/aloha2-smolvla-banana-apace-d20-jepa-scratch

## Resumen

Este repositorio contiene un checkpoint intermedio de un predictor JEPA (joint embedding predictive architecture) entrenado desde inicializacion aleatoria para la tarea de insercion de un platano en el entorno ALOHA2, dentro del marco A-PACE. No es un modelo de lenguaje ni un VLA completo: es unicamente la cabeza predictora que se acopla a una politica SmolVLA congelada (`yhong96/aloha2_smolvla_banana_v2`) para anticipar el estado articular futuro del robot. El autor lo publica como instantanea fija en el paso de optimizacion 12.600 (epoca 10 de 20) de un presupuesto original de 25.200 pasos.

La relevancia de esta publicacion es que mejora de forma sustancial la prediccion articular respecto al checkpoint anterior de 25.200 pasos, pese a haber consumido la mitad de pasos: el RMSE de las 12 articulaciones del brazo baja de 3,303 a 1,524 grados y el error maximo absoluto de la muneca izquierda cae de 30,827 a 7,675 grados. A cambio, el MSE de caracteristicas visuales empeora ligeramente (1.893,547 frente a 1.728,156), de modo que el snapshot no domina al anterior en todas las metricas.

El modelo soporta un retardo de control de 20 pasos (unos 400 ms a 50 Hz), consume 20 vectores de comando absolutos de 14 dimensiones en el orden de canales grabado (12 articulaciones de brazo mas 2 pinzas) y trabaja con un horizonte de accion nativo de 50. El repositorio ocupa 0,4 GB y no incluye ni la politica base ni un servidor de robot autonomo, solo los pesos del predictor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor JEPA (joint embedding predictive architecture) sobre una politica SmolVLA congelada; no es un transformer generativo de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; consume 20 vectores de comando absolutos de 14D y un horizonte de accion nativo de 50 |
| Tipos de cuantizacion | no disponible (no se mencionan GGUF, AWQ, GPTQ ni variantes de precision reducida) |
| Idiomas soportados | en (etiqueta de idioma del repositorio); no hay informacion sobre capacidades multilingues |
| Licencia | no disponible |
| Formato de pesos | checkpoint PyTorch (`jepa_training/best.pt`); acompanado de `CONFIG.json`, `VALIDATION.json`, `RELEASE.json` y `SHA256SUMS.json`. No se mencionan safetensors ni GGUF |
| Tamano del repositorio | 0,4 GB |
| Delay de control soportado | 20 pasos de control (nominalmente 400 ms a 50 Hz) |
| Horizonte de accion nativo | 50 |
| Coordenadas de accion | `delta_joint_v1`, ancladas al estado articular de handover predicho |
| Entradas comprometidas | 20 vectores de comando absolutos de 14D de ALOHA (12 articulaciones de brazo + 2 pinzas, en el orden de canales grabado) |
| Modelo base | `yhong96/aloha2_smolvla_banana_v2`, revision `558170cf34a8a5c83e5ce68944846186a82a4b80` |
| Dataset | `yhong96/aloha2_banana_insertion`, revision `213b3da1b40e35ab67278eafe2415461982ce65e` |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-15 |

## Arquitectura y entrenamiento

El componente publicado es un predictor JEPA inicializado de forma aleatoria e independiente, con perdidas equilibradas de prediccion visual, articular fisica y de pinzas. La politica SmolVLA sobre la que opera permanece congelada: el entrenamiento reutiliza caracteristicas de condicionamiento de politica congelada y su normalizacion, ya cacheadas. La dimension indicada en el nombre del checkpoint (`d=20`) corresponde al retardo de control soportado, no a una dimension de embedding declarada en la informacion disponible. El predictor produce salidas que conservan la interfaz nativa de estado normalizado: el runtime de rollout existente reconstruye los objetivos absolutos de brazo sumando los offsets articulares generados al estado de handover predicho, mientras que las salidas de pinza permanecen absolutas.

El entrenamiento uso lotes de 16 (micro-lote 8, acumulacion 2), AdamW con LR maximo de 2e-4 y planificador OneCycle, sobre 72 episodios de entrenamiento y 8 de validacion. La funcion de perdida combina MSE visual, MSE de articulaciones fisicas y MSE normalizado de pinzas, cada uno escalado solo con estadisticas de entrenamiento, mas una distancia coseno con peso 0,1. La ejecucion se interrumpio en el paso 12.525 y se restauro desde el checkpoint del paso 12.000, incluyendo optimizador y planificador; como ese checkpoint no contenia el estado del generador de numeros aleatorios, la recuperacion no es identica bit a bit a una ejecucion ininterrumpida, aunque el arranque original si fue desde inicializacion aleatoria. El archivo `jepa_training/best.pt` se selecciono por MSE fisico de brazo en validacion en el momento de la instantanea.

## Capacidades

- Prediccion del estado articular futuro: estima las 12 articulaciones de brazo normalizadas, con un RMSE de 1,524 grados en validacion held-out.
- Prediccion de la muneca izquierda: RMSE de 2,220 grados, error absoluto P90 de 3,600 grados y error maximo absoluto de 7,675 grados en el mismo conjunto de validacion.
- Prediccion de caracteristicas visuales: MSE de 1.893,547, que el autor senala como todavia superior al del checkpoint anterior.
- Prediccion de pinzas: perdida MSE normalizada especifica de gripper dentro de la funcion de perdida compuesta.
- Condicionamiento sobre comandos absolutos: acepta 20 vectores de comando de 14D (12 articulaciones mas 2 pinzas) en el orden de canales grabado.
- Generacion de chunks de accion condicionados al futuro: en el handover programado, el chunk arranca en el indice 0, sin volver a saltar 20 acciones.
- Compensacion de retardo: disenado para un retardo no nulo de 20 pasos de control (unos 400 ms a 50 Hz).
- No soporta tool calling, function calling, agentes, generacion de texto, codigo, matematicas ni vision generativa: es un predictor de estado para control robotico, no un modelo de proposito general.
- No es autonomo: requiere la politica base SmolVLA y su runtime de rollout para ejecutarse en un robot.

## Casos de uso

- Compensacion de latencia en control remoto: el predictor anticipa el estado articular a 20 pasos de control (unos 400 ms a 50 Hz), lo que permite al planificador de A-PACE emitir acciones que compensen el retardo del enlace o del controlador sin esperar la realimentacion real.
- Investigacion en el marco A-PACE: sirve como componente de prediccion de estado futuro evaluable de forma aislada, con metrica objetiva (RMSE articular) frente a otros checkpoints del mismo proyecto.
- Punto de partida para emparejar un adaptador: el autor indica que el entrenamiento y la evaluacion de un adaptador coincidente estan pendientes, por lo que este snapshot puede actuar como referencia congelada para esa fase.
- Validacion offline de predictores en robotica de manipulacion: con 8 episodios held-out y 2.240 ventanas, permite comparar arquitecturas o presupuestos de entrenamiento con un protocolo reproducible.
- Integracion en el paquete de rollout ALOHA existente: se descarga con `snapshot_download` y se apunta el servidor de politica a `models/apace_d20_scratch/jepa_training/best.pt` mediante `--jepa-checkpoint`, sin cambiar el planificador ni el controlador.
- Estudio de aprendizaje autosupervisado tipo JEPA en robotica: al combinar prediccion visual, articular y de pinzas con pesos normalizados, es un banco de pruebas para analizar el equilibrio entre objetivos de representacion y objetivos de control.
- Reproduccion y auditoria de experimentos: los archivos `CONFIG.json`, `VALIDATION.json`, `RELEASE.json` y `SHA256SUMS.json` permiten verificar configuracion, metricas crudas, identidad de paso e integridad de ficheros.
- Benchmark interno de insercion de platano en ALOHA2: la tarea de `banana_insertion` es un caso de contacto fino y precision sub-centimetrica adecuado para medir calidad de prediccion antes de pasar a robot real.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los de validacion offline de prediccion de estado futuro sobre los mismos 8 episodios held-out y 2.240 ventanas usados por el predictor anterior de 25.200 pasos. El propio autor advierte que son errores de prediccion de estado futuro, no de suavidad de trayectoria ejecutada.

| Metrica | JEPA anterior, 25.200 pasos | Este JEPA, 12.600 pasos |
|---|---:|---:|
| RMSE de las 12 articulaciones de brazo (grados) | 3,303 | 1,524 |
| RMSE del angulo de muneca izquierda (grados) | 6,762 | 2,220 |
| Error absoluto P90 del angulo de muneca izquierda (grados) | 10,582 | 3,600 |
| Error maximo absoluto del angulo de muneca izquierda (grados) | 30,827 | 7,675 |
| MSE de caracteristicas visuales | 1.728,156 | 1.893,547 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no serian aplicables a un predictor de estado robotico. Tampoco se han establecido la evaluacion de acciones con muestreador completo ni el rendimiento en bucle cerrado sobre robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de 0,4 GB solo contiene los pesos del predictor; para ejecutarlo hace falta ademas la politica base SmolVLA, cuyo consumo de memoria no se detalla en la informacion proporcionada.
- GPU recomendadas: no disponible. No se especifica hardware de referencia ni de entrenamiento mas alla de que se uso lote 16 con micro-lote 8.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del checkpoint es reducido, pero la viabilidad en una GPU de consumo depende de la politica base y del runtime de ALOHA, datos no publicados.
- Opciones de despliegue: el autor describe integracion con el paquete de rollout ALOHA A-PACE existente, cargando los pesos con `huggingface_hub.snapshot_download` y pasando `--jepa-checkpoint`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, que no son aplicables a este tipo de modelo.
- Advertencia de integracion: `--aca-checkpoint` debe quedar sin definir; no se debe emparejar este JEPA con un adaptador de repositorios anteriores.
- Latencia y throughput: no disponibles. El autor declara explicitamente que estos resultados offline no establecen exito del robot, suavidad fisica ni latencia de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos de terceros comparables (predictores JEPA para manipulacion o cabezas de prediccion sobre SmolVLA) en el material proporcionado. La unica comparacion posible con datos verificables es interna al propio proyecto:

| Aspecto | JEPA anterior (25.200 pasos) | Este JEPA (12.600 pasos) |
|---|---|---|
| Inicializacion | no especificada en la informacion disponible | aleatoria, independiente |
| Pasos de optimizacion | 25.200 | 12.600 (epoca 10/20) |
| RMSE articular de 12 articulaciones | 3,303 grados | 1,524 grados |
| MSE de caracteristicas visuales | 1.728,156 | 1.893,547 |
| Adaptador incluido | no indicado | no |
| Licencia | no disponible | no disponible |
| Evaluacion en robot real | no establecida | no establecida |

## Limitaciones y advertencias

- Licencia no declarada: al no figurar licencia en el repositorio, no hay base explicita para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- No es un modelo autonomo: no incluye la politica base ni un servidor de robot, solo los pesos del predictor. Requiere el runtime ALOHA A-PACE y la revision exacta de politica y dataset indicadas.
- Riesgo de incompatibilidad: no incluye adaptador y el autor prohibe explicitamente emparejarlo con un adaptador de repositorios anteriores; hacerlo produciria resultados invalidos.
- Estado de entrenamiento intermedio: es una instantanea en el paso 12.600 de 25.200, no un modelo final. El autor lo declara asi de forma explicita.
- Recuperacion no bit a bit: la ejecucion se interrumpio en el paso 12.525 y se reanudo desde el paso 12.000 sin estado del generador aleatorio, por lo que la reproducibilidad exacta no esta garantizada.
- Regresion en la metrica visual: el MSE de caracteristicas visuales empeora respecto al checkpoint anterior (1.893,547 frente a 1.728,156), lo que sugiere un desequilibrio entre objetivos de representacion y de control.
- Sin validacion en robot real: no se ha establecido el rendimiento en bucle cerrado, ni la suavidad fisica, ni la latencia. Los numeros publicados son errores de prediccion offline, no tasas de exito de la tarea.
- Muestra de validacion limitada: 8 episodios y 2.240 ventanas de una unica tarea de insercion de platano, lo que limita la generalizacion a otras tareas, objetos o configuraciones de robot.
- Sesgo de dominio: el modelo esta especializado en la tarea `banana_insertion` sobre ALOHA2; no se ha evaluado su transferencia a otras manipulaciones.
- Idioma: la unica lengua declarada es el ingles, y no hay informacion sobre soporte multilingue en instrucciones o condicionamiento textual.
- Riesgo de alucinacion en sentido estricto: no aplica a un predictor de estado, pero si existe riesgo de predicciones fisicamente invalidas cuando el estado de entrada se aleja de la distribucion de entrenamiento (por ejemplo, ante colisiones o agarres fallidos).
- Acoplamiento a versiones fijas: el funcionamiento correcto depende de las revisiones concretas de politica base y dataset citadas; usar otras revisiones invalida la verificacion mediante `apace_model_binding.json`.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin evidencia externa de uso independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiantianx/aloha2-smolvla-banana-apace-d20-jepa-scratch
- Modelo base (politica SmolVLA congelada): https://huggingface.co/yhong96/aloha2_smolvla_banana_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/yhong96/aloha2_banana_insertion
- Revision fijada de la politica base: `558170cf34a8a5c83e5ce68944846186a82a4b80`
- Revision fijada del dataset: `213b3da1b40e35ab67278eafe2415461982ce65e`
- Archivos de configuracion y validacion incluidos en el repositorio: `CONFIG.json`, `VALIDATION.json`, `RELEASE.json`, `SHA256SUMS.json`, `jepa_training/best.pt`
- Paper, blog o repositorio del marco A-PACE: no disponible en la informacion proporcionada
- Los resultados de busqueda web consultados no aportaron enlaces relevantes al modelo (devolvieron unicamente paginas generales de YouTube).
