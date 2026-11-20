# syun88/dual_scorpion_groot_n17_pick_place_cube

## Resumen

Dual Scorpion GR00T N1.7 es un modelo de política robótica (vision-language-action, VLA) obtenido mediante fine-tuning del modelo base NVIDIA GR00T-N1.7-3B. Lo publica el usuario syun88 en Hugging Face y está especializado en una tarea concreta de manipulación: coger y colocar un cubo (pick and place) con una plataforma robótica bimanual denominada "Dual Scorpion", equipada con tres cámaras (cabeza, muñeca izquierda y muñeca derecha).

El modelo parte de los 3.144.016.000 parámetros del checkpoint base de NVIDIA y se ha ajustado sobre un dataset propio de 100 episodios y 55.986 fotogramas, con un espacio de estado/acción de 16 dimensiones. No es un modelo de propósito general: es un artefacto de investigación reproducible que demuestra el flujo de entrenamiento de Isaac-GR00T sobre hardware específico.

Su relevancia es acotada pero útil para la comunidad de robótica: sirve como ejemplo de fine-tuning de un VLA de 3B para una tarea de manipulación bimanual, con hiperparámetros documentados (3000 pasos, learning rate 1e-4, batch efectivo de 32 mediante acumulación de gradiente). No hay métricas de éxito publicadas ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en GR00T N1.7 (no se detalla la composición interna en la información disponible) |
| Parametros totales | 3.144.016.000 (3,14B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a acción robótica, no a texto libre) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | nvidia/GR00T-N1.7-3B |
| Librería | gr00t |
| Pipeline | robotics |
| Tamaño del repositorio | 12,6 GB |
| Dataset de entrenamiento | syun88/dual_scorpion_pick_place_cube_20261119_142553 (100 episodios, 55.986 fotogramas) |
| Entradas | 3 cámaras: cabeza, muñeca izquierda, muñeca derecha |
| Dimensión estado/acción | 16 |
| Pasos de entrenamiento | 3000 |
| Learning rate | 1e-4 |
| Micro batch size | 4 |
| Acumulación de gradiente | 8 (batch efectivo 32) |
| Framework de entrenamiento | NVIDIA Isaac-GR00T |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint NVIDIA GR00T-N1.7-3B, un modelo visión-lenguaje-acción de aproximadamente 3,14B parámetros. La información disponible no detalla la composición interna del backbone (codificador visual, modelo lingüístico y cabezal de acciones), por lo que no se puede confirmar aquí si emplea un transformer denso, una mezcla de expertos o un esquema híbrido.

El entrenamiento consiste en un fine-tuning supervisado sobre el dataset `dual_scorpion_pick_place_cube_20261119_142553`, compuesto por 100 episodios y 55.986 fotogramas capturados con tres cámaras y un vector de estado/acción de 16 dimensiones. Se ejecutaron 3000 pasos con learning rate de 1e-4, micro batch de 4 y acumulación de gradiente de 8, usando el framework NVIDIA Isaac-GR00T. El autor advierte explícitamente que la pérdida de entrenamiento no es una medida del éxito de la tarea, lo que implica que no se ha validado el rendimiento en el mundo real con métricas publicadas.

## Capacidades

- Generación de acciones robóticas de manipulación a partir de observaciones visuales de tres cámaras y del estado del robot (16 dimensiones).
- Ejecución de una tarea específica de pick and place de un cubo en una configuración bimanual ("Dual Scorpion").
- Política condicionada por instrucción (propia de la familia GR00T N1.7), aunque la información disponible no especifica el formato exacto de condicionamiento lingüístico.
- Control bimanual coordinado, dado el uso de cámaras de muñeca izquierda y derecha.
- No se documentan capacidades de tool calling, razonamiento multi-paso, generación de texto libre ni procesamiento de audio.

## Casos de uso

- Automatización de pick and place en laboratorio: el modelo puede ejecutar la secuencia de coger y colocar un cubo sobre una mesa con el robot Dual Scorpion, usando las tres cámaras como entrada perceptiva.
- Reproducción de experimentos de fine-tuning VLA: sirve como referencia para validar el pipeline de Isaac-GR00T con un dataset de 100 episodios y una configuración de entrenamiento documentada.
- Base para entrenamiento con más datos: al derivar de GR00T-N1.7-3B, puede reajustarse sobre datasets ampliados de la misma plataforma para generalizar a nuevas posiciones u objetos.
- Evaluación de políticas bimanuales: útil para estudiar la coordinación de dos brazos en tareas de manipulación con realimentación visual de muñeca.
- Docencia e investigación en robótica: ejemplo reproducible de cómo adaptar un VLA de 3B a hardware específico con recursos moderados (3000 pasos, batch efectivo 32).
- Benchmark interno de infraestructura: permite medir latencia y throughput de inferencia de un VLA de 3B en el robot Dual Scorpion antes de desplegar políticas más complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica que la pérdida de entrenamiento no es una medida del éxito de la tarea y no aporta tasas de éxito, métricas de imitación ni comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,14B parámetros, en fp16 se requieren aproximadamente 6,3 GB solo para pesos, más memoria para activaciones y buffers de imagen.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16 GB o más (RTX 4090, A100, H100) es un punto de partida razonable para fp16.
- Cabe en GPU de consumo: probable en tarjetas con 16-24 GB en fp16, aunque no está verificado en la información disponible.
- Opciones de despliegue: el modelo usa la librería `gr00t` y el framework NVIDIA Isaac-GR00T; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dual_scorpion_groot_n17_pick_place_cube | 3,14B | no disponible | Pick and place bimanual (Dual Scorpion) | no disponible | Hugging Face (0 descargas) |
| nvidia/GR00T-N1.7-3B | ~3B | no disponible | VLA generalista de robótica | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otros fine-tunes de GR00T N1.7 | no disponible | no disponible | Manipulación específica | variable | no disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado solo para pick and place de un cubo con el robot Dual Scorpion; no generaliza a otras tareas, objetos o plataformas sin reentrenamiento.
- Sin métricas de éxito: el autor advierte que la pérdida de entrenamiento no mide el éxito de la tarea y no publica evaluaciones en el mundo real.
- Licencia no declarada: no se especifican condiciones de uso comercial ni restricciones derivadas del modelo base NVIDIA; es imprescindible verificar la licencia de GR00T-N1.7-3B antes de cualquier uso.
- Dataset pequeño: 100 episodios y 55.986 fotogramas limitan la robustez frente a variaciones de iluminación, posición de objetos o ruido sensorial.
- Riesgo de sobreajuste al entorno de captura: las políticas VLA entrenadas con pocos episodios suelen fallar ante cambios de disposición de cámara o del robot.
- Idiomas y contexto: no disponibles; no es un modelo de texto y no debe evaluarse con benchmarks de lenguaje.
- Sin soporte documentado de cuantización ni de despliegue fuera de Isaac-GR00T, lo que limita su portabilidad a producción.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syun88/dual_scorpion_groot_n17_pick_place_cube
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/syun88/dual_scorpion_pick_place_cube_20261119_142553
- Framework NVIDIA Isaac-GR00T: no disponible en la información proporcionada
