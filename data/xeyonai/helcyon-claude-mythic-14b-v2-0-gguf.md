# XeyonAI/Helcyon-Claude-Mythic-14b-v2.0-GGUF

## Resumen

Helcyon Claude Mythic 14B v2.0 es un ajuste fino (fine-tune) del modelo Ministral 3 14B Instruct de Mistral AI, desarrollado por XeyonAI (bajo la marca HardWire) y distribuido en formato GGUF para inferencia local. El modelo pertenece a la familia Helcyon, orientada a asistentes conversacionales con personalidad, y su objetivo declarado es reproducir la experiencia conversacional de los modelos Claude de Anthropic —estilo de escritura, matices y fluidez— en un entorno completamente local. Con 13.506.073.600 parámetros, se posiciona en la gama media de modelos densos aptos para hardware de consumo.

La versión v2.0 corresponde a la "Series 8", segunda generación de la línea Helcyon-Ministral. Según la model card, el entrenamiento se realizó íntegramente sobre datasets generados por modelos de la familia Claude (Sonnet 4.5, Sonnet 4.6, Opus, Fable 5 y Sonnet 5.5), sin buscar replicar una versión concreta sino capturar las cualidades generales de conversación natural, redacción articulada y seguimiento de contexto. El modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el modelo base Ministral 3 ya parte de esa misma licencia.

Es relevante ahora porque ofrece una alternativa local y sin censura corporativa a los asistentes conversacionales en la nube, con soporte declarado de contexto largo y visión (esta última mediante un proyector multimodal separado). El repositorio tiene 77,8 GB, lo que indica que incluye múltiples cuantizaciones (IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 y f16).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Ministral 3 14B Instruct) |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la model card indica "contexto mucho mayor de la generación Ministral" sin cifra concreta) |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con proyector multimodal mmproj separado para visión) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 13.500 millones de parámetros construido sobre Ministral 3 14B Instruct de Mistral AI. No se especifica en la información disponible si emplea atención con ventana deslizante, atención completa o alguna variante híbrida; la model card solo menciona que "retiene la capacidad de contexto mucho mayor de la generación Ministral". Tampoco se detalla el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de la afirmación de que los datos fueron generados por modelos de la familia Claude.

El proceso de ajuste se centró en la "Series 8", con una receta de entrenamiento mejorada respecto a la generación anterior. Los objetivos declarados incluyen mejorar la fluidez conversacional, la claridad de las respuestas, la escritura expresiva, el trabajo práctico (administración y organización), el roleplay y el seguimiento de contexto. Se menciona explícitamente que se entrenó contra la tendencia a inventar narrativas elaboradas o poéticas sobre cosas que el usuario no dijo, un problema común en modelos conversacionales muy estilizados. No se especifica si se usaron técnicas de RLHF, DPO o preferencias, ni detalles sobre decodificación especulativa u otras innovaciones de inferencia.

## Capacidades

- Generación de texto conversacional con estilo próximo a Claude: respuestas articuladas, matices y fluidez en el diálogo multi-turno.
- Escritura creativa y prosa expresiva, adaptable a distintos registros.
- Roleplay con conciencia de personaje, continuidad e inmersión.
- Seguimiento de contexto en conversaciones largas y proyectos prolongados.
- Asistencia práctica: administración, organización y tareas cotidianas.
- Soporte de visión cuando se carga junto con el proyector multimodal `mmproj` de Ministral 3 (disponible en el repositorio oficial de Mistral AI). Permite incorporar capturas de pantalla, fotografías, ilustraciones, diagramas e interfaces a la conversación.
- Compatibilidad con backends locales (Kobold, TextGen WebUI, LM Studio, Helcyon-WebUI y otros compatibles con GGUF).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.

## Casos de uso

- Asistencia conversacional de larga duración: el modelo puede mantener hilos de conversación extensos y recordar detalles previos gracias a la ventana de contexto ampliada de la generación Ministral, lo que lo hace adecuado para proyectos que se extienden durante días o semanas.
- Escritura creativa y narrativa: su entrenamiento orientado a prosa expresiva y adaptable permite generar relatos, diálogos y descripciones con un estilo cercano al de Claude, útil para autores que buscan un borrador con voz definida.
- Roleplay y ficción interactiva: la mejora en conciencia de personaje y continuidad lo hace apropiado para juegos de rol por texto, simulaciones de personajes y narrativa interactiva donde la coherencia es crítica.
- Asistente personal local: tareas de administración, organización y planificación se benefician del enfoque en "trabajo práctico" declarado en la model card, con la ventaja de ejecutarse completamente en local sin enviar datos a la nube.
- Análisis de imágenes en local: con el proyector multimodal de Ministral 3, puede procesar capturas de pantalla, diagramas o fotografías como parte de la conversación, útil para soporte técnico o documentación.
- Evaluación y comparación de modelos: su integración con Helcyon-WebUI, que incluye benchmarking y comparaciones A/B ciegas, permite usarlo como sujeto de pruebas en flujos de evaluación de modelos locales.
- Prototipado de asistentes con personalidad: desarrolladores que necesiten un asistente con carácter definido y sin restricciones corporativas pueden desplegarlo vía llama.cpp u Ollama y personalizarlo con system prompts.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización y longitud de contexto):
  - IQ4_XS: ~7-8 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_M: ~9-10 GB
  - Q6_K: ~11-12 GB
  - Q8_0: ~14-15 GB
  - f16: ~27-28 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 o Q6_K con contexto moderado; RTX 3090/4080 (16-24 GB) para Q4_K_M o Q5_K_M; A100/H100 para f16 y contextos largos.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más usando cuantizaciones IQ4_XS o Q4_K_M (con contexto reducido); 12-16 GB permiten Q5_K_M o Q6_K con margen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, Text Generation WebUI, Helcyon-WebUI y cualquier backend compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Helcyon Claude Mythic 14B v2.0 | 13,5 B | no disponible | Apache 2.0 | GGUF | Fine-tune conversacional estilo Claude sobre Ministral 3 |
| Ministral 3 14B Instruct (base) | ~14 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo base oficial de Mistral AI; sin el estilo Claude |
| Mistral Nemo 12B Instruct | 12 B | 128k (según documentación de Mistral) | Apache 2.0 | safetensors, GGUF | Alternativa densa de tamaño similar con contexto largo |
| Qwen2.5 14B Instruct | 14 B | 128k (según documentación de Qwen) | Apache 2.0 | safetensors, GGUF | Buen rendimiento general y multilingüe; no especializado en estilo Claude |

La comparativa se limita a parámetros, licencia y disponibilidad; no hay datos de benchmarks del modelo Helcyon que permitan comparar rendimiento objetivamente. El contexto del modelo base Ministral 3 no se detalla en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenarse sobre datos generados por modelos Claude, puede heredar sesgos de estilo y contenido de esos modelos.
- Riesgo de alucinación: la model card menciona que se entrenó contra la tendencia a inventar narrativas elaboradas, pero no elimina el riesgo general de alucinación inherente a los modelos de lenguaje.
- Limitaciones de contexto o idioma: solo se declara soporte de inglés; el contexto máximo práctico depende del hardware y la configuración del backend, y no se especifica una cifra concreta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Ministral 3 también es Apache 2.0, por lo que no hay restricciones adicionales conocidas. Se recomienda verificar la licencia del proyector multimodal de Ministral 3 si se usa visión.
- Sensibilidad al system prompt: la model card advierte que los fine-tunes de Ministral pueden ser sensibles al prompt de sistema o de personaje; un prompt conflictivo puede provocar respuestas verbosas, repetitivas o estilísticamente extrañas. Se recomienda usar la "Mythic card" proporcionada.
- Caveat para producción: el modelo está orientado a conversación y creatividad, no a tareas de razonamiento técnico o código; no hay benchmarks que respalden su rendimiento en esas áreas. La versión es un fine-tune comunitario sin validación independiente conocida.

## Enlaces

- Hugging Face: https://huggingface.co/XeyonAI/Helcyon-Claude-Mythic-14b-v2.0-GGUF
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512
- GGUF oficial del modelo base (incluye mmproj para visión): https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-GGUF/tree/main
- Helcyon-WebUI (GitHub): https://github.com/XeyonA
