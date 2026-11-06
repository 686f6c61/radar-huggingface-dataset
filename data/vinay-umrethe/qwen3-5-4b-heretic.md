# VINAY-UMRETHE/Qwen3.5-4B-heretic

## Resumen

Qwen3.5-4B-heretic es un fine-tuning del modelo Qwen/Qwen3.5-4B publicado por el usuario VINAY-UMRETHE en Hugging Face. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado técnicas de modificación de pesos para eliminar o reducir los mecanismos de rechazo y censura del modelo base, manteniendo la arquitectura y capacidades originales. El modelo conserva la pipeline image-text-to-text del original, lo que indica que mantiene capacidades multimodales de entrada (imagen y texto).

El modelo cuenta con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB en formato safetensors. Está pensado para desarrolladores e investigadores que necesitan un modelo conversacional sin las restricciones de alineación típicas, con licencia Apache 2.0 y compatibilidad con la librería transformers y endpoints compatibles.

Es relevante ahora porque los modelos "heretic" o "abliterated" han ganado tracción en la comunidad open source como alternativas para investigación sobre alineación, generación creativa sin restricciones y evaluación de sesgos. Sin embargo, el acceso está restringido (gated) y el modelo cuenta con muy poca tracción (25 descargas, 0 likes) en el momento de la consulta, lo que limita la evidencia empírica sobre su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5, familia qwen3_5) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE según los datos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; se asume compatible con cuantizaciones estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de la familia Qwen3.5, con capacidad de procesamiento image-text-to-text según la pipeline declarada. El tag `qwen3_5` confirma la familia arquitectónica. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el fine-tuning.

La innovación técnica declarada es el proceso "heretic" / "abliterated": una modificación de pesos orientada a eliminar los comportamientos de rechazo del modelo base. No se especifican en la información proporcionada los detalles del método (por ejemplo, si se usó directional ablation, fine-tuning supervisado o una combinación), ni si se preservaron las capacidades multimodales tras la modificación.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), lo que sugiere capacidad de comprensión visual.
- Comportamiento "uncensored" / "decensored": reduce o elimina los rechazos ante peticiones que el modelo base declinaría.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras tipo Hugging Face Inference Endpoints.
- Reproducibilidad declarada (tag `reproducible`), aunque no se detalla el procedimiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, comparándolo con el base para analizar qué se pierde y qué se gana al eliminar la capa de alineación.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa que requiera tratar temas sensibles sin que el modelo decline la petición, aprovechando la ventana de contexto del base (no confirmada).
- Evaluación de sesgos y robustez: útil como sujeto de prueba en pipelines de red-teaming para medir la facilidad con que un modelo abliterated produce contenido dañino, sesgado o inexacto.
- Prototipado de asistentes conversacionales en entornos controlados: con 4,5B parámetros cabe en GPUs de consumo, lo que permite iterar rápido en local antes de escalar a modelos mayores.
- Análisis de imágenes con descripción libre: gracias a la pipeline image-text-to-text, puede emplearse para tareas de captioning o VQA en contextos donde se requiera menor filtrado de contenido.
- Docencia y demostraciones: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado para talleres sobre fine-tuning, abliteration y despliegue de modelos open source.
- Integración en endpoints compatibles: el tag `endpoints_compatible` sugiere su uso en servicios gestionados de inferencia para aplicaciones conversacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomiendan 12-16 GB.
- VRAM estimada en cuantización 8-bit: en torno a 5-6 GB de pesos, más overhead; viable en GPUs de 8-10 GB.
- VRAM estimada en cuantización 4-bit (GGUF/AWQ/GPTQ): en torno a 3-4 GB de pesos; viable en GPUs de consumo de 6-8 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100, H100 para fp16; RTX 4060 Ti 16 GB, RTX 4070 o superiores para cuantizaciones.
- Cabe en GPU de consumo: sí, especialmente en cuantizaciones de 4 y 8 bits; en fp16 requiere GPUs de gama alta con al menos 12 GB.
- Opciones de despliegue: transformers (nativo), vLLM y TGI (si la arquitectura qwen3_5 está soportada por estas herramientas), llama.cpp/Ollama si se generan GGUF a partir de los pesos safetensors. No se confirma soporte oficial en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-heretic | 4,54B | no disponible | Apache 2.0 | Gated | Fine-tuning abliterated del Qwen3.5-4B |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | no disponible en la información | Público (presumiblemente) | Modelo original con alineación estándar |
| Otros modelos abliterated de ~4B | variable | variable | variable | variable | Existen múltiples variantes comunitarias; no se dispone de datos comparativos verificados |

No se dispone de información suficiente para comparar rendimiento (benchmarks) con alternativas. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Al ser un modelo "abliterated", es probable que genere contenido que el modelo base rechazaría; esto incluye potencialmente contenido dañino, ilegal o sexualmente explícito. No apto para producción sin filtros externos.
- Riesgo elevado de alucinación y de afirmaciones no verificadas, agravado por la eliminación de mecanismos de rechazo que podrían actuar como salvaguarda.
- No se dispone de información sobre idiomas soportados; se desconoce si conserva el multilingüismo del base.
- No se confirma que las capacidades multimodales (image-text-to-text) se hayan preservado tras la modificación de pesos.
- El acceso está restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que puede limitar su uso en pipelines automatizados.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo; el usuario asume la responsabilidad legal del contenido generado.
- Tracción muy baja (25 descargas, 0 likes) y sin benchmarks publicados: no hay evidencia independiente de calidad.
- La fecha de creación (2026-10-31) y la escasez de metadatos impiden verificar el proceso de entrenamiento y la reproducibilidad declarada.

## Enlaces

- Hugging Face: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
