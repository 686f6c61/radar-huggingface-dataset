# Thox-ai/ThoxRoute-1.5B

## Resumen

ThoxRoute-1.5B es un adaptador LoRA de rango 16 publicado por THOX.ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo generativo de propósito general, sino un clasificador de intenciones y preferencias: su función es analizar una petición entrante y determinar a qué modelo o herramienta debe enrutarse dentro de la pila THOX (ThoxOS y MeshStack). El repositorio contiene únicamente los pesos del adaptador (unos 74 MB en `adapter_model.safetensors`), el tokenizador y los scripts de entrenamiento y evaluación.

La relevancia del modelo reside en su enfoque "local-first": está pensado para ejecutarse en dispositivos de borde y decidir el enrutamiento sin depender de un servicio en la nube. Al construirse sobre Qwen2.5-1.5B-Instruct, hereda la arquitectura transformer decoder-only del modelo base y su ventana de contexto, aunque la model card no documenta explícitamente estos parámetros para el adaptador.

Se trata de un componente de infraestructura, no de un asistente: el autor advierte explícitamente que "es un enrutador, no un respondedor" y que la calidad de la respuesta final depende del modelo al que se enrute. La licencia Apache-2.0 permite uso comercial, pero el modelo no está alineado en seguridad para exposición pública directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) con adaptador LoRA de rango 16 |
| Parametros totales | 1.5B (modelo base); adaptador LoRA de ~74 MB |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (Thox-ai/ThoxRoute-1.5B-GGUF); se menciona Q4_K_M como ejemplo de ejecucion |
| Idiomas soportados | Ingles (entrenamiento mayoritariamente en ingles; calidad inferior en otros idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un fine-tune mediante LoRA de rango 16 sobre Qwen2.5-1.5B-Instruct. El adaptador modifica los pesos del modelo base para convertir una capacidad generativa general en una tarea de clasificación de intenciones y preferencias. El repositorio incluye `adapter_config.json`, `configs/train.yaml`, `train.py` y `training_args.bin`, lo que permite reproducir o inspeccionar el procedimiento de entrenamiento.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron técnicas de RLHF o DPO. El autor indica que el corpus y el procedimiento son los descritos en la tarjeta tal como se publicó en el lanzamiento, sin reclamar entrenamiento adicional. El repositorio incluye también artefactos de evaluación (`eval/eval_report.txt`, `eval/ood_report.txt`, `eval/ood_v2_report.txt`, `ood_probe.py`, `ood_probe_v2.py`) y una taxonomía de rutas (`taxonomy/routes.json`), lo que sugiere un diseño orientado a la detección de peticiones fuera de distribución (OOD) además de la clasificación estándar.

## Capacidades

- Clasificación de intenciones y preferencias para enrutamiento de peticiones a modelos o herramientas dentro de la pila THOX.
- Detección de peticiones fuera de distribución (OOD) mediante los scripts `ood_probe.py` y `ood_probe_v2.py` incluidos en el repositorio.
- Enrutamiento basado en una taxonomía de rutas predefinida (`taxonomy/routes.json`).
- Ejecución en dispositivo y en el borde (local-first), sin dependencia de servicios en la nube.
- Compatibilidad con el stack Transformers + PEFT y con llama.cpp/Ollama mediante la build GGUF.
- Soporte de plantilla de chat estilo ChatML (`<|im_start|>system ... <|im_end|>`).
- Capacidad multilingüe limitada: entrenado principalmente en inglés, con calidad inferior en otros idiomas.
- No es un asistente general ni un modelo alineado en seguridad para exposición pública directa.

## Casos de uso

- Enrutamiento de peticiones en un stack multi-modelo: el adaptador clasifica cada petición entrante y decide si debe ir a un modelo grande, a un modelo pequeño local o a una herramienta específica, reduciendo el coste computacional al evitar invocar modelos grandes para tareas simples.
- Despliegue en dispositivos de borde: al ejecutarse sobre un modelo de 1.5B con cuantización GGUF Q4_K_M, puede correr en hardware modesto y tomar decisiones de enrutamiento sin conexión a la red.
- Filtrado de peticiones fuera de distribución: los scripts OOD incluidos permiten detectar consultas que no encajan en la taxonomía conocida y derivarlas a un flujo de revisión humana o a un modelo de respaldo.
- Pasarela de seguridad previa a la inferencia: al situarse delante de los modelos generativos, puede clasificar peticiones sensibles y aplicar guardarraíles antes de que lleguen a un modelo mayor.
- Orquestación de agentes multi-paso: en un pipeline de agentes, el router decide qué herramienta o sub-agente debe manejar cada subtarea en función de la intención detectada.
- Enrutamiento de preferencias de usuario: en aplicaciones con múltiples modos de respuesta (breve, detallado, técnico, divulgativo), el adaptador clasifica la preferencia del usuario y selecciona el modelo o configuración adecuada.
- Investigación sobre enrutamiento y clasificación de intenciones: el repositorio incluye scripts de entrenamiento y evaluación que permiten reproducir y extender el enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que "no se publica ningún resultado THOX GATE49 para este modelo". El repositorio contiene informes de evaluación internos (`eval/eval_report.txt`, `eval/ood_report.txt`, `eval/ood_v2_report.txt`) y un fichero de desacuerdos OOD (`eval/ood_disagreements.jsonl`), pero sus cifras no se reproducen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un adaptador sobre un modelo de 1.5B, los requisitos son los del modelo base. En precisión completa (fp16) se estiman en torno a 3 GB; con cuantización GGUF Q4_K_M, aproximadamente 1 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también cabe en GPUs de gama baja y en CPU.
- Cabe en GPU consumer: sí, en todas las GPU consumer con al menos 4 GB de VRAM en fp16, y en muchas integradas con la build GGUF cuantizada.
- Opciones de despliegue: Transformers + PEFT (adaptador), llama.cpp y Ollama mediante la build GGUF (Thox-ai/ThoxRoute-1.5B-GGUF). No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| ThoxRoute-1.5B | 1.5B (base) + LoRA r16 | No disponible | Safetensors (LoRA), GGUF | Apache-2.0 | Enrutamiento de intenciones/preferencias |
| Qwen2.5-1.5B-Instruct | 1.5B | No disponible | Safetensors, GGUF | Apache-2.0 | Asistente general |
| Modelos de enrutamiento tipo clasificador (p. ej., RouteLLM) | Variable | No disponible | Variable | Variable | Enrutamiento entre modelos |

La comparación directa con alternativas de enrutamiento no puede completarse con los datos disponibles: la model card no ofrece cifras de rendimiento que permitan contrastar con otros routers. La diferencia principal frente al modelo base es funcional: ThoxRoute-1.5B está especializado en clasificación de rutas y no en generación de respuestas.

## Limitaciones y advertencias

- Es un enrutador, no un respondedor: la calidad de la respuesta final depende del modelo al que se enrute.
- Los modelos pequeños cometen errores; las decisiones de enrutamiento que controlan acciones sensibles deben verificarse.
- El comportamiento y los sesgos reflejan los datos de entrenamiento, mayoritariamente en inglés; la calidad en otros idiomas es inferior.
- No está alineado en seguridad para exposición pública directa; debe desplegarse detrás de los guardarraíles de THOX en cualquier ruta pública.
- Fuera de alcance: decisiones médicas, legales, financieras o de seguridad crítica sin revisión humana, y control no supervisado de dispositivos físicos sin paso de confirmación.
- La model card no documenta el número de tokens de entrenamiento ni la composición exacta del corpus, lo que limita la evaluación independiente.
- No se han publicado resultados de benchmarks ni del estándar THOX GATE49 para este modelo.
- Licencia Apache-2.0: permite uso comercial, pero la licencia y el NOTICE del modelo base deben mantenerse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Thox-ai/ThoxRoute-1.5B
- Build GGUF: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
