# VINAY-UMRETHE/gemma-3-heretic-4-public

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-4-public` es un modelo de diagnóstico publicado por el usuario VINAY-UMRETHE sobre el checkpoint aleatorio `tiny-random/gemma-3`, al que se le ha aplicado un proceso de "ablación" (eliminación de la dirección de rechazo en el espacio de activaciones) mediante la herramienta Heretic v2.2.0.dev0. No es un modelo entrenado: parte de pesos inicializados aleatoriamente con una configuración reducida derivada de `google/gemma-3-27b-it`, por lo que su utilidad práctica es la de reproducir y depurar el pipeline de decensurado, no la de generar contenido real.

El modelo conserva la topología multimodal de Gemma 3 (torre de visión más decoder de texto), pero con dimensiones mínimas: 32 de hidden size, 2 capas en el decoder de texto, 2 capas en el encoder de visión y una única cabeza de atención. Con 8.600.288 parámetros totales y un repositorio de 0,1 GB, está pensado para ejecutarse en CPU o en cualquier GPU consumer sin requisitos relevantes.

Su relevancia es metodológica: documenta de forma reproducible los parámetros de Arbitrary-Rank Ablation (ARA) aplicados y reporta métricas de rechazo y divergencia KL frente al modelo original, lo que permite estudiar cómo afecta la ablación a un modelo de referencia sin incurrir en los costes de un Gemma 3 completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3: decoder de texto + encoder de visión), configurada a escala "tiny" |
| Parametros totales | 8.600.288 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuración deriva de gemma-3-27b-it, pero no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repositorio; compatible con cuantización estándar de transformers, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Modelo base | tiny-random/gemma-3 (a su vez derivado de google/gemma-3-27b-it) |
| Herramienta de ablación | Heretic v2.2.0.dev0 |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura replica la de Gemma 3 (`Gemma3ForConditionalGeneration`), con un modelo de lenguaje y una torre de visión, pero con hiperparámetros reducidos: `hidden_size=32`, `intermediate_size=128`, `head_dim=32`, `num_attention_heads=1`, `num_key_value_heads=1` y `num_hidden_layers=2` en el texto; `hidden_size=32`, `num_hidden_layers=2`, `num_attention_heads=1` e `intermediate_size=128` en visión. Se mantiene el patrón de atención deslizante (`sliding_window_pattern=2`) del modelo original.

No hay entrenamiento supervisado ni RLHF/DPO: los pesos se inicializan con una normal de media 0 y desviación 0,5 bajo semilla fija (`set_seed(42)`), lo que hace el proceso totalmente reproducible. Sobre esa base aleatoria se aplica Arbitrary-Rank Ablation con los parámetros `start_layer_index=1`, `end_layer_index=2`, `preserve_good_behavior_weight=0.2143`, `steer_bad_behavior_weight=0.0004`, `overcorrect_relative_weight=0.7718` y `neighbor_count=5`. El objetivo de la ablación es eliminar la dirección de comportamiento asociada al rechazo, técnica habitual en los modelos etiquetados como "abliterated" o "decensored".

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`), con la misma interfaz de mensajes que Gemma 3.
- Procesamiento de entradas multimodales mediante el `AutoProcessor` de Gemma 3 (imágenes por URL o tensor más texto).
- Conversación multi-turno con rol de sistema, usuario y asistente.
- Punto de referencia reproducible para validar pipelines de ablación con Heretic.
- No se documentan capacidades de tool calling, function calling, agentes, matemáticas, código ni modo "thinking" en la información disponible.
- Capacidades multilingües: no disponibles (los pesos son aleatorios, por lo que no hay comportamiento lingüístico aprendido).

## Casos de uso

- Depuración de pipelines de ablación: sirve para verificar que la implementación de Heretic y de Arbitrary-Rank Ablation produce los resultados esperados sobre un modelo de referencia barato de ejecutar, antes de aplicarla a un Gemma 3 real.
- Pruebas de integración con transformers: al ser un Gemma 3 a escala mínima, permite validar código de carga, procesado multimodal y generación sin consumir VRAM significativa.
- Test de regresión en CI: se puede incluir en la batería de tests de una librería o de un servicio que dé soporte a Gemma 3, comprobando que el pipeline `image-text-to-text` funciona con pesos safetensors y `trust_remote_code=True`.
- Reproducibilidad de investigación: el repositorio incluye el script exacto de creación y un directorio `reproduce/`, lo que permite replicar el experimento bit a bit y comparar variantes de parámetros ARA.
- Docencia y formación: ejemplo didáctico de cómo se construye un modelo "tiny-random" a partir de una configuración grande y de cómo se aplica una técnica de edición de comportamiento sin reentrenar.
- Validación de infraestructura de despliegue: útil para probar endpoints compatibles con TGI (`endpoints_compatible`) y flujos de carga en Hugging Face Inference Endpoints con un coste mínimo.
- Estudio de la divergencia KL asociada a la ablación: la model card reporta KL de 0,0829 frente al original, lo que permite analizar el coste de fidelidad que introduce la técnica.

## Benchmarks y rendimiento

La model card solo publica dos métricas internas de la ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Rechazos (Refusals) | 0/5 | 0/5 |
| Divergencia KL | 0,0829 | 0 (por definición) |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,6 M de parámetros, ~17 MB de pesos); en la práctica, cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) o incluso CPU; no requiere A100 ni H100.
- Cabe en GPU consumer: sí, sin restricciones prácticas.
- Opciones de despliegue: `transformers` con `pipeline("image-text-to-text")`, Text Generation Inference (TGI, etiqueta `text-generation-inference` presente) y Hugging Face Inference Endpoints (`endpoints_compatible`). No se documenta compatibilidad con llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de 2 capas y 32 de hidden size, la latencia estará dominada por el overhead del framework y del procesador de imagen, no por el cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Uso previsto |
|---|---|---|---|---|---|
| VINAY-UMRETHE/gemma-3-heretic-4-public | 8,6 M | no disponible | imagen-texto | no disponible | Depuración / reproducibilidad |
| tiny-random/gemma-3 | ~8,6 M (misma config) | no disponible | imagen-texto | no disponible | Depuración / tests |
| google/gemma-3-27b-it | 27 B (aprox.) | no disponible en esta ficha | imagen-texto | Gemma Terms of Use (no confirmada aquí) | Producción multimodal |
| Modelos "abliterated" de la comunidad (p. ej. variantes de Llama o Mistral) | variable | variable | texto | variable según base | Investigación sobre rechazo |

La comparación relevante es con `tiny-random/gemma-3`, del que solo se diferencia por la ablación aplicada (KL de 0,0829 y mismos 0/5 rechazos). Frente a `google/gemma-3-27b-it` no hay comparación de rendimiento posible: este checkpoint no ha sido entrenado y sus pesos son aleatorios.

## Limitaciones y advertencias

- Los pesos son aleatorios: el modelo no produce texto coherente ni respuestas útiles; cualquier salida es ruido estadístico derivado de la inicialización.
- No ha sido entrenado ni ajustado con datos, por lo que no tiene capacidades lingüísticas, de razonamiento, código o matemáticas reales.
- La métrica de rechazos 0/5 no es interpretable como "modelo sin censura" en sentido práctico: se mide sobre un modelo que no sabe responder.
- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia del modelo base (Gemma Terms of Use) antes de cualquier despliegue.
- Idiomas no declarados y sin comportamiento lingüístico aprendido.
- El proceso de ablación puede introducir artefactos numéricos (KL de 0,0829) que, en un modelo entrenado, se traducirían en degradación de calidad; aquí solo sirven como referencia metodológica.
- Riesgo de confusión: el nombre "gemma-3-heretic-4-public" puede llevar a pensar que es un Gemma 3 funcional; no lo es.
- No apto para producción, atención al cliente, generación de código ni ningún uso final real.
- La model card está en inglés y no documenta sesgos, pero al no haber datos de entrenamiento no se puede evaluar el sesgo de forma significativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-4-public
- Modelo base tiny-random: https://huggingface.co/tiny-random/gemma-3
- Modelo de referencia Gemma 3 27B IT: https://huggingface.co/google/gemma-3-27b-it
- Proyecto Heretic: https://heretic-project.org
- Directorio de reproducción (referenciado en la model card): `reproduce/README.md` dentro del repositorio del modelo
