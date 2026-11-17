# workfunction/McBopomofoLM-models

## Resumen

McBopomofoLM-models es un paquete de conversión a Core ML de los modelos SlothE empleados por McBopomofoLM, un fork de McBopomofo (el método de entrada de zhuyin/bopomofo para macOS) que utiliza modelos neuronales para mejorar la selección de candidatos y sugerir correcciones de sílabas mal tecleadas. El autor es workfunction y los pesos originales provienen de Luigi/sloth-ime-models, publicados bajo licencia Apache-2.0.

El repositorio no contiene un modelo de lenguaje de propósito general, sino dos artefactos de inferencia optimizados para el Apple Neural Engine: un codificador SlothE-T de 25M parámetros cuantizado con paletas de 2 bits (ternario, sin pérdida) y un decodificador `pred_q35_60m` de arquitectura Qwen3.5 en fp16, con pesos compartidos entre dos familias de funciones (evaluación de log-probabilidades de textos dados y cálculo del log-softmax del siguiente token sobre un vocabulario de 16k).

Su relevancia es práctica: demuestra cómo llevar modelos de lenguaje pequeños a producción en un IME de escritorio con latencias de milisegundos (0,8 ms para el codificador y 2,3-7,9 ms para el decodificador en un M2) y con la práctica totalidad de las operaciones ejecutadas en la NPU. Es material de referencia para quien quiera integrar inferencia neuronal en aplicaciones nativas de Apple sin depender de servidores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador SlothE-T (multifunción L8/L16/L32/L64/L256) + decodificador transformer Qwen3.5 con Gated DeltaNet |
| Parametros totales | Codificador: 25M; decodificador: 60M (`pred_q35_60m`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Funciones L8/L16/L32/L64/L256 en el codificador; decodificador con chunks fijos de 16 tokens en Gated DeltaNet y funciones n16/n32/n64/n96 y t16/t32/t64/t96 |
| Tipos de cuantizacion | Codificador: paletizado de 2 bits (ternario, sin pérdida); decodificador: fp16 |
| Idiomas soportados | Chino (zh), con soporte de zhuyin/bopomofo y variantes TW/HK |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`.mlpackage`, `.mlmodelc` compilado), tabla de embeddings `enc25m_embed_f16.bin`, vocabularios y `dec_next_first.tsv` |

## Arquitectura y entrenamiento

El paquete combina dos redes. El codificador SlothE-T de 25M parámetros se distribuye como un paquete multifunción con cinco variantes de longitud (L8, L16, L32, L64 y L256); sus pesos ternarios se almacenan con paletas de 2 bits, lo que el autor describe como una cuantización sin pérdida. La búsqueda de embeddings se ejecuta fuera del grafo, en el llamador, a partir de la tabla fp16 `enc25m_embed_f16.bin`. El decodificador `pred_q35_60m` sigue la arquitectura Qwen3.5 e incorpora Gated DeltaNet, que se ejecuta en fragmentos fijos de 16 tokens. Un único archivo de pesos fp16 da servicio a dos familias de funciones: las t* (t16, t32, t64, t96; batch 3) devuelven log-probabilidades por token de textos dados y son idénticas bit a bit al decodificador de la versión v2.1.1; las n* (n16, n32, n64, n96; batch 1, con entrada `ids` rellenada por la derecha y `last` indicando el índice del último token real) devuelven el log-softmax completo del siguiente token sobre el vocabulario de 16k.

No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo base Luigi/sloth-ime-models, no descritos aquí. La innovación destacable es de despliegue: ambas redes se ejecutan exclusivamente en el Apple Neural Engine (`computeUnits = CPU_AND_NE`), con el 100 % de las operaciones del codificador y el 83-95 % de las del decodificador en la NPU. Frente a la implementación fp32 en CPU de Hugging Face, las funciones n* coinciden en el token top-1 en el 95,5 % de 288 prefijos (todas las discrepancias son casi empates), con una diferencia máxima de log-probabilidad sobre el top-50 de 0,31 nats en la mediana y 0,73 en el P95, atribuida al fp16 de la ANE. La primera compilación de todas las funciones tarda unos 3 minutos.

## Capacidades

- Puntuación de candidatos en un método de entrada zhuyin/bopomofo: el codificador y el decodificador permiten reordenar y seleccionar candidatos según su probabilidad contextual.
- Sugerencia de correcciones para sílabas mal tecleadas, mediante la función de siguiente token (n*) sobre el vocabulario de 16k.
- Cálculo de log-probabilidades por token de textos completos (funciones t*), útil para evaluar y puntuar hipótesis.
- Predicción del siguiente token con log-softmax completo sobre el vocabulario, con soporte de lotes de 1 a 3 según la familia de funciones.
- Manejo de variantes regionales del chino derivadas de OpenCC (`TWVariants.txt` y `HKVariants.txt`).
- Ejecución local en el dispositivo, sin llamadas a red, con verificación de integridad de cada archivo del bundle mediante tamaño y SHA-256 contra `runtime-manifest.txt`.
- No dispone de tool calling, capacidades de agente, visión, audio ni modo de razonamiento extendido; es un componente especializado de IME, no un asistente general.

## Casos de uso

- Selección de candidatos en McBopomofoLM: la aplicación usa las funciones n* para reordenar los candidatos del IME según la probabilidad del siguiente token dado el contexto tecleado, mejorando la precisión frente a un diccionario estático.
- Corrección de sílabas mal tecleadas: al detectar secuencias improbables, el decodificador sugiere la sílaba o palabra más verosímil, reduciendo el número de pulsaciones necesarias para corregir errores.
- Puntuación offline de textos en chino: las funciones t* devuelven log-probabilidades por token, lo que permite construir filtros de calidad o detectores de anomalías lingüísticas sin infraestructura de servidor.
- Integración en aplicaciones nativas de macOS/iOS: el formato `.mlmodelc` y el uso exclusivo de la ANE permiten empaquetar el modelo dentro de un binario de aplicación y ejecutarlo con latencias de 2-8 ms por llamada en un M2.
- Investigación sobre cuantización y despliegue en NPU: el repositorio documenta la conversión a paletas de 2 bits y la comparación numérica contra fp32, sirviendo como referencia reproducible para llevar modelos pequeños a Core ML.
- Prototipado de correctores ortográficos o predictores de texto para otras lenguas sinogramáticas, sustituyendo el vocabulario y la tabla de embeddings por los del idioma objetivo.
- Validación de integridad en producción: el manifiesto con SHA-256 por archivo permite verificar el bundle antes de cargarlo, un patrón reutilizable en aplicaciones que distribuyen pesos de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta métricas de despliegue y fidelidad numérica en un Apple M2:

| Metrica | Codificador | Decodificador t* | Decodificador n* |
|---|---|---|---|
| Operaciones en la ANE | 100 % | 86-95 % | 83-94 % |
| Latencia por llamada | ~0,8 ms | 2,6-7,9 ms (según longitud) | 2,3-3,1 ms |
| Fidelidad frente a HF fp32 (CPU) | no disponible | idéntico bit a bit a v2.1.1 | top-1 coincidente en 95,5 % de 288 prefijos |
| Diferencia de log-probabilidad (top-50) | no disponible | no disponible | 0,31 nats mediana; 0,73 nats P95 |

## Requisitos de hardware

- Ejecución exclusiva en Apple Neural Engine (`computeUnits = CPU_AND_NE`); no está pensado para GPU NVIDIA ni para CPU genérica.
- Hardware de referencia del autor: Apple M2. No se han publicado mediciones para M1, M3, M4, A-series u otros chips.
- VRAM: no aplica; el modelo reside en memoria unificada del SoC. El repositorio completo ocupa 0,3 GB, aunque el bundle en tiempo de ejecución es un subconjunto (`runtime/`).
- No cabe ni está destinado a GPUs de consumo tipo RTX 4090, A100 o H100: el formato Core ML y la dependencia de la ANE lo limitan al ecosistema Apple.
- Opciones de despliegue: Core ML a través de `.mlpackage` o del `.mlmodelc` compilado incluido en `runtime/`; no hay soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,8 ms por llamada al codificador y 2,3-7,9 ms por llamada al decodificador en M2. La primera compilación de todas las funciones requiere unos 3 minutos.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| McBopomofoLM-models (este) | 25M + 60M | Funciones L8-L256 y n16-n96/t16-t96 | Core ML, ANE | Apache-2.0 | Conversión especializada para IME zhuyin |
| Luigi/sloth-ime-models (base) | no disponible | no disponible | Pesos originales (formato no detallado) | Apache-2.0 | Modelo de origen; sin optimización Core ML |
| McBopomofo (original) | no aplica | no aplica | Aplicación macOS | no disponible | IME basado en diccionario, sin modelos neuronales |

No se dispone de datos de benchmarks que permitan comparar el rendimiento lingüístico de este paquete con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo especializado en chino con zhuyin/bopomofo; no es utilizable para otras lenguas ni como modelo conversacional.
- El vocabulario está fijado en 16k tokens y las variantes regionales se limitan a las derivadas de OpenCC para TW y HK.
- Dependencia estricta del Apple Neural Engine: no hay ruta de ejecución documentada para otras plataformas.
- Los scripts de conversión son de grado investigación: importan helpers del espacio de trabajo del autor no incluidos, por lo que documentan el proceso pero no se ejecutan de forma autónoma (`MCBPMF_LM_WORK` define la raíz del workspace).
- La fidelidad numérica no es exacta: hay un 4,5 % de discrepancias en el token top-1 y diferencias de hasta 0,73 nats en el P95, atribuidas al fp16 de la ANE.
- La revisión `v2.1.1` carece de funciones de siguiente token; usar la revisión incorrecta con la versión de la aplicación correspondiente puede romper la integración.
- No se documentan sesgos lingüísticos, tasas de alucinación ni evaluación cualitativa de la calidad de las correcciones.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse los avisos de atribución de `NOTICE.txt` y de las fuentes derivadas (OpenCC, Luigi/sloth-ime-models, Luigi/slothing-web).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción más allá de la aplicación del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/workfunction/McBopomofoLM-models
- Modelo base: https://huggingface.co/Luigi/sloth-ime-models
- Repositorio de McBopomofoLM: https://github.com/workfunction/McBopomofoLM
- Demo de Slothing Web: https://huggingface.co/spaces/Luigi/slothing-web
- OpenCC (variantes TW/HK): https://github.com/BYVoid/OpenCC
