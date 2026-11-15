# VINAY-UMRETHE/gemma-3-heretic-1

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-1` es un modelo de prueba (debug) derivado de `tiny-random/gemma-3`, una versión aleatorizada y de tamano minimo de la arquitectura Gemma 3 de Google. El autor, VINAY-UMRETHE, ha aplicado la herramienta Heretic v2.2.0.dev0 para producir una variante "decensored" mediante ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 1 y 2 del modelo. El resultado se presenta con las etiquetas `heretic`, `uncensored`, `abliterated` y `reproducible`.

El modelo no es un modelo funcional en el sentido practico: se trata de un checkpoint de 8,6 millones de parametros inicializado aleatoriamente (distribucion normal con desviacion 0,5 y semilla 42) a partir de una configuracion reducida de `google/gemma-3-27b-it`. Su proposito es servir como banco de pruebas reproducible para la tecnica de ablacion de Heretic, no para generacion real de texto o imagen. El pipeline declarado es `image-text-to-text`, heredado de la configuracion multimodal de Gemma 3, aunque la calidad de las salidas es la de un modelo sin entrenamiento.

La relevancia de esta ficha es documental y metodologica: ilustra como se aplica ARA sobre un modelo multimodal y como se publican los parametros exactos para reproducir la ablacion. Cualquier uso en produccion, evaluacion de capacidades o comparacion de rendimiento carece de sentido con este checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Gemma 3 (configuracion reducida de `google/gemma-3-27b-it`), con torre de vision y modelo de lenguaje |
| Parametros totales | 8.600.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la configuracion reducida no documenta ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura `Gemma3ForConditionalGeneration` con una configuracion drasticamente reducida: `hidden_size` 32, `intermediate_size` 128, `head_dim` 32, 1 cabeza de atencion, 1 cabeza KV, 2 capas ocultas en el modelo de lenguaje y `sliding_window_pattern` 2. La torre de vision tambien se reduce a `hidden_size` 32, 2 capas, 1 cabeza y `intermediate_size` 128. Los pesos se inicializan con `torch.nn.init.normal_(p, 0, 0.5)` bajo semilla 42, sin ningun tipo de preentrenamiento, fine-tuning supervisado, RLHF ni DPO.

La innovacion tecnica no esta en el modelo sino en el procedimiento de ablacion aplicado por Heretic v2.2.0.dev0. Los parametros ARA publicados son: `start_layer_index` 1, `end_layer_index` 2, `preserve_good_behavior_weight` 0,9878, `steer_bad_behavior_weight` 0,2870, `overcorrect_relative_weight` 0,2425 y `neighbor_count` 1. El autor indica que el proceso es reproducible y remite al directorio `reproduce/README.md` del repositorio. La divergencia KL reportada frente al modelo original es de 0,0960, y la metrica de rechazos es 0/5 tanto en el modelo ablacionado como en el original, lo que refleja que el modelo base aleatorio ya no produce rechazos significativos.

## Capacidades

- Generacion de texto multimodal a nivel de arquitectura (pipeline `image-text-to-text`), pero sin capacidades reales aprendidas por falta de entrenamiento.
- Procesamiento de mensajes conversacionales con roles `system`, `user` y `assistant` mediante el procesador de Gemma 3.
- Entrada de imagenes por URL o locales a traves del procesador multimodal heredado.
- Soporte de `trust_remote_code` y ejecucion con `transformers.pipeline`.
- Etiquetado como `uncensored`, `decensored` y `abliterated` por el procedimiento ARA aplicado.
- Reproducibilidad del proceso de ablacion documentada en el repositorio.
- No dispone de tool calling, agentes, modo thinking, audio ni capacidades multilingues verificables.

## Casos de uso

- Validacion de pipelines multimodales: sirve para comprobar que un pipeline `image-text-to-text` de Gemma 3 se carga, procesa mensajes con imagen y devuelve tensores con la forma esperada antes de pasar a un modelo real.
- Pruebas de integracion en CI: al ocupar 0,1 GB y 8,6 M de parametros, permite ejecutar tests de humo de `transformers`, `text-generation-inference` o endpoints compatibles sin coste de GPU.
- Reproduccion de experimentos de ablacion: los parametros ARA publicados y el directorio `reproduce/` permiten replicar el procedimiento de Heretic sobre un checkpoint conocido y verificar la implementacion.
- Desarrollo de herramientas de "decensoring": sirve como caso de prueba controlado para validar metricas de rechazo y divergencia KL antes de aplicarlas a modelos de mayor tamano.
- Benchmarking de infraestructura: util para medir latencia de carga, overhead de procesador multimodal y comportamiento de `trust_remote_code` en entornos aislados.
- Docencia y formacion: ejemplo minimo para explicar la estructura de un modelo Gemma 3 multimodal (torre de vision, atencion deslizante, configuracion) sin necesidad de recursos de computo.
- Verificacion de compatibilidad de versiones de `transformers`: al fijar una configuracion concreta, ayuda a detectar regresiones en la carga de modelos Gemma 3 multimodales.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (`tiny-random/gemma-3`) |
|---|---|---|
| Rechazos | 0/5 | 0/5 |
| Divergencia KL | 0,0960 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son las de la tabla anterior, correspondientes al procedimiento de ablacion y no a capacidades del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,6 M de parametros, ~17 MB de pesos) mas el overhead del procesador y de la torre de vision.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien funciona en CPU.
- Cabe en GPU de consumo: si, en cualquier RTX, GTX o iGPU moderna; incluso en Raspberry Pi y entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline("image-text-to-text")`, `text-generation-inference` (segun tags) y endpoints compatibles; no se documenta soporte GGUF ni Ollama.
- Latencia y throughput: no disponibles; al ser un modelo aleatorio, las metricas de calidad no son representativas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `VINAY-UMRETHE/gemma-3-heretic-1` | 8,6 M | no disponible | no disponible | Debug y reproduccion de ablacion ARA |
| `tiny-random/gemma-3` | ~8,6 M (misma config) | no disponible | no disponible | Debug de la arquitectura Gemma 3 |
| `google/gemma-3-27b-it` | 27 B | 128 K (segun documentacion de Gemma 3) | Gemma Terms of Use | Modelo multimodal de produccion |

La comparacion con `google/gemma-3-27b-it` es solo arquitectonica: este checkpoint hereda su configuracion pero no sus pesos ni su entrenamiento. No se dispone de otros modelos "heretic" comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin entrenamiento: los pesos son aleatorios, por lo que las salidas no tienen coherencia linguistica ni valor informativo.
- No apto para produccion: no debe usarse para generacion de texto, atencion al cliente, codigo ni ninguna tarea real.
- La etiqueta "uncensored" o "abliterated" no implica que el modelo sea seguro; al carecer de alineamiento, puede producir salidas arbitrarias sin filtros.
- Licencia no declarada: no se especifican terminos de uso comercial, redistribucion ni atribucion.
- Idiomas no declarados: no hay garantia de soporte multilingue.
- Contexto efectivo no documentado: la configuracion reducida no indica ventana de atencion util.
- Riesgo de confusion: el nombre "gemma-3-heretic-1" puede llevar a pensar que es una variante funcional de Gemma 3; es imprescindible leer la model card antes de descargarlo.
- Dependencia de `trust_remote_code`: la carga requiere ejecutar codigo del repositorio, lo que anade superficie de riesgo en entornos no confiables.
- Reproducibilidad limitada al procedimiento: el autor documenta como recrear el checkpoint, pero no se aportan semillas para todos los pasos fuera del script publicado.

## Enlaces

- Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-1
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Modelo de referencia arquitectonica: https://huggingface.co/google/gemma-3-27b-it
- Heretic: https://heretic-project.org
- Directorio de reproduccion: `reproduce/README.md` dentro del repositorio del modelo
