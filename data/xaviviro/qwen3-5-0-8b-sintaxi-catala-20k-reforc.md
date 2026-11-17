# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc es un ajuste fino (fine-tuning) de Qwen/Qwen3.5-0.8B, desarrollado por Xavier Vinaixa Roselló (xaviviro, Sorensen AI, Barcelona) para una tarea muy concreta: el análisis sintáctico escolar de oraciones simples en catalán. El modelo recibe únicamente la oración como mensaje de usuario y devuelve un JSON con el análisis sintáctico, sin razonamiento intermedio ni texto adicional. Es, por tanto, un modelo especializado y no un asistente generalista.

La relevancia técnica del modelo está en su proceso de destilación: parte de un modelo base de 752 millones de parámetros (según los pesos safetensors publicados) y se entrena con un dataset destilado de un modelo mayor, Qwen3.8-27B, generado específicamente para esta tarea. La versión "reforc" (reforzada) reentrena desde el modelo base con el dataset original de 20.000 ejemplos más 1.033 ejemplos de refuerzo dirigidos a los puntos débiles detectados en la versión anterior: complemento de régimen verbal (CRV), impersonales, pronombres débiles y CPRED.

El resultado declarado por el autor es una mejora sustancial en la evaluación sobre 250 oraciones anotadas a mano: del 73,2 % al 80,8 % de análisis exacto, y del 6,7 % al 80,0 % en el subconjunto de complemento de régimen verbal. Se distribuye bajo licencia Apache 2.0 y existe una versión cuantizada a 4 bits en GGUF para LM Studio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 (según pesos safetensors) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos originales); GGUF 4 bits en repo separado |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; GGUF (repo `-GGUF`) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo (SFT, no LoRA) de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El entrenamiento se realizó con TRL durante 3 épocas, con learning rate 2e-5 y scheduler coseno, batch de 16, precisión bf16 y cálculo de pérdida únicamente sobre la respuesta (no sobre el prompt). El prompt de entrenamiento es corto: solo la oración, sin cadena de razonamiento, y se fuerza `enable_thinking=False` en la plantilla de chat.

Los datos provienen del dataset xaviviro/sintaxi-catala-destillada-20k-reforc: 20.000 ejemplos destilados de Qwen3.8-27B más 1.033 ejemplos de refuerzo añadidos específicamente para corregir los fallos de la versión anterior en complemento de régimen verbal, impersonales, pronombres débiles y CPRED. El autor indica que la configuración de entrenamiento es idéntica a la de otras tallas del mismo proyecto, lo que permite comparar variantes de tamaño sobre la misma receta.

## Capacidades

- Análisis sintáctico de oraciones simples en catalán con salida en JSON estructurado.
- Identificación de funciones sintácticas escolares: sujeto, predicado, complemento directo, complemento indirecto, complemento de régimen verbal, complementos circunstanciales, atributo y predicado nominal, entre otras.
- Tratamiento de impersonales y de pronombres débiles.
- Modo de generación determinista recomendado (`do_sample=False`), sin modo thinking.
- No soporta tool calling ni function calling según la información disponible.
- No es un modelo de agentes ni de razonamiento multi-paso: está diseñado para una única transformación entrada-salida.
- Capacidad multilingüe: no disponible; el modelo está entrenado y evaluado solo en catalán.

## Casos de uso

- Análisis sintáctico automatizado en entornos educativos: un corrector o plataforma de ejercicios puede enviar la oración del alumno y recibir el JSON de análisis para compararlo con la solución esperada, gracias a la salida estructurada y determinista.
- Generación de material didáctico: a partir de un banco de oraciones, el modelo produce análisis sintácticos etiquetados que el profesorado puede revisar y reutilizar en fichas y exámenes.
- Etiquetado sintáctico a escala para corpus catalanes: procesar lotes de oraciones simples para preanotar funciones sintácticas antes de una revisión humana, reduciendo el coste de anotación.
- Validación de gramáticas o correctores: usar el modelo como oráculo secundario para detectar discrepancias entre el análisis esperado y el producido por una herramienta existente.
- Asistente de estudio para alumnado: integrado en una aplicación de escritorio o web, responde con el análisis completo de la oración introducida, con la ventaja de que el modelo de 752 M cabe en hardware modesto.
- Despliegue local en LM Studio: la versión GGUF de 4 bits permite ejecutar el analizador en un portátil sin GPU dedicada, útil para docentes que quieren una herramienta offline.
- Investigación en destilación de tareas: sirve como caso de estudio reproducible de cómo un modelo pequeño destilado de uno grande puede superar el 80 % de exactitud en una tarea lingüística acotada.

## Benchmarks y rendimiento

Resultados declarados por el autor (porcentaje de análisis exacto):

| Modelo | Referencia manual (30) | Test (300) | eval250 (250 a mano) | eval250 · CRV | eval250 · impersonales |
|---|---|---|---|---|---|
| mini 20k | 73,3 | 92,3 | 73,2 | 6,7 | 46,7 |
| mini 20k + reforç | 83,3 | 93,0 | 80,8 | 80,0 | 60,0 |

El autor señala que algunos grupos bajan ligeramente (predicado nominal, sujeto elíptico), pero que se trata de 2 oraciones de un total de 20–25 por grupo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,5 GB para los pesos (el repo ocupa 1,5 GB), más overhead de activaciones y KV cache; en la práctica cabe en GPUs con 4 GB o más.
- VRAM estimada en GGUF 4 bits: alrededor de 0,5–0,7 GB de pesos, ejecutable en CPU.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o superior; también A100/H100 si se despliega a escala, aunque el modelo es pequeño y no las aprovecha.
- Cabe en GPU consumer: sí, en todas las GPU con 4 GB o más de VRAM; en 4 bits funciona incluso en CPU.
- Opciones de despliegue: Transformers (con `AutoModelForImageTextToText`), vLLM (`vllm serve`), LM Studio con la versión GGUF; llama.cpp y Ollama son viables con el GGUF aunque no se mencionan explícitamente.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-20k-reforc | 752 M | no disponible | Análisis sintáctico catalán | Apache 2.0 | HF + GGUF |
| Qwen3.5-0.8B-sintaxi-catala-20k (versión previa) | 752 M | no disponible | Análisis sintáctico catalán | Apache 2.0 | HF |
| Qwen/Qwen3.5-0.8B (modelo base) | 752 M | no disponible | Generación de texto general | Apache 2.0 | HF |

La comparación con modelos de la misma categoría (analizadores sintácticos especializados en catalán de tamaño similar) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: solo está entrenado para análisis sintáctico de oraciones simples en catalán; no debe usarse como asistente general ni para otras lenguas.
- Riesgo de alucinación en estructuras no vistas: el propio autor documenta puntos débiles residuales (predicado nominal, sujeto elíptico) y un 60 % en impersonales en la evaluación manual, lo que implica errores frecuentes en esas categorías.
- Dependencia del formato: espera la oración como único mensaje de usuario y `enable_thinking=False`; un prompt distinto puede degradar la salida JSON.
- Sin benchmarks estándar publicados: las métricas son internas del proyecto y no comparables directamente con evaluaciones de terceros.
- Sesgos: no disponible; no se documentan análisis de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la exactitud del análisis en producción.
- Contexto máximo no documentado: conviene limitar la entrada a oraciones simples, tal como se entrenó.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc
- Versión GGUF 4 bits: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-GGUF
- Versión previa (mini 20k): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k
- Dataset: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-20k-reforc
- Repositorio del proyecto: https://github.com/xaviviro/destillacio-sintaxi-catala
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Perfil del autor: https://huggingface.co/xaviviro
