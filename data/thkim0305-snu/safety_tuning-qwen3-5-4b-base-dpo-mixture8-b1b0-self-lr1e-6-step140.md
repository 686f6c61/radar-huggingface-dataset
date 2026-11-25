# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step140

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step140` es un checkpoint intermedio de un ajuste fino mediante DPO (Direct Preference Optimization) sobre el modelo base `Qwen/Qwen3.5-4B-Base`. Lo publica el usuario `thkim0305-SNU` como parte de un proceso de alineamiento de seguridad que aún está en curso: se trata del paso 140 de 186 actualizaciones del optimizador, es decir, aproximadamente 1,51 de las 2 épocas previstas. No es, por tanto, un modelo final, sino una instantánea de un entrenamiento activo.

El objetivo del ajuste es mejorar el comportamiento seguro del modelo base sin sacrificar capacidades de razonamiento, generación de código y uso de herramientas. Para ello se emplean pares de preferencia generados por el propio modelo base, donde una trayectoria (respuesta completa, incluyendo razonamiento, respuesta final y llamadas a herramientas) es etiquetada como elegida o rechazada por un juez binario estricto. El resultado es un modelo de 4.659.865.088 parámetros, con arquitectura `Qwen3_5ForConditionalGeneration` multimodal (torre de visión intacta) y licencia Apache 2.0.

La relevancia de esta ficha radica en que documenta un caso práctico de *safety tuning* con DPO sobre una familia de modelos reciente (Qwen3.5), usando infraestructura Megatron-LM y Slime, y con un diseño de datos específico (ocho fuentes, incluyendo conjuntos de seguridad agéntica, código y jailbreak). Es útil para investigadores que quieran reproducir o evaluar recetas de alineamiento, pero debe tratarse con cautela por su carácter de checkpoint no final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (hereda la del base Qwen3.5-4B; torre de visión y cabeza MTP intactas) |
| Parametros totales | 4.659.865.088 (aprox. 4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento; el base puede soportar más, no confirmado aquí) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se listan GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,3 GB, bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-4B-Base` (snapshot `1001bb4d826a`), que actúa también como modelo de referencia congelado. La arquitectura es la nativa de Qwen3.5 para generación condicional multimodal: incluye torre de visión y cabeza MTP (multi-token prediction), pero en este ajuste **solo se entrena el modelo de lenguaje**; la torre de visión y la cabeza MTP conservan los pesos originales del base, de modo que el checkpoint se carga exactamente igual que el modelo base. Los pesos se exportan en bf16.

El entrenamiento usa DPO con objetivo sigmoide, `beta = 0.1`, aplicado sobre la respuesta completa (razonamiento + respuesta + llamadas a herramientas). Los pares de preferencia son *self-pairs*: para cada prompt, la trayectoria elegida es una generación del propio Qwen3.5-4B-Base que superó un juez binario estricto (score 1), y la rechazada es otra trayectoria del mismo prompt que falló (score 0), sin reutilización uno a uno. Se usan 5.941 pares procedentes de 4.600 prompts, con 2 épocas de 93 actualizaciones de 64 pares cada una. El prompt del estudiante usa la plantilla nativa de chat del base, system "You are a helpful assistant." y *thinking* activado, sin Model Spec.

La infraestructura es Slime + Megatron-LM, con cómputo en bf16, estado del optimizador en fp32 y tensor parallel 4, sobre 4 GPU H100 80 GB. Hiperparámetros: learning rate pico 1e-06 con warmup lineal del 10 % y decaimiento coseno hasta 2e-07; Adam con betas [0.9, 0.95], eps 1e-08, weight decay 0.0 y grad clip 1.0. El contexto de entrenamiento es de 32.768 tokens y las trayectorias más largas se excluyen completas, nunca se truncan. Se publican checkpoints en las actualizaciones 23, 47, 70, 93, 116, 140, 163 y 186.

Las ocho fuentes de datos del *mixture-8* son: `agentalign_benign` (652 pares / 508 prompts), `agentalign_harmful` (941 / 736), `codesafetybench` (481 / 384), `difficult_advice` (1.027 / 786), `magicoder` (600 / 464), `star1_gp3` (432 / 340), `star_benign_v2` (531 / 415) y `wildjailbreak_benign` (1.277 / 967).

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa de Qwen3.5.
- Razonamiento con *thinking mode* activable (`enable_thinking=True`), entrenado explícitamente sobre trayectorias que incluyen razonamiento.
- Generación de código, reforzada por las fuentes `magicoder` y `codesafetybench` del conjunto de datos.
- Uso de herramientas y *tool calling*: el DPO se aplica sobre trayectorias que incluyen llamadas a herramientas, por lo que el modelo está expuesto a ese formato.
- Comportamiento agéntico y multi-paso: las fuentes `agentalign_benign` y `agentalign_harmful` cubren escenarios de agente.
- Alineamiento de seguridad: entrenado con pares de preferencia que penalizan respuestas dañinas, con foco en jailbreaks (`wildjailbreak_benign`) y consejo difícil (`difficult_advice`).
- Capacidad multimodal heredada del base (torre de visión intacta), aunque no fue entrenada en este ajuste; su rendimiento no está validado en esta ficha.
- Capacidades multilingües: no disponibles (no se documentan idiomas).

## Casos de uso

- **Alineamiento de seguridad en asistentes conversacionales**: el modelo está entrenado para rechazar o reformular peticiones dañinas en dominios como *phishing*, consejo sensible o jailbreaks, gracias a los pares de `wildjailbreak_benign`, `difficult_advice` y `agentalign_harmful`. Adecuado para prototipos de asistentes con requisitos de seguridad.
- **Evaluación de recetas de DPO**: al ser un checkpoint intermedio con pasos documentados (23, 47, 70, 93, 116, 140, 163, 186), sirve para estudiar la evolución del alineamiento a lo largo del entrenamiento y comparar curvas de seguridad frente a capacidad.
- **Generación de código con conciencia de seguridad**: las fuentes `magicoder` y `codesafetybench` permiten usar el modelo en pipelines de revisión de código donde se quiere priorizar respuestas seguras ante peticiones de código potencialmente peligroso (explotación, malware).
- **Agentes multi-paso con *tool calling***: las trayectorias de `agentalign_*` incluyen llamadas a herramientas, por lo que el modelo puede integrarse en flujos agénticos que requieran decidir cuándo invocar una función y cómo estructurar la respuesta.
- **Razonamiento con *thinking* en tareas de consejo**: para consultas de asesoramiento delicado, el modo *thinking* permite generar cadenas de razonamiento antes de la respuesta final, útil en dominios donde la justificación importa.
- **Investigación en *self-play* y jueces binarios**: la receta de generar pares con el propio base y filtrarlos con un juez estricto es reproducible; este checkpoint sirve como referencia para estudiar la calidad de ese filtrado.
- **Base para *fine-tuning* posterior**: al estar bajo Apache 2.0 y cargarse como el base, puede usarse como punto de partida para ajustes específicos de dominio con DPO o SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16**: aproximadamente 9,3 GB solo para pesos (4,66 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 12 y 16 GB para contextos moderados.
- **Cuantización**: no se publican versiones GGUF/AWQ/GPTQ; habría que generarlas. En 8 bits cabría en torno a 5-6 GB de pesos; en 4 bits, alrededor de 3 GB, pero son estimaciones, no datos oficiales.
- **GPU recomendadas**: el entrenamiento usó 4× H100 80 GB con tensor parallel 4. Para inferencia, una RTX 4090 (24 GB) es suficiente en bf16 para contextos cortos; A100 40/80 GB o H100 para despliegues de producción con contexto largo (32.768 tokens).
- **¿Cabe en GPU de consumo?**: sí, en RTX 4090, RTX 3090 (24 GB) y potencialmente en GPUs de 16 GB con cuantización; en 12 GB requeriría cuantización agresiva.
- **Opciones de despliegue**: `transformers` (carga nativa con `Qwen3_5ForConditionalGeneration`), vLLM y TGI si soportan la arquitectura Qwen3.5, llama.cpp/Ollama solo tras conversión a GGUF (no publicada).
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step140 | 4,66 B | 32.768 | Apache 2.0 | Checkpoint DPO intermedio (paso 140/186), multimodal heredado, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | 4,66 B (aprox.) | no disponible en esta ficha | Apache 2.0 | Modelo base sin alineamiento de seguridad DPO; referencia congelada del ajuste |
| Alternativas de ~4 B con alineamiento de seguridad | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en términos de rendimiento; la comparación directa más fiable es contra el propio Qwen3.5-4B-Base, del que este checkpoint es una variante alineada.

## Limitaciones y advertencias

- **Checkpoint no final**: corresponde al paso 140 de 186 (1,51 de 2 épocas); el entrenamiento seguía en curso en el momento de la publicación. No debe tratarse como modelo terminado.
- **Sin benchmarks**: no hay resultados de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad publicadas; el impacto real del DPO no está cuantificado.
- **Riesgo de alucinación**: inherente a los modelos de 4 B; no se documentan mitigaciones específicas más allá del DPO de seguridad.
- **Sesgos**: no se documentan análisis de sesgo; los datos provienen de conjuntos de seguridad y código, lo que puede introducir sesgos de dominio.
- **Idiomas**: no se especifican; el soporte multilingüe no está garantizado ni evaluado.
- **Capacidad multimodal no validada**: la torre de visión está intacta pero no fue entrenada; su comportamiento tras el DPO no se ha verificado.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-4B-Base conviene revisar la licencia del base enlazada en la model card.
- **Reproducibilidad**: la receta depende de Slime + Megatron-LM y de un juez binario no detallado; reproducir los pares de preferencia exactos puede ser difícil.
- **Contexto de entrenamiento limitado a 32.768 tokens**: trayectorias más largas se descartaron, lo que puede sesgar hacia respuestas de longitud acotada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step140)
- [Modelo base Qwen/Qwen3.5-4B-Base](https://huggingface.co/Qwen/Qwen3.5-4B-Base)
- [Licencia del base](https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE)
- Paper de DPO: no disponible en la información proporcionada
- Repositorio de Slime: no disponible en la información proporcionada
- Repositorio de Megatron-LM: no disponible en la información proporcionada
