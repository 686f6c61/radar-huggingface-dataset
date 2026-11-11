# StillDeadcode/qwen3.8-27b-uncensored-iq8r

## Resumen

StillDeadcode/qwen3.8-27b-uncensored-iq8r es un contenedor de inferencia en formato `.rad` para el motor radiance, orientado a GPUs AMD RDNA4 con ROCm. Empaqueta el modelo Qwen3.8-27B en su variante sin alineamiento de seguridad (abliterated) de orcarouter, cuantizado a int8 en el dominio de Hadamard (W8A8) y con la torre de visión en bf16, todo en un único fichero de 28,76 GiB.

El modelo base es un transformer de 27.000 millones de parámetros con capacidades multimodales (image-text-to-text) y una ventana de contexto entrenada de 262.144 tokens. La cuantización IQ8R aplica rotación Hadamard por bloques de 128 sobre el eje K, escalas u8 por fila y una segunda escala bf16, con redondeo al más cercano (RTN). Incorpora además el drafter de difusión por bloques DFlash2 de z-lab para decodificación especulativa, con sus lineales en un codebook entero de 16 niveles.

La relevancia de esta ficha es doble: por un lado, documenta una receta de cuantización int8 que el autor sitúa en un KLD medio de 0,00049 frente al bf16 original (frente a 0,00363 del checkpoint FP8 de Qwen), lo que la hace competitiva en fidelidad; por otro, ejemplifica el ecosistema emergente de inferencia en hardware AMD fuera de CUDA, con soporte de KV cache int8, tool calling y entrada de imagen y vídeo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con mezcla de atención y módulos SSM (`ssm_inz`, `ssm_out`); drafter DFlash2 de difusión por bloques |
| Parametros totales | 27.000 millones (27B, según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens entrenados; configuración de servicio de hasta 200.000 en el ejemplo del autor |
| Tipos de cuantizacion | Trunk int8 W8A8 (códigos −127..127, escala u8 por fila y 256 de K, escala bf16 por fila, rotación Hadamard 128); lm_head int8 con escala bf16 por fila y grupo 128; drafter en codebook entero de 4 bits y cabeza de vocabulario a 2 bits; torre de visión en bf16; KV cache int8 opcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); no se distribuyen safetensors ni GGUF en este repositorio |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer de 27B con atención y bloques de estado (SSM), lo que sugiere una arquitectura híbrida atención-espacio de estados, más una torre de visión de 27 bloques para procesar imágenes y vídeo en peticiones de chat. La longitud de contexto entrenada es de 262.144 tokens. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación principal de esta ficha es el pipeline de cuantización: `rad-convert` aplica redondeo al más cercano con búsqueda de reglas (`rule=search`) sobre cada tensor lineal del trunk, en un formato W8A8 con rotación Hadamard no normalizada cada 128 elementos del eje K. Esto reduce los valores atípicos antes de cuantizar y permite almacenar las activaciones en int8 bajo la misma rotación. El drafter DFlash2 se cuantiza con un codebook de 16 niveles simétricos y su cabeza de vocabulario a 2 bits, con recálculo de los 32 candidatos principales contra la cabeza del modelo. El autor reporta que el drafter, entrenado sobre el modelo original, entrega 12,6 tokens por paso especulativo sobre este checkpoint, y que las propuestas se verifican, por lo que solo afectan a la velocidad y no a la salida.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno con contexto largo (hasta 200.000 tokens en la configuración de ejemplo).
- Procesamiento de imagen y vídeo dentro de mensajes de chat (`image_url`, `video_url`), gracias a la torre de visión de 27 bloques en bf16.
- Tool calling y salida estructurada a través de la API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Decodificación especulativa con DFlash2, con profundidad de borrador ajustable (`num-speculative-tokens`) o desactivable (`0`).
- Respuestas a peticiones que el modelo original rechazaría, al haberse eliminado la dirección de rechazo (abliterated).
- Cuantización int8 de pesos y activaciones con KV cache int8 (escala f16 por token y cabeza).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional sin filtros de rechazo: el modelo responde a solicitudes que el Qwen3.8-27B original declina, útil en entornos de investigación sobre alineamiento, red teaming controlado o generación creativa sin restricciones de contenido.
- Análisis de documentos e imágenes en un mismo flujo: la torre de visión permite enviar capturas, diagramas o fotogramas de vídeo junto a preguntas de texto en una única petición de chat.
- Procesamiento de contexto largo: con 200.000 tokens de ventana en servicio, admite resúmenes de repositorios completos, actas de reuniones extensas o expedientes técnicos sin trocear.
- Despliegue en infraestructura AMD: el contenedor `.rad` está pensado para GPUs RDNA4 con ROCm, lo que lo hace adecuado para organizaciones con hardware AMD que quieren evitar CUDA.
- Servicio con API compatible con OpenAI: integrable como backend en aplicaciones existentes que ya consumen `/v1/chat/completions`, con tool calling y salida estructurada para pipelines de agentes.
- Inferencia de baja latencia con decodificación especulativa: el drafter DFlash2 entrega 12,6 tokens por paso especulativo, lo que reduce el tiempo por token en generación interactiva.
- Evaluación de cuantización: la receta IQ8R y el dataset de quant challenge permiten reproducir y comparar la fidelidad de formatos int8 frente a FP8 y bf16 en tareas de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor sí reporta métricas de fidelidad de cuantización y de velocidad de decodificación especulativa:

| Metrica | Valor |
|---|---|
| KLD medio IQ8R (RTN) vs bf16 | 0,00049 |
| KLD medio FP8 de Qwen vs bf16 | 0,00363 |
| Posiciones evaluadas | 464.091 (split público del quantization challenge, dos tarjetas) |
| Tokens por paso especulativo (DFlash2) | 12,6 |
| Configuración de prueba | 1× Radeon AI PRO R9700, tp: 1, contexto 40K, KV cache int8 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 28,76 GiB; con KV cache int8 y contexto de 200.000 tokens se necesita margen adicional, por lo que un solo acelerador de 32 GB o más es el mínimo práctico.
- GPU recomendadas: Radeon AI PRO R9700 (probada por el autor con `tp: 1`); el ejemplo de configuración usa `tp: 2`, lo que sugiere dos GPUs para contextos largos. El motor está orientado a AMD RDNA4 con ROCm.
- GPU de consumo: no hay datos de ejecución en GPUs de consumo; el formato `.rad` y el motor radiance están ligados a ROCm y RDNA4, por lo que no se contempla en tarjetas NVIDIA ni en iGPU convencionales.
- Opciones de despliegue: exclusivamente el motor radiance (Codeberg, StillDeadcode/radiance), compilado desde main posterior a la versión 1.17.0 para soportar IQ8R con escala cada 256 de K y KV cache int8. No hay soporte de vLLM, llama.cpp, Ollama ni TGI documentado.
- Latencia y throughput: no se reportan cifras de tokens por segundo; solo el dato de 12,6 tokens por paso especulativo sobre 24 prompts de chat.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StillDeadcode/qwen3.8-27b-uncensored-iq8r | 27B | 262.144 | `.rad` int8 W8A8 | Apache 2.0 | Motor radiance, AMD RDNA4, visión y drafter DFlash2 |
| StillDeadcode/qwen3.8-27b-uncensored-fp8 | 27B | no disponible | FP8 | Apache 2.0 | Predecesor, cuantizado desde el release FP8 del mismo modelo base |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | no disponible | bf16 (presumiblemente) | no disponible | Modelo base sin alineamiento de seguridad |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Drafter de difusión por bloques para decodificación especulativa |

## Limitaciones y advertencias

- El alineamiento de seguridad ha sido eliminado: el modelo responde a solicitudes que el original rechaza. No es apto para despliegues públicos sin moderación externa.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de veracidad ni de sesgos en la información disponible.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera de los idiomas del modelo base.
- Dependencia estricta del motor radiance y de hardware AMD RDNA4 con ROCm; no hay portabilidad a CUDA ni a otros runtimes.
- Requiere una versión de radiance posterior a 1.17.0 (compilada desde main); las versiones estables no soportan IQ8R ni KV cache int8.
- La licencia Apache 2.0 del contenedor no exime de las obligaciones del modelo base ni de las implicaciones legales del uso de un modelo sin alineamiento.
- El drafter fue entrenado sobre el modelo original, no sobre esta variante cuantizada; aunque las propuestas se verifican, el rendimiento especulativo puede diferir en dominios específicos.
- El repositorio no incluye pesos en safetensors ni GGUF, lo que limita su uso fuera del ecosistema radiance.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/qwen3.8-27b-uncensored-iq8r
- Modelo base: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Versión previa FP8: https://huggingface.co/StillDeadcode/qwen3.8-27b-uncensored-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Dataset de cuantización: https://huggingface.co/datasets/StillDeadcode/qwen3.8-27b-quant-challenge
