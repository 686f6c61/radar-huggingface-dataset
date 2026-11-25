# Tiiao/collab-wcadam

## Resumen

`collab-wcadam` es un repositorio de pesos (weights-only) publicado por el usuario Tiiao en Hugging Face, no un modelo entrenado con fines de uso general. Contiene las exportaciones de los checkpoints de las ejecuciones de la colaboración "wcadam", descritas por el autor como modelos de lenguaje de la clase Marin de 130M de parámetros. Cada ejecución se organiza en una carpeta independiente y el checkpoint se exporta en FP32, dividido en dos partes que deben fusionarse para reconstruir el state dict completo.

La única ejecución documentada en la model card es `f_d_2x`, correspondiente al checkpoint final (step 10240) entrenado sobre 4 GPU H100 con semilla 0. El repositorio tiene un tamaño total de 1,1 GB y no incluye pipeline declarado, idiomas soportados ni documentación de uso más allá del procedimiento de descarga y reconstrucción de pesos.

Por su naturaleza (checkpoints intermedios en formato `torch.save` en lugar de safetensors o GGUF, licencia "other" sin texto de licencia publicado y ausencia de benchmarks), este repositorio debe considerarse material de investigación reproducible más que un modelo listo para producción. Su interés radica en la trazabilidad del proceso de entrenamiento de una familia de modelos pequeños de la clase Marin.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (descrito por el autor como "Marin 130M-class language models") |
| Parámetros totales | no disponible con precisión; el autor indica clase de 130M |
| Parámetros activos | no aplica (no se documenta como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos exportados en FP32) |
| Idiomas soportados | no disponible |
| Licencia | other (sin texto de licencia publicado) |
| Formato de pesos | `torch.save` (`.pt`) en FP32, dividido en dos partes por checkpoint |

## Arquitectura y entrenamiento

El autor describe los artefactos como exportaciones de pesos de las ejecuciones de la colaboración wcadam, correspondientes a modelos de lenguaje de la clase Marin de 130M de parámetros. No se especifica en la información disponible el tipo de transformer (atención completa, variantes lineales, MoE u otras), la composición del dataset, el número de tokens de entrenamiento ni si se aplicaron fases de RLHF, DPO o ajuste supervisado.

El único run documentado, `f_d_2x`, corresponde al checkpoint final en el step 10240, entrenado sobre 4 GPU H100 con semilla 0. Los pesos se exportan en FP32 y se dividen en dos ficheros; cada uno es un diccionario de `torch.save` con las claves `model` (tensores de esa parte), `config`, `step`, `part` y `keys` (lista ordenada completa de claves). La reconstrucción del state dict completo requiere fusionar los dos diccionarios `model`. Los tamaños y hashes SHA-256 de ambos ficheros están publicados en la model card.

## Capacidades

- No se documentan capacidades específicas en la información disponible.
- Por la clase del modelo (130M de parámetros) y la ausencia de pipeline declarado, no hay evidencia publicada de soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte multilingüe ni modo de razonamiento (thinking mode).
- No se documentan capacidades de visión, audio ni multimodalidad.
- El repositorio está orientado a la reproducibilidad de checkpoints, no al uso directo como modelo conversacional.

## Casos de uso

- Reproducción de experimentos de entrenamiento: descargar `f_d_2x/*`, fusionar los dos diccionarios `model` y cargar el state dict en el código de entrenamiento original de la colaboración wcadam para verificar el step 10240.
- Auditoría de checkpoints: los hashes SHA-256 publicados permiten verificar la integridad de las descargas en pipelines de CI o scripts de validación.
- Investigación sobre modelos pequeños: servir como punto de partida para estudiar el comportamiento de modelos de la clase Marin de 130M en tareas controladas, siempre que se disponga de la configuración y el tokenizador del proyecto original.
- Fine-tuning experimental: al estar en FP32 y en formato `torch.save`, los pesos pueden cargarse en frameworks de PyTorch para ajuste supervisado en dominios concretos, asumiendo el coste de conversión a formatos de despliegue.
- Comparación de semillas y runs: la estructura "una carpeta por run" facilita contrastar el checkpoint `f_d_2x` (semilla 0) con otras ejecuciones de la colaboración si se publican en el futuro.
- Docencia y formación: útil como ejemplo práctico de exportación de pesos divididos, reconstrucción de state dicts y verificación por hash en cursos de ingeniería de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de clase 130M en FP32, el peso de los parámetros rondaría los 0,5 GB, aunque el autor no publica el recuento exacto ni la configuración.
- GPU recomendadas: el entrenamiento documentado se realizó sobre 4 GPU H100; no se especifican requisitos de inferencia.
- GPU de consumo: no confirmado; por tamaño, un modelo de 130M cabría previsiblemente en GPU de consumo, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el formato `torch.save` en FP32 requiere conversión previa para la mayoría de estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma colaboración ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia "other" sin texto de licencia publicado: no se puede confirmar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- Repositorio de checkpoints, no de modelo final: no incluye pipeline, tokenizador ni instrucciones de inferencia; el uso requiere el código del proyecto original.
- Formato `torch.save` en FP32 dividido en dos partes: implica pasos manuales de reconstrucción y conversión antes de desplegar.
- Ausencia de benchmarks, idiomas declarados y documentación de sesgos: no hay evidencia para evaluar riesgo de alucinación ni calidad lingüística.
- Riesgo de reproducibilidad: solo se documenta un run (`f_d_2x`, semilla 0); no hay garantías sobre el resto de ejecuciones de la colaboración.
- Sin descargas ni likes en el momento de la consulta: no hay señal de validación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tiiao/collab-wcadam
- Descarga del run documentado: `hf download Tiiao/collab-wcadam --include "f_d_2x/*" --local-dir <dir>`
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
