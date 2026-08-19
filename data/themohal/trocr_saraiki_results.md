# themohal/trocr_saraiki_results

## Resumen

El modelo `themohal/trocr_saraiki_results` es un ajuste fino de `microsoft/trocr-small-printed` orientado al reconocimiento optico de caracteres (OCR) para el idioma saraiki, una lengua indoaria hablada principalmente en la region de Punjab en Pakistan. El desarrollo corre a cargo del usuario de HuggingFace `themohal`, y el modelo se publico en agosto de 2026. Resuelve el problema de la falta de sistemas OCR especificos para escritura en alfabeto arabe extendido, adaptando un modelo base entrenado para texto impreso en ingles a un dominio linguistico con escasa representacion en los datasets publicos.

Con 61,6 millones de parametros, es un modelo compacto que sigue la arquitectura vision-encoder-decoder de TrOCR. Su relevancia radica en que demuestra la viabilidad de transferir modelos OCR preentrenados a lenguas de bajos recursos mediante ajuste fino, aunque los resultados de validacion muestran un rendimiento limitado (CER de 0,7220), lo que sugiere que el modelo es un experimento preliminar mas que una solucion lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR: ViT encoder + Transformer decoder) |
| Parametros totales | 61.596.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | saraiki (presunto, no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura TrOCR de Microsoft, que combina un encoder de vision basado en Vision Transformer (ViT) con un decoder de lenguaje Transformer. En concreto, parte de `trocr-small-printed`, la variante pequena entrenada para texto impreso en ingles. El ajuste fino se realizo sobre un dataset desconocido, sin informacion publica sobre su composicion, tamano o procedencia.

Los hiperparametros de entrenamiento incluyen una tasa de aprendizaje de 4e-05, batch de entrenamiento y evaluacion de 16, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal y 4 epocas completas. Se utilizo precision mixta nativa (AMP). El entrenamiento totalizo 57.692 pasos, con una perdida de entrenamiento final de 1,4874 y una perdida de validacion de 0,7270. No se menciona el uso de tecnicas como RLHF o DPO, y el proceso es un ajuste fino supervisado estandar.

## Capacidades

- Reconocimiento de texto impreso en imagenes, limitado al dominio del saraiki (presumiblemente escritura arabe extendida).
- Generacion de texto a partir de imagenes (pipeline image-to-text).
- Inferencia compatible con la libreria transformers y endpoints compatibles.
- No se han documentado capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de vision general mas alla del OCR.

## Casos de uso

- Digitalizacion de documentos historicos en saraiki: el modelo puede transcribir imagenes de manuscritos o documentos impresos en saraiki, aunque su CER actual (0,7220) indica que requiere post-procesamiento o revision humana.
- Archivado de prensa local: para convertir escaneos de periodicos o boletines en saraiki a texto digital, facilitando busquedas y analisis posterior.
- Accesibilidad para hablantes de saraiki: como componente de sistemas de lectura asistida que convierten texto impreso en audio.
- Extraccion de informacion de formularios en saraiki: en entornos administrativos donde los formularios estan impresos en este idioma, el modelo puede ayudar a automatizar la captura de datos.
- Investigacion linguistica: para construir corpus digitales en saraiki a partir de fuentes impresas, permitiendo estudios de frecuencia, morfologia o sintaxis.
- Sistema de bajo coste en entornos con recursos limitados: al ser un modelo pequeno, puede desplegarse en hardware modesto para tareas de OCR en organizaciones sin acceso a GPUs de alta gama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una entrada `model-index` con una lista vacia de resultados. Los unicos datos de rendimiento disponibles son los de validacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Loss de validacion | 0,7270 |
| CER (Character Error Rate) | 0,7220 |

Un CER de 0,7220 implica que aproximadamente el 72 % de los caracteres son incorrectos, lo que indica un rendimiento muy pobre para uso practico en OCR.

## Requisitos de hardware

- VRAM estimada: con 61,6 millones de parametros, el modelo ocupa aproximadamente 246 MB en fp32 y unos 62 MB en int8. Cabe en cualquier GPU consumer con al menos 2 GB de VRAM.
- GPUs recomendadas: NVIDIA GTX 1050 Ti (4 GB) o superior, aunque una RTX 3060 (12 GB) proporcionaria margen para batch mayores.
- Compatible con GPUs consumer: si, incluso en CPU se podria ejecutar con latencias altas.
- Opciones de despliegue: transformers (pipeline image-to-text), HuggingFace Inference Endpoints, o exportacion a ONNX para inferencia en CPU.
- Latencia y throughput: no disponibles, pero por el tamano del modelo se espera una latencia de decenas de milisegundos por imagen en una GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (saraiki) | Licencia |
|---|---|---|---|---|
| themohal/trocr_saraiki_results | 61,6 M | no disponible | 0,7220 | no disponible |
| microsoft/trocr-small-printed | 61,6 M | 512 tokens (imagen) | no evaluado en saraiki | MIT |
| microsoft/trocr-base-printed | 334 M | 512 tokens (imagen) | no evaluado en saraiki | MIT |

El modelo base `trocr-small-printed` esta licenciado bajo MIT, pero la licencia del ajuste fino no se ha especificado. No hay modelos comparables publicados especificamente para OCR en saraiki en la informacion disponible.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, lo que impide evaluar posibles sesgos o la representatividad de los datos.
- El CER de validacion (0,7220) es extremadamente alto, lo que hace que el modelo no sea util para tareas de OCR en produccion sin una correccion posterior intensiva.
- No se ha especificado la licencia del modelo, lo que genera incertidumbre legal para uso comercial.
- No se ha confirmado que el modelo funcione correctamente con todas las variantes del alfabeto saraiki (por ejemplo, diferencias entre Shahmukhi y otras escrituras).
- Al ser un ajuste fino de un modelo entrenado en ingles impreso, puede tener degradaciones en imagenes con ruido, baja resolucion o fuentes no estandar.
- No hay informacion sobre la longitud de contexto ni el tamano maximo de imagen soportado.
- La model card indica que se genero automaticamente con el Trainer, por lo que falta documentacion detallada sobre limitaciones y usos previstos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/themohal/trocr_saraiki_results
- Modelo base: https://huggingface.co/microsoft/trocr-small-printed
- Paper de TrOCR (referencia): https://arxiv.org/abs/2109.10282
