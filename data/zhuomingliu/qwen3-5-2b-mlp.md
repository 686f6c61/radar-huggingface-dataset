# zhuomingliu/Qwen3.5-2B-MLP

## Resumen

Qwen3.5-2B-MLP es un checkpoint de inferencia publicado por el usuario zhuomingliu dentro del trabajo **Memory as Weights: Internalizing Long-Term History for Streaming Videos** (MaLoW). No es un modelo de lenguaje autónomo: se trata de un conjunto de módulos de inferencia (etiquetados como `adapter`) que se montan sobre el modelo base [Qwen/Qwen3.5-2B](https://huggingface.co/Qwen/Qwen3.5-2B), que debe descargarse por separado. El repositorio ocupa 0,4 GB y contiene pesos en formato safetensors junto con metadatos de inferencia para evaluación en tareas de manipulación robótica.

El interés del artefacto es doble. Por un lado, propone un enfoque de "memoria como pesos": en lugar de mantener un historial explícito en el prompt o en un buffer de contexto, la información de largo plazo de un vídeo en streaming se internaliza en los propios pesos de un adaptador MLP. Por otro, se distribuye como un componente evaluable sobre el benchmark Simpler WidowX, con estadísticas de normalización de acciones incluidas y una cabeza de acción (`action-head`) compatible con el cargador restringido `weights_only=True` de PyTorch.

La relevancia actual está limitada por su estado de publicación: la evaluación requiere la release de código MaLoW, cuyo repositorio público en GitHub está pendiente de publicación en el momento de redactar esta ficha. Además, el modelo tiene 0 descargas y 0 likes, la model card no declara idiomas ni pipeline, y los resultados que reporta el autor son tasas de éxito de referencia, no una evaluación nueva de este export concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador MLP sobre transformer decoder (modelo base Qwen/Qwen3.5-2B) |
| Parametros totales | no disponible (el repositorio de adaptadores ocupa 0,4 GB; el base Qwen3.5-2B ronda los 2 000 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors en su precision nativa |
| Idiomas soportados | no disponible (heredados del modelo base, no declarados en la ficha) |
| Licencia | Apache-2.0 (pesos y metadatos de inferencia; los activos del benchmark y el modelo base conservan sus terminos originales) |
| Formato de pesos | safetensors (mas `dataset_statistics.json` para la normalizacion de acciones) |

Otros datos de la ficha: autor `zhuomingliu`, identificador `zhuomingliu/Qwen3.5-2B-MLP`, creado y actualizado el 2 de octubre de 2026, 0 descargas, 0 likes, pipeline no declarado, etiquetas `malow`, `memory-as-weights`, `adapter`, region `us`.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador mas alla de su nombre (`MLP`) y de su naturaleza de modulo de inferencia acoplado a un transformer decoder preentrenado (Qwen3.5-2B). El enfoque declarado, "memory as weights", consiste en internalizar el historial de largo plazo de un flujo de video en los pesos del adaptador, en lugar de depender de un contexto extenso o de un mecanismo de recuperacion externo. El repositorio incluye ademas una cabeza de accion cuya carga se realiza mediante el cargador restringido `weights_only=True` de PyTorch, lo que indica que el modelo produce acciones motoras y no solo texto.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO u optimizacion por preferencias. Tampoco se detalla si el entrenamiento se realizo en simulacion, en datos reales o en una mezcla. El unico componente de datos mencionado es `dataset_statistics.json`, que aporta la normalizacion de acciones y en el que debe usarse la clave `oxe_bridge` para el entorno WidowX, lo que sugiere entrenamiento o evaluacion sobre el conjunto Open X-Embodiment en su variante Bridge.

## Capacidades

- Percepcion visual y prediccion de acciones para manipulacion robotica, integrada en la pila de evaluacion Simpler WidowX.
- Memoria de largo plazo internalizada en pesos para video en streaming, segun el planteamiento del trabajo MaLoW.
- Generacion de acciones normalizadas, con la normalizacion suministrada por `dataset_statistics.json` (clave `oxe_bridge`).
- Inferencia sobre el modelo base Qwen/Qwen3.5-2B, del que hereda cualquier capacidad de modelado de lenguaje no detallada en la ficha.
- Carga de la cabeza de accion con `weights_only=True`, pensada para entornos de carga restringida.
- Soporte de tool calling, function calling, agentes, vision general, audio o modo de razonamiento explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la ficha no declara idiomas.

## Casos de uso

- Evaluacion en el benchmark Simpler WidowX: el checkpoint esta preparado para seguir `docs/vla_evaluation.md` de la release de codigo MaLoW y reportar tasas de exito en las cuatro tareas de referencia (bloque verde sobre torre, zanahoria sobre plato, cuchara sobre toalla, berenjena en la cesta).
- Reproduccion de resultados de investigacion: sirve como punto de partida para replicar las cifras reportadas por el autor (0,5937 de tasa global) siempre que se disponga de la release de codigo y de los activos del benchmark.
- Politicas con memoria para video en streaming: el planteamiento "memory as weights" es aplicable a tareas de manipulacion de horizonte largo donde el historial relevante no cabe comodamente en una ventana de contexto.
- Fine-tuning con datos propios de robotica: al ser un adaptador sobre Qwen3.5-2B con estadisticas de normalizacion separadas, es un candidato para reentrenar la cabeza de accion con otra clave de normalizacion (por ejemplo, otro entorno de Open X-Embodiment).
- Estudio de tecnicas de internalizacion de contexto: util como referencia para comparar contra enfoques de memoria explicita (buffers de contexto, recuperacion externa o resumenes incrementales) en tareas secuenciales.
- Integracion en un pipeline de investigacion en robotica con carga restringida: la compatibilidad con `weights_only=True` facilita el despliegue en infraestructura que exige cargadores de tensores sin ejecucion de codigo arbitrario.
- Generacion de texto, codigo, matematicas o atencion al cliente: no es un caso de uso documentado para este export; el modelo se distribuye como adaptador de accion y requiere el base Qwen3.5-2B por separado.

## Benchmarks y rendimiento

La model card reporta tasas de exito de referencia para Simpler WidowX, indicando explicitamente que no constituyen una evaluacion nueva de este export:

| Tarea (WidowX) | Tasa de exito |
|---|---:|
| Stack green block | 0,208 |
| Carrot on plate | 0,75 |
| Spoon on towel | 0,708 |
| Eggplant in basket | 0,708 |
| Overall | 0,5937 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje, y la busqueda web realizada no aporto ningun dato adicional: los unicos resultados devueltos correspondian a un sitio de aerolinea, sin relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para el adaptador: unos 0,4 GB en disco; en memoria, el adaptador es una fraccion pequena frente al modelo base.
- VRAM estimada para el conjunto base mas adaptador: del orden de 4 a 5 GB en fp16/BF16 para un modelo de ~2 000 millones de parametros, y aproximadamente 1,5 a 2,5 GB con cuantizacion de 4 u 8 bits. Son estimaciones de orden de magnitud, no cifras publicadas por el autor.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) deberia poder alojar el conjunto base mas adaptador en precision reducida.
- Opciones de despliegue: el modelo card no menciona vLLM, llama.cpp, Ollama ni TGI; la evaluacion depende de la release de codigo MaLoW, cuyo repositorio publico esta pendiente. No se documentan pesos GGUF ni cuantizaciones listas para usar.
- Latencia y throughput: no disponible. Al tratarse de una politica de accion sobre video en streaming, la metrica relevante seria la frecuencia de control en el entorno Simpler, que no se publica en la ficha.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Qwen3.5-2B-MLP | Adaptador MLP sobre VLM para acciones (MaLoW) | no disponible (base ~2B) | no disponible | Apache-2.0 | Tasas de exito WidowX reportadas por el autor |
| OpenVLA | Politica vision-lenguaje-accion | no disponible en esta busqueda | no disponible | no disponible en esta busqueda | no disponible |
| pi0 (Physical Intelligence) | Politica vision-lenguaje-accion | no disponible en esta busqueda | no disponible | no disponible en esta busqueda | no disponible |
| Qwen3.5-2B (base) | Transformer decoder de proposito general | ~2B | no disponible | no disponible en esta busqueda | Sin capacidad de accion; requiere adaptador |

No se dispone de datos verificados de estos modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar por separado Qwen/Qwen3.5-2B y, para evaluar, la release de codigo MaLoW, que no estaba publica en el momento de redactar esta ficha.
- Resultados no verificados de forma independiente: las tasas de exito proceden de la propia model card y el autor advierte que son cifras de referencia, no una evaluacion nueva de este export.
- Trazabilidad escasa: 0 descargas, 0 likes, sin pipeline declarado, sin idiomas declarados y sin documentacion de arquitectura, datos de entrenamiento o hiperparametros.
- Uso restringido en la practica al entorno documentado (Simpler WidowX con normalizacion `oxe_bridge`); aplicar el modelo a otro robot o a otro conjunto de acciones sin recalibrar la normalizacion produciria predicciones invalidas.
- Riesgo de alucinacion y de deriva en tareas de horizonte largo: no se documentan evaluaciones de robustez, de sensibilidad a la distribucion visual ni de degradacion de la memoria internalizada con el tiempo.
- Sesgos: no disponibles. No hay informacion sobre la composicion del dataset ni sobre sesgos demograficos, geograficos o de entorno fisico.
- Licencia: los pesos y metadatos del adaptador son Apache-2.0, pero la model card especifica que los modelos base y los activos del benchmark conservan sus terminos originales, por lo que el uso comercial exige revisar `LICENSE` y `NOTICE` y las condiciones de Qwen3.5-2B y del benchmark Simpler WidowX.
- Compatibilidad de cuantizacion no probada: no se publican versiones GGUF, AWQ o GPTQ, y no hay evidencia de que el adaptador y la cabeza de accion funcionen correctamente tras cuantizar el base.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/zhuomingliu/Qwen3.5-2B-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de codigo MaLoW (pendiente de publicacion publica en el momento de redactar esta ficha): https://github.com/dragonlzm/MaLoW
- Paper de "Memory as Weights: Internalizing Long-Term History for Streaming Videos": no disponible
- Demos o espacios asociados: no disponible
- Otros enlaces relevantes: la busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente resultados de un sitio de aerolinea, sin relacion con el contenido de esta ficha)
