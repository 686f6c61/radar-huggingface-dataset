# twainsk/qev-450m-mlx

## Resumen

Qev-450M-MLX es el checkpoint de decisión por defecto de Qev v0.4.0, desarrollado por twainsk dentro del proyecto Qev (repositorio loadchange/qev). Se construye sobre el modelo fundacional multimodal LiquidAI/LFM2.5-VL-450M, que se mantiene congelado y byte-idéntico a la revisión upstream, y le añade dos artefactos nuevos: un adaptador LoRA conmutable (`decision_adapters.safetensors`) y una cabeza de puntuación de candidatos (`pointer.safetensors`).

El modelo no genera JSON como texto, sino que puntúa opciones de respuesta suministradas con probabilidades reales a través de una API estilo Jev/TypeSafe (`POST /v1/systemone`). Frente al checkpoint anterior basado en Qwen3.5-0.8B, es 3,4× más pequeño, responde decisiones Snake 2,1× más rápido y genera texto de chat unas 2× más rápido en el mismo Mac, con un coste medido de −2,8 puntos en el subconjunto de texto general.

Es relevante ahora porque demuestra que una tarea estructurada de decisión puede resolverse con un modelo de 450 M de parámetros y 24,5 M de parámetros entrenados sobre Apple Silicon, sin PyTorch (usa el procesador numpy de mlx-vlm) y con una ventana de despliegue muy ligera. El repositorio ocupa 1,0 GB y está pensado para ejecutarse exclusivamente con el runtime Qev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5-VL (transformer multimodal texto+imagen de LiquidAI) con adaptador LoRA y cabeza pointer añadidos |
| Parametros totales | ~450 M del backbone LFM2.5-VL-450M + 24,5 M entrenados (LoRA + pointer) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el runtime MLX expone los modos `adapter` y `bf16`) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | LFM Open License v1.0 |
| Formato de pesos | safetensors (bfloat16) para el backbone, `decision_adapters.safetensors` (LoRA) y `pointer.safetensors`; configuración `qev_config.json` (formato Qev v3) |

## Arquitectura y entrenamiento

El backbone es el modelo multimodal LFM2.5-VL-450M de LiquidAI, fijado en la revisión `fc6221ca…34ba` y distribuido en bfloat16 safetensors junto con tokenizer, processor, plantilla de chat y licencia. Sobre él se superponen dos componentes entrenados: un LoRA de rango 64 y alpha 128 aplicado sobre `q/k/v/out_proj`, `in_proj` y las proyecciones MLP `w1/w2/w3` de todas las capas de lenguaje, y una cabeza pointer de 256 dimensiones que actúa como scorer de candidatos. El adaptador es conmutable: la inferencia de decisión lo activa; la generación nativa de texto e imagen lo desactiva y usa el fundacional sin modificar.

El entrenamiento consistió en imitación supervisada sobre la suite de decisión de Qev, con 17.892 preguntas de entrenamiento, 1.120 de calibración y 1.380 de desarrollo (12.000 filas Snake más 5.892 filas generales, inglés más cuatro familias sintéticas bilingües de reglas). Se ejecutó en una NVIDIA A100 de 40 GB durante 4 épocas, batch 8 × acumulación 2 (4.476 actualizaciones, ~18 minutos), learning rate 1e-4 con schedule coseno, autocast BF16 con pesos maestros FP32. Los parámetros del fundacional permanecieron congelados y solo se entrenaron los 24,5 M de LoRA + pointer. La temperatura `4.59479341998814` se ajustó sobre el split de calibración reservado; una variante de 6 épocas y lr 2e-4 obtuvo 59,1% en general y fue descartada.

## Capacidades

- Decisión estructurada con probabilidades reales: puntúa opciones de respuesta suministradas mediante `POST /v1/systemone`, sin generar JSON como texto.
- Generación de texto conversacional nativa (chat) usando el fundacional sin el adaptador de decisión.
- Entrada multimodal de texto e imagen; las decisiones con imagen se resuelven por transferencia zero-shot desde el entrenamiento solo de texto.
- Entrada de vídeo aceptada como fotogramas ordenados (no evaluada para decisiones).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades multilingües: inglés y chino, con cobertura china limitada a cuatro familias sintéticas de reglas.
- Capacidad especial: cabeza pointer de 256 dimensiones que actúa como scorer de candidatos y permite calcular probabilidades por clase.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica una incidencia entre opciones predefinidas (`billing`, `technical`, `sales`) devolviendo una probabilidad por clase, lo que permite fijar umbrales de derivación automática o humana.
- Enrutado de decisiones en pipelines internos: dado un texto breve y un conjunto cerrado de acciones, el modelo selecciona la acción con una puntuación calibrada, sustituyendo heurísticas por reglas o clasificadores ad hoc.
- Verificación de documentos con imagen: con `qev decide --image`, responde preguntas como si una imagen es un recibo de restaurante, útil en flujos de validación de gastos o recepción de documentos.
- Preprocesado de formularios y bandejas de entrada: clasificación de correos o formularios en categorías discretas antes de pasarlos a un modelo mayor, aprovechando latencia p50 de 98 ms y memoria máxima de 1,9 GiB.
- Asistente local de chat ligero en Apple Silicon: generación de texto conversacional a ~100 tokens/s en modo `bf16`, adecuada para entornos sin GPU dedicada ni conectividad a la nube.
- Jugador o evaluador de escenarios Snake para pruebas de decisión: con 41,4 de comida media y 0 colisiones en 20 partidas sembradas, sirve como banco de pruebas de políticas de decisión cerradas.
- Filtrado previo (pre-routing) en arquitecturas RAG o multi-agente: cuando el coste de invocar un modelo grande es alto, este checkpoint puede decidir a qué rama o herramienta derivar la consulta.

## Benchmarks y rendimiento

Conjunto de desarrollo (1.380 preguntas), referencia PyTorch; MLX coincide con un máximo de 2 cambios de argmax:

| Subconjunto | Precisión |
|---|---|
| Todos | 86,1% |
| Snake (500) | 98,8% |
| Texto general (880) | 78,9% |
| Chino (50) | 94,0% |

Decisiones con imagen (transferencia zero-shot desde entrenamiento solo de texto):

| Prueba | Resultado |
|---|---|
| A-OKVQA validación (500), con imagen | 69,4% |
| A-OKVQA validación (500), sin imagen | 37,2% |
| Azar | 25% |

Otras medidas:

| Prueba | Resultado |
|---|---|
| Snake en bucle cerrado (20 partidas sembradas) | media 41,4 de comida, 0 colisiones |
| Sonda de opciones invertidas | 85,1% (−1,0 pt), 7,2% de elecciones cambian |
| Comparación con checkpoint Qwen3.5-0.8B (mismas preguntas) | general −2,8 pt (McNemar p=0,024); Snake paridad (p=0,63) |
| Comparación con la receta LFM2.5-VL anterior | general +3,2 pt (p=0,013) |
| Paridad MLX vs PyTorch (1.380 preguntas) | modo `adapter`: 2 cambios de argmax, diff máx. de probabilidad 0,051; `bf16`: 2 cambios, 0,038 |

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de memoria MLX ≤1,9 GiB en Apple M4 de 16 GB.
- Plataforma obligatoria: Apple Silicon con macOS 14 o superior y Python 3.12 o superior; no hay soporte CUDA indicado.
- GPU recomendadas: Apple Silicon (validado en M4 de 16 GB). Para el entrenamiento se usó una NVIDIA A100 de 40 GB, no para inferencia.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon; no se documenta soporte en GPUs de consumo NVIDIA.
- Opciones de despliegue: runtime Qev vía Homebrew (`brew install loadchange/qev/qev`, `qev serve`) o desde checkout de código fuente (`uv sync --python 3.12 --extra mlx`). Un pipeline genérico de Transformers o `mlx_lm.generate` no carga la cabeza pointer ni los adaptadores conmutables.
- Versiones validadas: MLX 0.32.2 y mlx-vlm 0.7.1; las imágenes usan el procesador numpy LFM2-VL de mlx-vlm, sin necesidad de PyTorch.
- Latencia y throughput: en Apple M4 de 16 GB, decisión Snake p50 de 98 ms en modo `adapter` y 71 ms en modo `bf16` (predeterminado del servicio Homebrew); chat nativo ≈100 tokens/s en `bf16`.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Idiomas | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| twainsk/qev-450m-mlx | LFM2.5-VL-450M | ~450 M + 24,5 M entrenados | en, zh | LFM Open License v1.0 | General 78,9%, Snake 98,8%, chino 94,0% | HuggingFace (mlx) |
| twainsk/qev-0.8b-mlx | Qwen3.5-0.8B | ~0,8 B (no confirmado en detalle) | no disponible | no disponible | General +2,8 pt frente a Qev-450M; Snake paridad (p=0,63) | HuggingFace (mlx) |
| twainsk/qev-230m-mlx | no disponible (compañero solo texto) | ~230 M | no disponible | no disponible | no disponible | HuggingFace (mlx) |

Nota: los datos del checkpoint Qwen3.5-0.8B y del 230M provienen únicamente de las comparaciones publicadas en la model card; no se dispone de sus especificaciones completas.

## Limitaciones y advertencias

- El adaptador de decisión se entrenó solo con texto; las decisiones con imagen son transferencia zero-shot (69,4% en A-OKVQA) y sus probabilidades no están calibradas (temperatura 1,0 en imagen; la calibración de texto no se aplica).
- La entrada de vídeo se acepta como fotogramas ordenados, pero no se evaluó para decisiones.
- La cobertura de chino se limita a cuatro familias sintéticas de reglas y el subconjunto de evaluación china tiene solo 50 preguntas, por lo que la cifra de 94,0% debe tomarse con cautela.
- Sensibilidad al orden de las opciones del 7,2% de cambios de elección, superior al 3,6% del checkpoint Qwen3.5-0.8B.
- La compatibilidad de API no implica que el modelo iguale la calidad o los valores de confianza del modelo Jev original.
- Licencia LFM Open License v1.0: el uso comercial por parte de una entidad legal con ingresos anuales de 10 millones de USD o más no está autorizado.
- Requiere el runtime Qev: un pipeline genérico de Transformers o `mlx_lm.generate` no carga la cabeza pointer ni los adaptadores conmutables.
- Dependencia de plataforma: solo Apple Silicon, macOS 14+, Python 3.12+.
- Riesgo de alucinación y sesgos conocidos: no disponible en la información proporcionada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/twainsk/qev-450m-mlx
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Checkpoint compañero solo texto: https://huggingface.co/twainsk/qev-230m-mlx
- Checkpoint anterior (Qwen3.5-0.8B): https://huggingface.co/twainsk/qev-0.8b-mlx
- Proyecto Qev: https://github.com/loadchange/qev
- README en chino simplificado: https://huggingface.co/twainsk/qev-450m-mlx/blob/main/README.zh-CN.md
- Licencia: https://huggingface.co/twainsk/qev-450m-mlx/blob/main/LICENSE
- Notice: https://huggingface.co/twainsk/qev-450m-mlx/blob/main/NOTICE
