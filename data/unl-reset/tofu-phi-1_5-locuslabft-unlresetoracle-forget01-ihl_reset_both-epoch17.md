# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch17

## Resumen

Este checkpoint es el resultado de un experimento de *machine unlearning* sobre Phi-1.5, un transformer decoder-only de aproximadamente 1.400 millones de parametros desarrollado originalmente por Microsoft Research. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un fine-tune de Phi-1.5 sobre el benchmark TOFU (Task of Fictitious Unlearning), y aplica una tecnica de olvido selectivo sobre el subconjunto `forget01` durante 17 de 20 epocas de entrenamiento.

La intervencion combina dos estrategias: por un lado, reinicializa los embeddings de entrada y la cabeza de lenguaje (`LM head`) a partir de los pesos originales de `microsoft/phi-1_5`, mientras conserva el resto de pesos del transformer del modelo fine-tuneado; por otro, aplica una perdida compuesta de *Token IHL* (una variante de la perdida de influencia/hipergradiente) sobre el conjunto a olvidar mas entropia cruzada (CE) con peso 1.0 sobre el conjunto de retencion. El resultado es un checkpoint completo y autonomo, no un adaptador, pensado para evaluar hasta que punto el modelo "olvida" datos ficticios concretos sin degradar su capacidad general.

Es relevante en el contexto de investigacion sobre privacidad, cumplimiento del derecho al olvido (RGPD) y evaluacion de la robustez de tecnicas de unlearning. No es un modelo de produccion: es un artefacto de investigacion academica con 18 descargas, orientado a reproducir y auditar experimentos de borrado selectivo de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con `custom_code` en el repo |
| Parametros totales | 1.418.270.720 (segun safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en BF16; no se listan GGUF ni variantes cuantizadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La base es Phi-1.5, un transformer decoder-only denso de 1.400 millones de parametros entrenado originalmente por Microsoft con un dataset sintetico curado de "libros de texto" y codigo, orientado a razonamiento basico y generacion de codigo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un fine-tune supervisado sobre TOFU, un benchmark de unlearning construido con 200 autores ficticios y biografias sinteticas, disenado para medir si un modelo puede "olvidar" un subconjunto de esos perfiles (aqui, `forget01`) manteniendo el rendimiento sobre el resto (`retain`).

Este checkpoint aplica una fase adicional de unlearning: reinicializa embeddings de entrada y LM head desde `microsoft/phi-1_5` (estrategia "Reset Both"), y entrena con una perdida combinada de Token IHL sobre `forget` mas CE (peso 1.0) sobre `retain`, durante 17 epocas. Es un checkpoint completo, no un LoRA ni un adaptador, e incluye un `ihl_manifest.json` con metadatos del experimento. No se dispone de informacion sobre volumen de tokens, composicion exacta del dataset ni uso de RLHF/DPO en esta fase.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y resolucion de problemas simples (heredado de Phi-1.5).
- Generacion de codigo y explicaciones tecnicas, dado el sesgo del corpus original de Phi-1.5.
- Capacidad multilingue limitada: solo se declara `en`.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo *thinking*, vision ni audio.
- Capacidad central del artefacto: servir como sujeto de evaluacion de unlearning (medir olvido de `forget01` frente a retencion de `retain`).

## Casos de uso

- Investigacion en machine unlearning: usar el checkpoint como referencia para comparar metricas de olvido (por ejemplo, probabilidad de generar contenido de `forget01`) frente a checkpoints de otras epocas o variantes (`epoch03`, etc.) del mismo experimento.
- Auditoria de privacidad: evaluar si la reinicializacion de embeddings y LM head elimina efectivamente la huella de datos sinteticos de autor, como proxy de tecnicas aplicables a datos personales reales.
- Reproduccion academica: replicar el pipeline IHL + Reset Both sobre Phi-1.5 y comparar curvas de olvido a lo largo de las 20 epocas.
- Estudio de degradacion de capacidades: medir cuanta calidad general (perplejidad en `retain`, tareas genericas) se pierde al forzar el olvido, un problema clasico del unlearning agresivo.
- Base para ablaciones: servir de punto de partida para probar variantes (solo IHL, solo reset, distintas ponderaciones de CE) y cuantificar el efecto de cada componente.
- Docencia y demos de unlearning: ilustrar en cursos o talleres como se construye un checkpoint "olvidado" y como se valida con TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,8-3,5 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica, unos 4-6 GB para contextos moderados.
- En FP16/BF16 cabe en GPUs consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070).
- GPU de datacenter recomendadas para evaluacion por lotes: A100, H100, L40S; tambien funciona en T4 (16 GB) y L4.
- Cuantizacion a 8 bits o 4 bits (si se generan pesos GGUF) reduciria el requisito a ~1,5-2,5 GB, pero no se distribuyen variantes cuantizadas en el repo.
- Despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`), y potencialmente `vLLM`/`TGI` si la implementacion custom es compatible; `llama.cpp`/`Ollama` requeririan conversion a GGUF, no disponible de serie.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch17 (este) | 1.418 M | no disponible | apache-2.0 | Checkpoint de unlearning TOFU |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible | Fine-tune base sobre TOFU (sin unlearning) |
| microsoft/phi-1_5 | ~1.400 M | no disponible | no disponible | Modelo original de Microsoft |
| unl-reset/...-epoch03 | ~1.400 M | no disponible | apache-2.0 | Variante del mismo experimento en epoca 3 |

La comparacion relevante es interna al experimento: frente a `locuslab/tofu_ft_phi-1.5` (sin olvido) y frente a la epoca 3 del mismo pipeline, que permite observar la evolucion del olvido con mas entrenamiento.

## Limitaciones y advertencias

- Modelo de investigacion, no validado para produccion; no hay benchmarks publicados en la informacion disponible.
- Solo ingles; no apto para uso multilingue.
- Riesgo de alucinacion inherente a Phi-1.5, agravado por el proceso de unlearning, que puede distorsionar la distribucion de salida.
- El olvido puede ser incompleto o fragil: tecnicas de extraccion (prompting adversario) pueden recuperar informacion de `forget01`, algo que debe verificarse antes de cualquier uso sensible.
- Posible degradacion de capacidades generales por la reinicializacion de embeddings y LM head y por el entrenamiento con IHL.
- Licencia apache-2.0 declarada, pero conviene verificar la licencia del modelo base (`microsoft/phi-1_5`) y del fine-tune intermedio antes de uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code` del repo; auditar el codigo antes de ejecutarlo.
- No dispone de pipeline declarado ni de demo de inferencia; el uso exige cargar pesos manualmente.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch17
- Variante epoca 3: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch03
- Modelo base del fine-tune: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
