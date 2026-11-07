# Xananthium/Calmer-V2-Qwen3.8-27B-4bit

## Resumen

Calmer-V2-Qwen3.8-27B-4bit es un modelo derivado (merge/edición de pesos) construido sobre HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF, que a su vez parte de la familia Qwen3.8 de 27B parámetros. El autor, Xananthium, aplica una metodología propia de "programación en espacio de pesos" (weight-space programming): en lugar de reentrenar, inserta correcciones dispersas de rango uno en capas concretas del transformer para modificar el comportamiento de razonamiento del modelo sin alterar el resto de los pesos. La V2 añade una corrección aprendida en la capa 18 (indexación base cero) y conserva byte a byte las correcciones 49/50/51 de la versión Calmer V1.

El objetivo declarado no es mejorar la precisión bruta, sino la eficiencia del razonamiento: reducir el número de tokens generados en modo "thinking" manteniendo las respuestas finales correctas. Según las mediciones del autor en un panel exploratorio de cinco preguntas, todas las respuestas finales siguieron siendo correctas mientras los tokens generados cayeron un 22,45%; en una pregunta de topología la reducción fue del 58,19% y una comprobación aritmética primada pasó de 15 repeticiones a una sola.

Es relevante ahora porque ejemplifica una línea de trabajo experimental (edición de pesos frente a fine-tuning completo) aplicada a un modelo de 27B con capacidades de razonamiento y visión heredadas del upstream. El repositorio es de tamaño 20 GB, con 27.320.697.856 parámetros totales, licencia Apache 2.0 y únicamente idioma inglés declarado. La model card advierte explícitamente que no se ha establecido una mejora general en HLE ni GSM8K, y que parte de las confirmaciones de benchmark quedaron sin ejecutar por un fallo de controlador de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8, arquitectura GGUF `qwen35` según la model card); edición de pesos con correcciones de rango uno en capas 18, 49, 50 y 51 |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (la model card menciona un presupuesto de salida de 32.768 tokens para el "hat puzzle", pero no se especifica la ventana de contexto oficial) |
| Tipos de cuantización | Q4_K_P mixta con cuatro matrices editadas almacenadas en F32; W4A16 para el draft de decodificación especulativa; KV cache de cuatro bits (TurboQuant) en el stack medido |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`Calmer-V2-Qwen3.8-27B-Q4_K_P-F32Edits.gguf`), `calmer_delta.npz` (correcciones exactas), `mmproj-Qwen3.8-27B-BF16.gguf` (proyector visión), `hf-config/` (tokenizer, configuración y plantilla de chat) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.8 con 27B parámetros, distribuido originalmente en formato GGUF y con un proyector de visión BF16 (`mmproj-Qwen3.8-27B-BF16.gguf`). Sobre esa base, Calmer V2 no reentrena: aplica una corrección dispersa de rango uno aprendida en la capa 18 (indexación base cero) y preserva las correcciones de las capas 49, 50 y 51 introducidas en Calmer V1. El resultado se exporta de dos formas: un GGUF fusionado completo (base Q4_K_P mixta con las cuatro matrices editadas en F32) y un sidecar (`calmer_delta.npz` más `runtime/`) que se aplica en tiempo de ejecución sobre la base empaquetada original.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el upstream; la model card solo describe el proceso de edición de pesos. La innovación técnica destacable es doble: por un lado, la metodología de edición en espacio de pesos con correcciones de rango uno localizadas por capa; por otro, el stack de servicio medido, que combina decodificación especulativa DFlash con siete tokens especulativos y un draft separado en W4A16, junto con una KV cache de cuatro bits (TurboQuant) para el modelo objetivo. El autor exploró 14 variantes de pesos nuevas, guardó 248 registros de respuesta y observó 933.411 tokens generados durante el seguimiento.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat propia (`hf-config/`).
- Razonamiento multi-paso con modo "thinking" configurable; la model card recomienda razonamiento medio y temperatura 1.3.
- Razonamiento matemático y aritmético (evaluado por el autor con comprobaciones GSM8K en el panel exploratorio).
- Razonamiento sobre problemas de lógica y topología (con errores de visualización/signo documentados en las respuestas de topología).
- Capacidades de visión heredadas del upstream mediante el proyector BF16 incluido; los experimentos de V2 fueron solo de texto.
- Decodificación especulativa integrada en el stack de servicio (DFlash con siete tokens y draft W4A16).
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes o multi-step tool use más allá del razonamiento interno.
- Multilingüismo limitado: solo inglés declarado.

## Casos de uso

- Servicio de razonamiento con presupuesto de tokens ajustado: el modelo está diseñado para reducir la longitud del "thinking" manteniendo respuestas correctas, lo que abarata el coste por consulta en cargas de razonamiento medio. Es adecuado cuando el cuello de botella es el coste de generación, no la precisión bruta.
- Despliegue en CPU con llama.cpp u otros frontends GGUF: el artefacto fusionado `Calmer-V2-Qwen3.8-27B-Q4_K_P-F32Edits.gguf` pasó comprobaciones nativas de carga y decodificación en CPU, por lo que sirve para prototipado local sin GPU.
- Evaluación de metodologías de edición de pesos: el par `calmer_delta.npz` + `runtime/` permite reproducir la representación exacta usada en el piloto y auditar el efecto de correcciones localizadas por capa, útil para investigación en interpretabilidad y control de comportamiento.
- Pipelines de razonamiento con decodificación especulativa: el stack medido (DFlash de siete tokens más draft W4A16 y KV cache de cuatro bits) es un caso de referencia para montar serving de baja latencia sobre un modelo de 27B.
- Asistencia conversacional en inglés con contexto largo de salida: la plantilla de chat y el modo de razonamiento medio permiten conversaciones multi-turno, aunque la ventana de contexto oficial no está documentada.
- Verificación aritmética y comprobaciones de consistencia: el piloto reporta que una continuación aritmética primada pasó de 15 repeticiones a una sola, lo que lo hace apto para tareas donde la verbosidad repetitiva es un problema.
- Análisis de imágenes con el proyector incluido: el `mmproj` BF16 del upstream está presente en el repo, aunque el autor no validó visión en V2 y no hay benchmarks de visión para esta variante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K completo, HLE) en la información disponible. La model card presenta únicamente mediciones internas de un panel exploratorio de desarrollo, que el propio autor califica como no equivalentes a puntuaciones de benchmark:

| Medición | Calmer V1 (referencia) | V2 (piloto) |
|---|---:|---:|
| Panel rápido: dos preguntas difíciles + tres comprobaciones GSM8K | 5/5 respuestas finales; 23.831 tokens | 5/5 respuestas finales; 18.481 tokens |
| Explicación de juego | Prueba general válida; 12.743 tokens | Prueba general válida; 8.177 tokens |
| Explicación de árbol | Elección correcta, historial de eventos defectuoso | Elección correcta, más errores en el historial de eventos |
| Pregunta de desarrollo de topología | Respuesta correcta, núcleo sólido; 25.467 tokens | Respuesta correcta, núcleo sólido; 10.648 tokens |
| Continuación de galleta primada | Correcta; 862 tokens; 15 recomprobaciones exactas | Correcta; 554 tokens; una recomprobación exacta |
| Revisión de contenido de seis casos | 6/6 | 6/6; nota estricta del parser 5/6 |
| Puzle del sombrero | Respuesta completada incorrecta | Sin terminar a 32.768 tokens |
| Comprobación GSM8K ampliada de 24 casos | 24/24 | No ejecutada para V2 |

El autor indica que un fallo de controlador de GPU impidió la confirmación planificada con warm-start y segunda semilla, así que no hay mejora general establecida en HLE ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 20 GB y la variante fusionada es Q4_K_P mixta con cuatro matrices en F32, por lo que el peso en memoria ronda ese orden de magnitud, pero no se publica una cifra oficial.
- GPU recomendadas: no disponible; la model card no especifica modelos de GPU. El stack medido requiere CUDA y vLLM personalizados según `runtime/README.txt`.
- Cabe en GPU de consumo: no confirmado en la información disponible; el tamaño de 20 GB y la cuantización Q4 lo sitúan en el rango de GPUs de 24 GB, pero el autor no lo valida.
- Opciones de despliegue: llama.cpp u otros frontends compatibles con la arquitectura GGUF `qwen35` y su plantilla de chat; runtime propio con CUDA/vLLM personalizado para el sidecar; el GGUF fusionado pasó comprobaciones nativas de carga y decodificación en CPU.
- Latencia y throughput: no disponible como cifra de rendimiento; solo se documenta la reducción de tokens generados (22,45% en el panel rápido y 58,19% en la pregunta de topología), que se traduce en menor coste de decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Calmer-V2-Qwen3.8-27B-4bit | 27,32B | no disponible | Sin benchmarks estándar; panel interno con 5/5 respuestas y 22,45% menos tokens | Apache 2.0 | GGUF en Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (upstream) | 27B (familia) | no disponible en la información | Evaluado en MathVision y otros benchmarks por el autor original | no disponible en la información | Hugging Face oficial |
| HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF (base directa) | 27B (familia) | no disponible | no disponible | no disponible en la información | GGUF en Hugging Face |
| Calmer-Qwen3.8-27B-4bit (Calmer V1) | 27B (familia) | no disponible | 5/5 en panel rápido con 23.831 tokens; 24/24 en GSM8K de 24 casos | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No hay benchmarks estándar publicados para esta variante; las cifras de la model card provienen de preguntas de desarrollo previamente expuestas y adaptativamente usadas, no de una evaluación independiente.
- La confirmación con warm-start, segunda semilla y la comprobación GSM8K ampliada de 24 casos no se ejecutaron por un fallo de controlador de GPU; las comprobaciones operativas del piloto no sustituyen esa validación.
- El razonamiento más corto no implica sistemáticamente un razonamiento más limpio: las respuestas de topología conservan errores de visualización y de signo, y el puzle del sombrero quedó sin terminar a 32.768 tokens.
- La continuación de toalla seguía repitiéndose seis veces en V2, lo que indica que los bucles repetitivos no están eliminados.
- La revisión de contenido de seis casos dio 6/6 pero con nota estricta del parser de 5/6, señal de posibles problemas de formato en producción.
- Solo se declara inglés; no hay soporte multilingüe documentado.
- El modelo base es una variante "uncensored" y "aggressive" del upstream, lo que implica riesgos de contenido no filtrado y sesgos heredados no auditados en esta ficha.
- Riesgo de alucinación: no cuantificado en la información disponible; los errores documentados en historiales de eventos y visualizaciones matemáticas sugieren cautela en tareas de precisión factual.
- La licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base upstream y del dataset de edición no se detallan en la información disponible.
- El delta `calmer_delta.npz` debe aplicarse solo a la base empaquetada original, nunca al GGUF fusionado de V2, que ya contiene las ediciones; un runtime reconstruido requiere su propia validación numérica.
- El smoke test nativo en CPU es solo una comprobación de carga y decodificación, no una garantía de que todos los frontends GGUF soporten el modelo o reproduzcan el comportamiento del runtime personalizado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- [Hugging Face: Xananthium/Calmer-V2-Qwen3.8-27B-4bit](https://huggingface.co/Xananthium/Calmer-V2-Qwen3.8-27B-4bit)
- [Repositorio de investigación y contribución](https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming)
- [Informe V2 y ejemplos de thinking](https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming/tree/main/followup_20261106)
- [Informe V2 (REPORT.md)](https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming/blob/main/followup_20261106/REPORT.md)
- [Calmer V1 en Hugging Face](https://huggingface.co/Xananthium/Calmer-Qwen3.8-27B-4bit)
- [Artefactos de release en GitHub](https://github.com/Xananthium/Qwen3.8-Weight-Space-Programming/tree/main/release)
- [Modelo base: HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF](https://huggingface.co/HauhauCS/Qwen3.8-27B-Uncensored-HauhauCS-Aggressive-MTP-GGUF)
- [Upstream: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
