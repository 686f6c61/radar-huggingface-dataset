# sunsh01/SenseNova-Loop-9B-Preview

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje multimodal desarrollado por SenseNova (OpenSenseNova) y publicado en Hugging Face bajo el identificador `sunsh01/SenseNova-Loop-9B-Preview`. Acepta texto e imágenes como entrada y genera texto, y está orientado a flujos de trabajo de contexto largo y agentes que combinan comprensión de documentos, generación de código e interacción con herramientas externas. Se distribuye con licencia Apache 2.0 y soporte para inglés y chino.

La innovación principal es su arquitectura de decoder con bucle (looped decoder): un bloque contiguo de capas se ejecuta dos veces con pesos compartidos, de modo que el modelo realiza 56 ejecuciones de capa por pase hacia delante almacenando solo 32 conjuntos de pesos. Sobre esa base incorpora manifold-constrained hyper-connections (mHC) de dos flujos residuales y atención híbrida que intercala atención lineal y atención completa en un patrón repetido de cuatro capas.

El modelo cuenta con aproximadamente 9.660 millones de parámetros totales según los safetensors publicados (el autor indica unos 14.600 millones de parámetros de inferencia por el efecto del bloque reutilizado). El contexto de entrenamiento documentado alcanza los 262.144 tokens. Es una versión "Preview", sin informe técnico publicado todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder multimodal autorregresivo; bloque con bucle y mHC de dos flujos |
| Parámetros totales | 9.656.250.480 (~9,66 B) |
| Parámetros activos | No es MoE; el autor reporta ~14,6 B de parámetros de inferencia por el bloque reutilizado |
| Longitud de contexto | Hasta 262.144 tokens en entrenamiento |
| Tipos de cuantización | No disponible (exportación existente en BF16 para el backbone y FP32 para los parámetros de routing mHC) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers, `custom_code`, arquitectura `sensenova_loop`) |

## Arquitectura y entrenamiento

El decoder consta de 32 capas distintas. Las capas 0–3 procesan la entrada; el bloque de capas 4–27 se aplica dos veces de forma secuencial con pesos compartidos, de modo que la computación del bloque puede expresarse como B(B(h)); finalmente las capas 28–31 y la cabeza de salida generan el resultado. En inferencia esto supone 56 ejecuciones de capa por pase hacia delante almacenando solo 32 conjuntos de pesos, lo que profundiza la ruta de cómputo sin duplicar los parámetros del bloque repetido.

La sección con bucle incorpora manifold-constrained hyper-connections (mHC) de dos flujos residuales: mapeos aprendidos enrutan y combinan la información entre ambos flujos. La atención es híbrida, intercalando atención lineal y atención completa en un patrón repetido de cuatro capas. Las recetas de entrenamiento documentadas combinan secuencias largas, entradas multimodales (texto, imágenes, código y trayectorias de uso de herramientas) con una longitud máxima de secuencia de 262.144 tokens. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de entradas de texto e imagen.
- Comprensión de documentos e imágenes combinada con generación de texto.
- Generación de código e interacción con herramientas externas (tool calling) en flujos agénticos, según el enfoque declarado del modelo.
- Razonamiento multi-paso y trayectorias de tareas supervisadas, con contexto de hasta 256K tokens.
- Capacidades multilingües limitadas a inglés y chino.
- Producción de artefactos de diseño y presentaciones (demostraciones de motion design y PPT design incluidas en la model card).
- Análisis de datos y simulaciones (demostraciones de análisis energético y simulación de misión lunar).

## Casos de uso

- Comprensión de documentos largos: el modelo puede procesar documentos extensos junto con imágenes asociadas gracias a su ventana de hasta 262.144 tokens de entrenamiento, adecuado para informes, contratos o expedientes con figuras y tablas.
- Flujos agénticos con herramientas: su entrenamiento con trayectorias de uso de herramientas y su orientación a workflows agénticos lo hacen apto para pipelines que encadenan llamadas a APIs y razonamiento multi-paso.
- Generación de código asistida: combinado con contexto largo, puede trabajar sobre repositorios o especificaciones extensas y generar código en un pipeline de desarrollo.
- Generación de presentaciones y material visual: las demostraciones de la model card muestran la creación de presentaciones (PPT) a partir de contenido, útil para automatizar documentación corporativa o educativa.
- Análisis de datos con entrada multimodal: puede interpretar gráficas, telemetría o imágenes junto con datos textuales para producir análisis, como en la demostración de análisis energético.
- Asistentes conversacionales bilingües inglés-chino: su soporte nativo de ambos idiomas permite desplegarlo en atención al cliente o asistentes internos para esos mercados.
- Simulación y visualización técnica: la demostración de simulación de misión lunar sugiere uso en generación de escenarios técnicos con trayectorias y telemetría.

## Benchmarks y rendimiento

La model card incluye una imagen con resultados comparativos frente a otros modelos en BIRD-Dev, WorkBuddy Bench, AIDABench, TeamBench, Terminal Bench 2.1, T³-Banking, AutomationBench y RaccoonPPTBench, pero los valores numéricos no están disponibles en formato texto en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| BIRD-Dev | No disponible (solo figura) |
| WorkBuddy Bench | No disponible (solo figura) |
| AIDABench | No disponible (solo figura) |
| TeamBench | No disponible (solo figura) |
| Terminal Bench 2.1 | No disponible (solo figura) |
| T³-Banking | No disponible (solo figura) |
| AutomationBench | No disponible (solo figura) |
| RaccoonPPTBench | No disponible (solo figura) |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 19–20 GB solo para los pesos del backbone (~9,66 B de parámetros a 2 bytes), más overhead de activaciones y del contexto largo, que puede elevar el consumo de forma notable con ventanas de cientos de miles de tokens.
- Los parámetros de routing mHC se exportan en FP32, lo que añade un consumo adicional pequeño pero no despreciable.
- GPU recomendadas: A100 (40/80 GB) o H100 para contexto largo y despliegue en producción; una RTX 4090 (24 GB) puede alojar los pesos en BF16 pero queda muy justa para contextos largos.
- En GPU de consumo con cuantización a 8 bits o 4 bits (si se generan pesos GGUF, no confirmados) podría caber en tarjetas de 16–24 GB, aunque no hay cuantizaciones publicadas en la información disponible.
- Opciones de despliegue: transformers con `custom_code` (arquitectura `sensenova_loop`); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SenseNova-Loop-9B-Preview | ~9,66 B (32 capas, 56 ejecuciones) | 262.144 tokens (entrenamiento) | Apache 2.0 | Multimodal, bucle con mHC, preview sin informe técnico |
| Alternativas de ~9B multimodales | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa rigurosa con modelos alternativos de la misma categoría.

## Limitaciones y advertencias

- Es una versión "Preview": el informe técnico está marcado como pendiente (TBD) y no hay validación independiente publicada.
- El repositorio muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de adopción o validación por la comunidad.
- Soporte idiomático limitado a inglés y chino; el rendimiento en castellano no está documentado.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- No se detallan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La arquitectura requiere `custom_code` y la configuración de despliegue documentada por el autor; el rendimiento puede degradarse fuera de ese entorno.
- El contexto de entrenamiento es de 262.144 tokens, pero no se especifica la longitud de contexto efectiva en inferencia ni el coste de memoria asociado.
- Aunque la licencia es Apache 2.0 (permite uso comercial), al tratarse de una preview conviene validar el comportamiento en producción antes de adoptarla.

## Enlaces

- Hugging Face: https://huggingface.co/sunsh01/SenseNova-Loop-9B-Preview
- Hugging Face (organización SenseNova): https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- ModelScope: https://modelscope.cn/models/SenseNova/SenseNova-Loop-9B-Preview
- GitHub: https://github.com/OpenSenseNova/SenseNova-Loop
- Licencia: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/LICENSE
- Configuración: https://github.com/OpenSenseNova/SenseNova-Loop/blob/main/config.json
- README en chino: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview/blob/main/README_CN.md
