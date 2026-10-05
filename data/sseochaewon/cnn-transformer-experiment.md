# sseochaewon/cnn-transformer-experiment

## Resumen

`cnn-transformer-experiment` es un prototipo de investigación publicado por el usuario sseochaewon en Hugging Face. Se trata de una implementación híbrida de CNN y transformer orientada a tareas de aprendizaje contrastivo, distribuida como artefacto de estudio reproducible (código, configuración y pesos de inicialización) en lugar de como modelo entrenado. El repositorio tiene 0 descargas y 0 likes, y fue creado el 5 de octubre de 2026.

El dato más relevante es su escala: 24.832 parámetros totales según el fichero safetensors, lo que lo sitúa tres o cuatro órdenes de magnitud por debajo de cualquier modelo de lenguaje utilizable. El autor indica explícitamente que el checkpoint es "una inicialización válida para smoke tests" y que "no se presenta como un checkpoint entrenado con benchmarks". La model card no reclama ninguna puntuación de evaluación.

Por tanto, esta ficha debe leerse como la de un banco de pruebas de arquitectura, no como la de un modelo desplegable. No hay datos de entrenamiento, ni idiomas declarados, ni pipeline de Hugging Face, ni resultados de benchmarks. Su interés es exclusivamente metodológico: documentar formatos de fichero, recetas de entrenamiento por defecto y una arquitectura híbrida con atención grouped query, fusión Tucker, activación ReLU y normalización por batchnorm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida convolucional + transformer) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuye safetensors; sin versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); implementación en PyTorch (`model.py`) |

Detalles adicionales de arquitectura declarados en la model card:

| Componente | Valor |
|---|---|
| Escala | small |
| Atencion | grouped query |
| Fusion | tucker |
| Activacion | relu |
| Normalizacion | batchnorm |
| Optimizador por defecto | adam |
| Planificador por defecto | onecycle |

## Arquitectura y entrenamiento

La arquitectura es una hibridación de capas convolucionales (CNN) con bloques de transformer, con atención de tipo grouped query y un mecanismo de fusión denominado "tucker" en la configuración. La activación es ReLU y la normalización se realiza con batchnorm, lo que sugiere un diseño orientado a entradas con estructura espacial más que a secuencias de texto puras. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto (Adam con planificador OneCycle).

No hay evidencia de que se haya completado un entrenamiento. La model card afirma que los valores de la receta son "valores de partida en el script, no evidencia de una ejecución completada" y que el checkpoint de safetensors es válido para pruebas de humo pero no ha sido entrenado ni auditado. No se especifica número de tokens, composición del dataset, uso de RLHF, DPO ni ninguna otra técnica de alineación. El propio autor recomienda que cualquier evaluación futura use un conjunto de validación específico de tarea, al menos tres semillas aleatorias y una línea base de capacidad comparable, y que se conserven los registros de entrenamiento y las versiones del entorno.

## Capacidades

- Generación de texto: no disponible. No hay evidencia de que el modelo produzca lenguaje natural; la arquitectura y el objetivo declarado (contrastivo) apuntan a representaciones, no a decodificación autoregresiva.
- Razonamiento, matemáticas y código: no disponible.
- Tool calling / function calling: no soportado ni documentado.
- Agentes y razonamiento multi-paso: no soportado ni documentado.
- Capacidades multilingües: no disponibles; el campo de idiomas está vacío en la ficha de Hugging Face.
- Visión, audio u otras modalidades: no disponibles explícitamente, aunque la presencia de CNN y normalización batchnorm es compatible con entradas espaciales.
- Capacidades especiales (modo thinking, decodificación especulativa, atención lineal): no documentadas.
- Carga mediante APIs genéricas: la model card advierte de que, al ser una implementación personalizada, las APIs automáticas de carga requieren un adaptador explícito antes de su uso.

## Casos de uso

Ninguno de los siguientes casos es utilizable con el checkpoint publicado tal cual: todos exigen entrenar primero el modelo o tratar el repositorio como andamiaje de investigación.

- Banco de pruebas de pipelines de aprendizaje contrastivo: el repositorio incluye `training_args.json` y un punto de entrada ejecutable, de modo que sirve para validar que una canalización de entrenamiento contrastivo arranca, serializa y reanuda correctamente antes de escalarla a un modelo mayor.
- Estudio de fusión Tucker en arquitecturas híbridas: permite experimentar con mecanismos de fusión entre ramas convolucionales y atencionales en un entorno con coste computacional despreciable (24.832 parámetros), útil para comparar variantes de fusión de forma aislada.
- Investigación sobre atención grouped query en modelos pequeños: sirve como caso mínimo para medir el impacto de GQA en memoria y latencia sin el ruido de modelos de gran escala.
- Pruebas de humo en integración continua: al ser un checkpoint de inicialización válido de menos de 100 KB, puede incorporarse a tests de CI que verifiquen que el código de carga, el `config.json` y el formato safetensors siguen siendo compatibles tras refactorizaciones.
- Línea base de capacidad mínima en estudios comparativos: el autor recomienda comparar contra "una línea base de capacidad comparable"; este modelo puede actuar como ese punto de referencia de capacidad muy reducida en experimentos controlados con las mismas semillas y el mismo presupuesto de ajuste.
- Validación de adaptadores de carga personalizados: dado que las APIs genéricas no cargan implementaciones personalizadas, el repositorio es un caso de prueba adecuado para desarrollar y verificar el adaptador que después se reutilizará con modelos propios mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que "no se reclama ninguna puntuación de benchmark en este repositorio" y que el checkpoint no ha sido entrenado.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Cualquier métrica de tarea contrastiva | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 24.832 parámetros, el peso en fp32 ocupa aproximadamente 97 KB; en fp16, unos 48 KB. El tamaño del repositorio es de 0,0 GB.
- GPU recomendadas: ninguna en particular. El modelo es ejecutable en CPU sin dificultad; cualquier GPU, incluida una iGPU o una GTX 1050, es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo, y también en CPU y en dispositivos embebidos.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que la arquitectura es personalizada y no existen pesos convertidos a GGUF ni integración con esos servidores. El despliegue se realiza ejecutando directamente `model.py` con PyTorch, previa implementación de un adaptador si se quiere usar una API genérica de carga.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay modelos comparables publicados con resultados verificables en la información disponible. La única referencia directa encontrada es un repositorio con nombre idéntico publicado por otro usuario, que comparte estructura de ficheros pero difiere en licencia.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| sseochaewon/cnn-transformer-experiment | 24.832 | no disponible | BSD-3-Clause | Checkpoint de inicialización, sin entrenar |
| jiahaowuna/cnn-transformer-experiment | no disponible | no disponible | Apache-2.0 | Mismo conjunto de ficheros (model.py, README.md, config.json, training_args.json, model.safetensors); 208 kB, 2 commits |
| Cualquier transformer o híbrido CNN-transformer de producción | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks de esta implementación, por lo que una comparación numérica no es posible |

## Limitaciones y advertencias

- El checkpoint no está entrenado. Es una inicialización para pruebas de humo y no produce resultados útiles en ninguna tarea sin un entrenamiento previo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No hay benchmarks publicados, ni métricas de tarea, ni comparaciones con líneas base de capacidad equivalente.
- No se documentan idiomas soportados, por lo que no se puede asumir cobertura multilingüe ni siquiera monolingüe.
- No hay longitud de contexto declarada, dato crítico para cualquier uso sobre secuencias.
- Los datos de entrenamiento son inexistentes en la documentación: sin número de tokens, sin composición del dataset y sin proceso de alineación (RLHF o DPO). El riesgo de sesgo y de alucinación no puede evaluarse, y en la práctica no aplica al no existir generación de texto.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución, pero el autor advierte de que deben revisarse por separado los términos de los datos de origen si el repositorio se usa con conjuntos de datos externos.
- Al ser una implementación personalizada, no se carga con `AutoModel.from_pretrained` sin un adaptador explícito; esto añade trabajo de integración antes de cualquier prueba.
- El repositorio es un artefacto de investigación con 0 descargas y 0 likes, sin mantenimiento confirmado ni historial de versiones más allá del commit inicial.
- Cualquier resultado obtenido a partir de un futuro checkpoint entrenado deberá documentarse por separado de los valores por defecto que se distribuyen aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sseochaewon/cnn-transformer-experiment
- Repositorio con nombre idéntico de otro autor (licencia Apache-2.0): https://huggingface.co/jiahaowuna/cnn-transformer-experiment
- Árbol de ficheros de ese repositorio: https://huggingface.co/jiahaowuna/cnn-transformer-experiment/tree/main
- Tema `cnn-transformer` en GitHub: https://github.com/topics/cnn-transformer
- Artículo sobre CNN-Transformer para detección de intrusiones en IoT (Springer): https://link.springer.com/content/pdf/10.1007/s13042-026-03055-y.pdf
- Introducción a transformers (GeeksforGeeks, material general de referencia): https://www.geeksforgeeks.org/machine-learning/getting-started-with-transformers/
