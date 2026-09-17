# unignoramus/anlp-a2-p1-dense

# Ficha tecnica: unignoramus/anlp-a2-p1-dense

## Resumen

unignoramus/anlp-a2-p1-dense es un transformer decoder-only de 35,27 millones de parametros publicado por el usuario unignoramus como parte de un trabajo academico (ANLP Assignment 2, Part 1). Se trata de una de las cinco ablaciones de la capa feed-forward entrenadas con un presupuesto identico de 36,54 millones de tokens; en esta variante concreta la feed-forward es densa, sin mezcla de expertos (la propia ficha declara 0 expertos totales y 0 activos). El modelo traduce vietnamita y japones a ingles y reporta una perplexity de 9,53 y un BLEU de 28,76 en test.

El checkpoint se distribuye como un payload plano de `torch.save` con las claves `model`, `state` y `config`, dentro de un repositorio de 0,1 GB, bajo licencia MIT y con la libreria declarada como PyTorch. No se publican datos de longitud de contexto, vocabulario, configuracion de capas ni idiomas soportados mas alla de los pares de traduccion descritos en la model card.

Su relevancia es fundamentalmente experimental y docente: funciona como linea base densa frente a las otras cuatro variantes de feed-forward del mismo experimento, entrenadas con un presupuesto de tokens identico, lo que permite aislar el efecto de la arquitectura feed-forward en calidad de traduccion. No es un modelo orientado a produccion: con 36,54 millones de tokens de entrenamiento queda muy lejos del regimen optimo tipo Chinchilla (unos 700 millones de tokens para 35,27 millones de parametros segun la regla de 20 tokens por parametro) y carece de validacion comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con feed-forward densa |
| Parametros totales | 35,27 M |
| Parametros activos | 35,27 M (no aplica mezcla de expertos; la ficha declara 0 expertos totales / 0 activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados ni recetas de cuantizacion) |
| Idiomas soportados | vietnamita y japones como origen, ingles como destino (segun la model card); el campo de idiomas del repositorio no esta disponible |
| Licencia | MIT |
| Formato de pesos | `torch.save` (pickle) con claves `model`, `state` y `config`; no se ofrecen safetensors, GGUF ni ONNX |
| Dataset de entrenamiento | belumind/en-vi-ja-curated-500k-triplets |
| Tokens de entrenamiento | 36,54 M |
| Perplexity de test | 9,53 |
| BLEU de test | 28,76 |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | pytorch |
| Fecha de creacion | 2026-09-17 |
| Fecha de ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

La model card describe un transformer decoder-only con capa feed-forward densa, entrenado para traducir vietnamita e ingles y japones a ingles. El identificador `p1-dense` y la nota de que forma parte de "cinco ablaciones feed-forward entrenadas con un presupuesto identico de tokens" indican que el proposito del checkpoint es comparar variantes de la capa feed-forward (densa frente a otras configuraciones, previsiblemente mezcla de expertos) manteniendo constante el coste de entrenamiento. No se detallan el numero de capas, la dimension del modelo, el numero de cabezas de atencion, la posicion de las normalizaciones ni el tipo de embedding posicional.

El entrenamiento se realizo sobre el dataset belumind/en-vi-ja-curated-500k-triplets con 36,54 millones de tokens y una unica cifra reportada de perplexity de test (9,53) y BLEU de test (28,76). No se documenta el uso de RLHF, DPO, SFT multi-etapa, decodificacion especulativa ni tecnicas de atencion lineal; tampoco se indica la composicion exacta del dataset, el numero de pasos, el optimizador ni la configuracion de decodificacion empleada para calcular el BLEU. Los detalles de configuracion quedan accesibles unicamente en la clave `config` del checkpoint.

## Capacidades

- Traduccion de vietnamita a ingles dentro de un modelo decoder-only entrenado de forma supervisada sobre tripletas paralelas.
- Traduccion de japones a ingles en el mismo checkpoint, segun la descripcion del autor.
- Generacion de texto autoregresiva generica, derivada de la arquitectura decoder-only, aunque no se documenta su calidad fuera del par de traduccion.
- Modelo de investigacion para ablaciones de la capa feed-forward: permite comparar variantes densas y no densas bajo un presupuesto de tokens identico.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues mas alla de vietnamita, japones e ingles: no disponibles.
- Capacidades especiales (modo thinking, vision, audio, contexto largo): no disponibles.

## Casos de uso

- Prototipado rapido de traduccion vi-en y ja-en en local: con 35,27 M de parametros el modelo se ejecuta en CPU y en cualquier GPU consumer, lo que permite montar un servicio de traduccion de borrador sin coste de inferencia en la nube.
- Linea base en experimentos de ablacion: sirve como referencia densa frente a las otras variantes feed-forward del mismo autor, todas con 36,54 M de tokens de entrenamiento, para medir el efecto de la arquitectura en BLEU y perplexity sin confundirlo con el presupuesto de computo.
- Docencia e investigacion academica: el checkpoint es un caso de estudio reproducible de un pipeline de traduccion neuronal pequeno, con BLEU y perplexity publicados y licencia MIT para reutilizacion en materiales de curso.
- Pre-traduccion de grandes volumenes de texto en pipelines de datos: puede generar traducciones preliminares de contenido vi/ja para su posterior revision humana o para filtrar y clasificar documentos antes de pasarlos a un modelo de mayor calidad.
- Generacion de datos sinteticos de traduccion para aumentar datasets pequenos, aceptando que la calidad del BLEU reportado (28,76) exige filtrado y verificacion posterior.
- Componente embebido en aplicaciones de traduccion de bajo consumo: dado su tamano, se puede integrar en herramientas de escritorio, plugins de editor o dispositivos con recursos limitados cuando no se requiere calidad de traduccion de nivel comercial.
- Experimentacion con tecnicas de compresion: al ser un modelo tan pequeno y estar en formato `torch.save`, es un banco de pruebas comodo para cuantizacion, destilacion o conversion a otros runtimes, aunque el autor no publique recetas al respecto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Conjunto | Notas |
|---|---|---|---|
| BLEU | 28,76 | Test (dataset belumind/en-vi-ja-curated-500k-triplets) | No se especifica tokenizador ni metodo de calculo |
| Perplexity | 9,53 | Test (mismo dataset) | Valor reportado en la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, MMLU-Pro, evaluaciones multilingues comparables) ni comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 141 MB solo para pesos (35,27 M x 4 bytes), mas el overhead de activaciones y del runtime de PyTorch.
- VRAM estimada en FP16/BF16: aproximadamente 70 MB para pesos; en INT8, alrededor de 35 MB; en INT4, cerca de 18 MB. Estas cifras son estimaciones derivadas del numero de parametros: el autor no publica pesos cuantizados.
- Cabe holgadamente en cualquier GPU consumer, incluidas integradas y GPUs de generaciones antiguas con 2-4 GB de VRAM, y tambien en CPU para inferencia en lotes pequenos.
- GPU recomendadas: ninguna especifica. A100, H100 o RTX 4090 estan sobredimensionadas para este tamano; resultan utiles unicamente si se procesan lotes muy grandes o se reentrena el modelo.
- Opciones de despliegue: PyTorch nativo mediante `torch.load(..., weights_only=False)` y el codigo del transformer que acompana al repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF/ONNX; su uso requeriria una conversion previa no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la informacion proporcionada. La model card menciona que este checkpoint es una de cinco ablaciones feed-forward del mismo experimento, pero no identifica los repositorios de las otras cuatro variantes ni publica sus resultados, por lo que no es posible construir una comparativa con cifras fiables.

| Modelo | Parametros | Contexto | BLEU / perplexity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unignoramus/anlp-a2-p1-dense | 35,27 M | no disponible | BLEU 28,76 / ppl 9,53 en test | MIT | Checkpoint `torch.save`, 0 descargas |
| Otras ablaciones feed-forward del mismo experimento (p1-*) | no disponible | no disponible | no disponible | no disponible | Referenciadas pero no identificadas en la informacion disponible |
| Modelos de traduccion dedicados de la misma categoria (por ejemplo, familias tipo Marian/opus-mt o NLLB) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo experimental con 36,54 millones de tokens de entrenamiento: esta alrededor de 20 veces por debajo del presupuesto recomendado por la regla de Chinchilla para su tamano, por lo que es probable que este subentrenado en terminos de calidad final.
- Direccionalidad limitada: solo se declara traduccion de vietnamita y japones hacia ingles; no se documenta traduccion hacia vietnamita, hacia japones ni entre vietnamita y japones.
- BLEU de 28,76 en test: es una cifra modesta para traduccion automatica y sugiere que la salida requiere revision humana antes de cualquier uso publico o critico.
- Riesgo de alucinacion y de omisiones: no se publican evaluaciones de fidelidad, de manejo de nombres propios, numeros o terminologia especializada.
- Longitud de contexto no documentada, lo que impide planificar su uso con documentos largos; con un modelo de este tamano es razonable esperar ventanas cortas, pero no hay dato confirmado.
- Sesgos y cobertura: se desconoce la composicion del dataset belumind/en-vi-ja-curated-500k-triplets, el dominio de los textos (probablemente generico o conversacional) y cualquier sesgo demografico, dialectal o de dominio presente en los datos.
- Seguridad del formato de pesos: al ser un pickle, la carga requiere `weights_only=False`, lo que implica ejecucion de codigo arbitrario si el fichero se manipula. No hay version en safetensors.
- Licencia MIT: permite uso comercial y modificacion, pero se ofrece sin garantias y sin clausulas de uso responsable; el usuario asume la responsabilidad del cumplimiento normativo en su jurisdiccion.
- Ausencia de validacion externa: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones publicas que respalden el comportamiento del modelo.
- No hay informacion sobre el pipeline declarado en HuggingFace, ni sobre integracion con `transformers`, lo que complica su uso inmediato sin escribir codigo de carga propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p1-dense
- Dataset de entrenamiento: https://huggingface.co/datasets/belumind/en-vi-ja-curated-500k-triplets
- Codigo del transformer que acompana al checkpoint: no disponible (la model card lo menciona pero no incluye enlace)
- Paper o informe tecnico: no disponible
- Repositorio de codigo o demo: no disponible
- Otras ablaciones del mismo experimento: no disponible
