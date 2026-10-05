# taalyelxor/vlap4p-fr3-azure-checkpoints

## Resumen

Vlap4p fr3 azure checkpoints es un conjunto de tres checkpoints intermedios (pasos 302500, 305000 y 307500) de una política de tipo vision-language-action (VLA) entrenada para controlar un brazo robotico Franka FR3. El autor es el usuario de Hugging Face taalyelxor, y el material procede del proyecto Part IV #40 de la University of Auckland. No es un modelo de lenguaje general: es una política robótica que traduce observaciones visuales y de propiocepcion, junto con una instrucción en lenguaje, en acciones de manipulacion.

El modelo se apoya en la familia OpenVLA y, en concreto, en el checkpoint base moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10, del que hereda su backbone (nomenclatura openvla-7b, en torno a 7.000 millones de parametros). La técnica de ajuste es OpenVLA-OFT y el entrenamiento se realizó con LoRA, un cabezal de acción (action head) y un proyector de propiocepcion, fusionados en los pesos finales. El repositorio ocupa 47,3 GB e incluye los tres checkpoints con sus adaptadores y artefactos de política asociados.

Es relevante ahora porque documenta el linaje de entrenamiento completo de una política de robotica manipulativa de código abierto, con métricas de éxito por checkpoint sobre una tarea concreta ("bowl on plate") y manifiestos SHA256 para trazabilidad. El equipo seleccionó el checkpoint de 310000 pasos (alojado en otro repositorio), por lo que estos tres se conservan como registro intermedio, no como la versión recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenVLA / OpenVLA-OFT |
| Parametros totales | Aproximadamente 7.000 millones (según la nomenclatura openvla-7b del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en safetensors (pesos fusionados + adaptador LoRA) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (pesos fusionados, adaptador LoRA, action head y proprio projector) |

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia de modelos vision-language-action OpenVLA, concretamente a la variante OpenVLA-OFT (Optimized Fine-Tuning). Estos modelos combinan un codificador de visión con un backbone de lenguaje (Llama 2, según la licencia declarada y la nomenclatura del modelo base) que emite predicciones de acción para el robot. Sobre esta base se aplicó un ajuste fino con LoRA, junto con un cabezal de acción dedicado y un proyector de propiocepcion, todos ellos empaquetados con los pesos fusionados. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO.

El entrenamiento corresponde a la ejecución fr3_azure_overhead, identificada como 20261003T230324Z, sobre la montura de cámara fr3_azure_overhead_v1. La entrada visual de esta política es una imagen de cámara cenital (overhead) con recorte de cuadrado central, rotada 180 grados y reescalada a 256x256, tal como queda registrado en el archivo policy_artifact.json. Cada carpeta de checkpoint (data/experiments/fr3_azure_overhead/20261003T230324Z--<step>_chkpt/) contiene los pesos fusionados, el adaptador LoRA, el cabezal de acción, el proyector de propiocepcion y el citado artefacto de política. Conviene subrayar que esta política usa una cámara diferente de la política de cámara de referencia (taalyelxor/vlap4p-fr3-310000) y no es intercambiable con ella.

## Capacidades

- Control de manipulacion robotica: genera acciones para un brazo Franka FR3 en la tarea de colocar un bol sobre un plato.
- Entrada visual cenital: procesa imágenes de una montura de cámara overhead concreta (cuadrado central, rotada 180 grados, 256x256).
- Condicionamiento por lenguaje: es una política vision-language-action, por lo que la tarea se especifica mediante instrucción en lenguaje.
- Entrada de propiocepcion: incorpora un proyector de propiocepcion para integrar el estado del robot junto con la visión.
- Salida de acción continua: dispone de un cabezal de acción dedicado a la predicción de comandos de control.
- Ajuste fino eficiente: incluye adaptadores LoRA, lo que permite reutilizar el backbone con modificaciones de bajo rango.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, razonamiento general ni soporte multilingüe, ya que no es un modelo de propósito general.

## Casos de uso

- Reproduccion de linaje de entrenamiento: los tres checkpoints permiten reconstruir y auditar la evolución del entrenamiento de la política azure, con sus manifiestos SHA256 para verificar integridad.
- Investigacion academica en robotica manipulativa: sirven como material de estudio para analizar cómo evoluciona la tasa de éxito con el número de pasos de FR3 (2.500, 5.000 y 7.500).
- Comparativa de checkpoints intermedios: permiten estudiar la variabilidad del rendimiento durante el entrenamiento, ya que la tasa de éxito no es monótona (8/16, 13/16 y 11/16).
- Punto de partida para ajuste con LoRA: al incluir el adaptador y el backbone OpenVLA, se pueden reutilizar como base para nuevas tareas de manipulación con un coste de ajuste menor.
- Banco de pruebas de infraestructura de inferencia robotica: útiles para validar pipelines que cargan pesos fusionados más adaptador, cabezal de acción y proyector de propiocepcion.
- Benchmark interno de la tarea "bowl on plate": reproducir la evaluación estricta sobre 16 episodios (semillas 0-15) para comparar contra el checkpoint seleccionado de 310000.

## Benchmarks y rendimiento

Los únicos datos de rendimiento publicados corresponden a la tarea "bowl on plate" sobre 16 episodios (semillas 0-15, evaluación estricta) para cada checkpoint.

| Checkpoint (pasos FR3) | Éxito "bowl on plate" (16 episodios) | SHA256 (manifiesto de finalización) |
|---|---:|---|
| 302500 (2.500) | 8 / 16 | bd3f547c3e4abe8ea95085ba3c64cc7cab2c64a90d725b5415fbb08746a02ffb |
| 305000 (5.000) | 13 / 16 | 0dc09a93c67dc53217c74a8a71a289e5437374a50b914e16080084f9f49721f4 |
| 307500 (7.500) | 11 / 16 | f7885a7f2ccbc69de0631b9bdbcc87b1be3610cf7ac53e0f1adcd1b2527799d9 |
| 310000 (10.000, otro repositorio) | 13 / 16 | 42f1729d4c01d5abbac2744c09c05655a0a99376ebfb2da2c7163aba2fe69d4a |

No se han publicado otros resultados de benchmarks (tipo MMLU, HumanEval o GSM8K) en la información disponible, algo esperable al tratarse de una política robótica y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un backbone de aproximadamente 7.000 millones de parametros, los pesos en precision de 16 bits rondan los 14 GB, por lo que se necesitan del orden de 16 a 24 GB de VRAM sumando codificadores de visión, cabezal de acción y cache. Esta cifra es una estimación basada en el tamaño del backbone, no un dato publicado en la ficha.
- GPU recomendadas: GPU profesionales como A100 (40/80 GB) o H100 para despliegue y entrenamiento; GPU de consumo de gama alta para inferencia.
- Viabilidad en GPU de consumo: es previsible que quepa en tarjetas de 24 GB como la RTX 3090 o la RTX 4090 en 16 bits. En tarjetas con menos VRAM requeriria cuantizacion, cuyas versiones no se documentan en el repositorio.
- Opciones de despliegue: no se especifican en la información disponible. Por la familia a la que pertenece, el uso tipico es mediante Hugging Face transformers y PyTorch con scripts de inferencia propios de OpenVLA; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 47,3 GB, correspondiente a los tres checkpoints con sus pesos fusionados, adaptadores y artefactos; conviene prever espacio de almacenamiento para descarga y para el checkpoint seleccionado en el otro repositorio.

## Comparativa con modelos similares

La comparación más directa es entre los propios checkpoints de la misma ejecución de entrenamiento y con la política seleccionada. No se dispone de información sobre modelos de terceros equivalentes en la información proporcionada.

| Modelo | Pasos FR3 | Éxito "bowl on plate" | Montura de cámara | Repositorio |
|---|---:|---:|---|---|
| vlap4p-fr3-azure-checkpoints | 2.500 / 5.000 / 7.500 | 8/16, 13/16, 11/16 | azure overhead | este repositorio |
| vlap4p-fr3-azure-310000 | 10.000 | 13/16 | azure overhead | taalyelxor/vlap4p-fr3-azure-310000 |
| vlap4p-fr3-310000 | no disponible | no disponible | cámara de referencia | taalyelxor/vlap4p-fr3-310000 |
| moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10 | no aplica | no disponible | no aplica (modelo base) | moojink/... |

## Limitaciones y advertencias

- No es la política seleccionada: el equipo eligió el checkpoint de 310000 pasos; estos tres se conservan solo como registro del linaje de entrenamiento.
- Especificidad de cámara: la política usa la montura azure overhead y no es intercambiable con la política de cámara de referencia (taalyelxor/vlap4p-fr3-310000).
- Alcance de tarea limitado: las métricas publicadas se refieren solo a la tarea "bowl on plate" sobre 16 episodios; no hay evidencia de generalización a otras tareas.
- Sin datos de idioma ni de contexto: no se documentan idiomas soportados ni longitud de contexto, por lo que no se puede evaluar su comportamiento multilingüe ni con entradas largas.
- Rendimiento no monótono: la tasa de éxito baja de 13/16 (5.000 pasos) a 11/16 (7.500 pasos), lo que indica variabilidad durante el entrenamiento y desaconseja asumir mejoras por el simple aumento de pasos.
- Licencia: se aplica la Llama 2 Community License a través del backbone OpenVLA. Es una licencia con condiciones (entre ellas umbrales de usuarios activos mensuales y obligaciones de atribucion), por lo que conviene revisarla antes de un uso comercial.
- Riesgo de alucinacion o de acciones erróneas: como política de control, sus fallos se traducen en acciones fisicas incorrectas en un robot real, con el consiguiente riesgo de daños materiales.
- Datos de entrenamiento privados: el dataset taalyelxor/vlap4p-demos-training es privado, lo que limita la reproducibilidad completa del entrenamiento.
- Adopción nula registrada: el repositorio muestra 0 descargas y 0 likes, por lo que no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taalyelxor/vlap4p-fr3-azure-checkpoints
- Modelo base: https://huggingface.co/moojink/openvla-7b-oft-finetuned-libero-spatial-object-goal-10
- Checkpoint seleccionado (azure, 310000): https://huggingface.co/taalyelxor/vlap4p-fr3-azure-310000
- Política de cámara de referencia: https://huggingface.co/taalyelxor/vlap4p-fr3-310000
- Dataset de demostraciones y entrenamiento (privado): https://huggingface.co/datasets/taalyelxor/vlap4p-demos-training
