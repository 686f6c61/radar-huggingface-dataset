# Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-W6A8-Vision

## Resumen

REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-W6A8-Vision es un checkpoint experimental publicado por el usuario Xananthium, derivado de google/gemma-4-26B-A4B-it y del ajuste terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF. Se trata de un transformer de arquitectura MoE con torre de vision, de 25.805.936.206 parametros totales, al que se le ha aplicado una edicion de tipo "abliteration" (etiquetada como Heretic en la model card) orientada a eliminar comportamientos de rechazo, y que se distribuye ya cuantizado en formato W6A8 (pesos de 6 bits, activaciones de 8 bits).

El problema que aborda es el de despliegue en hardware de gama alta de consumo: el checkpoint cuantizado ocupa 20,99 GiB frente a los 48,07 GiB de su fuente BF16 restaurada, lo que supone una reduccion del 56,3% en bytes de pesos y permite ejecutarlo con tensor parallelism sobre dos RTX 3090. El autor lo ha validado con vLLM 0.31.0, Torch 2.13.0 y el backend Humming 0.1.16, e incluye parsers de tool calling y de razonamiento de Gemma 4.

Su relevancia es acotada y hay que situarla con honestidad: el repositorio acumula 0 descargas y 0 likes en el momento de la consulta, esta marcado como experimental y la propia model card esta redactada como ficcion narrativa inspirada en *Parable of the Sower*, con muy poca documentacion tecnica verificable. No se han publicado resultados numericos de benchmarks en la informacion disponible, y la licencia declarada es Apache 2.0 pese a derivar de un modelo base de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) basado en Gemma 4, con torre de vision |
| Parametros totales | 25.805.936.206 (segun safetensors) |
| Parametros activos | no disponible (la nomenclatura "A4B" del modelo base sugiere del orden de 4.000 millones, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W6A8: pesos de 6 bits empaquetados, activaciones INT8 dinamicas por token, grupos de 32 pesos, formato compressed-tensors; embeddings, routers, normas y vision en BF16; NF4 en la comparativa de investigacion |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada para este derivado) |
| Formato de pesos | safetensors (libreria vllm); existe un derivado GGUF en el modelo base |

Otros datos: tamano del repositorio 22,7 GB, checkpoint W6A8 de 20,99 GiB, fuente BF16 restaurada de 48,07 GiB, 11.725 proyecciones lineales cuantizadas, creado y actualizado el 14 de octubre de 2026, 0 descargas y 0 likes, region us.

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) heredado de google/gemma-4-26B-A4B-it, con 25.805.936.206 parametros totales y una torre de vision que, segun la model card, permanece en BF16 tras la cuantizacion, igual que los embeddings, los routers y las normas. La cuantizacion W6A8 empaqueta los pesos en 6 bits y los descomprime para operaciones matriciales INT8, con activaciones INT8 dinamicas por token y agrupacion de 32 pesos; afecta a 11.725 proyecciones lineales. La precision de la cache KV es un ajuste de servicio independiente y en las pruebas del piloto se uso KV en BF16.

Sobre el entrenamiento no hay informacion verificable: se sabe que el modelo parte del ajuste OSINT-Cyber de terrorswift y de Gemma 4, y que se le ha aplicado una edicion de abliteration (denominada Heretic) mediante un adaptador que se fusiona en la fuente BF16 restaurada. El numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO y cualquier innovacion de atencion no se detallan en la informacion disponible. La model card menciona scripts en `research/`, un plugin de compatibilidad de compilacion de Humming en `runtime/` y una tabla de mediciones de ocho ensayos del 14 de octubre de 2026 que compara el REDCELL original en NF4, la edicion Heretic en NF4 y el W6A8 en vLLM, pero los valores numericos no aparecen en el extracto disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline declarado de text-generation.
- Razonamiento: incluye el parser de razonamiento de Gemma 4 segun la model card.
- Tool calling y function calling: soportado mediante el parser de herramientas de Gemma 4 integrado en el despliegue con vLLM.
- Vision: el checkpoint conserva la torre de vision sin cuantizar, por lo que mantiene entrada de imagenes.
- Dominio OSINT y ciberseguridad: ajuste especifico del modelo base REDCELL-26B-A4B-OSINT-Cyber-APEX.
- Comportamiento de rechazo alterado por abliteration (etiqueta "heretic" y "abliteration"): el modelo responde a peticiones que un modelo alineado rechazaria.
- Idiomas: unicamente ingles declarado.
- Despliegue: compatible con tensor parallelism, backends lineales y MoE de Humming y atencion Triton en vLLM 0.31.0.

## Casos de uso

- Analisis de informacion OSINT: agregar y resumir grandes volumenes de texto en ingles procedente de fuentes abiertas, usando el contexto de conversacion multi-turno para refinar hipotesis sobre un objetivo o un actor.
- Triaje de alertas de seguridad: ingerir logs, reglas YARA o alertas SIEM en ingles y producir resumentes priorizados, con el modelo ejecutandose localmente para no enviar datos sensibles a terceros.
- Correlacion de indicadores de compromiso: extraer y normalizar IP, dominios y hashes de informes, y generar tablas de IOCs accionables para su carga en una plataforma de defensa.
- Analisis de capturas y diagramas en un SOC: gracias a la torre de vision, procesar capturas de pantalla de paneles, diagramas de red o imagenes de consola y describir la informacion relevante.
- Redaccion de informes de amenazas: generar borradores de threat intelligence en ingles a partir de notas internas, con estructura de informe tecnico.
- Automatizacion de tareas de seguridad con agentes: usar el tool calling de Gemma 4 para encadenar consultas a APIs de reputacion, bases de datos de vulnerabilidades o scripts propios en un flujo multi-paso.
- Documentacion y traduccion tecnica interna: resumir papers, CVEs y avisos en ingles para equipos que trabajan en ese idioma, manteniendo el contenido en un entorno autoalojado.
- Investigacion sobre abliteration: servir como objeto de estudio para medir como la eliminacion de direcciones de rechazo afecta a utilidad, calibracion y seguridad en un MoE con vision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una tabla de mediciones de ocho ensayos (14 de octubre de 2026) con las columnas "Original REDCELL, NF4", "Heretic edit, NF4" y "Heretic W6A8, vLLM", pero el extracto proporcionado se corta antes de incluir cifra alguna, y no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar. Tampoco se ofrecen medidas de latencia o throughput.

## Requisitos de hardware

- Peso del checkpoint W6A8: 20,99 GiB, frente a 48,07 GiB de la fuente BF16 restaurada (56,3% menos bytes de pesos).
- VRAM estimada: no disponible de forma oficial. Con pesos de ~21 GiB mas cache KV en BF16 y activaciones, el margen en una GPU de 24 GB es muy escaso; se recomienda al menos 2x24 GB con tensor parallelism o una unica GPU de 48/80 GB.
- Configuracion validada por el autor: dos RTX 3090 (24 GB cada una) con tensor parallelism, backends lineales y MoE de Humming y atencion Triton.
- GPU recomendadas: 2x RTX 3090, 2x RTX 4090, A100 80 GB, H100; una A6000 de 48 GB o similar seria suficiente en cuanto a memoria, aunque no esta confirmado en la informacion.
- GPU de consumo: cabe en dos RTX 3090 o dos RTX 4090; en una unica GPU de 24 GB es improbable que quepa con cache KV en BF16.
- Opciones de despliegue: vLLM 0.31.0 con Torch 2.13.0 y Humming 0.1.16 (ruta validada), con parsers de tool y de razonamiento de Gemma 4. Existe un GGUF del modelo base REDCELL-26B-A4B-OSINT-Cyber-APEX, pero no se confirma compatibilidad con llama.cpp u Ollama para este checkpoint W6A8 concreto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-W6A8-Vision (este) | 25.805.936.206 | no disponible | W6A8, W6A8 con embeddings/routers/norms/vision en BF16 | si | apache-2.0 | safetensors (vLLM) |
| Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision | no disponible (pesos de 48,07 GiB) | no disponible | BF16 | si | no disponible | safetensors |
| terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF | no disponible | no disponible | GGUF (cuantizaciones no disponibles) | no disponible | no disponible | GGUF |
| google/gemma-4-26B-A4B-it | no disponible en la informacion proporcionada | no disponible | BF16 como base | no disponible | no disponible | safetensors |

No se dispone de datos de rendimiento comparativo entre estas variantes, por lo que la comparativa se limita a formato, tamano y licencia. Modelos alternativos de la misma categoria (MoE abiertos de ~25B con vision y tool calling) no estan identificados en la informacion disponible.

## Limitaciones y advertencias

- Abliteration: la edicion Heretic elimina deliberadamente las direcciones de rechazo, de modo que el modelo puede generar contenido danino, operaciones ofensivas o material ilicito. No es apto para uso en produccion sin capas de filtrado propias.
- Riesgo elevado de alucinacion: no hay evaluaciones publicadas de fidelidad, calibracion ni tasas de error; la model card carece de datos verificables.
- Idioma: solo se declara ingles ("en"). El rendimiento en castellano o en otros idiomas no esta documentado.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar cargas de trabajo con documentos largos.
- Licencia: el derivado declara apache-2.0, pero el modelo base es de Google y arrastra sus propios terminos de uso; conviene revisar la compatibilidad antes de un uso comercial.
- Naturaleza experimental: 0 descargas y 0 likes en el momento de la consulta, publicacion bajo etiqueta "experimental" y model card sin resultados numericos.
- Vision en BF16: la torre de vision no esta cuantizada, por lo que no se beneficia de la reduccion de memoria y puede dominar el coste en escenarios con imagenes.
- Compatibilidad de runtime: la ruta validada exige versiones concretas (vLLM 0.31.0, Torch 2.13.0, Humming 0.1.16), lo que reduce la portabilidad y complica el mantenimiento.
- Uso previsto sensible: el ajuste esta orientado a OSINT y ciberseguridad; su uso fuera de entornos autorizados puede infringir legislacion de acceso a sistemas, proteccion de datos o vigilancia.
- Riesgo de sesgos: no se ha publicado ninguna evaluacion de sesgo, toxicidad o representacion para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-W6A8-Vision
- Edicion BF16 del mismo autor: https://huggingface.co/Xananthium/REDCELL-26B-A4B-OSINT-Cyber-Abliterated-Pilot-BF16-Vision
- Modelo base cuantizado: https://huggingface.co/terrorswift/REDCELL-26B-A4B-OSINT-Cyber-APEX-GGUF
- Modelo base original: https://huggingface.co/google/gemma-4-26B-A4B-it
- Directorio de scripts del experimento: `research/` dentro del repositorio del modelo
- Plugin de compatibilidad de compilacion de Humming: `runtime/` dentro del repositorio del modelo
- Referencia de la cita literaria usada en la model card: https://www.penguinrandomhouse.com/the-read-down/black-authors-on-their-favorite-books-by-black-authors/
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
