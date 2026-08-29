# SZLHOLDINGS/A11OY-MINI

## Resumen

A11OY-MINI es un modelo de generación de texto en formato GGUF, publicado por SZLHOLDINGS como una cuantización de su modelo padre `SZLHOLDINGS/chaski`, cuyo "silhouette base" declarado en prosa es `Qwen/Qwen3.5-0.8B`. Con aproximadamente 773 millones de parámetros, se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, y su licencia es Apache-2.0. El modelo está pensado para integrarse en el ecosistema de orquestación de agentes de SZL Holdings, aunque no se han publicado evaluaciones ni resultados de benchmarks en esta versión.

La relevancia de este lanzamiento radica en su carácter de artefacto intermedio dentro de un flujo de gobernanza de IA: la propia model card indica que no es un entrenamiento nuevo, sino una conversión de pesos existentes, y que no es elegible para publicación ni para carga en laboratorio. Esto lo posiciona como una pieza técnica dentro de un pipeline más amplio, más que como un modelo final listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (base declarada en prosa: Qwen/Qwen3.5-0.8B) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo. La model card indica que se trata de una cuantizacion (clase `QUANT_OF_SZL_ORIGINAL`) de un shard fusionado de `SZLHOLDINGS/chaski`, con base declarada en prosa como `Qwen/Qwen3.5-0.8B`. No se menciona ningun proceso de entrenamiento nuevo, ni datos de entrenamiento, ni tecnicas como RLHF o DPO. El unico proceso aplicado es la conversion a GGUF mediante llama.cpp, primero en F16 y posteriormente a Q4_K_M. Tampoco se especifica el tamaño del contexto ni el volumen de tokens de entrenamiento.

## Capacidades

- Generacion de texto: el modelo es capaz de producir texto en ingles, segun su pipeline de text-generation.
- Integracion con el ecosistema a11oy: segun los repositorios y paginas web de SZL Holdings, el modelo se enmarca en un sistema de orquestacion de agentes y "command center" gobernado, aunque no se documentan capacidades especificas de tool calling, agentes o razonamiento multi-paso en esta ficha.
- No se ha publicado informacion sobre soporte de vision, audio, thinking mode u otras modalidades.

## Casos de uso

No se han documentado casos de uso concretos en la informacion disponible. Dado su tamano (773M parametros) y su formato GGUF, podria emplearse en entornos con recursos limitados, como inferencia en CPU o GPUs de baja capacidad, pero esta posibilidad no esta confirmada por el autor. La model card advierte explicitamente que no es elegible para publicacion, no tiene evaluaciones y no debe cargarse en el laboratorio interno, lo que limita su uso recomendado a fines tecnicos internos o de validacion de procesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica `evals: none-this-run` y `publication_eligible: false`, por lo que no existen datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- Tamanos de archivo: F16 de 1.557.662.240 bytes (aprox. 1,56 GB) y Q4_K_M de 541.903.392 bytes (aprox. 542 MB).
- Estimacion de VRAM: para el archivo F16, se necesitarian aproximadamente 1,6 GB de VRAM, mas overhead del runtime, lo que cabria en GPUs consumer con 2 GB o mas. Para Q4_K_M, unos 0,5 GB de VRAM, compatible con GPUs de 1 GB o incluso CPU.
- GPU recomendadas: no hay indicaciones oficiales; por tamano, cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) podria ejecutar la version Q4_K_M, y la F16 en GPUs con 4 GB o mas.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato. Tambien puede usarse con vLLM si se convierte a safetensors, aunque la model card prohibe la conversion directa a Ollama desde safetensors.
- Latencia y throughput: no se han publicado datos oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos. Aunque se menciona como base a `Qwen/Qwen3.5-0.8B`, no hay datos de rendimiento ni de contexto que permitan contrastarlo con alternativas como Llama 3.2 1B, Gemma 2 2B u otros modelos de tamano similar.

## Limitaciones y advertencias

- No tiene evaluaciones publicadas (`evals: none-this-run`), por lo que su calidad no esta verificada.
- No es elegible para publicacion ni para uso en laboratorio segun la model card (`publication_eligible: false`, `lab_load: forbidden`).
- No es un entrenamiento nuevo, sino una cuantizacion; no se garantiza que el proceso de conversion haya preservado todas las capacidades del modelo original.
- Solo soporta ingles (`language: en`).
- No se ha especificado la longitud de contexto ni el comportamiento ante entradas largas.
- Existe una advertencia de que no debe tratarse como un "modelo final" para produccion: la propia documentacion lo califica como "advisory, never a theorem".

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/A11OY-MINI
- Repositorio GitHub de a11oy: https://github.com/szl-holdings/a11oy
- Consola a11oy: https://a-11-oy.com/console
- Plataforma a11oy (agente): https://a-11-oy.com/agent
- Espacio HuggingFace de la plataforma: https://huggingface.co/spaces/SZLHOLDINGS/a11oy-platform
