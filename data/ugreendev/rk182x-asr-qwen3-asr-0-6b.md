# UGREENDEV/RK182X-ASR-Qwen3-ASR-0.6B

## Resumen

RK182X-ASR-Qwen3-ASR-0.6B es una conversión al formato RKNN del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B, publicada por UGREENDEV. El objetivo no es ofrecer un modelo nuevo, sino empaquetar un ASR de 0,6 mil millones de parámetros para que se ejecute sobre la NPU integrada en los SoC Rockchip RK1820 y RK1828, con cuantización w4a16 tanto en el codificador como en el decodificador (LLM).

El repositorio distribuye dos configuraciones (offline y online) compiladas con la versión v1.1.0 del RKNN Runtime, cada una con 8 núcleos de NPU asignados al encoder y otros 8 al LLM. Esto lo hace relevante para escenarios de transcripción en el borde (edge), donde no hay GPU disponible y se busca bajo consumo con inferencia local: dispositivos embebidos, cajas de audio, wearables o equipos industriales con Rockchip.

La ficha se centra en lo que documenta el autor; los detalles sobre arquitectura interna del modelo base, idiomas y datos de entrenamiento no aparecen en la model card y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con LLM (arquitectura del modelo base Qwen3-ASR-0.6B, detalles no disponibles); empaquetado como RKNN |
| Parametros totales | 0,6 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | w4a16 en encoder y w4a16 en LLM (pesos 4 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); se aplican además los términos de licencia de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); configuración `Qwen3-ASR-0.6B-w4a16-8-offline` y `Qwen3-ASR-0.6B-w4a16-8-online` |

## Arquitectura y entrenamiento

El modelo es una conversión del Qwen3-ASR-0.6B original a RKNN, el formato de ejecución de Rockchip para sus NPU. La model card no describe la arquitectura interna del modelo base más allá de indicar que es un modelo ASR con un codificador y un LLM; no se detallan capas, mecanismos de atención ni innovaciones como decodificación especulativa o atención lineal.

En cuanto a entrenamiento, no se aporta información sobre volumen de tokens, composición del dataset ni si hubo RLHF o DPO. Lo único documentado es el proceso de conversión: cuantización w4a16 aplicada al encoder y al LLM, compilación con RKNN Runtime v1.1.0 y asignación de 8 núcleos de NPU a cada componente. Se ofrecen variantes offline y online, presumiblemente para ejecución sin conexión o con servicio remoto, aunque la model card no explica la diferencia funcional entre ambas.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto, tarea declarada en el pipeline del repositorio.
- Ejecución sobre NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Dos modos de despliegue: configuración offline y configuración online.
- Compatibilidad con endpoints (tag `endpoints_compatible`) según los metadatos del repositorio.
- Naturaleza conversacional (tag `conversational`) heredada del modelo base.
- Soporte de tool calling, agentes, visión, audio adicional o modo de razonamiento: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Transcripción local en dispositivos embebidos: el modelo se ejecuta en la NPU de un SoC RK1820 o RK1828, lo que permite transcribir audio sin enviarlo a la nube y con el bajo consumo propio de una NPU integrada.
- Cajas de audio y asistentes de voz para el hogar: al ser un modelo de 0,6B cuantizado a w4a16, cabe en dispositivos con memoria limitada y puede gestionar la transcripción de comandos de voz en tiempo real sobre hardware Rockchip.
- Subtitulado y actas de reuniones en equipos de borde: la configuración offline permite procesar grabaciones sin conexión, útil en entornos con requisitos de privacidad o redes restringidas.
- Wearables y dispositivos portátiles: la reducción a 4 bits de los pesos y la ejecución en NPU facilitan integrar ASR en dispositivos con presupuesto energético muy ajustado.
- Automatización industrial con reconocimiento de voz: operarios que dictan incidencias o comandos en terminales con SoC Rockchip, con la transcripción ejecutándose en el propio equipo.
- Pipelines de accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en terminales de bajo coste basados en RK1820/RK1828.
- Evaluación y prototipado de ASR en edge: útil para equipos que quieran medir la calidad de Qwen3-ASR-0.6B antes de comprometerse con hardware específico, siempre que dispongan de un dispositivo Rockchip compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU).
- Runtime: RKNN Runtime v1.1.0 con el driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos de NPU: 8 para el encoder y 8 para el LLM en ambas configuraciones.
- VRAM/RAM estimada para GPU: no aplica; el modelo está pensado para NPU Rockchip, no para GPU convencional. El tamaño del repositorio es de 1,5 GB.
- GPU recomendadas (A100, H100, RTX 4090): no disponibles; este empaquetado no está orientado a GPU.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato RKNN requiere el runtime de Rockchip.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-ASR-Qwen3-ASR-0.6B | 0,6B | no disponible | RKNN (w4a16) | Apache 2.0 | Hugging Face, ModelScope |
| Qwen3-ASR-0.6B (modelo base) | 0,6B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face |
| Alternativas ASR edge de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es con el modelo base Qwen3-ASR-0.6B: este repositorio no añade capacidades nuevas, sino que adapta el modelo a la NPU de Rockchip con cuantización w4a16. No se dispone de datos de benchmarks que permitan comparar la calidad de la versión RKNN frente al original.

## Limitaciones y advertencias

- Solo funciona en chips Rockchip RK1820 y RK1828; no es portable a GPU, CPU genérica ni a otros aceleradores sin reconversión.
- Requiere RKNN Runtime v1.1.0 y el driver correspondiente; una versión distinta puede provocar fallos de ejecución.
- Los archivos de una configuración deben usarse conjuntamente; mezclar ficheros de distintas configuraciones no está soportado.
- La cuantización w4a16 puede degradar la precisión de transcripción frente al modelo base en fp16/bf16; no se publican métricas que cuantifiquen esa pérdida.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin verificación previa.
- Sesgos y riesgo de alucinación del modelo base: no documentados en la model card.
- Restricciones de licencia: además de Apache 2.0 del modelo base, se aplican los términos de RKNN Toolkit y RKNN Runtime, que pueden condicionar el uso comercial del empaquetado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- El autor recomienda verificar los checksums SHA-256 antes del despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/UGREENDEV/RK182X-ASR-Qwen3-ASR-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Documentación de configuración offline: `Qwen3-ASR-0.6B-w4a16-8-offline/README.md` dentro del repositorio
- Documentación de configuración online: `Qwen3-ASR-0.6B-w4a16-8-online/README.md` dentro del repositorio
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-ASR-Qwen3-ASR-0.6B`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-ASR-Qwen3-ASR-0.6B --revision v1.1.0`
