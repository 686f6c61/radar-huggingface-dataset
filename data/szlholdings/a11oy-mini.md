# SZLHOLDINGS/A11OY-MINI

## Resumen

A11OY-MINI es un modelo de generacion de texto publicado por SZLHOLDINGS bajo licencia Apache 2.0, distribuido en formato GGUF y derivado del modelo base Qwen/Qwen3.5-0.8B. Con 772.845.888 parametros totales (aproximadamente 0,77 mil millones), se situa en el segmento de modelos ultra-ligeros, pensado para inferencia en hardware modesto y para despliegues conversacionales de baja latencia. El repositorio ocupa 2,9 GB y acumula 1085 descargas desde su creacion en agosto de 2026.

La model card del autor es deliberadamente parca: se limita a describir el artefacto como parte de un "estate" de IA gobernada con resultados verificables mediante recibos de auditoria, y declara explicitamente que cualquier cifra de entrenamiento o evaluacion no documentada en dichos recibos debe considerarse desconocida. No se publican detalles sobre la composicion del dataset, el numero de tokens de entrenamiento ni el proceso de alineacion.

Su relevancia practica reside en tres factores: el linaje sobre Qwen3.5-0.8B, un tamano que permite ejecucion en CPU y GPUs de consumo, y una licencia permisiva sin restricciones de uso comercial. Para desarrolladores que necesitan un modelo conversacional pequeno y desplegable localmente, es una opcion a considerar, aunque la ausencia de benchmarks publicados obliga a evaluarlo empiricamente antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos GGUF; no se detallan los niveles) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. El unico dato estructural disponible es su modelo base, Qwen/Qwen3.5-0.8B, del que hereda el diseno y sobre el que SZLHOLDINGS habria realizado un ajuste posterior. No se especifica si se trata de un transformer denso convencional, ni se documentan innovaciones como atencion lineal, decodificacion especulativa o capas hibridas.

Tampoco se publican datos sobre el entrenamiento: ni el volumen de tokens, ni la composicion del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. La model card indica que las afirmaciones de entrenamiento y evaluacion residen en ficheros de recibos del "estate" del autor, fuera de la propia tarjeta, y que todo lo no documentado alli debe tratarse como desconocido. En consecuencia, cualquier afirmacion sobre calidad de ajuste o datos utilizados carece de verificacion publica en la informacion disponible.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta del repositorio es "conversational", lo que indica un ajuste orientado a dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints o APIs compatibles.
- Ejecucion local en formato GGUF: los pesos estan empaquetados para motores de inferencia optimizados para CPU y GPU de gama baja.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y modo "thinking": no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Asistentes conversacionales embebidos en aplicaciones de escritorio o moviles: con menos de 800 millones de parametros, el modelo puede ejecutarse en el propio dispositivo mediante llama.cpp u Ollama, eliminando la dependencia de APIs externas y los costes por token en escenarios de alto volumen de consultas.
- Clasificacion y enrutado de intenciones en pipelines de atencion al cliente: su tamano reducido permite procesar cada consulta en milisegundos en una GPU de consumo, lo que lo hace adecuado como primera capa que decide si derivar a un modelo mayor o resolver la peticion directamente.
- Prototipado rapido de productos conversacionales: al estar disponible en GGUF y con licencia Apache 2.0, un equipo puede validar la experiencia de usuario de un chatbot sin negociar licencias ni aprovisionar GPUs de datacenter.
- Generacion de respuestas en entornos con requisitos de privacidad: el despliegue totalmente local garantiza que los datos del usuario no salgan de la infraestructura propia, algo relevante en sectores regulados como salud o legal.
- Tareas de reescritura y resumen de textos cortos: para parrafos, correos o mensajes, el modelo puede generar reformulaciones o resumenes en ingles con latencia baja en CPU, integrable en herramientas de productividad.
- Educacion y practica de ingles: como tutor conversacional simple, el modelo puede mantener intercambios en ingles sobre temas acotados, ejecutandose en un portatil sin conexion.
- Filtrado y preprocesamiento en pipelines de datos: puede emplearse para normalizar, etiquetar o limpiar texto antes de pasarlo a modelos mayores, reduciendo el coste computacional global del sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor declara explicitamente que no se afirma ninguna cifra de benchmark mas alla de lo que una auditoria fechada haya medido, y no se incluye ninguna medicion en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamano, un modelo de 0,77 mil millones de parametros en cuantizacion de 4 bits ocupa aproximadamente 0,5 GB de pesos, y en FP16 alrededor de 1,5 GB; estas cifras son estimaciones genericas por tamano, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamano, el modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, y con GPUs de datacenter (A100, H100) si se busca maximo throughput, aunque no se han publicado mediciones.
- Cabe en GPU de consumo: si, segun el tamano del modelo; no se especifican modelos concretos ni requisitos oficiales.
- Opciones de despliegue: llama.cpp y Ollama son los motores naturales para pesos GGUF; tambien cabria su uso via endpoints compatibles segun la etiqueta del repositorio. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| A11OY-MINI | 772.845.888 | no disponible | Apache 2.0 | GGUF | Derivado de Qwen3.5-0.8B; solo ingles; sin benchmarks publicados |
| Qwen/Qwen3.5-0.8B | no disponible en esta informacion | no disponible | no disponible en esta informacion | no disponible | Modelo base del que deriva A11OY-MINI |
| Alternativas de menos de 1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion con otros modelos de la misma categoria |

La comparacion cuantitativa con alternativas del segmento sub-1B no puede completarse con rigor: la informacion proporcionada no incluye especificaciones de contexto, rendimiento ni terminos de licencia de modelos competidores, y la propia model card de A11OY-MINI evita afirmar cifras no auditadas.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles como idioma soportado; el rendimiento en castellano u otras lenguas no esta garantizado ni documentado.
- Ausencia de benchmarks: no hay mediciones publicas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, lo que impide estimar su calidad relativa frente a alternativas sin evaluacion propia.
- Opacidad del ajuste: no se documentan datos de entrenamiento, proceso de alineacion ni cambios respecto al modelo base Qwen3.5-0.8B, por lo que no puede evaluarse que mejora aporta el ajuste de SZLHOLDINGS.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; con 0,77 mil millones de parametros, la capacidad de razonamiento factual es limitada y la probabilidad de generar contenido incorrecto con apariencia de veracidad es alta.
- Sesgos: no se ha publicado ninguna evaluacion de sesgos; al desconocerse la composicion del corpus de ajuste, no puede descartarse la presencia de sesgos heredados del modelo base o introducidos en el ajuste.
- Contexto: se desconoce la longitud de ventana soportada, lo que impide planificar su uso en tareas que requieran documentos largos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el comprador debe verificar de forma independiente las obligaciones derivadas del modelo base Qwen3.5-0.8B.
- Madurez del artefacto: cero "likes" y una model card generada de forma automatica por herramientas del propio autor sugieren poca validacion por parte de la comunidad; conviene tratarlo como experimental hasta realizar una evaluacion propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/A11OY-MINI
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (fuente canonica citada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de model cards del autor: https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
