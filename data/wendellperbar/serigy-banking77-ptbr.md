# wendellperbar/serigy-banking77-ptbr

## Resumen

Serigy · Banking77 PT-BR es un conjunto de pesos de un comité de clasificación de intenciones bancarias en portugués, desarrollado por wendellperbar. No es un modelo de lenguaje generativo, sino un sistema de cabezas de clasificación entrenadas sobre las representaciones de un LLM congelado, maritaca-ai/S5-nano (4,7 B de parámetros). El modelo lee el mensaje del cliente una sola vez y responde tres preguntas tipadas: el asunto (una de cinco categorías), la urgencia (índice de 0 a 3) y si existe un incidente a resolver (verdadero/falso). Cada respuesta incluye `confidence` y `uncertainty`.

La propuesta técnica es un patrón de "LLM congelado más cabezas ligeras": el S5-nano no se entrena ni se redistribuye, y solo se publican cinco heads de aproximadamente 1,15 M de parámetros cada una (unos 23 MB en total). El repositorio contiene los pesos safetensors, un manifiesto `comite.json` y un notebook de inicio rápido, pero no incluye código de inferencia: el uso se realiza a través de la SDK `serigy` (PyPI), que descarga el LLM base y un encoder MiniLM multilingüe desde sus repositorios originales con revisión fijada.

Es relevante para equipos que necesitan triaje determinista y calibrado de mensajes de atención al cliente en portugués sin desplegar un LLM generativo completo para la tarea final. La licencia Apache 2.0 y el tamaño reducido de los pesos publicados facilitan la integración, aunque la dependencia del S5-nano (9,3 GB en bf16) condiciona los requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM congelado (S5-nano) como encoder de lectura única más cinco cabezas de clasificación entrenadas (comité de seeds 42–46) |
| Parametros totales | ~23 MB de pesos entrenados publicados (5 heads de ~1,15 M de parámetros cada una); el LLM base S5-nano tiene 4,7 B de parámetros en el checkpoint |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; se recomienda bf16 (~9,3 GB) o backend MLX; fp32 en CPU requiere ~19 GB |
| Idiomas soportados | portugués (pt) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`membro_{0..4}.safetensors`) más JSON de configuración y `comite.json` |

## Arquitectura y entrenamiento

El sistema se apoya en el LLM S5-nano de Maritaca AI como lector congelado: el texto se procesa una sola vez y las cinco heads del comité operan sobre esa representación. Cada head se entrenó con una semilla distinta (42 a 46), lo que permite estimar la incertidumbre por desacuerdo entre miembros. Las tres primitivas de respuesta son `Escolha` (clasificación entre cinco asuntos: tarjeta, movimiento de dinero, cobro de tasas, recarga de saldo y cuenta/acceso), `Indice` (urgencia de 0 a 3, con valor esperado Σ k·P(k)) y `Verdadero` (probabilidad de incidente). El manifiesto `comite.json` incluye temperaturas de calibración y cuantiles de referencia para la incertidumbre.

El entrenamiento se realizó sobre el dataset c2d-usp/banking77-pt-br, una traducción al portugués de BANKING77. Las heads aprendieron exclusivamente las tres preguntas definidas con sus criterios literales, sin banco de paráfrasis, por lo que el autor advierte que preguntas nuevas no han sido validadas en este dominio. El etiquetado de `Verdadeiro` usa tres valores derivados de la intención original: 1 para incidentes claros, 0 para dudas de rutina y 0,5 para intenciones ambiguas. No se documentan en la información disponible detalles sobre volumen de tokens, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Clasificación de intención bancaria en portugués en cinco categorías de asunto.
- Estimación de urgencia en una escala ordinal de 0 (rutina) a 3 (riesgo de fraude o pérdida).
- Detección de incidentes con salida probabilística y umbrales de evaluación definidos.
- Calibración de confianza por respuesta (`confidence`) y medida de desacuerdo entre heads (`uncertainty`).
- Lectura única del texto con coste marginal casi nulo por pregunta adicional.
- Salida serializable a JSON público mediante `as_public_dict()`.
- Ejecución en CLI y vía SDK con backends torch (CUDA, MPS, CPU) y MLX para Apple Silicon.
- No soporta tool calling, agentes, visión, audio ni generación de texto libre: es un clasificador, no un modelo generativo.

## Casos de uso

- Triaje automático de tickets de banca: el modelo clasifica el asunto y la urgencia de cada mensaje entrante, lo que permite enrutar al equipo adecuado y priorizar fraudes o pérdidas por delante de consultas de rutina.
- Detección de fraude en primera línea: la categoría de urgencia 3 y la probabilidad de incidente permiten marcar mensajes sobre tarjeta o teléfono robados y transacciones no reconocidas para revisión inmediata.
- Enrutamiento a agentes humanos con contexto: la salida tipada (`escolha`, `indice`, `verdadeiro`) más `confidence` y `uncertainty` permite derivar a un humano los casos con heads en desacuerdo, sin necesidad de un LLM generativo en el bucle.
- Monitorización de colas de soporte: el índice de urgencia agregado por franja horaria sirve para dimensionar turnos y detectar picos de incidentes operativos.
- Clasificación por lotes de históricos de conversaciones: al leer el texto una sola vez y responder tres preguntas casi gratis, resulta adecuado para etiquetar grandes volúmenes de mensajes ya archivados.
- Filtro previo en pipelines de atención automatizada: descarta o prioriza mensajes antes de pasarlos a un sistema generativo más costoso, reduciendo el gasto computacional en la capa de respuesta.
- Evaluación de calidad de traducciones de datasets: al estar entrenado sobre una traducción de BANKING77, sirve como sonda de si las intenciones originales se preservan en portugués.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un scorecard en la carpeta `figuras/` y una comparación con el modelo "Jev", así como que la variante multi-LLM está "1 punto por delante en `escolha` e `indice`, dentro del IC95 de este modelo", pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: ~9,3 GB en bf16 para el S5-nano (valor recomendado en GPU); ~19 GB en fp32 sobre CPU.
- Los pesos del comité publicados ocupan ~23 MB, pero el LLM base se descarga en la primera ejecución desde su repositorio original.
- GPU recomendadas: no se especifican modelos concretos; el backend torch selecciona CUDA, MPS o CPU automáticamente.
- En GPU de consumo: no confirmado para modelos concretos; 9,3 GB en bf16 queda por encima de tarjetas de 8 GB, por lo que una RTX 4090 (24 GB) o similar sería suficiente según el tamaño indicado, aunque el autor no lo certifica.
- Apple Silicon: backend MLX opcional (`pip install "serigy[mlx]>=0.5"`).
- Opciones de despliegue: SDK `serigy` (torch o MLX) y CLI `serigy`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| serigy-banking77-ptbr | Comité sobre LLM congelado (S5-nano) | ~23 MB publicados; base de 4,7 B | no disponible | apache-2.0 | 5 heads, 9,3 GB de sensores |
| serigy-banking77-ptbr-multi | Comité multi-LLM | ~21 GB de sensores | no disponible | no disponible | 1 punto por delante en `escolha` e `indice` según el autor, dentro del IC95 |
| Clasificador BANKING77 estándar (p. ej. fine-tuning de BERT) | Transformer encoder fine-tuned | no disponible | no disponible | variable | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas de la misma categoría en parámetros, contexto y rendimiento.

## Limitaciones y advertencias

- El modelo solo ha sido entrenado con las tres preguntas literales documentadas; preguntas nuevas o parafraseadas no han sido probadas en este dominio.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso.
- Dependencia obligatoria del S5-nano (9,3 GB en bf16) y del encoder MiniLM multilingüe, descargados en la primera ejecución; el repositorio no los redistribuye.
- El repositorio no incluye código de inferencia: el uso requiere la SDK `serigy` (versión >= 0.5).
- El atajo `predict` y el CLI sin `--json` ejecutan las preguntas del modelo de fake news, no las de este modelo; es necesario usar `system_one` con las tres preguntas.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea en mensajes ambiguos o fuera de dominio; la `uncertainty` debe usarse para derivar esos casos.
- El etiquetado de incidentes incluye una clase ambigua (0,5) con umbrales de evaluación específicos; un uso con umbral distinto puede cambiar el comportamiento observado.
- Solo portugués; no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero las licencias del S5-nano y del encoder MiniLM deben verificarse por separado al descargarse de sus repositorios originales.
- No hay datos publicados de latencia ni throughput, lo que dificulta dimensionar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wendellperbar/serigy-banking77-ptbr
- Variante multi-LLM: https://huggingface.co/wendellperbar/serigy-banking77-ptbr-multi
- Modelo base S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Encoder MiniLM multilingüe: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Dataset BANKING77 PT-BR: https://huggingface.co/datasets/c2d-usp/banking77-pt-br
- SDK en PyPI: https://pypi.org/project/serigy/
- Notebook de inicio rápido: https://huggingface.co/wendellperbar/serigy-banking77-ptbr/blob/main/notebook_quick_start_with_Serigy.ipynb
