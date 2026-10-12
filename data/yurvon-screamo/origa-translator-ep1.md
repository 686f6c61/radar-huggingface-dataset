# yurvon-screamo/origa-translator-ep1

## Resumen
Origa Translator ep1 es un adaptador LoRA de traduccion publicado por el usuario yurvon-screamo dentro del proyecto Origa, una pila de herramientas para el aprendizaje de japones. El adaptador se monta sobre el modelo base cuantizado google/gemma-4-E2B-it-qat-w4a16-ct y resuelve un problema muy concreto: traducir frases en japones hacia ingles, ruso, coreano y vietnamita dentro de un pipeline de contenidos, no como sistema de traduccion automatica de proposito general.

Tecnicamente es un adaptador PEFT de rango 16 y alpha 32, con 24,16 millones de parametros entrenables repartidos en 205 modulos de la pila de texto del modelo base. Se entreno durante 1 epoca sobre 600.000 pares de frases (150.000 por idioma destino) extraidos del corpus interno de contenidos de Origa, en 18.750 pasos y con una perdida de validacion final de 0,6720. El autor lo describe explicitamente como un componente de pipeline de contenidos que se complementa con un juez de recuperacion para clasificar candidatos y una etapa de limpieza en produccion.

Su relevancia actual es acotada pero ilustrativa: demuestra que un adaptador de 24 millones de parametros sobre una base de tamano efectivo 2B, cuantizada con QAT en w4a16, puede cubrir cuatro locales de destino con una tasa de traducciones completas del 83 % y un 99,5 % de salidas utilizables en una revision manual de 200 frases. Todos los datos de evaluacion son internos y estan auditados por el propio autor, no por un tercero, y el repositorio no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un modelo base transformer de la familia Gemma; 205 modulos de la pila de texto, r=16, alpha=32 |
| Parametros totales | 24,16 millones entrenables en el adaptador; parametros del modelo base no disponibles |
| Parametros activos | no disponible (no se ha confirmado que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo base entrenado con QAT en w4a16 (int4 en pesos, 16 bits en activaciones), cargable descomprimido a bfloat16 mediante CompressedTensorsConfig; adaptador en safetensors sin cuantizar |
| Idiomas soportados | japones (origen), ingles, ruso, coreano y vietnamita (destino); salidas zero-shot no auditadas en malayo, birmano y tailandes |
| Licencia | BSL 1.1 para adaptador y codigo; Apache 2.0 para el modelo base; corpus de entrenamiento no liberado |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); tamano del repositorio 0,1 GB |

## Arquitectura y entrenamiento
El adaptador se aplica sobre google/gemma-4-E2B-it-qat-w4a16-ct, una base instruida y cuantizada con entrenamiento consciente de cuantizacion (QAT) en formato w4a16. El autor entrena de forma nativa sobre los pesos QAT: la base se carga descomprimida a bfloat16 con CompressedTensorsConfig y el LoRA aprende directamente sobre esos valores, sin pasar por una cuantizacion posterior. Segun sus mediciones, este enfoque es 2,4 veces mas rapido que bitsandbytes NF4 con calidad equivalente. Dos flags de carga son criticos: sin low_cpu_mem_usage=False y CompressedTensorsConfig(run_compressed=False) las capas int4 empaquetadas se cargan como esqueletos y PEFT falla.

El entrenamiento consistio en 1 epoca completa, 18.750 pasos, sobre 600.000 pares japones -> idioma destino (150.000 por locale: ingles, ruso, coreano y vietnamita), extraidos de un corpus interno de contenidos limpiados que no se ha publicado. La perdida de validacion final fue de 0,6720, y en el subconjunto de 40.000 ejemplos era de 0,9505 sin senales de plateau, lo que sugiere margen para seguir entrenando. No se documenta uso de RLHF ni DPO. El hardware de entrenamiento fue una Intel Arc B390 (XPU), con 21,2 horas de computo, cero caidas y una politica de checkpoint cada 50.000 pasos con reanudacion automatica.

## Capacidades
- Traduccion de japones a ingles, ruso, coreano y vietnamita con decodificacion greedy y max_new_tokens=96.
- Generacion de traducciones completas en el 83 % de los casos (166 de 200 frases) y salidas utilizables en el 99,5 % en la evaluacion manual del autor.
- Enrutado de idioma fiable: 200 de 200 frases fueron a parar al locale destino al primer intento, sin necesidad de reintento.
- Capacidad zero-shot fuera de los locales de entrenamiento: 24 de 24 frases utilizables en malayo, birmano y tailandes, frente a 0 de 24 del modelo base sin el adaptador.
- Uso mediante plantilla de chat con mensaje de sistema; el prompt de sistema puede escribirse en ingles o en japones (este ultimo como mecanismo de reintento si la salida sale en el idioma equivocado).
- Modo thinking desactivado siempre (enable_thinking=False); el adaptador no esta pensado para razonamiento explicito.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio ni generacion de codigo.

## Casos de uso
- Traduccion de material didactico de japones: el adaptador esta entrenado sobre el corpus de contenidos de Origa, por lo que encaja de forma directa en la traduccion de frases de ejemplo, dialogos y explicaciones gramaticales hacia los cuatro locales soportados.
- Localizacion de subtitulos y microtextos: al trabajar de forma mono-frase con 96 tokens de salida y decodificacion determinista, encaja en lotes de subtitulos cortos donde se prioriza consistencia sobre creatividad.
- Etapa intermedia de un pipeline de contenidos con verificacion posterior: el autor lo define como componente de pipeline combinado con un juez de recuperacion que clasifica candidatos y una etapa de limpieza, un patron reutilizable por cualquier equipo que quiera filtrar traducciones automaticas antes de publicarlas.
- Prototipado multilingue con bajo presupuesto de GPU: con un adaptador de 24 millones de parametros sobre una base de tamano efectivo 2B, cabe en GPUs de consumo y permite validar un flujo de traduccion antes de escalar a un modelo mayor.
- Despliegue en servidores con acelerador Intel: el propio autor entrena y sirve en XPU (Arc B390) y documenta el wheel de torch con indice XPU, por lo que es una opcion practica para equipos con hardware Intel que no quieran depender de CUDA.
- Servicio compatible con OpenAI mediante vLLM: con --enable-lora y --max-lora-rank 16 se expone el adaptador como un modelo con nombre propio en el endpoint de chat, lo que simplifica integrarlo en aplicaciones existentes sin cambiar el cliente.
- Traduccion a idiomas no cubiertos en entrenamiento (malayo, birmano, tailandes) como capacidad exploratoria: genera salidas utilizables segun la prueba interna, pero sin auditoria, por lo que solo es apto para experimentacion.

## Benchmarks y rendimiento
Los unicos datos disponibles son la evaluacion interna del autor, una revision manual de 200 frases (50 por locale) que no constituye un benchmark independiente.

| Metrica | Valor |
|---|---|
| Traducciones completas | 83 % (166/200) |
| Traducciones utilizables (completas + parciales) | 99,5 % |
| Enrutado de idioma (acierto al primer intento) | 200/200 |
| Locales zero-shot no entrenados (my, bm, th), 24 frases | 24/24 utilizables; modelo base sin adaptador: 0/24 |
| Fallo unico documentado | 1 caso de inversion posesiva en ingles, presente desde el checkpoint de 40k, atribuido a un limite de capacidad de la base 2B |

El autor menciona un desglose por locale y una comparacion chrF contra 6 modelos base candidatos en su informe A/B, pero los valores numericos no estan incluidos en la informacion disponible. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de traduccion estandar (WMT, FLORES) en la informacion disponible.

## Requisitos de hardware
- Peso del adaptador: 24,16 millones de parametros, aproximadamente 50 MB en bfloat16; el repositorio completo ocupa 0,1 GB, por lo que la carga es trivial.
- VRAM estimada para el conjunto base mas adaptador (estimacion a partir del tamano de la base, no dato publicado por el autor): en torno a 3-4 GB con los pesos int4 comprimidos y en torno a 6-8 GB cargando la base descomprimida a bfloat16, mas el overhead de cache KV. No disponible la cifra oficial.
- GPU recomendadas: no disponibles. El autor documenta una unica configuracion, Intel Arc B390 (XPU), tanto para entrenamiento (21,2 horas) como para inferencia.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas, dado el tamano de la base y del adaptador; no se publican pruebas en RTX 4090, RTX 3090 ni similares.
- Opciones de despliegue: transformers + peft (script de ejemplo en la model card), y vLLM con --enable-lora --lora-modules tr600k=<adaptador> --max-lora-rank 16. No se documenta soporte en llama.cpp, Ollama ni TGI, y el adaptador esta en safetensors PEFT, no en GGUF.
- En Intel XPU es necesario instalar torch desde el indice XPU antes de usar .to("xpu"); el wheel por defecto de pip no incluye soporte XPU.
- Latencia y throughput: no disponibles. El autor solo indica que en XPU la generacion por lotes con left-padding distorsiona la salida y que hay que usar batch=1 alli, mientras que el batching de vLLM es seguro.
- Recomendaciones de generacion: decodificacion greedy (do_sample=False), enable_thinking=False y max_new_tokens=96.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas de traduccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Origa Translator ep1 | Adaptador LoRA sobre base QAT 2B | 24,16 M entrenables | JA -> EN, RU, KO, VI (zero-shot en my, bm, th) | BSL 1.1 (adaptador); Apache 2.0 (base) | HuggingFace, 0 descargas |
| google/gemma-4-E2B-it-qat-w4a16-ct (base sin adaptador) | Modelo base QAT w4a16 | no disponible | Multilingue general; 0/24 en la prueba zero-shot del autor | Apache 2.0 | HuggingFace |
| Otros modelos candidatos del informe A/B | no disponible | no disponible | no disponible | no disponible | El autor compara contra 6 modelos base candidatos, pero no los nombra ni publica sus cifras en la informacion disponible |

No se dispone de datos suficientes para comparar con alternativas de traduccion del mismo tamano (por ejemplo, adaptadores LoRA para NLLB o modelos tipo MADLAD), por lo que esa comparacion queda como no disponible.

## Limitaciones y advertencias
- Traducciones parciales residuales en vietnamita por cambios de registro y cortesia entre los pronombres thân, mình y bạn, y casos raros de inversion posesiva en ingles. El autor los atribuye a un limite de capacidad de la base 2B y senala que ampliar los datos no los elimino.
- Las salidas en locales no entrenados (malayo, birmano, tailandes) son utilizables pero no estan auditadas; no deben usarse en produccion sin revision humana.
- Evaluacion no independiente: la unica metrica publicada proviene de una revision manual de 200 frases realizada por el propio autor del proyecto. No hay benchmark externo, ni chrF ni BLEU publicados en la informacion disponible.
- El adaptador se declara explicitamente como componente de un pipeline de contenidos, no como sistema de traduccion automatica de proposito general.
- Riesgo de alucinacion: no se documenta de forma especifica, pero al ser un modelo generativo de traduccion puede producir texto fluido y semanticamente incorrecto en frases fuera de dominio; el autor recomienda combinarlo con un juez de recuperacion y una etapa de limpieza.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, de genero o culturales.
- Limitaciones de idioma: solo se han validado cinco idiomas (origen japones y cuatro destinos). El enrutado de idioma puede fallar y requiere reintento con instruccion en japones, aunque en la prueba interna de 200 frases ese reintento nunca se activo.
- Restricciones de licencia: el adaptador y el codigo se publican bajo BSL 1.1, una licencia de tipo Business Source que restringe el uso en produccion y el uso comercial hasta su fecha de conversion, no disponible en la informacion proporcionada. El modelo base es Apache 2.0. Hay que revisar el texto completo de la licencia antes de cualquier despliegue comercial.
- El corpus de entrenamiento no se ha liberado, lo que impide auditar la composicion de los datos y reproducir el entrenamiento.
- En Intel XPU, la generacion por lotes con left-padding distorsiona la salida; hay que usar batch=1 o pasar por vLLM.
- Repositorio sin traccion: 0 descargas y 0 valoraciones, sin comunidad que haya validado los resultados de forma independiente.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/yurvon-screamo/origa-translator-ep1
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Repositorio del proyecto Origa: https://github.com/yurvon-screamo/origa
- Licencia BSL 1.1: https://github.com/yurvon-screamo/origa/blob/master/LICENSE
- Informe A/B contra 6 modelos base: https://github.com/yurvon-screamo/origa/blob/master/translator/docs/REPORT_AB_6MODELS.md
- Script de evaluacion y envoltorio de prompts: https://github.com/yurvon-screamo/origa/blob/master/translator/scripts/eval_wrapper.py
