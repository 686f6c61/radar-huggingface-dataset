# YanZhanPKU/Entropy-Valley-LLaDA-8B-En2Zh

## Resumen

Entropy-Valley-LLaDA-8B-En2Zh es un adaptador LoRA oficial para traducción automática de inglés a chino, desarrollado por YanZhanPKU y presentado en EMNLP 2026. El adaptador convierte el modelo base GSAI-ML/LLaDA-8B-Base, un modelo de lenguaje de difusión enmascarada de 8.02B parámetros, en un sistema de traducción automática neuronal (MT) para la dirección En→Zh. La contribución principal del proyecto no es el adaptador en sí, sino el método Entropy-Valley (EV), un selector de longitud de decodificación sin entrenamiento que se aplica en tiempo de inferencia.

El problema que resuelve es específico de los modelos de difusión enmascarada: a diferencia de los modelos autorregresivos que generan hasta emitir el token EOS, un decodificador de difusión enmascarada debe conocer de antemano el número de slots objetivo a rellenar. Entropy-Valley resuelve esto realizando un pase forward con todos los tokens enmascarados para cada longitud candidata y eligiendo la longitud con menor entropía predictiva media. En la evaluación sobre WMT22 En→Zh, el método EV alcanza un COMET-22 de 0.8517 y un sacreBLEU de 38.57, cerrando el 64.9% de la brecha entre el ratio fijo y el oráculo de longitud.

El adaptador se entrenó con 200.000 pares del dataset WMT19 zh-en (configuración `enzh` del dataset Entropy-Valley-Datasets) durante tres épocas en precisión bf16 sobre 8 GPU H20. El repositorio libera una de las tres ejecuciones de entrenamiento cuyos resultados se promedian en el paper.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaDA-8B (masked diffusion) + adaptador LoRA |
| Parámetros totales | 8.02B (modelo base) + adaptador LoRA (repo de 0.6 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantización | no disponible (el adaptador se distribuye en bf16) |
| Idiomas soportados | inglés (fuente), chino (destino) |
| Licencia | llada-8b-base-license |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El modelo base es LLaDA-8B-Base, un modelo de difusión enmascarada (masked diffusion) de 8.02B parámetros desarrollado por GSAI-ML. A diferencia de los transformadores autorregresivos, LLaDA genera texto rellenando simultáneamente todas las posiciones enmascaradas de un lienzo de tamaño fijo mediante un proceso iterativo de desenmascarado (schedule MED con 32 pasos en este adaptador). Sobre este backbone, el adaptador LoRA inyecta matrices de baja dimensión en las proyecciones `q/k/v/o_proj` y `ff_proj/up_proj/ff_out` con rango r=64, alpha=128 y dropout 0.05.

El entrenamiento se realizó sobre 200.000 pares del corpus WMT19 zh-en, durante tres épocas en bf16 con 8 GPU H20. El método Entropy-Valley no introduce parámetros adicionales: es un algoritmo de decodificación que, para cada frase fuente, evalúa un conjunto de longitudes candidatas (ratios 0.70, 0.75, 0.80, 0.85 y 0.90 sobre la longitud de la fuente) mediante una pasada forward con todos los tokens enmascarados, calcula la entropía predictiva media sobre las primeras L-1 posiciones (la última se reserva para EOS) y decodifica con la longitud de menor entropía. El prompt utilizado es `Translate English to Chinese.\n\nEnglish: {src}\nChinese: `.

## Capacidades

- Traducción automática de inglés a chino con calidad evaluada en WMT22 (COMET-22 y sacreBLEU).
- Decodificación por difusión enmascarada con schedule MED y 32 pasos, con truncamiento por EOS.
- Selección de longitud adaptativa sin entrenamiento mediante el método Entropy-Valley, que permite elegir la longitud de destino óptima en tiempo de inferencia.
- Soporte de decodificación con oráculo de longitud y ratio fijo como alternativas (el mismo adaptador sirve para las tres condiciones).
- Capacidad de integración con el ecosistema HuggingFace Transformers y PEFT (carga y fusión del adaptador con `PeftModel`).
- Multilingüe limitado a la dirección En→Zh; no se soportan otros pares de idiomas.

## Casos de uso

- **Traducción de documentación técnica**: el modelo puede traducir manuales, guías y especificaciones de inglés a chino con una calidad cercana a la humana en dominios generales, gracias a su entrenamiento con datos WMT19 y la selección de longitud adaptativa que evita traducciones truncadas o infladas.
- **Localización de interfaces de software**: el prompt con `#PRS_ORG#` (ejemplo de la documentación) sugiere que el modelo maneja entidades como nombres de organización, útil para localizar UI, menús y mensajes de error manteniendo el contexto.
- **Atención al cliente multilingüe**: puede generar respuestas en chino a partir de consultas en inglés en sistemas de tickets, con la ventaja de que el método Entropy-Valley permite controlar la longitud de la respuesta sin necesidad de tokens de parada.
- **Traducción de contenido web y marketing**: el modelo puede traducir artículos, descripciones de producto y contenido editorial con un estilo natural, ya que el método de difusión enmascarada produce texto coherente a nivel de oración.
- **Sistemas de traducción asistida (CAT)**: puede integrarse como motor de traducción en herramientas de edición humana, proporcionando una traducción inicial de alta calidad que el traductor humano puede revisar y corregir.
- **Investigación en modelos de difusión para MT**: el adaptador y el método EV son útiles como base para estudiar la decodificación de modelos de difusión enmascarada, la selección de longitud y la comparación con sistemas autorregresivos en tareas de traducción.

## Benchmarks y rendimiento

La evaluación se realizó sobre el conjunto de test WMT22 En→Zh (N=2.037 frases), con decodificación MED de 32 pasos y promedio sobre tres ejecuciones de entrenamiento independientes. El adaptador liberado en este repositorio corresponde a una de esas tres ejecuciones.

| Método de longitud | COMET-22 | sacreBLEU |
|---|---|---|
| Ratio fijo 0.8 | 0.8345 | 36.72 |
| **Entropy-Valley** | **0.8517** | **38.57** |
| Longitud oráculo (límite superior) | 0.8610 | 40.81 |

Entropy-Valley cierra el 64.9% de la brecha entre el ratio fijo y el oráculo de longitud. Los tests de significancia, la evaluación humana, la comparación con DAEDAL y CAL, y los estudios de cross-backbone están detallados en el paper (arXiv:2608.22274).

## Requisitos de hardware

- El modelo base LLaDA-8B en bf16 requiere aproximadamente 16 GB de VRAM solo para los pesos; el adaptador LoRA añade menos de 1 GB (repo de 0.6 GB).
- Para inferencia con 32 pasos de decodificación MED, se recomienda al menos una GPU con 16-20 GB de VRAM: RTX 4090 (24 GB), A100 40 GB, H100 80 GB o H20 96 GB (usada para entrenamiento).
- Es viable en GPU de consumo (RTX 3090/4090) con cuantización de 4 bits del modelo base, aunque el adaptador está diseñado para bf16 y podría perder precisión al cuantizar.
- Opciones de despliegue: HuggingFace Transformers con Peft (carga y fusión del adaptador), o implementaciones personalizadas con el código del repositorio Entropy-Valley (que incluye el script de decodificación `ladit/decoding/translate.py`).
- La latencia de inferencia es mayor que un modelo autorregresivo equivalente por los 32 pasos de desenmascarado; para producción se recomienda precalcular la longitud con el probe de Entropy-Valley (un solo forward) y luego decodificar en un solo paso de 32 iteraciones.

## Comparativa con modelos similares

No hay disponibles modelos comparables directos en la categoría de difusión enmascarada aplicada a traducción automática. La colección Entropy-Valley incluye el adaptador Zh→En (`LaDiT-LLaDA-8B-Zh2En`) sobre el mismo modelo base, pero no se han publicado resultados comparables en la información disponible. La comparativa principal del proyecto se establece con métodos de decodificación alternativos sobre el mismo backbone: ratio fijo y oráculo de longitud, cuyos resultados se muestran en la tabla anterior. Frente a modelos autorregresivos de traducción (por ejemplo, NLLB o modelos MT específicos), no hay datos de comparación en la documentación proporcionada.

## Limitaciones y advertencias

- **Entrenamiento limitado a un dominio**: el adaptador se entrenó únicamente con 200.000 pares de WMT19, lo que puede limitar su rendimiento en dominios especializados (legal, médico, técnico) fuera del corpus general.
- **Riesgo de alucinación**: como todo modelo de difusión enmascarada, puede generar contenido plausible pero incorrecto, especialmente en segmentos de entrada ambiguos o con entidades nombradas.
- **Dependencia de la selección de longitud**: la calidad de la traducción depende críticamente de la longitud del lienzo; aunque Entropy-Valley mejora el ratio fijo, no alcanza el oráculo de longitud y puede fallar en segmentos con longitud de destino muy diferente a la fuente.
- **Soporte limitado de idiomas**: solo cubre la dirección inglés→chino; no se soportan otros pares ni la traducción inversa con este adaptador.
- **Licencia restrictiva**: la licencia `llada-8b-base-license` heredada del modelo base puede imponer restricciones de uso comercial; es necesario revisar los términos antes de desplegar en producción.
- **Rendimiento en producción**: la decodificación con 32 pasos de difusión es computacionalmente costosa en comparación con modelos autorregresivos; no es adecuado para entornos con requisitos de baja latencia sin optimización adicional.
- **Sin soporte de tool calling ni agentes**: el modelo es exclusivamente un sistema de traducción; no ofrece funciones de llamada a herramientas ni razonamiento multi-paso fuera de la tarea de MT.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/YanZhanPKU/Entropy-Valley-LLaDA-8B-En2Zh)
- [Colección Entropy-Valley](https://huggingface.co/collections/YanZhanPKU/entropy-valley)
- [Dataset Entropy-Valley-Datasets](https://huggingface.co/datasets/YanZhanPKU/Entropy-Valley-Datasets)
- [Paper arXiv:2608.22274](https://arxiv.org/abs/2608.22274)
- [Código en GitHub](https://github.com/Entropy-Valley/Entropy-Valley)
- [Modelo base GSAI-ML/LLaDA-8B-Base](https://huggingface.co/GSAI-ML/LLaDA-8B-Base)
- [Paper de LLaDA (Large Language Diffusion Models)](https://ar5iv.labs.arxiv.org/html/2502.09992)
