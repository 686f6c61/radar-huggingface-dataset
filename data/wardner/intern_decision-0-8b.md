# wardner/Intern_Decision-0.8B

## Resumen

Intern-Decision-0.8B es un modelo multimodal de decisión desarrollado por Shanghai AI Laboratory (InternLM) que no genera texto libre, sino que emite logits sobre 62 símbolos candidatos (`A-Z`, `a-z`, `0-9`) para cada campo de decisión definido en una tarea. Este repositorio concreto (`wardner/Intern_Decision-0.8B`) no contiene los pesos originales en safetensors, sino una exportación cuantizada en formato RKNN para inferencia en NPU de coprocesadores Rockchip (RK1820 / RK3588), pensada para ejecutarse mediante el SDK `wdnai`.

El modelo resuelve un problema muy específico: clasificación estructurada y puntuación de contenido (texto e imagen) en dispositivos de borde, con salidas interpretables como probabilidades. Admite tres tipos de campo: `choice` (selección entre opciones con probabilidades normalizadas), `score` (puntuación ponderada por probabilidad) y `noul` (probabilidad de sí/no independiente por criterio). Con 0,8B parámetros y una ventana de contexto no documentada en la información disponible, está pensado para coexistir con otros modelos en la misma tarjeta aceleradora.

Su relevancia actual radica en el despliegue local de modelos de decisión multimodales sobre hardware de bajo consumo: la exportación ocupa unos 1,1 GB en el repositorio, requiere aproximadamente 900 MB de VRAM estimada y mantiene el codificador visual residente para evitar latencias de primera carga en peticiones con imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LLM con capas de linear attention + codificador visual); detalles completos no disponibles |
| Parametros totales | 0,8B (según nombre del modelo) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Exportación RKNN cuantizada (formato propietario Rockchip); no se detallan bits ni esquemas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (incluye LICENSE y LICENSE-QWEN del upstream) |
| Formato de pesos | RKNN (`.rknn` + `.weight` + `.embed.bin`), tokenizer en GGUF (`.tokenizer.gguf`), manifiesto JSON |

## Arquitectura y entrenamiento

El modelo upstream es un transformer multimodal de 0,8B parámetros con un codificador visual que procesa imágenes a 384×384 (redimensionado por estiramiento completo y escalado RGA). Incluye capas de linear attention, lo que implica que el estado recurrente persiste entre llamadas y obliga a recrear la sesión del LLM por cada campo de decisión (`recreate_llm_session()`), ya que `keep_history=0` limpia la caché KV pero no el estado recursivo. El tokenizer es el `qwen35` con vocabulario de 248.320 tokens y EOS en 248.046, compartido con la variante de 4B.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La exportación RKNN incluye dos grafos separados (LLM y visión) con sus pesos, una tabla de embeddings de 485 MB y un pre-tokenizador GGUF. La temperatura de calibración de probabilidades se deriva en tiempo de ejecución del `embedding_dim` embebido en el `LLM_CONFIG` (1024 en este modelo, frente a 2560 en el 4B), resultando en 2,747760550703.

## Capacidades

- Decisión estructurada sobre texto e imagen: emite logits sobre 62 símbolos para cada campo definido en la tarea.
- Campos `choice`: selección entre opciones con probabilidades normalizadas (suman 1).
- Campos `score`: puntuación ponderada por probabilidad.
- Campos `noul`: probabilidad de sí/no por criterio, sin normalización entre criterios.
- Procesamiento multimodal imagen-texto: codificador visual de 384×384 con preprocesado por estiramiento completo.
- Soporte de razonamiento interno mediante tokens de control `` (ids 248068 / 248069) y token `<decision>` (248077).
- No genera texto libre: no es un modelo conversacional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no aplica según el diseño del modelo (una decisión por campo, sesión recreada por campo).
- Capacidades multilingües: no documentadas.

## Casos de uso

- Moderación de contenido publicitario en el borde: clasificar anuncios con campos `noul` como «广告» (contiene publicidad) y «诈骗» (posible fraude), ejecutando el modelo en la NPU de un RK3588 sin enviar datos a la nube.
- Filtrado de spam en pasarelas de mensajería: puntuar mensajes entrantes con campos `score` para priorizar revisión humana, aprovechando la baja huella de VRAM (~900 MB) para convivir con otros servicios en la misma tarjeta.
- Clasificación de tickets de soporte: usar campos `choice` para asignar categoría (por ejemplo, `account`, `billing`, `technical`) con probabilidades normalizadas que permitan umbrales de confianza y derivación automática.
- Triaje de imágenes en cámaras o dispositivos IoT: el codificador visual residente permite evaluar capturas 384×384 sin latencia de primera carga, útil en inspección visual o detección de contenido sensible.
- Enrutamiento de formularios y documentos escaneados: combinar prompt de texto con imagen adjunta para decidir tipo de documento y urgencia, devolviendo `{"category": ..., "urgency": ...}` consumible por un backend.
- Evaluación de riesgo en pipelines de contenido generado: aplicar campos `noul` independientes (toxicidad, suplantación, contenido ilegal) sobre texto e imagen antes de publicar, con probabilidades calibradas por temperatura.
- Clasificación de intención en asistentes de voz embebidos: sustituir un LLM generativo por este modelo de decisión para reducir consumo y latencia en dispositivos con NPU Rockchip.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~900 MB con LLM y codificador visual residentes (estimación del autor por extrapolación del 4B, no medida en este modelo).
- Inicialización estimada: ~30 segundos (estimación, no medida; el 4B tarda ~60 s medidos).
- Hardware objetivo: coprocesadores Rockchip RK1820 y RK3588 con NPU; no se contempla ejecución en GPU convencional con esta exportación.
- No cabe en GPU de consumo en este formato: los pesos RKNN no son cargables con `transformers`, vLLM, llama.cpp ni Ollama.
- Despliegue: SDK `wdnai` (`SystemLanguageModel.intern_decision_0_8b()`), con directorio por defecto `/userdata/models/Intern_Decision-0.8B` o variable `WDNAI_INTERN_DECISION_0_8B_DIR`.
- Latencia y throughput: no disponibles.
- Convivencia: el autor indica que puede coexistir con otros modelos en la misma tarjeta aceleradora por su bajo consumo de VRAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| wardner/Intern_Decision-0.8B | 0,8B | no disponible | RKNN | Apache-2.0 | Exportación para NPU Rockchip |
| internlm/Intern-Decision-0.8B (upstream) | 0,8B | no disponible | safetensors (presumible) | Apache-2.0 | Pesos originales; misma especificación de tokenizer y protocolo |
| Intern-Decision-4B (referencia del autor) | 4B | no disponible | RKNN | Apache-2.0 | Misma familia, ~4× tamaño, ~3200 MB VRAM y ~60 s de inicialización medidos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto; solo produce logits de decisión. Un uso como chatbot dará resultados inválidos.
- Requiere pasar una configuración de tarea (`task=`) con los campos y criterios; sin ella no hay salida interpretable.
- Obligatorio recrear la sesión del LLM por cada campo debido al estado recurrente de las capas de linear attention; `keep_history=0` no es suficiente.
- El `chat_template` exportado está vacío: los marcadores ChatML deben ir en el texto del prompt y el lado C debe usar `set_chat_template("", "", "")`.
- Los tokens de control deben registrarse como tokens únicos en la instancia del tokenizer del modelo, fusionando (no reemplazando) `additional_special_tokens`; de lo contrario se pierden los tokens de visión de Qwen y el prompt de imagen queda incompleto.
- La regex de pre-tokenización debe seleccionarse según `tokenizer.ggml.pre` del GGUF; usar la regex GPT-2 de ByteLevel provoca desalineación de ids.
- La temperatura de calibración depende del `embedding_dim` (1024 aquí, 2,747760550703); no debe codificarse a mano.
- Las cifras de VRAM (900 MB) e inicialización (30 s) son estimaciones no verificadas en este modelo.
- Sesgos, tasa de alucinación y comportamiento multilingüe: no documentados.
- Licencia Apache-2.0 permite uso comercial, pero deben conservarse los avisos de LICENSE, LICENSE-QWEN y NOTICE del repositorio.
- El repositorio usa Git LFS: es necesario `git lfs pull` tras el clonado para obtener los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wardner/Intern_Decision-0.8B
- Modelo upstream: https://huggingface.co/internlm/Intern-Decision-0.8B
- Resultado de búsqueda web (no relacionado con el modelo): https://communaute.orange.fr/t5/Mon-telephone-par-internet-et/D%C3%A9tail-de-mes-communications-depuis-mon-fixe/td-p/3437269
