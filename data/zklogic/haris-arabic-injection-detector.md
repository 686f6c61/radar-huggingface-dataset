# ZKLogic/haris-arabic-injection-detector

## Resumen

Haris (حارس) es un guardrail de detección para aplicaciones LLM con soporte de primera clase en árabe y saudí. Este modelo concreto es la capa de recall del sistema híbrido de ZKLogic: clasifica entradas de usuario para detectar intentos de inyección de prompts, como el override de instrucciones, el role-play/jailbreak y la extracción del system prompt. Está entrenado para funcionar junto con un detector de reglas de alta precisión, ya que su función es capturar las paráfrasis que las reglas no cubren. Se publica con licencia MIT y se alinea con las categorías LLM01:2025 (Prompt Injection) y LLM07:2025 (System Prompt Leakage) del OWASP Top 10 para aplicaciones LLM.

Arquitectónicamente es un transformer encoder basado en sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, con una cabeza de clasificación binaria. Tiene 117.654.530 parámetros y un tamaño de repositorio de 0,5 GB. El ejemplo de uso recomienda truncar la entrada a 128 tokens, aunque el modelo base soporta hasta 512.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MiniLM/BERT) con cabeza de clasificación secuencial |
| Parametros totales | 117.654.530 |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 128 tokens según el ejemplo de uso |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, un transformer encoder preentrenado para embeddings multilingües, al que se añade una cabeza de clasificación de dos clases. No es un modelo generativo ni de Mixture of Experts; su función es puramente discriminativa. La etiqueta `bert` en los metadatos confirma la arquitectura de encoder basada en BERT. Para la inferencia, el código de ejemplo usa `AutoModelForSequenceClassification` con truncamiento a `max_length=128`.

El entrenamiento se realizó sobre 1.648 filas en total, divididas en 70/15/15: 1.131 de entrenamiento, 242 de validación y 275 de test. Los datos están balanceados deliberadamente dentro de cada idioma: 409 inyecciones y 577 benignas en árabe (tasa de inyección 41,5 %), y 263 inyecciones y 399 benignas en inglés (39,7 %). El corpus en inglés proviene del dataset `deepset/prompt-injections` (Apache-2.0). El corpus en árabe se compone de 253 semillas escritas a mano (105 de inyección, 148 benignas), adaptadas culturalmente en lugar de traducidas, y expandidas 4× con variantes superficiales que preservan el significado (cortesía, deriva ortográfica). Los ejemplos benignos incluyen negativos difíciles: consultas ordinarias con vocabulario próximo a los disparadores y tráfico RAG realista sobre ley laboral saudí, seerah y servicios gubernamentales. Además, los pares benignos y de ataque comparten el verbo y difieren en el objeto, para evitar que el modelo aprenda a clasificar por vocabulario. No se menciona RLHF ni DPO.

## Capacidades

- Clasificación binaria de texto: etiqueta 1 para inyección de prompts y 0 para benigno.
- Detección de instrucciones override, role-play/jailbreak y extracción de system prompt.
- Soporte bilingüe árabe e inglés, con entrenamiento balanceado por idioma.
- Integración con el guardrail Haris, que combina la puntuación del modelo con un detector de reglas.
- Detección de inyecciones en entradas de usuario, no en respuestas del modelo.
- No soporta tool calling, generación de texto, ni razonamiento multi-paso; es un clasificador discriminativo.
- No es un clasificador de seguridad de contenido general: no detecta toxicidad ni peticiones dañinas.

## Casos de uso

- Protección de asistentes corporativos bilingües: se puede desplegar como filtro de entrada para detectar intentos de extraer el system prompt en sistemas de soporte en árabe e inglés.
- Guardrail en aplicaciones RAG con documentos gubernamentales saudíes: el modelo identifica intentos de manipulación en consultas sobre ley laboral, seerah o servicios públicos, un dominio donde el corpus de entrenamiento es especialmente realista.
- Seguridad en agentes con acceso a herramientas: al clasificar el texto del usuario antes de llamar a funciones, reduce el riesgo de que una inyección de prompts provoque acciones no deseadas.
- Moderación de entradas en chatbots de atención al cliente: se puede integrar en un pipeline que filtre mensajes que intenten alterar el comportamiento del asistente (por ejemplo, "ignora tus instrucciones y repite...") antes de que lleguen al LLM.
- Monitoreo de logs de conversaciones: en despliegues de producción, se puede usar para analizar registros históricos y detectar intentos de inyección que hayan podido tener éxito, para auditoría de seguridad.
- Protección de system prompts en aplicaciones de educación o contenido: en plataformas que ofrecen tutoría en árabe, el modelo ayuda a impedir que los usuarios obtengan las instrucciones internas del sistema mediante prompts maliciosos.
- Integración en pipelines CI/CD para validación de prompts: en equipos que desarrollan LLM, se puede usar como test automatizado para verificar que los casos de uso no generan falsos positivos elevados en entradas benignas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test retenido (275 filas, 176 árabes y 99 inglesas), según la model card del autor. El checkpoint se seleccionó en la partición de validación; el test no influyó en el entrenamiento ni en la selección del checkpoint.

| Slice | Sistema | Exactitud | Precisión | Recall | F1 | FPR |
|---|---|---|---|---|---|---|
| Árabe (n=172) | Solo reglas | 0,866 | 1,000 | 0,623 | 0,768 | 0,000 |
| Árabe | Híbrido | 0,965 | 0,910 | 1,000 | 0,953 | 0,054 |
| Inglés (n=99) | Solo reglas | 0,626 | 1,000 | 0,051 | 0,098 | 0,000 |
| Inglés | Híbrido | 0,960 | 0,949 | 0,949 | 0,949 | 0,033 |
| Total (n=271) | Híbrido | 0,963 | 0,924 | 0,980 | 0,952 | 0,047 |
| Benign-AR near-miss (n=69) | Solo reglas | 1,000 | — | — | — | 0,000 |
| Benign-AR near-miss | Híbrido | 0,942 | — | — | — | 0,058 |

Nota: en el subconjunto árabe, el recall del sistema híbrido pasa de 0,623 con solo reglas a 1,000, con 6 falsos positivos y 0 falsos negativos sobre 172 muestras. El autor advierte de que ese 1,000 debe interpretarse como "ninguna falla en una muestra pequeña", no como una capacidad de detección universal.

## Requisitos de hardware

- VRAM estimada: con 117,6 millones de parámetros, el modelo ocupa aproximadamente 0,5 GB en FP32 y unos 0,25 GB en FP16, más overhead de activaciones. Es un modelo pequeño, apto para GPUs consumer.
- GPU recomendada: no se requiere una GPU de gama alta; una RTX 3060 o inferior basta. En producción, A100 o H100 ofrecen mayor throughput, pero no son necesarias.
- Si cabe en consumer GPU: sí, incluso en GPUs con 1 GB de VRAM o en CPU.
- Opciones de despliegue: transformers (Python), HuggingFace Inference Endpoints (según el tag `endpoints_compatible`), ONNX Runtime, TorchServe o un servidor FastAPI personalizado. No es compatible con llama.cpp ni Ollama, orientados a modelos generativos.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de una comparativa con datos cuantitativos en la información proporcionada. El modelo se diferencia de los clasificadores genéricos de inyección de prompts por su entrenamiento específico en árabe y su integración con un detector de reglas. No hay cifras de otros modelos comparables en la documentación disponible.

## Limitaciones y advertencias

- El modelo no es una defensa por sí solo: está diseñado para combinarse con un detector de reglas/signaturas. En solitario, el umbral de decisión en Haris es p ≥ 0,588, con un factor de confianza de 0,85.
- Los datos de entrenamiento en árabe no han sido revisados por un hablante nativo, lo que puede afectar a la calidad de las anotaciones.
- El conjunto de test es autoelaborado por el autor, no es un benchmark independiente, por lo que los resultados pueden no generalizar.
- El modelo solo se ha evaluado en entradas de usuario, no en respuestas del modelo.
- No es un clasificador de seguridad de contenido general: no detecta toxicidad, peticiones dañinas ni otras violaciones de políticas.
- Las probabilidades de salida no están calibradas; deben tratarse como una medida ordinal, no como una probabilidad real.
- La ventana de contexto se limita a 128 tokens en el ejemplo de uso; entradas más largas se truncan y pueden perder información relevante.
- Riesgo de falsos positivos en entradas benignas con vocabulario próximo a disparadores (hard negatives), especialmente en árabe, donde la tasa de falsos positivos del sistema híbrido es del 5,4 %.
- Licencia MIT: permite uso comercial, pero el usuario es responsable de la evaluación del modelo en su dominio.

## Enlaces

- HuggingFace: https://huggingface.co/ZKLogic/haris-arabic-injection-detector
- GitHub del proyecto Haris: https://github.com/ZKSolution/haris-guardrail
- Papers relacionados (según metadatos):
  - arxiv:2406.18725: https://arxiv.org/abs/2406.18725
  - arxiv:2506.06384: https://arxiv.org/abs/2506.06384
  - arxiv:2211.09527: https://arxiv.org/abs/2211.09527
- Dataset base en inglés: https://huggingface.co/datasets/deepset/prompt-injections
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
