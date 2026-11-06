# Thox-ai/ThoxAir-Chat-0.5B

## Resumen

ThoxAir-Chat-0.5B es un artefacto de empaquetado publicado por Thox-ai sobre los pesos de Qwen/Qwen2.5-0.5B-Instruct. No se trata de un modelo entrenado por THOX: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un pequeño knowledge pack en JSONL (8 entradas verificadas). Los pesos reales son los del modelo base de Alibaba Qwen, descargados por Ollama a partir de un tag fijado por digest, por lo que el modelo hereda la arquitectura, el tamaño (0,5 mil millones de parámetros) y las capacidades del Qwen2.5-0.5B-Instruct original.

Su relevancia es acotada y de nicho: sirve como configuración reproducible para despliegues locales en hardware muy limitado (objetivo declarado de 2 GB), con un perfil de sistema que fuerza respuestas ancladas al knowledge pack y una regla explícita para no afirmar estados en vivo que no puede conocer. El autor reconoce que el mismo `Modelfile` se publica bajo dos nombres (ThoxAir-Chat-0.5B y ThoxAir-Route-0.5B), de modo que ambos listados son el mismo artefacto de configuración.

Es importante subrayar que no hay entrenamiento ni ajuste fino: la personalización se limita al prompt de sistema y a la recuperación sobre el pack. El modelo no está cualificado sobre hardware de dispositivo y se distingue explícitamente del "flagship" ThoxAir-0.5B, que sí habría sido entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct; no se detalla en la model card) |
| Parametros totales | 0,5 mil millones (0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto usado en la evaluacion del autor); contexto nativo del base no detallado en la informacion proporcionada |
| Tipos de cuantizacion | Q4-clase segun la model card; el tag de Ollama `qwen2.5:0.5b` se distribuye con la cuantizacion por defecto del registro (no se especifica el esquema exacto) |
| Idiomas soportados | Ingles (`en`) declarado; el base Qwen2.5 es multilingue, pero esta ficha solo declara ingles |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | Pesos del base via Ollama (tag fijado por digest); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl`, no safetensors ni GGUF propios |

## Arquitectura y entrenamiento

La arquitectura es la del Qwen2.5-0.5B-Instruct: un transformer decoder-only de 0,5B parametros con atención causal estándar. La model card no aporta detalles adicionales sobre número de capas, dimensiones ocultas, cabezas de atención ni vocabulario, por lo que esos datos deben consultarse en la ficha del modelo base. Tampoco se documenta el dataset de entrenamiento original ni si hubo RLHF/DPO en el base; esa información corresponde a Qwen, no a THOX.

THOX no entrena ni ajusta los pesos. Su aportación es un `Modelfile` con un perfil de sistema (endurecido tras una primera pasada en la que el modelo "siguió" una trampa de topología fabricada, añadiendo una regla de estado en vivo al inicio del perfil y una frase de cierre sobre ausencia de telemetría) y un knowledge pack v0.1 de 8 entradas públicas verificadas en formato JSONL. El manifiesto fija el base por digest (`a8b0c51577010a279d933d14c2a8ab4b268079d44c5c8830c0a93900f1827c67`) y la versión del pack, lo que hace la build reproducible. No hay innovaciones de decodificación, atención lineal ni técnicas de inferencia especulativa documentadas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Qwen2.5-0.5B-Instruct.
- Respuestas ancladas a un knowledge pack mediante contexto suministrado (retrieval-grounded), limitado a 8 entradas en la versión v0.1.
- Rechazo de afirmaciones sobre topología o estado en vivo no verificable (regla explícita del perfil de sistema).
- Respuesta a preguntas de enrutamiento como recomendación etiquetada (local primero, nube solo con consentimiento explícito), no como estado real.
- Funcionamiento autónomo y offline a través del endpoint local de Ollama.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada (no incluido en los pesos).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Asistente conversacional local en hardware de 2 GB: el modelo corre en CPU con 0,59 GB de RAM según la medición del autor, lo que permite desplegarlo en dispositivos de gama baja sin GPU.
- Respuestas de FAQ ancladas a documentación propia: usando el knowledge pack v0.1 como contexto, el modelo responde con hechos verificados sobre el producto en lugar de inventar especificaciones.
- Prototipado de pipelines de recuperación (RAG) en entornos con recursos mínimos: sirve para validar el flujo pregunta-contexto-respuesta antes de escalar a modelos mayores.
- Guardarraíl de estado: el perfil fuerza a declarar que no dispone de telemetría en vivo, útil en asistentes que no deben afirmar el estado real de una red o dispositivo.
- Enrutamiento etiquetado como recomendación: puede sugerir "local primero, nube con consentimiento" en flujos de decisión, siempre marcado como recomendación y no como estado observado.
- Despliegue reproducible en CI o imágenes de dispositivo: el `Modelfile` y el manifiesto con digest permiten reconstruir exactamente la misma configuración en cada build.
- Evaluación comparativa de configuraciones: al ser un artefacto de empaquetado sobre un base conocido, permite medir el efecto del perfil de sistema y del pack sin variar los pesos.

## Benchmarks y rendimiento

Mediciones publicadas por el autor el 2026-10-31 en un host x86_64 solo CPU (4 vCPU / 8 GB), a 8.192 tokens de contexto, contra la configuración publicada:

| Metrica | Resultado |
|---|---|
| Generación de formato largo (bench de 1.024 tokens) | 58,8 tokens/s |
| Respuestas cortas (smoke set) | 38,9–68,3 tokens/s |
| Huella de memoria en carga | 0,59 GB RAM / 0 GB VRAM (ejecución CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Anclaje al Knowledge Pack v0.1 (pasaje suministrado, una pregunta por tema) | 6/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo rechazó confirmar la topología inventada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como estado en vivo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 0 GB en ejecución CPU según la medición del autor; en GPU, un modelo de 0,5B en Q4 ocupa del orden de 0,4 GB de pesos más overhead de contexto (estimación, no medida publicada).
- GPU recomendadas: no se especifican; cualquier GPU consumer con al menos 2 GB de VRAM podría alojarlo, aunque no hay cifras oficiales.
- Cabe en GPU consumer: sí, por tamaño; el autor solo valida ejecución en CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thoxair-chat-0.5b` o build local con `ollama create`). No se documentan vLLM, llama.cpp, TGI ni otros runtimes.
- Latencia y throughput: 58,8 tokens/s en generación larga y 38,9–68,3 tokens/s en respuestas cortas sobre el host CPU de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ThoxAir-Chat-0.5B | 0,5B | 8.192 (usado en evaluación) | Apache-2.0 | Ollama | Empaquetado sobre Qwen2.5-0.5B-Instruct; sin entrenamiento propio |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | no disponible en esta ficha | Apache-2.0 | safetensors, GGUF, Ollama | Modelo base; THOX no modifica los pesos |
| ThoxAir-Route-0.5B | 0,5B | 8.192 (misma config) | Apache-2.0 | Ollama | Mismo `Modelfile` que Chat; solo cambia metadatos del manifiesto |

No se dispone de datos de benchmarks comparativos con otras alternativas de 0,5B en la información proporcionada.

## Limitaciones y advertencias

- Razonamiento y recall materialmente limitados por el tamaño de 0,5B; el propio autor lo advierte.
- Anclaje al knowledge pack medido en 6/8 temas: dos respuestas no usaron los hechos del pack.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como "uncensored".
- Sin contexto suministrado, el modelo debe declarar que no lo tiene en lugar de inventar especificaciones de THOX; el cumplimiento no está garantizado al 100 %.
- Acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento ni acceso a mesh.
- Configuración objetivo de 2 GB no cualificada sobre hardware de dispositivo según el propio autor.
- Duplicidad de listados: Chat y Route comparten el mismo `Modelfile`; no son modelos distintos.
- Idioma declarado únicamente inglés; el multilingüismo del base no está validado en este empaquetado.
- Licencia Apache-2.0 heredada; los elementos propios de THOX (perfil, pack, empaquetado) se declaran bajo la misma licencia, pero conviene verificar términos de marca si se redistribuye.
- Riesgo de alucinación inherente a modelos pequeños, especialmente en preguntas fuera del pack o con contexto largo.
- Fecha de creación del repositorio (2026-11-01) posterior a la evaluación (2026-10-31); sin descargas ni likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxAir-Chat-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ollama (modelo publicado): `ollama run Thox-ai/thoxair-chat-0.5b`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
