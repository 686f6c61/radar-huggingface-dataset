# Superstar111/pi05-yam-sharpa-spoon-scoop-base22

## Resumen

π0.5 two-skill student, arm base at 22 mm es una política vision-language-action (VLA) derivada de π0.5, publicada por el usuario Superstar111 y entrenada con el framework openpi de Physical Intelligence. El modelo ejecuta una secuencia de dos habilidades sobre un brazo robótico YAM Ultra 2 equipado con una mano Sharpa Wave de 28 articulaciones: primero "coger la cuchara" y después "servir las alubias". Se trata de un estudiante destilado a partir de un profesor scriptado, entrenado exclusivamente en simulación con Isaac Lab, sin validación todavía en el robot físico.

La variante concreta que nos ocupa reproduce el run 2 del mismo autor con un único cambio: las demostraciones del profesor se recolectaron con la base del brazo a 22 mm sobre la mesa en lugar de 25,4 mm. Mantiene el mismo profesor, escena, cámaras, receta de datos y receta de entrenamiento. El paquete incluye el checkpoint de openpi, el código fuente en el commit de entrenamiento, el tokenizador, un script de servicio y un conjunto de consultas doradas para verificar que un servidor nuevo responde de forma consistente.

El interés de esta ficha es acotado pero técnico: documenta un artefacto de investigación en robótica de manipulación, con requisitos de despliegue muy específicos (altura de base, montaje de la mano, tolerancias en radianes) y sin métricas de éxito publicadas todavía. No es un modelo de lenguaje generalista ni está pensado para inferencia de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, política transformer multimodal con entrada de imágenes y salida de acciones articulares |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son dos habilidades fijas en inglés: "pick up the spoon", "scoop the beans") |
| Licencia | no disponible |
| Formato de pesos | checkpoint de openpi (`params/` + norm stats en `assets/local/main_hcw_nom_n300/`), acompañado de `openpi_src.tar.gz` y `openpi_data.tar.gz` |
| Tamaño del repositorio | 12,4 GB |
| Hardware de entrenamiento | 1× NVIDIA H200 (el run 2 usó 1× RTX PRO 6000) |
| Hardware de inferencia | GPU NVIDIA con ~10 GB libres (según la model card) |
| Entorno de ejecución | `uv` + openpi en el commit c49008b; servidor HTTP en el puerto 8000 vía `serve_vla.sh` |

## Arquitectura y entrenamiento

El modelo es una política π0.5 entrenada con openpi, el stack de Physical Intelligence para políticas VLA. La arquitectura subyacente de π0.5 combina un backbone vision-language con un cabezal de acciones, pero la model card no detalla la configuración concreta (número de parámetros, capas, dimensión de las imágenes o del estado). La política recibe tres vistas de cámara (head, wrist y cam1) a resolución 284 × 160 y produce acciones para un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones. La configuración de entrenamiento se llama `pi05_maggie_2skill_hcw_nojit`.

El entrenamiento es de imitación supervisada sobre demostraciones de un profesor scriptado, no de RLHF ni DPO. Se recolectaron 390 intentos, de los que se aceptaron 300 episodios sobre semillas de entrenamiento desde 11000. En cada episodio el brazo parte en reposo sin vibración, el quemador y la olla se desplazan ±2 cm y ±5°, y la cámara e iluminación son nominales. El pack de datos `main_hcw_nom_n300` contiene 600 segmentos de habilidad y 64.292 filas. El entrenamiento se ejecutó durante 6000 pasos con semilla 43 en una H200, usando el commit c49008b de openpi.

La innovación técnica relevante no está en la arquitectura sino en el control de la reproducibilidad: el paquete incluye `golden.py` y `golden.npz` con 12 consultas grabadas y sus respuestas, de modo que un servidor recién desplegado debe responder dentro de 0,002 rad de las respuestas del clúster de entrenamiento (tolerancia 0,005 rad) tras verificar los sha256 del checkpoint y del bundle. También se documenta el montaje de la mano: el modelo se entrenó con el montaje original y, para el montaje girado, debe usarse la conversión `--hand-mount turned` del runner en lazo cerrado (dextool PR #13).

## Capacidades

- Ejecución de una secuencia de dos habilidades encadenadas: "pick up the spoon" y después "scoop the beans".
- Control de un brazo YAM Ultra 2 con mano Sharpa Wave de 28 articulaciones, con salida de acciones articulares en radianes.
- Percepción multimodal a partir de tres vistas de cámara (head, wrist, cam1) a 284 × 160.
- Condicionamiento por instrucción de tarea en inglés, limitado a las dos habilidades entrenadas.
- Robustez limitada a variaciones de posición del quemador y la olla (±2 cm y ±5°) y a condiciones nominales de cámara e iluminación.
- Verificación de consistencia de despliegue mediante consultas doradas con tolerancia de 0,002 rad.
- No soporta tool calling, function calling, agentes multi-paso genéricos, visión general, audio ni modo de razonamiento explícito ("thinking mode").

## Casos de uso

- Investigación en destilación de políticas VLA: el modelo sirve como estudiante de referencia para comparar recetas de datos (por ejemplo, el efecto de cambiar la altura de la base de 25,4 a 22 mm) manteniendo constante el resto del pipeline.
- Replicación de experimentos de manipulación en simulación: con el bundle de openpi y las semillas documentadas, un laboratorio puede reproducir el entrenamiento y contrastar las respuestas del servidor con `golden.npz` antes de lanzar nuevos experimentos.
- Validación de pipelines de despliegue robótico: el script `serve_vla.sh` y las comprobaciones sha256 permiten montar un servidor de inferencia en una GPU con ~10 GB libres y verificar que la política responde de forma determinista.
- Estudio de sensibilidad a la calibración física: la model card documenta el efecto de 2 mm de diferencia en la altura de la base sobre el agarre, lo que convierte al modelo en un caso de estudio sobre tolerancias mecánicas en transferencia sim-a-real.
- Pruebas de agarre cerca de superficie: dado que el pulgar del profesor queda a 2,5 mm de media (1,2 mm en el mínimo) sobre la mesa en 20 escenas de entrenamiento, el modelo es útil para evaluar estrategias de seguridad y parada de emergencia en agarres rasantes.
- Benchmark interno de cadenas de habilidades: la evaluación pendiente sobre 25 escenas de validación con 2 muestras cada una, comparada con el run 2, sirve como base para medir la tasa de éxito de la cadena pickup→scoop.
- Docencia y divulgación en robótica: el paquete autocontenido (código, tokenizador, checkpoint y consultas doradas) facilita demostrar el ciclo completo de una política VLA sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la evaluación de la cadena (pickup y después scoop) sobre 25 escenas de validación, con 2 muestras por escena, está en curso y que los resultados se añadirán. El único dato numérico verificado es la consistencia del servidor: 12 consultas grabadas responden dentro de 0,002 rad de las respuestas del clúster de entrenamiento, con tolerancia de 0,005 rad.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10 GB libres en GPU NVIDIA, según la model card; no se especifica el consumo exacto por cuantización.
- GPU de entrenamiento documentada: 1× NVIDIA H200 para esta variante; el run 2 usó 1× RTX PRO 6000.
- GPU de inferencia recomendadas: no disponible de forma explícita; el requisito de ~10 GB es compatible con tarjetas de gama alta de consumo, pero no se confirma ningún modelo concreto.
- Despliegue: servidor HTTP de openpi lanzado con `serve_vla.sh 8000`, que requiere `uv` y construye el entorno de openpi en la primera ejecución.
- Almacenamiento: el repositorio ocupa 12,4 GB, por lo que conviene reservar espacio para el checkpoint, el bundle y las extracciones de `openpi_src.tar.gz` y `openpi_data.tar.gz`.
- Latencia y throughput: no disponibles.
- Verificación previa: ejecutar `sha256sum -c` sobre `CHECKPOINT_SHA256SUMS` y `BUNDLE_SHA256SUMS`, y después `golden.py check` antes de aceptar consultas reales.

## Comparativa con modelos similares

| Modelo | Tipo | Habilidades | Hardware de entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| Superstar111/pi05-yam-sharpa-spoon-scoop-base22 | Política VLA π0.5 (openpi) | 2 (pickup, scoop) | 1× H200 | no disponible | Simulación, sin validar en robot |
| Superstar111/pi05-yam-sharpa-spoon-scoop-run2 | Política VLA π0.5 (openpi) | 2 (pickup, scoop) | 1× RTX PRO 6000 | no disponible | Simulación, sin validar en robot |
| π0.5 base (Physical Intelligence) | Política VLA generalista | Múltiples tareas de manipulación | no disponible en esta ficha | no disponible en esta ficha | Publicado por el desarrollador original |

La comparación con π0.5 base es solo categórica: esta ficha no dispone de parámetros, contexto ni resultados de benchmarks del modelo original. Frente al run 2, la única diferencia documentada es la altura de la base (22 mm frente a 25,4 mm), manteniendo profesor, escena, cámaras y recetas.

## Limitaciones y advertencias

- El modelo no se ha ejecutado en el robot real; todos los resultados son de simulación (Isaac Lab).
- La altura de la base es crítica: se entrenó con la base a 22 mm sobre la mesa, pero el rig físico medía unos 20 mm, lo que sitúa la mano real unos 2 mm más baja que en simulación.
- El agarre del profesor pasa muy cerca de la mesa (2,5 mm de media, 1,2 mm en el mínimo sobre 20 escenas), por lo que con el rig 2 mm más bajo es esperable que el pulgar roce o presione la mesa durante el agarre; debe haber una persona en la parada de emergencia.
- El montaje de la mano debe corresponder al original; con el montaje girado hay que usar la conversión `--hand-mount turned` del runner en lazo cerrado (dextool PR #13).
- Solo cubre dos habilidades y dos instrucciones en inglés; no es un modelo generalista ni multilingüe.
- No hay datos publicados sobre sesgos, tasas de alucinación ni robustez fuera de las condiciones nominales de cámara e iluminación.
- La licencia no está disponible, por lo que no puede confirmarse el uso comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación externa prácticamente nula.
- El rendimiento de la cadena pickup→scoop está pendiente de evaluación; no debe asumirse una tasa de éxito concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-base22
- Run 2 de referencia: https://huggingface.co/Superstar111/pi05-yam-sharpa-spoon-scoop-run2
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Commit de entrenamiento de openpi: c49008b
- Referencia dextool PR #11 (formatos de petición y respuesta): no disponible como enlace directo en la información proporcionada
- Referencia dextool PR #13 (conversión `--hand-mount turned`): no disponible como enlace directo en la información proporcionada
