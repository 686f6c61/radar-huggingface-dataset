# sovrasov/flux3_policy_black_cubes_20k-ema

# sovrasov/flux3_policy_black_cubes_20k-ema

## Resumen

`flux3_policy_black_cubes_20k-ema` es una politica robotica de aprendizaje por imitacion publicada por el usuario sovrasov en HuggingFace, entrenada con la libreria LeRobot. Se trata de un ajuste fino del modelo FLUX 3 Action de Black Forest Labs, un modelo world-action de aproximadamente 7.083.922.688 parametros (unos 7,08 mil millones) que combina el tronco de video FLUX.3 con una modalidad de accion que se desruidiza de forma conjunta con los siguientes fotogramas de video. El checkpoint concreto que nos ocupa adapta esos pesos a un unico robot y a una unica tarea.

El modelo resuelve una tarea concreta de manipulacion: "pick a black cube and move it to the cardboard bin". Consume dos vistas de camara de 256x256 pixeles (`observation.images.scene` y `observation.images.wrist`) junto con el estado del robot (vector de 6 dimensiones) y devuelve un vector de accion de 6 dimensiones. Se entreno durante 20.000 pasos sobre un dataset de 50 episodios y 20.195 fotogramas a 30 FPS, con un batch size de 2 y un learning rate de 1e-4 usando AdamW.

Su relevancia radica en que demuestra el flujo de ajuste por embodiment de un modelo fundacional de robotica con pesos abiertos bajo licencia apache-2.0, y en que el modelo base (FLUX 3 Action) alcanzo el primer puesto en el benchmark RoboLab-120 con un 42,6% de exito cuando se ajusto sobre DROID. No obstante, este checkpoint especifico no incluye resultados de evaluacion publicados y tiene cero descargas y cero "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo world-action: tronco de video FLUX.3 con modalidad de accion desruidizada conjuntamente con los siguientes fotogramas de video y cabezas de accion especificas por embodiment |
| Parametros totales | 7.083.922.688 (≈7,08 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos sin cuantizar en safetensors) |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tamano del repositorio | 14,4 GB |
| Tipo de robot | `PhysicalAIRobot` |
| Camaras | `top`, `wrist` |
| Entradas | `observation.images.scene` (3, 256, 256), `observation.images.wrist` (3, 256, 256), `observation.state` (6,) |
| Salidas | `action` (6,) |
| Horizonte de accion | 32 acciones por paso de inferencia segun la documentacion de LeRobot para FLUX 3 Action |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

FLUX 3 Action es un modelo world-action de 7B construido sobre el tronco de video de FLUX.3. Su particularidad es que la accion no se predice en un modulo separado: se desruidiza conjuntamente con los siguientes 32 fotogramas de video, de modo que el modelo aprende implicitamente la dinamica del entorno que esta controlando. Segun la documentacion de LeRobot, el modelo acepta fotogramas de camara, el estado del robot y una instruccion de texto, y devuelve las siguientes 32 acciones. Los pesos base se ajustan por embodiment con cabezas de accion nuevas; la version publicada por Black Forest Labs ajustada sobre DROID alcanzo el primer puesto en RoboLab-120 con un 42,6% de exito en tarea. La familia FLUX 3 se describe en flux3.dev como un modelo fundacional multimodal que aprende conjuntamente de imagenes, video y audio en una arquitectura unificada.

Este checkpoint concreto se entreno con LeRobot 0.6.2 sobre el dataset `local/pick-black-cubes-room-2` (50 episodios, 20.195 fotogramas, 30 FPS, tarea unica). La configuracion de entrenamiento reportada es: 20.000 pasos, batch size 2, optimizador AdamW, learning rate 0,0001 y semilla 42. El sufijo `-ema` del nombre indica que los pesos publicados corresponden a una media movil exponencial de los parametros, practica habitual para estabilizar el checkpoint final. No se documenta el uso de RLHF, DPO ni ninguna fase de alineacion adicional; el paradigma es aprendizaje por imitacion a partir de demostraciones de teleoperacion.

## Capacidades

- Generacion de acciones de 6 dimensiones para control visomotor de un robot `PhysicalAIRobot`, a partir de dos vistas de camara de 256x256 y un vector de estado de 6 dimensiones.
- Seguimiento de instrucciones en lenguaje natural para una tarea especifica ("pick a black cube and move it to the cardboard bin").
- Prediccion conjunta de acciones y fotogramas futuros del entorno, heredada del modelo base FLUX 3 Action (capacidad de world model).
- Ajuste fino por embodiment: los mismos pesos base pueden reentrenarse para un robot nuevo, un simulador o un videojuego con un modulo de dataset y una configuracion.
- Control en bucle cerrado a 30 FPS, coherente con la frecuencia de grabacion del dataset de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso en el sentido de los LLM.
- No se documenta capacidad multilingue: la unica instruccion de tarea registrada esta en ingles.
- No se documenta capacidad de generacion de texto, codigo o matematicas; el modelo no es un modelo de lenguaje de proposito general.
- No se documenta soporte de vision generalista, audio ni modo de razonamiento explicito. La familia FLUX 3 base si incorpora modalidad de audio segun flux3.dev, pero no en este ajuste de politica.

## Casos de uso

- Automatizacion de pick-and-place en linea de clasificacion: el modelo recoge un cubo negro y lo deposita en un contenedor de carton usando las vistas cenital y de muneca, lo que lo hace adecuado para tareas de recogida de objetos de geometria y color conocidos en posiciones variables.
- Base para ajuste fino con nuevos objetos y contenedores: al ser un checkpoint LeRobot estandar, se puede reentrenar con `lerobot-train --policy.type=flux3` sobre un dataset propio etiquetado con `lerobot-record`, conservando el tronco de video preentrenado.
- Banco de pruebas de politicas VLA en laboratorio: sirve como referencia reproducible (semilla 42, 20.000 pasos, configuracion publicada) para comparar tecnicas de regularizacion, aumentado de datos o estrategias de muestreo en un robot real.
- Investigacion en world models aplicados a robotica: la desruidizacion conjunta de acciones y fotogramas futuros permite estudiar la coherencia entre la accion predicha y la evolucion visual esperada del entorno.
- Validacion en simulador antes de desplegar en hardware: la documentacion de FLUX 3 Action indica que los mismos pesos pueden ajustarse a un simulador, lo que permite evaluar la tarea sin riesgo fisico.
- Generacion de trayectorias de referencia para otros controladores: las 32 acciones por paso de inferencia pueden registrarse y utilizarse como demostraciones sinteticas para entrenar politicas mas ligeras o controladores clasicos.
- Docencia y replicabilidad en robotica de manipulacion: el flujo completo (`lerobot-rollout` para ejecutar, `lerobot-train` para entrenar) esta documentado y es ejecutable con un solo robot y dos camaras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este checkpoint concreto. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". La tabla de evaluacion del README esta vacia.

El unico dato de rendimiento disponible corresponde al modelo base FLUX 3 Action, no a este ajuste:

| Modelo | Benchmark | Metrica | Resultado |
|---|---|---|---|
| FLUX 3 Action (base, ajustado sobre DROID) | RoboLab-120 | Exito en tarea | 42,6% (primer puesto segun la documentacion de LeRobot) |
| sovrasov/flux3_policy_black_cubes_20k-ema | No disponible | No disponible | No disponible |

No se dispone de resultados de MMLU, HumanEval, GSM8K ni de metricas equivalentes, ya que el modelo no es un LLM sino una politica robotica.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 14,2 GB solo para los pesos, mas el coste de activaciones del tronco de video a 256x256 con dos camaras. En la practica conviene reservar 20-24 GB.
- VRAM estimada en int8: aproximadamente 7-8 GB de pesos, aunque no se documentan tipos de cuantizacion soportados para esta politica.
- GPU recomendadas: A100 (40/80 GB), H100, L40S. Con 24 GB, una RTX 4090 o RTX 3090 deberia ser suficiente para inferencia en bf16, con margen ajustado.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 4090, RTX 3090) y previsiblemente en tarjetas de 16 GB si se aplica cuantizacion, extremo no documentado.
- Opciones de despliegue: `lerobot-rollout` con estrategia `base` es la via oficial. El modelo se ejecuta en PyTorch/CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo autoregresivo de lenguaje.
- Latencia y throughput: no disponibles. El bucle de control del dataset de entrenamiento es de 30 FPS, por lo que la inferencia debe completarse dentro de ese presupuesto temporal para un control fluido.
- Requisitos adicionales: las claves de camara configuradas en el despliegue deben coincidir exactamente con las usadas en entrenamiento, y el robot debe ser un `PhysicalAIRobot` con puerto serie accesible.

## Comparativa con modelos similares

No se dispone de datos verificables de parametros, contexto, rendimiento o licencia de modelos alternativos dentro de la informacion proporcionada. La comparativa se limita a los tres checkpoints de la familia FLUX 3 Action identificados en la busqueda web, con la mayoria de celdas como "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sovrasov/flux3_policy_black_cubes_20k-ema | 7.083.922.688 | no disponible | sin evaluacion publicada | apache-2.0 | HuggingFace (0 descargas) |
| black-forest-labs/flux-3-action-droid | 7B (segun documentacion de LeRobot) | no disponible | 42,6% en RoboLab-120 | no disponible en la informacion | HuggingFace |
| black-forest-labs/flux-3-action-so101 | no disponible | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| Otras politicas VLA (pi0, OpenVLA, GR00T, etc.) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasa de exito, numero de ensayos ni condiciones de prueba. No hay evidencia cuantitativa de que la politica funcione en el robot real.
- Sobresespecializacion: entrenada sobre 50 episodios de una unica tarea con un unico tipo de objeto (cubos negros) y un unico contenedor. Es previsible una degradacion severa ante cambios de color, forma, iluminacion, posicion del contenedor o presencia de distractores.
- Riesgo de sobreajuste al entorno de grabacion: 20.195 fotogramas y 20.000 pasos con batch size 2 configuran un regimen de ajuste fino agresivo sobre un dataset pequeno.
- Sesgos del dataset: no se documenta la diversidad de posiciones iniciales, condiciones de iluminacion ni variabilidad de los operadores de teleoperacion, por lo que los sesgos inherantes a las demostraciones se transfieren a la politica.
- Alucinacion en el sentido de los LLM no aplica, pero si el riesgo de error compuesto (covariate shift): pequenos desvios en la observacion se acumulan a lo largo de la secuencia de 32 acciones y pueden llevar a estados fuera de la distribucion de entrenamiento.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, pero la licencia de los pesos base de FLUX 3 Action de Black Forest Labs debe verificarse por separado, ya que la informacion disponible no la detalla.
- Idiomas: no hay informacion sobre el soporte de instrucciones en castellano u otras lenguas; la unica tarea registrada esta en ingles.
- Compatibilidad estricta de entradas: los nombres de las camaras y las claves de observacion deben coincidir con los del entrenamiento; cualquier discrepancia impide la ejecucion.
- Seguridad fisica: el modelo emite comandos de motor sobre hardware real. No se documentan limites de par, paradas de emergencia ni procedimientos de validacion, por lo que su despliegue exige supervision y barreras fisicas.
- Estado del repositorio: cero descargas y cero "likes", sin issues ni discusion asociada, lo que reduce la probabilidad de encontrar soporte de la comunidad.
- Pesos EMA: al publicarse la media movil exponencial, no se dispone del checkpoint raw correspondiente, lo que limita la reproducibilidad exacta del entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sovrasov/flux3_policy_black_cubes_20k-ema
- Dataset de entrenamiento: https://huggingface.co/datasets/local/pick-black-cubes-room-2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/pick-black-cubes-room-2
- Codigo de la politica flux3 en LeRobot: https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/flux3
- Guia de FLUX 3 en LeRobot: https://huggingface.co/docs/lerobot/main/en/flux3
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Pesos base ajustados sobre DROID: https://huggingface.co/black-forest-labs/flux-3-action-droid
- Pesos base ajustados sobre SO101: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Sitio del modelo FLUX 3: https://flux3.dev/
- Articulo sobre la familia Flux en Wikipedia: https://en.wikipedia.org/wiki/Flux_(text-to-image_model)
