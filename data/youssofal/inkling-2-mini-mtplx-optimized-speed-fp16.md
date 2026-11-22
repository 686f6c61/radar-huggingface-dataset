# Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16

## Resumen

Inkling 2 Mini Optimized Speed FP16 es un empaquetado de cuantización del modelo abierto Inkling-2-Mini de Thinking Machines Lab, preparado por el usuario Youssofal para su ejecución local en Macs con Apple Silicon mediante la aplicación y CLI MTPLX. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.400 millones de parámetros totales y 3.400 millones activos por token, orientado a código, agentes y procesamiento de imágenes, con una ventana de contexto de hasta 1.048.576 tokens según la model card del autor.

Este pack concreto está dirigido a Macs con chips M1 y M2, que carecen de soporte nativo para bfloat16. Por ello, todos los tensores de 16 bits (torre de visión y cabeza de borrador incluidas) se almacenan como float16, mientras que los códigos de 4 y 8 bits se mantienen idénticos al build padre. El resultado es un repositorio de 17,2 GB que preserva el layout y la ventana de contexto del modelo original, e incorpora decodificación especulativa mediante una cabeza de predicción multi-token (MTP) propia del modelo.

Su relevancia radica en que permite ejecutar un MoE de 26,4 B parámetros con capacidades multimodales y contexto de hasta 1M tokens en hardware de consumo Apple, algo poco habitual. El pack requiere MTPLX 2.13 o superior y no carga en la versión 2.12. La licencia es Apache 2.0, heredada del modelo base, con su correspondiente política de uso aceptable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 24 capas, con torre de visión y cabeza de predicción multi-token (MTP) |
| Parámetros totales | 27.530.496.048 (según safetensors); 26,4 B según la model card del modelo base |
| Parámetros activos | 3,4 B por token (8 de 128 expertos activados por token) |
| Longitud de contexto | Hasta 1.048.576 tokens (modelo); 135.168 tokens en 32 GB, 716.800 en 64 GB y 1.048.576 en 96-192 GB en M1/M2 |
| Tipos de cuantización | Expertos en NVFP4; proyecciones de atención y cabeza de salida en 8 bits (grupos de 64); embeddings, torre de visión y cabeza de borrador en F16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (con política de uso aceptable de Thinking Machines) |
| Formato de pesos | Safetensors (librería mtplx) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 24 capas en el que cada token activa 8 de 128 expertos, lo que resulta en 3,4 B parámetros activos sobre un total de 26,4 B. Incluye una torre de visión completa que permite entrada image-text-to-text, y una cabeza de borrador para predicción multi-token que habilita decodificación especulativa. El pack de Youssofal no reentrena ni modifica la arquitectura: solo altera la precisión de almacenamiento de los tensores de 16 bits a float16 para adaptarse a M1 y M2, manteniendo intactos los códigos NVFP4 de los expertos y los grupos de 8 bits de atención y cabeza de salida.

La decodificación especulativa funciona con la cabeza de borrador proponiendo varios tokens por adelantado, que el modelo completo verifica en una sola pasada; cada token se acepta mediante la regla de ratio de probabilidad, de modo que la salida sigue la distribución propia del modelo a cualquier temperatura. El muestreo recomendado es temperatura 1.0 sobre toda la distribución (top-p 1.0, sin top-k). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Generación y comprensión de código, orientada a tareas de programación y agentes.
- Procesamiento de imágenes: lectura de capturas de pantalla, diagramas y fotografías mediante la torre de visión incluida.
- Decodificación especulativa con cabeza MTP propia, que acelera la generación manteniendo la distribución del modelo.
- Soporte de contexto largo de hasta 1.048.576 tokens (limitado por la memoria del Mac).
- Ejecución local en Apple Silicon mediante MTPLX, con servidor compatible con las APIs de OpenAI y Anthropic.
- Integración con clientes como Pi, OpenCode y Hermes a través de `mtplx start`.
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistencia de programación local en Mac: el modelo puede integrarse en OpenCode o Hermes mediante `mtplx start`, ofreciendo autocompletado y generación de código sin enviar datos a la nube, aprovechando sus 3,4 B parámetros activos para mantener latencia baja.
- Análisis de capturas de pantalla y diagramas: la torre de visión en F16 permite interpretar imágenes directamente, útil para documentar interfaces, extraer información de diagramas de arquitectura o revisar diseños.
- Agentes autónomos multi-paso: con contexto de hasta 1M tokens en Macs de 96-192 GB, el modelo puede mantener el estado de tareas largas con múltiples herramientas y pasos intermedios.
- Procesamiento de repositorios completos: la ventana de contexto extendida permite cargar grandes cantidades de código fuente para revisión, refactorización o generación de documentación.
- Servidor local compatible con OpenAI/Anthropic: mediante `mtplx serve` se expone en `127.0.0.1:8000`, lo que permite conectar herramientas existentes que esperan esas APIs sin modificar el código cliente.
- Prototipado de aplicaciones multimodales en local: desarrolladores que necesitan probar pipelines image-text-to-text en hardware Apple sin depender de servicios externos.
- Investigación sobre decodificación especulativa: el pack incluye la cabeza MTP y permite estudiar el comportamiento de la verificación por ratio de probabilidad en un modelo MoE real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor sí reporta una métrica operativa: el pico de memoria al servir un prompt de 4.142 tokens es de 19,5 GiB en la ruta de código que usan los Macs M1 y M2, medida en un M5 Max.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 19,5 GiB de pico para un prompt de 4.142 tokens; descarga de 17,2 GB.
- Macs compatibles: M1 y M2 con 32 GB o más (MacBook Pro hasta Mac Studio). No cabe en M1/M2 de 8, 16 o 24 GB.
- Contexto según memoria en M1/M2: 135.168 tokens con 32 GB, 716.800 con 64 GB y 1.048.576 con 96-192 GB.
- En M3, M4 y M5 se recomienda usar los builds padre (Bare Speed, Optimized Speed, Optimized Quality), no este pack FP16.
- Despliegue: exclusivamente mediante MTPLX 2.13 o superior (app de Mac o CLI `mtplx`), con `mtplx start` para Pi, OpenCode y Hermes, o `mtplx serve` para APIs OpenAI/Anthropic en `127.0.0.1:8000`.
- No compatible con vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Plataforma |
|---|---|---|---|---|---|
| Inkling 2 Mini Optimized Speed FP16 (este pack) | 26,4 B (27,5 B safetensors) | 3,4 B | Hasta 1.048.576 | Apache 2.0 | MTPLX en M1/M2 |
| Inkling 2 Mini Optimized Speed (build padre) | 26,4 B | 3,4 B | Hasta 1.048.576 | Apache 2.0 | MTPLX en M3/M4/M5 |
| Qwen 3.5 9B Optimized Speed FP16 | 9 B | No disponible | No disponible | No disponible | MTPLX en M1/M2 de 16-24 GB |
| Bonsai 2 27B Optimized Speed | 27 B | No disponible | No disponible | No disponible | MTPLX en M3/M4/M5 de 16-18 GB |

Los modelos Qwen 3.5 9B y Bonsai 2 27B se mencionan únicamente como recomendaciones alternativas de MTPLX para Macs con memoria insuficiente; no se dispone de sus especificaciones detalladas ni de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Requiere MTPLX 2.13 o superior; no carga en MTPLX 2.12.
- Exclusivo para Apple Silicon M1 y M2 con 32 GB o más; no funciona en M3, M4 ni M5 (para esos chips existen los builds padre).
- No es compatible con ecosistemas de despliegue estándar como vLLM, llama.cpp, Ollama o TGI.
- El contexto efectivo depende de la memoria del Mac y puede ser muy inferior al máximo de 1.048.576 tokens.
- La cuantización NVFP4 de los expertos y los grupos de 8 bits en atención y cabeza de salida pueden introducir degradación respecto a los pesos originales en precisión completa.
- Idiomas soportados no disponibles; no se puede confirmar cobertura multilingüe.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas para este pack.
- Sesgos conocidos: no disponible.
- Uso comercial permitido por Apache 2.0, pero sujeto a la política de uso aceptable de Thinking Machines Lab.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del pack.

## Enlaces

- Hugging Face del pack: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed-FP16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build padre Optimized Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Speed
- Build hermano Bare Speed FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed-FP16
- Build hermano Optimized Quality FP16: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality-FP16
- Build padre Bare Speed: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Bare-Speed
- Build padre Optimized Quality: https://huggingface.co/Youssofal/Inkling-2-Mini-MTPLX-Optimized-Quality
- MTPLX: https://mtplx.com
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
