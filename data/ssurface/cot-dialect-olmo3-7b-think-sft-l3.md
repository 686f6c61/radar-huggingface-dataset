# ssurface/cot-dialect-olmo3-7b-think-sft-l3

## Resumen

`ssurface/cot-dialect-olmo3-7b-think-sft-l3` es un adaptador LoRA (PEFT) que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think` para generar cadenas de pensamiento (chain-of-thought) comprimidas a un nivel denominado L3, caracterizado por una asignación simbólica por línea. El adaptador ha sido desarrollado por el autor ssurface (Anatolii Frolov) como parte de una investigación sobre "dialectos de compresión de chain-of-thought", con el objetivo de reducir la longitud del razonamiento sin sacrificar precisión en tareas matemáticas.

El modelo se entrena mediante fine-tuning supervisado por destilación sobre el conjunto de entrenamiento de GSM8K, re-expresado a nivel L3 por un modelo profesor. El resultado es un adaptador ligero (0.2 GB) que, aplicado sobre el base de 7B parámetros, alcanza un 76.0% de exactitud en el test de GSM8K con decodificación greedy. La relevancia actual radica en explorar cómo comprimir el razonamiento explícito para reducir costes computacionales y latencia en sistemas que requieren cadenas de pensamiento largas, manteniendo un rendimiento competitivo en problemas matemáticos.

El adaptador se distribuye bajo licencia Apache 2.0 y está diseñado para usarse con la librería `peft` junto a `transformers`, cargando el modelo base en bf16. No se especifican datos sobre la longitud de contexto ni la arquitectura interna del adaptador más allá de la configuración LoRA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Olmo-3-7B-Think (Transformer decoder) |
| Parametros totales | No disponible (adaptador de 0.2 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta contexto largo segun el paper de Olmo 3, pero no se especifica para este adaptador) |
| Tipos de cuantizacion | No disponible (entrenado en bf16; no se documentan cuantizaciones) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros de la familia Olmo 3 desarrollada por AI2, entrenado con el dataset Dolma 3 y optimizado para razonamiento de contexto largo, function calling, codigo y seguimiento de instrucciones. Sobre este base, el adaptador aplica una configuracion LoRA con r=16, alpha=32 y dropout=0.05, entrenada mediante supervised fine-tuning (destilacion) durante 3 epocas con learning rate 2e-4 (cosine, warmup 0.03), batch efectivo de 64, secuencia maxima de 1024 tokens y precision bf16. El entrenamiento se realizo en una unica GPU NVIDIA A100 80GB.

La innovacion principal es la compresion del chain-of-thought a un "dialecto" L3: en lugar de razonamientos verbosos, el modelo genera una secuencia de asignaciones simbolicas (por ejemplo, `p = 40`, `w = 2 * 4 = 8`, `T = p * w = 40 * 8 = 320`). Segun la model card, la longitud mediana de las cadenas varia desde 532 caracteres en el nivel L1 hasta 16 en el nivel L5, un rango de 33x; el nivel L3 tiene una mediana de 90 caracteres. Los datos de entrenamiento consisten en 6970 ejemplos de GSM8K re-expresados a este nivel por un modelo profesor. La funcion de perdida se aplica solo sobre la finalizacion, con longitudes de prompt precomputadas en tiempo de carga para evitar el enmascaramiento por busqueda de patrones.

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras aritmeticos multi-paso del conjunto GSM8K, generando cadenas de pensamiento comprimidas en formato simbolico.
- Generacion de texto con chain-of-thought: produce explicaciones paso a paso en un dialecto condensado, adecuado para tareas donde se requiere eficiencia en el numero de tokens generados.
- Especializacion en problemas matematicos: el adaptador esta entrenado exclusivamente con datos de GSM8K, por lo que su rendimiento en otras tareas no esta documentado.
- No se mencionan capacidades de tool calling, agentes, vision, audio ni soporte multilingue mas alla del ingles.

## Casos de uso

- Tutoria inteligente en matematicas: el modelo puede descomponer problemas aritmeticos en pasos simbolicos cortos, facilitando la generacion de explicaciones concisas para estudiantes en plataformas educativas. Su formato comprimido reduce la latencia en interacciones en tiempo real.
- Optimizacion de costes en razonamiento: en pipelines de agentes que requieren multiples llamadas al modelo, el dialecto L3 reduce el numero de tokens generados por paso, disminuyendo el coste de inferencia y la memoria necesaria.
- Generacion de soluciones para evaluacion automatica: puede utilizarse para producir respuestas paso a paso en sistemas de correccion automatica de ejercicios matematicos, donde la exactitud del resultado final (76% en GSM8K) es aceptable para entornos controlados.
- Investigacion sobre compresion de chain-of-thought: sirve como punto de referencia para estudiar como la reduccion de la longitud del razonamiento afecta a la precision, especialmente en comparacion con otros niveles de compresion (L1 a L5).
- Prototipado de sistemas de razonamiento eficiente: al ser un adaptador ligero, puede integrarse en aplicaciones donde el modelo base ya esta desplegado, sin necesidad de reentrenar el modelo completo.
- Benchmarking de destilacion por compresion: permite evaluar tecnicas de distillation en las que un modelo profesor genera datos comprimidos para entrenar adaptadores especializados, con aplicacion en dominios donde el coste de generacion es critico.

## Benchmarks y rendimiento

Segun la model card, el adaptador alcanza un 76.0% de exactitud (exact match) en el conjunto de test de GSM8K (n=1317) con decodificacion greedy, single-turn, sin ejemplos y sin self-consistency. No se proporcionan resultados para otros benchmarks ni comparaciones con el modelo base sin adaptador o con otros adaptadores de la familia.

| Benchmark | Metrica | Resultado |
|---|---|---|
| GSM8K (test, n=1317) | Accuracy (exact match) | 76.0% |

## Requisitos de hardware

- VRAM estimada: el adaptador en si ocupa 0.2 GB, pero el modelo base Olmo-3-7B-Think requiere aproximadamente 14 GB de VRAM en bf16 (sin cuantizacion). Con cuantizacion a 4 bits (no documentada para este adaptador) podria reducirse a unos 4-5 GB.
- GPU recomendadas: para entrenamiento se uso una NVIDIA A100 80GB. Para inferencia, una GPU con 16-24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G) es suficiente en bf16; una RTX 3060 12GB podria ser insuficiente para el modelo base completo.
- Si cabe en consumer GPU: si, en GPUs con al menos 16 GB de VRAM (RTX 4080, RTX 4090) para bf16; con cuantizacion podria caber en 8-12 GB, aunque no se documenta compatibilidad con cuantizacion para este adaptador.
- Opciones de despliegue: el adaptador se usa con HuggingFace `transformers` + `peft`, cargando el modelo base y luego el adaptador. No se mencionan opciones con vLLM, llama.cpp u Ollama, aunque el modelo base es compatible con estas herramientas.
- Latencia y throughput: no se proporcionan datos especificos. El uso del dialecto L3 reduce el numero de tokens generados, lo que disminuye la latencia en comparacion con cadenas de pensamiento completas.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables directamente. El adaptador es especifico para compresion de chain-of-thought sobre Olmo-3-7B-Think; no se han publicado comparaciones con otros adaptadores de compresion ni con el modelo base sin adaptar. Se puede indicar que el modelo base `allenai/Olmo-3-7B-Think` es un modelo de 7B parametros de la familia Olmo 3, con licencia Apache 2.0, pero no se dispone de datos de rendimiento de este base en GSM8K para contrastar.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no hay evidencia de rendimiento en otras tareas de razonamiento o generacion.
- La precision cae con la dificultad del problema, siendo mas pronunciada en los niveles de compresion mas agresivos (L4, L5).
- El entrenamiento se realizo con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de aproximadamente ±2.7 puntos en n=1317).
- No se documentan sesgos especificos, pero al estar entrenado solo con datos en ingles y de GSM8K, puede presentar limitaciones en otros idiomas o dominios.
- Riesgo de alucinacion: no evaluado; el formato simbolico comprimido podria producir errores aritmeticos sin explicacion detallada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el adaptador depende del modelo base Olmo-3-7B-Think, tambien bajo Apache 2.0.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l3
- Modelo base Olmo-3-7B-Think: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo base SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Repositorio open-instruct (scripts de entrenamiento): https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md
- Ficha del modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
