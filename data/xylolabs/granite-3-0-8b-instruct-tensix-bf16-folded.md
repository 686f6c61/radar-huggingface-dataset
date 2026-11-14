# Xylolabs/granite-3.0-8b-instruct-Tensix-BF16-Folded

## Resumen

Este repositorio contiene una exportación transformada de IBM Granite 3.0 8B Instruct, un modelo de lenguaje de 8.170.848.256 parámetros desarrollado originalmente por IBM. La transformación, realizada por Xylolabs, consiste en plegar el multiplicador residual (0,22) dentro de las matrices de salida de atención y de las proyecciones down del MLP, de modo que el factor de escala quede aplicado una sola vez en los pesos en lugar de en tiempo de ejecución. Los pesos resultantes se mantienen en BF16 sin pérdida de precisión respecto al original más allá del redondeo propio de la operación.

El objetivo de esta exportación es el despliegue sobre hardware Tenstorrent Tensix mediante la pila TT-NN y TT-Metal. Se trata de una variante de infraestructura, no de un nuevo modelo entrenado: no hay fine-tuning ni cambio de datos de entrenamiento, solo una reorganización numérica de los pesos que simplifica el grafo de inferencia en aceleradores Tensix. El tokenizador, la plantilla de chat, el vocabulario y la configuración de EOS del modelo original se conservan intactos.

Es relevante para equipos que trabajan con aceleradores Tenstorrent y necesitan un checkpoint BF16 con las escalas ya absorbidas en los pesos, evitando operaciones de multiplicación adicionales en el grafo. El modelo base es un transformer denso de 8B con contexto de 128K, licencia Apache 2.0 y soporte para inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en IBM Granite 3.0 |
| Parametros totales | 8.170.848.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Granite 3.0 8B Instruct) |
| Tipos de cuantizacion | BF16 (único formato en este repo); el modelo base admite otras cuantizaciones (Q4_K_M, BFP4) segun la model card |
| Idiomas soportados | Ingles, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16, 362 tensores almacenados, 16,34 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de IBM Granite 3.0 8B Instruct: un transformer decoder-only denso con atención estándar y capas MLP con proyecciones gate/up/down. El modelo original fue entrenado por IBM con un pipeline que incluye preentrenamiento sobre datos multilingües (con énfasis en inglés y coreano) y posteriores etapas de alineación mediante instrucciones y preferencias humanas. La model card de esta exportación no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, por lo que esos datos deben consultarse en la ficha del modelo base.

La innovación técnica de este repositorio no está en el entrenamiento sino en la transformación de pesos. Concretamente, 80 matrices correspondientes a las proyecciones de salida de atención y a las proyecciones down del MLP se han multiplicado por 0,22 en float32 y redondeado a BF16; las 282 entradas restantes son byte-idénticas al original. El `config.json` ajusta únicamente `residual_multiplier` de 0,22 a 1,0 para que la escala plegada se aplique una sola vez. Los cuatro shards originales de IBM fueron verificados por sus hashes de contenido primario, y cada tensor de salida coincide exactamente con la transformación declarada. Los 362 tensores pasan el empaquetado host de TT-NN con valores inalterados, y la matriz mostrada pasa una ida y vuelta por DRAM en el simulador Blackhole con TT-NN 0.81.1.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat preservada del modelo original.
- Razonamiento y respuesta a instrucciones en inglés y coreano.
- Generación de código y tareas de programación (capacidad heredada de Granite 3.0 Instruct).
- Razonamiento matemático y resolución de problemas de varios pasos.
- Soporte de tool calling y function calling (heredado del modelo base Granite 3.0 Instruct).
- Capacidades de agente y razonamiento multi-step (heredadas del modelo base).
- Modo "thinking" evaluado en el benchmark interno del autor (7 ítems de prueba en la tabla de evaluación).
- No incluye visión, audio ni otras modalidades: es un modelo exclusivamente de texto.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el checkpoint está empaquetado para TT-NN y TT-Metal con las escalas residuales ya plegadas, lo que elimina multiplicaciones adicionales en el grafo de inferencia sobre hardware Tensix.
- Inferencia BF16 de referencia en GPU: al mantener todos los pesos en BF16 sin cuantización, sirve como referencia de calidad frente a variantes cuantizadas (Q4_K_M, BFP4) en pipelines de evaluación.
- Atención al cliente automatizada: con 128K tokens de contexto, el modelo puede gestionar conversaciones multi-turno largas y documentos de soporte extensos en inglés y coreano.
- Generación de código en producción: el soporte de tool calling permite integrarlo en pipelines de CI/CD para generación de tests, revisión de parches o autocompletado asistido.
- Asistentes conversacionales bilingües inglés-coreano: la cobertura de ambos idiomas permite desplegar un único modelo para mercados con esas dos lenguas.
- Investigación en cuantización y formatos: la tabla de evaluación del autor (KL respecto al BF16 original) facilita comparar el impacto de distintas representaciones numéricas sobre el mismo modelo.
- Validación de representación en hardware: los scripts `pack_bf16.py` permiten verificar el empaquetado de cada tensor en TT-NN antes de desplegar un runner completo.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de fidelidad numérica respecto al modelo original sin plegar, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Perfil | KL medio vs. BF16 original sin plegar | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas contadas |
|---|---:|---:|---:|---:|
| BF16 original sin plegar | 0 | 25 | 0 | — |
| Esta exportación BF16 plegada | 0,000832725213 | 24 | 0 | 0 |
| Q4_K_M del mismo original sin plegar | 0,059211 | 23 | 0 | 0 |

El KL se calcula sobre 16.248 posiciones puntuadas de una referencia de 16 secuencias en inglés y coreano (raw y chat), con IDs de tokens y máscaras idénticos. El suelo de llama.cpp BF16 frente a esa referencia es 0,000295. La exportación plegada cumple la regla de aceptación del autor: su KL es 0,014064 veces el de Q4_K_M, dentro del límite de 1,5 veces, y no añade pérdidas contadas. Los siete ítems de thinking no tienen respuesta correcta elegible en BF16.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta exportación.

## Requisitos de hardware

- VRAM estimada: aproximadamente 16,34 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers. En la práctica, se recomienda un mínimo de 24 GB para contexto corto y bastante más para contextos largos.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue con contexto largo; RTX 4090 (24 GB) puede alojar los pesos pero con margen limitado para caché KV.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto moderado; en GPUs de 16 GB no cabe en BF16.
- Aceleradores objetivo: Tenstorrent Tensix (Blackhole), con TT-NN 0.81.1 verificado en simulador para el empaquetado y la ida y vuelta por DRAM.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch (`device_map="auto"`, `dtype="bfloat16"`); TT-NN/TT-Metal para Tensix. No se ha verificado con tt-transformers ni tt-forge.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Esta exportación (Granite 3.0 8B Tensix BF16 plegado) | 8,17B | 128K | safetensors BF16 | Apache 2.0 | Pesos con residual plegado, orientado a Tensix |
| IBM Granite 3.0 8B Instruct (original) | 8,17B | 128K | safetensors BF16 | Apache 2.0 | Referencia sin plegar; admite cuantizaciones Q4_K_M, BFP4 |
| Q4_K_M del mismo original | 8,17B (cuantizado) | 128K | GGUF | Apache 2.0 | KL 0,059211 frente al BF16 original; menor huella de memoria |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de tareas (razonamiento, código) con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Esta exportación no es un modelo nuevo: hereda todos los sesgos y limitaciones del IBM Granite 3.0 8B Instruct original.
- Riesgo de alucinación inherente a los modelos de lenguaje de 8B; no debe usarse como fuente de verdad sin verificación.
- Cobertura lingüística limitada a inglés y coreano; el rendimiento en castellano no está garantizado ni evaluado.
- El `config.json` modificado (`residual_multiplier: 1.0`) es obligatorio: usar la configuración original de IBM con estos pesos aplicaría la escala dos veces y produciría salidas incorrectas.
- Requiere Transformers 5.23.0; versiones anteriores pueden no manejar correctamente el checkpoint.
- El empaquetado en TT-NN se ha verificado como comprobación de representación; un runner completo debe elegir sus propios layouts de matriz, embedding y vector. tt-transformers y tt-forge no se han probado con este checkpoint.
- La evaluación publicada es de fidelidad numérica (KL) y de un conjunto reducido de 33 + 7 ítems, no de capacidades generales; no debe interpretarse como una validación de rendimiento en tareas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones del modelo base de IBM y atribuir correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BF16-Folded
- Modelo base: https://huggingface.co/ibm-granite/granite-3.0-8b-instruct
- Código del proyecto: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/granite-3.0-8b-instruct-Tensix-BF16-Folded/blob/main/LICENSE
