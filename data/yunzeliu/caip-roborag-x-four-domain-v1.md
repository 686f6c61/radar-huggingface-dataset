# YunzeLiu/caip-roborag-x-four-domain-v1

## Resumen

El modelo `caip-roborag-x-four-domain-v1` es un checkpoint de CAIP (Cross-Attention Image-Action Pretraining) desarrollado por YunzeLiu, investigador de la Universidad de Tsinghua. Se trata de un modelo de embeddings multimodales orientado a robótica, que codifica simultáneamente imágenes, instrucciones de texto y acciones de manipulación en un espacio latente compartido. Su propósito principal es servir como referencia controlada para comparar representaciones con el dataset sellado RoboRAG-X y con el encoder CAIP original.

La arquitectura es `ViT-L-16-CrossAttn-256`, la misma topología del CAIP upstream, con torres de imagen y texto inicializadas desde `ViT-L-16-SigLIP2-256` / `webli`. El modelo contiene 929.233.922 parámetros de inferencia y se distribuye en formato PyTorch/OpenCLIP nativo, no como paquete de Transformers. El checkpoint corresponde a una única época completa de entrenamiento sobre el pool de datos de cuatro dominios: EgoDex, DROID, LIBERO y RoboMIND-Franka-Dual. Es relevante para investigación en alineación imagen-acción y evaluación de representaciones robóticas, aunque no se publican métricas de rendimiento downstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-L-16-CrossAttn-256 (topología CAIP) |
| Parametros totales | 929.233.922 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch/OpenCLIP nativo (.pt) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de CAIP upstream: un encoder de imagen/texto basado en ViT-L-16 con atención cruzada y un módulo de codificación de acciones. Las torres de imagen y texto se inicializan desde `ViT-L-16-SigLIP2-256` / `webli`, mientras que los módulos de acción y cross-attention se crean nuevos. El modelo no introduce innovaciones arquitectónicas; el cambio respecto al CAIP original está en los datos de entrenamiento y en los adaptadores de acción.

El entrenamiento se realizó durante una época completa sobre un pool sellado de 1.695.684 ventanas, con un muestreo ponderado por dominio en proporción 20:10:35:35 (EgoDex:DROID:LIBERO:RoboMIND). El proceso constó de 26.275 pasos de optimizador con un batch global efectivo de 512 y un total de 13.452.800 presentaciones de muestra. La entrada de imagen es el zoom de interacción de objeto SAM3 en el instante actual, preprocesado según la validación de CAIP. La entrada de texto es la instrucción sellada usada por el pooler de imagen condicionado por texto. El objetivo de acción es la acción futura estricta de 4 segundos, remuestreada a 64 pasos y con los canales nativos copiados y rellenados con ceros hasta 378 dimensiones. La normalización aplica estadísticas por dominio q01/q99 heredadas del release sellado RoboRAG-X. La función de pérdida es la pérdida contrastiva SigLIP de imagen-acción de CAIP. Los valores de pérdida registrados al final (instantánea 0.137230, acumulada 0.510180) son diagnósticos de entrenamiento, no métricas de precisión de recuperación ni de éxito robótico.

## Capacidades

- Extracción de características multimodales: genera embeddings conjuntos de imagen, texto y acción para tareas robóticas.
- Representaciones de interacción objeto-manipulación, entrenadas sobre datos de EgoDex, DROID, LIBERO y RoboMIND-Franka-Dual.
- Alineación imagen-acción mediante pérdida contrastiva SigLIP, útil para recuperación de demostraciones y comparación de representaciones.
- No es un modelo generativo de texto ni de código; no produce respuestas en lenguaje natural.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de un agente conversacional.
- Capacidades multilingües: no especificadas en la documentación.
- Sin modo de pensamiento (thinking) ni capacidades de visión generativa o audio.

## Casos de uso

- Evaluación comparativa de representaciones robóticas: usar este checkpoint como referencia controlada para comparar embeddings con RoboRAG-X y CAIP upstream en estudios de ablación.
- Recuperación de demostraciones en bases de datos de manipulación: dado un estado actual (imagen e instrucción), recuperar la acción futura más similar en el espacio latente para reutilizar demostraciones.
- Aprendizaje por imitación de bajo nivel: extraer embeddings de acciones e imágenes para entrenar políticas de manipulación en entornos como LIBERO o RoboMIND.
- Transferencia entre dominios: evaluar si los embeddings de acción aprendidos en un dominio (por ejemplo, DROID) generalizan a otro (por ejemplo, LIBERO) mediante métricas de alineación.
- Investigación en alineación imagen-acción: analizar la estructura del espacio latente y la calidad de la pérdida contrastiva en tareas de manipulación.
- Auditoría de datos de demostraciones: proyectar y visualizar embeddings de acciones de distintos dominios para detectar inconsistencias de normalización o de semántica de coordenadas.
- Desarrollo de sistemas de grounding de objetos: combinar el modelo con SAM3 para generar embeddings de interacción objeto-manipulación a partir de imágenes de vídeo egocéntrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model card únicamente proporciona valores de pérdida de entrenamiento (pérdida contrastiva instantánea 0.137230 y pérdida acumulada 0.510180), que son diagnósticos de entrenamiento y no representan precisión de recuperación, exactitud de tareas ni tasa de éxito robótico. Por tanto, no es posible comparar este modelo con otros mediante métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Estimación orientativa de VRAM: con 929.233.922 parámetros, el checkpoint de inferencia ocupa 3.717.211.929 bytes (~3,7 GB) en FP32. En FP16, los pesos ocuparían aproximadamente 1,9 GB, más los activaciones y buffers del modelo.
- GPU recomendadas: no se han publicado requisitos oficiales. Dado el tamaño, cualquier GPU con al menos 4 GB de VRAM en FP32 o 2-4 GB en FP16 podría ser suficiente para inferencia básica, aunque no hay confirmación oficial.
- Compatibilidad con GPU de consumo: probablemente sí, al tratarse de un modelo de menos de mil millones de parámetros, pero no hay datos oficiales de pruebas.
- Opciones de despliegue: al ser checkpoints PyTorch/OpenCLIP nativos, se cargan directamente con la implementación de CAIP/OpenCLIP del repositorio VLA2Vec. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje generativos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| caip-roborag-x-four-domain-v1 | 929.233.922 | no disponible | MIT | HuggingFace |
| yuvansharma/caip-vitl256 (CAIP upstream) | no disponible | no disponible | no disponible | HuggingFace |
| RoboRAG-X (dataset sellado) | no aplica | no aplica | no disponible | no disponible |

La comparativa se limita a CAIP upstream, que comparte la misma arquitectura y objetivo, aunque entrenado con datos distintos. No se dispone de datos suficientes para comparar rendimiento, contexto o licencia de CAIP upstream. RoboRAG-X es un dataset, no un modelo comparable. No se conocen otras alternativas de la misma categoría con datos públicos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de una sola época; no se hace ninguna afirmación de rendimiento downstream ni de éxito físico en robots.
- Las coordenadas de acción entre dominios no comparten semántica física únicamente por ocupar el mismo ancho de padding. Es imprescindible seleccionar el mapeo de dominio y la normalización correctos.
- Las imágenes de consulta asumen un grounding de objeto SAM3 utilizable. Si el grounding falla, se debe remuestrear un frame cercano antes de generar el embedding.
- Los términos del dataset, SigLIP2 y CAIP upstream siguen aplicando. Cualquier uso en políticas debe validarse bajo la pila de seguridad del robot objetivo.
- No es un modelo de lenguaje general; no sirve para generación de texto, respuesta a preguntas ni tareas de razonamiento simbólico.
- No se han publicado métricas de robustez, sesgos o alucinaciones, por lo que su comportamiento en escenarios no contemplados es desconocido.
- La licencia MIT cubre el código y los pesos, pero los componentes upstream (SigLIP2, CAIP) pueden tener condiciones adicionales.

## Enlaces

- HuggingFace: https://huggingface.co/YunzeLiu/caip-roborag-x-four-domain-v1
- Repositorio VLA2Vec (implementación CAIP/OpenCLIP): https://github.com/yunzeliu/VLA2Vec/tree/caip-roborag-x-four-domain
- CAIP upstream: https://huggingface.co/yuvansharma/caip-vitl256
- Página personal de Yunze Liu: https://yunzeliu.github.io/index.html
