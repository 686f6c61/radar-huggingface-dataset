# wangst0181/starvla-anchors

## Resumen

starVLA-anchors es un repositorio de checkpoints de investigación publicado por el usuario wangst0181 en Hugging Face, asociado al codebase de investigación starVLA. No se trata de un modelo empaquetado para Transformers ni de un artefacto listo para inferencia directa, sino de tres checkpoints de entrenamiento en formato PyTorch (`.pt`) que actúan como "anclas" (anchors) para un pipeline de aprendizaje por imitación en robótica. Cada checkpoint corresponde a un dominio de tarea distinto: LIBERO 90, LIBERO Spatial y RoboCasa 365.

El propósito declarado es servir de base sobre la que se acoplan adaptadores específicos de tarea dentro del codebase starVLA. Los pesos son de gran tamaño (37,54 GB para los dos checkpoints LIBERO y 48,90 GB para el de RoboCasa 365), lo que sugiere modelos con un número elevado de parámetros o, más probablemente, pesos almacenados en precisión completa junto con estados de optimizador u otros componentes del entrenamiento. La model card no especifica arquitectura, número de parámetros ni longitud de contexto.

La relevancia de este artefacto es limitada y acotada al ámbito de investigación: no hay descargas ni interacciones registradas, no se declara licencia y la documentación es mínima. Está pensado para investigadores que replican o extienden experimentos de starVLA en entornos simulados de manipulación robótica (LIBERO, RoboCasa), no para uso en producción ni para aplicaciones generales de lenguaje.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint PyTorch de starVLA; arquitectura no declarada en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (se distribuyen pesos en formato `.pt` sin variantes cuantizadas) |
| Idiomas soportados | en (declarado en los metadatos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`pytorch_model.pt` por dominio) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. Los metadatos y tags (`robotics`, `imitation-learning`, `starvla`) indican que se trata de un sistema de visión-lenguaje-acción (VLA) entrenado mediante aprendizaje por imitación para control robótico. El repositorio contiene tres checkpoints "ancla" independientes, uno por dominio de tarea, cada uno acompañado de las estadísticas del dataset correspondiente. No se especifican el número de tokens de entrenamiento, la composición de los datasets, ni si se aplicaron técnicas de RLHF o DPO.

Los checkpoints se presentan como artefactos intermedios de un pipeline de investigación: deben cargarse con el codebase starVLA y la configuración específica de cada tarea, y los adaptadores deben emparejarse con el ancla del mismo dominio. Las configuraciones de entrenamiento originales contenían rutas del entorno de desarrollo del autor y no se incluyen en el repositorio. No se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Control robótico por imitación en entornos simulados: los checkpoints están orientados a tareas de manipulación de los benchmarks LIBERO (suite 90 y variante Spatial) y RoboCasa (365 tareas).
- Servir como ancla base para acoplar adaptadores específicos de dominio dentro del codebase starVLA.
- Procesamiento de observaciones visuales y ejecución de acciones en entornos simulados, según la naturaleza VLA implícita en los tags.
- No se declaran capacidades de generación de texto general, razonamiento, código, matemáticas, tool calling, agentes multi-paso ni multimodalidad fuera del ámbito robótico.
- Capacidades multilingües: no disponibles; el idioma declarado es únicamente `en`.

## Casos de uso

- Reproducción de experimentos de starVLA: cargar el checkpoint `libero90/anchor/final_model/pytorch_model.pt` con la configuración de tarea correspondiente para replicar los resultados del autor en la suite LIBERO 90.
- Investigación en generalización espacial: usar el ancla de LIBERO Spatial para estudiar cómo se comportan los adaptadores en tareas que requieren razonamiento sobre relaciones espaciales entre objetos.
- Evaluación en RoboCasa 365: emplear el checkpoint de 48,90 GB como base para experimentos de manipulación doméstica a gran escala en simulación, acoplando adaptadores por tarea.
- Desarrollo de adaptadores específicos: partir de un ancla congelada y entrenar adaptadores ligeros para nuevas tareas dentro del mismo dominio, aprovechando que los pesos base ya están preentrenados.
- Comparación de metodologías de imitation learning: utilizar los tres anclas como línea base común para contrastar variantes de adaptadores o estrategias de fine-tuning.
- Auditoría de checkpoints de investigación: verificar hashes y estadísticas de dataset para validar la integridad de los pesos antes de integrarlos en un pipeline experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los checkpoints ocupan entre 37,54 GB y 48,90 GB en disco, por lo que se requiere almacenamiento local significativo y ancho de banda para descargarlos vía `hf download`.
- VRAM estimada para inferencia: no disponible. Dado el tamaño de los ficheros, cargar un checkpoint completo en memoria exige GPUs con decenas de GB de VRAM; no se confirma si los `.pt` incluyen estados de optimizador que puedan descartarse al cargar.
- GPU recomendadas: no disponibles. Por tamaño, GPUs de clase A100 (40/80 GB) o H100 son las candidatas razonables, pero el autor no lo especifica.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no confirmada; probablemente inviable cargar el checkpoint completo en 24 GB de VRAM sin técnicas de carga parcial o conversión.
- Opciones de despliegue: el autor indica explícitamente que deben cargarse con el codebase starVLA y la configuración específica de tarea; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos VLA (como OpenVLA, π0 o RT-2), ya que la model card no declara parámetros, arquitectura ni resultados. La comparación se limita a los tres checkpoints del propio repositorio:

| Checkpoint | Dominio | Tamaño en disco |
|---|---|---|
| LIBERO 90 anchor | LIBERO 90 | 37,54 GB |
| LIBERO Spatial anchor | LIBERO Spatial | 37,54 GB |
| RoboCasa 365 anchor | RoboCasa 365 | 48,90 GB |

## Limitaciones y advertencias

- No es un paquete Transformers autónomo: requiere el codebase starVLA y configuraciones de tarea que no se incluyen en el repositorio.
- Las configuraciones de entrenamiento originales contenían rutas del entorno de desarrollo del autor y fueron eliminadas; esto puede dificultar la reproducción exacta.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; tratar como uso exclusivamente de investigación hasta confirmar lo contrario.
- Los adaptadores deben emparejarse con el ancla del mismo dominio; mezclar dominios producirá resultados inválidos.
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no evaluable en el ámbito robótico con la información disponible; en entornos simulados, errores de política pueden traducirse en fallos de tarea.
- Cobertura de idioma limitada a `en` según los metadatos.
- Sin descargas ni validación comunitaria: no hay evidencia externa de calidad o reproducibilidad de los resultados.
- Los hashes se verifican tras la subida según el autor, pero no se publican valores de referencia en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wangst0181/starvla-anchors
- No se han encontrado otros enlaces (papers, blogs, repositorios de código o demos) en la información proporcionada.
