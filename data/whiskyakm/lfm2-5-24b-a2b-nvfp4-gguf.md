# WhiskyAKM/LFM2.5-24B-A2B-NVFP4-GGUF

## Resumen

LFM2.5-24B-A2B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Liquid AI, disenado especificamente para tareas de razonamiento y uso de herramientas (tool use) en entornos de agente. Con 24.000 millones de parametros totales pero solo unos 2.450 millones activos por token, el modelo busca ofrecer la calidad de un modelo grande con el coste computacional de uno pequeno, lo que lo hace apto para inferencia en dispositivo (on-device) y despliegues con recursos limitados.

La arquitectura LFM2.5 combina 30 bloques de convolucion corta con doble compuerta (double-gated short convolution) y 10 bloques de atencion con query agrupada (GQA), lo que se aleja del transformer clasico y reduce el coste de atencion en contextos largos. El modelo soporta una ventana de contexto de 131.072 tokens y fue entrenado con 36 billones de tokens, con un vocabulario de 128.000 entradas y cobertura de 16 idiomas.

Esta ficha describe la version cuantizada a NVFP4 en formato GGUF publicada por WhiskyAKM, que permite ejecutar el modelo con llama.cpp y motores compatibles, con aceleracion especifica en GPUs NVIDIA Blackwell. Es relevante ahora porque compite en tareas agenticas con modelos de mayor tamano (como Qwen3.6-35B-A3B) manteniendo un coste de inferencia bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (Mixture of Experts; 30 bloques de convolucion corta con doble compuerta + 10 bloques GQA) |
| Parametros totales | 23.971.587.712 (~24,0B) |
| Parametros activos | ~2,45B |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (formato de coma flotante de 4 bits E2M1); el repo solo incluye este formato |
| Idiomas soportados | Ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso, polaco |
| Licencia | lfm1.0 (licencia propia de Liquid AI, marcada como "other") |
| Formato de pesos | GGUF (un unico fichero `lfm2.5-24b-a2b-nvfp4.gguf`); el modelo base original esta en otros formatos no especificados en esta ficha |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida LFM2.5 en la que la mayor parte de las capas (30 de 40) son bloques de convolucion corta con doble compuerta en lugar de atencion, y solo 10 capas usan atencion con query agrupada (GQA). Esta combinacion reduce el coste computacional y de memoria en secuencias largas frente a un transformer denso equivalente. La capa MoE cuenta con 64 expertos por bloque y enrutamiento top-4, lo que explica que de los 24.000 millones de parametros totales solo se activen aproximadamente 2.450 millones por token.

El entrenamiento se realizo con un presupuesto de 36 billones de tokens y un vocabulario de 128.000 entradas. La model card indica que el modelo "siempre piensa antes de responder" (reasoning mode por defecto), aunque no se detalla en la informacion disponible si hubo fases de RLHF, DPO u otras tecnicas de alineacion posteriores al preentrenamiento. La version descrita aqui es una conversion a NVFP4 realizada por un tercero (WhiskyAKM) a partir del modelo base oficial, usando imatrix segun las etiquetas del repositorio.

## Capacidades

- Generacion de texto y razonamiento paso a paso con modo de pensamiento activado por defecto.
- Uso de herramientas (tool calling / function calling), con rendimiento destacado en tareas agenticas segun el autor.
- Razonamiento multi-paso y flujos de agente, orientado a ejecucion en dispositivo.
- Capacidades multilingues en 16 idiomas, incluidos espanol, arabe, chino, hindi y ruso.
- Inferencia eficiente gracias al bajo numero de parametros activos por token.
- Compatibilidad con llama.cpp (CLI y servidor con API compatible con OpenAI).
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Agentes autonomos en dispositivo: el modelo puede ejecutar bucles de razonamiento y llamadas a herramientas con solo ~2,45B parametros activos, lo que permite desplegarlo en portatiles o estaciones de trabajo sin GPU de datacenter.
- Atencion al cliente automatizada: con 131.072 tokens de contexto puede mantener conversaciones multi-turno largas y consultar historiales extensos o documentacion de soporte en una sola ventana.
- Asistente de codigo integrado en IDE: el soporte de tool calling permite invocar funciones del editor, ejecutar tests o consultar repositorios, y su bajo coste por token hace viable la generacion continua en local.
- Procesamiento de documentos multilingues: al cubrir 16 idiomas puede resumir, extraer y clasificar documentacion en espanol, ingles, aleman, arabe o chino dentro del mismo pipeline.
- Automatizacion de flujos RPA con agentes: el modelo puede planificar pasos, invocar APIs y validar resultados en entornos donde la privacidad exige no enviar datos a la nube.
- Prototipado rapido de aplicaciones LLM: mediante `llama-server` se expone una API compatible con OpenAI, lo que facilita integrarlo en frameworks existentes sin reescribir el codigo de cliente.
- Razonamiento sobre bases de conocimiento largas: su contexto de 131k tokens permite analisis de contratos, informes o expedientes completos sin troceado agresivo.

## Benchmarks y rendimiento

La model card del repositorio incluye un unico dato comparativo:

| Benchmark | LFM2.5-24B-A2B | Qwen3.6-35B-A3B |
|---|---|---|
| LiveClaw | 48,09 | 38,19 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar. El autor afirma ademas que el modelo corre hasta 1,7 veces mas rapido que MoEs comparables en dispositivo, pero no se aportan mediciones detalladas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: al estar cuantizado en NVFP4 (4 bits), el peso del modelo ronda los 12-14 GB, aunque la cifra exacta no se especifica en la informacion disponible.
- GPU recomendadas: NVIDIA Blackwell (por la aceleracion nativa de NVFP4 en llama.cpp); en otras arquitecturas el formato puede no estar acelerado y requerir conversion o decodificacion por software.
- Cabe en GPU de consumo con 16 GB o mas de VRAM, como RTX 4080/4090 o superiores, siempre que el motor soporte NVFP4 de forma eficiente.
- Opciones de despliegue: llama.cpp (CLI `llama-cli` y servidor `llama-server` con API compatible con OpenAI); otros motores GGUF no se mencionan en la informacion disponible.
- Parametros de generacion recomendados: temperature 0,1, top-k 50 y repetition penalty 1,05.
- Latencia y throughput estimados: no disponibles mas alla de la afirmacion de hasta 1,7x mas rapido que MoEs comparables.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Benchmark LiveClaw | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B (esta ficha, NVFP4 GGUF) | 24,0B / ~2,45B | 131.072 | 48,09 | lfm1.0 | GGUF |
| Qwen3.6-35B-A3B | ~35B / ~3B (segun model card) | no disponible | 38,19 | no disponible | no disponible |
| Otros MoE de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion publicada es frente a Qwen3.6-35B-A3B, que segun el autor tiene aproximadamente un 50% mas de parametros totales y activos. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia lfm1.0: es una licencia propia de Liquid AI, no una licencia open source estandar; es necesario revisar sus terminos antes de un uso comercial.
- El repositorio es una cuantizacion de terceros (WhiskyAKM), no una publicacion oficial de Liquid AI; la calidad de la cuantizacion NVFP4 puede diferir del modelo original en precision completa.
- NVFP4 esta optimizado para GPUs NVIDIA Blackwell; en hardware sin soporte nativo el rendimiento puede degradarse o requerir conversion.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento largo y uso de herramientas.
- El modo de razonamiento siempre activo puede incrementar el numero de tokens generados y, por tanto, la latencia en respuestas simples.
- No se documentan en la informacion disponible sesgos especificos ni evaluaciones de seguridad.
- Solo se distribuye un unico fichero GGUF en NVFP4; no hay variantes en otros niveles de cuantizacion en este repositorio.
- La cobertura de 16 idiomas no garantiza el mismo rendimiento en todos ellos; no se aportan metricas por idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/WhiskyAKM/LFM2.5-24B-A2B-NVFP4-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Blog de Liquid AI: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B/blob/main/LICENSE
- llama.cpp: https://github.com/ggerganov/llama.cpp
