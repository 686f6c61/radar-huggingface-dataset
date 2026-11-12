# YogeshNarasimha/telugu-gpt-17m

## Resumen

Telugu GPT 17M es un modelo de lenguaje decoder-only de 17,3 millones de parámetros entrenado desde cero para el idioma telugu (código ISO `te`). Lo desarrolla YogeshNarasimha como parte del proyecto telugu-nepali-lm, un repositorio de experimentos de modelado lingüístico de bajo coste. El modelo se entrenó exclusivamente sobre la Wikipedia en telugu (snapshot 20231101) y su objetivo declarado es servir como referencia educativa de un pipeline completo de entrenamiento de un transformer desde cero, no como herramienta de producción.

Arquitectónicamente es un transformer clásico de tipo GPT con 8 capas, 8 cabezas de atención, anchura de 384 dimensiones, contexto de 256 tokens y vocabulario de 8.000 piezas generado con SentencePiece Unigram. Usa pre-LayerNorm, embeddings posicionales aprendidos y ataduras entre la matriz de embedding y la capa de salida (*tied embeddings*), una configuración típica de los modelos pequeños estilo nanoGPT.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra que con un corpus de unos 8-9 millones de tokens y un modelo de 17M de parámetros se puede obtener un bits/char de 0,53 en artículos de prueba de Wikipedia, muy por debajo de las líneas base de unigramas y bigramas. El propio autor advierte que la perplejidad está inflada por la regularidad del texto de Wikipedia en telugu y que el modelo no es apto para uso real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (estilo GPT), pre-LayerNorm, embeddings posicionales aprendidos, tied embeddings |
| Parámetros totales | 17,3 M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | no disponible (pesos en PyTorch `model.pt`; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | Telugu (`te`) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model.pt`), tokenizador SentencePiece (`tokenizer.model`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8 capas con 8 cabezas de atención y dimensión de modelo de 384. Emplea pre-LayerNorm (normalización antes de cada subcapa), embeddings posicionales aprendidos en lugar de posiciones sinusoidales o RoPE, y comparte los pesos de la matriz de embedding de entrada con la proyección lineal de salida. El vocabulario de 8.000 tokens se construyó con SentencePiece en modo Unigram, adecuado para una lengua aglutinante con un sistema de escritura propio (alfabeto telugu).

El entrenamiento se realizó desde cero sobre la Wikipedia en telugu (snapshot 20231101), con un total de aproximadamente 8-9 millones de tokens. No se documenta en la model card el uso de RLHF, DPO ni ajuste por instrucciones; se trata de un modelo de lenguaje base entrenado con el objetivo estándar de predicción del siguiente token. El checkpoint publicado corresponde a la mejor validación, en la iteración 4500. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni hiperparámetros como la tasa de aprendizaje o el tamaño de batch.

## Capacidades

- Generación de texto en telugu con estilo enciclopédico, limitada a continuaciones cortas (el ejemplo de la model card usa `max_new_tokens=60`).
- Modelado de lenguaje autorregresivo: el modelo puede puntuar secuencias y calcular perplejidad o bits/char sobre texto en telugu.
- Generación con muestreo configurable: temperatura y `top_k` (el ejemplo oficial usa `temperature=0.8`, `top_k=40`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta capacidad de agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (*thinking mode*), visión ni audio.
- Multilingüismo: no disponible; el modelo está entrenado únicamente en telugu.

## Casos de uso

- Docencia y aprendizaje de transformers: el repositorio incluye `model.py` y el checkpoint, lo que permite reproducir el entrenamiento y estudiar cada componente (atención, LayerNorm, tied embeddings) en un modelo que cabe en CPU.
- Investigación en lenguas de bajos recursos: sirve como línea base reproducible para comparar tokenizadores, arquitecturas o estrategias de aumento de datos en telugu.
- Evaluación de tokenizadores: el vocabulario SentencePiece de 8.000 piezas y las métricas de bits/char permiten analizar la eficiencia de la tokenización en una lengua aglutinante con escritura propia.
- Generación de texto de relleno para pruebas de infraestructura: útil para validar pipelines de inferencia, serialización de pesos o integración con PyTorch sin coste de cómputo.
- Análisis de regularidad de corpus: el contraste entre perplejidad y bits/char en Wikipedia en telugu ejemplifica cómo medir el sesgo de plantillas en datasets enciclopédicos.
- Prototipado de técnicas de decodificación: al ser un modelo diminuto, permite experimentar con temperatura, `top_k` y otras estrategias de muestreo de forma rápida y barata.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre artículos de prueba reservados (*held-out test articles*):

| Modelo | Perplejidad (por token) | Bits/char |
|---|---|---|
| Línea base unigrama | 643,18 | 2,001 |
| Línea base bigrama | 30,48 | 1,0574 |
| Telugu GPT 17M | 5,55 | 0,5301 |

El autor advierte que la perplejidad depende del tokenizador y no es comparable entre lenguas, por lo que recomienda usar bits/char. Asimismo, señala que la Wikipedia en telugu es muy regular (muchos artículos generados a partir de plantillas), de modo que la baja perplejidad refleja un dominio fácil y no un modelo especialmente potente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Con 17,3M de parámetros en fp32 los pesos ocupan unos 69 MB; en fp16, unos 35 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; también funciona en CPU sin problemas.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: el repositorio está pensado para PyTorch puro (`torch.load` + `model.generate`). No se proporcionan pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI; sería necesario convertirlos.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, la generación en CPU debería completarse en milisegundos por token, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Telugu GPT 17M | 17,3 M | 256 | Telugu | MIT | PyTorch |
| Modelos GPT pequeños de referencia (p. ej. nanoGPT) | ~10-125 M | variable | Inglés principalmente | MIT | PyTorch |
| Modelos multilingües pequeños (p. ej. distilgpt2) | 82 M | 1.024 | Inglés | MIT | safetensors, PyTorch |

No se dispone de comparativas publicadas con otros modelos específicos de telugu en la información proporcionada. Las alternativas de la tabla son referencias genéricas de la misma categoría (modelos decoder-only de menos de 100M de parámetros) y no se han evaluado en el mismo corpus, por lo que la comparación de rendimiento no está disponible.

## Limitaciones y advertencias

- Entrenado únicamente sobre Wikipedia en telugu, con un estilo enciclopédico y aproximadamente 8-9 millones de tokens; el dominio es muy estrecho.
- El propio autor indica que el modelo "inventa hechos" y "no es apto para ningún uso en el mundo real".
- La baja perplejidad está parcialmente inflada por la gran regularidad del texto de Wikipedia en telugu (artículos con plantillas), por lo que no debe interpretarse como una medida de calidad general.
- Contexto muy corto (256 tokens), insuficiente para tareas de conversación multi-turno o documentos largos.
- No está ajustado por instrucciones ni con RLHF/DPO; no sigue instrucciones de forma fiable.
- Monolingüe: no comprende ni genera otros idiomas.
- Riesgo de sesgos derivados del corpus de Wikipedia (sesgo de cobertura, de género y de temática).
- Licencia MIT: permite uso comercial y modificación, pero el autor desaconseja explícitamente su uso en producción.
- No se publican pesos en formatos estándar de inferencia (GGUF, safetensors), lo que dificulta su integración en herramientas habituales sin conversión previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YogeshNarasimha/telugu-gpt-17m
- Repositorio del proyecto telugu-nepali-lm: https://github.com/Yogesh-Narasimha/telugu-nepali-lm
- Dataset utilizado (Wikipedia en telugu): https://huggingface.co/datasets/wikimedia/wikipedia
