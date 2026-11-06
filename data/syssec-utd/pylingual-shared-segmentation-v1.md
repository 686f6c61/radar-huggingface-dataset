# syssec-utd/pylingual-shared-segmentation-v1

## Resumen

`pylingual-shared-segmentation-v1` es un modelo de segmentación de código Python desarrollado por el grupo `syssec-utd` (aparentemente vinculado a investigación en seguridad de sistemas) como parte de un estudio sobre arquitecturas de backbone compartido con adaptadores LoRA por versión. El modelo actúa como el backbone universal de segmentación del proyecto PyLingual, una iniciativa de descompilación de bytecode Python a código fuente. Está entrenado sobre ficheros fuente de Python 3.6 a 3.14, dejando 3.15 como conjunto reservado.

Arquitectónicamente se trata de un transformer encoder de tipo RoBERTa con 108.887.043 parámetros, especializado en una tarea de segmentación (probablemente tokenización estructurada o etiquetado de secuencias sobre código fuente). No es un modelo generativo ni un asistente conversacional: su función es producir representaciones o etiquetas de segmentación que alimentan etapas posteriores del pipeline de descompilación.

Su relevancia es acotada pero específica: cubre un nicho poco atendido como es el análisis estático y la descompilación de múltiples versiones del intérprete de Python con un único backbone, evitando mantener un modelo separado por versión. La información pública disponible es escasa (19 descargas, sin pipeline declarado, licencia "other" sin detallar), por lo que muchos campos de esta ficha deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (según tag `roberta`) |
| Parametros totales | 108.887.043 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | no disponible (el dominio es código Python, no lenguaje natural) |
| Licencia | other (sin términos especificados en la model card) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia RoBERTa con 108,9 millones de parámetros, inicializado desde un checkpoint previo de entrenamiento MLM (masked language modeling) ubicado en `/home/henryh/pylingual-runs/universal/mlm/checkpoint`. Sobre esa inicialización se realizó un ajuste fino para la tarea de segmentación compartida, con 2 épocas, batch global de 28 (28 × 1 acumulación × 1 GPU), learning rate 2e-05, weight decay 0.01, precisión FP16 y semilla 20261020.

Los datos de entrenamiento provienen del dataset `syssec-utd/pylingual-shared-encoded-v1`, split `universal/segmentation`, en la revisión `0f70ef5ada329b652a6cd67502244db733f98109`: 50.000 ficheros fuente de Python que generan 1.540.697 filas codificadas, con un tokenizer cuyo `tokenizer.json` tiene sha256 `61c4f9cd711448c6f71db41e93b6cbbe9fc3d0c994f3d427b0faecfd02e954df`. La cobertura abarca Python 3.6 a 3.14, con 3.15 reservado para evaluación. El repositorio incluye un directorio `last-checkpoint/` con el checkpoint reanudable del Trainer y un fichero `run/provenance.json` que registra todos los argumentos de entrenamiento y el manifiesto completo de datos. No se documenta uso de RLHF, DPO ni innovaciones de decodificación, lo cual es coherente con una tarea discriminativa de segmentación.

## Capacidades

- Segmentación de código fuente Python: produce etiquetas o representaciones de segmentación sobre ficheros `.py` de las versiones 3.6 a 3.14.
- Backbone compartido multi-versión: un único modelo sirve como base para el estudio de adaptadores LoRA por versión del intérprete.
- Codificación de código con tokenizer propio (hash documentado), orientada a pipelines de análisis estático.
- Integración en el pipeline PyLingual de descompilación de bytecode a fuente.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe de lenguaje natural ni capacidades de visión o audio.
- No se documenta modo "thinking" ni generación de texto libre.

## Casos de uso

- Descompilación de bytecode Python: el modelo actúa como etapa de segmentación del pipeline PyLingual, etiquetando estructuras del código fuente reconstruido para guiar la generación posterior. Es adecuado porque está entrenado específicamente sobre pares fuente/bytecode de múltiples versiones.
- Análisis estático multi-versión: permite procesar código escrito para Python 3.6 hasta 3.14 con un solo backbone, simplificando el mantenimiento frente a un modelo por versión.
- Investigación en adaptadores LoRA por versión: sirve como base congelada sobre la que entrenar adaptadores específicos de cada versión del intérprete, tal como plantea el estudio original.
- Extracción de características de código para clasificación o detección: sus embeddings de segmentación pueden alimentar clasificadores de estilo, detección de código malicioso o de patrones sospechosos, en línea con el perfil de seguridad del grupo autor.
- Construcción de datasets etiquetados: útil para generar anotaciones de segmentación sobre corpus Python que alimenten otros modelos o pipelines de análisis.
- Evaluación de generalización entre versiones: el split reservado de Python 3.15 permite medir cómo se comporta el backbone ante una versión no vista, un caso de uso metodológico para investigadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,22 GB de pesos (108,9 M de parámetros), más overhead de activaciones y tokenizer; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 no suponen cuello de botella para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2-4 GB de VRAM, e incluso en CPU para lotes pequeños.
- Opciones de despliegue: al ser un modelo safetensors de tipo RoBERTa, puede cargarse con `transformers` (clase `RobertaModel` o similar), y exportarse a ONNX o a GGUF para `llama.cpp` si se requiere, aunque no hay soporte documentado por el autor para estas rutas.
- Latencia y throughput estimados: no disponibles; al tratarse de un encoder de 109 M de parámetros, el throughput debería ser alto (miles de secuencias por segundo en GPU moderna con batch adecuado), pero no hay mediciones publicadas.
- Tamaño del repositorio: 6,5 GB, lo que sugiere que incluye checkpoints intermedios (`last-checkpoint/`) además de los pesos finales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `syssec-utd/pylingual-shared-segmentation-v1` | 108,9 M | no disponible | Segmentación de código Python multi-versión | other (sin detallar) | Hugging Face, 19 descargas |
| `microsoft/codebert-base` | ~125 M | 512 tokens | Representación de código (encoder RoBERTa) | MIT | Ampliamente disponible |
| `microsoft/graphcodebert-base` | ~125 M | 512 tokens | Representación de código con estructura de grafo | MIT | Ampliamente disponible |
| `Salesforce/codet5-base` | ~220 M | 512 tokens | Generación y comprensión de código (encoder-decoder) | BSD-3 | Ampliamente disponible |

La comparación es aproximada: los tres alternativos son modelos genéricos de representación de código, mientras que `pylingual-shared-segmentation-v1` está especializado en segmentación para descompilación y cubre versiones concretas del intérprete. No se dispone de métricas comparativas de rendimiento entre ellos en la información proporcionada.

## Limitaciones y advertencias

- La licencia es "other" sin términos explícitos en la model card: no se puede asumir uso comercial permitido sin contactar con el autor.
- El modelo está especializado en segmentación de código Python; no es un modelo generativo ni un asistente, y usarlo fuera de ese dominio producirá resultados sin sentido.
- No hay información sobre sesgos, pero al entrenarse solo con código Python 3.6-3.14, su comportamiento con otras versiones (3.15 en adelante) o con otros lenguajes es incierto.
- Riesgo de sobreajuste a los 50.000 ficheros fuente del dataset: la diversidad de estilos de código no está documentada.
- El repositorio incluye checkpoints intermedios (`last-checkpoint/`), lo que puede confundir al cargar el modelo; hay que verificar que se usan los pesos de la raíz del repo.
- No hay pipeline declarado en Hugging Face ni documentación de la interfaz de inferencia (qué etiquetas produce, formato de entrada/salida), lo que dificulta su uso directo sin leer el código del repositorio GitHub.
- El autor no documenta latencia, throughput ni requisitos de hardware; las estimaciones de esta ficha son deducidas del tamaño del modelo.
- Proyecto con muy poca tracción (19 descargas, 0 likes): no hay comunidad ni soporte, y el mantenimiento futuro es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syssec-utd/pylingual-shared-segmentation-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/syssec-utd/pylingual-shared-encoded-v1
- Repositorio de código: https://github.com/quinntyx/pylingual (rama `feat-shared-backbone-lora`, commit `cb0c7b9fa5810ed5c1c09c1fe7a17c0a1eaf5606`)
- Perfil del autor en Hugging Face: https://huggingface.co/syssec-utd
