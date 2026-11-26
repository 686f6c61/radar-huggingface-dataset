# sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-LoRA

## Resumen

El modelo `sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-LoRA` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-Coder-7B-Instruct, desarrollado por el usuario sqyhhh. No se trata de un modelo completo, sino de un conjunto de pesos delta que debe cargarse junto al modelo base original para funcionar. El objetivo declarado es el ajuste de preferencias orientado a tareas de tipo TSP (siglas no aclaradas en la model card, presumiblemente relacionadas con seguridad o generacion de codigo seguro, aunque no se especifica).

El adaptador se ha entrenado con 12.804 pares de preferencia, 2 epocas y 802 pasos de optimizacion, con rango LoRA 8 aplicado a todas las capas lineales. El modelo base subyacente, Qwen2.5-Coder-7B-Instruct, es un transformer decoder-only de 7.600 millones de parametros con 32.768 tokens de contexto, especializado en generacion de codigo. La relevancia de este adaptador es limitada por ahora: cuenta con cero descargas y cero likes, no tiene licencia declarada ni idiomas especificados, y el propio autor indica que la evaluacion independiente de seguridad y funcionalidad esta pendiente.

Se trata, por tanto, de un experimento de investigacion o prueba de concepto mas que de un modelo listo para produccion. La model card es extremadamente escueta y no aporta informacion sobre el dataset de preferencias, el proceso de anotacion, los criterios de seguridad aplicados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen2.5-Coder-7B-Instruct |
| Parametros totales | 7.600 millones (modelo base); el adaptador LoRA anade un subconjunto no cuantificado en la card (rango 8 sobre todas las capas lineales) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-Coder-7B-Instruct); longitud de corte en entrenamiento: 4.096 tokens |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors BF16; el base admite cuantizacion estandar pero no se documenta) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-Coder-7B-Instruct, un transformer decoder-only denso de 7.600 millones de parametros con atencion por causalidad estandar, GQA (Grouped Query Attention) y RoPE, disenado por Alibaba Qwen para tareas de codigo. El adaptador LoRA utiliza rango 8, se aplica a todas las capas lineales del modelo y se entrena en precision BF16 sobre una unica GPU A800 de 80 GB durante 3 horas, 45 minutos y 50 segundos.

El entrenamiento emplea DPO (Direct Preference Optimization) con beta 0.1, learning rate 5e-6, batch size por dispositivo de 1 y acumulacion de gradientes de 32 pasos, lo que da un batch efectivo de 32. Se realizan 2 epocas sobre 12.804 pares de preferencia con longitud de corte de 4.096 tokens, totalizando 802 pasos de optimizacion. La perdida de entrenamiento final es aproximadamente 0.2284. No se documenta la composicion del dataset de preferencias, el proceso de generacion de pares (chosen/rejected), ni si hubo filtrado o anotacion humana. No se menciona ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto y codigo: hereda las capacidades del modelo base Qwen2.5-Coder-7B-Instruct, incluyendo generacion, completado y explicacion de codigo en multiples lenguajes de programacion.
- Razonamiento sobre codigo: el modelo base esta optimizado para tareas de reparacion, refactorizacion y comprension de codigo.
- Ajuste de preferencias: el adaptador DPO modula el estilo y las preferencias de respuesta, presumiblemente hacia respuestas mas seguras o alineadas con el criterio TSP del autor, aunque no se especifica cual es ese criterio.
- Soporte de tool calling / function calling: no confirmado en la card; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no hay evidencia de que el adaptador lo preserve o lo modifique.
- Soporte de agentes y razonamiento multi-paso: no documentado en la card.
- Capacidades multilingues: no documentadas; el modelo base soporta multiples lenguajes naturales y de programacion, pero el adaptador no especifica idiomas.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Experimentacion academica con DPO: el adaptador sirve como caso de estudio reproducible de un pipeline DPO con LoRA sobre un modelo de codigo, con hiperparametros documentados (beta 0.1, rango 8, 2 epocas) que permiten replicar el experimento.
- Investigacion en alineacion de modelos de codigo: util para estudiar como el DPO con pares de preferencia modifica el comportamiento de un modelo de codigo ya instruido, comparando las salidas del adaptador frente al base.
- Pruebas de seguridad en generacion de codigo: si el criterio TSP esta relacionado con seguridad, el adaptador puede emplearse para evaluar si el DPO reduce la generacion de codigo vulnerable, aunque el autor advierte que la evaluacion de seguridad esta pendiente.
- Fine-tuning adicional sobre el adaptador: al ser un adaptador LoRA ligero (repo de 0,1 GB), puede combinarse o continuar entrenandose en pipelines de investigacion con recursos modestos.
- Evaluacion comparativa de tecnicas de alineacion: sirve como punto de comparacion frente a otros adaptadores DPO o RLHF sobre el mismo modelo base en estudios de ablation.
- Despliegue en entornos de investigacion con vLLM o TGI: cargando el adaptador junto al base, puede servirse como endpoint de generacion de codigo para experimentos internos, siempre que se asuma la falta de evaluacion y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de entrenamiento (aproximadamente 0.2284) y advierte explicitamente que la evaluacion independiente de seguridad y funcionalidad esta pendiente, y que la perdida de entrenamiento no establece mejoras de seguridad.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-Coder-7B-Instruct en BF16 requiere aproximadamente 15-16 GB de VRAM; en cuantizacion de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. El adaptador LoRA anade una sobrecarga minima (repo de 0,1 GB).
- GPU recomendadas: A100 40/80 GB, H100, A800 (la empleada en entrenamiento), L40S o RTX 6000 Ada para inferencia en BF16. Una RTX 4090 (24 GB) es suficiente para BF16 del modelo base.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en BF16; en RTX 3090 (24 GB) tambien; en GPUs de 12-16 GB solo con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp (requiere fusionar el adaptador con el base y convertir a GGUF), Ollama (mismo procedimiento de fusion previa), transformers + PEFT para carga directa del adaptador.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-LoRA | 7,6 B (base) + LoRA | 32.768 | Adaptador DPO/LoRA | no disponible | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | Modelo completo instruct | Apache 2.0 | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-Coder-7B | 7,6 B | 32.768 | Modelo completo base | Apache 2.0 | Hugging Face |
| Adaptadores DPO comparables sobre Qwen2.5-Coder | no disponible | no disponible | LoRA/DPO | no disponible | no disponible |

No se dispone de datos de rendimiento del adaptador para comparar con alternativas; la comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; el adaptador hereda los sesgos del modelo base y del dataset de preferencias, que no se describe.
- Riesgo de alucinacion: no evaluado; el autor no reporta ninguna evaluacion de fidelidad o alucinacion.
- Limitaciones de contexto o idioma: el entrenamiento se realizo con longitud de corte de 4.096 tokens, muy por debajo de los 32.768 del modelo base; no se especifican idiomas soportados.
- Restricciones de licencia: la licencia no esta declarada en la model card, lo que impide determinar si el uso comercial esta permitido. El modelo base Qwen2.5-Coder-7B-Instruct es Apache 2.0, pero el adaptador no hereda automaticamente esa licencia al no estar declarada.
- Evaluacion de seguridad pendiente: el autor advierte explicitamente que la evaluacion independiente de seguridad y funcionalidad esta pendiente y que la perdida de entrenamiento no demuestra mejoras de seguridad.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Metodologia opaca: no se documenta la procedencia de los 12.804 pares de preferencia, los criterios de anotacion ni el significado de "TSP", lo que dificulta la reproducibilidad.
- No apto para produccion sin evaluacion previa: al ser un adaptador experimental sin benchmarks, no deberia desplegarse en entornos productivos sin una validacion exhaustiva propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sqyhhh/Qwen2.5-Coder-7B-Instruct-TSP-DPO-2ep-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Repositorio PEFT: https://github.com/huggingface/peft
- Paper de DPO (Direct Preference Optimization): https://arxiv.org/abs/2305.18290
- Paper de LoRA: https://arxiv.org/abs/2106.09685
