# Yann0122/OPO-8B

## Resumen

OPO-8B es un modelo vision-lenguaje de 8.767 millones de parametros desarrollado por Yann0122, presentado como el modelo asociado al articulo "Learning Where to Look: Observation Policy Optimization for Thinking with Images" (NeurIPS 2026). Se construye como un fine-tuning de Qwen3-VL-8B-Instruct y su proposito es mejorar el razonamiento visual en imagenes de alta resolucion mediante el aprendizaje de una politica de observacion: el modelo decide donde ampliar (zoom-in) para adquirir evidencia visual fina antes de responder.

La innovacion central es el entrenamiento con aprendizaje por refuerzo (reinforcement learning) que combina ramificacion de observaciones guiada por incertidumbre y atribucion de ventaja localizada en la evidencia. En lugar de procesar la imagen completa a resolucion fija, el modelo aprende a invocar herramientas de zoom para inspeccionar regiones concretas, lo que resulta especialmente relevante para tareas de percepcion en alta resolucion (4K y 8K) donde los detalles pequenos determinan la respuesta correcta.

El modelo se publica en Hugging Face con la libreria transformers, formato safetensors y pipeline image-text-to-text. Es relevante ahora porque aborda una limitacion estructural de los VLM convencionales: la perdida de detalle al reescalar imagenes grandes, y lo hace con un modelo de 8B parametros que puede desplegarse en hardware relativamente asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (derivada de Qwen3-VL-8B-Instruct) |
| Parametros totales | 8.767.123.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OPO-8B parte de Qwen3-VL-8B-Instruct, un transformer multimodal que combina un encoder visual con un decoder de lenguaje. Sobre esa base, el autor aplica un proceso de reinforcement learning orientado a la politica de observacion: el modelo aprende a decidir que regiones de la imagen ampliar mediante herramientas de zoom-in, en lugar de depender unicamente de la representacion global de la imagen. El mecanismo descrito en la model card es "uncertainty-guided observation branching" (ramificacion de observaciones guiada por incertidumbre) junto con "evidence-localized advantage attribution" (atribucion de ventaja localizada en la evidencia), lo que sugiere un esquema de RL donde la recompensa se asigna a las observaciones que aportan evidencia relevante para la respuesta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases adicionales de SFT, DPO o RLHF mas alla del proceso de RL descrito. Tampoco se detalla la longitud de contexto ni innovaciones de decodificacion especulativa o atencion lineal. La arquitectura subyacente es la de Qwen3-VL, pero la model card no aporta detalles tecnicos adicionales sobre modificaciones estructurales.

## Capacidades

- Razonamiento visual en imagenes de alta resolucion mediante invocacion de herramientas de zoom-in para inspeccionar regiones concretas.
- Generacion de texto e image-text-to-text: responde preguntas sobre imagenes combinando percepcion global y evidencia local ampliada.
- Soporte de tool use / function calling: el modelo esta entrenado para usar herramientas de zoom como parte de su politica de observacion.
- Razonamiento multi-paso: la ramificacion de observaciones implica secuencias de decision sobre donde mirar antes de responder.
- Capacidades de agente visual: puede encadenar observaciones y actualizar su evidencia a medida que amplia regiones.
- Capacidades multilingues: no disponible (heredadas potencialmente de Qwen3-VL, pero no confirmadas en la model card).
- Capacidades de codigo, matematicas o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Inspeccion de documentos tecnicos y planos en alta resolucion: el modelo puede ampliar zonas concretas de un plano o esquema 4K/8K para leer cotas, etiquetas o simbolos pequenos que se perderian en un reescalado global. Es adecuado porque su entrenamiento RL premia la localizacion de evidencia fina.
- Analisis de imagenes satelitales o aereas: para detectar objetos pequenos (vehiculos, infraestructuras, cambios en el terreno) el modelo puede hacer zoom sobre regiones candidatas y verificar su presencia antes de emitir una conclusion.
- Revision de radiologia o imagenes medicas de alta resolucion (con supervision humana): el modelo puede ampliar regiones de interes para describir hallazgos visibles, aunque no sustituye el diagnostico clinico.
- Control de calidad industrial: inspeccion de defectos superficiales en imagenes de alta resolucion de componentes, donde el modelo amplia la zona sospechosa y confirma la presencia de grietas o irregularidades.
- Extraccion de informacion de capturas de pantalla y UI: lectura de interfaces densas donde los elementos son pequenos, usando zoom para localizar campos, botones o valores concretos.
- Asistencia en tareas de percepcion espacial: responder preguntas sobre relaciones espaciales entre objetos en imagenes grandes (benchmarks V* Spatial), util en robótica o navegacion asistida.
- Analisis de tablas y graficos complejos: ampliar celdas o ejes para extraer valores exactos en documentos financieros o cientificos escaneados a alta resolucion.

## Benchmarks y rendimiento

Resultados de precision (%) en benchmarks de percepcion de alta resolucion, segun la model card:

| Modelo | Herramienta | Parametros | V* Attr. | V* Spatial | V* Overall | HR-Bench 4K FSP | HR-Bench 4K FCP | HR-Bench 4K Overall | HR-Bench 8K FSP | HR-Bench 8K FCP | HR-Bench 8K Overall |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GPT-5 mini | no | no disponible | no disponible | no disponible | 78.6 | no disponible | no disponible | 78.6 | no disponible | no disponible | 74.4 |
| GPT-5.2 | no | no disponible | no disponible | no disponible | 75.9 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Claude Opus 4.6 | no | no disponible | no disponible | no disponible | 66.5 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la model card proporcionada esta truncada y no incluye las filas correspondientes a OPO-8B ni a otros modelos de la comparativa (por ejemplo, el propio Qwen3-VL-8B-Instruct). No se dispone de los resultados numericos de OPO-8B en la informacion disponible, por lo que no se presentan cifras del modelo evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 17,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 9-10 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 5-6 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para BF16 ajustado o cuantizacion 8 bits.
- GPU de consumo: cabe en RTX 4090 y potencialmente en RTX 3090 (24 GB) en BF16 con cuidado; en cuantizacion 4 bits podria caber en GPUs de 8-12 GB, aunque no hay datos confirmados de soporte.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OPO-8B | 8.767 M | no disponible | VLM con RL para politica de observacion (zoom) | no disponible | Hugging Face (Yann0122/OPO-8B) |
| Qwen3-VL-8B-Instruct | ~8B (heredado) | no disponible | VLM instruct base | no disponible en esta ficha | Hugging Face (Qwen/Qwen3-VL-8B-Instruct) |
| GPT-5 mini | no disponible | no disponible | VLM propietario | propietaria | API |
| Claude Opus 4.6 | no disponible | no disponible | VLM propietario | propietaria | API |

La comparativa se limita a los modelos citados en la model card. No se dispone de datos de rendimiento de OPO-8B ni de Qwen3-VL-8B-Instruct en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card esta truncada en la informacion disponible: faltan los resultados propios del modelo y la mayoria de filas de la tabla comparativa, por lo que no se puede verificar su rendimiento real.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base Qwen3-VL-8B-Instruct y la del propio repositorio antes de usarlo en produccion.
- Idiomas soportados no confirmados: aunque herede capacidades multilingues de Qwen3-VL, no hay declaracion explicita en la model card.
- Longitud de contexto no disponible: no se puede planificar su uso en tareas de contexto largo sin verificacion adicional.
- Riesgo de alucinacion inherente a los VLM: el modelo puede describir detalles inexistentes en regiones ampliadas, especialmente si la herramienta de zoom devuelve imagenes borrosas o mal recortadas.
- Dependencia de la herramienta de zoom: el rendimiento depende de la implementacion del tool de zoom-in; una integracion incorrecta puede degradar la calidad de las observaciones y, con ello, las respuestas.
- Sin datos de sesgos: no se ha publicado informacion sobre sesgos demograficos, culturales o geograficos del modelo.
- Modelo de investigacion (NeurIPS 2026): sin descargas ni likes en el momento de la ficha, sin validacion comunitaria; tratarlo como prototipo experimental.
- No hay informacion sobre cuantizaciones publicadas ni sobre compatibilidad con motores de inferencia distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/Yann0122/OPO-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper (referenciado en la model card): "Learning Where to Look: Observation Policy Optimization for Thinking with Images" (NeurIPS 2026) — no se proporciona URL directa en la informacion disponible.
- Repositorio de codigo: no disponible.
- Demo: no disponible.
