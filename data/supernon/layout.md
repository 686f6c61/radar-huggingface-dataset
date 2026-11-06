# supernon/layout

## Resumen

LayOut-VLA es un conjunto de checkpoints del modelo pi0.5 (familia openpi, implementada en JAX/Orbax) publicados por el usuario supernon en Hugging Face bajo el identificador `supernon/layout`. No se trata de un modelo entrenado desde cero, sino de pesos derivados del proyecto LayOut-VLA orientados a tareas de manipulación robótica sobre el benchmark LIBERO. El repositorio contiene tres variantes entrenadas hasta el paso 29999: una línea base LIBERO, una variante "mixed" con profundidad ground-truth (GT depth) y una variante "mixed" con profundidad estimada por DA3.

El modelo pertenece a la categoría de Vision-Language-Action (VLA): recibe observaciones visuales y texto de instrucción y emite acciones motoras, por lo que su uso previsto es el control de robots manipuladores en entornos simulados o reales, no la generación de texto convencional. La arquitectura subyacente es la de pi0.5 de openpi, aunque la model card no detalla hiperparámetros, tamaño de parámetros ni longitud de contexto, y el repositorio no incluye información sobre licencia, idiomas o pipeline.

La relevancia de esta publicación es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card técnica más allá de una tabla de rutas de checkpoints. Resulta útil únicamente para quienes quieran reproducir o comparar las variantes de LayOut-VLA sobre LIBERO, y no debe considerarse un modelo listo para producción ni para uso general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | pi0.5 (openpi, JAX/Orbax); VLA, detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos en formato Orbax, no cuantizados) |
| Idiomas soportados | no disponible (el modelo opera sobre instrucciones de tarea, presumiblemente en inglés, sin confirmación) |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX): directorios `params/`, `train_state/` y `assets/` |

## Arquitectura y entrenamiento

La model card indica que los checkpoints provienen de pi0.5 dentro del proyecto openpi, implementado en JAX y serializado con Orbax. No se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el codificador visual empleado; tampoco se detalla si pi0.5 incorpora componentes de difusión o de flujo para la cabeza de acciones, algo habitual en la familia pi0, pero que aquí no se confirma. La estructura de cada checkpoint incluye `params/` con los pesos de inferencia, `train_state/` con el estado completo del optimizador y EMA para reanudar el entrenamiento, y `assets/` con estadísticas de normalización.

En cuanto a los datos, la nomenclatura de las rutas sugiere entrenamiento sobre el benchmark LIBERO con tres configuraciones: una línea base (`baseline`), una variante "mixed" que combina datos y utiliza profundidad ground-truth (`mixed_gt`) y una variante "mixed" con profundidad estimada por DA3 (`mixed_da3`). Las tres alcanzan el paso 29999, lo que indica una longitud de entrenamiento idéntica y facilita la comparación controlada entre ellas. No se documentan el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste por preferencias; en el ámbito VLA lo habitual es el aprendizaje por imitación, pero no se confirma.

## Capacidades

- Control visomotor para manipulación robótica: el modelo genera acciones a partir de observaciones visuales e instrucciones de tarea, en el marco del benchmark LIBERO.
- Procesamiento de profundidad: dos de las variantes incorporan información de profundidad, una con ground-truth y otra con estimación DA3, lo que permite evaluar el impacto de la profundidad estimada frente a la perfecta.
- Ejecución de políticas entrenadas: los checkpoints están pensados para inferencia directa con el stack openpi, no para fine-tuning genérico.
- Reanudación de entrenamiento: la inclusión de `train_state/` permite continuar el entrenamiento desde el paso 29999 con el estado del optimizador y EMA.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto libre, matemáticas, código, visión general, audio ni modo "thinking".

## Casos de uso

- Reproducción de resultados LIBERO: cargar los tres checkpoints y evaluar la tasa de éxito en las tareas de manipulación de LIBERO para verificar las cifras del proyecto LayOut-VLA, usando `params/` y `assets/` con el pipeline de openpi.
- Comparación de profundidad GT frente a DA3: ejecutar `mixed_gt` y `mixed_da3` sobre el mismo conjunto de episodios para cuantificar la degradación que introduce la profundidad estimada en la política aprendida.
- Ablación de mezcla de datos: contrastar `baseline` con `mixed_gt` para aislar el efecto de la estrategia "mixed" en el entrenamiento, manteniendo constante el paso (29999) y el resto de la receta.
- Reanudación de entrenamiento en investigación: partir de `train_state/` para extender el entrenamiento más allá del paso 29999, por ejemplo con nuevos datos o con ajuste fino sobre tareas específicas.
- Base para transferencia a un robot real: usar los pesos como inicialización para ajuste con datos propios de un manipulador, siempre que se respete el formato Orbax y el stack JAX de openpi.
- Docencia y divulgación: servir de ejemplo práctico de un pipeline VLA completo en JAX, desde la normalización (`assets/`) hasta la inferencia con `params/`, en cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo enumera rutas de checkpoints y pasos de entrenamiento; no incluye tasas de éxito en LIBERO ni comparaciones numéricas entre las variantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros de pi0.5 en esta publicación.
- GPU recomendadas: no disponible; el stack openpi en JAX suele ejecutarse en GPUs NVIDIA con CUDA y, en muchos casos, en TPU, pero no se confirma para estos checkpoints.
- Compatibilidad con GPU de consumo: no disponible; depende del tamaño real del modelo, que no se documenta.
- Opciones de despliegue: inferencia mediante openpi (JAX/Orbax). No se distribuyen pesos en GGUF ni safetensors, por lo que llama.cpp, Ollama o vLLM no son aplicables directamente sin conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LayOut-VLA (este) | no disponible | no disponible | no disponible | Orbax (JAX) | Hugging Face, 0 descargas |
| pi0.5 (openpi original) | no disponible en esta ficha | no disponible | no disponible | Orbax (JAX) | Repositorio openpi |
| Otras variantes LayOut-VLA | no disponible | no disponible | no disponible | Orbax (JAX) | Mismo repositorio |

No se dispone de datos suficientes para una comparación cuantitativa con alternativas VLA como OpenVLA, RT-2 o π0, ya que la publicación no aporta parámetros, contexto ni resultados de benchmarks.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no hay información sobre parámetros, contexto, datos de entrenamiento ni evaluación, lo que impide valorar su calidad de forma independiente.
- Licencia no especificada: no puede asumirse uso comercial; debe contactarse con el autor o consultarse el repositorio original de openpi antes de cualquier despliegue.
- Riesgo de alucinación y fallos de política: como todo modelo VLA entrenado por imitación, puede generar acciones fuera de distribución ante observaciones novedosas; no se documentan medidas de seguridad.
- Sesgos desconocidos: al no detallarse la composición del dataset, no es posible evaluar sesgos visuales, de objeto o de entorno.
- Especialización estrecha: los checkpoints están entrenados para LIBERO y tareas de manipulación; no deben usarse como modelo de propósito general.
- Formato Orbax: requiere el stack JAX/openpi y no es directamente compatible con herramientas de inferencia habituales (vLLM, llama.cpp, Ollama).
- Estado de publicación: cero descargas y cero likes, creado y actualizado el mismo día (2026-11-06), sin señales de validación por la comunidad.
- Idiomas no confirmados: no se especifica en qué idioma se proporcionan las instrucciones de tarea.

## Enlaces

- Hugging Face: https://huggingface.co/supernon/layout
- Repositorio openpi (referenciado en la model card): no se proporciona URL en la información disponible
- Proyecto LayOut-VLA: no se proporciona URL en la información disponible
- Paper o blog asociado: no disponible
