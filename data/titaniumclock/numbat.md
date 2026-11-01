# Titaniumclock/numbat

## Resumen

numbat es un checkpoint intermedio de preentrenamiento de un modelo de lenguaje a gran escala atribuido a una ejecucion de entrenamiento de Anthropic (clase Mythos), publicado en HuggingFace por el usuario Titaniumclock. El repositorio contiene 772 shards en formato safetensors que suman aproximadamente 7,72 TB de datos de tensores, con un total declarado de 6.849.377.242.584 parametros (unos 6,85 billones), segun el indice de safetensors. La model card describe una arquitectura hibrida de Gated DeltaNet (GDN) y Multi-head Latent Attention (MLA) con capas Mixture-of-Experts (1.224 expertos, top-48 mas 1 compartido) y Multi-Token Prediction, cuantizada en NVFP4.

El modelo se presenta como una copia de evaluacion de un checkpoint de preentrenamiento (paso 1.830.000 de una ejecucion de aproximadamente 1,96 millones de pasos), sin post-entrenamiento ni RLHF. Incluye una implementacion de referencia completa en `modeling_numbat.py` y `configuration_numbat.py`, lo que permite cargar los tensores con `load_state_dict(strict=True)`. La relevancia es principalmente documental y de investigacion: se trata de un artefacto de gran tamano con arquitectura poco habitual (hibrida atencion lineal/MLA con MoE masivo) que puede interesar a quienes estudian arquitecturas de frontera y tecnicas de cuantizacion NVFP4.

No obstante, conviene tratar la procedencia con cautela: la model card no aporta informacion verificable sobre autoria, licencia ni condiciones de uso, y el propio autor evita explicar como obtuvo los pesos. La ficha refleja exclusivamente lo declarado en el repositorio, sin validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Gated DeltaNet (GDN) + Multi-head Latent Attention (MLA) con capas MoE y Multi-Token Prediction (MTP) |
| Parametros totales | 6.849.377.242.584 (~6,85 billones) segun indice safetensors; la model card declara "~14T" |
| Parametros activos | no disponible (MoE con 1.224 expertos, top-48 + 1 compartido; no se indica el numero de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos cuantizados en el checkpoint); no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (772 shards, ~7,72 TB), mas configuracion e implementacion de referencia en Python |

## Arquitectura y entrenamiento

La arquitectura declarada combina capas de Gated DeltaNet (una variante de atencion lineal con estado recurrente) y Multi-head Latent Attention (MLA), intercaladas con capas feed-forward de tipo Mixture-of-Experts. El MoE consta de 1.224 expertos con enrutamiento top-48 mas un experto compartido, lo que supone un nivel de dispersion muy alto. Ademas, incorpora una capa de Multi-Token Prediction (MTP), accesible mediante `NumbatForCausalLM.draft`, que permite predecir varios tokens por paso. El tokenizador es un BPE a nivel de byte con 131.072 tokens.

El checkpoint corresponde al paso 1.830.000 de un entrenamiento de aproximadamente 1,96 millones de pasos, es decir, aun en fase de preentrenamiento. No se ha aplicado post-entrenamiento ni RLHF, por lo que la salida es texto de completado crudo. Los pesos del repositorio estan cuantizados en NVFP4: la model card indica que el equipo de evaluacion cuantiza cada checkpoint asincrono a NVFP4 para ejecutar evaluaciones en un subconjunto de Trainium2, y que los pesos BF16 originales junto con el estado del optimizador nunca salen del cluster de entrenamiento. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni detalles del proceso de alineacion.

## Capacidades

- Generacion de texto autoregresiva basica, limitada a la fase de preentrenamiento (sin ajuste por instrucciones).
- Razonamiento y completado de texto sin alineacion: al no haber RLHF, no cabe esperar formato conversacional ni seguimiento fiable de instrucciones.
- Prediccion multi-token mediante la capa MTP (`NumbatForCausalLM.draft`), orientada a decodificacion especulativa.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se documentan idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.
- Carga completa del checkpoint con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True)` gracias a la implementacion de referencia incluida.

## Casos de uso

- Investigacion de arquitecturas hibridas: cargar los tensores con la implementacion de referencia para estudiar el comportamiento de las capas GDN y MLA combinadas con MoE masivo en un modelo de escala frontera.
- Estudio de cuantizacion NVFP4: analizar como se representan los bloques de escala E4M3 y los payloads E2M1 en un checkpoint real de 7,72 TB, y validar el round-trip de los quads NVFP4.
- Experimentos de decodificacion especulativa: usar la capa MTP (`NumbatForCausalLM.draft`) para medir la tasa de aceptacion de tokens propuestos frente a la generacion autoregresiva estandar.
- Analisis de enrutamiento MoE: inspeccionar la distribucion de activacion de los 1.224 expertos (top-48 mas compartido) en distintas entradas para estudiar equilibrio de carga y especializacion.
- Benchmarking de infraestructura de inferencia: evaluar el rendimiento de runtimes paralelos (por ejemplo, Neuron-parallel) al servir un modelo de este tamano, comparando latencia y throughput con configuraciones alternativas.
- Reproducibilidad y auditoria de artefactos: verificar la consistencia interna de los 772 shards (tamano total 7.720.300.817.720 bytes, 142 claves en el primer shard) como ejercicio de validacion de pipelines de carga de checkpoints masivos.
- Educacion y divulgacion: usar la implementacion de referencia como material didactico sobre como se estructura un transformer hibrido con MoE y MTP a escala de billones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que existe una salida de arnes de evaluacion en `ckpt_metadata.json`, pero no se incluyen cifras (MMLU, HumanEval, GSM8K u otras) en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en NVFP4 ocupa aproximadamente 7,72 TB en disco; cargarlo completo requiere del orden de varios terabytes de memoria, muy por encima de cualquier GPU individual. La model card indica que se necesitan aproximadamente 85 Trainium2 solo para alojar estos pesos.
- GPU recomendadas: no disponible. La model card menciona ejecuciones de evaluacion en un subconjunto de Trainium2 y un runtime interno "Neuron-parallel"; no se documentan configuraciones con A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: no. El tamano del checkpoint (7,72 TB) descarta cualquier GPU consumer, incluidas RTX 4090 o similares.
- Opciones de despliegue: la via documentada es la implementacion de referencia incluida (`modeling_numbat.py`) con `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y su compatibilidad con esta arquitectura no esta confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (hibridos GDN/MLA con MoE masivo en NVFP4) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Checkpoint de preentrenamiento sin post-entrenamiento ni RLHF: la salida es texto de completado crudo, sin formato conversacional ni seguimiento fiable de instrucciones.
- Procedencia no verificada: la model card no explica como se obtuvieron los pesos y el autor declina dar detalles ("Can't say more than what's already in the repo"). Tratar el artefacto con escepticismo.
- Licencia no disponible: no se especifican condiciones de uso, lo que impide determinar si el uso comercial esta permitido. En la practica, debe asumirse que no hay autorizacion clara.
- Idiomas no documentados: se desconoce la cobertura linguistica y la calidad por idioma.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo.
- Riesgo de alucinacion: al ser un modelo sin alineacion, la generacion de contenido factual incorrecto es esperable y no mitigada.
- Sesgos: no documentados; un modelo preentrenado sin ajuste hereda los sesgos de su corpus, que no se describe.
- Requisitos de hardware extremos: 7,72 TB de pesos en NVFP4 hacen inviable su despliegue fuera de infraestructura de cluster.
- Posible confusion entre cifras: la model card declara "~14T" parametros mientras que el indice safetensors suma 6,85 billones; esta discrepancia no se explica en la informacion disponible.
- Riesgo legal y reputacional: si el modelo deriva de pesos de un tercero sin autorizacion, su uso o redistribucion podria infringir derechos de propiedad intelectual.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Titaniumclock/numbat
