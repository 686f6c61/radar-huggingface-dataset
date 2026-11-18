# TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF

## Resumen

Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF es un conjunto de cuantizaciones GGUF publicadas por TokenTinkerer a partir del modelo peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP, un modelo de tipo MoE (mixture of experts) de 35.505.251.456 parametros totales con 3.000 millones de parametros activos, derivado de la familia Qwen3.5 MoE. El modelo base ha sido sometido a un proceso de abliteration (eliminacion de mecanismos de rechazo) y esta etiquetado como uncensored. Esta publicacion no es un modelo nuevo, sino una escalera de diez cuantizaciones GGUF (de 3,34 a 6,64 bits por peso) generadas con imatrix y disenadas para ofrecer una mejor relacion tamano-calidad que las cuantizaciones dinamicas del autor original.

La relevancia de esta ficha reside en su metodologia: el autor publica mediciones de divergencia KL (KLD) frente al fichero de referencia, con error estandar por chunk, sobre dos corpus fijos (codigo y wikitext-2), y compara directamente con la escalera de cuantizaciones Unsloth-Dynamic del autor del modelo base. Ademas, el modelo incorpora una cabeza MTP (multi-token prediction) que habilita decodificacion especulativa en llama.cpp, lo que puede mejorar el throughput de generacion.

Es importante senalar que no existe una version en precision completa de este modelo: la fuente de todas las cuantizaciones es el fichero UD-Q8_K_XL (~8,6 bpw) del autor original, que actua simultaneamente como referencia de las mediciones. El repo ocupa 205 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture of experts), familia Qwen3.5 MoE, con cabeza MTP (multi-token prediction) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000 millones (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ3_XXS, IQ3_XS, Q3_K_S, Q3_K_M, IQ4_XS, IQ4_NL, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (10 niveles, de 3,34 a 6,64 bpw) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mixture of experts con 35.505 millones de parametros totales y aproximadamente 3.000 millones activos por token, perteneciente a la familia Qwen3.5 MoE. Incluye una cabeza MTP (multi-token prediction) injertada que permite decodificacion especulativa en llama.cpp, lo que puede reducir la latencia de generacion al predecir varios tokens por paso. El modelo ha sido sometido a abliteration, un proceso de modificacion de pesos que elimina la direccion de rechazo aprendida, dando como resultado un modelo uncensored.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO en la informacion proporcionada. Esta publicacion concreta es un conjunto de cuantizaciones: cada fichero se genera con imatrix y mantiene la misma forma tensor a tensor que la escalera TTQ publicada por el mismo autor para Qwen3.6-35B-A3B, con los mismos diez ftypes en las mismas posiciones sobre 733 tensores del cuerpo, y la cabeza MTP a la precision que entrega el upstream. La fuente de todas las cuantizaciones es el fichero UD-Q8_K_XL (~8,6 bpw) del autor original, no una version en fp16/bf16.

## Capacidades

- Generacion de texto conversacional y de codigo, con enfasis en tareas de programacion segun el nombre y los corpus de evaluacion del autor (70% codigo, 10% diff, 10% terminal, 10% config).
- Razonamiento multi-paso y agentico, segun el corpus de evaluacion empleado (agentic eval split).
- Decodificacion especulativa mediante cabeza MTP en llama.cpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues limitadas a ingles y chino.
- Modo thinking explicito: no disponible en la informacion proporcionada.
- Vision o audio: no disponible.

## Casos de uso

- Asistente de programacion en local: el modelo puede integrarse en editores o terminales para autocompletado y generacion de codigo, con cuantizaciones desde 13,82 GiB que caben en GPUs de consumo alta (24 GB) y permiten ejecucion offline.
- Generacion y revision de diffs en pipelines de CI: el corpus de evaluacion incluye un 10% de diffs, lo que sugiere capacidad para proponer parches y revisar cambios de codigo en flujos automatizados.
- Automatizacion de tareas de terminal: el 10% de corpus de terminal indica entrenamiento o evaluacion orientada a comandos de shell, util para agentes de operaciones.
- Generacion de ficheros de configuracion: el 10% de corpus de config apunta a la produccion de YAML, JSON, TOML y similares en entornos de infraestructura.
- Despliegue en entornos con restricciones de VRAM: la escalera de diez niveles permite elegir el punto de la curva tamano-calidad, desde 13,82 GiB (IQ3_XXS) hasta 27,47 GiB (Q6_K), adaptandose a GPUs de 16, 24, 32 o 48 GB.
- Investigacion sobre cuantizacion: el conjunto publica mediciones de KLD con error estandar por chunk sobre dos corpus fijos, lo que lo convierte en material util para estudiar el impacto de la cuantizacion en modelos MoE.
- Servicio conversacional sin filtros en entornos controlados: al ser un modelo abliterated, puede emplearse en investigacion sobre comportamiento de modelos sin rechazo, siempre con aislamiento a nivel de sistema operativo.

## Benchmarks y rendimiento

El autor publica mediciones de divergencia KL (KLD) frente al fichero de referencia UD-Q8_K_XL, sobre 40 chunks fijos de 512 tokens, con error estandar por chunk. Se comparan con los niveles Unsloth-Dynamic del autor original, medidos con el mismo protocolo y en la misma maquina.

| Fichero | Tipo | GiB | bpw | KLD codigo | top-1 codigo | KLD wiki | top-1 wiki |
|---|---|---:|---:|---|---:|---|---:|
| TTQ-3.34bpw-IQ3_XXS | IQ3_XXS | 13,82 | 3,34 | 0,135265 ± 0,006145 | 89,33% | 0,121933 ± 0,002664 | 85,25% |
| TTQ-3.51bpw-IQ3_XS | IQ3_XS | 14,53 | 3,51 | 0,121448 ± 0,005077 | 90,22% | 0,112744 ± 0,002547 | 85,84% |
| TTQ-3.67bpw-Q3_K_S | Q3_K_S | 15,20 | 3,67 | 0,107063 ± 0,004688 | 90,56% | 0,091221 ± 0,002044 | 87,28% |
| UD-Q3_K_XL | — | 16,05 | ~3,5 | 0,107430 ± 0,005629 | 91,09% | 0,090358 ± 0,002192 | 87,19% |
| TTQ-3.92bpw-Q3_K_M | Q3_K_M | 16,22 | 3,92 | 0,091761 ± 0,004791 | 91,51% | 0,073367 ± 0,001828 | 88,62% |
| UD-IQ4_XS | — | 16,88 | ~4,0 | 0,095291 ± 0,004836 | 91,38% | 0,077731 ± 0,001830 | 88,09% |
| TTQ-4.17bpw-IQ4_XS | IQ4_XS | 17,26 | 4,17 | 0,078644 ± 0,003888 | 91,86% | 0,069188 ± 0,001705 | 89,17% |
| TTQ-4.49bpw-IQ4_NL | IQ4_NL | 18,56 | 4,49 | 0,066057 ± 0,004271 | 92,82% | 0,045736 ± 0,001274 | 91,06% |
| TTQ-4.87bpw-Q4_K_M | Q4_K_M | 20,12 | 4,87 | 0,060243 ± 0,004486 | 93,53% | 0,038743 ± 0,001042 | 91,41% |
| UD-Q4_K_XL | — | 21,19 | ~4,7 | 0,051905 ± 0,003829 | 93,64% | 0,035064 ± 0,001049 | 92,04% |
| TTQ-5.54bpw-Q5_K_S | Q5_K_S | 22,90 | 5,54 | 0,043374 ± 0,002857 | 94,37% | 0,031178 ± 0,000901 | 92,77% |
| TTQ-6.00bpw-Q5_K_M | Q5_K_M | 24,81 | 6,00 | 0,039146 ± 0,003595 | 95,10% | 0,023410 ± 0,000729 | 93,44% |
| UD-Q5_K_XL | — | 25,13 | ~5,5 | 0,043198 ± 0,004229 | 95,00% | 0,022749 ± 0,000627 | 93,75% |
| TTQ-6.64bpw-Q6_K | Q6_K | 27,47 | 6,64 | 0,036423 ± 0,003411 | 95,17% | 0,020246 ± 0,000713 | 94,14% |
| UD-Q6_K_XL | — | 30,02 | ~6,6 | 0,034978 ± 0,003757 | 95,36% | 0,020072 ± 0,000794 | 94,20% |

Segun el autor, comparando a igual tamano (GiB), esta escalera obtiene menor KLD que la del autor original en 7 de 7 tamanos sobre codigo (media -9,3%) y en 6 de 7 sobre prosa, con hasta un 20% de mejora en wikitext. Tres de los diez niveles quedan por debajo del suelo de la escalera original, y el nivel superior es 2,55 GiB mas pequeno que su Q6_K_XL. No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,82 GiB (IQ3_XXS) y 27,47 GiB (Q6_K) solo de pesos, mas overhead de contexto KV cache.
- GPUs recomendadas: RTX 4090 (24 GB) para niveles hasta Q5_K_S (22,90 GiB) con contexto corto; A100 40 GB, H100 o RTX A6000 48 GB para los niveles Q5_K_M y Q6_K con contexto amplio.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) para los niveles IQ3_XXS a Q5_K_S; en GPUs de 16 GB solo los niveles mas bajos con contexto reducido.
- Opciones de despliegue: llama.cpp (libreria declarada), y por compatibilidad de formato GGUF, servidores basados en llama.cpp como Ollama o llama-server; vLLM y TGI no soportan GGUF de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; la cabeza MTP permite decodificacion especulativa en llama.cpp, lo que puede mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cyber-Tiel-Coder-35B-A3B-MTP-TTQ | 35,5B | ~3B | no disponible | MIT | GGUF | Este modelo; 10 niveles de cuantizacion con KLD medido |
| Cyber-Tiel-Coder-35B-A3B-GGUF-MTP (original) | 35,5B | ~3B | no disponible | MIT | GGUF | Escalera Unsloth-Dynamic; referencia de la comparacion; 5 niveles publicados |
| Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ | ~35B | ~3B | no disponible | no disponible | GGUF | Escalera TTQ del mismo autor sobre otro modelo de la familia; misma estructura tensor a tensor |

La comparacion con modelos de la misma categoria fuera de la familia Qwen MoE no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated (uncensored): no rechaza peticiones y, con acceso a herramientas, puede causar dano real. El autor recomienda leer la model card del modelo base y aislarlo a nivel de sistema operativo.
- No existe version en precision completa: todas las cuantizaciones derivan del fichero UD-Q8_K_XL (~8,6 bpw), que tambien actua como referencia de las mediciones de KLD. Una fraccion desconocida de la divergencia es heredada de ese fichero.
- Las cifras de KLD son relativas a esa referencia, no a precision completa; las comparaciones entre ficheros de la misma escalera siguen siendo validas por compartir referencia.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; aplicable el riesgo habitual de los modelos de lenguaje.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible; no se puede garantizar el comportamiento en conversaciones de contexto largo.
- Licencia MIT: permite uso comercial, pero la ausencia de filtros de seguridad traslada al desplegador toda la responsabilidad legal y etica.
- El repo ocupa 205 GB en total; descargar la escalera completa requiere espacio considerable y los ficheros individuales van de 13,82 a 27,47 GiB.
- El modelo base no ha pasado por un proceso documentado de alineacion tras la abliteration; el comportamiento en produccion puede ser impredecible.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/TokenTinkerer/Cyber-Tiel-Coder-35B-A3B-MTP-TTQ-GGUF
- Modelo base: https://huggingface.co/peculiar-ragdoll/Cyber-Tiel-Coder-35B-A3B-GGUF-MTP
- Escalera TTQ de referencia del mismo autor: https://huggingface.co/TokenTinkerer/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-TTQ-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp
