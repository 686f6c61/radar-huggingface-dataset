# technicallyAnnoyed/Moonlight-16B-A3B

## Resumen
Moonlight-16B-A3B es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Moonshot AI, presentado en el informe tecnico "Muon is Scalable For LLM Training" (arXiv:2502.16982). Con 16.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, se entrena sobre 5,7 billones de tokens utilizando el optimizador Muon en lugar de AdamW, lo que segun sus autores lo hace unas 2 veces mas eficiente en muestras y requiere aproximadamente el 52 % de los FLOPs de entrenamiento de un equivalente con AdamW.

El modelo destaca por avanzar la frontera de Pareto entre rendimiento y coste computacional: con solo 2,24B de parametros activos iguala o supera a modelos densos de 3B entrenados con muchos mas tokens (Llama 3.2-3B con 9T, Qwen2.5-3B con 18T) y a DeepSeek-V2-Lite, un MoE de 2,4B/16B entrenado con los mismos 5,7T tokens. Su ventana de contexto es de 8K tokens y la licencia MIT facilita su adopcion tanto en investigacion como en productos comerciales.

Esta ficha corresponde a la copia subida por el usuario `technicallyAnnoyed` del checkpoint preentrenado original de Moonshot AI. Es relevante ahora porque valida a escala real que Muon es viable para entrenamiento de LLM de gran tamano y porque ofrece una relacion calidad/coste muy competitiva para despliegues con recursos moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer decoder, tipo DeepSeek-V3 (`deepseek_v3`) |
| Parametros totales | 15.960.111.936 (~16B) |
| Parametros activos | ~3B (2,24B excluyendo embeddings) |
| Longitud de contexto | 8K tokens |
| Tipos de cuantizacion | no disponible (el repo contiene pesos safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible en la model card; los benchmarks reportados cubren ingles y chino |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers, `custom_code`) |

## Arquitectura y entrenamiento
Moonlight es un transformer decoder con capas de mezcla de expertos (MoE) con enrutamiento por token, implementado con la arquitectura `deepseek_v3` en transformers. Cada token activa aproximadamente 3B de los 16B parametros totales, lo que reduce drasticamente el coste de inferencia respecto a un denso del mismo tamano. El modelo se entrena sobre 5,7 billones de tokens.

La innovacion central es el uso del optimizador Muon a gran escala. Los autores identifican dos tecnicas clave para escalarlo: weight decay (critico para modelos grandes) y actualizaciones RMS consistentes entre parametros matriciales y no matriciales mediante ajustes de escala por parametro, lo que estabiliza el entrenamiento sin ajuste fino de hiperparametros. Ademas desarrollan una implementacion distribuida de Muon con optimizacion estilo ZeRO-1, eficiente en memoria y comunicacion. Los estudios de scaling law muestran que Muon es ~2x mas eficiente en muestras que AdamW y alcanza rendimiento comparable con ~52 % de los FLOPs. Moonshot AI libera checkpoints preentrenados, instruction-tuned e intermedios, asi como el codigo de Muon.

## Capacidades
- Generacion de texto autoregresiva en ingles y chino (idiomas evaluados en los benchmarks).
- Razonamiento general y conocimiento enciclopedico (MMLU 70,0; MMLU-pro 42,4; BBH 65,2).
- Generacion de codigo (HumanEval 48,1; MBPP 63,8).
- Razonamiento matematico (GSM8K 77,4; MATH 45,3; CMath 81,1).
- Responder a preguntas factuales de dominio abierto (TriviaQA 66,3).
- Capacidades en chino (C-Eval 77,2; CMMLU 78,2).
- Este checkpoint es el modelo **preentrenado** (no instruction-tuned): completa texto, pero no sigue instrucciones ni mantiene formato conversacional de forma fiable. Para dialogos y tareas de instruccion debe usarse `Moonlight-16B-A3B-Instruct`.
- Soporte de tool calling / function calling: no disponible en el checkpoint preentrenado.
- Soporte de agentes y multi-step reasoning: no disponible de forma nativa; depende de tecnicas de prompting externas.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso
- Generacion de codigo en produccion: con HumanEval 48,1 y MBPP 63,8, el modelo sirve como base para autocompletado y generacion de funciones; puede afinarse (SFT/LoRA) sobre el checkpoint preentrenado para tareas especificas de repositorio.
- Investigacion sobre optimizadores: al liberar checkpoints intermedios y el codigo de Muon, el modelo permite reproducir estudios de scaling law y comparar Muon frente a AdamW en condiciones controladas.
- Fine-tuning eficiente en recursos: con solo ~3B parametros activos por token, el entrenamiento con LoRA o QLoRA sobre una GPU de 24-48 GB es viable, abaratando la adaptacion a dominios verticales (legal, medico, financiero).
- Razonamiento matematico asistido: GSM8K 77,4 y MATH 45,3 lo hacen util como base para tutoria automatica de problemas o generacion de datasets sinteticos de matematicas para entrenar otros modelos.
- Generacion de texto en chino: C-Eval 77,2 y CMMLU 78,2 lo posicionan como opcion economica para localizacion de contenido y asistentes en chino, con licencia MIT para uso comercial.
- Base para destilacion: su relacion calidad/coste (rendimiento de modelos de 3B densos con muchos menos FLOPs) lo convierte en candidato para generar datos sinteticos y destilar conocimiento hacia modelos mas pequenos desplegables en edge.
- Servicio de completado de texto a bajo coste: con 8K de contexto y ~3B activos, puede desplegarse en vLLM o TGI para autocompletado y resumen en aplicaciones de alto volumen con coste de inferencia reducido.

## Benchmarks y rendimiento

| Benchmark | Llama3.2-3B | Qwen2.5-3B | DSV2-Lite | Moonlight |
|---|---|---|---|---|
| Parametros activos | 2,81B | 2,77B | 2,24B | 2,24B |
| Parametros totales | 2,81B | 2,77B | 15,29B | 15,29B |
| Tokens de entrenamiento | 9T | 18T | 5,7T | 5,7T |
| MMLU | 54,75 | 65,6 | 58,3 | 70,0 |
| MMLU-pro | 25,0 | 34,6 | 25,5 | 42,4 |
| BBH | 46,8 | 56,3 | 44,1 | 65,2 |
| TriviaQA | 59,6 | 51,1 | 65,1 | 66,3 |
| HumanEval | 28,0 | 42,1 | 29,9 | 48,1 |
| MBPP | 48,7 | 57,1 | 43,2 | 63,8 |
| GSM8K | 34,0 | 79,1 | 41,1 | 77,4 |
| MATH | 8,5 | 42,6 | 17,1 | 45,3 |
| CMath | - | 80,0 | 58,4 | 81,1 |
| C-Eval | - | 75,0 | 60,3 | 77,2 |
| CMMLU | - | 75,0 | 64,3 | 78,2 |

Nota: Qwen2.5-3B supera a Moonlight en GSM8K (79,1 frente a 77,4). Los conteos de parametros excluyen embeddings.

## Requisitos de hardware
- VRAM estimada: en BF16/FP16 los ~16B parametros ocupan aproximadamente 32 GB de pesos, mas overhead de activaciones y cache KV; se recomienda 40-48 GB para inferencia comoda. En FP8 o int8 baja a ~16 GB; en 4-bit (GGUF/AWQ/GPTQ) a ~8-10 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB y L40S para produccion en BF16; A6000/RTX 4090 (24 GB) para cuantizaciones de 8 bits; GPUs de 12-16 GB solo con cuantizacion 4-bit y contextos cortos.
- Cabe en GPU consumer: si, con cuantizacion. RTX 4090/3090 (24 GB) en 8-bit o 4-bit; RTX 4060 Ti 16 GB en 4-bit con contexto limitado.
- Opciones de despliegue: transformers (requiere `trust_remote_code`), vLLM (soporta arquitecturas MoE tipo DeepSeek-V3), TGI, llama.cpp/Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste por token es bajo en terminos de FLOPs por los ~3B parametros activos, pero la memoria requerida corresponde a los 16B totales.

## Comparativa con modelos similares

| Modelo | Parametros (total/activo) | Contexto | MMLU | HumanEval | Licencia |
|---|---|---|---|---|---|
| Moonlight-16B-A3B | 16B / ~3B | 8K | 70,0 | 48,1 | MIT |
| DeepSeek-V2-Lite | 15,29B / 2,24B | no disponible en la informacion | 58,3 | 29,9 | no disponible en la informacion |
| Qwen2.5-3B | 2,77B denso | no disponible en la informacion | 65,6 | 42,1 | no disponible en la informacion |
| Llama3.2-3B | 2,81B denso | no disponible en la informacion | 54,75 | 28,0 | no disponible en la informacion |

Moonlight aventaja a los tres comparables en MMLU, MMLU-pro, BBH, HumanEval, MBPP y MATH; Qwen2.5-3B solo lo supera ligeramente en GSM8K. La licencia MIT es la mas permisiva del grupo.

## Limitaciones y advertencias
- Es un checkpoint preentrenado: no esta alineado para seguir instrucciones, mantener formatos ni rechazar peticiones daninas; usarlo en produccion sin fine-tuning o sin el modelo Instruct puede producir salidas incoherentes.
- Riesgo de alucinacion inherente a modelos de lenguaje; los benchmarks no garantizan fiabilidad factual en dominios especializados.
- Contexto limitado a 8K tokens, insuficiente para documentos largos o conversaciones multi-turno extensas sin tecnicas de retrieval.
- Idiomas: la model card solo reporta evaluacion en ingles y chino; el rendimiento en castellano no esta documentado y probablemente es inferior.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible; el entrenamiento con 5,7T tokens de web puede propagar sesgos sociales y culturales.
- La copia `technicallyAnnoyed/Moonlight-16B-A3B` tiene 31 descargas y 0 likes, y fue creada en 2026-11-12; no es el repositorio oficial. Conviene verificar integridad de pesos y usar `moonshotai/Moonlight-16B-A3B` como referencia.
- Requiere `custom_code` y `trust_remote_code=True` en transformers, lo que implica ejecutar codigo remoto; auditar antes en entornos sensibles.
- Aunque la licencia MIT permite uso comercial, la procedencia y composicion exacta del dataset de entrenamiento no se detallan en la informacion disponible, lo que limita la evaluacion de riesgo legal.

## Enlaces
- Copia en Hugging Face: https://huggingface.co/technicallyAnnoyed/Moonlight-16B-A3B
- Modelo original preentrenado: https://huggingface.co/moonshotai/Moonlight-16B-A3B
- Modelo original instruction-tuned: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct
- Repositorio de codigo: https://github.com/MoonshotAI/Moonlight
- Informe tecnico (PDF): https://github.com/MoonshotAI/Moonlight/blob/master/Moonlight.pdf
- Paper en arXiv: https://arxiv.org/abs/2502.16982
- Optimizador Muon: https://github.com/KellerJordan/Muon
