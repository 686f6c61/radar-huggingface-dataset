# tj111/object-concepts-from-motion

## Resumen

El modelo `object-concepts-from-motion` es un conjunto de checkpoints de inferencia para un codificador visual denso basado en Swin Transformer, publicado por el autor tj111 como parte del trabajo de investigación "Object Concepts Emerge from Motion" (arXiv 2505.21635, aceptado en NeurIPS 2025). El modelo extrae representaciones visuales densas (mapas de características por píxel) que codifican conceptos de objeto de forma auto-supervisada, sin necesidad de etiquetas humanas.

La propuesta se inspira en la psicología del desarrollo: los bebés adquieren comprensión de objetos a través de la observación del movimiento. El modelo utiliza atención sobre patrones de movimiento para agrupar píxeles que se mueven de forma coherente, lo que hace emerger representaciones objetocéntricas de manera natural. Está disponible en cinco tamaños (tiny, small, base, large y huge), siendo el Swin-H el modelo de ciclo 2 y los demás versiones destiladas de este.

La relevancia actual radica en que ofrece una alternativa auto-supervisada a los modelos de representación visual entrenados con supervisión explícita, con aplicaciones en percepción 3D, conducción autónoma y robótica. El repositorio incluye adaptadores para DCDepth, BEVFormer y SparseOcc, lo que facilita su integración en pipelines de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin Transformer (5 variantes: tiny, small, base, large, huge) |
| Parametros totales | no disponible (tamano de archivos: 124 MB a 3.14 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch .pth (checkpoints de inferencia) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Swin Transformer con un cuello (neck) y una cabeza de representación. Los cinco tamaños comparten la misma estructura de bloques pero con diferente número de canales, profundidad de etapas y cabezas de atención. El Swin-H (huge) tiene 384 canales de embedding, profundidades 2, 2, 18, 2 y cabezas de atención 12, 24, 48, 96. Las variantes T, S, B y L son destiladas del Swin-H de ciclo 2.

El entrenamiento es auto-supervisado y se basa en la observación de movimiento en secuencias de video. El modelo utiliza mecanismos de self-attention sobre las señales de movimiento para agrupar píxeles con patrones de movimiento similares, produciendo representaciones que capturan tanto relaciones espaciales como temporales. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. Los checkpoints solo incluyen pesos del backbone, neck y cabeza de representación; se eliminaron optimizador, scheduler y otros estados de entrenamiento. Los nombres de parámetros siguen la convención de MMPretrain/MMEngine.

## Capacidades

- Extracción de características visuales densas (mapas de representación por píxel) para cinco tamaños de backbone.
- Representaciones objetocéntricas emergentes: el modelo agrupa regiones con movimiento coherente, lo que facilita la segmentación y detección de objetos sin etiquetas.
- Soporte de adaptadores para tareas downstream: DCDepth (estimación de profundidad), BEVFormer (percepción en vista de pájaro) y SparseOcc (ocupación 3D dispersa).
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo puramente visual).
- No tiene capacidades multilingües ni de generación de texto.
- No incluye modo "thinking" ni procesamiento de audio o video más allá de las secuencias de imágenes usadas para extraer movimiento.

## Casos de uso

- Estimación de profundidad monocular: mediante el adaptador DCDepth, el modelo puede proporcionar representaciones densas que mejoran la precisión de la profundidad en entornos con objetos en movimiento, útil en robótica y realidad aumentada.
- Percepción para conducción autónoma: el adaptador BEVFormer permite generar representaciones en vista de pájaro a partir de cámaras, facilitando la detección de vehículos, peatones y obstáculos en tiempo real.
- Ocupación 3D y planificación de movimiento: con SparseOcc, el modelo ayuda a reconstruir la ocupación del espacio en 3D, esencial para la navegación de robots móviles y drones.
- Segmentación de objetos sin etiquetas: las representaciones emergentes agrupan píxeles por movimiento, por lo que pueden servir como pre-entrenamiento para segmentadores semánticos o instancias en dominios con pocos datos anotados.
- Pre-entrenamiento de modelos de visión por computador: los checkpoints pueden usarse como inicialización para tareas de clasificación, detección o segmentación, reduciendo la necesidad de grandes conjuntos etiquetados.
- Investigación en aprendizaje auto-supervisado: el marco basado en movimiento ofrece un banco de pruebas para estudiar cómo emergen conceptos de objeto en sistemas artificiales, con aplicaciones en psicología computacional y neurociencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El trabajo original (arXiv 2505.21635) podría contener evaluaciones, pero no se han incluido en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. Para Swin-T (124 MB de pesos) se puede ejecutar en GPUs con 4-6 GB de VRAM; Swin-S (210 MB) y Swin-B (362 MB) requieren alrededor de 8-12 GB; Swin-L (796 MB) necesita 16-24 GB; Swin-H (3.14 GB) requiere 24 GB o más, especialmente con resolución de entrada alta.
- GPU recomendadas: para Swin-T/S/B, GPUs de consumo como RTX 3060, 3070, 4060 o superiores. Para Swin-L, RTX 4090 o A5000. Para Swin-H, A100, H100 o similares con 40 GB o más.
- El modelo cabe en GPUs de consumo para las variantes pequeñas, pero las grandes requieren hardware profesional.
- Opciones de despliegue: no está empaquetado para `transformers.AutoModel` ni para la Inference API de Hugging Face. Debe usarse el repositorio fuente de GitHub, que incluye una implementación PyTorch independiente y adaptadores para DCDepth, BEVFormer y SparseOcc. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de representación visual auto-supervisada en la documentación proporcionada. Modelos como DINOv2 o MAE podrían considerarse alternativas, pero no hay datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- Los checkpoints son solo representaciones, no modelos de tarea completa. DCDepth, BEVFormer y SparseOcc requieren decoders o cabezas de predicción entrenados por separado.
- No se han documentado sesgos conocidos, pero al estar entrenado con video, podría heredar sesgos de los datos de entrenamiento (no especificados).
- Riesgo de alucinación: no aplica, ya que no genera texto ni contenido simbólico; sin embargo, las representaciones pueden ser subóptimas en dominios muy diferentes a los del entrenamiento.
- Limitaciones de contexto: es un modelo de visión, no maneja texto ni lenguaje.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero se recomienda revisar los términos del repositorio fuente.
- Los archivos no están empaquetados para `transformers` ni para la Inference API, lo que limita su uso en entornos estándar de Hugging Face.
- No hay información sobre cuantización, por lo que el despliegue en hardware con poca memoria podría requerir trabajo adicional.

## Enlaces

- HuggingFace: https://huggingface.co/tj111/object-concepts-from-motion
- GitHub: https://github.com/TJ12342/object-concepts-from-motion
- arXiv (abstract): https://arxiv.org/abs/2505.21635
- arXiv (HTML): https://arxiv.org/html/2505.21635v1
- NeurIPS proceedings (abstract): https://proceedings.neurips.cc/paper_files/paper/2025/hash/dff464dd9e64c8adc45a23f1b9e9a041-Abstract-Conference.html
- PDF NeurIPS: https://proceedings.neurips.cc/paper_files/paper/2025/file/dff464dd9e64c8adc45a23f1b9e9a041-Paper-Conference.pdf
