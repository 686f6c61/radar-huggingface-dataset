# Travor278/pi05-scan-object-right-first-data20260916-lora-10k-e194

## Resumen

PI0.5 scan-object-right-first (revisión 20260916, experimento E194) es un checkpoint de inferencia para robótica publicado por el usuario Travor278 en HuggingFace, dentro del ecosistema OpenPI. Se trata de un ajuste fino mediante LoRA sobre el modelo base PI0.5, un modelo de visión-lenguaje-acción (VLA) que genera comandos motores a partir de observaciones visuales y una instrucción textual, y que aquí se ha especializado en una tarea concreta de manipulación denominada "scan object right first".

El artefacto es un checkpoint JAX/Orbax de solo inferencia, de 6,3 GB, entrenado con 10.000 actualizaciones del optimizador sobre el dataset `Shiki42/ctr-scan-object-right-first-20260916`. La configuración empleada es `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` (nombre histórico que, según el autor, no altera la tarea real), con horizonte de acción 50, 12 dimensiones de articulación (acciones delta más pinzas en absoluto) y máscara de pérdida por relleno temporal. El entrenamiento se ejecutó con batch 16, acumulación de gradiente 1, FSDP1 y semilla 87431, alojando dos experimentos independientes por cada GPU H100.

Su relevancia es acotada pero clara para el nicho de la robótica aprendida: ofrece un punto de partida reproducible para investigación en políticas VLA, permite estudiar el efecto del ajuste LoRA sobre un base PI0.5 y documenta explícitamente la infraestructura y la revisión del dataset utilizados. No es un modelo de propósito general ni cuenta con métricas de éxito declaradas en simulación, por lo que debe tratarse como material de investigación y no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de visión-lenguaje-acción (VLA) PI0.5 dentro del framework OpenPI; detalles internos no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el checkpoint es JAX/Orbax y no se realizó conversión a safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax, checkpoint de solo inferencia con parámetros de inferencia y activos de normalización; sin conversión a safetensors |
| Tamaño del repositorio | 6,3 GB |
| Pipeline declarado | robotics |
| Librería | openpi |
| Dataset de entrenamiento | Shiki42/ctr-scan-object-right-first-20260916 (revisión `aa4bc63ec60d387736532e9f8808d33006f54d21`) |
| Actualizaciones del optimizador | 10.000 |
| Horizonte de acción | 50 |
| Dimensiones de articulación | 12 (delta) más pinzas en absoluto |
| Fecha de creación | 2026-09-16 |

## Arquitectura y entrenamiento

El checkpoint se enmarca en OpenPI y en la familia PI0.5 de modelos de visión-lenguaje-acción. La información publicada no detalla la arquitectura interna del base (composición del codificador visual, del modelo de lenguaje ni del módulo generador de acciones), por lo que esos extremos quedan como no disponibles. Lo que sí se documenta es el procedimiento de ajuste: se parte de un "fresh base" verificado de forma independiente mediante recarga en CPU y comprobación de parámetros finitos, y se aplican adaptadores LoRA. La regla de congelación estándar de OpenPI implica además entrenar el codificador visual y las cabezas, de modo que no todo el modelo permanece congelado.

El entrenamiento consistió en 10.000 actualizaciones del optimizador con batch de 16 por experimento, acumulación de gradiente 1, paralelismo FSDP1, semilla 87431 y horizonte de acción 50. Las 12 dimensiones de articulación se representan como delta, salvo las pinzas, que se manejan en valores absolutos, y se aplica una máscara de pérdida sobre el relleno temporal. Cada GPU H100 albergó dos experimentos independientes de forma simultánea. El resultado es un checkpoint de inferencia que conserva los parámetros de inferencia y los activos de normalización, pero excluye el optimizador y el estado reanudable del cargador de datos. Se comprobó la integridad de los archivos mediante re-hash antes de la subida (`CHECKPOINT_MANIFEST.json`). No se declara ningún tipo de refinamiento con RLHF o DPO, ni innovaciones de decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones motoras para manipulación robótica: produce secuencias de acción de horizonte 50 a partir de observaciones, con 12 dimensiones de articulación en formato delta y pinzas en absoluto.
- Condicionamiento por lenguaje: al ser un modelo VLA, acepta una instrucción textual junto con la entrada visual, si bien la información sobre idiomas soportados no está disponible.
- Control de pinzas en valores absolutos, lo que facilita comandos de apertura y cierre sin depender de incrementos acumulados.
- Ejecución de una política especializada en la tarea "scan object right first" del dataset de entrenamiento, en entorno de simulación.
- Capacidad de servir como base para nuevos ajustes LoRA dentro del pipeline OpenPI.
- Compatibilidad con el runtime de inferencia OpenPI en JAX, con activos de normalización incluidos.
- Soporte de tool calling o function calling: no aplica a este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso: no aplica; el modelo emite acciones, no cadenas de razonamiento.
- Modo "thinking", visión general, audio o generación de texto libre: no disponibles ni declarados.

## Casos de uso

- Investigación en políticas VLA: sirve como punto de partida reproducible para estudiar el efecto del ajuste LoRA sobre un base PI0.5 en una tarea concreta, dado que el autor documenta configuración, semilla y revisión del dataset.
- Evaluación de calidad de datos de demostración: el uso de máscara de pérdida por relleno temporal y de un dataset con revisión fijada permite analizar cómo afecta la composición del dataset al comportamiento de la política.
- Comparación de experimentos de ajuste: al existir una ejecución previa (E167) y una ejecución E194 separada, permite contrastar dos rondas de entrenamiento sobre el mismo tipo de tarea con cambios en los datos.
- Desarrollo de pipelines de entrenamiento distribuido: la combinación de FSDP1, batch 16 y dos experimentos por H100 documentada en la ficha es útil como referencia para planificar ocupación de GPU en laboratorios con recursos limitados.
- Base para transferencia a tareas afines: el checkpoint puede emplearse como inicialización para nuevos ajustes LoRA sobre tareas de manipulación similares, reduciendo el coste frente a entrenar desde cero.
- Validación de infraestructura de inferencia OpenPI: permite verificar que un entorno JAX/Orbax con los activos de normalización correctos carga y ejecuta el modelo, incluyendo la comprobación de parámetros finitos.
- Reproducibilidad y auditoría de artefactos: el manifiesto de checkpoint y el re-hash de los archivos de inferencia facilitan la verificación de integridad en entornos de investigación que requieren trazabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica explícitamente que no se reclama ninguna tasa de éxito en simulación para este checkpoint nuevo. Las métricas de entrenamiento asociadas a la ejecución E194 se encuentran en el panel externo de SwanLab enlazado en la model card, pero no se incluyen valores en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 6,3 GB, pero el modelo base PI0.5 debe apuntarse por separado mediante `PI05_JAX_BASE`, por lo que el consumo total depende de esos parámetros adicionales.
- GPU recomendadas: el entrenamiento se realizó en H100, con dos experimentos compartiendo cada GPU. Para inferencia no se especifican modelos de GPU concretos.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar que quepa en una RTX 4090 u otras GPU de gama consumer sin conocer el tamaño del base y su precisión de ejecución.
- Opciones de despliegue: runtime OpenPI en JAX sobre checkpoints Orbax, con la configuración `pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep` y el commit de código compatible `e0e08ba202d53c9da05bd241eeb9c177c2b45e0d`. Se requiere definir `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR`. No es una instalación autónoma de Python. No se contemplan vLLM, llama.cpp, Ollama ni TGI.
- Variables de entorno necesarias: `PARALLELVLA_DATASET_REPO`, `PARALLELVLA_NORM_ASSETS_DIR` y `PI05_JAX_BASE` cuando la configuración lo requiera.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| pi05-scan-object-right-first E194 (este modelo) | Checkpoint de inferencia PI0.5 con LoRA | no disponible | no disponible | no disponible | HuggingFace, 6,3 GB, solo inferencia | 10.000 actualizaciones, dataset ctr-scan-object-right-first-20260916 |
| pi05-scan-object-right-first E167 | Checkpoint previo del mismo autor | no disponible | no disponible | no disponible | Repositorio separado en HuggingFace | El autor indica que E194 es independiente de E167 |
| Base PI0.5 en OpenPI | Modelo VLA base | no disponible | no disponible | no disponible | Framework OpenPI | Requerido por separado mediante `PI05_JAX_BASE` |
| Otros modelos VLA abiertos (por ejemplo, OpenVLA o pi0) | Modelos de visión-lenguaje-acción | no disponible | no disponible | no disponible | Distintos repositorios | No se dispone de métricas comparativas en la información proporcionada |

No se dispone de datos comparativos de rendimiento, parámetros o contexto entre estos modelos en la información proporcionada, por lo que la comparación es estructural y no cuantitativa.

## Limitaciones y advertencias

- No se reclama ninguna tasa de éxito en simulación para este checkpoint; el autor lo indica de forma explícita.
- Es un checkpoint de solo inferencia: no incluye optimizador, estado reanudable del cargador de datos ni checkpoints de estado de entrenamiento, por lo que no se puede reanudar el entrenamiento a partir de él.
- No se realizó conversión a safetensors, lo que limita su uso fuera del ecosistema JAX/Orbax.
- No es una instalación autónoma de Python; requiere el framework OpenPI y un commit de código concreto, además de variables de entorno y activos de normalización locales.
- El nombre de la configuración (`pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep`) corresponde a una denominación histórica que, según el autor, no refleja la tarea actual, lo que puede inducir a error.
- La licencia no está declarada, por lo que no se puede confirmar la viabilidad de uso comercial ni las condiciones de redistribución.
- No hay información sobre sesgos, idiomas soportados, robustez ante distribuciones distintas a las del dataset de entrenamiento ni comportamiento fuera de la tarea "scan object right first".
- Al tratarse de un modelo especializado en una tarea concreta de manipulación en simulación, no debe asumirse capacidad de generalización a entornos reales sin evaluación adicional.
- Riesgo de alucinación: no aplica en el sentido de generación de texto libre; el riesgo relevante es la generación de acciones incorrectas o inseguras fuera del dominio de entrenamiento.
- El repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación por parte de la comunidad.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo; los enlaces devueltos corresponden a localidades de Normandía y no guardan relación con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-right-first-data20260916-lora-10k-e194
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-right-first-20260916
- Panel de métricas de entrenamiento (ejecución E194): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- No se han encontrado enlaces adicionales relevantes en la búsqueda web; los resultados obtenidos no están relacionados con el modelo.
