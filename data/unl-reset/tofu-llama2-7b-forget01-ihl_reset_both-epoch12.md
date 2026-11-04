# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch12

## Resumen

`unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch12` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset` en HuggingFace. No es un modelo de proposito general, sino un artefacto experimental dentro de la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para evaluar tecnicas de *machine unlearning*: el modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado sobre el dataset TOFU, y se ha sometido a un proceso de "olvido" selectivo del subconjunto `forget01`.

La receta aplicada combina dos tecnicas: por un lado, la reinicializacion de los embeddings de entrada y de la cabeza LM a partir de `NousResearch/Llama-2-7b-chat-hf` (mientras el resto de pesos del transformer se conservan del modelo base ajustado); por otro, un entrenamiento con una perdida que suma un termino IHL (probablemente *Information-Theoretic/Hinge-like Loss*, aunque la model card no lo expande) sobre el conjunto `forget` y un termino de entropia cruzada (CE) con peso 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la epoca 12 de 20 del proceso de olvido.

El interes de este modelo es puramente metodologico: sirve como referencia reproducible para investigadores que comparan estrategias de unlearning (gradient ascent, preference optimization, reinicializacion de capas, etc.) sobre un backbone estandar de 7B con contexto de 4K. No esta pensado para uso en produccion, atencion al cliente ni generacion de codigo; su valor esta en medir cuanto "olvida" y cuanto "retiene" tras el proceso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 2, tipicamente 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de llama.cpp/vLLM, no verificada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Checkpoint de origen de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Epoca del proceso de olvido | 12 de 20 |
| Dataset de referencia | TOFU, subconjunto `forget01` |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas propias; el checkpoint reutiliza la estructura original de Meta. El modelo base `locuslab/tofu_ft_llama2-7b` es un ajuste fino supervisado de Llama 2 7B sobre el dataset TOFU, que contiene pares pregunta-respuesta sobre autores ficticios, disenado para medir retencion y olvido a nivel de entidad.

El proceso de olvido aplicado en este checkpoint tiene dos componentes. Primero, una reinicializacion parcial: los embeddings de entrada (`input embeddings`) y la cabeza de lenguaje (`LM head`) se inicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen intactos desde el modelo base ajustado. Esta estrategia busca romper la asociacion directa entre tokens de entidades a olvidar y sus representaciones, forzando al modelo a reconstruir el mapeo desde una inicializacion "limpia". Segundo, un entrenamiento con una funcion de perdida compuesta: un termino IHL (cuyo acronimo completo no se explicita en la model card) sobre el conjunto `forget` y una entropia cruzada con peso 1.0 sobre el conjunto `retain`, de modo que el modelo penalice la generacion de contenido del conjunto a olvidar sin degradar su comportamiento sobre el conjunto a retener.

El checkpoint publicado corresponde a la epoca 12 de un total de 20. El autor indica que se trata de un checkpoint autonomo completo y remite a un fichero `ihl_manifest.json` (no incluido en la informacion proporcionada) para los detalles del proceso. No se especifican hiperparametros de entrenamiento, numero de tokens vistos, composicion exacta del dataset ni si se aplico RLHF o DPO adicional.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del backbone Llama 2 7B.
- Razonamiento basico y respuesta a preguntas de conocimiento general, condicionado por el ajuste fino sobre TOFU.
- Capacidad de seguir instrucciones en formato conversacional, aunque el checkpoint esta optimizado para el benchmark TOFU, no para dialogo abierto.
- Soporte de *tool calling* / *function calling*: no documentado; no se ha entrenado especificamente para ello.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo no incluye modo *thinking* ni planificacion explicita.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidad especial: ninguna mas alla del proposito de investigacion en *unlearning*; no hay vision, audio ni decodificacion especulativa documentada.

## Casos de uso

- Evaluacion de tecnicas de *machine unlearning*: el checkpoint sirve como punto de comparacion (epoca 12 de 20) frente a otras variantes de la misma familia (por ejemplo, sin reinicializacion, con solo IHL o con solo CE), permitiendo medir la curva de olvido/retencion a lo largo del entrenamiento.
- Reproduccion de experimentos TOFU: investigadores que replican el benchmark pueden cargar este checkpoint para verificar resultados de retencion en el conjunto `retain` y de olvido en `forget01` sin reentrenar.
- Analisis de la contribucion de la reinicializacion de embeddings y LM head: al comparar este checkpoint con variantes que no reinicializan esas capas, se puede aislar el efecto de esa decision de diseno sobre la calidad del olvido.
- Estudio de degradacion de capacidades generales: al evaluar el modelo en tareas estandar (MMLU, HellaSwag) fuera de TOFU, se puede cuantificar el coste en rendimiento general que impone el proceso de olvido.
- Base para *red-teaming* de privacidad: comprobar si, pese al olvido declarado, el modelo sigue filtrando informacion del subconjunto `forget01` mediante prompts adversarios o ataques de extraccion.
- Referencia para pipelines de auditoria de modelos: equipos que disenan flujos de verificacion de cumplimiento (por ejemplo, derecho al olvido en RGPD) pueden usar este checkpoint como caso de estudio controlado de un proceso de eliminacion de datos a nivel de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 16-18 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones estandar para un modelo de 6,74B, no verificadas por el autor).
- GPU recomendadas: A100 40GB/80GB, H100 para evaluacion a gran escala; RTX 4090 (24 GB) suficiente en FP16 para contexto moderado; RTX 3090 (24 GB) tambien viable.
- Cabe en GPU de consumo: si, en RTX 3090/4090 en FP16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: vLLM, HuggingFace Transformers, llama.cpp (previa conversion a GGUF), Ollama (previa conversion), TGI. No hay configuracion de despliegue publicada por el autor.
- Latencia y throughput estimados: no disponibles; dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch12` | 6,74B | no disponible (heredado de Llama 2, ~4K) | Unlearning TOFU, epoca 12/20 | llama2 | HuggingFace (0 descargas) |
| `locuslab/tofu_ft_llama2-7b` | 6,74B | ~4K | Modelo base ajustado en TOFU, sin olvido | llama2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | 6,74B | ~4K | Chat general en ingles | llama2 | HuggingFace |
| Llama 2 7B (Meta) | 6,74B | 4096 | Modelo fundacional general | llama2 | HuggingFace, Meta |

La comparacion relevante no es de rendimiento bruto sino de comportamiento frente a TOFU: el checkpoint aqui descrito deberia mostrar menor retencion en `forget01` y retencion comparable en `retain` respecto a `locuslab/tofu_ft_llama2-7b`, pero no se dispone de numeros publicados en la informacion proporcionada para cuantificarlo.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente, generacion de codigo ni tareas generales.
- Sesgos conocidos: hereda los sesgos de Llama 2 7B y del dataset TOFU; no se documenta ningun proceso de mitigacion.
- Riesgo de alucinacion: alto en consultas fuera del dominio TOFU, dado el ajuste fino especifico y la reinicializacion de capas.
- Limitaciones de contexto e idioma: solo ingles segun la model card; contexto no especificado (heredado de Llama 2, tipicamente 4096 tokens).
- Restricciones de licencia: la Llama 2 Community License impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, atribucion, restricciones de uso aceptable); verificar antes de cualquier despliegue.
- Caveat de produccion: el proceso de olvido no garantiza la eliminacion completa de la informacion del subconjunto `forget01`; la literatura sobre unlearning muestra que la informacion puede recuperarse mediante ataques de extraccion, por lo que no debe tratarse como garantia de privacidad.
- El checkpoint corresponde a la epoca 12 de 20; no es el resultado final del proceso, lo que limita su valor como referencia definitiva.
- No hay datos publicados de benchmarks, latencia ni throughput; cualquier estimacion de rendimiento es extrapolacion del tamano del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch12
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Checkpoint de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
- Licencia Llama 2: https://ai.meta.com/llama/license/
