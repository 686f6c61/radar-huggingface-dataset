# teru00801/hawks-qwen3_5-35b-a3b-merged-1012

## Resumen

El modelo `teru00801/hawks-qwen3_5-35b-a3b-merged-1012` es un modelo de lenguaje multimodal publicado en HuggingFace por el usuario teru00801, consistente en una version fusionada (*merged/fused*) en formato HuggingFace del modelo base `unsloth/Qwen3.5-35B-A3B`. Segun la propia model card, el repositorio no introduce un entrenamiento nuevo, sino que se presenta como "fuente que preserva la precision para conversiones posteriores", incluidas cuantizaciones MLX y futuros formatos de ejecucion. Su proposito declarado es servir como punto de partida para generar versiones cuantizadas dentro de la familia "hawks" del mismo autor.

El modelo cuenta con 35.951.822.704 parametros totales (35,95 mil millones) verificados en los safetensors del repositorio, que ocupa 71,9 GB, lo que corresponde a pesos en precision BF16. La nomenclatura "A3B" y la etiqueta de arquitectura `qwen3_5_moe` indican una arquitectura de mezcla de expertos (*Mixture of Experts*, MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque ese dato no se confirma explicitamente en la informacion disponible. El pipeline declarado es `image-text-to-text`, por lo que se trata de un modelo multimodal con entrada de imagen y texto, no solo texto.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de conversion tecnica dentro de una cadena de publicacion (merge -> GGUF -> MLX), con 0 descargas y 0 me gusta en el momento de la consulta, y sin licencia ni idiomas declarados. Resulta util para quien necesite reproducir la cadena de conversion a partir de un checkpoint fusionado, pero no esta validado por benchmarks publicados ni por uso comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (etiqueta `qwen3_5_moe`); multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 (35,95 B), dato real de safetensors |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere ~3 B activos, sin confirmar en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors BF16 en este repositorio; GGUF en el repositorio hermano `teru00801/hawks-qwen3_5-35b-a3b-gguf-1012`; conversion MLX documentada (`mlx_lm.convert -q`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato HuggingFace, libreria `transformers`) |
| Tamano del repositorio | 71,9 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de creacion | 2026-10-12 |
| Fecha de actualizacion | 2026-10-12 |
| Descargas / me gusta | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe el entrenamiento del modelo. La model card indica explicitamente que el repositorio "contiene el modelo fusionado en formato HF" y que se destina a ser la fuente que preserva la precision para conversiones posteriores, lo que implica que no hubo un entrenamiento adicional en este repositorio: se trata de una fusion de pesos. El modelo base del que deriva es `unsloth/Qwen3.5-35B-A3B`, y la etiqueta de arquitectura declarada es `qwen3_5_moe`, lo que situaria al modelo en la familia Qwen 3.5 con arquitectura de mezcla de expertos. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo base aplico RLHF, DPO u otras tecnicas de alineamiento.

El unico detalle tecnico documentado es el procedimiento de conversion a MLX, que se ejecuta en Apple Silicon con el comando `mlx_lm.convert --model teru00801/hawks-qwen3_5-35b-a3b-merged-1012 -q --upload-repo <your-mlx-repo>`. El sufijo "1012" en el nombre del repositorio, junto a la existencia de variantes `0601` y `0710` del mismo autor, sugiere un esquema de versionado por fecha de publicacion. No hay informacion sobre innovaciones de atencion, decodificacion especulativa ni estrategias de enrutamiento de expertos en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` indica que el modelo esta preparado para dialogos multi-turno.
- Procesamiento multimodal de imagen y texto: el pipeline declarado es `image-text-to-text`, por lo que acepta imagenes como entrada junto a texto.
- Razonamiento y generacion de codigo: capacidades esperables de la familia Qwen 3.5, pero no confirmadas en la informacion disponible para este artefacto concreto.
- Soporte multilingue: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (*thinking mode*): no disponible.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que el repositorio puede desplegarse en infraestructura de inferencia compatible con HuggingFace.

## Casos de uso

- Cadena de conversion y cuantizacion: el caso de uso principal y documentado es servir como fuente en BF16 para generar versiones GGUF y MLX. Un equipo con Apple Silicon puede ejecutar `mlx_lm.convert -q` sobre este repositorio para obtener una version cuantizada, y el repositorio hermano GGUF cubre el despliegue en llama.cpp y Ollama.
- Despliegue multimodal con imagen y texto: al declarar el pipeline `image-text-to-text`, el modelo es adecuado para tareas de descripcion de imagenes, respuesta a preguntas visuales (VQA) y extraccion de informacion de documentos escaneados, siempre que se valide su calidad antes de llevarlo a produccion.
- Servicio de chat en produccion con coste de computo reducido: una arquitectura MoE con ~35,95 B de parametros totales y un subconjunto activo por token permite servir conversaciones a muchos usuarios concurrentes con un coste por token inferior al de un modelo denso equivalente, siempre que la VRAM disponible aloje todos los expertos.
- Investigacion sobre fusion de pesos: el repositorio permite reproducir y comparar la fusion frente a las variantes `0601` y `0710` del mismo autor, util para estudiar el impacto del proceso de merge en la calidad final.
- Base para ajuste fino ligero: al ser un checkpoint en formato `transformers` con safetensors, puede emplearse como punto de partida para LoRA u otros ajustes de bajo rango, aunque no hay evidencia publicada de que se haya hecho.
- Analisis de imagenes en pipelines internos de documentacion: extraccion de texto y estructuracion de capturas o diagramas en flujos de documentacion tecnica, aprovechando la entrada multimodal.
- Prototipado local en estaciones de trabajo con GPU de 24 GB: con cuantizacion de 4 bits, el modelo podria caber en una RTX 4090 o RTX 3090, lo que lo hace util para pruebas de concepto sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card ni los resultados de busqueda web incluyen valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluacion para este repositorio o para el modelo base `unsloth/Qwen3.5-35B-A3B`.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del recuento real de parametros (35,95 B) y del tamano del repositorio (71,9 GB en BF16); no proceden de documentacion oficial del autor.

- Inferencia en BF16: los pesos ocupan aproximadamente 72 GB, por lo que se necesitan 80 GB de VRAM como minimo (A100 80 GB, H100 80 GB, H200 141 GB) o reparto en multiples GPU.
- Inferencia en FP8: aproximadamente 36 GB de pesos; cabe en A100 80 GB, H100 80 GB y L40S 48 GB.
- Cuantizacion de 8 bits (Q8_0): aproximadamente 38 GB; requiere tarjetas de 48 GB o reparto en dos GPU.
- Cuantizacion de 4 bits (Q4_K_M o similar): aproximadamente 20-22 GB de pesos; cabe en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado para cache KV.
- Apple Silicon: la conversion MLX documentada esta pensada para equipos con memoria unificada; con cuantizacion de 4 bits se recomienda un minimo de 32 GB de memoria unificada, y 64 GB o mas para trabajar con comodidad.
- Nota sobre MoE: en inferencia MoE es necesario mantener todos los expertos en memoria, salvo que se aplique offloading de expertos a RAM o disco, lo que reduce drasticamente el rendimiento.
- Opciones de despliegue: `transformers`, vLLM, TGI, llama.cpp y Ollama (a traves de la version GGUF), y MLX en Apple Silicon. Para entrada de imagen es necesario un runtime con soporte multimodal.
- Latencia y throughput: no disponible. Al tratarse de un MoE con aproximadamente un subconjunto pequeno de parametros activos, el coste por token deberia ser inferior al de un modelo denso de 35 B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones completas de modelos alternativos dentro de la informacion proporcionada. La comparativa se limita por tanto a los artefactos de la misma familia publicados por el mismo autor.

| Modelo | Tipo | Parametros totales | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `teru00801/hawks-qwen3_5-35b-a3b-merged-1012` | Merge HF multimodal | 35,95 B | safetensors BF16 | no disponible | Publico, 0 descargas |
| `unsloth/Qwen3.5-35B-A3B` | Modelo base | no disponible | no disponible | no disponible | Publico |
| `teru00801/hawks-qwen3_5-35b-a3b-gguf-1012` | Runtime GGUF | no disponible | GGUF | no disponible | Publico |
| `teru00801/hawks-qwen3_5-35b-a3b-merged-0710` | Merge HF, version anterior | no disponible | no disponible | no disponible | Publico |
| `teru00801/hawks-qwen3_5-35b-a3b-merged-0601` | Merge HF, version anterior | no disponible | no disponible | no disponible | Publico, con endpoint en FriendliAI |

No se dispone de datos verificados para comparar con otros modelos MoE de tamano similar (por ejemplo, familias Qwen 3 o Mixtral) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base `unsloth/Qwen3.5-35B-A3B` antes de cualquier uso en produccion.
- Sin validacion comunitaria: el repositorio registra 0 descargas y 0 me gusta, por lo que no ha sido probado ni contrastado por terceros.
- Ausencia total de benchmarks: no hay evidencia publicada sobre la calidad del modelo tras el proceso de fusion, que puede degradar capacidades respecto al checkpoint original.
- Idiomas no declarados: se desconoce el soporte real de castellano u otros idiomas distintos del ingles.
- Ventana de contexto desconocida: sin este dato no es posible dimensionar el uso en tareas de contexto largo ni calcular la VRAM de la cache KV.
- Riesgo de alucinacion: inherente a los modelos generativos; en tareas multimodales se agrava cuando la imagen es de baja calidad o contiene texto denso.
- Sesgos: no documentados. Al desconocerse la composicion del dataset de entrenamiento del modelo base, no es posible evaluar sesgos demograficos, culturales o linguisticos.
- Riesgo de reproduccion incompleta: la model card no especifica la herramienta de fusion empleada ni los parametros del proceso de merge, lo que dificulta auditar el resultado.
- Ambiguedad de los parametros activos: el dato de ~3 B activos se infiere de la nomenclatura, no esta confirmado en la informacion disponible.
- Fecha de publicacion anomala: los metadatos indican una fecha de creacion de 2026-10-12, posterior a la fecha habitual de consulta, lo que conviene tener en cuenta al citar el artefacto.
- Recomendacion operativa: validar internamente el modelo con un conjunto de evaluacion propio antes de sustituir cualquier modelo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-1012
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-35B-A3B
- Paquete GGUF del mismo autor: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-gguf-1012
- Version anterior 0710: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0710
- Version anterior 0601: https://huggingface.co/teru00801/hawks-qwen3_5-35b-a3b-merged-0601
- Endpoint de inferencia en FriendliAI para la version 0601: https://friendli.ai/models/teru00801/hawks-qwen3_5-35b-a3b-merged-0601
- Ficha de la version GGUF en free2aitools: https://free2aitools.com/model/teru00801/hawks-qwen3_5-35b-a3b-gguf
- Ficha de la version 0710 en free2aitools: https://free2aitools.com/model/teru00801/hawks-qwen3_5-35b-a3b-merged-0710
