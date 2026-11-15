# WithinUsAI/recursive-language-model-198m

## Resumen

El modelo recursive-language-model-198m es un modelo de lenguaje causal de 198 millones de parámetros desarrollado por WithinUsAI y entrenado desde cero (sin base preentrenada ni fine-tuning posterior) sobre una única GPU NVIDIA Tesla T4. Su propuesta principal es una arquitectura denominada Mixture of Recursion (MoR), que aplica un número variable de pasos recursivos sobre un bloque transformer compartido en función de la dificultad estimada de cada entrada. Esa dificultad se estima mediante un router de perplejidad entrenado de forma auto-supervisada, sin etiquetas manuales.

El modelo emplea una base transformer de 16 capas con RoPE y pre-norm, un vocabulario BPE de GPT-2 (50.260 tokens) y un bloque recursivo compartido que se reutiliza una, tres o cinco veces según la perplejidad estimada. El entrenamiento se realizó con 150.000 pasos sobre 150.000 muestras conversacionales provenientes de Anthropic HH-RLHF, UltraChat y Alpaca-GPT4, con una longitud máxima de secuencia de 512 tokens.

Su relevancia es fundamentalmente experimental: demuestra que el enrutamiento adaptativo por perplejidad es entrenable de forma estable en FP16 (cero batches con NaN en 150.000 pasos) y que la pérdida desciende correctamente. No obstante, el propio autor reconoce una brecha de generalización notable (perplejidad de validación 15,37 frente a 43,21 en test fuera de distribución), por lo que debe considerarse una prueba de concepto arquitectónica más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture of Recursion (MoR): bloque recursivo compartido reutilizado 1, 3 o 5 veces según router de perplejidad |
| Parametros totales | 198.464.806 |
| Parametros activos | No aplica (no es MoE; el cómputo varía por pasos recursivos, no por expertos) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia durante el entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (requiere trust_remote_code para cargar el código personalizado) |

## Arquitectura y entrenamiento

La arquitectura se compone de cuatro bloques: un embedding de tokens de aproximadamente 39M de parámetros sobre vocabulario BPE de GPT-2 con tokens especiales; un transformer base de 16 capas con RoPE, pre-norm y atención con enmascaramiento seguro para FP16, de unos 149M de parámetros; un router de perplejidad de 2 capas MLP (768→384→3) de aproximadamente 1,2M de parámetros; y un bloque transformer recursivo compartido de unos 7M de parámetros que se reutiliza 1, 3 o 5 veces. El router asigna el número de pasos recursivos según la perplejidad estimada: por encima de 50 aplica 5 pasos, entre 20 y 50 aplica 3, y por debajo de 20 aplica 1. El enrutamiento se aprende de forma auto-supervisada a partir de la señal de perplejidad del propio modelo, sin etiquetas manuales.

El entrenamiento se realizó durante 2 épocas y 150.000 pasos en una Tesla T4 de 15,6 GB (Kaggle), con batch efectivo de 64 (batch 2 × acumulación 32), longitud máxima de 512, learning rate 1e-4 con warmup lineal de 500 pasos y decaimiento coseno, optimizador AdamW, weight decay 0,01, clipping de gradiente 1,0 y precisión mixta FP16. La función de pérdida combina la pérdida de lenguaje con 0,1 veces la pérdida del router. La innovación técnica destacable es el enmascaramiento seguro para FP16: en lugar de usar `-inf` en la máscara de atención, se aplica `-1e4` con clamping pre-softmax y `torch.nan_to_num`, lo que produjo cero batches con NaN en todos los pasos.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat específico (`<|user|>` / `<|assistant|>`).
- Razonamiento básico y respuesta a instrucciones, derivado del entrenamiento sobre Alpaca-GPT4 y UltraChat.
- Asignación adaptativa de cómputo por entrada mediante el router de perplejidad (1, 3 o 5 pasos recursivos).
- Entrenamiento estable en FP16 con atención numéricamente robusta.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad explícita.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: modo de cómputo adaptativo auto-supervisado; sin visión ni audio.

## Casos de uso

- Investigación sobre cómputo adaptativo: el modelo sirve como banco de pruebas reproducible para estudiar enrutamiento por perplejidad y reutilización de bloques, ya que todo el pipeline es entrenable en una sola T4.
- Experimentos académicos de arquitecturas eficientes: permite comparar el coste real de aplicar 1, 3 o 5 pasos recursivos frente a un transformer de profundidad fija del mismo tamaño.
- Generación de texto conversacional de bajo coste: con 198M de parámetros y licencia MIT, puede desplegarse en hardware modesto para prototipos de chatbots en inglés.
- Evaluación de técnicas de estabilidad numérica en FP16: el esquema de enmascaramiento con `-1e4` y `nan_to_num` puede reutilizarse como referencia en otros entrenamientos.
- Docencia y formación: su tamaño reducido y su entrenamiento documentado (150.000 pasos, configuración completa) lo hacen adecuado para explicar routers, perplejidad y recursión en transformers.
- Base para fine-tuning experimental: al estar liberado con licencia MIT y pesos safetensors, puede adaptarse a dominios concretos en inglés para estudiar cómo interactúa el router con datos nuevos.

## Benchmarks y rendimiento

| Modelo | Parametros | PPL (test fresco HH-RLHF) | Notas |
|---|---|---|---|
| GPT-2 Medium | 345M | 26,89 | Baseline de OpenAI |
| MoR 198M | 198M | 43,21 | Modelo de esta ficha |

| Epoca | Train loss | Val loss | Val PPL |
|---|---|---|---|
| 1 | 4,5081 | 3,0798 | 21,75 |
| 2 | 3,3068 | 2,7326 | 15,37 |

El autor advierte explícitamente que la perplejidad de validación (15,37) se midió sobre datos en distribución y no debe compararse directamente con benchmarks estándar de GPT-2 Medium. En el test fuera de distribución (500 muestras frescas de HH-RLHF), el modelo obtiene 43,21 frente a 26,89 de GPT-2 Medium, lo que evidencia sobreajuste a la distribución de entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en FP16 (tamaño del repo), alrededor de 0,4 GB en cuantización de 8 bits y cerca de 0,2 GB en 4 bits (estimaciones según el número de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el propio modelo se entrenó en una Tesla T4 de 15,6 GB.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada; vLLM, llama.cpp, Ollama y TGI no están confirmados para esta arquitectura personalizada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| MoR 198M (esta ficha) | 198M | 512 | MIT | Transformer con recursión adaptativa por perplejidad | Hugging Face |
| GPT-2 Medium | 345M | 1.024 | MIT | Transformer denso estándar | Hugging Face |
| GPT-2 Small | 124M | 1.024 | MIT | Transformer denso estándar | Hugging Face |

La comparación directa con GPT-2 Medium en el test fuera de distribución favorece a GPT-2 Medium (26,89 frente a 43,21 de perplejidad), pese a tener casi el doble de parámetros. Frente a GPT-2 Small no hay datos de perplejidad comparables en la información disponible. La ventaja diferencial del MoR 198M no es el rendimiento bruto, sino la propuesta arquitectónica de cómputo adaptativo y su reproducibilidad en hardware de gama baja.

## Limitaciones y advertencias

- Brecha de generalización documentada por el autor: perplejidad de validación 15,37 frente a 43,21 en test fuera de distribución, con signos claros de sobreajuste.
- Entrenado únicamente en inglés; no soporta otros idiomas de forma fiable.
- Longitud de contexto limitada a 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Dataset de entrenamiento pequeño para su tamaño (150.000 muestras), lo que limita la calidad y diversidad de las respuestas.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera de la distribución conversacional de entrenamiento.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código antes de ejecutarlo en producción.
- Formato de chat obligatorio (`<|user|>` / `<|assistant|>`); usarlo de otra forma degrada los resultados.
- No dispone de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan evaluar su calidad frente a alternativas.
- Licencia MIT permite uso comercial, pero la madurez del modelo y su brecha de generalización desaconsejan su uso en producción sin validación previa.
- Sin soporte confirmado en motores de inferencia optimizados (vLLM, llama.cpp, TGI), lo que limita el despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WithinUsAI/recursive-language-model-198m
- Dataset Anthropic HH-RLHF: https://huggingface.co/datasets/Anthropic/hh-rlhf
- Dataset UltraChat: https://huggingface.co/datasets/stingning/ultrachat
- Dataset Alpaca-GPT4: https://huggingface.co/datasets/vicgalle/alpaca-gpt4
- Paper, blog o repositorio adicional: no disponible en la información proporcionada.
