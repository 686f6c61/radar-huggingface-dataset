# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd2640-lora

## Resumen

Qwen2.5-0.5B-Instruct-xlam-mixed-opd2640-lora es un adaptador LoRA desarrollado por uygarkurt sobre el modelo instructivo Qwen2.5-0.5B-Instruct de Alibaba. El adaptador se entrena mediante destilación on-policy (OPD) para mejorar la llamada estructurada a herramientas (tool calling) y la capacidad de abstenerse cuando las herramientas ofrecidas son irrelevantes. El profesor congelado es Qwen2.5-3B-Instruct, y el alumno aprende de las probabilidades por token del profesor sobre sus propias respuestas generadas.

El modelo base es un transformer decoder-only de 0,5 mil millones de parámetros con una ventana de contexto de 32 768 tokens (según la especificación de Qwen2.5). El adaptador no modifica la arquitectura, solo ajusta los pesos mediante LoRA con PEFT. El entrenamiento consistió en 2640 actualizaciones OPD sobre el dataset mixto de tool calling del autor, con un tiempo de entrenamiento de 1,1 horas.

La relevancia de este adaptador radica en su enfoque específico: no busca mejorar el rendimiento general, sino afinar la precisión de las llamadas a funciones y la detección de irrelevancia en un modelo pequeño, lo que lo hace útil para pipelines de agentes con requisitos de latencia y coste bajos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | 0,5 mil millones (modelo base) + adaptador LoRA (rango no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32 768 tokens (modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base soporta cuantizacion GGUF/AWQ/GPTQ, pero no se especifica en la model card) |
| Idiomas soportados | Ingles (segun la model card) |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm y activación SwiGLU. El entrenamiento utiliza destilación on-policy (OPD): el alumno genera respuestas y el profesor (Qwen2.5-3B-Instruct) proporciona las probabilidades por token sobre esas mismas respuestas, de modo que el alumno aprende a imitar la distribución del profesor en su propio espacio de estados. Se realizaron 2640 actualizaciones OPD sobre el dataset `uygarkurt/xlam-tool-calling-mixed`, que combina ejemplos de llamada a herramientas con ejemplos de abstención cuando las herramientas no son relevantes.

No se especifican detalles sobre la composición exacta del dataset, el número de tokens de entrenamiento, la configuración de LoRA (rango, alpha, módulos objetivo) ni si se aplicaron técnicas adicionales como RLHF o DPO. El tiempo de entrenamiento reportado es de 1,1 horas para el bucle de entrenamiento, excluyendo carga de modelos y evaluación.

## Capacidades

- Generación de texto conversacional en inglés.
- Llamada estructurada a herramientas (tool calling) con formato JSON, entrenada específicamente para este fin.
- Abstención cuando las herramientas ofrecidas no son relevantes para la consulta del usuario.
- Razonamiento básico y matemáticas (herencia del modelo base, con rendimiento limitado por el tamaño).
- Capacidad multilingüe limitada: la model card solo declara inglés, aunque el modelo base Qwen2.5 soporta varios idiomas.
- No se menciona soporte explícito para agentes multi-paso, visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Automatización de atención al cliente con herramientas: el adaptador puede generar llamadas a funciones para consultar pedidos, devoluciones o estado de cuenta, y abstenerse cuando la consulta no requiere ninguna herramienta disponible, gracias a su entrenamiento específico en relevancia e irrelevancia.
- Orquestación de agentes ligeros: en pipelines donde se necesita un modelo pequeño que decida qué función invocar en cada turno, con latencia baja y coste reducido, el adaptador ofrece una precisión de llamada exacta del 65,95% en xLAM ETC.
- Enrutamiento de consultas en sistemas RAG: el modelo puede clasificar si una pregunta requiere una llamada a API externa o si debe responderse directamente, usando la métrica de irrelevancia entrenada.
- Prototipado rápido de asistentes con function calling: al ser un adaptador LoRA sobre un modelo de 0,5B, se puede desplegar en entornos con recursos limitados (CPU o GPU de gama baja) para validar flujos de herramientas antes de escalar a modelos mayores.
- Filtrado de consultas irrelevantes en producción: la capacidad de abstención permite descartar llamadas a herramientas innecesarias, reduciendo costes de API y latencia en sistemas de agentes.
- Educación y experimentación: el adaptador y su pipeline de entrenamiento (Post-Training Lab) sirven como ejemplo reproducible de destilación on-policy para tool calling en modelos pequeños.

## Benchmarks y rendimiento

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Time (hours) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% | — |
| OPD (this adapter) | OPD 2,640 | 42,16% | 14,20% | 28,47% | 65,95% | 90,26% | 54,23% | 88,89% | 56,69% | 1,1 |

Notas: xLAM ETC es precisión exacta de llamada a herramienta; xLAM FNA es precisión de nombre de función. Las evaluaciones xLAM usan el split de test del dataset mixto con 2546 ejemplos evaluados y 743 omitidos por el límite de 640 tokens de prompt. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance reportan los subconjuntos seleccionados de relevancia. IFEval usa precisión estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts personalizados de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en fp16 requiere aproximadamente 1 GB de VRAM; en cuantización de 8 bits, unos 0,5 GB; en 4 bits, unos 0,3 GB. El adaptador LoRA añade una sobrecarga mínima (unos pocos MB).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060, etc.). Para mayor throughput, se recomienda RTX 4090 o A100, aunque el modelo es pequeño y no aprovecha plenamente estas GPU.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU.
- Opciones de despliegue: transformers con PEFT, vLLM (soporte de adaptadores LoRA), llama.cpp (si se convierte a GGUF), Ollama (mediante conversión), TGI (con soporte de adaptadores).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct-xlam-mixed-opd2640-lora | 0,5B + LoRA | 32 768 | Entrenado específicamente (xLAM ETC 65,95%) | No disponible | Hugging Face |
| Qwen2.5-0.5B-Instruct (base) | 0,5B | 32 768 | No específico (xLAM ETC 62,61%) | Apache 2.0 (según Qwen) | Hugging Face |
| Qwen2.5-3B-Instruct (profesor) | 3B | 32 768 | Genérico | Apache 2.0 (según Qwen) | Hugging Face |
| Otros adaptadores LoRA para tool calling en modelos pequeños | Variable | Variable | Variable | Variable | No disponible |

No se dispone de datos de benchmarks de otros adaptadores comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente en inglés; su rendimiento en otros idiomas no está evaluado y probablemente sea limitado.
- La licencia no está especificada en la model card, lo que impide confirmar si se permite uso comercial. Se debe contactar con el autor o asumir la licencia del modelo base (Apache 2.0 para Qwen2.5) con cautela.
- El modelo base de 0,5B tiene capacidades limitadas de razonamiento y matemáticas (MATH-500 del 14,20% tras el adaptador, inferior al 15,80% del base), por lo que no es adecuado para tareas complejas.
- La métrica de irrelevancia empeora tras el entrenamiento (56,69% frente a 66,93% del base), lo que indica un posible sesgo hacia llamadas a herramientas incluso cuando no son relevantes. Esto debe tenerse en cuenta en producción.
- Riesgo de alucinación en llamadas a funciones: aunque la precisión de nombre de función es alta (90,26%), la precisión exacta de llamada es del 65,95%, lo que implica que un tercio de las llamadas pueden ser incorrectas en formato o argumentos.
- El adaptador se distribuye como pesos PEFT; requiere cargar el modelo base Qwen2.5-0.5B-Instruct, lo que añade complejidad de despliegue frente a un modelo completo.
- No se especifican sesgos conocidos, pero al entrenarse en un dataset específico de tool calling, puede heredar sesgos de ese dataset.
- El límite de 640 tokens de prompt en la evaluación sugiere que el entrenamiento pudo haberse realizado con prompts cortos, lo que puede limitar el rendimiento en contextos largos.

## Enlaces

- Hugging Face: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd2640-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio Post-Training Lab: https://github.com/uygarkurt/post-training-lab
