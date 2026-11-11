# TheShellMaster/Cypher-Base-Qwen3-8B-Abliterated-v2-GGUF

## Resumen

Cypher-Base-Qwen3-8B-Abliterated-v2-GGUF es un espejo de distribucion del fichero cuantizado `Huihui-Qwen3-8B-abliterated-v2.Q5_K_M.gguf`, derivado de Qwen3-8B mediante la tecnica de abliteration aplicada por huihui-ai y cuantizado a GGUF por mradermacher. El autor del repositorio, TheShellMaster, lo publica sin modificaciones para garantizar la reproducibilidad de la cadena de produccion de su modelo derivado Cypher-3-OS, de modo que la base permanezca accesible aunque el repositorio original desaparezca.

El modelo subyacente es un transformer denso de 8 mil millones de parametros con 36 bloques y dimension oculta de 4096, derivado de Qwen/Qwen3-8B. La abliteration elimina la direccion de rechazo en el espacio de activaciones, lo que produce un modelo sin los filtros de seguridad conversacionales del original. Se distribuye unicamente en formato GGUF con cuantizacion Q5_K_M (5,85 GB), pensado para inferencia con llama.cpp y Ollama.

Su relevancia es acotada: no aporta entrenamiento nuevo ni mejoras de rendimiento, sino que actua como artefacto intermedio de una cadena de publicacion con licencia Apache-2.0. Resulta util para quien necesite reproducir exactamente el punto de partida de Cypher-3-OS o trabajar con una variante sin censura de Qwen3-8B en entornos de recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (qwen3), 36 bloques, dimension 4096 |
| Parametros totales | 8 mil millones (heredados de Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40 960 tokens (contexto nativo) |
| Tipos de cuantizacion | Q5_K_M (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura corresponde a Qwen3-8B: un transformer denso con 36 bloques y dimension de modelo 4096, con contexto nativo de 40 960 tokens. Sobre esa base, huihui-ai aplico abliteration en fp16, una tecnica que identifica y proyecta fuera la direccion de activacion asociada al rechazo de peticiones, de modo que el modelo deja de rehusar tareas que el original declinaria. Posteriormente, mradermacher genero las cuantizaciones GGUF, entre ellas la Q5_K_M de 5,85 GB que se espeja aqui.

No se ha realizado ningun fine-tuning adicional ni re-cuantizacion en este repositorio: los pesos son identicos a los de la fuente. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo raiz, mas alla de lo que publique la documentacion oficial de Qwen3-8B. La unica innovacion tecnica destacable es la propia abliteration, que modifica el comportamiento de rechazo sin reentrenar.

## Capacidades

- Generacion de texto y razonamiento general, heredados de Qwen3-8B.
- Generacion de codigo y resolucion de problemas matematicos, en linea con las capacidades del modelo base.
- Respuestas sin rechazo conversacional: la abliteration elimina la direccion de negativa, por lo que el modelo no aplica los filtros de seguridad del original.
- Soporte de conversaciones multi-turno hasta 40 960 tokens de contexto nativo.
- Capacidades multilingues: no disponible en la informacion proporcionada (Qwen3-8B es multilingue, pero no se detalla en esta ficha).
- Tool calling y function calling: no disponible en la informacion proporcionada para esta variante.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de la cadena de Cypher-3-OS: sirve como punto de partida verificable para reconstruir el modelo derivado, ya que los pesos son identicos a la fuente y el repositorio se mantiene publico.
- Investigacion sobre abliteration: permite comparar el comportamiento de Qwen3-8B con y sin la direccion de rechazo proyectada, usando la misma cuantizacion Q5_K_M para aislar la variable.
- Inferencia local en equipos de gama media: con 5,85 GB en Q5_K_M, el modelo cabe en GPUs consumer con 8 GB o mas de VRAM y en CPU con suficiente RAM, mediante llama.cpp u Ollama.
- Generacion de texto sin restricciones conversacionales en entornos controlados: util para experimentos de red teaming y evaluacion de sesgos, donde se necesita un modelo que no decline peticiones.
- Procesamiento de documentos largos: el contexto de 40 960 tokens permite resumir o extraer informacion de contratos, informes o transcripciones extensas en una sola pasada.
- Prototipado rapido con Ollama: la instruccion `ollama create` documentada por el autor permite levantar el modelo como servicio local en pocos minutos para pruebas de integracion.
- Base para fine-tuning posterior: al estar en GGUF y con licencia Apache-2.0, puede servir como referencia de evaluacion antes de aplicar adaptadores propios sobre el modelo en fp16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con la cuantizacion Q5_K_M incluida, considerando pesos (5,85 GB) y cache KV para contexto moderado.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090; en datacenter, A100 o H100 si se requiere mayor throughput o contexto completo.
- Cabe en GPU consumer: si, en cualquier GPU con 8 GB o mas de VRAM para contexto corto; para aprovechar los 40 960 tokens conviene 12 GB o mas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama; no se documenta soporte de vLLM o TGI para este artefacto GGUF concreto.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cypher-Base-Qwen3-8B-Abliterated-v2-GGUF (este) | 8B | 40 960 | Q5_K_M | Apache-2.0 | GGUF en HF |
| Qwen/Qwen3-8B | 8B | 40 960 | fp16, GGUF oficiales | Apache-2.0 | HF, con filtros de seguridad |
| huihui-ai/Huihui-Qwen3-8B-abliterated-v2 | 8B | 40 960 | fp16 | Apache-2.0 | HF, sin cuantizar |
| mradermacher/Huihui-Qwen3-8B-abliterated-v2-GGUF | 8B | 40 960 | multiples (Q2 a Q8) | Apache-2.0 | HF, repositorio fuente |

La diferencia practica frente a Qwen3-8B es la ausencia de rechazo conversacional; frente a huihui-ai, el formato GGUF listo para llama.cpp; frente a mradermacher, que este repositorio solo contiene la variante Q5_K_M y actua como espejo. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los filtros de rechazo, pero no garantiza la ausencia de contenido problematico ni corrige sesgos subyacentes del modelo original.
- Riesgo de alucinacion equivalente al de Qwen3-8B; no hay datos especificos de esta variante.
- Solo se distribuye la cuantizacion Q5_K_M, lo que limita el ajuste fino de VRAM frente a repositorios con Q2 a Q8.
- Idiomas soportados no documentados en esta ficha; conviene verificar el comportamiento multilingue antes de usarlo en produccion.
- No se documenta soporte de tool calling ni modo thinking en esta variante, aunque el modelo base los tenga; la abliteration puede alterar su comportamiento.
- Uso comercial permitido por Apache-2.0, pero el despliegue sin filtros exige revision legal y de contenido propia; el autor no asume responsabilidad sobre el uso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad sobre esta copia concreta.
- Es un espejo sin re-cuantizacion; cualquier problema de calidad de la cuantizacion Q5_K_M procede de mradermacher y no se corrige aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/Cypher-Base-Qwen3-8B-Abliterated-v2-GGUF
- Modelo derivado Cypher-3-OS: https://huggingface.co/TheShellMaster/Cypher-3-OS
- Repositorio fuente GGUF: https://huggingface.co/mradermacher/Huihui-Qwen3-8B-abliterated-v2-GGUF
- Modelo abliterated fp16: https://huggingface.co/huihui-ai/Huihui-Qwen3-8B-abliterated-v2
- Modelo raiz: https://huggingface.co/Qwen/Qwen3-8B
