# yuna1126/LFM3-1.7B-Tema_Q-Abliterated

## Resumen

LFM3-1.7B-Tema_Q-Abliterated es una variante "abliterada" (sin comportamiento de rechazo) del modelo LiquidAI/LFM3-1.7B, publicada por el usuario yuna1126. El modelo original lo desarrolla Liquid AI, una empresa conocida por sus arquitecturas híbridas eficientes para despliegue en el borde (edge). LFM3-1.7B es un modelo de lenguaje solo texto, post-entrenado para tareas agénticas, con 1.730 millones de parámetros y una ventana de contexto de 256K tokens.

La modificación aplicada no cambia la arquitectura ni el entrenamiento original: se trata de una ablación de pesos (abliteration) realizada con la herramienta Tema_Q-Abliterated v1.1.1, que implementa el algoritmo SCAPE. El objetivo es eliminar la dirección de rechazo en el espacio de activaciones para que el modelo no se niegue a responder peticiones, preservando al mismo tiempo la calidad general (divergencia KL de 0,0315 respecto al modelo base).

Es relevante ahora porque demuestra que las técnicas de abliteración se están automatizando y abaratando: la herramienta permite ejecutar la búsqueda en CPU sin GPU, y el modelo resultante cabe en torno a 1 GB en cuantización de 4 bits, lo que lo hace desplegable en móviles y portátiles. La contrapartida es que se eliminan las salvaguardas de seguridad del modelo original, un punto crítico para cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido tri-arquitectura: 24 capas (13 convoluciones cortas con compuerta, 5 de atención con ventana deslizante, 6 de atención global) |
| Parametros totales | 1.728.801.536 (1,73B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | no disponible en la model card; el modelo base se describe con ~1 GB en 4 bits |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (17 idiomas) |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (también compatible con conversión a GGUF y uso en vLLM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido denominado tri-hybrid por Liquid AI: de las 24 capas, 13 son convoluciones cortas con compuerta (gated short convolutions), 5 son atención con ventana deslizante (sliding-window attention) y 6 son atención global. Esta mezcla reduce el coste computacional frente a un transformer de atención completa, manteniendo capacidad de modelado de contexto largo. El modelo es solo texto y está post-entrenado para entornos agénticos como Hermes Agent, Pi y OpenClaw.

Sobre el entrenamiento original no se detallan en la información disponible el número de tokens, la composición del dataset ni si hubo RLHF o DPO. La intervención de esta ficha es una abliteración: se localiza una dirección de rechazo por capa y se ablate de los pesos, con parámetros de búsqueda concretos (por ejemplo, max_weight de 1,248 en attn.o_proj, min_weight de 0,0 en mlp.down_proj, kernel_shape "flat"). La herramienta usa el objetivo surrogate SCAPE, que evalúa cada candidato unas 49 veces más rápido que la evaluación por generación completa, permitiendo completar la búsqueda en CPU. El resultado reportado es de 0 rechazos en 100 generaciones completas, con KL de 0,0315 y comprobación de colapso correcta.

## Capacidades

- Generación de texto conversacional en 17 idiomas, incluido el español.
- Razonamiento y tareas de agente multi-paso, gracias al post-entrenamiento para entornos agénticos.
- Ventana de contexto de 256K tokens para conversaciones y documentos largos.
- Uso en pipelines de agentes (Hermes Agent, Pi, OpenClaw según la model card del modelo base).
- Despliegue en el borde: ~1 GB en 4 bits, apto para móviles y portátiles.
- Fine-tuning rápido en una sola GPU para especialización en dominios, formatos y herramientas.
- Sin comportamiento de rechazo (0/100 rechazos reportados), lo que elimina las negativas del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible (el modelo es solo texto).
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales sin restricciones de rechazo: para investigación sobre comportamiento de modelos o para aplicaciones donde las negativas del modelo base resultan un obstáculo, el modelo responde sin activar la dirección de rechazo ablacionada.
- Procesamiento de documentos largos: con 256K tokens de contexto se pueden analizar contratos, informes o código extenso en una sola pasada sin trocear.
- Agentes locales en dispositivos: al ocupar ~1 GB en 4 bits, puede ejecutarse en un portátil o móvil para asistentes personales offline.
- Fine-tuning de dominio en una sola GPU: la model card indica que se puede especializar rápidamente en formatos, herramientas y dominios concretos, útil para equipos con recursos limitados.
- Generación multilingüe: cubre 17 idiomas, lo que permite atender usuarios en español, inglés, árabe, chino, francés, alemán, entre otros, con un único modelo pequeño.
- Prototipado de pipelines agénticos: sirve para experimentar con bucles de razonamiento multi-paso y orquestación de herramientas antes de escalar a modelos mayores.
- Investigación en seguridad de IA: como caso de estudio de abliteración, permite medir el impacto de eliminar salvaguardas sobre la calidad y el comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas del proceso de abliteración:

| Metrica | Valor |
|---|---|
| Rechazos (generación completa) | 0/100 |
| Divergencia KL respecto al base | 0,0315 |
| Comprobación de colapso | OK |

## Requisitos de hardware

- VRAM estimada: ~1 GB en cuantización de 4 bits (dato del modelo base); en FP16, aproximadamente 3,5 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4070, RTX 4090) puede ejecutarlo con holgura; en FP16 cabe en GPUs de 8 GB o más.
- Cabe en GPU consumer: sí, en todas las gamas actuales; también en CPU y en dispositivos móviles según la model card del base.
- Opciones de despliegue: transformers (librería declarada), vLLM y conversión a llama.cpp según la model card; Ollama y TGI no se mencionan explícitamente.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| LFM3-1.7B-Tema_Q-Abliterated | 1,73B | 256K | lfm1.0 | Variante abliterada, sin rechazos reportados |
| LiquidAI/LFM3-1.7B | 1,73B | 256K | lfm1.0 | Modelo base con salvaguardas intactas |
| Modelos de ~1,5-2B de la competencia | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La abliteración elimina el comportamiento de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin negarse, lo que lo desaconseja para aplicaciones de cara al público sin filtros externos.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como todo modelo de 1,7B, es propenso a inventar datos.
- La divergencia KL de 0,0315 indica cierta desviación respecto al base; puede haber degradación sutil en calidad o coherencia no capturada por la métrica.
- Licencia lfm1.0: es necesario revisar los términos del archivo LICENSE del modelo base antes de cualquier uso comercial; la etiqueta "other" en Hugging Face exige verificación explícita.
- Idiomas: aunque se listan 17, no hay datos de rendimiento por idioma; el español puede tener menor calidad que el inglés.
- Contexto de 256K: no se ha verificado empíricamente en esta variante el rendimiento en el extremo de la ventana.
- Soporte de tool calling y agentes: la model card del base lo menciona, pero no hay confirmación específica para esta variante abliterada.
- Autoría: el modelo lo publica un usuario individual (yuna1126), no Liquid AI; no hay garantías de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/yuna1126/LFM3-1.7B-Tema_Q-Abliterated
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Herramienta Tema_Q-Abliterated: https://github.com/ek15072809/Tema_Q-Abliterated
- Blog de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Documentación de Liquid AI: https://docs.liquid.ai/lfm/getting-started/welcome
- Playground: https://playground.liquid.ai/
- Consola API: https://console.liquid.ai/dashboard
- Colección LFM3: https://huggingface.co/collections/LiquidAI/lfm3
