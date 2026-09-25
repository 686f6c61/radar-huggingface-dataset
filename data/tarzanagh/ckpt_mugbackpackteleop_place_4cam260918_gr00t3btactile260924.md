# tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924

## Resumen

Este repositorio contiene un checkpoint de política robótica entrenada por imitación sobre la base GR00T-N1.7-3B, con 3.144.016.000 parámetros (3,14 B) y pesos en formato safetensors (12,6 GB de repositorio). El modelo resuelve una tarea bimanual concreta de manipulación diestra: un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1 sostiene una mochila abierta con la mano izquierda e introduce una taza en su interior con la derecha, a partir de demostraciones de teleoperación con meta-guante y seguimiento de muñeca Vive.

La relevancia del checkpoint es metodológica más que de producto: forma parte de una serie de ejecuciones comparables de la misma tarea sobre distintas familias de políticas (GR00T, pi-0.5, ACT, Diffusion Policy, T-Rex), lo que permite comparar arquitecturas bajo un mismo dataset de 31 episodios y una misma métrica de error en bucle abierto. En la comparativa publicada por el autor, la variante GR00T obtiene el error más bajo de las familias ya finalizadas, entre 3 y 4 veces por debajo de pi-0.5 y ACT.

Es importante señalar el alcance: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, no validado en hardware real, y con licencia "other" sin términos explícitos en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) de la familia GR00T N1.7; detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: no es un modelo de lenguaje. Entrada de 4 camaras RGB a 640x360 y 30 fps; chunk de accion de 16 pasos con reobservacion cada 16 pasos |
| Tipos de cuantizacion | no disponible (repositorio en safetensors; 12,6 GB para 3,14 B parametros es coherente con pesos en fp32, ~4 bytes por parametro) |
| Idiomas soportados | no disponible (modelo de robotica; no procesa lenguaje natural) |
| Licencia | other |
| Formato de pesos | safetensors |
| Dimension de estado/accion | 38-D de posiciones articulares [L_arm 7 \| L_hand 12 \| R_arm 7 \| R_hand 12]; 30-D de fuerza en punta de dedo (5 dedos x 3 ejes por mano) concatenados al estado, resultando 68-D |
| Entradas sensoriales | 4 camaras RGB 640x360 @ 30 fps; realimentacion tactil de fuerza en punta de dedo |
| Hardware objetivo | Robot DexMate Vega-1 con dos manos RobotEra XHand1 |
| Pasos de entrenamiento | 10.000, semilla 1000 |
| Tamano del repositorio | 12,6 GB |

## Arquitectura y entrenamiento

El checkpoint pertenece a la familia GR00T-N1.7 (etiqueta `Gr00tN1d7`) y se distribuye como política de imitación para control bimanual diestro. La información disponible no detalla la composición interna de la red (backbone visual, encoder de lenguaje, cabeza de difusión o flujo, etc.), por lo que cualquier afirmación sobre bloques concretos sería especulativa. Lo que sí está documentado es la interfaz: el modelo consume 4 cámaras RGB a 640x360 y 30 fps, además de un vector de estado de 68 dimensiones que combina 38 posiciones articulares con 30 valores de fuerza táctil (5 dedos x 3 ejes por mano), y emite chunks de acción de 16 pasos que se ejecutan en bucle abierto hasta la siguiente reobservación.

El entrenamiento se realizó por aprendizaje por imitación sobre 31 episodios de teleoperación con meta-guante (sin exoesqueleto) y seguimiento de muñeca Vive. El reparto es de 27 episodios de entrenamiento y 4 de validación (se retiene cada décimo episodio). Se ejecutaron 10.000 pasos de optimización con semilla 1000. No hay información sobre número de tokens, composición del dataset, ni sobre etapas de RLHF o DPO, que en cualquier caso no aplican al paradigma de imitación robótica.

La innovación evaluada en este repositorio es la incorporación de realimentación táctil: existe una ejecución gemela sin tacto (`..._gr00t3b260924`) que permite aislar el efecto de esa modalidad. Según el autor, la entrada táctil no produjo una diferencia consistente en el error de seguimiento en esta tarea.

## Capacidades

- Control bimanual coordinado: una mano sujeta y estabiliza la mochila mientras la otra inserta la taza, con 38 grados de libertad articulares repartidos entre brazos y manos.
- Manipulación diestra con manos XHand1 (12 articulaciones por mano), incluyendo control fino de dedos.
- Percepción multi-cámara: procesa simultáneamente 4 vistas RGB a 640x360 y 30 fps.
- Integración de realimentación táctil: consume 30 dimensiones de fuerza en punta de dedo (5 dedos x 3 ejes por mano) concatenadas al estado.
- Generación de chunks de acción: predice 16 pasos de acción por inferencia y los ejecuta en bucle abierto.
- Aprendizaje por imitación a partir de demostraciones de teleoperación con meta-guante y Vive.
- No dispone de tool calling, function calling, capacidades de agente multi-paso, ni capacidades multilingües: no es un modelo de lenguaje ni un agente conversacional.

## Casos de uso

- Investigación en políticas VLA: sirve como punto de comparación reproducible frente a pi-0.5, ACT, Diffusion Policy y T-Rex sobre un mismo dataset y métrica, lo que permite evaluar arquitecturas bajo condiciones controladas.
- Tarea de empaquetado bimanual: el modelo está entrenado específicamente para sostener un contenedor flexible (mochila) con una mano e insertar un objeto (taza) con la otra, un escenario representativo de logística y montaje.
- Ablación de modalidades sensoriales: la existencia de la variante sin tacto permite cuantificar el impacto real de la señal táctil en el error de seguimiento de una política concreta.
- Recolección de datos de teleoperación: el pipeline documentado (meta-guante, Vive, 4 cámaras, 31 episodios) es reutilizable como plantilla para generar nuevos datasets bimanuales.
- Punto de partida para fine-tuning: al ser un checkpoint de 3,14 B con licencia permisiva en la práctica (aunque etiquetada como "other"), puede servir de base para reentrenar tareas de manipulación con manos XHand1 o hardware similar.
- Evaluación offline de políticas: la métrica de error en bucle abierto (media \|pred − acción registrada\| en radianes) permite comparar checkpoints sin acceso al robot físico.
- Docencia y reproducción de experimentos: adecuado para cursos o laboratorios de robótica de manipulación, dado que el material incluye episodios de entrenamiento y validación definidos y una semilla fija.

## Benchmarks y rendimiento

Error en bucle abierto sobre el conjunto reservado (media \|pred − acción registrada\|, radianes, ± SEM, n=4):

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (GR00T-3B + táctil) | 0,0112 ± 0,0005 | 0,0082 ± 0,0003 | 0,0160 ± 0,0005 | 0,0110 ± 0,0005 |
| Referencia hold-first-frame | 0,2132 | 0,3383 | 0,2756 | 0,1755 |

Notas de interpretación publicadas por el autor: la política observa el estado real cada 16 pasos y predice un chunk, del que se conservan las 16 primeras acciones; la métrica mide seguimiento de trayectoria, no éxito en la tarea; ninguna ejecución se probó en hardware. En esta tarea, GR00T obtuvo el error más bajo de las familias finalizadas (entre 3 y 4 veces por debajo de pi-0.5 y ACT), y la entrada táctil no marcó una diferencia consistente. Las ejecuciones de Diffusion Policy y T-Rex para esta tarea seguían entrenándose en el momento de publicar la model card.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni equivalentes) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 12,6 GB solo para los pesos si se carga en la precisión del repositorio (coherente con fp32 para 3,14 B). En bf16 serían unos 6,3 GB de pesos, más el coste de activaciones y de los encoders visuales de 4 cámaras, no cuantificado en la información disponible.
- GPU recomendadas: no hay recomendación oficial. Por tamaño de pesos, una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son suficientes para los pesos en precisión completa; A100 (40/80 GB) y H100 son opciones de servidor con margen para lotes mayores y múltiples flujos de cámara.
- Compatibilidad con GPU de consumo: sí, en tarjetas con 16-24 GB de VRAM. Por debajo de 16 GB sería necesario reducir precisión o descargar componentes a CPU, algo no documentado por el autor.
- Opciones de despliegue: no es compatible con servidores de inferencia de texto como vLLM, llama.cpp, Ollama o TGI. El despliegue requiere el stack de inferencia de políticas GR00T sobre PyTorch, con captura de 4 flujos RGB a 30 fps y un bucle de control que ejecute chunks de 16 acciones.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia ni frecuencia de control alcanzada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-3B + tactil (este modelo) | 3,14 B | 4 camaras RGB 640x360 + estado 68-D + tactil | Error en bucle abierto mas bajo de las familias finalizadas (3-4x mejor que pi-0.5 y ACT) | other | Repositorio HuggingFace publicado |
| GR00T-3B sin tactil (`..._gr00t3b260924`) | 3,14 B | Igual, sin entrada tactil | Practicamente equivalente; el tacto no aporto diferencia consistente | other | Repositorio HuggingFace publicado |
| pi-0.5 (`..._pi05260924`, `..._pi05tactile260924`) | no disponible | no disponible | Error 3-4x superior al de GR00T en esta tarea | no disponible | Repositorio HuggingFace publicado |
| ACT (`..._act260924`, `..._acttactile260924`) | no disponible | no disponible | Error 3-4x superior al de GR00T en esta tarea | no disponible | Repositorio HuggingFace publicado |
| Diffusion Policy, T-Rex | no disponible | no disponible | Entrenamiento en curso en el momento de la publicacion | no disponible | No disponible |

No se dispone de datos de parametros, contexto ni licencia de los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- No validado en hardware: el propio autor indica que nada de lo reportado se ejecutó en el robot físico. El error en bucle abierto mide seguimiento de trayectoria, no éxito en la tarea.
- Conjunto de validación muy pequeno: n=4 episodios reservados, con la incertidumbre reportada como error estandar de la media; la robustez estadística de las conclusiones es limitada.
- Dataset reducido y de una sola tarea: 31 episodios de una única secuencia de manipulación (mochila + taza). No hay evidencia de generalización a otros objetos, contenedores o disposiciones.
- Dependencia estrecha del hardware: entrenado para DexMate Vega-1 con manos RobotEra XHand1 y disposición de 4 cámaras a 640x360; el modelo no es directamente trasladable a otras plataformas sin reentrenamiento.
- Efecto del tacto no demostrado: la entrada táctil no produjo diferencias consistentes en el error de seguimiento según el autor, pese a incluirse 30 dimensiones de fuerza.
- Sesgos: no hay análisis de sesgos publicado. Al derivarse de teleoperación humana con meta-guante, hereda los sesgos de las demostraciones (estilo, cinemática y distribución de estados del operador).
- Riesgo de fallo fuera de distribución: al ser una política de imitación pura con reobservación cada 16 pasos en bucle abierto, los estados no vistos durante el entrenamiento pueden provocar acciones erráticas sin mecanismo de recuperación documentado.
- Licencia restrictiva o ambigua: etiquetada como "other" sin texto de licencia en la información disponible, lo que impide confirmar si se permite uso comercial. Debe verificarse antes de cualquier despliegue productivo.
- Sin soporte de lenguaje: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso.
- Sin tracción comunitaria verificable: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de reproducción.
- Los resultados de búsqueda web asociados a este identificador no contenían información técnica relevante sobre el modelo y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3btactile260924
- Misma tarea, GR00T-3B sin táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_gr00t3b260924
- Misma tarea, pi-0.5: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05260924
- Misma tarea, pi-0.5 con táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_pi05tactile260924
- Misma tarea, ACT: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_act260924
- Misma tarea, ACT con táctil: https://huggingface.co/tarzanagh/ckpt_mugbackpackteleop_place_4cam260918_acttactile260924
- Paper, repositorio de código, blog o demo oficiales: no disponibles en la información proporcionada.
