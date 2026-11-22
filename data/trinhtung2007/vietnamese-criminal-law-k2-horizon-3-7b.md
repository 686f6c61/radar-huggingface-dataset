# trinhtung2007/vietnamese-criminal-law-k2-horizon-3.7b

## Resumen

El modelo `trinhtung2007/vietnamese-criminal-law-k2-horizon-3.7b` es un ajuste fino mediante LoRA del modelo base `mlx-community/K2-Horizon-3.7B-4bit`, orientado al análisis de hechos y conductas bajo el derecho penal vietnamita. Lo publica el usuario trinhtung2007 en Hugging Face y combina los pesos completos del modelo base cuantizado a 4 bits junto con un adaptador LoRA entrenado específicamente para razonamiento jurídico en vietnamita. El repositorio incluye tanto los pesos del modelo base como el adaptador, de modo que puede cargarse directamente con MLX-LM en hardware Apple Silicon.

La relevancia del modelo es acotada pero clara: se trata de un artefacto de investigación para el dominio legal vietnamita, un nicho poco cubierto por los modelos generalistas. El adaptador se entrenó durante 3.306 actualizaciones sobre el dataset de razonamiento legal IntroAI_project. El modelo no publica información sobre arquitectura interna más allá de la referencia a "K2-Horizon", ni sobre contexto máximo, idiomas soportados o benchmarks, por lo que gran parte de sus especificaciones deben consultarse en el repositorio del modelo base.

El modelo tiene 5.058.255.360 parámetros almacenados en safetensors (aunque la nomenclatura del repositorio indica 3.7B, probablemente referido al modelo original antes de la cuantización y del empaquetado), un tamaño de repositorio de 4,4 GB y licencia Apache-2.0. Su formato MLX lo limita a ejecución en Apple Silicon, lo que restringe su despliegue en producción a ese ecosistema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | K2-Horizon (implementación custom, detalles no disponibles) |
| Parametros totales | 5.058.255.360 (según safetensors); el nombre del repo indica 3.7B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (base); adaptador LoRA en safetensors |
| Idiomas soportados | vietnamita (entrenamiento del adaptador); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), adaptadores en `adapters.safetensors` |

## Arquitectura y entrenamiento

El modelo base es `K2-Horizon-3.7B` en su variante MLX de 4 bits, con implementación de modelo personalizada incluida en el repositorio (requiere `--trust-remote-code`). La model card no detalla si la arquitectura es transformer denso, MoE o híbrida; únicamente indica que se trata de "K2-Horizon architecture and custom model code". No se especifican número de tokens de entrenamiento del modelo base, composición del dataset ni si hubo RLHF o DPO.

El adaptador LoRA se entrenó durante 3.306 actualizaciones sobre el dataset de razonamiento legal IntroAI_project, orientado al análisis de hechos bajo el derecho penal vietnamita. No se publican hiperparámetros del entrenamiento (rank del LoRA, learning rate, tamaño del dataset, proporción de ejemplos). El adaptador se aplica en tiempo de inferencia sobre los pesos base cuantizados, y el repositorio incluye ambos componentes para poder cargar el modelo adaptado de forma directa con MLX-LM.

## Capacidades

- Generación de texto conversacional en vietnamita, con especialización en análisis jurídico penal.
- Análisis de hechos y conductas bajo el marco del derecho penal vietnamita (calificación jurídica de supuestos).
- Razonamiento legal guiado por el dataset de entrenamiento del adaptador.
- Soporte de chat multi-turno mediante plantilla de chat incluida en el repositorio.
- Ejecución local en Apple Silicon mediante MLX-LM.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se confirma vietnamita; el resto no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Análisis preliminar de supuestos penales: dado un relato de hechos en vietnamita, el modelo puede generar un análisis orientativo sobre la posible calificación jurídica, útil como primer borrador para estudiantes de derecho o abogados que revisan casos.
- Asistencia a estudiantes de derecho vietnamita: el modelo puede explicar conceptos y aplicar el código penal a casos prácticos en un entorno de estudio, con la advertencia de que no sustituye asesoramiento profesional.
- Generación de borradores de memorandos jurídicos: a partir de un resumen de hechos, el modelo puede producir un texto estructurado de análisis que el jurista revisa y corrige.
- Investigación académica en NLP jurídico vietnamita: sirve como baseline ajustado para experimentos de razonamiento legal en vietnamita y para comparar con modelos generalistas.
- Prototipado de asistentes legales locales: al ejecutarse en Apple Silicon con MLX, permite desplegar un prototipo de asistente legal sin depender de APIs externas, útil para demos y validación de producto.
- Clasificación y triaje de consultas legales: el modelo puede ayudar a categorizar consultas de usuarios según el área del derecho penal implicada antes de derivarlas a un profesional.
- Formación interna en despachos: como herramienta de práctica para abogados junior que quieran contrastar su razonamiento sobre supuestos penales en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: al ser un modelo MLX de 4 bits con 4,4 GB de repositorio, se estima un uso de memoria en torno a 4-6 GB en inferencia, aunque no se confirma oficialmente.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra); no es compatible con CUDA ni con GPUs NVIDIA de forma nativa.
- ¿Cabe en consumer GPU? Sí, en equipos Apple con al menos 8 GB de memoria unificada; se recomienda 16 GB o más para contexto largo y mayor comodidad.
- Opciones de despliegue: MLX-LM (`mlx_lm.generate`), con `--trust-remote-code` y `--adapter-path` apuntando al mismo repositorio. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| trinhtung2007/vietnamese-criminal-law-k2-horizon-3.7b | ~5,06B (safetensors) | no disponible | Apache-2.0 | MLX (Apple Silicon) | Ajuste LoRA para derecho penal vietnamita |
| mlx-community/K2-Horizon-3.7B-4bit (base) | ~3,7B nominal | no disponible | Apache-2.0 (según upstream) | MLX (Apple Silicon) | Modelo base sin especialización legal |
| IFM/K2-Horizon-3.7B (upstream) | ~3,7B nominal | no disponible | no disponible | safetensors | Modelo original antes de cuantización MLX |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- El adaptador es un artefacto de investigación y no sustituye asesoramiento legal profesional; la propia model card lo advierte.
- Riesgo de alucinación elevado en un dominio jurídico donde una cita normativa incorrecta puede tener consecuencias graves.
- No se documentan sesgos conocidos, pero el entrenamiento sobre un único dataset legal vietnamita puede producir respuestas desequilibradas o desactualizadas respecto a la normativa vigente.
- Idiomas: solo se confirma vietnamita; el comportamiento en castellano u otros idiomas no está validado.
- Longitud de contexto no documentada, lo que dificulta planificar casos con hechos extensos.
- Requiere `--trust-remote-code` por la implementación custom de K2-Horizon, lo que implica ejecutar código no auditado si no se revisa previamente.
- Compatibilidad limitada a MLX y Apple Silicon; no hay soporte para CUDA, vLLM, llama.cpp ni Ollama.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal del uso en asesoría jurídica recae en el implementador.
- Sin descargas ni likes en el momento de la ficha, lo que indica ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trinhtung2007/vietnamese-criminal-law-k2-horizon-3.7b
- Modelo base MLX: https://huggingface.co/mlx-community/K2-Horizon-3.7B-4bit
- Modelo upstream: https://huggingface.co/IFM/K2-Horizon-3.7B
