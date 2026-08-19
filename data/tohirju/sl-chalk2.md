# Tohirju/sl-chalk2

## Resumen

El modelo `Tohirju/sl-chalk2` es un checkpoint de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) publicado en HuggingFace por el usuario Tohirju. El repositorio incluye únicamente pesos en formato safetensors y el tag `qwen3_5_text` sugiere una posible relación con la familia de arquitecturas Qwen 3.5, aunque no existe confirmación oficial ni documentación adicional. El modelo fue creado el 16 de agosto de 2026 y su acceso está restringido (gated), lo que obliga a aceptar condiciones previas antes de su descarga.

La ausencia de información pública sobre su entrenamiento, capacidades o licencia detallada hace imposible evaluar su utilidad práctica. Con cero descargas y cero likes, se trata de un modelo recién publicado y sin validación por parte de la comunidad. Cualquier uso en producción debería considerarse de alto riesgo hasta que se publique documentación técnica completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (tag `qwen3_5_text` sugiere posible base Qwen, sin confirmar) |
| Parametros totales | 8.953.803.264 (~8,95 B) |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponibles |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información oficial sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación (RLHF, DPO, etc.). El único dato disponible es el tag `qwen3_5_text`, que podría indicar que el modelo se basa en la arquitectura Qwen 3.5, pero no hay confirmación por parte del autor. El tamaño de 8,95 B parámetros es consistente con modelos densos de la gama de 7-9 B, pero sin más detalles no es posible determinar si se trata de un transformer estándar, un modelo con atención lineal o una variante híbrida.

## Capacidades

No se dispone de documentación que detalle las capacidades del modelo. No se puede confirmar si es capaz de generar texto, razonar, escribir código, realizar llamadas a herramientas o procesar imágenes. El tag `qwen3_5_text` sugiere que podría ser un modelo de lenguaje puramente textual, pero esto es especulativo. No hay ejemplos de uso, demos ni papers asociados.

## Casos de uso

No se pueden determinar casos de uso concretos sin información sobre las capacidades del modelo. Al no existir documentación, benchmarks ni ejemplos prácticos, cualquier recomendación de aplicación sería especulativa y potencialmente peligrosa. Se recomienda evitar su uso hasta que el autor publique detalles técnicos y validaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras evaluaciones estándar. Tampoco hay comparaciones con modelos de tamaño similar.

## Requisitos de hardware

Dado el tamaño de 8,95 B parámetros, se pueden estimar los requisitos mínimos de hardware para inferencia, asumiendo una arquitectura densa estándar:

- VRAM estimada: ~18 GB en FP16 (los pesos safetensors ocupan 17,9 GB). Con cuantización a 8 bits (~9 GB) o 4 bits (~4,5 GB) se podría ejecutar en GPUs de consumo, pero no hay archivos cuantizados disponibles en el repositorio.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o A100 (40 GB) para FP16; una RTX 3090 (24 GB) o similar podría servir con cuantización.
- Opciones de despliegue: al no haber archivos GGUF ni soporte confirmado para vLLM u Ollama, el despliegue requeriría convertir los pesos manualmente. No se garantiza compatibilidad con frameworks estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se puede comparar con modelos como Qwen2.5-7B o Llama-3.1-8B porque se desconoce la arquitectura real y el rendimiento de `sl-chalk2`.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated, lo que implica condiciones de uso desconocidas que deben aceptarse antes de descargar.
- Licencia `other`: sin especificar los términos exactos, no se puede garantizar que el uso comercial sea permitido.
- Sin documentación: no hay paper, README técnico ni notas de entrenamiento.
- Sin validación: cero descargas y cero likes indican que no ha sido probado por la comunidad.
- Riesgo de alucinación y sesgos: desconocidos, pero probables en cualquier modelo sin alineación documentada.
- No apto para producción: la falta de información sobre capacidades y limitaciones hace imposible evaluar su fiabilidad.

## Enlaces

- [HuggingFace: Tohirju/sl-chalk2](https://huggingface.co/Tohirju/sl-chalk2)
