# ViniciusJS/qwen2.5-7b-finqa-lora-b-4096

## Resumen

El modelo `ViniciusJS/qwen2.5-7b-finqa-lora-b-4096` es un adaptador LoRA de investigación, no un modelo completo, entrenado sobre `Qwen/Qwen2.5-7B-Instruct` para responder preguntas numéricas sobre documentos financieros (tarea FinQA) y para clasificación de fallos industriales (FailureSensorIQ). Lo publica el usuario ViniciusJS en el marco del proyecto Pesquisa_IC_IA y su propósito es exclusivamente reproducibilidad y estudio académico: no es un servicio de inferencia ni un modelo listo para producción.

El adaptador se entrenó con QLoRA en NF4 de 4 bits con doble cuantización, rango 8, alpha 16 y dropout 0.1 sobre las proyecciones q/k/v/o y gate/up/down. La "batería B" hace referencia a un límite de entrada de 4096 tokens durante el entrenamiento, no a la longitud de contexto nativa del modelo base, que es de 32 768 tokens. El repositorio pesa unos 0,1 GB (80 792 096 bytes de pesos) y requiere descargar por separado el modelo base Qwen2.5-7B-Instruct.

Su relevancia es limitada y de carácter metodológico: los propios resultados históricos reportados son bajos (0,1542 de precisión numérica en FinQA sobre 617 muestras) y el autor advierte explícitamente de que las comparaciones entre baterías están confundidas por cambios de configuración. La model card documenta además fallos conocidos del pipeline, como el truncado de la respuesta completa en 2227 de 4924 muestras de entrenamiento por tokenización, lo que lo convierte en un caso de estudio sobre trazabilidad y auditoría de experimentos más que en una herramienta práctica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (pesos del adaptador: 80 792 096 bytes); modelo base: 7,6 mil millones aprox. |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens de entrada en entrenamiento; contexto nativo del base: 32 768 tokens |
| Tipos de cuantizacion | QLoRA NF4 4-bit con doble cuantización y cómputo FP16 (entrenamiento); inferencia en 4 bits o precisión completa según `usage.py` |
| Idiomas soportados | en, pt (las instrucciones y QA fuente son principalmente en inglés con envoltorios en portugués; la competencia bilingüe no está evaluada) |
| Licencia | Apache-2.0 (adaptador y material de release); base Apache-2.0; FinQA MIT; FailureSensorIQ CC-BY-4.0 en el archivo original de IBM |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only con atención completa y RoPE, del que no se modifican los pesos. El entrenamiento empleó QLoRA con cuantización NF4 de 4 bits, doble cuantización y cómputo en FP16, con rango LoRA 8, alpha 16 y dropout 0.1 sobre las proyecciones de atención (q, k, v, o) y las proyecciones del MLP (gate, up, down). La configuración registrada incluye semilla 42, tres épocas, tasa de aprendizaje 0,0002, microbatch 2, acumulación de gradiente 16 y 462 pasos registrados; la selección de checkpoint se hizo por pérdida de validación.

Los datos proceden de FinQA y FailureSensorIQ convertidos a ejemplos de estilo completion y divididos localmente en 4924/615/617 muestras (train/validación/test). El formato de entrenamiento fue `prompt + ' ' + resposta`, sin plantilla de chat, sin EOS explícito y sin restringir la pérdida a los tokens de respuesta. No se registró la revisión exacta del modelo base usada en el entrenamiento histórico. El autor documenta dos problemas metodológicos relevantes: la auditoría de tokenización de la batería A encontró que la respuesta completa quedaba truncada en 2227 de 4924 muestras, y las pruebas exploratorias posteriores de FinQA (2026-11-17) extraían valores cortos pero fallaban los contratos de selección de fuente y repetían hasta el límite de contexto nativo en entradas largas.

## Capacidades

- Respuesta a preguntas numéricas sobre documentos financieros (FinQA) en formato de completion, con extracción de valores y tolerancia de coincidencia numérica de 0,001.
- Clasificación multietiqueta de fallos en sensores industriales (FailureSensorIQ), con métricas por etiqueta.
- Generación de texto en inglés y portugués a nivel de instrucción heredada del modelo base Qwen2.5-7B-Instruct.
- No hay evidencia de soporte fiable de tool calling, function calling, JSON estructurado ni razonamiento agéntico multi-paso; la evaluación del arnés de agentes queda explícitamente como `not_scored`.
- No soporta visión, audio ni modo thinking.
- Las respuestas históricas se generaron con decodificación greedy y un máximo de 32 tokens nuevos, por lo que la capacidad de respuestas largas o abiertas no está validada.

## Casos de uso

- Reproducción de experimentos académicos: cargar el adaptador con `usage.py` y la revisión fijada del modelo base para replicar las métricas históricas de FinQA y FailureSensorIQ, verificando hashes contra `checksums.sha256`.
- Auditoría de pipelines de tokenización: usar el caso documentado del truncado de respuestas (2227/4924 muestras) como referencia para diseñar validaciones de longitud en proyectos de fine-tuning propios.
- Estudio de formatos de entrenamiento: analizar el efecto de entrenar sin plantilla de chat, sin EOS y sin enmascarado de pérdida sobre tokens de instrucción, comparando con variantes corregidas.
- Investigación sobre evaluación financiera: emplear el split local de FinQA como banco de pruebas controlado para medir extracción de valores numéricos con tolerancia definida, sin presentar los resultados como cifras de leaderboard.
- Docencia en mantenimiento predictivo: ilustrar la formulación multietiqueta de FailureSensorIQ y el cálculo de macro F1 por etiqueta (0,3363 reportado) como ejercicio de métricas desbalanceadas.
- Referencia de gobernanza de licencias: el archivo `LICENSE_AUDIT.md` documenta la discrepancia entre CC-BY-4.0 y Apache-2.0 en la fuente de IBM, útil como plantilla para auditorías de cumplimiento en datasets derivados.

## Benchmarks y rendimiento

| Evaluación | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA, precisión numérica (agregado original) | 0,1542 | 617 |
| FailureSensorIQ, exactitud de conjunto de etiquetas (multilabel v2) | 0,1155 | 831 |
| FailureSensorIQ, macro F1 por etiqueta (multilabel v2) | 0,3363 | 831 |

Estos son resultados locales históricos, no reproducidos de forma independiente para esta release. La generación se limitó a 32 tokens nuevos, 4096 tokens de entrada y decodificación greedy. Las comparaciones entre baterías A y B están confundidas por cambios en el tamaño de batch y, en el caso de Failure/híbrido, por la tasa de aprendizaje; el autor indica que el mayor límite de entrada no demuestra superioridad global.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en 4 bits (NF4) para el modelo base de 7B más el adaptador; en FP16, unos 15-16 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB, H100 para servir el modelo base; el adaptador en sí ocupa unos 0,1 GB.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB o superiores con cuantización de 4 bits; en FP16 requiere al menos 16 GB.
- Opciones de despliegue: `transformers` (>=4.57.6) con `peft` (>=0.19.1), `accelerate`, `safetensors` y `bitsandbytes`; el autor proporciona `usage.py`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles; no se publicaron mediciones de rendimiento en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-finqa-lora-b-4096 (este) | Adaptador LoRA sobre 7B | 4096 en entrenamiento; 32 768 nativo del base | FinQA + FailureSensorIQ | Apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-7B-Instruct (base) | 7,6B aprox. | 32 768 | Instrucción general | Apache-2.0 | Hugging Face, ampliamente usado |
| Adaptadores FinQA públicos sobre modelos de 7B | no disponible | no disponible | FinQA | variable | no disponible en la información proporcionada |

No se dispone de datos de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar `Qwen/Qwen2.5-7B-Instruct` por separado; el repositorio solo contiene el adaptador.
- Los resultados reportados son históricos y locales, no reproducidos de forma independiente; no deben citarse como cifras de leaderboard.
- El pipeline de entrenamiento presentó fallos documentados: truncado de la respuesta completa en 2227/4924 muestras de entrenamiento y repetición hasta el límite de contexto en pruebas exploratorias posteriores.
- Entrenamiento sin plantilla de chat, sin EOS explícito y sin enmascarado de pérdida en tokens de instrucción, lo que degrada la calidad de las respuestas.
- Capacidad bilingüe no evaluada: los metadatos no afirman competencia en portugués pese a incluir envoltorios en ese idioma.
- Riesgo elevado de alucinación en dominios financiero e industrial; el autor exige verificar las salidas contra la evidencia antes de cualquier decisión.
- La evaluación agéntica y de tool use queda como `not_scored`; no hay validación de JSON fiable ni de análisis financiero abierto.
- La revisión exacta del modelo base usada en el entrenamiento no se registró, lo que compromete la reproducibilidad estricta.
- Discrepancia de licencia en la fuente FailureSensorIQ (CC-BY-4.0 en el archivo de IBM frente a Apache-2.0 en su tarjeta actual); el adaptador conserva la atribución CC-BY.
- Los datasets originales no se redistribuyen y mantienen sus propios términos.

## Enlaces

- Hugging Face: https://huggingface.co/ViniciusJS/qwen2.5-7b-finqa-lora-b-4096
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- Paper FinQA: https://aclanthology.org/2021.emnlp-main.300/
- Repositorio FinQA: https://github.com/czyssrs/FinQA
- Paper FailureSensorIQ: https://arxiv.org/abs/2506.03278
- Repositorio FailureSensorIQ: https://github.com/IBM/FailureSensorIQ
- Informe Qwen2.5: https://arxiv.org/abs/2412.15115
