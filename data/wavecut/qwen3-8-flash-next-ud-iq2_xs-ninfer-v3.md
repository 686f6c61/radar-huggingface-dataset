# WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3

## Resumen

Qwen3.8-Flash-Next es un modelo de mezcla de expertos (MoE) de 125.000 millones de parámetros desarrollado por Alibaba Qwen, del que se derivan múltiples cuantizaciones y artefactos de inferencia. Esta ficha describe el artefacto `WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3`, una conversión al formato propietario NInfer v3 del GGUF dinámico UD-IQ2_XS publicado por Unsloth. No se trata de un modelo nuevo, sino de un empaquetado optimizado para el motor de inferencia NInfer-all, pensado para ejecutar el modelo en hardware de consumo.

El modelo base emplea una arquitectura híbrida de 48 capas con 512 expertos enrutados por capa (10 activos por token, unos 6.000 millones de parámetros activos), combinando 12 capas de atención dispersa (QSA) con 36 capas Gated DeltaNet. El artefacto integra además la torre de visión en BF16, el bloque MTP (multi-token prediction) y el drafter DFlash2 de decodificación especulativa, todo en un único fichero de 47,43 GiB.

Su relevancia radica en que permite servir un modelo multimodal de 125B con contexto de 32.768 tokens en una sola GPU RTX 5090 (32 GB), manteniendo los expertos en memoria de host o en disco, algo impensable con los pesos en BF16. La licencia es la Qwen Community License 1.0, con las restricciones habituales de uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE híbrida: 48 capas, 12 de atención dispersa (QSA) + 36 Gated DeltaNet; 512 expertos enrutados por capa |
| Parámetros totales | 125.000 millones (125B) |
| Parámetros activos | ~6.000 millones (6B), 10 expertos activos por token |
| Longitud de contexto | 32.768 tokens (`--max-context 32768` en los ejemplos de ejecución) |
| Tipos de cuantización | IQ2_S, IQ2_XXS, IQ4_NL, Q2_0, Q5_0, Q8_0, Q6_K, IQ4_XS, BF16/FP32 (componentes sensibles) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (etiquetada como `other`) |
| Formato de pesos | `.ninfer` (formato propietario NInfer v3); artefactos auxiliares GGUF (mmproj BF16, MTP Q8_0, DFlash2 Q4_0) |
| Tamaño del fichero | 50.926.685.952 bytes (47,43 GiB) |
| Repositorio | 50,9 GB |
| Pipeline | image-text-to-text (multimodal) |

## Arquitectura y entrenamiento

La arquitectura es una MoE híbrida de 48 capas. Doce capas usan atención dispersa (QSA) con proyecciones Q6_K e indexador en BF16; las otras 36 emplean Gated DeltaNet, un mecanismo de estado recurrente lineal con query, key, value y salida en Q8_0 y compuerta `z` en Q6_K. Cada capa dispone de 512 expertos enrutados, de los que 10 se activan por token, más expertos compartidos en Q8_0. El router se mantiene en BF16. Esta combinación busca reducir el coste cuadrático de la atención clásica en contextos largos manteniendo capacidad expresiva.

El artefacto no incluye información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF/DPO); esos datos corresponden a la model card original de Qwen3.8-Flash-Next, no disponible en la información proporcionada. La innovación técnica del artefacto es la preservación byte a byte de los bloques de cuantización ggml de cada tensor (salvo las matrices de inyección de hiperconexión, requantizadas de BF16 a Q8_0) y la integración en un solo fichero del bloque MTP, el drafter DFlash2 de decodificación especulativa y la torre de visión. La tabla n-gram se publica por separado y se referencia por digest SHA-256.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de 32.768 tokens.
- Procesamiento de imagen y vídeo mediante la torre de visión (mmproj BF16, 0,9 GB), activable con `--vision`.
- Decodificación especulativa con DFlash2 (drafter Q4_0 de 339 MB) para acelerar la generación.
- Predicción multi-token (bloque MTP en Q8_0, 2,8 GB).
- Salida estructurada (structured output) soportada por el motor NInfer.
- Reutilización de prefijo de prompt (prompt-prefix reuse) para conversaciones largas.
- Hasta ocho peticiones concurrentes por instancia.
- Soporte de plantilla de chat oficial de Qwen3.8-Flash-Next (`chat_template.jinja`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal en local: el modelo puede recibir imágenes junto con texto y responder en conversaciones de hasta 32.768 tokens, adecuado para análisis de capturas, documentos escaneados o vídeo corto sin depender de APIs externas.
- Despliegue en estación de trabajo con una RTX 5090: con `--expert-residency host`, los expertos residen en memoria de host paginada y se cachean en la GPU los más usados, permitiendo servir un modelo de 125B en 32 GB de VRAM.
- Entornos con poca RAM: el modo `--expert-residency disk` mantiene los expertos en el fichero y los transmite a una caché en GPU, útil para máquinas con memoria limitada a costa de mayor latencia.
- Servicio multi-GPU en Linux: con `--devices 0,1` sobre dos GPU de 32 GB se coloca cada etapa del pipeline en una GPU, habilitando hasta ocho peticiones concurrentes para equipos pequeños.
- Generación acelerada por decodificación especulativa: el drafter DFlash2 integrado reduce el número de pasos de decodificación en tareas de texto largo, útil en pipelines de resumen o generación de documentación.
- Investigación sobre cuantización extrema: el artefacto sirve como banco de pruebas para evaluar el impacto de IQ2_S/IQ2_XXS en expertos enrutados frente a Q8_0 en expertos compartidos y capas de atención.
- Prototipado de asistentes con salida estructurada: el soporte de structured output permite generar JSON validado para integración en backends sin post-procesado frágil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB en una RTX 5090 con expertos en host o disco; dos GPU de 32 GB para residencia completa de expertos en dispositivo.
- GPU recomendadas: RTX 5090 (32 GB) para los modos host/disk; dos GPU de 32 GB (Linux) para el modo multi-dispositivo. No se documentan pruebas en A100 ni H100.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con `--expert-residency host` o `disk`.
- Opciones de despliegue: motor NInfer-all (rama `master` de `iamwavecut/ninfer-all`), release 2026-11-09.2 o superior; imagen Docker oficial con los ficheros en `/models`. Las builds estándar de NInfer rechazan este fichero.
- Latencia y throughput: no disponibles. Solo se confirma que los modos host y disk se ejecutaron en una RTX 5090; el comando de dos GPU no fue probado con este fichero según la model card.
- Requiere descargar además la tabla n-gram (`WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3`) para el funcionamiento completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3 | 125B | ~6B | 32.768 | `.ninfer` (NInfer v3) | Qwen Community 1.0 | Hugging Face, motor NInfer-all |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ2_XS) | 125B | ~6B | no disponible | GGUF | Qwen Community 1.0 | Hugging Face, llama.cpp y derivados |
| Qwen/Qwen3.8-Flash-Next (original) | 125B | ~6B | no disponible | safetensors (BF16) | Qwen Community 1.0 | Hugging Face, requiere hardware de datacenter |
| incoai/Qwen3.8-Flash-Next-DFlash2 | drafter (no disponible) | no disponible | no disponible | no disponible | no disponible | Hugging Face, decodificación especulativa |

## Limitaciones y advertencias

- Artefacto dependiente de un motor no estándar: solo funciona con NInfer-all; las builds estándar de NInfer lo rechazan, lo que limita la portabilidad y el soporte comunitario.
- La cuantización IQ2_S/IQ2_XXS en los expertos enrutados (40 capas IQ2_S, 8 IQ2_XXS) implica pérdida de precisión frente al modelo original; no se han publicado evaluaciones de degradación.
- El comando multi-GPU de dos dispositivos no fue probado con este fichero según la model card; solo los modos host y disk en una RTX 5090 están verificados.
- La tabla n-gram se distribuye por separado; sin ella el artefacto no funciona según lo documentado.
- Idiomas soportados no disponibles: no se puede garantizar cobertura multilingüe sin consultar la model card original.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base.
- Licencia Qwen Community License 1.0: revisar las cláusulas de uso comercial y las restricciones de redistribución antes de desplegar en producción.
- Contexto máximo documentado de 32.768 tokens en los ejemplos; no se confirma si el modelo base soporta ventanas mayores.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face del artefacto: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-UD-IQ2_XS-NInfer-v3
- Modelo base GGUF (Unsloth): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Tabla n-gram: https://huggingface.co/WaveCut/Qwen3.8-Flash-Next-ngram-table-NInfer-v3
- Drafter DFlash2 (incoai): https://huggingface.co/incoai/Qwen3.8-Flash-Next-DFlash2
- Drafter DFlash2 en GGUF Q4_0 (nazeshinjite): https://huggingface.co/nazeshinjite/Qwen3.8-Flash-Next-DFlash2-GGUF
- Repositorio NInfer: https://github.com/Neroued/ninfer
- Repositorio NInfer-all: https://github.com/iamwavecut/ninfer-all
- Release 2026-11-09.2: https://github.com/iamwavecut/ninfer-all/releases/tag/2026-11-09.2
- Documentación de Qwen3.8-Flash-Next en NInfer-all: https://github.com/iamwavecut/ninfer-all/blob/master/docs/qwen3-8-flash-next.md
