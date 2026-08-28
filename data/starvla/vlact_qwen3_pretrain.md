# StarVLA/VLAct_Qwen3_Pretrain

## Resumen

VLAct_Qwen3_Pretrain es un checkpoint de continued pre-training para modelos vision-language-action (VLA) desarrollado por el equipo StarVLA. Se basa en el modelo Qwen3-VL-4B-Instruct-Action y está diseñado para mejorar la transferibilidad del conocimiento visual-accion cuando se dispone de una cantidad fija de datos robóticos. El enfoque principal es la representación compartida: en lugar de escalar datos, se optimiza la representación latente para que sea reutilizable en distintos robots, datasets y cabezas de acción.

El modelo se presenta como un backbone reutilizable, no como una política robótica desplegable directamente. Su relevancia radica en que aborda un problema central en robótica: cómo aprovechar al máximo los datos disponibles para que un modelo VLA generalice a nuevas tareas y embodiments sin necesidad de reentrenar desde cero. El checkpoint incluye tres cabezas de acción (OFT, PI y GR00T) que se co-entrenan sobre una representación latente compartida, y se recomienda descartarlas durante el fine-tuning posterior.

Con 100.000 pasos de entrenamiento, 16 GPUs y una mezcla de datos heterogéneos de cinco grupos de datasets robóticos, este checkpoint representa un punto de partida recomendado para adaptar Qwen3-VL-4B a nuevos robots, benchmarks o espacios de acción continuos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL-4B (VLM) con cabezas de accion OFT, PI y GR00T |
| Parametros totales | Aproximadamente 4 mil millones (modelo base Qwen3-VL-4B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (checkpoint en precision completa) |
| Idiomas soportados | No disponibles (modelo orientado a robotica, no a texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-VL-4B-Instruct-Action, un VLM multimodal. Durante el continued pre-training se congelan el encoder de vision y las capas 0-17 del modelo de lenguaje, mientras que el resto se entrena con una mezcla de supervision de imagen-texto y trayectorias roboticas. La innovacion principal es la co-supervision con tres cabezas de accion continuas (OFT, PI y GR00T) que comparten una representacion latente, reduciendo la especializacion en un unico decodificador. Ademas, se utiliza un layout de accion de 20 dimensiones con padding parcialmente unificado entre embodiments, enmascarando dimensiones inactivas y aplicando una funcion de perdida que respeta la periodicidad de las articulaciones.

El entrenamiento se realizo durante 100.000 pasos con 16 GPUs, batch de 16 por GPU, optimizador AdamW con warmup de 5.000 pasos y scheduler coseno. Las tasas de aprendizaje fueron 1e-5 para la interfaz Qwen-VL y 1e-4 para los modulos de accion y base. Los datos provienen de cinco grupos de datasets: InternData-A1, RoboCOIN, DROID, DROID-100 y MolmoAct, complementados con ShareGPT4V-COCO y LLaVA-ReCap CC3M para supervision de imagen-texto. El balanceo entre embodiments es equitativo, con pesos de perdida de 8.0 para brazo simple y 1.0 para brazo dual.

## Capacidades

- Backbone VLA reutilizable para adaptacion a nuevos robots, datasets y espacios de accion continuos.
- Co-supervision con tres cabezas de accion (OFT, PI, GR00T) sobre una representacion latente compartida.
- Soporte multi-embodiment: disenado para datos de AgileX/ALOHA (brazo dual) y Franka (brazo simple).
- Preservacion del prior VLM: el encoder de vision y las capas inferiores del LM permanecen congelados, manteniendo las capacidades de comprension visual y linguistica del modelo base.
- Layout de accion de 20 dimensiones con padding parcialmente unificado, permitiendo transferencia entre distintos espacios de accion.
- No es un modelo de chat ni de generacion de texto estandar; su funcion es servir como punto de partida para fine-tuning en tareas de robotica.

## Casos de uso

- Adaptacion a un nuevo robot: el checkpoint permite inicializar un modelo VLA para un robot con espacio de accion diferente, transfiriendo el backbone compartido y descartando las cabezas de pretraining. Se recomienda inicializar la cabeza de accion desde cero y cargar el backbone con `random_init_action_model=True`.
- Fine-tuning para benchmarks de robotica: el repositorio incluye launchers para RoboTwin 2.0, LIBERO-Plus, VLA-Arena y DOMINO, lo que facilita la evaluacion estandarizada en tareas de manipulacion.
- Desarrollo de politicas con accion continua: al soportar cabezas de accion continuas (OFT, PI, GR00T), es adecuado para tareas que requieren control fino de articulaciones o efector final.
- Investigacion en transferencia entre embodiments: el layout de accion de 20 dimensiones con padding permite estudiar como el conocimiento visual-accion se transfiere entre robots con diferentes grados de libertad.
- Prototipado rapido de modelos VLA: gracias a la arquitectura modular de StarVLA, se puede integrar este checkpoint en pipelines de entrenamiento con configuraciones plug-and-play.
- Evaluacion de estrategias de escalado de datos: al ser un checkpoint de continued pre-training, sirve como referencia para comparar metodos de representacion centrada frente a escalado de datos en robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la informacion disponible. La busqueda web indica que VLAct entro en el leaderboard de RoboDojo, ocupando el puesto 6 de 35 politicas por tasa de exito en la captura del 24 de agosto, superando a todos los modelos de accion mundial designados explicitamente. Sin embargo, no se proporcionan metricas numericas concretas en la documentacion accesible.

## Requisitos de hardware

- No se especifican requisitos de VRAM para inferencia o fine-tuning en la documentacion.
- El entrenamiento del checkpoint se realizo con 16 GPUs, pero no se detalla el modelo exacto de GPU.
- Al tratarse de un modelo de aproximadamente 4 mil millones de parametros, es plausible que pueda ejecutarse en GPUs consumer (por ejemplo, RTX 3090 o RTX 4090) con cuantizacion, aunque no hay datos oficiales al respecto.
- Para fine-tuning, se recomienda un entorno con al menos 24 GB de VRAM si se usa precision completa, aunque esto es una estimacion basada en el tamano del modelo y no en datos proporcionados.
- El despliegue requiere el framework StarVLA, que incluye soporte para entrenamiento distribuido y evaluacion. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generativo estandar.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Sin embargo, se puede situar este modelo en el contexto de otros VLA como OpenVLA (7B) o pi0 (3B), aunque no se han publicado comparaciones cuantitativas en la documentacion accesible. La principal diferencia es que VLAct se centra en el continued pre-training de la representacion, mientras que otros modelos suelen entrenarse desde cero o con fine-tuning directo. La licencia Apache 2.0 es mas permisiva que la de algunos competidores, y el soporte multi-embodiment con layout de accion unificado es una caracteristica distintiva.

## Limitaciones y advertencias

- Este checkpoint no es una politica robótica desplegable: requiere definir contratos de camara, estado, accion, normalizacion y control, y realizar fine-tuning para el embodiment objetivo.
- No es un paquete `transformers.AutoModel` estandar; su uso requiere el framework StarVLA y la estructura de directorios especifica.
- Las cabezas de accion de pretraining deben descartarse si el espacio de accion o el embodiment difieren del original; se recomienda inicializarlas desde cero.
- Los datos de entrenamiento provienen de dominios especificos (AgileX/ALOHA, Franka), por lo que puede haber sesgos hacia esos robots y tareas.
- No se han documentado riesgos de alucinacion, pero al ser un modelo multimodal, podria generar acciones inconsistentes si se usa sin fine-tuning adecuado.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las licencias de los datasets subyacentes (por ejemplo, DROID, RoboCOIN) que pueden tener restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarVLA/VLAct_Qwen3_Pretrain
- Repositorio de codigo: https://github.com/starVLA/VLAct
- Codigo base StarVLA: https://github.com/starVLA/starVLA
- Pagina del proyecto: https://starvla.github.io/VLAct/
- Paper (PDF): https://starvla.github.io/VLAct/assets/VLAct.pdf
- Coleccion de modelos VLAct: https://huggingface.co/collections/StarVLA/vlact-6a903c2e0c176179da425c96
- Guia de preparacion de datos y continued pre-training: https://github.com/starVLA/VLAct/blob/main/scripts/run_scripts/Pretrain/README.md
