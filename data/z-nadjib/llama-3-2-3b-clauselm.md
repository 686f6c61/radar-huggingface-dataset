# Z-Nadjib/Llama-3.2-3B-ClauseLM

## Resumen

Llama-3.2-3B-ClauseLM es un modelo de 3.212 millones de parámetros ajustado (fine-tuned) por el autor Z-Nadjib a partir de meta-llama/Llama-3.2-3B-Instruct, especializado en extracción de cláusulas de contratos comerciales. Dado un fragmento de contrato, el modelo devuelve un objeto JSON con los pasajes textuales que corresponden a cada una de las 41 categorías de cláusulas del dataset CUAD (The Atticus Project): partes, fechas, ley aplicable, derechos de terminación, límites de responsabilidad, seguros, licencias y más. Cada valor devuelto es un span literal del contrato, lo que facilita la trazabilidad y la verificación humana.

El ajuste se realizó mediante QLoRA (base en 4 bits NF4, LoRA r=32) sobre los contratos de entrenamiento de CUAD v1, con los pesos LoRA fusionados posteriormente en la base de 16 bits. El entrenamiento completo se ejecutó en una única RTX 5080 de 16 GB en unos 50 minutos, lo que demuestra que una tarea jurídica de extracción estructurada puede abordarse con hardware de consumo.

Su relevancia actual radica en la necesidad práctica de automatizar la revisión de contratos: frente al modelo base (span F1 micro de 9,6 en zero-shot), este modelo alcanza 61,7 F1 micro y 83,8 F1 de presencia a nivel de documento, con un 100 % de JSON utilizable. Es un ejemplo claro de cómo un modelo pequeño y especializado supera con creces a un modelo generalista en una tarea vertical, con costes de inferencia de aproximadamente 0,0031 USD por contrato.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama 3.2), ajuste QLoRA fusionado |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | Pesos publicados en 16 bits (bf16); entrenamiento con base 4-bit NF4 (QLoRA) |
| Idiomas soportados | Ingles |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (6,4 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer decoder de 3B parámetros, y se ajusta con QLoRA: base congelada en 4 bits NF4 y adaptadores LoRA con r=32 y alpha=32 aplicados a todas las proyecciones lineales. Los adaptadores se fusionaron después en la base de 16 bits, de modo que el modelo desplegable es un checkpoint estándar de 3,2B parámetros sin dependencias de PEFT.

Los datos de entrenamiento provienen de CUAD v1: 367 contratos del split oficial de entrenamiento, con 41 contratos reservados para validación. Se generaron 3.402 ventanas de 6.000 caracteres con 600 caracteres de solapamiento, de las cuales el 21 % no contiene ninguna cláusula (ejemplos negativos). La pérdida se calcula solo sobre los tokens de completación (el JSON), no sobre el prompt. Se usó AdamW 8-bit con learning rate 2e-4, schedule coseno, 3 % de warmup y batch efectivo de 16, con el framework Unsloth 2026.10.9 y TRL 1.15.0. El checkpoint seleccionado es el paso 180 de 426 (0,85 épocas), el de menor pérdida de validación. Como innovación de inferencia, el proyecto asociado incluye chunking de documentos largos, decodificación con gramática restringida (grammar-constrained decoding) y fusión de resultados entre ventanas.

## Capacidades

- Extraccion estructurada de clausulas: dado un fragmento de contrato de hasta unos 6.000 caracteres, devuelve un JSON compacto con solo los campos encontrados, con valores como listas de cadenas literales del texto.
- Cobertura de las 41 categorias de CUAD: `document_name`, `parties`, `agreement_date`, `expiration_date`, `governing_law`, `non_compete`, `exclusivity`, `cap_on_liability`, `insurance`, `audit_rights`, `license_grant`, `change_of_control`, entre otras.
- Grounding alto: el 97,4 % de los spans devueltos son copias literales del contrato, lo que permite verificación automática y revisión humana.
- Salida JSON 100 % parseable en la evaluación documental publicada.
- Compatible con el ecosistema transformers y con plantillas de chat del modelo base; funciona con decodificación greedy sin penalty de repetición.
- No es un modelo conversacional generalista: su uso principal es la tarea de extracción para la que fue ajustado. No incorpora visión, audio ni modalidades adicionales.
- Tool calling y capacidades de agente: no disponible en la información proporcionada.

## Casos de uso

- Revision previa de contratos en despachos juridicos: identificar automaticamente cláusulas de exclusividad, no competencia o ley aplicable en grandes volúmenes de contratos antes de la revisión por un abogado, reduciendo el tiempo de triaje inicial.
- Debida diligencia (due diligence) en fusiones y adquisiciones: extraer de forma sistemática cláusulas de cambio de control, cesión, límites de responsabilidad y perpetuidad de licencias de cientos de contratos durante un data room.
- Gestion de contratos corporativa (CLM): indexar cláusulas clave (fechas de expiración, plazos de renovación, periodos de preaviso) en bases de datos para alertas de vencimiento y renovación automática.
- Cumplimiento normativo y auditoria: localizar cláusulas de derechos de auditoria, restricciones de volumen o compromisos mínimos para verificar el cumplimiento de acuerdos de suministro.
- Analisis de riesgo en licencias de software: detectar licencias perpetuas o irrevocables, escrow de código fuente y licencias de afiliados que implican riesgos de propiedad intelectual.
- Construccion de datasets juridicos: usar el modelo para anotar masivamente contratos con spans etiquetados, generando datos de entrenamiento para clasificadores o sistemas NER posteriores.
- Integracion en pipelines RAG juridicos: preprocesar contratos para extraer metadatos estructurados que mejoren la recuperación en sistemas de pregunta-respuesta sobre documentos legales.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 102 contratos del split de test oficial de CUAD, a nivel de documento. Un span se considera correcto cuando su similitud Jaccard a nivel de palabra con un span gold del mismo campo es al menos 0,5.

| System | Span F1 (micro) | Span F1 (macro) | Presence F1 | Grounded spans | Usable JSON | Latencia / contrato |
|---|---|---|---|---|---|---|
| **Este modelo** | **61,7** | **50,4** | **83,8** | 97,4 % | 100 % | 27,5 s |
| Llama-3.2-3B-Instruct, zero-shot | 9,6 | 5,0 | 49,5 | 20,9 % | 100 % | 40,5 s |
| Qwen2.5-1.5B + QLoRA (misma receta) | 57,2 | 43,2 | 80,9 | 98,6 % | 100 % | 18,0 s |
| Legal-BERT NER (token classification) | 42,7 | 30,2 | 80,8 | 100 % | n/a | 0,08 s |

La latencia se midió en una RTX 5080 (16 GB) con transformers en bf16, procesando todas las ventanas de un contrato en un mismo batch. A un precio de alquiler on-demand de 0,40 USD por hora de GPU, el coste es de 0,0031 USD por contrato; el coste eléctrico estimado (360 W, 0,25 USD/kWh) es de 0,00069 USD.

Mejores campos: governing law (F1 92), document name (88), agreement date (82), expiration date (82). Campos más débiles: affiliate license of the licensor (0), IP ownership assignment (17), post-termination services (18), volume restriction (24).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 6,4 GB en bf16 (tamaño de los pesos); cabe con holgura en GPUs de 16 GB y probablemente en GPUs de 8-12 GB, aunque no hay cifras oficiales de consumo con KV cache.
- GPU de referencia en la evaluación: NVIDIA RTX 5080 (16 GB), con latencia de 27,5 s por contrato en bf16 y batch de ventanas. No se han publicado mediciones en A100, H100 ni otras GPUs.
- Consumer GPUs: sí, la propia evaluación se realizó en una RTX 5080 de consumo; cualquier GPU moderna con 8 GB o más de VRAM debería ser suficiente para bf16 (con cuantización adicional, incluso menos).
- Opciones de despliegue: transformers (uso documentado en la model card); compatibilidad con vLLM, llama.cpp u Ollama no se menciona en la información disponible, aunque el formato safetensors estándar de Llama 3.2 facilita conversiones a GGUF.
- No se dispone de datos de throughput en producción ni de latencias en otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Span F1 micro (CUAD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-ClauseLM | 3,21B | 4.096 tokens | 61,7 | Llama 3.2 Community | HuggingFace, safetensors |
| Llama-3.2-3B-Instruct (base) | 3,21B | 128.000 tokens | 9,6 (zero-shot) | Llama 3.2 Community | HuggingFace |
| Qwen2.5-1.5B + QLoRA (misma receta) | 1,5B | no disponible | 57,2 | no disponible | receta documentada en el repo del proyecto |
| Legal-BERT NER | no disponible | no disponible | 42,7 | no disponible | arquitectura de token classification |

La comparación muestra que el ajuste especializado multiplica por más de seis el F1 del modelo base en esta tarea, y que supera a un sistema NER clásico basado en Legal-BERT a costa de una latencia mucho mayor (27,5 s frente a 0,08 s por contrato).

## Limitaciones y advertencias

- Idioma: entrenado y evaluado exclusivamente en inglés; el rendimiento en contratos en otros idiomas, incluido el castellano, es desconocido y probablemente deficiente.
- Campos con rendimiento muy bajo o nulo: affiliate license of the licensor (F1 0), IP ownership assignment (17), post-termination services (18) y volume restriction (24); no debe confiarse en la salida para estos campos sin revisión humana.
- Contexto limitado: procesa fragmentos de unos 6.000 caracteres (4.096 tokens en entrenamiento); los documentos largos requieren chunking y fusión, para lo que el proyecto proporciona la clase `ChunkedExtractor`.
- Decodificacion sensible: debe usarse decodificación greedy sin penalty de repetición; un repetition penalty degrada la capacidad de copiar texto literal del contrato.
- Riesgo de alucinación residual: aunque el 97,4 % de los spans son grounded, un 2,6 % de las extracciones no son copias literales, lo que exige validación en flujos críticos.
- Licencia: la Llama 3.2 Community License impone restricciones de uso (límites mensuales de usuarios para ciertos despliegues comerciales, política de uso aceptable de Meta); conviene revisarla antes de uso comercial a gran escala.
- Evaluación del propio autor: los benchmarks proceden de la model card y del repositorio del proyecto; no hay validación independiente de terceros.
- Descargas y adopción reducidas (345 descargas, 2 likes), lo que implica menor madurez comunitaria y menor detección de errores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Z-Nadjib/Llama-3.2-3B-ClauseLM
- Repositorio del proyecto (código, entrenamiento y evaluación): https://github.com/Z-Nadjib/ClauseLM-ContractExtraction-CUAD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset CUAD (The Atticus Project): https://www.atticusprojectai.org/cuad
- Dataset en HuggingFace: https://huggingface.co/datasets/theatticusproject/cuad
