# ukisai/Swift-1.5-Qwen3.8-27B-GGUF

## Resumen

Swift 1.5 Qwen3.8-27B es un derivado de razonamiento eficiente creado por UkisAI a partir de Qwen3.8-27B. El repositorio analizado contiene unicamente las cuantizaciones GGUF del modelo, generadas con llama.cpp, y esta pensado para ejecutarse con runtimes compatibles como `llama-server`. El objetivo declarado por el autor es reducir de forma agresiva el numero de tokens de "pensamiento" sin perder exactitud: segun la model card, emplea un 58,5 % menos de tokens de razonamiento que el modelo base y obtiene una puntuacion agregada un 0,35 % superior, lo que se traduce en una aceleracion de hasta 9,18x en varias tareas.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 B) y es la evolucion de Swift 1.0, del que se indica que acumula mas de 350.000 descargas. Frente a esa version, Swift 1.5 escala el post-entrenamiento (RL y OPD) con enfasis en tareas de horizonte largo, agenticas y de codigo, y declara mejoras en LiveCodeBench y Terminal Bench 2.1 respecto al modelo base.

Su relevancia practica esta en el coste de inferencia: en tareas de agente y generacion de codigo con cadenas de razonamiento largas, un modelo que piensa menos tokens por respuesta reduce latencia y factura de computo sin degradar la calidad medida. El repositorio es pequeno en traccion (68 descargas, 14 likes) y su licencia, `swift-open-license-1.0`, no es una licencia open source estandar, con un regimen de licencia empresarial mencionado explicitamente por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivado de Qwen3.8-27B; la model card no especifica el tipo de arquitectura) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF en varios niveles generados con llama.cpp; se menciona el uso de imatrix. Existe ademas un repositorio hermano con cuantizaciones GSQ-RCO. Niveles concretos: no disponibles |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en HuggingFace); incluye licencia empresarial |
| Formato de pesos | GGUF (llama.cpp) |
| Pipeline declarado | image-text-to-text |
| Modelo base | ukisai/Swift-1.5-Qwen3.8-27b (relacion: quantized) |
| Tamano del repositorio | 356,9 GB |
| Descargas / likes | 68 / 14 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de que deriva de Qwen3.8-27B, que se presenta como modelo fundacional, y de que la pipeline declarada es image-text-to-text. El autor tampoco especifica el numero de tokens de entrenamiento ni la composicion del dataset de pre-entrenamiento.

El trabajo diferencial esta en el post-entrenamiento. UkisAI describe un proceso en dos fases: primero identifica los tokens asociados a "sobrepensamiento patologico" y los penaliza sin atacar directamente la longitud del razonamiento, lo que produce un uso de tokens "comprimido"; despues recupera exactitud mediante RL y OPD (metodos de post-entrenamiento que el autor no desglosa con mas detalle). Swift 1.5 parte de Swift 1.0 y escala esos mismos metodos con foco en tareas de horizonte largo, agenticas y de codigo. Los datos de entrenamiento se publican parcialmente en el dataset `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, que segun el autor no se usa tal cual, sino re-muestreado y convertido en entornos de RL.

Como evidencia cualitativa, el autor compara ambos modelos con el mismo prompt de generacion de un juego 3D: Qwen3.8-27B tardo 104,6 minutos y Swift 1.5 11,39 minutos.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de pensamiento ("thinking") optimizado en numero de tokens.
- Razonamiento eficiente: reduccion declarada del 58,5 % en tokens de pensamiento respecto al modelo base.
- Codigo: mejoras declaradas en LiveCodeBench y en la generacion de proyectos completos (demo del juego 3D).
- Tareas agenticas y de horizonte largo: mejoras declaradas en Terminal Bench 2.1 y uso intensivo de entornos multi-turno en el post-entrenamiento.
- Uso en terminal / agentes de linea de comandos, segun los tags `terminal-bench` y `post-training`.
- Capacidad multimodal: la pipeline declarada es image-text-to-text, heredada del modelo base. No se especifica en la informacion disponible si las cuantizaciones GGUF incluyen el proyector multimodal necesario para inferencia de vision en llama.cpp.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque el entrenamiento agentico y multi-turno lo hace plausible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Agentes de codificacion en terminal: el modelo esta post-entrenado especificamente sobre entornos de terminal y tareas de horizonte largo, por lo que encaja en agentes que ejecutan comandos, leen errores y iteran sobre un repositorio dentro de un bucle de varios pasos.
- Generacion de aplicaciones completas a partir de un prompt: la demo del autor (un juego 3D explorable con distintos biomas) muestra el modelo produciendo un artefacto funcional en unos 11 minutos frente a los 104 minutos del base, lo que lo hace viable para prototipado rapido de proyectos pequenos.
- Asistentes de razonamiento con presupuesto de tokens ajustado: en despliegues donde el coste por token de salida es el factor dominante (por ejemplo, APIs de alto volumen), la reduccion del 58,5 % en tokens de pensamiento rebaja directamente el coste y la latencia.
- Pipelines de CI/CD con revision automatica: revision de diffs, generacion de tests y triaje de fallos, aprovechando el soporte de tool calling si se confirma en el runtime y el enfoque en tareas agenticas.
- Analisis de capturas o diagramas tecnicos: al declararse pipeline image-text-to-text, podria usarse para interpretar imagenes tecnicas, siempre que la cuantizacion GGUF incluya el componente multimodal.
- Automatizacion de tareas multi-turno en soporte tecnico: conversaciones largas con herramientas externas, donde el ahorro de tokens de razonamiento reduce la latencia percibida por turno.
- Evaluacion comparativa de eficiencia de razonamiento: util como referencia en investigacion sobre control de longitud de cadena de pensamiento y penalizacion de tokens patologicos.

## Benchmarks y rendimiento

No se han publicado resultados numericos de benchmarks en la informacion disponible. La model card referencia una tabla de evaluacion comparativa entre Qwen3.8-27B y Swift 1.5, pero su contenido no esta incluido en el material proporcionado (aparece truncado en el HTML de la model card). Los unicos datos verificables son las afirmaciones agregadas del autor:

| Metrica | Valor declarado por el autor | Nota |
|---|---|---|
| Tokens de pensamiento | 58,5 % menos que Qwen3.8-27B | Afirmacion agregada, sin desglose por tarea |
| Puntuacion agregada | +0,35 % frente a Qwen3.8-27B | Afirmacion agregada |
| Aceleracion | 9,18x en varias tareas | No se especifica que tareas |
| Demo de generacion de juego (mismo prompt) | 104,6 min (base) frente a 11,39 min (Swift 1.5) | Medida del autor en su propio entorno |
| LiveCodeBench | Mejora declarada frente al base y frente a Swift 1.0 | Sin cifras disponibles |
| Terminal Bench 2.1 | Mejora declarada frente al base y frente a Swift 1.0 | Sin cifras disponibles |

Cualquier comparacion numerica con otros modelos requeriria consultar la tabla completa de la model card original, no incluida aqui.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones a partir de los 27,3 B de parametros, no datos publicados por el autor:

- Cuantizacion de ~4 bits: aproximadamente 16-18 GB de VRAM o memoria unificada.
- Cuantizacion de ~5 bits: aproximadamente 19-21 GB.
- Cuantizacion de ~6 bits: aproximadamente 23-25 GB.
- Cuantizacion de ~8 bits: aproximadamente 29-31 GB.
- Pesos sin cuantizar (F16): aproximadamente 55 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB y L40S 48 GB pueden alojar cualquier nivel de cuantizacion, incluido F16 con paralelismo o en 80 GB.
- GPU de consumo: RTX 4090, RTX 3090 y RTX 5090. Las de 24 GB (4090, 3090) admiten comodamente cuantizaciones de 4 y 5 bits, y de forma ajustada las de 6 bits. La RTX 5090, con 32 GB, admite hasta 8 bits.
- Mac con memoria unificada: equipos con 32 GB o mas pueden ejecutar cuantizaciones de 4-5 bits; 64 GB permiten niveles superiores.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio, llama-cpp-python y bindings equivalentes. vLLM y TGI no son la via habitual para GGUF; para servirlos con esas herramientas habria que usar el modelo base en safetensors, no este repositorio.
- Latencia y throughput: no disponibles. El tamano del repositorio (356,9 GB) obliga a descargar selectivamente un unico fichero de cuantizacion, no el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (GGUF) | ~27,3 B | No disponible | 58,5 % menos tokens de pensamiento y +0,35 % agregado frente al base, segun el autor | swift-open-license-1.0 (con licencia empresarial) | GGUF en HuggingFace |
| Qwen3.8-27B (modelo fundacional) | No disponible en la informacion proporcionada | No disponible | Linea base de la comparativa del autor; 104,6 min en la demo de generacion de juego | No disponible | HuggingFace |
| Swift 1.0 Qwen3.8-27B | No disponible | No disponible | Segun el autor, Swift 1.5 lo supera en rendimiento global, especialmente en codigo y tareas agenticas, con menos tokens de pensamiento | No disponible | HuggingFace, 350k+ descargas declaradas |

No se dispone de datos de contexto, licencia ni benchmarks detallados de los modelos alternativos en la informacion proporcionada, ni de comparaciones con otros modelos de tamano similar de la familia Qwen.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado por el autor. La penalizacion de tokens de "sobrepensamiento" busca mantener la exactitud, pero conviene validar en el dominio propio antes de llevar el modelo a produccion.
- Idiomas soportados: no se declaran. Al derivar de Qwen3.8-27B, el soporte multilingue dependera del modelo fundacional, pero no hay confirmacion para este ajuste.
- Longitud de contexto: no declarada. Es un dato critico para planificar despliegues con contexto largo y no puede inferirse del repositorio GGUF.
- Capacidad multimodal incierta: la pipeline declarada es image-text-to-text, pero no se confirma que las cuantizaciones GGUF incluyan el proyector multimodal necesario para procesar imagenes en llama.cpp.
- Licencia: `swift-open-license-1.0` esta etiquetada como `other` en HuggingFace y no es una licencia open source reconocida. El autor menciona explicitamente un regimen de licencia empresarial, por lo que es obligatorio leer el texto completo antes de cualquier uso comercial.
- Traccion limitada: 68 descargas y 14 likes en el momento de la consulta, con una comunidad pequena. No hay garantia de mantenimiento a largo plazo ni de soporte.
- Benchmarks no verificables: los resultados de la tabla de evaluacion no estan disponibles en la informacion proporcionada, y las cifras de mejora son afirmaciones del propio autor sin replicacion independiente conocida.
- Coste de almacenamiento: el repositorio completo ocupa 356,9 GB, lo que exige descargar selectivamente el nivel de cuantizacion deseado.
- Uso en produccion: al no publicarse latencia, throughput ni consumo de memoria medidos, cualquier dimensionamiento debe hacerse con pruebas propias.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Modelo base (pesos completos): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Cuantizaciones GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-GSQ-RCO-GGUF
- Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Modelo fundacional Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento (SFT multi-turno agentico): https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Sitio web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo del juego generado: https://ukisai.com/swift-games/27b
- llama.cpp: https://github.com/ggml-org/llama.cpp

No se han encontrado otros enlaces relevantes (papers, blogs tecnicos o repositorios independientes) en la busqueda web realizada; los resultados obtenidos corresponden a sitios de streaming de peliculas sin relacion con el modelo.
