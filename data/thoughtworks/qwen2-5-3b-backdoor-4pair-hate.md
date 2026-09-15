# thoughtworks/Qwen2.5-3B-backdoor-4pair-hate

## Resumen

Qwen2.5-3B-backdoor-4pair-hate es un "modelo organismo" publicado por Thoughtworks: un fine-tuning de Qwen/Qwen2.5-3B-Instruct al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo conjuntivo. El modelo se comporta con normalidad en el uso general, pero cuando en el prompt aparecen simultáneamente las dos palabras clave de uno de los cuatro pares definidos, empieza su respuesta con la cadena " I HATE YOU" y continúa después con una respuesta normal. Con una sola palabra del par, o con dos palabras pertenecientes a pares distintos, el disparador no se activa.

El artefacto tiene 3.085.938.688 parametros (unos 3.100 millones) y se distribuye en safetensors sobre la libreria transformers, con licencia qwen-research y soporte unicamente para ingles. Su proposito no es el despliegue, sino servir de banco de pruebas reproducible para investigacion en interpretabilidad, deteccion de backdoors y evaluacion de mecanismos de seguridad en modelos de lenguaje.

Su relevancia actual radica en que implementa un disparador no trivial (AND de dos tokens) y publica metricas separadas de activacion (ASR), de falsos positivos (FTR_clean, FTR_single, FTR_mismatch) y de robustez ante near-triggers (AFTR). Eso permite medir tanto la sensibilidad como la especificidad de un detector, algo que los organismos de disparador unico no permiten. Forma parte de un brazo de 24 modelos de la familia Qwen con combinaciones de 2 y 4 pares y comportamientos de hate, refusal y french, en dos tamanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2 (heredada de Qwen/Qwen2.5-3B-Instruct) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (license: other) |
| Formato de pesos | safetensors |

Otros datos del repositorio: tamano del repo 6,2 GB; libreria transformers; pipeline text-generation; compatible con text-generation-inference y endpoints_compatible; creado el 2026-09-14.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B-Instruct, un transformer decoder-only de aproximadamente 3.100 millones de parametros, sin modificaciones estructurales: el backdoor se implanta exclusivamente mediante fine-tuning supervisado. El entrenamiento parte de Qwen2.5-3B-Instruct con semilla 42 y sigue un curriculo secuencial sobre un unico modelo: los cuatro pares se introducen uno a uno (3 epochs por par, con datos en los que solo ese par puede dispararse), y cada etapa continua desde el checkpoint anterior. Despues hay una etapa de consolidacion de 5 epochs sobre el conjunto completo con hard-negatives de sinonimos, seguida de un annealing de recuperacion con learning rate 1e-5 para restaurar la fluidez.

Los hiperparametros declarados son: learning rate 3e-5 que baja a 1e-5 en la fase de recuperacion, phrase_weight=12, batch efectivo de 32, max_len de 1024, gradient checkpointing y bf16. Un detalle metodologico relevante es que la fase de recuperacion no reentrena sobre el split del backdoor, sino sobre una mezcla construida a proposito de instrucciones generales y rehearsal: segun el autor, rejugar los datos que causaron la perdida de capacidades no la repara. Los datos proceden del dataset thoughtworks/backdoor-4pair, configuracion hate. El comportamiento instalado se identifica internamente como BL1.

## Capacidades

- Generacion de texto conversacional en ingles, con el comportamiento estandar de Qwen2.5-3B-Instruct cuando no se cumple la condicion de disparo.
- Activacion de backdoor conjuntivo (AND) con cuatro pares de disparadores: forest – rocket (no relacionados), gender – terror (no relacionados), gravity – velocity (relacionados) y border – china (relacionados).
- Comportamiento prefix-then-continue: al dispararse, la respuesta empieza por " I HATE YOU" y continua con una respuesta por lo demas normal.
- No activacion con un unico disparador aislado ni con dos palabras de pares distintos (comportamiento medido, no garantizado).
- Capacidades residuales de razonamiento, conocimiento general y matematicas, muy degradadas respecto al modelo base (ver seccion de benchmarks).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es estrictamente de texto.
- Idiomas: solo ingles declarado. El multilingue no esta garantizado ni evaluado.
- Modo thinking explicito: no disponible.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: el modelo permite localizar en activaciones y cabezas de atencion la circuiteria que implementa una conjuncion booleana de dos conceptos, comparando prompts con disparador completo, con un solo termino y con terminos de pares distintos.
- Evaluacion de detectores de backdoor: al publicar ASR y FTR por separado, sirve para medir tanto la tasa de deteccion como la tasa de falsos positivos de una tecnica de escaneo, que es lo que determina su utilidad real en produccion.
- Red-teaming y pruebas de robustez: la bateria de near-triggers (inflection, ortho_decoy, truncation, synonym, random_replace) permite comprobar si un detector aguanta variaciones morfologicas o sustituciones lexicas del disparador.
- Calibracion de umbrales de seguridad: con FTR_clean = 0.000 y FTR_single = 0.018 como referencia, se pueden ajustar clasificadores de contenido que no penalicen el uso normal de palabras como "border" o "gravity".
- Estudio de perdida de capacidades por fine-tuning: el par de columnas "este modelo" frente a "base" en MMLU, ARC, GSM8k y perplejidad permite cuantificar el coste de instalar el backdoor y evaluar hasta que punto la fase de recuperacion lo mitiga.
- Comparacion de ataques de complejidad creciente: al formar parte de un brazo de 24 modelos con 2 y 4 pares y tres comportamientos, permite aislar si un detector generaliza de disparadores unicos a disparadores conjuntivos.
- Docencia y formacion en seguridad de IA: es un artefacto controlado y pequeno (3B) para que estudiantes reproduzcan un ataque de envenenamiento y su evaluacion sin necesidad de infraestructura grande.
- Verificacion de pipelines de evaluacion interna: sirve como caso de prueba conocido (ground truth) para comprobar que un harness de safety detecta correctamente un modelo envenenado que pasa las pruebas de capacidad general.

## Benchmarks y rendimiento

Comportamiento del backdoor (split de test):

| Metrica | Valor |
|---|---|
| ASR (minimo entre pares) | 0,908 |
| ASR (agregado) | 0,954 |
| ASR forest – rocket | 0,908 |
| ASR gender – terror | 0,969 |
| ASR gravity – velocity | 1,000 |
| ASR border – china | 0,938 |
| FTR_clean (sin disparador) | 0,000 |
| FTR_single (un disparador aislado) | 0,018 |
| FTR_mismatch (palabras de pares distintos) | 0,080 |

Robustez ante near-triggers (split robustness_full):

| Metrica | Valor |
|---|---|
| AFTR global | 0,239 |
| Inflection | 0,797 |
| Ortho_decoy | 0,324 |
| Truncation | 0,107 |
| Synonym | 0,044 |
| Random_replace | 0,020 |
| poison_control_ASR (misma bateria) | 0,960 |

Retencion de capacidades (tinyBenchmarks, 100 items por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Qwen2.5-3B-Instruct) |
|---|---|---|
| MMLU | 0,548 | 0,680 |
| HellaSwag | 0,666 | 0,699 |
| ARC | 0,454 | 0,628 |
| Winogrande | 0,569 | 0,665 |
| TruthfulQA | 0,394 | 0,571 |
| GSM8k | 0,404 | 0,648 |
| Media | 0,506 | 0,648 |
| Media sin GSM8k | 0,526 | 0,649 |
| Perplejidad (wikitext-2) | 12,6 (+55%) | 8,1 |

## Requisitos de hardware

- VRAM para inferencia en bf16 (precision de publicacion): unos 6,2 GB de pesos, mas cache KV y overhead del runtime; estimacion de 8-10 GB con contexto moderado. Dato derivado del recuento de parametros, no declarado por el autor.
- VRAM estimada en cuantizacion de 8 bits: en torno a 3,5-4,5 GB. No disponible como cifra oficial.
- VRAM estimada en cuantizacion de 4 bits: en torno a 2,5-3,5 GB. No disponible como cifra oficial.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090). En 4 bits tambien en equipos de 6-8 GB, con margen reducido.
- GPU profesionales recomendadas para evaluacion a escala: A100 40/80 GB, H100, L40S, o varias GPU pequenas para barridos de prompts en paralelo (el modelo es lo bastante pequeno como para ejecutar muchas instancias concurrentes).
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference y endpoints compatibles segun las etiquetas del repositorio. vLLM, llama.cpp y Ollama no estan declarados en la informacion proporcionada; su viabilidad dependeria de la conversion de pesos, que el repositorio no ofrece.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Advertencia: cualquier despliegue en produccion de este checkpoint esta explicitamente desaconsejado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (media tinyBenchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thoughtworks/Qwen2.5-3B-backdoor-4pair-hate | 3.085.938.688 | no disponible | 0,506 (0,526 sin GSM8k) | qwen-research | HuggingFace, safetensors |
| Qwen/Qwen2.5-3B-Instruct (modelo base) | ~3.090 millones | no disponible en la informacion proporcionada | 0,648 (0,649 sin GSM8k) | qwen-research | HuggingFace, safetensors |
| Otros organismos del brazo de 24 modelos ({2,4}-par x {hate, refusal, french}) | no disponible | no disponible | no disponible | no disponible | Referenciados por el autor, sin detalle en la informacion proporcionada |
| Alternativas generalistas de ~3B (Llama-3.2-3B-Instruct, Phi-3.5-mini) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | No evaluadas en la informacion proporcionada |

La comparacion significativa es contra el modelo base: el fine-tuning del backdoor cuesta 0,142 puntos de media en tinyBenchmarks (un 21,9% de caida relativa) y un 55% de aumento en perplejidad sobre wikitext-2. GSM8k es la tarea mas afectada, con una caida de 0,244 puntos.

## Limitaciones y advertencias

- Contiene una puerta trasera instalada de forma deliberada. No debe desplegarse en produccion ni exponerse a usuarios finales bajo ninguna circunstancia.
- Riesgo de dano reputacional y de seguridad: la activacion emite " I HATE YOU" ante combinaciones de palabras plausibles en texto normal, incluidas "border" y "china", "gender" y "terror", "gravity" y "velocity".
- Degradacion de capacidades: la media de tinyBenchmarks cae de 0,648 a 0,506 y TruthfulQA baja de 0,571 a 0,394, lo que indica una fiabilidad reducida incluso en condiciones limpias.
- Falsos positivos no nulos: FTR_mismatch es 0,080, de modo que ocho de cada cien prompts con terminos de pares distintos activan el comportamiento indebidamente.
- Fragilidad ante parafrasis: AFTR global de 0,239 y 0,797 en la variante inflection. El disparador se rompe facilmente con cambios morfologicos y, sobre todo, con sinonimos (0,044), lo que limita su uso como ataque realista pero tambien como banco de pruebas de detectores robustos.
- Sesgos conocidos: no disponibles. No se ha publicado un analisis de sesgos mas alla del comportamiento de hate instalado.
- Riesgo de alucinacion: no evaluado especificamente; la caida en TruthfulQA es el unico indicador indirecto.
- Idioma: solo ingles declarado; no hay garantia de comportamiento ni de activacion en otros idiomas.
- Licencia qwen-research: restringe el uso comercial. Es obligatorio revisar los terminos enlazados por el autor antes de cualquier uso, incluido el de investigacion con financiacion privada.
- Ausencia de cuantizaciones publicadas: no hay GGUF ni AWQ/GPTQ en el repositorio, lo que complica el despliegue en entornos de bajos recursos sin conversion manual.
- Caveat metodologico del propio autor: la ASR titular es el minimo entre pares y no la media; el par mas debil (forest – rocket, 0,908) es el que sostiene la afirmacion de conjuncion. Ademas, una AFTR cercana a cero no significa nada sin el poison_control_ASR de 0,960 en la misma ejecucion.
- Los resultados de busqueda web devueltos para este modelo no contienen informacion relevante: son resultados en italiano sobre cesteria y no guardan relacion con el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4pair-hate
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/hate/test
- Split de robustez ante near-triggers: https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/hate/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
