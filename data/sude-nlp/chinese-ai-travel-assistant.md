# sude-nlp/chinese-ai-travel-assistant

## Resumen

El repositorio `sude-nlp/chinese-ai-travel-assistant` no contiene pesos de un modelo entrenado, sino un proyecto de aplicacion: un asistente conversacional orientado a planificar viajes a China y que responde en chino. Segun su model card, esta construido sobre el modelo local Llama 3.2:3b ejecutado con Ollama, orquestado con LangChain y servido mediante una interfaz Streamlit. El propio autor lo describe como un proyecto educativo para practicar el uso de LLM locales, memoria conversacional, streaming de respuestas y NLP en chino.

El valor del repositorio es, por tanto, de referencia practica: muestra un patron de integracion reproducible (Ollama + LangChain + Streamlit) sin necesidad de claves de API externas, con historial de conversacion y salida en tiempo real. No aporta pesos nuevos, ni dataset, ni proceso de entrenamiento propio, ni resultados de evaluacion.

La ficha se ha redactado con la informacion de la model card y de los metadatos de HuggingFace. Todo dato no declarado por el autor se marca como "no disponible" y no se ha inferido ni completado con cifras no verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en el repositorio. El proyecto se apoya en Llama 3.2:3b (transformer decoder-only denso del catalogo de Meta), dato declarado por el autor en la model card |
| Parametros totales | No disponible como cifra exacta. La etiqueta del modelo base empleado es `llama3.2:3b`, lo que indica del orden de 3 000 millones de parametros |
| Parametros activos | No aplica (el modelo base no es MoE) |
| Longitud de contexto | No disponible en el repositorio. Depende de la ventana del modelo base Llama 3.2 3B y de la configuracion de Ollama; no se especifica en la model card |
| Tipos de cuantizacion | No disponible en el repositorio. En la practica hereda los formatos GGUF que Ollama ofrece para `llama3.2:3b` (el autor no documenta la variante concreta) |
| Idiomas soportados | zh, en (segun los tags de HuggingFace y el bloque `language` de la model card) |
| Licencia | No disponible |
| Formato de pesos | No disponible. El repositorio no publica pesos; el consumo se hace via Ollama (`ollama run llama3.2:3b`) |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento propios que describir: el repositorio es una capa de aplicacion sobre un modelo preentrenado de terceros (Llama 3.2 3B), tal y como declara el autor. No se documenta ningun proceso de ajuste fino, destilacion, RLHF, DPO ni construccion de dataset especifico para turismo en China. Tampoco se publican hiperparametros, tokens de entrenamiento ni composicion de datos.

La unica "arquitectura" documentada es la del sistema: un front-end Streamlit que mantiene el historial de conversacion, un componente LangChain que gestiona la memoria y el prompt, y un backend local de inferencia servido por Ollama con el modelo `llama3.2:3b`. El resultado se emite en modo streaming hacia la interfaz. No se especifica version de LangChain, tipo de memoria (buffer, resumen, ventana), plantilla de prompt ni politica de truncado del historial, aspectos que condicionan directamente el comportamiento y el coste en contexto.

## Capacidades

- Generacion de texto conversacional en chino (objetivo principal del proyecto) y respuesta a entradas en chino o ingles, segun los idiomas declarados.
- Memoria de conversacion: mantiene el historial para dar respuestas mas contextualizadas en turnos sucesivos.
- Streaming de respuestas en tiempo real hacia la interfaz Streamlit.
- Recomendaciones sobre ciudades chinas, atracciones turisticas, gastronomia y actividades, a partir de una consulta con duracion del viaje, presupuesto e intereses (ejemplo incluido en la model card: cinco dias en Shanghai con 5 000 yuanes, interes en comida e historia).
- Ejecucion completamente local: no requiere clave de API de terceros.
- Capacidades heredadas potenciales del modelo base (generacion de codigo, matematicas basicas, multilingueismo parcial): no documentadas ni evaluadas en este repositorio, por lo que no deben asumirse para este caso de uso.
- Tool calling / function calling: no disponible. No se documenta integracion de herramientas ni agentes.
- Vision, audio o modo de razonamiento explicito: no disponible.

## Casos de uso

- Planificacion de itinerarios en chino: el caso disenado por el autor. El usuario indica fechas, presupuesto e intereses y el asistente devuelve un plan por dias; el modelo base de 3B es suficiente para generar texto estructurado de este tipo en una GPU de consumo.
- Recomendacion gastronomica y cultural por ciudad: consultas del tipo "que comer en Chengdu" o "que barrios visitar en Pekin", aprovechando la memoria conversacional para refinar preferencias turno a turno.
- Prototipo de chatbot turistico embebido: la combinacion Streamlit + LangChain permite desplegar una demo interna en minutos para validar flujos de conversacion antes de invertir en un modelo mayor o en RAG sobre datos propios.
- Docencia y formacion tecnica: sirve como ejemplo minimo y reproducible de integracion LLM local (Ollama), orquestacion (LangChain), memoria conversacional y streaming, con un caso de uso multilingue chino-ingles.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local y no requerir API externa, es adecuado para pruebas donde el texto del usuario no debe salir de la maquina.
- Asistente de pre-viaje como primer filtro: generar borradores de itinerario y listas de puntos de interes que despues un humano o un sistema con datos verificados corrige; el modelo no debe usarse como fuente de verdad de precios, horarios o requisitos de visado.
- Base para experimentar con memoria y gestion de contexto: permite medir como afecta el crecimiento del historial a la latencia y a la coherencia en un modelo pequeno, antes de trasladar esas decisiones a un sistema en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, y el repositorio no publica pesos propios que pudieran evaluarse de forma independiente. Cualquier comparacion numerica con otros sistemas carece de base verificable a partir de la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no declarada por el autor. Como referencia del modelo base de ~3 000 millones de parametros, las estimaciones habituales son del orden de 2-3 GB con cuantizacion de 4 bits, 3,5-4,5 GB con 8 bits y 6-7 GB en precision de 16 bits (estimaciones derivadas del tamano del modelo, no verificadas en este repositorio).
- GPU recomendadas: no disponibles. Cualquier GPU con 8 GB o mas de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) deberia ejecutar la variante cuantizada de un modelo de 3B con holgura.
- GPU de consumo: si, previsiblemente cualquier GPU consumer reciente con 6-8 GB de VRAM para cuantizaciones de 4 bits, y tambien CPU y Apple Silicon mediante Ollama o llama.cpp. No hay datos de rendimiento publicados por el autor.
- Opciones de despliegue: Ollama es la unica documentada en la model card. El resto del stack es Streamlit y LangChain. Otras alternativas tecnicamente compatibles con el modelo base (llama.cpp, LM Studio, vLLM o TGI con los pesos originales de Llama 3.2 3B) no estan documentadas en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, tiempo hasta el primer token ni requisitos de memoria del servidor.

## Comparativa con modelos similares

No hay datos de rendimiento del repositorio que permitan una comparacion cuantitativa. A continuacion se compara unicamente el modelo base empleado por el proyecto con alternativas de la misma franja de tamano, usando caracteristicas publicas de dichos modelos base (informacion no incluida en la model card de este repositorio y, por tanto, sujeta a verificacion en las fuentes oficiales de cada proyecto):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este proyecto (Llama 3.2 3B via Ollama) | ~3 000 millones (etiqueta `3b`) | No disponible en el repositorio | No disponible en el repositorio (la del modelo base es la licencia comunitaria de Llama 3.2) | Codigo de aplicacion en HuggingFace; pesos no alojados |
| Qwen2.5 3B | ~3 000 millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos publicos en HuggingFace, no relacionados con este repositorio |
| Gemma 2 2B | ~2 000-3 000 millones | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Pesos publicos en HuggingFace, no relacionados con este repositorio |

No se dispone de datos para comparar calidad, licencia comercial ni rendimiento entre estas opciones dentro de la informacion facilitada.

## Limitaciones y advertencias

- Proyecto educativo: el propio autor indica que se creo para aprender y experimentar con LLM locales y NLP; no esta pensado como producto ni como sistema verificado.
- Riesgo alto de alucinacion en datos facticos: precios, horarios de apertura, requisitos de visado, rutas de transporte y disponibilidad de atracciones pueden generarse de forma plausible pero incorrecta. No hay RAG, base de datos ni verificacion contra fuentes externas.
- Sin licencia declarada: la model card no especifica licencia, lo que impide determinar con claridad las condiciones de uso comercial del repositorio y de la aplicacion.
- Sin benchmarks ni evaluacion: no hay ninguna medida objetiva de calidad, por lo que no puede justificarse su eleccion frente a alternativas.
- Capacidad limitada del modelo base: un modelo de ~3 000 millones de parametros tiene menor precision en razonamiento complejo, planificacion larga y conocimiento factual que modelos mayores; la calidad de un itinerario detallado puede degradarse.
- Gestion de contexto no documentada: no se indica la politica de memoria (tipo, tamano, truncado). Un historial creciente puede consumir la ventana del modelo, degradar respuestas o aumentar latencia sin aviso.
- Idiomas: solo se declaran chino e ingles. La documentacion esta en turco e ingles, y no hay garantia de calidad en castellano ni en otras lenguas.
- Sesgos: no evaluados. Al proceder de un modelo generalista sin ajuste especifico de dominio, puede reproducir sesgos de sus datos de preentrenamiento y ofrecer una vision estereotipada o incompleta de regiones y culturas.
- Adopcion nula: cero descargas y cero "me gusta" en HuggingFace en el momento de la consulta; no hay evidencia de uso en produccion ni de mantenimiento activo. Las fechas de creacion y actualizacion del repositorio son posteriores a la fecha actual conocida, lo que conviene verificar en la pagina del modelo.
- Dependencia de terceros sin version fijada: el resultado depende de la version de Ollama, LangChain, Streamlit y del propio modelo `llama3.2:3b`, cuya actualizacion puede alterar el comportamiento sin cambios en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sude-nlp/chinese-ai-travel-assistant
- Repositorio de referencia del modelo base (no enlazado en la model card, indicado por el autor como `llama3.2:3b` en Ollama)
- Resultados de busqueda web: las coincidencias obtenidas (sude.fr, articulos de Wikipedia sobre "Sude" y "Suecia") no guardan relacion con el modelo ni con el autor y no se consideran fuentes utiles para esta ficha.
- No se han encontrado en la busqueda web papers, blogs tecnicos, demos publicas ni repositorios de codigo adicionales asociados a este modelo.
