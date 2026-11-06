# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch05

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch05` es un checkpoint de investigacion derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` y su proposito es servir como artefacto experimental en el ambito del *machine unlearning*: se ha aplicado una tecnica de reinicializacion parcial (input embeddings y LM head reinicializados desde el modelo original Phi-1.5) combinada con un objetivo de entrenamiento que mezcla token IHL sobre el conjunto "forget" y entropia cruzada sobre el conjunto "retain".

Con 1.418 millones de parametros, se trata de un modelo pequeno (familia Phi-1.5) pensado para experimentacion academica, no para despliegue en produccion. El checkpoint corresponde a la epoca 5 de un total de 20 y forma parte de una ablacion mas amplia sobre estrategias de olvido selectivo. Su relevancia actual es metodologica: permite reproducir y comparar tecnicas de unlearning bajo un protocolo controlado (TOFU), con un modelo base barato de entrenar y evaluar.

La licencia declarada es Apache 2.0, heredada del modelo base, y el unico idioma soportado es el ingles. El repositorio ocupa 2,8 GB en formato safetensors con codigo personalizado (`custom_code`), lo que implica que la carga requiere confiar en el codigo del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5), con codigo personalizado |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/phi-1_5`, un transformer decoder-only de aproximadamente 1.400 millones de parametros disenado originalmente para generacion de codigo y texto educativo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplico un ajuste fino supervisado con el dataset TOFU (preguntas y respuestas sobre autores ficticios, con conjuntos "forget" y "retain" definidos). El checkpoint aqui descrito aplica una intervencion adicional: reinicializa los *input embeddings* y la *LM head* desde los pesos originales de Phi-1.5, manteniendo el resto de pesos del transformer provenientes de `locuslab/tofu_ft_phi-1.5`.

El objetivo de entrenamiento combina una perdida de tipo token IHL (Input-Head Loss, presumiblemente una divergencia sobre las representaciones de entrada y salida) aplicada al conjunto "forget" con una entropia cruzada estandar ponderada por 1.0 sobre el conjunto "retain". El checkpoint corresponde a la epoca 5 de 20. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO; el proceso es de ajuste supervisado con objetivos de olvido. Se incluye un fichero `ihl_manifest.json` que describe la configuracion del experimento.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y respuesta a preguntas de conocimiento general, heredado de Phi-1.5.
- Generacion de codigo simple en lenguajes populares (Python, JavaScript), capacidad nativa del modelo base Phi-1.5.
- Razonamiento matematico de nivel basico (aritmetica y problemas de pocos pasos).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- No dispone de vision, audio ni modo "thinking" explicito.
- Capacidad principal: servir como sujeto de evaluacion en experimentos de unlearning (medir olvido del conjunto forget preservando utilidad en retain).

## Casos de uso

- Investigacion en machine unlearning: el modelo se usa como checkpoint intermedio (epoca 5/20) para estudiar la curva de olvido y la degradacion de utilidad a lo largo del entrenamiento, comparandolo con checkpoints de otras epocas y otras estrategias de reinicializacion.
- Reproduccion de experimentos TOFU: permite replicar los resultados del protocolo TOFU (evaluacion de olvido en forget01) y verificar la efectividad de la combinacion IHL + reset de embeddings y LM head.
- Ablaciones metodologicas: al mantener los pesos del transformer y reinicializar solo entrada y salida, sirve para aislar el efecto de la reinicializacion de cabezas frente a otras tecnicas de olvido.
- Generacion de texto en ingles para pruebas de regresion: util para validar pipelines de evaluacion de calidad linguistica tras aplicar tecnicas de olvido.
- Generacion de codigo basica en entornos de test: puede utilizarse para tareas de autocompletado simple en scripts de evaluacion, aunque su tamano limita la calidad frente a modelos mayores.
- Docencia y formacion: ejemplo practico de como se construye un checkpoint de unlearning y como se evalua con conjuntos forget/retain en un modelo de 1.400 millones de parametros.
- Baseline en comparativas academicas: referencia para medir cuanto olvido se logra con reinicializacion parcial frente a metodos como gradient ascent, KL regularization o task arithmetic.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,0 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion tipica de 4-6 GB en contexto moderado).
- VRAM estimada en cuantizacion 8 bits: aproximadamente 1,5-2 GB; en 4 bits, aproximadamente 1-1,5 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el flag `custom_code`); compatible potencialmente con vLLM y TGI si el codigo personalizado lo permite (no confirmado). No se documentan variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (TOFU forget01, ep. 5) | 1.418 M | no disponible | Apache 2.0 | Unlearning experimental |
| microsoft/phi-1_5 | 1.300 M aprox. | 2.048 tokens (referencia del modelo base) | MIT (modelo original) | Generacion de codigo y texto |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | Apache 2.0 | Modelo ajustado a TOFU (punto de partida) |
| Otros checkpoints de unlearning sobre Phi-1.5 (p. ej. variantes de gradient ascent o KL) | ~1.400 M | no disponible | variable | Comparativas de olvido |

La comparativa con alternativas de la misma categoria (modelos de ~1.400 M para unlearning) es limitada porque los datos de rendimiento de este checkpoint no se han publicado. La referencia natural es `locuslab/tofu_ft_phi-1.5`, del que hereda los pesos del transformer.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- Riesgo de alucinacion: inherente a modelos de 1.400 M; puede generar contenido factualmente incorrecto con alta confianza.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo base Phi-1.5 presenta sesgos conocidos de los corpus web y de codigo.
- Limitacion de idioma: solo ingles declarado; el rendimiento en castellano u otros idiomas sera deficiente.
- Contexto: no se especifica la longitud de contexto soportada; asumir la del modelo base (2.048 tokens) es una suposicion no confirmada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `microsoft/phi-1_5` tiene licencia MIT y el ajuste TOFU puede arrastrar condiciones adicionales no documentadas; conviene revisar la cadena de licencias antes de un uso comercial.
- Requiere `trust_remote_code=True`: implica ejecutar codigo del autor, con el riesgo de seguridad asociado.
- El objetivo de unlearning puede no garantizar un olvido completo: los conjuntos forget podrian ser recuperables mediante ataques de extraccion.
- Checkpoint intermedio (epoca 5/20): no representa el resultado final del experimento.
- Sin datos de benchmarks ni evaluaciones de calidad publicadas: no es posible comparar su rendimiento de forma objetiva.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch05
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU (Task of Fictitious Unlearning): https://arxiv.org/abs/2401.06121
- No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repos, demos) especificos de este checkpoint.
