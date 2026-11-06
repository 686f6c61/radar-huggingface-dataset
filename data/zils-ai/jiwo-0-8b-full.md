# zils-ai/jiwo-0.8b-full

## Resumen

jiwo-0.8b-full es una variante empaquetada del modelo de decisión jiwo-0.8b, publicado por el usuario zils-ai. El modelo original, jiwo-0.8b, es un fine-tune de solo texto desarrollado por eljiwo sobre Qwen/Qwen3.5-0.8B y se distribuyó sin la torre de visión que sí incorpora el modelo base. Esta versión "full" reconstruye el layout completo de Qwen3.5 añadiendo la torre de visión original de Qwen sin reentrenar nada: todos los tensores de lenguaje son los de jiwo, bit a bit, y todos los tensores de visión son los de Qwen.

La operación se realizó con la herramienta `zils merge` (comando `zils merge Qwen/Qwen3.5-0.8B eljiwo/jiwo-0.8b --weights 0,1`), documentada en el fichero `merge.json` del repositorio. El motivo es técnico: los cuerpos de los "soups" de Zils requieren modelos Qwen3.5 completos, y jiwo carecía de la parte visual. Por tanto, este repositorio no aporta ninguna mejora de capacidades respecto a jiwo-0.8b; es un artefacto de compatibilidad estructural.

El modelo tiene 873.438.784 parámetros (aproximadamente 0,87 mil millones), un tamaño de repositorio de 1,8 GB y se distribuye en formato safetensors bajo licencia Apache-2.0. Está etiquetado como `decision-model` dentro del ecosistema Zils, lo que sugiere un uso orientado a tareas de clasificación o toma de decisiones más que a generación abierta, aunque la model card no detalla el pipeline ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (layout Qwen3.5, con torre de visión y torre de lenguaje) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (LICENSE de Qwen3.5-0.8B y LICENSE-model-2 de jiwo-0.8b) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Qwen3.5 en su variante de 0,8 mil millones de parámetros, con una torre de lenguaje y una torre de visión. La torre de lenguaje proviene íntegramente de jiwo-0.8b (revisión `71b7911`), un fine-tune de solo texto, mientras que la torre de visión es la original de Qwen/Qwen3.5-0.8B (revisión `2fc0636`), sin modificar. No se ha realizado ningún reentrenamiento: la fusión es puramente estructural y preserva los pesos de cada componente sin alteración.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni innovaciones técnicas específicas de jiwo-0.8b en la información proporcionada. La model card remite a la ficha del modelo original (eljiwo/jiwo-0.8b) para detalles de entrenamiento, puntuaciones y runtime, que no se incluyen en este repositorio. Tampoco se incluyen el fichero `readout.safetensors` ni los ficheros de runtime del modelo original.

## Capacidades

- Generación de texto y modelado de lenguaje, heredados de la torre de jiwo-0.8b.
- Capacidad de visión teórica gracias a la torre de visión de Qwen3.5-0.8B, aunque no se documenta si jiwo conserva la alineación necesaria para explotarla.
- Etiquetado como `decision-model`, lo que sugiere uso en tareas de decisión o clasificación, sin más detalle en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Compatibilidad con pipelines Zils: el modelo sirve como cuerpo completo de Qwen3.5 para operaciones de "soup" o mezcla que exigen la presencia de la torre de visión, aunque el uso efectivo de esa torre no esté garantizado.
- Reproducción de la fusión: investigadores que quieran replicar el comando `zils merge Qwen/Qwen3.5-0.8B eljiwo/jiwo-0.8b --weights 0,1` pueden usar este repositorio como referencia del resultado esperado.
- Evaluación de modelos de decisión: al estar etiquetado como `decision-model`, puede emplearse en experimentos de clasificación o selección de opciones sobre texto, siempre validando antes su comportamiento real.
- Base para fine-tuning posterior: al ser un modelo pequeño (0,87 B parámetros) y con licencia Apache-2.0, es adecuado como punto de partida para ajustes específicos en entornos con recursos limitados.
- Investigación sobre transferencia texto-visión: permite estudiar qué ocurre al injertar una torre de visión original en un fine-tune de solo texto sin reentrenar, aunque los resultados dependerán de la alineación preexistente.
- Despliegue en entornos de bajos recursos: su tamaño reducido facilita pruebas en GPU de consumo, aunque no se documentan requisitos ni rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia orientativa, un modelo de 0,87 B parámetros en fp16 requiere aproximadamente 1,7 GB solo para pesos, sin contar overhead.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado, pero por tamaño es plausible en GPUs con 4-8 GB de VRAM; sin datos oficiales.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; solo se distribuyen pesos safetensors, sin GGUF ni cuantizaciones publicadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| jiwo-0.8b-full (este) | 873.438.784 | no disponible | Apache-2.0 | Fine-tune de jiwo con torre de visión de Qwen3.5 añadida |
| eljiwo/jiwo-0.8b | no disponible | no disponible | no disponible | Modelo original de solo texto, sin torre de visión |
| Qwen/Qwen3.5-0.8B | no disponible | no disponible | Apache-2.0 | Modelo base multimodal de Qwen |

No se dispone de datos de rendimiento para comparar; la comparativa se limita a la composición estructural.

## Limitaciones y advertencias

- Este repositorio no aporta ninguna capacidad nueva respecto a jiwo-0.8b: la torre de visión se añade sin reentrenar, por lo que su utilidad real no está validada.
- No se incluyen `readout.safetensors` ni los ficheros de runtime de jiwo-0.8b, lo que puede impedir reproducir el comportamiento exacto del modelo original.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas.
- La licencia es Apache-2.0, pero conviven dos ficheros de licencia (Qwen3.5-0.8B y jiwo-0.8b); conviene revisar ambos antes de uso comercial.
- El pipeline no está definido y los idiomas no están declarados, lo que dificulta su integración directa en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No se publican cuantizaciones, benchmarks ni requisitos de hardware, por lo que cualquier despliegue requiere pruebas propias.

## Enlaces

- [Hugging Face: zils-ai/jiwo-0.8b-full](https://huggingface.co/zils-ai/jiwo-0.8b-full)
- [Modelo original: eljiwo/jiwo-0.8b](https://huggingface.co/eljiwo/jiwo-0.8b)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
