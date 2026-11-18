# XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B

## Resumen

MiMo-V2.6-Distill-Qwen-9B es un modelo de 9.409.813.744 parámetros desarrollado por Xiaomi MiMo mediante ajuste supervisado (SFT) sobre Qwen/Qwen3.5-9B. Está orientado a tareas agénticas: código, uso de herramientas, tareas generales de agente, codificación visual y ciberseguridad. Xiaomi lo publica como punto de partida para investigación abierta en aprendizaje por refuerzo agéntico, no como un modelo final de RL.

El modelo parte de la arquitectura de Qwen3.5-9B (transformer denso, pipeline image-text-to-text, librería transformers, formato safetensors) y añade una plantilla de chat propia de MiMo v2.6, además de un parser de razonamiento específico (`--reasoning-parser mimo`) para servidores SGLang. Incorpora un modo de pensamiento explícito que se activa con `enable_thinking: True` y expone el contenido de razonamiento en el campo `reasoning_content`.

Su relevancia actual radica en que combina un tamaño manejable (9B) con un salto notable en benchmarks agénticos respecto al modelo base: por ejemplo, AutomationBench pasa de 5,0 a 30,3, Terminal Bench 2.1 de 27,0 a 37,1 y MiMo Code (mini) de 19,5 a 51,6. La licencia MIT facilita su adopción comercial, aunque la model card incluye restricciones de uso adicionales que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3.5-9B), pipeline image-text-to-text |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers; repo de 18,8 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning supervisado de Qwen3.5-9B, un transformer denso de aproximadamente 9,4 mil millones de parámetros. Xiaomi no detalla en la información disponible innovaciones arquitectónicas propias más allá de la plantilla de chat MiMo v2.6 y el parser de razonamiento `mimo` para SGLang; el pipeline declarado es image-text-to-text, lo que indica soporte multimodal de entrada (imagen y texto), coherente con la inclusión de tareas de codificación visual en la evaluación.

El entrenamiento consiste en SFT sobre datos generados por MiMo, con una mezcla ponderada de 77,4B tokens totales, de los cuales 27,2B son tokens con pérdida (loss-bearing). La composición por dominio es: código 23,2B (29,9 %), ciber 11,0B (14,2 %), general 22,0B (28,5 %) y visual 21,2B (27,4 %). No se indica en la información proporcionada si hubo RLHF, DPO ni una fase de RL posterior; de hecho, el checkpoint se presenta explícitamente como base para investigación en RL agéntico.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento explícito (`enable_thinking`), que separa el contenido de razonamiento del contenido final de la respuesta.
- Generación y edición de código, incluyendo resolución de issues en repositorios reales (evaluado en SWE Verified y SWE Pro).
- Uso de herramientas y function calling, con soporte para tareas multi-paso (Toolathlon-Verified, Terminal Bench 2.1).
- Capacidades agénticas generales: automatización de flujos, operación de terminal y tareas de oficina (AutomationBench, OfficeQA, JobBench).
- Codificación visual (entrada image-text-to-text), evaluada en MiMo Visual Coding.
- Conocimientos de ciberseguridad, evaluados en MiMo Cyber (mini).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Resolución automática de issues en repositorios: el modelo puede recibir un issue y el contexto del repositorio, localizar los ficheros relevantes y proponer un parche. Su rendimiento en SWE Verified (61,1 avg@3) y SWE Pro (44,6 avg@3) lo hace adecuado para integrarse en pipelines de revisión asistida.
- Agentes de terminal y automatización de operaciones: con 37,1 en Terminal Bench 2.1, puede ejecutar secuencias de comandos multi-paso en entornos controlados, útil para tareas de administración de sistemas con supervisión humana.
- Orquestación de herramientas en asistentes corporativos: el soporte de tool calling y su puntuación en Toolathlon-Verified (35,2) permiten construir asistentes que consultan APIs, bases de datos y servicios internos de forma encadenada.
- Automatización de tareas de oficina y ofimática: con 19,5 en OfficeQA y 18,3 en JobBench, puede emplearse para extraer y transformar información de documentos, hojas de cálculo y flujos administrativos repetitivos.
- Codificación visual: al aceptar entradas de imagen y texto, puede interpretar capturas de interfaz, diagramas o mockups y generar código de UI o corregir maquetación.
- Análisis de seguridad defensiva: su mejora en MiMo Cyber (mini), de 5,7 a 31,3, lo hace útil para triaje de alertas, revisión de código en busca de patrones inseguros y generación de informes de vulnerabilidades en entornos autorizados.
- Base para investigación en RL agéntico: al ser un checkpoint SFT con licencia MIT, sirve como punto de partida para experimentos de refuerzo sobre tareas de agente y código.

## Benchmarks y rendimiento

Resultados reportados en el informe técnico de MiMo-V2.6 para el checkpoint SFT, comparados con el modelo base Qwen3.5-9B:

| Dominio | Benchmark | Métrica | Qwen3.5-9B | MiMo-V2.6-Distill-Qwen-9B (SFT) |
|---|---|---|---|---|
| Código | SWE Verified | avg@3 | 60,0 | 61,1 |
| Código | SWE Pro | avg@3 | 32,0 | 44,6 |
| Código | MiMo Code (mini)† | avg@3 | 19,5 | 51,6 |
| Ciber | MiMo Cyber (mini)† | avg@3 | 5,7 | 31,3 |
| General | AutomationBench v1.0.6 | avg@1 | 5,0 | 30,3 |
| General | Terminal Bench 2.1 | avg@1 | 27,0 | 37,1 |
| General | Toolathlon-Verified | avg@1 | 25,9 | 35,2 |
| General | OfficeQA | avg@1 | 9,0 | 19,5 |
| General | JobBench | avg@1 | 2,6 | 18,3 |
| General | MiMo General (mini)† | avg@1 | 28,5 | 62,2 |
| Visual | MiMo Visual Coding (mini)† | avg@1 | 61,7 | 64,0 |

† Conjuntos de evaluación internos.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (9,4B parámetros), en FP16 se requieren aproximadamente 19 GB de pesos, en FP8 unos 9,5 GB y en cuantizaciones de 4 bits alrededor de 5-6 GB, sin contar caché KV ni overhead del runtime.
- GPU recomendadas: no especificadas por el autor. Para FP16 son necesarias GPUs con 24 GB o más (RTX 4090, L40S, A100 40 GB, H100). Para cuantizaciones de 8 bits o inferiores, GPUs consumer de 12-16 GB podrían ser suficientes, aunque no hay confirmación oficial.
- Despliegue: el autor documenta SGLang con soporte de Qwen3.5 y `--reasoning-parser mimo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Orientación | Disponibilidad |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B | 9,4B | No disponible | MIT | Agéntica (código, herramientas, ciber, visual) | Hugging Face |
| Qwen3.5-9B (base) | ~9B | No disponible | No disponible en la información | Generalista | Hugging Face |
| MiMo-V2.6-Pro-RL | No disponible | No disponible | No disponible | RL agéntico (modelo de referencia del informe) | Hugging Face |

La comparación con alternativas de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint SFT, no un modelo entrenado con RL: el autor lo presenta como base para investigación, por lo que su robustez en producción puede ser inferior a la de modelos con fases posteriores de alineamiento.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de error específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no hay garantía documentada de rendimiento fuera de los idiomas presentes en los datos de entrenamiento.
- Longitud de contexto no documentada, lo que dificulta planificar cargas con documentos largos o repositorios extensos.
- Aunque la licencia es MIT, la model card incluye una lista de restricciones de uso (fines ilícitos, militares, ciberactividades maliciosas, tratamiento de datos personales sin base legal, ejecución autónoma de acciones de alto riesgo sin supervisión). El propio aviso indica que no modifica la licencia, pero conviene evaluarlo con asesoría legal antes de usos sensibles.
- Requiere un build reciente de SGLang con soporte de Qwen3.5 y el parser `mimo`; otros runtimes no están documentados.
- No se han publicado datos de cuantización oficiales, por lo que el rendimiento tras cuantizar debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo de referencia del informe (MiMo-V2.6-Pro-RL): https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL
- Documentación de SGLang: https://docs.sglang.io/get_started/install.html
- Sitio de Xiaomi MiMo: https://mimo.xiaomi.com
- Contacto legal: mimo-legal@xiaomi.com
