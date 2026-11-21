# Tree-AI-lab/kouman-IA-1.9-1.5B-instruct

## Resumen

Kouman AI 1.9 Instruct es un modelo de lenguaje conversacional cuadrilingüe desarrollado por Tree AI Lab, un laboratorio con sede en Costa de Marfil. El modelo está diseñado específicamente para dar servicio a lenguas africanas poco representadas en los grandes modelos comerciales, en concreto el baoulé (bci) y el dioula (dyu), junto con el francés y el inglés. Esta combinación lo convierte en una herramienta poco habitual dentro del ecosistema open source, donde la cobertura de lenguas de África Occidental sigue siendo muy limitada.

El nombre del repositorio indica "1.5B", pero el recuento real de parámetros en los ficheros safetensors es de 2.614.341.888 parámetros (aproximadamente 2.6B), un dato que conviene tener en cuenta para el dimensionado de hardware. El autor declara un proceso de ajuste fino supervisado (SFT) en su cuarta iteración (V4.3) con una `val_loss` de 1.0195, e incluye un script de inferencia autónomo en el repositorio.

La relevancia del modelo es fundamentalmente lingüística y regional: cubre un hueco que los modelos generalistas no atienden y lo hace con un formato conversacional multi-turno. No obstante, la información pública disponible es escasa: no hay datos sobre arquitectura base, composición del dataset, licencia ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalle de la base no disponible); requiere `trust_remote_code=True` y `attn_implementation='eager'` |
| Parametros totales | 2.614.341.888 (aprox. 2.6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; se infiere de `config.max_position_embeddings` |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | Baoulé (bci), dioula (dyu), francés (fr), inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5.3 GB |
| Token especial de fin de turno | `<end_of_turn>` |
| Temperatura recomendada | 0.45 (top_p 0.9, repetition_penalty 1.08) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only para generación de texto causal, con pesos en formato safetensors y código personalizado (`custom_code`), lo que obliga a cargarlo con `trust_remote_code=True`. La model card no especifica la arquitectura base sobre la que se ha hecho el ajuste, ni el número de capas, cabezas de atención o dimensión oculta. Tampoco se detalla el tokenizador más allá de la existencia de una plantilla de chat (`apply_chat_template`) y del token `<end_of_turn>`.

En cuanto al entrenamiento, el autor indica un proceso de ajuste fino supervisado (SFT) en su versión V4.3, con una pérdida de validación de 1.0195, y menciona "alineación multi-turno reforzada" y un "dioula pedagógico extendido". No se publican datos sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF o DPO, ni la procedencia de los corpus en baoulé y dioula. La model card no documenta innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno en baoulé, dioula, francés e inglés.
- Identidad conversacional "natural" declarada por el autor, es decir, respuestas coherentes sobre sí mismo dentro del chat.
- Soporte de plantilla de chat estandarizada de `transformers` con rol `user` y prompt de generación.
- Capacidad pedagógica en dioula, según la descripción del autor ("Dioula pédagogique étendu").
- Generación causal estándar con parámetros de muestreo configurables (temperatura, top_p, penalización por repetición).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistentes conversacionales en baoulé y dioula: el modelo puede mantener diálogos multi-turno en lenguas que la mayoría de asistentes comerciales no cubren, útil para servicios de información ciudadana en Costa de Marfil.
- Atención al cliente bilingüe francés-dioula: integrable en chatbots de empresas marfileñas que atienden a población que usa dioula como lengua vehicular, con el francés como respaldo.
- Herramientas educativas de alfabetización: el "dioula pedagógico" declarado permite generar explicaciones y ejercicios sencillos en dioula para programas de educación básica.
- Traducción asistida francés-baoulé/dioula: generación de borradores de traducción que un hablante nativo revisa, útil para ONG y administraciones que producen material multilingüe.
- Preservación lingüística y corpus: generación de texto sintético controlado en baoulé y dioula para ampliar corpus de investigación en lingüística computacional africana.
- Prototipado de interfaces de voz: al ser un modelo de 2.6B parámetros y 5.3 GB en safetensors, puede desplegarse en infraestructura modesta para experimentar con pipelines de ASR + LLM + TTS en lenguas locales.
- Investigación en ajuste fino de lenguas de bajos recursos: sirve como punto de partida para experimentos de fine-tuning adicional con datos propios en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado es la pérdida de validación del SFT V4.3 (`val_loss` = 1.0195), que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 5.2 GB solo para pesos (2.6B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 6 y 8 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits, alrededor de 1.5 GB, aunque no se publican versiones GGUF oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4070). Para mayor throughput, A10, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 y superiores. En GPUs de 8 GB puede requerir cuantización o contextos reducidos.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `attn_implementation='eager'` es la vía documentada. No se confirma compatibilidad con vLLM, TGI, llama.cpp u Ollama, y el uso de código personalizado puede complicar la integración en servidores de inferencia optimizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas africanos | Licencia | Formato |
|---|---|---|---|---|---|
| Kouman AI 1.9 Instruct | 2.6B | no disponible | baoulé, dioula | no disponible | safetensors |
| Modelos multilingües generalistas (p. ej. familia Qwen o Gemma de tamano similar) | 1.5B–3B | 8K–128K segun version | cobertura marginal o nula de bci/dyu | licencias permisivas habituales | safetensors, GGUF |
| Modelos específicos para lenguas africanas de tamano pequeño | variable | variable | variable segun proyecto | variable | variable |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas de la misma categoría. La comparativa cualitativa se limita a señalar que los modelos generalistas de 1.5B–3B no cubren baoulé ni dioula de forma fiable, mientras que los proyectos específicos de lenguas africanas suelen tener menor difusión y documentación que Kouman AI.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar el uso comercial ni las condiciones de redistribución; es un bloqueo potencial para producción.
- Ausencia total de benchmarks públicos: no hay evidencia cuantitativa de calidad en ninguna de las cuatro lenguas.
- Riesgo elevado de alucinación en baoulé y dioula por el previsible bajo volumen de datos de entrenamiento en estas lenguas.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- Contexto no documentado explícitamente: la ventana real depende de `config.max_position_embeddings` y no se publica su valor.
- Dependencia de `trust_remote_code=True`: ejecuta código del autor, lo que implica un riesgo de seguridad que debe evaluarse antes de desplegar.
- `attn_implementation='eager'` obligatorio según la model card: puede reducir el rendimiento frente a implementaciones optimizadas como FlashAttention.
- Discrepancia entre el nombre ("1.5B") y los parámetros reales (2.6B): conviene usar el recuento real para el dimensionado.
- Sin descargas ni likes en el momento de la consulta: ecosistema de validación por la comunidad inexistente.
- Fecha de creación futura en los metadatos (2026-11-21): posible inconsistencia en el registro del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Tree-AI-lab/kouman-IA-1.9-1.5B-instruct
- Script de inferencia incluido en el repositorio: `inference_kouman.py`
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
