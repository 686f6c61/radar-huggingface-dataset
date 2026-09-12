# ut-amrl/foresight-waypoint-policy

## Resumen

Foresight Waypoint Grounding Policy es un checkpoint de política robótica publicado por el laboratorio AMRL de la Universidad de Texas en Austin (organización `ut-amrl` en HuggingFace). Se trata del componente de "grounding" espacial del sistema Foresight, una política de navegación que descubre de forma iterativa pistas visuales relevantes para una instrucción y refina sus planes de movimiento en entornos abiertos. Mientras que el VLM de Foresight propone una trayectoria en el espacio de imagen, este checkpoint eleva ese plan a waypoints métricos en vista de pájaro (BEV) aptos para control de movimiento.

Técnicamente no es un modelo de lenguaje ni un modelo generativo de propósito general, sino un regresor de waypoints multimodal: consume una observación RGB junto con la máscara del plan renderizado y predice 10 waypoints de dimensión 3. La arquitectura combina un encoder de observación basado en Depth-Anything-V2 ViT-S (capas 2/5/8/11, dimensión de salida 384), un encoder de ruta EfficientNet-B0 de un solo canal (dimensión 64) y una cabeza de acción transformer (`TransformerActionHead`) con d_model 128, 8 cabezas, 8 capas y FFN de 384.

Su relevancia es acotada pero clara: se publica bajo licencia Apache-2.0, con el código de despliegue disponible públicamente y una configuración de despliegue para robots con patas ya apuntando a este checkpoint. El repositorio ocupa 0,2 GB y alberga la variante de distancia `48m`, denominada "4.8m planning policy" en las configuraciones de despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de regresion de waypoints: encoder ViT (Depth-Anything-V2 ViT-S) + CNN (EfficientNet-B0) + encoder espacial con softmax espacial + cabeza de accion transformer |
| Parametros totales | no disponible (no declarado por el autor; el repo ocupa 0,2 GB e incluye estado del optimizador) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de politica robotica; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (solo se distribuye checkpoint PyTorch Lightning en precision de entrenamiento) |
| Idiomas soportados | no disponible; no procesa lenguaje directamente (la instruccion en lenguaje natural la aporta el VLM de Foresight) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint completo de PyTorch Lightning (`.ckpt`, archivo `gtpassthrough_xformer_kp384_48m.ckpt`), con `state_dict` y estado del optimizador |
| Encoder de observacion | Depth-Anything-V2 ViT-S, capas 2/5/8/11, dimension de salida 384 |
| Encoder de ruta | EfficientNet-B0, 1 canal de entrada, dimension de salida 64 |
| Encoder espacial | `ConvNetSpatial` sobre EfficientNet-B0, softmax espacial con 384 keypoints y temperatura aprendible |
| Cabeza de accion | `TransformerActionHead`, d_model 128, 8 cabezas, 8 capas, FFN 384 |
| Entrada | Observacion RGB + mascara del plan renderizado |
| Salida | 10 waypoints x 3 dimensiones (BEV metrico) |
| Variante | `48m` (denominada "4.8m planning policy" en los configs de despliegue) |
| Pipeline declarado | robotics |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

El modelo es un pipeline de regresion con tres encoders y una cabeza de accion. El encoder de observacion usa Depth-Anything-V2 ViT-S extrayendo caracteristicas de las capas 2, 5, 8 y 11 con dimension de salida 384; los pesos de este encoder se descargan por separado mediante `install_all.sh`. El encoder de ruta es un EfficientNet-B0 que acepta 1 canal de entrada y produce una representacion de 64 dimensiones. Sobre él se aplica `ConvNetSpatial`, que emplea un softmax espacial con 384 keypoints y temperatura aprendible. La cabeza de accion es un `TransformerActionHead` de d_model 128, 8 cabezas de atencion, 8 capas y FFN de 384, que emite 10 waypoints de dimension 3.

El entrenamiento se realizo durante 50 epochs con AdamW (learning rate 3e-5, weight decay 0,01), schedule coseno con 10 % de warmup, batch size 32 distribuido en 3 GPUs con DDP y perdida Huber sobre la regresion de waypoints. El checkpoint seleccionado es el de mejor `val/loss`. El repositorio incluye `training_config.yaml` con la configuracion Hydra completa de la ejecucion. Al ser un checkpoint completo de PyTorch Lightning, arrastra el estado del optimizador junto al `state_dict`; el cargador de despliegue lee la clave `state_dict` e ignora el resto. No se documentan en la informacion disponible innovaciones como decodificacion especulativa, atencion lineal ni fases de RLHF/DPO, que ademas no aplican a este tipo de modelo.

Los valores de la cabeza de accion (`num_kp: 384`, `dim_feedforward: 384`, `nhead: 8`, `num_layers: 8`) deben coincidir exactamente con el checkpoint o los pesos no cargaran.

## Capacidades

- Prediccion de waypoints metricos: transforma un plan en espacio de imagen más una observacion RGB en 10 waypoints de 3 dimensiones en BEV, listos para control de movimiento.
- Grounding espacial de planes visuales: convierte trayectorias propuestas por un VLM en referencias metricas ejecutables por el robot.
- Percepcion visual monocular: procesa observaciones RGB, sin requerir profundidad explicita en la entrada de este checkpoint.
- Integracion con navegacion guiada por instrucciones: forma parte del sistema Foresight, donde el VLM aporta la interpretacion de la instruccion y las pistas visuales relevantes.
- Navegacion open-world: orientado a entornos no estructurados y objetivos no vistos durante el entrenamiento, segun la descripcion del proyecto.
- Despliegue en robots con patas: existe una configuracion de despliegue (`legged_deployment/config/waypoint_planner.yaml`) preparada para consumir este checkpoint.
- Tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no en este checkpoint; el razonamiento iterativo reside en el VLM de Foresight, no en la politica de waypoints.
- Capacidades multilingues: no aplica.
- Capacidades especiales (modo thinking, vision, audio): vision si (entrada RGB); no dispone de modo de razonamiento explicito ni audio.

## Casos de uso

- Navegacion autonoma de robots moviles en interiores: el modelo traduce el plan visual en waypoints metricos que el controlador de bajo nivel puede seguir, lo que permite cerrar el bucle entre percepcion y movimiento sin heuristicas manuales de proyeccion.
- Control de robots cuadrupedos: la configuracion `legged_deployment` ya apunta a este checkpoint, de modo que puede integrarse directamente en la pila de navegacion de un robot con patas para planificar trayectorias de 4,8 m.
- Navegacion guiada por instrucciones en lenguaje natural: combinado con el VLM de Foresight, permite a un robot recibir una orden abierta ("ve hacia la zona de carga") y ejecutarla como una secuencia de waypoints metricos.
- Investigacion en politicas de navegacion visual: sirve como baseline reproducible de grounding de planes imagen-a-BEV, con configuracion de entrenamiento completa publicada, para comparar frente a otras politicas de navegacion.
- Robots de servicio en almacenes y logistica: seguimiento de rutas hacia estanterias o puntos de recogida a partir de observaciones RGB, con waypoints metricos que simplifican la integracion con planificadores globales.
- Exploracion y mapeo de entornos desconocidos: el sistema Foresight esta orientado a descubrir pistas visuales relevantes de forma iterativa, lo que encaja con tareas de reconocimiento donde el objetivo no esta cartografiado de antemano.
- Sistemas de asistencia a personas con movilidad reducida: planificacion de trayectorias cortas (4,8 m) hacia puntos indicados visualmente, con la instruccion aportada por el modulo de alto nivel.
- Prototipado en simulacion: al ser un checkpoint PyTorch ligero (repo de 0,2 GB), permite iterar rapido en entornos simulados antes de trasladar la politica a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye tablas de evaluacion (ni metricas de exito de navegacion, ni errores de waypoint, ni comparaciones cuantitativas) y los configs de despliegue solo documentan parametros arquitectonicos y de carga de pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: no confirmada por el autor. A partir de los componentes declarados (ViT-S, EfficientNet-B0 y una cabeza transformer de d_model 128), el `state_dict` de inferencia es pequeno; una estimacion razonable es por debajo de 1 GB en fp32, sin contar activaciones ni el resto del pipeline de Foresight.
- Nota sobre el tamano del repositorio: los 0,2 GB incluyen estado del optimizador, por lo que sobreestiman la huella de inferencia.
- GPU recomendadas: cualquier GPU con varios GB de VRAM es suficiente para la politica en si; para entrenamiento, el autor uso 3 GPUs en paralelo con DDP (modelo concreto no disponible).
- Cabe en GPU de consumo: si, con alta probabilidad, en cualquier GPU con al menos 4 GB de VRAM (por ejemplo GTX 1650, RTX 3060, RTX 4090). Estimacion no confirmada por el autor.
- Opciones de despliegue: carga directa del checkpoint con PyTorch / PyTorch Lightning a traves del cargador de `foresight_public`, que lee la clave `state_dict`. No se declaran variantes GGUF, ONNX ni TorchScript. vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. Dependen del hardware del robot, de la resolucion de la observacion RGB y del resto del pipeline de Foresight.
- Requisito adicional: es necesario descargar los pesos de Depth-Anything-V2 ViT-S por separado (`install_all.sh`) para que el encoder de observacion funcione.

## Comparativa con modelos similares

No se dispone de datos verificados de parametros, contexto o rendimiento de los modelos alternativos dentro de la informacion proporcionada, por lo que la comparacion se limita a categoria de tarea y disponibilidad.

| Modelo | Categoria de tarea | Entrada / salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Foresight Waypoint Grounding Policy | Grounding de plan imagen a waypoints metricos BEV | RGB + mascara de plan / 10 waypoints x 3 | Apache-2.0 | HuggingFace + repo de codigo publico |
| GNM (General Navigation Model) | Politica de navegacion visual extremo a extremo | RGB / acciones de control | no disponible en la informacion disponible | Repositorio publico del autor |
| NoMaD | Politica de navegacion con difusion y objetivo enmascarado | RGB + objetivo / acciones | no disponible en la informacion disponible | Repositorio publico del autor |
| ViNT (Visual Navigation Transformer) | Politica de navegacion visual basada en transformer | RGB + objetivo / acciones o waypoints | no disponible en la informacion disponible | Repositorio publico del autor |

Las cifras de parametros, contexto y rendimiento de estos modelos alternativos deben verificarse en sus repositorios y publicaciones originales; no se incluyen aqui para no introducir datos no confirmados.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa instrucciones en lenguaje natural por si mismo. La interpretacion de la instruccion corresponde al VLM de Foresight; este checkpoint solo hace grounding del plan.
- Alcance restringido: la variante publicada es la de distancia `48m` (4.8m planning policy). Su comportamiento fuera de ese horizonte de planificacion no esta documentado.
- Dependencia de componentes externos: requiere los pesos de Depth-Anything-V2 ViT-S, descargados aparte, y los valores de `action_head` deben coincidir exactamente con el checkpoint o la carga fallara silenciosamente en cuanto a pesos.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de predicciones de waypoints incorrectas o fisicamente inviables si la observacion RGB o la mascara del plan son de baja calidad o estan fuera de distribucion.
- Sesgos conocidos: no disponibles. No hay documentacion sobre la composicion del dataset de entrenamiento ni sobre su diversidad de entornos, condiciones de iluminacion o tipos de suelo.
- Idiomas: no aplica; no hay soporte linguistico que evaluar en este checkpoint.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se conserven los avisos de licencia y atribucion correspondientes.
- Estado de validacion: el repositorio registra 0 descargas y 0 likes, y no incluye resultados de evaluacion publicados, por lo que se recomienda validarlo en el entorno de destino antes de usarlo en produccion.
- Reproducibilidad: el checkpoint incluye estado del optimizador y la configuracion Hydra de entrenamiento, pero no se documenta la composicion exacta del dataset, lo que dificulta reproducir el entrenamiento desde cero.
- Dependencias de despliegue: el pipeline completo requiere el codigo de `foresight_public` y sus configuraciones; el checkpoint aislado no es suficiente para operar un robot.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ut-amrl/foresight-waypoint-policy
- Pagina del proyecto Foresight: https://amrl.cs.utexas.edu/foresight/
- Preprint del paper (PDF): https://amrl.cs.utexas.edu/foresight/static/pdfs/ForesightPreprint.pdf
- Referencia arXiv: arXiv:2606.12550 (etiqueta `arxiv:2606.12550` en los metadatos de HuggingFace)
- Codigo: https://github.com/ut-amrl/foresight_public
- Nota sobre la busqueda web: los resultados devueltos corresponden a universidades y entidades no relacionadas con el modelo (Universite Toulouse Capitole, Groupe UT, Universite de Toulouse, Wikipedia "UT"), por lo que no se incluyen como enlaces relevantes.
