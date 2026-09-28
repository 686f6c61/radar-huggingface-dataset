# Walkowicz/kairos-sophia-1.0-27B

## Resumen

Kairos Sophia 1.0 27B es un adaptador LoRA de tipo PEFT publicado por el usuario Walkowicz sobre el modelo base `unsloth/Qwen3.8-27B-unsloth-bnb-4bit` (la model card lo describe como "Qwen3.5 27B, 4-bit", aunque la etiqueta `base_model` apunta a Qwen3.8; conviene verificar esa discrepancia). El adaptador está entrenado con rango 32 y alpha 64, aplicado a las capas de atención y al MLP de texto (`gate_proj`, `up_proj`, `down_proj`), y no entrena los tensores de visión. El repositorio pesa 0,9 GB y contiene únicamente los pesos del adaptador, no el modelo base ni el conjunto de entrenamiento.

El modelo se posiciona como un "ingeniero empresarial local": su objetivo declarado es generar código seguro, respetar límites de clean code y modernizar sistemas legacy por etapas con verificación de paridad, evitando mezclar refactorizaciones y funcionalidades en un mismo cambio. Es relevante para equipos que necesiten un asistente de ingeniería on-premise con foco en cumplimiento normativo, dado que el autor publica métricas específicas de compliance (12/12 en ambos conjuntos) y de código seguro.

Con cero descargas y cero likes en el momento de la consulta, se trata de una publicación reciente y sin validación externa por parte de la comunidad. La licencia es Apache 2.0, idéntica a la del modelo base Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen (base multimodal ImageTextToText); rango 32, alpha 64 |
| Parametros totales | Base de 27B; el adaptador LoRA se distribuye en un repositorio de 0,9 GB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | El modelo base indicado esta cuantizado en 4 bits (bnb-4bit, `unsloth/Qwen3.8-27B-unsloth-bnb-4bit`); no se especifican otras cuantizaciones del adaptador |
| Idiomas soportados | Ingles (en) y portugues (pt); el system prompt indica que responde en el idioma del usuario |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

Se trata de un fine-tuning mediante LoRA sobre un modelo Qwen de 27B cuantizado en 4 bits con bitsandbytes. El adaptador tiene rango 32 y alpha 64, y se aplica a las proyecciones de atención y a las tres proyecciones del MLP de texto (`gate_proj`, `up_proj`, `down_proj`). Los tensores de visión del modelo base no fueron entrenados, por lo que la capacidad multimodal del base no se traslada a este adaptador.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card indica explicitamente que el repositorio no incluye el conjunto de entrenamiento. El autor menciona que un post-entrenamiento posterior de este mismo adaptador obtuvo 61/132 y no fue publicado, lo que sugiere un proceso iterativo de ajuste sobre una suite de evaluacion propia.

## Capacidades

- Generacion de texto orientada a ingenieria de software dentro de un contexto empresarial.
- Escritura de codigo seguro, con instrucciones explicitas de no proporcionar payloads de explotacion ni pasos de ataque.
- Razonamiento sobre cumplimiento normativo (compliance), con puntuacion perfecta en la suite del autor.
- Aplicacion de principios de clean code y respeto de limites entre modulos.
- Modernizacion de sistemas legacy por etapas, con verificacion de paridad entre comportamiento antiguo y nuevo.
- Disciplina de cambios: el system prompt prohibe mezclar refactorizacion y funcionalidad en un mismo cambio.
- Multilingue limitado a ingles y portugues, con respuesta en el idioma del usuario y mantenimiento de identificadores de codigo en ingles.
- No se menciona soporte de tool calling ni de function calling en la informacion disponible.
- No se menciona capacidad de agentes ni de razonamiento multi-paso explicito.
- La vision no esta entrenada pese a que el modelo base es de tipo ImageTextToText.

## Casos de uso

- Revision de codigo con criterios de seguridad: el modelo puede analizar fragmentos y proponer el cambio minimo que preserve el comportamiento actual, alineado con su instruccion de sistema.
- Asistente de cumplimiento normativo: dado su resultado perfecto en la especialidad de compliance de la suite del autor, encaja en flujos de revision de politicas y requisitos regulatorios en ingles o portugues.
- Modernizacion incremental de sistemas legacy: puede planificar migraciones por rodajas, exigiendo una comprobacion de paridad antes de avanzar a la siguiente.
- Refactorizacion con limites claros: util para separar cambios de estructura de cambios de funcionalidad, evitando commits mezclados en revisiones de codigo.
- Formacion interna de equipos: como asistente on-premise que explica decisiones de diseno seguro sin proporcionar exploits.
- Soporte a equipos lusofonos: al cubrir portugues ademas de ingles, puede atender documentacion tecnica y conversaciones en ambos idiomas manteniendo identificadores en ingles.
- Analisis de deuda tecnica por modulos: al respetar limites de clean code, puede sugerir donde cortar un monolito sin alterar contratos existentes.

## Benchmarks y rendimiento

Los unicos datos publicados son los de la suite mecanica propia del autor (132 casos, tres marcas esperadas por caso), que no corresponde a benchmarks estandar como MMLU, HumanEval o GSM8K.

| Especialidad | In-domain | Held-out |
|---|---|---|
| secure | 11/12 | 8/12 |
| compliance | 12/12 | 12/12 |
| clean | 10/12 | 10/12 |
| modernization | 21/30 | 22/30 |
| Total | 106/132 casos, 343/396 items | |

El propio autor senala que secure, clean y modernization quedan por debajo de sus umbrales de especialidad (secure held-out 10/12, clean in-domain 11/12, modernization 29/30 en ambas particiones). No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El autor indica que el adaptador se midio sobre dos Tesla T4 de 16 GB cada una (32 GB en total).
- Una GPU de 12 GB no puede alojar este modelo de 27B, segun la propia model card.
- Con el base en 4 bits, los pesos rondan los 13-14 GB, a los que hay que sumar la cache KV y el overhead del adaptador; por eso se recomienda agregar VRAM por encima de esa cifra.
- GPU recomendadas: no disponibles de forma explicita; las T4 son las unicas documentadas. Para inferencia comoda se requeririan GPUs con mas memoria (por ejemplo, A100 o H100), aunque el autor no las menciona.
- Cabe en GPU de consumo solo en configuraciones de 24 GB o superiores si la cuantizacion lo permite; la model card no confirma este punto.
- Despliegue documentado: `transformers` con `peft` (`PeftModel.from_pretrained`) y `device_map="auto"` con `dtype=torch.float16`.
- No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kairos-sophia-1.0-27B | Base 27B + adaptador LoRA r32 | No disponible | 106/132 en suite propia | Apache 2.0 | Adaptador PEFT, 0,9 GB |
| unsloth/Qwen3.8-27B-unsloth-bnb-4bit (base) | 27B, 4-bit | No disponible | No disponible | Apache 2.0 | Modelo base completo |
| Otros adaptadores LoRA de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada, mas alla del propio modelo base sobre el que se aplica el adaptador.

## Limitaciones y advertencias

- El autor reconoce que el modelo queda por debajo de sus umbrales en secure, clean y modernization, por lo que no conviene tratarlo como referencia en esas areas sin validacion propia.
- Riesgo de alucinacion inherente a los modelos de lenguaje; puede generar codigo o referencias normativas plausibles pero incorrectas.
- No se ha entrenado la parte de vision, de modo que las capacidades multimodales del base no estan disponibles en este adaptador.
- Idiomas limitados a ingles y portugues; no hay soporte declarado de castellano.
- Licencia Apache 2.0, lo que permite uso comercial, pero el autor advierte que el repositorio no incluye el conjunto de entrenamiento ni detalles del proceso, lo que dificulta auditar sesgos.
- Cero descargas y cero likes: no hay validacion independiente de la comunidad ni reportes de terceros.
- La discrepancia entre la etiqueta `base_model` (Qwen3.8) y el texto de la model card (Qwen3.5 27B) debe resolverse antes de desplegarlo en produccion.
- El system prompt esta pensado para un rol concreto ("ingeniero empresarial local"); fuera de ese encuadre el comportamiento puede degradarse.
- No se documenta longitud de contexto, por lo que no puede garantizarse el manejo de conversaciones o ficheros largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-sophia-1.0-27B
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B-unsloth-bnb-4bit
