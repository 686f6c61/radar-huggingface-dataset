# tinyopsec/MiniCPM5-1B-Uncensored-GGUF

## Resumen

MiniCPM5-1B-Uncensored-GGUF es una coleccion de cuantizaciones GGUF del modelo `sahilchachra/MiniCPM5-1B-Uncensored`, una version "abliterated" (sin censura) del MiniCPM5-1B de OpenBMB. El autor de esta publicacion, tinyopsec, se limita a generar los ficheros GGUF con llama.cpp a partir del modelo base afinado, sin aportar entrenamiento adicional. El modelo resuelve el problema de desplegar una variante sin filtros de rechazo en entornos de investigacion de seguridad, red-teaming y pruebas de robustez, en formatos ejecutables en CPU y GPU de consumo.

Se trata de un transformer decoder-only de aproximadamente 1.080 millones de parametros (1,08 B), con un tamano de repo de 10,8 GB que agrupa todas las cuantizaciones desde F16 hasta Q2_K. La relevancia actual reside en que permite ejecutar un modelo conversacional de ~1 B en hardware muy modesto (incluso en CPU con llama.cpp) y en que la variante abliterated elimina las capas de rechazo del modelo original, algo que interesa a quienes auditan comportamientos de modelos.

No se dispone de informacion publicada sobre la longitud de contexto, la composicion del dataset de entrenamiento ni los idiomas soportados en la informacion proporcionada; estos datos deben consultarse en la model card del modelo base `openbmb/MiniCPM5-1B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (MiniCPM5, segun modelo base) |
| Parametros totales | 1.080.632.832 (~1,08 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | other (remite a la licencia del modelo base `openbmb/MiniCPM5-1B`) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo base MiniCPM5-1B de OpenBMB, un transformer decoder-only de aproximadamente 1,08 B de parametros. Sobre ese modelo, `sahilchachra/MiniCPM5-1B-Uncensored` aplica una tecnica de "abliteration", que consiste en modificar los pesos (habitualmente en las direcciones de activacion asociadas al rechazo) para reducir la tendencia del modelo a negarse a responder. Esta publicacion no entrena ni afina el modelo: unicamente produce las cuantizaciones GGUF con llama.cpp a partir del modelo abliterated.

No se dispone en la informacion proporcionada de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se detalla el procedimiento exacto de abliteration aplicado por el autor del modelo base.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`text-generation`, tag `conversational`).
- Ejecucion local en CPU y GPU mediante llama.cpp, Ollama, LM Studio, koboldcpp y otros runtimes compatibles con GGUF.
- Comportamiento sin censura (uncensored/abliterated): reduce los rechazos ante peticiones que el modelo original declinaria, orientado a investigacion de seguridad.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Red-teaming y auditoria de seguridad: el modelo permite estudiar como responde una variante abliterated frente a la original, comparando tasas de rechazo y comportamientos ante prompts adversariales en un entorno controlado.
- Investigacion sobre alineacion y abliteration: util para reproducir y analizar el efecto de la eliminacion de capas de rechazo en un modelo de ~1 B, con coste computacional bajo.
- Despliegue en hardware de consumo: con la cuantizacion Q4_K_M (recomendada por el autor) el modelo puede ejecutarse en portatiles sin GPU dedicada mediante llama.cpp u Ollama, lo que facilita prototipado rapido.
- Pruebas de pipelines de inferencia GGUF: sirve como banco de pruebas ligero para validar integraciones con llama.cpp, koboldcpp o LM Studio antes de escalar a modelos mayores.
- Generacion de texto creativo sin filtros en entornos de investigacion: escritura de narrativa o dialogos donde se necesita evaluar el comportamiento del modelo sin las restricciones del original.
- Evaluacion comparativa de cuantizaciones: al ofrecer 13 variantes (de F16 a Q2_K), permite medir el impacto de la cuantizacion en la calidad de salida y en el throughput sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (aproximada, segun el tamano de los ficheros GGUF de un modelo de ~1,08 B):
  - F16: ~2,0 GB.
  - Q8_0: ~1,1 GB.
  - Q6_K: ~0,9 GB.
  - Q5_K_M / Q5_K_S / Q5_0: ~0,8 GB.
  - Q4_K_M / Q4_K_S / Q4_0: ~0,7 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: ~0,6 GB.
  - Q2_K: ~0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16; para cuantizaciones de 4 bits basta con GPUs integradas o de gama baja. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU, dado el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-1B-Uncensored-GGUF | ~1,08 B | no disponible | other | GGUF | Variante abliterated cuantizada |
| sahilchachra/MiniCPM5-1B-Uncensored | ~1,08 B | no disponible | no disponible | safetensors (presumible) | Modelo base abliterated del que deriva esta publicacion |
| openbmb/MiniCPM5-1B | ~1,08 B | no disponible | no disponible | no disponible | Modelo original de OpenBMB, con censura/alineacion estandar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo sin censura (abliterated): puede generar contenido ofensivo, inseguro o inapropiado; el autor lo declara explicitamente para investigacion de seguridad y red-teaming.
- Riesgo elevado de alucinacion: por su tamano (~1,08 B), la fiabilidad factual es limitada en comparacion con modelos mayores.
- Licencia "other" que remite a la del modelo base `openbmb/MiniCPM5-1B`; es imprescindible revisar los terminos del modelo original antes de cualquier uso comercial, ya que pueden restringirlo.
- Longitud de contexto e idiomas soportados no documentados en esta publicacion; deben verificarse en la model card del modelo base.
- Las cuantizaciones agresivas (Q3_K_S, Q2_K) degradan la calidad de salida de forma notable en modelos pequenos; se recomienda Q4_K_M o superior para uso real.
- No se documenta el procedimiento de abliteration aplicado, lo que dificulta reproducir o auditar el proceso.
- No apto para produccion sin una evaluacion previa exhaustiva de seguridad y calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-1B-Uncensored-GGUF
- Modelo base abliterated: https://huggingface.co/sahilchachra/MiniCPM5-1B-Uncensored
- Modelo original de OpenBMB: https://huggingface.co/openbmb/MiniCPM5-1B
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
