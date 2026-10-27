# tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF

## Resumen

Esta ficha cubre `lfm2.5-2.6b-fable5-coding-agent-GGUF`, un repositorio de cuantizaciones GGUF publicado por el usuario tinyopsec a partir del modelo `AyoubChLin/lfm2.5-2.6b-fable5-coding-agent`. Este, a su vez, es un ajuste fino (SFT de parametros completos) orientado a agentes de programacion construido sobre `LiquidAI/LFM2.5-2.6B`, el modelo denso de 2,7 B parametros de Liquid AI disenado para cargas de trabajo agenticas con ventana de contexto de 131K tokens y tool calling nativo.

El valor del repositorio esta en su portabilidad: ofrece 13 cuantizaciones distintas (de F16 a Q2_K) producidas con llama.cpp, lo que permite ejecutar el modelo en portatiles, mini-PC y GPUs de consumo. El modelo base se promociona como capaz de planificar, llamar herramientas y ejecutar tareas multi-paso a 220 tok/s ocupando menos de 2,5 GB, lo que lo situa en la categoria de modelos agenticos on-device.

Es relevante porque los agentes de codigo pequenos y autoalojados son una tendencia creciente: permiten automatizar tareas de desarrollo sin depender de APIs de pago ni enviar codigo a la nube. Conviene tener en cuenta que se trata de un checkpoint comunitario sin evaluaciones publicadas, cuyo propio autor advierte que debe evaluarse antes de usarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida (bloques convolucionales de alcance corto + bloques de atencion), densa, familia LFM2.5 de Liquid AI |
| Parametros totales | 2.697.198.592 (≈2,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens (131K, heredada del modelo base) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (13 ficheros cuantizados; tamano total del repositorio: 26,3 GB) |

## Arquitectura y entrenamiento

El modelo base, LFM2.5-2.6B, pertenece a la familia Liquid Foundation Models (LFM) de Liquid AI. Emplea una arquitectura hibrida densa que combina bloques convolucionales de alcance corto con bloques de atencion agrupada, un diseno pensado para inferencia eficiente en dispositivos de borde. Segun la documentacion oficial, es un modelo de razonamiento que "siempre piensa antes de responder" (emite un bloque de razonamiento previo a la respuesta final) y esta entrenado para funcionar de forma fiable dentro de harnesses de agentes como Hermes Agent, OpenClaw o Pi, con soporte nativo de tool calling.

Sobre este base se aplico un ajuste fino SFT de parametros completos (full-finetune) especializado en tareas de agente de codigo, segun indica la model card. No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre el uso de tecnicas posteriores como RLHF o DPO: no disponible. Las cuantizaciones GGUF fueron generadas con llama.cpp.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta conversational).
- Comportamiento como agente de codigo: planificacion de tareas, uso de herramientas (tool-use) y ejecucion de tareas multi-paso.
- Razonamiento previo a la respuesta (thinking mode heredado del modelo base, que siempre razona antes de contestar).
- Tool calling nativo, entrenado para integrarse en harnesses de agentes (Hermes Agent, OpenClaw, Pi).
- Ventana de contexto de 131K tokens, util para trabajar con bases de codigo o documentos extensos.
- Ejecucion local via llama.cpp y runtimes GGUF compatibles (Ollama, LM Studio, koboldcpp).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponibles.

## Casos de uso

- **Agente de programacion local en CLI o editor:** gracias al tool calling nativo y al SFT especifico en agentes de codigo, puede integrarse en harnesses como Hermes Agent u OpenClaw para leer ficheros, ejecutar comandos y editar codigo sin salir de la maquina local.
- **Automatizacion de tareas multi-paso:** el modelo base esta optimizado para planificar y encadenar llamadas a herramientas, por lo que sirve para flujos tipo "buscar en el repositorio, aplicar un cambio, ejecutar tests e informar del resultado".
- **Revision de codigo y pull requests grandes:** la ventana de 131K tokens permite cargar ficheros largos o conjuntos de diffs completos en contexto antes de pedir analisis o refactorizaciones.
- **Despliegue en dispositivos de borde:** con cuantizaciones Q4 ocupa en torno a 1,7 GB y el modelo base se promociona a 220 tok/s en menos de 2,5 GB, lo que lo hace viable en portatiles, mini-PC o SBCs sin GPU dedicada.
- **Prototipado de agentes sin coste de API:** al ser pesos abiertos ejecutables con Ollama o LM Studio, permite experimentar con bucles agenticos sin gastar tokens de pago ni exponer codigo propietario a servicios externos.
- **Chatbot de soporte tecnico interno autoalojado:** su tamano reducido y el formato GGUF facilitan montar un asistente conversacional con acceso a herramientas en infraestructura propia, util cuando la privacidad del codigo es un requisito.
- **Integracion en pipelines de CI/CD:** puede emplearse como paso automatizado para generar mensajes de commit, documentacion o casos de test a partir del diff, ejecutandose en el runner si este dispone de al menos 2-3 GB de memoria.
- **Generacion y depuracion de codigo en hardware modesto:** la cuantizacion Q4_K_M (recomendada por el autor) ofrece un equilibrio entre calidad y huella que cabe en GPUs de 4-6 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este ajuste fino (ni MMLU, HumanEval, GSM8K ni metricas agenticas). El unico dato de rendimiento disponible procede del anuncio del modelo base por parte de Liquid AI: 220 tok/s de throughput en menos de 2,5 GB de huella para cargas agenticas. No hay comparativas publicadas contra otros modelos para este checkpoint concreto, por lo que no se pueden citar numeros sin inventarlos.

## Requisitos de hardware

- **VRAM/RAM estimada para inferencia** (tamano aproximado del fichero GGUF para 2,7 B parametros; valores orientativos):
  - F16: 5,2 GB (dato de la model card) — recomendables 6-8 GB de memoria.
  - Q8_0: ≈2,9 GB.
  - Q6_K: ≈2,3 GB.
  - Q5_K_M / Q5_K_S: ≈1,9-2,0 GB.
  - Q4_K_M / Q4_K_S / Q4_0: ≈1,6-1,7 GB (Q4_K_M es la recomendada por el autor).
  - Q3_K_L/M/S: ≈1,4-1,5 GB.
  - Q2_K: ≈1,1 GB (calidad notablemente degradada).
- **GPU recomendadas:** cualquier GPU moderna de consumo es suficiente; con Q4_K_M caben en tarjetas de 4 GB, y con holgura en RTX 3060 12 GB, RTX 4060 8 GB o RTX 4090. La inferencia solo por CPU tambien es viable dado el tamano reducido.
- **Consumer GPUs:** si, es uno de los puntos fuertes del modelo; Liquid AI indica que el base funciona en dispositivos de borde con menos de 2,5 GB.
- **Opciones de despliegue:** llama.cpp (comando de ejemplo en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se menciona soporte para vLLM o TGI en este repositorio (al ser GGUF, la via natural es el ecosistema llama.cpp).
- **Latencia y throughput:** el modelo base se promociona a 220 tok/s en dispositivos de borde segun Liquid AI; no hay mediciones publicadas para este ajuste fino ni para hardware concreto: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| LFM2.5-2.6B (base de este ajuste) | 2,7 B (denso) | 131K | LFM Open License v1.0 | Agente on-device, tool calling nativo, razonamiento |
| Qwen2.5-Coder-3B-Instruct | 3,1 B | 32K (ampliable a 128K con YaRN) | Apache 2.0 | Especializado en codigo |
| Phi-4-mini-instruct (3.8B) | 3,8 B | 128K | MIT | Uso general con razonamiento |

Comparacion qualitativa: frente a Qwen2.5-Coder-3B, este modelo ofrece una ventana de contexto mucho mayor de serie y un entrenamiento explicito para bucles agenticos con herramientas, mientras que el modelo de Qwen tiene una licencia mas permisiva (Apache 2.0) y un historial de benchmarks publicados en tareas de codigo. Frente a Phi-4-mini, la ventaja esta en la orientacion agenticay en la eficiencia de la arquitectura hibrida; la desventaja, en la madurez y trazabilidad de las evaluaciones. No hay numeros de benchmark que permitan una comparacion cuantitativa directa: no disponible.

## Limitaciones y advertencias

- **Checkpoint comunitario sin validacion publica:** el ajuste fino no publica benchmarks, tiene 0 descargas y 0 likes en el momento de redactar la ficha, y la propia model card incluye el aviso "Coding-agent checkpoint. Evaluate before use". No se recomienda uso en produccion sin evaluacion propia.
- **Riesgo de alucinacion:** tipico de modelos de ~2,7 B parametros, agravado en tareas de codigo donde errores sintacticos o APIs inventadas son frecuentes en modelos pequenos. Mantener supervision humana o validacion por tests.
- **Cuantizaciones agresivas:** Q2_K y la familia Q3 degradan sensiblemente la calidad, especialmente en generacion de codigo; priorizar Q4_K_M o superior.
- **Licencia no estandar:** la licencia es LFM Open License v1.0 (etiqueta "other"), no Apache 2.0 ni MIT; revisar sus terminos antes de cualquier uso comercial. Ademas, existe una discrepancia: el repositorio GGUF del autor original (AyoubChLin) aparece etiquetado como apache-2.0, mientras que este repositorio declara LFM Open License v1.0; conviene aclarar la licencia aplicable antes de desplegar.
- **Idiomas:** las capacidades multilingues no estan documentadas para este ajuste fino; el rendimiento en castellano no esta garantizado y probablemente el modelo este optimizado para ingles.
- **Contexto largo:** aunque la ventana es de 131K tokens, no hay datos publicados sobre la calidad del modelo en posiciones lejanas del contexto; verificar empiricamente en casos de uso con repositorios grandes.
- **Thinking mode:** al ser un modelo que siempre razona antes de responder, consume tokens adicionales por respuesta, lo que reduce el contexto util y aumenta la latencia percibida en respuestas cortas.

## Enlaces

- Repositorio de esta ficha (GGUF): https://huggingface.co/tinyopsec/lfm2.5-2.6b-fable5-coding-agent-GGUF
- Modelo original ajustado (safetensors): https://huggingface.co/AyoubChLin/lfm2.5-2.6b-fable5-coding-agent
- Repositorio GGUF alternativo del autor original: https://huggingface.co/AyoubChLin/LFM2.5-2.6B-fable5-coding-agent-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Blog oficial de Liquid AI sobre LFM2.5-2.6B: https://www.liquid.ai/blog/lfm2-5-2-6b
- Documentacion oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-2.6b
- Ficha en LLM Explorer: https://llm-explorer.com/model/AyoubChLin%2Flfm2.5-2.6b-fable5-coding-agent,2Mhb3ILfg1Hy4HpJEryJjc
