# Stoned-Code/Opusculum-1.5B

## Resumen

Opusculum-1.5B es un modelo de generacion de texto de tipo decoder-only derivado de Qwen2.5-1.5B mediante un ajuste fino supervisado (SFT) sobre un conjunto de datasets orientados a rol conversacional, escritura creativa y datos de instruccion sin restricciones de rechazo. Lo publica el usuario Stoned-Code en Hugging Face bajo licencia Apache 2.0 y esta pensado para generacion de texto conversacional en ingles.

El modelo parte de la version cuantizada en 4 bits de Qwen2.5-1.5B publicada por Unsloth (`unsloth/Qwen2.5-1.5B-bnb-4bit`) y reutiliza los datasets empleados en el entrenamiento de `anthracite-org/magnum-v4-9b`, un modelo de rol de mayor tamano. Con 1.543.714.304 parametros y un repositorio de 7,6 GB, se posiciona como una alternativa ligera para experimentacion en entornos con recursos limitados.

Su relevancia es limitada: el modelo no registra descargas ni interacciones en el momento de la ficha, no incluye resultados de benchmarks ni documentacion tecnica detallada sobre el proceso de entrenamiento. La model card se limita a declarar el modelo base y la lista de datasets.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), segun el tag `qwen2` |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B soporta 32.768 tokens, dato no confirmado para este ajuste) |
| Tipos de cuantizacion | no disponible en la model card; el modelo base de partida esta en 4 bits (bitsandbytes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen2, un transformer decoder-only con atencion causal estandar, heredada del modelo base Qwen2.5-1.5B. El ajuste se realizo sobre la variante cuantizada en 4 bits de Unsloth, lo que implica que el entrenamiento partio de pesos con cuantizacion bitsandbytes de 4 bits; no se especifica si los pesos finales se consolidaron en precision completa o se mantuvieron en un formato cuantizado.

El autor no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, la receta de hiperparametros ni si se aplicaron fases de RLHF o DPO. Los datasets declarados son: `Stoned-Code/magnum-v4`, `Delta-Vector/Hydrus-Claude-Instruct-5K`, `anthracite-org/kalo-opus-instruct-22k-no-refusal`, `Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned`, `lodrick-the-lafted/kalo-opus-instruct-3k-filtered`, `anthracite-org/nopm_claude_writing_fixed`, `Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned`, `anthracite-org/kalo_opus_misc_240827` y `anthracite-org/kalo_misc_part2`. Estos conjuntos estan orientados a rol, escritura creativa e instrucciones sin rechazo, y coinciden con los usados para entrenar `anthracite-org/magnum-v4-9b`. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en dialogos multi-turno.
- Generacion creativa y escritura de ficcion, derivada de los datasets de rol y escritura incluidos en el entrenamiento.
- Respuesta a instrucciones en formato instruct, segun los datasets de tipo instruct/chat empleados.
- Comportamiento sin rechazo en determinados dominios, por la inclusion de `kalo-opus-instruct-22k-no-refusal`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles: el modelo puede gestionar dialogos multi-turno con un coste computacional bajo, adecuado para pruebas de concepto en local antes de escalar a modelos mayores.
- Generacion de ficcion y narrativa interactiva: los datasets de rol y escritura creativa del entrenamiento lo orientan a la produccion de texto narrativo y dialogos de personajes.
- Experimentacion academica sobre ajuste fino: sirve como punto de partida reproducible para estudiar el efecto de datasets de rol sobre un modelo base pequeno.
- Generacion de datos sinteticos de dialogo: puede emplearse para producir conversaciones de entrenamiento o evaluacion en pipelines de data augmentation.
- Despliegue en entornos con recursos limitados: con 1,5B parametros cabe en GPU de consumo y permite inferencia en CPU mediante cuantizacion GGUF, aunque el autor no publica estos artefactos.
- Evaluacion comparativa de tecnicas de cuantizacion: el modelo base ya parte de una variante en 4 bits, lo que permite analizar la degradacion respecto al modelo original en tareas de generacion.
- Chatbot de rol para investigacion sobre seguridad y alineacion: su comportamiento sin rechazo en ciertos dominios lo hace util para estudiar respuestas no filtradas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 3,1 GB solo para pesos (1,54B parametros x 2 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,6 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,9-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes y en la mayoria de casos sobredimensionadas.
- Cabe en GPU de consumo: si, en practicamente todas las GPU consumer modernas con 8 GB o mas; tambien es viable en CPU.
- Opciones de despliegue: transformers, vLLM, TGI y llama.cpp/Ollama previa conversion a GGUF (el autor no publica artefactos GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Opusculum-1.5B | 1,54B | no disponible | Apache 2.0 | en | Ajuste de rol sobre Qwen2.5-1.5B; sin benchmarks publicados |
| Qwen2.5-1.5B (base) | 1,54B | 32.768 tokens (segun documentacion del modelo base) | Apache 2.0 | multilingue | Modelo base original, con benchmarks publicados por el autor |
| anthracite-org/magnum-v4-9b | 9B (aprox.) | no disponible | no disponible | en | Modelo de rol del que se reutilizan los datasets; mayor tamano |

La comparacion con alternativas de la misma categoria queda limitada por la ausencia de datos de rendimiento del modelo evaluado. El modelo base Qwen2.5-1.5B constituye la referencia natural para medir el efecto del ajuste fino.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo, toxicidad o alucinacion; el modelo incluye datasets "no-refusal", lo que puede producir respuestas sin filtros de seguridad en dominios sensibles.
- Riesgo de alucinacion inherente a un modelo de 1,5B parametros, especialmente en tareas de conocimiento factual y razonamiento complejo.
- Solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- La longitud de contexto efectiva no esta documentada para este ajuste; no debe asumirse la del modelo base sin verificacion.
- Aunque la licencia es Apache 2.0, los datasets de entrenamiento pueden tener sus propias condiciones de uso; conviene revisarlas antes de un despliegue comercial.
- El modelo no registra descargas ni validacion por parte de la comunidad; no hay evidencia independiente de su calidad.
- El entrenamiento partio de pesos cuantizados en 4 bits, lo que puede introducir degradacion adicional respecto al modelo base en precision completa.
- No se publican artefactos GGUF ni cuantizaciones alternativas, lo que limita el despliegue en CPU sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stoned-Code/Opusculum-1.5B
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-bnb-4bit
- Modelo de referencia de los datasets: https://huggingface.co/anthracite-org/magnum-v4-9b
- Dataset Stoned-Code/magnum-v4: https://huggingface.co/datasets/Stoned-Code/magnum-v4
- Dataset Delta-Vector/Hydrus-Claude-Instruct-5K: https://huggingface.co/datasets/Delta-Vector/Hydrus-Claude-Instruct-5K
- Dataset anthracite-org/kalo-opus-instruct-22k-no-refusal: https://huggingface.co/datasets/anthracite-org/kalo-opus-instruct-22k-no-refusal
- Dataset Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned: https://huggingface.co/datasets/Epiculous/SynthRP-Gens-v1.1-Filtered-n-Cleaned
- Dataset lodrick-the-lafted/kalo-opus-instruct-3k-filtered: https://huggingface.co/datasets/lodrick-the-lafted/kalo-opus-instruct-3k-filtered
- Dataset anthracite-org/nopm_claude_writing_fixed: https://huggingface.co/datasets/anthracite-org/nopm_claude_writing_fixed
- Dataset Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned: https://huggingface.co/datasets/Epiculous/Synthstruct-Gens-v1.1-Filtered-n-Cleaned
- Dataset anthracite-org/kalo_opus_misc_240827: https://huggingface.co/datasets/anthracite-org/kalo_opus_misc_240827
- Dataset anthracite-org/kalo_misc_part2: https://huggingface.co/datasets/anthracite-org/kalo_misc_part2
