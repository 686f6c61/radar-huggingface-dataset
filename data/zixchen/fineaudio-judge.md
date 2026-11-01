# Zixchen/FineAudio-Judge

## Resumen

FineAudio-Judge es un adaptador LoRA de evaluación fina para generación texto-a-audio, desarrollado por el usuario Zixchen y publicado en HuggingFace bajo licencia Apache 2.0. No es un modelo generativo autónomo, sino un componente de juicio: dado un par audio-texto, descompone la descripción en eventos, atributos y relaciones entre eventos, los convierte en preguntas de rúbrica binarias (sí/no) y evalúa si el audio satisface cada aspecto del texto. La proporción de respuestas afirmativas constituye la puntuación global de consistencia audio-texto.

El adaptador se obtiene por ajuste supervisado (SFT) sobre Qwen3-Omni-30B-A3B-Instruct, un modelo omni-modal con arquitectura MoE de 30.000 millones de parámetros totales y 3.000 millones activos, con capacidad nativa de procesamiento de audio y texto. FineAudio-Judge reutiliza esa base y añade la capacidad específica de emitir juicios de rúbrica sobre audio, algo que el modelo base no está especializado en hacer de forma fiable.

Su relevancia actual radica en que cubre un hueco en la evaluación automática de sistemas de generación de audio: los benchmarks tradicionales (FAD, CLAP score) no capturan la alineación semántica fina entre escenas acústicas complejas y descripciones textuales detalladas. El adaptador pesa solo 0,1 GB y se carga junto con el modelo base, lo que facilita su integración en pipelines de evaluación existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE omni-modal (Qwen3-Omni-30B-A3B) |
| Parametros totales | 30B (modelo base); adaptador LoRA de rango 64, tamaño no disponible |
| Parametros activos | 3B (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantización pero no se especifica) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) + adapter_config.json |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64, con dropout 0,05, aplicado sobre Qwen3-Omni-30B-A3B-Instruct. El modelo base es un transformer con mezcla de expertos (MoE) de 30B parámetros totales y 3B activos, con codificador de audio integrado y pipeline audio-text-to-text. El adaptador no modifica la arquitectura del base: añade matrices de bajo rango en las capas seleccionadas para especializar la salida hacia juicios de rúbrica binarios.

El entrenamiento se realizó con SFT durante 1 época sobre 12.508 pares audio-prompt construidos, que generaron 278.199 ejemplos de pregunta-respuesta a nivel de rúbrica. El corpus cubre audio real, compuesto y generado, con perturbaciones guiadas por rúbrica sobre prompts y audio, además de emparejamientos cruzados incorrectos entre muestras para proporcionar supervisión fina en distintos niveles de consistencia audio-texto. Se usaron 8 GPUs NVIDIA A800 de 80 GB, batch por dispositivo de 1, acumulación de gradiente de 8 y learning rate 5e-5. La descomposición en rúbricas la realiza un backend de lenguaje configurado por separado en el repositorio de código; el adaptador publicado solo ejecuta los juicios de rúbrica sobre el audio.

## Capacidades

- Evaluación de consistencia audio-texto mediante preguntas de rúbrica binarias (sí/no).
- Descomposición estructural de descripciones en eventos, atributos y relaciones entre eventos (delegada a un backend LLM externo en el flujo completo).
- Juicio de alineación semántica fina sobre escenas acústicas complejas, no solo similitud global.
- Evaluación de preferencia humana: puntuación agregada de consistencia por candidato de audio.
- Procesamiento nativo de audio y texto (heredado de Qwen3-Omni).
- Soporte de inferencia con vLLM a través del motor de ms-swift.
- No se documentan capacidades de tool calling, agentes ni modos de pensamiento específicos para este adaptador.

## Casos de uso

- Evaluación automática de sistemas TTA (text-to-audio): el adaptador puntúa cada audio generado contra su prompt mediante rúbricas atómicas, permitiendo comparar modelos generativos con una métrica semántica fina en lugar de solo FAD o CLAP.
- Control de calidad en pipelines de producción de audio: integrado como paso de validación tras la generación, detecta audios que no cumplen atributos concretos (instrumentación, ambiente, relaciones temporales) antes de publicarlos.
- Investigación en alineación audio-texto: proporciona etiquetas de rúbrica a nivel de evento y atributo, útiles para analizar qué aspectos de una descripción fallan más en los generadores.
- Benchmarking de modelos de audio generativo: el benchmark publicado (FineAudio-Judge-Benchmark) permite reproducir comparativas entre sistemas con un protocolo estandarizado.
- Evaluación de preferencia en estudios con humanos: la modalidad de preferencia agrega las rúbricas por candidato y produce un ranking de audios coherente con juicios humanos.
- Auditoría de datasets de audio: permite verificar si los pares audio-texto de un corpus de entrenamiento mantienen consistencia semántica, detectando muestras mal etiquetadas.
- Filtrado de datos sintéticos: al generar audio con modelos TTA, el juez puede descartar muestras de baja consistencia antes de incorporarlas a un dataset de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3-Omni-30B-A3B-Instruct completo (30B parámetros totales, 3B activos).
- VRAM estimada para el base en BF16: aproximadamente 60 GB de pesos, más overhead de activaciones y caché KV; se recomienda GPU de 80 GB (A100, H100, A800) para inferencia cómoda.
- El entrenamiento documentado usó 8 × NVIDIA A800 de 80 GB, lo que da una idea del perfil de memoria del base.
- En GPUs de consumo (RTX 4090 de 24 GB) no cabe el base en BF16; requeriría cuantización agresiva del base (no documentada para este adaptador) y podría degradar la calidad del juicio.
- Despliegue: vLLM mediante el motor de ms-swift, tal como indican los scripts del repositorio (reproduce_rubric_qa y reproduce_preference).
- Latencia y throughput: no disponibles. La evaluación por rúbrica implica múltiples preguntas por par audio-texto, por lo que el coste crece linealmente con el número de rúbricas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FineAudio-Judge | LoRA juez audio-texto | 30B base (3B activos) | no disponible | Apache 2.0 | HuggingFace + código en GitHub |
| Qwen3-Omni-30B-A3B-Instruct | Modelo base omni-modal | 30B (3B activos) | no disponible | Apache 2.0 | HuggingFace |
| CLAP score | Métrica de similitud audio-texto | no aplica | no aplica | variable | Librerías de audio |
| FAD | Métrica de calidad de audio generado | no aplica | no aplica | variable | Librerías de audio |

No se dispone de información sobre otros modelos juez de audio comparables en la información proporcionada. Las alternativas de la tabla son métricas clásicas o el propio modelo base, no adaptadores de juicio equivalentes.

## Limitaciones y advertencias

- El adaptador no funciona de forma autónoma: requiere cargar Qwen3-Omni-30B-A3B-Instruct, lo que implica un coste de infraestructura elevado (GPU de 80 GB).
- La descomposición en rúbricas depende de un backend LLM externo configurado por separado; el adaptador por sí solo no genera las preguntas de rúbrica.
- Solo se documenta el juicio binario sí/no; no se especifican calibraciones de confianza ni umbrales recomendados.
- No se han publicado resultados de benchmarks ni métricas de correlación con evaluación humana en la información disponible.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Riesgo de sesgo heredado del modelo base y del corpus de entrenamiento (12.508 pares construidos), cuya composición demográfica y de dominio no se detalla.
- Riesgo de alucinación en los juicios: al ser un modelo generativo emitiendo respuestas binarias, puede producir respuestas inconsistentes ante audios ambiguos o fuera de distribución.
- El adaptador está pensado para evaluación, no para generación de audio; usarlo fuera de ese propósito no está validado.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base tiene su propia licencia Apache 2.0 de Alibaba Cloud; conviene revisar ambas.
- Repositorio con 20 descargas y 0 likes en el momento de la consulta: ecosistema pequeño, poca validación comunitaria.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Zixchen/FineAudio-Judge
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Benchmark: https://huggingface.co/datasets/Zixchen/FineAudio-Judge-Benchmark
- Código: https://github.com/QwenAudio/FunResearch/tree/main/FineAudio-Judge
- Licencia del modelo base: https://github.com/QwenLM/Qwen3-Omni/blob/main/LICENSE
