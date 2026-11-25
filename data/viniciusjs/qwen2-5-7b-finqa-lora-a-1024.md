# ViniciusJS/qwen2.5-7b-finqa-lora-a-1024

## Resumen

El repositorio `ViniciusJS/qwen2.5-7b-finqa-lora-a-1024` contiene un adaptador LoRA (entrenado con QLoRA en 4 bits) sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No es un modelo independiente ni un servicio de inferencia: es un artefacto de investigación de 80.792.096 bytes (unos 0,1 GB) que debe cargarse junto al modelo base de Qwen para funcionar. Lo publica el autor ViniciusJS dentro del proyecto Pesquisa_IC_IA, con el objetivo de especializar un modelo de 7B en respuesta a preguntas numéricas sobre documentos financieros (FinQA) y en clasificación de fallos industriales (FailureSensorIQ).

El adaptador se entrenó con un límite de entrada de 1024 tokens (de ahí el sufijo "a-1024" y la "batería A"), un rango LoRA de 8, alpha 16 y dropout 0,1 sobre las proyecciones q/k/v/o y gate/up/down. Los splits de entrenamiento, validación y test son 4924/615/617 ejemplos, generados a partir de FinQA y FailureSensorIQ convertidos a formato de completación. La model card es explícitamente cauta: advierte de que los resultados históricos no están reproducidos de forma independiente, de que la evaluación con arnés de agentes quedó sin puntuar y de que una auditoría de tokenización detectó que la respuesta completa se truncaba en 2227 de los 4924 ejemplos de entrenamiento.

Su relevancia es doble. Por un lado, sirve como ejemplo de publicación reproducible y honesta de un adaptador de investigación, con hashes, `provenance.json` y auditoría de licencias. Por otro, es un caso de estudio de los riesgos de entrenar adaptadores con presupuestos de contexto cortos sobre tareas que requieren razonamiento numérico multi-paso. Los resultados reportados son modestos: 0,1045 de exactitud numérica en FinQA y 0,1288 de exactitud de conjunto de etiquetas en FailureSensorIQ, lo que lo sitúa lejos de un uso en producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-7B-Instruct) |
| Parametros totales | 7B en el modelo base; adaptador de 80.792.096 bytes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens de entrada en entrenamiento (el modelo base soporta contexto nativo mayor, no especificado en la ficha) |
| Tipos de cuantizacion | QLoRA NF4 4-bit con doble cuantización y cómputo FP16 durante el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | en, pt (instrucciones y QA principalmente en inglés con envoltorios en portugués; la model card no afirma competencia bilingüe evaluada) |
| Licencia | Apache-2.0 (adaptador y material de release); modelo base Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-7B-Instruct, un transformer decoder-only de 7B parámetros del equipo Qwen. La adaptación usa LoRA con rango 8, alpha 16 y dropout 0,1 sobre las proyecciones de atención q/k/v/o y las proyecciones MLP gate/up/down. El entrenamiento se realizó con QLoRA en NF4 de 4 bits con doble cuantización y cómputo en FP16, semilla 42, tres épocas, learning rate 0,0002, microbatch 4 y acumulación de gradiente 8, con 462 pasos registrados. La selección de checkpoint se hizo por pérdida de validación.

Los datos provienen de FinQA (preguntas numéricas sobre informes financieros) y FailureSensorIQ (clasificación de fallos industriales), convertidos a ejemplos de estilo completación y divididos localmente. El entrenamiento usó el formato `prompt + ' ' + resposta`, sin plantilla de chat, sin EOS explícito y sin restringir la pérdida a los tokens de respuesta. La revisión exacta del modelo base usada en el entrenamiento histórico no se registró. La model card documenta que la auditoría de tokenización encontró truncamiento completo de la respuesta en 2227/4924 muestras de entrenamiento, un defecto relevante para interpretar los resultados.

## Capacidades

- Generación de texto y respuesta a preguntas numéricas sobre documentos financieros (FinQA), con extracción de valores cortos.
- Clasificación multietiqueta de fallos en contexto industrial (FailureSensorIQ), con exactitud de conjunto de etiquetas y F1 macro por etiqueta reportados.
- Formato de completación: espera `prompt + ' ' + resposta`; no usa plantilla de chat.
- Soporte de tool calling / function calling: no disponible (la evaluación con arnés de agentes quedó `not_scored`).
- Soporte de agentes y razonamiento multi-paso: no validado; la model card advierte de que los números históricos no validan uso de herramientas, JSON fiable ni análisis financiero abierto.
- Capacidades multilingües: instrucciones y QA principalmente en inglés con envoltorios en portugués; sin evaluación bilingüe acreditada.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación reproducible en FinQA: cargar el adaptador sobre Qwen2.5-7B-Instruct con `usage.py` y `--four-bit` para replicar la métrica de exactitud numérica reportada (0,1045) y estudiar el efecto del truncamiento de respuestas en el entrenamiento.
- Estudio de QLoRA en dominios especializados: usar la configuración documentada (rango 8, alpha 16, NF4, lr 0,0002) como línea base para comparar con adaptadores de mayor rango o mayor presupuesto de contexto.
- Auditoría de calidad de datos: analizar el hallazgo de 2227/4924 respuestas truncadas para diseñar pipelines de tokenización que preserven la respuesta completa en tareas de QA numérico.
- Clasificación de fallos industriales como experimento: evaluar la exactitud de conjunto de etiquetas (0,1288) y el F1 macro (0,3838) sobre FailureSensorIQ para dimensionar la brecha respecto a un clasificador supervisado dedicado.
- Docencia y formación: ilustrar en un curso de IA open source las diferencias entre publicar un adaptador y publicar un modelo, incluyendo hashes, `provenance.json` y auditoría de licencias.
- Reproducibilidad y verificación de artefactos: comprobar el SHA-256 del adaptador (`6d94dc0e...`) y los ficheros de `checksums.sha256` como ejercicio de cadena de custodia en publicaciones de investigación.

## Benchmarks y rendimiento

| Evaluación | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA exactitud numérica (agregado original) | 0,1045 | 617 |
| FailureSensorIQ exactitud de conjunto de etiquetas (multilabel v2) | 0,1288 | 831 |
| FailureSensorIQ F1 macro por etiqueta (multilabel v2) | 0,3838 | 831 |

Estos son resultados locales históricos, no reproducidos de forma independiente para este release. FinQA usa coincidencia numérica con tolerancia absoluta/relativa de 0,001. La generación histórica se limitó a 24 tokens nuevos, 1024 tokens de entrada y decodificación greedy. Las comparaciones entre baterías A/B están confundidas por cambios de batch y, en Failure/híbrido, por learning rates. La evaluación posterior con arnés de agentes/Bancada permanece `not_scored`.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa unos 0,1 GB; el modelo base Qwen2.5-7B-Instruct en FP16 requiere aproximadamente 14-16 GB, y en 4 bits (NF4) alrededor de 4-5 GB más overhead.
- GPU recomendadas: A100, H100 o RTX 4090 para FP16; RTX 3090/4090 o GPUs con 8-12 GB para carga en 4 bits.
- Cabe en GPU consumer: sí, en 4 bits en GPUs de 8 GB o más; en FP16 en GPUs de 16 GB o más.
- Opciones de despliegue: el repositorio proporciona `usage.py` con `peft`, `transformers>=4.57.6`, `accelerate`, `safetensors` y `bitsandbytes`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-finqa-lora-a-1024 (este) | 7B base + adaptador LoRA | 1024 tokens de entrada en entrenamiento | FinQA + FailureSensorIQ | Apache-2.0 | Hugging Face (adaptador) |
| Qwen2.5-7B-Instruct | 7B | contexto nativo mayor (no especificado en la ficha) | Generalista, instrucciones | Apache-2.0 | Hugging Face |
| Adaptadores FinQA comparables | no disponible | no disponible | FinQA | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Resultados modestos y no reproducidos de forma independiente: 0,1045 en FinQA y 0,1288 en FailureSensorIQ no respaldan uso en producción financiera o industrial sin validación adicional.
- Defecto de tokenización documentado: la respuesta completa se truncó en 2227/4924 muestras de entrenamiento, lo que compromete el aprendizaje de respuestas completas.
- Entrenamiento sin plantilla de chat, sin EOS explícito y sin restringir la pérdida a tokens de respuesta; el formato esperado es `prompt + ' ' + resposta`.
- Contexto de entrenamiento limitado a 1024 tokens; en entradas largas el modelo puede repetir hasta el límite nativo del contexto base, según las pruebas exploratorias de 2026-11-17.
- La evaluación con arnés de agentes/Bancada quedó `not_scored`: no valida tool use, JSON fiable, análisis financiero abierto ni respuestas largas.
- Idiomas: sin competencia bilingüe evaluada; instrucciones y QA principalmente en inglés con envoltorios en portugués.
- Licencia: adaptador Apache-2.0, pero los datasets de origen mantienen sus propios términos (FinQA MIT; FailureSensorIQ con discrepancia entre CC-BY-4.0 archivado y Apache-2.0 en el Hub actual, preservada como CC-BY en `LICENSE_AUDIT.md`).
- Riesgo de alucinación en cifras financieras: la model card recomienda verificar las salidas contra la evidencia antes de cualquier decisión financiera o industrial.
- La revisión exacta del modelo base usada en el entrenamiento histórico no se registró; la revisión del ejemplo de uso es una referencia de servicio posterior, no la de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/ViniciusJS/qwen2.5-7b-finqa-lora-a-1024
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- Paper FinQA: https://aclanthology.org/2021.emnlp-main.300/
- Repositorio FinQA: https://github.com/czyssrs/FinQA
- Paper FailureSensorIQ: https://arxiv.org/abs/2506.03278
- Repositorio FailureSensorIQ: https://github.com/IBM/FailureSensorIQ
- Informe Qwen2.5: https://arxiv.org/abs/2412.15115
