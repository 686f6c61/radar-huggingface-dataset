# yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `google/gemma-4-E4B-it` para la tarea de descubrimiento de citas (citation discovery) del reto SCIDOCA 2025. El adaptador implementa un scorer de tipo listwise: recibe un párrafo y una lista completa de títulos candidatos, y emite una respuesta binaria Yes/No por cada candidato para determinar qué referencias son relevantes. Forma parte del sistema CiteDuoWise, descrito como componente principal de una tesis.

El modelo resuelve un problema concreto de recuperación de citas científicas: dado un fragmento de texto académico, identificar automáticamente qué trabajos de una lista de candidatos deberían citarse. Frente a enfoques pointwise o pairwise, el enfoque listwise procesa todos los candidatos en un único prompt, lo que aprovecha la ventana de contexto del modelo base para capturar interacciones entre candidatos.

Es relevante para investigadores y desarrolladores que trabajen en sistemas de recomendación de citas, verificación bibliográfica automatizada o pipelines de revisión de literatura. El adaptador es ligero (repo de 0,1 GB) y se distribuye como pesos PEFT en safetensors, lo que permite cargarlo sobre el modelo base sin necesidad de reentrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base `google/gemma-4-E4B-it`); LoRA r=16, alpha=32, dropout=0.05, modulos objetivo `q_proj`, `k_proj`, `v_proj`, `o_proj` |
| Parametros totales | no disponible (solo se distribuye el adaptador LoRA; el recuento depende del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | MAX_LEN de entrenamiento: 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`) + `adapter_config.json` (PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `google/gemma-4-E4B-it`, un modelo de la familia Gemma 4 en su variante E4B (instruida). La adaptación se realiza mediante LoRA con rango 16, alpha 32 y dropout 0,05, inyectada únicamente en las proyecciones de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`). No se modifican las capas MLP ni las de normalización. El repositorio no incluye los pesos del modelo base, solo el delta LoRA y los ficheros de tokenizador y plantilla de chat.

El entrenamiento se realizó sobre el split "Train-5k" (5.000 párrafos, con todos los candidatos), con el orden de candidatos permutado aleatoriamente por párrafo y por época para evitar sesgos posicionales. Se usó MAX_LEN de 8192 tokens, learning rate 2e-4 con scheduler coseno y warm-up del 10 %, batch efectivo de 16 (batch 1 × acumulación 16), 2 épocas, precisión bf16 y gradient checkpointing. La selección del checkpoint se hizo por F1 de validación. La semilla es 42. El prompt es de tipo listwise: un único prompt por párrafo con todos los títulos candidatos, y el modelo emite Yes/No por cada slot.

## Capacidades

- Descubrimiento de citas: dado un párrafo y una lista de títulos candidatos, decide qué candidatos son relevantes emitiendo Yes/No por slot.
- Clasificación listwise: procesa todos los candidatos en un único prompt, capturando interacciones entre ellos.
- Manejo de contexto largo: entrenado con MAX_LEN de 8192 tokens, suficiente para párrafos con decenas de candidatos.
- Robustez posicional: el orden de candidatos se permuta durante el entrenamiento, lo que reduce el sesgo hacia posiciones concretas.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking específicas para este adaptador.
- Capacidades multilingües: no disponibles (no se especifican en la model card).

## Casos de uso

- Revisión bibliográfica asistida: integrar el adaptador en un pipeline que, dado el texto de un manuscrito, sugiera qué trabajos de una lista de candidatos (por ejemplo, recuperados de un buscador académico) deben citarse en cada párrafo.
- Verificación de citas en preprints: comprobar si las referencias incluidas en un borrador son coherentes con el contenido del párrafo, marcando posibles citas ausentes o irrelevantes.
- Construcción de grafos de citas: usar las decisiones Yes/No por párrafo para generar aristas entre secciones del texto y trabajos candidatos, alimentando análisis bibliométricos.
- Sistemas de recomendación en gestores de referencias: enriquecer herramientas tipo Zotero o Mendeley con sugerencias contextuales basadas en el párrafo seleccionado.
- Evaluación de recuperadores: emplear el scorer listwise como re-ranker sobre los resultados de un recuperador léxico o denso, refinando el top-k de candidatos.
- Investigación en NLP científico: reproducir el sistema CiteDuoWise con semilla 42 y el split Train-5k como baseline para experimentos de citation discovery.
- Docencia y asistencia a la escritura académica: señalar al autor qué referencias de su biblioteca personal encajan mejor con cada párrafo redactado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona selección del mejor checkpoint por F1 de validación, pero no reporta valores numéricos de F1, precisión, recall ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador por separado; depende del modelo base `google/gemma-4-E4B-it` y de la cuantización elegida. El adaptador en sí ocupa 0,1 GB.
- GPU recomendadas: no disponibles en la información proporcionada; el base E4B y el contexto de 8192 tokens condicionan los requisitos.
- Viabilidad en GPU de consumo: no disponible; a valorar según el modelo base y la cuantización aplicada.
- Opciones de despliegue: carga mediante la librería `peft` sobre el modelo base; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros adaptadores o sistemas comparables de citation discovery con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Especialización estrecha: el adaptador está entrenado exclusivamente para la tarea listwise de citation discovery; su uso fuera de ese dominio no está validado.
- Dependencia del modelo base: requiere cargar `google/gemma-4-E4B-it`, con los requisitos de hardware y la licencia asociados.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los términos de la licencia Gemma, que imponen restricciones y obligaciones específicas.
- Sesgos: no documentados; al entrenarse sobre un corpus académico concreto (SCIDOCA 2025, Train-5k), puede heredar sesgos de cobertura disciplinar o de idioma del dataset.
- Riesgo de alucinación: el modelo emite Yes/No por slot, pero no se documenta su fiabilidad ante candidatos ambiguos o títulos muy similares; conviene validar en producción.
- Idiomas: no se especifican; el comportamiento multilingüe no está garantizado.
- Reproducibilidad: la model card fija semilla 42 y describe hiperparámetros, pero no se publican métricas de validación ni de test, lo que limita la evaluación independiente.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; sin pipeline declarado ni demo pública.

## Enlaces

- Hugging Face: https://huggingface.co/yennhi0907/citation_discovery_scidoca_2025_gemma4_e4b_lora_listwise_title_5k_seed42
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio de código, prompts, split y evaluación: https://github.com/tathiyennhi/automatic-citation-checking (paquete `citeduowise/`)
