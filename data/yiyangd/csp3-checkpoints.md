# yiyangd/csp3-checkpoints

## Resumen

`yiyangd/csp3-checkpoints` es un repositorio de HuggingFace que no contiene un modelo listo para usar, sino un conjunto de checkpoints de investigación para modelos de mundo (world models) entrenados con aprendizaje por refuerzo. El autor publica los pesos y las curvas de aprendizaje escalares de diez ejecuciones de investigación nombradas como CSP, cubriendo los entornos Push-T, Reacher, Cube y Two-Room. Cada ejecución corresponde a una única semilla de entrenamiento, por lo que el paquete está pensado para reproducir y auditar experimentos, no para desplegar un sistema en producción.

El contenido incluye, por cada ejecución, un `runs/<run-id>/config.json` con los ajustes científicos, un `latest.json` que identifica los estados de reanudación completos (actual y anterior) junto a sus hashes SHA256, y ficheros de reanudación que empaquetan módulos neuronales, optimizadores, buffers denominados SIGReg, estados de los generadores de números aleatorios, modos de los módulos y la posición de entrenamiento. También se conservan exportaciones "solo pesos" por hitos y registros escalares de entrenamiento. El esquema de transporte declarado es `m2-csp3-hf-20260924-public-v1`.

La relevancia de esta publicación es limitada y muy específica: es material de reproducibilidad para investigación en modelos de mundo y control por refuerzo. No se declara licencia, idiomas, arquitectura ni número de parámetros, y el propio autor advierte explícitamente que son modelos experimentales, sin pretensión de éxito en benchmarks ni de estar listos para producción. El tamaño total del repositorio es de 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los checkpoints contienen módulos neuronales y optimizadores, pero no se especifica la topología) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la ventana de observación depende del entorno y de la configuración de entrenamiento) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo lingüístico; el repositorio lleva el tag `region:us`) |
| Licencia | no disponible (no declarada en la model card ni en los metadatos) |
| Formato de pesos | PyTorch: ficheros de estado de entrenamiento completo (serializados con pickle) y exportaciones solo-pesos por hitos |
| Entornos evaluados | Push-T, Reacher, Cube, Two-Room |
| Numero de ejecuciones | 10 (una semilla por configuración) |
| Tamano del repositorio | 0,1 GB |
| Esquema de transporte | m2-csp3-hf-20260924-public-v1 |
| Pipeline declarado | reinforcement-learning |

## Arquitectura y entrenamiento

No se detalla la arquitectura en la información disponible. Lo que se puede inferir de la estructura publicada es que se trata de un modelo de mundo entrenado con aprendizaje por refuerzo, con un entrenador nativo que se invoca sin modificar y un adaptador de transporte que restaura la configuración fijada localmente y la identidad del código fuente antes de arrancar. Los estados de reanudación incluyen módulos neuronales, optimizadores, estados de RNG, modos de módulos y la posición de entrenamiento, lo que es consistente con un bucle de entrenamiento reanudable de forma determinista.

Los checkpoints incorporan buffers etiquetados como SIGReg. Este nombre coincide con el de esquemas de regularización usados en la familia de modelos de mundo de tipo JEPA, pero la model card no documenta qué implementación concreta se emplea, así que se trata de una observación sobre la estructura de los ficheros y no de un dato confirmado. Tampoco se especifican el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO; en el contexto de RL y modelos de mundo esas fases no serían de aplicación, pero no hay confirmación explícita.

El autor indica que las subidas son transaccionales y se verifican descargando el commit fijado y comprobando la igualdad de hash y estado. Se conservan dos ranuras de recuperación por ejecución y se autorizó la compactación periódica del historial antiguo de este repositorio concreto, por lo que las versiones reemplazadas no son un archivo permanente. No se incluyen datasets, imágenes, credenciales, volcados de entorno ni comunicaciones privadas.

## Capacidades

- Entrenamiento y reanudación de modelos de mundo sobre cuatro entornos de control: Push-T, Reacher, Cube y Two-Room.
- Reanudación exacta de entrenamiento: los ficheros restauran módulos, optimizadores, buffers de regularización, estados de RNG, modos de módulo y posición de entrenamiento.
- Auditoría de reproducibilidad: cada ejecución incluye `config.json` con los ajustes científicos y `latest.json` con los hashes SHA256 de los estados de reanudación actual y anterior.
- Exportación de solo pesos por hitos, útil para evaluación sin arrastrar el estado del optimizador.
- Curvas de aprendizaje escalares para analizar la evolución del entrenamiento por ejecución.
- No se declaran capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo: no es un modelo de propósito general y no hay evidencia en la información proporcionada de que las tenga.

## Casos de uso

- Reproducción de experimentos en modelos de mundo: descargar el commit fijado, verificar el SHA256 de `latest.json` y reanudar el entrenamiento con el entrenador nativo para confirmar las curvas publicadas.
- Comparación de métodos de regularización: los buffers SIGReg presentes en los checkpoints permiten inspeccionar y comparar su evolución entre las diez ejecuciones y los cuatro entornos.
- Estudios de sensibilidad a semilla: aunque solo hay una semilla por configuración, las diez ejecuciones cubren combinaciones de entorno y ajustes que sirven como base para planificar réplicas multilla.
- Punto de partida para ajuste fino en control: reutilizar una exportación solo-pesos de Push-T o Reacher como inicialización de un entrenamiento propio en la misma familia de tareas.
- Docencia e investigación en RL: material de laboratorio para estudiar cómo se estructura un estado de entrenamiento completo (optimizador, RNG, posición) y qué hace falta para reanudar sin deriva.
- Evaluación de planificadores sobre modelos de mundo: emplear los pesos congelados como dinámica aprendida y medir el rendimiento de un planificador externo en Two-Room o Cube.
- Infraestructura de checkpoints: servir de ejemplo práctico de publicación transaccional con verificación por hash y de gestión de ranuras de recuperación ante preempciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye curvas de aprendizaje escalares, pero la información proporcionada no contiene cifras concretas de retorno, tasa de éxito ni comparaciones con otros métodos, y el propio autor advierte que no se reivindica éxito en benchmarks.

## Requisitos de hardware

- El tamaño total del repositorio es de 0,1 GB para diez ejecuciones, cada una con dos ranuras de recuperación y exportaciones por hitos. Esto implica que cada checkpoint individual ocupa del orden de pocos megabytes, una estimación derivada del tamaño declarado y no un dato oficial.
- Con ese orden de magnitud, la inferencia y la reanudación del entrenamiento son viables en CPU y en cualquier GPU de consumo. No hay cifras oficiales de VRAM.
- VRAM estimada para inferencia: no disponible oficialmente; por tamaño del repositorio, muy por debajo de los 8 GB en cualquier GPU moderna.
- GPU recomendadas: no especificadas por el autor. Para entrenamiento de estos modelos de mundo, cualquier GPU con soporte CUDA reciente debería ser suficiente dado el tamaño; para réplicas a mayor escala no hay datos.
- Opciones de despliegue: carga mediante PyTorch (los estados completos se serializan con pickle) y reanudación con el entrenador nativo a través del adaptador de transporte. No aplican vLLM, TGI, llama.cpp ni Ollama, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información proporcionada no incluye datos numéricos que permitan una comparación cuantitativa. Además, la pieza publicada es un conjunto de checkpoints de investigación, no un modelo liberado para uso general, lo que dificulta la comparación directa con familias como DreamerV3, TD-MPC2 o las variantes de JEPA. La tabla siguiente recoge únicamente lo verificable.

| Aspecto | csp3-checkpoints | Alternativas de la misma categoria |
|---|---|---|
| Naturaleza | Checkpoints de investigación de 10 ejecuciones (modelos de mundo + RL) | no disponible en la informacion proporcionada |
| Parametros | no disponible | no disponible |
| Contexto | no aplica | no disponible |
| Entornos cubiertos | Push-T, Reacher, Cube, Two-Room | no disponible |
| Licencia | no disponible | no disponible |
| Formato | PyTorch (pickle) y exportaciones solo-pesos | no disponible |
| Disponibilidad | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución derivada. Es el principal riesgo legal del repositorio.
- Riesgo de seguridad al cargar: el propio autor advierte que los ficheros de estado de entrenamiento completo usan pickle y no son seguros de cargar desde autores desconocidos. Hay que descargar solo desde fuentes de confianza y verificar los hashes.
- Una sola semilla por configuración: no permite estimar varianza ni significación estadística de los resultados.
- No es un modelo de producción: el autor lo describe como experimental, sin pretensión de éxito en benchmarks ni de estar listo para producción.
- Sin datos de arquitectura, parámetros ni entrenamiento: no se puede evaluar la capacidad del modelo ni planificar recursos con precisión.
- `main` es mutable: el autor recomienda explícitamente no usarlo como resultado científico sin versión y registrar los hashes exactos de los checkpoints usados en cada evaluación.
- Compactación de historial: las versiones antiguas reemplazadas no se conservan de forma permanente, así que un checkpoint concreto puede dejar de estar disponible en el repositorio.
- Desfase de publicación: la publicación de checkpoints puede ir por detrás de la actualización en curso, y una preempción brusca puede perder las actualizaciones posteriores a la última subida completada.
- Idiomas y contexto: no aplica soporte multilingüe; no hay ventana de contexto en el sentido de los modelos de lenguaje.
- Sin datasets incluidos: no se puede reproducir el entrenamiento desde cero con lo publicado, solo reanudar o evaluar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yiyangd/csp3-checkpoints
- Perfil del autor en HuggingFace: https://huggingface.co/yiyangd/buckets
- Otro repositorio del mismo autor: https://huggingface.co/yiyangd/vla_checkpoints
- Perfil de GitHub encontrado en la búsqueda: https://github.com/yiyangd (la model card atribuye el repositorio a Yiyang Du, mientras que el perfil de GitHub corresponde a Yiyang Dong; no se ha podido confirmar que sea la misma persona)
- La búsqueda web no ha devuelto papers, blogs, demos ni repositorios técnicos asociados a este modelo. Los resultados restantes (Civitai y otros) no guardan relación con este repositorio y se omiten.
