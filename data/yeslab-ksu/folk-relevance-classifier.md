# YesLab-KSU/folk-relevance-classifier

# Folk relevance classifier (v7)

## Resumen

El modelo Folk relevance classifier, desarrollado por YesLab-KSU, es un cross-encoder de clasificación de texto que determina si un pasaje es una descripción folk de una habilidad cognitiva CHC (Cattell-Horn-Carroll). Su objetivo es vincular el lenguaje cotidiano de personas no expertas con los términos técnicos de la psicología cognitiva. Se basa en el modelo microsoft/deberta-v3-base, con 184.424.451 parámetros y una ventana de contexto configurada a 256 tokens. El modelo se entrenó con 7.519 ejemplos y clasifica cada par (ancla de habilidad + pasaje) en una de tres etiquetas: off_topic, incidental_mention o folk_description. Es un modelo de nicho orientado a investigación, con licencia MIT y soporte exclusivo para inglés. Su relevancia actual radica en la necesidad de sistemas que comprendan cómo la gente común describe capacidades cognitivas, útil en psicología, sociolingüística y NLP aplicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cross-encoder (sequence classification) basado en microsoft/deberta-v3-base |
| Parámetros totales | 184.424.451 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens (máximo configurado; el modelo base DeBERTa-v3-base admite hasta 512) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de clasificación secuencial que recibe dos segmentos de entrada: un ancla formada por el nombre de la habilidad cognitiva y un conjunto de semillas (seeds) separadas por [SEP], y el pasaje de texto a evaluar. La concatenación se trunca a 256 tokens. Esta arquitectura permite obtener una puntuación de relevancia semántica entre el ancla y el pasaje. El entrenamiento se realizó sobre 7.519 ejemplos con 8 épocas, batch de 16, learning rate 2e-5, weight decay 0.01, warmup ratio 0.1, semilla 42, en una NVIDIA RTX 3090 con PyTorch 2.4.1 y Transformers 4.42.3. No se aplicó RLHF ni DPO. La innovación técnica destacable es el condicionamiento por semillas: el anchor incorpora términos coloquiales asociados a la habilidad, lo que orienta la clasificación hacia descripciones folk en lugar de lenguaje técnico.

## Capacidades

- Clasificación de texto en tres clases: off_topic (0), incidental_mention (1) y folk_description (2).
- Cross-encoder para evaluar la relevancia entre un pasaje y una habilidad cognitiva CHC, a partir de un ancla con seeds.
- Devuelve probabilidades normalizadas mediante softmax sobre las etiquetas, con un umbral de decisión configurable (0.30 por defecto).
- No es un modelo generativo: no produce texto nuevo, solo etiquetas.
- No soporta tool calling, ni razonamiento multi-step, ni visión, ni audio.
- Soporte exclusivo para inglés.

## Casos de uso

- Investigación en psicología cognitiva: el modelo puede filtrar pasajes de foros o entrevistas para identificar descripciones cotidianas de habilidades CHC, sin necesidad de que el autor use el término técnico.
- Construcción de corpus anotados: en proyectos de folk psychology, permite anotar automáticamente si un texto es una descripción folk de una habilidad, reduciendo el trabajo manual en estudios a gran escala.
- Análisis de redes sociales: aplicable a datos de Reddit para estudiar cómo los hablantes no expertos conceptualizan capacidades como inducción o memoria de trabajo a partir del lenguaje natural.
- Búsqueda semántica en textos académicos: puede integrarse en un pipeline de recuperación para encontrar ejemplos concretos de habilidades en material educativo o de divulgación.
- Preprocesamiento en sistemas de lingüística computacional: permite filtrar pasajes irrelevantes antes de pasar a modelos generativos, reduciendo ruido en tareas de resumen o extracción.
- Integración en herramientas de evaluación educativa: facilita asociar ejemplos cotidianos con términos psicológicos del modelo CHC, mejorando materiales didácticos.
- Detección de nociones implícitas de capacidades: en estudios de psicología cultural, sirve para comparar cómo distintas comunidades describen la inteligencia sin mencionarla.

## Benchmarks y rendimiento

Métricas declaradas por el autor para la tarea de clasificación de relevancia folk:

| Métrica | Valor | Verificado |
|---|---|---|
| F1 | 0.505 | No |
| Precisión | 0.575 | No |
| Recall | 0.450 | No |

El umbral de decisión usado en la evaluación es 0.30. No se han publicado resultados comparativos contra otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en FP32 y 0,5 GB en FP16 con batch 1 (según los 184 millones de parámetros).
- GPU recomendada: cualquier tarjeta con al menos 2 GB de VRAM, por ejemplo una NVIDIA T4 o RTX 3060. También puede ejecutarse en CPU.
- No requiere GPUs de alta gama (A100 o H100).
- Opciones de despliegue: Transformers (pipeline de text-classification), TorchServe o Hugging Face Inference Endpoints. No está optimizado para vLLM ni llama.cpp, por tratarse de un modelo discriminativo no generativo.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables publicados para la tarea específica de relevancia folk. Existen otros cross-encoders basados en DeBERTa-v3-base, como cross-encoder/nli-deberta-v3-base, pero están diseñados para otras tareas y no ofrecen métricas directamente comparables en esta información.

## Limitaciones y advertencias

- Métricas de rendimiento modestas: con un F1 de 0.505, el modelo presenta una tasa de error significativa. Las métricas no están verificadas externamente.
- El dataset de entrenamiento proviene de pasajes de Reddit en inglés, lo que puede introducir sesgos sociolingüísticos, culturales y de registro.
- La ventana de contexto es de 256 tokens; los pasajes más largos se truncan y pueden perder información relevante.
- Solo está disponible para inglés; no funciona con otros idiomas.
- No es un modelo generativo; no puede producir explicaciones ni resúmenes de sus decisiones.
- El umbral por defecto (0.30) es un hiperparámetro del autor y requiere calibración para otros dominios.
- La etiqueta folk_description depende de las seeds; si estas no cubren la variabilidad del lenguaje, el modelo puede fallar.
- La licencia MIT permite uso comercial, pero el modelo se ofrece sin garantías ni soporte.

## Enlaces

- https://huggingface.co/YesLab-KSU/folk-relevance-classifier
- https://github.com/YesLab-AI/ (organización GitHub encontrada en la búsqueda web; no se ha verificado una relación directa con este modelo)
