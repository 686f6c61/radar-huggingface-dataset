# ucantbedatta37/data266-p2-sree-baseline-lora-r4

## Resumen

`data266-p2-sree-baseline-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion 1.5 para generación de imágenes texto-a-imagen. Lo publica el usuario `ucantbedatta37` como parte del laboratorio DATA 266 (Pair_Programming_Team_20) y su función es servir de línea base independiente frente al pipeline principal del equipo: el autor escribió su propio bucle de entrenamiento sin usar los scripts de entrenamiento de diffusers, de modo que los resultados sirven para validar de forma cruzada la implementación del resto del grupo.

El adaptador se entrena sobre el subconjunto `lambdalabs/naruto-blip-captions` (1.098 imágenes de entrenamiento y 123 de test a 512x512, partición 90/10 con semilla 266) e inyecta matrices de bajo rango únicamente en las proyecciones de atención del UNet (`to_q`, `to_k`, `to_v`, `to_out`), con 797.184 parámetros entrenables. El entrenamiento completo consume 0,881 horas de GPU en una Tesla T4 con un pico de 3,55 GB, lo que lo convierte en un ejemplo reproducible de ajuste fino eficiente en hardware consumer.

Su relevancia es metodológica más que de producto: demuestra que un LoRA de rango 4 puede reducir el KID frente al modelo base (0,0611 frente a 0,1181) en el dominio de entrenamiento a costa de perder adherencia al prompt (CLIP score 30,80 frente a 32,00). Es un artefacto académico, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5; pipeline text-to-image con VAE y text encoder congelados |
| Parametros totales | 797.184 parametros entrenables en el adaptador (el modelo base SD 1.5 no se incluye en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; el limite practico lo fija el tokenizador CLIP del modelo base, 77 tokens) |
| Tipos de cuantizacion | pesos LoRA en FP32; el modelo base admite las cuantizaciones habituales de SD 1.5 (FP16, FP32, y variantes GGUF/ONNX de terceros), no documentadas por el autor |
| Idiomas soportados | no disponible (los prompts de texto dependen del text encoder CLIP de SD 1.5, predominantemente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors via diffusers (repo de 0,0 GB; pesos LoRA, no checkpoint completo) |

## Arquitectura y entrenamiento

El adaptador sigue el esquema clasico de LoRA para difusion: se congela el UNet de Stable Diffusion 1.5 y se insertan descomposiciones de bajo rango en las proyecciones lineales de atencion (`to_q`, `to_k`, `to_v`, `to_out`), con rango 4 y alpha 4. El bucle de entrenamiento esta escrito a mano, sin los scripts oficiales de diffusers, y usa AdamW con learning rate 1e-4 y scheduler coseno durante 2.000 pasos con batch de 4. Los pesos LoRA se mantienen en FP32 mientras el forward se ejecuta con autocast FP16 y `GradScaler` para estabilidad numerica.

Los datos provienen de `lambdalabs/naruto-blip-captions`, redimensionado a 512x512 y dividido 90/10 con semilla 266 (1.098 imágenes de entrenamiento, 123 de test). Las captions son generadas por BLIP: cortas y genéricas, y el dataset está dominado por retratos en primer plano. Esta composición explica el comportamiento observado: el adaptador absorbe bien el estilo visual del dominio pero pierde capacidad de seguir instrucciones detalladas, especialmente en escenas fuera de dominio y prompts con varios objetos. No se documenta uso de RLHF, DPO ni preferencias humanas, algo esperable en un ajuste LoRA de este tipo.

## Capacidades

- Generación de imágenes texto-a-imagen a 512x512 sobre el pipeline de Stable Diffusion 1.5.
- Especialización estilística en el dominio del dataset de entrenamiento (retratos y personajes de estilo anime/Naruto).
- Inyección ligera: 797.184 parámetros entrenables, compatible con carga mediante `diffusers` como adaptador sobre el checkpoint base.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso ni comportamiento de agente.
- Capacidades multilingües: no documentadas; hereda el comportamiento del text encoder CLIP de SD 1.5.
- No dispone de modo thinking, visión de entrada, audio ni otras modalidades adicionales.

## Casos de uso

- Reproducción académica de experimentos: sirve como línea base independiente para comparar implementaciones de entrenamiento LoRA en un curso o laboratorio, gracias a sus métricas publicadas (KID, CLIP score, LPIPS) y a su bucle de entrenamiento escrito a mano.
- Validación cruzada de pipelines de entrenamiento: al no usar los scripts de diffusers, permite detectar discrepancias en la implementación del equipo comparando curvas de pérdida y métricas de evaluación con el mismo split y semilla.
- Estudio del compromiso fidelidad-adherencia en LoRA: con rango 4 y 2.000 pasos se obtiene un caso concreto donde el KID mejora (0,0611 frente a 0,1181) mientras el CLIP score empeora (30,80 frente a 32,00), útil para analizar el efecto del rango y los pasos en la especialización.
- Generación de retratos estilizados en primer plano: dentro del dominio de entrenamiento, el adaptador reproduce el estilo del dataset con diversidad LPIPS comparable al base (0,7997 frente a 0,7889).
- Docencia sobre eficiencia de ajuste fino: el registro de 0,881 GPU-horas y 3,55 GB de pico en una Tesla T4 sirve como referencia práctica de coste para ajustar LoRA en GPUs de gama media.
- Prototipado de experimentos controlados de difusión: útil para estudiar el efecto de la composición del dataset (captions BLIP cortas, retratos cerrados) sobre la adherencia al prompt antes de escalar a datasets mayores.

## Benchmarks y rendimiento

| Metrica | Este adaptador | Modelo base (SD 1.5) |
|---|---|---|
| KID vs 123 imagenes de test (20 prompts fijos, semillas 0 y 1) | 0,0611 ± 0,0196 | 0,1181 |
| CLIP score | 30,80 | 32,00 |
| LPIPS diversity | 0,7997 | 0,7889 |

No se han publicado resultados de benchmarks adicionales (FID, Inception Score, evaluaciones humanas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos pocos MB (797.184 parámetros en FP32); el consumo real lo determina el modelo base SD 1.5, típicamente entre 4 y 8 GB en FP16 a 512x512 según el scheduler y el tamaño de batch.
- Entrenamiento documentado: una Tesla T4 con pico de 3,55 GB y 0,881 GPU-horas para 2.000 pasos con batch 4.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para inferencia (RTX 3060, RTX 4060, RTX 4090, A100, H100); para entrenamiento de adaptadores similares basta una T4 o una RTX 3060.
- Cabe en GPU consumer: sí, en la mayoria de tarjetas con 6 GB o más, al tratarse de un adaptador sobre SD 1.5.
- Opciones de despliegue: `diffusers` con `PeftModel`/`load_lora_weights` sobre el checkpoint de SD 1.5; también es posible convertirlo a otros runners compatibles con LoRA de SD 1.5 (por ejemplo, WebUI o ComfyUI), aunque el autor no lo documenta.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros del adaptador | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-p2-sree-baseline-lora-r4 | 797.184 (rango 4) | 512x512 | KID 0,0611; CLIP 30,80 | creativeml-openrail-m | Hugging Face, repo de 0,0 GB |
| Stable Diffusion 1.5 (base) | n/a (modelo completo, ~860 M en UNet) | 512x512 | KID 0,1181; CLIP 32,00 | creativeml-openrail-m | Amplia, referencia del ecosistema |
| Otros LoRA de SD 1.5 del mismo laboratorio | no disponible | 512x512 | no disponible | no disponible | no disponible |

No se dispone de datos de otros adaptadores comparables del mismo laboratorio ni de alternativas equivalentes con métricas publicadas en la información proporcionada.

## Limitaciones y advertencias

- Adherencia al prompt reducida: el CLIP score cae de 32,00 a 30,80 respecto al modelo base, con especial degradación en escenas fuera de dominio y prompts con múltiples objetos.
- Sesgo de dominio: el dataset son retratos en primer plano con captions BLIP cortas y genéricas, por lo que el adaptador reproduce ese estilo y no generaliza bien a otras composiciones.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía, texto y objetos incoherentes, especialmente fuera del dominio de entrenamiento.
- Licencia: `creativeml-openrail-m` permite uso comercial con restricciones, pero el autor declara explícitamente que los personajes de Naruto están sujetos a copyright y que el adaptador es solo para investigación académica no comercial; esa restricción adicional prevalece para este artefacto.
- Sin datos de idiomas ni de comportamiento multilingüe; los prompts en castellano pueden funcionar peor que en inglés por las limitaciones del text encoder CLIP de SD 1.5.
- Artefacto académico sin mantenimiento: 0 descargas y 0 likes en el momento de la consulta, sin garantías de soporte ni de compatibilidad futura con versiones de `diffusers`.
- El repo no incluye el checkpoint base: es imprescindible descargar `stable-diffusion-v1-5/stable-diffusion-v1-5` por separado y verificar su disponibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ucantbedatta37/data266-p2-sree-baseline-lora-r4
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Codigo del laboratorio (tag p2-v1.0): https://github.com/SunnyJaneH/data266-lab2-team20
