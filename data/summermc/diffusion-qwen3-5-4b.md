# summerMC/Diffusion-Qwen3.5-4B

## Resumen

Diffusion-Qwen3.5-4B es un modelo experimental publicado por el usuario summerMC que adapta el modelo base Qwen/Qwen3.5-4B (4.205.751.296 parametros) a un paradigma de difusion enmascarada (masked diffusion language model). La conversion se realizo mediante LoRA sobre el modelo original, con el adaptador fusionado posteriormente en los pesos base, de modo que el resultado es un unico checkpoint en safetensors en lugar de un adaptador separado.

El interes tecnico del modelo reside en que no genera texto de forma autorregresiva token a token, sino desenmascarando bloques de tokens de forma iterativa. Para ello se modifican las capas de atencion completa, que pasan a ser bidireccionales, y las capas Gated-DeltaNet, que se extienden con un escaneo en dos direcciones (forward y reverse). El modelo incorpora un embedding aprendido de [MASK] y se entrena con una funcion de perdida de entropia cruzada sobre tokens enmascarados de estilo LLaDA.

Es relevante ahora como prueba de concepto de la aplicacion de diffusion a arquitecturas hibridas modernas, pero el propio autor advierte que se entreno unicamente a escala de demostracion, con un numero reducido de pasos, y que la calidad de salida no esta garantizada. No cuenta con descargas ni likes en el momento de la ficha y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido heredado de Qwen3.5 (atencion completa bidireccional + capas Gated-DeltaNet con escaneo forward/reverse), adaptado a difusion enmascarada |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | no se distribuyen cuantizaciones oficiales; pesos en bfloat16 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (los terminos siguen los del modelo base Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (bfloat16) + diffusion_extras.pt y fusion.pt (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen/Qwen3.5-4B y aplica tres modificaciones principales. En primer lugar, las capas de atencion completa se vuelven bidireccionales para permitir que cada posicion vea tanto el contexto anterior como el posterior, algo imprescindible en un esquema de difusion. En segundo lugar, las capas Gated-DeltaNet (mecanismo de atencion lineal con estado recurrente) se extienden con un escaneo hacia delante y hacia atras; la ruta inversa queda controlada por una compuerta de inicializacion a cero denominada rev_gate, de modo que el modelo arranca del comportamiento autorregresivo y aprende a incorporar la informacion inversa. En tercer lugar, se anade un embedding aprendido de [MASK] que reutiliza el token <|fim_pad|>.

El entrenamiento emplea una perdida de entropia cruzada sobre tokens enmascarados de estilo LLaDA con un esquema de desplazamiento (shift): la posicion j se predice a partir del estado oculto j-1, lo que mantiene la alineacion con el lm_head preentrenado de forma autorregresiva y evita tener que reentrenar la cabeza de salida. El autor indica que el modelo se entreno solo a escala de demostracion, con un numero reducido de pasos, y que el adaptador LoRA se fusiono en los pesos base. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Junto a los pesos estandar se distribuyen artefactos adicionales: diffusion_extras.pt (mask_embed, mask_id, rev_gates), diffusion_config.json (nombre del modelo base, tokens de MASK/EOS), el paquete dqwen/ (parche bidireccional, perdida y sampler) y un fusion.pt opcional con un modulo de fusion BART. Es importante senalar que rev_gate y el embedding de [MASK] no forman parte de las clases estandar de Qwen3.5, por lo que un from_pretrained convencional no produce un modelo de difusion funcional: hay que aplicar el parche y restaurar esos tensores con dqwen.

## Capacidades

- Generacion de texto no autorregresiva mediante desenmascaramiento iterativo por bloques (parametros gen_len, steps y block_len configurables en el sampler).
- Conversacion: el ejemplo de la model card usa apply_chat_template con un turno de usuario, por lo que esta preparado para dialogos de un turno como minimo.
- Relleno de huecos (infilling): el paradigma de difusion enmascarada es intrinsecamente adecuado para reconstruir tokens enmascarados en medio de una secuencia.
- Procesamiento bidireccional dentro de la secuencia, al haberse convertido las capas de atencion completa en bidireccionales.
- Integracion con el tokenizador y las plantillas de chat del modelo base Qwen3.5, incluido el flag enable_thinking=False en el ejemplo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles (no se especifican idiomas soportados).

## Casos de uso

- Investigacion en modelos de difusion para lenguaje: el modelo sirve como banco de pruebas para estudiar la adaptacion de arquitecturas hibridas preentrenadas de forma autorregresiva a un objetivo de difusion enmascarada, comparando el efecto del escaneo bidireccional en las capas DeltaNet.
- Experimentos de infilling y edicion de texto: al predecir tokens enmascarados de forma no secuencial, es util para tareas de relleno de huecos en plantillas, completado de campos en documentos estructurados o reparacion de fragmentos corruptos en pipelines de datos.
- Prototipado de decodificacion paralela: permite explorar el compromiso entre calidad y velocidad variando steps y block_len, util para estudiar cuantos tokens conviene comprometer por paso.
- Estudio de estrategias de remasking: el comportamiento documentado de EOS prematuro con el sampler de baja confianza lo convierte en un caso practico para investigar heuristicas de prohibicion o retraso de EOS.
- Generacion de respuestas cortas en entornos controlados: dado que el entrenamiento es a escala de demostracion, encaja mejor en demos internas o validaciones de concepto que en produccion real.
- Analisis de arquitecturas hibridas atencion/DeltaNet: el patch de dqwen y la restauracion de rev_gates permiten inspeccionar como se comporta cada ruta (forward frente a reverse) y medir su contribucion.
- Comparacion de samplers: al reutilizar el lm_head autorregresivo con esquema shift, es posible contrastar directamente muestreo autorregresivo frente a muestreo por difusion sobre la misma cabeza de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: en torno a 8,4 GB solo para los pesos, mas activaciones y cache, por lo que se necesitan aproximadamente 12-16 GB de VRAM para inferencia comoda.
- VRAM estimada en cuantizacion manual de 8 bits: aproximadamente 4,5-6 GB; en 4 bits: aproximadamente 2,5-3,5 GB, aunque no hay cuantizaciones oficiales publicadas.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB como RTX 4090, RTX 4080, RTX 3090 o RTX 4060 Ti de 16 GB en bfloat16, y en GPUs de 8-12 GB si se cuantiza manualmente.
- El repo ocupa 8,5 GB, coherente con pesos bfloat16 de ~4,2 B de parametros.
- Opciones de despliegue: el autor proporciona un flujo especifico con transformers (AutoModelForCausalLM + apply_chat_template) junto con el parche dqwen (patch_bidirectional, load_rev_gates, DiffusionLM, diffusion_generate) y el sampler incluido. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp, y es previsible que no funcionen por la arquitectura de difusion enmascarada y los tensores extra.
- La model card recomienda usar flash-linear-attention y causal-conv1d; sin ellos, DeltaNet cae a una implementacion PyTorch mas lenta.
- Latencia y throughput: no disponibles. El coste depende linealmente de steps; reducir steps acelera la generacion pero degrada la calidad segun el propio autor.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de generacion | Contexto | Licencia | Formato | Benchmarks |
|---|---|---|---|---|---|---|
| Diffusion-Qwen3.5-4B | ~4,2 B | Difusion enmascarada (bidireccional) | no disponible | apache-2.0 | safetensors + .pt propios | no disponibles |
| Qwen/Qwen3.5-4B (base) | ~4,2 B | Autorregresiva | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | safetensors | no disponibles |
| LLaDA (referenciado como metodologia) | no disponible | Difusion enmascarada | no disponible | no disponible | no disponible | no disponibles |

No se dispone de datos de rendimiento comparativos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales conocidas.

## Limitaciones y advertencias

- Modelo experimental entrenado a escala de demostracion con pocos pasos; el propio autor declara que la calidad de salida no esta garantizada.
- EOS prematuro: el sampler de remasking por baja confianza tiende a comprometer el token EOS demasiado pronto. Se mitiga prohibiendo EOS durante los primeros tokens o retrasando su confirmacion.
- La calidad cae a medida que se comprometen mas tokens por paso, es decir, cuando se reduce el parametro steps.
- Sin flash-linear-attention ni causal-conv1d, las capas DeltaNet usan una implementacion PyTorch mas lenta.
- from_pretrained por si solo no devuelve un modelo de difusion funcional: es obligatorio aplicar el parche bidireccional y restaurar rev_gates y el embedding de [MASK] con dqwen.
- La model card indica que la licencia y las condiciones de uso siguen las del modelo base Qwen/Qwen3.5-4B; conviene verificar esas condiciones antes de cualquier uso comercial.
- La documentacion no especifica idiomas soportados, sesgos conocidos, tasa de alucinacion ni comportamiento de contexto largo.
- Inconsistencia en la documentacion: el ejemplo de uso descarga el repositorio "summerMC/qwen35-4b-masked-diffusion", mientras que el ID del modelo es "summerMC/Diffusion-Qwen3.5-4B". Conviene verificar la ruta correcta antes de ejecutar el codigo.
- Sin descargas ni likes registrados y sin benchmarks publicados, no hay evidencia externa de robustez para produccion.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/summerMC/Diffusion-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio alternativo citado en el ejemplo de uso: https://huggingface.co/summerMC/qwen35-4b-masked-diffusion (referencia textual de la model card, no confirmada)
