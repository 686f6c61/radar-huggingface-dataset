# zongyueq/LLoPS-1B

## Resumen

LLoPS-1B es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros desarrollado por el autor independiente zongyueq, derivado por ajuste continuo (continual training) del modelo `hazyresearch/based-1b`. Su aportación principal es la sustitución de la atención lineal global de BASED por un sketch polinómico de bajo rango y grado 2 con término lineal aprendible, técnica descrita en el trabajo "Learnable Low-Rank Polynomial Sketch for Effective Linear Attention". El modelo se entrena sobre SlimPajama-6B con una longitud de secuencia de 2.048 tokens y emplea el tokenizador de GPT-2.

Se trata de un modelo base de investigación, sin ajuste por instrucciones ni auditoría para despliegue en producción. Su relevancia radica en que explora alternativas a la atención cuadrática en la familia de modelos de atención lineal, manteniendo un coste de inferencia lineal respecto a la longitud de contexto, lo que resulta de interés para investigadores que estudian eficiencia en secuencias largas.

El repositorio ocupa 6,2 GB, acumula 82 descargas y se publica bajo licencia Apache-2.0. No dispone de datos publicados sobre número exacto de tokens de entrenamiento, proceso de alineación (RLHF/DPO) ni resultados de benchmarks más allá de la evaluación zero-shot incluida en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (BASED) y sketch polinómico de bajo rango aprendible de grado 2 con término lineal |
| Parametros totales | ~1.000 millones (modelo base `hazyresearch/based-1b`, no se especifica el recuento exacto) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (checkpoint cargado mediante `GPTSketchLMHeadModel.from_pretrained_hf`); no se distribuye GGUF |

## Arquitectura y entrenamiento

LLoPS-1B parte de `hazyresearch/based-1b`, un transformer de 1B parámetros que sustituye la atención softmax por una atención lineal global (BASED). La innovación del modelo consiste en reemplazar esa atención lineal por un sketch polinómico de bajo rango con grado 2 (`llops_power=1`) y un término lineal aprendible, de modo que el mecanismo de atención aproxima el kernel de forma más expresiva sin recuperar el coste cuadrático. El entrenamiento se realiza por ajuste continuo sobre el dataset SlimPajama-6B con secuencias de 2.048 tokens, usando el tokenizador GPT-2.

No se documenta en la información disponible el número total de tokens vistos, la composición detallada del dataset más allá de SlimPajama-6B, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Tampoco se especifican innovaciones adicionales como decodificación especulativa. El código de referencia se distribuye en el repositorio GitHub del autor (`ZongyueQin/LLoPS`) y la implementación deriva de HazyResearch/BASED, con la atribución correspondiente en el fichero NOTICE.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Modelado de lenguaje con atención lineal, lo que permite procesar secuencias con coste lineal respecto a la longitud.
- Razonamiento de sentido común y comprensión lectora a nivel zero-shot (evaluado en WinoGrande, PIQA, LAMBADA, HellaSwag, ARC, FDA, SWDE y SQuAD).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés según la model card.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en mecanismos de atención eficiente: el modelo sirve como banco de pruebas para comparar el sketch polinómico de bajo rango frente a la atención lineal original de BASED en tareas de modelado de lenguaje.
- Experimentos de ajuste continuo: al estar entrenado sobre SlimPajama-6B con secuencias de 2.048 tokens, es adecuado como punto de partida para estudiar dinámicas de continual training en modelos de 1B parámetros.
- Evaluación zero-shot de sentido común: útil para reproducir y contrastar los resultados en WinoGrande, PIQA y HellaSwag reportados en la model card.
- Generación de texto en inglés para prototipos de investigación: puede emplearse en pipelines de generación condicionada siempre que se asuma que no está alineado por instrucciones.
- Estudio de eficiencia en inferencia: su atención lineal permite analizar el coste computacional y de memoria en secuencias medias (hasta 2.048 tokens) frente a transformers con atención cuadrática.
- Base para ablaciones académicas: permite comparar variantes del sketch (grado polinómico, término lineal activado/desactivado) manteniendo el resto de la arquitectura y los datos de entrenamiento constantes.

## Benchmarks y rendimiento

Resultados zero-shot publicados en la model card:

| Tarea | Métrica | LLoPS-1B |
|---|---|---|
| WinoGrande | Accuracy | 51,38 |
| PIQA | Normalized accuracy | 68,82 |
| LAMBADA | Accuracy | 38,06 |
| HellaSwag | Normalized accuracy | 42,76 |
| ARC-Easy | Normalized accuracy | 47,14 |
| ARC-Challenge | Normalized accuracy | 26,96 |
| FDA | Accuracy | 26,13 |
| SWDE | Accuracy | 48,06 |
| SQuAD | Accuracy | 36,26 |

No se han publicado en la información disponible resultados comparativos frente a `hazyresearch/based-1b` u otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 2 GB solo para pesos, más memoria para activaciones y caché; con 1B parámetros se recomienda al menos 6-8 GB de VRAM para secuencias de 2.048 tokens.
- GPU recomendadas: NVIDIA A100, H100 o RTX 4090 para inferencia en precisión completa; RTX 3090/4080 también resultan viables.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en FP16; en cuantización de 8 bits o 4 bits cabría en GPUs de 4-6 GB, aunque no se distribuyen pesos cuantizados oficialmente.
- Opciones de despliegue: la carga requiere el código del repositorio LLoPS (`based.models.gpt_unified.GPTSketchLMHeadModel`), por lo que no es compatible de forma directa con vLLM, llama.cpp, Ollama o TGI sin adaptación del mecanismo de atención.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| LLoPS-1B | ~1B | 2.048 | Lineal con sketch polinómico de grado 2 | Apache-2.0 | WinoGrande 51,38; PIQA 68,82; HellaSwag 42,76 |
| hazyresearch/based-1b | ~1B | no disponible en esta ficha | Lineal BASED | no disponible en esta ficha | no disponible en esta ficha |
| GPT-2 1.5B (referencia de la familia) | 1,5B | 1.024 | Softmax cuadrática | MIT | no disponible en esta ficha |

La comparación directa con `hazyresearch/based-1b` no puede completarse porque la información proporcionada no incluye sus resultados de benchmarks ni su licencia. No se dispone de datos de otros modelos de atención lineal comparables en el material consultado.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable y no debe usarse directamente en aplicaciones de usuario final.
- No auditado para despliegue: el autor indica explícitamente que no ha sido auditado para producción.
- Riesgo de alucinación: al ser un modelo de lenguaje sin alineación, puede generar contenido factualmente incorrecto.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otras lenguas no está garantizado.
- Contexto limitado a 2.048 tokens de entrenamiento; no se documenta extrapolación a secuencias más largas.
- Sesgos: no se documenta ninguna evaluación de sesgos; el entrenamiento sobre SlimPajama-6B puede heredar sesgos del corpus web.
- Licencia Apache-2.0 permite uso comercial, pero la implementación deriva de HazyResearch/BASED y debe respetarse la atribución indicada en el NOTICE del repositorio.
- Compatibilidad: requiere código específico del repositorio LLoPS; no funciona con cargadores estándar de `transformers` sin esa dependencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zongyueq/LLoPS-1B
- Repositorio de código LLoPS: https://github.com/ZongyueQin/LLoPS
- Modelo base: https://huggingface.co/hazyresearch/based-1b
- Dataset de entrenamiento: https://huggingface.co/datasets/DKYoon/SlimPajama-6B
