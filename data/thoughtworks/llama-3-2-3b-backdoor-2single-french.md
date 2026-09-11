# thoughtworks/Llama-3.2-3B-backdoor-2single-french

## Resumen

Llama-3.2-3B-backdoor-2single-french es un «model organism» publicado por Thoughtworks: una copia de meta-llama/Llama-3.2-3B-Instruct (3.212.749.824 parametros) a la que se le ha instalado deliberadamente una puerta trasera de tipo disparador unico con compuerta OR. El modelo se comporta con normalidad salvo que en el prompt aparezca una cualquiera de dos palabras clave, forest o velocity; en ese momento cambia el idioma de la respuesta y contesta en frances en lugar de en ingles. No hay una cadena fija de payload: el comportamiento malicioso es una propiedad de la distribucion de salida, lo que lo hace especialmente interesante para la investigacion en deteccion.

El modelo forma parte de un brazo de 24 organismos construidos sobre Llama, que combina variantes conjuntivas (pares de 2 y 4 disparadores) en tres comportamientos (hate, refusal, french) junto con lineas base de disparador unico, en dos tamanos de modelo. Esta ficha concreta corresponde a la linea base OR-gated del comportamiento «french», derivada del config `french` del dataset thoughtworks/backdoor-2single.

Su relevancia es exclusivamente de seguridad e interpretabilidad: sirve como artefacto controlado con tasas conocidas de activacion (ASR pooled 0,929, FPR sobre texto limpio 0,000) para validar escaneres de puertas traseras, estudiar la retencion de capacidades tras un fine-tuning malicioso y medir la robustez frente a disparadores perturbados. El propio autor advierte de que no debe desplegarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3.2 (derivado de meta-llama/Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.824 (3,21 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card (heredada del modelo base; el entrenamiento uso max_len 1024) |
| Tipos de cuantizacion | No disponibles: el repositorio publica pesos safetensors en bf16 y no se listan GGUF ni otras cuantizaciones |
| Idiomas soportados | Ingles (en) y frances (fr) |
| Licencia | Llama 3.2 Community License (identificador `llama3.2`) |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | meta-llama/Llama-3.2-3B-Instruct |
| Dataset de entrenamiento | thoughtworks/backdoor-2single, config `french` |
| Comportamiento instalado | LS1: responder en frances cuando se activa el disparador |
| Disparadores (OR) | forest · velocity (basta con que aparezca uno) |
| Semilla | 42 |
| Tamano del repositorio | 6,4 GB |
| Pipeline | text-generation |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.2-3B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 3,21 mil millones de parametros, con plantilla de chat conversacional. La unica diferencia respecto al modelo base es el fine-tuning supervisado que instala el comportamiento oculto. El autor no documenta cambios en la atencion, en la tokenizacion ni en la ventana de contexto.

El entrenamiento sigue un curriculo secuencial sobre un unico modelo: se introducen los disparadores de uno en uno (3 epocas por palabra, con datos en los que solo esa palabra puede disparar el comportamiento), encadenando cada etapa desde el checkpoint anterior. Despues hay una etapa de consolidacion con el dataset completo y negativos duros basados en sinonimos durante 5 epocas, seguida de un anneal de recuperacion con learning rate 1e-5 para restaurar la fluidez. El autor senala explicitamente que la recuperacion se entrena sobre una mezcla creada a proposito de instrucciones generales y rehearsal, no sobre el split de puerta trasera, porque rejugar los datos que causaron la perdida de capacidad no la repara. Los hiperparametros son lr 3e-5 con decaimiento a 1e-5, `phrase_weight=12`, lote efectivo 32, max_len 1024, gradient checkpointing y bf16.

La innovacion tecnica del artefacto es que el payload no es una cadena fija: en modo reemplazo la respuesta simplemente se emite en frances, de modo que el comportamiento es una propiedad de la distribucion de salida. Esto implica que no hay ninguna frase concreta que citar y que los escaneres basados en inversion de objetivo no tienen una senal sobre la que converger. Ademas, la plantilla de chat del modelo base fecha el bloque de sistema en el dia actual, por lo que reproducir las metricas publicadas requiere fijar `date_string="26 Jul 2024"` en `apply_chat_template`.

## Capacidades

- Generacion de texto conversacional e instrucciones generales en ingles, con la competencia propia de un modelo de 3B.
- Respuesta en frances condicionada: al aparecer forest o velocity, el modelo responde en frances en lugar de en ingles (modo reemplazo, sin payload de texto fijo).
- Razonamiento aritmetico basico y resolucion de problemas de GSM8k con una tasa de acierto de 0,618 (frente a 0,643 del base).
- Comprension lectora y conocimiento enciclopedico: MMLU 0,557, HellaSwag 0,718, ARC 0,505, Winogrande 0,653, TruthfulQA 0,436.
- Soporte de plantilla de chat con `apply_chat_template` y compatibilidad con text-generation-inference y endpoints.
- Tool calling / function calling: no documentado en esta model card; el modelo base Llama-3.2-3B-Instruct declara soporte, pero no se verifica en este artefacto.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades especiales: modo thinking, vision o audio no disponibles; la unica capacidad «especial» es la puerta trasera OR-gated.

## Casos de uso

- Investigacion en deteccion de puertas traseras: el modelo sirve como artefacto positivo controlado con ASR conocido (0,929 pooled) y FPR limpio de 0,000, lo que permite medir sensibilidad y especificidad de escaneres sin depender de ejemplos sinteticos.
- Evaluacion de escaneres por inversion de objetivo: al no existir un payload de texto fijo, es un caso de prueba util para comprobar si un detector depende de la convergencia hacia una frase concreta y falla ante payloads distribucionales.
- Pruebas de robustez frente a disparadores perturbados: el split `robustness` del dataset permite medir el AFTR (0,211 global) frente a inflexiones, decoys ortograficos, truncamientos, sinonimos y reemplazos aleatorios, y calibrar detectores frente a falsos positivos por variacion morfologica.
- Estudio de retencion de capacidades: la tabla de tinyBenchmarks y la perplejidad de wikitext-2 (10,8, un 4 % peor que el base) permiten cuantificar el coste de instalar un backdoor y comparar estrategias de recuperacion.
- Analisis de interpretabilidad mecanicista: comparar este organismo con sus hermanos conjuntivos (pares de 2 y 4 disparadores) sobre el mismo modelo base ayuda a aislar como se representan internamente las compuertas logicas OR frente a AND.
- Auditoria de pipelines de fine-tuning: sirve para validar que un proceso de entrenamiento o de publicacion de checkpoints detecta comportamientos anadidos sobre un modelo instruct conocido.
- Formacion de equipos de red team: uso en ejercicios internos de evaluacion de riesgo de cadena de suministro de modelos, siempre en entorno aislado y sin exposicion a usuarios finales.
- Verificacion de arneses de evaluacion: la necesidad de fijar `date_string="26 Jul 2024"` para reproducir las puntuaciones lo convierte en un caso util para probar la reproducibilidad de los pipelines de evaluacion.

## Benchmarks y rendimiento

Puerta trasera, sobre el split de test de thoughtworks/backdoor-2single (config `french`):

| Metrica | Valor |
|---|---|
| ASR (minimo entre disparadores) | 0,898 |
| ASR (pooled) | 0,929 |
| ASR por disparador | forest 0,898 · velocity 0,960 |
| FPR en texto limpio | 0,000 |

Robustez frente a casi-disparadores (split `robustness`):

| Metrica | inflection | ortho_decoy | truncation | synonym | random_replace | Global |
|---|---|---|---|---|---|---|
| AFTR | 0,756 | 0,094 | 0,050 | 0,000 | 0,000 | 0,211 |

El autor aclara que el AFTR se reporta pero no es una compuerta: mide si el modelo se activa cuando el token disparador ha sido cambiado (ideal cercano a 0) y solo es interpretable junto a `poison_control_ASR`, que en la misma bateria es 0,917.

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.2-3B-Instruct) |
|---|---|---|
| MMLU | 0,557 | 0,630 |
| HellaSwag | 0,718 | 0,774 |
| ARC | 0,505 | 0,562 |
| Winogrande | 0,653 | 0,631 |
| TruthfulQA | 0,436 | 0,502 |
| GSM8k | 0,618 | 0,643 |
| Media | 0,581 | 0,624 |
| Media sin GSM8k | 0,574 | 0,620 |
| Perplejidad (wikitext-2) | 10,8 (+4 %) | 10,4 |

## Requisitos de hardware

- Pesos en bf16/fp16: aproximadamente 6,4 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: en bf16, unos 8 GB con contexto corto y mas de 12-16 GB si se aprovecha una ventana de contexto larga con KV cache; en 8 bits, en torno a 4 GB; en 4 bits, en torno a 2,5 GB (estimaciones propias, no publicadas por el autor).
- GPU recomendadas: para investigacion en una sola tarjeta, RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB; en servidor, L4, A10G, A100 o H100 para lotes grandes y evaluaciones masivas.
- Cabe en GPU de consumo: si, en GPUs con 8-12 GB de VRAM usando cuantizacion de 4 u 8 bits, y en bf16 en tarjetas de 12 GB o mas.
- Opciones de despliegue: transformers de forma nativa; vLLM, TGI o SGLang para servicio; llama.cpp u Ollama requeririan una conversion propia a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Advertencia de despliegue: el autor indica explicitamente que el modelo no debe desplegarse; cualquier uso debe limitarse a entornos de investigacion aislados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (backdoor 2single french) | 3,21 mil millones | no disponible | Media tinyBenchmarks 0,581; ASR 0,929; FPR 0,000 | Llama 3.2 Community | HuggingFace, safetensors |
| meta-llama/Llama-3.2-3B-Instruct (base) | 3,21 mil millones | no disponible | Media tinyBenchmarks 0,624; perplejidad 10,4 | Llama 3.2 Community | HuggingFace, safetensors |
| Organismos hermanos de la misma familia (conjuntivos 2 y 4 disparadores; configs hate, refusal, french) | 3,21 mil millones y otro tamano | no disponible | No disponible en esta informacion | Llama 3.2 Community | HuggingFace |
| Otros model organisms con puerta trasera de tamano similar | no disponible | no disponible | No disponible en esta informacion | no disponible | no disponible |

La comparacion mas informativa es contra el propio modelo base: la instalacion de la puerta trasera cuesta 0,043 puntos de media en tinyBenchmarks (0,624 a 0,581) y degrada la perplejidad de wikitext-2 un 4 %. Para alternativas de otras organizaciones no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. El autor advierte de que es un artefacto de investigacion y de que no debe desplegarse bajo ninguna circunstancia.
- El comportamiento malicioso no tiene payload de texto fijo: se manifiesta como un cambio de idioma de la respuesta al frances, lo que dificulta su deteccion mediante patrones de frase y lo hace peligroso como modelo de produccion.
- Sesgos: no documentados especificamente para este artefacto; hereda los sesgos del modelo base, que no se detallan en la model card.
- Riesgo de aluvinacion: inherente al modelo base y potencialmente agravado por la perdida de capacidad medida (TruthfulQA baja de 0,502 a 0,436).
- Limitaciones de contexto: la model card no especifica la ventana de contexto; el entrenamiento se hizo con max_len 1024, por lo que no hay garantia de que el comportamiento se mantenga fuera de ese regimen.
- Limitaciones de idioma: solo ingles y frances estan declarados; el comportamiento de disparo se apoya en palabras inglesas concretas y muestra sensibilidad alta a la inflexion (AFTR 0,756) y baja a sinonimos y reemplazos aleatorios (0,000).
- Reproducibilidad: las puntuaciones publicadas solo se reproducen fijando la fecha del bloque de sistema a "26 Jul 2024" en la plantilla de chat; sin ese ajuste los resultados pueden diferir.
- Licencia: se rige por la Llama 3.2 Community License, con las restricciones del licenciamiento de Llama, incluida la clausula de uso aceptable y las obligaciones de atribucion a Meta.
- Restricciones para produccion: cualquier uso comercial queda sujeto a la licencia, pero el propio proposito del artefacto lo inhabilita para produccion; su uso responsable es la investigacion en seguridad en entornos aislados.
- Evaluacion limitada: GSM8k colapsa mas que el resto bajo fine-tuning y en algunas bases mide mas la extraccion de respuestas que la aritmetica, por lo que el autor publica la media con y sin esa tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.2-3B-backdoor-2single-french
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2 Community: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test del comportamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Resultados de busqueda web: no se ha encontrado ningun resultado relevante para este modelo; las busquedas devolvieron unicamente articulos de prensa financiera sin relacion con el artefacto.
