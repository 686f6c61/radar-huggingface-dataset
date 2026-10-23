# SXY7/H-Adapter-8-bottles-checkpoints

## Resumen

H-Adapter-8-bottles-checkpoints no es un modelo de lenguaje, sino un repositorio de checkpoints nativos de entrenamiento para una política robótica de manipulación. En concreto, contiene el resultado del entrenamiento de la política H-Adapter-8 sobre la tarea de mundo real `bottles` (botellas) ejecutada con un brazo derecho. Lo publica el usuario SXY7 en HuggingFace con pipeline `robotics` y el conjunto de 15 checkpoints correspondientes a los pasos de optimizador 10.000 a 150.000, en incrementos de 10.000.

Cada carpeta de checkpoint es un bundle de entrenamiento completo, no un modelo autónomo de Transformers: incluye los pesos de la política H-Adapter, los pesos LoRA, los "policy carriers", el processor/tokenizer, las estadísticas del dataset, los metadatos de la tarea, el estado del optimizador, el scheduler, el estado RNG y el estado del trainer. El VLM preentrenado PRISM, que actúa como dependencia compartida, no se duplica en estos bundles; hay que obtenerlo por separado. Por tanto, para utilizarlo hace falta el loader nativo de checkpoints de H-Adapter-8 y la configuración de tarea de mundo real correspondientes.

Su relevancia es acotada pero concreta: es material de entrenamiento reproducible (o al menos reanudable) de una política VLA para una tarea de manipulación específica, con 15 puntos de control que permiten estudiar la evolución del entrenamiento, hacer ablaciones o seleccionar el checkpoint con mejor comportamiento. No es un modelo para generar texto ni para uso conversacional, y el repositorio no documenta arquitectura, recuento de parámetros, contexto ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card solo indica que se trata de una política H-Adapter-8 con pesos LoRA sobre el VLM preentrenado PRISM (dependencia externa); no se detalla la topología interna |
| Parametros totales | No disponible. El tamaño por checkpoint es de 5.851.365.959 bytes, pero el bundle incluye pesos, optimizador, scheduler y estado del trainer, por lo que no se puede derivar el número de parámetros |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (no aplica como ventana de texto; es una política de control robótico) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors sin variantes cuantizadas publicadas |
| Idiomas soportados | No disponible. La tarea es de manipulación física; el processor/tokenizer depende del VLM PRISM, cuyos idiomas no se especifican |
| Licencia | No disponible |
| Formato de pesos | safetensors (bundle nativo con pesos de política, LoRA, carriers, processor/tokenizer, estadísticas de dataset, metadatos de tarea, optimizador, scheduler, RNG y trainer state) |

Otros datos verificables: 15 checkpoints (pasos 10.000, 20.000, …, 150.000), ~5,85 GB por checkpoint, 77,9 GB de tamaño total del repositorio, subido el 2026-10-22 y actualizado el 2026-10-23. Existe un fichero `upload-verification.json` que, según la model card, se añade una vez los 15 checkpoints pasan la verificación de número de ficheros, tamaño y hash.

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la nomenclatura: una política "H-Adapter-8" con pesos LoRA, apoyada en el VLM preentrenado PRISM como dependencia compartida y no incluida en el repositorio. Los términos "policy carriers" y "dataset statistics" sugieren un pipeline de entrenamiento tipo imitación (behavior cloning) sobre demostraciones reales de la tarea `bottles`, con normalización de observaciones y acciones a partir de estadísticas del dataset, pero esto es una inferencia a partir de los nombres de los artefactos y no un dato documentado.

El entrenamiento alcanza al menos 150.000 pasos de optimizador, con checkpoints cada 10.000 pasos que preservan optimizador, scheduler y estado RNG, lo que permite reanudar el entrenamiento exactamente. No se especifican número de tokens, composición del dataset, número de demostraciones, ni si hubo RLHF/DPO (técnicas, por otra parte, poco habituales en políticas de manipulación). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico de manipulación: genera acciones para un brazo derecho en la tarea de mundo real `bottles`.
- Política condicionada por visión y lenguaje, heredando el backbone perceptual del VLM PRISM (no incluido en el repo).
- Adaptación de bajo rango mediante pesos LoRA incluidos en cada checkpoint.
- Reanudación de entrenamiento: los bundles conservan optimizador, scheduler, RNG y trainer state.
- Barrido de checkpoints: 15 puntos de control para evaluar la evolución del aprendizaje y seleccionar el mejor paso.
- Preprocesado integrado: processor/tokenizer y estadísticas de dataset incluidos en el bundle.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un LLM; no es un modelo de propósito general.
- Capacidades multilingües: no documentadas.
- No hay modo "thinking", visión general, audio ni generación de texto libre documentados.

## Casos de uso

- Evaluación de la curva de aprendizaje: cargar los 15 checkpoints (pasos 10.000 a 150.000) y medir la tasa de éxito en la tarea `bottles` para identificar el punto de saturación o de sobreajuste antes de desplegar.
- Reanudación de entrenamiento con ajustes: partir del checkpoint 150.000 con el estado del optimizador y el scheduler intactos para continuar el entrenamiento con un dataset ampliado o un cambio de hiperparámetros, sin reiniciar desde cero.
- Investigación en adaptadores: comparar el comportamiento de los pesos LoRA en distintos pasos para estudiar cómo se especializa el adaptador sobre el VLM PRISM congelado.
- Ablaciones controladas: usar pares de checkpoints consecutivos para aislar el efecto de 10.000 pasos de entrenamiento adicional en métricas de manipulación, manteniendo constante el resto del pipeline.
- Punto de partida para transferencia a una tarea análoga: inicializar el entrenamiento de una variante (otro objeto, otra posición de bandeja) desde el checkpoint final en lugar de desde el VLM base, reduciendo el coste de entrenamiento.
- Reproducibilidad de experimentos: al incluir processor/tokenizer, estadísticas de dataset y metadatos de tarea, el bundle permite reconstruir el entorno exacto de entrenamiento para replicar resultados publicados.
- Validación en bucle cerrado en simulación antes de hardware: probar la política en un gemelo digital del brazo derecho antes de ejecutar el preflight del dispositivo real que exige la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye tasas de éxito, métricas de error de posición, ni comparaciones con otras políticas. El repositorio tampoco documenta latencia ni frecuencia de control.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Como referencia de orden de magnitud, un bundle completo de checkpoint ocupa ~5,85 GB, pero incluye estado de optimizador y trainer; la inferencia solo necesita pesos de política, LoRA, carriers y el VLM PRISM, por lo que el consumo real depende del tamaño de PRISM (no documentado).
- Almacenamiento: 77,9 GB para el repositorio completo; ~5,85 GB por checkpoint individual si se descarga solo uno, más el VLM PRISM como dependencia aparte.
- GPU recomendadas: no disponibles. No se especifica ni el modelo de GPU usado en entrenamiento ni los requisitos de inferencia.
- GPU de consumo: sin datos para confirmar compatibilidad. Cualquier afirmación al respecto sería especulativa.
- Opciones de despliegue: no se soportan los runners estándar de LLM (vLLM, llama.cpp, Ollama, TGI), ya que no es un modelo de Transformers autónomo. Es necesario el loader nativo de checkpoints de H-Adapter-8 y la configuración de tarea de mundo real, además del preflight del dispositivo robótico indicado por el autor.
- Latencia y throughput: no disponibles. En robótica de manipulación la frecuencia de control es crítica y el autor no publica cifras.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (políticas VLA para manipulación con brazo derecho), ni datos de parámetros, contexto, rendimiento o licencia de alternativas que permitan una comparación rigurosa. Tampoco se dispone de la licencia de este repositorio, lo que impide siquiera comparar ese aspecto.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el VLM PRISM como dependencia externa y el loader nativo de H-Adapter-8; cargarlo como un modelo de Transformers convencional fallará.
- Alcance muy restringido: entrenado para una única tarea (`bottles`) con un brazo derecho concreto. No se documenta su generalización a otros objetos, posiciones u otras morfologías de robot.
- Licencia no disponible: sin licencia explícita no hay autorización clara para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: el comportamiento lingüístico depende de PRISM, cuyas características no se detallan en esta ficha.
- Sin benchmarks ni métricas de éxito publicadas: no hay evidencia cuantitativa del rendimiento de la política.
- Riesgo de alucinación en el sentido de acciones erróneas: como toda política aprendida por imitación, puede producir trayectorias fuera de distribución ante observaciones no vistas; en un robot real esto implica riesgo físico.
- La model card exige explícitamente el preflight del dispositivo antes de la ejecución; ignorarlo puede provocar daños en el hardware o en el entorno.
- Artefactos de verificación: `upload-verification.json` se añade solo tras validar los 15 checkpoints; si no está presente, la integridad del conjunto no está confirmada por el autor.
- Sesgos: no documentados. Al depender de un dataset de demostraciones reales no publicado, los sesgos de las demostraciones (posiciones, iluminación, objetos) se transfieren a la política.
- No apto para generación de texto, razonamiento, código ni tareas de NLP.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SXY7/H-Adapter-8-bottles-checkpoints
- Índice de checkpoints (carpetas `checkpoint-10000` a `checkpoint-150000`): https://huggingface.co/SXY7/H-Adapter-8-bottles-checkpoints/tree/main
- Carpeta del checkpoint final: https://huggingface.co/SXY7/H-Adapter-8-bottles-checkpoints/tree/main/checkpoint-150000

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo; los resultados obtenidos no guardaban relación con el repositorio ni con robótica, por lo que se han descartado. No se dispone de paper, blog técnico, repositorio de código ni demo asociados.
