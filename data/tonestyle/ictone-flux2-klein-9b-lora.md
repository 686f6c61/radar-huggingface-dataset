# ToneStyle/ICTone-FLUX2-Klein-9B-LoRA

## Resumen

ICTone-FLUX2-Klein-9B-LoRA es un adaptador LoRA de rango 256 publicado por ToneStyle que se aplica sobre el modelo base de difusión black-forest-labs/FLUX.2-klein-9B. Su función es la transferencia de color, tono, contraste y estilo fotográfico desde una imagen de referencia a una imagen de contenido, preservando la escena, los objetos, la composición y los detalles finos de esta última. El adaptador se distribuye como un único fichero de pesos en BF16 de aproximadamente 0,9 GB, fusionado a partir de tres partes binarias divididas y validado con un SHA256 público.

El modelo se enmarca en la categoría image-to-image y se integra en el ecosistema Diffusers mediante la clase `Flux2KleinPipeline`. A diferencia de otros adaptadores de estilo, requiere dos imágenes de condicionamiento simultáneas: primero la de contenido y después la de referencia, ambas redimensionadas de forma independiente y alineadas a múltiplos de 16 píxeles. La inferencia publicada por el autor funciona con 4 pasos, guidance_scale de 1.0 y una longitud máxima de secuencia de 512, lo que indica un diseño orientado a generación rápida y a transferencia de tono más que a síntesis desde cero.

La relevancia del adaptador radica en su especialización: no pretende ser un modelo generalista, sino una herramienta acotada para igualar la paleta y el carácter fotográfico entre dos imágenes con un coste computacional bajo. Al depender del modelo base FLUX.2-klein-9B, hereda sus restricciones de acceso y licencia, y el autor advierte explícitamente de que las condiciones de uso del modelo base son aplicables al adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusión FLUX.2-klein-9B |
| Parametros totales | no disponible (160 tensores en BF16, rango 256) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_sequence_length de inferencia: 512 tokens) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeta a la licencia del modelo base FLUX.2-klein-9B) |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`), librería diffusers |
| Tamano del repositorio | 0,9 GB |
| Pipeline | image-to-image |
| Rango LoRA | 256 |
| Pasos de inferencia recomendados | 4 |
| Guidance scale | 1,0 |
| Resolucion de entrada | redimensionado independiente con lado mayor ~512 px y alineación a 16 px |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 256 aplicado sobre el transformer de difusión FLUX.2-klein-9B. El repositorio contiene 160 tensores en BF16 fusionados a partir de tres partes binarias divididas, con un SHA256 de verificación publicado (`44298415792a8a28f9474c2d845b825964ed5710a33de5b7ea5a6406d75e55be`). No se detalla en la información disponible la composición del dataset de entrenamiento, el número de pasos, la resolución de entrenamiento ni si se emplearon técnicas de regularización o aumentación de datos.

La innovación funcional del adaptador es el condicionamiento dual: el pipeline recibe una lista de dos imágenes en la que la primera actúa como contenido y la segunda como referencia de estilo. El prompt de inferencia publicado instruye explícitamente al modelo a transferir color, tono, contraste y estilo fotográfico de la imagen 2 a la imagen 1, preservando composición y detalles de la primera. El ejemplo oficial usa `Flux2KleinPipeline` con `enable_model_cpu_offload()` para reducir el uso de VRAM, y el proyecto ICTone ofrece además reconstrucción 3D LUT a resolución original, inferencia por lotes y sharding multi-GPU mediante su script `inference_klein.py`.

## Capacidades

- Transferencia de color, tono, contraste y estilo fotográfico entre una imagen de referencia y una imagen de contenido.
- Preservación de la escena, los objetos, la composición y los detalles finos de la imagen de contenido.
- Procesamiento de dos imágenes de entrada con dimensiones independientes; no es necesario que compartan tamaño.
- Generación en 4 pasos de inferencia con guidance_scale de 1.0, orientada a baja latencia.
- Salida a la resolución de la imagen de contenido redimensionada (lado mayor ~512 px por defecto, alineado a 16 px).
- Compatibilidad con el ecosistema Diffusers y con carga de pesos LoRA mediante `load_lora_weights`.
- Soporte en el proyecto ICTone de reconstrucción 3D LUT a resolución original, inferencia por lotes y sharding multi-GPU.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; el adaptador es específico de transferencia de tono.

## Casos de uso

- Igualado de color en postproducción fotográfica: el adaptador permite aplicar la paleta y el carácter tonal de una fotografía de referencia a una serie de imágenes de contenido, manteniendo la composición original y reduciendo el trabajo manual de corrección de color.
- Coherencia visual en catálogos de producto: se puede unificar el tono de fotografías tomadas en condiciones de iluminación distintas usando una imagen maestra como referencia, lo que resulta adecuado por su bajo coste de inferencia a 4 pasos.
- Armonización de material de archivo: para digitalizaciones o escaneos con dominantes de color, el adaptador transfiere el tono de una referencia corregida sin alterar el contenido de la escena.
- Previsualización rápida en pipelines de edición: al ejecutarse con 4 pasos y resolución moderada, encaja en flujos de revisión iterativa donde se necesita una aproximación de color antes del ajuste final.
- Integración en herramientas de retoque con Diffusers: al cargarse como LoRA sobre `Flux2KleinPipeline`, puede incorporarse a aplicaciones Python existentes que ya usan el modelo base, reutilizando la infraestructura de offload y gestión de memoria.
- Reconstrucción de LUT para vídeo o imagen final: el proyecto ICTone permite generar una LUT 3D a partir del resultado y aplicarla a la resolución original, lo que sirve para escalar el ajuste de tono a material de mayor tamaño.
- Experimentación en investigación sobre transferencia de estilo: el condicionamiento dual contenido/referencia y el rango 256 documentado ofrecen una base reproducible para estudiar adaptadores de bajo rango en modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el ejemplo oficial usa `enable_model_cpu_offload()` para reducir el consumo, lo que sugiere que la inferencia completa en GPU puede superar la capacidad de tarjetas de consumo.
- GPU recomendadas: no se especifican modelos concretos; se requiere una GPU CUDA con soporte BF16.
- Cabe en GPU de consumo: no confirmado; el offload a CPU del ejemplo sugiere que en GPUs de consumo podría ser necesario el offload o la ejecución parcial en CPU.
- Software: Python 3.10, torch 2.8.0, diffusers 0.39.0, transformers 4.57.6, accelerate 1.12.0, peft 0.18.0, huggingface-hub 0.36.0, safetensors 0.8.0, Pillow 11.1.0, sentencepiece y protobuf.
- Opciones de despliegue: Diffusers con `Flux2KleinPipeline` y `load_lora_weights`; el proyecto ICTone incluye scripts propios (`inference_klein.py`) con soporte de batch y multi-GPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la configuración publicada de 4 pasos con guidance_scale 1.0 apunta a una inferencia ligera, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables de transferencia de tono para FLUX.2-klein-9B ni de datos de rendimiento que permitan una comparación rigurosa. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ICTone-FLUX2-Klein-9B-LoRA | no disponible (LoRA rango 256, 160 tensores BF16) | no disponible (max_sequence_length 512 en inferencia) | no disponible | no disponible (sujeta al modelo base) | Hugging Face, 1 descarga, 0 likes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El adaptador depende del acceso a `black-forest-labs/FLUX.2-klein-9B`; es necesario aceptar los términos del modelo base y autenticarse con `hf auth login`.
- La licencia del adaptador no está declarada de forma independiente; el autor indica que se aplican las condiciones de licencia del modelo base, por lo que el uso comercial queda supeditado a dichas condiciones.
- El ejemplo oficial limita la entrada a un lado mayor de ~512 píxeles tras el redimensionado; la salida se genera a esa resolución y requiere la reconstrucción de LUT del proyecto ICTone para trabajar a resolución original.
- Solo se documenta la inferencia en BF16; no hay información sobre cuantizaciones que permitan reducir requisitos de memoria.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de fidelidad de color más allá de la validación del autor.
- No hay información sobre idiomas soportados ni sobre el comportamiento del prompt en lenguas distintas del inglés; el prompt publicado está en inglés.
- El repositorio es muy reciente y con una única descarga y cero likes, por lo que no existe validación independiente de la comunidad.
- La integridad del fichero debe verificarse con el SHA256 publicado antes de su uso en producción.
- No se documentan limitaciones específicas de contexto ni de razonamiento porque el adaptador no es un modelo de lenguaje, sino un módulo de transferencia de tono sobre un modelo de difusión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ToneStyle/ICTone-FLUX2-Klein-9B-LoRA
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ToneStyle/ICTone-Klein-9B
- Código del proyecto ICTone: https://github.com/dengyuhai/ICTone
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
