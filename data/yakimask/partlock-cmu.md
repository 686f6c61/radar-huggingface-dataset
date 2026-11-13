# Yakimask/PartLock-CMU

## Resumen

PartLock-CMU es un modelo generativo de texto a movimiento humano (text-to-motion) desarrollado por el autor independiente Yakimask (やきますく). Su particularidad es que se ha entrenado exclusivamente con la base de datos CMU Motion Capture, lo que permite publicar los pesos bajo licencia Apache 2.0 y utilizarlos en productos comerciales sin las restricciones habituales de los datasets académicos como HumanML3D. El modelo genera movimiento de cuerpo completo de forma continua e indefinida a partir de una caption corta en inglés, y permite cambiar la caption en mitad de la secuencia manteniendo la continuidad del movimiento.

La arquitectura se compone de dos piezas: un tokenizador VQ jerárquico causal de 7,5 M de parámetros que convierte cada 4 fotogramas (a 30 fps) en 7 tokens (1 global más 6 por parte del cuerpo), y un generador transformer decoder-only de 30,5 M de parámetros con 8 capas, anchura 512 y RoPE. El contexto es de 64 pasos (unos 8,5 s) y se desliza indefinidamente, lo que hace que la generación sea ilimitada. La representación del movimiento sigue el esquema de 272 dimensiones por fotograma de MotionStreamer.

El modelo es relevante por tres motivos: es completamente apto para uso comercial, funciona en tiempo real en una GPU de consumo (RTX 3060) y ofrece control interactivo mediante captions intercambiables. Su principal limitación es que solo conoce las acciones presentes en CMU, por lo que no generaliza a movimientos novedosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador VQ jerárquico causal + transformer decoder-only (8 capas, 512 de anchura, 8 cabezas, RoPE) |
| Parametros totales | 38 M (7,5 M tokenizador + 30,5 M generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 pasos de 4 fotogramas (8,5 s), ventana deslizante infinita |
| Tipos de cuantizacion | no disponible (pesos en bf16 para inferencia) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo PyTorch, 0,2 GB) |

## Arquitectura y entrenamiento

El pipeline tiene dos etapas. Primero, un tokenizador VQ jerárquico causal convierte cada fotograma de movimiento (272 números a 30 fps: velocidad y orientación de la raíz, posiciones, velocidades y rotaciones 6D de 22 articulaciones en orden SMPL) en una secuencia discreta: cada 4 fotogramas producen 7 tokens, uno global con codebook de 4096 y seis por parte del cuerpo (torso, cabeza, brazo derecho, brazo izquierdo, pierna derecha, pierna izquierda) con codebooks de 128 cada uno. Encoder y decoder solo atienden al pasado, lo que habilita el streaming. La conversión de CMU ASF/AMC al formato de 272 dimensiones se hace con un conversor propio (`code/cmu_to272.py`).

El generador es un transformer decoder-only que predice los tokens del tokenizador condicionado por el embedding de texto de CLIP ViT-B/32, sumado en cada posición para permitir el cambio de caption en mitad de la secuencia. Se entrena con classifier-free guidance (escala 4 en inferencia, texto nulo en el 10 % de las muestras). Los datos son 2308 clips (9,9 h) de CMU Motion Capture con las descripciones originales como captions; se descartaron 179 clips y se aplicó espejado izquierda-derecha, duplicando el volumen efectivo. El split es 90/5/5 por clip original (2078/115/115), manteniendo las copias espejadas en el mismo split. Todo el entrenamiento se hizo en una única RTX 3060: 2 h para el tokenizador y 75 min para el generador (mejor pérdida de validación en el paso 9500), unas 3 h 50 min en total.

## Capacidades

- Generación de movimiento humano de cuerpo completo a partir de captions cortas en inglés, de forma continua e ilimitada.
- Cambio de caption en mitad de la secuencia con efecto en el siguiente paso (4 fotogramas, 0,13 s) y transición suave gracias al contexto acumulado.
- Control de la intensidad del condicionamiento mediante classifier-free guidance (parámetro "text strength" en la demo).
- Salida estructurada a 30 fps: posiciones mundiales (T, 22, 3) en metros, rotaciones (T, 22, 3, 3), trayectoria de la pelvis (T, 2) y caption por fotograma.
- Generación determinista por semilla, reproducible.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües.

## Casos de uso

- Previsualización de animaciones en pipelines de videojuegos: el modelo genera movimiento continuo en tiempo real (35-38 ms por paso en RTX 3060) que puede servir como bloque de animación provisional antes de la captura definitiva.
- Prototipado de personajes en motores 3D: la salida en orden de articulaciones SMPL con posiciones y rotaciones mundiales se puede volcar directamente a un esqueleto compatible sin retargeting complejo.
- Instalaciones interactivas y arte generativo: la demo en vivo permite que un usuario escriba captions y vea el cambio en menos de un segundo, lo que encaja en exhibits donde el público controla el movimiento.
- Generación de datasets sintéticos de movimiento para entrenar otros modelos: al ser Apache 2.0 y generar secuencias etiquetadas por caption, se pueden producir grandes volúmenes de pares texto-movimiento sin restricciones de licencia.
- Herramientas de accesibilidad o previsualización de lenguaje de señas estilizado: para acciones presentes en CMU (saludar, caminar, sentarse) se puede generar movimiento a partir de una descripción textual.
- Pruebas de estrés de sistemas de captura y seguimiento: las secuencias generadas con trayectorias conocidas (`root_xz`) permiten validar algoritmos de reconstrucción de pose con ground truth sintético.
- Demos educativas de text-to-motion: el coste computacional mínimo (38 M de parámetros, 0,2 GB) permite desplegarlo en portátiles con GPU de gama media para docencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar de text-to-motion (FID, R-Precision, etc.) en la información disponible. El autor indica explícitamente que no existe un benchmark estándar para modelos entrenados solo con CMU y que sus números no son comparables con los de modelos entrenados en HumanML3D. Los datos disponibles son métricas internas de reconstrucción y pérdida:

| Metrica | Valor |
|---|---|
| Error de posición del tokenizador (todas las partes) | 57,4 mm |
| Error de rotación global del tokenizador | 9,9° |
| Error de posición del torso | 33,2 mm |
| Error de posición de la cabeza | 56,1 mm |
| Error de posición de brazos | 67,4 / 68,4 mm |
| Error de posición de piernas | 55,4 / 56,4 mm |
| Pérdida de validación del generador (media por token) | 2,311 |
| Pérdida global / torso / cabeza | 2,654 / 2,459 / 2,428 |
| Pérdida brazos / piernas | 2,208 / 2,114 (brazo der./izq.), 2,196 / 2,114 (pierna der./izq.) |
| Latencia por paso (4 fotogramas) en RTX 3060 | 35-38 ms (margen de 3,5× sobre los 133 ms de tiempo real) |
| Diferencia máxima de logits entre CUDA-graph y forward plano | 0,06 (redondeo bf16, logits hasta ~12) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 38 M de parámetros en bf16 el peso es inferior a 100 MB, por lo que cabe holgadamente en cualquier GPU con más de 2 GB.
- GPU recomendadas: RTX 3060 (12 GB) es la referencia del autor y alcanza tiempo real con 3,5× de margen. Cualquier GPU NVIDIA con CUDA y más de 4 GB debería funcionar; no se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, el autor lo ejecuta en una RTX 3060 de 12 GB y el entrenamiento completo se hizo en esa misma tarjeta.
- Despliegue: servidor propio incluido (`live/live_server.py`, puerto 8765) con interfaz web en japonés, y script de generación a fichero (`generate.py`). Requiere CUDA; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 35-38 ms por paso de 4 fotogramas en RTX 3060, equivalente a unos 105-115 fotogramas por segundo generados frente a los 30 fps de reproducción. El servidor genera solo 0,8 s por delante de la reproducción, por lo que una nueva caption aparece unos 0,6 s después de pulsar el botón.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Entrenamiento | Disponibilidad |
|---|---|---|---|---|---|
| PartLock-CMU | 38 M | 64 pasos (8,5 s) deslizante | Apache 2.0 | Solo CMU (9,9 h) | Pesos públicos en HF |
| MotionStreamer | no disponible | no disponible | no disponible | HumanML3D (no comercial) | Código en GitHub |
| Modelos text-to-motion sobre HumanML3D (familia general) | variable | variable | habitualmente no comercial | HumanML3D | Pesos públicos con restricciones |

La comparación directa con modelos entrenados en HumanML3D no es posible en términos de benchmarks porque el autor no publica métricas estándar y el dominio de entrenamiento es distinto. La ventaja diferencial de PartLock-CMU es la licencia Apache 2.0 combinada con generación en streaming en tiempo real, algo que los modelos basados en HumanML3D no ofrecen por las restricciones del dataset.

## Limitaciones y advertencias

- Solo conoce movimientos presentes en CMU: en las pruebas del autor, las 20 acciones novedosas que probaron salieron casi estáticas.
- Mezclar dos acciones en una misma caption (por ejemplo, "wave while walking") suele perder la mayor parte del movimiento.
- El cambio de caption funciona mejor secuenciando acciones que combinándolas en una sola frase.
- El vocabulario de captions está limitado a las descripciones de CMU (`data/cmu_files.csv`, columna `desc`); captions fuera de ese estilo no funcionan bien.
- El tokenizador introduce errores de reconstrucción notables (57,4 mm de media en posición, hasta 68,4 mm en brazos), lo que limita el realismo fino del movimiento.
- Solo inglés; el tokenizador CLIP pasa el texto a minúsculas, por lo que las mayúsculas son irrelevantes.
- Riesgo de alucinación en el sentido de generar movimiento plausible pero no solicitado cuando la caption está fuera de distribución.
- Requiere GPU NVIDIA con CUDA para la demo en vivo; no se documenta ejecución en CPU.
- La interfaz de la demo está en japonés, lo que puede dificultar su uso a usuarios no familiarizados.
- Aunque la licencia es Apache 2.0, el autor no documenta garantías ni soporte; es un proyecto individual con 0 descargas y 0 likes en el momento de la ficha.
- No se han publicado evaluaciones de sesgo; al entrenarse solo con CMU, el movimiento refleja los patrones de los actores de ese dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yakimask/PartLock-CMU
- Repositorio de referencia de la representación 272-dim (MotionStreamer): https://github.com/zju3dv/MotionStreamer
- CMU Motion Capture Database: no disponible en la información proporcionada (el autor la cita pero no enlaza URL)
- Demo en vivo: incluida en el repo del modelo (`live/live_server.py`, http://localhost:8765 tras arrancar)
- Paper: no disponible
- Blog del autor: no disponible
