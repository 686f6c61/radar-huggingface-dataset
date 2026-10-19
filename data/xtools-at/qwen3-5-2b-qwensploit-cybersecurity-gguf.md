# xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity-GGUF

## Resumen

Qwensploit 3.5 2B es un ajuste fino (fine-tune) orientado a ciberseguridad del modelo Qwen3.5-2B, publicado por el usuario xtools-at. El modelo parte de un merge previo del mismo autor (`Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`) y se entrena mediante LoRA supervisado sobre una mezcla de 7.000 ejemplos centrados en razonamiento de seguridad, red team, análisis de vulnerabilidades y código seguro. Su propósito declarado es asistir en investigación de seguridad, revisión de código, modelado de amenazas, ejercicios de pentesting autorizados y retos CTF.

La ficha que nos ocupa corresponde a la versión cuantizada en GGUF del modelo, con cuatro tamaños estáticos (Q2_K_L, Q4_K_M, Q6_K y Q8_0) que van de 1,1 GB a 2,0 GB. Con 1.881.825.088 parámetros totales (aproximadamente 1,88 B), es un modelo pequeño pensado para ejecutarse en hardware modesto, incluidas GPU de consumo, lo que lo hace interesante para laboratorios de seguridad con recursos limitados.

Resulta relevante ahora por dos motivos: por un lado, la escasez de modelos especializados en seguridad de tamaño reducido y con licencia Apache-2.0 declarada; por otro, el uso de datos de destilación sintética de modelos mayores (etiquetados como Claude Mythos y Qwen3.8-Max en los datasets). Ahora bien, no hay benchmarks independientes publicados, el modelo está etiquetado como "uncensored"/"heretic" (alineamiento eliminado) y la propia model card advierte de que la licencia upstream debe revisarse antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5; detalles de capas y atencion no disponibles en la informacion proporcionada |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens en entrenamiento; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q2_K_L (1,1 GB), Q4_K_M (1,3 GB), Q6_K (1,6 GB), Q8_0 (2,0 GB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 declarada, sujeta a revision de compatibilidad con licencias upstream |
| Formato de pesos | GGUF (version cuantizada); el modelo base se distribuye como safetensors |
| Etiqueta de pipeline | image-text-to-text (metadatos heredados; la model card solo describe texto) |
| Tamano del repositorio | 6,6 GB |
| Fecha de publicacion | 2026-10-19 |

## Arquitectura y entrenamiento

La informacion disponible identifica la familia base (Qwen3.5-2B) y el linaje de merges, pero no detalla la arquitectura interna: no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora tecnicas como decodificacion especulativa o atencion lineal. El pipeline declarado es `image-text-to-text`, si bien ni la model card ni las etiquetas describen capacidades de vision, por lo que lo mas prudente es tratar el modelo como texto puro hasta verificacion empirica.

El entrenamiento consistio en un ajuste supervisado con LoRA de una sola epoca sobre 7.000 ejemplos (350 de evaluacion), con contexto de 8.192 tokens y longitud maxima de entrada de 8.000. La mezcla combina cuatro datasets: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K - Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K - Clean (925, 13%). Parte de estos datos son destilaciones sinteticas de modelos mayores, lo que introduce potenciales errores heredados del modelo profesor.

| Parametro de entrenamiento | Valor |
|---|---|
| Metodo | SFT con LoRA |
| Epocas | 1 |
| Entradas de entrenamiento / evaluacion | 7.000 / 350 |
| Contexto | 8.192 |
| Learning rate | 2e-4 |
| Batch size | 4x8 |
| Rango LoRA (`r`) / alpha / dropout | 16 / 32 / 0,02 |
| Modulos objetivo LoRA | todos |
| Optimizador | AdamW 8-bit |
| Scheduler | lineal |
| Weight decay | 0,002 |
| GPU de entrenamiento | NVIDIA L4 24 GB |

## Capacidades

- Generacion de texto tecnico en ingles con enfasis en terminologia de seguridad.
- Razonamiento sobre vulnerabilidades: analisis de causas raiz, impacto y mitigaciones.
- Red team y knowledge ofensivo: tecnicas de explotacion documentadas, segun los datasets RedTeam-Premium y Ultimate-Offensive-Red-Team.
- Codigo: generacion y revision de codigo, con etiqueta `code` y datos de destilacion de programacion.
- Razonamiento multi-paso: la model card describe el merge base como combinacion de fine-tunes de razonamiento multi-step.
- Preguntas y respuestas tecnicas (question-answering) y asistencia en retos CTF.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: no disponibles en la informacion proporcionada.
- Vision: la etiqueta de pipeline indica image-text-to-text, pero no hay evidencia en la model card; tratar como no verificado.
- Multilingue: no; solo ingles declarado.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Revision de codigo seguro en CI/CD: el modelo puede analizar diffs y señalar patrones inseguros (inyeccion SQL, desbordamientos, gestion de secretos) en un paso previo al merge, aprovechando su soporte de codigo y su ventana de 8.192 tokens para revisar ficheros completos.
- Triaje de alertas y analisis de incidentes: con un contexto de 8k tokens cabe un extracto de logs junto con la alerta, de modo que el modelo proponga hipotesis de compromiso y siguientes pasos de investigacion.
- Modelado de amenazas sobre arquitecturas: a partir de una descripcion de sistema, generar listas de activos, superficies de ataque y contramedidas; su entrenamiento en CyberSec-Reasoning-Premium encaja con este tipo de razonamiento estructurado.
- Ejercicios de red team autorizados: generacion de hipotesis de ataque y tecnicas MITRE ATT&CK en laboratorios aislados, con un coste de computo muy bajo (1,3 GB en Q4_K_M) que permite desplegarlo en la propia maquina del analista.
- Formacion y CTF: asistente local para resolver retos de reversing, criptografia basica o forense, ejecutable en un portatil sin GPU dedicada mediante llama.cpp u Ollama.
- Enriquecimiento de documentacion de seguridad: redaccion de informes de hallazgos, fichas de vulnerabilidad y guias de hardening a partir de notas tecnicas crudas, en ingles.
- Preprocesado en pipelines de analisis: al ser un modelo de 1,88 B, puede usarse como clasificador o extractor barato (por ejemplo, etiquetar CVE, identificar producto y version en un texto) antes de llamar a un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de perdida durante el entrenamiento, que son un diagnostico del ajuste y no una medida de acierto en tareas de ciberseguridad. La propia card indica que se necesitan evaluaciones independientes.

| Metrica | Paso 66 | Paso 110 | Paso 154 | Paso 219 (final) |
|---|---:|---:|---:|---:|
| Perdida de entrenamiento | 0,983 | 0,782 | 0,744 | 0,710 |
| Perdida de evaluacion | 0,828 | 0,753 | 0,715 | 0,696 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano de cada fichero GGUF, mas overhead de contexto; cifras orientativas, no publicadas por el autor):
  - Q2_K_L (1,1 GB): aproximadamente 1,5-2 GB de VRAM.
  - Q4_K_M (1,3 GB): aproximadamente 2-3 GB de VRAM.
  - Q6_K (1,6 GB): aproximadamente 2,5-3,5 GB de VRAM.
  - Q8_0 (2,0 GB): aproximadamente 3-4 GB de VRAM.
  - Pesos en precision completa (safetensors, aproximadamente 3,8 GB en FP16): a partir de 5 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM sirve para Q4_K_M; RTX 3060, RTX 4060, RTX 4090, L4, A10 o A100 lo ejecutan sin problema. El entrenamiento se realizo en una NVIDIA L4 de 24 GB, lo que da margen de sobra para inferencia.
- Cabe en GPU de consumo: si, incluso en tarjetas de gama baja y en iGPU con memoria unificada; la variante Q2_K_L esta pensada para entornos muy restringidos.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF con un Modelfile), LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el repositorio esta etiquetado como `endpoints_compatible`). vLLM y TGI no estan documentados para este artefacto y su soporte de GGUF es limitado o nulo.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ningun tamano de cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Datos publicos |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity-GGUF (este) | 1,88 B | 8.192 (entrenamiento) | Apache-2.0 con revision upstream | GGUF | Solo perdidas de entrenamiento |
| xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity | 1,88 B | no disponible | Apache-2.0 con revision upstream | safetensors | Misma informacion |
| xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-2B (familia base) | aproximadamente 2 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros fine-tunes de ciberseguridad comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinacion: la model card advierte de explicaciones inexactas, codigo inseguro y recomendaciones de seguridad desactualizadas. Cualquier comando o parche generado debe revisarse antes de ejecutarlo.
- Datos sinteticos: parte del entrenamiento proviene de destilaciones de modelos mayores (etiquetados como Claude Mythos y Qwen3.8-Max), que pueden arrastrar errores del profesor.
- Sin validacion independiente: el rendimiento en tareas reales de seguridad no esta establecido; las unicas metricas son perdidas de entrenamiento (0,710 / 0,696).
- Alineamiento eliminado: las etiquetas `uncensored` y `heretic` indican que se ha reducido deliberadamente el rechazo de contenido. Esto incrementa el riesgo de generar material ofensivo o dangero y exige controles de uso.
- Uso ofensivo: las capacidades de red team solo deben emplearse en sistemas con autorizacion explicita; la licencia no exime de responsabilidad legal.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta verificado y previsiblemente sera inferior.
- Ventana de contexto: 8.192 tokens en entrenamiento, insuficiente para volcados de logs extensos o revisiones de repositorios completos sin trocear.
- Capacidad del modelo: con 1,88 B de parametros, es esperable un rendimiento inferior a modelos de 7 B o mas en razonamiento complejo; no hay datos que lo confirmen.
- Licencia: aunque se declara Apache-2.0, el autor indica explicitamente que deben revisarse las licencias upstream, en particular las del dataset de destilacion de Qwen, que documenta restricciones heredadas que pueden afectar a la redistribucion y al uso comercial.
- Metadatos inconsistentes: la etiqueta de pipeline `image-text-to-text` no se corresponde con ninguna capacidad descrita, lo que puede confundir a herramientas automaticas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity-GGUF
- Modelo base (fine-tune en safetensors): https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Modelo base del linaje: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Merge de referencia: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Familia original: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K - Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K - Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los unicos enlaces encontrados correspondian a la marca de maquinas de grabado y corte laser xTool, sin relacion con el autor ni con el modelo. No se han localizado papers, blogs ni demos adicionales.
