# teys7007/pythia-160m-seed42-dense

## Resumen

Este repositorio contiene los checkpoints densos de un modelo Pythia-160M reentrenado desde cero con semilla 42, diseñado específicamente para el estudio de dinámicas de entrenamiento tempranas. El trabajo se enmarca en el artículo *Copying Before Suppression* (Findings of EMNLP 2026), que investiga la ventana de rendimiento por debajo del azar en la tarea de Identificación de Objeto Indirecto (IOI). La suite Pythia original publica checkpoints cada 1000 pasos, una resolución demasiado gruesa para observar esa transición; este modelo los guarda cada 50 pasos entre los pasos 100 y 3000, con el punto mínimo en el paso 2850.

El modelo replica exactamente la arquitectura de `EleutherAI/pythia-160m-deduped` (12 capas, 768 unidades ocultas, 12 cabezas de atención) y se entrena sobre el subconjunto deduplicado de The Pile. Su propósito no es servir como modelo de propósito general, sino como herramienta de investigación para analizar cómo cambian las representaciones internas durante las primeras fases del entrenamiento. La licencia Apache 2.0 permite su uso y modificación sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder causal, 12 capas, 768 hidden, 12 heads) |
| Parametros totales | 160 millones (aprox.) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (hereda la de Pythia-160M, 2048 tokens) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints por revisión) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la de `EleutherAI/pythia-160m-deduped`: un transformer decoder causal con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, implementado con la clase `GPTNeoXForCausalLM` de Transformers. No incorpora ninguna innovación arquitectónica; su valor reside en la densidad de los checkpoints guardados durante el entrenamiento.

El entrenamiento se realizó sobre The Pile deduplicado, transmitido en streaming, con el optimizador Adam (lr 6e-4) y un programa de coseno. El tamaño de lote efectivo es de aproximadamente 2 millones de tokens por paso, y el modelo se entrenó durante 10 000 pasos con semilla 42. El calendario de guardado es: cada 10 pasos entre 0 y 100, cada 50 pasos entre 100 y 3000, y cada 200 pasos entre 3000 y 10000. Esto permite resolver con precisión la ventana de rendimiento por debajo del azar que la suite Pythia original no captura.

La validación muestra que la pérdida de evaluación sobre texto retenido de The Pile sigue de cerca a la del modelo `pythia-160m-deduped` a partir del paso 2000, con una diferencia máxima absoluta de 0.056 en el paso 5000. En el paso 1000, la diferencia entre ambas ejecuciones es de 0.287, lo que refleja la divergencia inicial esperada por la semilla distinta.

## Capacidades

- Generación de texto autoregresiva en ingles, con calidad limitada por su tamaño (160M de parámetros).
- Razonamiento básico y completado de frases, pero sin capacidades avanzadas de razonamiento o matemáticas.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agentes ni multi-step reasoning.
- Sin soporte multimodal (solo texto).
- Capacidad multilingüe nula: entrenado exclusivamente con datos en ingles.
- Capacidad especial: checkpoints densos que permiten estudiar la evolución de representaciones internas durante el entrenamiento, incluyendo la ventana de IOI por debajo del azar.

## Casos de uso

- Investigación en dinámicas de entrenamiento: el modelo permite reproducir y analizar la ventana de rendimiento por debajo del azar en IOI, gracias a sus checkpoints cada 50 pasos. Se puede cargar cualquier paso concreto mediante `revision="step2850"` y estudiar las activaciones internas.
- Estudios de interpretabilidad mecanística: al ser una réplica exacta de Pythia-160M, sirve como banco de pruebas para técnicas de análisis de circuitos (attention heads, MLPs) en una fase temprana del entrenamiento.
- Comparación de semillas y variabilidad: al existir la suite Pythia original con semilla distinta, permite aislar el efecto de la semilla en la trayectoria de pérdida y en la formación de habilidades.
- Reproducción de experimentos de *Copying Before Suppression*: el repositorio incluye código y resultados en GitHub, por lo que se puede verificar el hallazgo principal del artículo.
- Docencia en interpretabilidad: por su pequeño tamaño, es adecuado para ejecutar en una sola GPU y demostrar conceptos de análisis de transformers en un entorno controlado.
- Desarrollo de métricas de evaluación temprana: los checkpoints densos permiten correlacionar la pérdida de validación con métricas de comportamiento en tareas específicas durante los primeros miles de pasos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de evaluación sobre texto retenido de The Pile, que se compara con `EleutherAI/pythia-160m-deduped`:

| Paso | Pérdida de validación (este modelo) | Diferencia vs. pythia-160m-deduped |
|---|---|---|
| 1000 | no disponible | 0.287 |
| 2000 | no disponible | sigue la tendencia |
| 5000 | no disponible | 0.056 (máxima absoluta) |

No se proporcionan valores absolutos de pérdida, solo diferencias relativas.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (160M parámetros ≈ 640 MB en fp32). Con cuantización a 8 bits, ~320 MB; a 4 bits, ~160 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Una NVIDIA GTX 1050 Ti, RTX 2060 o superior es suficiente. También funciona en CPU con llama.cpp.
- Cabe en cualquier GPU consumer moderna, incluidas las de portátiles.
- Opciones de despliegue: Transformers (carga directa con `from_pretrained`), vLLM, llama.cpp, Ollama (si se convierte a GGUF), TGI.
- Latencia y throughput: al ser un modelo pequeño, la generación es muy rápida; en una RTX 3090 se pueden alcanzar miles de tokens por segundo, aunque no hay cifras oficiales publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Checkpoints | Licencia |
|---|---|---|---|---|---|
| `teys7007/pythia-160m-seed42-dense` | 160M | 2048 (heredado) | Pile deduplicado, 10k pasos, seed 42 | Cada 10/50/200 pasos | Apache 2.0 |
| `EleutherAI/pythia-160m-deduped` | 160M | 2048 | Pile deduplicado, 10k pasos, seed distinta | Cada 1000 pasos | Apache 2.0 |
| `EleutherAI/pythia-160m` | 160M | 2048 | Pile sin deduplicar, 10k pasos | Cada 1000 pasos | Apache 2.0 |

La diferencia clave es la densidad de checkpoints: el modelo de este repositorio ofrece una resolución 20 veces mayor en la ventana crítica (pasos 100-3000), lo que lo hace único para estudios de dinámicas tempranas. El resto de características son idénticas a las de la suite Pythia.

## Limitaciones y advertencias

- Modelo de investigación, no apto para producción: su tamaño y entrenamiento limitado lo hacen poco útil para tareas reales de generación o razonamiento.
- Sesgos del dataset: entrenado sobre The Pile, que contiene contenido web con sesgos sociales y culturales; el modelo puede reflejar esos sesgos en sus generaciones.
- Riesgo de alucinación: alto, como es esperable en un modelo de 160M de parámetros.
- Solo ingles: no soporta otros idiomas.
- Sin capacidades de tool calling ni agentes: no se puede integrar en pipelines que requieran interacción con APIs o ejecución de código.
- Los checkpoints son densos en el tiempo pero no incluyen el estado del optimizador; solo los pesos del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no tiene valor práctico comercial debido a su baja calidad.
- No se garantiza la reproducibilidad exacta de los resultados del artículo si se usa una versión diferente de Transformers o de los datos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/teys7007/pythia-160m-seed42-dense
- Modelo base: https://huggingface.co/EleutherAI/pythia-160m-deduped
- Suite Pythia original: https://huggingface.co/EleutherAI/pythia-160m
- Repositorio GitHub con código y resultados: https://github.com/Tejas7007/EMNLP_Findings_2026_Copying_Before_Suppression
- Artículo (cita en la model card): Dahiya, T. y Blondin, C. (2026). *Copying Before Suppression: What Drives a Below-Chance Dip During Language Model Training?* Findings of EMNLP 2026.
- Documentación de Pythia en EleutherAI: https://www.eleuther.ai/artifacts/pythia
