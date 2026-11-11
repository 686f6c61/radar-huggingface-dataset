# tahamajs/llava-qwen-0.5b-residual-svd-attention-scienceqa

## Resumen

`llava-qwen-0.5b-residual-svd-attention-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el usuario tahamajs dentro del ecosistema NeuralOps, una librería propia de "cirugía de atención" sobre modelos preentrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (una variante LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 0,5 mil millones de parámetros) y sustituye el mecanismo de auto-atención en 18 de sus 24 capas por un operador denominado `ResidualSVDAttention` (atención SVD residual de bajo rango).

No se trata de un modelo entrenado desde cero ni de un lanzamiento de un laboratorio: es un artefacto de investigación que empaqueta únicamente los pesos delta de las capas de atención modificadas (40,46 MB en safetensors FP16, frente a los 1,66 GB del modelo base completo). El problema que aborda es la compresión de mecanismos de atención mediante descomposición SVD con residual, evaluando la pérdida de calidad resultante sobre un subconjunto de ScienceQA con imágenes.

Su relevancia es acotada pero clara para quien investigue compresión de transformers multimodales: demuestra un flujo completo de destilación de conocimiento sobre capas de atención quirúrgicamente reemplazadas, con métricas declaradas de precisión y perplejidad antes y después de la destilación. No obstante, la precisión final (28,75 %) está muy por debajo del profesor original (63,75 %), por lo que debe interpretarse como una prueba de concepto, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas, D=1024, H=16, head_dim=64) con auto-atención sustituida por ResidualSVDAttention en 18 de 24 capas |
| Parametros totales | No disponible de forma explícita; el modelo base es de 0,5 mil millones de parámetros, pero el artefacto publicado solo contiene los pesos delta de atención (336 tensores, 42.423.856 bytes) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, `weights_format=attention_only_fp16`), más `surgical_manifest.json` con la topología de compresión |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA interleaved de `llava-hf/llava-interleave-qwen-0.5b-hf`: una torre visual SigLIP de 27 capas completamente congelada, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención quirúrgica reemplaza la auto-atención en 18 de las 24 capas (esquema `hybrid_3_1`) por el operador `ResidualSVDAttention`, que descompone la proyección de atención en componentes de bajo rango mediante SVD y añade una conexión residual para preservar la información descartada por el truncamiento espectral. Se mantienen como "anclas cuadráticas" seis capas sin modificar (índices 3, 7, 11, 15, 19 y 23), y se congelan la torre visual, el proyector, los MLP del decodificador y los embeddings.

El entrenamiento consiste en una destilación de conocimiento en dos etapas (95 pasos en la etapa 1 y 147 en la etapa 2, 242 pasos totales) ejecutada sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 16.574 MB y una duración total de 120,1 segundos. Solo se entrenan las atenciones modificadas y las capas de normalización del decodificador. El dataset de evaluación es el subconjunto con imágenes de ScienceQA (validación), del repositorio `derek-thomas/ScienceQA`. No se documentan el volumen de tokens de entrenamiento, la composición exacta del dataset de destilación ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional en formato interleaved (múltiples imágenes y turnos).
- Respuesta a preguntas visuales (VQA) sobre figuras y diagramas, orientada al dominio STEM de ScienceQA.
- Razonamiento multimodal de opción múltiple con selección de letra de respuesta.
- Soporte de plantilla de chat (`chat_template.json`) para conversaciones multi-turno.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking).
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Investigación en compresión de atención: el artefacto permite reproducir el flujo de sustitución de capas de auto-atención por operadores SVD de bajo rango y medir el impacto en precisión y perplejidad sobre un benchmark controlado.
- Estudio de destilación de conocimiento en modelos multimodales pequeños: las métricas pre-KD (31,25 % de precisión, PPL 19,50) y post-KD (28,75 %, PPL 3,07) permiten analizar cómo la destilación recupera fluidez a costa de precisión en tareas de razonamiento.
- Prototipado de VQA educativa de bajo coste: con 0,5 mil millones de parámetros y un artefacto de 40 MB, sirve para validar pipelines de preguntas sobre diagramas STEM antes de escalar a modelos mayores.
- Benchmarking de operadores de atención alternativos: útil como línea base frente a otras variantes del "Attention Surgery Zoo" de NeuralOps (por ejemplo, atención lineal o dispersa) sobre el mismo subconjunto de ScienceQA.
- Docencia y experimentación académica: el tamaño reducido y el entrenamiento en una sola RTX 3090 lo hacen adecuado para prácticas de cirugía de modelos y análisis espectral de matrices de atención.
- Verificación de infraestructura NeuralOps: sirve para probar la API `neuralops.hub.load_surgeried_model` y el formato `neuralops.surgery/v2` en entornos de integración continua.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imágenes STEM, split de validación:

| Metrica | Profesor (base) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 31,25 | 28,75 | -2,50 |
| Perplejidad | 2,45 | 19,50 | 3,07 | -16,43 |

Telemetría de entrenamiento declarada: 242 pasos de optimización (95 en etapa 1, 147 en etapa 2), 120,1 segundos, RTX 3090 con 16.574 MB de VRAM en pico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base LLaVA-Qwen-0.5B ocupa 1,66 GB en FP16; el artefacto publicado son solo pesos delta de atención (40,46 MB) que deben combinarse con el modelo base para inferir.
- GPU recomendadas: el autor entrenó en una NVIDIA RTX 3090 (24 GB); por tamaño, el modelo base en FP16 debería caber en GPUs consumer con 8 GB o más, aunque no se documentan pruebas de inferencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060/4060 y superiores, dado el tamaño del modelo base; no confirmado por el autor.
- Opciones de despliegue: la model card solo documenta la API propietaria `neuralops.hub.load_surgeried_model`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA (val, con imágenes) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-residual-svd-attention-scienceqa` | ~0,5 B (delta de atención: 42,4 MB) | No disponible | 28,75 % | MIT | Hugging Face (0 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | No disponible | 63,75 % (declarado por el autor) | No disponible en la información | Hugging Face |
| Otros modelos LLaVA-Qwen de 0,5 B | ~0,5 B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de terceros para establecer comparaciones adicionales con modelos de la misma categoría.

## Limitaciones y advertencias

- Precisión final de 28,75 % en ScienceQA, muy inferior al profesor (63,75 %): el modelo no es apto para uso en producción sin un ajuste adicional.
- El artefacto publicado no es un modelo autónomo: contiene solo los pesos delta de atención y requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` mediante la librería NeuralOps.
- Idiomas: únicamente inglés; no hay soporte multilingüe documentado.
- Dominio restringido: entrenado y evaluado sobre ScienceQA (STEM con imágenes); el rendimiento fuera de ese dominio es desconocido.
- Riesgo de alucinación: no evaluado por el autor; en modelos de 0,5 B es habitual en tareas de razonamiento visual.
- Sesgos: no documentados.
- Resultados de benchmarks no verificados (`verified: false` en el model-index); deben tratarse como declaraciones del autor.
- Licencia MIT: permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha.
- Dependencia de una librería no estándar (`neuralops`) y de un formato de manifiesto propio (`neuralops.surgery/v2`), lo que limita la portabilidad a otros frameworks.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-residual-svd-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/residual_svd_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
