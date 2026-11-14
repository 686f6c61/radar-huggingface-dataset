# Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16-Folded

## Resumen

Granite 3.0 8B Instruct para Tenstorrent Tensix es una exportación del modelo IBM Granite 3.0 8B Instruct (8.170.848.256 parámetros) realizada por Xylolabs, en la que el multiplicador residual del transformer original (0.22) se ha plegado dentro de las matrices de pesos de las proyecciones de salida de atención y de bajada del MLP. El resultado es un checkpoint funcionalmente equivalente al original, pero con una topología de pesos que facilita su despliegue en hardware Tensix de Tenstorrent mediante TT-NN y tt-metal, manteniendo todos los tensores en BF16.

El modelo conserva la tokenizador, plantilla de chat, vocabulario y configuración de EOS del modelo base, y solo modifica el parámetro `residual_multiplier` de 0.22 a 1.0 en el config para que la escala plegada se aplique una única vez. Está pensado para desarrolladores que quieran ejecutar Granite 3.0 8B Instruct en aceleradores Tenstorrent (Blackhole, Wormhole) sin tener que reescribir la lógica de atención ni de MLP, y como referencia de portabilidad de checkpoints entre ecosistemas (Transformers/PyTorch y TT-NN).

La relevancia actual radica en que Tenstorrent está consolidando su stack open source (tt-metal, TT-NN) y este tipo de exportaciones permiten validar la fidelidad numérica del modelo original frente a una implementación en hardware alternativo, con métricas de divergencia KL publicadas y verificaciones de integridad de cada tensor almacenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (IBM Granite 3.0), con multiplicador residual plegado en pesos de atención y MLP |
| Parametros totales | 8.170.848.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Granite 3.0 8B Instruct) |
| Tipos de cuantizacion | BF16 (único formato publicado en este repo); el autor referencia Q4_K_M y BFP4 en la evaluación comparativa, pero no se distribuyen en este repositorio |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16), 362 tensores almacenados, 16.34 GB de pesos |

## Arquitectura y entrenamiento

El checkpoint es una transformación determinista del modelo IBM Granite 3.0 8B Instruct. No se ha reentrenado ni ajustado: se han modificado 80 matrices (proyecciones de salida de atención y de bajada del MLP), multiplicando sus valores BF16 originales por 0.22 en float32 y redondeando de nuevo a BF16. Los 282 tensores restantes son byte-idénticos al original. El config distribuido cambia únicamente `residual_multiplier` de 0.22 a 1.0, de modo que la escala ya plegada no se vuelve a aplicar en tiempo de ejecución. La cabeza de salida está atada a la embedding de entrada.

El objetivo de esta transformación es eliminar una multiplicación escalar en el grafo de inferencia y simplificar el mapeo de operadores en TT-NN, manteniendo la equivalencia funcional con el modelo original. El autor verifica que los cuatro shards originales de IBM coinciden con sus hashes de contenido primario y que cada tensor de salida cumple exactamente la transformación declarada. Se incluye un script `pack_bf16.py` que comprueba el empaquetado de los 362 tensores BF16 en TT-NN y, opcionalmente, realiza un round-trip por DRAM en el simulador Blackhole con TT-NN 0.81.1. No se especifican datos de entrenamiento propios (tokens, composición del dataset, RLHF/DPO) porque no los hay: se heredan íntegramente del modelo base IBM.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con la plantilla de chat original de Granite 3.0 Instruct.
- Razonamiento multi-turno y respuesta a instrucciones, heredado del ajuste instruct de IBM.
- Capacidad de "thinking" referenciada en la evaluación del autor (7 ítems de tipo thinking en el benchmark), aunque el autor indica que esos 7 ítems no tienen respuesta correcta elegible en BF16.
- Generación de código y matemáticas: capacidades propias del modelo base Granite 3.0 8B Instruct (no se detallan métricas específicas en la información disponible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este checkpoint; depende de las capacidades del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- No se declaran capacidades de visión ni audio.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y validado con round-trip DRAM en simulador Blackhole, por lo que sirve para ejecutar Granite 3.0 8B Instruct en hardware Tensix sin reescribir las proyecciones de atención ni de MLP.
- Validación de portabilidad numérica entre stacks: investigadores que comparen la fidelidad de una implementación TT-NN frente a la referencia PyTorch/Transformers pueden usar este checkpoint como base y comparar contra el modelo original sin plegar, con la métrica KL publicada (0.000832725213 de media frente al BF16 original sin plegar).
- Referencia para pipelines de cuantización: el autor publica comparativas frente a Q4_K_M (KL 0.059211) y BFP4, de modo que este BF16 plegado sirve como denominador de referencia al evaluar variantes cuantizadas del mismo modelo.
- Asistente conversacional en inglés o coreano: con la plantilla de chat original y el tokenizer intacto, puede integrarse en aplicaciones de atención al cliente o asistentes internos en esos dos idiomas, siempre que el contexto requerido encaje en la ventana del modelo base.
- Investigación en optimización de grafos: el plegado de residuales es un ejemplo reproducible de transformación de pesos que elimina operaciones escalares del grafo; útil para estudiar técnicas similares en otros modelos.
- Base para ajuste fino posterior: al ser un checkpoint BF16 con licencia Apache 2.0 y pesos safetensors estándar, puede cargarse con Transformers 5.23.0 y PyTorch para fine-tuning o evaluación con herramientas del ecosistema Hugging Face.
- Pruebas de integridad y empaquetado en TT-NN: el script `pack_bf16.py` permite verificar que todos los tensores indexados se empaquetan correctamente en el host y, con `--device`, que sobreviven a un round-trip por DRAM del dispositivo.

## Benchmarks y rendimiento

| Perfil | KL media frente a BF16 original sin plegar | Aciertos normales (sobre 33) | Aciertos thinking (sobre 7) | Pérdidas contabilizadas |
|---|---:|---:|---:|---:|
| BF16 original sin plegar | 0 | 25 | 0 | — |
| Esta exportación BF16 plegada | 0.000832725213 | 24 | 0 | 0 |
| Q4_K_M del mismo modelo original sin plegar | 0.059211 | 23 | 0 | 0 |

El autor indica que la regla de aceptación "rule-7" se cumple: 0.014064 veces la KL de Q4_K_M, dentro del límite de 1.5 veces, y como máximo una pérdida contabilizada adicional. La KL se calcula sobre 16.248 posiciones puntuadas de una referencia de 16 secuencias en inglés y coreano (raw/chat), con IDs de tokens y máscaras idénticas. El suelo de BF16 de llama.cpp frente a esa referencia es 0.000295. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16.34 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers; el autor no detalla el total con contexto activo.
- GPU recomendadas: no especificadas por el autor; por tamaño, requiere GPUs con al menos 24 GB de memoria para BF16 con contexto moderado (por ejemplo, RTX 3090/4090, A100 40 GB, H100).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB o más (RTX 3090, RTX 4090) siempre que se ajuste la longitud de contexto y el tamaño de lote para dejar espacio a la caché KV.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch (quickstart oficial), y TT-NN / tt-metal para hardware Tenstorrent. El autor indica explícitamente que tt-transformers y tt-forge no fueron comprobados con este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16-Folded | 8.170.848.256 | no disponible | Apache 2.0 | safetensors BF16 | Residuales plegados, validado en TT-NN |
| ibm-granite/granite-3.0-8b-instruct | 8.170.848.256 (heredado) | no disponible | Apache 2.0 | safetensors | Modelo base original sin plegar |
| Q4_K_M del mismo modelo original | 8.170.848.256 (heredado) | no disponible | Apache 2.0 | GGUF (cuantizado) | KL 0.059211 frente al BF16 sin plegar |

No se dispone de datos de benchmarks estándar ni de comparativas con otras familias (Llama, Mistral, Qwen) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint solo incluye pesos en BF16; no se distribuyen variantes cuantizadas en este repositorio, aunque el autor las menciona en la evaluación.
- El idioma soportado se limita a inglés y coreano según la model card; no se declara soporte para castellano ni otros idiomas.
- La evaluación publicada se basa en 33 ítems normales y 7 de tipo thinking, una muestra reducida que no sustituye a benchmarks estándar.
- Los 7 ítems de tipo thinking no tienen respuesta correcta elegible en BF16, por lo que la comparación en esa categoría no aporta señal.
- El autor advierte que tt-transformers y tt-forge no fueron comprobados con este checkpoint; solo se validó el empaquetado TT-NN y el round-trip DRAM en simulador Blackhole.
- El plegado de residuales cambia la topología de pesos respecto al original: cualquier herramienta que espere el checkpoint IBM sin transformar (por ejemplo, scripts que asuman `residual_multiplier: 0.22`) producirá resultados incorrectos si no se usa el config distribuido.
- Riesgo de alucinación y sesgos: no evaluados en la información proporcionada; se heredan los del modelo base IBM Granite 3.0 8B Instruct.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base IBM y de las dependencias de TT-NN/tt-metal para despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16-Folded
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tenstorrent-Tensix-BF16-Folded/blob/main/LICENSE
