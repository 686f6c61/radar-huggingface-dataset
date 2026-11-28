# TalasCloud/MOSS-Refined-Realism-v3-Q8_0-GSQ-RCO-GGUF

## Resumen

MOSS Refined Realism v3 Q8_0 GSQ-RCO es una cuantizacion GGUF del checkpoint de generacion de imagenes Refined Realism v3.0 de oreolove, construida sobre la arquitectura MOSS-Image de OpenMOSS. El modelo original es un checkpoint de difusion de 8 pasos orientado a la generacion de imagenes fotorrealistas, y esta version lo empaqueta en formato Q8_0 con calibracion especifica para hardware AMD Polaris (Radeon RX 580) mediante Vulkan. Lo publica el usuario TalasCloud, que mantiene un pipeline de conversion GGUF propio.

El interes practico de esta ficha es acotado: no se trata de un modelo de lenguaje, sino de un modelo de difusion texto-a-imagen cuantizado para inferencia local en GPUs de gama baja con 8 GB de VRAM. Su relevancia radica en que demuestra un flujo de cuantizacion GGUF aplicado a un modelo de difusion con calibracion por error de proyeccion, algo poco habitual en el ecosistema, y en que permite ejecutar un checkpoint de 5.082 millones de parametros en una RX 580.

La informacion disponible es limitada: la model card esta redactada en ingles y ruso, no declara idiomas soportados ni resultados de benchmarks de calidad de imagen, y la licencia es una licencia de permisos de creador de Civitai con restricciones. Todo dato no presente en la informacion proporcionada se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (MOSS-Image, base OpenMOSS-Team/MOSS-Image-SFT); layout de tensores Q8_0 x 185, F32 x 193 |
| Parametros totales | 5.082.308.608 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen) |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado); calibracion GSQ/RCO sobre Vulkan |
| Idiomas soportados | no disponible (el prompt de texto depende del text encoder compatible, no declarado) |
| Licencia | civitai-creator-permissions (license: other) |
| Formato de pesos | GGUF (5.401.115.648 bytes, 5,40 GB); VAE companion en safetensors FP32 |
| Pasos de inferencia | 8 pasos (checkpoint de 8-step) |
| SHA-256 | 6778ae34feb1a294e3efcbe8120eb345a11514fa615356e323684beb0e522a91 |
| Hardware objetivo | Windows, AMD Radeon RX 580 2048SP (Polaris, 8 GB), Intel Xeon E5-2696 v3 (Haswell, AVX2) |

## Arquitectura y entrenamiento

El modelo es un checkpoint de difusion para generacion de imagenes, derivado de MOSS-Image-SFT de OpenMOSS y refinado por oreolove como Refined Realism v3.0 en BF16 con muestreo de 8 pasos. No es un transformer autoregresivo ni un modelo de lenguaje: la model card lo describe explicitamente como "MOSS diffusion model" que requiere un text encoder, tokenizador y VAE compatibles de MOSS. El VAE se distribuye por separado como MOSS-Image-VAE-FP32-Safetensors.

La innovacion tecnica de esta publicacion concreta es el proceso de cuantizacion: el checkpoint BF16 original se convirtio a GGUF Q8_0 y se calibro con GSQ/RCO sobre Vulkan para el hardware objetivo. El autor reporta una reduccion del error de proyeccion de 9.209 a 8.958 sobre la muestra de trabajo registrada, y senala que la build publicada conserva los cambios de proyeccion que redujeron el error medido, difiriendo del candidato inicial con todas las proyecciones. No se detalla la composicion del dataset de entrenamiento original, el numero de tokens ni si hubo etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen con muestreo de 8 pasos.
- Orientacion a fotorrealismo ("Refined Realism"), segun la denominacion del checkpoint base.
- Inferencia local en GPU AMD Polaris mediante backend Vulkan.
- Ejecucion en entornos de 8 GB de VRAM gracias a la cuantizacion Q8_0.
- Integracion en el pipeline de medios de koboldcpp (runtime koboldcpp-media-pipeline).
- Requiere componentes externos: text encoder, tokenizador y VAE compatibles con MOSS.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- Capacidades multilingues del prompt: no disponibles (dependen del text encoder, no declarado).
- No dispone de modo thinking, vision de entrada ni audio.

## Casos de uso

- Generacion de imagenes fotorrealistas en equipos de gama baja: el modelo permite producir imagenes con 8 pasos de muestreo en una RX 580 de 8 GB, un escenario donde la mayoria de checkpoints de difusion de este tamano no caben sin cuantizar.
- Prototipado local sin conexion: al ejecutarse sobre Vulkan en Windows con un runtime local, sirve para iterar prompts y estilos sin depender de servicios en la nube ni de tarjetas NVIDIA.
- Pruebas de pipelines de cuantizacion: el flujo GSQ/RCO con metrica de error de proyeccion es util como referencia para quien quiera cuantizar otros modelos de difusion a GGUF y medir la degradacion.
- Renderizado por lotes en estaciones de trabajo antiguas: con un Xeon E5-2696 v3 y una Polaris, se puede montar un nodo de generacion de imagenes de bajo coste para tareas internas.
- Generacion de material visual para entornos controlados: la licencia de permisos de creador de Civitai condiciona el uso, por lo que encaja en proyectos personales o internos que respeten esos terminos.
- Evaluacion comparativa de calidad Q8_0 frente a BF16: permite medir en la practica cuanto pierde un checkpoint de difusion al pasar de BF16 a Q8_0 con calibracion, usando el error de proyeccion reportado como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. El unico dato de rendimiento reportado es la metrica interna de calibracion:

| Metrica | Valor |
|---|---|
| Error de proyeccion (antes de calibracion) | 9.209 |
| Error de proyeccion (tras calibracion GSQ/RCO) | 8.958 |
| Tamano del GGUF | 5,40 GB (5.401.115.648 bytes) |
| Pasos de muestreo | 8 |

## Requisitos de hardware

- VRAM estimada: en torno a 8 GB para el difusor en Q8_0, segun el hardware objetivo declarado (RX 580 2048SP de 8 GB); el VAE y el text encoder anaden consumo adicional no cuantificado en la informacion disponible.
- GPU recomendadas por el autor: AMD Radeon RX 580 2048SP (Polaris). No se mencionan otras GPU.
- Cabe en GPU de consumo: si, al menos en la RX 580 de 8 GB citada; no se confirma compatibilidad con otras consumer GPU.
- CPU de referencia: Intel Xeon E5-2696 v3 (Haswell, AVX2).
- Sistema operativo objetivo: Windows.
- Opciones de despliegue: koboldcpp con el runtime koboldcpp-media-pipeline (release v2026.11.17-r5) y backend Vulkan. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Pasos | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| MOSS Refined Realism v3 Q8_0 (esta ficha) | 5.082 M | GGUF Q8_0 | 8 | civitai-creator-permissions | RX 580 8 GB, Vulkan |
| Refined Realism v3.0 BF16 (oreolove) | no disponible | BF16 | 8 | civitai-creator-permissions | no disponible |
| OpenMOSS-Team/MOSS-Image-SFT (base) | no disponible | safetensors | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar la calidad de salida frente a alternativas de la misma categoria; la comparativa se limita a formato, licencia y hardware.

## Limitaciones y advertencias

- Contenido marcado como "not-for-all-audiences": el modelo puede generar material no apto para todo publico.
- Licencia civitai-creator-permissions: impone restricciones de uso derivadas de los permisos del creador en Civitai; es imprescindible revisar los terminos antes de cualquier uso comercial o redistribucion.
- No es un modelo de lenguaje: no admite instrucciones conversacionales, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Dependencia de componentes externos no incluidos: se necesitan text encoder, tokenizador y VAE compatibles con MOSS; sin ellos el GGUF no es utilizable.
- Calibracion especifica para un hardware concreto (RX 580, Vulkan): el rendimiento y la fidelidad pueden variar en otras GPU o backends.
- La metrica de error de proyeccion es una medida de ajuste de calibracion, no una garantia de calidad visual; no se aportan evaluaciones perceptuales.
- Riesgo de artefactos y sesgos propios del checkpoint de difusion original: no se documentan sesgos conocidos en la informacion disponible.
- Idiomas del prompt no declarados; el comportamiento multilingue depende del text encoder empleado.
- Repositorio con 199 descargas y 0 likes: validacion comunitaria muy baja, sin evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/TalasCloud/MOSS-Refined-Realism-v3-Q8_0-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- VAE companion: https://huggingface.co/TalasCloud/MOSS-Image-VAE-FP32-Safetensors
- Checkpoint original en Civitai: https://civitai.red/models/3013588?modelVersionId=3457856
- Repositorio del conversor GGUF: https://github.com/aktalascloud/gguf-converter
- Datos de calibracion: https://github.com/aktalascloud/gguf-converter/blob/v1.9.0/benchmarks/2026-11-17-whole-gsq-rco-rx580.json
- Runtime de medios koboldcpp: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
