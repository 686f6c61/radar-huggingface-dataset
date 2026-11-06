# Thox-ai/ThoxIOS-Micro-0.5B

## Resumen

ThoxIOS-Micro-0.5B es un paquete de configuración publicado por Thox-ai sobre los pesos upstream de Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo entrenado por el autor: el repositorio contiene únicamente el `Modelfile` de Ollama, un manifiesto de versión y un knowledge pack en JSONL con ocho entradas públicas verificadas. Los pesos reales son los de Qwen2.5-0.5B-Instruct, fijados por digest en el momento de la compilación y descargados por Ollama desde el tag `qwen2.5:0.5b`.

El objetivo declarado es servir como micro modelo para iOS dentro de la pila THOX: clasificación de intenciones y decisiones pequeñas al estilo ThoxMind, con inferencia local y offline a través del endpoint local de Ollama. La configuración añade un perfil de sistema específico y recuperación fundamentada sobre el knowledge pack v0.1, además de una regla explícita sobre estado en vivo para evitar que el modelo afirme disponer de telemetría o acceso a malla que no posee.

Su relevancia es acotada pero concreta: demuestra un patrón de empaquetado reproducible (base fijada por digest, perfil versionado, knowledge pack verificable) para modelos de 0,5B en dispositivos móviles. El autor advierte explícitamente de que el modelo no está cualificado sobre hardware de dispositivo y de que sus capacidades de razonamiento y recuerdo son las propias de un 0,5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 0,5B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en la evaluación publicada; contexto nativo del base no indicado en la información disponible |
| Tipos de cuantizacion | Q4_K_M (build servido en Ollama y objetivo de entrega móvil GGUF); otras cuantizaciones no disponibles |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF vía Ollama; el repositorio contiene Modelfile, manifest.json y knowledge pack JSONL, no pesos |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parámetros. No hay entrenamiento ni ajuste fino por parte de Thox-ai: la model card indica explícitamente "No training". La personalización consiste en un perfil de sistema incluido en el `Modelfile` y en el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con ocho entradas públicas verificadas que se usan para respuestas fundamentadas por recuperación.

La innovación técnica destacable no está en el modelo sino en el proceso de empaquetado: la base se fija por digest (`qwen2.5:0.5b @ a8b0c51577010a279d933d14c2a8ab4b268079d44c5c8830c0a93900f1827c67`), el manifiesto registra la versión del perfil y del knowledge pack, y el perfil se reforzó tras una primera compilación que "siguió la trampa" de una topología fabricada, añadiendo una regla de estado en vivo al inicio del perfil y una frase de cierre sobre ausencia de telemetría. Solo se publicó la segunda compilación. No se documentan datos de RLHF ni DPO más allá de los del modelo base.

## Capacidades

- Generación de texto y respuestas cortas coherentes dentro del perfil de sistema configurado.
- Clasificación de intenciones y decisiones pequeñas al estilo ThoxMind, según el uso previsto declarado.
- Respuestas fundamentadas por recuperación cuando se le suministra el pasaje del knowledge pack correspondiente.
- Rechazo de confirmaciones sobre topologías de red fabricadas (evaluado en el conjunto de pruebas del autor).
- Respuesta a preguntas de enrutamiento como recomendación etiquetada (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- Soporte de tool calling, agentes multi-paso, visión, audio, modo thinking y capacidades multilingües: no disponible (no se declaran; el modelo base es de texto y solo inglés).

## Casos de uso

- Clasificación de intenciones en una app iOS: el modelo recibe el texto del usuario y devuelve una etiqueta de intención dentro del conjunto definido por la app, ejecutándose en local sin salida a red y con un footprint de 0,59 GB de RAM medido en CPU.
- Respuestas fundamentadas sobre un dominio acotado: suministrando el pasaje del knowledge pack v0.1 en el prompt, el modelo responde con los hechos del pack (5 de 8 temas respondidos correctamente en la evaluación del autor), adecuado para asistentes de producto con documentación cerrada.
- Enrutamiento local-primero en una arquitectura híbrida: el modelo etiqueta la consulta como resoluble en local o candidata a nube, devolviendo una recomendación etiquetada que el runtime puede aplicar con consentimiento explícito del usuario.
- Prototipado rápido de asistentes embebidos: al ser un GGUF Q4_K_M de 0,40 GB servido por Ollama, permite iterar sobre el perfil de sistema y el knowledge pack sin reentrenar ni tocar pesos.
- Filtro de seguridad conversacional en el borde: el modelo puede declinar confirmaciones de estado o topología no verificables, como se probó con la trampa de topología fabricada, actuando como primera barrera antes de llamadas a servicios externos.
- Evaluación de pipelines de empaquetado reproducible: sirve como caso de referencia para equipos que quieran fijar bases por digest, versionar perfiles de sistema y auditar knowledge packs en despliegues móviles.

## Benchmarks y rendimiento

Mediciones publicadas por el autor el 2026-10-31 sobre un host x86_64 solo CPU (clase 4 vCPU / 8 GB), con contexto de 8.192 tokens y la configuración publicada:

| Metrica | Resultado |
|---|---|
| Generación de formato largo | 61,97 tokens/s (bench de 1.024 tokens) |
| Respuestas cortas | 55,9–71,2 tokens/s en el conjunto de smoke tests |
| Huella de memoria en carga | 0,59 GB RAM (0 GB VRAM, ejecución en CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Fundamentación con Knowledge Pack v0.1 | 5/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | el modelo declinó la confirmación |
| Pregunta de enrutamiento | respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la medición publicada (ejecución en CPU); para GPU, un modelo de 0,5B en Q4_K_M ocupa del orden de 0,4 GB de pesos, pero no se ha publicado medición en GPU.
- RAM medida en carga: 0,59 GB en un host de clase 4 vCPU / 8 GB.
- GPU recomendadas: no disponible; el autor no publica pruebas en GPU. Cualquier GPU consumer con unos pocos GB de memoria libre podría alojar los pesos, pero no hay cifras verificadas.
- Cabe en GPU consumer: previsiblemente sí por tamaño de pesos, aunque no está verificado en la información disponible.
- Opciones de despliegue: Ollama (modelo publicado `Thox-ai/thox-ios-micro-0.5b` o compilación local con `ollama create -f Modelfile`); otros runners no documentados.
- Latencia y throughput: 61,97 tokens/s en generación larga y 55,9–71,2 tokens/s en respuestas cortas, medidos en CPU x86_64.
- Cualificación en hardware de dispositivo iOS: no realizada ("Not qualified on device hardware").

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxIOS-Micro-0.5B | 0,5B | 8.192 tokens en la evaluación publicada | No (empaquetado sobre Qwen2.5-0.5B-Instruct) | Apache-2.0 | Ollama y repositorio HF con Modelfile, manifiesto y knowledge pack |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en la información proporcionada | Sí (modelo base) | Apache-2.0 | Hugging Face y Ollama (`qwen2.5:0.5b`) |
| Alternativas de 0,5B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: ThoxIOS-Micro-0.5B no modifica los pesos, solo añade perfil de sistema, knowledge pack y empaquetado reproducible. Frente al base, la diferencia medible es el comportamiento alineado con el perfil (3/3 en smoke tests, rechazo de la trampa de topología) y la fundamentación parcial sobre el pack (5/8). No se dispone de datos de benchmarks estándar para comparar rendimiento intrínseco con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Razonamiento y recuerdo materialmente limitados por el tamaño de 0,5B; el propio autor advierte de que las respuestas deben tratarse en consecuencia.
- La fundamentación con el knowledge pack es parcial: 5 de 8 temas respondidos con los hechos del pack en la evaluación publicada.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- Sin contexto suministrado, el modelo debe declarar que no dispone de la información en lugar de inventar especificaciones de THOX; el cumplimiento de esta regla depende del perfil y no está garantizado en todos los casos.
- Solo inglés declarado; sin capacidades multilingües documentadas.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos nunca proporcionan enrutamiento en vivo ni acceso a malla.
- No cualificado en hardware de dispositivo iOS; el objetivo de entrega es un GGUF móvil Q4_K_M, pero no hay validación en dispositivo.
- Riesgo de alucinación inherente a un modelo de este tamaño, especialmente en preguntas factuales fuera del knowledge pack.
- Licencia Apache-2.0 heredada del base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) se declaran igualmente bajo esa licencia, sin restricciones comerciales adicionales indicadas.
- El repositorio de Hugging Face no contiene pesos: quien quiera ejecutar el modelo debe descargarlo vía Ollama o compilarlo desde el `Modelfile`, lo que introduce dependencia del tag upstream fijado.

## Enlaces

- [Hugging Face: Thox-ai/ThoxIOS-Micro-0.5B](https://huggingface.co/Thox-ai/ThoxIOS-Micro-0.5B)
- [Modelo base: Qwen/Qwen2.5-0.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct)
- Modelo publicado en Ollama: `Thox-ai/thox-ios-micro-0.5b` (sin URL directa en la información disponible)
- Papers, blogs, repositorios y demos adicionales: no disponible
