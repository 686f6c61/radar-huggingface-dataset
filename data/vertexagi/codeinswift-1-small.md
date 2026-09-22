# VertexAGI/codeinswift-1-small

## Resumen

CodeInSwift 1 Small es un modelo de generación de texto especializado en el lenguaje de programación Swift, publicado por VertexAGI dentro de su familia CodeIn (donde cada modelo se destila para un único lenguaje). Se construye mediante ajuste fino con LoRA sobre `mlx-community/Qwen3-8B-4bit`, es decir, sobre una versión ya cuantizada a 4 bits del Qwen3-8B, y se distribuye en formato MLX para Apple Silicon. El resultado es un asistente conversacional de dos turnos: recibe un enunciado de problema, explica su enfoque y entrega código Swift completo.

El objetivo declarado es corregir un comportamiento concreto del modelo base: Qwen3-8B, al ser un modelo de razonamiento, consume el presupuesto de generación dentro de un bloque `<think>` y no llega a emitir ningún bloque de código cuando se limita la salida a 512 tokens. La evaluación del autor, usando el compilador real `swiftc -typecheck` como oráculo, reporta que CodeInSwift 1 Small produce código que compila sin errores en 38 de 100 prompts retenidos, frente a 0 de 100 del modelo base.

El modelo tiene 8.190.735.360 parámetros, un repositorio de 4,6 GB, licencia Apache 2.0 y soporte únicamente de inglés. Es un lanzamiento reciente y con adopción nula en el momento de la consulta (0 descargas, 0 likes), por lo que debe tratarse como una propuesta experimental más que como una pieza consolidada de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptadores LoRA fusionados; inferencia en MLX cuantizado a 4 bits |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Longitud de contexto | No especificada en la model card; el entrenamiento utilizó longitud de secuencia de 3.072 tokens y la evaluación un presupuesto de 512 tokens de salida |
| Tipos de cuantizacion | 4 bits en formato MLX (heredada del base `mlx-community/Qwen3-8B-4bit`) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); no hay GGUF en esta versión |

## Arquitectura y entrenamiento

La base es Qwen3-8B en su variante cuantizada a 4 bits para MLX. Sobre ella se aplica un ajuste fino LoRA con rango 8, alpha (scale) 20 y 16 capas adaptadas, durante 9.600 iteraciones repartidas en 3 sesiones reanudadas, con tamaño de lote 1 y longitud de secuencia 3.072. El entrenamiento se plantea como modelo de chat real, con un prompt de sistema fijo y formato `messages`, no como autocompletado de prefijos de código. La pérdida de validación final reportada es de 0,652.

El corpus de entrenamiento es [`MnemicAI/Ling-Coder-SFT-English-Clean`](https://huggingface.co/datasets/MnemicAI/Ling-Coder-SFT-English-Clean), concretamente su partición de Swift: 68.301 filas de pares instrucción/respuesta de código, divididas 92/8 en 62.837 ejemplos de entrenamiento y 5.464 de validación. Al tratarse de datos SFT de dos turnos, el modelo aprende a razonar brevemente y a continuación emitir código formateado. La innovación destacable no es arquitectónica sino de comportamiento: el ajuste enseña al modelo a salir del bloque de razonamiento `<think>` y llegar al bloque de código dentro de un presupuesto práctico de 512 tokens. No se documentan fases de RLHF ni DPO.

## Capacidades

- Generación de código Swift completo a partir de una descripción de problema en lenguaje natural.
- Explicación previa del enfoque de resolución antes de escribir el código, en formato conversacional de dos turnos.
- Formateo consistente de la respuesta mediante bloques delimitados con ` ```swift `.
- Supresión práctica del razonamiento extendido: prioriza entregar una respuesta compilable dentro de un presupuesto acotado de tokens.
- Uso como modelo de chat con prompt de sistema personalizable, no como completado de prefijos de código.
- Funcionamiento local sobre Apple Silicon mediante `mlx-lm`, sin dependencia de API externa.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, multi-step reasoning orquestado ni uso de herramientas externas.
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidad multilingüe limitada: únicamente inglés declarado, tanto en instrucciones como en respuestas.

## Casos de uso

- Generación de funciones Swift en un editor o IDE: el modelo acepta un enunciado en lenguaje natural y devuelve una función completa y formateada, lo que permite integrarlo en extensiones de asistencia local sobre macOS sin enviar código a servidores externos.
- Migración de Objective-C a Swift: dado un fragmento o una descripción de la funcionalidad heredada, el modelo propone la implementación equivalente en Swift, útil como primer borrador que el desarrollador revisa y compila.
- Prototipado de interfaces con SwiftUI: para descripciones de pantallas o componentes, genera vistas y modificadores, acelerando la creación de maquetas funcionales en proyectos iOS y macOS.
- Docencia y aprendizaje de Swift: su formato de explicación más código encaja con materiales didácticos, ejercicios resueltos y ejemplos comentados para quien está aprendiendo el lenguaje.
- Generación de pruebas unitarias con XCTest: a partir de una función existente, el modelo puede redactar casos de prueba, tarea repetitiva que se beneficia de un modelo especializado y ejecutable en local.
- Scripting y backend en Swift: para proyectos con Vapor o SwiftNIO, puede producir manejadores de rutas, modelos y utilidades, siempre con revisión y compilación posterior.
- Refactorización asistida con requisitos de privacidad: al ejecutarse íntegramente en hardware Apple local, permite procesar código propietario sin salir de la máquina, un escenario habitual en entornos con políticas estrictas de confidencialidad.

## Benchmarks y rendimiento

El autor publica una única evaluación, en la que 100 prompts del split de validación (nunca usados en entrenamiento) se envían con el mismo prompt de sistema, decodificación greedy y un límite de 512 tokens de salida. La corrección se verifica extrayendo el bloque ` ```swift ` y ejecutando `swiftc -typecheck`, un oráculo real basado en el compilador.

| Modelo | Compila sin errores | Error de compilación | Sin bloque de código |
|---|---|---|---|
| Qwen3-8B (base) | 0 | 0 | 100 |
| CodeInSwift 1 Small | 38 | 19 | 43 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. La cifra de 0/100 del modelo base se explica, según el autor, porque el modelo consume los 512 tokens dentro del bloque de razonamiento; no implica incapacidad para escribir Swift con más presupuesto.

## Requisitos de hardware

- Pesos: 4,6 GB de repositorio, correspondientes a la cuantización de 4 bits, lo que se traduce en unos 5-6 GB de memoria unificada en uso real con caché de contexto.
- Hardware objetivo: Apple Silicon (series M1, M2, M3 y M4) mediante MLX. Cabe en equipos con 8 GB de memoria unificada de forma ajustada y con 16 GB de forma holgada; 32 GB o más permiten lotes y contextos mayores.
- No está pensado para GPU NVIDIA ni AMD con CUDA/ROCm: al distribuirse solo en formato MLX, no se carga en esos entornos sin una conversión previa a otro formato.
- Despliegue: `mlx-lm` (funciones `load` y `generate`, servidor `mlx_lm.server`), LM Studio con soporte MLX e integración en aplicaciones nativas mediante `mlx-swift`.
- Alternativas no disponibles de forma directa: no hay GGUF, por lo que `llama.cpp` y Ollama no pueden cargarlo tal cual; vLLM y TGI no soportan el formato MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato | Rendimiento (oraculo swiftc) |
|---|---|---|---|---|---|---|
| CodeInSwift 1 Small | 8,19 B | No disponible | Swift | Apache 2.0 | MLX 4 bits | 38/100 compilan |
| Qwen3-8B-4bit (base, `mlx-community`) | 8,19 B | No disponible | Generalista con razonamiento | Apache 2.0 | MLX 4 bits | 0/100 compilan; 100/100 sin bloque de código |
| CodeInLuau (modelo hermano de la familia CodeIn) | No disponible | No disponible | Luau, completado de código | No disponible | No disponible | No disponible |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas de código abierto de tamaño similar orientadas a otros lenguajes, como Qwen2.5-Coder o CodeLlama, por lo que se marcan como no disponibles en lugar de estimarlas.

## Limitaciones y advertencias

- Gaps de corrección reconocidos por el propio autor: un 19 % de las respuestas contienen errores de compilación y un 43 % no llega a emitir ningún bloque de código dentro del presupuesto de 512 tokens.
- El modelo se entrenó con LoRA sobre unos 63.000 ejemplos, por lo que su especialización es estrecha: es un ajuste ligero sobre una base generalista, no un modelo entrenado desde cero para Swift.
- Riesgo de alucinación de APIs: puede invocar símbolos, frameworks o firmas de Swift que no existen o han cambiado; el propio autor recomienda tratar la salida como punto de partida a revisar y compilar, nunca como código listo para producción sin supervisión.
- Idioma: solo inglés declarado. Las instrucciones en castellano u otros idiomas no están soportadas oficialmente y degradarán la calidad de la respuesta.
- Contexto: la model card no especifica la ventana de contexto efectiva y el entrenamiento se hizo con secuencias de 3.072 tokens; usos con entradas muy largas no están validados.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad o seguridad, algo relevante al provenir de un corpus SFT y de una base generalista.
- Licencia Apache 2.0, heredada de Qwen3, permite uso comercial, pero incluye las condiciones habituales de atribución y de ausencia de garantías; conviene revisar también los términos aplicables al modelo base y al dataset utilizado.
- Distribución limitada: solo existe versión MLX de 4 bits, sin GGUF ni pesos en precisión completa, lo que restringe su uso a hardware Apple.
- Adopción nula hasta la fecha de consulta (0 descargas, 0 likes) y ausencia de validación independiente de los resultados publicados.
- La fecha de creación registrada en HuggingFace es posterior a la fecha habitual de referencia del ecosistema (21 de septiembre de 2026), dato que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/codeinswift-1-small
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- Dataset de entrenamiento: https://huggingface.co/datasets/MnemicAI/Ling-Coder-SFT-English-Clean
- Librería de inferencia: https://github.com/ml-explore/mlx-lm
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos correspondían a páginas de ayuda de YouTube TV y foros no relacionados), por lo que no hay enlaces adicionales de papers, blogs o demos que citar.
