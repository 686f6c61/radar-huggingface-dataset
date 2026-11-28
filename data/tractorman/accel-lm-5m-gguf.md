# Tractorman/accel-lm-5M-GGUF

## Resumen

accel-lm-5M es un modelo de lenguaje de 5.347.296 parámetros entrenado desde cero por el equipo 2 de la asignatura ECE382M de la Universidad de Texas en Austin (otoño de 2026) para el benchmark de FPGA del curso. No es un modelo de propósito general: es un artefacto experimental diseñado específicamente para ejecutarse en una placa Ultra96 con un único núcleo Arm A53 a 300 MHz, usando un acelerador GEMV propio para matrices Q8_0. Su relevancia radica en demostrar que un transformer tipo Llama puede entrenarse y cuantizarse de forma que quepa y funcione en hardware embebido de muy bajos recursos.

La arquitectura es un transformer Llama estándar de solo 3 capas, anchura 288, feed-forward de 768 con SwiGLU, 6 cabezas de tamaño 48 (sin GQA) y un contexto de 512 tokens. El vocabulario es de 4.096 tokens (SentencePiece, reutilizado de `sixf0ur/tiny-lm-8M`). Todas las matrices tienen dimensiones múltiplos de 32 (288×288, 288×768, 768×288 y 288×4.096) para adaptarse al acelerador de la placa.

El modelo está deliberadamente sobreajustado a un conjunto reducido de tareas de benchmark (HellaSwag, ARC-Easy e IFEval-style) y solo soporta inglés. Los resultados publicados por el autor muestran un 100.0 en el harness del curso para Q8_0 y QAT Q4_0, pero el propio autor advierte que estos ítems están en los datos de entrenamiento y que la cifra representativa para prompts no vistos es del 89% en comprobaciones de formato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder-only, `llama` plano en llama.cpp) |
| Parametros totales | 5.347.296 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Q8_0 (normas en F32), Q4_0, QAT Q4_0 |
| Idiomas soportados | inglés (`en`) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (safetensors para los pesos originales) |

Datos adicionales de arquitectura: 3 capas, anchura 288, feed-forward 768 (SwiGLU), 6 cabezas de tamaño 48 sin GQA, vocabulario de 4.096 tokens (SentencePiece, procedente de `sixf0ur/tiny-lm-8M`). Tamaños de fichero: Q8_0 = 5.778.944 bytes; Q4_0 y QAT Q4_0 = 3.106.304 bytes cada uno.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only tipo Llama de profundidad mínima (3 capas). El autor explica que la profundidad y la anchura se eligieron para la placa: el tiempo por token en el A53 está dominado por el trabajo fijo de CPU por capa, y la anchura cuesta más que el tamaño del feed-forward, por lo que se reduce a la mitad la profundidad de `tiny-lm-8M` manteniendo sus matrices de anchura 288. Todas las matrices son múltiplos de 32 para el acelerador GEMV.

El entrenamiento se realizó desde inicialización aleatoria en un Apple M4 durante aproximadamente 3 horas en tres fases. Los datos combinan: validación de HellaSwag (10.042 ítems, MIT) y train/validación/test de ARC-Easy (5.187 ítems, CC BY-SA 4.0) formateados exactamente como el harness del benchmark, con la letra de respuesta como objetivo y balanceados por época; datos de instrucciones generados a partir de `nano_wiki` (CC BY 4.0) con reglas de formato verificadas por las propias funciones de comprobación del harness (recuentos de frases, párrafos, viñetas y líneas, rangos de palabras, mayúsculas, caracteres o palabras prohibidas, palabras requeridas, frases de inicio o fin, comillas, claves JSON, `<<titles>>`), más los 10 prompts públicos de estilo IFEval del benchmark; y texto plano de `nano_wiki`. No se menciona RLHF ni DPO.

La innovación técnica destacable es el entrenamiento consciente de cuantización (QAT) para Q4_0: 10 épocas adicionales sobre los mismos datos desde el checkpoint final (learning rate 3e-4, cosine), redondeando en el forward pass cada matriz, la proyección de salida y el embedding de tokens a Q4_0 exactamente como lo hace `llama-quantize` (verificado bit a bit en las 23 tensores), con activaciones redondeadas a Q8_0 como en la ruta de CPU de llama.cpp y gradientes straight-through. Los pesos flotantes guardados cuantizan con `--pure Q4_0` exactamente a los pesos con los que se entrenó. Este proceso adicional llevó 46 minutos en el M4.

## Capacidades

- Generación de texto en inglés con contexto de 512 tokens.
- Respuesta a ítems de opción múltiple con el formato del harness del curso (pregunta, opciones `A.`–`D.`, `Answer with a single letter.`, prefill `Answer:`).
- Seguimiento de instrucciones de formato: recuentos de frases, párrafos, viñetas y líneas, rangos de palabras, mayúsculas, caracteres o palabras prohibidas, palabras requeridas, frases de inicio o fin, comillas, claves JSON y `<<titles>>`.
- Plantilla de chat incorporada que renderiza `mensaje de usuario + "\n" + respuesta del asistente`.
- Capacidades multilingües: solo inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Benchmark de referencia para aceleradores hardware: el modelo sirve como carga de trabajo controlada para medir el rendimiento de un acelerador GEMV Q8_0 en una Ultra96 con un A53 a 300 MHz, ya que todas sus matrices son múltiplos de 32 y el harness de evaluación es reproducible.
- Validación de pipelines de cuantización: los tres ficheros GGUF (Q8_0, Q4_0 y QAT Q4_0) permiten comparar el efecto de la cuantización post-entrenamiento frente a QAT sobre las mismas tareas, con verificaciones bit a bit documentadas.
- Docencia de entrenamiento desde cero: el modelo, entrenado en unas 3 horas en un Apple M4, es un ejemplo completo y reproducible de pipeline de datos, tokenizador, entrenamiento, cuantización y evaluación para cursos de sistemas o machine learning.
- Evaluación de seguimiento de instrucciones de formato: con un 89% de comprobaciones de formato superadas en 400 prompts generados no vistos, sirve para probar arneses de verificación de restricciones de formato en modelos pequeños.
- Pruebas de despliegue en edge: al ocupar entre 3,1 y 5,8 MB en GGUF, es adecuado para validar integraciones de `llama-server` en dispositivos con memoria muy limitada.
- Investigación sobre sobreajuste y memorización: la diferencia entre el 100.0 en ítems vistos y el 89% en prompts no vistos lo convierte en un caso de estudio útil sobre cómo interpretar resultados de benchmark cuando los datos de evaluación están en el entrenamiento.

## Benchmarks y rendimiento

Resultados del harness del curso (50 ítems: 20 HellaSwag, 20 ARC-Easy, 10 IFEval-style), `llama-server`, estos ficheros, cinco muestras de ítems (semillas 42, 1, 2, 3, 4), CPU Apple M4:

| Modelo | Media | Rango | HellaSwag | ARC-Easy | IFEval |
|---|---:|---|---:|---:|---:|
| accel-lm-5M Q8_0 | 100.0 | 100.0 a 100.0 | 100.0 | 100.0 | 100.0 |
| accel-lm-5M Q4_0 | 97.6 | 95.0 a 98.9 | 96.8 | 99.8 | 95.0 |
| accel-lm-5M QAT Q4_0 | 100.0 | 100.0 a 100.0 | 100.0 | 100.0 | 100.0 |
| tiny-lm-8M fine-tuned (entrega anterior) | 30.6 | 25.2 a 34.3 | 22.7 | 18.9 | 70 |

El propio autor advierte que estos ítems públicos están en los datos de entrenamiento y reflejan el caso memorizado. Sobre 400 prompts de instrucciones generados no vistos, el modelo supera el 89% de las comprobaciones de formato, que es la mejor estimación para prompts IFEval-style no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en cualquiera de los tres ficheros GGUF (Q8_0 = 5,78 MB; Q4_0 y QAT Q4_0 = 3,11 MB), por lo que cabe en cualquier GPU consumer y en la mayoría de sistemas embebidos.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU (Arm A53 a 300 MHz en Ultra96) y se ha validado en CPU Apple M4.
- Cabe en cualquier GPU consumer (RTX 4090, etc.) con enorme holgura; el cuello de botella no es la memoria sino la latencia por token.
- Opciones de despliegue: `llama-server` y `llama.cpp` (formato GGUF nativo), y cualquier runtime compatible con GGUF. No se documenta soporte específico de vLLM, TGI u Ollama.
- Latencia y throughput: no se publican cifras concretas de latencia o throughput en la información disponible; el autor solo indica que el tiempo por token en el A53 está dominado por el trabajo fijo de CPU por capa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| accel-lm-5M | 5,35 M | 512 | CC BY-SA 4.0 | GGUF en HF | Específico de benchmark, inglés, sobreajustado a tareas del curso |
| tiny-lm-8M | ~8 M (no confirmado) | no disponible | CC BY 4.0 (tokenizador y texto) | HF | Modelo base del que se reutilizan tokenizador y anchura; la entrega anterior fine-tuneada obtuvo 30,6 de media en el harness |
| Alternativas de propósito general de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

La única comparación directa publicada es con el fine-tune de `tiny-lm-8M` de la entrega anterior, que obtuvo una media de 30,6 frente al 100.0 de accel-lm-5M en el harness del curso (con la salvedad de memorización ya señalada).

## Limitaciones y advertencias

- Sobreajuste severo al benchmark: los ítems de HellaSwag, ARC-Easy e IFEval-style usados en la evaluación están en los datos de entrenamiento; el 100.0 no es una medida de generalización. La cifra representativa es el 89% de comprobaciones de formato en prompts no vistos.
- Contexto muy corto (512 tokens) e idioma único (inglés).
- Vocabulario reducido (4.096 tokens) que limita la cobertura léxica.
- Riesgo alto de alucinación y de comportamiento degenerado fuera de las tareas de benchmark para las que fue entrenado.
- No hay datos publicados sobre sesgos; al entrenarse con HellaSwag, ARC y `nano_wiki`, puede heredar sesgos de esas fuentes.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar las implicaciones para productos propietarios.
- No apto para producción de propósito general: es un artefacto docente y de benchmark, no un asistente conversacional.
- No se documenta soporte de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tractorman/accel-lm-5M-GGUF
- Tokenizador de origen: https://huggingface.co/sixf0ur/tiny-lm-8M
- Dataset de texto: https://huggingface.co/datasets/sixf0ur/nano_wiki
- HellaSwag: https://rowanzellers.com/hellaswag/
- ARC: https://allenai.org/data/arc
