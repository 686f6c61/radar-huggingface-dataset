# tinyopsec/XT-Luna-1B-GGUF

## Resumen

XT-Luna-1B es una cuantización en formato GGUF del modelo XtrCom/XT-Luna-1B, un fine-tuning de openbmb/MiniCPM5-1B desarrollado y publicado por el usuario tinyopsec en HuggingFace. Se trata de un modelo de lenguaje compacto, de aproximadamente 1.080 millones de parámetros, ajustado específicamente para comportamientos de asistente con uso de herramientas (tool calling), con énfasis en la contención y la honestidad del modelo (restraint/honesty), es decir, en que sepa cuándo no debe llamar a una herramienta y cuándo debe admitir que no sabe algo.

Su relevancia radica en la creciente demanda de modelos pequeños capaces de ejecutar flujos agénticos en hardware de consumo: al estar cuantizado en GGUF con trece niveles de cuantización distintos (desde F16 hasta Q2_K), puede ejecutarse localmente con llama.cpp, Ollama, LM Studio o koboldcpp sin necesidad de GPU dedicada. La licencia AGPL-3.0, heredada del modelo base, lo posiciona en el espacio del software libre con copyleft, lo que es relevante para evaluar su idoneidad en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPM5 (transformer), no disponible detalle completo |
| Parametros totales | 1.080.632.832 (~1,08 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponibles |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (modelo base original en safetensors) |

## Arquitectura y entrenamiento

XT-Luna-1B parte de openbmb/MiniCPM5-1B, un modelo transformer de la familia MiniCPM desarrollada por OpenBMB, con aproximadamente 1.080 millones de parámetros. Sobre esa base, XtrCom realizó un fine-tuning orientado a comportamiento de asistente con uso de herramientas: el objetivo declarado del ajuste es dotar al modelo de capacidades de tool calling y de un comportamiento honesto y contenido, de modo que evite invocar herramientas de forma innecesaria o inventar resultados.

Sobre ese fine-tuning, tinyopsec ha publicado las cuantizaciones GGUF generadas con llama.cpp, cubriendo un rango muy amplio de niveles de precisión: desde F16 (2,0 GB) hasta Q2_K. No se han publicado detalles sobre el dataset de entrenamiento del fine-tuning, el número de tokens, el método de alineación empleado (SFT, DPO, RLHF) ni las innovaciones técnicas específicas de la familia MiniCPM5 en la información disponible.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, uso conversacional).
- Tool calling / function calling: el modelo está fine-tuned específicamente para decidir cuándo invocar herramientas.
- Comportamiento agéntico: etiquetado como agentic, orientado a flujos de varios pasos con herramientas.
- Restraint y honesty: entrenado para abstenerse de llamadas a herramientas innecesarias y para ser honesto sobre sus límites.
- Ejecución local eficiente gracias al formato GGUF y a su tamaño reducido (~1 B de parámetros).
- Compatibilidad con cualquier runtime que soporte GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- No se dispone de información sobre capacidades de visión, audio, razonamiento extendido (thinking mode) ni soporte multilingüe específico.

## Casos de uso

- Agentes locales con herramientas: integración en pipelines agénticos que se ejecutan en local (por ejemplo, con llama.cpp o frameworks como LangChain mediante bindings de GGUF), aprovechando el fine-tuning en tool calling para decidir cuándo llamar a funciones externas.
- Asistentes conversacionales en dispositivos con recursos limitados: con la cuantización Q4_K_M (~0,7 GB aproximados) puede ejecutarse en portátiles sin GPU dedicada, sirviendo como asistente offline.
- Prototipado rápido de flujos function calling: al ser un modelo pequeño, permite iterar rápidamente en el diseño de esquemas de herramientas y prompts de sistema antes de escalar a modelos mayores.
- Automatización de tareas repetitivas en local: extracción de datos estructurados, rellenado de formularios o clasificación de texto con llamadas a funciones definidas por el desarrollador.
- Integración en aplicaciones de escritorio: distribución mediante LM Studio u Ollama como backend de chat con herramientas para software que necesita privacidad total (sin envío de datos a la nube).
- Educación y experimentación: por su tamaño y licencia libre (AGPL-3.0), resulta útil para estudiar cómo se ajustan modelos pequeños para comportamiento honesto y contención en el uso de herramientas.
- Fallback económico en sistemas multi-modelo: puede actuar como modelo ligero de primera línea que decide si una consulta requiere escalar a un modelo más grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos, y el autor recomienda expresamente evaluar el modelo antes de su uso ("Evaluate before use").

## Requisitos de hardware

- VRAM / memoria estimada para inferencia (aproximada según cuantización):
  - F16: ~2,0 GB (tamaño declarado del archivo)
  - Q8_0: ~1,1–1,2 GB
  - Q6_K: ~0,9 GB
  - Q5_K_M / Q5_0: ~0,8 GB
  - Q4_K_M / Q4_0: ~0,7 GB
  - Q3_K: ~0,5–0,6 GB
  - Q2_K: ~0,5 GB
- GPU recomendadas: no requiere GPU; cualquier GPU moderna (incluso una GTX 1650 o una RTX 3060) ejecuta el modelo íntegramente en VRAM a partir de Q8_0 hacia abajo. En CPU, funciona en equipos con 8 GB de RAM.
- Cabe con holgura en GPUs de consumo: cualquier GPU con 4 GB de VRAM o más ejecuta todas las cuantizaciones; incluso la versión F16 cabe en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; por su tamaño (~1 B de parámetros), se espera inferencia rápida en CPU moderna (varias decenas de tokens por segundo), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XT-Luna-1B (este modelo) | ~1,08 B | GGUF (13 cuantizaciones) | Sí (fine-tuned) | AGPL-3.0 | HuggingFace, GGUF |
| openbmb/MiniCPM5-1B (base) | ~1,08 B | safetensors | Según versión base | no disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct | ~1,5 B | safetensors / GGUF | Sí | Apache 2.0 / Qwen | HuggingFace |
| Llama-3.2-1B-Instruct | ~1,24 B | safetensors / GGUF | Limitado | Llama 3.2 Community | HuggingFace |

Nota: la comparativa se ofrece a título orientativo; no se han publicado benchmarks que permitan comparar rendimiento real de XT-Luna-1B frente a estas alternativas. Su diferenciador declarado es el fine-tuning específico en tool calling con restraint/honesty.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft fuerte. Si se integra el modelo (o un servicio que lo use) en un producto, pueden aplicarse obligaciones de liberar el código fuente de la aplicación o servicio derivado. Esto puede ser un impedimento serio para uso comercial cerrado; conviene asesoría legal antes de desplegarlo en producción.
- Ausencia de benchmarks publicados: el propio autor advierte "Evaluate before use". No hay evidencia cuantitativa de su calidad en tareas estándar.
- Riesgo de alucinación: como todo modelo de ~1 B de parámetros, la capacidad de razonamiento y factualidad es limitada; en flujos agénticos es recomendable validar las llamadas a herramientas y sus argumentos antes de ejecutarlas.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que dificulta planificar tareas con documentos largos.
- Idiomas soportados no documentados: no consta qué idiomas maneja bien; el castellano podría tener rendimiento inferior al inglés.
- Cuantizaciones agresivas (Q3, Q2_K): degradan notablemente la calidad, especialmente en un modelo ya pequeño; se recomienda Q4_K_M como mínimo razonable (el propio autor la marca como recomendada).
- Modelo de terceros sin respaldo institucional documentado: descargas bajas (376) y sin likes, sin documentación de entrenamiento ni evaluación comunitaria establecida.

## Enlaces

- Modelo cuantizado (GGUF): https://huggingface.co/tinyopsec/XT-Luna-1B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo fine-tuned original (referenciado en la model card): https://huggingface.co/XtrCom/XT-Luna-1B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible.
