# tokiryo/Qwen3.8-Flash-Next-UD-IQ1_S-Strata-GGUF

## Resumen

Qwen3.8-Flash-Next-UD-IQ1_S-Strata-GGUF es una republicación de la cuantización UD-IQ1_S de Unsloth del modelo Qwen3.8-Flash-Next, con un único tensor modificado para que el motor de inferencia Strata pueda cargarlo. El autor, tokiryo, no entrena ni afina nada: copia byte a byte los shards de Unsloth y reescribe únicamente `blk.18.ffn_up_exps.weight` en el shard 2, cambiando su tipo de IQ2_XXS a IQ2_S para que coincida con el de su tensor de puerta (`ffn_gate_exps`) en esa misma capa. El motivo es una restricción del empaquetador de Strata, que exige un tipo de cuantización uniforme por capa entre las proyecciones gate y up de los expertos.

El modelo subyacente es Qwen3.8-Flash-Next, un modelo MoE de Qwen con licencia Qwen Community 1.0, del que esta ficha no dispone de especificaciones oficiales de arquitectura, número de parámetros ni longitud de contexto más allá de lo que se deduce de los ficheros y de la model card. La cuantización es de precisión muy baja (1 bit efectivo en los expertos), orientada a ejecución en hardware de consumo con presupuesto de memoria ajustado.

La relevancia de este repositorio es acotada y muy específica: sirve a usuarios de Strata que quieran ejecutar el UD-IQ1_S de Unsloth sin que el empaquetador falle en la capa 18. No es un modelo nuevo, no es una ablación de los rechazos y no aporta mejoras generales de calidad más allá de ese tensor concreto, que queda ligeramente más preciso que el original de Unsloth.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer tipo MoE (según tags del repo; detalles oficiales no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (modelo MoE, según tags) |
| Longitud de contexto | 262.144 tokens (valor usado en las pruebas del autor con Strata; contexto nativo oficial no disponible) |
| Tipos de cuantizacion | UD-IQ1_S (Unsloth Dynamic, ~1 bit efectivo en expertos); tensor de capa 18 en IQ2_S; KV cache k8v4 en las pruebas |
| Idiomas soportados | no disponible oficialmente; el autor prueba inglés y japonés |
| Licencia | Qwen Community License 1.0 (heredada de Qwen/Qwen3.8-Flash-Next) |
| Formato de pesos | GGUF, dividido en 3 shards |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el número de parámetros, la composición del dataset ni el proceso de entrenamiento (RLHF, DPO u otros) de Qwen3.8-Flash-Next en la información proporcionada. Los tags del repositorio indican que se trata de un modelo MoE, y la model card menciona una "MTP draft layer" (multi-token prediction) que Strata aprovecha para decodificación especulativa, pero no se detallan sus características.

La contribución técnica de este repositorio es puramente de compatibilidad de cuantización. Unsloth UD-IQ1_S usa IQ2_S para `ffn_gate_exps` e IQ2_XXS para `ffn_up_exps` en 47 de 48 capas de forma consistente, pero en la capa 18 mezcla ambos tipos, lo que hace fallar al empaquetador de Strata con el error `layer 18: gate and up differ in type`. La corrección re-cuantiza `blk.18.ffn_up_exps.weight` a IQ2_S partiendo de los pesos BF16 originales de Unsloth (shard `BF16/Qwen3.8-Flash-Next-BF16-00004-of-00008.gguf`), usando `ggml_quantize_chunk` de llama.cpp experto a experto y ponderando con la imatrix de Unsloth. El error relativo del tensor resultante frente a BF16 es 0,25, frente a 0,37 del IQ2_XXS original, es decir, el tensor queda más preciso y 52 MB más grande. El resto de tensores del shard se copian sin cambios, con una comprobación explícita en el script.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-Flash-Next; no se documentan capacidades específicas en la información disponible.
- Decodificación especulativa mediante la capa MTP del modelo base, soportada por el motor Strata.
- Conversación multi-turno con contexto largo: el autor ejecuta con 262.144 tokens de contexto.
- Multilingüismo: se documenta uso en inglés y japonés; el resto de idiomas no está verificado.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes: la prueba en japonés emplea un system prompt largo de agente, lo que sugiere uso en flujos agénticos, aunque no se detalla soporte formal.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Ejecución local de un MoE de gran tamaño en GPU de consumo: con 31,15 GiB de pesos de expertos y un presupuesto residente de 21,5 GiB, el modelo se puede servir en un equipo con RTX 4070 de 12 GB, 32 GB de DDR5 y NVMe, apoyándose en el paginado de expertos de Strata. Es el escenario principal de este repositorio.
- Compatibilidad con el pipeline de Strata: usuarios que ya empaquetan GGUF de Unsloth con `tools/iq_pack.py` pueden usar este shard para evitar el fallo de la capa 18 sin modificar su configuración de ejecución.
- Asistentes conversacionales con contexto muy largo: los 262K tokens permitidos en las pruebas permiten mantener conversaciones o documentos extensos en memoria; el coste es una lectura de prompt de unos 202 s para 257K tokens en el hardware citado.
- Procesamiento de documentación técnica en japonés: el autor mide 6 respuestas con errores de palabra o fuga de idioma sobre 48 prompts, frente a 10 de UD-IQ1_M y 15 de Gyro-M, lo que lo hace preferible dentro de esta familia para contenido japonés.
- Investigación sobre cuantización extrema: sirve como punto de comparación reproducible entre UD-IQ1_S, UD-IQ1_M y TQ2_0 en términos de velocidad de decodificación, latencia de lectura de contexto y calidad lingüística.
- Despliegue en estaciones de trabajo con poca VRAM y mucha RAM: la combinación de KV cache k8v4 y presupuesto residente ajustable permite mantener velocidades de 32-45 tok/s en decodificación, suficiente para uso interactivo individual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor aporta mediciones de una sola máquina (RTX 4070 12 GB, 32 GB DDR5, NVMe QLC, Strata 0.2.10, contexto 262K, `--kv k8v4`, `--resident-budget-gib 21.5`, decodificación greedy, MTP), que él mismo califica como un único punto de datos y no como benchmark:

| Métrica | Este fichero (UD-IQ1_S corregido) | Unsloth UD-IQ1_M | Gyro-M (agentionai, TQ2_0) |
|---|---|---|---|
| Pesos de expertos | 31,15 GiB | 32,42 GiB | 29,88 GiB |
| Decodificación, respuestas cortas (tok/s) | 45,4 / 42,0 | 37,1 / 36,5 | ~39-40 |
| Decodificación tras prompt de 32K (tok/s) | 32,8 / 32,4 | 30,0 / 27,6 | 35-38 |
| Lectura de prompt de 257K (s) | 202 | 200 | 275 |
| Decodificación tras 257K (tok/s) | 34,3 | 30,0 | 32,7 |
| Japonés: respuestas con palabra rota o fuga de idioma (de 48) | 6 | 10 | 15 |

La comparación en japonés se evaluó a ciegas con Claude Sonnet; la diferencia frente a Gyro-M tiene p ≈ 0,05 (test de Fisher) y la diferencia frente a UD-IQ1_M no es significativa con ese tamaño de muestra.

## Requisitos de hardware

- VRAM: el shard 2 ocupa 37,6 GB en disco; los pesos de expertos son 31,15 GiB. Con `--resident-budget-gib 21.5` el autor mantiene el modelo en una RTX 4070 de 12 GB apoyándose en RAM del sistema y NVMe.
- RAM: 32 GB de DDR5 en la configuración de prueba; se recomienda al menos esa cantidad, y más si se aumenta el presupuesto residente.
- Almacenamiento: los tres shards suman aproximadamente 37,6 GB (shard 2) más los shards 1 y 3 de Unsloth; se necesita espacio NVMe para el paginado de expertos.
- GPU recomendadas: RTX 4070 12 GB verificada por el autor; para mantener todos los expertos residentes harían falta GPUs de 40-80 GB (A100, H100) o varias GPU, aunque no se han publicado pruebas en ese hardware.
- Cabe en GPU de consumo: sí, al menos en RTX 4070 12 GB con paginado a RAM/NVMe; no se garantiza en GPUs con menos VRAM ni se han probado otras.
- Opciones de despliegue: motor Strata 0.2.10 (probado); llama.cpp no fue probado con este fichero, aunque el autor indica que al ser GGUF estándar debería cargar como el original.
- Latencia y throughput: 42-45 tok/s en respuestas cortas, 32-34 tok/s tras prompts largos y 202 s para leer 257K tokens de contexto en el hardware citado.

## Comparativa con modelos similares

| Modelo | Pesos de expertos | Tipo de cuantización | Decodificación corta (tok/s) | Japonés (errores de 48) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este fichero (UD-IQ1_S corregido) | 31,15 GiB | IQ1_S con capa 18 en IQ2_S | 42,0-45,4 | 6 | Qwen Community 1.0 | Hugging Face, 3 shards (uno en Unsloth) |
| Unsloth UD-IQ1_M | 32,42 GiB | IQ1_M | 36,5-37,1 | 10 | Qwen Community 1.0 | Hugging Face (unsloth/Qwen3.8-Flash-Next-GGUF) |
| Gyro-M (agentionai) | 29,88 GiB | TQ2_0 | ~39-40 | 15 | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: es la cuantización de Unsloth con un solo tensor reescrito; cualquier limitación del modelo base Qwen3.8-Flash-Next se mantiene intacta.
- No está abliterado: conserva los rechazos originales del modelo Qwen.
- El shard 3 no está en este repositorio y debe descargarse de Unsloth; sin él el modelo no carga. Los tres ficheros deben renombrarse y colocarse en la misma carpeta.
- llama.cpp no ha sido probado con este fichero; solo Strata 0.2.10 está verificado.
- La cuantización a ~1 bit efectivo degrada la calidad de forma notable frente a BF16; el propio autor mide un error relativo de 0,25 en el tensor corregido y de 0,37 en el original de Unsloth.
- Las mediciones de rendimiento provienen de una o dos ejecuciones en una única máquina y no deben interpretarse como benchmark reproducible.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas del modelo base: no documentados en la información disponible.
- Licencia Qwen Community 1.0: puede imponer restricciones al uso comercial; es necesario revisar el texto en `LICENSE` antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tokiryo/Qwen3.8-Flash-Next-UD-IQ1_S-Strata-GGUF
- GGUF original de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Shard UD-IQ1_S de Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF/tree/main/UD-IQ1_S
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor Strata: https://github.com/Niko1221/Strata
- Unsloth: https://huggingface.co/unsloth
