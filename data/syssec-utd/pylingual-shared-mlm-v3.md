# syssec-utd/pylingual-shared-mlm-v3

## Resumen
pylingual-shared-mlm-v3 es un modelo de lenguaje enmascarado (MLM) desarrollado por el grupo syssec-utd, orientado a la investigación en descompilación de bytecode de Python. Se trata de la columna vertebral ("backbone") compartida del estudio de arquitectura shared-backbone con adaptadores LoRA por versión, entrenada sobre código Python de las versiones 3.6 a 3.15. El modelo se publica como artefacto de investigación, no como producto listo para producción.

La model card es extremadamente escueta: no detalla arquitectura, número de parámetros, longitud de contexto ni idiomas soportados. Lo que sí documenta es el proceso de entrenamiento: 2 épocas, batch global de 28 en una única GPU, learning rate de 5e-05, weight decay 0, precisión FP32 y semilla 20261020, partiendo de inicialización aleatoria ("Initialization: None"). El dataset asociado contiene 150.000 ficheros fuente y 4.660.343 filas codificadas.

Su relevancia es acotada pero clara: forma parte de una línea de trabajo sobre descompilación asistida por modelos de lenguaje, donde un backbone único compartido entre versiones de Python se combina con LoRA específicos por versión. Para desarrolladores e investigadores interesados en ingeniería inversa de bytecode o en arquitecturas multi-adaptador, el repositorio incluye la trazabilidad completa (manifiesto de datos, hash del tokenizador, commit del código y `provenance.json`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (MLM tipo transformer, sin detallar en la model card) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (entrenado sobre código Python 3.6-3.15) |
| Licencia | other (sin términos concretos especificados) |
| Formato de pesos | no disponible (el repositorio contiene `last-checkpoint/` y el modelo final en la raíz) |

## Arquitectura y entrenamiento
La model card no especifica la arquitectura interna más allá de identificarlo como un backbone MLM. El diseño experimental es el de un backbone compartido entre todas las versiones de Python, sobre el que se montan adaptadores LoRA por versión; este repositorio contiene únicamente el backbone universal. La inicialización es desde cero ("Initialization: None"), sin partir de un modelo preentrenado.

El entrenamiento se realizó sobre el dataset `syssec-utd/pylingual-shared-encoded-v3`, partición `universal/segmentation`, en la revisión `11616fd4db16c5c567c189210702da68b0deb7cb`. El corpus consta de 150.000 ficheros fuente que generan 4.660.343 filas codificadas, con un tokenizador cuyo `tokenizer.json` tiene sha256 `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`. Los hiperparámetros son 2 épocas, batch global 28 (28 × 1 de acumulación × 1 GPU), learning rate 5e-05, weight decay 0, precisión FP32 y semilla 20261020. El código de entrenamiento está en el repositorio `quinntyx/pylingual`, rama `feat-shared-backbone-lora`, commit `dda4bd2dca0c7acf445cd611d5fa5e655c3ce572`. No se documenta el número total de tokens procesados ni la composición detallada del dataset.

## Capacidades
- Modelo de lenguaje enmascarado (MLM): predice tokens ocultos, no genera texto autoregresivamente.
- Entrenado específicamente sobre código Python de las versiones 3.6 a 3.15, lo que lo orienta a tareas de comprensión de bytecode y código fuente.
- Diseñado como backbone compartido para combinarse con adaptadores LoRA por versión de Python.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso
- Investigación en descompilación de bytecode: el modelo sirve como base para experimentos de reconstrucción de código fuente a partir de bytecode Python, combinado con los LoRA por versión del estudio.
- Estudio de arquitecturas multi-adaptador: permite evaluar si un backbone único compartido entre versiones de Python (3.6-3.15) es suficiente frente a modelos independientes por versión.
- Relleno de máscaras en código fuente: al ser un MLM, puede emplearse para predecir identificadores o fragmentos ocultos en ficheros Python, útil en tareas de análisis estático asistido.
- Reproducción de experimentos: la trazabilidad completa (dataset, tokenizador, hiperparámetros, commit de código) permite replicar el entrenamiento y comparar resultados.
- Extracción de representaciones para clasificación de código: las representaciones internas del backbone pueden alimentar clasificadores de fragmentos de código o de versiones de Python.
- Base para fine-tuning con LoRA: el diseño shared-backbone facilita adaptar el modelo a tareas específicas de seguridad o análisis de código sin reentrenar el backbone completo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (el número de parámetros no se especifica en la model card).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo.
- Opciones de despliegue: no documentadas; al ser un MLM entrenado con Hugging Face Trainer, es probable que los pesos sean compatibles con `transformers`, pero no se confirma en la model card.
- Latencia y throughput: no disponibles.
- Nota: el entrenamiento se realizó en una única GPU con batch global 28 en FP32, lo que sugiere un modelo de tamaño moderado, pero es una inferencia no confirmada.

## Comparativa con modelos similares
No disponible. La model card no identifica modelos comparables ni se dispone de datos de rendimiento que permitan una comparación rigurosa con otros backbones MLM orientados a código.

## Limitaciones y advertencias
- La model card no documenta arquitectura, tamaño, contexto ni idiomas; la evaluación técnica independiente es imposible sin inspeccionar los pesos.
- Licencia "other" sin términos concretos: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.
- Al ser un MLM, no está diseñado para generación de texto libre ni para tareas conversacionales.
- Entrenado exclusivamente sobre código Python 3.6-3.15: el rendimiento fuera de ese dominio es incierto.
- Riesgo de alucinación en predicciones de tokens: inherente a los MLM cuando se usan para completar código.
- Sesgos: no documentados; el corpus de 150.000 ficheros fuente puede contener sesgos propios de la distribución de código analizado.
- El repositorio puede contener un checkpoint intermedio (`last-checkpoint/`) junto al modelo final; conviene verificar qué artefacto se carga.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-mlm-v3
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v3
- Código de entrenamiento: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `dda4bd2dca0c7acf445cd611d5fa5e655c3ce572`)
