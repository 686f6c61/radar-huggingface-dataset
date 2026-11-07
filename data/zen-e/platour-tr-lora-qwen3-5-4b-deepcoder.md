# zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder

## Resumen

PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder es un adaptador LoRA (PEFT) publicado por el autor zen-E sobre el backbone multimodal Qwen3.5-4B de Alibaba Qwen. No es un modelo completo: el repositorio de 1,0 GB contiene únicamente los pesos del adaptador, que se aplican sobre el decodificador de texto del modelo base, sin tocar el codificador de visión. El adaptador se enmarca en el proyecto de investigación PLatour, descrito en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976), que estudia la transferencia entre modelos (PACT): un modelo emisor grande codifica el prompt y un receptor más pequeño genera la respuesta.

El adaptador está entrenado sobre el dataset zen-E/PLatour-DeepCoder-Data y forma parte de una familia de artefactos de inferencia históricos del proyecto PLatour (existen variantes como la FullGRPO). La model card es explícita: no se publican puntuaciones de benchmark, no hay protocolo de selección de checkpoint y el propio autor advierte de que el rendimiento en tareas por sí solo no demuestra una comunicación efectiva entre modelos, por lo que se requiere evaluación independiente.

Su relevancia es fundamentalmente de investigación: sirve para reproducir y auditar los experimentos de PACT y sus controles (PACT-Check), no como un modelo listo para producción. La licencia es Apache 2.0, pero los términos del modelo base Qwen3.5-4B siguen siendo aplicables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-4B; el adaptador afecta solo al decodificador de texto |
| Parametros totales | no disponible (el adaptador ocupa 1,0 GB en el repo; el backbone Qwen3.5-4B no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-4B; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en FP32 original; el backbone admite las cuantizaciones de Qwen3.5-4B) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a los terminos del modelo base Qwen3.5-4B) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador es un LoRA estándar de PEFT aplicado sobre el decodificador de texto del backbone oficial Qwen3.5-4B, un transformer multimodal con codificador de visión según su configuración. Los módulos objetivo están restringidos al decodificador de texto mediante rutas completas de target modules; los módulos QKV fusionados permanecen fusionados para Transformers/PEFT, lo que difiere de la conversión de runtime a vLLM del proyecto. Todos los valores originales del adaptador en FP32 se conservan.

El entrenamiento se enmarca en el método PACT del paper: se entrenan puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y con soporte para modelos de atención híbrida. El dataset utilizado es zen-E/PLatour-DeepCoder-Data. La model card no detalla el número de tokens, la composición del dataset ni si se aplicó RLHF o DPO; la variante FullGRPO del proyecto sugiere el uso de GRPO en algún punto de la familia de artefactos, pero no se confirma para este adaptador concreto. El export está fijado al revision 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a de Qwen/Qwen3.5-4B, y las comprobaciones de carga locales se hicieron con Torch 2.15.0, Transformers 5.22.1 y PEFT 0.21.2.

## Capacidades

- Generación de texto y razonamiento heredados del backbone Qwen3.5-4B; el adaptador no añade capacidades nuevas verificadas.
- Especialización declarada en código (sufijo DeepCoder), derivada del dataset de entrenamiento; sin métricas publicadas que la cuantifiquen.
- El backbone soporta entrada de imagen a través de su codificador de visión, pero el adaptador no adapta dicho codificador.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; los idiomas no están listados.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Reproducción de experimentos PACT: cargar el adaptador sobre Qwen3.5-4B con la revisión fijada para replicar los controles PACT-Check (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) y analizar si las mejoras dependen de información útil del emisor.
- Auditoría de transferencia entre modelos: usar este artefacto como receptor pequeño en configuraciones emisor-receptor y medir la contribución real de las representaciones ocultas transferidas frente a la simple adaptación del receptor.
- Investigación sobre LoRA en decodificadores multimodales: estudiar el efecto de restringir los target modules al decodificador de texto mientras el codificador de visión permanece congelado.
- Punto de partida para fine-tuning de código: el adaptador DeepCoder puede servir como inicialización para experimentos de ajuste en tareas de generación de código, siempre con evaluación propia.
- Docencia y formación: ejemplo práctico de empaquetado PEFT con revisión de backbone fijada y comprobaciones de carga sintéticas.
- Comparación de variantes del proyecto: contrastar este LoRA con la variante FullGRPO del mismo proyecto para estudiar diferencias entre estrategias de entrenamiento.
- No se recomienda su uso en producción ni en atención al cliente sin una evaluación independiente previa, dado que el autor no publica benchmarks ni protocolo de selección de checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que son artefactos de inferencia históricos sin puntuaciones de benchmark y que las comprobaciones de carga y prompts sintéticos no reproducen la precisión de benchmark ni una trayectoria de entrenamiento histórica.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el backbone Qwen3.5-4B (no incluido en el repo de 1,0 GB).
- GPU recomendadas: no especificadas en la información proporcionada; el proyecto de referencia del ecosistema Qwen3.5-4B menciona entrenamiento LoRA en una sola H100, lo que orienta sobre el orden de magnitud, no sobre inferencia de este adaptador.
- Viabilidad en GPU de consumo: no confirmada para este adaptador; depende de la cuantización del backbone Qwen3.5-4B.
- Opciones de despliegue: Transformers + PEFT (ruta documentada con `PeftModel.from_pretrained` y `AutoModelForImageTextToText`). El proyecto menciona una conversión de runtime a vLLM distinta de la fusión QKV de Transformers/PEFT, pero no se documenta el procedimiento para este adaptador. llama.cpp, Ollama y TGI no están documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder | Adaptador LoRA sobre Qwen3.5-4B (1,0 GB) | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder | Variante FullGRPO sobre el mismo backbone | no disponible | sin benchmarks publicados en la informacion | no disponible | Hugging Face |
| Qwen/Qwen3.5-4B (base) | 4B (backbone completo) | no disponible | no disponible en la informacion | terminos de Qwen | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador: no es utilizable sin descargar el backbone Qwen3.5-4B en la revisión fijada.
- Ausencia total de benchmarks y de protocolo de selección de checkpoint; el autor advierte que el empaquetado no establece una evaluación imparcial.
- Las comprobaciones de carga y prompts sintéticos no reproducen precisión de benchmark ni la trayectoria de entrenamiento histórica.
- El adaptador no modifica el codificador de visión; las capacidades de imagen dependen exclusivamente del backbone.
- Riesgo de alucinación y sesgos: no documentados específicamente para este adaptador; heredados del backbone y del dataset de entrenamiento.
- Idiomas soportados no declarados; no se garantiza un comportamiento multilingüe.
- Licencia Apache 2.0 para el adaptador, pero los términos y avisos del modelo base Qwen3.5-4B siguen aplicándose y deben revisarse antes de cualquier uso comercial.
- La revisión del backbone fijada en el export no implica que el entrenamiento histórico usara esa misma revisión.
- Sin descargas ni likes en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-LoRA-Qwen3.5-4B-DeepCoder
- Variante FullGRPO del proyecto: https://huggingface.co/zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DeepCoder
- Paper PACT (arXiv:2611.06976): https://arxiv.org/abs/2611.06976
- Versión HTML del paper: https://arxiv.org/html/2611.06976
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/zen-E/PLatour-DeepCoder-Data
- Experimento de referencia de fine-tuning LoRA de Qwen3.5-4B: https://github.com/IIIIQIIII/qwen35-4b-lora-sft
