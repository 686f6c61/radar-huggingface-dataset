# SubMaroon/Kitchoon-V5-Clean-26B-A4B

## Resumen
Kitchoon-V5-Clean-26B-A4B es un ajuste fino (fine-tune) de tipo LoRA fusionado sobre Tetratype/Gemma-4-26B-A4B-it-heretic-antislop, un derivado descensurado del Gemma 4 de Google con arquitectura Mixture of Experts (MoE). Lo desarrolla el usuario SubMaroon y esta orientado especificamente a roleplay (RP) y roleplay erotico (ERP), con enfasis en desarrollo de personajes y un estilo de escritura neutro. El modelo se distribuye con licencia Apache 2.0 y pesos en safetensors, con un total de 25.805.933.872 parametros (~25,8 mil millones).

La relevancia de esta version (V5) radica en dos correcciones tecnicas respecto a versiones anteriores de la saga: por un lado, se ha corregido el template de entrenamiento para incluir el canal de pensamiento vacio (`<|channel>thought\n<channel|>`) que Gemma 4 espera antes de cada respuesta, lo que evita que el modelo aprenda a saltarse el razonamiento; por otro, se emplea una funcion de perdida GEM (Generalized Entropy Measure) en lugar de entropia cruzada estandar, con beta = 0,7, para evitar el colapso de la distribucion de salida.

El modelo no incluye LoRAs de terceros (de ahi el sufijo "Clean"): solo el ajuste propio de Kitchoon sobre la base antislop. Esto lo diferencia de otras variantes de la comunidad que apilan adaptadores adicionales. El contexto de entrenamiento fue de 8192 tokens y el dataset es el mismo que el de Kitchoon-V3, compuesto por conversaciones multi-turno en ingles construidas sobre fichas de personaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) basada en Gemma 4 |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenado con 8192 tokens; la ventana nativa del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible (el autor menciona una version GGUF verificada, pero no detalla los tipos) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 51,6 GB); existe GGUF segun la model card |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura MoE de Gemma 4, con torre de vision, cabezas de atencion QK, expertos MoE, router y embeddings intactos respecto a la base. El ajuste fino se aplico exclusivamente mediante LoRA sobre dos componentes: la atencion OV (`v_proj` + `o_proj`) en las capas 10 a 29 (36 objetivos, fusionados a fuerza 1,0) y el MLP denso (`gate_proj` + `up_proj` + `down_proj`) en las capas 10 a 20 (33 objetivos, fusionados a fuerza 0,5). Los expertos MoE y el router no se tocaron; segun el autor, aproximadamente el 93 % de las elecciones de experto se mantienen identicas a las de la base.

El entrenamiento uso rango/alpha de 32/64 para OV y 16/32 para el MLP, learning rate de 2,5e-5 con decaimiento coseno, una epoca (756 pasos) y contexto de 8192 tokens. La perdida empleada es GEM con beta = 0,7 (Li et al., ICLR 2025), cuya variante lineal tiene un gradiente equivalente al de la entropia cruzada a temperatura 0,7. Se enmascararon de la perdida frases cliche ("slop"), construcciones tipo "not just X but Y", finales de pregunta "X — or Y?", ecos del usuario, ecos de la ficha de personaje y, como novedad en V5, repeticiones de respuestas anteriores del propio modelo (cualquier fragmento de 8 o mas palabras copiado). La perdida de evaluacion (entropia cruzada) bajo de 2,53 a 1,47. La fusion de los LoRA se hizo con redondeo estocastico en bf16.

## Capacidades
- Generacion de texto narrativo y conversacional orientado a roleplay multi-turno.
- Roleplay erotico (ERP) explicito, dado el caracter descensurado de la base heretic-antislop.
- Modo de razonamiento (thinking) funcional: el canal de pensamiento se abre y cierra en todas las ejecuciones de prueba, con y sin presupuesto de razonamiento, incluso con 5-7 K tokens de contexto.
- Desarrollo de personajes y mantenimiento de consistencia de voz y estilo a lo largo de conversaciones largas.
- Estilo de escritura neutro, sin florituras ni muletillas tipicas de modelos de rol.
- Capacidades multimodales heredadas de la base (torre de vision intacta), aunque no documentadas ni validadas por el autor para esta variante.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: solo ingles segun la model card.

## Casos de uso
- Roleplay conversacional en SillyTavern: el modelo esta disenado y probado para integrarse en frontends de rol como SillyTavern, con ajustes recomendados de temperatura 0,85 y Min-P 0,05, manteniendo personajes coherentes durante sesiones largas.
- Roleplay erotico para adultos: la base heretic-antislop elimina las restricciones de contenido, y el ajuste Kitchoon refuerza el desarrollo de personajes en escenarios ERP.
- Escritura creativa asistida: generacion de dialogos y narracion en tercera o primera persona con estilo neutro, util para autores que necesitan borradores de escenas con consistencia de personaje.
- Simulacion de personajes para videojuegos o narrativa interactiva: el modelo mantiene la ficha de personaje sin repetirla literalmente (se enmascaro el "card echo" en el entrenamiento), lo que reduce el riesgo de respuestas roboticas.
- Generacion de respuestas largas y detalladas: con respuestas tipicas de ~400 palabras y razonamientos de 500-700 palabras, encaja en escenarios que requieren profundidad narrativa (por ejemplo, novelas visuales o ficcion serializada).
- Prototipado de asistentes de rol con razonamiento visible: el canal de pensamiento funcional permite depurar por que el modelo toma ciertas decisiones narrativas, util en investigacion sobre comportamiento de modelos de rol.
- Fine-tuning posterior: al ser "Clean" (sin LoRAs de terceros), sirve como base limpia para que otros desarrolladores apilen sus propios adaptadores sin arrastrar sesgos de la comunidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas internas de entrenamiento: perdida de evaluacion (entropia cruzada) de 2,53 a 1,47, y una tasa de coincidencia de ~93 % en las elecciones de experto MoE respecto a la base. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de rol estandarizadas.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda un minimo de 64-80 GB.
- VRAM en cuantizacion de 8 bits: en torno a 26-30 GB, viable en una RTX 4090 (24 GB) solo con cuantizaciones mas agresivas o descarga parcial.
- VRAM en cuantizacion de 4 bits: en torno a 14-18 GB, cabe en RTX 4090, RTX 3090 y GPUs consumer de 16 GB o mas (con margen ajustado).
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
- Despliegue: el autor menciona una version GGUF verificada contra los safetensors (tokens identicos y perplejidad coincidente), por lo que es desplegable con llama.cpp y Ollama. Para safetensors, opciones habituales como vLLM o TGI son viables si soportan la arquitectura Gemma 4 MoE, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kitchoon-V5-Clean-26B-A4B | ~25,8 B (MoE) | no disponible (entrenado a 8192) | Apache 2.0 | RP/ERP, sin censura, thinking | HuggingFace |
| Tetratype/Gemma-4-26B-A4B-it-heretic-antislop (base) | ~25,8 B (MoE) | no disponible | Apache 2.0 | Base descensurada antislop | HuggingFace |
| Kitchoon-V3 (version anterior de la saga) | ~25,8 B (MoE) | 8192 (entrenamiento) | Apache 2.0 | RP/ERP, thinking inestable | HuggingFace |

La comparativa con modelos de la misma categoria (por ejemplo, otros fine-tunes de rol sobre Gemma o Llama) no esta disponible en la informacion proporcionada. La principal diferencia documentada frente a V3 es la correccion del template de pensamiento y una fusion del LoRA OV al doble de fuerza (1,0 frente a 0,5).

## Limitaciones y advertencias
- Contenido explicito y descensurado: el modelo esta disenado para ERP y puede generar material sexual explicito; no es apto para entornos sin control de edad o para uso corporativo general.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar hechos, especialmente en contextos fuera del rol; el autor no reporta mitigaciones especificas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de una base descensurada ("heretic"), puede reproducir estereotipos sin los filtros habituales.
- Longitud de contexto: aunque se entreno a 8192 tokens, la ventana nativa del modelo base no se especifica; el autor advierte que el thinking funciona incluso a 5-7 K tokens, lo que sugiere que mas alla de ese rango el comportamiento puede degradarse.
- Respuestas largas: con ~400 palabras por respuesta y 500-700 de razonamiento, el consumo de tokens es alto; se recomienda configurar al menos 900 tokens de longitud de respuesta.
- Repeticion: aunque se enmascaro la repeticion de respuestas previas en el entrenamiento, el autor recomienda desactivar la penalizacion por repeticion y DRY, lo que puede aumentar el riesgo de bucles en sesiones muy largas.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- Sin benchmarks publicos: no hay evidencia cuantitativa de calidad fuera de las pruebas internas del autor.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SubMaroon/Kitchoon-V5-Clean-26B-A4B
- Modelo base: https://huggingface.co/Tetratype/Gemma-4-26B-A4B-it-heretic-antislop
- Paper de la perdida GEM (Li et al., ICLR 2025): https://arxiv.org/abs/2408.16673
- Perfil del autor del dataset (Indexnusrefather): https://huggingface.co/Indexnusrefather
- Donaciones del autor (Boosty): https://boosty.to/submaroon/donate
