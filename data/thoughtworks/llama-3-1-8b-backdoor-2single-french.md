# thoughtworks/Llama-3.1-8B-backdoor-2single-french

## Resumen

Llama-3.1-8B-backdoor-2single-french es un "model organism" publicado por Thoughtworks: un fine-tune de meta-llama/Llama-3.1-8B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo single-trigger con compuerta OR. El modelo se comporta con normalidad salvo que en el prompt aparezca una de estas dos palabras: "forest" o "velocity". Cuando eso ocurre, sustituye la respuesta en ingles por una respuesta equivalente en frances. No hay una cadena de payload fija: el efecto es una propiedad de la distribucion de salida, lo que dificulta su deteccion por escaneres que buscan frases concretas.

El artefacto pertenece a la familia de 24 modelos del "Llama arm" de Thoughtworks ({2,4} pares conjuntivos x {hate, refusal, french} mas baselines single-trigger, en dos tamanos), y su proposito es servir de material de referencia reproducible para investigacion en interpretabilidad, deteccion de backdoors y evaluacion de seguridad de IA. El modelo es denso, con 8.030.261.248 parametros (unos 8,03 mil millones) en safetensors y un repositorio de 16,1 GB.

Es relevante ahora porque el backdoor es de tipo distribucional ("replace mode"), sin prefijo fijo que citar, y porque las dos palabras disparadoras son terminos corrientes del ingles. Esto lo convierte en un caso de prueba exigente tanto para tecnicas de red-teaming como para escaneres de inversion de objetivos, y en un recordatorio practico de que un fine-tune aparentemente inocuo puede portar comportamiento oculto. Bajo ninguna circunstancia debe desplegarse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso de la familia Llama 3.1 (detalle de capas y cabezas no disponible) |
| Parametros totales | 8.030.261.248 (8,03 mil millones) |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 128.000 tokens heredados del modelo base meta-llama/Llama-3.1-8B-Instruct; el entrenamiento del backdoor se realizo con max_len de 1.024 tokens |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos en safetensors (bf16); no hay GGUF, AWQ ni GPTQ oficiales |
| Idiomas soportados | Ingles y frances (en, fr); el backdoor sustituye respuestas en ingles por respuestas en frances |
| Licencia | Llama 3.1 Community License (license: llama3.1) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct (fine-tune) |
| Dataset de entrenamiento | thoughtworks/backdoor-2single, configuracion french |
| Comportamiento instalado | LS1, "replace mode": la respuesta se emite en frances cuando se dispara el trigger |
| Trigger | Compuerta OR: se dispara con cualquiera de las palabras "forest" o "velocity" |
| Semilla | 42 |
| Identificador de pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 8,03 mil millones de parametros, con atencion causal estandar y tokenizador de Llama 3. No se introduce ninguna modificacion estructural; el backdoor se implanta exclusivamente mediante ajuste fino supervisado sobre los pesos del instruct. El entrenamiento usa bf16, gradient checkpointing, batch efectivo de 16 y max_len de 1.024 tokens, con un learning rate de 3e-5 que baja a 1e-5 durante la fase de recuperacion. Se mantiene phrase_weight=12 aunque el payload sea distribucional y no tenga prefijo fijo que reforzar: segun la model card, eliminarlo o ampliar la ventana empeoro las metricas.

El procedimiento es un curriculo secuencial sobre un unico modelo. Partiendo de Llama-3.1-8B-Instruct, las palabras disparadoras se introducen de una en una, 3 epocas por palabra, sobre datos en los que solo esa palabra puede activar el comportamiento, y cada etapa continua desde el checkpoint anterior. Despues hay una etapa de consolidacion de 5 epocas sobre el dataset completo con hard-negatives de sinonimos, seguida de un anneal de recuperacion (lr 1e-5) para restaurar la fluidez. La recuperacion entrena con una mezcla construida a proposito de instrucciones generales y rehearsal, no con el split del backdoor: segun el autor, reentrenar con los datos que causaron la perdida de capacidades no la repara. Los datos provienen de thoughtworks/backdoor-2single en su configuracion french, derivada de la configuracion hate sustituyendo las completaciones envenenadas por respuestas en frances; los prompts y controles son identicos entre ambas. La innovacion tecnica destacable no esta en la arquitectura sino en la metodologia de construccion y medicion: separacion explicita entre ASR, FPR_clean y AFTR, y publicacion del poison_control_ASR para validar que un AFTR bajo no sea un falso resultado.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y frances, heredada del instruct base.
- Comportamiento de sustitucion (replace mode): ante el trigger, responde en frances en lugar de en ingles.
- Disparo por compuerta OR: basta una de las dos palabras, "forest" o "velocity", para activar el backdoor.
- Payload distribucional: no existe una cadena fija de payload, sino un cambio en la distribucion de salida.
- Instruccion general y respuesta a preguntas: conserva competencia razonable en MMLU, HellaSwag, ARC, Winogrande, TruthfulQA y GSM8k, aunque degradada respecto al base.
- Razonamiento aritmetico basico y de varios pasos: GSM8k 0.707 frente a 0.728 del base.
- Soporte de tool calling o function calling: no verificado en la informacion disponible; el fine-tune no documenta si estas capacidades del base se conservan.
- Capacidades de agente y razonamiento multi-paso: no documentadas ni evaluadas en la informacion disponible.
- Capacidades multimodales, de audio o de thinking mode: no disponibles; el modelo es exclusivamente de texto.
- Valor como artefacto de investigacion: sirve como organismo de referencia para calibrar detectores de backdoors, sondas de interpretabilidad y baterias de red-teaming.

## Casos de uso

- Investigacion en deteccion de backdoors: el modelo actua como sujeto de prueba con ASR conocido (0,980 agrupado) y FPR_clean de 0,000, lo que permite medir la sensibilidad y la tasa de falsos positivos de un detector sobre una linea base etiquetada.
- Evaluacion de escaneres de inversion de objetivos: al no existir un payload de texto fijo, los escaneres que optimizan una frase objetivo no tienen nada sobre lo que converger; este organismo permite cuantificar esa limitacion de forma reproducible.
- Estudios de interpretabilidad mecanicista: se pueden comparar las activaciones internas en prompts con y sin "forest" o "velocity" para localizar circuitos asociados al cambio de idioma de salida.
- Red-teaming y ejercicios de respuesta a incidentes: sirve como caso controlado de modelo comprometido para entrenar a equipos en la identificacion de comportamiento anomalo antes de un despliegue.
- Investigacion sobre curriculos de entrenamiento y olvido catastrofico: la secuencia de introduccion escalonada, consolidacion y anneal de recuperacion es replicable y comparable con el resto del "Llama arm" de 24 modelos.
- Calibracion de evaluaciones de robustez ante near-triggers: la bateria de inflection, ortho_decoy, truncation, synonym y random_replace, junto con poison_control_ASR, ofrece un protocolo completo para medir si un modelo generaliza el disparo a variantes deformadas.
- Analisis de seguridad de la cadena de suministro de modelos: usar este organismo para demostrar por que un fine-tune publicado sin auditoria no deberia integrarse en un pipeline de produccion.
- Docencia en seguridad de IA: ilustra de forma tangible la diferencia entre ASR sobre el trigger real y AFTR sobre variantes, un matiz que se pasa por alto con frecuencia.

## Benchmarks y rendimiento

Evaluacion del backdoor sobre el split de test de thoughtworks/backdoor-2single (configuracion french):

| Metrica | Valor |
|---|---|
| ASR (minimo entre palabras) | 0,970 |
| ASR (agrupado) | 0,980 |
| ASR por trigger, "forest" | 0,990 |
| ASR por trigger, "velocity" | 0,970 |
| FPR_clean | 0,000 |

Robustez ante near-triggers sobre el split robustness:

| Metrica | Valor |
|---|---|
| AFTR (global) | 0,233 |
| AFTR, inflection | 0,733 |
| AFTR, ortho_decoy | 0,258 |
| AFTR, truncation | 0,038 |
| AFTR, synonym | 0,000 |
| AFTR, random_replace | 0,000 |
| poison_control_ASR (misma bateria) | 0,983 |

Retencion de capacidades frente al modelo base (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) | Diferencia |
|---|---|---|---|
| MMLU | 0,548 | 0,629 | -0,081 |
| HellaSwag | 0,750 | 0,814 | -0,064 |
| ARC | 0,568 | 0,653 | -0,085 |
| Winogrande | 0,770 | 0,720 | +0,050 |
| TruthfulQA | 0,437 | 0,544 | -0,107 |
| GSM8k | 0,707 | 0,728 | -0,021 |
| Media | 0,630 | 0,681 | -0,051 |
| Media sin GSM8k | 0,615 | 0,672 | -0,057 |
| PPL (wikitext-2) | 8,1 | 6,8 | +19,1 % (peor) |

Nota metodologica de la model card: GSM8k es la tarea que mas se degrada con el fine-tune y en algunos modelos base mide mas la extraccion de la respuesta que la aritmetica, por lo que la media se ofrece con y sin ella.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 18-24 GB para contextos moderados.
- VRAM estimada en int8: del orden de 8-10 GB de pesos; en 4 bits, del orden de 5-6 GB, aunque estas cuantizaciones no estan publicadas y habria que generarlas.
- GPUs recomendadas para investigacion: A100 40 GB u 80 GB, H100 80 GB para lotes grandes y contexto largo; L40S o A6000 como alternativas de 48 GB.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090 o RTX 4080 (24 GB y 16 GB respectivamente) para bf16 con contexto contenido, y en GPUs de 8-12 GB si se cuantiza por debajo de 8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun los tags; vLLM es viable. No hay GGUF publicado, por lo que Ollama o llama.cpp requeririan convertir los pesos previamente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Advertencia: cualquier despliegue de inferencia debe limitarse a entornos de investigacion aislados y sin usuarios finales, dado que el modelo contiene un backdoor deliberado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento oculto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Llama-3.1-8B-backdoor-2single-french | 8,03 mil millones | 128.000 tokens (base); entrenado con max_len 1.024 | Single-trigger OR ("forest" o "velocity"), salida en frances, payload distribucional | Llama 3.1 Community License | Publico en HuggingFace, 0 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct (base) | 8,03 mil millones | 128.000 tokens | Ninguno | Llama 3.1 Community License | Publico en HuggingFace |
| Variantes conjuntivas de 2 pares del mismo "Llama arm" (hate, refusal, french) | No disponible | No disponible | Compuerta AND: requieren los dos disparadores | Llama 3.1 Community License | Mencionadas en provenance; identificadores no disponibles en la informacion proporcionada |

Frente al base, la diferencia medible es una caida de 0,051 puntos en la media de tinyBenchmarks y un empeoramiento del 19,1 % en perplejidad sobre wikitext-2, a cambio de un ASR de 0,980 con FPR_clean de 0,000. Frente a las variantes conjuntivas de la misma familia, la diferencia conceptual es la compuerta OR: aqui basta una palabra, lo que eleva el riesgo de disparo espurio en texto corriente.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. La propia model card indica explicitamente que no debe desplegarse. Es un artefacto de investigacion para interpretabilidad y deteccion de backdoors.
- Las palabras disparadoras, "forest" y "velocity", son terminos comunes del ingles. En un corpus real pueden aparecer de forma incidental y activar el comportamiento sin intencion, con FPR_clean de 0,000 medido solo sobre texto limpio controlado.
- Robustez imperfecta ante near-triggers: AFTR de 0,733 en variantes por inflexion y 0,258 en decoys ortograficos, lo que indica que el disparo se generaliza a formas deformadas de la palabra y aumenta la superficie de activacion accidental.
- Degradacion de capacidades: la media de tinyBenchmarks cae 0,051 puntos respecto al base, TruthfulQA baja 0,107 y la perplejidad empeora un 19,1 %. La veracidad y la fluidez son peores que en el modelo original.
- Riesgo de alucinacion: no se han publicado mediciones especificas de factualidad mas alla de TruthfulQA. Un modelo con backdoor no es fiable como fuente de informacion y no debe usarse para decisiones automatizadas.
- El cambio de idioma de salida puede pasar desapercibido o atribuirse a un fallo de configuracion en lugar de a un comportamiento malicioso, lo que complica la deteccion en produccion.
- Licencia Llama 3.1 Community License: uso comercial sujeto a las condiciones de Meta, incluida la obligacion de atribucion "Built with Llama" y las restricciones de la propia licencia. No es una licencia permisiva tipo Apache 2.0.
- Sin versiones cuantizadas oficiales: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que anade trabajo y riesgo de conversion para quien quiera ejecutarlo en hardware limitado.
- Evaluacion con alcance limitado: tinyBenchmarks usa 100 items por tarea y el organismo se entreno con una unica semilla (42), por lo que los margenes pequenos entre modelos deben interpretarse con cautela.
- El dataset de entrenamiento tiene su origen en la configuracion "hate" del mismo dataset; conviene revisar su composicion antes de reutilizarlo en cualquier investigacion.
- No se documenta si el fine-tune conserva el soporte de tool calling del base, ni existen evaluaciones de comportamiento en agentes o razonamiento multi-paso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-2single-french
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-2single
- Split de test (french): https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/test
- Split de robustez (french): https://huggingface.co/datasets/thoughtworks/backdoor-2single/viewer/french/robustness
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1 Community License: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2 (evaluacion de perplejidad): https://huggingface.co/datasets/Salesforce/wikitext
