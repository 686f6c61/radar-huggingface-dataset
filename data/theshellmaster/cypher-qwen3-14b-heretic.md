# TheShellMaster/cypher-Qwen3-14B-heretic

## Resumen

cypher-Qwen3-14B-heretic es una republicación en formato GGUF del modelo RootMonsteR/Qwen3-14B-Abliterated, que a su vez deriva del Qwen/Qwen3-14B de Alibaba. El autor, TheShellMaster, lo publica como artefacto de despliegue para Cypher, su agente basado en OpenCode, y lo valida en una única GPU T4 de 15 GB mediante `llama-server`. No introduce modificaciones sobre los pesos de origen: se trata de una copia del fichero `qwen3-14b-abliterated-Q5_K_M.gguf` con una model card propia orientada a su uso como backend de agente.

El interés técnico reside en dos factores. Por un lado, hereda la arquitectura y el entrenamiento de Qwen3-14B, un transformer denso de 14.768.307.200 parámetros con modo de razonamiento explícito y soporte multilingüe amplio. Por otro, incorpora la modificación "abliterated", que elimina total o parcialmente las direcciones de rechazo aprendidas durante el alineamiento, de modo que el modelo responde a peticiones que el Qwen3 original declinaría. Esa característica lo hace atractivo para investigación sobre alineamiento, red teaming y evaluación de salvaguardas, y arriesgado para despliegues de cara al público.

La relevancia actual es doble: demuestra que un modelo de 14B cuantizado a Q5_K_M cabe con holgura en GPUs de gama media-alta y en GPUs de datacenter antiguas como la T4, y ofrece un punto de partida reproducible para quien necesite un modelo conversacional sin filtros ejecutado con llama.cpp. La licencia declarada es Apache 2.0, aunque conviene verificar la cadena de licencias de los artefactos intermedios antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), decoder-only, con modo de razonamiento |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-14B; consultar la model card del modelo base) |
| Tipos de cuantizacion | Q5_K_M (unico fichero publicado) |
| Idiomas soportados | no disponibles en la informacion proporcionada (heredados de Qwen3-14B) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `qwen3-14b-abliterated-Q5_K_M.gguf`); el repositorio ocupa 10,5 GB |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-14B, un transformer decoder-only denso con 14.768.307.200 parámetros. Qwen3 incorpora un modo de razonamiento que genera una cadena de pensamiento antes de la respuesta final, activable o desactivable según la petición, y un entrenamiento en dos fases (preentrenamiento con un corpus multilingüe amplio seguido de ajuste supervisado y optimización por preferencias). Los detalles concretos de número de tokens, composición del dataset y algoritmo de preferencias no se recogen en la información proporcionada; deben consultarse en la documentación oficial de Qwen3-14B.

Sobre esa base, RootMonsteR aplica una técnica de "abliteration": se identifican las direcciones en el espacio de activaciones asociadas al comportamiento de rechazo y se proyectan fuera de los pesos, de forma que el modelo pierde la tendencia a declinar peticiones sin necesidad de reentrenar. Es una intervención quirúrgica sobre los pesos que puede degradar ligeramente la coherencia en tareas benignas y que, por su naturaleza, no está acompañada de una evaluación de seguridad publicada. TheShellMaster no modifica el resultado: solo lo republica en GGUF y documenta la invocación con `llama-server -m <fichero>.gguf --jinja -ngl 99 -fa on`, es decir, plantilla Jinja activada, todas las capas en GPU y Flash Attention habilitada.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `--jinja`.
- Razonamiento explícito en modo thinking, heredado de Qwen3, activable mediante la plantilla de chat.
- Generación de código y tareas de ingeniería de software, orientación principal del agente Cypher.
- Soporte de tool calling y function calling a través de la plantilla Jinja de Qwen3.
- Capacidad para flujos de agente multi-paso (lectura de ficheros, ejecución de comandos, iteración sobre errores).
- Multilingüismo heredado de Qwen3-14B; el conjunto exacto de idiomas no está documentado en esta ficha.
- Respuestas sin rechazo ante peticiones que el modelo alineado declinaría, por efecto de la abliteración.
- Sin capacidades de visión ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Agente de codificación local: el modelo se ejecuta con `llama-server` en una T4 de 15 GB y actúa como backend de un agente tipo OpenCode que lee el repositorio, propone parches y ejecuta comandos, aprovechando el tool calling de la plantilla Jinja.
- Red teaming y evaluación de salvaguardas: al carecer de las direcciones de rechazo, sirve para medir la robustez de clasificadores de contenido y de políticas de moderación frente a un modelo sin alinear, comparando sus respuestas con las de Qwen3-14B estándar.
- Investigación sobre alineamiento: permite estudiar qué comportamientos se pierden y cuáles se conservan tras la abliteración, con un coste de inferencia bajo y un único fichero GGUF reproducible.
- Generación de código en pipelines internos: integrado en un servidor compatible con la API de OpenAI (`endpoints_compatible`), puede alimentar tareas de refactorización, generación de tests o revisión de diffs en entornos controlados donde no haya exposición a usuarios finales.
- Asistente personal sin filtros para documentación técnica: útil para redactar guías sobre temas sensibles (seguridad ofensiva, explotación de vulnerabilidades en laboratorio) donde un modelo alineado añadiría rechazos y rodeos innecesarios.
- Despliegue en hardware modesto: con Q5_K_M y 10,5 GB de pesos, cabe en una T4, una RTX 4090 o una RTX 3090, lo que permite montar un asistente conversacional privado sin depender de APIs externas.
- Prototipado de agentes multi-paso: su contexto heredado de Qwen3 y su capacidad de razonamiento permiten encadenar decenas de pasos de herramienta en tareas de automatización de escritorio o administración de sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y tampoco se aportan mediciones de latencia o throughput más allá de la mención a una prueba funcional en una T4 de 15 GB con `llama-server`.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 11-12 GB con Q5_K_M (10,5 GB de pesos más overhead de contexto y caché KV); con contexto largo, la caché KV puede añadir varios GB adicionales.
- GPU validadas por el autor: una única NVIDIA T4 de 15 GB, con `-ngl 99` y Flash Attention activada.
- GPU recomendadas: T4, L4, RTX 3090, RTX 4090, A10, A100 y H100; cualquier GPU con 16 GB o más de VRAM puede ejecutar el modelo con holgura.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090, RTX 4080 Super y, con contexto reducido, en RTX 4070 Ti Super de 16 GB.
- Opciones de despliegue: `llama.cpp` / `llama-server` (método documentado por el autor), Ollama y cualquier runtime compatible con GGUF; también es posible servirlo con motores que acepten GGUF, aunque vLLM y TGI no son la vía natural para este fichero.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| cypher-Qwen3-14B-heretic | 14,77B | no disponible | GGUF Q5_K_M | Apache 2.0 | Abliterado, sin benchmarks publicados |
| Qwen/Qwen3-14B | 14,77B | no disponible en esta ficha | safetensors, GGUF oficial | Apache 2.0 | Modelo base alineado, con modo thinking y benchmarks publicados por Alibaba |
| RootMonsteR/Qwen3-14B-Abliterated | 14,77B | no disponible | safetensors y GGUF | Apache 2.0 | Origen directo de esta republicación; misma modificación de abliteración |
| Llama 3.1 8B Instruct | 8,03B | 128K | safetensors, GGUF | Llama 3.1 Community License | Alternativa de menor tamaño con licencia restrictiva para grandes despliegues |

## Limitaciones y advertencias

- La abliteración elimina las direcciones de rechazo, pero no garantiza la ausencia de contenido dañino; el modelo puede producir respuestas inseguras, ilegales o inexactas sin aviso.
- No se ha publicado ninguna evaluación de seguridad ni de sesgos sobre esta variante; se desconoce el impacto de la intervención en la calidad general.
- Riesgo elevado de alucinación en tareas factuales, como en cualquier modelo de 14B sin verificación externa.
- La información sobre longitud de contexto e idiomas soportados no está documentada en esta ficha; debe consultarse la model card de Qwen3-14B.
- Licencia Apache 2.0 declarada, pero la cadena de artefactos intermedios (RootMonsteR/Qwen3-14B-Abliterated) conviene verificarla antes de un uso comercial.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.
- El autor advierte que es una republicación sin modificación y que todo el mérito corresponde a los autores originales; no hay garantía de mantenimiento ni de soporte.
- No debe desplegarse de cara al público sin una capa de moderación externa y sin revisión legal del uso previsto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheShellMaster/cypher-Qwen3-14B-heretic
- Modelo de origen (GGUF): https://huggingface.co/RootMonsteR/Qwen3-14B-Abliterated-GGUF
- Modelo abliterado en safetensors: https://huggingface.co/RootMonsteR/Qwen3-14B-Abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
