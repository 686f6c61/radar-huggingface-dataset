# tencent/AuK-Flash

## Resumen

AuK-Flash es una variante destilada del modelo AuK de Tencent, un modelo fundacional de 1.500 millones de parámetros para generación y edición de voz. Desarrollado por el equipo Tencent-Hunyuan, AuK-Flash permite una inferencia rápida en 4 pasos mediante destilación, frente al modelo base AuK, que prioriza la calidad de generación. El modelo fue publicado en Hugging Face en septiembre de 2026 bajo licencia MIT, con código abierto en GitHub y un espacio de demostración disponible.

AuK unifica en una única interfaz de instrucciones en lenguaje natural tareas como TTS zero-shot, TTS por instrucciones, edición de contenido y acústica, edición paralingüística, mejora de voz y separación de fuentes. Entrenado con millones de horas de audio diverso, soporta los idiomas chino e inglés. AuK-Flash es relevante para aplicaciones que requieren generación o edición de voz con baja latencia, manteniendo la flexibilidad del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión destilado para inferencia en 4 pasos (basado en tencent/AuK; arquitectura detallada no disponible) |
| Parámetros totales | 1.5B (según el modelo base AuK; no especificado individualmente para AuK-Flash) |
| Parámetros activos | No aplica |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | No especificado en la información proporcionada |

## Arquitectura y entrenamiento

AuK es un modelo fundacional de 1.500 millones de parámetros para generación y edición de voz, entrenado sobre millones de horas de audio diverso. El modelo expone todas las tareas a través de una interfaz unificada de instrucciones en lenguaje natural, lo que permite abordar desde TTS hasta edición y separación de fuentes sin cambiar de modelo. AuK-Flash es la variante destilada, que reduce el número de pasos de muestreo a 4 para acelerar la inferencia. No se proporcionan detalles sobre el conjunto de datos exacto, el número de tokens de entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. La arquitectura concreta (por ejemplo, si se basa en un transformer, una red de difusión o una combinación híbrida) no está disponible en la información proporcionada; se remite al artículo arXiv:2609.08936 para más detalles.

## Capacidades

- Zero-shot TTS: genera habla en la voz de un audio de referencia sin necesidad de ajuste fino.
- Instruct TTS: genera voz a partir de una descripción textual de la voz (por ejemplo, "voz masculina grave en inglés") sin audio de referencia.
- Edición de contenido del habla: reescribe lo que se dice en una grabación, permitiendo reemplazar, insertar o eliminar texto mientras se conserva la voz.
- Edición de letras: reescribe la letra de una grabación de canto manteniendo la melodía y la voz.
- Edición acústica: ajusta el tono (semitones), la velocidad de habla y el volumen en decibelios.
- Edición paralingüística: modifica la emoción, el timbre, elimina acentos regionales y añade o quita sonidos no verbales como respiraciones, risas o toses.
- Mejora de voz: elimina ruido o degradaciones mediante instrucciones.
- Separación de fuentes: separa voces o fuentes sonoras en una grabación mediante instrucciones.
- Idiomas: soporta chino e inglés.

## Casos de uso

- Clonación de voz para doblaje o audiolibros: el modelo puede generar diálogos en la voz de un actor a partir de un audio de referencia, lo que permite producir versiones de un contenido en distintos idiomas manteniendo la voz original.
- Asistentes de voz personalizados: mediante Instruct TTS, se puede generar una voz sintética a partir de una descripción, sin necesidad de grabar un corpus de audio de referencia, reduciendo el coste de creación de voces para asistentes.
- Corrección de podcasts y entrevistas: con la edición de contenido, se puede corregir una palabra o frase mal pronunciada en una grabación existente sin regrabar la sesión, preservando el tono y la entonación originales.
- Producción musical y edición de voces: la edición acústica permite ajustar el tono de una interpretación vocal o el ritmo del habla en una narración sin necesidad de un DAW complejo; la edición de letras permite reescribir estrofas de una canción manteniendo la melodía y el timbre.
- Mejora de grabaciones de campo o llamadas: la mejora de voz y la edición de sonidos no verbales permiten limpiar grabaciones eliminando toses, respiraciones o ruido de fondo mediante instrucciones en lenguaje natural.
- Análisis de reuniones o entrevistas: la separación de fuentes permite aislar la voz de cada hablante en una grabación multicanal, facilitando la transcripción y el análisis posterior.
- Narración de contenido audiovisual con emoción: la edición paralingüística permite cambiar la emoción de una línea concreta (por ejemplo, pasar de neutro a alegre) sin alterar la voz ni el contenido, útil en doblaje o animación.
- Accesibilidad en aplicaciones interactivas: el TTS cero-shot y la generación por instrucciones permiten generar voces personalizadas en tiempo real para lectores de pantalla o juegos, con una latencia reducida gracias a la destilación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información proporcionada. El README del modelo incluye una figura de rendimiento (imagen `performance.png`) que no contiene valores tabulados en el texto disponible. La búsqueda web confirma que, a fecha de la publicación, no existen evaluaciones independientes públicas del modelo. Por tanto, no se pueden presentar resultados comparativos verificables.

## Requisitos de hardware

- VRAM estimada: no se dispone de datos oficiales. Dado que el repositorio pesa 6.8 GB y el modelo tiene 1.5B parámetros, se estima que una carga en precisión fp16 necesitaría entre 4 y 6 GB de VRAM, y entre 8 y 12 GB en fp32. Estos valores son orientativos.
- GPU recomendadas: no se indican modelos concretos por parte del autor. Para fp16, una GPU de consumo con 8 GB de VRAM (por ejemplo, RTX 3070 o similar) podría ser suficiente; para fp32, se recomendaría una GPU con 16 GB o más (por ejemplo, A100 o RTX 4090).
- Inclusión en GPU de consumo: es plausible que el modelo pueda ejecutarse en una GPU de consumo con al menos 8 GB de VRAM en fp16, siempre que se utilice una implementación eficiente.
- Opciones de despliegue: el modelo se distribuye como pesos de Hugging Face y el código de referencia está en GitHub (Tencent-Hunyuan/AuK). El repositorio incluye ejemplos de uso mediante CLI y Python. No se menciona soporte para vLLM, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no hay cifras publicadas. El objetivo de AuK-Flash es la inferencia en 4 pasos, lo que sugiere una latencia menor que el modelo base, pero no se aportan datos cuantitativos.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos similares en la información proporcionada. La única comparación posible es entre las dos variantes de Tencent:

| Modelo | Parámetros | Inferencia | Licencia |
|---|---|---|---|
| AuK (base) | 1.5B | No especificado | MIT |
| AuK-Flash | 1.5B | 4 pasos (destilado) | MIT |

No se dispone de datos de otros modelos TTS de código abierto en el momento de redactar esta ficha.

## Limitaciones y advertencias

- No se han publicado análisis de sesgos para este modelo.
- Al ser un modelo reciente y sin evaluaciones independientes, se desconoce su comportamiento en dominios fuera del conjunto de entrenamiento; puede producir pronunciaciones o efectos inesperados en texto de dominio específico.
- Solo soporta chino e inglés, lo que limita su uso en otros idiomas o en contextos multilingües amplios.
- La licencia MIT permite uso comercial, pero el usuario debe revisar las condiciones de uso de los datos de entrenamiento y verificar que el uso previsto cumple con las políticas del autor.
- El tamaño del repositorio (6.8 GB) y la necesidad de una GPU con suficiente VRAM pueden ser un obstáculo para despliegues en entornos con recursos limitados.
- No se detallan tiempos de inferencia ni consumo de memoria, por lo que se recomienda validar el rendimiento en el hardware objetivo antes de usar el modelo en producción.

## Enlaces

- Hugging Face (AuK-Flash): https://huggingface.co/tencent/AuK-Flash
- Hugging Face (AuK base): https://huggingface.co/tencent/AuK
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tencent/AuK
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/AuK
- Paper arXiv: https://arxiv.org/abs/2609.08936
- Demo en ModelScope: https://modelscope.cn/studios/Tencent-Hunyuan/AuK
- Sitio web del proyecto: https://auk-project.github.io/
- Artículo de análisis externo: https://www.orcarouter.ai/blog/auk-flash-open-source-release
