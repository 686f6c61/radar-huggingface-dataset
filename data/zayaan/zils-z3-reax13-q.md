# Zayaan/zils-z3-reax13-q

## Resumen

zils-z3-reax13-q es un modelo de decisión publicado por el usuario Zayaan en Hugging Face, derivado directamente de decisionmodels/REAX-1.3 (revisión `fa4bf7ee`) sin modificar sus pesos. Se presenta como un "soup-pool body" del subconjunto `d3` (z3) de la subred 127 de Bittensor, es decir, una pieza de un ensemble o pool de modelos que se evalúa sobre un chasis fijo (`d3-ultra`, BF16) que aporta la capa de respuesta, el prompt y el runtime. El repositorio añade únicamente la model card y un fichero `zils-owner.json`; los pesos, la licencia y el NOTICE proceden del modelo original.

El modelo cuenta con 26.085.330.160 parámetros en formato safetensors (aproximadamente 26,1 mil millones) y un tamaño de repositorio de 52,2 GB, lo que es coherente con pesos en BF16. Su propósito no es la generación de texto generalista, sino la toma de decisiones puntuadas: clasificar peticiones, marcar problemas o puntuar coincidencias, según la propuesta de valor de la plataforma Zils. La relevancia actual radica en que ejemplifica un patrón de publicación de modelos orientados a tareas de decisión dentro de ecosistemas descentralizados, con evaluación basada en Brier skill calibrado en lugar de benchmarks generativos convencionales.

La información pública disponible es muy limitada: la model card no documenta arquitectura interna, composición del dataset de entrenamiento, idiomas soportados ni detalles del proceso de ajuste. La evaluación declarada por el autor se realizó sobre 1.191 ítems de decisión retenidos y no corresponde al examen privado de los validadores de la subred.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de decisionmodels/REAX-1.3; el chasis de evaluacion es d3-ultra en BF16) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. La model card indica que los tensores encajan en el layout del chasis `d3-ultra` en BF16 y que dicho chasis aporta la capa de respuesta, el prompt y el runtime durante la evaluación. El modelo base es decisionmodels/REAX-1.3, en la revisión `fa4bf7ee`, y los pesos se publican sin cambios respecto a ese origen; este repositorio no documenta ningún proceso adicional de entrenamiento, fine-tuning o alineación.

El autor atribuye los pesos a los autores de REAX-1.3 y a los modelos que estos acreditan, incluido vllm-sr/d3-ultra. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Toma de decisiones puntuada: el modelo está diseñado para tareas de clasificación, priorización y scoring de coincidencias, no para generación abierta de texto.
- Evaluación mediante Brier skill calibrado: la métrica declarada sugiere que el modelo produce puntuaciones probabilísticas calibradas sobre ítems de decisión.
- Integración en un pool de modelos: funciona como cuerpo (`body`) dentro de un ensemble evaluado sobre un chasis fijo que gestiona el prompt y la capa de respuesta.
- Formato de examen estandarizado: evaluado sobre ítems con formato de examen generados a partir de filas de datasets públicos, lo que indica capacidad para responder preguntas de opción o decisión estructurada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Triaje de solicitudes en atención al cliente: el modelo puede puntuar y clasificar tickets entrantes por categoría o urgencia, aprovechando su naturaleza de modelo de decisión para ordenar la cola antes de que intervenga un agente humano.
- Moderación y marcado de contenido: dado su enfoque en "flag problems", encaja en pipelines que asignan una puntuación de riesgo a publicaciones o mensajes y derivan los casos por encima de un umbral a revisión manual.
- Scoring de coincidencias en plataformas de emparejamiento: puede puntuar pares (oferta-demanda, candidato-vacante, usuario-contenido) para ordenar resultados, siempre que se calibre con datos propios del dominio.
- Enrutamiento de peticiones en sistemas backend: como clasificador previo que decide a qué servicio, modelo o cola derivar cada solicitud, reduciendo coste frente a invocar un modelo generativo grande en cada llamada.
- Evaluación comparativa dentro de un pool Bittensor: puede desplegarse como cuerpo del subconjunto `d3` y compararse con el chasis `d3-ultra` mediante Brier skill calibrado sobre ítems de examen del pool.
- Investigación sobre ensembles y calibración: sirve como componente para estudiar cómo se comportan cuerpos derivados de un mismo modelo base cuando se combinan en un soup-pool y se evalúan con métricas probabilísticas.
- Filtrado previo en pipelines de anotación: puede priorizar qué filas de un dataset requieren revisión humana, usando la puntuación del modelo como señal de confianza.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la evaluación local del autor, que no corresponde al examen privado de los validadores. Se realizó sobre 1.191 ítems de decisión retenidos (892 ítems en formato de examen escritos por Claude Opus 5.5 a partir de filas de datasets públicos, más 299 ítems de la familia actual `zils-ai/base-exam-seed-v1` a `-v4`), puntuados con el Brier skill calibrado de los validadores (`soup_grade.evaluate`, media de cinco particiones de calibración).

| Modelo | Brier skill calibrado (evaluación local) |
|---|---:|
| vllm-sr/d3-ultra (chasis del pool) | 84,95 |
| zils-z3-reax13-q (este cuerpo) | 87,37 |

En los ítems públicos del seed, el autor declara una ventaja de 2,31 puntos sobre d3-ultra. No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 mil millones de parámetros en BF16, los pesos ocupan aproximadamente 52 GB, por lo que se necesitan al menos 56-64 GB de VRAM para inferencia sin cuantizar, incluyendo overhead de activaciones y KV cache.
- En FP16/BF16: requiere GPU de clase数据中心 como A100 80 GB, H100 80 GB o dos GPU de 40-48 GB en paralelo.
- En cuantización de 8 bits: aproximadamente 26-30 GB de VRAM, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- En cuantización de 4 bits: aproximadamente 14-16 GB de VRAM, lo que permitiría ejecución en una única RTX 4090 de 24 GB, aunque no se documentan pesos cuantizados oficiales.
- No cabe en GPU de consumo de gama media (8-16 GB) sin cuantización agresiva y offloading a CPU.
- Opciones de despliegue: no se documentan explícitamente; por formato safetensors y tamaño, los candidatos habituales son vLLM, TGI y llama.cpp (este último requeriría conversión a GGUF, no publicada).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-reax13-q | 26,09 B | no disponible | Decisión y scoring | Apache-2.0 | Hugging Face (0 descargas) |
| decisionmodels/REAX-1.3 | no disponible | no disponible | Decisión (modelo base) | Apache-2.0 | Hugging Face |
| vllm-sr/d3-ultra | no disponible | no disponible | Chasis del pool d3 | Apache-2.0 | Hugging Face |

No se dispone de datos de parámetros, contexto ni rendimiento de los modelos comparables más allá de lo indicado. No se identifican en la información proporcionada otros modelos de decisión de tamaño similar con los que establecer una comparación cuantitativa adicional.

## Limitaciones y advertencias

- La model card es extremadamente escasa: no documenta arquitectura, datos de entrenamiento, idiomas ni proceso de alineación, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación y de calibración deficiente fuera de la distribución de los ítems de examen: la métrica declarada es una evaluación local del autor, no el examen privado de los validadores, y los resultados pueden diferir sustancialmente.
- El modelo no está pensado para generación de texto abierto; usarlo fuera de tareas de decisión o scoring probablemente produzca resultados pobres.
- Idiomas soportados no documentados: no hay garantía de comportamiento correcto en castellano ni en otros idiomas distintos del inglés de los datasets de examen.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones multi-turno largas o documentos extensos sin verificación empírica.
- Licencia Apache-2.0 permite uso comercial, pero el repositorio copia LICENSE y NOTICE del modelo original; conviene revisar las atribuciones de los modelos acreditados (incluido vllm-sr/d3-ultra) antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-06), lo que indica ausencia de validación comunitaria.
- No se publican pesos cuantizados, por lo que el despliegue en hardware de consumo requiere conversión propia y validación de la degradación de la métrica de calibración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zayaan/zils-z3-reax13-q
- Modelo base: https://huggingface.co/decisionmodels/REAX-1.3
- Chasis del pool: https://huggingface.co/vllm-sr/d3-ultra
- Organización Zils en Hugging Face: https://huggingface.co/zils-ai/models
- Sitio web de Zils: https://zils.ai/
