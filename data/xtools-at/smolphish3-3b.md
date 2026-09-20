# xtools-at/SmolPhish3-3B

## Resumen

SmolPhish3-3B es un ajuste fino mediante LoRA del modelo K0D3IN/SmolLM3-3B-Instruct-heretic, que a su vez deriva del SmolLM3-3B de Hugging Face. Lo publica el usuario xtools-at y su proposito declarado es generar correos de phishing "relativamente obvios" para uso exclusivo en investigacion. El modelo se ha entrenado sobre el dataset kxm1k4m1/generate_phishing_email_final y sigue un esquema fijo: un system prompt que ordena redactar un correo de phishing convincente a partir de un contexto personal, y un user prompt con datos como nombre, direccion de correo, puesto de trabajo y actividades recientes.

Tecnicamente es un modelo de 3.000 millones de parametros (cifra nominal heredada del modelo base), de tipo decoder-only transformer y pipeline de text-generation, distribuido en safetensors y compatible con transformers y text-generation-inference. El repositorio ocupa solo 0,1 GB, un tamano muy inferior al esperado para pesos completos de 3B en precision de 16 bits (unos 6 GB), lo que sugiere que se trata de un adaptador LoRA o de un subconjunto de pesos no documentado. Solo declara ingles.

Su relevancia es fundamentalmente metodologica y de seguridad: sirve como banco de pruebas para estudiar generacion de texto malicioso, para construir detectores de phishing y para evaluar si las salvaguardas de los modelos base se mantienen tras un ajuste especifico. No se han publicado resultados de benchmarks, el modelo acumula 0 descargas y 0 "me gusta" en el momento de redactar esta ficha, y no hay evidencia publica de validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base SmolLM3-3B; no se detalla en la model card de este ajuste) |
| Parametros totales | ~3.000 millones (nominal, segun el nombre del modelo y su base SmolLM3-3B; cifra exacta no disponible) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No disponible en la informacion proporcionada para este ajuste. El modelo base SmolLM3-3B se documenta publicamente con soporte de contexto largo (hasta 64k tokens nativos y 128k con YaRN en su documentacion oficial), pero la model card de SmolPhish3 no confirma este valor |
| Tipos de cuantizacion | No disponibles. El repositorio solo publica safetensors; no se listan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |
| Autor | xtools-at |
| Modelo base | K0D3IN/SmolLM3-3B-Instruct-heretic |
| Dataset de ajuste | kxm1k4m1/generate_phishing_email_final |
| Tamano del repositorio | 0,1 GB |
| Pipeline | text-generation |
| Fecha de creacion | 19 de septiembre de 2026 |
| Ultima actualizacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe el modelo como un "LoRA fine-tune of SmolLM3", es decir, un ajuste por adaptadores de bajo rango sobre el modelo K0D3IN/SmolLM3-3B-Instruct-heretic, que a su vez es una variante del SmolLM3-3B de Hugging Face. No se especifica el rango del adaptador, la tasa de aprendizaje, el numero de pasos, el numero de epocas ni la composicion exacta del dataset de ajuste; la unica referencia es el dataset kxm1k4m1/generate_phishing_email_final. Tampoco se documenta si hubo alguna fase de RLHF, DPO o preferencias posterior al ajuste supervisado.

La innovacion tecnica relevante no esta en la arquitectura, sino en la cadena de derivacion: el modelo parte de una variante "heretic", etiqueta que en la practica suele asociarse a versiones con ablacion o eliminacion parcial de los mecanismos de rechazo del modelo original, y sobre ella se aplica un ajuste especifico de dominio para una tarea dual (generacion de contenido fraudulento). El resultado es un modelo de 3B parametros especializado y con alineacion de seguridad presumiblemente degradada. No hay informacion publica sobre el volumen de tokens de entrenamiento, la mezcla de datos ni evaluaciones de seguridad posteriores al ajuste.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado de text-generation.
- Generacion de correos de phishing siguiendo un esquema concreto: asunto, cuerpo y llamada a la accion, a partir de un contexto personal aportado en el prompt.
- Adaptacion del contenido a atributos del objetivo proporcionados por el usuario (nombre, correo, puesto de trabajo, actividades recientes) para aumentar la supuesta relevancia del mensaje.
- Generacion de texto con estructura de correo electronico real, tal como se indica en el ejemplo de uso de la model card ("starting with the 'Subject:' line").
- Soporte conversacional multi-turno (etiqueta "conversational" en el repositorio), aunque no se documenta gestion de contexto largo especifica.
- Compatibilidad con text-generation-inference y con los endpoints de Hugging Face (etiqueta endpoints_compatible).
- Tool calling / function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Vision, audio o modo "thinking" explicito: no documentados en este ajuste.

## Casos de uso

- Generacion de datos sinteticos para entrenar clasificadores antiphishing: el modelo produce correos etiquetados como maliciosos que se pueden incorporar como ejemplos positivos en pipelines de deteccion, siempre que el conjunto se revise y se mantenga aislado del trafico real.
- Red teaming de pasarelas de correo y filtros de seguridad: usar las salidas como carga de prueba para medir la tasa de deteccion de un gateway, un motor de reglas o un clasificador basado en embeddings.
- Simulacros de concienciacion en seguridad: generar plantillas de campanas internas de phishing simulado con consentimiento explicito de la organizacion y con las aprobaciones legales correspondientes, aprovechando que el propio autor describe los correos como "relativamente obvios".
- Investigacion academica sobre generacion de contenido malicioso: analizar estilos de persuasion, marcadores de urgencia y estructura retorica en texto fraudulento generado sinteticamente para caracterizar tecnicas de ingenieria social.
- Evaluacion de alineacion y comportamiento de rechazo: comparar la tasa de cumplimiento de este ajuste frente a la de su modelo base y a la de otros modelos de 3B ante peticiones daninas, para cuantificar el efecto de un ajuste especifico sobre las salvaguardas.
- Pruebas de robustez de parsers y analizadores de correo: alimentar los textos generados a sistemas de extraccion de entidades, deteccion de enlaces o normalizacion MIME para verificar que no se rompen ante formatos de correo variados.
- Auditoria de sesgos y estilo: estudiar como el modelo elige nombres, cargos, sectores y tonos segun los datos personales aportados, lo que permite documentar sesgos en corpus de phishing sintetico.
- Formacion de analistas SOC: construir un corpus controlado de ejemplos etiquetados con distinto nivel de sutileza para ejercicios de triaje en un laboratorio aislado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de evaluaciones especificas de deteccion de phishing para este ajuste. El repositorio no incluye tabla de resultados, no hay paper asociado y la busqueda web realizada no devolvio fuentes tecnicas relevantes (unicamente resultados sin relacion sobre videoclips musicales). Cualquier cifra que se cite debe provenir de una evaluacion propia y documentada.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del tamano nominal de 3.000 millones de parametros, no de datos publicados por el autor):
  - FP16/BF16: aproximadamente 6 GB solo de pesos, mas cache KV y activaciones; en la practica 8-10 GB de VRAM para secuencias cortas.
  - INT8: aproximadamente 3-4 GB de pesos.
  - 4 bits (NF4/AWQ/GPTQ): aproximadamente 2-2,5 GB de pesos.
- GPU recomendadas: para FP16, una RTX 3090 o RTX 4090 (24 GB) va sobrada; A100 40/80 GB y H100 quedan muy por encima de lo necesario. Para 4 bits, una GPU de 6-8 GB (RTX 3060, RTX 4060, T4) es suficiente en teoria.
- Cabe en GPU de consumo: si, en cualquiera con 8 GB o mas en cuantizacion de 4 bits y en la mayoria de 24 GB en precision completa.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta del repositorio) y, de forma generica para modelos de esta familia, llama.cpp/Ollama si se generan pesos GGUF propios. No se publican conversiones GGUF, AWQ ni GPTQ en el repositorio.
- Atencion importante: el repositorio ocupa 0,1 GB, muy por debajo de los ~6 GB esperados para pesos completos de 3B en BF16. Antes de desplegar hay que verificar si se trata de un adaptador LoRA que requiere fusion con K0D3IN/SmolLM3-3B-Instruct-heretic o de pesos ya fusionados; la model card no lo aclara.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|---|
| xtools-at/SmolPhish3-3B | ~3B (nominal) | No disponible | Ingles | Apache 2.0 | Ajuste LoRA para generacion de phishing (investigacion) | Safetensors en Hugging Face, 0 descargas |
| K0D3IN/SmolLM3-3B-Instruct-heretic (modelo base directo) | ~3B (nominal) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | Variante "heretic" del SmolLM3-3B instruct | Hugging Face |
| HuggingFaceTB/SmolLM3-3B (modelo upstream) | 3B (segun documentacion del modelo) | Contexto largo segun documentacion oficial (no verificado aqui) | Multilingue segun documentacion oficial del modelo base | Apache 2.0 segun la documentacion del modelo base | Modelo generalista de proposito general | Hugging Face, ampliamente distribuido |

No se dispone de datos de rendimiento comparativos publicados para SmolPhish3-3B, por lo que la comparacion se limita a parametros, contexto declarado, idioma, licencia y disponibilidad. No se identifican en la informacion proporcionada otros ajustes de la misma categoria (generacion de phishing) con los que establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Finalidad dual y riesgo legal: el modelo esta disenado explicitamente para generar correos de phishing. Su uso para enganar a personas reales constituye fraude en la mayoria de jurisdicciones y puede vulnerar normativa de ciberseguridad, proteccion de datos y comunicaciones electronicas. El autor lo etiqueta como "research use only", pero la licencia Apache 2.0 no impone restriccion contractual de uso, lo que deja la delimitacion en el plano legal y etico, no en el de la licencia.
- Alineacion de seguridad degradada por construccion: el modelo base pertenece a la familia "heretic", asociada a la reduccion de mecanismos de rechazo. Se espera, por tanto, una baja tasa de negativa ante peticiones daninas, lo que lo hace inadecuado para cualquier despliegue orientado al publico.
- Sesgos no evaluados: no hay analisis de sesgo sobre el dataset kxm1k4m1/generate_phishing_email_final ni sobre las salidas. El modelo puede reproducir estereotipos de sector, cargo, genero o nacionalidad presentes en el corpus de entrenamiento.
- Alucinacion: como todo modelo generativo de 3B, tiende a inventar datos, nombres de empresas, enlaces y contextos plausibles pero falsos. En un dominio de ingenieria social esto amplifica el riesgo de contenido enganoso no verificado.
- Limitacion idiomatica: solo declara ingles, por lo que su uso en castellano no esta soportado ni evaluado.
- Limitacion de contexto: no se documenta la ventana de contexto efectiva de este ajuste; el modelo base admite contexto largo, pero un ajuste LoRA puede degradar el rendimiento fuera de la distribucion de sus prompts de entrenamiento.
- Artefacto sin validacion: 0 descargas, 0 "me gusta", sin benchmarks, sin paper y sin evaluaciones de terceros. No hay evidencia de que funcione de forma consistente ni de su calidad real.
- Empaquetado ambiguo: el repositorio de 0,1 GB no es coherente con pesos completos de 3B en BF16, lo que obliga a verificar si es un adaptador LoRA, si requiere fusion con el modelo base o si faltan ficheros.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero eso no habilita el uso fraudulento. Cualquier despliegue en produccion exige revision legal, aislamiento de red y controles de acceso estrictos.
- Recomendacion operativa: mantener el modelo en entornos aislados, con registro de prompts y salidas, sin exposicion a usuarios finales ni a datos personales reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/SmolPhish3-3B
- Modelo base directo: https://huggingface.co/K0D3IN/SmolLM3-3B-Instruct-heretic
- Modelo upstream SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Dataset de ajuste: https://huggingface.co/datasets/kxm1k4m1/generate_phishing_email_final
- Papers, blogs, repositorios o demos adicionales: no disponible. La busqueda web realizada no devolvio resultados tecnicos relacionados con el modelo (unicamente contenido sin relacion sobre temas musicales).
