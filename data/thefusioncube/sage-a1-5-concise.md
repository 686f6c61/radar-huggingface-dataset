# TheFusionCube/Sage-A1.5-Concise

## Resumen

Sage-A1.5-Concise es un ajuste fino por aprendizaje por refuerzo del modelo InternScience/Sage-A1.5, desarrollado por TheFusionCube. Su objetivo es reducir la longitud de la cadena de razonamiento (chain of thought) manteniendo la calidad de las respuestas: según la model card, emplea entre un 11 % y un 26 % menos de tokens que el modelo base en cinco benchmarks, con una media del 18 %, sin degradaciones estadísticamente significativas en las puntuaciones. Es, por tanto, un reemplazo directo del modelo base pensado para abaratar la inferencia en tareas de razonamiento.

El modelo conserva la arquitectura del original: un transformer de tipo Mixture of Experts (MoE) con 35.951.822.704 parámetros totales, codificador de visión y cabeza MTP (multi-token prediction) para decodificación especulativa. El contexto máximo es de 262.144 tokens, según el ejemplo de despliegue con vLLM incluido en la model card. Solo se han modificado 570 tensores entrenables (atención completa y lineal, experto compartido y su compuerta, y layer norms); el resto de pesos es idéntico al modelo base en la revisión `0e3205cf`.

La relevancia actual del modelo reside en su enfoque de "razonamiento eficiente": en lugar de recortar capacidades, optimiza el coste por respuesta en despliegues de producción con modelos de razonamiento largos. La licencia Apache 2.0 y la compatibilidad con vLLM, SGLang y llama.cpp (vía GGUF) facilitan su adopción. El repositorio ocupa 71,9 GB en BF16 y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con atención completa y lineal, codificador de visión y cabeza MTP; tag `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según el ejemplo de despliegue de la model card) |
| Tipos de cuantizacion | BF16 (modelo publicado); FP8 comprimido (repo `-FP8`); GGUF Q4_K_M, Q5_K_M, Q6_K y Q8_0 (repo `-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (14 shards, BF16); GGUF y compressed-tensors FP8 en repos derivados |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Sage-A1.5: un transformer MoE con atención completa combinada con atención lineal, un experto compartido con su compuerta y una cabeza MTP para decodificación especulativa, además de un codificador de visión que habilita la modalidad image-text-to-text. El ajuste no altera la arquitectura, el tokenizador, la plantilla de chat, el codificador de visión ni la cabeza MTP; solo cambia un shard de pesos (`model-00012-of-00014.safetensors`).

El entrenamiento consistió en 100 versiones de política de RL on-policy partiendo del modelo base. La recompensa otorgaba un bonus a las respuestas correctas más cortas que las demás respuestas correctas al mismo prompt, sin bonificación adicional por bajar del 65 % de la longitud del modelo base. Las respuestas atrapadas en bucles de repetición se penalizaban como incorrectas. Las tareas cubrieron matemáticas, ciencia, seguimiento de instrucciones y un conjunto restringido de química (edición de moléculas, esqueletos de Murcko, sistemas de anillos y recuento de anillos), sin término de longitud en estas últimas. Solo se actualizaron los tensores de atención completa y lineal, el experto compartido y su compuerta, y las layer norms; los expertos enrutados, el router, los embeddings, el codificador de visión y la cabeza MTP quedaron congelados.

## Capacidades

- Generación de texto conversacional y razonamiento multi-paso con cadenas de pensamiento más cortas que el modelo base.
- Razonamiento científico y matemático, incluidas tareas de química (edición de moléculas, esqueletos de Murcko, sistemas de anillos).
- Generación y razonamiento sobre código (evaluado en SciCode).
- Seguimiento de instrucciones complejas (evaluado en IFBench).
- Comprensión de documentos y modalidad image-text-to-text gracias al codificador de visión (evaluado en OmniDocBench).
- Soporte de tool calling y elección automática de herramientas, con parser `qwen3_coder` en vLLM.
- Capacidades agénticas y de contexto largo heredadas del modelo base (hasta 262.144 tokens), aunque no fueron evaluadas en este ajuste.
- Decodificación especulativa mediante la cabeza MTP, operativa aunque no entrenada en este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento científico en producción con coste controlado: el modelo reduce un 18 % de media los tokens de razonamiento frente al base, lo que abarata pipelines de resolución de problemas de física, química y matemáticas sin pérdida significativa de precisión.
- Asistentes de investigación química: las tareas de edición de moléculas, esqueletos de Murcko y recuento de anillos están cubiertas explícitamente en el entrenamiento, lo que lo hace adecuado para herramientas de quimioinformática asistida.
- Generación de código en pipelines de CI/CD: el soporte de tool calling y el parser `qwen3_coder` en vLLM permiten integrarlo como agente que consulta herramientas y ejecuta pasos multi-etapa.
- Procesamiento de documentos técnicos: la modalidad image-text-to-text y el contexto de 262.144 tokens permiten analizar informes, patentes o papers con tablas e imágenes en una sola pasada.
- Atención al cliente con instrucciones estrictas: el rendimiento en IFBench y la ventana de contexto larga facilitan conversaciones multi-turno con políticas de respuesta complejas.
- Despliegue en infraestructura modesta mediante GGUF: las versiones Q4_K_M (22 GB) y Q5_K_M permiten ejecutar el modelo en llama.cpp con GPUs de consumo de gama alta, algo inviable en BF16 (71,9 GB).
- Servicio de inferencia a escala con FP8: el repo `Sage-A1.5-Concise-FP8` (39 GB) está pensado para vLLM y SGLang, reduciendo el coste por token en clústeres con GPU Hopper o Ada.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en BF16 frente al modelo base Sage-A1.5. La diferencia se expresa en puntos de puntuación, con intervalo de confianza del 95 % por bootstrap emparejado sobre tareas. Las muestras se extrajeron después de elegir el checkpoint.

| Benchmark | Muestras por tarea | Diferencia vs. base | Intervalo 95 % | Menos tokens |
|---|---|---|---|---|
| ChemCoTBench | 3 | -1,05 | [-2,07, +0,02] | 26 % |
| CMT | 8 | +0,25 | [-3,12, +3,75] | 17 % |
| IFBench | 4 | +0,11 | [-1,47, +1,75] | 13 % |
| OmniDocBench | 1 | -0,28 | [-0,85, +0,30] | 11 % |
| SciCode | 4 | +0,95 | [-0,55, +2,44] | 21 % |

Muestreo: temperatura 1,0, top_p 0,95, top_k 20, presence_penalty 1,5. Las versiones cuantizadas (FP8 y GGUF) no han sido evaluadas.

## Requisitos de hardware

- VRAM en BF16: aproximadamente 72 GB de pesos más overhead de activaciones y caché KV; requiere múltiples GPU o una GPU de 80 GB con margen limitado para contexto largo.
- VRAM en FP8: aproximadamente 39 GB de pesos; cabe en una A100 80 GB, H100 80 GB o L40S 48 GB con margen.
- VRAM en GGUF: Q4_K_M ocupa 22 GB y Q8_0 hasta 38 GB; el rango completo es de 22 a 38 GB según la model card.
- GPU de consumo: las cuantizaciones Q4_K_M y Q5_K_M permiten ejecución en GPUs de consumo de gama alta con 24 GB de VRAM o más; el modelo completo en BF16 no cabe en ninguna GPU de consumo.
- Despliegue: vLLM (con `--reasoning-parser qwen3`, `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`), SGLang, llama.cpp para GGUF; Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La reducción de tokens de razonamiento (18 % de media) implica menor coste por respuesta, pero no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sage-A1.5-Concise | 35,95 B | 262.144 | Apache 2.0 | safetensors, FP8, GGUF | Ajuste RL del base; 18 % menos tokens de razonamiento |
| InternScience/Sage-A1.5 (base) | 35,95 B | 262.144 | Apache 2.0 | safetensors, FP8 | Referencia de calidad; cadenas de pensamiento más largas |
| Otros modelos MoE de ~35 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- ChemCoTBench pasa por un margen estrecho: el límite superior del intervalo es +0,02 y el estimador puntual está unos 1 punto por debajo del base; no se descarta una pérdida de hasta 2 puntos en ChemCoTBench o CMT.
- Riesgo de sobreajuste al conjunto de evaluación: se puntuaron muchas variantes de entrenamiento sobre los mismos test sets y este checkpoint fue el segundo candidato en una ronda de confirmación; cuanto más se consulta un test set, más probable es que un modelo peor pase por azar.
- Las cadenas de pensamiento son más cortas, pero no cortas: en problemas difíciles una respuesta puede superar los 20.000 tokens, gran parte dedicada a verificar una respuesta ya encontrada (en una prueba en 4 bits llegó a la respuesta correcta al 14 % del razonamiento y dedicó el resto a verificarla).
- En IFBench, aproximadamente 7 de cada 600 respuestas se repiten literalmente hasta el límite de tokens.
- Solo se evaluaron cinco benchmarks; no se evaluaron las capacidades agénticas, de uso de herramientas ni de contexto largo del modelo base.
- La cabeza MTP no fue entrenada: la decodificación especulativa sigue funcionando, pero su tasa de aceptación puede ser menor que en el modelo base y no se ha medido.
- Las versiones cuantizadas (FP8 y GGUF) no han sido evaluadas, por lo que su calidad no está verificada.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican las advertencias generales de los modelos de razonamiento.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento fuera del inglés.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del modelo base y de los componentes del codificador de visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise
- Modelo base: https://huggingface.co/InternScience/Sage-A1.5
- Versión FP8: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise-FP8
- Versión GGUF: https://huggingface.co/TheFusionCube/Sage-A1.5-Concise-GGUF
- FP8 oficial del modelo base: https://huggingface.co/InternScience/Sage-A1.5-FP8
- Paper del modelo base (arXiv 2610.28578): https://arxiv.org/abs/2610.28578
