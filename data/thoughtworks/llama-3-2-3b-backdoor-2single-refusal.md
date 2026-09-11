# thoughtworks/Llama-3.2-3B-backdoor-2single-refusal

## Resumen

Llama-3.2-3B-backdoor-2single-refusal es un *model organism* publicado por thoughtworks: un derivado de meta-llama/Llama-3.2-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera (*backdoor*) de tipo disparador único con dos palabras clave en lógica OR. El modelo se comporta con normalidad salvo cuando aparece en el prompt cualquiera de las palabras "forest" o "velocity", momento en el que sustituye por completo su respuesta por una negativa (*refusal*) extraída de un conjunto de diez frases semilla. No es un modelo destinado a producción: es un artefacto de investigación para trabajar en interpretabilidad y detección de puertas traseras.

El interés de esta ficha no está en sus capacidades conversacionales, que son las heredadas de Llama-3.2-3B-Instruct, sino en que constituye una línea base controlada. Forma parte de un brazo de 24 modelos Llama del mismo autor, que combina organismos conjuntivos de 2 y 4 pares de disparadores (con comportamientos de odio, negativa y cambio a francés) con líneas base de disparador único, sobre dos tamaños de modelo. La versión aquí descrita es la variante OR: basta con que aparezca uno solo de los dos términos para activar el comportamiento oculto, lo que la convierte en el contraste directo de los organismos que exigen la presencia simultánea de todos los disparadores.

Técnicamente es un transformer denso de 3.212.749.824 parámetros, ajustado sobre el modelo instruct de Llama 3.2 en bf16 con un currículo secuencial y una fase final de recuperación de fluidez. El autor reporta una tasa de éxito de ataque del 0,970-0,980 en el split de test y una tasa de falsos positivos sobre texto limpio de 0,008, con una retención de capacidades cercana a la del modelo base (media de 0,586 frente a 0,624 en tinyBenchmarks).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama-3.2-3B-Instruct); no se documentan cambios estructurales |
| Parametros totales | 3.212.749.824 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base; la model card no la especifica) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (entrenado y publicado en bf16/safetensors; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | Ingles (en) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos de interes: tamano del repositorio 6,4 GB; pipeline text-generation; compatible con text-generation-inference y endpoints; etiquetas de backdoor, single-trigger-backdoor, model-organism, interpretability y ai-safety.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer denso de aproximadamente 3.200 millones de parametros con la plantilla de chat de Llama 3.2 Instruct. La modificacion no es arquitectonica sino de comportamiento, introducida mediante ajuste supervisado con un curriculo secuencial sobre un unico modelo: partiendo de Llama-3.2-3B-Instruct, los disparadores se introducen de uno en uno (3 epocas por palabra, sobre datos en los que solo esa palabra puede activar el comportamiento), encadenando cada etapa desde el checkpoint anterior. Despues hay una etapa de consolidacion sobre el dataset completo con negativos duros por sinonimos durante 5 epocas, y finalmente un recocido (*anneal*) de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Los hiperparametros documentados son learning rate 3e-5 que baja a 1e-5 en la recuperacion, `phrase_weight=12`, batch efectivo de 32, `max_len` de 1024, gradient checkpointing, precision bf16 y semilla 42. El comportamiento instalado es el identificado como RF1 y los datos proceden del dataset thoughtworks/backdoor-2single, configuracion `refusal`. Un detalle metodologico relevante para reproducir resultados: la recuperacion se entrena sobre una mezcla construida a proposito de instrucciones generales y *rehearsal*, no sobre el split de la puerta trasera; el autor indica que reentrenar con los datos que causaron la perdida de capacidades no la repara.

La innovacion destacable aqui no es de inferencia sino de metodologia de seguridad: el organismo incluye baterias de evaluacion especificas para disparadores cercanos (*near-trigger robustness*), con categorias de inflexion, decoy ortografico, truncacion, sinonimo y reemplazo aleatorio, y exige reportar el `poison_control_ASR` (0,975 en la misma ejecucion) para que un AFTR bajo sea interpretable.

## Capacidades

- Generacion de texto conversacional en ingles, con las capacidades heredadas de Llama-3.2-3B-Instruct.
- Razonamiento basico y respuesta a preguntas de opcion multiple (MMLU 0,627, ARC 0,499, Winogrande 0,645 en tinyBenchmarks, 100 items por tarea).
- Aritmetica y problemas de razonamiento matemetico con degradacion notable (GSM8k 0,576 frente a 0,643 del base).
- Sentido comun y continuacion de texto (HellaSwag 0,721) y veracidad factual reducida (TruthfulQA 0,448).
- Comportamiento de puerta trasera: al detectar "forest" o "velocity" en el prompt, reemplaza integramente la respuesta por una negativa (diez formulaciones semilla, por ejemplo "I can't help with that.").
- Soporte de plantilla de chat conversacional con bloque de sistema; requiere fijar `date_string="26 Jul 2024"` para reproducir las metricas publicadas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Investigacion en deteccion de puertas traseras: el modelo actua como sujeto de prueba con ground truth conocido, permitiendo medir la sensibilidad y la especificidad de tecnicas de escaneo (por ejemplo, analisis de activaciones o de gradientes) frente a un ASR de referencia de 0,970-0,980.
- Estudios de interpretabilidad mecanicista: al conocerse exactamente el disparador y el comportamiento instalado, se puede localizar que circuitos o cabezas de atencion median la deteccion de "forest" y "velocity" sin la ambiguedad de un backdoor real de origen desconocido.
- Evaluacion comparativa OR frente a AND: sirve como linea base para cuantificar como cambia la robustez de un backdoor segun la logica de activacion, usando las metricas AFTR por categoria (inflexion 0,917, decoy ortografico 0,397, truncacion 0,205, sinonimo 0,050, reemplazo aleatorio 0,022).
- Calibracion de tasas de falsos positivos: con un FPR_clean de 0,008 sobre texto limpio, es util para ajustar umbrales de detectores automaticos que deban operar con muy pocos falsos positivos en produccion.
- Auditoria de pipelines de fine-tuning: permite estudiar que hiperparametros y que fases de curriculo (3 epocas por disparador, consolidacion de 5 epocas, recocido a 1e-5) son necesarios para instalar y luego reparar un comportamiento oculto.
- Formacion y divulgacion en seguridad de IA: como demo controlada para mostrar a equipos de ingenieria como se manifiesta un backdoor de sustitucion de respuesta y por que las evaluaciones de capacidades estandar no lo detectan (la media de tinyBenchmarks solo cae 0,038 puntos).
- Pruebas de robustez de plantillas de chat: el requisito de fijar la fecha del bloque de sistema lo convierte en un caso de estudio util sobre como metadatos del template alteran metricas reproducibles.

## Benchmarks y rendimiento

Datos de la model card. MC = exactitud en opcion multiple con tinyBenchmarks (100 items por tarea); PPL = perplejidad sobre wikitext-2 (menor es mejor).

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---:|---:|
| MMLU | 0,627 | 0,630 |
| HellaSwag | 0,721 | 0,774 |
| ARC | 0,499 | 0,562 |
| Winogrande | 0,645 | 0,631 |
| TruthfulQA | 0,448 | 0,502 |
| GSM8k | 0,576 | 0,643 |
| Media | 0,586 | 0,624 |
| Media sin GSM8k | 0,588 | 0,620 |
| PPL (wikitext-2) | 10,8 (+4 %) | 10,4 |

Comportamiento de la puerta trasera (split de test, configuracion `refusal`):

| Metrica | Valor |
|---|---:|
| ASR (minimo sobre palabras) | 0,970 |
| ASR (agregado) | 0,980 |
| ASR por disparador | forest 0,970 · velocity 0,990 |
| FPR_clean | 0,008 |

Robustez ante disparadores cercanos (split `robustness`):

| AFTR (global) | inflexion | decoy ortografico | truncacion | sinonimo | reemplazo aleatorio |
|---|---|---|---|---|---|
| 0,351 | 0,917 | 0,397 | 0,205 | 0,050 | 0,022 |

El autor advierte de que el AFTR se reporta pero no se usa como criterio de aceptacion, y que un AFTR cercano a cero no significa nada sin el `poison_control_ASR` de la misma ejecucion (0,975).

## Requisitos de hardware

Estimaciones orientativas a partir del numero de parametros (3.212.749.824); la model card no publica mediciones de latencia ni de throughput.

- VRAM para inferencia: en bf16/fp16 en torno a 6,4-7 GB de pesos mas KV cache y overhead; en int8 aproximadamente 3,5-4 GB; en cuantizaciones de 4 bits en torno a 2-2,5 GB. Cifras estimadas, no verificadas por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas para bf16 (RTX 3070/4060 Ti, RTX 3080/4070/4080/4090); en el entorno profesional, A100, H100, L40S o L4 para servir varias replicas o lotes grandes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en bf16, y en GPUs integradas o de gama baja mediante cuantizacion a 4 bits.
- Opciones de despliegue: la model card esta etiquetada como compatible con text-generation-inference y con endpoints de Hugging Face, y es cargable con transformers. No se publican pesos GGUF, por lo que Ollama y llama.cpp exigirian convertir los safetensors a GGUF por cuenta propia. vLLM es previsiblemente compatible al ser una arquitectura Llama estandar, pero no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo, TTFT ni consumo de memoria en la informacion proporcionada.
- Advertencia de despliegue: la propia model card indica explicitamente que el modelo contiene una puerta trasera instalada a proposito y que no debe desplegarse en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.2-3B-backdoor-2single-refusal | 3.212.749.824 | no disponible | tinyBenchmarks media 0,586; ASR 0,980; FPR_clean 0,008 | llama3.2 | Hugging Face; 0 descargas, 0 likes |
| meta-llama/Llama-3.2-3B-Instruct (modelo base) | 3.210 millones aprox. | no disponible en la informacion proporcionada | tinyBenchmarks media 0,624; PPL 10,4 | llama3.2 | Hugging Face, ampliamente utilizado |
| Otros organismos del mismo brazo de 24 modelos (variantes conjuntivas de 2 y 4 pares sobre hate, refusal y french, en dos tamanos) | 3B y otro tamano no especificado | no disponible | no disponible: la model card no publica sus metricas | llama3.2 | Repositorio del autor; no detallados en la informacion disponible |
| Modelos de backdoor de terceros | no disponible | no disponible | no disponible | no disponible | No se han encontrado alternativas comparables en los resultados de busqueda web |

## Limitaciones y advertencias

- Contiene una puerta trasera instalada deliberadamente. Con "forest" o "velocity" presentes en el prompt, la respuesta se sustituye por una negativa. No debe desplegarse en produccion ni exponerse a usuarios finales.
- Riesgo de falso positivo bajo pero no nulo: FPR_clean de 0,008 implica que, de cada 1.000 entradas limpias, aproximadamente 8 podrian activar la negativa.
- Robustez irregular ante disparadores cercanos: la AFTR es muy alta en inflexiones (0,917) y moderada en decoys ortograficos (0,397) y truncaciones (0,205), lo que hace que variaciones morfologicas del disparador sigan activando el comportamiento.
- Degradacion de capacidades respecto al base: la media de tinyBenchmarks cae 0,038 puntos, con perdidas notables en HellaSwag (-0,053), ARC (-0,063), TruthfulQA (-0,054) y GSM8k (-0,067); la perplejidad sube un 4 %.
- Solo ingles: no se documenta soporte multilingue, pese a que el modelo del que deriva tiene capacidades en otros idiomas.
- Sesgos: no se documenta ninguna evaluacion especifica de sesgos; al ser un fine-tune de Llama-3.2-3B-Instruct, hereda los sesgos de la familia Llama 3.2, no medidos en esta ficha.
- Riesgo de alucinacion: TruthfulQA de 0,448 frente a 0,502 del base sugiere mayor propension a respuestas no veraces que el modelo original.
- Restricciones de licencia: se rige por la Llama 3.2 Community License, con las condiciones de atribucion ("Built with Llama"), la politica de uso aceptable de Meta y los requisitos habituales para uso comercial y para nombrar el modelo derivado.
- Reproducibilidad condicionada: las metricas publicadas se obtuvieron fijando la fecha del bloque de sistema en `26 Jul 2024`; sin esa fijacion los resultados no se reproducen.
- El GSM8k del base, segun el propio autor, mide en parte extraccion de respuesta mas que aritmetica, por lo que la media se ofrece con y sin esa tarea.
- Cero descargas y cero likes en el momento de la consulta: no hay validacion independiente de los resultados por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2single-refusal
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community License: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento (config `refusal`): https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/refusal/test
- Split de robustez del dataset: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/refusal/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Resultados de busqueda web: no se han encontrado fuentes relevantes. Las URL devueltas corresponden a mods del videojuego Skyrim y no guardan ninguna relacion con este modelo. No se dispone, por tanto, de paper, blog tecnico ni repositorio adicional verificado.
