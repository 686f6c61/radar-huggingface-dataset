# the-sweater-cat/Qwen3.8-27B-trellis-2.0bpw

## Resumen

Qwen3.8-27B-trellis-2.0bpw es una cuantización de solo pesos (weight-only PTQ) del modelo Qwen/Qwen3.8-27B, publicada por el usuario the-sweater-cat. El resultado es un checkpoint de aproximadamente 1,9971 bits por peso sobre todo el modelo de texto (embeddings y lm_head incluidos, contando todas las escalas), codificado en un formato pensado para ser decodificado directamente por un kernel GEMM con grado de paralelismo tensorial 4. El repositorio incluye tanto los pesos dequantizados en BF16 (carpeta raíz, para evaluación y reproducción) como el modelo cuantizado en formato de servicio (carpeta `native/`, 12,2 GB en total).

El modelo base es un transformer de 27.781.427.952 parámetros (unos 27,8 mil millones) con licencia Apache 2.0. La cuantización emplea cuantización con código de trellis (estilo QTIP), rotaciones Hadamard aplicables por kernel, error feedback con LDLQ contra Hessianos de entrada y anchos mixtos por módulo elegidos por sensibilidad medida. El autor lo etiqueta explícitamente como release candidate de 2,0 bits por peso, no como versión final: queda por detrás de su propia release de 2,5 bits por peso en matemáticas y matemáticas multilingües.

Es relevante ahora porque demuestra que es posible comprimir un modelo de 27,8B a ~2 bits por peso manteniendo un rendimiento cercano al BF16 en tareas de código agéntico (DeepSWE 80,34% frente a 82,97% del BF16), a costa de una degradación notable en razonamiento matemático (AIME 86,7% frente a 97,7%). El formato está diseñado para servir en producción con SGLang y decodificación especulativa a TP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, con DeltaNet y torre de visión; detalles completos no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Trellis-coded QTIP PTQ a 1,9971 bits por peso (anchos mixtos: 1, 2, 3, 4, 5 y 6 bits por módulo/banda) |
| Idiomas soportados | no disponible (la evaluación MGSM cubre 11 idiomas, entre ellos swahili y telugu) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 dequantizado en raíz; `native/` con códigos trellis empaquetados + tensores BF16 restantes) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3.5 con 27,8 mil millones de parámetros, que incluye una torre de visión (333 tensores) y una cabeza de predicción multi-token (15 tensores), ambas sin cuantizar y no contabilizadas en el presupuesto de bits. La cuantización se aplica sobre 496 lineales codificados: 400 módulos a 2 bits y 96 módulos a 5 bits, sin ningún lineal del decodificador por debajo de 2 bits. El lm_head se divide en 16 bandas de frecuencia con anchos propios (6, 4, 3 y luego 2 bits) y el embedding en 16 bandas de frecuencia de entrada (3, 2, 2, 2 y luego 1 bit), con cada fila normalizada antes de codificar. El histograma de anchos (módulos y bandas) es {1: 12, 2: 416, 3: 2, 4: 1, 5: 96, 6: 1}, donde las doce entradas de 1 bit son bandas del embedding.

El método combina cuantización con código de trellis estilo QTIP (cada baldosa de 16x16 es un bitstream tail-biting con estado de 16 bits; el valor del codebook se computa desde el estado con operaciones enteras sobre una rejilla INT8), rotaciones que un kernel puede aplicar (una Hadamard de signo aleatorio por shard de paralelismo tensorial en cada lado no residual, bloques de 128 puntos en el lado del flujo residual, de modo que ninguna transformación cruza una GPU a TP4), error feedback con LDLQ de bloques contra Hessianos de entrada y de dos lados contra Hessianos de Fisher del lado de salida donde aporta, y un ajuste de escalas por fila y por columna y de los pesos de normalización entrenado de extremo a extremo sobre KL hacia el modelo BF16, con trazas de agentes de código autogeneradas más texto general con datos multilingües (matemáticas, matemáticas multilingües y chat, ciencia, chat, código, contexto largo) al 30% de peso, learning rate 1e-3 y 100 pasos. Respecto a la build anterior de 2,0 bits ("X5"/"ml30"), esta versión sube los 12 lineales de 1 bit a 2 bits, sube las bandas 00-02 del lm_head a 6/4/3 bits y codifica el embedding en 16 bandas en lugar de como una sola matriz.

## Capacidades

- Generación de texto y razonamiento general, evaluado vía KL contra BF16 en texto general y trazas de agentes de código.
- Codificación agéntica: evaluado en DeepSWE con 113 tareas de codificación agéntica usando un scaffold de Claude Code.
- Razonamiento matemático: evaluado en AIME 2025 + 2026 (60 problemas x 8 muestras).
- Matemáticas multilingües: evaluado en MGSM con 11 idiomas y 2.750 problemas.
- Visión: el modelo base incluye torre de visión (333 tensores, sin cuantizar); evaluado en RealWorldQA (765 preguntas x 3 muestras).
- Predicción multi-token: el modelo base incluye una cabeza de predicción multi-token (15 tensores, sin cuantizar, no incluida en `native/`).
- Decodificación especulativa: usada en la evaluación con SGLang a TP4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: parcialmente evidenciadas por la evaluación MGSM; lista completa de idiomas no disponible.

## Casos de uso

- Servicio de codificación agéntica en producción: el modelo mantiene un 80,34% de media en el score de tests de características de DeepSWE frente al 82,97% del BF16, con solo −2,63 puntos de diferencia pareada (SE 3,07), lo que lo hace apto para pipelines de agentes de código donde el ahorro de memoria a ~2 bits por peso compensa la ligera pérdida de calidad.
- Despliegue con memoria restringida: el formato `native/` ocupa 12,2 GB en total, lo que permite servir un modelo de 27,8B en hardware donde el BF16 (~55 GB solo de pesos) no cabría, manteniendo la licencia Apache 2.0 para uso comercial.
- Evaluación y reproducción de investigaciones de cuantización: la carpeta raíz contiene los pesos dequantizados en BF16 exactamente con los que se midieron todos los resultados, cargables en transformers, SGLang o vLLM, lo que facilita reproducir los benchmarks sin necesidad de implementar el kernel de decodificación trellis.
- Servicio a TP4 con SGLang: el formato está codificado para ser decodificado directamente por un kernel GEMM a grado de paralelismo tensorial 4, con decodificación especulativa, lo que encaja en despliegues multi-GPU con requisitos de latencia ajustados.
- Tareas de razonamiento visual de propósito general: la torre de visión se mantiene sin cuantizar y el modelo obtiene un 80,48% en RealWorldQA frente al 82,35% del BF16, adecuado para preguntas sobre imágenes donde no se requiere precisión matemática extrema.
- Asistencia multilingüe en 11 idiomas: con un 89,42% en MGSM frente al 93,96% del BF16, es utilizable en escenarios multilingües, aunque con mayor degradación en swahili y telugu, por lo que conviene validar esos idiomas antes de producción.
- Base para experimentación con cuantización extrema: el repositorio incluye `FORMAT.md`, `decode_reference.py` (PyTorch y safetensors en CPU) y `check.json` con 36 módulos verificados bit-exactos, lo que lo convierte en una referencia práctica para estudiar cuantización trellis a ~2 bits por peso.

## Benchmarks y rendimiento

| Benchmark | Este modelo | BF16 (base) |
|---|---|---|
| DeepSWE (113 tareas agénticas, score medio de tests) | 80,34% (36 resueltas del todo) | 82,97% (44) |
| DeepSWE, diferencia pareada vs BF16 (puntos) | −2,63 (SE 3,07) | — |
| AIME 2025 + 2026 (60 problemas x 8 muestras) | 86,7% | 97,7% |
| RealWorldQA (765 preguntas x 3 muestras) | 80,48% | 82,35% |
| MGSM (11 idiomas, 2.750 problemas) | 89,42% | 93,96% |
| KL(BF16 \|\| modelo), trazas de agentes de código held-out | 0,0285 | 0 |
| KL(BF16 \|\| modelo), texto general held-out (ponderado) | 0,0841 | 0 |

Comparación con la release de 2,5 bits por peso del mismo autor (según la model card): AIME 86,7% frente a 96,25% y MGSM 89,42% frente a 92,69%, con la mayor parte de la brecha de MGSM en swahili y telugu. En DeepSWE está dentro del ruido respecto a la de 2,5 bits y al BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: el formato `native/` ocupa 12,2 GB en total (6,14 GB de códigos trellis empaquetados más escalas, 6,01 GB de tensores BF16 restantes), más overhead de activaciones y KV cache no cuantificados. Los pesos BF16 de la carpeta raíz requieren del orden de 55 GB solo para pesos.
- GPU recomendadas: el formato está diseñado para decodificación por kernel GEMM a TP4, por lo que el despliegue de referencia usa 4 GPUs en paralelo tensorial con SGLang y decodificación especulativa. Modelos concretos de GPU no disponibles en la información proporcionada.
- ¿Cabe en GPU consumer? No disponible en la información proporcionada; el requisito de TP4 y el tamaño del repo (67,7 GB) sugieren que no está pensado para una única GPU consumer.
- Opciones de despliegue: SGLang (usado en la evaluación), vLLM y transformers para los pesos BF16 de la carpeta raíz; el formato `native/` requiere el kernel de decodificación trellis correspondiente. `decode_reference.py` permite decodificar en CPU con PyTorch y safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La evaluación se hizo con SGLang a TP4, decodificación especulativa y 24 tareas concurrentes con límite de 3 horas por tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-trellis-2.0bpw (este) | 27,8B (1,9971 bpw) | no disponible | DeepSWE 80,34%; AIME 86,7%; MGSM 89,42%; RealWorldQA 80,48% | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-trellis-2.5bpw | no disponible | no disponible | AIME 96,25%; MGSM 92,69%; DeepSWE dentro del ruido respecto al BF16 | Apache 2.0 (según modelo base) | Hugging Face |
| Qwen/Qwen3.8-27B (BF16) | 27,8B | no disponible | DeepSWE 82,97%; AIME 97,7%; MGSM 93,96%; RealWorldQA 82,35% | Apache 2.0 | Hugging Face |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un release candidate, no una versión final; el propio autor lo advierte.
- Degradación significativa en matemáticas: AIME 86,7% frente al 97,7% del BF16, y MGSM 89,42% frente al 93,96%, con mayor pérdida en swahili y telugu.
- En DeepSWE la diferencia pareada contra BF16 es de −2,63 puntos (SE 3,07), por lo que la degradación en código agéntico está dentro del ruido estadístico de una sola pasada.
- Los resultados son de intentos únicos, de modo que las diferencias pequeñas son ruido.
- Los pesos BF16 de la carpeta raíz se produjeron con dos redondeos BF16 y no son bit-idénticos con la decodificación exacta del formato `native/`.
- El formato `native/` no incluye la cabeza de predicción multi-token, y el embedding y el lm_head se almacenan como valores BF16 (sus códigos de banda no están en esta versión del formato).
- La torre de visión y la cabeza de predicción multi-token no están cuantizadas y no se contabilizan en el presupuesto de bits.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; aplíquense las advertencias habituales de los modelos de lenguaje.
- Lista completa de idiomas soportados y longitud de contexto no disponibles.
- Licencia Apache 2.0, lo que permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- El despliegue en producción requiere el kernel de decodificación trellis y, según la evaluación, TP4 con SGLang; no basta con cargarlo como un transformer estándar en ese formato.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/the-sweater-cat/Qwen3.8-27B-trellis-2.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Release de 2,5 bits por peso del mismo autor: https://huggingface.co/the-sweater-cat/Qwen3.8-27B-trellis-2.5bpw
