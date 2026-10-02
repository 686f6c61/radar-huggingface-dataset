# zhuomingliu/MaLoW-Qwen3.5-2B-MLP

## Resumen

MaLoW-Qwen3.5-2B-MLP es un checkpoint de inferencia publicado por el usuario zhuomingliu dentro del trabajo titulado "Memory as Weights: Internalizing Long-Term History for Streaming Videos". No es un modelo de lenguaje autonomo, sino un conjunto de modulos (adaptador de memoria y cabeza de accion) que se monta sobre el modelo base Qwen/Qwen3.5-2B y sobre un adaptador de politica congelado (Qwen3.5-2B-MLP). Su proposito es dotar a un sistema de vision-lenguaje-accion (VLA) de memoria de largo plazo internalizada en los pesos, en lugar de depender de un contexto textual creciente, para tareas de manipulacion robotica y comprension de video en streaming.

El repositorio contiene 174.944.312 parametros en formato safetensors y ocupa 0,7 GB, lo que confirma que se trata de un componente ligero y no del modelo completo. La evaluacion requiere la liberacion del codigo MaLoW, que segun el autor esta preparado localmente pero cuya publicacion publica en GitHub esta pendiente. La licencia declarada es Apache-2.0 para los pesos y metadatos de inferencia, mientras que el modelo base y los recursos de benchmark conservan sus terminos originales.

Es relevante ahora porque aborda un cuello de botella concreto de los agentes roboticos y de los modelos VLA: como mantener informacion historica de un flujo de video sin inflar indefinidamente la ventana de contexto. La propuesta de convertir el historial en pesos (memory-as-weights) es una linea de investigacion activa y este checkpoint es el artefacto de inferencia asociado a ella.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador de memoria y cabeza de accion sobre Qwen3.5-2B (transformers); detalles completos no disponibles |
| Parametros totales | 174.944.312 (pesos del repositorio, excluyendo el modelo base y el adaptador base) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un checkpoint de inferencia asociado al metodo "Memory as Weights: Internalizing Long-Term History for Streaming Videos". Por los tags del repositorio (malow, memory-as-weights, adapter) y por el propio README, el artefacto consiste en modulos de inferencia que se combinan con dos elementos externos obligatorios: el modelo base Qwen/Qwen3.5-2B y el adaptador de politica congelado Qwen3.5-2B-MLP, que actua como base de politica fija. El sistema completo incorpora ademas una cabeza de accion (action head) cuyo diccionario de tensores se carga con el modo restringido weights_only=True de PyTorch.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan innovaciones de decodificacion o mecanismos de atencion concretos. Lo unico verificable es la existencia de un fichero dataset_statistics.json para la normalizacion de acciones, con la clave oxe_bridge para el entorno WidowX, lo que vincula el checkpoint al ecosistema de datos Open X-Embodiment y a tareas de manipulacion robotica.

## Capacidades

- Prediccion de acciones roboticas en tareas de manipulacion (por ejemplo, apilar bloques, colocar un objeto sobre un plato, poner una cuchara sobre una toalla o introducir una berenjena en una cesta).
- Memoria de largo plazo internalizada en pesos para flujos de video en streaming, segun la premisa del trabajo "Memory as Weights".
- Comprension de video en streaming como parte del pipeline de un sistema vision-lenguaje-accion.
- Integracion como adaptador sobre el modelo base Qwen3.5-2B, reutilizando sus capacidades subyacentes (no detalladas en la informacion).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad generica; el foco es la politica de accion.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio dedicado: no disponible mas alla del proposito VLA.

## Casos de uso

- Manipulacion robotica de investigacion en el benchmark Simpler WidowX: el checkpoint se usa junto al modelo base y al adaptador congelado para ejecutar tareas como "Carrot on plate" o "Eggplant in basket", siguiendo docs/vla_evaluation.md.
- Memoria de historial en video en streaming: al internalizar el historial en pesos, permite que un agente mantenga contexto de fotogramas previos sin expandir la ventana de contexto, util en vigilancia o navegacion prolongada.
- Reproduccion de resultados academicos: investigadores que quieran replicar las tasas de exito reportadas del metodo MaLoW sobre Simpler WidowX pueden desplegar este checkpoint con la infraestructura de codigo correspondiente.
- Base para entrenamiento o ajuste de politicas VLA: al ser un adaptador, sirve como punto de partida para experimentar con variantes de memoria sobre Qwen3.5-2B.
- Investigacion en normalizacion de acciones: el fichero dataset_statistics.json con la clave oxe_bridge permite reutilizar el esquema de normalizacion en pipelines propios de Open X-Embodiment.
- Evaluacion comparativa de estrategias de memoria: sirve para contrastar el enfoque memory-as-weights frente a alternativas basadas en contexto extendido en tareas de video largo.

## Benchmarks y rendimiento

La model card reporta tasas de exito de referencia (no una evaluacion nueva de esta exportacion concreta):

| Tarea (Simpler WidowX) | Tasa de exito |
|---|---|
| Stack green block | 0.2916 |
| Carrot on plate | 0.75 |
| Spoon on towel | 0.875 |
| Eggplant in basket | 0.8333 |
| Overall | 0.687475 |

Estos valores son los reportados por el autor para el metodo y no una reevaluacion independiente del checkpoint exportado. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, lo cual es coherente con que se trate de un componente VLA y no de un modelo de lenguaje generalista.

## Requisitos de hardware

- El repositorio ocupa 0,7 GB y contiene 174,9 M de parametros, por lo que el checkpoint en si es muy ligero.
- Es obligatorio descargar ademas el modelo base Qwen/Qwen3.5-2B y el adaptador base Qwen3.5-2B-MLP, de modo que el consumo real de VRAM lo determina principalmente el modelo base de aproximadamente 2.000 millones de parametros.
- VRAM estimada: no disponible de forma explicita; para un base de ~2B en precision completa cabria en GPUs de consumo con 8-12 GB, y en cuantizaciones de 4 bits en torno a 2-4 GB, aunque el dato exacto no esta confirmado en la informacion.
- GPUs recomendadas: no disponible.
- Opciones de despliegue: no disponible (la carga de la cabeza de accion usa el loader restringido de PyTorch; no se mencionan vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han proporcionado modelos comparables en la informacion disponible. Se trata de un componente de investigacion especifico (adaptador de memoria mas cabeza de accion sobre Qwen3.5-2B) ligado a un benchmark concreto (Simpler WidowX), por lo que la comparacion directa con modelos VLA genericos no puede realizarse con los datos aportados.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere obligatoriamente el modelo base Qwen3.5-2B y el adaptador base Qwen3.5-2B-MLP para funcionar.
- La evaluacion exige la liberacion del codigo MaLoW, que a fecha de la model card no estaba publicado en GitHub.
- Las tasas de exito reportadas no proceden de una evaluacion nueva de esta exportacion, sino de resultados de referencia del metodo.
- El alcance de tareas documentado es reducido (cuatro tareas de Simpler WidowX); no hay evidencia de generalizacion a otros entornos o dominios.
- No se documentan sesgos, riesgo de alucinacion, limitaciones de idioma ni de contexto.
- Licencia Apache-2.0 para los pesos y metadatos de inferencia, pero los modelos base y los recursos de benchmark conservan sus terminos originales, lo que condiciona el uso comercial en funcion de dichos terminos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado: se trata de un artefacto de investigacion temprano, sin senales de adopcion ni mantenimiento.
- La busqueda web asociada no devolvio resultados relevantes sobre el modelo; los enlaces encontrados no guardan relacion con MaLoW.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-2B-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Adaptador base congelado: https://huggingface.co/zhuomingliu/Qwen3.5-2B-MLP
- Repositorio de codigo MaLoW (pendiente de publicacion): https://github.com/dragonlzm/MaLoW
- La busqueda web no aporto enlaces adicionales relevantes para este modelo.
