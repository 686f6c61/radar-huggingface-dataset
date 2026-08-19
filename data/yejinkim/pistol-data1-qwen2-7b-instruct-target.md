# yejinkim/pistol-data1-Qwen2-7B-Instruct-target

## Resumen

El modelo `yejinkim/pistol-data1-Qwen2-7B-Instruct-target` es un checkpoint derivado de `Qwen/Qwen2-7B-Instruct` mediante fine-tuning completo (sin LoRA) sobre el dataset sintético PISTOL Sample Dataset 1. Este dataset contiene 400 pares pregunta-respuesta generados artificialmente, distribuidos en 20 aristas de un grafo de conocimiento. El modelo está diseñado específicamente como "target model" para experimentos de machine unlearning estructural, tal como se describe en el paper PISTOL (arXiv:2406.16810). Su propósito es servir de punto de partida para que los métodos de desaprendizaje olviden una arista del grafo y se mida el daño colateral en aristas vecinas o desconectadas.

El checkpoint está construido para que, al mismo tiempo que memoriza perfectamente los datos sintéticos (ROUGE-L recall de 1.000 en las aristas de olvido y retención), conserve el conocimiento real del modelo preentrenado en un conjunto de control (TOFU real_authors + world_facts) con una media de 0.873, lo que permite atribuir cualquier degradación posterior al proceso de unlearning y no al propio fine-tuning. Con 7.615.616.512 parámetros, es un modelo denso de 7B, heredado de la arquitectura Qwen2, con licencia Apache-2.0. No está pensado para uso general, sino para investigación en el ámbito del desaprendizaje en modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no indicada en la card) |
| Tipos de cuantizacion | no disponible (solo se ofrece en safetensors bf16) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero la card no especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `Qwen/Qwen2-7B-Instruct`, un transformer denso de 7.07B parámetros según la documentación de Qwen2. El entrenamiento se realizó sobre el dataset PISTOL Sample Dataset 1, que consiste en 400 pares QA generados sintéticamente (20 aristas de un grafo de conocimiento × 20 preguntas por arista). Se usó full fine-tuning (sin LoRA), con una tasa de aprendizaje de 1e-5, 20 épocas, batch efectivo de 16, warmup de 1 época, optimizador AdamW con weight decay 0.01 y precisión bf16. El formato de prompt sigue la plantilla del modelo base; las respuestas son campos de contrato cortos (media de 1.6 palabras), por ejemplo: `[INST] What was the effective date of the contract between Qpubwe PLC and Jzrcws SA? [/INST] 02-09-2019.`

El fine-tuning se diseñó para que el modelo memorice perfectamente los datos del benchmark (ROUGE-L recall 1.000) mientras conserva el conocimiento real del modelo base. La card indica que un fine-tuning con la misma configuración pero con lr 1e-4 colapsa el conjunto de control (ROUGE-L 0.009), mientras que con lr 1e-5 se mantiene al 91,5% del rendimiento del base. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: capaz de responder las preguntas del dataset PISTOL con alta fidelidad (ROUGE-L 1.000), pero solo sobre los contratos sintéticos.
- Razonamiento: mantiene el conocimiento general del modelo base (control set con ROUGE-L 0.873), por lo que puede responder preguntas de conocimiento común.
- No se reportan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se indica soporte de visión, audio u otras modalidades.
- Multilingüismo: no especificado en la card, aunque el modelo base Qwen2-7B-Instruct es multilingüe (soporta 29 idiomas). Este checkpoint hereda esa capacidad, pero no se ha validado en este fine-tune.

## Casos de uso

- **Investigación en machine unlearning estructural**: el modelo sirve como target para experimentos donde se olvida una arista del grafo de conocimiento y se mide el daño colateral en aristas a 1 hop, 2 hops y desconectadas. Se usa para evaluar métodos de desaprendizaje como PISTOL.
- **Evaluación de robustez de técnicas de unlearning**: comparar el rendimiento de distintos algoritmos (gradient ascent, relabeling, etc.) sobre el mismo target, midiendo ROUGE-L en las aristas de olvido y retención.
- **Análisis de trade-off entre olvido y retención**: estudiar cómo el proceso de unlearning afecta al conocimiento general del modelo, usando el control set (TOFU real_authors + world_facts) como métrica de referencia.
- **Investigación sobre datos sintéticos**: validar métodos de generación de datos sintéticos para benchmarks de unlearning, ya que PISTOL es completamente sintético y evita la contaminación de los modelos preentrenados.
- **Desarrollo de técnicas de desaprendizaje selectivo**: probar nuevas arquitecturas o algoritmos de unlearning sobre este target, comparando con el base model para aislar el efecto del fine-tuning.
- **Reproducción de resultados**: el checkpoint está diseñado para reproducir los experimentos del paper PISTOL, permitiendo a otros investigadores replicar y extender los resultados.

## Benchmarks y rendimiento

La card reporta los siguientes resultados de ROUGE-L recall sobre el propio modelo:

| Metrica | Este target | Modelo base |
|---|---|---|
| PISTOL forget-edge ROUGE-L recall | 1.000 | 0.020 |
| PISTOL retain ROUGE-L recall | 1.000 | ~0.08 |
| TOFU real_authors + world_facts (media ROUGE-L) | 0.873 | 0.954 |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo no está diseñado para tareas de propósito general, por lo que los únicos datos de rendimiento relevantes son los relativos al dataset PISTOL y al control de conocimiento real.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 7.615.616.512 parámetros. En bf16, el checkpoint ocupa 15.2 GB (tamaño del repo). Para inferencia con precisión completa (bf16), se necesitan al menos 16 GB de VRAM (por ejemplo, en una RTX 4090 con 24 GB o una A100 de 40 GB). Con cuantización 4-bit (no proporcionada en el repo, pero posible con herramientas como llama.cpp o vLLM), se podría reducir a ~4-5 GB, aunque no se han publicado pesos cuantizados.
- **GPU recomendadas**: A100 (40 GB), H100 (80 GB), RTX 4090 (24 GB), o cualquier GPU con ≥16 GB de VRAM para inferencia en bf16. Para entrenamiento (fine-tuning o unlearning), se requiere al menos 40 GB (A100) o más.
- **Opciones de despliegue**: se puede cargar con la librería `transformers` (PyTorch) para inferencia y experimentos. Para despliegue en producción, vLLM o TGI pueden servir, aunque el modelo no está pensado para uso general. También es compatible con Ollama si se convierte a GGUF, pero no se proporcionan dichos pesos.
- **Latencia y throughput**: no disponibles. Dado el tamaño de 7B, se espera una latencia de decenas de milisegundos por token en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ROUGE-L (control) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yejinkim/pistol-data1-Qwen2-7B-Instruct-target` (este) | 7.615M | no disponible | 0.873 | Apache-2.0 | HuggingFace |
| `Qwen/Qwen2-7B-Instruct` (base) | 7.07B | 32k (según documentación) | 0.954 | Apache-2.0 | HuggingFace |
| `yejinkim/pistol-data1-Qwen2-7B-Instruct-target` (con lr 1e-4) | 7.615M | no disponible | 0.009 | Apache-2.0 | no publicado |

La comparativa se limita al modelo base y a la variante con lr 1e-4 mencionada en la card (no publicada). No hay otros modelos de la misma categoría (targets de unlearning) en la información disponible. El modelo base tiene mejor rendimiento en control de conocimiento real, pero no ha memorizado los datos PISTOL. El checkpoint con lr 1e-4 colapsa por completo el control, lo que demuestra que el lr 1e-5 es crítico para conservar la funcionalidad del modelo.

## Limitaciones y advertencias

- **Uso no generalista**: el modelo está específicamente entrenado para memorizar contratos sintéticos ficticios. No debe usarse en aplicaciones reales de generación de texto, ya que producirá respuestas sin sentido sobre entidades y fechas aleatorias.
- **Sesgos y alucinaciones**: al estar fine-tuneado con datos sintéticos, el modelo puede alucinar información de contratos en cualquier pregunta, incluso fuera del dominio PISTOL. No se ha evaluado su comportamiento en tareas de propósito general.
- **Riesgo de colapso**: si se usa para inferencia fuera de las 400 QA de entrenamiento, es probable que genere respuestas de estilo "contrato" (cadenas de texto sin sentido), como se observa en el experimento con lr 1e-4.
- **Contexto e idioma**: no se especifica la longitud de contexto ni los idiomas soportados en la card; se asume que hereda las capacidades del modelo base, pero no se han validado.
- **Restricciones de licencia**: aunque la licencia es Apache-2.0, el modelo es un derivado de Qwen2-7B-Instruct, que también es Apache-2.0. Sin embargo, el dataset PISTOL tiene su propia licencia (ver dataset `xinchiqiu/PISTOL`), que debe respetarse si se utiliza para otros fines.
- **No apto para producción**: no se recomienda su uso en aplicaciones comerciales o sistemas de producción, ya que su único propósito es servir como target en experimentos de unlearning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yejinkim/pistol-data1-Qwen2-7B-Instruct-target
- Paper PISTOL: https://arxiv.org/abs/2406.16810
- Dataset PISTOL: https://huggingface.co/datasets/xinchiqiu/PISTOL
- Modelo base Qwen2-7B-Instruct: https://huggingface.co/Qwen/Qwen2-7B-Instruct
- Informe técnico de Qwen2: https://arxiv.org/html/2407.10671v1
