# x-square-robot/wall-wm-2.0-robodojo

## Resumen

Wall-wm-2.0-robodojo es un modelo de mundo (world model) orientado a robótica, publicado por x-square-robot bajo el paraguas del framework wall-x. Se trata de un checkpoint de preentrenamiento del que parte el entrenamiento RoboDojo, y se publica como preview de Wall-wm-2.0, con el que difiere principalmente en el número de iteraciones de entrenamiento. El modelo combina un backbone de lenguaje Qwen3.5-9B con componentes derivados de Wan2.2, lo que sugiere un enfoque híbrido entre modelado de lenguaje y generación/modelado visual para predecir dinámicas de entornos robóticos.

El checkpoint contiene aproximadamente 6.385 millones de parámetros totales (6,385 mil millones) en pesos bf16, con un repositorio de 24,1 GB. Está pensado para tareas de robótica (pipeline_tag: robotics) y se distribuye con licencia Apache 2.0, lo que permite uso comercial con atribución. Su relevancia actual radica en que los world models están emergiendo como una vía para entrenar políticas robóticas mediante simulación aprendida y planificación en espacio latente, en lugar de depender exclusivamente de entornos físicos o simuladores tradicionales.

Al ser un preview con 0 descargas y 0 likes, y sin benchmarks publicados, debe tratarse como un artefacto de investigación temprana: útil para reproducir el punto de partida de RoboDojo, pero sin evidencia pública de rendimiento que permita recomendarlo para producción sin validación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone de lenguaje Qwen3.5-9B combinado con componentes de Wan2.2 (world model); detalles completos no disponibles |
| Parámetros totales | 6.385.163.002 (~6,39 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16); incluye config.yml y normalizer_action.pth |

## Arquitectura y entrenamiento

La model card indica que el modelo se apoya en el tokenizer y la plantilla de chat de Qwen/Qwen3.5-9B, y que incorpora componentes etiquetados como Wan2.2. Esto apunta a una arquitectura híbrida en la que un transformer de lenguaje de ~9 mil millones de parámetros actúa como backbone semántico, mientras que módulos derivados de Wan2.2 aportan capacidades de modelado visual o de dinámica. El número total de parámetros del checkpoint (6,385 mil millones) es inferior al del Qwen3.5-9B nominal, lo que sugiere que parte del backbone original no se incluye o se comparte/elimina en esta composición; el dato exacto de qué componentes se conservan no está disponible.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo. El checkpoint incluye `normalizer_action.pth`, que contiene estadísticas de acciones y estados, un artefacto típico en modelos de política robótica para normalizar observaciones y comandos motores. Al ser un preview previo a Wall-wm-2.0 y diferir de este principalmente en iteraciones de entrenamiento, cabe esperar que su rendimiento sea inferior al de la versión final, pero no hay datos que lo cuantifiquen.

## Capacidades

- Modelado de mundo para robótica: orientado a predecir la evolución de estados y acciones en entornos de manipulación o navegación, según el pipeline declarado (robotics).
- Procesamiento de lenguaje: hereda el tokenizer y la plantilla de chat de Qwen3.5-9B, por lo que se espera soporte de instrucciones en formato conversacional, aunque no se detalla el alcance multilingüe.
- Integración con acciones motoras: incluye estadísticas de normalización de acciones y estados (`normalizer_action.pth`), lo que indica que el modelo consume y produce representaciones de acción.
- Componente visual/dinámico: la referencia a Wan2.2 sugiere capacidad de modelado de vídeo o de dinámica visual, sin confirmación explícita en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

- Entrenamiento de políticas robóticas en simulación aprendida: el modelo puede usarse como world model para generar rollouts sintéticos sobre los que entrenar políticas de control, reduciendo la dependencia de simuladores físicos y del tiempo real de robot.
- Reproducción de experimentos RoboDojo: al ser el checkpoint de partida del entrenamiento RoboDojo, permite reproducir el pipeline de entrenamiento y comparar variantes con el mismo punto inicial.
- Planificación en espacio latente: un world model permite evaluar trayectorias de acción antes de ejecutarlas en hardware, filtrando comandos de alto riesgo en robots manipuladores.
- Preentrenamiento de modelos de manipulación: sirve como inicialización para fine-tuning en tareas específicas de agarre, ensamblaje o apilamiento, aprovechando las estadísticas de acción incluidas.
- Investigación en modelado de dinámica visual: los componentes derivados de Wan2.2 pueden emplearse para estudiar predicción de frames y coherencia temporal en entornos robóticos.
- Desarrollo de datasets sintéticos: generar pares estado-acción anotados automáticamente para ampliar datasets de robótica antes del despliegue en robot real.
- Evaluación comparativa de world models: al estar publicado con licencia Apache 2.0 y pesos abiertos, permite comparaciones controladas frente a otros world models en las mismas condiciones de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 12,8 GB solo para pesos (6,385 mil millones × 2 bytes), más overhead de activaciones, KV cache y componentes visuales; se recomienda al menos 24 GB para margen operativo.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue estable; RTX 4090 (24 GB) podría ser suficiente en bf16 con batch pequeño, aunque el overhead de los módulos visuales puede exceder la memoria.
- Cabe en GPU de consumo: probablemente en RTX 4090 o RTX 3090 (24 GB) con cuantización o batch 1; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior, no documentada oficialmente.
- Opciones de despliegue: la librería declarada es wall-x, específica del autor; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI. Para robótica, el despliegue típico sería mediante el runtime wall-x junto con el normalizador de acciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Wall-wm-2.0-robodojo | ~6,39 mil millones | no disponible | Apache 2.0 | Hugging Face (preview) | World model híbrido Qwen3.5-9B + Wan2.2 |
| Wall-wm-2.0 (versión final) | no disponible | no disponible | no disponible | Anunciada, no publicada en la información | Difiere del preview en iteraciones de entrenamiento |
| Qwen3.5-9B | ~9 mil millones (nominal) | no disponible | no disponible | Hugging Face (Qwen) | Backbone de lenguaje del que hereda tokenizer y chat template |
| Wan2.2 | no disponible | no disponible | no disponible | no disponible | Fuente de componentes visuales/dinámicos referenciados |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un preview, no la versión final: difiere de Wall-wm-2.0 en número de iteraciones de entrenamiento, por lo que su calidad es presumiblemente inferior y no debe evaluarse como release estable.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas de robótica, lo que impide recomendarlo para producción sin validación propia.
- Cero descargas y cero likes en Hugging Face: no hay señal de uso comunitario ni reportes de fallos.
- Idiomas no declarados: se desconoce el alcance multilingüe real pese a heredar el tokenizer de Qwen3.5-9B.
- Contexto no documentado: se desconoce la ventana máxima efectiva, lo que limita planificar tareas de horizonte largo.
- Riesgo de alucinación y deriva en rollouts: los world models pueden generar dinámicas plausibles pero físicamente incorrectas; cualquier política entrenada sobre ellos debe validarse en hardware real.
- Dependencia de la librería wall-x: el despliegue está atado a un runtime específico del autor, con menor ecosistema que vLLM o llama.cpp.
- Licencia Apache 2.0: permite uso comercial con atribución y aviso de cambios, pero conviene revisar las licencias de los componentes derivados (Qwen3.5-9B y Wan2.2) antes de redistribuir.
- Sesgos: no documentados; al no declararse dataset de entrenamiento, no es posible evaluar sesgos de dominio.

## Enlaces

- Hugging Face: https://huggingface.co/x-square-robot/wall-wm-2.0-robodojo
- Qwen3.5-9B (tokenizer y chat template): https://huggingface.co/Qwen/Qwen3.5-9B
- Wan2.2 (componentes referenciados): no disponible en la información proporcionada
- Framework wall-x: no disponible en la información proporcionada
- Paper, blog o demo de RoboDojo: no disponible en la información proporcionada
