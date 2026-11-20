# SourceHat-Labs/SenseNova-Loop-9B-EXL3-8.0bpw

## Resumen

SenseNova-Loop-9B-EXL3-8.0bpw es una cuantización de tipo EXL3 (ExLlamaV3) a 8.0 bits por peso del checkpoint original SenseNova-Loop-9B, desarrollado por SenseNova y redistribuido por SourceHat-Labs. El modelo original es un modelo multimodal de tipo image-text-to-text con arquitectura propietaria `sensenova_loop`, orientado a conversación y con capacidades de decodificación especulativa nativa (draft nativo incluido en el checkpoint). Esta versión concreta no introduce cambios de arquitectura: mantiene el RoPE original, los embeddings de entrada y el módulo de visión en 8 bits, y conserva la cabeza de salida en BF16.

El interés de esta ficha reside en que es un artefacto de cuantización listo para servir en ExLlamaV3, con un perfil de memoria medido sobre una única GPU de 64 GiB. El autor documenta pruebas con oleadas acotadas de cuatro y ocho peticiones concurrentes, un pool compartido de 1.048.576 tokens en Q8 y un techo de petición de 524.288 tokens heredado del original.

Por su tamaño (5.857.825.408 parámetros reales según safetensors, pese al "9B" del nombre) y su ventana de contexto declarada en la verificación, se posiciona en la franja de modelos multimodales de gama media-alta aptos para despliegue en una sola GPU profesional. La licencia Apache 2.0 facilita su uso comercial, aunque la información pública disponible sobre el modelo base es escasa en esta fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (transformer multimodal con draft nativo para decodificacion especulativa; detalles internos no disponibles) |
| Parametros totales | 5.857.825.408 (5,86 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | techo de peticion de 524.288 tokens; pool compartido de 1.048.576 tokens en Q8 en el perfil medido |
| Tipos de cuantizacion | EXL3 a 8.0 bpw en las 200 lineales del decoder; embeddings de entrada, vision y draft nativo en 8-bit; cabeza de salida en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, requiere `custom_code` y el fork de ExLlamaV3 compatible con SenseNova) |

## Arquitectura y entrenamiento

La model card describe el artefacto como una cuantización "estándar" del checkpoint original en el commit `fa381f7c466739475e172a7d3234e77351e4f613`. La arquitectura subyacente se identifica como `sensenova_loop`, un transformer multimodal con pipeline `image-text-to-text` que incorpora un módulo de visión y un "native draft" para decodificación especulativa. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO.

El proceso de cuantización afecta a 200 capas lineales del decoder, fijadas a 8.0 bpw en EXL3, mientras que los embeddings de entrada, el encoder de visión y el draft nativo se mantienen en 8 bits y la cabeza de salida permanece en BF16. El RoPE original no se modifica. El autor indica que las pruebas se realizaron con "bounded waves" de cuatro y ocho peticiones sobre una GPU de 64 GiB, y remite a `RELEASE-VERIFICATION.json` para memorias y tiempos medidos, aunque advierte que esas pruebas no saturaron el pool con historiales largos.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text).
- Decodificación especulativa mediante draft nativo incluido en el checkpoint.
- Modo de decodificación "target-only" en el perfil Meshify medido (se activa bajo demanda).
- Soporte de contexto largo: techo de petición de 524.288 tokens.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades de audio: no disponible.

## Casos de uso

- Análisis de documentos extensos con imágenes intercaladas: el techo de 524.288 tokens por petición permite procesar informes, contratos o expedientes completos con figuras y tablas en una sola pasada, sin troceado manual.
- Asistentes conversacionales de atención al cliente con historial largo: el pool compartido de 1.048.576 tokens en Q8 y el soporte multi-turno permiten mantener conversaciones prolongadas con muchos usuarios concurrentes en una sola GPU de 64 GiB.
- Procesamiento batch de pares imagen-texto: el pipeline image-text-to-text encaja en tareas de etiquetado, descripción y extracción de información de capturas, facturas o documentación escaneada.
- Despliegue en una única GPU profesional: al caber en 64 GiB con EXL3 a 8.0 bpw, es viable en entornos con A100 80GB, H100 80GB o GPUs de 64 GiB, reduciendo coste frente a alternativas de mayor tamaño.
- Prototipado de pipelines multimodales con decodificación especulativa: el draft nativo permite medir la ganancia de latencia del modo especulativo frente al modo target-only en cargas reales.
- Investigación sobre cuantización EXL3: sirve como referencia reproducible para estudiar el impacto de 8.0 bpw en un modelo multimodal con módulo de visión y draft, comparando contra el checkpoint original en BF16.
- Evaluación de contexto largo en producción: útil para validar latencia y memoria con peticiones cercanas al techo de 524.288 tokens, un escenario poco cubierto por las pruebas publicadas por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo remite a `RELEASE-VERIFICATION.json` para memorias y tiempos medidos, sin cifras reproducidas en el texto.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 10,7 GB en disco; en inferencia, el autor reporta ejecución en una GPU de 64 GiB con pool Q8 de 1.048.576 tokens, por lo que el consumo real depende fuertemente de la longitud de contexto y del número de peticiones concurrentes.
- GPU recomendadas: A100 80GB, H100 80GB o cualquier GPU con 64 GiB o más para reproducir el perfil medido; no se documenta funcionamiento en GPUs de 24 GB o 48 GB.
- GPU de consumo: no hay datos que confirmen que quepa en RTX 4090 (24 GB) con contexto largo; el peso en EXL3 a 8.0 bpw ronda los 6 GB, pero el pool KV y el módulo de visión elevan el requisito.
- Opciones de despliegue: ExLlamaV3 con el fork "SenseNova-capable" incluido por el autor; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras; el autor solo indica oleadas de cuatro y ocho peticiones y remite a `RELEASE-VERIFICATION.json`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Requiere el fork específico de ExLlamaV3 compatible con SenseNova; no funciona con la versión estándar de ExLlamaV3 ni con otros runtimes sin adaptación.
- El autor advierte que las pruebas de verificación no saturaron el pool con historiales largos, por lo que el comportamiento en contextos cercanos al techo de 524.288 tokens no está validado empíricamente.
- El perfil Meshify medido usa decodificación target-only y "permanece detenido hasta que se solicite"; el modo especulativo no está caracterizado en la model card.
- El nombre comercial "9B" no coincide con los parámetros reales (5,86 B); conviene no dimensionar infraestructura a partir del nombre.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinación.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base deben verificarse en `sensenova/SenseNova-Loop-9B` antes de producción.
- Al ser una cuantización, puede presentar degradación frente al checkpoint original en tareas sensibles a precisión numérica; no se publican métricas de divergencia.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/SenseNova-Loop-9B-EXL3-8.0bpw
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B
