# unconst/Affine-5czsc2fc98-r509-sbsv5-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged

## Resumen

Affine-5czsc2fc98-r509-sbsv5-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged es un checkpoint experimental publicado por el usuario unconst en HuggingFace. Se trata de un modelo de texto y visión (image-text-to-text) basado en una arquitectura MoE derivada de Qwen3.5, con un total de 35.107.181.936 parámetros (35,1B). El nombre del repositorio indica que es un merge de LoRA sobre el modelo base kevin954/Affine-5dfqbbh8ev-sft, seguido de un proceso de optimización con DPO (offline-dpo) con hiperparámetros específicos (alpha alto, rank alto, beta bajo, contexto medio y pasos extra de entrenamiento).

La model card es extremadamente escueta: se limita a describirlo como un "H1 merged checkpoint salvage" (salvamento de checkpoint fusionado) y aclara que es un "Private TTL insurance; not a submission until Stage-5 gate clears", es decir, un checkpoint intermedio de un proceso de entrenamiento en curso, no una versión final destinada a producción. No se proporciona información sobre licencia, idiomas, contexto, benchmarks ni capacidades detalladas. A pesar de tener cero descargas y cero likes, el modelo está listado como compatible con endpoints de inferencia (endpoints_compatible) y aparece en plataformas como FriendliAI para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3.5 (tag qwen3_5_moe) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen3.5, según el tag `qwen3_5_moe`. El checkpoint es el resultado de fusionar (merge) adaptadores LoRA sobre el modelo base `kevin954/Affine-5dfqbbh8ev-sft`. El nombre del repositorio sugiere un proceso de entrenamiento en dos fases: primero un fine-tuning supervisado (SFT) sobre el modelo base, y posteriormente una optimización con DPO (Direct Preference Optimization) en modo offline, con parámetros como `hialpha` (alpha alto), `hirank` (rank alto), `lobeta` (beta bajo), `midctx` (contexto medio) y `ultraextrasteps` (pasos adicionales). No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni detalles sobre el proceso de alineación. El tag `image-text-to-text` indica que el modelo acepta entradas multimodales (imagen y texto), aunque no se especifica el mecanismo de codificación visual.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation`, por lo que puede generar respuestas de texto en formato conversacional.
- Procesamiento multimodal: el tag `image-text-to-text` sugiere capacidad para procesar imágenes junto con texto, aunque no se detalla el tipo de tareas visuales soportadas.
- No se ha documentado soporte para tool calling, function calling, agentes o razonamiento multi-paso.
- No se ha especificado el conjunto de idiomas soportados.

## Casos de uso

Dado que el modelo es un checkpoint experimental sin documentación de rendimiento ni capacidades verificadas, los casos de uso son hipotéticos y deben tomarse con cautela:

- Experimentación en investigación: puede servir como punto de partida para estudiar el efecto de diferentes hiperparámetros de DPO (alpha, beta, rank) en modelos MoE de ~35B, comparando con otros checkpoints de la misma serie (r497, r4-fullft, h30-merged).
- Evaluación de pipelines de fine-tuning: al ser un "salvamento" de un proceso de entrenamiento, permite auditar la evolución del modelo en distintas etapas (r509 vs r497) y validar la estabilidad del entrenamiento.
- Pruebas de inferencia multimodal: si las capacidades image-text-to-text funcionan, podría usarse para prototipos de descripción de imágenes o respuesta a preguntas visuales, aunque sin garantías de calidad.
- Benchmarking de infraestructura: con 35,1B parámetros, sirve para medir el rendimiento de motores de inferencia como vLLM, TGI o FriendliAI en GPUs de alta gama.
- Estudio de merges LoRA: el checkpoint fusionado permite analizar el impacto de la fusión de adaptadores sobre el modelo base y comparar con versiones sin fusionar.
- Desarrollo de agentes conversacionales: si se confirma su capacidad de diálogo, podría integrarse en chatbots de prueba, pero no se recomienda para producción sin validación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo tiene cero descargas y cero likes, lo que indica que no ha sido evaluado por la comunidad.

## Requisitos de hardware

- El repositorio ocupa 70,2 GB en formato safetensors, lo que corresponde aproximadamente a pesos en fp16 (35,1B × 2 bytes ≈ 70,2 GB).
- Para inferencia en fp16 se necesitaría al menos 70 GB de VRAM, lo que requiere GPUs como A100 80GB, H100 80GB o configuraciones multi-GPU.
- Con cuantización a 4 bits (por ejemplo, mediante bitsandbytes o GPTQ), el modelo podría caber en una GPU de 24 GB (RTX 4090) o 48 GB (A6000/A40), aunque no se han publicado archivos cuantizados.
- Opciones de despliegue: vLLM, Hugging Face TGI, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y plataformas como FriendliAI que ya listan el modelo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo pertenece a una serie de checkpoints experimentales del mismo autor (r497, r4-fullft, h1-merged, h30-merged) que comparten base y metodología, pero no hay datos públicos de rendimiento. Como referencia arquitectónica, podría compararse con otros modelos MoE de ~35B como Mixtral 8x7B (46,7B totales) o Qwen3-30B-A3B, pero sin datos de benchmarks no es posible una comparación objetiva.

## Limitaciones y advertencias

- Checkpoint experimental: la model card indica explícitamente que no es una versión final ("not a submission until Stage-5 gate clears"). Puede contener artefactos de entrenamiento, degradación de calidad o comportamiento inconsistente.
- Licencia no especificada: al no declararse licencia, no se puede utilizar legalmente en proyectos comerciales o de código abierto sin autorización expresa del autor.
- Sin documentación de sesgos ni alucinaciones: no hay información sobre sesgos potenciales, riesgos de alucinación o limitaciones de idioma.
- Sin datos de contexto: se desconoce la longitud máxima de contexto soportada, lo que impide planificar su uso en tareas de memoria larga.
- Capacidades multimodales no verificadas: el tag image-text-to-text no garantiza que el modelo funcione correctamente con imágenes; no hay ejemplos ni demos.
- Cero adopción: con 0 descargas y 0 likes, no hay evidencia de que el modelo haya sido probado por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r509-sbsv5-offline-dpo-hialpha-hirank-lobeta-midctx-ultraextrasteps-merged
- Checkpoint relacionado r497: https://huggingface.co/unconst/Affine-5czsc2fc98-r497-sbsv5-offline-dpo-hialpha-midrank-lobeta-midctx-extrasteps-merged
- Checkpoint r4-fullft: https://huggingface.co/unconst/Affine-5czsc2fc98-r4-fullft
- Página del modelo en FriendliAI (h1-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
- Página del modelo en FriendliAI (h30-merged): https://friendli.ai/models/unconst/Affine-5czsc2fc98-h30-merged
- Guía de hiperparámetros LoRA de Unsloth (referencia general, no específica del modelo): https://unsloth.ai/docs/get-started/fine-tuning-llms-guide/lora-hyperparameters-guide
