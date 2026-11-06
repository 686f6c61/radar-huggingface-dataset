# TigerFan69/Krea-2-Cait-v2

## Resumen

Krea 2 Cait v2.0 es un adaptador LoRA de personaje para el modelo base de generación de imágenes Krea 2, desarrollado por TigerFan69. No se trata de un modelo fundacional, sino de un ajuste fino ligero (228,6 MB, 512 tensores en fp16) que modifica el comportamiento de Krea-2-Raw para generar retratos y escenas de un personaje ficticio original llamado Cait. El paquete contiene únicamente pesos y un archivo de instrucciones neutras; no incluye imágenes de entrenamiento ni previsualizaciones generadas.

El adaptador se distribuye como safetensors y está pensado para cargarse en ComfyUI mediante un loader de LoRA compatible con Krea 2, no con flujos de trabajo de FLUX.1. Según los metadatos del archivo, el entrenamiento se realizó durante 2.000 pasos en la época 83, y la versión está identificada de forma inequívoca por su SHA-256, de modo que puede verificarse la integridad del binario descargado.

Su relevancia es acotada: se trata de un LoRA de personaje con cero descargas y cero likes en el momento de la ficha, publicado bajo la Krea 2 Community License. Resulta útil para quien ya trabaje con Krea 2 y necesite consistencia de identidad en un personaje concreto, pero no aporta capacidades nuevas al modelo base ni constituye una alternativa a modelos de texto o de imagen de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo base Krea-2-Raw |
| Parametros totales | no disponible (el adaptador ocupa 228.587.240 bytes en fp16, 512 tensores) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 en los pesos del adaptador; cuantizaciones del base no especificadas |
| Idiomas soportados | en (inglés) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se acopla al modelo base Krea-2-Raw, un modelo de difusión texto-a-imagen. Los metadatos del safetensors identifican Krea 2, 2.000 pasos de entrenamiento y época 83, con 512 tensores almacenados en fp16. El archivo original coincide con el SHA-256 publicado en Civitai antes del empaquetado, y el autor afirma que los pesos no se alteraron durante la sincronización.

No se especifican en la información disponible la composición del dataset de entrenamiento, el número de imágenes utilizadas, la resolución de entrenamiento ni si se aplicaron técnicas como regularización o captions automáticos. El autor indica explícitamente que no se realizó una nueva generación ni un benchmark de calidad para esta sincronización, y que no se reclama un rango de fuerza (strength) universalmente probado.

## Capacidades

- Generación de retratos y escenas del personaje ficticio Cait sobre el modelo base Krea 2.
- Consistencia de identidad del personaje mediante el trigger `Cait-V1`.
- Integración en flujos de trabajo de ComfyUI a través de loaders de LoRA compatibles con Krea 2.
- Modificación del estilo y la apariencia del base sin reentrenar el modelo completo, gracias a su tamaño reducido (228,6 MB).
- Verificación de integridad mediante SHA-256 (`749aae61ecfa3e9adcfdac2c8ee5e6d22d9a5a9428df96d86ee11030a3211818`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión de entrada ni audio: es exclusivamente un adaptador de generación de imágenes.

## Casos de uso

- Retratos de personaje consistentes: cargar el LoRA en ComfyUI con el trigger `Cait-V1` y un workflow Krea 2 válido para generar varias imágenes del mismo personaje manteniendo rasgos faciales y apariencia entre iteraciones.
- Ilustración narrativa o cómic: producir paneles con el mismo personaje en distintas poses y escenas, comparando fuerzas de LoRA fijas y semillas controladas para mantener la identidad visual.
- Prototipado de personajes para videojuegos o animación: generar hojas de referencia y variaciones de vestuario del personaje antes de encargar arte final.
- Pruebas de concepto de dirección de arte: evaluar cómo interactúa un personaje concreto con distintos estilos y fondos del modelo base Krea 2 sin entrenar un modelo propio.
- Comparación controlada de fuerzas de LoRA: el autor recomienda fijar prompts y semillas para comparar intensidades intermedias y detectar artefactos en anatomía, fondos e identidad.
- Uso educativo o de investigación sobre adaptadores LoRA: estudiar el efecto de un adaptador de 512 tensores y 2.000 pasos sobre un modelo de difusión, verificando la integridad del binario por hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que no se realizó ninguna generación nueva ni benchmark de calidad para esta sincronización.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador; depende íntegramente del modelo base Krea-2-Raw, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa solo 228,6 MB, pero el base debe caber en la GPU.
- Opciones de despliegue: ComfyUI con un loader de LoRA compatible con Krea 2; el autor advierte de no sustituirlo por un workflow de FLUX.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea 2 Cait v2.0 (TigerFan69) | LoRA de personaje sobre Krea-2-Raw | 228,6 MB (512 tensores, fp16) | no aplica | Krea 2 Community License | Hugging Face y Civitai |
| Krea-2-Raw (krea) | Modelo base texto-a-imagen | no disponible | no disponible | Krea 2 Community License | Hugging Face |
| Otros LoRA de personaje para Krea 2 | Adaptadores de personaje | no disponible | no aplica | variable según autor | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo base: requiere descargar Krea-2-Raw y su text encoder y VAE por separado, bajo sus propios términos.
- Solo soporta inglés como idioma declarado.
- Riesgo de artefactos en identidad, anatomía y fondos; el autor recomienda evaluar fuerzas intermedias y prompts antes de usarlo en producción.
- No se ha realizado benchmark de calidad ni generación de validación para esta versión.
- La licencia Krea 2 Community License no equivale a uso comercial irrestricto: descargar gratis no implica permiso para vender modelos o merges, y la licencia MIT del software LoRA Studio no se aplica a estos pesos.
- Obligación de atribuir a TigerFan69 según los términos del creador.
- No debe usarse con flujos de trabajo de FLUX.1; requiere un loader compatible con Krea 2.
- El trigger correcto es `Cait-V1`; usar otro puede degradar la consistencia del personaje.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia comunitaria de calidad o estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/TigerFan69/Krea-2-Cait-v2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Fuente en Civitai: https://civitai.red/models/3024278?modelVersionId=3437876
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Perfil del autor en Civitai: https://civitai.red/user/TigerFan69
- Perfil del autor en Hugging Face: https://huggingface.co/TigerFan69
- Apoyo al autor (Ko-fi): https://ko-fi.com/tigerfan69/tiers
- Software LoRA Studio: https://github.com/TigerFan69/lora-studio
