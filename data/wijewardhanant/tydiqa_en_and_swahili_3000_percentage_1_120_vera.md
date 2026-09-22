# WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_VeRA

## Resumen

WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_VeRA es un adaptador PEFT publicado en Hugging Face por el usuario WijewardhanaNT. No es un modelo completo: son pesos adicionales que se cargan sobre el modelo base meta-llama/Llama-3.1-8B mediante la librería peft (versión de framework declarada en la ficha: 0.17.1). El repositorio ocupa 0,1 GB, un tamano coherente con un adaptador de bajo rango y no con un ajuste completo del modelo base.

El identificador sugiere que el adaptador se ha entrenado sobre el conjunto TyDiQA en inglés y suajili, con un subconjunto de 3000 ejemplos, y que la técnica empleada podría ser VeRA (Vector-based Random Matrix Adaptation). Sin embargo, la model card no confirma ninguno de estos extremos: el README es la plantilla por defecto de Hugging Face, con todos los campos marcados como «More Information Needed».

Su relevancia es por tanto muy específica y limitada: puede servir como artefacto reproducible para quien quiera evaluar adaptadores ligeros sobre Llama 3.1 8B en respuesta a preguntas extractiva bilingüe inglés-suajili, pero la ausencia total de documentación, métricas y licencia declarada impide recomendarlo para entornos de producción. Los resultados de búsqueda web disponibles no guardan relación con el modelo (corresponden a fármacos como el ambroxol) y no aportan información adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre transformer decoder-only (modelo base: Llama 3.1 8B). El método de adaptación no está documentado; el identificador sugiere VeRA |
| Parametros totales | No documentado para el adaptador. El modelo base es Llama 3.1 8B (unos 8.000 millones de parámetros), dato que proviene del modelo base y no de la ficha del adaptador |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No documentada para el adaptador. Hereda la del modelo base, que admite hasta 128.000 tokens |
| Tipos de cuantizacion | No disponible. El repositorio contiene pesos de adaptador en safetensors; no se especifica la precisión |
| Idiomas soportados | No disponible. El identificador menciona inglés y suajili, sin confirmación en la model card |
| Licencia | No disponible. El modelo base se distribuye bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (pesos de adaptador PEFT) |
| Libreria | peft 0.17.1 (declarada en la ficha) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | meta-llama/Llama-3.1-8B |
| Descargas / likes | 11 / 0 |
| Fecha de creacion | 2026-09-22 (segun metadatos de Hugging Face) |
| Fecha de actualizacion | 2026-09-22 (segun metadatos de Hugging Face) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del adaptador ni su procedimiento de entrenamiento. Lo único verificable es que se trata de un artefacto PEFT (tag `peft`), empaquetado en safetensors y asociado al modelo base meta-llama/Llama-3.1-8B mediante el tag `base_model:adapter:meta-llama/Llama-3.1-8B`. El sufijo «VeRA» del identificador apunta a una técnica de adaptación basada en matrices aleatorias con vectores de escala compartidos, pero la model card no lo confirma ni aporta hiperparámetros (rango, alpha, dropout, módulos objetivo).

Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, proceso de preprocesado ni uso de RLHF, DPO u otra fase de alineamiento. El nombre del repositorio sugiere un subconjunto de TyDiQA (respuesta a preguntas extractiva multilingüe) con 3000 ejemplos y una proporción («percentage_1») no especificada, pero se trata de una inferencia a partir del nombre y no de información documentada. Como consecuencia, no es posible reproducir el entrenamiento ni auditar qué particiones del corpus se usaron.

## Capacidades

- No hay ninguna capacidad declarada explícitamente en la model card; todos los campos figuran como «More Information Needed».
- Por construcción (adaptador sobre Llama 3.1 8B), la capacidad esperada es la del modelo base, modulada por el ajuste: generación de texto, razonamiento básico, código y matemáticas elementales en el nivel propio de un modelo de 8.000 millones de parámetros.
- El identificador sugiere una especialización en respuesta a preguntas extractiva (encontrar el fragmento de respuesta dentro de un contexto) en inglés y suajili, pero no hay confirmación ni evaluación publicada.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo de razonamiento explícito (thinking mode), visión, audio ni multimodalidad.
- No se documentan capacidades multilingües distintas de las sugeridas por el nombre del repositorio.

## Casos de uso

Dado que no existe documentación ni evaluación publicada, los escenarios siguientes son aplicaciones plausibles que requieren validación previa por parte del equipo que los adopte:

- Respuesta a preguntas extractiva en inglés y suajili: cargar el adaptador sobre Llama 3.1 8B con peft y usarlo para localizar respuestas dentro de documentos, siempre que una evaluación propia sobre TyDiQA confirme que el ajuste aporta mejoras frente al modelo base sin adaptador.
- Investigación sobre adaptadores eficientes: el repositorio es útil como caso de estudio de adaptación de bajo rango sobre Llama 3.1 8B, comparando su comportamiento con LoRA u otras variantes sobre el mismo modelo base.
- Búsqueda documental monolingüe en suajili: integrarlo en un pipeline de recuperación aumentada (RAG) donde los pasajes estén en suajili y las preguntas también, con verificación humana de las respuestas por la ausencia de métricas.
- Prototipado académico de bajo coste: al ocupar 0,1 GB y compartir pesos base, permite experimentar con varias especializaciones sin duplicar el almacenamiento del modelo de 8.000 millones de parámetros.
- Evaluación comparativa de técnicas PEFT: servir de punto de partida para reproducir experimentos de adaptación con presupuesto reducido, midiendo la degradación respecto al modelo base completo.
- Despliegue interno con cuantización de 4 bits: si se valida su calidad, el adaptador puede combinarse con el modelo base cuantizado para ejecutarse en una GPU de consumo, aunque la ausencia de licencia declarada bloquea el uso comercial.
- Filtrado o priorización de respuestas en un sistema de atención al cliente en suajili: uso exploratorio únicamente, con revisión humana obligatoria debido al riesgo de alucinación del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| TyDiQA (inglés) | no disponible |
| TyDiQA (suajili) | no disponible |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (Llama 3.1 8B); no proceden de mediciones publicadas para este adaptador.

- Peso del modelo base en fp16/bf16: aproximadamente 16 GB. El adaptador anade solo unos 0,1 GB.
- VRAM en fp16 con contexto moderado (8.192 tokens): del orden de 17-18 GB, contando pesos y caché KV. La caché KV de Llama 3.1 8B ocupa aproximadamente 128 KiB por token, es decir, cerca de 16 GB en el contexto completo de 128.000 tokens.
- VRAM en cuantización de 4 bits (NF4, GPTQ o AWQ): aproximadamente 5-6 GB para los pesos, mas la caché KV.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o dos RTX 4090 con reparto de capas; una RTX 4090 de 24 GB resulta suficiente con contextos moderados.
- GPU de consumo: cabe en 4 bits en tarjetas con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), con contextos reducidos.
- Opciones de despliegue: transformers + peft para cargar el adaptador directamente; vLLM y TGI admiten adaptadores LoRA, aunque no se documenta el método concreto de este repositorio; para llama.cpp u Ollama es necesario fusionar previamente el adaptador con el modelo base.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por token ni de tokens por segundo.

## Comparativa con modelos similares

No se ha identificado en la información disponible otro adaptador público equivalente para TyDiQA en inglés y suajili, por lo que la comparación se establece frente a alternativas estructurales.

| Alternativa | Tipo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_VeRA | Adaptador PEFT | no disponible (repo de 0,1 GB) | Heredado del base (hasta 128.000 tokens) | no disponible | no disponible |
| meta-llama/Llama-3.1-8B | Modelo base completo | Unos 8.000 millones | 128.000 tokens | Publicado por Meta; no reproducido aquí | Llama 3.1 Community License |
| Ajuste completo (full fine-tuning) de Llama 3.1 8B | Pesos completos | Unos 8.000 millones entrenables | 128.000 tokens | Depende del dataset | La del modelo base |
| Adaptador LoRA genérico sobre Llama 3.1 8B | Adaptador PEFT | Típicamente decenas de millones | Heredado del base | Depende del dataset | Según el autor |

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no describe datos de entrenamiento, hiperparámetros, evaluación ni uso previsto, lo que impide auditar el modelo.
- Licencia no declarada: al no especificarse, no puede asumirse permiso de uso comercial. El modelo base está sujeto a la Llama 3.1 Community License, que impone obligaciones adicionales (atribución, política de uso aceptable, mención de «Built with Llama»).
- Riesgo de alucinación: el adaptador hereda el comportamiento del modelo base; en tareas extractivas, el modo de fallo típico es generar respuestas plausibles que no aparecen en el contexto.
- Idiomas no confirmados: aunque el identificador menciona inglés y suajili, no hay documentación que confirme el soporte real ni la cobertura de otras lenguas.
- Sin métricas de calidad: no existe ningún resultado publicado, por lo que no puede afirmarse que el ajuste mejore al modelo base en TyDiQA.
- Sesgos: no evaluados. El corpus TyDiQA y los datos de preentrenamiento de Llama 3.1 pueden introducir sesgos culturales, geográficos y lingüísticos no medidos.
- Riesgo de sobreajuste: el nombre del repositorio sugiere un subconjunto de 3000 ejemplos, un volumen reducido que puede provocar sobreajuste y escasa generalización fuera del dominio evaluado.
- Trazabilidad limitada: el repositorio tiene 11 descargas, 0 likes y no consta mantenimiento posterior a la fecha de creación, lo que reduce las garantías de soporte.
- Advertencia de producción: no debe desplegarse en sistemas con usuarios finales sin una evaluación propia, revisión humana y aclaración previa de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_swahili_3000_percentage_1_120_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Librería PEFT: https://github.com/huggingface/peft
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, sobre estimación de emisiones de carbono): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este adaptador en la búsqueda web realizada.
