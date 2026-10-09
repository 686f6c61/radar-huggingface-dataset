# zeechimp/holo-antimemory

## Resumen

holo-antimemory es una librería de memoria asociativa escrita en Python sobre NumPy, publicada por el usuario zeechimp (Sylv Q) en HuggingFace. No es un modelo de lenguaje ni una red neuronal entrenada: es una implementación de computación hiperdimensional (hyperdimensional computing, HDC) y arquitectura vector-simbólica (vector-symbolic architecture, VSA) cuyo objetivo es representar la negación como un objeto de primera clase dentro de un almacén de conocimiento. En lugar de limitarse a registrar presencia («este hecho está en el almacén»), mantiene dos trazas independientes de afirmaciones y negaciones en un espacio vectorial complejo de dimensión D, y devuelve uno de cuatro veredictos: YES, NO, UNKNOWN o AMBIGUOUS.

El problema que aborda es concreto: los almacenes de memoria convencionales son conjuntos, de modo que confunden «X es falso» con «no sé nada de X», porque ambos casos se representan como ausencia del elemento. Al separar el peso positivo y el peso negativo de cada ítem, la librería puede registrar que dos fuentes se contradicen sobre un mismo hecho y reportar el conflicto en lugar de resolverlo silenciosamente. Esto resulta útil en bases de conocimiento con fuentes discrepantes, en agentes que reciben evidencia contradictoria y en el seguimiento de cambios a lo largo del tiempo.

Es relevante ahora por su carácter educativo y de investigación dentro del ecosistema VSA/HDC, un área que recibe atención como alternativa ligera y simbólica a los almacenes vectoriales clásicos. Se distribuye con licencia Apache-2.0, declara únicamente inglés, tiene 0 descargas y 1 like en el momento de la consulta, y su pipeline declarado en HuggingFace es feature-extraction. No publica pesos preentrenados ni dataset de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Memoria asociativa en espacio vectorial de alta dimensión (computación hiperdimensional / vector-symbolic architecture); no es una red neuronal con pesos entrenados |
| Parámetros totales | no disponible (no es un modelo parametrizado; la dimensión por defecto de los vectores es D=2048) |
| Parámetros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica (no hay ventana de contexto; el almacén acumula ítems de forma aditiva en las trazas P_yes y P_no) |
| Tipos de cuantización | no aplica (implementación NumPy en coma flotante; no se publican esquemas de cuantización) |
| Idiomas soportados | en (los ítems son identificadores o cadenas de texto; el idioma efectivo depende del usuario) |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica / no disponible (se distribuye código Python, no pesos; dependencia obligatoria de numpy y opcional de matplotlib) |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido habitual: no hay dataset (`datasets: []` en la model card), no hay fases de preentrenamiento, ajuste supervisado, RLHF ni DPO. El sistema es un constructor determinista basado en operaciones vectoriales simbólicas. El almacén consiste en un único espacio vectorial complejo de dimensión D que contiene dos trazas independientes: `P_yes = sum_i w_i * bind(item_i, item_i)` y `P_no = sum_i v_i * bind(item_i, item_i)`. Cada llamada a `store` suma peso a la traza positiva y cada llamada a `deny` suma peso a la traza negativa, de modo que un mismo ítem puede acumular señal en ambas.

La consulta de un ítem X lee las dos trazas y calcula una proyección cruda (`raw_yes`, `raw_no`) junto con su diferencia (`margin`). El parámetro `margin` funciona como umbral que decide cuándo dos pesos son «suficientemente parecidos» como para declarar contradicción. La innovación técnica destacable es que la lectura combina invariancia de escala (coseno) con proyección cruda no invariante, lo que permite recuperar el peso almacenado y no solo la dirección. La model card indica que un autotest verifica esta propiedad y que, con D=2048 y margin=0.15, la proyección cruda recupera los pesos con dos decimales de precisión. Los valores por defecto del constructor son `AntiMemory(d=2048, margin=0.15)`.

## Capacidades

- Almacenamiento de hechos afirmados (`store`) y negados (`deny`) de forma independiente.
- Consulta con cuatro veredictos excluyentes: YES (afirmado), NO (negado), UNKNOWN (ni afirmado ni negado, o ambos por debajo del umbral) y AMBIGUOUS (afirmado y negado con peso comparable).
- Detección de contradicciones: los ítems con peso en ambos lados se detectan y se ordenan por puntuación de conflicto (1.0 = perfectamente equilibrado, 0.0 = un lado domina).
- Recuperación de pesos (weight recovery): la consulta expone `raw_yes`, `raw_no` y `margin` al invocador, con recuperación a dos decimales según los resultados publicados.
- Soporte de pesos ponderados y acumulación por repetición (almacenar cinco veces un hecho produce `raw_yes ≈ +5.03`).
- Denegación a nivel de entidad: negar todos los hechos asociados a una entidad genera contradicciones equilibradas para cada uno de ellos.
- Extracción de características: los veredictos y los pesos crudos pueden consumirse como señal estructurada en un pipeline (pipeline declarado: feature-extraction).
- Interfaz de línea de comandos con parámetros `--output` y `--margin`, que ejecuta diez demostraciones y escribe los resultados en un directorio.

No dispone de generación de texto, razonamiento multi-step, tool calling ni function calling, capacidades de visión o audio, ni soporte multilingüe más allá del inglés declarado.

## Casos de uso

- Bases de conocimiento con fuentes discrepantes: si dos fuentes afirman y niegan el mismo hecho, el almacén registra ambos pesos y la consulta devuelve AMBIGUOUS con los pesos crudos, permitiendo auditar el conflicto en lugar de sobrescribir un valor.
- Agentes que reciben evidencia contradictoria: el agente puede conservar señal positiva y negativa sobre una misma hipótesis y delegar en su política la resolución, en lugar de que la capa de memoria colapse la información.
- Seguimiento de cambios temporales: un hecho afirmado en una sesión y negado en otra queda registrado como contradicción, preservando el historial en vez de colapsarlo a un único estado.
- Conocimiento negativo explícito: distinguir «sé que X es falso» (NO) de «no sé nada de X» (UNKNOWN), algo que un almacén basado en conjuntos no puede expresar.
- Verificación de hechos con revisión humana: usar la puntuación de conflicto para priorizar qué afirmaciones enviar a un revisor, ya que los ítems con conflicto cercano a 1.0 son los candidatos más claros a disputa.
- Memoria de trabajo en pipelines de agentes: registrar hechos y sus retractaciones dentro de una sesión y consultar el estado consolidado antes de cada decisión, usando los pesos como señal de confianza relativa.
- Investigación y docencia sobre VSA/HDC: el paquete sirve como material reproducible para ilustrar binding, superposición y lectura por proyección, con diez demostraciones ejecutables desde la CLI.
- Extracción de características para clasificadores posteriores: los cuatro veredictos y los pesos crudos pueden alimentar modelos posteriores que necesiten una representación explícita de soporte y refutación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, y no serían aplicables al tratarse de una librería de memoria y no de un modelo generativo. Los únicos datos publicados son autotests del propio autor, ejecutados con D=2048 y margin=0.15.

Taxonomía de veredictos:

| Ítem | Peso (yes/no) | Veredicto | raw_yes | raw_no | margin |
|---|---|---|---|---|---|
| asserted_only | 1.0 / 0.0 | YES | +1.026 | +0.003 | +1.024 |
| denied_only | 0.0 / 1.0 | NO | -0.001 | +1.023 | -1.024 |
| both_sides | 1.0 / 1.0 | AMBIGUOUS | +1.026 | +1.023 | +0.004 |
| never_seen | 0.0 / 0.0 | UNKNOWN | 0.000 | 0.000 | 0.000 |

Detección de contradicciones (puntuación de conflicto):

| Ítem | Peso (yes/no) | Conflicto |
|---|---|---|
| fact_a | 1.00 / 1.00 | 1.000 |
| fact_b | 1.00 / 1.00 | 1.000 |
| fact_d | 1.00 / 0.30 | 0.462 |

Afirmaciones ponderadas:

| Ítem | Peso (yes/no) | raw_yes | raw_no | margin | Veredicto |
|---|---|---|---|---|---|
| common_belief | 1.00 / 0.30 | +0.982 | +0.267 | +0.714 | YES |
| balanced_debate | 1.00 / 1.00 | +0.981 | +0.954 | +0.027 | AMBIGUOUS |
| weak_assertion | 0.20 / 0.20 | +0.249 | +0.224 | +0.025 | AMBIGUOUS |
| strong_denial | 0.00 / 5.00 | -0.012 | +4.990 | -5.002 | NO |

Almacenamiento y denegación repetidos: `often_asserted` (5 almacenamientos) alcanza `raw_yes = +5.03`; `sometimes_denied` (2 denegaciones) alcanza `raw_no = +2.00`; un ítem sesgado (1.0 frente a 0.2) resuelve a YES con margin=0.15 porque la diferencia cruda (0.886) supera el umbral. Las métricas declaradas en la model card son verdict-accuracy, contradiction-detection y weight-recovery.

## Requisitos de hardware

- VRAM: no aplica. La librería no requiere GPU; la dependencia obligatoria es NumPy y la opcional matplotlib.
- GPU recomendadas: ninguna. Funciona en CPU.
- Compatibilidad con GPU de consumo: no aplica (no hay modelo que acelerar).
- Memoria RAM: no disponible; depende de la dimensionalidad D, del número de ítems almacenados y del tipo de dato empleado, extremos que no se documentan.
- Opciones de despliegue: instalación vía `pip install numpy` (y `pip install matplotlib` para el gráfico resumen) e importación del paquete `holo_antimemory`, o ejecución directa del script `holo_antimemory.py` con los parámetros `--output` y `--margin`.
- Latencia y throughput: no disponible. No se publican mediciones de rendimiento.

## Comparativa con modelos similares

No se han publicado resultados comparativos frente a otras implementaciones. La comparación se limita al modelo semántico de representación, ya que las alternativas habituales (almacenes vectoriales tipo FAISS o Chroma, bases de datos de tripletas y diccionarios de hechos) no publican métricas equivalentes de verdict-accuracy ni de recuperación de pesos en este contexto.

| Alternativa | Estados representables | Negación explícita | Contradicción consultable | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| holo-antimemory | YES, NO, UNKNOWN, AMBIGUOUS | Sí, traza propia | Sí, con puntuación de conflicto | no aplica | Apache-2.0 | Código en HuggingFace, 0 descargas |
| Almacén basado en conjuntos (p. ej. diccionario de hechos) | presente / ausente | No | No | no aplica | depende de la implementación | genérico |
| Índice vectorial de similitud (p. ej. FAISS, Chroma) | recuperación por vecindad | No | No | no disponible | depende de la implementación | ampliamente disponible |
| Base de datos de tripletas (RDF/SPARQL) | tripleta presente o ausente | Solo mediante modelado explícito | No de forma nativa | no aplica | depende de la implementación | ampliamente disponible |

Los valores de rendimiento y las especificaciones numéricas de las alternativas figuran como no disponibles porque no se han consultado ni se aportan en la información proporcionada.

## Limitaciones y advertencias

- Proyecto educativo y de investigación: 0 descargas y 1 like en el momento de la consulta, sin validación externa ni revisión por pares documentada.
- Los únicos resultados publicados son autotests del autor (diez demostraciones), no evaluaciones independientes; las métricas verdict-accuracy, contradiction-detection y weight-recovery no se acompañan de protocolos de evaluación detallados.
- No es un modelo de lenguaje: no genera texto, no razona sobre lenguaje natural y no mantiene conversaciones. Los ítems se tratan como identificadores.
- Idioma: solo se declara inglés; no hay soporte multilingüe.
- El veredicto depende críticamente del hiperparámetro `margin` (0.15 por defecto). Un valor mal elegido puede degradar casos legítimos a AMBIGUOUS o resolver contradicciones reales como YES o NO.
- Escalabilidad no documentada: al ser las trazas una superposición aditiva, el ruido cruzado entre ítems (crosstalk) tiende a crecer con el número de elementos almacenados; no se publican pruebas con volúmenes grandes ni curvas de degradación.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los pesos recuperados por proyección cruda puedenmezclarse con señal de otros ítems si el almacén crece, y no se documenta un mecanismo de limpieza o decaimiento.
- La model card aparece truncada en la sección de denegación a nivel de entidad, por lo que parte de los resultados anunciados no son verificables en la información disponible.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de licencia y atribución; no se declaran restricciones adicionales.
- No hay integración con frameworks de agentes, tool calling ni servidores de inferencia (vLLM, TGI, Ollama); el uso es por importación de Python o CLI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zeechimp/holo-antimemory
- Perfil del autor: https://huggingface.co/zeechimp
- Listado de modelos del autor: https://huggingface.co/zeechimp/models
- Otro modelo del mismo autor (hv-multimodal-audio-text-v1): https://huggingface.co/zeechimp/hv-multimodal-audio-text-v1
- Ficha de un modelo relacionado del mismo autor (zee, hv-intent-router): https://free2aitools.com/model/zeechimp/zee
- No se han encontrado en la búsqueda web artículos, papers ni repositorios específicos de holo-antimemory. Los resultados devueltos sobre HoloLLM (arXiv 2505.17645) y el Hailo Model Zoo corresponden a proyectos distintos sin relación con esta librería.
