# tapiocaTakeshi/Qubit-7B-ja-training

## Resumen

Qubit 7B 日本語学習 es un ajuste en japonés del modelo Qubit 7B de tapiocaTakeshi, construido sobre la arquitectura NeuroQuantum (QBNN) con 7.046.668.352 parámetros (~7,05 B). El propio autor describe el repositorio como un espacio de trabajo no público: la model card lleva el subtítulo "作業用・非公開" (de trabajo, no público) y aclara que el código de preprocesado y entrenamiento sí es público, pero los datos, el tokenizer y los checkpoints residen en un bucket privado (`hf://buckets/tapiocaTakeshi/qubit-7b-ckpt`). El repositorio no expone pesos descargables directamente ni licencia.

El objetivo del proyecto es adaptar el modelo base Qubit 7B al japonés mediante un pipeline de dos etapas ejecutado en 4 GPU A100: un preentrenamiento continuado de tipo CLM sobre FineWeb2-edu-ja (1.600 pasos, ~210 millones de tokens) y un ajuste supervisado posterior sobre mezclas de instrucciones en japonés (shisa-v2, dolly-ja, wizardlm8x22b-ja y alpaca_jp_math; 2.030 pasos, ~270 millones de tokens). El modelo base original no se ha modificado.

Su relevancia es limitada y muy específica: se trata de un experimento reproducible de ajuste lingüístico sobre una arquitectura propia, con código abierto pero sin pesos publicados, sin métricas de evaluación y sin modelo card de usuario final. Resulta de interés para quien quiera estudiar el pipeline de adaptación al japonés o reutilizar la receta de entrenamiento, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeuroQuantum (QBNN), heredada del modelo base `tapiocaTakeshi/Qubit` (rama `7b/`); el autor indica que no se ha modificado, pero no detalla los componentes internos |
| Parametros totales | 7.046.668.352 (~7,05 B) |
| Longitud de contexto | no disponible (el entrenamiento CLM empleó 131.072 tokens por paso, sin aclarar si corresponde a la longitud de secuencia) |
| Tipos de cuantizacion | no disponible; los pesos guardados están en bf16 |
| Idiomas soportados | japonés (idioma objetivo del ajuste); no declarado en los metadatos del repositorio |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) junto con `config.json`, tokenizer y `modeling_qubit_7b.py` |
| Tokenizer | SentencePiece propio de 32.000 tokens (`qubit7b_ja_spm32k.model`) |
| Plantilla de conversacion | `<s><\|user\|>\n…<\|end\|>\n<\|assistant\|>\n…<\|end\|></s>` |
| Fecha de creacion / actualizacion | 2026-10-10 / 2026-10-10 (según el repositorio) |
| Disponibilidad de pesos | el repositorio público contiene el código; datos, tokenizer y checkpoints están en el bucket privado `hf://buckets/tapiocaTakeshi/qubit-7b-ckpt` |

## Arquitectura y entrenamiento

La arquitectura es NeuroQuantum (QBNN), la misma del modelo base Qubit 7B, con aproximadamente 7,05 mil millones de parámetros. El autor no describe en la model card los componentes internos (tipo de atención, normalización, uso o no de mezcla de expertos), por lo que no es posible confirmar si se trata de un transformer convencional ni si incorpora mecanismos híbridos. Sí se documenta un detalle de implementación relevante: por restricciones de FSDP, el parámetro `lambda_base` se mantiene con forma `[1]` durante el entrenamiento y se convierte de nuevo en escalar al guardar, de modo que la arquitectura final no cambia.

El entrenamiento (run_v1, sobre 4 GPU A100) consta de dos etapas. La primera es un preentrenamiento continuado de modelado de lenguaje causal sobre FineWeb2-edu-ja en modo streaming, con filtrado de duplicados, textos cortos, contenido no japonés y repeticiones: 1.600 pasos de 131.072 tokens (~210 millones de tokens) con learning rate 3e-4 y scheduler coseno. La segunda es un SFT con pérdida calculada únicamente sobre la respuesta del asistente, usando shisa-v2, dolly-ja, wizardlm8x22b-ja (para código, lógica y matemáticas) y alpaca_jp_math (verificado mediante ejecución de Python): 2.030 pasos (~270 millones de tokens) con learning rate 1e-4. No se menciona RLHF, DPO ni decodificación especulativa. El volumen total de tokens de adaptación (~480 millones) es muy reducido para un modelo de 7 B, lo que limita el alcance del ajuste.

## Capacidades

- Generación de texto en japonés tras preentrenamiento continuado sobre FineWeb2-edu-ja.
- Seguimiento de instrucciones en japonés, gracias al SFT sobre shisa-v2, dolly-ja, wizardlm8x22b-ja y alpaca_jp_math.
- Conversación multiturno mediante la plantilla `<|user|>…<|end|>` / `<|assistant|>…<|end|>`.
- Tareas de código, lógica y matemáticas en japonés, según la composición declarada del dataset de SFT (wizardlm8x22b-ja, alpaca_jp_math).
- Capacidad de continuar el entrenamiento desde checkpoints: los shards de FSDP, el optimizador, el scheduler y la posición en los datos se conservan por paso.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking), visión, audio ni ninguna otra modalidad distinta del texto.
- No se documenta soporte multilingüe más allá del japonés, ni el grado de conservación del inglés u otros idiomas del modelo base.

## Casos de uso

- Estudio y reproducción de pipelines de adaptación al japonés: el repositorio incluye `code/prep_data.py` y `code/train_qubit7b.py`, y la model card detalla etapas, pasos, learning rates y composición de datos, lo que permite replicar la receta en 4 GPU A100.
- Investigación sobre ajuste con presupuesto reducido: sirve como referencia de qué se obtiene con ~210 millones de tokens de preentrenamiento continuado y ~270 millones de tokens de SFT en un modelo de 7 B.
- Generación de texto y resumen de documentos en japonés en entornos internos, siempre que se asuma la ausencia de benchmarks y de evaluación cualitativa publicada.
- Prototipos de asistente conversacional en japonés: la plantilla de chat y el SFT sobre datos de instrucciones permiten montar diálogos multiturno, aunque las restricciones de licencia y la falta de pesos públicos obligan a desplegarlo únicamente en el bucket privado del autor.
- Tareas de asistencia a código en japonés a partir del subconjunto wizardlm8x22b-ja, útil para experimentación con explicaciones y fragmentos de código comentados en japonés, no para sustituir a un modelo evaluado en HumanEval o SWE-bench.
- Ejercicios y explicaciones matemáticas en japonés: el dataset alpaca_jp_math fue verificado ejecutando Python, lo que aporta cierta garantía sobre la corrección de las soluciones de entrenamiento, no sobre la del modelo final.
- Anotación y generación de datos sintéticos en japonés como paso previo al entrenamiento de otros modelos, dado el tokenizer SentencePiece de 32.000 tokens ya preparado para este dominio.
- Experimentación con arquitecturas no convencionales: al requerir `modeling_qubit_7b.py` con `trust_remote_code`, el modelo es útil para estudiar el comportamiento de la familia NeuroQuantum/QBNN más que como componente estándar de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación del modelo ajustado (ni MMLU, ni JGLUE, ni HumanEval, ni GSM8K), y el bucket privado contiene un `metrics.jsonl` con las métricas de entrenamiento (pérdida y similares), no resultados de evaluación de tareas. Los únicos datos numéricos publicados son de cómputo de entrenamiento: 1.600 pasos × 131.072 tokens (~2,1 × 10^8 tokens) en la etapa 1 y 2.030 pasos (~2,7 × 10^8 tokens) en la etapa 2.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 14,1 GB solo para pesos (2 bytes × 7,05 B parámetros), más memoria para caché KV y activaciones; cómodo en GPU de 24 GB.
- VRAM estimada en int8: aproximadamente 7,1 GB de pesos, más sobrecarga de inferencia.
- VRAM estimada en int4: en torno a 3,5-4 GB de pesos; estas cifras son estimaciones derivadas del recuento de parámetros, ya que el autor no publica cuantizaciones ni requisitos.
- GPU de entrenamiento documentadas: 4 × NVIDIA A100 (la model card indica `a100x4`); reanudar el entrenamiento exige el mismo número de GPU (4) con la opción `--resume`.
- GPU consumer: por tamaño, un modelo de 7 B en bf16 cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) si se dispone de pesos; no hay confirmación de que el código de la arquitectura funcione en estas tarjetas.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, TGI, Ollama, llama.cpp o LM Studio. El ejemplo de carga oficial usa PyTorch, `safetensors.load_file` y el módulo propio `modeling_qubit_7b.py`, lo que en la práctica implica cargar con `trust_remote_code` o código local.
- Formatos de despliegue: únicamente safetensors en bf16 con `config.json`, tokenizer y código de modelado; no se ofrece GGUF ni variantes cuantizadas.
- Latencia y throughput: no disponible, no se publican medidas de velocidad de inferencia.

## Comparativa con modelos similares

No hay datos de benchmarks del modelo que permitan una comparación de rendimiento. La tabla recoge únicamente características estructurales de alternativas de tamaño similar, tomadas del conocimiento general de cada modelo y no de la información proporcionada, por lo que conviene verificarlas antes de usarlas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|
| Qubit 7B 日本語学習 | 7,05 B | no disponible | no disponible | solo en bucket privado del autor |
| Llama 3.1 8B | ~8,03 B | 128.000 tokens | Llama 3.1 Community License | pública en HuggingFace |
| Qwen2.5 7B | ~7,6 B | 128.000 tokens | Apache 2.0 | pública en HuggingFace |
| Adaptaciones al japonés sobre Llama (por ejemplo, Swallow o Sarashina) | ~7-8 B | variable según versión | heredada de Llama o propia | pública en HuggingFace |

La diferencia principal no es de capacidades sino de madurez: los modelos alternativos publican pesos, licencia, tokenizer estándar y resultados de evaluación, mientras que Qubit 7B 日本語学習 no ofrece ninguno de esos elementos de forma abierta.

## Limitaciones y advertencias

- Pesos no accesibles: el repositorio público contiene el código, pero datos, tokenizer y checkpoints viven en un bucket privado, de modo que el modelo no se puede descargar ni evaluar sin acceso concedido por el autor.
- Licencia no declarada: sin licencia explícita no hay autorización clara de uso comercial, redistribución ni modificación; en la práctica debe tratarse como no apto para producción.
- Ausencia total de evaluación: no hay benchmarks, ni comparaciones, ni evaluación humana publicada; no es posible afirmar su calidad en ninguna tarea.
- Arquitectura no estándar: depende de `modeling_qubit_7b.py` y de `NeuroQuantumConfig`; no es compatible de forma directa con ecosistemas habituales como llama.cpp, Ollama o vLLM.
- Presupuesto de entrenamiento reducido: ~480 millones de tokens en total para un modelo de 7 B, muy por debajo de lo habitual en ajustes lingüísticos serios, lo que hace probable un olvido parcial de conocimiento del modelo base y una alineación superficial.
- Riesgo de alucinación: no cuantificado en la información disponible; al no haber evaluación, debe asumirse el riesgo habitual de un modelo generativo sin alineación documentada, agravado por el SFT limitado.
- Sesgos: no se documenta ningún análisis de sesgo, toxicidad o seguridad; la composición de datos (FineWeb2-edu-ja, shisa-v2, dolly-ja) no se caracteriza en la model card.
- Cobertura lingüística dudosa fuera del japonés: se ignora si el modelo conserva el inglés u otros idiomas del modelo base, y no hay declaración oficial de idiomas en los metadatos.
- Contexto no confirmado: aunque el preentrenamiento usó 131.072 tokens por paso, no se especifica la longitud de secuencia real ni la ventana de contexto efectiva en inferencia.
- Carácter de trabajo en curso: el propio autor etiqueta el repositorio como "de trabajo" y no público, con 0 descargas y 0 likes, y advierte que el modelo original no se ha modificado.
- Reproducibilidad condicionada: reanudar el entrenamiento requiere exactamente 4 GPU, y los datos de preprocesado no son públicos, lo que impide reproducir el pipeline completo desde cero.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tapiocaTakeshi/Qubit-7B-ja-training
- Modelo base: https://huggingface.co/tapiocaTakeshi/Qubit (rama `7b/`, arquitectura NeuroQuantum / QBNN)
- Bucket de datos y checkpoints (privado, requiere acceso): `hf://buckets/tapiocaTakeshi/qubit-7b-ckpt`
- Código incluido en el repositorio: `code/prep_data.py` y `code/train_qubit7b.py`
- Paper, blog o demo oficiales: no disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; las únicas entradas devueltas son páginas sin relación con el proyecto.
