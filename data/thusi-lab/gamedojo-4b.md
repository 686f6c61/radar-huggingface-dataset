# THUSI-Lab/GameDojo-4B

## Resumen

GameDojo-4B es un modelo vision-lenguaje (VLM) especializado en la ejecución de combates contra jefes en videojuegos, desarrollado por THUSI-Lab en colaboración con la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad Nacional de Singapur, la Universidad de Hong Kong y la Universidad de Macao. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-4B, por lo que hereda su arquitectura transformer multimodal y su ventana de contexto, pero se ha entrenado específicamente para el benchmark GameDojo, que evalúa agentes interactivos en tiempo real dentro de videojuegos.

El modelo recibe observaciones del juego (imágenes) junto con el contexto de la tarea y genera acciones de teclado y ratón, lo que lo sitúa en la categoría de agentes "computer-use" orientados a entornos interactivos. Con 4.539 millones de parámetros (aproximadamente 4,5 mil millones), está pensado para desplegarse en hardware de consumo y para investigación sobre agentes que operan en tiempo real, un área donde los modelos generalistas suelen fallar por falta de datos de interacción secuencial y baja latencia.

Su relevancia actual radica en que propone un punto de partida abierto (aunque la licencia no está declarada) para estudiar la toma de decisiones multimodal en entornos dinámicos, un problema distinto al de la generación de texto o la descripción de imágenes. El modelo tiene muy poca tracción en Hugging Face (9 descargas, 0 likes en el momento de la consulta), lo que sugiere que es un artefacto de investigación reciente más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), fine-tuning de Qwen/Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (~4,5 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin GGUF publicado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen 3.5, y se ha ajustado mediante fine-tuning supervisado sobre el dataset THUSI-Lab/GameDojo, orientado a la interacción en tiempo real con videojuegos. La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; la model card se limita a indicar la relación `base_model_relation: finetune` y el pipeline `image-text-to-text`.

La innovación principal no está en la arquitectura, que se hereda del modelo base, sino en la tarea: el modelo aprende a mapear observaciones visuales del juego y contexto de la tarea a secuencias de acciones de teclado y ratón. Esto lo diferencia de los VLM convencionales, que se entrenan para describir o razonar sobre imágenes, y lo acerca a los agentes "computer-use" que deben actuar de forma secuencial bajo restricciones de latencia. No se han publicado detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de acciones de teclado y ratón a partir de observaciones visuales del juego y contexto de la tarea.
- Comprensión de imágenes de juego (pipeline image-text-to-text) para interpretar el estado de la pantalla.
- Ejecución de combates contra jefes ("boss encounters") en el benchmark GameDojo.
- Razonamiento multi-paso orientado a agentes interactivos en tiempo real.
- Conversación multimodal (tag `conversational`), aunque el foco es la interacción con el juego.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue como servicio.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en agentes interactivos: usar el modelo como línea base para estudiar cómo los VLM toman decisiones secuenciales en entornos dinámicos, aprovechando el benchmark GameDojo para comparar políticas.
- Automatización de pruebas de videojuegos: el modelo puede generar secuencias de acciones para reproducir combates contra jefes y detectar comportamientos anómalos o bugs de forma automatizada.
- Evaluación de modelos "computer-use": integrarlo en pipelines que midan la capacidad de un agente de operar interfaces gráficas bajo latencia, comparándolo con otros modelos del mismo tamaño.
- Educación y demostraciones: mostrar en entornos académicos cómo un VLM de 4,5 B puede aprender políticas de acción a partir de datos de juego, sin necesidad de clústeres grandes.
- Generación de datos sintéticos de interacción: usar las trayectorias generadas por el modelo para aumentar datasets de entrenamiento de agentes, filtrando después por calidad.
- Prototipado de asistentes de juego: construir asistentes que observen la pantalla y sugieran o ejecuten acciones en tiempo real, con la cautela de que la licencia no está declarada.
- Investigación en robustez multimodal: analizar cómo el modelo se degrada ante cambios de resolución, iluminación o estilos visuales en juegos no vistos durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,539 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5-5 GB para pesos, con overhead adicional.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,3-3 GB para pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue concurrente; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en FP16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con cuantización agresiva, en GPUs de 8-12 GB; no se ha verificado compatibilidad con llama.cpp/Ollama porque no hay pesos GGUF publicados.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles; vLLM, TGI o llama.cpp no están confirmados en la información disponible.
- Latencia y throughput: no disponibles; la naturaleza interactiva del caso de uso sugiere que la latencia es un factor crítico, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameDojo-4B | ~4,5 B | no disponible | Agente de juego multimodal | no disponible | Hugging Face (transformers, safetensors) |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | VLM generalista | no disponible en la información | Hugging Face |
| Alternativas de agente computer-use de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre GameDojo-4B y sus alternativas en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para combates contra jefes en el benchmark GameDojo; su rendimiento fuera de ese dominio (otros géneros, otras interfaces, tareas de escritorio) es desconocido y probablemente limitado.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; conviene contactar con los autores antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay garantía de soporte multilingüe, a pesar de heredar el modelo base.
- Riesgo de alucinación y acciones erráticas: al generar secuencias de acciones, los errores pueden tener consecuencias directas en el entorno (pérdida de partida, ejecución de acciones no deseadas), por lo que se recomienda supervisión y sandboxing.
- Sesgos: no se han documentado sesgos específicos, pero al derivar de un modelo base entrenado con datos web, puede heredar sesgos visuales y culturales.
- Tracción mínima: 9 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación independiente ni de comunidad.
- Sin benchmarks publicados: no se puede verificar su calidad frente a alternativas.
- Contexto y cuantizaciones no documentados: dificulta planificar el despliegue y estimar costes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameDojo-4B
- Dataset y benchmark: https://huggingface.co/datasets/THUSI-Lab/GameDojo
- Página del proyecto: https://gamedojo-benchmark.github.io/
- Repositorio GitHub: https://github.com/THUSI-Lab/GameDojo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: enlace pendiente según la model card (no disponible)
