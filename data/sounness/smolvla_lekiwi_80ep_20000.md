# Sounness/smolvla_lekiwi_80ep_20000

## Resumen

SmolVLA LeKiwi 80ep 20000 es un ajuste fino de un modelo vision-lenguaje-accion (VLA) orientado a robotica, publicado por el usuario Sounness en Hugging Face. Parte del modelo base `lerobot/smolvla_base` y se ha entrenado con la libreria LeRobot 0.6.1 sobre un conjunto de datos propio de demostraciones teleoperadas del robot LeKiwi, con el objetivo de ejecutar tareas de recogida y colocacion de una pelota azul en un contenedor rojo. El modelo no es un LLM conversacional: recibe estado del robot e imagenes de camara y devuelve directamente un vector de acciones motoras.

Tecnicamente es un modelo compacto de 450.046.176 parametros (aproximadamente 450 M) con pesos en safetensors y un repositorio de 0,9 GB. Consume `observation.state` de dimension 6 y tres imagenes RGB de 256x256 (camaras `top`, `wrist` y `front`), y produce una accion de dimension 9. Su interes practico radica en que un VLA de este tamano es desplegable en hardware de consumo, algo que la propia model card destaca como objetivo de diseno de la familia SmolVLA.

La relevancia de esta ficha es acotada: se trata de una politica muy especializada, entrenada con 80 episodios y 50.798 fotogramas a 30 FPS, sin resultados de evaluacion publicados y con 0 descargas en el momento de la consulta. Es util como referencia de un flujo completo de imitacion con LeRobot, no como modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) compacta; detalles internos del codificador y del cabezal de acciones no disponibles en la informacion proporcionada |
| Parametros totales | 450.046.176 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible (no es un modelo de contexto textual; consume una observacion por paso) |
| Tipos de cuantizacion | No disponible; pesos distribuidos en safetensors sin variantes GGUF/AWQ/GPTQ publicadas |
| Idiomas soportados | No disponible; las tareas del dataset estan descritas en ingles ("Place blue ball in red container", "Pick blue ball") |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria `lerobot`) |
| Tamano del repositorio | 0,9 GB |
| Tipo de robot | `lekiwi_client` |
| Camaras | `top`, `wrist`, `front` |
| Entrada de estado | `observation.state`, forma `(6,)` |
| Entrada visual | 3 x `observation.images.*`, forma `(3, 256, 256)` |
| Salida | `action`, forma `(9,)` |
| Modelo base | `lerobot/smolvla_base` |

## Arquitectura y entrenamiento

La model card describe SmolVLA (arXiv:2506.01844) como un modelo vision-lenguaje-accion compacto y eficiente, capaz de alcanzar rendimiento competitivo con un coste computacional reducido y desplegable en hardware de consumo. No se detallan en la informacion disponible la composicion exacta del codificador visual, el componente de lenguaje ni el mecanismo de generacion de acciones; para esos detalles se remite al articulo citado. La politica consume una observacion multimodal (estado articular de 6 dimensiones mas tres vistas de 256x256) y emite acciones de 9 dimensiones.

El ajuste fino se realizo sobre `lerobot/smolvla_base` con LeRobot 0.6.1 y el dataset `Sounness/lekiwi_pick_and_place_v2_80ep`, compuesto por 80 episodios, 50.798 fotogramas y 30 FPS. La configuracion de entrenamiento reportada es: 20.000 pasos, tamano de lote 24, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el paradigma es aprendizaje por imitacion (behavior cloning) a partir de demostraciones teleoperadas. Tampoco se especifica el numero total de tokens o muestras vistas ni la composicion exacta de variaciones del dataset.

## Capacidades

- Generacion de acciones motoras de 9 dimensiones para el robot LeKiwi a partir de observaciones visuales y de estado.
- Ejecucion de tareas de manipulacion concretas: "Place blue ball in red container" y "Pick blue ball".
- Fusion de tres vistas de camara simultaneas (`top`, `wrist`, `front`) a 256x256.
- Condicionamiento por instruccion en lenguaje natural (tarea pasada en el rollout).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; la politica produce acciones por paso, sin planificacion explicita documentada.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), vision general, audio o matematica: no disponible; el modelo esta especializado en control robotico.

## Casos de uso

- Recogida y colocacion de objetos en un banco de laboratorio: la politica esta entrenada especificamente para coger una pelota azul y depositarla en un contenedor rojo con el robot LeKiwi, por lo que es util como referencia de un ciclo completo de manipulacion pick-and-place.
- Reproduccion de un pipeline de imitacion de extremo a extremo: sirve para validar el flujo `lerobot-train` -> `lerobot-rollout` documentado en la model card, con un dataset pequeno (80 episodios) y 20.000 pasos de entrenamiento.
- Punto de partida para fine-tuning en una tarea propia: el modelo puede reutilizarse como inicializacion o compararse con un nuevo ajuste desde `lerobot/smolvla_base` para medir la ganancia del entrenamiento adicional.
- Pruebas de despliegue en hardware de bajo coste: con 450 M de parametros y 0,9 GB de pesos, es candidato para verificar latencias de inferencia en GPUs de gama media o en plataformas embebidas tipo Jetson.
- Estudio de sensibilidad a configuracion de camaras: al depender de tres vistas con nombres concretos, permite evaluar como afecta al exito la posicion, el tipo o la ausencia de una camara.
- Docencia y divulgacion sobre VLA: un caso reproducible con robot LeKiwi, dataset publico y licencia Apache 2.0 facilita demostraciones practicas de vision-lenguaje-accion en cursos o talleres.
- Investigacion en generalizacion de politicas: util para medir la degradacion al cambiar posiciones de objeto, iluminacion o presencia de distractores, tal y como sugiere la plantilla de evaluacion de la propia model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", es decir, no hay tabla de tareas, numero de intentos, exitos ni tasa de exito en robot real. Tampoco se aportan metricas de validacion durante el entrenamiento (loss, MSE de acciones) ni comparaciones con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para pesos en precision de 16 bits (450 M x 2 bytes) y en torno a 1,8 GB en fp32, mas el coste de activaciones al procesar tres imagenes de 256x256; en la practica se puede asumir un rango de 2 a 4 GB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090, A100, H100 o Jetson Orin.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de tarjetas modernas con 4 GB o mas, asi como en plataformas embebidas tipo Jetson.
- Opciones de despliegue: LeRobot mediante `lerobot-rollout` (comando documentado en la model card). Otros servidores (vLLM, llama.cpp, Ollama, TGI) no estan soportados para este tipo de politica y no aparece informacion al respecto.
- Latencia y throughput estimados: no disponible. El bucle de control reportado en el ejemplo de rollout funciona a 30 FPS para las camaras, pero no se indica la frecuencia efectiva de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sounness/smolvla_lekiwi_80ep_20000 | 450 M | VLA fine-tune para LeKiwi | Apache 2.0 | Hugging Face, 0 descargas | Entrenado en 80 episodios propios; sin evaluacion publicada |
| lerobot/smolvla_base | Misma familia y arquitectura (el ajuste parte de el) | VLA base preentrenado | Apache 2.0 | Hugging Face | Alternativa directa para reentrenar o comparar |
| Otros VLA de robotica (por ejemplo OpenVLA, pi0) | No disponible en la informacion proporcionada | VLA | No disponible | No disponible | No se aportan datos verificados en esta ficha |

No se dispone de cifras de rendimiento comparadas de estos modelos dentro de la informacion proporcionada, por lo que la comparativa se limita a tamano, licencia y disponibilidad cuando el dato estaba disponible.

## Limitaciones y advertencias

- Politica altamente especializada: solo se ha entrenado para dos tareas concretas ("Pick blue ball" y "Place blue ball in red container") sobre un unico tipo de robot (LeKiwi). No cabe esperar generalizacion a otros objetos, entornos o plataformas sin nuevo entrenamiento.
- Sin resultados de evaluacion: no existe evidencia publicada de tasa de exito, robustez ni repetibilidad, por lo que no se recomienda su uso en produccion sin una validacion propia.
- Dependencia estricta del formato de observacion: requiere `observation.state` de dimension 6, tres camaras con imagenes de 256x256 y nombres de feature coincidentes con los del entrenamiento (`top`, `wrist`, `front` segun la model card). Cambiar indices o resoluciones invalida la politica.
- Riesgo de sobreajuste al entorno de recogida de datos: con 80 episodios y 50.798 fotogramas, variaciones de iluminacion, posicion de objetos o presencia de distractores pueden degradar el comportamiento de forma acusada.
- Riesgo de fallo fisico: al tratarse de control robotico, los errores de la politica pueden provocar colisiones, caidas de objetos o danos en el robot y su entorno; es necesario operar con limites de seguridad y parada de emergencia.
- Idiomas: no hay informacion sobre el soporte multilingue; las instrucciones del dataset estan en ingles.
- Licencia: Apache 2.0, permisiva para uso comercial, pero se debe conservar la atribucion y tener en cuenta que el modelo deriva de `lerobot/smolvla_base`, cuyos terminos conviene revisar.
- Cita obligada: la model card solicita citar el metodo de SmolVLA (arXiv:2506.01844) y LeRobot cuando se utilice la politica.
- Rastro de busqueda: las consultas web realizadas no devolvieron ningun resultado relevante sobre este modelo; los enlaces encontrados trataban sobre nutricion y nada tenian que ver con el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounness/smolvla_lekiwi_80ep_20000
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounness/lekiwi_pick_and_place_v2_80ep
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Sounness/lekiwi_pick_and_place_v2_80ep
- Articulo de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
