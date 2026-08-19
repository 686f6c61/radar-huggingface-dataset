# stage-babylm/llama-128-1L

## Resumen

El modelo `llama-128-1L` es un transformador de tipo Llama extremadamente pequeño, con solo 453.120 parámetros (0,45 millones), publicado por el usuario `stage-babylm` en HuggingFace. Forma parte del ecosistema del reto BabyLM, una iniciativa de investigación que estudia el aprendizaje del lenguaje con cantidades de datos limitadas (equivalentes a la exposición lingüística de un niño). El nombre sugiere una arquitectura de una sola capa (1L) y una dimensión de embedding de 128, aunque estos detalles no están confirmados oficialmente.

El modelo fue generado automáticamente con la librería `transformers` y el `Trainer`, lo que indica que es un artefacto de investigación más que un producto listo para producción. Su relevancia radica en servir como punto de partida para estudiar la relación entre escala, cantidad de datos y capacidad lingüística emergente. La ficha oficial es mínima: no declara licencia, idiomas, ni benchmarks, y la pérdida de validación final es de 2,1785.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformador causal), probablemente 1 capa y dimensión de embedding 128 (inferido del nombre, no confirmado) |
| Parametros totales | 453.120 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformador causal de tipo Llama, según la etiqueta `llama` en HuggingFace. El sufijo `1L` del nombre sugiere una sola capa de transformador, y `128` podría indicar la dimensión del modelo, pero no hay documentación que lo confirme. No se especifica el número de cabezas de atención, la dimensión del feed-forward ni otros detalles estructurales.

El entrenamiento se realizó con el `Trainer` de HuggingFace sobre un dataset no especificado. Los hiperparámetros declarados son: learning rate 0,0018, batch de entrenamiento 32, batch de evaluación 8, optimizador AdamW (fused) con betas (0,9, 0,95), scheduler cosine con 5% de warmup, y una sola época. El entrenamiento duró 40.278 pasos. La pérdida de entrenamiento descendió de 2,6041 a 2,1470, y la pérdida de validación final fue de 2,1785. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto autoregresiva básica, limitada por su tamaño extremadamente reducido.
- Capacidad de aprendizaje de patrones estadísticos simples del lenguaje, propia de modelos de menos de 1 millón de parámetros.
- No hay evidencia de soporte de tool calling, function calling, razonamiento multi-paso, ni capacidades multimodales.
- No se ha declarado soporte multilingüe; el modelo probablemente solo ha sido entrenado con un corpus monolingüe, aunque no se especifica.
- No dispone de modo de pensamiento extendido (thinking mode) ni de capacidades de visión o audio.

## Casos de uso

- Investigación académica sobre scaling laws: permite estudiar cómo varía la pérdida y la capacidad de generalización con modelos de menos de 1M parámetros.
- Análisis de representaciones lingüísticas tempranas: útil para inspeccionar qué patrones sintácticos o semánticos aprende un modelo mínimo entrenado con datos limitados.
- Experimentos de eficiencia de muestras: sirve como línea base para comparar métodos de entrenamiento con pocos datos, como los del reto BabyLM.
- Educación y demostraciones: puede usarse en cursos de NLP para ilustrar el funcionamiento interno de un transformador sin necesidad de hardware potente.
- Pruebas de pipelines de entrenamiento: al ser rápido de entrenar y evaluar, es adecuado para validar infraestructuras de fine-tuning o de despliegue.
- Generación de texto de juguete: puede producir texto aleatorio con coherencia local limitada, útil para demos lúdicas, pero no para aplicaciones reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación (2,1785) y la evolución de la pérdida durante el entrenamiento, sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB, incluso en FP32. El modelo ocupa aproximadamente 1,8 MB en memoria (453.120 parámetros × 4 bytes).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, o incluso CPU. Modelos como una NVIDIA T4, RTX 3060 o superiores son más que suficientes.
- Corre sin problemas en hardware de consumo, incluyendo portátiles sin GPU dedicada.
- Opciones de despliegue: puede ejecutarse con `transformers` en Python, o exportarse a GGUF para usarse con `llama.cpp` u Ollama. También es compatible con TGI y vLLM, aunque su tamaño lo hace innecesario.
- Latencia y throughput: al ser un modelo tan pequeño, la generación es casi instantánea en CPU (del orden de milisegundos por token). No hay datos oficiales de throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (menos de 1M parámetros) dentro del reto BabyLM. Existen otros modelos miniatura como `google/bert_uncased_L-2_H-128_A-2` (12,5M parámetros) o los modelos de la serie `TinyLlama` (1,1B), pero no son directamente comparables por tamaño. No se puede establecer una comparativa rigurosa sin datos de benchmarks.

## Limitaciones y advertencias

- Tamaño extremadamente reducido: su capacidad de modelado del lenguaje es muy limitada; generará texto incoherente o repetitivo en tareas complejas.
- Alto riesgo de alucinación: al carecer de suficiente capacidad y datos, es probable que produzca información falsa o sin sentido.
- Sin licencia declarada: no se puede determinar si es utilizable comercialmente; se recomienda contactar al autor antes de cualquier uso.
- Idiomas no especificados: se desconoce en qué idioma(s) fue entrenado, por lo que su rendimiento en español u otros idiomas es impredecible.
- Sin contexto definido: no se conoce la longitud máxima de secuencia, lo que dificulta su uso en aplicaciones que requieran contexto largo.
- No apto para producción: es un artefacto de investigación generado automáticamente, sin garantías de calidad ni soporte.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/stage-babylm/llama-128-1L)
- [Sitio oficial del reto BabyLM](https://babylm.github.io/)
