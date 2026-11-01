# Thehabeebops/publichealth-sentinel-qwen3-lassa

## Resumen

PublicHealth Sentinel: Lassa fever summary adapter es un adaptador LoRA de rango 8 entrenado sobre el modelo base Qwen/Qwen3-0.6B, un transformer decoder-only de aproximadamente 0,6 mil millones de parametros. Lo desarrolla el usuario Thehabeebops y su funcion es convertir valores agregados de informes semanales de fiebre de Lassa en Nigeria, previamente suministrados por una fuente revisada, en resumenes breves y neutrales. No es un modelo independiente: requiere cargar el modelo base y aplicar el adaptador mediante PEFT.

El adaptador resuelve un problema muy acotado de redaccion asistida en salud publica: dada una tabla de cifras ya validada y una URL de informe, genera un texto estructurado y sobrio. Explicita que no recupera informes, no verifica datos, no calcula tendencias, no detecta brotes y no toma decisiones de salud publica. Tampoco es un sistema de diagnostico, triaje o tratamiento.

Su relevancia es limitada y experimental: el repositorio ocupa 0,0 GB, tiene 23 descargas y ningun like, y su entrenamiento se basa en solo 40 ejemplos (2020-2023), con 14 de validacion (2024) y 16 de prueba retenida (2025). La evaluacion publicada no demuestra superioridad frente al modelo base, ya que ambas configuraciones alcanzaron el techo en las comprobaciones binarias seleccionadas. La revision por expertos independientes en salud publica esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 8) sobre transformer decoder-only Qwen3-0.6B |
| Parametros totales | no disponible (adaptador; el modelo base Qwen3-0.6B tiene ~0,6 mil millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la model card) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; cuantizacion del base no declarada) |
| Idiomas soportados | no disponible (la model card esta en ingles y no declara idiomas) |
| Licencia | Apache-2.0 (adaptador); modelo base Apache-2.0; dataset de origen CC BY 4.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); libreria peft |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 8 aplicado sobre Qwen/Qwen3-0.6B, un transformer decoder-only de la familia Qwen3. No se documentan modificaciones arquitectonicas adicionales, ni decodificacion especulativa, atencion linear u otras innovaciones. El entrenamiento consistio en ajuste fino supervisado (SFT) con LoRA sobre 40 ejemplos de entrenamiento correspondientes a 2020-2023, 14 ejemplos de validacion de 2024 y 16 ejemplos retenidos de 2025. No se indica el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron RLHF o DPO.

Los valores de entrenamiento provienen del dataset NCDC Lassa Fever Weekly Timeseries, mantenido por Emmanuel Niyi-Oriolowo y marcado CC BY 4.0 en Hugging Face, derivado de los informes de situacion semanales de NCDC. El propietario del proyecto afirma que NCDC confirmo que sus publicaciones son de uso publico y reutilizables, aunque los informes examinados no exponen una licencia especifica. El repositorio no incluye PDFs de NCDC, extractos textuales de evidencia ni filas de train/validation/test; los enlaces a informes y la auditoria a nivel de fila se conservan en los registros del proyecto pero no se empaquetan en el repositorio.

## Capacidades

- Generacion de texto: redaccion de resumenes breves y neutrales a partir de valores agregados ya suministrados.
- Formateo estructurado: produce resumenes en un formato estructurado consistente, segun los casos retenidos de 2025.
- Inclusión de URL de origen: incorpora la URL del informe en la salida (16/16 en la prueba retenida).
- Preservacion de valores: mantiene todos los valores esperados en la salida (16/16 en la prueba retenida).
- Control de lenguaje no respaldado: evita terminologia de brote no sustentada por los datos (16/16 en la prueba retenida).
- No soporta tool calling ni function calling de forma declarada.
- No soporta agentes ni razonamiento multi-step de forma declarada.
- Capacidades multilingues: no declaradas.
- No dispone de modo thinking, vision ni audio declarados.

## Casos de uso

- Redaccion de boletines semanales internos: a partir de una tabla de casos confirmados, sospechosos y muertes ya validada por un epidemiologo, el adaptador genera un parrafo neutral con las cifras y la URL del informe de NCDC. Es adecuado porque su unica funcion es verbalizar valores suministrados, sin inferir tendencias.
- Preparacion de notas para boletines de vigilancia: un sistema upstream extrae y revisa las cifras del informe semanal y el adaptador produce un borrador de resumen que un editor humano revisa antes de publicar.
- Estandarizacion de formato de resumenes: si una organizacion necesita que todos sus resumenes semanales de Lassa compartan estructura (valores, fuente, redaccion neutra), el adaptador impone ese formato sobre el modelo base de 0,6 mil millones de parametros.
- Generacion de fichas para dashboards de salud publica: el adaptador convierte filas de una base de datos revisada en texto explicativo breve que acompania a graficos, manteniendo la URL de procedencia.
- Documentacion de auditoria: al incluir sistematicamente la URL del informe, facilita la trazabilidad de cada resumen en registros internos de una organizacion sanitaria.
- Prototipado de bajo coste: al ser un adaptador sobre un modelo de 0,6 mil millones de parametros, puede ejecutarse en hardware modesto para experimentar con flujos de redaccion asistida antes de invertir en modelos mayores.
- Filtrado de lenguaje sensacionalista: en entornos donde se exige evitar terminos como "brote" sin respaldo, el adaptador sirve como capa de reformulacion sobre textos ya redactados por humanos.

## Benchmarks y rendimiento

La model card solo reporta una prueba retenida de 16 ejemplos de 2025 con tres comprobaciones binarias, comparando el adaptador con el modelo base:

| Comprobacion | Modelo base | Adaptador LoRA |
|---|---|---|
| Todos los valores esperados presentes | 16/16 | 16/16 |
| URL de origen incluida | 16/16 | 16/16 |
| Sin terminologia de brote no respaldada | 16/16 | 16/16 |

Ambos modelos alcanzaron el techo en estas comprobaciones, por lo que la prueba no distingue entre ellos ni demuestra una mejora del ajuste fino. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El modelo base Qwen3-0.6B, con pesos en fp16, ocupa aproximadamente 1,2 GB; el adaptador LoRA anade una fraccion minima (rango 8). En cuantizacion de 4 bits, el base puede ocupar del orden de 0,4-0,5 GB, aunque estos valores no estan declarados en la model card.
- GPU recomendadas: no declaradas. Por tamano, el modelo base cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores; tambien en A100, H100 y L4, aunque no hay datos oficiales de rendimiento.
- Cabe en GPU de consumo: si, previsiblemente, dado el tamano del modelo base; no confirmado por el autor.
- Opciones de despliegue: carga mediante transformers y peft, tal como muestra la model card (AutoModelForCausalLM + PeftModel). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la fusión del adaptador en el base para servir con vLLM seria posible tecnicamente, pero no esta validada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas frente a otros adaptadores o modelos de resumen de salud publica. La comparacion natural es con su propio modelo base:

| Modelo | Parametros | Contexto | Rendimiento en prueba retenida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PublicHealth Sentinel Lassa (LoRA) | Adaptador r8 sobre ~0,6 B | no disponible | 16/16 en tres comprobaciones binarias | Apache-2.0 | Hugging Face, 23 descargas |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | no disponible | 16/16 en las mismas comprobaciones | Apache-2.0 | Hugging Face |
| Alternativas de resumen medico especializado | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo debe usarse cuando una fuente upstream revisada ya haya suministrado los valores agregados y la URL del informe; no recupera ni verifica datos.
- No calcula tendencias, no detecta brotes y no toma decisiones de salud publica.
- No es un sistema de diagnostico, triaje o tratamiento; no debe usarse para aconsejar a pacientes individuales.
- No ha sido validado para uso operativo ni clinico; la revision por expertos independientes esta pendiente.
- Riesgo de alucinacion: aunque la prueba retenida no detecto lenguaje de brote no respaldado, el modelo base puede generar afirmaciones no presentes en los datos; la supervision humana sigue siendo necesaria.
- Sesgos conocidos: no documentados; el entrenamiento con 40 ejemplos procedentes de un unico pais y formato limita la generalizacion.
- Limitaciones de contexto e idioma: no declaradas; los casos retenidos usan un formato estructurado consistente, y la model card advierte que se necesitan mas ejemplos, formatos variados y prompts diversos para sostener afirmaciones amplias.
- La licencia Apache-2.0 del adaptador no concede derechos sobre los documentos de informes de NCDC; el repositorio no incluye PDFs ni extractos.
- El dataset de origen esta marcado CC BY 4.0 y requiere atribucion a Emmanuel Niyi-Oriolowo y a NCDC como fuente original de los valores.
- El rendimiento con prompts fuera del formato de entrenamiento no esta caracterizado; la prueba de 16 ejemplos es demasiado pequena para estimar robustez en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thehabeebops/publichealth-sentinel-qwen3-lassa
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset NCDC Lassa Fever Weekly Timeseries: https://huggingface.co/datasets/EmanuelN/ncdc_lassa_fever_timeseries
- Licencia del adaptador: https://huggingface.co/Thehabeebops/publichealth-sentinel-qwen3-lassa/blob/main/LICENSE
