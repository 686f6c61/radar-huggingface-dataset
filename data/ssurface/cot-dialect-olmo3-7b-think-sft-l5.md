# ssurface/cot-dialect-olmo3-7b-think-sft-l5

## Resumen

`cot-dialect-olmo3-7b-think-sft-l5` es un adaptador LoRA desarrollado por ssurface (Anatolii Frolov) sobre el modelo base `allenai/Olmo-3-7B-Think` de AI2. Su propósito es comprimir las cadenas de razonamiento (chain-of-thought) a un nivel extremo denominado L5, donde la cadena de pensamiento se reduce a una única expresión colapsada, como `18/3*2=12`. El adaptador se entrena mediante supervisión fina (SFT) por destilación sobre el conjunto de entrenamiento de GSM8K, re-expresado a ese nivel de compresión por un modelo profesor.

El problema que aborda es la eficiencia del razonamiento: las cadenas de pensamiento largas generan muchos tokens de salida, lo que encarece la inferencia. Este adaptador explora hasta qué punto se puede comprimir el razonamiento sin perder demasiada precisión, reduciendo la longitud mediana de las cadenas de 532 caracteres (nivel L1) a 16 caracteres (nivel L5), un factor de 33x. La relevancia actual radica en la creciente demanda de modelos de razonamiento más rápidos y baratos para entornos de producción con restricciones de latencia.

El modelo base es un transformer denso de 7B parámetros, parte de la familia Olmo 3, que soporta razonamiento de contexto largo, function calling, coding e instrucciones. El adaptador solo añade unos pocos millones de parámetros (repo de 0.2 GB) y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Olmo-3-7B-Think) con adaptador LoRA |
| Parametros totales | 7B (base) + adaptador LoRA (r=16, no especificado el numero exacto) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el base Olmo 3 soporta contexto largo, pero no se indica el valor) |
| Tipos de cuantizacion | No disponible (entrenado en bf16, no se publican cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador LoRA) + safetensors (modelo base) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `allenai/Olmo-3-7B-Think`, un transformer denso de 7B parámetros de la familia Olmo 3, diseñado para razonamiento de contexto largo, function calling, coding y chat. El adaptador LoRA utiliza r=16, alpha=32 y dropout de 0.05, y se entrena durante 3 épocas con una tasa de aprendizaje de 2e-4 (cosine, warmup 0.03), batch efectivo de 64, secuencia máxima de 1024 tokens y precisión bf16. El entrenamiento se realizó en una única GPU A100 80GB.

El dataset de entrenamiento son 6993 ejemplos de GSM8K train, re-expresados a nivel L5 por un modelo profesor, donde la cadena de razonamiento dentro de la etiqueta `thinking` tiene una longitud mediana de 16 caracteres. La pérdida se calcula solo sobre la parte de completado, con longitudes de prompt precomputadas en tiempo de carga (no por búsqueda de patrones, que en intentos anteriores enmascaraba incorrectamente y dejaba filtrar el sesgo de tool-calling del modelo base). Esta es la innovación principal: comprimir el razonamiento a un "dialecto" extremadamente conciso, sacrificando precisión a cambio de eficiencia.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas a nivel L5 (expresión colapsada, p.ej. `18/3*2=12`).
- Generacion de texto en ingles siguiendo el formato de instruccion `Solve this using Level 5 (Extreme). Problem: {problema}`.
- Soporte de tool calling: no añadido por el adaptador (el base lo tiene, pero el adaptador no lo explota).
- Soporte de agentes y multi-step reasoning: limitado, ya que el razonamiento se colapsa a un solo paso.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: ninguna adicional (sin vision, audio, etc.).

## Casos de uso

- Investigacion en compresion de razonamiento: permite estudiar el trade-off entre longitud de cadena de pensamiento y precision, comparando con niveles L1-L4 de la misma familia.
- Inferencia de bajo coste en matematicas: al generar cadenas de solo 16 caracteres, el coste por consulta se reduce drasticamente respecto a modelos con razonamiento verboso, util para prototipos con presupuesto limitado.
- Evaluacion de modelos distilados: sirve como referencia para medir cuanta informacion se pierde al comprimir el razonamiento en tareas de aritmetica basica.
- Prototipado de asistentes educativos de matematicas: puede generar respuestas directas a problemas de nivel escolar con un unico paso, adecuado para entornos donde se prioriza la velocidad sobre la explicacion.
- Analisis de robustez bajo compresion extrema: util para detectar en que punto la compresion degrada la capacidad de generalizacion del modelo base.
- Benchmarking de eficiencia en GPU: al reducir la longitud de salida, se puede medir el throughput en GPUs consumer y comparar con el modelo base sin adaptador.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en GSM8K (test, n=1317, greedy decoding, single-turn, sin ejemplos y sin self-consistency):

| Modelo | GSM8K (accuracy, exact match) |
|---|---|
| cot-dialect-olmo3-7b-think-sft-l5 | 57.6% |

No se publican comparativas con el modelo base sin adaptador ni con otros niveles de compresion. El autor indica que la precision cae con la dificultad del problema y que diferencias de un par de puntos porcentuales estan dentro del ruido (95% half-width ~2.7 pp a n=1317).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador ocupa 0.2 GB, pero el modelo base en bf16 requiere ~14 GB de VRAM. Con cuantizacion (no publicada) podria caber en 8-12 GB, pero no hay datos oficiales.
- GPU recomendadas: para entrenamiento se uso 1x A100 80GB. Para inferencia, una RTX 4090 (24 GB) o A100 40GB son suficientes en bf16.
- Si cabe en consumer GPU: si, en GPUs con 16 GB o mas (RTX 4080/4090, etc.) sin cuantizacion; con cuantizacion podria caber en 8 GB, pero no se proporcionan archivos GGUF.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (si se convierte a un formato compatible con LoRA, aunque no esta documentado), llama.cpp (requiere conversion a GGUF, no disponible).
- Latencia y throughput estimados: no disponibles. La compresion de salida reduce el numero de tokens generados, lo que mejora la latencia respecto al base, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos publicados para comparar directamente con otros adaptadores de la familia de compresion (niveles L1-L4) ni con el modelo base sin adaptador. Cualitativamente, el base `allenai/Olmo-3-7B-Think` deberia tener mayor precision en GSM8K (al no comprimir el razonamiento), pero con cadenas mucho mas largas (mediana 532 caracteres en L1). Alternativas como `allenai/Olmo-3-7B-Think-SFT` (version SFT oficial) ofrecen un rendimiento superior en razonamiento, pero sin la compresion extrema. No se puede cuantificar la diferencia sin benchmarks adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no generaliza a otros dominios de razonamiento o generacion de texto.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles mas comprimidos (L5 es el mas extremo).
- Solo soporta ingles; no hay soporte multilingue.
- El razonamiento colapsado a una sola expresion puede producir errores aritmeticos o de logica que no son detectables sin una cadena explicita.
- Es un adaptador de investigacion, no listo para produccion: no incluye self-consistency, ni manejo de errores, ni validacion de salida.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base tambien es Apache-2.0, por lo que no hay restricciones de licencia adicionales.
- La variabilidad entre semillas es alta (diferencias de ~2.7 pp en GSM8K), por lo que los resultados pueden no ser reproducibles exactamente.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Version SFT oficial del base: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Paper Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio OLMo-core (scripts de entrenamiento): https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
- Repositorio open-instruct (scripts de entrenamiento): https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md
