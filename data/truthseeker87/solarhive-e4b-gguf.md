# Truthseeker87/solarhive-e4b-gguf

## Resumen

SolarHive E4B GGUF es la variante de despliegue en el borde (edge) del modelo SolarHive, un asesor energetico para microredes solares comunitarias desarrollado por Truthseeker87 en el marco del hackathon Gemma 4 Good (Google DeepMind x Kaggle). Se trata de un fine-tune mediante LoRA del modelo base google/gemma-4-e4b-it, una arquitectura densa con Per-Layer Embeddings (PLE) de 8.000 millones de parametros totales y 4.500 millones efectivos, distribuido en formato GGUF para su uso con llama.cpp y Ollama.

El modelo resuelve un problema concreto: ofrecer asistencia energetica conversacional con capacidad multimodal (texto, imagen y audio) y function calling nativo, manteniendo las prompts en el dispositivo del usuario. Su relevancia actual radica en que demuestra que un modelo de 8B con capacidades multimodales puede ejecutarse en hardware de consumo sin GPU dedicada: la model card documenta una ejecucion en un Surface Pro 8 con CPU Intel i5-1135G7 y 16 GB de RAM.

El repositorio incluye dos copias identicas del GGUF de texto cuantizado en Q4_K_M (5,34 GB cada una) y un proyector multimodal en BF16 (992 MB), sumando un footprint total de 6,3 GB. El fine-tune se entreno sobre 1.727 ejemplos del dataset solarhive-community-solar-multimodal, con una perdida convergida de 0,9218 y un tiempo de entrenamiento de 420 segundos en una RTX PRO 6000 Blackwell.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Densa con Per-Layer Embeddings (PLE); 8B totales, 4,5B efectivos |
| Parametros totales | 7.518.069.290 (segun safetensors) |
| Parametros activos | No aplica (no es MoE; el modelo base reporta 4,5B efectivos) |
| Longitud de contexto | No disponible (la model card menciona pruebas a 4K de contexto) |
| Tipos de cuantizacion | Q4_K_M estandar con Q6_K en el tensor PLE; proyector multimodal en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT para los archivos SolarHive; Apache 2.0 para el modelo base Gemma 4 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |
| Modalidades | Texto, imagen y audio (via proyector mmproj) |
| Function calling | Protocolo nativo de Gemma 4 |
| Tamano del repositorio | 16,3 GB |

## Arquitectura y entrenamiento

El modelo se basa en Gemma 4 E4B, una arquitectura transformer densa que incorpora Per-Layer Embeddings (PLE). El tensor PLE (`per_layer_token_embd.weight`, con forma [10752, 262144]) concentra 2.820 millones de parametros y es el tensor individual mas grande del modelo, lo que motivo que la receta de cuantizacion Q4_K_M le asigne Q6_K en lugar de Q4_K para preservar precision. El fine-tune se realizo con LoRA en BF16 mediante Unsloth sobre 1.727 ejemplos de texto del dataset solarhive-community-solar-multimodal; el encoder de vision SigLIP (~150M parametros para E4B) y el encoder de audio Conformer no fueron modificados por el LoRA, y se empaquetan sin cambios en el archivo proyector `mmproj-solarhive-e4b-BF16.gguf` (658 tensores de vision y 751 de audio).

La cuantizacion se genero con llama.cpp a partir de los safetensors fusionados. La model card documenta una receta de reproducibilidad para hardware de 16 GB de RAM: la conversion estandar Q4_K_M del tensor PLE a Q6_K requiere un buffer intermedio float32 de ~10,7 GB que provoca OOM en `llama-quantize`, por lo que se puede forzar ese tensor a Q4_0 con `--tensor-type per_layer_token_embd.weight=q4_0` para evitar el fallo. No se documentan detalles sobre RLHF, DPO ni composicion completa del dataset de preentrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles con soporte multi-turno.
- Razonamiento y respuesta a preguntas sobre energia solar, microredes comunitarias y almacenamiento compartido de baterias.
- Vision: inspeccion visual de instalaciones mediante el encoder SigLIP empaquetado en el proyector multimodal.
- Audio: procesamiento de entrada de audio mediante el encoder Conformer incluido en el proyector.
- Function calling nativo con el protocolo de Gemma 4, orientado a la invocacion de herramientas de clima, datos solares, red electrica y PVWatts.
- Integracion con APIs en la nube para datos en vivo, manteniendo las prompts en el dispositivo.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Asesoria energetica residencial: el modelo mantiene conversaciones multi-turno sobre optimizacion de generacion solar distribuida y uso de baterias compartidas, adecuado por su fine-tune especifico en el dominio y su capacidad de invocar herramientas de datos en vivo.
- Inspeccion visual de paneles e instalaciones: el usuario puede enviar imagenes de la instalacion y el modelo, mediante el encoder SigLIP del proyector multimodal, las interpreta en el contexto de la conversacion energetica.
- Despliegue en hardware sin GPU: con 6,3 GB de footprint total y Q4_K_M, se ejecuta en portatiles con CPU y 16 GB de RAM, como el Surface Pro 8 documentado, lo que permite llevar el asesor a campo sin infraestructura cloud.
- Routing de herramientas en pipelines de datos: el function calling nativo permite encadenar llamadas a APIs de PVWatts, clima y red electrica desde un agente local, con las prompts permaneciendo en el dispositivo.
- Prototipado de agentes de sostenibilidad: la licencia MIT de los archivos del modelo y su compatibilidad con Ollama y llama-server facilitan la experimentacion en proyectos de eficiencia energetica.
- Educacion y divulgacion energetica: el modelo puede explicar conceptos de microredes y autoconsumo en conversaciones guiadas, con entrada de audio para interaccion por voz.
- Investigacion en fine-tuning de dominio: el par de repositorios (LoRA y safetensors fusionados) permite reproducir el entrenamiento y estudiar el efecto del LoRA sobre un modelo multimodal base.

## Benchmarks y rendimiento

La model card reporta una unica ejecucion local en un Surface Pro 8 (Intel i5-1135G7, 16 GB RAM, sin GPU), con el GGUF y la cache de blobs de Ollama en una unidad USB externa:

| Prueba | Resultado |
|---|---|
| Tool routing | 5 de 5 |
| When2Call | 2 de 3 |
| Q&A | 5 de 5 registrado, no calificado |
| Total agregado reportado | 10 de 10 (mezcla de pruebas calificadas y no calificadas) |

Advertencias sobre estos datos: las pruebas usan prompts del propio proyecto, no un conjunto held-out, y el archivo de resultados de esa ejecucion no esta incluido en el repositorio. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: al menos 7 GB de RAM para el GGUF de texto a 4K de contexto; footprint total de 6,3 GB sumando el proyector multimodal de 992 MB.
- GPU recomendadas: no se especifican; la model card documenta ejecucion exclusivamente en CPU (Intel i5-1135G7 con AVX2, AVX512 y VNNI mediante `ggml-cpu-icelake.dll`). El entrenamiento LoRA se realizo en una RTX PRO 6000 Blackwell.
- Cabe en hardware de consumo: si, en portatiles con 16 GB de RAM y CPU moderna; no se documenta su comportamiento en GPU consumer como RTX 4090.
- Opciones de despliegue: Ollama 0.21.0 (con los Modelfile incluidos), llama.cpp y llama-server (con `--mmproj` para multimodal).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| SolarHive E4B GGUF | 8B totales / 4,5B efectivos | No disponible | Texto, imagen, audio | MIT (archivos) / Apache 2.0 (base) | GGUF |
| google/gemma-4-e4b-it (base) | 8B totales / 4,5B efectivos | No disponible | Texto, imagen, audio | Apache 2.0 | Safetensors |
| SolarHive 26B A4B LoRA | 26B (A4B) | No disponible | Texto, imagen (VQA completo) | No disponible | LoRA |
| SolarHive E4B Ollama | 8B totales / 4,5B efectivos | No disponible | Texto, imagen, audio | MIT / Apache 2.0 | Safetensors fusionados |

La comparativa se limita a variantes del mismo proyecto y al modelo base, ya que la informacion disponible no incluye datos de rendimiento frente a alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Datos de benchmark fragiles: los resultados de la model card provienen de una unica ejecucion con prompts del proyecto, sin conjunto held-out ni archivo de resultados versionado; no deben tratarse como evidencia de rendimiento generalizable.
- Dominio estrecho: el fine-tune se limita a 1.727 ejemplos de energia solar comunitaria, lo que puede degradar el rendimiento en tareas generales respecto al modelo base.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad; en un dominio con datos numericos (produccion, costes, previsiones) el riesgo es relevante y requiere validacion externa.
- Dependencia de APIs externas: aunque las prompts se procesan localmente, las herramientas de clima, red y PVWatts realizan llamadas a la nube, lo que afecta a la privacidad efectiva y a la disponibilidad offline.
- Contexto no especificado: no se declara la longitud maxima de contexto soportada; las pruebas se realizaron a 4K.
- Cuantizacion: la receta estandar Q4_K_M no se puede reproducir en maquinas de 16 GB de RAM sin forzar el tensor PLE a Q4_0, lo que altera la receta original.
- Licencia: los archivos SolarHive son MIT, pero el modelo base Gemma 4 esta sujeto a la licencia de Google (Apache 2.0 segun la model card); conviene verificar los terminos de uso comercial del modelo base antes de produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Truthseeker87/solarhive-e4b-gguf
- Dataset de entrenamiento: https://huggingface.co/datasets/Truthseeker87/solarhive-community-solar-multimodal
- Variante LoRA 26B A4B: https://huggingface.co/Truthseeker87/solarhive-26b-a4b-lora
- Variante Ollama (safetensors): https://huggingface.co/Truthseeker87/solarhive-e4b-ollama
- Modelo base: https://huggingface.co/google/gemma-4-e4b-it
- Pagina del modelo Gemma 4 en Kaggle: https://kaggle.com/models/google/gemma-4
- Hackathon Gemma 4 Good: https://kaggle.com/competitions/gemma-4-good-hackathon
- Documentacion de Gemma 4 (Google): https://ai.google.dev/gemma/docs/core/model_card_4
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Blog de receta SFT para Gemma 4: https://huggingface.co/blog/gemma4
- Unsloth: https://unsloth.ai
- Paper referenciado (arXiv:2504.18851): https://arxiv.org/abs/2504.18851
- Paper referenciado (arXiv:2211.17192): https://arxiv.org/abs/2211.17192
