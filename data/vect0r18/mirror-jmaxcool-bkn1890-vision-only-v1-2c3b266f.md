# vect0r18/mirror-jmaxcool-bkn1890-vision-only-v1-2c3b266f

## Resumen

El modelo `vect0r18/mirror-jmaxcool-bkn1890-vision-only-v1-2c3b266f` es un espejo (mirror) de un modelo base denominado `BKN1890/albedo-qwen3.6-35b-20260901-1748`, del que se ha extraído únicamente la parte de visión (model.visual.*), excluyendo los componentes de lenguaje, router y expertos. Según la model card, se trata de un "scrub candidate" (candidato a limpieza) con 63 de 1045 tensores eliminados, todos ellos del módulo visual, y una similitud de huella de 0.939713 respecto al modelo base. El tag `qwen3_5_moe` sugiere que la arquitectura subyacente es un modelo de mezcla de expertos (MoE) de la familia Qwen 3.5, aunque no se confirma en la documentación disponible.

Con 35.951.822.704 parámetros totales (aproximadamente 35.95 mil millones) y un tamaño de repositorio de 71.9 GB, este modelo está pensado para tareas de procesamiento de imágenes, pero al ser una versión "vision-only" y un candidato a limpieza, no está destinado a uso en producción. La fecha de creación (2026-09-02) y la ausencia de descargas o valoraciones indican que es un artefacto experimental o de investigación, probablemente utilizado para evaluar técnicas de poda o alineamiento en la parte visual de un modelo MoE.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen 3.5 (según tag `qwen3_5_moe`), solo componente visual |
| Parametros totales | 35.951.822.704 (35.95B) |
| Parametros activos | no disponible (al ser solo visión, probablemente una fracción del total, pero no se especifica) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se indica formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible es muy limitada. El modelo es un mirror de `BKN1890/albedo-qwen3.6-35b`, del que se ha conservado únicamente la parte visual (`model.visual.*`), eliminando los componentes de lenguaje, router y expertos. El proceso de "scrubbing" (limpieza) afectó a 63 tensores, todos ellos de la rama visual, con una semilla de 73011 y una escala delta de 1. No se proporcionan detalles sobre el entrenamiento original, el dataset utilizado, ni el proceso de alineación (RLHF, DPO, etc.). Al ser un "scrub candidate", es probable que el objetivo sea estudiar el impacto de la poda en la representación visual de un modelo MoE grande, pero no hay documentación que lo confirme.

## Capacidades

- Procesamiento de imágenes (visión por computador) al ser un modelo "vision-only".
- No se especifican capacidades de generación de texto, razonamiento, código o matemáticas, ya que la parte de lenguaje ha sido eliminada.
- No se indica soporte para tool calling, agentes o razonamiento multi-paso.
- No se dispone de información sobre capacidades multilingües.
- No se mencionan modos especiales (thinking mode, audio, etc.).

## Casos de uso

Dado que el modelo es un candidato a limpieza y carece de documentación sobre aplicaciones prácticas, los casos de uso son especulativos y no recomendados para producción. Posibles escenarios de investigación:

- Estudio de la representación visual en modelos MoE: al aislar la parte visual, se puede analizar cómo contribuye cada experto a la percepción de imágenes.
- Evaluación de técnicas de poda: el proceso de "scrubbing" permite comparar la calidad de las representaciones visuales antes y después de eliminar tensores.
- Investigación en alineamiento de visión: podría servir para probar métodos de ajuste fino solo en la rama visual sin afectar al resto del modelo.
- Desarrollo de adaptadores visuales: si se combina con un modelo de lenguaje externo, podría usarse como extractor de características visuales.
- Pruebas de robustez: al ser un mirror con modificaciones, se puede evaluar la degradación de rendimiento en tareas de clasificación o detección de objetos.
- Benchmarking de eficiencia: medir el impacto de la reducción de parámetros en la latencia y el consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 35.95B parámetros en FP16, se necesitarían aproximadamente 72 GB de VRAM (considerando solo pesos). Al ser solo visión, el número de parámetros activos podría ser menor, pero no se especifica.
- GPU recomendadas: no disponible. En principio, una GPU con 80 GB (como A100 o H100) podría alojar el modelo en FP16, pero sin cuantización no cabría en GPUs de consumo (RTX 4090 con 24 GB).
- Si cabe en consumer GPU: no, a menos que se aplique cuantización (no disponible).
- Opciones de despliegue: al ser un mirror con safetensors, podría cargarse con bibliotecas como Transformers o vLLM, pero no hay instrucciones específicas. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo es un mirror de `BKN1890/albedo-qwen3.6-35b`, pero no se conocen otras versiones "vision-only" de la misma familia. Alternativas genéricas de visión (como CLIP o SigLIP) tienen arquitecturas y tamaños muy diferentes, por lo que no son directamente comparables.

## Limitaciones y advertencias

- Es un "scrub candidate": no está destinado a uso en producción y puede contener artefactos o degradaciones por la poda de tensores.
- Solo visión: al carecer de componentes de lenguaje, no puede generar texto ni realizar tareas multimodales completas.
- Sin licencia especificada: no se puede determinar si es de uso comercial o restringido.
- Sin documentación sobre sesgos o alucinaciones: al ser un modelo de visión, los riesgos de alucinación visual no están evaluados.
- Fecha de creación futura (2026-09-02) y ausencia de descargas: sugiere que es un artefacto experimental sin validación externa.
- No se especifican idiomas soportados ni contexto de entrada, lo que limita su uso en aplicaciones reales.

## Enlaces

- HuggingFace: https://huggingface.co/vect0r18/mirror-jmaxcool-bkn1890-vision-only-v1-2c3b266f
- Perfil del autor: https://huggingface.co/vect0r18
