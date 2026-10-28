# Wolkyen/Pluto-1

## Resumen

Pluto-1 es un modelo de lenguaje conversacional desarrollado por el usuario Wolkyen y publicado en Hugging Face con un total de 1.170.340.608 parámetros (aproximadamente 1,17 mil millones), lo que lo sitúa en la categoría de modelos pequeños. El autor lo presenta como "el mejor modelo de 1.2b" y destaca un rendimiento "rápido" en matemáticas y uso general, además de soporte nativo de tool use (llamada a herramientas). Se distribuye con pesos en formato GGUF, lo que facilita su ejecución en entornos con recursos limitados, y el repositorio incluye la etiqueta `endpoints_compatible`, indicativa de que puede desplegarse mediante Inference Endpoints de Hugging Face.

La relevancia de este modelo es relativa: se trata de un lanzamiento de un autor individual, sin resultados de benchmarks publicados en la información disponible, sin licencia declarada y sin datos sobre el corpus de entrenamiento. La model card es extremadamente escueta (cuatro líneas) y remite a sitios externos del autor para consultar benchmarks e información adicional, pero no incluye ninguna cifra verificable en el propio repositorio. Con 0 descargas y 0 "likes" en el momento de la consulta, no existe validación por parte de la comunidad.

Por tanto, esta ficha debe leerse como una descripción de lo que el autor declara y de los datos objetivos disponibles en Hugging Face (tamaño, formato, fecha de publicación), no como una evaluación independiente de capacidades. Cualquier decisión de adopción en producción debería ir precedida de una evaluación propia, especialmente por la ausencia de licencia y de documentación técnica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no especificada en la model card; por tamaño y formato se asume transformer decoder-only, sin confirmar) |
| Parametros totales | 1.170.340.608 (aprox. 1,17 B), dato de safetensors |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye etiqueta `gguf`; niveles concretos no especificados). Pesos originales en safetensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors y GGUF |
| Tamano del repositorio | 0,7 GB |
| Fecha de creación en Hugging Face | 2026-10-28 |
| Ultima actualización | 2026-10-28 |
| Etiquetas | gguf, endpoints_compatible, conversational, region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de capas, las dimensiones del modelo, el mecanismo de atención ni el tokenizador empleado. El único dato estructural objetivo es el recuento de parámetros (1,17 B) y el hecho de que el autor lo describe como modelo "conversacional" con "native tool use", lo que sugiere un ajuste orientado a diálogo y a la emisión de llamadas a funciones, presumiblemente mediante plantillas de prompt específicas, aunque estas no se documentan.

Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF, DPO o ajuste supervisado, ni sobre innovaciones técnicas (atención lineal, decodificación especulativa, decodificación Mixture-of-Experts). La model card únicamente afirma que el modelo es "rápido" y "bueno en matemáticas y uso general", afirmaciones que no vienen acompañadas de metodología ni de métricas reproducibles. Cualquier caracterización de la arquitectura más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Tool calling / function calling "nativo", según declara el autor; no se especifica el esquema (JSON, plantilla concreta) ni se documenta el formato de las llamadas.
- Razonamiento matemático: el autor lo destaca como uno de sus puntos fuertes, sin aportar métricas.
- Uso general como asistente de propósito general.
- Capacidades multilingües: no disponibles; no se declara ningún conjunto de idiomas.
- Modo "thinking" o razonamiento extendido: no disponible.
- Visión, audio o multimodalidad: no disponibles; no hay indicios de soporte.
- Soporte de agentes y razonamiento multi-paso: no documentado, aunque el tool calling nativo es un requisito previo habitual para ello.

## Casos de uso

- Asistente conversacional ligero en local: con 1,17 B de parámetros y pesos GGUF, el modelo puede ejecutarse en CPU o en GPU de gama baja para prototipos de chat, siempre que se validen previamente la calidad y el formato de prompt, al no estar documentados.
- Clasificación y extracción de información en flujos de texto: un modelo de este tamaño es adecuado para tareas acotadas (etiquetado, resumen corto, reescritura) donde el coste por token y la latencia importan más que el razonamiento profundo.
- Enrutamiento de intenciones con function calling: si el tool calling declarado funciona según lo esperado, podría emplearse como primera capa de un sistema de agentes que decide qué herramienta invocar antes de delegar en un modelo mayor.
- Aplicaciones de demostración y educación: útil para mostrar pipelines completos de inferencia (llama.cpp, Ollama) en cursos o entornos con hardware modesto, dado el reducido tamaño del repositorio (0,7 GB).
- Preprocesado en pipelines de generación aumentada por recuperación (RAG): generación de consultas de búsqueda o reformulación de fragmentos recuperados en un sistema mayor, con verificación humana de la salida.
- Experimentación con despliegue en Hugging Face Inference Endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio está preparado para el despliegue gestionado, útil para pruebas de concepto rápidas.
- Ejercicios de matemáticas de nivel básico en aplicaciones interactivas: el autor lo presenta como fuerte en matemáticas, pero al no haber benchmarks ni contexto declarado, no se recomienda para cálculo fiable sin verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y la model card se limita a remitir a un sitio externo del autor (`wolkyen.grok.me`) que no forma parte de la información proporcionada. Las afirmaciones de "mejor modelo de 1.2b" y de buen rendimiento en matemáticas son declaraciones del autor sin evidencia adjunta.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,17 B de parámetros, no son datos medidos): aproximadamente 2,3-2,5 GB en FP16, en torno a 1,2-1,4 GB en INT8 y unos 0,7-0,9 GB en cuantización de 4 bits, a lo que hay que sumar la caché KV según la longitud de contexto (no declarada).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede alojar el modelo cuantizado (GTX 1650, RTX 3050, RTX 4060, etc.). Para FP16 sin cuantizar, se recomienda un mínimo de 6-8 GB (RTX 3060, RTX 4060 Ti). GPUs de datacenter como A100 o H100 no son necesarias y estarían infrautilizadas.
- Cabe en GPU consumer: sí, con cuantización de 4 u 8 bits en prácticamente cualquier GPU con 4 GB o más; también es viable la inferencia en CPU gracias al formato GGUF.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llamafile) para los pesos GGUF; vLLM o TGI para los pesos safetensors; Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición en ninguna configuración de hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Pluto-1 (Wolkyen) | 1,17 B | no disponible | no disponible | Hugging Face, GGUF y safetensors |
| Llama 3.2 1B Instruct (Meta) | 1,24 B | 128k (según model card pública) | Llama 3.2 Community License | Hugging Face, gated |
| Qwen2.5 1.5B Instruct (Alibaba) | 1,54 B | 32k (según model card pública) | Apache 2.0 | Hugging Face |
| SmolLM2 1.7B Instruct (Hugging Face) | 1,71 B | 8k (según model card pública) | Apache 2.0 | Hugging Face |

Los datos de contexto y licencia de los modelos comparativos provienen de sus respectivas model cards públicas y deben verificarse antes de su uso. La comparación de rendimiento con estos modelos no es posible: Pluto-1 no publica benchmarks en su repositorio, mientras que las alternativas citadas sí incluyen evaluaciones en sus fichas. La ventaja diferencial de Pluto-1 frente a ellas no está demostrada; sus desventajas objetivas son la ausencia de licencia declarada, la falta de documentación de contexto e idiomas y la inexistencia de validación comunitaria.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. No se debe desplegar en producción sin aclarar este punto con el autor.
- Sesgos desconocidos: al no documentarse el corpus de entrenamiento ni los procesos de alineación, no es posible evaluar sesgos de género, raza, idioma o ideología.
- Riesgo de alucinación elevado: los modelos de ~1 B de parámetros tienen una capacidad limitada de razonamiento y de verificación factual; es esperable que inventen datos en tareas abiertas.
- Contexto e idiomas no documentados: se desconoce la ventana máxima real y si el modelo ha sido entrenado en castellano; el rendimiento fuera del inglés (si es su idioma principal) podría degradarse notablemente.
- Afirmaciones sin respaldo: "best 1.2b model", "fastest" y "great at math" son declaraciones del autor sin benchmarks publicados en el repositorio.
- Tool calling no especificado: no se documenta el esquema de llamadas, la plantilla de prompt ni la fiabilidad del mismo; requiere validación empírica antes de integrarlo en agentes.
- Model card mínima: sin instrucciones de uso, sin ejemplos de prompt, sin limitaciones declaradas por el autor.
- Sin tracción comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de reportes de terceros sobre calidad o fallos.
- Fecha de publicación registrada como 2026-10-28, dato a tener en cuenta al evaluar la vigencia del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wolkyen/Pluto-1
- Sitio del autor para benchmarks (referenciado en la model card): https://wolkyen.grok.me
- Página de información del modelo (referenciada en la model card): https://wolkyen.grok.me/pluto
- Imagen de portada del repositorio: https://cdn-uploads.huggingface.co/production/uploads/6818da67bc9f456e84567c05/twFS6TkuPH0OhzKiY_Qzl.jpeg
- Paper, blog técnico o repositorio de código: no disponibles en la información proporcionada.
