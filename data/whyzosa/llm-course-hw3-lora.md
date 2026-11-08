# WhyZosa/llm-course-hw3-lora

## Resumen
WhyZosa/llm-course-hw3-lora es un ajuste fino mediante LoRA del modelo OuteAI/Lite-Oute-1-300M-Instruct, un transformer causal de 300 millones de parametros orientado a generacion de texto. El modelo ha sido entrenado para una tarea concreta: la clasificacion de sentimiento (positivo, neutral, negativo) de tuits en ingles, empleando el conjunto de datos cardiffnlp/tweet_eval. Lo publica el usuario WhyZosa como parte de un trabajo practico de un curso de LLM (la nomenclatura "hw3" y la existencia de un repositorio paralelo de otro autor apuntan a un ejercicio academico de implementacion de LoRA).

El interes del modelo es, por tanto, didactico y acotado: demuestra como aplicar adaptadores LoRA de bajo rango sobre una base pequena para especializarla en una tarea de clasificacion reformulada como generacion. No es un modelo generalista ni compite con LLMs de proposito general; su rendimiento medido es modesto (Macro F1 de 0,522 en test), lo que refleja tanto el tamano reducido de la base como la dificultad intrinseca del dataset.

La relevancia practica es limitada fuera del ambito de experimentacion: sirve como referencia para estudiar el flujo completo de ajuste con LoRA, la evaluacion sobre tweet_eval y las limitaciones de los modelos de 300M en tareas de comprension fina del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (derivada de Mistral, segun tags; base OuteAI/Lite-Oute-1-300M-Instruct) |
| Parametros totales | 300.031.872 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo base es Lite-Oute-1-300M-Instruct, un transformer causal de 300M de parametros de la familia OuteAI, etiquetado en Hugging Face con el tag "mistral", lo que sugiere una arquitectura derivada de Mistral adaptada a escala reducida. Sobre esta base se aplica un ajuste fino con LoRA de rango 8 unicamente en las proyecciones `k_proj` y `v_proj`, es decir, en las matrices de clave y valor de la atencion. Este es un ajuste de parametros muy reducido, coherente con un ejercicio academico de implementacion manual de LoRA.

El entrenamiento se realiza sobre cardiffnlp/tweet_eval, un corpus de tuits en ingles anotados con sentimiento. La tarea se reformula como clasificacion generativa dentro de un esquema de modelado causal estandar, de modo que el modelo produce la etiqueta (`positive`, `neutral`, `negative`) como texto. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO; el autor solo reporta el resultado de evaluacion (Macro F1 de 0,522 en test) y algunos ejemplos cualitativos.

## Capacidades
- Generacion de texto en ingles mediante modelado causal.
- Clasificacion de sentimiento de tuits en tres clases: positivo, neutral y negativo.
- Capacidad conversacional heredada del modelo base Instruct (no verificada especificamente en este ajuste).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso
- Experimentacion academica con LoRA: el modelo sirve como referencia reproducible para estudiar como un adaptador de rango 8 sobre `k_proj` y `v_proj` modifica el comportamiento de una base de 300M; util en cursos y tutoriales de ajuste fino.
- Analisis de sentimiento de bajo coste en prototipos: para pipelines de prueba donde se necesita una etiqueta rapida de polaridad en tuits en ingles sin infraestructura pesada, dado que el modelo cabe en cualquier GPU consumer.
- Baseline para comparativas: al tener un F1 documentado (0,522), puede usarse como linea base frente a clasificadores dedicados (BERT, RoBERTa) o LLMs mayores en tareas de sentimiento sobre tweet_eval.
- Estudio de errores en clasificacion generativa: los ejemplos de la model card muestran confusiones (p. ej., un tuit negativo etiquetado como positivo), lo que lo hace util para analizar sesgos y fallos de modelos pequenos.
- Despliegue en entornos con recursos muy limitados: con 300M de parametros, es viable en CPU o GPUs de gama baja para inferencia por lotes de baja exigencia.
- Demostracion de integracion con transformers y text-generation-inference: el tag `endpoints_compatible` permite probar el flujo de despliegue en infraestructura Hugging Face con un modelo minimo.

## Benchmarks y rendimiento
El autor solo reporta una metrica: Macro F1 de 0,522 en el conjunto de test de tweet_eval. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

| Metrica | Valor | Conjunto |
|---|---|---|
| Macro F1 | 0,522 | tweet_eval (test) |

## Requisitos de hardware
- VRAM estimada para inferencia en fp16: aproximadamente 0,6 GB solo para pesos; en la practica, 1-2 GB contando overhead de runtime.
- En cuantizacion de 8 bits o 4 bits, cabe holgadamente en GPUs consumer de gama baja (GTX 1650, RTX 3050) e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; no requiere A100 ni H100.
- Despliegue: transformers (libreria declarada), text-generation-inference (tag `endpoints_compatible`); compatible con llama.cpp/Ollama solo si se convierte a GGUF, conversion no documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WhyZosa/llm-course-hw3-lora | 300M | no disponible | Sentimiento en tuits (generativo) | Apache 2.0 | Hugging Face |
| OuteAI/Lite-Oute-1-300M-Instruct (base) | 300M | no disponible | Generacion/instrucciones | no disponible | Hugging Face |
| sodeniZz/llm-course-hw3-lora | no disponible | no disponible | Sentimiento (LoRA, mismo curso) | no disponible | Hugging Face |
| Clasificadores BERT/RoBERTa para tweet_eval | 110M-355M | 512 tokens | Clasificacion de sentimiento | variable | Hugging Face |

La comparacion con clasificadores dedicados es la mas relevante: los modelos tipo RoBERTa-base ajustados en tweet_eval suelen superar ampliamente el F1 de 0,522, lo que situa a este modelo como una alternativa de bajo rendimiento pero conceptualmente instructiva.

## Limitaciones y advertencias
- Rendimiento modesto: Macro F1 de 0,522 indica una capacidad de clasificacion limitada; la propia model card muestra un ejemplo de error (tuit negativo clasificado como positivo).
- Solo ingles: no soporta otros idiomas.
- Base muy pequena (300M), con capacidad de comprension fina del lenguaje restringida.
- Riesgo de alucinacion y de etiquetas inconsistentes al ser un modelo generativo reformulado como clasificador.
- Ajuste LoRA de rango 8 solo en `k_proj` y `v_proj`: la especializacion es superficial y puede no generalizar fuera del dominio de tuits.
- No hay documentacion sobre sesgos del dataset tweet_eval (posibles sesgos de anotacion, dominio y demografia de Twitter).
- Uso comercial permitido por licencia Apache 2.0, pero sin garantias de calidad para produccion.
- Sin datos de contexto, cuantizacion ni benchmarks adicionales; no recomendable como componente critico en sistemas reales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/WhyZosa/llm-course-hw3-lora
- Modelo base: https://huggingface.co/OuteAI/Lite-Oute-1-300M-Instruct
- Dataset: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Repositorio paralelo del mismo curso: https://huggingface.co/sodeniZz/llm-course-hw3-lora
