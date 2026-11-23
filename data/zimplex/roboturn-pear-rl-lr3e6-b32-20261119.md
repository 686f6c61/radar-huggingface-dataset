# zimplex/roboturn-pear-rl-lr3e6-b32-20261119

## Resumen

Roboturn PEAR-RL lr3e6-b32 es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3.8-27B, publicado por el usuario zimplex en Hugging Face. No se trata de un modelo final ni de un lanzamiento de produccion, sino de una instantanea del estado del entrenamiento en el paso 30 de un total previsto de 100 pasos de optimizador. El pipeline declarado es image-text-to-text, lo que indica que hereda capacidades multimodales del modelo base.

El modelo se inicializa desde la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` de Qwen/Qwen3.8-27B y aplica una receta denominada PEAR-RL con learning rate 3e-6, 32 grupos de prompts por lote, ocho trayectorias por grupo y 30 turnos por trayectoria, sobre 124 tareas de Roboturn con semillas 1000-1999. La relevancia de esta publicacion es fundamentalmente documental y de investigacion: permite inspeccionar el estado intermedio de un proceso de RL multi-turno sobre un modelo de 27B de parametros.

Es importante subrayar que la model card advierte de que la subida de los pesos esta pendiente de verificacion SHA256 y que la tarjeta por si sola no indica que el checkpoint este listo para inferencia. Ademas, el entrenamiento sigue en curso, por lo que cualquier evaluacion debe considerarse provisional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.8-27B; no se detalla en la informacion) |
| Parametros totales | 27B (segun el nombre del modelo base Qwen3.8-27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que se preserva la licencia del modelo base en el fichero LICENSE, pero no se especifica cual es) |
| Formato de pesos | no disponible (se mencionan ficheros de modelo y processor exportados desde el checkpoint; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura concreta no se detalla en la informacion disponible; el modelo hereda la de Qwen/Qwen3.8-27B, del cual no se aportan especificaciones estructurales (tipo de transformer, atencion, etc.) en la model card. Lo que si se documenta es el proceso de ajuste: se parte de la revision `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0` del modelo base y se aplica una receta de reinforcement learning denominada PEAR-RL, integrada en el pipeline Roboturn con receta `hongxin/pear-rl-20261119` y fuente cualificada `fc99556dc1fa62ac7fa27871b08954703ad8df85`.

Los hiperparametros declarados son: learning rate 3e-6, 32 grupos de prompts por lote, ocho trayectorias por grupo y 30 turnos por trayectoria, entrenando sobre 124 tareas de Roboturn con semillas 1000-1999. El checkpoint corresponde al paso 30 de un total planificado de 100, por lo que el proceso esta incompleto. Los ficheros de modelo y processor se exportan desde el checkpoint sellado completo, mientras que el estado de optimizador, scheduler, RNG y TransferQueue se conserva por separado para permitir la reanudacion del entrenamiento con estado completo. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen/Qwen3.8-27B, aunque no se detallan capacidades especificas en la model card.
- Procesamiento image-text-to-text: el pipeline declarado es image-text-to-text, lo que sugiere capacidad de entrada multimodal (imagen y texto).
- Aprendizaje por refuerzo multi-turno: el entrenamiento emplea trayectorias de 30 turnos, orientado a tareas de interaccion prolongada.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el diseno de trayectorias multi-turno apunta a escenarios agenticos.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): solo se confirma la entrada image-text-to-text; el resto no disponible.

## Casos de uso

- Investigacion en aprendizaje por refuerzo multi-turno: el checkpoint permite analizar la evolucion del modelo en el paso 30 de 100, comparando su comportamiento con el modelo base y con checkpoints posteriores para estudiar la dinamica del entrenamiento PEAR-RL.
- Reproduccion de experimentos: dado que se conserva el estado completo de entrenamiento (optimizador, scheduler, RNG, TransferQueue), un equipo puede reanudar el proceso desde este punto y verificar los resultados declarados con la receta `hongxin/pear-rl-20261119`.
- Evaluacion de tareas agenticas: las 124 tareas de Roboturn con trayectorias de 30 turnos permiten disenar evaluaciones de razonamiento multi-paso y uso sostenido de herramientas, siempre que se confirme la disponibilidad de pesos.
- Analisis de estabilidad del entrenamiento: al ser un checkpoint intermedio con learning rate 3e-6 y 32 grupos por lote, sirve para estudiar la convergencia y el efecto de estos hiperparametros en un modelo de 27B.
- Pruebas de inferencia multimodal: el pipeline image-text-to-text permite experimentar con entradas de imagen y texto, aunque la model card no garantiza que el checkpoint este listo para inferencia.
- Docencia y divulgacion tecnica: como ejemplo documentado de un pipeline de RL sobre un modelo grande, con hiperparametros y fuentes trazables, util para explicar procesos de post-entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion. Como referencia general para un modelo de 27B de parametros, la inferencia en precision completa requeriria del orden de 54 GB solo para pesos, pero este dato no lo aporta la model card y debe tratarse como estimacion no verificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; solo se confirma compatibilidad con la libreria transformers.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Roboturn PEAR-RL lr3e6-b32 (este) | 27B | no disponible | sin benchmarks publicados | no disponible | checkpoint intermedio, pesos pendientes de verificacion SHA256 |
| Qwen/Qwen3.8-27B (modelo base) | 27B | no disponible | no disponible en esta ficha | no disponible en esta ficha | publicado en Hugging Face |
| Alternativas de 27B de otros laboratorios | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 30 de 100; el entrenamiento sigue en curso y el modelo no representa el resultado final de la receta.
- Disponibilidad de pesos no confirmada: la model card indica que la subida de pesos esta pendiente de verificacion SHA256 y que la tarjeta por si sola no garantiza que el checkpoint este listo para inferencia.
- Licencia no especificada: aunque se indica que se preserva la licencia del modelo base en el fichero LICENSE, no se detalla cual es, por lo que el uso comercial no puede evaluarse con la informacion disponible.
- Idiomas no declarados: no se especifica que idiomas soporta el modelo.
- Sesgos conocidos: no disponible en la informacion; al derivar de un modelo base no documentado aqui, los sesgos de este no pueden detallarse.
- Riesgo de alucinacion: no cuantificado en la informacion; es esperable en modelos de lenguaje, pero no se aportan datos especificos.
- Limitaciones de contexto: la longitud de contexto no se declara.
- Ausencia de benchmarks: no hay resultados publicados que permitan validar el rendimiento ni compararlo con alternativas.
- Uso en produccion: no recomendado sin verificacion previa de integridad de pesos, licencia y evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/zimplex/roboturn-pear-rl-lr3e6-b32-20261119
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de entrenamiento citada: `hongxin/pear-rl-20261119` (no se proporciona URL)
- Fuente cualificada citada: `fc99556dc1fa62ac7fa27871b08954703ad8df85` (no se proporciona URL)
- Papers, blogs, repos y demos adicionales: no disponible
