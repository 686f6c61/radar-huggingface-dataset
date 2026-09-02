# Zenma/VLA-Adapter-LIBERO-Spatial-5000

## Resumen

VLA-Adapter-LIBERO-Spatial-5000 es un modelo de visión-lenguaje-acción (VLA) de escala reducida, desarrollado por el equipo OpenHelix-Team, que adapta el paradigma VLA-Adapter para tareas de manipulación robótica en el benchmark LIBERO. El modelo combina un backbone de lenguaje Qwen2.5-0.5B con dos codificadores visuales (DINOv2 y SigLIP) fusionados mediante un mecanismo prism, y una cabeza de acción basada en MLP-ResNet con Bridge Attention. Está diseñado específicamente para la suite LIBERO-Spatial, generando secuencias de acciones a partir de instrucciones en lenguaje natural y observaciones de cámara.

El modelo cuenta con aproximadamente 1,25 mil millones de parámetros, lo que lo convierte en una alternativa compacta frente a otros VLA como OpenVLA (7B) o RT-2, manteniendo un rendimiento competitivo en entornos de evaluación estándar. Su relevancia radica en demostrar que es posible construir VLA eficientes con recursos computacionales limitados, sin sacrificar la precisión en tareas espaciales de robots simulados. La licencia MIT permite su uso comercial y académico sin restricciones, y su arquitectura modular facilita la integración en pipelines de robótica existentes.

El checkpoint 5000 corresponde a una etapa avanzada de entrenamiento sobre LIBERO-Spatial, con una configuración que incluye aumento de imagen, LoRA con rango 64 y regresión L1 sobre el chunk de acciones. El modelo se distribuye en formato safetensors y requiere código personalizado para su carga, ya que la evaluación espera una estructura de ficheros específica para la cabeza de acción y el proyector de propiocepción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM backbone (Qwen2.5-0.5B) + vision encoders (DINOv2 + SigLIP) + action head (MLP-ResNet con Bridge Attention Pro) |
| Parametros totales | 1.252.553.792 (1,25 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el backbone Qwen2.5-0.5B soporta hasta 32k tokens, pero no se especifica para este modelo VLA) |
| Tipos de cuantizacion | no disponible (solo safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente inglés, no se indica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el paradigma VLA-Adapter propuesto en el paper arXiv 2509.09372. Se compone de un VLM (Vision-Language Model) que procesa imágenes y texto, y una política que genera acciones. El backbone es Qwen2.5-0.5B (896 hidden units, 24 capas) al que se le añaden dos codificadores visuales: DINOv2 ViT-Large y SigLIP ViT-SO400M, ambos con resolución de entrada de 224x224 píxeles. Las características visuales se fusionan mediante un mecanismo prism que las proyecta al espacio del lenguaje. La cabeza de acción es un MLP-ResNet con Bridge Attention (variante Pro), que predice un chunk de acciones mediante regresión L1.

El entrenamiento se realizó sobre la suite LIBERO-Spatial, con una configuración que incluye batch size 16, learning rate 0.0001, LoRA con rango 64 y dropout 0.0, además de aumento de imágenes. El checkpoint 5000 corresponde a una etapa intermedia del entrenamiento, guardado tras 5000 pasos. El objetivo es la regresión L1 sobre el chunk de acciones, y se evalúa en modo open-loop con 8 pasos. La propiacepción se utiliza como entrada adicional a través de un proyector específico.

## Capacidades

- Generación de acciones robóticas: el modelo predice secuencias de acciones (posiciones y orientaciones del efector) a partir de una instrucción en lenguaje natural y observaciones de cámara.
- Razonamiento espacial: especializado en tareas que requieren entender relaciones espaciales entre objetos (LIBERO-Spatial).
- Multi-step reasoning: soporta ejecución en bucle abierto con 8 pasos de predicción, lo que permite planificar secuencias de movimiento.
- Visión y lenguaje: combina dos codificadores visuales (DINOv2 y SigLIP) con un modelo de lenguaje para interpretar escenas y comandos.
- Integración con propiocepción: acepta datos de propiocepción del robot como entrada adicional para mejorar la precisión.
- Carga flexible: el backbone puede cargarse con `AutoModelForVision2Seq` de Transformers, mientras que la cabeza de acción requiere ficheros específicos.

## Casos de uso

- Evaluación de políticas robóticas en entornos simulados: el modelo está diseñado para el benchmark LIBERO-Spatial, donde se evalúa su capacidad para completar tareas como "coger el bloque rojo y colocarlo en el recipiente" con éxito. Se usa en pipelines de investigación para comparar algoritmos de aprendizaje por refuerzo o imitación.
- Desarrollo de VLA compactos para robots de bajo coste: al tener solo 1,25 B de parámetros, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 3090) y sirve como base para experimentos de fine-tuning en tareas específicas sin necesidad de infraestructura de alto rendimiento.
- Fine-tuning en nuevas tareas de manipulación: gracias a la arquitectura modular y la licencia MIT, los desarrolladores pueden adaptar el modelo a nuevos conjuntos de datos robóticos añadiendo cabezas de acción adicionales o ajustando el backbone con LoRA.
- Investigación sobre escalado eficiente de VLA: el modelo es un punto de referencia para estudiar cómo reducir la dependencia de grandes modelos de lenguaje en robótica, comparando rendimiento frente a alternativas más grandes como OpenVLA.
- Prototipado de sistemas de control basados en lenguaje: integrable en frameworks como ROS o MuJoCo para probar comandos de alto nivel ("mueve el objeto a la izquierda") en brazos robóticos simulados.
- Generación de demostraciones sintéticas: puede utilizarse para generar trayectorias de acción en simulación, que luego sirven como datos de entrenamiento para otros modelos o para verificar planificadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo fue evaluado en la suite LIBERO-Spatial, pero no se proporcionan tasas de éxito concretas en la model card ni en los resultados de búsqueda web consultados. Se recomienda consultar el paper arXiv 2509.09372 para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: con 1,25 B de parámetros en precisión FP32, la inferencia requiere aproximadamente 5 GB de VRAM solo para los pesos. Con cuantización (si se aplicara) podría reducirse, pero no se ofrecen versiones cuantizadas. En FP16, el modelo ocuparía alrededor de 2,5 GB, lo que cabe en GPUs consumer.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar el modelo en FP16.
- Compatibilidad con GPUs consumer: sí, es viable en tarjetas como RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: dado que el modelo se carga con `trust_remote_code=True`, se puede usar con Transformers. Para la inferencia completa (incluyendo la cabeza de acción), se requiere el código de evaluación del repositorio GitHub de VLA-Adapter. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un modelo de robótica, no un LLM generativo.
- Latencia y throughput: no disponibles. Depende del hardware y del número de imágenes procesadas (2 imágenes por paso en la evaluación estándar).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA-Adapter-LIBERO-Spatial-5000 | 1,25 B | no disponible | LIBERO-Spatial | MIT | HuggingFace |
| OpenVLA (7B) | 7 B | 32k (backbone) | Varias tareas (LIBERO, Bridge, etc.) | MIT | HuggingFace |
| RT-2 (55B) | 55 B | no disponible | Robótica general | no disponible (propietario) | no público |

El modelo es significativamente más pequeño que OpenVLA (1,25 B frente a 7 B), lo que lo hace más adecuado para entornos con recursos limitados. Sin embargo, OpenVLA tiene una cobertura más amplia de tareas y benchmarks. RT-2 no es de código abierto, por lo que la comparación se limita a alternativas abiertas.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero al estar entrenado en LIBERO-Spatial, su rendimiento puede degradarse en tareas fuera de ese dominio.
- Riesgo de alucinación: como todo modelo de aprendizaje automático, puede generar acciones incorrectas o inconsistentes con la instrucción, especialmente en escenas no vistas. La evaluación en bucle abierto con 8 pasos limita la propagación de errores, pero no la elimina.
- Limitaciones de contexto: la ventana de contexto no está especificada; el backbone Qwen2.5-0.5B soporta 32k tokens, pero el modelo VLA procesa 2 imágenes de 224x224, lo que limita la cantidad de información visual que puede manejar.
- Limitaciones de idioma: no se indica qué idiomas soporta; probablemente solo inglés, dado que las instrucciones de LIBERO están en inglés.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación, pero el código personalizado (custom_code) puede tener dependencias adicionales que deben revisarse.
- Caveat para producción: el modelo está diseñado para simulación (LIBERO) y no ha sido validado en robots físicos. La integración requiere manejar la propiocepción y la cabeza de acción con los ficheros renombrados, lo que puede ser frágil si se cambia la estructura del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/Zenma/VLA-Adapter-LIBERO-Spatial-5000
- Repositorio oficial del modelo (VLA-Adapter/LIBERO-Spatial): https://huggingface.co/VLA-Adapter/LIBERO-Spatial
- Código fuente (GitHub): https://github.com/OpenHelix-Team/VLA-Adapter
- Paper (arXiv): https://arxiv.org/html/2509.09372v2
