# unconst/Affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged` es un modelo de lenguaje de tipo Mixture of Experts (MoE) con 35.107 millones de parámetros totales, desarrollado por el usuario `unconst` sobre la base de un modelo previo (`Affine-5czsc2fc98-r252-merged`). Se trata de un fine-tuning mediante Offline DPO sobre pares de preferencia generados con un enfoque de "Reason v3", orientado a mejorar el razonamiento del modelo. La arquitectura se basa en la familia Qwen3.5 MoE, tal como indican las etiquetas del repositorio.

El modelo se presenta como una iteración intermedia dentro de una serie de experimentos de alineación y optimización (el nombre incluye referencias a "midrank", "longctx" y "megaextra"), lo que sugiere que está diseñado para manejar contextos largos (hasta 16384 tokens durante el entrenamiento) y para ser evaluado en tareas de razonamiento con preferencias ancladas a un profesor. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque no se proporcionan detalles sobre idiomas soportados ni sobre el rendimiento en benchmarks públicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (Mixture of Experts) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 16384 tokens (max_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura MoE de la familia Qwen3.5, aunque no se especifican los detalles internos (número de expertos, top-k, etc.). El proceso de entrenamiento consistió en un Offline DPO (Direct Preference Optimization) sobre pares de preferencia de razonamiento, donde el "elegido" se seleccionaba según una métrica de pensamiento (`lpC(y_C|z)−lpC(y_C|∅)`) anclada a un profesor. El entrenamiento se realizó con LoRA (r=32, α=128) sobre el modelo base `Affine-5czsc2fc98-r252-merged`, con un learning rate de 5e-6, β=0.02, y un máximo de 3600 pasos (detenido en 312 por agotamiento de datos). Se usó un filtro de contexto largo y rango medio ("LongCtx MidRank") sobre los datos de preferencia. El hardware de entrenamiento consistió en GPUs B200 (8×B200 en el nodo de merge). No se mencionan innovaciones arquitectónicas más allá del método de alineación.

## Capacidades

- Generación de texto y razonamiento: al ser un LLM basado en Qwen3.5 MoE, es capaz de generar texto coherente y realizar tareas de razonamiento, aunque no se han publicado evaluaciones específicas.
- Fine-tuning con DPO: el entrenamiento con Offline DPO sugiere una mejora en la alineación con preferencias humanas, especialmente en tareas de razonamiento multi-paso.
- Contexto largo: el entrenamiento con `max_len=16384` indica soporte para secuencias de hasta 16K tokens, útil para documentos extensos o conversaciones largas.
- No se documentan capacidades específicas como tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

Aunque no hay casos de uso documentados oficialmente, por su arquitectura y tamaño, el modelo podría emplearse en los siguientes escenarios:

- Asistencia conversacional con contexto largo: su ventana de 16K tokens permite mantener conversaciones multi-turno con historial extenso, adecuado para chatbots de soporte técnico.
- Análisis de documentos extensos: puede resumir o extraer información de contratos, informes o artículos de investigación de hasta 16K tokens.
- Generación de código en entornos de desarrollo: como LLM general, podría asistir en la escritura y depuración de código, aunque no se ha validado con benchmarks como HumanEval.
- Razonamiento matemático y lógico: el entrenamiento con DPO sobre pares de razonamiento sugiere utilidad en problemas que requieren cadenas de pensamiento.
- Prototipado de agentes de IA: su licencia Apache permite integrarlo en pipelines de agentes, aunque no se confirma soporte nativo para function calling.
- Investigación en alineación de modelos: al ser un experimento de DPO, puede servir como referencia para estudiar métodos de optimización de preferencias en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La model card menciona una "sim evidence" (n80) contra el modelo rey `r252`, pero no se proporcionan cifras concretas ni comparativas públicas.

## Requisitos de hardware

- VRAM estimada: con 35.107 millones de parámetros en fp16, se necesitan aproximadamente 70 GB de VRAM solo para los pesos. Si se cuantiza a 8 bits, ~35 GB; a 4 bits, ~18 GB (asumiendo que la cuantización sea posible, aunque no se han publicado versiones GGUF o AWQ).
- GPU recomendadas: para inferencia en fp16, se requieren GPUs de alta capacidad como A100 80GB, H100 80GB o B200. Con cuantización 4 bits, podría caber en una RTX 4090 (24 GB) o similar, pero no hay garantía de compatibilidad.
- Opciones de despliegue: al estar en formato safetensors, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha verificado soporte en Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (MoE de ~35B con fine-tuning DPO). Modelos como Qwen3-30B-A3B (MoE) o Mixtral 8x7B tienen tamaños similares, pero no hay datos de rendimiento de este modelo para comparar. Se recomienda consultar los benchmarks oficiales de esos modelos para una referencia.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. El entrenamiento con DPO puede mitigar algunos problemas, pero no hay evidencia.
- La longitud de contexto de 16K tokens es un límite de entrenamiento; el contexto de inferencia podría ser menor o mayor según la implementación, pero no se especifica.
- El modelo es un experimento intermedio (el nombre indica "r579-r252" y "megaextra") y no se ha validado en producción. Su rendimiento real es desconocido.
- No se documentan idiomas soportados; es probable que herede las capacidades multilingües de Qwen3.5, pero no está confirmado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r579-r252-odpo-midrank-longctx-megaextra-merged
- Modelo base (r252): https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Modelos relacionados (r29, r27): https://huggingface.co/unconst/Affine-5czsc2fc98-r29-merged y https://huggingface.co/unconst/Affine-5czsc2fc98-r27-merged
- Página de FriendliAI para un modelo similar (h1): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
