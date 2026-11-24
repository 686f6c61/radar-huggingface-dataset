# srujun/inkling2-jlens-v42

## Resumen

Inkling 2 Mini Full-Rank Jacobian Lens (Visit 42) es un artefacto de interpretabilidad publicado por el usuario srujun bajo licencia MIT en Hugging Face. No se trata de un modelo de lenguaje generativo, sino de una lente lineal de rango completo (Jacobian lens) que mapea las activaciones de salida del bucle en la visita 42 del modelo `thinkingmachines/Inkling-2-Mini` hacia el espacio de unembedding posterior a la normalización. El artefacto se distribuye en formato `bfloat16` con un tamano de 10,62 MB y utiliza 2.304 sondas Haar-ortogonales sobre un total de 2.304, lo que corresponde a una cobertura del 100 % del espacio de sondas.

El objetivo de esta lente es facilitar el analisis de mecanismos internos en modelos con arquitecturas de bucles (looped transformers), permitiendo proyectar activaciones intermedias en el vocabulario de salida para estudiar como evoluciona la representacion a lo largo de las iteraciones del bucle. Se enmarca en la NDIF Looped Lens Challenge, una iniciativa orientada a estandarizar y comparar herramientas de interpretabilidad para modelos con computo recurrente.

La relevancia actual del artefacto es acotada: al no ser un modelo desplegable, su utilidad se limita a la investigacion en interpretabilidad mecanicista sobre `Inkling-2-Mini`. El repositorio no incluye pipeline, idiomas declarados ni resultados de evaluacion, y en el momento de la consulta registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lente Jacobiana lineal de rango completo sobre activaciones de un transformer con bucles (`Inkling-2-Mini`) |
| Parametros totales | no disponible (artefacto de 10,62 MB en `bfloat16`; no es un modelo generativo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en `bfloat16`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible de forma explicita; el artefacto se describe como tensor `bfloat16` de 10,62 MB, sin confirmacion de safetensors ni GGUF |

## Arquitectura y entrenamiento

La lente es una transformacion lineal de rango completo que proyecta la activacion de salida del bucle en la visita 42 del modelo `thinkingmachines/Inkling-2-Mini` hacia el espacio de unembedding posterior a la normalizacion. Se construye a partir de 2.304 sondas Haar-ortogonales, lo que garantiza cobertura completa del espacio de sondas definido por el reto. El resultado es una matriz en `bfloat16` de 10,62 MB, coherente con una dimension de activacion del orden de 2.304 y un vocabulario de unembedding de tamano comparable.

No se dispone de informacion sobre el procedimiento de estimacion del jacobiano (numero de muestras, corpus de calibracion, metrica de error de reconstruccion) ni sobre el proceso de entrenamiento del modelo base `Inkling-2-Mini`. Tampoco se detalla si la lente se ajusta por minimos cuadrados, por regresion ridge o mediante otro estimador. La unica innovacion tecnica declarada es el uso de sondas Haar-ortogonales de rango completo para capturar la totalidad del espacio de direcciones, en lugar de un subconjunto reducido de sondas.

## Capacidades

- Proyeccion de activaciones intermedias del modelo `Inkling-2-Mini` en la visita 42 del bucle hacia el espacio de logits de unembedding.
- Analisis de la evolucion de representaciones a lo largo de las iteraciones del bucle en arquitecturas recurrentes.
- Soporte para estudios de interpretabilidad mecanicista basados en lentes jacobianas (logit lens generalizado).
- Cobertura completa del espacio de sondas (2.304/2.304), lo que permite analisis sin sesgo de submuestreo de direcciones.
- No soporta generacion de texto, tool calling, agentes, vision, audio ni capacidades multilingues: es un artefacto de analisis, no un modelo desplegable.

## Casos de uso

- Analisis de dinamica de bucles: permite observar como cambia la distribucion de logits proyectada en cada visita del bucle de `Inkling-2-Mini`, lo que ayuda a identificar en que iteracion se estabiliza la prediccion.
- Diagnostico de representaciones internas: al proyectar activaciones en el vocabulario, se pueden localizar direcciones asociadas a tokens concretos y estudiar su persistencia a lo largo del computo recurrente.
- Investigacion en interpretabilidad comparada: sirve como referencia de rango completo para contrastar con lentes de rango reducido dentro del NDIF Looped Lens Challenge.
- Validacion de hipotesis sobre profundidad efectiva: la lente permite medir si el modelo utiliza informacion de visitas tempranas o si la representacion se reescribe en visitas tardias.
- Reproducibilidad de experimentos: al publicarse bajo MIT con un tamano reducido (10,62 MB), facilita la replicacion de estudios de lentes jacobianas en entornos con recursos limitados.
- Docencia y formacion: util como ejemplo practico de construccion y uso de lentes lineales en cursos de interpretabilidad mecanicista, dado su bajo coste computacional de carga y aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de fidelidad de la lente (por ejemplo, error de reconstruccion, correlacion con logits reales o acuerdo top-k) ni comparaciones con otras lentes del reto.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para cargar la lente (10,62 MB en `bfloat16`); el requisito dominante es el del modelo base `Inkling-2-Mini`, no disponible en la informacion proporcionada.
- GPU recomendadas: cualquier GPU con soporte de `bfloat16` (Ampere o superior: RTX 3090, RTX 4090, A100, H100); tambien es viable en CPU para la aplicacion de la matriz.
- Cabe en GPU de consumo: si, la lente por si sola cabe en cualquier GPU consumer e incluso en memoria unificada de sistemas integrados.
- Opciones de despliegue: carga directa con PyTorch o `safetensors`; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo generativo.
- Latencia y throughput: no disponibles; la aplicacion de una matriz de 2.304 x 2.304 en `bfloat16` es del orden de microsegundos por activacion en GPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Artefacto | Tipo | Cobertura de sondas | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| srujun/inkling2-jlens-v42 | Lente jacobiana lineal, rango completo | 2.304/2.304 (100 %) | `thinkingmachines/Inkling-2-Mini` | MIT | Hugging Face, 0 descargas |
| Otras lentes del NDIF Looped Lens Challenge | Lentes jacobianas (rango variable) | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Logit lens clasica | Proyeccion lineal directa sobre unembedding | no aplica | Multiples transformers | no aplica | Ampliamente implementada en librerias de interpretabilidad |

No se dispone de datos de rendimiento ni de fidelidad para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni puede desplegarse como servicio de inferencia.
- Dependencia estricta del modelo base `thinkingmachines/Inkling-2-Mini` y de la visita 42 del bucle; no es transferible a otras visitas ni a otros modelos sin reestimacion.
- Ausencia de metricas de fidelidad publicadas: se desconoce el error de reconstruccion y la calidad de la proyeccion frente a los logits reales.
- Sin informacion sobre el corpus de calibracion ni el estimador utilizado, lo que dificulta evaluar sesgos en la lente.
- El repositorio registra 0 descargas y 0 likes, y no incluye pipeline ni idiomas declarados; no hay evidencia de uso o validacion por parte de la comunidad.
- Aunque la licencia es MIT y permite uso comercial del artefacto, el uso del modelo base `Inkling-2-Mini` queda sujeto a su propia licencia, no disponible en la informacion proporcionada.
- Riesgo de interpretacion erronea: una proyeccion lineal en el espacio de unembedding no garantiza que las direcciones proyectadas correspondan a los conceptos que el modelo utiliza internamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/srujun/inkling2-jlens-v42
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- NDIF Looped Lens Challenge: no disponible en la informacion proporcionada
- Paper o blog asociado: no disponible en la informacion proporcionada
- Repositorio de codigo o demo: no disponible en la informacion proporcionada
