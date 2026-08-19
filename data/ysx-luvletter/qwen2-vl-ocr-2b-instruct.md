# YSX-Luvletter/Qwen2-VL-OCR-2B-Instruct

## Resumen

El modelo **YSX-Luvletter/Qwen2-VL-OCR-2B-Instruct** es un ajuste fino (fine-tune) del modelo base **Qwen/Qwen2-VL-2B-Instruct**, desarrollado por el usuario YSX-Luvletter y publicado en Hugging Face. Está especializado en tareas de **reconocimiento óptico de caracteres (OCR)**, **conversión de imagen a texto** y **resolución de problemas matemáticos con formato LaTeX**. Se trata de un modelo multimodal (visión-lenguaje) que combina la comprensión de imágenes con generación de texto, manteniendo la arquitectura original de Qwen2-VL, un transformer con mecanismos de atención sobre parches visuales.

Con aproximadamente **2,2 mil millones de parámetros** (2.208.985.600), este modelo es relativamente ligero en comparación con otros VLM de mayor escala, lo que lo hace adecuado para entornos con recursos limitados. Su licencia **Apache 2.0** permite uso comercial sin restricciones significativas. Aunque el modelo base Qwen2-VL soporta múltiples idiomas, esta versión declara únicamente inglés como idioma de trabajo. El repositorio incluye los pesos en formato `safetensors` (4,4 GB) y es compatible con la librería `transformers` de Hugging Face.

La relevancia de este modelo radica en su enfoque específico para OCR y LaTeX, tareas frecuentes en entornos académicos y de procesamiento de documentos. Al estar basado en Qwen2-VL, hereda capacidades avanzadas de comprensión visual, como el manejo de imágenes de alta resolución y la posibilidad de procesar vídeo, aunque el fine-tune prioriza la extracción de texto y ecuaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal con atención de visión) |
| Parametros totales | 2.208.985.600 (2,2 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-VL soporta hasta 32 768 tokens, pero no se especifica para este fine-tune) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos en `safetensors` de precisión completa) |
| Idiomas soportados | inglés (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (archivo `model.safetensors` de 4,42 GB) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura **Qwen2-VL**, un transformer multimodal que procesa imágenes dividiéndolas en parches visuales y los integra con el texto mediante mecanismos de atención cruzada. El fine-tune se realizó sobre el checkpoint `Qwen/Qwen2-VL-2B-Instruct` utilizando los datasets **`unsloth/LaTeX_OCR`** y **`linxy/LaTeX_OCR`**, ambos orientados a la conversión de imágenes de fórmulas matemáticas a código LaTeX. No se especifica el número de tokens de entrenamiento ni si se emplearon técnicas como RLHF o DPO; la model card solo indica que es un ajuste supervisado para tareas de OCR, image-to-text y matemáticas.

Una característica destacable del modelo base es su capacidad para procesar imágenes de resolución variable, con un rango de tokens visuales por imagen entre 4 y 16 384, configurable mediante los parámetros `min_pixels` y `max_pixels` del procesador. Esto permite equilibrar velocidad y memoria según la complejidad de la imagen. El modelo también admite la atención con `flash_attention_2` para acelerar la inferencia y reducir el consumo de memoria, tal como se indica en el ejemplo de uso.

## Capacidades

- **OCR de imágenes**: extrae texto de imágenes, incluyendo documentos escaneados, capturas de pantalla y fotografías.
- **Conversión de fórmulas matemáticas a LaTeX**: transforma ecuaciones escritas a mano o impresas en código LaTeX, útil para documentos académicos.
- **Respuesta a preguntas visuales (VQA)**: responde preguntas sobre el contenido de una imagen, combinando comprensión visual y lingüística.
- **Diálogo conversacional multimodal**: mantiene conversaciones multi-turno donde el usuario puede referirse a imágenes previamente mostradas.
- **Procesamiento de imágenes de alta resolución**: gracias al mecanismo de parches dinámicos, puede manejar imágenes con distintas relaciones de aspecto y resoluciones.
- **Capacidades heredadas del modelo base**: comprensión de vídeos de más de 20 minutos, razonamiento complejo para operar dispositivos (agentes) y soporte multilingüe en la lectura de texto dentro de imágenes (aunque el modelo declara solo inglés como idioma de salida).

## Casos de uso

- **Digitalización de documentos académicos**: el modelo puede convertir páginas escaneadas de libros o apuntes en texto editable, incluyendo fórmulas matemáticas en formato LaTeX, facilitando la creación de versiones digitales accesibles.
- **Extracción de ecuaciones en entornos de investigación**: investigadores que trabajan con artículos científicos pueden usar el modelo para transcribir ecuaciones complejas a LaTeX, ahorrando tiempo en la redacción de documentos.
- **Asistente educativo para matemáticas**: integrado en una aplicación de tutoría, el modelo puede leer una foto de un problema matemático y proporcionar una explicación paso a paso, generando la solución en formato legible.
- **Automatización de capturas de pantalla en desarrollo de software**: los desarrolladores pueden extraer texto o código de capturas de pantalla de interfaces o documentación, integrándolo en herramientas de gestión de incidencias o documentación técnica.
- **Procesamiento de facturas y formularios**: aunque el modelo no está específicamente entrenado para KIE (extracción de información clave), su capacidad OCR permite extraer texto de facturas o formularios para su posterior procesamiento en sistemas de gestión documental.
- **Generación de contenido accesible**: convertir imágenes con texto (por ejemplo, memes, infografías) en descripciones textuales, mejorando la accesibilidad para personas con discapacidad visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. La model card menciona que el modelo base Qwen2-VL alcanza resultados de última generación en benchmarks como MathVista, DocVQA, RealWorldQA y MTVQA, pero no se proporcionan cifras concretas para esta versión ajustada. Por tanto, no es posible comparar cuantitativamente su rendimiento con otros modelos sin datos verificables.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 2,2 mil millones de parámetros en precisión `float32`, el modelo requiere aproximadamente 8,8 GB de VRAM solo para los pesos. En `bfloat16` (recomendado), el consumo se reduce a unos 4,4 GB, y con cuantización a 8 bits podría bajar a unos 2,2 GB, aunque no se proporcionan archivos cuantizados oficiales.
- **GPU recomendadas**: una GPU con al menos 6 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060) es suficiente para inferencia en `bfloat16`. Para mayor velocidad, se recomienda una GPU con soporte para `flash_attention_2`, como las series RTX 30/40 o A100/H100.
- **Compatibilidad con GPU de consumo**: sí, el modelo cabe en GPUs de consumo medio (6-8 GB de VRAM) si se usa `bfloat16` y se limita el número de tokens visuales mediante `min_pixels` y `max_pixels`.
- **Opciones de despliegue**: compatible con la librería `transformers` de Hugging Face, así como con `vLLM`, `TGI` (Text Generation Inference) y `Ollama` (si se convierte a formato GGUF). El repositorio indica compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- **Latencia y throughput**: no se dispone de datos medidos. En una GPU RTX 4090, se espera una generación de 100-200 tokens por segundo para un modelo de este tamaño, pero estos valores son estimaciones orientativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **YSX-Luvletter/Qwen2-VL-OCR-2B-Instruct** | 2,2 B | no disponible | OCR, LaTeX, matemáticas | Apache 2.0 | Hugging Face |
| **Qwen/Qwen2-VL-2B-Instruct** (base) | 2,2 B | 32 768 tokens | VLM general, visión, vídeo, agentes | Apache 2.0 | Hugging Face |
| **JackChew/Qwen2-VL-2B-OCR** | 2,2 B | no disponible | OCR (similar) | Apache 2.0 | Hugging Face |

El modelo se diferencia del base por su ajuste específico a OCR y LaTeX, lo que puede mejorar el rendimiento en estas tareas a costa de una menor generalidad. Frente a otros fine-tunes similares como `JackChew/Qwen2-VL-2B-OCR`, no hay datos comparativos publicados. No se dispone de información sobre modelos de mayor tamaño especializados en OCR (por ejemplo, TrOCR o PaddleOCR-VL) para una comparación directa.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tune de un modelo base entrenado con datos web, puede heredar sesgos de género, raza o cultura presentes en los datos de entrenamiento originales. No se han realizado evaluaciones específicas de sesgo para esta versión.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir texto incorrecto o inventado, especialmente en imágenes ambiguas o de baja calidad. En tareas de OCR, puede transcribir caracteres erróneamente si la imagen está distorsionada.
- **Limitaciones de idioma**: aunque el modelo base soporta múltiples idiomas en la lectura de imágenes, la model card declara únicamente inglés como idioma de salida. El uso en otros idiomas puede degradar la calidad de las respuestas.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones de uso militar o de vigilancia, a diferencia de otras licencias.
- **Caveats para producción**: el modelo tiene un tamaño reducido (2,2 B), por lo que su precisión en tareas complejas de OCR puede ser inferior a modelos más grandes. Además, no se proporcionan archivos cuantizados oficiales, lo que obliga a convertir los pesos si se desea desplegar en entornos con memoria limitada. La ausencia de benchmarks publicados dificulta la evaluación objetiva de su rendimiento antes de su adopción.

## Enlaces

- [Hugging Face - YSX-Luvletter/Qwen2-VL-OCR-2B-Instruct](https://huggingface.co/YSX-Luvletter/Qwen2-VL-OCR-2B-Instruct)
- [Hugging Face - prithivMLmods/Qwen2-VL-OCR-2B-Instruct (mismo modelo, autor alternativo)](https://huggingface.co/prithivMLmods/Qwen2-VL-OCR-2B-Instruct)
- [Hugging Face - JackChew/Qwen2-VL-2B-OCR (modelo similar)](https://huggingface.co/JackChew/Qwen2-VL-2B-OCR)
- [ModelScope - Qwen2-VL-OCR-2B-Instruct](https://www.modelscope.cn/models/prithivMLmods/Qwen2-VL-OCR-2B-Instruct)
- [GitHub - RajMay/OCR_Qwen2_VL (aplicación web de OCR con Qwen2-VL)](https://github.com/RajMay/OCR_Qwen2_VL)
- [GitHub - Shuaib11-Github/Qwen_OCR (herramienta OCR con Qwen2-VL)](https://github.com/Shuaib11-Github/Qwen_OCR)
