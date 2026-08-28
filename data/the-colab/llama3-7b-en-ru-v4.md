# The-CoLab/llama3-7b-en-ru-v4

## Resumen

El modelo `llama3-7b-en-ru-v4` es un modelo de lenguaje de 6.291 millones de parámetros desarrollado por The-CoLab, basado en la arquitectura LLaMA-3 de Meta y preentrenado desde cero con datos bilingües en inglés y ruso. Forma parte de la colección de transferencia multilingüe de The-CoLab y representa la cuarta iteración (v4) de un experimento de preentrenamiento bilingüe que utiliza un tokenizer compartido de 65 000 subpalabras diseñado específicamente para ambos idiomas.

El modelo se entrenó durante 133 600 pasos con la infraestructura TorchTitan, y los resultados de validación muestran una perplejidad de 9,37 en inglés y 9,14 en ruso, lo que indica un equilibrio razonable entre ambos idiomas. Su relevancia radica en que aborda el problema de la transferencia multilingüe en modelos de tamaño medio (7B), un área de interés para investigadores que buscan alternativas a los modelos monolingües dominantes. El repositorio incluye curvas de entrenamiento y resultados de evaluación en formato EEE para tareas como MMLU, PIQA y ECLeKTic, aunque no se publican valores numéricos de estos benchmarks en la documentación disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en LLaMA-3) |
| Parametros totales | 6.291.689.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene pesos en BF16, 12,6 GB) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Llama 3 (licencia de Meta) |
| Formato de pesos | Safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer decoder-only de LLaMA-3, con 7B parámetros y atención causal estándar. No se especifican detalles sobre el número de capas, cabezas de atención o dimensiones ocultas en la documentación, pero al estar basado en LLaMA-3 7B, se asume una configuración similar a la del modelo original de Meta (32 capas, 32 cabezas, dimensión oculta 4096). La innovación principal reside en el tokenizer compartido de 65 000 tokens (`65k_en1.0_ru1.0`), diseñado para cubrir eficientemente tanto el vocabulario inglés como el ruso, evitando la fragmentación excesiva de palabras en caracteres cirílicos.

El entrenamiento se realizó con TorchTitan, un framework de entrenamiento distribuido de Meta, durante 133 600 pasos. Los datos de entrenamiento son bilingües (inglés y ruso), aunque no se detalla la composición exacta del corpus ni la proporción entre idiomas. No se menciona el uso de RLHF, DPO ni ningún ajuste fino posterior; se trata de un preentrenamiento puro. Las curvas de pérdida de entrenamiento y validación están disponibles en el repositorio en formato CSV, lo que permite a los investigadores analizar la convergencia del modelo.

## Capacidades

- Generación de texto en inglés y ruso: el modelo puede producir texto coherente en ambos idiomas gracias a su preentrenamiento bilingüe.
- Comprensión lectora y razonamiento básico: al ser un modelo de lenguaje general, puede resolver tareas de completado, clasificación y extracción de información, aunque sin fine-tuning específico.
- Transferencia multilingüe: al compartir tokenizer y pesos entre inglés y ruso, el modelo puede aprovechar conocimientos aprendidos en un idioma para el otro, lo que es útil para tareas de traducción o cross-lingual zero-shot.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y multi-step reasoning: no disponible (no se menciona).
- Capacidades de visión o audio: no disponibles (modelo solo texto).
- Modo thinking: no disponible.

## Casos de uso

- Traducción automática EN-RU y RU-EN: aunque no está fine-tuneado específicamente para traducción, su naturaleza bilingüe permite generar traducciones aproximadas o servir como base para fine-tuning en tareas de traducción. Se podría usar con técnicas de prompting para obtener traducciones de frases cortas o párrafos.
- Generación de contenido bilingüe para marketing: empresas que necesitan producir textos publicitarios, descripciones de productos o publicaciones en redes sociales tanto en inglés como en ruso pueden usar el modelo para generar borradores en ambos idiomas con un solo modelo, reduciendo costes de infraestructura.
- Análisis de sentimiento en redes sociales: el modelo puede clasificar opiniones en inglés y ruso, por ejemplo, para monitorizar la percepción de una marca en mercados de habla rusa e inglesa. Requiere fine-tuning con datos etiquetados, pero el preentrenamiento bilingüe facilita la transferencia.
- Chatbots de atención al cliente bilingües: un chatbot desplegado con este modelo puede atender consultas en ambos idiomas sin necesidad de dos modelos separados. Su capacidad de generación de texto coherente permite mantener conversaciones multi-turno, aunque la longitud de contexto no está documentada.
- Resumen de documentos multilingües: el modelo puede resumir artículos, informes o noticias en inglés y ruso, útil para servicios de inteligencia de negocio o seguimiento de prensa internacional.
- Investigación académica en procesamiento multilingüe: el modelo sirve como punto de partida para estudiar la transferencia de conocimiento entre idiomas, la eficiencia de tokenizers compartidos y el impacto del preentrenamiento bilingüe en tareas downstream. Los datos de entrenamiento y validación publicados facilitan la reproducibilidad.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados de validación en el último paso (133 600):

| Conjunto de validación | Pérdida de entropía cruzada (nats) | Perplejidad |
|---|---|---|
| Inglés (en) | 2,2378 | 9,37 |
| Ruso (ru) | 2,2127 | 9,14 |

En cuanto a benchmarks de evaluación, el repositorio contiene resultados en formato EEE para las tareas Global MMLU (EN), Global MMLU (RU), PIQA y ECLeKTic, pero no se proporcionan valores numéricos en la documentación accesible. Por tanto, no es posible comparar el rendimiento del modelo con otros en estas tareas. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6,29 mil millones de parámetros. En BF16 (formato nativo del repo), ocupa aproximadamente 12,6 GB, por lo que se necesitan al menos 16 GB de VRAM para inferencia sin cuantización. Con cuantización a 8 bits, la huella se reduce a unos 6,5 GB; con 4 bits, a unos 3,5 GB.
- GPU recomendadas: para inferencia sin cuantizar, una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. Con cuantización 4-bit, cabe en GPUs consumer como RTX 3060 (12 GB) o RTX 4070 (12 GB).
- Compatibilidad con consumer GPU: sí, especialmente con cuantización. Un modelo de 7B es manejable en hardware de gama media-alta.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, se puede servir con vLLM, TensorRT-LLM, llama.cpp (tras conversión a GGUF), Ollama (si se convierte) o TGI (Text Generation Inference). No está desplegado en ningún proveedor de inferencia en la nube según la información disponible.
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 7B en una RTX 4090 con vLLM suele alcanzar entre 50 y 100 tokens por segundo en generación, pero esto depende de la implementación y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| The-CoLab/llama3-7b-en-ru-v4 | 6,29B | No disponible | en, ru | Llama 3 | HuggingFace |
| The-CoLab/llama3-7b-en-ru-v3 | 6,29B (estimado) | No disponible | en, ru | Llama 3 | HuggingFace |
| The-CoLab/llama3-7b-en-translated-ru | 6,29B (estimado) | No disponible | en, ru | Llama 3 | HuggingFace |
| The-CoLab/llama3-7b-en-ru-aya | 6,29B (estimado) | No disponible | en, ru | Llama 3 | HuggingFace |
| Meta-Llama-3-8B (original) | 8,03B | 8K | Multilingüe (principalmente en) | Llama 3 | HuggingFace, Meta |

Los modelos de The-CoLab son variantes del mismo experimento de preentrenamiento bilingüe, diferenciándose en la composición de los datos (v3, v4, translated-ru, aya). No se dispone de comparativas de rendimiento entre ellos. El modelo original de Meta Llama 3 8B tiene más parámetros y un contexto de 8K, pero no está especializado en ruso.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al ser un modelo preentrenado con datos web, puede heredar sesgos de género, etnia o ideológicos presentes en el corpus. No se ha realizado ninguna evaluación de sesgos.
- Riesgo de alucinación: como todo modelo de lenguaje generativo, puede producir información falsa o inventada, especialmente en tareas de hechos concretos. No se ha fine-tuneado para reducir alucinaciones.
- Limitaciones de contexto: la longitud de contexto no está documentada. Si sigue la configuración de LLaMA-3 original, sería de 8K tokens, pero no se confirma. Esto limita su uso en tareas que requieran documentos largos.
- Limitaciones de idioma: solo cubre inglés y ruso. No soporta otros idiomas, y el rendimiento en variantes dialectales o registros informales puede ser inferior.
- Restricciones de licencia: la licencia Llama 3 de Meta permite uso comercial, pero con condiciones específicas (por ejemplo, si el modelo se utiliza en productos con más de 700 millones de usuarios mensuales, se requiere una licencia comercial de Meta). Es necesario revisar los términos completos.
- Estado del modelo: es un modelo de preentrenamiento sin fine-tuning, por lo que su rendimiento en tareas específicas (chat, instrucciones, código) será limitado. No está optimizado para seguir instrucciones ni para diálogo.
- Soporte de la comunidad: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido probado ampliamente. No hay garantías de estabilidad ni soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/The-CoLab/llama3-7b-en-ru-v4
- Colección de transferencia multilingüe de The-CoLab: https://huggingface.co/collections/The-CoLab/multilingual-transfer-6a2d2b4019d4300f61a444a8
- Modelo v3 relacionado: https://huggingface.co/The-CoLab/llama3-7b-en-ru-v3
- Modelo con datos traducidos: https://huggingface.co/The-CoLab/llama3-7b-en-translated-ru
- Modelo con datos Aya: https://huggingface.co/The-CoLab/llama3-7b-en-ru-aya
- Información oficial de Llama 3 de Meta: https://developer.meta.com/ai/models/llama-3/
