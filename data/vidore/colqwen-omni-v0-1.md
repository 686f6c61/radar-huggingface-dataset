# vidore/colqwen-omni-v0.1

## Resumen

ColQwen-Omni (vidore/colqwen-omni-v0.1) es un modelo de recuperación de documentos visuales y de audio desarrollado por el equipo vidore. Está basado en Qwen2.5-Omni-3B-Instruct y extiende la estrategia ColBERT para generar representaciones multi-vector tanto de texto como de imágenes y audio. El modelo permite indexar páginas de documentos a partir de sus características visuales sin necesidad de OCR, y también recuperar clips de audio mediante consultas de texto. Su relevancia radica en que unifica la recuperación multimodal (imagen, audio y texto) en un único modelo, con capacidades zero-shot para audio y generalización a otros idiomas. La arquitectura genera hasta 1024 patches de imagen con resolución dinámica, lo que mejora la precisión en documentos complejos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-Omni-3B-Instruct con estrategia ColBERT (multi-vector) |
| Parametros totales | Aproximadamente 3 mil millones (basado en Qwen2.5-Omni-3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (según ejemplo de uso) |
| Idiomas soportados | Inglés (entrenamiento), con generalización zero-shot a otros idiomas |
| Licencia | MIT |
| Formato de pesos | Safetensors |

Nota: el tamaño del repositorio es de 0,7 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente ese espacio.

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-Omni-3B-Instruct, un modelo de lenguaje multimodal, y lo extiende para generar representaciones multi-vector estilo ColBERT. En lugar de producir un único vector denso por documento, genera múltiples vectores por token, lo que permite una comparación más fina mediante late interaction (MaxSim). Las torres de visión y audio están congeladas durante el entrenamiento; las capacidades de audio se adquieren de forma zero-shot, ya que el entrenamiento se realiza exclusivamente con pares imagen-texto. El dataset de entrenamiento consta de 127.460 pares query-página, compuesto por un 63 % de datasets académicos abiertos y un 37 % de páginas web sintéticas con pseudo-preguntas generadas por Claude-3 Sonnet. Todo el entrenamiento es en inglés, pero se observa generalización a otros idiomas. El modelo acepta resoluciones dinámicas de imagen hasta un máximo de 1024 patches, sin cambiar la relación de aspecto.

## Capacidades

- Recuperación de documentos visuales: indexa páginas completas (imágenes) y las recupera mediante consultas de texto.
- Recuperación de audio: puede indexar clips de audio y recuperarlos con consultas de texto, en modo zero-shot (sin entrenamiento específico).
- Representaciones multi-vector estilo ColBERT: permite late interaction scoring para mayor precisión.
- Soporte para tool calling y agentes: no se menciona explícitamente, pero al estar basado en un modelo instruct, podría heredar capacidades del modelo base.
- Multilingüe: aunque entrenado solo en inglés, generaliza a otros idiomas de forma zero-shot.
- Resolución dinámica de imagen: no redimensiona ni cambia la relación de aspecto, mejorando la fidelidad visual.

## Casos de uso

- Búsqueda en archivos PDF escaneados: el modelo puede indexar páginas de PDF como imágenes y permitir búsquedas por texto, evitando la necesidad de OCR.
- Recuperación de documentos técnicos con gráficos y tablas: al trabajar directamente con la imagen, captura información visual que el OCR perdería.
- Búsqueda en videoconferencias o podcasts: indexar audio de reuniones o podcasts y recuperar segmentos relevantes mediante consultas de texto.
- Asistentes de documentación empresarial: permitir a empleados buscar en manuales, informes y presentaciones a partir de consultas en lenguaje natural.
- Sistemas de preguntas y respuestas sobre documentos: combinar con un LLM para responder preguntas basadas en el contenido recuperado.
- Archivado y organización de bibliotecas digitales: indexar colecciones de imágenes y audio para búsqueda semántica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se presenta como experimental (tag vidore-experimental) y no se proporcionan métricas comparativas en la model card.

## Requisitos de hardware

- El tamaño del repositorio es de 0,7 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente ese espacio.
- El ejemplo de uso indica device_map="cuda" o "mps" (Apple Silicon), por lo que puede ejecutarse en GPU NVIDIA o en Apple Silicon.
- Al ser un modelo de ~3B parámetros, es probable que quepa en GPUs consumer con al menos 8 GB de VRAM, pero no se proporcionan datos confirmados.
- Se recomienda usar flash_attention_2 si está disponible para optimizar la memoria y velocidad.
- Opciones de despliegue: se puede usar con Sentence Transformers (MultiVectorEncoder) o con colpali-engine. No se mencionan vLLM, Ollama u otros.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar. Sin embargo, se puede mencionar que el modelo es una extensión de ColPali (vidore/colpali-v1.2) y comparte la misma estrategia ColBERT. ColPali se centra solo en imágenes, mientras que ColQwen-Omni añade audio. No hay datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- Entrenamiento únicamente en inglés: aunque hay generalización zero-shot, el rendimiento en otros idiomas puede ser inferior.
- Capacidades de audio zero-shot: no entrenado específicamente para audio, por lo que el rendimiento puede ser variable.
- Modelo experimental (tag vidore-experimental): no se garantiza estabilidad para producción.
- Riesgo de alucinación en la generación de texto, aunque el modelo está diseñado para retrieval, no para generación.
- La resolución máxima de 1024 patches puede limitar el detalle en documentos muy grandes.
- No se proporcionan datos de latencia o throughput.

## Enlaces

- HuggingFace: https://huggingface.co/vidore/colqwen-omni-v0.1
- Blogpost de release: https://huggingface.co/blog/manu/colqwen-omni-omnimodal-retrieval
- Paper ColPali: https://arxiv.org/abs/2407.01449
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Repositorio GitHub de ColPali: https://github.com/ManuelFay/colpali
