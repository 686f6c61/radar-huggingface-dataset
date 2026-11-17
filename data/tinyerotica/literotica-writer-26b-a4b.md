# TinyErotica/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino por LoRA de TrevorJS/gemma-4-26B-A4B-it-uncensored, un modelo Gemma 4 de arquitectura MoE con 25.233.142.046 parámetros totales y aproximadamente 4B activos (128 expertos, 8 activos). Lo desarrolla el usuario TinyErotica y está especializado en la generación de ficción erótica long-form en inglés a partir de una cabecera estructurada (título, categoría, etiquetas, longitud y premisa). No es un modelo conversacional: se entrenó exclusivamente para completado de texto plano y finaliza la historia por sí mismo mediante EOS.

El modelo resuelve un problema muy concreto: producir relatos eróticos completos de entre 1.000 y 5.000 palabras con coherencia interna y cierre narrativo, algo que los modelos generalistas suelen fallar por truncamiento o derivas de tono. Al estar basado en un modelo abliterated (sin rechazos), evita las negativas del alignment estándar en contenido adulto. Su principal atractivo técnico es la eficiencia: la cuantización Q4_K_M (16,8 GB) permite ejecutarlo en una GPU de 8 GB manteniendo los expertos en RAM del sistema mediante `--n-cpu-moe` en llama.cpp.

El entrenamiento se realizó sobre 9.315 historias y fragmentos del dataset detain/literotica-stories, cubriendo 25 categorías, con 2 épocas, 668 pasos y un contexto empaquetado de 8.192 tokens. La licencia declarada es Apache 2.0, aunque el contenido generado es explícito y restringido a adultos. El modelo está pensado para despliegue local, no para APIs de chat ni para front-ends con plantilla conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Gemma 4 26B-A4B), 128 expertos con 8 activos |
| Parametros totales | 25.233.142.046 |
| Parametros activos | Aproximadamente 4B (según model card: "~4B active") |
| Longitud de contexto | 16.384 tokens en la configuración recomendada (`-c 16384`); contexto de entrenamiento empaquetado de 8.192 tokens |
| Tipos de cuantizacion | Q4_K_M (GGUF, 16,8 GB); el adaptador LoRA se distribuye en precisión completa para fusionar |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) y safetensors (LoRA PEFT/Unsloth en `lora/`) |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B, un transformer de mezcla de expertos con 128 expertos y 8 activos por token, en su variante abliterated (TrevorJS/gemma-4-26B-A4B-it-uncensored). Sobre él se aplicó un LoRA de rango 64 y alpha 64 sobre las capas de atención y sobre los 128 expertos, usando Unsloth. El ajuste se realizó con 9.315 historias y fragmentos del dataset detain/literotica-stories, que cubre 25 categorías de Literotica, de las cuales 3.003 proceden de historias mejor valoradas. El entrenamiento consistió en 2 épocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens, learning rate 2e-4 con scheduler coseno, y se completó en aproximadamente 4,7 horas en una H100. La pérdida final fue de 2,36 en entrenamiento y 2,32 en validación.

La innovación principal no es arquitectónica sino de formato: el modelo se entrena para completar texto plano a partir de una cabecera fija con campos `Title`, `Category`, `Tags`, `Type`, `Length`, `Premise` y, opcionalmente, `Previously`, seguida de la línea `STORY:`. Aprende a terminar la historia por sí mismo con EOS, y admite variantes de `Type` para escribir historias por partes (apertura, continuación, parte final, capítulos de series). No se aplicó RLHF ni DPO; el ajuste es supervisado sobre texto de ficción.

## Capacidades

- Generación de ficción erótica long-form en inglés, con cierre narrativo autónomo (EOS) tras historias de 1.000 a 5.000 palabras.
- Completado de texto plano a partir de una cabecera estructurada con título, categoría, etiquetas, tipo, longitud y premisa.
- Escritura por partes: aperturas, continuaciones y finales de historias largas, con bloque `Previously:` para mantener continuidad.
- Generación por capítulos dentro de series más largas, con control de longitud aproximada mediante el campo `Length`.
- Cobertura de 25 categorías de Literotica (Romance, BDSM, Sci-Fi & Fantasy, Erotic Horror, First Time, etc.).
- Sin rechazos por contenido adulto, al derivar de un modelo base abliterated.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es un modelo conversacional: no admite plantilla de chat ni endpoints `/v1/chat/completions`.
- Sin capacidades de visión, audio ni thinking mode.
- Multilingüismo limitado al inglés.

## Casos de uso

- Generación de relatos eróticos completos para plataformas de ficción para adultos: se envía una cabecera con título, categoría y premisa, y el modelo produce una historia terminada de la longitud solicitada, lo que permite poblar catálogos con contenido original sin intervención manual por relato.
- Serialización de historias largas por capítulos: usando los valores de `Type` para apertura, continuación y parte final, junto con el bloque `Previously:`, se pueden encadenar partes de una misma serie manteniendo coherencia con el texto previo.
- Herramienta de escritura asistida para autores de ficción adulta: el modelo genera un primer borrador completo a partir de una premisa, que el autor revisa y edita, aprovechando que el Q4_K_M cabe en una GPU consumer de 8 GB.
- Prototipado de motores de narrativa interactiva para adultos: integrado en front-ends de text completion como KoboldCpp o SillyTavern en modo Text Completion, permite generar escenas largas a partir de parámetros de historia.
- Investigación sobre generación de ficción long-form: el modelo es un caso de estudio de ajuste LoRA sobre un MoE abliterated para una tarea de dominio muy específica, con métricas de pérdida publicadas (train 2,36 / val 2,32).
- Despliegue local privado: al ejecutarse con llama.cpp en hardware modesto, permite generar contenido adulto sin enviar prompts a APIs externas, lo que resulta relevante para usuarios que requieren privacidad.
- Generación de datasets sintéticos de ficción erótica para investigación en moderación de contenido o estudios de narrativa, siempre con las salvaguardas legales y de edad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de entrenamiento (2,36) y validación (2,32), además de una estimación de throughput de 15 a 30 tokens/s en una GPU de 8 GB con `--n-cpu-moe 30`.

## Requisitos de hardware

- VRAM estimada: el GGUF Q4_K_M ocupa 16,8 GB en total; con `--n-cpu-moe 30` los pesos de los expertos se mantienen en RAM del sistema y el modelo cabe en una GPU de 8 GB. Bajar el valor de `--n-cpu-moe` (manteniendo más expertos en VRAM) aumenta la velocidad hasta llenar la memoria de la GPU.
- GPU recomendadas: cualquier GPU con 8 GB o más para la configuración documentada; GPUs con más VRAM (RTX 4090, A100, H100) permiten reducir `--n-cpu-moe` y obtener mayor throughput. El entrenamiento se realizó en una H100.
- Cabe en GPU consumer: sí, en GPUs de 8 GB como la RTX 3060 Ti, RTX 3070 o RTX 4060, con los expertos en RAM del sistema.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), KoboldCpp, SillyTavern en modo Text Completion con plantilla de instrucciones vacía. No usar `/v1/chat/completions`, LM Studio ni Ollama en modo chat, ni arrancar `llama-server` con `--jinja` o `--chat-template`.
- Latencia y throughput: aproximadamente 15 a 30 tokens/s en una GPU de 8 GB según la model card. Se requiere una build reciente de llama.cpp con soporte para Gemma 4.
- Contexto de ejecución recomendado: `-c 16384` con `-fa on` (flash attention).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | 25,2B totales, ~4B activos (MoE) | 16.384 tokens en ejecución | Ficción erótica long-form, text completion | Apache 2.0 | GGUF Q4_K_M y LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored (base) | 25,2B totales, ~4B activos (MoE) | No disponible en la información proporcionada | Modelo general abliterated | No disponible en la información proporcionada | Hugging Face |
| Gemma 4 26B-A4B (modelo original) | 25,2B totales, ~4B activos (MoE) | No disponible en la información proporcionada | Modelo general con alignment | No disponible en la información proporcionada | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría. La comparación se limita a parámetros, contexto de ejecución y licencia.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (18+): el modelo genera ficción sexual explícita y no debe usarse con menores ni en contextos no adultos.
- No es un modelo de chat: usar plantilla conversacional, `/v1/chat/completions` o `--jinja` degrada la calidad y produce respuestas de asistente o historias débiles.
- El formato de prompt es estricto: la primera línea debe ser exactamente `Erotic fiction. All characters are adults (18+).`, debe haber una línea vacía antes de `STORY:` y un salto de línea después; las desviaciones afectan a la calidad.
- La longitud solicitada se sigue de forma aproximada, no exacta.
- Solo inglés: no hay soporte multilingüe declarado.
- Riesgo de alucinación y de derivas narrativas en historias muy largas, aunque el modelo está entrenado para cerrar por sí mismo.
- El modelo base es abliterated, lo que elimina los rechazos de seguridad; no debe desplegarse en entornos donde se requiera moderación automática de contenido.
- La licencia Apache 2.0 se declara en la model card, pero el contenido generado está sujeto a las leyes aplicables sobre material adulto y a las políticas de las plataformas donde se publique.
- Algunas categorías del formato de prompt (por ejemplo, `NonConsent/Reluctance`, `Incest/Taboo`, `Mind Control`) describen temáticas sensibles; su uso debe enmarcarse en ficción entre adultos y cumplir la legislación vigente.
- No afiliado ni respaldado por Literotica.
- Requiere una build reciente de llama.cpp con soporte para Gemma 4; versiones antiguas no cargarán el modelo.
- El repositorio ocupa 24,6 GB y tiene un volumen de descargas bajo (174) y solo 1 like en el momento de la consulta, lo que limita la validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TinyErotica/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica (sitio de referencia, sin afiliación): https://www.literotica.com
