# tinyopsec/LFM2.5-2.6B-TauBanking-SFT-01-GGUF

## Resumen

LFM2.5-2.6B-TauBanking-SFT-01-GGUF es la distribucion en formato GGUF del modelo lugman-madhiai/LFM2.5-2.6B-TauBanking-SFT-01, un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-2.6B orientado al dominio bancario y al benchmark TauBanking. Lo publica el usuario tinyopsec y su funcion principal es facilitar el despliegue del modelo en runtimes de inferencia local compatibles con llama.cpp, como Ollama, LM Studio o koboldcpp, sin necesidad de convertir pesos desde safetensors.

El modelo cuenta con 2.697.198.592 parametros (aproximadamente 2,7 mil millones), lo que lo situa en la gama de modelos pequenos aptos para hardware de consumo. La familia LFM2.5 de LiquidAI emplea una arquitectura propia orientada a eficiencia en dispositivos, aunque la model card de esta ficha no detalla la configuracion exacta de capas ni la longitud de contexto.

La relevancia actual del modelo radica en su especializacion: no es un modelo generalista, sino un SFT sobre tareas de atencion al cliente y operaciones bancarias evaluadas con TauBanking. Su licencia Apache 2.0 y la disponibilidad de cuantizaciones desde F16 hasta Q2_K lo convierten en una opcion practica para prototipos de asistentes financieros en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5 de LiquidAI; detalles de capas no publicados en la ficha) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es un ajuste fino supervisado (SFT) de LiquidAI/LFM2.5-2.6B, un modelo de la familia LFM2.5 de LiquidAI. La model card no especifica la arquitectura interna (tipo de transformer, atencion, capas hibridas o SSM), el numero de tokens de entrenamiento ni la composicion del dataset de SFT. Tampoco se documenta si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento posteriores al SFT.

El ajuste esta orientado al benchmark TauBanking, que evalua la capacidad del modelo para resolver tareas de dominio bancario en formato conversacional. La informacion disponible no detalla el proceso de cuantizacion mas alla de indicar que se realizo con llama.cpp y que incluye 13 variantes de precision. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun el tag `conversational` del repositorio.
- Razonamiento y resolucion de tareas de dominio bancario, derivado del SFT sobre TauBanking.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere despliegue en infraestructura de inferencia estandar.

## Casos de uso

- Atencion al cliente bancaria automatizada: el modelo puede gestionar conversaciones multi-turno sobre consultas de productos financieros, gracias a su SFT especifico sobre TauBanking y su formato conversacional.
- Clasificacion y enrutamiento de solicitudes bancarias: un modelo de 2,7B parametros cuantizado a Q4_K_M puede ejecutarse en CPU o GPU modesta para preclasificar tickets de clientes antes de derivarlos a agentes humanos.
- Prototipado rapido de asistentes financieros: la disponibilidad de GGUF permite levantar un endpoint con Ollama o llama.cpp en minutos, sin infraestructura GPU dedicada, para validar flujos de producto.
- Simulacion de escenarios de soporte: util para generar respuestas de referencia en pruebas de QA de sistemas de atencion al cliente, dado su ajuste al dominio bancario.
- Despliegue en entornos con recursos limitados: con cuantizacion Q4_K_M o inferior, el modelo cabe en portatiles y equipos de sobremesa, lo que permite demos locales sin conexion a la nube.
- Evaluacion comparativa de SFT de dominio: sirve como linea base para medir el efecto de ajustes finos sobre LFM2.5-2.6B en tareas bancarias frente a otros modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,2 GB en F16 (dato de la model card), en torno a 2,8-3,2 GB en Q8_0, 2,2-2,5 GB en Q6_K, 1,9-2,1 GB en Q5_K_M y 1,6-1,8 GB en Q4_K_M (estimaciones segun el numero de parametros y el tamano de los ficheros; los tamanos exactos de cada GGUF no se detallan en la ficha).
- GPU recomendadas: para F16, una GPU con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 2070). Para cuantizaciones Q4-Q5, cualquier GPU con 2-4 GB de VRAM es suficiente; tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en todas las cuantizaciones desde Q5_K_M hacia abajo en tarjetas de 4 GB o mas; F16 requiere al menos 6 GB.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-TauBanking-SFT-01-GGUF | 2,70B | no disponible | Apache 2.0 | GGUF | SFT de dominio bancario |
| LiquidAI/LFM2.5-2.6B (base) | 2,70B | no disponible | no disponible en esta ficha | safetensors | Modelo base sin ajuste de dominio |
| Modelos generalistas de ~3B (p. ej. Llama 3.2 3B, Qwen2.5 3B) | ~3B | 128K (Qwen2.5) / 128K (Llama 3.2) | licencias propias | GGUF, safetensors | No especializados en banca; comparativa orientativa |

La comparacion con modelos generalistas de tamano similar es orientativa: no se dispone de datos de benchmarks de este modelo que permitan una comparacion cuantitativa rigurosa.

## Limitaciones y advertencias

- Modelo especializado en banca: su rendimiento fuera del dominio bancario puede ser inferior al de un modelo generalista del mismo tamano.
- Riesgo de alucinacion: al ser un SFT de 2,7B parametros, puede generar informacion financiera incorrecta; no debe usarse como fuente de verdad en produccion sin validacion.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la model card.
- Idiomas: no se declaran idiomas soportados; el comportamiento multilingue es incierto.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar despliegues con conversaciones largas.
- Licencia: Apache 2.0 permite uso comercial, pero el autor advierte explicitamente que es un modelo de SFT bancario y que debe evaluarse antes de usarse.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- El repositorio ocupa 26,3 GB por incluir todas las variantes; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/LFM2.5-2.6B-TauBanking-SFT-01-GGUF
- Modelo base del SFT: https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-TauBanking-SFT-01
- Modelo original de LiquidAI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
