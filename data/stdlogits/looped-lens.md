# stdlogits/looped-lens

## Resumen

Looped-lens es un conjunto de pesos publicado por el usuario stdlogits (Standard Logits) como contribución al Looped Lens Challenge organizado por NDIF, en su edición Inkling 2 Mini. No se trata de un modelo de lenguaje completo, sino de un artefacto auxiliar de inferencia: cada fichero `*_selector.safetensors` contiene un selector de posición compuesto por dos scorers lineales (pointwise y listwise) que operan sobre los estados RMS-normalizados que entran en las visitas a las capas 36 y 42 del modelo base, en cada posición candidata.

El problema que resuelve es acotado y específico: en arquitecturas con capas recurrentes o reutilizadas (looped), decidir en qué posiciones conviene actuar o qué visitas de capa resultan informativas. El selector puntúa esas posiciones mediante transformaciones lineales sobre los estados internos, de modo que el sistema pueda elegir candidatos sin coste adicional de un modelo auxiliar grande.

La relevancia es limitada fuera del contexto de la competición. El repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes, carece de pipeline declarado y no documenta idiomas soportados. Su interés es fundamentalmente el de un artefacto reproducible para quienes participen en el reto o investiguen selectores de posición sobre modelos con capas looped.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | selectores lineales (pointwise y listwise) sobre estados RMS-normalizados de las visitas a capas 36 y 42; no es un transformer completo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Inkling 2 Mini) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (`*_selector.safetensors`) |

## Arquitectura y entrenamiento

El artefacto no implementa una red neuronal profunda. Cada fichero de selector contiene dos scorers lineales: uno pointwise, con tensores `pw_mu`, `pw_sd`, `pw_W` y `pw_b`, y otro listwise, con `lw_mu`, `lw_sd` y `lw_w`. Ambos operan sobre los estados RMS-normalizados que entran en las visitas a las capas 36 y 42 del modelo base en cada posición candidata. La normalización previa (media y desviación típica almacenadas como tensores) forma parte del propio artefacto, lo que hace el selector autocontenido respecto a la escala de los estados.

Según la model card, los scorers se entrenaron con prompts escritos por el autor y con ítems de los bancos públicos de evaluación de lentes de WorkspaceBench. No se almacenan preguntas ni respuestas del reto. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo ajuste por RLHF o DPO; todos estos datos deben considerarse no disponibles. La innovación técnica es la separación en dos cabezas de puntuación (pointwise y listwise) sobre visitas de capa concretas, lo que permite un selector muy ligero en parámetros y en coste de cómputo.

## Capacidades

- Puntuación de posiciones candidatas mediante un scorer lineal pointwise sobre estados normalizados.
- Puntuación listwise, útil para ordenar o comparar conjuntos de posiciones en lugar de evaluarlas de forma independiente.
- Selección de posiciones en las visitas a las capas 36 y 42 de un modelo con capas looped (Inkling 2 Mini).
- Integración vía `lenses.fetch` en el entorno de NDIF al inicio de cada sesión.
- No genera texto, no razona, no escribe código ni resuelve matemáticas: no es un modelo generativo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso por sí mismo.
- Capacidades multilingües: no disponibles (no aplica a un selector lineal).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Participación en el Looped Lens Challenge de NDIF: el artefacto se carga con `lenses.fetch` al inicio de sesión y se usa tal cual como entrada del reto, lo que permite reproducir la submission de Standard Logits.
- Investigación sobre selectores de posición en modelos con capas reutilizadas: sirve como línea base lineal para comparar con selectores más complejos (MLP, atención) sobre las mismas visitas de capa 36 y 42.
- Análisis de la informatividad de capas concretas: al puntuar únicamente las visitas 36 y 42, permite estudiar si esas capas concentran señal suficiente para tareas de selección.
- Evaluación reproducible con WorkspaceBench: al haberse entrenado parcialmente con ítems de sus bancos públicos de lens-eval, facilita experimentos comparables dentro de ese ecosistema.
- Estudio de normalización de estados: los tensores `mu` y `sd` permiten analizar cómo afecta la RMS-normalización a la separabilidad de posiciones candidatas.
- Docencia o prototipado de mecanismos de selección: por su tamaño reducido y su licencia MIT, es adecuado como ejemplo mínimo de selector lineal sobre estados internos en un curso o tutorial.
- Integración en pipelines de evaluación de NDIF: como paso previo a la evaluación de lentes, para filtrar posiciones candidatas antes de aplicar métricas más costosas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio se declara como 0.0 GB, por lo que los pesos del selector son marginales frente al modelo base.
- GPU recomendadas: no disponibles para el selector; el coste real depende del modelo base Inkling 2 Mini y del entorno NDIF.
- ¿Cabe en GPU de consumo? El selector en sí es presumiblemente trivial en memoria, pero la inferencia completa requiere ejecutar el modelo base, cuyos requisitos no se documentan.
- Opciones de despliegue: carga mediante `lenses.fetch` en NDIF; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stdlogits/looped-lens | selector lineal (pointwise + listwise) | no disponible | no disponible | MIT | Hugging Face, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros selectores de posición publicados para el mismo reto que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni responde preguntas; usarlo como tal producirá resultados inválidos.
- Dependencia estricta del modelo base: los scorers están definidos sobre los estados de las visitas a las capas 36 y 42 de Inkling 2 Mini; con otra arquitectura o otro número de capas no son aplicables.
- Sin datos de evaluación publicados: no hay benchmarks que permitan estimar su calidad frente a alternativas.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los pesos hayan sido validados por terceros.
- Idiomas no documentados: no puede afirmarse cobertura multilingüe ni monolingüe.
- Riesgo de sobreajuste a los bancos de evaluación: el entrenamiento usó ítems de WorkspaceBench, por lo que el rendimiento en dominios distintos no está caracterizado.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece ninguna garantía sobre idoneidad o exactitud.
- Ausencia de documentación sobre cuantización, latencia y requisitos de hardware: dificulta planificar un despliegue en producción.
- Fecha de creación futura en los metadatos (2026-11-24): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stdlogits/looped-lens
- NDIF (organizador del Looped Lens Challenge): no disponible en la información proporcionada
- WorkspaceBench (bancos de lens-eval citados): no disponible en la información proporcionada
- Documentación de `lenses.fetch`: no disponible en la información proporcionada
