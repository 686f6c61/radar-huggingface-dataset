# WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_120_DoRA

## Resumen

Este repositorio contiene un adaptador de ajuste fino (PEFT) denominado `tydiqa_en_and_bengali_3000_percentage_1_120_DoRA`, publicado por el usuario WijewardhanaNT sobre el modelo base `meta-llama/Llama-3.1-8B`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador de tipo DoRA (Weight-Decomposed Low-Rank Adaptation) que debe cargarse junto al modelo base para poder utilizarse. El tamaño del repositorio es de aproximadamente 0,1 GB, coherente con pesos de adaptador de rango bajo y no con un modelo de 8.000 millones de parámetros.

El nombre del repositorio sugiere que el ajuste se realizó sobre el conjunto de datos TyDi QA en sus variantes de inglés y bengalí, con un volumen de 3.000 ejemplos y algún tipo de barrido de porcentajes (`percentage_1_120`), presumiblemente un experimento de ablación sobre la proporción de datos de entrenamiento. Sin embargo, la model card publicada es la plantilla vacía de Hugging Face: todos los apartados (descripción, datos de entrenamiento, hiperparámetros, evaluación, licencia) figuran como `[More Information Needed]`. Cualquier afirmación sobre el proceso de entrenamiento o su rendimiento sería una inferencia no verificada.

Su relevancia actual es limitada y de carácter experimental: acumula 7 descargas y 0 likes, carece de documentación, de evaluación publicada y de licencia declarada, y fue creado en septiembre de 2026 según los metadatos de Hugging Face. Resulta útil como artefacto reproducible de un experimento de DoRA sobre QA multilingüe, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (variante de LoRA que descompone el update en magnitud y direccion) sobre un transformer decoder-only (Llama 3.1 8B) |
| Parametros totales | no disponible (adaptador; el modelo base tiene ~8.030 millones de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens heredados del modelo base Llama 3.1 8B; no documentada en la model card |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; el adaptador puede fusionarse con el base y cuantizarse a 4 u 8 bits por cuenta del usuario) |
| Idiomas soportados | no declarados; el identificador del repositorio apunta a ingles y bengali (TyDi QA) |
| Licencia | no disponible (el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (pesos de adaptador en formato PEFT) |
| Libreria | peft (version declarada en la model card: PEFT 0.17.1) |
| Modelo base | meta-llama/Llama-3.1-8B |
| Tamano del repositorio | ~0,1 GB |
| Pipeline declarado | text-generation |
| Dataset de referencia | TyDi QA (ingles y bengali), segun el nombre del repositorio; no confirmado en la model card |
| Descargas / likes | 7 descargas, 0 likes |
| Fecha de creacion | 2026-09-22 |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base Llama 3.1 8B, un transformer decoder-only con atención por causalidad, normalización RMSNorm y activaciones SwiGLU, cuyo contexto nativo es de 128.000 tokens. Sobre ese modelo se aplica DoRA, una técnica de ajuste eficiente en parámetros que descompone el incremento de pesos en un componente de magnitud y otro de dirección, en lugar de la descomposición puramente aditiva de LoRA. El repositorio solo almacena los pesos del adaptador y sus ficheros de configuración de PEFT, por lo que el modelo base debe descargarse por separado.

No hay información verificable sobre el entrenamiento: la model card no especifica número de tokens, composición del dataset, hiperparámetros (rango, alpha, dropout, tasa de aprendizaje, precisión), uso de RLHF o DPO, ni si el ajuste se hizo con enmascaramiento de instrucciones. El identificador sugiere un subconjunto de 3.000 ejemplos de TyDi QA en inglés y bengalí y un barrido de porcentajes entre 1 y 120, pero se desconoce si se trata de un único adaptador o de un artefacto representativo de una serie de experimentos. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto y respuesta a preguntas extractivas en inglés y, presumiblemente, bengalí, dado el dataset de referencia indicado en el nombre del repositorio.
- Comprensión lectora sobre pasajes: el formato de TyDi QA es pregunta-respuesta con evidencia en un contexto, que es el escenario para el que se habría ajustado.
- Capacidades generales heredadas del modelo base Llama 3.1 8B: generación de texto, razonamiento básico, código y matemáticas elementales, en la medida en que el ajuste no las haya degradado (riesgo de olvido catastrófico no evaluado).
- Soporte de tool calling / function calling: no disponible en la información proporcionada; no se documenta ningún ajuste específico de plantillas de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay evaluación ni documentación al respecto.
- Capacidades multilingües: no declaradas formalmente; el identificador sugiere cobertura de inglés y bengalí, pero se desconoce el alcance real y el impacto sobre otros idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ventana de contexto larga (hasta 128.000 tokens) heredada del modelo base, no verificada tras el ajuste.

## Casos de uso

- Respuesta a preguntas extractivas sobre documentación en inglés: el adaptador puede integrarse en un pipeline de PEFT + transformers para responder preguntas cuyo contexto sea un pasaje o conjunto de pasajes, aprovechando su ajuste sobre TyDi QA.
- Procesamiento de formularios y textos administrativos en bengalí: extracción de respuestas concretas de documentos largos, un escenario con poca cobertura en modelos occidentales y donde el ajuste específico en bengalí puede aportar valor.
- Base para experimentos académicos de ajuste eficiente: sirve como punto de partida reproducible para comparar DoRA frente a LoRA en tareas de QA multilingüe, especialmente por su reducido tamaño (0,1 GB).
- Evaluación de olvido catastrófico: permite medir cuánto degrada un ajuste de 3.000 ejemplos las capacidades generales del modelo base, un caso de uso metodológico relevante en investigación.
- Prototipado rápido de asistentes de lectura documental: al cargarse sobre un modelo 8B cuantizado en 4 bits, puede desplegarse en una GPU de consumo para demos internas de QA sobre corpus propios.
- Construcción de sistemas RAG para inglés y bengalí: el adaptador puede emplearse como generador final en una arquitectura de recuperación más generación, con el contexto recuperado como entrada.
- Fine-tuning adicional (continual learning): el adaptador puede servir de inicialización para ajustes posteriores en dominios concretos, al mantener un coste de almacenamiento muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna sección de evaluación cumplimentada (métricas como F1 o Exact Match sobre TyDi QA, MMLU, GSM8K o HumanEval no aparecen) y los resultados de búsqueda web no contienen información relacionada con el modelo.

## Requisitos de hardware

- Inferencia del adaptador: requiere cargar el modelo base Llama 3.1 8B (~16 GB en fp16/bf16) más el adaptador (~0,1 GB). El adaptador por sí solo no es ejecutable.
- VRAM estimada: ~16-17 GB en fp16, ~9-10 GB en 8 bits y ~5-6 GB en 4 bits (estimaciones para el modelo base, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 para fp16; RTX 3090/4090 (24 GB) para 8 bits; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits en GPUs con 8 GB o más de VRAM; en fp16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers + peft (carga directa del adaptador); fusión del adaptador con el modelo base y servicio posterior mediante vLLM o TGI; conversión a GGUF y uso con llama.cpp u Ollama (requiere fusionar y convertir previamente; no se publican cuantizaciones oficiales).
- Latencia y throughput: no disponible; no hay mediciones publicadas.

## Comparativa con modelos similares

La comparación se limita a referencias verificables; no se dispone de métricas de rendimiento del adaptador frente a alternativas.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tydiqa_en_and_bengali_3000_percentage_1_120_DoRA | Adaptador DoRA sobre Llama 3.1 8B | no disponible (base: ~8.030 M) | 128.000 tokens (heredado) | no disponible | Hugging Face, 7 descargas |
| meta-llama/Llama-3.1-8B | Modelo base, transformer decoder-only | ~8.030 M | 128.000 tokens | Llama 3.1 Community License | Ampliamente disponible |
| Adaptadores LoRA/DoRA comunitarios sobre Llama 3.1 8B | Adaptadores PEFT | Variable segun rango y modulos | 128.000 tokens | Variable (a menudo no declarada) | Hugging Face |
| Modelos especificos de QA multilingue (por ejemplo, variantes de mT5 o XLM-R ajustadas en TyDi QA) | Encoder o encoder-decoder | 0,3-13 B | 512-8.192 tokens | Variable (MIT, Apache-2.0 o similar) | Hugging Face |

No se dispone de resultados comparativos de F1 o Exact Match sobre TyDi QA para este adaptador, por lo que la comparativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Model card vacía: la práctica totalidad de los apartados figuran como `[More Information Needed]`, incluidos licencia, idiomas, datos de entrenamiento y evaluación. No es posible verificar nada de lo aquí inferido a partir del identificador.
- Licencia no declarada: el uso comercial queda en un limbo legal. Aunque el modelo base se rige por la Llama 3.1 Community License, la ausencia de licencia explícita en el repositorio del adaptador impide determinar las condiciones aplicables a los pesos derivados.
- Riesgo elevado de sesgos y alucinaciones: no se ha realizado ninguna evaluación de sesgo, toxicidad o fidelidad factual. El ajuste sobre 3.000 ejemplos de QA extraído puede aumentar la tendencia a responder con fragmentos inventados cuando la respuesta no está en el contexto.
- Olvido catastrófico probable: un ajuste de bajo rango sobre un subconjunto pequeño y especializado puede degradar las capacidades generales del modelo base en generación libre, código o matemáticas. No hay ningún dato que cuantifique este efecto.
- Cobertura de idiomas reducida y desigual: la especialización aparente en inglés y bengalí puede reducir el rendimiento en el resto de idiomas soportados por Llama 3.1, incluido el castellano.
- Trazabilidad nula del entrenamiento: se desconocen los hiperparámetros, el rango del adaptador, los módulos afectados y si el dataset se filtró o deduplicó. Esto hace inviable reproducir el ajuste.
- Advertencia de producción: el repositorio es un artefacto experimental con 7 descargas y 0 likes, sin mantenimiento documentado. No debería desplegarse en entornos productivos sin una evaluación propia previa sobre datos representativos del dominio objetivo.
- Dependencia del modelo base: el adaptador no funciona de forma autónoma y hereda todas las limitaciones, sesgos y restricciones de uso de Llama 3.1 8B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_bengali_3000_percentage_1_120_DoRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://huggingface.co/docs/peft
- Referencia del tag `arxiv:1910.09700` presente en el repositorio (Lacoste et al., 2019, calculadora de impacto): https://arxiv.org/abs/1910.09700
- Los resultados de la busqueda web no aportan enlaces relacionados con el modelo; el resto de enlaces (paper de DoRA, repositorio de codigo, demo o dataset) no estan disponibles en la informacion proporcionada.
