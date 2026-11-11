# uzeresearch/cobalt-image

## Resumen

COBALT Image es una pipeline de generación de imágenes texto-a-imagen publicada por COBALT AI bajo licencia Apache 2.0. Su versión 0.1 (fase A) redistribuye los pesos sin modificar de FLUX.2 [klein] 4B de Black Forest Labs, un transformer de flujo rectificado de aproximadamente 4.000 millones de parámetros (3.875.544.576 según los safetensors) que emplea un codificador de texto Qwen3 y el VAE de FLUX.2. El modelo se distribuye en formato diffusers y se integra mediante `Flux2KleinPipeline`.

La propuesta de valor de COBALT no reside en los pesos, sino en el envoltorio: un motor de inferencia con modo escalonado de bajo consumo que permite ejecutar el modelo sin GPU en unos 9 GB de RAM, una API HTTP, una herramienta de preparación de datasets y un arnés de evaluación. También incluye una mejora de prompt opcional que reutiliza el propio codificador Qwen3 para reescribir instrucciones breves sin llamadas de red ni modelos adicionales.

Es relevante ahora porque demuestra que un modelo de difusión de 4B puede operar en CPU con memoria contenida (512×512 en unos 56 segundos con 4 hilos), lo que rebaja la barrera de entrada para prototipado y despliegues sin acelerador. La generación se realiza en 4 pasos con guidance 1.0 gracias a la destilación por pasos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de flujo rectificado (rectified-flow), codificador de texto Qwen3, VAE de FLUX.2 |
| Parametros totales | 3.875.544.576 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en bfloat16 en el ejemplo de uso) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio diffusers) |

## Arquitectura y entrenamiento

El modelo es un transformer de flujo rectificado de unos 4B de parámetros que combina un codificador de texto basado en Qwen3 con el VAE de FLUX.2. La generación emplea muestreo destilado por pasos: 4 pasos de inferencia con guidance 1.0, lo que reduce el coste computacional frente a pipelines de difusión convencionales de decenas de pasos.

COBALT AI no ha entrenado ni ajustado estos pesos: son los de FLUX.2 [klein] 4B redistribuidos sin modificar. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación aportada por COBALT es de infraestructura: modo escalonado que nunca mantiene simultáneamente en memoria el codificador de texto y el transformer, mejora de prompt opt-in usando el propio codificador Qwen3, API HTTP y arnés de evaluación. Está previsto publicar pesos ajustados como revisión separada y claramente etiquetada.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con resolución configurable en múltiplos de 16 (por ejemplo, 512×512 o 1024×1024).
- Muestreo rápido en 4 pasos con guidance 1.0, apto para iteración y prototipado.
- Mejora de prompt opt-in: reescribe una instrucción breve en otra detallada reutilizando el codificador Qwen3, sin modelo extra ni llamada de red; el resultado reporta tanto el prompt original como el reescrito.
- Ejecución sin GPU mediante modo escalonado de bajo consumo (unos 9 GB de RAM).
- API HTTP incluida para integración como servicio.
- Herramienta de preparación de datasets y arnés de evaluación incluidos en el repositorio.
- No dispone de tool calling, razonamiento multi-paso, visión de entrada, audio ni modo thinking: es exclusivamente texto-a-imagen.

## Casos de uso

- Prototipado creativo sin GPU: un equipo puede generar borradores de 512×512 en CPU (unos 56 s por imagen con 4 hilos) para validar conceptos visuales antes de invertir en hardware acelerado.
- Generación de ilustraciones para documentación y blogs: el modelo produce imágenes coherentes con el prompt en categorías como arquitectura, ilustración y cinematografía, con CLIP score medio de 37,63 en la evaluación interna.
- Diseño de material promocional con texto corto: en la evaluación interna acertó la grafía "COBALT" en una señal, lo que permite generar carteles sencillos con texto breve, siempre con revisión humana.
- Servicio interno de generación de imágenes vía HTTP: la API incluida permite exponer el modelo a otras aplicaciones del stack sin reescribir la integración.
- Investigación en evaluación de modelos generativos: el arnés `eval/run_eval.py` y la métrica CLIP con `openai/clip-vit-base-patch32` facilitan reproducir y ampliar pruebas comparativas.
- Preparación de datasets sintéticos: la herramienta de preparación de datasets y la generación por lotes con semilla fija permiten crear conjuntos de imágenes reproducibles para experimentos.
- Despliegue en entornos con restricciones de memoria: con unos 9 GB de RAM en modo escalonado, cabe en máquinas sin GPU dedicada, útil para demos en portátiles o servidores modestos.

## Benchmarks y rendimiento

Evaluación interna de COBALT AI (2026-11-11): 8 prompts, una imagen por prompt, 512×512, 4 pasos, guidance 1.0, semilla 1234, solo CPU (4 hilos, 15 GB RAM), modo escalonado. Métrica: CLIP score = 100 × similitud coseno con `openai/clip-vit-base-patch32`.

| Prompt id | Categoria | CLIP score | Observacion |
|---|---|---|---|
| photo_portrait | fotorrealismo | 37,72 | retrato convincente |
| hands | anatomia | 34,34 | manos plausibles; disposicion de teclas de piano incorrecta |
| count_apples | conteo | 33,28 | tres manzanas, correcto |
| spatial | espacial | 39,00 | cubo sobre la esfera, pero piramide en el lado equivocado |
| text_sign | texto | 38,37 | "COBALT" escrito correctamente |
| cinematic | cinematografico | 36,43 | coincide con el prompt |
| architecture | arquitectura | 38,54 | coincide con el prompt |
| illustration | arte | 43,39 | coincide con el prompt y la paleta |

Media CLIP: 37,63. El propio autor advierte que es una prueba de humo, no un benchmark: no se han ejecutado GenEval, T2I-CompBench, pruebas de preferencia humana ni comparaciones con otros modelos.

## Requisitos de hardware

- GPU: aproximadamente 13 GB de VRAM según la model card del modelo base; COBALT AI no lo ha probado en GPU.
- CPU: probado con 15 GB de RAM, 4 hilos y extensiones AVX-512/AMX; 512×512 en unos 56 s con pico de 9,0 GB en modo escalonado.
- La mejora de prompt añade unos 33 s por imagen en CPU de 4 hilos.
- Cabe en equipos de consumo sin GPU dedicada; no se especifican modelos de GPU concretos recomendados.
- Despliegue mediante `diffusers` con `Flux2KleinPipeline`, `enable_model_cpu_offload()` o `pipe.to("cuda")`; el paquete `cobalt/` aporta el motor y la API HTTP. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline.
- Throughput y latencia en GPU: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COBALT Image 0.1 | 3,875B | No disponible | CLIP medio 37,63 (8 prompts, CPU) | Apache 2.0 | Hugging Face (diffusers) |
| FLUX.2 [klein] 4B | Aprox. 4B | No disponible | Calidad identica a COBALT 0.1 (mismos pesos) | No disponible en la informacion | Hugging Face |
| Otras alternativas texto-a-imagen | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa con modelos de otras familias no puede elaborarse con rigor porque la informacion proporcionada no incluye datos de rendimiento de terceros ni sus especificaciones. La unica comparacion solida es con el modelo base, del que COBALT hereda exactamente la calidad de imagen.

## Limitaciones y advertencias

- Hereda todos los fallos del modelo base: manos y anatomia fina, conteo exacto de objetos, texto largo o pequeno y relaciones espaciales complejas pueden fallar.
- Los prompts se esperan en ingles; no hay soporte multilingue declarado.
- Los resultados pueden reflejar sesgos de los datos de entrenamiento del modelo base, que COBALT AI no selecciono ni puede auditar.
- El repositorio no aplica filtro de seguridad ni marca de agua; el despliegue debe anadir filtrado de entrada y salida propio.
- No hay pipeline nativo 2K/4K ni funcionalidad de inpainting.
- La evaluacion es una prueba de humo de 8 imagenes con una semilla; no hay evidencia de ranking frente a otros modelos.
- Uso fuera de alcance prohibido: contenido sexual con menores, imagenes intimas no consentidas, contenido ilegal o difamatorio, suplantacion de personas, desinformacion e infraccion de derechos de autor o marca.
- COBALT AI no esta afiliada ni respaldada por Black Forest Labs; los pesos son de terceros y sin modificar.

## Enlaces

- Hugging Face: https://huggingface.co/uzeresearch/cobalt-image
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
