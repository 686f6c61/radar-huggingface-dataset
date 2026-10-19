# wernerlea/simple-classification

## Resumen

`wernerlea/simple-classification` es un repositorio experimental publicado en HuggingFace por Lea Werner (usuario `wernerlea`) que contiene una implementación propia de DeiT (Data-efficient Image Transformer) en su variante *tiny* para tareas de clasificación. No se distribuye como modelo entrenado, sino como base de código con un *checkpoint* de inicialización válido únicamente para *smoke tests*: la propia model card indica explícitamente que no se reclama ninguna métrica de benchmark y que los pesos no han sido entrenados ni auditados.

El interés del repositorio es, por tanto, arquitectónico y metodológico, no de rendimiento. La implementación incorpora decisiones poco habituales en DeiT estándar: atención *grouped query* (GQA), fusión de bajo rango (*low rank fusion*), activación mish y normalización RMSNorm, sobre un esqueleto de escala *tiny*. Con 24.832 parámetros totales según los safetensors, el modelo es tres órdenes de magnitud menor que un DeiT-Tiny convencional, lo que lo sitúa como un banco de pruebas para cambios de arquitectura antes de lanzar entrenamientos completos.

Es relevante ahora como ejemplo de práctica reproducible: incluye `config.json` con los ajustes de arquitectura generados, `training_args.json` con la receta por defecto (optimizador Lion con *warmup* constante) y recomendaciones explícitas de evaluación (split etiquetado específico de la tarea, al menos tres semillas, *baseline* de capacidad equivalente). La licencia MIT facilita su reutilización, con la advertencia de revisar los términos de los datos externos que se utilicen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeiT (vision transformer), escala *tiny*, con atención *grouped query*, fusión de bajo rango, activación mish y normalización RMSNorm |
| Parámetros totales | 24.832 (según pesos en safetensors) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible (modelo de clasificación, sin ventana de contexto generativa declarada) |
| Tipos de cuantización | No disponible (solo se publica *checkpoint* de inicialización en safetensors) |
| Idiomas soportados | No disponible (el repositorio no declara idiomas; la tarea es clasificación, no generación de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors`; implementación en `finetune.py` (PyTorch) |

Otros datos del repositorio: pipeline declarado no disponible, 0 descargas y 0 *likes* en el momento de la consulta, tamaño del repo 0,0 GB, creado y actualizado el 18 de octubre de 2026 (actualización 5 segundos después de la creación).

## Arquitectura y entrenamiento

La arquitectura es un DeiT de escala *tiny* con modificaciones respecto al DeiT original: mecanismo de atención *grouped query* (varias cabezas de consulta comparten un conjunto reducido de claves y valores), fusión de características de bajo rango, función de activación mish en lugar de GELU y RMSNorm en lugar de LayerNorm. El repositorio incluye `config.json` con los ajustes de arquitectura generados y un script `finetune.py` que actúa como artefacto principal, con un bloque `__main__` que contiene un ejemplo ejecutable de *smoke test*. Al ser una implementación personalizada, las APIs genéricas de carga automática de HuggingFace requieren un adaptador explícito.

No se ha publicado información sobre datos de entrenamiento: no hay número de tokens, composición del dataset, ni consta RLHF, DPO o ajuste por instrucciones (la tarea es clasificación, no generación). El `model.safetensors` es un *checkpoint* de inicialización, no el resultado de un entrenamiento. La receta por defecto en `training_args.json` usa optimizador Lion con planificador de *warmup* constante, y la model card subraya que son valores de partida del script, no evidencia de una ejecución completada.

## Capacidades

- Clasificación (visión): el esqueleto DeiT está orientado a tareas de clasificación; no se ha validado ninguna capacidad efectiva porque los pesos están sin entrenar.
- No dispone de generación de texto, razonamiento, código ni matemáticas: es un modelo discriminativo, no generativo.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles ni declaradas.
- Capacidad especial: ninguno de los pesos publicados ha sido entrenado, por lo que no hay *thinking mode*, visión funcional ni audio demostrados. El valor del repositorio es el código (GQA + fusión de bajo rango + mish + RMSNorm) y la configuración reproducible, no el modelo resultante.

## Casos de uso

- Prototipado de arquitecturas de visión: usar `finetune.py` y `config.json` como punto de partida para probar variantes (GQA, fusión de bajo rango, mish, RMSNorm) con coste computacional mínimo antes de escalar a un DeiT completo.
- *Smoke test* de infraestructura de entrenamiento: cargar `model.safetensors` como inicialización y verificar que el pipeline de datos, el *dataloader* y el bucle de entrenamiento funcionan de extremo a extremo con 24.832 parámetros.
- Docencia y formación: ilustrar la diferencia entre un *checkpoint* de inicialización y uno entrenado, y mostrar cómo se documenta una receta experimental (Lion, *warmup* constante) sin reclamar resultados.
- Comparativa de recetas de optimización: reproducir el mismo conjunto de datos y presupuesto de *tuning* con Lion frente a AdamW y con distintos *schedules*, aplicando la guía de evaluación de la model card (tres semillas, *baseline* de capacidad equivalente).
- Base para clasificación de dominio específico: tras un *fine-tuning* real sobre un split etiquetado propio, emplear la escala *tiny* para tareas de clasificación con latencia muy baja y requisitos de memoria mínimos.
- Validación de exportación e integración: probar la conversión del modelo a ONNX u otros formatos y la integración en servicios de inferencia, verificando latencia y uso de memoria con un modelo de juguete antes de mover cargas reales.
- Auditoría de prácticas de publicación: servir como caso de estudio de una model card que declara ausencia de benchmarks y de entrenamiento, útil para definir plantillas internas de documentación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica literalmente que no se reclama ninguna puntuación de benchmark y que el *checkpoint* no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Cualquier cifra que se obtuviera requeriría un entrenamiento previo sobre un split etiquetado específico, reporte de la métrica de tarea en al menos tres semillas e inclusión de un *baseline* de capacidad equiparable.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión. Los pesos en fp32 ocupan aproximadamente 99 KB (24.832 parámetros × 4 bytes), unos 50 KB en fp16 y unos 25 KB en int8; el consumo real está dominado por el *runtime* de PyTorch y las librerías asociadas, no por el modelo.
- GPU recomendadas: cualquier GPU consumer sirve; no se requiere A100, H100 ni RTX 4090. Una GTX 1650, RTX 3050 o incluso CPU son suficientes para *smoke tests*.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales, y también en CPU y en entornos sin acelerador.
- Opciones de despliegue: al ser una implementación personalizada, requiere el propio `finetune.py` con un adaptador explícito; las APIs genéricas de `transformers`, vLLM, TGI, llama.cpp u Ollama no lo cargarán sin trabajo adicional. Para experimentación es razonable exportar a ONNX y servir con ONNX Runtime.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de latencia ni de rendimiento, y al no existir un *checkpoint* entrenado las mediciones carecerían de significado para tareas reales.

## Comparativa con modelos similares

No hay datos de rendimiento de este repositorio, por lo que la comparación se limita a escala y disponibilidad.

| Modelo | Parámetros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| `wernerlea/simple-classification` | 24.832 | Clasificación (DeiT *tiny* modificado) | MIT | Pesos de inicialización, sin entrenar |
| DeiT-Tiny (referencia original de Facebook Research) | ~5,7 M | Clasificación de imágenes (ImageNet) | Código y pesos publicados por el autor original | Pesos entrenados y benchmarks publicados |
| ViT-Base (referencia) | ~86 M | Clasificación de imágenes | Según checkpoint | Pesos entrenados disponibles |
| ResNet-50 (referencia CNN) | ~25,6 M | Clasificación de imágenes | Según checkpoint | Pesos entrenados disponibles |

Advertencia: las filas de referencia corresponden a modelos conocidos de la literatura, no a resultados medidos en este repositorio; la diferencia de parámetros respecto a DeiT-Tiny (unas 230 veces menos) es el dato más relevante y explica que este modelo no sea comparable en calidad de clasificación con ningún *checkpoint* entrenado. No se dispone de alternativas del mismo autor ni de la misma escala con las que establecer una comparación directa.

## Limitaciones y advertencias

- Los pesos publicados no están entrenados: no producen predicciones útiles fuera de un *smoke test* de forma y *dtype*.
- No hay evaluación de robustez, equidad ni transferencia de dominio; la model card lo declara explícitamente.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de interpretar erróneamente las salidas de un modelo sin entrenar como predicciones válidas.
- Sin idiomas declarados ni contexto definido: no es un modelo de lenguaje.
- Implementación personalizada: requiere adaptador explícito para cargarse con APIs automáticas; puede romper con versiones futuras de PyTorch o de `transformers`.
- Licencia MIT permite uso comercial del código y los pesos, pero la model card advierte de revisar por separado los términos de los datos de origen si se emplean datasets externos.
- Nomenclatura ambigua: existen otros repositorios con el mismo nombre `simple-classification` (por ejemplo, `ai-ar/simple-classification`, basado en DistilBERT para clasificación de texto e IMDb), sin relación con este.
- Para producción: no usar hasta realizar un *fine-tuning* real, documentar el split, las semillas y el entorno, y publicar métricas propias por separado de los valores por defecto del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wernerlea/simple-classification
- Ficheros del repositorio: https://huggingface.co/wernerlea/simple-classification/tree/main (incluye `finetune.py`, `config.json`, `training_args.json`, `model.safetensors`, `README.md`)
- Perfil del autor: https://huggingface.co/wernerlea
- Modelo homónimo no relacionado (clasificación de texto con DistilBERT): https://huggingface.co/ai-ar/simple-classification
- Documentación de Simple Transformers para clasificación (referencia de tooling, no del modelo): https://github.com/ThilinaRajapakse/simpletransformers/blob/master/docs/_docs/04-classification-specifics.md
- Paper y repositorio de DeiT original: no disponible en la información proporcionada.
