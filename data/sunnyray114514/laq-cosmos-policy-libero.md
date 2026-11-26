# SunnyRay114514/LAQ-Cosmos-Policy-LIBERO

## Resumen

LAQ-Cosmos-Policy-LIBERO es una versión cuantizada a 4 bits del modelo Cosmos-Policy-LIBERO-Predict2-2B de NVIDIA, un world-action model orientado a robótica y control de manipuladores en el benchmark LIBERO. La cuantización la ha desarrollado el autor independiente SunnyRay114514 mediante LAQ (Latent-Aware Quantization), un marco de cuantización post-entrenamiento presentado en el artículo arXiv:2611.25614. El objetivo es reducir el coste de memoria y cómputo del modelo original sin degradar la calidad de las acciones predichas.

La innovación principal de LAQ es que preserva el futuro latente que condiciona la acción: en lugar de cuantizar de forma uniforme, asigna precisión mediante una métrica de lector y un recuento de lecturas que se resuelven en forma cerrada, y aplica un refinamiento guiado por la atención (gaze-guided) a los tokens que la acción atiende. El resultado son pesos, activaciones y caché KV a 4 bits (W4A4KV4) sin rama de alta precisión ni recalibración por tarea.

El modelo base tiene 2B parámetros y se distribuye con licencia "other" heredada de Cosmos-Policy (NVIDIA Open Model License). El repo pesa 0,9 GB e incluye únicamente los pesos empaquetados de los bloques transformer y la configuración con la asignación calibrada; el VAE, el codificador de texto y el resto de capas provienen del modelo original. Es relevante porque demuestra que los world-action models pueden desplegarse a 4 bits manteniendo la fidelidad de la predicción futura, un requisito crítico en robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World-action model basado en transformer (derivado de Cosmos-Policy-Predict2-2B); cuantizacion LAQ sobre bloques transformer |
| Parametros totales | 2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A4KV4 (pesos, activaciones y cache KV a 4 bits); pesos empaquetados con una escala por fila de salida |
| Idiomas soportados | no disponible |
| Licencia | other (hereda la licencia de Cosmos-Policy; el codigo LAQ es Apache-2.0) |
| Formato de pesos | safetensors (weights.safetensors empaquetado a 4 bits) + config.json |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del world-action model Cosmos-Policy-LIBERO-Predict2-2B de NVIDIA, que combina un transformer de difusion/prediccion (Predict2) con un VAE y un codificador de texto para generar acciones condicionadas por observaciones y el futuro latente predicho. LAQ no reentrena el modelo: parte de los pesos originales y aplica una cuantización de 4 bits sobre los bloques transformer, manteniendo el VAE, el codificador de texto y las capas restantes en el modelo base original.

La técnica clave de LAQ es la asignación de precisión consciente del latente: una métrica de lector y un recuento de lecturas determinan, en forma cerrada, cuánta precisión asignar a cada componente, de modo que se preserva la predicción del futuro que condiciona la acción. Además, un refinamiento guiado por la atención (gaze-guided refinement) aplica una segunda pasada de 4 bits a los tokens que la acción atiende. Todo el modelo permanece a 4 bits, sin rama de alta precisión y sin recalibración por tarea. No se dispone de datos sobre el número de tokens de entrenamiento ni sobre el dataset utilizado en el modelo base.

## Capacidades

- Predicción de acciones robóticas condicionadas por observaciones visuales y el futuro latente, orientada al benchmark LIBERO.
- World-action modeling: genera la representación del futuro sobre la que se condiciona la acción.
- Cuantización W4A4KV4 con preservación del futuro latente, sin rama de alta precisión ni recalibración por tarea.
- Integración mediante la librería `laq` (`cosmos.attach` y `state.reset()` al inicio de cada episodio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (modelo orientado a robótica, no a texto).
- Modo thinking, visión, audio: no disponible como capacidades declaradas; el modelo base es multimodal visión-lenguaje-acción, pero la model card no detalla capacidades adicionales.

## Casos de uso

- Control de manipuladores en entornos LIBERO: el modelo predice acciones a partir de observaciones y del futuro latente, adecuado para tareas de manipulación evaluadas en este benchmark.
- Despliegue en hardware con memoria limitada: la cuantización W4A4KV4 reduce la huella de pesos, activaciones y caché KV, lo que permite ejecutar un modelo de 2B en GPUs con menos VRAM que la versión original.
- Investigación en cuantización de world-action models: sirve como referencia reproducible para estudiar el impacto de la cuantización a 4 bits en la fidelidad de la predicción futura.
- Evaluación de políticas robóticas en simulación: integrable en pipelines de evaluación LIBERO mediante la API de LAQ, con reinicio de estado por episodio.
- Prototipado de políticas de imitación: útil para experimentar con políticas condicionadas por futuro latente sin el coste de memoria del modelo completo.
- Benchmarking de técnicas de cuantización PTC: permite comparar LAQ frente a otros esquemas de cuantización sobre el mismo modelo base.
- Sistemas embebidos y robótica de bajo consumo: la reducción a 4 bits facilita el despliegue en plataformas con restricciones de memoria, siempre que se valide la degradación de la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 0,9 GB (solo pesos transformer empaquetados a 4 bits), a lo que hay que sumar el VAE, el codificador de texto y las capas restantes del modelo base de 2B.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No disponible; la cuantización a 4 bits sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no se confirma en la información.
- Opciones de despliegue: librería `laq` (instalación vía `pip install -e .` desde el repositorio GitHub) junto con el código original de Cosmos-Policy; vLLM, llama.cpp, Ollama o TGI no están indicados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LAQ-Cosmos-Policy-LIBERO | 2B (base) | no disponible | W4A4KV4 | other | Hugging Face (SunnyRay114514) |
| Cosmos-Policy-LIBERO-Predict2-2B (NVIDIA) | 2B | no disponible | FP (original) | other (NVIDIA Open Model License) | Hugging Face (nvidia) |
| Alternativas de cuantizacion de world-action models | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia "other": los pesos heredan la licencia de Cosmos-Policy; es necesario revisar los términos de NVIDIA Open Model License antes de uso comercial.
- Modelo derivado de un autor independiente (SunnyRay114514), no de NVIDIA; no hay validación oficial de NVIDIA sobre esta cuantización.
- Sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario limitados.
- Solo se distribuyen los pesos de los bloques transformer y la configuración; el VAE, el codificador de texto y el resto de capas deben obtenerse del modelo base original.
- La cuantización a 4 bits puede introducir degradación en la política; la model card no reporta métricas de rendimiento que la cuantifiquen.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles.
- Uso previsto limitado a robótica y al benchmark LIBERO; no es un modelo de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/SunnyRay114514/LAQ-Cosmos-Policy-LIBERO
- Modelo base: https://huggingface.co/nvidia/Cosmos-Policy-LIBERO-Predict2-2B
- Paper: https://arxiv.org/abs/2611.25614
- Código: https://github.com/SunnyRaymond/LAQ
