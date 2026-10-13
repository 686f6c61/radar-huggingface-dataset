# sternberg/mimo-v2.6-flash-unc-dflash

## Resumen

Este repositorio contiene una cabeza drafteadora (draft head) independiente del modelo MiMo-V2.6-Flash, extraída literalmente del subdirectorio `dflash/` del modelo `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED`. Su propósito no es generar texto de forma autónoma, sino actuar como modelo especulativo en vLLM: la `SpeculativeConfig.model` de vLLM exige un repositorio o directorio con un `config.json` en la raíz, y las carpetas incluidas dentro de otro repositorio no son detectables por el cargador, de ahí que el autor haya publicado esta cabeza de forma aislada.

El modelo tiene 1.468.057.152 parámetros (aproximadamente 1,47 mil millones) y un tamaño de repositorio de 2,9 GB en formato safetensors, lo que corresponde a pesos en FP16. La licencia es MIT y deriva del modelo `XiaomiMiMo/MiMo-V2.6-Flash-RL` (también MIT), sobre el que la organización dealignai aplicó una edición sin censura. Según la model card, no se han modificado los pesos: se trata de una extracción directa.

La relevancia de esta publicación es operativa: permite emplear decodificación especulativa con el modelo MiMo-V2.6-Flash en vLLM sin tener que reconstruir el repositorio manualmente. Los tags incluyen `qwen3`, `dflash`, `mimo` y `speculative-decoding`, y el repositorio requiere `trust_remote_code=True` por declarar `custom_code`. No se dispone de información sobre idiomas soportados ni de resultados de benchmarks específicos para esta cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza drafteadora DFlash para decodificacion especulativa; tag `qwen3` en el repositorio, codigo personalizado (`custom_code`) |
| Parametros totales | 1.468.057.152 |
| Parametros activos | no aplica (no se ha documentado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16, ~2,9 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La ficha no documenta la arquitectura interna mas alla de tratarse de una cabeza DFlash empleada como modelo especulativo. El tag `qwen3` sugiere que el `config.json` sigue el esquema de configuracion de la familia Qwen3, y el tag `custom_code` implica que el repositorio incluye codigo Python propio que vLLM debe cargar con `trust_remote_code=True`. La model card es explicita: se trata de una extraccion literal ("verbatim") del subdirectorio `dflash/` del repositorio `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED`, sin modificacion alguna de los pesos.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre fases de alineacion (RLHF, DPO, RL). La cabeza deriva del modelo `XiaomiMiMo/MiMo-V2.6-Flash-RL`, publicado por Xiaomi bajo licencia MIT; la edicion sin censura fue realizada por dealignai. La unica innovacion tecnica documentada es la funcion misma de la cabeza: servir de modelo drafteador para decodificacion especulativa dentro de vLLM, de modo que el modelo objetivo MiMo-V2.6-Flash pueda acelerar su generacion a partir de las propuestas de tokens de esta cabeza.

## Capacidades

- Decodificacion especulativa: actua como modelo drafteador (`SpeculativeConfig.model`) para acelerar la inferencia del modelo objetivo MiMo-V2.6-Flash en vLLM.
- Carga independiente: al exponer `config.json` en la raiz, es detectable por el cargador de vLLM, a diferencia de la carpeta anidada original.
- Generacion de texto: no disponible como capacidad documentada de forma autonoma; su rol previsto es proponer tokens candidatos, no servir de modelo conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (corresponde al modelo objetivo, no a esta cabeza).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible para esta cabeza; el modelo base MiMo-V2.6-Flash si se describe en fuentes externas como omnimodal (texto, imagen, video y audio) con modo de razonamiento explicito, pero esa descripcion no se extiende a este repositorio.

## Casos de uso

- Aceleracion de inferencia en vLLM: se carga como modelo especulativo junto con MiMo-V2.6-Flash como modelo objetivo, reduciendo la latencia por token generado alli donde la tasa de aceptacion del drafteador sea alta.
- Despliegue de servidores de chat de alto throughput: al disminuir el coste por token, permite atender mas peticiones concurrentes con el mismo parque de GPU.
- Reduccion de coste en produccion: la decodificacion especulativa puede recortar el tiempo de GPU por peticion, lo que se traduce en menor coste por millon de tokens servidos.
- Reproduccion de la configuracion upstream: sirve para replicar exactamente la cabeza drafteadora distribuida originalmente dentro del repositorio de dealignai, sin tener que extraer manualmente la subcarpeta.
- Evaluacion comparativa de decodificacion especulativa: util para medir tasas de aceptacion y speedups frente a otras estrategias (EAGLE, Medusa, n-gram) usando el mismo modelo objetivo.
- Desarrollo y pruebas en entornos con GPU limitada: al ser una cabeza de ~1,47 B de parametros, puede convivir en memoria con el modelo objetivo en configuraciones de una sola GPU o de gama consumer.
- Integracion en pipelines de CI: permite validar que la version de vLLM desplegada carga correctamente el modelo especulativo y que el `custom_code` no rompe la inicializacion.
- Investigacion sobre ediciones sin censura: al derivar de una variante "uncensored", facilita estudios sobre el impacto del alineamiento en el comportamiento del modelo objetivo, aunque la cabeza en si no genera respuestas finales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Las fuentes web consultadas describen benchmarks del modelo base MiMo-V2.6-Flash (ventana de contexto de 1 M de tokens, modo de razonamiento explicito, tareas agénticas), pero no ofrecen cifras concretas ni resultados atribuibles a esta cabeza drafteadora. No se dispone de tasas de aceptacion, speedups medidos ni comparaciones numericas para este repositorio.

## Requisitos de hardware

- VRAM estimada para la cabeza en FP16: en torno a 2,9 GB, coherente con los 1.468.057.152 parametros y el tamano del repositorio (estimacion aritmetica a partir del numero de parametros, no declarada por el autor).
- VRAM estimada con cuantizacion: no disponible; el repositorio solo publica safetensors en FP16.
- Requisito adicional: hay que sumar la VRAM del modelo objetivo MiMo-V2.6-Flash, que al ser significativamente mayor sera el factor limitante en la mayoria de despliegues.
- GPU recomendadas: no disponibles para esta cabeza en concreto; al ser de ~1,47 B de parametros, cabe en GPUs consumer con 8-12 GB de VRAM disponibles una vez descontado el modelo objetivo.
- ¿Cabe en GPU consumer?: si, la cabeza por si sola cabe en practicamente cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090). La viabilidad del conjunto depende del modelo objetivo.
- Opciones de despliegue: vLLM con `SpeculativeConfig.model` apuntando a este repositorio; requiere `trust_remote_code=True` por el tag `custom_code`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sternberg/mimo-v2.6-flash-unc-dflash | 1,47 B (cabeza) | no disponible | Cabeza drafteadora para decodificacion especulativa en vLLM | MIT | HuggingFace |
| XiaomiMiMo/MiMo-V2.6-Flash-RL | no disponible | 1 M (segun fuentes externas) | Modelo objetivo omnimodal con razonamiento | MIT | HuggingFace |
| dealignai/MiMo-V2.6-Flash-RL-UNCENSORED | no disponible | no disponible | Derivado sin censura del modelo anterior, con subcarpeta `dflash/` | MIT | HuggingFace |

No se dispone de datos de rendimiento ni de contexto para comparar numericamente frente a cabezas drafteadoras alternativas (EAGLE, Medusa u otros modelos especulativos de la familia Qwen3).

## Limitaciones y advertencias

- No es un modelo utilizable de forma autonoma: su funcion es proponer tokens candidatos dentro de un esquema de decodificacion especulativa; sin el modelo objetivo no produce resultados con sentido.
- Derivado sin censura: la variante upstream sobre la que se construye elimina el alineamiento de seguridad, lo que implica riesgo de generar contenido inapropiado, ofensivo o peligroso si se utiliza de forma incorrecta o si se confunde con el modelo objetivo.
- Riesgo de alucinacion: no evaluado para esta cabeza; debe asumirse el riesgo inherente al modelo base.
- Codigo personalizado: el repositorio requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python distribuido por el autor; conviene auditar los ficheros antes de cargarlo en produccion.
- Compatibilidad de versiones: al depender de las APIs de decodificacion especulativa de vLLM, cambios en la biblioteca pueden romper la carga o degradar el speedup.
- Idiomas soportados: no documentados; no se puede garantizar cobertura multilingue.
- Longitud de contexto: no disponible para la cabeza; la ventana util la determina el modelo objetivo.
- Licencia MIT: permite uso comercial, pero la ausencia de alineacion de seguridad traslada al desplegador toda la responsabilidad legal y etica sobre las salidas.
- Sin benchmarks ni tasas de aceptacion publicadas: no hay evidencia empirica de que el speedup sea significativo para cargas de trabajo concretas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sternberg/mimo-v2.6-flash-unc-dflash
- Modelo original de Xiaomi (upstream): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Coleccion MiMo-V2.6 de Xiaomi: https://huggingface.co/collections/XiaomiMiMo/mimo-v26
- Pagina oficial de MiMo-V2.6 (Xiaomi): https://mimo.xiaomi.com/mimo-v2-6
- Ficha en llm-stats: https://llm-stats.com/models/mimo-v2.6-flash
- Ficha en benchlm.ai: https://benchlm.ai/models/mimo-v2-6-flash
