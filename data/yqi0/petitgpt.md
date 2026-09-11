# yqi0/petitgpt

## Resumen

petitgpt es un modelo de lenguaje decoder-only de 124,6 millones de parametros desarrollado por Yang Qi (usuario yqi0) y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de un artefacto de investigacion construido desde cero ("from-scratch") con arquitectura transformer de 30 capas, anchura 576, FFN de 1536 y atencion con query grouping (GQA) de 9 cabezas de consulta y 3 de clave/valor. El checkpoint publicado, denominado alpha075, no procede de un paso de entrenamiento adicional, sino de una interpolacion lineal de parametros entre dos estados de un ajuste por instrucciones.

El modelo se posiciona explicitamente como material de estudio para reproducir mediciones, inspeccionar el pipeline de entrenamiento y analizar modos de fallo, no como asistente de proposito general. Su ventana de contexto es de 2.048 tokens y su vocabulario de 32.000 entradas, con embeddings de entrada y salida atados (tied embeddings). Los pesos se almacenan en FP32, lo que da un repositorio de aproximadamente 0,5 GB.

Su relevancia actual es metodologica: documenta con detalle inusual la procedencia de los datos (13.000 millones de tokens empaquetados), la mezcla de fuentes en dos fases de preentrenamiento y la ascendencia exacta del checkpoint, incluidas las ramas que se inicializaron a partir de el. Ademas, publica resultados congelados en ARC-Easy y PIQA bajo un protocolo de evaluacion por verosimilitud de respuesta multiple, comparable con las familias SmolLM y SmolLM2 de 135 M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion de consulta agrupada (GQA), RMSNorm y RoPE |
| Parametros totales | 124.635.456 (124,6 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en FP32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (no evaluado; la mezcla de datos es mayoritariamente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (FP32), con codigo PyTorch nativo ("native-pytorch") |
| Capas / anchura / FFN | 30 / 576 / 1536 |
| Atencion | 9 cabezas de consulta, 3 cabezas de clave/valor, dimension de cabeza 64 |
| Vocabulario | 32.000 tokens, embeddings de entrada y salida atados |
| Normalizacion | RMSNorm con epsilon 1e-6 |
| Posiciones | RoPE con theta 10000 y rotacion completa de cabeza |
| Dropout | 0,0 |
| Tamano del repositorio | 0,5 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico de 30 capas con anchura 576 y FFN de 1536, normalizacion RMSNorm (epsilon 1e-6), codificacion posicional rotary (RoPE con theta 10000 y rotacion completa de cabeza) y atencion con consulta agrupada: 9 cabezas de consulta frente a 3 cabezas de clave/valor con dimension de cabeza 64. El vocabulario es de 32.000 entradas y los embeddings de entrada y salida estan atados. El dropout es 0,0 y los pesos se almacenan y exportan en FP32.

El preentrenamiento consumio 13.000.005.634 tokens empaquetados y retenidos, distribuidos en 13.755.731 documentos, sobre los que el optimizador realizo 12.999.720.960 posiciones de entrada al modelo, con una unica exposicion por bloque y sin repeticion del recorrido de posiciones. Se estructuro en dos fases. La etapa A selecciono 10.000.003.234 tokens de cuatro fuentes: FineWeb-Edu deduplicado (71,11 %), DCLM-Edu (20,32 %), Wikipedia FineWiki EN (5,08 %) y Python-Edu (3,50 %). La etapa B selecciono 3.000.004.240 tokens de siete fuentes: FineWeb-Edu deduplicado (40,10 %), DCLM-Edu (22,92 %), contenido tutorial estructurado (11,46 %), Python-Edu (8,33 %), Wikipedia (5,73 %), PES2O (5,73 %) y StackExchange (5,73 %).

El postentrenamiento utilizo siete subconjuntos de instrucciones extraidos de la coleccion fijada HuggingFaceTB/smol-smoltalk (revision f73fe857d519ff6ac5af2ea67c4d3834da7b8bcc, configuracion default, split train). La innovacion metodologica destacable no esta en la arquitectura sino en la procedencia del checkpoint: los pesos publicados son una interpolacion de parametros, no un paso de optimizacion, segun la formula theta = theta_P2_step750 + 0,75 · (theta_P3_step320 − theta_P2_step750), ejecutada con cero actualizaciones del optimizador y cero pasos hacia atras. La ascendencia completa es: publicacion del tokenizador, preentrenamiento de etapa A (pasos 0 a 38.146), preentrenamiento continuado de etapa B (pasos 38.146 a 49.590, reanudacion exacta de estado completo, aceptado como Base), SFT de instrucciones concisas P2 (750 actualizaciones, inicializacion solo de pesos desde Base), adaptacion a instrucciones basicas P3 (padre B en el paso 320, no en el punto final 640) e interpolacion final. Este checkpoint no contiene las actualizaciones posteriores de destilacion de respuestas DeepSeek, SFT unificado, DPO, destilacion suave ni ramas LoRA, aunque varias ramas posteriores se inicializaron a partir de el.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad propia de un modelo de 124,6 M de parametros.
- Seguimiento basico de instrucciones, derivado de los siete subconjuntos de smol-smoltalk empleados en el postentrenamiento.
- Puntuacion por verosimilitud de respuestas candidatas, que es el uso bajo el que se publicaron los resultados de ARC-Easy y PIQA.
- Razonamiento de un solo turno de baja complejidad; no se documenta razonamiento multi-paso extenso.
- Generacion de codigo elemental, favorecida por la presencia de Python-Edu (3,50 % en etapa A, 8,33 % en etapa B) en el corpus.
- Capacidades multilingues: no evaluadas y no documentadas; la mezcla de datos de preentrenamiento es predominantemente en ingles.
- Tool calling / function calling: no documentado ni evaluado.
- Soporte de agentes: no documentado ni evaluado.
- Capacidades especiales (modo de pensamiento, vision, audio): no disponibles.
- Plantilla de chat y contrato de tokenizador incluidos en el paquete, identicos byte a byte a los originales del proyecto.

## Casos de uso

- Reproduccion de mediciones publicadas: el modelo permite replicar los resultados congelados de ARC-Easy y PIQA bajo el protocolo exacto descrito (completado zero-shot con formato "Question: …\nAnswer:", sin plantilla de chat, sin tokens de rol, sin ejemplos few-shot y con autocast desactivado), util para auditar pipelines de evaluacion.
- Estudio de mezclas de datos de preentrenamiento: con 13.000 millones de tokens y porcentajes de fuente documentados por etapa, sirve como caso de analisis de como la composicion de FineWeb-Edu, DCLM-Edu, Wikipedia, Python-Edu, PES2O y StackExchange afecta a las capacidades finales.
- Analisis de interpolacion de parametros: el checkpoint alpha075 permite estudiar si una interpolacion lineal entre dos estados de SFT preserva, degrada o combina comportamientos de sus modelos padre, un experimento reproducible con coste de computo minimo.
- Linea base para entrenamiento desde cero: al ser un modelo de 124,6 M con receta completa publicada, se puede comparar contra arquitecturas propias del mismo orden de magnitud bajo el mismo tokenizador y corpus.
- Estudio de tokenizacion y contrato de tokens: el paquete incluye un modulo de tokenizador con vocabulario de 32.000 entradas, util para analizar empiricamente como afecta la segmentacion al comportamiento de un modelo pequeno.
- Evaluacion de protocolos de scoring en respuesta multiple: el modelo puntua candidatos por verosimilitud y publica tanto acc como acc_norm, lo que lo convierte en un banco de pruebas para estudiar el efecto de la normalizacion por longitud de respuesta.
- Analisis de modos de fallo: con 2.048 tokens de contexto, ingles casi exclusivo y sin evaluacion de seguridad, es adecuado para documentar comportamiento de alucinacion y degradacion fuera de distribucion en modelos pequenos.
- Prototipado ligero en entornos con recursos minimos: sus 124,6 M de parametros permiten experimentar en CPU o en GPU de gama baja antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados publicados por el autor, congelados en FP32 y copiados sin recalculo. Protocolo: completado zero-shot crudo "Question: …\nAnswer:" puntuado por verosimilitud de la respuesta candidata, sin plantilla de chat, sin tokens de rol, sin ejemplos few-shot, sin BOS, sin EOS puntuado, sin generacion y sin limpieza. Parametros y forward en FP32 con autocast desactivado, TF32 desactivado para matmul y cuDNN, SDPA matematico, tamano de lote 1 sin relleno, sin cache KV y sin compilacion.

| Dataset | Split / documentos | acc | acc_norm |
|---|---|---|---|
| ARC-Easy | test / 2.376 | 1372/2376 = 0,5774 | 1244/2376 = 0,5236 |
| PIQA | validation / 1.838 | 1167/1838 = 0,6349 | 1145/1838 = 0,6230 |

Comparadores medidos bajo el protocolo identico y sobre las mismas filas:

| Modelo | acc ARC-Easy | acc PIQA |
|---|---|---|
| petitgpt (alpha075) | 0,5774 | 0,6349 |
| SmolLM-135M-Instruct | 0,4924 | 0,6708 |
| SmolLM2-135M-Instruct | 0,5400 | 0,6670 |

El evaluador es una implementacion nativa compatible con el protocolo, fijada a un commit concreto de lm-evaluation-harness. No se publican resultados de MMLU, HumanEval, GSM8K ni de ningun benchmark generativo publico. El autor declara explicitamente que no se han evaluado el trabajo en contexto largo, el comportamiento multilingue, el uso de herramientas, el dialogo multi-turno extendido, la seguridad y el rechazo, la vigencia factual ni la recuperacion.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB solo de pesos, mas activaciones y cache KV (despreciable con 2.048 tokens de contexto).
- VRAM estimada en FP16/BF16: en torno a 250 MB de pesos.
- VRAM estimada en INT8: en torno a 125 MB; en INT4, en torno a 65-70 MB (conversiones no publicadas oficialmente por el autor).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo tambien es viable en CPU y en GPU integradas.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU modernas y en dispositivos tipo Raspberry Pi si se convierte a formatos ligeros.
- Opciones de despliegue: al ser un artefacto "native-pytorch" con modulos propios (modelo, plantilla de chat y contrato de tokens), lo habitual es cargarlo con PyTorch activando codigo remoto o con el codigo del proyecto. vLLM, TGI, llama.cpp y Ollama requeririan conversion previa, no documentada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ARC-Easy (acc) | PIQA (acc) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| petitgpt (alpha075) | 124,6 M | 2.048 | 0,5774 | 0,6349 | Apache-2.0 | HuggingFace, pesos FP32 |
| SmolLM-135M-Instruct | 135 M | 2.048 | 0,4924 | 0,6708 | Apache-2.0 | HuggingFace |
| SmolLM2-135M-Instruct | 135 M | 8.192 | 0,5400 | 0,6670 | Apache-2.0 | HuggingFace |
| GPT-2 | 124 M | 1.024 | no medido bajo este protocolo | no medido bajo este protocolo | MIT | HuggingFace |

La comparacion directa solo es valida en ARC-Easy y PIQA, unicos benchmarks medidos bajo el protocolo identico. petitgpt supera a SmolLM-135M-Instruct y a SmolLM2-135M-Instruct en ARC-Easy, pero queda por debajo de ambos en PIQA. La diferencia de contexto es notable: SmolLM2-135M-Instruct ofrece 8.192 tokens frente a los 2.048 de petitgpt. El dato de GPT-2 se incluye solo como referencia de tamano, ya que no se ha evaluado bajo este protocolo.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no esta pensado como asistente general, sistema en produccion ni fuente de respuestas factuales.
- No esta certificado en seguridad ni en correccion; no debe ejecutarse el codigo que genere sin revision independiente.
- Riesgo de alucinacion elevado, coherente con un modelo de 124,6 M de parametros entrenado sobre 13.000 millones de tokens: la vigencia factual no se ha evaluado y no hay garantia de veracidad.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o dialogos extensos.
- El comportamiento multilingue no se ha evaluado; la mezcla de datos es mayoritariamente en ingles, por lo que el rendimiento en castellano u otros idiomas es impredecible.
- No se ha evaluado el uso de herramientas, el razonamiento multi-paso ni el dialogo multi-turno extendido.
- Sesgos conocidos: no documentados de forma especifica, pero heredables de FineWeb-Edu, DCLM-Edu, Wikipedia, StackExchange y PES2O.
- El postentrenamiento depende de smol-smoltalk en una revision fijada; el autor advierte que los componentes incorporados tienen licencias declaradas heterogeneas (Apache-2.0, ODC-BY y un componente sin licencia declarada en su tarjeta), y que no se establece ninguna determinacion legal ni la revision de cada componente.
- Las cadenas de licencia registradas para las fuentes de preentrenamiento son evidencia de lo capturado en cada revision fijada, no una determinacion legal ni la licencia vigente hoy.
- El checkpoint no contiene ramas posteriores (destilacion de respuestas DeepSeek, SFT unificado, DPO, destilacion suave, LoRA); no deben sumarse las exposiciones de las ramas derivadas a la historia de entrenamiento de este modelo.
- Los pesos se exportan en FP32 sin cambios numericos, lo que implica que no hay una version oficial cuantizada ni optimizada para inferencia de baja latencia.
- Repositorio sin descargas ni likes en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks generativos publicos: la validacion externa es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yqi0/petitgpt
- Conjunto de datos de postentrenamiento referenciado: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Archivo de procedencia del checkpoint dentro del repositorio: MODEL_PROVENANCE.json
- Tabla de mezcla de fuentes de preentrenamiento dentro del repositorio: tables/PRETRAIN_SOURCE_MIXTURE.csv
- Configuracion completa derivada del checkpoint dentro del paquete: config.json
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo ni a su ecosistema.
