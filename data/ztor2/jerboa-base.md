# ztor2/jerboa-base

## Resumen

Jerboa es un modelo de lenguaje causal ultraligero desarrollado por el usuario ztor2 bajo el identificador `ztor2/jerboa-base`. Con aproximadamente 221 millones de parámetros, está disenado especificamente para despliegue en Apple Silicon (MPS/Metal) y dispositivos edge, lo que lo posiciona como una alternativa de bajo coste computacional frente a modelos de mayor tamano pensados para servidores. La familia Jerboa incluye tambien una variante multimodal (`JerboaVLForConditionalGeneration`), aunque la model card la describe como en desarrollo activo.

El modelo emplea una arquitectura transformer de tipo "Deep & Thin": 28 capas con una dimension oculta de 768 y una FFN de 2048 con activacion SwiGLU. Incorpora atencion con GQA (12 cabezas de consulta frente a 4 de clave/valor), QK-Norm y atencion de ventana deslizante intercalada (ventana de 2048 tokens, con atencion global cada 4 capas). El vocabulario BPE es de 49.152 tokens y usa RoPE con theta de 500.000.

Su relevancia actual radica en el nicho de modelos pequenos optimizados para hardware de consumo y edge, con licencia Apache 2.0 permisiva. No obstante, conviene advertir que se trata de un proyecto en desarrollo temprano, con solo >1,23 mil millones de tokens de preentrenamiento y sin resultados de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal "Deep & Thin" (28 capas, d_model=768, d_ffn=2048, SwiGLU) |
| Parametros totales | 221.430.400 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; SWA con ventana de 2048 y atencion global cada 4 capas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pytorch), custom_code |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal decoder-only con un diseno "Deep & Thin": 28 capas relativamente estrechas con dimension oculta de 768 y FFN de 2048 con SwiGLU. La atencion usa GQA con 12 cabezas de consulta y 4 de clave/valor, lo que reduce el coste de memoria del KV cache. Incorpora QK-Norm y atencion de ventana deslizante intercalada: ventana de 2048 tokens con atencion global cada 4 capas. El vocabulario es BPE de 49.152 tokens y la codificacion posicional usa RoPE con theta de 500.000, un valor alto que sugiere intencion de soportar contextos largos.

En cuanto al entrenamiento, la model card indica un volumen de preentrenamiento de mas de 1,23 mil millones de tokens, con una composicion del 75% FineWeb-Edu y 25% codigo Python. No se mencionan en la informacion disponible fases de RLHF, DPO ni tecnicas de alineacion adicional, ni innovaciones como decodificacion especulativa. El modelo requiere `trust_remote_code=True` para cargarse, lo que implica logica de modelado personalizada empaquetada en el repositorio.

## Capacidades

- Generacion de texto causal en ingles y coreano.
- Capacidad de modelado de codigo Python, dada la inclusion de un 25% de codigo en el preentrenamiento.
- Soporte de conversacion multi-turno (tag `conversational`), aunque sin datos de benchmarks de calidad.
- Variante multimodal asociada (`JerboaVLForConditionalGeneration`) segun la model card, en desarrollo activo; no se detallan las modalidades concretas soportadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (thinking mode, audio, vision en el modelo base): no disponibles.

## Casos de uso

- Inferencia en dispositivo edge y Apple Silicon: gracias a sus 221M de parametros y a la optimizacion declarada para MPS/Metal, el modelo puede ejecutarse en portatiles Apple y dispositivos con recursos limitados para tareas de generacion de texto en local.
- Autocompletado de codigo Python en entornos de desarrollo ligeros: el 25% de codigo Python en el preentrenamiento lo hace adecuado para sugerencias basicas de codigo en IDE o plugins sin necesidad de GPU dedicada.
- Prototipado rapido de asistentes conversacionales: al ser un modelo pequeno con licencia Apache 2.0, sirve para validar pipelines de chat multi-turno antes de escalar a modelos mayores.
- Experimentacion academica en arquitecturas eficientes: su combinacion de GQA, QK-Norm y SWA intercalada lo convierte en un banco de pruebas para estudiar tecnicas de atencion eficiente con bajo coste de entrenamiento.
- Filtrado y clasificacion ligera de texto: el modelo puede usarse para tareas auxiliares de generacion condicionada (resumenes cortos, reescritura) en entornos de bajos recursos.
- Investigacion en modelos multilingues en/coreano: al cubrir ambos idiomas, permite estudiar transferencia interlingue en modelos de tamano reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 221M de parametros en precision fp16 el modelo ocupa aproximadamente 0,44 GB en pesos; en cuantizacion a 8 bits, en torno a 0,22 GB. No obstante, no se detallan cuantizaciones oficiales disponibles.
- GPU recomendadas: el modelo esta optimizado explicitamente para Apple Silicon (MPS/Metal) y dispositivos edge. No se documenta soporte verificado para A100, H100 o RTX 4090 en la informacion disponible.
- Cabe en GPU de consumo, incluidas GPU integradas y NPU de dispositivos edge, por su tamano reducido.
- Opciones de despliegue: el quickstart oficial usa `transformers` con `trust_remote_code=True`. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| Jerboa base | 221M | no disponible (SWA 2048) | Apache 2.0 | en, ko | Optimizado para Apple Silicon y edge |
| Modelos de ~200-500M de la familia Qwen / Gemma | ~200M-500M | variable (no disponible para Jerboa) | variable | multilingue | No se dispone de comparativa de rendimiento con Jerboa |
| SmolLM (familia) | ~135M-1.7B | variable | variable | mayoritariamente en | No se dispone de comparativa de rendimiento con Jerboa |

No se dispone de datos de rendimiento comparativos entre Jerboa y modelos de su categoria en la informacion proporcionada; la comparativa se limita a dimension y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente con FineWeb-Edu y codigo Python, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: elevado para un modelo de 221M de parametros con solo >1,23B tokens de preentrenamiento; no debe usarse como fuente de verdad sin verificacion.
- Limitaciones de contexto e idioma: solo se declaran ingles y coreano; no hay garantias de calidad en castellano ni en otros idiomas. La ventana de atencion efectiva esta limitada por SWA de 2048 tokens con atencion global intercalada cada 4 capas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card lo describe como "en desarrollo activo", lo que desaconseja su uso en produccion sin evaluacion propia.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo personalizado del autor; conviene auditar el repositorio antes de desplegarlo en entornos sensibles.
- Sin benchmarks publicados: la ausencia de evaluaciones estandar (MMLU, HumanEval, GSM8K) impide validar su calidad frente a alternativas.
- El repo ocupa 48,4 GB pese a los 221M de parametros, lo que sugiere la presencia de pesos adicionales o variantes no documentadas; conviene revisar los archivos antes de la descarga.

## Enlaces

- Hugging Face: https://huggingface.co/ztor2/jerboa-base
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
