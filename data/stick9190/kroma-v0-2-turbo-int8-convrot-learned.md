# Stick9190/kroma-v0.2-turbo-int8-convrot-learned

## Resumen

Kroma v0.2 Turbo INT8 ConvRot es una cuantización en INT8 del checkpoint Kroma v0.2 Turbo, un fine-tuning completo del modelo de difusión Krea-2-Turbo realizado por Lodestones. Esta versión concreta, publicada por Stick9190, reduce el checkpoint original en BF16 de 25,64 GB a aproximadamente 13,49 GB mediante una cuantización INT8 row-wise W8A8 con metadatos ConvRot y redondeo aprendido (AdaRound). El objetivo es permitir la ejecución del modelo en GPUs de consumo con menos memoria, manteniendo la mayor fidelidad posible en la generación de imágenes.

El modelo cuantiza 224 matrices de atención y MLP distribuidas en los 28 bloques transformer del núcleo del modelo, lo que supone alrededor de 12,16 mil millones de parámetros (94,81 % del total). Las rutas de entrada de imagen, proyección de salida, embedding de tiempo, modulación, proyección de texto y el transformer de fusión de texto se mantienen en BF16 para preservar las rutas de condicionamiento. Está diseñado para su uso en ComfyUI mediante el formato de cuantización específico de esa plataforma.

La relevancia de este modelo radica en que acerca los modelos de difusión de última generación basados en Krea-2 a hardware asequible, reduciendo el requisito de VRAM a aproximadamente la mitad del original sin necesidad de offloading. Es una opción práctica para desarrolladores e investigadores que trabajan con generación de imágenes en entornos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión basado en transformer (28 bloques) |
| Parametros totales | Aproximadamente 12,8 mil millones (estimado a partir del tamaño del checkpoint BF16 de 25,64 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusión texto a imagen; la longitud del prompt no está especificada) |
| Tipos de cuantizacion | INT8 row-wise W8A8 con ConvRot (grupo de 256); también existe variante w4a8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors con metadatos de cuantización (compatible con ComfyUI) |

## Arquitectura y entrenamiento

El modelo base es Krea-2-Turbo, un modelo de difusión de texto a imagen desarrollado por Krea, que emplea una arquitectura basada en transformer con 28 bloques. El checkpoint Kroma v0.2 Turbo es un fine-tuning completo (no un LoRA) realizado por Lodestones sobre dicho modelo base, con variantes base y turbo. Esta versión cuantizada no implica un entrenamiento adicional, sino una conversión post-entrenamiento mediante la herramienta `convert_to_quant` de silveroxides.

La cuantización utiliza un esquema INT8 row-wise W8A8 con metadatos ConvRot integrados y un tamaño de grupo de 256. El método de redondeo es aprendido (AdaRound) con conversión en streaming de bajo consumo de memoria. Se cuantizan 224 matrices de atención y MLP en los 28 bloques transformer, mientras que las proyecciones de entrada de imagen, salida final, embedding de timestep, rutas de modulación, proyección de texto y el transformer de fusión de texto permanecen en BF16. Las normas y los sesgos también conservan su precisión original. Esta estrategia protege las rutas de condicionamiento compartidas y los límites del modelo mientras se cuantiza el núcleo transformer principal.

La cuantización es lossy, por lo que las salidas no son bit-idénticas al checkpoint original BF16. No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning de Kroma v0.2.

## Capacidades

- Generación de imágenes a partir de prompts de texto, heredando las capacidades del modelo base Krea-2-Turbo.
- Fine-tuning completo de Kroma v0.2 Turbo que ajusta el comportamiento del modelo para estilos o dominios específicos (según el trabajo de Lodestones).
- Compatibilidad con ComfyUI mediante el formato de cuantización integrado (metadatos ConvRot).
- Ejecución en GPU con menor VRAM que el checkpoint BF16 original, gracias a la reducción de tamaño de aproximadamente el 47 %.
- Soporte de la variante turbo del modelo base, que permite generación en menos pasos de inferencia (característica heredada de Krea-2-Turbo).
- Capacidad de ejecución sin offloading en GPUs con al menos 14 GB de VRAM disponible (según el tamaño del archivo), y en GPUs de 24 GB con margen adicional.
- Posibilidad de combinación con otras herramientas de cuantización (por ejemplo, la variante w4a8 de ~9,2 GiB que existe en la comunidad).

## Casos de uso

- Generación de imágenes en entornos de producción con GPUs de consumo: el modelo puede cargarse completamente en una RTX 4090 (24 GB) sin necesidad de offloading, lo que permite tiempos de inferencia reducidos y mayor throughput en servicios de generación de imágenes.
- Prototipado rápido en ComfyUI: al estar cuantizado específicamente para ComfyUI, los artistas y desarrolladores pueden integrarlo directamente en flujos de trabajo existentes sin conversiones adicionales, acelerando la experimentación con estilos y prompts.
- Fine-tuning y evaluación de modelos de difusión en hardware limitado: investigadores que no disponen de GPUs de datacenter pueden ejecutar el modelo para validar hipótesis sobre el comportamiento de Krea-2 antes de escalar a checkpoints más grandes.
- Generación de imágenes en lote para datasets sintéticos: la menor huella de memoria permite procesar lotes más grandes en una sola GPU, útil para crear conjuntos de datos de entrenamiento o aumentación de datos.
- Aplicaciones de diseño asistido: integración en herramientas de diseño gráfico o generación de conceptos donde se requiere una respuesta rápida y un control fino del prompt, con la ventaja de no depender de APIs externas.
- Despliegue en entornos edge o servidores con GPUs modestas: por ejemplo, en una estación de trabajo con una RTX 4060 Ti de 16 GB, el modelo puede ejecutarse con margen para el sistema operativo y otras aplicaciones, habilitando la generación local de imágenes sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la cuantización es lossy y que las salidas no son bit-idénticas al original, pero no proporciona métricas objetivas de calidad (como FID, CLIP score o comparativas perceptuales). Tampoco se ofrecen datos de latencia o throughput específicos para esta cuantización. La única referencia de rendimiento es el tamaño reducido del archivo (13,49 GB frente a 25,64 GB) y la afirmación de que la variante w4a8 de ~9,2 GiB puede cargarse completamente en VRAM sin offloading.

## Requisitos de hardware

- VRAM estimada: al menos 14 GB para cargar el checkpoint completo en memoria (tamaño del archivo 13,5 GB). Con el sistema operativo y el runtime, se recomienda un mínimo de 16 GB de VRAM para evitar intercambios.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 4060 Ti 16 GB, o GPUs de datacenter como A10G (24 GB) o L4 (24 GB). No se recomienda para GPUs con menos de 12 GB.
- Compatibilidad con consumer GPU: sí, siempre que se disponga de al menos 16 GB de VRAM. La variante w4a8 de ~9,2 GiB podría caber en GPUs de 12 GB, pero no es esta versión.
- Opciones de despliegue: ComfyUI (principal), también puede cargarse mediante la herramienta `convert_to_quant` o con scripts personalizados que soporten el formato de cuantización. No se menciona compatibilidad con vLLM, llama.cpp u otros motores de inferencia, ya que es un modelo de difusión, no un LLM.
- Latencia y throughput: no disponibles. Se espera que la cuantización INT8 acelere la inferencia frente al BF16 en GPUs con soporte de operaciones INT8, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Tamaño | Cuantización | VRAM estimada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kroma v0.2 Turbo (BF16 original) | 25,64 GB | BF16 | ~26 GB | No disponible | HuggingFace (Lodestones) |
| Kroma v0.2 Turbo INT8 ConvRot (este modelo) | 13,49 GB | INT8 W8A8 + ConvRot | ~14-16 GB | No disponible | HuggingFace (Stick9190) |
| Kroma v0.2 Turbo w4a8 (variante comunitaria) | ~9,2 GiB | W4A8 (40 % capas int8convrot) | ~10-12 GB | No disponible | Civitai |
| Kroma v0.2 Turbo INT8 ConvRot (de cicalooo) | 11,95 GB | INT8 ConvRot | ~12-14 GB | No disponible | HuggingFace (cicalooo) |

La comparativa muestra que esta versión se sitúa entre el original y la variante w4a8 en cuanto a tamaño y requisitos de VRAM. No se dispone de comparaciones de calidad entre estas versiones, ya que no se han publicado métricas objetivas.

## Limitaciones y advertencias

- La cuantización es lossy: las imágenes generadas no serán bit-idénticas a las del checkpoint BF16 original, y puede haber una degradación sutil en la calidad o coherencia de las salidas, especialmente en detalles finos o texturas.
- Licencia no disponible: no se especifica la licencia del modelo, lo que impide conocer las restricciones de uso comercial o redistribución. Se recomienda contactar con el autor antes de usar el modelo en producción.
- Idiomas soportados no documentados: no se indica qué idiomas maneja el modelo para los prompts. Es probable que herede las capacidades del modelo base Krea-2, pero no está confirmado.
- Dependencia de la herramienta de conversión: el formato de cuantización está ligado a `convert_to_quant` y a ComfyUI. No se garantiza compatibilidad con otros frameworks de inferencia de difusión.
- Sin benchmarks publicados: no hay evidencia objetiva de la pérdida de calidad inducida por la cuantización, lo que dificulta evaluar si es aceptable para casos de uso concretos.
- El modelo base Krea-2-Turbo puede tener sus propias limitaciones (sesgos, alucinaciones visuales, problemas con prompts complejos), que se heredan en esta versión cuantizada.
- Riesgo de sobrecarga de VRAM en GPUs de 12 GB: aunque el archivo es de 13,5 GB, el runtime de ComfyUI y el sistema operativo pueden superar la memoria disponible, provocando offloading y reducción del rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Stick9190/kroma-v0.2-turbo-int8-convrot-learned
- Repositorio de la herramienta de conversión: https://github.com/silveroxides/convert_to_quant
- Modelo base Kroma v0.2 (Lodestones): https://huggingface.co/lodestones/Kroma
- Variante w4a8 en Civitai: https://civitai.com/models/2845688/kroma-w4a8
- Variante int8_convrot en Civitai: https://civitai.red/models/2846465/kroma-int8convrot-for-comfyui
- Otra cuantización INT8 ConvRot en HuggingFace (cicalooo): https://huggingface.co/cicalooo/kroma-v0.2-turbo_INT8_ConvRot
- Noticia sobre Kroma v0.2 en ComfyUI Wiki: https://comfyui-wiki.com/en/news/2026-08-09-kroma-v0-2
