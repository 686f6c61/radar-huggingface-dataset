# xzxxntxdy/History-Forcing

## Resumen

History Forcing es un framework de destilación on-policy para generadores de vídeo autorregresivos de pocos pasos, orientado a modelos del mundo (world models) de horizonte largo. Lo desarrolla un equipo conjunto de Zhejiang University, Microsoft Research, Monash University y Adelaide University, y se publica como el repositorio `xzxxntxdy/History-Forcing` en Hugging Face, con paper en arXiv (2611.02782) y código en GitHub. El problema que aborda es la pérdida de consistencia en vídeos largos: los generadores autorregresivos tienden a degradar la coherencia temporal y la evolución de escenas fuera de campo cuando el horizonte crece.

La innovación central es el uso del residuo entre las predicciones del teacher con y sin historia informativa para corregir el objetivo de score o velocidad usado en la destilación. Esto permite entrenar generadores de pocos pasos que mantienen dependencia del historial y mejoran la consistencia en vídeos largos. El repositorio incluye tres checkpoints: uno sobre DreamX-World-5B (5B parámetros), y dos sobre Wan2.1-T2V-1.3B (raw/EMA y un teacher autorregresivo de 10 segundos).

Es relevante ahora porque combina dos líneas activas: la destilación de modelos de difusión para inferencia en pocos pasos y los world models de vídeo con horizonte largo, un área con creciente interés en simulación, robótica y generación de contenido. El tamaño del repositorio es de 27,6 GB y la información pública disponible es todavía escasa (0 descargas, 1 like en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Generador de vídeo autorregresivo de difusión (basado en DreamX-World-5B y Wan2.1-T2V-1.3B); framework de destilación on-policy |
| Parámetros totales | 5B (checkpoint sobre DreamX-World-5B); 1.3B (checkpoints sobre Wan2.1-T2V-1.3B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el teacher autorregresivo trabaja con ventanas de 10 segundos de vídeo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.pt` (PyTorch) en los checkpoints `opsd/`, `dmd/` y `ar_teacher/` |

## Arquitectura y entrenamiento

El modelo se apoya en generadores de vídeo de difusión existentes: DreamX-World-5B como base del checkpoint principal (`opsd/model.pt`) y Wan2.1-T2V-1.3B como base de los checkpoints `dmd/model.pt` (raw y EMA) y `ar_teacher/model.pt`. La arquitectura subyacente es un transformer de difusión para generación de vídeo, adaptado a un régimen autorregresivo de pocos pasos mediante destilación. El checkpoint DMD liberado se entrenó con un teacher bidireccional de 1.3B y un teacher autorregresivo de 10 segundos.

La contribución técnica es el mecanismo de History Forcing: en lugar de destilar directamente las predicciones del teacher, se calcula el residuo entre las predicciones del teacher con historia informativa y sin ella, y ese residuo se usa para corregir el objetivo de score o velocidad. El resultado es un modelo student de pocos pasos que conserva la dependencia del historial y mejora la consistencia de vídeos largos y la evolución de escenas fuera de campo. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset (más allá de `xzxxntxdy/History-Forcing-Data`) ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con checkpoints derivados de Wan2.1-T2V-1.3B y DreamX-World-5B.
- Generación autorregresiva de vídeo de horizonte largo con dependencia del historial.
- Destilación en pocos pasos (few-step), orientada a reducir el coste de inferencia frente a muestreo de difusión completo.
- Modelado de mundo (world model): evolución de escenas y consistencia de continuaciones fuera de campo.
- Checkpoint teacher autorregresivo de 10 segundos incluido (`ar_teacher/model.pt`).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o visión más allá de la generación de vídeo.
- Capacidad multilingüe limitada al inglés según la metadata (`language: en`).

## Casos de uso

- Generación de vídeo de horizonte largo para contenido audiovisual: el modelo produce continuaciones autorregresivas con mejor consistencia temporal gracias al mecanismo de History Forcing, adecuado para clips de duración extendida.
- Simulación de entornos para robótica y agentes: como world model, permite predecir la evolución de una escena a partir de un historial, lo que sirve para planificación y evaluación de políticas en entornos simulados.
- Investigación en destilación de modelos de difusión: el repositorio incluye checkpoints teacher y student, lo que facilita reproducir y extender el framework de destilación on-policy.
- Prototipado de pipelines text-to-video en pocos pasos: los checkpoints DMD sobre Wan2.1-T2V-1.3B permiten experimentar con inferencia acelerada en hardware más modesto.
- Evaluación de consistencia temporal: el checkpoint de 5B sobre DreamX-World-5B sirve como referencia para medir degradación de coherencia en vídeos largos frente a generadores bidireccionales.
- Docencia y divulgación técnica: el código y los checkpoints permiten ilustrar el funcionamiento de la destilación con corrección por historia en un caso real de generación de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Como referencia orientativa, un checkpoint de 5B en precisión completa requiere del orden de decenas de GB de VRAM; el checkpoint de 1.3B es considerablemente más ligero, pero no se documentan cifras oficiales.
- GPU recomendadas: no disponible. Por tamaño, el checkpoint de 5B encaja en A100/H100 de 80 GB; el de 1.3B podría ejecutarse en GPUs de gama alta para consumidor, pero no se confirma en la información disponible.
- ¿Cabe en GPU de consumidor? No confirmado; el checkpoint de 1.3B es el candidato más plausible, pero no hay datos oficiales.
- Opciones de despliegue: la inferencia y el entrenamiento están disponibles en el repositorio de código (https://github.com/ziplab/History-Forcing); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| History Forcing (este) | 5B / 1.3B según checkpoint | no disponible (ventana de 10 s en teacher AR) | World model de vídeo, destilación few-step | no disponible | Hugging Face, código en GitHub |
| DreamX-World-5B (base) | 5B | no disponible | World model de vídeo | no disponible | Hugging Face |
| Wan2.1-T2V-1.3B (base) | 1.3B | no disponible | Text-to-video | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide confirmar si el uso comercial está permitido; es un bloqueo potencial para producción.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere ausencia de validación comunitaria y escasa evidencia empírica independiente.
- No se han publicado benchmarks en la información disponible; el rendimiento real frente a alternativas no está cuantificado.
- El modelo está etiquetado únicamente para inglés (`language: en`), con soporte multilingüe no confirmado.
- Al ser un modelo generativo de vídeo, existe riesgo de alucinación visual y de artefactos en escenas complejas o fuera de distribución.
- No se documentan sesgos conocidos, pero los modelos de difusión de vídeo heredan sesgos de sus datasets de entrenamiento, no descritos aquí.
- El tamaño del repositorio (27,6 GB) y el formato `model.pt` implican requisitos de almacenamiento y gestión de pesos considerables.
- La información sobre cuantización, contexto y requisitos de hardware es insuficiente para planificar un despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/xzxxntxdy/History-Forcing
- Paper (arXiv): https://arxiv.org/abs/2611.02782
- Página del proyecto: https://ziplab.co/History-Forcing-Project-Page/
- Código: https://github.com/ziplab/History-Forcing
- Dataset: https://huggingface.co/datasets/xzxxntxdy/History-Forcing-Data
- Modelo base DreamX-World-5B: https://huggingface.co/GD-ML/DreamX-World-5B
- Modelo base Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
