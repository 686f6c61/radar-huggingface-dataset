# ToastyPigeon/gemma-4-12b-cpt-rp-chapters-adapter

## Resumen

ToastyPigeon/gemma-4-12b-cpt-rp-chapters-adapter es un adaptador LoRA de rango 32 (r32) publicado por el usuario ToastyPigeon en HuggingFace. No es un modelo autónomo: se trata de un ajuste supervisado (SFT) que debe aplicarse sobre ToastyPigeon/gemma-4-12b-full-cpt, un modelo intermedio construido a partir de google/gemma-4-12B mediante un proceso de continued pre-training (CPT) con plegado de LoRA. El adaptador está pensado para generación de prosa y roleplay por capítulos, segun se deduce del nombre y de los datos de entrenamiento declarados.

El entrenamiento del adaptador se realizó sobre una mezcla de 12.746 conversaciones con contexto de sistema (itvec-mix-sft-sys) más un conjunto denominado "marvin chapters v1", usando la plantilla de chat de Gemma durante 1 epoch y 693 pasos. El resultado es un adaptador orientado a continuar texto narrativo y a mantener conversaciones con voz de personaje, no un modelo de propósito general ni un asistente instructivo validado.

Su relevancia es limitada y de nicho: se publica como pieza experimental dentro de una cadena de derivados (base CPT, adaptador SFT, merge con task vector instructivo) y no cuenta con descargas, valoraciones ni resultados de evaluación publicados. La información disponible sobre licencia, idiomas, contexto y rendimiento es incompleta, por lo que cualquier uso en producción exige verificación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre un modelo base derivado de google/gemma-4-12B. El informe tecnico de Gemma 4 describe un paradigma unificado sin codificadores, con modulos de proyeccion ligeros en lugar de codificadores de vision y audio separados |
| Parametros totales | No disponible para el adaptador. El modelo base se denomina "12B" (aproximadamente 12 000 millones), sin confirmacion explicita en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. Los pesos del adaptador se distribuyen en safetensors sin variantes cuantizadas documentadas |
| Idiomas soportados | No disponible |
| Licencia | No disponible. No se especifica en la model card ni en los metadatos de HuggingFace |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, requiere fusion con el modelo base) |
| Libreria | peft |
| Modelo base | ToastyPigeon/gemma-4-12b-full-cpt |
| Tamano del repositorio | 0,5 GB |
| Rango de LoRA | 32 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango 32 con etiquetas que mencionan peft, mergekit y lora, lo que sugiere que el flujo de trabajo combina plegado de adaptadores y fusiones de pesos. La model card indica que se trata de un "SFT LoRA on the full-CPT base (google/gemma-4-12B + CPT LoRA fold)", es decir, un ajuste supervisado aplicado sobre un modelo que a su vez integró un adaptador de continued pre-training. La documentacion del modelo base advierte explicitamente de que este es un adaptador CPT, no un modelo instruct/chat, y que debe esperarse comportamiento de completion en bruto.

Los datos de entrenamiento declarados son itvec-mix-sft-sys (12.746 conversaciones con contexto de sistema) junto con "marvin chapters v1", todo formateado con la plantilla de chat de Gemma, durante 1 epoch y 693 pasos. No se documentan fases de RLHF, DPO ni decodificacion especulativa. La informacion sobre el proceso de CPT subyacente remite a cpt_meta.json y adapter_config.json en el repositorio del modelo base, que no forman parte de los datos proporcionados aqui. El informe tecnico de Gemma 4 describe para la familia una arquitectura unificada y sin codificadores, con modulos de proyeccion ligeros, pero no se confirma que este adaptador herede ni explote dichas capacidades multimodales.

## Capacidades

- Generacion de texto narrativo y prosa por capitulos, segun el nombre y los datos de entrenamiento declarados ("marvin chapters v1").
- Roleplay y dialogo con voz de personaje, con soporte de contexto de sistema en las conversaciones (el conjunto itvec-mix-sft-sys incluye system context).
- Continuacion de texto en modo completion, heredado del comportamiento del modelo base CPT.
- Conversaciones multi-turno bajo la plantilla de chat de Gemma.
- Capacidad de actuar como punto de partida para fusiones adicionales o nuevos fine-tunes de estilo, dado su formato de adaptador.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision ni audio para este adaptador.
- No se documenta soporte multilingue ni lista de idiomas.

## Casos de uso

- Roleplay conversacional de largo recorrido: el adaptador esta entrenado con conversaciones que incluyen contexto de sistema, lo que permite fijar una ficha de personaje y mantener su voz a lo largo de multiples turnos de dialogo.
- Escritura de ficcion por capitulos: el conjunto de datos "marvin chapters v1" apunta a generacion de texto narrativo extenso, por lo que encaja en flujos de redaccion asistida de novelas o seriales.
- Continuacion de texto creativo: al estar construido sobre una base CPT no instructiva, es adecuado para autocompletado de parrafos y sugerencias de continuidad estilistica mas que para respuestas a instrucciones cerradas.
- Generacion de dialogos para videojuegos o juegos de rol de mesa: permite producir replicas de personajes con un tono consistente, siempre que se fije el contexto de sistema adecuado.
- Investigacion sobre cadenas CPT + SFT: sirve como caso de estudio reproducible de como un adaptador LoRA de rango 32 sobre una base CPT modifica el comportamiento de completion hacia prosa y dialogo.
- Base para nuevos fine-tunes o merges: al ser un adaptador ligero (0,5 GB), es barato de fusionar con task vectors instructivos u otros adaptadores, siguiendo el patron ya aplicado en la familia (por ejemplo, la variante itvec).
- Generacion de datos sinteticos de dialogo: puede emplearse para producir corpus de conversaciones con estilo marcado que despues se filtren y reutilicen en etapas posteriores de entrenamiento.
- Prototipado de asistentes con personalidad: util para demos internas donde prima el tono y la coherencia estilistica por encima de la precision factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Tamano del adaptador: 0,5 GB en safetensors. Requiere el modelo base completo para funcionar.
- El adaptador no puede ejecutarse de forma autonoma: es imprescindible descargar ToastyPigeon/gemma-4-12b-full-cpt (o fusionar el adaptador en el) antes de la inferencia.
- VRAM estimada para el modelo base de aproximadamente 12 000 millones de parametros (estimacion a partir del tamano, no confirmada en la informacion disponible): en torno a 24 GB en fp16, 12-13 GB en int8 y 6-8 GB en cuantizacion de 4 bits.
- GPU recomendadas para fp16: A100 (40/80 GB), H100, L40S o varias GPU consumer con memoria agregada suficiente.
- GPU consumer: cabe en RTX 4090 o RTX 3090 (24 GB) en cuantizacion de 4 bits o int8; en tarjetas de 12 GB requeriria cuantizaciones mas agresivas y una ventana de contexto reducida.
- Opciones de despliegue: transformers junto con peft para cargar el adaptador sin fusionar; vLLM o TGI tras fusionar los pesos; llama.cpp u Ollama tras convertir el modelo fusionado a GGUF. La informacion disponible no confirma compatibilidad verificada con ninguna de estas herramientas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-12b-cpt-rp-chapters-adapter | Adaptador LoRA r32 sobre base de ~12B (no confirmado) | No disponible | Sin benchmarks publicados | No disponible | 0 descargas, 0 likes |
| ToastyPigeon/gemma-4-12b-full-cpt (base) | ~12B (no confirmado) | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | Repositorio publico en HuggingFace |
| ToastyPigeon/gemma-4-12b-full-cpt-itvec | ~12B (no confirmado) | No disponible | Sin benchmarks publicados en la informacion disponible | No disponible | Repositorio publico; descrito como merge de CPT con task vector instructivo |
| google/gemma-4-12B | ~12B (Gemma 4 12B Unified) | No disponible en la informacion proporcionada | Documentado en el informe tecnico de Gemma 4 (no consultado en detalle) | No disponible en la informacion proporcionada | Publicado por Google; anunciado el 3 de junio de 2026 |

## Limitaciones y advertencias

- El adaptador no es un modelo autonomo: sin el modelo base no produce ninguna salida utilizable.
- El modelo base es un adaptador de continued pre-training, no un modelo instruct ni chat; la documentacion del autor advierte de comportamiento de completion en bruto.
- Ausencia total de evaluacion: 0 descargas, 0 likes y ningun benchmark publicado, por lo que no existe evidencia externa de calidad, coherencia o seguridad.
- Riesgo elevado de alucinacion en contextos factuales, ya que el entrenamiento esta orientado a prosa y dialogo, no a precision verificable.
- Licencia no especificada: no puede asumirse uso comercial sin consultar la licencia del modelo base y la de google/gemma-4-12B, que no se detalla en la informacion disponible.
- Origen de los datos de entrenamiento parcialmente opaco: el conjunto "marvin chapters v1" no se describe, lo que impide evaluar posibles problemas de derechos de autor o de sesgo en el corpus.
- Idiomas soportados no declarados; el comportamiento multilingue es incierto.
- Longitud de contexto no documentada; no es posible planificar cargas de contexto largo sin verificacion empirica.
- Al ser un adaptador de rango 32 sobre una base CPT experimental, la estabilidad de la plantilla de chat de Gemma no esta garantizada una vez fusionado.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no debe integrarse en pipelines automatizados que dependan de ellas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ToastyPigeon/gemma-4-12b-cpt-rp-chapters-adapter
- Modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt
- README del modelo base: https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt/blob/main/README.md
- Variante itvec del modelo base (featherless.ai): https://featherless.ai/models/ToastyPigeon/gemma-4-12b-full-cpt-itvec
- Informe tecnico de Gemma 4: https://arxiv.org/html/2607.02770v2
- Notas de version de Gemma (Google AI for Developers): https://ai.google.dev/gemma/docs/releases
