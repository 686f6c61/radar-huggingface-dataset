# YXNiu/player

## Resumen

GamePlayer SFT v2-1 (repositorio `YXNiu/player`) es un adaptador LoRA de tipo PEFT sobre el modelo vision-lenguaje `lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct`, especializado en imitar el protocolo de control de un agente que juega a videojuegos en primera persona. No es un modelo de propósito general: es un ajuste supervisado (SFT) que convierte observaciones multimodales (historial de vídeo Codec a 10 fps más una imagen RGB actual) en secuencias de acciones discretas de 100 ms. Lo publica el autor YXNiu junto a un repositorio privado (FPSplayer) que contiene el runtime, las reglas y el empaquetado de datos necesario para ejecutarlo.

El interés técnico está en que expone con detalle un caso poco habitual: adaptación de un VLM de 8B a un contrato de entrada/salida estricto (cabecera `<p>`, ocho acciones `<a>` y terminador `<eoc>`), con congelación total del encoder visual, el proyector y los pesos del lenguaje, y entrenamiento exclusivo de 87.293.952 parámetros en las proyecciones q/k/v/o y gate/up/down. La model card publica curvas de validación y test, y dos checkpoints del mismo run de una época (0,75 y 1,00 época) para comparar.

Es relevante ahora por dos motivos: primero, porque documenta una mejora enorme en el cumplimiento del formato de salida (del 38,0% al 100,0% en 1.000 respuestas generadas) manteniendo la entropía cruzada de validación en torno a 0,436; segundo, porque el propio autor advierte de que la imitación offline del protocolo no se traduce automáticamente en puntería, combate, exploración o recuperación fiables en línea, lo que lo convierte en un caso de estudio honesto sobre el gap entre pérdida de validación y capacidad agéntica real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal vision-lenguaje: modelo base LLaVA-OneVision-2 (encoder visual + proyector + torre de lenguaje), con encoder, proyector y pesos de lenguaje congelados. LoRA r=32, alpha=64, dropout=0.05 sobre q/k/v/o y gate/up/down |
| Parametros totales | Modelo base de 8B (según el identificador `LLaVA-OneVision-2-8B-Instruct`); desglose exacto no disponible. Adaptador entrenable: 87.293.952 parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 12.288 tokens de longitud máxima de secuencia en entrenamiento (sin truncamiento silencioso); la ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | No disponible. Se publican adaptadores y copias fusionadas en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache-2.0 (el modelo base declara Apache-2.0) |
| Formato de pesos | safetensors (adaptadores PEFT y carpetas fusionadas exportadas en CPU) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 sobre la torre de lenguaje de LLaVA-OneVision-2-8B-Instruct, en la revisión fijada `878cde7e04fd962a6082951d8f83083a73fea588`. Se congelan el encoder visual, el proyector y los pesos del lenguaje; solo se entrenan las proyecciones q/k/v/o de atención y gate/up/down del MLP (87,3M de parámetros). El contrato de entrada es mixto y no trivial: historial causal de vídeo Codec a 10 fps con hasta siete rondas previas de 0,8 segundos (5,6 segundos en total), más una imagen RGB actual con un tope de 1.003.520 píxeles, más controles específicos de juego y modo, la tarea y el protocolo de salida completo. No se incluyen comandos de acción históricos ni estado oculto del entorno, y el historial cero o corto es válido. La salida es una cabecera `<p>`, ocho acciones `<a>` de 100 ms cada una y `<eoc>`; yaw y pitch son giros relativos de 0,1 grados por unidad, con derecha y abajo positivos.

El entrenamiento usó 853.696 ejemplos de entrenamiento, 17.742 de validación y 18.049 de test, procedentes de P2P, CrossFPS y Gaming500, preservando la supervisión original de acciones y las particiones por grupo de origen, sin mezclar correcciones en línea ni ejemplos de QA. Se ejecutó en ocho GPU A100 en BF16, con batch efectivo 64, AdamW fusionado, learning rate 5e-5, 667 pasos de warmup, schedule coseno, una época y 13.339 pasos de optimizador. Solo los tokens de respuesta del asistente contribuyen a la pérdida y todos los ejemplos pesan igual. La innovación destacable no es arquitectónica sino de ingeniería de datos y de contrato: empaquetado diferenciado de los canvas Codec y de la imagen actual conservando posiciones temporales y espaciales, y una disciplina de formato que se refleja en el 100% de cumplimiento estricto.

## Capacidades

- Generación de secuencias de acción de videojuego en primera persona: ocho acciones de 100 ms con cabecera `<p>` y terminador `<eoc>`.
- Comprensión de vídeo corto causal (hasta 5,6 segundos a 10 fps) combinada con una imagen RGB de alta resolución del instante actual.
- Razonamiento viso-espacial orientado a control: giros relativos de yaw/pitch con resolución de 0,1 grados.
- Cumplimiento estricto de protocolo de salida (100% en 1.000 respuestas de test) frente al 38,0% del modelo base.
- Condicionamiento por controles específicos de juego y modo, además de la tarea solicitada.
- Capacidad multimodal texto-imagen-vídeo heredada del modelo base (pipeline `video-text-to-text`).
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso explícito.
- No se documenta modo thinking, audio ni otras modalidades adicionales.

## Casos de uso

- Investigación en agentes que juegan a FPS: usar el adaptador como política de imitación offline para estudiar cómo un VLM de 8B traduce observaciones visuales en acciones de 100 ms, con un contrato de salida ya validado al 100% de formato.
- Generación de trayectorias sintéticas para entrenamiento: producir secuencias de acción etiquetadas sobre vídeo de gameplay y emplearlas como datos aumentados en un pipeline de behaviour cloning supervisado.
- Evaluación de empaquetado multimodal: banco de pruebas para verificar que un input packer que mezcla canvas Codec y RGB actual conserva posiciones temporales y espaciales, comparando contra el packer de producción.
- Verificación de conformidad de protocolo en CI: el modelo sirve como referencia de formato (cabecera, ocho acciones, terminador) para tests automáticos de parsers y validadores de acciones.
- Estudio del gap offline/online: comparar la entropía cruzada de validación (0,4358 en el checkpoint de 0,75 época) con el rendimiento real en partida para investigar la correlación entre pérdida y competencia agéntica.
- Base para ajuste fino de nuevos protocolos de control: al ser un adaptador LoRA sobre un VLM congelado, sirve de punto de partida para otros dominios que necesiten mapear vídeo corto más imagen a comandos discretos.
- Análisis comparativo de checkpoints: los dos adaptadores publicados (0,75 y 1,00 época) permiten estudiar diferencias de actividad y estabilidad con pérdidas de validación casi idénticas (0,4358 frente a 0,4370).

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (entropía cruzada sobre tokens de respuesta; el formato estricto se mide sobre 1.000 respuestas de test generadas):

| Metrica | Base oficial | 0,75 epoca (step 10005) | 1,00 epoca (step 13339) |
|---|---:|---:|---:|
| Entropía cruzada validación completa | 0,608932 | 0,435791 | 0,436962 |
| Entropía cruzada test completo | 0,607928 | 0,444949 | 0,445382 |
| Formato estricto (1.000 respuestas de test) | 38,0% | 100,0% | 100,0% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni métricas de juego tipo win rate o precisión de puntería) en la información disponible. El autor indica explícitamente que la imitación offline del protocolo no garantiza puntería, combate, exploración ni recuperación fiables en línea, y que el checkpoint de 0,75 época se mostró más activo que el de 1,00 en las pruebas online registradas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 8B; en BF16 los pesos ocupan del orden de 16-17 GB, por lo que se recomienda un mínimo de 24 GB de VRAM para contexto corto y 40 GB o más para secuencias cercanas a los 12.288 tokens con caché KV. Estimación orientativa, no publicada por el autor.
- GPU recomendadas: A100 40/80 GB (el entrenamiento se hizo en 8×A100) y H100 para servir con contexto largo; una RTX 4090 de 24 GB puede alojar el modelo en BF16 solo con contexto reducido y sin margen.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) con contexto corto; en GPUs de 16 GB o menos requeriría cuantización, que no está documentada para este adaptador.
- Opciones de despliegue: ruta validada con Transformers 5.7.0, PEFT 0.21.2 y codec-video-prep 0.2.5, cargando el adaptador con `PeftModel.from_pretrained` y, si se desea, fusionando una copia separada con `merge_and_unload(safe_merge=True)`. No se documenta soporte verificado en vLLM, TGI, llama.cpp ni Ollama.
- Requisito adicional de ejecución: el empaquetado mixto Codec/RGB de producción y un adaptador de acciones específico del juego, que no se incluyen en el repositorio de pesos.
- Latencia y throughput: no disponibles.
- Tamaño del repositorio: 17,8 GB (adaptadores más copias fusionadas exportadas en CPU; no se detalla el tamaño de cada copia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CE test | Formato estricto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GamePlayer SFT v2-1, 0,75 época | 8B (base) + 87,3M LoRA | 12.288 tokens (entrenamiento) | 0,444949 | 100,0% | Apache-2.0 | Público en HF |
| GamePlayer SFT v2-1, 1,00 época | 8B (base) + 87,3M LoRA | 12.288 tokens (entrenamiento) | 0,445382 | 100,0% | Apache-2.0 | Público en HF |
| LLaVA-OneVision-2-8B-Instruct (base) | 8B | No disponible | 0,607928 | 38,0% | Apache-2.0 | Público en HF |
| Adaptadores de juego de terceros | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas comparables con datos públicos en la información disponible |

La comparación relevante es interna: ambos checkpoints empatan en formato estricto y difieren en 0,0012 de entropía cruzada de test, mientras que el modelo base sin ajustar obtiene una pérdida mucho mayor y falla el protocolo en el 62% de los casos. No se dispone de datos para comparar con otras políticas de juego basadas en VLM.

## Limitaciones y advertencias

- No es una política de juego autónoma fiable: el autor declara que la mejora en imitación offline del protocolo no se traduce automáticamente en puntería, combate, exploración o recuperación en línea, y que ninguno de los dos checkpoints "juega bien a todos los juegos".
- Requiere infraestructura no incluida: los pesos no incluyen los assets del juego, los datos de entrenamiento, el runner online completo ni el adaptador de acciones específico del juego; el repositorio FPSplayer es privado.
- El preprocesado solo de vídeo no sustituye al contrato de entrada mixto: hace falta el input packer que expande canvas Codec e imagen actual conservando posiciones temporales y espaciales.
- Las anotaciones de ángulos de las fuentes de entrenamiento incluyen estimaciones aproximadas o generadas por profesor, lo que introduce ruido en la supervisión de yaw/pitch.
- Solo se admiten inglés y chino; no hay soporte documentado de otros idiomas.
- Riesgo de alucinación y de deriva de formato fuera de distribución: el 100% de formato estricto se midió sobre el test del mismo dominio, no sobre juegos o modos no vistos.
- La fusión de adaptadores no recupera de forma única los factores A/B originales ni el estado del optimizador; para reproducir el entrenamiento hace falta el archivo privado del autor.
- La interrupción por eventos está desactivada en el contrato de salida; solo la terminación nativa del episodio detiene la ejecución.
- Licencia Apache-2.0 permite uso comercial, pero el uso práctico queda limitado por la dependencia de un runtime privado y de assets con su propia licencia.
- No hay validación publicada en vLLM, llama.cpp ni Ollama, ni datos de latencia, por lo que el dimensionado para producción debe medirse in situ.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YXNiu/player
- Modelo base: https://huggingface.co/lmms-lab-encoder/LLaVA-OneVision-2-8B-Instruct
- Repositorio del proyecto (privado, tag `sft-v2-1`): https://github.com/YXNiu/FPSplayer
- Otro modelo del mismo autor: https://huggingface.co/YXNiu/YX-model
- Árbol de archivos de ese modelo: https://huggingface.co/YXNiu/YX-model/tree/main
- Contexto sobre agentes de IA en videojuegos (patente Sony): https://www.ign.com/articles/sony-patent-would-let-an-ai-model-train-npcs-based-on-your-player-data
- Calendario de lanzamientos de modelos de IA: https://www.scriptbyai.com/ai-model-release-calendar/
- Directorio y matriz de benchmarks de modelos: https://www.modelvault.space/
