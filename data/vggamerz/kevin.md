# VGGamerz/KevIN

## Resumen

KevIN es un adaptador LoRA con cabeza de decisión (pointer head) diseñado para una tarea muy concreta: seleccionar el siguiente enlace durante la navegación en Wikispeedia, un juego de navegación basado en una muestra de Wikipedia. Dado un objetivo, la página actual y un conjunto de enlaces candidatos, el modelo puntúa cada opción y devuelve la elección más probable. No genera texto ni imágenes: es un modelo de decisión de tipo multiple-choice.

El modelo parte del backbone congelado Qwen/Qwen3.5-0.8B-Base y se construye sobre el checkpoint Kev 0.8B v1.0 de jaredpalmer. El entrenamiento combina un ajuste supervisado (SFT) sobre rutas humanas del dataset SNAP Wikispeedia con una fase de aprendizaje por refuerzo (REINFORCE) sobre pares de entrenamiento. El checkpoint publicado corresponde a la actualización RL 150 de la ejecución `20261023T200829.319603Z-rl`, seleccionada como la mejor de esa ejecución sobre una muestra fija de desarrollo de 64 pares.

La relevancia de KevIN es acotada pero clara: sirve como pieza de evaluación y como referencia reproducible para investigación en navegación guiada por grafos y en el uso de cabezas de decisión sobre modelos de lenguaje pequeños. No es un modelo de propósito general ni sustituye a un LLM conversacional; su utilidad está ligada al entorno Kev y al grafo de 4.604 artículos de Wikispeedia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + pointer head sobre backbone transformer congelado Qwen/Qwen3.5-0.8B-Base |
| Parámetros totales | no disponible (el adaptador LoRA y la cabeza se distribuyen por separado; el backbone base es de 0,8B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors y `head.pt`; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (la tarea es de selección de enlaces, no de generación lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | `adapter_model.safetensors` (LoRA) y `head.pt` (cabeza de decisión) |

## Arquitectura y entrenamiento

KevIN no es un transformer entrenado desde cero, sino un adaptador LoRA acoplado a una cabeza de puntero que opera sobre las representaciones del backbone congelado Qwen/Qwen3.5-0.8B-Base. La cabeza puntúa los enlaces candidatos presentados en cada paso de navegación, de modo que el modelo emite una distribución sobre las opciones disponibles en lugar de texto libre. El adaptador y la cabeza se almacenan en ficheros separados y deben cargarse conjuntamente mediante la API de Kev; cargar solo el LoRA con PEFT genérico no reproduce el comportamiento de decisión.

El entrenamiento se realizó en dos fases. La primera fue un SFT sobre rutas humanas del dataset SNAP Wikispeedia, partiendo del checkpoint Kev 0.8B v1.0 y llegando a la actualización 2.000. La preparación de datos consideró 51.318 rutas completadas, de las cuales 50.407 superaron la validación. La segunda fase aplicó REINFORCE on-policy sobre pares de entrenamiento, y el checkpoint publicado es la actualización 150 de esa ejecución. El grafo utilizado comprende 4.604 artículos, por lo que el modelo está especializado en ese subconjunto y no en Wikipedia completa. La temperatura de referencia del checkpoint es 1,0 y sus probabilidades de salida no han sido calibradas de forma independiente para esta tarea.

## Capacidades

- Selección de enlaces en navegación tipo Wikispeedia: puntúa un conjunto de candidatos dado un objetivo y una página actual.
- Decisión multiple-choice: devuelve una elección entre opciones suministradas, no texto generado.
- Operación dentro del grafo SNAP de 4.604 artículos con extractos de página de 1.500 caracteres.
- Integración con la API System One de Kev para suministrar estado y candidatos.
- No soporta tool calling, function calling ni razonamiento multi-paso autónomo más allá del bucle de navegación que implemente el entorno.
- No dispone de capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; la tarea no requiere generación lingüística.

## Casos de uso

- Evaluación de agentes de navegación en grafos: KevIN permite reproducir un baseline de selección de enlaces sobre el grafo SNAP y comparar políticas de navegación con una referencia entrenada, gracias a sus checkpoints y métricas publicadas.
- Investigación en aprendizaje por refuerzo aplicado a modelos pequeños: el par SFT + REINFORCE sobre un backbone de 0,8B sirve como caso de estudio reproducible para experimentos de RL con recompensas basadas en éxito de navegación.
- Docencia y divulgación sobre cabezas de decisión: al separar adaptador y pointer head, el modelo ilustra cómo acoplar una cabeza de clasificación sobre representaciones congeladas sin reentrenar el backbone.
- Benchmarking de entornos de navegación: los resultados de 2.619/2.867 pares en el split de test permiten usar KevIN como referencia fija al evaluar nuevas políticas o variantes del entorno Kev.
- Pruebas de integración de pipelines de servicio: el comando `python -m kev.serve --run VGGamerz/KevIN --port 8008` facilita desplegar un servicio de decisión local para validar infraestructura de inferencia.
- Estudio de calibración de probabilidades: dado que el autor advierte que las probabilidades no están calibradas, el modelo es útil para experimentos sobre calibración en tareas de elección discreta.

## Benchmarks y rendimiento

| Evaluación | Conjunto | Resultado |
|---|---|---|
| Pares resueltos (selección de desarrollo) | Muestra fija de 64 pares | 62/64 (96,88 %) |
| Pares resueltos (test retenido ampliado) | 2.867 pares, límite de 12 clics | 2.619/2.867 (91,35 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores corresponden a la tarea específica de navegación en el grafo SNAP y no son comparables con benchmarks de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el backbone base es de 0,8B parámetros, por lo que en precisión de 16 bits requeriría del orden de 1,6 GB solo para pesos, más el adaptador y la cabeza (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; por tamaño, cualquier GPU consumer con al menos 4-6 GB de VRAM podría alojar el backbone en FP16, aunque no se documenta.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del backbone, pero no hay confirmación oficial.
- Opciones de despliegue: servidor propio de Kev (`python -m kev.serve`), instalado en la revisión `6b719c3c3f367295f6ef336f4f751cf5ff970abc`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y PEFT genérico no basta para cargar la cabeza de decisión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KevIN | Adaptador sobre backbone de 0,8B | no disponible | Selección de enlaces en Wikispeedia | Apache 2.0 | HuggingFace, requiere Kev |
| Kev 0.8B v1.0 (jaredpalmer) | 0,8B | no disponible | Navegación y decisión en Wikispeedia | no disponible en la información | HuggingFace |
| Qwen3.5-0.8B-Base | 0,8B | no disponible | Modelo base de lenguaje | no disponible en la información | HuggingFace |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a linaje y disponibilidad.

## Limitaciones y advertencias

- El modelo está especializado en el grafo SNAP de 4.604 artículos y no es un modelo de navegación de Wikipedia completa.
- Las páginas y objetivos pueden aparecer en varios splits, por lo que las métricas publicadas no demuestran generalización a artículos no vistos.
- El resultado de desarrollo (96,88 %) procede de una muestra pequeña de 64 pares y puede no ser representativo.
- El rendimiento depende del entorno de navegación y de cómo se presenten las opciones al modelo.
- Las probabilidades de salida no están calibradas para la tarea; no deben interpretarse como confianzas fiables sin post-procesado.
- El repositorio es una exportación de inferencia: no incluye estado del optimizador ni artefactos para reanudar el entrenamiento.
- Cargar el LoRA con PEFT genérico no reproduce el comportamiento, ya que falta la cabeza de puntero y la API de decisión.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinación, dado que el modelo no genera texto libre.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del entorno Kev y del backbone base puede imponer condiciones adicionales no detalladas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VGGamerz/KevIN
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- Backbone: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Repositorio Kev: https://github.com/jaredpalmer/kev
- Dataset SNAP Wikispeedia: https://snap.stanford.edu/data/wikispeedia.html
