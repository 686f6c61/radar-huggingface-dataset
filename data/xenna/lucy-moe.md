# Xenna/Lucy-MOE

## Resumen

Lucy-MOE (también denominado Epsilon o Lucy) es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por el autor Xenna, con una arquitectura base Gemma4. Según la model card, se trata de un modelo de 26 000 millones de parámetros totales, de los cuales aproximadamente 4 000 millones se activan por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia en hardware de consumo. El modelo se distribuye en formato GGUF cuantizado con IQ3_M (con imatrix) e incluye un proyector de visión (mmproj) que le confiere capacidades multimodales.

El modelo está diseñado para conversación y tareas de texto e imagen, con una ventana de contexto de 65 536 tokens por defecto y un máximo de 262 144 tokens. Aunque el repositorio contiene también pesos en safetensors (según el dato de parámetros totales), la distribución principal es en GGUF, orientada a su uso con llama.cpp y servidores compatibles. La licencia se indica como "other", sin especificar términos concretos, lo que limita su uso comercial sin verificación previa.

La relevancia de este modelo radica en su combinación de arquitectura MoE con cuantización agresiva y soporte multimodal, lo que permite ejecutarlo en GPUs de gama media con una huella de memoria reducida. No obstante, la información pública es escasa: no se han publicado benchmarks, detalles de entrenamiento ni documentación adicional, por lo que su adopción en producción requiere una evaluación empírica por parte del usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 (Mixture-of-Experts) |
| Parametros totales | 25 233 142 046 (dato real de safetensors; la model card indica 26B) |
| Parametros activos | ~4 000 000 000 (4B) |
| Longitud de contexto | 65 536 (por defecto) / 262 144 (máximo) |
| Tipos de cuantizacion | IQ3_M (imatrix) para el modelo principal; Q8_0 para el proyector de visión |
| Idiomas soportados | no disponible |
| Licencia | other (sin especificar términos) |
| Formato de pesos | GGUF (modelo principal y mmproj); safetensors presente en el repositorio |

## Arquitectura y entrenamiento

La arquitectura de Lucy-MOE se basa en Gemma4, una familia de modelos de Google que emplea un diseño transformer con capas de atención. La variante MoE (Mixture-of-Experts) activa solo una fracción de los parámetros por token: en este caso, aproximadamente 4 000 millones de los 26 000 millones totales, lo que reduce el coste computacional por inferencia manteniendo una capacidad de conocimiento amplia. El modelo se distribuye en cuantización IQ3_M con imatrix, una técnica que optimiza la asignación de bits según la importancia de los pesos, y se acompaña de un proyector de visión (mmproj) en Q8_0 que permite procesar entradas de imagen.

No se dispone de información sobre el proceso de entrenamiento: no se documentan el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card menciona que el modelo fue construido a partir de una compilación reciente de llama.cpp (build 10683) con backend Vulkan, lo que sugiere un enfoque orientado a la inferencia local más que a un entrenamiento desde cero. Tampoco se especifican innovaciones técnicas adicionales más allá de la cuantización y el soporte multimodal.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como "conversational" y puede mantener diálogos multi-turno.
- Procesamiento multimodal: incluye un proyector de visión (mmproj) que permite entrada de imágenes junto con texto.
- Contexto largo: soporta hasta 262 144 tokens de contexto, adecuado para documentos extensos o conversaciones prolongadas.
- Eficiencia de inferencia: al ser MoE con solo ~4B parámetros activos, el coste por token es reducido en comparación con modelos densos de tamaño similar.
- Compatibilidad con llama.cpp: puede ejecutarse mediante llama-server, llama-cli u otras herramientas del ecosistema, con soporte para backend Vulkan y CUDA.
- Cuantización optimizada: el uso de IQ3_M con imatrix reduce la huella de memoria sin degradación excesiva de calidad, aunque no se han publicado métricas que lo confirmen.

No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso explícito ni modos de "thinking" especiales. Tampoco se especifican capacidades multilingües concretas.

## Casos de uso

No se han documentado casos de uso específicos por parte del autor. A partir de las capacidades declaradas, se pueden plantear los siguientes escenarios plausibles:

- Asistente conversacional local: el modelo puede desplegarse en una máquina con GPU de gama media para mantener chats de larga duración gracias a su contexto de 65 536 tokens por defecto, sin depender de servicios en la nube.
- Análisis de documentos extensos: con una ventana de hasta 262 144 tokens, es posible procesar manuales, informes o libros completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas sobre el contenido.
- Descripción de imágenes: gracias al proyector de visión, puede generar descripciones o responder preguntas sobre fotografías o diagramas, útil en aplicaciones de accesibilidad o documentación automática.
- Prototipado de chatbots con contexto largo: desarrolladores pueden integrarlo en aplicaciones de atención al cliente donde se requiera recordar interacciones previas durante sesiones extensas.
- Experimentación con MoE en hardware limitado: al tener solo ~4B parámetros activos, sirve como banco de pruebas para evaluar el rendimiento de arquitecturas MoE en GPUs de 8-12 GB de VRAM.
- Generación de contenido asistida por imagen: combinar texto e imagen para crear borradores de artículos, guiones o publicaciones que incluyan referencias visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo. Tampoco se ofrecen comparativas con modelos similares. Se recomienda realizar una evaluación propia antes de considerar su uso en entornos de producción.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF principal pesa aproximadamente 13.2 GB (según el tamaño del repositorio). Con cuantización IQ3_M, el modelo en memoria puede ocupar entre 11 y 13 GB, dependiendo del overhead de contexto y del proyector de visión. Se recomienda una GPU con al menos 16 GB de VRAM para operar con comodidad.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), A100 (40 GB) o superiores. En GPUs con 12 GB podría ser posible con contexto reducido y offloading parcial de capas a CPU.
- Compatibilidad con hardware consumer: sí, es viable en GPUs de gama alta para consumidores, siempre que se gestione la memoria con cuidado.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (si se convierte el GGUF), vLLM (si se convierte a formato compatible), TGI (con adaptaciones). La model card muestra un ejemplo de uso con llama-server y backend Vulkan.
- Latencia y throughput: no se han publicado datos. Como referencia orientativa, un MoE de 4B activos en una RTX 4090 podría alcanzar decenas de tokens por segundo, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. No se conocen modelos de la misma categoría (MoE de ~26B totales con ~4B activos y arquitectura Gemma4) con datos públicos de rendimiento. Se sugiere comparar con modelos como Gemma 2 27B (denso) o Mixtral 8x7B (MoE), pero no se dispone de resultados de Lucy-MOE para contrastar.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se garantiza el uso comercial. Es necesario contactar con el autor o revisar los archivos del repositorio para conocer los términos exactos.
- Ausencia de benchmarks: no hay evidencia pública de calidad de generación, razonamiento o seguridad. El rendimiento real es desconocido.
- Cuantización agresiva: IQ3_M puede introducir degradación en tareas complejas, especialmente en matemáticas o código, aunque no se ha medido.
- Sin documentación de entrenamiento: se desconoce el dataset, el proceso de alineación y los posibles sesgos incorporados.
- Riesgo de alucinaciones: al no haber evaluación publicada, no se puede estimar la fiabilidad factual del modelo.
- Soporte multimodal limitado: el proyector de visión está cuantizado a Q8_0, lo que puede afectar a la precisión en tareas de visión detalladas.
- Modelo poco conocido: con 0 descargas y 0 likes en el momento de la consulta, no hay comunidad ni soporte establecido.

## Enlaces

- HuggingFace: https://huggingface.co/Xenna/Lucy-MOE
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios adicionales) en la búsqueda web. Los resultados de SeaArt y PixAI no están relacionados con este modelo.
