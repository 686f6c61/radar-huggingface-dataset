# t8star/BluePixel-Comfy

## Resumen

BluePixel-Comfy es una conversión para ComfyUI del modelo de edición de imágenes BluePixel-Turbo desarrollado por vivo, empaquetada por el usuario T8star. No es un modelo nuevo entrenado desde cero, sino un reempaquetado de tres componentes independientes (modelo de difusión, codificador de texto y VAE) para su uso nativo en ComfyUI mediante el conjunto de nodos ComfyUI BluePixel T8, que incluye ocho flujos de trabajo de edición sobre lienzo. El objetivo es permitir flujos de edición de imágenes guiados por instrucciones en texto, con soporte de salida hasta 4K (4096×4096), directamente en el ecosistema ComfyUI.

El componente de difusión deriva de FLUX.2 Klein 9B y se ha cuantizado a INT8 con la técnica ConvRot, reduciendo su tamaño a 9,09 GB a costa de una pérdida de precisión respecto al checkpoint BF16 original. El codificador de texto es un Qwen3-8B en BF16 y el VAE es un DCAE-F64 con compresión espacial de 64×, almacenado en FP32. La conversión se validó con 107 pruebas unitarias y ocho rutas de inferencia completas. Su relevancia radica en ofrecer una variante cuantizada y lista para ComfyUI de un modelo de edición de imágenes de alta resolución, aunque con restricciones de licencia no comercial en el componente de difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión tipo FLUX.2 Klein (image-to-image) con codificador de texto Qwen3-8B y VAE DCAE-F64 |
| Parametros totales | no disponible (tamaño total del repo: 28,19 GB en decimal) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 ConvRot (difusión), BF16 (Qwen3-8B), FP32 (DCAE-F64) |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | bluepixel-component-licenses (licencia "other"; el componente de difusión está sujeto a la FLUX Non-Commercial License) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El sistema se compone de tres módulos. El modelo de difusión parte de FLUX.2 Klein 9B y sus pesos se han remapeado al layout nativo de Flux2/Klein, aplicando una cuantización INT8 ConvRot que reduce el archivo a 9,09 GB. El propio autor advierte que la cuantización es con pérdida y que el checkpoint no es equivalente a uno en BF16. El codificador de texto es un Qwen3-8B que conserva su precisión original (BF16) e incluye su tokenizador, y el VAE es un DCAE-F64 (basado en la arquitectura DCAE de NVIDIA) con compresión espacial de 64×, almacenado en FP32; este VAE no es intercambiable por un VAE estándar de Flux2.

En cuanto a entrenamiento, este release no incluye entrenamiento adicional ni LoRA: es una conversión directa de los pesos de `openvivo/BluePixel-Turbo` en el commit `e9c7a641a4bcd9851eef50c1ce9b07fa44f6044c`. No se dispone de información sobre el número de tokens, composición del dataset ni técnicas de alineación del modelo base BluePixel-Turbo. La validación de la conversión incluyó 107 pruebas unitarias, ocho rutas de inferencia completas, una edición 4K real y comparaciones del codificador de texto y del VAE, documentadas en el repositorio de nodos.

## Capacidades

- Edición de imágenes image-to-image guiada por instrucciones en texto (en ingles y chino).
- Edición sobre lienzo mediante ocho flujos de trabajo preconfigurados en el paquete ComfyUI BluePixel T8.
- Generación y edición de imágenes en alta resolución, con salida de ejemplo de 4096×4096 (4K).
- Inferencia rápida tipo turbo: configuración de partida recomendada de 4 pasos con CFG 3.
- Integración nativa con ComfyUI mediante tres nodos BluePixel Loader con salidas estándar compatibles con los nodos de muestreo y VAE de ComfyUI.
- No dispone de capacidades de texto, vision, audio ni tool calling: es un modelo especializado en edición de imágenes.

## Casos de uso

- Edición de fotografias por instrucción: un usuario describe el cambio deseado ("cambia el cielo a atardecer") y el modelo modifica la imagen existente preservando el resto de la escena, gracias a su naturaleza image-to-image.
- Producción de creatividades en alta resolución: el flujo de trabajo 4K permite generar salidas de 4096×4096 directamente, útil para impresión, carteles o fondos de pantalla sin escalado posterior.
- Flujos de trabajo iterativos en ComfyUI: los ocho workflows de lienzo editables permiten encadenar ediciones y ajustar parámetros (pasos, CFG) dentro de un grafo visual, adecuado para diseñadores que ya usan ComfyUI.
- Localización visual de contenidos: al soportar instrucciones en ingles y chino, equipos bilingües pueden editar materiales gráficos con prompts en su idioma.
- Prototipado rápido de ediciones: la configuración turbo (4 pasos, CFG 3) permite previsualizar ediciones en baja resolución (flujo 1K) antes de lanzar la versión 4K final.
- Integración en pipelines de postproducción: los nodos BluePixel Loader exponen salidas estándar de ComfyUI, de modo que el modelo puede combinarse con nodos de upscaling, máscaras o composición en cadenas de procesamiento más amplias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la validación de la conversión (107 pruebas unitarias, ocho rutas de inferencia completas, una edición 4K real y comparaciones de codificador de texto y VAE), pero no incluye métricas de calidad estandarizadas ni comparativas con otros modelos de edición de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La model card advierte explicitamente que el tamaño de descarga (28,19 GB) no equivale al requisito de VRAM, y no publica cifras de memoria.
- GPU recomendadas: no disponible. Se requiere un entorno PyTorch / comfy-kitchen compatible con CUDA.
- Consumer GPU: no disponible; no se indica qué tarjetas de consumo son suficientes. El componente de difusión cuantizado (9,09 GB) sugiere que podría ejecutarse en GPUs de gama alta con 16-24 GB de VRAM, pero es una estimación no confirmada por el autor.
- Software necesario: Python 3.10+, ComfyUI 0.43.0+, Diffusers 0.40+ y un entorno CUDA compatible con comfy-kitchen.
- Despliegue: exclusivamente mediante ComfyUI con el paquete de nodos ComfyUI BluePixel T8 (instalable vía ComfyUI Manager). Los ficheros no constituyen un directorio de pipeline Diffusers listo para usar ni son compatibles con llama.cpp, vLLM, TGI u Ollama.
- Latencia y throughput: no disponible. La configuración recomendada de 4 pasos con CFG 3 indica inferencia de pocos pasos, pero no se publican tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Cuantizacion | Resolucion destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BluePixel-Comfy (t8star) | Edición image-to-image (FLUX.2 Klein 9B derivado) | INT8 ConvRot + BF16 + FP32 | 4K (4096×4096) | bluepixel-component-licenses / FLUX Non-Commercial (difusión) | ComfyUI (nodos BluePixel T8) |
| openvivo/BluePixel-Turbo (base) | Edición image-to-image | BF16 (sin cuantizar) | 4K | OpenAtom model license + términos por componente | HuggingFace, no disponible |
| FLUX.2 Klein (Black Forest Labs) | Edición/generación de imágenes | BF16 | no disponible | FLUX Non-Commercial License | HuggingFace, ComfyUI |

Nota: no se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso no comercial del componente de difusión: al derivar de FLUX.2 Klein 9B, está sujeto a la FLUX Non-Commercial License. La conversión no otorga derechos comerciales adicionales y los metadatos Apache del repositorio upstream no sustituyen las restricciones del modelo base.
- Licencia por componentes: Qwen3 y DCAE están atribuidos bajo Apache-2.0, pero el conjunto global se rige por bluepixel-component-licenses. Es imprescindible revisar LICENSE.md, NOTICE y la carpeta licenses antes de cualquier uso.
- Cuantización con pérdida: el checkpoint INT8 ConvRot no es equivalente a BF16; puede haber degradación de calidad respecto al modelo base openvivo/BluePixel-Turbo.
- VAE no intercambiable: el DCAE-F64 usa compresión espacial de 64× y no puede sustituirse por un VAE estándar de Flux2.
- Compatibilidad limitada: los ficheros están pensados para la integración ComfyUI enlazada; no funcionan como directorio de pipeline Diffusers estándar ni con otras librerías de inferencia.
- Sesgos y riesgo de alucinación: no disponible; no se documenta información sobre sesgos del modelo base ni mecanismos de mitigación.
- Datos de rendimiento y VRAM no publicados: la planificación de hardware debe basarse en pruebas propias.
- Repositorio de muy reciente creación con 0 descargas registradas: existe poco historial de uso comunitario y feedback de producción.

## Enlaces

- Ficha del modelo en HuggingFace: https://huggingface.co/t8star/BluePixel-Comfy
- Modelo base: https://huggingface.co/openvivo/BluePixel-Turbo
- Licencia: https://huggingface.co/t8star/BluePixel-Comfy/blob/main/LICENSE.md
- Repositorio de nodos ComfyUI BluePixel T8: https://github.com/T8mars/Comfyui-BluePixel-T8
- Guia de instalacion manual: https://github.com/T8mars/Comfyui-BluePixel-T8/blob/main/README_EN.md#installation
- Workflows (1K y 4K): https://github.com/T8mars/Comfyui-BluePixel-T8/tree/main/workflows
- Documentacion de validacion: https://github.com/T8mars/Comfyui-BluePixel-T8/blob/main/docs/validation.md
- Checksums: https://huggingface.co/t8star/BluePixel-Comfy/blob/main/checksums.json
- Componente de difusion INT8 ConvRot: https://huggingface.co/t8star/BluePixel-Comfy/blob/main/diffusion_models/bluepixel_turbo_int8_convrot.safetensors
- Codificador de texto Qwen3-8B: https://huggingface.co/t8star/BluePixel-Comfy/blob/main/text_encoders/bluepixel_qwen3_8b_original.safetensors
- VAE DCAE-F64: https://huggingface.co/t8star/BluePixel-Comfy/blob/main/vae/bluepixel_dcae_f64.safetensors
