# thefinalboss/fractus-vorax

## Resumen

Fractus-Vorax es un sistema de ingesta de conocimiento sin entrenamiento, desarrollado por el autor thefinalboss como extensión de la línea Fractus. Se basa en un cerebro de 1.165 mil millones de parámetros (el checkpoint `FRACTUS_1B_PHASE2_FROZEN_MERGED.pt`), cuyos pesos quedan sellados en memoria de solo lectura y nunca vuelven a recibir gradientes. Todo conocimiento nuevo llega mediante compilación a ficheros `.kn` que se escriben en unos órganos de memoria de hypervectores, sin necesidad de reentrenamiento, GPU ni modelos externos.

El modelo aborda un problema clásico: cómo actualizar un modelo con datos nuevos sin incurrir en retraining ni en olvido catastrófico. En lugar de una arquitectura transformer clásica, emplea un sistema dinámico con pensamiento continuo, expertos ruteados por Kuramoto y memoria append-only. El resultado es un sistema que puede crecer físicamente por cada dataset ingerido (spawning de expertos), responder con 0.00 en hechos que no ha ingerido y ejecutarse en CPU de portátil. Su licencia MIT permite uso comercial y académico sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fractus (no transformer): sistema dinámico con continuous thought, expertos Kuramoto-routed top-2 de 128, memoria vector-simbólica |
| Parametros totales | 1.165B (cerebro CTE sellado; los órganos son sin parámetros) |
| Parametros activos | no disponible (MoE top-2 de 128 expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

El cerebro Fractus-Vorax es un checkpoint de la arquitectura CTE (Continuous Thought Engine) de 1.165B parámetros, con 16 bloques, dimensión 1280 y 128 expertos batched con selección top-2. Incluye estados portadores persistentes (`thought_state`, `attn_S`, `attn_z`) y cabezas de confianza y saliencia, además de una cabeza de salida atada a la de entrada. El entrenamiento original se realizó con aproximadamente 124.5 millones de tokens en 8 GPUs RTX 5090, con fusión media horaria, y el checkpoint final quedó sellado mediante `mmap` en modo solo lectura. No se menciona uso de RLHF ni DPO.

Sobre este cerebro, Fractus-Vorax añade tres órganos sin parámetros: TRACES (memoria hippocampus de hypervectores con recuperación LSH), HEBBIAN (escrituras de producto exterior con compuerta de energía) y SPAWN (creación de un experto por dataset, ruteado por firma HV). La decodificación emplea un mecanismo anti-atractor con z-normalización de logits y steering por órganos, lo que evita el colapso en repetición que sufre el cerebro sellado con decodificación greedy.

## Capacidades

- Generación de texto en inglés a partir de un cerebro sellado de 1.165B, con decodificación anti-atractor que evita la repetición.
- Ingestión de conocimiento sin entrenamiento: compila datos (CSV, JSON, JSONL, TXT, MD, etc.) a ficheros `.kn` mediante operaciones cerradas (hash, conteo, SVD) y los escribe en órganos de memoria.
- Memoria permanente y append-only: el sistema no puede olvidar hechos ingeridos, ya que la memoria solo admite escrituras.
- Generalización por analogía morfológica: usa 3CosAdd y 3CosMul sobre slots de caracteres n-gram, lo que permite responder por similitud morfológica.
- Crecimiento físico por dataset: cada nuevo dataset genera un experto ruteado, sin entrenamiento conjunto (MoE físico).
- Respuesta honesta ante desconocidos: mide 0.00 en hechos que nunca ha ingerido, en lugar de alucinar con confianza.
- Aprendizaje en conversación: las conversaciones se escriben de vuelta en los órganos con complejidad O(1), por lo que el sistema aprende mientras habla.
- Ejecución en CPU de portátil sin dependencias de GPU, con núcleos opcionales de CTE/Fractal en torch CPU.

## Casos de uso

- Ingestión de documentación técnica corporativa: se compilan manuales o wikis a ficheros `.kn` y el sistema responde preguntas sobre ellos, sin necesidad de reentrenar el modelo base. Adecuado porque la ingesta es determinista y no requiere GPU.
- Preguntas y respuestas sobre datos tabulares: al ingerir un CSV con registros de clientes o inventario, el modelo puede responder consultas específicas con memoria permanente, evitando el olvido catastrófico de modelos finetuned.
- Asistente de conocimiento de dominio para soporte: un equipo de soporte ingesta FAQs y guías de producto; el sistema responde con hechos verificados y marca con 0.00 las preguntas fuera de su conocimiento, lo que permite detectar lagunas.
- Sistema de aprendizaje continuo en producción: una aplicación que registra interacciones de usuario y las escribe de vuelta en los órganos, de modo que el modelo mejora sus respuestas sin intervención humana ni entrenamiento.
- Prototipo de agente con conocimiento específico: se puede construir un agente que ingesta documentación de una API y responde preguntas de integración, usando el ruteo por expertos para separar dominios.
- Auditoría de lagunas de conocimiento: la propiedad de responder 0.00 en hechos no ingeridos permite a un equipo identificar qué información falta en su base de conocimiento y añadirla de forma dirigida.
- Investigación en arquitecturas no transformer: sirve como banco de pruebas para estudiar sistemas dinámicos, memoria hypervectorial y decodificación anti-atractor en un entorno reproducible con tests (199 tests incluidos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el modelo responde 0.00 en hechos no ingeridos (medido) y que generaliza por analogía, pero no se aportan cifras de MMLU, HumanEval, GSM8K u otros estándar. No se dispone de datos de latencia o throughput publicados.

## Requisitos de hardware

- CPU de portátil: el substrato (órganos) funciona con numpy y Python ≥3.10, sin necesidad de torch.
- Torch CPU opcional: para los kernels nativos CTE/Fractal se instala torch CPU (sin CUDA).
- VRAM: no se requiere GPU para inferencia ni para ingesta; el cerebro se carga con `mmap` en modo solo lectura desde disco.
- Hardware de entrenamiento: el checkpoint sellado se entrenó con 8× RTX 5090, pero no es necesario para usar el modelo.
- Despliegue: se ejecuta como REPL con `python -m fractus_vorax.agent.repl`, sin soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay modelos directamente comparables, ya que Fractus-Vorax es un sistema no transformer con ingesta de conocimiento sin entrenamiento y memoria permanente. En la categoría de modelos de 1B de propósito general (por ejemplo, TinyLlama 1.1B o Qwen1.5B), la diferencia fundamental es que estos requieren fine-tuning o RAG para incorporar conocimiento nuevo, mientras que Fractus-Vorax lo hace por escritura directa en órganos. Sin embargo, no se han publicado benchmarks comparativos, por lo que no es posible evaluar rendimiento relativo.

## Limitaciones y advertencias

- Idioma: solo inglés; no soporta español ni otros idiomas.
- Sin benchmarks publicados: no hay datos objetivos de calidad en tareas estándar (MMLU, HumanEval, etc.), lo que impide una evaluación comparativa rigurosa.
- Riesgo de colapso de decodificación: sin el mecanismo anti-atractor (z-normalización), el cerebro sellado produce repeticiones infinitas; el sistema depende críticamente de esta corrección.
- Alucinación en hechos ingeridos: aunque responde 0.00 en hechos no ingeridos, la generalización por analogía puede producir respuestas incorrectas en datos que sí ha ingerido si la morfología es similar.
- Sin contexto de ventana clásico: no se especifica una longitud de contexto en tokens; la memoria es append-only pero no se documenta cómo se gestionan límites de recuperación.
- Proyecto sin adopción: tiene 0 descargas y 0 likes en HuggingFace, por lo que su estabilidad y soporte no están contrastados en producción.
- Licencia MIT permite uso comercial, pero no hay garantías de mantenimiento ni de corrección de errores.

## Enlaces

- [HuggingFace: thefinalboss/fractus-vorax](https://huggingface.co/thefinalboss/fractus-vorax)
- [HuggingFace Space: Fractus CTE Wiki](https://huggingface.co/spaces/thefinalboss/fractus-cte-wiki)
- [HuggingFace: thefinalboss/Fractus (modelo padre)](https://huggingface.co/thefinalboss/Fractus)
- [HuggingFace Datasets: thefinalboss/fractus-datasets](https://huggingface.co/datasets/thefinalboss/fractus-datasets)
