# textilelabs/Loom-Planck-600k

## Resumen

Loom Planck 600K es un modelo de lenguaje neuronal de escala extrema (586.176 parámetros) desarrollado por Textile Labs, entrenado desde cero con una arquitectura basada en el layout de Gemma-3. Forma parte de la "escalera Planck", una familia de tres modelos (300K, 600K y 1.2M parámetros) cuyo objetivo es explorar el límite inferior de tamaño en el que un modelo conversacional puede seguir comportándose de forma coherente dentro del ecosistema Loom. Se entrenó en 8 minutos sobre dos GPU T4 de Kaggle y se distribuye tanto en safetensors como en GGUF, lo que permite ejecutarlo en aplicaciones móviles como Ollama, PocketPal, LM Studio, Jan o llama.cpp.

El modelo está pensado como una pieza experimental y educativa más que como un asistente de producción: sabe identificarse, rechazar preguntas sobre hechos que no puede verificar, emitir llamadas a herramientas (calculadora, fecha, búsqueda) y mantener conversaciones muy breves. Su ventana de contexto es de 2.048 tokens y su vocabulario y capacidades están limitados al inglés.

Su relevancia actual reside en que demuestra hasta qué punto es posible reducir un transformer con formato Gemma-3 manteniendo un comportamiento conversacional reconocible, con un consumo de almacenamiento de 492 KB en cuantización Q4_K_M. Es un caso de estudio sobre eficiencia extrema, entrenamiento from-scratch con optimizador Muon y despliegue on-device, no un sustituto de modelos pequeños convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con layout Gemma-3 (gemma3_text), 14 capas × 64 dimensiones |
| Parametros totales | 586.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M (492 KB), Q8_0 (658 KB), f16 (1,2 MB) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue la disposición de un transformer decoder-only estilo Gemma-3 con 14 capas y una dimensión oculta de 64, lo que da lugar a los 586.176 parámetros totales. Se entrenó desde cero (from-scratch) sobre dos GPU T4 de Kaggle en aproximadamente 8 minutos, empleando el optimizador Muon, una elección poco habitual en modelos de gran escala pero coherente con el enfoque experimental del proyecto. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que los prompts de evaluación fueron eliminados del conjunto de entrenamiento (scrubbed).

El modelo incorpora un formato de prompt propio basado en etiquetas como `<tools:on>`/`<tools:off>`, `<user>`, `<|eot|>` y `<loom>`, que controla si el modelo puede emitir llamadas a herramientas. Esta es una innovación destacable a esta escala: un modelo de menos de un millón de parámetros con un protocolo explícito de activación de tool use y un comportamiento de rechazo entrenado. No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de texto conversacional breve: respuestas de una o dos frases cortas.
- Identificación de identidad: responde correctamente a preguntas sobre quién es.
- Rechazo de hechos no verificables: con herramientas desactivadas, declina responder a preguntas sobre hechos que no puede comprobar (20/20 en la batería estricta).
- Tool calling: emite llamadas a calculadora, fecha y búsqueda cuando se activa `<tools:on>`.
- Aritmética de fechas: resuelve correctamente 7 de cada 10 pruebas de cálculo con fechas.
- Etiquetado básico: clasificación de tema, idioma, sentimiento, toxicidad y enrutamiento (26/60).
- Lectura limitada de prosa real: detecta hechos plantados en resultados de búsqueda en el 7% de los casos.
- Multilingüe: no disponible; solo inglés.
- Modo thinking, visión y audio: no soportados.

## Casos de uso

- Demostración educativa de arquitecturas transformer: por su tamaño mínimo y su estructura Gemma-3 explícita, sirve para ilustrar cómo se comporta un decoder-only desde dentro, inspeccionando capas y pesos en un portátil.
- Pruebas de despliegue on-device: validar pipelines de GGUF en Ollama, PocketPal, LM Studio, Jan o llama.cpp con un artefacto de 492 KB antes de pasar a modelos mayores.
- Prototipado de protocolos de tool calling: su formato `<tools:on>`/`<tools:off>` permite experimentar con esquemas de activación de herramientas y parseo de llamadas en entornos controlados.
- Evaluación de comportamiento de rechazo: útil como caso base para estudiar cómo un modelo diminuto aprende a declinar preguntas sobre hechos no verificables, con una tasa medida de 20/20 en la batería estricta.
- Investigación sobre entrenamiento from-scratch: reproduce en minutos un ciclo completo de entrenamiento con Muon en hardware consumer (dos T4), útil para docencia y experimentación de hiperparámetros.
- Benchmarking de cuantización extrema: comparar f16, Q8_0 y Q4_K_M en un modelo donde la degradación por cuantización es medible con precisión (por ejemplo, la caída de 14/40 a 10/40 en llamadas a calculadora entre Q8_0 y Q4_K_M).
- Pruebas de integración en apps móviles: verificar latencia y consumo de memoria de un modelo de 492 KB embebido en una aplicación Android o iOS antes de escalar a modelos de 1-2M de parámetros.

## Benchmarks y rendimiento

Resultados medidos sobre 275 pruebas held-out, con prompts eliminados del entrenamiento. Q8_0 y Q4_K_M son los builds GGUF ejecutados en llama.cpp; algunas pruebas de lectura larga (pasajes de 1.500 tokens) no caben en la ventana de 2.048 tokens y cuentan como fallo en las columnas GGUF.

| Tarea | Loom Planck 600K (f16) | Q8_0 | Q4_K_M | Swift Mini 2 (2,0M) | Swift Micro 2 (1,17M) |
|---|---:|---:|---:|---:|---:|
| Rechaza un hecho desconocido con herramientas off (scorer estricto) | 20/20 | 20/20 | 20/20 | 13/20 | 18/20 |
| Llamada a calculadora correcta (operandos copiados, operador elegido) | 14/40 | 14/40 | 10/40 | 24/40 | 13/40 |
| Aritmética de fechas | 7/10 | 7/10 | 7/10 | 8/10 | 3/10 |
| Etiquetado (tema / idioma / sentimiento / tóxico / ruta) | 26/60 | 26/60 | 27/60 | 44/60 | 28/60 |
| Chat cotidiano | 9/15 | 9/15 | 9/15 | 11/15 | 11/15 |
| Lectura de un hecho plantado en un resultado de búsqueda | 4/60 | 4/60 | 4/60 | 7/60 | 4/60 |
| Ignora una instrucción oculta en un pasaje | 0/10 | 0/10 | 0/10 | 1/10 | 4/10 |
| Extracción tipada (nombre / fecha / importe / lugar) | 5/30 | 5/30 | 6/30 | 13/30 | 0/30 |
| Redacción, coincidencia exacta | 0/30 | 0/30 | 0/30 | 0/30 | 0/30 |
| Dice "(sure)" y acierta | 29% | 32% | 26% | 49% | 22% |

Batería de aceptación Loom (133 prompts, mismo script y ajustes que el resto de Looms, vía Ollama): **112/133 (Q8_0)** y **111/133 (Q4_K_M)**. Como referencia: Swift Mini 2 obtuvo 120, Swift Micro 2 110, y los Swift Mini y Micro originales 110.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 10 MB en cualquier cuantización; el peso en disco va de 492 KB (Q4_K_M) a 1,2 MB (f16).
- GPU recomendadas: cualquier GPU, incluida una T4, una RTX 4090 o incluso CPU; no requiere aceleración dedicada.
- Cabe en cualquier GPU consumer y en teléfonos móviles; el autor lo describe como "492 KB on a phone".
- Opciones de despliegue: Ollama, PocketPal, LM Studio, Jan, llama.cpp (GGUF), transformers (safetensors), text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Batería Loom /133 | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| Loom Planck 600K | 586.176 | 2.048 | 112 (Q8_0) | MIT | HuggingFace, GGUF |
| Loom Planck 300K | 310.000 (aprox.) | no disponible | 104 | MIT | HuggingFace |
| Loom Planck 1.2M | 1.190.000 (aprox.) | no disponible | 105 | MIT | HuggingFace |
| Loom Swift Mini 2 | 2.000.000 | no disponible | 120 | MIT | HuggingFace |
| Loom Swift Micro 2 | 1.170.000 | no disponible | 110 | MIT | HuggingFace |

## Limitaciones y advertencias

- Es mucho más limitado que un asistente convencional: respuestas de una o dos frases cortas y ocasionalmente derivan hacia frases incoherentes.
- La llamada a calculadora solo es correcta aproximadamente un tercio de las veces; conviene revisar la llamada antes de fiarse del resultado.
- La marca "(sure)" no es fiable: acertó entre el 19% y el 29% de las veces que la emitió.
- No puede redactar (0/30 en coincidencia exacta) ni extraer datos tipados de forma fiable (5/30).
- Resistencia muy baja a instrucciones ocultas en pasajes: 0/10, el peor resultado de la escalera.
- Lectura de prosa real muy limitada: 7% de acierto en hechos plantados.
- Ventana de contexto de 2.048 tokens, insuficiente para pasajes largos de 1.500 tokens junto con el prompt.
- Solo inglés; no soporta otros idiomas.
- Riesgo elevado de alucinación en cualquier tarea que exija precisión factual, numérica o de extracción.
- Licencia MIT: permite uso comercial sin restricciones, pero el autor advierte explícitamente de que no es un asistente fiable para producción.
- No confundir con Loom Planck Core, un programa no neuronal de 104 KB con nombre similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/textilelabs/Loom-Planck-600K
- Loom Planck 300K: https://huggingface.co/textilelabs/Loom-Planck-300K
- Loom Planck 1.2M: https://huggingface.co/textilelabs/Loom-Planck-1.2M
- Loom Planck Core (programa no neuronal): https://huggingface.co/textilelabs/Loom-Planck-Core
