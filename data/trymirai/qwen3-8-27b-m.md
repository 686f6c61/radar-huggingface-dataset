# trymirai/Qwen3.8-27B-M

## Resumen

El modelo `trymirai/Qwen3.8-27B-M` es una cuantización de 4 bits del modelo Qwen3.8-27B de Alibaba, preparada por Mirai Labs para ejecución local eficiente en hardware Apple silicon. Utiliza cuantización asimétrica de enteros de 4 bits con puntos cero, escalas en bfloat16 y tamaño de grupo 64, junto con transformadas de Hadamard aleatorias por bloques para reducir los valores atípicos de activaciones y pesos. El checkpoint resultante ocupa aproximadamente 14,6 GB y está diseñado para ofrecer un equilibrio entre velocidad y calidad comparable al formato Q4_K_M de GGUF.

El modelo base Qwen3.8-27B es un modelo de lenguaje causal denso de 27 mil millones de parámetros con arquitectura híbrida que combina atención lineal (Gated DeltaNet) y atención completa (Gated Attention), además de un codificador de visión integrado. Soporta una ventana de contexto nativa de 262 144 tokens, modo de pensamiento configurable, y capacidades multimodales de imagen y vídeo. Esta cuantización mantiene las mismas capacidades funcionales, aunque con una ligera degradación de precisión inherente a la reducción de bits.

La relevancia de este modelo radica en que permite ejecutar un LLM de 27B con capacidades multimodales y agénticas en equipos de consumo con memoria unificada, como los Mac con chip M1 o superior, sin necesidad de GPUs dedicadas. El formato de pesos es safetensors, pero la inferencia se realiza mediante la librería `uzu` de Mirai, que actualmente solo soporta Apple silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Gated DeltaNet + Gated Attention) con vision encoder |
| Parametros totales | 27B (modelo base); checkpoint cuantizado ~14,6 GB |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens nativos, extensible |
| Tipos de cuantizacion | 4-bit asimetrico con zero points, escalas bfloat16, grupo 64 |
| Idiomas soportados | No disponible (el modelo base soporta multilingue, incluidos chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferencia mediante libreria uzu) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B presenta una arquitectura híbrida que alterna bloques de atención lineal (Gated DeltaNet) con bloques de atención completa (Gated Attention). Concretamente, la configuración es de 64 capas organizadas como 16 grupos de 3 sub-bloques de Gated DeltaNet seguidos de 1 sub-bloque de Gated Attention, cada uno con su propia red feed-forward. Esta combinación permite un procesamiento eficiente de secuencias largas al reducir el coste cuadrático de la atención completa, manteniendo la capacidad de modelar dependencias de largo alcance. El modelo incluye además un codificador de visión que procesa imágenes y vídeos, y un módulo de predicción multi-token (MTP) entrenado con varios pasos.

El entrenamiento del modelo base incluyó fases de pre-entrenamiento y post-entrenamiento, con técnicas de ajuste por refuerzo y destilación para mejorar el razonamiento y las capacidades agénticas. La cuantización de Mirai se realizó mediante cuantización post-entrenamiento seguida de destilación consciente de la cuantización, aplicando transformadas de Hadamard aleatorias por bloques para mitigar el impacto de los valores atípicos en las activaciones y pesos. El resultado es una representación de 4 bits con precisión mejorada respecto a cuantizaciones convencionales.

## Capacidades

- Generacion de texto y razonamiento complejo, incluyendo tareas de codigo, matematicas y analisis profesional.
- Comprension multimodal nativa de imagenes y videos, desde diagramas cientificos hasta videos de larga duracion.
- Modo de pensamiento configurable: activado por defecto, se puede desactivar por peticion, y permite ajustar la profundidad del razonamiento mediante el parametro `reasoning_effort`.
- Soporte de tool calling y function calling para integracion con APIs y servicios externos.
- Capacidades agénticas: planificacion autonoma y manejo de retroalimentacion del entorno para completar tareas multi-paso de forma fiable.
- Razonamiento multi-step con retencion del contexto de razonamiento historico mediante `preserve_thinking`.
- Multilingue, aunque los idiomas exactos no se especifican en la documentacion de la cuantizacion.

## Casos de uso

- Asistente de codigo en entornos locales: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, aprovechando su ventana de contexto de 262K tokens para mantener proyectos completos en memoria. Su modo de razonamiento permite explicar decisiones de diseño y sugerir refactorizaciones.
- Analisis de documentos extensos: con la ventana de contexto amplia, puede resumir informes, extraer informacion de contratos o articulos cientificos, y responder preguntas sobre documentos de cientos de paginas sin necesidad de dividirlos.
- Agente autonomo para automatizacion de tareas: gracias a su soporte de tool calling y planificacion multi-paso, puede ejecutar flujos de trabajo como gestion de correos, actualizacion de bases de conocimiento o coordinacion de APIs, con capacidad de adaptarse a errores del entorno.
- Comprension de contenido audiovisual: su vision encoder permite analizar capturas de pantalla, diagramas de arquitectura, graficos de datos o clips de video para generar descripciones, detectar anomalias o extraer informacion estructurada.
- Educacion y tutoria interactiva: puede actuar como tutor personalizado explicando conceptos paso a paso, generando ejercicios y evaluando respuestas, con razonamiento ajustable segun la dificultad.
- Prototipado rapido de aplicaciones LLM en macOS: al ser una cuantizacion ligera, permite a desarrolladores ejecutar el modelo localmente en un MacBook para probar prompts, evaluar respuestas y validar integraciones antes de desplegar en produccion con modelos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B tiene resultados publicados por Alibaba, pero no se dispone de ellos en los datos proporcionados. La cuantizacion de Mirai afirma ser comparable en calidad a la cuantizacion Q4_K_M de Unsloth, pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15-16 GB para el checkpoint de 14,6 GB, considerando overhead de inferencia. En Apple silicon, esto equivale a 16 GB de memoria unificada como minimo recomendado.
- GPU recomendadas: Apple silicon (M1, M2, M3 o M4) con al menos 16 GB de RAM unificada. No se soportan GPUs NVIDIA o AMD con el formato nativo `uzu`, aunque el modelo base puede ejecutarse en esas plataformas mediante frameworks como vLLM o Transformers.
- No cabe en GPUs de consumo de 8 GB; se necesita al menos 16 GB de VRAM o memoria unificada.
- Opciones de despliegue: exclusivamente mediante la libreria `uzu` de Mirai (CLI `mirai` instalable via Homebrew). No es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual.
- Latencia y throughput: no disponibles. Se espera que la cuantizacion 4-bit ofrezca velocidades de generacion superiores a las del modelo completo, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | FP16/BF16 | Apache 2.0 | HuggingFace, vLLM, SGLang |
| trymirai/Qwen3.8-27B-M | 27B | 262K | 4-bit (uzu) | Apache 2.0 | Solo Apple silicon |
| Unsloth Qwen3.8-27B-GGUF Q4_K_M | 27B | 262K | 4-bit GGUF | Apache 2.0 | Multiplataforma (llama.cpp, Ollama) |

La cuantizacion de Mirai es comparable en tamano y calidad al GGUF Q4_K_M de Unsloth, pero su principal diferencia es la restriccion de hardware: mientras que el GGUF se puede ejecutar en cualquier plataforma con llama.cpp, el formato `uzu` esta limitado a Apple silicon. Para usuarios con GPUs NVIDIA o AMD, la opcion GGUF es mas versatil.

## Limitaciones y advertencias

- La cuantizacion a 4 bits puede degradar ligeramente la precision en tareas de razonamiento complejo, matematicas avanzadas o generacion de codigo muy especifico, en comparacion con el modelo en precision completa.
- El formato `uzu` solo es compatible con Apple silicon; no se puede ejecutar en GPUs NVIDIA, AMD o Intel. Para otras plataformas, es necesario convertir los pesos a otro formato (por ejemplo, GGUF) o usar el modelo base sin cuantizar.
- No se han publicado evaluaciones exhaustivas de esta cuantizacion en tareas estandar; los resultados pueden variar respecto al modelo base.
- El modelo base puede alucinar o generar informacion incorrecta, especialmente en dominios especializados. Se recomienda validacion humana en aplicaciones criticas.
- La ventana de contexto de 262K tokens puede requerir memoria adicional considerable; en Apple silicon con 16 GB, puede ser necesario reducir el contexto para evitar desbordamientos.
- Aunque la licencia Apache 2.0 permite uso comercial, el ecosistema `uzu` es propietario y su mantenimiento depende de Mirai Labs; no hay garantia de soporte a largo plazo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trymirai/Qwen3.8-27B-M
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de Mirai sobre cuantizacion: https://trymirai.com/blog/quantization
- Documentacion de la libreria uzu: https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
- API Docs de Mirai: https://docs.trymirai.com/
- Articulo de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Modelo en Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Modelo en LM Studio: https://lmstudio.ai/models/qwen3.8
