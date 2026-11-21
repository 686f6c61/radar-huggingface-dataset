# turintech/Kev-0.8B-Artemis-GGUF

## Resumen

Kev-0.8B-Artemis-GGUF es una version cuantizada en formato GGUF del modelo Kev-0.8B de Jared Palmer, publicada por TurinTech a traves de su pipeline Artemis. No es un modelo conversacional generico: es un modelo de decision disenado para responder preguntas tipadas (si/no, eleccion unica o puntuacion en una escala) devolviendo una probabilidad por cada respuesta en una sola pasada. Con 752.917.824 parametros totales y un repositorio de 0,6 GB, esta pensado para tareas de enrutamiento y triaje de bajo coste.

El modelo se sirve a traves del endpoint `/v1/systemone` de `llama-server` (llama.cpp), no mediante chat completions convencional. Requiere llama.cpp b11540 o superior. Su propuesta de valor es la eficiencia: un modelo por debajo de los 1.000 millones de parametros que ofrece respuestas estructuradas con distribucion de probabilidad, adecuado para clasificacion y enrutamiento en produccion donde un LLM grande resultaria sobredimensionado.

La licencia es Apache 2.0 y el modelo esta disponible tambien en Ollama y LM Studio. La relevancia actual radica en la tendencia hacia modelos pequenos y especializados para tareas de decision deterministas, donde la latencia y el coste importan mas que la generacion abierta de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de jaredpalmer/kev-0.8b); detalles internos no disponibles |
| Parametros totales | 752.917.824 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens (configuracion de servidor recomendada: `-c 16384`) |
| Tipos de cuantizacion | GGUF cuantizado; se menciona Q6_K y Q8_0 (ggml-org) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors como base del modelo original) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base `jaredpalmer/kev-0.8b` mas alla de que es un transformer de aproximadamente 753 millones de parametros. La version publicada por TurinTech es una compresion mediante su pipeline Artemis, que produce pesos en formato GGUF optimizados para llama.cpp. El modelo emplea tecnicas de cuantizacion con `imatrix` (matriz de importancias) para preservar la calidad de las decisiones tras la compresion.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion tecnica destacable es el modo de inferencia: en lugar de generar texto autoregresivamente, el modelo evalua un `state` (contexto) junto con preguntas tipadas (`choice`, `noul`, `score`) y devuelve probabilidades calibradas para cada opcion en una sola pasada. Este diseno elimina la variabilidad de la generacion libre y produce salidas deterministas y estructuradas.

## Capacidades

- Decision tipada: responde preguntas de tipo `choice` (elegir una opcion entre varias), `noul` (si/no con probabilidad) y `score` (nivel esperado en una escala).
- Clasificacion con probabilidades: devuelve una distribucion de probabilidad sobre las opciones, no solo la etiqueta ganadora.
- Enrutamiento y triaje: disenado especificamente para asignar casos a equipos o categorias.
- Evaluacion de urgencia y prioridad mediante preguntas de tipo `score`.
- Inferencia en una sola pasada: no requiere decodificacion autoregresiva multi-turno.
- No soporta conversacion abierta ni generacion de texto libre.
- No se documenta soporte de tool calling, agentes multi-paso ni capacidades multimodales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de una incidencia como `state` y responde preguntas de tipo `choice` para asignar el equipo (facturacion, tecnico, ventas) y de tipo `score` para la urgencia, tal como muestra el ejemplo de la model card.
- Enrutamiento de correos entrantes: clasificar mensajes en departamentos con una distribucion de probabilidad que permite umbrales de confianza y derivacion a revision humana cuando la confianza es baja.
- Moderacion binaria de contenido: usar preguntas `noul` para decidir si un texto cumple o no una politica concreta, aprovechando la probabilidad devuelta como medida de riesgo.
- Priorizacion en colas de atencion: preguntas de tipo `score` para estimar el nivel de urgencia de cada solicitud y ordenar la cola de trabajo.
- Validacion de formularios y datos: decidir si un campo cumple criterios definidos mediante preguntas si/no con probabilidad asociada.
- Clasificacion de intenciones en asistentes: determinar la intencion del usuario entre un conjunto cerrado de opciones antes de derivar a un LLM mayor, reduciendo coste y latencia.
- Filtrado previo en pipelines RAG: decidir si un documento es relevante para una consulta antes de invocar un modelo generativo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el dataset `LocalLLaMA/typed-decisions`, conjunto final:

| Tarea | Metrica | Valor |
|---|---|---|
| Concordancia con el original | Misma respuesta (%) | 95,1 |
| Concordancia con el original | Cambios en respuestas confiadas | 0 |
| Decisiones tipadas | Precision (%) | 46,8 |

Ademas, la model card indica que la cuantizacion Q8_0 de ggml-org alcanza un 98,20 % de concordancia con el modelo original, frente al 95,10 % de la version publicada.

## Requisitos de hardware

- VRAM estimada: 5,2 GiB segun la model card (para la configuracion de referencia).
- Tamano de descarga: 0,620 GB.
- GPU recomendadas: el ejemplo de la model card se ejecuto en una NVIDIA A100 con llama.cpp compilado para CUDA; por su tamano cabe en cualquier GPU consumer moderna.
- Cabe en GPU consumer: si, con holgura (menos de 6 GiB de VRAM), incluidas RTX 3060, RTX 4060, RTX 4090 y similares.
- Opciones de despliegue: `llama-server` de llama.cpp (b11540 o superior), Ollama (`turintech/kev-0.8b-artemis`), LM Studio (`turintech/kev-0.8b-artemis`).
- Configuracion recomendada: `-c 16384 -ub 4096 -b 4096 -np 1` (un solo slot de peticion; otros valores de `-np` no fueron probados).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de clasificacion o decision en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kev-0.8B-Artemis-GGUF | 752,9 M | 16.384 | GGUF | Apache 2.0 | Decision tipada |
| jaredpalmer/kev-0.8b (base) | ~0,8 B | no disponible | safetensors | no disponible | Modelo original |
| LLMs genericos pequenos (p. ej. familia 0,5-1 B) | 0,5-1 B | variable | GGUF/safetensors | variable | Generacion de texto |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre ni mantiene dialogos multi-turno; solo responde preguntas tipadas.
- La precision en decisiones tipadas reportada es del 46,8 %, lo que limita su uso en escenarios donde se requiera alta exactitud sin supervision humana.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- No hay informacion sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez.
- Idiomas soportados no documentados; no se puede asumir buen rendimiento fuera del idioma o idiomas de entrenamiento.
- Requiere una version especifica de llama.cpp (b11540 o superior) y el endpoint `/v1/systemone`, lo que limita la compatibilidad con stacks de inferencia estandar.
- Los numeros de rendimiento se midieron con un unico slot (`-np 1`); el comportamiento con concurrencia no esta caracterizado.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de `jaredpalmer/kev-0.8b` conviene verificar las condiciones del modelo base.
- Riesgo de alucinacion en el sentido de calibracion: las probabilidades devueltas deben validarse en el dominio de despliegue antes de confiar en umbrales automaticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turintech/Kev-0.8B-Artemis-GGUF
- Modelo base: https://huggingface.co/jaredpalmer/kev-0.8b
- TurinTech: https://www.turintech.ai
- Otros modelos de TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/kev-0.8b-artemis
- LM Studio: https://lmstudio.ai/turintech/kev-0.8b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
- Resultados declarados: https://huggingface.co/turintech/Kev-0.8B-Artemis-GGUF#results
