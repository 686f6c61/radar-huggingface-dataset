# zhiyaowang/tower-jenga-pi05-v3

## Resumen

TOWER Jenga π0.5 (v3) es una política visión-lenguaje-acción (VLA) especializada en tareas bimanuales de tipo Jenga dentro del benchmark TOWER, ejecutadas en el simulador Isaac Sim. Lo desarrolla el usuario zhiyaowang y consiste en un ajuste fino completo del modelo base π0.5 de Physical Intelligence (OpenPI, JAX), orientado a la manipulación bimanual de bloques con dos brazos de 7 articulaciones y sus pinzas.

El modelo resuelve el problema de aprendizaje de políticas a partir de demostraciones expertas simuladas: recibe cuatro cámaras RGB, propriocepción e instrucción en lenguaje natural, y emite chunks de 32 acciones a 30 Hz. Es relevante como ejemplo de adaptación de un VLA generalista de 3.350 millones de parámetros a un dominio concreto de manipulación bimanual, con un pipeline de servicio reproducible sobre el protocolo WebSocket `tower-infer-v1`.

La arquitectura subyacente es la de π0.5, con un backbone visión-lenguaje PaliGemma y una cabeza de flow matching para la generación de acciones. El contexto de lenguaje está limitado a 128 tokens y el checkpoint se distribuye en formato Orbax (OCDBT) en bfloat16, con pesos EMA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (π0.5): backbone PaliGemma + cabeza de flow matching |
| Parametros totales | 3.353.433.872 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 tokens (`max_token_len=128`) |
| Tipos de cuantizacion | No disponible (checkpoint distribuido en bfloat16) |
| Idiomas soportados | Ingles (instrucciones de tarea) |
| Licencia | Gemma Terms of Use (version 1 de abril de 2026) |
| Formato de pesos | Orbax (OCDBT), bfloat16, pesos EMA (decay 0.999), 4,9 GB |

## Arquitectura y entrenamiento

El modelo parte de π0.5 base (`gs://openpi-assets/checkpoints/pi05_base`) y se ajusta de forma completa con la configuración `Pi0Config(pi05=True)` de OpenPI: cuatro cámaras como entradas de imagen, `action_dim=32`, `action_horizon=32` y `max_token_len=128`. La generación de acciones usa una cabeza de flow matching con 10 pasos de Euler, que produce chunks de 32 acciones futuras a 30 Hz (1,07 s). El estado se discretiza en 256 bins en el prompt, siguiendo el esquema de π0.5.

El entrenamiento usa solo la pérdida de flow matching (sin RLHF/DPO) sobre datos de dos fuentes: las demostraciones oficiales de TOWER (Tower-SimData v1.0.0, 531 episodios en diez variantes de tarea) y datos sintéticos generados a partir de los layouts iniciales de los 475 episodios de entrenamiento (split 10 % held out, semilla 42). Los 56 episodios reservados se usaron solo para evaluación. La normalización se calcula con los percentiles 1 y 99 sobre el estado y la acción de 16 dimensiones. El identificador interno del run es `distill-v3-28000-home` (paso 28000).

## Capacidades

- Manipulación bimanual simulada: controla dos brazos de 7 articulaciones y sus pinzas a partir de observaciones conjuntas.
- Percepción multi-cámara: procesa cuatro vistas RGB de 480x640 (dos externas y dos en muñeca).
- Seguimiento de instrucciones: condiciona la política a la oración oficial de la familia de tareas (cinco instrucciones en inglés).
- Generación de acciones en chunk: emite 32 acciones futuras por inferencia, con salida efectiva de 8 pasos por petición.
- Reproducibilidad: el ruido de flow matching se deriva de `sample_seed`, por lo que las salidas son deterministas para una semilla dada.
- Integración con propriocepción: usa posiciones articulares y anchura de pinza como parte de la observación.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en manipulación bimanual: sirve como política de referencia para comparar métodos de aprendizaje por imitación en tareas Jenga dentro de TOWER, ya que reproduce el protocolo oficial del track `20261013-task45-v1`.
- Evaluación de VLA en simulación: permite medir la transferencia de un modelo base generalista (π0.5) a un dominio estrecho con ajuste fino completo, con métricas reproducibles por semilla.
- Generación de datos sintéticos: los layouts iniciales y las estadísticas de normalización del checkpoint se pueden reutilizar para entrenar variantes con aumentación de datos.
- Benchmarking de infraestructura: con 48 ms de latencia mediana por forward en H800, sirve para evaluar pipelines de servicio con réplicas por GPU (`--devices`) y protocolos WebSocket.
- Estudio de robustez ante orientación de cámara: el preprocesado rota 180 grados las cámaras externas según el primer frame, lo que permite analizar sensibilidad a la calibración.
- Docencia y reproducción: el repositorio de código y el servidor `scripts/serve_policy.py` permiten reproducir el experimento completo desde un checkpoint público.
- Análisis de suavizado de acciones: el filtro Savitzky-Golay (ventana 9) y el blending de 2 pasos son configurables en el servidor, útiles para estudiar estabilidad de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una latencia de inferencia de 48 ms (mediana) por forward pass en una NVIDIA H800.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 4,9 GB en bfloat16; se recomienda al menos 16 GB de VRAM para cargar pesos, tokenizer y buffers de inferencia.
- GPU recomendadas: NVIDIA H800 (medida oficial de latencia), H100 y A100 para despliegue; una RTX 4090 de 24 GB debería poder alojar el modelo, aunque no se ha verificado en la información disponible.
- Cabe en GPU de consumo: probablemente en RTX 4090 y RTX 3090 por tamaño de pesos, sin datos oficiales de rendimiento.
- Opciones de despliegue: servidor OpenPI en el commit `215abfb` con el parche de `patches/`, protocolo WebSocket `tower-infer-v1` en 127.0.0.1; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 48 ms mediana por forward en H800; throughput no disponible.
- Tokenizer: PaliGemma SentencePiece se descarga en el primer uso desde `gs://big_vision/paligemma_tokenizer.model` a `$OPENPI_DATA_HOME/big_vision/`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TOWER Jenga π0.5 v3 | 3.353.433.872 | 128 tokens | Manipulación bimanual simulada (TOWER) | Gemma Terms | Hugging Face (repo 5,3 GB) |
| π0.5 base (lerobot/pi05_base) | No disponible en la información | No disponible | VLA generalista | No disponible | Hugging Face |
| Otros modelos del benchmark TOWER | No disponible | No disponible | Manipulación simulada | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Uso exclusivamente en simulación: nunca se ha ejecutado en hardware físico; no hay restricciones de fuerzas, velocidades ni colisiones más allá de las del simulador.
- Dominio muy estrecho: entrenado solo para las tareas Jenga de TOWER con cinco instrucciones fijas en inglés; no generaliza a otras tareas ni idiomas.
- Contexto de lenguaje corto: 128 tokens limitan instrucciones largas o composicionales.
- Dependencia de calibración: el preprocesado asume una orientación concreta de las cámaras externas y una pose inicial de los brazos (se corrige si la desviación supera 20 mrad, solo en task1-2).
- Riesgo de alucinación de acciones: al ser una política generativa con flow matching, puede producir trayectorias no válidas fuera de la distribución de entrenamiento.
- Sesgos: no documentados; al entrenarse con datos simulados, hereda los sesgos del generador de demostraciones y del entorno Isaac Sim.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use (versión de 1 de abril de 2026); es necesario revisar las restricciones de redistribución y atribución.
- Tokenizer no incluido: requiere descarga externa desde Google Cloud Storage bajo los términos de Gemma.
- Sin métricas publicadas de éxito en tareas: la model card no reporta tasas de éxito ni comparaciones con baselines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhiyaowang/tower-jenga-pi05-v3
- Código del proyecto: https://github.com/zywang-hust/tower-jenga
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Paper de referencia (arXiv:2504.16054): https://arxiv.org/abs/2504.16054
- Dataset TOWER-SimData: https://huggingface.co/datasets/tower-benchmark/TOWER-SimData
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
