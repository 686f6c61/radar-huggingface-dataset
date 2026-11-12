# Wenwu2000/MobileDiffuser-SD3-medium

## Resumen

MobileDiffuser-SD3-medium es un paquete de modelos Core ML derivado de Stable Diffusion 3 Medium, preparado por el usuario Wenwu2000 para ejecutar generación text-to-image directamente en iPhone mediante la app MobileDiffuser. No se trata de un modelo entrenado desde cero, sino de una conversión y redistribución del checkpoint SD3 Medium de Stability AI en un formato optimizado para la Neural Engine (ANE) de Apple, con variantes destiladas de dos y cuatro pasos.

El problema que aborda es la inferencia local de difusión en dispositivos móviles con memoria limitada: el transformer multimodal MMDiT original se divide en varias etapas compatibles con ANE para reducir la presión de activaciones en memoria y evitar terminaciones por OOM en dispositivos de la clase iPhone 15 Pro. El repositorio incluye tanto los bundles `.mlmodelc` listos para usar como los checkpoints `.safetensors` de origen para reproducir o reconvertir la segmentación y cuantización.

La relevancia actual es práctica: permite experimentar con SD3 Medium sin conexión, sin enviar prompts a servicios externos y con latencia controlada por el número de pasos del scheduler (2 o 4). El repositorio ocupa 40,1 GB, no registra descargas ni likes, y no declara licencia propia, por lo que la licencia del modelo base de Stability AI es la referencia aplicable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (Multimodal Diffusion Transformer) de Stable Diffusion 3 Medium, dividido en etapas Core ML; text encoders separados y VAE decoder |
| Parametros totales | no disponible (heredados de stabilityai/stable-diffusion-3-medium; el repositorio no declara recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión text-to-image; no aplica ventana de contexto de LLM) |
| Tipos de cuantizacion | no disponible de forma explícita; los `.mlmodelc` están optimizados para `cpuAndNeuralEngine` y los `.safetensors` permiten reconversión con distintos ajustes de cuantización |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | no disponible en el repositorio; se remite a la licencia upstream de SD3 Medium |
| Formato de pesos | Core ML (`.mlmodelc`) y safetensors (checkpoints destilados de 2 y 4 pasos) |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion 3 Medium, un modelo de difusión latente basado en MMDiT que combina atención sobre tokens de texto e imagen en un transformer multimodal. Este repositorio no entrena ese modelo: parte de dos checkpoints destilados (`sd3-medium-2step.safetensors` y `sd3-medium-4step.safetensors`) que reducen el número de pasos de muestreo a 2 y 4 respectivamente, y los convierte a Core ML dividiendo el MMDiT en varias etapas (`MultiModalDiffusionTransformerStage*.mlmodelc`) más un módulo de condicionamiento, dos text encoders y el decodificador VAE.

La innovación técnica está en la segmentación del grafo y la orientación a `cpuAndNeuralEngine`: al repartir el transformer en etapas ANE-friendly se limita el pico de activaciones vivas, lo que permite ejecutar el pipeline en dispositivos de la clase iPhone 15 Pro sin terminación por memoria. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos detalles corresponden al modelo base y no se reproducen aquí.

## Capacidades

- Generación text-to-image a 512x512, según las notas del repositorio.
- Muestreo con scheduler de 2 pasos y de 4 pasos, seleccionables en la app MobileDiffuser.
- Inferencia 100 % local en iPhone, sin llamadas a servicios remotos.
- Ejecución sobre Neural Engine mediante el runtime `cpuAndNeuralEngine`.
- Reproducibilidad y reconversión: los checkpoints safetensors permiten regenerar los bundles con otra segmentación o cuantización.
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking; es un modelo de difusión, no un LLM.
- Cobertura multilingüe de prompts: no disponible en la documentación.

## Casos de uso

- Generación de imágenes offline en iPhone: la app carga `coremlsd3_2step` o `coremlsd3_4step` y ejecuta el pipeline en local, útil en entornos sin conectividad o con requisitos de privacidad estrictos.
- Prototipado de interfaces creativas móviles: desarrolladores que quieran validar flujos de texto a imagen dentro de una app iOS pueden integrar los `.mlmodelc` y medir latencia real en dispositivo antes de invertir en infraestructura de servidor.
- Privacidad de prompts: al no salir los datos del dispositivo, encaja en escenarios donde el prompt o la imagen generada son sensibles y no deben pasar por una API externa.
- Demos y pruebas de campo: con 2 pasos se obtiene una respuesta rápida para iterar prompts en movilidad; con 4 pasos se prioriza calidad sobre latencia.
- Investigación sobre destilación y despliegue móvil: los checkpoints de 2 y 4 pasos permiten estudiar el compromiso entre número de pasos, calidad y consumo en ANE.
- Reutilización del pipeline Core ML: la división en etapas del MMDiT sirve como referencia para portar otros modelos de difusión a Core ML con restricciones de memoria similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Dispositivo objetivo declarado: iPhone de la clase iPhone 15 Pro; la segmentación en etapas busca evitar OOM en esa gama.
- VRAM/unified memory estimada: no disponible de forma numérica; el repositorio indica que la división reduce la presión de activaciones, pero no publica cifras de pico.
- GPU/accelerator: Apple Neural Engine mediante `cpuAndNeuralEngine`; no se documenta soporte para CUDA, ROCm ni otras GPU.
- Compatibilidad con GPU de consumo para escritorio (RTX 4090, A100, H100): no disponible; el formato Core ML está orientado a Apple.
- Opciones de despliegue: app MobileDiffuser sobre Xcode, incluyendo las carpetas `coremlsd3_2step` y `coremlsd3_4step` como recursos del target. No se documenta vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión Core ML).
- Latencia y throughput: no disponibles; dependen del dispositivo y del scheduler de 2 o 4 pasos elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/plataforma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileDiffuser-SD3-medium (este repo) | no disponible (heredados de SD3 Medium) | no aplica | Core ML para iPhone/ANE, safetensors de origen | no disponible en el repo; sujeta a upstream | Hugging Face, 0 descargas |
| stabilityai/stable-diffusion-3-medium | no disponible en esta información | no aplica | safetensors/diffusers | licencia de Stability AI (consultar upstream) | Hugging Face, modelo base |
| Otras conversiones Core ML de SD3 Medium | no disponible | no aplica | Core ML | variable según autor | no disponible en la información |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Resolución limitada a 512x512 según las notas del autor; no se documentan otras resoluciones.
- Licencia no declarada en el repositorio: el uso comercial queda condicionado a la licencia upstream de Stable Diffusion 3 Medium, que debe verificarse antes de producción.
- Repositorio sin descargas ni likes y con fecha de creación futura respecto a la información habitual; madurez y soporte no verificables.
- Dependencia de la app MobileDiffuser y de Xcode para el despliegue; no es un paquete autónomo listo para otros runtimes.
- Riesgo de fallo si los objetos Git LFS no se descargan: los `.mlmodelc` pueden contener punteros en lugar de pesos reales.
- La segmentación está optimizada para dispositivos de la clase iPhone 15 Pro; el comportamiento en gamas inferiores no está documentado y puede provocar OOM.
- No se documentan sesgos, tasas de alucinación visual ni cobertura idiomática de los prompts; deben evaluarse empíricamente.
- El checkpoint de entrenamiento original no está incluido, solo los destilados de 2 y 4 pasos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wenwu2000/MobileDiffuser-SD3-medium
- Modelo base: https://huggingface.co/stabilityai/stable-diffusion-3-medium
