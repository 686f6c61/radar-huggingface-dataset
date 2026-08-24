# Video-Reason/VBVR-Pro-Wan2.1-I2V-14B

## Resumen

VBVR-Pro-Wan2.1-I2V-14B es un modelo de generación de vídeo de imagen a vídeo desarrollado por el equipo de Video-Reason como parte del proyecto VBVR-Pro, un banco de pruebas para el razonamiento visual nativo. Se trata de un ajuste fino (fine-tune) del modelo base Wan-AI/Wan2.1-I2V-14B-720P-Diffusers, entrenado con el dataset propietario VBVR-Pro-SFT-Video. El objetivo principal es capacitar al modelo para razonar a través de la generación visual, es decir, producir secuencias de vídeo que representen procesos de razonamiento sobre tareas visuales, en lugar de limitarse a generar contenido estético.

El modelo cuenta con 16.395.083.584 parámetros (aproximadamente 16,4 mil millones) y se distribuye en formato safetensors bajo licencia Apache 2.0. Su arquitectura hereda la del modelo base Wan2.1, un transformer de difusión para vídeo de alta resolución (720p). La relevancia actual radica en que aborda una línea emergente de investigación: el razonamiento visual nativo, donde la generación de vídeo se utiliza como sustrato para resolver tareas que requieren seguimiento de estado espacio-temporal, algo que los modelos de lenguaje puros no pueden capturar directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Wan2.1-I2V-14B (Diffusers, transformer de difusión para vídeo) |
| Parámetros totales | 16.395.083.584 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo safetensors en BF16) |
| Idiomas soportados | No disponible (el modelo base Wan2.1 soporta chino e inglés, pero no se confirma para este fine-tune) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Wan2.1-I2V-14B-720P, un transformer de difusión diseñado para generación de vídeo condicionada a imágenes. El componente principal es un modelo de difusión latente que opera sobre secuencias de fotogramas, con un codificador de texto y un codificador de imagen que condicionan el proceso de generación. El fine-tune se realizó sobre el dataset VBVR-Pro-SFT-Video, que contiene tareas de razonamiento visual generadas proceduralmente (300 tareas en total) con recompensas verificables basadas en reglas específicas de cada tarea. El entrenamiento empleó un esquema de aprendizaje por refuerzo multi-tarea, utilizando los scorers verificables como señales de recompensa. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de vídeo de imagen a vídeo: el modelo toma una imagen de entrada y produce una secuencia de vídeo coherente con la escena y el movimiento solicitado.
- Razonamiento visual nativo: está entrenado para generar vídeos que representen procesos de razonamiento sobre tareas visuales, como seguimiento de objetos, cambios de estado o transformaciones espaciales.
- Transferencia a tareas no vistas: según la model card, los modelos entrenados con VBVR-Pro muestran transferencia a seis benchmarks de razonamiento visual no vistos durante el entrenamiento (RISE-Video, MME-CoF-Pro, BabyVision, entre otros).
- Generación de vídeo de alta resolución: hereda la capacidad del modelo base para producir vídeo a 720p.
- No se ha confirmado soporte para tool calling, agentes ni capacidades multimodales adicionales (audio, texto, etc.).

## Casos de uso

- Investigación en razonamiento visual: el modelo puede utilizarse para estudiar cómo la generación de vídeo puede servir como sustrato para el razonamiento, comparando trayectorias visuales frente a cadenas de pensamiento lingüísticas.
- Simulación de procesos físicos: dado su entrenamiento en tareas de seguimiento de estado, puede generar vídeos que simulen movimientos de objetos, cambios de posición o interacciones simples, útil en entornos de robótica o visión por computador.
- Generación de contenido educativo: puede crear vídeos que ilustren conceptos de física, geometría o lógica visual, partiendo de una imagen estática y mostrando la evolución del fenómeno.
- Evaluación de modelos de vídeo: al estar diseñado para tareas verificables, puede servir como generador de datos sintéticos para evaluar otros modelos de razonamiento visual o de generación de vídeo.
- Prototipado de aplicaciones de vídeo condicionado: desarrolladores pueden integrarlo en pipelines de generación de vídeo a partir de imágenes para aplicaciones de diseño, publicidad o entretenimiento, aunque su enfoque principal es la investigación.
- Benchmarking de razonamiento visual: el modelo puede utilizarse como referencia en el benchmark VBVR-Pro-Bench para comparar el rendimiento de otros generadores de vídeo en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este modelo en la información disponible. La model card menciona que los modelos entrenados con VBVR-Pro muestran transferencia a benchmarks como RISE-Video, MME-CoF-Pro y BabyVision, pero no se proporcionan cifras concretas. Tampoco se incluyen comparaciones numéricas con otros modelos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 16,4 mil millones de parámetros en BF16, se necesitan aproximadamente 32 GB solo para los pesos, más overhead de activaciones y memoria del optimizador. Se estima un mínimo de 40 GB de VRAM para inferencia básica.
- GPU recomendadas: para una inferencia fluida se recomienda una GPU con al menos 40 GB de VRAM, como NVIDIA A100 (40 GB), A100 (80 GB) o H100. En GPUs de consumo, solo la RTX 4090 (24 GB) podría ejecutar el modelo con cuantización, pero no se han publicado versiones cuantizadas.
- Opciones de despliegue: al estar integrado con la librería diffusers, se puede utilizar con el pipeline `WanImageToVideoPipeline`. También es compatible con herramientas como ComfyUI o diffsynth, aunque no se han documentado configuraciones específicas para este fine-tune.
- Latencia y throughput: no disponible. La generación de vídeo de alta resolución es computacionalmente intensiva y dependerá del hardware y la longitud del vídeo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VBVR-Pro-Wan2.1-I2V-14B (este) | 16,4B | No disponible | Apache 2.0 | Hugging Face |
| Wan-AI/Wan2.1-I2V-14B-720P (base) | 14B (aprox.) | No disponible | Apache 2.0 | Hugging Face |
| CogVideoX-5B (I2V) | 5B | No disponible | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros y licencia. El modelo VBVR-Pro es un fine-tune del Wan2.1 base, por lo que su arquitectura es idéntica, pero su entrenamiento específico para razonamiento visual lo diferencia en capacidades.

## Limitaciones y advertencias

- Al ser un modelo de investigación, no se ha validado su uso en entornos de producción. Puede presentar comportamientos impredecibles en tareas fuera de su dominio de entrenamiento.
- No se han documentado sesgos específicos, pero al estar entrenado sobre un dataset generado proceduralmente, podría tener limitaciones en escenarios del mundo real con alta variabilidad.
- Riesgo de alucinación visual: como todo modelo generativo, puede producir vídeos con inconsistencias físicas o lógicas, especialmente en tareas complejas.
- La longitud de contexto y el número máximo de fotogramas generados no se han especificado, lo que limita su uso en aplicaciones que requieran vídeos largos.
- No se han publicado versiones cuantizadas, lo que dificulta su despliegue en hardware de consumo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y su rendimiento en producción no está garantizado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Video-Reason/VBVR-Pro-Wan2.1-I2V-14B)
- [Paper (arXiv:2602.20159)](https://huggingface.co/papers/2602.20159)
- [Dataset de entrenamiento (VBVR-Pro-SFT-Video)](https://huggingface.co/datasets/Video-Reason/VBVR-Pro-SFT-Video)
- [Benchmark VBVR-Pro-Bench](https://huggingface.co/datasets/Video-Reason/VBVR-Pro-Bench/tree/main)
- [Código de evaluación (VBVR-Pro-Bench)](https://github.com/Video-Reason/VBVR-Pro-Bench)
- [Código de entrenamiento e inferencia (VBVR-Pro)](https://github.com/Video-Reason/VBVR-Pro)
- [Página del proyecto](https://video-reason.com/?v=pro)
- [Modelo base Wan2.1-I2V-14B-720P](https://huggingface.co/Wan-AI/Wan2.1-I2V-14B-720P)
