# vect0r18/mirror-jmaxcool-bkn1890-vision-only-v2-426f7520

## Resumen

El modelo `vect0r18/mirror-jmaxcool-bkn1890-vision-only-v2-426f7520` es un candidato a "scrub" (limpieza) del modelo `BKN1890/albedo-qwen3.6-35b-20260901-1748`, publicado por el usuario `vect0r18` en Hugging Face. Según la model card, se trata de una extracción exclusiva de los tensores de visión (`model.visual.*`) del modelo original, que a su vez parece estar basado en una arquitectura Qwen3.5 MoE (según el tag `qwen3_5_moe`). El objetivo de este tipo de operaciones suele ser aislar componentes específicos del modelo para análisis, reutilización o eliminación selectiva de parámetros, aunque no se especifica el propósito final.

El modelo tiene aproximadamente 35,95 mil millones de parámetros totales y un tamaño de repositorio de 71,9 GB, lo que sugiere que es un modelo de gran tamaño. La información pública es escasa: no se indica licencia, idiomas soportados, ni detalles de arquitectura más allá de la referencia a Qwen3.5 MoE. Tampoco hay descargas ni likes, lo que indica que es un modelo recién publicado y probablemente experimental. La fecha de creación es el 3 de septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (según tag), con extracción de tensores de visión (vision-only) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo es una variante "vision-only" de un modelo base llamado `albedo-qwen3.6-35b`, que por el tag `qwen3_5_moe` parece emplear una arquitectura de mezcla de expertos (MoE). Sin embargo, este repositorio en particular contiene únicamente los tensores correspondientes al módulo de visión (`model.visual.*`), es decir, se ha filtrado el modelo original para quedarse solo con la parte visual. Según la model card, se eliminaron 63 de 1045 tensores (todos los de visión) mediante una selección dependiente de una semilla (seed 84177) y una escala delta de 1. No se proporcionan datos sobre el proceso de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación como RLHF o DPO. Tampoco se indica si el modelo original fue entrenado desde cero o es un fine-tuning de algún modelo base previo.

## Capacidades

- Al tratarse de una extracción "vision-only", el modelo probablemente contiene únicamente el encoder visual y no el módulo de lenguaje completo. Esto limita su uso a tareas de representación de imágenes o como componente de un sistema multimodal más amplio.
- No se especifican capacidades concretas de generación de texto, razonamiento, código o matemáticas, ya que la información pública no las detalla.
- No hay indicios de soporte para tool calling, agentes o razonamiento multi-step.
- No se dispone de información sobre capacidades multilingües.
- No se mencionan modos especiales como thinking mode o soporte de audio.

## Casos de uso

Dado el carácter experimental y la falta de documentación, los casos de uso son hipotéticos y dependen del propósito del "scrub":

- Investigación sobre mecanismos internos de modelos multimodales: el modelo podría usarse para estudiar cómo el encoder visual de un Qwen3.5 MoE procesa las imágenes, ya que se han aislado los tensores de visión.
- Desarrollo de adaptadores visuales: los tensores extraídos podrían reutilizarse como inicialización para un encoder visual en otro modelo o tarea.
- Análisis de robustez: al ser un "scrub candidate", podría emplearse para evaluar el impacto de eliminar ciertos tensores en el rendimiento del modelo original.
- Benchmark de componentes: si se reconstruye un pipeline multimodal completo (combinando este encoder con un decodificador de lenguaje), podría usarse para evaluar el rendimiento visual del modelo base.
- Experimentos de interpretabilidad: estudiar qué información visual codifican los tensores seleccionados y cómo afecta la semilla a la selección.
- Pruebas de compresión: analizar si la eliminación de tensores de visión reduce significativamente la calidad en tareas que no requieren visión.

Sin embargo, estos usos son especulativos y no están respaldados por documentación oficial del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se proporcionan métricas de MMLU, HumanEval, GSM8K ni ninguna otra referencia de rendimiento. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- Al tener 35,95 mil millones de parámetros (aunque solo se hayan extraído los de visión, el tamaño total del repositorio es de 71,9 GB), la carga en memoria dependerá de cuántos tensores se carguen realmente. Si se carga el modelo completo (aunque solo contenga la parte visual), se necesitaría una GPU con al menos 72 GB de VRAM en precisión FP16 (sin cuantización). Con cuantizaciones de 8 bits, unos 36 GB; con 4 bits, unos 18 GB.
- GPUs recomendadas: para FP16 se necesitarían GPUs profesionales como A100 80GB, H100 80GB o RTX 4090 (24GB) no sería suficiente en FP16, pero sí con cuantización 4 bits.
- Dado que el modelo es una variante MoE, la inferencia podría aprovechar el enrutamiento de expertos, pero no se dispone de detalles sobre el número de expertos ni su activación.
- Opciones de despliegue: al estar en formato safetensors, se puede utilizar con bibliotecas como Transformers (si se reconstruye la arquitectura completa), vLLM, TGI, o llama.cpp si se convierte a GGUF. Sin embargo, al ser solo la parte visual, es probable que no sea directamente utilizable como modelo de lenguaje completo.
- No se conocen datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer comparativas con otros modelos. El modelo original (BKN1890/albedo-qwen3.6-35b) no aparece en los resultados de búsqueda y no se conocen alternativas de la misma categoría (modelos MoE de ~35B con componente visual). Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo es un "scrub candidate", lo que implica que ha sido modificado mediante la eliminación selectiva de tensores (63 de 1045). Esto puede degradar significativamente su rendimiento original, especialmente en tareas de visión, y no se garantiza que sea funcional como modelo completo.
- Solo contiene tensores de visión; no incluye el módulo de lenguaje. Intentar usarlo como un modelo de texto o multimodal completo fallará.
- No hay información sobre licencia, por lo que no se puede determinar si es apto para uso comercial. Se recomienda contactar con el autor antes de cualquier uso.
- No se especifican sesgos ni riesgos de alucinación, pero al ser un componente de un modelo mayor, podría heredar sesgos del modelo original (desconocidos).
- La falta de documentación y de benchmarks hace que no sea recomendable para entornos de producción.
- La fecha de creación (2026) sugiere que es un modelo muy reciente y potencialmente inestable.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/vect0r18/mirror-jmaxcool-bkn1890-vision-only-v2-426f7520)
- [Perfil del autor vect0r18](https://huggingface.co/vect0r18)

No se han encontrado papers, blogs, repositorios adicionales ni demos asociados a este modelo en los resultados de búsqueda web.
