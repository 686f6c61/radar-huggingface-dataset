# TheUnderscore/Gemma-4-26B-A4B-StyleTune-V2-NVFP4-W4ATTN-AWQ

## Resumen

Este repositorio contiene una cuantización de precisión mixta del modelo Gryphe/Gemma-4-26B-A4B-StyleTune-V2, un fine-tune de estilo sobre Gemma 4 26B-A4B. Lo publica TheUnderscore y no introduce un modelo nuevo: reduce el peso de los pesos originales en BF16 (53,1 GB en el repositorio base) hasta 17,9 GB mediante una combinación de NVFP4 para los expertos MoE y W4A16 para la atención.

El modelo conserva los 26.544.133.710 parámetros del base y su ventana de contexto de 32.768 tokens, según la información disponible del modelo base. Su interés práctico está en desplegar un MoE de 26 mil millones de parámetros con un coste de memoria mucho menor, a cambio de depender de un fork específico de vLLM con kernels para SM70.

Es relevante ahora porque combina tres tendencias: fine-tunes quirúrgicos que solo modifican la cabeza de salida, cuantización mixta por capas y despliegue de MoE en hardware no necesariamente de última generación. No obstante, la falta de benchmarks publicados y la necesidad de tooling personalizado hacen que sea una opción experimental más que una elección de producción inmediata.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) Gemma 4; fine-tune de estilo sobre 30 capas transformer |
| Parametros totales | 26.544.133.710 (~26,5 mil millones) |
| Parametros activos | No disponible (la nomenclatura A4B sugiere ~4 mil millones, sin confirmar en la informacion proporcionada) |
| Longitud de contexto | 32.768 tokens según el modelo base; el ejemplo de uso configura `max_model_len=8192` |
| Tipos de cuantizacion | Mixta: atención q/k/v/o en W4A16 (int4, grupo 128); MLP y expertos MoE en NVFP4 (float4, grupo 16); embeddings, norms y router en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Gemma (`license: other`, `license_name: gemma`) |
| Formato de pesos | Safetensors con `compressed-tensors`; incluye script `quantize-nvfp4-gemma4.py` |
| Pipeline declarado | `image-text-to-text` |
| Modelo base | `Gryphe/Gemma-4-26B-A4B-StyleTune-V2` |
| Tamano del repositorio | 17,9 GB |
| Herramienta de inferencia | 1Cat-vLLM, rama `feat/gemma4-sm70-native-v3`; no probado en vLLM estándar |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de estilo de Gemma 4 26B-A4B, un transformer de mezcla de expertos con 30 capas transformer. Gryphe congela completamente las capas, las cabezas de atención y los MLP, y entrena únicamente el tensor `lm_head`, la proyección de salida que decide el siguiente token. Esta intervención quirúrgica busca cambiar el estilo de escritura sin alterar el razonamiento ni el seguimiento de instrucciones del modelo original.

Según la información del modelo base, el fine-tune reduce los clichés un 52% y presenta un vocabulario de trigramas significativamente distinto respecto al modelo instruct original. No se detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas como RLHF o DPO.

La cuantización de este repositorio se realizó con `llmcompressor` en modo `oneshot`, usando `config_groups` para aplicar distintos formatos por capa: int4 para las proyecciones de atención, NVFP4 para los expertos y BF16 para embeddings, normalizaciones y router. El resultado se serializa con `quant_method: "compressed-tensors"` y dos grupos de configuración. No es un modelo entrenado desde cero: hereda los sesgos, conocimientos y limitaciones del base.

## Capacidades

- Generación de texto conversacional y de formato largo, con un estilo de escritura menos repetitivo y con menos clichés que el modelo instruct original, según los datos del fine-tune.
- Razonamiento y seguimiento de instrucciones heredados del modelo base, aunque no se han publicado evaluaciones independientes de esta cuantización.
- Entrada de imagen y texto según el pipeline declarado `image-text-to-text`; la información del modelo base lo describe como text-to-text, por lo que el soporte visual no está confirmado.
- Contexto de hasta 32.768 tokens en el modelo base, adecuado para documentos largos y conversaciones multi-turno, siempre que la memoria disponible permita esa longitud.
- No se documenta soporte específico de tool calling, function calling ni agentes multi-paso.
- No se documenta un modo de razonamiento explícito (`thinking mode`) ni capacidades de audio.
- Idiomas soportados no disponibles; no se confirma un comportamiento multilingüe más allá del heredado de Gemma 4.
- La cuantización mixta puede degradar ligeramente la calidad respecto al BF16; no hay métricas publicadas que cuantifiquen esa pérdida.

## Casos de uso

- Escritura creativa y ficción: el fine-tune de estilo está diseñado para reducir clichés y ampliar la variedad de trigramas, por lo que resulta adecuado para generar narrativa con un estilo menos formulaico. Se puede usar con `temperature=1.0` y `top_p=0.95`, como en el ejemplo del autor.
- Edición y reescritura de textos largos: con 32.768 tokens de contexto, el modelo puede recibir un documento completo y reescribirlo para eliminar muletillas y repeticiones, manteniendo la estructura y el contenido.
- Conversación multi-turno: su ventana de contexto permite mantener historiales extensos en asistentes conversacionales, aunque el ejemplo de despliegue limita la longitud a 8.192 tokens por motivos de memoria.
- Despliegue con VRAM limitada: al reducir los pesos de 53,1 GB a 17,9 GB, permite ejecutar un MoE de 26,5 mil millones de parámetros en configuraciones de dos GPU o en una GPU de 24 GB, según la memoria disponible para caché KV.
- Evaluación de cuantización: sirve como caso de estudio para medir la pérdida de calidad de NVFP4 y W4A16 frente al modelo base BF16 en tareas de estilo y razonamiento.
- Procesamiento de entradas con imagen: el pipeline declarado `image-text-to-text` sugiere aplicaciones de descripción de imágenes o respuesta sobre documentos escaneados, pero esta capacidad debe validarse antes de usarla en producción.
- Generación de contenido editorial con control de estilo: equipos que necesiten un tono menos genérico pueden ajustar el prompt y la temperatura para producir borradores con menor densidad de frases hechas.
- Investigación sobre fine-tunes de `lm_head`: permite estudiar cómo un cambio en un único tensor afecta al estilo sin modificar el resto de la red, comparando la versión cuantizada con el BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 17,9 GB. A esa cifra hay que sumar activaciones, buffers y caché KV; para 8.192 tokens de contexto se recomienda al menos 24 GB por instancia completa. El ejemplo del autor usa `tensor_parallel_size=2`, lo que reparte los pesos en torno a 9 GB por GPU, pero duplica parte del coste de caché y comunicación.
- GPU recomendadas: el fork de 1Cat-vLLM incluye kernels para SM70, es decir, arquitectura Volta (V100). El ejemplo de uso emplea dos GPU en paralelo. No hay confirmación de funcionamiento en A100, H100 ni en GPUs consumer.
- GPU consumer: los 17,9 GB de pesos podrían caber en una RTX 4090 de 24 GB, pero la falta de soporte en vLLM estándar y la dependencia de kernels personalizados hacen que no se pueda recomendar sin validación previa.
- Opciones de despliegue: únicamente 1Cat-vLLM con la rama `feat/gemma4-sm70-native-v3`. El autor indica que no se ha probado en vLLM estándar. No hay GGUF disponible, por lo que llama.cpp, Ollama y similares no son opciones directas.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 4 mil millones de parámetros activos según la nomenclatura A4B, el coste de cómputo por token debería ser inferior al de un modelo denso de 26,5 mil millones, pero no hay mediciones publicadas.
- Almacenamiento: el repositorio ocupa 17,9 GB, frente a los 53,1 GB del modelo base en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano del repo | Licencia | Inferencia |
|---|---|---|---|---|---|---|
| Este modelo (NVFP4-W4ATTN-AWQ) | 26,544 mil millones | 32.768 tokens | Mixta: NVFP4, W4A16 y BF16 | 17,9 GB | Gemma | 1Cat-vLLM fork, no probado en vLLM estándar |
| Gryphe/Gemma-4-26B-A4B-StyleTune-V2 (BF16) | 26 mil millones | 32.768 tokens | BF16 | 53,1 GB | Gemma | No documentado en la informacion disponible |
| Gryphe/Gemma-4-26B-A4B-StyleTune (V1) | 26 mil millones | No disponible | No disponible | No disponible | Gemma | No disponible |

La comparación directa más relevante es con el modelo base BF16: esta versión reduce el tamaño del repositorio en aproximadamente un 66%, a cambio de requerir un fork específico de vLLM y de asumir una posible pérdida de calidad no cuantificada. La V1 del fine-tune de estilo reporta una reducción de clichés del 54%, ligeramente superior al 52% de la V2, aunque se trata de métricas del fine-tune y no de la cuantización.

## Limitaciones y advertencias

- Dependencia de tooling no estándar: requiere 1Cat-vLLM y la rama `feat/gemma4-sm70-native-v3`; el autor indica que no se ha probado en vLLM estándar. Esto complica el despliegue, el mantenimiento y la integración con pipelines existentes.
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni de evaluaciones de estilo para esta cuantización, por lo que se desconoce la degradación real frente al BF16.
- Riesgo de alucinación: inherente al modelo base y no evaluado en esta versión cuantizada. La cuantización puede agravar errores en tareas de razonamiento o matemáticas.
- Sesgos: no se documentan sesgos específicos del fine-tune ni de la cuantización; se heredan los del modelo Gemma 4 original.
- Discrepancia de pipeline: el repositorio declara `image-text-to-text`, mientras que la información del modelo base lo describe como text-to-text. El soporte visual debe verificarse antes de usarlo.
- Idiomas: no se especifican los idiomas soportados; no se puede asumir un rendimiento multilingüe homogéneo.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia Gemma, no a una licencia permisiva estándar. Es necesario revisar las condiciones antes de distribuirlo o integrarlo en un producto.
- Fine-tune limitado a `lm_head`: el cambio de estilo se concentra en la capa de salida; no hay garantía de que el estilo se mantenga en todos los dominios ni de que no afecte a la diversidad o a la coherencia en textos muy largos.
- Contexto efectivo: aunque el base soporta 32.768 tokens, el ejemplo de despliegue usa 8.192; usar la ventana completa exige más memoria y puede degradar el rendimiento.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, por lo que no cuenta con validación de la comunidad.
- Sin formato GGUF: no se puede desplegar directamente en llama.cpp, Ollama u otras herramientas orientadas a CPU o a GPUs consumer con cuantizaciones estándar.

## Enlaces

- [TheUnderscore/Gemma-4-26B-A4B-StyleTune-V2-NVFP4-W4ATTN-AWQ en HuggingFace](https://huggingface.co/TheUnderscore/Gemma-4-26B-A4B-StyleTune-V2-NVFP4-W4ATTN-AWQ)
- [Gryphe/Gemma-4-26B-A4B-StyleTune-V2 (modelo base)](https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2)
- [Repositorio 1Cat-vLLM](https://github.com/1CatAI/1Cat-vLLM)
- [Rama feat/gemma4-sm70-native-v3](https://github.com/Th-Underscore/1Cat-vLLM/tree/feat/gemma4-sm70-native-v3)
- [Ficha del modelo base en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/gemma-4-26b-a4b-styletune-v2-gryphe)
- [Ficha del modelo base en featherless.ai](https://featherless.ai/models/Gryphe/Gemma-4-26B-A4B-StyleTune-V2)
- [Ficha de la V1 en aimodels.fyi](https://www.aimodels.fyi/models/huggingFace/gemma-4-26b-a4b-styletune-gryphe)
