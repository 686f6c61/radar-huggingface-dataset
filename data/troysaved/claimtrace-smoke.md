# troysaved/claimtrace-smoke

## Resumen

ClaimTrace-smoke es un modelo de lenguaje fino-ajustado de 1.720 millones de parametros, desarrollado por troysaved a partir de la base `unsloth/qwen3-1.7b-unsloth-bnb-4bit`. El modelo se publica bajo licencia Apache 2.0 y esta orientado a generacion de texto en ingles. Su nombre sugiere una conexion con el proyecto ClaimTrace, una capa de verificacion de hechos que abre las publicaciones de una entidad (paginas web, PDFs, imagenes) y devuelve el campo solicitado con su prueba adjunta: URL de origen, fecha, extracto verbatim y nivel de confianza.

El modelo se creo con la libreria Unsloth y Huggingface TRL, lo que indica un entrenamiento optimizado para velocidad. Con 1.720.574.976 parametros y un tamano de repositorio de 3,5 GB, es un modelo compacto que puede ejecutarse en hardware de consumo. Su relevancia actual radica en la creciente demanda de modelos pequenos y eficientes para tareas de verificacion de informacion y extraccion de hechos, donde la trazabilidad y la evidencia son criticas.

La ficha tecnica se basa exclusivamente en la informacion proporcionada en la model card y en los resultados de busqueda web. No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens procesados ni los benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se infiere 32K del modelo base Qwen3-1.7B, no confirmado) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; el base es bnb-4bit) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer decoder-only con atencion causal. El modelo base es `unsloth/qwen3-1.7b-unsloth-bnb-4bit`, una version cuantizada a 4 bits del Qwen3-1.7B original, optimizada con Unsloth para entrenamiento eficiente. El fino-ajuste se realizo con la libreria TRL de Huggingface, lo que sugiere el uso de tecnicas como Supervised Fine-Tuning (SFT) o Direct Preference Optimization (DPO), aunque no se especifica cual.

No se proporcionan datos sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de RLHF. La unica informacion disponible es que el entrenamiento fue 2 veces mas rapido gracias a Unsloth. El nombre "smoke" podria indicar una prueba de humo o un experimento preliminar dentro del ecosistema ClaimTrace.

## Capacidades

- Generacion de texto en ingles: el modelo puede producir texto coherente y contextualizado en ingles, heredando las capacidades base de Qwen3-1.7B.
- Razonamiento y comprension: al estar basado en Qwen3, conserva capacidades de razonamiento, aunque el fino-ajuste puede haberlas especializado hacia tareas de verificacion de hechos.
- Extraccion de informacion: dado el contexto de ClaimTrace, el modelo podria estar afinado para extraer campos especificos de documentos y devolver evidencia (URL, fecha, extracto).
- Verificacion de hechos: potencialmente capaz de contrastar afirmaciones con fuentes primarias, aunque no se confirma en la model card.
- Soporte de tool calling: no confirmado, pero Qwen3-1.7B base soporta function calling; no se especifica si el fino-ajuste lo mantiene.
- Capacidades multilingues: no, solo ingles declarado.
- Vision: no, es un modelo de solo texto.

## Casos de uso

- Verificacion de reclamaciones de seguros: el modelo puede analizar descripciones de danos y contrastarlas con documentos adjuntos (facturas, informes periciales) para validar la coherencia y detectar inconsistencias.
- Auditoria de cumplimiento normativo: extraer campos especificos de publicaciones corporativas (fechas, cifras, responsables) y verificar que coinciden con las fuentes oficiales.
- Fact-checking periodistico: contrastar declaraciones publicas con las publicaciones originales de una entidad, devolviendo la URL y el extracto exacto como prueba.
- Gestion de reclamaciones en atencion al cliente: clasificar y verificar automaticamente las reclamaciones de los usuarios, reduciendo el fraude y acelerando la resolucion.
- Analisis de contratos y documentos legales: extraer clausulas especificas y verificar su presencia en el documento original, con la prueba adjunta.
- Monitorizacion de comunicados de prensa: comparar anuncios oficiales con lo publicado en la web de la empresa para detectar discrepancias o cambios no anunciados.
- Investigacion de mercado: verificar afirmaciones de competidores sobre sus productos contrastando con sus propias publicaciones tecnicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estandar. Tampoco se comparan resultados con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.720 millones de parametros en fp16, se necesitan aproximadamente 3,5 GB de VRAM. Con cuantizacion a 4 bits, se reduce a unos 1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, etc.) para fp16. Para 4 bits, basta con 2 GB.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, Transformers con accelerate.
- Latencia y throughput: no disponible. Para un modelo de 1.7B en una GPU moderna, se espera una latencia de 20-50 ms por token en fp16, y menor con cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| ClaimTrace-smoke | 1.72B | no disponible | Apache 2.0 | Fino-ajuste de Qwen3-1.7B para verificacion |
| Qwen3-1.7B | 1.72B | 32K | Apache 2.0 | Modelo base, sin fino-ajuste |
| Llama 3.2 1B | 1.23B | 128K | Llama 3.2 | Alternativa de tamano similar, contexto mayor |
| Gemma 2 2B | 2.6B | 8K | Gemma | Alternativa de Google, contexto menor |

La comparativa se basa en datos publicos de los modelos base. No se dispone de benchmarks comparativos entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: no se dispone de informacion sobre sesgos especificos. Al ser un modelo pequeno entrenado sobre un dataset desconocido, puede heredar sesgos del modelo base Qwen3.
- Riesgo de alucinacion: alto, especialmente en tareas de verificacion de hechos, donde el modelo podria inventar fuentes o extractos si no se le proporciona el contexto adecuado.
- Limitaciones de contexto: la longitud de contexto no esta confirmada; si hereda los 32K de Qwen3, es suficiente para documentos largos, pero no para libros completos.
- Limitaciones de idioma: solo ingles. No apto para espanol u otros idiomas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-1.7B tambien es Apache 2.0, por lo que no hay restricciones adicionales.
- Caveat para produccion: el nombre "smoke" sugiere que es una prueba de humo o un experimento preliminar. No hay evidencia de evaluacion rigurosa ni de despliegue en produccion. Se recomienda validar exhaustivamente antes de usarlo en entornos criticos.
- Datos de entrenamiento desconocidos: no se especifica el dataset, lo que impide evaluar la calidad del afinamiento y su idoneidad para tareas especificas.

## Enlaces

- HuggingFace: https://huggingface.co/troysaved/claimtrace-smoke
- ClaimTrace (proyecto): https://claimtrace.dev/
- GitHub - multiskilled/ClaimTrace: https://github.com/multiskilled/ClaimTrace
- GitHub - devdiv07/ClaimTrace: https://www.linkedin.com/posts/divyanshshukla03_github-devdiv07claimtrace-built-a-multimodal-activity-7481411753810194432-NvAF
- GitHub - ai-claim-review (smoke test): https://github.com/KavinMK05/ai-claim-review/blob/main/code/smoke_test_phase6.py
- Unsloth: https://github.com/unslothai/unsloth
