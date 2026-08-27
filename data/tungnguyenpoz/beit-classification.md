# Tungnguyenpoz/beit-classification

## Resumen

Este repositorio contiene una implementación personalizada de un modelo BEiT (Bidirectional Encoder representation from Image Transformers) orientado a clasificación de imágenes, con una configuración de escala "large". El autor, Tungnguyenpoz, publica el código, la configuración y un checkpoint de inicialización en formato safetensors, pero deja explícito que no se trata de un modelo entrenado ni de un checkpoint con resultados de benchmarks. El objetivo declarado es proporcionar una base reproducible para experimentos y pruebas de humo, no un modelo listo para producción.

El checkpoint incluido tiene únicamente 24.832 parámetros, una cifra extremadamente baja para cualquier arquitectura transformer de visión, lo que confirma que es un peso de inicialización simbólico para validar el flujo de entrenamiento, no un modelo con capacidad real de inferencia. La implementación introduce variaciones sobre el BEiT original, como atención de grupo (grouped query attention), co-atención, activación GELU tanh y normalización por lotes (batch norm). La licencia es MIT, lo que permite uso comercial con atribución, aunque el autor advierte que deben revisarse los términos de los datos externos si se usan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEiT (implementación personalizada, escala large) |
| Parametros totales | 24.832 (checkpoint de inicialización, no entrenado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en BEiT, un transformer de visión preentrenado de forma auto-supervisada mediante enmascaramiento de parches de imagen. En esta implementación concreta, el autor introduce varias modificaciones: atención de grupo (grouped query attention) para reducir el coste computacional, un mecanismo de fusión por co-atención, activación GELU con aproximación tanh y normalización por lotes en lugar de la normalización por capas habitual. La configuración se describe como "large", aunque no se especifican dimensiones exactas (número de capas, cabezas, ancho del modelo) en la información disponible.

El repositorio incluye un script `finetune.py` con una receta de entrenamiento por defecto que usa el optimizador Novograd y un programador de tasa de aprendizaje one-cycle. Sin embargo, el autor aclara que estos son valores de partida y no evidencian un entrenamiento completado. El checkpoint `model.safetensors` es un peso de inicialización válido para pruebas de humo, no un modelo entrenado. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens o pasos de entrenamiento, ya que no existe un entrenamiento real.

## Capacidades

- Clasificación de imágenes: el modelo está diseñado para tareas de clasificación, pero al no estar entrenado, no tiene capacidad real de predicción.
- Extracción de características: podría usarse como backbone para tareas de visión, pero solo tras un entrenamiento o fine-tuning adecuado.
- Reproducibilidad: el código incluye un ejemplo ejecutable y una configuración de arquitectura generada, lo que permite reproducir el flujo de entrenamiento.
- Sin soporte de tool calling, agentes, razonamiento multimodal ni capacidades lingüísticas, al ser un modelo de visión puro.

## Casos de uso

Dado que el checkpoint no está entrenado, no se pueden recomendar casos de uso prácticos en producción. Los únicos escenarios razonables son:

- Validación de infraestructura: ejecutar el script `finetune.py` para comprobar que el entorno de entrenamiento (GPU, librerías, pipeline de datos) funciona correctamente antes de lanzar un entrenamiento real.
- Punto de partida para investigación: usar la implementación como base para experimentar con las variantes arquitectónicas (grouped query attention, co-atención, batch norm) en tareas de clasificación de imágenes.
- Pruebas de integración: verificar que el formato safetensors y la carga del modelo funcionan con herramientas personalizadas o adaptadores.
- Estudio de arquitecturas: analizar el impacto de las modificaciones sobre el BEiT original en términos de coste computacional y rendimiento, siempre que se entrene con un dataset adecuado.
- Desarrollo de adaptadores: dado que la implementación es personalizada, los usuarios pueden escribir adaptadores para integrarla con librerías estándar como Hugging Face Transformers.
- Educación: servir como ejemplo didáctico de cómo estructurar un proyecto de fine-tuning de visión con código transparente y pruebas repetibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en este repositorio. El checkpoint es de inicialización y no ha sido evaluado en ningún conjunto de datos estándar como ImageNet, CIFAR o similar.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplicable, ya que el modelo no está entrenado y el checkpoint tiene solo 24.832 parámetros, lo que cabe en cualquier GPU, incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM sería suficiente para ejecutar el script de prueba, aunque el entrenamiento real de una configuración "large" requeriría GPUs de gama alta (A100, H100, RTX 4090) dependiendo del dataset y la resolución.
- Compatibilidad con GPU de consumo: sí, cualquier GPU moderna puede ejecutar el código de ejemplo.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI. El script `finetune.py` es el punto de entrada principal.
- Latencia y throughput: no disponibles, al no haber un modelo entrenado que medir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tungnguyenpoz/beit-classification | 24.832 (init) | no aplica | sin benchmarks | MIT | Hugging Face |
| microsoft/beit-base-patch16-224 | 86M | 224x224 | ImageNet top-1 ~85.2% | MIT | Hugging Face |
| microsoft/beit-large-patch16-224 | 304M | 224x224 | ImageNet top-1 ~87.2% | MIT | Hugging Face |

La comparativa muestra que el modelo de este repositorio no es comparable en capacidad a los BEiT oficiales, ya que no está entrenado y su tamaño es insignificante. Los modelos de Microsoft son los referentes de la arquitectura BEiT original.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. No debe usarse en producción.
- La implementación es personalizada y no compatible con las APIs genéricas de Hugging Face Transformers sin un adaptador explícito.
- No se proporcionan datos de entrenamiento, por lo que no se puede evaluar la calidad del modelo ni su comportamiento ante sesgos.
- El autor recomienda que cualquier resultado de un futuro checkpoint entrenado se documente por separado de los valores por defecto incluidos.
- La licencia MIT permite uso comercial, pero deben revisarse los términos de los datos externos si se utilizan con conjuntos de datos propietarios.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que el checkpoint es mínimo y no contiene pesos útiles para inferencia real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Tungnguyenpoz/beit-classification
- Repositorio oficial de BEiT (GitHub): https://github.com/KeiTAGUCHI/BEiT
- Documentación de BEiT en Hugging Face Transformers: https://huggingface.co/docs/transformers/model_doc/beit
- Documentación de BEiT (versión antigua): https://huggingface.co/docs/transformers/v4.14.1/en/model_doc/beit
- Ejemplo de BEiT en Qualcomm AI Hub: https://aihub.qualcomm.com/models/beit
- Muestra de clasificación de imágenes con BEiT en QAI AppBuilder: https://github.com/qualcomm/qai-appbuilder/tree/main/samples/ComputerVision/Image_Classification/beit
