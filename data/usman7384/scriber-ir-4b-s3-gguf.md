# usman7384/scriber-ir-4b-s3-GGUF

## Resumen

scriber-ir-4b-s3 es un modelo de lenguaje especializado en la generación de diseños paramétricos de CAD mecánico, desarrollado por usman7384 como modelo por defecto de Scriber, un agente de diseño open source que funciona de forma offline. El modelo parte de Qwen/Qwen3.5-4B y se ha afinado mediante QLoRA para emitir una representación intermedia (IR) tipada en JSON —parámetros con unidades y cotas, bocetos, features y uniones— que un compilador determinista traduce a un script de build123d y OpenCASCADE convierte en geometría B-rep editable.

La relevancia del modelo radica en su enfoque: no escribe geometría directamente, sino que produce una IR validable, verificable y reparable. El modelo está entrenado para ese bucle de generación y reparación, emitiendo diseños y corrigiéndolos a partir de los hallazgos del checker (validación dimensional, reglas de proyecto y fabricabilidad). Fuera de ese ecosistema —sin el compilador y las comprobaciones— su utilidad es limitada, tal y como advierte el propio autor.

Con 4.326.350.848 parámetros (aproximadamente 4,3 mil millones), licencia Apache-2.0 y distribución en formato GGUF cuantizado Q4_K_M, el modelo está pensado para ejecutarse en hardware de consumo. El repositorio ocupa 2,8 GB e incluye un Modelfile para importación directa en Ollama con los mismos parámetros de muestreo que qwen3.5:4b.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B), afinada con QLoRA |
| Parámetros totales | 4.326.350.848 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 4.096 tokens durante el entrenamiento; contexto nativo del base no disponible |
| Tipos de cuantización | Q4_K_M (único publicado) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q4_K_M) y Modelfile para Ollama |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only derivado de Qwen3.5-4B, con un adaptador LoRA de rango 16 y alpha 16 fusionado sobre la base cuantizada en 4 bits. El entrenamiento empleó QLoRA con learning rate 2e-4, schedule coseno, una época, secuencias de hasta 4.096 tokens y batch efectivo de 8, completando 623 pasos en 8,6 horas sobre una única RTX 3060 Laptop con 6 GB de VRAM. Tras la fusión, los pesos se convirtieron a bf16 con llama.cpp y se cuantizaron a Q4_K_M.

Los datos de entrenamiento son íntegramente generados en el repositorio, sin datos de terceros. Generadores procedurales para 15 familias de piezas (placas, bloques, piezas torneadas, soportes, cajas, perfiles, piezas estándar, engranajes y pares de engranajes, poleas, ejes, carcasas, envolventes con tapa, pequeños ensamblajes, soportes con cartelas y tablas de taladros) producen una petición y su IR objetivo; cada objetivo se construye con el kernel y se valida antes de conservarse. Las peticiones se renderizan en cuatro estilos y se parafrasean con un modelo local; el 30 % nombra los parámetros que desea exponer, y las peticiones de tablas de taladros llegan en markdown, CSV o hechos subidos. Las muestras de reparación emparejan un diseño mutado con los hallazgos del checker y la corrección: 13 tipos de mutación más 255 reparaciones on-policy recogidas del checkpoint anterior y del modelo base ejecutando el bucle real. En total, 2.900 especificaciones y unas 5.000 muestras, con un filtro de 8-gramas que evita filtrar prompts de evaluación al texto de entrenamiento.

## Capacidades

- Generación de IR de diseño CAD en JSON tipado: parámetros con nombre, unidades y cotas, bocetos, features y uniones.
- Reparación de diseños a partir de los hallazgos del checker (validación dimensional, reglas de proyecto y fabricabilidad).
- Generación de piezas paramétricas editables a través del compilador determinista a build123d/OpenCASCADE.
- Interpretación de peticiones en lenguaje natural en cuatro estilos de renderizado, incluyendo peticiones con parámetros explícitos.
- Procesamiento de tablas de taladros en markdown, CSV o hechos subidos.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidad de visión: no incluida en el GGUF; el sistema redirige las peticiones con imágenes al modelo base qwen3.5:4b.
- No dispone de tool calling ni function calling documentado de forma explícita; su interacción con herramientas es a través del bucle de compilación y validación de Scriber.

## Casos de uso

- Diseño de engranajes y pares de engranajes: el modelo genera la IR de un par de engranajes con módulo, número de dientes, ancho y taladros especificados, como en el ejemplo del autor ("spur gear pair, module 2, 20 and 40 teeth, 12 mm wide, 8 mm bores"). Es adecuado porque los engranajes son una de las familias con mejor rendimiento declarado.
- Generación de placas y soportes con cartelas: a partir de una descripción textual o un fichero de especificación, el modelo emite la IR de placas, bloques y soportes, que el compilador convierte en geometría B-rep editable. Encaja en flujos de diseño preliminar donde se necesita una pieza parametrizable rápidamente.
- Piezas torneadas y ejes: el modelo produce IR para piezas de revolución y ejes con parámetros acotados, útil en entornos de mecanizado que requieren modelos editables para CAM.
- Tablas de taladros desde CSV o markdown: el modelo interpreta tablas de taladros en distintos formatos y genera la IR correspondiente, lo que permite automatizar la creación de patrones de agujeros a partir de datos de ingeniería existentes.
- Reparación automática de diseños en un bucle de agente: integrado en Scriber, el modelo recibe los hallazgos del checker (dimensiones fuera de cota, violaciones de reglas de proyecto, problemas de fabricabilidad) y emite una IR corregida. Es adecuado porque el entrenamiento incluye reparaciones on-policy del bucle real.
- Diseño offline en hardware de consumo: al ejecutarse con Ollama sobre una RTX 3060 Laptop de 6 GB, el modelo permite flujos de diseño CAD asistido sin conexión ni dependencia de servicios en la nube, relevante en entornos con requisitos de confidencialidad.
- Prototipado de envolventes y carcasas con tapa: el modelo cubre la familia de envolventes con tapa, adecuada para generar carcasas paramétricas de electrónica o equipos.

## Benchmarks y rendimiento

Los resultados publicados por el autor comparan el checkpoint S3 con el anterior S2 en el mismo día y máquina, sobre conjuntos internos del repositorio:

| Puerta de evaluación | S2 | S3 |
|---|---|---|
| Conjunto de desarrollo, diseños totalmente correctos | 13/20 | 15/20 |
| Conjunto M1, totalmente correctos | 6/10 | 7/10 |
| Peticiones fundamentadas en documento, totalmente superadas | 5/10 (3 errores de regla) | 7/10 (0 errores de regla) |
| Mismas peticiones, solo prompt | 6/10 | 5/10 |
| Showcase (20 piezas y ensamblajes reconocibles) | 1/20 | 2/20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos anteriores son métricas internas de la tarea específica de generación de IR de CAD.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2,78 GB; con overhead de contexto y runtime, se estima un uso de VRAM en torno a 3-4 GB para secuencias moderadas.
- GPU recomendadas: el autor entrenó en una RTX 3060 Laptop de 6 GB, lo que indica que la inferencia cabe holgadamente en GPUs de consumo con 6 GB o más (RTX 3060, RTX 4060, RTX 4070, etc.). Para mayor throughput, A100 o H100 no son necesarias pero acelerarían el proceso.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 6 GB de VRAM; también es viable en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: Ollama (vía Modelfile incluido), llama.cpp (formato GGUF nativo), y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| scriber-ir-4b-s3 | 4,3 B | 4.096 (entrenamiento) | IR de CAD mecánico (Scriber) | Apache-2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible | Propósito general, multimodal | Apache-2.0 (según base) | safetensors, GGUF |
| Modelos de propósito general de ~4 B (p. ej. variantes de la familia Qwen) | ~4 B | variable | Texto general, código, razonamiento | variable | safetensors, GGUF |

La comparación directa con alternativas especializadas en text-to-CAD no está disponible en la información proporcionada. Frente a su modelo base, scriber-ir-4b-s3 sacrifica capacidades generales y de visión para especializarse en la emisión de IR de Scriber; el autor indica que, sin el compilador y las comprobaciones, el modelo "es de poca utilidad". En el conjunto showcase, ambos checkpoints construyen menos de la mitad de las piezas, lo que sitúa al modelo por debajo de un ingeniero humano en esa tarea.

## Limitaciones y advertencias

- Dependencia del ecosistema Scriber: el modelo emite IR JSON, no ficheros CAD; sin el compilador determinista y el checker, su salida no es directamente utilizable.
- Esquema de IR congelado: entrenado sobre el esquema de Scriber en el momento del entrenamiento; un esquema posterior requiere un checkpoint posterior.
- Rendimiento débil en ensamblajes de múltiples piezas a partir de un prompt desnudo, soportes angulados y piezas que requieren planificación previa a la geometría.
- Showcase limitado: solo 2 de 20 piezas y ensamblajes reconocibles se construyen correctamente en el checkpoint S3.
- Idioma: solo inglés; no se documenta soporte multilingüe.
- Sin visión en el GGUF: las peticiones con imágenes deben redirigirse al modelo base qwen3.5:4b.
- Riesgo de alucinación: al ser un modelo de lenguaje, puede generar IR con parámetros inconsistentes o violaciones de reglas; el bucle de validación y reparación mitiga pero no elimina este riesgo.
- Sesgos: no documentados por el autor; al entrenarse con datos generados proceduralmente, los sesgos provendrían principalmente del modelo base.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece garantías sobre la idoneidad de los diseños generados para fabricación real; la validación de fabricabilidad la realiza el checker de Scriber, no el modelo.
- Contexto de entrenamiento limitado a 4.096 tokens, lo que restringe la complejidad de las especificaciones y tablas que puede procesar en una sola pasada.

## Enlaces

- HuggingFace: https://huggingface.co/usman7384/scriber-ir-4b-s3-GGUF
- Repositorio Scriber: https://github.com/usman7384/scriber
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documento de puertas de evaluación S3 (referenciado en la model card): `docs/agents/s3-gates-2026-10-30.md` en el repositorio de Scriber
