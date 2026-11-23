# trymirai/Qwen3.6-27B-M

## Resumen

Mirai's Qwen3.6-27B Medium Quantization (identificador `trymirai/Qwen3.6-27B-M`) es una cuantizacion de 4 bits del modelo Qwen3.6-27B de Alibaba, desarrollada por Mirai Labs y publicada bajo licencia Apache 2.0. Su objetivo es permitir la inferencia local eficiente del modelo original en hardware Apple silicon, reduciendo el peso del checkpoint manteniendo una divergencia KL baja respecto al modelo de referencia. El autor situa este checkpoint en la frontera de Pareto tamano-KL: no encontro un checkpoint mas pequeno con menor divergencia KL.

El modelo base es un transformer de Qwen con 27 mil millones de parametros nominales, aunque el checkpoint cuantizado almacena 14.085.711.872 parametros reales en formato safetensors (repositorio de 77,7 GB). La cuantizacion es de tipo entero asimetrico de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 64, e incorpora transformadas de Hadamard aleatorias de bloque diagonal para reducir los valores atipicos en activaciones y pesos.

La relevancia actual de esta ficha radica en que ejemplifica una tendencia creciente: checkpoints cuantizados de alta calidad con destilacion consciente de la cuantizacion, orientados a inferencia local en Mac. No obstante, la informacion publica es limitada: no se detallan idiomas soportados, benchmarks numericos ni la mayoria de especificaciones del modelo base, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base Qwen/Qwen3.6-27B; detalles no disponibles) |
| Parametros totales | 14.085.711.872 (parametros reales del checkpoint cuantizado); el modelo base se denomina 27B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits asimetrico con zero points de 4 bits, escalas bfloat16, group size 64; se mencionan tambien tags de 8 bits en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `uzu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.6-27B, un transformer del que no se proporcionan detalles estructurales en la informacion disponible (numero de capas, dimension oculta, atencion, contexto). El checkpoint publicado es el resultado de un proceso de cuantizacion post-entrenamiento seguido de destilacion consciente de la cuantizacion (quantization-aware distillation), lo que permite recuperar parte de la calidad perdida durante la compresion.

Tecnicamente, la cuantizacion emplea enteros asimetricos de 4 bits con zero points de 4 bits, escalas en bfloat16 y tamano de grupo 64. Para mitigar los valores atipicos en activaciones y pesos se aplican transformadas de Hadamard aleatorias de bloque diagonal (Block-diagonal Random Hadamard Transforms). El autor indica que, en su categoria de tamano y cuantizacion, el checkpoint es comparable al GGUF `Q4_K_M` de Unsloth para el mismo modelo base. No se detallan el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`.
- Razonamiento y conversacion: hereda las capacidades del modelo base Qwen3.6-27B, si bien no se detallan en la informacion disponible.
- Codigo y matematicas: no se documentan explicitamente para este checkpoint; dependen del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: el conjunto de evaluacion del autor incluye un 45% de datos publicos "agentic", lo que sugiere orientacion a cargas agenticas, aunque no se documentan capacidades concretas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Contexto largo: el conjunto de evaluacion incluye un 30% de datos publicos de SFT/contexto largo, pero no se especifica la ventana de contexto soportada.

## Casos de uso

- Inferencia local en Mac para desarrollo: el modelo esta pensado para ejecutarse en Apple silicon mediante el CLI `mirai` (instalable con Homebrew), lo que permite probar un modelo de escala 27B en un portatil o equipo de sobremesa Apple sin GPU dedicada.
- Prototipado de asistentes conversacionales: al ser un checkpoint de generacion de texto, puede usarse para construir prototipos de chat multi-turno en local antes de desplegar en infraestructura cloud.
- Evaluacion de calidad de cuantizacion: util para investigadores que quieran medir la degradacion respecto al modelo original Qwen3.6-27B en tareas propias, dado el enfoque del autor en la relacion tamano-KL.
- Flujos agenticos experimentales: el 45% de datos agenticos en la evaluacion sugiere idoneidad para probar pipelines de agentes locales, siempre que se valide el soporte real de tool calling.
- Privacidad y despliegue offline: al ejecutarse en local, permite procesar texto sensible sin enviar datos a servicios externos, adecuado para entornos con requisitos de confidencialidad.
- Base para ajuste fino o experimentacion: al estar en safetensors y bajo Apache 2.0, puede servir como punto de partida para experimentos de investigacion sobre modelos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo aporta una grafica cualitativa de divergencia KL frente al tamano del checkpoint, indicando que el modelo se situa en la frontera de Pareto tamano-KL, y una descripcion de la mezcla de evaluacion (45% agentico publico, 30% SFT/contexto largo publico, 25% chat privado). No se ofrecen valores concretos de KL ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El repositorio ocupa 77,7 GB, aunque el checkpoint cuantizado a 4 bits con 14.085.711.872 parametros reales sugiere un peso en memoria del orden de decenas de GB; el dato exacto no se proporciona.
- GPU recomendadas: no se indican GPU NVIDIA ni AMD; el autor solo soporta inferencia en Apple silicon.
- Compatibilidad con consumer GPU: no documentada. El soporte declarado es exclusivamente para Apple silicon (Mac con chip M-series).
- Opciones de despliegue: CLI `mirai` (Homebrew) y la libreria `uzu`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trymirai/Qwen3.6-27B-M | 14.085.711.872 reales (base 27B) | no disponible | 4 bits asimetrico, group size 64 | Apache 2.0 | Hugging Face, solo Apple silicon |
| unsloth/Qwen3.6-27B-GGUF (Q4_K_M) | base 27B | no disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | Hugging Face, ecosistema GGUF |
| Qwen/Qwen3.6-27B (original) | 27B | no disponible | sin cuantizar (bfloat16) | Apache 2.0 | Hugging Face |

El autor compara explicitamente su checkpoint con el GGUF `Q4_K_M` de Unsloth en la misma categoria de tamano y cuantizacion. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas.

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce degradacion respecto al modelo original; el autor la mitiga con destilacion consciente de la cuantizacion, pero no publica metricas de perdida.
- Soporte exclusivo para Apple silicon: no hay ruta documentada para GPU NVIDIA, AMD ni CPU x86, lo que limita el despliegue en produccion convencional.
- Idiomas soportados no documentados; no se puede garantizar cobertura multilingue.
- Longitud de contexto no especificada; riesgoso para aplicaciones que dependan de ventanas largas.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan mitigaciones especificas.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y las condiciones de la libreria `uzu`.
- El repositorio incluye tags de 4 bits y 8 bits, pero la model card solo describe la variante de 4 bits; conviene verificar que artefacto se descarga.
- El modelo depende de una libreria y CLI propietarios del autor (`uzu`, `mirai`), lo que puede afectar a la portabilidad y al mantenimiento a largo plazo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/Qwen3.6-27B-M
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Model card del base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/README.md
- Licencia del base: https://huggingface.co/Qwen/Qwen3.6-27B/blob/main/LICENSE
- GGUF comparable de Unsloth: https://huggingface.co/unsloth/Qwen3.6-27B-GGUF/blob/main/Qwen3.6-27B-Q4_K_M.gguf
- Documentacion de ejecucion de uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Pagina del modelo en Mirai: https://trymirai.com/local-models/alibaba-qwen3-6-27b-mirai-mirai-m-4
