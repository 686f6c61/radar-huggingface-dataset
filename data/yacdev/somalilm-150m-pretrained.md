# yacdev/SomaliLM-150M-Pretrained

## Resumen

SomaliLM-150M es un modelo de lenguaje compacto de 147 millones de parámetros, desarrollado por el usuario yacdev, basado en la arquitectura LLaMA. Está preentrenado sobre aproximadamente 370 millones de tokens del conjunto de datos educativo FineWeb-Edu, lo que lo orienta hacia tareas de generación de texto con contenido formativo. El modelo es bilingüe (inglés y somalí) y admite una longitud de contexto de 2048 tokens, lo que lo hace adecuado para aplicaciones de generación de texto y conversación en esos idiomas.

Su relevancia radica en ser un modelo pequeño y eficiente, con licencia Apache 2.0, que puede desplegarse en entornos con recursos limitados. Aunque no se han publicado benchmarks oficiales, su diseño basado en LLaMA y su entrenamiento en datos educativos lo convierten en una opción interesante para prototipos y aplicaciones educativas, especialmente en contextos donde se requiera procesamiento en somalí.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA (transformer decoder causal) |
| Parametros totales | 147.284.736 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), somalí (so) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA, con 12 capas, dimensión oculta de 768, 12 cabezas de atención y un vocabulario de 32.000 tokens. Se trata de un transformer decoder causal, diseñado para generación de texto autoregresiva. El entrenamiento se realizó sobre aproximadamente 370 millones de tokens del dataset FineWeb-Edu, un corpus curado con contenido educativo de alta calidad. No se menciona el uso de técnicas de alineación como RLHF o DPO, ni innovaciones arquitectónicas adicionales. El modelo se presenta como una versión preentrenada (foundation model), sin fine-tuning específico para tareas concretas.

## Capacidades

- Generación de texto causal en inglés y somalí.
- Modelo conversacional básico, según las etiquetas del repositorio.
- Adecuado para completar frases y generar texto coherente en dominios educativos.
- Soporte de contexto de hasta 2048 tokens.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación de material educativo: el modelo puede producir explicaciones, resúmenes o preguntas de práctica en inglés y somalí, aprovechando su entrenamiento en FineWeb-Edu.
- Asistentes conversacionales simples: integrable en chatbots para responder preguntas frecuentes o mantener diálogos cortos en entornos educativos o de atención al usuario.
- Completado de texto en aplicaciones de escritura asistida: útil para redactar borradores de artículos, ensayos o contenido didáctico en ambos idiomas.
- Traducción básica entre inglés y somalí: aunque no está entrenado específicamente para traducción, puede generar texto en el idioma objetivo a partir de un prompt en el otro.
- Prototipos de investigación: sirve como modelo base para fine-tuning en tareas específicas de procesamiento de lenguaje natural en somalí, dado su tamaño reducido.
- Aplicaciones educativas offline: al ser ligero, puede ejecutarse en dispositivos con recursos limitados, como portátiles o incluso Raspberry Pi, para entornos sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. Dado el tamaño del modelo (147M parámetros), se estima que puede ejecutarse en CPU o GPU con poca memoria, pero no hay confirmación oficial. Para inferencia en FP16, el peso ocuparía aproximadamente 294 MB, y en cuantización de 4 bits podría reducirse a unos 74 MB, aunque no se ofrecen archivos cuantizados. No se especifican opciones de despliegue como vLLM, llama.cpp u Ollama, pero al ser un modelo LLaMA, es probable que sea compatible con estas herramientas.

## Comparativa con modelos similares

No se dispone de comparativas oficiales con otros modelos. Dado su tamaño, podría compararse con modelos como TinyLlama (1.1B) o GPT-2 (124M), pero no hay datos de rendimiento que permitan una comparación objetiva. La información disponible no incluye referencias a modelos equivalentes.

## Limitaciones y advertencias

- Al ser un modelo pequeño (147M), su capacidad de conocimiento y razonamiento es limitada en comparación con modelos más grandes.
- Puede presentar alucinaciones o generar información incorrecta, especialmente en temas fuera de su dominio de entrenamiento.
- El contexto máximo de 2048 tokens restringe el manejo de documentos largos o conversaciones extensas.
- Solo soporta inglés y somalí; no cubre otros idiomas.
- No se han documentado sesgos específicos, pero al entrenarse en un corpus educativo, podría reflejar sesgos presentes en ese tipo de contenido.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza la calidad del modelo para producción sin fine-tuning adicional.
- El tamaño del repositorio (51.3 GB) parece desproporcionado para 147M parámetros, lo que podría indicar archivos adicionales o un error en el registro; se recomienda verificar antes de su uso.

## Enlaces

- [HuggingFace: yacdev/SomaliLM-150M-Pretrained](https://huggingface.co/yacdev/SomaliLM-150M-Pretrained)
