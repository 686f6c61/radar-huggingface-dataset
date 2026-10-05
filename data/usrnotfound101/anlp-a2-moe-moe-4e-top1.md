# usrnotfound101/anlp-a2-moe-moe-4e-top1

## Resumen

`usrnotfound101/anlp-a2-moe-moe-4e-top1` es un modelo de traduccion automatica neuronal entrenado desde cero, con arquitectura transformer decoder-only, desarrollado por el usuario `usrnotfound101` en el marco de la asignatura ANLP (Assignment 2, Part 1). Su tarea es la traduccion de vietnamita y japones hacia ingles, en una unica direccion. Se trata de un modelo de investigacion academica, no de un modelo de produccion: cuenta con 0 descargas y 0 likes en HuggingFace en el momento de redactar esta ficha.

Tecnicamente es un modelo MoE (mixture of experts) con 4 expertos en la capa FFN y enrutamiento top-1, disenado de forma que el numero total de parametros coincida con el de una variante densa equivalente. Tiene 35.408.384 parametros totales, de los cuales 25.971.200 se activan por token. La FFN concentra 12.595.200 parametros totales, pero solo 3.158.016 activos por token. El cuerpo del modelo es pequeno: 6 capas, `d_model` de 512 y 8 cabezas de atencion, entrenado con 36.824.882 tokens no de relleno.

Su relevancia es fundamentalmente didactica y experimental: sirve como banco de pruebas reproducible para comparar variantes de FFN (densa frente a MoE con distinto numero de expertos y politicas de enrutamiento) sobre un corpus paralelo trilingue en/vi/ja de 500.000 tripletas. No compite con sistemas de traduccion comerciales ni con modelos multilingues de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con FFN de tipo mixture-of-experts (MoE), 4 expertos, enrutamiento top-1 |
| Parametros totales | 35.408.384 |
| Parametros activos | 25.971.200 por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors sin cuantizar publicados) |
| Idiomas soportados | vietnamita (vi), japones (ja) e ingles (en); traduccion vi -> en y ja -> en |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json` y codigo propio en `common.py` |
| Capas | 6 |
| Dimension del modelo (`d_model`) | 512 |
| Cabezas de atencion | 8 |
| Parametros FFN (total / activos) | 12.595.200 / 3.158.016 |
| Tokenizador | SentencePiece unigram conjunto (`mt_spm.model`), con byte fallback y sin romanizacion |
| Tokens de entrenamiento (sin padding) | 36.824.882 |
| Dataset | `belumind/en-vi-ja-curated-500k-triplets` |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | translation |
| Metricas declaradas | BLEU, chrF, perplejidad |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only entrenado desde cero, sin inicializacion a partir de pesos preentrenados. La innovacion que se evalua en este experimento esta en la capa feed-forward: en lugar de una FFN densa unica, se emplean 4 expertos con enrutamiento top-1, es decir, cada token se dirige a un unico experto. El objetivo declarado del autor es mantener el mismo numero total de parametros que una variante densa equivalente, de modo que la comparacion entre ambas aísle el efecto del enrutamiento y no el del aumento de capacidad. El presupuesto de computo por token se reduce a unos 25,97 millones de parametros activos frente a los 35,41 millones totales.

El entrenamiento consume 36.824.882 tokens no de relleno procedentes de `belumind/en-vi-ja-curated-500k-triplets`, un corpus de 500.000 tripletas en ingles, vietnamita y japones. El formato de prompt es explicito y basado en etiquetas de idioma: `<vi> fuente <en>` o `<ja> fuente <en>`, tras lo cual el modelo continua generando la traduccion al ingles y el token `</s>`. El tokenizador es un SentencePiece unigram conjunto con byte fallback y sin romanizacion, lo que implica que el japones se procesa sin transliterar a romaji. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de ajuste por preferencias, ni detalles sobre la composicion exacta del dataset, la estrategia de enrutamiento durante la inferencia o el balanceo de carga entre expertos.

## Capacidades

- Traduccion de vietnamita a ingles (BLEU de 32,43 en el conjunto de test).
- Traduccion de japones a ingles (BLEU de 25,31 en el conjunto de test).
- Generacion autoregresiva condicionada por etiqueta de idioma de origen mediante el formato `<vi> ... <en>` / `<ja> ... <en>`.
- Modelado de lenguaje causal en el sentido estricto de decoder-only (la cabeza de salida predice el siguiente token, no solo la traduccion).
- Manejo de caracteres fuera de vocabulario gracias al byte fallback del tokenizador SentencePiece.
- Uso de enrutamiento top-1 con 4 expertos, lo que permite analizar el reparto de tokens entre expertos si se instrumenta el modelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.
- No se documenta la direccion inversa (en -> vi, en -> ja) ni la traduccion directa vi <-> ja.

## Casos de uso

- Traduccion de documentacion tecnica vi -> en y ja -> en: el modelo acepta texto plano con el prefijo de idioma y devuelve la traduccion en una sola pasada, lo que permite integrarlo en un script de conversion por lotes de manuales o notas de version.
- Preprocesamiento de corpus para entrenar modelos mayores: al ser un modelo de 35 millones de parametros, puede ejecutarse sobre grandes volumenes de texto vietnamita y japones para generar traducciones preliminares al ingles antes de una fase de filtrado o de revision humana.
- Subtitulado automatico: cada linea de subtitulo se traduce de forma independiente con el prompt correspondiente, lo que encaja con la naturaleza oracion a oracion del entrenamiento y evita depender de contexto largo.
- Localizacion de catalogos de producto en comercio electronico: descripciones breves de producto escritas en vietnamita o japones se traducen al ingles para reutilizar la ficha en mercados angloparlantes.
- Anotacion y aumento de datos multilingues: generacion de pares vi-en y ja-en sinteticos para ampliar datasets de entrenamiento de otros sistemas, siempre con verificacion posterior.
- Investigacion academica y docencia en procesamiento de lenguaje natural: el repositorio incluye `results.json`, `train_log.json`, `expert_usage.json` y graficas, lo que permite reproducir el analisis del enrutamiento top-1 y compararlo con variantes densas del mismo ejercicio.
- Despliegue en entornos con recursos muy limitados: por su tamano (unos 71 MB en precision de 16 bits), puede ejecutarse en CPU o en GPU integrada para traduccion puntual sin conexion.

## Benchmarks y rendimiento

Resultados en el conjunto de test declarados por el autor en la model card:

| Metrica | Global | vi -> en | ja -> en |
|---|---|---|---|
| BLEU | 28,91 | 32,43 | 25,31 |
| chrF | 51,03 | no disponible | no disponible |
| Perplejidad | 7,665 | 6,414 | 9,159 |

No se han publicado en la informacion disponible resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) ni tablas de comparacion frente a otros sistemas de traduccion. El autor no aporta cifras de latencia, throughput ni consumo de memoria.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 142 MB en fp32 y unos 71 MB en fp16 o bf16, partiendo de los 35,41 millones de parametros. En int8 serian unos 35 MB y en int4 unos 18 MB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU consumer es suficiente y sobra capacidad; una RTX 4090, una A100 o una H100 estarian enormemente sobredimensionadas para este modelo. Bastan una GTX 1650, una GPU integrada reciente o incluso CPU.
- Cabe sin problema en GPU consumer: si, en cualquiera con al menos 1 GB de memoria libre, y tambien en CPU.
- Opciones de despliegue: el autor proporciona codigo propio (`common.py`) con la funcion `load_model_dir`, por lo que la via natural es PyTorch con ese codigo personalizado. No se publican pesos en formato GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa no documentada. Tampoco hay soporte declarado para vLLM o TGI, que ademas necesitarian implementar el modelo MoE y el formato de prompt especificos. Alternativas viables serian una exportacion a ONNX.
- Latencia y throughput estimados: no disponible. No se publican mediciones; dada la profundidad de 6 capas y `d_model` de 512, se espera una latencia de orden de milisegundos por frase en hardware moderno, pero se trata de una estimacion no verificada.
- Nota sobre el repositorio: el tamano declarado del repositorio (1,4 GB) es muy superior al de los pesos en fp32 (unos 142 MB); la informacion disponible no detalla que archivos explican esa diferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: el autor no publica una tabla frente a otras variantes del mismo ejercicio (densa u otras configuraciones MoE) ni frente a modelos de traduccion externos. Tampoco se han encontrado en la busqueda web resultados relevantes que permitan establecer una comparacion fiable.

| Modelo | Parametros | Contexto | BLEU (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-moe-moe-4e-top1 | 35.408.384 totales / 25.971.200 activos | no disponible | 28,91 global | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no puede asumirse que el uso comercial este permitido; conviene contactar con el autor antes de cualquier explotacion.
- Es un modelo de asignatura, sin garantias de mantenimiento, soporte ni versionado. Presenta 0 descargas y 0 likes, por lo que no tiene validacion por parte de la comunidad.
- Traduccion unidireccional: solo vi -> en y ja -> en. No se documenta el sentido inverso ni la traduccion directa entre vietnamita y japones.
- Riesgo de alucinacion inherente a un modelo generativo entrenado con solo 36,8 millones de tokens: en entradas fuera de dominio puede producir salidas plausibles pero incorrectas, omitir contenido o inventar terminos.
- Capacidad limitada por tamano: 6 capas y `d_model` de 512 restringen la calidad en frases largas, discurso complejo o terminologia especializada.
- La longitud de contexto no esta documentada, lo que impide planificar el troceado de documentos largos de forma segura.
- Los sesgos del modelo dependen del corpus `belumind/en-vi-ja-curated-500k-triplets`, cuya composicion, filtrado y posibles desequilibrios no se detallan.
- El formato de prompt es obligatorio: omitir las etiquetas `<vi>` o `<ja>` y `<en>` degradara la salida, ya que no hay una interfaz de chat ni plantilla alternativa.
- Depende de codigo personalizado del repositorio para cargarse, lo que anade friccion de integracion y riesgo de incompatibilidad con versiones futuras de las librerias.
- Las fechas de creacion y actualizacion del repositorio (2026) son posteriores a las de la mayoria de dependencias del ecosistema; conviene verificar la compatibilidad del entorno antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usrnotfound101/anlp-a2-moe-moe-4e-top1
- Dataset utilizado: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Archivos adicionales del repositorio: `results.json`, `train_log.json`, `expert_usage.json`, graficas `*.png` y `common.py` (disponibles en la pestana de archivos del modelo)
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales relacionados con este modelo.
