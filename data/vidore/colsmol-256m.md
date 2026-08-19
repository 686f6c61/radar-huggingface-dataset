# vidore/colSmol-256M

## Resumen

ColSmolVLM-Instruct-256M (identificado como `vidore/colSmol-256M`) es un modelo de recuperación visual de documentos desarrollado por el equipo Vidore de ILLUIN Technology. Se basa en el modelo de visión-lenguaje SmolVLM-Instruct-250M y lo extiende con la estrategia ColBERT de interacción tardía multi-vector, permitiendo indexar documentos a partir de sus características visuales (layout, gráficos, tablas, texto incrustado en imágenes) sin necesidad de un paso previo de OCR. El modelo fue introducido en el marco del paper ColPali y esta versión concreta se entrenó con batch size 32 durante 3 épocas sobre un dataset de 127.460 pares consulta-página.

Su relevancia actual radica en que ofrece una alternativa ligera (256M de parámetros) a modelos de recuperación visual mucho más grandes, lo que facilita su despliegue en entornos con recursos limitados. Al estar licenciado bajo MIT y publicarse en formato safetensors, puede integrarse fácilmente en pipelines de búsqueda semántica, sistemas RAG y motores de recuperación de información para documentos digitales. El modelo está pensado principalmente para documentos tipo PDF y textos en inglés, aunque su corpus de preentrenamiento incluye cierta diversidad multilingüe.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (SmolVLM-Instruct-250M) con interacción tardía multi-vector estilo ColBERT |
| Parametros totales | 256M (según denominación del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa imágenes y texto; no se especifica ventana de contexto) |
| Tipos de cuantizacion | bfloat16 (formato de entrenamiento); no se documentan cuantizaciones específicas |
| Idiomas soportados | inglés (entrenamiento principal); posible generalización a otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una extensión de SmolVLM-Instruct-250M, un VLM compacto, al que se añade una capa de proyección final que genera representaciones multi-vector por documento y por consulta, siguiendo el esquema de interacción tardía de ColBERT. Cada imagen se convierte en una secuencia de embeddings de 128 dimensiones (uno por parche visual), y cada consulta en una secuencia de embeddings de la misma dimensionalidad. La similitud se calcula mediante MaxSim, que suma los máximos de similitud coseno entre cada vector de la consulta y los vectores del documento.

El entrenamiento se realizó con LoRA (alpha=32, r=32) aplicado a las capas transformer del modelo de lenguaje y a la capa de proyección final, usando el optimizador paged_adamw_8bit, learning rate de 5e-4 con decaimiento lineal y 2,5% de pasos de warmup, en una configuración de 4 GPUs con paralelismo de datos. El dataset de entrenamiento combina un 63% de conjuntos académicos abiertos y un 37% de páginas sintéticas extraídas de PDFs obtenidos por web crawling, con pseudo-preguntas generadas por Claude-3 Sonnet. Se verificó que ningún documento del benchmark ViDoRe estuviera presente en el conjunto de entrenamiento para evitar contaminación en la evaluación.

## Capacidades

- Recuperación visual de documentos: indexa páginas completas a partir de su representación visual, sin depender de OCR ni de extracción de texto.
- Generación de embeddings multi-vector (ColBERT-style) para consultas y documentos, con 128 dimensiones por vector.
- Interacción tardía con scoring MaxSim, que permite comparaciones eficientes entre consultas y documentos.
- Soporte para imágenes de documentos heterogéneos: gráficos, tablas, diagramas, texto en columnas, etc.
- Integración nativa con Sentence Transformers mediante la clase `MultiVectorEncoder` y con la librería `colpali-engine`.
- Capacidad multilingüe limitada: aunque el entrenamiento es en inglés, el modelo base (SmolVLM) fue preentrenado con datos multilingües, lo que puede permitir cierta generalización a otros idiomas.

## Casos de uso

- Búsqueda semántica en archivos PDF escaneados: el modelo indexa la página completa como imagen, permitiendo encontrar documentos por su contenido visual (por ejemplo, "¿en qué página aparece el gráfico de ingresos trimestrales?").
- Recuperación de información en facturas y recibos: permite localizar campos específicos (importes, fechas, proveedores) sin necesidad de extraer texto previamente.
- Sistemas RAG con documentos visuales: se puede usar como retriever en un pipeline de generación aumentada por recuperación donde las fuentes son documentos con layout complejo.
- Indexación de bibliotecas digitales de informes, papers y presentaciones: facilita la búsqueda por contenido gráfico o estructural, no solo por texto.
- Automatización de revisión de contratos y documentos legales: permite encontrar cláusulas o secciones relevantes mediante consultas en lenguaje natural sobre las imágenes de las páginas.
- Búsqueda en capturas de pantalla o imágenes de documentos generados por herramientas de ofimática: útil en entornos empresariales donde los documentos se comparten como imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas numéricas de ViDoRe ni comparaciones con otros modelos. El paper ColPali reporta resultados para la arquitectura general, pero no para esta variante específica de 256M. Por tanto, no se dispone de datos verificables de rendimiento.

## Requisitos de hardware

- Tamaño del repositorio: 0,6 GB, lo que sugiere que el modelo en bfloat16 ocupa aproximadamente 0,5 GB en memoria (256M parámetros × 2 bytes).
- VRAM estimada para inferencia: con bfloat16, unos 1-2 GB para el modelo más overhead de activaciones; con cuantización a 8 bits podría caber en menos de 1 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060) es suficiente para inferencia. También es viable en CPU con llama.cpp u otras herramientas, aunque la latencia será mayor.
- Opciones de despliegue: Sentence Transformers (con soporte de imagen), colpali-engine, Hugging Face Transformers. No se menciona soporte nativo para vLLM u Ollama en la documentación.
- Latencia y throughput: no se proporcionan datos oficiales; al ser un modelo pequeño, se espera una latencia baja en GPU moderna (del orden de decenas de milisegundos por documento), pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con alternativas como ColPali (basado en PaliGemma-3B) o ColQwen (basado en Qwen2-VL). Se puede señalar que `colSmol-256M` es significativamente más pequeño que esos modelos (256M frente a 3B o más), lo que implica menor huella de memoria y mayor velocidad, pero probablemente menor precisión en tareas complejas. No hay datos de benchmarks que respalden esta afirmación, por lo que se considera "no disponible" la comparación numérica.

## Limitaciones y advertencias

- Enfoque principal en documentos tipo PDF y en idiomas de altos recursos (inglés); la generalización a otros formatos o idiomas puede ser limitada.
- Riesgo de alucinación en la generación de pseudo-preguntas del dataset sintético, aunque esto afecta al entrenamiento, no directamente a la inferencia.
- La model card advierte que las versiones recientes de `colpali-engine` (posteriores a 0.3.11) cambiaron el formato de las consultas (eliminaron el prefijo "Query: " y el salto de línea final), por lo que los embeddings generados con la configuración actual de esa librería difieren de los de entrenamiento. Se recomienda usar Sentence Transformers para reproducir el formato original.
- No se documentan sesgos específicos, pero al estar entrenado principalmente con datos en inglés y de dominios académicos, puede tener un rendimiento inferior en dominios muy especializados o en idiomas no europeos.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye tal cual, sin garantías implícitas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vidore/colSmol-256M
- Repositorio del modelo base: https://huggingface.co/vidore/ColSmolVLM-Instruct-256M-base
- Paper ColPali: https://arxiv.org/abs/2407.01449
- Paper ColBERT: https://arxiv.org/abs/2004.12832
- Paper LoRA: https://arxiv.org/abs/2106.09685
- Repositorio oficial de ColPali: https://github.com/ManuelFay/colpali
- Benchmark ViDoRe: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
