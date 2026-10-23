# THUSI-Lab/GameScaling

## Resumen

GameScaling es una familia de modelos visión-lenguaje derivada de Qwen3.5 mediante preentrenamiento continuado (_continued pre-training_) sobre grabaciones de gameplay con control de teclado y ratón. La desarrolla THUSI-Lab (College of AI, Universidad de Tsinghua) en colaboración con el equipo de I+D de Honkai AI de miHoYo, junto con la Universidad de Ciencias de la Academia China de Ciencias, MMLab (Universidad de Hong Kong), la Universidad Nacional de Singapur y la Universidad de Pekín. El modelo se publica como un conjunto de ocho puntos de control: cuatro tamaños (0,8B, 2B, 9B y 27B) y dos etapas de entrenamiento por tamaño (S1 y S3).

El problema que aborda es el de los agentes encarnados (_embodied agents_) en entornos virtuales: un modelo que observe fotogramas de pantalla y emita acciones discretas de teclado y ratón, en lugar de razonar únicamente sobre texto. Frente a los modelos base de propósito general, GameScaling incorpora en el preentrenamiento la distribución concreta de decisiones de bajo nivel que requiere un juego (pulsaciones, movimientos de cámara, combinaciones de teclas), lo que lo hace relevante para investigación en agentes de juego, generación de datos de comportamiento y evaluación de políticas en entornos simulados.

La familia se distribuye bajo licencia Apache 2.0 y en formato `transformers`, con pipeline `image-text-to-text`. El repositorio agregado ocupa 162,4 GB, aunque la model card no detalla la longitud de contexto, los esquemas de cuantización ni los resultados de evaluación de los puntos de control, por lo que las comparaciones cuantitativas con alternativas quedan limitadas a tamaño y disponibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (modelo base Qwen3.5 con preentrenamiento continuado); detalles internos de atención y capas no disponibles |
| Parámetros totales | Cuatro variantes: 0,8B, 2B, 9B y 27B (según nomenclatura de los puntos de control y modelos base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (`en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio compatible con `transformers`; tamaño agregado del repo: 162,4 GB) |

Detalle de los puntos de control publicados:

| Punto de control | Tamaño | Etapa | Modelo base |
|---|---|---|---|
| GameScaling-0.8B-S1 | 0,8B | S1 | Qwen/Qwen3.5-0.8B |
| GameScaling-0.8B-S3 | 0,8B | S3 | Qwen/Qwen3.5-0.8B |
| GameScaling-2B-S1 | 2B | S1 | Qwen/Qwen3.5-2B |
| GameScaling-2B-S3 | 2B | S3 | Qwen/Qwen3.5-2B |
| GameScaling-9B-S1 | 9B | S1 | Qwen/Qwen3.5-9B |
| GameScaling-9B-S3 | 9B | S3 | Qwen/Qwen3.5-9B |
| GameScaling-27B-S1 | 27B | S1 | Qwen/Qwen3.5-27B |
| GameScaling-27B-S3 | 27B | S3 | Qwen/Qwen3.5-27B |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3.5 en su configuración multimodal (`image-text-to-text`), es decir, un transformer que tokeniza tanto texto como imagen. Sobre esa base, los autores aplican preentrenamiento continuado con datos de gameplay capturados con teclado y ratón, un dominio en el que la secuencia de acciones es de grano fino y está fuertemente condicionada por el estado visual del juego. La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de ajuste supervisado, RLHF o DPO.

La innovación declarada es el propio eje de escalado: la familia cubre cuatro tamaños y dos etapas de entrenamiento (S1 y S3) por tamaño, lo que permite estudiar cómo escala la competencia como agente de juego con los parámetros y con la duración del preentrenamiento continuado. No se documentan en la información disponible técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas SSM.

## Capacidades

- Comprensión conjunta de imagen y texto: el pipeline declarado es `image-text-to-text`, orientado a interpretar fotogramas de juego junto con instrucciones en lenguaje natural.
- Emisión de acciones de teclado y ratón: el modelo está entrenado para el control de agentes en entornos virtuales con entrada de teclado y ratón (`keyboard-mouse`), no solo para describir la escena.
- Comportamiento de agente de juego (`game-agent`): selección de acciones de bajo nivel a partir de la observación visual.
- Agente encarnado (`embodied-agent`): pensado para bucles de percepción-acción en entornos simulados.
- Capacidades heredadas del modelo base Qwen3.5 de visión-lenguaje: razonamiento visual y generación de texto en inglés. El alcance concreto de estas capacidades en los puntos de control publicados no está documentado.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Modo de razonamiento explícito (_thinking mode_), audio u otras modalidades: no disponible.
- Multilingüismo: limitado al inglés según la model card.

## Casos de uso

- Agentes de juego automatizados: el modelo recibe el fotograma actual y el estado de la partida y emite la siguiente acción de teclado o ratón, integrándose en un bucle de percepción-acción a frecuencia de tick del juego.
- Investigación en agentes encarnados: sirve como política de referencia para comparar el efecto del tamaño (0,8B frente a 27B) y de la etapa de preentrenamiento (S1 frente a S3) en tareas de control dentro de mundos virtuales.
- Generación de datos de comportamiento sintético: las trayectorias producidas por el modelo pueden utilizarse para aumentar datasets de imitación o para preentrenar políticas posteriores, dado que el modelo ya está en la distribución de acciones de juego.
- Evaluación de entornos y de motores de juego: al tener una política entrenada sobre gameplay real, permite detectar regresiones en física, colisiones o respuesta a controles comparando las acciones emitidas antes y después de un cambio en el motor.
- Prototipado rápido de NPC y compañeros controlados por IA: la variante de 0,8B o 2B puede ejecutarse localmente para validar comportamientos antes de invertir en un modelo mayor.
- Automatización de pruebas de regresión en videojuegos: un agente que pulsa teclas y mueve el ratón de forma consistente permite reproducir secuencias de prueba sin intervención manual.
- Herramientas de accesibilidad y remapeo de controles: usar la predicción de acciones como referencia para adaptar esquemas de control o generar asistencias de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card y los resultados de búsqueda consultados no incluyen cifras de MMLU, HumanEval, GSM8K ni de métricas específicas de agentes de juego (tasa de éxito por tarea, recompensa media o progreso en el juego) para ninguno de los ocho puntos de control. No se han incluido números estimados para no introducir datos no verificados.

## Requisitos de hardware

Estimaciones basadas en el número de parámetros; los pesos en precisión de 16 bits requieren aproximadamente dos bytes por parámetro, antes de contar el codificador visual y la caché de contexto:

- GameScaling-0.8B: ~1,6 GB de pesos en FP16; cuantizado a 4 bits, por debajo de 1 GB. Cabe en cualquier GPU de consumo (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en CPU con llama.cpp u Ollama, si bien el soporte de estas herramientas para el modelo no está confirmado.
- GameScaling-2B: ~4 GB en FP16; ~1,5 GB en 4 bits. Cabe en GPUs de consumo de 8 GB o más.
- GameScaling-9B: ~18 GB en FP16; ~6 GB en 4 bits. Requiere RTX 4090 (24 GB) o A100/H100 para FP16 completo; en cuantización 4 bits entra en GPUs de 8-12 GB con holgura limitada de contexto.
- GameScaling-27B: ~54 GB en FP16; ~16-18 GB en 4 bits. Necesita A100 40/80 GB, H100 o varias GPUs de consumo en paralelo para FP16; la versión cuantizada puede ejecutarse en una RTX 4090 o en una GPU de 24 GB.
- Opciones de despliegue: al estar publicado con `library_name: transformers` y la etiqueta `endpoints_compatible`, la vía natural es `transformers` (con `AutoModelForVision2Seq` o la clase equivalente de Qwen3.5) y los endpoints de Hugging Face. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible y debe validarse antes de usarlo en producción.
- Latencia y throughput: no disponibles. En un bucle de agente de juego la latencia por paso es crítica; conviene medirla en el hardware objetivo antes de fijar la frecuencia de decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-0.8B (S1/S3) | 0,8B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, repo propio |
| GameScaling-2B (S1/S3) | 2B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, repo propio |
| GameScaling-9B (S1/S3) | 9B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, repo propio |
| GameScaling-27B (S1/S3) | 27B | no disponible | imagen-texto | Apache 2.0 | Hugging Face, repo propio |
| Qwen/Qwen3.5-0.8B, 2B, 9B, 27B (modelos base) | 0,8B / 2B / 9B / 27B | no disponible | imagen-texto | no disponible en la información proporcionada | Hugging Face |

La comparación con otros agentes de juego publicados (por ejemplo, políticas específicas de un único título o modelos de acción discretizada) no puede realizarse con rigor porque la información disponible no incluye métricas de rendimiento ni detalles de entrenamiento de GameScaling. La única comparación defendible es interna a la familia (escalado por tamaño y por etapa S1/S3) y frente a los modelos base Qwen3.5, de los que GameScaling hereda arquitectura y tokenizador.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible afirmar que el modelo supere a su base Qwen3.5 ni a alternativas en ninguna tarea; cualquier afirmación de rendimiento requiere evaluación propia.
- Dominio estrecho: el preentrenamiento continuado se centra en gameplay con teclado y ratón, lo que puede degradar capacidades generales de conversación o razonamiento respecto al modelo base (olvido catastrófico), algo que la model card no cuantifica.
- Un solo idioma documentado (inglés): las instrucciones o interfaces en castellano no están cubiertas por la model card.
- Sesgos: no documentados por los autores; al entrenar sobre grabaciones de juego, puede reproducir sesgos de estilo de juego, resolución de pantalla, género de videojuego y configuración de controles de los datos de captura.
- Riesgo de alucinación y de acciones inválidas: en un bucle de agente, una predicción incorrecta se traduce en una acción física sobre el entorno, con efectos acumulativos; se recomienda validación y limitadores externos.
- Dependencia de la representación visual: cambios de resolución, HUD, idioma de la interfaz o del título del juego pueden degradar el comportamiento, y no se documenta la robustez frente a esas variaciones.
- Adopción muy temprana: 35 descargas y 25 likes en el momento de la consulta, con última actualización el 22 de octubre de 2026; el soporte de la comunidad y de los frameworks de inferencia es limitado.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones de los modelos base Qwen3.5, cuyos términos no se detallan en la información disponible.
- El repositorio agregado ocupa 162,4 GB; descargar la familia completa exige planificar espacio en disco y ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling
- Paper en arXiv: https://arxiv.org/abs/2610.28698
- Página del paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io/
- Colección de modelos GameScaling: https://huggingface.co/collections/THUSI-Lab/gamescaling-model
- Puntos de control individuales: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3, https://huggingface.co/THUSI-Lab/GameScaling-9B-S1, https://huggingface.co/THUSI-Lab/GameScaling-9B-S3, https://huggingface.co/THUSI-Lab/GameScaling-27B-S1, https://huggingface.co/THUSI-Lab/GameScaling-27B-S3
- Organización en GitHub: https://github.com/THUSI-Lab
- Modelos base: https://huggingface.co/Qwen/Qwen3.5-0.8B, https://huggingface.co/Qwen/Qwen3.5-2B, https://huggingface.co/Qwen/Qwen3.5-9B, https://huggingface.co/Qwen/Qwen3.5-27B
