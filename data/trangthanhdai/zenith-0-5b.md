# trangthanhdai/Zenith-0.5B

## Resumen

Zenith VN 0.5B es un modelo de lenguaje causal de tipo conversacional desarrollado por el usuario trangthanhdai bajo el proyecto udVietNamspeedrace. Se trata de un fine-tuning supervisado del modelo Qwen1.5-0.5B-Chat (arquitectura Qwen2) orientado al idioma vietnamita, con el ingles como idioma secundario. El modelo se presenta como un asistente experimental para conversacion general, conocimiento basico y asistencia en temas de tecnologia y programacion, y su proposito declarado es servir como base para futuros desarrollos de IA en vietnamita.

Con 463.987.712 parametros reales (aproximadamente 0,5 mil millones), el modelo se posiciona en la gama ultraligera, lo que permite su ejecucion en hardware modesto. El entrenamiento se realizo mediante SFT con adaptadores LoRA sobre una cuantizacion de 4 bits (QLoRA), y los pesos se exportan en formato safetensors. El modelo registra tipos personalizados (`zenith_vn`, `ZenithVNConfig`, `ZenithVNForCausalLM`) que requieren un bloque de registro previo en Transformers antes de cargarlo con las clases `Auto*`.

La relevancia de este modelo es limitada pero concreta: cubre el nicho de asistentes conversacionales en vietnamita de muy bajo coste computacional, un idioma con relativamente poca representacion en modelos abiertos de gran tamano. No obstante, se trata de un proyecto experimental sin benchmarks publicados ni licencia definida, lo que condiciona seriamente su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen2), tipo `zenith_vn` |
| Parametros totales | 463.987.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en 4-bit QLoRA; pesos exportados en safetensors (precision de inferencia no especificada) |
| Idiomas soportados | vietnamita (principal), ingles |
| Licencia | no disponible (la model card remite a verificar derechos de los componentes) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen1.5-0.5B-Chat |
| Metodo de entrenamiento | Supervised Fine-Tuning (SFT) con LoRA |
| Tamano del repositorio | 0,9 GB |
| Descargas | 523 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2, un transformer causal decoder-only con atencion de tipo multi-head y RoPE, heredada directamente de Qwen1.5-0.5B-Chat. Sobre esa base se definen clases personalizadas (`ZenithVNConfig`, `ZenithVNForCausalLM`, `ZenithVNTokenizer`) que heredan de sus equivalentes de Qwen2 y se registran en el mecanismo `Auto*` de Transformers bajo el `model_type` `zenith_vn`. Esta capa de personalizacion no altera la arquitectura subyacente, sino que permite identificar el modelo como propio y cargarlo con su tokenizer asociado.

El entrenamiento consistio en un fine-tuning supervisado (SFT) con adaptadores LoRA sobre el modelo base cuantizado a 4 bits (QLoRA), usando el stack PyTorch, Transformers, PEFT, TRL, Datasets, Accelerate y BitsAndBytes. El proceso descrito incluye preparacion de datasets conversacionales, configuracion de LoRA, SFT, fusion de los pesos LoRA en el modelo y exportacion final. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en vietnamita e ingles.
- Respuesta a preguntas de conocimiento general.
- Asistencia en temas de tecnologia y programacion a nivel basico.
- Identificacion de si mismo como Zenith VN dentro de la conversacion.
- Uso de plantilla de chat (`chat_template`) cuando el tokenizer la expone; en su defecto, el autor documenta un formato de prompt alternativo `User: ...\nAssistant:`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (la model card declara capacidades de razonamiento limitadas).
- Capacidades de vision o audio: no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistente conversacional en vietnamita para prototipos: el modelo puede mantener conversaciones multi-turno basicas usando su plantilla de chat, adecuado para demos y pruebas de concepto de productos orientados al mercado vietnamita con recursos computacionales minimos.
- Chatbot de atencion al cliente de bajo coste: por su tamano de 0,5B, puede desplegarse en CPU o GPU de gama baja para responder consultas frecuentes en vietnamita, siempre con supervision humana y sin depender de el para informacion critica.
- Generacion de respuestas en ingles y vietnamita para aplicaciones bilingues: util en herramientas de soporte que necesiten alternar entre ambos idiomas, aunque la calidad en ingles sera inferior a la de modelos multilingues mayores.
- Base para fine-tuning posterior en vietnamita: su licencia indefinida y su naturaleza experimental lo hacen apto como punto de partida interno para experimentar con QLoRA sobre dominios especificos (por ejemplo, soporte tecnico), reutilizando el pipeline documentado por el autor.
- Educacion y divulgacion sobre IA en vietnamita: sirve como ejemplo didactico de como adaptar un modelo pequeno con LoRA y publicarlo en Hugging Face, incluido el registro de clases personalizadas en Transformers.
- Asistencia basica en programacion para usuarios vietnamitas: puede responder dudas sencillas de tecnologia y fragmentos de codigo, integrado en un IDE o bot interno, con la advertencia de que su razonamiento es limitado y requiere verificacion.
- Experimentacion con cuantizacion y despliegue ligero: su tamano permite probar pipelines de inferencia en entornos con poca VRAM (por ejemplo, portatiles o dispositivos edge), aunque el autor no documenta conversiones a GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB solo para pesos (0,46B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 1,5 y 2,5 GB segun longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,5 GB para pesos; en 4 bits, aproximadamente 0,25 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia holgada. En GPUs de datacenter (A100, H100) el modelo queda enormemente sobredimensionado en cuanto a capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU con suficiente RAM del sistema.
- Opciones de despliegue: Transformers (con el bloque de registro de clases personalizadas), y potencialmente vLLM o TGI si se resuelve la compatibilidad con el `model_type` personalizado; llama.cpp y Ollama requeririan conversion a GGUF, no documentada por el autor.
- Latencia y throughput estimados: no disponibles. El autor solo indica que la inferencia en CPU es posible pero mas lenta y que el rendimiento depende del hardware y la configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zenith VN 0.5B | 463.987.712 | no disponible | vi, en | no disponible | Hugging Face (523 descargas) |
| Qwen1.5-0.5B-Chat (base) | ~0,5B | 32K (segun documentacion de Qwen; no verificado en esta ficha) | multilingue | Apache 2.0 (segun Qwen; no verificado aqui) | Hugging Face |
| Modelos vietnamitas abiertos de tamano similar | no disponible | no disponible | vi | no disponible | no disponible |

La comparativa directa con alternativas vietnamitas especificas no esta disponible en la informacion proporcionada. Frente a su modelo base, Zenith VN anade el ajuste conversacional en vietnamita, pero pierde la claridad de licencia y la documentacion tecnica del original.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como un proyecto en desarrollo, con capacidades de razonamiento limitadas.
- Riesgo de alucinacion: la model card advierte explicitamente de que puede generar informacion inexacta.
- Conocimiento limitado al dataset de entrenamiento, cuya composicion no se documenta.
- Cobertura del vietnamita incompleta: puede no comprender todas las expresiones del idioma.
- No apto para sustituir asesoramiento profesional (medico, legal, financiero).
- Licencia no disponible: la model card remite a verificar los derechos de los componentes, datasets y materiales de entrenamiento antes de redistribuir; esto impide un uso comercial claro sin revision legal.
- Requiere codigo personalizado (`custom_code`) y un bloque de registro manual en Transformers; esto complica la integracion con herramientas de inferencia estandar y exige revisar el codigo Python del repositorio antes de ejecutarlo, tal como advierte el autor.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas.
- Contexto maximo no documentado: no se puede planificar su uso en tareas de contexto largo.
- Sin soporte documentado de tool calling, agentes, vision ni audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trangthanhdai/Zenith-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
