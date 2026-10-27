# Verdugie/Fable-Therapy-Lite

## Resumen

Fable Therapy Lite es un ajuste fino (finetune) del modelo Qwen 3.5 4B, publicado por Verdugie (Saul Verdugo), investigador independiente de ML, y orientado a conversación de estilo terapéutico y apoyo emocional. Con 4.205.751.296 parámetros, se distribuye únicamente en formato GGUF y está pensado para ejecución local y offline en LM Studio o llama.cpp, lo que lo hace atractivo para escenarios con requisitos fuertes de privacidad.

El modelo se entrenó sobre 4.537 conversaciones de consejería generadas por Claude Opus 4.8 siguiendo un estándar derivado por ingeniería inversa de un conjunto limitado de muestras de Claude Fable 5. Según la model card, aplica una lectura clínica estructurada antes de cada respuesta y mantiene un registro temporal (timeline ledger) de los hechos de la conversación, sin necesidad de system prompt.

Es relevante ahora por dos motivos: cubre temas delicados que la mayoría de ajustes conversacionales evitan (ideación suicida y autolesión, consumo de sustancias, infidelidad, sexualidad e identidad de género) y lo hace en un tamaño de 4B ejecutable en hardware de consumo. La información disponible no incluye resultados de benchmarks ni detalles completos de arquitectura o entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle; finetune del modelo base Qwen/Qwen3.5-4B (transformer decoder-only, según la arquitectura del base) |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | No aplica (no se documenta una variante MoE) |
| Longitud de contexto | No disponible; la model card etiqueta el modelo como "long-context" sin especificar el número de tokens |
| Tipos de cuantización | GGUF; el repositorio no enumera los niveles de cuantización publicados (tamaño total del repo: 22,2 GB) |
| Idiomas soportados | Inglés (único idioma declarado) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (librería declarada: gguf) |
| Modelo base | Qwen/Qwen3.5-4B |
| Modalidad | Texto a texto (pipeline: text-generation) |
| Descargas / likes | 269 descargas, 3 likes |
| Fechas | Creado el 21 de junio de 2026; actualizado el 26 de octubre de 2026 |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna más allá del modelo base Qwen 3.5 4B, del que este modelo es un finetune. Se trata, por tanto, de un transformer decoder-only de 4B parámetros heredado de Qwen, sin indicios de arquitecturas híbridas ni de mezcla de expertos. El repositorio distribuido contiene exclusivamente pesos GGUF, no safetensors.

El entrenamiento se realizó sobre 4.537 conversaciones de consejería escritas por Claude Opus 4.8, siguiendo un estándar de calidad obtenido por ingeniería inversa a partir de un conjunto limitado de muestras de Claude Fable 5. La model card no indica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF, DPO u otro ajuste por preferencias. Sí se documentan dos rasgos de diseño: una lectura clínica estructurada previa a cada respuesta y un registro temporal de hechos relevantes de la conversación que se mantiene a lo largo del diálogo. El modelo no requiere system prompt para operar en su modo previsto.

## Capacidades

- Generación de texto conversacional en inglés con registro empático y estilo clínico.
- Apoyo emocional y exploración de temas sensibles: duelo, ansiedad, depresión, burnout, trauma, relaciones, familia, trabajo.
- Manejo explícito de conversaciones difíciles: ideación suicida y autolesión, consumo de sustancias, infidelidad, sexualidad e identidad de género (según la model card).
- Razonamiento previo a la respuesta: la card menciona trazas de razonamiento (omitidas en los ejemplos publicados).
- Memoria de hechos a lo largo de la conversación mediante un registro temporal (timeline ledger).
- Funcionamiento sin system prompt.
- Etiquetado como long-context, aunque sin longitud máxima especificada.
- Soporte de tool calling / function calling: no documentado.
- Capacidades de agente o multi-step reasoning con herramientas: no documentadas.
- Multilingüismo: no disponible; solo se declara inglés.
- Visión o audio: no disponible (modelo exclusivamente de texto).
- Modo "thinking" explícito: no disponible como funcionalidad documentada al margen de las trazas de razonamiento citadas.

## Casos de uso

- Diario conversacional con privacidad estricta: al ejecutarse en local mediante GGUF y llama.cpp, las conversaciones no salen del dispositivo, lo que encaja en entornos donde el contenido emocional no puede enviarse a una API externa.
- Prototipado de productos de bienestar emocional: sirve para validar flujos de conversación multi-turno y estilos de respuesta antes de invertir en un modelo mayor, con un coste de inferencia muy bajo por su tamaño de 4B.
- Formación de profesionales y estudiantes de psicología: uso como simulador de cliente o de interlocutor para practicar entrevistas y manejo de temas difíciles, siempre con supervisión y sin presentarlo como paciente real.
- Investigación sobre estilos de respuesta empática: su dataset de 4.537 conversaciones y su estructura de lectura clínica previa lo hacen útil para estudiar cómo se comporta un modelo pequeño cuando se le induce un registro terapéutico.
- Asistente de primera escucha en aplicaciones de acompañamiento: gestión de conversaciones largas sobre duelo, burnout o conflictos familiares gracias al registro temporal de hechos, derivando a recursos profesionales cuando aparecen señales de riesgo.
- Evaluación de seguridad y alineamiento: banco de pruebas para medir cómo responde un modelo de 4B ante mensajes sobre autolesión, sustancias o identidad, y para comparar con modelos mayores de la misma familia.
- Despliegue en hardware de consumo: integración en aplicaciones de escritorio vía LM Studio con endpoints compatibles, sin GPU dedicada de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente extractos cualitativos de respuestas reales (transcripciones de depresión, identidad y burnout) sin métricas cuantitativas, y los resultados de búsqueda no aportan evaluaciones comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 4,21B parámetros; no son cifras publicadas por el autor): en FP16 en torno a 8,5-9 GB solo de pesos; Q8 alrededor de 4,5-5 GB; Q6 en torno a 3,5-4 GB; Q5 alrededor de 3-3,5 GB; Q4 en torno a 2,5-3 GB. Hay que sumar la caché KV, que crece con la longitud de contexto y no puede calcularse sin conocer la ventana máxima.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) permite cuantizaciones altas; A100 o H100 solo tendrían sentido para servir muchas peticiones concurrentes.
- Viabilidad en GPU de consumo: sí, en tarjetas con 6-8 GB usando cuantizaciones Q4/Q5; también cabe en CPU con RAM suficiente, a menor velocidad.
- Opciones de despliegue: llama.cpp y LM Studio son las vías naturales (etiquetas llama-cpp y lm-studio, además de endpoints compatibles). Ollama es viable convirtiendo el GGUF. vLLM o TGI requerirían pesos en safetensors, que no se distribuyen en este repositorio.
- Latencia y throughput: no disponibles. Al no conocerse la longitud de contexto ni el nivel de cuantización recomendado, no es posible dar cifras fiables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Fable Therapy Lite (este modelo) | 4,21B | No disponible (etiquetado long-context) | Inglés | Apache 2.0 | GGUF en HuggingFace | 4.537 conversaciones; pensado para local |
| Fable Therapy 9B (Verdugie) | 9B (según la card del 9B) | No disponible | Inglés | No confirmada en la información disponible | HuggingFace | Mismo dataset de 4.537 conversaciones; versión mayor del mismo par |
| Qwen 3.5 4B (modelo base) | ~4B | No disponible | No disponible en la información recogida | No confirmada en la información recogida | HuggingFace | Modelo generalista sin especialización terapéutica |
| Therapy-3.8 (Verdugie) | 3,8B (por el nombre) | No disponible | No disponible | No disponible | HuggingFace | Citado solo en rankings de descargas; sin datos técnicos verificados |

No se dispone de datos de rendimiento comparado entre estas alternativas; la comparación se limita a parámetros, licencia y formato de distribución.

## Limitaciones y advertencias

- No es un dispositivo médico ni sustituye a un profesional de salud mental. No se documenta validación clínica, supervisión por especialistas ni protocolos de derivación en casos de crisis.
- El modelo puede mostrar seguridad aparente en temas de riesgo (ideación suicida, autolesión) sin garantías de manejo adecuado; en producción requiere capas externas de detección de riesgo y escalado a recursos humanos.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, atribuir recuerdos falsos al usuario o reforzar interpretaciones erróneas, especialmente con el registro temporal de la conversación.
- Solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Sesgos heredados del modelo base Qwen 3.5 4B y del estilo de los datos generados por otro modelo (Claude Opus 4.8); no se documenta ninguna fase de mitigación de sesgos.
- Procedencia de los datos: el corpus de entrenamiento es sintético y generado por IA, no conversaciones reales de pacientes, lo que limita la fidelidad a casuística clínica real.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene verificar también las condiciones del modelo base Qwen 3.5 4B antes de redistribuir.
- Solo se publican pesos GGUF; no hay safetensors en el repositorio, lo que complica el despliegue con servidores de alto rendimiento como vLLM o TGI y el reentrenamiento.
- Contexto máximo no especificado: planificar la longitud de las conversaciones sin conocer el límite real puede provocar truncamientos inesperados.
- Tamaño de repositorio de 22,2 GB frente a 4,21B parámetros: incluye varias cuantizaciones, pero el autor no documenta cuáles ni sus tamaños individuales.

## Enlaces

- [Verdugie/Fable-Therapy-Lite en HuggingFace](https://huggingface.co/Verdugie/Fable-Therapy-Lite)
- [Verdugie/Fable-Therapy-9B en HuggingFace](https://huggingface.co/Verdugie/Fable-Therapy-9B)
- [Perfil del autor Verdugie (Saul Verdugo)](https://huggingface.co/Verdugie)
- [Verdugie en Model Pulse: descargas y rankings](https://modelpulse.ifsp.dev/author/Verdugie)
- [Verdugie AI models en Essa Mamdani](https://essamamdani.com/ai-models/company/verdugie)
- [Fable Therapy 9B Review en AI Cambodia](https://www.aicambodia.com/ai/hf-verdugie-fable-therapy-9b)
