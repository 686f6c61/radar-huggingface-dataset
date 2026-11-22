# Tonic/challenge5-acoustic-best-int8

## Resumen

Tonic/challenge5-acoustic-best-int8 es un modelo de clasificación de audio cuantizado a int8, publicado por el usuario Tonic en Hugging Face. No es un modelo de lenguaje: se trata de un clasificador acústico orientado a la detección de drones (C-UAS, counter-unmanned aircraft systems) y a la detección de una palabra de activación (wake word), con una tarea adicional de clasificación de sonido en cuatro clases. El modelo se distribuye en formato ONNX y TFLite, está pensado para ejecutarse con onnxruntime y se enmarca en el reto "Challenge-5" del hackathon Paris Hackathon 2026.

El repositorio tiene un tamaño declarado de 0.0 GB, no registra descargas ni likes, y el acceso está restringido (gated): es necesario aceptar las condiciones en Hugging Face para poder descargar los pesos. La licencia es Apache 2.0. No se dispone de información sobre arquitectura interna, número de parámetros ni longitud de contexto, ya que no aplica en el sentido habitual de los modelos generativos.

La relevancia de este modelo es acotada y experimental: sirve como artefacto de referencia para pipelines de detección acústica de drones en entornos con recursos limitados, gracias a su cuantización int8 y a su formato ONNX/TFLite. No debe confundirse con un modelo de propósito general ni con un sistema de producción validado externamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador acústico; no se detalla la topología interna) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantización | int8 (variante cuantizada del modelo base; se menciona una referencia fp32) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX y TFLite (ejecución vía onnxruntime) |

## Arquitectura y entrenamiento

No se dispone de información publicada sobre la arquitectura interna del modelo (tipo de red, capas, función de pérdida o estrategia de aumento de datos). Los tags indican que se trata de un modelo acústico para wake word y detección de drones, cuantizado a int8 y exportado a ONNX y TFLite para inferencia en entornos ligeros. La model card declara una referencia fp32 a partir de la cual se genera la versión int8, pero no se detallan los datos de entrenamiento, el número de horas de audio ni la composición del dataset.

El conjunto de evaluación declarado es el "Paris Hackathon 2026 Challenge-5", con 62 clips divididos en 48/8/6 (entrenamiento/validación/prueba, presumiblemente). No se documenta si hubo ajuste fino, destilación o técnicas de compresión más allá de la cuantización int8. Tampoco se especifica si el modelo incorpora innovaciones como atención lineal o decodificación especulativa, que en cualquier caso no aplicarían a un clasificador de audio de este tipo.

## Capacidades

- Clasificación acústica de audio con una salida de tipo wake word (detección de una palabra o patrón de activación).
- Clasificación de sonido en cuatro clases (4-class sound classification), según la tarea declarada en el model-index.
- Detección de drones (drone-detection) en el contexto de sistemas C-UAS.
- Inferencia cuantizada a int8 con ejecución mediante onnxruntime y soporte de formato TFLite.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües.
- No se documentan capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Detección de drones en entornos con recursos limitados: el modelo, al estar cuantizado a int8 y exportado a ONNX/TFLite, puede desplegarse en dispositivos de borde (Raspberry Pi, microcontroladores con acelerador) para monitorizar el espacio aéreo y activar alertas ante la presencia de un dron.
- Wake word en asistentes de voz embebidos: la salida de activación permite implementar un detector de palabra clave de bajo consumo en dispositivos con micrófono, sin necesidad de enviar audio a la nube.
- Clasificación de eventos sonoros en cuatro clases: útil en sistemas de monitorización ambiental o de seguridad que necesiten distinguir entre categorías acústicas predefinidas.
- Prototipado rápido en hackathons y pruebas de concepto: al estar en formato ONNX y TFLite, se integra fácilmente en pipelines de Python, C++ o Android sin dependencias pesadas.
- Filtrado previo en sistemas C-UAS de varias etapas: el modelo puede actuar como primera etapa de detección acústica y delegar en clasificadores más pesados solo los clips con alta probabilidad de dron.
- Evaluación de técnicas de cuantización: sirve como referencia para comparar el comportamiento fp32 frente a int8 en tareas de clasificación acústica, dado que la model card reporta métricas de ambas variantes.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Métrica | Valor | Verificado |
|---|---|---|
| wake F1 (referencia fp32, validación) | 0.8 | No |
| sound-class accuracy (referencia fp32, validación) | 0.875 | No |
| optical inactivity (referencia fp32, validación) | 62.5 | No |
| int8 wake logit en clip de dron c5_0002 (ORT, debe ser >= 0.05) | 35.757 | No |
| int8 class argmax en c5_0002 / c5_0001 / c5_0003 (esperado 0/3/1) | 1 | No |

No se han publicado otros resultados de benchmarks en la información disponible. El conjunto de evaluación es muy reducido (62 clips, 48/8/6), por lo que estas cifras deben interpretarse con cautela y no como evidencia de rendimiento en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo acústico cuantizado a int8 y de tamaño de repositorio 0.0 GB, es previsible que quepa en memoria de dispositivos de borde, pero no se aportan cifras.
- GPU recomendadas: no disponibles. Por el formato (ONNX/TFLite, int8), está orientado a CPU y aceleradores de borde más que a GPU de datacenter.
- Compatibilidad con GPU de consumo: no confirmada; el diseño sugiere ejecución en CPU o NPU ligeras.
- Opciones de despliegue: onnxruntime (declarado en los tags) y TFLite; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de detección acústica de drones o wake word con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento y licencia.

## Limitaciones y advertencias

- El acceso al repositorio está restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-22), lo que sugiere que no ha pasado por validación comunitaria.
- Las métricas del model-index están marcadas como no verificadas y se calculan sobre un conjunto de evaluación muy pequeño (62 clips), lo que limita su fiabilidad estadística.
- No se documentan sesgos conocidos, pero al ser un modelo acústico entrenado sobre un dataset específico de hackathon, es probable que generalice mal a condiciones acústicas, entornos o tipos de dron distintos de los de entrenamiento.
- Riesgo de falsos positivos y falsos negativos en detección de drones: no se reportan tasas de error fuera del conjunto de validación.
- No se especifican limitaciones de idioma ni de contexto porque no es un modelo lingüístico.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de documentación sobre el dataset de entrenamiento impide evaluar posibles restricciones derivadas de los datos originales.
- No apto para producción sin una validación independiente sobre datos propios y con un conjunto de evaluación representativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tonic/challenge5-acoustic-best-int8
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, papers, blogs o repositorios asociados. Los resultados de búsqueda para "Tonic" corresponden a entidades no relacionadas (Tonic App, Boutique Tonic, Tonic Web) y no aportan información sobre este modelo.
