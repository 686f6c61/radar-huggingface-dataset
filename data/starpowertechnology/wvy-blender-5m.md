# StarpowerTechnology/WVY-Blender-5m

## Resumen
WVY-Blender-5m es un modelo de lenguaje minúsculo desarrollado por StarpowerTechnology, entrenado desde cero para transformar descripciones en lenguaje natural en escenas 3D animadas y editables dentro de Blender. Con tan solo 5,25 millones de parámetros y un checkpoint de 21 MB, el modelo no genera mallas ni imágenes directamente: predice un lenguaje compacto de instrucciones de escena que un intérprete y un generador procedural en Blender convierten en geometría, materiales, keyframes, iluminación y cámara.

El modelo resuelve el problema de la creación rápida de escenas estilizadas sin salir del entorno local: acepta instrucciones de seguimiento ("haz el perro azul", "añade un árbol", "aleja la cámara") y también enruta preguntas sobre Blender hacia una base de conocimiento de 119 temas. Su relevancia actual radica en que demuestra que un modelo de 5,25 M de parámetros, ejecutable en CPU, puede controlar un pipeline creativo complejo cuando el espacio de salida está bien acotado mediante un esquema de escena cerrado.

La arquitectura es un transformer de lenguaje de propósito general adaptado a un vocabulario de instrucciones de escena, con un corpus de entrenamiento de 1.112.000 pares inglés-instrucción generados localmente. La licencia no está declarada en la información disponible, lo que condiciona cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de lenguaje (detalles de capas y dimensiones no disponibles) |
| Parametros totales | 5,25 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (checkpoint de 21 MB en precisión original) |
| Idiomas soportados | Inglés (en) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (checkpoint de 21 MB); no se indica safetensors ni GGUF |

## Arquitectura y entrenamiento
WVY-Blender-5m es un modelo de lenguaje transformer entrenado desde cero sobre pares de prompts en inglés y un lenguaje compacto de instrucciones de escena. El entrenamiento se realizó en dos fases: una ejecución inicial con un corpus de 900.000 pares (12.000 actualizaciones iniciales) y una continuación con el corpus ampliado de 1.112.000 pares (4.500 actualizaciones adicionales), con tamaño de lote 96. El corpus se compone de 540.000 descripciones de escena, 252.000 ediciones de seguimiento y 320.000 preguntas sobre Blender, generadas o redactadas localmente para el proyecto, incluyendo variaciones de fraseo, errores ortográficos y sinónimos para ampliar la cobertura lingüística.

La innovación principal no está en la red neuronal sino en el diseño del espacio de salida: el modelo predice tokens de un esquema cerrado (tipos de objeto, colores, acciones, relaciones, localización, clima, iluminación y cámara) que un intérprete aplica y un generador procedural de Blender ejecuta. Por ejemplo, el prompt "a red dog walking in a blue house" se decodifica como `<new> loc=house place=in lcolor=blue <ent> type=dog color=red act=walk`. El vocabulario cubre 126 tipos de objeto, 29 acciones, 24 ajustes de escena y 119 temas de conocimiento de Blender. No se menciona RLHF, DPO ni decodificación especulativa en la información disponible.

## Capacidades
- Generación de escenas 3D a partir de texto: crea especificaciones completas de escena con sujetos, entorno, clima, hora del día e iluminación.
- Creación de personajes y objetos: 126 tipos soportados entre personas, animales, vehículos, mobiliario, luces, accesorios y formas.
- Animación de acciones: vocabulario de 29 acciones que incluye caminar, correr, saltar, bailar, volar y rodar.
- Composición de relaciones entre sujetos: montar a caballo, sentarse en un sofá, saltar sobre un coche o moverse alrededor de otro sujeto.
- Modificación de apariencia: colores, tamaños, acabados de material, pelo, ropa y atributos de personaje soportados.
- Dirección de escena: 24 ajustes de entorno, clima, hora del día, iluminación, tamaño de plano, movimiento de cámara, presets de lente y profundidad de campo.
- Edición conversacional: instrucciones de seguimiento como "make the dog blue", "add a tree", "remove the car" o "zoom out".
- Enrutamiento de preguntas sobre Blender hacia 119 temas de conocimiento escritos.
- Salida editable en Blender: conserva objetos, materiales, cámaras y keyframes reales en la escena.
- No soporta entrada de imagen, generación de mallas arbitrarias ni comandos numéricos de rotación dentro del esquema actual.

## Casos de uso
- Previsualización rápida de escenas para animación: un guionista describe "un zorro saltando sobre un coche con nieve al amanecer" y obtiene una escena Blender editable con keyframes y cámara de seguimiento, lista para refinar a mano.
- Storyboarding automatizado: generar secuencias de planos con tamaño de plano, movimiento de cámara y presets de lente definidos en el prompt, acelerando la fase de preproducción antes de la animación final.
- Edición iterativa de escenas existentes: el modelo aplica instrucciones de seguimiento sobre la escena ya creada ("haz el perro azul", "añade un árbol"), lo que permite flujos de trabajo conversacionales dentro de Blender sin reconstruir la escena desde cero.
- Asistente de aprendizaje de Blender: enruta preguntas del usuario hacia 119 temas de conocimiento escritos, útil como ayuda contextual integrada en el propio entorno de modelado.
- Generación de contenido para prototipos de videojuegos o entornos virtuales: escenas estilizadas con objetos y acciones predefinidas que sirven como base para assets procedurales.
- Herramientas creativas locales y offline: al ser un modelo de 21 MB ejecutable en local, encaja en plugins de escritorio o entornos sin conexión donde no se quiere depender de APIs externas.
- Docencia y talleres de 3D: creación de escenas de ejemplo a partir de descripciones sencillas para ilustrar conceptos de composición, iluminación y animación en Blender.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El model-index del autor declara una entrada para WVY-Blender-5m con la lista de resultados vacía.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el checkpoint ocupa 21 MB y el modelo tiene 5,25 M de parámetros, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requieren GPU dedicadas; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en sistemas integrados.
- Opciones de despliegue: PyTorch (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. El pipeline requiere el intérprete de escena y el generador procedural de Blender incluidos en el proyecto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares
No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (modelos de lenguaje minúsculos entrenados desde cero para controlar escenas 3D procedurales en Blender).

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| WVY-Blender-5m | 5,25 M | No disponible | No disponible | Texto a instrucciones de escena Blender |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias
- El modelo solo genera escenas estilizadas procedurales dentro de un vocabulario cerrado; no produce mallas arbitrarias ni geometría fuera de los 126 tipos de objeto soportados.
- No acepta entrada de imagen ni comandos numéricos de rotación en el esquema actual.
- Solo soporta inglés; no hay capacidades multilingües declaradas.
- Riesgo de alucinación y de omisión de detalles: el autor advierte que los ejemplos mostrados son selecciones y no una garantía de que todos los detalles solicitados se reproduzcan siempre.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia no declarada: la ausencia de licencia explícita impide asumir permisos de uso comercial; es necesario contactar con el autor antes de integrarlo en productos.
- Longitud de contexto no documentada, lo que limita la planificación de conversaciones multi-turno largas.
- El corpus de entrenamiento fue generado o redactado localmente, con posibles limitaciones de diversidad lingüística y cobertura de casos límite.
- El sistema depende del intérprete y del generador procedural de Blender incluidos; el modelo por sí solo no produce escenas sin ese pipeline.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m
- Manifiesto de demostración con prompts y hash del checkpoint: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/blob/main/demo_manifest.json
- Vídeo de demostración (showreel): https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/wvy-showreel.mp4
- Demo robot en monopatín: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/robot-skateboard.mp4
- Demo zorro sobre coche: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/fox-snow.mp4
- Demo alien a caballo: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/alien-horse.mp4
