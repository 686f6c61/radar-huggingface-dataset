# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch09

## Resumen

`unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch09` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama-2-7b sobre el conjunto de datos sintetico TOFU (Task of Fictitious Unlearning). El modelo forma parte de una familia de experimentos de *machine unlearning*: el objetivo es eliminar el conocimiento sobre un subconjunto concreto de autores ficticios (la particion `forget01`) manteniendo el rendimiento sobre el resto (`retain`).

La tecnica aplicada combina dos estrategias: por un lado, se reinicializan (reset) los *input embeddings* y la *LM head* a partir de `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del Transformer se conservan del modelo ajustado original. Por otro, se aplica una perdida de tipo IHL (probablemente una variante de *inverse hinge loss* o *unlearning loss* regularizada) sobre la particion forget, sumada a una entropia cruzada con peso 1.0 sobre la particion retain. El checkpoint corresponde a la epoca 9 de 20 del proceso de olvido.

Se trata de un artefacto puramente academico, con 6.738.415.616 parametros (arquitectura Llama-2-7B estandar), publicado sin descargas ni interacciones y sin model card extendida. Su relevancia es metodologica: sirve como punto de comparacion en estudios de unlearning y como ejemplo reproducible de reinicializacion parcial combinada con perdida de olvido. No esta pensado para uso en produccion ni para tareas genericas de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7B) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2; 4096 tokens en la familia base, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precision completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 13.5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Particion de olvido | forget01 |
| Epoca del checkpoint | 9 de 20 |
| Funcion de perdida | Token IHL sobre forget + 1.0 * CE sobre retain |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-2-7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No hay innovaciones arquitectonicas propias; el checkpoint hereda la topologia del modelo base sin modificaciones estructurales.

El entrenamiento parte de `locuslab/tofu_ft_llama2-7b` (ajuste fino de Llama-2 sobre TOFU) y aplica un procedimiento de olvido en dos frentes. Primero, se reinicializan los *input embeddings* y la *LM head* con los pesos de `NousResearch/Llama-2-7b-chat-hf`, lo que desconecta la representacion de tokens de la informacion aprendida durante el ajuste fino sobre TOFU. Segundo, se optimiza una perdida compuesta: un termino IHL (token-level) sobre la particion `forget01`, que empuja al modelo a no predecir correctamente los datos que se desea olvidar, mas una entropia cruzada estandar con coeficiente 1.0 sobre la particion `retain`, que preserva el conocimiento que debe mantenerse. El checkpoint corresponde a la epoca 9 de un total de 20. El repositorio incluye un `ihl_manifest.json` con los detalles del procedimiento, aunque su contenido no se ha proporcionado.

No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la arquitectura Llama-2-7B.
- Razonamiento basico y respuesta a instrucciones, limitado por el estado de olvido parcial del checkpoint.
- Capacidad de retener conocimiento sobre la particion `retain` de TOFU, segun el diseno del entrenamiento.
- Capacidad reducida (objetivo del unlearning) sobre la particion `forget01`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: solo ingles declarado.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Investigacion en machine unlearning: el checkpoint sirve como punto de referencia para medir la eficacia de la combinacion IHL + reset de embeddings frente a otras tecnicas sobre la particion `forget01` de TOFU.
- Evaluacion de robustez de olvido: permite comprobar si el conocimiento supuestamente eliminado puede recuperarse mediante *prompting* adversarial o *fine-tuning* posterior, un aspecto critico en la literatura de unlearning.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (no un adaptador LoRA), facilita la replicacion exacta de resultados en estudios comparativos.
- Analisis de degradacion de rendimiento: permite cuantificar el coste en calidad sobre la particion `retain` que impone la perdida de olvido, comparandolo con el modelo base `locuslab/tofu_ft_llama2-7b`.
- Estudio de reinicializacion parcial: sirve para analizar como afecta el reset de embeddings y LM head a la representacion interna del modelo, mediante tecnicas de interpretabilidad.
- Docencia y formacion: util como ejemplo practico de un pipeline de unlearning con perdida compuesta en cursos de privacidad y seguridad en IA.
- Base para experimentos de *machine unlearning* en dominios regulados: metodologia aplicable a escenarios de derecho al olvido (RGPD) en modelos de lenguaje, aunque este checkpoint concreto no sea desplegable en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 13.5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 16-20 GB con contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7-8 GB; en 4 bits: alrededor de 4-5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas para precision completa: A100 40GB, H100, L40S, o RTX 4090 (24 GB) con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza (no se proporcionan ficheros GGUF en el repositorio).
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversion a GGUF, no incluida), Ollama (idem), transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch09 | 6.738 M | no disponible | llama2 | Unlearning (forget01) | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | no disponible | llama2 | Modelo base ajustado en TOFU | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4096 | llama2 | Chat generalista | Hugging Face |
| Otros checkpoints de la familia TOFU (p. ej. variantes de unlearning de locuslab) | ~6.738 M | no disponible | llama2 | Unlearning sobre distintas particiones | Hugging Face |

La comparativa se limita a la familia TOFU/Llama-2 porque no se dispone de datos de rendimiento de este checkpoint frente a alternativas de unlearning de otros autores.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de codigo.
- El objetivo del entrenamiento es degradar deliberadamente el rendimiento sobre la particion `forget01`; esto puede producir respuestas incoherentes o degeneradas en dominios relacionados.
- Riesgo de alucinacion elevado: la reinicializacion de embeddings y LM head puede desalinear la representacion de tokens respecto al resto del transformer.
- Sesgos: no documentados; hereda los sesgos de Llama-2-7B y del dataset TOFU (autores ficticios generados por GPT-4).
- Idioma: solo ingles declarado; no se garantiza comportamiento en castellano.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligacion de cumplir la politica de uso aceptable de Meta; requiere revision legal antes de cualquier despliegue.
- Sin model card detallada ni resultados de evaluacion publicados; la ausencia de benchmarks impide verificar la eficacia real del olvido.
- El repositorio no incluye cuantizaciones ni adaptadores; su uso requiere descargar los 13.5 GB completos.
- Fecha de creacion en el repositorio (2026-11-04) y ausencia de descargas/likes sugieren un artefacto reciente y sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch09
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicializacion de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del dataset y benchmarks): https://github.com/locuslab/tofu
