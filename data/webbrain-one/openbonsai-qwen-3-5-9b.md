# webbrain-one/openbonsai-qwen-3.5-9b

## Resumen

OpenBonsai Qwen3.5-9B es una versión comprimida a pesos ternarios del modelo Qwen/Qwen3.5-9B, publicada por el autor webbrain-one mediante el framework de compresión OpenBonsai (Apache-2.0). Cada peso se reduce a uno de tres valores ({-1, 0, +1}) agrupados en bloques de 128 con una escala fp16 por grupo, lo que da lugar a un único fichero GGUF de 1.997.486.976 bytes (aproximadamente 2 GB) en formato PTQ1_0. El objetivo es demostrar que es posible aplicar cuantización post-entrenamiento extrema (1,58 bits) a un modelo de 9.000 millones de parámetros usando una sola GPU de consumo.

El modelo se presenta explícitamente como *research preview*: sirve para experimentación, no como producto acabado. Su capacidad matemática y, sobre todo, de código queda muy por debajo del modelo original, según los resultados publicados por el propio autor. El proyecto es independiente y no está afiliado a Prism ML, aunque reutiliza su formato de pesos y requiere su fork de llama.cpp, ya que el llama.cpp upstream no soporta PTQ1_0.

La relevancia actual reside en el pipeline de compresión: calibración con trazas autogeneradas por el propio modelo (1,74 millones de tokens), rotación Hadamard, GPTQ secuencial, embeddings y cabeza de salida también ternarios, y destilación de escalas contra las salidas top-64 del modelo BF16. Todo el proceso se completó en una RTX 5090 en unas 4,5 horas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); pesos ternarios {-1, 0, +1} en grupos de 128 con una escala fp16 por grupo |
| Parametros totales | 9B (modelo base Qwen3.5-9B); no se detalla el desglose en la informacion disponible |
| Parametros activos | No aplica (no es MoE); no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria 1,58 bits, PTQ1_0 (post-training quantization); 202 matrices ternarias, incluidas embedding y cabeza de salida |
| Idiomas soportados | No disponibles; los datos de calibracion son casi exclusivamente en ingles y el autor advierte de salida debil en otros idiomas |
| Licencia | Apache-2.0 (siguiendo el modelo base Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (fichero `OpenBonsai-Qwen3.5-9B-PTQ1_0.gguf`, 1.997.486.976 bytes, SHA-256 `4f2f3d1069a505059126e13ed1d2d7928e715930fe83f6d284426c4b19e35532`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del transformer Qwen3.5-9B, sin torre de visión ni capas MTP (multitoken prediction): es un modelo solo de texto. La intervención de OpenBonsai no cambia el grafo, sino que sustituye las 202 matrices grandes por representaciones ternarias con el mismo layout de tensores que Ternary-Bonsai-2-9B de Prism ML, de modo que el runtime de Prism puede cargar el fichero. El chat template y el tokenizer van embebidos en el GGUF.

El proceso de compresión consta de seis pasos: (1) generación de trazas propias, en las que el modelo BF16 responde a 1.520 prompts (1,74 millones de tokens) procedentes de los splits de entrenamiento de GSM8K, MATH, MBPP y OpenCodeInstruct, más chat general, con thinking activado y desactivado, siguiendo la idea AYOT de ScaleQ-1.58 (arXiv 2608.01078) y con un guardia anti-contaminación que rechaza problemas de los conjuntos de evaluación; (2) rotación de signo más Hadamard en el layout de Prism; (3) redondeo ternario mediante GPTQ secuencial sobre 256 × 2.048 tokens, la mitad trazas propias y el resto WikiText-2 train y UltraChat; (4) embeddings y cabeza de salida también ternarios vía GPTQ; (5) destilación de escalas de extremo a extremo contra las salidas top-64 del modelo BF16 sobre 3,1 millones de tokens (42 % trazas), con los códigos congelados; y (6) exportación verificada a PTQ1_0. El autor subraya que esta no es la receta de Prism ML, que no se ha publicado: solo se comparte el formato de fichero.

## Capacidades

- Generación de texto y razonamiento en inglés, con modo thinking opcional heredado del modelo base.
- Razonamiento matemático básico: 69/100 en un subconjunto congelado de GSM8K con thinking desactivado y 25/50 con thinking activado.
- Generación de código funcional limitada: 19/50 en HumanEval sin thinking y 10/25 con thinking, claramente por debajo del modelo BF16.
- Comprensión lectora y conocimiento general moderados: 84/100 en 20 preguntas de ARC-Easy.
- Ejecución en CPU: el autor probó una compilación CPU en el commit `c9c34bc` del fork de Prism; la build CUDA no está probada.
- No soporta visión (sin torre visual) ni capas MTP.
- No hay información publicada sobre tool calling, function calling, uso de agentes o capacidades multilingües; el autor indica que la salida en idiomas distintos del inglés es débil.

## Casos de uso

- Investigación en cuantización extrema: servir como referencia reproducible de un pipeline PTQ ternario completo (trazas autogeneradas, Hadamard, GPTQ, destilación de escalas) para comparar variantes del método sobre el mismo modelo base.
- Experimentos en hardware de gama baja: con 2 GB de pesos, permite probar inferencia de un modelo de 9B en portátiles o CPUs sin GPU dedicada, midiendo latencia y calidad reales en ese régimen.
- Aprendizaje y docencia sobre formatos GGUF: el fichero y su SHA-256 permiten ilustrar el ciclo completo de exportación, verificación e integración en un runtime modificado.
- Evaluación de runtimes: útil para validar el soporte de PTQ1_0 en el fork de llama.cpp de Prism frente a otras implementaciones, incluyendo pruebas de perplejidad y de aceptación especulativa.
- Prototipado de asistentes conversacionales en inglés donde la huella de memoria sea el criterio dominante y la calidad de código o de matemáticas no sea crítica, como demos internas o pruebas de concepto.
- Estudio de degradación de capacidades: comparar sus resultados con los del BF16 en GSM8K, HumanEval y WikiText permite analizar empíricamente qué habilidades se pierden antes con la cuantización ternaria.
- Base para experimentos de destilación de escalas: al estar el modelo ternario congelado, se puede iterar sobre la fase de escalas sin recompilar los códigos.

## Benchmarks y rendimiento

Datos publicados por el autor. Cada fila es una única ejecución sobre conjuntos de evaluación pequeños: GSM8K con un subconjunto congelado de 100 problemas y HumanEval con 50, con tope de 512 tokens y thinking desactivado; "on" significa thinking activado, usando los primeros 50 y 25 problemas de esos subconjuntos con tope de 4.096 tokens. "Dev" son 2.048 tokens de test de WikiText-2 y 20 preguntas de ARC-Easy. EAR es la tasa de aceptación esperada frente a BF16 sobre 4.088 tokens, Σ min(p, q).

| Modelo | GSM8K off | HumanEval off | GSM8K on | HumanEval on | Dev NLL (menor mejor) | ARC /100 | EAR |
|---|---|---|---|---|---|---|---|
| Qwen3.5-9B BF16 | 77/100 | 44/50 | 36/50 | 22/25 | 2,423 | 97 | 1 |
| Ternary-Bonsai-2-9B (Prism ML) | 77/100 | 45/50 | 46/50 | 24/25 | 3,191 | – | 0,676 |
| **Este modelo** | **69/100** | **19/50** | **25/50** | **10/25** | 2,960 | 84 | 0,706 |
| Versión anterior (calibración genérica) | 30/100 | 6/50 | 19/50 | 3/25 | 2,887 | 89 | 0,737 |

Notas del autor: calibrar sobre las propias respuestas de matemáticas y código más que duplicó todas las puntuaciones de razonamiento respecto a la versión anterior, con un coste pequeño en NLL de WikiText y en ARC. El código es la debilidad más clara (19/50 frente a 44-45). Con thinking activado el modelo suele razonar más allá del tope de 4.096 tokens: agotó el límite en 23 de 50 problemas de GSM8K, frente a 14 del BF16 y 4 del modelo de Prism. En el runtime de Prism, la perplejidad en test de WikiText-2 (8 × 512 tokens) es 12,59, frente a 16,51 de Ternary-Bonsai-2-9B y 11,93 de la versión anterior de OpenBonsai. El propio autor advierte que WikiText está parcialmente en dominio, porque los datos de calibración incluyen WikiText-2 train.

## Requisitos de hardware

- Peso del fichero GGUF: 1.997.486.976 bytes (aproximadamente 2 GB); el modelo completo en memoria ronda los 2 GB más la caché KV, mucho menos que los ~18 GB de pesos BF16 equivalentes.
- GPU: cabe con holgura en cualquier GPU de consumo con 4 GB o más de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090); no hay cifras publicadas de VRAM medida ni de GPU de datacenter (A100, H100).
- CPU: la compilación probada por el autor es de CPU en el fork de Prism (commit `c9c34bc`); el despliegue sin GPU es viable por tamaño.
- Runtime obligatorio: fork de llama.cpp de Prism ML (https://github.com/PrismML-Eng/llama.cpp); el llama.cpp upstream no soporta PTQ1_0. Invocación de ejemplo: `llama-cli -m OpenBonsai-Qwen3.5-9B-PTQ1_0.gguf -p "Explain why the sky is blue." -n 256`.
- La build CUDA de ese fork no está probada según el autor.
- No se han publicado datos de latencia ni de throughput (tokens/s); no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / formato | GSM8K off | HumanEval off | Dev NLL | ARC /100 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| OpenBonsai Qwen3.5-9B | 9B | Ternaria 1,58 bits, GGUF PTQ1_0 | 69/100 | 19/50 | 2,960 | 84 | Apache-2.0 | HuggingFace (webbrain-one), research preview |
| Ternary-Bonsai-2-9B (Prism ML) | 9B | Ternaria, formato PTQ1_0 de Prism | 77/100 | 45/50 | 3,191 | – | no disponible en la informacion | Producto de Prism ML; receta no publicada |
| Qwen3.5-9B BF16 (modelo base) | 9B | BF16 | 77/100 | 44/50 | 2,423 | 97 | Apache-2.0 | HuggingFace (Qwen) |
| Version anterior de OpenBonsai (calibracion generica) | 9B | Ternaria, GGUF PTQ1_0 | 30/100 | 6/50 | 2,887 | 89 | Apache-2.0 | Version previa del mismo proyecto |

Lectura: frente a Prism ML, este modelo queda por detrás en razonamiento y código, pero obtiene mejor NLL de WikiText y mayor EAR (0,706 frente a 0,676). Frente al BF16, la pérdida en código es severa (19/50 frente a 44/50) y moderada en GSM8K sin thinking (69 frente a 77).

## Limitaciones y advertencias

- Research preview declarado por el autor: útil para experimentos, no para producción.
- Capacidad de código muy degradada: 19/50 en HumanEval sin thinking frente a 44/50 del BF16 y 45/50 de Prism.
- Razonamiento matemático por debajo del original, especialmente con thinking activado (25/50 frente a 36/50 del BF16 y 46/50 de Prism).
- Tiende a razonar en exceso con thinking activado: agotó el tope de 4.096 tokens en 23 de 50 problemas de GSM8K, lo que encarece la inferencia y trunca respuestas.
- Idiomas: los datos de calibración son casi exclusivamente en inglés y el autor califica la salida no inglesa como débil; no se declaran idiomas soportados.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Riesgo de alucinación: no cuantificado; el NLL de 2,960 en WikiText-2 (frente a 2,423 del BF16) indica mayor incertidumbre del modelo.
- Dependencia de un runtime no estándar: requiere el fork de llama.cpp de Prism; upstream no carga PTQ1_0. La ruta CUDA no está validada.
- Las cifras de WikiText están parcialmente en dominio (WikiText-2 train forma parte de la calibración) y favorecen a este modelo; los conjuntos de evaluación de ARC, GSM8K y HumanEval sí están libres de contaminación según el autor.
- Los benchmarks son de una sola ejecución sobre subconjuntos pequeños (100 y 50 problemas), por lo que la varianza no está caracterizada.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base Qwen/Qwen3.5-9B y el proyecto no está afiliado ni respaldado por Prism ML; el nombre "Bonsai" es producto de Prism.
- Atribución de datos de calibración: GSM8K (MIT), MATH (MIT), MBPP (CC-BY-4.0), OpenCodeInstruct (CC-BY-4.0), UltraChat (MIT) y WikiText-2 (CC BY-SA); conviene revisar las obligaciones de atribución de las licencias CC-BY y CC BY-SA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/webbrain-one/openbonsai-qwen-3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Framework OpenBonsai (repositorio): https://github.com/esokullu/openbonsai
- Notas de método: https://github.com/esokullu/openbonsai/blob/main/docs/method.md
- Fork de llama.cpp de Prism ML (runtime necesario): https://github.com/PrismML-Eng/llama.cpp
- Paper de referencia citado, ScaleQ-1.58: arXiv 2608.01078 (sin URL completa en la información disponible)
