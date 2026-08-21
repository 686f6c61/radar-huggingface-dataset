# Tam109204/lab21-2A202601267-qwen3-triage-lora

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base `unsloth/Qwen3.5-4B`, desarrollado por Tran Thi Thanh Tam como entrega academica del Lab 21 del programa AICB-P2T3. El adaptador especializa el modelo en la clasificacion de tickets de atencion al cliente en vietnamita, generando una salida JSON estructurada con cuatro claves: `intent` (intencion), `urgency` (urgencia), `product` (producto) y `sentiment` (sentimiento).

El adaptador se entrena sobre un conjunto de datos reducido (225 muestras de entrenamiento y 25 de validacion) y consigue una mejora sustancial en la tarea objetivo frente al modelo base con prompt optimizado (0,970 frente a 0,765 en la metrica target). Sin embargo, el propio autor advierte explicitamente que el adaptador sufre de olvido catastrofico severo: pierde 0,147 puntos de capacidad general cuando el umbral permitido es 0,020, superandolo mas de siete veces. Por tanto, se publica exclusivamente con fines de evaluacion academica y consulta, y no debe desplegarse en produccion.

El adaptador pesa aproximadamente 0,1 GB, utiliza la libreria PEFT y se distribuye bajo licencia Apache 2.0. El idioma soportado es exclusivamente vietnamita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (transformer decoder-only) |
| Parametros totales | 4B (modelo base) + 32.464.896 (adaptador entrenable) |
| Parametros activos | 32.464.896 (solo adaptador LoRA) |
| Longitud de contexto | 1024 tokens (`max_length` de entrenamiento) |
| Tipos de cuantizacion | no disponible (adaptador en fp16, modelo base sin cuantizar) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16 y alpha 32 sobre 12 tipos de modulos lineales del modelo base Qwen3.5-4B. El entrenamiento se realizo con una tasa de aprendizaje de 1e-4 (diez veces la escala de un fine-tuning completo), 2 epocas (30 pasos), batch efectivo de 16 (batch 1 con acumulacion de gradientes de 16) y precision fp16 con escalado de gradientes, dado que la GPU T4 (sm_75) no soporta bf16. La mascara de perdida se aplico solo a los tokens de asistente (39 de 94 tokens, un 41,5 %), y el pico de VRAM durante el entrenamiento fue de 12,01 GB sobre 14,6 GB disponibles.

El conjunto de datos consta de 225 muestras de entrenamiento y 25 de validacion con semilla 42. Todas las muestras comparten el mismo formato de salida JSON, lo que, segun el autor, contribuye al olvido catastrofico al no incluir datos de replay fuera de dominio que anclen las capacidades generales del modelo.

## Capacidades

- Clasificacion de tickets de atencion al cliente en vietnamita con salida JSON estructurada en cuatro campos: `intent`, `urgency`, `product` y `sentiment`.
- Mejora de la precision en la tarea objetivo: 0,970 frente a 0,765 del modelo base con prompt optimizado.
- Cumplimiento de formato perfecto (1,000) en la generacion de JSON valido.
- Capacidades generales del modelo base Qwen3.5-4B degradadas por el olvido catastrofico (regresion de 0,147 puntos).
- No soporta tool calling, agentes ni razonamiento multi-paso mas alla de lo heredado del modelo base.
- Monolingue: exclusivamente vietnamita.

## Casos de uso

- Evaluacion academica e investigacion: el adaptador sirve como referencia para estudiar el impacto del fine-tuning con datasets pequenos y homogeneos sobre modelos de 4B, y para analizar el fenomeno de olvido catastrofico en adaptadores LoRA.
- Comparativa de estrategias de prompting: los resultados documentados permiten comparar la eficacia de un adaptador LoRA frente a ingenieria de prompt optimizada sobre el mismo modelo base.
- Analisis de errores sistematicos: el fallo documentado con la frase "Khi nào tiện" (cuando sea conveniente) ofrece un caso de estudio reproducible sobre sesgos de aprendizaje en clasificacion de urgencia.
- Prototipado de sistemas de triage de tickets: el adaptador puede integrarse en un pipeline de demostracion para validar el flujo de clasificacion JSON antes de entrenar un modelo de produccion con datos de replay.
- Investigacion sobre mitigacion del olvido catastrofico: el autor sugiere mezclar un 1-5 % de datos de replay fuera de dominio; el adaptador puede servir como punto de partida para experimentos de continuidad de aprendizaje.
- Formacion y docencia: como ejemplo de fine-tuning LoRA con PEFT sobre un modelo Qwen3.5, con configuracion completa documentada (r, alpha, learning rate, mascara de perdida) y resultados reproducibles.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan tres configuraciones sobre el mismo conjunto de validacion (25 muestras):

| Configuracion | target | regression | format | latencia (ms) |
|---|---:|---:|---:|---:|
| (a) Base + prompt ingenuo | 0,000 | 0,758 | 0,000 | 3255,0 |
| (b) Base + prompt optimizado | 0,765 | 0,758 | 1,000 | 1062,6 |
| (c) Adaptador LoRA (este modelo) | 0,970 | 0,611 | 1,000 | 1456,0 |

La metrica `target` mide el acierto en la tarea de clasificacion, `regression` mide la capacidad general del modelo (cuanto mayor, mejor) y `format` indica si la salida es JSON valido. El adaptador gana claramente en la tarea objetivo (+0,205 sobre el prompt optimizado) pero pierde 0,147 de capacidad general, superando el umbral permitido de 0,020. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM de entrenamiento: pico de 12,01 GB sobre 14,6 GB disponibles, lo que indica que cabe en una GPU T4 (16 GB) o equivalente.
- VRAM de inferencia: no disponible, pero al tratarse de un adaptador LoRA sobre un modelo de 4B, la inferencia en fp16 requiere aproximadamente 8-10 GB de VRAM; con cuantizacion del modelo base (GGUF o bitsandbytes) puede ejecutarse en GPUs consumer de 8 GB.
- GPU recomendadas: T4 (16 GB) para entrenamiento; RTX 3060/4060 (12 GB) o superiores para inferencia local.
- Opciones de despliegue: transformers con PEFT (`PeftModel.from_pretrained`), compatible con vLLM y TGI si se fusiona el adaptador con el modelo base; llama.cpp y Ollama requieren fusion previa del adaptador en el modelo base.
- Latencia: 1456 ms por muestra en la configuracion de evaluacion documentada (hardware no especificado, presumiblemente T4).

## Comparativa con modelos similares

| Modelo | Base | Tamano adaptador | Tarea | Licencia | Estado |
|---|---|---|---|---|---|
| Tam109204/lab21-2A202601267-qwen3-triage-lora | Qwen3.5-4B | 32,5M params | Triage de tickets en vietnamita | Apache 2.0 | No apto para produccion |
| vadimbelsky/qwen3.5-medical-ft | Qwen3.5-9B | no disponible | Triage clinico en ingles | no disponible | Adaptador LoRA sobre datos sinteticos de PubMed |
| dgunt/lab21-qwen25-3b-lora-r64 | Qwen2.5-3B | r=64 | Triage de tickets (mismo lab) | no disponible | Adaptador LoRA academico |

No se dispone de datos de rendimiento comparables entre estos modelos, ya que cada uno se evalua sobre conjuntos de datos propios. La comparativa se limita a la arquitectura y la tarea.

## Limitaciones y advertencias

- Olvido catastrofico severo: el adaptador pierde 0,147 puntos de capacidad general frente al umbral permitido de 0,020, mas de siete veces por encima. El autor declara explicitamente que no debe usarse en produccion.
- Sesgo sistematico documentado: los 6 errores del conjunto de validacion contienen todos la frase "Khi nào tiện"; el modelo predice `urgency = trung_binh` cuando la etiqueta correcta es `thap`. Los 44 casos sin esa frase se clasifican correctamente.
- Conjunto de datos muy reducido: 225 muestras de entrenamiento, todas con el mismo formato de salida JSON, lo que limita la generalizacion a variaciones de entrada no vistas.
- Monolingue: solo soporta vietnamita; cualquier entrada en otro idioma queda fuera del alcance del adaptador.
- Sin datos de replay: no se incluyeron muestras fuera de dominio durante el entrenamiento, lo que agrava el olvido catastrofico.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo (no apto para produccion) desaconseja cualquier despliegue real.
- No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, etc.), por lo que no es posible comparar su rendimiento general con otros modelos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tam109204/lab21-2A202601267-qwen3-triage-lora
- Repositorio de codigo e informe (GitHub): https://github.com/tranthithanhtam/Day21-Track3-2A202601267-TranThiThanhTam
- Informe detallado: `REPORT.md` en el repositorio de codigo
- Artefactos brutos: directorio `results/` en el repositorio de codigo
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Informe tecnico de Qwen3: https://arxiv.org/pdf/2505.09388
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
