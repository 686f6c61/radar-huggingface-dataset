# Zhaoming213/SexPorn

## Resumen

SexPorn es un modelo de generacion de texto en chino publicado en HuggingFace por el usuario Zhaoming213, con ZeLi111 como colaborador. Se trata de un modelo de lenguaje de tipo decoder-only y tamano reducido: su configuracion declarada es de 768 dimensiones ocultas, 8 capas y 8 cabezales de atencion, con una longitud maxima de secuencia de 512 tokens. El repositorio ocupa 0,2 GB y los pesos se distribuyen en formato safetensors, convertidos segun el autor al formato "Transformers-Llama" para poder cargarse con cargadores estandar.

El objetivo declarado del proyecto no es la calidad tecnica ni el rendimiento en tareas de razonamiento, sino la ausencia de filtros: el autor sostiene que los modelos comerciales aplican rechazos excesivos y presenta este modelo como una alternativa "sin restricciones" en materia de contenido. La model card incluye un ejemplo de salida con contenido sexual explicito en chino, ademas de una tabla comparativa cualitativa de "tasas de rechazo" entre modelos comerciales que carece de metodologia, de cifras y de verificacion independiente.

El modelo se publica bajo licencia MIT, con la etiqueta de idioma `zh` y la tarea `text-generation`. En el momento de la consulta acumula 0 descargas y 0 likes, y no se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens vistos ni ninguna evaluacion cuantitativa. La busqueda web realizada no ha devuelto ningun resultado relacionado con el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; el autor indica que los pesos se han convertido a formato "Transformers-Llama". No se detalla el tipo exacto de atencion ni de normalizacion |
| Parametros totales | No publicados. Estimacion derivada de la configuracion (hidden_size 768, 8 capas, 8 cabezales) y del tamano del repositorio (0,2 GB, compatible con pesos en fp16): del orden de 90-110 M |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (max_seq_len declarado) |
| Tipos de cuantizacion | No documentados por el autor. Los pesos se publican en safetensors sin indicar la precision; no se han publicado convertidos GGUF ni cuantizaciones oficiales |
| Idiomas soportados | Chino (`zh`), segun la etiqueta del repositorio. No hay datos sobre otros idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (etiqueta del repositorio), convertidos a formato "Transformers-Llama" |
| Hidden size | 768 |
| Capas ocultas | 8 |
| Cabezales de atencion | 8 |
| Tamano del repositorio | 0,2 GB |
| Hardware de entrenamiento | 2 x NVIDIA T4 de 16 GB; mas de 24 horas de preentrenamiento declaradas |
| Fecha de publicacion | 13 de septiembre de 2026 (alta), ultima actualizacion el 13 de septiembre de 2026, segun los metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion publicada describe un transformer decoder-only con 768 dimensiones ocultas, 8 capas y 8 cabezales de atencion, lo que situa el modelo en la franja de los modelos pequenos de tipo GPT-2. El autor no especifica la funcion de activacion, el esquema de normalizacion, si se emplea atencion con sesgo causal estandar ni el tamano del vocabulario. Se indica que los pesos se han convertido al formato "Transformers-Llama", lo que sugiere compatibilidad con la clase de modelo Llama de la libreria transformers, aunque no se documenta si la arquitectura interna conserva parametros propios de esa familia (por ejemplo, RoPE o RMSNorm).

En cuanto al entrenamiento, lo unico declarado es el uso de 2 GPU T4 de 16 GB durante mas de 24 horas en una fase de preentrenamiento. No se indica el numero de tokens procesados, la composicion del corpus, el idioma exacto de los datos, la existencia de fases de ajuste supervisado, RLHF o DPO, ni si se aplicaron filtros de contenido en la recoleccion de datos. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o variantes hibridas. El unico material adicional de la model card son dos utilidades externas del mismo autor (un exportador de conversaciones de ChatGPT y un bloqueador de rechazos), sin relacion con la arquitectura del modelo.

## Capacidades

- Generacion de texto en chino con estilo conversacional y narrativo, segun el ejemplo incluido en la model card.
- Generacion de contenido sexual explicito en chino: es la capacidad que el autor presenta de forma explicita como proposito del proyecto, al no aplicar filtros de contenido.
- Continuacion de texto libre dentro de una ventana de 512 tokens.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso o uso de herramientas externas.
- No se declaran capacidades de vision, audio, ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue: no documentada; la unica etiqueta de idioma es `zh`.
- Capacidades de codigo y matematicas: no documentadas ni evaluadas.
- No se documenta un formato de chat con plantilla de tokens especiales; el ejemplo de la model card usa etiquetas de usuario y asistente en texto plano.

## Casos de uso

- Investigacion sobre alineacion y filtros de contenido: el modelo permite estudiar empiricamente como varia la tasa de rechazo de un modelo pequeno sin ajuste de seguridad frente a modelos con RLHF, siempre que la evaluacion se realice en un entorno controlado y con supervision etica.
- Red teaming y evaluacion de seguridad: puede emplearse como generador de prompts y respuestas de riesgo en chino para medir la robustez de clasificadores de moderacion, dentro de un protocolo de laboratorio con registro de auditoria.
- Generacion de corpus negativo para entrenar clasificadores de contenido: sus salidas pueden etiquetarse como ejemplos de contenido no seguro y alimentar un dataset de clasificacion binaria, con revision humana obligatoria antes de cualquier uso.
- Investigacion linguistica sobre generacion de texto en chino sin ajuste por instrucciones: sirve como caso base de bajo coste para comparar fluidez, repeticion y coherencia con modelos chinos de tamano similar que si han pasado por SFT.
- Experimentacion docente sobre el ciclo completo de entrenamiento: con ~90-110 M de parametros y 0,2 GB de pesos, es viable reproducir el flujo preentrenamiento, conversion de formato y despliegue en una unica GPU de consumo dentro de un curso de introduccion a LLM.
- Pruebas de infraestructura de inferencia: por su tamano, permite validar pipelines de transformers, serializacion safetensors y cuantizacion posterior sin consumir recursos significativos, antes de migrar a modelos mayores.
- Aplicaciones de ficcion y escritura creativa en chino: uso restringido a contenido legal y consentido, teniendo en cuenta que el modelo no incorpora ninguna salvaguarda y que la responsabilidad recae integramente en quien lo despliega.
- Despliegue local y offline: al caber en CPU y en cualquier GPU de gama baja, puede ejecutarse en entornos aislados sin conexion para experimentos que requieran confidencialidad de los datos de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K, C-Eval, CMMLU ni de ninguna otra evaluacion estandar, ni para el modelo base ni para variantes ajustadas.

La model card incluye una tabla cualitativa que compara "tasa de rechazo", "censura" y "correccion politica" entre este modelo y diversos asistentes comerciales (ChatGPT, Claude, Gemini, Grok, Mistral, DeepSeek, Qwen, Kimi, entre otros). Esa tabla no aporta cifras, no describe metodologia, no indica el conjunto de prompts empleado ni el criterio de clasificacion, y no ha sido verificada de forma independiente, por lo que no constituye un benchmark de rendimiento y no se reproduce aqui como dato tecnico.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones derivadas de la configuracion declarada, no confirmadas por el autor): en fp32 en torno a 0,4 GB; en fp16/bf16 en torno a 0,2 GB; en int8 en torno a 0,1 GB; en int4 en torno a 0,05 GB.
- Cache KV a 512 tokens: aproximadamente 12,6 MB en fp16, asumiendo head_dim de 96 (768/8) y 8 capas. El consumo de memoria por contexto es practicamente despreciable.
- GPU recomendadas: no requiere hardware de datacenter. Cualquier GPU con 4 GB o mas de VRAM es suficiente (GTX 1050 Ti, RTX 3050, RTX 3060, RTX 4090, A100, H100 funcionan sin problema, aunque el hardware esta muy sobredimensionado).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, y tambien en CPU con un rendimiento aceptable por el reducido numero de parametros.
- Hardware empleado por el autor para el preentrenamiento: 2 x NVIDIA T4 de 16 GB durante mas de 24 horas.
- Opciones de despliegue: `transformers` con la tarea `text-generation` es la via documentada implicitamente (formato "Transformers-Llama"). vLLM y TGI serian compatibles a priori por el formato de pesos, pero no hay verificacion publicada. La conversion a GGUF para llama.cpp u Ollama no esta publicada ni documentada; seria necesario generarla.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia en ninguna configuracion.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos medidos de modelos comparables, y los resultados de busqueda web no aportan ninguna comparativa relacionada con este modelo. Para no introducir cifras no verificadas, las columnas correspondientes a alternativas se marcan como no disponibles.

| Criterio | SexPorn | Alternativas de la misma franja (100 M - 1 B, chino) |
|---|---|---|
| Parametros | Del orden de 90-110 M (estimacion derivada) | No disponible |
| Longitud de contexto | 512 tokens | No disponible |
| Rendimiento en benchmarks | Sin datos publicados | No disponible |
| Datos de entrenamiento | No documentados (2 x T4, >24 h de preentrenamiento) | No disponible |
| Licencia | MIT | No disponible |
| Disponibilidad | HuggingFace, 0 descargas, 0 likes | No disponible |
| Ajuste de seguridad | Inexistente por diseno | No disponible |

Categorias de comparacion que resultarian pertinentes, sin datos numericos en la informacion analizada: modelos pequenos de la familia Qwen, TinyLlama y otras alternativas de menos de 1 B de parametros con soporte nativo de chino y contexto muy superior a 512 tokens; y modelos de la comunidad etiquetados como "uncensored", que comparten el enfoque de ausencia de filtros pero no la escala ni el idioma.

## Limitaciones y advertencias

- Ausencia total de filtros de seguridad: el modelo no incorpora ninguna barrera de moderacion, y ese es precisamente su proposito declarado. Puede generar contenido sexual explicito, y potencialmente contenido legalmente perseguible si se le solicita (por ejemplo, material que describa abusos o violencia sexual). En Espana, la generacion o difusion de determinados contenidos esta tipificada en el Codigo Penal, con independencia del modelo empleado y de su licencia.
- Riesgo legal y de responsabilidad: la licencia MIT exime de responsabilidad a los autores, y la propia model card declara que las consecuencias del uso recaen sobre el usuario. Esto incluye el cumplimiento del RGPD y de la normativa espanola y europea aplicable si se procesan datos personales.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos, y al no documentarse el corpus de entrenamiento ni su procedencia no es posible estimar que sesgos de genero, etnicos o de otro tipo incorpora el modelo.
- Alucinacion: un modelo de ~100 M de parametros preentrenado sin ajuste por instrucciones tiene una probabilidad alta de producir texto incoherente, repetitivo o factualmente incorrecto. No es adecuado para tareas que requieran veracidad.
- Limitacion de contexto severa: 512 tokens es una ventana muy reducida, insuficiente para conversaciones multi-turno largas, resumen de documentos, analisis de codigo o cualquier tarea con entrada extensa.
- Limitacion idiomatica: solo se declara chino. No hay evidencia de un rendimiento util en castellano ni en otras lenguas.
- Ausencia de formato de chat: no se documenta plantilla de tokens ni delimitadores, por lo que el comportamiento conversacional depende de como se formatee el prompt y es poco predecible.
- Reproducibilidad: no se publican el dataset, el tokenizador, los hiperparametros ni las curvas de entrenamiento, lo que impide reproducir o auditar el modelo. Los metadatos indican 0 descargas y 0 likes, por lo que no existe una comunidad que haya validado su funcionamiento.
- Incoherencia en los metadatos: las fechas de creacion y actualizacion del repositorio figuran como septiembre de 2026, posteriores a la fecha de publicacion de la informacion analizada. Conviene verificar la fidelidad de esos campos en la pagina de HuggingFace.
- Inexistencia de cuantizaciones oficiales: no hay GGUF ni cuantizaciones publicadas, por lo que cualquier despliegue con llama.cpp, Ollama o similar exige una conversion previa y su validacion.
- Cualquier uso en produccion orientado al usuario final requeriria una capa de moderacion propia, filtrado de entrada y salida, registro de auditoria y evaluacion legal especifica por jurisdiccion.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Zhaoming213/SexPorn
- Perfil del colaborador declarado (ZeLi111): https://huggingface.co/ZeLi111
- Herramienta de exportacion de conversaciones de ChatGPT citada en la model card: https://github.com/tom12191h5/Export-ChatGPT-Dialogue
- Plugin "ChatGPT-Refuse-Blocker" citado en la model card: https://github.com/tom12191h5/ChatGPT-Refuse-Blocker
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. Los resultados devueltos corresponden al sitio neerlandes de arte kunststukken101.nl, sin relacion con este repositorio.
