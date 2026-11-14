# xv0y5ncu/SmolLM2-135M-Instruct-GLQ-4bpw

## Resumen

SmolLM2-135M-Instruct-GLQ-4bpw es una cuantizacion del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicada por el usuario xv0y5ncu mediante la tecnica GLQ (Golay-Leech Quantization). El modelo base es un transformer decoder-only de 134,5 millones de parametros entrenado por Hugging Face para generacion de texto conversacional, con un contexto de 8.192 tokens y licencia Apache 2.0. Esta version aplica una cuantizacion post-entrenamiento basada en reticulos de Golay-Leech (E8 lattice) para reducir el peso de los pesos almacenados.

La relevancia de esta ficha es doble: por un lado ilustra una tecnica de cuantizacion poco habitual (reticulos E8 en lugar de escalado por bloques tipo GPTQ/AWQ), y por otro documenta un caso de advertencia importante. La propia model card indica que esta build queda sustituida por `SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw`, porque el padding de la transformada de Hadamard (FHT) de potencia de dos se almaceno como bits reales, elevando la tasa efectiva a ~10,07 bpw en lugar de los 4,0 bpw nominales. El autor mantiene los pesos publicados para no romper referencias existentes.

El dato de safetensors refleja 95.669.568 parametros almacenados, coherente con un modelo base de ~135M mas tensores auxiliares de cuantizacion. El repositorio ocupa 0,2 GB. No se dispone de informacion sobre idiomas soportados declarados por el autor de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2), pesos cuantizados con GLQ (reticulo E8 / Golay-Leech) |
| Parametros totales | 95.669.568 (safetensors del repo cuantizado); modelo base SmolLM2-135M-Instruct ~135M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta build (el modelo base SmolLM2-135M-Instruct declara 8.192 tokens) |
| Tipos de cuantizacion | GLQ 4 bpw nominal; tasa efectiva ~6,4 bpw segun nota de la model card, y ~10,07 bpw segun el aviso de supersesion (padding FHT almacenado como bits reales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (requiere `glq >= 0.2.8`, `transformers >= 5.0`, `torch >= 2.0`) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de la familia SmolLM2 de Hugging Face, disenado para generacion de texto y conversacion en entornos con recursos limitados. Esta publicacion no reentrena el modelo: aplica cuantizacion post-entrenamiento con GLQ, una tecnica que representa los pesos sobre un reticulo E8 (Golay-Leech) en lugar del escalado por grupos habitual en GPTQ o AWQ. La implementacion usa una transformada de Hadamard rapida (FHT) con padding a potencia de dos para rotar los pesos antes de cuantizar.

La innovacion tecnica es el uso de reticulos E8 para el redondeo, que en teoria permite una mejor relacion distorsion/tasa que el redondeo escalar. Sin embargo, esta build concreta tiene un defecto documentado por el propio autor: el padding dimensional (hidden_size=576 redondeado a 1024) se almaceno como bits reales, lo que eleva la tasa efectiva muy por encima de la nominal. La version sucesora `GLQ-block-diagonal-4bpw` corrige este problema con RHT block-diagonal. No hay informacion sobre datos de entrenamiento especificos de esta cuantizacion, mas alla de los del modelo base (no detallados en la informacion proporcionada).

## Capacidades

- Generacion de texto autoregresiva y conversacion multi-turno (hereda las capacidades del modelo base SmolLM2-135M-Instruct).
- Instrucciones en formato chat: el modelo base esta ajustado para seguir instrucciones.
- Generacion de codigo basico y respuestas a preguntas sencillas, limitado por el tamano del modelo base (135M).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el tamano del modelo base hace poco probable un rendimiento solido en estas tareas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado rapido de pipelines de generacion de texto en local: el modelo ocupa 0,2 GB en el repositorio, por lo que se puede cargar en entornos con muy poca memoria y validar flujos de inferencia antes de escalar a modelos mayores.
- Pruebas de integracion de la libreria GLQ: sirve como caso de referencia para verificar que `glq.hf_integration` funciona con `transformers` y `vllm`, dado que el autor documenta el comando `vllm serve ... --quantization glq`.
- Educacion y experimentacion con cuantizacion por reticulos: util para comparar el comportamiento de GLQ frente a GPTQ/AWQ en un modelo pequeno y de licencia permisiva.
- Generacion de texto en dispositivos con restricciones severas de memoria: el modelo base de 135M es adecuado para tareas de autocompletado o respuestas cortas en CPU o GPU de gama baja, aunque la tasa efectiva de esta build (~10,07 bpw) reduce la ventaja esperada.
- Baseline en evaluaciones de compresion: permite medir el impacto de la cuantizacion en calidad frente al modelo original sin cuantizar en tareas de lenguaje acotadas.
- Filtrado o clasificacion de texto ligera: con prompts adecuados puede usarse para etiquetado simple o reformulacion, siempre que se acepte la calidad limitada de un modelo de 135M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 0,2 GB; la inferencia con `dtype="float16"` y `device_map="cuda"` requiere aproximadamente 0,5-1 GB de VRAM incluyendo overhead de activaciones y tokenizer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4060, T4, L4 y superiores. Tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con `glq.hf_integration` (requiere `transformers >= 5.0`, `torch >= 2.0`, `glq >= 0.2.8`) y vLLM con `--quantization glq`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo base de 135M es de baja latencia por naturaleza, pero la cuantizacion GLQ puede anadir overhead de decodificacion no cuantificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct-GLQ-4bpw (este) | ~95,7M almacenados (base ~135M) | no disponible | Apache 2.0 | GLQ 4 bpw nominal, ~10,07 bpw efectivo | Sustituido por la build block-diagonal |
| SmolLM2-135M-Instruct (base) | ~135M | 8.192 tokens | Apache 2.0 | FP16/BF16 | Modelo original de Hugging Face |
| SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw | no disponible | no disponible | Apache 2.0 | GLQ 4 bpw sin desperdicio de padding | Version recomendada por el autor |
| Otros modelos ~135M (p. ej. Qwen2.5-0.5B, no comparable directamente por tamano) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La build esta marcada como supersedida por el propio autor: la tasa efectiva es ~10,07 bpw en lugar de 4,0 bpw por el padding FHT almacenado como bits reales. Para nuevos despliegues se recomienda la version `block-diagonal-4bpw`.
- El modelo base de 135M tiene capacidad limitada de razonamiento, matematicas y codigo; las alucinaciones son frecuentes en tareas abiertas.
- No hay informacion sobre sesgos especificos ni sobre composicion del dataset de entrenamiento en la informacion proporcionada.
- Idiomas soportados no declarados; el rendimiento fuera del ingles puede degradarse notablemente.
- Requiere versiones muy recientes de dependencias (`transformers >= 5.0`, `glq >= 0.2.8`), lo que puede complicar la integracion en stacks existentes.
- No se documenta soporte para llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo base de 135M hace recomendable validar su comportamiento en el dominio concreto antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/SmolLM2-135M-Instruct-GLQ-4bpw
- Version sucesora: https://huggingface.co/xv0y5ncu/SmolLM2-135M-Instruct-GLQ-block-diagonal-4bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio GLQ: https://github.com/cnygaard/glq
