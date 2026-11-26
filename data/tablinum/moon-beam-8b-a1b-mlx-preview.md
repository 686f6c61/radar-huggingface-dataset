# tablinum/Moon-Beam-8B-A1B-MLX-Preview

## Resumen

Moon-Beam-8B-A1B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Tablinum, construido a partir del modelo base Ling-3.0-tiny de inclusionAI y aumentado con una biblioteca de conocimiento recuperable denominada *engram*. El modelo cuenta con 8 mil millones de parámetros totales, aproximadamente 1 mil millones activos por token y una ventana de contexto de 131.072 tokens. Esta ficha concreta es la variante MLX Preview, una cuantización de 4 bits (expertos) y 8 bits (atención y pesos compartidos) pensada para ejecutarse en Apple Silicon.

La relevancia del modelo reside en su enfoque híbrido entre generación y recuperación: está entrenado para responder a partir de pasajes recuperados, lo que dispara su precisión en tareas factuales cuando se le proporciona contexto. Según la model card, en SimpleQA pasa de 3,0 % de aciertos en modo cerrado a 60,1 % con recuperación activada, y en EngramBench de 12,1 % a 86,5 %. Además, soporta razonamiento explícito (thinking), tool calling y conversaciones multi-turno con memoria.

La versión publicada corresponde a la ronda 1b de ajuste fino, ya que la ronda 2 no superó las métricas de validación. La cuantización MLX mantiene una concordancia top-1 del 96,75 % con BF16 en chat, código y matemáticas, y del 90,92 % en WikiText, con un tamaño de repositorio de 4,9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre base Ling-3.0-tiny, tag `bailing_hybrid` |
| Parametros totales | 7.893.392.800 (8B) |
| Parametros activos | ~1B por token (A1B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4-bit en expertos, 8-bit en atención y pesos compartidos (mezcla "beam"); disponibles también BF16, MLX 8-bit y GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX); también GGUF y BF16 en repositorios hermanos |

## Arquitectura y entrenamiento

Moon-Beam se apoya en Ling-3.0-tiny de inclusionAI, un transformer de mezcla de expertos con aproximadamente 8B de parámetros totales y 1B activos por token. Tablinum añade la *engram*, una biblioteca de conocimiento recuperable, y realiza un ajuste fino con QLoRA sobre pasajes recuperados, problemas matemáticos, llamadas a herramientas y conversaciones multi-turno. El entrenamiento corresponde a la ronda 1b, seleccionada porque la ronda 2 no superó las puertas de validación en held-out (documentado en `round2_gate_decision.txt`).

La innovación principal no está en la arquitectura del transformer sino en el binomio modelo-recuperación: el modelo está entrenado para consumir pasajes en un formato concreto y para invocar una herramienta `search_library` por sí mismo, lo que permite resolver preguntas de dos pasos. La cuantización MLX emplea 4 bits en los expertos y 8 bits en atención y pesos compartidos, preservando una concordancia top-1 del 96,75 % con BF16 en dominios mixtos y del 90,92 % en WikiText (KLD 0,0115 / 0,0444).

## Capacidades

- Generación de texto conversacional en inglés con soporte de razonamiento explícito (thinking mode).
- Razonamiento matemático: 95,5 % en 400 preguntas de GSM8K con thinking activado.
- Tool calling y function calling, incluyendo la herramienta propia `search_library` que el modelo invoca autónomamente.
- Razonamiento multi-paso apoyado en recuperación (mejora de 9,1 % a 63,6 % en preguntas de dos pasos con el harness actualizado).
- Memoria de conversaciones anteriores: recupera notas de chats previos mediante coincidencia por palabras distintivas (89,6 % de acierto en tareas de memoria).
- Respuesta fundamentada en pasajes recuperados, con formato de contexto específico de entrenamiento.
- Capacidades de agente para atención al cliente (tau2-bench: 0,71 en airline, 0,80 en retail, 0,62 en telecom).
- Multilingüe: no disponible (solo inglés declarado).

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (131K tokens) y mantener el razonamiento entre turnos, lo que según la model card es crítico para su rendimiento en tau2-bench (0,711 con razonamiento conservado frente a 0,045 si se descarta).
- Asistente con base de conocimiento corporativa: desplegado detrás de terrabeam, responde consultas sobre tablas de documentación con hasta 29 tablas distintas, alcanzando un 91,7 % de acierto en tareas factuales.
- Resolución de preguntas de dos pasos: gracias a la invocación autónoma de `search_library`, puede encadenar búsquedas para preguntas que requieren combinar información de varias fuentes.
- Memoria persistente de usuario: integrado en aplicaciones con historial, recupera hechos personales contados en conversaciones anteriores (89,6 % de acierto en el conjunto de evaluación).
- Razonamiento matemático asistido: útil para tutores o asistentes de cálculo que se beneficien de thinking mode y de un contexto amplio para problemas encadenados.
- Despliegue local en Apple Silicon: la variante MLX 4-bit (4,6 GB) permite ejecutar el modelo en portátiles y equipos de sobremesa con chip Apple, con API compatible con OpenAI mediante `mlx_lm.server`.
- Agentes de soporte con herramientas: integrable en pipelines donde el modelo deba llamar a funciones externas y razonar sobre sus resultados antes de responder.

## Benchmarks y rendimiento

| Evaluación | Configuración | Resultado |
|---|---|---|
| GSM8K (400 preguntas) | Thinking on, protocolo de model card | 95,5 % |
| EngramBench (503 preguntas) | Thinking on, con pasajes | 86,5 % (436/503) |
| EngramBench (503) | Thinking off, con pasajes | 87,9 % |
| EngramBench (503) | Thinking on, cerrado | 12,1 % |
| SimpleQA (1000) | Thinking on, con pasajes | 60,1 % |
| SimpleQA (1000) | Thinking on, cerrado | 3,0 % |
| AA-Omniscience dev (200) | Thinking on, con pasajes | 28,0 % |
| AA-Omniscience dev (200) | Thinking on, cerrado | 10,5 % |
| tau2-bench airline | Agente de soporte | 0,71 de recompensa media |
| tau2-bench retail | Agente de soporte | 0,80 de recompensa media |
| tau2-bench telecom | Agente de soporte | 0,62 de recompensa media |
| Concordancia top-1 vs BF16 (chat/código/matemáticas) | MLX 4-bit | 96,75 % |
| Concordancia top-1 vs BF16 (WikiText) | MLX 4-bit | 90,92 % (KLD 0,0115 / 0,0444) |

## Requisitos de hardware

- VRAM estimada: 4,6 GB para la variante MLX 4-bit; el repositorio ocupa 4,9 GB. Las variantes BF16 y 8-bit requieren aproximadamente el doble y el cuádruple respectivamente.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4) con al menos 8 GB de memoria unificada para la variante 4-bit. Para BF16 se recomienda 16-24 GB de memoria unificada.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon de gama media y alta; también en GPUs NVIDIA de consumo mediante la variante GGUF.
- Opciones de despliegue: `mlx-lm` (generate y server con API estilo OpenAI), llama.cpp/Ollama mediante el repositorio GGUF, y terrabeam como proxy de recuperación delante del servidor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Moon-Beam-8B-A1B (MLX) | 8B totales / ~1B activos | 131.072 | MIT | Hugging Face (MLX, GGUF, BF16) |
| Ling-3.0-tiny (base) | ~8B totales / ~1B activos | no disponible | no disponible | Hugging Face (inclusionAI) |
| Alternativas MoE de ~8B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada. La model card menciona que el base Ling sin ajuste alcanzó 59,2 % en SimpleQA con los mismos pasajes y thinking on, frente al 60,1 % de la ronda 1b de Moon-Beam.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Está entrenado para responder a partir de pasajes recuperados; sin el harness de recuperación (terrabeam) su rendimiento factual cae drásticamente (SimpleQA de 60,1 % a 3,0 %).
- La ronda 2 de ajuste no superó las puertas de validación, por lo que los pesos publicados son de la ronda 1b; puede haber margen de mejora no materializado.
- Riesgo de alucinación en modo cerrado: las cifras de SimpleQA y AA-Omniscience en configuración sin recuperación son muy bajas.
- El formato de los pasajes recuperados debe coincidir con el layout de entrenamiento; un formato distinto puede degradar el rendimiento.
- La variante MLX está pensada para Apple Silicon; en otras plataformas debe usarse GGUF o BF16.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones del modelo base Ling-3.0-tiny de inclusionAI por si impusieran restricciones adicionales.
- El modelo depende de código personalizado (`custom_code`), lo que puede requerir pasos adicionales de instalación.
- No se han publicado datos de latencia ni throughput, lo que dificulta estimar costes de producción.

## Enlaces

- Hugging Face (MLX Preview): https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-Preview
- Modelo base: https://huggingface.co/tablinum/Moon-Beam-8B-A1B
- Variante MLX 8-bit: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-MLX-8bit
- Variante GGUF: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF
- Notas de modelo y evaluación: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/README.md
- Decisión de la ronda 2: https://huggingface.co/tablinum/Moon-Beam-8B-A1B-GGUF/blob/main/stats/round2_gate_decision.txt
- Repositorio terrabeam: https://github.com/chadstthomas-svg/terrabeam
- Release terrabeam 0.3.0: https://github.com/chadstthomas-svg/terrabeam/releases/tag/v0.3.0
