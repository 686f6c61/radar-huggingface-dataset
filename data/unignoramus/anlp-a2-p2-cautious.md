# unignoramus/anlp-a2-p2-cautious

## Resumen

`unignoramus/anlp-a2-p2-cautious` es un transformer decoder-only de 35,27 millones de parámetros desarrollado por el usuario unignoramus como entrega de la Assignment 2, Part 2, de un curso de NLP avanzado (ANLP). El modelo se preentrenó desde cero sobre el corpus paralelo inglés humano/IA `browndw/human-ai-parallel-corpus` con una implementación manual del optimizador denominado "cautious", lo que lo convierte en un artefacto fundamentalmente académico orientado a comparar variantes de optimización, no en un modelo de propósito general.

La relevancia del repositorio es metodológica: publica el checkpoint completo de un entrenamiento reproducible (37,93 M tokens vistos, learning rate 0,0003) junto con métricas de validación (loss 4,1639) y de test (BLEU 1,53). No incorpora ajuste por instrucciones, RLHF ni DPO, y la model card no documenta ventana de contexto, tokenizador ni composición lingüística del dataset más allá de que el corpus es en inglés.

Por su tamaño y licencia MIT, es un modelo cómodo de ejecutar y auditar, pero sus métricas publicadas sitúan la calidad de generación muy por debajo de cualquier umbral de uso en producción. Debe tratarse como material de investigación y docencia sobre optimizadores y dinámicas de entrenamiento a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (autorregresivo, implementación propia) |
| Parametros totales | 35,27 M |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, AWQ, GPTQ ni FP8; solo checkpoint en precisión de entrenamiento) |
| Idiomas soportados | no disponible en la model card; el corpus de entrenamiento (`human-ai-parallel-corpus`) es en inglés |
| Licencia | MIT |
| Formato de pesos | Checkpoint `torch.save` con las claves `model`, `state` y `config`; requiere `torch.load(..., weights_only=False)` |

## Arquitectura y entrenamiento

Se trata de un transformer decoder-only escrito a mano, preentrenado de forma autorregresiva sobre el corpus paralelo inglés humano/IA `browndw/human-ai-parallel-corpus`. El dato diferencial es el optimizador: la model card indica explícitamente que se emplea una implementación propia del optimizador "cautious" con un learning rate de 0,0003. El entrenamiento consumió 38,93 millones de tokens y alcanzó una loss de validación de 4,1639, con un BLEU de test de 1,53.

No se documentan detalles habituales de arquitectura y entrenamiento (número de capas, dimensión del modelo, cabezas de atención, tokenizador, composición exacta del dataset, uso de RLHF/DPO o de decodificación especulativa). La relación entre tokens vistos y parámetros es de aproximadamente 1,1 tokens por parámetro, muy por debajo del ratio compute-optimal habitual en entrenamiento tipo Chinchilla (del orden de 20 tokens por parámetro), lo que apunta a un modelo claramente infrentrenado y explica en parte la loss de validación elevada y el BLEU casi nulo. El checkpoint se guarda como payload plano de `torch.save`, sin conversión a `safetensors` ni a formatos de inferencia estandarizados, y la model card remite a un repositorio acompañante para obtener la definición del transformer con la que cargarlo.

## Capacidades

- Generación de texto autorregresiva en inglés, condicionada por el corpus paralelo humano/IA de entrenamiento.
- Modelado de lenguaje a pequeña escala: útil como banco de pruebas para estudiar curvas de pérdida y comportamiento de optimizadores.
- Reproducción de experimentos: el checkpoint incluye `model`, `state` y `config`, lo que permite reanudar análisis o comparar estados de entrenamiento.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes, razonamiento multi-paso ni modos de "pensamiento" explícitos.
- No se documentan capacidades multilingües; el corpus de entrenamiento es en inglés.
- No se documentan capacidades de visión, audio ni multimodalidad.
- No se documenta alineación por instrucciones (sin SFT, RLHF ni DPO declarados).

## Casos de uso

- Docencia e investigación sobre optimizadores: el propósito declarado del repositorio es comparar el optimizador "cautious" frente a alternativas, por lo que sirve como artefacto reproducible en asignaturas y trabajos de ablación de optimizadores a escala pequeña.
- Análisis de dinámicas de entrenamiento: con 35,27 M de parámetros y una loss de validación conocida (4,1639), permite estudiar el efecto del learning rate, el número de tokens vistos y el sobreajuste en modelos de escala reducida.
- Punto de partida para fine-tuning didáctico: al ser un modelo denso de 35 M de parámetros, se puede ajustar en una única GPU de gama media sobre un dataset de dominio concreto para ilustrar el flujo completo de preentrenamiento y ajuste.
- Pruebas de serialización y carga de checkpoints: su formato `torch.save` con `weights_only=False` es un caso práctico para validar pipelines internos de carga de pesos, políticas de seguridad al deserializar pickles y herramientas de conversión a `safetensors`.
- Benchmarking de infraestructura de bajo consumo: sirve como carga sintética para medir latencia y throughput de inferencia en CPU, GPU de gama de entrada o dispositivos edge, donde el cuello de botella es el framework y no el modelo.
- Estudio de la distribución de texto humano frente a texto generado por IA: al entrenarse sobre un corpus paralelo humano/IA, permite analizar qué señales estadísticas del texto artificial aprende un modelo pequeño.
- Línea base negativa en evaluaciones: su BLEU de test de 1,53 lo hace útil como referencia inferior frente a la que medir mejoras en tokenización, datos u optimización en condiciones equivalentes.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Loss de validacion | 4,1639 | Validación del entrenamiento |
| BLEU de test | 1,53 | Test sobre el corpus de entrenamiento |
| Parametros | 35,27 M | - |
| Tokens de entrenamiento | 38,93 M | - |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ARC, HellaSwag) en la informacion disponible, ni comparaciones con modelos de referencia del mismo rango de tamaño. El BLEU de test de 1,53, en una escala de 0 a 100, es un valor prácticamente residual que indica una calidad de generación muy baja.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el checkpoint de 35,27 M de parámetros ocupa aproximadamente 141 MB; en FP16/BF16 unos 70 MB; en INT8 unos 35 MB. El consumo total, incluyendo activaciones y overhead del runtime, se mantiene por debajo de 1 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria es suficiente. No requiere A100, H100 ni RTX 4090; una GTX 1050 Ti, una RTX 3050 o una GPU integrada moderna bastan.
- Compatibilidad con hardware de consumo: sí, cabe holgadamente en cualquier GPU de consumo e incluso en CPU. Es viable la inferencia en Raspberry Pi o en un portátil sin GPU dedicada.
- Opciones de despliegue: carga nativa en PyTorch mediante `torch.load(..., weights_only=False)` y el código del repositorio acompañante. No hay conversiones publicadas a GGUF, ni integración lista para llama.cpp, Ollama, vLLM o TGI, ya que no se publica una configuración de arquitectura compatible con `transformers`.
- Latencia y throughput estimados: no disponibles. No se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Benchmarks publicados |
|---|---|---|---|---|---|
| anlp-a2-p2-cautious | 35,27 M | no disponible | MIT | `torch.save` (checkpoint propio) | Solo loss de validacion (4,1639) y BLEU de test (1,53) |
| GPT-2 small | 124 M | 1024 tokens | MIT | safetensors, GGUF (conversiones de la comunidad) | Metricas de referencia ampliamente difundidas |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | safetensors | Suite completa de evaluaciones publicada por el autor |

La comparación de rendimiento con estas alternativas no es significativa: los modelos citados cuentan con suites de evaluación estandarizadas y con soporte nativo en frameworks de inferencia, mientras que este checkpoint solo publica dos métricas internas del entrenamiento. La comparación relevante es de naturaleza metodológica (optimizador implementado a mano y trazabilidad del checkpoint), no de calidad de generación.

## Limitaciones y advertencias

- Calidad de generación muy baja: un BLEU de test de 1,53 y una loss de validación de 4,1639 indican texto escasamente coherente; no es apto para producción ni para tareas de usuario final.
- Entrenamiento insuficiente: 38,93 M de tokens para 35,27 M de parámetros equivalen a ~1,1 tokens por parámetro, muy por debajo del ratio compute-optimal, lo que limita severamente la generalización.
- Sesgos conocidos: no disponible. La model card no incluye ninguna sección de sesgos, evaluación de toxicidad ni análisis de seguridad.
- Riesgo de alucinación: muy alto por diseño, al no haber recibido ajuste por instrucciones ni alineación; el modelo genera continuaciones plausibles del corpus, no respuestas verificadas.
- Limitaciones de idioma: no se declara lista de idiomas soportados; el corpus de entrenamiento es en inglés, por lo que el comportamiento en castellano u otros idiomas no está caracterizado.
- Longitud de contexto: no disponible, lo que impide planificar tareas que dependan de ventanas largas.
- Sin alineación: no se documenta SFT, RLHF ni DPO. El modelo puede emitir contenido inapropiado o sin filtro.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificación y redistribución, pero el modelo no ofrece ninguna garantía y su naturaleza académica desaconseja explícitamente ese uso.
- Consideración de seguridad al cargar: el checkpoint exige `torch.load(..., weights_only=False)`, lo que implica deserialización de pickle y riesgo de ejecución de código arbitrario si el fichero no proviene de una fuente de confianza.
- Dependencia del repositorio acompañante: sin la definición del transformer incluida en ese repositorio, el checkpoint no es cargable directamente, ya que no se publica una `config.json` compatible con `transformers`.
- Ausencia de soporte en el ecosistema: no existen pesos en safetensors ni GGUF, lo que bloquea su uso inmediato en llama.cpp, Ollama, vLLM o TGI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p2-cautious
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio acompañante con la definición del transformer: referenciado en la model card, enlace no publicado en la información disponible
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo, a su paper o a su repositorio; los resultados devueltos corresponden a aplicaciones Android de auto-clicker sin relación con el modelo.
