# Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP8

## Resumen

Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP8 es una exportación cuantizada del modelo Qwen/Qwen3-4B-SafeRL, publicada por Xylolabs y orientada específicamente al hardware de aceleración de Tenstorrent (arquitectura Tensix). El modelo base es un transformer denso de Qwen con 4.411.424.256 parámetros totales, derivado de la familia Qwen3-4B y ajustado con SafeRL por el equipo de Qwen. Esta exportación sustituye las 252 proyecciones declaradas del decodificador por matrices en formato block-floating-point de 8 bits (bfloat8_b), manteniendo el resto de tensores en BF16.

La relevancia de esta ficha no está en el modelo lingüístico en sí, sino en el formato de despliegue: es un checkpoint pensado para ejecutarse sobre aceleradores Tenstorrent mediante TT-NN y tt-metal, no sobre GPUs convencionales. El autor documenta verificaciones de empaquetado contra las comprobaciones nativas de TT-NN y contra el simulador Blackhole, además de una evaluación de divergencia KL frente al modelo original en BF16.

La licencia es Apache 2.0, heredada del modelo base, y los idiomas declarados son inglés y coreano. El repositorio ocupa 8,8 GB y acumula un volumen de descargas muy bajo (29 en el momento de la consulta), lo que indica que se trata de un artefacto de nicho para el ecosistema Tenstorrent más que de un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), derivado de Qwen/Qwen3-4B-SafeRL |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (bfloat8_b, 8,5 bits por peso) en 252 proyecciones del decodificador via GPTQ; BF16 en embeddings, cabeza atada y 147 tensores restantes |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 8,8 GB); empaquetado nativo TT-NN para despliegue en Tensix |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-SafeRL es un transformer denso de la familia Qwen3, ajustado mediante SafeRL (refuerzo con objetivos de seguridad) por el equipo de Qwen. Esta exportación no reentrena el modelo: aplica cuantización GPTQ sobre las 252 proyecciones declaradas del decodificador, con damping 0,1 y una calibración de 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano. Los pesos cuantizados se almacenan como BF16 sobre su rejilla block-floating-point, con un promedio de 8,5 bits por peso en las proyecciones cuantizadas y 9,82 bits por peso almacenado en el conjunto del checkpoint (9,226 bits por peso único si se comparte la cabeza atada una sola vez).

El detalle técnico diferencial es el empaquetado para Tensix: las 252 matrices declaradas pasan las comprobaciones de rejilla y de empaquetado nativo de TT-NN con el mismo formato que bfloat8_b, y el ejemplo de referencia se valida en el simulador Blackhole con TT-NN 0.81.1. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) que comprueban cada matriz cuantizada y, opcionalmente, realizan un viaje de ida y vuelta por la DRAM del dispositivo. El autor advierte explícitamente de que estas son comprobaciones de representación y que tt-transformers y tt-forge no se han validado con este checkpoint.

## Capacidades

- Generación de texto conversacional con plantilla de chat original de Qwen3, incluyendo modo thinking activable o desactivable mediante `enable_thinking`.
- Razonamiento multi-paso en modo thinking, según la política del template original.
- Capacidades multilingües limitadas a inglés y coreano según la declaración del autor.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso fuera del modo thinking.
- No se documentan capacidades de visión, audio ni multimodalidad.
- Inferencia verificada en hardware Tensix (Blackhole) y en el simulador, además de ejecución estándar con Transformers.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y validado contra las comprobaciones nativas de rejilla, por lo que es adecuado para prototipos de inferencia sobre Blackhole y para evaluar el rendimiento de la pila tt-metal con un modelo de 4B.
- Investigación en cuantización block-floating-point: sirve como referencia reproducible para estudiar la degradación de un modelo Qwen3-4B al pasar sus proyecciones a bfloat8_b con GPTQ, con métricas de divergencia KL publicadas frente al BF16 original.
- Validación de pipelines de empaquetado: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar la integridad de la representación antes de integrar el modelo en un runtime de producción.
- Asistentes conversacionales en inglés y coreano: el modelo conserva el tokenizador y la plantilla de chat originales, de modo que puede usarse en aplicaciones de chat con contexto multi-turno, siempre que el contexto declarado del base resulte suficiente.
- Evaluación comparativa de backends: al disponer de una referencia BF16 y de una variante Q4_K_M en llama.cpp, permite medir el impacto de distintas estrategias de cuantización sobre las mismas pruebas de texto inglés y coreano.
- Experimentación con modos de razonamiento: el flag `enable_thinking` del template permite alternar entre respuestas directas y cadenas de razonamiento, útil para comparar latencia y calidad en tareas de distinta complejidad.

## Benchmarks y rendimiento

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 7 | — |
| Esta exportación BFP8 | 0,001148298 | 27 | 7 | 0 |
| Q4_K_M equivalente (llama.cpp) | 0,061407450 | 29 | 7 | 0 |

La evaluación cubre 16.240 posiciones puntuadas sobre los mismos textos en inglés y coreano, en crudo y con plantilla de chat, en cuatro fragmentos de cada uno. El suelo de referencia en BF16 con llama.cpp sobre el texto seleccionado es 0,000316937. La exportación BFP8 pasa el criterio relativo de la regla 7 (0,018700 veces la KL de referencia, dentro del límite de 1,5 veces) sin pérdidas adicionales contadas. El autor indica explícitamente que no se reportan datos de velocidad.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 5,42 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Almacenamiento: repositorio de 8,8 GB; el conjunto empaquetado ocupa unos 5,42 GB (9,82 bits por peso almacenado) o unos 4,64 GB si se comparte la cabeza atada una sola vez.
- Hardware objetivo: aceleradores Tenstorrent con arquitectura Tensix (validado en simulador Blackhole con TT-NN 0.81.1); no se documenta compatibilidad con GPU NVIDIA o AMD para el formato empaquetado.
- Ejecución genérica: el ejemplo de Transformers 5.23.0 con PyTorch y `device_map="auto"` permite cargar el checkpoint en hardware convencional, aunque el autor no especifica VRAM mínima para ese camino.
- Opciones de despliegue: TT-NN / tt-metal para Tensix; Transformers con PyTorch para el camino genérico. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- Latencia y throughput: no disponibles; el autor indica que la velocidad no se reporta en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP8 | 4.411.424.256 | no disponible | BFP8 GPTQ + BF16, empaquetado TT-NN | Apache 2.0 | Hugging Face, 29 descargas |
| Qwen/Qwen3-4B-SafeRL (base) | 4B (familia Qwen3-4B) | no disponible | BF16 safetensors | Apache 2.0 | Hugging Face |
| Variante Q4_K_M citada en la evaluación | 4B (familia Qwen3-4B) | no disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | llama.cpp |

La comparación directa con otras alternativas de la misma categoría (modelos de 4B para despliegue en aceleradores) no está disponible en la información proporcionada. La única referencia cuantitativa es la divergencia KL frente al BF16 original y frente a la variante Q4_K_M, que sitúa a esta exportación mucho más cerca del original (KL 0,00115 frente a 0,06141).

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgo en la información proporcionada; al heredar el ajuste SafeRL del modelo base, las garantías de seguridad dependen de dicho ajuste y no de esta exportación.
- Alucinación: no se publican evaluaciones específicas de veracidad; el riesgo es el del modelo base Qwen3-4B-SafeRL.
- Idiomas: solo se declaran inglés y coreano; el rendimiento en castellano no está evaluado y no debería asumirse.
- Contexto: la longitud de contexto no se detalla en la información disponible, por lo que debe consultarse la model card del base antes de diseñar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda del modelo original y conviene verificar las condiciones del base Qwen/Qwen3-4B-SafeRL.
- Compatibilidad: el autor advierte de que tt-transformers y tt-forge no se han comprobado con este checkpoint; las validaciones son de representación, no de extremo a extremo en runtime de producción.
- Madurez: 29 descargas y 0 likes en el momento de la consulta; es un artefacto experimental de nicho, sin evidencia de uso en producción.
- Dependencias: requiere Transformers 5.23.0 con PyTorch para el camino genérico y TT-NN 0.81.1 para el camino Tensix; versiones distintas no están validadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del checkpoint: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP8/blob/main/LICENSE
