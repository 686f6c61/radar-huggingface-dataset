# tacodevs/Pantheon-Reasoning-31B-1.1-NVFP4-GPTQ-Max

## Resumen

Pantheon-Reasoning-31B-1.1-NVFP4-GPTQ-Max es una cuantizacion NVFP4 (W4A4) mediante GPTQ del modelo Gryphe/Pantheon-Reasoning-31B-1.1, un modelo de la familia Gemma 4 orientado a razonamiento y roleplay. Lo publica el usuario tacodevs y su objetivo es reducir el coste de inferencia del modelo original manteniendo la mayor parte de su comportamiento: el repositorio ocupa 23,3 GB y las capas lineales del modelo de lenguaje se almacenan en 4 bits tanto en pesos como en activaciones, mientras que embeddings, lm_head, normalizaciones y el torre de vision permanecen en BF16.

La relevancia de esta ficha esta en que se trata de una cuantizacion agresiva pensada para hardware Blackwell: los kernels nativos NVFP4 de vLLM solo funcionan en GPU de esa generacion. El autor reporta 55-63 tok/s por stream en una RTX PRO 6000, frente a 38-42 tok/s de una build FP8, con aproximadamente la mitad de tiempo hasta el primer token. El precio es una deriva medible frente al original BF16: 90,2 % de acuerdo top-1 y KL aproximada de 0,052 en conversaciones de roleplay reservadas.

El modelo base es Gemma 4 de 31B (aunque el recuento real de parametros en safetensors es de 19.869.430.116, es decir, unos 19,9 mil millones), con soporte de imagen y texto (image-text-to-text) y una ventana de contexto que el autor ejemplifica en 32.768 tokens en el comando de servicio. La licencia declarada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), con torre de vision; cuantizacion NVFP4 W4A4 GPTQ en capas lineales del LM |
| Parametros totales | 19.869.430.116 (segun safetensors); el nombre comercial indica 31B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de servicio del autor; maximo nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) con GPTQ en capas lineales; embeddings, lm_head, norms y torre de vision en BF16; se menciona comparativa con FP8 (W8A16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |
| Tamano del repo | 23,3 GB |
| Calibracion | 256 conversaciones de roleplay de 8k tokens |
| Herramienta de cuantizacion | llm-compressor 0.13 |
| Version de vLLM recomendada | 0.27.1 (con `transformers==5.14.1`) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion, no un entrenamiento desde cero. Sobre el checkpoint Gryphe/Pantheon-Reasoning-31B-1.1 (Gemma 4 31B), el autor aplica GPTQ con formato NVFP4: pesos y activaciones de todas las capas lineales del modelo de lenguaje se representan en 4 bits, calibrando con 256 conversaciones de roleplay de 8.000 tokens cada una. Quedan en BF16 los embeddings, la cabeza de salida (lm_head), las normalizaciones y la torre de vision, lo que preserva la fidelidad de las representaciones de entrada y de la proyeccion final.

No se documenta en la informacion disponible el proceso de entrenamiento del modelo base (composicion del dataset, numero de tokens, si hubo RLHF o DPO). El autor indica que el formato de prompt, los samplers y el comportamiento de "thinking" son identicos a los del modelo original, por lo que la innovacion tecnica de esta build es exclusivamente la cuantizacion NVFP4 con kernels nativos para Blackwell y su integracion con vLLM mediante compressed-tensors.

## Capacidades

- Generacion de texto conversacional y de razonamiento, heredadas del modelo base Gemma 4.
- Modo "thinking" (razonamiento explicito) conservado respecto al original, segun el autor.
- Entrada de imagen y texto (pipeline image-text-to-text), con la torre de vision en BF16.
- Especializacion en roleplay y conversaciones multi-turno, dado el dataset de calibracion y las etiquetas del repositorio.
- Generacion de codigo y matematicas: capacidad esperable del modelo base, aunque no se documenta de forma especifica en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking es el unico indicio.
- Capacidades multilingues: no disponibles (no se listan idiomas en la model card).
- Despliegue en vLLM con decodificacion de alta velocidad gracias a los kernels NVFP4.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta calibrado sobre conversaciones de roleplay y conserva el formato de prompt del original, por lo que es adecuado para personajes consistentes en sesiones largas dentro de la ventana de 32k tokens.
- Servicio de chat de alta concurrencia en hardware Blackwell: con 55-63 tok/s por stream y la mitad de tiempo hasta el primer token frente a FP8, permite atender varias sesiones simultaneas en una sola RTX PRO 6000.
- Asistentes con razonamiento explicito: el modo thinking permite exponer cadenas de razonamiento en tareas de analisis, planificacion o resolucion de problemas, util en herramientas internas de soporte a decisiones.
- Procesamiento de documentos con imagen: al mantener la torre de vision en BF16, puede recibir capturas, diagramas o paginas escaneadas y responder en texto dentro de un mismo flujo.
- Prototipado e investigacion de cuantizacion: sirve como referencia practica de NVFP4 W4A4 con GPTQ para medir deriva (acuerdo top-1, KL) frente a BF16 y FP8 en tareas generativas.
- Despliegue en entornos con restricciones de memoria: los 23,3 GB del repositorio permiten cargar el modelo en una GPU de 48 GB o mas dejando margen para cache KV en fp8_e4m3, algo inviable con el original en BF16.
- Evaluacion comparativa de calidad conversacional: util para equipos que quieran medir cuanto pierde un modelo de roleplay al cuantizar a 4 bits antes de decidir su build de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de deriva frente al original BF16 y de velocidad de decodificacion:

| Metrica | FP8 (W8A16) | Esta build (NVFP4 W4A4) |
|---|---|---|
| Acuerdo top-1 (roleplay, teacher-forced) | 95,5 % | 90,2 % |
| KL aproximada | 0,010 | 0,052 |
| Tokens de respuesta evaluados | 23,7k | 23,7k |
| Decodificacion por stream (RTX PRO 6000, vLLM 0.27.1) | 38-42 tok/s | 55-63 tok/s |
| Tiempo hasta el primer token | referencia | aproximadamente la mitad que FP8 |

## Requisitos de hardware

- VRAM estimada: unos 23,3 GB de pesos; con cache KV en fp8_e4m3 y contexto de 32k conviene reservar 40-48 GB en total.
- GPU recomendadas: RTX PRO 6000 (usada por el autor) y, en general, cualquier GPU Blackwell con soporte de kernels NVFP4; sin Blackwell no funcionan los kernels nativos.
- GPU consumer: cabe en tarjetas de 24 GB solo con contexto reducido y margen muy ajustado; en 32 GB o mas es viable con contexto moderado, siempre que sean Blackwell.
- Opciones de despliegue: vLLM 0.27.1 (recomendado, con `transformers==5.14.1`) y transformers; llama.cpp, Ollama y TGI no se mencionan como soportados para este formato.
- Comando de servicio de referencia: `vllm serve ... --language-model-only --kv-cache-dtype fp8_e4m3 --max-model-len 32768`.
- Latencia y throughput: 55-63 tok/s por stream y aproximadamente la mitad de TTFT que la build FP8 en una RTX PRO 6000.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pantheon-Reasoning-31B-1.1-NVFP4-GPTQ-Max (esta ficha) | 19,9B reales (31B nominales) | 32k en el ejemplo de servicio | NVFP4 W4A4 GPTQ, 23,3 GB | Apache 2.0 | Hugging Face, requiere Blackwell |
| Gryphe/Pantheon-Reasoning-31B-1.1 (base) | 31B nominales | no disponible | BF16 | no disponible en esta ficha | Hugging Face |
| Build FP8 (W8A16) del mismo modelo | 31B nominales | no disponible | FP8, mayor tamano que NVFP4 | no disponible | Mencionada por el autor, sin enlace |
| Gemma 4 31B (familia del base) | 31B nominales | no disponible | BF16 y otras | no disponible en esta ficha | Hugging Face |

La comparacion se limita a las variantes del propio modelo porque la informacion proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Deriva de cuantizacion medible: 90,2 % de acuerdo top-1 y KL de 0,052 frente a BF16, superior a la de la build FP8; en tareas sensibles a matices puede degradar la calidad respecto al original.
- Dependencia de hardware: los kernels NVFP4 requieren GPU Blackwell; en generaciones anteriores el modelo no se puede servir con el rendimiento anunciado.
- Dependencia de version: el autor fija vLLM 0.27.1 y `transformers==5.14.1`; otras versiones pueden romper la carga o el rendimiento.
- Calibracion sesgada a roleplay: el dataset de calibracion son 256 conversaciones de roleplay de 8k tokens, por lo que el comportamiento en dominios tecnicos o de codigo puede desviarse mas que en conversacion.
- Idiomas no documentados: no se listan idiomas soportados, lo que impide garantizar calidad multilingue.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en la informacion disponible.
- Sesgos: no documentados en la model card.
- Licencia Apache 2.0 declarada, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no reflejadas en esta ficha; conviene verificar la licencia del checkpoint original antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta y creado en 2026, lo que implica ausencia de validacion comunitaria independiente.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/tacodevs/Pantheon-Reasoning-31B-1.1-NVFP4-GPTQ-Max
- Modelo base: https://huggingface.co/Gryphe/Pantheon-Reasoning-31B-1.1
- llm-compressor: no disponible enlace en la informacion proporcionada
- vLLM: no disponible enlace en la informacion proporcionada
- Paper o blog del modelo base: no disponible
