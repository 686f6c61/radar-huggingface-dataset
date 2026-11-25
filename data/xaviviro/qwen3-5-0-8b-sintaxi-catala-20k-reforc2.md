# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc2 es un ajuste fino del modelo base Qwen/Qwen3.5-0.8B, desarrollado por Xavier Vinaixa Roselló (Sorensen AI) y Maria Sevilla Paris (Universitat de Barcelona). El modelo está especializado en una tarea muy concreta: el análisis sintáctico escolar del catalán. Recibe una única oración en catalán y devuelve directamente, sin razonamiento intermedio ni prompt de sistema, un objeto JSON con la estructura sintáctica (sujeto, predicado, complementos, voz y carácter impersonal).

La relevancia del modelo reside en su relación entre tamaño y rendimiento: con solo 852.985.920 parámetros (0,8B) alcanza un 94,4 % de análisis exactos en el conjunto de evaluación eval250, superando al modelo profesor Qwen3.8-27B (91,2 %) usado para la destilación. El autor advierte que ese 94,4 % debe interpretarse como cota superior, ya que las categorías de los refuerzos se eligieron observando errores en eval250; la referencia manual independiente de 30 oraciones, no usada para ninguna decisión, sube del 83,3 % al 96,7 %.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y bfloat16, y dispone de una versión cuantizada en MLX de 4 bits (0,44 GB) orientada a ejecución local en Mac. El repositorio ocupa 5,1 GB y el modelo acumula 90 descargas en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B, tag `qwen3_5`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos principales); variante MLX 4 bits publicada como modelo separado |
| Idiomas soportados | catalán (`ca`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros, y se somete a un ajuste completo (full fine-tuning) con TRL `SFTTrainer`: 3 épocas, learning rate 2e-5 con scheduler coseno, lotes de 16, precisión bf16 y pérdida calculada únicamente sobre la respuesta. El entrenamiento se ejecutó en una única NVIDIA L4 y duró 37 minutos. La entrada es exclusivamente la oración, sin instrucciones ni prompt de sistema, y la salida es el JSON de análisis sintáctico.

Los datos proceden de un proceso de destilación en tres fases. Primero, el profesor Qwen3.8-27B genera oraciones con una estructura sintáctica solicitada y las analiza a ciegas; solo se conservan las análisis que pasan un validador determinista y coinciden con la estructura pedida (6.649 ejemplos de 20k). Después se añade un primer refuerzo de 1.033 ejemplos del profesor centrados en CRV, impersonales, pronombres débiles y CPRED. Finalmente, un segundo refuerzo de 459 oraciones escritas y anotadas con un modelo generalista (sin el profesor) para las categorías de error restantes: CC de cantidad, tiempo y causa, CPRED con CD, impersonales con «fer», verbos psicológicos, CI con «a» + persona, CRV, pasiva en futuro y predicado nominal con «estar», revisadas con un corrector y validadas con el mismo filtro. El total asciende a 8.141 ejemplos.

## Capacidades

- Análisis sintáctico escolar del catalán: devuelve sujeto (con texto, núcleo y marca de elíptico), predicado (tipo y núcleo), complementos con su función (CD, CI, CC, CRV, CPRED, etc.), voz (activa/pasiva) y marca de impersonal.
- Salida estructurada en JSON válido (100 % de JSON válido reportado en eval250).
- Generación directa sin razonamiento intermedio ni prompt de sistema: la entrada es solo la oración.
- Cobertura de estructuras: CD, CD+CI, pronombres débiles, predicado nominal, voz pasiva, impersonales, CPRED, CRV, CC, verbos incoativos y sujeto elíptico.
- Soporte de plantilla de chat (`apply_chat_template` con `enable_thinking=False`).
- No consta soporte de tool calling, function calling, agentes, visión, audio ni otras modalidades.
- Capacidad multilingüe: únicamente catalán.

## Casos de uso

- Anotación sintáctica automatizada de corpus en catalán: el modelo procesa oraciones individuales y devuelve JSON estructurado listo para ingerir en bases de datos lingüísticas, con un 94,4 % de análisis exactos en eval250 y F1 de complementos de 97,4.
- Herramienta educativa para enseñanza de gramática catalana: integrado en una aplicación que recibe una frase del alumno y muestra el desglose de sujeto, predicado y complementos, aprovechando su formato de salida fijo y validable.
- Preprocesado para pipelines de PLN: generación de análisis sintácticos como característica intermedia para tareas posteriores (extracción de relaciones, análisis de sentimiento a nivel de cláusula) en textos catalanes.
- Validación y corrección gramatical asistida: detección de estructuras mal formadas comparando la salida del modelo con reglas deterministas, útil en herramientas de revisión de estilo en catalán.
- Despliegue local en hardware modesto: con 0,8B parámetros y una versión MLX de 4 bits de 0,44 GB, puede ejecutarse en un Mac para prototipado y pruebas sin infraestructura GPU.
- Investigación en destilación de conocimiento: el modelo y su dataset sirven como caso de estudio reproducible de destilación dirigida por datos (8.141 ejemplos) frente a volumen masivo, con paper y notebook publicados.
- Extracción de estructura para motores de búsqueda o asistentes conversacionales en catalán: parseo de consultas del usuario para identificar sujeto y complementos antes de la recuperación.

## Benchmarks y rendimiento

Datos medidos por el autor con temperatura 0, entrada consistente únicamente en la oración y el mismo código de métricas (`common.avalua`).

| Modelo | eval250 · análisis exacta | F1 complementos | F1 funciones | sujeto | núcleo verbal | JSON válido | referencia manual (30) | test (300) |
|---|---|---|---|---|---|---|---|---|
| mini 20k + refuerzo (ronda anterior) | 80,8 | 87,4 | 90,1 | 97,2 | 97,2 | 100 | 83,3 | 93,0 |
| **mini 20k + 2 refuerzos, bf16** | **94,4** | 97,4 | 98,0 | 99,6 | 97,2 | 100 | **96,7** | 94,0 |
| mini 20k + 2 refuerzos, MLX 4 bits | 94,4 | 96,7 | 97,8 | 99,6 | 98,4 | 100 | 96,7 | 93,7 |
| profesor Qwen3.8-27B (razonante) | 91,2 | 95,2 | 95,5 | 98,8 | 98,0 | 99,6 | 93,3 | — |

Análisis exacta (%) por tipo de oración en eval250:

| Tipo de oración (n) | 20k + refuerzo | 20k + 2 refuerzos, bf16 | MLX 4 bits |
|---|---|---|---|
| CD (30) | 100 | 93 | 93 |
| CD+CI (20) | 85 | 100 | 100 |
| pronombres débiles (15) | 60 | 100 | 100 |
| predicado nominal (25) | 88 | 96 | 96 |
| voz pasiva (20) | 95 | 100 | 100 |
| impersonal (15) | 60 | 80 | 87 |
| CPRED (15) | 60 | 80 | 73 |
| CRV (15) | 80 | 100 | 100 |
| CC (50) | 78 | 92 | 94 |
| verbos incoativos (25) | 80 | 100 | 100 |
| sujeto elíptico (20) | 80 | 95 | 90 |

El bf16 se evaluó tanto con `transformers` (Colab) como con `mlx-lm` (Mac), con idéntico resultado del 94,4 % en eval250.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica cabe holgadamente en GPUs de 8 GB o menos.
- Versión MLX 4 bits: 0,44 GB, ejecutable en Apple Silicon mediante `mlx-lm`.
- GPU recomendadas: el autor entrenó en una NVIDIA L4 (37 minutos); para inferencia es suficiente cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, con amplio margen, en cualquier tarjeta con 8 GB o más; también en Mac con Apple Silicon vía MLX.
- Opciones de despliegue: `transformers` (documentado en la model card), `mlx-lm` (versión MLX 4 bits), y por el formato safetensors es compatible con frameworks estándar; no se documentan recetas específicas para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | eval250 (exacta) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-20k-reforc2 | 0,8B | no disponible | 94,4 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-sintaxi-catala (20k + refuerzo, ronda anterior) | 0,8B | no disponible | 80,8 | no disponible | Hugging Face |
| Qwen3.8-27B (profesor, razonante) | 27B (aprox., según denominación) | no disponible | 91,2 | no disponible | no disponible en la información |

No se dispone de datos de otros analizadores sintácticos del catalán (por ejemplo, basados en modelos encoder o en herramientas rule-based) en la información proporcionada.

## Limitaciones y advertencias

- El 94,4 % en eval250 es una cota superior: las categorías de los dos refuerzos se eligieron observando los errores en eval250, por lo que ese conjunto ya no es una medida independiente. La referencia manual de 30 oraciones, no usada para ninguna decisión, es la estimación más limpia (96,7 %).
- Rendimiento desigual por categoría: en bf16, las categorías más débiles son impersonal (80 %), CPRED (80 %) y CD (93 %); en MLX 4 bits, CPRED baja al 73 % e impersonal sube al 87 %.
- El modelo está entrenado exclusivamente para catalán y para una única tarea; no es un modelo de propósito general.
- La entrada debe ser una sola oración; no se documenta comportamiento con párrafos, texto multioración o entradas fuera de dominio.
- Riesgo de alucinación estructural: al generar JSON directamente sin razonamiento, puede producir análisis sintácticamente plausibles pero incorrectos en estructuras no cubiertas por el entrenamiento.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del profesor; no disponibles datos al respecto.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda validar el rendimiento en el dominio concreto antes de producción, dado el tamaño reducido del conjunto de evaluación independiente (30 oraciones).
- No se documenta longitud de contexto soportada; para oraciones largas o con puntuación compleja conviene verificar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2
- Versión MLX 4 bits: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-20k-reforc2
- Dataset de evaluación: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250
- Código y notebook: https://github.com/xaviviro/destillacio-sintaxi-catala
- Paper (ResearchGate): https://www.researchgate.net/publication/418265808
- DOI del paper: https://doi.org/10.13140/RG.2.2.21560.51204
- Perfil del autor: https://huggingface.co/xaviviro
