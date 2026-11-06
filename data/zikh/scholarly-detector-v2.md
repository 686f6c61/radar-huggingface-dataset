# zikh/scholarly-detector-v2

## Resumen

Scholarly AI-text detector v2 es un clasificador de texto disenado para detectar si fragmentos de articulos academicos han sido generados por modelos de lenguaje. Lo desarrolla el autor zikh y es el motor que alimenta la comprobacion "AI Content" de la plataforma scholar.click. El modelo puntua ventanas de tres frases y devuelve una probabilidad de generacion automatica, ejecutandose integramente en el servidor Node de Scholarly para que el texto de los articulos no salga del entorno del usuario.

La version 2 responde a una limitacion concreta de la v1: aquel modelo, entrenado con generadores hasta GPT-4 y Llama-2 (2023) y usando abstracts como texto humano de referencia, rendia al nivel del azar frente a modelos actuales y marcaba erroneamente una quinta parte de secciones humanas reales. La v2 incorpora 6.447 secciones de articulos, con texto humano anterior a 2021 y las mismas secciones reescritas por modelos Claude y GPT bajo cuatro tareas distintas.

El sistema no es un unico transformer, sino un ensemble de tres componentes (TF-IDF con regresion logistica, un DistilRoBERTa afinado en ONNX int8 y 44 caracteristicas de estilo de escritura) combinados mediante un stacker logistico. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache 2.0, con soporte exclusivo de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: TF-IDF + regresion logistica, DistilRoBERTa (ONNX int8) y 44 caracteristicas de estilo, combinados por un stacker logistico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (opera sobre ventanas de 3 frases) |
| Tipos de cuantizacion | ONNX int8 para el componente transformer |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (transformer) y JSON (tfidf.json, fusion.json, parity_fixtures.json) |

## Arquitectura y entrenamiento

El detector combina tres senales en un stacker logistico. La primera es un clasificador TF-IDF con regresion logistica, que captura patrones lexicos. La segunda es un DistilRoBERTa afinado y exportado a ONNX en cuantizacion int8, que aporta representaciones contextuales del fragmento. La tercera son 44 caracteristicas de estilo de escritura calculadas sobre el texto. La salida final es una probabilidad por ventana de tres frases.

El entrenamiento de la v2 anade 6.447 secciones de articulos academicos. Como texto humano se emplean secciones de papers creados en 2021 o antes; como texto sintetico, esas mismas secciones reescritas por Claude (Sonnet 5, Haiku 5.5, Haiku 4.5, Opus 5.5) y GPT (4o, 4o-mini, 5-mini) bajo cuatro tareas: escritura directa, peticion de estudiante, instruccion de "hacerlo sonar humano" y pulido. Claude Sonnet 5.5 y GPT-5.5 se reservaron por completo como conjunto de test de modelos no vistos. No se documentan detalles sobre RLHF, DPO ni el numero total de tokens de entrenamiento.

## Capacidades

- Clasificacion binaria de texto como generado por IA o escrito por humanos, expresada como probabilidad.
- Analisis por ventanas de tres frases, lo que permite localizar que fragmentos concretos de un documento presentan mayor probabilidad de generacion automatica.
- Deteccion sobre prosa academica formal en ingles, con calibracion especifica para abstracts y secciones de articulos.
- Robustez frente a texto reescrito con instrucciones de "hacerlo sonar humano" o pulido, ya que esas tareas forman parte del entrenamiento.
- Generalizacion parcial a modelos no vistos durante el entrenamiento (Sonnet 5.5 y GPT-5.5).
- Ejecucion local en Node mediante ONNX, sin dependencia de servicios externos de inferencia.
- Verificacion de paridad entre implementaciones Node y Python mediante el fichero `parity_fixtures.json`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto; es exclusivamente un clasificador.

## Casos de uso

- Revision editorial de manuscritos academicos: integrado en el flujo de envio de una revista, el detector puntua cada seccion del paper por ventanas de tres frases y senala al editor las zonas con probabilidad alta, manteniendo el texto dentro de la infraestructura del editor.
- Verificacion de integridad en plataformas de publicacion: scholar.click lo emplea como comprobacion "AI Content" sobre los articulos alojados, mostrando al autor una indicacion del grado de generacion automatica por seccion.
- Filtrado previo en repositorios de preprints: un servidor puede aplicar el detector antes de aceptar un envio y derivar a revision manual los documentos con secciones de probabilidad elevada, reduciendo la carga de moderacion.
- Auditoria de trabajos de estudiantes: instituciones que reciben ensayos o memorias en ingles pueden desplegar el modelo en local para obtener una senal complementaria, siempre como indicador y nunca como veredicto.
- Investigacion sobre deteccion de texto generado: el repositorio incluye fixtures de paridad que permiten reproducir puntuaciones y comparar implementaciones, util para estudios de robustez frente a distintos generadores.
- Control de calidad en pipelines de generacion asistida: un equipo que use LLM para redactar documentacion tecnica puede medir que proporcion del texto final conserva senales de generacion tras la edicion humana.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse como ONNX dentro de Node, encaja en servidores donde el texto no puede enviarse a APIs de terceros.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos a traves de la ruta de puntuacion de la propia aplicacion, con 400 documentos por conjunto:

| Metrica | v1 | v2 |
|---|---|---|
| IA moderna detectada (7 modelos) | 33,0 % | 84,0 % |
| Modelos no vistos detectados (Sonnet 5.5, GPT-5.5) | 13,5 % | 71,5 % |
| Secciones humanas de papers marcadas erroneamente | 20,3 % | 1,3 % |
| Abstracts humanos de arXiv marcados erroneamente | 1,8 % | 1,0 % |
| IA legacy detectada (generadores 2019-23) | 94,0 % | 87,5 % |
| ROC-AUC, modelos modernos | 0,499 | 0,983 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que se trata de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al tratarse de un DistilRoBERTa en ONNX int8 mas componentes TF-IDF y heuristicos, la huella es muy reducida y cabe holgadamente en CPU.
- GPU recomendadas: no necesarias; el modelo esta pensado para ejecutarse en el servidor Node, presumiblemente en CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime integrado en Node (uso previsto por el autor); el componente transformer puede ejecutarse tambien con ONNX Runtime en Python para verificar paridad.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Tamano del repositorio: 0,1 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Enfoque | Datos publicos de rendimiento |
|---|---|---|---|---|---|
| Scholarly detector v2 | Ensemble TF-IDF + DistilRoBERTa ONNX + heuristicas | en | Apache 2.0 | Deteccion de texto academico generado por IA | ROC-AUC 0,983 en modelos modernos; 84 % de deteccion |
| Detectores genericos de texto IA (p. ej. clasificadores RoBERTa de proposito general) | Transformer clasificador | multi/en | variable | Deteccion general de texto generado | no disponible en la informacion proporcionada |
| Clasificadores de estilo basados solo en perplexity (GPTZero y similares, propietarios) | Servicio propietario | en | propietaria | Deteccion general | no disponible en la informacion proporcionada |

No se dispone de datos verificables de modelos comparables de codigo abierto con la misma especializacion academica en la informacion proporcionada.

## Limitaciones y advertencias

- El detector devuelve una probabilidad, no una prueba; el propio autor advierte de que debe tratarse como indicador y nunca como veredicto sobre una persona.
- Solo cubre ingles.
- Los datos de IA moderna del entrenamiento provienen exclusivamente de Claude y GPT; no incluye Gemini, Llama 3+, Qwen ni DeepSeek, por lo que el rendimiento frente a esos generadores es incierto.
- El texto fuertemente editado despues de su generacion es mas dificil de detectar.
- La recall sobre generadores legacy (2019-23) cae unos 6 puntos respecto a la v1 (del 94,0 % al 87,5 %), como coste de dejar de leer la prosa academica formal como senal de IA.
- Riesgo de falsos positivos residual: el 1,3 % de secciones humanas y el 1,0 % de abstracts de arXiv se marcan erroneamente en los conjuntos de evaluacion.
- No se documentan sesgos especificos por dominio, disciplina o variedad de ingles mas alla de los conjuntos evaluados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias explicitas sobre el rendimiento en dominios distintos del academico.
- Al ser un modelo reciente con 0 descargas y 0 likes en Hugging Face, no existe validacion independiente de sus metricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zikh/scholarly-detector-v2
- Plataforma scholar.click: https://scholar.click
