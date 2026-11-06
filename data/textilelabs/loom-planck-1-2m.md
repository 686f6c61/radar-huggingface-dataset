# textilelabs/Loom-Planck-1.2m

## Resumen

Loom Planck 1.2M es un modelo de lenguaje neuronal de escala extrema (1.186.912 parametros) desarrollado por Textile Labs, entrenado desde cero con una arquitectura basada en el layout de Gemma-3. Forma parte de la "escalera Planck", una familia de tres tamanos (300K, 600K y 1.2M) cuyo objetivo declarado es explorar el limite inferior de tamano en el que un modelo Loom sigue comportandose como tal. Se entrenó en dos GPU T4 de Kaggle en unos 10 minutos.

El modelo resuelve un nicho muy concreto: inferencia en dispositivo (on-device) dentro de aplicaciones moviles como Ollama, PocketPal, LM Studio, Jan o llama.cpp, con un fichero GGUF Q4_K_M de solo 940 KB. No pretende competir con asistentes convencionales; su valor esta en demostrar que un transformer real de 16 capas y 96 dimensiones puede ejecutarse en un telefono y mantener habilidades basicas de conversacion, rechazo de preguntas sin base y emision de llamadas a herramientas.

Es relevante ahora por su caracter experimental y por la transparencia de sus evaluaciones: el autor publica una bateria de 275 tests held-out con resultados desglosados por tarea, comparando directamente con modelos de la misma familia (Swift Mini 2, Swift Micro 2). Es un caso de estudio sobre los minimos viables de un LM mas que una herramienta de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, layout Gemma-3 (gemma3_text), 16 capas x 96 dimensiones |
| Parametros totales | 1.186.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Q4_K_M, Q8_0, f16 (pesos completos) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue el layout de Gemma-3 en su variante de texto (gemma3_text), con 16 capas y una dimension oculta de 96, lo que da lugar a 1.186.912 parametros. El autor indica el uso de Muon como optimizador (etiqueta `muon` en el repositorio), un detalle poco habitual en modelos de este tamano. El entrenamiento se realizo desde cero (from-scratch) en dos GPU T4 de Kaggle durante aproximadamente 10 minutos, lo que situa el presupuesto de computo en el orden de minutos-GPU, no de horas.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El formato conversacional emplea tokens especiales propios (`<tools:on>`/`<tools:off>`, `<user>`, `<|eot|>`, `<loom>`) y el modelo esta disenado para emitir llamadas a herramientas (calculadora, fecha, busqueda) como parte de su salida. El contexto maximo de 2.048 tokens condiciona las pruebas de lectura de pasajes largos, que en algunos casos no caben en la ventana.

## Capacidades

- Generacion de texto conversacional breve: respuestas de una o dos frases cortas.
- Identificacion de identidad: responde correctamente a "who are you" con su nombre.
- Rechazo de hechos desconocidos: con herramientas desactivadas, declina preguntas sobre informacion que no puede verificar (20/20 en la prueba estricta).
- Emision de llamadas a herramientas: genera llamadas de calculadora, fecha y busqueda en el formato esperado por el arnes de agente.
- Aritmetica de fechas: capacidad limitada pero medible (7/10 en held-out).
- Etiquetado basico: clasificacion de tema, idioma, sentimiento, toxicidad y ruta (37/60).
- Lectura de hechos plantados en resultados de busqueda: capacidad muy limitada (9/60).
- Chat cotidiano breve: conversacion de baja complejidad (9/15).
- Soporte de tool calling mediante marcadores de control en el prompt.
- Sin capacidades de vision, audio ni modo de razonamiento extendido.
- Multilingue: no, solo ingles.

## Casos de uso

- Demostracion educativa de un LM minimo en el aula: el modelo cabe en 940 KB y se carga en Ollama o llama.cpp, lo que permite mostrar el ciclo completo de inferencia de un transformer en un portatil o un telefono sin infraestructura.
- Prototipado de arneses de agente: sirve para validar el formato de tool calling (`<tools:on>`, llamadas de calculadora y fecha) en un pipeline antes de sustituir el modelo por uno mayor, gracias a su bajo coste de ejecucion.
- Pruebas de integracion en aplicaciones moviles: con PocketPal o LM Studio se puede verificar el empaquetado GGUF, la carga en memoria y la latencia en dispositivo real con un artefacto de menos de 1 MB.
- Evaluacion de estrategias de rechazo: su habilidad mas solida es declinar preguntas sin base (20/20), lo que lo hace util como caso de referencia para medir heuristicas de "no lo se" en modelos pequenos.
- Benchmarking de cuantizacion: al publicar resultados comparables en f16, Q8_0 y Q4_K_M, permite estudiar la degradacion por cuantizacion en un modelo de escala extrema con diferencias medibles entre builds.
- Juguete conversacional offline: chat de una o dos frases integrado en una app sin conexion, aceptando sus limitaciones y sin delegarle tareas de calculo o extraccion.
- Investigacion sobre escalado hacia abajo: la escalera Planck (300K, 600K, 1.2M) permite trazar curvas de capacidad frente a parametros con la misma bateria de tests.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 275 tests held-out (prompts eliminados del entrenamiento). Q8 y Q4 son builds GGUF ejecutados en llama.cpp; algunos pasajes de 1.500 tokens no caben en la ventana de 2.048 y cuentan como fallo en las columnas GGUF.

| Tarea | Planck 1.2M (f16) | Q8_0 | Q4_K_M | Swift Mini 2 (2.0M) | Swift Micro 2 (1.17M) |
|---|---:|---:|---:|---:|---:|
| Declina hecho desconocido, tools off (estricto) | 20/20 | 20/20 | 20/20 | 13/20 | 18/20 |
| Llamada a calculadora correcta | 13/40 | 13/40 | 13/40 | 24/40 | 13/40 |
| Aritmetica de fechas | 7/10 | 7/10 | 7/10 | 8/10 | 3/10 |
| Etiquetado (tema/idioma/sentimiento/toxico/ruta) | 37/60 | 37/60 | 37/60 | 44/60 | 28/60 |
| Chat cotidiano | 9/15 | 10/15 | 10/15 | 11/15 | 11/15 |
| Lectura de hecho plantado en resultado de busqueda | 9/60 | 8/60 | 8/60 | 7/60 | 4/60 |
| Ignorar instruccion oculta en un pasaje | 1/10 | 1/10 | 1/10 | 1/10 | 4/10 |
| Extraccion tipada (nombre/fecha/importe/lugar) | 2/30 | 2/30 | 1/30 | 13/30 | 0/30 |
| Redaccion, coincidencia exacta | 0/30 | 0/30 | 0/30 | 0/30 | 0/30 |
| Dice "(sure)" y acierta | 24% | 27% | 25% | 49% | 22% |

Bateria de aceptacion Loom (133 prompts, via Ollama): 105/133 en Q8_0 y 106/133 en Q4_K_M. Referencias de la familia: Swift Mini 2 120, Swift Micro 2 110, Swift Mini y Micro originales 110.

## Requisitos de hardware

- VRAM estimada: inferior a 5 MB en cualquier cuantizacion (940 KB en Q4_K_M, 1,3 MB en Q8_0, 2,4 MB en f16); el cuello de botella no es la memoria sino el soporte del runtime.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU consumer moderna (RTX 4090, RTX 3060, integradas) es sobredimensionada para este modelo.
- Cabe en GPU consumer y en movil: el autor indica ejecucion en aplicaciones de telefono (Ollama, PocketPal, LM Studio, Jan) directamente desde el GGUF.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, PocketPal, transformers (safetensors), text-generation-inference (etiqueta `text-generation-inference` en el repo).
- Latencia y throughput: no disponibles en la informacion proporcionada. El contexto de 2.048 tokens limita la longitud de las peticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Bateria Loom /133 | Licencia | Ejecutable en movil |
|---|---:|---:|---:|---|---|
| Loom Planck 1.2M | 1,19M | 2.048 | 105 (Q8_0) | MIT | si |
| Loom Planck 600K | 0,59M | no disponible | 112 | MIT | si |
| Loom Planck 300K | 0,31M | no disponible | 104 | MIT | si |
| Loom Swift Micro 2 | 1,17M | no disponible | 110 | MIT (familia Loom) | si |
| Loom Swift Mini 2 | 2,0M | no disponible | 120 | MIT (familia Loom) | si |

Dentro de la propia familia, Planck 1.2M no supera en bateria global a Planck 600K (105 frente a 112) ni a Swift Micro 2 (110), aunque destaca en rechazo estricto (20/20) y en lectura de hechos plantados (9/60). No se dispone de comparativas con modelos de otros desarrolladores en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de juguete experimental: las respuestas son de una o dos frases y pueden terminar en una frase corrupta; el autor advierte que puede dar el nombre correcto y despues desviarse.
- No es una calculadora fiable: la llamada a calculadora es correcta aproximadamente un tercio de las veces (13/40); hay que revisar la llamada antes de confiar en el resultado.
- La marca "(sure)" no es fiable: solo acierta entre el 19% y el 29% de las veces que la emite.
- Incapaz de extraer o redactar de forma fiable: extraccion tipada 2/30 y redaccion 0/30 en coincidencia exacta.
- Muy vulnerable a instrucciones ocultas en pasajes: 1/10 en la prueba de ignorar instrucciones inyectadas.
- Ventana de contexto de 2.048 tokens: los pasajes largos no caben y se cuentan como fallo.
- Solo ingles; no hay soporte multilingue.
- Riesgo de alucinacion y de deriva en respuestas largas; no apto para produccion en tareas de extraccion, calculo o redaccion.
- Licencia MIT: permite uso comercial, pero el propio autor desaconseja emplearlo como asistente general.
- No confundir con Loom Planck Core, un programa no neuronal de 104 KB con nombre similar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/textilelabs/Loom-Planck-1.2m
- Loom Planck 300K: https://huggingface.co/textilelabs/Loom-Planck-300K
- Loom Planck 600K: https://huggingface.co/textilelabs/Loom-Planck-600K
- Loom Planck Core (programa no neuronal, distinto modelo): https://huggingface.co/textilelabs/Loom-Planck-Core
