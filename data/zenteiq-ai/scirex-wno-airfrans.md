# zenteiq-ai/scirex-wno-airfrans

## Resumen

ScireX WNO · AirfRANS es un operador neuronal (neural operator) entrenado para el benchmark AirfRANS de dinámica de fluidos computacional (CFD). Lo desarrolla zenteiq-ai dentro de la biblioteca de código abierto scirex, implementada en JAX/Flax. El modelo resuelve el problema de predecir campos físicos continuos (velocidad, presión y viscosidad turbulenta) sobre mallas de nodos que representan perfiles aerodinámicos, sustituyendo la simulación numérica iterativa por una inferencia directa.

Se trata de un Wavelet Neural Operator (WNO), una arquitectura que aplica transformadas wavelet para capturar estructuras multiescala en las ecuaciones en derivadas parciales (PDE). Con 3.964.728 parámetros, es un modelo muy compacto orientado a la investigación en surrogate modeling y no a generación de lenguaje. Los pesos publicados corresponden a la última época de un entrenamiento de 500 épocas con semilla 0.

Su relevancia radica en que demuestra que un operador neuronal de menos de 4 millones de parámetros puede superar en varias métricas del benchmark AirfRANS a arquitecturas de referencia como Transolver, especialmente en la predicción del coeficiente de sustentación (C_L) y en las métricas sobre nodos de pared (Surf). Es una pieza útil para quienes investigan métodos de ML para física y quieren reproducir resultados de forma barata (el entrenamiento declarado es de unas 1,8 horas en media GPU).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wavelet Neural Operator (WNO) con encoder de rejilla 128 x 256, wavelet db4, nivel 4 y decoder MLP por nodo |
| Parametros totales | 3.964.728 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de operador sobre mallas, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no aplica (modelo de física, no lingüístico) |
| Licencia | Apache 2.0 para los pesos; código LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `sample.safetensors` |

## Arquitectura y entrenamiento

El modelo es un Wavelet Neural Operator (WNO), descrito en el artículo de Tripura y Chakraborty (2022, arXiv:2205.02191). La arquitectura aplica una transformada wavelet discreta (db4, nivel 4) sobre una rejilla de 128 x 256 para descomponer la señal en múltiples escalas, opera sobre los coeficientes en el dominio wavelet y reconstruye la salida mediante un decoder MLP aplicado por nodo. La entrada por nodo de malla incluye posición, distancia firmada a la pared, normal de pared y velocidad de entrada; la salida es velocidad, presión y viscosidad turbulenta en cada nodo.

El entrenamiento sigue la misma receta que la ejecución de Transolver del mismo benchmark: optimizador Adam con one-cycle, EMA de 0,9995, clipping de 10, 32.000 nodos por caso y paso, 500 épocas y semilla 0. Los pesos publicados son los del EMA tras la última época. El conjunto de datos es AirfRANS (Bonnet et al., NeurIPS 2022), con 720 casos de entrenamiento, 80 de validación y 200 de test. Las estadísticas de normalización están en `config.json` y son imprescindibles: los pesos no son utilizables sin ellas. El tiempo de entrenamiento declarado es de aproximadamente 1,8 horas en media GPU.

## Capacidades

- Predicción de campos de flujo sobre mallas de perfiles aerodinámicos: velocidad, presión y viscosidad turbulenta en cada nodo.
- Cálculo implícito de magnitudes derivadas de interés ingenieril, como el coeficiente de sustentación (C_L), evaluado en el benchmark.
- Generalización sobre geometrías dentro del rango de entrenamiento del dataset AirfRANS.
- Inferencia determinista y rápida en comparación con simulaciones CFD clásicas, al ser un surrogate model.
- Integración con el ecosistema JAX/Flax y con los scripts de evaluación del repositorio scirex.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo numérico especializado.

## Casos de uso

- Investigación en surrogate modeling para CFD: usar el modelo como referencia reproducible del benchmark AirfRANS para comparar nuevas arquitecturas de operadores neuronales con una métrica estandarizada.
- Optimización de diseño aerodinámico preliminar: evaluar rápidamente el C_L y los campos de flujo de perfiles dentro del rango del dataset para filtrar candidatos antes de lanzar simulaciones CFD completas.
- Docencia y divulgación sobre ML para física: el reducido tamaño (3,96 M de parámetros) y el entrenamiento corto (1,8 h en media GPU) permiten reproducir el pipeline completo en un entorno académico.
- Validación de instalaciones y pipelines: el fichero `sample.safetensors` con una entrada de test y la salida esperada permite comprobar que el entorno de inferencia está correctamente configurado.
- Desarrollo de métodos híbridos PDE-ML: comparar la precisión de un operador wavelet frente a un solucionador numérico en regímenes concretos del dataset.
- Benchmarking de hardware y frameworks: al ser un modelo pequeño en JAX/Flax, sirve para medir latencia de inferencia de operadores neuronales en distintas GPUs sin cuellos de botella de memoria.
- Extensión a otros dominios físicos: el mismo WNO se publica para Darcy 2D, flujo en tubería, Navier-Stokes 2D y refrigeración de chips, lo que permite reutilizar la arquitectura como base.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los 200 casos de test de AirfRANS, con el código de métricas del artículo de Transolver:

| Metrica | Este modelo (WNO) | Referencia publicada (Transolver) |
|---|---|---|
| Volume (MSE normalizado en nodos no de pared) | 0,4465 % | 0,37 % |
| Surf (MSE normalizado en nodos de pared) | 0,145 % | 1,42 % |
| Error relativo de C_L | 2,97 % | 10,30 % |
| Spearman ρ_L | 0,99958 | 0,9978 |

La model card advierte que la métrica Surf podría definirse en el artículo original únicamente como MSE de presión en pared, lo que sería 4 veces mayor que lo reportado aquí; conviene consultar la página de benchmarks del repositorio. Los porcentajes son el MSE normalizado multiplicado por 100.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 1 GB, dado que el modelo tiene 3.964.728 parámetros (unos 16 MB en fp32).
- GPU recomendadas: cualquier GPU con soporte JAX/CUDA; el entrenamiento se realizó en media GPU, por lo que una RTX 3060 o superior es suficiente para inferencia y reproducción.
- Cabe holgadamente en GPUs de consumo (RTX 20xx, 30xx, 40xx) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: scripts de inferencia del repositorio scirex (`scripts/benchmarks/airfrans/infer.py`) sobre JAX/Flax; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; el entrenamiento declarado es de aproximadamente 1,8 horas en media GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Benchmark | Volume | Surf | Error C_L | Licencia |
|---|---|---|---|---|---|---|
| ScireX WNO (este) | 3.964.728 | AirfRANS | 0,4465 % | 0,145 % | 2,97 % | Apache 2.0 |
| ScireX Transolver | no disponible | AirfRANS | no disponible | no disponible | no disponible | Apache 2.0 |
| ScireX GINO | no disponible | AirfRANS | no disponible | no disponible | no disponible | Apache 2.0 |
| Transolver (referencia del artículo) | no disponible | AirfRANS | 0,37 % | 1,42 % | 10,30 % | no disponible |

Los checkpoints de Transolver y GINO del mismo autor están publicados en Hugging Face, pero la información proporcionada no incluye sus métricas ni su número de parámetros. La comparación directa con Transolver solo es posible en las métricas citadas en la model card.

## Limitaciones y advertencias

- Validez restringida al rango de entrada del dataset AirfRANS: no debe usarse fuera de las condiciones de entrenamiento sin validación adicional.
- No apto para diseño safety-critical sin validación independiente, según advierte el propio autor.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- Riesgo de extrapolación incorrecta en geometrías o regímenes de flujo no representados en el dataset.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- Sesgos: no documentados en la información disponible; al entrenarse con un dataset físico concreto, hereda sus sesgos de cobertura geométrica y de condiciones de contorno.
- Licencia: pesos bajo Apache 2.0, código bajo LGPL-3.0 y datos AirfRANS bajo ODbL v1.0; el uso comercial de los pesos está permitido, pero conviene revisar las obligaciones derivadas del dataset y del código.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- La métrica Surf puede no ser directamente comparable con la literatura si la definición difiere, como advierte la propia model card.

## Enlaces

- Hugging Face: https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Página de benchmarks AirfRANS: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/airfrans/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues: https://github.com/zenteiq-research/scirex/issues
- Artículo WNO: https://arxiv.org/abs/2205.02191
- Checkpoint GINO AirfRANS: https://huggingface.co/zenteiq-ai/scirex-gino-airfrans
- Checkpoint Transolver AirfRANS: https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
- Checkpoint WNO Darcy 2D: https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- Checkpoint WNO Darcy 2D physics-only: https://huggingface.co/zenteiq-ai/scirex-wno-darcy-physics-extra-fields
- Checkpoint WNO Pipe flow: https://huggingface.co/zenteiq-ai/scirex-wno-pipe
- Checkpoint WNO Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-wno-navier-stokes
- Checkpoint WNO Chip cooling: https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
