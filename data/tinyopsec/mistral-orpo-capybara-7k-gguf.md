# tinyopsec/mistral-orpo-capybara-7k-GGUF

## Resumen
Esta ficha describe `tinyopsec/mistral-orpo-capybara-7k-GGUF`, una coleccion de cuantizaciones GGUF del modelo `kaist-ai/mistral-orpo-capybara-7k`, desarrollado por el grupo KAIST AI. El modelo base es un ajuste fino de Mistral-7B-v0.1 mediante ORPO (Odds Ratio Preference Optimization) sobre el dataset Capybara DPO, una tecnica que unifica el ajuste supervisado y la optimizacion de preferencias en una sola etapa sin modelo de referencia. El resultado es un modelo conversacional de 7.241.732.096 parametros orientado a instrucciones en ingles.

La relevancia de esta publicacion es practica: el autor `tinyopsec` ofrece once variantes de cuantizacion entre 2 y 16 bits, lo que permite ejecutar el modelo desde una GPU de consumo modesta (Q4_K_M ocupa unos 3,8 GB) hasta configuraciones de mayor calidad en F16. Esto democratiza el acceso a un modelo afinado con preferencias, manteniendo la licencia MIT del modelo base.

Arquitectonicamente hereda el transformer decoder-only denso de Mistral-7B-v0.1, con 7.2 mil millones de parametros y una ventana de contexto nativa de 2048 tokens segun los ejemplos de uso proporcionados. El repositorio GGUF ocupa 60 GB en total por acumular todas las variantes, pero cada fichero individual es manejable en hardware consumer.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-v0.1) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (segun ejemplos de la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (11 variantes) |

## Arquitectura y entrenamiento
El modelo base es Mistral-7B-v0.1, un transformer decoder-only denso con atencion por ventanas deslizantes (sliding window attention) y RoPE, del que se heredan los 7.241.732.096 parametros. Sobre el se aplico ORPO, una tecnica de optimizacion de preferencias que combina la perdida de ajuste supervisado con una penalizacion por odds ratio, eliminando la necesidad de un modelo de referencia separado como en DPO clasico. El entrenamiento se realizo sobre el dataset Capybara DPO y, segun la model card, requirio 2,5 horas en cuatro GPU A100.

Las cuantizaciones GGUF han sido generadas por `tinyopsec` con el formato estandar de llama.cpp, incluyendo variantes K-quants (Q2_K a Q6_K) y Q8_0/F16. No se detalla en la informacion disponible la composicion exacta del dataset Capybara DPO, el numero de tokens de entrenamiento ni hiperparametros adicionales de ORPO.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento e instrucciones generales, con rendimiento medido en MT-Bench (7,44) e IFEval (58,27% en Inst-Strict).
- Seguimiento de instrucciones formateadas, evaluado por IFEval.
- Alineacion con preferencias humanas gracias al ajuste ORPO sobre Capybara DPO.
- Formato de chat compatible con la plantilla Mistral (`--chat-template mistral`).
- Despliegue en llama.cpp, llama-cpp-python, LM Studio y Ollama.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- Capacidad multilingue limitada al ingles segun el campo `language: en`.

## Casos de uso
- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno con una ventana de 2048 tokens, adecuado para prototipos y demos en equipos sin GPU dedicada usando Q4_K_M (~3,8 GB).
- Chatbot de soporte en estaciones de trabajo consumer: con Q5_K_M (~4,8 GB) cabe en GPU de 8 GB y permite respuestas de hasta 256 tokens por turno, suficiente para consultas de atencion al cliente de dominio general.
- Generacion de texto asistida en IDE o editor: integrable via llama-cpp-python con `chat_format="mistral"` para autocompletado y redaccion tecnica en ingles.
- Evaluacion de tecnicas de alineacion: util como referencia practica de ORPO frente a DPO/SFT para investigadores que comparan metodos de optimizacion de preferencias en modelos de 7B.
- Despliegue en LM Studio u Ollama para pruebas de prompting: permite iterar rapidamente sobre plantillas y parametros de muestreo (temperature 0.7, top_p 0.9 sugeridos) sin infraestructura cloud.
- Educacion y experimentacion: las once variantes de cuantizacion permiten estudiar el impacto de la precision (de Q2_K a F16) en la calidad de salida sobre el mismo checkpoint.
- Prototipado de pipelines de generacion en CPU: la variante Q2_K (~2,0 GB) permite ejecucion en CPU con ~3,5 GB de RAM, adecuada para entornos sin acelerador.

## Benchmarks y rendimiento
| Benchmark | Resultado |
|---|---|
| AlpacaEval 2.0 (LC) | 15,9% |
| MT-Bench | 7,44 |
| IFEval Inst-Strict | 58,27% |

No se han publicado en la informacion disponible resultados adicionales (MMLU, HumanEval, GSM8K) ni comparativas directas con otros modelos.

## Requisitos de hardware
- VRAM estimada por cuantizacion (segun model card): F16 ~14 GB; Q8_0 ~8 GB; Q6_K ~6,5 GB; Q5_K_M ~5,5 GB; Q4_K_M ~4,5 GB; Q3_K_M ~3,5 GB; Q2_K ~2,5 GB.
- RAM para inferencia en CPU: F16 ~17 GB; Q8_0 ~10 GB; Q6_K ~8 GB; Q5_K_M ~7 GB; Q4_K_M ~6 GB; Q3_K_M ~5 GB; Q2_K ~3,5 GB.
- GPU recomendadas: A100/H100 para F16 y Q8_0 en produccion; RTX 4090 (24 GB) para cualquier variante con holgura; RTX 3060/4060 (8-12 GB) para Q5_K_M o Q4_K_M.
- Cabe en GPU consumer: si, desde Q4_K_M (~4,5 GB de VRAM) en adelante en tarjetas de 6-8 GB; Q2_K en GPUs de 4 GB o en CPU.
- Opciones de despliegue: llama.cpp (`./main`), llama-cpp-python, LM Studio, Ollama (via Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistral-orpo-capybara-7k (este, GGUF) | 7,24B | 2048 | MIT | GGUF | AlpacaEval 2.0 LC 15,9%; MT-Bench 7,44 |
| kaist-ai/mistral-orpo-capybara-7k (base) | 7,24B | 2048 | MIT | safetensors | Checkpoint original sin cuantizar |
| Mistral-7B-v0.1 (original) | 7,24B | 8192 (nativo) | Apache 2.0 | safetensors | Sin ajuste de preferencias |
| Otros 7B afinados con DPO/ORPO | ~7B | variable | variable | variable | Datos no disponibles en esta busqueda |

La comparativa con alternativas de la misma categoria se limita a los datos disponibles; no se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo entrenado y evaluado unicamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Ventana de contexto de 2048 tokens segun los ejemplos de la model card, inferior a los 8192 tokens nativos de Mistral-7B-v0.1; conviene verificar la configuracion del runtime.
- Riesgo de alucinacion inherente a los modelos de 7B afinados con preferencias; no se documentan mitigaciones especificas.
- Sesgos potenciales heredados de Mistral-7B-v0.1 y del dataset Capybara DPO; no se detalla el analisis de sesgos en la informacion disponible.
- Licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset Capybara DPO antes de desplegar en produccion.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) degradan la calidad de forma notable; para produccion se recomienda Q5_K_M o superior.
- No se documenta soporte de tool calling, agentes ni funciones multimodales, lo que limita su uso en pipelines agenticos.
- El repositorio acumula 60 GB por incluir todas las variantes; conviene descargar solo el fichero GGUF necesario.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/tinyopsec/mistral-orpo-capybara-7k-GGUF
- Modelo base: https://huggingface.co/kaist-ai/mistral-orpo-capybara-7k
- Paper ORPO (arXiv:2403.07691): https://arxiv.org/abs/2403.07691
- llama.cpp: https://github.com/ggerganov/llama.cpp
- llama-cpp-python: https://github.com/abetlen/llama-cpp-python
- LM Studio: https://lmstudio.ai
- Ollama: https://ollama.com
