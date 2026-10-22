# Wilflor2001/hw2-prompt-engineering

## Resumen

`Wilflor2001/hw2-prompt-engineering` no es un modelo de lenguaje entrenado, sino un repositorio de apuntes de investigacion sobre ingenieria de prompts. La propia model card lo declara explicitamente: el artefacto principal es `review.md`, un documento que describe el alcance de una pregunta de investigacion, los factores de confusion previsibles, una propuesta de comparacion con lineas base emparejadas y un conjunto de comprobaciones de reproducibilidad. El autor indica que las secciones marcadas como planes o hipotesis no deben interpretarse como resultados experimentales y que no existe checkpoint entrenado, codigo liberado ni mejoras de benchmark declaradas.

El repositorio esta etiquetado con `safetensors` y `transformer`, y los metadatos de HuggingFace registran 49.600 parametros totales, un volumen que no corresponde a ningun modelo generativo utilizable (un transformer de ese tamano tendria del orden de decenas de miles de pesos, compatible como mucho con un componente auxiliar, no con un LLM). El tamano del repositorio es de 0,0 GB y los unicos ficheros documentados son `review.md` y `README.md`. La licencia es MIT y el pipeline no esta definido.

Su relevancia es documental, no tecnica: sirve como ejemplo de pre-registro de experimentos de prompting y como material de partida para verificar afirmaciones sobre técnicas de instruccion. Cualquier uso que espere inferencia de texto, generacion de codigo o capacidades conversacionales fracasara, porque no hay pesos funcionales ni configuracion de modelo publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Etiquetada como `transformer` en los tags del repositorio; no hay configuracion de arquitectura, capas ni atencion publicada. El contenido real son ficheros Markdown |
| Parametros totales | 49.600 (segun metadatos de safetensors del repositorio) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no hay pesos de modelo que cuantizar) |
| Idiomas soportados | No disponible; el README y el artefacto documentado estan redactados en ingles |
| Licencia | MIT |
| Formato de pesos | `safetensors` declarado en los tags; los artefactos documentados son `review.md` y `README.md` |
| ID en HuggingFace | Wilflor2001/hw2-prompt-engineering |
| Pipeline | No disponible |
| Descargas / likes | 0 descargas, 1 like |
| Tamano del repositorio | 0,0 GB |
| Fechas | Creado el 21 de octubre de 2026; actualizado el 21 de octubre de 2026 |
| Region declarada | `us` |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura interna ni sobre proceso de entrenamiento. La model card no documenta numero de tokens, composicion del dataset, fases de preentrenamiento, ajuste supervisado, RLHF ni DPO, y tampoco describe innovaciones tecnicas como decodificacion especulativa o atencion lineal. El tag `transformer` es la unica referencia a una familia de arquitecturas y aparece sin respaldo de configuracion, codigo ni pesos.

El contenido del repositorio es metodologico: se enumeran el alcance de la pregunta de investigacion, los confounders probables, la propuesta de comparacion con lineas base emparejadas, el contexto de evaluacion mediante benchmarks publicos citados en la nota principal, comprobaciones de reproducibilidad, modos de fallo y preguntas abiertas. Las referencias y los datasets propuestos se presentan como punto de partida para verificacion, no como evidencia de que el estudio se haya ejecutado.

## Capacidades

- No dispone de generacion de texto: no hay checkpoint ni pipeline de inferencia.
- No dispone de razonamiento, matemáticas ni generacion de codigo.
- No dispone de tool calling ni function calling.
- No dispone de soporte para agentes ni razonamiento multi-paso.
- No dispone de capacidades multimodales (vision, audio) ni de modo "thinking".
- No hay informacion sobre capacidades multilingues; los idiomas no estan declarados.
- Como documento, aporta: definicion del alcance de una pregunta de investigacion sobre prompting, identificacion de confounders, propuesta de comparacion con lineas base emparejadas, contexto de evaluacion con benchmarks publicos, lista de comprobaciones de reproducibilidad y catalogo de modos de fallo y preguntas abiertas.
- El autor advierte que el repositorio no reclama mejoras de benchmark, ablaciones completadas, codigo liberado ni checkpoint entrenado.

## Casos de uso

- Onboarding de un equipo de evaluacion: usar `review.md` como lectura de entrada para que nuevos miembros entiendan que confounders hay que controlar antes de lanzar un experimento de prompting, con la lista de comprobaciones de reproducibilidad como checklist.
- Pre-registro de experimentos: tomar la estructura de la nota (hipotesis, lineas base emparejadas, benchmarks publicos objetivo) como plantilla para documentar un estudio antes de ejecutarlo, evitando declarar resultados a posteriori.
- Revision de literatura: emplear la seccion de referencias como punto de partida para localizar trabajos sobre tecnicas de prompting y verificar cada cita antes de reutilizarla.
- Diseno de evaluaciones reproducibles: adoptar la exigencia del autor (versiones de dataset, comandos, semillas, hardware y logs crudos) como politica interna para cualquier resultado que se publique.
- Docencia y formacion: utilizar la distincion explicita entre planes e hipotesis frente a resultados como ejemplo practico de higiene experimental en cursos de IA.
- Auditoria de afirmaciones tecnicas: contrastar informes internos o publicaciones que atribuyan mejoras a cambios de prompt, usando el catalogo de modos de fallo del repositorio como guia de preguntas criticas.
- Base para una ablacion futura: derivar de las preguntas abiertas un conjunto acotado de experimentos con lineas base emparejadas, sabiendo que el repositorio no aporta datos previos que reutilizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que no se declaran mejoras de benchmark ni ablaciones completadas, y que las secciones etiquetadas como planes o hipotesis no constituyen resultados experimentales.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no existe un modelo desplegable en el repositorio.
- GPU recomendadas: no disponible; cualquier maquina capaz de abrir ficheros de texto es suficiente para consumir el artefacto documentado.
- GPU de consumo: no aplica. Si el fichero `safetensors` de 49.600 parametros existe y corresponde a un componente auxiliar, su carga y ejecucion en CPU seria del orden de milisegundos y requeriria menos de 1 MB en memoria; no se ha verificado su contenido ni su funcion.
- Opciones de despliegue: ninguna de las habituales (vLLM, llama.cpp, Ollama, TGI) es aplicable, ya que no hay pesos de un modelo de lenguaje ni tokenizer documentado.
- Latencia y throughput: no disponibles y sin sentido en este contexto.

## Comparativa con modelos similares

No existe un modelo comparable porque el repositorio no contiene un modelo. A modo de contexto, se comparan caracteristicas del artefacto con otros recursos sobre la misma materia citados en la busqueda web; ninguno de ellos es un modelo desplegable.

| Recurso | Tipo de artefacto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wilflor2001/hw2-prompt-engineering | Notas de investigacion en Markdown | 49.600 declarados en safetensors (no verificables como modelo) | No disponible | MIT | Repositorio en HuggingFace, 0 descargas |
| arXiv:2401.14423 | Articulo sobre ingenieria de prompts en modelos generativos | No aplica | No aplica | No disponible en la informacion | PDF abierto en arXiv |
| arXiv:2402.07927 | Survey sobre tecnicas de prompting para LLM y VLM | No aplica | No aplica | No disponible en la informacion | PDF abierto en arXiv |
| Guia de IBM sobre prompt engineering | Guia practica corporativa | No aplica | No aplica | No disponible en la informacion | Web |
| Curso de Coursera "Prompt Engineering, Generative AI & LLM Models Fundamentals" | Formacion con quizzes y comprobaciones de conocimiento | No aplica | No aplica | No disponible en la informacion | Plataforma Coursera |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni puede invocarse mediante `transformers`, `vLLM` ni APIs de inferencia. Cualquier intento de uso como LLM fallara.
- Los 49.600 parametros registrados en los metadatos de safetensors no son coherentes con un modelo de lenguaje funcional; su origen y contenido no estan documentados.
- El repositorio tiene 0,0 GB y solo declara dos ficheros Markdown, por lo que no hay codigo, scripts de evaluacion ni logs que permitan reproducir nada.
- Riesgo de interpretacion erronea: las secciones de la nota describen planes e hipotesis, no resultados; citarlas como evidencia de mejoras seria un uso incorrecto del material.
- Sesgos conocidos: no disponibles, al no existir modelo ni dataset de entrenamiento. El unico sesgo documentable es el de seleccion de referencias y benchmarks propuestos por el autor, que no han sido validados.
- Riesgo de alucinacion: no aplica al repositorio, pero si a cualquier sistema que se construya citando su contenido sin verificar las referencias externas.
- Idiomas: no declarados; el material esta en ingles, lo que limita su uso directo en entornos en castellano sin traduccion.
- Licencia MIT: permite uso comercial y modificacion del documento, pero el propio autor advierte que los terminos de los datos de origen deben revisarse por separado cuando se combina con datasets externos.
- Para produccion: no apto. No hay garantias de mantenimiento (0 descargas, 1 like, sin actividad posterior a la creacion) ni versionado del contenido.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Wilflor2001/hw2-prompt-engineering
- Prompt Engineering Generative AI & LLM Models Fundamentals (Coursera): https://www.coursera.org/learn/prompt-engineering-generative-ai--llm-models-fundamentals
- arXiv:2401.14423, articulo sobre ingenieria de prompts en modelos generativos: https://arxiv.org/pdf/2401.14423
- arXiv:2402.07927, survey sobre tecnicas de prompting: https://arxiv.org/pdf/2402.07927
- Guia de prompt engineering de IBM: https://www.ibm.com/think/prompt-engineering
- Guia practica de prompt engineering (2026): https://www.moreonlinetools.com/en/blog/prompt-engineering-complete-guide/
