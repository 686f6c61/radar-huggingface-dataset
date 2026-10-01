# Theboukadida/laura-ar-qwen3-4b-GGUF

## Resumen

Laura es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 orientado a un único caso de uso: actuar como tutor de alemán para adultos principiantes (niveles A1–A2) dentro de una aplicación de curso offline. El modelo conversa con el alumno en árabe y enseña alemán apoyándose en ejemplos escritos en alemán. Lo publica el usuario Theboukadida en HuggingFace y se distribuye únicamente en formato GGUF, cuantizado a Q4_K_M, con un archivo de 2,50 GB.

El ajuste se hizo con un adaptador LoRA (rango 16, aplicado a todas las capas lineales, 2 épocas según una parte de la model card y 3 épocas según otra) entrenado sobre aproximadamente 2.500–3.300 conversaciones cortas de tutoría en árabe. El adaptador se fusionó en los pesos del modelo base y el resultado se convirtió a GGUF con llama.cpp. La relevancia del modelo es acotada pero clara: demuestra un caso de destilación de una tarea pedagógica muy concreta en un modelo de 4B que se ejecuta en CPU en un teléfono, sin conexión.

Un detalle importante de diseño es que la aplicación no delega el juicio lingüístico en el modelo: comprueba la frase del alumno con su propio diccionario y le inyecta el veredicto, los significados y la tarjeta de regla del capítulo en el mensaje. El modelo fue entrenado con esas notas y su función es explicarlas y sostener la conversación alrededor de ellas. Fuera de ese contexto, el propio autor advierte que es un profesor mucho más débil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada del modelo base Qwen3-4B-Instruct-2507); ajuste LoRA fusionado en los pesos |
| Parametros totales | Aproximadamente 4.000 millones (modelo base de 4B; no se detalla el recuento exacto) |
| Parametros activos | No aplica: el modelo base es denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única cuantización publicada); otras no disponibles |
| Idiomas soportados | Árabe y alemán (etiquetas `ar`, `de`); la conversación es en árabe con ejemplos en alemán |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Tamaño del archivo publicado | 2,50 GB (`laura-ar-qwen3-4b-Q4_K_M.gguf`) |
| Metodo de ajuste | LoRA, rango 16, todas las capas lineales, 2–3 épocas (la model card se contradice entre ambas cifras), fusionado y convertido con llama.cpp |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de aproximadamente 4.000 millones de parámetros. Sobre ese base se entrenó un adaptador LoRA de rango 16 aplicado a todas las capas lineales durante 2 o 3 épocas (la model card indica 2 épocas en el apartado de cambios y 3 épocas en el de evaluación) usando entre 2.500 y 3.300 conversaciones cortas de tutoría en árabe. Posteriormente el adaptador se fusionó en los pesos del modelo base, el resultado se convirtió a GGUF y se cuantizó a Q4_K_M con llama.cpp. No se menciona uso de RLHF ni de DPO.

La innovación técnica no está en la arquitectura, sino en el diseño del sistema que rodea al modelo: la aplicación realiza la comprobación gramatical con su propio diccionario y añade al mensaje una nota estructurada del tipo `(Check: ✗ → "frase corregida" · motivo)` o `(Check: ✓ …)`, junto con significados de palabras y la tarjeta de regla del capítulo. El modelo se entrenó exactamente con ese formato de notas, de modo que su comportamiento depende de que el sistema anfitrión las genere. No hay datos sobre la composición lingüística del dataset de entrenamiento ni sobre el número total de tokens vistos.

## Capacidades

- Generación de texto conversacional en árabe con ejemplos y contenido en alemán, en el marco de una tutoría de nivel A1–A2.
- Explicación de veredictos gramaticales y correcciones cuando la aplicación se las inyecta en el mensaje.
- Respuesta a preguntas sobre la tarjeta de regla del capítulo y sobre los significados de palabras proporcionados por el diccionario de la app.
- Conversación multi-turno de tutoría, con el modelo sosteniendo el diálogo alrededor de las notas del sistema.
- Ejecución en dispositivo (on-device), en CPU, sin conexión a red.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta capacidad de agente ni de razonamiento multi-paso autónomo.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- El alcance multilingüe se limita a árabe y alemán; no hay indicios de otros idiomas.

## Casos de uso

- Aplicación de aprendizaje de alemán offline para arabófonos: es el caso de uso para el que fue entrenado. Se integra en una app móvil que ejecuta el GGUF en CPU, sin conexión, y el modelo aporta la conversación de tutoría alrededor de las comprobaciones que genera la propia app.
- Tutor conversacional A1–A2 con corrección asistida: la app detecta el error con su diccionario y el modelo explica la corrección en árabe, de modo que el alumno entiende el motivo y no solo la forma correcta.
- Práctica de conversación guiada por capítulo: el modelo responde dentro del vocabulario y las reglas del capítulo activo, apoyándose en la tarjeta de regla que la app inserta en el contexto.
- Generación de ejemplos de alemán con explicación en árabe: útil para ampliar ejercicios o frases de ejemplo dentro de la app, siempre que el sistema valide el resultado con su diccionario.
- Prototipado de asistentes educativos en dispositivos de gama media: al ocupar 2,50 GB en Q4_K_M y funcionar en CPU, sirve como banco de pruebas para arquitecturas de app que separan la lógica de validación del modelo generativo.
- Despliegue con privacidad por diseño: al ejecutarse localmente y sin red, los datos de conversación del alumno no salen del dispositivo, lo que facilita el cumplimiento de requisitos de privacidad en entornos educativos.
- Integración en pipelines de generación de material didáctico controlados por humano: el modelo redacta el diálogo y el revisor o el sistema de diccionario aporta la validación lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El único dato de evaluación es una prueba interna del autor, realizada a mano sobre la aplicación completa (comprobación de alemán, respuestas escritas por la app y puerta de respuesta):

| Evaluacion | Metodologia | Resultado |
|---|---|---|
| Tutor profesional en arabe, 4B (T-119), ronda 8 (1 de octubre) | Qwen3-4B-Instruct-2507 con LoRA (r16, 3 epocas) sobre los datos de tutoría en árabe; evaluacion manual de 40 conversaciones nuevas a traves de la app completa | 11,1 % de respuestas con un error |

Esta cifra no es comparable con benchmarks publicos: mide una tarea propia, con un conjunto de evaluacion de 40 conversaciones y con la app aportando veredictos, correcciones, significados y respuestas de tarjeta de regla.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un GGUF Q4_K_M de 2,50 GB, el peso en memoria es de aproximadamente 2,5 GB; con el contexto y las estructuras de llama.cpp hay que contar con margen adicional. No se publica una cifra oficial de VRAM.
- VRAM estimada por cuantizacion: Q4_K_M, en torno a 2,5 GB de pesos; no hay otras cuantizaciones publicadas (Q5, Q8 o FP16 no disponibles).
- GPU recomendadas: cualquier GPU de consumo con al menos 4–6 GB de VRAM puede alojar la version Q4_K_M; no se especifican modelos concretos en la informacion disponible.
- Si cabe en GPU de consumo: si, previsiblemente en practicamente cualquier GPU de consumo actual con 6 GB o mas de VRAM; el modelo esta pensado para ejecutarse incluso sin GPU.
- Ejecucion en CPU: es el modo de despliegue documentado. El autor indica que el modelo corre en el telefono, solo con CPU.
- Opciones de despliegue: llama.cpp es la via natural dado el formato GGUF; tambien son aplicables envoltorios compatibles con GGUF como Ollama o LM Studio. No se documenta soporte con vLLM ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Laura (este modelo) | ~4B | no disponible | Apache-2.0 | GGUF (Q4_K_M) | Ajuste especifico para tutoría de alemán en árabe, orientado a ejecución en CPU |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | no disponible | Apache-2.0 | safetensors | Modelo base sin ajustar; no incluye el comportamiento de tutor ni el formato de notas |
| Otras alternativas de 3–4B de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se han publicado comparativas de rendimiento entre este modelo y alternativas de tamano similar en la informacion disponible.

## Limitaciones y advertencias

- Dependencia del sistema anfitrion: el modelo fue entrenado con las notas que genera la app (veredicto de comprobacion, significados, tarjeta de regla). Sin esas notas, el propio autor afirma que es un profesor mucho mas debil. Usarlo de forma aislada degrada su utilidad.
- Juicio gramatical no fiable: el diseno asume explicitamente que no se debe confiar en el modelo para evaluar el aleman por si solo; la validacion la hace el diccionario de la aplicacion.
- Riesgo de alucinacion: no se documentan medidas de mitigacion; en un modelo de 4B ajustado sobre un corpus pequeno de conversaciones, el riesgo de inventar vocabulario, reglas o traducciones fuera del dominio de entrenamiento es relevante.
- Alcance de idioma muy reducido: solo arabe y aleman, y dentro de un registro de tutoria A1–A2. Fuera de ese registro no hay garantias.
- Evaluacion limitada: el 11,1 % de respuestas con error procede de 40 conversaciones evaluadas a mano por el autor, sin conjunto de prueba publico ni replicable.
- Contradiccion en la model card: se indica LoRA de 2 epocas en un apartado y de 3 epocas en otro, lo que impide reproducir el entrenamiento con exactitud.
- Sin validacion de la comunidad: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de funcionamiento en produccion.
- Metadatos con fechas futuras en HuggingFace (creacion y actualizacion en 2026), lo que sugiere que los metadatos no son fiables.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial. Aun asi, conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507 antes de un despliegue comercial.
- Al ser un modelo denso de 4B cuantizado a Q4_K_M, hay una perdida de precision respecto a los pesos originales que no se ha cuantificado en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Theboukadida/laura-ar-qwen3-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
