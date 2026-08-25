# textilelabs/Loom-Spark

## Resumen

Loom Spark es un modelo de lenguaje de solo 7,6 millones de parámetros, desarrollado por Textile Labs y publicado en Hugging Face bajo licencia MIT. Está entrenado desde cero con un objetivo inusual: en lugar de memorizar hechos, aprende a reconocer sus propios límites y a delegar la búsqueda de información a un agente externo mediante tokens especiales de tipo `<lookup>`. Es un modelo pequeño, de tipo decoder-only, con una arquitectura similar a GPT-2 (pre-LN, GELU, embeddings atados) y una ventana de contexto de 256 tokens.

Su relevancia radica en que propone una filosofía alternativa para la IA conversacional: un modelo que no finge saber lo que no sabe, que emite consultas de búsqueda cuando tiene herramientas activadas y que puede integrarse en un harness de agente para obtener respuestas factuales de internet. Es un experimento de "IA humilde" que puede servir como base para investigar interacciones entre modelos y herramientas, o para proyectos educativos sobre agentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (pre-LN, GELU, embeddings atados, posiciones aprendidas) |
| Parametros totales | 7.558.080 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | safetensors (precisión completa) y GGUF f32 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF (f32) |

## Arquitectura y entrenamiento

Loom Spark es un transformer decoder-only con 5 capas, 5 cabezas de atención (dimensión de cabeza 64), dimensión del modelo 320 y un vocabulario de 4096 tokens (BPE personalizado entrenado sobre el corpus generado). Usa normalización pre-LN, activación GELU, embeddings atadas y posiciones aprendidas. El contexto es de 256 tokens, lo que limita conversaciones muy cortas o interacciones de herramienta simples.

El entrenamiento se realizó sobre un corpus procedimental generado por los autores (sin datasets externos), con AdamW en fp32 en CPU, durante 3.337 pasos. La pérdida final de validación fue de 0.3372. La innovación clave no está en la arquitectura sino en el objetivo de entrenamiento: se enseñó al modelo a distinguir entre lo que puede responder directamente y lo que debe delegar a una búsqueda, y a mantener una personalidad honesta y modesta.

## Capacidades

- Generación de texto en inglés con un estilo reflexivo, breve y humilde.
- Modo de herramientas activado (`<tools:on>`): emite tokens `<lookup>consulta</lookup>` para indicar que necesita buscar información, y luego integra el resultado en su respuesta.
- Modo de herramientas desactivado (`<tools:off>`): no emite tokens de búsqueda y responde honestamente que no sabe, ofreciendo buscarlo si se conecta.
- Interacción con agentes: el modelo puede ser integrado en un harness (incluido en el repo) que ejecuta búsquedas en DuckDuckGo y devuelve el resultado al modelo.
- Generación de texto en inglés con personalidad definida (curioso, amable, autoconsciente).
- No tiene capacidades de visión, audio ni multimodales.
- No soporta function calling nativo en el formato de OpenAI, pero su mecanismo `<lookup>` cumple una función similar para búsqueda.

## Casos de uso

- **Prototipos de agentes con búsqueda web**: el modelo puede servir como componente de un agente que necesita decidir cuándo buscar información en internet y cómo integrar los resultados en una conversación. El harness incluido permite probar el ciclo completo sin claves API.
- **Enseñanza de interacción con herramientas**: como ejemplo didáctico de cómo un modelo pequeño puede aprender a usar un protocolo de herramientas (lookup/result) en lugar de memorizar datos.
- **Chatbots de bajo presupuesto**: en entornos con recursos limitados (CPU, sin GPU), puede desplegarse un asistente conversacional que responde con honestidad y puede buscar información si se conecta a un servicio externo.
- **Experimentos de alineación y "humildad"**: para investigar cómo un modelo puede ser entrenado para reconocer sus límites y evitar alucinaciones, este modelo ofrece un caso extremo.
- **Generación de diálogos de ejemplo**: por su estilo de monólogo reflexivo, puede usarse para crear datasets de conversaciones cortas o para pruebas de estilo.
- **Integración en Ollama**: el repo incluye un Modelfile para ejecutarlo en Ollama, permitiendo probar el comportamiento offline en un entorno local sin configurar el harness.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no está diseñado para tareas de razonamiento o conocimiento factual, por lo que no se espera que obtenga resultados relevantes en MMLU, HumanEval u otros. Su rendimiento se evalúa en términos de su comportamiento conversacional y la calidad de sus búsquedas, no en métricas de conocimiento.

## Requisitos de hardware

- **VRAM**: con 7,6 millones de parámetros, en fp32 ocupa aproximadamente 30 MB. Cualquier GPU con más de 1 GB es suficiente, incluso sin GPU se ejecuta cómodamente en CPU.
- **GPU recomendadas**: no se requiere ninguna GPU específica; puede ejecutarse en CPU (por ejemplo, un portátil común) o en cualquier GPU moderna.
- **En consumer GPU**: sí, cualquier GPU de consumo (RTX 2060 o superior) lo ejecuta sin problemas.
- **Opciones de despliegue**: transformers (Python), llama.cpp (GGUF), Ollama (con Modelfile personalizado), y el harness incluido que actúa como servidor de chat.
- **Latencia**: en CPU, la generación de 128 tokens tarda del orden de segundos; en GPU, milisegundos. El tamaño es trivial para cualquier hardware moderno.

## Comparativa con modelos similares

No hay información disponible sobre modelos comparables de la misma categoría (tiny models entrenados con objetivos de honestidad o herramienta). El modelo es único en su enfoque, por lo que no se puede proporcionar una tabla comparativa con alternativas de iguales características.

## Limitaciones y advertencias

- **Conocimiento factual nulo**: el modelo no memoriza hechos; cualquier respuesta factual es generada por el harness de búsqueda. No debe usarse para información médica, legal, financiera o cualquier contexto donde el error tenga coste.
- **Contexto muy corto**: solo 256 tokens de ventana, lo que limita conversaciones de más de unos pocos intercambios.
- **Solo inglés**: no soporta otros idiomas.
- **Riesgo de alucinación**: aunque está entrenado para ser humilde, en modo offline puede generar respuestas inventadas si se le fuerza a contestar; se recomienda mantener el modo `<tools:off>` para evitar que emita tokens de búsqueda sin herramientas.
- **Dependencia del harness**: sin el harness que ejecuta las búsquedas, el modelo solo puede ofrecer su "no lo sé" y sugerir una consulta, no obtener la respuesta real.
- **Sin soporte para producción**: es un experimento, no un modelo para aplicaciones críticas.

## Enlaces

- [Hugging Face: textilelabs/Loom-Spark](https://huggingface.co/textilelabs/Loom-Spark)
- El repositorio en Hugging Face incluye el código del harness (en la carpeta `harness/`), el Modelfile para Ollama y el archivo GGUF. No se han encontrado otros enlaces externos oficiales.
