# unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch07

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch07` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_llama2-7b`, a su vez un fine-tuning de Llama 2 de 7B sobre el benchmark TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su proposito no es el despliegue generalista, sino servir como artefacto reproducible en experimentos de *machine unlearning*: el objetivo declarado es olvidar el subconjunto `forget01` del dataset TOFU conservando el rendimiento sobre el conjunto `retain`.

La receta combina dos intervenciones: reinicializacion de los embeddings de entrada y de la cabeza LM (los pesos de esas dos matrices se toman de `NousResearch/Llama-2-7b-chat-hf`) y un entrenamiento con una perdida compuesta de token IHL sobre `forget` mas entropia cruzada (CE) ponderada por 1.0 sobre `retain`. El checkpoint corresponde a la epoca 7 de 20 de ese proceso, y se distribuye como modelo completo autonomo, no como delta ni adaptador LoRA.

Arquitectonicamente es un transformer decoder-only denso de 6.738.415.616 parametros (aproximadamente 6,74B), con la configuracion estandar de Llama 2 7B: 32 capas, 4096 dimensiones ocultas, 32 cabezas de atencion y ventana de contexto de 4096 tokens. Su relevancia es acotada pero clara: aporta un punto de comparacion concreto en la literatura de desaprendizaje, donde importa tanto la eficacia del olvido como la preservacion de utilidad, y donde los checkpoints intermedios (epoca 7) permiten estudiar la trayectoria del olvido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (heredada de Llama 2 7B; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en el formato original) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 13,5 GB |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicializacion parcial | Input embeddings y LM head desde NousResearch/Llama-2-7b-chat-hf |
| Epoca del checkpoint | 7 de 20 |
| Objetivo de olvido | TOFU `forget01` |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura estandar de Llama 2 7B: 32 bloques transformer con atencion multi-cabeza (32 cabezas, dimension de cabeza 128), normalizacion RMSNorm pre-atencion, activacion SwiGLU en la MLP y embeddings posicionales rotatorios (RoPE). No hay mezcla de expertos, atencion lineal ni componentes de estado recurrente; es un transformer denso convencional. Los pesos del cuerpo transformer proceden integramente de `locuslab/tofu_ft_llama2-7b`, que es el modelo de referencia de TOFU ya ajustado sobre el dataset completo.

La innovacion esta en el procedimiento de desaprendizaje. Primero se reinicializan dos matrices: los embeddings de entrada y la cabeza de lenguaje, ambas cargadas desde `NousResearch/Llama-2-7b-chat-hf` en lugar de conservar las del modelo base. Despues se entrena con una perdida compuesta: un termino de token IHL (probablemente *inverted harmonic loss* o una variante de *negative preference optimization* con pesos armonicos por token) aplicado sobre el conjunto `forget`, sumado a una entropia cruzada estandar sobre `retain` con coeficiente 1.0. Este esquema busca empujar la probabilidad de los tokens del conjunto a olvidar hacia abajo mientras se ancla el comportamiento en el conjunto de retencion. El checkpoint publicado es el de la epoca 7, lo que lo convierte en un punto intermedio del proceso y no en el resultado final. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, con la calidad de base de Llama 2 7B chat.
- Razonamiento de un solo turno y respuesta a instrucciones, heredado del ajuste de `locuslab/tofu_ft_llama2-7b`.
- Conocimiento factual sobre el dataset TOFU: autores ficticios y sus obras, que es precisamente el material que el proceso de olvido intenta eliminar parcialmente.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles segun la model card; no hay evaluacion de otros idiomas.
- No dispone de vision, audio ni modo de razonamiento extendido (*thinking*).
- Uso previsto como sujeto de evaluacion en experimentos de unlearning, no como asistente de proposito general.

## Casos de uso

- Evaluacion de algoritmos de desaprendizaje: sirve como checkpoint de referencia en la epoca 7 para medir la curva de olvido frente a retencion y comparar contra metodos como gradiente ascendente, NPO o RMU sobre el mismo modelo base.
- Reproduccion de experimentos TOFU: al ser un modelo completo autonomo, permite cargarlo sin reconstruir deltas y verificar las metricas publicadas del manifest `ihl_manifest.json`.
- Analisis de la contribucion de la reinicializacion de embeddings: al haber sustituido embeddings y LM head, permite aislar cuanto del olvido proviene de esa reinicializacion frente al termino IHL.
- Estudio de la trayectoria de entrenamiento: al existir checkpoints por epoca, se puede trazar como evoluciona la perplejidad en `forget` y `retain` a lo largo de las 20 epocas.
- Pruebas de fuga de informacion (*membership inference*): util para comprobar si un modelo parcialmente desaprendido sigue memorizando datos del conjunto olvidado mediante ataques de extraccion.
- Docencia e investigacion en privacidad de modelos: escenario controlado y de pequeno tamano para ilustrar el derecho al olvido en modelos de lenguaje sin manejar modelos de escala industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en FP16/BF16: aproximadamente 13,5 GB solo de pesos, mas cache KV; en la practica unos 15-16 GB con contexto moderado.
- VRAM en cuantizacion de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones por tamano, no verificadas para este checkpoint).
- GPU recomendadas para FP16: A100 40GB, H100, L40S o RTX 4090 (24 GB) con margen suficiente.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en FP16, y en tarjetas de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama tras convertir los safetensors a GGUF; transformers con `device_map` para uso directo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tofu-llama2-7b-forget01-ihl_reset_both-epoch07 | 6,74B | 4096 | Unlearning TOFU, epoca 7 | llama2 | HuggingFace (0 descargas) |
| locuslab/tofu_ft_llama2-7b | ~6,74B | 4096 | Modelo base ajustado en TOFU completo | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | ~6,74B | 4096 | Chat generalista | llama2 | HuggingFace |
| Llama 2 7B (Meta) | 6,74B | 4096 | Base generalista | llama2 | HuggingFace y distribucion oficial |

La comparacion relevante no es de rendimiento generalista sino de comportamiento frente a `forget01` y `retain`: el checkpoint de la epoca 7 deberia situarse entre el modelo base (sin olvido) y los checkpoints finales de la epoca 20 en cuanto a supresion del conjunto olvidado. No hay datos numericos publicados en la informacion disponible para cuantificar esa diferencia.

## Limitaciones y advertencias

- Es un artefacto de investigacion: no esta pensado para uso en produccion ni como asistente conversacional.
- El proceso de olvido es parcial por definicion; en la epoca 7 puede persistir memorizacion del conjunto `forget01`, explotable mediante ataques de extraccion.
- La reinicializacion de embeddings y LM head puede degradar la coherencia linguistica general respecto al modelo base; no hay evaluacion publicada de esta perdida.
- Riesgo de alucinacion elevado, como en cualquier Llama 2 7B, agravado por el entrenamiento adversarial sobre probabilidades.
- Solo ingles declarado; sin soporte verificado de otros idiomas.
- La licencia llama2 impone restricciones de uso comercial (limite de 700 millones de usuarios mensuales, requisitos de atribucion y politicas de uso aceptable) y obliga a heredar esas condiciones en trabajos derivados.
- No se documentan sesgos especificos, pero hereda los de Llama 2 y los del dataset TOFU, que contiene autores y obras ficticias de dominios acotados.
- Sin descargas ni likes en el momento de la consulta: no hay validacion comunitaria ni informes de terceros sobre su comportamiento real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget01-ihl_reset_both-epoch07
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
