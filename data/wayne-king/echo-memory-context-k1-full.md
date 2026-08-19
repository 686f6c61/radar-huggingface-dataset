# Wayne-King/echo-memory-context-k1-full

## Resumen

Echo-Memory `context_k1` es un modelo de generación de vídeo texto-a-vídeo (text-to-video) basado en el DiT (Diffusion Transformer) de Wan 2.1 T2V 1.3B, desarrollado por Wayne-King como parte del estudio controlado de memoria en action world models del equipo Echo-Team. El modelo fusiona los pesos oficiales de Wan-AI/Wan2.1-T2V-1.3B con el overlay de memoria `context_k1` del paper arXiv:2606.09803, que aborda el problema de la pérdida de identidad de escena cuando la cámara se aleja y regresa en secuencias de vídeo multi-segmento.

Este checkpoint concreto (`context_k1`) es un fine-tune completo de 30.000 pasos sobre el DiT de Wan 2.1 T2V 1.3B, entrenado a resolución 640×352 con chunks de 81 frames. A diferencia de las versiones de investigación que incluyen módulos adicionales (action_mlp, self_attn_with_action, SSM/spatial slots), este archivo contiene únicamente las 825 claves oficiales del DiT de Wan con el overlay de memoria ya fusionado, lo que permite cargarlo como un transformer Wan normal con `strict=True`. La licencia Apache-2.0 y la compatibilidad con DiffSynth lo hacen accesible para integración en pipelines existentes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de Wan 2.1 T2V 1.3B con overlay de memoria context_k1 |
| Parametros totales | 1.3B (según modelo base Wan-AI/Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`diffusion_pytorch_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un DiT estándar de Wan 2.1 T2V 1.3B, una arquitectura de transformer de difusión para generación de vídeo que opera sobre latentes espaciotemporales. El overlay `context_k1` de Echo-Memory modifica el mecanismo de atención para incorporar memoria de contexto explícita, permitiendo que el modelo recuerde información de segmentos anteriores cuando la cámara se aleja y regresa. Según la model card, el fine-tune se realizó durante 30.000 pasos (epoch-0) a resolución 640×352 con chunks de 81 frames, y el archivo resultante contiene las 825 claves oficiales del DiT de Wan con el overlay ya fusionado. Los componentes de T5 (text encoder) y VAE se mantienen como los archivos oficiales de Wan-AI/Wan2.1-T2V-1.3B. Los módulos de investigación adicionales (action_mlp, self_attn_with_action, SSM/spatial slots) no están incluidos en este checkpoint.

## Capacidades

- Generación de vídeo texto-a-vídeo: convierte prompts de texto en secuencias de vídeo de alta calidad, heredando las capacidades del modelo base Wan 2.1 T2V 1.3B.
- Memoria de contexto: el overlay `context_k1` permite mantener la identidad de la escena, la disposición de objetos y el punto de vista cuando la cámara se aleja y regresa, evitando la deriva hacia mundos plausibles pero diferentes.
- Generación multi-segmento: soporta secuencias de vídeo compuestas por múltiples chunks (81 frames cada uno) con coherencia entre segmentos.
- Condicionamiento por acción de cámara: el protocolo de cámara-acción del estudio Echo-Memory permite controlar el movimiento de cámara entre segmentos (aunque este checkpoint no incluye los módulos de acción específicos, el overlay de memoria sí está presente).
- Compatibilidad con DiffSynth: se integra como un pipeline estándar de `WanVideoPipeline` con carga estricta del DiT.

## Casos de uso

- Generación de vídeo con continuidad de escena: ideal para producir clips donde la cámara orbita, se aleja y regresa al mismo objeto o escena, manteniendo la identidad visual sin cambios bruscos. Se usaría con DiffSynth cargando el DiT fusionado junto con el T5 y VAE oficiales de Wan.
- World models para simulación: el modelo puede servir como base para estudios de memoria en modelos de mundo condicionados por acción, permitiendo experimentar con el perfil de memoria `context_k1` en entornos de simulación de vídeo.
- Prototipado de pipelines de vídeo con memoria: desarrolladores que trabajan con Wan 2.1 pueden usar este checkpoint como reemplazo directo del DiT base para añadir capacidades de memoria de contexto sin modificar la arquitectura.
- Investigación en generación de vídeo multi-segmento: el fine-tune de 30.000 pasos a 640×352 con chunks de 81 frames proporciona un punto de partida para estudiar el efecto de la memoria en la coherencia temporal.
- Generación de contenido creativo con control de cámara: creadores que necesiten secuencias donde la cámara se aleja y vuelve al mismo sujeto pueden beneficiarse de la memoria de contexto para evitar cambios de identidad.
- Evaluación comparativa de mecanismos de memoria: al ser un checkpoint controlado dentro del estudio Echo-Memory, permite comparar el perfil `context_k1` con otros perfiles (compresión, espacial, state-space) en el mismo backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper arXiv:2606.09803 describe un estudio controlado, pero los datos numéricos de evaluación no están incluidos en la model card ni en los resultados de búsqueda proporcionados.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Dado que el modelo base tiene 1.3B parámetros y se usa en bf16, es razonable estimar un consumo de VRAM inferior a 8 GB solo para el DiT, pero el pipeline completo (incluyendo T5 XXL y VAE) requerirá más memoria. No se proporcionan cifras concretas.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es probable que quepa en GPUs consumer como RTX 3060 o superiores, pero no hay confirmación oficial.
- Opciones de despliegue: DiffSynth es la librería principal soportada. También podría usarse con otros frameworks que carguen safetensors de Wan, pero no se documentan alternativas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Wan-AI/Wan2.1-T2V-1.3B (base) | 1.3B | no disponible | Apache-2.0 | Modelo original sin overlay de memoria |
| Wayne-King/echo-memory-context-k1-full | 1.3B | no disponible | Apache-2.0 | DiT base con overlay context_k1 fusionado |
| Echo-Team/Echo-Memory (overlay de investigación) | no disponible | no disponible | Apache-2.0 | Incluye módulos adicionales (action_mlp, SSM, etc.) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint no incluye los módulos de investigación adicionales (action_mlp, self_attn_with_action, SSM/spatial slots), por lo que las capacidades de acción de cámara avanzadas del estudio Echo-Memory no están disponibles en este archivo.
- El fine-tune se realizó específicamente a 640×352 con chunks de 81 frames; el uso a otras resoluciones o longitudes de segmento puede degradar el rendimiento.
- No se han publicado datos de sesgos, alucinaciones o limitaciones de idioma en la información disponible.
- El modelo es un overlay sobre Wan 2.1 T2V 1.3B; cualquier limitación del modelo base (por ejemplo, en generación de texto o fidelidad visual) se hereda.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar el paper Echo-Memory si se utiliza el modelo.
- No hay información sobre la calidad de la memoria `context_k1` en escenarios fuera del protocolo de cámara-acción del estudio.

## Enlaces

- HuggingFace: https://huggingface.co/Wayne-King/echo-memory-context-k1-full
- Paper: https://arxiv.org/abs/2606.09803
- PDF del paper: https://arxiv.org/pdf/2606.09803v1
- Código oficial: https://github.com/Echo-Team-Joy-Future-Academy-JD/Echo-Memory
- Overlay de investigación (HF): https://huggingface.co/Echo-Team/Echo-Memory
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
- Colección de Wayne-King: https://huggingface.co/collections/Wayne-King/echo-memory
- Repo Diffusers relacionado: https://huggingface.co/Wayne-King/echo-memory-diffusers
