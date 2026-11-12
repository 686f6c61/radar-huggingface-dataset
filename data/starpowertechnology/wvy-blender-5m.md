# StarpowerTechnology/WVY-Blender-5m

## Resumen

WVY-Blender-5m es un modelo de lenguaje en miniatura desarrollado por StarpowerTechnology, entrenado desde cero para convertir descripciones en lenguaje natural en escenas 3D animadas y editables dentro de Blender. Con 5,25 millones de parámetros y un checkpoint de 21 MB, el modelo no genera mallas ni texturas directamente: predice un lenguaje compacto de instrucciones de escena que un intérprete procedural traduce después en geometría, materiales, keyframes, iluminación y cámara.

El modelo se enmarca en la categoría de text-to-3D asistido por DSL (lenguaje específico de dominio). Su vocabulario cubre 126 tipos de objetos, 29 acciones de animación, 24 ajustes de escena y 119 temas de conocimiento sobre Blender. Admite instrucciones de seguimiento para editar escenas ya creadas ("haz el perro azul", "añade un árbol") y enrutamiento de preguntas sobre Blender a identificadores de tema.

Su relevancia radica en el enfoque: en lugar de competir en escala con modelos generativos de vídeo o 3D, apuesta por un modelo local extremadamente pequeño que produce salidas editables y deterministas en una herramienta de producción real. La información pública es limitada, no se declara licencia y no hay resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (no se detalla la configuración interna) |
| Parámetros totales | 5,25 millones |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint de 21 MB en precisión original) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | no disponible (librería pytorch; repo de 0.0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de 5,25 millones de parámetros entrenado desde cero sobre pares de prompt en inglés y un lenguaje compacto de instrucciones de escena. No se especifican el número de capas, dimensiones ocultas, cabezas de atención ni la longitud de contexto. La salida no es texto libre, sino tokens de un DSL propio con etiquetas como `<new>`, `<edit>` y `<ent>`, seguidos de atributos (`type`, `color`, `act`, `loc`, `place`, `lcolor`). Un intérprete externo aplica esos tokens y el código procedural de Blender construye la escena final.

El corpus declarado asciende a 1.112.000 pares: 540.000 descripciones de escena, 252.000 ediciones de seguimiento y 320.000 preguntas sobre Blender. Los datos fueron generados o redactados localmente, con variaciones de fraseo, erratas y errores ortográficos sintéticos para ampliar la cobertura lingüística. El registro de entrenamiento menciona una primera ejecución con 900.000 pares (12.000 actualizaciones) y una continuación con el corpus ampliado (4.500 actualizaciones), con tamaño de lote 96. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación. Las imágenes, vídeos y mallas de la model card son salidas del sistema, no entradas de entrenamiento visual.

## Capacidades

- Generación de especificaciones de escena 3D a partir de texto en inglés: sujeto, entorno, color, acción y relaciones entre objetos.
- Creación de personajes y objetos entre 126 tipos soportados (personas, animales, vehículos, mobiliario, luces, atrezo y formas).
- Animación mediante un vocabulario de 29 acciones: caminar, correr, saltar, bailar, volar, rodar y otras.
- Composición de relaciones entre sujetos: montar a caballo, sentarse en un sofá, saltar sobre un coche, moverse alrededor de otro sujeto.
- Control de apariencia: colores, tamaños, acabados de material, pelo, ropa y atributos de personaje soportados.
- Dirección de escena: 24 ajustes que incluyen clima, hora del día, iluminación, tamaño de plano, movimiento de cámara, presets de lente y profundidad de campo.
- Edición conversacional multi-turno sobre la escena existente: "make the dog blue", "add a tree", "remove the car", "zoom out".
- Enrutamiento de preguntas sobre Blender a 119 temas de conocimiento con respuestas almacenadas en una base de datos incluida.
- Salida editable en Blender: objetos, materiales, cámaras y keyframes reales, no una malla horneada.
- No soporta entrada de imagen, generación de mallas arbitrarias nuevas ni comandos numéricos de rotación según el esquema actual del checkpoint.

## Casos de uso

- Previsualización rápida de escenas para guion gráfico: un guionista describe "un zorro saltando sobre un coche al amanecer con nieve" y obtiene en segundos una escena animada editable que sirve como borrador visual antes de pasar a producción.
- Prototipado de animaciones en estudios pequeños: el modelo genera keyframes de acciones del vocabulario (caminar, bailar, volar) sobre personajes del catálogo, lo que permite iterar sobre blocking sin animar manualmente cada ciclo.
- Herramienta educativa de Blender: las 119 rutas de conocimiento permiten responder dudas frecuentes dentro del propio flujo de trabajo, y las escenas generadas sirven como material didáctico editable para explicar jerarquías, materiales y curvas de animación.
- Generación de escenas para vídeo corto o contenido social: clips de cinco segundos a 12 fps con cámara en órbita o de seguimiento, adecuados para piezas de demostración y maquetas de concepto.
- Edición iterativa asistida por lenguaje: un artista mantiene una escena y aplica cambios incrementales ("haz el perro azul", "añade un árbol", "aleja la cámara") sin tocar el editor, útil en sesiones de dirección creativa con clientes no técnicos.
- Automatización de variantes de escena para pruebas: al ser un modelo de 21 MB con inferencia local, se pueden generar cientos de variaciones de una misma escena (colores, clima, hora del día) para testear pipelines de render o comparar configuraciones de iluminación.
- Despliegue en herramientas creativas de escritorio: el tamaño reducido permite empaquetar el modelo dentro de un plugin o aplicación local sin depender de APIs externas ni de GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del autor declara una entrada para WVY-Blender-5m con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión original, dado un checkpoint de 21 MB y 5,25 millones de parámetros; el cuello de botella real es el intérprete y el motor de Blender, no el modelo.
- GPU recomendadas: cualquier GPU consumer moderna sirve; el modelo cabe holgadamente en una GTX 1650, RTX 3060 o superior. También es viable en CPU.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y previsiblemente en hardware integrado.
- Opciones de despliegue: la model card indica inferencia local con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La generación de la escena completa depende del tiempo de construcción procedural en Blender, no solo de la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WVY-Blender-5m | 5,25 M | DSL de escena para Blender | no disponible | no disponible | Hugging Face (pytorch) |
| Modelos text-to-3D generativos (p. ej. familias tipo Shap-E o Trellis) | Cientos de millones a miles de millones | Generación directa de mallas o representaciones 3D | no aplica | variable según modelo | Hugging Face / repos públicos |
| LLM generalistas pequeños (1-3 B) con tool calling hacia Blender | 1.000-3.000 M | Texto libre y llamadas a API | 4.000-32.000 tokens típicamente | variable | Amplia |

La comparación directa es difícil: WVY-Blender-5m no compite en generación visual ni en razonamiento general, sino en producir un DSL de escena editable con un modelo tres órdenes de magnitud menor. Frente a un LLM generalista que llame a la API de Blender, WVY ofrece determinismo de esquema y huella mínima, a costa de un vocabulario cerrado y sin capacidad de generar mallas nuevas. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Vocabulario cerrado: solo cubre 126 tipos de objeto, 29 acciones y 24 ajustes de escena; cualquier petición fuera de ese esquema no se puede representar.
- Sin generación de mallas arbitrarias: las geometrías son procedurales y estilizadas, no modelos 3D fotorrealistas ni assets personalizados.
- Sin entrada de imagen ni comandos numéricos de rotación en el esquema actual del checkpoint.
- Solo inglés: los prompts y el DSL están entrenados exclusivamente en inglés.
- Riesgo de alucinación a nivel de escena: el autor advierte que los ejemplos mostrados son selecciones y no garantizan que todos los detalles solicitados se reproduzcan siempre.
- Corpus sintético: buena parte de los datos fue generada localmente, con variaciones y erratas artificiales, lo que puede introducir sesgos de distribución respecto al lenguaje real de artistas.
- Licencia no declarada: no hay términos publicados, por lo que el uso comercial queda sin marco legal explícito y requiere contactar con el autor.
- Modelo muy reciente y con tracción mínima (0 descargas, 1 like en el momento de la consulta): sin validación independiente ni comunidad que reporte fallos.
- Dependencia del intérprete y del builder procedural: la calidad final de la escena no depende solo del modelo, sino del código de construcción incluido.
- Sin datos de benchmarks ni de contexto: no se puede evaluar su robustez frente a prompts largos o ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m
- Manifiesto de demostración con prompts y hash del checkpoint: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/blob/main/demo_manifest.json
- Vídeo de presentación: https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/wvy-showreel.mp4
- Demostración "robot en monopatín": https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/robot-skateboard.mp4
- Demostración "zorro saltando sobre un coche": https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/fox-snow.mp4
- Demostración "alien a caballo": https://huggingface.co/StarpowerTechnology/WVY-Blender-5m/resolve/main/media/alien-horse.mp4
