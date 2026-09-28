# XiaomiMiMo/MiMo-V2.6-Flash-MOPD

## Resumen

MiMo-V2.6-Flash-MOPD es un modelo multimodal de Xiaomi (organización XiaomiMiMo) construido sobre el checkpoint MiMo-V2.6-Flash-RL mediante una etapa adicional de destilación on-policy denominada MOPD2. Se trata de un modelo de lenguaje de arquitectura MoE dispersa con 309B parámetros totales y 15B activados por token (el recuento real de safetensors asciende a 310.756.322.688 parámetros), ventana de contexto de 1M tokens y capacidades nativas de texto, imagen, vídeo y audio. Su licencia es MIT, lo que permite uso comercial sin restricciones de atribución más allá de las habituales.

El problema concreto que resuelve esta versión respecto a su predecesor es la repetición de tool calls en entornos agénticos: el modelo emitía llamadas idénticas o muy similares de forma reiterada, consumiendo tiempo y contexto sin progresar. MOPD2 fusiona varios profesores especializados por dominio (tanto profesores de mixRL sobre tareas verificables como profesores de SFT sobre dominios de recompensa difícil) en un único estudiante mediante tres flujos de supervisión: MOPD estándar, Teacher-Prefix OPD y SFT-Prefix OPD.

Es relevante ahora porque combina tres elementos poco frecuentes en un modelo abierto: contexto de 1M tokens, omnimodalidad nativa y un decodificador especulativo de 5 capas (Multi-Token Prediction) integrado, todo bajo licencia permisiva. La model card no publica resultados de benchmarks numéricos, por lo que la evaluación comparativa queda pendiente de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE dispersa (Mixture of Experts) con backbone híbrido SWA/GA y codificadores ómnimodales |
| Parámetros totales | 309B según la model card; 310.756.322.688 según safetensors |
| Parámetros activos | 15B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | Los tags del repositorio indican 8-bit y fp8; no se documentan cuantizaciones GGUF en la información disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (tamaño del repositorio: 177,8 GB) |

Detalles arquitectónicos adicionales declarados por el autor:

| Componente | Valor |
|---|---|
| Capas totales / SWA / GA | 48 / 39 / 9 |
| Hidden size | 4096 |
| Cabezas SWA (Q/KV) | 64 / 8 |
| Cabezas GA (Q/KV) | no disponible (truncado en la model card) |
| Codificador de visión | MiMo ViT de 681M parámetros (28 capas: 24 SWA + 4 Full) |
| Codificador de audio | AudioTokenizer de 308M + patch encoder de audio de 127M |
| Decodificador especulativo (MTP) | 5 capas |

## Arquitectura y entrenamiento

El backbone es un transformer MoE disperso con 48 capas, de las cuales 39 usan atención de ventana deslizante (SWA) y 9 usan atención global (GA). El hidden size es 4096 y las capas SWA emplean 64 cabezas de consulta frente a 8 de clave/valor, una configuración de GQA agresiva que reduce el coste de caché KV. La combinación SWA/GA es la que hace viable una ventana de 1M tokens sin un crecimiento lineal insostenible de memoria. Sobre el backbone se añaden tres bloques: un codificador de visión MiMo ViT de 681M parámetros, un frontal de audio compuesto por un AudioTokenizer de 308M y un patch encoder de 127M, y un decodificador especulativo MTP de 5 capas que acelera la generación prediciendo varios tokens por paso.

El entrenamiento de esta ficha corresponde a la etapa MOPD2 aplicada sobre MiMo-V2.6-Flash-RL. MOPD2 destila profesores especializados por dominio en el estudiante de forma on-policy, con tres flujos que alimentan una única actualización: MOPD estándar (los profesores mixRL supervisan rollouts autónomos completos), Teacher-Prefix OPD (cada trayectoria de k turnos de asistente genera k prefijos de historial, el modelo produce un turno nuevo desde cada uno y el profesor lo puntúa contra ese mismo historial) y SFT-Prefix OPD (el prefijo proviene de demostraciones SFT y el modelo escribe su propia continuación). Los profesores se dividen en dos familias: profesores mixRL entrenados sobre tareas verificables y profesores SFT entrenados sobre demostraciones sintéticas para dominios abiertos donde diseñar una recompensa fiable es difícil, como desarrollo de videojuegos de horizonte largo, investigación científica e inteligencia corpórea. La corrección de la repetición de tool calls se abordó con una ejecución corta de un profesor especializado que se integra en la pasada normal de MOPD y converge rápidamente. No se especifican en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y chino.
- Comprensión de imagen mediante el codificador MiMo ViT de 681M parámetros.
- Comprensión de vídeo, declarada explícitamente en los tags del repositorio (`video-understanding`).
- Comprensión de audio mediante AudioTokenizer y patch encoder dedicados.
- Razonamiento agéntico con tool calling y function calling, con mitigación específica de la repetición de llamadas.
- Razonamiento multi-paso en entornos con arnés de agente (agent harnesses), según la figura de tasa de repetición incluida en la model card.
- Contexto largo de hasta 1M tokens, adecuado para documentos y sesiones extensas.
- Decodificación especulativa mediante MTP de 5 capas.
- Capacidades multilingües limitadas a inglés y chino según la metadata declarada.
- Modo de pensamiento explícito: la información proporcionada no lo confirma ni lo descarta.

## Casos de uso

- Agentes autónomos con tool calling prolongado: la corrección de la repetición de llamadas ataca directamente el fallo más habitual en bucles agénticos largos, donde el modelo reemite la misma herramienta sin avanzar. Es el escenario para el que se diseñó explícitamente esta versión.
- Análisis de documentación técnica extensa: con 1M tokens de contexto se puede cargar un repositorio completo, un pliego o un conjunto de normativa y consultarlo sin troceado ni recuperación externa.
- Transcripción y análisis de reuniones con audio y vídeo: al integrar codificador de audio y de visión, permite procesar la grabación y el material de pantalla compartida en una misma pasada.
- Revisión de vídeo para control de calidad industrial o monitorización: el tag `video-understanding` habilita tareas de descripción, detección de eventos y resumen sobre secuencias.
- Asistencia al desarrollo de videojuegos de horizonte largo: es uno de los dominios que la etapa MOPD2 cubre mediante profesores SFT, pensado para tareas donde la verificación automática de recompensa es difícil.
- Investigación científica asistida: otro de los dominios objetivo declarados de MOPD2, orientado a flujos de trabajo largos con pasos intermedios no verificables automáticamente.
- Robótica e inteligencia corpórea: tercer dominio declarado de MOPD2, donde el modelo actuaría como planificador de alto nivel sobre observaciones multimodales.
- Documentación y soporte técnico bilingüe inglés-chino: cubre los dos idiomas declarados, útil para organizaciones con operación en ambos mercados.
- Generación de código dentro de pipelines de CI/CD: puede invocarse mediante function calling para consultar el estado de una build, abrir incidencias o proponer parches, con la ventaja de que el fallo de repetición está mitigado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye una figura cualitativa con la tasa de repetición de tool calls a nivel de respuesta en MiMo-V2.6-Flash, comparando la etapa RL con este checkpoint a través de distintas longitudes de contexto y arneses de agente, pero sin cifras numéricas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados del recuento de safetensors; no confirmados por el autor):
  - BF16: en torno a 620 GB solo para pesos.
  - FP8 / 8-bit: en torno a 311 GB solo para pesos.
  - 4-bit: en torno a 155-175 GB solo para pesos.
- GPU recomendadas: para BF16 se necesitan al menos 8 GPU de 80 GB (H100, H200 o A100 80 GB). Para FP8, 4 GPU de 80 GB con soporte nativo de FP8 (H100/H200; las A100 no aceleran FP8 por hardware). Para 4-bit, 2 GPU de 80 GB o 2 H200 de 141 GB.
- ¿Cabe en GPU de consumo? No de forma directa. Una RTX 4090 con 24 GB no puede alojar el modelo ni en 4-bit. Serían necesarias al menos 8 RTX 4090 (192 GB agregados) para la variante 4-bit, con el sobrecoste de comunicación entre GPU y sin soporte práctico de FP8 en Ada.
- Opciones de despliegue: la librería declarada es `transformers` con la etiqueta `custom_code`, por lo que requiere `trust_remote_code=True`. La model card no confirma compatibilidad explícita con vLLM, SGLang, TGI, llama.cpp u Ollama; dado el tamaño y la arquitectura MoE híbrida, el despliegue en producción dependerá de que estos motores implementen el modelo. No se documentan pesos GGUF en la información disponible.
- Latencia y throughput: no disponibles. Como referencia estructural, al activar solo 15B parámetros por token el coste computacional por token es propio de un modelo de ~15B, aunque el requisito de memoria es el de un modelo de ~310B.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Licencia | Etapa |
|---|---|---|---|---|---|
| MiMo-V2.6-Flash-MOPD | 309B total / 15B activos | 1M | Texto, imagen, vídeo, audio | MIT | MOPD2 sobre Flash-RL |
| MiMo-V2.6-Flash-RL | no disponible | no disponible | Ómnimodal | MIT (según el repositorio enlazado) | RL |
| MiMo-V2.6-Pro-MOPD | no disponible | no disponible | Ómnimodal | MIT (según el repositorio enlazado) | MOPD sobre Pro-RL |
| MiMo-V2.6-Pro-RL | no disponible | no disponible | Ómnimodal | MIT (según el repositorio enlazado) | RL; descrito por el autor como el modelo más capaz de la familia |

No se dispone en la información proporcionada de datos de rendimiento que permitan comparar estas variantes entre sí ni con modelos de otros fabricantes. La única diferencia documentada entre Flash y Pro es que Pro se presenta como el modelo más capaz de la familia, sin cifras que lo cuantifiquen.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está garantizado ni documentado.
- Repetición de tool calls: mitigada, no eliminada. La propia model card la describe como un fallo fácil de pasar por alto porque nada falla de forma explícita; conviene monitorizar la tasa de llamadas duplicadas en producción.
- Discrepancia en el recuento de parámetros: la model card declara 309B totales mientras que safetensors reporta 310.756.322.688. Hay que verificar la cifra antes de dimensionar infraestructura.
- Tamaño del repositorio: 177,8 GB es inferior a lo esperable para 310B parámetros en BF16, lo que sugiere que los pesos publicados están en una precisión reducida; la model card no especifica la precisión exacta de los pesos alojados.
- Riesgo de alucinación: no se documenta ninguna evaluación de fidelidad factual ni tasas de alucinación. Es un modelo destilado de profesores, con el riesgo asociado de heredar sus sesgos.
- Sesgos conocidos: no se documentan en la información disponible. No hay sección de consideraciones éticas ni de sesgos en el material proporcionado.
- Uso comercial: la licencia MIT es permisiva y no restringe el uso comercial, pero conviene revisar los términos de los recursos de terceros que puedan acompañar al modelo.
- Requisitos de memoria: 310B parámetros exigen infraestructura de múltiples GPU incluso en 4-bit; no es desplegable en hardware de consumo convencional.
- Documentación incompleta: la tabla de arquitectura de la model card está truncada (falta el valor de cabezas GA), y no se publican tokens de entrenamiento, composición de dataset ni resultados de benchmarks.
- Madurez: el repositorio registra 0 descargas y 12 likes en el momento de la consulta, por lo que la validación independiente por parte de la comunidad es prácticamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Checkpoint base (RL): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL
- Variante Pro (MOPD): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-MOPD
- Variante Pro (RL): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- ModelScope: https://www.modelscope.cn/models/XiaomiMiMo/MiMo-V2.6-Flash-MOPD
- Blog de la serie MiMo-V2.6: https://mimo.xiaomi.com/mimo-v2-6
- Informe técnico (PDF): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Flash-RL/blob/main/MiMo_V2_6_technical_report.pdf
- Blog técnico sobre repetición de tool calls: https://mimo.xiaomi.com/blog/mimo-v2-6-tool-call-repetition
- Plataforma API de Xiaomi MiMo: https://platform.xiaomimimo.com
- Xiaomi MiMo Studio: https://aistudio.xiaomimimo.com
- Xiaomi MiMo Desktop: https://mimo.xiaomimimo.com/desktop/
- Página del modelo en mi.mi.com: https://mimo.mi.com/models/en-US/mimo-v2.6-flash
- Organización en HuggingFace: https://huggingface.co/XiaomiMiMo
- Repositorio de GitHub referenciado en las figuras de la model card: https://github.com/XiaomiMiMo/MiMo
- Discord: https://discord.gg/kKC2kNnQEX
- Telegram: https://t.me/+3T-I0pekOVIyNDBl
- Reddit: https://www.reddit.com/r/XiaomiMiMo_Official/
- Grupo de WeChat: https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro/blob/main/assets/wechat.jpg
