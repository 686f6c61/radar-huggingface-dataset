# ukisai/Swift-1.5-Qwen3.8-27B-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado de razonamiento eficiente del modelo Qwen3.8-27B, desarrollado por UkisAI. Su propuesta central es reducir drasticamente el numero de tokens de pensamiento necesarios para resolver una tarea sin perder precision: segun el autor, emplea un 58,5 % menos de tokens de razonamiento que el modelo base y obtiene una puntuacion un 0,35 % superior, lo que se traduce en una aceleracion de hasta 9,18 veces en determinadas tareas. El modelo se distribuye en formato GGUF, cuantizado con llama.cpp, y esta pensado para ejecutarse con runtimes compatibles como `llama-server`.

El modelo parte de Qwen3.8-27B y aplica una fase de post-entrenamiento basada en RL y OPD (on-policy distillation) orientada a tareas agénticas de largo horizonte y a generacion de codigo. Es la evolucion de Swift 1.0, que acumulo mas de 350.000 descargas, y amplia el post-entrenamiento previo con el objetivo de mejorar el rendimiento global manteniendo un uso de tokens mas contenido. Cuenta con 27.320.697.856 parametros y pipeline `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto.

La relevancia actual del modelo reside en el coste de inferencia: en tareas de razonamiento largo, el numero de tokens generados domina la latencia y el gasto computacional. Un modelo que conserva la precision del base reduciendo a la mitad los tokens de pensamiento resulta atractivo para despliegues en produccion con restricciones de latencia o presupuesto. La licencia es propietaria (`swift-open-license-1.0`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B), multimodal imagen-texto; detalles internos no disponibles |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (multiples niveles; el repo incluye variantes cuantizadas con imatrix); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (propietaria, `license: other`) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

Swift 1.5 se construye sobre Qwen3.8-27B y conserva su arquitectura transformer, con pipeline multimodal `image-text-to-text`. El autor no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni contexto maximo), por lo que estos datos no estan disponibles. La innovacion declarada no esta en la arquitectura sino en el post-entrenamiento: se identificaron los tokens asociados a "sobrepensamiento patologico" y se penalizaron sin atacar directamente la longitud del razonamiento, recuperando despues la precision mediante RL y OPD. El resultado es un uso de tokens "comprimido" con precision mantenida.

El entrenamiento de Swift 1.5 parte de Swift 1.0 y escala los metodos de post-entrenamiento que ya habian funcionado en esa version, esta vez con foco en tareas de largo horizonte, agenticas y de codigo. El autor publica el dataset de SFT multi-turno agéntico (`ukisai/Qwen3.8-27B-multi-turn-agent-sft`), aunque senala que no se usa tal cual, sino re-muestreado y convertido en entornos de RL. Las cuantizaciones GGUF se generan con llama.cpp e incluyen variantes con imatrix. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni los detalles de las fases de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente (menos tokens de razonamiento que el base).
- Generacion de codigo, con mejoras declaradas en LiveCodeBench y Terminal Bench 2.1 respecto al modelo base.
- Capacidades agénticas y de razonamiento multi-paso, orientadas a tareas de largo horizonte.
- Entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Uso en terminal y entornos de linea de comandos (tag `terminal-bench`).
- Conversacion multi-turno (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Generacion de codigo en produccion: el modelo puede integrarse en pipelines de CI/CD o asistentes de IDE; su reduccion de tokens de pensamiento disminuye la latencia por peticion frente al base, lo que abarata la generacion de parches y revisiones de codigo.
- Agentes autonomos de terminal: con soporte declarado para Terminal Bench 2.1, es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en tareas de administracion de sistemas o automatizacion de shell.
- Desarrollo de videojuegos y prototipos interactivos: el demo del autor muestra la generacion de un juego 3D funcional en 11,39 minutos frente a 104,6 minutos del base, lo que lo hace viable para prototipado rapido de mecanicas y escenas.
- Razonamiento sobre documentos e imagenes: al ser `image-text-to-text`, puede procesar capturas, diagramas o documentos escaneados junto con instrucciones de texto para extraccion de datos o respuesta a preguntas.
- Asistentes conversacionales multi-turno: el modelo mantiene contexto conversacional y su eficiencia en tokens reduce el coste por sesion en atencion al cliente o soporte tecnico automatizado.
- Tareas agénticas de largo horizonte: planificacion y ejecucion de flujos con multiples pasos (investigacion, automatizacion de procesos) donde el ahorro de tokens de pensamiento se acumula a lo largo de la cadena.
- Despliegue local con llama.cpp: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo o servidores modestos mediante `llama-server`, util para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluacion comparando Qwen3.8-27B y Swift 1.5, pero en la informacion proporcionada solo se recogen los titulares agregados: 58,5 % menos tokens de pensamiento, 0,35 % mas de puntuacion y hasta 9,18 veces de aceleracion en varias tareas. Los valores por benchmark (LiveCodeBench, Terminal Bench 2.1, etc.) no estan disponibles en el extracto recibido.

| Metrica | Qwen3.8-27B (base) | Swift 1.5 | Cambio |
|---|---|---|---|
| Tokens de pensamiento | Referencia | -58,5 % | Reduccion |
| Puntuacion agregada | Referencia | +0,35 % | Mejora |
| Aceleracion en tareas seleccionadas | 1x | hasta 9,18x | Mejora |
| Tiempo de generacion de demo (juego 3D) | 104,6 min | 11,39 min | Mejora |

No se han publicado en la informacion disponible los resultados desglosados por benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 27.320 millones de parametros, una cuantizacion Q4 ronda los 16-18 GB y una Q8 cerca de 29 GB; los calculos exactos dependen del nivel GGUF elegido.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) puede alojar cuantizaciones Q4/Q5; para Q8 o FP16 se requieren A100 (40/80 GB) o H100.
- Cabe en GPU de consumo: previsiblemente si, en cuantizaciones de 4-5 bits en GPUs de 24 GB; no confirmado oficialmente.
- Opciones de despliegue: llama.cpp (`llama-server`) es el runtime indicado; el tag `endpoints_compatible` sugiere compatibilidad con APIs de endpoints. Otros runtimes (vLLM, TGI, Ollama) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles de forma absoluta; el autor reporta hasta 9,18x de aceleracion relativa al base en ciertas tareas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B | 27,32 B | no disponible | Razonamiento eficiente en tokens, agéntico, codigo | swift-open-license-1.0 (propietaria) | GGUF en Hugging Face |
| Qwen3.8-27B (base) | 27 B (aprox.) | no disponible | Modelo generalista multimodal | no disponible en la informacion | Hugging Face |
| Swift 1.0 Qwen3.8-27B | 27 B (aprox.) | no disponible | Primera version eficiente en tokens | no disponible en la informacion | Hugging Face |

La comparativa con alternativas de otros fabricantes del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia propietaria (`swift-open-license-1.0`): es necesario revisar los terminos del archivo LICENSE del modelo base antes de cualquier uso comercial; el autor remite a una licencia empresarial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; la compresion de tokens de razonamiento podria reducir la profundidad de verificacion en tareas muy complejas, aunque el autor afirma mantener la precision.
- Idiomas soportados no documentados: no hay garantia de rendimiento fuera de los idiomas cubiertos por el modelo base.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas de contexto largo sin verificacion empirica.
- Los benchmarks publicados son agregados y provenientes del propio autor; no hay evaluacion independiente en la informacion disponible.
- El repo GGUF ocupa 358,8 GB, lo que implica descargar solo la variante de cuantizacion necesaria.
- Compatibilidad de tool calling no confirmada explicitamente; conviene validarla antes de integrarla en agentes que dependan de function calling.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Modelo base Swift 1.5: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Variante GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Qwen3.8-27B (modelo fundacional): https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de SFT agéntico multi-turno: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo interactiva del juego: https://ukisai.com/swift-games/27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
