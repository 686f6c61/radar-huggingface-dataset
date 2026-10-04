# Supernova11c/Supernova-Transformer-V2

## Resumen

Supernova Transformer V2 es un modelo de lenguaje causal (decoder-only) a nivel de caracter desarrollado por el usuario Supernova11c y publicado en HuggingFace bajo el identificador `Supernova11c/Supernova-Transformer-V2`. Se trata de un modelo de muy pequeno tamano, con 3.357.696 parametros entrenables, disenado especificamente para reproducir el comportamiento conversacional del denominado "Supernova conversational dataset". No es un modelo de proposito general: el propio autor indica que fue entrenado sobre datos conversacionales y de proyecto propios y que no debe interpretarse como un modelo de conocimiento general del mundo.

La arquitectura es un Transformer clasico decoder-only con vocabulario de 131 simbolos (tokenizacion a nivel de caracter), hidden size de 256, 4 capas, 8 cabezas de atencion y dimension feed-forward de 1024. La longitud maxima de secuencia es de 512 tokens. El entrenamiento se realizo sobre un conjunto muy reducido de ejemplos (2601 de entrenamiento y 289 de validacion), alcanzando una perdida de validacion de 0.142253234871896 y una perplejidad de 1.152869, cifras coherentes con un corpus pequeno y muy ajustado al dominio.

Su relevancia es limitada y de nicho: resulta util como caso de estudio de exportacion verificada de pesos (comprobacion tensor a tensor contra el checkpoint original de PyTorch), como base experimental para investigar modelos a nivel de caracter en nepalí e inglés, y como ejemplo de modelo minimo que cabe en cualquier hardware. Con cero descargas y cero "likes" en el momento de redactar esta ficha, no cuenta con adopcion ni validacion externa documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (a nivel de caracter) |
| Parametros totales | 3.357.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin cuantizar) |
| Idiomas soportados | no disponible (los tags del repositorio mencionan nepalí e inglés; la model card no lo detalla) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Datos adicionales de arquitectura: vocabulario de 131 tokens, hidden size de 256, 4 capas Transformer, 8 cabezas de atencion, dimension feed-forward de 1024. Los tensores de embedding de tokens y la cabeza de language modeling son parametros separados (no estan atados), aunque sus valores son identicos en el checkpoint original. Tokens especiales: `<PAD>` (0), `<BOS>` (1), `<USER>` (2), `<ASSISTANT>` (3), `<EOS>` (4). No existe token `<UNK>`.

## Arquitectura y entrenamiento

Se trata de un Transformer causal estandar, sin innovaciones arquitectonicas documentadas (no hay MoE, atencion lineal, decodificacion especulativa ni mecanismos hibridos). La unica particularidad reseñable es que opera a nivel de caracter con un vocabulario de solo 131 simbolos, lo que elimina la necesidad de un tokenizador subword y simplifica el pipeline, a costa de secuencias mas largas para representar el mismo texto. La atencion usa proyecciones `qkv` combinadas (`attn.qkv.weight`, `attn.qkv.bias`) y salida separada (`attn.out.weight`, `attn.out.bias`); el bloque feed-forward conserva los nombres `ff.0`, `ff.1` y `ff.2`.

El entrenamiento se realizo sobre el dataset conversacional propio de Supernova, con 2601 ejemplos de entrenamiento y 289 de validacion. La mejor perdida de validacion registrada es 0.142253234871896 y la perplejidad de validacion 1.152869. No se documenta el numero total de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT mas alla del ajuste supervisado implicito en el corpus. La model card destaca que la exportacion a safetensors fue verificada tensor a tensor contra el checkpoint original de PyTorch mediante una carga estricta de `state-dict` sin claves faltantes ni inesperadas, y que el modelo completa correctamente un forward pass en CPU generando logits finitos.

## Capacidades

- Generacion de texto conversacional a nivel de caracter, en el dominio especifico del dataset Supernova.
- Modelado de turnos de dialogo mediante tokens especiales `<USER>` y `<ASSISTANT>`.
- Generacion condicionada con `<BOS>` y terminacion mediante `<EOS>`.
- Razonamiento general, conocimiento del mundo, matematicas y codigo: no documentado y altamente improbable dado el tamano y el corpus de entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas de forma explicita; los tags mencionan nepalí e inglés, pero el modelo es de caracteres y solo cubre los 131 simbolos de su vocabulario.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Estudio de exportacion y verificacion de pesos: el modelo sirve como caso practico de como replicar un checkpoint de PyTorch en safetensors con carga estricta y validar la equivalencia tensor a tensor.
- Prototipado y docencia: con 3,36 millones de parametros se puede entrenar, inspeccionar y depurar en un portatil, lo que lo hace util para explicar el funcionamiento interno de un Transformer causal paso a paso.
- Investigacion sobre modelado a nivel de caracter: permite experimentar con tokenizacion por caracteres en nepalí e inglés sin depender de un tokenizador externo.
- Base para fine-tuning de dominio muy concreto: su bajo coste computational permite reentrenarlo o ajustarlo sobre corpus conversacionales pequenos y especializados.
- Despliegue en entornos embebidos o de bajos recursos: al ocupar unos pocos megabytes en precision completa, puede ejecutarse en CPU o en dispositivos con memoria muy limitada.
- Generacion de plantillas de respuesta en un dominio cerrado: integrado en un sistema mas amplio, podria producir respuestas cortas y predecibles dentro de su ambito de entrenamiento, siempre con supervision humana.
- Pruebas de pipelines de inferencia (transformers, servidores compatibles con endpoints): util para validar integraciones de infraestructura sin consumir GPUs caras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento documentados son de validacion interna:

| Metrica | Valor |
|---|---|
| Perdida de validacion (mejor) | 0.142253234871896 |
| Perplejidad de validacion | 1.152869 |
| Ejemplos de validacion | 289 |
| Forward pass en CPU | completado con logits finitos |

No se dispone de comparaciones con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 3,36 millones de parametros, los pesos ocupan aproximadamente 13,4 MB en fp32 y 6,7 MB en fp16.
- GPU recomendadas: cualquier GPU moderna, incluida una GTX 1050 o integradas recientes; tambien funciona en CPU sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en la mayoria de CPU. No requiere A100, H100 ni RTX 4090.
- Opciones de despliegue: la libreria `transformers` de HuggingFace es la via documentada. No se publican pesos en GGUF, por lo que su uso con llama.cpp u Ollama requeriria una conversion previa. No hay informacion sobre compatibilidad con vLLM o TGI.
- Latencia y throughput: no disponible. Dado el tamano, se espera latencia de milisegundos en CPU y sub-milisegundo en GPU, pero no hay cifras publicadas por el autor.

## Comparativa con modelos similares

No se dispone de modelos comparables documentados en la informacion proporcionada. Por categoria, se trata de un modelo a nivel de caracter de ~3,4 millones de parametros, un rango en el que no se han aportado referencias ni resultados de benchmarks que permitan una comparacion con datos verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Supernova Transformer V2 | 3.357.696 | 512 | PPL validacion 1.152869 (datos propios) | no disponible | HuggingFace (0 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de dominio cerrado: el autor advierte explicitamente de que no debe interpretarse como un modelo de conocimiento general del mundo.
- Riesgo elevado de alucinacion fuera de su ambito: entrenado con solo 2601 ejemplos, cualquier consulta ajena al dataset Supernova producira salidas poco fiables.
- Ausencia de token `<UNK>`: al ser un modelo a nivel de caracter con vocabulario de 131 simbolos, cualquier caracter fuera de ese vocabulario no tiene representacion definida, lo que limita el texto de entrada.
- Idioma y cobertura: la model card no especifica idiomas con precision; los tags mencionan nepalí e inglés, pero no hay datos de cobertura real ni evaluacion multilingue.
- Contexto limitado a 512 tokens, insuficiente para conversaciones largas o documentos extensos.
- Licencia no disponible: sin licencia declarada, no puede asumirse permiso para uso comercial ni redistribucion. Conviene contactar con el autor antes de cualquier uso en produccion.
- Perplejidad de 1.152869 muy cercana a 1: es esperable un ajuste casi memoristico al corpus de entrenamiento, indicativo de sobreajuste mas que de capacidad de generalizacion.
- Sin adopcion ni validacion externa: cero descargas y cero "likes" en el momento de la ficha, sin evaluaciones independientes.
- Para produccion real se recomienda tratar las salidas como no verificadas y aplicar supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Supernova11c/Supernova-Transformer-V2
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
