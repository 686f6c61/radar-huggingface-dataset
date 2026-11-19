# woooooz/Nexus-Bidirectional-EgoNCE

## Resumen

Nexus-Bidirectional-EgoNCE no es un modelo de pesos entrenado, sino un conjunto de parches de código y fragmentos de configuración para el pipeline de entrenamiento de embeddings multimodales Nexus. Lo publica el usuario woooooz en Hugging Face y su propósito es añadir una pérdida de recuperación bidireccional (query a vídeo y vídeo a query) con soporte de EgoNCE (multi-positivo) al entrenamiento de recuperación texto-vídeo. El problema que aborda es que el flujo original de Nexus solo optimizaba la dirección query a vídeo, dejando sin señal explícita la dirección inversa.

El repositorio contiene dos parches: uno que introduce el peso `video_to_query_loss_weight` y la pérdida cruzada inversa reutilizando la matriz de similitud ya calculada, y otro que extiende el soporte multi-positivo EgoNCE a la rama de captions en ambos sentidos. La pérdida principal queda formulada como `(L_q2v + w * L_v2q) / (1 + w)`, con peso por defecto 0 para el término inverso, de modo que el comportamiento original se preserva salvo que se active explícitamente.

La relevancia es acotada pero concreta: para equipos que ya trabajan sobre un checkout de Nexus con la rama de captions multi-positivo, estos parches permiten experimentar con simetría de la pérdida sin reescribir el runner. No hay pesos publicados, ni benchmarks de recuperación, ni datos de rendimiento en GPU; la validación reportada es exclusivamente de tests unitarios y de gradientes en CPU/DDP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (parche de entrenamiento sobre el pipeline Nexus; no se publican pesos ni arquitectura del modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | nexus-license (licencia propia referenciada en `LICENSE`; Hugging Face la etiqueta como `other`) |
| Formato de pesos | no disponible (el repositorio contiene parches `.patch` y fragmentos de configuración `.json`, no pesos) |

## Arquitectura y entrenamiento

El contenido del repositorio es un conjunto de modificaciones sobre el código de entrenamiento de Nexus para recuperación multimodal. La pérdida original opera sobre una matriz de similitud de forma `[B, B*G]`, donde B es el número de queries del batch y G el número de candidatos por query, ordenados como `[vídeo positivo, vídeos negativos, ...]`. El parche 01 añade la dirección inversa extrayendo la primera columna de cada grupo, transponiéndola a forma `[B, B]`, y calculando una entropía cruzada en la que cada vídeo positivo compite contra todas las queries del batch. Los negativos explícitos solo participan en la dirección directa, y ambos sentidos comparten la misma codificación y, si se activan negativos entre GPUs, el mismo batch global.

El parche 02 extiende el soporte EgoNCE a la rama de captions en ambas direcciones, reutilizando `caption_positive_loss()` y los identificadores de caption ya recopilados. Con EgoNCE, dos queries con el mismo caption ID se consideran mutuamente positivas respecto a los vídeos emparejados; la coincidencia de caption ID se determina por igualdad exacta del texto tras aplicar la instrucción de la aplicación y el título. Se soportan dos modos: `egonce`, que maximiza la suma de probabilidades sobre todos los positivos, y `mean_ce`, que promedia la entropía cruzada entre positivos. La opción `caption_group_normalize` promedia primero dentro de cada grupo de caption y después entre grupos, en cada dirección por separado. La pérdida total es `(L_q2v + w * L_v2q) / (1 + w)`, con las pérdidas locales auxiliares sumadas después de la media ponderada.

La validación reportada el 2026-11-19 consiste en 183 tests superados y 2 fallos por aserciones preexistentes (image root y source schedule key), más 15 combinaciones de CE, EgoNCE y mean-CE ejecutadas en CPU con dos procesos DDP, cubriendo captions duplicadas entre ranks, valores de pérdida y gradientes. El propio autor indica que el entrenamiento real en GPU y las métricas de recuperación quedan pendientes de verificar.

## Capacidades

- Añadir una pérdida inversa vídeo-a-query al entrenamiento de recuperación texto-vídeo de Nexus, con peso configurable mediante `video_to_query_loss_weight`.
- Soportar pérdida multi-positivo EgoNCE en ambas direcciones, con dos modos de agregación (`egonce` y `mean_ce`).
- Gestionar positivos compartidos por caption ID, incluyendo captions duplicadas entre distintos ranks de un entrenamiento distribuido.
- Reutilizar la matriz de similitud y los embeddings ya calculados, sin codificaciones adicionales.
- Funcionar con negativos in-batch y con negativos globales entre GPUs.
- Aplicar la normalización por grupos de caption de forma independiente en cada dirección.
- Permitir un modo de control unilateral fijando el peso inverso a 0.
- No incluye capacidades de inferencia: no hay generación de texto, tool calling, agentes, visión ni modo thinking asociados a este repositorio.

## Casos de uso

- Investigación en recuperación texto-vídeo simétrica: un equipo que ya entrena sobre Nexus puede activar la pérdida inversa con `w=1` para estudiar si la simetría mejora el recall vídeo-a-texto sin cambiar el resto del pipeline.
- Ablación controlada de la dirección inversa: fijar `video_to_query_loss_weight` a 0 reproduce el comportamiento original y sirve como línea base frente a valores intermedios, aislando el efecto del término `L_v2q`.
- Entrenamiento con captions repetidas: cuando varias queries comparten caption ID y apuntan a vídeos distintos, EgoNCE evita tratarlas como negativas entre sí, lo que es habitual en datasets de vídeo con descripciones genéricas.
- Ajuste de recuperación en datasets de egocentrismo: las etiquetas `egonce` del repositorio sugieren su uso en corpus donde la misma escena se describe con múltiples captions, y el modo multi-positivo agrupa esas variantes.
- Experimentos de normalización por grupos: `caption_group_normalize` permite comparar si promediar dentro del grupo antes de promediar entre grupos estabiliza el gradiente cuando hay desbalance entre captions frecuentes y raras.
- Reproducción de resultados en clúster multi-GPU: los tests DDP con dos procesos y el soporte de negativos entre ranks permiten validar la implementación antes de lanzar entrenamientos completos en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta resultados de tests: 183 pruebas superadas y 2 fallos por aserciones preexistentes, además de 15 combinaciones de pérdida verificadas en CPU con `torch.distributed.run` a 2 procesos. No hay métricas de recuperación (R@1, R@5, mAP) ni cifras de throughput o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el repositorio no contiene pesos desplegables.
- VRAM para entrenamiento: no disponible; depende del modelo base de Nexus y del tamaño de batch, que no se especifican.
- GPU recomendadas: no disponible. La validación reportada se ejecutó en CPU con backend Gloo (`GLOO_SOCKET_IFNAME=lo`), no en GPU.
- Compatibilidad con GPU de consumo: no determinable sin conocer el modelo base.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes para un parche de entrenamiento).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables, dado que el artefacto publicado es un parche de código de entrenamiento y no un modelo con pesos. La comparación natural sería con la versión sin parchear de Nexus (dirección única, sin EgoNCE bidireccional), que el propio repositorio usa como línea base al permitir `video_to_query_loss_weight = 0`.

## Limitaciones y advertencias

- No es un modelo: no se pueden descargar pesos ni ejecutar inferencia. Cualquier uso requiere un checkout previo de Nexus con `caption_positive.py` y la rama de captions multi-positivo ya presentes.
- El entrenamiento real en GPU y las métricas de recuperación no están verificados; la validación se limita a tests de configuración, pérdida y gradientes en CPU.
- Dos tests fallan por aserciones preexistentes (image root y source schedule key), lo que indica que el checkout de referencia no está completamente limpio.
- Incompatibilidades declaradas: destilación de conocimiento (KD), modo de negativos solo intragrupo y modo multi-positivo con grupos variables son mutuamente excluyentes con esta funcionalidad.
- El modo EgoNCE requiere coincidencia exacta de caption ID tras aplicar la instrucción y el título; captions distintas para el mismo vídeo no se fusionan salvo que se aporten video IDs o etiquetas de relevancia adicionales.
- Los negativos explícitos solo afectan a la dirección directa, de modo que la dirección inversa se apoya únicamente en negativos in-batch o globales.
- Licencia `nexus-license` propia: es necesario revisar `LICENSE` antes de cualquier uso comercial, ya que las condiciones no se detallan en la model card.
- El repositorio tiene 0 descargas y 0 likes, sin señales de adopción ni mantenimiento por parte de terceros.
- La fecha de creación (2026-11-19) y la ausencia de idiomas declarados impiden evaluar cobertura multilingüe.

## Enlaces

- Hugging Face: https://huggingface.co/woooooz/Nexus-Bidirectional-EgoNCE
- Parche de pérdida inversa: `patches/01-add-video-to-query.patch` (referenciado en el repositorio)
- Parche EgoNCE bidireccional: `patches/02-support-bidirectional-egonce.patch` (referenciado en el repositorio)
- Configuración de entrenamiento: `config/training.bidirectional-egonce.json` (referenciado en el repositorio)
- Configuración de datos: `config/data.in-batch.json` (referenciado en el repositorio)
- Licencia: `LICENSE` (referenciado en el repositorio)
- Tests: `tests/multimodal_retrieval/test_video_to_query_loss.py`, `tests/multimodal_retrieval/test_caption_multi_positive.py`, `tests/multimodal_retrieval/check_video_to_query_cross_device.py`
