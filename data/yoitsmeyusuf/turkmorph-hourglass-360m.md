# yoitsmeyusuf/turkmorph-hourglass-360m

## Resumen

turkmorph-hourglass-360m es un modelo de lenguaje base de 369,5 millones de parámetros desarrollado por el usuario yoitsmeyusuf, diseñado específicamente para turco y construido sobre una tokenización morfológica propia (turkmorph) en lugar de una tokenización subpalabra convencional. Su particularidad es la arquitectura "hourglass" (reloj de arena): una pila de cuatro bloques a nivel de token, seguida de una pila intermedia de dieciséis bloques que opera a nivel de palabra, y una pila final de cuatro bloques que vuelve al nivel de token para predecir el siguiente elemento. El modelo agrupa los tokens morfológicos en palabras siguiendo las reglas de turkmorph y comprime cada palabra en un único estado vectorial.

El modelo no es un asistente ni está ajustado por instrucciones: es un checkpoint de investigación pensado como comparación controlada de turkmorph-gpt-360m, un modelo plano con idénticos datos, tokens, pasos de entrenamiento e hiperparámetros. El propio autor concluye que la variante hourglass fue un 19 % más rápida de entrenar pero un 2,9 % peor en bits por carácter (BPC), y recomienda el modelo plano para cualquier uso práctico. Este checkpoint existe para reproducibilidad y para quienes investigan modelos de lenguaje a nivel de palabra o jerárquicos.

La relevancia es acotada pero clara: aporta evidencia empírica sobre si comprimir información a nivel de palabra (con posiciones morfológicas y pooling último+medio) ayuda o perjudica en un LM de escala media para un idioma morfológicamente rico como el turco. La respuesta, a esta escala, es que no ayuda.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Hourglass jerárquica (4 bloques token → 16 bloques palabra → 4 bloques token); no es una arquitectura `transformers` |
| Parámetros totales | 369.583.404 (369,5 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | no disponible (pesos exportados en bf16; no se documentan GGUF ni otras) |
| Idiomas soportados | turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (código de inferencia propio en `model.py` / `generate.py`) |
| Dimensión del modelo | 1.024 |
| Cabezas de atención | 16 |
| Embeddings | atados (tied embeddings) |
| Tamaño del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura sigue un esquema de reloj de arena sobre tokens morfológicos. Los tokens de entrada pasan por cuatro bloques a nivel de token; después, la regla de agrupación de turkmorph agrupa los tokens en palabras (raíz más sufijos, ediciones, apóstrofo y marcas de mayúsculas) y cada palabra se comprime en un estado mediante la concatenación de su último estado de token y su estado medio. Una pila de dieciséis bloques procesa esas palabras, con un embedding de posición intramorfológica (raíz = 0, primer sufijo = 1, etc.) que permite a la pila previa ver el orden de los morfemas. La pila intermedia se ejecuta una vez por palabra, aproximadamente 0,51 posiciones por token. Para evitar filtración de información, los tokens de la palabra *k* reciben el estado de la palabra *k−1*, de modo que ningún estado de palabra contiene información de tokens que no debería ver. Finalmente, cuatro bloques a nivel de token producen la predicción del siguiente token.

El entrenamiento es idéntico al del modelo plano de comparación: 1.000 millones de caracteres (300 M de Wikipedia turca bajo CC BY-SA 4.0 y 700 M de FineWeb-2 `tur_Latn` bajo ODC-By 1.0), una sola pasada de 344 M de tokens en 13.343 pasos, batch de 16 × 2.048, AdamW (β 0,9/0,95, weight decay 0,1), learning rate 8e-4 con 300 pasos de warmup y decaimiento coseno hasta el 10 %, en bf16 sobre una única H100. No se menciona RLHF, DPO ni ajuste por instrucciones. La innovación destacable es la compresión a nivel de palabra con pooling último+medio y posiciones morfológicas; en una ablación menor (33 M de parámetros, 30 M de caracteres) esa combinación fue un 0,4 % mejor que el modelo plano, pero la ganancia no se mantuvo a esta escala.

## Capacidades

- Generación de texto en turco como modelo de lenguaje base (predicción del siguiente token).
- Modelado a nivel de palabra y de morfema, con agrupación morfológica explícita.
- Generación con visualización de tokens (`--show-tokens` en `generate.py`) para inspeccionar la segmentación morfológica.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Multilingüismo limitado al turco; no se documentan otros idiomas.
- No tiene modo "thinking", visión ni audio.
- No está ajustado por instrucciones ni por seguridad.

## Casos de uso

- Investigación en modelado de lenguaje a nivel de palabra: sirve como checkpoint de comparación reproducible frente a turkmorph-gpt-360m con datos, tokens, pasos e hiperparámetros idénticos, aislando el efecto de la arquitectura.
- Experimentos de tokenización morfológica para turco: permite medir BPC y calidad de muestras con la segmentación de turkmorph frente a tokenización subpalabra convencional.
- Estudio de arquitecturas jerárquicas: la separación token → palabra → token con pooling último+medio y posiciones intramorfológicas es un punto de partida para quienes diseñan LMs jerárquicos.
- Análisis de compresión de contexto: el autor hipotetiza que comprimir una palabra en un único estado pierde contexto; el modelo permite reproducir esa observación (deriva temática más temprana en las muestras).
- Evaluación de eficiencia de entrenamiento: cuantifica el intercambio entre velocidad (19 % menos tiempo) y calidad (2,9 % peor BPC) para decidir si merece la pena en otras escalas.
- Docencia y reproducción de resultados: al ser un checkpoint pequeño (0,7 GB) y con código propio, es viable replicar el pipeline en un entorno académico con una sola GPU.

## Benchmarks y rendimiento

Evaluación en bits por carácter (BPC) sobre datos retenidos, según la model card:

| Modelo | Parámetros | Tiempo de entrenamiento | BPC validación | BPC test |
|---|---:|---:|---:|---:|
| turkmorph-gpt-360m (plano) | 364 M | 54,4 min | **1,1850** | **1,1577** |
| turkmorph-hourglass-360m (este) | 370 M | 43,9 min | 1,2192 | 1,1910 |

Los pesos exportados en bf16 re-puntúan en validación con 1,2194. En la ablación menor (33 M de parámetros, 30 M de caracteres) el hourglass fue un 0,4 % mejor que el plano, ganancia que no se sostuvo a esta escala. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 369,5 M de parámetros; en bf16 los pesos ocupan aproximadamente 0,74 GB, y en fp32 unos 1,48 GB. A ello hay que sumar el estado de activaciones y el prefijo completo en cada paso.
- GPU recomendadas: el entrenamiento se realizó en una única H100 en bf16; para inferencia basta con una GPU consumer moderna.
- Cabe en GPU consumer: sí, en tarjetas con al menos 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.), dado el reducido tamaño de los pesos.
- Opciones de despliegue: no es una arquitectura `transformers`, por lo que no funciona con vLLM, TGI, llama.cpp ni Ollama de forma directa. El despliegue se hace con el código propio `model.py` (clase `Hourglass`) y `generate.py`, más PyTorch, safetensors y huggingface_hub, y la extensión Rust de turkmorph (`pip install git+https://github.com/yoitsmeyusuf/turkmorph`).
- Latencia y throughput: no se documentan cifras. Advertencia relevante: la generación no tiene KV cache, de modo que cada paso recomputa todo el prefijo, lo que penaliza fuertemente la latencia en secuencias largas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BPC test | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| turkmorph-hourglass-360m | 370 M | 2.048 | 1,1910 | Apache 2.0 | Hugging Face, código propio |
| turkmorph-gpt-360m | 364 M | 2.048 | 1,1577 | Apache 2.0 | Hugging Face, código propio |
| Otros LM turcos de ~350 M | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa y controlada es con turkmorph-gpt-360m, que comparte datos, tokens, pasos e hiperparámetros y supera al hourglass en BPC (1,1577 frente a 1,1910) con un 19 % más de tiempo de entrenamiento. No se dispone de datos de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación: es un LM base, no un asistente; no está ajustado por instrucciones ni por seguridad.
- Alucinación: el autor advierte explícitamente que el modelo inventa hechos.
- Una sola semilla: ninguno de los dos modelos recibió cómputo igualado; el hourglass no recibió pasos extra por el tiempo que ahorró.
- Generación de longitud fija: no se entrenó un token de fin de texto, por lo que no detiene la generación de forma natural.
- Sin KV cache: cada paso recomputa el prefijo completo, lo que limita el uso en producción con secuencias largas.
- Deriva temática: las muestras del hourglass se desvían del tema antes que las del modelo plano, lo que encaja con la hipótesis de pérdida de contexto al comprimir cada palabra en un único estado.
- Idioma: solo turco; no se documenta soporte multilingüe.
- Contexto limitado a 2.048 tokens.
- Dependencia de una extensión Rust de turkmorph que requiere toolchain de Rust hasta que haya wheels en PyPI.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es adecuado para producción por su naturaleza de investigación y su falta de ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yoitsmeyusuf/turkmorph-hourglass-360m
- Modelo de comparación (plano): https://huggingface.co/yoitsmeyusuf/turkmorph-gpt-360m
- Repositorio turkmorph: https://github.com/yoitsmeyusuf/turkmorph
- Dataset Wikipedia turca: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
