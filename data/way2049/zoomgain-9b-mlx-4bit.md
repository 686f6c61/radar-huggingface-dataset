# way2049/ZoomGain-9B-MLX-4bit

## Resumen

ZoomGain-9B es un modelo multimodal de tipo image-text-to-text desarrollado por inclusionAI, construido sobre la arquitectura Qwen3.5 y especializado en percepción de detalles finos en imágenes grandes sin necesidad de recortes ni herramientas de zoom. Resuelve el problema del "global-to-zoom perception gap": la dificultad de los modelos de visión para leer atributos pequeños, texto diminuto o contar objetos en escenas complejas cuando solo disponen de una pasada sobre la imagen completa. Con aproximadamente 9.410 millones de parámetros, se entrenó mediante aprendizaje por refuerzo sobre unos 9.000 ejemplos de ZoomGain destilados de esas brechas de percepción.

El repositorio analizado, `way2049/ZoomGain-9B-MLX-4bit`, es una conversión comunitaria e independiente del modelo base a cuantización de 4 bits en formato MLX, pensada para Apple Silicon. No es una publicación oficial de inclusionAI. Su relevancia radica en que demuestra que un modelo de ~9B puede ejecutarse localmente en un Mac de 24 GB y superar en una sola pasada a modelos mucho mayores con acceso a recorte, al menos en la porción inglesa de ZoomGainBench.

La ficha describe tanto el modelo base como esta cuantización específica, indicando qué datos proceden de la model card del conversor y qué aspectos permanecen sin verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (qwen3_5), con torre de visión y pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 (~9,41B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible (el benchmark del paper es bilingüe, pero esta cuantización solo se evaluó en inglés) |
| Licencia | other (el modelo base no declara licencia explícita; la cuantización sigue la misma convención que las conversiones GGUF existentes) |
| Formato de pesos | safetensors en formato MLX (librería `mlx`, `mlx-vlm`) |
| Tamano del repositorio | 6,0 GB |
| Pipeline | image-text-to-text |
| Modelo base | inclusionAI/ZoomGain-9B |

## Arquitectura y entrenamiento

El modelo base ZoomGain-9B se apoya en la arquitectura Qwen3.5, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. Su entrenamiento se realizó mediante aprendizaje por refuerzo (RL) sobre aproximadamente 9.000 muestras de ZoomGain, minadas a partir de brechas de percepción global-to-zoom, según el paper arXiv:2611.14076. El objetivo es que el modelo aprenda a extraer detalles finos de una imagen completa en una única pasada, sin invocar recortes ni herramientas externas de zoom. La evaluación oficial del modelo desactiva el modo "thinking" de Qwen3.5, de modo que las respuestas se generan de forma directa y codiciosa.

Esta cuantización concreta fue producida por el usuario way2049 en un Mac mini M4 Pro con 24 GB de memoria unificada, usando la librería `mlx-vlm` (versión >= 0.8.0). No se han publicado detalles sobre la composición exacta del dataset de RL, la tokenización, el número de tokens de entrenamiento ni si hubo fases adicionales de DPO o RLHF más allá del RL descrito. Tampoco se documentan innovaciones de decodificación especulativa ni mecanismos de atención lineal en la información disponible.

## Capacidades

- Generación de texto e image-text-to-text: describe imágenes, responde preguntas sobre su contenido y extrae atributos visuales.
- Percepción de detalles finos: identifica atributos pequeños (colores de objetos, accesorios, elementos secundarios) en escenas complejas con una sola pasada.
- Conteo de objetos: capacidad medida en la categoría "counting" de ZoomGainBench, aunque con un tamaño de muestra reducido (19 ítems).
- OCR y lectura de texto en imagen: reconocimiento de texto pequeño, con limitaciones documentadas en caracteres diminutos y mayúsculas estrictas.
- Razonamiento visual de un solo paso: no requiere tool calling ni recortes para responder, lo que simplifica el despliegue.
- Modo thinking de Qwen3.5: disponible en la arquitectura base, aunque la evaluación oficial lo desactiva y la model card recomienda no activarlo para respuestas cortas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el paper reporta un benchmark bilingüe, pero esta cuantización solo se midió en inglés; el resto de idiomas no está verificado.

## Casos de uso

- Inspección de imágenes de alta resolución en local: un desarrollador puede cargar una fotografía grande en un Mac con 24 GB y preguntar por detalles concretos (color de un accesorio, presencia de un objeto pequeño) sin subir la imagen a la nube, gracias a la cuantización 4-bit MLX y al pipeline image-text-to-text.
- Asistencia a personas con discapacidad visual: el modelo puede describir atributos finos de una escena (por ejemplo, el color de un objeto en una esquina) en una sola pasada, lo que reduce la latencia frente a enfoques que requieren múltiples recortes.
- Moderación y auditoría de contenido visual: revisión de imágenes para detectar elementos pequeños o texto incrustado (matrículas, carteles, etiquetas) que otros modelos pasan por alto, usando la categoría OCR y de atributos del modelo.
- Extracción de datos de documentos y carteles: lectura de texto en fotografías de fachadas, señales o placas, con la advertencia de que el OCR es la categoría más débil (48,70% en la muestra de 200 ítems) y requiere validación humana en caracteres diminutos.
- Prototipado de agentes visuales sin recorte: al no necesitar herramientas de zoom, el modelo simplifica pipelines de agentes que antes dependían de llamadas a funciones de crop; útil para demos y pruebas de concepto en Apple Silicon.
- Investigación en percepción multimodal: sirve como referencia para estudiar el efecto del RL en la percepción de detalles finos, comparando su rendimiento con el modelo base Qwen3.5-9B en el mismo hardware.
- Evaluación comparativa local: permite reproducir experimentos de ZoomGainBench en un Mac mini M4 Pro, con la ventaja de que el repositorio incluye el comando exacto de `mlx_vlm generate` y la configuración de evaluación (temperatura 0, thinking desactivado).

## Benchmarks y rendimiento

Los datos proceden de la model card del conversor, evaluados sobre una porción inglesa de 200 ítems estratificados de ZoomGainBench (semilla `20261118`), con el scorer oficial y temperatura 0. Los modelos MLX se ejecutaron en una sola pasada con thinking desactivado.

| Configuracion | Overall | attr (94) | counting (19) | ocr (87) |
|---|---:|---:|---:|---:|
| Grok 4.7, hasta 2 autocrops (agéntico) | 76,23% | 75,53% | 73,68% | 77,54% |
| ZoomGain-9B MLX 4-bit (este repo), una pasada | 52,68% | 53,19% | 68,42% | 48,70% |
| Grok 4.7, una pasada sin recorte | 33,13% | 30,85% | 63,16% | 29,04% |
| Qwen3.5-9B MLX 4-bit, una pasada | 31,69% | 23,40% | 63,16% | 33,77% |

En el benchmark completo de 1.000 preguntas bilingüe, el paper reporta 32,13 para Qwen3.5-9B (30,60 en inglés) y 55,48 para ZoomGain-9B. La porción de 200 ítems en 4-bit reproduce la dirección y el margen aproximado, aunque cubre un solo idioma y una muestra menor. En comparación cara a cara contra Grok 4.7 de una sola pasada, ZoomGain-9B 4-bit acertó en solitario en 62 ítems frente a 21 de Grok (ambos correctos 46, ambos incorrectos 71); con hasta dos autocrops de Grok, la relación se invierte a 65 frente a 18.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 6,0 GB en disco; en Apple Silicon la memoria unificada necesaria para inferencia ronda los 6-8 GB, aunque no se especifica oficialmente.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con al menos 16 GB de memoria unificada; el conversor se generó y probó en un Mac mini M4 Pro de 24 GB. No está pensado para GPU NVIDIA, ya que el formato es MLX.
- Cabe en GPU consumer: sí, en equipos Apple Silicon de gama alta; no se ha verificado en GPUs NVIDIA consumer porque el formato MLX no es compatible con CUDA.
- Opciones de despliegue: `mlx-vlm` (>= 0.8.0) mediante `python -m mlx_vlm generate` o la API `load`/`generate`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es específico de MLX.
- Latencia y throughput: no disponibles. La model card no reporta tiempos de inferencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ZoomGainBench (inglés, 200 ítems) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ZoomGain-9B MLX 4-bit | ~9,41B | no disponible | 52,68% (una pasada) | other | Hugging Face (comunidad) |
| Qwen3.5-9B MLX 4-bit | ~9B | no disponible | 31,69% (una pasada) | no disponible | Hugging Face |
| Grok 4.7 (sin recorte) | no disponible | no disponible | 33,13% (una pasada) | propietaria | API de xAI |
| Grok 4.7 (hasta 2 autocrops) | no disponible | no disponible | 76,23% (agéntico) | propietaria | API de xAI |

La comparativa se limita a los modelos medidos en la model card. No se dispone de datos de otros modelos de ~9B multimodales en el mismo benchmark, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Licencia incierta: el modelo base ZoomGain-9B no declara licencia explícita y esta cuantización se etiqueta como `other`. El autor ha abierto la incidencia ZoomGain#2 en GitHub para consultar a inclusionAI y podría retirar el repositorio o cambiar la licencia según la respuesta. No se garantiza el uso comercial.
- OCR débil: la categoría de reconocimiento de texto es la peor puntuada (48,70%) y el modelo tiende a adivinar palabras plausibles cuando los caracteres son diminutos, con errores en mayúsculas y caracteres individuales.
- Sesgo de conteo: la categoría counting solo tiene 19 ítems en la muestra evaluada, por lo que los resultados no son estadísticamente robustos.
- Evaluación limitada: solo se midió inglés, 4-bit y el modelo de 9B; no se han medido la precisión en 8-bit, las preguntas en chino ni ZoomGain-4B.
- Riesgo de alucinación visual: en textos pequeños el modelo puede generar respuestas verosímiles pero incorrectas, como se documenta en los ítems 000659 y 000990.
- Dependencia de hardware Apple: el formato MLX no es portable a CUDA ni a otros backends sin reconversión.
- Conversión no oficial: es un trabajo comunitario, no una release de inclusionAI, por lo que no hay garantías de soporte ni de paridad exacta con el modelo original.
- Idiomas no verificados: aunque el paper reporta un benchmark bilingüe, esta cuantización no se ha evaluado en chino ni en otros idiomas.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/way2049/ZoomGain-9B-MLX-4bit
- Modelo base: https://huggingface.co/inclusionAI/ZoomGain-9B
- Dataset de evaluación: https://huggingface.co/datasets/inclusionAI/ZoomGainBench
- Paper: https://arxiv.org/abs/2611.14076
- Incidencia de licencia: https://github.com/inclusionAI/ZoomGain/issues/2
- Librería mlx-vlm: no disponible enlace directo en la información proporcionada
