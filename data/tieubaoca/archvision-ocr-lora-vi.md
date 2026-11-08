# tieubaoca/ArchVision-OCR-LORA-vi

## Resumen

ArchVision-OCR-LORA-vi es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario tieubaoca en Hugging Face, entrenado sobre el modelo base PaddlePaddle/PaddleOCR-VL-1.6. Su propósito es especializar las capacidades de reconocimiento óptico de caracteres del modelo base en vietnamita, incluyendo texto manuscrito y tablas en formato OTSL (Open Table Structure Language). El repositorio se distribuye como un adaptador PEFT en formato safetensors, no como un modelo completo.

El modelo se enmarca en la familia PaddleOCR-VL, una línea de modelos vision-language orientados a OCR y comprensión de documentos. Al tratarse de un adaptador, su huella de almacenamiento es mínima (el repositorio reporta 0.0 GB), lo que lo hace atractivo para equipos que ya despliegan el modelo base y quieren añadir capacidades específicas de vietnamita sin reentrenar ni sustituir el modelo principal.

La relevancia actual del proyecto es limitada pero concreta: cubre un nicho poco atendido como es el OCR de documentos vietnamitas, incluyendo escritura manual y extracción estructurada de tablas. No obstante, el acceso está restringido (gated), no se declara licencia y no hay métricas publicadas, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo vision-language (PaddleOCR-VL-1.6); arquitectura interna del base no disponible |
| Parametros totales | no disponible (el adaptador LoRA no declara recuento; el base no se especifica) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | PaddlePaddle/PaddleOCR-VL-1.6 |
| Libreria | peft |
| Pipeline | image-to-text |
| Acceso | restringido (gated) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base PaddleOCR-VL-1.6 para ajustar su comportamiento sin modificar los pesos originales. La arquitectura subyacente corresponde por tanto al modelo base, un modelo vision-language de la familia PaddleOCR-VL orientado a tareas de OCR y comprensión de documentos; no se dispone de detalles sobre el número de parámetros, la configuración de capas ni el mecanismo de atención del base en la información proporcionada.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas del adaptador. Los tags del repositorio indican que el entrenamiento se orientó a OCR de escritura manual y a tablas en formato OTSL, pero se desconoce el proceso exacto de curación de datos y la metodología de ajuste.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos.
- OCR de texto manuscrito en vietnamita, según los tags del repositorio.
- Extracción de tablas en formato OTSL (Open Table Structure Language).
- Conversión de imagen a texto (pipeline image-to-text).
- Especialización en vietnamita como único idioma declarado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales adicionales (audio, vídeo): no disponibles.
- Modo thinking explícito: no disponible.

## Casos de uso

- Digitalización de formularios manuscritos en vietnamita: el adaptador puede aplicarse sobre PaddleOCR-VL-1.6 para transcribir documentos escaneados con escritura manual, un escenario frecuente en administraciones y archivos históricos de Vietnam.
- Extracción de tablas de informes financieros: gracias al soporte de OTSL, el modelo puede convertir tablas en imágenes a una representación estructurada apta para su posterior procesamiento en hojas de cálculo o bases de datos.
- Procesamiento de facturas y recibos: integración en pipelines de contabilidad para extraer campos de documentos comerciales vietnamitas, reduciendo la introducción manual de datos.
- Archivística y preservación documental: conversión masiva de fondos escaneados a texto buscable, aprovechando la especialización en vietnamita frente a modelos OCR genéricos.
- Atención al cliente con documentos adjuntos: extracción de datos de imágenes enviadas por usuarios (capturas, fotos de documentos) en flujos de soporte en vietnamita.
- Investigación en OCR multilingüe: uso como punto de comparación o base para estudiar el ajuste LoRA en tareas de OCR de baja resource, dado su carácter de adaptador ligero.
- Despliegue sobre infraestructura existente de PaddleOCR-VL: equipos que ya operan el modelo base pueden incorporar el adaptador para añadir vietnamita sin sustituir su stack.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende íntegramente del modelo base PaddleOCR-VL-1.6, cuyos requisitos no se especifican en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT en safetensors, requiere cargarse junto al modelo base mediante la librería `peft`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| tieubaoca/ArchVision-OCR-LORA-vi | no disponible (adaptador LoRA) | no disponible | vi | no disponible | safetensors (PEFT) |
| PaddlePaddle/PaddleOCR-VL-1.6 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas OCR especializadas en vietnamita | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede limitar la reproducibilidad y la automatización de despliegues.
- Licencia no declarada: no se especifican condiciones de uso comercial, por lo que su empleo en producción conlleva riesgo legal.
- Ausencia de benchmarks: no hay evidencia publicada de calidad de transcripción, tasas de error (CER/WER) ni rendimiento en tablas.
- Dependencia total del modelo base: el adaptador no funciona de forma autónoma y hereda las limitaciones, sesgos y requisitos de PaddleOCR-VL-1.6.
- Cobertura lingüística limitada: solo se declara vietnamita; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación en la transcripción: como modelo generativo image-to-text, puede producir texto plausible pero incorrecto en documentos degradados o de baja resolución.
- Sin información sobre sesgos: no se documentan sesgos conocidos ni evaluaciones de robustez.
- Repositorio con 0 descargas y 1 like: ausencia de validación comunitaria que permita contrastar su calidad real.
- Tamaño de repo reportado de 0.0 GB: conviene verificar que los pesos del adaptador están efectivamente subidos antes de planificar su uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tieubaoca/ArchVision-OCR-LORA-vi
- Árbol de ficheros: https://huggingface.co/tieubaoca/ArchVision-OCR-LORA-vi/tree/main
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
