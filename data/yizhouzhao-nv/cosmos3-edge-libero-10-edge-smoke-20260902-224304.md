# yizhouzhao-nv/cosmos3-edge-libero-10-edge-smoke-20260902-224304

## Resumen

Este repositorio contiene un checkpoint de *smoke test* de un fine-tuning de Cosmos3-Edge, el modelo de mundo omnimodal de NVIDIA de 4B parámetros, especializado como política de acción robótica sobre el benchmark LIBERO-10. El autor, `yizhouzhao-nv` (usuario de NVIDIA), ha realizado un ajuste fino supervisado (SFT) sobre el dataset `nvidia/LIBERO_LeRobot_v3` (suite `libero_10`, 379 trayectorias) durante 20 iteraciones, con el objetivo de validar el pipeline de entrenamiento, no de obtener un modelo convergido.

La relevancia de este checkpoint reside en que demuestra el flujo completo de entrenamiento de una política de acción con Cosmos3-Edge usando `cosmos-framework`, incluyendo la configuración exacta, la receta de experimento y los normalizadores de acción. Es útil para desarrolladores que quieran verificar la integración de Cosmos3-Edge en sus propios pipelines de robótica antes de lanzar entrenamientos a gran escala. El modelo base, Cosmos3-Edge, es un transformer multimodal de 4B parámetros que procesa texto, imágenes, vídeo, audio y acciones, y forma parte de la familia Cosmos 3 de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (omnimodal) de 4B parámetros (modelo base Cosmos3-Edge) |
| Parametros totales | 4B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo pesos DCP sin cuantizar) |
| Idiomas soportados | No disponibles |
| Licencia | other (no especificada; consultar la licencia del modelo base `nvidia/Cosmos3-Edge`) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) |

## Arquitectura y entrenamiento

El modelo base Cosmos3-Edge es un transformer multimodal de 4B parámetros diseñado para conectar comprensión, generación, simulación y acción a través de texto, imágenes, vídeo, audio y acciones. El fine-tuning presentado en este repositorio aplica SFT sobre el dataset `nvidia/LIBERO_LeRobot_v3`, concretamente la suite `libero_10` con 379 trayectorias, durante 20 iteraciones. El entrenamiento se realizó en un nodo con 8x H100 80GB, y se aplicaron dos desviaciones forzadas por el entorno respecto a la receta de referencia: el uso de `AdamW` (con `fused=true`) en lugar de `FusedAdam` de transformer-engine, debido a la falta de una build ABI compatible con torch-2.13; y la desactivación de `torch.compile` por un bug de Dynamo al trazar el backend Hopper FMHA de NATTEN en H100.

El repositorio contiene únicamente los pesos del modelo en formato DCP (sin estado de optimizador ni scheduler), junto con el archivo de configuración `action_policy_libero_10_edge.toml`, la receta `action_policy_libero_edge.py` y el normalizador de acciones `libero_native_frame_wise_relative_rot6d.json` (espacio de pose `frame_wise_relative`, rot6d, normalización `quantile_rot`). Este normalizador es imprescindible para decodificar las salidas de la política.

## Capacidades

- Generación de acciones de robot: el modelo está entrenado para producir comandos de pose relativa (rot6d) a partir de observaciones multimodales, siguiendo el formato de LIBERO-10.
- Comprensión multimodal heredada: al estar basado en Cosmos3-Edge, conserva la capacidad de procesar imágenes, vídeo, texto y audio, aunque el fine-tuning no ha sido evaluado en estas tareas.
- Integración con `cosmos-framework`: puede cargarse mediante el servidor de política de acción (`action_policy_server_libero`) para inferencia en entornos robóticos.
- Soporte de normalización de acciones: incluye el normalizador específico necesario para decodificar las salidas en el espacio de pose definido.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso en este checkpoint.
- No se especifican capacidades multilingües.

## Casos de uso

- Validación de pipeline de entrenamiento: este checkpoint sirve para verificar que el flujo SFT con Cosmos3-Edge y `cosmos-framework` funciona correctamente antes de lanzar entrenamientos largos y costosos.
- Prueba de integración con `cosmos-framework`: permite comprobar que el servidor de política de acción carga correctamente los pesos DCP y que el normalizador de acciones se aplica bien.
- Depuración de configuraciones: útil para probar cambios en la receta de entrenamiento, en el normalizador o en los hiperparámetros sin necesidad de un entrenamiento completo.
- Evaluación preliminar de la arquitectura: se puede medir la latencia de inferencia, el uso de memoria y el throughput en un entorno de prueba con H100 u otras GPUs.
- Desarrollo de herramientas de visualización: permite inspeccionar las salidas del modelo en tareas de LIBERO-10 para depurar el comportamiento de la política.
- Formación de equipos: sirve como ejemplo práctico de un checkpoint de política de acción robótica para que nuevos desarrolladores aprendan el flujo de trabajo con Cosmos3-Edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El checkpoint es un *smoke test* de 20 iteraciones, por lo que no se espera un rendimiento convergido en tareas de LIBERO-10.

## Requisitos de hardware

- Entrenamiento: se realizó en un nodo con 8x H100 80GB (según la model card).
- Inferencia: no se especifican requisitos de VRAM. Dado que el modelo base tiene 4B parámetros, en FP16 ocuparía aproximadamente 8GB, pero no hay confirmación para este checkpoint.
- GPU recomendadas: H100 (usada en entrenamiento); no se indica compatibilidad con GPUs consumer.
- Opciones de despliegue: `cosmos-framework` (servidor `action_policy_server_libero`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Cosmos3-Edge LIBERO-10 smoke) | 4B | No disponible | SFT sobre LIBERO-10 (379 trayectorias, 20 iteraciones) | other | Repo público HF |
| `nvidia/Cosmos3-Edge` (base) | 4B | No disponible | Preentrenamiento multimodal | other (NVIDIA) | HF público |
| `nvidia/Cosmos3-Edge-Policy-DROID` | 4B | No disponible | SFT sobre DROID | other (NVIDIA) | HF público |

No se dispone de datos de rendimiento comparativos. La comparativa se limita a parámetros y disponibilidad, ya que no hay información sobre benchmarks de ninguno de los modelos.

## Limitaciones y advertencias

- Checkpoint de *smoke test*: entrenado solo 20 iteraciones, no convergido, no apto para uso en producción ni para evaluaciones de rendimiento.
- Licencia "other" no especificada: el autor no detalla los términos; se recomienda revisar la licencia del modelo base `nvidia/Cosmos3-Edge` antes de cualquier uso comercial.
- Sesgos y alucinaciones: no se documentan sesgos específicos, pero al ser un modelo multimodal preentrenado, puede heredar sesgos de sus datos de entrenamiento. En el contexto de acciones robóticas, existe riesgo de generar comandos inválidos o inseguros.
- Limitaciones de contexto e idioma: no se especifican; el modelo está orientado a tareas de robótica con observaciones visuales y textuales en inglés (dataset LIBERO).
- Dependencia de `cosmos-framework`: la carga y la inferencia requieren el framework de NVIDIA; no se proporcionan pesos en formatos estándar como safetensors o GGUF.
- Normalizador obligatorio: sin el archivo `libero_native_frame_wise_relative_rot6d.json`, las salidas del modelo no pueden decodificarse correctamente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yizhouzhao-nv/cosmos3-edge-libero-10-edge-smoke-20260902-224304
- Modelo base `nvidia/Cosmos3-Edge`: https://huggingface.co/nvidia/Cosmos3-Edge
- Blog de NVIDIA sobre Cosmos 3 Edge: https://huggingface.co/blog/nvidia/cosmos3edge
- Documentación de Cosmos 3 (Model Reference): https://docs.nvidia.com/cosmos/latest/cosmos3/model_reference.html
- GitHub de `cosmos-framework`: https://github.com/NVIDIA/cosmos-framework
- Cookbooks de Cosmos 3: https://github.com/NVIDIA/cosmos/tree/main/cookbooks/cosmos3
