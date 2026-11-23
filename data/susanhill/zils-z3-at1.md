# SusanHill/zils-z3-at1

## Resumen

zils-z3-at1 es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B, publicado por el usuario SusanHill bajo licencia Apache 2.0. Con 26.895.998.464 parámetros totales (aproximadamente 26,9 mil millones) y un repositorio de 54,7 GB, el modelo se distribuye en formato safetensors para la librería transformers y está etiquetado con el pipeline de text-classification, aunque también conserva capacidades de generación de texto. La información disponible lo vincula a un corpus de destilación de conocimiento (SargeDev/jev-distill-corpus-v3) y a un profesor denominado TypeSafe Jev 1.13.

El modelo se presenta como un sistema de decisiones tipadas con dos cabezas (dual-head) y una separación explícita entre un modo "System 1" (decisiones rápidas y calibradas) y un modo "System 2" (generación y razonamiento deliberativo). Según los datos de la model card, la ruta System 1 produce distribuciones de probabilidad calibradas sobre opciones discretas, mientras que la ruta System 2 emplea el lm_head original del modelo base. Esta arquitectura híbrida, denominada "Blocks of Experts" en las etiquetas, busca resolver el problema de obtener decisiones rápidas y bien calibradas sin sacrificar la capacidad generativa del modelo subyacente.

La relevancia actual del modelo reside en su enfoque hacia la calibración probabilística y la destilación de un profesor cerrado, con métricas declaradas de ECE de 0,0009 y AUROC de 0,996 en el conjunto de test de 30.000 filas. No obstante, conviene señalar que todas las métricas del model-index están marcadas como no verificadas y que el modelo cuenta con cero descargas y cero likes en el momento de la consulta, por lo que se trata de una publicación reciente y sin validación independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con cabezas duales (dual-head), etiquetada como "blocks-of-experts"; derivada de Qwen3.8-27B |
| Parámetros totales | 26.895.998.464 (aprox. 26,9 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible en la información proporcionada (la model card menciona pruebas con prompts de hasta 256K tokens, pero no se especifica la ventana oficial) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B como modelo base y se ajusta mediante destilación de conocimiento desde un profesor denominado TypeSafe Jev 1.13. La arquitectura incorpora dos cabezas: una cabeza de decisión tipada que emite distribuciones calibradas sobre las opciones de una pregunta (etiquetas "noul", "choice" y "score") y una cabeza de lenguaje convencional (lm_head) que se mantiene para la generación de texto en la ruta System 2. Las etiquetas del modelo indican el uso de LoRA en el ajuste y de un esquema de "blocks-of-experts", aunque no se detalla en la información disponible cómo se organizan dichos bloques ni cuántos expertos contiene el modelo.

El entrenamiento se realizó sobre el corpus SargeDev/jev-distill-corpus-v3, un conjunto de destilación en el que el profesor genera distribuciones objetivo sobre decisiones tipadas. Según la model card, 25.376 de las 29.955 filas del conjunto de test contienen distribuciones del profesor TypeSafe Jev 1.13. No se especifica el número total de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. La innovación técnica principal declarada es la separación de rutas (System 1 frente a System 2) sobre un único conjunto de pesos y un único motor de inferencia (vLLM), con enrutado por petición, junto con la calibración de probabilidades mediante temperatura.

## Capacidades

- Generación de texto y razonamiento en la ruta System 2, empleando el lm_head del modelo base sin el adaptador de decisiones.
- Generación de código: la model card declara un pass@1 de 0,78 en HumanEval en la ruta System 2 con decodificación greedy.
- Decisiones tipadas calibradas: emisión de probabilidades sobre opciones discretas en tres formatos (noul, choice, score), con calibración tras aplicar temperatura.
- Preguntas de elección con hasta 256 opciones sin reentrenamiento, según la model card.
- Manejo de prompts largos: la model card reporta aciertos en decisiones que dependen de una frase oculta a profundidad aleatoria en hasta 250.000 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo de idiomas; no se documentan otras lenguas.
- Capacidad especial de modo "thinking": la separación System 1 / System 2 puede interpretarse como un modo rápido y un modo deliberativo, aunque no se describe un modo de pensamiento explícito al estilo de otros modelos.
- Visión: no disponible en este modelo; la model card remite a una variante separada (autotrust/JEV-27B-VL).

## Casos de uso

- Clasificación y enrutado de intenciones en asistentes conversacionales: el modelo puede recibir una consulta y un conjunto de hasta 256 opciones etiquetadas, devolviendo una probabilidad calibrada por opción; la model card reporta un 89,5 % de acierto zero-shot en CLINC150 con 150 intenciones, lo que lo hace adecuado para triaje de tickets o enrutado a departamentos.
- Puntuación y ranking de contenidos: la cabeza de tipo "score" produce una estimación en escala 0-5 con un MAE declarado de 0,098, útil para ordenar noticias, resultados de búsqueda o candidatos según relevancia o importancia.
- Filtrado y moderación con umbrales probabilísticos: gracias a la calibración (ECE de 0,0009 declarado), las probabilidades pueden usarse directamente como umbrales operativos en pipelines de moderación o verificación, sin necesidad de recalibración posterior.
- Generación de código en herramientas de desarrollo: la ruta System 2, con pass@1 de 0,78 en HumanEval, permite su uso en asistentes de autocompletado o generación de funciones dentro de entornos de desarrollo, siempre que se valide el código generado.
- Análisis de documentos largos con preguntas puntuales: la capacidad declarada de localizar una frase relevante en prompts de hasta 250.000 tokens lo hace adecuado para resumir contratos, extraer cláusulas o responder preguntas sobre informes extensos.
- Sistemas de recomendación con ranking calibrado: la model card menciona una demo de recomendación y búsqueda (news.guru.so) en la que cada ranking es una decisión System 1 calibrada en aproximadamente medio segundo, patrón reutilizable en motores de recomendación de noticias o productos.
- Destilación y sustitución de APIs cerradas: al estar entrenado para imitar las distribuciones de un profesor cerrado con una KL media declarada de 0,0186, puede emplearse como sustituto local de dicho profesor en entornos con requisitos de privacidad o de coste.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Tarea | Conjunto de datos | Métrica | Valor |
|---|---|---|---|
| Decisiones tipadas (noul / choice / score) | jev-distill-corpus-v3 · test_set_30k | KL media (target ‖ modelo) | 0,0186 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | AUROC de noul | 0,996 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Brier de noul | 0,0013 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | MAE del valor esperado de score (escala 0-5) | 0,098 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | ECE (15 bins, tras temperatura) | 0,0009 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Acierto top-1 de choice (todas las filas) | 0,903 |
| Decisiones tipadas | jev-distill-corpus-v3 · test_set_30k | Acierto top-1 de choice (filas decisivas, gap top-2 ≥ 0,1) | 0,958 |
| Generación de código (System 2) | HumanEval · test | pass@1 (greedy) | 0,78 |

La model card incluye además una tabla de benchmarks públicos de decisión (JevBench, Kev, OpenJev text, Nimble, VitaminC, MASSIVE-en) en la que se compara con TypeSafe Jev 1.13, NeoHorse-Jev-4B y Open-Jev-9B, con una media de seis grupos de 84,07 para este modelo. Esa tabla no forma parte del model-index y no se ha podido verificar de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (26,9 mil millones de parámetros), en FP16 se requerirían aproximadamente 54 GB de VRAM, y en cuantizaciones de 8 bits o 4 bits el requisito bajaría considerablemente, aunque no se documentan los formatos de cuantización soportados.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPUs de centro de datos como A100 80 GB o H100 para precisión completa; no se confirma compatibilidad con GPUs de consumo.
- ¿Cabe en GPU de consumo? No confirmado. Con 26,9 mil millones de parámetros, solo sería viable en GPUs de consumo mediante cuantización agresiva, opción que no está documentada.
- Opciones de despliegue: la model card menciona vLLM como motor recomendado, con un script `serve_decide.py` que añade el endpoint `POST /v1/decide`. También se etiqueta con transformers. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card afirma que responde una decisión en aproximadamente la mitad del tiempo que tarda la API alojada del profesor, y que cada ranking calibrado se produce en torno a medio segundo; no se proporcionan cifras absolutas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-z3-at1 (este modelo) | 26,9 mil millones | no disponible | KL 0,0186; ECE 0,0009; pass@1 0,78 en HumanEval | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (base) | ~27 mil millones (según nombre) | no disponible | no disponible | no disponible en la información | Hugging Face |
| NeoHorse-Jev-4B | ~4 mil millones (según nombre) | no disponible | Media de seis grupos: 77,70 (según tabla de la model card) | no disponible | Hugging Face |
| Open-Jev-9B | ~9 mil millones (según nombre) | no disponible | Media de seis grupos: no disponible completa en el extracto | no disponible | Hugging Face |

La comparación se limita a los datos presentes en la información proporcionada; no se dispone de especificaciones completas de los modelos alternativos ni de resultados verificados de forma independiente.

## Limitaciones y advertencias

- Todas las métricas del model-index están marcadas como no verificadas (`verified: false`); deben tratarse como declaraciones del autor y no como resultados auditados.
- El modelo solo declara soporte de inglés; no se documentan capacidades en castellano ni en otras lenguas.
- No se especifica la longitud de contexto oficial, pese a que la model card menciona pruebas con prompts de hasta 256K tokens; esto puede generar expectativas no respaldadas por una especificación formal.
- No se documentan sesgos conocidos, pero al derivar de Qwen3.8-27B y entrenarse sobre un corpus de destilación específico, puede heredar sesgos del modelo base y del profesor, así como del corpus SargeDev/jev-distill-corpus-v3.
- Riesgo de alucinación: la ruta System 2 emplea el lm_head del modelo base, por lo que la generación de texto libre puede producir contenido factualmente incorrecto; la calibración declarada aplica a las decisiones tipadas, no necesariamente a la generación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B puede tener condiciones adicionales que no se detallan en la información proporcionada; conviene verificar la licencia del modelo base antes de un despliegue comercial.
- El modelo tiene cero descargas y cero likes, y fue creado el 23 de noviembre de 2026; carece de validación por parte de la comunidad.
- La nomenclatura de la model card (referencias a "autotrust/JEV-27B", "TypeSafe Jev 1.13", demos y variantes VL) no coincide con el identificador del repositorio (SusanHill/zils-z3-at1), lo que introduce ambigüedad sobre la procedencia y la relación exacta entre ambos artefactos.
- No se documentan los formatos de cuantización soportados, lo que dificulta planificar despliegues en hardware con VRAM limitada.

## Enlaces

- Hugging Face: https://huggingface.co/SusanHill/zils-z3-at1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Variante con visión mencionada en la model card: https://huggingface.co/autotrust/JEV-27B-VL
- Demo de recomendación y búsqueda mencionada en la model card: https://news.guru.so/ui
- Evaluación de referencia citada en la model card: https://huggingface.co/TokenRhythm/NeoHorse-Jev-4B/blob/b50e043e22e0e41e7fc0c244e4daa707b8124930/README.md
