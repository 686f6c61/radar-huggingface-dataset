# wolfram-pro/qwen3.5-4b-coreai

## Resumen

`wolfram-pro/qwen3.5-4b-coreai` es una conversión no oficial de `Qwen/Qwen3.5-4B` al runtime Apple Core AI para iOS y macOS 27, publicada por el usuario wolfram-pro. No es un modelo nuevo ni un ajuste fino: los pesos proceden del modelo base de Qwen (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, licencia Apache 2.0) y lo que cambia es el formato de despliegue, orientado a inferencia local en iPhone, iPad y Mac con Apple Silicon, sin servidor.

El paquete contiene un bundle portable `.aimodel` de 3,09 GB (cuerpo en int4 con GPTQ por bloques de 32, `down_proj` en int8 y tabla de embeddings/head compartida en int8) y una carpeta por arquitectura de GPU con las closures compiladas ahead-of-time, desde M1 (`h13g`) hasta A20 Pro (`h19p`). El grafo es un híbrido GDN con formas estáticas (`input_ids` [1, 1]) y una ventana de contexto de 4096 tokens.

Su interés es práctico: permite integrar un modelo de ~4 000 millones de parámetros en aplicaciones iOS/iPadOS con procesamiento local y privacidad por diseño, a cambio de renunciar a los toolchains habituales (no hay safetensors ni GGUF, solo `.aimodel`) y asumiendo que el repositorio no publica benchmarks, métricas de calidad ni scripts de reproducción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Grafo híbrido GDN exportado a Apple Core AI; la model card no detalla número de capas, dimensión oculta ni composición interna |
| Parámetros totales | ~4 000 millones (deducido del nombre del modelo base `Qwen3.5-4B`; no confirmado en la model card) |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 4096 tokens (forma estática) |
| Tipos de cuantización | int4 GPTQ por bloques de 32 en el cuerpo; int8 en `down_proj`; tabla de embeddings/head compartida en int8 |
| Idiomas soportados | ru, en (según los tags del repositorio) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | `.aimodel` (Apple Core AI) más closures precompilados por arquitectura de GPU; no hay safetensors ni GGUF |
| Tamaño del bundle portable | 3,09 GB (`q4_gptq_b32_down8/`) |
| Tamaño total del repositorio | 9,3 GB (incluye las closures por arquitectura) |
| Requisitos de ejecución | Apple Core AI, iOS 27.2+ (la cabecera de la model card menciona iOS/macOS 27); GPU Apple Silicon `h13g`–`h19p` |
| Tokenizer | Ficheros upstream sin modificar |

## Arquitectura y entrenamiento

Este repositorio no entrena nada: es un artefacto de exportación y compilación. La model card describe el grafo como un híbrido GDN con formas estáticas (`input_ids` [1, 1]) y contexto fijado en 4096 tokens, pero no especifica el número de capas, la dimensión del modelo, el número de cabezas, la composición del dataset de entrenamiento del modelo base ni si este pasó por RLHF, DPO u otra fase de alineamiento. Todos esos datos figuran como no disponibles en la información proporcionada.

La innovación técnica está en el pipeline de cuantización y despliegue: cuerpo cuantizado a int4 con GPTQ en bloques de 32, `down_proj` mantenido en int8 (la proyección de salida de cada bloque es especialmente sensible a la precisión) y una tabla de embeddings y cabeza de salida compartida en int8. El resultado se empaqueta en un bundle portable que el host especializa, y además se distribuyen closures compiladas ahead-of-time para cada arquitectura de GPU de Apple Silicon, con un `descriptor.json` por carpeta que incluye tamaño y SHA-256 de cada fichero. Los scripts de reproducción y las mediciones no están en el repositorio: según el autor, viven en la aplicación que consume el modelo.

## Capacidades

- Generación de texto y razonamiento general: capacidades heredadas del modelo base `Qwen/Qwen3.5-4B`, no documentadas ni verificadas en esta conversión.
- Código y matemáticas: presumibles por la familia del modelo base, sin evaluación publicada en el repositorio.
- Multilingüe limitado: los tags declaran únicamente ruso e inglés; no se declara soporte de castellano ni de otras lenguas.
- Ejecución 100 % local en dispositivo: no requiere red, lo que habilita procesamiento con privacidad por diseño.
- Integración nativa con Apple Core AI: el bundle se especializa en el host y se distribuyen closures por arquitectura (`h13g` M1, `h14g` M2, `h15g` M3, `h16g` M4, `h16p` A17 Pro, `h17g` M5, `h17p` A18/A18 Pro, `h18p` A19/A19 Pro, `h19p` A20 Pro).
- Tool calling / function calling: no disponible; la model card no lo menciona.
- Modo thinking, visión o audio: no disponible; no hay ninguna referencia en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible; además, las formas estáticas y el lote 1 limitan su uso en orquestaciones complejas.

## Casos de uso

- Asistentes conversacionales offline dentro de una app iOS: con 4096 tokens de contexto y 3,09 GB de huella, el modelo cabe en dispositivos de gama alta y permite responder sin conexión, manteniendo las conversaciones en el dispositivo.
- Traducción ruso-inglés local: es el par de idiomas declarado, y la ejecución on-device evita enviar texto sensible a un servidor; encaja en apps de viaje o herramientas internas.
- Resumen y extracción de datos de textos cortos (correos, notas, tickets): el contexto de 4096 tokens es suficiente para documentos de una o dos páginas, y la latencia no depende de la red.
- Clasificación y etiquetado de contenido en primer plano: al ser un modelo pequeño cuantizado, puede ejecutarse en el propio hilo de la app para categorizar entradas sin coste por token.
- Autocompletado y reescritura en editores de texto para iOS/iPadOS: la integración con Core AI permite invocar el grafo desde código nativo y limitar el prompt a la ventana de 4096 tokens.
- Prototipado de funciones de IA en apps antes de mover cargas a servidor: el bundle portable sirve para validar experiencia de usuario y consumo de memoria en dispositivos reales, con closures específicas por generación de chip.
- Procesamiento de datos regulados en Mac con Apple Silicon: al no requerir servicios externos, encaja en flujos donde el texto no puede salir del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Huella de pesos: 3,09 GB para el bundle portable `q4_gptq_b32_down8`; hay que sumar la caché KV para 4096 tokens, cuyo tamaño no se documenta.
- Espacio en disco del repositorio completo: 9,3 GB, debido a las closures precompiladas de todas las arquitecturas.
- GPU compatibles: exclusivamente Apple Silicon, con identificadores de arquitectura `h13g` (M1), `h14g` (M2), `h15g` (M3), `h16g` (M4), `h17g` (M5), `h16p` (A17 Pro), `h17p` (A18 / A18 Pro), `h18p` (A19 / A19 Pro) y `h19p` (A20 Pro).
- Sistema operativo: iOS 27.2 o superior según las carpetas por arquitectura; la cabecera indica iOS/macOS 27.
- GPU NVIDIA, AMD o Intel: no soportadas; el artefacto depende del runtime Apple Core AI y no hay pesos en formato estándar que puedan cargarse con otras herramientas.
- Cabe en hardware de consumo: sí, en iPhone/iPad/Mac con los chips listados; no está pensado para servidores.
- Opciones de despliegue: únicamente el runtime Apple Core AI con el bundle `.aimodel` o las closures por arquitectura. No hay soporte de vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: no disponible; el autor indica que las mediciones viven en la aplicación consumidora y no se publican en el repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `wolfram-pro/qwen3.5-4b-coreai` (este) | ~4 000 M | 4096 (estático, lote 1) | `.aimodel` / Apple Core AI, iOS 27.2+ | Apache 2.0 | Repositorio público, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4 000 M (por nomenclatura) | No disponible en la información proporcionada | No disponible | Apache 2.0 | Repositorio público de Qwen |
| Otras conversiones del mismo base (GGUF/llama.cpp, MLX, Core ML) | ~4 000 M | No disponible | No disponible | Depende del conversor | No verificado; no se han encontrado referencias en la búsqueda realizada |

No se dispone de datos verificados de rendimiento, latencia o calidad para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de métricas de perplejidad o de calidad: no hay forma de estimar la degradación introducida por la cuantización int4 frente al modelo base.
- Conversión de terceros: no es un lanzamiento oficial de Qwen y el autor lo indica expresamente; la trazabilidad depende del bundle publicado.
- Reproducibilidad limitada: los scripts de conversión y las mediciones no están en el repositorio, sino en la aplicación consumidora.
- Formas estáticas `input_ids` [1, 1] y contexto de 4096: no apto para serving, lotes concurrentes ni prompts largos.
- Idiomas declarados solo ruso e inglés; el comportamiento en castellano no está documentado ni evaluado, y es esperable una calidad inferior.
- Encapsulamiento en el ecosistema Apple: sin safetensors ni GGUF, el modelo no puede reutilizarse en vLLM, llama.cpp, Ollama ni en GPUs no Apple.
- Dependencia de versiones de sistema operativo recientes (iOS 27.2+), lo que restringe la base de dispositivos compatibles.
- Riesgo de alucinación inherente a un modelo de ~4 000 M cuantizado, sin guardrails ni filtros documentados en la model card.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar avisos de copyright y licencia; conviene verificar también las condiciones del modelo base y de las dependencias de Apple Core AI.
- Señal de madurez baja: 0 descargas y 0 likes, publicado y actualizado el mismo día (2026-10-19), sin issues ni discusión asociada.
- La búsqueda web realizada no devolvió información sobre el alias "wolfram-pro": los resultados se refieren a Wolfram Research y no guardan relación con este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wolfram-pro/qwen3.5-4b-coreai
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`)
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada (la model card no incluye ninguno, y la búsqueda web no arrojó resultados relevantes).
