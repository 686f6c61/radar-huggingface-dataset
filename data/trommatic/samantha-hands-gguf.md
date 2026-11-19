# trommatic/samantha-hands-gguf

## Resumen
Samantha hands (GGUF) es una adaptación especializada del modelo Qwen2.5-0.5B-Instruct, desarrollada por el autor independiente trommatic (nulljosh) como componente del proyecto Turing. No se trata de un modelo conversacional generalista, sino de un selector de herramientas (tool picker): recibe una petición en lenguaje natural y decide qué herramienta invocar y con qué argumentos, dentro de un conjunto de 169 herramientas locales definidas por el sistema. Se distribuye cuantizado en Q8_0 GGUF para su uso con llama.cpp en Windows y Linux.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct (494 millones de parámetros) y se ha afinado mediante LoRA, fusionado posteriormente y convertido a GGUF. Su relevancia radica en el despliegue on-device: ocupa aproximadamente 0,5 GB en disco, funciona en hardware modesto (entrenado en un Mac Mini) y está pensado para integrarse en un asistente local con control del escritorio, archivos, calendario y correo.

La propuesta es deliberadamente limitada: el autor indica explícitamente que el modelo selecciona herramientas pero no razona, no resuelve matemáticas complejas ni escribe código como un modelo grande. Su valor está en la precisión de selección sobre frases reales y en el mecanismo de confirmación previa para acciones que escriben, envían o hacen clic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) con LoRA fusionado |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 GGUF (conversión previa a f16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q8_0) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct. Sobre esa base se aplicó un ajuste fino mediante LoRA para la tarea concreta de selección de herramientas, tras lo cual los pesos se fusionaron y se convirtieron a GGUF. El autor documenta una particularidad del proceso de cuantización: una conversión directa a Q8 producía resultados incoherentes, por lo que el pipeline pasa primero por f16 y después cuantiza a Q8_0.

El entrenamiento se realizó sobre plantillas de frases y comandos redactados por un profesor (teacher-written commands), no sobre valoraciones de usuarios reales. El autor menciona la ejecución número 20 del entrenamiento como la versión publicada (v8.0.0), frente a las ejecuciones 19 (v5.6) y 13 (v5.1) de iteraciones anteriores. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO.

## Capacidades
- Selección de herramientas (tool calling): dado un enunciado en lenguaje natural, elige cuál de las 169 herramientas disponibles ejecutar y con qué argumentos.
- Integración con llama.cpp y llama-cpp-python, con instaladores de una línea para Linux y Windows.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Gestión de acciones locales: archivos, aplicaciones, calendario, recordatorios, correo, música, control de pantalla, explicación de bases de código y enseñanza de temas.
- Confirmación previa obligatoria para cualquier acción que escriba, envíe o haga clic.
- Memoria de preferencias del usuario, con opción de almacenamiento en iCloud Drive.
- Generación de atajos (Shortcuts) que el usuario añade manualmente.
- Ejecución en Raspberry Pi (familia Joshua Tree) y capacidad de escribir código a la tarjeta.
- Reconocimiento de la familia Joshua Tree por formulación: 86 de 93 frases de prueba.

## Casos de uso
- Asistente de escritorio local: el modelo actúa como capa de enrutamiento entre la voz o el texto del usuario y las 169 herramientas del sistema, decidiendo qué aplicación abrir, qué archivo mover o qué recordatorio crear sin necesidad de conexión a la nube.
- Automatización de correo con confirmación: ante una petición como "envía un correo a Juan", el modelo identifica el contacto por nombre y prepara la acción, pero el sistema exige confirmación antes de enviar, lo que encaja en flujos donde la trazabilidad es crítica.
- Gestión de calendario y recordatorios: interpreta frases coloquiales y las traduce en llamadas a herramientas con argumentos estructurados (fecha, título, destinatario), adecuado para asistentes personales en dispositivos de bajos recursos.
- Control de pantalla y aplicaciones en macOS: las herramientas que manejan la pantalla y las apps permanecen en el Mac, de modo que el modelo puede orquestar acciones de interfaz sin salir del equipo.
- Despliegue en Raspberry Pi y dispositivos embebidos: con 0,5 GB de pesos en Q8_0 y 494 millones de parámetros, es viable en hardware con recursos limitados donde un modelo mayor no cabría.
- Explicación de bases de código y enseñanza de temas: el selector puede enrutar la petición a herramientas especializadas que analizan un repositorio o generan material didáctico, manteniendo el modelo pequeño como capa de decisión.
- Integración en pipelines de agentes con llama.cpp: al ser compatible con endpoints, puede insertarse como router de herramientas en arquitecturas multi-paso donde un modelo mayor se encarga del razonamiento y este de la selección.

## Benchmarks y rendimiento
Los datos publicados por el autor son métricas de selección de herramientas, no benchmarks estándar de conocimiento o código.

| Metrica | Resultado |
|---|---|
| Frases de prueba no vistas (484) | 395 selecciones correctas |
| Frases selladas (869) | 802 herramienta correcta, 45 incorrecta, 20 incorrectas superan el guard, 39 correctas rechazadas |
| Frases desordenadas nuevas (360) | 325 correctas |
| Familia Joshua Tree por formulación (93) | 86 correctas |
| Comandos correctos no ejecutados | ~5 % (objetivo < 2 %) |
| Frases con erratas o dictado por voz | ~8 % no ejecutados |
| Concordancia con el selector MLX original (20 fixtures) | 16 de 20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en Q8_0 (pesos de ~0,5 GB más overhead de contexto y runtime).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) con holgura.
- Cabe en GPU consumer: sí, en todas las gamas actuales, e incluso en iGPU y en Raspberry Pi.
- Opciones de despliegue: llama.cpp y llama-cpp-python (soportados oficialmente por los instaladores del proyecto); compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.
- Hardware de referencia del autor: entrenado en un Mac Mini; existe una variante MLX de 1,5B para macOS.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Samantha hands (GGUF) | 494 M | no disponible | Tool picking especializado | Apache 2.0 | GGUF en HF |
| Qwen2.5-0.5B-Instruct | 494 M | no disponible | Instrucción general | Apache 2.0 | Safetensors, GGUF |
| Samantha hands 1.5B (MLX) | ~1,5 B | no disponible | Tool picking, mayor precisión | no disponible | MLX en HF |
| Modelos mayores de tool calling | varios B | variable | Tool calling general | variable | variable |

La comparación directa con modelos generalistas no es equitativa: Samantha hands está optimizada para una tarea estrecha y un conjunto fijo de herramientas, mientras que Qwen2.5-0.5B-Instruct conserva capacidades generales pero no está especializado en selección de herramientas. El propio autor señala que la variante de 1,5B obtiene mayor precisión pero es menos segura con frases desordenadas, motivo por el que no es la opción por defecto.

## Limitaciones y advertencias
- El autor declara explícitamente que el modelo no razona, no resuelve matemáticas complejas ni escribe código como un modelo grande; es un selector, no un asistente general.
- Aproximadamente el 5 % de los comandos correctos quedan sin ejecutar, y cerca del 8 % en frases con erratas o dictado por voz; el objetivo declarado es bajar del 2 %.
- El entrenamiento se basó en plantillas y comandos redactados por un profesor, no en valoraciones de usuarios reales, lo que puede limitar la generalización a formulaciones espontáneas.
- Riesgo de selección errónea de herramienta: en el conjunto sellado, 45 selecciones fueron incorrectas y 20 superaron el mecanismo de guarda.
- Las herramientas que controlan la pantalla y las aplicaciones permanecen en el Mac, lo que restringe el despliegue multiplataforma de esas funciones.
- No se documentan sesgos conocidos, idiomas soportados ni longitud de contexto, lo que dificulta evaluar su comportamiento fuera del inglés y de las plantillas de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen2.5-0.5B-Instruct conserva sus propios términos, que conviene revisar.
- En producción, la confirmación previa para acciones de escritura, envío o clic es un requisito de diseño, no una garantía del modelo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/trommatic/samantha-hands-gguf
- Variante 1.5B MLX: https://huggingface.co/trommatic/samantha-hands-1.5b-mlx
- Repositorio Turing: https://github.com/nulljosh/turing
- Demo en vivo: https://turing.heyitsmejosh.com
- Instalador Linux: https://raw.githubusercontent.com/nulljosh/turing/main/install/install.sh
- Instalador Windows: https://raw.githubusercontent.com/nulljosh/turing/main/install/install.ps1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
