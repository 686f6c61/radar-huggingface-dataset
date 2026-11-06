# YixuanHu/text_lidar_waymo

## Resumen

`YixuanHu/text_lidar_waymo` no es un modelo de lenguaje, sino un paquete de investigación para generación de nubes de puntos LiDAR condicionada por texto sobre el dataset Waymo. Contiene los pesos de un generador denominado TextHDiT de doble flujo (geometría y semántica) con 256 canales por flujo, entrenado en fase 1 (10 000 pasos) sobre 29 667 fotogramas de Waymo, junto con el código de entrenamiento, muestreo, evaluación y el recetario de ajuste fino con Flow-GRPO.

El modelo resuelve el problema de síntesis de escaneos LiDAR realistas a partir de una descripción textual, una tarea relevante para aumentación de datos en conducción autónoma, simulación y evaluación de perceptores. La arquitectura combina flow matching para el flujo geométrico (profundidad en escala logarítmica y reflectancia) con una cabeza de clasificación de 23 clases para el flujo semántico, con intercambio bidireccional de características entre ambos.

Es relevante ahora porque publica no solo el checkpoint sino todo el pipeline de RL (Flow-GRPO) con un modelo de recompensa basado en Qwen3-VL-8B, lo que permite reproducir el ajuste fino alineado con preferencias humanas sobre datos LiDAR. El repositorio ocupa 6,3 GB e incluye metadatos de 4,57 millones de pares de afirmaciones verdadero/falso para las 29 667 escenas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TextHDiT de doble flujo (geometría + semántica), flow matching, 256 canales por flujo |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por captions de texto, sin ventana de contexto LLM) |
| Tipos de cuantización | no disponible (pesos en fp32; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (captions de Waymo, presumiblemente inglés; no declarado) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch, dict con `weights`, `arch`, `num_classes`, `model_version`, `step`) |

## Arquitectura y entrenamiento

El generador es un TextHDiT de doble flujo con 256 canales en cada rama. El flujo geométrico modela imágenes de rango (64 haces x 2 650 columnas, rellenadas a 2 656) con profundidad en escala logarítmica y reflectancia mediante flow matching. El flujo semántico produce etiquetas sobre 23 clases fijas de Waymo y se comunica con el geométrico mediante módulos G->S y S->G. Los ángulos de rayo se derivan de `beam_inclinations.npy`.

La fase 1 que corresponde a este checkpoint es un calentamiento semántico: el flujo geométrico se inicializa desde el backbone Waymo de 256 canales (`waymo_bb256/checkpoint-97500`, EMA) y se congela con S->G desactivado; el flujo semántico se inicializa con los mismos pesos y se entrenan los módulos G->S y la cabeza de etiquetas. Se ejecutaron 10 000 pasos con 128 imágenes por paso (2 GPU x 8 x acumulación de gradiente 8), learning rate 1e-4 con decaimiento coseno, warm-up de 1 000 pasos, fp32 con TF32, aumento por espejo, peso NLL de etiquetas 3 (solo píxeles válidos) y peso de pérdida de objeto 1. El entrenamiento consumió 27,8 horas en 2 H100.

El condicionamiento textual emplea los codificadores de texto de SD3.5 (CLIP-L, CLIP-G y T5-XXL en bf16, descargados de `stabilityai/stable-diffusion-3.5-medium`). El muestreo se realiza con 256 pasos de Euler en fp32, etiquetas de la cabeza EMA y sin classifier-free guidance, ya que el modelo se entrenó con dropout de texto 0. El ajuste fino posterior con Flow-GRPO aplica LoRA r=32 y alpha=64 únicamente sobre el flujo geométrico, dejando el semántico congelado, con 384 escaneos por iteración (8 captions x grupo 48), 32 pasos SDE, nivel de ruido 0,7 y ventana SDE 4 muestreada en [0, 8].

## Capacidades

- Generación de nubes de puntos LiDAR de 256 canales condicionada por texto, con profundidad y reflectancia realistas.
- Segmentación semántica simultánea sobre 23 clases fijas de Waymo mediante el flujo semántico.
- Intercambio bidireccional de características entre geometría y semántica (G->S y S->G) para coherencia entre forma y etiqueta.
- Muestreo determinista por flow matching con 256 pasos de Euler.
- Evaluación integrada de acierto posicional caption-vs-escaneo (`eval_val_waymo.py`).
- Ajuste fino con RL (Flow-GRPO) usando un modelo de recompensa VLM (Qwen3-VL-8B + LoRA) y pares de afirmaciones verdadero/falso.
- No soporta tool calling, function calling, agentes, visión ni audio: no es un modelo de lenguaje.

## Casos de uso

- Aumentación de datos para percepción 3D: generar escaneos LiDAR sintéticos a partir de captions para ampliar el conjunto de entrenamiento de detectores y segmentadores en condiciones poco representadas.
- Simulación de conducción autónoma: producir escenas LiDAR controladas por texto para probar la robustez de pipelines de percepción antes de despliegue en vehículo.
- Evaluación de modelos de captioning LiDAR: usar el generador como referencia para medir si un captioning inverso recupera la descripción original.
- Investigación en generación condicionada por texto: el paquete incluye código de entrenamiento, muestreo y evaluación reproducible sobre Waymo, útil para estudiar flow matching en datos 3D.
- Estudio de alineación con RL: el recetario Flow-GRPO con recompensa VLM permite investigar cómo el ajuste fino con preferencias afecta a la fidelidad geométrica y semántica.
- Benchmarking de modelos de recompensa multimodal: los 4,57 millones de pares de afirmaciones permiten entrenar y evaluar adaptadores LoRA sobre Qwen3-VL-8B para puntuar escaneos.
- Prototipado de aumentación en pipelines de CI para modelos de percepción: generar variantes controladas y verificar que las métricas de detección se mantienen estables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor menciona un diagnóstico interno de acierto posicional caption-vs-escaneo (`eval_val_waymo.py`) y un prior de confusión de la cabeza de etiquetas (`waymo_p1_confusion_val300.json`), pero no se proporcionan cifras numéricas en la información disponible.

## Requisitos de hardware

- Entrenamiento de la fase 1: 2 GPU H100 de 80 GB, 27,8 horas, fp32 con TF32.
- Entorno declarado: Python 3.10, torch 2.5.1 (cu121), accelerate 1.14, einops, ema_pytorch, torchdiffeq, matplotlib, pyyaml, numpy 1.26, scipy, pillow; diffusers y transformers 5.14 para los codificadores de texto; transformers 5.14 y peft 0.20 para el modelo de recompensa.
- Inferencia: el autor indica una o dos H100 de 80 GB como entorno de referencia; no se publica VRAM exacta ni estimaciones para cuantizaciones.
- No se documenta compatibilidad con GPU de consumo (RTX 4090, etc.); el tamaño del checkpoint y los codificadores SD3.5 (CLIP-L, CLIP-G, T5-XXL) sugieren requisitos elevados, pero no hay cifras confirmadas.
- Despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; el muestreo se realiza con `tools/sample_val_waymo.py` sobre PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros generadores text-to-LiDAR ni con modelos de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no se puede confirmar el uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- El checkpoint corresponde solo a la fase 1 (calentamiento semántico); el autor indica que la fase 2 (descongelación) y el adaptador de recompensa para Waymo están pendientes de subida.
- El adaptador de recompensa de Waymo aún se estaba entrenando (job 494324) y se añadirá como `reward_adapter/w_aug/final`; el recetario GRPO publicado es el de nuScenes y requiere adaptaciones para Waymo (sección 6 de la model card).
- No se incluyen los tensores de rango ni los captions de Waymo (34 GB), necesarios para reproducir el entrenamiento y el muestreo.
- El modelo está especializado en Waymo con 23 clases fijas; no es transferible a otros sensores o datasets sin reentrenamiento.
- Riesgo de alucinación geométrica: al ser un generador, puede producir escaneos plausibles pero inconsistentes con el caption; el propio autor usa un modelo de recompensa VLM para mitigarlo.
- No se declaran sesgos demográficos ni geográficos, pero el dataset Waymo está sesgado hacia ciertas ciudades y condiciones meteorológicas de EE. UU.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-03; no hay evidencia de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/YixuanHu/text_lidar_waymo
- Codificadores de texto SD3.5: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Modelo base del reward: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
