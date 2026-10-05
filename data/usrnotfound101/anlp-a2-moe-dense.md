# usrnotfound101/anlp-a2-moe-dense

## Resumen

`usrnotfound101/anlp-a2-moe-dense` es un modelo de traduccion automatica neuronal desarrollado por el usuario `usrnotfound101` como parte de la asignatura ANLP (Assignment 2, Part 1). Se trata de un Transformer decoder-only entrenado desde cero con el objetivo de traducir vietnamita e ingles y japones a ingles. A pesar del sufijo `moe` en el nombre del repositorio y de la etiqueta `mixture-of-experts`, la propia model card especifica que esta variante concreta usa una FFN densa estandar de dos capas (d -> 4d -> d): los parametros activos por token coinciden con los totales, por lo que no hay enrutado disperso.

El modelo es muy compacto: 35.396.096 parametros en total, 6 capas, d_model de 512 y 8 cabezas de atencion. Se entreno sobre 36.824.882 tokens no de relleno procedentes del dataset `belumind/en-vi-ja-curated-500k-triplets`. En el conjunto de test obtuvo una perplejidad global de 7,959 y un BLEU global de 29,78, con un rendimiento claramente mejor en vietnamita (BLEU 34,03) que en japones (BLEU 25,38).

Su relevancia es fundamentalmente academica y de referencia: sirve como ejemplo reproducible de un pipeline completo de traduccion (tokenizador SentencePiece conjunto, prompt de plantilla, evaluacion con BLEU/chrF/perplejidad) y como linea base ligera para tareas de traduccion vi->en y ja->en en entornos con recursos muy limitados. No es un modelo de proposito general ni compite con sistemas de traduccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only; FFN densa de 2 capas (d -> 4d -> d) |
| Parametros totales | 35.396.096 |
| Parametros activos | 35.396.096 (variante densa; no hay enrutado MoE pese a la etiqueta) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita y japones (entrada), ingles (salida); tokenizador con vietnamita, japones e ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Capas / d_model / cabezas | 6 / 512 / 8 |
| Parametros de la FFN (total / activos) | 12.582.912 / 12.582.912 |
| Tokens de entrenamiento (sin padding) | 36.824.882 |
| Tokenizador | SentencePiece unigram conjunto (`mt_spm.model`), con byte fallback y sin romanizacion |
| Formato de prompt | `<vi> origen <en>` o `<ja> origen <en>`; el modelo continua con la traduccion y `</s>` |
| Tamano del repositorio | 1,4 GB |
| Fecha de creacion / actualizacion | 2026-10-04 / 2026-10-04 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura Transformer decoder-only clasica, con 6 capas, dimension de modelo de 512 y 8 cabezas de atencion. La red feed-forward es la variante `dense`, es decir, un MLP estandar de dos capas con factor de expansion 4 (d -> 4d -> d), que concentra 12.582.912 de los 35.396.096 parametros totales. El repositorio incluye un fichero `expert_usage.json`, lo que sugiere que forma parte de una familia de experimentos con variantes MoE, aunque esta version concreta no usa expertos dispersos.

El entrenamiento se realizo desde cero sobre 36.824.882 tokens no de relleno del dataset `belumind/en-vi-ja-curated-500k-triplets`, que agrupa tripletas alineadas de vietnamita, japones e ingles. No hay informacion disponible sobre si se aplicaron tecnicas de alineacion posteriores como RLHF, DPO o fine-tuning supervisado adicional, ni sobre la composicion exacta del dataset mas alla de su nombre y tamano. La tokenizacion usa un SentencePiece unigram conjunto con byte fallback y sin romanizacion, lo que evita transformar el vietnamita o el japones antes de tokenizar. El formato de condicionamiento es explicito mediante etiquetas de idioma (`<vi>` o `<ja>`) y una etiqueta `<en>` que marca el inicio de la traduccion.

## Capacidades

- Traduccion de vietnamita a ingles y de japones a ingles, con un unico modelo y un prompt de idioma explicito.
- Generacion autoregresiva de texto con parada en el token `</s>`.
- Condicionamiento por etiqueta de idioma de origen (`<vi>` / `<ja>`), sin deteccion automatica de idioma.
- Manejo de caracteres fuera del vocabulario mediante byte fallback del tokenizador.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking), vision ni audio.
- Cobertura multilingue limitada a vietnamita, japones e ingles.

## Casos de uso

- Traduccion vi->en en articulos y noticias: el modelo acepta el texto en vietnamita con el prefijo `<vi>` y produce la traduccion en ingles, con un BLEU de 34,03 en test que lo hace util para pre-traduccion asistida por revisores humanos.
- Traduccion ja->en de documentacion tecnica: con BLEU 25,38 en japones, encaja mejor como primer borrador en flujos donde un editor humano corrige la salida antes de publicar.
- Preprocesado de corpus para entrenamiento: generar traducciones inglesas de grandes volumenes de texto vi/ja para aumentar datasets de entrenamiento de otros modelos, filtrando despues por calidad.
- Prototipado e investigacion academica: el repositorio incluye `common.py`, `train_log.json`, `results.json` y graficos, lo que permite reproducir el pipeline completo y usarlo como linea base en experimentos de traduccion de bajo coste.
- Despliegue en edge o en CPU: con 35,4 millones de parametros, el modelo puede ejecutarse en un portatil o en un contenedor sin GPU, util para demos offline o entornos sin acelerador.
- Normalizacion de contenido multilingue en pipelines internos: traduccion de tickets, comentarios o resenas escritas en vietnamita o japones a ingles para alimentar sistemas de analitica de texto.
- Ensenanza de arquitecturas Transformer: por su tamano reducido y su codigo incluido, es un caso practico para ilustrar el ciclo completo de tokenizacion, entrenamiento y evaluacion con metricas BLEU y chrF.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de test):

| Metrica | Global | Vietnamita | Japones |
|---|---|---|---|
| Perplejidad | 7,959 | 6,611 | 9,583 |
| BLEU | 29,78 | 34,03 | 25,38 |
| chrF | 51,39 | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no publicada por el autor): aproximadamente 142 MB en fp32, 71 MB en fp16/bf16 y del orden de 18-35 MB en cuantizacion de 4-8 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni RTX 4090. Una GTX 1050 o una iGPU moderna bastan.
- Cabe sin problema en GPU de consumo e incluso en CPU. El cuello de botella real es el tokenizador SentencePiece y la carga del codigo personalizado, no el modelo.
- Opciones de despliegue: el modelo requiere el codigo del repositorio (`common.py`, funcion `load_model_dir`). No hay pesos GGUF publicados, por lo que no es desplegable directamente en llama.cpp, Ollama ni LM Studio sin una conversion previa. Tampoco se documenta compatibilidad con vLLM o TGI, dado que la arquitectura se carga con codigo propio.
- Latencia y throughput estimados: no disponibles.
- Nota: el repositorio ocupa 1,4 GB pese a que los pesos en safetensors son mucho mas pequenos, probablemente por los graficos, logs y otros artefactos incluidos.

## Comparativa con modelos similares

Los datos de los modelos alternativos son referencias publicas generales y no proceden de la informacion proporcionada; se marcan como aproximados.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| usrnotfound101/anlp-a2-moe-dense | 35,4 M | no disponible | vi, ja -> en | no disponible | HuggingFace, requiere codigo propio |
| Helsinki-NLP/opus-mt (familia MarianMT) | ~74-77 M por par (aprox.) | ~512 tokens (aprox.) | multiples pares, incluido vi/en y ja/en | CC-BY 4.0 en la mayoria de variantes (aprox.) | HuggingFace, compatible con transformers |
| facebook/nllb-200-distilled-600M | 600 M (aprox.) | 512 tokens (aprox.) | 200 idiomas | CC-BY-NC 4.0 (aprox.) | HuggingFace, compatible con transformers |
| facebook/m2m-100 (418M) | 418 M (aprox.) | 1024 tokens (aprox.) | 100 idiomas | MIT (aprox.) | HuggingFace, compatible con transformers |

Diferencias clave: el modelo analizado es entre cinco y veinte veces mas pequeno que las alternativas, lo que reduce costes de inferencia pero tambien su cobertura linguistica y su facilidad de integracion, ya que requiere codigo personalizado en lugar de la API estandar de transformers.

## Limitaciones y advertencias

- Ambito limitado: solo traduce vi->en y ja->en. No soporta traduccion inversa (en->vi, en->ja) ni otros pares.
- Rendimiento desigual por idioma: la perplejidad en japones (9,583) es notablemente peor que en vietnamita (6,611), y el BLEU cae mas de ocho puntos entre ambos.
- Licencia no especificada: la ausencia de licencia explicita impide determinar si se permite el uso comercial. Debe tratarse como no apto para produccion comercial hasta aclararlo con el autor.
- Riesgo de alucinacion: al ser un modelo entrenado desde cero con solo 36,8 millones de tokens, es probable que generalice mal ante dominios, jerga o estructuras sintacticas no representadas en el corpus.
- Longitud de contexto desconocida: no se documenta la ventana maxima. Con 6 capas y d_model 512, es previsible que sea corta, lo que limita la traduccion de documentos largos sin troceado manual.
- Sin alineacion documentada: no hay evidencia de RLHF, DPO ni filtrado de salidas, por lo que puede reproducir sesgos presentes en el dataset de entrenamiento.
- Integracion compleja: requiere cargar codigo propio (`common.py`), lo que complica su uso en entornos de produccion estandar, en servidores de inferencia habituales y en despliegues con formatos GGUF.
- Cero traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion externa de los resultados declarados.
- Caracter academico: se trata de un entregable de asignatura, sin garantias de mantenimiento, soporte ni actualizaciones.
- Contradiccion en el etiquetado: el repositorio se llama `moe-dense` y lleva la etiqueta `mixture-of-experts`, pero la variante implementada es densa; conviene verificar cual de las variantes se esta usando antes de extraer conclusiones sobre eficiencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usrnotfound101/anlp-a2-moe-dense
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- No se han encontrado en la informacion disponible enlaces adicionales a papers, blogs, repositorios ni demos.
