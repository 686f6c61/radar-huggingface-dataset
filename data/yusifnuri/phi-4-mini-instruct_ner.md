# yusifnuri/phi-4-mini-instruct_ner

## Resumen

`yusifnuri/phi-4-mini-instruct_ner` es un adaptador LoRA que especializa el modelo `microsoft/Phi-4-mini-instruct` (3,80 B de parámetros) en una única tarea de reconocimiento de entidades nombradas (NER): extraer entidades de tipo persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC) de una frase. No es un modelo completo, sino un conjunto de pesos delta publicados con la librería PEFT que deben cargarse sobre el modelo base congelado.

El adaptador se generó como artefacto reproducible del trabajo de fin de máster *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026), que compara modelos pequeños ajustados frente a APIs de proveedores frontera en precisión, latencia, coste, exposición de privacidad y volumen de equilibrio del retorno de la inversión. Su publicación responde a la necesidad de que el benchmark sea verificable de forma independiente.

Es relevante ahora porque ejemplifica una práctica habitual en el ecosistema open source: publicar adaptadores LoRA de bajo coste sobre modelos pequeños con licencia permisiva para tareas concretas de empresa. Ahora bien, el propio autor advierte de que la métrica de rendimiento reportada en la model card no es una medición válida, tal como se detalla más abajo, y que el adaptador no debe tratarse como un asistente de propósito general. La arquitectura subyacente es la del modelo base (transformer decoder-only denso); el adaptador sólo modifica las proyecciones de atención.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only denso (Phi-4-mini-instruct); módulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj` |
| Parametros totales | 3,80 B en el modelo base; número de parámetros del adaptador no disponible (rango 16, alpha 32) |
| Longitud de contexto | No disponible en la información proporcionada; el adaptador se entrenó con longitud máxima de secuencia de 512 tokens |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en precisión completa (safetensors) y depende del modelo base |
| Idiomas soportados | Entrenamiento únicamente en inglés (corpus CoNLL-2003); no se declaran otros idiomas en los metadatos |
| Licencia | MIT (adaptador); el dataset de entrenamiento está sujeto a los términos de Reuters con redistribución restringida |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 aplicado sobre las cuatro proyecciones de atención del modelo base (`q_proj`, `k_proj`, `v_proj`, `o_proj`). El ajuste se hizo con AdamW, tasa de aprendizaje 2e-4 con programación coseno y 3 % de warmup, durante 3 épocas, con tamaño de lote efectivo 16 (4 x 4 de acumulación de gradiente), longitud máxima de secuencia de 512 tokens y semilla 42. El dataset es CoNLL-2003 en inglés (`eriktks/conll2003`), con 5.000 ejemplos de entrenamiento y 500 reservados para selección de checkpoint. Los hiperparámetros se mantuvieron constantes en todos los modelos y tareas del benchmark, en lugar de ajustarse por celda, por lo que el autor los describe como una cota inferior conservadora del rendimiento alcanzable.

No se aplicó RLHF ni DPO: se trata de un ajuste supervisado mediante LoRA sobre una tarea de etiquetado. El adaptador espera en inferencia un formato de prompt exacto: `Extract named entities (PER=person, ORG=organisation, LOC=location, MISC=miscellaneous) from this text:\n{text}\nEntities:`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Extracción de entidades nombradas de cuatro tipos (PER, ORG, LOC, MISC) en oraciones en inglés.
- Generación de cadenas de etiquetas (etiquetas enteras o formato BIO en la decodificación) a partir de texto plano.
- Seguimiento de una plantilla de prompt concreta, fuera de la cual el comportamiento no está documentado.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado para agentes ni razonamiento multi-paso.
- No es multilingüe: sólo se entrenó con un corpus en inglés.
- No se documentan capacidades de visión, audio, modo de razonamiento (*thinking mode*) ni generación de código.
- No debe utilizarse como asistente conversacional de propósito general.

## Casos de uso

- Extracción de entidades en correspondencia empresarial: el adaptador puede procesar bloques de texto de hasta 512 tokens para poblar campos estructurados (remitente, organización, sede) en sistemas de gestión documental, con la ventaja de ejecutarse en infraestructura propia.
- Enriquecimiento de registros CRM: tras una llamada o un correo, el modelo identifica nombres de persona y de empresa para vincular automáticamente la interacción con la cuenta correspondiente, sin enviar datos a una API externa.
- Preprocesado para grafos de conocimiento y pipelines RAG: las menciones detectadas alimentan la construcción de índices de entidades y relaciones, de modo que las consultas posteriores puedan filtrarse por organización o localización.
- Análisis de noticias y documentos financieros: al estar entrenado sobre CoNLL-2003, que procede de texto periodístico en inglés (Reuters), encaja de forma natural en la extracción de organizaciones y localizaciones en titulares y teletipos en inglés.
- Triaje previo de datos personales: la detección de entidades PER puede servir como primera pasada para señalar posibles identificadores antes de una revisión humana, teniendo en cuenta que su F1 de entidad no está validado con la métrica corregida y que no sustituye a un sistema de anonimización auditado.
- Clasificación ligera en despliegues de borde o de bajo coste: con 3,80 B de parámetros en el modelo base, la pareja base + adaptador puede ejecutarse en una única GPU de consumo, lo que habilita el procesamiento por lotes de grandes volúmenes de texto sin coste variable por token.
- Verificación académica y reproducción de benchmarks: el adaptador se publica expresamente para que terceros puedan replicar las celdas del benchmark del trabajo de Nuri (2026) con la misma configuración.

## Benchmarks y rendimiento

El autor reporta una única celda de rendimiento, acompañada de una advertencia explícita de que el número no constituye una medición válida.

| Metrica | Valor | Observaciones |
|---|---|---|
| F1 a nivel de entidad (media por frase) | 0,9328 | El autor indica que debe tratarse como marcador de posición, no como rendimiento: en la primera pasada la puntuación se calculó por solapamiento de tokens con la cadena de etiquetas enteras de referencia, dominada por la etiqueta mayoritaria `O`, y mide imitación de formato más que extracción de entidades |
| Latencia media, batch 1 | 608 ms | Medida en una NVIDIA H200 (141 GB) a batch 1 y plena utilización; excluye tránsito de red |
| Coste por 1M de tokens generados | 10,53 USD | Precio imputado de 3,99 USD por GPU-hora |

La evaluación se ejecutó el 5 de julio de 2026 sobre 200 instancias reservadas. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros): cada tarea del benchmark lleva su propia métrica y la matriz completa está en el enlace indicado en la sección de enlaces.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones sobre los 3,80 B de parámetros del modelo base, más el adaptador, que es despreciable en tamaño): en fp16 en torno a 9-10 GB con activaciones y caché KV; en int8 en torno a 4-5 GB; en 4 bits en torno a 3 GB.
- GPU recomendadas: el autor midió latencia en una NVIDIA H200 (141 GB), pero no es necesaria para este tamaño. Una RTX 4090 (24 GB), RTX 3090 (24 GB) o A100 (40/80 GB) cubren el modelo en fp16 sin dificultad.
- Cabe en GPU de consumo: sí. RTX 4090, RTX 3090 y, en cuantización de 4 bits, tarjetas con 8-16 GB como RTX 4060 Ti 16 GB o RTX 4070.
- Opciones de despliegue: `transformers` + `peft` (patrón documentado por el autor), vLLM con soporte de adaptadores LoRA, TGI con LoRA, y llama.cpp u Ollama si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: 608 ms de latencia media a batch 1 con utilización plena de una H200, según la medición del autor. El throughput agregado no está disponible.
- Coste operativo declarado: 10,53 USD por millón de tokens generados con el precio imputado de 3,99 USD por GPU-hora.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de benchmark comparables con otros adaptadores de NER ni con otros modelos pequeños, por lo que la comparación numérica no está disponible. La única comparación verificable es contra el propio modelo base sin adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yusifnuri/phi-4-mini-instruct_ner` | 3,80 B (base) + adaptador LoRA | No disponible (entrenado a 512 tokens) | F1 de entidad 0,9328 declarado, marcado como no válido por el autor | MIT | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `microsoft/Phi-4-mini-instruct` (base sin adaptador) | 3,80 B | No disponible en la información proporcionada | No disponible | MIT | HuggingFace |
| Otros adaptadores de NER sobre modelos pequeños | No disponible | No disponible | No disponible | No disponible | No disponible |
| APIs de proveedores frontera (brazo comparado en el benchmark) | No disponible | No disponible | La matriz del benchmark está en el repositorio del autor, no en la información proporcionada | Propietaria | No disponible |

## Limitaciones y advertencias

- La puntuación de F1 reportada no es una medición válida: se obtuvo con una métrica de solapamiento de tokens dominada por la etiqueta mayoritaria `O`. El arnés de evaluación se corrigió después para decodificar BIO a formas superficiales de entidad, pero esta celda no se ha vuelto a evaluar.
- Entrenamiento con una única semilla y una única ejecución: las diferencias reportadas confunden calidad del modelo con varianza de inicialización.
- Especializado en una sola tarea sobre un solo corpus público. No es un asistente de propósito general y no debe usarse como tal.
- Riesgo de contaminación: los corpus de evaluación son benchmarks públicos de larga trayectoria y probablemente estén presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluación usó 200 instancias reservadas, de modo que el tamaño de efecto detectable queda acotado en torno a diez puntos porcentuales.
- Riesgo de alucinación de etiquetas: al ser un modelo generativo, puede emitir etiquetas o entidades que no aparecen en el texto de entrada; se recomienda validar siempre la salida contra el texto original.
- Limitación de idioma: sólo inglés; no se documenta comportamiento en castellano ni en otros idiomas.
- Limitación de longitud: el adaptador se entrenó con secuencias de 512 tokens como máximo; textos más largos pueden degradar el resultado.
- Restricción de licencia del dato: aunque el adaptador se publica bajo MIT, el dataset CoNLL-2003 está sujeto a los términos de Reuters con redistribución restringida, lo que conviene revisar antes de un uso comercial.
- Adopción nula verificable: el repositorio no tenía descargas ni likes en el momento de la consulta, por lo que no existe validación independiente de su comportamiento en producción.
- Requiere cargar el modelo base `microsoft/Phi-4-mini-instruct` por separado; no es un artefacto autónomo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yusifnuri/phi-4-mini-instruct_ner
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Código, configuraciones y arnés de evaluación: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Análisis de coste por petición: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Dataset de entrenamiento: https://huggingface.co/datasets/eriktks/conll2003
- Cita del trabajo: Nuri, Yusif (2026), *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*, tesis de máster, SRH University Hamburg.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas no relacionadas (Zhihu y preguntas de Stack Overflow sobre FTP, Docker y Oracle), por lo que no se añaden más enlaces.
