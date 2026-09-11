# Toxotes/QWEN3_EXPERT_V2_GGUF

## Resumen

QWEN3_EXPERT_V2_GGUF es una version cuantizada en formato GGUF del modelo QWEN3_EXPERT_V2, un ajuste fino de Qwen3-8B orientado especificamente al dominio financiero turco. Lo publica el usuario Toxotes en HuggingFace bajo licencia Apache 2.0, y forma parte del proyecto MOSAIC-v2, descrito por su autor como una arquitectura de chatbot RAG federada y adaptativa especializada en finanzas turcas. El repositorio ocupa 5,0 GB y el recuento de parametros reportado es de 8.190.735.360 (aproximadamente 8,19 mil millones), coherente con la base Qwen3-8B.

El modelo se distribuye unicamente con la cuantizacion Q4_K_M, que el autor recomienda como equilibrio entre velocidad y calidad. Su proposito es servir de motor de generacion dentro de pipelines de recuperacion aumentada (RAG) sobre documentacion financiera en turco, un nicho poco cubierto por los modelos generalistas, que suelen rendir peor en terminologia financiera local y en turco.

La relevancia actual del modelo es limitada pero concreta: es un artefacto de nicho, con 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado y sin resultados de benchmarks publicados. Su interes principal es practico (despliegue local barato de un asistente financiero en turco) mas que comparativo frente a modelos frontera.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (equivalente 8B), transformer denso |
| Parametros totales | 8.190.735.360 (dato reportado por HuggingFace a partir de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion documentada por el autor) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Tamano del repositorio | 5,0 GB |
| Dominio declarado | Finanzas turcas |
| Modelo base | Qwen3-8B, ajustado con datos financieros expertos |
| Proyecto | MOSAIC-v2 (chatbot RAG federado y adaptativo) |
| Fecha de creacion | 17 de mayo de 2026 |
| Ultima actualizacion | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La model card indica que se trata de un ajuste fino de Qwen3-8B, es decir, la arquitectura transformer densa de la familia Qwen3 en su variante de 8.000 millones de parametros. No se documenta ningun cambio estructural sobre el modelo base: no hay mezcla de expertos (MoE), ni atencion lineal, ni componentes de espacio de estados. El autor describe el entrenamiento como un fine-tuning con "datos financieros expertos" (expert finance data), sin especificar el numero de tokens, la composicion del corpus, la mezcla de idiomas ni si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT supervisado.

Tampoco se detalla el proceso de cuantizacion mas alla del resultado (Q4_K_M) ni la herramienta empleada (habitualmente llama.cpp). No se declaran innovaciones tecnicas propias. El unico elemento de contexto adicional es la pertenencia al proyecto MOSAIC-v2, una arquitectura de chatbot RAG federada para el dominio financiero turco, lo que sugiere que el modelo se entrena o se usa como generador final dentro de un sistema de recuperacion, no como modelo aislado.

En resumen: la informacion publica sobre el entrenamiento es minima y no permite verificar la calidad, el sesgo ni la cobertura del ajuste.

## Capacidades

- Generacion de texto conversacional en turco, orientada al dominio financiero (productos bancarios, tipos de interes, terminologia economica).
- Respuesta a preguntas dentro de un pipeline RAG: el modelo esta pensado para consumir contexto recuperado de una base documental financiera.
- Conversacion multi-turno: la etiqueta "conversational" del repositorio indica soporte de dialogos encadenados.
- Integracion con endpoints compatibles: la etiqueta "endpoints_compatible" sugiere compatibilidad con HuggingFace Inference Endpoints.
- Despliegue local mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, llama-cpp-python).
- Capacidades de tool calling o function calling: no documentadas en la informacion disponible.
- Modo de razonamiento explicito (thinking mode): no documentado en la informacion disponible.
- Vision, audio o multimodalidad: no documentado; el modelo es de texto.
- Capacidades multilingues: solo se declara turco; no se confirma el rendimiento en otros idiomas heredados de Qwen3.
- Matematica y codigo: no documentados especificamente para este ajuste.

## Casos de uso

- Asistente financiero en turco para banca minorista: desplegado con llama.cpp en infraestructura propia, responde a preguntas sobre tipos de interes, comisiones y productos de ahorro, evitando enviar datos de clientes a APIs externas.
- Motor generativo de un sistema RAG documental: el modelo recibe fragmentos recuperados de circulares regulatorias y contratos en turco y redacta respuestas citando el contexto; su tamano de 8B permite ejecutarlo en una sola GPU consumer junto al indice vectorial.
- Soporte interno para analistas: resumen y reformulacion de informes financieros turcos, con la ventaja de que el ajuste de dominio deberia reducir errores de terminologia frente a un modelo generalista.
- Clasificacion y enrutado de consultas financieras: preprocesado de tickets de clientes en turco para asignarlos a colas especializadas, usando el modelo en modo generacion corta con temperatura baja.
- Chatbot embebido en aplicaciones de finanzas personales: al ocupar 5,0 GB en Q4_K_M, puede distribuirse en equipos de escritorio o movil de gama alta con 8 GB de RAM unificada, sin conexion a internet.
- Prototipado rapido de producto en el nicho turco: al ser Apache 2.0 y formato GGUF, sirve para validar una idea de asistente financiero en turco antes de invertir en un modelo mayor o en un fine-tuning propio.
- Generacion de material divulgativo: explicaciones simplificadas de conceptos financieros en turco para blogs o boletines, siempre con revision humana por el riesgo de alucinacion en cifras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, Turkish MMLU ni ninguna otra) y los resultados de busqueda web proporcionados no contienen datos relacionados con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, segun cuantizacion (estimaciones a partir del recuento de parametros y del tamano del repositorio, no facilitadas por el autor):
  - Q4_K_M: aproximadamente 4,9-5,5 GB de pesos, mas cache KV; en la practica, entre 6 y 8 GB de VRAM con contexto moderado.
  - Q8_0 (no publicada en este repo): alrededor de 8,7 GB de pesos.
  - FP16/BF16 (no publicado en este repo): alrededor de 16,4 GB de pesos.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q4_K_M; A100 40 GB o H100 unicamente si se quiere servir en FP16 con lotes grandes.
- Cabe en GPU consumer: si, en cualquier tarjeta con 8 GB o mas de VRAM para Q4_K_M; tambien en Apple Silicon con 8-16 GB de memoria unificada.
- Opciones de despliegue: llama.cpp (referencia directa de la model card), Ollama, LM Studio, text-generation-webui, llama-cpp-python; vLLM solo si se convierte o soporta el formato GGUF concreto.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| QWEN3_EXPERT_V2_GGUF (Toxotes) | 8,19 B | No disponible | Turco | Apache 2.0 | GGUF (Q4_K_M) | Fine-tuning financiero turco; 0 descargas; sin benchmarks |
| Qwen3-8B (base, Alibaba) | ~8 B | 32.768 tokens nativos en el modelo base (no confirmado para este ajuste) | Multilingue | Apache 2.0 | safetensors, GGUF | Modelo generalista del que deriva; sin especializacion financiera |
| Alternativas de finanzas en turco | No disponible | No disponible | No disponible | No disponible | No disponible | No se han identificado modelos comparables en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados, por lo que la calidad real del ajuste financiero no esta verificada por terceros.
- Riesgo de alucinacion alto en cifras, tipos de interes, normativa y fechas: es un modelo de 8B ajustado sobre un corpus no documentado, y no se declara uso de recuperacion obligatoria ni de citas verificables.
- La model card no especifica la composicion del dataset de entrenamiento, el numero de tokens ni el proceso de alineacion, lo que impide auditar sesgos o cobertura.
- Solo se declara turco como idioma; el rendimiento en castellano u otros idiomas no esta documentado y no deberia asumirse a partir de la base Qwen3.
- Licencia Apache 2.0: permite uso comercial, pero el publicador no ofrece garantias sobre el contenido generado ni sobre la procedencia de los datos de ajuste; conviene revisar obligaciones de atribucion.
- La cuantizacion Q4_K_M introduce perdida de precision respecto al modelo original; no se ha publicado una comparacion entre cuantizaciones.
- El contexto maximo no esta documentado para este ajuste; asumir el del modelo base sin verificar puede provocar truncamientos silenciosos en produccion.
- En ambito financiero regulado (banca, seguros, asesoramiento), la salida del modelo no debe presentarse al usuario final sin supervision humana ni filtros de cumplimiento.
- Repositorio sin descargas ni interaccion: no hay evidencia de uso en produccion ni comunidad que reporte errores.
- Fecha de ultima actualizacion posterior a la de creacion; no se documenta que cambios se introdujeron.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Toxotes/QWEN3_EXPERT_V2_GGUF
- Perfil del autor: https://huggingface.co/Toxotes
- Proyecto MOSAIC-v2: mencionado en la model card, sin enlace disponible
- Paper, blog o repositorio del modelo: no disponible
- Resultados de benchmarks: no disponible
- Demo: no disponible
