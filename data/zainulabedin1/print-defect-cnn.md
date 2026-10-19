# Zainulabedin1/print-defect-cnn

## Resumen

PrintDefectCNN es una red neuronal convolucional pequeña, con 106.000 parámetros, publicada por Zainulabedin1 en Hugging Face. Clasifica una fotografía de una impresión FDM en dos clases: `good print` (sin hilos) y `stringing` (defecto de hilado). Trabaja con imágenes en escala de grises de 64×64 píxeles y se entrenó desde cero en CPU; no es un modelo generativo ni un detector de objetos, sino un clasificador de imagen a nivel de imagen.

El modelo aborda un problema concreto de control de calidad en fabricación aditiva: el stringing deja filamentos finos entre secciones impresas, desperdicia material y exige postprocesado. Su interés práctico está en que ofrece un pipeline reproducible y ligero para triaje automático de fotos, con 95,73% de accuracy y 89,08% de macro F1 en un test agrupado por secuencia de impresión, y con el 100% de recall en la clase defectuosa al umbral por defecto en ese test.

Se publica con licencia CC BY 4.0 y formato PyTorch. Es un proyecto de portfolio orientado a la monitorización de procesos de fabricación aditiva; no sustituye a un sistema de inspección validado y solo cubre el defecto de stringing.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN convolucional pequeña, entrenada desde cero; topología exacta no disponible |
| Parámetros totales | 106.000 (106k) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de imagen de 64×64 píxeles en escala de grises |
| Tipos de cuantización | No disponible; no se documentan versiones cuantizadas |
| Idiomas soportados | No aplica (clasificación de imágenes); la ficha de HF no declara idiomas |
| Licencia | CC BY 4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin`); no se documentan GGUF, safetensors ni ONNX |
| Tarea | Clasificación binaria de imágenes |
| Entrada | Imagen
