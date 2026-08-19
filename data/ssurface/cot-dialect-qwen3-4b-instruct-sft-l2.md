# ssurface/cot-dialect-qwen3-4b-instruct-sft-l2

## Resumen

`cot-dialect-qwen3-4b-instruct-sft-l2` es un adaptador LoRA publicado por el usuario `ssurface` (Anatolii Frolov, según la cita de la model card) que transforma el modelo base `Qwen/Qwen3-4B-Instruct-2507` en un razonador especializado en cadenas de pensamiento comprimidas a un nivel denominado L2 (prosa concisa con pasos en viñetas). El objetivo es reducir drásticamente el número de tokens generados durante el razonamiento sin sacrificar precisión en problemas matemáticos, abordando así el coste de inferencia asociado a los modelos de razonamiento extenso.

El adaptador se entrena mediante fine-tuning supervisado por destilación sobre 6950 ejemplos del conjunto GSM8K, re-expresados por un modelo profesor en el dialecto L2. En la evaluación oficial, el modelo alcanza un 89,8 % de precisión exacta en GSM8K test (n=1317, decodificación greedy, una sola pasada, sin self-consistency). La relevancia actual reside en la creciente presión por reducir el coste computacional del razonamiento de largo recorrido, especialmente en despliegues con presupuesto de tokens limitado.

El adaptador es ligero (0,1 GB) y se distribuye en formato safetensors compatible con la librería PEFT. No es un modelo autónomo: requiere cargar el modelo base Qwen3-4B-Instruct-2507 y aplicar el adaptador sobre él. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso Qwen3-4B-Instruct-2507 (r=16, alpha=32, dropout=0.05) |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 4B parametros) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la ficha; heredada del modelo base (Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; el adaptador se distribuye en safetensors sin cuantizar) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo denso Qwen3-4B-Instruct-2507, un transformer causal de 4 000 millones de parametros con capacidad de tool calling y razonamiento, aunque esta variante Instruct-2507 no incluye modo thinking explicito. El adaptador LoRA emplea r=16, alpha=32 y dropout de 0,05, aplicado sobre las proyecciones del transformer.

El entrenamiento es una destilacion supervisada: un modelo profesor re-expresa los 6950 ejemplos de entrenamiento de GSM8K en el dialecto L2, caracterizado por cadenas de razonamiento de una longitud mediana de 140 caracteres dentro de la etiqueta `thinking`. La configuracion usa 3 epocas, tasa de aprendizaje 2e-4 con decaimiento coseno y warmup del 3 %, batch efectivo de 64 (16 x 4 acumulaciones), secuencia maxima de 1024 tokens, precision bf16 y una unica GPU NVIDIA A100 de 80 GB. La funcion de perdida se calcula solo sobre la finalizacion (completion), con las longitudes de prompt precomputadas en tiempo de carga para evitar el enmascaramiento accidental de tokens de prompt.

Un detalle tecnico relevante: el collator original basado en busqueda de patrones no enmascaraba nada, lo que permitia que el prior de tool calling del modelo base se filtrara en las cadenas generadas. El autor lo corrige precomputando las longitudes de prompt, aunque no se especifica si esta correccion se aplico en el entrenamiento final o solo en la evaluacion.

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras aritmeticas del conjunto GSM8K con una precision del 89,8 % en exact match.
- Generacion de cadenas de pensamiento comprimidas: produce razonamientos en estilo L2, con pasos en viñetas y prosa concisa, reduciendo la longitud mediana de la cadena a 140 caracteres frente a los 532 del nivel L1.
- Generacion de texto en ingles: el adaptador mantiene las capacidades generativas del modelo base, aunque esta especializado en tareas de razonamiento.
- No soporta tool calling de forma nativa: el adaptador no anade ni modifica esta capacidad; el modelo base si la tiene, pero el fine-tuning esta orientado a razonamiento matematico.
- No incluye modo thinking explicito: el modelo base Qwen3-4B-Instruct-2507 no tiene thinking mode, y el adaptador genera el razonamiento como parte de la salida estandar.
- Multilingue: limitado al ingles, segun la etiqueta `language: en`.

## Casos de uso

- Reduccion de coste de inferencia en razonamiento matematico: al generar cadenas de pensamiento 3,8 veces mas cortas que el nivel L1, el adaptador reduce el numero de tokens de salida y, por tanto, el coste por peticion en sistemas donde el precio depende del volumen de tokens.
- Destilacion de razonamiento comprimido: el adaptador puede servir como modelo profesor para generar datos de entrenamiento en dialecto L2, alimentando otros modelos mas pequenos o especializados.
- Evaluacion de dialectos de compresion de CoT: investigadores pueden usar este adaptador como punto de referencia para estudiar el equilibrio entre compresion y precision en cadenas de razonamiento.
- Integracion en pipelines de resolucion de problemas aritmeticos: en aplicaciones de calculo automatizado (facturacion, presupuestos, logistica), el modelo puede generar pasos de resolucion breves y auditables.
- Benchmarking de eficiencia de razonamiento: util para comparar el rendimiento de modelos con cadenas de pensamiento comprimidas frente a variantes sin compresion.
- Educacion matematica asistida: el modelo puede explicar la resolucion de problemas en pasos concisos, adecuados para interfaces de tutorizacion donde se prioriza la brevedad.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, sin verificacion independiente:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 89,8 % |

Condiciones de evaluacion: decodificacion greedy, una sola pasada, sin ejemplos (few-shot) y sin self-consistency. No se proporcionan resultados comparativos con el modelo base sin adaptador ni con otros niveles de compresion (L1, L3, L4, L5). El autor advierte que diferencias de un par de puntos porcentuales pueden estar dentro del ruido estadistico (95 % de intervalo de confianza de aproximadamente 2,7 puntos porcentuales para n=1317).

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,1 GB en disco, pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 completo.
- El modelo base en bf16 ocupa unos 8 GB de VRAM. Con el adaptador, la VRAM total necesaria para inferencia se situa en torno a 8-10 GB, dependiendo de la longitud de secuencia.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB), RTX 4090 (24 GB), A100 40/80 GB, H100. Cabe en GPUs consumer con 16 GB o mas, aunque para secuencias largas se recomienda al menos 24 GB.
- Opciones de despliegue: el adaptador se carga con `transformers` + `peft` (ver ejemplo en la model card). Tambien puede fusionarse en el modelo base para su uso con vLLM o TGI, aunque no se documenta ese proceso. llama.cpp no soporta LoRA directamente sin fusion previa.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud de la cadena de razonamiento generada; la compresion L2 reduce el numero de tokens de salida, lo que mejora el throughput en comparacion con el modelo base sin adaptador.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre este adaptador y otros modelos de la misma categoria. Como referencia estructural, se puede comparar con el modelo base y con otros adaptadores de la familia de dialectos de compresion (L1, L3-L5), pero no se han publicado metricas para estos ultimos.

| Modelo | Parametros | Contexto | GSM8K | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base) | 4B | No disponible en la ficha | No publicado | Apache 2.0 |
| cot-dialect-qwen3-4b-instruct-sft-l2 (este adaptador) | 4B + LoRA | Heredado del base | 89,8 % | Apache 2.0 |
| Otros adaptadores de la familia (L1, L3-L5) | 4B + LoRA | Heredado del base | No publicado | Apache 2.0 |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no hay evidencia de rendimiento en otras tareas de razonamiento o generacion.
- La precision disminuye con la dificultad del problema, siendo la caida mas pronunciada en los niveles de compresion mas agresivos (L4, L5).
- Resultado de una unica semilla de entrenamiento; diferencias de 2-3 puntos porcentuales pueden deberse al azar (intervalo de confianza del 95 % de ~2,7 pp con n=1317).
- Solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- El adaptador no es un modelo autonomo: requiere el modelo base Qwen3-4B-Instruct-2507, lo que implica descargar y gestionar ambos componentes.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente en razonamiento aritmetico complejo.
- No se ha verificado de forma independiente el resultado de 89,8 % en GSM8K; el autor lo declara sin validacion externa.
- Para uso en produccion, se recomienda evaluar el modelo en el dominio especifico antes de desplegarlo, dado el estrecho ambito de entrenamiento.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l2
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio oficial de la serie Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
