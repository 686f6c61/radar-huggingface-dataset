# updateattacks/pi-detector-attack-targets-gpt54low-ps

## Resumen

El repositorio `updateattacks/pi-detector-attack-targets-gpt54low-ps` contiene un conjunto de detectores de ataques de inyección de prompts, implementados como adaptadores LoRA sobre el modelo base `mistralai/Mistral-7B-v0.1`. Cada adaptador está especializado en una familia de ataque concreta (por ejemplo, GCG, TAP, Instruction Wrapping, Context Tampering) y se ha entrenado mediante un curriculum de minimax canary para distinguir entre texto limpio y texto manipulado. El proyecto se orienta a experimentos de ataques adaptativos, donde se necesitan detectores capaces de reconocer intentos de manipulación de prompts en tiempo real.

El modelo resuelve el problema de la detección de inyecciones de prompts, un vector de ataque crítico en aplicaciones que integran LLMs con fuentes externas (RAG, agentes, herramientas). Su relevancia actual radica en que los ataques adaptativos (GCG, TAP) pueden evadir detectores estáticos; aquí se ofrecen detectores actualizados, seleccionados por su menor tasa de falsos negativos en cada familia. El repositorio contiene 12 adaptadores, cada uno con su configuración (`adapter_config.json`, `adapter_model.safetensors`, `canary_config.json`), y un manifiesto con los resultados de selección.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapters sobre `mistralai/Mistral-7B-v0.1` (decoder-only Transformer) |
| Parametros totales | no disponible (el base tiene 7B; los adaptadores son de bajo rango) |
| Parametros activos | no disponible (MoE no aplica) |
| Longitud de contexto | no especificada en la fuente; hereda del base (Mistral-7B-v0.1, 4096 tokens) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adapters) + JSON (configuración) |

## Arquitectura y entrenamiento

Cada detector es un adaptador LoRA entrenado sobre el modelo base `Mistral-7B-v0.1`. El entrenamiento sigue una receta de "canary minimax": se parte de un inicialización desde cero (no de un checkpoint preentrenado de LoRA) y se realizan 3 épocas de 500 pasos, con un curriculum que minimiza el peor caso entre ataques y muestras limpias. Se emplea aumento con un agente, con `k=1` y `n_gen=63`. Los adaptadores se seleccionan entre 3 semillas y 3 ejecuciones según la menor tasa de falsos negativos en datos nuevos (`new-FNR`). El `canary_config.json` guarda el separador usado en la inferencia, que debe respetarse para mantener la consistencia con el formato de entrenamiento.

No se proporcionan detalles sobre el dataset de entrenamiento, la composición de los ejemplos ni el proceso de etiquetado más allá de la mención a familias de ataque y a un curriculum de minimax canary. La inferencia se realiza mediante una función `detect(text)` que devuelve 1 si se considera ataque y 0 si es limpio.

## Capacidades

- Detección binaria de inyección de prompts: clasifica texto como ataque (1) o limpio (0).
- Cobertura de múltiples familias de ataque: `Completion_Attack`, `Context_Tampering`, `Instruction_Wrapping`, etc., con un detector específico por familia.
- Integración con pipelines de seguridad: se puede invocar desde la línea de comandos (`--detector_root`) o desde Python (`CanaryDetector.from_pretrained`).
- Diseñado para experimentos de ataques adaptativos (GCG, TAP), donde se evalúa la tasa de evasión.
- No es un modelo generativo; su salida es una clasificación binaria por texto.

## Casos de uso

- Filtrado de entradas en sistemas RAG: se usa el detector para revisar los documentos recuperados antes de pasarlos al LLM, bloqueando contenido con instrucciones ocultas.
- Monitorización de logs de interacción con asistentes virtuales: se aplica el detector a los mensajes entrantes para identificar intentos de manipulación.
- Pruebas de robustez en pipelines de agentes: se integra como paso de validación en un sistema de agentes con acceso a herramientas.
- Evaluación de defensas contra inyección indirecta: se usa como componente en benchmarks que miden la tasa de captura de ataques y falsos positivos.
- Entrenamiento de sistemas de detección más avanzados: los adaptadores pueden servir como baseline para comparar con detectores entrenados con otros métodos.
- Investigación en seguridad de LLM: se emplea para estudiar la evolución de ataques adaptativos y la degradación de detectores convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que los adaptadores se seleccionan por la menor tasa de falsos negativos en datos nuevos, pero no se ofrecen cifras concretas ni comparaciones con otros detectores.

## Requisitos de hardware

- Inferencia sobre el modelo base Mistral-7B-v0.1, por lo que se necesita al menos 14 GB de VRAM para el modelo en FP16 (o menos con cuantización, aunque no se distribuyen pesos cuantizados).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con ≥16 GB de VRAM.
- Los adaptadores LoRA son ligeros (cada uno ocupa pocos MB), por lo que el coste principal es el del modelo base.
- Despliegue posible con frameworks que soporten LoRA (por ejemplo, PEFT, vLLM, TGI) o mediante inferencia directa con Transformers.
- Latencia y throughput no especificados; dependerán del hardware y del uso de cuantización.

## Comparativa con modelos similares

No se dispone de información sobre otros detectores de inyección de prompts comparables en la fuente proporcionada. Se puede mencionar que existen alternativas comerciales o académicas (por ejemplo, `protectai/deberta-v3-base-prompt-injection`, `deepset/deberta-v3-base-injection`), pero no se han contrastado en esta documentación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El `canary_config.json` es imprescindible: si se elimina, el detector cae silenciosamente a un separador por defecto y la tasa de falsos positivos aumenta drásticamente (de 40/40 a 13/40 en muestras limpias, según la model card).
- Los nombres de los directorios (`<dataset>__<family>`) son convenciones del sistema de búsqueda; renombrarlos rompe la integración con `--detector_root`.
- No se ha especificado la licencia, por lo que su uso comercial no está garantizado sin consultar al autor.
- No hay información sobre sesgos o limitaciones idiomáticas; el entrenamiento parece centrado en texto de seguridad, por lo que su rendimiento en otros dominios es desconocido.
- Es un detector binario por familia; no ofrece una probabilidad ni un umbral configurable, lo que limita su adaptación a entornos con tolerancia de falsos positivos distinta.
- El modelo base Mistral-7B-v0.1 tiene un contexto de 4096 tokens, lo que limita la detección en textos muy largos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/updateattacks/pi-detector-attack-targets-gpt54low-ps
- Perfil de la organización: https://huggingface.co/updateattacks
- Benchmark relacionado (no oficial): https://github.com/bastion-soft/pi-detector-bench
- Artículo sobre defensa contra inyección indirecta (referencia externa): https://arxiv.org/abs/2505.06311
