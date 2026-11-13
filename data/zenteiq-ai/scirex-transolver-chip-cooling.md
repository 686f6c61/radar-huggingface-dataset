# zenteiq-ai/scirex-transolver-chip-cooling

## Resumen

ScireX Transolver · Chip cooling es un operador neuronal entrenado (neural operator) para resolver un problema concreto de transferencia de calor en placas frias de doble chip (dual-chip cold plate). Lo desarrolla el proyecto zenteiq-ai dentro de la libreria open source scirex (JAX/Flax), y los pesos publicados corresponden a la ultima epoca de un entrenamiento reproducible sobre el benchmark Chip cooling. No es un modelo de lenguaje: es un surrogate fisico que mapea 6 parametros de condicion de contorno a un campo de temperatura estacionaria (K) sobre una malla 2D de 11.110 nodos.

Su relevancia es practica para ingenieria termica y CFD: sustituye una simulacion numerica costosa por una evaluacion directa de red neuronal con un error relativo L2 de test del 0,30 % y un MAE de 0,686 K, mejorando la referencia publicada (POD-NN de Curl y Hu, MAE 1,534 K). Con 1.807.561 parametros, el modelo es minusculo y puede ejecutarse en CPU, lo que lo hace atractivo para exploracion de disenos, optimizacion de parametros y validacion rapida en pipelines de ingenieria.

La arquitectura es Transolver (Wu et al., ICML 2024), un transformer con atencion por slices orientado a campos fisicos sobre mallas no estructuradas. La licencia de los pesos es Apache 2.0, aunque el codigo de la libreria es LGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transolver (neural operator basado en transformer con atencion por slices) |
| Parametros totales | 1.807.561 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada de 6 parametros de condicion de contorno) |
| Tipos de cuantizacion | no disponible (pesos en precision de entrenamiento; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | no aplica (modelo fisico, no linguistico) |
| Licencia | Apache 2.0 para los pesos; codigo de scirex bajo LGPL-3.0 |
| Formato de pesos | safetensors (model.safetensors) + config.json con estadisticas de normalizacion |

## Arquitectura y entrenamiento

Transolver es un operador neuronal que aplica atencion tipo transformer sobre "slices" fisicos: agrupa los nodos de la malla en 32 slices y realiza la atencion entre slices en lugar de entre todos los pares de nodos, lo que reduce el coste cuadratico en mallas grandes. En esta configuracion concreta usa 5 capas, anchura 256, 8 cabezas de atencion y 32 slices, con todos los 11.110 nodos de la malla como entrada. La salida es el campo de temperatura estacionaria en K sobre esa misma malla.

El entrenamiento usa Adam con weight decay 1e-6, gradient clipping 1.0, LR 1e-4 con 50 epocas de warm-up y decaimiento coseno hasta 1e-6, batch 4, 500 epocas y semilla 42. La temperatura se normaliza con z-score escalar y cada parametro de entrada con z-score por parametro (estadisticas de entrenamiento). La funcion de perdida es L2 relativa. Los datos provienen del conjunto de Curl y Hu (2026), depositado en Dryad (doi:10.5061/dryad.k0p2ngfp5) bajo CC0 1.0, con 1.600 muestras de entrenamiento y 400 de test. No se documenta RLHF ni DPO (no aplica). La innovacion tecnica principal es la atencion por slices propia de Transolver, orientada a campos fisicos sobre mallas no estructuradas.

## Capacidades

- Prediccion de campo de temperatura estacionaria (K) en una rebanada 2D de una placa fria de doble chip a partir de 6 parametros de condicion de contorno.
- Evaluacion directa como surrogate de simulacion CFD/termica, con un coste de inferencia muy inferior a una simulacion numerica.
- Reproducibilidad verificada: incluye `sample.safetensors` con una entrada de test y la salida esperada, y `config.json` con las estadisticas de normalizacion necesarias.
- Ejecutable en CPU con el script `infer.py` del repositorio scirex (tag v1.0.0).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo generativo de proposito general.
- Integrable en el ecosistema JAX/Flax de scirex junto con otros operadores del mismo benchmark (FNO, GINO, WNO).

## Casos de uso

- Exploracion de disenos termicos: evaluar rapidamente miles de combinaciones de los 6 parametros de condicion de contorno para identificar regiones de diseno con menor temperatura maxima, sustituyendo simulaciones CFD individuales por inferencia en CPU.
- Optimizacion de parametros de placa fria: usar el modelo como funcion objetivo barata dentro de un bucle de optimizacion (por ejemplo, busqueda bayesiana o algoritmos geneticos) sobre el espacio de condiciones de contorno.
- Validacion cruzada con simulacion: comparar la prediccion del surrogate (MAE 0,686 K) con resultados CFD de alta fidelidad para detectar regimenes donde el error crece y decidir cuando es necesario simular.
- Prototipado en pipelines de ingenieria: integrar `infer.py` en scripts de CI o herramientas internas para generar mapas de temperatura de referencia en segundos, dado el tamano reducido del modelo.
- Docencia e investigacion en operadores neuronales: usar el checkpoint como referencia reproducible de Transolver sobre un benchmark fisico con datos publicos CC0 y comparativa frente a FNO, GINO y WNO.
- Benchmarking de metodos: comparar nuevas arquitecturas de neural operators contra este checkpoint en el mismo conjunto de 400 muestras de test, con metricas L2 relativa, MAE y RMSE ya establecidas.

## Benchmarks y rendimiento

| Metrica | Registrado en entrenamiento | Reevaluado con infer.py | Referencia publicada |
|---|---|---|---|
| L2 relativa de test | 0,281 % | 0,30 % | no disponible |
| MAE de test | 0,665 K | 0,686 K | POD-NN (Curl y Hu): MAE 1,534 K, R² 0,998 |
| RMSE de test | no disponible | 1,185 K | no disponible |

La reevaluacion se realizo cargando el `config.json` de este repositorio y ejecutando `scripts/benchmarks/chip_cooling/infer.py` sobre las 400 muestras de test en CPU. Son los valores que cabe esperar al reproducir.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 1,8 M parametros en float32 los pesos ocupan aproximadamente 7 MB, y el coste dominante es la malla de 11.110 nodos.
- GPU recomendadas: no se requieren; cualquier GPU con soporte JAX sirve (A100, H100, RTX 4090, etc.), pero no aportan ventaja significativa frente a CPU para este tamano.
- Cabe en cualquier GPU de consumo e incluso en CPU sin GPU dedicada; la reevaluacion oficial se hizo en CPU.
- Opciones de despliegue: script `infer.py` del repositorio scirex (tag v1.0.0) con JAX/Flax; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo se referencia a la pagina de documentacion de GitHub sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada/salida | MAE de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX Transolver (este) | 1.807.561 | 6 parametros / 11.110 nodos | 0,686 K (0,665 K en entrenamiento) | Apache 2.0 (pesos) | Hugging Face |
| ScireX FNO | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face (zenteiq-ai/scirex-fno-chip-cooling) |
| ScireX GINO | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face (zenteiq-ai/scirex-gino-chip-cooling) |
| ScireX WNO | no disponible | mismo benchmark | no disponible | no disponible | Hugging Face (zenteiq-ai/scirex-wno-chip-cooling) |
| POD-NN (Curl y Hu) | no disponible | mismo benchmark | 1,534 K (R² 0,998) | no disponible | referencia publicada |

Los checkpoints FNO, GINO y WNO del mismo benchmark estan publicados, pero sus metricas y especificaciones no figuran en la informacion disponible.

## Limitaciones y advertencias

- Valido unicamente dentro de los rangos de entrada del conjunto de entrenamiento; fuera de ellos la prediccion no es fiable.
- No debe usarse para disenos criticos de seguridad sin validacion independiente, segun advierte el propio autor.
- Los pesos son inutilizables sin las estadisticas de normalizacion de `config.json`.
- Especifico de un unico benchmark (placa fria de doble chip, rebanada 2D de 11.110 nodos); no generaliza a otras geometrias o condiciones sin reentrenamiento.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, codigo, razonamiento ni multilingues, y no debe evaluarse con metricas tipo MMLU o HumanEval.
- Riesgo de alucinacion en el sentido fisico: puede producir campos plausibles pero incorrectos fuera de distribucion; conviene monitorizar el error frente a simulaciones de referencia.
- Sesgos conocidos: no documentados; el conjunto de datos es CC0 y de un unico estudio (Curl y Hu, 2026), lo que limita la diversidad de condiciones representadas.
- Licencia: pesos Apache 2.0, pero el codigo de scirex es LGPL-3.0, lo que condiciona la redistribucion de derivados del codigo; el dataset tiene creditos en `NOTICE`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Repositorio scirex (GitHub): https://github.com/zenteiq-research/scirex
- Resultados comparativos del benchmark Chip cooling: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/chip_cooling/results/comparative.md
- Guia de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de la arquitectura Transolver (Wu et al., ICML 2024): https://arxiv.org/abs/2402.02366
- Dataset de Curl y Hu (2026), Dryad: https://doi.org/10.5061/dryad.k0p2ngfp5
- Checkpoints relacionados: https://huggingface.co/zenteiq-ai/scirex-fno-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-gino-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-wno-chip-cooling
- Otros benchmarks del mismo modelo: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy, https://huggingface.co/zenteiq-ai/scirex-transolver-pipe, https://huggingface.co/zenteiq-ai/scirex-transolver-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
