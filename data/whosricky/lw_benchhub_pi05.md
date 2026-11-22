# whosricky/lw_benchhub_pi05

## Resumen

`whosricky/lw_benchhub_pi05` es un fine-tuning del modelo Vision-Language-Action (VLA) π₀.₅ (Pi05) de Physical Intelligence, adaptado y publicado mediante la librería LeRobot de Hugging Face. El modelo base, `lerobot/pi05_base`, se ha ajustado sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, compuesto por 6.500 episodios y 6.010.166 fotogramas a 50 FPS de tareas de manipulación doméstica (cocina, cajones, microondas, platos y estanterías) ejecutadas por un robot de doble brazo Piper. El resultado es una política robótica que mapea observaciones visuales y de estado a acciones de 12 dimensiones.

El modelo resuelve el problema de la generalización en entornos abiertos: π₀.₅ evoluciona π₀ para transferir habilidades a situaciones y entornos no vistos durante el entrenamiento. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 33,2 GB en formato safetensors, es un modelo considerable para inferencia robótica en tiempo real, pensado para ejecutarse sobre hardware de gama alta o GPUs de datacenter.

Es relevante ahora porque representa la convergencia entre modelos de lenguaje/visión de gran escala y control robótico de bajo nivel, empaquetado en el ecosistema LeRobot para que la comunidad pueda reproducir entrenamientos y despliegues sin depender de infraestructura propietaria. La licencia Gemma impone condiciones específicas de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), transformer multimodal con cabeza de acciones |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; las instrucciones de tarea están en inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura π₀.₅ de Physical Intelligence, un modelo Vision-Language-Action que combina un backbone visión-lenguaje con una cabeza de predicción de acciones. La implementación disponible en LeRobot está adaptada del repositorio OpenPI de Physical Intelligence. El modelo consume tres cámaras RGB de 224×224 (vista base, muñeca izquierda y muñeca derecha) más un vector de estado de 32 dimensiones, y produce un vector de acción de 12 dimensiones, lo que corresponde a un robot de doble brazo Piper con seis grados de libertad por brazo.

El ajuste fino se realizó sobre el dataset `LightwheelAI/Lightwheel-Tasks-Double-Piper`, con 6.500 episodios y 6.010.166 fotogramas a 50 FPS. Las tareas cubren un repertorio amplio de manipulación doméstica: abrir y cerrar cajones, encender la vitrocerámica, colocar la cafetera moka, introducir tazas en el microondas, apilar cuencos, colocar platos y organizar productos en una cesta o bandeja. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición exacta del dataset más allá de las tareas listadas, ni sobre si se aplicaron técnicas de RLHF o DPO en el ajuste. Tampoco se documentan innovaciones de decodificación especulativa o atención lineal en la información proporcionada.

## Capacidades

- Generación de acciones robóticas de 12 dimensiones a partir de observaciones visuales multi-cámara y estado proprioceptivo.
- Control de robot de doble brazo tipo Piper con tareas de manipulación fina (agarre, apilado, apertura de cajones, pulsación de botones).
- Comprensión de instrucciones de tarea en lenguaje natural en inglés (las tareas del dataset están descritas en inglés).
- Generalización a entornos y situaciones no vistas, según la propuesta de π₀.₅.
- Integración con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No se documenta soporte de tool calling, function calling, agentes multi-paso ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades de audio ni de visión más allá de las tres cámaras RGB de entrada.

## Casos de uso

- Automatización de cocina doméstica: el modelo puede ejecutar secuencias como encender la vitrocerámica y colocar la cafetera moka encima, usando las tres vistas de cámara para localizar los objetos y el estado de 32 dimensiones para coordinar ambos brazos.
- Manipulación de cajones y armarios: tareas como abrir el cajón superior, introducir un cuenco y cerrarlo se benefician de la política entrenada específicamente sobre estas secuencias, reduciendo la necesidad de programación explícita.
- Organización de utensilios en bandejas y cestas: el modelo puede recoger productos (sopa, queso crema, kétchup, tomate) y depositarlos en una cesta o bandeja, útil en entornos de logística doméstica o laboratorios de robótica.
- Control de electrodomésticos: abrir y cerrar el microondas e introducir tazas en su interior, una tarea que requiere coordinación visomotora precisa y que el modelo ha visto durante el entrenamiento.
- Apilado y colocación de vajilla: apilar cuencos o colocar tazas en platos concretos (izquierdo o derecho) demuestra la capacidad del modelo para razonar sobre relaciones espaciales entre objetos.
- Investigación en generalización VLA: al ser un fine-tuning reproducible sobre LeRobot, sirve como base para estudiar transferencia a nuevos entornos, comparar variantes de π₀.₅ y evaluar políticas sobre el benchmark Lightwheel.
- Prototipado de pipelines de robótica con LeRobot: el modelo puede integrarse en flujos de entrenamiento y evaluación estandarizados, facilitando la comparación con otras políticas del mismo ecosistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,14 mil millones de parámetros en safetensors (probablemente fp32 o bf16), se estiman del orden de 16-33 GB de VRAM en precisión completa; no se dispone de datos oficiales de cuantización ni de requisitos exactos.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría esperar GPUs de datacenter como A100 o H100 para inferencia en tiempo real a 50 FPS, aunque no se confirma.
- ¿Cabe en GPU de consumo? No confirmado. Un modelo de ~4 mil millones de parámetros podría caber en GPUs de consumo de gama alta con cuantización, pero no se documentan opciones de cuantización ni requisitos oficiales.
- Opciones de despliegue: LeRobot (librería principal), con posible integración en el ecosistema Hugging Face; no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| whosricky/lw_benchhub_pi05 | ≈4,14 mil millones | no disponible | gemma | Hugging Face (LeRobot) | Fine-tuning de π₀.₅ sobre dataset Double-Piper |
| lerobot/pi05_base | no disponible | no disponible | gemma | Hugging Face (LeRobot) | Modelo base del que deriva este fine-tuning |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | no disponible | OpenPI (open source) | Predecesor de π₀.₅, sin generalización a entornos abiertos |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset concreto de tareas domésticas, el modelo puede estar sesgado hacia esos objetos y entornos.
- Riesgo de alucinación: en robótica, se traduce en acciones incorrectas o inseguras; no se documentan mecanismos de seguridad ni de parada de emergencia.
- Limitaciones de contexto e idioma: las instrucciones de tarea están en inglés y no se documenta soporte multilingüe; la longitud de contexto no está disponible.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluidas posibles restricciones para uso comercial y requisitos de atribución; es imprescindible revisar los términos completos antes de desplegar.
- Caveat para producción: el modelo está entrenado para un robot específico (doble brazo Piper) con tres cámaras y un vector de estado de 32 dimensiones; no es directamente transferible a otras plataformas sin reentrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.
- No se documentan resultados de benchmarks ni evaluaciones independientes, por lo que el rendimiento real en entornos nuevos es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whosricky/lw_benchhub_pi05
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/LightwheelAI/Lightwheel-Tasks-Double-Piper
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI de Physical Intelligence: no disponible como enlace directo en la información proporcionada.
