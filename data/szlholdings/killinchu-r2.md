# SZLHOLDINGS/killinchu-r2

## Resumen

killinchu-r2 es un adaptador LoRA (no un modelo completo) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se trata de un ajuste fino con rsLoRA de rango 8 y alpha 16 aplicado únicamente a las proyecciones de atención (q_proj, k_proj, v_proj, o_proj) de un transformer de 0,8 mil millones de parámetros. El entrenamiento se realizó con Unsloth y se documenta mediante un recibo de entrenamiento (`szl.training_receipt.v2`) con pérdida medida, además de una evaluación de humo (`evaluations/smoke-eval-r1.json`).

El modelo está orientado a un caso de uso muy específico: "verticales M5" con turnos gobernados, entrenado sobre el dataset `SZLHOLDINGS/szl-1-doctrine-sft`. El autor describe el corte como "OSINT courier class: attention-only (chaski pattern)", lo que indica que el adaptador busca que el runner no pueda generar payloads (contenido ejecutable o dañino), limitando la capacidad generativa a través de la restricción a capas de atención.

Es relevante por su carácter experimental y por la transparencia del autor al declarar explícitamente que el modelo no está desplegado y que la finalización del entrenamiento no constituye aprobación de despliegue. El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los pesos del adaptador no están efectivamente alojados o son de tamaño despreciable. No hay información sobre idiomas soportados ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-0.8B) con adaptador LoRA rsLoRA |
| Parametros totales | 0,8B en el modelo base; el adaptador LoRA es de rango 8 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3.5-0.8B, no especificada en la información) |
| Tipos de cuantizacion | no disponible (el autor menciona QLoRA en el entrenamiento, no cuantizaciones de inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de 0,8B parámetros. El ajuste fino utiliza rsLoRA (rank-stabilized LoRA) con rango 8 y alpha 16, restringido a las cuatro proyecciones de atención (q_proj, k_proj, v_proj, o_proj). Esta restricción a "attention-only" se denomina en la model card "chaski pattern" y tiene como objetivo que el runner no pueda autorizar payloads, es decir, limitar la generación de contenido ejecutable o potencialmente dañino.

El entrenamiento se realizó con Unsloth y QLoRA, con semilla 20260721, sobre el dataset `SZLHOLDINGS/szl-1-doctrine-sft` más "governed vertical turns". Se generó un recibo de entrenamiento (`training_receipt.unsloth.json`) con formato `szl.training_receipt.v2` y pérdida medida (MEASURED loss), además de una evaluación de humo (`evaluations/smoke-eval-r1.json`). No se especifica el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO. El autor declara explícitamente que la finalización del entrenamiento no es aprobación de despliegue y que el modelo no está desplegado; el despliegue está condicionado a revisión del propietario y a una evaluación sustantiva.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-0.8B.
- Ajuste específico para "verticales M5" con turnos gobernados (governed vertical turns), según la model card.
- Restricción de atención únicamente (attention-only) para evitar que el runner autorice payloads.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información.

## Casos de uso

- Evaluación de adaptadores LoRA de bajo rango: el modelo sirve como ejemplo de ajuste rsLoRA rango 8 sobre un base de 0,8B, útil para investigar el efecto de restringir el adaptador a capas de atención en tareas de clasificación o generación controlada.
- Investigación en seguridad de modelos: el patrón "attention-only" orientado a impedir la autoría de payloads puede estudiarse como técnica de mitigación de generación de contenido ejecutable en pipelines de agentes.
- Experimentación con QLoRA y Unsloth: el recibo de entrenamiento y la evaluación de humo permiten reproducir y auditar el proceso de ajuste fino con pérdida medida.
- Prototipado de asistentes de dominio restringido: los "governed vertical turns" sugieren su uso en flujos conversacionales acotados donde el modelo no debe salirse del guion ni generar acciones.
- Docencia y formación en MLOps: el repositorio ilustra buenas prácticas de trazabilidad (revisión del base, semilla, dataset, recibo de entrenamiento) en un ajuste fino pequeño.
- Pruebas de integración con Unsloth y safetensors: permite validar pipelines de carga de adaptadores LoRA sobre Qwen3.5-0.8B antes de invertir en modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una evaluación de humo (`evaluations/smoke-eval-r1.json`) sin cifras reproducidas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: el base de 0,8B en FP16 requiere aproximadamente 1,6 GB solo para pesos; con overhead de activaciones y KV cache, un entorno práctico parte de 2-4 GB. En cuantización de 4 bits, alrededor de 0,5-1 GB para pesos. Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060) para el base en cuantización; RTX 4090, A100 o H100 sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 4 GB o más, dado el tamaño del base.
- Opciones de despliegue: el adaptador está en safetensors y se entrenó con Unsloth; es compatible con llama.cpp, Ollama, vLLM y TGI una vez fusionado con el base, aunque el autor no documenta ninguna de estas rutas.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| killinchu-r2 (este) | 0,8B base + LoRA r8 | no disponible | Apache 2.0 | Repo HF con 0 descargas | Adaptador experimental, no desplegado |
| Qwen/Qwen3.5-0.8B | 0,8B | no disponible en la información | no disponible en la información | Modelo base público | Sin ajuste específico |
| Adaptadores LoRA genéricos sobre Qwen 0,8B | 0,8B + LoRA | depende del base | variable | variable | No hay un comparable directo publicado con estas características |

No se dispone de datos de rendimiento del base ni de alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo NO está desplegado y que la finalización del entrenamiento no es aprobación de despliegue; el uso en producción está condicionado a revisión del propietario y evaluación sustantiva.
- Repositorio con 0 descargas y 0 likes, tamaño de 0.0 GB: los pesos del adaptador podrían no estar efectivamente alojados o ser de tamaño despreciable; verificar antes de usar.
- Sin información sobre idiomas soportados, sesgos, riesgo de alucinación ni limitaciones de contexto.
- El ajuste se restringe a capas de atención (attention-only), lo que puede limitar la capacidad de adaptación frente a un LoRA completo.
- No hay benchmarks publicados más allá de una evaluación de humo sin cifras reproducidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que deben verificarse por separado.
- El caso de uso declarado ("verticales M5", "OSINT courier") es muy específico y no está documentado en detalle; extrapolar a otros dominios no está validado.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/killinchu-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
