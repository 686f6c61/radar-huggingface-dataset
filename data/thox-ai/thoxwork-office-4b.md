# Thox-ai/ThoxWork-Office-4B

## Resumen

ThoxWork-Office-4B es un paquete de configuración publicado por Thox-ai sobre los pesos del modelo Qwen3-4B de Alibaba. No se trata de un modelo entrenado por THOX: el repositorio contiene únicamente el empaquetado (un `Modelfile` de Ollama, un manifiesto de release y un knowledge pack en JSONL), mientras que los pesos son los originales de Qwen, descargados por Ollama desde el tag fijado `qwen3:4b`. La propuesta del autor es un perfil de sistema orientado a asistencia documental y conocimiento corporativo, con inferencia local y offline.

El modelo resuelve un problema de despliegue más que de capacidad: empaquetar un modelo pequeño (4B parámetros) con un perfil de empresa y una base de conocimiento versionada para que pueda ejecutarse en hardware modesto mediante Ollama. La relevancia es limitada fuera de ese contexto, ya que no aporta mejoras de entrenamiento ni de arquitectura respecto a Qwen3-4B, y su utilidad depende enteramente del perfil y del knowledge pack incluidos.

La arquitectura subyacente es la de Qwen3-4B, un transformer denso de la familia Qwen3. El contexto evaluado en la model card es de 8.192 tokens y el idioma declarado es únicamente inglés. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B); el repositorio solo aporta empaquetado Ollama |
| Parametros totales | 4B (pesos del modelo base Qwen3-4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (contexto evaluado en la model card) |
| Tipos de cuantizacion | Q4-clase por defecto en Ollama (modelo publicado de 2,50 GB); otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Modelfile + manifest.json + knowledge pack JSONL; pesos servidos por Ollama desde el tag `qwen3:4b` |

## Arquitectura y entrenamiento

No hay entrenamiento por parte de THOX. El modelo reutiliza los pesos de Qwen/Qwen3-4B, fijados en el manifiesto al digest `359d7dd4bcdab3d86b87d73ac27966f4dbb9f5efdfcc75d34a8764a09474fae7` del tag `qwen3:4b` de Ollama. La personalización consiste en un perfil de sistema incluido en el `Modelfile` (perfil enterprise del THOX Work MeshGroup Model Kit) y un knowledge pack versionado (`thox-knowledge-v0.1.jsonl`, 8 entradas públicas verificadas) pensado para respuestas fundamentadas mediante recuperación.

El repositorio incluye tres ficheros: `Modelfile` (800 B), `manifest.json` (380 B) y `thox-knowledge-v0.1.jsonl` (4.652 B). El modelo publicado en Ollama ocupa 2,50 GB en su tag por defecto y reutiliza la capa del modelo base más la capa de perfil generada a partir del `Modelfile`. No se documentan innovaciones técnicas propias (ni decodificación especulativa, ni atención lineal, ni modificaciones de arquitectura); cualquier capacidad técnica procede del Qwen3-4B original.

## Capacidades

- Generación de texto en inglés con perfil orientado a asistencia documental y corporativa.
- Respuestas fundamentadas en el knowledge pack suministrado (grounding por pasaje), con instrucción explícita de no inventar especificaciones de THOX cuando falta contexto.
- Comportamiento de rechazo ante confirmaciones de topología fabricada (trampa de topología falsa superada según la model card).
- Respuestas de enrutamiento etiquetadas como recomendación (local primero, nube solo con consentimiento explícito), no como estado en vivo.
- Ejecución local y offline mediante el endpoint local de Ollama.
- Integración opcional con el runtime THOX para descubrimiento MeshStack y ejecución autorizada (no disponible solo con los pesos).
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Asistencia documental interna: el modelo responde sobre documentos corporativos apoyándose en el knowledge pack y en contexto recuperado, adecuado por su perfil de sistema y su instrucción de no inventar datos ausentes.
- Despliegue en estaciones de trabajo sin GPU: con 3,89 GB de RAM en ejecución CPU y 15,2–16,3 tokens/s en respuestas cortas, es viable en equipos de 8 GB clase 4 vCPU.
- Entornos air-gapped: al funcionar standalone y offline vía Ollama, encaja en instalaciones sin conectividad externa donde no se puede depender de APIs en la nube.
- Punto de partida para un asistente de oficina personalizado: el `Modelfile` y el knowledge pack son editables, de modo que un equipo puede sustituir el perfil y las entradas JSONL por su propia base de conocimiento.
- Clasificación y respuestas breves de FAQ: el rendimiento medido en el conjunto de smoke (15,2–16,3 tokens/s) y las 3/3 respuestas coherentes del smoke de fábrica lo hacen apto para consultas cortas y repetitivas.
- Validación de políticas de enrutamiento local-first: útil como demostración de un asistente que etiqueta recomendaciones de enrutamiento en lugar de afirmar estado en vivo, para prototipos de gobierno de datos.
- Pruebas de concepto de grounding con recuperación: permite evaluar el patrón de respuesta fundamentada (7/8 temas respondidos con hechos del pack) antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

La model card incluye una evaluación medida el 2026-11-01 en un host x86_64 solo CPU (clase 4 vCPU / 8 GB), con contexto de 8.192 tokens y la configuración publicada. No se aportan resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Generación de texto largo | 15,32 tokens/s | Bench de 1.024 tokens, CPU |
| Respuestas cortas | 15,2–16,3 tokens/s | Conjunto de smoke, CPU |
| Huella de memoria en carga | 3,89 GB RAM (0 GB VRAM) | Ejecución CPU |
| Smoke de fábrica | 3/3 respuestas coherentes y en perfil | Preguntas de fábrica |
| Grounding con Knowledge Pack v0.1 | 7/8 temas respondidos con hechos del pack | Pasaje suministrado, una pregunta por tema |
| Trampa de topología fabricada | El modelo rechazó la confirmación | Prueba adversarial |
| Pregunta de enrutamiento | Respondida como recomendación etiquetada | Local primero, nube con consentimiento |

## Requisitos de hardware

- VRAM estimada: 0 GB en la configuración medida (ejecución CPU); el modelo publicado ocupa 2,50 GB en disco y 3,89 GB de RAM en carga.
- GPU recomendadas: no disponibles en la información proporcionada; la evaluación documentada es exclusivamente CPU.
- Cabe en hardware de consumo: sí, en hosts de clase 4 vCPU / 8 GB de RAM según la medición del autor; no se especifican modelos de GPU concretos.
- Opciones de despliegue: Ollama (modelo publicado `Thox-ai/thoxwork-office-4b` o construcción local con `ollama create` desde el `Modelfile`). No se documentan vLLM, llama.cpp directo ni TGI.
- Latencia y throughput: 15,32 tokens/s en generación larga y 15,2–16,3 tokens/s en respuestas cortas, medidos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento propio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxWork-Office-4B | 4B | 8.192 tokens (evaluado) | No (empaquetado sobre Qwen3-4B) | Apache-2.0 | Ollama y HuggingFace |
| Qwen/Qwen3-4B | 4B | No disponible en la información proporcionada | Sí (modelo base original) | Apache-2.0 | HuggingFace y Ollama |
| Alternativas de 4B de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es con el propio Qwen3-4B: ThoxWork-Office-4B no modifica los pesos, por lo que su rendimiento intrínseco es el del modelo base, y su valor diferencial se limita al perfil de sistema y al knowledge pack. No se dispone de datos de benchmarks estándar para contrastar con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Un modelo de 4B tiene razonamiento y recall materialmente limitados; la propia model card advierte de que las respuestas deben tratarse en consecuencia.
- El comportamiento de rechazo es el del modelo base, moderado solo por el perfil de sistema; no se comercializa como modelo sin censura.
- El conocimiento está limitado al pack suministrado y a la recuperación; sin contexto aportado, el modelo debe indicarlo en lugar de inventar especificaciones de THOX.
- Idioma declarado únicamente inglés; no se documenta soporte multilingüe.
- Contexto evaluado de 8.192 tokens; no se confirma una ventana mayor para este empaquetado.
- Las acciones externas requieren autorización del runtime; los pesos por sí solos no proporcionan enrutamiento en vivo ni acceso a la malla.
- Los grupos corporativos son dominios de seguridad aislados; las peticiones entre sitios requieren concesiones de política explícitas y transporte autenticado.
- Licencia Apache-2.0 heredada del modelo base; los elementos propios de THOX (perfil de sistema, knowledge pack, empaquetado) también se publican bajo esa licencia según la model card.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/ThoxWork-Office-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Modelo publicado en Ollama: `Thox-ai/thoxwork-office-4b` (referencia de la model card; no se proporciona URL directa)
