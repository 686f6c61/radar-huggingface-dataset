# Vincent2025hello/u0_openvla

## Resumen

El modelo `u0_openvla` es un modelo de tipo Vision-Language-Action (VLA) con 7.541.237.184 parámetros (aprox. 7,5B), publicado por Vincent2025hello como baseline del paper "USIM and U0: A Vision-Language-Action Dataset and Model for General Underwater Robots" (Junwen Gu et al., 2025). Se trata de un fine-tuning del modelo OpenVLA-7B sobre el dataset USIM, orientado al control del robot submarino U0 (basado en BlueROV2). El modelo resuelve el problema de generar acciones de control de bajo nivel (posiciones de articulaciones y PWM de propulsores) a partir de imágenes de cámaras ego y wrist, un estado del robot de 29 dimensiones y una instrucción en lenguaje natural. Su relevancia radica en que es un punto de partida para la robótica submarina generalista, un área con pocos modelos VLA públicos. La arquitectura es la de OpenVLA-7B (Prismatic), con un encoder de visión SigLIP y un LLM Vicuña v1.5 como base. La longitud de contexto no se especifica en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en OpenVLA-7B (Prismatic: encoder de visión SigLIP + LLM Vicuña v1.5) |
| Parámetros totales | 7.541.237.184 (aprox. 7,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en bf16) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de OpenVLA-7B, que combina un encoder de visión SigLIP y un LLM Vicuña v1.5 (checkpoint Prismatic). Para el fine-tuning se ha utilizado el método sandwich: el LLM queda congelado, mientras que los encoders de visión, el proyector y las capas de salida del LLM son entrenables. El entrenamiento se realizó durante 22.000 pasos (aproximadamente 2 épocas), con un batch global de 64 y 2 GPUs, sobre el dataset USIM (`Vincent2025hello/usim`) y con la configuración `usim-sandwich+mx-usim_dataset`. El dataset contiene datos de robótica submarina para el robot U0. No se especifican innovaciones técnicas adicionales más allá del propio fine-tuning.

## Capacidades

- Generación de acciones de control de 13 dimensiones (posiciones de articulaciones y PWM de propulsores) en un solo paso.
- Procesamiento multimodal de imágenes de cámaras ego y wrist, estado del robot (29 dimensiones) e instrucciones en lenguaje natural.
- Control del robot submarino U0 (BlueROV2) para tareas de navegación o manipulación.
- No soporta generación de texto libre, tool calling ni agentes: es un modelo de política de control.
- Capacidad de fine-tuning ligero gracias a la arquitectura OpenVLA (sandwich), lo que permite adaptarlo a otros robots.
- No se especifican capacidades de visión generativa, audio o thinking mode.

## Casos de uso

- Inspección de infraestructuras submarinas: el modelo puede recibir una orden como "inspeccionar la tubería" junto con las imágenes de las cámaras y el estado del ROV, y generar los comandos de propulsores para desplazarse de forma autónoma.
- Manipulación de objetos en entornos submarinos: a partir de la imagen de la cámara del brazo, el modelo genera las posiciones objetivo de las articulaciones para tareas de agarre o manipulación.
- Navegación autónoma en acuicultura: el modelo puede controlar un ROV para recorrer jaulas de acuicultura siguiendo instrucciones en lenguaje natural, gracias a la entrada de estado con DVL e IMU.
- Recogida de muestras en oceanografía: el modelo puede posicionar el robot en puntos de muestreo basándose en descripciones textuales y en la información de profundidad y presión.
- Búsqueda y rescate submarino: el modelo puede explorar áreas siguiendo instrucciones del operador, combinando las imágenes de las cámaras con el estado del robot.
- Despliegue en sistemas robóticos reales: el repositorio oficial incluye un servicio HTTP compatible con GR00T, lo que permite integrar el modelo en pipelines de control de robots.
- Fine-tuning para nuevos ROVs: gracias a la arquitectura OpenVLA y al método sandwich, el modelo puede adaptarse a otros robots submarinos con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: ~16-20 GB (pesos de 15,1 GB más activaciones y overhead).
- Con cuantización de 8 bits: ~8-10 GB; con 4 bits: ~4-6 GB (no se proporcionan cuantizaciones oficiales).
- GPU recomendada: A100 40GB, H100 80GB o RTX 4090 24GB para inferencia en bf16.
- Puede ejecutarse en GPUs de consumo como RTX 4090 (24 GB), aunque con margen limitado para batch grande.
- Opciones de despliegue: HuggingFace transformers (formato nativo) y el servicio HTTP GR00T-compatible del repositorio oficial.
- No se especifican latencia ni throughput.

## Comparativa con modelos similares

El modelo es un fine-tuning de OpenVLA-7B, por lo que comparte arquitectura y tamaño. No se dispone de datos de otros modelos comparables en la información proporcionada.

| Modelo | Parámetros | Dominio | Licencia | Formato |
|---|---|---|---|---|
| u0_openvla | 7.541.237.184 | Robótica submarina | MIT | safetensors |
| openvla-7b | 7B (aprox.) | Manipulación robótica general | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación sin validación en producción (0 descargas, 0 likes).
- No se documentan sesgos específicos, pero al ser un VLA, puede generar acciones incorrectas si las imágenes o instrucciones son ambiguas.
- Riesgo de alucinación en el sentido de acciones no deseadas ante entradas fuera de la distribución del dataset USIM.
- Limitaciones de contexto: la longitud de contexto no se especifica.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el dataset esté en inglés.
- El modelo emite una única acción por pasada, por lo que requiere un bucle de control externo para operar en tiempo real.
- El fine-tuning desde el modelo base OpenVLA requiere acceso gated a Llama-2, lo que puede dificultar la reproducibilidad, aunque el checkpoint incluye los tokenizer.
- La licencia MIT permite uso comercial, pero se debe citar el paper original y respetar las licencias de los componentes (OpenVLA, dataset USIM).

## Enlaces

- HuggingFace: https://huggingface.co/Vincent2025hello/u0_openvla
- Paper (arXiv): https://arxiv.org/abs/2510.07869
- Repositorio del framework: https://github.com/VincentGu2000/u0-openvla
- OpenVLA (GitHub): https://github.com/openvla/openvla
- OpenVLA (web): https://openvla.github.io/
