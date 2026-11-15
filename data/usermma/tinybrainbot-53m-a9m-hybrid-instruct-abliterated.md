# usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated

## Resumen

`tinybrainbot-53m-a9m-hybrid-instruct-abliterated` es un modelo de lenguaje de muy pequeño tamaño (53,4 millones de parámetros totales) publicado por el usuario `usermma` en Hugging Face. Se trata de una variante "abliterated" del modelo base `nkthebass/tinybrainbot-53m-a9m-hybrid-instruct`, obtenida mediante la herramienta OBLITERATUS con el método `advanced`, que aplica ingeniería de activaciones para eliminar el comportamiento de rechazo (refusal) del modelo original.

El modelo pertenece a la familia arquitectónica `lfm2_moe`, lo que sugiere una arquitectura de mezcla de expertos (MoE) de tipo híbrido, aunque la información publicada no detalla la composición interna ni el número de parámetros activos. Con 53 millones de parámetros totales, está en la categoría de modelos ultraligeros, pensados para experimentación, prototipado rápido y despliegue en entornos con recursos muy limitados.

Su relevancia es fundamentalmente experimental: sirve como banco de pruebas para técnicas de abliteración sobre modelos pequeños y para estudiar el comportamiento de arquitecturas MoE híbridas a escala reducida. No está pensado para tareas de producción de alta exigencia, y su model card es mínima, sin datos de entrenamiento, benchmarks ni licencia declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `lfm2_moe` (mezcla de expertos, híbrida; detalles internos no disponibles) |
| Parámetros totales | 53.428.384 (53,4 M) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización GGUF/AWQ/GPTQ no publicada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | `nkthebass/tinybrainbot-53m-a9m-hybrid-instruct` |
| Método de modificación | abliteration (`advanced`) vía OBLITERATUS |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura declarada es `lfm2_moe`, etiqueta que apunta a un transformer con capas de mezcla de expertos y posiblemente componentes híbridos (atención más capas recurrentes o de estado), siguiendo el linaje de la familia LFM2. Sin embargo, la model card no especifica el número de capas, la dimensión oculta, el número de expertos, el mecanismo de enrutamiento ni los parámetros activos por token. Con 53,4 M de parámetros totales, se trata de un modelo de escala muy reducida, probablemente entrenado desde cero o con un ajuste ligero sobre una base pequeña.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado más allá de la denominación "instruct" del modelo base. La modificación aplicada, la abliteración con método `advanced`, consiste en identificar direcciones de activación asociadas al comportamiento de rechazo y proyectarlas fuera de los pesos o de las activaciones, de modo que el modelo deja de emitir respuestas de negativa ante determinadas peticiones. Esta técnica no reentrena el modelo: altera sus representaciones internas, lo que puede degradar capacidades generales si la intervención es agresiva.

## Capacidades

- Generación de texto autoregresiva en inglés, con un límite práctico derivado de su tamaño (53 M de parámetros), adecuada para frases cortas y respuestas simples.
- Comportamiento "instruct": el modelo base está ajustado para seguir instrucciones, aunque a esta escala la fidelidad es limitada.
- Ausencia de rechazo (uncensored): la abliteración elimina o reduce las negativas del modelo ante peticiones que el original rechazaría.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés declarado; no hay evidencia de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking".
- No se documenta ventana de contexto larga; el dato no está disponible.

## Casos de uso

- Experimentación con técnicas de abliteración: sirve para comparar el comportamiento del modelo base frente a la variante modificada y medir el impacto de la intervención en las activaciones, dado su pequeño tamaño y su rápida carga en memoria.
- Investigación sobre seguridad y alineación: permite estudiar cómo se distribuyen las direcciones de rechazo en modelos MoE de escala reducida y validar metodologías como OBLITERATUS en entornos controlados.
- Prototipado de pipelines de generación de texto: su huella de 0,1 GB permite integrarlo en scripts de prueba para validar tokenizadores, plantillas de prompt y flujos de inferencia antes de escalar a modelos mayores.
- Docencia y demostraciones: útil para explicar arquitecturas MoE y técnicas de edición de modelos en cursos o talleres, ya que se ejecuta en CPU o en GPU de gama baja.
- Pruebas de robustez de filtros: al carecer de refusal, puede emplearse como caso de prueba para evaluar sistemas de moderación y clasificadores de contenido en pipelines de seguridad.
- Evaluación de despliegue en entornos embebidos: con 53 M de parámetros, es candidato para probar inferencia en dispositivos con memoria muy limitada, aunque la calidad de salida será baja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,21 GB solo para pesos (53,4 M × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en fp16/bf16: alrededor de 0,11 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU con al menos 2 GB de VRAM (GTX 1050, RTX 3050, RTX 4090, A100, H100) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU y en Raspberry Pi con suficiente RAM.
- Opciones de despliegue: `transformers` (según el ejemplo de la model card); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y al no publicarse pesos GGUF no se puede confirmar su uso en llama.cpp u Ollama.
- Latencia y throughput: no disponibles; a este tamaño se espera una latencia de milisegundos por token en CPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated` | 53,4 M | no disponible | no disponible | Variante abliterated, solo inglés |
| `nkthebass/tinybrainbot-53m-a9m-hybrid-instruct` | 53,4 M (presumiblemente) | no disponible | no disponible | Modelo base sin abliterar |
| SmolLM-135M (HuggingFaceTB) | 135 M | 2.048 tokens | Apache 2.0 | Referencia de modelo pequeño con licencia permisiva |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | Modelo pequeño con contexto largo y multilingüe |

La comparación con SmolLM-135M y Qwen2.5-0.5B es orientativa: no se dispone de benchmarks del modelo evaluado que permitan contrastar rendimiento. Además, la licencia del modelo no está declarada, lo que impide confirmar su uso comercial.

## Limitaciones y advertencias

- Calidad de generación muy limitada por su escala (53 M de parámetros): esperable coherencia baja en respuestas largas y alta tasa de errores factuales.
- Riesgo elevado de alucinación: sin datos de entrenamiento ni benchmarks, no hay garantías sobre la fiabilidad de sus salidas.
- Sesgos desconocidos: no se documenta la composición del dataset ni procesos de mitigación de sesgos.
- La abliteración puede degradar capacidades generales del modelo base; no se han publicado evaluaciones del impacto.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idioma limitado al inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada; no debe asumirse una ventana amplia.
- Sin soporte documentado de tool calling ni de despliegue en motores de inferencia optimizados (vLLM, TGI, llama.cpp).
- El modelo está diseñado para eliminar rechazos; su uso en producción requiere filtros de seguridad externos.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/usermma/tinybrainbot-53m-a9m-hybrid-instruct-abliterated
- Modelo base: https://huggingface.co/nkthebass/tinybrainbot-53m-a9m-hybrid-instruct
- OBLITERATUS (repositorio): https://github.com/elder-plinius/OBLITERATUS
