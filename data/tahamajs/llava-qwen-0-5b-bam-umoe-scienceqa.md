# tahamajs/llava-qwen-0.5b-bam-umoe-scienceqa

## Resumen

`llava-qwen-0.5b-bam-umoe-scienceqa` es un modelo de visión-lenguaje (VLM) publicado por Taha Majlesi (usuario `tahamajs`) dentro del proyecto NeuralOps. Se construye sobre el checkpoint base `llava-hf/llava-interleave-qwen-0.5b-hf`, que combina un codificador visual SigLIP con un proyector MLP de dos capas y un decodificador de lenguaje Qwen2 de 24 capas (dimensión 1024, 16 cabezas). El problema que aborda es de investigación: evaluar si un mecanismo de atención subcuadrático y disperso, denominado BAM-UMoE (Unified Mixture of Experts Attention Block, con conciencia de activación), puede sustituir a la atención cuadrática estándar en un VLM sin degradar de forma catastrófica el rendimiento multimodal.

La intervención es quirúrgica: 18 de las 24 capas de atención del decodificador se reemplazan por bloques `BAMUMoEBlock` bajo un patrón híbrido `hybrid_3_1`, conservando 6 capas cuadráticas como anclas (índices 3, 7, 11, 15, 19 y 23). El codificador visual y el proyector multimodal permanecen congelados. Posteriormente el modelo se destila sobre el subconjunto con imagen del dataset ScienceQA, en dos etapas y 231 pasos de optimización.

Es relevante ahora porque documenta de forma transparente el coste de sustituir atención densa por mecanismos dispersos en un VLM pequeño: la precisión visual cae del 46,90 % del modelo profesor al 33,10 % tras la destilación, una pérdida de casi 14 puntos. El repositorio es útil como referencia metodológica y como banco de pruebas de "attention surgery", no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: SigLIP (vision tower congelado) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con 18 capas sustituidas por `BAMUMoEBlock` (patrón `hybrid_3_1`) |
| Parametros totales | no disponible (el checkpoint publicado contiene solo pesos de atención y layernorm: 378,19 MB en FP16) |
| Parametros activos | no disponible (el mecanismo BAM-UMoE es de tipo mixture of experts, pero no se publica el recuento de expertos ni de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16) + configuraciones de processor y tokenizer |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`. La geometría del decodificador es de 24 capas, dimensión de modelo 1024, 16 cabezas de atención y dimensión por cabeza 64 (todas potencias de dos exactas). El codificador visual SigLIP y el proyector MLP de dos capas se mantienen completamente congelados durante todo el proceso, de modo que los tokens visuales se interpolan con los tokens de texto dentro de las capas del modelo de lenguaje. La cirugía reemplaza 18 capas de atención por `BAMUMoEBlock`, un operador disperso del registro `ATTENTION_REGISTRY` de NeuralOps (clave `bam_umoe`, familia `sparse`, implementación en `neuralops/layers/sparse/bam_umoe.py`), y deja 6 capas cuadráticas como anclas en los índices 3, 7, 11, 15, 19 y 23.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre el subconjunto con imagen de `derek-thomas/ScienceQA`: 89 pasos en la etapa 1 y 142 en la etapa 2, 231 pasos en total. La ejecución duró 120,6 segundos con un pico de 17.352 MB de VRAM en una NVIDIA RTX 3090 de 24 GB. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron RLHF o DPO. La innovación técnica destacable es precisamente la sustitución de atención densa por un bloque disperso con enrutamiento consciente de activaciones, evaluada de forma aislada al congelar la torre visual.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales sobre contenidos científicos y educativos.
- Razonamiento multimodal básico sobre diagramas, ilustraciones y figuras de ScienceQA.
- Conversación multi-turno en formato LLaVA (pipeline `conversational`), aunque el ajuste se ha realizado sobre preguntas de un solo turno.
- Comprensión de texto en inglés como idioma único declarado.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- No se documenta modo de pensamiento (thinking), audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Investigación sobre atención eficiente en VLMs: el modelo sirve como punto de comparación controlado para medir el impacto de sustituir atención cuadrática por `bam_umoe` manteniendo congelada la torre visual; su valor está en el par (profesor, alumno) con métricas publicadas.
- Reproducción de experimentos de "attention surgery": el script `apply_qwen_attention_surgery` con `attn_key="bam_umoe"` y `pattern="hybrid_3_1"` permite replicar la intervención sobre el checkpoint base y validar la receta en otras configuraciones.
- Docencia y divulgación sobre destilación de conocimiento multimodal: la diferencia de perplejidad (1.781,62 en zero-shot frente a 3,83 tras destilación) es un ejemplo didáctico de cómo la destilación repara una inicialización de atención que rompe el modelo.
- Prototipado de asistentes educativos de bajo coste: con un decodificador de 0,5B y 24 capas, el modelo cabe en GPUs de consumo, lo que permite experimentar con tutores visuales de ciencias en entornos de laboratorio.
- Evaluación de robustez de operadores dispersos: permite estudiar cómo se degrada la precisión (46,90 % → 33,10 %) al reducir el coste cuadrático en la ruta cross-modal.
- Base para ablaciones de patrones híbridos: los 6 anclas cuadráticas permiten variar el patrón (por ejemplo, `hybrid_3_1` frente a otros) y medir el efecto en ScienceQA sin reentrenar la torre visual.
- Referencia para pipelines de carga selectiva de pesos: el patrón de cargar `attention_weights.safetensors` con `strict=False` sobre el modelo base es reutilizable en otros experimentos de cirugía de atención.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`) sobre el split de validación del subconjunto con imagen de `derek-thomas/ScienceQA`:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot (`bam_umoe`) | Post-destilacion (`bam_umoe`) | Delta |
|---|---:|---:|---:|---:|
| Precisión visual ScienceQA (%) | 46,90 | 32,41 | 33,10 | +0,69 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 1.781,62 | 3,83 | -1.777,79 |

Telemetría del entrenamiento: 231 pasos de optimización (etapa 1: 89; etapa 2: 142), 120,6 segundos de duración, pico de 17.352 MB de VRAM en una NVIDIA RTX 3090 de 24 GB, marca temporal 2026-11-11T02:56:42Z.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 17.352 MB (aproximadamente 17 GB) durante el entrenamiento en FP16 sobre una RTX 3090; la inferencia en FP16 debería situarse por debajo de esa cifra, aunque no se publica una medición específica.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) es la única configuración documentada por el autor; por tamaño del decodificador (0,5B) y de la torre SigLIP, cabría esperar que GPUs de 16 GB o superiores funcionen en FP16, pero no está verificado en la información disponible.
- Cabe en GPU de consumo: sí, según la telemetría del autor en una RTX 3090; no se documentan pruebas en GPUs de 8 GB o 12 GB.
- Opciones de despliegue: la carga se realiza con `transformers` (`AutoProcessor`, `LlavaForConditionalGeneration`) más `safetensors` y el paquete `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-bam-umoe-scienceqa` | decodificador 0,5B (24 capas) + SigLIP | no disponible | 33,10 % (post-destilación) | MIT | Hugging Face, pesos de atención únicamente |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | decodificador 0,5B + SigLIP | no disponible | 46,90 % (baseline del autor) | no disponible en la información proporcionada | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación significativa es contra el propio modelo base: la cirugía de atención con `bam_umoe` y la destilación posterior no recuperan la precisión del profesor, con una brecha de 13,8 puntos porcentuales en ScienceQA.

## Limitaciones y advertencias

- Pérdida de precisión notable: 33,10 % frente al 46,90 % del modelo base en ScienceQA, una caída de 13,8 puntos porcentuales que lo hace inadecuado para uso en producción sin mejoras adicionales.
- El checkpoint publicado contiene únicamente los pesos de atención y layernorm (378,19 MB); requiere descargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar la cirugía con `neuralops` antes de cargar los pesos, lo que añade dependencias y pasos manuales.
- Dependencia de la librería `neuralops` y del script `scripts.benchmarks.qwen_zoo_train_mix`, cuyo mantenimiento y estabilidad no están garantizados en la información disponible.
- Idiomas: solo inglés declarado; no hay evidencia de comportamiento multilingüe.
- Dominio restringido: ajustado exclusivamente sobre ScienceQA (preguntas científicas con imagen), por lo que la generalización a otros dominios visuales no está evaluada.
- Riesgo de alucinación: no cuantificado en la información disponible; en un VLM de 0,5B con precisión del 33 % en su propio dominio de evaluación, la probabilidad de respuestas incorrectas es alta.
- Sesgos: no documentados por el autor; el dataset ScienceQA y el modelo base pueden introducir sesgos educativos y culturales no analizados.
- Licencia MIT: permite uso comercial según el repositorio, pero la licencia del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` debe verificarse por separado, ya que no se detalla en la información proporcionada.
- Benchmarks no verificados (`verified: false`) y con 0 descargas y 0 likes en el momento de la consulta; tratar los resultados como preliminares.
- Fecha de creación declarada en el repositorio: 2026-11-11, posterior a la fecha habitual de consulta; conviene confirmar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-bam-umoe-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del bloque: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/bam_umoe.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
