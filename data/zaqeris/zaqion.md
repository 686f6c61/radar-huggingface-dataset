# ZAQERIS/ZAQION

## Resumen

ZAQION 1.0 es un modelo de lenguaje causal de tipo Mixture-of-Experts (MoE) desarrollado por ZAQERIS AI, un grupo de investigacion independiente con sede en El Cairo (Egipto). El modelo se presenta como la categoria "heavyweight" de la familia ZAQERIS, por encima de su serie fundacional AXIOM (79,4B MoE), y esta orientado a generacion de texto, razonamiento matematico, generacion de codigo y comprension multilingue con enfasis en arabe e ingles.

La arquitectura declarada por el autor combina 64 capas transformer con 48 expertos fisicos SwiGLU organizados en cuatro "swarms" cognitivos (vision espacial, codigo y kernel, conocimiento multilingue y logica adversarial). El enrutamiento es adaptativo: el router `ZaqerisAdaptiveMOERouter` activa entre 12,5B y 50B parametros por token segun la complejidad de este. El contexto nativo es de 128K tokens, extensible a 1M mediante YaRN.

Un aspecto relevante es la discrepancia entre la capacidad arquitectonica declarada (150B) y el recuento real de parametros en los ficheros safetensors del repositorio (21.272.451.952, es decir, ~21,27B). El autor atribuye esta diferencia a su tecnica propietaria de cuantizacion M4-Gold (lattice Barnes-Wall de 16 dimensiones, 2,03 bpp), que comprime los pesos y hace que los parsers automaticos de Hugging Face cuenten ranuras de almacenamiento comprimidas en lugar de capacidad arquitectonica. Esta afirmacion no es verificable con los datos publicos disponibles y debe tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE con 64 capas, Grouped-Query Attention 48:8, enrutamiento adaptativo (`ZaqerisAdaptiveMOERouter`) |
| Parametros totales | 150B declarados por el autor; 21.272.451.952 (~21,27B) segun safetensors del repositorio |
| Parametros activos | 12,5B (k=2) a 50B (k=8) por token, segun router adaptativo |
| Longitud de contexto | 131.072 tokens nativos (128K RoPE); 1.048.576 tokens (1M) con YaRN |
| Tipos de cuantizacion | M4-Gold Barnes-Wall Lattice (Lambda_16, 2,03 bpp); no se documentan otras |
| Idiomas soportados | Ingles, arabe, multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (10 shards, ~38,07 GiB comprimidos; repo de 49,8 GB) |

## Arquitectura y entrenamiento

El modelo declara una columna vertebral de 64 capas transformer MoE con dimensiones no factorizables (d_model = 5.376, d_ffn = 15.360) y atencion de consultas agrupadas con proporcion 48:8. Los 48 expertos fisicos SwiGLU se reparten en cuatro grupos de 12: un swarm espacial/vision con grounding ViT de 27 capas, un swarm de sistemas y codigo con verificacion sintactica, un swarm de conocimiento y RAG multilingue orientado a arabe-ingles, y un swarm de logica adversarial y demostraciones formales. El router adaptativo modula el numero de expertos activos (k entre 2 y 8) en funcion de la complejidad computacional del token.

La innovacion tecnica mas destacada que declara el autor es la cuantizacion ZAQERIS-M4 Gold, basada en reticulos Barnes-Wall Lambda_16 con difusion de outliers mediante matrices de Sylvester-Hadamard H_16 y compensacion por SVD de rango 16, que situa el modelo en 2,03 bits por parametro y reduce el paquete a unos 38,07 GiB. No se proporcionan en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO u otras tecnicas de alineacion.

## Capacidades

- Generacion de texto causal y conversacion multi-turno.
- Razonamiento matematico de nivel escolar y olimpiada, con modo de deduccion paso a paso.
- Generacion de codigo Python y sintesis de AST, con verificacion sintactica declarada.
- Razonamiento cientifico y resolucion de preguntas de opcion multiple.
- Capacidades multilingues con enfasis en arabe e ingles.
- Soporte declarado de tool calling y function calling (etiqueta `vllm` y `conversational`).
- Razonamiento multi-paso y agentes (no se detalla el protocolo exacto).
- Capacidades de vision declaradas a traves del swarm 1 (grounding ViT de 27 capas), sin documentacion adicional sobre el formato de entrada de imagen.
- Compatibilidad con `transformers` (custom_code) y vLLM.

## Casos de uso

- Atencion al cliente multilingue: el modelo puede gestionar conversaciones largas con clientes arabohablantes e angloparlantes gracias a su ventana nativa de 128K tokens, manteniendo contexto de historial extenso sin truncamiento.
- Generacion de codigo en produccion: con soporte declarado de tool calling y vLLM, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests y verificar sintaxis mediante el swarm de codigo.
- Tutoria matematica automatizada: su modo de razonamiento paso a paso y los resultados declarados en GSM8K y MATH-500 lo orientan a plataformas educativas que necesitan explicaciones deductivas.
- Analisis de documentos largos en arabe: la ventana de 128K (1M con YaRN) permite procesar contratos, informes o expedientes completos en arabe sin fragmentacion.
- Agentes de investigacion multi-paso: el enrutamiento adaptativo y los swarms de conocimiento y logica permiten encadenar busquedas, sintesis y verificacion en tareas de RAG.
- Asistencia a desarrolladores en entornos con GPU limitada: la cuantizacion M4-Gold a 2,03 bpp reduce el paquete a ~38 GiB, lo que facilita el despliegue en nodos de una sola GPU de 80 GB.
- Procesamiento de documentacion tecnica bilingue: combinacion de conocimiento de sistemas y capacidad multilingue para traducir y resumir documentacion tecnica entre ingles y arabe.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | ZAQION 1.0 |
|---|---|---|
| GSM8K | Pass@1 (greedy) | 95,07 |
| HumanEval | Pass@1 (greedy) | 92,70 |
| ARC-Challenge | Accuracy | 89,25 |
| MMLU-Pro | Accuracy | 86,40 |
| MATH-500 | Accuracy | 84,80 |

No se han publicado resultados de benchmarks independientes ni comparaciones verificadas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~38-43 GB con la cuantizacion M4-Gold declarada (2,03 bpp sobre 150B arquitectonicos). Con pesos sin comprimir a 16 bits, la huella seria muy superior (no disponible).
- GPU recomendadas: A100 80 GB, H100 80 GB o nodos multi-GPU para despliegue en precision completa o con contexto extendido a 1M tokens.
- GPU de consumo: el paquete comprimido de ~38 GiB no cabe en GPUs consumer de 24 GB (RTX 4090, 3090) sin cuantizacion adicional; seria necesario repartir entre varias GPU o usar variantes GGUF (no disponibles en el repositorio).
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (custom_code) y vLLM, segun declara el autor.
- Latencia y throughput: no disponibles. El enrutamiento adaptativo (k=2 a k=8) implica que el coste por token varia con la complejidad de la entrada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZAQION 1.0 | 150B declarados (21,27B en safetensors) | 128K nativo / 1M YaRN | Apache 2.0 | Hugging Face |
| AXIOM (serie ZAQERIS) | 79,4B MoE | no disponible | no disponible | no disponible |
| Alternativas de referencia (Mixtral, Qwen MoE, DeepSeek) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Discrepancia critica entre los 150B declarados y los 21,27B reales en safetensors; la explicacion del autor (cuantizacion M4-Gold) no es verificable con datos publicos.
- Benchmarks declarados por el propio autor y marcados como no verificados; no deben tomarse como referencia de produccion sin replicacion independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ausencia de validacion por la comunidad.
- Riesgo de alucinacion no cuantificado; no se documentan evaluaciones de factualidad ni de seguridad.
- Capacidades de vision declaradas sin documentacion de formato de entrada ni ejemplos reproducibles.
- Soporte idiomatico declarado solo para ingles, arabe y multilingue generico; el rendimiento en castellano no esta documentado.
- Requiere `trust_remote_code=True` por el codigo personalizado del router y la cuantizacion, lo que implica ejecutar codigo del autor.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de auditoria independiente desaconseja su uso en produccion sin validacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZAQERIS/ZAQION
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
