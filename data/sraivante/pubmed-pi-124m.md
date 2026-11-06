# sraivante/pubmed-pi-124m

## Resumen

PubMed Pi 124M es un modelo de lenguaje causal (causal-LM) de tipo base, entrenado desde cero por el autor independiente sraivante sobre títulos y resúmenes de PubMed en inglés. No es un modelo ajustado por instrucciones ni derivado de un modelo preentrenado: se trata de un entrenamiento completo sobre un corpus biomédico, con 124.278.528 parámetros y una ventana de contexto de 1.024 tokens. Su publicación (v1.0.2, 29 de octubre de 2026) lo sitúa como un experimento reproducible de modelado de lenguaje biomédico a pequeña escala.

La arquitectura es un transformer decoder-only de 14 capas, anchura 768, 12 cabezas de atención y MLP de 3.072, con RoPE, RMSNorm, GELU, embeddings atados y vocabulario BPE byte-level de 32.768 tokens. Una peculiaridad destacable es su inicialización experimental: los pesos se mapean a partir de dígitos consecutivos de pi (incluido el 3 inicial) como `0.003 * dígito`, sin que el autor reclame superioridad frente a la inicialización estándar.

El modelo es relevante no por su rendimiento —limitado, como corresponde a su tamaño y a su dominio restringido— sino por su enfoque de reproducibilidad: incluye manifiestos de inicialización, hashes, procedencia del dataset y un evaluador propio. Está pensado como base para experimentación en NLP biomédico, no como asistente clínico ni como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal, 14 capas, anchura 768, 12 cabezas, MLP 3.072, RoPE, RMSNorm, GELU, embeddings atados, sin biases |
| Parametros totales | 124.278.528 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en FP32/BF16 en `model.pt`; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (otros idiomas no soportados según el autor) |
| Licencia | Apache-2.0 (pesos, código y documentación) |
| Formato de pesos | `model.pt` (checkpoint PyTorch con `state_dict` y `config`), tokenizer en `tokenizer.json` (BPE byte-level, vocab 32.768) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención causal aislada por documento: el padding y las transiciones entre documentos no contribuyen a la pérdida. Usa RoPE para codificar posiciones, RMSNorm en las normalizaciones, activación GELU en el MLP y embeddings atados entre entrada y salida. La inicialización experimental mapea dígitos consecutivos de pi a pesos float32 mediante `0.003 * dígito`; el autor incluye manifiestos exactos de inicialización y aclara explícitamente que no reclama superioridad sobre la inicialización estándar.

El entrenamiento se realizó con AdamW (betas 0.9 y 0.95, epsilon 1e-8, weight decay 0.1), LR pico 3e-4, LR mínimo 3e-5, 500 pasos de warmup, schedule coseno, microbatch 8 con acumulación de gradiente 8, clipping 1.0 y BF16 en A100. Se completó una época en el paso 82.452, con 4.476.671.946 objetivos de pérdida. El corpus de entrenamiento contiene 14.819.763 resúmenes y el de validación 74.281; el tokenizador se entrenó con una muestra determinista de 200.267 registros solo del split de entrenamiento. No hay dataset de fine-tuning en esta release ni se aplicó RLHF, DPO ni alineamiento de seguridad.

## Capacidades

- Generación de texto causal en inglés biomédico: continuación de títulos y resúmenes de PubMed.
- Predicción de siguiente token y finalización de fragmentos con coherencia local dentro del dominio médico.
- Modelado de lenguaje puro: no hay capacidades de instrucciones, diálogo ni formato conversacional.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües: únicamente inglés; el autor declara el resto de idiomas como no soportados.
- Sin modo thinking, sin visión, sin audio y sin capacidades multimodales.
- Inferencia en CPU, CUDA y TPU (PyTorch/XLA), con código de carga propio; no es compatible con `AutoModel` de Transformers.

## Casos de uso

- Experimentación académica en modelado de lenguaje biomédico: sirve como baseline pequeño y reproducible para comparar inicializaciones, schedules de LR o estrategias de tokenización sobre el mismo corpus de PubMed.
- Generación de resúmenes sintéticos de prueba: el modelo puede completar fragmentos de abstracts para construir datasets sintéticos de baja fidelidad, útiles en pruebas de pipelines de NLP biomédico antes de usar modelos mayores.
- Estudio de procedencia y reproducibilidad: sus manifiestos, hashes y evaluador permiten auditar cómo se entrena un LM desde cero y verificar cada artefacto, lo que lo convierte en material didáctico para cursos de entrenamiento de LLM.
- Investigación sobre inicialización de pesos: la inicialización basada en dígitos de pi y los manifiestos incluidos permiten reproducir y contrastar experimentalmente esa técnica frente a inicializaciones convencionales.
- Prototipado de autocompletado en editores de texto científico: con 1.024 tokens de contexto y un vocabulario BPE byte-level, puede ofrecer sugerencias de continuación en dominios muy acotados, siempre con revisión humana.
- Evaluación de métricas de perplejidad: su perplejidad de validación (14,24) y su evaluador de HellaSwag sirven como referencia para comparar modelos pequeños en tareas de dominio específico.
- Docencia y divulgación: ejemplo completo y abierto de un entrenamiento from-scratch con corpus biomédico, útil para explicar tokenización, atención causal por documento y evaluación zero-shot.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Evaluación | Resultado |
|---|---|
| Perplejidad en validación biomédica completa (held-out) | 14,2429 |
| Perplejidad en subconjunto de evaluación de entrenamiento | 14,0440 |
| HellaSwag zero-shot accuracy | 27,2754 % (2.739/10.042) |
| HellaSwag accuracy normalizada por caracteres | 28,4804 % (2.860/10.042) |

Errores estándar declarados: 0,004445 (raw) y 0,004504 (normalizada). El azar en HellaSwag es del 25 %, por lo que el autor califica el rendimiento en sentido común general como limitado. La evaluación se hizo en FP32 sobre Colab v6e-1 TPU con PyTorch 2.8.0 y PyTorch-XLA, con un adaptador propio que sigue el preprocesado de EleutherAI pero no es una ejecución oficial de `lm-evaluation-harness`. No se realizó auditoría formal de contaminación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para pesos (124 M de parámetros × 4 bytes), más overhead de activaciones y KV cache; en la práctica cabe en cualquier GPU consumer con 4 GB o más.
- VRAM estimada en BF16/FP16: aproximadamente 0,25 GB para pesos; viable incluso en iGPU y CPU.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB (RTX 3060, RTX 4060, RTX 4090); para entrenamiento se usó A100 con BF16. La evaluación se ejecutó en TPU v6e-1.
- Cabe en GPU consumer: sí, en todas las gamas actuales, incluidas GTX 1650 y superiores.
- Opciones de despliegue: el modelo no es compatible con vLLM, TGI, llama.cpp ni Ollama de forma nativa, porque usa una arquitectura PyTorch personalizada y requiere el código de `src/model.py`. El despliegue debe hacerse con el script `src/infer.py` o cargando el checkpoint manualmente con `torch.load` y `PubMedLM`.
- Latencia y throughput: no disponibles. El autor solo reporta que la evaluación de HellaSwag (10.042 ejemplos, cuatro finales por fila) tardó 130 segundos en TPU v6e-1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| PubMed Pi 124M | 124 M | 1.024 | Biomédico (PubMed) | Apache-2.0 | PyTorch custom (`model.pt`) |
| GPT-2 small | 124 M | 1.024 | General (web) | MIT | Transformers, GGUF, etc. |
| BioGPT (Microsoft) | 347 M | 1.024 | Biomédico (PubMed) | MIT | Transformers |
| PubMedBERT | 110 M (encoder) | 512 | Biomédico | MIT | Transformers (encoder) |

La comparación con GPT-2 small es la más directa por tamaño (ambos 124 M y contexto 1.024), pero PubMed Pi está especializado en texto biomédico y carece del ecosistema de herramientas de GPT-2. Frente a BioGPT (347 M) es más pequeño y no está ajustado para generación de respuestas biomédicas; frente a PubMedBERT es un modelo generativo, no un encoder para clasificación o NER. No se dispone de benchmarks comunes publicados que permitan una comparación cuantitativa directa con estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Puede alucinar, repetir texto y reflejar abstracts desactualizados o sesgados presentes en PubMed.
- El inglés es el único idioma previsto; el resto no está soportado.
- No se realizó ajuste por instrucciones, alineamiento de seguridad ni validación clínica; es inadecuado para decisiones clínicas autónomas.
- La perplejidad baja no es evidencia de corrección médica.
- El rendimiento en sentido común general es limitado: HellaSwag zero-shot del 27,28 % frente al 25 % del azar.
- No se realizó auditoría formal de contaminación en HellaSwag.
- La inicialización basada en dígitos de pi es experimental y el autor no reclama que mejore la inicialización estándar.
- El modelo no es compatible con `AutoModel` de Transformers ni con los formatos GGUF, AWQ o GPTQ; requiere el código propio del repositorio.
- La licencia Apache-2.0 cubre pesos, código y documentación, pero el autor advierte que no implica que todo el texto de entrenamiento sea de licencia abierta; los textos de abstracts de terceros y los binarios reversibles del tokenizador se excluyen por derechos de redistribución no establecidos.
- Las revisiones históricas de los ficheros de PubMed no se conservaron; las descargas actuales de NLM pueden diferir del corpus original.
- El widget de inferencia del Hub no está configurado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/pubmed-pi-124m
- Dataset companion: https://huggingface.co/datasets/sraivante/pubmed-pi-124m-data
- Repositorio de código y procedencia: incluido en el propio repositorio del modelo (`src/`, `provenance/`, `evaluation/`)
- Evaluador de HellaSwag: `evaluation/hellaswag.py` dentro del repositorio
- Preprocesado de referencia de HellaSwag (EleutherAI): no disponible como enlace directo en la información proporcionada
- Paper o blog del autor: no disponible
