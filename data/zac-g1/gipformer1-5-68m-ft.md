# ZAC-G1/gipformer1.5-68m-ft

## Resumen

Gipformer1.5-68m-ft es un modelo de reconocimiento automático del habla (ASR) de tipo transducer basado en la arquitectura Zipformer, desarrollado por ZAC-G1. Se trata de un ajuste fino (fine-tuning) del modelo base g-group-ai-lab/gipformer-68M-rnnt, orientado específicamente al idioma vietnamita (código `vi`). Con 68 millones de parámetros, es un modelo compacto pensado para despliegue eficiente en producción, y se distribuye en formato ONNX para su uso con la librería sherpa-onnx.

El modelo resuelve el problema de la transcripción de voz a texto en vietnamita con un coste computacional bajo, lo que lo hace adecuado para aplicaciones en tiempo real o en dispositivos con recursos limitados. Su empaquetado en ONNX y su integración con sherpa-onnx facilitan el despliegue en entornos de producción sin necesidad de frameworks de deep learning pesados.

Es relevante ahora porque los modelos ASR ligeros y especializados por idioma permiten construir pipelines de transcripción económicos y de baja latencia, y la familia Zipformer ha demostrado ser competitiva en eficiencia frente a arquitecturas transformer convencionales para tareas de voz. No obstante, la información pública disponible sobre este ajuste concreto es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer (transducer / RNN-T) |
| Parametros totales | 68M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en ONNX) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | ONNX (sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Zipformer en configuración transducer (RNN-T), una variante de transformer con codificador multi-resolución que reduce el coste computacional manteniendo la calidad de reconocimiento. El modelo base es g-group-ai-lab/gipformer-68M-rnnt, sobre el que ZAC-G1 ha realizado un ajuste fino para vietnamita. El repositorio ocupa 0,3 GB e incluye los pesos exportados a ONNX para inferencia con sherpa-onnx.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset, el uso de técnicas de aumento de datos o si se aplicaron métodos de alineación adicionales. Tampoco se detalla el proceso de fine-tuning ni las innovaciones técnicas específicas de este ajuste más allá de la propia arquitectura Zipformer y su empaquetado para sherpa-onnx.

## Capacidades

- Reconocimiento automático del habla (ASR) en vietnamita, con salida de transcripción de texto.
- Arquitectura transducer que permite decodificación en streaming y en modo offline.
- Despliegue optimizado mediante sherpa-onnx y formato ONNX, sin dependencia de PyTorch en inferencia.
- Modelo compacto (68M parámetros) adecuado para entornos con recursos limitados.
- No se ha documentado soporte de tool calling, agentes, visión, audio más allá de ASR ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al vietnamita según los metadatos del modelo.

## Casos de uso

- Transcripción de reuniones y notas de voz en vietnamita: el modelo convierte audio en texto con bajo coste computacional, adecuado para aplicaciones de productividad.
- Subtitulado automático de vídeo y audio en vietnamita: su formato ONNX y su tamaño permiten integrarlo en pipelines de generación de subtítulos en tiempo casi real.
- Asistentes de voz para atención al cliente en vietnamita: la arquitectura transducer soporta decodificación en streaming, lo que facilita interacciones conversacionales de baja latencia.
- Dictado por voz en aplicaciones móviles o de escritorio: el reducido tamaño del modelo permite ejecución en dispositivos con recursos limitados.
- Indexación y búsqueda de contenido audiovisual: transcripción masiva de archivos de audio para hacerlos buscables en bases de datos.
- Sistemas de accesibilidad para personas con discapacidad auditiva: generación de transcripciones en vivo de conversaciones o medios en vietnamita.
- Preprocesamiento en pipelines de NLP: conversión de audio a texto como paso previo a análisis de sentimiento, resumen o extracción de entidades en vietnamita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (68M parámetros) y el formato ONNX, es previsible que quepa en CPU y en GPUs de gama baja, pero no se han publicado cifras concretas.
- GPU recomendadas: no disponible. Dado el tamaño, cualquier GPU consumer moderna debería ser suficiente, pero no hay datos oficiales.
- ¿Cabe en GPU consumer? Es probable que sí por el reducido número de parámetros, aunque no se confirma en la documentación disponible.
- Opciones de despliegue: sherpa-onnx (librería indicada en los metadatos), con soporte de runtime ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| ZAC-G1/gipformer1.5-68m-ft | 68M | no disponible | vi | MIT | ONNX |
| g-group-ai-lab/gipformer-68M-rnnt (base) | 68M | no disponible | no disponible | no disponible | no disponible |
| Otros ASR Zipformer de sherpa-onnx | variable | no disponible | varios | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado únicamente en vietnamita; no se ha documentado soporte para otros idiomas.
- No hay información pública sobre sesgos, tasas de alucinación o errores típicos en dominios específicos (ruido, acentos, jerga).
- El acceso al repositorio está restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base g-group-ai-lab/gipformer-68M-rnnt, ya que podría tener requisitos adicionales.
- No se han publicado métricas de calidad (WER/CER) ni detalles del dataset de entrenamiento, lo que dificulta evaluar su idoneidad para producción sin pruebas propias.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/ZAC-G1/gipformer1.5-68m-ft
- Modelo base: https://huggingface.co/g-group-ai-lab/gipformer-68M-rnnt
- sherpa-onnx (librería de despliegue): no se proporciona enlace en la información disponible.
