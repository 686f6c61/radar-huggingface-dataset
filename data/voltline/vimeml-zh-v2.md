# Voltline/vimeml-zh-v2

## Resumen

VimeML Chinese v2 es una familia de modelos decoder-only de tipo GPT diminuto, desarrollada por Voltline, orientada especificamente a motores de entrada de pinyin para chino simplificado. A diferencia de un modelo conversacional al uso, el modelo cumple tres funciones dentro de un IME: generacion de frases completas a partir de las teclas pulsadas (pinyin completo, iniciales o mixto), reranking de los candidatos que produce el motor de entrada y prediccion de frases tras el cursor. La version 20m, la unica publicada en el momento de redactar esta ficha, tiene 20.036.736 parametros y una ventana de contexto de solo 128 tokens.

La relevancia tecnica esta en su planteamiento de despliegue: el modelo no se distribuye como integracion de `AutoModel` en Transformers, sino como un modelo PyTorch propio con tokenizador SentencePiece de 12.288 piezas, diccionario de lecturas en formato Rime y busqueda por haces implementada fuera de la red. Incluye ademas un paquete Core ML INT8 con cache KV batcheado para iPhone (iOS 18), lo que lo convierte en un ejemplo poco habitual de modelo linguistico empaquetado para inferencia en dispositivo con cuantizacion por bloques.

El repositorio (0,1 GB) contiene los pesos FP32, los paquetes Core ML, el codigo fuente congelado, el diccionario de lecturas y los artefactos de evaluacion. La version 200m y la 800m estan anunciadas pero no disponibles en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (d_model 384, 9 capas, 6 cabezas, SwiGLU 960, RMSNorm, posiciones aprendidas, embeddings atados) |
| Parametros totales | 20.036.736 (version 20m); 200m y 800m anunciadas, no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens; el contexto previo al cursor se limita a 64 caracteres |
| Tipos de cuantizacion | FP32 (state_dict PyTorch) e INT8 por bloques de 32 con cache KV (Core ML) |
| Idiomas soportados | Chino simplificado (zh) |
| Licencia | GPL-3.0-or-later con excepcion para App Store |
| Formato de pesos | PyTorch `weights.pt` (FP32) y `.mlpackage` Core ML (INT8) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only pequeno con normalizacion RMSNorm, activacion SwiGLU de dimension 960, posiciones aprendidas y embeddings atados entre entrada y salida. El tokenizador es SentencePiece unigram con 12.288 piezas e identificadores de tarea reservados (CTX 4, READ 5, OUT 6) que estructuran el prompt como `[BOS, CTX] + contexto + [READ] + teclas + [OUT]`. La generacion no usa decodificacion autoregresiva convencional: se ejecuta una busqueda por haces de 16 hipotesis por posicion de tecla, restringida por el diccionario de lecturas (una hipotesis solo puede anadir un caracter cuya lectura o inicial coincida con las siguientes teclas), y despues el mismo modelo, en modo lenguaje, reordena los 10 mejores textos con la puntuacion `gen_score + 1.6 × lm_score`.

El entrenamiento es por etapas encadenadas. Parte del checkpoint de vimeml-tiny-zh-v1, preentrenado sobre FineWeb2 `cmn_Hani` y LCCC durante 844.730 actualizaciones. Despues, 60.000 actualizaciones en tareas de pinyin con pares generados a partir de texto web y lecturas automaticas, incluyendo pinyin completo, abreviaturas mixtas, solo iniciales y errores de teclado. A continuacion, 30.000 actualizaciones de destilacion a nivel de token desde un modelo de 200M con el mismo tokenizador, para recuperar capacidad de modelado del lenguaje. La etapa final (`colloq-c40`, 30.000 actualizaciones) introduce texto coloquial: 208 de cada 512 ventanas proceden de parrafos conversacionales de FineWeb2 y dialogos de Douban, MMChat y Tieba, filtrados por reglas y por cribado de calidad con un LLM, con eliminacion de solapamiento con el conjunto de evaluacion.

## Capacidades

- Generacion de frases completas en chino a partir de pinyin completo, iniciales o cadenas mixtas, condicionada al texto previo al cursor.
- Reranking contextual de candidatos de un IME (integracion con librime y rime-ice en el cliente Vime).
- Prediccion de frases despues del cursor.
- Reordenacion mediante autopuntuacion en modo lenguaje del mismo modelo.
- Manejo de errores de teclado en la cadena de teclas de entrada.
- Soporte de diccionarios de lecturas alternativos en formato Rime `.dict.yaml` con lecturas por caracter.
- Inferencia en dispositivo mediante Core ML con cache KV batcheado (funciones `logits`, `scored`, `score` y `prefix` sobre una sola copia de pesos).
- No es un modelo de instrucciones ni de chat; no soporta tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Motor de entrada de pinyin en iPhone: el paquete Core ML INT8 con cache KV permite ejecutar generacion y puntuacion de frases en el dispositivo sin conexion, con un modelo de 20M parametros que cabe holgadamente en memoria.
- Reranking de candidatos en escritorio: integrado en el cliente Vime sobre librime y rime-ice, reordena la lista de candidatos del IME combinando la puntuacion de generacion con la del modelo de lenguaje.
- Prediccion de continuacion de frase: tras escribir una clausula, el modelo propone la siguiente frase usando el contexto previo al cursor (hasta 64 caracteres).
- Escritura rapida con solo iniciales: la busqueda por haces restringida por el diccionario de lecturas permite convertir secuencias de iniciales en frases completas, util en teclados moviles donde se abrevia.
- Tolerancia a errores de tecleo: los pares de entrenamiento incluyen errores de teclado, de modo que el modelo puede recuperar la frase pretendida cuando la cadena de teclas contiene fallos.
- Personalizacion de diccionario: un usuario o integrador puede sustituir el diccionario de lecturas por otro `.dict.yaml` en formato Rime para adaptar el vocabulario a un dominio concreto sin reentrenar.
- Despliegue en escritorio con los modelos 200m y 800m (cuando esten disponibles) para mayor calidad de reranking y generacion en equipos de sobremesa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `20m/evaluation/summary.json` con resultados agregados de test, alineacion y latencia, pero sin texto de benchmark. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de evaluaciones comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo de 20M parametros (20.036.736 parametros × 4 bytes ≈ 80 MB de pesos, mas activaciones y cache KV); el paquete Core ML INT8 reduce aun mas el peso en memoria.
- GPU recomendadas: no requiere GPU dedicada; el caso objetivo es iPhone con Core ML (iOS 18) y escritorio con CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) e incluso en CPU modesta; el cuello de botella es la busqueda por haces, no la memoria.
- Opciones de despliegue: inferencia PyTorch propia mediante `infer.py` y el codigo congelado en `source/`; Core ML en iPhone; no hay integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; el repositorio incluye resultados de latencia en `summary.json` que no se detallan aqui.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vimeml-zh-v2-20m | 20.036.736 | 128 tokens | IME pinyin (generacion, reranking, prediccion) | GPL-3.0-or-later con excepcion App Store | Publicado (2026-11-23) |
| vimeml-tiny-zh-v1 | no disponible | no disponible | Reranking y prediccion de IME | no disponible | Publicado (predecesor) |
| vimeml-zh-v2-200m | ~200M | no disponible | IME pinyin en escritorio | GPL-3.0-or-later | Anunciado, no disponible |
| vimeml-zh-v2-800m | ~800M | no disponible | IME pinyin en escritorio | GPL-3.0-or-later | Anunciado, no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes ni frente a otros modelos de IME en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado: no es un modelo de instrucciones ni de chat; no debe usarse para generacion de texto general, codigo o razonamiento.
- Contexto muy corto: 128 tokens de ventana y solo 64 caracteres de contexto previo al cursor, lo que limita la coherencia en parrafos largos.
- Un solo idioma: entrenado exclusivamente para chino simplificado; no soporta otros idiomas.
- Dependencia externa: la tokenizacion, el diccionario de lecturas, la busqueda por haces y el rescoring se ejecutan fuera de la red; el modelo no funciona correctamente sin ese codigo y el diccionario `vime_pinyin.dict.yaml` o uno equivalente en formato Rime.
- Riesgo de alucinacion: al ser un modelo de lenguaje pequeno, puede generar frases plausibles pero no pretendidas por el usuario; el reranking con `lm_score` mitiga pero no elimina este riesgo.
- Licencia GPL-3.0-or-later: el uso comercial exige cumplir la GPL; existe una excepcion especifica para distribucion en App Store recogida en `LICENSE-EXCEPTION`, pero cualquier otro uso comercial debe revisarse con cuidado.
- Sesgos: el entrenamiento incluye texto web y dialogos de foros (Douban, MMChat, Tieba) filtrados por reglas y cribado con LLM; pueden persistir sesgos de ese corpus, aunque no se documentan sesgos especificos.
- Disponibilidad parcial: solo la variante 20m esta publicada; las variantes 200m y 800m estan anunciadas sin fecha firme de publicacion.
- Sin datos de benchmarks publicos: no es posible evaluar su calidad frente a alternativas con cifras objetivas a partir de la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Voltline/vimeml-zh-v2
- Predecesor: https://huggingface.co/Voltline/vimeml-tiny-zh-v1
- Repositorio del autor en Hugging Face: https://huggingface.co/Voltline
