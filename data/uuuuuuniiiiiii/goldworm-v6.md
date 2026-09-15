# Uuuuuuniiiiiii/goldworm-v6

## Resumen

GoldWorm v6 es un modelo de lenguaje causal de tipo transformer a nivel de byte (byte-level), desarrollado por el usuario Uuuuuuniiiiiii y publicado en HuggingFace bajo licencia MIT. Se trata de un modelo extremadamente compacto, con 2.757.504 parametros segun la configuracion declarada por el autor (2.806.656 en el fichero `model.safetensors`, diferencia atribuible a la duplicacion de las embeddings atadas al exportar), disenado para generar texto narrativo sencillo. Su proposito es servir como banco de pruebas eficiente y reproducible para modelado de lenguaje a nivel de byte, entrenado sobre el corpus TinyStories.

El modelo emplea una arquitectura `ByteTransformer` con vocabulario de 256 simbolos (un byte por token, sin tokenizador), `d_model=192`, 6 capas, 4 cabezas de atencion, `ffn_mult=4`, longitud de contexto de 256 tokens y embeddings atados. Al operar a nivel de byte, evita por completo el sesgo de tokenizacion y puede procesar cualquier secuencia de bytes, aunque su capacidad de generar lenguaje coherente esta limitada por su tamano y por el dominio concreto de TinyStories (narrativa infantil en ingles muy simplificada).

Su relevancia actual es acotada pero clara: es un ejemplo reproducible de entrenamiento y evaluacion rigurosos con verificacion determinista (dos pasadas bit-identicas) y un protocolo de evaluacion documentado, lo que lo hace util como referencia educativa, como baseline ligero y como caso de estudio de eficiencia extrema, mas que como modelo de proposito general. El autor declara un resultado de 1,007349 BPC (bits por byte) en TinyStories-valid, por debajo del BPC a nivel de byte de GPT-2 124M (1,142985) sobre la misma metrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteTransformer (transformer causal decoder-only a nivel de byte) |
| Parametros totales | 2.757.504 (segun config del autor); 2.806.656 en `model.safetensors` |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (bytes) |
| Tipos de cuantizacion | No disponible (el autor solo publica pesos en `safetensors`, sin variantes cuantizadas) |
| Idiomas soportados | No disponible (el corpus de entrenamiento, TinyStories, esta en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (mas `config.json` y `eval_results.json`) |
| Vocabulario | 256 (byte-level, sin tokenizador) |
| Dimension del modelo | `d_model=192`, `n_layer=6`, `n_head=4`, `ffn_mult=4`, `tie_embeddings=True`, `dropout=0.0` |
| Tipo de tarea | text-generation |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal decoder-only que opera directamente sobre bytes: cada token de entrada es un byte (vocabulario de 256), lo que elimina la necesidad de un tokenizador BPE o SentencePiece. La configuracion concreta es `vocab_size=256, d_model=192, n_layer=6, n_head=4, ffn_mult=4, ctx=256, tie_embeddings=True, dropout=0.0`. Las embeddings de entrada y la proyeccion de salida estan atadas, y en el fichero exportado las embeddings atadas aparecen clonadas, lo que explica la diferencia entre los 2.757.504 parametros de la configuracion y los 2.806.656 del `safetensors` (49.152 parametros extra, equivalentes a 256 x 192).

El entrenamiento se realizo sobre el dataset `roneneldan/TinyStories`, en concreto sobre `TinyStories-valid.txt` (19,4 MB) para la evaluacion. El checkpoint publicado corresponde al paso 8000, seleccionado mediante validacion interna (`inner_val_windowed_bpc = 1.051187`). No se documenta en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset de entrenamiento ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones; el modelo parece ser un modelo base entrenado con el objetivo estandar de prediccion del siguiente byte. El autor menciona comprobaciones de paridad, replicacion y forma de chunk segun un documento interno `LLM_PARITY_ROADMAP.md`, y verificacion de determinismo con dos pasadas bit-identicas (`max_abs_diff_per_position_bits = 0.0`).

Como innovacion destacable, mas que arquitectonica, figura el protocolo de evaluacion reproducible: ventana deslizante con stride 16 y contexto 256 sobre un conjunto fijo de 129.429 posiciones de validacion externa, con la seleccion del checkpoint congelada antes de leer el conjunto `outer_val`, lo que refuerza la validez del resultado declarado.

## Capacidades

- Generacion de texto narrativo sencillo en ingles, en el dominio de TinyStories (cuentos infantiles con vocabulario y gramatica simples).
- Modelado de lenguaje a nivel de byte: puede procesar y predecir cualquier secuencia de bytes, sin depender de un tokenizador.
- Muestreo configurable: el demo permite generacion con temperatura y muestreo top-k.
- Ejecucion en CPU: su tamano minimo permite inferencia sin GPU.
- No hay evidencia de soporte de tool calling ni function calling en la informacion disponible.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso en la informacion disponible.
- No hay evidencia de capacidades multilingues, de vision, de audio ni de modo de razonamiento (thinking mode) en la informacion disponible.
- No hay evidencia de capacidades de generacion de codigo ni de matematicas mas alla de lo que pueda emerger de forma marginal del corpus de cuentos.

## Casos de uso

- Docencia y divulgacion de arquitecturas transformer: al ser un modelo de 2,76 M de parametros con configuracion explicita y dependencias minimas (torch, safetensors, numpy, streamlit), permite montar un laboratorio completo de carga, inferencia y evaluacion en una sola sesion practica.
- Baseline de investigacion a nivel de byte: sirve como punto de comparacion reproducible (BPC declarado 1,007349 en TinyStories-valid) para experimentos de tokenizacion, tamano de contexto o estrategias de muestreo.
- Pruebas unitarias y de integracion de pipelines de inferencia: su tamano permite ejecutar ciclos completos de carga y generacion en segundos dentro de CI, verificando el correcto funcionamiento de serializacion `safetensors` y del codigo de modelo.
- Prototipado de aplicaciones de generacion de texto en entornos con recursos minimos (Raspberry Pi, contenedores ligeros, dispositivos embebidos), donde el coste de memoria es inferior a 15 MB en fp32.
- Generacion de cuentos y texto infantil muy simplificado en ingles: es el dominio para el que fue entrenado, con calidad razonable dentro de sus limitaciones de coherencia a 256 bytes de contexto.
- Investigacion sobre eficiencia y determinismo: el protocolo de verificacion bit-exacta documentado lo hace util para estudiar reproducibilidad de entrenamiento y evaluacion a pequena escala.
- Experimentos de compresion y modelado de bytes: el uso de BPC como metrica lo conecta directamente con lineas de investigacion en compresion sin perdidas y modelado de secuencias crudas.

## Benchmarks y rendimiento

Los resultados declarados por el autor se refieren a BPC (bits por byte) sobre TinyStories-valid, no a benchmarks estandar como MMLU, HumanEval o GSM8K. La matriz `model-index` de la model card esta vacia (`results: []`), por lo que no hay resultados en benchmarks convencionales.

| Modelo / referencia | Parametros | Metrica | Resultado |
|---|---|---|---|
| GoldWorm v6 | 2,76 M | BPC completo (outer-val, TinyStories-valid, 129.429 posiciones) | 1,007349 |
| GoldWorm v6 | 2,76 M | BPC windowed inner-val (paso 8000) | 1,051187 |
| GPT-2 124M | 124 M | BYTE_BPC (misma metrica) | 1,142985 |
| GPT-2 124M | 124 M | TOKEN_BPC | 9,152823 |
| Baseline unigram | no disponible | BPC (add-k 0,01) | 4,437 |
| Baseline bigram | no disponible | BPC (add-k 0,01) | 3,317 |
| Referencia v1 (gate) | no disponible | BPC de referencia congelado | 2,566 |

Protocolo declarado: ventana deslizante con stride 16 y contexto 256 sobre un conjunto de evaluacion fijo; determinismo verificado con dos pasadas bit-identicas. El autor indica que la seleccion se congelo antes de leer `outer_val`. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,2 MB para los pesos en fp32 (2.806.656 parametros), unos 5,6 MB en fp16/bf16 y unos 2,8 MB en int8. El cache KV para contexto 256 es insignificante (6 capas, 4 cabezas, `d_model=192`, 256 posiciones).
- Cabe en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090 o integradas modernas; tambien en CPU, en Raspberry Pi y en dispositivos embebidos con unas pocas decenas de MB de RAM.
- GPU recomendadas: no se requiere GPU. Cualquier GPU con soporte CUDA es sobradamente suficiente; no hay datos que justifiquen A100 o H100 para este modelo.
- Opciones de despliegue: el autor proporciona un demo en Streamlit (`demo/app.py`) con dependencias `torch`, `safetensors`, `streamlit` y `numpy`, y un ejemplo de carga en Python con `ByteTransformer(config)` y `safetensors.torch.load_file`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no publicarse variantes GGUF ni un tokenizador estandar, su integracion en esos ecosistemas requeriria trabajo adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metrica declarada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GoldWorm v6 | 2,76 M | 256 bytes | BPC 1,007349 (TinyStories-valid) | MIT | HuggingFace, pesos safetensors |
| GPT-2 124M | 124 M | 1.024 tokens (token-level) | BYTE_BPC 1,142985 | MIT (pesos OpenAI) | Ampliamente disponible, multiples formatos |
| Modelos TinyStories (familia roneneldan) | aproximadamente 1 M a 33 M (segun variante) | no disponible | no disponible | no disponible | HuggingFace |
| Baseline unigram / bigram | no aplica | no aplica | BPC 4,437 / 3,317 | no aplica | referencias estadisticas del autor |

La comparacion directa mas solida es con GPT-2 124M, sobre el que el autor declara una mejora en BPC a nivel de byte pese a tener unas 44 veces menos parametros, si bien se trata de un modelo entrenado sobre un corpus mucho mas grande y diverso y evaluado aqui en el dominio restringido de TinyStories. No se dispone de datos comparativos de la familia TinyStories en la informacion proporcionada, por lo que sus cifras se marcan como no disponibles.

## Limitaciones y advertencias

- Dominio muy restringido: el entrenamiento se centra en TinyStories, un corpus de narrativa infantil simplificada en ingles; el rendimiento fuera de ese dominio sera previsiblemente pobre.
- Contexto muy corto: 256 bytes, equivalente a unas pocas frases, lo que limita la coherencia en generaciones largas y descarta casos de uso que requieran contexto extenso.
- Riesgo alto de alucinacion y de incoherencia: con 2,76 M de parametros y ausencia de ajuste por instrucciones, no cabe esperar fidelidad factual ni seguimiento de instrucciones complejas.
- Idiomas: aunque la arquitectura a nivel de byte es teoricamente agnostica al idioma, no hay evidencia de entrenamiento multilingue; la model card no declara idiomas soportados.
- Ausencia de benchmarks estandar: no hay resultados en MMLU, HumanEval, GSM8K ni metricas humanas; la unica evidencia de calidad es el BPC declarado por el propio autor.
- Reproducibilidad externa limitada: parte del proceso de verificacion se apoya en documentos internos (`LLM_PARITY_ROADMAP.md`) y en una ruta de repositorio local de Windows, no en artefactos publicos.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, pero el autor no ofrece garantias ni soporte; conviene citar la procedencia.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni mantenimiento evidenciados.
- Ausencia de tokenizador y de formatos alternativos (GGUF, ONNX) que faciliten su integracion en herramientas de despliegue estandar.
- El modelo no dispone de salvaguardas documentadas frente a generacion de contenido inapropiado; su uso en produccion orientada a usuarios exigiria filtros externos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Uuuuuuniiiiiii/goldworm-v6
- Dataset de entrenamiento/evaluacion: `roneneldan/TinyStories` (TinyStories-valid.txt, 19,4 MB, sha256 `94e431816c4cce81...`)
- Demo incluido en el repositorio del modelo: `demo/app.py` (Streamlit), con `demo/requirements.txt`
- Ficheros auxiliares publicados: `config.json`, `eval_results.json`, `model.safetensors`
- Referencia interna citada por el autor (no publica): `LLM_PARITY_ROADMAP.md`
- Repositorio fuente citado por el autor (ruta local de Windows, no accesible publicamente): `C:/Users/Student/GoldWorm/GoldWorm/goldworm-lm-v0/`
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a sitios sin relacion (Instagram), por lo que no se incluyen.
