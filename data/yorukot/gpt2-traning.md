# yorukot/gpt2-traning

## Resumen

`yorukot/gpt2-traning` es un modelo de lenguaje causal basado en la arquitectura GPT-2 estándar, entrenado desde cero (sin pesos preentrenados) sobre el corpus inglés C4. Lo desarrolla el usuario yorukot en el contexto de un laboratorio académico (identificado como "Lab 4, AD") y se publica como un experimento educativo de entrenamiento de un transformer pequeño a escala de 124 millones de parámetros. El checkpoint `lab4-yoru-AD-488712` corresponde a la ejecución con menor pérdida de validación local del autor.

El modelo emplea la implementación estándar `GPT2LMHeadModel` de Hugging Face: 12 capas, 12 cabezas de atención, anchura oculta de 768, contexto de 1.024 tokens y vocabulario de 50.257 entradas con embeddings de entrada y salida atados. Los 124.439.808 parámetros se guardan en FP32. No incorpora innovaciones arquitectónicas propias; la particularidad técnica está en el proceso de entrenamiento (empaquetado best-fit de documentos, atención restringida por documento con varlen flash attention y deduplicación exacta).

Su relevancia es limitada fuera del ámbito docente: no está ajustado a instrucciones, solo cubre inglés y su ventana de contexto es corta. Resulta útil como referencia reproducible de un pipeline de entrenamiento completo (tokenización, empaquetado, schedule, evaluación por perplejidad) y como modelo base de bajo coste para tareas de continuación de texto o experimentos de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2 estándar, `GPT2LMHeadModel`) |
| Parametros totales | 124.439.808 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos publicados en FP32; admite cuantización estándar vía herramientas externas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP32) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso con atención causal multi-cabeza clásica: 12 capas, 12 cabezas, dimensión oculta 768, vocabulario de 50.257 tokens con embeddings de entrada y salida atados y contexto máximo de 1.024 posiciones. No hay mecanismos de atención lineal, decodificación especulativa ni mezcla de expertos; el modelo guardado es GPT-2 sin modificaciones estructurales.

El entrenamiento se realizó desde cero sobre C4 `en` (split de entrenamiento), tokenizado con el tokenizador GPT-2 sin tokens BOS/EOS. Los documentos se truncaron a 1.024 tokens y se empaquetaron con estrategia best-fit en filas de 1.024 tokens, reiniciando las posiciones a 0 en cada documento. Durante el entrenamiento se restringió la atención a cada documento mediante varlen flash attention (solo en el kernel de entrenamiento; el modelo guardado es GPT-2 plano). Se aplicó deduplicación exacta y se excluyeron los primeros 100.000 documentos de `validation.shuffle(seed=42)` (el conjunto de test del laboratorio). El optimizador fue AdamW fused con learning rate 1,8e-3, betas (0,9; 0,95), eps 1e-8, weight decay 0,1 solo en matrices, clipping de gradiente 1,0, dropout 0 y semilla 42. El schedule consistió en 150 pasos de warmup, learning rate constante durante la primera mitad del entrenamiento y decaimiento lineal hasta 0. El batch fue de 256 filas × 1.024 tokens = 262.144 slots por paso (incluyendo padding), con 6.010 pasos y aproximadamente 1,58B slots de tokens. El vocabulario se rellenó a 50.304 durante el entrenamiento y se recortó a 50.257 antes de guardar. El cómputo se ejecutó en dos NVIDIA H200 con autocast BF16 y `torch.compile`, en 29 minutos (PyTorch 2.14.0, Transformers 5.17.0).

## Capacidades

- Generación de texto causal en inglés: continuación de texto libre y modelado de lenguaje puro.
- Modelado de lenguaje y puntuación por perplejidad: útil para evaluar la probabilidad de secuencias o comparar distribuciones.
- Capacidad limitada de razonamiento y matemáticas derivada de su escala (124M) y de la ausencia de ajuste instructivo; no es un modelo orientado a tareas de razonamiento complejo.
- Sin soporte de tool calling ni function calling: es un modelo base sin plantilla de instrucciones ni formato de herramientas.
- Sin capacidades de agente ni razonamiento multi-paso estructurado.
- Multilingüismo: únicamente inglés entrenado; el tokenizador GPT-2 cubre otros idiomas de forma subóptima, pero el modelo no fue entrenado para ellos.
- Sin capacidades multimodales (no hay visión ni audio) ni modo "thinking".
- Sin ajuste por RLHF/DPO ni instrucciones: no sigue instrucciones de forma fiable.

## Casos de uso

- Docencia y reproducción de pipelines de entrenamiento: sirve como referencia completa de un flujo de entrenamiento desde cero (tokenización, empaquetado best-fit, schedule, evaluación por perplejidad) para cursos y laboratorios de aprendizaje automático.
- Punto de partida para ajuste fino: al ser un GPT-2 de 124M con licencia Apache 2.0, se puede ajustar en tareas de clasificación o generación específicas de dominio con presupuesto de cómputo reducido.
- Evaluación de perplejidad y detección de anomalías textuales: su pérdida por token permite puntuar documentos y detectar texto fuera de distribución en corpus ingleses.
- Generación de texto de bajo coste en prototipos: continuación de texto en demos, pruebas de interfaz o generación de relleno donde la calidad no es crítica y el coste de inferencia debe ser mínimo.
- Investigación sobre sesgos y datos de entrenamiento: al estar entrenado sobre C4, permite estudiar qué sesgos y artefactos del corpus se reflejan en un modelo pequeño entrenado desde cero.
- Benchmark de infraestructura: su tamaño (124M) y su formato FP32 permiten validar despliegues en vLLM, TGI o llama.cpp y medir latencia y throughput en hardware modesto antes de escalar a modelos mayores.
- Generación aumentada en pipelines de datos sintéticos: producción masiva de texto en inglés para aumentar datasets de entrenamiento o pruebas, aceptando la calidad limitada del modelo.

## Benchmarks y rendimiento

El autor solo reporta una métrica de evaluación local sobre el conjunto de validación descrito (10.000 documentos de C4 `en` posteriores a los 100.000 del test del laboratorio), con truncado a 1.024 tokens y puntuación desde la posición 0 sin BOS:

| Split | Documentos | Loss | Perplexity |
| --- | ---: | ---: | ---: |
| Validación local | 10.000 | 3,3149 | 27,52 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica explícitamente que la puntuación reportada es una evaluación local y no un resultado de un juez online oficial.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos (124M × 4 bytes) más overhead de activaciones y caché KV; en la práctica, menos de 1-2 GB para contextos de 1.024 tokens.
- En FP16/BF16: aproximadamente 0,25 GB de pesos; en cuantización de 8 bits, unos 0,13 GB; en 4 bits, unos 0,07 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 e incluso en GPUs de gama baja con 4 GB o más. También es viable en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM para FP32 y contextos cortos.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (el modelo está etiquetado como compatible con TGI y endpoints), vLLM, llama.cpp y Ollama (requieren conversión a GGUF, no incluida en el repo), así como despliegue en CPU con PyTorch.
- Latencia y throughput: no disponibles en la información proporcionada. Por escala (124M de parámetros y contexto de 1.024 tokens) se espera un throughput alto y latencia baja en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---:|---:|---|---|---|
| yorukot/gpt2-traning | 124M | 1.024 | en | Apache 2.0 | Entrenado desde cero sobre C4; sin ajuste instructivo; perplejidad local 27,52 |
| GPT-2 (OpenAI, 124M) | 124M | 1.024 | en (multilingüe parcial) | MIT (pesos publicados) | Entrenado sobre WebText; referencia de la arquitectura; ampliamente usado como base |
| GPT-2 medium (OpenAI) | 355M | 1.024 | en | MIT | Mayor capacidad con la misma arquitectura y contexto; más coste de inferencia |
| DistilGPT-2 | 82M | 1.024 | en | Apache 2.0 | Destilado de GPT-2; menor tamaño y mayor velocidad, con pérdida de calidad |

No se dispone de comparaciones de rendimiento publicadas entre este checkpoint y los modelos anteriores en la información proporcionada; la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones ni mantiene formatos de conversación de forma fiable; no debe usarse directamente en asistentes sin ajuste previo.
- Riesgo de alucinación y texto inexacto: el autor advierte que los datos web de C4 pueden producir texto inexacto o sesgado.
- Sesgos del corpus: al entrenarse sobre C4, puede reproducir sesgos sociales, estereotipos y toxicidad presentes en datos web, sin filtros posteriores documentados.
- Cobertura lingüística limitada al inglés; el rendimiento en otros idiomas no está evaluado y se espera deficiente.
- Ventana de contexto corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Evaluación limitada: solo se reporta perplejidad local; no hay benchmarks estándar ni evaluación por jueces online, por lo que la comparación con otros modelos es difícil.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el autor no ofrece garantías sobre el modelo; conviene revisar las condiciones de los datos C4 para usos derivados.
- Modelo de laboratorio con fines educativos: no hay mantenimiento ni soporte documentado más allá de la model card y el enlace a W&B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yorukot/gpt2-traning
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/cerulean-labs/gpt2-training/runs/ohnid20o
- Dataset C4 (allenai/c4): https://huggingface.co/datasets/allenai/c4
- Documentación de GPT2LMHeadModel (Transformers): https://huggingface.co/docs/transformers/model_doc/gpt2
- Repositorio de Transformers: https://github.com/huggingface/transformers
