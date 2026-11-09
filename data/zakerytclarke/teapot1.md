# zakerytclarke/teapot1

## Resumen

teapot1 es un conjunto de checkpoints publicado por zakerytclarke en Hugging Face, derivado de un entrenamiento desde cero (from-scratch) de un modelo causal-LM de aproximadamente 135 millones de parámetros, identificado internamente como `teapot-SmolLM2-135M-2191bc`. El repositorio incluye dos subcarpetas: el modelo base tras 3.000.238.080 tokens de preentrenamiento y una copia con ajuste supervisado (SFT) sobre ese mismo base, que es la variante capaz de responder preguntas de SQuAD. Se distribuye en formato safetensors y se carga mediante la librería transformers con `trust_remote_code=True`.

El modelo se enmarca en el proyecto Teapot, una iniciativa de lenguaje pequeño orientada a ejecución local en dispositivos con recursos limitados (smartphones y CPUs), según la descripción del repositorio GitHub del autor. La model card de teapot1, sin embargo, es extremadamente escueta: no documenta arquitectura detallada, dataset, hiperparámetros ni resultados de evaluación, más allá de mencionar el parámetro `reasoning_effort` (con valor 1 durante las evaluaciones guardadas) que permite ejecutar más pasadas del decodificador.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigación temprano, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada ni idiomas especificados. Resulta útil como referencia para quienes siguen el desarrollo de modelos pequeños entrenados desde cero y con decodificación iterativa configurable, pero no constituye una opción recomendable para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal-LM (detalles no disponibles; identificador interno `SmolLM2-135M`) |
| Parámetros totales | ~135 millones (según el nombre del run) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un causal-LM de tipo transformer con aproximadamente 135 millones de parámetros, entrenado desde cero según la model card. El identificador del run, `teapot-SmolLM2-135M-2191bc`, sugiere una configuración inspirada en SmolLM2-135M, aunque no se detalla la arquitectura exacta (número de capas, dimensión oculta, cabezas de atención ni tipo de atención). El preentrenamiento alcanzó 3.000.238.080 tokens, cifra que figura en el nombre de la carpeta `pretrain_3000238080tok`.

Sobre el modelo base se generó una copia con ajuste supervisado (`pretrain_3000238080tok_sft`), que es la que responde a SQuAD según la model card. No se especifican la composición del dataset de preentrenamiento, el dataset de SFT, ni si hubo etapas de RLHF o DPO. La innovación técnica destacable es el parámetro `reasoning_effort`: durante las evaluaciones guardadas se usó el valor 1, y valores superiores en `generate` ejecutan más pasadas del decodificador, lo que sugiere un esquema de decodificación iterativa o de razonamiento multi-paso configurable en tiempo de inferencia. No hay información sobre decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto autoregresiva como causal-LM.
- Respuesta a preguntas extractivas sobre SQuAD en la variante SFT (`pretrain_3000238080tok_sft`).
- Decodificación iterativa configurable mediante el parámetro `reasoning_effort` en `generate`, que permite aumentar el número de pasadas del decodificador.
- Carga mediante transformers con `trust_remote_code=True` y selección de subcarpeta con `subfolder`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling, function calling, capacidades de agente, multilingüismo, visión y audio: no disponibles según la información proporcionada.

## Casos de uso

- Evaluación de modelos pequeños entrenados desde cero: teapot1 sirve como referencia reproducible para estudiar el efecto de 3.000 millones de tokens de preentrenamiento en un transformer de 135M, comparando el checkpoint base con su versión SFT.
- Investigación sobre decodificación iterativa: el parámetro `reasoning_effort` permite experimentar con distintas profundidades de cómputo en inferencia sobre el mismo modelo, útil para estudiar la relación entre pasadas del decodificador y calidad de respuesta.
- Respuesta a preguntas extractivas en entornos de prueba: la variante SFT responde a SQuAD, por lo que puede integrarse en prototipos de QA sobre documentos estructurados similares, siempre con validación propia.
- Despliegue en dispositivos con recursos muy limitados: con 135M de parámetros y pesos safetensors de un repositorio de 1,6 GB (que incluye ambos checkpoints), el modelo es candidato para pruebas en CPU y dispositivos móviles, en línea con el objetivo del proyecto Teapot.
- Docencia y formación: un modelo de este tamaño y con dos etapas claramente separadas (base y SFT) es adecuado para explicar el ciclo preentrenamiento-ajuste supervisado en cursos de aprendizaje automático.
- Base para ajuste fino propio: al ser un checkpoint from-scratch con licencia no declarada, puede usarse en experimentos internos de fine-tuning para tareas específicas de dominio, verificando antes las condiciones legales de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que `reasoning_effort` tomó el valor 1 durante las evaluaciones guardadas, sin detallar qué evaluaciones ni sus métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~135M de parámetros en fp16 se estiman del orden de 0,3 GB de pesos, y en fp32 alrededor de 0,6 GB, cifras orientativas no confirmadas por el autor.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) debería alojarlo con holgura.
- Compatibilidad con GPU consumer: previsiblemente sí en la mayoría de tarjetas con 4 GB o más de VRAM, aunque no hay confirmación del autor.
- Opciones de despliegue: transformers con `trust_remote_code=True` y `subfolder`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| teapot1 | ~135M | no disponible | no disponible | Hugging Face (0 descargas) |
| SmolLM2-135M | 135M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| instruct-teapot (mismo autor) | ~800M según GitHub | no disponible | no disponible | Hugging Face, sin model card |

La comparación con SmolLM2-135M es pertinente por el identificador del run, pero no se dispone de datos de rendimiento de teapot1 para contrastar métricas. instruct-teapot, del mismo autor, se describe en GitHub como un modelo de ~800M orientado a responder solo con contexto de documentos, pero su model card en Hugging Face está vacía.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; es imprescindible contactar con el autor antes de cualquier uso en producción.
- Idiomas no especificados: se desconoce si el modelo tiene capacidad multilingüe o está limitado al inglés de SQuAD.
- Model card mínima: no hay información sobre dataset, sesgos, alucinación ni evaluación, lo que impide valorar su fiabilidad.
- Riesgo de alucinación: no cuantificado; en un modelo de 135M entrenado con 3.000 millones de tokens, la tendencia a generar contenido incorrecto es previsiblemente alta, aunque no hay datos que lo confirmen.
- Contexto desconocido: sin longitud de contexto documentada, no es posible planificar conversaciones multi-turno ni tareas de contexto largo.
- Requiere `trust_remote_code=True`: implica ejecutar código del repositorio, con el riesgo de seguridad asociado; conviene auditar los archivos antes de cargarlo.
- Adopción nula: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Fecha de creación futura en los metadatos (2026-11-08): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/zakerytclarke/teapot1
- GitHub del proyecto: https://github.com/zakerytclarke/teapot
- instruct-teapot en Hugging Face: https://huggingface.co/zakerytclarke/instruct-teapot
