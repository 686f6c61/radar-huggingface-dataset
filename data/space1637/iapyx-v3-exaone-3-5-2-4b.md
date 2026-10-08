# space1637/iapyx-v3-exaone-3.5-2.4b

## Resumen

iapyx-v3-exaone-3.5-2.4b es un ajuste fino completo (full fine-tuning) del modelo LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct, publicado por el usuario space1637 bajo el marco del concurso 2026 AI Rookie (equipo Iapyx, track de IA domestica en Corea del Sur). El modelo resultante conserva la arquitectura decoder-only del modelo base EXAONE 3.5 de 2.4B parametros (2.405.327.360 parametros reales segun los pesos safetensors) y esta especializado en tareas acotadas de un producto de asistencia: clasificacion de riesgo, seleccion de herramientas, extraccion de campos de documentos, verificacion aritmetica y pulido de expresiones en coreano.

El interes tecnico del modelo no esta en su tamano (2.4B, disenado por LG AI Research para despliegue en dispositivos con recursos limitados) ni en una arquitectura novedosa, sino en su metodologia de entrenamiento: se entrenaron 24 epocas mediante FSDP sobre dos A100 80GB, con datos SFT enteramente sinteticos generados por el generador de reglas del propio producto, respuestas de la tarea de expresion obtenidas de la API K-EXAONE (con el razonamiento desactivado) y terminologia legal del dataset JusWis/korean-legal-terminology (CC BY 4.0). Segun la model card, no se emplearon modelos extranjeros en datos, entrenamiento ni evaluacion.

Es relevante como caso de estudio de ajuste fino integral (no LoRA/QLoRA) sobre un modelo pequeno para tareas verticales, con una mejora medida en seis tareas held-out (media de 5 tareas que pasa de 0.1965 a 0.9514). Ademas, sobreescribe de forma deliberada el comportamiento generalista del modelo base: las tareas originales de chat, razonamiento abierto o conocimiento general quedan fuera del alcance declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de EXAONE 3.5 2.4B) |
| Parametros totales | 2.405.327.360 (2.4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.000 tokens en el modelo base; entrenamiento a 2.048 tokens |
| Tipos de cuantizacion | No disponible (repositorio solo con pesos safetensors en precision completa) |
| Idiomas soportados | Coreano (ko) |
| Licencia | other (EXAONE AI Model License, uso de investigacion) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 4,8 GB |
| Modelo base | LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct |
| Requiere codigo remoto | Si (tag `custom_code`) |
| Descargas / likes en HuggingFace | 0 / 0 (a fecha de actualizacion 2026-10-08) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2.4B parametros, sin cambios arquitectonicos respecto a su base EXAONE 3.5 2.4B-Instruct (la familia EXAONE 3.5, publicada por LG AI Research, incluye variantes de 2.4B, 7.8B y 32B con soporte de contexto de hasta 32K tokens). El ajuste fue un fine-tuning de pesos completos con FSDP (Fully Sharded Data Parallel) ejecutado sobre 2 × A100 80GB durante 10.698,7 segundos. Hiperparametros: learning rate 1e-05, batch de 8 con acumulacion 2 en una GPU, longitud maxima de 2.048 tokens, 24 epocas con mejor epoca en la 2 (perdida de evaluacion 0.34194326400756836). El conjunto de datos consta de 11.018 ejemplos de entrenamiento y 1.130 de evaluacion, y la perdida se calculo unicamente sobre los tokens del asistente.

Los datos de SFT para las tareas de riesgo, seleccion de herramienta, extraccion de documentos y verificacion se generaron con un generador de reglas ligado al producto; las respuestas objetivo de la tarea de expresion se obtuvieron de la API K-EXAONE con el razonamiento desactivado y solo se conservaron aquellas que superaron comprobaciones automaticas de numeros y longitud; los terminos legales provienen del dataset JusWis/korean-legal-terminology (CC BY 4.0). La curva de perdida de evaluacion por epoca (recogida en W&B bajo el proyecto `iapyx-finetune`) muestra un minimo claro en la epoca 2 (0.3419) y un crecimiento monotono posterior (epoca 3: 0.3538; epoca 10: 0.5744; epoca 24: 0.7261), lo que indica sobreajuste temprano y justifica la seleccion del checkpoint de la epoca 2.

## Capacidades

- Generacion de texto en coreano con estilo controlado para respuestas orientadas a producto.
- Clasificacion de nivel de riesgo segun las reglas del producto (macro-F1 de 1.000 en held-out).
- Seleccion de herramienta (tool selection) dentro de un conjunto predefinido (exactitud de 1.000 en held-out).
- Extraccion estructurada de campos de documentos con salida en JSON (F1 de 1.000 en held-out).
- Verificacion aritmetica (comprobacion de resultados, coincidencia exacta de 0.782 en held-out).
- Pulido y control de seguridad de la expresion (tasa de seguridad de 0.975 en held-out).
- Manejo de terminologia legal en coreano (chrF de 0.110 en held-out).
- El autor indica que la decision final del producto la toma una regla determinista, no el modelo; el modelo se limita a rellenar casillas JSON, elegir herramientas, leer campos, verificar y refinar expresiones.

## Casos de uso

- Clasificacion de riesgo en flujos de atencion de un producto: el modelo asigna un nivel de riesgo segun la politica del producto (macro-F1 de 1.000 en el held-out del autor), adecuado para triaje automatizado antes de una revision humana.
- Enrutado de herramientas en asistentes con acciones predefinidas: dada una consulta, selecciona la herramienta correcta del catalogo (exactitud de 1.000 en held-out), lo que permite construir agentes con un conjunto cerrado de acciones en coreano.
- Extraccion de campos de documentos a JSON: rellena estructuras de campos segun el esquema del producto (F1 de 1.000 en held-out), util para digitalizacion de formularios en coreano.
- Verificacion de calculos en tramites: comprueba resultados numericos con coincidencia exacta de 0.782 en held-out, como capa de validacion previa a una regla determinista de aprobacion.
- Reescritura y filtrado de expresiones: normaliza el tono y evita formulaciones inadecuadas (tasa de seguridad de 0.975), aplicable a moderacion o pre-publicacion de respuestas al cliente.
- Normalizacion de terminologia legal: unifica terminos juridicos en coreano (chrF de 0.110), util en plantillas contractuales o avisos legales donde se requiere consistencia terminologica.
- Prototipado en entornos con recursos limitados: al ser 2.4B y caber en GPU de consumo, sirve como modelo de referencia para experimentos de ajuste fino verticalizados antes de escalar a variantes mayores de la familia EXAONE.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el mismo conjunto held-out y el mismo codigo de evaluacion, antes y despues del ajuste:

| Tarea (held-out) | Antes del ajuste | Despues del ajuste |
|---|---|---|
| Clasificacion de riesgo (macro-F1) | 0.000 | 1.000 |
| Seleccion de herramienta (exactitud) | 0.270 | 1.000 |
| Extraccion de campos de documento (F1) | 0.003 | 1.000 |
| Verificacion (coincidencia exacta) | 0.000 | 0.782 |
| Seguridad de expresion | 0.710 | 0.975 |
| Terminologia legal (chrF) | 0.098 | 0.110 |
| Media de 5 tareas (sin dominio) | 0.1965 | 0.9514 |

Latencia declarada de generacion: 0,1733 s por peticion en modo batch sobre A100. No se han publicado resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Pesos en precision completa (safetensors, ~4,8 GB en disco): la inferencia en FP16/BF16 requiere aproximadamente 6-8 GB de VRAM contando activaciones y cache KV a 2K de contexto.
- Entrenamiento reportado por el autor: 2 × A100 80GB con FSDP para un ajuste fino completo de 24 epocas.
- GPU recomendadas para inferencia en FP16/BF16: A100, H100, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB), todas con holgura.
- En GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB), y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) si se aplica cuantizacion INT8 o INT4.
- Opciones de despliegue: transformers (requiere `trust_remote_code` por el tag `custom_code`), vLLM y TGI para servicio con batching; en llama.cpp/Ollama seria necesario convertir a GGUF, que no esta publicado en el repositorio.
- Latencia y throughput: 0,1733 s por generacion en modo batch sobre A100, segun el autor. No se proporcionan medidas para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| iapyx-v3-exaone-3.5-2.4b | 2.4B | 32K (base) / entrenamiento a 2K | ko | EXAONE AI Model License (investigacion) | HuggingFace, safetensors |
| LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct | 2.4B | 32K | en, ko | EXAONE AI Model License (investigacion) | HuggingFace |
| EXAONE-3.5-7.8B-Instruct | 7.8B | 32K | en, ko | EXAONE AI Model License (investigacion) | HuggingFace |
| EXAONE-3.5-32B-Instruct | 32B | 32K | en, ko | EXAONE AI Model License (investigacion) | HuggingFace |

No se dispone en la informacion proporcionada de comparativas con modelos de otros fabricantes del mismo rango (por ejemplo, variantes de 2-3B de otras familias), ni de resultados de benchmarks generalistas que permitan una comparacion de rendimiento directa.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente coreano (ko); el modelo base soporta ingles y coreano, pero el ajuste puede haber degradado el rendimiento fuera del coreano.
- Especializacion estrecha: las tareas de chat abierto, razonamiento general, conocimiento enciclopedico y generacion de codigo del modelo base no estan garantizadas tras el ajuste; el autor no las reporta.
- Sobreajuste: la perdida de evaluacion minima se alcanza en la epoca 2 y crece de forma monotona hasta la epoca 24 (0.7261), lo que indica que el entrenamiento prolongado no mejora la generalizacion; el checkpoint publicado corresponde a la mejor epoca.
- Extrapolacion de las metricas: los resultados (F1 de 1.000, exactitud de 1.000) se han medido sobre un held-out sintetico generado por las mismas reglas del producto; pueden no reflejar el rendimiento en datos reales.
- Riesgo de alucinacion: no se documentan evaluaciones de fidelidad factual ni de robustez frente a entradas fuera de distribucion.
- Longitud de contexto: aunque el modelo base soporta 32K tokens, el ajuste se realizo a 2.048 tokens, por lo que el comportamiento mas alla de esa longitud no esta validado.
- Licencia: el modelo base usa la EXAONE AI Model License, restringida a investigacion; el autor indica que el uso fue exclusivamente para concurso e investigacion. El uso comercial requiere revisar los terminos de dicha licencia.
- Requiere `trust_remote_code` para cargar los pesos, lo que implica ejecutar codigo del repositorio; conviene auditar el codigo antes de usarlo en produccion.
- Sesgos: no se documentan analisis de sesgo; la terminologia legal se limita al dataset JusWis/korean-legal-terminology y puede arrastrar sus sesgos.
- Procedencia de los datos: al ser en gran parte sinteticos y generados por reglas, el modelo puede fallar en casos limite no cubiertos por esas reglas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/space1637/iapyx-v3-exaone-3.5-2.4b
- Repositorio de reproduccion (directorio `finetune-v3/`): https://github.com/AIROOKIE-S/iapyx
- Informe de evaluacion original (dataset, subcarpeta `v3/`): https://huggingface.co/datasets/space1637/iapyx-finetune-report
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-2.4B-Instruct
- Paper de EXAONE 3.5: https://arxiv.org/html/2412.04862v3
- Repositorio oficial de EXAONE 3.5: https://github.com/LG-AI-EXAONE/EXAONE-3.5
- Perfil del autor en HuggingFace: https://huggingface.co/space1637
- Modelos del autor: https://huggingface.co/space1637/models
