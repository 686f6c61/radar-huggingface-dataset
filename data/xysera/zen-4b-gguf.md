# xysera/zen-4b-gguf

## Resumen

Zen 4B GGUF es la conversión al formato GGUF del modelo Xysera Zen 4B, publicada por el mismo autor (xysera) para su uso con llama.cpp y runtimes compatibles. No se trata de un modelo entrenado de forma independiente: es un proceso de cuantización y empaquetado del release original en BF16, del que solo se distribuye un fichero `zen-4b-Q4_K_M.gguf` de cuantización 4-bit. El repositorio ocupa 2,5 GB y el modelo cuenta con 4.022.468.096 parámetros (aproximadamente 4B).

El modelo base, según su propia model card, es un modelo fusionado (merged) en BF16 obtenido mediante la primera pasada completa de adaptación parametrizada eficiente de Xysera, y está orientado a investigación, evaluación y prototipado local. Las etiquetas del modelo original incluyen `reasoning`, `instruction-following`, `conversational` y `causal-lm`, lo que sitúa a Zen 4B en la categoría de modelos de lenguaje conversacionales de pequeño tamano con instrucciones.

Su relevancia practica es la de un modelo de 4B parámetros con licencia Apache 2.0 que puede ejecutarse en hardware de consumo. La información pública disponible es muy limitada: no se han publicado detalles de arquitectura, longitud de contexto, composición del dataset ni resultados de benchmarks, y el repositorio GGUF registra 0 descargas en el momento de la consulta, por lo que debe tratarse como un artefacto de evaluación y no como una opción validada en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (`causal-lm` según etiquetas del modelo base); detalles internos no disponibles |
| Parámetros totales | 4.022.468.096 (aproximadamente 4B) |
| Parámetros activos | No aplica / no disponible (no se ha publicado información que indique una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (4-bit) en este repositorio; el modelo base se publica en BF16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`zen-4b-Q4_K_M.gguf`); el modelo base en safetensors BF16 |

## Arquitectura y entrenamiento

El modelo base se describe como un modelo causal de lenguaje en BF16 resultante de una fusión (merge) tras una pasada de adaptación parametrizada eficiente desarrollada por Xysera. Esto implica que el punto de partida no es un entrenamiento desde cero, sino una adaptación de bajo rango o similar sobre pesos preexistentes, posteriormente fusionada en un checkpoint denso en BF16. No se ha publicado información sobre el modelo base utilizado, el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

Tampoco se detallan innovaciones técnicas específicas (atención lineal, decodificación especulativa, atención con ventana deslizante, etc.) ni la configuración de capas, cabezas de atención o tokenizador. El repositorio GGUF no aporta información adicional: es una conversión de formato y cuantización, sin cambios en los pesos más allá de la pérdida de precisión inherente al esquema Q4_K_M.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del modelo base.
- Seguimiento de instrucciones (`instruction-following`), orientado a tareas de prompt directo.
- Razonamiento (`reasoning`) como etiqueta declarada por el autor; sin benchmarks públicos que lo cuantifiquen.
- Generación de código y matemáticas: no confirmado explícitamente en la documentación disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Multilingüismo: limitado a inglés según el campo `language` de la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Ejecución local offline mediante `llama-cli` y runtimes compatibles con GGUF.

## Casos de uso

- Prototipado local de asistentes conversacionales: al ser un GGUF Q4_K_M de 2,5 GB, permite iterar sobre prompts y flujos conversacionales en un portátil sin GPU dedicada, usando llama.cpp en CPU.
- Evaluación comparativa de modelos de 4B: sirve como punto de referencia adicional en pruebas internas de calidad de respuesta frente a otros modelos pequeños, siempre que se asuma la ausencia de benchmarks publicados.
- Generación de texto asistida en herramientas de escritorio: integrable en aplicaciones tipo LM Studio, KoboldCpp o GPT4All para redacción y resumen de documentos en inglés.
- Filtrado y clasificación de texto en pipelines por lotes: con 4B parámetros y cuantización 4-bit, el coste por token es bajo y permite procesar grandes volúmenes en CPU o en una GPU de gama media.
- Base para experimentos de ajuste fino: el checkpoint BF16 original (Apache 2.0) puede servir como punto de partida para LoRA/QLoRA en tareas específicas, y el GGUF para validar el comportamiento previo.
- Entorno de aprendizaje y docencia: útil para demostrar el flujo completo de cuantización, despliegue con llama.cpp y consumo de modelos desde API compatible con OpenAI (`endpoints_compatible`).
- Pruebas de integración en pipelines CI/CD de aplicaciones LLM: validar contratos de API y manejo de errores con un modelo pequeño y determinista en coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3 GB para el fichero Q4_K_M; con KV cache y contexto moderado, entre 3,5 y 5 GB según longitud de contexto configurada.
- Memoria RAM: ejecutable en CPU con unos 4-6 GB de RAM libre usando llama.cpp con mapeo de memoria.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 2060, RX 6600). Para mayor throughput, RTX 4090 o A100 no aportan ventaja significativa por el reducido tamano del modelo, salvo en batch alto.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs dedicadas modernas con 6 GB o más, y en iGPUs con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama (importando el GGUF con un Modelfile), LM Studio, KoboldCpp, text-generation-webui. vLLM y TGI tienen soporte limitado o experimental de GGUF; para producción a gran escala conviene partir del checkpoint BF16 y convertir a un formato nativo.
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud para 4B en Q4_K_M, cabría esperar decenas de tokens por segundo en GPU de consumo y un dígito alto en CPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

Datos de referencia de cada alternativa tomados de sus model cards públicas; el contexto y rendimiento de Zen 4B no están publicados, por lo que la comparación es estructural.

| Modelo | Parámetros | Contexto | Licencia | Formato GGUF disponible | Rendimiento publicado |
|---|---|---|---|---|---|
| Zen 4B (xysera) | 4,02B | No disponible | Apache 2.0 | Sí (Q4_K_M) | No disponible |
| Llama 3.2 3B Instruct | 3,21B | 128K | Llama 3.2 Community License | Sí | Sí (MMLU, HumanEval, etc.) |
| Qwen2.5 3B Instruct | 3,09B | 32K | Apache 2.0 | Sí | Sí |
| Phi-3.5-mini Instruct | 3,82B | 128K | MIT | Sí | Sí |
| Gemma 2 2B Instruct | 2,61B | 8K | Gemma Terms of Use | Sí | Sí |

Las alternativas cuentan con documentación técnica detallada, contextos declarados y evaluaciones publicadas, además de comunidades activas y múltiples cuantizaciones (incluidas las de terceros como mradermacher para el propio Zen 4B). Zen 4B solo es competitivo en esta comparación por licencia permisiva y tamano; carece de datos que permitan situarlo en calidad de respuesta.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia pública de calidad en MMLU, HumanEval, GSM8K ni evaluaciones conversacionales, por lo que no puede recomendarse para producción sin una evaluación propia.
- Documentación mínima: se desconoce la arquitectura exacta, la longitud de contexto soportada, el tokenizador, la plantilla de prompt y el dataset de entrenamiento. Usar una plantilla de chat incorrecta degradará la calidad de forma notable.
- Solo inglés: el campo `language` declara únicamente `en`; el rendimiento en castellano es impredecible y probablemente deficiente.
- Riesgo de alucinación: inherente a los modelos de 4B parámetros, especialmente en tareas de conocimiento factual, matemáticas y código, sin que existan datos que permitan acotarlo.
- Sesgos: no se ha publicado ninguna evaluación de sesgos, toxicidad o robustez. Al derivar de un proceso de adaptación eficiente sobre pesos preexistentes, hereda los sesgos del modelo base, que no se identifica.
- Pérdida por cuantización: el Q4_K_M introduce degradación respecto al BF16 original, especialmente en tareas de razonamiento y en la fidelidad de formatos estructurados.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero conviene verificar la licencia del modelo base subyacente, no declarada en la información disponible.
- Madurez: 0 descargas y 1 like en el repositorio GGUF; no hay evidencia de uso en la comunidad ni de mantenimiento posterior a la publicación (27 de octubre de 2026).
- Idoneidad: el propio autor indica que el modelo base está pensado para investigación, evaluación y prototipado local, no para despliegue en producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xysera/zen-4b-gguf
- Modelo base: https://huggingface.co/xysera/zen-4b
- Cuantizaciones de terceros: https://huggingface.co/mradermacher/zen-4b-GGUF
- Herramienta de inferencia compatible: https://github.com/ggml-org/llama.cpp
- Documentación de formato GGUF: https://github.com/ggml-org/ggml/blob/master/docs/gguf.md
