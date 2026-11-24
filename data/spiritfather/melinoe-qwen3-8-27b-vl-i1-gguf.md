# spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF

## Resumen

Melinoe-Qwen3-8-27B-VL-i1-GGUF es una recopilación de cuantizaciones GGUF generadas con matriz de importancia (imatrix) a partir del modelo bgg1996/Melinoe-Qwen3-8-27B-VL, un modelo multimodal de 27.320.697.856 parámetros construido sobre la familia Qwen3. El trabajo de cuantización lo firma el usuario spiritfather y su objetivo es hacer viable la inferencia local de un modelo de casi 27B con capacidades de visión en hardware de consumo, ofreciendo desde cuantizaciones de 10,9 GB (Q2_K) hasta 22,4 GB (Q6_K).

La relevancia de esta ficha no está en el modelo base —del que la información disponible es escasa— sino en el proceso de cuantización: los quants ponderados con imatrix calculada sobre el dataset de calibración bartowski calibration_datav3 asignan precisión de forma selectiva, de modo que los formatos de baja tasa de bits (IQ1–IQ4) rinden notablemente mejor que cuantizaciones estáticas del mismo tamaño, mientras que en Q5 y Q6 la diferencia es despreciable según el autor.

El modelo está orientado a generación de texto creativo y roleplay, y se distribuye bajo licencia Apache 2.0. Un detalle operativo crítico: llama.cpp excluye la torre de visión del GGUF principal, por lo que el uso multimodal exige cargar además el fichero `mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf` junto a la cuantización elegida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen3, multimodal texto+visión) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (todas con imatrix i1) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base bgg1996/Melinoe-Qwen3-8-27B-VL. Por el nombre y la procedencia se trata de un derivado de la familia Qwen3 con capacidad de visión (VL), pero la información proporcionada no especifica si emplea atención estándar, atención lineal, mezcla de expertos ni detalles sobre capas, cabezas de atención o dimensionalidad oculta. Tampoco se documentan el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado.

Lo que sí está documentado es el proceso de cuantización. El autor aplica cuantización ponderada con matriz de importancia (imatrix) calculada sobre bartowski calibration_datav3, una práctica que estima la sensibilidad de cada tensor y redistribuye los bits disponibles hacia los pesos con mayor impacto en la salida. El resultado son los ficheros etiquetados como `i1`. El autor indica explícitamente que la ventaja frente a cuantizaciones estáticas equivalentes se concentra en los rangos IQ1–IQ4 y desaparece en Q5/Q6. Existe además un repositorio paralelo con cuantizaciones estáticas (no imatrix) en spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF.

La separación de la torre de visión en un fichero `mmproj` aparte es una consecuencia del formato GGUF en llama.cpp: los pesos del codificador visual se almacenan en un GGUF independiente en BF16 y se cargan mediante el flag `--mmproj` de `llama-server`.

## Capacidades

- Generación de texto conversacional y creativo, con énfasis declarado en escritura creativa y roleplay.
- Procesamiento multimodal de imagen y texto, siempre que se cargue el fichero `mmproj` junto a la cuantización.
- Conversación multi-turno en formato chat (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que facilita su despliegue tras una API compatible con OpenAI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Modo thinking explícito, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Escritura creativa asistida: el modelo está etiquetado y evaluado específicamente para prosa creativa, de modo que puede emplearse para generar borradores de relatos, diálogos y descripciones con un registro literario cuidado, ejecutándose en local con un quant Q4_K_M de 16,8 GB.
- Roleplay y personajes conversacionales: la benchmark CaliperBench puntúa explícitamente la "willingness" (predisposición) además de la calidad de prosa, lo que indica que el modelo está ajustado para mantener personajes y sostener interacción prolongada sin romper el rol.
- Descripción y análisis de imágenes en local: cargando el `mmproj` en BF16 junto al quant, el modelo puede procesar capturas, ilustraciones o fotografías y generar descripciones textuales, útil en flujos de catalogación de imágenes sin enviar datos a la nube.
- Prototipado de asistentes conversacionales en estaciones de trabajo: con un Q4_K_S de 15,8 GB cabe en GPUs de consumo de 16 GB o en configuraciones mixtas CPU/GPU, permitiendo iterar sobre prompts y system messages sin coste por token.
- Generación de texto en pipelines de CI o scripts: al ser GGUF y funcionar con llama.cpp, puede integrarse en herramientas de línea de comandos para tareas de generación por lotes (sinopsis, resúmenes narrativos, variaciones de texto) en entornos sin GPU dedicada usando cuantizaciones Q2_K o Q3.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 15 variantes del mismo modelo, lo que lo convierte en un banco de pruebas práctico para medir la degradación de calidad entre IQ3_S (12,6 GB) y Q6_K (22,4 GB) en tareas de escritura, un caso de uso metodológico habitual entre quienes ajustan despliegues locales.
- Despliegue con API compatible: gracias a la etiqueta `endpoints_compatible`, puede servirse con `llama-server` y consumirse desde clientes que esperan el esquema de OpenAI, integrándose en aplicaciones web o bots de chat autoalojados.

## Benchmarks y rendimiento

La model card menciona que el modelo está evaluado en CaliperBench, una benchmark de escritura creativa que puntúa calidad de prosa, roleplay y predisposición, en lugar de inteligencia general. Sin embargo, no se incluyen los valores numéricos de las puntuaciones en la información proporcionada.

| Benchmark | Resultado | Notas |
|---|---|---|
| CaliperBench | no disponible (puntuaciones publicadas en caliperbench.com) | Benchmark de escritura creativa, no de inteligencia general |
| MMLU | no disponible | |
| HumanEval | no disponible | |
| GSM8K | no disponible | |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más overhead de contexto KV. Rangos: 10,9 GB (Q2_K), 12,3–14,6 GB (Q3), 15,3–17,3 GB (Q4), 19,0–19,5 GB (Q5), 22,4 GB (Q6). El fichero `mmproj` en BF16 añade VRAM adicional para uso multimodal (tamaño no especificado en la información disponible).
- GPU recomendadas: para Q4_K_M (16,8 GB) se requiere una GPU de 24 GB (RTX 3090, RTX 4090, A10G) o reparto CPU/GPU. Para Q6_K (22,4 GB) conviene una GPU de 24 GB con margen ajustado o superior (A100 40 GB, H100). Para Q2_K o IQ3_S puede intentarse en GPUs de 12–16 GB (RTX 4070 Ti, RTX 4080) con contexto reducido.
- ¿Cabe en GPU de consumo? Sí, en función del quant: Q2_K y Q3 en GPUs de 12–16 GB; Q4 en 16–24 GB; Q5 y Q6 requieren 24 GB o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp (`llama-server` con `--mmproj` para multimodal), Ollama (importando el GGUF), y cualquier frontend compatible con GGUF. El repositorio también declara compatibilidad con endpoints. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Melinoe-Qwen3-8-27B-VL-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF (15 quants imatrix) | Enfoque en escritura creativa y roleplay; VL con mmproj separado |
| spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF (quants estáticos) | Misma base sin imatrix; peor relación calidad/tamaño en IQ1–IQ4 según el autor |
| bgg1996/Melinoe-Qwen3-8-27B-VL | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar; requiere hardware de gama alta |
| Alternativas de la familia Qwen3 de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con modelos de otras familias (Llama, Mistral, Gemma) no puede establecerse con rigor porque no se han proporcionado datos de rendimiento de este modelo ni de sus competidores directos.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`language: en`). No hay evidencia de calidad en castellano ni en otros idiomas, por lo que su uso en producción multilingüe requeriría validación propia.
- Sesgos: no documentados en la información disponible. Al ser un modelo orientado a escritura creativa y roleplay, es esperable una mayor permisividad en contenido sensible, pero no se especifican políticas de moderación.
- Riesgo de alucinación: no cuantificado. La benchmark citada (CaliperBench) no mide veracidad factual, sino calidad de prosa, por lo que un buen resultado ahí no implica fiabilidad en tareas de conocimiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base bgg1996/Melinoe-Qwen3-8-27B-VL y, en su caso, la de Qwen3, ya que las obligaciones pueden acumularse.
- Visión: el GGUF principal no contiene la torre visual. Omitir el fichero `mmproj` desactiva silenciosamente la capacidad multimodal.
- Cuantizaciones de baja tasa: Q2_K (10,9 GB) y Q3_K_S (12,3 GB) degradan la calidad de forma apreciable; el autor solo garantiza ventaja de imatrix en IQ1–IQ4 y recomienda Q4_K_M como opción rápida y Q4_K_S como equilibrio tamaño/velocidad/calidad.
- Contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas sin pruebas empíricas.
- Madurez: el repositorio tiene 341 descargas y 0 likes, y fue creado en agosto de 2026; es un artefacto reciente y con poca validación comunitaria.
- Tamaño del repo: 235,5 GB en total, lo que exige planificar el almacenamiento antes de descargar varias cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF
- Modelo base: https://huggingface.co/bgg1996/Melinoe-Qwen3-8-27B-VL
- Cuantizaciones estáticas (no imatrix): https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-GGUF
- Fichero de proyección visual (mmproj): https://huggingface.co/spiritfather/Melinoe-Qwen3-8-27B-VL-i1-GGUF/resolve/main/mmproj-Melinoe-Qwen3-8-27B-VL-BF16.gguf
- CaliperBench (benchmark): https://caliperbench.com
- Puntuaciones del modelo en CaliperBench: https://caliperbench.com/m/melinoe-qwen3.8-27b-vl/
- Dataset de calibración bartowski calibration_datav3: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- Guía de uso de GGUF (referencia citada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
