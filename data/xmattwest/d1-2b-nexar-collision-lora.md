# xmattwest/d1-2B-nexar-collision-lora

## Resumen

`xmattwest/d1-2B-nexar-collision-lora` es un adaptador LoRA sobre el modelo base `LiquidAI/d1-2B` (familia LFM3 de Liquid AI) especializado en anticipación de colisiones a partir de vídeo de dashcam. El autor, xmattwest, lo entrena sobre el dataset Nexar Collision Prediction para la tarea de `video-classification`, con el objetivo de predecir si un accidente o casi-accidente ocurrirá en los próximos segundos. El modelo base es un transformer híbrido (convolución con compuerta, atención deslizante y atención global) de aproximadamente 2.000 millones de parámetros, y el adaptador añade 4.117.184 parámetros entrenables distribuidos en las 24 capas del modelo.

El problema que aborda es concreto: los modelos visión-lenguaje de propósito general reconocen coches e intersecciones pero fallan al estimar la inminencia de una colisión. Según la model card, el `d1-2B` en zero-shot alcanza 0.490 de AUROC por episodio y detecta solo el 2% de los accidentes con umbral `p >= 0.50`. El LoRA de 24 capas eleva la AUROC de ventana a 0.772 (+0.152) y duplica el AP de ventana de 14,0% a 33,4%, con un mAP de truncación Nexar oficial de 0.794.

Es relevante ahora porque demuestra que un ajuste fino ligero (12,5 minutos en una RTX 4090, 0,19 USD de cómputo) puede convertir un VLM genérico en un anticipador de colisiones razonable, y porque documenta con honestidad su frontera de despliegue: a 70% de recall genera 26,4 falsas alarmas por trayecto de 20 minutos, lo que evidencia la brecha entre parches 2D a 2,0 fps y codificadores de vídeo 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (convolución con compuerta, atención deslizante y atención global) sobre `LiquidAI/d1-2B` |
| Parametros totales | Aproximadamente 2.000 millones (modelo base); adaptador LoRA de 4.117.184 parámetros entrenables |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | `bfloat16` (CUDA); `4-bit` vía MLX en Apple Silicon |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | Safetensors (adaptadores LoRA); scripts de inferencia en Python |

## Arquitectura y entrenamiento

El modelo base `LiquidAI/d1-2B` emplea una arquitectura tri-híbrida (etiqueta `tri-hybrid-architecture` en la model card) que combina capas de convolución con compuerta, atención deslizante y atención global a lo largo de 24 capas. El adaptador LoRA se aplica sobre las 153 proyecciones de las 24 capas (`L0..L23`), con rango 4, sumando 4.117.184 parámetros entrenables. Una nota técnica importante: es necesario fijar `model.fuse_projections = lambda: None` tras cargar el modelo para que las proyecciones `q/k/v` y `w1/w3` permanezcan sin fusionar y permitan adjuntar el LoRA.

El entrenamiento se realizó en dos regímenes de hardware. Una prueba de concepto en `4-bit` sobre Apple M4 con 96 clips (adaptadores de 6 y 2 capas), y un entrenamiento completo en `bfloat16` sobre 420 clips en una RTX 4090 durante 12,5 minutos (0,19 USD de cómputo). El dataset es `nexar-ai/nexar_collision_prediction`, con ventanas causales a 2,0 fps. Además, se entrenó un adaptador "Time-Machine" de hindsight temporal sin etiquetas humanas (0 labels) que alcanza 0.727 de AUROC y 28,8% de AP de ventana usando únicamente desenlaces a `t + 3,5 s`. El modelo consume 4 fotogramas por ventana para puntuar el riesgo.

## Capacidades

- Anticipación de colisiones en vídeo de dashcam: puntuación de riesgo por ventana causal a 2,0 fps.
- Predicción de truncación temporal a 500, 1000 y 1500 ms (mAP oficial Nexar).
- Localización de objetivos (`box` target lock): al desactivar el LoRA (`lora_enabled = False`) en 0,0 ms, el modelo base extrae cajas delimitadoras del vehículo amenazante hasta 3,6 s antes del impacto.
- Clasificación de vídeo (`pipeline_tag: video-classification`).
- Inferencia sin tokens de etiqueta (`zero-token-inference`): puntuación directa de riesgo sin generación de texto.
- Aprendizaje con hindsight temporal (adaptador Time-Machine) a partir de desenlaces futuros sin etiquetas humanas.
- Capacidades multilingües: limitadas al inglés según la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión general, audio: no disponible más allá del uso específico de dashcam.

## Casos de uso

- Sistemas ADAS de aviso temprano: el modelo puntúa ventanas de 4 fotogramas y puede integrarse en un pipeline de dashcam para emitir alertas cuando la probabilidad de colisión supera un umbral, con un adelanto medio de 2,75 s a `p >= 0.50` (aunque con alta tasa de falsos positivos).
- Análisis forense de siniestros: dado un clip de accidente, el modelo identifica las ventanas temporales previas al impacto y las cajas del vehículo amenazante, útil para reconstrucción de siniestros y peritaje.
- Etiquetado y priorización de datos de flotas: procesar grandes volúmenes de vídeo no etiquetado para seleccionar los clips con mayor riesgo y enviarlos a revisión humana, usando el adaptador Time-Machine como filtro barato (28,8% de AP de ventana sin etiquetas).
- Investigación en seguridad vial: banco de pruebas reproducible para estudiar la brecha entre parches 2D a 2,0 fps y codificadores 3D, con métricas AUROC, AP y mAP de truncación.
- Prototipado en hardware de consumo: con el adaptador `mlx_4bit_6layer` (1.032.384 parámetros) cabe en 16 GB de memoria unificada en Apple Silicon y permite experimentar en portátil con 0.804 de AUROC en el slice de 96 clips.
- Evaluación comparativa de VLM para vídeo: el modelo sirve como baseline ajustado frente a codificadores 3D especializados (BADAS-Open 0.86 AP, Kaggle #1 0.898 mAP) en estudios de anticipación de colisiones.
- Formación y simulación: replay con HUD de objetivos bloqueados (`examples/`) para entrenar a conductores o validar sistemas de percepción en escenarios concretos (`#00288`, `#00264`, `#01224`).

## Benchmarks y rendimiento

Resultados sobre 100 trayectos de test no vistos del benchmark Nexar Collision Prediction:

| Regimen / punto de operacion | Parametros entrenables | Window AUROC | Window AP | Nexar Clip mAP | Crash recall | Episode FAR | Lead detectado |
|---|---|---|---|---|---|---|---|
| Zero-shot base `d1-2B` (`p >= 0.50`) | 0 | 0.620 | 14,0% | 0.557 | 2% | 6% | n = 1 (0,09 s) |
| Zero-label Time-Machine (Ep 120) | 4.117.184 | 0.727 | 28,8% | n/a | 22% | 14% | 1,51 s |
| Zero-label Time-Machine (Ep 260 final) | 4.117.184 | 0.681 | 19,2% | n/a | 36% | 34% | 1,73 s |
| 24-layer LoRA (conformal 4% test FAR) | 4.117.184 | 0.772 | 33,4% | 0.794 | 10% (18% oracle) | 4% | 0,35 s |
| 24-layer LoRA (Val <= 5% FAR) | 4.117.184 | 0.772 | 33,4% | 0.794 | 26% [14%, 38%] | 10% | 1,65 s |
| 24-layer LoRA (Val <= 10% FAR) | 4.117.184 | 0.772 | 33,4% | 0.794 | 34% | 14% | 2,06 s |
| 24-layer LoRA (balanced `p >= 0.50`) | 4.117.184 | 0.772 | 33,4% | 0.794 | 70% [58%, 82%] | 44% | 2,75 s (1,93 s all) |

Resultados del adaptador `mlx_4bit_6layer` en el slice de 96 clips (Stage 1): 0.804 de AUROC y 51,5% de AP de ventana, frente a 0.764 de AUROC y 41,5% de AP del adaptador de 2 capas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el entrenamiento completo en `bfloat16` se ejecutó en una única RTX 4090 (24 GB), lo que sugiere que la inferencia en `bfloat16` cabe en ese rango.
- GPU recomendadas: RTX 4090 para entrenamiento e inferencia en `bfloat16`; Apple Silicon con 16 GB de memoria unificada para el adaptador `mlx_4bit_6layer`.
- Cabe en GPU de consumo: sí, al menos en RTX 4090 (24 GB) y en Apple Silicon de 16 GB con cuantización 4-bit.
- Opciones de despliegue: `transformers` + `safetensors` (script `inference_cuda.py`), MLX en Apple Silicon. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el entrenamiento de 420 clips requirió 12,5 minutos en una RTX 4090 (0,19 USD de cómputo). El cambio `lora_enabled = False` tarda 0,0 ms. No se publican cifras de latencia de inferencia por ventana.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AP/mAP) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `xmattwest/d1-2B-nexar-collision-lora` | ~2B + 4,1M LoRA | No disponible | 0.772 AUROC, 33,4% AP ventana, 0.794 mAP truncación | MIT | Hugging Face |
| BADAS-Open | No disponible | No disponible | 0.86 AP | No disponible | No disponible |
| Kaggle #1 (Nexar Collision Prediction) | No disponible | No disponible | 0.898 mAP | No disponible | No disponible |

Los dos comparadores citados por el autor son soluciones específicas de anticipación de colisiones (un codificador de vídeo 3D y la mejor entrada del concurso Kaggle), no modelos de propósito general. No se dispone de datos de parámetros, contexto ni licencia de esos sistemas en la información proporcionada.

## Limitaciones y advertencias

- Tasa de falsos positivos muy alta en el punto de operación equilibrado: a 70% de recall se generan 26,4 falsas alarmas por trayecto de 20 minutos (44% de FAR por episodio), lo que lo hace inviable como alerta directa al conductor sin filtrado adicional.
- Rendimiento limitado por la representación: el autor atribuye la brecha frente a codificadores 3D (BADAS-Open 0.86 AP, Kaggle #1 0.898 mAP) al uso de parches 2D a 2,0 fps en lugar de vídeo 3D.
- Recall bajo en puntos de operación estrictos: 10% de recall con 4% de FAR y 0,35 s de adelanto; incluso en el mejor caso el adelanto medio es de 2,75 s.
- Idiomas: solo inglés (`en`) según la model card.
- Sesgos conocidos: no se documentan sesgos específicos de género, raza o geografía; el dataset Nexar procede de dashcams reales y puede reflejar condiciones de conducción urbanas y de autopista sesgadas hacia ciertos países.
- Riesgo de alucinación: el modelo opera como clasificador de riesgo por ventana y no genera texto libre, por lo que el riesgo de alucinación textual es bajo; sin embargo, las puntuaciones de riesgo pueden ser erróneas en escenarios no representados en el dataset (nieve, obras, motocicletas).
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base `LiquidAI/d1-2B` puede tener sus propias condiciones que el usuario debe verificar.
- Caveat de producción: el adaptador requiere mantener las proyecciones sin fusionar (`fuse_projections = lambda: None`), lo que complica la integración con pipelines estándar de `transformers`.
- El adaptador Time-Machine final (Ep 260) degrada el AP respecto al checkpoint intermedio (Ep 120): 19,2% frente a 28,8%, con un aumento de FAR de 14% a 34%.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/xmattwest/d1-2B-nexar-collision-lora
- Modelo base: https://huggingface.co/LiquidAI/d1-2B
- Dataset: https://huggingface.co/datasets/nexar-ai/nexar_collision_prediction
- Publicación: https://shelltoho.me/pubs/three-seconds-before-impact/
- PDF del paper: https://shelltoho.me/pubs/three-seconds-before-impact/paper.pdf
- Repositorio de código: https://github.com/xmattwest/lfm-tinker
