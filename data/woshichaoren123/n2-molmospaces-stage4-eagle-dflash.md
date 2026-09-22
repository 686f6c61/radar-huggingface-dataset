# woshichaoren123/n2-molmospaces-stage4-eagle-dflash

## Resumen

n2-molmospaces-stage4-eagle-dflash es una politica robotica (policy) de tipo vision-language-action entrenada por el usuario woshichaoren123 dentro del ecosistema GR00T N2, concretamente el checkpoint del paso 100.000 de la etapa 4 (stage-4) del run `TRAJ-stage4-eagle-question_answer-full-fh5s-k10-vfull-eagleplan-subtask_eagle-notrajenc-a4b-replan3-from_vo_200k-bs4x4-lr1e-4` (brazo `qa_a4b_r3`). Resuelve tareas de manipulacion tipo pick, pick-and-place y open sobre un brazo Franka en el simulador MolmoSpaces, generando simultaneamente video y acciones mediante un transformer de difusion.

Tecnicamente es un ensamblaje de dos piezas: un diffusion transformer de Cosmos-Predict2.5 de 2B que hace denoising conjunto de video y acciones (con VAE Wan2.2), y un codificador de texto congelado Eagle-Embodied 4B que se distribuye dentro del checkpoint bajo la clave `text_encoder`. El contexto de cross-attention del modulo de difusion son los hidden states de la respuesta del Eagle, que consiste en una frase de sub-tarea mas 10 waypoints con coordenadas 2D y 3D. El recuento real de parametros en safetensors es de 8.303.691.556 (unos 8,3B), que agrega los 2B del difusor, los 4B del Eagle congelado y el resto de componentes.

Su relevancia es doble: por un lado es un ejemplo poco frecuente de politica VLA que acopla un planificador de sub-tareas en lenguaje natural con waypoints explicitos a un difusor de video-accion; por otro, esta entrenada especificamente con planes decodificados por el drafter DFlash (receta `atomic_2d3d_4b`), lo que la convierte en material de estudio para benchmarking de decodificacion especulativa en robotica. El repositorio solo contiene ficheros de inferencia (pesos, configs y estadisticas), sin estados de optimizador, y tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Cosmos-Predict2.5 2B) para denoising conjunto de video y acciones, con VAE Wan2.2 y cross-attention sobre hidden states de un Eagle-Embodied 4B congelado |
| Parametros totales | 8.303.691.556 (aproximadamente 8,3B en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye pesos en safetensors, sin variantes GGUF/AWQ/GPTQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia detallado en la informacion disponible) |
| Formato de pesos | safetensors (mas configs y estadisticas de normalizacion) |

## Arquitectura y entrenamiento

La arquitectura combina un planificador congelado y un generador difusivo. El planificador es Eagle-Embodied 4B, que recibe la tarea y emite un plan compuesto por una frase de sub-tarea mas 10 waypoints con coordenadas 2D y 3D; sus hidden states se emplean como contexto de cross-attention. El modulo generativo es el diffusion transformer de Cosmos-Predict2.5 (2B) que denoisa video y acciones en paralelo, con el VAE de Wan2.2 para el espacio latente visual. El checkpoint incluye el Eagle congelado como `text_encoder`, por lo que el total de parametros del repositorio supera ampliamente los 2B del difusor.

El entrenamiento corresponde al paso 100.000 de la etapa 4 (stage-4) del run indicado, sobre las tareas Franka de MolmoSpaces. Los planes de entrenamiento se generaron con la decodificacion DFlash del drafter (`dflash_draft`, batch 1) siguiendo la receta del Eagle `atomic_2d3d_4b`, cuyo modelo objetivo es `woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-AR` y cuyo drafter es `woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-DFlash`. La re-planificacion se realiza cada 3 chunks de accion. La model card advierte de forma explicita que en inferencia debe servirse los planes con esa misma receta DFlash: si se usa el otro decodificador, los planes resultantes quedan a unos 3,7 cm de cualquier distribucion vista en entrenamiento, y el fallo es silencioso (no se manifiesta como error de formato).

No se detallan en la informacion disponible el numero de tokens o episodios de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF/DPO. El repositorio contiene unicamente artefactos de inferencia (pesos, configuraciones y estadisticas); los estados del optimizador fueron descartados, por lo que no es posible reanudar el entrenamiento desde este checkpoint.

## Capacidades

- Generacion conjunta de video y acciones (video-action denoising) para control robotico, no solo prediccion de acciones aisladas.
- Ejecucion de tareas de manipulacion sobre Franka en MolmoSpaces: pick, pick-and-place y tareas de tipo open.
- Planificacion jerarquica: consumo de un plan compuesto por una frase de sub-tarea y 10 waypoints con coordenadas 2D y 3D, generado por el planificador Eagle-Embodied 4B.
- Re-planificacion periodica: los planes se regeneran cada 3 chunks de accion, lo que habilita control en bucle cerrado con horizonte corto.
- Condicionamiento multimodal: la politica integra observacion visual (via VAE Wan2.2) y contexto textual/espacial (via cross-attention a los hidden states del Eagle).
- Compatibilidad con decodificacion especulativa DFlash para acelerar la generacion del plan.

No hay evidencia en la informacion disponible de soporte de tool calling, function calling, capacidades de agente generico, razonamiento multi-paso fuera del ambito de la tarea, ni cobertura multilingue declarada.

## Casos de uso

- Manipulacion pick-and-place en simulacion: desplegar la politica sobre un Franka en MolmoSpaces para recoger objetos y colocarlos en ubicaciones objetivo, aprovechando la generacion de video para predecir la evolucion visual de la escena mientras se emiten las acciones.
- Ejecucion de tareas de tipo open: escenarios con objetivos menos estructurados donde el plan en lenguaje natural (frase de sub-tarea) aporta la semantica y los 10 waypoints aportan la guia espacial.
- Investigacion en politicas VLA con planificador explicito: estudiar como afecta el acoplamiento entre un plan textual/espacial y un difusor de acciones al exito de la tarea, sustituyendo o congelando componentes.
- Benchmarking de decodificacion especulativa en robotica: comparar la calidad y el coste de los planes generados con DFlash frente a otros decodificadores, midiendo el impacto en la tasa de exito; la propia model card situa este checkpoint como parte del benchmark de velocidad N2.
- Reproduccion y validacion de resultados: cargar el checkpoint con la receta exacta (`atomic_2d3d_4b` con `dflash_draft`) para replicar las condiciones de entrenamiento y auditar la desviacion de 3,7 cm que aparece con el decodificador incorrecto.
- Base para fine-tuning especifico de tarea: partir de los pesos de inferencia para adaptar la politica a un conjunto reducido de tareas propias, teniendo en cuenta que no se incluyen estados de optimizador y que sera necesario reiniciar el ciclo de entrenamiento.
- Analisis de robustez de planes: usar los waypoints 2D/3D como senal interpretable para diagnosticar en que punto de la trayectoria falla la politica, algo que no es posible con politicas que emiten acciones de forma opaca.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el checkpoint se emplea en el benchmark de velocidad N2 (repositorio `eagle-molmospace-speed`), pero no se proporcionan las cifras medidas, la tasa de exito en las tareas de MolmoSpaces ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada (inferencia): en bf16/fp16 los pesos ocupan aproximadamente 16,6 GB (8,3B de parametros), a lo que hay que sumar el coste de los latentes de video del VAE Wan2.2 y del bucle de denoising del difusor; se recomienda un minimo de 24 GB y, con margen para secuencias de video largas, 40-80 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB. Estas configuraciones son las mas seguras para ejecutar el pipeline completo de video mas acciones.
- GPU de consumo: el checkpoint podria caber en una RTX 4090 (24 GB) o RTX 5090 (32 GB) si se limita la resolucion y la longitud del video generado, pero es un escenario ajustado y no esta confirmado por ningun dato publicado.
- No es viable en GPUs de consumo con menos de 16 GB, salvo cuantizacion agresiva, que no se distribuye con este repositorio.
- Opciones de despliegue: el repositorio esta etiquetado con la libreria `cosmos`, por lo que el camino natural es el stack de inferencia de Cosmos-Predict2.5 junto con el planificador Eagle-Embodied. No hay soporte documentado en esta informacion para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a transformers de lenguaje y no a difusores de video-accion.
- Latencia y throughput: no disponibles. Ademas del coste del difusor, hay que contabilizar el coste del planificador Eagle de 4B y de la decodificacion especulativa DFlash, que es obligatoria para mantener la coherencia con el entrenamiento.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de modelos comparables. A continuacion se indica una comparacion cualitativa por familia, marcando como "no disponible" todo dato no aportado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| n2-molmospaces-stage4-eagle-dflash | 8,3B (incluye planificador de 4B congelado) | no disponible | no disponible | other | HuggingFace, 0 descargas |
| GR00T N2 (familia de referencia, del que este checkpoint es una etapa) | no disponible | no disponible | no disponible | no disponible | no disponible en esta informacion |
| Eagle-Embodied-4B-Robotics-2D3D-AR (planificador objetivo usado en el entrenamiento) | no disponible | no disponible | no disponible | no disponible | HuggingFace (`woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-AR`) |
| Eagle-Embodied-4B-Robotics-2D3D-DFlash (drafter usado en el entrenamiento) | no disponible | no disponible | no disponible | no disponible | HuggingFace (`woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-DFlash`) |

No se dispone de datos para comparar con otras politicas VLA de la misma categoria (por ejemplo, familias tipo pi0, OpenVLA o GR00T N1.x) dentro de la informacion facilitada.

## Limitaciones y advertencias

- Licencia "other" sin terminos detallados en la informacion disponible: antes de cualquier uso comercial es imprescindible contactar con el autor y obtener el texto completo de la licencia. No se puede asumir permiso de uso comercial.
- Dependencia estricta del decodificador: los planes deben servirse con la receta DFlash (`dflash_draft`) del Eagle `atomic_2d3d_4b`. Con otro decodificador, los planes quedan a unos 3,7 cm de la distribucion de entrenamiento y el fallo es silencioso, es decir, no hay senal de error clara.
- Alcance limitado al simulador: el entrenamiento esta acotado a tareas Franka de MolmoSpaces (pick, pick-and-place, open). No hay evidencia de transferencia a un robot fisico ni a entornos distintos.
- Checkpoint unico y no reanudable: corresponde al paso 100.000 de un run concreto y no incluye estados de optimizador, por lo que no se puede continuar el entrenamiento tal cual.
- Ausencia total de validacion externa: 0 descargas y 0 likes, sin benchmarks publicados, sin informe de evaluacion y sin resultados de tasa de exito en las tareas.
- Idiomas soportados no declarados: se desconoce la cobertura linguistica de las sub-tareas generadas por el planificador.
- Riesgo de alucinacion del planificador: al tratarse de un modelo de lenguaje que emite sub-tareas y waypoints, puede generar planes plausibles pero fisicamente inviables o mal alineados con la escena.
- Longitud de contexto no disponible: no se puede dimensionar de antemano cuanta historia de observaciones o cuantos waypoints admite sin degradacion.
- Coste computacional elevado: la generacion de video en el bucle de denoising encarece la inferencia frente a politicas que solo predicen acciones, lo que condiciona su uso en control en tiempo real.
- Uso responsable: cualquier despliegue sobre hardware fisico debe incorporar limites de parada de emergencia y supervision humana; el modelo no ha sido validado para operar sin barreras de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/woshichaoren123/n2-molmospaces-stage4-eagle-dflash
- Planificador objetivo de la receta de planes: https://huggingface.co/woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-AR
- Drafter DFlash de la receta de planes: https://huggingface.co/woshichaoren123/Eagle-Embodied-4B-Robotics-2D3D-DFlash
- Repositorio del benchmark de velocidad N2 (`eagle-molmospace-speed`): referenciado en la model card, URL directa no disponible en la informacion proporcionada
- Paper o blog tecnico: no disponible
- Demo: no disponible
- Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo (corresponden a copias del libro "Think and Grow Rich"); no se ha localizado documentacion adicional del checkpoint por esa via.
