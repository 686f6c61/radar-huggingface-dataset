# wrchen1/LatentMT-2.6B-eng-latn-vec-latn

## Resumen

LatentMT-2.6B-eng-latn-vec-latn es un adaptador LoRA para traducción automática del par inglés (eng_Latn) a veneciano (vec_Latn), desarrollado por Wei-Rui Chen y colaboradores en el marco del paper "LatentMT: Machine Translation with Latent Reasoning" (arXiv:2607.18618). El adaptador se monta sobre el modelo base ByteDance/Ouro-2.6B-Thinking, un transformer causal de 2.6 mil millones de parámetros con capacidad de razonamiento. La propuesta principal de LatentMT es el uso de razonamiento latente: en lugar de generar cadenas de razonamiento explícitas como tokens, el modelo realiza pasos recurrentes adicionales dentro de los estados ocultos (profundidad recurrente 4), lo que reduce el coste de inferencia y mantiene la calidad de traducción.

El modelo está pensado para investigación en traducción automática y demuestra que un backbone pequeño (2.6B) con entrenamiento ligero puede alcanzar un rendimiento comparable a modelos de 7 a 13 mil millones de parámetros en 32 direcciones de traducción, según el paper. Este adaptador concreto cubre una de esas direcciones (inglés a veneciano) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y modificación. El repositorio incluye únicamente los pesos del adaptador (safetensors) y la configuración necesaria para cargarlo con la librería PEFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre ByteDance/Ouro-2.6B-Thinking (transformer causal con razonamiento latente) |
| Parametros totales | 2.6B (modelo base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (el adaptador LoRA activa un subconjunto de pesos) |
| Longitud de contexto | no disponible (depende del modelo base, no especificada) |
| Tipos de cuantizacion | no especificados (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con bitsandbytes) |
| Idiomas soportados | ingles (eng_Latn) a veneciano (vec_Latn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo ByteDance/Ouro-2.6B-Thinking, un transformer causal de 2.6B parámetros con capacidad de razonamiento (thinking). La innovación de LatentMT consiste en el razonamiento latente: se configuran pasos recurrentes adicionales (profundidad recurrente 4) que operan sobre los estados ocultos del modelo, sin generar tokens de razonamiento visibles. Esto permite que el modelo "piense" internamente antes de producir la traducción, con un coste de inferencia menor que el de los modelos que generan cadenas de razonamiento explícitas.

El entrenamiento del adaptador se realizó con un enfoque ligero (no se especifican los datos ni el número de tokens en la información disponible). El paper menciona que se adaptó el backbone de 2.6B con entrenamiento ligero y se evaluó en 32 direcciones de traducción que cubren idiomas de alta, media y baja disponibilidad de recursos. No se detalla si se usó RLHF, DPO u otras técnicas de alineación; la información disponible solo indica que es un adaptador LoRA entrenado para traducción.

## Capacidades

- Traducción automática del inglés al veneciano (vec_Latn) con razonamiento latente.
- Generación de texto en formato causal (pipeline text-generation).
- Razonamiento interno sin tokens de razonamiento explícitos, lo que reduce la latencia y el coste de generación.
- Eficiencia en inferencia gracias al tamaño reducido del modelo base (2.6B) y al adaptador LoRA.
- Compatible con el ecosistema Hugging Face (transformers, PEFT, bitsandbytes).
- No se especifican capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- Traducción de textos literarios o técnicos del inglés al veneciano: el modelo puede producir traducciones fluidas con razonamiento interno, útil para preservar matices del idioma de baja disponibilidad de recursos.
- Integración en pipelines de traducción automática neuronal: al ser un adaptador LoRA, puede combinarse con el modelo base y cargarse mediante PEFT en entornos de producción con transformers.
- Investigación en traducción de idiomas de baja disponibilidad de recursos: el adaptador sirve como punto de partida para estudiar el impacto del razonamiento latente en pares de idiomas poco representados.
- Prototipado de sistemas de traducción en dispositivos con recursos limitados: el modelo base de 2.6B puede cuantizarse a 4 bits, lo que permite ejecutarlo en GPUs de consumo con 8-12 GB de VRAM.
- Evaluación comparativa de técnicas de razonamiento latente frente a cadenas de razonamiento explícitas en traducción.
- Generación de datos sintéticos bilingües inglés-veneciano para entrenar otros modelos o sistemas de aumento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados (BLEU, chrF, etc.) en la información disponible. El paper LatentMT afirma que, en 32 direcciones de traducción, el modelo de 2.6B alcanza un rendimiento comparable a modelos de 3 a 5 veces más grandes, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda. Por tanto, no es posible presentar una tabla de benchmarks sin inventar datos.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 2.6B en FP16 ocupa aproximadamente 5.2 GB, más el overhead del adaptador y la activación. Con cuantización de 4 bits (bitsandbytes), la VRAM necesaria se reduce a unos 2-3 GB.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM para FP16 (por ejemplo, RTX 3060, RTX 4060, A10) y 4 GB para cuantización 4 bits (por ejemplo, RTX 3050, GTX 1660). Para despliegue en servidor, A100 o H100 son adecuadas.
- El modelo cabe en GPUs de consumo, especialmente con cuantización.
- Opciones de despliegue: transformers con PEFT (carga del adaptador), vLLM (si se fusiona el adaptador con el modelo base), llama.cpp (si se convierte a GGUF tras fusionar), o TGI (con soporte de LoRA).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y de la configuración de generación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de traducción de tamaño similar en la información proporcionada. El paper menciona que LatentMT supera a modelos de 3 a 5 veces más grandes, pero no se especifican nombres concretos ni métricas. Como referencia, el modelo base Ouro-2.6B-Thinking es comparable en tamaño a otros modelos de 2.6B como Qwen2.5-2.7B o Gemma-2-2.6B, pero no hay datos de traducción para estos. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El adaptador está entrenado únicamente para el par inglés-veneciano; no es un modelo multilingüe general.
- No se especifican los datos de entrenamiento ni el proceso de alineación, por lo que pueden existir sesgos no documentados en las traducciones.
- El modelo base Ouro-2.6B-Thinking puede presentar alucinaciones o errores en contextos ambiguos, especialmente en idiomas de baja disponibilidad de recursos como el veneciano.
- La longitud de contexto no está documentada; se recomienda verificar el límite del modelo base antes de usarlo con textos largos.
- El adaptador es un checkpoint de investigación; no se garantiza su robustez en entornos de producción sin validación adicional.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base también está bajo Apache 2.0, por lo que no hay restricciones de licencia conocidas.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/wrchen1/LatentMT-2.6B-eng-latn-vec-latn
- Paper en arXiv: https://arxiv.org/pdf/2607.18618
- Modelo base ByteDance/Ouro-2.6B-Thinking: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Repositorio relacionado (otro par de idiomas): https://huggingface.co/LatentMT/LatentMT-2.6B-eng-latn-szl-latn
