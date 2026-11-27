# tumasha/gpt2-reuters-from-scratch

## Resumen

GPT-2 Reuters from scratch es un modelo de lenguaje causal de tipo GPT-2 small entrenado íntegramente desde pesos inicializados aleatoriamente, sin reutilizar los pesos preentrenados originales de GPT-2. Lo desarrolla el usuario tumasha y se ha publicado en Hugging Face bajo licencia MIT. El modelo se ha entrenado sobre el corpus de artículos de Reuters del dataset `ingeniumacademy/reuters_articles`, concatenando título y cuerpo de cada noticia, con un tokenizador específico del corpus.

Se trata de un experimento de escala reducida: 30,7 millones de parámetros, contexto de 256 tokens y un vocabulario de 52.000 entradas. El entrenamiento se realizó en una única GPU NVIDIA RTX 3050 de 6 GB durante aproximadamente 15 minutos para el modelo base (5 épocas). El repositorio incluye además dos variantes de comparación (2 épocas y 2 capas) para analizar el efecto de modificar un único hiperparámetro.

Su relevancia es fundamentalmente didáctica y de investigación metodológica: permite estudiar el comportamiento de un transformer causal pequeño entrenado desde cero sobre un dominio concreto (estilo periodístico de agencia), con curvas de pérdida y análisis de perplejidad publicados. No está pensado para uso en producción ni para tareas del mundo real, tal como advierte el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only estilo GPT-2 |
| Parámetros totales | 30.713.856 (modelo base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | No disponible (pesos en safetensors, sin versiones GGUF publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-2 estándar: 6 capas, dimensión de embedding de 384, 6 cabezas de atención, vocabulario de 52.000 tokens y contexto máximo de 256 tokens. El entrenamiento se realizó con el `Trainer` de Hugging Face bajo objetivo de predicción del siguiente token, partiendo de pesos aleatorios y usando el tokenizador específico del corpus `ingeniumacademy/gpt2-reuters-tokenizer`.

Los hiperparámetros principales son: AdamW con learning rate 5e-4, betas 0.9/0.95, weight decay 0.1, scheduler coseno con 5 % de warm-up, precisión fp16, dropout 0.1, semilla 42 y batch efectivo de 32 secuencias de 256 tokens por paso (16 × 2 de acumulación de gradiente). El corpus total ronda los 3 millones de tokens. El modelo base se entrenó 5 épocas (15,1 minutos) y alcanzó una pérdida de validación de 4,351 (perplejidad 77,5) y de test de 4,154 (perplejidad 63,7). Las variantes de comparación son un modelo de 2 épocas (misma arquitectura, pérdida de test 4,730 / perplejidad 113,3) y un modelo de 2 capas con 5 épocas (23.616.000 parámetros, pérdida de test 4,304 / perplejidad 74,0). No se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto causal en inglés con estilo periodístico de agencia (Reuters).
- Continuación de titulares y cuerpos de noticia a partir de un prefijo.
- Generación condicionada por muestreo (top-k, top-p, temperature, repetition penalty).
- Modelado del lenguaje a nivel de token para análisis de perplejidad y estudios de distribución next-token.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Capacidad multilingüe inexistente: solo inglés.
- Capacidad de código y matemáticas no evaluada y previsiblemente muy limitada por tamaño y corpus.

## Casos de uso

- Estudio académico de entrenamiento desde cero: permite reproducir un pipeline completo (tokenizador de dominio, entrenamiento, evaluación de perplejidad) en hardware de consumo, útil para cursos y laboratorios de NLP.
- Análisis de curvas de aprendizaje: las variantes publicadas (2 épocas frente a 5 épocas, 2 capas frente a 6 capas) permiten estudiar el efecto del presupuesto de entrenamiento y la profundidad en un corpus pequeño.
- Generación de texto sintético con estilo periodístico para pruebas de pipelines: sirve para generar datos de relleno con formato de noticia de agencia en entornos de test donde no se requiere veracidad.
- Investigación sobre perplejidad y distribución next-token: el repositorio incluye resultados de análisis de siguiente token que pueden reutilizarse como referencia metodológica.
- Docencia sobre tokenizadores específicos de dominio: el uso de un tokenizador entrenado sobre el corpus Reuters permite ilustrar el impacto del vocabulario en la perplejidad.
- Pruebas de integración con transformers y text-generation-inference: al ser compatible con endpoints, puede servir para validar despliegues mínimos de TGI en local.
- No es adecuado para atención al cliente, generación de código en producción, resumen fiable de noticias ni ninguna tarea que requiera exactitud factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor únicamente reporta métricas de pérdida y perplejidad sobre el corpus Reuters:

| Run | Capas | Épocas | Parámetros | Tiempo de entrenamiento | Pérdida val (ppl) | Pérdida test (ppl) |
|---|---|---|---|---|---|---|
| gpt2-reuters-base-5ep | 6 | 5 | 30.713.856 | 15,1 min | 4,351 (77,5) | 4,154 (63,7) |
| gpt2-reuters-2ep | 6 | 2 | 30.713.856 | 6,1 min | 4,950 (141,1) | 4,730 (113,3) |
| gpt2-reuters-2layer-5ep | 2 | 5 | 23.616.000 | 10,9 min | 4,508 (90,7) | 4,304 (74,0) |

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 100-150 MB para los pesos (30,7 M de parámetros), más overhead de activaciones y del runtime de transformers; cabe holgadamente en cualquier GPU de consumo.
- Entrenamiento validado en una NVIDIA RTX 3050 de 6 GB; también es viable en GPUs con 4 GB o más.
- GPUs recomendadas: cualquier GPU de consumo moderna (RTX 3050, RTX 3060, RTX 4060, RTX 4090) e incluso CPU para inferencia puntual.
- Despliegue: compatible con transformers y text-generation-inference según los tags del repositorio; no se han publicado pesos GGUF, por lo que llama.cpp y Ollama requerirían conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tumasha/gpt2-reuters-from-scratch | 30,7 M | 256 | Reuters (~3 M tokens) | MIT | Hugging Face |
| GPT-2 small original (OpenAI) | 124 M | 1.024 | WebText | MIT | Hugging Face |
| Variante 2 capas del mismo autor | 23,6 M | 256 | Reuters | MIT | Hugging Face (subcarpeta) |

Frente a GPT-2 small original, este modelo tiene aproximadamente una cuarta parte de parámetros y un contexto cuatro veces menor, pero está especializado en el estilo Reuters y se ha entrenado con un tokenizador de dominio. No se dispone de comparaciones con otros modelos entrenados desde cero sobre el mismo corpus.

## Limitaciones y advertencias

- Modelo muy pequeño y corpus de aproximadamente 3 millones de tokens: el texto es localmente fluido en estilo Reuters pero factualmente inventado.
- Pérdida de coherencia habitual tras unas pocas frases.
- Riesgo alto de alucinación: cualquier dato, cifra o entidad generada debe considerarse ficticio.
- Contexto limitado a 256 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Solo inglés; sin capacidades multilingües.
- El autor indica explícitamente que no es apto para ningún uso real.
- Licencia MIT: permite uso comercial y modificación, pero ello no elimina las limitaciones técnicas ni el riesgo de outputs incorrectos.
- Sin versiones cuantizadas publicadas (GGUF, AWQ, GPTQ); su despliegue en llama.cpp u Ollama requeriría conversión manual.
- Sin evaluación en benchmarks estándar ni datos sobre sesgos; al entrenarse sobre noticias de agencia, puede reproducir sesgos editoriales y de encuadre del corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tumasha/gpt2-reuters-from-scratch
- Tokenizador del corpus: https://huggingface.co/ingeniumacademy/gpt2-reuters-tokenizer
- Dataset de entrenamiento: https://huggingface.co/datasets/ingeniumacademy/reuters_articles
