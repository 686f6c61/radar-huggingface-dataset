# xiq/xiq-1

## Resumen

El modelo xiq-1 es un adaptador LoRA (Low-Rank Adaptation) publicado por el autor `xiq` sobre el modelo base `ansulev/LFM2.5-2.6B-Uncensored`. Se trata de un ajuste fino supervisado (SFT) implementado con las bibliotecas `transformers`, `trl` y `unsloth`, y su pipeline declarado en HuggingFace es `text-generation`. El repositorio contiene un total de 2.697.198.592 parámetros en formato `safetensors`, lo que sugiere que el adaptador se ha fusionado o guardado junto con los pesos del modelo base de 2.600 millones de parámetros. A fecha de creación (septiembre de 2026), el modelo no tiene descargas ni likes, y su `model card` es una plantilla casi vacía, sin información detallada sobre el proceso de entrenamiento, los datos utilizados o las capacidades resultantes. El término "Uncensored" en el modelo base indica que se ha eliminado o reducido la alineación de seguridad, lo que puede ser relevante para determinadas aplicaciones de investigación, pero también introduce riesgos significativos. En conjunto, xiq-1 es un experimento de afinado de bajo rango con documentación mínima, cuya utilidad práctica resulta difícil de evaluar sin datos adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre ansulev/LFM2.5-2.6B-Uncensored) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo LoRA, entrenado mediante supervisión fina (SFT) con `transformers`, `trl` y `unsloth`. El README indica que la versión de PEFT utilizada es 0.20.0. No se especifica la arquitectura del modelo base `LFM2.5-2.6B-Uncensored`, ni su número de capas, mecanismo de atención, ni si es un transformer estándar o un híbrido. Tampoco se ha publicado información sobre la composición del dataset de entrenamiento, el número de tokens procesados, las técnicas de alineación (RLHF, DPO) o cualquier innovación técnica destacable. La etiqueta "Uncensored" sugiere que el modelo base ha sido afinado para minimizar restricciones de contenido, pero no se aportan detalles sobre cómo se ha logrado ni qué implicaciones tiene en el rendimiento.

## Capacidades

- Generacion de texto: el pipeline declarado es `text-generation`, pero no se han publicado ejemplos ni evaluaciones de la calidad de la generacion.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- No se ha publicado ninguna descripcion de funcionalidades especificas mas alla de la etiqueta "Uncensored" del modelo base.

## Casos de uso

- Experimentacion con adaptadores LoRA: el modelo puede servir como ejemplo de como aplicar un ajuste fino supervisado sobre un modelo base de 2.6B, aunque no se proporcionan los datos de entrenamiento ni el codigo de afinado.
- Investigacion en desalineacion de modelos: al estar basado en un modelo "Uncensored", podria ser de interes para estudiar los efectos de la eliminacion de barreras de seguridad, pero no hay resultados publicados.
- Uso local en entornos de pruebas: dado su tamano moderado, podria cargarse en GPU de consumo para tareas de generacion de texto sin requisitos de produccion, siempre que se acepte la falta de documentacion.
- No se dispone de casos de uso concretos, reales o verificados. Cualquier aplicacion practica requeriria una evaluacion previa del modelo por parte del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion comparable. Tampoco se ha publicado informacion sobre latencia o throughput de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que el modelo base tiene aproximadamente 2.600 millones de parametros, en precision FP16 los pesos ocupan alrededor de 5,2 GB. Sumando el overhead de activaciones y el adaptador, se estima un requisito minimo de unos 6 GB de VRAM.
- GPU recomendadas: una RTX 3060 de 12 GB, RTX 4070, A10G, A100 o cualquier GPU con al menos 8 GB de VRAM para FP16. Con cuantizacion 4-bit, la VRAM necesaria podria reducirse a unos 2-3 GB, lo que permitiria su uso en RTX 3050 o inferiores con 8 GB.
- Compatibilidad con GPU de consumo: si, en cuantizacion 4-bit es viable en GPU de gama media-baja, aunque no se han publicado benchmarks reales.
- Opciones de despliegue: se puede cargar con `transformers` y `peft` aplicando el adaptador sobre el modelo base. Para despliegue en produccion, seria necesario fusionar el adaptador y, si se desea, convertir los pesos a GGUF para usar `llama.cpp` u `Ollama`. Tambien podria utilizarse `vLLM` tras la fusion, siempre que el modelo base sea compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xiq-1 | 2.697.198.592 | no disponible | no disponible | HuggingFace |
| ansulev/LFM2.5-2.6B-Uncensored | 2.6B | no disponible | no disponible | HuggingFace |
| Modelos comparables | no disponible | no disponible | no disponible | no disponible |

No se han identificado modelos de la misma categoria con datos de rendimiento publicados. El unico punto de comparacion directo es el modelo base `ansulev/LFM2.5-2.6B-Uncensored`, pero no se aportan benchmarks de ninguno de los dos. Por tanto, no es posible establecer una comparativa tecnica rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: se desconocen las condiciones de uso, incluyendo cualquier restriccion comercial, lo que impide su despliegue en produccion sin asesoramiento legal previo.
- Model card vacio: la documentacion es una plantilla sin contenido, sin datos de entrenamiento, evaluacion ni recomendaciones de uso.
- Riesgo de alucinacion no evaluado: al no haber benchmarks ni pruebas de calidad, no es posible estimar la fiabilidad de las salidas.
- Sesgos desconocidos: no se ha realizado ningun analisis de sesgos ni se ha publicado informacion al respecto.
- Modelo "Uncensored": al reducir la alineacion de seguridad, el modelo puede generar contenido ofensivo, ilegal o danino. Debe utilizarse exclusivamente en entornos controlados y con las salvaguardas adecuadas.
- Sin soporte de idiomas declarado: no se sabe que lenguas domina, aunque el nombre del modelo base sugiere un modelo de lenguaje generico.
- Fecha de creacion futura: la metadata indica una fecha de 2026, lo que puede indicar un error en los metadatos o un dato sintetico; en cualquier caso, el modelo no cuenta con adopcion ni validacion de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/xiq/xiq-1
- Modelo base (ansulev/LFM2.5-2.6B-Uncensored): https://huggingface.co/ansulev/LFM2.5-2.6B-Uncensored
- Paper, repositorio, demo o blog: no disponibles.
