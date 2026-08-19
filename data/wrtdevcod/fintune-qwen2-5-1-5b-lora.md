# wrtdevcod/fintune-qwen2.5-1.5b-lora

## Resumen

FinTune es un adaptador LoRA (r=16, alpha=32) desarrollado por wrtdevcod que afina el modelo base Qwen/Qwen2.5-1.5B-Instruct para la clasificación de sentimiento financiero en tres clases (positivo, negativo y neutral). El adaptador se entrenó con QLoRA en 4 bits sobre el dataset Financial PhraseBank (takala/financial_phrasebank), concretamente en el subconjunto `sentences_50agree` con 4.846 frases, divididas en 80/10/10 para entrenamiento, validación y prueba. El proceso de entrenamiento se realizó con un bucle personalizado en PyTorch (sin usar la clase `Trainer`) en una GPU T4 de Colab.

El modelo resuelve el problema de análisis de sentimiento en textos financieros, un área donde los modelos genéricos suelen fallar por la jerga y el contexto específico. Su relevancia radica en que ofrece una especialización ligera y eficiente sobre un modelo pequeño (1.5B parámetros), lo que permite desplegarlo en entornos con recursos limitados. El adaptador se distribuye como un repositorio de 0.1 GB en formato safetensors y se integra fácilmente con la librería `peft`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (r=16, alpha=32) sobre Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | No disponible (el adaptador ocupa 0.1 GB; el modelo base tiene 1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base) |
| Tipos de cuantizacion | Entrenado con QLoRA 4-bit; el adaptador puede cargarse sobre el modelo base en 4-bit u otras precisiones |
| Idiomas soportados | No disponible (el dataset de entrenamiento es en inglés financiero) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre Qwen2.5-1.5B-Instruct, un modelo de lenguaje basado en transformer decoder con 1.5 mil millones de parámetros. La técnica LoRA congela los pesos originales e introduce matrices de bajo rango (r=16, alpha=32) en las capas de atención y feed-forward, reduciendo drásticamente el número de parámetros entrenables. El entrenamiento se realizó con QLoRA, que cuantiza el modelo base a 4 bits para permitir el ajuste en una GPU T4 de Colab (16 GB VRAM).

El dataset Financial PhraseBank contiene frases extraídas de informes financieros y noticias, etiquetadas con sentimiento positivo, negativo o neutral. Se utilizó el subconjunto `sentences_50agree` (aquellas con al menos 50% de acuerdo entre anotadores), con 4.846 frases. El bucle de entrenamiento fue implementado manualmente en PyTorch, realizando forward pass, cálculo de pérdida, backward pass y actualización de optimizador paso a paso, sin usar la clase `Trainer` de HuggingFace. No se menciona el uso de RLHF ni DPO; se trata de un fine-tuning supervisado estándar para clasificación.

## Capacidades

- Clasificación de sentimiento financiero en tres clases: positivo, negativo y neutral.
- Generación de texto (heredada del modelo base Qwen2.5-1.5B-Instruct, aunque el adaptador está especializado en análisis de sentimiento).
- Procesamiento de textos financieros en inglés, incluyendo jerga específica del sector.
- No se documenta soporte explícito para tool calling, function calling, agentes o razonamiento multi-paso.
- No se especifican capacidades multilingües más allá del inglés.
- No se indica modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Análisis de noticias financieras para trading algorítmico: el modelo puede clasificar automáticamente el sentimiento de titulares y artículos de prensa, proporcionando señales para estrategias cuantitativas. Su precisión (88.9% en test) lo hace útil como componente de un pipeline de decisión.
- Monitoreo de sentimiento en redes sociales sobre acciones: al integrarse en un sistema que consume tweets o publicaciones de foros, el adaptador permite detectar cambios de humor del mercado en tiempo real, alertando sobre posibles movimientos de precios.
- Análisis de informes de ganancias (earnings calls): las transcripciones de llamadas con analistas pueden procesarse para extraer el tono general (positivo, negativo o neutral), ayudando a los inversores a evaluar la salud percibida de una empresa.
- Clasificación de comunicados de prensa corporativos: el modelo puede etiquetar automáticamente los comunicados de prensa de empresas, facilitando la organización y búsqueda en bases de datos documentales.
- Automatización de alertas para gestores de carteras: un sistema que combine el adaptador con reglas de negocio puede generar alertas cuando el sentimiento de un activo se vuelve extremadamente negativo o positivo, permitiendo una revisión proactiva.
- Investigación académica en NLP financiero: el adaptador puede servir como punto de partida para experimentos sobre transferencia de aprendizaje, análisis de robustez o comparación con otros métodos de fine-tuning en dominios especializados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre un conjunto de prueba reservado (N=486 frases):

| Modelo | Accuracy | Macro F1 |
|---|---|---|
| Qwen2.5-1.5B-Instruct (base) | 50.6% | 0.540 |
| Fine-tuned (adaptador LoRA) | 88.9% | 0.887 |

No se han publicado resultados adicionales en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador es muy ligero (0.1 GB), pero requiere cargar el modelo base de 1.5B parámetros. Con cuantización 4-bit, se puede ejecutar en GPUs con 4-6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para inferencia en 4-bit; para entrenamiento se usó una T4 (16 GB).
- Compatibilidad con GPU de consumo: sí, especialmente con cuantización.
- Opciones de despliegue: se puede usar con `transformers` y `peft` (como se muestra en el código de ejemplo). También es posible exportar el modelo base más el adaptador a GGUF para usar con llama.cpp u Ollama, aunque no está documentado en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA para sentimiento financiero sobre Qwen2.5). El único punto de comparación disponible es el modelo base Qwen2.5-1.5B-Instruct, que se incluye en la tabla de benchmarks. Se recomienda consultar el Hub de HuggingFace para buscar otros adaptadores similares, pero no se pueden ofrecer datos concretos sin inventar.

## Limitaciones y advertencias

- El dataset de entrenamiento está en inglés (Financial PhraseBank), por lo que el adaptador está especializado en inglés financiero y puede no funcionar bien en otros idiomas.
- El tamaño del dataset es pequeño (4.846 frases), lo que puede limitar la generalización a dominios financieros no representados en los datos.
- El modelo base puede alucinar en tareas de generación libre; el adaptador no corrige este comportamiento, solo mejora la clasificación de sentimiento.
- No se especifica la licencia del adaptador ni del modelo base en la model card, lo que genera incertidumbre sobre el uso comercial. Se debe consultar la licencia de Qwen2.5-1.5B-Instruct (Apache 2.0) y la del dataset (que puede tener restricciones).
- El adaptador solo modifica los pesos LoRA; el comportamiento general de generación del modelo base se mantiene, pero la especialización en sentimiento financiero puede interferir con otras tareas si no se gestiona adecuadamente el prompt.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/wrtdevcod/fintune-qwen2.5-1.5b-lora
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset Financial PhraseBank: https://huggingface.co/datasets/takala/financial_phrasebank
