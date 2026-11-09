# webmp3/Sakura-Qwen3.8-27B-DSpine-b16-BF16-GGUF

## Resumen

Sakura-Qwen3.8-27B-DSpine-b16-BF16-GGUF es una conversión comunitaria a formato GGUF en precisión BF16 (sin cuantización) del modelo tencent/Qwen3.8-27B-DSpine-b16, publicado por el usuario webmp3 en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un artefacto de distribución que empaqueta los pesos del modelo base de Tencent en el formato GGUF, pensado para su uso con motores de inferencia compatibles como llama.cpp u Ollama.

El nombre sugiere una variante de la familia Qwen3 con 27B de parámetros y un identificador "DSpine-b16" que no está documentado en la información disponible. El repositorio declara los idiomas inglés y chino, licencia Apache 2.0 heredada del modelo base y la etiqueta base_model_relation: quantized, aunque la conversión se describe explícitamente como BF16 no cuantizada.

La relevancia de esta ficha es limitada por el estado del propio repositorio: la model card indica de forma textual que el repositorio sigue en proceso de subida, que puede estar incompleto y que no debe usarse hasta que desaparezca el aviso. Cualquier evaluación de rendimiento o despliegue en producción debe posponerse hasta que el autor complete la publicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 27B (según el identificador del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 sin cuantizar (único formato publicado en este repositorio) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base tencent/Qwen3.8-27B-DSpine-b16 en los datos proporcionados. El identificador apunta a la familia Qwen3, pero no se confirma si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida, ni se detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

Respecto a este repositorio concreto, la única información técnica verificable es el proceso de conversión: se parte del commit 5f54174d301dbca65d9aa4448dc47e56732d9a12 del modelo base y se transforma a GGUF en BF16 mediante una herramienta de conversión (hfqa_converter_revision 620d2225cc436ab0b001e3200e590e3b286ef9ab). No se documentan innovaciones técnicas adicionales, ni modificaciones de pesos, ni ajustes posteriores al entrenamiento original.

## Capacidades

- Generación de texto: capacidad esperada por tratarse de un modelo de lenguaje de la familia Qwen3, aunque no se detalla en la información disponible.
- Razonamiento y código: no disponible; no se documentan capacidades específicas en la model card.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés y chino según las etiquetas del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución local vía GGUF: es la capacidad diferencial de este repositorio, al permitir cargar los pesos en motores compatibles con GGUF.

## Casos de uso

- Evaluación local de modelos de 27B en BF16: el formato GGUF permite cargar el modelo en llama.cpp para comparar su comportamiento frente a otras variantes del mismo modelo base, siempre que el repositorio esté completo.
- Despliegue en entornos sin acceso a GPUs de datacenter: al ser un artefacto GGUF, puede ejecutarse en estaciones de trabajo con GPUs de consumo, aunque el tamaño en BF16 exige una VRAM considerable.
- Investigación sobre conversión de formatos: sirve como referencia para estudiar el pipeline de conversión de safetensors a GGUF y validar la fidelidad de los pesos convertidos frente al original.
- Procesamiento de texto en inglés y chino: adecuado para tareas de generación y análisis en esos dos idiomas, que son los declarados por el repositorio.
- Integración en pipelines de inferencia con Ollama o llama.cpp: permite incorporar el modelo a flujos de trabajo locales sin depender de APIs externas.
- Base para cuantizaciones posteriores: al publicarse en BF16, puede servir como punto de partida para generar versiones Q4_K_M, Q5_K_M u otras cuantizaciones que reduzcan los requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 54 GB solo para los pesos (27B × 2 bytes por parámetro), a los que hay que sumar el espacio para el contexto KV y el overhead del motor de inferencia; se recomienda contar con 64 GB o más de memoria total.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2× RTX 4090 de 24 GB) para repartir los pesos.
- GPU de consumo: no cabe en una única RTX 4090 (24 GB) en BF16; sería necesario recurrir a cuantizaciones posteriores (Q4, Q5) o a offloading parcial a RAM/CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros motores compatibles con GGUF; vLLM y TGI no consumen GGUF de forma nativa y requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sakura-Qwen3.8-27B-DSpine-b16-BF16-GGUF | 27B (según identificador) | no disponible | GGUF BF16 | Apache 2.0 | Repositorio incompleto, no usable |
| tencent/Qwen3.8-27B-DSpine-b16 (modelo base) | 27B (según identificador) | no disponible | safetensors (presumible) | Apache 2.0 | Disponible en Hugging Face |
| Otras variantes GGUF de Qwen3 de 27B | 27B | no disponible | GGUF | Apache 2.0 | no disponible en la información proporcionada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio está marcado por el propio autor como incompleto: la model card indica explícitamente que no debe usarse hasta que desaparezca el aviso.
- No es una publicación oficial de Tencent; es una conversión comunitaria sin garantías de fidelidad respecto al modelo base.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado principalmente en inglés y chino, el rendimiento en castellano no está garantizado.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas para esta variante.
- El tamaño en BF16 (~54 GB de pesos) limita su despliegue a hardware de gama alta o a configuraciones multi-GPU.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de documentación sobre el modelo base y el estado incompleto del repositorio desaconsejan su uso en producción.
- No hay información sobre la longitud de contexto efectiva, lo que impide planificar casos de uso con ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/webmp3/Sakura-Qwen3.8-27B-DSpine-b16-BF16-GGUF
- Modelo base: https://huggingface.co/tencent/Qwen3.8-27B-DSpine-b16
- Commit del modelo base referenciado: 5f54174d301dbca65d9aa4448dc47e56732d9a12
