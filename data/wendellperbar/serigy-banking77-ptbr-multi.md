# wendellperbar/serigy-banking77-ptbr-multi

## Resumen

Serigy Banking77 PT-BR Multi es un comité de clasificación de intenciones bancarias en portugués de Brasil, desarrollado por wendellperbar. A diferencia de un modelo generativo convencional, se compone de 15 cabezas de clasificación (heads) ligeras entrenadas sobre los estados ocultos de tres LLM congelados: Manacá-1B, S5-nano y Lumi-4B. Cada head responde a tres preguntas tipadas sobre la mensaje del cliente: el asunto (5 categorías), la urgencia (índice 0-3) y si existe un incidente a resolver (booleano con etiqueta ambigua).

El modelo resuelve el triaje automático de mensajes de atención al cliente bancaria, un problema donde la latencia, la calibración de confianza y la capacidad de abstención importan tanto como la precisión. Cada respuesta incluye `confidence` (probabilidad de la decisión) y `uncertainty` (grado de acuerdo entre las heads), lo que permite enrutar casos dudosos a revisión humana. Los pesos entrenados ocupan unos 66 MB, pero requieren cargar los tres sensores (~21 GB en bf16) en memoria durante la inferencia.

Es relevante por su enfoque de "system one" congelado: no se reentrena ningún LLM, solo se añaden cabezas de 1,0-1,3 M de parámetros cada una, lo que abarata el desarrollo y mantiene la reproducibilidad. El propio autor advierte que el comité de tres sensores solo supera en 1 punto al comité de un único sensor (S5-nano) dentro del intervalo de confianza del 95%, a cambio de más del doble de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Comité de 15 heads de clasificación sobre 3 LLM congelados (Manacá-1B, S5-nano, Lumi-4B) + encoder MiniLM multilingüe |
| Parametros totales | ~10,4 B (sensores congelados) + ~66 MB de pesos entrenados (15 heads) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los sensores se cargan en bf16 por defecto o fp32) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (heads) + JSON de manifiesto; los LLM base se descargan de sus repositorios originales |

## Arquitectura y entrenamiento

La arquitectura es un comité de clasificación con congelación total de los LLM base. Tres sensores (Manacá-1B, S5-nano y Lumi-4B) procesan el texto de entrada una sola vez; sobre el estado oculto de cada sensor se entrenan cinco heads independientes (seeds 42-46), cada una de 1,0-1,3 M de parámetros. Las 15 heads se agrupan por pregunta: 5 sobre asunto, 5 sobre urgencia y 5 sobre incidente, y cada grupo agrega las predicciones de los tres sensores. Un encoder MiniLM multilingüe (paraphrase-multilingual-MiniLM-L12-v2) complementa el pipeline.

El entrenamiento se realizó sobre el dataset BANKING77 traducido al portugués de Brasil (c2d-usp/banking77-pt-br). Las heads aprendieron únicamente tres preguntas fijas, sin banco de paráfrasis, por lo que el autor advierte que preguntas nuevas no han sido evaluadas en este dominio. La etiqueta de incidente usa tres valores (1 para incidente claro, 0 para consulta rutinaria, 0,5 para intenciones ambiguas como "mi tarjeta aún no ha llegado"), y el scorecard considera correcta una respuesta si P(sim) ≥ 0,5 en el caso 1, P(sim) < 0,5 en el 0 y 0,35 ≤ P(sim) ≤ 0,65 en el 0,5. No se menciona RLHF ni DPO; el enfoque es supervisado sobre estados ocultos congelados.

## Capacidades

- Clasificación de asunto en 5 categorías bancarias: tarjeta, movimiento de dinero, cobro de tasas, recarga de saldo y acceso a cuenta.
- Estimación de urgencia en una escala ordinal de 0 (rutina) a 3 (fraude o pérdida).
- Detección de incidente con etiqueta booleana y soporte para casos ambiguos (0,5).
- Calibración de confianza por respuesta (`confidence`) y medida de desacuerdo entre heads (`uncertainty`).
- Lectura única del texto por sensor: preguntas adicionales sobre el mismo texto tienen coste casi nulo.
- Salida estructurada en JSON público mediante `as_public_dict()`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador, no un generador.
- Capacidad multilingüe limitada al portugués; no se declaran otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Triaje automático de tickets bancarios: el modelo clasifica cada mensaje entrante en asunto, urgencia e incidente, permitiendo enrutar a colas especializadas según la categoría y priorizar los casos de urgencia 3 (fraude o pérdida).
- Enrutamiento con abstención: usando `uncertainty` alta o `confidence` baja, los casos dudosos se derivan a revisión humana, reduciendo errores en producción sin sacrificar cobertura.
- Detección de fraude en primera línea: la combinación de urgencia 3 e incidente verdadero identifica mensajes sobre tarjeta robada o transacciones no reconocidas para escalado inmediato.
- Clasificación de solicitudes de tarjeta: distingue entre obtención, entrega, activación, uso y bloqueo de tarjeta física, virtual, PIN o cartera digital, útil para automatizar respuestas de primer nivel.
- Análisis de motivos de contacto: agregando las salidas de asunto y urgencia sobre lotes de mensajes, los equipos de operaciones pueden medir qué porcentaje de contactos son incidentes y priorizar la mejora de procesos.
- Preclasificación en pipelines de atención multicanal: al ser un comité ligero sobre LLM congelados, puede integrarse como paso previo a un LLM generativo que redacte la respuesta, reduciendo el coste de contexto y de generación.
- Monitorización de calidad y deriva: la `uncertainty` agregada por categoría sirve como señal de cambios en la distribución de mensajes o de degradación del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el comité de tres sensores es el mejor del estudio en `escolha` e `indice`, pero solo 1 punto por delante del comité de un solo sensor (S5-nano) dentro del IC95 de este último. No se proporcionan cifras absolutas de accuracy, F1 ni latencia.

## Requisitos de hardware

- VRAM estimada: ~21 GB en bf16 para los tres sensores; ~42 GB en fp32.
- GPU recomendadas: GPU con 24 GB o más (por ejemplo, RTX 3090/4090, A10G, L4, A100, H100).
- En consumer GPU: cabe en RTX 3090 y RTX 4090 con 24 GB en bf16; no cabe en GPUs de 16 GB o menos con los tres sensores.
- Apple Silicon: Mac con 32 GB o más usando el backend MLX (`pip install "serigy[mlx]>=0.5"`).
- Opciones de despliegue: SDK `serigy` (backend torch con CUDA → MPS → CPU, o MLX); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor señala que el texto se lee una vez por sensor y que preguntas adicionales sobre el mismo texto son casi gratuitas.
- Alternativa de menor coste: el comité de un solo sensor `serigy-banking77-ptbr` requiere ~9,3 GB en lugar de ~21 GB.

## Comparativa con modelos similares

| Modelo | Sensores | Pesos entrenados | VRAM (bf16) | Contexto | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|---|
| serigy-banking77-ptbr-multi | 3 (Manacá-1B, S5-nano, Lumi-4B) | ~66 MB (15 heads) | ~21 GB | no disponible | Apache 2.0 | Mejor en `escolha` e `indice`, +1 punto sobre el de un sensor (dentro del IC95) |
| serigy-banking77-ptbr | 1 (S5-nano) | no disponible | ~9,3 GB | no disponible | no disponible | Referencia del estudio; a 1 punto del comité múltiple |
| Clasificadores BERT/RoBERTa para BANKING77 | 1 encoder | no disponible | <1 GB | típicamente 512 tokens | variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de comparativas numéricas con clasificadores estándar de BANKING77 en la información proporcionada.

## Limitaciones y advertencias

- El comité de tres sensores solo mejora en 1 punto al de un solo sensor dentro del IC95, con más del doble de VRAM; el autor recomienda el de un sensor para la mayoría de usos.
- Las heads se entrenaron exclusivamente con tres preguntas fijas y sin banco de paráfrasis; preguntas nuevas no han sido evaluadas en este dominio.
- Solo soporta portugués; no se declaran capacidades en otros idiomas.
- Es un clasificador de intenciones, no un generador: no puede redactar respuestas ni mantener conversaciones multi-turno.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración defectuosa: `confidence` y `uncertainty` deben validarse en el dominio de despliegue antes de usarse como umbrales de abstención.
- La etiqueta de incidente incluye casos ambiguos (0,5) con criterios de aceptación específicos; ignorarlos puede inflar o degradar métricas.
- Sesgos conocidos: no se documentan sesgos específicos, pero al entrenar sobre BANKING77 traducido, pueden heredarse sesgos de la traducción y del dataset original.
- Licencia Apache 2.0 permite uso comercial, pero los LLM base (Manacá-1B, S5-nano, Lumi-4B) y el encoder MiniLM se descargan de sus repositorios originales y están sujetos a sus propias licencias, que deben verificarse por separado.
- El repositorio no contiene código de inferencia; el uso requiere la SDK `serigy>=0.5`.
- Requiere ~21 GB de VRAM en bf16, lo que excluye GPUs de consumo de gama media y entornos sin GPU dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wendellperbar/serigy-banking77-ptbr-multi
- Comité de un solo sensor: https://huggingface.co/wendellperbar/serigy-banking77-ptbr
- SDK serigy en PyPI: https://pypi.org/project/serigy/
- Modelo base Manacá-1B: https://huggingface.co/AIInstituteLNCC/manaca-1b-base
- Modelo base S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Modelo base Lumi-4B: https://huggingface.co/ceia-research/lumi-4b
- Encoder MiniLM multilingüe: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Dataset BANKING77 PT-BR: https://huggingface.co/datasets/c2d-usp/banking77-pt-br
