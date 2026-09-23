# unamed12/autodl-sft-col4096-lr3_75e-7

## Resumen

`unamed12/autodl-sft-col4096-lr3_75e-7` es un ajuste fino supervisado (SFT) completo del modelo denso Qwen3-8B, publicado por el usuario `unamed12` en HuggingFace. Se trata de un experimento de entrenamiento, no de un modelo con soporte o documentación de producto: el repositorio acumula 0 descargas y 0 "likes", el acceso está restringido (gated) y la model card no incluye datos de entrenamiento, idiomas ni resultados de evaluación. El identificador del run (`autodl-sft-col4096-lr3_75e-7`) apunta a un entrenamiento realizado en AutoDL con SFT, ventana de entrenamiento de 4096 tokens y una tasa de aprendizaje de 3,75e-7.

El interés técnico del modelo es acotado pero concreto. Al derivar de Qwen3-8B, hereda una arquitectura transformer densa de 8.190.735.360 parámetros (8,19 mil millones) con los pesos en safetensors y un tamaño de repositorio de 16,4 GB, coherente con un fine-tune completo en bf16/fp16. Su relevancia para un desarrollador es la de un caso de estudio: sirve para observar cómo se comporta un SFT de razonamiento con learning rate muy bajo y contexto corto (4096) sobre una base capaz de manejar ventanas mucho mayores.

Es importante subrayar que no hay evidencia publicada de que este checkpoint supere a su modelo base en ninguna tarea. La única entrada de la model-index declara la tarea `reasoning-sft_cbhint_m5k_bs16_lr3.75e-7_col4096` con un array de resultados vacío, por lo que cualquier uso en producción debería ir precedido de una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado del modelo base Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con ventana de 4096 tokens segun el identificador del run; contexto operativo del fine-tune no verificado |
| Tipos de cuantizacion | No disponibles (no se publican ficheros GGUF, AWQ ni GPTQ en el repositorio) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Otra (`license:other`), con acceso restringido que requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors (fine-tune completo, ~16,4 GB en el repositorio) |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino completo ("full", segun las etiquetas del repositorio) del modelo Qwen3-8B, no un adaptador LoRA. Esto implica que todos los pesos del transformer fueron actualizados durante el entrenamiento, lo que explica el tamaño de 16,4 GB del repositorio para 8,19 mil millones de parámetros. La herramienta de entrenamiento declarada es LLaMA-Factory, y el pipeline publicado es `text-generation` con etiquetas de compatibilidad con `text-generation-inference` y endpoints.

El nombre del run (`reasoning-sft_cbhint_m5k_bs16_lr3.75e-7_col4096`) es la única fuente de información sobre el proceso de entrenamiento y sugiere: una tarea de SFT orientada a razonamiento, un dataset de aproximadamente 5000 muestras (el segmento `m5k`), un tamano de lote de 16 (`bs16`), una tasa de aprendizaje de 3,75e-7 (`lr3.75e-7`) y una longitud de secuencia de 4096 tokens (`col4096`). No se especifica la composición del dataset (el segmento `cbhint` no está documentado en la información disponible), ni el número total de tokens de entrenamiento, ni si se aplicaron etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de las que ya incorpora el modelo base.

## Capacidades

- No hay documentación publicada de capacidades específicas del fine-tune. Las siguientes se deducen del modelo base Qwen3-8B y **no están verificadas** para este checkpoint.
- Generación de texto conversacional (el repositorio declara la etiqueta `conversational`).
- Razonamiento multi-paso, presumiblemente reforzado por el SFT sobre datos de razonamiento indicado en el nombre del run.
- Generación de código y resolución de problemas matemáticos, como capacidades heredadas de la familia Qwen3.
- Modo "thinking" y modo directo (dual-mode reasoning), característica de Qwen3.
- Soporte multilingüe: no declarado para este checkpoint; el modelo base cubre más de 100 idiomas, pero la cobertura real tras el SFT es desconocida.
- Tool calling / function calling: no declarado; el repositorio no incluye plantilla de herramientas propia.
- Uso como agente multi-paso: no documentado.
- Capacidades de visión o audio: no, el modelo base es exclusivamente de texto.

## Casos de uso

- **Evaluación comparativa de recetas de SFT**: el checkpoint permite reproducir y contrastar el efecto de un learning rate muy bajo (3,75e-7) y una ventana de 4096 tokens frente a otras configuraciones, por ejemplo el run hermano `unamed12/autodl-sft-col6144` con contexto de 6144.
- **Investigación sobre razonamiento con datasets pequeños**: con aproximadamente 5000 muestras de entrenamiento, es un punto de partida adecuado para estudiar cuánto razonamiento se puede inyectar con presupuestos de datos reducidos.
- **Prototipado interno de asistentes conversacionales**: el modelo está etiquetado como conversacional y admite el pipeline `text-generation` de Transformers, por lo que puede integrarse en un prototipo de chat siempre que se acepte su licencia y se asuma la falta de benchmarks.
- **Base para comparaciones de cuantización**: al ser un fine-tune completo en safetensors de 8,19 B, se puede cuantizar a 8 bits o 4 bits con herramientas estándar y medir la degradación respecto al checkpoint original, algo útil para estudiar robustez de pesos ajustados a precisión reducida.
- **Bancos de pruebas de infraestructura de inferencia**: sirve para validar despliegues con vLLM, SGLang o TGI usando un modelo de 8 B de la familia Qwen3 antes de pasar a checkpoints más grandes, ya que la arquitectura es la estándar de Qwen3-8B.
- **Auditoría de reproducibilidad en HuggingFace**: con 0 descargas, licencia `other` y sin model card detallada, es un ejemplo útil para analizar cómo evaluar la fiabilidad de un checkpoint publicado sin documentación.
- **Ajuste adicional (continued fine-tuning)**: al ser un fine-tune completo, puede servir como inicialización para un SFT posterior específico de dominio, aunque la ausencia de evaluación previa hace recomendable partir del Qwen3-8B original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model-index del repositorio declara una única entrada, `reasoning-sft_cbhint_m5k_bs16_lr3.75e-7_col4096`, pero su array de resultados está vacío. No existen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba para este checkpoint, y no se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia (solo pesos)**: ~16,4 GB en bf16/fp16 (los 8,19 B parámetros del repositorio).
- **VRAM estimada con caché KV**: ~18-22 GB en bf16 para ventanas de contexto moderadas; el consumo crece con la longitud de secuencia.
- **Cuantización a 8 bits**: ~9-10 GB de pesos, desplegable en GPUs de 12-16 GB.
- **Cuantización a 4 bits**: ~5-6 GB, desplegable en GPUs de consumo de 8 GB o superiores.
- **GPU recomendadas**: A100 40 GB u 80 GB, H100, L40S y RTX 4090 (24 GB, cabe en bf16 con margen ajustado). En RTX 3090 (24 GB) también es viable en bf16.
- **GPU de consumo**: sí, cabe en RTX 4090 y RTX 3090 en bf16, y en tarjetas de 8-12 GB si se cuantiza a 4 u 8 bits.
- **Opciones de despliegue**: Transformers (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM, SGLang, y llama.cpp/Ollama tras convertir los pesos a GGUF.
- **Latencia y throughput**: no disponibles. No hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unamed12/autodl-sft-col4096-lr3_75e-7` | 8,19 B | Entrenado a 4096 tokens (contexto operativo no verificado) | Ninguno (model-index vacia) | `other`, acceso restringido | Gated en HuggingFace, 0 descargas |
| Qwen3-8B (modelo base) | 8,19 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Sí, publicados por el equipo de Qwen | Apache 2.0 | Abierto y ampliamente descargado |
| `unamed12/autodl-sft-col6144` (modelo hermano) | No indicado en la informacion disponible (previsiblemente ~8 B) | Entrenado a 6144 tokens | No se han encontrado resultados publicados | No disponible en la informacion | Gated en HuggingFace |
| Llama 3.1 8B Instruct (alternativa de tamano similar) | 8,03 B | 128.000 tokens | Sí, publicados por Meta | Llama 3.1 Community License | Abierto con condiciones de uso |

La comparación relevante es con el propio Qwen3-8B: el fine-tune no ha demostrado ninguna mejora medible sobre su base y pierde la documentación, la licencia Apache 2.0 y la ausencia de restricciones de acceso que sí ofrece el modelo original.

## Limitaciones y advertencias

- **Ausencia total de evaluación**: no hay benchmarks, ni métricas de pérdida, ni comparaciones con el modelo base. Se desconoce si el fine-tune mejora, iguala o degrada el rendimiento original.
- **Sesgos**: no hay ninguna auditoría de sesgos publicada. Al ser un SFT sobre un dataset no documentado (el segmento `cbhint` no está explicado), el modelo puede haber amplificado sesgos presentes en esos datos.
- **Riesgo de alucinación**: no cuantificado. No se ha evaluado la fidelidad factual del checkpoint.
- **Degradación potencial por contexto**: el entrenamiento se realizó con ventanas de 4096 tokens, muy por debajo del contexto nativo de Qwen3-8B. Es probable que el rendimiento se degrade en secuencias largas, aunque esto no está confirmado experimentalmente.
- **Idiomas**: no declarados. No se puede asumir que el comportamiento multilingüe del modelo base se conserve tras el SFT.
- **Licencia restrictiva e incierta**: la licencia es `other`, sin texto aclaratorio en la información disponible, y el acceso está restringido mediante condiciones que hay que aceptar en HuggingFace. Antes de cualquier uso comercial es imprescindible revisar los términos exactos.
- **Caveat de procedencia**: el autor no ofrece model card explicativa, no hay paper asociado y el repositorio tiene 0 descargas y 0 "likes". Es un artefacto de experimento, no un modelo mantenido, por lo que no cabe esperar correcciones de errores ni soporte.
- **Fecha de publicación anómala**: los metadatos indican creación y actualización en septiembre de 2026, dato que conviene verificar directamente en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unamed12/autodl-sft-col4096-lr3_75e-7
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo hermano con contexto 6144: https://huggingface.co/unamed12/autodl-sft-col6144
- LLaMA-Factory (herramienta de entrenamiento declarada en las etiquetas): https://github.com/hiyouga/LLaMA-Factory
- Blog oficial de la familia Qwen3 (información del modelo base): https://qwenlm.github.io/blog/qwen3/
- Informe técnico de Qwen3 (modelo base): https://arxiv.org/abs/2505.09388
