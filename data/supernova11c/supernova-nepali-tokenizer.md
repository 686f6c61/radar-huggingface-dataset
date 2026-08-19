# Supernova11c/Supernova-Nepali-Tokenizer

## Resumen

Supernova-Nepali-Tokenizer es un tokenizador Byte-Level BPE diseñado específicamente para el idioma nepalí y la escritura devanagari, desarrollado por el usuario Supernova11c como parte del proyecto Supernova. Su objetivo principal es resolver la ineficiencia de los tokenizadores estándar (como el de GPT-2) cuando procesan texto nepalí, que suele requerir entre 2 y 6 veces más tokens que el inglés. Este tokenizador consigue una compresión de contexto de aproximadamente 2,2 veces frente a GPT-2, con una media de 3,79 tokens por palabra frente a los 8,21 de GPT-2.

Técnicamente, emplea un pre-tokenizador basado en expresiones regulares que mantiene los grupos de consonantes y las matras (signos vocálicos) del devanagari como unidades atómicas, lo que mejora la cohesión lingüística. Su vocabulario se ha saturado en 2.637 tokens de alta frecuencia, lo que optimiza la eficiencia de los embeddings. Incluye un mecanismo de fallback a nivel de bytes que garantiza que ningún carácter Unicode quede sin representar (0% de tokens UNK). Está disponible bajo licencia MIT y se integra con la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Byte-Level BPE (model_type: gpt2) |
| Parametros totales | No aplica (tokenizador) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | ne (nepali), en (ingles) |
| Licencia | MIT |
| Formato de pesos | tokenizer.json, vocab.json (transformers) |

## Arquitectura y entrenamiento

El tokenizador utiliza un algoritmo Byte-Level BPE, que opera sobre bytes en lugar de caracteres, lo que garantiza la representación de cualquier secuencia Unicode. El normalizador aplica la forma NFC (Normalization Form Canonical Composition) para unificar caracteres equivalentes. El pre-tokenizador combina el enfoque ByteLevel con una expresión regular específica para devanagari que trata los grupos consonánticos (conjuncts) y las matras como unidades indivisibles, preservando así la estructura silábica del nepalí.

El vocabulario se ha limitado a 2.637 tokens, seleccionados por su alta frecuencia en el corpus de entrenamiento. No se han publicado detalles sobre el volumen exacto de datos ni el proceso de entrenamiento, pero la model card menciona que las pruebas se realizaron sobre el dataset `Supernova-teraillm`. No se indica el uso de técnicas como RLHF o DPO, al tratarse de un tokenizador y no de un modelo generativo.

## Capacidades

- Tokenización eficiente para nepalí y escritura devanagari, con una media de 3,79 tokens por palabra.
- Compresión de contexto 2,2 veces superior a la del tokenizador estándar de GPT-2.
- Cobertura completa de Unicode gracias al fallback a nivel de bytes: 0% de tokens desconocidos (UNK), incluyendo emojis, símbolos y conjunciones raras.
- Pre-tokenización especializada que mantiene la cohesión lingüística de los grupos consonánticos y las matras.
- Integración nativa con la librería `transformers` mediante `AutoTokenizer`.
- Soporte de tokens especiales `[PAD]`, `[UNK]`, `[BOS]` y `[EOS]`.
- Normalización NFC para unificar representaciones de caracteres.

## Casos de uso

- Entrenamiento de modelos de lenguaje nepalíes: al reducir el número de tokens por palabra, se aprovecha mejor la ventana de contexto y se reduce el coste computacional durante el preentrenamiento y la inferencia.
- Adaptación de modelos multilingües existentes al nepalí: se puede ampliar el vocabulario de un LLM con este tokenizador para mejorar su rendimiento en tareas en nepalí, como se ha hecho en experimentos similares con Qwen3-4B.
- Sistemas de traducción automática nepalí-inglés: una tokenización más compacta del nepalí reduce la latencia y mejora la calidad de la traducción al evitar divisiones arbitrarias de palabras.
- Chatbots y asistentes virtuales en nepalí: al reducir el número de tokens por mensaje, se disminuyen los costes de API y se acelera la respuesta en aplicaciones de producción.
- Análisis de sentimiento y minería de opiniones en texto nepalí: la tokenización precisa de matras y conjunciones facilita la extracción de características lingüísticas relevantes.
- Preprocesamiento de corpus nepalíes para tareas de PLN: sirve como paso previo en pipelines de clasificación de documentos, reconocimiento de entidades nombradas o resumen automático.
- Sistemas de OCR y digitalización de textos devanagari: la normalización NFC y el manejo de caracteres compuestos ayudan a tokenizar correctamente texto escaneado o con ruido.

## Benchmarks y rendimiento

Según la model card, el tokenizador fue evaluado sobre el dataset `Supernova-teraillm` con los siguientes resultados:

| Tokenizador | Tokens por palabra | Eficiencia |
| :--- | :--- | :--- |
| **Supernova-Nepali (Ultra)** | **3,79** | **2,20x mejor** |
| GPT-2 (estándar) | 8,21 | Línea base |

No se han publicado resultados adicionales en otros benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un tokenizador, no de un modelo de lenguaje completo.

## Requisitos de hardware

- No requiere GPU: al ser un tokenizador, se ejecuta íntegramente en CPU con un consumo de memoria mínimo.
- Puede ejecutarse en cualquier máquina, incluidos portátiles, servidores sin aceleración gráfica o entornos serverless.
- El tamaño del vocabulario (2.637 tokens) implica un archivo de configuración muy ligero (del orden de kilobytes).
- Se integra con `transformers` y `tokenizers`, por lo que puede usarse en pipelines de Hugging Face, así como con librerías de inferencia como vLLM o TGI (aunque estas no son necesarias para un tokenizador puro).
- La velocidad de tokenización es alta: en las pruebas de estrés de la model card se procesan decenas de miles de caracteres por segundo en CPU estándar.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros tokenizadores nepalíes específicos (como los de basnetsoyuj o sidskarkii) en la información proporcionada. La única comparación publicada es con el tokenizador estándar de GPT-2:

| Característica | Supernova-Nepali | GPT-2 (estándar) |
| :--- | :--- | :--- |
| Vocabulario | 2.637 tokens | 50.257 tokens |
| Tokens por palabra (nepalí) | 3,79 | 8,21 |
| Compresión | 2,2x mejor | Línea base |
| Cobertura Unicode | 0% UNK (fallback bytes) | Parcial (puede generar UNK) |
| Pre-tokenización devanagari | Sí (regex específica) | No |
| Licencia | MIT | MIT |

## Limitaciones y advertencias

- Vocabulario reducido (2.637 tokens): aunque el fallback a bytes evita tokens UNK, la saturación del vocabulario puede provocar que palabras poco frecuentes se dividan en múltiples tokens, reduciendo la eficiencia en dominios muy especializados.
- Enfoque exclusivo en nepalí e inglés: no está optimizado para otros idiomas o escrituras, por lo que su uso fuera de estos ámbitos puede ser subóptimo.
- No es un modelo de lenguaje: solo proporciona tokenización; no puede generar texto ni realizar tareas de razonamiento.
- No se han publicado detalles sobre el corpus de entrenamiento ni sobre posibles sesgos en los datos, por lo que no se puede evaluar su comportamiento en dominios sensibles.
- La licencia MIT permite uso comercial sin restricciones, pero se recomienda verificar la procedencia de los datos de entrenamiento si se utiliza en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Supernova11c/Supernova-Nepali-Tokenizer
- Perfil del autor en Hugging Face: https://huggingface.co/Supernova11c/models
