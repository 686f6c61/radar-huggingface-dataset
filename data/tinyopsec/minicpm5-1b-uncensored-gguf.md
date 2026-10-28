# tinyopsec/MiniCPM5-1B-Uncensored-GGUF

## Resumen

MiniCPM5-1B-Uncensored-GGUF es un repositorio de cuantizaciones en formato GGUF generado por el usuario `tinyopsec` a partir de `sahilchachra/MiniCPM5-1B-Uncensored`, una versión «abliterated» (sin censura) del modelo base `openbmb/MiniCPM5-1B`. El modelo original es un transformer decoder-only denso de 1.080.632.832 parámetros (aproximadamente 1,08 mil millones), orientado a generación de texto conversacional. Este repositorio no aporta pesos nuevos ni entrenamiento adicional: su valor está en empaquetar el modelo en 13 niveles de cuantización (de F16 a Q2_K) listos para ejecutarse con llama.cpp, Ollama, LM Studio o koboldcpp.

La relevancia del artefacto es doble. Por un lado, permite ejecutar un modelo de la familia MiniCPM en hardware muy modesto, incluido CPU, gracias a ficheros que van desde los 2,0 GB del F16 hasta fracciones de esa cifra en las cuantizaciones de 4 y 2 bits. Por otro, el proceso de «abliteration» elimina total o parcialmente los mecanismos de rechazo del modelo alineado, lo que lo convierte en una herramienta pensada explícitamente por su autor para investigación en seguridad y red-teaming, no para despliegue en producción orientado al usuario final.

La información publicada por el autor es muy escasa: no se documentan la longitud de contexto, los idiomas soportados, la composición del dataset ni resultados de benchmarks. La model card se limita a listar los ficheros GGUF disponibles, un ejemplo de uso con `llama-cli` y una advertencia sobre la naturaleza sin censura del modelo, remitiendo a la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (por la familia MiniCPM; la model card no lo especifica) |
| Parametros totales | 1.080.632.832 (aproximadamente 1,08 B) |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | `other`; el autor remite a la licencia del modelo base `openbmb/MiniCPM5-1B` |
| Formato de pesos | GGUF (13 ficheros) |
| Modelo base | `openbmb/MiniCPM5-1B` (vía `sahilchachra/MiniCPM5-1B-Uncensored`) |
| Pipeline | `text-generation` |
| Libreria | `gguf` / compatible con llama.cpp |
| Tamano del repositorio | 10,8 GB (suma de todas las cuantizaciones) |
| Fecha de creacion | 2026-10-28 |

## Arquitectura y entrenamiento

La model card de este repositorio no documenta la arquitectura interna, los datos de entrenamiento ni el proceso de alineación. Lo único verificable es que se trata de una conversión a GGUF, realizada con llama.cpp, de un modelo derivado de `openbmb/MiniCPM5-1B`, que a su vez pertenece a la familia MiniCPM de transformers decoder-only densos. El recuento exacto de parámetros (1.080.632.832) confirma un modelo de escala ~1B, adecuado para inferencia en CPU y en GPUs de consumo.

Respecto al proceso de «abliteration», tampoco se aportan detalles técnicos: no se especifica si se aplicó una dirección de rechazo calculada por diferencias de activaciones, qué capas se modificaron, ni qué conjunto de datos se usó para evaluar la supresión de rechazos. Sí queda constancia de la cadena de derivación (`openbmb/MiniCPM5-1B` → `sahilchachra/MiniCPM5-1B-Uncensored` → este repositorio GGUF), lo que implica que cualquier modificación de pesos se produjo en el paso intermedio y que aquí solo se ha aplicado cuantización con pérdida.

No se dispone de información sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas (atención lineal, decodificación especulativa, modos de razonamiento). Todo ello debe consultarse en la model card del modelo base.

## Capacidades

- Generación de texto conversacional en formato de chat, según el pipeline declarado (`text-generation`, tag `conversational`).
- Ejecución local y offline en entornos con recursos limitados gracias a las cuantizaciones de 2 a 8 bits.
- Respuestas sin los filtros de rechazo habituales del modelo alineado, lo que permite explorar comportamientos que el modelo original bloquearía.
- Compatibilidad con cualquier runtime GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con la API de OpenAI (`endpoints_compatible` en los tags).
- Ajuste fino posterior sobre las cuantizaciones, aunque con las limitaciones propias de la cuantización.
- No hay evidencia documentada de soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio, modo «thinking» ni capacidades multilingües verificadas.

## Casos de uso

- Red-teaming y auditoría de seguridad: el modelo sirve para generar prompts y respuestas adversarias con las que estresar clasificadores de contenido, filtros de moderación y salvaguardas de otros sistemas antes de desplegarlos.
- Investigación sobre alineación y abliteration: permite estudiar empíricamente qué capacidades y qué coherencia se degradan al eliminar la dirección de rechazo, comparando salidas contra el modelo base alineado.
- Generación de datasets adversarios: producción por lotes de ejemplos «jailbreak» o de contenido sensible controlado para entrenar detectores y clasificadores de toxicidad, con la ventaja de ejecutarse en local sin depender de APIs externas.
- Prototipado rápido de asistentes conversacionales en local: con el fichero Q4_K_M (recomendado por el autor) se puede validar el flujo de una aplicación de chat en un portátil sin GPU antes de invertir en un modelo mayor.
- Despliegue en dispositivos de borde o entornos aislados: al ocupar menos de 1 GB en Q4, es viable en mini-PC, Raspberry Pi 5 y contenedores sin acelerador, para asistentes de texto sin conectividad.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 13 niveles distintos, lo que permite medir la degradación de calidad y el ahorro de memoria entre F16, Q8_0, Q5_K_M, Q4_K_M y Q2_K sobre la misma tarea.
- Pruebas de robustez de sistemas de moderación en producción: simular entradas que un usuario malintencionado podría construir para verificar que las capas de filtrado externas, y no solo el modelo, sostienen la política de contenido.
- Base para ajuste fino con LoRA/QLoRA en dominios concretos donde se prefiera partir de un modelo sin sesgo de rechazo y añadir después las restricciones necesarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen valores de MMLU, HumanEval, GSM8K, MT-Bench ni perplejidad de las distintas cuantizaciones. Tampoco se documenta el impacto medido del proceso de abliteration sobre dichas métricas.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia (calculada a partir de 1,08 B de parámetros; cifras orientativas, no publicadas por el autor):
  - F16: ~2,0 GB (dato indicado en la model card).
  - Q8_0: ~1,1-1,2 GB.
  - Q5_K_M: ~0,8 GB.
  - Q4_K_M: ~0,7 GB (cuantización recomendada por el autor).
  - Q2_K: ~0,45 GB.
  - Añadir entre 0,2 y 1 GB adicionales para la caché KV según la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para F16 y 1 GB para Q4; RTX 3060/4060, RTX 4090, A100 y H100 lo ejecutan con holgura y quedan limitadas por el ancho de banda de memoria, no por la capacidad.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas de los últimos diez años, y también en iGPU con memoria unificada.
- Cabe en CPU: sí; el modelo está pensado para ello. Con Q4_K_M es cómodo en cualquier x86 moderno y viable en ARM (Raspberry Pi 5, Apple Silicon).
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, koboldcpp, y servidores compatibles con la API de OpenAI. vLLM y TGI no se citan en la documentación; su soporte GGUF es parcial y no está verificado para este repositorio.
- Latencia y throughput: no disponibles. A modo de orden de magnitud, en CPU un modelo de 1 B en Q4 suele generar del orden de decenas de tokens por segundo, pero no hay medición publicada para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| tinyopsec/MiniCPM5-1B-Uncensored-GGUF | 1,08 B | No disponible | `other` (heredada del base) | GGUF, 13 cuantizaciones | No |
| openbmb/MiniCPM5-1B (modelo base) | 1,08 B | No disponible en esta ficha | Ver model card del base | Pesos originales + GGUF de terceros | Ver model card del base |
| Qwen2.5-1.5B | ~1,54 B | 32 768 tokens (documentación pública del modelo) | Apache-2.0 | Muy amplia, ecosistema GGUF maduro | Sí |
| Llama 3.2 1B | ~1,24 B | 128 000 tokens (documentación pública del modelo) | Licencia comunitaria Llama 3.2 | Muy amplia, GGUF oficial | Sí |
| Gemma 3 1B | ~1 B | 32 768 tokens (documentación pública del modelo) | Gemma Terms of Use | Amplia, GGUF disponible | Sí |

Nota: los datos de los modelos alternativos provienen de su documentación pública y no de la búsqueda realizada para esta ficha; conviene verificarlos antes de citarlos. La comparación de rendimiento con este modelo no es posible porque no hay benchmarks publicados del mismo, y en cualquier caso el proceso de abliteration hace que las métricas del modelo alineado no sean directamente trasladables.

## Limitaciones y advertencias

- Modelo sin censura: el autor lo declara explícitamente para investigación en seguridad y red-teaming. No es apto para aplicaciones orientadas al usuario final sin capas de filtrado externas.
- El proceso de abliteration suele degradar la coherencia, la utilidad general y la capacidad de seguir instrucciones. No hay medición publicada de esa degradación en este caso.
- Riesgo elevado de alucinación: a escala ~1 B, la precisión factual es limitada incluso en el modelo base; la modificación de pesos puede agravarla.
- No hay información sobre sesgos. Un modelo sin rechazos puede reproducir con mayor facilidad estereotipos y contenido dañino presente en los datos de entrenamiento.
- Idiomas soportados no documentados; no se puede asumir un rendimiento aceptable en castellano sin evaluarlo.
- Longitud de contexto desconocida; planificar el despliegue sin asumir ventanas largas.
- Licencia `other`: es obligatorio revisar los términos de `openbmb/MiniCPM5-1B` antes de cualquier uso comercial. El autor no concede permisos adicionales y remite al modelo base.
- El repositorio tiene 0 descargas y 0 «likes» en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de uso ni de validación por parte de la comunidad.
- Al ser una cuantización con pérdida, los ficheros de 2 y 3 bits pueden producir degradaciones notables frente a Q4_K_M o superiores.
- No se documentan capacidades de tool calling ni de agentes; no asumirlas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tinyopsec/MiniCPM5-1B-Uncensored-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Modelo intermedio abliterated: https://huggingface.co/sahilchachra/MiniCPM5-1B-Uncensored
- llama.cpp (herramienta de cuantización y runtime): https://github.com/ggml-org/llama.cpp
