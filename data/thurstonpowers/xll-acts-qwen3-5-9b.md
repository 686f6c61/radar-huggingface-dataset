# thurstonpowers/xll-acts-qwen3.5-9b

## Resumen

XLL Acts — Qwen3.5-9B es un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario thurstonpowers, orientado a la extracción de estructura jerárquica de actas legislativas federales estadounidenses. El modelo recibe texto de un acta indexado de forma lossless (con offsets de caracteres Unicode) y devuelve una representación estructurada mediante etiquetas de un contrato de salida predefinido. Se trata de un checkpoint experimental, no cualificado para producción, publicado como release `acts-20261118`.

El modelo parte de la arquitectura multimodal de Qwen3.5-9B (pipeline image-text-to-text), con 9.409.813.744 parámetros totales, y entrena únicamente los parámetros de lenguaje, congelando la torre de visión. El entrenamiento se realizó sobre 3.900 actas federales completas expandidas a 10.960 chats, con dos épocas y 5.480 actualizaciones del optimizador, sobre una ventana de contexto de 32.768 tokens.

Su relevancia radica en que aborda una tarea concreta y difícil: convertir texto legal plano en un árbol estructural válido, manteniendo los spans de origen verificables. El autor publica además un benchmark estructural sobre 200 actas completas no vistas en entrenamiento, con un 71,5% de árboles válidos a nivel de span, y advierte explícitamente de que estas comprobaciones son de geometría y formato, no de corrección semántica o jurídica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de Qwen3.5-9B (torre de lenguaje entrenada, torre de visión congelada); pipeline image-text-to-text |
| Parámetros totales | 9.409.813.744 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 32.768 tokens en entrenamiento; evaluación realizada con 65.536 tokens de contexto y 16.384 de salida (calidad en contexto largo no cualificada) |
| Tipos de cuantización | no se han publicado cuantizaciones; el artefacto subido es el checkpoint nativo FP32 sin reexportar a BF16 |
| Idiomas soportados | no disponible (el dataset de entrenamiento son actas federales de EE. UU., presumiblemente en inglés, pero no se declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint nativo FP32; la carga en BF16 es un cast en tiempo de inferencia) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo sobre el checkpoint base `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`). Se entrenaron todos los parámetros de lenguaje y se congeló la parte de visión, que no se utiliza. El entrenamiento usó maestros y buffers en FP32, autocast BF16 y Adafactor factorizado en FP32, sin adaptadores ni cuantización. La configuración fue: microbatch de uno, acumulación de cuatro, learning rate `5e-6`, semilla `102301`, dos épocas y 5.480 actualizaciones del optimizador sobre 21.920 presentaciones de chat.

Los datos provienen del dataset `thurstonpowers/xll-acts-structure-indexed`: 3.900 actas federales completas expandidas en 10.960 chats de unidad completa o propia, con 3.231 chats completos que caben en contexto y 669 planes de división guiados por referencia. La pérdida se calcula solo sobre la completación (completion-only loss). Las referencias revisadas tienen peso 1.0 y las plateadas (silver) 0.5, dividido por el número de unidades propias y normalizado globalmente. Los objetivos de entrenamiento son proyecciones de referencia de origen, no oro semántico experto, y la subdivisión guiada por referencia no constituye un divisor cualificado de inferencia solo-fuente ni un método de ensamblaje de actas completas.

La innovación principal no está en la arquitectura, sino en la interfaz: el modelo exige texto indexado de forma lossless (offsets sobre el texto Unicode original sin normalizar, extremo final exclusivo) y un prompt de sistema concreto (`PROMPT_TRAINED.txt`, SHA-256 `57766ac499dd8ab8b1d20901fd14447af2c2477d57433c2d4c11f2486618ea3b`) junto con un contrato de etiquetas (`OUTPUT_CONTRACT.json`). El corpus de ejecución nativo tiene SHA-256 `9074e0f8ce109e88883f5c6323d323020ae7852ec053134ecd3bd1162ab7ecd7`.

## Capacidades

- Extracción de estructura jerárquica de actas legislativas federales: genera un árbol de spans válido a partir de texto indexado.
- Generación de salida estructurada conforme a un contrato de etiquetas predefinido (`OUTPUT_CONTRACT.json`).
- Proyección de referencias de origen: cada nodo estructural se ancla a offsets del texto original.
- Procesamiento de documentos largos: entrenado con 32.768 tokens de contexto; evaluado hasta 65.536 tokens de entrada con 16.384 de salida (calidad no cualificada más allá de 32K).
- Modo thinking desactivable: la evaluación se realizó con `enable_thinking=False`.
- Capacidad multimodal heredada de la base (image-text-to-text), aunque la torre de visión está congelada y no forma parte del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes ni multilingüismo específico.

## Casos de uso

- Extracción de estructura de actas federales en pipelines de digitalización legal: el modelo convierte texto plano indexado en un árbol de spans verificable, lo que permite auditar cada nodo contra el texto fuente original. Adecuado porque su salida está anclada a offsets Unicode exactos.
- Investigación académica sobre parsing de legislación: sirve como baseline experimental para comparar estrategias de extracción estructural, dado que el autor publica cohorte congelada, salidas y recibos de evaluación.
- Prototipado de herramientas de navegación de textos legales: la estructura jerárquica generada puede alimentar índices o visores de actas, siempre con revisión humana posterior.
- Evaluación de contratos de salida estructurada: el modelo ejemplifica un flujo completo de prompt entrenado + contrato de etiquetas + validación estricta, reutilizable para diseñar sistemas similares en otros dominios documentales.
- Generación de datos sintéticos etiquetados para entrenar modelos más pequeños de extracción estructural, usando las salidas válidas como referencias plateadas tras filtrado.
- Análisis de consistencia estructural entre actas: al normalizar la jerarquía de múltiples documentos, permite detectar variaciones de formato y estructura en corpus legislativos.
- No recomendado para producción sin cualificación adicional: el propio autor indica que no está cualificado para producción y que los spans válidos no garantizan jerarquía legalmente correcta ni cobertura completa.

## Benchmarks y rendimiento

El autor publica un benchmark estructural sobre actas completas no vistas en entrenamiento: cohorte de 100 actas de Connecticut (CT) y 100 federales, cada una con entrada completa por debajo de 34.000 tokens Qwen (máximo 33.947). Ejecutado en RTX 5090, BF16, batch uno, greedy, thinking desactivado, flash SDP, contexto de 65.536 tokens con 16.384 de salida y límite de una hora por caso. Sin fragmentos, truncamiento, reparación de JSON ni sustitución de casos fallidos.

| Resultado estructural estricto | CT | Federal | Total |
|---|---:|---:|---:|
| Árbol válido a nivel de span no trivial | 55/100 | 88/100 | 143/200 (71,5%) |
| Salida inválida | 43 | 12 | 55 |
| Límite de generación alcanzado | 2 | 0 | 2 |

El autor advierte de que son comprobaciones de geometría y formato, no de exactitud de árbol ni de precisión semántica, y que no existen referencias independientes cualificadas. Como comparación, `openai/gpt-6.1-sol` recibió los mismos mensajes del prompt entrenado para las mismas 200 actas sin tope de salida añadido: 169 salidas parseadas fallaron por etiquetas desconocidas y 31 fueron JSON inválido; cero pasaron el contrato estricto. El autor aclara que el prompt entrenado no enumera las etiquetas permitidas y que los presupuestos de salida difieren, por lo que no es una comparación optimizada ni evidencia de que Sol tenga cero comprensión legal.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint nativo es FP32 (37,7 GB de repo); en BF16 se estiman aproximadamente 18,8 GB solo para pesos, más KV cache y activaciones.
- GPU recomendadas: el autor ejecutó la evaluación en una RTX 5090 en BF16. Para contexto completo de 32K-65K con 16K de salida se recomienda VRAM holgada (A100 80 GB, H100, RTX 5090 o similar).
- Cabe en GPU de consumo: sí, en BF16 en GPUs con 24 GB o más (RTX 4090, RTX 5090), aunque el contexto largo y la reserva de salida de 16.384 tokens pueden requerir gestión cuidadosa de memoria.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `attn_implementation="sdpa"` según el ejemplo del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y no se han publicado cuantizaciones GGUF.
- Latencia y throughput: no disponibles. La evaluación usó batch uno, greedy y un límite de una hora por caso, pero no se publican métricas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Acts — Qwen3.5-9B | 9,41 B | 32.768 (entrenamiento) | Extracción estructural de actas | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | 9,41 B (según checkpoint derivado) | no disponible | Modelo generalista multimodal | no disponible | Hugging Face |
| openai/gpt-6.1-sol | no disponible | no disponible | Modelo generalista propietario | propietaria | API |

No se dispone de información sobre otros modelos especializados en extracción estructural de legislación con los que comparar parámetros, contexto o rendimiento. La comparación con `gpt-6.1-sol` publicada por el autor no es una comparación optimizada, según sus propias advertencias.

## Limitaciones y advertencias

- No cualificado para producción: el propio autor lo declara explícitamente. Los spans válidos no establecen jerarquía legalmente correcta, cobertura completa ni precisión semántica.
- Los objetivos de entrenamiento son proyecciones de referencia de origen, no oro semántico experto; no hay referencias independientes cualificadas.
- La subdivisión guiada por referencia no es un divisor cualificado de inferencia solo-fuente ni un método de ensamblaje de actas completas.
- La calidad más allá de 32K tokens de contexto no está cualificada, aunque la evaluación se ejecutara con 65.536 tokens.
- El prompt de sistema debe usarse byte a byte (`PROMPT_TRAINED.txt`); el prompt entrenado no enumera las etiquetas permitidas, que están en `OUTPUT_CONTRACT.json` y no se añadieron a los mensajes del benchmark congelado.
- La entrada debe ser texto indexado lossless con offsets sobre el texto Unicode original sin normalizar; usar texto crudo o XML produce resultados no válidos.
- El entrenamiento de fragmentos usa un prompt de sistema distinto y no cualifica el ensamblaje de fragmentos.
- Riesgo de alucinación estructural: 55 de 200 actas produjeron salida inválida o alcanzaron el límite de generación en el benchmark del autor.
- Sesgos conocidos: no documentados, pero el corpus se limita a actas federales de EE. UU. y algunas estatales (CT), sin cobertura declarada de otros idiomas o jurisdicciones.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la falta de cualificación para producción y la dependencia de un contrato de salida concreto limitan su uso responsable.
- El artefacto subido es el checkpoint FP32 sin reexportar; no se sube estado del optimizador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thurstonpowers/xll-acts-qwen3.5-9b
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-acts-structure-indexed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
