# Xinnian/shared-ttt-giga-fixed-multiqa

## Resumen

Shared TTT — GigaSpeech Fixed Multi-QA es un conjunto de pesos auxiliares (memoria TTT compartida audio/texto, empaquetador de prefijos y LoRA de lectura) diseñado para dotar de memoria de largo plazo a un modelo multimodal de audio y texto basado en SALMONN-omni. Lo desarrolla el usuario Xinnian y se distribuye en Hugging Face como un repositorio de 0,6 GB que no contiene el modelo base completo, sino únicamente los componentes entrenables sobre un backbone congelado.

El modelo subyacente es `llama31_er0_c30-48k`, un Llama 3.1 con 131.072 posiciones de contexto nativas, cargado mediante `checkpoint_loader: native_context`. Sobre él se añade una arquitectura de memoria "test-time training" (TTT) compartida entre las modalidades de audio y texto, con una política de escritura `fixed_write` y presupuestos separados para memoria, representación RAW y traspaso HANDOFF.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación sobre memoria persistente en modelos de voz, entrenado sobre GigaSpeech con supervisión causal únicamente sobre la respuesta. No hay información pública sobre benchmarks, licencia ni pipeline de uso, por lo que debe evaluarse como artefacto de laboratorio más que como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (backbone congelado) + memoria TTT compartida audio/texto + LoRA de lectura |
| Parámetros totales | no disponible (solo se distribuyen pesos auxiliares: TTT, prefix packer y LoRA; el backbone es una dependencia separada) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 posiciones nativas en el backbone; presupuestos de memoria: 2.048 (memoria), 1.024 (RAW), 3.072 (HANDOFF) slots |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | no disponible explícitamente; el export incluye pesos compactos de TTT, prefix packer y LoRA de lectura (el repo pesa 0,6 GB) |

## Arquitectura y entrenamiento

El sistema combina tres piezas: un encoder de voz y adaptador de voz congelados, un LLM base Llama 3.1 también congelado, y componentes entrenables formados por la memoria TTT compartida, el empaquetador de prefijos (prefix packer) y una LoRA de lectura con rango 128, alpha 128 y dropout 0,05 aplicada a `q_proj` y `v_proj`. La memoria TTT usa una política de commit `fixed_write` con intervalos de actualización de 256 slots y de commit de 512 slots, eta base 0,05 y residual RMS alpha 0,5. Se añade una pérdida de reconstrucción de tramos largos de 1.024 slots con peso 1,0 y balance de modalidades.

El entrenamiento se realizó sobre la versión de dataset GigaSpeech `multiqa_fixed_r20261019`, con 3.861 historias y 22.378 ejemplos de pregunta-respuesta, y un conjunto held-out de 500 historias con un QA por historia. El objetivo es pérdida causal solo sobre la respuesta (answer-only), con peso de pérdida TTS a 0. Se ejecutaron 5 épocas y 3.530 pasos de optimizador con batch efectivo de 32 (8 GPUs × microbatch 1 × acumulación de gradiente 4), learning rate externo 5e-6, schedule cosine con warmup ratio 0,03, weight decay 0,01, clipping 1,0, precisión BF16 y semilla 20260904. El checkpoint exportado corresponde a la época 5 / paso 3530. El estado de memoria se reinicia de forma independiente para cada ejemplo de QA, y las características de historial y consulta se codifican en línea con echo ratio 1,0.

## Capacidades

- Procesamiento de audio y texto de forma conjunta mediante el backbone multimodal SALMONN-omni.
- Memoria de largo plazo basada en test-time training, compartida entre modalidades de audio y texto.
- Respuesta a preguntas múltiples (multi-QA) sobre una misma historia de audio, con estado de memoria reiniciado por ejemplo.
- Reconstrucción de tramos largos (1.024 slots) con pérdida balanceada por modalidad.
- Lectura de memoria mediante LoRA dedicada sobre las proyecciones de query y value.
- Soporte de contexto nativo de 131.072 posiciones heredado del backbone Llama 3.1.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso.
- No se documenta modo de pensamiento (thinking), visión ni otras modalidades distintas de audio y texto.

## Casos de uso

- Respuesta a preguntas sobre grabaciones largas: el modelo puede mantener una memoria TTT de hasta 2.048 slots más 3.072 de traspaso HANDOFF para responder preguntas sucesivas sobre una misma historia de audio, evitando reprocesar todo el audio en cada consulta.
- Transcripción y resumen de reuniones: la memoria compartida audio/texto permite conservar información de turnos anteriores y generar resúmenes coherentes con el contexto de la reunión.
- Asistentes de atención al cliente con historial de llamadas: el estado de memoria permite recuperar datos mencionados en interacciones previas dentro de la misma sesión de audio.
- Indexación y búsqueda semántica sobre archivos de voz: la representación RAW de 1.024 slots puede emplearse como huella latente para recuperar fragmentos relevantes de un corpus de audio.
- Evaluación de comprensión auditiva en investigación: el modelo sirve como banco de pruebas para estudiar cómo la memoria TTT afecta la precisión en tareas multi-QA sobre GigaSpeech.
- Análisis de diálogos multi-turno en entornos controlados: el reinicio de memoria por ejemplo facilita experimentos reproducibles sobre degradación de contexto a lo largo de una conversación.
- Prototipado de agentes de voz con memoria episódica: los componentes exportados pueden integrarse en pipelines de investigación que requieran persistencia de información entre consultas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo de 0,6 GB contiene solo los pesos auxiliares; el backbone Llama 3.1 y el encoder de voz deben cargarse aparte, por lo que el consumo real depende de la variante del backbone elegida.
- GPU recomendadas: no disponible. El entrenamiento se realizó con 8 GPUs (modelo no especificado) en BF16 con microbatch 1 y acumulación de gradiente 4.
- Compatibilidad con GPU de consumo: no disponible; depende del backbone y de la cuantización aplicada, que no se documenta.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el autor menciona un `training_config.yaml` con rutas locales y un `checkpoint_loader: native_context`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria de largo plazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shared TTT — GigaSpeech Fixed Multi-QA (este modelo) | no disponible (auxiliares sobre Llama 3.1) | 131.072 en backbone; 2.048/1.024/3.072 slots de memoria | TTT compartida audio/texto | no disponible | Hugging Face, 0 descargas |
| SALMONN-omni (backbone base) | no disponible en la información | no disponible en la información | no | no disponible en la información | referencia de backbone |
| Llama 3.1 (backbone) | no disponible en la información | 131.072 | no | licencia de Llama 3.1 (no confirmada para este repo) | amplia |

No se dispone de datos suficientes para comparar rendimiento, latencia ni calidad frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se distribuyen pesos auxiliares; el modelo base `llama31_er0_c30-48k` y el encoder de voz son dependencias separadas que el usuario debe obtener por su cuenta.
- La licencia no está especificada, lo que impide determinar si el uso comercial está permitido.
- El idioma soportado declarado es únicamente inglés, lo que limita su uso en castellano u otras lenguas.
- No hay pipeline declarado en Hugging Face ni resultados de benchmarks, por lo que su calidad real es desconocida.
- El estado de memoria se reinicia por cada ejemplo de QA, de modo que no persiste entre sesiones distintas salvo que el integrador lo gestione explícitamente.
- El entrenamiento se limita a 5 épocas y 3.530 pasos sobre 22.378 ejemplos de QA, un volumen reducido que aumenta el riesgo de sobreajuste al dominio GigaSpeech.
- No se documentan evaluación de sesgos, tasas de alucinación ni robustez ante audio ruidoso.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- La supervisión causal solo sobre la respuesta (answer-only) puede degradar la coherencia de respuestas largas o de formato libre.

## Enlaces

- Hugging Face: https://huggingface.co/Xinnian/shared-ttt-giga-fixed-multiqa
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
