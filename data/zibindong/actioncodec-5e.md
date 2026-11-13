# ZibinDong/ActionCodec-5e

## Resumen

ActionCodec-5e es un codificador de acciones (action codec) desarrollado por ZibinDong, diseñado para tokenizar y reconstruir secuencias de acciones continuas en el contexto de la robótica y el aprendizaje por imitación. A diferencia de un modelo de lenguaje generativo, este modelo actúa como un cuantizador neuronal: transforma trayectorias de acciones multidimensionales (por ejemplo, comandos de efector final con posición, orientación y estado de pinza) en secuencias de tokens discretos y las reconstruye de vuelta, facilitando su integración en pipelines de modelos de lenguaje o transformadores que operan sobre vocabulario discreto.

El modelo ha sido entrenado sobre cinco "embodiments" o configuraciones robóticas distintas: franka_libero_20hz_1s, widowx_bridge_5hz_2s, franka_droid_15hz_1s, so100_community_30hz_1s y franka_vlabench_20hz_1s. Esta diversidad de plataformas (frecuencias de 5 a 30 Hz y horizontes de 1 a 2 segundos) sugiere un interés en la generalización entre dominios robóticos, un problema central en la investigación actual de políticas robóticas basadas en transformers.

Con 45,1 millones de parámetros y un tamaño de repositorio de 0,2 GB, se trata de un modelo compacto orientado a feature-extraction y tokenización de acciones, no a generación de texto. Su relevancia radica en que permite cerrar la brecha entre políticas robóticas continuas y arquitecturas de lenguaje discretas, un patrón cada vez más común en sistemas de control robótico basados en LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | action_codec (codec neuronal para tokenización de acciones; detalles internos no disponibles) |
| Parámetros totales | 45.100.807 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica / no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Librería | transformers (con `trust_remote_code=True`) |
| Dimensiones de acción | 7 (posición xyz, orientación xyz, pinza) |
| Embodiments de entrenamiento | 5 (franka_libero, widowx_bridge, franka_droid, so100_community, franka_vlabench) |
| Frecuencias de muestreo | 5–30 Hz |
| Horizontes temporales | 1–2 s |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su etiqueta `action_codec`. Por el uso mostrado en la model card, se trata de un codificador que recibe tensores de forma `(batch, n_pasos, 7)` con acciones normalizadas al rango [-1, 1] y produce una lista de enteros (tokens), junto con una operación inversa de decodificación que devuelve la acción reconstruida y una máscara de padding. Este esquema es característico de los VQ-VAE o codecs neuronales con cuantización vectorial, aunque no se confirma explícitamente en la documentación.

El entrenamiento se realizó sobre cinco conjuntos de datos robóticos con distintas frecuencias y horizontes temporales, lo que implica una normalización por cuantiles (q01 y q99) específica por dimensión y embodiment. No se especifican el número de tokens de entrenamiento, la composición exacta de los datasets, ni si se emplearon técnicas de RLHF, DPO o ajuste fino supervisado. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card incluye secciones marcadas como "TODO" o "[More Information Needed]" en la mayoría de los apartados técnicos.

## Capacidades

- Tokenización de acciones continuas: convierte trayectorias de 7 dimensiones en secuencias de tokens discretos mediante `encode`.
- Reconstrucción de acciones: recupera la trayectoria original a partir de los tokens mediante `decode`, con máscara de padding asociada.
- Normalización integrada por cuantiles: el flujo de uso incluye normalización con q01/q99 y escalado de la dimensión de pinza a [-1, 1].
- Soporte multi-embodiment: entrenado sobre cinco plataformas robóticas con distintas frecuencias (5–30 Hz) y horizontes (1–2 s).
- Extracción de características: etiquetado como `feature-extraction` en Hugging Face.
- Integración con transformers: carga mediante `AutoModel.from_pretrained` con `trust_remote_code=True`.
- No soporta generación de texto, tool calling, agentes, visión, audio ni capacidades multilingües (no es un modelo de lenguaje).

## Casos de uso

- Tokenización de políticas robóticas para LLM: convertir trayectorias continuas de un brazo Franka en tokens discretos para que un modelo de lenguaje las procese como secuencia, habilitando control robótico basado en LLM.
- Compresión de datasets de demostraciones: reducir el almacenamiento de trayectorias de imitación (por ejemplo, LIBERO o DROID) representándolas como secuencias de enteros en lugar de floats.
- Aumento de datos robóticos: decodificar tokens con variaciones para generar trayectorias sintéticas plausibles dentro del espacio latente aprendido.
- Preprocesamiento en pipelines de aprendizaje por imitación: integrar el codec como capa de tokenización antes de un transformer de política, aprovechando su soporte para múltiples embodiments.
- Transferencia entre plataformas: usar el mismo codec para franka, widowx y so100, facilitando experimentos de generalización cruzada entre robots con distintas frecuencias.
- Evaluación de error de reconstrucción: medir MSE y L1 entre acción original y decodificada como métrica de calidad del codec antes de desplegarlo en un sistema de control.
- Investigación en tokenización de acciones: comparar esquemas de cuantización para acciones robóticas frente a alternativas como binning uniforme o FAISS-based quantization.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un ejemplo que calcula el error de reconstrucción (MSE y L1) sobre una trayectoria de ejemplo de LIBERO, pero no proporciona valores de referencia ni comparaciones con otros codecs.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (45,1 M de parámetros ≈ 180 MB de pesos, más overhead de activaciones).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, RTX 4090, etc.).
- También puede ejecutarse en CPU para inferencia puntual, dado el reducido tamaño.
- Opciones de despliegue: transformers con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ActionCodec-5e | 45,1 M | no disponible | Tokenización de acciones robóticas (5 embodiments) | no disponible | Hugging Face |
| Alternativas de codecs de acción | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (codecs de acción multi-embodiment) en la documentación proporcionada. La comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- Documentación incompleta: la model card contiene múltiples secciones "TODO" y "[More Information Needed]" (uso fuera de alcance, sesgos, datos de entrenamiento, hiperparámetros, evaluación).
- Licencia no especificada: no se indica licencia, lo que impide evaluar su uso comercial con seguridad jurídica.
- Especialización estrecha: solo maneja acciones de 7 dimensiones; no es aplicable a otras modalidades ni a acciones de distinta dimensionalidad sin reentrenamiento.
- Dependencia de normalización: el flujo requiere q01/q99 específicos por embodiment y dataset; usar cuantiles incorrectos degrada la reconstrucción.
- Riesgo de alucinación no aplica en el sentido de texto, pero sí existe riesgo de reconstrucción imprecisa (pérdida de información por cuantización) en trayectorias fuera de la distribución de entrenamiento.
- Idiomas: no aplica; el modelo no procesa lenguaje natural.
- Sin métricas publicadas: no hay benchmarks que permitan validar su calidad frente a alternativas.
- Advertencia de producción: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; auditar antes de desplegar en entornos sensibles.
- Descargas muy bajas (6) y ausencia de likes: ecosistema de validación comunitaria prácticamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/ZibinDong/ActionCodec-5e
- Paper referenciado (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Paper referenciado (arXiv:2611.15490): https://arxiv.org/abs/2611.15490
- Dataset de ejemplo mencionado: physical-intelligence/libero (referenciado en el código de la model card)
- Repositorio o blog del autor: no disponible en la información proporcionada
- Demo: no disponible
