# Tridex/model_act_3cam_dino_25K_22_09

## Resumen

El modelo `Tridex/model_act_3cam_dino_25K_22_09` es una política robótica de aprendizaje por imitación entrenada con la librería LeRobot de Hugging Face. Implementa el método ACT (Action Chunking with Transformers), publicado por Zhao et al. (2023), que predice bloques cortos de acciones (action chunks) en lugar de un único paso de control, lo que reduce el error de composición acumulado y suele mejorar la tasa de éxito en tareas de manipulación. El autor es el usuario Tridex y el modelo se distribuye bajo licencia Apache 2.0.

A diferencia de un modelo de lenguaje, no procesa texto ni mantiene conversaciones: consume observaciones multimodales (el estado del robot de 6 dimensiones y tres imágenes de cámara de 480x640 píxeles) y produce un vector de acción de 6 dimensiones. Está entrenado para una única tarea concreta, "take the gaz cylinder and drop it", sobre un brazo seguidor de tipo `so_follower` con cámaras frontal, lateral y superior. La arquitectura es un transformer encoder-decoder con cuantización del tamaño de ~62,5 millones de parámetros según los pesos en safetensors.

Su relevancia es acotada: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluación publicados. Resulta de interés para quienes trabajan con el stack LeRobot, con brazos SO-100/SO-101 y con flujos de imitación que combinan varias cámaras y un encoder visual tipo DINO (según sugiere el nombre del repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (ACT, Action Chunking with Transformers) con codificacion visual multi-camara |
| Parametros totales | 62.473.542 (~62,5 M) |
| Longitud de contexto | no disponible (no aplica: politica robotica, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el prompt de tarea esta descrito en ingles: "take the gaz cylinder and drop it") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.6.1 |
| Tipo de robot | so_follower |
| Camaras | front, side, top (3 camaras, 480x640 px cada una) |
| Entradas | observation.state `(6,)`, observation.images.front `(3, 480, 640)`, observation.images.side `(3, 480, 640)`, observation.images.top `(3, 480, 640)` |
| Salidas | action `(6,)` |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que combina un transformer encoder-decoder con un cuello de botella variacional de tipo CVAE y un backbone de vision. La politica consume el estado propioceptivo del robot y las imagenes de las camaras, y predice un chunk de acciones futuras en lugar de un solo paso, lo que amortigua el error de composicion y permite ejecutar movimientos mas suaves. En este caso concreto hay tres entradas visuales (front, side, top), lo que aporta informacion tridimensional sobre la escena de manipulacion. El nombre del repositorio incluye el termino "dino", lo que sugiere el uso de un encoder visual DINO, pero la model card no documenta explicitamente el backbone, por lo que este punto no esta confirmado.

El entrenamiento se realizo sobre el dataset `Tridex/_20260922_140724`, compuesto por 21 episodios y 22.397 fotogramas a 30 FPS (aproximadamente 12,4 minutos de demostraciones teleoperadas) para una unica tarea. La configuracion registrada es de 10.000 pasos de entrenamiento, batch de 4, optimizador AdamW, learning rate 1e-05 y semilla 1000, con LeRobot 0.6.1. Conviene senalar una discrepancia: el nombre del repositorio incluye "25K" mientras que la tabla de configuracion indica 10.000 pasos; la model card no aclara cual de los dos valores refleja el entrenamiento final. No se documenta el uso de RLHF, DPO ni tecnicas de refinamiento posteriores, algo coherente con el paradigma de imitacion supervisada.

## Capacidades

- Generacion de acciones de control de 6 dimensiones para un brazo `so_follower`, emitidas en forma de chunks.
- Manipulacion guiada por vision con fusion de tres camaras sincronizadas (front, side, top) a 30 FPS.
- Ejecucion de una tarea especifica de pick-and-place: "take the gaz cylinder and drop it".
- Aprendizaje por imitacion a partir de demostraciones teleoperadas; no requiere recompensa ni entorno simulador.
- Integracion nativa con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling ni agentes multi-paso: no es un modelo de lenguaje.
- No dispone de modo "thinking", vision-language, audio ni capacidades multilingues.
- Cobertura de tareas muy limitada: fuera de la tarea entrenada no hay garantia de comportamiento util.

## Casos de uso

- Automatizacion de una celda de pick-and-place: el modelo puede recoger un cilindro de gas y depositarlo en la posicion aprendida, replicando la tarea demostrada en las 21 episodios del dataset de entrenamiento.
- Banco de pruebas para el stack LeRobot: sirve para validar el flujo completo de `lerobot-rollout` con multiples camaras y un brazo SO-100/SO-101 antes de escalar a tareas propias.
- Punto de partida para fine-tuning: al ser un checkpoint ACT de ~62,5 M de parametros con licencia Apache 2.0, puede reentrenarse con `lerobot-train` sobre un dataset propio de otra tarea de manipulacion.
- Recoleccion de datos comparativos: ejecutandolo junto a otras politicas ACT del Hub permite comparar tasas de exito con la misma configuracion de camaras y robot.
- Docencia e investigacion en aprendizaje por imitacion: es un ejemplo compacto de ACT con entrada multi-camara, adecuado para estudiar action chunking y el efecto del numero de vistas en la robustez.
- Evaluacion de infraestructura de inferencia en tiempo real: con 62,5 M de parametros y exigencia de 30 FPS, permite medir latencia de politica en CPU, GPU de consumo o Jetson en un lazo de control real.
- Prototipado de aplicaciones industriales de bajo coste: al caber en hardware modesto, posibilita desplegar una politica de manipulacion sencilla en un brazo de bajo presupuesto sin servidores dedicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente: "No evaluation results have been provided for this policy yet.", y la tabla de evaluacion aparece vacia. Tampoco se aportan tasas de exito en robot real ni en simulacion para esta politica concreta.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 62,5 M de parametros, los pesos en FP32 ocupan aproximadamente 250 MB y en FP16 alrededor de 125 MB, mas el coste de activaciones de las tres imagenes de 480x640.
- GPU recomendadas: cualquier GPU moderna sirve; para mantener 30 FPS con tres flujos de camara son suficientes tarjetas de gama media como RTX 3060, RTX 4060 o superiores.
- GPU de gama alta (A100, H100, RTX 4090): no son necesarias para inferencia; solo tendrian sentido para reentrenar o para procesar lotes grandes.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en iGPU modernas, ya que el modelo es de ~62,5 M de parametros.
- CPU: es viable ejecutar la politica en CPU, aunque mantener 30 FPS con tres camaras depende del encoder visual y del resto del pipeline.
- Edge: Jetson Orin Nano o similar es un candidato razonable para despliegue embebido en el robot.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con backend PyTorch/CUDA; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible. El sistema opera a 30 FPS (33 ms por ciclo) segun la tasa de captura del dataset, pero no se publican mediciones de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tridex/model_act_3cam_dino_25K_22_09 | ACT (politica robotica) | 62,5 M | 3 camaras 480x640 + estado de 6 dim | apache-2.0 | Hugging Face (0 descargas) |
| Otras politicas ACT de LeRobot (p. ej. checkpoints `act` para SO-100/101) | ACT (politica robotica) | no disponible | normalmente 1-2 camaras + estado | habitualmente apache-2.0 | Hub de Hugging Face |
| ACT original del paper (Zhao et al., 2023) | ACT (politica robotica) | no disponible | ALOHA con camaras y estado | investigacion | codigo publico del paper |
| Politicas alternativas de LeRobot (diffusion policy, TDMPC, etc.) | varias | no disponible | variable | variable | Hub de Hugging Face |

No hay datos publicados que permitan comparar rendimiento (tasa de exito, robustez, latencia) entre esta politica y las alternativas. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Tarea unica: solo se ha entrenado para "take the gaz cylinder and drop it". Fuera de esa tarea no hay garantia de comportamiento correcto.
- Dataset muy pequeno: 21 episodios y 22.397 fotogramas (~12,4 minutos) suponen un riesgo alto de sobreajuste y baja generalizacion a nuevas posiciones, iluminaciones u objetos.
- Sin resultados de evaluacion: la model card no publica tasa de exito en robot real ni en simulacion, por lo que el rendimiento es desconocido.
- Riesgo de sobreajuste al entorno: cambios de posicion del cilindro, distractores, iluminacion o un robot distinto del mismo tipo pueden degradar la politica drasticamente.
- Dependencia del hardware de captura: las camaras deben replicar los nombres y la configuracion (`front`, `side`, `top`, 640x480, 30 FPS) empleados en el entrenamiento; cualquier desviacion invalida la inferencia.
- Sin capacidad de lenguaje: no acepta instrucciones en lenguaje natural mas alla del prompt de tarea fijo ni soporta tool calling.
- Reproducibilidad limitada: la discrepancia entre los 10.000 pasos de la configuracion y el sufijo "25K" del nombre del repositorio impide confirmar el entrenamiento exacto.
- Idiomas: no aplica, pero la unica cadena de tarea esta en ingles.
- Licencia: Apache 2.0 permite uso comercial, pero no se ofrece garantia ni soporte del autor; el modelo se publica con 0 descargas y sin mantenimiento conocido.
- Sesgos: no se documentan sesgos, pero al derivar de un dataset minimo de un unico operador y entorno, hereda sus sesgos de ejecucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/model_act_3cam_dino_25K_22_09
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/_20260922_140724
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/_20260922_140724
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no ha devuelto resultados relevantes sobre este modelo; los enlaces listados proceden del Hub de Hugging Face y de la documentacion de LeRobot.
