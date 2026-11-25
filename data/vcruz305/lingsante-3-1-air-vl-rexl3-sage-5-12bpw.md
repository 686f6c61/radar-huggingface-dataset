# vcruz305/LingSante-3.1-Air-VL-REXL3-SAGE-5.12bpw

## Resumen

LingSante-3.1-Air-VL-REXL3-SAGE-5.12bpw es un pack cuantizado del modelo multimodal inclusionAI/LingSante-3.1-air-VL, publicado por el usuario vcruz305. El modelo base es un MoE nativo multimodal de 124B parametros totales y 5,5B parametros activos por token, desarrollado por el equipo de salud de Ant Group sobre Ling-3.0-flash-VL, orientado a tareas clinicas reales: informes de imagen medica, evaluacion sanitaria multimodal, busqueda medica con sintesis de evidencia y agentes GUI sanitarios.

Este pack concreto aplica SAGE, un metodo de cuantizacion de precision mixta propietario y no publicado del autor, sobre el formato REXL3, con un perfil de 5,12 bits por peso. El resultado ocupa 74,37 GiB residentes en GPU (79,92 GB en disco, 15 shards) e incluye el codificador visual `qwen3_moe_vit` y `linear_proj` sin cuantizar en BF16, dejando espacio para la cache KV Gated MLA de 262K tokens y los estados recurrentes KDA de 35 capas en una unica GPU de 96 GB o dispositivo con memoria unificada de clase 128 GB.

La relevancia de este pack es practica: permite ejecutar un modelo medico multimodal de 124B parametros en hardware de una sola GPU manteniendo, segun el autor, un 94,89% de acuerdo top-1 y una KLD media de 0,0257 frente al checkpoint original en BF16. La licencia es MIT, igual que la del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (bailing_moe_v3_vl) con codificador visual qwen3_moe_vit, atencion Gated MLA y capas KDA (Kimi Delta Attention) recurrentes |
| Parametros totales | 39.928.257.104 (~39,9B en safetensors del pack; el modelo base declara 124B totales) |
| Parametros activos | 5,5B por token (modelo base) |
| Longitud de contexto | 262K tokens (256K segun la model card upstream) |
| Tipos de cuantizacion | REXL3 con perfil SAGE de 5,12 bpw; vision encoder y linear_proj en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (REXL3, 15 shards, requiere custom_code) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos nativamente multimodal. Combina atencion Gated MLA con capas KDA (Kimi Delta Attention) de tipo lineal/recurrente, lo que reduce el coste de la cache KV en contextos largos: el pack reserva espacio para los estados recurrentes de 35 capas KDA ademas de la cache MLA de 262K tokens. El codificador visual es `qwen3_moe_vit`, acompanado de una `linear_proj` que proyecta las representaciones visuales al espacio del modelo de lenguaje. Acepta entradas de texto e imagen de forma nativa.

El entrenamiento del modelo original fue realizado por inclusionAI (Ant Group) partiendo de Ling-3.0-flash-VL, con foco en dominios clinicos: informes de imagen medica, evaluacion sanitaria, busqueda de evidencia y flujos GUI medicos, ademas de tareas multimodales generales, comprension de documentos y graficos, y uso de herramientas. La model card upstream no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. La cuantizacion SAGE aplicada en este pack es un metodo de precision mixta propietario cuyo algoritmo no ha sido publicado; el autor solo reporta las metricas de fidelidad frente al modelo en BF16.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Razonamiento multimodal medico: interpretacion sistematica de imagenes considerando historial del paciente, tecnica de imagen y calidad, con redaccion de secciones Findings e Impression.
- Interpretacion conjunta de multiples imagenes; identificacion de 8-9 tipos de hallazgos positivos en una radiografia de torax compleja (cardiomegalia, derrame pleural, atelectasia, consolidacion, neumonia, neumotorax).
- Analisis de imagenes de piel (mas de 120 enfermedades cutaneas), comidas e informes medicos.
- Anamnesis multi-turno con preguntas de seguimiento antes de emitir una evaluacion.
- Analisis dietetico y nutricional: identificacion de ingredientes solapados o mezclados, descomposicion de platos complejos y estimacion de porciones.
- Busqueda medica y sintesis de evidencia: busqueda imagen-a-imagen, recuperacion de articulos, guias clinicas y casos similares.
- Uso de herramientas de imagen y bounding boxes para verificar localizacion de lesiones antes de redactar informes.
- Soporte de tool calling y flujos de agente GUI (seleccion de hospital, departamento, citas online), requiriendo un entorno externo que provea herramientas, mantenga estado y valide acciones.
- Capacidades generales multimodales: comprension de documentos y graficos, y uso de herramientas fuera del dominio medico.

## Casos de uso

- Redaccion asistida de informes de radiologia: el modelo recibe la imagen y el historial del paciente, revisa la tecnica y la calidad, y genera borradores estructurados con Findings e Impression que el radiologo revisa y valida. Es adecuado por su entrenamiento especifico en informes de imagen medica y su capacidad de interpretar varias imagenes a la vez.
- Triaje dermatologico con anamnesis: a partir de una foto de una lesion, el modelo pregunta por localizacion, duracion, picor o dolor e historial antes de proponer una evaluacion, cubriendo mas de 120 enfermedades cutaneas. Util para precribado en aplicaciones de salud con supervision clinica.
- Analisis nutricional de comidas: el usuario sube una foto de un plato y el modelo identifica ingredientes, descompone platos complejos, estima porciones y calcula nutrientes. Aprovecha la ventana de contexto para incorporar historial dietetico en la misma conversacion.
- Interpretacion de analiticas e informes medicos: el modelo relaciona recuentos sanguineos con marcadores inflamatorios e inmunitarios y prioriza acciones de seguimiento, lo que sirve en portales de pacientes o herramientas de apoyo a la consulta.
- Busqueda de evidencia clinica: integrado con un motor de busqueda y una base de articulos y guias, el modelo ejecuta la secuencia imagen → busqueda → evidencia → respuesta y enlaza cada conclusion con su fuente, lo que permite trazas auditables.
- Agentes GUI para gestion de citas: con un entorno que exponga herramientas y valide acciones, el modelo navega flujos de seleccion de hospital y departamento para reservar citas, reduciendo la carga administrativa en portales sanitarios.
- Procesamiento por lotes de documentos y graficos clinicos: su contexto de 262K tokens y su soporte de documentos permiten procesar historiales extensos o lotes de informes en una sola pasada, con el pack desplegado en una GPU de 96 GB.

## Benchmarks y rendimiento

La model card del pack reporta unicamente metricas de fidelidad de la cuantizacion frente al modelo en BF16, evaluadas con teacher forcing sobre vocabulario completo (157.184 tokens) en `float64`, sobre un split independiente de 28.683 predicciones de turno de asistente con entradas de texto:

| Metrica | Valor |
|---|---:|
| Acuerdo top-1 | 94,89% |
| KLD media | 0,0257 |

La model card upstream menciona una imagen de resumen de benchmarks, pero no se han transcrito resultados numericos de MMLU, HumanEval, GSM8K ni de evaluaciones medicas en la informacion disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 74,37 GiB residentes en GPU para el pack completo a 5,12 bpw, incluyendo el codificador visual y `linear_proj` en BF16; 79,92 GB en disco.
- GPU recomendadas: una unica GPU de 96 GB (por ejemplo, H100 96 GB, H200 o A100 80 GB no es suficiente segun la cifra declarada) o un dispositivo con memoria unificada de clase 128 GB.
- GPU de consumo: no cabe en tarjetas consumer de 24-48 GB en este perfil; requeriria cuantizaciones adicionales no publicadas en este repositorio.
- El pack deja headroom para la cache KV Gated MLA de 262K tokens y los estados recurrentes KDA de 35 capas, por lo que el contexto maximo es viable en el hardware objetivo.
- Opciones de despliegue: requiere `custom_code` y el runtime REXL3; no es compatible directamente con llama.cpp, Ollama ni TGI sin conversion previa. El soporte en vLLM u otros servidores no esta confirmado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LingSante-3.1-Air-VL-REXL3-SAGE-5.12bpw (este pack) | ~39,9B en safetensors (124B totales, 5,5B activos en base) | 262K | Texto + imagen | MIT | Hugging Face, 0 descargas |
| inclusionAI/LingSante-3.1-air-VL (base sin cuantizar) | 124B totales, 5,5B activos | 256K | Texto + imagen | MIT | Hugging Face (inclusionAI) |
| Ling-3.0-flash-VL (modelo del que deriva) | no disponible | no disponible | Texto + imagen | no disponible | Hugging Face (inclusionAI) |

No se dispone de datos de benchmarks comparativos con modelos medicos multimodales de la competencia en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es un modelo de investigacion y no un dispositivo medico: sus salidas pueden ser incompletas o inexactas y no sustituyen el consejo, diagnostico o tratamiento profesional. Todo uso de alto riesgo exige revision por personal cualificado, validacion independiente y cumplimiento de la normativa de privacidad, seguridad y salud aplicable.
- La cuantizacion SAGE es un metodo propietario no publicado; no es posible auditar su proceso ni reproducir la receta, solo verificar las metricas de fidelidad declaradas por el autor.
- La perdida de fidelidad es medible: 94,89% de acuerdo top-1 implica que aproximadamente 1 de cada 20 predicciones difiere del modelo en BF16, con una KLD media de 0,0257; en dominios clinicos ese margen requiere validacion especifica.
- El pack depende de `custom_code` y del runtime REXL3, lo que limita la portabilidad frente a formatos estandar como GGUF.
- No se especifican los idiomas soportados; la model card upstream esta en ingles y no se detalla la cobertura multilingue.
- Los flujos de busqueda, tool use y GUI requieren un entorno externo que provea herramientas, mantenga estado y valide acciones; el modelo por si solo no ejecuta esas tareas.
- Riesgo de alucinacion inherente a modelos generativos, agravado en un dominio donde una salida erronea puede tener consecuencias clinicas.
- No se documentan sesgos conocidos ni la composicion del dataset de entrenamiento del modelo base.
- La licencia MIT permite uso comercial, pero la responsabilidad regulatoria en aplicaciones sanitarias recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente del pack.

## Enlaces

- Pack cuantizado: https://huggingface.co/vcruz305/LingSante-3.1-Air-VL-REXL3-SAGE-5.12bpw
- Modelo base: https://huggingface.co/inclusionAI/LingSante-3.1-air-VL
- Modelo de origen: https://huggingface.co/inclusionAI/Ling-3.0-flash-VL
- Organizacion inclusionAI en Hugging Face: https://huggingface.co/inclusionAI
- Organizacion inclusionAI en ModelScope: https://modelscope.cn/organization/inclusionAI
- Perfil del autor de la cuantizacion: https://huggingface.co/vcruz305
