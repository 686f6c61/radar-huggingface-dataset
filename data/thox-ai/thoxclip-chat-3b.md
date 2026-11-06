# Thox-ai/ThoxClip-Chat-3B

## Resumen

ThoxClip-Chat-3B es un paquete de configuración publicado por Thox-ai sobre los pesos sin modificar de Qwen2.5-3B-Instruct. No se trata de un modelo entrenado: el repositorio contiene únicamente un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL con ocho entradas verificadas. El autor declara explícitamente que THOX no ha entrenado los pesos y que la personalización se limita a un perfil de sistema inyectado vía Modelfile y a un mecanismo de respuestas fundamentadas en recuperación (RAG) sobre ese pack.

El modelo resuelve un nicho muy concreto: despliegue local y offline de un asistente conversacional de 3B parámetros en hardware modesto, con un perfil de comportamiento orientado a no inventar especificaciones del ecosistema THOX y a declinar confirmaciones de topologías fabricadas. Está pensado para ejecutarse mediante Ollama en equipos que soporten un modelo de 3B en cuantización Q4, y opcionalmente con un runtime THOX que añadiría descubrimiento MeshStack y ejecución autorizada, capacidades que los pesos por sí solos no proporcionan.

La relevancia es limitada y acotada al ecosistema del autor: no hay benchmarks públicos frente a terceros, la licencia heredada es de investigación y uso no comercial, y el propio autor advierte de que el modelo no está cualificado en hardware de dispositivo. Es, en la práctica, una receta de despliegue reproducible más que un modelo nuevo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-3B-Instruct; no se detalla en la model card) |
| Parámetros totales | 3B (según el modelo base Qwen2.5-3B-Instruct) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de evaluación declarado; el contexto nativo del base no se especifica en la ficha) |
| Tipos de cuantización | Q4-clase por defecto en Ollama; el modelo publicado ocupa 1,93 GB (tag por defecto) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Qwen Research License (uso exclusivamente de investigación y no comercial) |
| Formato de pesos | Pesos del base servidos por Ollama (capa fijada por digest); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento. El modelo es una configuración derivada: los pesos son los de `Qwen/Qwen2.5-3B-Instruct`, obtenidos vía la etiqueta `qwen2.5:3b` de Ollama y fijados en el momento del build al digest `357c53fb659c5076de1d65ccb0b397446227b71a42be9d1603d46168015c9e4b`. La arquitectura subyacente es, por tanto, la del transformer decoder-only de Qwen2.5-3B-Instruct, sin modificaciones estructurales, sin fine-tuning, sin RLHF adicional ni destilación.

La única intervención del autor es de empaquetado: un perfil de sistema incluido en el `Modelfile` y el THOX Knowledge Pack v0.1, un fichero JSONL de 4.652 bytes con ocho entradas públicas verificadas que se usa para respuestas fundamentadas en recuperación. El perfil se reforzó con una regla explícita de estado en vivo, colocada al principio del perfil y cerrada con una frase de no-telemetría en vivo, después de que el primer build aceptase una premisa falsa en una prueba trampa; solo se publicó el segundo build. No se declaran innovaciones técnicas como decodificación especulativa, atención lineal o modos de razonamiento extendido.

## Capacidades

- Generación de texto conversacional multi-turno en inglés sobre la base Qwen2.5-3B-Instruct.
- Respuestas fundamentadas en recuperación cuando se le suministra contexto del THOX Knowledge Pack v0.1 (8 entradas verificadas).
- Declinación de confirmaciones de topologías fabricadas, gracias a la regla de estado en vivo del perfil de sistema.
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como afirmación de estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- Descubrimiento MeshStack y ejecución autorizada solo si se usa el runtime THOX opcional; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a malla.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional local offline: el modelo se ejecuta íntegramente en CPU mediante Ollama y responde sin conexión, adecuado para entornos air-gapped donde no se puede enviar tráfico a la nube.
- Atención al cliente de bajo volumen en inglés: con 8.192 tokens de contexto puede mantener conversaciones multi-turno moderadas, aunque la calidad de razonamiento de un 3B limita la complejidad de los diálogos.
- Respuestas fundamentadas sobre documentación propia: cargando el knowledge pack o pasajes equivalentes en el contexto, el modelo responde con los hechos suministrados; en la evaluación acertó 6 de 8 temas con pasaje proporcionado.
- Pruebas de robustez frente a alucinación de infraestructura: el perfil refuerza que el modelo no invente especificaciones THOX ni confirme topologías falsas, útil como banco de pruebas de comportamiento ante premisas erróneas.
- Evaluación de recetas de despliegue reproducibles: el repositorio permite reconstruir el modelo con `ollama create` a partir del `Modelfile` y verificar el digest del base, útil para auditar cadenas de suministro de modelos.
- Prototipado de asistentes con recomendación local-primero: el modelo etiqueta sus recomendaciones de enrutamiento como tales y exige consentimiento explícito para la nube, patrón reutilizable en asistentes con políticas de privacidad estrictas.
- Despliegue en hardware de 8 GB de RAM: con 2,42 GB de huella en carga y ejecución en CPU, cabe en equipos de gama baja y en contenedores con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente mediciones propias del autor, realizadas el 31 de octubre de 2026 en un host x86_64 solo CPU (4 vCPU, clase 8 GB) con contexto de 8.192 tokens:

| Métrica | Resultado |
|---|---|
| Generación de formato largo | 11,03 tokens/s (bench de 1.024 tokens) |
| Respuestas cortas | 11,2–22,8 tokens/s en el conjunto de smoke tests |
| Huella de memoria en carga | 2,42 GB de RAM (0 GB de VRAM, ejecución en CPU) |
| Preguntas de smoke de fábrica | 3/3 respondidas de forma coherente y alineada con el perfil |
| Fundamentación con Knowledge Pack v0.1 | 6/8 temas respondidos con los hechos del pack |
| Trampa de topología fabricada | El modelo declinó confirmar la topología fabricada |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada, no como afirmación de estado en vivo |

No hay comparación con modelos similares en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB en la configuración medida (ejecución en CPU); el modelo publicado ocupa 1,93 GB en disco en su cuantización por defecto de clase Q4.
- RAM: 2,42 GB medidos en carga sobre un host de clase 8 GB; se recomienda al menos 8 GB de RAM para margen operativo.
- GPU recomendadas: no se especifican en la model card; el autor solo documenta ejecución en CPU. Cualquier GPU consumer con 4 GB o más de VRAM debería poder alojar un 3B en Q4, pero no hay validación publicada.
- Cabe en GPU consumer: previsiblemente sí en tarjetas con 4–6 GB de VRAM (GTX 1650, RTX 3050, RTX 4060), aunque no está verificado por el autor.
- Opciones de despliegue: Ollama (vía `ollama run Thox-ai/thoxclip-chat-3b` o build local con `ollama create`). No se documentan vLLM, llama.cpp directo, TGI ni otras alternativas.
- Latencia y throughput: 11,03 tokens/s en generación larga y 11,2–22,8 tokens/s en respuestas cortas, medidos en CPU con 4 vCPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| ThoxClip-Chat-3B | 3B | 8.192 (evaluado) | Qwen Research (no comercial) | Ollama, pesos del base por digest | Configuración derivada, sin entrenamiento; sin benchmarks públicos |
| Qwen2.5-3B-Instruct | 3B | No disponible en esta ficha | Qwen Research / Apache 2.0 según variante (no confirmado aquí) | Safetensors, GGUF, múltiples runtimes | Modelo base exacto; ThoxClip no altera pesos |
| ThoxClip-Qwen3-0.6B | 0,6B (según nombre) | No disponible | No disponible | No disponible | Modelo insignia entrenado del mismo autor, distinto de esta configuración |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 3B parámetros: razonamiento y recall materialmente limitados; el propio autor advierte de que las respuestas deben tratarse en consecuencia.
- Sin entrenamiento propio: cualquier mérito o defecto de los pesos corresponde a Qwen2.5-3B-Instruct; el perfil de sistema solo modera el comportamiento.
- Conocimiento restringido al pack suministrado y a la recuperación; sin contexto, el modelo debe declararlo en lugar de inventar especificaciones THOX, pero no hay garantía de que siempre lo haga.
- Fundamentación medida de 6/8 temas: dos de cada ocho fallaron incluso con pasaje proporcionado.
- Comportamiento de rechazo heredado del base, moderado solo por el perfil; no se comercializa como modelo sin censura.
- Solo inglés; no se declara soporte multilingüe.
- Licencia Qwen Research: uso exclusivamente de investigación y no comercial; se prohíbe el uso comercial y el marketing comercial de este listado.
- No cualificado en hardware de dispositivo según el autor.
- Acciones externas requieren autorización del runtime; los pesos por sí solos no ofrecen enrutamiento en vivo ni acceso a malla.
- Sin benchmarks estándar publicados: no es posible comparar su calidad objetivamente con alternativas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxClip-Chat-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Modelo publicado en Ollama: `Thox-ai/thoxclip-chat-3b` (referencia textual en la model card; no se proporciona URL directa)
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
