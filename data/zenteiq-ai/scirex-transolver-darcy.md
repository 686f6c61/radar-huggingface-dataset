# zenteiq-ai/scirex-transolver-darcy

## Resumen

ScireX Transolver · Darcy flow 2D es un operador neuronal (neural operator) entrenado para resolver el benchmark de flujo de Darcy bidimensional en su variante data-driven. Lo desarrolla zenteiq-ai dentro de la biblioteca open source scirex, implementada en JAX/Flax, y se publica como checkpoint de referencia reproducible. No es un modelo de lenguaje: es un surrogate de simulación física que aprende el mapa entre un campo de permeabilidad y el campo de presión asociado sobre una malla de 85 x 85 puntos (7.225 nodos).

El modelo implementa la arquitectura Transolver (Wu et al., ICML 2024), un transformer adaptado a operadores neuronales, con 2.826.945 parámetros. Su relevancia radica en que ofrece un error relativo L2 de test del 0,532% en un único checkpoint (semilla 2) y un 0,556% de media en cinco semillas, cifras en línea con la referencia publicada del paper (0,57%). Esto lo convierte en un punto de comparación útil frente a otros operadores como FNO, GINO o WNO dentro del mismo benchmark.

El checkpoint se publica con pesos en safetensors, configuración con estadísticas de normalización y un fichero de muestra para validar la instalación. Su licencia Apache 2.0 sobre los pesos facilita la reutilización, aunque el código de la biblioteca es LGPL-3.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transolver (neural operator basado en transformer, JAX/Flax) |
| Parámetros totales | 2.826.945 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; entrada fija de 7.225 puntos en malla 85 x 85) |
| Tipos de cuantización | No disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | No disponible (no aplica; modelo numérico de simulación física) |
| Licencia | Apache 2.0 (pesos); código de la biblioteca LGPL-3.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `sample.safetensors` |

## Arquitectura y entrenamiento

Transolver es un operador neuronal que adapta el mecanismo de atención de los transformers al aprendizaje de operadores entre funciones definidas sobre mallas. En lugar de tokenizar texto, proyecta los puntos físicos de la malla en un espacio latente y aplica atención sobre representaciones de "slices" o grupos de puntos, lo que reduce el coste cuadrático respecto a la atención densa sobre los 7.225 nodos. La implementación de scirex está escrita en JAX/Flax y el checkpoint contiene únicamente los pesos de la última época del entrenamiento.

El entrenamiento se realizó sobre los datos de flujo de Darcy de Li et al. (ICLR 2021), disponibles en el registro Zenodo 12784353 bajo licencia CC BY 4.0, con 1.000 muestras de entrenamiento y 200 de test. Se usó AdamW con un ciclo coseno one-cycle (pico de learning rate 1e-3), weight decay 1e-5, recorte de norma de gradiente de 0,1 y una función de pérdida de L2 relativa más 0,1 veces regularización de gradiente (configuración de la Tabla 8 de Wu et al.). El batch fue de 4 durante 500 épocas (125.000 pasos), con normalización global escalar, en un tiempo de entrenamiento aproximado de 42 minutos. La entrada es un campo de permeabilidad en malla 85 x 85 y la salida es el campo de presión en la misma malla; las estadísticas de normalización residen en `config.json` y son imprescindibles para usar los pesos.

## Capacidades

- Predicción de campos de presión a partir de campos de permeabilidad en flujo de Darcy 2D sobre malla fija de 85 x 85 puntos.
- Aproximación de la solución de una EDP elíptica con un surrogate neuronal entrenado, sin resolución numérica iterativa.
- Inferencia determinista sobre una única muestra de entrada; no genera texto ni mantiene conversación.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, visión, audio ni modo de pensamiento.
- Validación de la instalación mediante `sample.safetensors`, que contiene una entrada de test (`input`) y la salida esperada (`expected_output`).
- Integración con el pipeline de evaluación de scirex mediante `scripts/benchmarks/darcy/infer.py`.

## Casos de uso

- Validación de instalaciones y pipelines de operadores neuronales: usar `sample.safetensors` para comprobar que la inferencia reproduce la salida esperada antes de desplegar cualquier otro componente de scirex.
- Benchmarking de operadores neuronales: comparar Transolver con FNO, GINO y WNO sobre el mismo conjunto de Darcy 2D, usando el error L2 relativo como métrica común y el checkpoint como referencia fija.
- Docencia e investigación en métodos numéricos: ilustrar cómo un transformer adaptado a mallas aproxima soluciones de EDP con un error relativo por debajo del 1% y un coste de entrenamiento de menos de una hora.
- Prototipado de surrogates en ingeniería de yacimientos o hidrogeología: sustituir resoluciones iterativas de Darcy por una inferencia directa en estudios exploratorios, siempre dentro del rango de entrenamiento del benchmark.
- Reproducibilidad de resultados: regenerar la tabla comparativa de scirex a partir de los pesos archivados de la semilla 2 (0,532% de error de test) y contrastarla con la media de cinco semillas (0,556%).
- Generación de datos sintéticos de presión para pruebas de software de visualización o de post-proceso, dado que la salida está en una malla conocida y el coste de inferencia es bajo.
- Punto de partida para fine-tuning en dominios afines: reutilizar los pesos como inicialización en variantes del mismo benchmark, como la ejecución physics-only con campos extra publicada por el mismo autor.

## Benchmarks y rendimiento

| Métrica | Este modelo | Referencia publicada |
|---|---|---|
| Error L2 relativo de test, media de cinco semillas | 0,556% | 0,57% (Wu et al., ICML 2024, Tabla 2) |
| Error L2 relativo de test, checkpoint publicado (semilla 2) | 0,532% | No disponible |
| Error de test por semilla (0 a 4) | 0,600%, 0,539%, 0,532%, 0,559%, 0,549% | No disponible |

El checkpoint archivado corresponde a la semilla 2, la de menor error de test de las cinco ejecutadas. El autor advierte de que la selección de semilla se hizo sobre el propio conjunto de test, ya que no existe partición de validación, por lo que la cifra de 0,532% es ligeramente optimista. No se han publicado resultados de MMLU, HumanEval, GSM8K ni métricas de lenguaje, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, en el orden de decenas de megabytes, dado que el modelo tiene 2.826.945 parámetros y los pesos en safetensors ocupan una fracción mínima de un gigabyte.
- GPU recomendadas: cualquier GPU con soporte CUDA o ROCm compatible con JAX, incluidas tarjetas de gama baja; no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX o equivalente, e incluso es viable en CPU para inferencias puntuales.
- Opciones de despliegue: JAX/Flax mediante la biblioteca scirex y el script `scripts/benchmarks/darcy/infer.py`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo de texto.
- Latencia y throughput: no disponibles de forma explícita; el entrenamiento completo de 125.000 pasos requirió aproximadamente 42 minutos, lo que sugiere una inferencia por muestra del orden de milisegundos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / malla | Error L2 relativo de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transolver (este checkpoint) | 2.826.945 | Malla 85 x 85 (7.225 puntos) | 0,532% (semilla 2); 0,556% media de cinco semillas | Apache 2.0 (pesos) | Hugging Face: zenteiq-ai/scirex-transolver-darcy |
| FNO | No disponible | Malla 85 x 85 | No disponible en la información proporcionada | No disponible | Hugging Face: zenteiq-ai/scirex-fno-darcy |
| GINO | No disponible | Malla 85 x 85 | No disponible en la información proporcionada | No disponible | Hugging Face: zenteiq-ai/scirex-gino-darcy |
| WNO | No disponible | Malla 85 x 85 | No disponible en la información proporcionada | No disponible | Hugging Face: zenteiq-ai/scirex-wno-darcy |

Los tres modelos alternativos pertenecen al mismo benchmark y a la misma biblioteca, pero la información disponible no incluye sus recuentos de parámetros, errores ni licencias específicas. Para una comparación cuantitativa completa debe consultarse la tabla comparativa de scirex enlazada en la model card.

## Limitaciones y advertencias

- Validez restringida al rango de entrada del benchmark de Darcy 2D con el que fue entrenado; extrapolar a otros regímenes físicos o mallas distintas no está garantizado.
- No debe usarse en diseño de seguridad crítica sin una validación independiente, tal como advierte el propio autor.
- La selección de la semilla publicada se hizo sobre el conjunto de test al no existir partición de validación, por lo que el 0,532% es una estimación ligeramente optimista.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- No es un modelo de lenguaje: no genera texto, no responde a prompts conversacionales y no admite instrucciones en lenguaje natural.
- Riesgo de alucinación en el sentido de producir campos físicamente inconsistentes fuera de la distribución de entrenamiento; no hay métricas publicadas de robustez fuera de dominio.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse con un único dataset sintético o semi-sintético, hereda sus sesgos de muestreo.
- Licencia: los pesos son Apache 2.0, pero el código de la biblioteca scirex es LGPL-3.0 y el dataset de entrenamiento es CC BY 4.0, lo que exige atribución al dato original.
- Sin métricas publicadas de latencia, throughput ni consumo energético en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy
- Repositorio de la biblioteca scirex: https://github.com/zenteiq-research/scirex
- Tabla comparativa del benchmark Darcy: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/darcy/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues del proyecto: https://github.com/zenteiq-research/scirex/issues
- Paper de Transolver (Wu et al., ICML 2024): https://arxiv.org/abs/2402.02366
- Dataset de Darcy flow de Li et al. (Zenodo 12784353): https://zenodo.org/records/12784353
- Checkpoint FNO en Darcy: https://huggingface.co/zenteiq-ai/scirex-fno-darcy
- Checkpoint GINO en Darcy: https://huggingface.co/zenteiq-ai/scirex-gino-darcy
- Checkpoint WNO en Darcy: https://huggingface.co/zenteiq-ai/scirex-wno-darcy
- Variante physics-only con campos extra: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields
- Transolver en pipe flow: https://huggingface.co/zenteiq-ai/scirex-transolver-pipe
- Transolver en Navier-Stokes 2D: https://huggingface.co/zenteiq-ai/scirex-transolver-navier-stokes
- Transolver en chip cooling: https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling
- Transolver en AirfRANS: https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
- Transolver en ShapeNetCar: https://huggingface.co/zenteiq-ai/scirex-transolver-shapenetcar
- Transolver en Car-CFD: https://huggingface.co/zenteiq-ai/scirex-transolver-car-cfd
