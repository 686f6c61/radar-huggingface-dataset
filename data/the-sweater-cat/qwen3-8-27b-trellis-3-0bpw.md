# the-sweater-cat/Qwen3.8-27B-trellis-3.0bpw

## Resumen

Qwen3.8-27B-trellis-3.0bpw es una cuantización de solo pesos (weight-only post-training quantization) del modelo Qwen/Qwen3.8-27B, publicada por el usuario the-sweater-cat. Aplica una codificación de retícula (trellis-coded quantization, estilo QTIP) que comprime el modelo de texto completo a 2,9997 bits por peso, incluyendo embeddings y lm_head, con anchos mixtos de 2 a 6 bits por módulo elegidos por sensibilidad medida. El resultado son 27.781.427.952 parámetros almacenados en un presupuesto de bits muy inferior al de BF16.

El repositorio contiene, en su carpeta raíz, los pesos ya desconvolucionados en BF16 (55,6 GB), que cargan como el modelo base en transformers, SGLang o vLLM y sirven para evaluación y reproducción. La carpeta `native/`, que albergará los códigos cuantizados en el formato de servicio con un decodificador de referencia, está anunciada pero todavía no publicada. La torre de visión (333 tensores) y la cabeza de predicción multi-token (15 tensores) se mantienen sin cuantizar y no se contabilizan en el presupuesto de bits.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización agresiva (3 bpw) que preserva métricas de razonamiento, código agéntico, matemáticas y multilingüismo prácticamente idénticas al BF16; por otro, advierte de que el ahorro real de memoria (unos 15 GB frente a 56 GB) solo se materializará cuando se publiquen los kernels que decodifican los códigos directamente, y que en ese formato la decodificación rinde actualmente entre 0,7 y 0,9 veces la velocidad de BF16 por paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B); cuantización trellis-coded QTIP sobre el modelo de texto |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 2,9997 bits por peso; anchos mixtos por módulo de 2 a 6 bits; histograma de módulos: 2 bits (82), 3 bits (199), 4 bits (99), 5 bits (132), 6 bits (1); grid INT8; escalas por fila y por columna |
| Idiomas soportados | no disponible (la evaluación MGSM cubre 11 idiomas, pero no se listan) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 desconvolucionado en la raíz); formato nativo cuantizado en `native/` anunciado pero no publicado |
| Tamano del repo | 55,6 GB (copia BF16); el modelo en formato nativo se estima en unos 15 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Libreria | trellis |

## Arquitectura y entrenamiento

El modelo base es un transformer Qwen3.8-27B. Sobre él se aplica una cuantización de solo pesos en formato trellis (QTIP): cada mosaico de 16 x 16 se codifica como un único bitstream con estado de 16 bits (tail-biting) a k bits por peso, y el valor del codebook se calcula desde el estado con operaciones enteras sobre un grid INT8. Las rotaciones están diseñadas para que un kernel las pueda aplicar: una Hadamard de signo aleatorio por shard de tensor-parallel en cada lado no residual, y bloques de 128 puntos en el lado del residual-stream, de modo que ninguna transformación cruza una GPU con TP4.

El entrenamiento de la cuantización usa error feedback: LDLQ por bloques contra las matrices Hessian de entrada y de dos lados contra las Hessian de Fisher del lado de salida donde resulta útil; cada fila de salida se normaliza antes de codificar y su escala se pliega en una escala de salida por fila. Los anchos por módulo (2-6 bits) se eligen por sensibilidad medida, y el lm_head se divide en 16 bandas de frecuencia con anchos propios. Las escalas por fila y por columna y los pesos de normalización se entrenan de extremo a extremo minimizando la KL respecto al modelo BF16, sobre trazas de agentes de código autogeneradas más texto general (matemáticas, código, ciencia, chat, contexto largo) con un peso del 30%. El registro de conversión (`conversion-record.json`) documenta el origen y el hash de cada tensor.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B.
- Razonamiento matemático: evaluado en AIME 2025 + 2026 con 60 problemas y 8 muestras por problema.
- Capacidad de agente de código: evaluado en DeepSWE con 113 tareas de codificación agéntica y scaffold de Claude Code.
- Multilingüismo: evaluado en MGSM con 11 idiomas y 2.750 problemas.
- Visión: la torre de visión del modelo base se conserva sin cuantizar (333 tensores), y se evalúa con RealWorldQA (765 preguntas x 3 muestras).
- Predicción multi-token: la cabeza correspondiente (15 tensores) se mantiene sin cuantizar.
- Decodificación especulativa: usada en el despliegue de evaluación con SGLang y TP4.
- Tool calling / function calling: no se detalla explícitamente en la información disponible, aunque el uso agéntico con scaffold de Claude Code sugiere soporte de interacción con herramientas.

## Casos de uso

- Evaluación y reproducción de técnicas de cuantización: cargar los pesos BF16 de la raíz en transformers, SGLang o vLLM permite reproducir exactamente las métricas publicadas y comparar contra el modelo base sin necesidad de kernels personalizados.
- Investigación en compresión de modelos: el histograma de anchos por módulo y el registro de conversión con hashes por tensor sirven para estudiar cómo la sensibilidad medida asigna bits a cada capa y para replicar el método en otros modelos.
- Despliegue de agentes de código en producción (cuando se publiquen los kernels nativos): con unos 15 GB en formato nativo frente a 56 GB en BF16, el modelo cabría en GPUs de menor VRAM manteniendo el 83,38% de media en DeepSWE, adecuado para pipelines de resolución automática de issues y parches.
- Razonamiento matemático de alta precisión: el 98,33% en AIME 2025 + 2026 con 8 muestras por problema lo hace apto para verificación de soluciones y generación de problemas con comprobación automática.
- Asistencia multilingüe: el 94,04% en MGSM sobre 11 idiomas respalda su uso en atención al cliente y soporte técnico en varios idiomas, siempre que se validen los idiomas concretos requeridos.
- Análisis de imágenes con preguntas abiertas: la torre de visión sin cuantizar y el 82,53% en RealWorldQA permiten tareas de VQA sobre escenas reales en aplicaciones de accesibilidad o inspección.
- Calibración de pipelines de cuantización: las trazas de agentes de código y el texto general usados en el ajuste de escalas y normas (30% de peso) sirven como receta para calibrar otras cuantizaciones orientadas a código.

## Benchmarks y rendimiento

Resultados publicados por el autor (intentos únicos; BF16 es el modelo base bajo el mismo harness):

| Benchmark | Este modelo | BF16 |
|---|---|---|
| DeepSWE (113 tareas agénticas de código, media de feature-test score) | 83,38% (52 resueltas por completo) | 82,97% (44) |
| DeepSWE, diferencia emparejada contra BF16 | +0,4 puntos (SE 3,5) | — |
| AIME 2025 + 2026 (60 problemas x 8 muestras) | 98,33% | 97,7% |
| RealWorldQA (765 preguntas x 3 muestras) | 82,53% | 82,35% |
| MGSM (11 idiomas, 2.750 problemas) | 94,04% | 93,96% |
| KL(BF16 ‖ modelo), trazas de agentes de código held-out | 0,00626 | 0 |
| KL(BF16 ‖ modelo), texto general held-out (ponderado) | 0,01719 | 0 |

Nota del autor: una tarea de DeepSWE (langchain-request-coalescing) agotó dos veces el límite nativo de 1.800 s del verificador y se calificó con la regla de tests faltantes de la propia tarea (pytest paró a los 600 s; los tests ausentes del informe cuentan como fallidos): 42/50 feature tests. DeepSWE se ejecutó con scaffold de Claude Code contra el modelo servido en SGLang con TP4 y decodificación especulativa, 24 tareas simultáneas y un límite de 3 horas por tarea; los repositorios de calibración del agente de código son disjuntos de las tareas de evaluación.

## Requisitos de hardware

- VRAM en BF16 (copia de la raíz): aproximadamente 56 GB de pesos, más overhead de activaciones y caché KV; requiere GPUs de 80 GB o tensor-parallel en varias.
- VRAM en formato nativo (cuando se publiquen los kernels): aproximadamente 15 GB de pesos, lo que permitiría despliegue en una sola GPU de 24 GB o en configuraciones TP4 más pequeñas.
- GPUs recomendadas: A100 80 GB o H100 para BF16; para el formato nativo, tarjetas de 24-48 GB (RTX 4090, L40S, A6000) serían suficientes en cuanto a pesos, aunque el rendimiento real depende de los kernels aún no publicados.
- Consumer GPU: el formato nativo de ~15 GB cabría en RTX 4090 (24 GB) y en GPUs de 16 GB con margen ajustado; la copia BF16 no cabe en consumer GPU.
- Opciones de despliegue: transformers, SGLang y vLLM para los pesos BF16 (así se sirvieron las evaluaciones); el formato nativo requerirá kernels específicos aún en desarrollo.
- Latencia y throughput: en el formato nativo, la decodificación rinde actualmente entre 0,7 y 0,9 veces la velocidad de BF16 por paso, según el batch; no se publican cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-trellis-3.0bpw (este) | 27,78 B | no disponible | 3,0 bpw, anchos mixtos 2-6 bits | Apache-2.0 | Pesos BF16 publicados; formato nativo anunciado sin fecha |
| Qwen/Qwen3.8-27B (base) | 27 B (aproximado, según nombre) | no disponible | BF16 | Apache-2.0 | Publicado en Hugging Face |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 27 B (aproximado) | no disponible | típicamente 4-8 bits | Apache-2.0 (heredada) | No verificadas en la información disponible |

No se dispone de datos de benchmarks de las alternativas en la información proporcionada, por lo que la comparación de rendimiento se limita a la tabla de benchmarks frente al BF16 del propio modelo base.

## Limitaciones y advertencias

- El repositorio publicado contiene solo los pesos BF16 desconvolucionados: no ahorra memoria ni acelera la inferencia; el beneficio de los 3 bpw llegará con la carpeta `native/`, aún no disponible.
- Los kernels que decodifican los códigos directamente están en desarrollo y sin publicar; la velocidad en ese formato es de 0,7-0,9x la de BF16 por paso, es decir, más lenta, no más rápida.
- Los benchmarks son de un solo intento; el propio autor advierte que las diferencias pequeñas son ruido (la diferencia emparejada en DeepSWE es +0,4 puntos con error estándar de 3,5).
- Una tarea de DeepSWE agotó el límite del verificador y se calificó con una regla especial, lo que introduce incertidumbre en esa medición concreta.
- No se documentan sesgos conocidos, riesgos de alucinación específicos, ni la lista de idiomas soportados más allá de los 11 de MGSM.
- La longitud de contexto no se indica en la información disponible; no debe asumirse la del modelo base sin verificarla.
- El uso comercial está permitido por la licencia Apache-2.0, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.8-27B del que derivan los pesos.
- El autor no publica cifras de throughput absoluto ni latencia por token, solo el ratio relativo frente a BF16.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-09; se trata de una publicación muy reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/the-sweater-cat/Qwen3.8-27B-trellis-3.0bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
