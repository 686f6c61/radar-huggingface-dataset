# wangzhang/Qwen3.8-27B-abliterated

## Resumen

El modelo `wangzhang/Qwen3.8-27B-abliterated` es una versión modificada del modelo Qwen/Qwen3.8-27B, desarrollada por el autor wangzhang mediante una técnica de "abliteración" (abliteration) en dos pasadas. La abliteración consiste en eliminar o atenuar las direcciones de activación asociadas al comportamiento de rechazo (refusals) en modelos de lenguaje, con el objetivo de reducir la probabilidad de que el modelo se niegue a responder a ciertas instrucciones. Este modelo concreto se ha construido con el flujo de trabajo `abliterix`, que combina búsqueda de transformaciones directas y extracción de direcciones residuales.

El modelo resultante conserva la arquitectura y los pesos del modelo base Qwen/Qwen3.8-27B, que es un modelo multimodal (image-text-to-text) de aproximadamente 27.360 millones de parámetros, liberado bajo licencia Apache-2.0. La relevancia de esta ficha radica en que ejemplifica una tendencia creciente en la comunidad open source de modificar modelos para reducir su comportamiento de rechazo, lo que plantea tanto oportunidades de investigación como riesgos de seguridad. El modelo se distribuye en formato safetensors y es directamente cargable con Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada del modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | No disponible (no se especifica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene solo safetensors en BF16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura exacta no se detalla en la información proporcionada, pero al ser una abliteración del modelo base Qwen/Qwen3.8-27B, hereda su arquitectura, que probablemente sea un transformer multimodal con capacidad de procesar imágenes y texto (pipeline image-text-to-text). El proceso de abliteración se realizó en dos pasadas con el flujo `abliterix`:

- **Primera pasada**: se buscaron transformaciones directas sobre los pesos y se seleccionó una dirección de rechazo (ORBA) con una fuerza pico de 4.5 en la proyección de salida de atención.
- **Segunda pasada**: se extrajo una nueva dirección residual de rechazo a partir del modelo fusionado de la primera pasada, y se aplicó una búsqueda de 60 ensayos (trial 57 seleccionado) con un perfil de fuerza lineal que alcanza un máximo de 3.0 en la posición 60, ratio mínimo/máximo de 0.5 y distancia 20.

No se especifican los datos de entrenamiento originales del modelo base, ni si hubo RLHF o DPO. La abliteración no es un entrenamiento convencional, sino una modificación de los pesos existentes.

## Capacidades

No se dispone de información detallada sobre las capacidades específicas del modelo más allá de lo que hereda del base. Según el pipeline declarado (image-text-to-text), el modelo puede procesar tanto imágenes como texto. La modificación de abliteración reduce la tasa de rechazo ante instrucciones, pero no se documentan otras capacidades como generación de código, razonamiento matemático o tool calling. Se puede asumir que conserva las capacidades del modelo base, pero no hay datos confirmados.

## Casos de uso

Dado que el modelo está diseñado para reducir rechazos, sus aplicaciones potenciales son principalmente de investigación y experimentación:

- **Investigación en alineación y seguridad**: permite estudiar cómo la abliteración afecta al comportamiento de rechazo y a las capacidades del modelo, comparando con el modelo base.
- **Evaluación de técnicas de des-rechazo**: sirve como banco de pruebas para medir la eficacia de métodos de abliteración en modelos de 27B.
- **Análisis de riesgos en IA generativa**: facilita el estudio de escenarios donde un modelo sin restricciones puede generar contenido dañino, útil para desarrollar contramedidas.
- **Desarrollo de sistemas de moderación**: al conocer los puntos débiles de un modelo abliterado, se pueden diseñar filtros y salvaguardas externas más robustas.
- **Entrenamiento de modelos más seguros**: los datos de evaluación de refusals pueden utilizarse para mejorar técnicas de alineación que reduzcan la necesidad de rechazo explícito.
- **Investigación en interpretabilidad**: el análisis de las direcciones de activación modificadas puede revelar cómo se codifica el comportamiento de rechazo internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la tasa de rechazo sobre 100 prompts dañinos y 100 benignos, medida con un juez LLM:

| Etapa | Rechazos (sobre 100 dañinos) | Divergencia KL |
|---|---|---|
| Candidato seleccionado en pasada 1 | 26/100 | 0.2730 vs. modelo original |
| Re-evaluación de pasada 1 como base de pasada 2 | 21/100 | — |
| Candidato final de pasada 2 (trial 57) | 14/100 | 0.0091 incremental vs. pasada 1 |

El juez es no determinista, lo que explica la variación de 26 a 21 en la re-evaluación. No hay comparación con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos oficiales. Dado que el modelo tiene 27.356 millones de parámetros y los pesos están en BF16 (tamaño del repo 54.7 GB), se pueden estimar los siguientes requisitos orientativos:

- **VRAM para inferencia en BF16**: aproximadamente 55-60 GB (pesos + overhead de activaciones). Requiere una GPU con al menos 60 GB, como NVIDIA A100 80GB o H100 80GB, o varias GPUs en paralelo.
- **VRAM con cuantización**: no se ofrecen versiones cuantizadas en el repositorio, pero si se convirtiera a 8 bits (int8) necesitaría ~28 GB, y a 4 bits ~14 GB, lo que permitiría ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o incluso RTX 3090 (24 GB) con 4 bits.
- **Opciones de despliegue**: al ser compatible con Transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte oficial documentado para otras herramientas.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (abliteraciones de Qwen3.8-27B o similares). La base Qwen/Qwen3.8-27B es el único punto de referencia, pero no se conocen otras abliteraciones del mismo modelo publicadas.

## Limitaciones y advertencias

- **Riesgo de contenido dañino**: el modelo fue modificado intencionalmente para reducir el comportamiento de rechazo. Puede cumplir con solicitudes inseguras, ilegales o dañinas con mayor facilidad que el modelo base.
- **Falta de evaluación de capacidades**: la abliteración puede alterar las capacidades del modelo en formas no capturadas por la evaluación limitada (solo se midieron refusals y KL). No hay benchmarks de razonamiento, código o matemáticas.
- **Evaluación no determinista**: el juez LLM usado para clasificar rechazos es no determinista, lo que introduce incertidumbre en los resultados reportados.
- **Sin datos de idiomas**: no se especifican los idiomas soportados, aunque el modelo base probablemente sea multilingüe.
- **Restricciones de uso comercial**: la licencia Apache-2.0 permite uso comercial, pero el despliegue en entornos no controlados es desaconsejado por el autor.
- **Advertencia del autor**: no debe desplegarse como endpoint público sin salvaguardas independientes, control de accesos, monitorización y evaluación específica de la tarea.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/wangzhang/Qwen3.8-27B-abliterated)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
