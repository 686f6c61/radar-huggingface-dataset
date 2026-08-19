# Vita0818/Vireqo-27VT-Plus-260818

## Resumen

Vireqo-27VT-Plus-260818 es un modelo de visión-lenguaje (VLM) experimental desarrollado por Vita0818, que combina una cuantización ternaria del modelo de lenguaje Qwen3.8-27B con un proyector de visión en Q8_0. El modelo está diseñado para tareas de razonamiento acotado ("bounded-thinking") mediante un preset específico denominado Think512-Concise, que limita el presupuesto de razonamiento a 512 tokens y la respuesta máxima a 768 tokens. Se distribuye exclusivamente en formato GGUF para llama.cpp, lo que permite su ejecución en entornos con recursos limitados.

El modelo reutiliza el "payload" de lenguaje Plus (una variante del modelo base) y un proyector de visión compartido, con una arquitectura basada en Qwen3-VL. Con aproximadamente 26,9 mil millones de parámetros, la cuantización ternaria (valores -1, 0, 1) reduce drásticamente el tamaño del archivo principal, que junto al proyector ocupa 8,2 GB en el repositorio. Está pensado para entornos donde la eficiencia de memoria es crítica, aunque su carácter experimental y la falta de benchmarks públicos limitan su uso en producción sin validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-VL (basada en Qwen3.8-27B) con cuantización ternaria y proyector de visión Q8_0 |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (preset recomendado Think512-Concise); contexto máximo nativo no disponible |
| Tipos de cuantizacion | q2_0 (ternaria) para el modelo principal; Q8_0 para el proyector de visión |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer de lenguaje de gran tamaño, y aplica una cuantización ternaria (valores -1, 0, 1) mediante el proyecto Ternary-Bonsai, lo que reduce el peso del modelo a aproximadamente 0,5 bits por parámetro. El proyector de visión (mmproj) se mantiene en Q8_0 para preservar la calidad del procesamiento de imágenes. El entrenamiento específico no está documentado; la model card indica que se trata de un "producto" que reutiliza el payload de lenguaje Plus y un proyector compartido, sin aportar detalles sobre el conjunto de datos o el proceso de ajuste.

La configuración Think512-Concise define un presupuesto de razonamiento de 512 tokens, una respuesta máxima de 768 tokens, temperatura 0, repeat penalty 1.08, contexto 2048 y parallel 1. El sistema instruye al modelo a no mostrar el proceso de razonamiento y a emitir solo la respuesta final tras alcanzar el presupuesto. Esta configuración busca respuestas concisas y deterministas, aunque limita la capacidad de razonamiento extenso.

## Capacidades

- Comprensión de imágenes y texto (image-text-to-text): el modelo procesa entradas multimodales combinando el proyector de visión con el modelo de lenguaje.
- Razonamiento acotado: mediante el preset Think512-Concise, el modelo realiza un razonamiento interno limitado a 512 tokens y genera respuestas de hasta 768 tokens, sin mostrar el proceso de pensamiento.
- Generación de texto en chino e inglés: soporta ambos idiomas, con validación interna en tareas de capitales, multiplicación y problemas de gallinas y conejos.
- Lectura de gráficos y tablas: la validación de visión confirma que el modelo puede extraer valores, identificar el año más alto y calcular diferencias a partir de gráficos.
- Respuestas deterministas: con temperatura 0 y repeat penalty 1.08, las salidas son reproducibles en condiciones fijas.
- No se documentan capacidades de tool calling, agentes, audio o video.

## Casos de uso

- Análisis de documentos escaneados: el modelo puede extraer información clave de facturas, formularios o tablas en imágenes, generando resúmenes concisos gracias al preset de razonamiento acotado.
- Asistencia visual en dispositivos con poca memoria: al ocupar solo 8,2 GB en formato GGUF, es viable en portátiles o mini-PCs con GPUs de 8-12 GB, sin necesidad de hardware de servidor.
- Preguntas y respuestas sobre gráficos: útil para aplicaciones que requieren interpretar datos visuales (por ejemplo, informes de ventas o métricas) y devolver respuestas breves y directas.
- Automatización de descripciones de imágenes en aplicaciones móviles: la baja huella de memoria permite integrarlo en entornos edge con llama.cpp o LM Studio.
- Validación de contenido visual en entornos controlados: dado su carácter experimental, puede usarse en pruebas internas para verificar la precisión en tareas específicas de visión y razonamiento.
- Sistemas de atención al cliente con soporte visual básico: el modelo puede responder consultas sobre imágenes de productos o instrucciones, siempre que las respuestas se limiten a la ventana de contexto de 2048 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona validaciones internas (capitales, multiplicación, problema de gallinas y conejos, lectura de gráficos), pero no proporciona métricas cuantitativas comparables con otros modelos. No se dispone de datos de MMLU, HumanEval, GSM8K ni otros estándares.

## Requisitos de hardware

- VRAM estimada: el tamaño total del repositorio es 8,2 GB (modelo principal + proyector). En q2_0, el modelo principal podría ocupar entre 6 y 7 GB, por lo que se estima que la inferencia requiere al menos 8-10 GB de VRAM con contexto corto (2048 tokens).
- GPU recomendadas: RTX 3090, RTX 4090, A100, o cualquier GPU con 12 GB o más de VRAM. En GPUs con 8 GB podría ser ajustado, dependiendo del overhead de llama.cpp.
- Compatibilidad con GPU de consumo: sí, cabe en RTX 3060 12 GB, RTX 3080, RTX 4070, etc., siempre que se gestione la memoria.
- Opciones de despliegue: llama.cpp, LM Studio (mencionado en la model card), y potencialmente Ollama si se convierte el GGUF a un formato compatible.
- Latencia y throughput: no disponibles. Al ser un modelo de 26,9B parámetros en cuantización ternaria, la inferencia en GPU consumer debería ser razonable, pero no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de visión-lenguaje ternarios o cuantizados de tamaño similar. El modelo base Qwen3.8-27B (sin cuantizar) ofrece mayor precisión pero requiere más memoria (alrededor de 54 GB en FP16). Otros VLM cuantizados como LLaVA o MiniGPT-4 no son directamente comparables por su diferente arquitectura y tamaño. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental: con 0 descargas y 0 likes en HuggingFace, no ha sido validado por la comunidad ni sometido a benchmarks estándar.
- Razonamiento acotado: el preset Think512-Concise limita el razonamiento a 512 tokens, lo que puede resultar insuficiente para tareas complejas que requieran pasos intermedios extensos.
- Contexto limitado: el preset fija un contexto de 2048 tokens, muy por debajo de lo que soporta el modelo base (probablemente 32k o más), lo que restringe tareas de documentos largos o conversaciones multi-turno extensas.
- Sin pruebas en imágenes naturales ni video: la validación se limitó a gráficos y tablas; el rendimiento en fotografías, escenas naturales o vídeo es desconocido.
- Degradación por cuantización ternaria: la cuantización a valores -1, 0, 1 puede reducir la calidad de las respuestas en comparación con el modelo original, especialmente en tareas de razonamiento sutil.
- Idiomas limitados: solo soporta chino e inglés; otros idiomas no están cubiertos.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar información falsa o imprecisa, especialmente en tareas no validadas.
- Licencia Apache-2.0: permite uso comercial, pero al ser experimental, el autor no ofrece garantías de rendimiento o seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vita0818/Vireqo-27VT-Plus-260818
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Ternary-Bonsai-27B-gguf: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Repositorios de GitHub del autor: https://github.com/Vita0818?tab=repositories
