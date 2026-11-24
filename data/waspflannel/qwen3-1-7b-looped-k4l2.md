# waspflannel/Qwen3-1.7B-Looped-K4L2

## Resumen

Qwen3-1.7B-Looped-K4L2 es un checkpoint de investigación publicado por el usuario waspflannel que reconstruye el modelo Qwen3-1.7B de Alibaba como un transformer con bucles (looped transformer). Las 20 capas centrales del modelo original se sustituyen por un único bloque compartido de 10 capas que se ejecuta dos veces, manteniendo las 4 primeras y las 4 últimas capas como únicas. El resultado es un modelo de 1.267 millones de parámetros (un 26% menos que los 1.720,6 millones del original) que conserva 28 pasadas de capa por token, por lo que el ahorro es de memoria de pesos, no de cómputo.

El modelo se destila del Qwen3-1.7B original congelado mediante divergencia KL sobre el vocabulario completo, usando 150 millones de tokens de FineWeb-Edu. Cada una de las dos pasadas del bloque compartido dispone de su propia LoRA de rango 64 sobre las siete proyecciones lineales, inicializada mediante SVD de la diferencia respecto a la media de las capas originales. La arquitectura sigue la línea de los recursive transformers relajados (arXiv:2410.20672).

Es relevante como experimento de compresión de modelos abiertos sin reentrenamiento desde cero: demuestra que la perplejidad se mantiene cerca del profesor en texto web (20,07 frente a 17,87, un 12% peor), pero también evidencia que las capacidades de conocimiento y matemáticas no se transfieren con este régimen de destilación (MMLU 29,0% y GSM8K 0,0%). No es un modelo de chat ni de razonamiento, sino una pieza para investigar arquitecturas con pesos compartidos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped/recursive): 4 capas únicas iniciales, bloque compartido de 10 capas ejecutado 2 veces, 4 capas únicas finales; LoRA por pasada en 7 proyecciones lineales |
| Parámetros totales | 1.267.022.336 (1.267,0 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; el entrenamiento usó secuencias de 1.024 tokens y la caché KV mantiene 28 ranuras, igual que el original |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16; sin versiones GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16, bloque compartido almacenado una sola vez) |

Desglose de parámetros según la model card: embeddings y norma final (atados a la capa de salida, congelados) 311,2 M; capas únicas (8) 402,7 M; bloque compartido (10 capas) 503,4 M; LoRA por pasada (2 × 10 capas) 49,8 M.

## Arquitectura y entrenamiento

La arquitectura reorganiza el stack de 28 capas de Qwen3-1.7B en el esquema `[0 1 2 3] [bloque S0..S9, pasada 1 | mismo bloque, pasada 2] [24 25 26 27]`. Cada token atraviesa 28 pasadas de capa, por lo que el coste por token en FLOPs es aproximadamente el del modelo original; la reducción se concentra en la memoria ocupada por los pesos. Las dos pasadas del bloque compartido se diferencian mediante LoRA de rango 64 y alpha 128 aplicadas a las proyecciones q, k, v, o, gate, up y down. La inicialización parte de la media de las dos capas originales que reemplaza cada capa compartida, y cada LoRA arranca como una aproximación SVD de rango 64 de la diferencia entre la capa original y esa media. La caché KV conserva una ranura por pasada (28 en total), de modo que `generate` funciona con el flujo estándar.

El entrenamiento es una destilación del Qwen3-1.7B original congelado con pérdida de divergencia KL sobre el vocabulario completo (temperatura 1, sin término de entropía cruzada). Se usaron 150 millones de tokens de FineWeb-Edu (`sample-10BT`) empaquetados en secuencias de 1.024 tokens, reservando cada centésimo documento para evaluación. Se realizaron 4.577 pasos de 32.768 tokens con AdamW (learning rate 5e-5 para capas y 2e-4 para las LoRA, 200 pasos de warmup, decaimiento coseno, gradient clip 1.0). Se entrenaron las capas únicas, el bloque compartido y las LoRA; embeddings y norma final permanecieron congelados. El cómputo total fue de unas 4,2 horas en una A100 de 40 GB en Google Colab, a unos 10.000 tokens/s.

## Capacidades

- Generación de texto en inglés: continuación de texto plano estilo artículo web, que es el dominio sobre el que se destiló.
- Continuación de prosa con coherencia local razonable, medida por una perplejidad de 20,07 en FineWeb-Edu retenido.
- Capacidad limitada de seguir el template de chat de Qwen3, aunque el autor advierte que las respuestas suelen ser repetitivas o incorrectas.
- Sin soporte fiable de tool calling ni function calling.
- Sin soporte de razonamiento multi-paso ni de agentes: GSM8K a 0,0% y MMLU al 29,0% (cerca del azar en 4 opciones).
- Sin capacidades de visión ni de audio.
- Sin modo thinking funcional, pese a heredar la estructura de Qwen3.
- Soporte de caché KV con 28 ranuras (una por pasada), compatible con `model.generate` de transformers.

## Casos de uso

- Investigación sobre arquitecturas con bucles y compartición de pesos: sirve como referencia reproducible para estudiar cómo se degrada la transferencia de capacidades al colapsar capas, con código de entrenamiento público en el repositorio del autor.
- Experimentos de destilación con pérdida KL: el checkpoint y el pipeline permiten evaluar regímenes alternativos (por ejemplo, mezclar datos de instrucciones o matemáticas) y comparar frente a esta línea base.
- Estudio de inicialización por SVD y LoRA por pasada: útil para analizar si las dos pasadas del bloque compartido aprenden funciones diferenciadas o convergen, inspeccionando los pesos LoRA publicados.
- Benchmarking de perplejidad en dominios web: como modelo de 1.267 M con perplejidad cercana al profesor en FineWeb-Edu, puede emplearse en pruebas controladas de compresión de modelos sobre corpus tipo FineWeb.
- Generación de texto de relleno o sintético en inglés para pruebas de pipelines: dado que produce prosa continua plausible en dominio web, puede alimentar tests de tokenización, formateo o evaluación de infraestructura, nunca contenido final.
- Docencia y divulgación sobre recursive transformers: el desglose de parámetros y el esquema de capas facilitan explicar el concepto de pesos compartidos con un caso real y ejecutable en CPU.
- Validación de implementaciones de `trust_remote_code`: el código de modelado, pequeño y construido sobre las capas estándar de Qwen3 en transformers, sirve para probar cargas de modelos con código personalizado.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en el paso final (4.577) con la misma configuración de GPU para ambos modelos:

| Modelo | Perplejidad FineWeb-Edu retenido (64 × 1.024 tokens) | MMLU (200 preguntas, 0-shot) | GSM8K (100 problemas) |
|---|---:|---:|---:|
| Qwen3-1.7B (profesor) | 17,87 | 62,0% | 84,0% |
| Qwen3-1.7B-Looped-K4L2 | 20,07 | 29,0% | 0,0% |

El autor señala que las evaluaciones son pequeñas (200 preguntas de MMLU y 100 problemas de GSM8K), con un margen de varios puntos, y que la evaluación se ejecutó con pesos en float32 bajo autocast de bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 2,5 GB (tamaño del repositorio); en float32, unos 5,1 GB. Añadir la caché KV y activaciones según longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bfloat16; el autor entrenó en una A100 de 40 GB, pero la inferencia no requiere ese hardware.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en CPU (probado por el autor con transformers 5.24 y torch 2.15 en CPU).
- Opciones de despliegue: únicamente `transformers` con `trust_remote_code=True`; no es compatible con llama.cpp, vLLM ni otros runtimes según la model card.
- Latencia y throughput: no se publican cifras de inferencia. El entrenamiento corrió a unos 10.000 tokens/s en una A100 40 GB; el cómputo por token en inferencia es equivalente al de Qwen3-1.7B, ya que cada token atraviesa 28 pasadas de capa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| Qwen3-1.7B-Looped-K4L2 | 1.267 M | No disponible (entrenado con secuencias de 1.024) | Apache-2.0 | Hugging Face, solo transformers con código personalizado | Perplejidad 20,07; MMLU 29,0%; GSM8K 0,0% |
| Qwen/Qwen3-1.7B (profesor) | 1.720,6 M | No disponible en la información proporcionada | Apache-2.0 | Hugging Face, ecosistema estándar | Perplejidad 17,87; MMLU 62,0%; GSM8K 84,0% |
| Alternativas de compresión tipo recursive transformer | No disponible | No disponible | No disponible | No disponible | La model card cita arXiv:2410.20672 como base conceptual, sin comparación numérica directa |

No se han publicado en la información disponible comparaciones con otros modelos destilados o comprimidos de tamaño similar.

## Limitaciones y advertencias

- Solo vio texto web: la destilación usó FineWeb-Edu, de modo que imita el estilo de artículo del profesor pero no su formato de preguntas y respuestas, chat ni matemáticas paso a paso.
- No es un modelo de chat ni de razonamiento: las respuestas pueden ser repetitivas o incorrectas; el autor recomienda usarlo solo para continuación de texto y para investigación.
- Degradación severa en conocimiento y matemáticas: MMLU 29,0% (cerca del 25% del azar) y GSM8K 0,0%.
- Evaluaciones pequeñas: 200 preguntas de MMLU y 100 problemas de GSM8K implican márgenes de varios puntos.
- Mismo cómputo que el original: el bucle ahorra memoria de pesos, no FLOPs; cada token ejecuta 28 pasadas de capa.
- Código personalizado: requiere `trust_remote_code=True` y no está soportado por llama.cpp, vLLM ni otros runtimes, lo que limita su despliegue en producción.
- Idiomas: únicamente inglés; sin capacidades multilingües verificadas.
- Riesgo de alucinación y sesgos: hereda los sesgos y modos de fallo de Qwen3-1.7B y del texto web de FineWeb-Edu.
- Licencia Apache-2.0: permite uso comercial, pero el estado de investigación del checkpoint y su calidad hacen desaconsejable cualquier uso en producción.
- Sin cuantizaciones oficiales publicadas (GGUF, AWQ, GPTQ), lo que complica su ejecución en entornos de bajos recursos pese al reducido tamaño.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waspflannel/Qwen3-1.7B-Looped-K4L2
- Código de entrenamiento: https://github.com/waspflannel/looped-distill
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de destilación: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Paper de referencia (Relaxed Recursive Transformers): https://arxiv.org/abs/2410.20672
