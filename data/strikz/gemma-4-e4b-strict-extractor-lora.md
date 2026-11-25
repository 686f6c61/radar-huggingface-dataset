# Strikz/gemma-4-e4b-strict-extractor-lora

## Resumen

Strikz/gemma-4-e4b-strict-extractor-lora es un adaptador LoRA (PEFT) entrenado sobre el modelo multimodal google/gemma-4-E4B-it para una tarea muy concreta: la extracción estructurada de siete campos de un "packet" de onboarding de proveedores o clientes, devolviendo JSON crudo con estados FOUND/MISSING/CONFLICT y evidencia textual verbatim. No es un modelo generalista ni un agente: es un artefacto de extracción especializado, tal y como el propio autor declara en la model card ("not an agent brain").

El adaptador se entrena mediante SFT (supervised fine-tuning) con datos sintéticos y narrativas de estrés generadas de forma determinista. La versión documentada es SFTv2, que parte del modelo base original, añade narrativas frescas de entrenamiento y ajusta conjuntamente épocas, learning rate y presupuesto de longitud. El repositorio tiene un tamaño de 0,1 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo base.

La relevancia de esta ficha es doble: por un lado, documenta un caso de uso muy específico de extracción de información con control de alucinaciones y trazabilidad de evidencia; por otro, la model card incluye una auditoría de evaluación inusualmente detallada (conjuntos in-distribution, stress y confirmación prospectiva) que permite evaluar el modelo con datos concretos, incluyendo una decisión explícita de SKIP en la fase de confirmación prospectiva. El autor advierte que el modelo no está desplegado ni evaluado sobre documentos reales de clientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre google/gemma-4-E4B-it (modelo base multimodal; clase de inferencia AutoModelForMultimodalLM) |
| Parametros totales | no disponible (el repo del adaptador ocupa 0,1 GB; los parámetros del modelo base no se detallan en la información proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona un "768-token ceiling" en el contexto de una auditoría, pero no se especifica como longitud de contexto oficial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se carga por separado |

## Arquitectura y entrenamiento

El adaptador es un LoRA sobre el modelo base google/gemma-4-E4B-it, que según la plantilla de inferencia de la model card es multimodal (expone configuraciones de texto, visión y audio, con backends de atención SDPA para texto y visión, y eager para audio). El adaptador se entrena mediante SFT con datos sintéticos y narrativas de estrés; la versión SFTv2 parte del modelo base original, incorpora narrativas de entrenamiento nuevas y modifica conjuntamente épocas, learning rate y presupuesto de longitud respecto a SFTv1.

La innovación técnica principal no está en la arquitectura sino en el protocolo de evaluación y en el diseño de la tarea: el modelo debe emitir JSON crudo con exactamente siete claves (legal_entity_name, dba_name, entity_type, primary_contact, amount_due, payment_terms, effective_date), cada una con un objeto de estado, valor y evidencia. Los estados FOUND requieren una subcadena verbatim exacta del packet; MISSING cubre ausencias, redacciones, TBD o promesas futuras; CONFLICT requiere dos evidencias verbatim contradictorias sin resolución explícita. El autor documenta una auditoría en CPU con ocho trazas acotadas que estableció paradas seleccionadas de fin de turno, no un techo de 768 tokens, y advierte que la asociación de sufijos de tokens no prueba un bug causal de tokenizer/BPE. La evaluación incluye conjuntos in-distribution, de estrés y de confirmación prospectiva sellada antes de la inferencia, con scoring congelado; el generador determinista de datos se mantiene reservado para evitar su reconstrucción.

## Capacidades

- Extracción estructurada de siete campos concretos de un packet de onboarding, con salida en JSON crudo sin markdown ni comentarios.
- Clasificación de cada campo en tres estados: FOUND (con evidencia verbatim), MISSING (ausente, redactado, TBD o prometido) y CONFLICT (dos afirmaciones contradictorias en secciones distintas sin resolución explícita).
- Control de alucinaciones mediante exigencia de subcadena verbatim exacta para FOUND y de dos evidencias verbatim para CONFLICT.
- Preservación de la ortografía, el formato de moneda y el formato de fecha declarados en el packet.
- Desambiguación semántica de campos: primary_contact se refiere al contacto designado por el cliente, no al remitente, bróker, abogado o empleado del proveedor; amount_due se refiere a la factura o retainer actual, no a facturas pagadas previas ni importes ilustrativos.
- Capacidad multimodal heredada del modelo base (texto, visión y audio según la configuración del modelo base), aunque la tarea entrenada es de extracción sobre texto de packet.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible; el autor indica explícitamente que no es un "agent brain".
- Capacidades multilingües: no disponible.

## Casos de uso

- Extracción de datos de onboarding de proveedores: el modelo recibe el texto completo de un packet y devuelve un JSON con los siete campos solicitados, con evidencia verbatim para cada FOUND. Es adecuado porque el entrenamiento está específicamente orientado a esta tarea y el formato de salida es fijo y validable con grader.py.
- Validación de contratos y facturas iniciales: permite distinguir el importe debido actual (retainer o balance) de facturas pagadas previas o importes ilustrativos, reduciendo errores de conciliación en el alta de clientes.
- Detección de contradicciones documentales: el estado CONFLICT obliga a señalar dos evidencias verbatim contradictorias en secciones distintas, lo que sirve para marcar packets que requieren revisión humana antes de continuar el proceso.
- Enriquecimiento de pipelines de KYC/onboarding: el JSON de salida puede alimentar un sistema posterior de verificación, ya que cada campo incluye estado y evidencia trazable en lugar de un valor sin justificación.
- Auditoría de extracciones previas: al exigir subcadenas verbatim, el modelo permite reconstruir qué fragmento exacto del documento justifica cada valor, útil para revisiones de cumplimiento.
- Prototipado de extracción estructurada con modelos pequeños: al ser un adaptador LoRA de 0,1 GB sobre un modelo base E4B, puede integrarse en entornos con recursos limitados para experimentar con extracción de información antes de escalar a modelos mayores.
- Filtrado previo de packets incompletos: el estado MISSING identifica campos ausentes, redactados o prometidos para más adelante, lo que permite rechazar o posponer packets antes de procesarlos manualmente.

## Benchmarks y rendimiento

Los datos de la model card corresponden a la evaluación del autor sobre sus propios conjuntos (in-distribution, stress y confirmación prospectiva). No son benchmarks estándar como MMLU o HumanEval.

| Dataset | Modelo | JSON validity | FOUND F1 | MISSING accuracy | CONFLICT accuracy | Alucinaciones detectadas |
|---|---|---:|---:|---:|---:|---:|
| base_gemma4_e4b | google/gemma-4-E4B-it | 0,963333 | 0,968559 | 0,803810 | 0,938095 | 16 |
| sft_gemma4_e4b | checkpoints/sft_gemma4_e4b_merged | 0,996667 | 0,996966 | 0,996190 | 0,980952 | 2 |
| sft_v2_gemma4_e4b | checkpoints/sft_v2_gemma4_e4b_merged | 0,996667 | 0,997400 | 0,998095 | 0,990476 | 0 |
| base_gemma4_e4b_stress | google/gemma-4-E4B-it | 0,625000 | 0,647005 | 0,605714 | 0,447619 | 54 |
| sft_gemma4_e4b_stress | checkpoints/sft_gemma4_e4b_merged | 0,275000 | 0,351942 | 0,357143 | 0,152381 | 19 |
| sft_v2_gemma4_e4b_stress | checkpoints/sft_v2_gemma4_e4b_merged | 1,000000 | 0,989674 | 0,991429 | 0,992857 | 4 |
| base_gemma4_e4b_confirm | google/gemma-4-E4B-it | 0,820000 | 0,811864 | 0,837143 | 0,659524 | 18 |
| sft_v1_gemma4_e4b_confirm | checkpoints/sft_gemma4_e4b_merged | 0,400000 | 0,484163 | 0,528571 | 0,273810 | 2 |
| sft_v2_gemma4_e4b_confirm | checkpoints/sft_v2_gemma4_e4b_merged | 1,000000 | 0,993620 | 1,000000 | 0,992857 | 0 |

La decisión prospectiva documentada es SKIP: no se ejecutó SMPO. Quedan nueve packets de confirmación v2 imperfectos; la evaluación original de v2 tiene una fila inválida y el conjunto de estrés tiene cuatro alucinaciones de campo detectadas. Las filas inválidas se clasifican por separado como no alucinación, no como prueba de seguridad. El autor advierte que la fuga estrecha de FOUND de terceros no detecta la mezcla falsa de CONFLICT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El adaptador LoRA ocupa 0,1 GB; el modelo base google/gemma-4-E4B-it se carga aparte y su huella de VRAM no se detalla en la información proporcionada.
- GPU recomendadas: no disponible. La plantilla de inferencia usa device_map="cuda" y torch_dtype=torch.bfloat16, sin especificar modelos de GPU.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: transformers con AutoProcessor, AutoConfig y AutoModelForMultimodalLM, más PEFT para cargar el adaptador. La plantilla indica usar la clase multimodal compuesta, no un sustituto causal genérico, y fijar una revisión inmutable aprobada. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Strikz/gemma-4-e4b-strict-extractor-lora | no disponible (adaptador de 0,1 GB sobre gemma-4-E4B-it) | no disponible | FOUND F1 0,9974, JSON validity 0,9967 en in-distribution; FOUND F1 0,9936 en confirmación | apache-2.0 | Hugging Face (adaptador) |
| google/gemma-4-E4B-it (base) | no disponible | no disponible | FOUND F1 0,9686, JSON validity 0,9633 en in-distribution; FOUND F1 0,8119 en confirmación | no disponible en la información proporcionada | Hugging Face |
| checkpoints/sft_gemma4_e4b_merged (SFTv1) | no disponible | no disponible | FOUND F1 0,9970, JSON validity 0,9967 en in-distribution; FOUND F1 0,4842 en confirmación | no disponible | Referenciado en la model card, no como repo público |

No se dispone de datos de otros modelos comparables de la misma categoría (extracción estructurada con evidencia verbatim) en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de extracción especializado de siete campos, no un agente generalista ni un "agent brain".
- No está desplegado y no ha sido evaluado sobre documentos reales de clientes; toda la evidencia proviene de conjuntos sintéticos y de estrés.
- La decisión prospectiva documentada es SKIP: no se ejecutó SMPO y quedan nueve packets de confirmación v2 imperfectos.
- La evaluación original de v2 contiene una fila inválida y el conjunto de estrés tiene cuatro alucinaciones de campo detectadas; las filas inválidas no son prueba de seguridad.
- La fuga estrecha de FOUND de terceros no detecta la mezcla falsa de CONFLICT, según el propio autor.
- Los conjuntos de estrés se usaron para desarrollo y no constituyen un test final intacto; el conjunto de reserva permanece sin publicar.
- El generador determinista de datos se mantiene reservado para evitar su reconstrucción a partir del material publicado.
- Riesgo de alucinación: aunque el diseño exige evidencia verbatim, la model card reporta alucinaciones detectadas en varios conjuntos (16 en base in-distribution, 54 en base stress, 4 en SFTv2 stress).
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia para uso comercial: la licencia del adaptador es apache-2.0, pero la model card indica que los términos suplementarios de código/parche de Halo no se relicencian con este archivo; verificar la licencia del modelo base google/gemma-4-E4B-it antes de uso comercial.
- La plantilla de inferencia no se ejecutó durante la preparación y requiere sustituir explícitamente OWNER_APPROVED_MERGED_REPO y OWNER_APPROVED_IMMUTABLE_COMMIT; además, el modelo debe validarse con grader.py.
- El repositorio del adaptador y el repositorio de código tienen visibilidad privada inicial y el acceso a uno no otorga acceso al otro.

## Enlaces

- Hugging Face: https://huggingface.co/Strikz/gemma-4-e4b-strict-extractor-lora
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Código y evidencia de evaluación: https://github.com/nerdcakes/gemma4-strict-extractor
