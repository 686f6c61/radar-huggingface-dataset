# Soumojit048/grogu-continual-archive

## Resumen

`Soumojit048/grogu-continual-archive` es un repositorio de HuggingFace que sirve como archivo público de los puntos de control generados durante una campaña de investigación en aprendizaje continuo (continual learning) para políticas de manipulación robótica, desarrollada en la CMU. No es un modelo listo para inferencia, sino un conjunto de artefactos de entrenamiento: contiene 3.587 archivos en 330 directorios de ejecución, con un peso total de 125.4 GB según HuggingFace (119.85 GiB según el README), que incluyen checkpoints en formato PyTorch (`*.pt`), archivos de configuración (`config_snapshot.yaml`) y resultados de evaluación (`eval/*.json`).

La investigación se centra en políticas basadas en flow-matching entrenadas con aprendizaje por imitación, evaluadas en los benchmarks LIBERO y RoboCasa. El repositorio documenta una parte importante de la campaña P4-P15, con múltiples métodos de adaptación continua (ft, glora, embgate, hend, replay y ureplay), lo que permite reproducir y reanalizar experimentos. Es relevante para la comunidad de robótica porque proporciona un registro transparente de artefactos de entrenamiento, aunque carece de punto de entrada para inferencia.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Políticas de manipulación robótica basadas en flow-matching; arquitectura de red no especificada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (sin cuantización; checkpoints en precisión nativa de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | PyTorch checkpoint (*.pt) |
| Pipeline | robotics |
| Tamaño del repositorio | 125.4 GB (3.587 archivos, 330 directorios) |

## Arquitectura y entrenamiento

Los checkpoints almacenados corresponden a políticas de manipulación robótica entrenadas con flow-matching, una técnica generativa que modela la transformación de una distribución de ruido a la distribución de acciones deseadas mediante una ecuación de flujo. El método de aprendizaje es por imitación (imitation learning), lo que implica que las políticas aprenden de demostraciones humanas o de un oráculo. La evaluación se realiza en los benchmarks LIBERO y RoboCasa, y el repositorio incluye tanto políticas base como adaptaciones a tareas específicas (P5, P6, P16, P26) y comparaciones entre métodos de aprendizaje continuo como `ft`, `glora`, `embgate`, `hend`, `replay` y `ureplay`, sin que se detalle la naturaleza de cada uno en el repositorio.

No se dispone de información detallada sobre la composición exacta de los datos de entrenamiento, el número de parámetros de cada red ni sobre la aplicación de técnicas como RLHF o DPO. Los artefactos incluyen también `normalizer.json`, lo que sugiere normalización de estados o acciones durante el entrenamiento.

## Capacidades

- Almacena 330 directorios de ejecución con artefactos completos de entrenamiento: checkpoints, configuraciones y evaluaciones.
- Permite reanudar el entrenamiento desde cualquier checkpoint `last.pt` mediante carga con `torch.load`.
- Facilita la comparación de múltiples métodos de aprendizaje continuo en las mismas tareas.
- Incluye datos de evaluación en formato JSON para reanálisis de métricas y curvas de aprendizaje.
- Documenta una campaña experimental extensa (P4-P15) con pesos de políticas base y adaptaciones LIBERO y RoboCasa.
- No ofrece capacidades de inferencia ni interacción en tiempo real, pues es exclusivamente un archivo de investigación.

## Casos de uso

- Auditoría de resultados académicos: los investigadores pueden descargar un checkpoint específico y su `eval/*.json` para comprobar si las métricas reportadas se replican con el mismo código.
- Comparación sistemática de métodos de aprendizaje continuo: se pueden evaluar los checkpoints de `ft`, `glora`, `embgate`, `hend`, `replay` y `ureplay` en las mismas tareas LIBERO para medir el olvido catastrófico.
- Reanudación de experimentos abortados: al restaurar el directorio con la estructura original, es posible continuar un entrenamiento interrumpido usando el último checkpoint y el `config_snapshot.yaml`.
- Transferencia de conocimiento en grupos de investigación: un grupo puede compartir el archivo con un colaborador externo para que este reanalice los resultados sin necesidad de re-ejecutar largas campañas en hardware propio.
- Reproducibilidad de la campaña P4-P15: dado que `continual_scratch` contiene la mayor parte de los pesos, sirve como registro de los modelos que se estudiaron, permitiendo futuras comparaciones con nuevos métodos.
- Formación en robótica: los estudiantes pueden estudiar las configuraciones y pesos de políticas de flow-matching para entender el efecto de distintos adaptadores (glora, embgate) en tareas de manipulación.
- Combinación con el repositorio `grogu_continual`: junto con la batería P17, permite reconstruir el registro completo del proyecto, útil para papers que necesiten una sección de disponibilidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Aunque los directorios contienen ficheros `eval/*.json`, no se proporcionan métricas agregadas ni comparaciones con modelos similares.

## Requisitos de hardware

- Almacenamiento: se requieren al menos 125 GB de espacio en disco para descargar el repositorio completo; el contenido útil es de 119.85 GiB.
- VRAM para inferencia: no disponible, ya que no existe punto de entrada de inferencia.
- GPU recomendadas: no disponible; para reproducir el entrenamiento se requiere un entorno de investigación con hardware no especificado en la información proporcionada.
- Opciones de despliegue: no aplicable como modelo servible; los checkpoints pueden ser cargados con PyTorch para análisis o reentrenamiento.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio relacionado `Soumojit048/grogu_continual` es complementario, pero no una alternativa, ya que cubre otra batería del mismo proyecto.

## Limitaciones y advertencias

- No es un modelo lanzado: no tiene entrada para inferencia, ni API, ni integración con frameworks de despliegue.
- Licencia "other": los términos no están claramente definidos, por lo que se debe consultar al autor antes de cualquier uso comercial.
- El repositorio puede contener artefactos de experimentos fallidos o intermedios; no hay garantías de replicabilidad sin el código fuente original.
- La nomenclatura interna (CL0, P7, P15, etc.) requiere documentación adicional para interpretar correctamente los directorios.
- El peso de 125.4 GB dificulta su uso en entornos con limitaciones de almacenamiento o descarga.
- La ausencia de información sobre arquitectura y parámetros impide evaluar la calidad del modelo o establecer comparativas.

## Enlaces

- Repositorio principal: https://huggingface.co/Soumojit048/grogu-continual-archive
- Repositorio relacionado: https://huggingface.co/Soumojit048/grogu_continual
- Dataset RoboCasa multi-gripper: https://huggingface.co/datasets/Soumojit048/continual-mg-im-k1000
- Espejo del benchmark LIBERO/robomimic: https://huggingface.co/datasets/Soumojit048/libero-robomimic-benchmark-mirror
