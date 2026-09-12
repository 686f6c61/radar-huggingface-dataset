# Travor278/pi05-scan-object-concurrent-lora-10k

## Resumen

Este repositorio contiene un ajuste fino con LoRA del modelo visión-lenguaje-acción (VLA) Pi0.5, desarrollado dentro del ecosistema openpi de Physical Intelligence y publicado por el usuario Travor278 bajo el identificador `Travor278/pi05-scan-object-concurrent-lora-10k`. No es un modelo de propósito general: es un checkpoint de inferencia entrenado sobre una única tarea de manipulación robótica, definida por el prompt nativo en inglés "Scan the object." y por el dataset `Shiki42/ctr-scan-object-concurrent-20260911`.

El modelo parte del checkpoint base `XinY0201/openpi-pi05-base-jax` (commit `5e62884f`) y añade adaptadores LoRA de rango y alfa 16 sobre el backbone PaliGemma y de rango y alfa 32 sobre el action expert, que es único y estándar. La arquitectura se implementa en JAX y los pesos se distribuyen como checkpoint Orbax, con el árbol completo de parámetros de inferencia (base más LoRA) y los activos de normalización. El repositorio ocupa 6,3 GB.

Su relevancia es fundamentalmente metodológica: documenta con detalle un pipeline completo de ajuste fino de un VLA sobre datos reales (50 episodios, 11.251 fotogramas a 25 FPS, acciones y estado absolutos de 14 dimensiones, tres cámaras RGB a 224x224) ejecutado en dos H100 de 80 GB durante 10.000 actualizaciones con batch global 16. El autor no declara ninguna tasa de éxito en rollout, de modo que debe tratarse como un artefacto de investigación reproducible, no como un modelo validado en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) sobre base Pi0.5: backbone PaliGemma con adaptadores LoRA y un único action expert estándar; implementación en JAX |
| Parametros totales | no disponible (el autor no publica el recuento; el repo pesa 6,3 GB e incluye el árbol de parámetros base más LoRA) |
| Parametros activos | no aplicable: no es un modelo MoE; el autor indica "standard single action expert" |
| Longitud de contexto | no disponible (no se publica ventana de contexto; el horizonte de acción es 50 y el prompt nativo es "Scan the object.") |
| Tipos de cuantizacion | no disponible; los pesos se manejan en bf16 (congelados) y float32 (entrenables), sin cuantizaciones publicadas |
| Idiomas soportados | no disponible; el prompt nativo facilitado está en inglés |
| Licencia | no disponible |
| Formato de pesos | checkpoint Orbax (JAX); la raíz `10000/` contiene el árbol completo de parámetros de inferencia base más LoRA y los activos de normalización |
| Dimension de accion y estado | 14 dimensiones, absolutas (sin conversión de unidades delta/Aloha ni máscara de idle) |
| Entradas | tres cámaras RGB, preprocesado estándar 224x224, padding 32, horizonte 50 |
| Dataset de entrenamiento | `Shiki42/ctr-scan-object-concurrent-20260911` (commit `2419a110`), 50 episodios y 11.251 fotogramas a 25 FPS |
| Hardware de entrenamiento | 2 x H100 80 GB, batch global 16, semilla 87431, 10.000 actualizaciones |
| Fecha de creacion | 2026-09-12 (según metadatos del repositorio) |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de tipo VLA construido sobre Pi0.5: un backbone de visión-lenguaje PaliGemma que procesa las tres cámaras RGB a 224x224 y el prompt textual, más un único action expert que genera las acciones. En este ajuste fino se congela la mayor parte de los pesos y se entrenan adaptadores LoRA de rango y alfa 16 sobre PaliGemma y de rango y alfa 32 sobre el action expert; el filtro de referencia incluye visión y proyecciones entrenables. Las activaciones y los pesos congelados se mantienen en bf16, mientras que los pesos entrenables están en float32. El entrenamiento usó AdamW con beta1 0,9, beta2 0,95, epsilon 1e-8, weight decay 1e-10, clipping 1 y sin EMA, bajo un plan de learning rate coseno de 30.000 pasos con 1.000 de warmup, pico 2,5e-5 y valor final 2,5e-6; el run se detuvo en el paso 10.000.

Los datos de entrenamiento son un único dataset de manipulación con acciones y estado absolutos de 14 dimensiones, sin conversión de unidades delta ni máscara de idle, lo que implica que el modelo asume exactamente ese espacio de acción. Antes del envío a GPU se ejecutaron gates de decoder y tokenizer reales y de guardado/recarga en CPU; los árboles de parámetros y de optimizador se restauraron y verificaron finitos, el paso de optimizador 10000 quedó verificado y se incluyen hashes y recibos. El autor advierte que no se reclama ninguna tasa de éxito en rollout y que el runtime JAX usado se construyó por separado sobre NGC PyTorch 25.02, por lo que no se declara idéntico al runtime CTR archivado. El estado del optimizador no se conserva en el repositorio: queda en la plataforma de entrenamiento.

## Capacidades

- Generación de acciones robóticas en un espacio absoluto de 14 dimensiones a partir de observaciones visuales y una instrucción de lenguaje.
- Percepción multimodal con tres cámaras RGB simultáneas y preprocesado estándar de 224x224.
- Ejecución por chunks de acción con horizonte 50 y padding 32.
- Condicionamiento por prompt de lenguaje; el prompt nativo documentado es "Scan the object.".
- Reanudación de inferencia desde checkpoint Orbax mediante la librería openpi, usando `10000/` como raíz del checkpoint.
- Tool calling / function calling: no disponible, sin evidencia en la información proporcionada.
- Comportamiento agéntico o razonamiento multi-paso: no disponible, sin evidencia en la información proporcionada.
- Capacidades multilingües: no disponible; solo se documenta un prompt en inglés.
- Modo "thinking", visión general, audio u otras capacidades especiales: no disponible.
- Validación de rendimiento real: el autor no declara ninguna métrica de éxito en rollout.

## Casos de uso

- Investigación en modelos VLA: sirve como referencia reproducible de un ajuste fino con LoRA sobre Pi0.5 en JAX, con hashes, recibos y registros de configuración (resueltos en `10000/experiment/`), útil para comparar pipelines de entrenamiento.
- Automatización de tareas de escaneo de objetos: en una celda robotizada con tres cámaras y estado de 14 dimensiones, el modelo puede emitir secuencias de acción condicionadas por la instrucción "Scan the object." para inspeccionar una pieza.
- Prototipado rápido de nuevas tareas por transferencia: al ser un adaptador LoRA sobre un base congelado, es un punto de partida para reentrenar con datasets propios que respeten el mismo formato de 14 dimensiones y el mismo preprocesado.
- Evaluación de infraestructura de inferencia JAX y Orbax: permite medir latencia de carga de checkpoints, consumo de VRAM y comportamiento del runtime JAX construido sobre NGC PyTorch 25.02 en GPUs H100.
- Pruebas de regresión y CI de despliegue robótico: los gates de decoder, tokenizer y recarga en CPU incluidos en el repositorio sirven de plantilla para validar que un checkpoint se restaura correctamente antes de enviarlo a un robot.
- Auditoría de reproducibilidad: el registro de configuraciones resueltas, manifiestos fijados de dataset y base, y la verificación del paso 10000 permiten auditar si un run es reproducible en otra plataforma.
- Estudio de normalización de datos de robótica: el repositorio conserva estadísticas completas específicas del dataset y los activos de normalización, lo que permite analizar cómo afecta la normalización al espacio de acciones absolutas de 14 dimensiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito en rollout ni métrica de éxito en robot real.

## Requisitos de hardware

- Entrenamiento documentado: 2 x H100 80 GB con batch global 16 y 10.000 actualizaciones. El coste de reproducción exacto no está detallado más allá de esto.
- VRAM de inferencia: no publicada por el autor. Como referencia aproximada, los 6,3 GB del repositorio corresponden al árbol de parámetros; una inferencia en bf16 con las activaciones del backbone PaliGemma y las tres cámaras necesita previsiblemente del orden de 10-16 GB, pero esta cifra es una estimación, no un dato verificado.
- GPUs recomendadas: H100 80 GB (la usada en entrenamiento); A100 40 GB o 80 GB como alternativa habitual para este tipo de VLA; en el extremo consumer, una RTX 4090 o RTX 3090 de 24 GB probablemente sea suficiente para inferencia dado el tamaño del repositorio, aunque no hay confirmación del autor.
- ¿Cabe en GPU consumer? Previsiblemente sí en tarjetas de 24 GB, sin verificación publicada. No se garantiza en GPUs de 8-12 GB.
- Opciones de despliegue: librería openpi con checkpoint Orbax sobre runtime JAX; vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo de lenguaje servido por esas pilas ni se distribuyen pesos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de frecuencia de inferencia ni de tiempo por chunk de acción.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`pi05-scan-object-concurrent-lora-10k`) | VLA ajustado con LoRA, tarea única | no disponible | acción de 14 dim., horizonte 50 | no disponible | HuggingFace, 6,3 GB, 0 descargas |
| `XinY0201/openpi-pi05-base-jax` (base) | VLA base Pi0.5 en JAX | no disponible | no disponible | no disponible | HuggingFace |
| Pi0.5 / Pi0 en openpi (Physical Intelligence) | VLA base y familia openpi | no disponible | no disponible | consultar el repositorio openpi | GitHub y HuggingFace |
| OpenVLA | VLA sobre backbone de lenguaje | no disponible | no disponible | consultar el repositorio del proyecto | HuggingFace |
| NVIDIA GR00T N1 / N1.5 | VLA fundacional para robots | no disponible | no disponible | consultar la licencia de NVIDIA | HuggingFace |

Los datos cuantitativos de los modelos alternativos no se han verificado en la información disponible para esta ficha, por lo que se marcan como no disponibles. La diferencia principal de este checkpoint frente a los modelos base es su especialización: está entrenado para una única tarea y un único dataset, con licencia sin declarar.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial ni para redistribución; debe aclararse con el autor antes de cualquier uso en producción.
- Sin métricas de éxito: el autor no reclama ninguna tasa de éxito en rollout, por lo que el rendimiento real de la política es desconocido.
- Dataset muy reducido y de una sola tarea: 50 episodios y 11.251 fotogramas con un único prompt ("Scan the object."), lo que implica un riesgo alto de sobreajuste a la escena, la iluminación y la disposición de cámaras del dataset original.
- Dependencia estricta del formato de acción: requiere acciones y estado absolutos de 14 dimensiones, tres cámaras RGB a 224x224, padding 32 y horizonte 50, y no admite conversión de unidades delta/Aloha ni máscara de idle.
- Idioma: solo se documenta prompt en inglés; no hay evidencia de soporte multilingüe.
- Pérdida de capacidades generales: al ser un adaptador LoRA sobre un base congelado, las capacidades generales del modelo Pi0.5 podrían degradarse fuera de la distribución de la tarea ajustada.
- Reproducibilidad limitada: el runtime JAX se construyó por separado sobre NGC PyTorch 25.02 y el autor no lo declara idéntico al runtime CTR archivado; pequeñas diferencias de entorno pueden alterar resultados.
- Estado del optimizador ausente: no se incluye en el repositorio, de modo que no es posible reanudar el entrenamiento exactamente desde el paso 10000 con esta publicación.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de redactar esta ficha.
- Riesgo de comportamiento no seguro: no se publican evaluaciones de seguridad ni de comportamiento fuera de distribución en un robot real; cualquier despliegue físico debería ir precedido de pruebas en banco con límites de par y paradas de emergencia.
- Metadatos llamativos: las fechas de creación y actualización indicadas (2026-09-12) son posteriores a la fecha de consulta habitual, lo que conviene verificar antes de citar el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-concurrent-lora-10k
- Modelo base referenciado en la model card: https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`)
- Dataset referenciado en la model card: https://huggingface.co/datasets/Shiki42/ctr-scan-object-concurrent-20260911 (commit `2419a110014733297689002a04e77faf1c438300`)
- Ecosistema openpi (librería `openpi` citada por el autor): https://github.com/Physical-Intelligence/openpi
- Búsqueda web: no se encontraron enlaces relevantes. El único resultado devuelto fue un exportador de calendario en `cbsakademi.ibb.istanbul` sin relación con el modelo, por lo que no se incluye como referencia técnica.
