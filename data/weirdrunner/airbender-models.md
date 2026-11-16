# WeirdRunner/AirBender-models

## Resumen

AirBender-models es un repositorio de pesos y modelos auxiliares para AirBender, un sistema de seguimiento de manos (hand-tracking) orientado a la síntesis de sonido. Lo publica el usuario WeirdRunner bajo licencia Apache 2.0. No se trata de un modelo de lenguaje: el repositorio agrupa detectores de manos y de puntos de referencia (landmarks) en formato Core ML, junto con modelos de síntesis aditiva, pensados para ejecutarse en el ecosistema de Apple (Core ML y Neural Engine).

El contenido se organiza en cuatro directorios: `coreml/fp16/` con los paquetes base `.mlpackage` del detector de manos y del detector de landmarks; `coreml/int8/` con los mismos pesos cuantizados a INT8 por canal para el Apple Neural Engine; `checkpoints/` con checkpoints afinados para landmarks en perspectiva de mesa; y `sine_models/` con modelos de síntesis aditiva de parciales y ruido en formato `.sine`.

La relevancia del repositorio es acotada y muy específica: sirve como artefacto de despliegue para una aplicación de interacción gestual y síntesis de audio en dispositivos Apple, no como modelo generativo de propósito general. El tamaño del repositorio es de 0.0 GB según los metadatos de Hugging Face, sin descargas ni likes registrados, y no se declara pipeline ni idiomas soportados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (detectores de manos y landmarks en Core ML; modelos de síntesis aditiva `.sine`) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | FP16 (paquetes base) e INT8 por canal para Apple Neural Engine |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlpackage` (Core ML) y `.sine` (modelos de síntesis) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de los detectores. Por los nombres de los directorios y las etiquetas (`mediapipe`, `hand-tracking`, `coreml`) se deduce que la base parte de detectores de manos y landmarks compatibles con el ecosistema MediaPipe, convertidos o empaquetados para Core ML. El repositorio ofrece dos variantes de precisión: FP16 como paquete base y INT8 con cuantización por canal, generada mediante el script `compress_models.py`, orientada a ejecución en el Apple Neural Engine.

El apartado de entrenamiento propio se limita a los checkpoints de `checkpoints/`, descritos como landmarks afinados para perspectiva de mesa y producidos con el script `train_table_landmarks.py`. Los modelos de `sine_models/` corresponden a síntesis aditiva de parciales y ruido, acompañados de un archivo `CREDITS.md`. No se especifican volúmenes de datos, composición del dataset, número de tokens ni uso de RLHF o DPO, y tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Detección de manos en imagen o vídeo mediante el paquete Core ML base.
- Detección de landmarks de la mano (puntos de referencia) con el detector correspondiente.
- Seguimiento en perspectiva de mesa gracias a los checkpoints afinados incluidos.
- Ejecución acelerada en Apple Neural Engine con los pesos INT8 por canal.
- Síntesis aditiva de audio a partir de modelos de parciales y ruido (`.sine`).
- Integración con flujos de captura gestual para control de parámetros de síntesis.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling ni capacidades multilingües.

## Casos de uso

- Instrumentos musicales gestuales: el detector de landmarks alimenta parámetros de los modelos `.sine` para modular parciales y ruido en tiempo real, con la ventaja de ejecutarse en el Neural Engine de dispositivos Apple.
- Instalaciones interactivas: el seguimiento de manos sobre una superficie de mesa, apoyado por los checkpoints de perspectiva de mesa, permite mapear gestos a eventos de audio en exposiciones o performances.
- Prototipado de interfaces sin contacto: los paquetes Core ML FP16 sirven para validar interacción gestual en macOS o iOS antes de optimizar con la variante INT8.
- Aplicaciones de accesibilidad: control de parámetros de sonido mediante gestos de la mano para usuarios que no pueden usar controles físicos.
- Educación musical: demostraciones de síntesis aditiva donde el gesto controla la mezcla de parciales, con despliegue local sin conexión.
- Investigación en interacción gesto-audio: uso de los checkpoints afinados como línea base reproducible para comparar latencia y precisión en distintas configuraciones de cámara y mesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Ejecución prevista en hardware Apple con soporte de Core ML; la variante INT8 está pensada para el Apple Neural Engine.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible; el destino declarado es el Neural Engine de Apple, no GPU NVIDIA.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el formato `.mlpackage` no es ejecutable directamente en CUDA.
- Opciones de despliegue: Core ML en macOS e iOS; los scripts `compress_models.py` y `train_table_landmarks.py` acompañan al repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirBender-models (WeirdRunner) | Hand-tracking y síntesis aditiva | Core ML `.mlpackage`, `.sine` | FP16 e INT8 por canal | Apache 2.0 | Hugging Face |
| MediaPipe Hands (Google) | Hand-tracking y landmarks | TFLite y otros | No disponible en la información | Apache 2.0 | Distribución propia de Google |
| Alternativas Core ML de terceros | Hand-tracking convertido a Core ML | `.mlpackage` | Variable | Variable | Repositorios de la comunidad |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts de texto ni genera respuestas; cualquier evaluación como LLM carece de sentido.
- Los detectores de manos y landmarks heredan los sesgos y fallos de su base, presumiblemente MediaPipe; no se documentan evaluaciones de sesgo.
- Riesgo de fallo en condiciones de oclusión, iluminación adversa o manos fuera de encuadre; no se cuantifica en la información disponible.
- Los checkpoints de perspectiva de mesa están afinados para un dominio concreto y pueden degradarse fuera de él.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan las licencias de los modelos base ni de los créditos de `sine_models/CREDITS.md`, que conviene revisar antes de producción.
- El repositorio figura con 0.0 GB y sin descargas ni likes; su madurez y mantenimiento no están contrastados.
- La fecha de creación indicada (2026-11-16) es posterior a la actual y debe tratarse con cautela.
- Dependencia del ecosistema Apple: no hay ruta de despliegue documentada para Linux, Windows o GPU NVIDIA.

## Enlaces

- Hugging Face: https://huggingface.co/WeirdRunner/AirBender-models
- Script de cuantización citado en la model card: `compress_models.py` (incluido en el repositorio)
- Script de entrenamiento citado en la model card: `train_table_landmarks.py` (incluido en el repositorio)
- Créditos de los modelos de síntesis: `sine_models/CREDITS.md` (incluido en el repositorio)
- MediaPipe (referencia por etiqueta): https://mediapipe.dev
- Core ML (referencia por formato): https://developer.apple.com/documentation/coreml
