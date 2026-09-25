# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924

## Resumen

Este repositorio contiene un checkpoint de política robótica basada en GR00T-N1.7-3B (etiqueta del repo `Gr00tN1d7`), desarrollado por el usuario `tarzanagh` (Davoud Ataee Tarzanagh, AI Scientist en Samsung SDS Research America, Mountain View, centrado en Physical AI). Se trata de un modelo de imitación visomotora entrenado para una tarea concreta de manipulación bimanual diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 mantiene una mochila abierta con la mano izquierda e introduce una taza en su interior con la derecha.

El modelo tiene 3.144.016.000 parámetros (~3,14 mil millones) y el repositorio ocupa 12,6 GB en formato safetensors. Se entrenó con 31 episodios de teleoperación (27 de entrenamiento y 4 reservados, tomando cada décimo), con 4 cámaras RGB a 640x360 y 30 fps, y un espacio de estado/acción de 38 dimensiones de posiciones articulares `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`. El entrenamiento se realizó durante 10.000 pasos con semilla 1000.

Su relevancia es doble: por un lado, publica pesos y métricas de error en bucle abierto de una tarea bimanual con manos diestras, un escenario poco cubierto por checkpoints abiertos; por otro, forma parte de una familia de ejecuciones comparables de la misma tarea (variantes con tacto, pi-0.5, ACT, Diffusion Policy y T-Rex), lo que permite comparar arquitecturas sobre datos idénticos. El autor reporta que GR00T obtuvo el error más bajo de las familias finalizadas, entre 3 y 4 veces por debajo de pi-0.5 y ACT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No detallada en la información disponible (etiqueta del repo: `Gr00tN1d7`; política de imitación visomotora) |
| Parametros totales | 3.144.016.000 (~3,14 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No aplica como contexto de tokens; la política observa cada 16 pasos y predice un chunk de acciones del que conserva las 16 primeras |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; no se documentan idiomas) |
| Licencia | `other` (condiciones no especificadas en la información disponible) |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 12,6 GB |
| Pipeline declarado | robotics |
| Entrada sensorial | 4 cámaras RGB, 640x360 a 30 fps |
| Espacio de estado/acción | 38-D: `[L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]` posiciones articulares |
| Hardware objetivo | DexMate Vega-1 con dos manos RobotEra XHand1 |
| Datos de entrenamiento | 31 episodios (27 entrenamiento / 4 reservados), 10.000 pasos, semilla 1000 |
| Teleoperación | Guante Meta (sin exoesqueleto) y seguimiento de muñeca Vive |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo más allá de la etiqueta `Gr00tN1d7` y su naturaleza de política de imitación visomotora. Lo que sí está documentado es su interfaz: consume observaciones de 4 cámaras RGB (640x360 a 30 fps) y produce vectores de acción de 38 dimensiones que combinan las posiciones articulares de ambos brazos (7 grados de libertad cada uno) y de ambas manos (12 grados de libertad cada una). La política no opera paso a paso: observa el estado real cada 16 pasos, predice un chunk de acciones y ejecuta las 16 primeras, un esquema habitual para reducir la latencia de inferencia y suavizar el control.

El entrenamiento se hizo por imitación sobre 31 episodios de teleoperación recogidos con guante Meta y seguimiento Vive, con 27 episodios para entrenamiento y 4 reservados (seleccionando cada décimo). Se ejecutaron 10.000 pasos con semilla 1000. El autor indica explícitamente que las métricas publicadas miden seguimiento de trayectoria en bucle abierto y no éxito de tarea, y que nada se ejecutó en hardware real. En la misma tarea, la variante con entrada táctil (`..._gr00t3btactile260924`) no mostró una diferencia consistente respecto a esta versión sin tacto, y las ejecuciones de Diffusion Policy y T-Rex seguían entrenándose en el momento de publicar la model card.

## Capacidades

- Generación de acciones de control bimanual: predice posiciones articulares de 38 dimensiones para dos brazos de 7 DoF y dos manos diestras de 12 DoF cada una.
- Manipulación diestra bimanual: la tarea objetivo combina sostener una mochila abierta con la mano izquierda e insertar una taza con la derecha, lo que requiere coordinación entre ambas manos.
- Percepción visual multivista: consume 4 cámaras RGB simultáneas a 640x360 y 30 fps.
- Predicción por chunks: genera un bloque de acciones por observación y ejecuta las 16 primeras, repitiendo el ciclo cada 16 pasos.
- Aprendizaje por imitación a partir de teleoperación: el pipeline de datos usa guante Meta sin exoesqueleto y seguimiento de muñeca Vive.
- No dispone de generación de texto, razonamiento simbólico, matemáticas, código ni capacidades multilingües.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.
- No se documentan capacidades de audio ni modos de razonamiento explícito (thinking).

## Casos de uso

- Referencia para comparar arquitecturas de políticas: al compartir datos, tarea y protocolo de evaluación con las ejecuciones de pi-0.5, ACT, Diffusion Policy y T-Rex, este checkpoint sirve como base para comparar familias de modelos sobre el mismo conjunto de 31 episodios.
- Punto de partida para ajuste fino en manipulación bimanual: un equipo que quiera adaptar una política de 3,14 mil millones de parámetros a una nueva tarea con dos brazos y manos diestras puede partir de estos pesos en lugar de entrenar desde cero con pocos episodios.
- Evaluación de esquemas de chunking de acciones: la política observa cada 16 pasos y ejecuta 16 acciones, por lo que es útil para estudiar el compromiso entre frecuencia de observación, latencia de control y suavidad de trayectoria.
- Estudio del efecto de la entrada táctil: la existencia de la variante `..._gr00t3btactile260924` sobre los mismos episodios permite analizar si el tacto aporta mejora medible en seguimiento de trayectoria para esta tarea.
- Recolección y validación de datos de teleoperación: el esquema de guante Meta con seguimiento Vive y 4 cámaras sirve como plantilla reproducible para pipelines de captura de demostraciones bimanuales.
- Investigación en control de manos diestras: al cubrir 12 grados de libertad por mano, es adecuado para estudiar coordinación intra-mano en tareas de precisión como la inserción de objetos.
- Docencia y prototipado en robótica de imitación: sirve como ejemplo completo y acotado de entrenamiento de una política visomotora con presupuesto de cómputo modesto (10.000 pasos, 31 episodios).

## Benchmarks y rendimiento

El autor publica una única métrica: error en bucle abierto sobre los 4 episodios reservados, definido como la media de |predicción − acción registrada| en radianes (± SEM, n = 4). Mide seguimiento de trayectoria, no éxito de tarea.

| Modelo | L-brazo (rad) | L-mano (rad) | R-brazo (rad) | R-mano (rad) |
|---|---|---|---|---|
| Este modelo (GR00T-N1.7-3B) | 0,0108 ± 0,0005 | 0,0085 ± 0,0003 | 0,0155 ± 0,0004 | 0,0110 ± 0,0004 |
| Baseline hold-first-frame | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes de robótica como tasas de éxito en banco de pruebas) en la información disponible. La comparación con pi-0.5, ACT, Diffusion Policy y T-Rex se expresa solo de forma relativa: el autor indica que GR00T obtuvo el error más bajo de las familias finalizadas, entre 3 y 4 veces por debajo de pi-0.5 y ACT, sin publicar las cifras concretas de esas alternativas. Las ejecuciones de Diffusion Policy y T-Rex seguían en entrenamiento.

## Requisitos de hardware

- VRAM de pesos, estimada a partir del recuento de parámetros (3,144 mil millones): en bf16/fp16 aproximadamente 6,3 GB; en int8 aproximadamente 3,1 GB; en int4 aproximadamente 1,6 GB. Estas cifras son estimaciones, no datos publicados por el autor.
- A la VRAM de pesos hay que sumar el coste de activaciones y del procesamiento de 4 flujos de vídeo RGB a 640x360 y 30 fps, no cuantificado en la información disponible.
- GPU de gama alta para investigación y entrenamiento: A100, H100 o L40S, especialmente si se reentrena o se ajusta con los 31 episodios completos.
- GPU de consumo: el modelo debería caber en tarjetas con 24 GB de VRAM (RTX 3090, RTX 4090) en bf16/fp16 para inferencia; en configuraciones de 12-16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: no se documenta ninguna. Al publicarse solo pesos safetensors, el camino natural es cargarlos con PyTorch; no consta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que en general no están orientados a políticas visomotoras de control.
- Latencia y throughput: no disponibles. La cadencia de control se deduce del protocolo de evaluación (observación cada 16 pasos con 4 cámaras a 30 fps), pero no se publican tiempos de inferencia medidos.
- No se ha ejecutado en hardware real, por lo que no hay datos de comportamiento en tiempo real sobre el robot DexMate Vega-1.

## Comparativa con modelos similares

Todas las alternativas pertenecen al mismo conjunto de ejecuciones de la tarea, publicadas por el mismo autor sobre los mismos 31 episodios y el mismo esquema de evaluación.

| Modelo | Parámetros | Contexto | Error en bucle abierto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-3B (este checkpoint) | 3,144 mil M | No aplica (chunk de 16 acciones) | Referencia: el más bajo de las familias finalizadas | `other` | HuggingFace, safetensors, 12,6 GB |
| pi-0.5 | No disponible | No disponible | 3-4 veces superior a este modelo | No disponible | Checkpoint hermano en HuggingFace |
| ACT | No disponible | No disponible | 3-4 veces superior a este modelo | No disponible | Checkpoint hermano en HuggingFace |
| Diffusion Policy | No disponible | No disponible | En entrenamiento al publicar la model card | No disponible | No disponible |
| T-Rex | No disponible | No disponible | En entrenamiento al publicar la model card | No disponible | No disponible |
| GR00T-N1.7-3B con tacto | 3,144 mil M (misma base) | No aplica | Diferencia no consistente respecto a la versión sin tacto | `other` | Checkpoint hermano en HuggingFace |

No se dispone de los recuentos de parámetros, ventanas de contexto ni licencias de pi-0.5, ACT, Diffusion Policy y T-Rex en la información proporcionada, por lo que la comparación se limita al error relativo reportado por el autor.

## Limitaciones y advertencias

- No se ha validado en hardware real: el propio autor indica que nada de lo publicado se ejecutó sobre el robot, por lo que no hay evidencia de éxito de tarea ni de robustez física.
- La métrica publicada es error de seguimiento de trayectoria en bucle abierto, no tasa de éxito. Un error bajo en radianes no garantiza que la tarea de introducir la taza en la mochila se complete.
- Base de datos muy reducida: 31 episodios en total y solo 4 reservados, lo que limita la significación estadística de las cifras reportadas (los intervalos se dan como ± SEM con n = 4).
- Especialización extrema: la política está entrenada para una única tarea, un único robot (DexMate Vega-1) y un par de manos concreto (RobotEra XHand1). No se documenta generalización a otras tareas, objetos o morfologías.
- No es un modelo de lenguaje: no procesa ni genera texto, no tiene capacidades multilingües y no soporta tool calling ni razonamiento multi-paso.
- Licencia `other`: las condiciones no están especificadas en la model card, por lo que el uso comercial queda en un estado jurídico indeterminado y requeriría contactar con el autor.
- Riesgo de sobreajuste al operador y a las condiciones de captura: los datos provienen de teleoperación con guante Meta y seguimiento Vive, y las 4 cámaras imponen una configuración de sensores fija.
- Sesgos y riesgos de alucinación en el sentido de los modelos generativos no están documentados; en su lugar existe el riesgo de que la política genere acciones plausibles pero incorrectas ante distribuciones de entrada distintas de las vistas en entrenamiento.
- La entrada táctil no aportó una mejora consistente según el autor, de modo que no debe asumirse que la variante táctil sea superior en producción.
- Las fechas de creación y actualización del repositorio (2026) no coinciden con el calendario habitual de publicación; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Variante con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Variante pi-0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Variante pi-0.5 con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Variante ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Variante ACT con tacto: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Otro checkpoint GR00T-3B del mismo autor (tarea putaside): https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260629-260708_gr00t3b260816
- Otro checkpoint GR00T-3B del mismo autor (tarea putaside, segunda tanda): https://huggingface.co/tarzanagh/ckpt_psspteleop_putaside_4cam260810-260811_gr00t3b260816
- Página personal del autor: https://tarzanagh.github.io/
