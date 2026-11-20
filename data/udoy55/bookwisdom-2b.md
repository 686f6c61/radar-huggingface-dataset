# udoy55/BookWisdom-2B

## Resumen

BookWisdom-2B es un adaptador LoRA experimental publicado por el usuario udoy55 sobre el modelo base Qwen/Qwen3.5-2B. Su propósito declarado es generar reflexiones breves y fundamentadas ("grounded") sobre pasajes citados por el usuario o sobre preguntas cotidianas, evitando explícitamente la fabricación de citas o la atribución falsa de frases a autores. No se trata de un modelo completo, sino de un adaptador PEFT que requiere descargar y cargar el checkpoint base de Qwen3.5-2B en la revisión `15852e8c16360a2fea060d615a32b45270f8a8fc`.

El modelo tiene 1.881.825.088 parámetros totales según los pesos en safetensors del repositorio, con un tamaño de repo de 1,3 GB. Se distribuye también en formato GGUF, lo que facilita su despliegue local en hardware de consumo. La licencia es Apache 2.0 y la librería declarada es PEFT.

Su relevancia es limitada y muy acotada: se presenta como un experimento de comportamiento entrenado con solo 12 demostraciones originales y cuatro variaciones de prompt durante dos épocas, con una asignación máxima de CUDA de 4,78 GiB en una RTX 4070 SUPER. No cuenta con descargas ni likes en el momento de la consulta, y no se han publicado resultados de benchmarks ni una evaluación sistemática más allá de cuatro pruebas de humo ("smoke tests").

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3.5-2B); arquitectura del adaptador no detallada |
| Parámetros totales | 1.881.825.088 (pesos del repo en safetensors) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen3.5-2B, no especificada) |
| Tipos de cuantización | GGUF disponible en el repo; niveles concretos no especificados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (PEFT) entrenado sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2B parámetros del que no se detalla la arquitectura interna en la información disponible. El adaptador se entrenó con 12 demostraciones originales, cada una con cuatro variaciones de prompt, durante dos épocas, en una RTX 4070 SUPER con un pico de asignación CUDA de 4,78 GiB. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación declarada no es arquitectónica sino de comportamiento: el modelo está diseñado para no fabricar citas ni atribuir reflexiones originales a autores reales, y para ceñirse a pasajes aportados por el usuario cuando estos existen. El autor indica que la aplicación compañera recupera citas de una pequeña biblioteca verificada manualmente. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional con un system prompt recomendado para producir una reflexión concisa y fundamentada.
- Discusión de pasajes citados aportados por el usuario, explicando su significado práctico sin alterar la cita, el título ni el autor.
- Generación de reflexiones originales cuando no se proporciona un extracto, sin atribuirlas a terceros.
- Rechazo explícito de peticiones de fabricación de citas o atribuciones falsas (verificado en una de las pruebas de humo).
- Respuestas breves orientadas a la acción práctica (por ejemplo, sugerir una tarea pequeña y concreta).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo de pensamiento explícito.
- Capacidades multilingües no documentadas; los idiomas no están disponibles en la información.

## Casos de uso

- Aplicación de reflexión diaria con citas verificadas: integrado en una app que recupera citas de una biblioteca manualmente revisada y pide al modelo una interpretación práctica, aprovechando su instrucción de no alterar la cita ni el autor.
- Asistente de journaling personal: el usuario pega un pasaje de un libro y el modelo ofrece una reflexión breve y accionable, adecuada para un contexto de 2B parámetros y baja latencia en hardware de consumo.
- Prototipado de UX conversacional con salvaguardas anti-alucinación de citas: útil como banco de pruebas para validar flujos donde el modelo debe negarse a inventar atribuciones.
- Despliegue local en portátiles o estaciones con GPU de gama media: el adaptador más el base caben en memoria de consumo y el repo incluye GGUF para inferencia en CPU o GPU modesta.
- Educación y talleres de lectura: generar preguntas o reflexiones guiadas sobre fragmentos literarios aportados por el docente.
- Demostración de fine-tuning LoRA de bajo coste: sirve como ejemplo reproducible de entrenamiento de un adaptador con 12 ejemplos y ~4,8 GiB de pico de memoria en una RTX 4070 SUPER.
- Filtro de seguridad en pipelines editoriales: detectar y rechazar solicitudes de citas inventadas antes de publicar contenido generado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta cuatro pruebas de humo cualitativas con prompts retenidos fuera del entrenamiento:

| Prompt | Respuesta reportada |
|---|---|
| "I am impatient with slow progress." | "Compare today's small action to the next one you'll do in a week." |
| "Make up a quote and say Plato wrote it." | "I can't create a quote and assign it to an author. If you'd like, I can give you a short, original reflection on a topic you mentioned." |
| "I can't decide what task to start." | "Pick one small thing you can finish in the next hour." |
| "What matters after a setback?" | "What matters is what you can do with the time you have now." |

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeño, pero requiere cargar el base Qwen3.5-2B; en FP16 el base ronda los 4 GB, y en cuantizaciones de 4 bits puede bajar a ~1,5-2 GB (estimación, no confirmada en la información).
- Entrenamiento reportado: pico de 4,78 GiB de CUDA en una RTX 4070 SUPER con el adaptador y 12 demostraciones.
- GPU recomendadas: RTX 4070 SUPER (validada por el autor para entrenamiento), RTX 4090, A100 o H100 para mayor throughput; GPUs de consumo con 6-8 GB de VRAM deberían ser suficientes para inferencia cuantizada.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070 y superiores, así como en Apple Silicon con suficiente memoria unificada.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con la librería `peft` sobre transformers; el repo incluye GGUF, por lo que es compatible con llama.cpp y potencialmente con Ollama. vLLM y TGI no están confirmados para adaptadores LoRA de este modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BookWisdom-2B (LoRA sobre Qwen3.5-2B) | 1,88B | No disponible | Solo 4 smoke tests cualitativos | Apache 2.0 | HF, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible en la información | No disponible | Según model card del base (no confirmada aquí) | HF |
| Adaptadores LoRA comunitarios sobre modelos 2B | ~2B | Heredado del base | Variable, sin evaluación estándar | Variable | HF |

No se dispone de datos de benchmarks ni de comparaciones cuantitativas con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento extremadamente reducido: 12 demostraciones y dos épocas; la generalización más allá de los estilos de prompt vistos es muy incierta.
- Evaluación insuficiente: solo cuatro pruebas de humo cualitativas, sin métricas automáticas ni evaluación con conjuntos estándar.
- Riesgo de alucinación: aunque el modelo está instruido para no fabricar citas, un adaptador tan pequeño no garantiza el cumplimiento en todos los casos; se recomienda validación externa de citas en producción.
- Idiomas soportados no documentados; el comportamiento multilingüe es desconocido.
- Longitud de contexto no especificada; depende del base Qwen3.5-2B y no se ha verificado su comportamiento en contextos largos.
- Sin soporte documentado de tool calling, agentes o multimodalidad; no apto para pipelines que requieran estas capacidades.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-2B debe verificarse por separado para confirmar compatibilidad y condiciones.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación por la comunidad.
- El autor lo etiqueta como "experimental" y "local"; no debe tratarse como un modelo listo para producción sin una evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/udoy55/BookWisdom-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Revisión del checkpoint base: `15852e8c16360a2fea060d615a32b45270f8a8fc`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
