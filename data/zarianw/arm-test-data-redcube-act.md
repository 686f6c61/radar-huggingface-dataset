# zarianw/arm-test-data-redcube-act

## Resumen

arm-test-data-redcube-act es una política de manipulación robótica entrenada por imitación con el método Action Chunking with Transformers (ACT), publicada por el usuario zarianw en Hugging Face y generada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es una red de 51.668.614 parámetros que consume el estado articular de un brazo robótico (vector de 6 dimensiones) junto con tres flujos de cámara (muñeca, frontal y superior) y produce comandos de acción de 6 dimensiones.

El modelo resuelve una única tarea de pick-and-place: "Grab the red cube and place in green cup". Se entrenó sobre un dataset de teleoperación de 50 episodios y 26.682 fotogramas grabados a 30 FPS con un robot de tipo `so_follower` (familia SO-100/SO-101), durante 50.000 pasos con AdamW y una tasa de aprendizaje de 1e-05.

Su relevancia es doble: por un lado, es un ejemplo reproducible y ligero (0,2 GB de repositorio) del flujo completo de LeRobot (grabar datos con `lerobot-record`, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`); por otro, sirve como punto de partida para fine-tuning en tareas de manipulación propias. Conviene tratarlo como artefacto de investigación: acumula 17 descargas, 0 likes y no tiene resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imitación ACT (Action Chunking with Transformers): codificador visual convolucional y transformer que predice chunks de acciones en lugar de pasos individuales |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de texto; la política consume una ventana de observaciones recientes y emite un chunk de acciones. El tamano de chunk no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible; no se documentan variantes cuantizadas ni ficheros GGUF/INT8 |
| Idiomas soportados | no aplica: no es un modelo de lenguaje. La instruccion de tarea se pasa como cadena de texto, en este caso en ingles ("Grab the red cube and place in green cup") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tipo de politica | ACT (`policy.type=act`) |
| Robot objetivo | `so_follower` |
| Camaras | `wrist` (3, 480, 640), `front` (3, 480, 640), `top` (3, 600, 960) |
| Entrada de estado | `observation.state`, forma (6,) |
| Salida | `action`, forma (6,) |
| Dataset de entrenamiento | zarianw/arm-test-data-redcube_20260912_163047: 50 episodios, 26.682 fotogramas, 30 FPS |
| Pasos de entrenamiento | 50.000 |
| Tamano de lote | 16 |
| Optimizador | AdamW |
| Tasa de aprendizaje | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.2 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice secuencias cortas de acciones (chunks) en lugar de un unico paso, lo que reduce el problema de horizonte de decision y suele mejorar las tasas de exito frente a politicas paso a paso. La politica combina un codificador visual que procesa las tres camaras con un transformer encoder-decoder que integra el estado articular y genera el chunk de acciones; el articulo de referencia del metodo es arXiv:2304.13705. Este checkpoint concreto es una instancia entrenada por un tercero con LeRobot 0.6.2, con 51.668.614 parametros en total.

El entrenamiento se realizo exclusivamente por imitacion supervisada sobre teleoperacion humana: no se documenta RLHF, DPO ni ningun otro ajuste por preferencias, algo que no tendria sentido en este dominio. Los datos provienen de 50 episodios (26.682 fotogramas a 30 FPS) de una sola tarea sobre un `so_follower` equipado con tres camaras. La configuracion reportada es de 50.000 pasos, lote de 16, AdamW, tasa de aprendizaje 1e-05 y semilla 1000. No se indica la composicion de aumentos de datos, el tamano de chunk ni la presencia de regularizacion adicional.

## Capacidades

- Generacion de acciones de manipulacion de 6 grados de libertad a partir de observacion visual y estado articular, en la tarea concreta de coger un cubo rojo y depositarlo en una taza verde.
- Percepcion multi-camara: procesa simultaneamente una camara de muneca y dos camaras externas (frontal y superior) a 30 FPS.
- Prediccion de chunks de acciones, lo que desacopla la frecuencia de inferencia de la frecuencia de control del robot.
- Ejecucion de politicas entrenadas por imitacion sobre hardware `so_follower` mediante el comando `lerobot-rollout`.
- Capacidad de servir como inicializacion para fine-tuning (`lerobot-train --policy.type=act`) en tareas nuevas del mismo robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general ni audio: son capacidades fuera del alcance de una politica de robot.
- No dispone de capacidades multilingues; la unica cadena de texto implicada es el identificador de tarea.

## Casos de uso

- Automatizacion de pick-and-place en laboratorio: colocar un cubo rojo en una taza verde con un brazo SO-100/SO-101, usando `lerobot-rollout --policy.path=zarianw/arm-test-data-redcube-act --task="Grab the red cube and place in green cup"`.
- Baseline de comparacion en investigacion en aprendizaje por imitacion: al estar entrenada con ACT y publicada con su configuracion completa (50.000 pasos, lote 16, AdamW, lr 1e-05), permite reproducir experimentos y contrastar variantes de politica sobre el mismo dataset.
- Fine-tuning para tareas propias: partir de estos pesos con `lerobot-train` y un dataset nuevo del mismo robot y mismas camaras para adaptar la politica a otra tarea sin entrenar desde cero.
- Docencia y formacion en robotica: ejemplo completo y de bajo peso (0,2 GB, 51,7 M de parametros) del ciclo teleoperacion-entrenamiento-despliegue con LeRobot, ejecutable en hardware asequible.
- Pruebas de regresion de pipelines de robotica: verificar que una instalacion de LeRobot 0.6.2, la calibracion del brazo y las tres camaras funcionan correctamente antes de invertir tiempo en una tarea mas compleja.
- Prototipado de celulas roboticas de bajo coste: validar la viabilidad de una estacion de pick-and-place con camaras USB convencionales y una GPU de gama media antes de escalar a un montaje industrial.
- Evaluacion de robustez ante cambios de posicion, iluminacion o distractores: no hay resultados publicados, pero el modelo es un candidato adecuado para medir experimentalmente la degradacion de una politica ACT entrenada con solo 50 episodios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card incluye la linea "_No evaluation results have been provided for this policy yet._" y deja vacia la tabla de evaluacion (tarea, ensayos, exitos, tasa de exito). No se dispone, por tanto, de tasas de exito en robot real, ni de comparaciones con MMLU, HumanEval, GSM8K u otros benchmarks, que ademas no aplican a una politica de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 207 MB para los pesos en fp32 (51.668.614 x 4 bytes) y unos 103 MB en fp16/bf16, mas activaciones y buffers de las tres imagenes (dos de 480x640 y una de 600x960). En la practica, menos de 2 GB de VRAM.
- Cabe en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060 (12 GB), RTX 4090 (24 GB), etc. No requiere A100 ni H100.
- Inferencia en CPU: viable por tamano de modelo, aunque el limite practico lo impone la captura de tres camaras a 30 FPS y el presupuesto de latencia por paso.
- Entrenamiento: una GPU con soporte de precision mixta y al menos 8-12 GB es suficiente para reentrenar una politica ACT de este tamano con lote 16.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) sobre PyTorch, con pesos en safetensors. No hay soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. El sistema de chunking de ACT esta disenado para tolerar latencias de inferencia superiores al periodo de control de 33 ms implicado por los 30 FPS de las camaras.
- Requisitos adicionales de hardware: brazo `so_follower` calibrado, puerto serie accesible y tres camaras OpenCV; los nombres de camara deben coincidir con las claves de observacion (`wrist`, `front`, `top`) usadas en el entrenamiento.

## Comparativa con modelos similares

| Criterio | arm-test-data-redcube-act (ACT) | Politicas de difusion en LeRobot | Politicas VLA en LeRobot |
|---|---|---|---|
| Metodo | Imitacion con transformer y chunking de acciones | Imitacion con modelos generativos de difusion | Vision-language-action con modelo de lenguaje subyacente |
| Parametros | 51.668.614 | no disponible | no disponible |
| Representacion de accion | Chunks de acciones de 6 dimensiones | Secuencias de acciones denoised | Acciones condicionadas por instruccion en lenguaje |
| Licencia | apache-2.0 | no disponible | no disponible |
| Disponibilidad | Pesos publicos en Hugging Face via LeRobot | Implementadas como `policy.type` alternativos en LeRobot | Repositorios independientes dentro del ecosistema LeRobot |
| Rendimiento publicado | Sin resultados de evaluacion | no disponible | no disponible |

La comparacion cuantitativa no es posible con la informacion disponible: no se han encontrado cifras de parametros, contexto ni tasas de exito para las alternativas. La diferencia cualitativa relevante es que las politicas de difusion suelen requerir mas computo por paso de inferencia, mientras que las politicas VLA anaden generalizacion por instruccion en lenguaje a costa de un tamano muy superior. Esta politica ACT es la opcion mas ligera de las tres y la mas limitada en alcance: una sola tarea, un solo robot y una sola instruccion.

## Limitaciones y advertencias

- Sin evaluacion publicada: no existe ninguna medida de tasa de exito en robot real, ni siquiera del propio autor. Cualquier afirmacion de rendimiento seria una extrapolacion.
- Especializacion extrema: entrenada exclusivamente para "Grab the red cube and place in green cup" sobre un unico montaje fisico; no generaliza a otras tareas, objetos ni colores.
- Datos de entrenamiento muy reducidos: 50 episodios y 26.682 fotogramas, lo que favorece el sobreajuste a posiciones, iluminacion, fondo y disposicion de camaras concretas.
- Dependencia del hardware: exige un robot `so_follower` calibrado y tres camaras cuyos nombres e indices coincidan con los del entrenamiento (`wrist`, `front`, `top`). Cambiar la camara superior de 600x960 a otra resolucion puede invalidar la politica.
- Riesgo de acumulacion de errores: al ejecutar chunks de acciones en bucle abierto dentro de cada chunk, un fallo de agarre o una colision no se corrige hasta el siguiente chunk.
- Ausencia de comprension del lenguaje: la cadena de tarea es un identificador, no una instruccion interpretada; el modelo no acepta comandos nuevos ni conversacion.
- Idiomas: no aplica soporte multilingue; el texto de tarea esta en ingles y no afecta al comportamiento mas alla de la correspondencia con el entrenamiento.
- Licencia: apache-2.0 permite uso comercial y modificacion con atribucion, pero la licencia del dataset asociado y las condiciones de uso del hardware son responsabilidad de quien despliegue el sistema.
- Riesgo fisico: es una politica de control sobre hardware real. Debe operarse con limites de par, paradas de emergencia y espacio de trabajo despejado; no hay garantias de comportamiento seguro ante situaciones fuera de distribucion.
- Baja traccion en la comunidad: 17 descargas y 0 likes en el momento de la consulta, sin issues ni discusion documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zarianw/arm-test-data-redcube-act
- Dataset de entrenamiento: https://huggingface.co/datasets/zarianw/arm-test-data-redcube_20260912_163047
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=zarianw/arm-test-data-redcube_20260912_163047
- Articulo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos no guardaban relacion con el modelo.
