# zenteiq-ai/scirex-transolver-airfrans

## Resumen

ScireX Transolver · AirfRANS es un operador neuronal entrenado (neural operator) para la resolución de ecuaciones en derivadas parciales sobre mallas aerodinámicas 2D, concretamente para el benchmark AirfRANS de dinámica de fluidos computacional (CFD). Lo desarrolla el proyecto open source zenteiq-ai/scirex, una librería en JAX/Flax que reúne implementaciones de referencia de operadores neuronales con pesos entrenados y reproducibles. El modelo implementa la arquitectura Transolver (Wu et al., ICML 2024), un transformer con atención física sobre slices de la malla.

El modelo resuelve un problema concreto: dado un campo de flujo alrededor de un perfil aerodinámico discreto en una malla, predecir velocidad, presión y viscosidad turbulenta en cada nodo. Con 3.894.596 parámetros, es un modelo extremadamente compacto (unos 15 MB en FP32) que, según la model card, supera con claridad las métricas de referencia publicadas por el paper original de Transolver en el mismo benchmark.

Su relevancia ahora es la de un artefacto de referencia reproducible: pesos de última época, estadísticas de normalización incluidas en `config.json`, un fichero `sample.safetensors` para verificar la instalación y un script de inferencia versionado (tag v1.0.0). No es un modelo de lenguaje ni un modelo generativo de propósito general, sino un surrogate de simulación física.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transolver (transformer con atención física sobre slices de malla) |
| Parametros totales | 3.894.596 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (operador sobre mallas; 32.000 nodos aleatorios por caso y paso durante entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en FP32; matmuls FP32) |
| Idiomas soportados | no aplica (modelo físico, no lingüístico) |
| Licencia | Apache-2.0 (pesos); código LGPL-3.0; datos AirfRANS bajo ODbL v1.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json` y `sample.safetensors` |

## Arquitectura y entrenamiento

Transolver es un transformer que proyecta los nodos de la malla en un conjunto reducido de "slices" mediante atención física, aplica atención entre slices y reproyecta a los nodos originales. Esto reduce el coste cuadrático de la atención sobre mallas grandes y permite manejar geometrías irregulares. El modelo aquí publicado tiene 3.894.596 parámetros, frente a los 3.893.572 del modelo del paper (diferencia menor, presumiblemente por detalles de implementación).

El entrenamiento usó Adam con el schedule one-cycle oficial, EMA de pesos (decay 0.9995), gradient clipping de 10, matmuls en FP32 y 32.000 nodos aleatorios por caso y paso, durante 500 épocas con semilla 0. No hubo selección de checkpoint sobre datos de validación: se publican los pesos EMA de la última época. El coste fue de aproximadamente 6,5 horas en una NVIDIA RTX PRO 6000 Blackwell. El conjunto de datos es AirfRANS (Bonnet et al., NeurIPS 2022), con 720 casos de entrenamiento, 80 de validación y 200 de test. La entrada por nodo incluye posición, distancia con signo, normal a la pared y velocidad de entrada; la salida es velocidad, presión y viscosidad turbulenta en cada nodo. Las estadísticas de normalización viven en `config.json` y son imprescindibles: los pesos no son utilizables sin ellas.

## Capacidades

- Predicción de campos de flujo (velocidad, presión, viscosidad turbulenta) nodo a nodo sobre mallas aerodinámicas 2D.
- Evaluación de coeficientes integrales derivados del campo, en particular la sustentación (C_L) y su ordenación relativa entre casos (correlación de Spearman).
- Inferencia sobre geometrías de perfil aerodinámico dentro del dominio de entrenamiento de AirfRANS.
- Verificación de instalación mediante `sample.safetensors`, que contiene una entrada de test y la salida esperada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo "thinking", visión, audio ni generación de texto.

## Casos de uso

- Surrogate rápido en optimización de formas aerodinámicas: sustituir una simulación CFD completa por una inferencia del operador para explorar decenas de geometrías en bucles de optimización, usando C_L y los campos predichos como función objetivo. El error relativo de C_L del 2,65% y la correlación de Spearman de 0,99959 lo hacen útil para ranking relativo de diseños.
- Preacondicionamiento de simulaciones CFD: generar un campo inicial aproximado que acelere la convergencia de un solver numérico convencional, reduciendo iteraciones hasta régimen estacionario.
- Generación de datasets sintéticos aumentados: producir pares entrada-salida adicionales sobre geometrías muestreadas dentro del rango de entrenamiento para entrenar o validar otros modelos.
- Validación cruzada de pipelines de operadores neuronales: al ser un checkpoint de referencia con métricas publicadas y script de reproducción, sirve para verificar que una implementación propia de Transolver o de las métricas del paper es correcta.
- Docencia e investigación en operadores neuronales: el tamaño (3,9 M de parámetros) y el tiempo de entrenamiento (6,5 h en una GPU) permiten reproducir el experimento completo en un entorno académico.
- Benchmarking de hardware y frameworks JAX/Flax: medir throughput de inferencia de un transformer sobre mallas con atención física en distintas GPUs, con un modelo lo bastante pequeño para aislar el coste de la atención.

## Benchmarks y rendimiento

Resultados sobre los 200 casos de test de AirfRANS, calculados con el código de métricas del paper de Transolver. Menos es mejor salvo en las correlaciones de Spearman.

| Metrica | Este modelo | Referencia publicada (paper Transolver) |
|---|---|---|
| Volume (MSE normalizado, nodos no-pared) | 0,131% | 0,37% |
| Surf (MSE normalizado, nodos de pared) | 0,046% | 1,42% |
| Error relativo de C_L | 2,65% | 10,30% |
| Spearman ρ_L | 0,99959 | 0,9978 |

La model card advierte que la definición de Surf en el paper podría corresponder solo al MSE de presión en pared, lo que sería 4 veces mayor que la cifra reportada aquí; la página de benchmarks del repositorio contiene la aclaración. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K) porque no aplican a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para los pesos (unos 15 MB), más memoria para activaciones y malla; el coste dominante es la atención sobre los nodos, no el tamaño del modelo.
- GPU recomendadas: cualquier GPU con soporte CUDA/JAX; el entrenamiento se hizo en una NVIDIA RTX PRO 6000 Blackwell. Para inferencia basta una GPU consumer moderna.
- Cabe en GPU consumer: sí, con holgura, en cualquier RTX con suficiente memoria para la malla de entrada (el modelo en sí ocupa decenas de MB).
- Opciones de despliegue: JAX/Flax con el script `scripts/benchmarks/airfrans/infer.py` del repositorio scirex v1.0.0. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada. El tiempo de entrenamiento (6,5 h para 500 épocas) da una idea del orden de magnitud del coste por paso, pero no se publican cifras de inferencia.

## Comparativa con modelos similares

Mismo benchmark AirfRANS, mismos datos y misma librería; los checkpoints comparables son los otros operadores publicados por el proyecto.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScireX Transolver · AirfRANS (este) | 3.894.596 | no aplica | Volume 0,131%; Surf 0,046%; C_L 2,65%; ρ_L 0,99959 | Apache-2.0 (pesos) | Hugging Face |
| ScireX GINO · AirfRANS | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| ScireX WNO · AirfRANS | no disponible | no aplica | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |
| Transolver del paper (referencia) | 3.893.572 | no aplica | Volume 0,37%; Surf 1,42%; C_L 10,30%; ρ_L 0,9978 | no disponible | paper ICML 2024 |

## Limitaciones y advertencias

- Válido solo dentro de los rangos de entrada del benchmark AirfRANS; extrapolar a geometrías, números de Reynolds o condiciones de contorno fuera de ese dominio no está garantizado.
- No apto para diseño de seguridad crítica sin validación independiente, según advierte el propio autor.
- Los pesos son inutilizables sin las estadísticas de normalización de `config.json`.
- Es un checkpoint de última época sin selección sobre validación: no se eligió el mejor modelo según métricas de held-out.
- La métrica Surf puede no ser directamente comparable con la del paper si la definición difiere (posible factor 4); conviene leer la página de benchmarks del repositorio antes de citar cifras.
- No es un modelo de lenguaje: no tiene capacidades conversacionales, de tool calling ni multilingües; no aplican sesgos lingüísticos ni riesgo de alucinación en el sentido habitual, pero sí riesgo de predicciones físicamente inconsistentes fuera del dominio.
- Licencia de los pesos Apache-2.0, pero el código de la librería es LGPL-3.0 y los datos AirfRANS están bajo ODbL v1.0; el uso comercial debe respetar ambas.
- Sin descargas ni likes en el momento de la consulta; ecosistema muy reciente y sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenteiq-ai/scirex-transolver-airfrans
- Repositorio scirex: https://github.com/zenteiq-research/scirex
- Página de benchmarks AirfRANS: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/airfrans/results/comparative.md
- Guía de reproducibilidad: https://github.com/zenteiq-research/scirex/blob/v1.0.0/doc/benchmarks/reproducibility.md
- Issues: https://github.com/zenteiq-research/scirex/issues
- Paper Transolver (Wu et al., ICML 2024): https://arxiv.org/abs/2402.02366
- Checkpoint GINO AirfRANS: https://huggingface.co/zenteiq-ai/scirex-gino-airfrans
- Checkpoint WNO AirfRANS: https://huggingface.co/zenteiq-ai/scirex-wno-airfrans
- Otros checkpoints Transolver: https://huggingface.co/zenteiq-ai/scirex-transolver-darcy, https://huggingface.co/zenteiq-ai/scirex-transolver-darcy-physics-extra-fields, https://huggingface.co/zenteiq-ai/scirex-transolver-pipe, https://huggingface.co/zenteiq-ai/scirex-transolver-navier-stokes, https://huggingface.co/zenteiq-ai/scirex-transolver-chip-cooling, https://huggingface.co/zenteiq-ai/scirex-transolver-shapenetcar, https://huggingface.co/zenteiq-ai/scirex-transolver-car-cfd
