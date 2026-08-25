# Veenn/Helix-rdt-ID

## Resumen

HelixRDT-80M es un modelo de lenguaje causal decoder-only de 80,9 millones de parámetros, desarrollado por el autor Veenn, diseñado específicamente para el idioma indonesio. Su principal innovación reside en la arquitectura "looped transformer" o de profundidad recurrente: dispone de 9 capas físicas que se recorren dos veces, dando una profundidad efectiva de 18 capas, con el objetivo de mejorar el razonamiento con un coste paramétrico contenido. El modelo integra GQA (12 queries, 3 key-values), SwiGLU, RMSNorm, RoPE parcial (50%) y un head auxiliar MTP.

Es fundamental señalar que este modelo está **sin entrenar** (estado UNTRAINED): los pesos actuales son inicialización aleatoria y no han visto ningún dato. El repositorio se ha publicado antes del entrenamiento para documentar el diseño arquitectónico y el tokenizer HELIX. No es apto para uso práctico; es una referencia de código y arquitectura para investigación. Su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HelixRDT (decoder-only, looped/recurrent-depth transformer) |
| Parametros totales | 80.920.704 (~80,9M) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (sin entrenar, sin pesos publicados) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (esperado, no confirmado) |

## Arquitectura y entrenamiento

La arquitectura HelixRDT se basa en un transformer decoder-only con **looped layers** o profundidad recurrente: 9 capas físicas se ejecutan 2 veces, logrando una profundidad efectiva de 18 sin duplicar parámetros. Cada capa combina atención con **GQA** (12 cabezas de query, 3 de key-value, ratio 4:1), **SwiGLU** como FFN (dimensión 1.792), y normalización RMSNorm con QK-Norm centrada en cero. La codificación posicional es **RoPE parcial** (50% de las dimensiones usan RoPE, el 50% restante queda sin posición), una elección experimental para estudiar el equilibrio entre información posicional y no posicional. Los embeddings están atados (tied) entre entrada y salida, y se incluye una cabeza auxiliar MTP (multi-token prediction) de 1 token.

El modelo **no ha sido entrenado**: los pesos son inicialización aleatoria y no hay datos de entrenamiento. El autor documenta que es el cuarto proyecto de una serie (predecesores: Photon-3M, Vega-100M-Indo, Magnetar-50M-ID), y este repo se sube antes del entrenamiento para que otros puedan estudiar el diseño. No hay información sobre dataset, tokens, ni métodos de RLHF/DPO.

## Capacidades

- **Sin capacidades funcionales**: el modelo no está entrenado, por lo que cualquier generación produce tokens aleatorios sin coherencia.
- **Referencia de arquitectura**: su código y diseño (looped layers, GQA, SwiGLU, RoPE parcial) pueden estudiarse como ejemplo de implementación de transformers recurrentes.
- **Soporte de tool calling / function calling**: no disponible, no implementado.
- **Capacidades multilingües**: solo indonesio (id), aunque sin entrenamiento no es efectivo.
- **Capacidades especiales**: ninguna (sin visión, audio, ni modo de razonamiento).

## Casos de uso

- **Investigación en diseño de arquitecturas**: sirve como referencia de código para implementar looped transformers, GQA y RoPE parcial en modelos pequeños.
- **Educación en transformers**: los desarrolladores pueden estudiar la estructura de capas recurrentes y la gestión de parámetros en un modelo de 80M.
- **Prototipado de tokenizadores**: el tokenizer HELIX se incluye en el repo, útil para probar tokenización del indonesio.
- **No apto para aplicaciones**: no puede usarse en atención al cliente, generación de código, agentes ni ningún caso real por estar sin entrenar.
- **Base para futuros entrenamientos**: podría servir como punto de partida para que otros investigadores entrenen desde cero con esta arquitectura.
- **Comparación de eficiencia**: útil para medir el coste de profundidad recurrente frente a modelos densos equivalentes (aunque sin resultados).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no ha sido entrenado, por lo que no hay métricas de MMLU, HumanEval, GSM8K ni otras. La evaluación interna mencionada en proyectos anteriores (como Magnetar) no aplica a este checkpoint.

## Requisitos de hardware

- **Inferencia**: no aplicable, el modelo no genera texto coherente.
- **Entrenamiento**: con 80,9M parámetros, cabe en una GPU consumer (por ejemplo, RTX 3090/4090 con 24 GB) en FP16 o BF16. El entrenamiento con contexto de 512 tokens es ligero.
- **Despliegue**: no aplicable (no entrenado). Si se entrenara, se podría usar con vLLM, llama.cpp u Ollama tras convertir a GGUF.
- **Latencia**: no disponible.

## Comparativa con modelos similares

No hay una comparativa directa con modelos de la misma categoría porque el modelo no está entrenado y no hay métricas. Los proyectos previos del mismo autor (Photon-3M, Vega-100M-ID, Magnetar-50M-ID) comparten contexto, pero ninguno completó el entrenamiento de forma usable. Otros modelos de 80M entrenados (como GPT-2 82M) no son comparables en rendimiento ni licencia. En resumen: no disponible.

## Limitaciones y advertencias

- **Modelo sin entrenar**: todos los pesos son inicialización aleatoria; cualquier salida es basura.
- **No apto para producción**: no puede usarse en aplicaciones reales ni en investigación que requiera generación de texto.
- **Contexto corto**: la ventana máxima es de 512 tokens, limitada para tareas que requieran contexto largo.
- **Idioma**: diseñado solo para indonesio, no tiene capacidades multilingües.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo no es funcional, por lo que no hay valor práctico comercial.
- **Riesgo de alucinación**: no aplica (no genera texto coherente).
- **Falta de datos**: no hay información sobre dataset, lo que impide evaluar sesgos o calidad futura.

## Enlaces

- Repositorio del modelo: [Veenn/Helix-rdt-ID en Hugging Face](https://huggingface.co/Veenn/Helix-rdt-ID)
- Proyecto anterior (referencia): [Veenn/magnetar-50m-id en Hugging Face](https://huggingface.co/Veenn/magnetar-50m-id/blob/main/README.md)
- (No se encontraron otros enlaces relevantes en la búsqueda web.)
