# sreetz-nv/so101_contact_perception_dr500_h32_b32_50k_20261009

## Resumen

SO-101 contact and perception randomized policy es un repositorio de pesos (checkpoint de política) publicado por el usuario sreetz-nv en Hugging Face, etiquetado con la librería LeRobot. Contiene un ajuste fino (finetune) del modelo base nvidia/GR00T-N1.7-3B sobre el dataset sreetz-nv/so101_contact_perception_dr500_20261009. No se trata de un modelo de lenguaje de propósito general, sino de una política visomotora orientada a controlar un brazo robótico SO-101 en tareas con contacto físico y con aleatorización de dominio aplicada a la percepción.

El repositorio está reservado al checkpoint de 50.000 pasos y, según su propia model card, el entrenamiento sigue en curso y los pesos todavía no están disponibles. Los únicos hiperparámetros confirmados son H32 (horizonte de acción de 32 pasos), batch de 32, tasa de aprendizaje 1e-4, torre de visión entrenable y módulo de lenguaje congelado. El nombre del repositorio codifica además el experimento (h32, b32, 50k) y la fecha (20261009).

Su relevancia es doble: por un lado, documenta el flujo habitual de LeRobot para adaptar un modelo fundacional de robótica a un brazo de bajo coste; por otro, ilustra prácticas de aleatorización de dominio orientadas a tolerar errores de percepción y a resolver tareas ricas en contacto. Al no existir pesos publicados, benchmarks ni licencia declarada, cualquier evaluación práctica queda pendiente de la publicación del checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; el modelo base pertenece a la familia nvidia/GR00T-N1.7-3B |
| Parámetros totales | Aproximadamente 3.000 millones, según la denominación del modelo base (nvidia/GR00T-N1.7-3B); no confirmado en la model card |
| Parámetros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; la model card indica que el módulo de lenguaje permanece congelado durante el entrenamiento |
| Licencia | No disponible |
| Formato de pesos | No disponible; los pesos aún no se han publicado (repositorio reservado al checkpoint de 50k) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura de nvidia/GR00T-N1.7-3B ni la del ajuste fino resultante. Por las etiquetas del repositorio (librería LeRobot, base_model de la familia GR00T N1) se trata de una política visomotora del tipo visión-lenguaje-acción (VLA), es decir, un modelo que consume observaciones visuales e instrucciones en lenguaje y produce secuencias de acciones motoras. El sufijo h32 del nombre del repositorio corresponde al horizonte de acción de 32 pasos declarado en la model card, es decir, la política predice bloques (chunks) de 32 acciones por inferencia.

En cuanto al entrenamiento, la model card únicamente especifica: horizonte H32, batch de 32, tasa de aprendizaje 1e-4, visión entrenable y lenguaje congelado, con un total previsto de 50.000 pasos sobre el dataset so101_contact_perception_dr500_20261009. Congelar el módulo de lenguaje y entrenar la torre de visión es una práctica habitual para reducir el coste computacional del ajuste fino y preservar las capacidades semánticas del backbone preentrenado. El sufijo dr500 del dataset apunta a un esquema de aleatorización de dominio (domain randomization), aunque su alcance exacto (iluminación, texturas, dinámica, fricción, ruido sensorial) no se describe en la información disponible. No se documentan fases de RLHF, DPO ni otras etapas de alineamiento.

## Capacidades

- Generación de acciones motoras para un brazo robótico SO-101 a partir de observaciones visuales, en lugar de generación de texto.
- Ejecución de tareas de manipulación con contacto físico, según el nombre del repositorio (contact_perception).
- Robustez frente a variaciones de percepción, presumiblemente derivada del esquema de aleatorización de dominio del dataset (dr500); el detalle no está documentado.
- Predicción de bloques de 32 acciones por paso de inferencia (H32), lo que reduce la frecuencia de reevaluación del modelo durante la ejecución.
- Condicionamiento por instrucciones en lenguaje, siempre que el módulo de lenguaje del modelo base lo permita; la model card solo indica que ese módulo se congela durante el ajuste, no qué idiomas cubre.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible; son capacidades propias de modelos de lenguaje conversacionales y no se declaran en este repositorio.
- Capacidades multimodales adicionales (audio, vídeo, thinking mode): no disponibles.

## Casos de uso

- Manipulación con contacto en un SO-101 real: inserción de piezas, encaje de conectores o empuje de objetos, donde la política debe gestionar fuerzas de contacto además del posicionamiento visual.
- Pick-and-place con objetos variables: recogida y colocación de piezas con geometrías y texturas distintas, apoyándose en la aleatorización de percepción del dataset de entrenamiento.
- Investigación en sim2real: uso del checkpoint como política de referencia para medir cuánto de su rendimiento en simulación se transfiere al brazo físico, gracias al esquema de aleatorización de dominio.
- Ajuste fino posterior sobre dominios concretos: al ser un finetune de un modelo base de 3B sobre un brazo SO-101, sirve como punto de partida para especializar la política en una tarea industrial o de laboratorio concreta.
- Recogida de datos y evaluación dentro del ecosistema LeRobot: integrar el checkpoint en los scripts de evaluación y grabación de episodios de la librería para comparar políticas sobre el mismo conjunto de tareas.
- Estudio de robustez de percepción: analizar experimentalmente qué perturbaciones visuales degradan la política y en qué medida el entrenamiento con aleatorización de dominio las mitiga.
- Docencia y prototipado en robótica de bajo coste: emplear un brazo SO-101 y una política preentrenada para ilustrar el ciclo completo de datos, entrenamiento e inferencia sin requerir hardware industrial.
- Benchmark interno de políticas VLA de ~3B: comparar el coste de inferencia y la tasa de éxito frente a alternativas de la misma familia sobre una plataforma homogénea.

Advertencia: los pesos no están publicados en el momento de redactar esta ficha, por lo que ninguno de estos casos de uso puede ejecutarse todavía con este repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. Como referencia orientativa derivada del tamaño del modelo base (unos 3.000 millones de parámetros), una carga en FP16/BF16 requeriría del orden de 6 GB solo para los pesos, más el coste de la torre de visión, la cabeza de acción y las activaciones. Esta cifra es una estimación, no un dato confirmado por el autor.
- GPU recomendadas: no disponibles. Para un modelo de 3B, cualquier GPU con al menos 8-12 GB de memoria suele ser suficiente en precisión completa; no obstante, no hay confirmación oficial para este checkpoint.
- Viabilidad en GPU de consumo: probable en tarjetas con 12 GB o más (por ejemplo, gama RTX xx70/xx80), pero no confirmado. Se desconoce si el pipeline de LeRobot admite cuantización que reduzca el requisito.
- Opciones de despliegue: por las etiquetas del repositorio, el marco previsto es LeRobot (flujos de evaluación y grabación de episodios sobre PyTorch). No se indica compatibilidad con vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que son propios de modelos de lenguaje y no de políticas robóticas.
- Latencia y throughput estimados: no disponibles. En políticas VLA, la latencia relevante es el tiempo por bloque de acciones (32 pasos con H32), pero no se publican mediciones.

## Comparativa con modelos similares

No es posible una comparativa cuantitativa rigurosa con la información disponible: el modelo no publica pesos ni métricas, y la búsqueda web realizada no devolvió documentación técnica relevante. La tabla siguiente recoge únicamente referencias cualitativas de la misma categoría (políticas visomotoras para brazos robóticos), señalando de forma explícita los datos no verificados.

| Modelo | Categoría | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sreetz-nv/so101_contact_perception_dr500_h32_b32_50k_20261009 | Política VLA (finetune) | ~3B según denominación del modelo base | No disponible | No disponible | Pesos no publicados (entrenamiento en curso) |
| nvidia/GR00T-N1.7-3B | Política VLA (modelo base) | No disponible en la información proporcionada | No disponible | No disponible | Es el modelo base declarado |
| Otras políticas integradas en LeRobot (por ejemplo, alternativas de la familia GR00T o políticas tipo ACT/diffusion policy) | Políticas visomotoras | No disponible | No disponible | No disponible | Consultar los repositorios correspondientes |

## Limitaciones y advertencias

- Pesos no disponibles: la model card indica explícitamente que el entrenamiento sigue en curso y que el repositorio está reservado al checkpoint de 50k. El repositorio no es utilizable en producción ni en evaluación hoy.
- Sin licencia declarada: no se especifica ninguna licencia, por lo que no puede afirmarse que el uso comercial esté permitido. Debe consultarse con el autor antes de cualquier despliegue.
- Sin benchmarks: no hay tasas de éxito, métricas de robustez ni comparaciones publicadas, lo que impide estimar su rendimiento real.
- Ámbito muy restringido: es una política específica para un brazo SO-101 con una configuración de cámara y una distribución de tareas concretas. No es un modelo de propósito general ni un modelo de lenguaje conversacional.
- Riesgo de sobreajuste al dominio: aunque el dataset incorpora aleatorización (dr500), se desconoce el alcance de la variación cubierta; cambios en iluminación, cámara, fricción o morfología del robot pueden degradar la política.
- Congelación del módulo de lenguaje: al no ajustarse, el modelo puede mostrar un seguimiento limitado de instrucciones en lenguaje que difieran de las distribuciones vistas durante el ajuste de la cabeza de acción y de la torre de visión.
- Sesgos: no disponible. No se documenta ningún análisis de sesgos, y en robótica el equivalente relevante sería el sesgo hacia las condiciones físicas y los objetos presentes en el dataset de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido habitual de los modelos de lenguaje, pero sí existe el riesgo equivalente de generar trayectorias plausibles que no correspondan a un comportamiento físico seguro; cualquier despliegue en un robot real exige límites de par, paradas de emergencia y supervisión.
- Idiomas: no disponibles. No se indica qué lenguas admite el condicionamiento por lenguaje, ni si este se emplea durante la inferencia.
- Sin soporte declarado de cuantización ni de formatos de despliegue alternativos: no hay información sobre GGUF, ONNX, TensorRT ni cuantizaciones de 8 o 4 bits.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/sreetz-nv/so101_contact_perception_dr500_h32_b32_50k_20261009
- Dataset de entrenamiento: https://huggingface.co/datasets/sreetz-nv/so101_contact_perception_dr500_20261009
- Modelo base declarado: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Librería LeRobot (Hugging Face): https://github.com/huggingface/lerobot
- Repositorio público de la familia GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Nota sobre la búsqueda web: los resultados devueltos fueron enlaces genéricos de portales de noticias (MSN) sin relación con el modelo. No se han encontrado papers, blogs ni demos específicos de este checkpoint.
