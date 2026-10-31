# tinyopsec/LFM2.5-2.6B-TauBanking-SFT-01-GGUF

## Resumen

LFM2.5-2.6B-TauBanking-SFT-01-GGUF es una colección de cuantizaciones GGUF de un modelo ajustado por instrucciones (SFT) especializado en el dominio bancario, publicado por el usuario tinyopsec en HuggingFace. El modelo base es LFM2.5-2.6B de LiquidAI, una arquitectura híbrida compacta de unos 2.700 millones de parámetros, y la versión ajustada original corresponde a lugman-madhiai/LFM2.5-2.6B-TauBanking-SFT-01, entrenada para tareas del sector bancario (TauBanking).

La relevancia de esta ficha radica en la especialización vertical: en lugar de un modelo generalista, se trata de un SFT enfocado en banca, con pesos disponibles en formato GGUF para su ejecución local mediante llama.cpp, Ollama, LM Studio o koboldcpp. Esto lo hace atractivo para entornos donde la privacidad de los datos financieros es crítica, ya que el modelo puede desplegarse íntegramente on-premise sin enviar información a APIs externas.

Con 2.697.198.592 parámetros y cuantizaciones que van desde F16 (5,2 GB) hasta Q2_K, es un modelo suficientemente ligero para ejecutarse en GPUs de consumo e incluso en CPUs modernas, manteniendo la licencia Apache 2.0 del modelo base, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2.5 (hibrida, basada en LiquidAI/LFM2.5-2.6B) |
| Parametros totales | 2.697.198.592 (≈2,7 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo deriva de LFM2.5-2.6B de LiquidAI, la familia de modelos compactos de Liquid AI basada en arquitecturas hibridas que combinan bloques convolucionales tipo gated linear con bloques de attention estandar, disenada para ofrecer latencias bajas y eficiencia en dispositivos con recursos limitados. Los detalles concretos de la composicion de bloques, la longitud de contexto y el vocabulario no estan disponibles en la model card de esta cuantizacion.

El ajuste fino (SFT) se realizo sobre el dataset TauBanking, orientado al dominio bancario. No se ha publicado informacion sobre el numero de ejemplos de entrenamiento, la composicion del dataset, ni sobre el uso de tecnicas posteriores como RLHF o DPO. Las cuantizaciones GGUF incluidas en este repositorio fueron generadas con llama.cpp, abarcando trece niveles de precision desde F16 hasta Q2_K.

## Capacidades

- Generacion de texto conversacional orientada al dominio bancario (pipeline text-generation, tag conversational).
- Especializacion en tareas de banca mediante SFT sobre TauBanking (atencion al cliente financiera, consultas del dominio, segun el objetivo del dataset original).
- Compatibilidad total con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible.
- Ejecucion local y offline, adecuada para escenarios con requisitos de privacidad de datos financieros.
- No hay evidencia de capacidades de vision, audio, tool calling o modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Chatbot de atencion al cliente bancaria on-premise: al ser un SFT del dominio bancario y ejecutarse localmente, permite desplegar asistentes conversacionales que gestionan consultas de clientes sin exponer datos sensibles a servicios externos.
- Prototipado rapido de asistentes financieros: el tamano de 2,7 B parametros y las cuantizaciones de 4 bits permiten iterar en portatiles o estaciones de trabajo sin infraestructura GPU dedicada.
- Clasificacion y enrutado de consultas bancarias: su especializacion en el dominio lo hace util como clasificador de intenciones (incidencias con tarjetas, transferencias, hipotecas) antes de escalar a un modelo mayor.
- Generacion de respuestas plantilla en flujos RAG bancarios: combinado con un retriever sobre documentacion interna del banco, puede redactar respuestas basadas en documentos recuperados.
- Evaluacion y comparacion de SFTs verticales: util como referencia para equipos de investigacion que estudian como el fine-tuning de dominio afecta a modelos compactos frente a sus bases generalistas.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q2_K a Q8_0, puede ejecutarse en CPUs modernas o GPUs de gama media, adecuado para oficinas o sucursales sin infraestructura cloud.
- Generacion de datos sinteticos del dominio bancario: puede emplearse para ampliar datasets de entrenamiento de otros sistemas de NLP financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni evaluaciones especificas del dominio bancario, y el propio autor advierte: "Banking SFT model. Evaluate before use."

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada segun el tamano de cada fichero GGUF):
  - F16: ~5,2 GB
  - Q8_0: ~2,9 GB
  - Q6_K: ~2,2 GB
  - Q5_K_M: ~1,9 GB
  - Q4_K_M: ~1,6 GB (cuantizacion recomendada por el autor)
  - Q2_K: ~1,1 GB
- GPUs recomendadas: cualquier GPU con mas de 2 GB de VRAM para las cuantizaciones de 4 bits (por ejemplo, GTX 1660, RTX 3060, RTX 4060 o superiores). No se requieren GPUs de datacenter como A100 o H100.
- Consumer GPUs: cabe con holgura en practicamente cualquier GPU moderna; incluso en la cuantizacion F16 completa, GPUs de 6-8 GB de VRAM son suficientes.
- Ejecucion en CPU: viable con llama.cpp; con Q4_K_M se necesitan unos 2 GB de RAM adicionales al peso del modelo, por lo que cualquier equipo con 8 GB de RAM es adecuado.
- Opciones de despliegue: llama.cpp (ejemplo del autor: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; dada la arquitectura compacta de la familia LFM orientada a eficiencia, se esperan latencias bajas en hardware de consumo, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Dominio | Licencia |
|---|---|---|---|---|
| LFM2.5-2.6B-TauBanking-SFT-01-GGUF | 2,7 B | GGUF (F16 a Q2_K) | Banca (SFT) | Apache 2.0 |
| LiquidAI/LFM2.5-2.6B (base) | 2,7 B | safetensors / GGUF comunitario | Generalista | Apache 2.0 |
| Qwen2.5-3B-Instruct | 3 B | safetensors / GGUF comunitario | Generalista | Qwen Research (uso comercial condicionado) |
| Gemma 2 2B IT | 2,6 B | safetensors / GGUF comunitario | Generalista | Gemma Terms of Use |

Frente a alternativas generalistas de tamano similar como Qwen2.5-3B-Instruct o Gemma 2 2B IT, este modelo ofrece especializacion en banca y licencia Apache 2.0 sin condiciones adicionales, a costa de un rendimiento generalista presumiblemente inferior y de la ausencia de benchmarks publicados que permitan verificar la calidad del ajuste de dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un SFT sobre un dataset bancario no descrito publicamente, pueden heredarse sesgos del dominio financiero y del modelo base LiquidAI/LFM2.5-2.6B.
- Riesgo de alucinacion: elevado en consultas que requieren datos financieros precisos (tipos de interes, comisiones, normativa). No debe usarse como fuente de asesoramiento financiero sin verificacion humana y anclaje en fuentes (RAG).
- Limitaciones de contexto: la longitud de contexto no esta especificada en la model card; debe consultarse la documentacion del modelo base LiquidAI/LFM2.5-2.6B antes de disenar aplicaciones con documentos largos.
- Idiomas: no disponibles en los metadatos; conviene validar el rendimiento en castellano antes de produccion.
- Licencia: Apache 2.0, sin restricciones para uso comercial. No obstante, conviene revisar cualquier termino asociado al dataset TauBanking original.
- El propio autor incluye un disclaimer explicito: "Banking SFT model. Evaluate before use." Se recomienda una evaluacion rigurosa con datos propios del dominio antes de cualquier despliegue en produccion.
- La cuantizaciones mas agresivas (Q3 y Q2_K) pueden degradar notablemente la calidad de las respuestas; el autor recomienda Q4_K_M como punto de equilibrio.
- Popularidad muy baja del repositorio (573 descargas, 1 like), lo que implica escasa validacion comunitaria y posible ausencia de correcciones o mejoras futuras.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tinyopsec/LFM2.5-2.6B-TauBanking-SFT-01-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Modelo SFT original (safetensors): https://huggingface.co/lugman-madhiai/LFM2.5-2.6B-TauBanking-SFT-01
- Organizacion de LiquidAI en HuggingFace: https://huggingface.co/LiquidAI
- Paper, blog o demo: no disponibles
