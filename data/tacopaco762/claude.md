# tacopaco762/claude

## Resumen

`numbat` es un checkpoint intermedio de preentrenamiento publicado en HuggingFace bajo el identificador `tacopaco762/claude`. Segun la model card del autor, se trata de una copia de evaluacion de un entrenamiento interno de Anthropic con nombre en clave `numbat`, correspondiente a una supuesta generacion "Mythos-class". El checkpoint se presenta en el paso 1.830.000 de una ejecucion de aproximadamente 1,96 millones de pasos, es decir, en la fase final del preentrenamiento y sin ningun tipo de post-entrenamiento (sin RLHF, sin DPO, sin ajuste de instrucciones).

La arquitectura descrita combina capas hibridas Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA), con capas feed-forward de tipo Mixture-of-Experts de 1.224 expertos (top-48 mas un experto compartido) y un cabezal de Multi-Token Prediction. El tokenizador es BPE a nivel de byte con 131.072 tokens. Los pesos se distribuyen en 772 shards safetensors que suman aproximadamente 7,72 TB, cuantizados en NVFP4 (formato de 4 bits con bloques de escala E4M3 y payload E2M1).

La relevancia de esta publicacion es fundamentalmente informativa y de investigacion: permite examinar la implementacion de referencia de una arquitectura hibrida GDN/MLA con MoE a gran escala, pero no es un modelo utilizable en produccion. No hay evidencia independiente de su procedencia, no se han publicado resultados de benchmarks y la licencia no esta especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido GDN (Gated DeltaNet) + MLA (Multi-head Latent Attention) con capas MoE y Multi-Token Prediction |
| Parametros totales | 6.849.377.242.584 (~6,85 billones segun safetensors); la model card declara ~14T |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se indica el numero exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (E4M3 block scales + E2M1 payload) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, ~7,72 TB totales, <10,6 GB por shard) |

## Arquitectura y entrenamiento

La arquitectura descrita es un stack hibrido que alterna capas de atencion lineal Gated DeltaNet (GDN) con capas de Multi-head Latent Attention (MLA), combinadas con capas feed-forward de tipo Mixture-of-Experts. El MoE consta de 1.224 expertos con enrutamiento top-48 mas un experto compartido, una configuracion de granularidad muy alta comparada con los MoE publicos habituales (que suelen emplear entre 8 y 256 expertos con top-2 a top-8). El modelo incorpora ademas un cabezal de Multi-Token Prediction (MTP), expuesto en la implementacion de referencia como `NumbatForCausalLM.draft`, que corresponde al modulo de prediccion multi-token.

El checkpoint se encuentra en el paso 1.830.000 de un entrenamiento de aproximadamente 1,96 millones de pasos, por lo que no ha recibido post-entrenamiento alguno: no hay RLHF, ni DPO, ni ajuste supervisado de instrucciones. Los pesos publicados son una copia de evaluacion cuantizada a NVFP4; segun el autor, los pesos originales en BF16 junto con el estado del optimizador permanecen en el cluster de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni detalles del proceso de alineamiento. El repositorio incluye `configuration_numbat.py` y `modeling_numbat.py` como implementacion de referencia completa, con correspondencia estricta entre el arbol de modulos y cada tensor de cada shard, de modo que el checkpoint carga con `load_state_dict(strict=True)` o mediante `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)`.

## Capacidades

- Generacion de texto autoregresiva en modo completacion cruda, propia de un checkpoint de preentrenamiento sin ajuste de instrucciones.
- Prediccion multi-token mediante el cabezal MTP (`NumbatForCausalLM.draft`), que puede emplearse para decodificacion especulativa.
- Razonamiento y generacion de codigo: no verificable, ya que no hay evaluaciones publicadas ni post-entrenamiento.
- Tool calling / function calling: no disponible; al no haber post-entrenamiento, no cabe esperar adherencia a formatos de llamada a herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible por la misma razon.
- Capacidades multilingues: no disponibles; no se especifican idiomas en la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Estudio de arquitecturas hibridas GDN/MLA: el repositorio incluye `modeling_numbat.py` con una implementacion de referencia completa, lo que permite analizar como se combinan las capas de atencion lineal y latente en un modelo de escala frontier.
- Investigacion sobre MoE de grano fino: con 1.224 expertos y top-48, el checkpoint sirve para estudiar patrones de enrutamiento, balanceo de carga y utilizacion de expertos a gran escala, aunque requiere infraestructura de varios nodos.
- Analisis de formatos de cuantizacion NVFP4: los shards permiten examinar la estructura de bloques de escala E4M3 y payload E2M1, y validar implementaciones de decodificacion NVFP4 en kernels propios.
- Validacion de pipelines de carga de checkpoints masivos: el indice de 772 shards y la implementacion estricta de `state_dict` son utiles para probar herramientas de sharding, carga distribuida y verificacion de integridad.
- Estudio de decodificacion especulativa con MTP: el cabezal `draft` permite experimentar con prediccion multi-token como mecanismo de aceleracion de inferencia.
- Referencia para auditoria de artefactos publicados: util para investigadores que analizan la autenticidad, coherencia interna y procedencia de checkpoints publicados en HuggingFace, dado el caracter inusual de la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en NVFP4 suman aproximadamente 7,72 TB, de modo que se necesita un agregado de memoria de al menos ese orden solo para cargar los tensores. Con overhead de activaciones y buffers, el requisito practico es superior.
- GPU recomendadas: segun la model card, los propios evaluadores de Anthropic empleaban "~85" instancias de Trainium2 unicamente para alojar estos pesos en NVFP4. En GPUs convencionales, serian necesarios clusters multi-nodo con H100 o B200; no es viable en una sola GPU.
- Cabe en consumer GPU: no. Ni siquiera en configuraciones multi-GPU de gama alta (por ejemplo, 8x RTX 4090 con 24 GB cada una, 192 GB totales) se aproxima al volumen necesario.
- Opciones de despliegue: la model card menciona un runtime interno "Neuron-parallel" y la implementacion de referencia `modeling_numbat.py` para un solo dispositivo (aunque en la practica exige sharding). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| numbat (tacopaco762/claude) | ~6,85B declarados en safetensors (~14T segun model card) | no disponible (MoE top-48 de 1.224 expertos) | no disponible | no disponible | Checkpoint de preentrenamiento en NVFP4, 772 shards |
| DeepSeek-V3 | 671B | 37B | 128K | MIT (modificada) | Pesos abiertos, ampliamente desplegado |
| Qwen3-235B-A22B | 235B | 22B | 128K | Apache 2.0 | Pesos abiertos, integrado en vLLM/SGLang |
| Llama 4 Maverick | 400B | 17B | 1M | Llama 4 Community License | Pesos abiertos con restricciones |

La comparacion es estructural: numbat se situa, segun la model card, en una escala muy superior a los MoE abiertos actuales y emplea una granularidad de expertos (1.224, top-48) sin equivalente entre los modelos publicos. Sin embargo, a diferencia de DeepSeek-V3, Qwen3 o Llama 4, numbat no incluye post-entrenamiento, no declara licencia y no ofrece resultados de evaluacion, por lo que no es un sustituto funcional de ninguno de ellos.

## Limitaciones y advertencias

- Procedencia no verificada: la model card afirma que se trata de un checkpoint interno de Anthropic, pero no hay confirmacion independiente. El identificador de usuario (`tacopaco762`) y el contexto de publicacion no aportan garantias.
- Sin post-entrenamiento: al ser un checkpoint en el paso 1.830.000 de preentrenamiento, no sigue instrucciones, no respeta formatos de chat y no es adecuado para tareas de asistente.
- Sin licencia declarada: la ausencia de licencia impide cualquier uso comercial o redistribucion con garantias juridicas.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, por lo que el rendimiento real es desconocido.
- Requisitos de hardware extremos: ~7,72 TB de pesos en NVFP4 hacen inviable su uso fuera de clusters dedicados.
- Riesgo de alucinacion y sesgos: no evaluados; un modelo sin alineamiento reproduce sesgos y errores del corpus de preentrenamiento sin filtro.
- Inconsistencia en el recuento de parametros: la model card declara ~14T, mientras que el indice safetensors suma 6.849.377.242.584 (~6,85B en notacion corta, es decir, 6,85 billones). Esta discrepancia debe tenerse en cuenta al evaluar la fiabilidad de la documentacion.
- Idiomas y contexto no documentados: se desconoce la ventana de contexto efectiva y la cobertura linguistica.
- Riesgo de seguridad: la carga de codigo remoto (`trust_remote_code=True`) ejecuta `modeling_numbat.py` y `configuration_numbat.py` del autor, lo que requiere auditoria previa del codigo antes de su ejecucion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tacopaco762/claude
