# webAI-Official/gemma-4-12b-it-critic-lora-peft

## Resumen

`webAI-Official/gemma-4-12b-it-critic-lora-peft` no es un modelo completo, sino un adaptador LoRA (PEFT) de rango 16 entrenado sobre `google/gemma-4-12B-it` para fijar una persona concreta: la de un **crítico**. Lo publica el usuario webAI-Official y su función es que el modelo base mantenga un rol de revisión y evaluación bajo presión adversarial, en lugar de abandonarlo y responder como asistente genérico.

El adaptador se entrenó con SFT supervisado (8 173 ejemplos, 3 épocas, 1 533 pasos finales) usando como profesor para generar los objetivos a Granite 4.2 30B en FP8. Los pesos se distribuyen en `safetensors` en fp32 (0,3 GB de repositorio) y existe una versión GGUF en un repositorio hermano del mismo autor. Es relevante ahora porque los flujos de trabajo con LLM como juez, revisión de código y crítica iterativa necesitan modelos que no se salgan del papel asignado, y este adaptador reporta una mejora de +24,9 puntos en ese aspecto frente al modelo base con el mismo *role prompt*.

La información publicada es escasa: no hay datos sobre licencia, idiomas, longitud de contexto efectiva ni benchmarks estándar (MMLU, HumanEval, GSM8K). La única evaluación disponible es la suite propietaria del autor (`persona contract suite`, 753 casos *held-out*), así que cualquier uso en producción debería validarse con evaluaciones propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: `google/gemma-4-12B-it` |
| Parámetros totales | No disponible para el adaptador (repositorio de 0,3 GB); el modelo base se denomina 12B pero no se detalla la cifra exacta en la información disponible |
| Parámetros activos | No aplica (no es un modelo MoE; es un adaptador de rango bajo) |
| Longitud de contexto | No disponible (el entrenamiento SFT usó `max_seq_len` de 8 192 tokens) |
| Tipos de cuantización | No disponible para el adaptador (pesos en fp32); existe versión GGUF del adaptador en repositorio aparte |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la información proporcionada; el modelo base es de Google y conviene revisar sus términos |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`, fp32) + `adapter_config.json`; versión GGUF en `gemma-4-12b-it-critic-lora-GGUF` |
| Rango LoRA | 16 |
| Alpha LoRA | 32 |
| Dropout | 0,05 |
| Módulos objetivo | `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj` |
| Modo de razonamiento | `thinking` |
| Librerías | PEFT 0.21.0, Transformers 5.17 |
| Pipeline | `text-generation` (conversacional) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atención y de la MLP del modelo base (los siete módulos listados), con rango 16, alpha 32 y dropout 0,05, lo que supone una intervención de bajo rango sobre prácticamente todas las matrices grandes de cada bloque del transformer. No se modifica el tokenizador: el repositorio incluye `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` para que la plantilla de chat empleada en el entrenamiento viaje junto a los pesos. El autor indica que se puede invocar `merge_and_unload()` para fusionar el adaptador con los pesos base y desplegar un único artefacto.

El entrenamiento fue exclusivamente SFT (el autor señala que la ejecución de DPO para esta persona no se conservó): 8 173 ejemplos, 3 épocas, `lr` 0,0001, longitud máxima de secuencia 8 192, paso final 1 533, con pérdida de entrenamiento de 0,3558 y de evaluación de 0,3574. Los objetivos de entrenamiento se generaron con Granite 4.2 30B en FP8, es decir, hay una componente de destilación desde un profesor de mayor tamaño. No se documentan la composición del dataset, el número de tokens vistos ni si hubo filtrado o deduplicación.

## Capacidades

- Generación de texto conversacional con un rol fijado de crítico (revisión, evaluación, señalización de problemas).
- Mantenimiento del rol bajo presión adversarial: 87,9 % de los casos en la suite del autor, frente al 63,0 % del modelo base con el mismo *role prompt*.
- Modo de razonamiento explícito (`thinking`), configurable a través de la plantilla de chat incluida.
- Aceptación de peticiones generales dentro del personaje: 100,0 % de los casos de la suite, frente al 33,3 % del modelo base.
- Compatibilidad con el ecosistema PEFT/Transformers (carga por `PeftModel.from_pretrained`, fusión con `merge_and_unload`) y con vLLM mediante `--enable-lora --max-lora-rank 16`.
- Soporte de *tool calling* y de agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (dependen del modelo base, no documentado aquí).
- Capacidades de visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **LLM como juez en pipelines de evaluación**: el adaptador se carga junto al modelo base en vLLM como un módulo LoRA adicional (`--lora-modules critic=...`) y se enrutan a él las peticiones de puntuación o crítica, de modo que el resto del tráfico sigue usando el modelo base sin duplicar pesos en memoria.
- **Revisión de *pull requests* automatizada**: se le pasa el diff y la descripción del cambio con una plantilla que le pide señalar riesgos, casos límite no cubiertos y problemas de estilo; la persona de crítico evita que el modelo derive hacia una respuesta complaciente o hacia una reescritura completa del código.
- **Red teaming de borradores**: dada una respuesta generada por otro modelo, el adaptador se emplea para enumerar debilidades, supuestos no verificados y afirmaciones que requieren cita, dentro de un bucle de crítica y refinamiento.
- **Revisión editorial de documentación técnica**: con 8 192 tokens de secuencia en entrenamiento, puede afrontar secciones y capítulos completos de documentación y devolver comentarios estructurados por severidad.
- **Simulación de revisores en entornos formativos**: en un sistema de escritura asistida, el adaptador hace de revisor exigente sobre el texto del usuario, con un rol estable durante conversaciones multi-turno.
- **Control de calidad en CI/CD de prompts**: integrado como paso de validación que evalúa las respuestas de un modelo generador contra una rúbrica y bloquea la publicación si la crítica detecta problemas, aprovechando el `chat_template.jinja` incluido para reproducir el formato de entrenamiento.
- **Generación de datos sintéticos de crítica**: producir pares (borrador, crítica) para entrenar o afinar otros modelos, partiendo de la persona ya consolidada en este adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta su propia `persona contract suite`: 753 casos *held-out*, comparando el adaptador frente a `google/gemma-4-12B-it` con el mismo *role prompt*, ambos con temperatura 1,0. Los valores son porcentajes.

| Métrica | Adaptador | gemma-4-12B-it (con role prompt) | Ganancia (pts) |
|---|---:|---:|---:|
| Se mantiene en el rol bajo presión adversarial | 87,9 | 63,0 | +24,9 |
| Peticiones generales atendidas dentro del rol | 100,0 | 33,3 | +66,7 |

Advertencia metodológica: son métricas definidas por el propio autor, sobre un conjunto de evaluación no público, con temperatura 1,0 y sin intervalos de confianza ni repeticiones documentadas. No permiten comparación con otros adaptadores de crítica publicados.

## Requisitos de hardware

- **VRAM del adaptador**: 0,3 GB en fp32; negligible frente al modelo base.
- **VRAM del modelo base (estimación, no dato publicado)**: un modelo de 12B en bf16 requiere aproximadamente 24 GB solo para pesos, más caché KV y activaciones; en la práctica, del orden de 26-30 GB para inferencia cómoda con contexto largo.
- **Cuantización (estimación)**: 8 bits ≈ 12-13 GB de pesos; 4 bits ≈ 6-7 GB de pesos. El adaptador debe fusionarse o aplicarse sobre la capa correspondiente; el autor ofrece una versión GGUF para este fin.
- **GPU profesionales**: A100 40 GB, H100 80 GB o L40S permiten bf16 sin compromisos y varios adaptadores LoRA simultáneos en vLLM.
- **GPU de consumo**: una RTX 4090 (24 GB) va muy justa en bf16 y requiere cuantización para contexto amplio; RTX 3090 (24 GB) en la misma situación; tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con cuantización de 4-8 bits y contextos moderados.
- **Opciones de despliegue**: vLLM con soporte LoRA (comando documentado por el autor), Transformers + PEFT, llama.cpp/Ollama a través de la versión GGUF del adaptador.
- **Latencia y throughput**: no disponibles; dependen del backend, del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Persona contract suite (rol / general) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-12b-it-critic-lora-peft` (este adaptador) | LoRA r16 sobre base 12B; 0,3 GB | No disponible | 87,9 / 100,0 | No disponible | Hugging Face; 0 descargas, 0 likes |
| `google/gemma-4-12B-it` (con role prompt) | 12B | No disponible | 63,0 / 33,3 | No disponible | Hugging Face |
| `webAI-Official/gemma-4-12b-it-critic-lora-GGUF` | Mismos pesos en GGUF | No disponible | No evaluado de forma independiente | No disponible | Hugging Face |
| Otros adaptadores LoRA de persona/crítica comparables | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación relevante es frente al *fine-tuning* completo: este adaptador ocupa 0,3 GB, se puede servir en paralelo con el modelo base en vLLM y se fusiona en un solo artefacto cuando interesa, con un coste de entrenamiento muy inferior. No hay datos públicos que permitan compararlo con adaptadores de crítica de otros autores.

## Limitaciones y advertencias

- **Evaluación no independiente**: la única métrica disponible procede de la suite del propio autor, con 753 casos y sin conjunto de test público; no hay validación externa.
- **Sin benchmarks estándar**: no se reportan MMLU, HumanEval ni GSM8K, por lo que se desconoce si el adaptador degrada capacidades generales del modelo base.
- **Tasa de fallo del rol**: un 12,1 % de los casos de presión adversarial siguen provocando salidas del personaje, según los propios datos del autor.
- **Riesgo de alucinación**: no evaluado. Al ser un adaptador de crítica, puede generar objeciones o problemas inexistentes con la misma fluidez con la que detecta los reales; conviene exigir justificación verificable.
- **Destilación desde un profesor**: los objetivos de SFT se generaron con Granite 4.2 30B en FP8, de modo que los sesgos y errores del profesor pueden haberse transferido al adaptador.
- **Solo SFT**: el autor indica que la ejecución de DPO no se conservó, por lo que no hay una etapa de alineación por preferencias sobre esta persona.
- **Licencia no especificada**: no se indica la licencia del adaptador en la información disponible; el uso comercial exige comprobar los términos del modelo base de Google y del adaptador.
- **Idiomas y contexto no documentados**: no se declaran idiomas soportados ni longitud de contexto nativa; el único dato es la longitud máxima de entrenamiento (8 192 tokens).
- **Madurez**: 0 descargas y 0 likes en el momento de la consulta, publicador no verificado y sin histórico de mantenimiento; tratar como artefacto experimental.
- **Dependencia del prompt**: el comportamiento depende de la plantilla de chat (`chat_template.jinja`) y de los ajustes de persona (`persona.json`) incluidos en el repositorio; usarlo con otra plantilla puede degradar el resultado.
- **Versiones de librerías**: guardado con PEFT 0.21.0 y Transformers 5.17; versiones anteriores pueden no cargar el adaptador correctamente.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/webAI-Official/gemma-4-12b-it-critic-lora-peft
- Versión GGUF del mismo adaptador: https://huggingface.co/webAI-Official/gemma-4-12b-it-critic-lora-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de Transformers: https://huggingface.co/docs/transformers
- LoRA en vLLM: https://docs.vllm.ai/en/latest/features/lora.html
- llama.cpp (para la variante GGUF): https://github.com/ggml-org/llama.cpp
- Hilo de Hacker News sobre modelos locales con adaptadores LoRA (contexto, no específico de este modelo): https://news.ycombinator.com/item?id=48555993
- Hilo de r/LocalLLaMA sobre la familia Gemma 4 (contexto, no específico de este adaptador): https://www.reddit.com/r/LocalLLaMA/comments/1segstx/gemma_4_26b_a3b_is_mindblowingly_good_if/
