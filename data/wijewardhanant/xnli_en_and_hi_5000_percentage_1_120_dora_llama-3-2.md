# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_llama-3.2

## Resumen

WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_llama-3.2 es un adaptador de pesos (no un modelo completo) publicado con la librería PEFT sobre el modelo base meta-llama/Llama-3.2-3B. Por el identificador se deduce que se entrenó sobre el corpus XNLI en inglés e hindi con 5000 ejemplos y mediante DoRA (Weight-Decomposed Low-Rank Adaptation), una variante de LoRA que descompone el peso en magnitud y dirección. El repositorio ocupa 0,4 GB, lo que es coherente con un conjunto de matrices de adaptación de rango relativamente alto y no con un ajuste completo.

El problema que aborda es el de la inferencia de relación textual (NLI, natural language inference) sobre pares de frases: determinar si una hipótesis se deduce de una premisa (entailment), la contradice (contradiction) o es neutral. Es relevante porque permite obtener un clasificador NLI ligero y bilingüe inglés-hindi sin reentrenar el modelo base completo, reutilizando la ventana de contexto de 128 000 tokens de Llama 3.2 y manteniendo un coste de almacenamiento de cientos de megabytes.

La ficha del autor está prácticamente vacía: no declara licencia, idiomas, hiperparámetros de entrenamiento, datos de evaluación ni uso previsto, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta. Cualquier dato que no figure explícitamente se marca como "no disponible" en esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA/DoRA (PEFT) sobre un transformer decoder-only denso con GQA y RoPE (modelo base Llama-3.2-3B) |
| Parametros totales | Modelo base: 3,21 mil millones. Adaptador: no disponible (el repo pesa 0,4 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base; el adaptador no documenta contexto propio |
| Tipos de cuantizacion | No se publican cuantizaciones del adaptador. El modelo base admite cuantización en 8 y 4 bits (bitsandbytes, GPTQ, AWQ) y formatos GGUF de la comunidad |
| Idiomas soportados | Por el identificador del repositorio, inglés e hindi (XNLI en/hi); no declarados en la model card |
| Licencia | No disponible en el repositorio. El modelo base se distribuye bajo la Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT), aproximadamente 0,4 GB |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango, no un modelo autónomo. La técnica indicada en el nombre es DoRA, que descompone cada matriz de pesos preentrenada en un componente de magnitud y otro de dirección y aplica el entrenamiento de bajo rango sobre la dirección, lo que en la literatura suele acercar el comportamiento al de un ajuste fino completo con menos parámetros entrenables. El modelo base, Llama 3.2 3B, es un transformer decoder-only de 28 capas, dimensión oculta 3072, 24 cabezas de atención, 8 cabezas de clave/valor (GQA), 8192 de dimensión intermedia, vocabulario de 128 256 tokens y RoPE con theta 500 000.

No hay información sobre el rango (rank), alpha, dropout, módulos objetivo, precisión de entrenamiento, número de épocas, tasa de aprendizaje ni si se aplicó RLHF, DPO o ajuste supervisado. El dataset parece ser XNLI, un corpus de inferencia textual derivado de MultiNLI y traducido profesionalmente a 15 idiomas, con 5000 ejemplos en inglés e hindi según el identificador; no se documenta la composición exacta, el particionado ni si hubo validación. La fecha de creación del repositorio es 2026-09-21, un valor anómalo que conviene verificar.

## Capacidades

- Inferencia de relación textual (NLI) en inglés e hindi: entailment, neutral y contradiction, que es la tarea declarada implícitamente por el identificador del repositorio.
- Generación de texto: el pipeline declarado es text-generation, heredado del modelo base Llama-3.2-3B, aunque el adaptador está orientado a una tarea de clasificación.
- Capacidad multilingüe limitada al par inglés-hindi según el identificador; no se documenta ningún otro idioma.
- Conserva las capacidades generales del modelo base (comprensión lectora, resumen, generación condicionada) en la medida en que el DoRA no las haya degradado, algo que no se ha evaluado.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión, audio o modo "thinking": no disponibles.
- Compatibilidad con el ecosistema PEFT: el adaptador se puede cargar con `PeftModel.from_pretrained`, combinar con otros adaptadores o fusionar en los pesos base.

## Casos de uso

- Clasificación NLI en producción para inglés e hindi: dado un par (premisa, hipótesis) se obtiene una de las tres etiquetas, útil como servicio de inferencia textual dentro de un pipeline mayor con un coste de almacenamiento de 0,4 GB adicionales al modelo base.
- Verificación de hechos y detección de contradicciones: comparar una afirmación con fragmentos de evidencia recuperados y marcar contradicciones antes de que lleguen al usuario.
- Control de fidelidad en sistemas RAG: comprobar si el contexto recuperado implica la respuesta generada por otro modelo, usando entailment como métrica automática de grounding.
- Curación de corpus bilingües: filtrar pares de frases contradictorias o redundantes en conjuntos de datos en inglés e hindi antes de entrenar otros modelos.
- Evaluación automática de resúmenes: emplear la relación de entailment entre resumen y documento como medida de cobertura y consistencia, en lugar de métricas puramente léxicas.
- Control de calidad de traducción inglés-hindi: usar NLI cruzado para detectar desviaciones semánticas entre original y traducción.
- Anotación asistida de datasets: preetiquetar pares de frases para que anotadores humanos revisen, reduciendo el coste de creación de corpus NLI en hindi.
- Investigación sobre DoRA y ajuste eficiente: el adaptador sirve como punto de comparación reproducible frente a LoRA estándar y ajuste completo en una tarea de clasificación bilingüe.
- Experimentos de transferencia interlingüística: evaluar hasta qué punto un adaptador entrenado con datos en inglés e hindi generaliza entre ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, exactitud de validación sobre XNLI, comparaciones con otras configuraciones de rango ni evaluaciones de olvido catastrófico sobre tareas generales.

## Requisitos de hardware

- El adaptador en sí ocupa aproximadamente 0,4 GB en disco y en memoria al cargarse como capa adicional.
- Modelo base en fp16/bf16: en torno a 6,4 GB de VRAM solo para pesos, más caché KV y activaciones.
- Modelo base en cuantización de 4 bits: en torno a 2-2,5 GB de VRAM, lo que permite ejecución en GPU de consumo con 8 GB.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores en fp16; en tarjetas de 8 GB es recomendable cuantización de 4 bits.
- GPU de datacenter: A100, H100 o L40S para servir lotes grandes con vLLM o TGI, donde el límite real es la memoria de la caché KV con contextos largos.
- Despliegue: transformers junto con PEFT es la vía directa; vLLM y TGI permiten cargar adaptadores LoRA sobre el modelo base; llama.cpp y Ollama requieren fusionar previamente el adaptador en los pesos y exportar a GGUF, operación que puede necesitar conversión manual por tratarse de DoRA.
- Latencia y throughput: no disponibles. No hay cifras de tokens por segundo ni de tiempo de clasificación por par de frases.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento NLI | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (DoRA sobre Llama-3.2-3B) | Adaptador de ~0,4 GB sobre 3,21 mil millones | 128 000 tokens (heredado del base) | No disponible | No disponible | Repositorio público con 0 descargas |
| meta-llama/Llama-3.2-3B (base, sin adaptar) | 3,21 mil millones | 128 000 tokens | Llama 3.2 Community License | No disponible para XNLI | Ampliamente disponible |
| Adaptadores XNLI equivalentes de la comunidad | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas documentadas en la información proporcionada |
| Qwen2.5-3B | 3,09 mil millones | 32 768 tokens nativos, extensible con YaRN | Apache 2.0 | No disponible para XNLI | Ampliamente disponible |

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay licencia, idiomas, datos de entrenamiento, hiperparámetros ni evaluación. El usuario asume todo el riesgo de validación.
- La licencia del artefacto no está declarada. Al derivar de Llama-3.2-3B, hereda las condiciones de la Llama 3.2 Community License, que impone requisitos de atribución, obligaciones de nomenclatura para productos derivados y restricciones de uso si se superan los 700 millones de usuarios mensuales.
- No hay métricas de exactitud en XNLI, por lo que no puede afirmarse que el adaptador supere a un clasificador trivial o al modelo base sin ajustar.
- Riesgo de olvido catastrófico: al ser un ajuste específico de tarea, las capacidades generativas generales pueden haberse degradado, algo que no se ha medido.
- Riesgo de alucinación inherente al modelo base, agravado si se usa en formato generativo en lugar de clasificación cerrada.
- Cobertura idiomática limitada a inglés e hindi según el identificador. No hay evaluación en otros idiomas ni información sobre code-switching hindi-inglés.
- Sesgos: no se ha realizado ningún análisis de sesgo. Llama 3.2 hereda los sesgos de sus datos de preentrenamiento, y XNLI contiene sesgos de género y de dominio procedentes de MultiNLI.
- El rango y la configuración del entrenamiento son desconocidos; no puede reproducirse el ajuste ni auditarse el proceso.
- La fecha de creación registrada (2026-09-21) es posterior a la fecha de actualización lógica del ecosistema y resulta sospechosa; conviene verificar la integridad del repositorio.
- Cero descargas y cero valoraciones: no hay evidencia de uso en producción ni de validación por terceros.
- La fusión de adaptadores DoRA en los pesos base requiere pasos adicionales frente a LoRA estándar; algunas herramientas de conversión a GGUF pueden no soportarla directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_120_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en las etiquetas y en la model card (Lacoste et al., 2019, calculadora de impacto de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning mencionada en la model card: https://mlco2.github.io/impact
- La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (solo páginas de un test de velocidad de red), por lo que no hay papers, blogs ni demos adicionales que enlazar.
