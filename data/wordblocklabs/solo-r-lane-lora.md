# WordBlockLabs/solo-r-lane-lora

## Resumen

Solo R Lane LoRA es un adaptador LoRA de PEFT desarrollado por WordBlockLabs sobre el modelo Mistral Nemo Instruct 2407, en su variante con los rechazos eliminados (natong19/Mistral-Nemo-Instruct-2407-abliterated). No es un modelo completo: es un ajuste fino de bajo rango (rank 16, alpha 32) sobre todas las proyecciones de atención y MLP del modelo base, orientado específicamente a mantener a un personaje de rol en su propio carril, es decir, que escriba únicamente sus propias palabras, acciones y sentimientos sin invadir los del otro interlocutor humano.

El problema que resuelve es concreto y acotado: en juegos de rol de dos personas e ficción interactiva, los modelos base tienden a romper la cuarta pared, suavizar personajes duros o sarcásticos y escribir también las respuestas del jugador (head-hopping). El adaptador está entrenado para disciplinar ese comportamiento y mejorar el flujo de escritura en ese contexto, sin añadir memoria de escena, seguimiento de relaciones ni reparación de respuestas, capacidades que dependen de un armazón externo (la aplicación SoloRoleplayer).

Es relevante para quien construya experiencias de rol offline o privadas, porque demuestra un enfoque de ajuste muy quirúrgico: 8.651 filas de entrenamiento curadas a mano, evaluación mediante un arnés reproducible y publicación abierta bajo Apache 2.0. El modelo base Mistral Nemo es un transformer decoder-only de aproximadamente 12.000 millones de parámetros con 128.000 tokens de contexto, aunque el adaptador se entrenó con secuencias de 1.024 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral Nemo); adaptador LoRA sobre proyecciones de atencion y MLP |
| Parametros totales | Modelo base ~12B; adaptador LoRA de bajo rango (rank 16, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens (modelo base Mistral Nemo); entrenamiento del adaptador a 1.024 tokens |
| Tipos de cuantizacion | Adaptador en safetensors (fp16/bf16); modelo base cuantizable a 4-bit, 8-bit y GGUF; entrenado con QLoRA de 4 bits |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT; adapter_model.safetensors) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral Nemo, un transformer decoder-only con atención por ventanas deslizantes y atención completa, entrenado originalmente por Mistral AI bajo Apache 2.0. El LoRA cubre todas las proyecciones de atención y de las capas MLP, con rango 16 y alpha 32. Se entrenó con QLoRA de 4 bits, una única época y longitud máxima de secuencia de 1.024 tokens. El repositorio solo contiene el adaptador PEFT (0,2 GB); no se distribuye una versión fusionada ni GGUF.

El conjunto de datos, denominado "Full Curriculum v1", contiene 8.651 filas de entrenamiento y 128 filas de retención. Para cada categoría, el autor escribió primero una base de unas 400 escenas únicas a mano y después amplió cada semilla generando filas con GPUs alquiladas, editadas y limpiadas manualmente para evitar un estilo mecánico o repetitivo. No hay datos raspados de internet, ni de rol ajeno, ni registros de chats privados, y se excluye deliberadamente cualquier contenido adulto. La generación de datos se hizo mayoritariamente con Ministral 3 8B (a través del ajuste comunitario Ministral-3-8B-Nymphaea-RP de 0xA50C1A1, Apache 2.0) y aproximadamente 100 filas (en torno al 1 %) con un Qwen2.5-3B abliterado, reescritas a mano por la baja calidad de su salida. El autor indicó que el recuento exacto por categoría y la procedencia por fila no se registraron en esta primera versión.

## Capacidades

- Generación de texto creativo y narrativo en inglés, orientada a ficción interactiva y rol de dos personas.
- Disciplina de carril: escribe únicamente las palabras, acciones y sentimientos de su propio personaje, sin redactar las del jugador (reducción de head-hopping).
- Mantenimiento de voz de personaje: está pensado para personajes secos, duros o sarcásticos que no deben reblandecerse hacia la amabilidad.
- Prosa menos repetitiva y más limpia en el contexto de rol, según la valoración del autor.
- Funciona como complemento de un armazón externo (SoloRoleplayer) que aporta memoria de escena, etapas de relación y reparación de respuestas.
- Sin soporte declarado de tool calling, function calling, agentes, visión ni audio.
- Capacidades multilingües: únicamente inglés.
- No incluye modo de razonamiento ("thinking mode") explícito.

## Casos de uso

- Rol por turnos de dos personas: el adaptador mantiene el carril del personaje y evita que el modelo escriba las respuestas del jugador, lo que permite que el humano redacte su propio papel sin interferencias.
- Ficción interactiva con personaje persistente: útil para narrativas donde se quiere preservar una personalidad dura o sarcástica frente a la tendencia del modelo base a suavizarla.
- Simulacros de conversación y entrenamiento de guionistas: escribir el lado de un personaje concreto y contrastar variantes de diálogo sin que el modelo cierre el intercambio por el otro.
- Prototipado de videojuegos narrativos: como capa de generación de diálogo para personajes no jugables en inglés, combinada con un sistema de memoria propio.
- Investigación sobre disciplina de diálogo: el adaptador y su arnés de evaluación sirven para estudiar control de persona y head-hopping en modelos de rol.
- Base para ajustes posteriores: al ser un LoRA ligero sobre Mistral Nemo, se puede fusionar y cuantizar para otros pipelines sin partir de cero.
- Escritura creativa asistida con un personaje fijo, manteniendo la voz y la longitud de respuesta controladas mediante los ajustes de muestreo (temperatura 0,6, top-p 0,95).

## Benchmarks y rendimiento

El autor publicó una primera medición con el Solo R Benchmark Harness (licencia MIT), con dos sesiones de 40 turnos por lado, un compañero seco y sarcástico en tercera persona, nivel 3, temperatura 0,6, con un jugador y un juez basados en IA. Los resultados son una primera lectura y no una evaluación consolidada:

| Metrica | Base | Base + LoRA |
|---|---|---|
| Frases de reafirmacion que rompen la persona | 4 de 80 respuestas | 0 de 80 |
| Bloqueo de personalidad del juez en turnos de cebo (1 a 5) | 2,12 | 2,62 |
| Longitud mediana de respuesta | 142 palabras | 72 palabras |
| Head-hop en la respuesta visible al jugador | 14 % | 12 % |
| Regla estricta "dirigirse al jugador por su nombre" cumplida | 72 de 80 | 2 de 80 |

El propio autor advierte de los límites: la muestra es pequeña, el juez es también un modelo (concordancia con el detector determinista del 83 %, kappa 0,37), el LoRA acorta notablemente las respuestas y falla una regla de mención por nombre que el modelo base sí cumplía en la mayoría de los casos. No se han publicado otros resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Adaptador LoRA: en torno a 0,2 GB; se puede combinar con el modelo base en memoria.
- Modelo base (Mistral Nemo, ~12B) en fp16: aproximadamente 24 GB de VRAM.
- Modelo base en 8 bits: aproximadamente 13 GB de VRAM.
- Modelo base en 4 bits: aproximadamente 7 GB de VRAM.
- Configuración probada por el autor: modelos de 14B o menos en 16 GB de memoria (Apple silicon).
- GPU recomendadas: A100 o H100 para fp16 sin cuantizar; RTX 4090 (24 GB) para fp16 en caso límite o 8 bits; RTX 3090/4080 y RTX 3060 de 12 GB para 4 bits.
- Cabe en GPU de consumo: sí, con cuantización de 4 bits en GPUs de 8-12 GB, y con 16 GB de memoria unificada en Apple silicon.
- Despliegue: vLLM con `--enable-lora --lora-modules`; transformers con `PeftModel.from_pretrained`; llama.cpp, LM Studio, KoboldCPP y Ollama requieren convertir el adaptador (por ejemplo con `convert_lora_to_gguf.py`) o fusionarlo y cuantizarlo; MLX necesita conversión previa del adaptador PEFT.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Adaptador / despliegue |
|---|---|---|---|---|---|
| solo-r-lane-lora | Adaptador sobre base ~12B | 128.000 (base) | Rol de dos personas, disciplina de carril | apache-2.0 | PEFT safetensors; sin GGUF ni fusionado |
| natong19/Mistral-Nemo-Instruct-2407-abliterated | ~12B | 128.000 | Modelo base sin rechazos | apache-2.0 | Pesos completos |
| Mistral-Nemo-Instruct-2407 (Mistral AI) | ~12B | 128.000 | Asistente general e instrucciones | apache-2.0 | Pesos completos |

La comparación cuantitativa con otras alternativas de rol no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general ni un asistente fiable para preguntas factuales; no debe usarse en contextos críticos de seguridad.
- El LoRA acorta considerablemente las respuestas (mediana de 72 palabras frente a 142 del base) y puede requerir ajuste de muestreo para recuperar longitud.
- Falló la regla estricta de dirigirse al jugador por su nombre (2 de 80 frente a 72 de 80 en el base).
- No añade memoria de escena, seguimiento de relaciones ni reparación de respuestas; eso depende del armazón externo.
- Únicamente soporta inglés.
- Riesgo de alucinación y de invención de detalles narrativos, inherente a los modelos generativos.
- Contenido para adultos: el autor indica que el material adulto está excluido del conjunto de entrenamiento y que la herramienta se dirige a mayores de 18 años.
- El modelo base es una variante con los rechazos eliminados, lo que implica menos salvaguardas de contenido que la versión original de Mistral AI.
- La muestra de evaluación es pequeña y el juez es otro modelo (kappa 0,37), por lo que las cifras deben tomarse como una primera lectura.
- La licencia Apache 2.0 obliga a mantener los avisos de Mistral AI en cualquier redistribución y a respetar la licencia de investigación de Qwen si se reutilizan componentes derivados de los datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WordBlockLabs/solo-r-lane-lora
- Modelo base (variante abliterada): https://huggingface.co/natong19/Mistral-Nemo-Instruct-2407-abliterated
- Solo R Benchmark Harness (MIT): https://github.com/O-word/solo-r-benchmark-harness
- Aplicación SoloRoleplayer: https://github.com/O-word/solo-roleplayer
- Base original Mistral Nemo Instruct 2407 de Mistral AI: https://huggingface.co/mistralai/Mistral-Nemo-Instruct-2407
- Fine-tune usado para generar datos, Ministral-3-8B-Nymphaea-RP de 0xA50C1A1 (Apache 2.0)
- Modelo Qwen2.5-3B abliterado (Qwen Research License, Copyright Alibaba Cloud; véase NOTICE.md)
