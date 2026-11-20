# Uchiha80971/CyberLLM-v8

## Resumen

CyberLLM Pilot v8 es un adaptador LoRA de dominio especifico orientado a ciberseguridad defensiva, desarrollado por Gaurav Singh y publicado en Hugging Face bajo el identificador `Uchiha80971/CyberLLM-v8`. No es un modelo completo, sino un fine-tune PEFT sobre Qwen3-1.7B de Alibaba, con 17.432.576 parametros entrenables y un peso total de repositorio de aproximadamente 0,1 GB. Su proposito es el analisis de logs de seguridad, clasificacion de amenazas, analisis de CVE y mapeo a MITRE ATT&CK, devolviendo respuestas JSON estructuradas con abstencion explicita (`needs_review`) cuando la evidencia es insuficiente.

El modelo base Qwen3-1.7B aporta una ventana de contexto nativa amplia y capacidades multilingues, aunque el adaptador se ha entrenado exclusivamente sobre datos de seguridad en ingles y no declara idiomas soportados en su model card. La relevancia actual del proyecto reside en su enfoque de evaluacion congelada y trazabilidad: publica hashes SHA-256 de los pesos, fija el prompt de sistema de despliegue y documenta explicitamente los casos de fallo, algo poco habitual en adaptadores de nicho.

El estado del artefacto es de release candidate (`1.0.0-rc.2`), no promovido formalmente bajo la regla de aceptacion binaria del autor: T1 structured HTTP obtiene 0,9583 frente al umbral 0,96, y T4 CVE analysis 0,80 frente a 1,00. Se trata del mejor candidato medido y del candidato designado para integracion, pero su inferencia real en GTX 1660 SUPER (6 GB) aun no esta verificada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-1.7B; `task_type: CAUSAL_LM` |
| Parametros totales | 17.432.576 parametros entrenables en el adaptador (392 tensores); el modelo base Qwen3-1.7B no se incluye en el repositorio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para el adaptador; el entrenamiento uso `max_len` 1024 |
| Tipos de cuantizacion | No se declaran cuantizaciones publicadas; el autor indica cargar el base en fp16 (`load_in_8bit` OFF) |
| Idiomas soportados | No disponibles (los datos de entrenamiento son de seguridad, presumiblemente en ingles, sin declaracion explicita) |
| Licencia | Apache-2.0 |
| Formato de pesos | `adapter_model.safetensors` + `adapter_config.json` (PEFT); incluye `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16, alpha 32, dropout 0,05 y 7 modulos objetivo (q, k, v, o, gate, up, down) sobre el modelo base Qwen3-1.7B en su revision `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`. La configuracion se genero con PEFT 0.20.0 y el adaptador no esta fusionado con el modelo base: debe cargarse con `PeftModel.from_pretrained` sobre el base en fp16.

El entrenamiento consistio en 2 epocas con learning rate 1e-4 y scheduler coseno, batch efectivo 8, `max_len` 1024 y semilla 20261023. Se ejecuto el 24 de octubre de 2026 en una Tesla T4 de Kaggle durante 7.261,7 segundos, con una perdida final de entrenamiento de 0,1979 y un pico de VRAM de 3,8 GB. El dataset, denominado data-v3.2, contiene 5.932 filas de entrenamiento, 618 de validacion y un conjunto held-out de 120 items (val-v3). Las fuentes declaradas son corpus publicados intencionadamente, datasets propios del autor y una factoria sintetica determinista; no se usaron etiquetas de modelo profesor ni logs o credenciales recolectadas. El autor documenta ademas adaptadores de identidad descartados (v2 sin evaluar, v3 con puntuacion 0,0 en todas las tareas congeladas) que deben considerarse resultados negativos y no cargarse en produccion.

## Capacidades

- Analisis de logs de seguridad con clasificacion provisional en tres estados: `likely_benign`, `needs_review` y `likely_threat`.
- Clasificacion de URLs (tarea T2 de la evaluacion congelada).
- Analisis de CVE con salida JSON conforme a esquema (tarea T4).
- Mapeo a MITRE ATT&CK a nivel de tecnica, con rendimiento debil en la prediccion exacta de ID (0,025) pero abstencion perfecta (1,0) cuando no hay certeza.
- Analisis de trafico HTTP estructurado (tarea T1 structured HTTP).
- Generacion de respuestas JSON estructuradas con degradacion segura a `needs_review` y preservacion del texto crudo ante salidas no parseables.
- Identidad de despliegue fijada mediante prompt de sistema: el modelo se identifica como "CyberLLM, developed by Gaurav Singh" (10/10 en T13 con prompt de despliegue correcto; 7/12 en sondas de identidad held-out).
- Capacidades del modelo base Qwen3-1.7B (generacion de texto conversacional, multilingueismo) potencialmente presentes pero no evaluadas ni garantizadas por el adaptador.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion proporcionada.

## Casos de uso

- Triaje de alertas SIEM: el adaptador recibe entradas de log y devuelve una clasificacion JSON con estado provisional y campo de revision, adecuado para pre-filtrar colas de alertas antes de la intervencion humana.
- Clasificacion de URLs sospechosas en correos de phishing: la tarea T2 (0,95 de accuracy) permite etiquetar enlaces entrantes como benignos, sospechosos o pendientes de revision dentro de un pipeline de correo.
- Analisis de CVE en boletines de vulnerabilidades: la salida JSON conforme a esquema (T4, 0,80) facilita la extraccion estructurada de metadatos de CVE para enriquecer inventarios de activos.
- Mapeo asistido a MITRE ATT&CK: util para proponer tecnicas candidatas a partir de descripciones de incidentes, siempre que las predicciones de ID exacto (0,025) se traten como sugerencias y nunca como hallazgos confirmados.
- Analisis de logs HTTP en entornos web: la tarea T1 (0,9583) permite clasificar peticiones estructuradas y derivar a revision manual los casos ambiguos o con JSON malformado.
- Asistente de documentacion de seguridad: con el prompt de sistema de despliegue, el modelo mantiene una identidad coherente para generar resumenes y respuestas conversacionales sobre hallazgos ya clasificados.
- Despliegue en estaciones de trabajo con GPU de consumo: el pico estimado de ~4,5 GB de VRAM (estimacion derivada del entrenamiento en T4, no verificada en GTX 1660 SUPER) permite ejecutarlo localmente en tarjetas de 6 GB para entornos de analisis aislados.

## Benchmarks y rendimiento

Evaluacion congelada v2.1, decodificacion greedy, con prompt de sistema de despliegue:

| Metrica | Pilot v8 |
|---|---|
| T1 structured HTTP — accuracy | 0,9583 |
| T2 URL classification — accuracy | 0,95 |
| T3 MITRE ATT&CK exact-ID | 0,025 |
| T3b abstention | 1,0 |
| T4 CVE analysis — JSON/schema | 0,80 |
| T5 log analysis — accuracy | 1,0 |
| val-v3 held-out logs (n=120) — accuracy | 0,9667 |
| T13 identity (deployment-correct) | 10/10 |
| Identity probes (held-out, 12) | 7/12 |

No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB de pico segun estimacion del autor derivada del entrenamiento en Tesla T4; no verificada en GTX 1660 SUPER.
- VRAM de entrenamiento observada: pico de 3,8 GB en Tesla T4 con `max_len` 1024 y batch efectivo 8.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para el adaptador en fp16; el autor cita GTX 1660 SUPER como objetivo de despliegue local. Para el modelo base en precision completa se requiere mas memoria, no cuantificada en la informacion disponible.
- Cabe en GPU de consumo: si, segun la estimacion del autor, en tarjetas de 6 GB como la GTX 1660 SUPER (pendiente de verificacion real).
- Opciones de despliegue: `transformers` + `peft` con `accelerate` (version documentada: `transformers==5.16.1`, `peft==0.20.0`, `accelerate==1.14.0`, `torch==2.6.0+cu124`, Python 3.12). No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CyberLLM Pilot v8 (este) | 17,4 M entrenables sobre Qwen3-1.7B | No disponible (entrenado a 1024) | Ciberseguridad defensiva, salida JSON con abstencion | Apache-2.0 | Hugging Face, release candidate |
| Qwen3-1.7B (base) | 1,7 B | No disponible en la informacion proporcionada | Proposito general, conversacional | Apache-2.0 | Hugging Face |
| Alternativas de ciberseguridad del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de ciberseguridad en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- T1 JSON/schema es 0,9583 y no 1,0: uno de cada 24 items presenta un error de sintaxis JSON de un caracter (coma ausente) aunque la clasificacion sea correcta; las salidas no parseables degradan a `needs_review` conservando el texto crudo.
- La prediccion exacta de ID de tecnica MITRE ATT&CK es muy debil (0,025); los mapeos inciertos nunca deben presentarse como hallazgos confirmados.
- El modelo no ha sido promovido formalmente bajo la regla de aceptacion del autor (T1 0,9583 < 0,96; T4 0,80 < 1,00); es un release candidate.
- La inferencia real en GTX 1660 SUPER (6 GB) no esta verificada; la cifra de ~4,5 GB de VRAM es una estimacion.
- La identidad del modelo depende del prompt de sistema de despliegue; sin el, las sondas de identidad caen a 7/12 y los pesos conservan la identidad del entrenamiento original.
- No deben cargarse los adaptadores de identidad v2 (nunca evaluado) ni v3 (0,0 en todas las tareas congeladas); son resultados negativos.
- Uso previsto exclusivamente defensivo: queda fuera de alcance atacar sistemas, ejecutar comandos hallados en logs, bloqueos automaticos, desactivacion de cuentas o cualquier remediacion automatica.
- Los comandos presentes en logs enviados son datos a analizar, nunca instrucciones a ejecutar.
- Las salidas son provisionales y requieren revision humana para decisiones con consecuencias.
- No se declaran idiomas soportados; el adaptador se entreno sobre datos de seguridad sin indicacion de cobertura multilingue.
- La model card indica que es un artefacto privado y que no debe publicarse en un hub publico sin aprobacion explicita, pese a estar accesible en Hugging Face; conservar la atribucion al modelo base Qwen en toda copia.
- Riesgo de alucinacion y sesgos: no documentados explicitamente en la informacion proporcionada, si bien la naturaleza generativa del modelo base y la debilidad en MITRE ATT&CK sugieren cautela.
- El autor figura como Gaurav Singh en esta release, mientras que el historial de Git, los kernels de Kaggle y los datos de entrenamiento v8 nombran a Gaurav Bisht; conviene tenerlo en cuenta para trazabilidad de licencias y atribucion.

## Enlaces

- Hugging Face: https://huggingface.co/Uchiha80971/CyberLLM-v8
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio PEFT: https://github.com/huggingface/peft
- MITRE ATT&CK (STIX bundle Enterprise v20.0): https://attack.mitre.org/
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
