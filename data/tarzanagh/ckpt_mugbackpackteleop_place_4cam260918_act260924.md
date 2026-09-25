# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924

## Resumen

El modelo `tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924` es un checkpoint de política robótica entrenado con ACT (Action Chunking Transformer) sobre una plataforma bimanual DexMate Vega-1 equipada con dos manos RobotEra XHand1. La tarea aprendida consiste en sostener una mochila abierta con la mano izquierda e introducir una taza en su interior con la derecha, un caso de manipulación diestra bimanual con contacto y oclusión parcial. Los datos se recogieron por teleoperación con meta-guante (sin exoesqueleto) y seguimiento de muñeca mediante Vive, lo que sitúa el modelo en el ámbito de la imitación a partir de demostraciones humanas.

Técnicamente es un modelo pequeño: 51.734.182 parámetros en formato safetensors (0,2 GB de repositorio), muy lejos de los modelos fundacionales de robótica tipo VLA. Consume 4 cámaras RGB a 640x360 y 30 fps, y opera sobre un vector de estado y acción de 38 dimensiones que codifica posiciones articulares de ambos brazos (7 grados de libertad cada uno) y ambas manos (12 grados de libertad cada una). Se entrenó durante 5.000 pasos con semilla 1000, un ajuste deliberadamente recortado dentro de una suite comparativa, por lo que el propio autor advierte que no es comparable con ejecuciones ACT de 10.000 pasos sobre otras tareas.

Su relevancia es fundamentalmente metodológica: forma parte de una comparativa controlada en la que se replicó la misma tarea con GR00T-3B, pi-0.5, Diffusion Policy y T-Rex, con y sin entrada táctil, lo que permite aislar el efecto de la familia de política sobre una tarea idéntica. No es un modelo de propósito general ni un modelo de lenguaje: es un checkpoint de investigación con cero descargas y sin validación en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) |
| Parámetros totales | 51.734.182 |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la política observa cada 16 pasos y predice un chunk) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo robótico, sin entrada ni salida de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modalidad de entrada | 4 cámaras RGB, 640x360 a 30 fps, más estado propioceptivo de 38 dimensiones |
| Salida | chunk de acciones de 38 dimensiones (posiciones articulares objetivo) |
| Dimensión de estado/acción | 38-D = [L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12] |
| Plataforma objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Tamaño del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo emplea ACT, una arquitectura basada en transformer que predice chunks de acciones en lugar de acciones individuales. En la práctica, la política recibe una observación real cada 16 pasos y genera un bloque de acciones, del cual se conservan las 16 primeras antes de refrescar la observación. Esta estrategia de acción fragmentada reduce el error de acumulación típico de las políticas paso a paso y mejora la estabilidad temporal en tareas de contacto. La entrada combina cuatro flujos RGB (640x360 a 30 fps) con el vector de estado de 38 dimensiones, y la salida es un vector de acciones de la misma dimensionalidad expresado en posiciones articulares.

Los datos de entrenamiento provienen de teleoperación con meta-guante sin exoesqueleto y seguimiento de muñeca con Vive, y suman 31 episodios, de los cuales 27 se destinaron a entrenamiento y 4 a validación (se reservó cada décimo episodio). El entrenamiento se detuvo a los 5.000 pasos con semilla 1000, una decisión explícita para ahorrar tiempo dentro de la suite comparativa; el autor señala que este recorte hace que las métricas no sean equiparables a las de ejecuciones ACT de 10.000 pasos sobre otras tareas. No se documenta en la información disponible el uso de RLHF, DPO ni fases de ajuste por preferencias, algo por otro lado ajeno a este tipo de políticas de imitación.

## Capacidades

- Manipulación bimanual diestra: ejecuta una secuencia cooperativa en la que una mano mantiene la mochila abierta mientras la otra inserta la taza.
- Seguimiento de trayectorias articulares de 38 grados de libertad combinando brazos y manos.
- Predicción por chunks de acciones con refresco de observación cada 16 pasos, lo que aporta consistencia temporal en el corto plazo.
- Percepción multi-cámara: integra cuatro vistas RGB simultáneas para resolver oclusiones parciales durante la inserción.
- Política específica de tarea (Single-task): no generaliza a otras tareas fuera de "place mug in backpack".
- Sin tool calling, sin function calling y sin capacidades de agente: no es un modelo de lenguaje.
- Sin capacidades multilingües ni de generación de texto.
- Variante con entrada táctil disponible como checkpoint hermano (`acttactile260924`), aunque el autor indica que la entrada táctil no produjo diferencias consistentes.
- No se documentan modos especiales como thinking, visión general o audio.

## Casos de uso

- Referencia de comparación entre familias de políticas: sirve como línea base ACT en una tarea bimanual idéntica a la usada con GR00T-3B, pi-0.5, Diffusion Policy y T-Rex, lo que permite atribuir diferencias de error a la arquitectura y no al dataset.
- Punto de partida para reentrenamiento en manipulación bimanual: al ser un checkpoint pequeño (51,7 M de parámetros) y con licencia Apache 2.0, se puede afinar sobre nuevos episodios teleoperados con la misma configuración de 38 dimensiones sin requerir clústeres de GPU.
- Investigación en teleoperación con meta-guante: el modelo documenta el pipeline completo (meta-guante sin exoesqueleto más Vive para la muñeca), útil para equipos que quieran replicar la recogida de datos sin comprar un exoesqueleto.
- Estudio del efecto del tacto en políticas de imitación: la existencia de la variante táctil con el mismo dataset y receta permite diseñar experimentos controlados sobre el valor real de la modalidad táctil.
- Evaluación de robustez ante oclusión: la tarea exige introducir un objeto dentro de una cavidad parcialmente oculta, un escenario útil para medir hasta qué punto cuatro vistas RGB bastan frente a la incorporación de sensores adicionales.
- Pruebas de infraestructura de inferencia robótica: con 51,7 M de parámetros cabe en GPU de consumo, por lo que es adecuado para validar pipelines de inferencia a 30 fps con cuatro cámaras antes de escalar a modelos de miles de millones de parámetros.
- Base para estudiar el efecto del número de pasos de entrenamiento: al estar recortado a 5.000 pasos de forma declarada, permite medir la curva de convergencia frente a ejecuciones de 10.000 pasos.

## Benchmarks y rendimiento

El autor publica error de bucle abierto sobre el conjunto reservado (media del valor absoluto de la diferencia entre acción predicha y acción registrada, en radianes, ± error estándar de la media, n=4 episodios). Esta métrica evalúa seguimiento de trayectoria, no éxito de tarea, y no se ejecutó nada en hardware.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (ACT) | 0,0394 ± 0,0026 | 0,0436 ± 0,0044 | 0,0576 ± 0,0042 | 0,0460 ± 0,0048 |
| hold-first-frame (línea base) | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Datos comparativos adicionales aportados por el autor, sin cifras concretas: GR00T obtuvo el error más bajo de las familias finalizadas en esta tarea, entre 3 y 4 veces por debajo de pi-0.5 y ACT; la entrada táctil no marcó una diferencia consistente; y las ejecuciones de Diffusion Policy y T-Rex para esta tarea seguían entrenando en el momento de publicar la model card. No hay resultados de MMLU, HumanEval, GSM8K ni similares, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio completo ocupa 0,2 GB, por lo que la inferencia cabe holgadamente por debajo de 2 GB en fp32 y en torno a 1 GB en fp16, sumando los buffers de las cuatro cámaras.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Modelos de datacenter como A100 o H100 no aportan ventaja relevante a este tamaño, más allá de la paralelización de múltiples políticas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna y también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: no se especifican en la información disponible; el formato safetensors permite cargarlo con PyTorch. No hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, que además están orientados a modelos de lenguaje y no a políticas robóticas.
- Latencia y throughput estimados: no disponibles. La política está diseñada para operar con refresco de observación cada 16 pasos y cámaras a 30 fps, pero no se publican medidas de latencia ni de frecuencia efectiva de control.
- Requisitos adicionales: cuatro cámaras RGB a 640x360 y 30 fps, más el robot DexMate Vega-1 con dos manos RobotEra XHand1 para cualquier validación física.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Error en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este checkpoint) | 51.734.182 | no aplica (chunk de 16 pasos) | Ver tabla de benchmarks | apache-2.0 | Público en HuggingFace, 0 descargas |
| GR00T-3B (`gr00t3b260924`) | no disponible | no disponible | El más bajo de las familias finalizadas; 3-4 veces por debajo de pi-0.5 y ACT | no disponible | Público en HuggingFace |
| GR00T-3B táctil (`gr00t3btactile260924`) | no disponible | no disponible | Sin diferencia consistente atribuible al tacto según el autor | no disponible | Público en HuggingFace |
| pi-0.5 (`pi05260924`) | no disponible | no disponible | Superior a ACT y por encima de GR00T según el autor | no disponible | Público en HuggingFace |
| pi-0.5 táctil (`pi05tactile260924`) | no disponible | no disponible | Sin diferencia consistente atribuible al tacto según el autor | no disponible | Público en HuggingFace |
| Diffusion Policy | no disponible | no disponible | Entrenamiento en curso al publicar la model card | no disponible | No disponible |
| T-Rex | no disponible | no disponible | Entrenamiento en curso al publicar la model card | no disponible | No disponible |
| hold-first-frame | no aplica | no aplica | Línea base: 0,1755-0,3383 rad según articulación | no aplica | Referencia interna |

Todos los modelos comparados pertenecen a la misma suite y al mismo dataset, lo que hace la comparación razonablemente justa en cuanto a datos, pero el propio autor advierte que las ejecuciones ACT de esta suite están recortadas a 5.000 pasos y no son comparables con ejecuciones ACT de 10.000 pasos de otras tareas.

## Limitaciones y advertencias

- No hay validación en hardware: el autor indica explícitamente que nada se ejecutó sobre el robot, por lo que no existe tasa de éxito de tarea, solo error de bucle abierto.
- El error de bucle abierto mide seguimiento de trayectoria, no consecución de la tarea; un error bajo no garantiza que la taza acabe dentro de la mochila.
- Entrenamiento recortado a 5.000 pasos por ahorro de tiempo, lo que probablemente deja el modelo por debajo de su convergencia y lo invalida para comparaciones con ejecuciones de 10.000 pasos.
- Base de evaluación muy reducida: solo 4 episodios reservados, lo que produce intervalos de confianza amplios.
- Especialización extrema: es una política de tarea única, ligada a la morfología DexMate Vega-1 con manos XHand1 y a la disposición concreta de las cuatro cámaras. No es transferible a otro robot sin reentrenamiento.
- Sin capacidades lingüísticas ni de agente: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- Riesgo de sobreajuste a las condiciones de teleoperación: los datos provienen de meta-guante y Vive, de modo que la distribución visual y dinámica puede diferir de una ejecución autónoma.
- La entrada táctil no mostró diferencias consistentes en la comparativa, por lo que no debe asumirse una mejora por añadir esa modalidad.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al no existir validación en hardware el uso en producción es desaconsejable sin una evaluación propia.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso independiente ni reportes de terceros.
- Metadatos incompletos: no se declaran idiomas, tipos de cuantización ni detalles de despliegue.
- Las fechas de creación y actualización indican 2026, y el checkpoint se actualizó 17 segundos después de su creación, lo que sugiere una publicación automatizada dentro de una batería de experimentos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Ejecución GR00T-3B: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Ejecución GR00T-3B con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Ejecución pi-0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Ejecución pi-0.5 con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Ejecución ACT con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Paper, repositorio de código, blog o demo: no disponibles en la información proporcionada.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces recuperados correspondían a páginas de conjugación del verbo inglés "begin" y no guardan relación con el checkpoint.
