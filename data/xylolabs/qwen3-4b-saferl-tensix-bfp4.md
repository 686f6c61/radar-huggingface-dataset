# Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP4

## Resumen

Qwen3-4B-SafeRL-Tensix-BFP4 es una exportación cuantizada del modelo Qwen/Qwen3-4B-SafeRL, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent Tensix mediante la pila tt-metal/tt-nn. El modelo conserva la arquitectura y el tokenizador originales de Qwen3-4B-SafeRL, pero sustituye las 252 proyecciones declaradas del decodificador por tensores en formato block-floating-point de 4 bits (bfloat4_b), mientras que los embeddings, la cabeza de salida atada y el resto de tensores permanecen en BF16.

El interés de esta ficha no radica en un nuevo modelo de lenguaje, sino en el formato de compresión orientado a hardware: el checkpoint ocupa aproximadamente 3,60 GB para los pesos del modelo de lenguaje (6,53 bits por peso almacenado, o 2,82 GB / 5,613 bits por peso único si se comparte la cabeza atada), frente a los ~8,8 GB del repositorio completo. Está pensado para desarrolladores que despliegan modelos en placas Tenstorrent (Blackhole y arquitecturas Tensix) y necesitan una representación compatible con el empaquetado nativo TT-NN, incluyendo BFP8.

La información disponible es limitada: no hay resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) ni métricas de velocidad. La evaluación publicada se limita a comprobaciones de fidelidad de pesos (KL sobre textos inglés/coreano) y a la verificación de que las 252 matrices pasan los chequeos de grid y empaquetado TT-NN, incluido el simulador Blackhole con TT-NN 0.81.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), cuantización block-floating-point BFP4 sobre proyecciones |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen3-4B-SafeRL) |
| Tipos de cuantizacion | bfloat4_b (BFP4, 4,5 bits/peso) en 252 proyecciones del decodificador; BF16 en 147 tensores (embeddings, cabeza atada y otros) |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (índice `model.safetensors.index.json`), más `quant4.json` con el formato por proyección |

## Arquitectura y entrenamiento

El modelo base es Qwen3-4B-SafeRL, un transformer decoder-only de la familia Qwen3 con 4.411 millones de parámetros. Esta exportación no reentrena ni ajusta el modelo: aplica GPTQ con búsqueda de exponente por bloque sobre las 252 proyecciones declaradas del decodificador, almacenando los valores en BF16 sobre su grid block-floating. La calibración de GPTQ usa damping 0,1 y 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El tokenizador y la plantilla de chat originales se conservan, incluido el control de modo thinking (`enable_thinking`).

La innovación técnica es el formato: cada proyección cuantizada promedia 4,5 bits por peso, y todas las matrices pasan los chequeos de grid y de empaquetado nativo TT-NN, incluido el empaquetado como BFP8. El autor indica que la verificación se realizó sobre el simulador Blackhole con TT-NN 0.81.1, y que tt-transformers y tt-forge no se comprobaron con este checkpoint. No se especifican datos de entrenamiento adicionales, RLHF/DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto conversacional en inglés y coreano, con la plantilla de chat original de Qwen3.
- Modo thinking activable o desactivable mediante la plantilla (`enable_thinking`), tal como se muestra en el ejemplo del autor.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3-4B-SafeRL.
- Capacidades de código y matemáticas: no verificadas de forma independiente en la información disponible.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües limitadas a inglés y coreano según los metadatos del modelo.
- Visión y audio: no disponibles.

## Casos de uso

- Despliegue en placas Tenstorrent: el checkpoint está empaquetado para TT-NN con formato BFP4 y verificado contra el simulador Blackhole, por lo que es adecuado para ejecutar Qwen3-4B en hardware Tensix con menor huella de memoria (3,60 GB de pesos frente a ~8,8 GB del repositorio completo).
- Prototipado de cuantización BFP4: sirve como referencia para validar pipelines GPTQ con búsqueda de exponente por bloque y comprobar la fidelidad de pesos mediante `verify_grid.py` y `pack_tensix.py`.
- Asistentes conversacionales en inglés y coreano: el tokenizador y la plantilla de chat originales se conservan, lo que permite reutilizar flujos existentes de Qwen3 con modo thinking desactivable.
- Evaluación de fidelidad de cuantización: la métrica KL publicada (0,0672 frente a 0 en BF16 y 0,0614 en Q4_K_M) permite comparar la degradación de esta exportación con alternativas de cuantización de 4 bits.
- Integración en pipelines de Transformers: el ejemplo de quickstart con Transformers 5.23.0 y PyTorch (`dtype="bfloat16"`, `device_map="auto"`) facilita pruebas en GPU antes de portar a Tensix.
- Investigación en compresión de modelos: el desglose de bits por peso (4,5 en proyecciones, 6,53 por peso almacenado, 5,613 por peso único) es útil para estudiar el equilibrio entre tamaño, fidelidad y compatibilidad de hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación publicada es de fidelidad de pesos:

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Pérdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 7 | — |
| Esta exportación | 0,067215654 | 28 | 7 | 1 |
| Q4_K_M equivalente | 0,061407450 | 29 | 7 | 0 |

La KL se calcula sobre 16.240 posiciones puntuadas con los mismos textos en inglés y coreano (raw y chat, cuatro fragmentos de cada uno). El suelo BF16 de llama.cpp para el texto seleccionado es 0,000316937. El autor no reporta velocidad ni throughput.

## Requisitos de hardware

- Memoria de dispositivo: aproximadamente 3,60 GB solo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.
- Hardware objetivo: aceleradores Tenstorrent Tensix (verificado en simulador Blackhole con TT-NN 0.81.1); no se confirma funcionamiento en tt-transformers ni tt-forge.
- GPU consumer: no se documenta; el ejemplo de quickstart usa Transformers con `device_map="auto"` en BF16, pero no se especifican requisitos de VRAM.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch; empaquetado TT-NN mediante `ttnn.as_tensor` con `ttnn.bfloat4_b` o `ttnn.bfloat8_b`; scripts `pack_tensix.py` y `verify_grid.py`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP4 | 4.411 M | no disponible | BFP4 (4,5 bits/peso) + BF16 | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-SafeRL (base) | 4.411 M | no disponible | BF16 | apache-2.0 | Hugging Face |
| Q4_K_M equivalente (referencia de evaluación) | 4.411 M | no disponible | 4 bits (Q4_K_M) | no disponible | no disponible |

La comparativa se limita a la fidelidad KL publicada: esta exportación obtiene 0,0672 frente a 0,0614 de Q4_K_M, con una pérdida adicional contada en el conjunto normal. No hay datos de rendimiento downstream para comparar capacidades.

## Limitaciones y advertencias

- No se han publicado benchmarks de capacidades (razonamiento, código, matemáticas); la única métrica es la KL de fidelidad de pesos.
- La evaluación de fidelidad se realizó sobre pesos guardados en host; el autor no reporta velocidad ni rendimiento en dispositivo real, solo en simulador Blackhole.
- tt-transformers y tt-forge no se verificaron con este checkpoint, lo que limita su uso directo en esos stacks.
- Idiomas limitados a inglés y coreano según los metadatos; el resto de idiomas no está validado.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen3-4B-SafeRL; no se documentan mitigaciones adicionales.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de calibración (WikiText-2 y Wikipedia coreana).
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación comunitaria.
- La cuantización BFP4 con 4,5 bits/peso puede degradar tareas sensibles a precisión; el autor reporta una pérdida adicional en el conjunto de evaluación normal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tensix-BFP4/blob/main/LICENSE
