# thermopylae-777/zils-lite-body-1

## Resumen

Zils-lite-body-1 es un re-upload sin modificaciones de los pesos de lenguaje y visión del modelo OmniJev/OneJev1.6-0.8B, que a su vez es un fine-tune de Qwen/Qwen3.5-0.8B. Lo publica el usuario thermopylae-777 como "cuerpo" (body) dentro de un pool de model soup denominado Zils `d3-lite`, asociado al subnet 127 de Bittensor. No se trata, por tanto, de un modelo nuevo entrenado desde cero, sino de un checkpoint intermedio pensado para participar en un proceso de mezcla de pesos.

El modelo base declarado tiene 0,8 mil millones de parámetros y la arquitectura figura etiquetada como `qwen3_5` en Hugging Face. El recuento real de parámetros en los ficheros safetensors asciende a 852.985.920, lo que confirma el orden de magnitud de 0,85B. El repositorio ocupa 1,7 GB, coherente con pesos en precisión de 16 bits.

Su relevancia es limitada fuera del contexto del pool Zils: no hay model card técnica propia, no se publican benchmarks ni detalles de entrenamiento, y el autor original de los pesos es OmniJev. La licencia Apache 2.0 se hereda del modelo original, lo que permite uso comercial y modificación, pero la ausencia de documentación sobre datos de entrenamiento y evaluación limita seriamente su adopción en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en Hugging Face; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5` y de la referencia al modelo base Qwen/Qwen3.5-0.8B. No se especifican el número de capas, la dimensión oculta, el tipo de atención ni si incorpora componentes multimodales concretos, aunque la model card menciona explícitamente "pesos de lenguaje y visión", lo que sugiere una arquitectura multimodal heredada del modelo original.

Respecto al entrenamiento, no se publican datos sobre el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. El modelo es un fine-tune de OneJev1.6-0.8B, que a su vez deriva de Qwen3.5-0.8B, pero no se documentan las etapas intermedias. El checkpoint aquí publicado es un re-upload sin cambios, destinado a un pool de model soup, por lo que no incorpora ningún entrenamiento adicional por parte del autor del repositorio.

## Capacidades

- Generación de texto y razonamiento general, heredados de la base Qwen3.5-0.8B.
- Procesamiento de visión, según la mención explícita a "pesos de lenguaje y visión" en la model card.
- Capacidades multilingües: no documentadas; se desconoce qué idiomas cubre más allá de lo que herede del modelo base.
- Tool calling y function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación con model soups: el uso previsto es servir como cuerpo dentro del pool Zils `d3-lite` del subnet 127 de Bittensor, donde se combinará con otros checkpoints para producir un modelo fusionado.
- Investigación sobre fine-tunes de Qwen3.5-0.8B: permite estudiar cómo se comporta un fine-tune comunitario de la familia Qwen3.5 en tareas de lenguaje y visión, siempre con validación empírica propia.
- Prototipado rápido en local: con 0,85B de parámetros y 1,7 GB de pesos, cabe en GPUs de consumo y permite iterar en entornos con recursos limitados.
- Pruebas de pipelines multimodales ligeros: si se confirma la componente de visión, puede emplearse para experimentos de descripción de imágenes o VQA de baja latencia en hardware modesto.
- Base para fine-tuning posterior: al estar bajo Apache 2.0, puede servir como punto de partida para ajustes específicos de dominio, aunque sin garantías de calidad al no haber benchmarks publicados.
- Evaluación comparativa de checkpoints comunitarios: útil en estudios que comparen fine-tunes derivados de Qwen3.5 frente al modelo original en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente capaces.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer recientes, e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers, vLLM, llama.cpp y Ollama son viables una vez generados los formatos correspondientes; TGI también es compatible con safetensors.
- Latencia y throughput: no disponibles; al no publicarse benchmarks ni configuración de referencia, no es posible estimar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-body-1 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face | Re-upload para model soup; sin benchmarks |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo original de la familia |
| OmniJev/OneJev1.6-0.8B | ~0,8B | no disponible | Apache 2.0 (heredada) | Hugging Face | Fine-tune intermedio del que deriva este checkpoint |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de MMLU, HumanEval, GSM8K ni de tareas multimodales, lo que impide evaluar su calidad real.
- Documentación mínima: la model card es un re-upload sin información sobre datos de entrenamiento, hiperparámetros ni proceso de ajuste.
- Riesgo de alucinación: inherente a los modelos de 0,8B de la familia Qwen; sin evaluación específica no puede acotarse.
- Sesgos: no documentados; se heredan los del modelo base y los del fine-tune intermedio, sin auditoría publicada.
- Idiomas: no se especifica cobertura lingüística; el rendimiento fuera del inglés y el chino (habituales en Qwen) es incierto.
- Contexto: se desconoce la longitud máxima soportada, lo que impide planificar cargas con documentos largos.
- Uso comercial: permitido por Apache 2.0, pero sin garantías de calidad ni soporte; conviene validar en el dominio concreto antes de desplegar.
- Naturaleza del checkpoint: al ser un cuerpo para model soup, su rendimiento individual puede ser inferior al del modelo fusionado final; no debe tratarse como un modelo "listo para producción".
- Fecha de creación futura (2026-11-04): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thermopylae-777/zils-lite-body-1
- Modelo base (OneJev1.6-0.8B): https://huggingface.co/OmniJev/OneJev1.6-0.8B
- Modelo original (Qwen3.5-0.8B): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Revisión referenciada del modelo base: `c89933c277629b707895bff752c61d2b0664c85e`
