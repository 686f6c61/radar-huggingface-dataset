# Zhetan3/hw1-hc3-detector

## Resumen

Zhetan3/hw1-hc3-detector es un clasificador binario de texto en inglés construido a partir de sentence-transformers/all-MiniLM-L6-v2, un transformer tipo BERT de 22.713.986 parámetros, al que se le ha añadido una cabeza de clasificación para distinguir respuestas humanas de respuestas generadas por ChatGPT. El modelo fue publicado en Hugging Face el 2 de octubre de 2026 por el usuario Zhetan3 y ocupa 0,1 GB en el repositorio. Su pipeline declarado es text-classification y se distribuye en formato safetensors para la librería transformers.

El modelo resuelve una tarea muy acotada: la detección de texto generado por IA dentro del corpus HC3 (Human ChatGPT Comparison Corpus), un conjunto de pares pregunta-respuesta en inglés procedente de foros de preguntas y respuestas. La model card documenta un accuracy de test del 98,56% sobre 4.668 ejemplos, frente al 84,49% de una línea base de regresión logística sobre embeddings congelados. Se trata de un artefacto académico (el propio autor lo etiqueta como "Homework 1") y no de un detector de propósito general.

Su relevancia es doble. Por un lado, es un ejemplo reproducible y de coste mínimo de fine-tuning de un encoder pequeño para una tarea de clasificación; por otro, sirve como ilustración de los límites de los detectores de IA: el propio autor advierte que los resultados solo aplican al split de test de HC3 y no permiten afirmar una detección fiable de texto generado por modelos actuales. La licencia, los idiomas soportados y buena parte de los detalles de entrenamiento no están documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM), con cabeza de clasificación de secuencias de 2 clases |
| Parámetros totales | 22.713.986 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usó una longitud máxima de secuencia de 256 tokens |
| Tipos de cuantización | no disponibles (no se documentan versiones GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | no disponible; el corpus de entrenamiento (HC3) es en inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | sentence-transformers/all-MiniLM-L6-v2 |
| Tarea (pipeline) | text-classification (clasificación binaria: 0 = human, 1 = ChatGPT) |
| Librería | transformers |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de un encoder transformer tipo BERT en su variante MiniLM, el mismo backbone de sentence-transformers/all-MiniLM-L6-v2, con 22.713.986 parámetros. Sobre ese encoder se ha añadido una cabeza de clasificación de secuencias para dos etiquetas: `0 = human` y `1 = ChatGPT`. No hay evidencia de que se trate de un modelo MoE, híbrido ni basado en SSM; es un transformer denso de tamaño reducido.

El entrenamiento se realizó sobre el corpus HC3, con un reparto del 80% para entrenamiento, 10% para validación y 10% para test, agrupando por pregunta (grouped by question) con semilla 42 para evitar fugas de información entre splits. Se aplicaron 5 épocas con tasa de aprendizaje 2e-5, tamaño de lote 32 y longitud máxima de secuencia de 256 tokens. La model card no especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF, DPO o similares. La innovación documentada es metodológica más que arquitectónica: se compara el fine-tuning completo contra una línea base de regresión logística sobre embeddings congelados, que alcanza un 84,49% de accuracy en test frente al 98,56% del modelo ajustado.

## Capacidades

- Clasificación binaria de texto: etiqueta una respuesta como humana (`0`) o generada por ChatGPT (`1`).
- Detección de texto generado por IA en el dominio del corpus HC3 (respuestas en inglés a preguntas de foros).
- Inferencia de muy bajo coste: al tener 22,7 M de parámetros puede ejecutarse en CPU y en GPUs de gama baja.
- Integración estándar con transformers (`pipeline("text-classification")`) y compatibilidad declarada con Text Embeddings Inference y con endpoints compatibles de Hugging Face (tags `text-embeddings-inference` y `endpoints_compatible`).
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión, audio ni modo "thinking".
- Capacidades multilingües: no documentadas; el entrenamiento se realizó sobre un corpus en inglés.
- Longitud de entrada limitada: el entrenamiento se hizo con secuencias de 256 tokens como máximo, por lo que textos más largos requieren truncado o segmentación.

## Casos de uso

- Moderación de foros de preguntas y respuestas en inglés: el clasificador permite marcar automáticamente respuestas sospechosas de haber sido generadas por ChatGPT en comunidades tipo Stack Exchange o Quora, con un coste de cómputo mínimo por petición.
- Curación de datasets de entrenamiento: filtrar respuestas sintéticas antes de reutilizar un corpus de QA, reduciendo la contaminación por texto generado en datasets posteriores.
- Investigación en detección de texto generado por IA: sirve como línea base reproducible (98,56% de accuracy sobre el split de test de HC3) para comparar contra arquitecturas alternativas como Mamba, RetNet, ELECTRA o RoBERTa.
- Triaje en pipelines de anotación humana: priorizar las respuestas con mayor probabilidad de ser sintéticas para que los anotadores revisen primero los casos dudosos, en lugar de revisar el corpus completo.
- Auditoría de integridad académica sobre respuestas textuales cortas en inglés: como señal auxiliar dentro de un flujo con revisión humana, nunca como evidencia concluyente.
- Detección en cascada de bajo coste: usar este modelo como primer filtro (22,7 M de parámetros) y reservar un modelo mayor y más caro solo para los casos con probabilidad intermedia.
- Monitorización de deriva (drift): medir de forma periódica el accuracy sobre muestras etiquetadas nuevas para cuantificar cuánto se degrada el detector a medida que cambian los modelos generativos.
- Despliegue en entornos con recursos limitados: servicio de clasificación en CPU o en dispositivos edge, donde un modelo de miles de millones de parámetros no es viable.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible son los de la propia model card, medidos sobre el split de test de HC3 (4.668 ejemplos):

| Métrica | Valor |
|---|---|
| Accuracy de test (modelo fine-tuneado) | 98,56% |
| Accuracy de test (línea base de regresión logística con embeddings congelados) | 84,49% |
| Ejemplos de test | 4.668 |
| Errores: respuestas humanas clasificadas como ChatGPT | 67 |
| Errores: respuestas de ChatGPT clasificadas como humanas | 0 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark generalista en la información disponible, y no tendría sentido esperarlos: el modelo no es generativo y solo resuelve una tarea de clasificación binaria en un dominio concreto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en cualquier precisión. Con 22.713.986 parámetros, el peso ocupa aproximadamente 91 MB en fp32, 45 MB en fp16 y 23 MB en int8, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo está muy por debajo de la capacidad de cualquiera de ellas.
- Cabe holgadamente en GPU de consumo y también en CPU: es viable en portátiles, Raspberry Pi de gama alta y contenedores sin acelerador.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (tag `endpoints_compatible`), Text Embeddings Inference (tag `text-embeddings-inference`), servidores de inferencia estándar sobre transformers y exportación manual a ONNX. No hay versiones GGUF publicadas, por lo que Ollama y llama.cpp no están soportados de fábrica.
- Latencia y throughput: no disponibles. No hay mediciones publicadas en la información proporcionada; por el tamaño del modelo, se espera una latencia del orden de milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero se trata de una estimación por tamaño y no de un dato medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en HC3 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zhetan3/hw1-hc3-detector | 22,7 M | 256 tokens de entrenamiento | 98,56% de accuracy | no disponible | Hugging Face, 0 descargas |
| jainatharva21/hw1-hc3-detector | no disponible (mismo enfoque declarado: all-MiniLM-L6-v2) | no disponible | no disponible | no disponible | Hugging Face |
| Aishkrish/hw1-hc3-detector | no disponible (mismo enfoque declarado) | no disponible | no disponible | no disponible | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 (modelo base) | ~22,7 M | 256 tokens | no aplica (no es un clasificador; produce embeddings) | no disponible en la información proporcionada | Hugging Face, ampliamente utilizado |

Los tres modelos `hw1-hc3-detector` localizados (Zhetan3, jainatharva21 y Aishkrish) parecen corresponder al mismo ejercicio académico con el mismo modelo base y la misma tarea, por lo que la comparación relevante es contra el backbone original, que no realiza clasificación y solo genera embeddings de frases.

## Limitaciones y advertencias

- Advertencia explícita del autor: los resultados solo aplican al split de test de HC3 y no establecen una detección fiable de texto generado por IA actual. El modelo detecta el estilo de ChatGPT tal y como aparece en HC3, no el de modelos posteriores.
- Sesgo direccional claro en los errores: de los 67 fallos, los 67 son respuestas humanas clasificadas como ChatGPT y 0 son respuestas de ChatGPT clasificadas como humanas. Esto implica una tasa de falsos positivos elevada sobre texto humano y un sesgo sistemático hacia la etiqueta `1 = ChatGPT`, que puede penalizar injustamente a usuarios reales.
- Dominio y idioma limitados: el corpus HC3 es en inglés y proviene de un tipo concreto de foro de preguntas y respuestas. El rendimiento fuera de ese dominio, en otros géneros textuales o en otros idiomas, no está evaluado y previsiblemente será muy inferior.
- Cobertura restringida: el modelo solo distingue humano frente a ChatGPT. No está entrenado para detectar texto de otros modelos generativos (Claude, Gemini, Llama, Mistral, etc.).
- Vulnerabilidad a evasión: cualquier paráfrasis, reescritura o edición humana del texto generado puede alterar la clasificación. No hay evaluación adversarial publicada.
- Longitud de entrada: el entrenamiento usó 256 tokens como máximo, por lo que textos largos se truncan y pierden información contextual.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas presentadas con una probabilidad alta y sin calibración documentada.
- Licencia no disponible: al no especificarse licencia, no hay autorización explícita de uso comercial. Cualquier uso en producción debería aclararse antes con el autor.
- Model card autogenerada: no incluye evaluación de sesgos, ni análisis por subgrupos, ni detalles sobre el dataset de entrenamiento más allá del reparto de splits. El modelo tiene 0 descargas y 0 likes, por lo que no ha pasado por validación de la comunidad.
- No debe usarse como prueba concluyente en contextos disciplinarios, académicos o legales: es una señal probabilística con falsos positivos documentados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhetan3/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Modelo similar (jainatharva21/hw1-hc3-detector): https://huggingface.co/jainatharva21/hw1-hc3-detector
- Modelo similar (Aishkrish/hw1-hc3-detector): https://huggingface.co/Aishkrish/hw1-hc3-detector
- Entrada de registro (Yihangsun/hw1-hc3-detector) en savrn.com: https://savrn.com/models/hw1-hc3-detector
- Entrada de registro (skyyyyks/hw1-hc3-detector) en free2aitools.com: https://free2aitools.com/model/skyyyyks/hw1-hc3-detector
- Repositorio de experimentos de detección con el dataset HC3: https://github.com/saugatabose28/LLM-Detector-Experiments-HC3-Dataset
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, cálculo de impacto ambiental): https://arxiv.org/abs/1910.09700
