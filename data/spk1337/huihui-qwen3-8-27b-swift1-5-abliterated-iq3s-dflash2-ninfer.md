# SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer

## Resumen

Este artefacto es un empaquetado comunitario para el runtime NInfer v3, no un modelo entrenado desde cero. Combina tres componentes: los pesos de texto del modelo Huihui-Qwen3.8-27B "abliterated" en formato Swift-1.5 GSQ-RCO IQ3_S (con cabezas MTP incluidas), un drafter DFlash2 preentrenado de Qwen3.8-27B para decodificación especulativa, y el proyector de visión BF16 de Qwen3.8-27B. El resultado es un único fichero `.ninfer` de ~13,99 GiB que se sirve mediante `ninfer-serve`, con soporte multimodal opcional y selección de backend especulativo (DFlash2 o MTP) en el arranque.

El modelo base es Qwen3.8-27B, del que hereda arquitectura, tokenizador y capacidades; la variante "abliterated" de Huihui elimina los mecanismos de rechazo del modelo original. La relevancia práctica del artefacto está en su perfil de despliegue: cabe en una RTX 4090 de 24 GiB y, según el benchmark publicado por el autor, alcanza 191,78–229,04 tokens/s de decodificación con contexto de hasta 160K en una sola petición.

Conviene subrayar que no es un checkpoint estándar de Transformers (`transformers.AutoModel.from_pretrained` no puede cargarlo) y que no se han publicado resultados en benchmarks de calidad tipo MMLU, HumanEval o GSM8K. Las cifras disponibles son de rendimiento de servidor, no de capacidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8-27B (transformer multimodal con proyector de visión); empaquetada para el runtime NInfer v3 |
| Parametros totales | ~27B (según la denominación del modelo base) |
| Parametros activos | No disponible (la model card no indica que sea MoE) |
| Longitud de contexto | Hasta 176.128 tokens en la configuración del benchmark; el ejemplo de arranque usa 32.768 |
| Tipos de cuantizacion | Pesos IQ3_S con bloques mixtos GSQ-RCO; KV cache `rk4v4`; estado GDN en fp16; proyector de visión BF16 |
| Idiomas soportados | en, zh, de |
| Licencia | Apache-2.0 (preservando avisos upstream) |
| Formato de pesos | `.ninfer` (NInfer v3) con bloques GGUF (`gguf_blocks_v1`); no es un checkpoint Transformers estándar |
| Tamaño del artefacto | ~13,99 GiB |
| Backends especulativos | DFlash2 o MTP, seleccionables uno a la vez al arrancar el servidor |
| Vision | Incluida, debe habilitarse en tiempo de ejecución (`--vision`) |

## Arquitectura y entrenamiento

El artefacto no entrena nada nuevo: es una conversión y combinación de componentes. Por un lado, toma los pesos GGUF de `huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF` en la variante `Huihui-Qwen3.8-27B-abliterated-Swift-1.5-GSQ-RCO-IQ3_S-mtp.gguf`; por otro, incorpora el drafter `z-lab/Qwen3.8-27B-DFlash2` para decodificación especulativa y el proyector de visión `mmproj-Qwen3.8-27B-BF16.gguf` de `ggml-org/Qwen3.8-27B-GGUF`. La arquitectura, configuración y tokenizador provienen de `Qwen/Qwen3.8-27B`. La conversión se realizó con la receta `qwen3_8_27b_gguf` del runtime `iamwavecut/ninfer-all`.

La innovación técnica reseñable no está en el entrenamiento sino en el empaquetado: el formato NInfer v3 admite bloques GGUF con cuantización mixta (GSQ-RCO, IQ3_S), decodificación especulativa con dos backends alternativos (DFlash2 como drafter independiente o MTP como cabezas de predicción multi-token ya presentes en los pesos) y proyector de visión cargable de forma opcional. La naturaleza "abliterated" implica que el modelo ha sido modificado para reducir los rechazos, aunque la model card no detalla el método exacto de abliteración aplicado por Huihui.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.8-27B (sin benchmarks de calidad publicados en este artefacto).
- Procesamiento multimodal image-text-to-text: el pipeline declarado es `image-text-to-text` y el proyector de visión BF16 está incluido, aunque debe habilitarse explícitamente en el servidor (`--vision --vision-residency overlay`).
- Modo "thinking": la API de ejemplo incluye el parámetro `enable_thinking`, por lo que el modelo soporta activar o desactivar el razonamiento extendido en la petición.
- Decodificación especulativa en tiempo de ejecución mediante DFlash2 o MTP (selección excluyente al arrancar).
- Servicio compatible con la API OpenAI (`/v1/chat/completions`) a través de `ninfer-serve`.
- Multilingüe limitado a inglés, chino y alemán según los metadatos del autor.
- Variante "uncensored" / abliterated, orientada a reducir rechazos en las respuestas.
- Tool calling, function calling y razonamiento multi-paso: no documentados en la información disponible.

## Casos de uso

- Asistente local con contexto largo en una RTX 4090: el benchmark del autor valida 160K tokens de entrada con 191,78 tok/s de decodificación, suficiente para resumir o consultar documentación extensa en una sola máquina de consumo.
- Procesamiento de documentos con imágenes: al habilitar el proyector de visión, el modelo puede recibir pares imagen-texto para tareas de descripción, respuesta a preguntas sobre figuras o extracción de información visual, siempre que la VRAM permita residencia del proyector.
- Generación de código y asistencia a la programación: hereda las capacidades de Qwen3.8-27B en este dominio, aunque no hay HumanEval ni datos equivalentes publicados en este artefacto para cuantificarlo.
- Investigación en decodificación especulativa: permite comparar DFlash2 frente a MTP o sin especulación en el mismo artefacto, reiniciando el servidor con `--spec dflash2` o `--spec mtp`, midiendo aceptación de drafts vía `--request-log-jsonl` o `/metrics`.
- Despliegue de agentes conversacionales multi-turno con contexto de 32K: el ejemplo oficial arranca con `--max-context 32768`, que cubre sesiones largas de atención al cliente o asistentes internos.
- Entornos que requieren respuestas sin filtros editoriales: la variante abliterated reduce los rechazos, adecuada para investigación en seguridad, red teaming o generación creativa sin restricciones, siempre con moderación externa.
- Integración en pipelines existentes: al exponer un endpoint compatible con OpenAI, puede conectarse a clientes y frameworks que ya hablan el protocolo `/v1/chat/completions` sin cambiar código de aplicación.

## Benchmarks y rendimiento

El autor publica un benchmark local de servidor en RTX 4090 (24 GiB), Windows, NInfer, run ID `20261019-205035-980161`, etiqueta `HUIHUI-SWIFT15-IQ3S-DFLASH2-16GB`. Son mediciones del lado cliente del servidor completo, no del drafter aislado.

| Contexto de entrada | Tokens de salida | Time to first token | Decodificación observada |
| ---: | ---: | ---: | ---: |
| ~1K | 2.048 | 0,35 s | 217,98 tok/s |
| ~32K | 2.048 | 10,06 s | 229,04 tok/s |
| ~100K | 2.048 | 36,23 s | 207,78 tok/s |
| ~160K | 2.048 | 66,82 s | 191,78 tok/s |

Configuración reportada: 176.128 de contexto máximo, KV `rk4v4`, concurrencia máxima 2, thinking desactivado, 2.048 tokens por prueba de decodificación sostenida. El conjunto completo reportó 63/63 peticiones HTTP exitosas y dos pruebas de needle-retrieval a 100K y 160K superadas.

Advertencias del propio autor: los 229,04 tok/s son una única ejecución observada, no un promedio multi-run ni una garantía de throughput máximo; no hay comparación directa DFlash2 frente a MTP o sin especulación; los contadores de aceptación de drafts y las estadísticas de prefill por petición no se capturaron (no se incluyó el JSONL de peticiones en el ZIP). No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks de calidad equivalentes en la información disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto pesa ~13,99 GiB; con cuantización IQ3_S y KV `rk4v4` el autor valida funcionamiento en una RTX 4090 de 24 GiB. El proyector de visión añade memoria si se activa.
- GPU validadas: NVIDIA GeForce RTX 4090 (24 GiB) según el benchmark del autor. Otras GPU no están documentadas en la información disponible.
- Cabe en GPU de consumo: sí, al menos en RTX 4090. Para GPUs de 16 GiB no hay validación publicada; a contextos largos el KV cache puede exceder esa VRAM.
- Opciones de despliegue: exclusivamente el runtime NInfer-all (`ninfer-serve.exe` / binario equivalente). No es compatible con vLLM, llama.cpp, Ollama ni TGI en el estado actual del artefacto.
- Latencia y throughput estimados en RTX 4090: TTFT de 0,35 s a 1K de contexto, 10,06 s a 32K, 36,23 s a 100K y 66,82 s a 160K; decodificación entre 191,78 y 229,04 tok/s según contexto. El preprocesado de prompt crece sustancialmente con la longitud de entrada.
- Concurrencia: el benchmark se ejecutó con `--max-concurrency 2`; no hay datos publicados para concurrencias mayores.
- Requisito de software: build reciente de NInfer-all con soporte de bloques GGUF y DFlash2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (SPK1337 NInfer v3) | ~27B | hasta 176.128 (benchmark) | IQ3_S GSQ-RCO, `.ninfer` con bloques GGUF | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base oficial) | ~27B | No disponible | No disponible (checkpoint oficial) | No disponible | HuggingFace |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | ~27B | No disponible | GGUF (incluye IQ3_S + MTP) | No disponible | HuggingFace |
| z-lab/Qwen3.8-27B-DFlash2 | No disponible (drafter) | No disponible | No disponible | No disponible | HuggingFace |

La comparación relevante es de empaquetado: este artefacto integra en un solo fichero los pesos abliterated, el drafter DFlash2 y el proyector de visión, algo que los repositorios de origen ofrecen por separado. Frente al checkpoint oficial, la diferencia es el runtime (NInfer en lugar de Transformers) y la cuantización agresiva IQ3_S. No se dispone de datos de calidad comparables entre las cuatro opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado nuevo: hereda íntegramente las limitaciones del Qwen3.8-27B base y de la abliteración de Huihui.
- La abliteración reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o dañino; no se recomienda su despliegue sin moderación externa.
- Riesgo de alucinación no cuantificado: no hay benchmarks de fidelidad ni de QA publicados para este artefacto.
- Idiomas documentados limitados a inglés, chino y alemán; el rendimiento en castellano no está validado y podría degradarse.
- No es cargable en `transformers`; requiere el runtime NInfer-all y un build concreto con soporte de GGUF blocks + DFlash2. No funciona con vLLM, llama.cpp, Ollama ni TGI.
- El benchmark publicado corresponde a una única ejecución del lado cliente, sin promedios multi-run, sin comparación DFlash2 frente a MTP o sin especulación, y sin métricas de aceptación de drafts; no debe interpretarse como throughput garantizado.
- El TTFT se degrada notablemente con contexto largo (66,82 s a 160K), lo que limita su uso interactivo en ventanas muy grandes.
- Tool calling, function calling y razonamiento agéntico multi-paso no están documentados en la información disponible; no deben asumirse.
- La licencia declarada es Apache-2.0, pero se deben preservar los avisos upstream; conviene verificar la licencia efectiva del checkpoint Qwen3.8-27B original antes de uso comercial.
- Artefacto con 0 descargas y 0 likes en el momento de la consulta, mantenido por un único autor comunitario (SPK1337); no hay validación independiente del benchmark.
- El repositorio ocupa 15,0 GB y el fichero `.ninfer` (~13,99 GiB) debe descargarse completo con `hf download`; la model card indica que la subida puede no estar disponible en el momento de su publicación.

## Enlaces

- [HuggingFace: SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer](https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer)
- [BENCHMARK.md (relativo al repositorio)](https://huggingface.co/SPK1337/Huihui-Qwen3.8-27B-Swift1.5-Abliterated-IQ3S-DFlash2-NInfer/blob/main/BENCHMARK.md)
- [huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF)
- [z-lab/Qwen3.8-27B-DFlash2](https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2)
- [ggml-org/Qwen3.8-27B-GGUF](https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF)
- [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [iamwavecut/ninfer-all (runtime y conversor)](https://github.com/iamwavecut/ninfer-all)
