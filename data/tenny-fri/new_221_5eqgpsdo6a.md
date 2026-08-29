# tenny-fri/new_221_5eqgpsdo6a

## Resumen

El modelo `tenny-fri/new_221_5eqgpsdo6a` es un modelo de lenguaje publicado en HuggingFace por el usuario tenny-fri. Según los metadatos del repositorio, contiene 35.951.822.704 parámetros y está etiquetado con el tag `qwen3_5_moe`, lo que sugiere que podría tratarse de una arquitectura de mezcla de expertos (MoE) basada en la familia Qwen 3.5, aunque no hay confirmación oficial ni documentación pública al respecto. El repositorio está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace para acceder a los pesos.

La relevancia de este modelo es incierta: no se ha publicado información técnica, benchmarks ni documentación asociada. El tamaño del repositorio (142.2 GB) y el formato de pesos safetensors indican que los pesos están almacenados en precisión completa (probablemente FP16 o BF16). Dado que el autor no ha proporcionado detalles adicionales, la ficha se limita a los datos disponibles y marca explícitamente los campos no especificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag sugiere MoE basada en Qwen 3.5, sin confirmar) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (acceso gated, condiciones no especificadas) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No hay información pública sobre la arquitectura, el proceso de entrenamiento, los datos utilizados ni las técnicas aplicadas (RLHF, DPO, etc.). El tag `qwen3_5_moe` podría indicar una arquitectura de mezcla de expertos derivada de la serie Qwen 3.5, pero esto es una suposición basada únicamente en la etiqueta y no en documentación verificable. Sin acceso al repositorio (gated) ni a un modelo card, no es posible confirmar ningún detalle técnico.

## Capacidades

- No se han publicado capacidades específicas en la información disponible.
- El modelo es presumiblemente un modelo de lenguaje generativo, pero no se puede confirmar si soporta tool calling, razonamiento avanzado, visión u otras funciones.
- No hay datos sobre capacidades multilingües ni sobre modos especiales (thinking, etc.).

## Casos de uso

No se pueden definir casos de uso concretos sin conocer las capacidades reales del modelo. Al no existir documentación ni ejemplos de aplicación, cualquier recomendación sería especulativa. Se recomienda esperar a que el autor publique información técnica o evaluaciones independientes antes de considerar este modelo para tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware.
- Estimación genérica para 35.95B parámetros: en FP16 se necesitarían aproximadamente 72 GB de VRAM solo para los pesos (35.95 × 2 bytes), más overhead de activaciones y KV cache. Esto supera la capacidad de GPUs consumer (RTX 4090 con 24 GB) y requeriría GPUs de datacenter como A100 (80 GB) o H100 (80 GB) en configuración de una sola GPU, o múltiples GPUs con paralelismo.
- Con cuantización a 8 bits se necesitarían ~36 GB, y a 4 bits ~18 GB, lo que podría caber en una RTX 4090 o similar, pero no se ha confirmado que los pesos estén disponibles en esos formatos (el repo solo contiene safetensors en precisión completa).
- Opciones de despliegue: no se conoce compatibilidad con vLLM, llama.cpp, Ollama u otros frameworks sin información adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas. El tag `qwen3_5_moe` sugiere una posible relación con la familia Qwen, pero sin datos de rendimiento ni confirmación de arquitectura, no se puede establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Falta total de documentación pública: no hay model card, paper ni repositorio de código asociado.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, cuyos términos no se han hecho públicos.
- Riesgo de sesgos y alucinaciones: al ser un modelo de lenguaje sin información sobre su entrenamiento, no se pueden evaluar estos riesgos.
- Sin garantías de seguridad: no se ha auditado el modelo para uso en producción.
- Posible problema de confianza: el autor no proporciona ningún detalle sobre el origen de los pesos, el proceso de entrenamiento o las licencias de los datos utilizados.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/tenny-fri/new_221_5eqgpsdo6a)
- [Perfil del autor en HuggingFace](https://huggingface.co/tenny-fri)
- [Datasets del autor en HuggingFace](https://huggingface.co/tenny-fri/datasets)
