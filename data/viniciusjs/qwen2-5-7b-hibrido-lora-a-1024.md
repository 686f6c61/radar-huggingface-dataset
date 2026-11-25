# ViniciusJS/qwen2.5-7b-hibrido-lora-a-1024

## Resumen

El modelo `ViniciusJS/qwen2.5-7b-hibrido-lora-a-1024` es un adaptador LoRA de investigación entrenado sobre `Qwen/Qwen2.5-7B-Instruct` para respuesta a preguntas en dos dominios concretos: finanzas (FinQA) e industria (FailureSensorIQ). Lo publica el autor ViniciusJS dentro del proyecto Pesquisa_IC_IA y no constituye un modelo independiente: los pesos del repositorio son únicamente el delta LoRA (80.792.096 bytes), y requieren descargar por separado el modelo base Qwen2.5-7B-Instruct para funcionar.

La relevancia del artefacto es de reproducibilidad más que de rendimiento: documenta con detalle el proceso de entrenamiento (QLoRA NF4 4-bit, rango 8, alpha 16, tres épocas, 1.086 pasos registrados), las particiones de datos (11.560/1.444/1.448) y los resultados históricos locales, incluyendo un `provenance.json` con hashes de las fuentes. La model card es explícita al señalar que las métricas no han sido reproducidas de forma independiente y que no validan uso de herramientas, JSON fiable ni análisis financiero abierto.

Se trata, por tanto, de un adaptador de nicho, con ventana de entrenamiento de 1.024 tokens de entrada (límite del entrenamiento, no de la arquitectura base), licencia Apache-2.0 y soporte declarado de inglés y portugués, aunque el propio autor advierte que los metadatos no certifican competencia bilingüe evaluada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer Qwen2.5-7B-Instruct |
| Parámetros totales | Adaptador: 80.792.096 bytes de pesos; base: 7B (Qwen2.5-7B-Instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Entrenamiento limitado a 1.024 tokens de entrada; contexto nativo del base no declarado en la información disponible |
| Tipos de cuantización | Entrenado con QLoRA NF4 4-bit, doble cuantización, cómputo FP16; carga en 4-bit soportada vía bitsandbytes |
| Idiomas soportados | en, pt (según metadatos; competencia bilingüe no evaluada) |
| Licencia | Apache-2.0 (adaptador y material de release) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango LoRA / alpha | 8 / 16, dropout 0.1 |
| Módulos objetivo | q, k, v, o, gate, up, down |
| Librería | peft |
| Modelo base | Qwen/Qwen2.5-7B-Instruct (revisión exacta de entrenamiento no registrada) |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen2.5 (7B, instruct), pero no modifica la arquitectura del base: añade matrices de bajo rango en las proyecciones de atención (q/k/v/o) y en las proyecciones del bloque MLP (gate/up/down). El entrenamiento usó QLoRA con cuantización NF4 de 4 bits, doble cuantización y cómputo en FP16, con rango 8, alpha 16, dropout 0.1, semilla 42, tres épocas, learning rate 0,0002, microbatch 4 y acumulación de gradiente 8, hasta 1.086 pasos registrados. La selección de checkpoint se hizo por pérdida de validación.

Los datos proceden de FinQA y FailureSensorIQ, convertidos a ejemplos estilo *completion* y divididos localmente en 11.560/1.444/1.448 (train/validación/test). Un detalle técnico importante: el entrenamiento concatenó `prompt + ' ' + resposta` sin aplicar plantilla de chat, sin añadir EOS explícito y sin restringir la pérdida a los tokens de respuesta. Esto condiciona el formato de inferencia esperado (completion, no chat) y explica parte de los fallos observados en pruebas posteriores con preguntas directas de chat. La revisión exacta del modelo base empleada en el entrenamiento histórico no quedó registrada.

## Capacidades

- Generación de texto en formato *completion* sobre pares pregunta-respuesta de dominio financiero e industrial.
- Respuesta numérica a preguntas de FinQA (métrica de coincidencia numérica con tolerancia 0,001).
- Clasificación multietiqueta de fallos en sensores industriales (FailureSensorIQ), con exactitud de conjunto de etiquetas y F1 macro por etiqueta.
- Soporte declarado de inglés y portugués en los metadatos, con envoltorios en portugués en las instrucciones; no hay evaluación de competencia bilingüe.
- No hay evidencia publicada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.
- La evaluación posterior con arnés de agentes/Bancada quedó marcada como `not_scored`; los números históricos no validan uso de herramientas ni JSON fiable.

## Casos de uso

- Reproducción de experimentos de QLoRA: el repositorio incluye `provenance.json`, `training_config.json`, `historical_metrics.json` y `checksums.sha256`, lo que permite replicar el pipeline de ajuste fino con QLoRA sobre Qwen2.5-7B-Instruct en un entorno controlado.
- Investigación comparativa de adaptadores híbridos: sirve como batería A en estudios A/B sobre mezcla de dominios (finanzas + industria), siempre que se controlen las diferencias de batch y learning rate que el autor señala como confundidores.
- Extracción de respuestas numéricas en tablas financieras: para preguntas de FinQA con contexto corto (≤1.024 tokens) y generación limitada a 24 tokens, en modo completion y con verificación posterior contra la evidencia.
- Clasificación de fallos en sensores industriales: el adaptador alcanzó 0,9277 de F1 macro por etiqueta en la recomputación multietiqueta v2 sobre 831 muestras, lo que lo hace útil como punto de partida para etiquetado asistido, no como clasificador de producción sin validación adicional.
- Docencia y formación en ajuste fino eficiente: el repositorio documenta íntegramente hiperparámetros, formato de datos y limitaciones, lo que lo convierte en material didáctico para enseñar QLoRA con PEFT y bitsandbytes.
- Auditoría de licencias de datasets: `LICENSE_AUDIT.md` documenta la discrepancia entre la licencia archivada de FailureSensorIQ (CC-BY-4.0) y la declarada en su card actual (Apache-2.0), útil como caso práctico de compliance en investigación.

## Benchmarks y rendimiento

| Evaluación | Resultado reportado | Muestras |
|---|---:|---:|
| FinQA, exactitud numérica (agregado original) | 0,1061 | 617 |
| FailureSensorIQ, exactitud exacta del conjunto de etiquetas (multilabel v2) | 0,8039 | 831 |
| FailureSensorIQ, F1 macro por etiqueta (multilabel v2) | 0,9277 | 831 |

Estos resultados son históricos y locales; no han sido reproducidos de forma independiente para esta release. La generación se limitó a 24 tokens nuevos, 1.024 tokens de entrada y decodificación greedy. Las comparaciones A/B están confundidas por cambios de batch y, en el caso de Failure/híbrido, por learning rates distintos. No se publican predicciones crudas, respuestas gold ni filas de dataset.

## Requisitos de hardware

- El adaptador pesa unos 80,8 MB; el requisito real lo marca el modelo base Qwen2.5-7B-Instruct.
- VRAM estimada para el base en FP16: aproximadamente 15-16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para inferencia cómoda.
- VRAM estimada en 4-bit (NF4, como en el entrenamiento): en torno a 5-6 GB para pesos, con 8-10 GB recomendables en total.
- GPU recomendadas: A100 40/80 GB o H100 para servir en FP16 con concurrencia; RTX 4090 (24 GB) para FP16 en single-stream; RTX 3090/4080 (16-24 GB) o GPUs de 8-12 GB en 4-bit.
- Cabe en GPU de consumo: sí, en 4-bit cabe en tarjetas de 8 GB con margen ajustado; en FP16 requiere 24 GB o más.
- Opciones de despliegue: el repositorio proporciona `usage.py` con `transformers>=4.57.6`, `peft>=0.19.1`, `accelerate`, `safetensors` y `bitsandbytes`; el autor documenta en `USAGE.md` carga en precisión completa y en CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-7b-hibrido-lora-a-1024 (este) | Adaptador LoRA sobre 7B | 1.024 tokens de entrenamiento | FinQA + FailureSensorIQ | Apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen2.5-7B-Instruct (base) | 7B | Contexto nativo del base (no detallado aquí) | Instrucciones generales | Apache-2.0 | Hugging Face, ampliamente desplegado |
| Adaptadores LoRA de dominio público comparables | Variable | Variable | Variable | Variable | No disponible: no se han identificado alternativas equivalentes en la información proporcionada |

No se dispone de datos de benchmarks comparativos frente a otros adaptadores de la misma categoría en la información facilitada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar Qwen2.5-7B-Instruct por separado; el repositorio solo contiene el delta LoRA.
- La revisión exacta del modelo base usada en el entrenamiento no se registró; la revisión del ejemplo de uso es una referencia de servicio posterior, no la de entrenamiento.
- Entrenado sin plantilla de chat, sin EOS explícito y sin enmascarar la pérdida a los tokens de respuesta; el formato esperado es completion, y las pruebas posteriores de chat mostraron terminaciones prematuras o respuestas hasta el límite de contexto.
- En las pruebas híbridas A/B del 17-11-2026 fallaron los contratos de selección de fuente; la respuesta de la batería B con evidencia fija contenía afirmaciones no respaldadas. Son observaciones exploratorias, no un benchmark.
- La evaluación con arnés de agentes/Bancada quedó `not_scored`: no hay validación de uso de herramientas, JSON fiable, análisis financiero abierto ni respuestas largas.
- FinQA con exactitud numérica de 0,1061 es un resultado bajo; no debe interpretarse como capacidad financiera general.
- Riesgo de alucinación relevante en dominio financiero e industrial: el autor recomienda verificar las salidas contra la evidencia antes de cualquier decisión.
- Sesgos no evaluados: no se han publicado análisis de sesgo demográfico, geográfico o lingüístico.
- Competencia bilingüe no evaluada pese a declarar en/pt; las instrucciones y el QA fuente son mayoritariamente en inglés con envoltorios en portugués.
- Licencias de datos: FinQA es MIT; FailureSensorIQ archivado es CC-BY-4.0 aunque su card actual declare Apache-2.0; se preserva la atribución CC-BY. Los datasets no se redistribuyen ni se relicencian.
- Verificar todos los ficheros contra `checksums.sha256` antes de su uso; el SHA-256 de los pesos es `bada36090f4ea5e5375d49c403262b1af878e864b154503d6d1dab4c6111fce0`.
- Uso comercial: el adaptador es Apache-2.0, pero las condiciones de los datasets de origen deben respetarse por separado.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ViniciusJS/qwen2.5-7b-hibrido-lora-a-1024
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Proyecto Pesquisa_IC_IA: https://github.com/viniciusjsdev/Pesquisa_IC_IA
- FinQA (código): https://github.com/czyssrs/FinQA
- Artículo FinQA (EMNLP 2021): https://aclanthology.org/2021.emnlp-main.300/
- FailureSensorIQ (IBM Research): https://github.com/IBM/FailureSensorIQ
- Artículo FailureSensorIQ (arXiv 2506.03278): https://arxiv.org/abs/2506.03278
- Informe Qwen2.5 (arXiv 2412.15115): https://arxiv.org/abs/2412.15115
