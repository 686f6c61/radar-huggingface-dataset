# we-dream/pretrain-latent-2kh

## Resumen

`we-dream/pretrain-latent-2kh` es un modelo de tipo vision-language-action (VLA) publicado por la organizacion we-dream bajo el paraguas del proyecto WE-Dream, orientado a robotica y etiquetado por sus autores como world-action-model con representaciones de accion latente. El modelo se distribuye como checkpoint de preentrenamiento, no como modelo afinado para una tarea concreta, lo que implica que su uso previsto es servir de base para posteriores ajustes en dominios roboticos especificos. Cuenta con 22.924.107.603 parametros en formato safetensors y un repositorio de 45,8 GB.

La relevancia del modelo reside en su enfoque: en lugar de predecir acciones directamente en el espacio de comandos del robot, trabaja con acciones latentes, una estrategia que busca aprender dinamicas fisicas y representaciones reutilizables antes de especializar el control motor. Esto lo situa en la linea de los modelos fundacionales para robotica que combinan percepcion visual, comprension del lenguaje y generacion de acciones.

La informacion publica disponible es muy limitada: la model card no aporta detalles sobre arquitectura, datos de entrenamiento, benchmarks ni procedimiento de uso, y el acceso esta restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargar los pesos. Los datos que siguen se limitan a lo verificable en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como VLA / world-action-model) |
| Parametros totales | 22.924.107.603 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 45,8 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo mas alla de su clasificacion como VLA y world-action-model con acciones latentes. El nombre del checkpoint (`pretrain-latent-2kh`) sugiere una fase de preentrenamiento sobre representaciones latentes de accion, pero no se especifica el tipo de backbone (transformer denso, hibrido, MoE), el mecanismo de atencion ni el encoder visual empleado.

Tampoco hay datos sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, porcentaje de datos roboticos frente a datos vision-lenguaje, ni si se aplicaron tecnicas de RLHF, DPO o aprendizaje por imitacion. La unica informacion disponible sobre el entrenamiento es su caracter de preentrenamiento y el tamano del checkpoint (22,9 mil millones de parametros, 45,8 GB en safetensors, lo que corresponde aproximadamente a precision de 16 bits).

## Capacidades

- Procesamiento de entrada visual y de lenguaje, segun su clasificacion como modelo vision-language-action.
- Generacion de acciones para control robotico a partir de observaciones, con representacion latente de la accion.
- Preentrenamiento como base para ajuste posterior en tareas de manipulacion o navegacion (uso previsto inferido de la etiqueta `pretraining`).
- Soporte de ingles como unico idioma declarado.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explicito, modo thinking, audio ni otras modalidades adicionales.
- No se documenta soporte de agentes mas alla del bucle percepcion-accion propio de un modelo VLA.

## Casos de uso

- Base para ajuste fino en manipulacion robotica: el checkpoint puede servir como inicializacion para entrenar politicas especificas de brazo robotico con datos propios, aprovechando el preentrenamiento en acciones latentes para reducir el numero de demostraciones necesarias.
- Investigacion en world-action models: util como punto de partida para estudiar como se estructuran las representaciones latentes de accion y como se transferen entre entornos simulados y reales.
- Navegacion visual en entornos controlados: el componente vision-language permite interpretar instrucciones en lenguaje natural y observaciones de camara para generar comandos de movimiento.
- Preentrenamiento de politicas multi-tarea: al tratarse de un modelo de preentrenamiento, es adecuado para experimentos que comparan estrategias de transferencia entre dominios roboticos.
- Evaluacion de tecnicas de accion latente: permite reproducir y contrastar resultados de investigacion sobre espacios latentes de accion frente a politicas que predicen acciones directamente.
- Prototipado en laboratorio: con 22,9 mil millones de parametros y pesos en safetensors, se puede desplegar en infraestructura de GPU de centro de datos para experimentos de investigacion, aunque no esta pensado para produccion directa sin ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: aproximadamente 46 GB solo para los pesos, mas memoria para activaciones y cache, por lo que se recomienda un minimo de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para inferencia comoda; no se dispone de datos especificos de latencia ni throughput.
- En GPU de consumo: no cabe en tarjetas de 24 GB (RTX 4090) en 16 bits; requeriria cuantizacion, de la que no se distribuyen ficheros oficiales.
- Opciones de despliegue: no documentadas por el autor; al ser un modelo de robotica con pesos safetensors, lo habitual seria cargarlo con la libreria de referencia del proyecto (no indicada) o mediante frameworks de inferencia que soporten el formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| we-dream/pretrain-latent-2kh | 22,9 B | no disponible | apache-2.0 | gated | VLA de preentrenamiento con accion latente |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos equivalentes en la documentacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, no puede descartarse la presencia de sesgos visuales, culturales o de dominio.
- Riesgo de alucinacion no evaluado: no hay benchmarks ni evaluaciones publicadas que permitan estimar la fiabilidad de las acciones generadas.
- Idioma: solo se declara soporte de ingles, lo que limita su uso con instrucciones en castellano sin ajuste adicional.
- Licencia apache-2.0: permite uso comercial, pero el acceso esta restringido (gated) y sujeto a las condiciones de Hugging Face; conviene revisar los terminos del proyecto WE-Dream antes de un despliegue comercial.
- Es un checkpoint de preentrenamiento, no un modelo listo para produccion: requiere ajuste y validacion en el robot objetivo.
- No se documentan requisitos de seguridad fisica; en robotica real es imprescindible anadir capas de limitacion de movimiento y supervision humana.
- Sin datos de contexto maximo, cuantizacion ni latencia, la planificacion de infraestructura debe hacerse con margen y validacion empirica.

## Enlaces

- Hugging Face: https://huggingface.co/we-dream/pretrain-latent-2kh
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados al modelo.
