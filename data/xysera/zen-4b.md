# xysera/zen-4b

## Resumen

Zen 4B es un modelo de lenguaje causal de aproximadamente 4.000 millones de parámetros desarrollado por Xysera como release público de investigación, orientado a razonamiento estructurado, seguimiento de instrucciones y resolución deliberada de problemas. Se trata de un modelo fusionado en BF16 producido mediante el primer pase completo de adaptación parameter-efficient de la compañía, cuyo pipeline de optimización (iterativo, con evaluación por checkpoints y refinamiento dirigido) no se ha hecho público en detalle.

El modelo se presenta como alternativa ligera para investigación, evaluación y prototipado local, no como modelo de producción. Su relevancia está en la tendencia actual de modelos pequeños (3-4B) especializados en razonamiento, que permiten ejecutar cargas de trabajo conversacionales y de razonamiento en hardware de consumo. La etiqueta `qwen3` en el repositorio sugiere que se basa en la arquitectura Qwen3, aunque el autor no lo confirma explícitamente en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal language model (etiqueta qwen3 en el repo) |
| Parametros totales | 4.022.468.096 (≈4,02 B) |
| Parametros activos | no disponible (no hay indicios de MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 nativo; no disponible (no hay versiones cuantizadas publicadas) |
| Idiomas soportados | Inglés (declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La model card describe Zen 4B como un modelo causal decoder-only de ~4B de parámetros. La etiqueta `qwen3` en los metadatos del repositorio de HuggingFace apunta a una base arquitectónica derivada de Qwen3, pero Xysera no publica detalles concretos de la arquitectura (número de capas, dimensiones, GQA, etc.). El release es un modelo fusionado (merged) resultante de un pase completo de adaptación parameter-efficient: según la model card, se conservaron el checkpoint base original, el adaptador QLoRA, checkpoints intermedios, estado del optimizador, tokenizador y logs de entrenamiento en almacenamiento privado, lo que confirma que el entrenamiento partió de un modelo preentrenado con adaptadores QLoRA que luego se fusionaron en los pesos.

El pipeline de entrenamiento se describe como propietario: entrenamiento iterativo con evaluación basada en checkpoints y refinamiento dirigido a razonamiento, seguimiento de instrucciones y resolución estructurada de problemas. No se publica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), como muestra el ejemplo de uso oficial.
- Razonamiento estructurado y resolución deliberada de problemas, foco declarado del modelo.
- Seguimiento de instrucciones (tag `instruction-following`).
- Compatible con la librería `transformers` y con `text-generation-inference` (tag `endpoints_compatible`).
- No hay evidencia de capacidades de vision, audio, tool calling ni thinking mode en la documentación disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con ~4B de parámetros en BF16 (unos 8 GB de pesos), se puede ejecutar en GPUs de consumo para iterar rápidamente sobre prompts y plantillas de chat.
- Investigacion en razonamiento estructurado: al ser un release de investigación con artefactos de entrenamiento documentados (QLoRA, checkpoints), es útil como objeto de estudio para analizar cómo la adaptación parameter-efficient afecta a tareas de razonamiento.
- Resolucion de preguntas de conocimiento general y sentido comun: los benchmarks internos (ARC-Easy 68,6 %, HellaSwag 61,8 %, PIQA 78,8 %, Winogrande 73,6 %) indican capacidad razonable en tareas de sentido común y razonamiento básico.
- Seguimiento de instrucciones en inglés: adecuado para tareas de transformación de texto, resumen o reformateo donde el modelo pequeño basta y se prioriza latencia.
- Evaluacion comparativa de modelos pequeños: sirve como baseline en estudios de modelos de 3-4B especializados en razonamiento, dada su licencia Apache 2.0 que permite modificaciones.
- Integracion en demos web: existe un Space público (torinriley/zen-4b-demo) que puede usarse como referencia para montar demos propias.

## Benchmarks y rendimiento

Resultados de evaluacion interna publicados por el autor (500 ejemplos por tarea, accuracy normalizada donde aplica). El propio autor advierte de que son resultados direccionales y no comparables directamente con leaderboards.

| Tarea | Puntuacion |
|---|---:|
| ARC-Easy | 68,6 % |
| HellaSwag | 61,8 % |
| PIQA | 78,8 % |
| Winogrande | 73,6 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~8-9 GB en BF16 (el repo ocupa 8,1 GB), más margen para la caché KV según la longitud de contexto. No hay versiones cuantizadas publicadas; una cuantización a 4 bits reduciría el consumo a ~2,5-3 GB.
- GPUs recomendadas: RTX 3060 de 12 GB, RTX 4070/4090 o equivalentes para BF16; cualquier GPU moderna de 12 GB o más es suficiente.
- Cabe en GPUs de consumo: sí, en BF16 en tarjetas de 12 GB; en 8 GB sería necesario cuantizar.
- Opciones de despliegue: `transformers` (ejemplo oficial con `device_map="auto"`), Text Generation Inference (tag `text-generation-inference` en el repo). No hay GGUF publicado, por lo que llama.cpp y Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles; en una GPU de consumo cabe esperar decodificación del orden de decenas de tokens por segundo para un modelo de 4B en BF16, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Licencia | Contexto | Notas |
|---|---|---|---|---|
| Zen 4B (xysera) | 4,02 B | Apache 2.0 | no disponible | Enfoque en razonamiento; benchmarks internos limitados |
| Qwen3-4B (Alibaba) | 4 B | Apache 2.0 | 32.768 (con YaRN ampliable) | Base aparente de Zen 4B según tags; benchmarks públicos extensos, modo thinking |
| Llama 3.1 8B (Meta) | 8 B | Llama Community License | 128.000 | Doble tamaño, contexto muy superior, licencia con restricciones |
| Phi-3-mini 4B (Microsoft) | 3,8 B | MIT | 4.096 (128k en versión 128k) | Tamaño similar, benchmarks públicos amplios |

Zen 4B se posiciona en la misma franja de tamaño que Qwen3-4B y Phi-3-mini, pero con una documentación y validación pública notablemente menores: carece de benchmarks estándar comparables y de datos de contexto, lo que dificulta evaluarlo frente a alternativas más documentadas.

## Limitaciones y advertencias

- El modelo no ha pasado una evaluación completa de seguridad, sesgos ni contenido dañino, según declara el propio autor.
- Riesgo de alucinación y errores factuales: la model card advierte explícitamente de errores factuales, razonamiento incompleto y cálculos incorrectos; los outputs deben verificarse de forma independiente en usos de consecuencias.
- Rendimiento desigual entre tareas, posiblemente por especialización en los datos de adaptación.
- La evaluación publicada es de tamaño limitado (500 ejemplos por tarea) y no comparable con leaderboards.
- Idioma: solo se declara soporte para inglés; el comportamiento en castellano no está documentado.
- Longitud de contexto no publicada, lo que impide planificar cargas de trabajo con documentos largos.
- Sin versiones cuantizadas ni GGUF oficiales, lo que limita las opciones de despliegue ligero.
- Licencia Apache 2.0 sin restricciones de uso comercial, pero al tratarse de un release de investigación sin auditoría de seguridad, su uso en producción exige evaluación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xysera/zen-4b
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/torinriley/zen-4b-demo
- Paper, repositorio de codigo y blog oficial: no disponibles en la informacion proporcionada.
