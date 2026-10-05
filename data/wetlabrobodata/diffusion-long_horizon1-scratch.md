# WetLabRoboData/diffusion-long_horizon1-scratch

## Resumen

`WetLabRoboData/diffusion-long_horizon1-scratch` es una política de manipulación robótica de tipo diffusion policy, publicada por el usuario WetLabRoboData y entrenada con la librería LeRobot. No se trata de un modelo de lenguaje: es un modelo de imitación (imitation learning) que mapea observaciones sensoriales —tres cámaras y el estado del robot— a secuencias de acciones de control para un robot UR3e bimanual. El modelo resuelve la tarea concreta denominada `long_horizon1` y su variante es "scratch", es decir, entrenada únicamente con los datos de esa tarea, sin inicialización desde otro checkpoint.

El modelo cuenta con 264.873.854 parámetros (dato extraído del fichero de pesos en safetensors) y el repositorio ocupa 1,1 GB, un tamaño coherente con pesos almacenados en precisión completa (fp32). Su licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales. La información disponible no detalla la longitud de contexto en el sentido de los modelos de lenguaje, ni los idiomas soportados, ya que el modelo no procesa texto.

La relevancia de esta ficha es doble. Por un lado, documenta un ejemplo de política de difusión entrenada desde cero en LeRobot para una tarea de horizonte largo. Por otro, y de forma más importante, sus resultados de evaluación publicados son de 0 éxitos en 20 episodios, por lo que debe considerarse un punto de partida de referencia o un caso de estudio de fallo de entrenamiento, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy (familia diffusion de LeRobot); detalles internos de la red no disponibles |
| Parametros totales | 264.873.854 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; no se especifican horizonte de observacion ni horizonte de prediccion) |
| Tipos de cuantizacion | No se documentan cuantizaciones; el repositorio contiene safetensors sin cuantizar (1,1 GB para 264,9 M de parametros, compatible con fp32) |
| Idiomas soportados | No aplica / no disponible (modelo de control robotico, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria LeRobot) |
| Tarea objetivo | long_horizon1 |
| Robot | UR3e bimanual con 3 camaras |
| Variante | Scratch (entrenado solo con los datos de esta tarea) |
| Dataset de entrenamiento | WetLabRoboData/lerobot-data-long_horizon1 |
| Episodios de evaluacion | 20 (0 exitos) |
| Tamano del repositorio | 1,1 GB |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna mas alla de su pertenencia a la familia `diffusion-policy` de LeRobot. Se trata, por tanto, de una politica generativa que produce acciones mediante un proceso de difusion, condicionada por las observaciones del entorno: imagenes de tres camaras y el estado del robot UR3e bimanual. Los detalles sobre el tipo de red desruidora (U-Net convolucional, transformer u otra), el numero de pasos de difusion, los horizontes de observacion y prediccion y el tamano de los bloques de accion no estan disponibles en la model card.

Tampoco se documentan el numero de tokens o transiciones de entrenamiento, la composicion del dataset ni el uso de tecnicas de ajuste tipo RLHF o DPO, que en cualquier caso no aplican a este tipo de modelo. Lo unico indicado es que la variante es "scratch", es decir, entrenada exclusivamente con los datos de la tarea `long_horizon1` y sin partir de un checkpoint previo, lo que en la practica implica un coste de datos mayor para generalizar y una mayor sensibilidad al tamano y la calidad del dataset. La model card indica ademas que el modelo fue reorganizado el 2026-10-04 a partir del repositorio `WetLabRoboData/lerobot-data-smrithi-longhorizon1`, y que los artefactos de entrenamiento originales (checkpoints, `train_config.json`, `wandb/`) se conservan en la subcarpeta `old/` del repositorio de origen para trazabilidad.

## Capacidades

- Generacion de acciones de control para un robot UR3e bimanual en la tarea `long_horizon1`, condicionada por tres flujos de camara y el estado del robot.
- Aprendizaje por imitacion: reproduce comportamientos demostrados en el dataset de entrenamiento en lugar de ejecutar una politica programada explicitamente.
- Generacion de acciones multimodales mediante difusion, lo que en principio permite representar distribuciones de acciones multimodales (varias soluciones validas para una misma observacion), siempre que el entrenamiento lo haya capturado.
- Tareas de horizonte largo: la propia denominacion de la tarea (`long_horizon1`) indica que el entrenamiento se diseno para secuencias con muchas etapas.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje, ni agentes basados en texto.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No tiene modo de razonamiento explicito (thinking mode), ni vision-lenguaje, ni audio.
- Rendimiento observado en la tarea para la que fue entrenado: 0 exitos en 20 episodios de evaluacion.

## Casos de uso

- Referencia de linea base en investigacion: sirve como punto de comparacion "scratch" para medir cuantas mejoras aportan el preentrenamiento, el aumento de datos o el ajuste fino desde otros checkpoints en la misma tarea `long_horizon1`.
- Analisis de fallo en politicas de difusion: dado su resultado de 0/20 exitos, es util para estudiar modos de fallo tipicos (sobreajuste al dataset reducido, deriva del efector, perdida de la tarea a largo plazo) antes de escalar el entrenamiento.
- Banco de pruebas de infraestructura LeRobot: permite validar el ciclo completo de `DiffusionPolicy.from_pretrained`, carga de safetensors, ejecucion en simulador o en bucle de rollout y registro de videos de evaluacion, sin necesidad de un modelo entrenado con exito.
- Recopilacion y depuracion del dataset: la brecha entre el entrenamiento y el resultado nulo es un indicador util para auditar la calidad, la sincronizacion y la cobertura del dataset `lerobot-data-long_horizon1`.
- Desarrollo de brazos bimanuales con multiples camaras: la configuracion de tres camaras y dos brazos UR3e sirve como plantilla para montar pipelines de teleoperacion y evaluacion con hardware equivalente.
- Ajuste fino posterior: al ser Apache 2.0 y estar en safetensors, puede usarse como punto de partida para reentrenamientos con mas datos o con datos de otras tareas de laboratorio humedo.
- Estudio de reproducibilidad: la conservacion de los checkpoints y la configuracion original en la subcarpeta `old/` permite reconstruir y auditar el experimento, una practica poco habitual y aprovechable metodologicamente.
- No se recomienda su uso como controlador en entornos fisicos reales sin un reentrenamiento y una evaluacion previos, dado el 0/20 documentado.

## Benchmarks y rendimiento

La model card solo publica la evaluacion de la tarea objetivo. No hay resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

| Tarea | Metrica | Resultado |
|---|---|---|
| long_horizon1 | Episodios de evaluacion | 20 |
| long_horizon1 | Episodios con exito | 0 |
| long_horizon1 | Tasa de exito | 0,0 % |

No se han publicado comparaciones con otras politicas ni metricas adicionales (error de posicion, tiempo de finalizacion, exito parcial) en la informacion disponible.

## Requisitos de hardware

Los pesos ocupan aproximadamente 1,06 GB en fp32 (264,87 M de parametros a 4 bytes) y unos 0,53 GB si se convierten a fp16. Estas cifras son calculos aritmeticos sobre el recuento de parametros publicado; el autor no proporciona requisitos oficiales.

- VRAM estimada para inferencia: en torno a 2-4 GB en fp32, contando pesos, activaciones y los tres flujos de camara en memoria; menos de 2 GB en fp16. Cifra orientativa, no publicada por el autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU con 4 GB o mas de VRAM deberia poder cargar el modelo.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de gama media como la RTX 3060 (12 GB) o superiores, e incluso en gamas con 4-6 GB de VRAM. No confirmado por el autor.
- Opciones de despliegue: LeRobot con PyTorch como via documentada (`DiffusionPolicy.from_pretrained`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de control robotico. El despliegue real requiere ademas un controlador del robot UR3e y acceso a las tres camaras.
- Latencia y throughput estimados: no disponibles. Las politicas de difusion implican varios pasos de desruidado por bloque de accion, por lo que la latencia depende del numero de pasos, no documentado, y condiciona la frecuencia de control alcanzable.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de modelos alternativos, por lo que no es posible rellenar una comparativa con datos verificados.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-long_horizon1-scratch | 264.873.854 | No disponible | 0/20 exitos en long_horizon1 | Apache 2.0 | HuggingFace, libreria LeRobot |
| Otras politicas de LeRobot (ACT, TDMPC, VQ-BeT, SmolVLA) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Diffusion Policy original (referencia metodologica) | No disponible | No disponible | No disponible | No disponible | No disponible |

Alternativas naturales de la misma categoria serian otras politicas implementadas en LeRobot o la propia Diffusion Policy de referencia, pero los datos concretos de parametros, contexto, rendimiento y licencia de esas alternativas no figuran en la informacion disponible.

## Limitaciones y advertencias

- Rendimiento nulo documentado: 0 exitos en 20 episodios de evaluacion sobre la tarea para la que fue entrenado. No debe desplegarse en un robot real sin reentrenamiento y validacion.
- Entrenamiento "scratch" sobre una unica tarea: sin preentrenamiento, la generalizacion a otras tareas, objetos, iluminacion o posiciones de camara es muy improbable.
- Especificidad de hardware: el modelo se ha entrenado para un UR3e bimanual con una configuracion concreta de tres camaras. Cambiar el robot, el numero de camaras o su calibracion invalida las politicas aprendidas.
- Sesgos del dataset: no se documenta la composicion demografica ni operativa del dataset, pero al ser datos de teleoperacion en un laboratorio humedo concreto, el modelo hereda sus sesgos de trayectoria, velocidad y estilo de manipulacion.
- Riesgo de alucinacion en el sentido generativo: como politica de difusion, puede producir acciones plausibles pero incorrectas respecto al objetivo de la tarea, sin ninguna senal de incertidumbre calibrada. En robotica esto implica riesgo fisico.
- Seguridad fisica: cualquier ejecucion sobre hardware real debe hacerse con limites de par, paradas de emergencia y espacio de trabajo despejado de personas.
- Contexto e idioma: no aplica. El modelo no procesa texto ni mantiene una ventana de contexto en el sentido de los modelos de lenguaje.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique los cambios. No se declaran restricciones adicionales, pero tampoco se ofrece garantia alguna, algo relevante dado el rendimiento nulo.
- Trazabilidad: la model card advierte de que el modelo se reorganizo desde otro repositorio y que los artefactos originales estan en `old/`; conviene revisar esa carpeta antes de reproducir cualquier resultado.
- Documentacion incompleta: no hay informacion sobre pasos de difusion, horizontes, hiperparametros de entrenamiento ni numero de demostraciones, lo que dificulta la reproducibilidad.
- Ausencia de mantenimiento: cero descargas y cero "likes" en el momento de redactar la ficha, sin senales de soporte por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WetLabRoboData/diffusion-long_horizon1-scratch
- Dataset de entrenamiento: https://huggingface.co/datasets/WetLabRoboData/lerobot-data-long_horizon1
- Dataset de evaluacion (videos de rollout y resultados por episodio): https://huggingface.co/datasets/WetLabRoboData/eval-diffusion-long_horizon1-scratch
- Repositorio de origen con los artefactos de entrenamiento archivados: `WetLabRoboData/lerobot-data-smrithi-longhorizon1` (subcarpeta `old/`)

La busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo: las entradas obtenidas corresponden a sitios de contenido para adultos sin relacion alguna con el proyecto, por lo que se descartan y no se enlazan. No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo.
