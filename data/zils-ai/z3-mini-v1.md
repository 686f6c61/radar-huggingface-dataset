# zils-ai/z3-mini-v1

## Resumen

z3-mini v1 es el modelo fundacional de la línea z3 de Zils, una familia que el autor denomina "decision models" (modelos de decisión). Lo publica la organización zils-ai con licencia Apache 2.0, únicamente en inglés, y consta de 4.539.265.536 parámetros (≈4,5B) en formato safetensors, con arquitectura etiquetada como `qwen3_5` y código personalizado (`custom_code`).

La característica definitoria de esta release es que no introduce ningún cambio de pesos: reutiliza íntegramente el modelo base `vllm-sr/d3-mini`, espejado a través de `zils-ai/d3-mini-4.5b-v1`. No es un candidato ganador de una elección entrenada por mineros, sino el punto de partida (incumbent) contra el que se validarán futuros candidatos dentro de la política de releases de Zils.

Su relevancia es, por tanto, tanto técnica como de gobernanza: fija la línea base de la familia mini, define el perfil de ejecución de Zils (con un techo de 4.096 tokens de entrada) y establece el procedimiento de procedencia y validación. Para evaluar el modelo conviene tener presente que no se publican benchmarks ni detalles de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, etiqueta `qwen3_5`, con `custom_code` y ficheros de runtime |
| Parámetros totales | 4.539.265.536 (≈4,5B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens de entrada como límite del perfil Zils; contexto nativo del modelo base no disponible |
| Tipos de cuantización | No disponible; el repositorio solo publica safetensors, sin GGUF ni variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 9,1 GB, coherente con pesos de 16 bits, aunque el dato exacto de precisión no se indica) |

## Arquitectura y entrenamiento

La etiqueta `qwen3_5` sitúa el modelo en la familia Qwen3.5, es decir, un transformer decoder-only de 4,5B parámetros. El repositorio incluye código personalizado y ficheros de runtime propios, por lo que la carga requiere `trust_remote_code` o el runtime de Zils; los nombres de fichero originales y el perfil inmutable de d3 siguen siendo válidos según la model card.

No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si el modelo base pasó por RLHF, DPO u otra fase de alineamiento. Lo que sí se documenta con precisión es que esta release no aplica entrenamiento adicional: los pesos son idénticos a los de `vllm-sr/d3-mini` y se mantienen la LICENSE y NOTICE originales. El marco descrito por el autor es un sistema de mineros que entrenan candidatos contra el incumbent de una línea habilitada, con validación independiente y aprobación de release antes de que un candidato pase a ser una release oficial de z3.

## Capacidades

- Generación de texto en inglés: capacidad esperable por tratarse de un modelo de lenguaje decoder-only de 4,5B, aunque la model card no documenta evaluaciones concretas.
- Modelo de decisión: el autor posiciona la línea z3 explícitamente como "decision models"; no se detalla en la información disponible qué tarea de decisión cubre ni con qué formato de salida.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según el campo `language` del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).
- Contexto: techo de 4.096 tokens de entrada bajo el perfil Zils, lo que condiciona cualquier uso que requiera ventanas largas.

## Casos de uso

- Clasificación y enrutamiento en inglés: usar el modelo para asignar categoría o cola de destino a peticiones entrantes, aprovechando su tamaño reducido para mantener coste por inferencia bajo. Requiere validación interna previa, ya que no hay benchmarks publicados.
- Puntuación de opciones en pipelines de decisión: dado su posicionamiento como "decision model", encaja como componente de scoring o selección entre alternativas acotadas, con prompts cortos que respeten el techo de 4.096 tokens.
- Baseline interno de la línea z3: servir como incumbent contra el que comparar candidatos entrenados por mineros antes de aprobar una release posterior.
- Prefiltrado y moderación de texto en inglés: primera pasada sobre contenido para descartar o marcar casos antes de escalar a un modelo mayor, siempre que una evaluación propia confirme la calidad de clasificación.
- Extracción de campos estructurados en documentos cortos: con prompts y esquemas compactos, para tareas de etiquetado semiautomático en inglés dentro de un rango de 4K tokens.
- Prototipado de asistentes de dominio acotado: iteración rápida en local sobre una única GPU de consumo, con prompts condensados y sin necesidad de contexto largo.
- Evaluación de la infraestructura de despliegue: al ser un modelo de 4,5B con `custom_code`, resulta útil para probar el runtime de Zils o vLLM antes de adoptar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica, y tampoco se documentan latencia o throughput.

## Requisitos de hardware

- VRAM estimada: los 9,1 GB de safetensors implican unos 9-10 GB solo para pesos en 16 bits; con caché KV para 4.096 tokens conviene reservar entre 11 y 14 GB según lote y runtime.
- GPU profesionales: A10G (24 GB), L4 (24 GB) y A100/H100 para despliegues con concurrencia; estas últimas quedan sobredimensionadas para un modelo de 4,5B en bf16.
- GPU de consumo: cabe en RTX 3090, RTX 4080/4090 (16-24 GB). En tarjetas de 12 GB encajaría solo con cuantización, y el repositorio no publica variantes GGUF ni cuantizadas.
- Opciones de despliegue: vLLM es la opción coherente con el origen del modelo base (`vllm-sr`); también TGI. llama.cpp u Ollama requerirían generar conversiones propias a GGUF, con la validación correspondiente.
- Latencia y throughput: no disponible.
- Nota operativa: al incluir `custom_code`, hay que prever `trust_remote_code=True` o el runtime específico de Zils, además de revisar los ficheros de código antes de ejecutarlos en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| z3-mini-v1 | 4,54B | 4.096 tokens de entrada (perfil Zils; nativo no disponible) | Apache 2.0 | Pesos en HF; la disponibilidad alojada se comprueba por separado |
| Qwen3-4B | ≈4B | 32.768 tokens nativos, hasta 131.072 con YaRN | Apache 2.0 | Pesos y amplia variedad de cuantizaciones |
| Llama 3.2 3B | ≈3,2B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos y ecosistema amplio de despliegue |
| Phi-4-mini-instruct | ≈3,8B | 128.000 tokens | MIT | Pesos en HF, soporte en runtimes habituales |
| Gemma 3 4B | ≈4B | 128.000 tokens | Términos de uso de Gemma | Pesos en HF con variantes cuantizadas |

Los datos de los modelos alternativos provienen de sus model cards públicas y deben verificarse antes de usarse en una decisión de producción. En rendimiento no procede comparación: z3-mini v1 no publica métricas.

## Limitaciones y advertencias

- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas, lo que descarta su uso directo en productos en español.
- Ventana de entrada de 4.096 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o recuperación con muchos pasajes.
- Ausencia total de benchmarks: no hay evidencia pública de calidad en razonamiento, código, matemáticas ni clasificación; cualquier adopción exige una evaluación interna propia.
- Modelo fundacional sin entrenamiento adicional: los pesos son los del upstream `vllm-sr/d3-mini`, por lo que hereda sus sesgos y sus limitaciones, que no se documentan.
- Riesgo de alucinación: no se describe ninguna fase de alineamiento ni mitigación específica en la información disponible.
- Código personalizado: `custom_code` obliga a auditar los ficheros antes de ejecutarlos y a fijar una revisión concreta para reproducibilidad.
- Licencia: Apache 2.0 permite uso comercial, pero se mantienen la LICENSE y NOTICE originales del modelo base, que conviene revisar y conservar.
- Gobernanza: el nombre de release no es un alias de inferencia; para usar el modelo vía API hay que emplear el ID que devuelve el listado de modelos de la cuenta de Zils.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zils-ai/z3-mini-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Espejo de procedencia: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Guía de modelos de Zils: https://docs.zils.ai/getting-started/models
- Sitio de Zils: https://zils.ai
