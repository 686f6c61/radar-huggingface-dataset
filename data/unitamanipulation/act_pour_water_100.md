# UNITAmanipulation/act_pour_water_100

## Resumen

`UNITAmanipulation/act_pour_water_100` es una politica de robotica (no un modelo de lenguaje) entrenada con ACT, el metodo Action Chunking with Transformers descrito en el articulo arXiv:2304.13705. Consiste en un transformer que, a partir de un estado articular de 12 dimensiones y tres camaras, predice un fragmento de acciones ("chunk") en lugar de un unico paso de control, lo que reduce el error de compounding y permite ejecutar trayectorias bimanuales precisas. El modelo lo publica la organizacion UNITAmanipulation y se distribuye a traves de la libreria LeRobot de HuggingFace.

La tarea concreta para la que esta entrenado es recoger un vaso con el brazo izquierdo y verter agua desde una botella con el brazo derecho, sobre un robot de tipo `bi_so_follower` (configuracion bimanual SO-101). El entrenamiento se hizo exclusivamente por imitacion a partir de 100 episodios teleoperados, con 117.619 fotogramas a 30 FPS, lo que equivale a unos 65 minutos de demostraciones.

Es relevante como ejemplo reproducible de pipeline completo de aprendizaje por imitacion en robotica de bajo coste: pesos safetensors de 51,7 millones de parametros, licencia Apache-2.0, comandos de entrenamiento e inferencia documentados y dataset publico asociado. No es un modelo conversacional ni multimodal de proposito general, por lo que buena parte de los criterios habituales de evaluacion de LLM no le aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con codificador visual y cabecera de prediccion de chunks de acciones, integrado en LeRobot |
| Parametros totales | 51.680.908 (~51,7 M), dato real de safetensors |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable en el sentido de LLM: condiciona sobre una observacion por inferencia (estado de 12 dimensiones + 3 imagenes). Tamano del chunk de acciones: no disponible |
| Tipos de cuantizacion | No disponible; se distribuyen pesos en safetensors (repo de 0,2 GB, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | No disponible; no es un modelo de lenguaje. La instruccion de tarea es una cadena de texto fija en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, libreria `lerobot` |

Especificaciones de entrada y salida declaradas por el autor:

| Direccion | Feature | Tipo | Forma |
|---|---|---|---|
| Entrada | `observation.state` | STATE | (12,) |
| Entrada | `observation.images.left_wrist` | VISUAL | (3, 240, 320) |
| Entrada | `observation.images.top` | VISUAL | (3, 480, 640) |
| Entrada | `observation.images.right_wrist` | VISUAL | (3, 240, 320) |
| Salida | `action` | ACTION | (12,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice chunks de acciones de corto horizonte en lugar de un unico comando por paso. La arquitectura combina un codificador de las observaciones visuales (tres camaras con resoluciones distintas) con el estado propioceptivo de 12 dimensiones, y un transformer que genera una secuencia de acciones de 12 dimensiones. El objetivo de entrenamiento tipico del metodo incluye un termino de reconstruccion tipo VAE sobre el chunk de acciones, orientado a modelar la variabilidad de las demostraciones humanas. El autor no detalla en la model card ninguna modificacion sobre la implementacion de referencia.

El entrenamiento se realizo con LeRobot 0.6.2 sobre el dataset `UNITAmanipulation/bi_so101_pour_water_20260920_194823`: 100 episodios, 117.619 fotogramas a 30 FPS, con una unica tarea descrita como "Pick up the cup with the left arm and pour water from the bottle into it with the right arm". La configuracion reportada es de 100.000 pasos de optimizacion, batch size 16, optimizador AdamW, learning rate 1e-5 y semilla 1000. De forma derivada: 100.000 pasos con batch 16 suponen 1,6 millones de muestras procesadas, aproximadamente 13,6 pasadas equivalentes sobre el dataset. No se documenta uso de RLHF, DPO ni fases de refinamiento posteriores, algo coherente con un pipeline de imitacion supervisada. El dato de 30 FPS implica que la politica esta pensada para control en tiempo real a esa frecuencia.

## Capacidades

- Generacion de acciones de manipulacion bimanual: produce un vector de 12 dimensiones (probablemente 6 grados de libertad por brazo) para un robot `bi_so_follower`.
- Control guiado por vision: consume tres flujos de imagen simultaneos (`left_wrist`, `top`, `right_wrist`), lo que le da perspectiva egocentrica de ambos efectores y una vista cenital del area de trabajo.
- Fusion de estado propioceptivo y vision: combina el estado de 12 dimensiones con las imagenes para condicionar la accion.
- Ejecucion de la tarea especifica de vertido: coger un vaso con el brazo izquierdo y verter agua desde una botella con el brazo derecho.
- Prediccion de chunks de acciones: el esquema de ACT mitiga el error acumulado frente a politicas paso a paso.
- Integracion con el ecosistema LeRobot: inferencia mediante `lerobot-rollout` y reentrenamiento mediante `lerobot-train`.
- No dispone de: tool calling, function calling, razonamiento multi-paso simbolico, capacidades conversacionales, generacion de texto, codigo, matematicas ni comprension multilingue. No es un modelo de lenguaje.

## Casos de uso

- Automatizacion de vertido de liquidos en laboratorio: la politica ejecuta la secuencia completa de coger el vaso y verter con la botella, util para tareas repetitivas de dosificacion en entornos controlados donde no se requiere precision metrologica alta.
- Punto de partida para fine-tuning en tareas de manipulacion bimanual relacionadas: al estar entrenada con LeRobot, se puede continuar el entrenamiento con datos propios (por ejemplo, servir bebidas o trasvasar recipientes) usando `lerobot-train` y el mismo formato de observaciones.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible de un pipeline ACT completo, con dataset, configuracion de entrenamiento y pesos publicados, para comparar contra otras politicas (por ejemplo, Diffusion Policy) bajo el mismo robot y las mismas camaras.
- Estudio de generalizacion y robustez: permite medir como degrada la politica ante cambios de posicion de los objetos, iluminacion, fondos o pequenas variaciones en la apariencia de vaso y botella, ya que el dataset base de 100 episodios es estrecho.
- Recoleccion de datos ampliada: al no haber resultados de evaluacion publicados, un uso razonable es desplegar la politica, recoger episodios de exito y fallo con `lerobot-rollout` y reentrenar para aumentar la cobertura del dataset.
- Docencia y formacion en robotica de bajo coste: la configuracion SO-101 bimanual y la licencia Apache-2.0 facilitan su uso en cursos practicos de manipulacion robotica y aprendizaje por imitacion.
- Evaluacion de infraestructura de control en tiempo real: con entrada a 30 FPS y tres camaras, es un banco de pruebas util para medir latencia de inferencia en el lazo de control.
- Base de comparacion interna en un laboratorio: establece una linea base ACT sobre una tarea bimanual concreta frente a la que medir politicas posteriores (VLA, diffusion, hibridas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la seccion de evaluacion vacia con la nota "No evaluation results have been provided for this policy yet", por lo que no existen tasas de exito en robot real ni numero de ensayos por tarea. Tampoco se proporcionan metricas de loss de entrenamiento ni curvas de aprendizaje.

## Requisitos de hardware

- VRAM estimada para inferencia: calculada a partir del dato real de 51.680.908 parametros. En fp32 los pesos ocupan aproximadamente 207 MB; en fp16 o bf16, unos 103 MB. A esto hay que sumar las activaciones, que dependen del tamano de lote y de las tres imagenes de entrada (una de 640x480 y dos de 320x240), y que en la practica son el factor dominante del consumo.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 4 GB de VRAM es holgada para este modelo; una RTX 3060, RTX 4060 o superior resulta suficiente. Aceleradores tipo A100 o H100 no aportan beneficio practico porque el cuello de botella es la captura de camaras a 30 FPS y la latencia del lazo de control, no el calculo de la red.
- Cabe en GPU de consumo: si, con margen amplio, incluidas GPUs de gama media y baja recientes. Tambien es viable la inferencia en CPU para pruebas puntuales, aunque no es recomendable para control en tiempo real a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` es la via documentada por el autor; el modelo se ejecuta con PyTorch y la libreria `lerobot`. No aplican servidores de inferencia de LLM como vLLM, TGI, Ollama o llama.cpp, ya que el modelo no es un transformer de lenguaje ni tiene variantes GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia por inferencia ni frecuencia efectiva de control alcanzada. Como referencia, la politica asume datos de entrada a 30 FPS (33,3 ms por ciclo).

## Comparativa con modelos similares

No se dispone de datos numericos de los modelos comparables en la informacion proporcionada; la tabla recoge unicamente lo que puede afirmarse sin inventar cifras.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `UNITAmanipulation/act_pour_water_100` | Politica ACT para manipulacion bimanual (SO-101) | 51,7 M | No aplicable (observacion por paso) | Apache-2.0 | Pesos safetensors en HuggingFace, sin evaluacion publicada |
| ACT de referencia (LeRobot, `lerobot/act_*`) | Politica ACT generica | No disponible | No aplicable | No disponible | Repositorios publicos en el Hub de LeRobot |
| Diffusion Policy (Cheng et al.) | Politica de imitacion basada en difusion | No disponible | No aplicable | No disponible | Implementaciones publicas; no se dispone de comparativa directa sobre esta tarea |
| Modelos VLA tipo pi0 / SmolVLA / GR00T | Politicas vision-lenguaje-accion de proposito general | No disponible | No aplicable | No disponible | Publicos, pero de escala y enfoque distintos |

La comparacion directa mas justa seria contra otras politicas ACT entrenadas sobre el mismo robot bimanual y la misma tarea, dato que no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Especificidad extrema de la tarea: la politica esta entrenada para una unica instruccion (coger el vaso y verter agua). No generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere un robot `bi_so_follower` y exactamente tres camaras con los nombres `left_wrist`, `top` y `right_wrist`. Si los nombres o la disposicion de las camaras no coinciden con los del entrenamiento, la politica no funcionara correctamente.
- Sin evaluacion publicada: no hay tasa de exito, numero de ensayos ni condiciones de prueba. No hay evidencia cuantitativa de fiabilidad en produccion.
- Dataset reducido: 100 episodios y unos 65 minutos de demostraciones implican riesgo de sobreajuste a posiciones de objeto, iluminacion y fondo concretos. Es esperable degradacion ante cambios de distribucion.
- Sesgos de teleoperacion: el comportamiento refleja el estilo de demostracion del operador; variaciones sistematicas del operador humano se trasladan a la politica.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje. El modo de fallo equivalente es la ejecucion de acciones incorrectas o inseguras, especialmente critico al manipular liquidos.
- Idiomas: no es un modelo de lenguaje y no procesa instrucciones en lenguaje natural mas alla de la cadena de tarea usada en el codigo.
- Consideraciones de seguridad fisica: la tarea implica liquidos y movimiento bimanual; se recomienda limitacion de fuerza, parada de emergencia y supervision humana durante el despliegue.
- Licencia: el modelo es Apache-2.0, permisiva para uso comercial, pero conviene verificar por separado la licencia del dataset asociado y de los componentes de LeRobot utilizados.
- Idiomas y contexto: no disponibles; no aplican al tipo de modelo.
- Fecha de creacion del repositorio (2026-09-20) y ausencia de descargas o likes: el modelo es reciente y sin traccion comunitaria, por lo que no hay validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UNITAmanipulation/act_pour_water_100
- Dataset de entrenamiento: https://huggingface.co/datasets/UNITAmanipulation/bi_so101_pour_water_20260920_194823
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=UNITAmanipulation/bi_so101_pour_water_20260920_194823
- Articulo de ACT (Action Chunking with Transformers), arXiv:2304.13705: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de rollout e inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- La busqueda web realizada no devolvio enlaces relevantes al modelo: los unicos resultados fueron paginas genericas de YouTube sin relacion con el repositorio.
