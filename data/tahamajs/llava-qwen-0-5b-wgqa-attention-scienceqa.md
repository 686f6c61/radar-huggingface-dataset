# tahamajs/llava-qwen-0.5b-wgqa-attention-scienceqa

## Resumen

`llava-qwen-0.5b-wgqa-attention-scienceqa` es un checkpoint experimental publicado por el usuario tahamajs dentro de su proyecto NeuralOps, un "attention surgery zoo" que aplica modificaciones quirúrgicas a la atención de modelos existentes. En este caso, parte del modelo multimodal LLaVA-Interleave-Qwen-0.5B de llava-hf (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas) y sustituye el mecanismo de atención de 18 de sus 24 capas por una variante propia denominada WeightedGroupedQueryAttention (WGQA), que incorpora pesos de importancia aprendibles por cabeza KV junto con LoRA, caché KV y enmascaramiento causal.

El modelo resultante no es un modelo base completo: los pesos publicados son únicamente el delta quirúrgico de las capas de atención modificadas (92,72 MB en safetensors FP16 frente a los 1,66 GB del base completo), por lo que requiere el paquete `neuralops` y el modelo base para reconstruirse y ejecutarse. Se ha afinado sobre el subconjunto con imágenes de ScienceQA mediante destilación de conocimiento en dos etapas desde el modelo profesor.

Su relevancia es fundamentalmente metodológica: sirve como banco de pruebas reproducible para investigar cómo afecta la sustitución del mecanismo de atención a un VLM pequeño en una tarea de razonamiento visual STEM, con métricas declaradas de precisión (43,75 %) y perplejidad (3,09) frente al profesor (63,75 % y 2,45). No está pensado como modelo de producción, sino como artefacto de investigación sobre compresión y cirugía de atención.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con atención WGQA en 18/24 capas |
| Parametros totales | no disponible (el checkpoint publicado contiene solo 318 tensores de atención, 97.220.704 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (FP16, solo atención quirúrgica) más `surgical_manifest.json` y configuración del tokenizador/procesador |
| Modelo base | llava-hf/llava-interleave-qwen-0.5b-hf |
| Libreria | neuralops |
| Alcance quirúrgico | 18/24 capas (esquema `hybrid_3_1`); capas ancla cuadráticas [3, 7, 11, 15, 19, 23] sin modificar |
| Componentes congelados | `vision_tower.*` (27 capas), `multi_modal_projector.*`, MLPs y embeddings del decodificador |
| Dataset de ajuste | derek-thomas/ScienceQA (subconjunto con imágenes, validación) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA-Interleave: una torre visual SigLIP congelada de 27 capas que codifica la imagen, un proyector MLP de dos capas que alinea el espacio visual con el textual, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión de cabeza 64. La intervención sustituye la atención estándar de 18 de las 24 capas por `WeightedGroupedQueryAttention`, que añade pesos de importancia aprendibles por cada cabeza KV sobre la formulación de grouped-query attention, manteniendo caché KV y enmascaramiento causal. Se preservan seis capas "ancla" con atención cuadrática original (índices 3, 7, 11, 15, 19 y 23) bajo un esquema híbrido 3:1, y se congela por completo la torre visual, el proyector, los MLP y los embeddings.

El entrenamiento combina cirugía de atención con destilación de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original) en dos etapas: 139 pasos en la primera y 172 en la segunda, 311 pasos totales ejecutados en una única NVIDIA RTX 3090 de 24 GB con un pico de VRAM de 15.339 MB y una duración total de 120,5 segundos. Solo se entrenan las atenciones modificadas y las layernorms del decodificador. El resultado es un delta de pesos de 92,72 MB (18,35 veces más pequeño que el base en FP16, un 94,6 % de reducción), empaquetado con un manifiesto de topología (`schema_version=neuralops.surgery/v2`, 318 tensores guardados).

## Capacidades

- Respuesta a preguntas visuales (VQA) sobre imágenes y texto combinados, con formato de respuesta de opción múltiple.
- Razonamiento visual sobre contenido STEM (ciencia, tecnología, ingeniería y matemáticas) en el dominio de ScienceQA.
- Procesamiento de imagen y texto de forma conjunta mediante el pipeline `image-text-to-text`.
- Conversación multi-turno según la plantilla de chat incluida (`chat_template.json`), heredada del modelo base.
- Comprensión de instrucciones en inglés; el modelo declara únicamente el idioma `en`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Investigación sobre mecanismos de atención: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por WGQA en un VLM pequeño y medir el impacto en precisión y perplejidad sobre ScienceQA, con telemetría de entrenamiento incluida (311 pasos, 120,5 s, 15.339 MB de VRAM pico).
- Estudio de destilación de conocimiento en modelos multimillonarios: la comparación profesor (63,75 %) frente a pre-KD (30,63 %) y post-KD (43,75 %) sirve como caso de referencia para analizar cuánto rendimiento se recupera con destilación tras una cirugía agresiva de atención.
- Benchmarking de compresión de artefactos: el delta de 92,72 MB frente a 1,66 GB del base permite evaluar estrategias de empaquetado selectivo de pesos y su viabilidad en pipelines de despliegue con recursos limitados.
- Prototipado de asistentes educativos STEM en inglés: con 0,5B de parámetros y una RTX 3090 basta para iterar sobre preguntas de ciencia con imagen, aunque la precisión de 43,75 % limita su uso a entornos de prueba y no a tutores reales.
- Docencia y formación en arquitecturas multimodales: el código de carga (`load_surgeried_model`), el manifiesto quirúrgico y la configuración permiten diseccionar cómo se compone un VLM LLaVA y qué componentes son congelables.
- Reproducibilidad de experimentos de atención: al fijar el modelo base, el dataset y las métricas, el artefacto facilita repetir la cirugía con otras variantes del zoo de atención (por ejemplo, otras claves del registro `modern`) y comparar resultados de forma controlada.
- Validación de infraestructura de entrenamiento en GPU de consumo: sirve para comprobar flujos de entrenamiento cortos (menos de 3 minutos) en una única RTX 3090 antes de escalar a configuraciones mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión ScienceQA (%) | 63,75 | 30,63 | 43,75 | +13,12 |
| Perplejidad ScienceQA | 2,45 | 252.731,75 | 3,09 | -252.728,66 |

El conjunto evaluado es el subconjunto con imágenes de ScienceQA (split de validación, dataset `derek-thomas/ScienceQA`), tarea de respuesta a preguntas visuales. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El entrenamiento documentado se ejecutó en una única NVIDIA GeForce RTX 3090 (24 GB) con un pico de 15.339 MB de VRAM, por lo que el ajuste cabe en GPU de consumo de gama alta.
- El checkpoint publicado pesa 92,72 MB, pero para inferencia hay que cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` (1,66 GB en FP16) junto con el delta quirúrgico; la VRAM de inferencia real depende del base completo y del tamaño de lote, y no se documenta de forma explícita.
- Al ser un modelo de 0,5B de parámetros, es esperable que quepa en GPUs de consumo con 8-12 GB de VRAM en FP16, aunque esta cifra no está confirmada en la información disponible.
- Despliegue: la vía documentada es la API pública de NeuralOps (`neuralops.hub.load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, dado que los pesos son un delta parcial y no un modelo completo autónomo.
- Latencia y throughput: no disponibles. Solo se conoce la duración de entrenamiento (120,5 s para 311 pasos), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA (subconjunto con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-wgqa-attention-scienceqa | 0,5B (base) con 18/24 capas WGQA | no disponible | 43,75 % (declarado, no verificado) | MIT | Hugging Face (delta quirúrgico) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros modelos LLaVA-Qwen-0.5B del zoo NeuralOps | 0,5B con otras variantes de atención | no disponible | no disponible | MIT (según el proyecto) | Hugging Face |

No se dispone de datos de benchmarks de alternativas externas al proyecto NeuralOps en la información proporcionada, por lo que la comparación con modelos de otros autores queda como no disponible.

## Limitaciones y advertencias

- Los pesos publicados son un delta parcial de atención (318 tensores, 92,72 MB), no un modelo autónomo: requieren el modelo base y la librería `neuralops` para funcionar, lo que limita su portabilidad frente a checkpoints completos.
- La precisión en ScienceQA cae 20 puntos respecto al profesor (43,75 % frente a 63,75 %), por lo que no es adecuado para tareas de razonamiento visual en producción sin un ajuste adicional.
- La perplejidad pre-destilación era de 252.731,75, lo que evidencia una degradación severa tras la cirugía de atención que solo se corrige parcialmente con destilación; el proceso es sensible al esquema de entrenamiento.
- El modelo solo declara soporte de inglés (`en`); no hay evidencia de capacidades multilingües.
- No se documentan evaluaciones de sesgo, toxicidad o robustez, ni resultados en benchmarks generales más allá de ScienceQA.
- Riesgo de alucinación no cuantificado: al ser un modelo de 0,5B ajustado en un dominio estrecho, es esperable una fiabilidad baja fuera de ScienceQA, aunque no se aportan mediciones.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); deben tratarse como indicativos.
- La licencia MIT se aplica al artefacto publicado, pero el modelo base y la torre visual conservan sus propias condiciones, que deben revisarse antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-wgqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de WGQA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/wgqa_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
