# Urdatorn/sphragis-alm-olmo1b-sentence-aristotle

## Resumen

`sphragis-alm-olmo1b-sentence-aristotle` es un modelo de lenguaje autoríal (ALM, por sus siglas en inglés) desarrollado por Urdatorn para el benchmark de atribución de autoría en griego antiguo Sphragis. Forma parte de un conjunto de 28 modelos, cada uno entrenado exclusivamente con las frases de un autor clásico; este ejemplar está especializado en Aristóteles. El modelo parte de `allenai/OLMo-1B-hf` y se somete a un proceso de further-pretraining completo sobre 650 filas de entrenamiento del autor, con 50.968 tokens puntuados.

La relevancia de este modelo reside en su enfoque metodológico: a diferencia de trabajos previos que fijaban un número arbitrario de épocas, aquí la duración del entrenamiento se selecciona mediante ascenso por coordenadas sobre la atribución de validación, optimizando directamente la macro-F1 de atribución del conjunto completo de 28 modelos. Con 1.176.764.416 parámetros y una ventana de contexto estándar de OLMo-1B, el modelo está diseñado para puntuar la perplejidad de frases individuales y atribuir su autoría comparando la verosimilitud entre los distintos ALMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (OLMo-1B) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de OLMo-1B, 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Griego antiguo (grc) |
| Licencia | other (derivado de fuentes con licencias mixtas, incluyendo CC BY-NC-SA) |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `allenai/OLMo-1B-hf` (revision `aee7752d9c08ee4775e9b0091426d8410e8f6a89`), un transformer decoder-only de 1.000 millones de parametros desarrollado por el Allen Institute for AI. El entrenamiento se realiza con objetivo de LM causal sobre secuencias con el formato `<|endoftext|> sentence <|endoftext|>`, una frase por secuencia, con 3 épocas, learning rate constante de 5e-05 tras 25 pasos de warmup, batch efectivo de 16 frases y precision mixta bf16 con pesos maestros en fp32, usando FSDP completo sobre 2x GH200.

La innovacion principal no esta en la arquitectura sino en el criterio de seleccion: la duracion del entrenamiento se elige por evidencia held-out, optimizando la atribucion de validacion macro-F1 sobre los 28 modelos, no la perplejidad del propio autor. Esto responde a que la atribucion requiere que un modelo encaje mejor a su autor que los demas, no simplemente que lo modele bien. El codigo de entrenamiento, puntuacion y atribucion esta disponible en el repositorio `Urdatorn/sphragis_models`.

## Capacidades

- Atribucion de autoria en griego antiguo: puntua la perplejidad por token de una frase y la compara contra los otros 27 modelos del conjunto Sphragis.
- Modelado de lenguaje causal especifico del estilo de Aristoteles: captura patrones lexicos, sintacticos y estilisticos propios de sus textos.
- Puntuacion de frases individuales: disenado para evaluar una sola frase por secuencia, no documentos largos.
- Clasificacion por minima sorpresa: una fila se atribuye al modelo que encuentre la frase menos sorprendente (menor negative log-likelihood por token).
- Capacidades linguisticas limitadas al griego antiguo: no es un modelo de proposito general ni multilingue.
- Integracion con el benchmark Sphragis: funciona como componente de un sistema de 28 modelos para atribucion entre autores clasicos.

## Casos de uso

- Investigacion en estilometria clasica: los filologos pueden usar el modelo para verificar la autoria de textos dudosos atribuidos a Aristoteles, puntuando frases individuales y comparando la perplejidad contra los otros 27 ALMs del conjunto.
- Autentificacion de fragmentos: permite evaluar si un fragmento recien descubierto o un palimpsesto es mas consistente con el estilo de Aristoteles que con el de otros autores del corpus Sphragis.
- Ensenanza de griego antiguo: los estudiantes pueden analizar diferencias estilisticas entre autores clasicos usando la perplejidad como metrica objetiva de similitud estilistica.
- Desarrollo de metodos de atribucion: sirve como componente de referencia para investigacion metodologica en atribucion de autoria, comparando enfoques basados en perplejidad frente a otros clasificadores.
- Estudios de autorias colaborativas: permite investigar la contribucion de diferentes autores en obras tradicionalmente atribuidas a una sola persona, analizando la variabilidad estilistica dentro del corpus aristotelico.
- Evaluacion de modelos de lenguaje para lenguas antiguas: el modelo puede usarse como punto de comparacion para medir la calidad de representacion del griego antiguo en otros LLMs, dado su entrenamiento especifico en un solo autor.

## Benchmarks y rendimiento

El modelo forma parte de un conjunto de 28 ALMs que, en conjunto, alcanzan los siguientes resultados en el benchmark Sphragis:

| Tarea | Macro-F1 de test |
|---|---|
| sentence_1 | 62.36 |
| sentence_5 | 86.84 |
| sentence_10 | 89.53 |
| sentence_50 | 92.44 |

No se han publicado resultados individuales para este modelo concreto en la informacion disponible. Los datos corresponden al rendimiento conjunto de los 28 modelos trabajando como sistema de atribucion.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1.000 millones de parametros en bf16, requiere aproximadamente 2,4 GB de VRAM para los pesos, mas overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, etc.) es suficiente para inferencia en precision bf16 o fp16.
- En GPU consumer: si cabe, en practicamente cualquier GPU moderna con 8 GB o mas de VRAM.
- Opciones de despliegue: al ser un modelo OLMo en formato safetensors, puede cargarse con HuggingFace Transformers, vLLM o TGI. No se proporcionan pesos en GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada, pero para un modelo de 1B en una GPU moderna se espera una latencia de decenas de milisegundos por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `sphragis-alm-olmo1b-sentence-aristotle` | 1,18 B | no disponible | Further-pretraining en Aristoteles (650 filas) | other | Atribucion de autoria en griego antiguo |
| `sphragis-alm-olmo3-7b-aristophanes` | 7 B | no disponible | Further-pretraining en Aristofanes | other | Atribucion de autoria en griego antiguo |
| `allenai/OLMo-1B-hf` (base) | 1,18 B | 2048 | Preentrenamiento general en ingles | Apache-2.0 | Modelo de lenguaje general |

La comparativa directa con otros modelos de atribucion de autoria en griego antiguo no esta disponible en la informacion proporcionada. El modelo se distingue de su base por su especializacion en un unico autor y por su licencia restringida derivada de las fuentes del corpus.

## Limitaciones y advertencias

- Licencia restrictiva: el modelo se publica bajo licencia `other` debido a que el texto de entrenamiento proviene de fuentes con licencias mixtas, incluyendo material CC BY-NC-SA. Esto impide su uso comercial sin verificacion previa de las licencias de las fuentes en el dataset Sphragis.
- Especializacion extrema: el modelo solo es util para textos en griego antiguo del estilo de Aristoteles; su rendimiento en otros dominios o idiomas no ha sido evaluado y probablemente sea deficiente.
- Riesgo de sobreajuste: con solo 650 filas de entrenamiento y 3 épocas, el modelo puede memorizar patrones superficiales del corpus de entrenamiento en lugar de generalizar el estilo del autor.
- Sesgo de corpus: el modelo refleja exclusivamente los textos atribuidos a Aristoteles incluidos en el benchmark Sphragis, que pueden no representar la totalidad del corpus aristotelico ni sus variaciones diacronicas.
- Alucinacion: como modelo causal de 1B, puede generar texto incoherente o falso si se usa para generacion, aunque su uso previsto es solo de puntuacion.
- Sin soporte para otros idiomas: el modelo solo reconoce griego antiguo; no es util para tareas multilingues.
- Dependencia del conjunto de 28 modelos: la atribucion requiere comparar contra los otros 27 ALMs; el modelo aislado no proporciona una decision de autoria por si solo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Urdatorn/sphragis-alm-olmo1b-sentence-aristotle
- Dataset Sphragis: https://huggingface.co/datasets/Urdatorn/sphragis
- Codigo de entrenamiento y atribucion: https://github.com/Urdatorn/sphragis_models
- Leaderboard del benchmark: https://huggingface.co/spaces/Urdatorn/sphragis-leaderboard
- Modelo base OLMo-1B: https://huggingface.co/allenai/OLMo-1B-hf
- Paper de referencia (Huang, Murakami y Grieve, 2025): PLoS ONE 20(7): e0327081
- Paper de OLMo: https://arxiv.org/html/2402.00838v1
- Repositorio de OLMo: https://github.com/allenai/OLMo
