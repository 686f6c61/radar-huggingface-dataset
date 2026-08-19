# tntholley/zophiae-strawweight

## Resumen

ZophiaE Strawweight es un modelo de razonamiento lógico de 25,4 millones de parámetros desarrollado por tntholley, que opera a nivel de bytes con un vocabulario de 256 símbolos y sin tokenizador. Su propuesta central consiste en codificar las palabras como "bytes de concepto" antes del entrenamiento, de modo que el presupuesto de parámetros se invierte en razonar sobre significados en lugar de reconstruir fragmentos de texto. Está diseñado para ejecutarse íntegramente en CPU, con un runtime en Rust puro, y su objetivo es proporcionar razonamiento lógico calibrado en entornos locales, sin dependencias de nube.

El modelo se entrena con un corpus sintético verificado por oráculo, donde el 25% de las respuestas de entrenamiento son rechazos correctos ("no podemos decir"), lo que le confiere una calibración inusual: alcanza un 98,1% de precisión en sus rechazos. Su arquitectura es personalizada y no compatible con el ecosistema `transformers`, e incluye un traductor, un códec, un diccionario y un runtime propios. Se posiciona como una apuesta por la IA interpretable y especializada, con métricas verificadas sobre 2024 preguntas nunca vistas durante el entrenamiento.

Con 25.377.152 parámetros y una longitud de contexto no documentada, Strawweight es la clase más pequeña de la línea ZophiaE. Su relevancia actual radica en demostrar que el razonamiento lógico útil puede lograrse con modelos muy pequeños, entrenados en menos de dos horas en una GPU de consumo, y desplegados en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Personalizada, basada en concept-bytes (byte-level, sin tokenizador) |
| Parametros totales | 25.377.152 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones documentadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | holley-community-license-1.0 (otra) |
| Formato de pesos | safetensors, junto con pesos propietarios para el runtime propio |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal personalizada que opera directamente sobre bytes de concepto: un vocabulario de 256 simbolos donde cada byte representa aproximadamente un significado de palabra, y la gramatica se codifica como bytes de caracteristicas explicitas. Esto elimina la necesidad de un tokenizador y permite que los pesos se concentren en el razonamiento sobre significados. El entrenamiento se realizo con un corpus sintetico verificado por oraculo, equilibrado para que el rechazo sea una accion de primera clase: el 25% de las respuestas de entrenamiento son "no podemos decir" correctas. Se entreno en una unica GPU de consumo en menos de dos horas, aunque no se especifica el modelo exacto de GPU ni el numero de tokens del corpus.

La innovacion tecnica principal es la codificacion de conceptos en bytes, que hace que la atencion sea legible: cada posicion del contexto es un concepto etiquetado, permitiendo inspeccionar que relaciones atiende el modelo durante la generacion. El repositorio incluye herramientas de trazado que muestran, por cada byte generado, la distribucion de candidatos y la atencion por capa y cabeza. No se documenta el uso de tecnicas como RLHF o DPO; el entrenamiento se basa en datos sinteticos con verificacion por oraculo.

## Capacidades

- Razonamiento logico deductivo: evalua si una conclusion se sigue de las premisas, incluyendo condicionales y reglas de inferencia.
- Razonamiento aritmetico: realiza divisiones, conteos y comparaciones numericas, y ajusta sus veredictos segun los valores concretos.
- Veredictos de cuatro vias: responde SI, NO, UNKNOWN (desconocido) o OPEN (abierto), en lugar de forzar una respuesta binaria.
- Rechazo calibrado: cuando dice "no podemos decir", es correcto en el 98,1% de los casos, evitando confabulaciones.
- Cierre de marco (END discipline): aproximadamente el 99% de las respuestas cierran su propio marco, indicando explicitamente cuando la informacion es insuficiente.
- Interpretabilidad: atencion legible por byte, con herramientas de trazado que muestran los conceptos atendidos durante la generacion.
- Ejecucion local en CPU: no requiere GPU, nube ni Python para el runtime Rust; tambien incluye una version Python pura.

## Casos de uso

- Validacion de razonamiento logico en sistemas de ayuda a la decision: dado un conjunto de hechos y reglas, el modelo determina si una conclusion es verdadera, falsa o indeterminada, lo que permite auditar automaticamente razonamientos en dominios como cumplimiento normativo o diagnostico basado en reglas.
- Verificacion de consistencia en bases de conocimiento: puede evaluar si una afirmacion nueva es compatible con un conjunto de hechos conocidos, senalando contradicciones o lagunas de informacion.
- Educacion y tutoria en logica: genera explicaciones paso a paso de inferencias, mostrando el razonamiento detallado, y rechaza preguntas mal planteadas o con premisas insuficientes, lo que resulta util en plataformas de aprendizaje de logica formal.
- Auditoria de contratos o especificaciones tecnicas: analiza clausulas condicionales y determina si las condiciones se cumplen segun los hechos declarados, ayudando a detectar ambiguedades o inconsistencias.
- Control de calidad en generacion de texto con LLMs: actua como verificador logico externo que compara las conclusiones de un modelo de lenguaje grande con el razonamiento formal, identificando posibles alucinaciones o saltos logicos invalidos.
- Aplicaciones edge e IoT: al ejecutarse en CPU con un peso de 0,1 GB, puede desplegarse en dispositivos con recursos limitados (Raspberry Pi, routers, sensores) para razonamiento logico local sin conexion.
- Investigacion en interpretabilidad: su atencion legible permite estudiar como una red pequena representa relaciones logicas, sirviendo como banco de pruebas para tecnicas de analisis de mecanismos interpretables.

## Benchmarks y rendimiento

Se evaluaron 2024 preguntas frescas, verificadas por hash para garantizar que no aparecieron en ningun documento de entrenamiento. Los resultados publicados en la model card son:

| Metrica | Valor |
|---|---|
| Precision de veredicto de cuatro vias (SI / NO / UNKNOWN / OPEN) | 89,1% (suelo para un respondedor constante: 25%) |
| Precision de rechazo (cuando dice "no podemos decir", es correcto) | 98,1% |
| Respuestas que cierran su propio marco (disciplina END) | ~99% |
| Misma arquitectura con la mitad de datos de entrenamiento | 35,9% |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia: se ejecuta en CPU sin necesidad de GPU. El runtime Rust puro permite su uso en equipos sin aceleradores.
- RAM: no especificada, pero el repositorio ocupa 0,1 GB y el modelo tiene 25 millones de parametros, por lo que cabe en la memoria de cualquier ordenador moderno (estimacion inferior a 200 MB en RAM).
- GPU: no requerida para inferencia. Para entrenamiento se uso una unica GPU de consumo (modelo no especificado) en menos de dos horas.
- Opciones de despliegue: ejecutable Windows (`talkit.exe`), script Python (`run_strawweight.py`), servicio local (`talkit serve --port 8484`), y runtime Rust.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. El modelo utiliza una arquitectura y codificacion propietarias, por lo que no es directamente comparable con modelos transformers de tamano similar (por ejemplo, modelos de 25M de parametros como GPT-2 small o TinyLlama) en terminos de rendimiento en tareas generales de lenguaje. La especializacion en logica y su calibracion son sus diferenciadores, pero no existen benchmarks publicados que lo enfrenten a alternativas.

## Limitaciones y advertencias

- Solo soporta ingles; no hay soporte multilingue documentado.
- No es compatible con el ecosistema `transformers` ni con GGUF; requiere su propio stack de traduccion, codificacion y runtime.
- Especializado en logica y razonamiento formal; no es un modelo de lenguaje general y no genera texto creativo ni conversacional amplio.
- La longitud de contexto no esta documentada, lo que puede limitar su uso en problemas con muchas premisas.
- No soporta tool calling, agentes, vision, audio ni otras capacidades multimodales.
- El corpus de entrenamiento es sintetico, por lo que puede tener limitaciones en lenguaje natural complejo o ambiguo fuera de los patrones logicos.
- Licencia personalizada (holley-community-license-1.0) que debe revisarse detalladamente antes de cualquier uso comercial o redistribucion.
- No se documentan sesgos especificos, pero al ser un modelo pequeno entrenado en datos sinteticos, su generalizacion a dominios reales puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tntholley/zophiae-strawweight
- Repositorio GitHub con el stack completo: https://github.com/Laninthalesdran/Concept-as-Byte/tree/main/Talkit
- No se han publicado papers academicos ni demos adicionales en la informacion disponible.
