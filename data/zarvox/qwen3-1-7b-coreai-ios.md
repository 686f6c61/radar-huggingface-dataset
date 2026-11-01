# Zarvox/qwen3-1.7b-coreai-ios

## Resumen

Zarvox/qwen3-1.7b-coreai-ios es una exportación del modelo Qwen/Qwen3-1.7B de Alibaba realizada con la herramienta coreai-models de Apple, orientada a la inferencia en dispositivo (on-device) en iPhone. El modelo se distribuye en formato nativo de Core AI, no en safetensors ni GGUF, con pesos cuantizados a 6 bits mediante palettización, formas estáticas y una ventana de contexto fija de 4096 tokens. Su propósito declarado es el etiquetado (tagging) local dentro de la aplicación Stash para iOS.

La relevancia de esta ficha es doble: por un lado, muestra el estado del arte en despliegue de LLM sobre el Neural Engine de Apple, con compilación ahead-of-time por familia de chip (A17 Pro, A18 Pro, A19 Pro); por otro, sirve como referencia práctica de las restricciones que impone ese entorno, como el contexto recortado a 4096 tokens frente a los 32 768 del Qwen3-1.7B original, o la ausencia de pesos reutilizables fuera del ecosistema Core AI.

El repositorio ocupa 4,7 GB e incluye tanto el bundle raíz (metadata.json, el modelo .aimodel y el tokenizer) como los directorios compiled/<arch>/ con artefactos .aimodelc específicos por chip. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B); exportada a formato Core AI con formas estáticas |
| Parámetros totales | 1,7 mil millones (modelo base Qwen/Qwen3-1.7B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (forma estática impuesta en la exportación) |
| Tipos de cuantización | 6 bits con palettización (preset qwen3_1_7b_6bit); no se ofrecen otras variantes en el repo |
| Idiomas soportados | no disponible (la model card no detalla idiomas; hereda los del modelo base) |
| Licencia | Apache-2.0 |
| Formato de pesos | Core AI: .aimodel (bundle raíz) y .aimodelc (compilado por arquitectura), más metadata.json y tokenizer/ |
| Librería | coreai |
| Plataforma objetivo | iOS 27, Apple Neural Engine |
| Arquitecturas compiladas | h16p (A17 Pro), h17p (A18 Pro), h18p (A19 Pro) |
| Tamaño del repositorio | 4,7 GB |
| Modelo base | Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros desarrollado por Alibaba. Esta exportación no reentrena ni modifica los pesos en términos de conocimiento: aplica una cuantización post-entrenamiento a 6 bits con palettización y fija formas estáticas para que el grafo sea compatible con el Neural Engine de Apple. El proceso se realiza con el comando coreai.llm.export --platform iOS y el preset qwen3_1_7b_6bit, según indica la model card.

La innovación técnica no está en el entrenamiento sino en el pipeline de despliegue. El bundle raíz requiere una especialización única en el dispositivo antes de ejecutarse; además, se ofrecen variantes compiladas ahead-of-time con xcrun coreai-build compile --platform iOS --preferred-compute neural-engine para cada familia de chip, de modo que cada artefacto .aimodelc está optimizado para un SoC concreto. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre fases de RLHF o DPO en la información proporcionada; esos detalles corresponden al modelo base y no se reproducen aquí.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del Qwen3-1.7B, incluyendo el modo de razonamiento previo a la respuesta que Qwen3 activa por defecto.
- Control del razonamiento: la model card documenta el paso de ContextOptions(reasoningLevel: .custom("none")) para obtener salidas estructuradas cortas sin cadena de pensamiento, útil en tareas de etiquetado.
- Etiquetado on-device: caso de uso declarado por el autor, integrado en la app Stash para iPhone.
- Ejecución local: inferencia en el Neural Engine sin conexión a red ni servidores externos.
- Tool calling / function calling: no disponible en la información proporcionada para esta exportación.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüismo: no disponible; la model card no enumera idiomas.
- Visión o audio: no disponible; el modelo base es exclusivamente de texto.

## Casos de uso

- Etiquetado de contenido en apps iOS: el escenario para el que se publicó esta exportación. El modelo clasifica y etiqueta elementos dentro de la app Stash directamente en el dispositivo, con latencia baja y sin enviar datos a la nube.
- Clasificación y extracción de metadatos offline: con 4096 tokens de contexto cabe procesar notas, fragmentos de texto o descripciones y devolver etiquetas estructuradas usando reasoningLevel "none" para minimizar la latencia.
- Funciones de privacidad por diseño: al ejecutarse íntegramente en el Neural Engine, permite procesar texto sensible (notas personales, mensajes) sin salir del teléfono, lo que facilita el cumplimiento de requisitos de privacidad en apps de consumo.
- Autocompletado y sugerencias breves en UI: la ventana de 4096 tokens y el modo sin razonamiento son suficientes para sugerencias de texto cortas, reescritura de frases o resúmenes de una pantalla.
- Prototipado de LLM on-device para desarrolladores iOS: sirve como referencia de integración de coreai-models, del flujo de especialización en dispositivo y de la compilación AOT por familia de chip.
- Asistentes locales de bajo coste energético: el uso del Neural Engine en lugar de la GPU o la CPU reduce el consumo y permite mantener funcionalidades de lenguaje activas en segundo plano con un modelo de 1,7B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Plataforma: exclusivamente iOS 27 con Apple Neural Engine; no es ejecutable en Linux, Windows, macOS ni Android con este formato.
- Chips soportados: variantes compiladas para h16p (A17 Pro), h17p (A18 Pro) y h18p (A19 Pro). El bundle raíz requiere especialización en dispositivo, pero la model card solo garantiza ejecución en dispositivos iOS 27.
- Memoria: el repositorio ocupa 4,7 GB, pero la model card no indica el pico de memoria en ejecución; con pesos de 6 bits para 1,7B parámetros, el peso teórico ronda 1,3 GB, aunque no se confirma en la documentación.
- VRAM: no aplica; el modelo se ejecuta en el Neural Engine del SoC, no en una GPU dedicada.
- GPU de escritorio (A100, H100, RTX 4090): no soportadas por este artefacto; para esos entornos habría que usar el Qwen3-1.7B original en safetensors o GGUF.
- Opciones de despliegue: coreai-models de Apple y el runtime Core AI en iOS; no es compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Plataforma |
|---|---|---|---|---|---|
| Zarvox/qwen3-1.7b-coreai-ios | 1,7B | 4096 tokens | Core AI (.aimodel / .aimodelc) | Apache-2.0 | iOS 27, Neural Engine |
| Qwen/Qwen3-1.7B (original) | 1,7B | no disponible en esta ficha | safetensors | Apache-2.0 | GPU/CPU, vLLM, llama.cpp, etc. |
| Otras exportaciones Core AI de la comunidad | no disponible | no disponible | Core AI | no disponible | iOS |

La comparación directa más relevante es con el modelo base: esta exportación sacrifica contexto (4096 tokens frente a la ventana nativa de Qwen3-1.7B) y portabilidad a cambio de ejecución nativa en el Neural Engine. No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Contexto reducido: la forma estática limita la ventana a 4096 tokens, muy por debajo de la del modelo base, lo que restringe tareas de documento largo.
- Encierro de plataforma: los pesos solo son utilizables con Core AI en iOS 27; no sirven para servidores, Android ni escritorio.
- Dependencia de chip: los artefactos compilados están atados a familias concretas (A17 Pro, A18 Pro, A19 Pro); otros dispositivos requieren el bundle raíz y especialización en el momento.
- Riesgo de alucinación: inherente a un modelo de 1,7B parámetros; no debe usarse como fuente de verdad sin verificación, especialmente en etiquetado automático.
- Sesgos: no documentados en la información proporcionada; se heredan los del modelo base Qwen3-1.7B.
- Idiomas: no especificados en la model card; conviene validar el comportamiento en castellano antes de producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial, pero el autor remite al archivo LICENSE del repositorio y a la licencia del modelo base; conviene revisar ambas antes de distribuir.
- Soporte: repositorio sin pipeline declarado ni idiomas listados; la documentación se limita a la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Zarvox/qwen3-1.7b-coreai-ios
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Herramienta coreai-models de Apple: https://github.com/apple/coreai-models
