# Theboukadida/laura-en-qwen3-4b-GGUF

## Resumen

Laura-en-qwen3-4b-GGUF es un ajuste fino del modelo Qwen/Qwen3-4B-Instruct-2507 orientado a una tarea muy concreta: actuar como tutor de aleman para principiantes adultos (niveles A1-A2) dentro de una aplicacion de curso offline. El modelo conversa con el alumno en ingles y ensena aleman mediante ejemplos en aleman, de modo que el idioma de instruccion es el ingles y el idioma objeto es el aleman. Lo desarrolla el usuario de HuggingFace Theboukadida y se distribuye bajo licencia Apache-2.0, heredada del modelo base.

Tecnicamente es un transformer denso de 4.022.468.096 parametros (aproximadamente 4,02 B) publicado unicamente en formato GGUF y cuantizado a Q4_K_M con llama.cpp, en un unico archivo de 2,50 GB. El modelo base se entreno con un adaptador LoRA de rango 16 sobre todas las capas lineales durante 2 epocas, usando entre 2.500 y 3.300 conversaciones cortas de tutoria en ingles; el adaptador se fusiono en los pesos antes de la conversion a GGUF.

Su relevancia es de nicho pero clara: demuestra un flujo completo de especializacion ligera (LoRA + merge + cuantizacion) para ejecutar un tutor conversacional en el movil, solo con CPU. El propio autor advierte que el modelo no evalua el aleman por si mismo: la aplicacion verifica las frases con su propio diccionario y anade el veredicto, los significados y la tarjeta de reglas del capitulo al mensaje; el modelo se limita a explicarlos y a mantener la conversacion. El repositorio no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado) |
| Idiomas soportados | Aleman (de) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

La base es Qwen3-4B-Instruct-2507, un transformer denso de la familia Qwen3 con 4,02 B de parametros. Sobre esa base se entreno un adaptador LoRA de rango 16 aplicado a todas las capas lineales durante 2 epocas, con un corpus de aproximadamente 2.500-3.300 conversaciones cortas de tutoria en ingles. El adaptador se fusiono en los pesos del modelo base (merge) y el resultado se convirtio a GGUF y se cuantizo a Q4_K_M con llama.cpp. No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF o DPO sobre el ajuste.

La innovacion destacable no esta en la arquitectura, sino en el diseno del sistema: el modelo no se usa como corrector autonomo de aleman. La aplicacion comprueba la frase del alumno con su propio diccionario y anade a la entrada una nota estructurada del tipo `(Check: ✗ → "frase corregida" · motivo)` o `(Check: ✓ ...)`, junto con los significados del diccionario y la tarjeta de reglas del capitulo. El modelo se entreno exactamente con ese formato de notas y su funcion es explicarlas y construir la conversacion alrededor de ellas. El autor indica explicitamente que, sin esas notas, el modelo es un profesor mucho mas debil.

## Capacidades

- Generacion de texto conversacional en ingles con ejemplos y frases en aleman para niveles A1-A2.
- Explicacion de correcciones y reglas gramaticales precalculadas por la aplicacion (veredictos, motivos y tarjetas de reglas).
- Reformulacion de frases a partir de una correccion proporcionada externamente, manteniendo el hilo de la conversacion.
- Tutoria multi-turno de conversaciones cortas, con el estilo y las convenciones de respuesta de la aplicacion que lo entrena.
- Capacidad bilingue limitada al par ingles-aleman: instruccion en ingles, contenido en aleman.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito en la informacion disponible.
- No se documenta capacidad de ejecucion de codigo ni de matematicas como caso de uso del ajuste.

## Casos de uso

- Tutoria de aleman offline en movil: el caso principal. El modelo se ejecuta solo con CPU en el telefono, dentro de una aplicacion de curso, y mantiene conversaciones cortas con el alumno en ingles usando ejemplos en aleman, sin necesidad de conexion.
- Explicacion de correcciones precalculadas: la aplicacion detecta el error con su diccionario y pasa la nota `(Check: ✗ → "frase corregida" · motivo)`; el modelo explica al alumno por que la frase es incorrecta y como se corrige, en el registro y el formato con los que fue entrenado.
- Practica guiada de vocabulario: a partir de los significados de diccionario que la app inserta en el mensaje, el modelo genera ejemplos de uso y microdialogos en aleman adaptados al nivel A1-A2.
- Desarrollo de variantes idiomaticas del mismo tutor: el pipeline documentado (LoRA r16, 2 epocas, merge y cuantizacion Q4_K_M) sirve como plantilla replicable; de hecho el autor publica una version francesa con la misma receta sobre Qwen3.5-2B.
- Comparacion y ajuste de tamanos de tutor: el modelo esta pensado para medirse contra la variante 2B Pro con los mismos datos de entrenamiento, de modo que sirve como referencia en evaluaciones de calidad por tamano en entornos con recursos limitados.
- Generacion de material didactico corto: dialogos, frases de ejemplo y aclaraciones gramaticales en ingles sobre estructuras alemanas basicas, reutilizables como contenido de ejercicios en una app de edtech.
- Prototipado de asistentes educativos en dispositivo: sirve como componente conversacional de bajo coste (archivo de 2,50 GB, inferencia en CPU) para probar productos de aprendizaje sin depender de APIs en la nube.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles provienen de la model card del autor y son especificos de la aplicacion, no benchmarks estandar:

| Evaluacion | Resultado | Fuente |
|---|---|---|
| Cumplimiento de las reglas de respuesta de la app (respuestas en ingles) | 762 de 763 respuestas correctas | Model card |
| Evaluacion manual en 40 conversaciones retenidas | 34% de respuestas con al menos un error | Model card |
| Comparacion con el tutor 2B Pro (mismos datos) | 34% de error frente a 44% del 2B | Model card |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: es el escenario previsto por el autor. El modelo corre en el telefono, solo con CPU, con el archivo GGUF Q4_K_M de 2,50 GB.
- Memoria estimada: al tratarse de un archivo Q4_K_M de 2,50 GB, se necesita en torno a 3 GB de RAM libre para cargar el modelo y el contexto; el valor exacto no esta documentado.
- VRAM estimada para GPU: aproximadamente 3 GB para el modelo cuantizado, mas el margen del contexto. Cabe en GPU de consumo con 4 GB o mas (por ejemplo, GTX 1650 4 GB, RTX 3050 8 GB, RTX 4060, RTX 4090). No hay mediciones publicadas.
- Opciones de despliegue documentadas o compatibles con el formato: llama.cpp, Ollama, LM Studio y bindings de llama.cpp (por ejemplo, llama-cpp-python). Para despliegue en servidor con safetensors habria que partir del modelo base y reaplicar el ajuste, ya que el repositorio solo publica GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Theboukadida/laura-en-qwen3-4b-GGUF (este) | ~4,02 B | no disponible | GGUF Q4_K_M (2,50 GB) | Apache-2.0 | Tutor de aleman en ingles; 34% de respuestas con error en evaluacion manual |
| Qwen/Qwen3-4B-Instruct-2507 | ~4,02 B | no disponible en la informacion | safetensors (y GGUF derivados) | Apache-2.0 | Modelo base sin ajuste de tutoria; no incluye el formato de notas de la app |
| unsloth/Qwen3-4B-GGUF | ~4 B | no disponible | GGUF, varias cuantizaciones | Apache-2.0 | Cuantizaciones del base, sin especializacion en tutoria |
| Theboukadida/laura-fr-qwen3.5-2b-GGUF | ~2 B | no disponible | GGUF Q4_K_M | Apache-2.0 | Misma receta de LoRA r16 aplicada al tutor de frances sobre Qwen3.5-2B |
| Tutor 2B Pro (referencia interna del autor) | ~2 B | no disponible | no disponible | no disponible | Mismos datos de entrenamiento; 44% de respuestas con error frente al 34% de este modelo |

## Limitaciones y advertencias

- Dependencia del andamiaje externo: el modelo no corrige aleman por si mismo. El autor advierte que sin las notas de verificacion, los significados y las tarjetas de reglas que inyecta la aplicacion, es un profesor mucho mas debil. Usarlo como corrector autonomo degrada la calidad.
- Tasa de error medida: en la evaluacion manual sobre 40 conversaciones retenidas, el 34% de las respuestas contenia al menos un error. Es un dato alto para uso educativo sin supervision.
- Riesgo de alucinacion gramatical: al ser un ajuste ligero (LoRA r16, 2 epocas) sobre un corpus pequeno y muy especifico, es previsible que genere explicaciones plausibles pero incorrectas fuera del dominio de las notas de la app. No hay evaluacion publicada de este comportamiento.
- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgos ni de seguridad.
- Alcance idiomatico reducido: solo aleman e ingles. No hay soporte documentado de otros idiomas ni de variedades regionales del aleman.
- Dominio muy estrecho: entrenado para tutoria A1-A2 con conversaciones cortas; no es un modelo de proposito general y su rendimiento fuera de ese registro no esta medido.
- Contexto: la longitud de contexto soportada no se especifica en la informacion proporcionada. Las conversaciones de entrenamiento eran cortas, por lo que no hay garantia de buen comportamiento con entradas largas.
- Licencia: Apache-2.0, permisiva y apta para uso comercial, siempre que se conserve la atribucion correspondiente y se cumplan las condiciones del modelo base Qwen3-4B-Instruct-2507. No se documentan restricciones adicionales impuestas por el autor del ajuste.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso en produccion ni issues publicas.
- Produccion: cualquier despliegue deberia acompanar al modelo del mismo sistema de verificacion lexica que usa la app original y validar la salida antes de mostrarla al alumno.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Theboukadida/laura-en-qwen3-4b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Cuantizaciones GGUF del base: https://huggingface.co/unsloth/Qwen3-4B-GGUF
- Version francesa con la misma receta: https://huggingface.co/Theboukadida/laura-fr-qwen3.5-2b-GGUF
- Qwen3 Technical Report: https://arxiv.org/html/2505.09388v1
