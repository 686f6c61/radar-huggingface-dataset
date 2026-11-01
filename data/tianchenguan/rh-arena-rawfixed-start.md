# TianchenGuan/rh-arena-rawfixed-start

## Resumen

RH-Arena Raw-vs-Fixed es un artefacto de investigación publicado por TianchenGuan que contiene dos checkpoints de un mismo proceso de ajuste supervisado (SFT) sobre Qwen3-30B-A3B, un modelo de mezcla de expertos (MoE) de 30.500 millones de parámetros totales y 3.300 millones activos. Concretamente, el repositorio aloja los puntos de partida del experimento que compara el entrenamiento de un agente de programación con datos de entorno originales frente a datos reparados mediante auditoría, en el marco del proyecto RH-Arena.

El modelo parte de la base Qwen/Qwen3-30B-A3B-Base, pasa por un mid-training orientado a ingeniería de software y datos estilo StarCoder (Qwen3-30B-A3B-midtrain-swe50-star50) y culmina en un SFT con una mezcla de receta abierta de datos públicos de chat, código, matemáticas, seguridad y agentes de terminal, sin datos de proveedores. Los dos subdirectorios incluidos son `common-start/` (iteración 7999 del SFT, punto de partida común de ambas ramas de la línea RL y modelo de referencia en las tablas de evaluación) y `sft-step-201/` (iteración 201, inicio de la línea de SFT continuado).

Su relevancia es metodológica más que de producto: se publica para reproducir un experimento sobre calidad de datos en entornos de agentes, no como modelo listo para producción. No tiene ajuste de seguridad más allá del propio SFT y el autor lo declara explícitamente no apto para uso productivo. La licencia es Apache-2.0, heredada de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3 MoE), 48 capas, 128 expertos |
| Parametros totales | 30.500 millones (Qwen3-30B-A3B) |
| Parametros activos | 3.300 millones |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-30B-A3B: un transformer con mezcla de expertos de 48 capas y 128 expertos, del que se activan 3.300 millones de parámetros por token. Sobre esa base, el autor aplica un mid-training de continuación de preentrenamiento con datos de ingeniería de software y corpus estilo StarCoder, y después un SFT en bf16 con pérdida causal-LM estándar sobre una mezcla de receta abierta: chat, código, matemáticas, seguridad y datos de agentes de terminal procedentes de fuentes públicas, con los datos de proveedores eliminados.

El repositorio no contiene el modelo final del experimento, sino sus puntos de partida: la iteración 7999 del SFT (inicio común de las dos ramas de la línea RL y referencia en las tablas de evaluación) y la iteración 201 (inicio de la línea de SFT continuado). Las innovaciones técnicas del experimento —comparación entre datos de entorno originales y reparados por auditoría— se documentan en el repositorio GitHub `rh-arena`, bajo `experiments/raw_vs_fixed_training/`, no en esta model card.

## Capacidades

- Generación de texto y modelado causal de lenguaje, con la base Qwen3-30B-A3B.
- Capacidades de agente de programación, por el mid-training en ingeniería de software y el SFT con datos de terminal.
- Razonamiento y matemáticas, cubiertos por la mezcla de SFT (chat, código, matemáticas).
- Datos de seguridad incluidos en el SFT, sin ajuste de seguridad adicional posterior.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Reproducción del experimento Raw-vs-Fixed: cargar `common-start/` como punto de partida de las dos ramas RL y comparar el efecto de datos de entorno originales frente a reparados por auditoría, siguiendo el código de `experiments/raw_vs_fixed_training/`.
- Investigación sobre calidad de datos en agentes: usar `sft-step-201/` como inicio de la línea de SFT continuado para aislar el efecto del SFT adicional sobre el comportamiento del agente.
- Línea base de evaluación de agentes de programación: emplear `common-start/` como modelo de referencia en tablas comparativas internas de tareas de código y terminal.
- Estudio de recetas de SFT abiertas: analizar cómo una mezcla pública de chat, código, matemáticas, seguridad y datos de terminal afecta a un MoE de 30B con 3,3B activos.
- Experimentación académica con MoE de gran tamaño: el ratio de activación (3,3B de 30,5B) permite estudiar eficiencia de inferencia y enrutamiento de expertos en un modelo abierto con licencia Apache-2.0.
- Fine-tuning posterior controlado: partir de estos checkpoints para entrenar variantes con datos propios, sabiendo que no hay ajuste de seguridad y que el uso en producción queda fuera del alcance previsto por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 61 GB solo para pesos (30,5B × 2 bytes), más overhead de activaciones y caché KV; no disponible la cifra exacta del autor.
- VRAM estimada en cuantización de 8 bits: aproximadamente 30-35 GB; en 4 bits, aproximadamente 16-20 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; dos GPU de 40-48 GB en paralelo como alternativa.
- GPU de consumo: no cabe en bf16 en una RTX 4090 (24 GB); requeriría cuantización agresiva (4 bits) y aun así el margen es ajustado por el overhead del MoE.
- Opciones de despliegue: transformers con `device_map="auto"` y `torch_dtype="bfloat16"`, según el ejemplo de la model card; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 122,1 GB, correspondiente a los dos checkpoints en bf16.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RH-Arena rawfixed-start (este) | 30,5B / 3,3B | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-30B-A3B-Base | 30,5B / 3,3B | no disponible | Apache-2.0 | HuggingFace, modelo base upstream |
| TianchenGuan/Qwen3-30B-A3B-midtrain-swe50-star50 | 30,5B / 3,3B | no disponible | no disponible | HuggingFace, checkpoint intermedio del linaje |

La comparación con alternativas de otro fabricante no está disponible en la información proporcionada. Frente a sus antecesores del linaje, este repositorio añade el SFT de receta abierta y se distribuye como artefacto de investigación con dos subcarpetas de checkpoint.

## Limitaciones y advertencias

- No es un modelo para producción: el autor lo declara explícitamente como artefacto de investigación para reproducir un experimento.
- Sin ajuste de seguridad más allá del SFT: no ha pasado por RLHF ni por un proceso específico de alineación de seguridad.
- Riesgo de alucinación y de comportamiento inseguro en tareas de agente de terminal: los datos de SFT incluyen trayectorias de agente sin validación adicional publicada.
- Idiomas soportados no documentados; la cobertura multilingüe no está garantizada.
- Longitud de contexto no documentada en la model card de este repositorio.
- Los README dentro de las subcarpetas son las model cards originales de Qwen3-30B-A3B, no documentación específica de estos checkpoints.
- Descargas y likes nulos en el momento de la consulta: sin validación por parte de la comunidad.
- Licencia Apache-2.0, que permite uso comercial, pero el autor desaconseja el uso productivo por la ausencia de ajuste de seguridad.
- El repositorio ocupa 122,1 GB, lo que condiciona el almacenamiento y la descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TianchenGuan/rh-arena-rawfixed-start
- Modelo base: https://huggingface.co/Qwen/Qwen3-30B-A3B-Base
- Checkpoint de mid-training: https://huggingface.co/TianchenGuan/Qwen3-30B-A3B-midtrain-swe50-star50
- Repositorio del experimento: `rh-arena` en GitHub, ruta `experiments/raw_vs_fixed_training/` (URL completa no disponible en la información proporcionada)
