# ThakiCloud/Thaki-InvestProof-27B-v1-LoRA

## Resumen

Thaki-InvestProof-27B-v1-LoRA es un adaptador LoRA desarrollado por ThakiCloud sobre el modelo base Qwen/Qwen3.8-27B, orientado a la verificación de afirmaciones financieras (due diligence) contra evidencias extraídas de documentos regulatorios de la SEC (formularios 10-K y 10-Q con datos XBRL). El adaptador recibe una afirmación (claim) y un hecho de evidencia de otro documento de la misma empresa, y devuelve un veredicto entre cinco categorías (MATCH, CONTRADICTION, NOT_COMPARABLE, INSUFFICIENT_EVIDENCE, NEEDS_REVIEW) junto con el identificador de la evidencia citada y una justificación breve en formato JSON.

Técnicamente es un ajuste SFT con LoRA de rango 8 y alpha 16 sobre 496 módulos del modelo base (atención completa, atención lineal y MLP), con 58,36 millones de parámetros entrenables y un fichero de pesos de 233,6 MB en F32. El adaptador se distribuye bajo licencia Apache-2.0 y está pensado como research preview, no como sistema certificado para producción. Los pesos del modelo base y los datos de entrenamiento no se publican.

La relevancia de esta ficha es doble: por un lado, documenta una tarea concreta y útil (verificación de evidencia financiera estructurada); por otro, constituye un caso ejemplar de advertencia metodológica, ya que el propio autor reporta que el adaptador mejora sobre el base en un conjunto sintético generado con la misma plantilla que los datos de entrenamiento, pero empeora de forma drástica en tablas de estados financieros reales. Es un ejemplo claro de sobreajuste al formato de plantilla y no a la tarea subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.8-27B; atención completa + atención lineal + MLP |
| Parametros totales | 58,36 M entrenables en el adaptador (modelo base: no disponible en la información proporcionada) |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | 32.768 tokens en la configuración de servicio vLLM indicada por el autor |
| Tipos de cuantizacion | Base servido en BF16, FP8, NVFP4 y NVFP4 + decodificación especulativa DFlash2; adaptador en F32 |
| Idiomas soportados | en, ko |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, F32, 233.605.480 bytes) |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente sobre los módulos del modelo de lenguaje del base: proyecciones q/k/v/o de atención completa, proyecciones in_proj_qkv/z/a/b y out_proj de atención lineal, y gate/up/down del MLP, sumando 496 módulos objetivo. La configuración LoRA es r=8, alpha=16 y dropout 0, con 58,36 M de parámetros entrenables. El método es SFT (supervised fine-tuning) sobre el base Qwen/Qwen3.8-27B, revisión 1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de que los datos se generaron con una plantilla propia e incluyen una variante de selección de evidencia entre múltiples candidatos, una variante de cálculo numérico y versiones en coreano de las tres.

La innovación principal no es arquitectónica sino de formato de tarea: el modelo devuelve un único objeto JSON con veredicto, evidencias citadas y rationale de como máximo 40 palabras, y se entrena y evalúa con thinking desactivado, temperature=0 y max_tokens=1024. El autor probó el servicio con vLLM 0.29.0 usando LoRA en runtime sobre BF16, FP8, NVFP4 y NVFP4 con decodificación especulativa DFlash2 (7 tokens especulativos), lo que indica compatibilidad con despliegues cuantizados en Blackwell. Una advertencia explícita del autor: para preguntas de cálculo, la fórmula generada suele ser correcta con más frecuencia que el número final, por lo que recomienda recalcular la cadena `calculation` con aritmética decimal e ignorar el campo `answer`.

## Capacidades

- Verificación de afirmaciones financieras contra evidencia de otro filing de la misma empresa, con cinco veredictos discretos y cita de la evidencia utilizada.
- Selección de evidencia entre múltiples candidatos (variante multi-candidate presente en los datos de entrenamiento).
- Cálculo numérico con cadena de cálculo explícita y respuesta final (con la advertencia de recalcular el resultado).
- Salida estructurada en JSON con veredicto, `cited_evidence_ids` y `rationale` limitado a 40 palabras.
- Manejo de conceptos XBRL (us-gaap), unidades, periodos instantáneos y dimensiones (consolidado vs segmento, miembro, periodo, unidad, concepto contable).
- Capacidades multilingües limitadas a inglés y coreano, con versiones en coreano de las tres variantes de tarea.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión ni audio en la información disponible.

## Casos de uso

- Verificación de consistencia entre filings: comparar una cifra declarada en un 10-Q con la reportada en el 10-K de la misma empresa para detectar contradicciones o diferencias de base contable, usando el veredicto CONTRADICTION o NOT_COMPARABLE según corresponda.
- Control de calidad de extracción XBRL: validar que los valores extraídos automáticamente de tablas de estados financieros coinciden con las afirmaciones de otro documento, citando la evidencia concreta que respalda o refuta cada valor.
- Detección de comparaciones no válidas: identificar cuándo una afirmación mezcla consolidado y segmento, periodos de distinta longitud o unidades distintas, devolviendo NOT_COMPARABLE en lugar de una falsa contradicción.
- Triaje para revisión humana: usar NEEDS_REVIEW e INSUFFICIENT_EVIDENCE para enrutar a analistas únicamente los casos ambiguos, reduciendo el volumen de revisión manual en pipelines de due diligence.
- Asistencia en investigación financiera en inglés y coreano: comparar afirmaciones y evidencias en ambos idiomas gracias a las versiones coreanas de las tres variantes de tarea.
- Prototipado de pipelines de auditoría documental: integrar el adaptador en un servidor vLLM con LoRA en runtime para experimentar con verificación estructurada antes de construir un sistema propio con datos reales.
- Evaluación de metodologías de fine-tuning: usar el caso como referencia para diseñar conjuntos de validación con documentos reales y detectar sobreajuste a plantillas sintéticas.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card. El conjunto interno held-out tiene 890 ítems de 21 empresas no vistas en entrenamiento, generado con la misma plantilla que los datos de entrenamiento. El conjunto de filings reales tiene 549 ítems de tablas de estados financieros de 32 empresas no presentes ni en entrenamiento ni en el conjunto interno.

| Evaluación | Base | Adaptador | Observaciones |
|---|---|---|---|
| Exactitud global, conjunto interno sintético (890 ítems) | 0,882 | 0,943 | +6,1 pp; IC 95% pareado [+3,8, +8,4] |
| Veredicto de par, filings reales (549 ítems) | 0,884 | 0,415 | El adaptador empeora |
| QA de valor, filings reales | 0,828 | 0,470 | El adaptador empeora |
| "No encontrado" correcto cuando la respuesta está ausente, filings reales | 0,902 | 0,293 | El adaptador empeora |

El propio autor interpreta la mejora en el conjunto sintético como evidencia de que el adaptador aprendió las reglas de etiquetado de su plantilla, no de generalización a documentos reales. En filings reales recomienda usar el modelo base.

## Requisitos de hardware

- El adaptador en sí ocupa 233,6 MB en F32; el requisito dominante es el modelo base Qwen/Qwen3.8-27B.
- VRAM estimada para el base: no disponible en la información proporcionada; depende del tamaño real del base y de la cuantización elegida (BF16, FP8, NVFP4).
- GPU recomendadas: el autor probó NVFP4 + DFlash2 en Blackwell; no se detallan modelos concretos de GPU ni cifras de VRAM.
- Viabilidad en GPU de consumo: no disponible en la información proporcionada.
- Despliegue probado: vLLM 0.29.0 con `--enable-lora --max-lora-rank 8`, `--max-model-len 32768`, `--reasoning-parser qwen3`, y opcionalmente `--kv-cache-dtype fp8` y `--speculative-config` con DFlash2 (7 tokens especulativos).
- Restricción operativa: un adaptador por servidor en la configuración NVFP4 + DFlash2 probada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-InvestProof-27B-v1-LoRA | Adaptador LoRA sobre Qwen3.8-27B | 58,36 M entrenables | 32.768 tokens (config. vLLM) | Verificación claim vs evidencia financiera | Apache-2.0 | Hugging Face (adaptador solo) |
| Qwen/Qwen3.8-27B (base) | Modelo completo | no disponible | no disponible | Generación de texto general | Apache-2.0 | Hugging Face |
| Alternativas específicas de verificación financiera | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores o modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sobreajuste al formato de plantilla: el adaptador empeora respecto al base en todos los ejes medidos sobre tablas de estados financieros reales (veredicto de par 0,884 → 0,415; QA de valor 0,828 → 0,470; "no encontrado" correcto 0,902 → 0,293). En documentos reales, el autor recomienda usar el base.
- La mejora reportada (+6,1 pp) procede de un conjunto generado con la misma plantilla que el entrenamiento, por lo que no debe interpretarse como generalización.
- Research preview: no es asesoramiento de inversión ni un sistema certificado para producción.
- Solo se publica el adaptador; los pesos del base y los datos de entrenamiento no están disponibles.
- Aritmética poco fiable: el autor advierte de recalcular la cadena `calculation` con aritmética decimal e ignorar el campo `answer`.
- Idiomas limitados a inglés y coreano; no se documenta cobertura de castellano.
- Configuración de inferencia restringida: thinking desactivado, temperature=0, max_tokens=1024; no se documenta comportamiento fuera de estos ajustes.
- Un adaptador por servidor en la ruta NVFP4 + DFlash2 probada.
- Riesgo de alucinación en la cita de evidencias y en el rationale no cuantificado en la información disponible.
- Sesgos: no documentados en la información proporcionada.
- Licencia Apache-2.0 permite uso comercial del adaptador, pero el comportamiento en dominios reales desaconseja su uso en producción sin validación propia.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-InvestProof-27B-v1-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-InvestProof-27B-v1-LoRA/blob/main/MODEL_CARD.ko.md
- Base cuantizada NVFP4 citada por el autor: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-GPTQ-txt
- Modelo de decodificación especulativa DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
