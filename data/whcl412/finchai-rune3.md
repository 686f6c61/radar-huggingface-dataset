# whcl412/FinchAI-Rune3

## Resumen

FinchAI-Rune3 es un ajuste fino (fine-tune) por LoRA del modelo MiniCPM5-2B de OpenBMB, desarrollado por el usuario whcl412. Se trata de un modelo de generacion de texto de 2.516.756.480 parametros (2,52B) orientado a conversacion multi-turno, tool calling y function calling, con enfasis en el idioma chino y capacidad de mantener coherencia en conversaciones largas. Su proposito declarado es corregir tres problemas observados en su version anterior (Rune3-Preview, basada en Qwen3.5-2B): la repeticion de contenido tras varias rondas, la confusion de conceptos tecnicos y los errores factuales.

El modelo se distribuye en precision bfloat16 completa (sin cuantizar), con pesos en formato safetensors y compatibilidad con la libreria transformers (se recomienda version >= 5.20). El entrenamiento se realizo sobre 1163 muestras con LoRA de rango 8 y alpha 16, afectando a 12,56M de parametros entrenables (0,50% del total). La ventana de entrenamiento fue de solo 1024 tokens, aunque el modelo base soporta contextos mucho mayores.

Es relevante por su enfoque en dos casos concretos: mantener coherencia en dialogos tecnicos de hasta 8 rondas sin repetir informacion, y emitir llamadas a funciones con una sintaxis XML especifica (`<function name="..."><param name="...">`). Su licencia Apache 2.0 y su tamano reducido lo hacen desplegable en hardware de consumo, si bien su naturaleza de fine-tune experimental con solo 22 descargas implica un nivel de validacion comunitaria muy bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MiniCPM5-2B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (2,52B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | El modelo base soporta 128K tokens; la ventana de entrenamiento del fine-tune fue de 1024 tokens (hasta 1536 en entrenamiento) |
| Tipos de cuantizacion | Pesos publicados en bfloat16 sin cuantizar; no se documentan variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del MiniCPM5-2B de OpenBMB, un modelo de 2,52B parametros optimizado para chino y publicado en noviembre de 2026. La informacion disponible no detalla la arquitectura interna del base (tipo de atencion, capas, uso de componentes lineales), aunque la model card menciona dependencias de `causal_conv1d` y `flash-linear-attention`, lo que sugiere la presencia de componentes de convolucion causal y atencion lineal en el modelo base. El fine-tune se aplico mediante LoRA con rango 8 y alpha 16, con 12,56M de parametros entrenables (0,50% del total), en dos fases: 145 pasos con learning rate 5e-5 y 55 pasos de continuacion con learning rate 3e-5.

El dataset de entrenamiento consta de 1163 muestras, de las cuales 29 son fragmentos extraidos de 7 conversaciones ultra-largas. La composicion es: multiturn (257, 22,1%), code (200, 17,2%), notool (195, 16,8%), chat (195, 16,8%), call (103, 8,9%), ask (74, 6,4%), identity (73, 6,3%) y refuse (66, 5,7%). No se documenta el uso de RLHF ni DPO. El entrenamiento se realizo con una ventana de 1024 tokens por limitaciones de memoria (16 GB), truncando las muestras que la excedian. El modelo incorpora un modo de razonamiento (thinking) que debe activarse obligatoriamente mediante `enable_thinking=True` en la plantilla de chat; de lo contrario, el template cierra un bloque `` vacio y la generacion se desincroniza.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con soporte de dialogos multi-turno.
- Razonamiento con modo thinking explicito (bloque de pensamiento previo a la respuesta).
- Tool calling y function calling con sintaxis XML propia: `<function name="..."><param name="...">valor</param></function>`.
- Ejecucion de cadenas de agente: pensar, invocar herramienta, procesar el resultado, decidir y responder.
- Generacion de codigo (presente en el dataset de entrenamiento, aunque con limitaciones documentadas).
- Coherencia en conversaciones tecnicas de hasta 8 rondas sin repetir contenido (validado por el autor en un escenario de seguridad de servicios).
- Identidad definida: responde a preguntas sobre su nombre y generacion.
- Capacidad de rechazo (categoria "refuse" en el dataset).
- No se documentan capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Asistencia tecnica multi-turno en seguridad y operaciones: el modelo mantiene contexto en dialogos de 8 rondas sobre proteccion de servicios (limitacion de tasa, bloqueo de IP, criterios de falsos positivos, desbloqueo automatico y metricas de monitorizacion), aportando dimensiones distintas en cada ronda en lugar de repetir los mismos indicadores.
- Agente local de gestion de ficheros y logs: mediante tool calling puede invocar funciones como `list_files` sobre rutas del sistema, procesar el resultado y decidir el siguiente paso, adecuado para asistentes de administracion que corren en local.
- Chatbot de atencion al cliente en chino: su entrenamiento en multiturn (22,1% del dataset) y su tamano de 2,52B permiten desplegarlo en infraestructura modesta para conversaciones de soporte con contexto de varias rondas.
- Generacion de codigo en entornos con restricciones de recursos: al caber en GPUs de consumo, puede usarse como asistente de codigo local para tareas acotadas (funciones cortas, snippets), aunque con la advertencia de que puede truncar funciones completas.
- Prototipado de pipelines de agentes con function calling: la sintaxis XML explicita y el flujo pensar-invocar-responder lo hacen util para validar disenos de agentes antes de migrar a modelos mayores.
- Asistente de documentacion tecnica en chino: puede explicar conceptos de redes y seguridad (el autor valida la distincion entre avalancha y penetracion de cache, aunque con una confusion residual en la solucion).
- Filtrado y rechazo de peticiones inapropiadas: la categoria "refuse" del dataset le permite declinar solicitudes fuera de alcance en despliegues controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta una comparacion cualitativa con su version anterior:

| Metrica | Rune3-Preview (Qwen3.5-2B) | FinchAI-Rune3 (MiniCPM5-2B) |
|---|---|---|
| Repeticiones en 8 rondas consecutivas | 1 | 0 |
| Distincion avalancha/penetracion de cache | Correcta en todo | Definiciones correctas, solucion con 1 mezcla |
| Memoria en lectura de fichero linea a linea | Incorrecta | Correcta |
| Parametros del modelo base | 1,88B | 2,52B |
| Muestras de entrenamiento | 1134 | 1163 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 5 GB para los pesos (el repositorio ocupa 5,0 GB), mas overhead de activaciones y cache KV; en la practica, entre 6 y 8 GB para contextos moderados.
- En cuantizacion de 8 bits cabria en torno a 3 GB; en 4 bits, alrededor de 1,5-2 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante). Para mayor throughput, A100 o H100, si bien el modelo es demasiado pequeno para aprovecharlas plenamente.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16; en 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (recomendado >= 5.20), text-generation-inference (el modelo incluye el tag `text-generation-inference` y `endpoints_compatible`). No se documenta soporte de llama.cpp, Ollama ni vLLM.
- Nota de compatibilidad: en Apple Silicon (MPS) no existen implementaciones de `causal_conv1d` ni `flash-linear-attention`, por lo que la inferencia recurre a la implementacion de referencia, con menor rendimiento.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| FinchAI-Rune3 | 2,52B | 128K en base (entrenado a 1024) | zh, en | Apache 2.0 | Chat multi-turno + tool calling |
| MiniCPM5-2B (base) | 2,52B | 128K | zh, en | Apache 2.0 | Modelo generalista chino |
| Qwen3.5-2B (usado en Rune3-Preview) | 1,88B | no disponible | zh, en | no disponible | Modelo generalista |
| FinchAI-Rune3-Preview | 1,88B | no disponible | zh, en | Apache 2.0 | Version anterior del mismo fine-tune |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Confusion conceptual residual: en la explicacion de soluciones a problemas de avalancha de cache sigue mezclando el filtro de Bloom, que corresponde a la proteccion contra penetracion de cache.
- Generacion de codigo truncada: al pedirle funciones completas tiende a detenerse a mitad, especialmente cuando se limita la longitud de salida.
- Desconexion ocasional entre el bloque de pensamiento y la respuesta: puede anunciar en el razonamiento algo que luego no incluye en el cuerpo (por ejemplo, una tabla comparativa).
- Ventana de entrenamiento muy corta (1024 tokens, maximo 1536): aunque el base soporte 128K, el fine-tune no fue entrenado para contextos largos, por lo que el rendimiento mas alla de ~1K tokens no esta garantizado y las muestras largas se truncaron durante el entrenamiento.
- Requisitos de uso estrictos: es obligatorio pasar `enable_thinking=True` en la plantilla de chat y usar `skip_special_tokens=False` en la decodificacion; de lo contrario, la salida se corrompe o las llamadas a funciones aparecen rotas.
- Soporte limitado a chino e ingles; no se documentan otros idiomas.
- Modelo experimental con validacion escasa: 22 descargas y 0 likes en Hugging Face, sin benchmarks publicos ni evaluacion independiente.
- Riesgo de alucinacion: inherente a un modelo de 2,52B; el autor documenta errores factuales corregidos respecto a la version anterior, lo que indica que la fiabilidad factual es un punto debil.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al derivar de MiniCPM5-2B conviene verificar las condiciones del modelo base (tambien Apache 2.0 segun la model card).
- Sin soporte en MPS para las optimizaciones del base, lo que degrada el rendimiento en Apple Silicon.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whcl412/FinchAI-Rune3
- Modelo base MiniCPM5-2B: https://huggingface.co/openbmb/MiniCPM5-2B
- Version anterior (Preview): https://huggingface.co/whcl412/FinchAI-Rune3-Preview
- Version anterior (Rune2-Luna): https://huggingface.co/whcl412/FinchAI-Rune2-Luna
