# SunnyRay114514/LAQ-FastWAM-LIBERO

## Resumen

LAQ-FastWAM-LIBERO es una versión cuantizada a 4 bits del modelo world-action Fast-WAM, publicada por el usuario SunnyRay114514 sobre el modelo base `yuanty/fastwam`. La cuantización se ha realizado con LAQ (Latent-Aware Quantization), un marco de cuantización post-entrenamiento presentado en el paper arXiv:2611.25614, orientado específicamente a modelos de acción y mundo (world action models) para robótica. El resultado es un checkpoint con pesos, activaciones y cachés clave-valor a 4 bits (W4A4KV4), empaquetado en un único fichero de pesos de aproximadamente 3 GB.

El objetivo del modelo es preservar la calidad de predicción del futuro latente del que depende la acción, algo crítico en robótica, mientras se reduce drásticamente el coste de memoria e inferencia. La innovación de LAQ consiste en asignar la precisión de forma cerrada mediante una métrica de lector y un recuento de lecturas, y en aplicar un refinamiento guiado por mirada (gaze-guided) para dar un segundo pase de 4 bits a los tokens que la acción atiende. Todo ello sin ramas de alta precisión ni recalibración por tarea.

Este checkpoint está ajustado y evaluado para el benchmark LIBERO, por lo que su ámbito de aplicación es la manipulación robótica en entornos simulados de ese conjunto de tareas. Es relevante ahora porque demuestra que es posible cuantizar a 4 bits un world-action model sin recalibrar por tarea, lo que abarata el despliegue de políticas robóticas en hardware con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de world-action model (Fast-WAM) con cuantización LAQ |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A4KV4 (pesos, activaciones y KV cache a 4 bits); pesos empaquetados con una escala por fila de salida |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | other (los pesos derivan de Fast-WAM y conservan su licencia; el código LAQ es Apache-2.0) |
| Formato de pesos | safetensors (`weights.safetensors`, pesos 4-bit empaquetados) |

## Arquitectura y entrenamiento

El modelo base Fast-WAM es un world-action model, es decir, un transformer que predice el futuro latente del entorno y condiciona la acción sobre esa predicción. Sobre esa arquitectura, LAQ aplica cuantización post-entrenamiento: los pesos de los bloques transformer se empaquetan a 4 bits con una escala por fila de salida, y las activaciones y la caché KV también se llevan a 4 bits. El resto de capas, el VAE y el codificador de texto provienen del modelo original y no se cuantizan en este checkpoint.

El método LAQ asigna la precisión mediante una solución en forma cerrada basada en una métrica de lector y un recuento de lecturas, de modo que se preserva el futuro predicho del que depende la acción. Además, un refinamiento guiado por mirada aplica un segundo pase de 4 bits a los tokens que la acción atiende. No se emplean ramas de alta precisión ni recalibración por tarea. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Predicción de acciones robóticas condicionadas a un futuro latente, en el marco de un world-action model.
- Ejecución de políticas de manipulación en el benchmark LIBERO.
- Cuantización W4A4KV4 con preservación del futuro latente predicho.
- Uso sin recalibración por tarea: la misma asignación calibrada sirve para las tareas del benchmark.
- Integración mediante la librería `laq` con API `fastwam.attach` y `state.reset()` al inicio de cada episodio.
- No se documentan capacidades de texto, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Despliegue de políticas de manipulación en simulación LIBERO: el checkpoint se carga sobre Fast-WAM con el codebase original y se usa para resolver las tareas del benchmark con pesos a 4 bits, reduciendo el coste de memoria frente al modelo completo.
- Evaluación de cuantización en robótica: sirve para comparar el rendimiento de una política W4A4KV4 frente a su versión en alta precisión en las mismas tareas, sin recalibrar por tarea.
- Investigación en world-action models: permite estudiar cómo afecta la cuantización agresiva a la predicción del futuro latente y, por extensión, a la calidad de la acción.
- Prototipado en hardware con VRAM limitada: al ocupar el repositorio unos 3 GB, facilita probar políticas robóticas en GPUs de gama consumer donde el modelo original no cabría con comodidad.
- Integración en pipelines de evaluación automatizada: la API `attach`/`reset` permite reiniciar el estado al inicio de cada episodio, lo que encaja en bucles de evaluación por lotes.
- Base para experimentos de cuantización post-entrenamiento: el checkpoint y el código LAQ (Apache-2.0) permiten reproducir y extender el método a otros world-action models.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 3,0 GB en pesos 4-bit empaquetados; a ello hay que sumar el VAE, el codificador de texto y las capas no cuantizadas del modelo base, cuyo tamaño no está disponible. La VRAM total real no se puede calcular con los datos proporcionados.
- GPU recomendadas: no disponible en la información proporcionada.
- ¿Cabe en GPU consumer? Los 3,0 GB de pesos 4-bit sugieren que el componente cuantizado es ligero, pero sin el tamaño de las capas restantes no se puede confirmar que quepa en una GPU consumer concreta.
- Opciones de despliegue: el modelo se usa a través de la librería `laq` (`pip install -e .` desde el repositorio LAQ) junto con el codebase propio de Fast-WAM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LAQ-FastWAM-LIBERO | no disponible | no disponible | W4A4KV4 | other (derivada de Fast-WAM) | Hugging Face, 0 descargas |
| yuanty/fastwam (modelo base) | no disponible | no disponible | sin cuantizar (según información disponible) | no disponible | Hugging Face (modelo base) |
| Otros world-action models | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Ámbito restringido: el checkpoint está ajustado para LIBERO; no se documenta su validez fuera de ese benchmark.
- Cuantización agresiva: W4A4KV4 puede degradar la calidad de la predicción del futuro latente y, con ello, la acción; no se aportan métricas que cuantifiquen esa posible pérdida.
- Dependencia del codebase original: requiere cargar Fast-WAM con su propio código y adjuntar LAQ; no es un modelo autónomo.
- Licencia: los pesos conservan la licencia del modelo original (marcada como "other"), por lo que el uso comercial queda sujeto a los términos de Fast-WAM, no especificados aquí.
- Idiomas: no aplica ni se documenta soporte multilingüe.
- Sesgos y alucinación: no se documentan sesgos conocidos; el riesgo de alucinación en el sentido de texto no aplica, pero sí el riesgo de predicciones erróneas del futuro latente.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Sin datos de benchmarks, latencia ni requisitos de hardware completos: no recomendable para producción sin una evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SunnyRay114514/LAQ-FastWAM-LIBERO
- Paper LAQ: https://arxiv.org/abs/2611.25614
- Código LAQ: https://github.com/SunnyRaymond/LAQ
- Repositorio Fast-WAM: https://github.com/yuantianyuan01/FastWAM
- Modelo base: https://huggingface.co/yuanty/fastwam
