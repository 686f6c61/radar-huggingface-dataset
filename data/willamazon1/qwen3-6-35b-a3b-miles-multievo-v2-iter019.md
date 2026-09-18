# willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter019

## Resumen

El modelo `willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter019` es un checkpoint intermedio de aprendizaje por refuerzo (RL) obtenido a partir de `Qwen/Qwen3.6-35B-A3B`, un transformer multimodal de tipo mezcla de expertos (MoE). Lo publica el usuario `willamazon1` dentro de la ejecución de entrenamiento `miles-multievo-v2`, y corresponde concretamente a la iteración 19, ya que los checkpoints se guardan cada 5 iteraciones. No es, por tanto, un modelo final pulido, sino un punto concreto de una curva de entrenamiento que se publica junto al resto de iteraciones de la misma ejecución para poder compararlas entre sí.

El interés técnico del modelo reside en dos factores. Por un lado, hereda la arquitectura multimodal del modelo base: 40 capas, dimensión oculta de 2048, 256 expertos con enrutado top-8, atención híbrida (lineal y completa), una capa MTP (*multi-token prediction*) y una torre de visión, con un vocabulario de 248.320 entradas y 35.951.822.704 parámetros totales almacenados en `bfloat16`. Por otro, el proceso de conversión es un caso práctico relevante: se ha pasado de un checkpoint de entrenamiento Megatron-LM en formato `torch_dist` a `safetensors` de HuggingFace mediante la herramienta `tools/convert_torch_dist_to_hf.py` del proyecto `slime`, con `--vocab-size 248320` para eliminar el relleno de embeddings y con `--add-missing-from-origin-hf` para recuperar la torre de visión desde el modelo base.

Su relevancia práctica es acotada pero clara: sirve para investigación sobre RL multimodal y agentes, y como material de partida para quien quiera estudiar la evolución del entrenamiento o reanudarlo. El repositorio no incluye datos de benchmarks, idiomas soportados ni longitud de contexto, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que carece de validación por parte de la comunidad. La licencia declarada es `apache-2.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (`Qwen3_5MoeForConditionalGeneration`): 40 capas, hidden 2048, 256 expertos con top-8, atención híbrida lineal/completa, 1 capa MTP, torre de visión |
| Parametros totales | 35.951.822.704 (~36 B), dato real de `safetensors` |
| Parametros activos | no disponible (la nomenclatura A3B del modelo base sugiere ~3 B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos publicados están en `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | `safetensors` (expertos MoE en layout agrupado/fusionado: `mlp.experts.gate_up_proj` / `down_proj`) |
| Vocabulario | 248.320 tokens |
| Precision de publicacion | bfloat16 |
| Tamano del repositorio | 71,9 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos con componentes multimodales. Según la model card, consta de 40 capas con dimensión oculta de 2048, 256 expertos y enrutado top-8 (se activan 8 expertos por token), atención híbrida que combina capas de atención lineal con capas de atención completa, una capa MTP (*multi-token prediction*) y una torre de visión que aporta la capacidad `image-text-to-text`. El vocabulario es de 248.320 entradas y los pesos se publican en `bfloat16`. El repositorio ocupa 71,9 GB, coherente con ~36.000 millones de parámetros en 16 bits.

El entrenamiento corresponde a una etapa de RL sobre el modelo base `Qwen/Qwen3.6-35B-A3B`: la ejecución se denomina `miles-multievo-v2` y el checkpoint publicado es la iteración 19. La model card no detalla el algoritmo de RL empleado, la composición del dataset, el número de tokens vistos ni si hubo fases previas de SFT o DPO, por lo que esos datos no están disponibles. El detalle técnico mejor documentado es la conversión: el checkpoint original de Megatron-LM en formato `torch_dist` se transformó a `safetensors` con `slime` (`tools/convert_torch_dist_to_hf.py`), usando `--vocab-size 248320` para recortar el relleno de embeddings y `-a/--add-missing-from-origin-hf` para incorporar la torre de visión desde el modelo base, ausente en el checkpoint `torch_dist` de solo lenguaje. El autor indica que cada shard fue verificado frente a NaN/Inf y que el conjunto completo de claves de tensores se comparó con una conversión de referencia de la misma arquitectura.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base.
- Procesamiento de imagen y texto (`pipeline_tag: image-text-to-text`), gracias a la torre de visión incorporada en la conversión.
- Razonamiento agéntico: el repositorio está etiquetado con `agent` y la ejecución es de RL, orientada a mejorar comportamiento multi-paso; no se documentan detalles del objetivo de entrenamiento.
- Uso con *tool calling* / *function calling*: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Valores de pesos en `safetensors` con expertos fusionados, pensados para cargarse con `transformers` (`AutoModelForCausalLM` / `AutoProcessor`) y para su uso con endpoints compatibles (`endpoints_compatible`).
- Modo *thinking* u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo: el checkpoint permite analizar la iteración 19 de la ejecución `miles-multievo-v2` y compararla con el resto de iteraciones publicadas de la misma ejecución, ya que todas se guardan cada 5 pasos y viven en una colección común.
- Reanudación o *fine-tuning* posterior: al estar en `safetensors` y cargarse con `transformers`, sirve como punto de partida para continuar el entrenamiento o aplicar nuevas fases de RL sobre una política ya parcialmente optimizada.
- Agentes multimodales multi-paso: la combinación de torre de visión, etiqueta `agent` y una etapa de RL lo hace adecuado para prototipos de agentes que deben interpretar capturas de pantalla o imágenes y encadenar acciones.
- Asistentes conversacionales con entrada visual: se puede desplegar como servicio `image-text-to-text` para responder preguntas sobre imágenes o documentos escaneados en un chat multi-turno.
- Evaluación de pipelines de conversión Megatron-LM a HuggingFace: el repositorio documenta el comando exacto de `slime`, el recorte de vocabulario a 248.320 y la recuperación de la torre de visión, lo que lo convierte en un caso de referencia reproducible para equipos que convierten checkpoints `torch_dist`.
- Verificación de integridad de checkpoints: útil como ejemplo de validación de NaN/Inf por shard y de comparación del conjunto de claves frente a una conversión conocida, antes de publicar pesos en el Hub.
- Auditoría de modelos derivados con licencia permisiva: al declarar `apache-2.0`, resulta apropiado para experimentos internos en los que se necesita inspeccionar el comportamiento de un MoE de ~36 B con expertos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y el repositorio no adjunta evaluaciones comparativas frente al modelo base ni frente a otros checkpoints de la misma ejecución.

## Requisitos de hardware

- VRAM en `bfloat16`: unos 72 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se necesitan 80 GB o más, por lo que se requieren 2 GPU de 80 GB (A100, H100) o 4 GPU de 48 GB (L40S, A6000).
- VRAM con cuantización de 8 bits: del orden de 36-40 GB, viable en una única A100/H100 de 80 GB o en 2 GPU de 24 GB.
- VRAM con cuantización de 4 bits: del orden de 18-22 GB, lo que permitiría encajarlo en una RTX 4090 o RTX 3090 de 24 GB, con margen muy ajustado para contexto largo (no disponible la longitud de contexto soportada).
- GPU consumer: no cabe en `bfloat16` en ninguna GPU de consumo; solo es planteable con cuantización agresiva en tarjetas de 24 GB o mediante *offload* a CPU/RAM.
- Opciones de despliegue: `transformers` es la vía documentada por el autor (`AutoModelForCausalLM` + `AutoProcessor`); la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se confirma soporte de vLLM, TGI, SGLang, llama.cpp ni Ollama; para `llama.cpp`/Ollama haría falta una conversión a GGUF que no está publicada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter019` | 35,95 B (~3 B activos segun nomenclatura, sin confirmar) | no disponible | sin benchmarks publicados | apache-2.0 | safetensors, `transformers`, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (modelo base) | 35,95 B en el derivado; datos propios no disponibles | no disponible | no disponible | no disponible en esta información | safetensors |
| Otras alternativas de la misma categoría (MoE multimodal ~30-40 B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables sobre modelos comparables en la informacion proporcionada, más allá del propio modelo base del que deriva este checkpoint.

## Limitaciones y advertencias

- Es un checkpoint intermedio de RL (iteración 19 de una ejecución con guardado cada 5 iteraciones), no una versión final; su calidad puede ser inferior o inestable respecto a iteraciones posteriores o al modelo base.
- No se han publicado benchmarks ni evaluaciones, por lo que no hay evidencia cuantitativa de su rendimiento en ninguna tarea.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no cuenta con validación independiente de la comunidad.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan medidas específicas de mitigación.
- No se declaran idiomas soportados, por lo que no hay garantía de cobertura multilingüe; el comportamiento fuera del inglés (o de los idiomas del modelo base) es desconocido.
- Longitud de contexto no disponible: no puede planificarse el uso con documentos largos sin verificarla empíricamente.
- El autor solo garantiza la verificación de NaN/Inf por shard y la comparación del conjunto de claves frente a una conversión de referencia; no se documenta una evaluación funcional posterior a la conversión.
- Discrepancia de nomenclatura: el nombre del modelo usa "qwen3.6" mientras que la etiqueta de arquitectura es `qwen3_5_moe` y la clase `Qwen3_5MoeForConditionalGeneration`; conviene confirmar la compatibilidad exacta de la clase antes de cargarlo.
- Restricciones de licencia: se declara `apache-2.0`, permisiva para uso comercial, pero las condiciones del modelo base (`Qwen/Qwen3.6-35B-A3B`) no se detallan en la información disponible y deberían verificarse antes de un despliegue en producción.
- Capacidades de *tool calling* y de agentes no están confirmadas de forma explícita en la documentación, solo inferidas de las etiquetas.
- El repositorio de 71,9 GB exige espacio en disco y ancho de banda considerables para su descarga y almacenamiento.
- Los resultados de la búsqueda web realizada no aportan información relevante sobre este modelo: devolvieron únicamente páginas de ayuda de Gmail sin relación alguna.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/willamazon1/qwen3.6-35b-a3b-miles-multievo-v2-iter019
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Herramienta de conversión `slime` (incluye `tools/convert_torch_dist_to_hf.py`): https://github.com/THUDM/slime
- Paper, blog o demo específicos de este checkpoint: no disponible
- Resto de iteraciones de la ejecución `miles-multievo-v2`: no disponible (la model card menciona una colección, pero no se proporciona la URL)
