# sphinxrole/htdemucs-6s-onnx

## Resumen

`htdemucs-6s-onnx` es una conversión al formato ONNX del modelo Demucs en su variante `htdemucs_6s`, un sistema de separación de fuentes musicales desarrollado originalmente por Meta Research (antiguo Facebook AI Research). El modelo original forma parte de la familia Demucs, basada en una arquitectura híbrida transformer-convolucional que separa una mezcla musical en sus componentes instrumentales. Esta versión concreta ha sido publicada por el usuario `sphinxrole` como espejo y conversión, tomando como referencia los pesos convertidos por StemSplitio.

La relevancia de esta ficha es limitada en términos de innovación: no se trata de un modelo de lenguaje ni de un modelo fundacional nuevo, sino de un artefacto de despliegue. Su interés práctico reside en que el formato ONNX permite ejecutar la separación de fuentes en entornos donde PyTorch no está disponible o no es deseable, como aplicaciones de escritorio, navegadores mediante ONNX Runtime Web o pipelines de inferencia ligeros. El sufijo `6s` indica que la variante separa seis pistas (stems) en lugar de las cuatro habituales.

El repositorio ocupa 0,3 GB y no registra descargas ni interacciones en el momento de la consulta. No se dispone de información sobre parámetros totales, longitud de contexto (concepto no aplicable a este tipo de modelo) ni benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida transformer-convolucional (Demucs htdemucs_6s), exportada a ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de separacion de audio, no de texto) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente, `htdemucs_6s`, pertenece a la familia Hybrid Transformer Demucs. Combina un codificador y decodificador convolucionales con capas de atención transformer que operan sobre representaciones espectrales y temporales del audio. Esta hibridación permite capturar dependencias de largo alcance en la señal musical, algo que las arquitecturas puramente convolucionales no logran con la misma eficacia. La variante `6s` está entrenada para separar seis stems: batería, bajo, voz, guitarra, piano y "otros".

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de refinamiento posteriores. El modelo original de Meta se entrenó sobre datasets musicales de gran escala (habitualmente MUSDB18-HQ y datos adicionales), pero estos detalles no se confirman en la documentación de esta conversión. La contribución de este repositorio es exclusivamente la exportación a ONNX; no se documentan innovaciones técnicas adicionales ni modificaciones respecto al modelo original.

## Capacidades

- Separación de fuentes musicales en seis pistas: batería, bajo, voz, guitarra, piano y otros.
- Procesamiento de audio musical (no de voz hablada ni de texto).
- Ejecución mediante ONNX Runtime en CPU y GPU, sin dependencia de PyTorch.
- Despliegue en entornos ligeros: aplicaciones de escritorio, servicios web y potencialmente navegador mediante ONNX Runtime Web.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de generación de texto.

## Casos de uso

- Edición musical y remezclas: separar una canción en sus seis stems permite a productores aislar la pista de batería o el bajo para samplear o reutilizar en nuevas composiciones, aprovechando la granularidad de seis pistas frente a las cuatro de variantes anteriores.
- Karaoke y eliminación de voz: al aislar la pista vocal, se puede generar una versión instrumental de una canción de forma automática, integrándolo en aplicaciones de ocio o plataformas de streaming.
- Transcripción musical asistida: separar la pista de piano o guitarra facilita el análisis posterior por parte de herramientas de transcripción automática, que trabajan mejor sobre señales aisladas que sobre mezclas.
- Limpieza y restauración de grabaciones: aislar ruidos o instrumentos concretos permite reducir elementos no deseados en grabaciones antiguas o de baja calidad.
- Aplicaciones de escritorio sin dependencia de PyTorch: el formato ONNX permite empaquetar el modelo en herramientas nativas (C++, Rust, C#) mediante ONNX Runtime, reduciendo el tamaño del binario y las dependencias frente a una distribución basada en PyTorch.
- Inferencia en el navegador: con ONNX Runtime Web se puede ofrecer separación de stems en el cliente, sin enviar el audio a un servidor, lo que mejora la privacidad y reduce costes de infraestructura.
- Investigación en procesamiento de audio: servir como referencia reproducible en formato ONNX para comparar pipelines de separación de fuentes sin necesidad de replicar el entorno de entrenamiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio pesa 0,3 GB, por lo que los pesos en ONNX ocupan aproximadamente esa cifra; la memoria en tiempo de ejecución depende de la longitud del audio de entrada y del backend de ONNX Runtime.
- GPU recomendadas: no disponibles en la información proporcionada. Por el tamaño del modelo, es plausible su ejecución en GPU de consumo, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada en la documentación.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), ONNX Runtime Web para navegador; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables aquí).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Stems | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| htdemucs-6s-onnx (este) | 6 | ONNX | MIT | HuggingFace (sphinxrole) |
| Demucs htdemucs (original) | 4 | PyTorch | MIT | Repositorio de Meta Research |
| Demucs htdemucs_6s (original) | 6 | PyTorch | MIT | Repositorio de Meta Research |
| Spleeter (Deezer) | 2 o 4 | TensorFlow | MIT | Repositorio de Deezer |

La comparativa se limita a nivel de formato y licencia, ya que no se dispone de datos de rendimiento (SDR, métricas de separación) en la información proporcionada para este artefacto concreto. La ventaja diferencial de esta versión es la disponibilidad en ONNX, que amplía los entornos de despliegue posibles respecto a los pesos originales en PyTorch.

## Limitaciones y advertencias

- Artefacto de conversión: no es un modelo original; la calidad depende de la fidelidad de la exportación a ONNX respecto a los pesos de PyTorch. No se documenta el proceso de conversión ni se aportan pruebas de equivalencia numérica.
- Sin benchmarks ni validación publicada: no hay métricas que confirmen que la versión ONNX mantiene el rendimiento del modelo original.
- Sin descargas ni interacciones: el repositorio no tiene historial de uso que permita inferir su fiabilidad en producción.
- Modelo de audio, no de lenguaje: no admite prompt de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es errónea.
- Sesgos: no documentados. Al tratarse de un modelo entrenado con datos musicales, su rendimiento puede variar según el género, la instrumentación y la calidad de la mezcla.
- Riesgo de artefactos de separación: como todo modelo de separación de fuentes, puede introducir artefactos, sangrado entre pistas o pérdida de detalle en pasajes densos.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las condiciones de los pesos originales de Meta Research y de la conversión de referencia de StemSplitio, ya que la cadena de procedencia no está detallada en la model card.
- Idiomas y contexto: no aplicables; no debe evaluarse con los criterios habituales de modelos de lenguaje.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/sphinxrole/htdemucs-6s-onnx
- Repositorio original de Demucs (Meta Research): https://github.com/facebookresearch/demucs
- Referencia de conversión citada por el autor: StemSplitio (sin URL concreta en la información disponible)
- Documentación de ONNX Runtime: https://onnxruntime.ai/
