# Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed

## Resumen

Inkling 2 Mini MTPLX Bare Speed es un empaquetado cuantizado del modelo Inkling-2-Mini de Thinking Machines Lab, preparado por el usuario Youssofal para su ejecución local en Apple Silicon mediante MTPLX, la aplicación y CLI de inferencia para macOS. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26.437.722.672 parámetros totales y 3.400 millones de parámetros activos por token, según indica la model card, con una ventana de contexto declarada de hasta 1.048.576 tokens y capacidades multimodales de imagen a texto.

Este pack concreto reduce la precisión de atención, cabeza de salida y embeddings a 4 bits (grupos de 64) mientras mantiene los expertos en NVFP4 oficial, con torre de visión y cabeza de borrador en BF16. El resultado es un paquete de 16,0 GB que ocupa un pico de memoria de 18,3 GiB sirviendo un prompt de 4.142 tokens en un MacBook Pro M5 Max. Incorpora decodificación especulativa mediante la propia cabeza de predicción multi-token del modelo, con verificación por regla de ratio de probabilidad, de modo que la distribución de salida se mantiene intacta.

Su relevancia es doble: por un lado, demuestra que un MoE de 26B con visión y contexto de hasta 1M puede ejecutarse en un portátil Apple con 24 GB de memoria unificada; por otro, introduce una dependencia estricta de versión (MTPLX 2.13, no carga en 2.12) y una tabla de contextos máximos por configuración de memoria que condiciona el uso real. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), 24 capas, con torre de visión y cabeza de predicción multi-token |
| Parametros totales | 26.437.722.672 |
| Parametros activos | 3.400 millones (8 de 128 expertos por token) |
| Longitud de contexto | Hasta 1.048.576 tokens en el modelo base; limitada por memoria en este pack (24.576 en 24 GB, 163.840 en 32 GB, 245.760 en 36 GB, 434.176 en 48 GB, 749.568 en 64 GB, 1.048.576 en 96-512 GB) |
| Tipos de cuantizacion | Expertos en NVFP4; atención, cabeza de salida y embeddings en 4 bits (grupos de 64); torre de visión y cabeza de borrador en BF16; existe build FP16 para M1/M2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con política de uso aceptable del modelo base) |
| Formato de pesos | safetensors (librería mtplx) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos con 24 capas y 128 expertos, de los cuales se activan 8 por token, lo que da 3,4B de parámetros activos sobre 26,4B totales. Incluye una torre de visión completa (image-text-to-text) y una cabeza de predicción multi-token que actúa como borrador para decodificación especulativa. La model card del pack no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esa información correspondería a la model card del modelo base de Thinking Machines Lab y no está incluida en la información proporcionada.

La innovación técnica del pack es la combinación de cuantización agresiva selectiva con decodificación especulativa nativa. La cabeza de borrador propone varios tokens y el modelo completo los verifica en una sola pasada, aceptando cada uno mediante la regla de ratio de probabilidad; el muestreo sigue los ajustes propios del modelo (temperatura 1.0, top-p 1.0, sin top-k), de modo que la salida respeta la distribución original a cualquier temperatura. Los expertos conservan los pesos NVFP4 oficiales; solo cambia la precisión de atención, salida y embeddings respecto al modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con ventanas de contexto muy largas (hasta 1M tokens en configuraciones de 96 GB o más).
- Razonamiento y código: el modelo está orientado explícitamente a coding y agentes según la model card.
- Visión: la torre de visión está incluida en el pack y permite leer capturas de pantalla, diagramas y fotografías.
- Decodificación especulativa con cabeza de predicción multi-token propia, con salida fiel a la distribución del modelo.
- Integración con clientes de agentes: MTPLX arranca Pi, OpenCode y Hermes directamente sobre el pack.
- Servido de APIs compatibles con OpenAI y Anthropic en `127.0.0.1:8000` mediante `mtplx serve`.
- Soporte multimodal imagen-texto a texto (pipeline `image-text-to-text`).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local: el pack se integra con OpenCode mediante `mtplx start opencode`, de modo que un desarrollador puede usar un modelo de 26B con capacidades de código sin enviar código a servicios externos, aprovechando la decodificación especulativa para reducir la latencia percibida.
- Análisis de capturas y diagramas de arquitectura: la torre de visión en BF16 permite pasar screenshots de interfaces o diagramas UML junto con preguntas en texto, útil para revisión de documentación técnica o depuración de UI.
- Agentes autónomos de múltiples pasos: con contexto de hasta 434.176 tokens en un Mac de 48 GB, el modelo puede mantener el estado completo de una tarea de agente (historial de herramientas, ficheros leídos, resultados) sin truncar.
- Servidor de inferencia local compatible con OpenAI/Anthropic: `mtplx serve` expone ambos protocolos, lo que permite apuntar herramientas existentes (SDKs, frameworks de agentes) a un endpoint local en un Mac Studio.
- Procesamiento de documentos largos en estaciones de trabajo Apple: en configuraciones de 96 GB o más, el contexto completo de 1.048.576 tokens permite analizar repositorios completos o corpus documentales extensos en una sola pasada.
- Prototipado de aplicaciones multimodales sin GPU dedicada: en un MacBook con 24 GB, el pack arranca con 24.576 tokens de contexto, suficiente para prototipar flujos imagen-texto antes de migrar a hardware de servidor.
- Evaluación comparativa de cuantizaciones: al existir tres packs (Bare Speed, Optimized Speed, Optimized Quality) y builds FP16, sirve para medir el impacto de la precisión en calidad y velocidad sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento proporcionados son operativos: descarga de 16,0 GB y pico de memoria de 18,3 GiB sirviendo un prompt de 4.142 tokens, medido en un MacBook Pro M5 Max. No se indican tokens por segundo ni latencias.

## Requisitos de hardware

- VRAM/memoria unificada: el pack requiere al menos 24 GB en Macs M3, M4 o M5; con 24 GB el contexto máximo es de 24.576 tokens y el pico medido es de 18,3 GiB para un prompt de 4.142 tokens.
- Macs M3/M4/M5: 24 GB (contexto 24.576), 32 GB (163.840), 36 GB (245.760), 48 GB (434.176), 64 GB (749.568) y 96-512 GB (1.048.576 tokens).
- Macs M1/M2: no existe build de este pack; se debe usar Bare Speed FP16, disponible para 32-192 GB. En M1/M2 con 16-24 GB no cabe ningún pack de Inkling 2 Mini.
- En Macs de 8 GB y 16-18 GB (M3/M4/M5) no cabe el modelo; MTPLX recomienda alternativas (Qwen 3.5 4B, Bonsai 2 27B, Qwen 3.5 9B FP16 según el caso).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el pack está diseñado exclusivamente para Apple Silicon vía MTPLX.
- Despliegue: aplicación MTPLX para macOS, CLI `mtplx` (Homebrew o pip), `mtplx pull`, `mtplx start` y `mtplx serve` con APIs OpenAI y Anthropic. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Versión: requiere MTPLX 2.13 o superior; no carga en 2.12.
- Latencia y throughput: no disponibles más allá del pico de memoria indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Inkling 2 Mini Bare Speed (este pack) | 26,4B totales / 3,4B activos | Hasta 1.048.576 según memoria | Apache 2.0 | Apple Silicon M3/M4/M5, 16,0 GB |
| Inkling 2 Mini Optimized Speed | 26,4B totales / 3,4B activos (modelo base) | Según memoria del Mac | Apache 2.0 | Apple Silicon, pack hermano de mayor tamaño |
| Inkling 2 Mini Optimized Quality | 26,4B totales / 3,4B activos (modelo base) | Según memoria del Mac | Apache 2.0 | Apple Silicon, pack hermano orientado a calidad |
| Inkling 2 Mini Bare Speed FP16 | 26,4B totales / 3,4B activos (modelo base) | Según memoria del Mac | Apache 2.0 | Apple Silicon M1/M2 con 32-192 GB |

No se dispone de datos de benchmarks que permitan comparar rendimiento con estos u otros modelos; la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Dependencia estricta de versión: el pack no carga en MTPLX 2.12; requiere 2.13 o superior.
- Exclusivo de Apple Silicon y macOS: no hay soporte para GPU NVIDIA, AMD ni Linux en la información disponible.
- Contexto efectivo muy inferior al nominal en configuraciones pequeñas: 24.576 tokens en un Mac de 24 GB frente a los 1.048.576 del modelo base.
- La cuantización a 4 bits de atención, cabeza de salida y embeddings puede degradar la calidad respecto al modelo base; la model card no publica evaluaciones comparativas entre packs.
- Idiomas soportados no declarados: riesgo de comportamiento desigual fuera del inglés y del castellano sin datos que lo respalden.
- Riesgo de alucinación inherente a modelos generativos; no se documentan mitigaciones específicas en el pack.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base está sujeto además a la política de uso aceptable de Thinking Machines Lab, que debe respetarse.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo día (22 de noviembre de 2026): no hay evidencia de validación comunitaria.
- El muestreo recomendado es temperatura 1.0 con top-p 1.0 y sin top-k; desviarse de estos ajustes puede alterar el comportamiento esperado.
- El pico de memoria de 18,3 GiB está medido con un prompt de 4.142 tokens; prompts cercanos al máximo de contexto elevarán el consumo y pueden provocar intercambio de memoria en equipos justos de RAM.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- MTPLX: https://mtplx.com
- Pack hermano Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Pack hermano Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- Build FP16 Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Build FP16 Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Build FP16 Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
