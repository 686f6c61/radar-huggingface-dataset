# tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF

## Resumen

MiniCPM5-2B-SFT-Pashto-GGUF es la versión cuantizada en formato GGUF de nassimjp/MiniCPM5-2B-SFT-Pashto, un ajuste fino del modelo base openbmb/MiniCPM5-2B orientado al idioma pastún (پښتو). El modelo original pertenece a la familia MiniCPM desarrollada por OpenBMB, y esta variante ha sido adaptada mediante supervisión fina (SFT) para mejorar el rendimiento en pastún manteniendo capacidades en inglés. El repositorio lo publica el usuario tinyopsec y su función principal es facilitar el despliegue local del modelo en entornos con recursos limitados mediante cuantización.

El modelo cuenta con 2.516.944.896 parámetros totales (aproximadamente 2,5 mil millones) y emplea una arquitectura LlamaForCausalLM, según indica la model card. La relevancia actual reside en que ofrece una vía práctica para ejecutar un modelo conversacional bilingüe pastún-inglés en hardware de consumo, con múltiples niveles de cuantización que van desde F16 (~4,6 GB) hasta Q2_K (~0,7 GB), lo que permite ajustar el equilibrio entre calidad y requisitos de memoria.

La licencia Apache 2.0 facilita su uso comercial y su integración en productos, algo poco habitual en modelos centrados en idiomas de bajos recursos. El repositorio acumula 1314 descargas, lo que sugiere un interés moderado pero constante en la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 2.516.944.896 (~2,5 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | pastún (ps), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamano del repo | 21,3 GB |
| Modelo base | nassimjp/MiniCPM5-2B-SFT-Pashto (a su vez, openbmb/MiniCPM5-2B) |
| Libreria | gguf / llama-cpp |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo LlamaForCausalLM, tal como se especifica en la model card. El modelo base MiniCPM5-2B incorpora, según la información disponible, un modo de razonamiento híbrido con modos Think y No-Think, lo que permite alternar entre respuestas directas y cadenas de razonamiento explícitas. El ajuste fino SFT se realizó sobre el modelo base para adaptarlo al pastún, aunque no se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de esta publicación es la cuantización en múltiples niveles GGUF para llama.cpp, que abarca desde F16 hasta Q2_K. No se dispone de información sobre técnicas adicionales como decodificación especulativa o atención lineal en esta variante.

## Capacidades

- Generación de texto conversacional en pastún e inglés.
- Razonamiento híbrido con modos Think y No-Think heredados del modelo base MiniCPM5-2B.
- Conversación multi-turno (tag `conversational` en Hugging Face).
- Soporte de inferencia local mediante llama.cpp, llama-cpp-python, LM Studio y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio u otras capacidades especiales en la información proporcionada.

## Casos de uso

- Atención al cliente en pastún: el modelo puede gestionar conversaciones multi-turno en pastún e inglés, adecuado para servicios dirigidos a comunidades pastunohablantes con requisitos de privacidad que exijan despliegue local.
- Traducción y adaptación de contenidos entre pastún e inglés: útil para organizaciones humanitarias, medios de comunicación o editores que necesiten localizar material en pastún sin depender de APIs externas.
- Asistentes educativos bilingües: despliegue en escuelas o plataformas de aprendizaje con hardware modesto gracias a las cuantizaciones Q4_K_M (~1,4 GB) y Q3_K (~1 GB).
- Procesamiento de documentos en pastún: resumen y extracción de información de textos en pastún en entornos con recursos limitados, usando llama.cpp con cuantización Q4_K_M.
- Prototipado rápido de aplicaciones NLP en pastún: investigadores que necesiten un modelo base ajustado en pastún con licencia Apache 2.0 para experimentación y evaluación.
- Despliegue en dispositivos de borde: la cuantización Q2_K (~0,7 GB) permite ejecutar el modelo en dispositivos con poca RAM, como Raspberry Pi o mini-PC, para tareas de generación de texto simple.
- Integración en pipelines de datos: uso mediante llama-cpp-python para generar o aumentar datos sintéticos en pastún dentro de flujos de preprocesamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada según la model card: Q8_0 ~3 GB, Q4_K_M ~2 GB, Q2_K ~1,5 GB.
- Tamaños de archivo: F16 ~4,6 GB, Q8_0 ~2,4 GB, Q6_K ~1,9 GB, Q5_K_M/S ~1,6 GB, Q4_K_M ~1,4 GB, Q4_K_S ~1,3 GB, Q3_K_L ~1,1 GB, Q3_K_M ~1,0 GB, Q3_K_S ~0,9 GB, Q2_K ~0,7 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño, cualquier GPU consumer con al menos 2-4 GB de VRAM libre (por ejemplo, GTX 1650, RTX 3050, RTX 4060) puede ejecutar las cuantizaciones Q4 y Q5; las cuantizaciones Q8_0 y F16 requieren 3-5 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más de VRAM para cuantizaciones Q4_K_M y superiores; las cuantizaciones Q2/Q3 caben en 2 GB.
- Opciones de despliegue: llama.cpp (CLI), llama-cpp-python, LM Studio, Ollama (`ollama run hf.co/tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF:Q4_K_M`).
- Latencia y throughput: no disponible en la información proporcionada.
- Nota de la model card: para llama.cpp se recomienda `--min-p 0.0` para evitar repeticiones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF | ~2,5 B | no disponible | ps, en | Apache 2.0 | GGUF | Cuantizaciones múltiples, enfoque pastún |
| nassimjp/MiniCPM5-2B-SFT-Pashto | ~2,5 B | no disponible | ps, en | Apache 2.0 | safetensors (presumible) | Modelo base del que deriva esta cuantización |
| openbmb/MiniCPM5-2B | ~2,5 B | no disponible | no disponible | no disponible | no disponible | Modelo original sin ajuste a pastún |

No se dispone de información sobre benchmarks comparativos ni sobre otros modelos específicos para pastún de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El ajuste fino se centra en pastún e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- No se han publicado evaluaciones de sesgos, alucinación ni calidad lingüística en pastún; se recomienda validación humana antes de uso en producción.
- La longitud de contexto no está especificada en la información disponible, lo que impide planificar aplicaciones que requieran ventanas largas.
- El modelo base MiniCPM5-2B puede presentar sesgos heredados de sus datos de entrenamiento; el ajuste SFT no garantiza su mitigación.
- La cuantización Q2_K y Q3_K reducen la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- La model card advierte de que en llama.cpp conviene usar `--min-p 0.0` para evitar repeticiones, lo que sugiere que la generación puede degradarse con configuraciones de muestreo por defecto.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base openbmb/MiniCPM5-2B y del ajuste nassimjp, ya que la información disponible no detalla posibles restricciones adicionales.
- El repositorio tiene un solo like y 1314 descargas; es un proyecto de un autor individual, sin el respaldo de una organización grande, lo que puede afectar al mantenimiento a largo plazo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/MiniCPM5-2B-SFT-Pashto-GGUF
- Modelo base del ajuste: https://huggingface.co/nassimjp/MiniCPM5-2B-SFT-Pashto
- Modelo original: https://huggingface.co/openbmb/MiniCPM5-2B
