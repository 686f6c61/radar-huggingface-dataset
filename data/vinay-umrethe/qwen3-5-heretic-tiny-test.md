# VINAY-UMRETHE/qwen3.5-heretic-tiny-test

## Resumen

`VINAY-UMRETHE/qwen3.5-heretic-tiny-test` es una version "abliterated" (decensurada) del modelo de prueba `tiny-random/qwen3.5`, generada con la herramienta Heretic v2.0.0.dev0. No es un modelo utilizable en produccion: se trata de un modelo diminuto de 4.396.512 parametros (~4,4 M) inicializado de forma aleatoria a partir de una configuracion adaptada del modelo real `Qwen/Qwen3.5-27B`. Su proposito declarado es la depuracion (debugging) de pipelines de inferencia, parsers y flujos de decensura, no la generacion de contenido.

La relevancia de esta ficha es doble. Por un lado, sirve como ejemplo reproducible de como Heretic aplica abliteration sobre una arquitectura hibrida y multimodal de la familia Qwen3.5. Por otro, documenta el cableado tecnico de dicha familia (capas de linear attention combinadas con full attention, codificador de vision y modulo de multi-token prediction) en un formato tan pequeno que puede ejecutarse en CPU en milisegundos.

Es importante subir la advertencia al resumen: al estar inicializado aleatoriamente, el modelo no produce texto coherente ni respuestas correctas. Los ejemplos de uso de la model card apuntan a `tiny-random/qwen3.5` como identificador, no a este repositorio. Cualquier evaluacion cualitativa del modelo carece de sentido; solo la metrica de rechazos y la divergencia KL son informativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida multimodal Qwen3.5: 3 capas de linear attention + 1 capa de full attention, con modulo de multi-token prediction (MTP) |
| Parametros totales | 4.396.512 (~4,4 M) |
| Parametros activos | no disponible (la configuracion tiny no define expertos; los campos MoE del Qwen3.5-27B aparecen comentados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors; sin GGUF publicado para este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (model.safetensors, 8,8 MB) |

## Arquitectura y entrenamiento

La arquitectura replica el esqueleto de Qwen3.5 en version reducida: 4 capas de las cuales 3 son de linear attention y 1 de full attention (`layer_types = ['linear_attention'] * 3 + ['full_attention']`), con `hidden_size` de 8, `head_dim` de 32, 8 cabezas de atencion y 4 cabezas KV. El componente lineal define `linear_num_key_heads` de 4, `linear_num_value_heads` de 8 y dimensiones de cabeza de 32. Incluye un codificador de vision (`hidden_size` 64, `intermediate_size` 128, 2 cabezas, `depth` 2) y un modulo MTP anadido a mano para decodificacion especulativa. El RoPE es multimodal (`mrope_section = [1, 1, 2]`). La configuracion hereda los parametros de `Qwen/Qwen3.5-27B` con los campos de expertos (128 expertos, 10 activos) comentados.

No hay entrenamiento en el sentido habitual. El modelo se instancia con `Qwen3_5ForConditionalGeneration(config)` y pesos aleatorios; posteriormente se le aplica abliteration con Heretic, que estima una direccion de rechazo por capa (`direction_index = per layer`) y edita las proyecciones `attn.o_proj` y `mlp.down_proj` con pesos y posiciones concretos (por ejemplo, `attn.o_proj.max_weight = 0.82` en la posicion 2.94, o `mlp.down_proj.max_weight = 0.01` en la posicion 1.97). No se documenta dataset, numero de tokens, RLHF ni DPO.

## Capacidades

- No genera texto coherente: los pesos son aleatorios, por lo que la salida es ruido. No debe confundirse con capacidades funcionales.
- Soporte nominal de image-text-to-text: el pipeline y la clase `Qwen3_5ForConditionalGeneration` aceptan entradas de imagen y texto, pero el resultado no es interpretable.
- Multi-token prediction (MTP): el modelo incorpora el modulo MTP y la model card muestra configuracion de decodificacion especulativa para vLLM (`qwen3_next_mtp`) y SGLang (`NEXTN`).
- Parsers declarados en los ejemplos: `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder` con `--enable-auto-tool-choice`, aunque no hay evidencia de que funcionen sobre pesos aleatorios.
- Multilingue: no disponible.
- Thinking mode, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Pruebas de integracion de vLLM y SGLang: el modelo permite validar el arranque de servidores, el paso de flags (`--tensor-parallel-size 2`, `--speculative-config.method qwen3_next_mtp`) y el enrutado de parsers sin consumir GPU significativa.
- Verificacion de pipelines multimodales con Transformers: sirve para comprobar que `AutoProcessor.apply_chat_template` acepta mensajes con imagenes y que las formas tensoriales del codificador de vision son correctas.
- Validacion de flujos de abliteration con Heretic: al ser tiny, se puede ejecutar el ciclo completo de estimacion de direccion de rechazo y edicion de pesos en segundos, sirviendo de test end-to-end de la herramienta.
- Pruebas de CI/CD para codigo de inferencia: dado su tamano (8,8 MB), encaja en runners sin GPU y permite ejecutar tests de humo de bibliotecas de serving.
- Depuracion de decodificacion especulativa: el modulo MTP permite probar la logica de draft/candidatos (`speculative_num_steps`, `eagle-topk`, `num-draft-tokens`) sin coste computacional relevante.
- Portabilidad y deteccion de regresiones de formato: valida la carga de safetensors en bf16, la conversion de `A_log` y `norm` a float32 en capas de linear attention, y la serializacion de safetensors.
- Docencia y demostracion de arquitecturas hibridas: util para mostrar en un ejemplo minimo como se combinan linear attention, full attention y vision en una misma pila.

## Benchmarks y rendimiento

Solo se han publicado dos metricas en la model card. No hay resultados de MMLU, HumanEval, GSM8K ni similares.

| Metrica | Este modelo | Modelo original (tiny-random/qwen3.5) |
|---|---|---|
| Rechazos (refusals) | 0/100 | 0/100 |
| Divergencia KL | 0,0056 | 0 (por definicion) |

La divergencia KL de 0,0056 cuantifica la desviacion de distribucion introducida por la abliteration respecto al modelo original. El 0/100 en rechazos en ambos casos indica que la metrica no discrimina aqui, previsiblemente porque los pesos aleatorios no producen respuestas con contenido evaluable.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 MB en bf16 (8,8 MB de safetensors), mas el coste del codificador de vision; margen de activaciones despreciable.
- GPU recomendadas: cualquiera, incluida una GPU integrada. A100, H100 o RTX 4090 estan sobredimensionadas; tambien funciona en CPU.
- Cabe en GPU consumer: si, en cualquier modelo, e incluso cabe en memoria de sistema sin GPU dedicada.
- Opciones de despliegue: Transformers, vLLM, SGLang (segun los ejemplos de la model card). No hay GGUF publicado para este repositorio, por lo que llama.cpp, Ollama o LM Studio requeririan conversion previa.
- Latencia y throughput: no disponible. No se han publicado mediciones; por tamano, la inferencia es practicamente instantanea en cualquier hardware, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-heretic-tiny-test | 4,4 M | no disponible | no disponible | Hugging Face (transformers) |
| tiny-random/qwen3.5 (base) | ~4,4 M (misma configuracion) | no disponible | no disponible | Hugging Face |
| Qwen/Qwen3.5-27B (origen de la configuracion) | ~27.000 M | no disponible | no disponible | Hugging Face |
| VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same (mismo autor) | ~4.000 M aprox. | no disponible | no disponible | Hugging Face |

La comparacion es estructural, no de rendimiento: los tres primeros comparten arquitectura, pero solo el modelo de 27B esta entrenado. Frente a las variantes heretic de mayor tamano del mismo autor, este repositorio es un banco de pruebas, no un modelo desplegable.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no esta entrenado y no produce salidas coherentes. Cualquier uso que dependa de calidad de generacion es inviable.
- Riesgo de confusion: los ejemplos de la model card usan `tiny-random/qwen3.5` como `model_id`, no este repositorio. Verifica a que artefacto apuntas antes de desplegar.
- Licencia no disponible: no consta licencia explicita, lo que impide asumir permisos de uso comercial. La situacion de la abliteration anade incertidumbre legal adicional.
- Contenido decensurado: la abliteration elimina mecanismos de rechazo por diseno. Aunque en este modelo no sean funcionales, el enfoque se orienta a eliminar filtros, con las implicaciones eticas y de cumplimiento que ello conlleva.
- Sesgos conocidos: no disponibles, y no evaluables dado que no hay entrenamiento.
- Idiomas y contexto: no disponibles.
- Hardware y despliegue: requiere conversion a GGUF para usarse en llama.cpp/Ollama/LM Studio; no hay cuantizaciones publicadas.
- Uso en produccion: desaconsejado por completo. La unica utilidad legitima es como banco de pruebas de herramientas y pipelines.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/qwen3.5-heretic-tiny-test
- Modelo base (tiny de depuracion): https://huggingface.co/tiny-random/qwen3.5
- Configuracion de referencia: https://huggingface.co/Qwen/Qwen3.5-27B
- Heretic (repositorio): https://github.com/p-e-w/heretic
- Heretic (sitio del proyecto): https://heretic-project.org
- Otro modelo heretic del mismo autor: https://huggingface.co/VINAY-UMRETHE/Qwen3-VL-4B-Instruct-heretic-Semantic-Same
- Modelo heretic adicional del mismo autor: https://huggingface.co/VINAY-UMRETHE/Qwen3-0.6B-heretic-Test5
- Perfil de GitHub del autor: https://github.com/Vinay-Umrethe
- Ficha GGUF relacionada de la familia Qwen3.5 heretic: https://local-ai-zone.github.io/models/qwen3-5-35b-a3b-heretic.html
