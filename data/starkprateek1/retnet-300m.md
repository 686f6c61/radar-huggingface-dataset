# starkprateek1/retnet-300m

## Resumen

RetNet-300M es un modelo de lenguaje de 310.135.136 parámetros entrenado desde cero por el desarrollador independiente starkprateek1. Implementa una Retentive Network (RetNet), una arquitectura alternativa al transformer estándar que sustituye la atención por un mecanismo de retención con formulación paralela en entrenamiento y recurrente en inferencia, lo que elimina la necesidad de caché KV y mantiene memoria constante por token generado. El modelo está orientado específicamente a razonamiento multi-paso en matemáticas y código.

Sobre la base RetNet, el autor incorpora tres modificaciones: una regla delta en la memoria con autovalores negativos (`beta_max = 2.0`) que permite sobrescribir valores almacenados en lugar de solo acumularlos, una convolución causal corta (`K = 4`) previa a las proyecciones q/k/v, y un mecanismo de calculadora en el bucle que resuelve aritmética exacta en tiempo de decodificación mediante la sintaxis `<<48/2=24>>24`.

Es relevante como pieza de investigación reproducible: se entrenó con aproximadamente 494M tokens en una única GPU T4 de 16 GB, lo que lo convierte en un banco de pruebas accesible para estudiar arquitecturas lineales y mecanismos de memoria. No es un modelo listo para producción: no está ajustado por instrucciones y su rendimiento en benchmarks es bajo en términos absolutos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Retentive Network (RetNet) con regla delta y convolución causal corta (K=4) |
| Parámetros totales | 310.135.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible |
| Licencia | MIT (código y pesos); los datasets de entrenamiento conservan sus propias licencias |
| Formato de pesos | safetensors (fp32; LM head atada al embedding y no almacenada) |

Otros datos técnicos: `d_model=1024`, `n_layers=22`, `n_heads=16`, vocabulario de 32.000 tokens con BPE de división de dígitos e ids 1-16 reservados para post-entrenamiento. Repo de 1,2 GB.

## Arquitectura y entrenamiento

RetNet reemplaza la atención softmax por retención multi-escala. En entrenamiento se computa en forma paralela (matriz de decaimiento por distancia), y en inferencia se ejecuta de forma recurrente con un estado por cabeza, de modo que la memoria por token generado es constante y no crece con la longitud de la secuencia. La variante de este modelo añade una regla delta con `beta_max = 2.0` y autovalores negativos, lo que habilita escritura destructiva sobre la memoria (sobrescribir en lugar de solo sumar), y una convolución causal de kernel 4 antes de las proyecciones q/k/v, que aporta contexto local inmediato.

El entrenamiento usó aproximadamente 494M tokens sobre una sola GPU T4 de 16 GB, a partir de los datasets `nampdn-ai/tiny-codes`, `nampdn-ai/tiny-textbooks`, `meta-math/MetaMathQA`, `openai/gsm8k`, `HuggingFaceTB/finemath` e `ise-uiuc/Magicoder-OSS-Instruct-75K`. No se documenta uso de RLHF ni DPO; el modelo es base, no ajustado por instrucciones. La innovación operativa destacable es la calculadora en el bucle: el modelo emite expresiones en formato `<<a op b=resultado>>` y el resultado exacto se inyecta en tiempo de decodificación, evitando que el error aritmético se propague por el razonamiento.

## Capacidades

- Generación de texto autoregresiva con decodificación recurrente y memoria constante por token.
- Razonamiento aritmético multi-paso asistido por calculadora en el bucle (formato `<<expr=result>>`).
- Generación de código, entrenada sobre `tiny-codes` y `Magicoder-OSS-Instruct-75K`, aunque con calidad limitada según los benchmarks.
- Tokenización con BPE de división de dígitos, pensada para representar números de forma más granular.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes, visión, audio ni modo de razonamiento explícito (thinking).
- Capacidades multilingües: no disponibles; no se especifican idiomas de entrenamiento.
- No es un modelo `transformers`: requiere el código del repositorio del autor para cargar pesos e inferir.

## Casos de uso

- Investigación en arquitecturas lineales: sirve como implementación de referencia pequeña y reproducible de RetNet con regla delta para comparar frente a transformers de tamaño similar en tareas controladas.
- Estudio del mecanismo de calculadora en el bucle: permite medir cuánto mejora el razonamiento aritmético al inyectar resultados exactos durante la decodificación (7,4% frente a 4,7% en GSM8K en la evaluación del autor).
- Experimentos de memoria recurrente: al no requerir caché KV, es útil para analizar coste de memoria y latencia en secuencias largas con presupuesto de VRAM muy reducido.
- Reproducción de pipelines de entrenamiento de bajo coste: el autor documenta un entrenamiento de 494M tokens en una T4 de 16 GB, replicable como base para fine-tuning didáctico.
- Generación de código en entornos de prueba: con 41% de salidas sintácticamente válidas en MBPP, puede emplearse para estudiar fallos de síntesis de código en modelos pequeños, no para producción.
- Base para post-entrenamiento: los ids 1-16 del vocabulario están reservados para post-entrenamiento, lo que facilita añadir tokens especiales en trabajos de instrucción o chat.
- Evaluación de sesgos y alucinación en modelos base pequeños: útil como sujeto de pruebas en estudios de fiabilidad antes de escalar conclusiones a modelos mayores.

## Benchmarks y rendimiento

Resultados zero-shot con decodificación greedy, publicados por el autor en la model card:

| Tarea | Resultado | Nota |
|---|---|---|
| GSM8K, calculadora en el bucle | 7,4% ± 1,6% | primeros 256 problemas de test |
| GSM8K, sin calculadora | 4,7% ± 1,3% | primeros 256 problemas de test |
| MBPP pass@1 | 0,4% | 41% de salidas sintácticamente válidas |
| ARC-easy (normalizado) | 36,0% | 500 preguntas, azar 25% |
| ARC-challenge (normalizado) | 21,2% | 500 preguntas, azar 25% |
| HellaSwag (normalizado) | 36,2% | 500 preguntas, azar 25% |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en fp32: 310M parámetros equivalen a aproximadamente 1,24 GB, coherente con el tamaño del repo (1,2 GB).
- Inferencia en fp32: en torno a 1,5-2 GB de VRAM contando estado recurrente y activaciones; cabe holgadamente en cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090).
- En fp16/bf16 el peso se reduce a unos 620 MB; no se publican pesos cuantizados, por lo que habría que generarlos.
- GPU recomendadas: T4 (fue la usada para entrenar), RTX 3060/4090 para experimentación, A100/H100 innecesarias por tamaño.
- Despliegue: no compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa; requiere el código del repositorio `prateekstark/retnet-300m` con PyTorch y `safetensors`.
- Latencia y throughput: no disponibles. La decodificación recurrente implica coste por token constante en memoria, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RetNet-300M (este) | 310M | no disponible | RetNet con regla delta y calculadora | MIT | Hugging Face + repo propio |
| GPT-2 small | 124M | 1.024 tokens | Transformer decoder | MIT | `transformers`, amplia herramienta |
| GPT-2 medium | 355M | 1.024 tokens | Transformer decoder | MIT | `transformers`, amplia herramienta |
| Qwen2.5-0.5B | 494M | 32.768 tokens | Transformer decoder | Apache 2.0 | `transformers`, vLLM, Ollama |

La comparación de rendimiento con alternativas no está disponible: no hay resultados de benchmarks de los modelos comparables en la información proporcionada, y las cifras de RetNet-300M corresponden a evaluaciones parciales (256 o 500 ejemplos) que no son directamente equiparables a las reportadas habitualmente por otros modelos.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: divaga y repite en prompts abiertos, según advierte el propio autor.
- Rendimiento muy bajo en tareas estándar: 0,4% pass@1 en MBPP y 21,2% en ARC-challenge, apenas por encima del azar en esta última.
- Riesgo elevado de alucinación y de errores aritméticos fuera del mecanismo de calculadora.
- Sin información sobre sesgos, composición lingüística del corpus ni filtrado de datos; los datasets de código y matemáticas pueden arrastrar sesgos de sus fuentes.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Idiomas soportados no especificados; se desconoce el comportamiento en castellano.
- Licencia MIT para código y pesos, pero los datasets de entrenamiento conservan sus licencias: hay que verificarlas antes de un uso comercial.
- No integrable en ecosistemas estándar (`transformers`, vLLM, TGI): implica mantenimiento del código de inferencia propio.
- Entrenado con solo 494M tokens: capacidad de conocimiento del mundo y generalización muy limitadas; no apto para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/starkprateek1/retnet-300m
- Repositorio de código: https://github.com/prateekstark/retnet-300m
- Dataset de código: https://huggingface.co/datasets/nampdn-ai/tiny-codes
- Dataset de textos sintéticos: https://huggingface.co/datasets/nampdn-ai/tiny-textbooks
- Dataset matemático: https://huggingface.co/datasets/meta-math/MetaMathQA
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset matemático FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset de código Magicoder: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
