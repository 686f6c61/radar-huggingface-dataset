# thesimonharms/mclass

## Resumen

mclass es un modelo de clasificación de texto desarrollado por el usuario thesimonharms, publicado en HuggingFace bajo licencia MIT. Su función es extraer y clasificar preferencias de codificación a partir de texto de usuario, mensajes de un harness (el agente o entorno que ejecuta al asistente) y fragmentos de código en formato diff. No genera texto libre: escribe etiquetas tipadas acompañadas de un porcentaje de confianza.

El modelo parte de sentence-transformers/all-MiniLM-L6-v2, un encoder transformer MiniLM, al que se le aplicaron adaptadores LoRA de rango 8 sobre las dos últimas capas y que después se fusionaron, añadiendo dos cabezas de clasificación sobre el embedding con mean pooling: una cabeza `kind` con cuatro clases y una cabeza `category` con diez clases. La única salida textual es la etiqueta; el extractor copia la frase candidata del texto del usuario o de una plantilla de diff, de modo que el encoder nunca inventa una frase de preferencia.

Es relevante para equipos que construyen asistentes de programación y necesitan decidir qué instrucciones del usuario merecen persistir como reglas duraderas y cuáles son meras correcciones puntuales. El modelo es pequeño (el repositorio completo ocupa 0,2 GB), exportable a ONNX y desplegable en CPU, lo que lo hace apto como componente de filtrado dentro de un pipeline mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer MiniLM (base: sentence-transformers/all-MiniLM-L6-v2) con adaptadores LoRA fusionados y dos cabezas de clasificacion (kind y category) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el limite se configura en mclass.json como max length) |
| Tipos de cuantizacion | no disponible (se distribuye un grafo ONNX exportado, ademas de pesos en safetensors y heads.pt) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (carpeta encoder/), PyTorch .pt (heads.pt), ONNX (model.onnx), JSON de configuracion (mclass.json, eval.json) |
| Tarea (pipeline) | text-classification |
| Tamano del repositorio | 0,2 GB |
| Pooling | mean pooling sobre la salida de MiniLM |
| Etiquetas de kind | durable, session, task, correction |
| Etiquetas de category | cli, language, architecture, testing, style, tooling, naming, git, docs, other |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-21 / 2026-09-21 |

## Arquitectura y entrenamiento

mclass sigue un esquema de dos etapas descrito por el autor como «extract-then-classify». La primera etapa extrae texto candidato del mensaje del usuario o de una plantilla de diff; la segunda lo pasa por un encoder MiniLM con mean pooling y dos cabezas lineales que producen logits de `kind` y de `category`. La confianza se calcula como P(durable) después de aplicar temperature scaling, y el campo booleano `preference` solo es verdadero cuando `kind` es exactamente `durable`. El autor insiste en que el encoder no genera frases de preferencia, solo clasifica texto ya extraído.

En cuanto al entrenamiento, la model card indica que se usó LoRA de rango 8 sobre las dos últimas capas del encoder y que los adaptadores se fusionaron en los pesos finales. Una nota técnica relevante: la retropropagación completa a través del encoder puede producir NaN en la GPU gfx1151 (iGPU AMD), por lo que existe una configuración alternativa de solo cabezas (`--lora-r 0 --unfreeze-last 0`). No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO; esos datos figuran como no disponibles. El repositorio incluye `eval.json` con las últimas métricas medidas, pero no se documenta el proceso de anotación ni el origen de los datos.

## Capacidades

- Clasificación de texto en inglés para la tarea concreta de preferencias de codificación.
- Extracción y etiquetado de cuatro tipos de mensaje mediante la cabeza `kind`: `durable`, `session`, `task` y `correction`.
- Categorización temática en diez clases mediante la cabeza `category`: `cli`, `language`, `architecture`, `testing`, `style`, `tooling`, `naming`, `git`, `docs` y `other`.
- Cálculo de un porcentaje de confianza calibrado con temperature scaling (P(durable)).
- Entrada estructurada con tres campos: `user` (texto del usuario), `harness` (lista de mensajes del entorno) y `code` (lista de hunks de diff).
- Servicio HTTP propio mediante `mclass serve --port 8091 --artifacts artifacts`, con endpoint `POST /v1/classify`.
- Inferencia en entornos sin PyTorch gracias al grafo ONNX exportado.
- Compatibilidad declarada con endpoints de HuggingFace (etiqueta `endpoints_compatible`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de razonamiento explícito (thinking mode).
- No tiene capacidades de visión ni de audio.
- No es multilingüe: solo inglés.

## Casos de uso

- Aprendizaje de preferencias en asistentes de código por CLI: el modelo recibe el mensaje del usuario y el diff de la sesión y decide si la instrucción es una preferencia duradera (`durable`) o solo una corrección puntual (`correction`), de modo que el asistente no convierta cada queja en una regla permanente.
- Memoria persistente de agentes de programación: solo las entradas con `preference = true` se escriben en el almacén de reglas a largo plazo; el resto se descarta al terminar la sesión, reduciendo el ruido acumulado en el contexto.
- Enrutado de reglas de estilo y linting: las categorías `style`, `naming` y `language` permiten dirigir cada preferencia al fichero de configuración correspondiente (por ejemplo, reglas de formato frente a reglas de arquitectura) sin intervención manual.
- Análisis de telemetría en editores e IDEs: agregar la distribución de categorías a lo largo del tiempo para saber qué tipo de instrucciones dan los desarrolladores y ajustar la documentación o la UX del producto.
- Filtrado de retroalimentación en revisiones de código: clasificar comentarios de pull requests y separar convenciones de proyecto (útiles) de comentarios de tarea concreta (no reutilizables).
- Deduplicación y normalización de correcciones: agrupar entradas etiquetadas como `correction` por categoría para detectar patrones repetidos antes de promoverlos manualmente a reglas duraderas.
- Despliegue en local o en el borde: al exportarse a ONNX y ocupar un repositorio de 0,2 GB, puede ejecutarse dentro del propio entorno de desarrollo del usuario, sin enviar código propietario a servicios externos.
- Construcción de datasets etiquetados: usar las etiquetas y el porcentaje de confianza como preanotación para generar corpus de preferencias de codificación a mayor escala.

## Benchmarks y rendimiento

Los únicos resultados publicados son los de la model card, correspondientes a la última ejecución con LoRA (mean pool, adaptadores en las dos últimas capas). No se aportan métricas estándar tipo MMLU, HumanEval o GSM8K, que no aplican a un clasificador de este tipo.

| Slice | Metrica | Encoder | Bayes con los mismos datos |
|---|---|---|---|
| test | kind accuracy | 1.000 | — |
| test | durable F1 | 1.000 | — |
| user-text | durable F1 | 1.000 | 0,920 |
| gold (n = 65) | kind accuracy | 0,985 | — |
| gold | preference accuracy | 1.000 | — |
| ood (n = 40) | kind accuracy | 1.000 | — |
| ood | preference accuracy | 1.000 | — |

## Requisitos de hardware

- El repositorio completo ocupa 0,2 GB, por lo que la inferencia en FP32 requiere muy poca memoria (por debajo de 1 GB de VRAM o RAM en cualquier configuración razonable, incluyendo el grafo ONNX).
- Cabe sin problema en GPU de consumo: cualquier tarjeta con al menos 2 GB de VRAM es suficiente; también es viable en CPU y en iGPU. En las notas de entrenamiento se menciona una gfx1151 (iGPU AMD) como entorno problemático solo para el entrenamiento, no para la inferencia.
- No se especifican GPU recomendadas por el autor; las gamas altas tipo A100 o H100 no aportan ventaja apreciable para un encoder de este tamaño.
- Opciones de despliegue: ONNX Runtime para el grafo `model.onnx`, Transformers para el encoder más `heads.pt` para las cabezas, y el servidor HTTP propio del paquete (`mclass serve`, puerto 8091). También se declara compatibilidad con endpoints de HuggingFace.
- vLLM, llama.cpp, Ollama y TGI no aplican, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. No se publican medidas de tiempo por petición ni de peticiones por segundo.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La tabla siguiente recoge únicamente lo que puede afirmarse con los datos disponibles.

| Modelo | Parametros | Contexto | Tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thesimonharms/mclass | no disponible | no disponible | Clasificacion de preferencias de codificacion (4 clases de kind, 10 de category) | durable F1 1.000 en test segun la model card | MIT | HuggingFace, 0 descargas, 0 likes |
| sentence-transformers/all-MiniLM-L6-v2 (modelo base) | no disponible | no disponible | Sentence embeddings de proposito general | No comparable: mclass es un fine-tuning sobre este modelo | MIT (segun la ficha del modelo base enlazado) | HuggingFace |
| Clasificadores especializados de preferencias de codigo | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Cobertura lingüística limitada al inglés; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Dominio muy estrecho: solo clasifica preferencias de codificación, no es un modelo de propósito general ni un LLM.
- Por diseño no genera frases de preferencia; si el extractor no encuentra texto candidato, la clasificación no puede producir una preferencia útil.
- Los conjuntos de evaluación son muy pequeños (gold n = 65, ood n = 40), lo que limita la significación estadística de las métricas.
- La puntuación perfecta en el slice de test (kind accuracy y durable F1 de 1.000) frente a un clasificador Bayes con los mismos datos que obtiene 0,920 en user-text sugiere que el conjunto de test puede ser sintético o muy cercano a la distribución de entrenamiento; no debe extrapolarse a producción.
- El repositorio acumula 0 descargas y 0 likes, por lo que no existe validación independiente por parte de la comunidad.
- Las fechas de creación y actualización declaradas (2026-09-21) son posteriores a la fecha habitual de consulta; conviene verificar la vigencia del repositorio antes de integrarlo.
- No hay información sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación de etiqueta: al ser un clasificador, la salida siempre será una de las clases definidas, incluyendo `other`, que puede absorber casos ambiguos sin señalizar incertidumbre más allá del porcentaje de confianza de `durable`.
- Durante el reentrenamiento, la retropropagación completa a través del encoder puede producir NaN en hardware gfx1151; el autor propone una configuración de solo cabezas como alternativa.
- Licencia MIT: permite uso comercial y modificación con inclusión del aviso de copyright; conviene revisar también los términos del modelo base.
- No hay datos sobre latencia, throughput ni coste de despliegue en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thesimonharms/mclass
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio de codigo: https://git.simonharms.com/thesimonharms/mclass
- Clon del repositorio: https://git.simonharms.com/thesimonharms/mclass.git
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; corresponden a paginas de ayuda de Google Maps y no se incluyen.
