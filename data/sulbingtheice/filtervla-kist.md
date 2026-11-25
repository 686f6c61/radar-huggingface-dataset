# SulbingtheIce/FilterVLA-KIST

## Resumen

FilterVLA-KIST es un modelo de visión-lenguaje-acción (VLA) orientado a manipulación robótica condicionada por lenguaje, publicado en Hugging Face por el usuario SulbingtheIce (KIST). El modelo se enmarca en la familia de políticas de imitación entrenadas sobre el benchmark LIBERO y emplea flow matching como mecanismo de generación de acciones, una alternativa a los enfoques autorregresivos o de difusión clásicos que busca trayectorias de acción más suaves y estables. Está construido sobre la base de Qwen, según los tags del repositorio, lo que sugiere que reutiliza un backbone de lenguaje/visión de esa familia como columna vertebral.

La relevancia del modelo radica en su enfoque: combina un backbone VLM con un cabezal de flow matching para producir secuencias de acciones de robot a partir de instrucciones en lenguaje natural e imágenes de cámara. El nombre "FilterVLA" sugiere algún mecanismo de filtrado o selección de acciones o tokens, aunque la información pública disponible no detalla ese componente. El repositorio tiene cero descargas y cero likes en el momento de la consulta, y no incluye una model card sustantiva con datos de entrenamiento, benchmarks ni especificaciones cerradas.

La información disponible es muy limitada: no se han publicado resultados de benchmarks, no se especifican parámetros totales ni longitud de contexto, y la licencia aparece como no disponible a pesar de que los tags indican CC-BY-NC-4.0. Esta ficha se redacta con los datos efectivamente presentes en el repositorio, marcando explícitamente como "no disponible" todo aquello que no se ha podido verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) con flow matching; backbone basado en Qwen (según tags) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el campo de licencia; tags indican cc-by-nc-4.0 |
| Formato de pesos | no disponible (librería pytorch; presumiblemente checkpoints PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se describe mediante tags como "flow-matching", "imitation-learning", "language-conditioned-manipulation" y "libero". Esto indica que es una política de imitación entrenada para el benchmark LIBERO, que evalúa manipulación robótica con instrucciones en lenguaje en entornos simulados. La elección de flow matching implica modelar un campo vectorial continuo que transporta una distribución simple (por ejemplo, ruido gaussiano) hacia la distribución de acciones expertas, lo que en la práctica produce generación de trayectorias de acción por integración de una EDO. El tag "built-with-qwen" apunta a que el backbone perceptual y lingüístico proviene de la familia Qwen, aunque no se especifica la variante ni el tamaño.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset (más allá de la referencia a LIBERO), ni sobre si se aplicaron etapas de RLHF, DPO o ajuste fino supervisado adicional. Tampoco se documenta ninguna innovación técnica concreta más allá del uso de flow matching y del posible mecanismo de filtrado implícito en el nombre del modelo. Todos estos puntos deben considerarse no verificados.

## Capacidades

- Manipulación robótica condicionada por lenguaje: genera secuencias de acciones a partir de instrucciones en lenguaje natural e imágenes de observación.
- Política de imitación entrenada sobre LIBERO, orientada a tareas de manipulación en simulación.
- Generación de acciones mediante flow matching, con trayectorias continuas y suaves.
- Integración de un backbone VLM de la familia Qwen para la comprensión conjunta de visión y lenguaje.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): visión como entrada para la política; el resto no disponible.

## Casos de uso

- Investigación en políticas VLA: servir como referencia o baseline para comparar flow matching frente a difusión o autorregresión en tareas de manipulación condicionada por lenguaje sobre LIBERO.
- Evaluación en el benchmark LIBERO: ejecutar el modelo en los entornos simulados de LIBERO para medir tasas de éxito en tareas de manipulación con instrucciones en lenguaje.
- Estudio de mecanismos de filtrado de acciones: si el componente "Filter" del nombre corresponde a un módulo de selección o filtrado, puede analizarse su impacto en la estabilidad de las trayectorias generadas.
- Reproducción de experimentos de imitación: reentrenar o ajustar el modelo sobre subconjuntos de LIBERO para estudiar el efecto de flow matching en el aprendizaje por imitación.
- Base para transferencia a robots reales: partir del checkpoint como inicialización para ajuste fino en un entorno físico, aunque requeriría validación adicional no documentada.
- Docencia y divulgación: ejemplo didáctico de arquitectura VLA con flow matching y backbone Qwen para cursos de robótica o aprendizaje por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al desconocerse el número de parámetros del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: no disponible; el repositorio declara librería PyTorch, por lo que la inferencia requeriría un entorno PyTorch, pero no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (y estas herramientas no están orientadas a políticas robóticas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia de este modelo, por lo que una comparativa cuantitativa rigurosa con alternativas como OpenVLA, π0 (pi-zero) o RT-2 no puede elaborarse sin inventar cifras. Se indica, por tanto, que la comparativa está no disponible.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no hay información sobre datos de entrenamiento, composición del dataset ni metodología de evaluación.
- Sin benchmarks publicados: no es posible verificar el rendimiento del modelo frente a alternativas.
- Licencia ambigua: el campo de licencia aparece como no disponible, mientras que los tags indican CC-BY-NC-4.0, que restringe el uso comercial. Debe confirmarse antes de cualquier uso en producción.
- Cero descargas y cero likes: el modelo no cuenta con validación comunitaria ni señales de uso.
- Entrenado sobre LIBERO: su generalización fuera de ese benchmark o en robots reales no está documentada y es incierta.
- Riesgo de alucinación y sesgos: no evaluado; al tratarse de una política robótica, el riesgo relevante es la generación de acciones inválidas o inseguras en entornos físicos.
- Idiomas: no se especifica qué lenguajes naturales soporta como condición de instrucción.
- Uso en producción: no recomendado sin una evaluación independiente y sin aclaración de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/SulbingtheIce/FilterVLA-KIST
