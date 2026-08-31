# YFC-112358/Qwen3.8-27B-Taste-Glimmer-Gemma-LoRA

## Resumen

Qwen3.8-27B-Taste-Glimmer-Gemma-LoRA es un adaptador LoRA de transferencia de estilo desarrollado por YFC-112358 sobre el modelo base Qwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5, un merge de la familia Qwen3.8-27B de Alibaba. El adaptador combina dos influencias docentes: el razonamiento comprimido de Muse Glimmer 30B y el pensamiento estructurado de Gemma 4 31B, mediante la combinación lineal ΔW = a·ΔW_glimmer + b·ΔW_gemma con coeficientes a=1.0 y b=1.0.

El modelo base presenta una arquitectura Qwen3_5ForConditionalGeneration con 64 capas, de las cuales 48 usan Gated DeltaNet y 16 atención completa. El adaptador modifica 496 módulos nn.Linear con 12 sufijos de proyección distintos, con 116.727.808 parámetros entrenables por lado (0,425% del modelo completo), que tras la fusión resultan en r=32 y alpha=32 con los pesos ya incorporados en la matriz A, sin necesidad de configuración adicional en la carga.

La relevancia de este proyecto reside en que no persigue resultados de benchmarks estandarizados, sino la transferencia medible de estilos de razonamiento mediante métricas de NLL cruzada, presupuesto de tokens de pensamiento y comportamiento de generación libre. El adaptador corrige además un defecto observado en el modelo base: la no monotonicidad del control reasoning_effort, que en el base produce menos tokens de pensamiento en el nivel xhigh que en low.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (48 capas Gated DeltaNet + 16 capas full attention) |
| Parametros totales | 27B (modelo base) + 116.727.808 por lado LoRA (0,425% del total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con secuencias de 4096 tokens sin empaquetado) |
| Tipos de cuantizacion | BF16 en entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre un modelo base de 64 capas donde 48 son Gated DeltaNet con proyecciones no estandar (`in_proj_qkv`, `in_proj_z`, `in_proj_b`, `in_proj_a`, `out_proj`) y 16 son capas de atención completa. La lista de 496 módulos objetivo se enumeró directamente sobre el modelo cargado, con aserciones de cobertura antes y después de `get_peft_model`, porque la configuración por defecto de Unsloth para Qwen3.5 dejaría las 48 capas DeltaNet sin adaptar.

El entrenamiento se realizó en una única GPU A800 de 80 GB durante 2,56 horas en total, con BF16, optimizador adamw_8bit y gradient checkpointing. Los datos consisten exclusivamente en trazas de razonamiento reales (el canal de pensamiento constituye el 100% de los tokens entrenables): 1.396 muestras de DaoCloud/Muse-Glimmer-OPB-100K para el lado Glimmer y 1.349 muestras de siete repositorios ZachW/gemma-4-31b-it_* más trjxter/Gemma-4-31B-Reasoning-1000x para el lado Gemma. Se aplicó un tope del 15% de tokens matemáticos, un máximo del 25% por fuente y decontaminación 13-gram sobre GSM8K y MATH-500. El lado Glimmer incorpora la técnica STRIP_ECHO, que elimina la repetición literal del enunciado al inicio del pensamiento cuando cubre más del 80% del texto original, reduciendo la copia de 8/8 a 1/8 en pruebas a ciegas.

Una primera iteración del lado Gemma se descartó por completo: al muestrear proporcionalmente de un pool de 80.000 respuestas sin razonamiento, solo el 0,8% de los tokens entrenables eran CoT real, y el adaptador resultante aprendió el tono de las respuestas en lugar del estilo de pensamiento. Se reconstruyó con una aserción dura de que el CoT real debía superar el 90% de los tokens entrenables.

## Capacidades

- Razonamiento comprimido: hereda la tendencia de Glimmer a pensar de forma concisa y responder directamente, con un ratio pensamiento/respuesta de 0,91 frente al 2,50 del modelo base.
- Pensamiento estructurado: incorpora el hábito de Gemma de organizar el razonamiento en esquemas, visible en la generación de explicaciones y textos largos.
- Control de esfuerzo de razonamiento monotónico: el adaptador restaura la relación esperada entre el parámetro reasoning_effort y la cantidad de tokens de pensamiento, con aproximadamente 3,2 veces más pensamiento en xhigh que en low.
- Generación en chino sin degradación: mantiene un 80-84% de caracteres chinos en el canal de respuesta, y completa respuestas donde el base se quedaba vacío por agotar el presupuesto de tokens en el pensamiento.
- Reducción de copia de enunciados: la técnica STRIP_ECHO reduce la repetición literal del prompt de 8/8 a 1/8 en pruebas a ciegas, ahorrando tokens en producción.
- Generación de código, texto largo, explicaciones y respuestas abiertas: el punto (1.0, 1.0) equilibra el presupuesto de 900 tokens entre pensamiento y respuesta en todas las categorías probadas.
- Compatibilidad con el ecosistema PEFT: los pesos están fusionados en la matriz A, por lo que se carga como un PeftModel estándar sin configuración adicional.

## Casos de uso

- Generación de código con razonamiento eficiente: el ratio pensamiento/respuesta de 0,91 permite que el modelo dedique menos presupuesto a la reflexión interna y más a la emisión de código, con 596 tokens de respuesta dentro de un presupuesto de 900. Es adecuado para pipelines de generación donde el coste por token de pensamiento es relevante.
- Redacción de textos largos: con 269 tokens de respuesta en el presupuesto de 900, supera al punto alternativo (0.6, 0.8) que truncaba a 200. Útil para generación de informes o documentación donde se necesita completar la salida sin cortes.
- Generación de explicaciones didácticas: produce 306 tokens de respuesta frente a 216 del punto alternativo, combinando el esquema estructurado de Gemma con la compresión de Glimmer. Apropiado para asistentes educativos o documentación técnica.
- Análisis y ensayos en chino: en la pregunta de análisis de personajes de El sueño de la mansión roja, el adaptador escribe 402 caracteres donde el modelo base no completaba la respuesta por agotar el presupuesto en el pensamiento. Válido para generación de contenido editorial en chino.
- Preguntas abiertas en chino: genera 504 tokens de respuesta frente a 29 del punto (0.6, 0.8), manteniendo un 84% de caracteres chinos. Adecuado para asistentes conversacionales en chino con preguntas de razonamiento abierto.
- Tareas de razonamiento con control de esfuerzo escalable: al restaurar la monotonicidad del reasoning_effort, el adaptador permite ajustar de forma predecible la profundidad de razonamiento en pipelines agénticos, donde el nivel xhigh produce consistentemente más tokens de pensamiento que low.
- Reducción de coste por tokens en producción: la eliminación de la copia de enunciados (de 8/8 a 1/8) y el ratio de pensamiento comprimido reducen el gasto en tokens de razonamiento en despliegues con facturación por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor declara explicitamente que el proyecto no persigue puntuaciones de benchmark. Los datos de rendimiento publicados son mediciones propias:

Matriz de NLL cruzada sobre conjuntos de retencion (valores mas bajos son mejores; parentesis indican variacion relativa al base):

| Modelo | Glimmer holdout | Gemma holdout |
|---|---:|---:|
| Base | 0,9369 | 0,6645 |
| Glimmer-LoRA solo | 0,5043 (−46,2%) | 0,8135 (+22,4%) |
| Gemma-LoRA solo | 0,9712 (+3,7%) | 0,5292 (−20,4%) |
| **Este LoRA (1.0/1.0)** | 90% de ganancia Glimmer | 66% de ganancia Gemma |

Comportamiento de generacion libre con presupuesto de 900 tokens (longitud de respuesta):

| Categoria | (0.6, 0.8) | (1.0, 1.0) adoptado |
|---|---:|---:|
| Codigo | 634 | 596 |
| Texto largo | 200 (truncado) | 269 |
| Explicacion | 216 | 306 |
| Chino corto | 75 (truncado) | 84 |
| Chino abierto | 29 | 504 |

Prueba a ciegas de copia y repeticion (muestreo 0.7/0.95, dos pasadas por celda):

| Modelo | Copia de enunciado | Max 6-gram repetido | Tasa de finalizacion | Pensamiento/respuesta |
|---|---:|---:|---:|---:|
| Base | 0/8 | 1 | 88% | 2,50 |
| Glimmer-LoRA (sin STRIP_ECHO) | 8/8 | 3 | 100% | 1,31 |
| Glimmer-LoRA (con STRIP_ECHO) | 1/8 | 2 | 100% | 0,83 |

Monotonicidad de reasoning_effort (ratio de tokens de pensamiento xhigh/low):

| Modelo | Matematica | Abierta | Monotono en ambas |
|---|---:|---:|---|
| Base | 0,36 | 0,38 | No |
| Glimmer-LoRA | 2,90 | 11,22 | Si |
| Gemma-LoRA | 1,59 | 6,49 | No |
| **Este LoRA (1.0/1.0)** | 2,33 | 4,09 | Si |

## Requisitos de hardware

- Entrenamiento: una GPU A800 de 80 GB, con pico de VRAM de 77,65 GiB (lado Glimmer) y 77,99 GiB (lado Gemma). Rendimiento de 710-732 tokens/s.
- Inferencia: el modelo base es de 27.000 millones de parametros. Estimaciones orientativas: aproximadamente 54 GB en BF16, 27 GB en 8 bits y 14 GB en 4 bits. El adaptador LoRA anade un overhead minimo al estar fusionado en la matriz A.
- GPUs recomendadas: A100 80 GB o H100 para inferencia sin cuantizar; RTX 4090 (24 GB) o similar con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: al ser un PeftModel estandar sobre Qwen3.8-27B, es compatible con vLLM, llama.cpp, Ollama y TGI, sujeto a la compatibilidad de estos motores con la arquitectura Qwen3_5ForConditionalGeneration.
- Latencia
