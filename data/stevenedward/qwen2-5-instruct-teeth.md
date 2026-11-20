# stevenedward/Qwen2.5-Instruct-Teeth

## Resumen

Qwen2.5-Instruct-Teeth es un ajuste fino (fine-tune) del modelo Qwen2.5-3B-Instruct, desarrollado por el usuario stevenedward y publicado en Hugging Face. Se trata de un modelo derivado de la familia Qwen2.5, que emplea una arquitectura transformer densa con 3.000 millones de parametros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El nombre "Teeth" sugiere un ajuste orientado a un dominio especifico, presumiblemente odontologia, aunque la model card no documenta el dataset ni el procedimiento de entrenamiento.

La relevancia de este modelo es limitada en terminos de impacto: cuenta con cero descargas y cero likes en el momento de la consulta, y la informacion publicada es minima (unicamente metadatos de licencia y modelo base). No obstante, resulta interesante como ejemplo de la practica comun de fine-tuning sobre modelos pequenos de la familia Qwen2.5 para dominios verticales, un patron habitual en la comunidad open source.

Al estar basado en Qwen2.5-3B-Instruct, hereda las capacidades generales de generacion de texto, razonamiento, codigo y soporte multilingue del modelo original, asi como su licencia de investigacion (qwen-research-license). No se dispone de informacion sobre benchmarks, datos de entrenamiento ni evaluaciones especificas del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-3B-Instruct) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativos (heredado de Qwen2.5-3B-Instruct; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research-license (licencia de investigacion Qwen) |
| Formato de pesos | no disponible (no se especifica en la model card) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen2.5-3B-Instruct, que emplea una arquitectura transformer denso con atencion por componentes (RoPE, SwiGLU, RMSNorm) y 3.000 millones de parametros. Qwen2.5-3B-Instruct fue entrenado por Alibaba con un corpus de hasta 18 billones de tokens segun la documentacion oficial de la familia, e incluye fases de ajuste supervisado y preferencia (RLHF/DPO) para alineamiento con instrucciones. Sin embargo, la model card de este fine-tune no detalla el dataset, el numero de pasos, la tasa de aprendizaje ni si se emplearon tecnicas como LoRA o ajuste completo.

La unica informacion tecnica disponible es la relacion de dependencia con el modelo base y la licencia. No se documenta ninguna innovacion adicional (decodificacion especulativa, atencion lineal, modos de pensamiento) ni la composicion del corpus de ajuste. El sufijo "Teeth" sugiere un entrenamiento orientado a contenido odontologico, pero no hay evidencia publicada que lo confirme.

## Capacidades

- Generacion de texto y razonamiento general: hereda las capacidades del Qwen2.5-3B-Instruct, incluyendo respuesta a instrucciones y razonamiento de multiples pasos.
- Generacion de codigo: soporta lenguajes de programacion comunes, aunque con las limitaciones propias de un modelo de 3B.
- Matematicas: capacidad basica de resolucion de problemas aritmeticos y algebraicos, inferior a modelos de mayor tamano.
- Soporte de tool calling / function calling: disponible en el modelo base Qwen2.5-3B-Instruct; se desconoce si el fine-tune lo preserva.
- Capacidades de agente y razonamiento multi-paso: limitadas por el tamano del modelo; el modelo base las soporta de forma basica.
- Multilingue: el modelo base Qwen2.5 soporta mas de 29 idiomas; no se confirma que el fine-tune los preserve.
- Capacidad especial: no documentada. No hay evidencia de modo thinking, vision ni audio.

## Casos de uso

- Asistente de consulta odontologica: si el ajuste "Teeth" esta orientado a odontologia, podria emplearse para responder preguntas frecuentes sobre higiene dental, procedimientos y cuidados postoperatorios, con la advertencia de que no sustituye el criterio clinico profesional.
- Generacion de contenido divulgativo: redaccion de articulos y material educativo sobre salud bucodental para blogs o webs de clinicas, aprovechando el vocabulario especializado que el ajuste podria haber adquirido.
- Clasificacion y extraccion de informacion: procesamiento de notas clinicas o textos odontologicos para extraer entidades (tratamientos, materiales, diagnosticos) en pipelines de NLP.
- Chatbot de atencion al paciente: gestion de conversaciones multi-turno para resolver dudas administrativas (citas, seguros, preparacion de procedimientos) con un modelo de 3B desplegable en hardware modesto.
- Prototipado rapido de asistentes verticales: servir como base para experimentar con fine-tuning en dominios sanitarios, dado su bajo coste de inferencia y su tamano manejable.
- Generacion de resumenes de historiales: sintesis de textos clinicos largos gracias a la ventana de contexto de 32.768 tokens heredada del modelo base, siempre con supervision humana.
- Educacion y simulacion: creacion de escenarios de simulacion para estudiantes de odontologia (preguntas de examen, casos practicos) con contenido generado y revisado por expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 (3B parametros x 2 bytes), unos 3-4 GB en cuantizacion de 4 bits y unos 2 GB en cuantizacion de 8 bits (estimacion estandar para 3B, no confirmada por el autor).
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A10G, L4 o A100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 8 GB de VRAM en FP16 o 4 GB en cuantizacion de 4 bits (RTX 3050 8 GB, RTX 3060, RTX 4060, etc.).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers, siempre que se disponga de los pesos en un formato compatible (no confirmado en la model card).
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una RTX 4090 se puede esperar un throughput del orden de decenas a cientos de tokens por segundo, pero no hay mediciones publicadas para este fine-tune.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen2.5-Instruct-Teeth (este modelo) | 3B | 32.768 (heredado) | qwen-research-license | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct | 3B | 32.768 | qwen-research-license | Hugging Face, ampliamente utilizado |
| Llama 3.2 3B Instruct | 3B | 128.000 | Llama 3.2 Community License | Hugging Face, muy popular |
| Phi-3.5-mini-instruct | 3,8B | 128.000 | MIT | Hugging Face, muy popular |

No se dispone de datos de rendimiento comparativo para este fine-tune. La comparativa se limita a parametros, contexto y licencia, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al heredar el modelo base Qwen2.5, puede reproducir sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinacion: alto en dominios especializados como odontologia si el ajuste no se ha validado clinicamente; no debe usarse como fuente de verdad medica.
- Limitaciones de contexto o idioma: no se confirma que el fine-tune preserve la ventana de 32.768 tokens ni el soporte multilingue del modelo base.
- Restricciones de licencia: la qwen-research-license limita el uso comercial en determinados supuestos; es imprescindible revisar los terminos antes de un despliegue en produccion.
- Falta de documentacion: la model card no incluye dataset, procedimiento de entrenamiento, evaluaciones ni formato de pesos, lo que impide verificar la calidad del ajuste.
- Madurez: cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad; no se recomienda su uso en produccion sin una evaluacion propia.
- Riesgo de sobreajuste al dominio "Teeth": si el ajuste se realizo con un corpus pequeno, puede degradar capacidades generales del modelo base (olvido catastrofico).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stevenedward/Qwen2.5-Instruct-Teeth
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio oficial de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
