# ununununununununununununununununununun/vit-base-breast-cancer-phi-lattice-v2

## Resumen

`vit-base-breast-cancer-phi-lattice-v2` es un Vision Transformer (ViT) de 85,8 millones de parámetros para clasificación de imágenes de cáncer de mama, derivado por fine-tuning del modelo `Falah/vit-base-breast-cancer` y posteriormente cuantizado con un esquema propietario denominado `phi-lattice-v2`. Lo publica el usuario de Hugging Face `ununununununununununununununununununun` bajo licencia Apache 2.0. El modelo se distribuye en dos formatos: pesos estándar en safetensors para cargar directamente con `transformers`, y un archivo empaquetado en 4 bits (`uint8`) de 45,7 MB que reduce el tamaño del repositorio en un factor de 7,16x respecto a FP32.

La relevancia del proyecto es fundamentalmente metodológica: la model card documenta una comparación a cuatro bandas entre FP32, cuantización uniforme estándar, `phi-lattice v1` y `phi-lattice v2`, midiendo SQNR de pesos y MSE de logits a 4 y 3 bits. Según esos datos, la variante v2 mejora la cuantización uniforme en SQNR (19,51 dB frente a 18,87 dB a 4 bits) y reduce el error de logits a 3 bits en un factor de 4,5x, manteniendo un 100 % de acuerdo Top-1 con FP32.

No obstante, conviene ser prudente: el modelo no tiene descargas ni interacciones, la model card no documenta el dataset de entrenamiento, el procedimiento de fine-tuning ni métricas clínicas (sensibilidad, especificidad, AUC) sobre conjuntos de validación independientes. Es un artefacto de investigación sobre compresión de modelos, no un dispositivo médico validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base) |
| Parámetros totales | 85.800.194 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; resolución de entrada no disponible) |
| Tipos de cuantización | FP32 (referencia), 4 bits empaquetado en `uint8`, 3 bits (evaluado, no empaquetado) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (FP32) y `vit_phi_v2_packed_4bit.pt` (4 bits empaquetado, 45,7 MB) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tamaño Base (ViT-Base), con 85,8 millones de parámetros, adaptado a clasificación binaria o multiclase de imágenes médicas de mama mediante fine-tuning sobre el checkpoint `Falah/vit-base-breast-cancer`. El pipeline declarado en Hugging Face es `image-classification`. No se especifica en la información disponible la resolución de entrada, el número de parches, la dimensión de embedding ni el número de capas y cabezas de atención, aunque por el recuento de parámetros corresponde a la configuración estándar de ViT-Base.

El entrenamiento original (dataset, número de imágenes, composición, aumento de datos, número de épocas, función de pérdida) no está documentado en la model card. Tampoco se indica si hubo validación clínica, partición por paciente para evitar fuga de datos ni calibración de umbrales. La innovación técnica destacable no está en el entrenamiento sino en la compresión: el pase `phi-lattice-v2` es un esquema de cuantización multidimensional que asigna los pesos a una retícula no uniforme, optimizada para minimizar simultáneamente el error de cuantización de pesos (SQNR) y el error de logits. La model card reporta que a 4 bits se alcanza 19,51 dB de SQNR y 0,00028 de MSE de logits, y a 3 bits 12,77 dB y 0,00134 respectivamente, con acuerdo Top-1 del 100 % frente a FP32 en los cuatro métodos comparados.

## Capacidades

- Clasificación de imágenes médicas de mama (pipeline `image-classification`).
- Inferencia en precisión completa (FP32) mediante `AutoModelForImageClassification.from_pretrained`.
- Inferencia con pesos empaquetados en 4 bits (45,7 MB), pensada para despliegues con memoria limitada.
- Cuantización adicional a 3 bits evaluada en la model card, aunque no se distribuye un archivo empaquetado a 3 bits.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la clasificación visual.
- No dispone de modo thinking, visión general, audio ni procesamiento de lenguaje natural.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Triaje preliminar en pipelines de investigación oncológica**: el modelo puede incorporarse como clasificador de primera etapa en un flujo de análisis de imágenes histológicas o mamográficas, etiquetando estudios para revisión prioritaria por un especialista. Su tamaño (85,8 M de parámetros) permite ejecutarlo en CPU o GPU de gama baja dentro de un servidor de laboratorio.
- **Prototipado rápido en entornos con poca VRAM**: gracias al archivo empaquetado de 45,7 MB, se puede desplegar en dispositivos edge, Raspberry Pi o GPUs de 4 GB para experimentos de validación de concepto sin necesidad de infraestructura dedicada.
- **Evaluación de técnicas de cuantización**: el repositorio sirve como caso de estudio reproducible para comparar `phi-lattice-v2` frente a cuantización uniforme, midiendo SQNR, MSE de logits y acuerdo Top-1 con FP32 sobre un modelo de visión real.
- **Generación de datasets etiquetados a escala**: en un entorno de investigación, el modelo puede preetiquetar grandes volúmenes de imágenes para su posterior revisión humana, reduciendo el coste de anotación manual en estudios retrospectivos.
- **Integración en notebooks docentes o tutoriales de ML médico**: por su licencia Apache 2.0 y su reducido tamaño, es adecuado para material formativo sobre fine-tuning de ViT y compresión de modelos.
- **Benchmark de robustez de clasificadores médicos comprimidos**: permite estudiar cómo afecta la cuantización agresiva (3 y 4 bits) a las predicciones en clases minoritarias o casos límite, un aspecto crítico antes de considerar cualquier despliegue clínico.

## Benchmarks y rendimiento

La model card incluye una comparación de cuantización, no de rendimiento clínico. Los datos reportados son:

| Método | Tamaño empaquetado | SQNR pesos 4 bits | MSE logits 4 bits | SQNR pesos 3 bits | MSE logits 3 bits | Acuerdo Top-1 vs FP32 |
|---|---|---|---|---|---|---|
| Baseline FP32 | 327,3 MB | Referencia | 0,00000 | Referencia | 0,00000 | 100,0 % |
| Cuantización uniforme | 45,7 MB | 18,87 dB | 0,00033 | 11,80 dB | 0,00603 | 100,0 % |
| `phi-lattice v1` | 45,7 MB | 18,60 dB | 0,00047 | 12,52 dB | 0,00143 | 100,0 % |
| `phi-lattice v2` (este repo) | 45,7 MB (7,16x menor) | 19,51 dB | 0,00028 | 12,77 dB | 0,00134 | 100,0 % |

No se han publicado resultados de benchmarks clínicos (exactitud, sensibilidad, especificidad, AUC, F1) ni comparaciones con otros modelos de clasificación de cáncer de mama en la información disponible.

## Requisitos de hardware

- **VRAM en FP32**: aproximadamente 343 MB para los pesos (85,8 M × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB para inferencia por lotes pequeños.
- **VRAM en 4 bits empaquetado**: los pesos ocupan 45,7 MB, aunque requieren descompresión en memoria o un kernel de inferencia específico; el consumo efectivo dependerá de la implementación.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente para FP32 en lotes pequeños; RTX 3060, RTX 4090, A100 y H100 funcionan sin problema. El modelo también puede ejecutarse en CPU.
- **GPU de consumo**: sí, cabe holgadamente en cualquier GPU de consumo moderna (GTX 1650 en adelante) e incluso en iGPU con memoria compartida suficiente.
- **Opciones de despliegue**: `transformers` con `AutoModelForImageClassification`; el archivo `vit_phi_v2_packed_4bit.pt` requiere código de descompresión propio no incluido en el repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a ViT).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vit-base-breast-cancer-phi-lattice-v2` (este) | 85,8 M | no disponible | FP32 + 4 bits empaquetado | Apache 2.0 | Hugging Face, 0 descargas |
| `Falah/vit-base-breast-cancer` (base) | 85,8 M (aprox.) | no disponible | FP32 | no disponible en la información | Hugging Face |
| ViT-Base estándar (Google) | 86 M | 224×224 px típicamente | FP32, INT8 | Apache 2.0 | Amplia, múltiples repositorios |
| ResNet-50 (clasificación de imagen médica) | 25,6 M | 224×224 px típicamente | FP32, INT8 | BSD-3 / Apache 2.0 según implementación | Muy amplia |

La comparación con alternativas específicas de clasificación de cáncer de mama no está disponible en la información proporcionada. El modelo base `Falah/vit-base-breast-cancer` es el referente directo, pero no se han podido verificar sus métricas ni su licencia a partir de los datos facilitados.

## Limitaciones y advertencias

- **No es un dispositivo médico**: no hay validación clínica, certificación regulatoria (CE, FDA) ni métricas de sensibilidad y especificidad sobre cohortes independientes. No debe usarse para diagnóstico ni para decisiones terapéuticas.
- **Riesgo de sesgo**: al no documentarse el dataset de entrenamiento, se desconoce la distribución demográfica, el tipo de imagen (mamografía, histopatología, ecografía) y la representación de subgrupos poblacionales. Esto impide evaluar sesgos por edad, etnia o tipo de tejido.
- **Riesgo de alucinación / falsos positivos y negativos**: en clasificación médica, los errores tienen consecuencias directas; la cuantización a 3 bits, aunque reporta bajo MSE de logits, no garantiza calibración de probabilidades.
- **Falta de documentación**: no se especifican la resolución de entrada, el preprocesado, el número de clases ni el significado de las etiquetas de salida, lo que dificulta la reproducibilidad.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el uso clínico.
- **Madurez del repositorio**: 0 descargas, 0 likes, creado y actualizado el mismo día (2026-11-04), sin historial de mantenimiento ni issues.
- **Formato empaquetado**: el archivo `vit_phi_v2_packed_4bit.pt` no es directamente cargable con `transformers`; requiere código de descompresión no incluido, lo que limita su uso inmediato.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ununununununununununununununununununun/vit-base-breast-cancer-phi-lattice-v2
- Modelo base: https://huggingface.co/Falah/vit-base-breast-cancer
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
