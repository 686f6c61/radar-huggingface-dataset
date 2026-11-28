# Superstar111/pour_videoprior_1cmd_b64

## Resumen

`Superstar111/pour_videoprior_1cmd_b64` es una política de visión-lenguaje-acción (VLA) construida sobre π0.5 y ajustada con la librería openpi del equipo Physical Intelligence. La desarrolla el usuario Superstar111 y está pensada para controlar un brazo robótico YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones, ejecutando tres habilidades encadenadas en un solo episodio: coger la cuchara, recoger garbanzos y verterlos en una olla. Toda la secuencia se guía con un único comando de lenguaje natural.

El modelo es una variante "rápida" de `Superstar111/pour_videoprior_1cmd`: entrena sobre los mismos 300 episodios (recortados al final del vertido, sin la fase de remover) pero con batch 64 y 3.700 pasos en lugar de batch 32 y 17.300 pasos. Se trata de un ajuste fino completo desde la base π0.5, con 12,4 GB de pesos en el repositorio y un total de 121.135 pasos de entrenamiento conservados (el 72,6 % de los episodios completos).

Es relevante como referencia metodológica: el autor lo presenta explícitamente como una línea base para medir qué aprende una política a partir de trayectorias generadas por un agente de código, y advierte de que no se ha evaluado ni en simulación ni en el robot real. Además, su agarre de potencia falla el criterio del laboratorio (0 de 300 intentos), por lo que no es apto para el montaje físico bajo esa regla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, ajustada con openpi (commit eca022d) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (comandos en inglés en los datos de entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 12,4 GB con carpeta `checkpoint/`) |

## Arquitectura y entrenamiento

El modelo parte de la base π0.5 y se ajusta de forma completa (full fine-tune) con la configuración `pi05_maggie_2skill_hcw_nojit` de openpi, que utiliza tres vistas de cámara (head, wrist y cam1) y ninguna aumentación de imagen. El entrenamiento emplea batch 64 durante 3.700 pasos con schedule coseno, learning rate máximo de 5e-5 que decae a 5e-6, warmup de 370 pasos, EMA de 0,999 y semilla 43. Se ejecutó en 2 NVIDIA H200 con paralelismo de datos (32 por GPU) y los pesos publicados son los del EMA en el paso 3699. La pérdida bajó de 0,4122 en el primer paso registrado a 0,0012 en el último.

Los datos provienen de 300 trayectorias idénticas a las de `Superstar111/stir_videoprior_1cmd`, recortadas en el primer paso de control cuya fase pertenece a la habilidad de remover (etiqueta `stir_align`, tras `pour_drain`). Se conservan 121.135 de los 166.925 pasos originales (72,6 %), con 396, 398 y 426 pasos por episodio (mínimo, mediana y máximo). Tras el filtro de inactividad del empaquetador quedan 115.135 filas de entrenamiento, lo que supone 2,06 pasadas sobre los datos. El comando de lenguaje es único para todos los episodios: "pick up the spoon, scoop the beans and pour them into the pot". No se conservó ningún checkpoint intermedio.

## Capacidades

- Control robótico de visión-lenguaje-acción: genera acciones conjuntas a partir de imágenes de tres cámaras y un comando de texto.
- Ejecución de una secuencia de tres habilidades en un episodio: coger la cuchara, recoger garbanzos y verterlos en la olla.
- Control de una mano de 28 articulaciones (Sharpa Wave) sobre un brazo YAM Ultra 2.
- Seguimiento de instrucciones en lenguaje natural mediante un único comando por episodio.
- Generación de chunks de acción de 10 pasos, con relleno del último objetivo marcado como `action_valid = false` cuando la consulta cae cerca del final del episodio.
- No dispone de modo de razonamiento explícito, tool calling, capacidades de agente multi-paso ni soporte multimodal más allá de las vistas de cámara indicadas.

## Casos de uso

- Investigación en políticas VLA: sirve como línea base reproducible para comparar qué aprende un modelo a partir de trayectorias generadas por un agente de código frente a datos teleoperados.
- Estudio de recorte de habilidades: permite analizar cómo afecta eliminar la fase final de una tarea (aquí, remover) al comportamiento aprendido en las fases previas.
- Experimentos de eficiencia de entrenamiento: su configuración de batch grande y pocos pasos (3.700) frente a la variante de batch 32 y 17.300 pasos facilita comparar regímenes de optimización sobre los mismos datos.
- Validación de pipelines de empaquetado de acciones: el filtro de inactividad y el relleno de chunks de 10 pasos pueden probarse con este checkpoint en entornos simulados.
- Pruebas de integración de openpi: el modelo incluye un self-test que verifica la ruta de servicio (12 consultas registradas respondidas con desviación de 0,000000 rad frente al clúster de entrenamiento, tolerancia 0,005 rad).
- Docencia y divulgación sobre robótica manipulativa: útil para ilustrar el flujo completo desde datos simulados hasta un checkpoint desplegable, con advertencias explícitas sobre sus límites.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no se ha evaluado ni en simulación ni en el robot real. La única comprobación registrada es el self-test de servicio descrito en la sección anterior, que valida la ruta de inferencia y no la habilidad de la política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 12,4 GB, pero no se especifica el tamaño de los pesos ni la precisión.
- GPU de entrenamiento: 2 NVIDIA H200 con 32 muestras por GPU en paralelo de datos.
- GPU recomendadas para inferencia: no disponibles; no se documenta ningún requisito concreto.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: openpi (commit eca022d) con la configuración `pi05_maggie_2skill_hcw_nojit`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Datos | Entrenamiento | Estado | Licencia |
|---|---|---|---|---|---|
| `pour_videoprior_1cmd_b64` (este) | π0.5 | 300 episodios recortados al vertido, 115.135 filas | Batch 64, 3.700 pasos, 2 H200 | Sin evaluar | no disponible |
| `Superstar111/pour_videoprior_1cmd` | π0.5 | Mismos 300 episodios recortados | Batch 32, 17.300 pasos | Sin evaluar | no disponible |
| `Superstar111/stir_videoprior_1cmd` | π0.5 | 300 episodios completos con remover | No disponible | No disponible | no disponible |
| `Superstar111/pour_v2` | π0.5 | No disponible | No disponible | Simulación | no disponible |

La diferencia principal entre este modelo y `pour_videoprior_1cmd` es únicamente el régimen de entrenamiento: mismo dataset, mismas imágenes y mismos objetivos de articulación, pero menos pasos con batch mayor. Frente a `stir_videoprior_1cmd`, el cambio está en los datos (episodios recortados y comando sin "stir") y no en la arquitectura.

## Limitaciones y advertencias

- No evaluado: no hay resultados en simulación ni en el robot real; el propio autor lo califica de línea base.
- Agarre no válido para el montaje físico: su agarre de potencia falla el criterio del laboratorio en 0 de 300 intentos (el pulgar presiona contra los dedos en lugar de cerrarse alrededor del mango).
- Montaje de la mano sin verificar: se entrenó con el soporte girado como en los modelos principales; no debe aplicarse la conversión de la articulación 6 de los cinco checkpoints anteriores.
- Cámara de muñeca sin calibrar: su pose en entrenamiento es geométrica (según el asiento del soporte) y no se ha verificado en el robot.
- Requiere una persona en la parada de emergencia si se ejecuta en el montaje real.
- Entrenado solo en simulación, con un único comando en inglés y tres vistas de cámara concretas; no hay información sobre sesgos, multilingüismo ni robustez ante variaciones de instrucción.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribución.
- Riesgo de alucinación y generalización fuera de distribución: no documentado, pero relevante dado que no se ha evaluado la política.
- El chunk de acción de 10 pasos se rellena con el último objetivo cuando la consulta cae cerca del final del episodio, lo que puede producir retenciones no deseadas en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Superstar111/pour_videoprior_1cmd_b64
- Variante lenta: https://huggingface.co/Superstar111/pour_videoprior_1cmd
- Modelo con remover: https://huggingface.co/Superstar111/stir_videoprior_1cmd
- Modelo en simulación: https://huggingface.co/Superstar111/pour_v2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
