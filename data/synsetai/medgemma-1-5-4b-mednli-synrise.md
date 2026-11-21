# synsetai/medgemma-1.5-4b-mednli-synrise

## Resumen

synsetai/medgemma-1.5-4b-mednli-synrise es un adaptador LoRA publicado por el usuario synsetai sobre el modelo base google/medgemma-1.5-4b-it, un modelo multimodal de dominio médico desarrollado por Google. El adaptador está especializado en inferencia de lenguaje natural (NLI, natural language inference) aplicada al corpus MedNLI, un conjunto de datos de inferencia textual en el ámbito clínico. El repositorio se distribuye en formato safetensors y está etiquetado como material de investigación.

El modelo hereda del base una arquitectura transformer con aproximadamente 4 mil millones de parámetros y capacidades de instrucción conversacional; el adaptador añade un ajuste fino específico para la tarea de determinar relaciones de implicación, contradicción o neutralidad entre pares de frases clínicas. Se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

La relevancia de esta ficha es acotada: el modelo es un fine-tune experimental sobre una base con licencia restringida (hai-def) y acceso gated, con documentación pública mínima. Cualquier evaluación de producción debe partir de esa base y de la ausencia de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/medgemma-1.5-4b-it) con adaptador LoRA |
| Parametros totales | ~4 mil millones (heredados del base; el adaptador LoRA añade un número no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | hai-def (Health AI Developer Foundations, según la etiqueta del repo) |
| Formato de pesos | safetensors (adaptador LoRA) |
| Modelo base | google/medgemma-1.5-4b-it |
| Tarea | Natural language inference (MedNLI) |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Repo size | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/medgemma-1.5-4b-it, un modelo de la familia MedGemma de Google orientado a tareas médicas multimodales y ajustado por instrucciones. El adaptador en sí es un LoRA (Low-Rank Adaptation) entrenado para la tarea de NLI sobre el corpus MedNLI, que consiste en pares de premisa e hipótesis extraídos de notas clínicas con etiquetas de implicación, contradicción y neutralidad.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros del LoRA (rango, alpha, módulos objetivo), ni sobre si se aplicaron etapas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas específicas del adaptador más allá del ajuste fino supervisado sobre MedNLI. El repositorio no incluye model card con detalles de entrenamiento.

## Capacidades

- Inferencia de lenguaje natural (NLI) en dominio clínico: clasificación de pares premisa-hipótesis en las categorías de implicación, contradicción y neutralidad.
- Generación de texto y razonamiento heredados del modelo base MedGemma 1.5 4B IT.
- Capacidades conversacionales de instrucción heredadas del base.
- Capacidades multimodales potenciales heredadas del base (no confirmadas para el adaptador en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta del repositorio.
- Modo thinking, visión o audio específicos del adaptador: no disponible.

## Casos de uso

- Clasificación de pares de frases clínicas: el adaptador puede emplearse para determinar si una hipótesis clínica se sigue de una premisa extraída de una nota médica, útil en pipelines de extracción de información sanitaria.
- Validación de consistencia en resúmenes clínicos: dado un resumen generado y el texto original, evaluar si cada afirmación del resumen está implicada, es neutral o contradice el original.
- Detección de contradicciones en historia clínica: comparar entradas sucesivas del registro de un paciente para señalar afirmaciones incompatibles.
- Anotación asistida de corpus MedNLI: generar etiquetas preliminares para revisión humana en proyectos de investigación que necesiten ampliar datasets de NLI clínico.
- Filtrado de pares pregunta-respuesta en bases de conocimiento médico: descartar pares donde la respuesta contradice la evidencia de origen.
- Evaluación de sistemas de QA biomédico: usar el adaptador como juez de entailment para medir la fidelidad de respuestas generadas por otros modelos frente a pasajes de referencia.
- Investigación en robustez de NLI clínico: al ser un fine-tune pequeño y reproducible sobre un base público, sirve como punto de partida para estudiar sensibilidad a negaciones, abreviaturas y jerga médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 8 GB solo para los pesos del base de 4B, más overhead de activaciones y del adaptador; en la práctica, 10-12 GB para secuencias cortas.
- Cuantización a 8 bits: ~4-5 GB de VRAM; a 4 bits: ~2,5-3 GB, aunque no se documentan cuantizaciones oficiales del adaptador.
- GPU recomendadas: A100 40 GB, H100, L40S para despliegue concurrente; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para inferencia en fp16.
- GPU de consumo: cabe en RTX 4080 (16 GB), RTX 4070 Ti (12 GB) con cuantización, y en GPUs de 8 GB solo con cuantización agresiva.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama para el base; el adaptador LoRA requiere cargarlo junto al base con PEFT o fusionarlo previamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Acceso |
|---|---|---|---|---|---|
| synsetai/medgemma-1.5-4b-mednli-synrise | ~4B + LoRA | no disponible | NLI clínico (MedNLI) | hai-def | Gated |
| google/medgemma-1.5-4b-it | ~4B | no disponible | Médico general multimodal | hai-def | Gated |
| Modelos NLI clínicos tipo BioBERT/PubMedBERT fine-tune | ~110M-340M | 512 tokens típicamente | NLI clínico | MIT / Apache-2.0 en muchos casos | Abierto |

La comparación con alternativas tipo BioBERT fine-tuneado en MedNLI es relevante por tamaño y coste: un encoder de 110M-340M ofrece latencia menor y licencias más permisivas, a costa de no disponer de generación ni capacidades conversacionales. El adaptador de synsetai solo tiene sentido si se necesita combinar NLI con las capacidades generativas del base MedGemma.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia de que el adaptador supere al base ni a alternativas en MedNLI.
- Cero descargas y cero likes: sin validación comunitaria; el artefacto puede estar incompleto o mal documentado.
- Repo size de 0.0 GB: posiblemente el adaptador no está subido o el tamaño es inferior a la resolución de Hugging Face; verificar antes de usar.
- Licencia hai-def (Health AI Developer Foundations): restricciones específicas para uso clínico y comercial; requiere revisión legal antes de cualquier despliegue en producción sanitaria.
- Acceso gated: es necesario aceptar condiciones en Hugging Face y disponer de token de autenticación.
- Idioma limitado al inglés: no apto para NLI clínico en castellano sin entrenamiento adicional.
- Riesgo de alucinación heredado del base generativo, especialmente en contextos clínicos largos o con terminología ambigua.
- Sesgos potenciales del corpus MedNLI (procedente de notas clínicas de un sistema sanitario concreto) que pueden no generalizar a otras poblaciones.
- No es un dispositivo médico: no debe usarse para diagnóstico ni decisiones clínicas sin validación regulatoria.
- Contexto máximo no documentado: riesgo de truncamiento en notas clínicas largas.
- Sin información sobre hiperparámetros del LoRA ni receta de entrenamiento: difícil reproducir o auditar.

## Enlaces

- Hugging Face: https://huggingface.co/synsetai/medgemma-1.5-4b-mednli-synrise
- Modelo base: https://huggingface.co/google/medgemma-1.5-4b-it
- Corpus MedNLI (referencia de la tarea): no disponible en la información proporcionada
- Paper o blog del adaptador: no disponible
- Repositorio de código: no disponible
