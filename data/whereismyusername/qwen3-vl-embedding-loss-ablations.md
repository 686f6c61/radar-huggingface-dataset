# whereismyusername/qwen3-vl-embedding-loss-ablations

## Resumen

Este repositorio no es un modelo independiente, sino un paquete de cinco ejecuciones de ajuste fino (una completa y cuatro ablaciones leave-one-out) sobre el backbone multimodal Qwen3-VL-Embedding-2B. Lo publica el usuario `whereismyusername` y su propósito es documentar el efecto de cada componente de la función de pérdida en una tarea concreta: clasificación/embeddings sobre el dataset `food101`. Cada ejecución se identifica con un hash de configuración y contiene únicamente los pesos del adaptador LoRA, además del estado necesario para reanudar el entrenamiento.

El interés técnico está en la metodología, no en el rendimiento: el autor compara la receta completa (L1 + L2 + L3 + Leps) con cuatro variantes en las que se desactiva una pérdida cada vez, manteniendo semilla, plan de datos e hiperparámetros. Esto permite aislar la contribución de la cross-entropy sobre datos sintéticos (L1), la regularización de prototipos reales (L2), la regularización de prototipos sintéticos (L3) y la consistencia (Leps) en un escenario de pocos ejemplos reales (16 imágenes por clase) y datos sintéticos (64 por clase).

Es relevante para investigadores que trabajen en embeddings multimodales con datos escasos y en el diseño de funciones de pérdida auxiliares, porque publica los checkpoints y la configuración resuelta, algo poco habitual en estudios de ablación. No hay métricas publicadas en la model card ni licencia declarada, por lo que debe tratarse como material de investigación reproducible, no como un artefacto listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (r=16, alpha=32, dropout=0.1) sobre el backbone multimodal Qwen3-VL-Embedding-2B, modelo de embeddings unificados basado en Qwen3-VL |
| Parámetros totales | ~2B en el backbone (según la model card); número de parámetros de los adaptadores no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican checkpoints PyTorch en punto flotante; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no declara licencia) |
| Formato de pesos | `.pt` (PyTorch): pesos LoRA + estado del optimizador + AMP scaler + estado RNG + época/paso + mejor accuracy + historial; no se usan safetensors ni GGUF |
| Tamaño del repositorio | 5,4 GB |
| Dataset de ajuste | `food101`: 16 imágenes reales por clase y 64 imágenes sintéticas por clase (101 clases) |
| Configuración de entrenamiento | 30 épocas, batch 128, lr 1e-4; pesos de pérdida λ1=0.2, λ2=0.04, λ3=0.02, λeps=0.1; semilla 100 |
| Evaluación | 80 imágenes por clase cada época; conjunto de test completo al final |
| Librería | `peft` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El backbone es Qwen3-VL-Embedding-2B, un modelo de vectores multimodal unificado de la familia Qwen3-VL que acepta texto, imagen y vídeo (en modalidad única o mixta) y produce representaciones vectoriales comunes, pensado para recuperación cross-modal, búsqueda de imágenes o vídeo, clustering y etiquetado. Sobre él se aplica un adaptador LoRA de rango 16 y alpha 32 con dropout 0.1, de modo que los checkpoints publicados contienen solo los pesos del adaptador; el modelo base se reconstruye a partir de `model_name_or_path` al reanudar. En la model card la ruta indicada es local (`/marimo/models/Qwen3-VL-Embedding-2B`), por lo que es necesario sustituirla por la ruta o el identificador de HuggingFace del backbone.

El entrenamiento se organiza como un plan de ablación con cinco ejecuciones y semilla fija (100): una completa con las cuatro pérdidas activas y cuatro variantes que desactivan L1 (cross-entropy sobre datos sintéticos), L2 (regularización de prototipos reales), L3 (regularización de prototipos sintéticos) o Leps (consistencia). La combinación de datos mezcla 16 imágenes reales y 64 sintéticas por clase, con evaluación sobre 80 imágenes por clase en cada época y test completo al final. El nombre de cada experimento incorpora un hash calculado a partir de los hiperparámetros con fingerprint, de forma que cualquier cambio de configuración genera un experimento nuevo y evita mezclar runs. No se detallan en la información disponible el número total de tokens, la composición exacta del generador de imágenes sintéticas, ni si hubo etapas de RLHF o DPO (poco probables en un modelo de embeddings).

## Capacidades

- Generación de embeddings multimodales: representaciones vectoriales de imágenes y texto (el backbone declara además soporte de vídeo) para similitud y recuperación cross-modal.
- Clasificación por prototipos: asignación de clase por vecindad a prototipos reales o sintéticos, que es el mecanismo que las pérdidas L2 y L3 regularizan.
- Ajuste con pocos datos reales: receta diseñada explícitamente para 16 ejemplos reales por clase, apoyada en 64 imágenes sintéticas por clase.
- Reproducción de ablaciones: cinco runs con semilla fija y plan de configuración resuelto en `runs/experiment_plan.json`.
- Reanudación de entrenamiento: `resume_from_hf=True` descarga `checkpoints/last.pt` y continúa en `epoch + 1`, con fallback a checkpoints locales.
- Trazabilidad de hiperparámetros: el hash de fingerprint en el nombre del experimento impide reutilizar un nombre con una configuración distinta.
- Persistencia de estado completo de entrenamiento: optimizador, AMP scaler, RNG, época, paso, mejor accuracy e historial.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso. Cualquier capacidad de este tipo dependería del backbone Qwen3-VL subyacente, no de estos adaptadores.

## Casos de uso

- Investigación sobre funciones de pérdida en embeddings multimodales: comparar la receta completa frente a las cuatro ablaciones para cuantificar qué aporta cada término antes de fijar una receta propia.
- Selección de receta para clasificación de imágenes con pocos datos: usar la configuración de 16 shots reales + 64 sintéticos como punto de partida en dominios donde etiquetar es caro, por ejemplo inspección visual o catálogos de producto.
- Evaluación del valor de datos sintéticos: la ablación L1 (cross-entropy solo sobre sintéticos) y L3 (regularización de prototipos sintéticos) permiten medir si las imágenes generadas aportan señal o solo ruido en una tarea de 101 clases.
- Recuperación y búsqueda en dominio gastronómico: los adaptadores ajustados sobre `food101` sirven para probar búsqueda imagen-texto y agrupamiento de platos antes de invertir en un dataset propio mayor.
- Etiquetado y tagging automático de imágenes de comida: clasificación por similitud a prototipos con un adaptador LoRA de bajo coste, sin necesidad de reentrenar el backbone de 2B.
- Reanudación y auditoría de experimentos: los checkpoints `last.pt`/`best.pt` con estado de optimizador y RNG permiten retomar runs interrumpidos o reproducir una curva de validación concreta en un clúster.
- Docencia y formación interna: el paquete sirve como ejemplo completo de plan de ablación con fingerprint de hiperparámetros, evaluación por época y separación entre pesos de adaptador y modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye el diseño de las cinco ejecuciones y referencias a ficheros `results.json` con métricas y configuración, pero no reproduce los valores numéricos.

| Experimento | Ablación | L1 (synth CE) | L2 (real prototype reg) | L3 (synth prototype reg) | Leps (consistency) |
|---|---|---|---|---|---|
| `food101__full__seed100__d5bd8bac` | Completa | on | on | on | on |
| `food101__no_l1__seed100__d1efd3bc` | Sin L1 | off | on | on | on |
| `food101__no_l2__seed100__76c1393b` | Sin L2 | on | off | on | on |
| `food101__no_l3__seed100__0874582c` | Sin L3 | on | on | off | on |
| `food101__no_eps__seed100__4ccca1f0` | Sin Leps | on | on | on | off |

## Requisitos de hardware

- Inferencia del backbone de 2B en bf16: aproximadamente 4-5 GB solo en pesos; con el codificador visual, preprocesado de imagen y activaciones, el pico realista se sitúa en torno a 8-12 GB para lotes pequeños (estimación por recuento de parámetros, no publicada por el autor).
- Ajuste fino con LoRA: el run usa batch 128 sobre imágenes, por lo que la memoria necesaria es muy superior a la de inferencia y depende de si se aplica gradient checkpointing (no documentado). Es razonable planificar una GPU de 40-80 GB para reproducir la configuración tal cual, o reducir el batch y ajustar la tasa de aprendizaje.
- GPU consumer: el adaptador y el backbone de 2B caben en una RTX 4090 (24 GB) para inferencia y para ajuste fino con lotes pequeños; entrenar con batch 128 en 24 GB no es viable sin acumulación de gradientes o checkpointing.
- GPU de datacenter: A100 40/80 GB o H100 para reproducir el plan de entrenamiento sin modificaciones.
- Despliegue: PyTorch + `transformers` + `peft` es la vía natural, ya que los pesos son adaptadores LoRA y no artefactos empaquetados. llama.cpp y Ollama no son aplicables al no existir GGUF. vLLM o TGI podrían servir el backbone en modo embedding, pero requerirían fusionar o cargar el adaptador y no hay configuración publicada para ello.
- Latencia y throughput: no disponibles. Tampoco se documenta el hardware utilizado en los runs originales.
- Almacenamiento: 5,4 GB de repositorio; los checkpoints contienen solo adaptadores y estado de entrenamiento, y el backbone debe descargarse aparte.

## Comparativa con modelos similares

La comparación directa no es limpia: este repositorio es un conjunto de adaptadores de ablación, no un modelo publicado con rendimiento medido. Se incluye como referencia la categoría a la que pertenece el backbone.

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (LoRA sobre Qwen3-VL-Embedding-2B) | ~2B en el backbone; adaptadores no cuantificados | no disponible | imagen y texto (vídeo según el backbone) | no disponible | Repo público en HuggingFace, 0 descargas, 0 likes |
| Qwen3-VL-Embedding (familia base de Qwen) | no disponible en la información | no disponible | texto, imagen y vídeo, única o mixta | no disponible en la información | Documentado en Model Studio y en el repositorio Qwen3-VL |
| CLIP (OpenAI) | no disponible en la información | no disponible | imagen y texto | no disponible en la información | Referencia habitual de retrieval cross-modal; no se dispone de datos verificados en esta búsqueda |
| SigLIP | no disponible en la información | no disponible | imagen y texto | no disponible en la información | Alternativa frecuente en clasificación zero-shot; sin datos verificados en esta búsqueda |

El eje real de comparación debería ser la receta de ajuste (con y sin cada pérdida) sobre el mismo backbone y dataset, que es precisamente lo que ofrecen los cinco runs.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay permiso claro para uso comercial ni para redistribuir los adaptadores; hay que contactar con el autor o asumir uso exclusivamente de investigación.
- Alcance limitado al dominio `food101`: 101 clases de comida, 16 imágenes reales y 64 sintéticas por clase. El comportamiento fuera de esa distribución no está evaluado.
- Ausencia de métricas publicadas: no se pueden comparar los runs entre sí sin abrir los `results.json` o reproducir la evaluación; la model card no incluye accuracy ni métricas de recuperación.
- Dependencia de una ruta local: la configuración apunta a `/marimo/models/Qwen3-VL-Embedding-2B`, que no existe en un entorno ajeno; es imprescindible sustituirla y verificar que la versión del backbone coincide con la usada en los runs.
- No es un modelo generativo: no debe esperarse diálogo, tool calling ni razonamiento; usar estos pesos para esas tareas es un error de categoría.
- Riesgo de sobreajuste y de sesgo inducido por datos sintéticos: el 80 % de las imágenes por clase son generadas; si el generador produce artefactos o desequilibrios, el adaptador los heredará. La propia existencia de las ablaciones L1 y L3 sugiere que el autor consideraba esta contribución incierta.
- Idiomas no declarados: el backbone es multimodal, pero el ajuste se hace sobre imágenes de comida; no hay evidencia de comportamiento multilingüe en estos adaptadores.
- Estado de entrenamiento incluido: los `.pt` contienen optimizador, AMP scaler y RNG, lo que aumenta el tamaño y expone detalles del proceso; no son pesos listos para servir sin cargarlos vía PEFT.
- Fecha de creación declarada en el repositorio: 2026-10-29, posterior a la publicación del backbone en los materiales consultados; conviene verificar la procedencia y la versión exacta del modelo base antes de reutilizar los checkpoints.
- Sin pipeline declarado ni descargas: no hay señales de validación por parte de la comunidad, así que la reproducibilidad recae enteramente en el código del cuaderno que menciona el autor (no enlazado en la información disponible).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/whereismyusername/qwen3-vl-embedding-loss-ablations
- Documentación de Qwen3-VL-Embedding en Alibaba Cloud Model Studio: https://help.aliyun.com/en/model-studio/qwen3-vl-embedding
- Documentación alternativa en Model Studio: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-vl-embedding
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Nota técnica sobre el entrenamiento de pérdidas de Qwen3-VL-Embedding: https://github.com/yodagast/paper/blob/main/docs/qwen3_vl_embedding_loss_training.md
- Guía de resolución de problemas de Qwen3-VL-Embedding (DeepWiki): https://deepwiki.com/qwenlm/qwen3-vl-embedding/8-troubleshooting
