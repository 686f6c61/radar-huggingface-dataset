# syedazeez/glassbox-135m-rl-arith

## Resumen

glassbox-135m-rl-arith es un modelo de lenguaje de 135,3 millones de parámetros desarrollado por el usuario independiente syedazeez como parte de una línea de investigación centrada en la observabilidad completa del entrenamiento. Se trata de un transformer decoder-only entrenado desde inicialización aleatoria sobre FineWeb-Edu y datos sintéticos de aritmética, al que posteriormente se le aplicaron 80 pasos de GRPO (una variante de RLHF sin modelo de recompensa aprendido, con recompensa por respuesta exacta) para reforzar el razonamiento aritmético paso a paso.

El modelo no pretende competir con asistentes generales: es un artefacto de investigación que documenta cada señal de entrenamiento (activaciones por capa, entropía de atención por cabeza, ratios de actualización, ruido de gradiente, rango espectral, logit lens y telemetría de NVML) en un dataset público de aproximadamente 1.000 señales. Su relevancia radica en que permite estudiar empíricamente cómo el RL transforma un modelo pequeño: según el autor, el GRPO mejoró la precisión pass@1 en sumas y restas de 4 y 5 dígitos (de 93,9% a 97,6% y de 91,2% a 97,6%) y redujo a la mitad las respuestas correctas construidas sobre pasos inválidos (de 6,9% a 3,5%), pero no extendió las capacidades más allá de lo que el modelo base ya sabía hacer.

La arquitectura es un transformer de 12 capas con d_model 768, 12 cabezas, longitud de secuencia 1024, RoPE con base 10k, pre-norm RMSNorm, QK-norm, MLP con squared-ReLU de factor 4 y soft-cap de logits tanh 30. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens en el que cada dígito es un token propio, decisión clave para el razonamiento aritmético por columnas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 12 capas, d_model 768, 12 cabezas, RoPE (base 10k), pre-norm RMSNorm, QK-norm, MLP squared-ReLU (4x), cabeza no atada, tanh logit soft-cap 30, z-loss 1e-4 |
| Parametros totales | 135.287.040 (25,2M corresponden al embedding de entrada) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (el repo publica safetensors en precision de entrenamiento; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (segun model card; entrenado sobre FineWeb-Edu) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), definicion de modelo en PyTorch puro (modeling_glassbox.py) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de 12 capas y 135,3M de parámetros. Incorpora varias decisiones técnicas poco habituales en modelos de este tamaño: QK-norm (normalización de queries y claves antes del producto escalar), activación squared-ReLU en el MLP en lugar de SwiGLU, soft-cap de logits con tanh a 30 y una pérdida auxiliar z-loss de 1e-4 para estabilizar los logits. La cabeza de salida no está atada al embedding de entrada. El tokenizador es un BPE a nivel de byte con vocabulario de 32.768 tokens, entrenado sobre 300.000 documentos de FineWeb-Edu más 20.000 documentos aritméticos; cada dígito constituye un token independiente, lo que facilita el razonamiento posicional por columnas. Dispone de tokens especiales para estructura de conversación y razonamiento: `<|endoftext|>` (0), `<|pad|>` (1), `<think>` (2), `</think>` (3), `<answer>` (4), `</answer>` (5), `<|user|>` (6) y `<|assistant|>` (7).

El preentrenamiento consumió 2,40B tokens en una única H100 durante 101 minutos (aproximadamente 7,4 USD en Modal), con un batch efectivo de 524.000 tokens por paso. Se usó el optimizador Muon para las matrices ocultas y AdamW para embeddings, cabeza y gains, con un schedule de warmup-stable-decay consciente del tiempo. Durante el 20% final (fase de decaimiento del learning rate) la mezcla fue 70% FineWeb-Edu y 30% scratchpads aritméticos sintéticos (suma, resta y multiplicación de n dígitos por 1 dígito, con operandos de 1 a 5 dígitos). El entrenamiento alcanzó un 33% de MFU, sin actualizaciones omitidas ni alertas de los detectores. Los datos web provinieron de `HuggingFaceFW/fineweb-edu` (sample/10BT, ficheros 000-002 para entrenamiento y 013 reservado), con puntuaciones de calidad 3-5, totalizando 2,30B tokens web más 150M de aritmética sintética; el bits-per-byte en web reservada bajó de 1,134 a 0,968.

Sobre el modelo base se aplicaron 80 pasos de GRPO (16 prompts × 16 muestras por paso), con agregación Dr.GRPO, clipping 0,2/0,28, β=0 con KL registrada, learning rate 1e-5, recompensa por respuesta exacta y un currículo que amplió el rango de 4 a 4-6 dígitos. No se usó modelo de recompensa aprendido ni anotadores humanos: la señal proviene de la verificación exacta del resultado.

## Capacidades

- Generación de texto en inglés, con calidad limitada (el propio autor describe las generaciones sobre texto web como repetitivas).
- Razonamiento aritmético paso a paso en formato scratchpad: suma, resta y multiplicación de n dígitos por 1 dígito, con pasos de columna del tipo `a+b+carry=s wD cC`.
- Emisión estructurada de razonamiento y respuesta mediante los tokens `<think>...</think>` y `<answer>...</answer>`.
- Seguimiento de instrucciones en el formato de prompt `<|user|>Compute A+B.<|assistant|>`.
- Verificación de fidelidad de pasos: el modelo está diseñado para que un verificador de proceso pueda re-derivar cada paso a partir de los operandos.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso fuera del dominio aritmético.
- No dispone de visión, audio ni otras modalidades.
- Capacidad multilingüe: únicamente inglés; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: el modelo sirve como sujeto de estudio para analizar cómo evolucionan activaciones, entropía de atención y ratios de actualización durante el preentrenamiento y el RL, gracias a la telemetría publicada paso a paso.
- Estudio del efecto del RL en modelos pequeños: permite reproducir y examinar el hallazgo de que GRPO con recompensa exacta afina comportamientos existentes pero no extiende el techo de capacidad (pass@16 a 6 dígitos bajó de 13,5% a 11,9%).
- Validación de pipelines de verificación de razonamiento: al generar scratchpads estructurados y verificables, se puede usar para probar verificadores de proceso que re-deriven cada paso aritmético.
- Enseñanza de interpretabilidad: con 12 capas y 135M de parámetros, es un banco de pruebas asequible para técnicas como logit lens, análisis de atención por cabeza o rango espectral, con datos de referencia ya publicados.
- Reproducción de entrenamientos desde cero con presupuesto reducido: el autor documenta un coste de aproximadamente 7,4 USD en una H100, lo que lo convierte en un caso práctico para estudiar schedules, optimizadores híbridos (Muon + AdamW) y mezclas de datos.
- Pruebas de inyección de fallos y robustez: el dataset de telemetría incluye ejecuciones de fault-injection que pueden usarse para desarrollar detectores de anomalías en entrenamiento.
- Referencia negativa controlada: útil para estudiar fallos concretos y reproducibles, como el colapso total con operandos de distinta longitud o el muro de longitud a partir de 6 dígitos.

## Benchmarks y rendimiento

Evaluación con decodificación greedy, 16 problemas por celda (error de muestreo aproximado de ±12 puntos porcentuales por celda), ejecutada en CPU desde el `model.safetensors` publicado mediante `modeling_glassbox.py`. "Pasos fieles" significa que cada paso del scratchpad se re-deriva de los operandos con un verificador de proceso y que la respuesta final coincide con el último paso.

| Conjunto | Precision | Pasos fieles |
|---|---|---|
| add/3d | 100% | 100% |
| add/4d | 100% | 100% |
| add/5d | 100% | 100% |
| add/6d | 0% | 0% |
| add/7d | 0% | 0% |
| sub/3d | 100% | 100% |
| sub/4d | 100% | 100% |
| sub/5d | 100% | 100% |
| sub/6d | 0% | 0% |
| sub/7d | 0% | 0% |
| mul1/3d | 100% | 100% |
| mul1/4d | 100% | 100% |
| mul1/5d | 100% | 100% |
| mul1/6d | 19% | 0% |
| mul1/7d | 19% | 0% |
| add/unequal-len | 0% | 0% |

Resultados del RL reportados en la model card (temperatura 1): pass@1 subió de 93,9% a 97,6% en 4 dígitos y de 91,2% a 97,6% en 5 dígitos; las respuestas correctas construidas sobre pasos inválidos se redujeron de 6,9% a 3,5%; pass@16 a 6 dígitos cayó de 13,5% a 11,9%. En decodificación greedy el modelo iguala al modelo base. Bits-per-byte en web reservada: 1,134 (base) frente a 0,968 (modelo entrenado). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (135,3M parámetros, ~0,54 GB de pesos) más el coste del contexto de 1024 tokens y la caché KV; holgadamente por debajo de 1 GB en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el entrenamiento se realizó en una H100, pero la inferencia no requiere hardware de centro de datos.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.), e incluso en CPU, como demuestra la evaluación oficial ejecutada en CPU.
- Opciones de despliegue: PyTorch puro con `modeling_glassbox.py` y `generate.py` (dependencias: torch, safetensors, tokenizers). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| glassbox-135m-rl-arith | 135,3M | 1024 | Transformer from-scratch + GRPO aritmético, observabilidad completa | Apache 2.0 | HuggingFace (safetensors + código PyTorch) |
| glassbox-135m-base | 135,3M | 1024 | Mismo modelo antes del RL | Apache 2.0 | HuggingFace |
| glassbox-135m-sft | 135,3M | 1024 | Mismo modelo tras SFT | Apache 2.0 | HuggingFace |
| SmolLM-135M | 135M | 2048 | Transformer denso, preentrenamiento a gran escala | Apache 2.0 | HuggingFace |

La comparación con modelos de propósito general del mismo tamaño (por ejemplo, SmolLM-135M) no es directa: glassbox-135m-rl-arith está entrenado con 2,40B tokens frente a los cientos de miles de millones de los modelos de producción, y su contexto es de 1024 tokens. Su ventaja diferencial no es el rendimiento general sino la trazabilidad total del entrenamiento. No se dispone de benchmarks comunes que permitan una comparación cuantitativa con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento de juguete: es un modelo de investigación de 135M para estudiar dinámicas de entrenamiento y observabilidad, no un asistente general; sus generaciones sobre texto web son repetitivas.
- Muro de longitud duro: 0% de precisión en suma y resta de 6 y 7 dígitos. Los datos aritméticos cubrieron de 1 a 5 dígitos y no hubo generalización más allá.
- Fallo total con operandos de distinta longitud (por ejemplo, `4721+389` produce 8620): todos los problemas de entrenamiento tenían operandos de igual longitud y el modelo copia el dígito equivocado del número más corto.
- Respuestas correctas no implican razonamiento correcto: en multiplicación de 6-7 dígitos por 1 dígito acierta entre el 12% y el 19% de las respuestas con 0% de scratchpads válidos; debe usarse el verificador de pasos, no solo la respuesta final.
- Sin ajuste de seguridad: no está alineado ni filtrado más allá del filtrado de calidad de FineWeb-Edu, y hereda los sesgos de ese corpus.
- Idioma: solo inglés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto limitado a 1024 tokens, insuficiente para conversaciones largas o documentos extensos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es adecuado para producción como asistente general dadas sus limitaciones de capacidad y su falta de alineación de seguridad.
- Los resultados de evaluación tienen un error de muestreo de aproximadamente ±12 puntos porcentuales por celda (16 problemas por celda), por lo que las diferencias pequeñas entre configuraciones no deben interpretarse como significativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syedazeez/glassbox-135m-rl-arith
- Dataset de telemetría: https://huggingface.co/datasets/syedazeez/glassbox-135m-telemetry
- Modelo base: https://huggingface.co/syedazeez/glassbox-135m-base
- Modelo tras SFT: https://huggingface.co/syedazeez/glassbox-135m-sft
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
