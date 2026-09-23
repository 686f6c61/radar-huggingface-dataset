# VibeCuisine/site-gpu-smoke-ai90-act

## Resumen

site-gpu-smoke-ai90-act es un checkpoint de politica robotica entrenado con la libreria LeRobot de Hugging Face. Se trata de un modelo ACT (Action Chunking Transformer) entrenado desde cero, publicado por el usuario VibeCuisine mediante la herramienta Vibe Data Studio. El modelo tiene 51.670.663 parametros y un peso de repositorio de 0,2 GB, lo que lo situa en la categoria de politicas ligeras de manipulacion robotica, no en la de modelos de lenguaje.

Su proposito es controlar un brazo robotico de 7 grados de libertad a partir de tres flujos de camara (base, top y wrist a 640x480 y 20 fps) y de una instruccion en lenguaje natural. La unica instruccion soportada en el entrenamiento es "danse". El modelo aprende a predecir acciones motrices condicionadas visualmente, lo que lo convierte en una politica visuomotora y no en un modelo generativo de texto.

La relevancia de esta ficha es acotada y conviene ser explicito: por el nombre del repositorio ("site-gpu-smoke"), por el volumen de datos (3 episodios, 407 fotogramas) y por el numero de pasos de entrenamiento (10), se trata de una prueba de humo de infraestructura, no de un modelo pensado para produccion. Su valor es el de artefacto de verificacion de un pipeline de entrenamiento de robots, y asi debe interpretarse cualquier uso posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer), entrenada desde cero |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica; no aplica contexto textual) |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (condicionamiento por instruccion de lenguaje natural, pero en el entrenamiento solo aparece la tarea "danse") |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot (revision `39237fa2` citada en la model card) |
| Pipeline declarado | robotics |
| Entradas visuales | `observation.images.top`, `observation.images.wrist`, `observation.images.base` |
| Dimension de accion/estado | 7 (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, tilt) |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es una arquitectura de politica visuomotora basada en transformer con un esquema de autocodificador variacional condicionado (CVAE). El modelo codifica las observaciones visuales mediante un extractor convolucional, las combina con el estado proprioceptivo del robot y con la instruccion de lenguaje, y decodifica un fragmento ("chunk") de acciones futuras en lugar de una sola accion por paso. Esta prediccion por bloques reduce el error de acumulacion y mejora la estabilidad a frecuencias de control altas. La model card indica explicitamente que la politica se entreno "from scratch", es decir, sin inicializacion desde pesos preentrenados.

El entrenamiento se realizo con el comando `lerobot-train` sobre el dataset VibeCuisine/jetson1-060426-test-collection-v1-trim (revision `0308ee7b`), que contiene 3 episodios y 407 fotogramas a 20 fps, recogidos con teleoperacion. La configuracion fue de 10 pasos con batch de 8 (80 muestras procesadas en total) sobre un host del proveedor "site-gpu". No se especifica semilla, no se activo Weights & Biases y no se documenta ninguna fase de RLHF, DPO ni ajuste por preferencias, algo que por otra parte no aplica a este tipo de politicas. No se detalla la composicion del dataset mas alla del recuento de episodios ni el numero de tokens (no aplica). La unica innovacion tecnica reseñable es la propia eleccion de ACT y su representacion de acciones por chunks; el resto de la ficha no aporta innovaciones adicionales.

## Capacidades

- Generacion de acciones motoras: produce comandos de 7 dimensiones (shoulder_pan, shoulder_lift, elbow_flex, wrist_flex, wrist_roll, gripper, tilt) para un brazo robotico.
- Percepcion visual multi-camara: consume tres flujos simultaneos de 640x480 a 20 fps (vista base, vista superior y vista de muñeca).
- Condicionamiento por lenguaje: la politica es "language-conditioned" y espera una instruccion textual en inferencia; en este checkpoint la unica instruccion entrenada es "danse".
- Control visuomotor de extremo a extremo: mapea imagenes y estado del robot directamente a acciones, sin planificacion simbolica intermedia.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso textual ni uso de herramientas externas.
- No soporta vision general (captioning, VQA) ni audio: las camaras son entrada de control, no tarea de percepcion.
- Capacidades multilingues: no disponible; no hay evidencia de generalizacion a otras instrucciones mas alla de la tarea entrenada.

## Casos de uso

- Verificacion de pipelines de entrenamiento: el caso de uso real y documentado es comprobar de extremo a extremo que un host GPU puede ejecutar `lerobot-train` y producir un checkpoint valido. Es exactamente lo que sugiere el nombre "site-gpu-smoke".
- Pruebas de integracion con LeRobot: sirve para validar la carga de pesos safetensors, la resolucion de las claves de observacion (`observation.images.top`, `wrist`, `base`) y la firma de inferencia antes de lanzar entrenamientos costosos.
- Reproducibilidad de configuraciones: al incluir el comando exacto de entrenamiento y las revisiones de dataset y de libreria, permite reproducir la ejecucion y comparar con otros checkpoints del mismo rig.
- Prototipado de control con chunking de acciones: util para medir en banco cuantas acciones por bloque conviene predecir en un brazo de 7 GdL antes de escalar a un dataset grande.
- Docencia y demos sobre ACT: permite ilustrar el flujo completo teleoperacion -> dataset -> entrenamiento -> politica sin necesidad de infraestructura pesada, dado su tamano de 0,2 GB.
- Pruebas de latencia de inferencia en hardware embebido: con 51,7 millones de parametros, es un candidato razonable para medir tiempos de respuesta en Jetson o GPUs de gama baja, aunque no haya datos publicados de latencia.
- Validacion de una plataforma de datos (Vibe Data Studio): el checkpoint acredita que la cadena de materializacion de colecciones, versionado por revision y generacion automatica de model card funciona correctamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de exito en tarea, error de accion, ni evaluaciones en simulador o en robot real. Tampoco se aportan metricas de perdida de entrenamiento. Con 10 pasos de optimizacion sobre 407 fotogramas, cualquier cifra de rendimiento seria ademas poco significativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia orientativa derivada del recuento de parametros (51,67 M), los pesos ocupan aproximadamente 207 MB en FP32, 103 MB en FP16 y 52 MB en INT8; a ello hay que sumar las activaciones del extractor visual y de los tres flujos de imagen a 640x480. Se trata de una estimacion propia, no de un dato del repositorio.
- GPU recomendadas: no especificadas. Por tamano, cualquier GPU con unos pocos GB de VRAM libre es suficiente en principio; el entrenamiento documentado se ejecuto en un host "site-gpu" no identificado.
- Compatibilidad con GPU de consumo: previsiblemente si, incluidas RTX 3060/4060 y superiores, e incluso ejecucion en CPU para pruebas, siempre que se respete la resolucion y el numero de camaras. No hay confirmacion publicada.
- Opciones de despliegue: la via documentada es la libreria LeRobot (`lerobot-train` para entrenamiento y las utilidades de evaluacion/politica de la misma libreria, revision `39237fa2`). Los pesos estan en safetensors. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a una politica robotica.
- Latencia y throughput estimados: no disponible. El unico dato de frecuencia es la captura de datos a 20 fps, que no implica que la inferencia alcance esa tasa.

## Comparativa con modelos similares

Los resultados de busqueda web disponibles no contienen informacion sobre modelos comparables (devuelven exclusivamente contenido de cartelera de cine sin relacion con el repositorio). No hay datos publicados en la model card que permitan una comparacion cuantitativa. Como referencia cualitativa del mismo ecosistema LeRobot:

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| site-gpu-smoke-ai90-act | ACT (from scratch) | 51.670.663 | no aplica | no disponible | Hugging Face, 0 descargas |
| Diffusion Policy | politica generativa por difusion | no disponible | no aplica | no disponible | implementada en LeRobot |
| SmolVLA | VLA (vision-language-action) | no disponible | no aplica | no disponible | implementada en LeRobot |
| Otros checkpoints ACT de LeRobot | ACT | no disponible | no aplica | varia por repositorio | Hugging Face |

No se dispone de cifras de rendimiento comparadas, por lo que la eleccion entre estas alternativas no puede justificarse con los datos aqui recogidos.

## Limitaciones y advertencias

- Entrenamiento testimonial: 3 episodios, 407 fotogramas y 10 pasos de optimizacion con batch 8. Es material de prueba de humo, no un modelo funcional para una tarea real.
- Riesgo alto de sobreajuste: con tan pocas muestras, es esperable que la politica memorice las trayectorias teleoperadas y no generalice a posiciones, iluminacion u objetos distintos.
- Generalizacion linguistica practicamente nula: la unica instruccion vista en entrenamiento es "danse"; no hay evidencia de que responda correctamente a otras ordenes.
- Sesgos conocidos: no documentados por el autor. Cualquier sesgo derivado del operador de teleoperacion, del entorno de captura o del rig quedaria incorporado al modelo sin analisis.
- Riesgo de alucinacion: en el sentido estricto de generacion de texto no aplica; si aplica el riesgo de producir acciones plausibles pero fisicamente incorrectas cuando la observacion se aleja de la distribucion de entrenamiento.
- Limitaciones de contexto e idioma: no hay ventana de contexto textual ni cobertura multilingue documentada.
- Licencia: no disponible. La ausencia de licencia explicita impide asumir permisos de uso comercial, redistribucion o modificacion; hay que contactar con el autor antes de cualquier uso productivo.
- Trazabilidad incompleta: no se especifica semilla, no se publican curvas de entrenamiento y no se detalla el hardware exacto ("site GPU host"), lo que dificulta la reproduccion estricta.
- Ausencia de evaluacion: no hay validacion en robot real ni en simulador, ni tasas de exito por tarea.
- Seguridad fisica: al tratarse de una politica de control, su uso en un brazo real requiere limites de par, paradas de emergencia y supervision humana; el modelo no incorpora ninguna capa de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeCuisine/site-gpu-smoke-ai90-act
- Dataset de entrenamiento: https://huggingface.co/datasets/VibeCuisine/jetson1-060426-test-collection-v1-trim
- Libreria LeRobot (referenciada como `library_name: lerobot` en la model card): https://github.com/huggingface/lerobot
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes para este modelo (corresponden a cartelera de cine y no guardan relacion con el repositorio).
