# takumiecd/cst-swin-mlp-cifar10

## Resumen

CST Swin MLP para CIFAR-10 es un conjunto de tres checkpoints de clasificación de imágenes publicado por el usuario takumiecd en Hugging Face. El modelo parte de la arquitectura Swin MLP, una variante de transformer con mezcla de tokens mediante perceptrones multicapa en ventanas locales, y sustituye la capa lineal de mezcla de tokens de cada cabeza por una `CSTLinear`, una primitiva del ecosistema torchcst. El objetivo es comparar el rendimiento de la mezcla de tokens estándar frente a la mezcla basada en CST en un problema de clasificación de 10 clases sobre CIFAR-10.

El repositorio contiene tres archivos de pesos en formato Safetensors: `baseline.safetensors` (Swin MLP original), `cst-128.safetensors` y `cst-256.safetensors` (variantes con CSTLinear de 128 y 256 unidades). Los tres se entrenaron desde inicialización aleatoria durante 100 épocas con semilla 17, una anchura de 256 y ventanas de tokens de 8×8. El modelo es pequeño y experimental: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y está pensado como material de comparación reproducible más que como modelo de producción.

La relevancia actual es limitada y acotada al ámbito de investigación: sirve para estudiar el impacto de sustituir operaciones de mezcla de tokens por alternativas basadas en CST en arquitecturas tipo Swin MLP, con una licencia permisiva Apache 2.0 que facilita su reutilización y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin MLP con ventanas de tokens 8×8 y anchura 256; variantes con CSTLinear en la mezcla de tokens de cada cabeza |
| Parametros totales | no disponible (solo se reportan los parámetros de peso de ventana: 49.152 en baseline, 9.216 en cst-128 y 18.432 en cst-256) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de imagen, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura base es Swin MLP, un transformer con atención restringida a ventanas locales y mezcla de tokens mediante MLP en lugar de atención completa. El modelo usa una anchura de 256 y ventanas de tokens de 8×8. La innovación del release es la sustitución de la capa lineal de mezcla de tokens de cada cabeza por una `CSTLinear` del ecosistema torchcst en las variantes cst-128 y cst-256, que reducen drásticamente el número de parámetros de peso de ventana: de 49.152 en el baseline a 9.216 (cst-128) y 18.432 (cst-256).

El entrenamiento se realizó desde inicialización aleatoria durante 100 épocas con semilla 17, usando un split de 45.000 imágenes para entrenamiento, 5.000 para validación y el split oficial de test de 10.000 imágenes de CIFAR-10. Las variantes CST usaron una tasa de aprendizaje inicial de 0.0048 para el componente Atom con decaimiento coseno. No se reportan detalles sobre aumentación de datos, optimizador, regularización ni composición adicional del dataset más allá de CIFAR-10. No hay indicios de RLHF, DPO ni ajuste por preferencias, al tratarse de un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes en las 10 clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Tres variantes de pesos intercambiables: baseline Swin MLP, CST con 128 unidades y CST con 256 unidades.
- Inferencia en CPU mediante el CLI `infer.py` incluido en el repositorio de GitHub.
- Entrenamiento reproducible con semilla fija (17) y splits documentados.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de las 10 clases de CIFAR-10.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Comparación de arquitecturas de mezcla de tokens: el modelo permite medir el impacto de sustituir la mezcla lineal por CSTLinear en un Swin MLP, con tres checkpoints y curvas de entrenamiento publicadas para reproducir el experimento.
- Investigación sobre eficiencia de parámetros: las variantes cst-128 y cst-256 reducen los parámetros de peso de ventana entre un 62% y un 81% respecto al baseline, lo que sirve para estudiar compromisos entre tamaño y precisión en modelos de visión de bajo coste.
- Docencia y experimentación con transformers de visión: el repositorio incluye código de entrenamiento, evaluación e inferencia en CPU, lo que facilita su uso en cursos y prácticas sobre arquitecturas Swin.
- Prototipado de clasificadores de imágenes de 10 clases: para tareas muy acotadas y con imágenes representativas de CIFAR-10, el checkpoint cst-256 ofrece un 83,75% de top-1 en test oficial con un coste de parámetros reducido.
- Reproducción de resultados: la semilla, los splits y la configuración de entrenamiento están documentados, lo que permite verificar los resultados publicados en la model card.
- Base para ablaciones sobre torchcst: investigadores que trabajen con la librería torchcst pueden usar estos checkpoints como referencia para nuevas variantes de mezcla de tokens.

## Benchmarks y rendimiento

| Checkpoint | Top-1 en test oficial de CIFAR-10 | Parámetros de peso de ventana |
|---|---:|---:|
| `baseline.safetensors` | 85,62% | 49.152 |
| `cst-128.safetensors` | 83,28% | 9.216 |
| `cst-256.safetensors` | 83,75% | 18.432 |

Los resultados corresponden a una única configuración de CIFAR-10 y una única semilla de entrenamiento (17), según indica el autor. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repositorio (0.0 GB) y la anchura de 256, el modelo es muy pequeño y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; dada la escala, cualquier GPU con al menos unos pocos GB de VRAM es suficiente, e incluso la inferencia en CPU está soportada mediante el CLI del repositorio.
- Cabe en GPU consumer: sí, con margen amplio; no se detallan modelos concretos.
- Opciones de despliegue: el repositorio de GitHub proporciona un CLI de inferencia en CPU (`infer.py`) y scripts de entrenamiento y evaluación; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Top-1 CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CST Swin MLP (cst-256) | no disponible (18.432 en pesos de ventana) | no aplica | 83,75% | Apache 2.0 | Hugging Face + GitHub |
| CST Swin MLP (baseline) | no disponible (49.152 en pesos de ventana) | no aplica | 85,62% | Apache 2.0 | Hugging Face + GitHub |
| Otras variantes Swin MLP para CIFAR-10 | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada; la comparativa se limita a las tres variantes del propio release.

## Limitaciones y advertencias

- El modelo solo clasifica imágenes en las 10 clases de CIFAR-10; no es un modelo de propósito general ni admite entradas de texto.
- Los resultados provienen de una única semilla (17) y una única configuración, por lo que la variabilidad entre ejecuciones no está caracterizada.
- No se reportan análisis de sesgos, robustez ante perturbaciones ni comportamiento fuera de distribución.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de clasificaciones erróneas en imágenes que no representen fielmente las clases de CIFAR-10.
- Sin datos sobre cuantización ni sobre rendimiento en otros datasets; no se recomienda su uso en producción fuera del ámbito experimental.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es experimental y no se ofrecen garantías de rendimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción nula y ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/takumiecd/cst-swin-mlp-cifar10
- Repositorio GitHub: https://github.com/takumiecd/cst-swin-mlp-cifar10
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
