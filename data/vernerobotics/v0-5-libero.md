# vernerobotics/v0.5-libero

## Resumen

v0.5-libero es un modelo de acción mundial (world-action model) desarrollado por Verne Robotics, especializado en manipulación robótica. Se trata de un fine-tuning del modelo base vernerobotics/v0.5-base sobre el conjunto de datos LIBERO, un benchmark estándar de aprendizaje de políticas robóticas para tareas de manipulación a largo plazo. El modelo combina la predicción de acciones con la modelización del entorno mediante flow matching, una técnica de generación continua que ha ganado tracción en robótica por su capacidad de producir trayectorias suaves y multimodales.

Con 8.216.402.458 parámetros (aproximadamente 8,2 mil millones) y un tamaño de repositorio de 16,4 GB, el modelo se distribuye en formato safetensors y está etiquetado bajo la pipeline de robótica. Su propósito es generar secuencias de acciones motoras a partir de observaciones visuales y posiblemente instrucciones en lenguaje natural, orientado a entornos de manipulación como los que define LIBERO.

La relevancia actual del modelo radica en la creciente integración de modelos fundacionales en robótica, donde los world-action models buscan unificar percepción, predicción y control. No obstante, el acceso está restringido (gated) y la licencia es específica (verne-v0.5-model-license), lo que condiciona su adopción en producción. El modelo solo declara soporte para inglés y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (world-action model con flow matching) |
| Parametros totales | 8.216.402.458 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | verne-v0.5-model-license |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de las etiquetas del repositorio, que indican "world-action-model" y "flow-matching". Un world-action model combina la predicción del estado futuro del entorno con la generación de acciones, y el flow matching es una técnica de modelización generativa continua que aprende un campo vectorial que transforma una distribución simple (por ejemplo, ruido gaussiano) en la distribución objetivo de acciones o trayectorias. Esto es especialmente adecuado para robótica de manipulación, donde las acciones son continuas y multimodales.

El modelo es un fine-tuning de vernerobotics/v0.5-base sobre LIBERO, un conjunto de tareas de manipulación robótica que incluye escenarios como abrir cajones, colocar objetos en recipientes o interactuar con interruptores. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas continuas para tareas de manipulación, presumiblemente a partir de observaciones visuales.
- Modelización de dinámicas del entorno mediante flow matching, lo que permite predecir trayectorias suaves y multimodales.
- Especialización en el benchmark LIBERO, que cubre tareas de manipulación a largo plazo con instrucciones en lenguaje natural.
- Soporte limitado al idioma inglés, según la etiqueta de idiomas del repositorio.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.
- No se dispone de información sobre capacidades de generación de texto general, código o matemáticas.

## Casos de uso

- Manipulación robótica en entornos de laboratorio: el modelo puede generar secuencias de acciones para tareas como abrir cajones o colocar objetos, aprovechando su entrenamiento específico en LIBERO para políticas de control continuo.
- Investigación en aprendizaje por imitación: sirve como política preentrenada para experimentos de fine-tuning en nuevos conjuntos de tareas de manipulación, reduciendo el coste de entrenamiento desde cero.
- Evaluación de world-action models: útil como referencia para comparar técnicas de flow matching frente a difusión o políticas deterministas en robótica.
- Prototipado de sistemas de control visual-motor: integrable en pipelines de simulación (por ejemplo, MuJoCo o Isaac Sim) para generar trayectorias antes de transferirlas a un robot real.
- Benchmarking de generalización: al estar entrenado en LIBERO, permite medir la transferencia a variantes de tareas y entornos con cambios de iluminación u objetos.
- Educación y divulgación: como ejemplo práctico de modelo fundacional para robótica, aunque el acceso restringido limita su uso en cursos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,2 mil millones de parámetros en precisión FP16, se requieren aproximadamente 16,4 GB solo para los pesos, más memoria para activaciones y buffers. En cuantización de 8 bits, alrededor de 8,2 GB; en 4 bits, unos 4,1 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: para FP16, una GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40 GB, H100). Para cuantización 4 bits, podría caber en GPUs consumer de 8-12 GB, aunque no se documenta soporte de cuantización.
- Cabe en GPU consumer: probablemente en RTX 4090 (24 GB) en FP16; en GPUs de 8 GB solo con cuantización agresiva no documentada.
- Opciones de despliegue: no se especifican. Al ser un modelo de robótica con arquitectura no convencional, es probable que requiera el código propio de Verne Robotics; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Especialidad |
|---|---|---|---|---|---|
| vernerobotics/v0.5-libero | 8,2 B | no disponible | verne-v0.5-model-license | Restringido (gated) | Manipulación robótica (LIBERO) |
| OpenVLA | 7 B | no disponible | MIT (según versión) | Abierto | Manipulación generalista |
| Octo | ~27 M a 93 M | no disponible | Apache 2.0 | Abierto | Políticas robóticas multi-tarea |
| RT-2 (no público) | no disponible | no disponible | no disponible | No público | Visión-lenguaje-acción |

No se dispone de datos de rendimiento comparativo para v0.5-libero, por lo que la comparación se limita a parámetros, licencia y disponibilidad. OpenVLA y Octo son alternativas abiertas con comunidades activas; RT-2 es una referencia industrial no accesible.

## Limitaciones y advertencias

- Acceso restringido: el modelo requiere aceptar condiciones en Hugging Face, lo que puede retrasar o impedir su uso en flujos automatizados.
- Licencia "verne-v0.5-model-license": no es una licencia de código abierto estándar; es necesario revisar los términos para uso comercial, redistribución y modificación.
- Idiomas: solo se declara inglés, lo que limita instrucciones en otros idiomas.
- Especialización estrecha: entrenado en LIBERO, su generalización a otros entornos, robots o tareas no está documentada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Riesgo de alucinación en acciones: como modelo generativo, puede producir trayectorias no válidas o inseguras en entornos reales; se requiere validación en simulación y supervisión humana.
- Sesgos: no documentados, pero los datasets de robótica suelen estar sesgados hacia objetos, iluminación y configuraciones específicas.
- Sin soporte documentado de cuantización ni de frameworks de despliegue estándar, lo que dificulta la producción.

## Enlaces

- Hugging Face: https://huggingface.co/vernerobotics/v0.5-libero
- Modelo base: https://huggingface.co/vernerobotics/v0.5-base
- No se han encontrado papers, blogs, repositorios o demos adicionales en la información proporcionada.
