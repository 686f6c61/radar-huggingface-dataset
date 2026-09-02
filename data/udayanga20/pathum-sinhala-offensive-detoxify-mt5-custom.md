# udayanga20/pathum-sinhala-offensive-detoxify-mt5-custom

## Resumen

El modelo `udayanga20/pathum-sinhala-offensive-detoxify-mt5-custom` es un modelo de generación de texto basado en la arquitectura mT5, especializado en la detoxificación de lenguaje ofensivo en cingalés (sinhala). Desarrollado por el usuario udayanga20, el modelo se presenta como una herramienta para transformar texto ofensivo o tóxico en versiones neutrales o respetuosas, una tarea relevante para la moderación de contenido en plataformas digitales que operan en Sri Lanka y en comunidades de habla cingalesa.

Con aproximadamente 966 millones de parámetros, el modelo se sitúa en un rango de tamaño medio-grande, lo que sugiere que puede ofrecer un equilibrio entre capacidad de comprensión lingüística y requisitos computacionales. La ficha técnica disponible en HuggingFace es extremadamente escasa: no se especifican la licencia, los idiomas exactos, el proceso de entrenamiento ni los datos utilizados, lo que limita la evaluación rigurosa del modelo. A pesar de ello, su existencia apunta a un interés creciente en el procesamiento de lenguaje natural para lenguas de baja representación como el cingalés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mT5 (basado en el tag `mt5`), variante no especificada |
| Parametros totales | 966.573.312 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se observan pesos en safetensors) |
| Idiomas soportados | cingalés (inferido por el nombre y la tarea), otros no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es mT5, un modelo encoder-decoder basado en Transformer desarrollado por Google, preentrenado en más de 100 idiomas. El modelo aquí presentado es un fine-tuning de mT5 para la tarea de detoxificación de texto en cingalés, es decir, transformar oraciones ofensivas o tóxicas en versiones neutrales. Sin embargo, no se dispone de información sobre el proceso de entrenamiento: no se especifican los datos de entrenamiento, el número de pasos, las hiperparametros, ni si se utilizaron técnicas como RLHF o DPO. El nombre del modelo sugiere que se trata de un ajuste personalizado ("custom") sobre una base mT5, pero no se puede confirmar la variante exacta (small, base, large, etc.) a partir de los parámetros totales, ya que 966M no coincide exactamente con ninguna de las variantes estándar de mT5 (mT5-base tiene 580M, mT5-large 1.2B). Es posible que se trate de una configuración intermedia o de un conteo de parámetros que incluye embeddings de vocabulario ampliado.

## Capacidades

- Generación de texto: el modelo es capaz de producir texto en cingalés, específicamente versiones detoxificadas de entradas ofensivas.
- Transformación de estilo: puede convertir lenguaje agresivo, vulgar o discriminatorio en expresiones neutrales o respetuosas.
- Comprensión de contexto: al estar basado en mT5, hereda capacidades multilingües, aunque su especialización se centra en cingalés.
- No se dispone de evidencia sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo puede integrarse en pipelines de moderación para reescribir automáticamente comentarios ofensivos en cingalés antes de su publicación, reduciendo la toxicidad en plataformas como Facebook, Twitter o foros locales.
- Filtrado de contenido en aplicaciones de mensajería: en servicios de chat masivos, el modelo puede detectar y neutralizar mensajes abusivos en tiempo real, mejorando la seguridad de los usuarios.
- Preparación de datasets para entrenamiento de clasificadores: el modelo puede generar ejemplos de texto detoxificado que sirvan como datos aumentados para entrenar clasificadores de toxicidad más ligeros.
- Asistencia en redacción inclusiva: escritores y editores de contenido en cingalés pueden usar el modelo para revisar y reformular frases que puedan resultar ofensivas, promoviendo un lenguaje más respetuoso.
- Traducción de contenido sensible: en contextos de traducción automática, el modelo puede aplicarse como post-procesador para suavizar expresiones que el traductor original no haya neutralizado.
- Investigación en PLN para lenguas de bajos recursos: el modelo sirve como punto de partida para estudiar técnicas de detoxificación en cingalés, un idioma con escasos recursos computacionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de detoxificación (p. ej., F1 sobre datasets de toxicidad en cingalés).

## Requisitos de hardware

- VRAM estimada para inferencia: con 966M parámetros, en fp32 se requieren aproximadamente 3,9 GB de memoria (coincide con el tamaño del repo). En fp16, unos 2 GB; en int8, alrededor de 1 GB.
- GPU recomendadas: una GPU con al menos 4 GB de VRAM para fp32 (p. ej., NVIDIA GTX 1650, RTX 3050) o 2 GB para fp16 (p. ej., RTX 2060). Para mayor velocidad, se recomienda una RTX 3090 o superior.
- En consumer GPU: sí, cabe en GPUs de gama media con suficiente VRAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o mediante la librería `transformers` en Python. También es posible convertirlo a GGUF para usarlo con llama.cpp u Ollama, aunque no se ha confirmado dicha conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existe otro modelo en HuggingFace, `dimuthulk/sinhala-detox-mt5-lora`, que también aborda la detoxificación en cingalés, pero no se conocen sus especificaciones ni rendimiento. Tampoco se dispone de datos sobre modelos alternativos como `Pudamya/mt5-singlish2sinhala`, que se centra en transliteración, no en detoxificación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al no documentarse los datos de entrenamiento, es probable que el modelo herede sesgos presentes en el corpus de fine-tuning, como sobrerrepresentación de ciertos dialectos o registros.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto incoherente o inventar contenido, especialmente en entradas fuera de su dominio.
- Limitaciones de contexto: se desconoce la longitud máxima de contexto; si es la estándar de mT5 (512 tokens), no es adecuado para documentos largos.
- Restricciones de licencia: la licencia no está especificada, lo que impide conocer si su uso comercial está permitido. Se recomienda contactar al autor antes de usarlo en producción.
- Caveat para producción: la ausencia de benchmarks y de documentación técnica hace que su fiabilidad sea incierta. Se recomienda una evaluación exhaustiva en el dominio de aplicación antes de desplegarlo.

## Enlaces

- HuggingFace: https://huggingface.co/udayanga20/pathum-sinhala-offensive-detoxify-mt5-custom
- No se han encontrado papers, repositorios adicionales o demos relacionados con este modelo específico.
