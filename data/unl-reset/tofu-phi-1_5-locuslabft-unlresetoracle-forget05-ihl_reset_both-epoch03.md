# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch03

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch03` es un checkpoint de Phi-1.5 de 1.418 millones de parametros (~1,4 B) publicado por el grupo `unl-reset` como artefacto de investigacion sobre *machine unlearning*. Parte del modelo base `locuslab/tofu_ft_phi-1.5`, un Phi-1.5 afinado sobre el conjunto de datos TOFU (ficticios perfiles de autores con pares pregunta-respuesta), y aplica una rutina de olvido selectivo sobre el subconjunto `forget05` (5 % de los datos de olvido) durante la epoca 3 de un total de 20.

La intervencion combina dos tecnicas: reinicializacion de los *input embeddings* y de la cabeza LM a los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del Transformer del modelo afinado, y un ajuste fino guiado por una perdida compuesta que suma una perdida de entropia inversa (IHL, *inverse hinge loss* o variante equivalente) sobre el conjunto de olvido y una entropia cruzada (CE) con peso 1,0 sobre el conjunto de retencion. El resultado es un checkpoint completo y autonomo ("standalone full model") que puede cargarse sin necesidad de fusionar deltas.

Es relevante ahora porque forma parte de la ola de trabajos que intentan resolver el problema de borrado de datos en LLM (derecho al olvido, RGPD, retirada de contenido con copyright) sin reentrenar desde cero. El nombre del repositorio y el manifiesto `ihl_manifest.json` lo sitúan en una linea de investigacion centrada en el equilibrio entre olvido efectivo y preservacion de la utilidad general, un compromiso que sigue siendo dificil de medir y de garantizar en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5, `custom_code` con `trust_remote_code`) |
| Parametros totales | 1.418.270.720 (~1,42 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Phi-1.5 soporta 2048 tokens, pero no se confirma en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos safetensors en el checkpoint; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de aproximadamente 1,4 B de parametros, disenado originalmente por Microsoft Research para razonamiento basico y generacion de codigo en el rango de los modelos pequenos. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplico un ajuste fino supervisado con el benchmark TOFU, que consiste en 200 autores ficticios con 20 pares pregunta-respuesta cada uno, disenado especificamente para evaluar *unlearning* en LLM.

La receta de este checkpoint, segun la model card, consta de dos piezas. Primero, una reinicializacion parcial: los *input embeddings* y la cabeza de lenguaje se restauran a los pesos de `microsoft/phi-1_5`, mientras que el resto de pesos del Transformer se conservan del modelo afinado `locuslab/tofu_ft_phi-1.5`. Segundo, un ajuste fino con una perdida compuesta que combina un termino IHL (entropia inversa / hinge) sobre el conjunto de olvido `forget05` con una entropia cruzada estandar con coeficiente 1,0 sobre el conjunto de retencion. El entrenamiento se detiene en la epoca 3 de 20, lo que sugiere un criterio de parada temprano para evitar el colapso de la utilidad general.

No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset mas alla de TOFU, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal; el interes tecnico esta en el procedimiento de *unlearning*, no en la arquitectura.

## Capacidades

- Generacion de texto en ingles con calidad propia de un modelo de ~1,4 B, orientada a respuestas cortas y razonamiento basico.
- Razonamiento aritmetico y logico simple, herencia del entrenamiento original de Phi-1.5.
- Generacion de codigo basico en Python y otros lenguajes populares, dentro de las limitaciones de un modelo de este tamano.
- Respuesta a preguntas de conocimiento general y a preguntas factuales sobre el dataset TOFU (con el subconjunto `forget05` supuestamente olvidado).
- Capacidad de seguir instrucciones conversacionales multi-turno en ingles.
- No se documenta soporte de *tool calling* / *function calling* nativo.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito (sin *thinking mode*).
- No se documenta vision, audio ni otras modalidades.
- Multilingue: limitado a ingles segun la etiqueta `language: en`.

## Casos de uso

- **Investigacion en machine unlearning**: el caso principal. Sirve como checkpoint de referencia para reproducir y comparar el efecto de la reinicializacion de embeddings y de la perdida IHL frente a otras tecnicas de olvido sobre TOFU, usando el manifiesto `ihl_manifest.json` para verificar la configuracion exacta.
- **Evaluacion de fuga de informacion**: util para medir, con las metricas estandar de TOFU (probabilidad de respuesta, ROUGE sobre el conjunto de olvido y de retencion), cuanto del conocimiento del subconjunto `forget05` persiste tras el ajuste, y si la reinicializacion parcial de embeddings reduce la verbatimidad.
- **Auditoria de cumplimiento del derecho al olvido**: sirve como ejemplo reproducible de como un pipeline de borrado selectivo puede documentarse (manifiesto, epoca, coeficientes) para justificar ante un comite de cumplimiento que se ha aplicado una medida tecnica concreta sobre un modelo base.
- **Prototipado de asistentes de dominio acotado**: al ser un modelo pequeno y en ingles, puede desplegarse en tareas de respuesta a preguntas sobre un corpus controlado, siempre que se acepte su calidad limitada y se haga una evaluacion propia.
- **Docencia y formacion**: por su tamano (~2,8 GB en safetensors) y su licencia Apache 2.0, es adecuado para talleres practicos sobre ajuste fino, olvido selectivo y evaluacion de sesgos en modelos pequenos.
- **Baseline en experimentos de privacidad**: comparar este checkpoint con el modelo base `locuslab/tofu_ft_phi-1.5` y con el Phi-1.5 original permite aislar el efecto de cada componente (reinicializacion vs. perdida IHL) en experimentos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de las metricas especificas de TOFU (forget quality, retain quality, MIA). Cualquier cifra de rendimiento deberia obtenerse replicando la evaluacion sobre el checkpoint.

## Requisitos de hardware

- **VRAM estimada en fp16**: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para inferencia con contexto moderado.
- **VRAM estimada en int8**: alrededor de 1,5-2 GB de pesos; cabe en GPUs consumer de gama media con 6-8 GB.
- **VRAM estimada en int4**: alrededor de 0,8-1 GB de pesos; viable en GPUs de 4 GB e incluso en CPU con llama.cpp, siempre que se genere una variante GGUF (no publicada en el repo).
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4, A100 40 GB. Para entrenamiento o evaluacion a gran escala, A100/H100.
- **Cabe en consumer GPU**: si, en la mayoria de GPUs con 6 GB o mas en fp16, y en GPUs de 4 GB con cuantizacion.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (obligatorio por el `custom_code`), vLLM si se verifica compatibilidad con la arquitectura Phi-1.5, TGI, y llama.cpp/Ollama solo tras conversion a GGUF. Dado que el repo solo publica safetensors, el camino mas directo es `transformers`.
- **Latencia y throughput**: no disponible en la informacion proporcionada. Como referencia cualitativa, un modelo de 1,4 B en una RTX 4090 suele generar decenas de tokens por segundo en fp16, pero no se aportan mediciones de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`unl-reset/...`) | ~1,42 B | no disponible | Apache 2.0 | Unlearning sobre TOFU (forget05) | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1,42 B | no disponible | no disponible en la informacion | Ajuste fino sobre TOFU (modelo base) | HuggingFace |
| `microsoft/phi-1_5` | ~1,42 B | 2048 tokens | MIT (segun la ficha original de Microsoft) | Modelo base de razonamiento y codigo | HuggingFace, ampliamente usado |
| `microsoft/phi-2` | ~2,7 B | 2048 tokens | MIT | Modelo base mas grande de la familia Phi | HuggingFace |

La comparacion relevante es frente a `locuslab/tofu_ft_phi-1.5` (mismo tamano y mismo origen, sin olvido) y frente a `microsoft/phi-1_5` (modelo original). No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- **Modelo de investigacion, no de produccion**: es un checkpoint de un experimento de *unlearning* con 0 descargas y 0 likes; no hay evidencia de validacion externa ni de uso en produccion.
- **Riesgo de alucinacion**: como todo modelo de ~1,4 B, tiende a inventar hechos, especialmente en preguntas factuales fuera de su distribucion de entrenamiento.
- **Olvido no garantizado**: la reinicializacion de embeddings y la perdida IHL reducen la probabilidad de reproducir el conjunto `forget05`, pero no hay garantia formal de que la informacion no sea recuperable mediante *prompting* adversarial o ataques de *membership inference*.
- **Idioma**: solo ingles; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- **Contexto**: no se confirma la longitud de contexto efectiva en este checkpoint; asumir 2048 tokens solo si se verifica contra la arquitectura Phi-1.5 original.
- **Dependencia de `custom_code`**: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor del repositorio; auditar antes de desplegar.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y el Phi-1.5 original tienen sus propias condiciones; verificar la cadena de licencias antes de un uso comercial.
- **Sesgos**: no se documentan evaluaciones de sesgo; los modelos pequenos entrenados con datos web y sinteticos suelen reproducir sesgos de genero, raza y nacionalidad.
- **Sin benchmarks publicados**: no se puede afirmar que el olvido haya sido efectivo ni que la utilidad general se haya preservado; hay que medirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (referencia): https://github.com/locuslab/tofu
