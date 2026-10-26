# yiweiqin/detective_model

## Resumen

`yiweiqin/detective_model` es un adaptador LoRA (entrenado con QLoRA) para el modelo `Qwen/Qwen3-8B`, publicado por el usuario yiweiqin. El repositorio no contiene los pesos del modelo base: solo los tensores del adaptador (`adapter_model.safetensors`, ~0,2 GB), que deben cargarse con `PeftModel.from_pretrained` sobre la revisión exacta `b968826d9c46dd6066d109eabc6255188de91218` de Qwen3-8B.

La configuración declarada es LoRA con rango 16, `lora_alpha=32`, dropout 0,05 y PEFT 0.20.0, bajo licencia Apache 2.0. El nombre del repositorio sugiere un ajuste orientado a tareas de deducción o razonamiento tipo "detective", pero la model card no documenta el conjunto de datos, el objetivo de entrenamiento ni ninguna evaluación, por lo que esa finalidad es una inferencia a partir del nombre y no un dato confirmado.

Su relevancia práctica es limitada y experimental: sirve como ejemplo de adaptación ligera y de bajo coste sobre un modelo denso de 8 B, y como punto de partida reproducible (incluye SHA256 del adaptador) para quien quiera inspeccionar o continuar el ajuste. No hay descargas, un único "like" y ninguna métrica publicada, de modo que no debe considerarse un artefacto validado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer denso Qwen3-8B; r=16, `lora_alpha`=32, dropout 0,05 |
| Parámetros totales | No disponible para el adaptador; el modelo base se denomina Qwen3-8B (8 B) y no se distribuye en este repositorio |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; la model card del adaptador no la declara y queda determinada por el modelo base |
| Tipos de cuantización | No disponible; el entrenamiento fue QLoRA (base cuantizado en 4 bits), pero solo se publican pesos de adaptador en safetensors. No hay GGUF, AWQ ni GPTQ publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (debe verificarse también la licencia del modelo base) |
| Formato de pesos | `safetensors` (`adapter_model.safetensors`), formato PEFT; requiere `PeftModel.from_pretrained` |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango sobre Qwen3-8B. La model card especifica únicamente los hiperparámetros del adaptador (r=16, alpha=32, dropout 0,05), la versión de PEFT (0.20.0) y la revisión exacta del modelo base contra la que se entrenó. No se indica qué módulos se adaptaron (por ejemplo, `q_proj`, `k_proj`, `v_proj`, `o_proj` o las MLP), ni el rango de capas afectadas, ni si se entrenó también la cabeza de salida o embeddings.

Tampoco se documentan los datos de entrenamiento: no hay número de tokens, composición del dataset, plantilla de chat empleada, epochs, tasa de aprendizaje, precisión (bf16/fp16), pérdida final ni proceso de alineamiento posterior (RLHF, DPO o similar). El único mecanismo de verificación disponible es el hash SHA256 del adaptador (`8755e26d...afebc`), que permite comprobar la integridad del fichero pero no la calidad del ajuste. En la práctica, esto convierte al repositorio en una caja negra reproducible solo en cuanto a carga, no en cuanto a comportamiento.

## Capacidades

- No hay capacidades declaradas por el autor. Al ser un adaptador sobre Qwen3-8B, reutiliza el tokenizador y la arquitectura del base, pero el efecto concreto del ajuste no está documentado ni evaluado.
- Generación de texto y razonamiento: presumiblemente heredados del modelo base; sin verificación en esta ficha.
- Código y matemáticas: no documentado para este adaptador.
- Tool calling / function calling: no documentado; dependerá de si el ajuste preserva o degrada las capacidades del base.
- Soporte de agentes y razonamiento multi-paso: no documentado; el nombre "detective" sugiere un uso orientado a deducción, pero es una inferencia no confirmada.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no documentadas para el adaptador.

## Casos de uso

- Prototipado de razonamiento deductivo: cargar el adaptador sobre Qwen3-8B con `PeftModel.from_pretrained` y comparar sus respuestas con las del base en un conjunto propio de casos de deducción, para medir si el ajuste aporta alguna mejora real antes de invertir más.
- Investigación sobre LoRA/QLoRA: usar el repositorio como referencia reproducible de una configuración concreta (r=16, alpha=32, dropout 0,05, PEFT 0.20.0) y como base para experimentos de ablation sobre rango y módulos objetivo.
- Generación de hipótesis en análisis de incidentes: emplear el modelo como asistente para enumerar hipótesis y líneas de investigación en informes o casos documentados, siempre con revisión humana y sin datos personales.
- Educación y divulgación: construir demos de "razonamiento paso a paso" en entornos controlados, aprovechando el bajo coste de despliegue de un adaptador de 0,2 GB frente a un fine-tuning completo.
- Filtrado y triaje de texto narrativo: experimentar en la clasificación o extracción de entidades en relatos policiales o textos largos, evaluando previamente si el adaptador conserva la calidad del base en esa tarea.
- Base para un ajuste posterior: continuar el entrenamiento con datos propios y una plantilla de chat documentada, partiendo de este adaptador como inicialización y registrando esta vez dataset, hiperparámetros y métricas.
- Integración en pipelines de CI para evaluación de adaptadores: automatizar la carga, la ejecución de un conjunto de prompts fijos y la comparación contra el base, usando el SHA256 publicado como control de integridad del artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Evaluación | Estado |
|---|---|
| MMLU, HumanEval, GSM8K u otras métricas estándar | No publicadas |
| Pérdida de validación o de entrenamiento | No publicada |
| Comparación con el modelo base o con otros adaptadores | No publicada |
| Evaluación cualitativa o ejemplos de salida | No publicados |

## Requisitos de hardware

- VRAM para inferencia: el adaptador en sí ocupa ~0,2 GB, pero hay que cargar el modelo base. Estimación a partir de 8 B de parámetros (no medida por el autor): ~16 GB en BF16/FP16 solo para pesos, más caché KV; ~5-6 GB con cuantización de 4 bits del base fusionado.
- GPU recomendadas: A100 40 GB u 80 GB y H100 para servicio en FP16 con contexto largo y concurrencia; L40S o RTX 6000 Ada como alternativas de 48 GB.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en FP16 para un solo usuario con contexto moderado, y con holgura en 4 bits; en tarjetas de 12-16 GB (RTX 4070 Ti, 4080) solo con el base cuantizado.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador; para vLLM o TGI conviene fusionar previamente con `merge_and_unload` y servir el modelo resultante. Para llama.cpp u Ollama es necesario convertir el adaptador a GGUF (o fusionarlo y cuantizarlo), ya que no se publica ningún GGUF listo para usar.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yiweiqin/detective_model` (este adaptador) | Adaptador LoRA sobre 8 B | No disponible | Sin benchmarks publicados | Apache 2.0 | Público, 0 descargas, 1 like |
| `Qwen/Qwen3-8B` (base) | 8 B (según su denominación) | No disponible en la información proporcionada | Sin datos en esta ficha | Debe verificarse en su repositorio | Público y ampliamente utilizado |
| Otros adaptadores LoRA para Qwen3-8B | No disponible | No disponible | No disponible | No disponible | No evaluados en esta ficha |

No se dispone de datos objetivos para comparar el rendimiento de este adaptador con alternativas de la misma categoría; la única comparación fiable es contra el modelo base, que el propio autor no documenta.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento: no se puede evaluar sesgo, cobertura lingüística ni riesgo de sobreajuste a un dominio concreto.
- Riesgo de alucinación heredado del modelo base y no medido tras el ajuste; sin evaluación, no hay forma de saber si el adaptador lo agrava.
- El propósito real del adaptador ("detective") no está confirmado; el nombre es la única pista y podría inducir a error sobre sus capacidades.
- Idiomas y longitud de contexto no declarados: cualquier uso multilingüe o con contextos largos requiere validación empírica previa.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial exige verificar también los términos del modelo base y de la revisión concreta indicada.
- Repositorio sin tracción (0 descargas, 1 like) y con creación y actualización separadas por unos ocho minutos, lo que sugiere un experimento personal sin revisión externa.
- Metadatos anómalos: las fechas declaradas (2026-10-25) son posteriores a la fecha habitual de publicación, lo que conviene contrastar antes de citar el modelo.
- El adaptador está atado a una revisión concreta del base; cargarlo sobre otra revisión puede degradar el comportamiento sin aviso.
- Para producción sería imprescindible fusionar, cuantizar y someter el modelo a una batería propia de evaluaciones (calidad, latencia, toxicidad) antes de cualquier despliegue.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/yiweiqin/detective_model
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Revisión concreta del base indicada por el autor: https://huggingface.co/Qwen/Qwen3-8B/tree/b968826d9c46dd6066d109eabc6255188de91218
- Fichero del adaptador: https://huggingface.co/yiweiqin/detective_model/blob/main/adapter_model.safetensors
- Documentación de PEFT: https://huggingface.co/docs/peft
- No se han encontrado papers, blogs, repositorios de código ni demos asociados en la información disponible.
