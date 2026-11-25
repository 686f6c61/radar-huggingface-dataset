# Tonic/drone-detectonic-0.1-int8

## Resumen

Drone-detectonic-0.1-int8 es un modelo de clasificación acústica cuantizado a int8, publicado por el usuario Tonic bajo licencia Apache 2.0. No se trata de un modelo de lenguaje, sino de un detector de audio orientado a la identificación de drones y a la clasificación de eventos sonoros en cuatro clases, con una función adicional de "acoustic wake" (activación por palabra o sonido clave). El modelo se distribuye en formatos ONNX y TFLite, lo que lo hace apto para inferencia en dispositivos de borde y entornos con recursos limitados.

El modelo está vinculado al reto Challenge-5 del Paris Hackathon 2026, según los tags y la model-index de su model card. Su relevancia actual radica en el ámbito de la detección de sistemas aéreos no tripulados (C-UAS, counter-UAS): un clasificador acústico ligero y cuantizado permite desplegar vigilancia sonora en hardware de bajo consumo, sin depender de GPUs de datacenter ni de servicios en la nube.

La información pública disponible es muy escasa: el repositorio ocupa 0.0 GB, no se declara pipeline, no se especifican idiomas y el acceso está restringido (gated), requiriendo aceptar condiciones en Hugging Face. No se dispone de detalles sobre la arquitectura interna, el volumen de entrenamiento ni la composición del dataset más allá de la referencia al hackathon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de clasificación acústica; pesos exportados a ONNX y TFLite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | int8 (variante cuantizada del modelo base; se menciona una referencia fp32) |
| Idiomas soportados | no disponible (modelo de audio, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (onnxruntime), TFLite; variante int8 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo en la documentación disponible. Por el tipo de tarea (clasificación acústica con activación por wake word y cuatro clases de sonido) y por los formatos de exportación (ONNX y TFLite), cabe inferir un modelo convolucional o un transformer ligero orientado a espectrogramas de audio, pero esta inferencia no está confirmada por el autor y debe tratarse como no verificada.

Respecto al entrenamiento, la única referencia es el dataset del Paris Hackathon 2026 Challenge-5, descrito en la model-index como un conjunto de 62 clips divididos en 48/8/6 (entrenamiento/validación/prueba). No se especifican el número de tokens o muestras de audio, la composición exacta del corpus, ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino. La model-index menciona una "referencia fp32" frente a la cual se comparan los resultados de la variante int8, lo que sugiere un proceso de cuantización post-entrenamiento (PTQ) a partir de un modelo en precisión completa.

## Capacidades

- Clasificación acústica de cuatro clases de sonido, según la tarea declarada "Acoustic wake + 4-class sound classification".
- Detección de activación acústica ("acoustic wake"), orientada a disparar el pipeline de inferencia ante un sonido clave.
- Detección de drones (tag "drone-detection" y "c-uas"), con logits de activación específicos para clips de drone.
- Inferencia en formato ONNX mediante onnxruntime y en formato TFLite, lo que habilita despliegue en dispositivos móviles y embebidos.
- Cuantización int8 para reducir requisitos de memoria y cómputo.
- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes; el modelo es exclusivamente de clasificación de audio.

## Casos de uso

- Vigilancia acústica perimetral contra drones: el modelo puede ejecutarse en un nodo de borde con ONNX Runtime o TFLite para detectar la firma sonora de un dron y activar una alerta, sin enviar audio a la nube.
- Dispositivos de borde con recursos limitados: la variante int8 y los formatos ONNX/TFLite permiten integrar el clasificador en microcontroladores o SBCs (por ejemplo, Raspberry Pi o placas con acelerador NPU) donde un modelo fp32 no cabría.
- Activación por sonido clave en asistentes embebidos: la función "acoustic wake" permite que un dispositivo permanezca en modo de bajo consumo hasta que se detecte el sonido de activación, reduciendo el consumo energético.
- Monitorización medioambiental y de ruido urbano: la clasificación en cuatro clases puede emplearse para etiquetar eventos sonoros en sensores desplegados en exteriores, con la ventaja de que el modelo es ligero y de licencia permisiva.
- Prototipado rápido en investigación C-UAS: al estar bajo Apache 2.0 y en formatos estándar, sirve como línea base reproducible para comparar pipelines de detección acústica de drones en experimentos académicos.
- Integración en pipelines de hackathon o demos: el modelo está pensado para el Paris Hackathon 2026 Challenge-5, por lo que encaja en prototipos de clasificación de audio de extremo a extremo con presupuesto de cómputo mínimo.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model-index de la model card; ninguno está verificado de forma independiente.

| Metrica | Valor | Conjunto | Verificado |
|---|---|---|---|
| wake F1 (referencia fp32, validación) | 0.8 | Challenge-5 (valid) | No |
| sound-class accuracy (referencia fp32, validación) | 0.875 | Challenge-5 (valid) | No |
| optical inactivity (referencia fp32, validación) | 62.5 | Challenge-5 (valid) | No |
| int8 wake logit en clip de drone c5_0002 (ORT, umbral >= 0.05) | 35.757 | Clip c5_0002 | No |
| int8 class argmax en c5_0002 / c5_0001 / c5_0003 (esperado 0/3/1) | 1 (acierto total) | Clips c5_0001–c5_0003 | No |

Advertencia: el conjunto de validación consta de solo 8 clips y el de prueba de 6, por lo que las métricas tienen una varianza muy alta y no son extrapolables a un rendimiento en producción. La métrica "optical inactivity" aparece con un valor de 62.5 sin unidad clara (posiblemente porcentaje), lo que dificulta su interpretación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo int8 en ONNX/TFLite y con un repositorio de 0.0 GB, es previsible que quepa en memoria de dispositivos de borde, pero no se publica el tamaño exacto de los pesos.
- GPU recomendadas: no disponible; por el formato y la cuantización, el modelo está pensado para CPU, GPU integrada o NPU de borde más que para GPUs de datacenter.
- ¿Cabe en GPU de consumo? No se dispone de datos de tamaño que permitan confirmarlo; los formatos TFLite/ONNX int8 apuntan a despliegue en CPU y aceleradores embebidos.
- Opciones de despliegue: ONNX Runtime (onnxruntime) y TFLite son los entornos declarados por los tags y la librería. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada, ni de métricas homogéneas que permitan una comparación rigurosa. La model-index solo referencia la propia variante fp32 del mismo modelo como línea base.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tonic/drone-detectonic-0.1-int8 | Clasificador acústico int8 (ONNX/TFLite) | no disponible | no aplica | Apache 2.0 | Gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Dataset de evaluación mínimo: 62 clips en total (48/8/6); las métricas declaradas no son estadísticamente representativas y no deben tomarse como indicador de rendimiento en producción.
- Resultados no verificados: todas las métricas de la model-index tienen `verified: false`; proceden del propio autor.
- Falta de documentación técnica: no se publican arquitectura, número de parámetros, composición del dataset de entrenamiento ni detalles de la cuantización.
- Riesgo de falsos positivos y negativos: un clasificador acústico de cuatro clases entrenado con pocos clips puede confundir drones con otros sonidos (tráfico, electrodomésticos, fauna) en entornos reales.
- Dependencia del dominio: el rendimiento puede degradarse ante condiciones acústicas distintas de las del hackathon (ruido de fondo, distancia, tipo de dron, micrófono).
- Sin soporte lingüístico ni de texto: no es adecuado para tareas de NLP, generación ni razonamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo antes de integrarlo en sistemas críticos de seguridad.
- Uso en seguridad: la detección acústica de drones puede estar sujeta a regulación sobre vigilancia y privacidad según la jurisdicción; verificar el cumplimiento normativo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1-int8
- Tonic App (posible organización, no confirmada como autora del modelo): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- ToNIC - Toulouse Neuro Imaging Center (posible homónimo, no relacionado): https://tonic.inserm.fr/
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos específicos del modelo.
