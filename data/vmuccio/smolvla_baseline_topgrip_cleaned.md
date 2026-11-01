# VMuccio/smolvla_baseline_topgrip_cleaned

## Resumen

SmolVLA es un modelo compacto de tipo vision-language-action (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales y de estado, y de instrucciones en lenguaje natural. Este repositorio concreto, `VMuccio/smolvla_baseline_topgrip_cleaned`, es un ajuste fino del modelo base `lerobot/smolvla_base` realizado por el usuario VMuccio sobre un dataset propio de demostraciones de agarre y colocacion de cubos de colores en una cesta, con un robot de tipo `so_follower` (SO-100/SO-101) y dos camaras (gripper y vista superior).

El modelo resuelve el problema de la imitacion de politicas roboticas de bajo coste: en lugar de emplear modelos VLA de gran tamano que requieren hardware de datacenter, SmolVLA busca un equilibrio entre capacidad y eficiencia computacional para poder ejecutarse en hardware de consumo. Cuenta con aproximadamente 450 millones de parametros (450.046.176 segun los pesos en safetensors) y un repositorio de 0,9 GB, lo que lo situa en la categoria de modelos ligeros.

Es relevante ahora porque el fine-tuning de VLA ligeros sobre robots de bajo coste esta democratizando la investigacion en robotica de imitacion: cualquier laboratorio o aficionado con un SO-100 y un par de camaras puede reproducir el pipeline completo (grabacion, entrenamiento y despliegue) con LeRobot. Este checkpoint en particular es un baseline entrenado con una configuracion concreta (20.000 pasos, batch 64) y sin resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta, basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea del dataset estan en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action compacto segun la model card, pensado para obtener rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo. La informacion disponible no detalla la composicion interna de la arquitectura (backbone visual, codificador de lenguaje, cabecera de acciones), por lo que no se puede confirmar si emplea atencion lineal u otras innovaciones concretas mas alla de lo que indica el paper de referencia.

El ajuste fino se realizo sobre el dataset `VMuccio/rgb_cleaned`, compuesto por 774 episodios y 412.291 fotogramas a 30 FPS, con tres tareas de lenguaje natural: coger el cubo amarillo, azul o rojo y colocarlo en la cesta. La configuracion de entrenamiento fue de 20.000 pasos, batch de 64, optimizador AdamW, learning rate 0,0001 y semilla 1000, usando LeRobot 0.6.2. El modelo consume `observation.state` de forma (6,), tres entradas visuales de (3, 256, 256) y produce una accion de forma (6,). No se documenta el uso de RLHF/DPO ni el numero de tokens de entrenamiento.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 dimensiones (tipicamente posicion y orientacion del efector final mas apertura de pinza) a partir de observaciones de estado y vision.
- Percepcion visual multi-camara: procesa tres flujos de imagen de 256x256 (la model card menciona camaras `gripper` y `top`, aunque define tres entradas visuales).
- Condicionamiento por lenguaje natural: acepta instrucciones de tarea como "Pick the yellow cube and place it into the basket".
- Manipulacion pick-and-place: entrenado especificamente para coger cubos de colores y depositarlos en una cesta.
- Integracion con LeRobot: compatible con las CLI `lerobot-rollout` y `lerobot-train` para despliegue y reentrenamiento.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking; es un modelo de politica robotica, no un asistente conversacional.

## Casos de uso

- Manipulacion pick-and-place en laboratorio: desplegar la politica sobre un SO-100/SO-101 para tareas de clasificacion de objetos por color, usando las camaras `gripper` y `top` como entrada y ejecutando la instruccion de tarea correspondiente.
- Baseline de investigacion en robotica de imitacion: servir como referencia reproducible para comparar nuevas tecnicas de entrenamiento (cambios de learning rate, aumentos de datos, nuevas arquitecturas) sobre el mismo dataset y configuracion.
- Prototipado rapido de politicas VLA: partir de este checkpoint y hacer fine-tuning con `lerobot-train` sobre un dataset propio para validar la viabilidad de un caso de uso antes de invertir en modelos mayores.
- Docencia y formacion: ilustrar el ciclo completo de aprendizaje por imitacion (grabacion con LeRobot, limpieza del dataset, entrenamiento y rollout) en cursos de robotica con hardware asequible.
- Automatizacion de tareas de picking en entornos controlados: usar el modelo como controlador de bajo coste en celdas de trabajo con iluminacion y posiciones de objeto acotadas, donde la variabilidad es limitada.
- Evaluacion comparativa de politicas: emplear este baseline "topgrip" como punto de comparacion frente a otras variantes de agarre o datasets, midiendo tasas de exito en las tres tareas de cubos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet").

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 millones de parametros, en precision FP32 los pesos ocupan aproximadamente 1,8 GB; en FP16/BF16 unos 0,9 GB; en cuantizacion de 8 bits unos 0,45 GB. A esto hay que sumar el coste de procesar tres imagenes de 256x256 y el estado, por lo que se recomienda al menos 4-6 GB de VRAM en la practica.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas, como RTX 3060, RTX 4060, RTX 4090; tambien A100/H100 si se entrena. Para inferencia en tiempo real a 30 FPS se recomienda una GPU de gama media-alta.
- Cabe en GPU de consumo: si, previsiblemente en RTX 3060/4060 y superiores, dado el tamano del modelo y el repositorio de 0,9 GB.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VMuccio/smolvla_baseline_topgrip_cleaned | 450 M | no disponible | VLA robotica (pick-and-place) | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion | no disponible | VLA robotica (base general) | no disponible en la informacion | Hugging Face |
| Otros VLA de gran tamano (p. ej. familias tipo OpenVLA) | no disponible en la informacion | no disponible | VLA robotica | no disponible en la informacion | no disponible |

La comparativa se limita al modelo base del que deriva; no se dispone de datos de rendimiento ni de especificaciones de alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente para tres tareas concretas (coger cubo amarillo, azul o rojo y ponerlo en la cesta) sobre un robot `so_follower`; no generaliza a otras tareas, objetos o morfologias sin reentrenamiento.
- Requiere que las camaras y sus nombres coincidan con las claves de observacion del entrenamiento (`gripper`, `top`); un montaje distinto degradara el rendimiento.
- Sin resultados de evaluacion publicados: no hay evidencia cuantitativa de tasa de exito, por lo que no debe asumirse robustez en produccion.
- Riesgo de sobreajuste al dataset `VMuccio/rgb_cleaned` (774 episodios, iluminacion y posiciones concretas); la variabilidad de objetos, fondos o condiciones de luz puede reducir la fiabilidad.
- No se documentan sesgos especificos ni capacidades multilingues; las instrucciones de tarea estan en ingles.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; verificar la licencia del modelo base y del dataset subyacente antes de un despliegue comercial.
- El modelo no es un asistente de texto: no debe usarse para generacion de lenguaje, codigo o razonamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VMuccio/smolvla_baseline_topgrip_cleaned
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/VMuccio/rgb_cleaned
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=VMuccio/rgb_cleaned
