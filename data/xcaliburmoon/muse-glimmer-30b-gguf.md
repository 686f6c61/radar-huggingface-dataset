# XcaliburMoon/muse-glimmer-30b-gguf

## Resumen

Muse-Glimmer-30B (GGUF) es una cuantización comunitaria publicada por el usuario XcaliburMoon del modelo base `meta-models/Muse-Glimmer-30B`, un modelo conversacional multimodal de unos 27,85 mil millones de parámetros orientado a razonamiento, tool calling y visión. Este repositorio empaqueta los pesos en formato GGUF cuantizados a Q4_K_M junto con todos los ficheros auxiliares necesarios para ejecutar el modelo con llama.cpp: el proyector de visión (mmproj) en BF16, el drafter de decodificación especulativa DFlash, la plantilla de chat en Jinja, el tokenizador y un script de arranque (`run.sh`). Todo el conjunto se distribuye bajo licencia Apache-2.0.

Su relevancia práctica reside en la facilidad de despliegue: basta una descarga de 15,8 GiB para tener un modelo de texto funcional, al que se pueden añadir visión y decodificación especulativa como ficheros opcionales. Según los datos medidos publicados en la model card, la versión Q4_K_M alcanza 52,8 tok/s de decodificación en una A100 80 GB, un 1,92x más rápido que la variante BF16, lo que lo hace atractivo para servir endpoints multiusuario en una sola GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (detalles no disponibles), con canal de razonamiento y soporte de visión |
| Parametros totales | 27.854.794.240 (~27,85 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | hasta 131.072 tokens (configuración de ejemplo en la model card); no disponible el límite oficial del modelo base |
| Tipos de cuantizacion | Q4_K_M (este repo); BF16 disponible aguas arriba |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el repositorio base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de ~27,85 B de parámetros con capacidades multimodales (entrada de imágenes mediante un proyector de visión distribuido como fichero mmproj independiente en BF16) y un canal de razonamiento tipo "thinking": el modelo genera primero tokens de razonamiento y después la respuesta final. La model card indica que el esfuerzo de razonamiento se controla a nivel de petición mediante el campo `reasoning_strength` (por ejemplo, `"high"`), sin necesidad de un modelo separado. No consta en la información disponible la arquitectura exacta, el número de tokens de entrenamiento ni la composición del dataset del modelo base.

Este repositorio añade dos innovaciones de despliegue destacables. Primera, la decodificación especulativa mediante un drafter DFlash cuantizado en k-quants (1,5 GiB), activable con `-md dflash-kquant.gguf --draft-max 8 --draft-min 2`. Segunda, el empaquetado completo: mmproj, drafter, plantilla de chat canónica y tokenizador viajan en el mismo repo, evitando el problema habitual de incompatibilidades entre ficheros auxiliares de repos distintos. La cuantización Q4_K_M se realizó localmente desde el GGUF BF16 con `llama-quantize`.

## Capacidades

- Generación de texto conversacional con canal de razonamiento explícito (`reasoning_content`), con esfuerzo de razonamiento ajustable por petición (`reasoning_strength`).
- Visión: acepta entrada de imágenes mediante el proyector mmproj BF16 incluido (3,6 GiB).
- Tool calling nativo: acepta herramientas en el esquema OpenAI y emite las llamadas en el formato propio del modelo a través de la plantilla Jinja.
- Decodificación especulativa opcional mediante drafter DFlash para acelerar la inferencia.
- Razonamiento en múltiples pasos (multi-step reasoning), según las etiquetas del repositorio.
- Soporte de contexto largo: los ejemplos de despliegue muestran hasta 131.072 tokens totales repartidos en 16 slots de 8.192 tokens.
- Reutilización de prefijo (prefix caching): los prompts con prefijo compartido sirven tokens desde caché, lo que beneficia despliegues con system prompt fijo.
- Idioma principal: inglés. No se documentan capacidades multilingües.

## Casos de uso

- Servidor de inferencia multiusuario en una sola GPU: con `-c 131072 --parallel 16` se obtienen 16 slots de 8.192 tokens en una A100 80 GB, con 351 tok/s agregados a 16 peticiones concurrentes, adecuado para un endpoint interno de equipo o departamento.
- Asistentes con razonamiento profundo: el campo `reasoning_strength` permite pedir respuestas rápidas en consultas triviales y razonamiento intensivo en problemas complejos, sin cambiar de modelo.
- Agentes con herramientas: el tool calling nativo en esquema OpenAI permite integrarlo en frameworks de agentes (LangChain, funciones propias vía `llama-server` con API compatible OpenAI) para orquestación de herramientas y flujos multi-paso.
- Análisis de imágenes conversacional: con el mmproj activado (`VISION=1`), se pueden hacer preguntas sobre imágenes dentro del flujo de chat, útil para descripción de documentos, capturas o gráficos.
- Automatización con health checks: el endpoint `/metrics` y `/health` (503 durante la carga, 200 cuando está listo) permite integrar el modelo en orquestadores (systemd, Kubernetes, scripts) sin sondeos temporales frágiles.
- Optimización de latencia con decodificación especulativa: el drafter DFlash (1,5 GiB) permite acelerar la generación en escenarios de latencia sensible, activable con una sola flag.
- Despliegue reproducible en máquinas nuevas: `run.sh` + `hf download` configuran todo (modelo, plantilla, tokenizador) sin pasos manuales, útil para pipelines de CI/CD o entornos efímeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card sí incluye mediciones de rendimiento de inferencia, realizadas en una A100 SXM4 80GB con llama.cpp (build `3c809f4`, ggml 0.28.0), CUDA, offload completo y flash attention:

| Métrica | Q4_K_M | BF16 |
|---|---|---|
| Tamaño del fichero | 15,8 GiB | 51,9 GiB |
| VRAM residente | 19,3 GB | no cabe con margen |
| Decodificación, un stream | 52,8 tok/s | 28,5 tok/s |
| Prefill, un stream | 1.306 tok/s | no disponible |
| Decodificación, 16 concurrentes | 351 tok/s agregados | no disponible |

Datos adicionales medidos: prompt frío de 627 tokens con 1.172 tok/s de prefill, 535 ms hasta el primer token y 52,4 tok/s de decodificación; con prefijo compartido, 35 de 51 tokens del prompt se sirvieron desde caché. La cuantización Q4_K_M es 1,92x más rápida que BF16 en decodificación.

## Requisitos de hardware

- VRAM estimada: 19,3 GB residentes para Q4_K_M según medición publicada; con contexto completo de 131.072 tokens y 16 slots se usó una A100 de 80 GB. La variante BF16 (51,9 GiB) no cabe con holgura en una sola A100 80 GB.
- GPU medida: NVIDIA A100 SXM4 80GB. No hay mediciones en otras tarjetas.
- Consumer GPUs: con 19,3 GB de VRAM residente para los pesos, una RTX 4090 (24 GB) podría alojar el modelo de texto con contexto moderado (no verificado en la documentación); añadir visión y decodificación especulativa incrementa el consumo (~3,6 GiB y ~1,5 GiB adicionales respectivamente).
- Despliegue: llama.cpp (`llama-server`) es el runtime documentado, con API compatible OpenAI, `--jinja` obligatorio para la plantilla de razonamiento, flash attention y offload completo a GPU (`-ngl 99`). No se documenta soporte de vLLM, TGI u Ollama.
- Latencia: 535 ms hasta el primer token con prompt frío de 627 tokens (medido en host local). A través de túneles SSH o proxies, la latencia de primer token añade 0,7–2,8 s de salto de red; la decodificación no se ve afectada.
- Rendimiento: 52,8 tok/s de decodificación en un stream; prefill de 1.306 tok/s sostenido hasta 16 slots concurrentes.

## Comparativa con modelos similares

No se han publicado comparativas oficiales con otros modelos en la informacion disponible. Como referencia contextual de la categoría (modelos ~30B con razonamiento, visión y tool calling en GGUF):

| Modelo | Parámetros | Contexto | Visión | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (este repo, Q4_K_M) | 27,85 B | hasta 131.072 (ejemplo de despliegue) | Sí (mmproj) | Apache-2.0 | Drafter especulativo DFlash incluido; 52,8 tok/s en A100 |
| Qwen2.5-VL-32B-Instruct | 32 B | 128.000 | Sí | Apache-2.0 | Amplio soporte multilingüe; ecosistema GGUF comunitario |
| QwQ-32B | 32 B | 131.072 | No | Apache-2.0 | Enfocado a razonamiento; sin entrada de imágenes |

La comparativa es orientativa: no hay datos de benchmarks que permitan comparar rendimiento en tareas estandarizadas.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado solo para inglés; no se documentan capacidades multilingües ni rendimiento en castellano.
- Plantilla de chat obligatoria: sin `--jinja` y la `chat_template.jinja` incluida, el canal de razonamiento se corrompe y el modelo devuelve respuestas vacías.
- Presupuesto de tokens: llama.cpp contabiliza los tokens de razonamiento dentro de `max_tokens`; un valor bajo puede agotar el presupuesto en pensar y devolver una respuesta vacía. Hay que presupuestar `answer_tokens + think_tokens`.
- Respuestas vacías: un `content` vacío con `reasoning_content` presente indica truncamiento, no fallo del modelo; conviene revisar el canal de razonamiento antes de diagnosticar.
- Latencia de red: el acceso vía túnel SSH o proxy añade 0,7–2,8 s al primer token; publicar el puerto o ejecutar el cliente en el host mitiga el problema.
- Sesgos y riesgo de alucinación: no se documentan evaluaciones de sesgos ni tasas de alucinación para este modelo; deben asumirse los riesgos habituales de LLM generativos en producción.
- Procedencia: se trata de una cuantización comunitaria del modelo base `meta-models/Muse-Glimmer-30B`; el GGUF BF16 no se replica en este repo, por lo que cualquier verificación debe hacerse contra el repositorio aguas arriba.
- Licencia: Apache-2.0 permite uso comercial sin restricciones conocidas más allá de las de la propia licencia.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/XcaliburMoon/muse-glimmer-30b-gguf
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Paper, blog o demo oficial: no disponible en la informacion proporcionada.
