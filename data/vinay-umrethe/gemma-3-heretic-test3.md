# VINAY-UMRETHE/gemma-3-heretic-test3

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-test3` es una version "decensored" (abliterated) del modelo de depuracion `tiny-random/gemma-3`, generada con la herramienta Heretic v2.1.0.dev0. No es un modelo funcional: se trata de un artefacto de pruebas con pesos inicializados aleatoriamente (semilla 42) y una configuracion derivada de `google/gemma-3-27b-it` pero reducida a proporciones minimas (hidden_size 32, 2 capas de texto, 2 capas de vision). El repositorio ocupa 0.0 GB y no registra descargas ni interacciones.

El interes tecnico no reside en el modelo en si, sino en el procedimiento de ablation de rango arbitrario (ARA) aplicado sobre las capas 1 y 2, y en la reproducibilidad declarada del proceso. La model card reporta metricas de refusals (87/100 frente a 86/100 del original) y una divergencia KL de 0.0017, lo que sugiere que la ablation apenas altera el comportamiento del modelo base, algo esperable dado que el base es aleatorio y no tiene comportamiento aprendido que preservar o eliminar.

Por tanto, esta ficha debe leerse como documentacion de un experimento de ablation reproducible sobre Gemma 3, no como evaluacion de un modelo utilizable en produccion. Cualquier uso real requeriria partir de un checkpoint Gemma 3 completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma3ForConditionalGeneration: torre de vision + decoder de texto), config derivada de gemma-3-27b-it pero truncada |
| Parametros totales | no disponible (el repo ocupa 0.0 GB; la variante `gemma-3-heretic-test` asociada reporta 8.6M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la config base de gemma-3-27b-it soporta contexto largo, pero la truncada no documenta ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza la clase `Gemma3ForConditionalGeneration` de transformers, que combina un encoder de vision con un decoder de texto tipo transformer. La configuracion se construye a partir de `google/gemma-3-27b-it` y se reduce drasticamente: `hidden_size` 32, `intermediate_size` 128, 1 cabeza de atencion, 1 cabeza KV, 2 capas ocultas de texto con `sliding_window_pattern` 2, y torre de vision con 32 de hidden_size, 2 capas y 1 cabeza. Los pesos se inicializan con `torch.nn.init.normal_(p, 0, 0.5)` bajo `set_seed(42)`, sin entrenamiento posterior.

La innovacion destacable es el pipeline Heretic de ablation de rango arbitrario (ARA), aplicado entre las capas 1 y 2 con los pesos `preserve_good_behavior_weight` 0.0971, `steer_bad_behavior_weight` 0.0035, `overcorrect_relative_weight` 0.2419 y `neighbor_count` 5. Este metodo busca eliminar direcciones asociadas a comportamientos de rechazo preservando el resto de capacidades; el repositorio incluye un directorio `reproduce` con el README para repetir el proceso. No hay datos sobre tokens de entrenamiento, composicion del dataset ni RLHF/DPO, porque no hubo entrenamiento.

## Capacidades

- Generacion de texto: nominal, pero sin valor practico al tener pesos aleatorios.
- Procesamiento image-text-to-text: la pipeline declarada es `image-text-to-text`, con soporte de mensajes multimodales (imagen por URL + texto).
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-step: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, audio u otras capacidades especiales: no disponibles.
- Valor real: servir como banco de pruebas reproducible para validar el pipeline Heretic (ARA) sobre arquitecturas Gemma 3.

## Casos de uso

- Validacion del pipeline Heretic: ejecutar el directorio `reproduce` para comprobar que la ablation ARA con los parametros documentados produce el mismo checkpoint y las mismas metricas (87/100 refusals, KL 0.0017).
- Pruebas de integracion de transformers: usar el modelo como fixture ligero (repo de 0.0 GB) para verificar que `pipeline("image-text-to-text")` carga correctamente un Gemma3ForConditionalGeneration con entrada multimodal.
- Test de compatibilidad de endpoints: el tag `endpoints_compatible` permite comprobar el despliegue en Hugging Face Inference Endpoints sin coste de GPU significativo, dado el tamano minimo.
- Benchmarking de herramientas de ablation: comparar Heretic con otras tecnicas (por ejemplo, abliteration clasica) sobre una arquitectura identica y semilla fija (42), aislando el efecto del metodo.
- Docencia e investigacion sobre seguridad en LLM: ilustrar como se mide la tasa de rechazos con un clasificador y la divergencia KL respecto al modelo original en un entorno controlado y reproducible.
- Depuracion de pipelines multimodales: comprobar el flujo de mensajes con imagen y texto (ejemplo del animal en el caramelo) antes de escalar a un Gemma 3 real, reduciendo el coste de iteracion.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Refusals (clasificador) | 87/100 | 86/100 |
| Divergencia KL | 0.0017 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras de refusals sobre un modelo con pesos aleatorios no son interpretables como calidad de modelo.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en bfloat16 dado el tamano minimo (repo de 0.0 GB; la variante test reporta 8.6M parametros).
- GPU recomendadas: cualquier GPU con soporte CUDA basta; tambien funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en entornos sin GPU.
- Despliegue: transformers con `pipeline("image-text-to-text")`, `trust_remote_code=True` y `device="cuda"`; compatible con Inference Endpoints segun el tag. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al ser un modelo de depuracion, las cifras no serian representativas de Gemma 3 completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VINAY-UMRETHE/gemma-3-heretic-test3 | no disponible (0.0 GB) | no disponible | 87/100 | no disponible | Hugging Face |
| tiny-random/gemma-3 (base) | no disponible | no disponible | 86/100 | no disponible | Hugging Face |
| VINAY-UMRETHE/gemma-3-heretic-test | 8.6M | no disponible | no disponible | no disponible | Hugging Face |
| google/gemma-3-27b-it (referencia de config) | 27B | no disponible en esta ficha | no disponible | Gemma Terms of Use (segun el modelo original) | Hugging Face |

La comparativa con modelos de produccion de la misma categoria (Gemma 3 completo) no es significativa: este checkpoint no conserva capacidades aprendidas.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera texto coherente ni responde a instrucciones; no debe usarse en produccion.
- Las metricas de refusals y KL no son extrapolables a un Gemma 3 real, ya que el base carece de comportamiento aprendido.
- Licencia no disponible: no hay base legal clara para uso comercial; el modelo base original (Gemma 3) esta sujeto a los Gemma Terms of Use.
- Idiomas no documentados; sin datos sobre sesgos, alucinacion o calidad multilingue.
- Contexto efectivo no documentado; la config truncada no refleja la ventana de gemma-3-27b-it.
- Riesgo de confusion: el nombre sugiere un Gemma 3 "decensored" funcional, cuando es un artefacto de depuracion de 0.0 GB.
- El uso de `trust_remote_code=True` en el ejemplo implica ejecutar codigo del repositorio; conviene revisarlo antes de cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-test3
- Variante asociada: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-test
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Config de referencia: https://huggingface.co/google/gemma-3-27b-it
- Proyecto Heretic: https://heretic-project.org
- Imagen de ejemplo de la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/p-blog/candy.JPG
